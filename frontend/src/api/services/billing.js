import api from '../axios'

export const fetchPlans = async () => {
  const res = await api.get('/billing/plans')
  return res.data
}

export const fetchBillingOverview = async () => {
  const res = await api.get('/billing/overview')
  return res.data
}

export const fetchSubscriptionHistory = async () => {
  const res = await api.get('/billing/history')
  return res.data // { history: [...] }
}

export const fetchMySubscription = async () => {
  const res = await api.get('/billing/me')
  return res.data
}

export const startTrial = async () => {
  const res = await api.post('/billing/start-trial')
  return res.data
}

export const createCheckoutSession = async (planCode) => {
  const res = await api.post('/billing/checkout', { planCode })
  return res.data // { url }
}
