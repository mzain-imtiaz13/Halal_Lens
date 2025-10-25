import api from '../axios'
import { maybeMock, mockMetrics } from '../mock'

export async function getOverview(range='30d'){
  const mocked = await maybeMock({ ...mockMetrics })
  if (mocked) return mocked
  return api.get('/admin/metrics/overview', { params:{ range } })
}

export async function getVerdictBreakdown(range='30d'){
  const mocked = await maybeMock({ ...mockMetrics.verdictBreakdown })
  if (mocked) return mocked
  return api.get('/admin/metrics/verdict-breakdown', { params:{ range } })
}


