// src/pages/Billing/BillingHistory.jsx
import { useAuth } from '../../contexts/AuthContext'
import BillingHistoryTable from './BillingHistoryTable'

const BillingHistoryPage = () => {
  const { user } = useAuth() // assuming this has user.uid (Firebase UID)

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 py-10">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-slate-900">
            Subscription History
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            View all your previous trials, free plans, and paid subscriptions.
          </p>
        </div>

        <BillingHistoryTable userId={user?.uid} />
      </div>
    </div>
  )
}

export default BillingHistoryPage
