import React, { useEffect, useState, useCallback } from "react";

const FILTER_API = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/FilterDispatchDataApi.php";
const SAVE_API   = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/SaveDispatchDetailsApi.php";

// ── Parse disp_id from hash: #/dispatch-details/:disp_id ─────────────────────
const getDispId = () => {
    const hash = window.location.hash || "";
    const m = hash.match(/\/dispatch-details\/(\d+)/);
    if (m) return m[1];
    return new URLSearchParams(window.location.search).get("disp_id") || "";
};

// ── Utilities ─────────────────────────────────────────────────────────────────
const toDisplayTime = (t) => {
    if (!t) return "";
    if (/AM|PM/i.test(t)) return t;            // already "HH:MM AM/PM"
    const parts = t.split(":").map(Number);
    const h = parts[0], m = parts[1] ?? 0;
    const ampm = h >= 12 ? "PM" : "AM";
    const h12  = ((h % 12) || 12);
    return `${String(h12).padStart(2,"0")}:${String(m).padStart(2,"0")} ${ampm}`;
};

const makeEmptyRow = (dispatch_no = "", dispatch_time = "05:30 PM", dispatch_type = "") => ({
    _id:             Date.now() + Math.random(),
    isNew:           true,
    ids:             "0",
    dispatch_date:   "",
    lrno:            "",
    transport_value: "",
    bill_no:         "",
    billing_amount:  "",
    actual_weight:   "",
    transporter:     "",
    vehicle_number:  "",
    dispatch_no,
    dispatch_time,
    dispatch_type,
    distance_km:     "",
    made_by_name:    "",
    added_by:        "",
    saving:          false,
});

// Convert raw API row → editable state row
const apiRowToEditable = (row) => ({
    _id:             String(row.ids),
    isNew:           false,
    ids:             String(row.ids),
    sr_no:           row.sr_no,
    file_id:         row.file_id,
    file_name:       row.file_name,
    customer_name:   row.customer_name,
    location:        row.location,
    dispatch_date:   row.dispatch_date    || "",
    lrno:            row.lrno             || "",
    transport_value: String(row.transport_value  || ""),
    bill_no:         row.bill_no          || "",
    billing_amount:  String(row.billing_amount   || ""),
    actual_weight:   String(row.actual_weight    || ""),
    transporter:     row.transporter      || "",
    vehicle_number:  row.vehicle_number   || "",
    dispatch_no:     String(row.dispatch_no || ""),
    dispatch_time:   toDisplayTime(row.dispatch_time),
    dispatch_type:   row.dispatch_type    || "",
    distance_km:     String(row.distance_km || ""),
    added_by:        row.added_by         || "",
    made_by_name:    row.made_by_name     || "",
    saving:          false,
});

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

:root {
  --bg:#f4f6ff; --card:#ffffff; --border:#e0e7ff; --text:#0f172a;
  --muted:#64748b; --accent:#4f46e5; --accent2:#e8560a;
  --header-bg:#1e1b4b; --header-fg:#ffffff;
  --row-a:#f8faff; --row-b:#ffffff; --row-hover:#eef2ff;
  --total-bg:#fffbeb; --new-bg:#f0fdf4;
  --shadow:0 4px 24px rgba(79,70,229,0.09); --shadow-sm:0 2px 8px rgba(79,70,229,0.07);
}
.dd-dark {
  --bg:#090e1a; --card:#0f1629; --border:#1e3060; --text:#e2e8f0;
  --muted:#64748b; --accent:#818cf8; --accent2:#fb923c;
  --header-bg:#131e38; --header-fg:#c7d2fe;
  --row-a:#0d1226; --row-b:#0a0f1e; --row-hover:#151f3a;
  --total-bg:#1c1800; --new-bg:#052e16;
  --shadow:0 4px 24px rgba(0,0,0,0.45); --shadow-sm:0 2px 8px rgba(0,0,0,0.35);
}

body{background:var(--bg);font-family:'Outfit',sans-serif;color:var(--text)}

@keyframes spin   {to{transform:rotate(360deg)}}
@keyframes fadeUp {from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes rowIn  {from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:translateX(0)}}
@keyframes slide  {from{opacity:0;transform:translateX(48px)}to{opacity:1;transform:translateX(0)}}
@keyframes pulse  {0%,100%{opacity:1}50%{opacity:.45}}

.dd-root{min-height:100vh;background:var(--bg);color:var(--text);font-family:'Outfit',sans-serif}

/* TOPBAR */
.dd-topbar{
  background:linear-gradient(135deg,#1e1b4b 0%,#312e81 40%,#4f46e5 80%,#6366f1 100%);
  padding:16px 28px;display:flex;align-items:center;justify-content:space-between;
  flex-wrap:wrap;gap:10px;box-shadow:0 4px 20px rgba(79,70,229,0.35);
  position:sticky;top:0;z-index:100;
}
.dd-dark .dd-topbar{background:linear-gradient(135deg,#0d1117 0%,#1a1f2e 60%,#1e293b 100%)}
.dd-topbar-left{display:flex;align-items:center;gap:14px}
.dd-icon{width:40px;height:40px;border-radius:10px;background:rgba(255,255,255,0.14);display:flex;align-items:center;justify-content:center;font-size:1.25rem;flex-shrink:0}
.dd-title{font-weight:900;font-size:1.15rem;color:#fff;letter-spacing:-0.02em}
.dd-meta{display:flex;gap:14px;flex-wrap:wrap;margin-top:2px}
.dd-chip{font-family:'JetBrains Mono',monospace;font-size:0.68rem;color:rgba(255,255,255,0.72);display:flex;align-items:center;gap:4px}
.dd-chip b{color:rgba(255,255,255,0.38);font-weight:500}
.dd-topbar-right{display:flex;gap:8px;align-items:center}
.btn-ghost{background:rgba(255,255,255,0.12);border:1.5px solid rgba(255,255,255,0.25);color:#fff;border-radius:8px;padding:7px 15px;font-family:'Outfit',sans-serif;font-weight:700;font-size:0.82rem;cursor:pointer;transition:background .18s;white-space:nowrap}
.btn-ghost:hover{background:rgba(255,255,255,0.22)}

.dd-body{padding:22px 28px 48px}

/* CARDS */
.dd-cards{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:22px}
.dd-card{flex:1;min-width:110px;background:var(--card);border:1.5px solid var(--border);border-radius:13px;padding:13px 16px;box-shadow:var(--shadow-sm);transition:transform .18s,box-shadow .18s;animation:fadeUp .4s ease both}
.dd-card:hover{transform:translateY(-2px);box-shadow:var(--shadow)}
.dd-card-icon{font-size:1.1rem;margin-bottom:4px}
.dd-card-label{font-family:'JetBrains Mono',monospace;font-size:0.59rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:3px}
.dd-card-value{font-family:'JetBrains Mono',monospace;font-size:1.15rem;font-weight:800}

/* TABLE WRAPPER */
.dd-wrap{background:var(--card);border:1px solid var(--border);border-radius:14px;overflow:hidden;box-shadow:var(--shadow);animation:fadeUp .42s ease .06s both}
.dd-tbar{background:var(--row-a);border-bottom:1px solid var(--border);padding:13px 20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px}
.dd-tbar-title{font-weight:800;font-size:0.9rem;color:var(--accent);display:flex;align-items:center;gap:8px}
.dd-scroll{overflow-x:auto}

/* ADD ROW BAR */
.add-row-bar{padding:10px 20px;background:var(--row-a);border-top:1px solid var(--border);display:flex;align-items:center;gap:10px}
.btn-add-row{background:linear-gradient(135deg,#4f46e5,#818cf8);color:#fff;border:none;border-radius:8px;padding:7px 18px;font-family:'Outfit',sans-serif;font-weight:700;font-size:0.82rem;cursor:pointer;display:flex;align-items:center;gap:6px;transition:opacity .15s,transform .15s}
.btn-add-row:hover{opacity:.88;transform:translateY(-1px)}

/* TABLE */
.dd-table{width:100%;border-collapse:collapse;font-size:0.82rem;min-width:1620px}
.dd-table thead tr{background:var(--header-bg)}
.dd-table th{padding:10px 9px;font-family:'JetBrains Mono',monospace;font-size:0.63rem;font-weight:700;color:var(--header-fg);text-transform:uppercase;letter-spacing:.05em;border-right:1px solid rgba(255,255,255,0.09);text-align:center;white-space:nowrap;position:sticky;top:0;z-index:2;background:var(--header-bg)}
.dd-table th.tl{text-align:left}
.dd-table th:last-child{border-right:none}
.dd-table td{padding:7px 9px;border-bottom:1px solid var(--border);border-right:1px solid var(--border);vertical-align:middle;text-align:center}
.dd-table td.tl{text-align:left}
.dd-table td:last-child{border-right:none}
.dd-table tbody tr:nth-child(odd) td{background:var(--row-a)}
.dd-table tbody tr:nth-child(even) td{background:var(--row-b)}
.dd-table tbody tr{transition:background .12s;animation:rowIn .3s ease both}
.dd-table tbody tr:hover td{background:var(--row-hover) !important}

/* TOTAL ROW */
.dd-table tbody tr.row-total td{background:var(--total-bg) !important;border-top:2px solid #fbbf24;border-bottom:2px solid #fbbf24;font-family:'JetBrains Mono',monospace;font-weight:800;font-size:0.78rem;color:#92400e}
.dd-dark .dd-table tbody tr.row-total td{color:#fbbf24;border-color:#78350f}

/* NEW ROW */
.dd-table tbody tr.row-new td{background:var(--new-bg) !important}
.dd-dark .dd-table tbody tr.row-new td{background:#052e16 !important}
.dd-table tbody tr.row-new:hover td{background:#dcfce7 !important}
.dd-dark .dd-table tbody tr.row-new:hover td{background:#064e3b !important}

/* CELL HELPERS */
.c-mono{font-family:'JetBrains Mono',monospace;font-size:0.79rem;font-weight:500}
.c-dash{color:var(--muted);font-size:0.72rem}
.c-sr{font-family:'JetBrains Mono',monospace;font-size:0.72rem;font-weight:800;color:var(--accent)}
.c-file{font-weight:700;font-size:0.8rem;color:var(--accent)}
.c-name{font-weight:600;font-size:0.82rem;min-width:110px}
.c-loc{font-family:'JetBrains Mono',monospace;font-size:0.72rem;font-weight:700;color:#0891b2}
.dd-dark .c-loc{color:#38bdf8}

/* DISPATCH BADGE */
.disp-cell{display:inline-flex;align-items:center;gap:5px;justify-content:center}
.disp-no-box{font-family:'JetBrains Mono',monospace;font-weight:800;font-size:0.82rem;color:var(--text);min-width:18px;text-align:center}
.disp-type-badge{display:inline-block;padding:2px 7px;border-radius:5px;font-family:'JetBrains Mono',monospace;font-size:0.7rem;font-weight:700}
.dt-D1{background:#ede9fe;color:#5b21b6}.dt-D2{background:#dbeafe;color:#1d4ed8}
.dt-D3{background:#fef3c7;color:#92400e}.dt-D4{background:#dcfce7;color:#15803d}
.dt-D5{background:#ccfbf1;color:#0f766e}.dt-D6{background:#e0f2fe;color:#0369a1}
.dt-D7{background:#f1f5f9;color:#475569}
.dd-dark .dt-D1{background:#2e1065;color:#c4b5fd}.dd-dark .dt-D2{background:#1e3a5f;color:#60a5fa}
.dd-dark .dt-D3{background:#451a03;color:#fbbf24}.dd-dark .dt-D4{background:#14532d;color:#4ade80}
.dd-dark .dt-D5{background:#042f2e;color:#5eead4}.dd-dark .dt-D6{background:#0c4a6e;color:#38bdf8}
.dd-dark .dt-D7{background:#1e293b;color:#94a3b8}

/* INPUTS */
.inp{border:none;border-bottom:1.5px solid var(--border);background:transparent;color:var(--text);font-family:'JetBrains Mono',monospace;font-size:0.78rem;text-align:center;outline:none;padding:2px 3px;transition:border-color .15s}
.inp:focus{border-bottom-color:var(--accent)}
.inp.tl{text-align:left}
.inp-date{width:118px}.inp-sm{width:52px}.inp-md{width:78px}.inp-lg{width:125px}.inp-xl{width:150px}.inp-time{width:86px}
.inp-no{width:30px;border:none;border-bottom:1.5px solid var(--border);background:transparent;color:var(--text);font-family:'JetBrains Mono',monospace;font-size:0.82rem;font-weight:800;text-align:center;outline:none;padding:1px 2px;transition:border-color .15s}
.inp-no:focus{border-bottom-color:var(--accent)}

/* BUTTONS */
.btn-act{width:29px;height:29px;border-radius:7px;border:none;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:0.85rem;transition:transform .14s,box-shadow .14s}
.btn-act:hover{transform:scale(1.13)}
.btn-act:disabled{opacity:.45;cursor:not-allowed;transform:none}
.btn-del{background:linear-gradient(135deg,#dc2626,#ef4444);box-shadow:0 2px 8px #ef444450}
.btn-save{background:linear-gradient(135deg,#15803d,#22c55e);box-shadow:0 2px 8px #22c55e50}

/* LOADER */
.dd-loader{min-height:72vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px}
.dd-spinner{width:42px;height:42px;border:4px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin .85s linear infinite}
.dd-loader-txt{font-family:'JetBrains Mono',monospace;font-size:0.79rem;color:var(--muted);letter-spacing:.08em;animation:pulse 1.5s ease infinite}
.dd-spinner-sm{width:14px;height:14px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin .65s linear infinite;display:inline-block}

/* ERROR */
.dd-err{min-height:65vh;display:flex;align-items:center;justify-content:center}
.dd-err-card{background:var(--card);border:1px solid #ef444433;border-radius:16px;padding:38px 54px;text-align:center;max-width:400px;box-shadow:var(--shadow)}

/* TOAST */
.dd-toast-wrap{position:fixed;top:16px;right:16px;z-index:9999;display:flex;flex-direction:column;gap:8px}
.dd-toast{padding:12px 20px;border-radius:10px;color:#fff;font-weight:600;font-size:0.85rem;box-shadow:0 8px 24px rgba(0,0,0,0.22);animation:slide .3s ease;min-width:215px}

/* SECTION LABEL */
.sec-label{font-family:'JetBrains Mono',monospace;font-size:0.6rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:10px;display:flex;align-items:center;gap:8px}
.sec-label::after{content:'';flex:1;height:1px;background:var(--border)}

@media(max-width:768px){.dd-body{padding:14px}.dd-topbar{padding:13px 16px}.dd-title{font-size:1rem}}
`;

// ── Sub-components ────────────────────────────────────────────────────────────
const Toasts = ({ items }) => (
    <div className="dd-toast-wrap">
        {items.map(t => (
            <div key={t.id} className="dd-toast"
                style={{ background: t.type === "success" ? "#16a34a" : t.type === "error" ? "#dc2626" : "#2563eb" }}>
                {t.message}
            </div>
        ))}
    </div>
);

const Card = ({ icon, label, value, color, delay = 0 }) => (
    <div className="dd-card" style={{ borderColor: color + "35", animationDelay: `${delay}ms` }}>
        <div className="dd-card-icon">{icon}</div>
        <div className="dd-card-label" style={{ color }}>{label}</div>
        <div className="dd-card-value" style={{ color }}>{value}</div>
    </div>
);

const DispBadge = ({ type }) => (
    <span className={`disp-type-badge dt-${type || "D1"}`}>{type || "—"}</span>
);

// ── Unified editable row — works for both existing (pre-filled) and new rows ──
const EditableRow = ({ row, srNo, file_name, customer_name, location, dispatch_type, isNew, onChange, onSave, onRemove }) => {
    const set = (k, v) => onChange(row._id, k, v);

    return (
        <tr className={isNew ? "row-new" : ""}>
            <td><span className="c-sr">{srNo}</span></td>

            <td>
                <span className="c-mono" style={{ color: "var(--muted)", fontSize: "0.71rem" }}>
                    {isNew ? "0" : row.ids}
                </span>
            </td>

            <td className="tl"><span className="c-file">{file_name}</span></td>
            <td className="tl c-name">{customer_name}</td>
            <td><span className="c-loc">{location}</span></td>

            {/* Distance KM */}
            <td>
                <input className="inp inp-sm" type="text" placeholder="KM"
                    value={row.distance_km} onChange={e => set("distance_km", e.target.value)} />
            </td>

            {/* Project Incharge — not in API */}
            <td><span className="c-mono" style={{ color: "var(--muted)" }}>—</span></td>

            {/* LR No */}
            <td>
                <input className="inp inp-xl" type="text" placeholder="LR No."
                    value={row.lrno} onChange={e => set("lrno", e.target.value)} />
            </td>

            {/* Transport Value */}
            <td>
                <input className="inp inp-md" type="number" placeholder="0"
                    value={row.transport_value} onChange={e => set("transport_value", e.target.value)}
                    style={{ textAlign: "right" }} />
            </td>

            {/* Dispatch Date */}
            <td>
                <input className="inp inp-date" type="date"
                    value={row.dispatch_date} onChange={e => set("dispatch_date", e.target.value)} />
            </td>

            {/* Bill No */}
            <td>
                <input className="inp inp-md" type="text" placeholder="Bill No"
                    value={row.bill_no} onChange={e => set("bill_no", e.target.value)} />
            </td>

            {/* Billing Amount */}
            <td>
                <input className="inp inp-md" type="number" placeholder="0"
                    value={row.billing_amount} onChange={e => set("billing_amount", e.target.value)}
                    style={{ textAlign: "right" }} />
            </td>

            {/* Actual Weight */}
            <td>
                <input className="inp inp-sm" type="number" placeholder="0"
                    value={row.actual_weight} onChange={e => set("actual_weight", e.target.value)}
                    style={{ textAlign: "right" }} />
            </td>

            {/* Transporter */}
            <td>
                <input className="inp inp-xl tl" type="text" placeholder="Transporter"
                    value={row.transporter} onChange={e => set("transporter", e.target.value)} />
            </td>

            {/* Vehicle No */}
            <td>
                <input className="inp inp-lg" type="text" placeholder="Vehicle No"
                    value={row.vehicle_number} onChange={e => set("vehicle_number", e.target.value)} />
            </td>

            {/* Dispatch No + Type badge */}
            <td>
                <div className="disp-cell">
                    <input className="inp-no" type="text"
                        value={row.dispatch_no} onChange={e => set("dispatch_no", e.target.value)} />
                    <DispBadge type={row.dispatch_type || dispatch_type} />
                </div>
            </td>

            {/* Dispatch Time */}
            <td>
                <input className="inp inp-time" type="text" placeholder="HH:MM AM"
                    value={row.dispatch_time} onChange={e => set("dispatch_time", e.target.value)} />
            </td>

            {/* Made By */}
            <td>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.75rem", fontWeight: 700, color: "var(--accent)" }}>
                    {row.made_by_name || "—"}
                </span>
            </td>

            {/* Save */}
            <td>
                <button className="btn-act btn-save" title="Save"
                    onClick={() => onSave(row._id)} disabled={row.saving}>
                    {row.saving ? <span className="dd-spinner-sm" /> : "💾"}
                </button>
            </td>

            {/* Remove — only for new rows */}
            <td>
                {isNew
                    ? <button className="btn-act btn-del" title="Remove row" onClick={() => onRemove(row._id)}>🗑️</button>
                    : <span className="c-mono" style={{ color: "var(--muted)" }}>—</span>
                }
            </td>
        </tr>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────
const DispatchDetails = () => {
    const [dispId,   setDispId]   = useState(getDispId());
    const [apiData,  setApiData]  = useState(null);
    const [loading,  setLoading]  = useState(true);
    const [error,    setError]    = useState("");
    const [theme,    setTheme]    = useState("light");
    const [toasts,   setToasts]   = useState([]);
    const [editRows, setEditRows] = useState([]);   // existing rows — editable, pre-filled
    const [newRows,  setNewRows]  = useState([]);   // freshly added rows

    const isDark = theme === "dark";

    const toast = useCallback((message, type = "info") => {
        const id = Date.now() + Math.random();
        setToasts(p => [...p, { id, message, type }]);
        setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
    }, []);

    const fetchData = useCallback(async (id) => {
        const rid = id || dispId;
        if (!rid) { setError("No disp_id in URL"); setLoading(false); return; }
        setLoading(true); setError("");
        try {
            const res  = await fetch(`${FILTER_API}?disp_id=${encodeURIComponent(rid)}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            if (json.status !== "success") throw new Error(json.message || "API error");
            setApiData(json);

            // ✅ Convert API rows → editable state (pre-fills all inputs)
            setEditRows((json.rows || []).map(apiRowToEditable));

            // Seed one blank new row
            const last   = (json.rows || []).slice(-1)[0];
            const nextNo = String(last?.dispatch_no_next || "");
            const nextTm = last?.dispatch_time ? toDisplayTime(last.dispatch_time) : "05:30 PM";
            setNewRows([makeEmptyRow(nextNo, nextTm, json.dispatch_type)]);

            toast(`Loaded ${json.total_rows} record(s)`, "success");
        } catch (e) {
            setError(e.message);
            toast(`Error: ${e.message}`, "error");
        } finally {
            setLoading(false);
        }
    }, [dispId, toast]);

    useEffect(() => {
        const el = document.createElement("style");
        el.textContent = CSS;
        document.head.appendChild(el);
        return () => document.head.removeChild(el);
    }, []);

    useEffect(() => { fetchData(dispId); }, []);

    // ── Change handlers ───────────────────────────────────────────────────────
    const handleEditChange = (rowId, key, value) =>
        setEditRows(p => p.map(r => r._id === rowId ? { ...r, [key]: value } : r));

    const handleNewChange = (rowId, key, value) =>
        setNewRows(p => p.map(r => r._id === rowId ? { ...r, [key]: value } : r));

    const addNewRow = () => {
        const last = newRows.slice(-1)[0];
        setNewRows(p => [...p, makeEmptyRow(
            last?.dispatch_no || "",
            last?.dispatch_time || "05:30 PM",
            apiData?.dispatch_type || ""
        )]);
    };

    const removeNewRow = (rowId) => {
        setNewRows(p => {
            const f = p.filter(r => r._id !== rowId);
            return f.length === 0
                ? [makeEmptyRow("", "05:30 PM", apiData?.dispatch_type || "")]
                : f;
        });
    };

    // ── Save (shared logic) ───────────────────────────────────────────────────
    const setSaving = (rowId, saving, isNew) => {
        if (isNew) setNewRows(p => p.map(r => r._id === rowId ? { ...r, saving } : r));
        else       setEditRows(p => p.map(r => r._id === rowId ? { ...r, saving } : r));
    };

    const doSave = async (row, isNew) => {
        const required = ["dispatch_date","lrno","transport_value","bill_no",
            "billing_amount","actual_weight","transporter","vehicle_number",
            "dispatch_no","dispatch_time","distance_km"];
        const missing = required.filter(k => !String(row[k] ?? "").trim());
        if (missing.length > 0) {
            toast(`Please fill: ${missing.join(", ")}`, "error");
            return;
        }

        setSaving(row._id, true, isNew);

        const payload = {
            file_id:         apiData.file_id || apiData.disp_id,
            ids:             isNew ? "0" : String(row.ids),
            disp_type:       row.dispatch_type || apiData.dispatch_type,
            disp_no:         row.dispatch_no,
            distance:        row.distance_km,
            lrno:            row.lrno,
            transport_value: row.transport_value,
            disp_date:       row.dispatch_date,
            bill_no:         row.bill_no,
            bill_amt:        row.billing_amount,
            act_weight:      row.actual_weight,
            transporter:     row.transporter,
            vehicle_no:      row.vehicle_number,
            disp_time:       row.dispatch_time,
            employee_id:     row.added_by || apiData.rows?.slice(-1)[0]?.added_by || "",
        };

        try {
            const res  = await fetch(SAVE_API, {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify(payload),
            });
            const json = await res.json();
            if (json.status === "success") {
                toast("Record saved successfully!", "success");
                if (isNew) setNewRows(p => p.filter(r => r._id !== row._id));
                fetchData(dispId);
            } else {
                throw new Error(json.message || "Save failed");
            }
        } catch (e) {
            toast(`Save error: ${e.message}`, "error");
            setSaving(row._id, false, isNew);
        }
    };

    const saveEditRow = (rowId) => {
        const row = editRows.find(r => r._id === rowId);
        if (row) doSave(row, false);
    };

    const saveNewRow = (rowId) => {
        const row = newRows.find(r => r._id === rowId);
        if (row) doSave(row, true);
    };

    // ── Loading / Error states ────────────────────────────────────────────────
    if (loading) return (
        <div className={`dd-root${isDark ? " dd-dark" : ""}`}>
            <style>{CSS}</style>
            <div className="dd-loader">
                <div className="dd-spinner" />
                <div className="dd-loader-txt">LOADING DISPATCH DETAILS…</div>
            </div>
        </div>
    );

    if (error || !apiData) return (
        <div className={`dd-root${isDark ? " dd-dark" : ""}`}>
            <style>{CSS}</style>
            <div className="dd-err">
                <div className="dd-err-card">
                    <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>⚠️</div>
                    <div style={{ fontWeight: 700, color: "#ef4444", marginBottom: 8 }}>Failed to load</div>
                    <div style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: 20 }}>{error || "No data"}</div>
                    <button onClick={() => fetchData(dispId)}
                        style={{ background: "#4f46e5", color: "#fff", border: "none", borderRadius: 8, padding: "9px 24px", fontWeight: 700, cursor: "pointer" }}>
                        Retry
                    </button>
                </div>
            </div>
        </div>
    );

    const { file_name, customer_name, location, dispatch_type, totals, rows = [] } = apiData;

    return (
        <div className={`dd-root${isDark ? " dd-dark" : ""}`}>
            <style>{CSS}</style>
            <Toasts items={toasts} />

            {/* TOPBAR */}
            <div className="dd-topbar">
                <div className="dd-topbar-left">
                    <button className="btn-ghost" onClick={() => window.history.back()}>← Back</button>
                    <div className="dd-icon">📦</div>
                    <div>
                        <div className="dd-title">Dispatch Details</div>
                        <div className="dd-meta">
                            {[["Disp", apiData.disp_id],["File", file_name],["Customer", customer_name],["Location", location],["Type", dispatch_type]].map(([k, v]) => (
                                <span key={k} className="dd-chip"><b>{k}:</b> {v}</span>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="dd-topbar-right">
                    <button className="btn-ghost" onClick={() => fetchData(dispId)}>↻ Refresh</button>
                    <button className="btn-ghost" onClick={() => setTheme(t => t === "light" ? "dark" : "light")}>
                        {isDark ? "☀️" : "🌙"}
                    </button>
                </div>
            </div>

            {/* BODY */}
            <div className="dd-body">

                {/* SUMMARY CARDS */}
                <div className="sec-label">Summary</div>
                <div className="dd-cards">
                    <Card icon="📄" label="File No"        value={file_name}                     color="#4f46e5" delay={0}   />
                    <Card icon="🏢" label="Customer"       value={customer_name}                 color="#0891b2" delay={50}  />
                    <Card icon="📍" label="Location"       value={location}                      color="#7c3aed" delay={100} />
                    <Card icon="🚛" label="Transport"      value={`₹ ${totals.transport_value}`} color="#c2410c" delay={150} />
                    <Card icon="💰" label="Billing"        value={`₹ ${totals.billing_amount}`}  color="#15803d" delay={200} />
                    <Card icon="⚖️" label="Actual Wt (KG)" value={`${totals.actual_weight} kg`}  color="#1d4ed8" delay={250} />
                    <Card icon="📋" label="Total Rows"     value={apiData.total_rows}            color="#64748b" delay={300} />
                </div>

                {/* TABLE */}
                <div className="sec-label">Dispatch Records</div>
                <div className="dd-wrap">
                    <div className="dd-tbar">
                        <div className="dd-tbar-title">
                            <span>🚚</span>
                            Dispatch Log — {file_name}
                            <DispBadge type={dispatch_type} />
                        </div>
                        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.71rem", color: "var(--muted)" }}>
                            {rows.length} record{rows.length !== 1 ? "s" : ""}
                        </span>
                    </div>

                    <div className="dd-scroll">
                        <table className="dd-table">
                            <thead>
                                <tr>
                                    <th>Sr<br />No.</th>
                                    <th>AUTO<br />ID</th>
                                    <th className="tl">File No</th>
                                    <th className="tl">Client Name</th>
                                    <th>Location</th>
                                    <th>Distance<br />KM</th>
                                    <th>Project<br />Incharge</th>
                                    <th>L.R. No.</th>
                                    <th>Transport<br />Value</th>
                                    <th>Dispatch Date</th>
                                    <th>Bill No</th>
                                    <th>Billing<br />Amount</th>
                                    <th>Actual<br />Wt.(KG)</th>
                                    <th>Transporter</th>
                                    <th>Vehicle No</th>
                                    <th>Dispatch No</th>
                                    <th>Dispatch<br />Time</th>
                                    <th>Dispatch<br />Made By</th>
                                    <th>Save</th>
                                    <th>Remove</th>
                                </tr>
                            </thead>
                            <tbody>

                                {/* ✅ EXISTING ROWS — editable, pre-filled from API */}
                                {editRows.map((row, i) => (
                                    <EditableRow
                                        key={row._id}
                                        row={row}
                                        srNo={row.sr_no || i + 1}
                                        file_name={file_name}
                                        customer_name={customer_name}
                                        location={location}
                                        dispatch_type={dispatch_type}
                                        isNew={false}
                                        onChange={handleEditChange}
                                        onSave={saveEditRow}
                                        onRemove={() => {}}
                                    />
                                ))}

                                {/* TOTAL ROW */}
                                <tr className="row-total">
                                    <td colSpan={2} style={{ textAlign: "left", paddingLeft: 14, letterSpacing: "0.05em" }}>Total</td>
                                    <td /><td /><td /><td /><td /><td />
                                    <td>₹ {totals.transport_value}</td>
                                    <td /><td />
                                    <td>₹ {totals.billing_amount}</td>
                                    <td>{totals.actual_weight}</td>
                                    <td /><td /><td /><td /><td /><td /><td />
                                </tr>

                                {/* ✅ NEW EDITABLE ROWS */}
                                {newRows.map((row, idx) => (
                                    <EditableRow
                                        key={row._id}
                                        row={row}
                                        srNo={rows.length + idx + 1}
                                        file_name={file_name}
                                        customer_name={customer_name}
                                        location={location}
                                        dispatch_type={dispatch_type}
                                        isNew={true}
                                        onChange={handleNewChange}
                                        onSave={saveNewRow}
                                        onRemove={removeNewRow}
                                    />
                                ))}

                            </tbody>
                        </table>
                    </div>

                    {/* ADD ROW TOOLBAR */}
                    <div className="add-row-bar">
                        <button className="btn-add-row" onClick={addNewRow}>
                            ➕ Add Another Row
                        </button>
                        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "var(--muted)" }}>
                            {newRows.length} unsaved row{newRows.length !== 1 ? "s" : ""} · Click 💾 on each row to save
                        </span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DispatchDetails;