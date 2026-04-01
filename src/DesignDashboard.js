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

// ─── Theme (matches Surya ERP) ────────────────────────────────────────────────
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
  editableBg: "#fffbeb",
  editableBorder: "#f59e0b",
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
  editableBg: "#2d2a1a",
  editableBorder: "#f59e0b",
};

// ─── Design Owner Options ─────────────────────────────────────────────────────
const DESIGN_OWNERS = ["SBK", "SRA", "PPP", "SSN", "SAA", "VVD", "VDK", "AGP", "SVJ", "RPK", "PAL", "HMT"];

// ─── Toast Notification ───────────────────────────────────────────────────────
const Toast = ({ toasts, removeToast }) => (
  <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
    {toasts.map((toast) => (
      <div key={toast.id} style={{
        padding: "10px 16px", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 600,
        background: toast.type === "success" ? "#22c55e" : toast.type === "error" ? "#ef4444" : "#3b82f6",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        display: "flex", alignItems: "center", gap: 8,
        animation: "slideIn 0.3s ease",
        minWidth: 240, maxWidth: 360
      }}>
        <span>{toast.type === "success" ? "✓" : toast.type === "error" ? "✗" : "ℹ"}</span>
        <span style={{ flex: 1 }}>{toast.message}</span>
        <span onClick={() => removeToast(toast.id)} style={{ cursor: "pointer", opacity: 0.7 }}>×</span>
      </div>
    ))}
    <style>{`@keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
  </div>
);

// ─── Editable Input Cell ──────────────────────────────────────────────────────
const EditableInputCell = ({ value, node, colDef, api, t }) => {
  const [inputValue, setInputValue] = useState(value ?? "");
  const [focused, setFocused] = useState(false);

  useEffect(() => { setInputValue(value ?? ""); }, [value]);

  const handleChange = (e) => {
    const newVal = e.target.value;
    setInputValue(newVal);
    node.setDataValue(colDef.field, newVal);
  };

  return (
    <input
      type="text"
      value={inputValue}
      onChange={handleChange}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: "100%", height: "100%",
        border: focused ? `2px solid #f59e0b` : `1px solid ${focused ? "#f59e0b" : "transparent"}`,
        borderRadius: 3, padding: "0 6px",
        textAlign: "right", fontSize: 11,
        background: focused ? "#fffdf0" : "transparent",
        outline: "none", fontWeight: 600,
        color: "#1a2332",
        transition: "all 0.15s"
      }}
    />
  );
};

// ─── Editable Select Cell ─────────────────────────────────────────────────────
const EditableSelectCell = ({ value, node, colDef, options }) => {
  const [focused, setFocused] = useState(false);

  const handleChange = (e) => {
    node.setDataValue(colDef.field, e.target.value);
  };

  return (
    <select
      value={value || ""}
      onChange={handleChange}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: "100%", height: "100%",
        border: focused ? "2px solid #f59e0b" : "1px solid transparent",
        borderRadius: 3, padding: "0 2px",
        fontSize: 11, background: focused ? "#fffdf0" : "transparent",
        outline: "none", fontWeight: 700, cursor: "pointer",
        color: "#1a2332"
      }}
    >
      <option value="">— Select —</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
};

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
const DesignDashboardGrid = () => {
  const [theme, setTheme] = useState("light");
  const t = theme === "light" ? LIGHT : DARK;

  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [financialYear, setFinancialYear] = useState("25-26");
  const [fyOptions, setFyOptions] = useState([]);
  const [lastUpdated, setLastUpdated] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [savingRow, setSavingRow] = useState(null);
  const gridRef = useRef();

  // Toast helper
  const addToast = useCallback((message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);
  const removeToast = useCallback((id) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  // Fetch financial years
  useEffect(() => {
    fetch("https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/GetYearsApi.php")
      .then((r) => r.json())
      .then((res) => {
        if (res.status === "success" && Array.isArray(res.data)) {
          const opts = res.data.map((d) => ({ value: d.financial_year, label: `20${d.financial_year}` }));
          setFyOptions(opts);
          if (opts.length) setFinancialYear(opts[opts.length - 1].value);
        }
      })
      .catch(() => setFyOptions([{ value: "25-26", label: "2025-26" }]));
  }, []);

  // Fetch design dashboard data
  const fetchData = useCallback((year) => {
    setLoading(true);
    fetch(`http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/DesignDashboardApi.php?financial_year=${year}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.status === "success" && Array.isArray(res.data)) {
          setRowData(res.data);
          setTotalRecords(res.total_records || res.data.length);
          setLastUpdated(res.lastTime || "");
        } else {
          setRowData([]);
          addToast("No data received from API", "error");
        }
      })
      .catch((err) => {
        setRowData([]);
        addToast("Failed to fetch data: " + err.message, "error");
      })
      .finally(() => setLoading(false));
  }, [addToast]);

  useEffect(() => { if (financialYear) fetchData(financialYear); }, [financialYear, fetchData]);

  // Save row handler
 const handleSave = useCallback(async (params) => {
  const { data } = params;
  setSavingRow(data.FILE_ID);
  try {
    const formData = new FormData();
    formData.append("FILE_ID",                  data.FILE_ID        || "");
    formData.append("mktg_owner",               data.mktg_owner     || "");
    formData.append("IS_FP_Upload",             data.IS_FP_Upload   || "");
    formData.append("design_owner",             data.design_owner   || "");
    formData.append("file_type",                data.file_type      || "");
    formData.append("po_amount",                data.po_amount      || 0);
    formData.append("mktg_cost",                data.mktg_cost      || 0);
    formData.append("design_cost",              data.design_cost    || 0);
    formData.append("diff_bet_mktg_design_cost",data.diff_bet_mktg_design_cost || 0);
    formData.append("diff_wrt_b",               data.diff_wrt_b     || "");
    formData.append("design_po",                data.design_po      || "");
    formData.append("mktg_po",                  data.mktg_po        || "");

    const response = await fetch(
      "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/saveDesignDashboardApi.php",
      { method: "POST", body: formData }
    );
    const result = await response.json();
    if (result.status === "success") {
      addToast(`✓ Saved ${data.FILE_NAME} successfully`, "success");
    } else {
      addToast("Save failed: " + (result.message || "Unknown error"), "error");
    }
  } catch (err) {
    addToast("Network error. Please try again.", "error");
  } finally {
    setSavingRow(null);
  }
}, [addToast]);

  // Format number Indian style
  const fmtIN = (v) => {
    if (!v && v !== 0) return "—";
    return Number(v).toLocaleString("en-IN");
  };

  // Column Definitions
  const columnDefs = useMemo(() => [
    {
      headerName: "Sr No",
      valueGetter: (p) => (p.node ? p.node.rowIndex + 1 : ""),
      width: 70, minWidth: 60, pinned: "left", lockPosition: true,
      sortable: false, filter: false,
      cellStyle: { fontWeight: 700, textAlign: "center", color: t.subtext, fontSize: 11 },
    },
    {
      field: "FILE_NAME", headerName: "File No",
      width: 160, minWidth: 130, pinned: "left", lockPosition: true,
      filter: "agTextColumnFilter", floatingFilter: true,
      cellStyle: { fontWeight: 700, fontSize: 11, color: t.accent },
      tooltipField: "FILE_NAME"
    },
    {
      field: "IS_FP_Upload", headerName: "FP Uploaded",
      width: 110, minWidth: 90,
      filter: "agTextColumnFilter", floatingFilter: true,
      cellRenderer: (p) => (
        <span style={{
          background: p.value === "YES" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.12)",
          color: p.value === "YES" ? "#16a34a" : "#dc2626",
          borderRadius: 4, padding: "2px 8px", fontSize: 10, fontWeight: 700
        }}>{p.value || "NO"}</span>
      ),
      cellStyle: { textAlign: "center" }
    },
    {
      field: "design_owner", headerName: "Design Owner / File Done By",
      width: 160, minWidth: 130,
      filter: "agTextColumnFilter", floatingFilter: true,
      headerStyle: { background: "#fff3cd" },
      cellRenderer: (p) => (
        <EditableSelectCell
          value={p.value} node={p.node} colDef={p.colDef}
          options={DESIGN_OWNERS}
        />
      ),
      cellStyle: {
        background: "rgba(245,158,11,0.08)",
        borderLeft: "3px solid #f59e0b",
        padding: "0", fontSize: 11
      },
    },
    {
      field: "file_type", headerName: "Type Of File",
      width: 130, minWidth: 100,
      filter: "agTextColumnFilter", floatingFilter: true,
      cellStyle: { fontSize: 11 }
    },
    {
      field: "kg_design", headerName: "Design Kg",
      width: 110, minWidth: 90,
      filter: "agNumberColumnFilter", floatingFilter: true,
      valueFormatter: (p) => fmtIN(p.value),
      cellStyle: { textAlign: "right", fontSize: 11, fontWeight: 600 }
    },
    {
      field: "kg_mktg", headerName: "Mktg Kg",
      width: 100, minWidth: 80,
      filter: "agNumberColumnFilter", floatingFilter: true,
      valueFormatter: (p) => fmtIN(p.value),
      cellStyle: { textAlign: "right", fontSize: 11 }
    },
    {
      field: "po_amount", headerName: "PO Amount",
      width: 120, minWidth: 100,
      filter: "agNumberColumnFilter", floatingFilter: true,
      valueFormatter: (p) => fmtIN(p.value),
      cellStyle: { textAlign: "right", fontSize: 11, fontWeight: 600, color: "#2563eb" }
    },
    {
      field: "mktg_cost", headerName: "R/M Cost Mktg (A)",
      width: 140, minWidth: 120,
      filter: "agNumberColumnFilter", floatingFilter: true,
      valueFormatter: (p) => fmtIN(p.value),
      cellStyle: { textAlign: "right", fontSize: 11, fontWeight: 600 }
    },
    {
      field: "design_cost", headerName: "R/M Cost Design (B)",
      width: 160, minWidth: 130,
      filter: "agNumberColumnFilter", floatingFilter: true,
      headerClass: "editable-header",
      cellRenderer: (p) => (
        <EditableInputCell value={p.value} node={p.node} colDef={p.colDef} api={p.api} t={t} />
      ),
      cellStyle: {
        background: "rgba(245,158,11,0.08)",
        borderLeft: "3px solid #f59e0b",
        padding: "0", fontSize: 11
      },
    },
    {
      field: "diff_bet_mktg_design_cost", headerName: "(A)-(B)",
      width: 110, minWidth: 90,
      filter: "agNumberColumnFilter", floatingFilter: true,
      valueFormatter: (p) => fmtIN(p.value),
      cellStyle: (p) => ({
        textAlign: "right", fontSize: 11, fontWeight: 700,
        color: Number(p.value) >= 0 ? "#16a34a" : "#dc2626"
      })
    },
    {
      field: "diff_wrt_b", headerName: "Diff wrt B (%)",
      width: 120, minWidth: 100,
      filter: "agNumberColumnFilter", floatingFilter: true,
      valueFormatter: (p) => p.value ? p.value + "%" : "—",
      cellStyle: (p) => ({
        textAlign: "right", fontSize: 11,
        color: Number(p.value) > 0 ? "#16a34a" : "#dc2626"
      })
    },
    {
      field: "design_po", headerName: "Design/PO (%)",
      width: 130, minWidth: 100,
      filter: "agNumberColumnFilter", floatingFilter: true,
      valueFormatter: (p) => p.value ? p.value + "%" : "—",
      cellStyle: { textAlign: "right", fontSize: 11 }
    },
    {
      field: "mktg_po", headerName: "Mktg/PO (%)",
      width: 120, minWidth: 100,
      filter: "agNumberColumnFilter", floatingFilter: true,
      valueFormatter: (p) => p.value ? p.value + "%" : "—",
      cellStyle: { textAlign: "right", fontSize: 11 }
    },
    {
      field: "mktg_owner", headerName: "Mktg Owner",
      width: 110, minWidth: 90,
      filter: "agTextColumnFilter", floatingFilter: true,
      cellStyle: { fontSize: 11, fontWeight: 600, color: t.accent, textAlign: "center" }
    },
    {
      field: "CUSTOMER_NAME", headerName: "Customer",
      width: 180, minWidth: 140,
      filter: "agTextColumnFilter", floatingFilter: true,
      cellStyle: { fontSize: 11 },
      tooltipField: "CUSTOMER_NAME"
    },
    {
      field: "count", headerName: "Count",
      width: 90, minWidth: 70,
      filter: "agNumberColumnFilter", floatingFilter: true,
      cellStyle: { textAlign: "center", fontSize: 11, fontWeight: 600 }
    },
    {
      field: "designExcel", headerName: "Design Excel",
      width: 120, minWidth: 100,
      filter: "agTextColumnFilter", floatingFilter: true,
      cellRenderer: (p) => p.value ? (
        <span style={{
          background: "rgba(37,99,235,0.12)", color: "#2563eb",
          borderRadius: 4, padding: "2px 8px", fontSize: 10, fontWeight: 700
        }}>{p.value}</span>
      ) : "—",
      cellStyle: { textAlign: "center" }
    },
    {
      field: "advanceCopy", headerName: "Advance Copy",
      width: 130, minWidth: 100,
      filter: "agTextColumnFilter", floatingFilter: true,
      cellRenderer: (p) => p.value ? (
        <span style={{
          background: "rgba(16,185,129,0.12)", color: "#059669",
          borderRadius: 4, padding: "2px 8px", fontSize: 10, fontWeight: 700
        }}>{p.value}</span>
      ) : "—",
      cellStyle: { textAlign: "center" }
    },
    {
      headerName: "Action",
      field: "action",
      width: 90, minWidth: 80,
      sortable: false, filter: false, pinned: "right",
      cellRenderer: (params) => {
        const isSaving = savingRow === params.data.FILE_ID;
        return (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
            <button
              onClick={() => handleSave(params)}
              disabled={isSaving}
              style={{
                background: isSaving
                  ? "#94a3b8"
                  : "linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%)",
                color: "#fff", border: "none", borderRadius: 6,
                padding: "4px 12px", fontSize: 10, fontWeight: 700,
                cursor: isSaving ? "not-allowed" : "pointer",
                boxShadow: "0 2px 6px rgba(37,99,235,0.25)",
                transition: "all 0.2s", whiteSpace: "nowrap"
              }}
            >
              {isSaving ? "Saving…" : "💾 Save"}
            </button>
          </div>
        );
      },
      cellStyle: { background: "#f8fafc", padding: "0 4px" }
    }
  ], [t, handleSave, savingRow]);

  const defaultColDef = useMemo(() => ({
    sortable: true, resizable: true, suppressHeaderMenuButton: false,
  }), []);

  const exportCsv = () => {
    gridRef.current?.api?.exportDataAsCsv({
      fileName: `DesignDashboard_${financialYear}_${new Date().toISOString().split("T")[0]}.csv`,
    });
  };

  const autoSize = () => {
    const ids = gridRef.current?.api?.getColumns()?.map((c) => c.getId()) || [];
    if (ids.length) gridRef.current.api.autoSizeColumns(ids, false);
  };

  // Summary stats
  const stats = useMemo(() => {
    if (!rowData.length) return {};
    const totalPO = rowData.reduce((s, r) => s + Number(r.po_amount || 0), 0);
    const totalMktgCost = rowData.reduce((s, r) => s + Number(r.mktg_cost || 0), 0);
    const totalDesignCost = rowData.reduce((s, r) => s + Number(r.design_cost || 0), 0);
    const totalDiff = rowData.reduce((s, r) => s + Number(r.diff_bet_mktg_design_cost || 0), 0);
    return { totalPO, totalMktgCost, totalDesignCost, totalDiff };
  }, [rowData]);

  const fmtCr = (n) => {
    if (!n) return "₹0";
    if (n >= 10000000) return "₹" + (n / 10000000).toFixed(2) + " Cr";
    if (n >= 100000) return "₹" + (n / 100000).toFixed(2) + " L";
    return "₹" + n.toLocaleString("en-IN");
  };

  return (
    <div style={{
      minHeight: "100vh", background: t.bg, color: t.text,
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      transition: "background 0.3s, color 0.3s"
    }}>
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* ── TOP HEADER ── */}
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
              SURYA ERP — Design Dashboard
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", letterSpacing: 1 }}>
              {lastUpdated ? `Last Updated: ${lastUpdated}` : "DESIGN COST MANAGEMENT SYSTEM"}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <select
            value={financialYear}
            onChange={(e) => setFinancialYear(e.target.value)}
            style={{
              padding: "6px 12px", borderRadius: 6, border: "none",
              background: "rgba(255,255,255,0.15)", color: "#fff",
              fontWeight: 600, fontSize: 13, cursor: "pointer", outline: "none"
            }}
          >
            {fyOptions.map((y) => (
              <option key={y.value} value={y.value} style={{ color: "#000" }}>{y.label}</option>
            ))}
          </select>
          <button
            onClick={() => setTheme((th) => (th === "light" ? "dark" : "light"))}
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

      {/* ── SUMMARY STRIP ── */}
      {!loading && rowData.length > 0 && (
        <div style={{
          background: t.card, borderBottom: `1px solid ${t.border}`,
          padding: "10px 24px", display: "flex", gap: 12, flexWrap: "wrap",
          alignItems: "center"
        }}>
          {[
            { label: "Total Records", value: totalRecords.toLocaleString("en-IN"), color: t.accent, bg: "rgba(37,99,235,0.08)" },
            { label: "Total PO Amount", value: fmtCr(stats.totalPO), color: "#2563eb", bg: "rgba(37,99,235,0.07)" },
            { label: "Total Mktg Cost (A)", value: fmtCr(stats.totalMktgCost), color: "#7c3aed", bg: "rgba(124,58,237,0.07)" },
            { label: "Total Design Cost (B)", value: fmtCr(stats.totalDesignCost), color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
            { label: "Total (A)-(B)", value: fmtCr(stats.totalDiff), color: stats.totalDiff >= 0 ? "#16a34a" : "#dc2626", bg: stats.totalDiff >= 0 ? "rgba(22,163,74,0.08)" : "rgba(220,38,38,0.08)" },
          ].map((s, i) => (
            <div key={i} style={{
              background: s.bg, border: `1px solid ${s.color}33`,
              borderRadius: 8, padding: "6px 14px", minWidth: 140
            }}>
              <div style={{ fontSize: 9, color: s.color, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>{s.label}</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}

          {/* Editable column legend */}
          <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{
              background: "rgba(245,158,11,0.1)", border: "1px solid #f59e0b33",
              borderLeft: "3px solid #f59e0b",
              borderRadius: 6, padding: "4px 12px", fontSize: 11, color: "#92400e", fontWeight: 600
            }}>
              ✏️ Yellow columns are editable — click to edit, then Save
            </div>
          </div>
        </div>
      )}

      {/* ── TOOLBAR ── */}
      <div style={{
        background: t.card, borderBottom: `1px solid ${t.border}`,
        padding: "8px 24px", display: "flex", gap: 8, alignItems: "center",
        flexWrap: "wrap"
      }}>
        <span style={{ fontSize: 12, color: t.subtext, fontWeight: 600 }}>
          FY {fyOptions.find(f => f.value === financialYear)?.label || financialYear}
          {!loading && ` · ${rowData.length} records`}
        </span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {[
            { label: "📥 Export CSV", onClick: exportCsv, bg: "#22c55e" },
            { label: "↔ Auto Size", onClick: autoSize, bg: "#f59e0b" },
            { label: "🔄 Refresh", onClick: () => fetchData(financialYear), bg: "#3b82f6" },
          ].map((btn) => (
            <button key={btn.label} onClick={btn.onClick} style={{
              padding: "6px 14px", background: btn.bg, border: "none",
              borderRadius: 6, color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer"
            }}>{btn.label}</button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ padding: "16px 24px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: t.subtext }}>
            <div style={{
              width: 44, height: 44, border: `4px solid ${t.border}`,
              borderTop: `4px solid ${t.accent}`, borderRadius: "50%",
              animation: "spin 0.8s linear infinite", margin: "0 auto 14px"
            }} />
            <div style={{ fontSize: 14 }}>Loading Design Dashboard...</div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : rowData.length === 0 ? (
          <div style={{ textAlign: "center", padding: 80, color: "#ef4444" }}>
            ⚠️ No data found for FY {financialYear}. Check API connection or select a different year.
          </div>
        ) : (
          <div style={{
            background: t.card, border: `1px solid ${t.border}`,
            borderRadius: 12, overflow: "hidden",
            boxShadow: "0 2px 12px rgba(0,0,0,0.07)"
          }}>
            <style>{`
              .editable-header { background: rgba(245,158,11,0.15) !important; }
              .ag-theme-alpine .ag-header-cell { font-size: 11px !important; font-weight: 700 !important; }
              .ag-theme-alpine-dark .ag-header-cell { font-size: 11px !important; font-weight: 700 !important; }
              .ag-floating-filter-input { font-size: 11px !important; }
            `}</style>
            <div
              className={theme === "light" ? "ag-theme-alpine" : "ag-theme-alpine-dark"}
              style={{
                height: "calc(100vh - 290px)",
                minHeight: 400,
                width: "100%",
                "--ag-background-color": t.gridBg,
                "--ag-header-background-color": t.tableHead,
                "--ag-header-foreground-color": "#fff",
                "--ag-foreground-color": t.text,
                "--ag-border-color": t.border,
                "--ag-odd-row-background-color": t.tableRow,
                "--ag-row-hover-color": theme === "light" ? "#eff6ff" : "#1e3a5f33",
                "--ag-font-size": "11px",
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
                rowHeight={36}
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

export default DesignDashboardGrid;