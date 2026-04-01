import React, { useEffect, useState, useCallback, useRef } from "react";

const PERFORM_API = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PerformDispatchApi.php";
const SAVE_API    = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/SavePerformDispatchApi.php";

const DISPATCH_TYPES = ["All", "D1", "D2", "D3", "D4", "D5", "D6", "D7"];

// ── Parse route params ────────────────────────────────────────────────────────
const getParams = () => {
    const hash = window.location.hash || "";
    const m = hash.match(/\/perform-dispatch\/(\d+)\/([^/]+)/);
    if (m) return { fileId: m[1], type: m[2] };
    const qs = new URLSearchParams(window.location.search);
    return {
        fileId: qs.get("fileId") || "",
        type:   qs.get("type")   || "All",
    };
};

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg: #f4f6ff; --card: #ffffff; --border: #e0e7ff; --text: #0f172a;
  --muted: #64748b; --accent: #4f46e5; --accent2: #e8560a; --accent3: #0891b2;
  --green: #16a34a; --yellow-bg: #fefce8; --yellow-border: #fde047;
  --header-bg: #eef2ff; --row-hover: #f0f4ff; --shadow: 0 4px 24px rgba(79,70,229,0.08);
}
.pd-dark {
  --bg: #090e1a; --card: #0f1629; --border: #1e3060; --text: #e2e8f0;
  --muted: #64748b; --accent: #818cf8; --accent2: #fb923c; --accent3: #38bdf8;
  --green: #4ade80; --yellow-bg: #1a1500; --yellow-border: #854d0e;
  --header-bg: #131e38; --row-hover: #131e38; --shadow: 0 4px 24px rgba(0,0,0,0.4);
}

body { background:var(--bg); font-family:'Outfit',sans-serif; color:var(--text); }

@keyframes spin    { to { transform:rotate(360deg); } }
@keyframes fadeUp  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
@keyframes slideIn { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }
@keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.5} }

.pd-root { min-height:100vh; background:var(--bg); color:var(--text); font-family:'Outfit',sans-serif; }

/* TOP BAR */
.pd-topbar {
  background:linear-gradient(135deg,#1e1b4b 0%,#312e81 40%,#4f46e5 80%,#6366f1 100%);
  padding:18px 28px; display:flex; align-items:center; justify-content:space-between;
  flex-wrap:wrap; gap:12px; box-shadow:0 4px 24px rgba(79,70,229,0.3);
  position:sticky; top:0; z-index:100;
}
.pd-dark .pd-topbar { background:linear-gradient(135deg,#0d1117 0%,#1a1f2e 60%,#1e293b 100%); }
.pd-topbar-left  { display:flex; align-items:center; gap:14px; }
.pd-topbar-icon  { width:42px; height:42px; border-radius:10px; background:rgba(255,255,255,0.15); display:flex; align-items:center; justify-content:center; font-size:1.3rem; flex-shrink:0; }
.pd-topbar-title { font-family:'Outfit',sans-serif; font-weight:900; font-size:1.2rem; color:#fff; letter-spacing:-0.02em; }
.pd-topbar-meta  { display:flex; gap:14px; flex-wrap:wrap; margin-top:3px; }
.pd-chip         { font-family:'JetBrains Mono',monospace; font-size:0.7rem; color:rgba(255,255,255,0.75); display:flex; align-items:center; gap:4px; }
.pd-chip strong  { color:rgba(255,255,255,0.45); font-weight:500; }
.pd-topbar-actions { display:flex; gap:8px; align-items:center; }

.btn-ghost       { background:rgba(255,255,255,0.12); border:1.5px solid rgba(255,255,255,0.25); color:#fff; border-radius:8px; padding:7px 16px; font-family:'Outfit',sans-serif; font-weight:700; font-size:0.82rem; cursor:pointer; transition:background 0.18s; white-space:nowrap; }
.btn-ghost:hover { background:rgba(255,255,255,0.22); }

/* BODY */
.pd-body { padding:22px 28px 40px; }

/* CONTROLS */
.pd-controls       { display:flex; align-items:center; gap:14px; margin-bottom:20px; flex-wrap:wrap; }
.pd-controls-left  { display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
.pd-controls-right { margin-left:auto; display:flex; gap:8px; }
.pd-label          { font-size:0.78rem; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:0.06em; }

.pd-select       { padding:8px 14px; border-radius:8px; border:1.5px solid var(--border); background:var(--card); color:var(--text); font-family:'Outfit',sans-serif; font-weight:600; font-size:0.88rem; cursor:pointer; outline:none; min-width:120px; transition:border-color 0.18s; }
.pd-select:focus { border-color:var(--accent); }

.btn-export       { background:linear-gradient(135deg,#16a34a,#22c55e); border:none; color:#fff; border-radius:8px; padding:8px 18px; font-family:'Outfit',sans-serif; font-weight:700; font-size:0.84rem; cursor:pointer; box-shadow:0 3px 12px rgba(22,163,74,0.3); transition:transform 0.15s,box-shadow 0.15s; white-space:nowrap; }
.btn-export:hover { transform:translateY(-1px); box-shadow:0 6px 18px rgba(22,163,74,0.4); }

/* WARNING */
.pd-warning      { background:var(--yellow-bg); border:1.5px solid var(--yellow-border); border-radius:10px; padding:10px 18px; margin-bottom:16px; font-size:0.84rem; font-weight:600; color:#854d0e; display:flex; align-items:center; gap:8px; }
.pd-dark .pd-warning { color:#fbbf24; }

/* INFO BANNER */
.pd-info-banner  { border-radius:10px; padding:10px 18px; margin-bottom:18px; font-size:0.82rem; display:flex; align-items:flex-start; gap:10px; }

/* TABLE WRAPPER */
.pd-table-wrap    { background:var(--card); border:1px solid var(--border); border-radius:14px; overflow:hidden; box-shadow:var(--shadow); animation:fadeUp 0.4s ease both; }
.pd-table-head-bar{ background:var(--header-bg); border-bottom:1px solid var(--border); padding:12px 20px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; }
.pd-table-head-title { font-family:'Outfit',sans-serif; font-weight:800; font-size:0.9rem; color:var(--accent); letter-spacing:0.03em; }
.pd-search        { padding:6px 14px; border-radius:8px; border:1.5px solid var(--border); background:var(--card); color:var(--text); font-family:'Outfit',sans-serif; font-size:0.83rem; outline:none; width:220px; transition:border-color 0.18s; }
.pd-search:focus  { border-color:var(--accent); }
.pd-scroll        { overflow-x:auto; }

/* TABLE */
.pd-table         { width:100%; border-collapse:collapse; font-size:0.83rem; min-width:1650px; }
.pd-table thead tr{ background:var(--header-bg); }
.pd-table th      { padding:10px; font-family:'JetBrains Mono',monospace; font-size:0.68rem; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:0.05em; border-bottom:2px solid var(--border); border-right:1px solid var(--border); text-align:center; white-space:nowrap; position:sticky; top:0; background:var(--header-bg); z-index:2; }
.pd-table th.left { text-align:left; }
.pd-table td      { padding:8px 10px; border-bottom:1px solid var(--border); border-right:1px solid var(--border); vertical-align:middle; text-align:center; }
.pd-table td.left { text-align:left; }
.pd-table td:last-child, .pd-table th:last-child { border-right:none; }
.pd-table tbody tr            { transition:background 0.12s; }
.pd-table tbody tr:hover      { background:var(--row-hover) !important; }
.pd-table tbody tr.zero-stock { background:var(--yellow-bg); }
.pd-table tbody tr.zero-stock td { border-bottom-color:var(--yellow-border); }
.pd-dark .pd-table tbody tr.zero-stock { background:#1c1500; }
.pd-table tbody tr.saving-row { opacity:0.55; pointer-events:none; }
.pd-table tbody tr.saved-row td { background:rgba(22,163,74,0.05) !important; }

/* CELL TYPES */
.cell-sr   { font-family:'JetBrains Mono',monospace; font-size:0.72rem; font-weight:700; color:var(--accent); }
.cell-name { font-weight:600; color:var(--text); text-align:left; min-width:160px; max-width:220px; }
.cell-erp  { font-size:0.78rem; color:var(--muted); text-align:left; min-width:140px; }
.cell-mono { font-family:'JetBrains Mono',monospace; font-size:0.8rem; font-weight:500; }
.cell-dash { color:var(--muted); font-size:0.75rem; }

/* BADGES */
.badge-stock  { display:inline-block; padding:2px 10px; border-radius:20px; font-family:'JetBrains Mono',monospace; font-size:0.74rem; font-weight:700; white-space:nowrap; }
.badge-green  { background:#dcfce7; color:#15803d; }
.badge-red    { background:#fee2e2; color:#b91c1c; }
.badge-grey   { background:#f1f5f9; color:#475569; }
.badge-blue   { background:#e0f2fe; color:#0369a1; }
.badge-orange { background:#fff7ed; color:#c2410c; }
.pd-dark .badge-green  { background:#14532d40; color:#4ade80; }
.pd-dark .badge-red    { background:#450a0a40; color:#f87171; }
.pd-dark .badge-grey   { background:#1e293b;   color:#94a3b8; }
.pd-dark .badge-blue   { background:#0c4a6e40; color:#38bdf8; }
.pd-dark .badge-orange { background:#431407;   color:#fb923c; }

/* EDITABLE INPUTS */
.cell-input       { border:none; border-bottom:1.5px solid var(--border); background:transparent; color:var(--text); font-family:'JetBrains Mono',monospace; font-size:0.82rem; text-align:center; outline:none; padding:2px 4px; transition:border-color 0.15s; }
.cell-input:focus { border-bottom-color:var(--accent); }
.cell-input:disabled { opacity:0.45; cursor:not-allowed; }

/* sub-label under purple TH */
.col-sub { font-size:0.58rem; display:block; margin-top:2px; font-weight:400; opacity:0.82; letter-spacing:0.03em; }

/* ACTION */
.cell-checkbox        { width:18px; height:18px; accent-color:var(--accent2); cursor:pointer; transition:transform 0.15s; }
.cell-checkbox:hover  { transform:scale(1.18); }
.cell-checkbox:disabled { opacity:0.4; cursor:not-allowed; }
.save-spinner         { display:inline-block; width:16px; height:16px; border:2px solid var(--border); border-top-color:var(--accent2); border-radius:50%; animation:spin 0.7s linear infinite; }
.row-save-ok          { font-size:0.7rem; font-weight:700; color:#16a34a; font-family:'JetBrains Mono',monospace; }
.row-save-err         { font-size:0.7rem; font-weight:700; color:#dc2626; font-family:'JetBrains Mono',monospace; cursor:pointer; }

/* STATS */
.pd-stats      { display:flex; gap:12px; margin-bottom:18px; flex-wrap:wrap; }
.pd-stat-card  { flex:1; min-width:100px; background:var(--card); border:1.5px solid var(--border); border-radius:12px; padding:12px 16px; box-shadow:var(--shadow); transition:transform 0.18s; animation:fadeUp 0.4s ease both; }
.pd-stat-card:hover { transform:translateY(-2px); }
.pd-stat-icon  { font-size:1.2rem; margin-bottom:4px; }
.pd-stat-label { font-family:'JetBrains Mono',monospace; font-size:0.62rem; font-weight:700; letter-spacing:0.07em; text-transform:uppercase; margin-bottom:2px; }
.pd-stat-value { font-family:'JetBrains Mono',monospace; font-size:1.25rem; font-weight:800; }

/* LOADER */
.pd-loader      { min-height:60vh; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:18px; }
.pd-spinner     { width:44px; height:44px; border:4px solid var(--border); border-top-color:var(--accent); border-radius:50%; animation:spin 0.85s linear infinite; }
.pd-loader-text { font-family:'JetBrains Mono',monospace; font-size:0.8rem; color:var(--muted); letter-spacing:0.08em; animation:pulse 1.5s ease infinite; }

/* ERROR */
.pd-error      { min-height:60vh; display:flex; align-items:center; justify-content:center; }
.pd-error-card { background:var(--card); border:1px solid #ef444433; border-radius:16px; padding:36px 52px; text-align:center; max-width:420px; box-shadow:var(--shadow); }

/* EMPTY */
.pd-empty      { text-align:center; padding:64px 20px; color:var(--muted); }
.pd-empty-icon { font-size:3rem; margin-bottom:12px; }

/* TOAST */
.pd-toast-wrap { position:fixed; top:16px; right:16px; z-index:9999; display:flex; flex-direction:column; gap:8px; }
.pd-toast      { padding:12px 20px; border-radius:10px; color:#fff; font-weight:600; font-size:0.86rem; box-shadow:0 8px 24px rgba(0,0,0,0.2); animation:slideIn 0.3s ease; min-width:220px; }

@media (max-width:768px) {
  .pd-body { padding:16px; }
  .pd-topbar { padding:14px 16px; }
  .pd-topbar-title { font-size:1rem; }
  .pd-controls { flex-direction:column; align-items:flex-start; }
  .pd-controls-right { margin-left:0; }
}
`;

// ── Small helpers ─────────────────────────────────────────────────────────────
const Toasts = ({ items }) => (
    <div className="pd-toast-wrap">
        {items.map(t => (
            <div key={t.id} className="pd-toast"
                style={{ background: t.type === "success" ? "#16a34a" : t.type === "error" ? "#dc2626" : "#2563eb" }}>
                {t.message}
            </div>
        ))}
    </div>
);

const StatCard = ({ label, value, color, icon, delay = 0 }) => (
    <div className="pd-stat-card" style={{ borderColor: color + "30", animationDelay: `${delay}ms` }}>
        <div className="pd-stat-icon">{icon}</div>
        <div className="pd-stat-label" style={{ color }}>{label}</div>
        <div className="pd-stat-value" style={{ color }}>{value}</div>
    </div>
);

const D = ({ v }) => (v === "" || v == null) ? <span className="cell-dash">—</span> : <>{v}</>;

const StockBadge = ({ value, type = "before" }) => {
    const n = Number(value || 0);
    let cls = "badge-grey";
    if (n > 0) cls = type === "after" ? "badge-blue" : "badge-green";
    if (n < 0) cls = "badge-red";
    return <span className={`badge-stock ${cls}`}>{n.toLocaleString()}</span>;
};

const BalBadge = ({ value }) => {
    const n   = Number(value || 0);
    const cls = n > 0 ? "badge-orange" : n === 0 ? "badge-green" : "badge-red";
    return <span className={`badge-stock ${cls}`}>{n.toLocaleString()}</span>;
};

const RfdBadge = ({ value }) => {
    const n = Number(value || 0);
    return <span className={`badge-stock ${n > 0 ? "badge-blue" : "badge-grey"}`}>{n.toLocaleString()}</span>;
};

// ── Main Component ────────────────────────────────────────────────────────────
const PerformDispatch = () => {
    const { fileId: initFileId, type: initType } = getParams();

    const [fileId,       setFileId]       = useState(initFileId);
    const [selectedType, setSelectedType] = useState(initType || "All");
    const [data,         setData]         = useState([]);
    const [meta,         setMeta]         = useState({});
    const [loading,      setLoading]      = useState(true);
    const [error,        setError]        = useState("");
    const [theme,        setTheme]        = useState("light");
    const [search,       setSearch]       = useState("");
    const [toasts,       setToasts]       = useState([]);

    /*
     * ─── FIELD MAPPING (critical — matches PHP SavePerformDispatchApi.php) ───
     *
     *  React field   │ POST key    │ DB column        │ Notes
     *  ──────────────┼─────────────┼──────────────────┼─────────────────────────────────
     *  lotNo         │ LotNO       │ lot_no           │ Text — the lot number
     *  lotNo         │ plan        │ plan             │ Same value as LotNO (original JS: id = name1.value)
     *  dateHead      │ DateHead    │ date             │ Calendar date for the dispatch column header
     *  sendQty       │ date        │ send_qty         │ ⚠️ NUMERIC qty — PHP param is confusingly named 'date'
     *  bundle        │ bund1       │ bundles          │ Number of bundles
     */
    const [edits,     setEdits]     = useState({}); // { [rowIndex]: { lotNo, dateHead, sendQty, bundle } }
    const [saveState, setSaveState] = useState({}); // { [rowIndex]: { saving, result, message } }

    const isDark   = theme === "dark";
    const tableRef = useRef();

    // ── Toast ──
    const showToast = useCallback((message, type = "info") => {
        const id = Date.now() + Math.random();
        setToasts(p => [...p, { id, message, type }]);
        setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4500);
    }, []);

    // ── Fetch data ──
    const fetchData = useCallback(async (fid, typ) => {
        const resolvedFid = fid || fileId;
        const resolvedTyp = typ !== undefined ? typ : selectedType;
        if (!resolvedFid) { setError("No fileId provided"); setLoading(false); return; }
        setLoading(true); setError("");
        try {
            const url  = `${PERFORM_API}?fileId=${resolvedFid}&type=${encodeURIComponent(resolvedTyp)}`;
            const res  = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            if (json.status !== "success") throw new Error(json.message || "API error");

            setMeta({
                fileid:      json.fileid      || resolvedFid,
                type:        json.type        || resolvedTyp,
                savingType:  json.saving_type || "ALL",
                hasTypeData: json.has_type_data,
                totalItems:  json.total_items,
                despatchLot: json.despatch_lot,
                fileName:    json.file_name   || "",
            });

            const items = json.items || [];
            setData(items);

            const initEdits = {};
            const initSave  = {};
            items.forEach((_, i) => {
                initEdits[i] = { lotNo: "", dateHead: "", sendQty: "", bundle: "" };
                initSave[i]  = { saving: false, result: null, message: "" };
            });
            setEdits(initEdits);
            setSaveState(initSave);
            showToast(`Loaded ${items.length} items`, "success");
        } catch (e) {
            setError(e.message);
            showToast(`Error: ${e.message}`, "error");
        } finally {
            setLoading(false);
        }
    }, [fileId, selectedType, showToast]);

    useEffect(() => {
        const styleEl = document.createElement("style");
        styleEl.textContent = CSS;
        document.head.appendChild(styleEl);
        return () => document.head.removeChild(styleEl);
    }, []);

    useEffect(() => {
        fetchData(initFileId, initType);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleTypeChange = (e) => {
        const newType = e.target.value;
        setSelectedType(newType);
        fetchData(fileId, newType);
    };

    // ── Edit helpers ──
    const setEdit  = (i, key, val) => setEdits(p => ({ ...p, [i]: { ...(p[i] || {}), [key]: val } }));
    const getEditV = (editsSnap, i, key) => editsSnap[i]?.[key] ?? "";

    // ── SAVE — triggered by checkbox click ──
    const handleCheckbox = useCallback((rowIndex, row) => {
        // Use functional form so we always read the freshest edits
        setSaveState(prevSave => {
            // Don't double-trigger if already saving
            if (prevSave[rowIndex]?.saving) return prevSave;

            setEdits(currentEdits => {
                const lotNo    = (getEditV(currentEdits, rowIndex, "lotNo")    || "").trim();
                const dateHead = (getEditV(currentEdits, rowIndex, "dateHead") || "").trim();
                const sendQty  = (getEditV(currentEdits, rowIndex, "sendQty")  || "").trim();
                const bundle   = (getEditV(currentEdits, rowIndex, "bundle")   || "").trim();

                // ── Validation (mirrors original JS) ──
                if (!lotNo || !sendQty || !bundle) {
                    showToast("⚠️  Please fill Lot No., Send Qty and Bundles before saving.", "error");
                    return currentEdits; // no change to edits
                }
                if (isNaN(Number(sendQty)) || Number(sendQty) <= 0) {
                    showToast("⚠️  Send Qty must be a positive number.", "error");
                    return currentEdits;
                }

                // Qty check mirrors: if(Number(date2)<=Number(bal) || Number(qty1)<=Number(bal))
                const balanceToSent = Number(row.balance_to_sent || 0);
                const qty           = Number(row.qty             || 0);
                const sendQtyNum    = Number(sendQty);

                if (!(sendQtyNum <= balanceToSent || qty <= balanceToSent)) {
                    showToast("⚠️  Send Qty exceeds Balance To Sent — please check the qty.", "error");
                    return currentEdits;
                }

                // ── Build data string: materialName~mm~hl~wt~qty ──
                const dataStr = [
                    row.material_name    || "",
                    row.width_mm         || "",
                    row.height_length_mm || "",
                    row.weight           || "",
                    row.qty              || "",
                ].join("~");

                // Mark saving
                setSaveState(p => ({ ...p, [rowIndex]: { saving: true, result: null, message: "" } }));

                // ── POST ──
                (async () => {
                    try {
                        /*
                         * POST field → PHP variable → DB column:
                         *   data        → $data         → parsed into materialName, mm, hl, wt, qty
                         *   total       → $total        → (passed through, not stored directly)
                         *   bal         → $bal          → balance_sent
                         *   fileid      → $fileid       → file_id
                         *   plan        → $plan         → plan  (= lot number string)
                         *   date        → $date         → send_qty  ← ⚠️ NUMERIC, not a date!
                         *   bund1       → $bund1        → bundles
                         *   LotNO       → $LotNO        → lot_no
                         *   DateHead    → $DateHead     → date  ← the actual calendar date string
                         *   columnID    → $columnID     → column_id
                         *   savingType  → $savingType   → type
                         *   mm          → $mm           → width
                         *   hl          → $hl           → hl
                         */
                        const body = new URLSearchParams({
                            data:       dataStr,
                            total:      String(row.total_sent        ?? "0"),
                            bal:        String(row.balance_to_sent   ?? "0"),
                            fileid:     String(meta.fileid           || fileId),
                            plan:       lotNo,      // plan = lot number (same value as LotNO)
                            date:       sendQty,    // ⚠️ send_qty column (numeric qty, NOT a date!)
                            bund1:      bundle,
                            LotNO:      lotNo,      // lot_no column
                            DateHead:   dateHead,   // date column in dispatch_b (actual calendar date)
                            columnID:   "1",
                            savingType: String(meta.savingType || "ALL"),
                            mm:         String(row.width_mm         || ""),
                            hl:         String(row.height_length_mm || ""),
                        });

                        const res = await fetch(SAVE_API, { method: "POST", body });
                        if (!res.ok) throw new Error(`HTTP ${res.status}`);

                        const text = await res.text();
                        let json;
                        try { json = JSON.parse(text); }
                        catch { throw new Error(`Invalid JSON: ${text.slice(0, 150)}`); }

                        if (json.status === "success") {
                            setSaveState(p => ({
                                ...p,
                                [rowIndex]: {
                                    saving:  false,
                                    result:  "ok",
                                    message: `Dispatch ID: ${json.dispatch_id || ""}`,
                                }
                            }));
                            showToast(
                                `✅ Saved — ${row.material_name || "Item"} | Dispatch ID: ${json.dispatch_id || ""}${json.is_new ? " (new)" : " (updated)"}`,
                                "success"
                            );
                            // Refresh to update totals / balance
                            setTimeout(() => fetchData(fileId, selectedType), 1500);
                        } else {
                            throw new Error(json.message || "Save failed");
                        }
                    } catch (e) {
                        setSaveState(p => ({
                            ...p,
                            [rowIndex]: { saving: false, result: "error", message: e.message }
                        }));
                        showToast(`❌ Save failed: ${e.message}`, "error");
                    }
                })();

                return currentEdits; // edits unchanged
            });

            return prevSave; // interim — real update happens inside async
        });
    }, [meta, fileId, selectedType, showToast, fetchData]);

    // ── Search filter ──
    const filtered = search.trim()
        ? data.filter(r =>
            (r.material_name    || "").toLowerCase().includes(search.toLowerCase()) ||
            (r.erp_packing_name || "").toLowerCase().includes(search.toLowerCase()) ||
            (r.location         || "").toLowerCase().includes(search.toLowerCase())
          )
        : data;

    // ── Stats ──
    const inStockCount = data.filter(r => Number(r.stock_qty_before) > 0).length;
    const zeroCount    = data.filter(r => !r.stock_qty_before || Number(r.stock_qty_before) === 0).length;
    const totalBalance = data.reduce((s, r) => s + Number(r.balance_to_sent || 0), 0);
    const totalSent    = data.reduce((s, r) => s + Number(r.total_sent      || 0), 0);

    // ── Export CSV ──
    const exportCSV = () => {
        if (!data.length) return;
        const headers = [
            "Sr No","Description","ERP Packing List","W(mm)","H/L(mm)","Qty",
            "Stock Before","Stock After","Wt","Color","RFD Qty",
            "Qty Send For Apprv","Total Sent","Balance To Sent","Location",
            "Lot No","Date Head","Send Qty","Bundles",
        ];
        const rows = data.map((r, i) => [
            i+1, r.material_name, r.erp_packing_name, r.width_mm, r.height_length_mm,
            r.qty, r.stock_qty_before, r.stock_qty_after, r.weight, r.colour,
            r.rfd_qty, r.qty_send_for_apprv, r.total_sent, r.balance_to_sent, r.location,
            edits[i]?.lotNo || "", edits[i]?.dateHead || "", edits[i]?.sendQty || "", edits[i]?.bundle || "",
        ]);
        const csv  = [headers, ...rows].map(r => r.map(v => `"${v ?? ""}"`).join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const a    = document.createElement("a");
        a.href     = URL.createObjectURL(blob);
        a.download = `PerformDispatch_${fileId}_${selectedType}_${new Date().toISOString().slice(0,10)}.csv`;
        a.click();
        showToast("Exported!", "success");
    };

    const isZero = r => !r.stock_qty_before || Number(r.stock_qty_before) === 0;

    // Shared purple header style for editable columns
    const purpleTh = { background: "linear-gradient(135deg,#312e81,#4f46e5)", color: "#fff" };
    const tealTh   = { background: "linear-gradient(135deg,#0c4a6e,#0891b2)", color: "#fff" };

    // ── LOADING ──
    if (loading) return (
        <div className={`pd-root${isDark ? " pd-dark" : ""}`} style={{ minHeight: "100vh", background: isDark ? "#090e1a" : "#f4f6ff" }}>
            <style>{CSS}</style>
            <div className="pd-loader">
                <div className="pd-spinner" />
                <div className="pd-loader-text">LOADING PERFORM DISPATCH…</div>
            </div>
        </div>
    );

    // ── ERROR ──
    if (error && !data.length) return (
        <div className={`pd-root${isDark ? " pd-dark" : ""}`} style={{ minHeight: "100vh", background: isDark ? "#090e1a" : "#f4f6ff" }}>
            <style>{CSS}</style>
            <div className="pd-error">
                <div className="pd-error-card">
                    <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>⚠️</div>
                    <div style={{ fontWeight: 700, color: "#ef4444", fontSize: "1.05rem", marginBottom: 8 }}>Failed to load</div>
                    <div style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: 20 }}>{error}</div>
                    <button onClick={() => fetchData(fileId, selectedType)}
                        style={{ background: "#4f46e5", color: "#fff", border: "none", borderRadius: 8, padding: "9px 24px", fontWeight: 700, cursor: "pointer" }}>
                        Retry
                    </button>
                </div>
            </div>
        </div>
    );

    // ── RENDER ──
    return (
        <div className={`pd-root${isDark ? " pd-dark" : ""}`}>
            <style>{CSS}</style>
            <Toasts items={toasts} />

            {/* ─── TOP BAR ─── */}
            <div className="pd-topbar">
                <div className="pd-topbar-left">
                    <button className="btn-ghost" onClick={() => window.history.back()}>← Back</button>
                    <div className="pd-topbar-icon">🚛</div>
                    <div>
                        <div className="pd-topbar-title">Perform Dispatch</div>
                        <div className="pd-topbar-meta">
                            {[
                                ["File ID", meta.fileid || fileId],
                                ["Type",    selectedType],
                                ["Mode",    meta.hasTypeData ? selectedType : "ALL"],
                                meta.despatchLot ? ["Lot", meta.despatchLot] : null,
                            ].filter(Boolean).map(([k, v]) => (
                                <span key={k} className="pd-chip"><strong>{k}:</strong> {v}</span>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="pd-topbar-actions">
                    {meta.fileName && (
                        <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.78rem", fontFamily: "'JetBrains Mono',monospace" }}>
                            📄 {meta.fileName}
                        </span>
                    )}
                    <button className="btn-ghost" onClick={() => fetchData(fileId, selectedType)}>↻ Refresh</button>
                    <button className="btn-ghost" onClick={() => setTheme(t => t === "light" ? "dark" : "light")}>
                        {isDark ? "☀️" : "🌙"}
                    </button>
                </div>
            </div>

            {/* ─── BODY ─── */}
            <div className="pd-body">

                {/* CONTROLS */}
                <div className="pd-controls">
                    <div className="pd-controls-left">
                        <span className="pd-label">Dispatch Type:</span>
                        <select className="pd-select" value={selectedType} onChange={handleTypeChange}>
                            {DISPATCH_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <span style={{ fontSize: "0.78rem", color: "var(--muted)", fontFamily: "'JetBrains Mono',monospace" }}>
                            {filtered.length} of {data.length} items
                        </span>
                    </div>
                    <div className="pd-controls-right">
                        <button className="btn-export" onClick={exportCSV}>📊 Export CSV</button>
                    </div>
                </div>

                {/* WARNING */}
                {!meta.hasTypeData && (
                    <div className="pd-warning">
                        <span>⚠️</span>
                        No material of <strong style={{ marginLeft: 4 }}>{selectedType}</strong> — showing ALL materials
                    </div>
                )}

                {/* FIELD GUIDE */}
                <div className="pd-info-banner" style={{
                    background: isDark ? "#1e293b" : "#eef2ff",
                    border: `1px solid ${isDark ? "#334155" : "#c7d2fe"}`,
                    color:  isDark ? "#a5b4fc" : "#4338ca",
                }}>
                    <span style={{ fontSize: "1rem", flexShrink: 0 }}>💡</span>
                    <div style={{ lineHeight: 1.6 }}>
                        <strong>To save a row:</strong>&nbsp;
                        Fill&nbsp;<strong style={{ color: isDark ? "#a5b4fc" : "#4338ca" }}>Lot No.</strong>,&nbsp;
                        <strong style={{ color: isDark ? "#a5b4fc" : "#4338ca" }}>Date</strong>&nbsp;(calendar date),&nbsp;
                        <strong style={{ color: isDark ? "#38bdf8" : "#0891b2" }}>Send Qty</strong>&nbsp;(numeric — how many units to dispatch),&nbsp;
                        <strong style={{ color: isDark ? "#a5b4fc" : "#4338ca" }}>Bundles</strong>
                        &nbsp;→ then tick the <strong>✓ Action</strong> checkbox.
                    </div>
                </div>

                {/* STATS */}
                <div className="pd-stats">
                    <StatCard label="Total Items"    value={meta.totalItems || data.length} color="#4f46e5" icon="📋" delay={0}   />
                    <StatCard label="In Stock"        value={inStockCount}                  color="#16a34a" icon="✅" delay={60}  />
                    <StatCard label="Zero Stock"      value={zeroCount}                     color="#f59e0b" icon="⚠️" delay={120} />
                    <StatCard label="Total Sent"      value={totalSent.toLocaleString()}    color="#0891b2" icon="📤" delay={180} />
                    <StatCard label="Balance To Send" value={totalBalance.toLocaleString()} color="#e8560a" icon="⏳" delay={240} />
                </div>

                {/* TABLE */}
                <div className="pd-table-wrap">
                    <div className="pd-table-head-bar">
                        <span className="pd-table-head-title">🚛 Dispatch Material List</span>
                        <input
                            className="pd-search" type="text"
                            placeholder="Search description, location…"
                            value={search} onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    {filtered.length === 0 ? (
                        <div className="pd-empty">
                            <div className="pd-empty-icon">📭</div>
                            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.83rem", letterSpacing: "0.06em" }}>NO DISPATCH RECORDS FOUND</p>
                        </div>
                    ) : (
                        <div className="pd-scroll" ref={tableRef}>
                            <table className="pd-table">
                                <thead>
                                    <tr>
                                        <th>Sr<br/>No.</th>
                                        <th className="left">Description</th>
                                        <th className="left">ERP Packing<br/>List</th>
                                        <th>W<br/>(mm)</th>
                                        <th>H / L<br/>(mm)</th>
                                        <th>Qty</th>
                                        <th>Stock Qty<br/>Before Dis.</th>
                                        <th>Stock Qty<br/>After Dis.</th>
                                        <th>Wt</th>
                                        <th>Color</th>
                                        <th>RFD<br/>Qty</th>
                                        <th>Qty Send<br/>For Apprv.</th>
                                        <th>Total<br/>Sent</th>
                                        <th>Balance<br/>To Sent</th>

                                        {/* ── Editable (purple) ── */}
                                        <th style={{ ...purpleTh, minWidth: 105 }}>
                                            Lot No.
                                            <span className="col-sub">→ LotNO / plan</span>
                                        </th>
                                        <th style={{ ...purpleTh, minWidth: 130 }}>
                                            Date
                                            <span className="col-sub">→ DateHead (calendar)</span>
                                        </th>
                                        {/* ── Send Qty (teal) — this is $_POST['date'] in PHP → send_qty in DB ── */}
                                        <th style={{ ...tealTh, minWidth: 90 }}>
                                            Send Qty
                                            <span className="col-sub">→ $_POST['date']</span>
                                        </th>
                                        <th style={{ ...purpleTh, minWidth: 80 }}>
                                            Bundles
                                            <span className="col-sub">→ bund1</span>
                                        </th>

                                        <th>Location</th>
                                        <th style={{ minWidth: 75 }}>
                                            Action
                                            <span className="col-sub" style={{ color: "var(--muted)" }}>✓ Save</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((row, i) => {
                                        const zero    = isZero(row);
                                        const ss      = saveState[i] || {};
                                        const isSaved = ss.result === "ok";

                                        return (
                                            <tr key={i} className={[
                                                zero       ? "zero-stock"  : "",
                                                ss.saving  ? "saving-row" : "",
                                                isSaved    ? "saved-row"  : "",
                                            ].filter(Boolean).join(" ")}>

                                                <td><span className="cell-sr">{row.sr_no || i + 1}</span></td>

                                                <td className="cell-name left">
                                                    {row.material_name || <span className="cell-dash">—</span>}
                                                </td>

                                                <td className="cell-erp left"><D v={row.erp_packing_name} /></td>

                                                <td className="cell-mono"><D v={row.width_mm} /></td>
                                                <td className="cell-mono"><D v={row.height_length_mm} /></td>

                                                <td>
                                                    <span className="badge-stock badge-grey cell-mono" style={{ fontSize: "0.78rem" }}>
                                                        <D v={row.qty} />
                                                    </span>
                                                </td>

                                                <td><StockBadge value={row.stock_qty_before} type="before" /></td>
                                                <td><StockBadge value={row.stock_qty_after}  type="after"  /></td>

                                                <td className="cell-mono" style={{ color: "var(--muted)" }}><D v={row.weight} /></td>

                                                <td>
                                                    {row.colour
                                                        ? <span style={{ display:"inline-block", padding:"2px 8px", borderRadius:6, background:"var(--header-bg)", fontSize:"0.75rem", fontWeight:600, color:"var(--accent)", border:"1px solid var(--border)" }}>{row.colour}</span>
                                                        : <span className="cell-dash">—</span>}
                                                </td>

                                                <td><RfdBadge value={row.rfd_qty} /></td>

                                                <td>
                                                    {row.qty_send_for_apprv
                                                        ? <span className="badge-stock badge-orange">{row.qty_send_for_apprv}</span>
                                                        : <span className="cell-dash">—</span>}
                                                </td>

                                                <td>
                                                    <span className="badge-stock badge-blue cell-mono">{row.total_sent ?? 0}</span>
                                                </td>

                                                <td><BalBadge value={row.balance_to_sent} /></td>

                                                {/* ── Lot No. → POST: LotNO + plan ── */}
                                                <td style={{ background: "rgba(99,102,241,0.05)" }}>
                                                    <input
                                                        className="cell-input"
                                                        style={{ width: 90 }}
                                                        type="text"
                                                        placeholder="Lot No."
                                                        value={edits[i]?.lotNo ?? ""}
                                                        disabled={ss.saving || isSaved}
                                                        onChange={e => setEdit(i, "lotNo", e.target.value)}
                                                    />
                                                </td>

                                                {/* ── Date → POST: DateHead (calendar date for dispatch_b.date) ── */}
                                                <td style={{ background: "rgba(99,102,241,0.05)" }}>
                                                    <input
                                                        className="cell-input"
                                                        style={{ width: 115 }}
                                                        type="date"
                                                        value={edits[i]?.dateHead ?? ""}
                                                        disabled={ss.saving || isSaved}
                                                        onChange={e => setEdit(i, "dateHead", e.target.value)}
                                                    />
                                                </td>

                                                {/* ── Send Qty → POST: date → DB: send_qty (numeric!) ── */}
                                                <td style={{ background: "rgba(8,145,178,0.07)" }}>
                                                    <input
                                                        className="cell-input"
                                                        style={{ width: 70, textAlign: "right" }}
                                                        type="number"
                                                        min="0"
                                                        step="1"
                                                        placeholder="0"
                                                        value={edits[i]?.sendQty ?? ""}
                                                        disabled={ss.saving || isSaved}
                                                        onChange={e => setEdit(i, "sendQty", e.target.value)}
                                                    />
                                                </td>

                                                {/* ── Bundles → POST: bund1 ── */}
                                                <td style={{ background: "rgba(99,102,241,0.05)" }}>
                                                    <input
                                                        className="cell-input"
                                                        style={{ width: 65 }}
                                                        type="text"
                                                        placeholder="Bundles"
                                                        value={edits[i]?.bundle ?? ""}
                                                        disabled={ss.saving || isSaved}
                                                        onChange={e => setEdit(i, "bundle", e.target.value)}
                                                    />
                                                </td>

                                                <td>
                                                    {row.location
                                                        ? <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.75rem", fontWeight:700, color:"var(--accent3)" }}>{row.location}</span>
                                                        : <span className="cell-dash">—</span>}
                                                </td>

                                                {/* ── ACTION ── */}
                                                <td>
                                                    {ss.saving ? (
                                                        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
                                                            <span className="save-spinner" />
                                                            <span style={{ fontSize:"0.62rem", color:"var(--muted)", fontFamily:"'JetBrains Mono',monospace" }}>Saving…</span>
                                                        </div>
                                                    ) : isSaved ? (
                                                        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                                                            <span style={{ fontSize:"1.2rem" }}>✅</span>
                                                            <span className="row-save-ok" title={ss.message}>Saved</span>
                                                        </div>
                                                    ) : ss.result === "error" ? (
                                                        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                                                            <input
                                                                type="checkbox"
                                                                className="cell-checkbox"
                                                                title={`Error: ${ss.message} — click to retry`}
                                                                onChange={() => handleCheckbox(i, row)}
                                                            />
                                                            <span
                                                                className="row-save-err"
                                                                title={ss.message}
                                                                onClick={() => showToast(`Error: ${ss.message}`, "error")}
                                                            >✗ Retry</span>
                                                        </div>
                                                    ) : (
                                                        <input
                                                            type="checkbox"
                                                            className="cell-checkbox"
                                                            title="Fill Lot No., Date, Send Qty and Bundles — then tick to save"
                                                            onChange={() => handleCheckbox(i, row)}
                                                        />
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default PerformDispatch;