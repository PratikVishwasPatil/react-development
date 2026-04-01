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

// ─── Group header colors ──────────────────────────────────────────────────────
const GC = {
  CCP:     "#c7d9f5",
  RCP:     "#f5c7d3",
  VFD:     "#d4edda",
  Gearbox: "#c7f0e0",
  Motor:   "#e8d5f5",
  Sensor:  "#c7f0f5",
  Curton:  "#fde8c7",
  PCable:  "#d4f5e0",
  Display: "#e8d5f5",
};

// ─── Status options ───────────────────────────────────────────────────────────
const STATUS_OPTIONS = ["Inprocess", "Complete", "Not Complete"];

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ toasts, removeToast }) => (
  <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
    {toasts.map(toast => (
      <div key={toast.id} style={{
        padding: "10px 16px", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 600,
        background: toast.type === "success" ? "#22c55e" : toast.type === "error" ? "#ef4444" : "#3b82f6",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        display: "flex", alignItems: "center", gap: 8,
        animation: "slideIn 0.3s ease", minWidth: 240, maxWidth: 380,
      }}>
        <span>{toast.type === "success" ? "✓" : toast.type === "error" ? "✗" : "ℹ"}</span>
        <span style={{ flex: 1 }}>{toast.message}</span>
        <span onClick={() => removeToast(toast.id)} style={{ cursor: "pointer", opacity: 0.7 }}>×</span>
      </div>
    ))}
    <style>{`@keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
  </div>
);

// ─── Editable Number Cell ─────────────────────────────────────────────────────
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
        borderRadius: 3, padding: "0 4px", fontSize: 11,
        background: focused ? "#fffdf0" : "transparent",
        outline: "none", fontWeight: 700, color: "#1a2332",
        textAlign: "center", transition: "all 0.15s",
      }}
    />
  );
};

// ─── Editable Text Cell ───────────────────────────────────────────────────────
const EditableTextCell = ({ value, node, colDef }) => {
  const [val, setVal] = useState(value ?? "");
  const [focused, setFocused] = useState(false);
  useEffect(() => { setVal(value ?? ""); }, [value]);
  return (
    <input
      type="text"
      value={val}
      onChange={e => { setVal(e.target.value); node.setDataValue(colDef.field, e.target.value); }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: "100%", height: "100%",
        border: focused ? "2px solid #f59e0b" : "1px solid transparent",
        borderRadius: 3, padding: "0 6px", fontSize: 11,
        background: focused ? "#fffdf0" : "transparent",
        outline: "none", fontWeight: 500, color: "#1a2332",
        transition: "all 0.15s",
      }}
    />
  );
};

// ─── Editable Date Cell (DD-MM-YYYY ↔ YYYY-MM-DD) ────────────────────────────
const EditableDateCell = ({ value, node, colDef }) => {
  const toInput = (v) => {
    if (!v) return "";
    const p = v.split("-");
    return p.length === 3 && p[0].length === 2 ? `${p[2]}-${p[1]}-${p[0]}` : v;
  };
  const [val, setVal] = useState(toInput(value));
  const [focused, setFocused] = useState(false);
  useEffect(() => { setVal(toInput(value)); }, [value]);
  return (
    <input
      type="date"
      value={val}
      onChange={e => { setVal(e.target.value); node.setDataValue(colDef.field, e.target.value); }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: "100%", height: "100%",
        border: focused ? "2px solid #f59e0b" : "1px solid transparent",
        borderRadius: 3, padding: "0 4px", fontSize: 10,
        background: focused ? "#fffdf0" : "transparent",
        outline: "none", fontWeight: 600, color: "#1a2332",
        transition: "all 0.15s",
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
      onChange={e => node.setDataValue(colDef.field, e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: "100%", height: "100%",
        border: focused ? "2px solid #f59e0b" : "1px solid transparent",
        borderRadius: 3, padding: "0 4px", fontSize: 11,
        background: focused ? "#fffdf0" : "transparent",
        outline: "none", fontWeight: 700, cursor: "pointer",
        color: value === "Complete" ? "#16a34a"
          : value === "Not Complete" ? "#dc2626"
          : value === "Inprocess" ? "#f59e0b" : "#1a2332",
      }}
    >
      <option value="">— Select —</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
};

// ─── Read-only display cells ──────────────────────────────────────────────────
const ReqQtyCell = ({ value }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontWeight: 700, fontSize: 12 }}>
    {value || "—"}
  </div>
);

// ─── Save Button Cell ─────────────────────────────────────────────────────────
const SaveButtonCell = ({ params, savingRow, onSave }) => {
  const id = params.node.data?.FILE_ID;
  const isSaving = savingRow === id;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
      <button
        onClick={() => onSave(params)}
        disabled={isSaving}
        style={{
          background: isSaving ? "#94a3b8" : "linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%)",
          color: "#fff", border: "none", borderRadius: 6,
          padding: "4px 10px", fontSize: 10, fontWeight: 700,
          cursor: isSaving ? "not-allowed" : "pointer",
          boxShadow: "0 2px 6px rgba(37,99,235,0.25)",
          transition: "all 0.2s", whiteSpace: "nowrap",
          display: "flex", alignItems: "center", gap: 4,
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

// ─── Cell style helpers ───────────────────────────────────────────────────────
const editStyle  = (bg) => ({ background: bg + "cc", borderLeft: `2px solid ${bg}`, padding: 0 });
const readStyle  = (bg) => ({ background: bg + "88", padding: "0 6px", textAlign: "center", fontWeight: 700 });

// ─── Date convert helper (YYYY-MM-DD → DD-MM-YYYY for API) ───────────────────
const toApiDate = (v) => {
  if (!v) return "";
  const p = v.split("-");
  return p.length === 3 && p[0].length === 4 ? `${p[2]}-${p[1]}-${p[0]}` : v;
};

// ─── Format INR ──────────────────────────────────────────────────────────────
const fmtIN = (v) => {
  if (!v && v !== 0) return "—";
  return "₹" + Number(v).toLocaleString("en-IN");
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── TAB 1 : Electrical ──────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
const ElectricalTab = ({ theme, t, addToast }) => {
  const [data,        setData]        = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");
  const [totalRecords,setTotalRecords]= useState(0);
  const [savingRow,   setSavingRow]   = useState(null);
  const [search,      setSearch]      = useState("");
  const gridRef = useRef();

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchData = useCallback(() => {
    setLoading(true);
    fetch("http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/ElectricalTabApi.php")
      .then(r => r.json())
      .then(res => {
        if (res.status && Array.isArray(res.data)) {
          setData(res.data);
          setTotalRecords(res.total_records || res.data.length);
          setLastUpdated(res.last_updated || "");
        } else addToast("No data received from API", "error");
      })
      .catch(err => addToast("Failed to fetch: " + err.message, "error"))
      .finally(() => setLoading(false));
  }, [addToast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = useMemo(() =>
    search ? data.filter(r => r.FILE_NAME?.toLowerCase().includes(search.toLowerCase())) : data
  , [data, search]);

  const stats = useMemo(() => {
    const total      = data.length;
    const inprocess  = data.filter(r => r.STATUS_ELECTRICAL?.toLowerCase() === "inprocess").length;
    const complete   = data.filter(r => r.STATUS_ELECTRICAL?.toLowerCase() === "complete").length;
    const notComplete= data.filter(r => r.STATUS_ELECTRICAL?.toLowerCase() === "not complete").length;
    return { total, inprocess, complete, notComplete };
  }, [data]);

  // ── Save — maps to PHP field names exactly ─────────────────────────────────
  const handleSave = useCallback(async (params) => {
    const row    = params.node.data;
    const fileId = row.FILE_ID;
    setSavingRow(fileId);

    try {
      const form = new FormData();

      // PHP: $fileID = $_POST['fileId']
      form.append("fileId",             fileId);

      // PHP: $start_date = $_POST['start_date']  — send as DD-MM-YYYY
      form.append("start_date",         toApiDate(row.date || ""));

      // ── Req quantities (read-only from API, sent back as-is) ──
      form.append("ccpReq",             row.ccp       || "");  // PHP: $ccpReq
      form.append("rcpReq",             row.rcp       || "");  // PHP: $rcpReq
      form.append("vfdReq",             row.vfd       || "");  // PHP: $vfdReq
      form.append("gearbox",            row.gearbox   || "");  // PHP: $gearbox
      form.append("motorReq",           row.motor     || "");  // PHP: $motorReq
      form.append("sensorReq",          row.sensor    || "");  // PHP: $sensorReq

      // ── Fin quantities (editable) ────────────────────────────
      form.append("CCP",                row.CCP       || "");  // PHP: $CCP
      form.append("RCP",                row.RCP       || "");  // PHP: $RCP
      form.append("VFD",                row.VFD       || "");  // PHP: $VFD
      form.append("GBM",                row.GBM       || "");  // PHP: $GBM
      form.append("Motor",              row.motor1    || "");  // PHP: $Motor
      form.append("SENSOR",             row.SENSOR    || "");  // PHP: $SENSOR

      // ── Curton Sensor ─────────────────────────────────────────
      form.append("curtonS",            row.curtonS   || "");  // PHP: $curtonS  (Req Y/N)
      form.append("curtonSS",           row.curtonSS  || "");  // PHP: $curtonSS (Fin Y/N - editable)

      // ── P.Cables / Display / Floor Sensor ────────────────────
      form.append("PCABLES",            row.pcable    || "");  // PHP: $PCABLES
      form.append("display_board",      row.displayBoard || ""); // PHP: $display_board
      form.append("FSENSOR",            row.FSENSOR   || "");  // PHP: $FSENSOR

      // ── Status / Remark / Dates / Costs ──────────────────────
      form.append("STATUS_ELECTRICAL",  row.STATUS_ELECTRICAL || ""); // PHP: $STATUS_ELECTRICAL
      form.append("remark",             row.remark    || "");         // PHP: $remark
      form.append("DISPATCH_DATE",      toApiDate(row.DISPATCH_DATE || "")); // PHP: $DISPATCH_DATE
      form.append("BOM",                row.BOM       || "");         // PHP: $BOM
      form.append("MKTGCOST",           row.MKTGCOST  || "");         // PHP: $MKTGCOST

      const res  = await fetch(
        "http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/ElectDashboardSaveApi.php",
        { method: "POST", body: form }
      );
      const json = await res.json();
      if (json.status) addToast(`✓ Saved ${row.FILE_NAME} successfully`, "success");
      else             addToast("Save failed: " + (json.message || json.error || "Unknown error"), "error");
    } catch (err) {
      addToast("Network error: " + err.message, "error");
    } finally {
      setSavingRow(null);
    }
  }, [addToast]);

  // ── Column Definitions ─────────────────────────────────────────────────────
  // RULE: cellRenderer columns → filter:false, NO floatingFilter
  // Only plain text/number columns may use floatingFilter safely
  const columnDefs = useMemo(() => [

    // ── Pinned left: SR, File No ──────────────────────────────────────────
    {
      headerName: "SR.NO.", field: "count",
      width: 68, pinned: "left", filter: false, sortable: true,
      cellStyle: { fontWeight: 700, textAlign: "center", color: t.subtext, fontSize: 11 },
    },
    {
      headerName: "File No.", field: "FILE_NAME",
      width: 175, pinned: "left",
      filter: "agTextColumnFilter", floatingFilter: true, // ✅ safe — no cellRenderer
      cellStyle: { fontWeight: 700, color: t.accent, fontSize: 12 },
    },

    // ── EDITABLE: Start Date ──────────────────────────────────────────────
    {
      headerName: "Start Date", field: "date",
      width: 145, filter: false, sortable: true,
      cellRenderer: p => <EditableDateCell value={p.value} node={p.node} colDef={p.colDef} />,
      cellStyle: editStyle(GC.CCP),
    },

    // ── CCP Group ────────────────────────────────────────────────────────
    {
      headerName: "CCP",
      headerClass: "grp-ccp",
      children: [
        {
          headerName: "Req.Qty", field: "ccp",       // read-only
          width: 85, filter: false, sortable: true,
          cellStyle: readStyle(GC.CCP),
        },
        {
          headerName: "Fin.Qty", field: "CCP",       // EDITABLE → PHP: CCP
          width: 85, filter: false, sortable: true,
          cellRenderer: p => <EditableNumCell value={p.value} node={p.node} colDef={p.colDef} />,
          cellStyle: { ...editStyle(GC.CCP), background: GC.CCP + "bb" },
        },
      ],
    },

    // ── RCP Group ────────────────────────────────────────────────────────
    {
      headerName: "RCP",
      headerClass: "grp-rcp",
      children: [
        {
          headerName: "Req.Qty", field: "rcp",       // read-only
          width: 85, filter: false, sortable: true,
          cellStyle: readStyle(GC.RCP),
        },
        {
          headerName: "Fin.Qty", field: "RCP",       // EDITABLE → PHP: RCP
          width: 85, filter: false, sortable: true,
          cellRenderer: p => <EditableNumCell value={p.value} node={p.node} colDef={p.colDef} />,
          cellStyle: { ...editStyle(GC.RCP), background: GC.RCP + "bb" },
        },
      ],
    },

    // ── VFD/Contractor Group ──────────────────────────────────────────────
    {
      headerName: "VFD/Contractor",
      headerClass: "grp-vfd",
      children: [
        {
          headerName: "Req.Qty", field: "vfd",       // read-only
          width: 85, filter: false, sortable: true,
          cellStyle: readStyle(GC.VFD),
        },
        {
          headerName: "Fin.Qty", field: "VFD",       // EDITABLE → PHP: VFD
          width: 85, filter: false, sortable: true,
          cellRenderer: p => <EditableNumCell value={p.value} node={p.node} colDef={p.colDef} />,
          cellStyle: { ...editStyle(GC.VFD), background: GC.VFD + "bb" },
        },
      ],
    },

    // ── Gearbox Group ────────────────────────────────────────────────────
    {
      headerName: "Gearbox",
      headerClass: "grp-gearbox",
      children: [
        {
          headerName: "Req.Qty", field: "gearbox",   // read-only
          width: 85, filter: false, sortable: true,
          cellStyle: readStyle(GC.Gearbox),
        },
        {
          headerName: "Fin.Qty", field: "GBM",       // EDITABLE → PHP: GBM
          width: 85, filter: false, sortable: true,
          cellRenderer: p => <EditableNumCell value={p.value} node={p.node} colDef={p.colDef} />,
          cellStyle: { ...editStyle(GC.Gearbox), background: GC.Gearbox + "bb" },
        },
      ],
    },

    // ── Motor Group ───────────────────────────────────────────────────────
    {
      headerName: "Motor",
      headerClass: "grp-motor",
      children: [
        {
          headerName: "Req.Qty", field: "motor",     // read-only
          width: 85, filter: false, sortable: true,
          cellStyle: readStyle(GC.Motor),
        },
        {
          headerName: "Fin.Qty", field: "motor1",    // EDITABLE → PHP: Motor
          width: 85, filter: false, sortable: true,
          cellRenderer: p => <EditableNumCell value={p.value} node={p.node} colDef={p.colDef} />,
          cellStyle: { ...editStyle(GC.Motor), background: GC.Motor + "bb" },
        },
      ],
    },

    // ── Sensor Group ─────────────────────────────────────────────────────
    {
      headerName: "Sensor",
      headerClass: "grp-sensor",
      children: [
        {
          headerName: "Req.Qty", field: "sensor",    // read-only
          width: 85, filter: false, sortable: true,
          cellStyle: readStyle(GC.Sensor),
        },
        {
          headerName: "Fin.Qty", field: "SENSOR",    // EDITABLE → PHP: SENSOR
          width: 85, filter: false, sortable: true,
          cellRenderer: p => <EditableNumCell value={p.value} node={p.node} colDef={p.colDef} />,
          cellStyle: { ...editStyle(GC.Sensor), background: GC.Sensor + "bb" },
        },
      ],
    },

    // ── Curton Sensor Group ────────────────────────────────────────────────
    {
      headerName: "Curton Sensor",
      headerClass: "grp-curton",
      children: [
        {
          headerName: "Req.Y/N", field: "curtonS",   // read-only
          width: 90, filter: false, sortable: false,
          cellStyle: readStyle(GC.Curton),
        },
        {
          headerName: "Fin.Y/N", field: "curtonSS",  // EDITABLE → PHP: curtonSS
          width: 90, filter: false, sortable: false,
          cellRenderer: p => <EditableTextCell value={p.value} node={p.node} colDef={p.colDef} />,
          cellStyle: { ...editStyle(GC.Curton), background: GC.Curton + "bb" },
        },
      ],
    },

    // ── P.Cables ─────────────────────────────────────────────────────────
    {
      headerName: "P.Cables",
      headerClass: "grp-pcable",
      children: [
        {
          headerName: "Req.Y/N", field: "pcable",    // EDITABLE → PHP: PCABLES
          width: 95, filter: false, sortable: false,
          cellRenderer: p => <EditableTextCell value={p.value} node={p.node} colDef={p.colDef} />,
          cellStyle: { ...editStyle(GC.PCable), background: GC.PCable + "bb" },
        },
      ],
    },

    // ── Display Board ─────────────────────────────────────────────────────
    {
      headerName: "Display Board",
      headerClass: "grp-display",
      children: [
        {
          headerName: "Y/N", field: "displayBoard",  // EDITABLE → PHP: display_board
          width: 85, filter: false, sortable: false,
          cellRenderer: p => <EditableTextCell value={p.value} node={p.node} colDef={p.colDef} />,
          cellStyle: { ...editStyle(GC.Display), background: GC.Display + "bb" },
        },
      ],
    },

    // ── Floor Sensor — EDITABLE → PHP: FSENSOR ───────────────────────────
    {
      headerName: "Floor Sensor", field: "FSENSOR",
      width: 115, filter: false, sortable: false,
      cellRenderer: p => <EditableTextCell value={p.value} node={p.node} colDef={p.colDef} />,
      cellStyle: editStyle("#e0e7ff"),
    },

    // ── Status — EDITABLE dropdown → PHP: STATUS_ELECTRICAL ──────────────
    {
      headerName: "Status", field: "STATUS_ELECTRICAL",
      width: 140, filter: false, sortable: true,
      cellRenderer: p => (
        <EditableSelectCell
          value={p.value} node={p.node} colDef={p.colDef}
          options={STATUS_OPTIONS}
        />
      ),
      cellStyle: editStyle("#fef3c7"),
    },

    // ── Remark — EDITABLE → PHP: remark ──────────────────────────────────
    {
      headerName: "Remark", field: "remark",
      width: 220, filter: false, sortable: false,
      cellRenderer: p => <EditableTextCell value={p.value} node={p.node} colDef={p.colDef} />,
      cellStyle: editStyle("#f0fdf4"),
    },

    // ── Dispatch Date — EDITABLE → PHP: DISPATCH_DATE ────────────────────
    {
      headerName: "Dispatch Date", field: "DISPATCH_DATE",
      width: 150, filter: false, sortable: true,
      cellRenderer: p => <EditableDateCell value={p.value} node={p.node} colDef={p.colDef} />,
      cellStyle: editStyle("#fce7f3"),
    },

    // ── Electrical BOM — EDITABLE → PHP: BOM ─────────────────────────────
    {
      headerName: "ELE BOM (₹)", field: "BOM",
      width: 135, filter: false, sortable: true,
      cellRenderer: p => <EditableNumCell value={p.value} node={p.node} colDef={p.colDef} />,
      cellStyle: { ...editStyle("#dbeafe"), textAlign: "right" },
    },

    // ── Mkt Cost — read-only display ──────────────────────────────────────
    {
      headerName: "Mkt. Cost Rs.", field: "MKTGCOST",
      width: 135, filter: false, sortable: true,
      valueFormatter: p => p.value ? "₹" + Number(p.value).toLocaleString("en-IN") : "—",
      cellStyle: { textAlign: "right", fontSize: 11, fontWeight: 700, color: "#7c3aed" },
    },

    // ── Action — pinned right ─────────────────────────────────────────────
    {
      headerName: "Action", width: 95, pinned: "right",
      sortable: false, filter: false,
      cellRenderer: p => <SaveButtonCell params={p} savingRow={savingRow} onSave={handleSave} />,
      cellStyle: { background: "#f8fafc", padding: "0 4px" },
    },
  ], [t, savingRow, handleSave]);

  const defaultColDef = useMemo(() => ({ sortable: true, resizable: true, filter: false }), []);

  const exportCsv = () => gridRef.current?.api?.exportDataAsCsv({
    fileName: `Electrical_${new Date().toISOString().split("T")[0]}.csv`
  });
  const autoSize = () => {
    const ids = gridRef.current?.api?.getColumns()?.map(c => c.getId()) || [];
    if (ids.length) gridRef.current.api.autoSizeColumns(ids, false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>

      {/* Summary */}
      {!loading && data.length > 0 && (
        <div style={{
          background: t.card, borderBottom: `1px solid ${t.border}`,
          padding: "10px 24px", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center",
        }}>
          {[
            { label: "Total Records",  value: totalRecords,       color: t.accent,  bg: "rgba(37,99,235,0.08)" },
            { label: "In Process",     value: stats.inprocess,    color: "#f59e0b", bg: "rgba(245,158,11,0.1)"  },
            { label: "Complete",       value: stats.complete,     color: "#16a34a", bg: "rgba(22,163,74,0.08)"  },
            { label: "Not Complete",   value: stats.notComplete,  color: "#dc2626", bg: "rgba(220,38,38,0.07)"  },
          ].map((s, i) => (
            <div key={i} style={{
              background: s.bg, border: `1px solid ${s.color}33`,
              borderRadius: 8, padding: "6px 14px", minWidth: 120,
            }}>
              <div style={{ fontSize: 9, color: s.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
          {lastUpdated && (
            <div style={{ marginLeft: "auto", fontSize: 11, color: t.subtext, fontWeight: 600 }}>
              Recent Updated Date: {lastUpdated}
            </div>
          )}
          <div style={{
            background: "rgba(245,158,11,0.1)", border: "1px solid #f59e0b44",
            borderLeft: "3px solid #f59e0b", borderRadius: 6,
            padding: "4px 12px", fontSize: 11, color: "#92400e", fontWeight: 600,
          }}>
            ✏️ Yellow columns are editable — click to edit, then 💾 Save
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div style={{
        background: t.card, borderBottom: `1px solid ${t.border}`,
        padding: "8px 24px", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap",
      }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search file name…"
          style={{
            padding: "5px 12px", borderRadius: 6, border: `1px solid ${t.border}`,
            background: t.card, color: t.text, fontSize: 12, outline: "none", width: 220,
          }}
        />
        <span style={{ fontSize: 12, color: t.subtext }}>{filtered.length} records</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {[
            { label: "📥 Download Excel Export File",  fn: exportCsv,                                           bg: "#e85d04" },
            { label: "↔ Size To Fit",                  fn: () => gridRef.current?.api?.sizeColumnsToFit(),      bg: "#f59e0b" },
            { label: "⬌ Auto-Size All",                fn: autoSize,                                            bg: "#f59e0b" },
            { label: "🔄 Refresh",                     fn: fetchData,                                           bg: "#3b82f6" },
          ].map(btn => (
            <button key={btn.label} onClick={btn.fn} style={{
              padding: "6px 12px", background: btn.bg, border: "none",
              borderRadius: 6, color: "#fff", fontWeight: 700, fontSize: 11, cursor: "pointer",
            }}>{btn.label}</button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ padding: "12px 24px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: t.subtext }}>
            <div style={{
              width: 44, height: 44, border: `4px solid ${t.border}`,
              borderTop: `4px solid ${t.accent}`, borderRadius: "50%",
              animation: "spin 0.8s linear infinite", margin: "0 auto 14px",
            }} />
            <div>Loading Electrical data…</div>
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
              .ag-theme-alpine .ag-header-cell      { font-size: 11px !important; font-weight: 700 !important; }
              .ag-theme-alpine .ag-header-group-cell { font-size: 11px !important; font-weight: 800 !important; }
              .ag-floating-filter-input              { font-size: 11px !important; }

              /* Group header row background colors */
              .ag-theme-alpine .grp-ccp     { background: ${GC.CCP}     !important; color: #1e3a5f !important; }
              .ag-theme-alpine .grp-rcp     { background: ${GC.RCP}     !important; color: #7f1d1d !important; }
              .ag-theme-alpine .grp-vfd     { background: ${GC.VFD}     !important; color: #14532d !important; }
              .ag-theme-alpine .grp-gearbox { background: ${GC.Gearbox} !important; color: #14532d !important; }
              .ag-theme-alpine .grp-motor   { background: ${GC.Motor}   !important; color: #4c1d95 !important; }
              .ag-theme-alpine .grp-sensor  { background: ${GC.Sensor}  !important; color: #164e63 !important; }
              .ag-theme-alpine .grp-curton  { background: ${GC.Curton}  !important; color: #7c2d12 !important; }
              .ag-theme-alpine .grp-pcable  { background: ${GC.PCable}  !important; color: #14532d !important; }
              .ag-theme-alpine .grp-display { background: ${GC.Display} !important; color: #4c1d95 !important; }
            `}</style>
            <div
              className="ag-theme-alpine"
              style={{
                height: "calc(100vh - 340px)", minHeight: 420, width: "100%",
                "--ag-background-color":         t.gridBg,
                "--ag-header-background-color":  t.tableHead,
                "--ag-header-foreground-color":  "#fff",
                "--ag-foreground-color":         t.text,
                "--ag-border-color":             t.border,
                "--ag-odd-row-background-color": t.tableRow,
                "--ag-row-hover-color":          theme === "light" ? "#eff6ff" : "#1e3a5f33",
                "--ag-font-size":                "11px",
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
                rowHeight={42}
                headerHeight={36}
                groupHeaderHeight={30}
                floatingFiltersHeight={34}
                enableCellTextSelection
                onGridReady={() => setTimeout(autoSize, 300)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── TAB 2 : Stock and Rate Details ─────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
const StockRateTab = ({ theme, t, addToast }) => {
  const [data,         setData]         = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const gridRef = useRef();

  const fetchData = useCallback(() => {
    setLoading(true);
    fetch("http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/StockandrateTabApi.php")
      .then(r => r.json())
      .then(res => {
        if (res.status && Array.isArray(res.data)) {
          setData(res.data);
          setTotalRecords(res.total_records || res.data.length);
        } else addToast("No data from Stock & Rate API", "error");
      })
      .catch(err => addToast("Failed to fetch: " + err.message, "error"))
      .finally(() => setLoading(false));
  }, [addToast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = useMemo(() =>
    search
      ? data.filter(r =>
          r.materialName?.toLowerCase().includes(search.toLowerCase()) ||
          r.materialInitial?.toLowerCase().includes(search.toLowerCase()) ||
          r.materialId?.toString().includes(search)
        )
      : data
  , [data, search]);

  const stats = useMemo(() => {
    const inStock    = data.filter(r => Number(r.stock) > 0).length;
    const outOfStock = data.filter(r => Number(r.stock) === 0).length;
    const totalValue = data.reduce((s, r) => s + Number(r.rate || 0) * Number(r.stock || 0), 0);
    return { inStock, outOfStock, totalValue };
  }, [data]);

  const columnDefs = useMemo(() => [
    {
      headerName: "SR. NO.",
      valueGetter: p => p.node ? p.node.rowIndex + 1 : "",
      width: 80, pinned: "left", filter: false, sortable: false,
      cellStyle: { fontWeight: 700, textAlign: "center", color: t.subtext, fontSize: 11 },
    },
    {
      headerName: "MATERIAL ID", field: "materialId",
      width: 130, filter: "agTextColumnFilter", floatingFilter: true,
      cellStyle: { fontWeight: 700, color: t.accent, fontSize: 11, textAlign: "center" },
    },
    {
      headerName: "MATERIAL NAME", field: "materialName",
      width: 300, filter: "agTextColumnFilter", floatingFilter: true,
      cellStyle: { fontSize: 11, fontWeight: 500 },
      tooltipField: "materialName",
    },
    {
      headerName: "MATERIAL INITIAL", field: "materialInitial",
      width: 165, filter: "agTextColumnFilter", floatingFilter: true,
      cellRenderer: p => p.value ? (
        <span style={{
          background: "#dbeafe", color: "#1d4ed8",
          borderRadius: 4, padding: "2px 8px", fontSize: 10, fontWeight: 700,
        }}>{p.value}</span>
      ) : "—",
      cellStyle: { textAlign: "center" },
    },
    {
      headerName: "MAKE", field: "makeName",
      width: 130, filter: "agTextColumnFilter", floatingFilter: true,
      cellStyle: { fontSize: 11, fontWeight: 600, textAlign: "center" },
    },
    {
      headerName: "RATE", field: "rate",
      width: 140, filter: "agNumberColumnFilter", floatingFilter: true,
      valueFormatter: p => p.value ? "₹" + Number(p.value).toLocaleString("en-IN") : "₹0",
      cellStyle: { textAlign: "right", fontSize: 12, fontWeight: 700, color: "#2563eb" },
    },
    {
      headerName: "STOCK", field: "stock",
      width: 110, filter: "agNumberColumnFilter", floatingFilter: true,
      cellRenderer: p => {
        const v = Number(p.value) || 0;
        return (
          <span style={{
            background: v > 0 ? "rgba(22,163,74,0.1)" : "rgba(220,38,38,0.08)",
            color: v > 0 ? "#16a34a" : "#dc2626",
            borderRadius: 4, padding: "2px 10px", fontSize: 11, fontWeight: 800,
          }}>{v}</span>
        );
      },
      cellStyle: { textAlign: "center" },
    },
  ], [t]);

  const defaultColDef = useMemo(() => ({ sortable: true, resizable: true }), []);

  const exportCsv = () => gridRef.current?.api?.exportDataAsCsv({
    fileName: `StockRate_${new Date().toISOString().split("T")[0]}.csv`
  });
  const autoSize = () => {
    const ids = gridRef.current?.api?.getColumns()?.map(c => c.getId()) || [];
    if (ids.length) gridRef.current.api.autoSizeColumns(ids, false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>

      {/* Summary */}
      {!loading && data.length > 0 && (
        <div style={{
          background: t.card, borderBottom: `1px solid ${t.border}`,
          padding: "10px 24px", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center",
        }}>
          {[
            { label: "Total Items",  value: totalRecords,              color: t.accent,  bg: "rgba(37,99,235,0.08)" },
            { label: "In Stock",     value: stats.inStock,             color: "#16a34a", bg: "rgba(22,163,74,0.08)" },
            { label: "Out of Stock", value: stats.outOfStock,          color: "#dc2626", bg: "rgba(220,38,38,0.08)" },
            { label: "Stock Value",  value: fmtIN(stats.totalValue),   color: "#7c3aed", bg: "rgba(124,58,237,0.07)" },
          ].map((s, i) => (
            <div key={i} style={{
              background: s.bg, border: `1px solid ${s.color}33`,
              borderRadius: 8, padding: "6px 14px", minWidth: 120,
            }}>
              <div style={{ fontSize: 9, color: s.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div style={{
        background: t.card, borderBottom: `1px solid ${t.border}`,
        padding: "8px 24px", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap",
      }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search material name / initial / ID…"
          style={{
            padding: "5px 12px", borderRadius: 6, border: `1px solid ${t.border}`,
            background: t.card, color: t.text, fontSize: 12, outline: "none", width: 280,
          }}
        />
        <span style={{ fontSize: 12, color: t.subtext }}>{filtered.length} records</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {[
            { label: "📥 Download Excel Export File",  fn: exportCsv,                                           bg: "#e85d04" },
            { label: "↔ Size To Fit",                  fn: () => gridRef.current?.api?.sizeColumnsToFit(),      bg: "#f59e0b" },
            { label: "⬌ Auto-Size All",                fn: autoSize,                                            bg: "#f59e0b" },
            { label: "🔄 Refresh",                     fn: fetchData,                                           bg: "#3b82f6" },
          ].map(btn => (
            <button key={btn.label} onClick={btn.fn} style={{
              padding: "6px 12px", background: btn.bg, border: "none",
              borderRadius: 6, color: "#fff", fontWeight: 700, fontSize: 11, cursor: "pointer",
            }}>{btn.label}</button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ padding: "12px 24px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: t.subtext }}>
            <div style={{
              width: 44, height: 44, border: `4px solid ${t.border}`,
              borderTop: `4px solid ${t.accent}`, borderRadius: "50%",
              animation: "spin 0.8s linear infinite", margin: "0 auto 14px",
            }} />
            <div>Loading Stock & Rate data…</div>
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
            <div
              className="ag-theme-alpine"
              style={{
                height: "calc(100vh - 280px)", minHeight: 420, width: "100%",
                "--ag-background-color":         t.gridBg,
                "--ag-header-background-color":  t.tableHead,
                "--ag-header-foreground-color":  "#fff",
                "--ag-foreground-color":         t.text,
                "--ag-border-color":             t.border,
                "--ag-odd-row-background-color": t.tableRow,
                "--ag-row-hover-color":          theme === "light" ? "#eff6ff" : "#1e3a5f33",
                "--ag-font-size":                "11px",
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
                rowHeight={40}
                headerHeight={44}
                floatingFiltersHeight={34}
                enableCellTextSelection
                tooltipShowDelay={300}
                onGridReady={() => setTimeout(autoSize, 300)}
                getRowStyle={p => ({
                  background: Number(p.data?.stock) === 0
                    ? (theme === "light" ? "#fff5f5" : "#2d1515")
                    : undefined,
                })}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── MAIN APP ────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export default function ElectricalDashboard() {
  const [theme,     setTheme]     = useState("light");
  const [activeTab, setActiveTab] = useState("electrical");
  const [toasts,    setToasts]    = useState([]);
  const t = theme === "light" ? LIGHT : DARK;

  const addToast = useCallback((message, type = "info") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 3500);
  }, []);
  const removeToast = useCallback((id) => setToasts(prev => prev.filter(x => x.id !== id)), []);

  const TABS = [
    { id: "electrical", label: "Electrical" },
    { id: "stockrate",  label: "Stock and Rate Details" },
  ];

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
            <div style={{ fontWeight: 800, fontSize: 16, color: "#fff", letterSpacing: 0.5 }}>
              SURYA ERP — Electrical Dashboard
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", letterSpacing: 1 }}>
              EQUIPMENT MANAGEMENT SYSTEM
            </div>
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

      {/* ── TABS ── */}
      <div style={{
        background: t.card, borderBottom: `1px solid ${t.border}`,
        display: "flex", paddingLeft: 16, gap: 4,
        position: "sticky", top: 56, zIndex: 99,
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "10px 20px", border: "none",
              fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap",
              color: activeTab === tab.id ? "#fff" : t.subtext,
              background: activeTab === tab.id
                ? "linear-gradient(135deg,#e85d04,#f97316)"
                : "transparent",
              borderRadius: activeTab === tab.id ? "6px 6px 0 0" : 0,
              transition: "all 0.2s", marginTop: 6,
            }}
          >{tab.label}</button>
        ))}
      </div>

      {/* ── CONTENT ── */}
      <div style={{ display: activeTab === "electrical" ? "block" : "none" }}>
        <ElectricalTab theme={theme} t={t} addToast={addToast} />
      </div>
      <div style={{ display: activeTab === "stockrate" ? "block" : "none" }}>
        <StockRateTab theme={theme} t={t} addToast={addToast} />
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}