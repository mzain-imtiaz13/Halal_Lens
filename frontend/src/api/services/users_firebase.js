// src/api/services/users_firebase.js
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

function mapUserDoc(id, data) {
  return {
    id,
    name: data.displayName ?? '-',
    email: data.email ?? '-',
    subscription_plan: data.subscriptionPlan
      ? (String(data.subscriptionPlan).toLowerCase() === 'free' ? 'Free' : 'Premium')
      : 'Free',
    price: data.price ?? 0,
    subscription_start: tsToDate(data.subscriptionStartDate),
    subscription_end: tsToDate(data.subscriptionEndDate),
    status: data.subscriptionStatus
      ? (String(data.subscriptionStatus).toLowerCase() === 'active' ? 'Active' : 'Inactive')
      : 'Inactive',
    active_months: data.activeMonths ?? 0,
    total_scans: data.totalScans ?? 0,
    created_at: tsToDateTime(data.createdAt)
  }
}

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

function buildFilters({ plan, status }) {
  const filters = []
  if (plan) {
    filters.push(where('subscriptionPlan', '==', plan.toLowerCase()))
  }
  if (status) {
    filters.push(where('subscriptionStatus', '==', status.toLowerCase()))
  }
  return filters
}

export async function listUsersFirebase({ search = '', plan = '', status = '', pageSize = 10, cursorDoc = null }) {
  const usersRef = collection(db, 'users')
  const filters = buildFilters({ plan, status })

  const base = [ ...filters, orderBy('createdAt', 'desc'), limit(pageSize) ]
  const q = cursorDoc
    ? query(usersRef, ...filters, orderBy('createdAt', 'desc'), startAfter(cursorDoc), limit(pageSize))
    : query(usersRef, ...base)

  const snap = await getDocs(q)
  let items = snap.docs.map(d => mapUserDoc(d.id, d.data()))

  if (search) {
    const s = search.toLowerCase()
    items = items.filter(
      r =>
        String(r.name || '').toLowerCase().includes(s) ||
        String(r.email || '').toLowerCase().includes(s)
    )
  }
  const nextCursor = snap.docs.length ? snap.docs[snap.docs.length - 1] : null
  return { items, nextCursor }
}

export async function countUsersFirebase({ plan = '', status = '' }) {
  const usersRef = collection(db, 'users')
  const filters = buildFilters({ plan, status })
  const q = filters.length ? query(usersRef, ...filters) : usersRef
  const countSnap = await getCountFromServer(q)
  return countSnap.data().count
}

/* ---------------- scan_history for a user ---------------- */

function parseAnyDate(val) {
  // Handles Firestore Timestamp or ISO string
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

  // Most datasets store scannedAt (Timestamp) — if it's a string you can’t orderBy.
  // If your scannedAt is ISO string (as in your screenshot), ordering may not require index creation.
  const q = cursorDoc
    ? query(col, orderBy('scannedAt', 'desc'), startAfter(cursorDoc), limit(pageSize))
    : query(col, orderBy('scannedAt', 'desc'), limit(pageSize))

  const snap = await getDocs(q)
  const items = snap.docs.map(d => mapScanDoc(d.id, d.data()))
  const nextCursor = snap.docs.length ? snap.docs[snap.docs.length - 1] : null
  return { items, nextCursor }
}
