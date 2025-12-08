import { useEffect, useState } from 'react'
import { FiCheckCircle } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { fetchMySubscription } from '../../api/services/billing'

const BillingSuccess = () => {
  const navigate = useNavigate()
  const [sub, setSub] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const s = await fetchMySubscription()
        setSub(s)
      } catch (e) {
        // ignore
      }
    }
    load()
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md rounded-2xl bg-white p-8 shadow-lg border border-slate-200">
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <FiCheckCircle className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <h1 className="mt-4 text-center text-xl font-semibold text-slate-900">
          Payment Successful
        </h1>
        <p className="mt-2 text-center text-sm text-slate-600">
          Your subscription is now active. You can start using your new plan in Halal Lens.
        </p>

        {sub && (
          <div className="mt-4 rounded-lg bg-green-50 p-3 text-xs text-green-900">
            <div>
              Current plan:{' '}
              <span className="font-semibold">
                {sub.plan?.name || sub.plan?.code}
              </span>
            </div>
            {sub.currentPeriodEnd && (
              <div>
                Ends on:{' '}
                {new Date(sub.currentPeriodEnd).toLocaleDateString()}
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => navigate('/billing')}
          className="mt-6 w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          Go to Billing
        </button>
      </div>
    </div>
  )
}

export default BillingSuccess
