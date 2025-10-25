import {
  collection,
  getDocs,
} from 'firebase/firestore'
import { db } from '../../firebase'

// ---------- helpers ----------
const toISODate = (v) => {
  try {
    if (v?.toDate) return v.toDate().toISOString().slice(0, 10)
    const d = new Date(v)
    if (!isNaN(d)) return d.toISOString().slice(0, 10)
  } catch (_) {}
  return ''
}
const toISODateTime = (v) => {
  try {
    if (v?.toDate) return v.toDate().toISOString().replace('T', ' ').slice(0, 19)
    const d = new Date(v)
    if (!isNaN(d)) return d.toISOString().replace('T', ' ').slice(0, 19)
  } catch (_) {}
  return String(v || '')
}

const firstN = (arr, n = 4) => (Array.isArray(arr) ? arr.slice(0, n) : [])
const joinNames = (arr, predicate) =>
  (Array.isArray(arr) ? arr.filter(predicate).map(x => x?.name).filter(Boolean) : []).join(', ')

// Map CATEGORY -> VERDICT (fallback when overallStatus missing)
const verdictFromCategory = (category) => {
  const v = String(category || '').trim().toLowerCase()
  if (v === 'haram') return 'haram'
  if (v === 'suspicious' || v === 'doubtful') return 'suspicious'
  if (v === 'halal') return 'halal'
  return '' // unknown
}

function buildExtra(docId, d) {
  return {
    id: docId,
    barcode: d.barcode ?? '',
    brands: d.brands ?? '',
    categories: Array.isArray(d.categories) ? d.categories : (d.category ? [d.category] : []),
    additives: Array.isArray(d.additives) ? d.additives : [],
    allergens: Array.isArray(d.allergens) ? d.allergens : [],
    dataSource: d.dataSource ?? '',
    addedByUserId: d.addedByUserId ?? '',
    isVerified: d.isVerified ?? false,
    quantity: d.quantity ?? null,
    nutriments: d.nutriments ?? null,
    nutriscore: d.nutriscore ?? null,
    statusReason: d.statusReason ?? '',
    references: Array.isArray(d.references) ? d.references : [],
    createdAt: toISODateTime(d.createdAt),
    updatedAt: toISODateTime(d.updatedAt),
    frontImageUrl: d.frontImageUrl || d.picture || '',
    backImageUrl: d.backImageUrl || '',
    ingredients: Array.isArray(d.ingredients) ? d.ingredients : []
  }
}

// Map Firestore -> AI Products row (userSubmitted + barcode)
function mapAI(docId, d) {
  const ingredients = Array.isArray(d.ingredients) ? d.ingredients : []
  // Only two mediums: barcode or userSubmitted
  const medium = String(d.barcode || '').trim() ? 'barcode' : 'userSubmitted'
  const preview = firstN(ingredients).map(i => i?.name).filter(Boolean).join(', ')
  const status = (d.overallStatus ?? verdictFromCategory(d.category) ?? '').toString()

  return {
    id: docId,
    product_name: d.productName ?? d.name ?? '-',
    medium,
    ingredients_preview: preview || (Array.isArray(d.ingredients) ? firstN(d.ingredients, 5).map(x=>x?.name).filter(Boolean).join(', ') : ''),
    ai_verdict: status || '-',
    haram_ingredients: joinNames(ingredients, i => (i?.status || '').toLowerCase() === 'haram'),
    suspicious_ingredients: joinNames(ingredients, i => (i?.status || '').toLowerCase() === 'suspicious'),
    api_source: d.dataSource || '-',
    date_added: toISODate(d.createdAt || d.updatedAt),
    _extra: buildExtra(docId, d)
  }
}

// Map Firestore -> Manual Products row (admin only)
function mapManual(docId, d) {
  const status = (d.overallStatus ?? verdictFromCategory(d.category) ?? '').toString()
  return {
    id: docId,
    product_name: d.productName ?? d.name ?? '-',
    img_front_url: d.frontImageUrl || d.picture || '',
    img_ingredients_url: d.backImageUrl || '',
    admin_verdict: status || '-',
    submitted_at: toISODate(d.createdAt || d.updatedAt),
    _extra: buildExtra(docId, d)
  }
}

/* ---------------- AI PRODUCTS (userSubmitted + barcode) ---------------- */
export async function listAIProducts(params = {}) {
  const verdict   = (params.verdict || '').toLowerCase().trim()
  const q         = (params.q || '').trim().toLowerCase()
  const page      = Number(params.page || 1)
  const pageSize  = Number(params.pageSize || 10)

  // AI page shows userSubmitted and barcode
  const ALLOWED_SOURCES = ['barcode', 'userSubmitted']

  const snap = await getDocs(collection(db, 'products_v2'))
  let rows = []
  snap.forEach((d) => {
    const data = d.data()
    const src = (data.dataSource || '').trim()
    if (!ALLOWED_SOURCES.includes(src)) return
    rows.push(mapAI(d.id, data))
  })

  if (verdict) rows = rows.filter(r => (r.ai_verdict || '').toLowerCase() === verdict)
  if (q) {
    rows = rows.filter(r =>
      String(r.product_name).toLowerCase().includes(q) ||
      String(r.ingredients_preview).toLowerCase().includes(q)
    )
  }

  rows.sort((a, b) => (b._extra?.updatedAt || '').localeCompare(a._extra?.updatedAt || ''))

  const total = rows.length
  const start = (page - 1) * pageSize
  const items = rows.slice(start, start + pageSize)

  return { data: { items, total, page, pageSize }, status: 200 }
}

/* ---------------- MANUAL PRODUCTS (admin only) ---------------- */
export async function listManualProducts(params = {}) {
  const verdict  = (params.verdict || '').toLowerCase().trim()
  const q        = (params.q || '').trim().toLowerCase()
  const page     = Number(params.page || 1)
  const pageSize = Number(params.pageSize || 10)

  const ALLOWED_SOURCES = ['admin'] // strictly admin

  const snap = await getDocs(collection(db, 'products_v2'))
  let rows = []
  snap.forEach((d) => {
    const data = d.data()
    const src = (data.dataSource || '').trim()
    if (!ALLOWED_SOURCES.includes(src)) return
    rows.push(mapManual(d.id, data))
  })

  if (verdict) rows = rows.filter(r => (r.admin_verdict || '').toLowerCase() === verdict)
  if (q) rows = rows.filter(r => String(r.product_name).toLowerCase().includes(q))

  rows.sort((a, b) => (b._extra?.updatedAt || '').localeCompare(a._extra?.updatedAt || ''))

  const total = rows.length
  const start = (page - 1) * pageSize
  const items = rows.slice(start, start + pageSize)

  return { data: { items, total, page, pageSize }, status: 200 }
}

// Keeps your Recheck button as a no-op (no backend yet)
export async function recheckAI(productId) {
  return { data: { ok: true }, status: 200 }
}
