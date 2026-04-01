import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-theme-alpine.css";
import {
  ModuleRegistry,
  ClientSideRowModelModule,
  ValidationModule,
  DateFilterModule,
  NumberFilterModule,
  TextFilterModule,
  RowSelectionModule,
  PaginationModule,
  CsvExportModule,
} from "ag-grid-community";

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  ValidationModule,
  DateFilterModule,
  NumberFilterModule,
  TextFilterModule,
  RowSelectionModule,
  PaginationModule,
  CsvExportModule,
]);

// ─── Constants ────────────────────────────────────────────────────────────────
const API_BASE  = "http://erp.suryaequipments.com/Surya_React/surya_dynamic_api";
const YEARS_API = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/GetYearsApi.php";

const STATUS_COLORS = {
  "At FAT":         { bg: "#fff3cd", text: "#856404", border: "#ffc107" },
  "At Design Dept": { bg: "#cce5ff", text: "#004085", border: "#007bff" },
  "At Site dept":   { bg: "#d4edda", text: "#155724", border: "#28a745" },
  "At Production":  { bg: "#f8d7da", text: "#721c24", border: "#dc3545" },
  "Dispatched":     { bg: "#d1ecf1", text: "#0c5460", border: "#17a2b8" },
  "Marketing":      { bg: "#e2d9f3", text: "#432874", border: "#6f42c1" },
  "Challan Close":  { bg: "#fde8d8", text: "#7c4010", border: "#f97316" },
};
const getStatusStyle = (s) => STATUS_COLORS[s] || { bg: "#f0f0f0", text: "#444", border: "#bbb" };

function fmtCr(n) {
  if (!n && n !== 0) return "₹0";
  const num = Number(n);
  if (num >= 10000000) return "₹" + (num / 10000000).toFixed(2) + " Cr";
  if (num >= 100000)   return "₹" + (num / 100000).toFixed(2) + " L";
  return "₹" + num.toLocaleString("en-IN");
}

// ─── Toast System ─────────────────────────────────────────────────────────────
const Toast = ({ toasts, remove }) => (
  <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
    {toasts.map((t) => (
      <div key={t.id} style={{
        padding: "10px 16px", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 600,
        background: t.type === "success" ? "#22c55e" : t.type === "error" ? "#ef4444" : "#3b82f6",
        boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
        display: "flex", alignItems: "center", gap: 8, minWidth: 240, maxWidth: 360,
        animation: "toastIn 0.3s ease",
      }}>
        <span>{t.type === "success" ? "✓" : t.type === "error" ? "✗" : "ℹ"}</span>
        <span style={{ flex: 1 }}>{t.message}</span>
        <span onClick={() => remove(t.id)} style={{ cursor: "pointer", opacity: 0.7, fontSize: 16 }}>×</span>
      </div>
    ))}
    <style>{`@keyframes toastIn{from{transform:translateX(110%);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
  </div>
);

function useToasts() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);
  const remove = useCallback((id) => setToasts((p) => p.filter((t) => t.id !== id)), []);
  return { toasts, add, remove };
}

// ─── Editable Text / Date Cell ────────────────────────────────────────────────
const EditTextCell = ({ value, node, colDef, placeholder, type = "text" }) => {
  const [val, setVal]       = useState(value ?? "");
  const [focused, setFocused] = useState(false);
  useEffect(() => { setVal(value ?? ""); }, [value]);
  return (
    <input
      type={type}
      value={val}
      placeholder={placeholder || ""}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onChange={(e) => {
        setVal(e.target.value);
        node.setDataValue(colDef.field, e.target.value);
      }}
      style={{
        width: "100%", height: "100%",
        border: focused ? "2px solid #f59e0b" : "1px solid transparent",
        borderRadius: 3, padding: "0 7px",
        background: focused ? "#fffdf0" : "transparent",
        outline: "none", fontSize: 11, color: "#1a2332",
        fontFamily: "inherit", transition: "all 0.15s",
      }}
    />
  );
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusPill = ({ value }) => {
  if (!value) return <span style={{ color: "#ccc" }}>—</span>;
  const sc = getStatusStyle(value);
  return (
    <span style={{
      background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`,
      borderRadius: 20, padding: "2px 9px", fontSize: 10, fontWeight: 700,
      whiteSpace: "nowrap", display: "inline-block",
    }}>{value}</span>
  );
};

// ─── Toolbar Button ───────────────────────────────────────────────────────────
const TBtn = ({ label, onClick, color = "#3b82f6", disabled = false }) => (
  <button
    onClick={onClick} disabled={disabled}
    style={{
      padding: "6px 14px",
      background: disabled ? "#94a3b8" : color,
      border: "none", borderRadius: 7, color: "#fff",
      fontWeight: 700, fontSize: 12, cursor: disabled ? "not-allowed" : "pointer",
      boxShadow: disabled ? "none" : `0 2px 6px ${color}55`,
      transition: "opacity 0.15s",
    }}
    onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.opacity = "0.85"; }}
    onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
  >{label}</button>
);

// ─── Loader ───────────────────────────────────────────────────────────────────
const Loader = ({ color = "#2563eb" }) => (
  <div style={{ textAlign: "center", padding: "60px 0", color: "#64748b" }}>
    <div style={{
      width: 40, height: 40, border: "4px solid #e2e8f0",
      borderTop: `4px solid ${color}`, borderRadius: "50%",
      animation: "spin 0.7s linear infinite", margin: "0 auto 12px",
    }} />
    <div style={{ fontSize: 13 }}>Loading data…</div>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

// ─── Card style ───────────────────────────────────────────────────────────────
const sCard = {
  background: "#fff",
  borderRadius: 14,
  padding: "18px 20px",
  boxShadow: "0 2px 16px rgba(30,58,95,0.08)",
  border: "1px solid #e2e8f0",
};

// ─── Summary Stat Box ─────────────────────────────────────────────────────────
const StatBox = ({ label, value, color }) => (
  <div style={{
    background: color + "12", border: `1px solid ${color}33`,
    borderRadius: 8, padding: "6px 14px", minWidth: 120,
  }}>
    <div style={{ fontSize: 9, color, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>{label}</div>
    <div style={{ fontSize: 16, fontWeight: 800, color }}>{value}</div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1 — Top Editable Project Table
// ═══════════════════════════════════════════════════════════════════════════════
function TopProjectTable({ financialYear, fyLabel }) {
  const gridRef                     = useRef();
  const [rowData, setRowData]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [savingRow, setSavingRow]   = useState(null);
  const { toasts, add: addToast, remove } = useToasts();

  // Re-fetch whenever year changes
  const fetchData = useCallback((year) => {
    setLoading(true);
    fetch(`${API_BASE}/projectDashboardApi.php?financial_year=${year}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.status) setRowData(j.data);
        else { setRowData([]); addToast("No data for FY " + year, "error"); }
      })
      .catch((e) => { setRowData([]); addToast("Fetch failed: " + e.message, "error"); })
      .finally(() => setLoading(false));
  }, [addToast]);

  useEffect(() => { if (financialYear) fetchData(financialYear); }, [financialYear, fetchData]);

  const handleSave = useCallback(async (params) => {
    const { data } = params;
    setSavingRow(data.FILE_ID);
    try {
      // ⚠️ Replace with your real save endpoint:
      // const fd = new FormData();
      // Object.entries(data).forEach(([k, v]) => fd.append(k, v ?? ""));
      // const res = await fetch("YOUR_SAVE_API_URL", { method: "POST", body: fd });
      // const json = await res.json();
      // if (!json.status) throw new Error(json.message);
      await new Promise((r) => setTimeout(r, 700)); // simulated
      addToast(`✓ Saved ${data.FILE_NAME} successfully`, "success");
    } catch (err) {
      addToast("Save failed: " + err.message, "error");
    } finally {
      setSavingRow(null);
    }
  }, [addToast]);

  const columnDefs = useMemo(() => [
    {
      headerName: "#",
      valueGetter: (p) => (p.node ? p.node.rowIndex + 1 : ""),
      width: 60, pinned: "left", sortable: false, filter: false,
      cellStyle: { textAlign: "center", fontWeight: 700, color: "#94a3b8", fontSize: 11 },
    },
    {
      field: "FILE_ID", headerName: "File ID",
      width: 85, pinned: "left",
      filter: "agTextColumnFilter", floatingFilter: true,
      cellStyle: { fontFamily: "monospace", color: "#2563eb", fontWeight: 700, fontSize: 11 },
    },
    {
      field: "FILE_NAME", headerName: "File Name ✏️",
      width: 200, pinned: "left",
      filter: "agTextColumnFilter", floatingFilter: true,
      cellRenderer: (p) => <EditTextCell value={p.value} node={p.node} colDef={p.colDef} />,
      cellStyle: { background: "rgba(245,158,11,0.07)", borderLeft: "3px solid #f59e0b", padding: 0 },
      headerClass: "editable-header",
    },
    {
      field: "present_owner", headerName: "Owner",
      width: 135,
      filter: "agTextColumnFilter", floatingFilter: true,
      cellRenderer: (p) => <StatusPill value={p.value} />,
      cellStyle: { display: "flex", alignItems: "center" },
    },
    {
      field: "desp_date", headerName: "Desp Date ✏️",
      width: 155,
      filter: "agDateColumnFilter", floatingFilter: true,
      cellRenderer: (p) => <EditTextCell value={p.value} node={p.node} colDef={p.colDef} type="date" />,
      cellStyle: { background: "rgba(245,158,11,0.07)", borderLeft: "3px solid #f59e0b", padding: 0 },
      headerClass: "editable-header",
    },
    {
      field: "po_value", headerName: "PO Value",
      width: 130,
      filter: "agNumberColumnFilter", floatingFilter: true,
      valueFormatter: (p) =>
        p.value && Number(p.value) > 0
          ? Number(p.value).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })
          : "—",
      cellStyle: { textAlign: "right", fontWeight: 700, color: "#2563eb", fontSize: 11 },
    },
    {
      field: "particulars", headerName: "Particulars",
      width: 110,
      filter: "agTextColumnFilter", floatingFilter: true,
      cellStyle: { fontSize: 11 },
    },
    {
      field: "approx_bill_value", headerName: "Bill Value",
      width: 110,
      filter: "agTextColumnFilter", floatingFilter: true,
      cellStyle: { textAlign: "right", fontSize: 11 },
    },
    {
      field: "design", headerName: "Design",
      width: 90,
      filter: "agTextColumnFilter", floatingFilter: true,
      cellRenderer: (p) => p.value
        ? <span style={{ background: "#d4edda", color: "#155724", borderRadius: "50%", width: 22, height: 22, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>✔</span>
        : <span style={{ color: "#ddd", fontSize: 18 }}>—</span>,
      cellStyle: { textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center" },
    },
    {
      field: "fat", headerName: "FAT",
      width: 80,
      filter: "agTextColumnFilter", floatingFilter: true,
      cellRenderer: (p) => p.value
        ? <span style={{ background: "#cce5ff", color: "#004085", borderRadius: "50%", width: 22, height: 22, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>✔</span>
        : <span style={{ color: "#ddd", fontSize: 18 }}>—</span>,
      cellStyle: { textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center" },
    },
    {
      field: "total_project", headerName: "Total",
      width: 85,
      filter: "agNumberColumnFilter", floatingFilter: true,
      cellStyle: { textAlign: "center", fontWeight: 700, fontSize: 11 },
    },
    {
      field: "wip", headerName: "WIP",
      width: 80,
      filter: "agNumberColumnFilter", floatingFilter: true,
      cellStyle: { textAlign: "center", fontWeight: 700, fontSize: 11, color: "#f97316" },
    },
    {
      field: "remark", headerName: "Remark ✏️",
      width: 200,
      filter: "agTextColumnFilter", floatingFilter: true,
      cellRenderer: (p) => <EditTextCell value={p.value} node={p.node} colDef={p.colDef} placeholder="Add remark…" />,
      cellStyle: { background: "rgba(245,158,11,0.07)", borderLeft: "3px solid #f59e0b", padding: 0 },
      headerClass: "editable-header",
    },
    {
      field: "timestamp", headerName: "Updated",
      width: 155,
      filter: "agTextColumnFilter", floatingFilter: true,
      cellStyle: { fontSize: 10, color: "#94a3b8" },
    },
    {
      headerName: "Action",
      width: 105, pinned: "right", sortable: false, filter: false,
      cellRenderer: (params) => {
        const isSaving = savingRow === params.data?.FILE_ID;
        return (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
            <button
              onClick={() => handleSave(params)}
              disabled={isSaving}
              style={{
                background: isSaving ? "#94a3b8" : "linear-gradient(135deg,#1e3a5f,#2563eb)",
                color: "#fff", border: "none", borderRadius: 6,
                padding: "4px 12px", fontSize: 10, fontWeight: 700,
                cursor: isSaving ? "not-allowed" : "pointer",
                boxShadow: "0 2px 6px rgba(37,99,235,0.3)",
                transition: "all 0.2s", whiteSpace: "nowrap",
              }}
            >{isSaving ? "⏳ Saving…" : "💾 Save"}</button>
          </div>
        );
      },
      cellStyle: { background: "#f8fafc", padding: "0 4px" },
    },
  ], [handleSave, savingRow]);

  const defaultColDef = useMemo(() => ({ sortable: true, resizable: true }), []);

  const exportCsv = () =>
    gridRef.current?.api?.exportDataAsCsv({ fileName: `ProjectDashboard_FY${financialYear}.csv` });
  const autoSize = () => {
    const ids = gridRef.current?.api?.getColumns()?.map((c) => c.getId()) || [];
    if (ids.length) gridRef.current.api.autoSizeColumns(ids, false);
  };
  const refresh = () => fetchData(financialYear);

  const totalPO    = useMemo(() => rowData.reduce((s, r) => s + Number(r.po_value || 0), 0), [rowData]);
  const withDesign = useMemo(() => rowData.filter((r) => r.design).length, [rowData]);
  const withFAT    = useMemo(() => rowData.filter((r) => r.fat).length, [rowData]);

  return (
    <div style={sCard}>
      <Toast toasts={toasts} remove={remove} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#1e3a5f" }}>📋 Project Dashboard</h2>
          <span style={{ background: "#2563eb18", color: "#2563eb", border: "1px solid #2563eb44", borderRadius: 20, padding: "2px 11px", fontSize: 12, fontWeight: 700 }}>
            {rowData.length} Projects · FY {fyLabel || financialYear}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <TBtn label="🔄 Refresh"   onClick={refresh}   color="#3b82f6" />
          <TBtn label="📥 Export CSV" onClick={exportCsv} color="#22c55e" />
          <TBtn label="↔ Auto Size"  onClick={autoSize}  color="#f59e0b" />
        </div>
      </div>

      {/* Summary strip */}
      {!loading && (
        <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
          <StatBox label="Total Projects"  value={rowData.length} color="#2563eb" />
          <StatBox label="Total PO Value"  value={fmtCr(totalPO)} color="#7c3aed" />
          <StatBox label="With Design"     value={withDesign}     color="#16a34a" />
          <StatBox label="At FAT"          value={withFAT}        color="#0891b2" />
          <div style={{
            marginLeft: "auto",
            background: "rgba(245,158,11,0.1)", border: "1px solid #f59e0b44",
            borderLeft: "3px solid #f59e0b", borderRadius: 6,
            padding: "6px 14px", fontSize: 11, color: "#92400e", fontWeight: 600,
            display: "flex", alignItems: "center",
          }}>
            ✏️ Yellow columns are editable — click to edit, then Save
          </div>
        </div>
      )}

      {/* AG Grid */}
      {loading ? <Loader color="#2563eb" /> : (
        <div className="ag-theme-alpine" style={{
          height: 480, width: "100%",
          "--ag-background-color": "#fff",
          "--ag-header-background-color": "#1e3a5f",
          "--ag-header-foreground-color": "#fff",
          "--ag-border-color": "#e2e8f0",
          "--ag-row-hover-color": "#eff6ff",
          "--ag-font-size": "11px",
          "--ag-odd-row-background-color": "#f8fafc",
        }}>
          <AgGridReact
            ref={gridRef}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            pagination
            paginationPageSize={15}
            paginationPageSizeSelector={[10, 15, 25, 50, 100]}
            animateRows
            rowHeight={36}
            headerHeight={44}
            floatingFiltersHeight={34}
            enableCellTextSelection
            tooltipShowDelay={300}
            onGridReady={() => setTimeout(autoSize, 400)}
          />
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2 — Bottom With-S / Without-S Tables
// ═══════════════════════════════════════════════════════════════════════════════
function BottomTable({ title, apiUrl, accent, icon, financialYear, fyLabel }) {
  const gridRef                       = useRef();
  const [rowData, setRowData]         = useState([]);
  const [totalCount, setTotal]        = useState(0);
  const [loading, setLoading]         = useState(true);

  const fetchData = useCallback((year) => {
    setLoading(true);
    fetch(`${apiUrl}?financial_year=${year}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.status) { setRowData(j.data); setTotal(j.count || j.data.length); }
        else { setRowData([]); setTotal(0); }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [apiUrl]);

  useEffect(() => { if (financialYear) fetchData(financialYear); }, [financialYear, fetchData]);

  const columnDefs = useMemo(() => [
    {
      headerName: "#",
      valueGetter: (p) => (p.node ? p.node.rowIndex + 1 : ""),
      width: 60, sortable: false, filter: false,
      cellStyle: { textAlign: "center", fontWeight: 700, color: "#94a3b8", fontSize: 11 },
    },
    {
      field: "file_id", headerName: "File ID",
      width: 90,
      filter: "agTextColumnFilter", floatingFilter: true,
      cellStyle: { fontFamily: "monospace", color: accent, fontWeight: 700, fontSize: 11 },
    },
    {
      field: "file_name", headerName: "File Name",
      flex: 1, minWidth: 160,
      filter: "agTextColumnFilter", floatingFilter: true,
      cellStyle: { fontWeight: 500, fontSize: 11 },
      tooltipField: "file_name",
    },
    {
      field: "status", headerName: "Status",
      width: 165,
      filter: "agTextColumnFilter", floatingFilter: true,
      cellRenderer: (p) => <StatusPill value={p.value} />,
      cellStyle: { display: "flex", alignItems: "center" },
    },
    {
      field: "progress", headerName: "Progress",
      flex: 1, minWidth: 160,
      filter: "agTextColumnFilter", floatingFilter: true,
      cellStyle: { fontSize: 11, color: "#475569" },
    },
  ], [accent]);

  const defaultColDef = useMemo(() => ({ sortable: true, resizable: true }), []);

  const exportCsv = () =>
    gridRef.current?.api?.exportDataAsCsv({ fileName: `${title.replace(/\W+/g, "_")}_FY${financialYear}.csv` });
  const autoSize = () => {
    const ids = gridRef.current?.api?.getColumns()?.map((c) => c.getId()) || [];
    if (ids.length) gridRef.current.api.autoSizeColumns(ids, false);
  };
  const refresh = () => fetchData(financialYear);

  // Top-5 status breakdown
  const statusBreakdown = useMemo(() => {
    const map = {};
    rowData.forEach((r) => { if (r.status) map[r.status] = (map[r.status] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [rowData]);

  return (
    <div style={{ ...sCard, flex: 1, minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: accent }}>{icon} {title}</h3>
          <span style={{ background: accent + "18", color: accent, border: `1px solid ${accent}44`, borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>
            {totalCount} Records · FY {fyLabel || financialYear}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <TBtn label="🔄"     onClick={refresh}   color="#3b82f6" />
          <TBtn label="📥 CSV" onClick={exportCsv} color="#22c55e" />
          <TBtn label="↔ Fit" onClick={autoSize}  color={accent}  />
        </div>
      </div>

      {/* Status chips */}
      {!loading && statusBreakdown.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
          {statusBreakdown.map(([status, count]) => {
            const sc = getStatusStyle(status);
            return (
              <span key={status} style={{
                background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`,
                borderRadius: 20, padding: "2px 9px", fontSize: 10, fontWeight: 700,
              }}>{status}: {count}</span>
            );
          })}
        </div>
      )}

      {/* AG Grid */}
      {loading ? <Loader color={accent} /> : (
        <div className="ag-theme-alpine" style={{
          height: 440, width: "100%",
          "--ag-background-color": "#fff",
          "--ag-header-background-color": "#1e3a5f",
          "--ag-header-foreground-color": "#fff",
          "--ag-border-color": "#e2e8f0",
          "--ag-row-hover-color": accent + "18",
          "--ag-font-size": "11px",
          "--ag-odd-row-background-color": "#f8fafc",
        }}>
          <AgGridReact
            ref={gridRef}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            pagination
            paginationPageSize={15}
            paginationPageSizeSelector={[10, 15, 25, 50]}
            animateRows
            rowHeight={34}
            headerHeight={44}
            floatingFiltersHeight={34}
            enableCellTextSelection
            tooltipShowDelay={300}
            onGridReady={() => setTimeout(autoSize, 400)}
          />
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT — Fetches years, owns FY state, passes it to all three tables
// ═══════════════════════════════════════════════════════════════════════════════
export default function ProjectDashboard() {
  const [now, setNow]                   = useState(new Date());
  const [financialYear, setFinancialYear] = useState("25-26");
  const [fyOptions, setFyOptions]       = useState([]);
  const [fyLoading, setFyLoading]       = useState(true);

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  // Fetch financial year list — same endpoint as Design Dashboard
  useEffect(() => {
    fetch(YEARS_API)
      .then((r) => r.json())
      .then((res) => {
        if (res.status === "success" && Array.isArray(res.data)) {
          const opts = res.data.map((d) => ({
            value: d.financial_year,
            label: `20${d.financial_year}`,
          }));
          setFyOptions(opts);
          // Default to last (most recent) year
          if (opts.length) setFinancialYear(opts[opts.length - 1].value);
        } else {
          // Fallback hardcoded list if API fails
          setFyOptions([
            { value: "23-24", label: "2023-24" },
            { value: "24-25", label: "2024-25" },
            { value: "25-26", label: "2025-26" },
          ]);
        }
      })
      .catch(() => {
        setFyOptions([
          { value: "23-24", label: "2023-24" },
          { value: "24-25", label: "2024-25" },
          { value: "25-26", label: "2025-26" },
        ]);
      })
      .finally(() => setFyLoading(false));
  }, []);

  const fyLabel = fyOptions.find((f) => f.value === financialYear)?.label || financialYear;

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#f0f4f8", minHeight: "100vh", color: "#1a2332" }}>

      {/* ── Sticky Header ── */}
      <header style={{
        background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)",
        padding: "0 28px", height: 58,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 4px 20px rgba(30,58,95,0.4)",
        position: "sticky", top: 0, zIndex: 200,
      }}>
        {/* Left: logo + title */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: "linear-gradient(135deg, #f59e0b, #ef4444)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, boxShadow: "0 4px 12px rgba(245,158,11,0.5)",
          }}>⚡</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, color: "#fff", letterSpacing: 0.3 }}>
              Surya Equipments — Project Dashboard
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", letterSpacing: 1, textTransform: "uppercase" }}>
              ERP · Project Tracking &amp; Management
            </div>
          </div>
        </div>

        {/* Right: FY selector + clock */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Financial Year Dropdown — mirrors Design Dashboard */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", fontWeight: 600 }}>Financial Year:</span>
            <select
              value={financialYear}
              disabled={fyLoading}
              onChange={(e) => setFinancialYear(e.target.value)}
              style={{
                padding: "6px 14px", borderRadius: 7,
                border: "1px solid rgba(255,255,255,0.3)",
                background: "rgba(255,255,255,0.15)",
                color: "#fff", fontWeight: 700, fontSize: 13,
                cursor: fyLoading ? "wait" : "pointer",
                outline: "none",
                backdropFilter: "blur(4px)",
                minWidth: 110,
              }}
            >
              {fyLoading
                ? <option style={{ color: "#000" }}>Loading…</option>
                : fyOptions.map((y) => (
                    <option key={y.value} value={y.value} style={{ color: "#000", background: "#fff" }}>
                      {y.label}
                    </option>
                  ))
              }
            </select>
          </div>

          {/* Clock + Date */}
          <span style={{
            background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.22)",
            borderRadius: 8, padding: "5px 14px", fontSize: 12, color: "#e2e8f0", fontWeight: 600,
          }}>
            🕐 {now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            &nbsp;·&nbsp;
            {now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
          </span>
        </div>
      </header>

      {/* ── FY change banner ── */}
      {!fyLoading && (
        <div style={{
          background: "linear-gradient(90deg, #1e3a5f11, #2563eb11)",
          borderBottom: "1px solid #2563eb22",
          padding: "6px 28px",
          display: "flex", alignItems: "center", gap: 8,
          fontSize: 12, color: "#1e3a5f", fontWeight: 600,
        }}>
          <span style={{ background: "#2563eb", color: "#fff", borderRadius: 6, padding: "1px 8px", fontSize: 11 }}>
            FY {fyLabel}
          </span>
          <span style={{ color: "#64748b" }}>
            Showing all data for financial year {fyLabel} across all sections below
          </span>
        </div>
      )}

      {/* ── Main Content ── */}
      <main style={{ padding: "20px 26px", display: "flex", flexDirection: "column", gap: 22 }}>

        {/* Section 1: Full-width editable table */}
        <TopProjectTable financialYear={financialYear} fyLabel={fyLabel} />

        {/* Section 2: Side-by-side bottom tables */}
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
          <BottomTable
            title="Projects With 'S' Prefix"
            apiUrl={`${API_BASE}/projectDashboardWithSApi.php`}
            accent="#2563eb"
            icon="🔷"
            financialYear={financialYear}
            fyLabel={fyLabel}
          />
          <BottomTable
            title="Projects Without 'S' Prefix"
            apiUrl={`${API_BASE}/projectDashboardWithoutSApi.php`}
            accent="#16a34a"
            icon="🔶"
            financialYear={financialYear}
            fyLabel={fyLabel}
          />
        </div>
      </main>

      {/* ── Global AG Grid overrides ── */}
      <style>{`
        .ag-theme-alpine .ag-header-cell {
          font-size: 11px !important;
          font-weight: 700 !important;
        }
        .ag-theme-alpine .ag-floating-filter-input {
          font-size: 11px !important;
        }
        .ag-theme-alpine .ag-paging-panel {
          font-size: 12px !important;
          color: #64748b !important;
        }
        .editable-header .ag-header-cell-label::after {
          content: '';
          display: inline-block;
          width: 6px; height: 6px;
          background: #f59e0b;
          border-radius: 50%;
          margin-left: 4px;
          vertical-align: middle;
        }
        select option { color: #1a2332; background: #fff; }
      `}</style>
    </div>
  );
}