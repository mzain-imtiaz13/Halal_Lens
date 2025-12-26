import {
  collection,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";

/* -------------------- Helpers -------------------- */
function tsToDateTime(ts) {
  if (!ts || !ts.toDate) return "";
  const d = ts.toDate();
  return d.toISOString().replace("T", " ").slice(0, 19);
}

function mapUserDoc(id, data, totalScans) {
  return {
    id,
    authProvider: data.authProvider ?? "-",
    name: data.displayName ?? "-",
    email: data.email ?? "-",
    role: data.role ?? "user",
    status: data.status ?? "inactive",
    country: data.country ?? "-",
    mobile: data.mobileNumber ?? "-",
    subscription_plan: data.subscriptionPlan ?? "free",
    active_months: data.activeMonths ?? 0,
    total_scans: totalScans,
    created_at: tsToDateTime(data.createdAt),
  };
}

function buildFilters({ plan, status }) {
  const filters = [];
  if (plan) filters.push(where("subscriptionPlan", "==", plan.toLowerCase()));
  if (status) filters.push(where("status", "==", status.toLowerCase()));
  return filters;
}

function normalizeRaw(search) {
  return String(search || "").trim();
}
function normalizeLower(search) {
  return normalizeRaw(search).toLowerCase();
}
function prefixEnd(s) {
  return `${s}\uf8ff`;
}
function looksLikeEmail(s) {
  return s.includes("@");
}

function capitalizeFirst(s) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function titleCaseWords(s) {
  return String(s || "")
    .split(" ")
    .filter(Boolean)
    .map((w) => capitalizeFirst(w.toLowerCase()))
    .join(" ");
}

/**
 * Returns search values to try for a given field.
 * - For *Lower fields: only lower
 * - For email: lower (emails are generally lowercase)
 * - For displayName: try raw + common case variants
 */
function valuesForField(field, raw, lower) {
  if (field.endsWith("Lower")) return [lower];

  if (field === "email") return [lower, raw]; // safe
  if (field === "displayName") {
    const a = raw;
    const b = capitalizeFirst(raw);
    const c = titleCaseWords(raw);
    const uniq = Array.from(new Set([a, b, c].filter(Boolean)));
    return uniq;
  }

  return [raw, lower].filter(Boolean);
}

async function searchSnap({
  usersRef,
  filters,
  pageSize,
  cursorDoc,
  field,
  value,
}) {
  const constraints = [
    ...filters,
    where(field, ">=", value),
    where(field, "<=", prefixEnd(value)),
    orderBy(field, "asc"),
  ];

  const qRef = cursorDoc
    ? query(usersRef, ...constraints, startAfter(cursorDoc), limit(pageSize))
    : query(usersRef, ...constraints, limit(pageSize));

  const snap = await getDocs(qRef);
  return snap;
}

async function searchCount({ usersRef, filters, field, value }) {
  const qRef = query(
    usersRef,
    ...filters,
    where(field, ">=", value),
    where(field, "<=", prefixEnd(value)),
    orderBy(field, "asc")
  );
  const countSnap = await getCountFromServer(qRef);
  return countSnap.data().count;
}

/* -------------------- List Users -------------------- */
export async function listUsersFirebase({
  search = "",
  plan = "",
  status = "",
  pageSize = 10,
  cursorDoc = null,
}) {
  const usersRef = collection(db, "users");
  const filters = buildFilters({ plan, status });

  const raw = normalizeRaw(search);
  const lower = normalizeLower(search);

  let snap = null;

  if (raw) {
    const isEmail = looksLikeEmail(raw);

    // Try lowercased fields first (if you have them), then fallback to normal fields
    const fieldCandidates = isEmail
      ? ["emailLower", "email"]
      : ["displayNameLower", "displayName"];

    // Try each field, and for each field try multiple values (raw/titlecase/etc)
    outer: for (const field of fieldCandidates) {
      const values = valuesForField(field, raw, lower);

      for (const val of values) {
        if (!val) continue;
        const trySnap = await searchSnap({
          usersRef,
          filters,
          pageSize,
          cursorDoc,
          field,
          value: field.endsWith("Lower") ? lower : val,
        });

        if (trySnap.docs.length > 0) {
          snap = trySnap;
          break outer;
        }

        // keep last snap so empty result still returns properly
        snap = trySnap;
      }
    }
  } else {
    // Normal listing (createdAt desc)
    const base = [...filters, orderBy("createdAt", "desc")];

    const qRef = cursorDoc
      ? query(usersRef, ...base, startAfter(cursorDoc), limit(pageSize))
      : query(usersRef, ...base, limit(pageSize));

    snap = await getDocs(qRef);
  }

  if (!snap) return { items: [], nextCursor: null };

  const items = [];

  // Removed N extra reads (scan_history counts) to reduce API calls.
  for (const doc of snap.docs) {
    const userData = doc.data();
    const userId = doc.id;

    items.push(mapUserDoc(userId, userData, "-"));
  }

  const nextCursor = snap.docs.length ? snap.docs[snap.docs.length - 1] : null;
  return { items, nextCursor };
}

/* -------------------- Count Users -------------------- */
export async function countUsersFirebase({ search = "", plan = "", status = "" }) {
  const usersRef = collection(db, "users");
  const filters = buildFilters({ plan, status });

  const raw = normalizeRaw(search);
  const lower = normalizeLower(search);

  if (!raw) {
    const qRef = filters.length ? query(usersRef, ...filters) : usersRef;
    const countSnap = await getCountFromServer(qRef);
    return countSnap.data().count;
  }

  const isEmail = looksLikeEmail(raw);

  const fieldCandidates = isEmail
    ? ["emailLower", "email"]
    : ["displayNameLower", "displayName"];

  for (const field of fieldCandidates) {
    const values = valuesForField(field, raw, lower);

    for (const val of values) {
      const v = field.endsWith("Lower") ? lower : val;
      if (!v) continue;

      const c = await searchCount({ usersRef, filters, field, value: v });
      if (c > 0) return c;
    }
  }

  return 0;
}

/* ---------------- scan_history for a user ---------------- */
function parseAnyDate(val) {
  try {
    if (val?.toDate) return val.toDate();
    const d = new Date(val);
    if (!isNaN(d)) return d;
  } catch (_) {}
  return null;
}

function mapScanDoc(id, d) {
  const date = parseAnyDate(d.scannedAt);
  return {
    id,
    barcode: d.barcode ?? "-",
    productName: d.productName ?? "-",
    productBrands: d.productBrands ?? "",
    overallStatus: d.overallStatus ?? "-",
    scanType: d.scanType ?? "-",
    frontImageUrl: d.frontImageUrl ?? "",
    scannedAt: date
      ? date.toISOString().replace("T", " ").slice(0, 19)
      : String(d.scannedAt || ""),
  };
}

export async function listUserScanHistory({
  userId,
  pageSize = 20,
  cursorDoc = null,
}) {
  const colRef = collection(db, "users", userId, "scan_history");

  const qRef = cursorDoc
    ? query(
        colRef,
        orderBy("scannedAt", "desc"),
        startAfter(cursorDoc),
        limit(pageSize)
      )
    : query(colRef, orderBy("scannedAt", "desc"), limit(pageSize));

  const snap = await getDocs(qRef);
  const items = snap.docs.map((d) => mapScanDoc(d.id, d.data()));
  const nextCursor = snap.docs.length ? snap.docs[snap.docs.length - 1] : null;

  return { items, nextCursor };
}

/* ---------------- Count scan_history for a user ---------------- */
export async function countUserScanHistoryFirebase({ userId }) {
  const colRef = collection(db, "users", userId, "scan_history");
  const countSnap = await getCountFromServer(colRef);
  return countSnap.data().count;
}
