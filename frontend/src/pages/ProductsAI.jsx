import React, { useEffect, useState } from 'react'
import DataTable from '../components/DataTable'
import Toolbar from '../components/Toolbar'
import Pagination from '../components/Pagination'
import { listAIProducts, recheckAI } from '../api/services/products'
import './../styles.css'
function Drawer({ open, onClose, data }) {
  if (!open) return null
  const x = data?._extra || {}
  const ing = Array.isArray(x.ingredients) ? x.ingredients : []
  const refs = Array.isArray(x.references) ? x.references : []

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <aside className="drawer">
        <div className="drawer-header">
          <div className="drawer-title">Product details</div>
          <button className="btn pill ghost" onClick={onClose}>Close</button>
        </div>

        <div className="drawer-section">
          <div style={{fontWeight:800, fontSize:16, margin:'4px 0 10px'}}>{data?.product_name}</div>
          <div className="gallery">
            {x.frontImageUrl && <img src={x.frontImageUrl} alt="front" />}
            {x.backImageUrl && <img src={x.backImageUrl} alt="back" />}
          </div>
        </div>

        <div className="grid cols-2 drawer-section">
          <div className="card">
            <div className="card-title">Overview</div>
            <div className="kv" style={{marginTop:8}}>
              <div className="muted">Product ID</div><div>{x.id || '-'}</div>
              <div className="muted">Barcode</div><div>{x.barcode || '-'}</div>
              <div className="muted">Brands</div><div>{x.brands || '-'}</div>
              <div className="muted">Data Source</div><div>{x.dataSource || '-'}</div>
              <div className="muted">Added By</div><div>{x.addedByUserId || '-'}</div>
              <div className="muted">Verified</div><div>{x.isVerified ? 'Yes' : 'No'}</div>
              <div className="muted">AI Verdict</div>
              <div>
                <span className={`chip ${data?.ai_verdict==='halal'?'green':data?.ai_verdict==='haram'?'red':'amber'}`}>
                  <span className="dot" /> {data?.ai_verdict || '-'}
                </span>
              </div>
              <div className="muted">Reason</div><div>{x.statusReason || '-'}</div>
              <div className="muted">Created</div><div>{x.createdAt || '-'}</div>
              <div className="muted">Updated</div><div>{x.updatedAt || '-'}</div>
            </div>
          </div>

          <div className="card">
            <div className="card-title">Ingredients</div>
            {!ing.length ? (
              <div className="table-empty">No ingredients</div>
            ) : (
              <table className="table compact" style={{marginTop:8}}>
                <thead><tr><th>Name</th><th>Status</th><th>Reason</th><th>Votes</th></tr></thead>
                <tbody>
                  {ing.map((it, i)=>(
                    <tr key={i}>
                      <td>{it?.name || '-'}</td>
                      <td>
                        <span className={`chip ${it?.status==='halal'?'green':it?.status==='haram'?'red':'amber'}`}>
                          <span className="dot" /> {it?.status || '-'}
                        </span>
                      </td>
                      <td style={{maxWidth:260, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}} title={it?.reason || ''}>
                        {it?.reason || '-'}
                      </td>
                      <td>{(it?.halalVotes ?? 0) + (it?.haramVotes ?? 0) + (it?.suspiciousVotes ?? 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="card drawer-section">
          <div className="card-title">References</div>
          {!refs.length ? (
            <div className="table-empty">No references</div>
          ) : (
            <ul style={{margin:0, paddingLeft:16}}>
              {refs.map((r, i)=>(
                <li key={i} style={{marginBottom:10}}>
                  <div style={{fontWeight:700}}>{r?.title || '-'}</div>
                  <div className="helper">{r?.notes || '-'}</div>
                  {r?.url && <div style={{marginTop:6}}><a className="btn link" href={r.url} target="_blank" rel="noreferrer">Open link</a></div>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  )
}

export default function ProductsAI() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [verdict, setVerdict] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [total, setTotal] = useState(0)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [activeRow, setActiveRow] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      // AI page => userSubmitted + barcode
      const resp = await listAIProducts({ verdict, q, page, pageSize })
      setRows(resp.data.items)
      setTotal(resp.data.total)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [verdict, q, page])

  const handleRecheck = async (row) => {
    await recheckAI(row.id)
    await fetchData()
  }
  const reset = () => { setVerdict(''); setQ(''); setPage(1) }

  const columns = [
    { title:'Product ID', dataIndex:'id' },
    { title:'Product', dataIndex:'product_name' },
    { title:'Medium', dataIndex:'medium' },
    { title:'Ingredients', dataIndex:'ingredients_preview' },
    { title:'AI Verdict', dataIndex:'ai_verdict', render:v=>(
        <span className={`chip ${v==='halal'?'green':v==='haram'?'red':'amber'}`}>
          <span className="dot" /> {v}
        </span>
    )},
    { title:'Haram ingredients', dataIndex:'haram_ingredients' },
    { title:'Suspicious ingredients', dataIndex:'suspicious_ingredients' },
    { title:'Source', dataIndex:'api_source' },
    { title:'Date Added', dataIndex:'date_added' },
    { title:'Actions', key:'actions', render:(_, row) => (
      <div className="row">
        <button className="btn" onClick={() => handleRecheck(row)}>Recheck</button>
        <button className="btn ghost" onClick={()=>{ setActiveRow(row); setDrawerOpen(true) }}>View</button>
      </div>
    )}
  ]

  return (
    <>
      <h2>AI Product Listing</h2>
      <Toolbar onReset={reset}>
        <input className="input" style={{minWidth:240}} placeholder="Search product or ingredient..." value={q} onChange={e=>{ setQ(e.target.value); setPage(1) }} />
        <select className="select" value={verdict} onChange={e => { setVerdict(e.target.value); setPage(1) }}>
          <option value="">All Verdicts</option>
          <option value="halal">Halal</option>
          <option value="haram">Haram</option>
          <option value="suspicious">Suspicious</option>
        </select>
      </Toolbar>

      <div className="space" />

      {loading ? 'Loading...' : (
        <>
          <DataTable columns={columns} data={rows} pageSize={rows.length || 10} />
          <Pagination page={page} pageSize={pageSize} total={total} onChange={setPage} />
        </>
      )}

      <Drawer open={drawerOpen} onClose={()=>setDrawerOpen(false)} data={activeRow} />
    </>
  )
}
