import React, { useEffect, useState } from 'react'
import DataTable from '../components/DataTable'
import Toolbar from '../components/Toolbar'
import Pagination from '../components/Pagination'
import { listVotesSummary } from '../api/services/votes'
import './../styles.css'

const Chip = (v) => {
  const val = String(v || '').toLowerCase()
  const cls =
    val === 'halal' ? 'green' :
    val === 'haram' ? 'red' : 'amber'
  return (
    <span className={`chip ${cls}`}>
      <span className="dot" />
      {v || '-'}
    </span>
  )
}

export default function VotesSummary() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [aiStatus, setAiStatus] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const resp = await listVotesSummary({ q, ai_status: aiStatus, page, pageSize })
        setRows(resp.data.items)
        setTotal(resp.data.total)
      } finally { setLoading(false) }
    })()
  }, [q, aiStatus, page])

  const reset = () => { setQ(''); setAiStatus(''); setPage(1) }

  const columns = [
    { title: 'Product', dataIndex: 'product_name' },
    { title: 'Ingredient', dataIndex: 'ingredient_name' },
    { title: 'Halal Votes', dataIndex: 'halal_votes' },
    { title: 'Haram Votes', dataIndex: 'haram_votes' },
    { title: 'Suspicious Votes', dataIndex: 'suspicious_votes' },
    { title: 'Total', dataIndex: 'total_votes' },
    { title: 'AI Status', dataIndex: 'ai_status', render: v => Chip(v) },
  ]

  return (
    <>
      <h2>Product-wise Ingredient Voting Summary</h2>
      <Toolbar onReset={reset}>
        <input
          className="input"
          style={{minWidth:240}}
          placeholder="Search product or ingredient..."
          value={q}
          onChange={e=>{setQ(e.target.value); setPage(1)}}
        />
        <select
          className="select"
          value={aiStatus}
          onChange={e => {setAiStatus(e.target.value); setPage(1)}}
        >
          <option value="">All AI Status</option>
          <option value="halal">Halal</option>
          <option value="haram">Haram</option>
          <option value="suspicious">Suspicious</option>
        </select>
      </Toolbar>

      <div className="space" />
      {loading ? 'Loading...' : (
        <>
          <DataTable columns={columns} data={rows} />
          <Pagination page={page} pageSize={pageSize} total={total} onChange={setPage} />
        </>
      )}
    </>
  )
}
