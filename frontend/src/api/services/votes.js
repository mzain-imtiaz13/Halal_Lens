// src/api/services/votes.js
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
} from 'firebase/firestore'
import { db } from '../../firebase'
import { maybeMock, mockVotes, mockVotesSummary, applySearch, applyEq, paginate } from '../mock'

// Helpers
const toDT = (v) => {
  try {
    if (v?.toDate) return v.toDate().toISOString().replace('T',' ').slice(0,19)
    const d = new Date(v)
    if (!isNaN(d)) return d.toISOString().replace('T',' ').slice(0,19)
  } catch (_) {}
  return ''
}

async function fetchAllProducts() {
  const col = collection(db, 'products_v2')
  const pageSize = 200
  let cursor = null
  let allDocs = []

  // Walk the collection in pages
  // (Your current dataset is small; this is fine. If it grows large later, we can switch to server-side counts.)
  // We also guard against infinite loops by hard-capping loops.
  for (let loops = 0; loops < 50; loops++) {
    const base = query(col, orderBy('updatedAt','desc'), limit(pageSize))
    const snap = await getDocs(cursor ? query(base, startAfter(cursor)) : base)
    if (!snap.docs.length) break
    allDocs = allDocs.concat(snap.docs)
    cursor = snap.docs[snap.docs.length - 1]
  }

  return allDocs
}

export async function listVotes(params = {}) {
  const { voteType='', q='', page=1, pageSize=10 } = params

  // Keep mock path working in non-Firebase runs
  const mocked = await maybeMock(
    paginate(
      applyEq(
        applySearch(mockVotes, ['product_name','ingredient_name','user_name'], q),
        'vote_type', voteType
      ),
      Number(page), Number(pageSize)
    )
  )
  if (mocked) return mocked

  const docs = await fetchAllProducts()
  let rows = []
  for (const d of docs) {
    const data = d.data()
    const ings = Array.isArray(data.ingredients) ? data.ingredients : []
    const when = toDT(data.updatedAt || data.createdAt)
    for (const ing of ings) {
      rows.push({
        product_name: data.productName ?? '-',
        ingredient_name: ing?.name ?? '-',
        // show who added the product; dataset doesn't include per-ingredient voters
        user_name: data.addedByUserId || '-',
        vote_type: ing?.status ?? '-',
        ai_status_at_vote: data.overallStatus ?? '-',
        created_at: when,
      })
    }
  }

  if (voteType) rows = rows.filter(r => r.vote_type === voteType)
  if (q) {
    const s = q.toLowerCase()
    rows = rows.filter(r =>
      String(r.product_name).toLowerCase().includes(s) ||
      String(r.ingredient_name).toLowerCase().includes(s) ||
      String(r.user_name).toLowerCase().includes(s)
    )
  }

  const total = rows.length
  const start = (Number(page)-1) * Number(pageSize)
  const items = rows.slice(start, start + Number(pageSize))

  return { data: { items, total, page:Number(page), pageSize:Number(pageSize) }, status:200 }
}

export async function listVotesSummary(params = {}) {
  const { q='', ai_status='', page=1, pageSize=10 } = params

  // Keep mock path working
  const mocked = await maybeMock(
    paginate(
      applyEq(
        applySearch(mockVotesSummary, ['product_name','ingredient_name'], q),
        'ai_status', ai_status
      ),
      Number(page), Number(pageSize)
    )
  )
  if (mocked) return mocked

  const docs = await fetchAllProducts()
  let rows = []
  for (const d of docs) {
    const data = d.data()
    const ings = Array.isArray(data.ingredients) ? data.ingredients : []
    for (const ing of ings) {
      const halal = Number(ing?.halalVotes ?? 0)
      const haram = Number(ing?.haramVotes ?? 0)
      const susp  = Number(ing?.suspiciousVotes ?? 0)
      rows.push({
        product_name: data.productName ?? '-',
        ingredient_name: ing?.name ?? '-',
        halal_votes: halal,
        haram_votes: haram,
        suspicious_votes: susp,
        total_votes: halal + haram + susp,
        ai_status: data.overallStatus ?? '-',
      })
    }
  }

  if (ai_status) rows = rows.filter(r => r.ai_status === ai_status)
  if (q) {
    const s = q.toLowerCase()
    rows = rows.filter(r =>
      String(r.product_name).toLowerCase().includes(s) ||
      String(r.ingredient_name).toLowerCase().includes(s)
    )
  }

  const total = rows.length
  const start = (Number(page)-1) * Number(pageSize)
  const items = rows.slice(start, start + Number(pageSize))

  return { data: { items, total, page:Number(page), pageSize:Number(pageSize) }, status:200 }
}
