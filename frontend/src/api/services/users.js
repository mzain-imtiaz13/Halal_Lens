import api from '../axios'
import { maybeMock, mockUsers, applySearch, applyEq, paginate } from '../mock'

export async function listUsers(params = {}) {
  const { search='', plan='', status='', page=1, pageSize=10 } = params
  const mocked = await maybeMock(
    paginate(
      applyEq(
        applyEq(
          applySearch(mockUsers, ['name','email'], search),
          'subscription_plan', plan
        ),
        'status', status
      ),
      Number(page), Number(pageSize)
    )
  )
  if (mocked) return mocked
  return api.get('/admin/users', { params })
}
