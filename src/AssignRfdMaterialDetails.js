
import React, { useEffect, useState, useRef, useCallback } from "react";
import Select from "react-select";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { ModuleRegistry } from "ag-grid-community";
import {
  ClientSideRowModelModule,
  ValidationModule,
  TextFilterModule,
  NumberFilterModule,
  RowSelectionModule,
  PaginationModule,
  CsvExportModule,
} from "ag-grid-community";

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  ValidationModule,
  TextFilterModule,
  NumberFilterModule,
  RowSelectionModule,
  PaginationModule,
  CsvExportModule,
]);

// ─── Helpers ────────────────────────────────────────────────────────────────

const API = "http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC";

function getFileIdFromHash() {
  const hash = window.location.hash || "";
  const match = hash.match(/assign-rfd-details\/(\d+)/);
  return match ? match[1] : null;
}

// Toast
let _toastCount = 0;
function showToast(msg, type = "info") {
  const colors = {
    success: "#16a34a",
    error: "#dc2626",
    info: "#2563eb",
    warning: "#d97706",
  };
  const id = `toast-${_toastCount++}`;
  const el = document.createElement("div");
  el.id = id;
  el.style.cssText = `
    position:fixed;bottom:24px;right:24px;padding:12px 20px;
    background:${colors[type]};color:#fff;border-radius:10px;
    box-shadow:0 8px 24px rgba(0,0,0,.2);z-index:99999;
    font-family:'Sora',sans-serif;font-size:.85rem;font-weight:500;
    max-width:320px;animation:toastIn .3s ease;
  `;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => {
    el.style.animation = "toastOut .3s ease forwards";
    setTimeout(() => el.parentNode && el.parentNode.removeChild(el), 300);
  }, 3200);
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
const badge = (val) => {
  const map = {
    Pending:      ["#fef9c3", "#854d0e", "#ca8a04"],
    Completed:    ["#dcfce7", "#14532d", "#16a34a"],
    "In Progress":["#dbeafe", "#1e3a8a", "#3b82f6"],
    Approved:     ["#f0fdf4", "#166534", "#22c55e"],
  };
  const [bg, col, bdr] = map[val] ?? ["#f1f5f9", "#475569", "#94a3b8"];
  return (
    <span style={{
      display: "inline-block", padding: "2px 10px", borderRadius: 20,
      fontSize: ".76rem", fontWeight: 700, background: bg, color: col,
      border: `1px solid ${bdr}`, letterSpacing: ".03em",
    }}>
      {val || "—"}
    </span>
  );
};

// ─── Tiny spinner ─────────────────────────────────────────────────────────────
const Spinner = ({ size = 32, color = "#f97316" }) => (
  <span style={{
    display: "inline-block", width: size, height: size, borderRadius: "50%",
    border: `3px solid #e5e7eb`, borderTopColor: color,
    animation: "spin .7s linear infinite", verticalAlign: "middle",
  }} />
);

// ─── Shared styles ────────────────────────────────────────────────────────────
const btnStyle = (bg = "#f97316") => ({
  padding: "8px 20px", borderRadius: 8, border: "none", background: bg,
  color: "#fff", cursor: "pointer", fontFamily: "'Sora',sans-serif",
  fontWeight: 600, fontSize: ".85rem", display: "inline-flex",
  alignItems: "center", gap: 6, boxShadow: `0 2px 8px ${bg}55`,
  transition: "all .18s",
});

const selectStyle = {
  padding: "6px 12px", borderRadius: 8, border: "1px solid #e2e8f0",
  background: "#fff", color: "#1e293b", fontFamily: "'Sora',sans-serif",
  fontSize: ".85rem", outline: "none", cursor: "pointer",
};

const sectionHeader = {
  background: "linear-gradient(90deg,#f97316,#fb923c)", color: "#fff",
  padding: "8px 14px", fontWeight: 600, fontSize: ".82rem",
  borderRadius: "8px 8px 0 0",
  display: "flex", justifyContent: "space-between", alignItems: "center",
};

// FIX: floatingFilter:false as safe default to prevent HeaderFilterCellCtrl null crash
const dfltCol = {
  sortable: true,
  filter: true,
  resizable: true,
  floatingFilter: false,
  cellStyle: { fontFamily: "'Sora',sans-serif", fontSize: ".82rem" },
};

// ══════════════════════════════════════════════════════════════════════════════
//  TAB 1 – Assign From Stock
// ══════════════════════════════════════════════════════════════════════════════
const AssignFromStock = ({ fileId, fileName }) => {
  const [rows, setRows]             = useState([]);
  const [loading, setLoading]       = useState(false);
  const [assignValues, setAssignValues] = useState({});
  const [comments, setComments]     = useState({});
  const [saving, setSaving]         = useState(false);
  const gridRef = useRef();

  const loadData = useCallback(async () => {
    if (!fileId) return;
    setLoading(true);
    try {
      const res  = await window.fetch(`${API}/assignFromStockApi.php?fileID=${fileId}`);
      const data = await res.json();
      if (data.status && Array.isArray(data.data)) setRows(data.data);
      else if (Array.isArray(data)) setRows(data);
      else setRows([]);
    } catch (e) {
      console.error(e);
      showToast("Failed to load stock data", "error");
    } finally {
      setLoading(false);
    }
  }, [fileId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAssign = async () => {
    const payload = rows
      .filter(r => assignValues[r.material_id] && parseFloat(assignValues[r.material_id]) > 0)
      .map(r => ({
        material_id:   r.material_id,
        material_name: r.assembly_name,
        assign_qty:    assignValues[r.material_id],
        comment:       comments[r.material_id] || "",
        file_id:       fileId,
      }));

    if (!payload.length) { showToast("No quantities entered", "warning"); return; }

    setSaving(true);
    try {
      const res = await window.fetch(`${API}/assignStockSaveApi.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignments: payload, file_id: fileId }),
      });
      const data = await res.json();
      if (data.status) {
        showToast("Stock allocated successfully!", "success");
        setAssignValues({});
        setComments({});
        loadData();
      } else {
        showToast(data.message || "Error saving", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  // FIX: filter:false + floatingFilter:false on all cellRenderer columns
  const colDefs = [
    {
      headerName: "#",
      valueGetter: p => p.node.rowIndex + 1,
      width: 65,
      pinned: "left",
      cellStyle: { textAlign: "center", color: "#9ca3af", fontWeight: 600 },
      sortable: false,
      filter: false,
      floatingFilter: false,
    },
    {
      field: "assembly_name",
      headerName: "Assembly Name",
      flex: 1,
      minWidth: 220,
      cellStyle: { fontWeight: 600 },
    },
    {
      field: "stock_qty",
      headerName: "Stock Qty",
      width: 130,
      cellStyle: { textAlign: "right", fontFamily: "'Courier New',monospace" },
    },
    {
      field: "required_qty",
      headerName: "Required Qty",
      width: 140,
      cellStyle: { textAlign: "right", fontFamily: "'Courier New',monospace" },
    },
    {
      headerName: "Assign Qty",
      width: 150,
      filter: false,        // FIX: must be false for cellRenderer columns
      floatingFilter: false, // FIX: prevents HeaderFilterCellCtrl null crash
      cellRenderer: p => {
        const id    = p.data?.material_id;
        const stock = parseFloat(p.data?.stock_qty || 0);
        return (
          <input
            type="number"
            min={0}
            max={stock}
            value={assignValues[id] || ""}
            onChange={e => {
              const v = e.target.value;
              if (parseFloat(v) > stock) {
                showToast("Cannot exceed stock qty", "warning");
                return;
              }
              setAssignValues(prev => ({ ...prev, [id]: v }));
            }}
            style={{
              width: "100%", border: "1px solid #e5e7eb", borderRadius: 6,
              padding: "2px 6px", fontSize: ".82rem",
              fontFamily: "'Courier New',monospace",
            }}
          />
        );
      },
    },
    {
      headerName: "Comment",
      flex: 1,
      minWidth: 160,
      filter: false,        // FIX
      floatingFilter: false, // FIX
      cellRenderer: p => {
        const id = p.data?.material_id;
        return (
          <input
            type="text"
            placeholder="optional…"
            value={comments[id] || ""}
            onChange={e => setComments(prev => ({ ...prev, [id]: e.target.value }))}
            style={{
              width: "100%", border: "1px solid #e5e7eb", borderRadius: 6,
              padding: "2px 6px", fontSize: ".82rem",
            }}
          />
        );
      },
    },
  ];

  return (
    <div style={{ padding: "16px" }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 12,
      }}>
        <span style={{ color: "#6b7280", fontSize: ".82rem" }}>
          {loading ? <Spinner size={16} /> : `${rows.length} assemblies`}
        </span>
        <button
          onClick={handleAssign}
          disabled={saving}
          style={{ ...btnStyle("#f97316"), opacity: saving ? .6 : 1 }}
        >
          {saving ? <><Spinner size={14} color="#fff" /> &nbsp;Saving…</> : "⚡ Assign From Stock"}
        </button>
      </div>

      <div className="ag-theme-alpine" style={{ height: "calc(100vh - 320px)", width: "100%" }}>
        <AgGridReact
          ref={gridRef}
          rowData={rows}
          columnDefs={colDefs}
          defaultColDef={{
            sortable: true,
            filter: true,
            resizable: true,
            // FIX: do NOT set floatingFilter:true globally — set per column above
            cellStyle: { fontFamily: "'Sora',sans-serif", fontSize: ".83rem" },
          }}
          rowHeight={44}
          headerHeight={48}
          animateRows
          pagination
          paginationPageSize={20}
          onGridReady={() =>
            setTimeout(() => {
              const ids = gridRef.current?.api?.getColumns()?.map(c => c.getId()) || [];
              if (ids.length) gridRef.current.api.autoSizeColumns(ids, false);
            }, 400)
          }
        />
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
//  TAB 2 – Assign From File
// ══════════════════════════════════════════════════════════════════════════════
const AssignFromFile = ({ fileId, fileName }) => {
  const [fileList, setFileList] = useState([]);
  const [selFile,  setSelFile]  = useState("");
  const [fromRows, setFromRows] = useState([]);
  const [toRows,   setToRows]   = useState([]);
  const [selFrom,  setSelFrom]  = useState({});
  const [selTo,    setSelTo]    = useState({});
  const [loading,  setLoading]  = useState(false);
  const [saving,   setSaving]   = useState(false);

  // Load file list
  useEffect(() => {
    window.fetch(`${API}/getFileListApi.php`)
      .then(r => r.json())
      .then(d => {
        if (d.status && Array.isArray(d.data)) setFileList(d.data);
        else if (Array.isArray(d)) setFileList(d);
      })
      .catch(console.error);
  }, []);

  // Load current file assemblies
  useEffect(() => {
    if (!fileId) return;
    window.fetch(`${API}/getAssemblyDataApi.php?fileno=${fileId}`)
      .then(r => r.json())
      .then(d => {
        if (d.status && Array.isArray(d.data)) setToRows(d.data);
        else if (Array.isArray(d)) setToRows(d);
      })
      .catch(console.error);
  }, [fileId]);

  // Load source file materials
  const loadSourceFile = async (fid) => {
    if (!fid) { setFromRows([]); return; }
    setLoading(true);
    try {
      const res = await window.fetch(`${API}/getAssemblyDataApi.php?fileno=${fid}`);
      const d   = await res.json();
      if (d.status && Array.isArray(d.data)) setFromRows(d.data);
      else if (Array.isArray(d)) setFromRows(d);
      else setFromRows([]);
    } catch (e) {
      console.error(e);
      showToast("Load failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    const fromSel = fromRows.filter(r => selFrom[r.material_id]);
    const toSel   = toRows.filter(r => selTo[r.material_id]);
    if (!fromSel.length || !toSel.length) {
      showToast("Select materials from both sides", "warning");
      return;
    }
    setSaving(true);
    try {
      const res = await window.fetch(`${API}/assignFileToFileApi.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from_file_id: selFile,
          to_file_id: fileId,
          from_materials: fromSel,
          to_materials: toSel,
        }),
      });
      const d = await res.json();
      if (d.status) {
        showToast("Material assigned successfully!", "success");
        setSelFrom({});
        setSelTo({});
      } else {
        showToast(d.message || "Error", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  // FIX: checkboxSelection moved to first data column; no separate checkbox column
  const matColFrom = [
    {
      field: "assembly_name",
      headerName: "Material Name",
      flex: 1,
      minWidth: 200,
      checkboxSelection: true,
      headerCheckboxSelection: true,
      cellStyle: { fontWeight: 600 },
    },
    { field: "assign_qty", headerName: "Assign Mat.",   width: 130, cellStyle: { textAlign: "right" } },
    { field: "stock_qty",  headerName: "Reassign Mat.", width: 130, cellStyle: { textAlign: "right" } },
  ];

  const matColTo = [
    {
      field: "assembly_name",
      headerName: "Material Name",
      flex: 1,
      minWidth: 200,
      checkboxSelection: true,
      headerCheckboxSelection: true,
      cellStyle: { fontWeight: 600 },
    },
    { field: "required_qty", headerName: "Assign Stock",   width: 130, cellStyle: { textAlign: "right" } },
    { field: "stock_qty",    headerName: "Reassign Stock", width: 130, cellStyle: { textAlign: "right" } },
  ];

  return (
    <div style={{ padding: 16 }}>
      <div style={{
        display: "flex", gap: 16, marginBottom: 12,
        alignItems: "center", flexWrap: "wrap",
      }}>
        <label style={{ fontWeight: 600, fontSize: ".85rem", color: "#374151" }}>
          Select Source File:
        </label>
      <Select
  options={fileList.map(f => ({
    value: f.file_id || f.FILE_ID,
    label: f.file_name || f.FILE_NAME,
  }))}
  value={
    selFile
      ? { value: selFile, label: fileList.find(f => (f.file_id || f.FILE_ID) == selFile)?.file_name || selFile }
      : null
  }
  onChange={opt => {
    const val = opt ? opt.value : "";
    setSelFile(val);
    loadSourceFile(val);
  }}
  isClearable
  isSearchable
  placeholder="🔍 Search or select file..."
  styles={{
    container: base => ({ ...base, minWidth: 280, fontFamily: "'Sora',sans-serif" }),
    control: (base, state) => ({
      ...base,
      borderRadius: 8,
      borderColor: state.isFocused ? "#f97316" : "#e2e8f0",
      boxShadow: state.isFocused ? "0 0 0 2px #f9731630" : "none",
      fontSize: ".85rem",
      "&:hover": { borderColor: "#f97316" },
    }),
    option: (base, state) => ({
      ...base,
      fontFamily: "'Sora',sans-serif",
      fontSize: ".84rem",
      background: state.isSelected ? "#f97316" : state.isFocused ? "#fff7ed" : "#fff",
      color: state.isSelected ? "#fff" : "#1e293b",
    }),
    placeholder: base => ({ ...base, color: "#94a3b8" }),
    singleValue: base => ({ ...base, color: "#1e293b" }),
    clearIndicator: base => ({ ...base, color: "#94a3b8", "&:hover": { color: "#ef4444" } }),
  }}
/>
        {loading && <Spinner size={20} />}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Source File */}
        <div>
          <div style={sectionHeader}>
            <span>📂 Source File Materials</span>
            <span style={{ fontSize: ".75rem", opacity: .7 }}>
              {selFile ? `${fromRows.length} rows` : "Select a file"}
            </span>
          </div>
          <div className="ag-theme-alpine" style={{ height: 420 }}>
            <AgGridReact
              rowData={fromRows}
              columnDefs={matColFrom}
              defaultColDef={dfltCol}
              rowHeight={40}
              headerHeight={44}
              // FIX: new object API replaces deprecated rowSelection="multiple"
              rowSelection={{ mode: "multiRow", checkboxes: true, headerCheckbox: true }}
              onSelectionChanged={e => {
                const sel = {};
                e.api.getSelectedNodes().forEach(n => { sel[n.data.material_id] = true; });
                setSelFrom(sel);
              }}
            />
          </div>
        </div>

        {/* Target File */}
        <div>
          <div style={sectionHeader}>
            <span>🎯 {fileName || `File ${fileId}`} — Required Materials</span>
            <span style={{ fontSize: ".75rem", opacity: .7 }}>{toRows.length} rows</span>
          </div>
          <div className="ag-theme-alpine" style={{ height: 420 }}>
            <AgGridReact
              rowData={toRows}
              columnDefs={matColTo}
              defaultColDef={dfltCol}
              rowHeight={40}
              headerHeight={44}
              // FIX: new object API
              rowSelection={{ mode: "multiRow", checkboxes: true, headerCheckbox: true }}
              onSelectionChanged={e => {
                const sel = {};
                e.api.getSelectedNodes().forEach(n => { sel[n.data.material_id] = true; });
                setSelTo(sel);
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 16 }}>
        <button
          onClick={handleAssign}
          disabled={saving}
          style={{ ...btnStyle("#0ea5e9"), minWidth: 200 }}
        >
          {saving
            ? <><Spinner size={14} color="#fff" /> &nbsp;Assigning…</>
            : "🔗 Assign Material"}
        </button>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
//  TAB 3 – Final Required Material
// ══════════════════════════════════════════════════════════════════════════════
const FinalRequiredMaterial = ({ fileId, fileName }) => {
  const [rows,    setRows]    = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [confirm, setConfirm] = useState(false);
  const gridRef = useRef();

  useEffect(() => {
    if (!fileId) return;
    setLoading(true);
    window.fetch(`${API}/getFinalRequiredMaterialApi.php?fileID=${fileId}`)
      .then(r => r.json())
      .then(d => {
        if (d.status && Array.isArray(d.data)) setRows(d.data);
        else if (Array.isArray(d)) setRows(d);
        else setRows([]);
      })
      .catch(e => { console.error(e); showToast("Load failed", "error"); })
      .finally(() => setLoading(false));
  }, [fileId]);

  const handleForward = async () => {
    setSaving(true);
    try {
      const payload = rows.map(r => ({
        material_name: r.material_name || r.material_description,
        unit:          r.unit,
        qty:           r.qty,
        purchase_qty:  r.purchase_qty,
      }));
      const res = await window.fetch(`${API}/forwardToPurchaseApi.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_id: fileId, materials: payload }),
      });
      const d = await res.json();
      if (d.status) {
        showToast("Forwarded to Purchase Dept!", "success");
        setConfirm(false);
      } else {
        showToast(d.message || "Error", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Forward failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const cols = [
    {
      headerName: "#",
      valueGetter: p => p.node.rowIndex + 1,
      width: 65,
      pinned: "left",
      cellStyle: { textAlign: "center", color: "#9ca3af", fontWeight: 600 },
      sortable: false,
      filter: false,
      floatingFilter: false,
    },
    {
      field: "material_description",
      headerName: "Material Description",
      flex: 1,
      minWidth: 260,
      cellStyle: { fontWeight: 600 },
    },
    {
      field: "unit",
      headerName: "Unit",
      width: 100,
      cellStyle: { textAlign: "center" },
    },
    {
      field: "qty",
      headerName: "Qty",
      width: 120,
      cellStyle: { textAlign: "right", fontFamily: "'Courier New',monospace" },
    },
    {
      field: "purchase_qty",
      headerName: "Purchase Qty",
      width: 150,
      cellStyle: {
        textAlign: "right", fontFamily: "'Courier New',monospace",
        color: "#f97316", fontWeight: 700,
      },
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 12,
      }}>
        <span style={{ color: "#6b7280", fontSize: ".82rem" }}>
          {loading ? <Spinner size={16} /> : `${rows.length} materials`}
        </span>
        <button onClick={() => setConfirm(true)} style={{ ...btnStyle("#7c3aed") }}>
          ⏩ Forward to Purchase Dept
        </button>
      </div>

      <div className="ag-theme-alpine" style={{ height: "calc(100vh - 320px)", width: "100%" }}>
        <AgGridReact
          ref={gridRef}
          rowData={rows}
          columnDefs={cols}
          defaultColDef={{ ...dfltCol, floatingFilter: false }}
          rowHeight={44}
          headerHeight={48}
          animateRows
          pagination
          paginationPageSize={20}
        />
      </div>

      {/* Confirm Modal */}
      {confirm && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,.5)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
        }}>
          <div style={{
            background: "#fff", borderRadius: 16, padding: 32, width: 400,
            boxShadow: "0 24px 64px rgba(0,0,0,.2)", textAlign: "center",
            fontFamily: "'Sora',sans-serif",
          }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📤</div>
            <h3 style={{ margin: "0 0 8px", color: "#111827" }}>Forward to Purchase?</h3>
            <p style={{ color: "#6b7280", margin: "0 0 24px", fontSize: ".9rem" }}>
              This will send the final material requirement sheet to the Purchase Department.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                onClick={() => setConfirm(false)}
                style={{
                  padding: "8px 20px", borderRadius: 8, border: "1px solid #d1d5db",
                  background: "#fff", cursor: "pointer", fontFamily: "'Sora',sans-serif",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleForward}
                disabled={saving}
                style={{ ...btnStyle("#7c3aed") }}
              >
                {saving
                  ? <><Spinner size={14} color="#fff" /> Sending…</>
                  : "✅ Confirm & Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
const TABS = [
  { id: "stock", label: "📦 Assign From Stock" },
  { id: "file",  label: "📂 Assign From File" },
  { id: "final", label: "📋 Final Req. Material" },
];

export default function AssignAssemblyMaterial() {
  const [fileId,    setFileId]    = useState(null);
  const [fileName,  setFileName]  = useState("");
  const [activeTab, setActiveTab] = useState("stock");
  const [theme,     setTheme]     = useState("light");

  // Parse file ID from URL hash and watch for changes
  useEffect(() => {
    const parse = () => {
      const id = getFileIdFromHash();
      setFileId(id);
    };
    parse();
    window.addEventListener("hashchange", parse);
    return () => window.removeEventListener("hashchange", parse);
  }, []);

  // Fetch file name
  useEffect(() => {
    if (!fileId) return;
    window.fetch(`${API}/getFileNameApi.php?fileID=${fileId}`)
      .then(r => r.json())
      .then(d => { if (d.file_name || d.FILE_NAME) setFileName(d.file_name || d.FILE_NAME); })
      .catch(() => {});
  }, [fileId]);

  // Inject global styles
  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
      @keyframes spin     { to { transform: rotate(360deg) } }
      @keyframes toastIn  { from { transform: translateY(60px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      @keyframes toastOut { from { transform: translateY(0);    opacity: 1 } to { transform: translateY(60px); opacity: 0 } }
      @keyframes fadeUp   { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }
      * { box-sizing: border-box }
      body { margin: 0; font-family: 'Sora', sans-serif; background: #f8fafc }
      .ag-theme-alpine .ag-header-cell { font-family: 'Sora', sans-serif !important; font-size: .8rem !important; font-weight: 600 !important; }
      .ag-theme-alpine .ag-cell        { font-family: 'Sora', sans-serif !important; font-size: .82rem !important; }
      .tab-btn-active { border-bottom: 3px solid #f97316 !important; color: #f97316 !important; font-weight: 700 !important; }
    `;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  const isDark = theme === "dark";
  const bg     = isDark ? "#0f172a" : "#f1f5f9";
  const card   = isDark ? "#1e293b" : "#ffffff";
  const txt    = isDark ? "#f1f5f9" : "#1e293b";
  const border = isDark ? "#334155" : "#e2e8f0";
  const hdr    = isDark
    ? "linear-gradient(135deg,#1e293b 0%,#0f172a 100%)"
    : "linear-gradient(135deg,#ea580c 0%,#f97316 50%,#fb923c 100%)";

  if (!fileId) return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", flexDirection: "column", gap: 12,
      fontFamily: "'Sora',sans-serif", background: bg,
    }}>
      <div style={{ fontSize: "3rem" }}>🔩</div>
      <h2 style={{ color: txt, margin: 0 }}>No File Selected</h2>
      <p style={{ color: "#94a3b8", margin: 0, fontSize: ".9rem" }}>
        Navigate to{" "}
        <code style={{
          background: "#1e293b", color: "#fb923c",
          padding: "2px 8px", borderRadius: 4,
        }}>
          #/assign-rfd-details/:fileId
        </code>
      </p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "'Sora',sans-serif" }}>

      {/* ── Top Header ── */}
      <div style={{
        background: hdr, padding: "10px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 2px 12px rgba(249,115,22,.3)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: "1.6rem" }}>🔩</span>
          <div>
            <h1 style={{
              margin: 0, color: "#fff", fontSize: "1rem",
              fontWeight: 700, letterSpacing: ".01em",
            }}>
              Assign Assembly Material
            </h1>
            <span style={{ color: "rgba(255,255,255,.75)", fontSize: ".75rem" }}>
              {fileName ? `📁 ${fileName}` : `File ID: ${fileId}`}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{
            background: "rgba(255,255,255,.15)", color: "#fff",
            padding: "3px 12px", borderRadius: 20, fontSize: ".75rem", fontWeight: 600,
          }}>
            ID: {fileId}
          </span>
          <button
            onClick={() => setTheme(t => t === "light" ? "dark" : "light")}
            style={{
              padding: "5px 12px", borderRadius: 8,
              border: "1px solid rgba(255,255,255,.3)",
              background: "rgba(255,255,255,.1)", color: "#fff", cursor: "pointer",
              fontSize: ".82rem", fontFamily: "'Sora',sans-serif",
            }}
          >
            {isDark ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      </div>

      {/* ── Card ── */}
      <div style={{ maxWidth: 1600, margin: "0 auto", padding: 16 }}>
        <div style={{
          background: card, border: `1px solid ${border}`, borderRadius: 16,
          overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,.06)",
          animation: "fadeUp .4s ease",
        }}>

          {/* Tab Bar */}
          <div style={{
            display: "flex", gap: 0, borderBottom: `2px solid ${border}`,
            background: isDark ? "#0f172a" : "#f8fafc", overflowX: "auto",
          }}>
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={activeTab === t.id ? "tab-btn-active" : ""}
                style={{
                  padding: "13px 22px", border: "none", background: "transparent",
                  color: activeTab === t.id ? "#f97316" : (isDark ? "#94a3b8" : "#64748b"),
                  cursor: "pointer", fontFamily: "'Sora',sans-serif",
                  fontSize: ".85rem", fontWeight: activeTab === t.id ? 700 : 500,
                  whiteSpace: "nowrap", transition: "all .2s",
                  borderBottom: activeTab === t.id ? "3px solid #f97316" : "3px solid transparent",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ color: txt }}>
            {activeTab === "stock" && <AssignFromStock fileId={fileId} fileName={fileName} />}
            {activeTab === "file"  && <AssignFromFile  fileId={fileId} fileName={fileName} />}
            {activeTab === "final" && <FinalRequiredMaterial fileId={fileId} fileName={fileName} />}
          </div>

        </div>
      </div>
    </div>
  );
}