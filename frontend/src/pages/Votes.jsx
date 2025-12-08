import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import Toolbar from "../components/Toolbar";
import Pagination from "../components/Pagination";
import { listVotes } from "../api/services/votes";
import "./../styles.css";
const Chip = (v) => {
  const val = String(v || "").toLowerCase();
  const cls = val === "halal" ? "green" : val === "haram" ? "red" : "amber";
  return (
    <span className={`chip ${cls}`}>
      <span className="dot" />
      {v || "-"}
    </span>
  );
};

export default function Votes() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voteType, setVoteType] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const resp = await listVotes({ voteType, q, page, pageSize });
        setRows(resp.data.items);
        setTotal(resp.data.total);
      } finally {
        setLoading(false);
      }
    })();
  }, [voteType, q, page]);

  const reset = () => {
    setVoteType("");
    setQ("");
    setPage(1);
  };

  const columns = [
    { title: "Product", dataIndex: "product_name" },
    { title: "Ingredient", dataIndex: "ingredient_name" },
    { title: "User", dataIndex: "user_name" },
    { title: "Vote", dataIndex: "vote_type", render: (v) => Chip(v) },
    {
      title: "AI Status Vote",
      dataIndex: "ai_status_at_vote",
      render: (v) => Chip(v),
    },
    { title: "Date/Time", dataIndex: "created_at" },
  ];

  return (
    <>
      <h2>Community&nbsp;Votes</h2>
      <Toolbar onReset={reset}>
        <input
          className="input"
          style={{ minWidth: 240 }}
          placeholder="Search product, ingredient or user..."
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
        />
        <select
          className="select"
          value={voteType}
          onChange={(e) => {
            setVoteType(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All</option>
          <option value="halal">Halal</option>
          <option value="haram">Haram</option>
          <option value="suspicious">Suspicious</option>
        </select>
      </Toolbar>

      <div className="space" />
      {loading ? (
        "Loading..."
      ) : (
        <>
          <DataTable columns={columns} data={rows} />
          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            onChange={setPage}
          />
        </>
      )}
    </>
  );
}
