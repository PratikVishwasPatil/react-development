import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
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

// ─── API Endpoints ────────────────────────────────────────────────────────────
const API_BASE  = "http://erp.suryaequipments.com/Surya_React/surya_dynamic_api";
const YEARS_API = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/GetYearsApi.php";
const FAT_API   = `${API_BASE}/FatDashboardApi.php`;
const SAVE_API  = `${API_BASE}/saveFatDashboardApi.php`;

// ─── Theme — Light / Dark (matches Surya ERP Design Dashboard) ───────────────
const LIGHT = {
  bg:            "#f0f4f8",
  card:          "#ffffff",
  border:        "#dde3ec",
  text:          "#1a2332",
  subtext:       "#64748b",
  header:        "linear-gradient(135deg,#1e3a5f 0%,#0ea5e9 100%)",
  accent:        "#0ea5e9",
  tableHead:     "#1e3a5f",
  gridBg:        "#f8fafc",
  editableBg:    "#fffbeb",
  editableBorder:"#f59e0b",
};
const DARK = {
  bg:            "#0d1117",
  card:          "#161b22",
  border:        "#30363d",
  text:          "#e6edf3",
  subtext:       "#8b949e",
  header:        "linear-gradient(135deg,#0d1117 0%,#1e3a5f 100%)",
  accent:        "#38bdf8",
  tableHead:     "#0d1117",
  gridBg:        "#161b22",
  editableBg:    "#2d2a1a",
  editableBorder:"#f59e0b",
};

// ─── Dropdown option lists ────────────────────────────────────────────────────
const MATERIAL_STATUS_OPTIONS = [
  "Pending",
  "Material Ready",
  "Material Dispatched",
  "Material Received",
  "Under Testing",
  "Testing Complete",
  "Hold",
  "Cancelled",
];

const FAT_PERCENTAGE_OPTIONS = [
  "0%", "10%", "20%", "25%", "30%", "40%", "50%",
  "60%", "70%", "75%", "80%", "90%", "95%", "100%",
];

// ─── Status color map ─────────────────────────────────────────────────────────
const MAT_STATUS_COLORS = {
  "Material Ready":      { bg: "#d4edda", text: "#155724", border: "#28a745" },
  "Material Dispatched": { bg: "#cce5ff", text: "#004085", border: "#007bff" },
  "Material Received":   { bg: "#d1ecf1", text: "#0c5460", border: "#17a2b8" },
  "Under Testing":       { bg: "#fff3cd", text: "#856404", border: "#ffc107" },
  "Testing Complete":    { bg: "#c3e6cb", text: "#155724", border: "#22c55e" },
  "Pending":             { bg: "#f8d7da", text: "#721c24", border: "#dc3545" },
  "Hold":                { bg: "#fde8d8", text: "#7c4010", border: "#f97316" },
  "Cancelled":           { bg: "#e2e3e5", text: "#383d41", border: "#6c757d" },
};
const getMatStyle = (s) => MAT_STATUS_COLORS[s] || { bg: "#f0f0f0", text: "#444", border: "#bbb" };

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtCr(n) {
  if (!n && n !== 0) return "0";
  const num = Number(n);
  if (num >= 10000000) return (num / 10000000).toFixed(2) + " Cr";
  if (num >= 100000)   return (num / 100000).toFixed(2) + " L";
  return num.toLocaleString("en-IN");
}

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ toasts, removeToast }) => (
  <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
    {toasts.map((toast) => (
      <div key={toast.id} style={{
        padding: "10px 16px", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 600,
        background: toast.type === "success" ? "#22c55e" : toast.type === "error" ? "#ef4444" : "#3b82f6",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        display: "flex", alignItems: "center", gap: 8,
        animation: "slideIn 0.3s ease", minWidth: 240, maxWidth: 360,
      }}>
        <span>{toast.type === "success" ? "✓" : toast.type === "error" ? "✗" : "ℹ"}</span>
        <span style={{ flex: 1 }}>{toast.message}</span>
        <span onClick={() => removeToast(toast.id)} style={{ cursor: "pointer", opacity: 0.7 }}>×</span>
      </div>
    ))}
    <style>{`@keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
  </div>
);

// ─── Editable Text Input Cell ─────────────────────────────────────────────────
const EditableInputCell = ({ value, node, colDef, placeholder = "" }) => {
  const [inputValue, setInputValue] = useState(value ?? "");
  const [focused, setFocused]       = useState(false);
  useEffect(() => { setInputValue(value ?? ""); }, [value]);

  return (
    <input
      type="text"
      value={inputValue}
      placeholder={placeholder}
      onChange={(e) => { setInputValue(e.target.value); node.setDataValue(colDef.field, e.target.value); }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: "100%", height: "100%",
        border: focused ? "2px solid #f59e0b" : "1px solid transparent",
        borderRadius: 3, padding: "0 7px", fontSize: 11,
        background: focused ? "#fffdf0" : "transparent",
        outline: "none", fontWeight: 500, color: "#1a2332",
        fontFamily: "inherit", transition: "all 0.15s",
      }}
    />
  );
};

// ─── Editable Date Input Cell ─────────────────────────────────────────────────
const EditableDateCell = ({ value, node, colDef }) => {
  const [inputValue, setInputValue] = useState(value ?? "");
  const [focused, setFocused]       = useState(false);
  useEffect(() => { setInputValue(value ?? ""); }, [value]);

  return (
    <input
      type="date"
      value={inputValue}
      onChange={(e) => { setInputValue(e.target.value); node.setDataValue(colDef.field, e.target.value); }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: "100%", height: "100%",
        border: focused ? "2px solid #f59e0b" : "1px solid transparent",
        borderRadius: 3, padding: "0 4px", fontSize: 11,
        background: focused ? "#fffdf0" : "transparent",
        outline: "none", color: "#1a2332",
        fontFamily: "inherit", transition: "all 0.15s",
      }}
    />
  );
};

// ─── Editable Select Cell ─────────────────────────────────────────────────────
const EditableSelectCell = ({ value, node, colDef, options }) => {
  const [focused, setFocused] = useState(false);
  return (
    <select
      value={value || ""}
      onChange={(e) => node.setDataValue(colDef.field, e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: "100%", height: "100%",
        border: focused ? "2px solid #f59e0b" : "1px solid transparent",
        borderRadius: 3, padding: "0 4px", fontSize: 11,
        background: focused ? "#fffdf0" : "transparent",
        outline: "none", fontWeight: 600, cursor: "pointer",
        color: "#1a2332", fontFamily: "inherit",
      }}
    >
      <option value="">— Select —</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
};

// ─── FAT % Progress Bar Cell ──────────────────────────────────────────────────
const FatProgressCell = ({ value, node, colDef }) => {
  const [focused, setFocused] = useState(false);
  const pct = parseInt(value) || 0;
  const barColor = pct === 100 ? "#22c55e" : pct >= 75 ? "#0ea5e9" : pct >= 50 ? "#f59e0b" : pct > 0 ? "#f97316" : "#e2e8f0";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, width: "100%", height: "100%" }}>
      <select
        value={value || ""}
        onChange={(e) => node.setDataValue(colDef.field, e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: 64, height: 24, fontSize: 11,
          border: focused ? "2px solid #f59e0b" : "1px solid #e2e8f0",
          borderRadius: 4, padding: "0 2px", background: focused ? "#fffdf0" : "#fff",
          outline: "none", fontWeight: 700, cursor: "pointer", color: barColor,
        }}
      >
        <option value="">—</option>
        {FAT_PERCENTAGE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      {/* Mini progress bar */}
      <div style={{ flex: 1, height: 6, background: "#e2e8f0", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: barColor, borderRadius: 4, transition: "width 0.4s ease" }} />
      </div>
    </div>
  );
};

// ─── Material Status Badge ────────────────────────────────────────────────────
const MatStatusBadge = ({ value }) => {
  if (!value) return <span style={{ color: "#ccc" }}>—</span>;
  const sc = getMatStyle(value);
  return (
    <span style={{
      background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`,
      borderRadius: 20, padding: "2px 9px", fontSize: 10, fontWeight: 700,
      whiteSpace: "nowrap", display: "inline-block",
    }}>{value}</span>
  );
};

// ─── System Type Badge ────────────────────────────────────────────────────────
const SystemTypeBadge = ({ value }) => {
  if (!value) return <span style={{ color: "#ccc" }}>—</span>;
  const colorMap = {
    "Material": { bg: "#dbeafe", text: "#1d4ed8", border: "#3b82f6" },
    "System":   { bg: "#ede9fe", text: "#6d28d9", border: "#8b5cf6" },
    "Panel":    { bg: "#dcfce7", text: "#15803d", border: "#22c55e" },
    "Software": { bg: "#fef9c3", text: "#a16207", border: "#eab308" },
  };
  const sc = colorMap[value] || { bg: "#f0f0f0", text: "#444", border: "#bbb" };
  return (
    <span style={{
      background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`,
      borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 700,
      whiteSpace: "nowrap", display: "inline-block",
    }}>{value}</span>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN FAT DASHBOARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const FatDashboard = () => {
  const [theme, setTheme]               = useState("light");
  const T                               = theme === "light" ? LIGHT : DARK;

  const [rowData, setRowData]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [financialYear, setFinancialYear] = useState("25-26");
  const [fyOptions, setFyOptions]       = useState([]);
  const [lastUpdated, setLastUpdated]   = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [toasts, setToasts]             = useState([]);
  const [savingRow, setSavingRow]       = useState(null);

  const gridRef = useRef();

  // ── Toast helpers ──────────────────────────────────────────────────────────
  const addToast = useCallback((message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);
  const removeToast = useCallback((id) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  // ── Fetch financial years (same as Design Dashboard) ──────────────────────
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
          if (opts.length) setFinancialYear(opts[opts.length - 1].value);
        }
      })
      .catch(() =>
        setFyOptions([
          { value: "23-24", label: "2023-24" },
          { value: "24-25", label: "2024-25" },
          { value: "25-26", label: "2025-26" },
        ])
      );
  }, []);

  // ── Fetch FAT data ─────────────────────────────────────────────────────────
  const fetchData = useCallback((year) => {
    setLoading(true);
    fetch(`${FAT_API}?financial_year=${year}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.status) {
          setRowData(res.data || []);
          setTotalRecords(res.total || res.data?.length || 0);
          setLastUpdated(res.lastTime || "");
        } else {
          setRowData([]);
          addToast("No data received for FY " + year, "error");
        }
      })
      .catch((err) => {
        setRowData([]);
        addToast("Failed to fetch data: " + err.message, "error");
      })
      .finally(() => setLoading(false));
  }, [addToast]);

  useEffect(() => { if (financialYear) fetchData(financialYear); }, [financialYear, fetchData]);

  // ── Save row (POST to saveFatDashboardApi.php) ────────────────────────────
  const handleSave = useCallback(async (params) => {
    const { data } = params;
    setSavingRow(data.FILE_ID);
    try {
      const formData = new FormData();
      formData.append("FILE_ID",         data.FILE_ID         || "");
      formData.append("FILE_NAME",       data.FILE_NAME       || "");
      formData.append("fat_date",        data.fat_date        || "");
      formData.append("system_type",     data.system_type     || "");
      formData.append("material_status", data.material_status || "");
      formData.append("fat_percentage",  data.fat_percentage  || "");
      formData.append("remark",          data.remark          || "");
      // Add session fields if needed:
      // formData.append("shortName",    "USERNAME");
      // formData.append("employee_id",  "EMP_ID");

      const response = await fetch(SAVE_API, { method: "POST", body: formData });
      const result   = await response.json();

      if (result.status) {
        addToast(`✓ ${result.message || "Saved"} — ${data.FILE_NAME}`, "success");
        // Sync local grid data
        setRowData((prev) =>
          prev.map((r) => r.FILE_ID === data.FILE_ID ? { ...r, ...data } : r)
        );
      } else {
        addToast("Save failed: " + (result.message || "Unknown error"), "error");
      }
    } catch (err) {
      addToast("Network error. Please try again.", "error");
    } finally {
      setSavingRow(null);
    }
  }, [addToast]);

  // ── Column Definitions ────────────────────────────────────────────────────
  const columnDefs = useMemo(() => [
    // Sr No
    {
      headerName: "Sr No",
      valueGetter: (p) => (p.node ? p.node.rowIndex + 1 : ""),
      width: 70, minWidth: 60,
      pinned: "left", lockPosition: true,
      sortable: false, filter: false,
      cellStyle: { fontWeight: 700, textAlign: "center", color: T.subtext, fontSize: 11 },
    },
    // File ID
    {
      field: "FILE_ID", headerName: "File ID",
      width: 90, minWidth: 80,
      pinned: "left", lockPosition: true,
      filter: "agTextColumnFilter", floatingFilter: true,
      cellStyle: { fontFamily: "monospace", color: T.accent, fontWeight: 700, fontSize: 11 },
    },
    // File Name
    {
      field: "FILE_NAME", headerName: "File Name",
      width: 220, minWidth: 160,
      pinned: "left", lockPosition: true,
      filter: "agTextColumnFilter", floatingFilter: true,
      cellStyle: { fontWeight: 600, fontSize: 11, color: T.text },
      tooltipField: "FILE_NAME",
    },
    // System Type
    {
      field: "system_type", headerName: "System Type",
      width: 120, minWidth: 100,
      filter: "agTextColumnFilter", floatingFilter: true,
      cellRenderer: (p) => <SystemTypeBadge value={p.value} />,
      cellStyle: { display: "flex", alignItems: "center" },
    },
    // FAT Date ✏️ (editable)
    {
      field: "fat_date", headerName: "FAT Date ✏️",
      width: 155, minWidth: 130,
      filter: "agDateColumnFilter", floatingFilter: true,
      headerClass: "editable-header",
      cellRenderer: (p) => <EditableDateCell value={p.value} node={p.node} colDef={p.colDef} />,
      cellStyle: {
        background: "rgba(245,158,11,0.07)",
        borderLeft: "3px solid #f59e0b",
        padding: 0,
      },
    },
    // Material Status ✏️ (editable select)
    {
      field: "material_status", headerName: "Material Status ✏️",
      width: 195, minWidth: 160,
      filter: "agTextColumnFilter", floatingFilter: true,
      headerClass: "editable-header",
      cellRenderer: (p) => (
        <EditableSelectCell
          value={p.value}
          node={p.node}
          colDef={p.colDef}
          options={MATERIAL_STATUS_OPTIONS}
        />
      ),
      cellStyle: {
        background: "rgba(245,158,11,0.07)",
        borderLeft: "3px solid #f59e0b",
        padding: 0,
      },
    },
    // FAT % ✏️ (editable select + progress bar)
    {
      field: "fat_percentage", headerName: "FAT % ✏️",
      width: 200, minWidth: 160,
      filter: "agTextColumnFilter", floatingFilter: true,
      headerClass: "editable-header",
      cellRenderer: (p) => (
        <FatProgressCell value={p.value} node={p.node} colDef={p.colDef} />
      ),
      cellStyle: {
        background: "rgba(14,165,233,0.06)",
        borderLeft: "3px solid #0ea5e9",
        padding: "0 6px",
      },
    },
    // Remark ✏️ (editable text)
    {
      field: "remark", headerName: "Remark ✏️",
      width: 220, minWidth: 160,
      filter: "agTextColumnFilter", floatingFilter: true,
      headerClass: "editable-header",
      cellRenderer: (p) => (
        <EditableInputCell
          value={p.value}
          node={p.node}
          colDef={p.colDef}
          placeholder="Add remark…"
        />
      ),
      cellStyle: {
        background: "rgba(245,158,11,0.07)",
        borderLeft: "3px solid #f59e0b",
        padding: 0,
      },
    },
    // Action (pinned right)
    {
      headerName: "Action",
      width: 100, minWidth: 90,
      pinned: "right", sortable: false, filter: false,
      cellRenderer: (params) => {
        const isSaving = savingRow === params.data?.FILE_ID;
        return (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
            <button
              onClick={() => handleSave(params)}
              disabled={isSaving}
              style={{
                background: isSaving
                  ? "#94a3b8"
                  : "linear-gradient(135deg,#1e3a5f 0%,#0ea5e9 100%)",
                color: "#fff", border: "none", borderRadius: 6,
                padding: "4px 12px", fontSize: 10, fontWeight: 700,
                cursor: isSaving ? "not-allowed" : "pointer",
                boxShadow: "0 2px 6px rgba(14,165,233,0.3)",
                transition: "all 0.2s", whiteSpace: "nowrap",
              }}
            >
              {isSaving ? "⏳…" : "💾 Save"}
            </button>
          </div>
        );
      },
      cellStyle: { background: T.gridBg, padding: "0 4px" },
    },
  ], [T, handleSave, savingRow]);

  const defaultColDef = useMemo(() => ({
    sortable: true, resizable: true, suppressHeaderMenuButton: false,
  }), []);

  // ── Toolbar actions ────────────────────────────────────────────────────────
  const exportCsv = () =>
    gridRef.current?.api?.exportDataAsCsv({
      fileName: `FatDashboard_${financialYear}_${new Date().toISOString().split("T")[0]}.csv`,
    });

  const autoSize = () => {
    const ids = gridRef.current?.api?.getColumns()?.map((c) => c.getId()) || [];
    if (ids.length) gridRef.current.api.autoSizeColumns(ids, false);
  };

  // ── Summary stats ──────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total        = rowData.length;
    const completed    = rowData.filter((r) => r.fat_percentage === "100%").length;
    const inProgress   = rowData.filter((r) => r.fat_percentage && r.fat_percentage !== "0%" && r.fat_percentage !== "100%").length;
    const pending      = rowData.filter((r) => !r.fat_percentage || r.fat_percentage === "0%" || r.fat_percentage === "").length;
    const withDate     = rowData.filter((r) => r.fat_date).length;
    const matReady     = rowData.filter((r) => r.material_status === "Material Ready").length;
    return { total, completed, inProgress, pending, withDate, matReady };
  }, [rowData]);

  const fyLabel = fyOptions.find((f) => f.value === financialYear)?.label || financialYear;

  // ── Status breakdown chips ─────────────────────────────────────────────────
  const matStatusBreakdown = useMemo(() => {
    const map = {};
    rowData.forEach((r) => { if (r.material_status) map[r.material_status] = (map[r.material_status] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [rowData]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh", background: T.bg, color: T.text,
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      transition: "background 0.3s, color 0.3s",
    }}>
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* ── STICKY HEADER ── */}
      <div style={{
        background: T.header, padding: "0 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 56, boxShadow: "0 2px 16px rgba(0,0,0,0.2)",
        position: "sticky", top: 0, zIndex: 200,
      }}>
        {/* Logo + title */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9,
            background: "linear-gradient(135deg,#f59e0b,#ef4444)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 900, color: "#fff",
            boxShadow: "0 3px 10px rgba(245,158,11,0.5)",
          }}>⚡</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: "#fff", letterSpacing: 0.5 }}>
              SURYA ERP — FAT Dashboard
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", letterSpacing: 1, textTransform: "uppercase" }}>
              {lastUpdated ? `Last Updated: ${lastUpdated}` : "FACTORY ACCEPTANCE TEST MANAGEMENT"}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* FY Label */}
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>
            Financial Year:
          </span>
          {/* FY Dropdown */}
          <select
            value={financialYear}
            onChange={(e) => setFinancialYear(e.target.value)}
            style={{
              padding: "6px 12px", borderRadius: 7,
              border: "1px solid rgba(255,255,255,0.3)",
              background: "rgba(255,255,255,0.15)", color: "#fff",
              fontWeight: 700, fontSize: 13, cursor: "pointer", outline: "none",
              backdropFilter: "blur(4px)", minWidth: 110,
            }}
          >
            {fyOptions.length === 0
              ? <option style={{ color: "#000" }}>Loading…</option>
              : fyOptions.map((y) => (
                  <option key={y.value} value={y.value} style={{ color: "#000", background: "#fff" }}>
                    {y.label}
                  </option>
                ))
            }
          </select>

          {/* Dark/Light toggle */}
          <button
            onClick={() => setTheme((th) => (th === "light" ? "dark" : "light"))}
            style={{
              padding: "6px 14px", border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: 7, background: "rgba(255,255,255,0.1)",
              color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer",
            }}
          >
            {theme === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>
        </div>
      </div>

      {/* ── SUMMARY STRIP ── */}
      {!loading && rowData.length > 0 && (
        <div style={{
          background: T.card, borderBottom: `1px solid ${T.border}`,
          padding: "10px 24px", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center",
        }}>
          {[
            { label: "Total Records",   value: totalRecords.toLocaleString("en-IN"), color: T.accent,  bg: T.accent + "12" },
            { label: "FAT Complete",    value: stats.completed,                       color: "#22c55e", bg: "#22c55e12" },
            { label: "In Progress",     value: stats.inProgress,                      color: "#f59e0b", bg: "#f59e0b12" },
            { label: "Pending / 0%",   value: stats.pending,                          color: "#ef4444", bg: "#ef444412" },
            { label: "FAT Date Set",    value: stats.withDate,                        color: "#8b5cf6", bg: "#8b5cf612" },
            { label: "Material Ready", value: stats.matReady,                         color: "#0891b2", bg: "#0891b212" },
          ].map((s, i) => (
            <div key={i} style={{
              background: s.bg, border: `1px solid ${s.color}33`,
              borderRadius: 8, padding: "6px 14px", minWidth: 120,
            }}>
              <div style={{ fontSize: 9, color: s.color, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>{s.label}</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}

          {/* Editable legend */}
          <div style={{ marginLeft: "auto" }}>
            <div style={{
              background: "rgba(245,158,11,0.1)", border: "1px solid #f59e0b33",
              borderLeft: "3px solid #f59e0b", borderRadius: 6,
              padding: "4px 12px", fontSize: 11, color: "#92400e", fontWeight: 600,
            }}>
              ✏️ Yellow/Blue columns are editable — click to edit, then Save
            </div>
          </div>
        </div>
      )}

      {/* ── MATERIAL STATUS BREAKDOWN ── */}
      {!loading && matStatusBreakdown.length > 0 && (
        <div style={{
          background: T.card, borderBottom: `1px solid ${T.border}`,
          padding: "8px 24px", display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center",
        }}>
          <span style={{ fontSize: 11, color: T.subtext, fontWeight: 700, marginRight: 4 }}>Material Status:</span>
          {matStatusBreakdown.map(([status, count]) => {
            const sc = getMatStyle(status);
            return (
              <span key={status} style={{
                background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`,
                borderRadius: 20, padding: "2px 10px", fontSize: 10, fontWeight: 700,
              }}>{status}: {count}</span>
            );
          })}
        </div>
      )}

      {/* ── TOOLBAR ── */}
      <div style={{
        background: T.card, borderBottom: `1px solid ${T.border}`,
        padding: "8px 24px", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap",
      }}>
        <span style={{ fontSize: 12, color: T.subtext, fontWeight: 600 }}>
          FY {fyLabel}
          {!loading && ` · ${rowData.length} records`}
        </span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {[
            { label: "📥 Export CSV", onClick: exportCsv,                      bg: "#22c55e" },
            { label: "↔ Auto Size",  onClick: autoSize,                         bg: "#f59e0b" },
            { label: "🔄 Refresh",   onClick: () => fetchData(financialYear),   bg: "#3b82f6" },
          ].map((btn) => (
            <button key={btn.label} onClick={btn.onClick} style={{
              padding: "6px 14px", background: btn.bg, border: "none",
              borderRadius: 7, color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer",
              boxShadow: `0 2px 6px ${btn.bg}55`, transition: "opacity 0.15s",
            }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
            >{btn.label}</button>
          ))}
        </div>
      </div>

      {/* ── GRID CONTENT ── */}
      <div style={{ padding: "16px 24px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: T.subtext }}>
            <div style={{
              width: 44, height: 44,
              border: `4px solid ${T.border}`,
              borderTop: `4px solid ${T.accent}`,
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 14px",
            }} />
            <div style={{ fontSize: 14, fontWeight: 600 }}>Loading FAT Dashboard…</div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : rowData.length === 0 ? (
          <div style={{
            textAlign: "center", padding: 80, color: "#ef4444",
            fontSize: 15, fontWeight: 600,
          }}>
            ⚠️ No data found for FY {fyLabel}. Check API connection or select a different year.
          </div>
        ) : (
          <div style={{
            background: T.card, border: `1px solid ${T.border}`,
            borderRadius: 12, overflow: "hidden",
            boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
          }}>
            <style>{`
              .editable-header { background: rgba(245,158,11,0.13) !important; }
              .ag-theme-alpine     .ag-header-cell { font-size: 11px !important; font-weight: 700 !important; }
              .ag-theme-alpine-dark .ag-header-cell { font-size: 11px !important; font-weight: 700 !important; }
              .ag-floating-filter-input { font-size: 11px !important; }
              .ag-theme-alpine .ag-paging-panel { font-size: 12px !important; color: #64748b !important; }
            `}</style>

            <div
              className={theme === "light" ? "ag-theme-alpine" : "ag-theme-alpine-dark"}
              style={{
                height: "calc(100vh - 310px)",
                minHeight: 420,
                width: "100%",
                "--ag-background-color":        T.gridBg,
                "--ag-header-background-color": T.tableHead,
                "--ag-header-foreground-color": "#fff",
                "--ag-foreground-color":        T.text,
                "--ag-border-color":            T.border,
                "--ag-odd-row-background-color": T.gridBg,
                "--ag-row-hover-color":         theme === "light" ? "#e0f2fe" : "#1e3a5f33",
                "--ag-font-size":               "11px",
              }}
            >
              <AgGridReact
                ref={gridRef}
                rowData={rowData}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                pagination={true}
                paginationPageSize={20}
                paginationPageSizeSelector={[10, 20, 50, 100]}
                animateRows={true}
                rowHeight={38}
                headerHeight={44}
                floatingFiltersHeight={36}
                enableCellTextSelection={true}
                tooltipShowDelay={300}
                onGridReady={() => setTimeout(autoSize, 400)}
                getRowStyle={(p) => ({
                  background: p.node.rowIndex % 2 === 0
                    ? (theme === "light" ? "#f8fafc" : "#161b22")
                    : (theme === "light" ? "#ffffff" : "#1a2332"),
                })}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FatDashboard;