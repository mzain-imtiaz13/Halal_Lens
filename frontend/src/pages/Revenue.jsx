import React, { useEffect, useMemo, useState } from 'react'
import DataTable from '../components/DataTable'
import Toolbar from '../components/Toolbar'
import { db } from '../firebase'
import { collection, getDocs } from 'firebase/firestore'
import './../styles.css'
const toDate = (v) => {
  try {
    if (v?.toDate) return v.toDate()
    const d = new Date(v)
    if (!isNaN(d)) return d
  } catch (_) {}
  return null
}
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1)
const endOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999)
const ym = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`

export default function Revenue() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const uSnap = await getDocs(collection(db, 'users'))
        setUsers(uSnap.docs.map(d => ({ id: d.id, ...(d.data() || {}) })))
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const rows = useMemo(() => {
    const now = new Date()
    const months = []
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push(d)
    }

    const out = []
    for (const d of months) {
      const mStart = startOfMonth(d)
      const mEnd = endOfMonth(d)
      let total_revenue = 0
      let total_subscriptions = 0

      for (const u of users) {
        const status = String(u.subscriptionStatus || '').toLowerCase()
        const started = toDate(u.subscriptionStartDate)
        const price = Number(u.price || 0)
        if (!started || !price) continue
        if (status !== 'active') continue
        if (started >= mStart && started <= mEnd) {
          total_revenue += price
          total_subscriptions += 1
        }
      }

      const arpu = total_subscriptions ? (total_revenue / total_subscriptions) : 0

      out.push({
        id: ym(d),
        month: ym(d),
        total_revenue: total_revenue.toFixed(2),
        total_subscriptions,
        arpu: arpu.toFixed(2),
        transaction_source: 'subscriptions',
        generated_on: new Date().toISOString().replace('T', ' ').slice(0, 19)
      })
    }

    // newest first
    out.sort((a, b) => b.month.localeCompare(a.month))
    return out
  }, [users])

  const columns = [
    { title: 'Report ID', dataIndex: 'id' },
    { title: 'Month', dataIndex: 'month' },
    { title: 'Total Revenue', dataIndex: 'total_revenue', render: v => `$${v}` },
    { title: 'Total Subscriptions', dataIndex: 'total_subscriptions' },
    { title: 'Generated On', dataIndex: 'generated_on' }
  ]

  return (
    <>
      <Toolbar
        title="Revenue Reports"
      />
      {loading ? 'Loading...' : <DataTable columns={columns} data={rows} pageSize={12} />}
    </>
  )
}
