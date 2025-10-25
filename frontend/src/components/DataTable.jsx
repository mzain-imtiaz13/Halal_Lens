import React from 'react'

export default function DataTable({ columns, data }) {
  return (
    <div className="card">
      <table className="table">
        <thead>
          <tr>
            {columns.map(col => <th key={col.key || col.dataIndex}>{col.title}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 && (
            <tr><td colSpan={columns.length} style={{ color: '#64748b', textAlign:'center', padding:'20px' }}>No results</td></tr>
          )}
          {data.map((row, idx) => (
            <tr key={row.id || idx}>
              {columns.map(col => (
                <td key={col.key || col.dataIndex}>
                  {col.render ? col.render(row[col.dataIndex], row) : row[col.dataIndex]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
