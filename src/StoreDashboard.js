import React, { useState, useEffect, useRef, useMemo } from "react";
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

// ─── Theme (matches Surya ERP) ────────────────────────────────────────────────
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtNum = (n) => {
  if (!n && n !== 0) return "₹0";
  return "₹" + Number(n).toLocaleString("en-IN");
};

// ─── Standard Components Grid ─────────────────────────────────────────────────
const StandardComponentsGrid = ({ t }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const gridRef = useRef();

  useEffect(() => {
    fetch("http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/StandardComponentsApi.php")
      .then(r => r.json())
      .then(res => {
        if (res.status === "success" && Array.isArray(res.data)) {
          setData(res.data);
        } else {
          setError("No data received from API");
        }
      })
      .catch(err => setError("Failed to fetch: " + err.message))
      .finally(() => setLoading(false));
  }, []);

  const cols = useMemo(() => [
    {
      field: "material_id", headerName: "Material ID", width: 120, pinned: "left",
      filter: "agTextColumnFilter", floatingFilter: true,
      cellStyle: { fontWeight: 700, fontSize: 12, color: t.accent }
    },
    {
      field: "description", headerName: "Description", flex: 1, minWidth: 260,
      filter: "agTextColumnFilter", floatingFilter: true,
      cellStyle: { fontSize: 12, color: t.text },
      tooltipField: "description"
    },
    {
      field: "initial", headerName: "Initial", width: 160,
      filter: "agTextColumnFilter", floatingFilter: true,
      cellStyle: { fontSize: 12 }
    },
    {
      field: "rate", headerName: "Rate (₹)", width: 120,
      filter: "agNumberColumnFilter", floatingFilter: true,
      valueFormatter: p => p.value ? "₹" + Number(p.value).toLocaleString("en-IN") : "₹0",
      cellStyle: { textAlign: "right", fontWeight: 600, color: "#22c55e", fontSize: 12 }
    },
    {
      field: "make", headerName: "Make", width: 130,
      filter: "agTextColumnFilter", floatingFilter: true,
      cellStyle: { fontSize: 12 }
    },
    {
      field: "MaterialCatg", headerName: "Category", width: 150,
      filter: "agTextColumnFilter", floatingFilter: true,
      cellRenderer: p => (
        <span style={{
          background: p.value === "DRIVE" ? "rgba(99,102,241,0.15)" :
                      p.value === "BOUGHT OUT" ? "rgba(16,185,129,0.15)" :
                      p.value === "ELECTRICAL" ? "rgba(245,158,11,0.15)" : "rgba(37,99,235,0.12)",
          color: p.value === "DRIVE" ? "#6366f1" :
                 p.value === "BOUGHT OUT" ? "#10b981" :
                 p.value === "ELECTRICAL" ? "#f59e0b" : t.accent,
          borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 700
        }}>{p.value}</span>
      )
    },
    {
      field: "main_material_name", headerName: "Material Group", width: 180,
      filter: "agTextColumnFilter", floatingFilter: true,
      valueFormatter: p => (p.value || "").trim(),
      cellStyle: { fontSize: 12, color: t.subtext }
    },
    {
      field: "stock", headerName: "Stock", width: 100,
      filter: "agNumberColumnFilter", floatingFilter: true,
      valueFormatter: p => p.value !== undefined && p.value !== null ? Number(p.value).toLocaleString("en-IN") : "0",
      cellStyle: p => ({
        textAlign: "right", fontWeight: 700, fontSize: 12,
        color: Number(p.value) <= 0 ? "#ef4444" : "#22c55e"
      })
    },
    {
      field: "rdf", headerName: "RDF", width: 90,
      filter: "agTextColumnFilter", floatingFilter: true,
      cellStyle: { fontSize: 12, textAlign: "center" }
    },
    {
      field: "MinStock", headerName: "Min Stock", width: 110,
      filter: "agNumberColumnFilter", floatingFilter: true,
      cellStyle: { fontSize: 12, textAlign: "right", color: t.subtext }
    },
    {
      field: "MaxStock", headerName: "Max Stock", width: 110,
      filter: "agNumberColumnFilter", floatingFilter: true,
      cellStyle: { fontSize: 12, textAlign: "right", color: t.subtext }
    },
    {
      field: "reorderStock", headerName: "Reorder Stock", width: 130,
      filter: "agNumberColumnFilter", floatingFilter: true,
      cellStyle: { fontSize: 12, textAlign: "right", color: t.subtext }
    },
    {
      field: "leadTime", headerName: "Lead Time (Days)", width: 150,
      filter: "agNumberColumnFilter", floatingFilter: true,
      cellStyle: { fontSize: 12, textAlign: "right", color: t.subtext }
    },
  ], [t]);

  const defaultColDef = useMemo(() => ({
    sortable: true, resizable: true, suppressHeaderMenuButton: false
  }), []);

  const exportCsv = () => gridRef.current?.api?.exportDataAsCsv({
    fileName: `StandardComponents_${new Date().toISOString().split("T")[0]}.csv`
  });

  const autoSize = () => {
    const ids = gridRef.current?.api?.getColumns()?.map(c => c.getId()) || [];
    if (ids.length) gridRef.current.api.autoSizeColumns(ids, false);
  };

  if (loading) return (
    <div style={{ textAlign: "center", padding: 60, color: t.subtext }}>
      <div style={{
        width: 40, height: 40, border: `4px solid ${t.border}`,
        borderTop: `4px solid ${t.accent}`, borderRadius: "50%",
        animation: "spin 0.8s linear infinite", margin: "0 auto 12px"
      }} />
      <div style={{ fontSize: 13 }}>Loading Standard Components...</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error) return (
    <div style={{ textAlign: "center", padding: 60, color: "#ef4444", fontSize: 14 }}>
      ⚠️ {error}
    </div>
  );

  return (
    <div style={{
      background: t.card, border: `1px solid ${t.border}`,
      borderRadius: 12, overflow: "hidden",
      boxShadow: "0 2px 12px rgba(0,0,0,0.07)"
    }}>
      {/* Header */}
      <div style={{
        background: t.header, padding: "12px 16px",
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", letterSpacing: 1 }}>
            STANDARD COMPONENTS
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>
            {data.length.toLocaleString("en-IN")} total items
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { label: "📥 Export CSV", onClick: exportCsv, bg: "#22c55e" },
            { label: "↔ Auto Size", onClick: autoSize, bg: "#f59e0b" },
          ].map(btn => (
            <button key={btn.label} onClick={btn.onClick} style={{
              padding: "6px 14px", background: btn.bg, border: "none",
              borderRadius: 6, color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer"
            }}>{btn.label}</button>
          ))}
        </div>
      </div>

      {/* AG Grid */}
      <div
        className="ag-theme-alpine"
        style={{
          height: 520, width: "100%",
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
          paginationPageSize={20}
          paginationPageSizeSelector={[10, 20, 50, 100]}
          animateRows={true}
          rowHeight={38}
          headerHeight={44}
          enableCellTextSelection={true}
        />
      </div>
    </div>
  );
};

// ─── Red Zone Stock Grid ──────────────────────────────────────────────────────
const RedZoneStockGrid = ({ t }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const gridRef = useRef();

  useEffect(() => {
    fetch("http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/RedZoneStockApi.php")
      .then(r => r.json())
      .then(res => {
        if (res.status === "success" && Array.isArray(res.data)) {
          setData(res.data);
        } else {
          setError("No data received from API");
        }
      })
      .catch(err => setError("Failed to fetch: " + err.message))
      .finally(() => setLoading(false));
  }, []);

  const cols = useMemo(() => [
    {
      field: "material_id", headerName: "Material ID", width: 120, pinned: "left",
      filter: "agTextColumnFilter", floatingFilter: true,
      cellStyle: { fontWeight: 700, fontSize: 12, color: t.accent }
    },
    {
      field: "description", headerName: "Description", flex: 1, minWidth: 220,
      filter: "agTextColumnFilter", floatingFilter: true,
      cellStyle: { fontSize: 12 },
      tooltipField: "description"
    },
    {
      field: "make", headerName: "Make", width: 120,
      filter: "agTextColumnFilter", floatingFilter: true,
      cellStyle: { fontSize: 12 }
    },
    {
      field: "main_material_name", headerName: "Material Group", width: 180,
      filter: "agTextColumnFilter", floatingFilter: true,
      cellStyle: { fontSize: 12, color: t.subtext }
    },
    {
      field: "MaterialCatg", headerName: "Category", width: 150,
      filter: "agTextColumnFilter", floatingFilter: true,
      cellRenderer: p => (
        <span style={{
          background: "rgba(239,68,68,0.12)",
          color: "#ef4444",
          borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 700
        }}>{p.value}</span>
      )
    },
    {
      field: "stock", headerName: "Current Stock", width: 140,
      filter: "agNumberColumnFilter", floatingFilter: true,
      valueFormatter: p => p.value !== undefined ? Number(p.value).toLocaleString("en-IN") : "0",
      cellRenderer: p => {
        const stock = Number(p.value || 0);
        const min = Number(p.data?.MinStock || 0);
        const pct = min > 0 ? Math.min((stock / min) * 100, 100) : 0;
        return (
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%", gap: 2 }}>
            <div style={{ fontWeight: 700, fontSize: 12, color: stock <= 0 ? "#ef4444" : stock < min ? "#f59e0b" : "#22c55e" }}>
              {stock.toLocaleString("en-IN")}
            </div>
            <div style={{
              height: 4, background: t.border, borderRadius: 2, overflow: "hidden"
            }}>
              <div style={{
                width: `${pct}%`, height: "100%",
                background: pct < 30 ? "#ef4444" : pct < 70 ? "#f59e0b" : "#22c55e",
                borderRadius: 2, transition: "width 0.3s"
              }} />
            </div>
          </div>
        );
      }
    },
    {
      field: "MinStock", headerName: "Min Stock", width: 110,
      filter: "agNumberColumnFilter", floatingFilter: true,
      cellStyle: { fontSize: 12, textAlign: "right", fontWeight: 600, color: "#ef4444" }
    },
    {
      field: "MaxStock", headerName: "Max Stock", width: 110,
      filter: "agNumberColumnFilter", floatingFilter: true,
      cellStyle: { fontSize: 12, textAlign: "right", color: "#22c55e", fontWeight: 600 }
    },
    {
      field: "reorderStock", headerName: "Reorder At", width: 120,
      filter: "agNumberColumnFilter", floatingFilter: true,
      cellStyle: { fontSize: 12, textAlign: "right", color: "#f59e0b", fontWeight: 600 }
    },
    {
      field: "leadTime", headerName: "Lead Time (Days)", width: 150,
      filter: "agNumberColumnFilter", floatingFilter: true,
      cellStyle: { fontSize: 12, textAlign: "right", color: t.subtext }
    },
    {
      field: "rate", headerName: "Rate (₹)", width: 130,
      filter: "agNumberColumnFilter", floatingFilter: true,
      valueFormatter: p => p.value ? "₹" + Number(p.value).toLocaleString("en-IN") : "₹0",
      cellStyle: { textAlign: "right", fontWeight: 600, color: "#22c55e", fontSize: 12 }
    },
    {
      field: "gst", headerName: "GST (%)", width: 100,
      filter: "agNumberColumnFilter", floatingFilter: true,
      cellStyle: { fontSize: 12, textAlign: "right" }
    },
    {
      field: "hsn", headerName: "HSN Code", width: 120,
      filter: "agTextColumnFilter", floatingFilter: true,
      cellStyle: { fontSize: 12, color: t.subtext }
    },
    {
      field: "rdf", headerName: "RDF", width: 90,
      filter: "agTextColumnFilter", floatingFilter: true,
      cellRenderer: p => (
        <span style={{
          background: p.value === "Yes" ? "rgba(239,68,68,0.15)" : "rgba(100,116,139,0.12)",
          color: p.value === "Yes" ? "#ef4444" : t.subtext,
          borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 700
        }}>{p.value || "-"}</span>
      )
    },
    {
      field: "employeename", headerName: "Employee", width: 160,
      filter: "agTextColumnFilter", floatingFilter: true,
      valueFormatter: p => p.value || "-",
      cellStyle: { fontSize: 12, color: t.subtext }
    },
  ], [t]);

  const defaultColDef = useMemo(() => ({
    sortable: true, resizable: true, suppressHeaderMenuButton: false
  }), []);

  const exportCsv = () => gridRef.current?.api?.exportDataAsCsv({
    fileName: `RedZoneStock_${new Date().toISOString().split("T")[0]}.csv`
  });

  const autoSize = () => {
    const ids = gridRef.current?.api?.getColumns()?.map(c => c.getId()) || [];
    if (ids.length) gridRef.current.api.autoSizeColumns(ids, false);
  };

  if (loading) return (
    <div style={{ textAlign: "center", padding: 60, color: t.subtext }}>
      <div style={{
        width: 40, height: 40, border: `4px solid ${t.border}`,
        borderTop: `4px solid #ef4444`, borderRadius: "50%",
        animation: "spin 0.8s linear infinite", margin: "0 auto 12px"
      }} />
      <div style={{ fontSize: 13 }}>Loading Red Zone Stock...</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error) return (
    <div style={{ textAlign: "center", padding: 60, color: "#ef4444", fontSize: 14 }}>
      ⚠️ {error}
    </div>
  );

  const totalValue = data.reduce((s, r) => s + (Number(r.stock || 0) * Number(r.rate || 0)), 0);

  return (
    <div style={{
      background: t.card, border: `1px solid ${t.border}`,
      borderRadius: 12, overflow: "hidden",
      boxShadow: "0 2px 12px rgba(0,0,0,0.07)"
    }}>
      {/* Alert Banner */}
      <div style={{
        background: "linear-gradient(135deg,#7f1d1d 0%,#dc2626 100%)",
        padding: "6px 16px",
        display: "flex", alignItems: "center", gap: 8
      }}>
        <span style={{ fontSize: 14 }}>🔴</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", letterSpacing: 0.5 }}>
          CRITICAL ALERT: {data.length} items below minimum stock threshold — Immediate reorder required
        </span>
      </div>

      {/* Header */}
      <div style={{
        background: t.header, padding: "12px 16px",
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", letterSpacing: 1 }}>
            RED ZONE STOCK MONITOR
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>
            {data.length} critical items · Est. Reorder Value: {fmtNum(totalValue)}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { label: "📥 Export CSV", onClick: exportCsv, bg: "#22c55e" },
            { label: "↔ Auto Size", onClick: autoSize, bg: "#f59e0b" },
          ].map(btn => (
            <button key={btn.label} onClick={btn.onClick} style={{
              padding: "6px 14px", background: btn.bg, border: "none",
              borderRadius: 6, color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer"
            }}>{btn.label}</button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "flex", gap: 12, padding: "12px 16px", flexWrap: "wrap" }}>
        {[
          { label: "Critical Items", value: data.length, color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
          { label: "Zero Stock", value: data.filter(d => Number(d.stock) <= 0).length, color: "#dc2626", bg: "rgba(220,38,38,0.1)" },
          { label: "Avg Lead Time", value: (data.reduce((s, d) => s + Number(d.leadTime || 0), 0) / data.length || 0).toFixed(1) + " days", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
          { label: "Est. Reorder Value", value: fmtNum(totalValue), color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
        ].map((s, i) => (
          <div key={i} style={{
            background: s.bg, border: `1px solid ${s.color}33`,
            borderRadius: 8, padding: "8px 14px", flex: 1, minWidth: 140
          }}>
            <div style={{ fontSize: 10, color: s.color, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>{s.label}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: s.color, marginTop: 2 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* AG Grid */}
      <div
        className="ag-theme-alpine"
        style={{
          height: 420, width: "100%",
          "--ag-background-color": t.gridBg,
          "--ag-header-background-color": t.tableHead,
          "--ag-header-foreground-color": "#fff",
          "--ag-foreground-color": t.text,
          "--ag-border-color": t.border,
          "--ag-odd-row-background-color": t.tableRow,
          "--ag-row-hover-color": t === LIGHT ? "#fff0f0" : "#7f1d1d22"
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
          rowHeight={44}
          headerHeight={44}
          enableCellTextSelection={true}
          getRowStyle={p => ({
            background: Number(p.data?.stock) <= 0
              ? (t === LIGHT ? "rgba(239,68,68,0.07)" : "rgba(239,68,68,0.12)")
              : undefined
          })}
        />
      </div>
    </div>
  );
};

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function InventoryDashboard() {
  const [theme, setTheme] = useState("light");
  const t = theme === "light" ? LIGHT : DARK;
  const [activeTab, setActiveTab] = useState("standard");

  const TABS = [
    { id: "standard", label: "📦 Standard Components" },
    { id: "redzone", label: "🔴 Red Zone Stock" },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: t.bg, color: t.text,
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      transition: "background 0.3s, color 0.3s"
    }}>
      {/* TOP HEADER */}
      <div style={{
        background: t.header, padding: "0 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 56, boxShadow: "0 2px 16px rgba(0,0,0,0.18)",
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
              SURYA ERP — Inventory
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", letterSpacing: 1 }}>
              STOCK & COMPONENT MANAGEMENT
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

      {/* TABS */}
      <div style={{
        background: t.card, borderBottom: `1px solid ${t.border}`,
        display: "flex", gap: 0, paddingLeft: 24,
        position: "sticky", top: 56, zIndex: 99
      }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: "12px 22px", border: "none", background: "transparent",
            fontWeight: 600, fontSize: 13, cursor: "pointer",
            color: activeTab === tab.id ? t.accent : t.subtext,
            borderBottom: activeTab === tab.id ? `3px solid ${t.accent}` : "3px solid transparent",
            transition: "all 0.2s"
          }}>{tab.label}</button>
        ))}
      </div>

      {/* CONTENT */}
      <div style={{ padding: 24, maxWidth: 1600, margin: "0 auto" }}>
        {activeTab === "standard" && <StandardComponentsGrid t={t} />}
        {activeTab === "redzone" && <RedZoneStockGrid t={t} />}
      </div>
    </div>
  );
}