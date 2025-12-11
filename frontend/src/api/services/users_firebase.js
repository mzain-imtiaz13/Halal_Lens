import {
  collection,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where
} from 'firebase/firestore'
import { db } from '../../firebase'

/* -------------------- Helpers -------------------- */
function tsToDate(ts) {
  if (!ts || !ts.toDate) return ''
  const d = ts.toDate()
  return d.toISOString().slice(0, 10)
}
function tsToDateTime(ts) {
  if (!ts || !ts.toDate) return ''
  const d = ts.toDate()
  return d.toISOString().replace('T', ' ').slice(0, 19)
}

function mapUserDoc(id, data, totalScans) {
  return {
    id,
    authProvider: data.authProvider ?? '-', // 🔹 everything from Firestore here
    // 🔹 “view model” fields used by the UI
    name: data.displayName ?? '-',
    email: data.email ?? '-',
    role: data.role ?? 'user',
    status: data.status ?? 'inactive',
    country: data.country ?? '-',
    mobile: data.mobileNumber ?? '-',
    subscription_plan: data.subscriptionPlan ?? 'free',
    active_months: data.activeMonths ?? 0,
    total_scans: totalScans, // calculated total scans
    created_at: tsToDateTime(data.createdAt),
  }
}

function buildFilters({ plan, status }) {
  const filters = []
  if (plan) filters.push(where('subscriptionPlan', '==', plan.toLowerCase()))
  if (status) filters.push(where('status', '==', status.toLowerCase()))
  return filters
}

/* -------------------- List Users -------------------- */
export async function listUsersFirebase({
  search = '',
  plan = '',
  status = '',
  pageSize = 10,
  cursorDoc = null
}) {
  const usersRef = collection(db, 'users')
  const filters = buildFilters({ plan, status })

  const base = [...filters, orderBy('createdAt', 'desc')]

  // Apply the search filter before pagination
  let q = search ? query(usersRef, ...base, limit(100)) : query(usersRef, ...base, limit(pageSize));

  const snap = await getDocs(q);
  let items = [];
  
  // Iterate through each user and fetch their total scan count
  for (let doc of snap.docs) {
    const userData = doc.data();
    const userId = doc.id;
    
    // Fetch the total scans count from the user's scan history collection
    const scanHistoryRef = collection(db, 'users', userId, 'scan_history');
    const scanCountSnap = await getCountFromServer(scanHistoryRef);
    const totalScans = scanCountSnap.data().count;

    // Map user document to include total scans
    items.push(mapUserDoc(doc.id, userData, totalScans));
  }

  // Apply search filtering after fetching users
  if (search) {
    const s = search.toLowerCase()
    items = items.filter(
      (r) =>
        String(r.name || '').toLowerCase().includes(s) ||
        String(r.email || '').toLowerCase().includes(s)
    )
  }

  const nextCursor = snap.docs.length ? snap.docs[snap.docs.length - 1] : null
  return { items, nextCursor }
}

/* -------------------- Count Users -------------------- */
export async function countUsersFirebase({ plan = '', status = '' }) {
  const usersRef = collection(db, 'users')
  const filters = buildFilters({ plan, status })
  const q = filters.length ? query(usersRef, ...filters) : usersRef
  const countSnap = await getCountFromServer(q)
  return countSnap.data().count
}

/* ---------------- scan_history for a user ---------------- */
function parseAnyDate(val) {
  try {
    if (val?.toDate) return val.toDate()
    const d = new Date(val)
    if (!isNaN(d)) return d
  } catch (_) {}
  return null
}

function mapScanDoc(id, d) {
  const date = parseAnyDate(d.scannedAt)
  return {
    id,
    barcode: d.barcode ?? '-',
    productName: d.productName ?? '-',
    productBrands: d.productBrands ?? '',
    overallStatus: d.overallStatus ?? '-',
    scanType: d.scanType ?? '-',
    frontImageUrl: d.frontImageUrl ?? '',
    scannedAt: date ? date.toISOString().replace('T',' ').slice(0,19) : String(d.scannedAt || '')
  }
}

export async function listUserScanHistory({ userId, pageSize = 20, cursorDoc = null }) {
  const col = collection(db, 'users', userId, 'scan_history')

  const q = cursorDoc
    ? query(col, orderBy('scannedAt', 'desc'), startAfter(cursorDoc), limit(pageSize))
    : query(col, orderBy('scannedAt', 'desc'), limit(pageSize))

  const snap = await getDocs(q)
  const items = snap.docs.map(d => mapScanDoc(d.id, d.data()))
  const nextCursor = snap.docs.length ? snap.docs[snap.docs.length - 1] : null
  return { items, nextCursor }
}
