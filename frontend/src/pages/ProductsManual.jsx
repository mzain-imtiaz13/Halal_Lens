import React, { useEffect, useState } from 'react'
import DataTable from '../components/DataTable'
import Toolbar from '../components/Toolbar'
import Pagination from '../components/Pagination'
import { listManualProducts } from '../api/services/products'

const PLACEHOLDER_IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="80">
      <rect width="120" height="80" fill="#e5e7eb"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
            font-family="Arial" font-size="10" fill="#6b7280">No Image</text>
    </svg>
  `)

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
          <div className="drawer-title">Manual product details</div>
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
              <div className="muted">Source</div><div>{x.dataSource || '-'}</div>
              <div className="muted">Added By</div><div>{x.addedByUserId || '-'}</div>
              <div className="muted">Verified</div><div>{x.isVerified ? 'Yes' : 'No'}</div>
              <div className="muted">Admin Verdict</div>
              <div>
                <span className={`chip ${data?.admin_verdict==='halal'?'green':data?.admin_verdict==='haram'?'red':'amber'}`}>
                  <span className="dot" /> {data?.admin_verdict || '-'}
                </span>
              </div>
              <div className="muted">Reason</div><div>{x.statusReason || '-'}</div>
              <div className="muted">Submitted</div><div>{x.createdAt || '-'}</div>
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

export default function ProductsManual() {
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
      // Manual page => admin only
      const resp = await listManualProducts({ verdict, q, page, pageSize })
      setRows(resp.data.items)
      setTotal(resp.data.total)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [verdict, q, page])

  const reset = () => { setVerdict(''); setQ(''); setPage(1) }

  const Img = ({ src }) => (
    <img
      src={src || PLACEHOLDER_IMG}
      onError={(e)=>{ e.currentTarget.src = PLACEHOLDER_IMG }}
      width={64} height={46}
      style={{objectFit:'cover', borderRadius:8, border:'1px solid var(--border)'}}
    />
  )

  const columns = [
    { title:'Product ID', dataIndex:'id' },
    { title:'Product Name', dataIndex:'product_name' },
    {
      title:'Uploaded Images',
      key:'images',
      render:(_, row)=>(
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <Img src={row.img_front_url} />
          <Img src={row.img_ingredients_url} />
        </div>
      )
    },
    {
      title:'Verdict',
      dataIndex:'admin_verdict',
      render:v=>(
        <span className={`chip ${v==='halal'?'green':v==='haram'?'red':'amber'}`}>
          <span className="dot" /> {v}
        </span>
      )
    },
    { title:'Date of Submission', dataIndex:'submitted_at' },
    { title:'Actions', key:'actions', render:(_, row)=>(
      <button className="btn ghost" onClick={()=>{ setActiveRow(row); setDrawerOpen(true) }}>View</button>
    )}
  ]

  return (
    <>
      <Toolbar
        title="Manual Product Listing"
        onReset={reset}
        left={(
          <>
            <input
              className="input"
              style={{minWidth:240}}
              placeholder="Search product..."
              value={q}
              onChange={e=>{ setQ(e.target.value); setPage(1) }}
            />
            <select
              className="select"
              value={verdict}
              onChange={e => { setVerdict(e.target.value); setPage(1) }}
            >
              <option value="">All</option>
              <option value="halal">Halal</option>
              <option value="haram">Haram</option>
              <option value="suspicious">Suspicious</option>
            </select>
          </>
        )}
      />

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
