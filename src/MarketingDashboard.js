import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  PieChart, Pie, Cell, Tooltip as ReTooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
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

// ─── Theme ───────────────────────────────────────────────────────────────────
const LIGHT = {
  bg: "#f0f4f8",
  card: "#ffffff",
  border: "#dde3ec",
  text: "#1a2332",
  subtext: "#64748b",
  header: "linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%)",
  accent: "#2563eb",
  accentHover: "#1d4ed8",
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
  accentHover: "#79b8ff",
  tableHead: "#0d1117",
  tableRow: "#161b22",
  tableRowAlt: "#1a2332",
  gridBg: "#161b22",
};

// ─── Colours ─────────────────────────────────────────────────────────────────
const PIE_COLORS = ["#3b82f6","#8b5cf6","#10b981","#f59e0b","#ef4444","#14b8a6","#f97316"];
const OWNERS = ["SVJ","AGP","RPK","PAL","VVD","HMT","VDK"];
const PRODUCT_LABELS = ["MMS","MMSS","FxRx","ASRS","HDPR","Vertical Carousel","Miscellaneous","Spares","Labour Only","AMC","Mezzanine"];
const BAR_COLORS = ["#3b82f6","#8b5cf6","#10b981","#f59e0b","#ef4444","#14b8a6","#f97316","#ec4899","#6366f1","#84cc16","#06b6d4"];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n) => {
  if (n === undefined || n === null) return "0";
  if (typeof n === "string") return n;
  return "₹" + n.toLocaleString("en-IN");
};
const fmtNum = (n) => {
  if (!n) return "₹0";
  return "₹" + Number(n).toLocaleString("en-IN");
};
const shortFmt = (n) => {
  if (n >= 10000000) return (n / 10000000).toFixed(1) + "Cr";
  if (n >= 100000) return (n / 100000).toFixed(1) + "L";
  if (n >= 1000) return (n / 1000).toFixed(0) + "k";
  return n;
};

// ─── StatCard ────────────────────────────────────────────────────────────────
const StatCard = ({ title, rows, t }) => (
  <div style={{
    background: t.card, border: `1px solid ${t.border}`,
    borderRadius: 12, overflow: "hidden",
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)", flex: 1, minWidth: 220
  }}>
    <div style={{
      background: t.header, padding: "10px 16px",
      fontSize: 11, fontWeight: 700, color: "#fff",
      letterSpacing: 1, textTransform: "uppercase"
    }}>{title}</div>
    <div style={{ padding: "8px 0" }}>
      {rows.map((r, i) => (
        <div key={i} style={{
          display: "flex", justifyContent: "space-between",
          padding: "6px 16px",
          background: i % 2 === 0 ? t.tableRow : t.tableRowAlt,
          fontSize: 13
        }}>
          <span style={{ color: t.subtext }}>{i + 1}. {r.label}:</span>
          <span style={{ fontWeight: 700, color: t.text }}>{r.value}</span>
        </div>
      ))}
      <div style={{
        display: "flex", justifyContent: "space-between",
        padding: "8px 16px", borderTop: `2px solid ${t.border}`,
        fontWeight: 700, fontSize: 14, color: t.text
      }}>
        <span>Total</span>
        <span>{rows[rows.length - 1]?.total}</span>
      </div>
    </div>
  </div>
);

// ─── RightCard ───────────────────────────────────────────────────────────────
const RightCard = ({ data, t }) => {
  if (!data) return null;
  const rows = [
    { n: "Total Supply Billing", v: fmtNum(data.supply_billing), tag: data.supply_bill_no },
    { n: "Total Labour (SL1) Purchase", v: fmtNum(data.labour_purchase), tag: "" },
    { n: "Total AMC (SA) Billing", v: fmtNum(data.total_amc_billing), tag: data.amc_bill_no },
    { n: "All Total Billing", v: fmtNum(data.total_billing), tag: "-", highlight: "#fbbf24" },
    { n: "Material Consumption", v: fmtNum(data.material_consumption), tag: "-", highlight: "#22c55e" },
    { n: "Total Labour Cost PPC", v: fmtNum(data.labour_purchase), tag: "-" },
    { n: "Transport", v: fmtNum(data.transport), tag: "-" },
    { n: "Site Expense (only SA)", v: fmtNum(data.site_exp_only_SA), tag: "-" },
    { n: "Site Expense (except SA)", v: fmtNum(data.site_expense), tag: "-" },
  ];
  return (
    <div style={{
      background: t.card, border: `1px solid ${t.border}`,
      borderRadius: 12, overflow: "hidden",
      boxShadow: "0 2px 12px rgba(0,0,0,0.07)", minWidth: 320
    }}>
      <div style={{
        background: t.header, padding: "10px 16px",
        fontSize: 11, fontWeight: 700, color: "#fff",
        letterSpacing: 1
      }}>Last Updated on: {data.acc_excel_upload_time}</div>
      {rows.map((r, i) => (
        <div key={i} style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "6px 12px",
          background: r.highlight
            ? (r.highlight === "#fbbf24" ? "rgba(251,191,36,0.15)" : "rgba(34,197,94,0.15)")
            : (i % 2 === 0 ? t.tableRow : t.tableRowAlt),
          fontSize: 12, gap: 8
        }}>
          <span style={{ color: t.text, fontWeight: r.highlight ? 700 : 400 }}>
            {i + 1}. {r.n}:
          </span>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontWeight: 700, color: r.highlight || t.text }}>{r.v}</span>
            {r.tag && r.tag !== "-" && (
              <span style={{
                background: t.accent, color: "#fff",
                borderRadius: 4, padding: "1px 6px", fontSize: 10, fontWeight: 600
              }}>{r.tag}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── PieSection ──────────────────────────────────────────────────────────────
const PieSection = ({ title, data, t }) => {
  const pieData = Object.entries(data || {}).map(([name, value]) => ({ name, value }));
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      return (
        <div style={{
          background: t.card, border: `1px solid ${t.border}`,
          borderRadius: 8, padding: "10px 14px", fontSize: 12, fontWeight: 600
        }}>
          <div style={{ color: t.subtext }}>{payload[0].name}</div>
          <div style={{ color: t.text }}>{fmtNum(payload[0].value)}</div>
          <div style={{ color: t.accent }}>{(payload[0].payload.percent * 100).toFixed(1)}%</div>
        </div>
      );
    }
    return null;
  };
  return (
    <div style={{
      background: t.card, border: `1px solid ${t.border}`,
      borderRadius: 12, overflow: "hidden",
      boxShadow: "0 2px 12px rgba(0,0,0,0.07)", flex: 1, minWidth: 300
    }}>
      <div style={{
        background: t.header, padding: "10px 16px",
        fontSize: 11, fontWeight: 700, color: "#fff", letterSpacing: 1
      }}>{title}</div>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={pieData} cx="50%" cy="50%" outerRadius={90}
            dataKey="value" label={({ name, percent }) =>
              `${name}: ${(percent * 100).toFixed(1)}%`
            } labelLine={false}>
            {pieData.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <ReTooltip content={<CustomTooltip />} />
          <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// ─── OwnerProductBar ─────────────────────────────────────────────────────────
const OwnerProductBar = ({ graphData, productTypes, t }) => {
  const ownerLabels = ["SVJ", "AGP", "PAL", "VVD", "HMT", "VDK", "RPK"];
  const chartData = ownerLabels.map((owner, oi) => {
    const obj = { owner };
    productTypes.forEach((prod, pi) => {
      obj[prod] = (graphData[pi] || [])[oi] || 0;
    });
    return obj;
  });
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div style={{
          background: t.card, border: `1px solid ${t.border}`,
          borderRadius: 8, padding: "10px 14px", fontSize: 11, maxWidth: 200
        }}>
          <div style={{ fontWeight: 700, color: t.text, marginBottom: 6 }}>{label}</div>
          {payload.filter(p => p.value > 0).map((p, i) => (
            <div key={i} style={{ color: p.fill, marginBottom: 2 }}>
              {p.name}: {fmtNum(p.value)}
            </div>
          ))}
        </div>
      );
    }
    return null;
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
      }}>OWNER WISE PRODUCT PO</div>
      <div style={{ padding: 16 }}>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={t.border} />
            <XAxis dataKey="owner" tick={{ fill: t.subtext, fontSize: 11 }} />
            <YAxis tickFormatter={shortFmt} tick={{ fill: t.subtext, fontSize: 11 }} />
            <ReTooltip content={<CustomTooltip />} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            {productTypes.map((prod, i) => (
              <Bar key={prod} dataKey={prod} fill={BAR_COLORS[i % BAR_COLORS.length]}
                stackId={undefined} barSize={14} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ─── ProjectStatusGrid ────────────────────────────────────────────────────────
const ProjectStatusGrid = ({ title, data, t }) => {
  const cols = useMemo(() => [
    {
      field: "FILE_NAME", headerName: "Project", flex: 1, minWidth: 160,
      cellStyle: { fontWeight: 600, color: t.accent, cursor: "pointer", fontSize: 12 }
    },
    {
      field: "status", headerName: "Status", flex: 2, minWidth: 200,
      cellStyle: { fontSize: 12, color: t.text }
    }
  ], [t]);
  const defaultColDef = useMemo(() => ({
    sortable: true, filter: "agTextColumnFilter", floatingFilter: true, resizable: true,
    suppressHeaderMenuButton: false
  }), []);
  return (
    <div style={{
      background: t.card, border: `1px solid ${t.border}`,
      borderRadius: 12, overflow: "hidden",
      boxShadow: "0 2px 12px rgba(0,0,0,0.07)", flex: 1, minWidth: 300
    }}>
      <div style={{
        background: t.header, padding: "10px 16px",
        fontSize: 11, fontWeight: 700, color: "#fff", letterSpacing: 1
      }}>
        {title} <span style={{ fontWeight: 400, opacity: 0.8 }}>({data.length} records)</span>
      </div>
      <div
        className={t === LIGHT ? "ag-theme-alpine" : "ag-theme-alpine-dark"}
        style={{
          height: 360, width: "100%",
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
          rowData={data}
          columnDefs={cols}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationPageSize={10}
          animateRows={true}
          rowHeight={36}
          headerHeight={42}
        />
      </div>
    </div>
  );
};

// ─── BillwiseDebtors ──────────────────────────────────────────────────────────
const BillwiseDebtors = ({ t }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const gridRef = useRef();

  useEffect(() => {
    fetch("https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/BillwiseDebtorsApi.php")
      .then(r => r.json())
      .then(res => {
        if (res.status && Array.isArray(res.data)) setData(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const cols = useMemo(() => [
    {
      field: "id", headerName: "ID", width: 80, pinned: "left",
      cellStyle: { fontWeight: 700, fontSize: 12, color: t.text }
    },
    {
      field: "date", headerName: "Date", width: 130,
      valueFormatter: p => p.value ? new Date(p.value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "",
      cellStyle: { fontSize: 12 }, filter: "agDateColumnFilter", floatingFilter: true
    },
    {
      field: "ref_no", headerName: "Reference No", width: 180,
      filter: "agTextColumnFilter", floatingFilter: true,
      cellStyle: { fontSize: 12 }
    },
    {
      field: "party_name", headerName: "Party Name", flex: 1, minWidth: 250,
      filter: "agTextColumnFilter", floatingFilter: true,
      cellStyle: { fontSize: 12, color: t.text },
      tooltipField: "party_name"
    },
    {
      field: "pending", headerName: "Pending Amount", width: 160,
      filter: "agNumberColumnFilter", floatingFilter: true,
      valueFormatter: p => p.value ? Number(p.value).toLocaleString("en-IN") : "0",
      cellStyle: { textAlign: "right", fontWeight: 600, color: "#ef4444", fontSize: 12 }
    },
    {
      field: "due_on", headerName: "Due On", width: 130,
      valueFormatter: p => p.value ? new Date(p.value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "",
      cellStyle: { fontSize: 12 }, filter: "agDateColumnFilter", floatingFilter: true
    },
    {
      field: "overdue", headerName: "Overdue (Days)", width: 150,
      filter: "agNumberColumnFilter", floatingFilter: true,
      cellStyle: p => ({
        textAlign: "right", fontWeight: 700, fontSize: 12,
        color: Number(p.value) > 1000 ? "#ef4444" : Number(p.value) > 365 ? "#f59e0b" : "#22c55e"
      })
    },
    {
      field: "marketing_owner", headerName: "Marketing Owner", width: 160,
      filter: "agTextColumnFilter", floatingFilter: true,
      cellStyle: { fontSize: 12, fontWeight: 600, color: t.accent }
    },
    {
      field: "file_no", headerName: "File No", width: 160,
      filter: "agTextColumnFilter", floatingFilter: true,
      cellStyle: { fontSize: 12 }
    },
    {
      field: "comments", headerName: "Comments", width: 120,
      filter: "agTextColumnFilter", floatingFilter: true,
      cellStyle: { fontSize: 12 }
    }
  ], [t]);

  const defaultColDef = useMemo(() => ({
    sortable: true, resizable: true, suppressHeaderMenuButton: false
  }), []);

  const exportCsv = () => gridRef.current?.api?.exportDataAsCsv({
    fileName: `BillwiseDebtors_${new Date().toISOString().split("T")[0]}.csv`
  });

  const autoSize = () => {
    const ids = gridRef.current?.api?.getColumns()?.map(c => c.getId()) || [];
    if (ids.length) gridRef.current.api.autoSizeColumns(ids, false);
  };

  if (loading) return (
    <div style={{ textAlign: "center", padding: 40, color: t.subtext }}>Loading Billwise Debtors...</div>
  );

  const total = data.reduce((s, r) => s + (Number(r.pending) || 0), 0);

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
            BILLWISE DEBTORS
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>
            {data.length} records · Total Pending: {fmtNum(total)}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { label: "Export CSV", onClick: exportCsv, bg: "#22c55e" },
            { label: "Auto Size", onClick: autoSize, bg: "#f59e0b" },
          ].map(btn => (
            <button key={btn.label} onClick={btn.onClick} style={{
              padding: "6px 14px", background: btn.bg, border: "none",
              borderRadius: 6, color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer"
            }}>{btn.label}</button>
          ))}
        </div>
      </div>
      <div
        className="ag-theme-alpine"
        style={{
          height: 440, width: "100%",
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
          paginationPageSize={10}
          animateRows={true}
          rowHeight={38}
          headerHeight={44}
          enableCellTextSelection={true}
        />
      </div>
    </div>
  );
};

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function SuryaDashboard() {
  const [theme, setTheme] = useState("light");
  const t = theme === "light" ? LIGHT : DARK;

  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("25-26");
  const [dash, setDash] = useState(null);
  const [projectS, setProjectS] = useState([]);
  const [projectSA, setProjectSA] = useState([]);
  const [loadingDash, setLoadingDash] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

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
      .catch(() => setYears([{ value: "25-26", label: "2025-26" }]));
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    setLoadingDash(true);
    Promise.all([
      fetch(`https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/getDashboardDataApi.php?financial_year=${selectedYear}`).then(r => r.json()),
      fetch(`https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/get_project_status_dataWithSApi.php?financial_year=${selectedYear}`).then(r => r.json()),
      fetch(`https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/get_project_status_dataWithoutSApi.php?financial_year=${selectedYear}`).then(r => r.json()),
    ])
      .then(([d, ps, psa]) => {
        setDash(d);
        setProjectS(ps?.data || []);
        setProjectSA(psa?.data || []);
      })
      .catch(console.error)
      .finally(() => setLoadingDash(false));
  }, [selectedYear]);

  const TABS = [
    { id: "overview", label: "Overview" },
    { id: "charts", label: "Owner Charts" },
    { id: "projects", label: "Project Status" },
    { id: "debtors", label: "Billwise Debtors" },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: t.bg, color: t.text,
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      transition: "background 0.3s, color 0.3s"
    }}>
      {/* ── TOP HEADER ── */}
      <div style={{
        background: t.header, padding: "0 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 56, boxShadow: "0 2px 16px rgba(0,0,0,0.18)", position: "sticky", top: 0, zIndex: 100
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
              SURYA ERP Dashboard
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", letterSpacing: 1 }}>
              EQUIPMENT MANAGEMENT SYSTEM
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {dash?.rightVerticalCard?.manfacturing_data_upload_time && (
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>
              Last Updated: {dash.rightVerticalCard.manfacturing_data_upload_time}
            </span>
          )}
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            style={{
              padding: "6px 12px", borderRadius: 6, border: "none",
              background: "rgba(255,255,255,0.15)", color: "#fff",
              fontWeight: 600, fontSize: 13, cursor: "pointer", outline: "none"
            }}
          >
            {years.map(y => (
              <option key={y.value} value={y.value} style={{ color: "#000" }}>{y.label}</option>
            ))}
          </select>
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
      </div>

      {/* ── TABS ── */}
      <div style={{
        background: t.card, borderBottom: `1px solid ${t.border}`,
        display: "flex", gap: 0, paddingLeft: 24, position: "sticky", top: 56, zIndex: 99
      }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: "12px 20px", border: "none", background: "transparent",
            fontWeight: 600, fontSize: 13, cursor: "pointer",
            color: activeTab === tab.id ? t.accent : t.subtext,
            borderBottom: activeTab === tab.id ? `3px solid ${t.accent}` : "3px solid transparent",
            transition: "all 0.2s"
          }}>{tab.label}</button>
        ))}
      </div>

      {/* ── CONTENT ── */}
      <div style={{ padding: 24, maxWidth: 1600, margin: "0 auto" }}>
        {loadingDash ? (
          <div style={{ textAlign: "center", padding: 80, color: t.subtext }}>
            <div style={{
              width: 48, height: 48, border: `4px solid ${t.border}`,
              borderTop: `4px solid ${t.accent}`, borderRadius: "50%",
              animation: "spin 0.8s linear infinite", margin: "0 auto 16px"
            }} />
            <div style={{ fontSize: 14 }}>Loading dashboard data...</div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : !dash ? (
          <div style={{ textAlign: "center", padding: 80, color: "#ef4444" }}>
            Failed to load data. Please check API connection.
          </div>
        ) : (
          <>
            {/* ── OVERVIEW TAB ── */}
            {activeTab === "overview" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Top stat cards */}
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <StatCard title="Total Projects" t={t} rows={[
                    { label: "S & SM", value: dash.projectcountArr?.s_and_sm_file_count },
                    { label: "SA", value: dash.projectcountArr?.sa_file_count },
                    { label: "SL1", value: dash.projectcountArr?.sal1_file_count },
                    { label: "SL7", value: dash.projectcountArr?.sal7_file_count },
                    { label: "Total", total: dash.projectcountArr?.total_file_count }
                  ].slice(0, 4).concat([{ label: "", total: dash.projectcountArr?.total_file_count }])} />
                  <StatCard title="Total PO Amount (Basic)" t={t} rows={[
                    { label: "S & SM", value: "₹" + (dash.poAmtArr?.s_and_sm_file_po_amt || "0") },
                    { label: "SA", value: "₹" + (dash.poAmtArr?.sa_file_po_amt || "0") },
                    { label: "SL1", value: "₹" + (dash.poAmtArr?.sal1_file_po_amt || "0") },
                    { label: "SL7", value: "₹" + (dash.poAmtArr?.sal7_file_po_amt || "0") },
                    { label: "", total: "₹" + (dash.poAmtArr?.total_po_amt || "0") }
                  ]} />
                  <StatCard title="Total Billing Done (Basic)" t={t} rows={[
                    { label: "S & SM", value: "₹" + (dash.billDoneArr?.s_and_sm_file_bill_done || "0") },
                    { label: "SA", value: "₹" + (dash.billDoneArr?.sa_file_bill_done || "0") },
                    { label: "SL1", value: "₹" + (dash.billDoneArr?.sal1_file_bill_done || "0") },
                    { label: "SL7", value: "₹" + (dash.billDoneArr?.sal7_file_bill_done || "0") },
                    { label: "", total: "₹" + (dash.billDoneArr?.total_bill_done || "0") }
                  ]} />
                  <StatCard title="Total Balance Billing (Basic)" t={t} rows={[
                    { label: "S & SM", value: "₹" + (dash.balance_billArr?.s_and_sm_file_balance_bill || "0") },
                    { label: "SA", value: "₹" + (dash.balance_billArr?.sa_file_balance_bill || "0") },
                    { label: "SL1", value: "₹" + (dash.balance_billArr?.sal1_file_balance_bill || "0") },
                    { label: "SL7", value: "₹" + (dash.balance_billArr?.sal7_file_balance_bill || "0") },
                    { label: "", total: "₹" + (dash.balance_billArr?.total_file_balance_bill || "0") }
                  ]} />
                  <RightCard data={dash.rightVerticalCard} t={t} />
                </div>
              </div>
            )}

            {/* ── CHARTS TAB ── */}
            {activeTab === "charts" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <PieSection title="OWNERWISE PO DETAILS" data={dash.graph_owner_po_data} t={t} />
                  <PieSection title="OWNERWISE BILLING DONE" data={dash.graph_owner_billing_done} t={t} />
                  <PieSection title="OWNERWISE BALANCE BILLING" data={dash.graph_balance_billing_details} t={t} />
                </div>
                {dash.graph_product_ownerwise && dash.product_ownerwise_type && (
                  <OwnerProductBar
                    graphData={dash.graph_product_ownerwise}
                    productTypes={dash.product_ownerwise_type}
                    t={t}
                  />
                )}
              </div>
            )}

            {/* ── PROJECTS TAB ── */}
            {activeTab === "projects" && (
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <ProjectStatusGrid title="PROJECT STATUS" data={projectS} t={t} />
                <ProjectStatusGrid title="AMC PROJECT STATUS" data={projectSA} t={t} />
              </div>
            )}

            {/* ── DEBTORS TAB ── */}
            {activeTab === "debtors" && (
              <BillwiseDebtors t={t} />
            )}
          </>
        )}
      </div>
    </div>
  );
}