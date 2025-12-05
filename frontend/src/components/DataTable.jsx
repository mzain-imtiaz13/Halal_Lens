export default function DataTable({ columns, data }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          {/* Header */}
          <thead className="bg-linear-to-b from-slate-50 to-slate-100">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key || col.dataIndex}
                  className="sticky top-0 z-10 px-4 py-3 text-left text-sm font-semibold text-slate-700 border-b border-slate-200"
                >
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {data.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-10 text-center text-sm text-slate-500"
                >
                  No results
                </td>
              </tr>
            )}

            {data.map((row, idx) => (
              <tr
                key={row.id || idx}
                className="transition-all hover:bg-slate-50/80"
              >
                {columns.map((col, cidx) => (
                  <td
                    key={col.key || col.dataIndex}
                    className={`px-4 py-3 text-sm border-b border-slate-200 ${
                      cidx === 0 ? "border-l-4 border-transparent group-hover:border-indigo-300" : ""
                    }`}
                  >
                    {col.render
                      ? col.render(row[col.dataIndex], row)
                      : row[col.dataIndex]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
