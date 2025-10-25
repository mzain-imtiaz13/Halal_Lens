/* ---------------- services/revenue.js (FULL) ---------------- */
import api from '../axios'
import { mockGetRevenue, mockGenerateRevenue } from '../mock'

export async function listRevenue(params = {}) {
  const mocked = await mockGetRevenue()
  if (mocked) return mocked
  return api.get('/admin/revenue', { params })
}

export async function generateRevenue(month) {
  const mocked = await mockGenerateRevenue(month)
  if (mocked) return mocked
  return api.post('/admin/revenue/generate', null, { params: { month } })
}
