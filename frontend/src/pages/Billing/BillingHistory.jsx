// src/pages/Billing/BillingHistory.jsx
import { useEffect, useState } from 'react'
import {
  FiLoader,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiStar,
} from 'react-icons/fi'
import { fetchSubscriptionHistory } from '../../api/services/billing'

const formatDateTime = (value) => {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString()
}

const renderStatusChip = (status) => {
  const base =
    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium'
  switch (status) {
    case 'trial':
      return (
        <span className={`${base} bg-amber-100 text-amber-800`}>
          <FiClock className="h-3 w-3" />
          Trial
        </span>
      )
    case 'free':
      return (
        <span className={`${base} bg-emerald-100 text-emerald-800`}>
          <FiStar className="h-3 w-3" />
          Free
        </span>
      )
    case 'active':
      return (
        <span className={`${base} bg-sky-100 text-sky-800`}>
          <FiCheckCircle className="h-3 w-3" />
          Active
        </span>
      )
    case 'past_due':
      return (
        <span className={`${base} bg-orange-100 text-orange-800`}>
          <FiAlertCircle className="h-3 w-3" />
          Past due
        </span>
      )
    case 'canceled':
    case 'incomplete':
    case 'incomplete_expired':
      return (
        <span className={`${base} bg-slate-100 text-slate-600`}>
          {status.replace('_', ' ')}
        </span>
      )
    default:
      return (
        <span className={`${base} bg-slate-100 text-slate-600`}>
          {status || 'unknown'}
        </span>
      )
  }
}

const BillingHistory = () => {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true)
        setError('')
        const data = await fetchSubscriptionHistory()
        setHistory(data.history || [])
      } catch (err) {
        console.error(err)
        setError('Failed to load subscription history.')
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [])

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 py-10">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">
              Subscription History
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              View all your previous trials, free plans, and paid subscriptions.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            <FiAlertCircle className="mt-0.5 h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-500">
            <FiLoader className="mr-2 h-5 w-5 animate-spin" />
            Loading subscription history...
          </div>
        ) : history.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            No subscription history found yet.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Plan
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Start
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      End
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Active
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Current
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Created At
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {history.map((entry) => (
                    <tr
                      key={entry.id}
                      className={
                        entry.isCurrent
                          ? 'bg-emerald-50/40'
                          : entry.isActive
                          ? 'bg-white'
                          : 'bg-slate-50'
                      }
                    >
                      <td className="px-4 py-3 text-sm text-slate-900">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {entry.planName}
                          </span>
                          {entry.planCode && (
                            <span className="text-xs text-slate-500">
                              {entry.planCode}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {renderStatusChip(entry.status)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {formatDateTime(entry.startDate)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {formatDateTime(entry.endDate)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {entry.isActive ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                            <FiCheckCircle className="h-3 w-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {entry.isCurrent ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-medium text-white">
                            <FiCheckCircle className="h-3 w-3" />
                            Current
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {formatDateTime(entry.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BillingHistory
