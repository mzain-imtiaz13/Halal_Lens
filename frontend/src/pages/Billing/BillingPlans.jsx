// src/pages/Billing/BillingPlans.jsx
import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiCheckCircle,
  FiZap,
  FiStar,
  FiClock,
  FiArrowRight,
  FiLoader,
  FiAlertCircle,
} from 'react-icons/fi'
import {
  fetchBillingOverview,
  createCheckoutSession,
} from '../../api/services/billing'

const BillingPlans = () => {
  const navigate = useNavigate()

  const [plans, setPlans] = useState([])
  const [subscription, setSubscription] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError('')
        const data = await fetchBillingOverview()
        setPlans(data.plans || [])
        setSubscription(data.subscription || null)
        setIsAuthenticated(!!data.isAuthenticated)
      } catch (err) {
        console.error(err)
        setError('Failed to load billing information.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Find monthly price so we can show 12 * monthly (e.g. $36) crossed out on yearly
  const yearlyOriginalPrice = useMemo(() => {
    const monthlyPlan = plans.find((p) => p.code === 'STANDARD_MONTHLY')
    if (!monthlyPlan || !monthlyPlan.price) return null
    return monthlyPlan.price * 12
  }, [plans])

  const handlePlanAction = async (plan) => {
    const action = plan.ui?.action
    if (!action) return

    if (action === 'login') {
      navigate('/login', {
        state: { from: { pathname: '/billing' } },
        replace: true,
      })
      return
    }

    try {
      setError('')
      setActionLoading(true)

      if (action === 'subscribe') {
        const { url } = await createCheckoutSession(plan.code)
        if (url) {
          window.location.href = url
        } else {
          setError('Could not create checkout session.')
        }
        return
      }
    } catch (err) {
      console.error(err)
      setError(err?.response?.data?.message || 'Action failed.')
    } finally {
      setActionLoading(false)
    }
  }

  const renderPlanBadge = (plan) => {
    const badgeType = plan.ui?.badgeType

    if (badgeType === 'trial') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
          <FiClock className="h-3 w-3" />
          Trial
        </span>
      )
    }
    if (badgeType === 'free') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
          <FiStar className="h-3 w-3" />
          Free
        </span>
      )
    }
    if (badgeType === 'monthly') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-800">
          <FiZap className="h-3 w-3" />
          Monthly
        </span>
      )
    }
    if (badgeType === 'yearly') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800">
          <FiZap className="h-3 w-3" />
          Yearly
        </span>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-10">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">
              Billing & Subscription
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {isAuthenticated
                ? 'Manage your Halal Lens subscription and scan limits in one place.'
                : 'View available Halal Lens plans. Sign in to subscribe and unlock more scans.'}
            </p>
          </div>
          {subscription && (
            <div className="flex max-w-sm flex-col gap-1 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 shadow-sm">
              <div className="flex items-center gap-2">
                <FiCheckCircle className="h-4 w-4" />
                <span className="font-medium">
                  Current Plan:{' '}
                  {subscription.plan?.name ||
                    subscription.plan?.code ||
                    'Unknown'}
                </span>
              </div>
              {subscription.currentPeriodEnd && (
                <div className="text-xs text-emerald-800">
                  Ends on:{' '}
                  {new Date(
                    subscription.currentPeriodEnd
                  ).toLocaleDateString()}
                </div>
              )}
              <div className="text-xs text-emerald-800">
                Status:{' '}
                <span className="font-semibold">{subscription.status}</span>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            <FiAlertCircle className="mt-0.5 h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-500">
            <FiLoader className="mr-2 h-5 w-5 animate-spin" />
            Loading plans...
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 auto-rows-fr">
            {plans.map((plan) => {
              const ui = plan.ui || {}
              const showButton = ui.showButton
              const buttonLabel = ui.buttonLabel || 'Select'
              const buttonVariant = ui.buttonVariant || 'outline'
              const disabled = ui.disabled || actionLoading

              const isYearlyRecurring =
                plan.billingType === 'recurring' && plan.interval === 'year'

              return (
                <div
                  key={plan._id || plan.code}
                  className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  {/* Main content fills height */}
                  <div className="flex flex-1 flex-col">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h2 className="text-xl font-semibold text-slate-900">
                          {plan.name}
                        </h2>
                        <p className="mt-2 text-sm text-slate-600">
                          {plan.description}
                        </p>
                      </div>
                      {renderPlanBadge(plan)}
                    </div>

                    {/* Price */}
                    <div className="mt-5 min-h-14">
                      {plan.price > 0 ? (
                        <>
                          {isYearlyRecurring && yearlyOriginalPrice && (
                            <span className="text-sm text-slate-400 line-through">
                              ${yearlyOriginalPrice.toFixed(0)}
                            </span>
                          )}
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-slate-900">
                              ${plan.price}
                            </span>
                            {plan.interval && (
                              <span className="text-sm text-slate-500">
                                / {plan.interval}
                              </span>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-emerald-600">
                            Free
                          </span>
                          {plan.interval && (
                            <span className="text-sm text-slate-500">
                              / {plan.interval}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Features */}
                    <ul className="mt-4 flex-1 space-y-1.5 text-sm text-slate-700">
                      <li className="flex items-center gap-2">
                        <FiCheckCircle className="h-4 w-4 text-emerald-500" />
                        <span>{plan.scansPerDay} scans per day</span>
                      </li>
                      {plan.billingType === 'trial' && (
                        <li className="flex items-center gap-2">
                          <FiClock className="h-4 w-4 text-amber-500" />
                          <span>{plan.trialDays} days trial</span>
                        </li>
                      )}
                      {plan.billingType === 'recurring' && (
                        <li className="flex items-center gap-2">
                          <FiStar className="h-4 w-4 text-sky-500" />
                          <span>Priority access to future features</span>
                        </li>
                      )}
                    </ul>

                    {/* Button pinned to bottom */}
                    {showButton && (
                      <div className="mt-auto border-t border-slate-100 pt-4">
                        <button
                          disabled={disabled}
                          onClick={() => handlePlanAction(plan)}
                          className={
                            'flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ' +
                            (disabled
                              ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                              : buttonVariant === 'primary'
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer'
                              : 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 cursor-pointer')
                          }
                        >
                          <span>{buttonLabel}</span>
                          {!disabled && buttonVariant === 'primary' && (
                            <FiArrowRight className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default BillingPlans
