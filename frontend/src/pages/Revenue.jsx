// src/pages/Revenue.jsx
import React, { useEffect, useMemo, useState } from "react";
import DataTable from "../components/DataTable";
import Toolbar from "../components/Toolbar";
import { fetchRevenueReports } from "../api/services/billing";

export default function Revenue() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  // pagination state (client-side)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchRevenueReports();
        if (cancelled) return;

        const reports = data.reports || [];

        const mapped = reports.map((r) => ({
          reportId: r.reportId,
          month: r.month,
          totalRevenue: Number(r.totalRevenue || 0).toFixed(2),
          totalSubscriptions: r.totalSubscriptions || 0,
          generatedOn: r.generatedOn,
        }));

        setRows(mapped);
        setPage(1); // reset to first page when data changes
      } catch (err) {
        console.error("Failed to load revenue reports:", err);
        setRows([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const columns = [
    { title: "Month", dataIndex: "month" },
    {
      title: "Total Revenue",
      dataIndex: "totalRevenue",
      render: (v) => `$${v}`,
    },
    { title: "Total Subscriptions", dataIndex: "totalSubscriptions" },
    { title: "Generated On", dataIndex: "generatedOn" },
  ];

  const total = rows.length;

  // client-side slice for current page
  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page, pageSize]);

  return (
    <>
      <Toolbar title="Revenue Reports" />
        <DataTable
          columns={columns}
          data={pagedRows}
          loading={loading}
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
    </>
  );
}
