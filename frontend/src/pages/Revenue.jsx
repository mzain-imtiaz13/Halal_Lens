// src/pages/Revenue.jsx
import React, { useEffect, useState } from 'react'
import DataTable from '../components/DataTable'
import Toolbar from '../components/Toolbar'
import './../styles.css'
import { fetchRevenueReports } from '../api/services/billing'

export default function Revenue() {
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState([])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        setLoading(true)
        const data = await fetchRevenueReports()
        if (cancelled) return

        const reports = data.reports || []

        // Normalise into table rows if needed
        const mapped = reports.map((r) => ({
          reportId: r.reportId,
          month: r.month,
          totalRevenue: Number(r.totalRevenue || 0).toFixed(2),
          totalSubscriptions: r.totalSubscriptions || 0,
          generatedOn: r.generatedOn,
        }))

        setRows(mapped)
      } catch (err) {
        console.error('Failed to load revenue reports:', err)
        setRows([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  const columns = [
    { title: 'Month', dataIndex: 'month' },
    {
      title: 'Total Revenue',
      dataIndex: 'totalRevenue',
      render: (v) => `$${v}`,
    },
    { title: 'Total Subscriptions', dataIndex: 'totalSubscriptions' },
    { title: 'Generated On', dataIndex: 'generatedOn' },
  ]

  return (
    <>
      <Toolbar title="Revenue Reports" />
      {loading ? (
        'Loading...'
      ) : (
        <DataTable columns={columns} data={rows} pageSize={12} />
      )}
    </>
  )
}
