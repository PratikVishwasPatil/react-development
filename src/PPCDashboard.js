import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as ReTooltip, Legend, ResponsiveContainer
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

// ─── Theme ────────────────────────────────────────────────────────────────────
const LIGHT = {
  bg: "#f0f4f8",
  card: "#ffffff",
  border: "#dde3ec",
  text: "#1a2332",
  subtext: "#64748b",
  header: "linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%)",
  accent: "#2563eb",
  tableHead: "#1e3a5f",
  tableRow: "#f8fafc",
  tableRowAlt: "#ffffff",
  gridBg: "#f8fafc",
};
const DARK = {
  bg: "#0d1117",
  card: "#161b22",
  border: "#30363d",
  text: "#e6edf3",
  subtext: "#8b949e",
  header: "linear-gradient(135deg,#0d1117 0%,#1f2937 100%)",
  accent: "#58a6ff",
  tableHead: "#0d1117",
  tableRow: "#161b22",
  tableRowAlt: "#1a2332",
  gridBg: "#161b22",
};

// ─── PPC cost-type colours ────────────────────────────────────────────────────
const PPC_FIELDS = [
  { key: "sheet_metal",          label: "Sheet Metal",         color: "#3b82f6" },
  { key: "foundation_fab",       label: "Foundation Fab",      color: "#8b5cf6" },
  { key: "champion_sheet_metal", label: "Champion Sheet Metal",color: "#10b981" },
  { key: "assembly_amt",         label: "Assembly",            color: "#f59e0b" },
  { key: "other_vendor",         label: "Other Vendor",        color: "#ef4444" },
  { key: "second_dc",            label: "Second DC",           color: "#14b8a6" },
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
const getFirstOfMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
};
const getToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
};

// ─── Summary Cards ────────────────────────────────────────────────────────────
const SummaryCards = ({ data, t }) => {
  const totals = PPC_FIELDS.reduce((acc, f) => {
    acc[f.key] = data.reduce((s, r) => s + (Number(r[f.key]) || 0), 0);
    return acc;
  }, {});
  const grandTotal = data.reduce((s, r) => s + (Number(r.total) || 0), 0);

  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      {PPC_FIELDS.map(f => (
        <div key={f.key} style={{
          background: t.card, border: `1px solid ${t.border}`,
          borderRadius: 10, padding: "14px 18px", flex: 1, minWidth: 160,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          borderLeft: `4px solid ${f.color}`
        }}>
          <div style={{ fontSize: 10, color: t.subtext, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
            {f.label}
          </div>
          <div style={{ fontSize: 17, fontWeight: 800, color: f.color, marginTop: 6 }}>
            {fmtNum(totals[f.key])}
          </div>
        </div>
      ))}
      <div style={{
        background: "linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%)",
        borderRadius: 10, padding: "14px 18px", flex: 1, minWidth: 160,
        boxShadow: "0 4px 14px rgba(37,99,235,0.3)"
      }}>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
          Grand Total
        </div>
        <div style={{ fontSize: 17, fontWeight: 800, color: "#fff", marginTop: 6 }}>
          {fmtNum(grandTotal)}
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>
          {data.length} projects
        </div>
      </div>
    </div>
  );
};

// ─── Product Bar Chart ────────────────────────────────────────────────────────
const ProductChart = ({ data, t }) => {
  const productMap = {};
  data.forEach(r => {
    const p = r.product_name || "Unknown";
    if (!productMap[p]) {
      productMap[p] = { product: p };
      PPC_FIELDS.forEach(f => { productMap[p][f.key] = 0; });
    }
    PPC_FIELDS.forEach(f => { productMap[p][f.key] += Number(r[f.key]) || 0; });
  });
  const chartData = Object.values(productMap).sort((a, b) =>
    PPC_FIELDS.reduce((s, f) => s + b[f.key] - a[f.key], 0)
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        background: t.card, border: `1px solid ${t.border}`,
        borderRadius: 8, padding: "10px 14px", fontSize: 11, maxWidth: 230
      }}>
        <div style={{ fontWeight: 700, color: t.text, marginBottom: 6 }}>{label}</div>
        {payload.filter(p => p.value > 0).map((p, i) => (
          <div key={i} style={{ color: p.fill, marginBottom: 2 }}>
            {p.name}: {fmtNum(p.value)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{
      background: t.card, border: `1px solid ${t.border}`,
      borderRadius: 12, overflow: "hidden",
      boxShadow: "0 2px 12px rgba(0,0,0,0.07)"
    }}>
      <div style={{
        background: t.header, padding: "10px 16px",
        fontSize: 11, fontWeight: 700, color: "#fff", letterSpacing: 1
      }}>PRODUCT-WISE PPC COST BREAKDOWN</div>
      <div style={{ padding: 16 }}>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: 20, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={t.border} />
            <XAxis dataKey="product" tick={{ fill: t.subtext, fontSize: 11 }} angle={-20} textAnchor="end" />
            <YAxis tickFormatter={shortFmt} tick={{ fill: t.subtext, fontSize: 11 }} />
            <ReTooltip content={<CustomTooltip />} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            {PPC_FIELDS.map(f => (
              <Bar key={f.key} dataKey={f.key} name={f.label} fill={f.color} stackId="a" barSize={32} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ─── AG Grid ──────────────────────────────────────────────────────────────────
const PpcGrid = ({ data, t }) => {
  const gridRef = useRef();

  const cols = useMemo(() => [
    {
      field: "file_name", headerName: "File Name", width: 180, pinned: "left",
      filter: "agTextColumnFilter", floatingFilter: true,
      cellStyle: { fontWeight: 700, color: t.accent, fontSize: 12 }
    },
    {
      field: "product_name", headerName: "Product", width: 130,
      filter: "agTextColumnFilter", floatingFilter: true,
      cellStyle: { fontSize: 12, fontWeight: 600, color: t.text }
    },
    ...PPC_FIELDS.map(f => ({
      field: f.key, headerName: f.label, width: 150,
      filter: "agNumberColumnFilter", floatingFilter: true,
      valueFormatter: p => p.value ? Number(p.value).toLocaleString("en-IN") : "0",
      cellStyle: { textAlign: "right", fontSize: 12, color: f.color, fontWeight: 600 }
    })),
    {
      field: "total", headerName: "Total", width: 150, pinned: "right",
      filter: "agNumberColumnFilter", floatingFilter: true,
      valueFormatter: p => p.value ? Number(p.value).toLocaleString("en-IN") : "0",
      cellStyle: { textAlign: "right", fontSize: 12, fontWeight: 800, color: t.text }
    },
  ], [t]);

  const defaultColDef = useMemo(() => ({
    sortable: true, resizable: true, suppressHeaderMenuButton: false
  }), []);

  const exportCsv = () => gridRef.current?.api?.exportDataAsCsv({
    fileName: `PPC_Dashboard_${new Date().toISOString().split("T")[0]}.csv`
  });
  const autoSize = () => {
    const ids = gridRef.current?.api?.getColumns()?.map(c => c.getId()) || [];
    if (ids.length) gridRef.current.api.autoSizeColumns(ids, false);
  };

  const grandTotal = data.reduce((s, r) => s + (Number(r.total) || 0), 0);

  return (
    <div style={{
      background: t.card, border: `1px solid ${t.border}`,
      borderRadius: 12, overflow: "hidden",
      boxShadow: "0 2px 12px rgba(0,0,0,0.07)"
    }}>
      <div style={{
        background: t.header, padding: "12px 16px",
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", letterSpacing: 1 }}>
            PPC PROJECT-WISE DETAILS
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>
            {data.length} records · Grand Total: {fmtNum(grandTotal)}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={exportCsv} style={{
            padding: "6px 14px", background: "#22c55e", border: "none",
            borderRadius: 6, color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer"
          }}>Export CSV</button>
          <button onClick={autoSize} style={{
            padding: "6px 14px", background: "#f59e0b", border: "none",
            borderRadius: 6, color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer"
          }}>Auto Size</button>
        </div>
      </div>
      <div
        className="ag-theme-alpine"
        style={{
          height: 460, width: "100%",
          "--ag-background-color": t.gridBg,
          "--ag-header-background-color": t.tableHead,
          "--ag-header-foreground-color": "#fff",
          "--ag-foreground-color": t.text,
          "--ag-border-color": t.border,
          "--ag-odd-row-background-color": t.tableRow,
          "--ag-row-hover-color": t === LIGHT ? "#eff6ff" : "#1e3a5f33"
        }}
      >
        <AgGridReact
          ref={gridRef}
          rowData={data}
          columnDefs={cols}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationPageSize={15}
          animateRows={true}
          rowHeight={38}
          headerHeight={44}
          enableCellTextSelection={true}
        />
      </div>
    </div>
  );
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function PpcDashboard() {
  const [theme, setTheme] = useState("light");
  const t = theme === "light" ? LIGHT : DARK;

  const [years, setYears] = useState([{ value: "25-26", label: "2025-26" }]);
  const [selectedYear, setSelectedYear] = useState("25-26");
  const [sdate, setSdate] = useState(getFirstOfMonth());
  const [edate, setEdate] = useState(getToday());
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastTime, setLastTime] = useState(null);
  const [count, setCount] = useState(0);

  // Fetch financial years
  useEffect(() => {
    fetch("https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/GetYearsApi.php")
      .then(r => r.json())
      .then(res => {
        if (res.status === "success" && Array.isArray(res.data)) {
          const y = res.data.map(d => ({ value: d.financial_year, label: `20${d.financial_year}` }));
          setYears(y);
          if (y.length) setSelectedYear(y[y.length - 1].value);
        }
      })
      .catch(() => {});
  }, []);

  const fetchData = useCallback(() => {
    setLoading(true);
    const url = `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/getPpcDashboardApi.php?financial_year=${selectedYear}&&sdate=${sdate}&&edate=${edate}`;
    fetch(url)
      .then(r => r.json())
      .then(res => {
        if (res.status && Array.isArray(res.data)) {
          setData(res.data);
          setCount(res.count || res.data.length);
          setLastTime(res.lastTime || null);
        } else {
          setData([]);
          setCount(0);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedYear, sdate, edate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const inputStyle = {
    padding: "6px 12px", borderRadius: 6,
    border: `1px solid rgba(255,255,255,0.3)`,
    background: "rgba(255,255,255,0.15)", color: "#fff",
    fontSize: 13, outline: "none", cursor: "pointer",
    colorScheme: "dark"
  };

  const PRESETS = [
    { label: "This Month", s: getFirstOfMonth(), e: getToday() },
    { label: "Last 7 Days", s: daysAgo(7), e: getToday() },
    { label: "Last 30 Days", s: daysAgo(30), e: getToday() },
    { label: "Last 90 Days", s: daysAgo(90), e: getToday() },
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
            <div style={{ fontWeight: 800, fontSize: 16, color: "#fff", letterSpacing: 0.5 }}>
              SURYA ERP — PPC Dashboard
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", letterSpacing: 1 }}>
              PRODUCTION PLANNING & CONTROL
            </div>
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

      {/* ── FILTER BAR ── */}
      <div style={{
        background: t.header,
        padding: "14px 24px",
        display: "flex", alignItems: "flex-end", gap: 16, flexWrap: "wrap",
        borderBottom: "3px solid rgba(255,255,255,0.1)"
      }}>
        {/* Year */}
        <div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
            Financial Year
          </div>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            style={{ ...inputStyle, fontWeight: 700 }}
          >
            {years.map(y => (
              <option key={y.value} value={y.value} style={{ color: "#000", background: "#fff" }}>
                {y.label}
              </option>
            ))}
          </select>
        </div>

        {/* From date */}
        <div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
            From Date
          </div>
          <input type="date" value={sdate} onChange={e => setSdate(e.target.value)} style={inputStyle} />
        </div>

        {/* To date */}
        <div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
            To Date
          </div>
          <input type="date" value={edate} onChange={e => setEdate(e.target.value)} style={inputStyle} />
        </div>

        {/* Apply */}
        <button
          onClick={fetchData}
          disabled={loading}
          style={{
            padding: "7px 22px",
            background: loading ? "rgba(255,255,255,0.2)" : "#22c55e",
            border: "none", borderRadius: 6, color: "#fff",
            fontWeight: 700, fontSize: 13,
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background 0.2s"
          }}
        >
          {loading ? "Loading…" : "🔍 Apply"}
        </button>

        {/* Quick presets */}
        <div style={{ display: "flex", gap: 6, alignItems: "flex-end", flexWrap: "wrap" }}>
          {PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => { setSdate(p.s); setEdate(p.e); }}
              style={{
                padding: "6px 12px",
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.25)",
                borderRadius: 20, color: "rgba(255,255,255,0.85)",
                fontSize: 11, fontWeight: 600, cursor: "pointer",
                transition: "background 0.15s"
              }}
              onMouseEnter={e => e.target.style.background = "rgba(255,255,255,0.25)"}
              onMouseLeave={e => e.target.style.background = "rgba(255,255,255,0.12)"}
            >{p.label}</button>
          ))}
        </div>

        {/* Meta info */}
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>
            {count} record{count !== 1 ? "s" : ""} found
          </div>
          {lastTime && (
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
              Last upload: {lastTime}
            </div>
          )}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ padding: 24, maxWidth: 1600, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: t.subtext }}>
            <div style={{
              width: 44, height: 44, border: `4px solid ${t.border}`,
              borderTop: `4px solid ${t.accent}`, borderRadius: "50%",
              animation: "spin 0.8s linear infinite", margin: "0 auto 14px"
            }} />
            <div style={{ fontSize: 14 }}>Loading PPC data…</div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : data.length === 0 ? (
          <div style={{
            textAlign: "center", padding: 70,
            background: t.card, borderRadius: 12, border: `1px solid ${t.border}`,
            color: t.subtext
          }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📊</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>No data found for selected range</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Try adjusting the date range or financial year</div>
          </div>
        ) : (
          <>
            <SummaryCards data={data} t={t} />
            <ProductChart data={data} t={t} />
            <PpcGrid data={data} t={t} />
          </>
        )}
      </div>
    </div>
  );
}