import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-theme-alpine.css";
import {
  ModuleRegistry, ClientSideRowModelModule, ValidationModule,
  DateFilterModule, NumberFilterModule, TextFilterModule,
  RowSelectionModule, PaginationModule, CsvExportModule,
} from "ag-grid-community";

ModuleRegistry.registerModules([
  ClientSideRowModelModule, ValidationModule, DateFilterModule,
  NumberFilterModule, TextFilterModule, RowSelectionModule,
  PaginationModule, CsvExportModule,
]);

// ─── Themes ───────────────────────────────────────────────────────────────────
const LIGHT = {
  bg: "#f0f4f8", card: "#ffffff", border: "#dde3ec",
  text: "#1a2332", subtext: "#64748b",
  header: "linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%)",
  accent: "#2563eb", tableHead: "#1e3a5f",
  tableRow: "#f8fafc", gridBg: "#f8fafc",
};
const DARK = {
  bg: "#0d1117", card: "#161b22", border: "#30363d",
  text: "#e6edf3", subtext: "#8b949e",
  header: "linear-gradient(135deg,#0d1117 0%,#1f2937 100%)",
  accent: "#58a6ff", tableHead: "#0d1117",
  tableRow: "#161b22", gridBg: "#161b22",
};

// ─── Toast Notification ───────────────────────────────────────────────────────
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

// ─── Editable Number Input Cell ───────────────────────────────────────────────
// Uses node.setDataValue (same as Design Dashboard) so data is updated in-grid
const EditableNumCell = ({ value, node, colDef }) => {
  const [val, setVal] = useState(value ?? "");
  const [focused, setFocused] = useState(false);

  useEffect(() => { setVal(value ?? ""); }, [value]);

  return (
    <input
      type="number"
      value={val}
      onChange={e => { setVal(e.target.value); node.setDataValue(colDef.field, e.target.value); }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: "100%", height: "100%",
        border: focused ? "2px solid #f59e0b" : "1px solid transparent",
        borderRadius: 3, padding: "0 6px", fontSize: 11,
        background: focused ? "#fffdf0" : "transparent",
        outline: "none", fontWeight: 600, color: "#1a2332",
        transition: "all 0.15s",
      }}
    />
  );
};

// ─── Editable Date Input Cell ─────────────────────────────────────────────────
// Handles DD-MM-YYYY (API) ↔ YYYY-MM-DD (input[type=date]) conversion
const EditableDateCell = ({ value, node, colDef }) => {
  const toInput = (v) => {
    if (!v) return "";
    const p = v.split("-");
    return p.length === 3 && p[0].length === 2 ? `${p[2]}-${p[1]}-${p[0]}` : v;
  };

  const [val, setVal] = useState(toInput(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => { setVal(toInput(value)); }, [value]);

  const handleChange = (e) => {
    setVal(e.target.value);
    // Store in YYYY-MM-DD in grid; we convert back on save
    node.setDataValue(colDef.field, e.target.value);
  };

  return (
    <input
      type="date"
      value={val}
      onChange={handleChange}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: "100%", height: "100%",
        border: focused ? "2px solid #f59e0b" : "1px solid transparent",
        borderRadius: 3, padding: "0 4px", fontSize: 11,
        background: focused ? "#fffdf0" : "transparent",
        outline: "none", fontWeight: 600, color: "#1a2332",
        transition: "all 0.15s",
      }}
    />
  );
};

// ─── Editable Checkbox Cell ───────────────────────────────────────────────────
const EditableCheckboxCell = ({ value, node, colDef }) => {
  const [checked, setChecked] = useState(value === "true" || value === true);

  useEffect(() => { setChecked(value === "true" || value === true); }, [value]);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={e => {
          setChecked(e.target.checked);
          node.setDataValue(colDef.field, String(e.target.checked));
        }}
        style={{ width: 16, height: 16, cursor: "pointer", accentColor: "#2563eb" }}
      />
    </div>
  );
};

// ─── Progress Bar Cell (read-only display) ────────────────────────────────────
const ProgressCell = ({ value, t }) => {
  const pct = Math.min(Math.max(Number(value) || 0, 0), 100);
  const color = pct >= 80 ? "#22c55e" : pct >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, height: "100%", padding: "0 4px" }}>
      <div style={{ flex: 1, height: 8, background: t.border, borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 4 }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color, minWidth: 34, textAlign: "right" }}>{pct}%</span>
    </div>
  );
};

// ─── Editable Progress Cell (number input + live bar) ────────────────────────
const EditableProgressCell = ({ value, node, colDef }) => {
  const [val, setVal] = useState(value ?? "");
  const [focused, setFocused] = useState(false);

  useEffect(() => { setVal(value ?? ""); }, [value]);

  const pct = Math.min(Math.max(Number(val) || 0, 0), 100);
  const barColor = pct >= 80 ? "#22c55e" : pct >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, height: "100%", padding: "0 4px" }}>
      <div style={{ flex: 1, height: 7, background: "#e2e8f0", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: 4, transition: "width 0.2s" }} />
      </div>
      <input
        type="number"
        min={0} max={100}
        value={val}
        onChange={e => { setVal(e.target.value); node.setDataValue(colDef.field, e.target.value); }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: 50, height: "80%",
          border: focused ? "2px solid #f59e0b" : "1px solid #dde3ec",
          borderRadius: 3, padding: "0 4px", fontSize: 11,
          background: focused ? "#fffdf0" : "#fff",
          outline: "none", fontWeight: 700, color: barColor,
          textAlign: "right",
        }}
      />
      <span style={{ fontSize: 10, color: barColor, fontWeight: 700 }}>%</span>
    </div>
  );
};

// ─── Save Button Cell ─────────────────────────────────────────────────────────
const SaveButtonCell = ({ params, savingRow, onSave }) => {
  const fileId = params.node.data?.FILE_ID;
  const isSaving = savingRow === fileId;

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
      <button
        onClick={() => onSave(params)}
        disabled={isSaving}
        style={{
          background: isSaving
            ? "#94a3b8"
            : "linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%)",
          color: "#fff", border: "none", borderRadius: 6,
          padding: "4px 12px", fontSize: 10, fontWeight: 700,
          cursor: isSaving ? "not-allowed" : "pointer",
          boxShadow: "0 2px 6px rgba(37,99,235,0.25)",
          transition: "all 0.2s", whiteSpace: "nowrap",
          display: "flex", alignItems: "center", gap: 5,
        }}
      >
        {isSaving ? (
          <>
            <span style={{
              width: 9, height: 9, border: "2px solid rgba(255,255,255,0.4)",
              borderTop: "2px solid #fff", borderRadius: "50%",
              animation: "spin 0.6s linear infinite", display: "inline-block",
            }} />
            Saving…
          </>
        ) : "💾 Save"}
      </button>
    </div>
  );
};

// ─── Editable cell style (yellow highlight, left border) ─────────────────────
const editableCellStyle = {
  background: "rgba(245,158,11,0.08)",
  borderLeft: "3px solid #f59e0b",
  padding: "0",
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Assembly Dashboard ───────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export default function SuryaAssemblyDashboard() {
  const [theme, setTheme] = useState("light");
  const t = theme === "light" ? LIGHT : DARK;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [savingRow, setSavingRow] = useState(null);
  const [toasts, setToasts] = useState([]);
  const gridRef = useRef();

  // ─── Toast helpers ──────────────────────────────────────────────────────────
  const addToast = useCallback((message, type = "info") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);
  const removeToast = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), []);

  // ─── Fetch data ─────────────────────────────────────────────────────────────
  const fetchData = useCallback(() => {
    setLoading(true);
    fetch("http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/AssemblyDashboardListApi.php")
      .then(r => r.json())
      .then(res => {
        if (res.status && Array.isArray(res.data)) setData(res.data);
        else addToast("No data received from API", "error");
      })
      .catch(err => addToast("Failed to fetch: " + err.message, "error"))
      .finally(() => setLoading(false));
  }, [addToast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ─── Summary stats ──────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = data.length;
    const fileReceived = data.filter(r => r.is_file_received === "true").length;
    const materialReceived = data.filter(r => r.is_material_received === "true").length;
    const avgProgress = total > 0
      ? Math.round(data.reduce((s, r) => s + (Number(r.total_progress) || 0), 0) / total)
      : 0;
    return { total, fileReceived, materialReceived, avgProgress };
  }, [data]);

  // ─── Save handler ───────────────────────────────────────────────────────────
  const handleSave = useCallback(async (params) => {
    const row = params.node.data;
    const fileId = row.FILE_ID;
    setSavingRow(fileId);

    // disDate: node may now hold YYYY-MM-DD (from date input), convert back to DD-MM-YYYY
    let disDate = row.disDate || "";
    if (disDate) {
      const p = disDate.split("-");
      if (p.length === 3 && p[0].length === 4) disDate = `${p[2]}-${p[1]}-${p[0]}`;
    }

    try {
      const form = new FormData();
      form.append("FILE_ID",             fileId);
      form.append("is_file_received",    row.is_file_received    || "");
      form.append("is_material_received",row.is_material_received || "");
      form.append("assemblyQty",         row.AssyQty             || "");
      form.append("total_progress",      row.total_progress      || "");
      form.append("gear_box_assembly",   row.gear_box_assembly   || "");
      form.append("front_Frame",         row.front_Frame         || "");
      form.append("disDate",             disDate);

      const res  = await fetch(
        "http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/saveAsslyDashboardApi.php",
        { method: "POST", body: form }
      );
      const json = await res.json();
      if (json.status) addToast(`✓ Saved ${row.FILE_NAME} successfully`, "success");
      else             addToast("Save failed: " + (json.message || "Unknown error"), "error");
    } catch (err) {
      addToast("Network error. Please try again.", "error");
    } finally {
      setSavingRow(null);
    }
  }, [addToast]);

  // ─── Filtered rows ──────────────────────────────────────────────────────────
  const filtered = useMemo(() =>
    search ? data.filter(r => r.FILE_NAME?.toLowerCase().includes(search.toLowerCase())) : data
  , [data, search]);

  // ─── Column Definitions ─────────────────────────────────────────────────────
  // RULE: any column with a custom cellRenderer MUST have filter:false — no floatingFilter.
  // Only plain (no cellRenderer) columns may safely use floatingFilter:true.
  const columnDefs = useMemo(() => [
    {
      headerName: "Sr No",
      valueGetter: p => p.node ? p.node.rowIndex + 1 : "",
      width: 65, pinned: "left",
      sortable: false, filter: false,
      cellStyle: { fontWeight: 700, textAlign: "center", color: t.subtext, fontSize: 11 },
    },
    {
      field: "FILE_NAME", headerName: "File Name",
      width: 190, pinned: "left",
      filter: "agTextColumnFilter", floatingFilter: true, // ✅ safe — no cellRenderer
      cellStyle: { fontWeight: 700, color: t.accent, fontSize: 12 },
    },

    // ── Editable: Assembly Qty ──────────────────────────────────────────────
    {
      field: "AssyQty", headerName: "Assy Qty",
      width: 120, filter: false, sortable: true,
      cellRenderer: p => <EditableNumCell value={p.value} node={p.node} colDef={p.colDef} />,
      cellStyle: editableCellStyle,
    },

    // ── Editable: File Received checkbox ────────────────────────────────────
    {
      field: "is_file_received", headerName: "File Received",
      width: 135, filter: false, sortable: false,
      cellRenderer: p => <EditableCheckboxCell value={p.value} node={p.node} colDef={p.colDef} />,
      cellStyle: { ...editableCellStyle, textAlign: "center" },
    },

    // ── Editable: Material Received checkbox ────────────────────────────────
    {
      field: "is_material_received", headerName: "Material Received",
      width: 155, filter: false, sortable: false,
      cellRenderer: p => <EditableCheckboxCell value={p.value} node={p.node} colDef={p.colDef} />,
      cellStyle: { ...editableCellStyle, textAlign: "center" },
    },

    // ── Editable: Total Progress (input + live bar) ─────────────────────────
    {
      field: "total_progress", headerName: "Progress %",
      width: 200, filter: false, sortable: true,
      cellRenderer: p => <EditableProgressCell value={p.value} node={p.node} colDef={p.colDef} />,
      cellStyle: { ...editableCellStyle },
    },

    // ── Editable: Gear Box Assembly % ──────────────────────────────────────
    {
      field: "gear_box_assembly", headerName: "Gear Box Assy %",
      width: 160, filter: false, sortable: false,
      cellRenderer: p => <EditableNumCell value={p.value} node={p.node} colDef={p.colDef} />,
      cellStyle: editableCellStyle,
    },

    // ── Editable: Front Frame % ─────────────────────────────────────────────
    {
      field: "front_Frame", headerName: "Front Frame %",
      width: 150, filter: false, sortable: false,
      cellRenderer: p => <EditableNumCell value={p.value} node={p.node} colDef={p.colDef} />,
      cellStyle: editableCellStyle,
    },

    // ── Editable: Dispatch Date ─────────────────────────────────────────────
    {
      field: "disDate", headerName: "Dispatch Date",
      width: 165, filter: false, sortable: false,
      cellRenderer: p => <EditableDateCell value={p.value} node={p.node} colDef={p.colDef} />,
      cellStyle: editableCellStyle,
    },

    // ── Read-only: Painting ─────────────────────────────────────────────────
    {
      field: "painting", headerName: "Painting",
      width: 115, filter: false, sortable: false,
      cellRenderer: p => {
        const v = p.value;
        return (
          <span style={{
            fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 12,
            background: v ? "#dbeafe" : t.border,
            color: v ? "#1d4ed8" : t.subtext,
          }}>{v || "—"}</span>
        );
      },
      cellStyle: { textAlign: "center" },
    },

    // ── Read-only: Last Updated ─────────────────────────────────────────────
    {
      field: "timestamp", headerName: "Last Updated",
      width: 165, filter: false, sortable: true,
      cellStyle: { fontSize: 11, color: t.subtext },
    },

    // ── Action: Save button ─────────────────────────────────────────────────
    {
      headerName: "Action",
      width: 100, pinned: "right",
      sortable: false, filter: false,
      cellRenderer: p => (
        <SaveButtonCell params={p} savingRow={savingRow} onSave={handleSave} />
      ),
      cellStyle: { background: "#f8fafc", padding: "0 4px" },
    },
  ], [t, savingRow, handleSave]);

  const defaultColDef = useMemo(() => ({
    sortable: true, resizable: true, filter: false,
  }), []);

  const exportCsv = () => gridRef.current?.api?.exportDataAsCsv({
    fileName: `Assembly_Dashboard_${new Date().toISOString().split("T")[0]}.csv`
  });
  const autoSize = () => {
    const ids = gridRef.current?.api?.getColumns()?.map(c => c.getId()) || [];
    if (ids.length) gridRef.current.api.autoSizeColumns(ids, false);
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh", background: t.bg, color: t.text,
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      transition: "background 0.3s, color 0.3s",
    }}>
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* ── HEADER ── */}
      <div style={{
        background: t.header, padding: "0 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 56, boxShadow: "0 2px 16px rgba(0,0,0,0.2)",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: "rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 900, color: "#fff",
          }}>S</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: "#fff", letterSpacing: 0.5 }}>SURYA ERP — Assembly Dashboard</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", letterSpacing: 1 }}>EQUIPMENT MANAGEMENT SYSTEM</div>
          </div>
        </div>
        <button
          onClick={() => setTheme(th => th === "light" ? "dark" : "light")}
          style={{
            padding: "6px 14px", border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: 6, background: "rgba(255,255,255,0.1)",
            color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer",
          }}
        >
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
      </div>

      {/* ── SUMMARY STRIP ── */}
      {!loading && data.length > 0 && (
        <div style={{
          background: t.card, borderBottom: `1px solid ${t.border}`,
          padding: "10px 24px", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center",
        }}>
          {[
            { label: "Total Files",        value: stats.total,              color: t.accent,  bg: "rgba(37,99,235,0.08)" },
            { label: "File Received",       value: stats.fileReceived,       color: "#16a34a", bg: "rgba(22,163,74,0.08)" },
            { label: "Material Received",   value: stats.materialReceived,   color: "#7c3aed", bg: "rgba(124,58,237,0.07)" },
            { label: "Avg Progress",        value: `${stats.avgProgress}%`,  color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
          ].map((s, i) => (
            <div key={i} style={{
              background: s.bg, border: `1px solid ${s.color}33`,
              borderRadius: 8, padding: "6px 14px", minWidth: 130,
            }}>
              <div style={{ fontSize: 9, color: s.color, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>{s.label}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
          <div style={{ marginLeft: "auto" }}>
            <div style={{
              background: "rgba(245,158,11,0.1)", border: "1px solid #f59e0b33",
              borderLeft: "3px solid #f59e0b", borderRadius: 6,
              padding: "4px 12px", fontSize: 11, color: "#92400e", fontWeight: 600,
            }}>
              ✏️ Yellow columns are editable — click to edit, then Save
            </div>
          </div>
        </div>
      )}

      {/* ── TOOLBAR ── */}
      <div style={{
        background: t.card, borderBottom: `1px solid ${t.border}`,
        padding: "8px 24px", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap",
      }}>
        <span style={{ fontSize: 12, color: t.subtext, fontWeight: 600 }}>
          {!loading && `${filtered.length} records`}
        </span>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search file name…"
          style={{
            padding: "5px 12px", borderRadius: 6, border: `1px solid ${t.border}`,
            background: t.card, color: t.text, fontSize: 12, outline: "none", width: 220,
          }}
        />
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {[
            { label: "📥 Export CSV", fn: exportCsv, bg: "#22c55e" },
            { label: "↔ Auto Size",  fn: autoSize,  bg: "#f59e0b" },
            { label: "🔄 Refresh",   fn: fetchData,  bg: "#3b82f6" },
          ].map(btn => (
            <button key={btn.label} onClick={btn.fn} style={{
              padding: "6px 14px", background: btn.bg, border: "none",
              borderRadius: 6, color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer",
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
              animation: "spin 0.8s linear infinite", margin: "0 auto 14px",
            }} />
            <div style={{ fontSize: 14 }}>Loading Assembly Dashboard…</div>
          </div>
        ) : data.length === 0 ? (
          <div style={{ textAlign: "center", padding: 80, color: "#ef4444" }}>
            ⚠️ No data found. Check API connection.
          </div>
        ) : (
          <div style={{
            background: t.card, border: `1px solid ${t.border}`,
            borderRadius: 12, overflow: "hidden",
            boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
          }}>
            <style>{`
              @keyframes spin { to { transform: rotate(360deg) } }
              .ag-theme-alpine .ag-header-cell { font-size: 11px !important; font-weight: 700 !important; }
              .ag-floating-filter-input { font-size: 11px !important; }
            `}</style>
            <div
              className="ag-theme-alpine"
              style={{
                height: "calc(100vh - 270px)", minHeight: 420, width: "100%",
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
                rowData={filtered}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                pagination
                paginationPageSize={20}
                paginationPageSizeSelector={[10, 20, 50, 100]}
                animateRows
                rowHeight={44}
                headerHeight={44}
                floatingFiltersHeight={36}
                enableCellTextSelection
                onGridReady={() => setTimeout(autoSize, 300)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}