import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-theme-alpine.css";
import {
  ModuleRegistry, ClientSideRowModelModule, ValidationModule,
  DateFilterModule, NumberFilterModule, TextFilterModule,
  RowSelectionModule, PaginationModule, CsvExportModule
} from "ag-grid-community";

ModuleRegistry.registerModules([
  ClientSideRowModelModule, ValidationModule, DateFilterModule,
  NumberFilterModule, TextFilterModule, RowSelectionModule,
  PaginationModule, CsvExportModule
]);

// ─── Themes ───────────────────────────────────────────────────────────────────
const LIGHT = {
  bg: "#f0f4f8", card: "#ffffff", border: "#dde3ec",
  text: "#1a2332", subtext: "#64748b",
  header: "linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%)",
  accent: "#2563eb", tableHead: "#1e3a5f",
  tableRow: "#f8fafc", tableRowAlt: "#ffffff", gridBg: "#f8fafc",
};
const DARK = {
  bg: "#0d1117", card: "#161b22", border: "#30363d",
  text: "#e6edf3", subtext: "#8b949e",
  header: "linear-gradient(135deg,#0d1117 0%,#1f2937 100%)",
  accent: "#58a6ff", tableHead: "#0d1117",
  tableRow: "#161b22", tableRowAlt: "#1a2332", gridBg: "#161b22",
};

// ─── Constants ────────────────────────────────────────────────────────────────
const PO_CATEGORIES = ["foundationPO","fabrication","sheet","boughtout","hardware","paint_powder","electrical","drive"];
const PO_LABELS     = ["Foundation","Fabrication","Sheet","Bought Out","Hardware","Paint/Powder","Electrical","Drive"];
const PO_COLORS     = ["#14b8a6","#8b5cf6","#06b6d4","#3b82f6","#f97316","#ec4899","#f59e0b","#10b981"];

const D2_FIELDS = [
  { key: "BOUGHT_OUT",   label: "Bought Out",   color: "#3b82f6" },
  { key: "CONSUMABLES",  label: "Consumables",  color: "#8b5cf6" },
  { key: "DRIVE",        label: "Drive",        color: "#10b981" },
  { key: "ELECTRICAL",   label: "Electrical",   color: "#f59e0b" },
  { key: "FABRICATION",  label: "Fabrication",  color: "#ef4444" },
  { key: "FOUNDATION",   label: "Foundation",   color: "#14b8a6" },
  { key: "HARDWARE",     label: "Hardware",     color: "#f97316" },
  { key: "PACKING_MTR",  label: "Packing Mtr",  color: "#ec4899" },
  { key: "PAINT",        label: "Paint",        color: "#6366f1" },
  { key: "POWDER",       label: "Powder",       color: "#84cc16" },
  { key: "SHEET",        label: "Sheet",        color: "#06b6d4" },
  { key: "SHEET_METAL",  label: "Sheet Metal",  color: "#a78bfa" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtNum = (n) => {
  if (!n && n !== 0) return "₹0";
  return "₹" + Number(n).toLocaleString("en-IN");
};
const shortFmt = (n) => {
  if (n >= 10000000) return (n / 10000000).toFixed(1) + "Cr";
  if (n >= 100000)   return (n / 100000).toFixed(1) + "L";
  if (n >= 1000)     return (n / 1000).toFixed(0) + "k";
  return n;
};
const statusColor = (s) => s === "1" ? "#22c55e" : "#ef4444";

// ─── Shared: Spinner ──────────────────────────────────────────────────────────
const Spinner = ({ t, msg = "Loading…" }) => (
  <div style={{ textAlign: "center", padding: 80, color: t.subtext }}>
    <div style={{
      width: 44, height: 44, border: `4px solid ${t.border}`,
      borderTop: `4px solid ${t.accent}`, borderRadius: "50%",
      animation: "spin 0.8s linear infinite", margin: "0 auto 14px"
    }} />
    <div style={{ fontSize: 13 }}>{msg}</div>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

// ─── Shared: Card ─────────────────────────────────────────────────────────────
const Card = ({ t, children, style = {} }) => (
  <div style={{
    background: t.card, border: `1px solid ${t.border}`,
    borderRadius: 12, overflow: "hidden",
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)", ...style
  }}>{children}</div>
);

const CardHeader = ({ t, children, extra }) => (
  <div style={{
    background: t.header, padding: "11px 16px",
    display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8
  }}>
    <div style={{ fontSize: 11, fontWeight: 700, color: "#fff", letterSpacing: 1, textTransform: "uppercase" }}>
      {children}
    </div>
    {extra}
  </div>
);

// ─── Shared: GridWrap ─────────────────────────────────────────────────────────
const GridWrap = ({ t, height = 460, children }) => (
  <div className="ag-theme-alpine" style={{
    height, width: "100%",
    "--ag-background-color": t.gridBg,
    "--ag-header-background-color": t.tableHead,
    "--ag-header-foreground-color": "#fff",
    "--ag-foreground-color": t.text,
    "--ag-border-color": t.border,
    "--ag-odd-row-background-color": t.tableRow,
    "--ag-row-hover-color": t === LIGHT ? "#eff6ff" : "#1e3a5f33",
  }}>{children}</div>
);

// ─── Shared: Grid action buttons ──────────────────────────────────────────────
const GridActions = ({ gridRef, fileName }) => {
  const exportCsv = () => gridRef.current?.api?.exportDataAsCsv({
    fileName: `${fileName}_${new Date().toISOString().split("T")[0]}.csv`
  });
  const autoSize = () => {
    const ids = gridRef.current?.api?.getColumns()?.map(c => c.getId()) || [];
    if (ids.length) gridRef.current.api.autoSizeColumns(ids, false);
  };
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button onClick={exportCsv} style={{ padding: "5px 12px", background: "#22c55e", border: "none", borderRadius: 5, color: "#fff", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>Export CSV</button>
      <button onClick={autoSize}  style={{ padding: "5px 12px", background: "#f59e0b", border: "none", borderRadius: 5, color: "#fff", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>Auto Size</button>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── TAB 1: Dashboard 1 — PO Status ─────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
const Dashboard1 = ({ t }) => {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const gridRef = useRef();

  useEffect(() => {
    fetch("https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/dashboard1Api.php")
      .then(r => r.json())
      .then(res => { if (res.status && Array.isArray(res.data)) setData(res.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const summary = useMemo(() => {
    const s = {};
    PO_CATEGORIES.forEach(cat => { s[cat] = { total: 0, done: 0, pending: 0 }; });
    data.forEach(row => {
      PO_CATEGORIES.forEach(cat => {
        const arr = row[cat] || [];
        s[cat].total   += arr.length;
        s[cat].done    += arr.filter(p => p.po_status === "1").length;
        s[cat].pending += arr.filter(p => p.po_status === "0").length;
      });
    });
    return s;
  }, [data]);

  const cols = useMemo(() => [
    {
      field: "count", headerName: "#", width: 55, pinned: "left",
      cellStyle: { fontWeight: 700, fontSize: 12, color: t.subtext }
    },
    {
      field: "file_name", headerName: "File Name", width: 190, pinned: "left",
      filter: "agTextColumnFilter", floatingFilter: true,
      cellStyle: { fontWeight: 700, color: t.accent, fontSize: 12 }
    },
    ...PO_CATEGORIES.map((cat, ci) => ({
      field: cat, headerName: PO_LABELS[ci], width: 160,
      filter: false,
      cellRenderer: (params) => {
        const arr = params.value || [];
        if (!arr.length) return <span style={{ color: t.subtext, fontSize: 11 }}>—</span>;
        return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 3, padding: "3px 0" }}>
            {arr.map((po, i) => (
              <span key={i} title={po.po_id} style={{
                background: statusColor(po.po_status), color: "#fff",
                borderRadius: 4, padding: "1px 6px", fontSize: 10, fontWeight: 700,
                maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis",
                whiteSpace: "nowrap", display: "inline-block"
              }}>
                {po.po_id}
              </span>
            ))}
          </div>
        );
      },
      autoHeight: true,
    })),
  ], [t]);

  const filtered = useMemo(() =>
    search ? data.filter(r => r.file_name?.toLowerCase().includes(search.toLowerCase())) : data
  , [data, search]);

  if (loading) return <Spinner t={t} msg="Loading PO Status data…" />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Summary cards */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {PO_CATEGORIES.map((cat, i) => {
          const s = summary[cat];
          const pct = s.total > 0 ? Math.round((s.done / s.total) * 100) : 0;
          return (
            <div key={cat} style={{
              background: t.card, border: `1px solid ${t.border}`, borderRadius: 10,
              padding: "12px 16px", flex: 1, minWidth: 140,
              borderLeft: `4px solid ${PO_COLORS[i]}`,
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: t.subtext, textTransform: "uppercase", letterSpacing: 0.5 }}>{PO_LABELS[i]}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: PO_COLORS[i], marginTop: 4 }}>{s.total}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 4, fontSize: 11 }}>
                <span style={{ color: "#22c55e", fontWeight: 600 }}>✓ {s.done}</span>
                <span style={{ color: "#ef4444", fontWeight: 600 }}>✗ {s.pending}</span>
                <span style={{ color: t.subtext }}>{pct}%</span>
              </div>
              <div style={{ height: 4, background: t.border, borderRadius: 2, marginTop: 6 }}>
                <div style={{ height: 4, width: `${pct}%`, background: PO_COLORS[i], borderRadius: 2, transition: "width 0.6s ease" }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend + search */}
      <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: t.subtext, fontWeight: 600 }}>PO Status:</span>
        {[["#22c55e","Done"],["#ef4444","Pending"]].map(([color, label]) => (
          <span key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: t.text }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: color, display: "inline-block" }} /> {label}
          </span>
        ))}
        <span style={{ marginLeft: "auto" }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search file name…"
            style={{
              padding: "6px 12px", borderRadius: 6, border: `1px solid ${t.border}`,
              background: t.card, color: t.text, fontSize: 12, outline: "none", width: 230
            }}
          />
        </span>
      </div>

      {/* Grid */}
      <Card t={t}>
        <CardHeader t={t} extra={<GridActions gridRef={gridRef} fileName="Dashboard1_PO_Status" />}>
          PO STATUS BY PROJECT &nbsp;<span style={{ fontWeight: 400, opacity: 0.7 }}>({filtered.length} records)</span>
        </CardHeader>
        <GridWrap t={t} height={520}>
          <AgGridReact
            ref={gridRef} rowData={filtered} columnDefs={cols}
            defaultColDef={{ sortable: true, resizable: true }}
            pagination paginationPageSize={15}
            animateRows rowHeight={52} headerHeight={44}
            enableCellTextSelection
          />
        </GridWrap>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── TAB 2: Dashboard 2 — Material PO vs BOM ─────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
const Dashboard2 = ({ t }) => {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const gridRef = useRef();

  useEffect(() => {
    fetch("https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/dashboard2Api.php")
      .then(r => r.json())
      .then(res => { if (res.status && Array.isArray(res.data)) setData(res.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totals = useMemo(() => {
    const acc = { design_bom: 0, total_PO: 0, diff: 0 };
    D2_FIELDS.forEach(f => { acc[f.key] = 0; });
    data.forEach(r => {
      acc.design_bom += Number(String(r.design_bom || "0").replace(/,/g, "")) || 0;
      acc.total_PO   += Number(r.total_PO) || 0;
      acc.diff       += Number(r.Difference_between_designbom_and_totalPO) || 0;
      D2_FIELDS.forEach(f => { acc[f.key] += Number(r[f.key]) || 0; });
    });
    return acc;
  }, [data]);

  const chartData = useMemo(() =>
    [...data]
      .sort((a, b) => (Number(b.total_PO) || 0) - (Number(a.total_PO) || 0))
      .slice(0, 15)
      .map(r => ({
        name: r.FILE_NAME?.length > 14 ? r.FILE_NAME.substring(0, 13) + "…" : r.FILE_NAME,
        "Design BOM": Number(String(r.design_bom || "0").replace(/,/g, "")) || 0,
        "Total PO":   Number(r.total_PO) || 0,
        "Difference": Number(r.Difference_between_designbom_and_totalPO) || 0,
      }))
  , [data]);

  const cols = useMemo(() => [
    { field: "id", headerName: "#", width: 60, pinned: "left", cellStyle: { fontWeight: 700, fontSize: 12, color: t.subtext } },
    { field: "FILE_NAME", headerName: "File Name", width: 200, pinned: "left", filter: "agTextColumnFilter", floatingFilter: true, cellStyle: { fontWeight: 700, color: t.accent, fontSize: 12 } },
    ...D2_FIELDS.map(f => ({
      field: f.key, headerName: f.label, width: 130,
      filter: "agNumberColumnFilter", floatingFilter: true,
      valueFormatter: p => p.value ? Number(p.value).toLocaleString("en-IN") : "0",
      cellStyle: p => ({ textAlign: "right", fontSize: 12, fontWeight: Number(p.value) > 0 ? 700 : 400, color: Number(p.value) > 0 ? f.color : t.subtext })
    })),
    {
      field: "design_bom", headerName: "Design BOM", width: 140,
      filter: "agNumberColumnFilter", floatingFilter: true,
      valueFormatter: p => p.value ? Number(String(p.value).replace(/,/g,"")).toLocaleString("en-IN") : "0",
      cellStyle: { textAlign: "right", fontSize: 12, fontWeight: 700, color: "#8b5cf6" }
    },
    {
      field: "total_PO", headerName: "Total PO", width: 140, pinned: "right",
      filter: "agNumberColumnFilter", floatingFilter: true,
      valueFormatter: p => p.value ? Number(p.value).toLocaleString("en-IN") : "0",
      cellStyle: { textAlign: "right", fontSize: 12, fontWeight: 800, color: t.text }
    },
    {
      field: "Difference_between_designbom_and_totalPO", headerName: "Difference", width: 130, pinned: "right",
      filter: "agNumberColumnFilter", floatingFilter: true,
      valueFormatter: p => p.value ? Number(p.value).toLocaleString("en-IN") : "0",
      cellStyle: p => ({ textAlign: "right", fontSize: 12, fontWeight: 700, color: Number(p.value) > 0 ? "#22c55e" : "#ef4444" })
    },
  ], [t]);

  if (loading) return <Spinner t={t} msg="Loading Dashboard 2 data…" />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Hero cards */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {[
          { label: "Design BOM Total",  value: fmtNum(totals.design_bom), sub: `${data.length} projects`, grad: "135deg,#1e3a5f,#2563eb", glow: "rgba(37,99,235,0.3)" },
          { label: "Total PO Raised",   value: fmtNum(totals.total_PO),   sub: "",                        grad: "135deg,#10b981,#059669", glow: "rgba(16,185,129,0.3)" },
          { label: "Balance (BOM − PO)",value: fmtNum(totals.diff),       sub: "",                        grad: "135deg,#f59e0b,#d97706", glow: "rgba(245,158,11,0.3)" },
        ].map(c => (
          <div key={c.label} style={{
            background: `linear-gradient(${c.grad})`, borderRadius: 10,
            padding: "16px 22px", flex: 1, minWidth: 200,
            boxShadow: `0 4px 16px ${c.glow}`
          }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{c.label}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", marginTop: 6 }}>{c.value}</div>
            {c.sub && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{c.sub}</div>}
          </div>
        ))}
      </div>

      {/* Per-type summary cards — only non-zero */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {D2_FIELDS.filter(f => totals[f.key] > 0).map(f => (
          <div key={f.key} style={{
            background: t.card, border: `1px solid ${t.border}`, borderRadius: 10,
            padding: "12px 16px", flex: 1, minWidth: 140,
            borderLeft: `4px solid ${f.color}`, boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
          }}>
            <div style={{ fontSize: 10, color: t.subtext, fontWeight: 700, textTransform: "uppercase" }}>{f.label}</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: f.color, marginTop: 4 }}>{fmtNum(totals[f.key])}</div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <Card t={t}>
        <CardHeader t={t}>TOP 15 PROJECTS — DESIGN BOM vs TOTAL PO</CardHeader>
        <div style={{ padding: 16 }}>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={t.border} />
              <XAxis dataKey="name" tick={{ fill: t.subtext, fontSize: 10 }} angle={-30} textAnchor="end" />
              <YAxis tickFormatter={shortFmt} tick={{ fill: t.subtext, fontSize: 11 }} />
              <Tooltip formatter={(v) => fmtNum(v)} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Design BOM" fill="#8b5cf6" barSize={18} />
              <Bar dataKey="Total PO"   fill="#3b82f6" barSize={18} />
              <Bar dataKey="Difference" fill="#22c55e" barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Grid */}
      <Card t={t}>
        <CardHeader t={t} extra={<GridActions gridRef={gridRef} fileName="Dashboard2_Material_PO" />}>
          MATERIAL PO VS DESIGN BOM &nbsp;<span style={{ fontWeight: 400, opacity: 0.7 }}>({data.length} records)</span>
        </CardHeader>
        <GridWrap t={t} height={500}>
          <AgGridReact
            ref={gridRef} rowData={data} columnDefs={cols}
            defaultColDef={{ sortable: true, resizable: true }}
            pagination paginationPageSize={15}
            animateRows rowHeight={38} headerHeight={44}
            enableCellTextSelection
          />
        </GridWrap>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── TAB 3: Design BOM ───────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
const DesignBom = ({ t }) => {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const gridRef = useRef();

  useEffect(() => {
    fetch("https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/DesignBomApi.php")
      .then(r => r.json())
      .then(res => { if (res.status && Array.isArray(res.data)) setData(res.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const bomTotal = useMemo(() =>
    data.reduce((s, r) => s + (Number(String(r.bom || "0").replace(/,/g, "")) || 0), 0)
  , [data]);

  const chartData = useMemo(() =>
    [...data]
      .sort((a, b) => (Number(String(b.bom||"0").replace(/,/g,""))||0) - (Number(String(a.bom||"0").replace(/,/g,""))||0))
      .slice(0, 20)
      .map(r => ({
        name: r.file_name?.length > 14 ? r.file_name.substring(0, 13) + "…" : r.file_name,
        BOM:  Number(String(r.bom || "0").replace(/,/g, "")) || 0,
      }))
  , [data]);

  const filtered = useMemo(() =>
    search ? data.filter(r => r.file_name?.toLowerCase().includes(search.toLowerCase())) : data
  , [data, search]);

  const cols = useMemo(() => [
    { field: "id", headerName: "#", width: 70, pinned: "left", cellStyle: { fontWeight: 700, fontSize: 12, color: t.subtext } },
    {
      field: "file_name", headerName: "File Name", flex: 1, minWidth: 240, pinned: "left",
      filter: "agTextColumnFilter", floatingFilter: true,
      cellStyle: { fontWeight: 700, color: t.accent, fontSize: 13 }
    },
    {
      field: "bom", headerName: "BOM Amount (₹)", flex: 1, minWidth: 260,
      filter: "agTextColumnFilter", floatingFilter: true,
      cellRenderer: params => {
        const raw = Number(String(params.value || "0").replace(/,/g, "")) || 0;
        const pct = bomTotal > 0 ? Math.min((raw / bomTotal) * 100 * 5, 100) : 0;
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 10, height: "100%" }}>
            <div style={{ flex: 1, height: 8, background: t.border, borderRadius: 4 }}>
              <div style={{ height: 8, width: `${pct}%`, background: t.accent, borderRadius: 4 }} />
            </div>
            <span style={{ fontWeight: 800, fontSize: 13, color: t.text, minWidth: 120, textAlign: "right" }}>
              ₹{raw.toLocaleString("en-IN")}
            </span>
          </div>
        );
      }
    }
  ], [t, bomTotal]);

  if (loading) return <Spinner t={t} msg="Loading Design BOM data…" />;

  const maxBom = Math.max(...data.map(r => Number(String(r.bom || "0").replace(/,/g, "")) || 0));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Stat cards */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        {[
          { label: "Total Design BOM",        value: fmtNum(bomTotal),                                                  sub: `${data.length} projects`, color: "#2563eb", bg: "linear-gradient(135deg,#1e3a5f,#2563eb)", glow: "rgba(37,99,235,0.25)" },
          { label: "Average BOM / Project",   value: fmtNum(data.length ? Math.round(bomTotal / data.length) : 0),     sub: "",                        color: t.accent,  bg: t.card, border: true },
          { label: "Highest BOM",             value: fmtNum(maxBom),                                                   sub: "",                        color: "#10b981", bg: t.card, border: true },
        ].map(c => (
          <div key={c.label} style={{
            background: c.bg, borderRadius: 10, padding: "16px 24px", flex: 1, minWidth: 200,
            boxShadow: c.glow ? `0 4px 16px ${c.glow}` : "0 2px 8px rgba(0,0,0,0.05)",
            border: c.border ? `1px solid ${t.border}` : "none"
          }}>
            <div style={{ fontSize: 11, color: c.bg === t.card ? t.subtext : "rgba(255,255,255,0.6)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{c.label}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: c.bg === t.card ? c.color : "#fff", marginTop: 6 }}>{c.value}</div>
            {c.sub && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{c.sub}</div>}
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <Card t={t}>
        <CardHeader t={t}>TOP 20 PROJECTS BY DESIGN BOM</CardHeader>
        <div style={{ padding: 16 }}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={t.border} />
              <XAxis dataKey="name" tick={{ fill: t.subtext, fontSize: 10 }} angle={-30} textAnchor="end" />
              <YAxis tickFormatter={shortFmt} tick={{ fill: t.subtext, fontSize: 11 }} />
              <Tooltip formatter={(v) => fmtNum(v)} />
              <Bar dataKey="BOM" fill={t.accent} barSize={24} radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Search + Grid */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search file name…"
          style={{
            padding: "7px 14px", borderRadius: 6, border: `1px solid ${t.border}`,
            background: t.card, color: t.text, fontSize: 12, outline: "none", width: 260
          }}
        />
      </div>

      <Card t={t}>
        <CardHeader t={t} extra={<GridActions gridRef={gridRef} fileName="DesignBOM" />}>
          DESIGN BOM LIST &nbsp;<span style={{ fontWeight: 400, opacity: 0.7 }}>({filtered.length} records)</span>
        </CardHeader>
        <GridWrap t={t} height={520}>
          <AgGridReact
            ref={gridRef} rowData={filtered} columnDefs={cols}
            defaultColDef={{ sortable: true, resizable: true }}
            pagination paginationPageSize={20}
            animateRows rowHeight={44} headerHeight={44}
            enableCellTextSelection
          />
        </GridWrap>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── MAIN ────────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export default function SuryaDashboard() {
  const [theme, setTheme]       = useState("light");
  const [activeTab, setActiveTab] = useState("dash1");
  const t = theme === "light" ? LIGHT : DARK;

  const TABS = [
    { id: "dash1",     label: "Dashboard 1"  },
    { id: "dash2",     label: "Dashboard 2"  },
    { id: "designbom", label: "Design BOM"   },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: t.bg, color: t.text,
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      transition: "background 0.3s, color 0.3s"
    }}>
      {/* ── HEADER ── */}
      <div style={{
        background: t.header, padding: "0 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 56, boxShadow: "0 2px 16px rgba(0,0,0,0.2)",
        position: "sticky", top: 0, zIndex: 100
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: "rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 900, color: "#fff"
          }}>S</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: "#fff", letterSpacing: 0.5 }}>SURYA ERP Dashboard</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", letterSpacing: 1 }}>EQUIPMENT MANAGEMENT SYSTEM</div>
          </div>
        </div>
        <button
          onClick={() => setTheme(th => th === "light" ? "dark" : "light")}
          style={{
            padding: "6px 14px", border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: 6, background: "rgba(255,255,255,0.1)",
            color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer"
          }}
        >
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
      </div>

      {/* ── TABS ── */}
      <div style={{
        background: t.card, borderBottom: `1px solid ${t.border}`,
        display: "flex", paddingLeft: 16,
        position: "sticky", top: 56, zIndex: 99
      }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: "13px 24px", border: "none", background: "transparent",
            fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap",
            color: activeTab === tab.id ? t.accent : t.subtext,
            borderBottom: activeTab === tab.id ? `3px solid ${t.accent}` : "3px solid transparent",
            transition: "all 0.2s"
          }}>{tab.label}</button>
        ))}
      </div>

      {/* ── CONTENT ── */}
      <div style={{ padding: 24, maxWidth: 1600, margin: "0 auto" }}>
        {activeTab === "dash1"     && <Dashboard1 t={t} />}
        {activeTab === "dash2"     && <Dashboard2 t={t} />}
        {activeTab === "designbom" && <DesignBom  t={t} />}
      </div>
    </div>
  );
}