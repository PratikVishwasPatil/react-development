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

const BASE = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC";

// ─── Theme ────────────────────────────────────────────────────────────────────
const LIGHT = {
  bg: "#f0f4f8", card: "#ffffff", border: "#dde3ec",
  text: "#1a2332", subtext: "#64748b",
  header: "linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%)",
  accent: "#2563eb", tableHead: "#1e3a5f",
  tableRow: "#f8fafc", tableRowAlt: "#ffffff",
  gridBg: "#f8fafc",
};
const DARK = {
  bg: "#0d1117", card: "#161b22", border: "#30363d",
  text: "#e6edf3", subtext: "#8b949e",
  header: "linear-gradient(135deg,#0d1117 0%,#1f2937 100%)",
  accent: "#58a6ff", tableHead: "#0d1117",
  tableRow: "#161b22", tableRowAlt: "#1a2332",
  gridBg: "#161b22",
};

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ toasts, removeToast }) => (
  <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
    {toasts.map((toast) => (
      <div key={toast.id} style={{
        padding: "10px 16px", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 600,
        background: toast.type === "success" ? "#22c55e" : toast.type === "error" ? "#ef4444" : "#3b82f6",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        display: "flex", alignItems: "center", gap: 8,
        animation: "slideIn 0.3s ease", minWidth: 240, maxWidth: 360
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
const EditableInputCell = ({ value, node, colDef }) => {
  const [inputValue, setInputValue] = useState(value ?? "");
  const [focused, setFocused] = useState(false);
  useEffect(() => { setInputValue(value ?? ""); }, [value]);
  return (
    <input
      type="text"
      value={inputValue}
      onChange={(e) => { setInputValue(e.target.value); node.setDataValue(colDef.field, e.target.value); }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: "100%", height: "100%",
        border: focused ? "2px solid #f59e0b" : "1px solid transparent",
        borderRadius: 3, padding: "0 6px", textAlign: "left", fontSize: 11,
        background: focused ? "#fffdf0" : "transparent",
        outline: "none", fontWeight: 500, color: "inherit", transition: "all 0.15s"
      }}
    />
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const AssyChallanCloseGrid = () => {
  const [theme, setTheme] = useState("light");
  const t = theme === "light" ? LIGHT : DARK;

  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [financialYear, setFinancialYear] = useState("25-26");
  const [fyOptions, setFyOptions] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [updatingRow, setUpdatingRow] = useState(null);
  const [markingRow, setMarkingRow] = useState(null);
  const [searchText, setSearchText] = useState("");
  const gridRef = useRef();

  // Toast helpers
  const addToast = useCallback((message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);
  const removeToast = useCallback((id) => setToasts((p) => p.filter((t) => t.id !== id)), []);

  // Fetch FY options
  useEffect(() => {
    fetch("https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/getDropdownOptions.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rule_name: "financial_year" })
    })
      .then(r => r.json())
      .then(res => {
        if (res.status === "success" && Array.isArray(res.data)) {
          const opts = res.data.map(d => ({ value: d.financial_year, label: d.financial_year }));
          setFyOptions(opts);
        }
      })
      .catch(() => setFyOptions([
        { value: "23-24", label: "23-24" },
        { value: "24-25", label: "24-25" },
        { value: "25-26", label: "25-26" },
      ]));
  }, []);

  // Fetch main data
  const fetchData = useCallback((year = financialYear) => {
    setLoading(true);
    fetch(`${BASE}/editAsslyChallanCloseApi.php?financial_year=${year}`)
      .then(r => r.text())
      .then(text => {
        const js = text.indexOf("{");
        const res = JSON.parse(js >= 0 ? text.slice(js) : text);
        if (res.status === true && Array.isArray(res.data)) {
          setRowData(res.data);
          setTotalRows(res.total_rows || res.data.length);
          addToast(`Loaded ${res.data.length} records for FY ${year}`, "success");
        } else {
          setRowData([]);
          addToast(res.message || "No data found", "error");
        }
      })
      .catch(err => {
        setRowData([]);
        addToast("Failed to fetch: " + err.message, "error");
      })
      .finally(() => setLoading(false));
  }, [financialYear, addToast]);

  useEffect(() => { fetchData(financialYear); }, [financialYear]);

  // ─── Update Row ───────────────────────────────────────────────────────────
  // PHP expects JSON body: { dcid, labouramount, comment }
  const handleUpdate = useCallback(async (params) => {
    const { data } = params;

    if (!data.dc_id) {
      addToast("DC ID is missing — cannot update", "error");
      return;
    }

    setUpdatingRow(data.dc_id);
    try {
      const payload = {
        dcid:         data.dc_id,
        labouramount: parseFloat(data.labour_amount) || 0,
        comment:      data.comment || ""
      };

      const res = await fetch(
        "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/updateEditAsslyChallanCloseApi.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );

      const text = await res.text();
      const js = text.indexOf("{");
      const result = JSON.parse(js >= 0 ? text.slice(js) : text);

      if (result.status === true) {
        addToast(`✓ Updated DC: ${data.dc_id} | Labour: ₹${payload.labouramount}`, "success");
      } else {
        addToast("Update failed: " + (result.message || "Unknown error"), "error");
      }
    } catch (err) {
      addToast("Network error: " + err.message, "error");
    } finally {
      setUpdatingRow(null);
    }
  }, [addToast]);

  // ─── Mark Dispatch ────────────────────────────────────────────────────────
  // PHP expects JSON body: { dcid }
  const handleMarkDispatch = useCallback(async (params) => {
    const { data } = params;

    if (!data.dc_id) {
      addToast("DC ID is missing — cannot mark dispatch", "error");
      return;
    }

    setMarkingRow(data.dc_id);
    try {
      const payload = { dcid: data.dc_id };

      const res = await fetch(
        "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/markDispatchApi.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );

      const text = await res.text();
      const js = text.indexOf("{");
      const result = JSON.parse(js >= 0 ? text.slice(js) : text);

      if (result.status === true) {
        addToast(`✓ DC ${data.dc_id} marked as dispatched`, "success");
        fetchData(financialYear);
      } else {
        addToast(result.message || "Mark Dispatch failed", "error");
      }
    } catch (err) {
      addToast("Network error: " + err.message, "error");
    } finally {
      setMarkingRow(null);
    }
  }, [addToast, fetchData, financialYear]);

  // Format number Indian style
  const fmtIN = (v) => {
    if (!v && v !== 0) return "—";
    return "₹" + Number(v).toLocaleString("en-IN");
  };

  // ─── Column Definitions ───────────────────────────────────────────────────
  const columnDefs = useMemo(() => [
    {
      headerName: "Sr No",
      valueGetter: (p) => (p.node ? p.node.rowIndex + 1 : ""),
      width: 70, minWidth: 60, pinned: "left", lockPosition: true,
      sortable: false, filter: false,
      cellStyle: { fontWeight: 700, textAlign: "center", color: t.subtext, fontSize: 11 }
    },
    {
      field: "vendor_id", headerName: "Vendor ID",
      width: 100, minWidth: 85,
      filter: "agTextColumnFilter", floatingFilter: true,
      cellStyle: { textAlign: "center", fontSize: 11, fontWeight: 600 }
    },
    {
      field: "customer_name", headerName: "Customer Name",
      width: 200, minWidth: 160,
      filter: "agTextColumnFilter", floatingFilter: true,
      cellStyle: { fontSize: 11 },
      tooltipField: "customer_name"
    },
    {
      field: "file_id", headerName: "File ID",
      width: 90, minWidth: 80,
      filter: "agTextColumnFilter", floatingFilter: true,
      cellStyle: { textAlign: "center", fontSize: 11, color: t.subtext }
    },
    {
      field: "file_name", headerName: "File Name",
      width: 190, minWidth: 150,
      filter: "agTextColumnFilter", floatingFilter: true,
      cellStyle: { fontWeight: 700, fontSize: 11, color: t.accent },
      tooltipField: "file_name"
    },
    {
      field: "dc_id", headerName: "DC ID",
      width: 130, minWidth: 110,
      filter: "agTextColumnFilter", floatingFilter: true,
      cellStyle: { textAlign: "center", fontSize: 11, fontWeight: 600, background: "rgba(245,158,11,0.07)" }
    },
    {
      field: "dc_date", headerName: "DC Date",
      width: 120, minWidth: 100,
      filter: "agTextColumnFilter", floatingFilter: true,
      cellStyle: { textAlign: "center", fontSize: 11 }
    },
    {
      field: "approx_value", headerName: "Approx Value",
      width: 125, minWidth: 105,
      filter: "agNumberColumnFilter", floatingFilter: true,
      valueFormatter: (p) => fmtIN(p.value),
      cellStyle: { textAlign: "right", fontSize: 11, fontWeight: 600, color: "#2563eb" }
    },
    // ── EDITABLE FIELDS ──
    {
      field: "challan_no", headerName: "Challan No",
      width: 115, minWidth: 100,
      filter: "agTextColumnFilter", floatingFilter: true,
      cellRenderer: (p) => <EditableInputCell value={p.value} node={p.node} colDef={p.colDef} />,
      cellStyle: {
        padding: 0, fontSize: 11,
        background: "rgba(245,158,11,0.08)",
        borderLeft: "3px solid #f59e0b"
      }
    },
    {
      field: "challan_close_date", headerName: "Challan Close Date",
      width: 150, minWidth: 130,
      filter: "agTextColumnFilter", floatingFilter: true,
      cellRenderer: (p) => <EditableInputCell value={p.value} node={p.node} colDef={p.colDef} />,
      cellStyle: {
        padding: 0, fontSize: 11,
        background: "rgba(245,158,11,0.08)",
        borderLeft: "3px solid #f59e0b"
      }
    },
    {
      field: "labour_amount", headerName: "Labour Amount",
      width: 130, minWidth: 110,
      filter: "agNumberColumnFilter", floatingFilter: true,
      cellRenderer: (p) => <EditableInputCell value={p.value} node={p.node} colDef={p.colDef} />,
      cellStyle: {
        padding: 0, fontSize: 11,
        background: "rgba(245,158,11,0.08)",
        borderLeft: "3px solid #f59e0b"
      }
    },
    {
      field: "comment", headerName: "Comment",
      width: 170, minWidth: 140,
      filter: "agTextColumnFilter", floatingFilter: true,
      cellRenderer: (p) => <EditableInputCell value={p.value} node={p.node} colDef={p.colDef} />,
      cellStyle: {
        padding: 0, fontSize: 11,
        background: "rgba(245,158,11,0.08)",
        borderLeft: "3px solid #f59e0b"
      }
    },
    // ── DISPATCH STATUS ──
    {
      field: "dispatch_status", headerName: "Status",
      width: 110, minWidth: 95,
      filter: "agTextColumnFilter", floatingFilter: true,
      cellRenderer: (p) => {
        const status = p.value?.toLowerCase();
        return (
          <span style={{
            padding: "3px 10px", borderRadius: 12, fontSize: 10, fontWeight: 700,
            background: status === "dispatched" ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)",
            color: status === "dispatched" ? "#16a34a" : "#92400e"
          }}>
            {p.value || "Pending"}
          </span>
        );
      },
      cellStyle: { textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center" }
    },
    // ── ACTION COLUMNS ──
    {
      headerName: "Update",
      field: "_update",
      width: 95, minWidth: 85,
      sortable: false, filter: false,
      pinned: "right",
      cellRenderer: (params) => {
        const isSaving = updatingRow === params.data?.dc_id;
        return (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
            <button
              onClick={() => handleUpdate(params)}
              disabled={isSaving}
              style={{
                background: isSaving ? "#94a3b8" : "linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%)",
                color: "#fff", border: "none", borderRadius: 5,
                padding: "4px 12px", fontSize: 10, fontWeight: 700,
                cursor: isSaving ? "not-allowed" : "pointer",
                boxShadow: isSaving ? "none" : "0 2px 6px rgba(37,99,235,0.3)",
                transition: "all 0.2s", whiteSpace: "nowrap"
              }}
              onMouseEnter={e => { if (!isSaving) e.target.style.opacity = "0.85"; }}
              onMouseLeave={e => { e.target.style.opacity = "1"; }}
            >
              {isSaving ? "⏳..." : "💾 Update"}
            </button>
          </div>
        );
      },
      cellStyle: { background: "#f8fafc", padding: "0 4px" }
    },
    {
      headerName: "Dispatch",
      field: "_dispatch",
      width: 120, minWidth: 105,
      sortable: false, filter: false,
      pinned: "right",
      cellRenderer: (params) => {
        const isMarking = markingRow === params.data?.dc_id;
        const isDispatched = params.data?.dispatch_status?.toLowerCase() === "dispatched";
        return (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
            <button
              onClick={() => handleMarkDispatch(params)}
              disabled={isMarking || isDispatched}
              style={{
                background: isDispatched
                  ? "#22c55e"
                  : isMarking
                  ? "#94a3b8"
                  : "linear-gradient(135deg,#16a34a 0%,#22c55e 100%)",
                color: "#fff", border: "none", borderRadius: 5,
                padding: "4px 10px", fontSize: 10, fontWeight: 700,
                cursor: (isMarking || isDispatched) ? "not-allowed" : "pointer",
                boxShadow: (isMarking || isDispatched) ? "none" : "0 2px 6px rgba(34,197,94,0.3)",
                transition: "all 0.2s", whiteSpace: "nowrap"
              }}
              onMouseEnter={e => { if (!isMarking && !isDispatched) e.target.style.opacity = "0.85"; }}
              onMouseLeave={e => { e.target.style.opacity = "1"; }}
            >
              {isDispatched ? "✓ Dispatched" : isMarking ? "⏳..." : "🚚 Mark Dispatch"}
            </button>
          </div>
        );
      },
      cellStyle: { background: "#f8fafc", padding: "0 4px" }
    }
  ], [t, updatingRow, markingRow, handleUpdate, handleMarkDispatch]);

  const defaultColDef = useMemo(() => ({
    sortable: true, resizable: true, suppressHeaderMenuButton: false,
  }), []);

  const exportCsv = () => {
    gridRef.current?.api?.exportDataAsCsv({
      fileName: `AssyChallanClose_${financialYear}_${new Date().toISOString().split("T")[0]}.csv`,
    });
  };

  const autoSize = () => {
    const ids = gridRef.current?.api?.getColumns()?.map(c => c.getId()) || [];
    if (ids.length) gridRef.current.api.autoSizeColumns(ids, false);
  };

  // Quick search filter
  const onSearchChange = (e) => {
    setSearchText(e.target.value);
    gridRef.current?.api?.setGridOption("quickFilterText", e.target.value);
  };

  // Summary stats
  const stats = useMemo(() => {
    if (!rowData.length) return {};
    const totalApprox = rowData.reduce((s, r) => s + Number(r.approx_value || 0), 0);
    const totalLabour = rowData.reduce((s, r) => s + Number(r.labour_amount || 0), 0);
    const pending = rowData.filter(r => r.dispatch_status?.toLowerCase() !== "dispatched").length;
    const dispatched = rowData.filter(r => r.dispatch_status?.toLowerCase() === "dispatched").length;
    return { totalApprox, totalLabour, pending, dispatched };
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
              SURYA ERP — Assembly Challan Close
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", letterSpacing: 1 }}>
              CHALLAN MANAGEMENT SYSTEM
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
            {fyOptions.length > 0
              ? fyOptions.map(y => (
                  <option key={y.value} value={y.value} style={{ color: "#000" }}>FY {y.label}</option>
                ))
              : <option value={financialYear} style={{ color: "#000" }}>FY {financialYear}</option>
            }
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

      {/* ── SUMMARY STRIP ── */}
      {!loading && rowData.length > 0 && (
        <div style={{
          background: t.card, borderBottom: `1px solid ${t.border}`,
          padding: "10px 24px", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center"
        }}>
          {[
            { label: "Total Records", value: totalRows.toLocaleString("en-IN"), color: t.accent, bg: "rgba(37,99,235,0.08)" },
            { label: "Total Approx Value", value: fmtCr(stats.totalApprox), color: "#2563eb", bg: "rgba(37,99,235,0.07)" },
            { label: "Total Labour Amount", value: fmtCr(stats.totalLabour), color: "#7c3aed", bg: "rgba(124,58,237,0.07)" },
            { label: "Pending", value: stats.pending, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
            { label: "Dispatched", value: stats.dispatched, color: "#16a34a", bg: "rgba(22,163,74,0.08)" },
          ].map((s, i) => (
            <div key={i} style={{
              background: s.bg, border: `1px solid ${s.color}33`,
              borderRadius: 8, padding: "6px 14px", minWidth: 130
            }}>
              <div style={{ fontSize: 9, color: s.color, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>{s.label}</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}

          <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{
              background: "rgba(245,158,11,0.1)", border: "1px solid #f59e0b33",
              borderLeft: "3px solid #f59e0b",
              borderRadius: 6, padding: "4px 12px", fontSize: 11, color: "#92400e", fontWeight: 600
            }}>
              ✏️ Yellow columns are editable — edit then click Update
            </div>
          </div>
        </div>
      )}

      {/* ── TOOLBAR ── */}
      <div style={{
        background: t.card, borderBottom: `1px solid ${t.border}`,
        padding: "8px 24px", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap"
      }}>
        <span style={{ fontSize: 12, color: t.subtext, fontWeight: 600 }}>
          FY {financialYear}{!loading && ` · ${rowData.length} records`}
        </span>

        {/* Quick Search */}
        <input
          type="text"
          placeholder="🔍 Quick search…"
          value={searchText}
          onChange={onSearchChange}
          style={{
            padding: "5px 12px", borderRadius: 6, border: `1px solid ${t.border}`,
            background: t.card, color: t.text, fontSize: 12, outline: "none",
            width: 200, marginLeft: 8
          }}
        />

        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {[
            { label: "📥 Export CSV", onClick: exportCsv, bg: "#22c55e" },
            { label: "↔ Auto Size", onClick: autoSize, bg: "#f59e0b" },
            { label: "🔄 Refresh", onClick: () => fetchData(financialYear), bg: "#3b82f6" },
          ].map(btn => (
            <button key={btn.label} onClick={btn.onClick} style={{
              padding: "6px 14px", background: btn.bg, border: "none",
              borderRadius: 6, color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer"
            }}>{btn.label}</button>
          ))}
        </div>
      </div>

      {/* ── GRID ── */}
      <div style={{ padding: "16px 24px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: t.subtext }}>
            <div style={{
              width: 44, height: 44, border: `4px solid ${t.border}`,
              borderTop: `4px solid ${t.accent}`, borderRadius: "50%",
              animation: "spin 0.8s linear infinite", margin: "0 auto 14px"
            }} />
            <div style={{ fontSize: 14 }}>Loading Assembly Challan Close data...</div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : rowData.length === 0 ? (
          <div style={{ textAlign: "center", padding: 80, color: "#ef4444", fontSize: 14 }}>
            ⚠️ No data found for FY {financialYear}. Check API or select a different year.
          </div>
        ) : (
          <div style={{
            background: t.card, border: `1px solid ${t.border}`,
            borderRadius: 12, overflow: "hidden",
            boxShadow: "0 2px 12px rgba(0,0,0,0.07)"
          }}>
            <style>{`
              .ag-theme-alpine .ag-header-cell,
              .ag-theme-alpine-dark .ag-header-cell {
                font-size: 11px !important;
                font-weight: 700 !important;
              }
              .ag-floating-filter-input { font-size: 11px !important; }
            `}</style>
            <div
              className={theme === "light" ? "ag-theme-alpine" : "ag-theme-alpine-dark"}
              style={{
                height: "calc(100vh - 290px)", minHeight: 400, width: "100%",
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
                paginationPageSize={25}
                paginationPageSizeSelector={[10, 25, 50, 100]}
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

export default AssyChallanCloseGrid;