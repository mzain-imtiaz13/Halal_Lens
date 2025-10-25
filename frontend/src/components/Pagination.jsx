import React from 'react'

export default function Pagination({ page, pageSize, total, onChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const prev = () => onChange(Math.max(1, page - 1))
  const next = () => onChange(Math.min(totalPages, page + 1))
  return (
    <div className="pager">
      <span className="helper">Page {page} of {totalPages} • {total} items</span>
      <button className="btn" onClick={prev} disabled={page <= 1}>Prev</button>
      <button className="btn" onClick={next} disabled={page >= totalPages}>Next</button>
    </div>
  )
}
