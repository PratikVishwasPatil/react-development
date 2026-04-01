import React, { useEffect, useState, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════
// API URLs
// ═══════════════════════════════════════════════════════════════
const API_BASE   = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api";
const BUTTON_API = `${API_BASE}/MssButtonApi.php`;
const SAVE_API   = `${API_BASE}/InsertMssApi.php`;   // action=save  → POST
const UPDATE_API = `${API_BASE}/InsertMssApi.php`;   // action=update → POST  (same file, different action field)

// ═══════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');

:root {
  --bg:#f0f4f8; --card:#fff; --header-bg:#f7f9fc; --border:#d8e0ec;
  --text:#1a2340; --muted:#7a8aaa; --accent:#1d6fbd; --accent2:#e8560a;
  --accent-soft:rgba(29,111,189,.09); --shadow:0 4px 20px rgba(0,0,0,.08);
}
.dark-mss {
  --bg:#13161e; --card:#1e2330; --header-bg:#252b3b; --border:#2e3650;
  --text:#e8edf5; --muted:#8b95af; --accent:#60a5fa; --accent2:#f97316;
  --accent-soft:rgba(96,165,250,.12); --shadow:0 4px 20px rgba(0,0,0,.3);
}

* { box-sizing:border-box; margin:0; padding:0; }
body { background:var(--bg); font-family:'DM Sans',sans-serif; color:var(--text); }

@keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
@keyframes spin    { to{transform:rotate(360deg)} }
@keyframes slideIn { from{transform:translateX(420px);opacity:0} to{transform:translateX(0);opacity:1} }
@keyframes slideOut{ from{transform:translateX(0);opacity:1}     to{transform:translateX(420px);opacity:0} }

.fade-up  { animation:fadeUp .4s ease both; }
.toast-in { animation:slideIn .3s ease-out; }
.toast-out{ animation:slideOut .3s ease-out; }

.mss-wrap { max-width:1440px; margin:0 auto; padding:24px 20px 60px; }

.mss-header {
  background:linear-gradient(135deg,#1e3a5f 0%,#2e6db4 55%,#1a9ed9 100%);
  border-radius:16px; padding:28px 32px; margin-bottom:22px;
  display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px;
}
.dark-mss .mss-header { background:linear-gradient(135deg,#1a1f2e 0%,#2d3a52 100%); }
.mss-header-left { display:flex; align-items:center; gap:16px; }
.mss-header-icon { width:48px;height:48px;border-radius:12px;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;font-size:1.5rem;flex-shrink:0; }
.mss-header-title { font-family:'Syne',sans-serif; font-weight:800; color:#fff; font-size:1.3rem; }
.mss-header-meta { display:flex; gap:18px; flex-wrap:wrap; margin-top:6px; }
.mss-header-chip { font-size:.8rem; color:rgba(255,255,255,.8); display:flex; align-items:center; gap:5px; }
.mss-header-chip strong { color:rgba(255,255,255,.55); font-weight:500; }
.mss-header-right { display:flex; gap:10px; }
.btn-ghost { background:rgba(255,255,255,.15); border:1.5px solid rgba(255,255,255,.3); color:#fff; border-radius:8px; padding:8px 18px; font-family:'DM Sans',sans-serif; font-weight:600; font-size:.83rem; cursor:pointer; transition:background .18s; }
.btn-ghost:hover { background:rgba(255,255,255,.25); }

.mss-tabs { display:flex; border-bottom:2px solid var(--border); background:var(--header-bg); border-radius:12px 12px 0 0; overflow:hidden; }
.mss-tab { padding:14px 24px; font-family:'DM Sans',sans-serif; font-weight:600; font-size:.88rem; color:var(--muted); border:none; background:transparent; cursor:pointer; transition:color .18s, box-shadow .18s; display:flex; align-items:center; gap:7px; white-space:nowrap; }
.mss-tab:hover { color:var(--accent); }
.mss-tab.active { color:var(--accent); box-shadow:inset 0 -3px 0 var(--accent); }
.mss-tab-content { background:var(--card); border:1px solid var(--border); border-top:none; border-radius:0 0 14px 14px; padding:28px; box-shadow:var(--shadow); }

.mss-block { background:var(--card); border:1px solid var(--border); border-radius:12px; overflow:hidden; box-shadow:var(--shadow); margin-bottom:20px; }
.mss-block-header { background:var(--header-bg); border-bottom:1px solid var(--border); padding:10px 20px; display:flex; align-items:center; gap:10px; }
.mss-block-bar { width:4px; height:18px; border-radius:2px; background:var(--accent); flex-shrink:0; }
.mss-block-title { font-family:'Syne',sans-serif; font-weight:700; font-size:.82rem; letter-spacing:.1em; text-transform:uppercase; color:var(--accent); }
.mss-block-body { padding:20px 22px 24px; }

.info-row { padding:9px 0; border-bottom:1px solid var(--border); }
.info-row:last-child { border-bottom:none; }
.info-label { font-size:.71rem; font-weight:700; letter-spacing:.07em; text-transform:uppercase; color:var(--muted); margin-bottom:3px; }
.info-value { font-size:.93rem; font-weight:500; color:var(--accent); }
.info-value.plain { color:var(--text); }

.mss-table { width:100%; border-collapse:collapse; }
.mss-table th { background:var(--header-bg); border:1px solid var(--border); padding:8px 10px; font-size:.77rem; font-weight:700; color:var(--muted); text-align:center; letter-spacing:.04em; }
.mss-table td { border:1px solid var(--border); padding:7px 10px; font-size:.84rem; color:var(--text); vertical-align:middle; }
.mss-table td.row-lbl { font-weight:600; color:var(--accent); background:var(--header-bg); white-space:nowrap; }
.mss-table input[type=text], .mss-table input[type=date] { width:100%; border:none; border-bottom:1px solid var(--border); background:transparent; outline:none; font-size:.83rem; color:var(--text); font-family:'DM Sans',sans-serif; padding:3px 2px; text-align:center; }
.mss-table input[type=text]:focus, .mss-table input[type=date]:focus { border-bottom-color:var(--accent); }
.mss-table input[type=radio], .mss-table input[type=checkbox] { accent-color:var(--accent2); width:15px; height:15px; cursor:pointer; }

.fl-label { font-size:.8rem; font-weight:600; color:var(--accent); margin-bottom:4px; display:block; }
.fl-input { width:100%; border:none; border-bottom:1.5px solid var(--border); background:transparent; padding:5px 2px; font-size:.88rem; color:var(--text); outline:none; font-family:'DM Sans',sans-serif; transition:border .15s; }
.fl-input:focus { border-bottom-color:var(--accent); }
.fl-textarea { width:100%; border:1px solid var(--border); border-radius:8px; padding:7px 10px; font-size:.84rem; resize:vertical; min-height:52px; background:var(--bg); color:var(--text); outline:none; font-family:'DM Sans',sans-serif; transition:border .15s; margin-bottom:12px; }
.fl-textarea:focus { border-color:var(--accent); }
.radio-row { display:flex; align-items:center; gap:7px; font-size:.84rem; color:var(--text); cursor:pointer; margin-bottom:6px; flex-wrap:wrap; }
.radio-row input { accent-color:var(--accent2); width:15px; height:15px; cursor:pointer; flex-shrink:0; }
.sec-lbl { font-size:.77rem; font-weight:700; color:var(--accent); letter-spacing:.06em; text-transform:uppercase; margin-bottom:8px; display:block; }

.row { display:flex; flex-wrap:wrap; gap:16px; }
.col-3 { flex:0 0 calc(33.33% - 12px); min-width:200px; }
.col-4 { flex:0 0 calc(25% - 12px); min-width:160px; }
.col-6 { flex:0 0 calc(50% - 8px); min-width:240px; }
.col-12 { flex:0 0 100%; }

.sa-wrap { border:1px solid var(--border); border-radius:8px; padding:14px; background:var(--header-bg); }
.sa-row { display:flex; gap:8px; margin-bottom:8px; align-items:center; }
.sa-row input { flex:1; border:none; border-bottom:1px solid var(--border); background:transparent; outline:none; font-size:.83rem; color:var(--text); font-family:'DM Sans',sans-serif; padding:4px 2px; min-width:60px; }
.sa-row input:focus { border-bottom-color:var(--accent); }

.btn-round { width:24px; height:24px; border-radius:50%; background:var(--accent2); border:none; color:#fff; font-size:1.1rem; cursor:pointer; flex-shrink:0; display:flex; align-items:center; justify-content:center; transition:opacity .15s; }
.btn-round:hover { opacity:.85; }

.btn-save {
  border:none; color:#fff; border-radius:10px; padding:13px 50px;
  font-family:'Syne',sans-serif; font-weight:700; font-size:1rem;
  letter-spacing:.04em; cursor:pointer;
  transition:transform .18s, box-shadow .18s;
  display:block; margin:0 auto;
}
.btn-save:hover:not(:disabled) { transform:translateY(-2px); }
.btn-save:disabled { opacity:.6; cursor:not-allowed; transform:none; }

.btn-save-save {
  background:linear-gradient(135deg,#1d6fbd 0%,#1a9ed9 100%);
  box-shadow:0 6px 20px rgba(29,111,189,.35);
}
.btn-save-save:hover:not(:disabled) { box-shadow:0 10px 28px rgba(29,111,189,.45); }

.btn-save-update {
  background:linear-gradient(135deg,#e8560a 0%,#f07030 100%);
  box-shadow:0 6px 20px rgba(232,86,10,.35);
}
.btn-save-update:hover:not(:disabled) { box-shadow:0 10px 28px rgba(232,86,10,.45); }

.loader-wrap { min-height:60vh; display:flex; align-items:center; justify-content:center; flex-direction:column; gap:16px; }
.spinner { width:48px; height:48px; border:4px solid var(--border); border-top-color:var(--accent); border-radius:50%; animation:spin 1s linear infinite; }

.err-banner { background:#fee2e2; border:1px solid #fca5a5; border-radius:8px; padding:12px 18px; color:#dc2626; font-size:.9rem; margin-bottom:18px; }
.dark-mss .err-banner { background:#450a0a; border-color:#b91c1c; color:#fca5a5; }

.po-card { border-left:4px solid var(--accent); border-radius:12px; background:var(--card); border:1px solid var(--border); padding:20px; margin-bottom:16px; transition:transform .2s,box-shadow .2s; }
.po-card:hover { transform:translateY(-3px); box-shadow:0 8px 24px rgba(0,0,0,.12); }
.po-title { font-family:'Syne',sans-serif; font-weight:700; color:var(--accent); font-size:1.05rem; margin-bottom:12px; }
.po-meta { font-size:.87rem; margin-bottom:6px; }
.po-meta strong { color:var(--muted); font-weight:600; }

.tbl-scroll { overflow-x:auto; }
.mb-2 { margin-bottom:10px; }

@media(max-width:768px) {
  .col-3,.col-4,.col-6 { flex:0 0 100%; }
  .mss-header { flex-direction:column; align-items:flex-start; }
}
`;

// ═══════════════════════════════════════════════════════════════
// CONSTANTS  — match PHP field name expectations
// ═══════════════════════════════════════════════════════════════
const MAT_LABELS = [
  { key:"foundation1",    label:"Foundation",          unit:"Kgs",   unitKey:"foundationUnit",    qtyKey:"foundationQnty",    costKey:"foundationCost",  hasEXT:false },
  { key:"fabrication",    label:"Fabrication",         unit:"Kgs",   unitKey:"fabricationUnit",   qtyKey:"fabricationQnty",   costKey:"fabricationCost", hasEXT:false },
  { key:"sheet-metal",    label:"Sheet-Metal",         unit:"Kgs",   unitKey:"sheet-metalUnit",   hasEXT:true  },
  { key:"powder",         label:"Powder",              unit:"Sq ft", unitKey:"powderUnit",         hasEXT:true  },
  { key:"hardware",       label:"Hardware",            unit:"",      unitKey:"hardwareUnit",      qtyKey:"hardwareQnty",      costKey:"hardwareCost",    hasEXT:false },
  { key:"assembly",       label:"Assembly",            unit:"Kgs",   unitKey:"assemblyUnit",      qtyKey:"assemblyQnty",      costKey:"assemblyCost",    hasEXT:false },
  { key:"manDaysOnSite",  label:"Man-Days on Site",    unit:"Nos",   unitKey:"manDaysOnSiteUnit", qtyKey:"manDaysOnSiteQnty", costKey:"manDaysOnSiteCost", hasEXT:false },
  { key:"siteExpenses",   label:"Site Expenses",       unit:"Rs.",   unitKey:"siteExpensesUnit",  qtyKey:"siteExpensesQnty",  costKey:"siteExpensesCost", hasEXT:false },
  { key:"despatchLot",    label:"Despatch Lot",        unit:"Nos",   unitKey:"despatchLotsUnit",  qtyKey:"despatchLotQnty",   costKey:"despatchLotCost", hasEXT:false },
  { key:"transportation", label:"Transportation Cost", unit:"",      unitKey:"transportationUnit",qtyKey:"transportationQnty",costKey:"traspotationCost",hasEXT:false },
  { key:"total_Weight",   label:"Total Weight (KG)",   unit:"",      unitKey:"totalUnit",         qtyKey:"tolalQnty",         costKey:"totalWeightCost", hasEXT:false },
  { key:"RM_Cost",        label:"RM Cost",             unit:"",      unitKey:"RMCostUnit",        qtyKey:"RMCostQnty",        costKey:"RMCost",          hasEXT:false },
];

const CLADDING_PANELS = [
  { label:"Front Top Panel",    phpKey:"claddingFrontTop",    gaugeK:"claddingFrontTopGuage",    perfK:"claddingFrontTopPerforation",    colK:"claddingFrontTopColour",    remK:"claddingFrontTopRemark"    },
  { label:"Front Middle Panel", phpKey:"claddingFrontMiddle", gaugeK:"claddingFrontMiddleGuage", perfK:"claddingFrontMiddlePerforation", colK:"claddingFrontMiddleColour", remK:"claddingFrontMiddleRemark" },
  { label:"Front Bottom Panel", phpKey:"claddingFrontBottom", gaugeK:"claddingFrontBottomGuage", perfK:"claddingFrontBottomPerforation", colK:"claddingFrontBottomColour", remK:"claddingFrontBottomRemark" },
  { label:"Back Panel",         phpKey:"claddingBack",        gaugeK:"claddingBackGuage",        perfK:"claddingBackPerforation",        colK:"claddingBackColour",        remK:"claddingBackRemark"        },
  { label:"Top Panel",          phpKey:"claddingTop",         gaugeK:"claddingTopGuage",         perfK:"claddingTopPerforation",         colK:"claddingTopColour",         remK:"claddingTopRemark"         },
  { label:"End Covers",         phpKey:"claddingEnd",         gaugeK:"claddingEndGuage",         perfK:"claddingEndPerforation",         colK:"claddingEndColour",         remK:"claddingEndRemark"         },
  { label:"Doors",              phpKey:"claddingDoor",        gaugeK:"claddingDoorGuage",        perfK:"claddingDoorPerforation",        colK:"claddingDoorColour",        remK:"claddingDoorRemark"        },
];

const LOADING_LEVEL_KEYS = [
  { label:"Sectional Panels",  apiKey:"Sectional Panels",  inputKey:"sectionalPanel",  abbrKey:"spAbbr",     thickKey:"spThickness",    enfKey:"spEnforcement",  pcKey:"sp",    colKey:"spColourShade",  remKey:"spRemark"     },
  { label:"Level Panels-30mm", apiKey:"Level Panels-30mm", inputKey:"levelPanel30",    abbrKey:"lp-30Abbr",  thickKey:"lp-30Thickness", enfKey:"lp-30Enforcement", pcKey:"lp-30", colKey:"lp-30ColourShade", remKey:"lp-30Remark" },
  { label:"Level Panels-45mm", apiKey:"Level Panels-45mm", inputKey:"levelPanel45",    abbrKey:"lp-45Abbr",  thickKey:"lp-45Thickness", enfKey:"lp-45Enforcement", pcKey:"lp-45", colKey:"lp-45ColourShade", remKey:"lp-45Remark" },
  { label:"Level Platform",    apiKey:"Level Platform",    inputKey:"levelPlatform",   abbrKey:"lptAbbr",    thickKey:"lptThickness",   enfKey:"lptEnforcement", pcKey:"lpt",  colKey:"lptColourShade",  remKey:"lptRemark"    },
];

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
const fmt = (v) => v || "—";

const showToast = (msg, type = "info") => {
  const el = document.createElement("div");
  const bg = type==="success" ? "#16a34a" : type==="error" ? "#dc2626" : "#2563eb";
  Object.assign(el.style, {
    position:"fixed", top:"22px", right:"22px", padding:"13px 22px",
    background:bg, color:"#fff", borderRadius:"10px",
    boxShadow:"0 6px 20px rgba(0,0,0,.2)", zIndex:"9999",
    fontFamily:"'DM Sans',sans-serif", fontSize:".9rem", fontWeight:"500",
    maxWidth:"400px", wordBreak:"break-word",
  });
  el.className = "toast-in";
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => {
    el.className = "toast-out";
    setTimeout(() => el.remove(), 300);
  }, 4000);
};

const Block = ({ title, children }) => (
  <div className="mss-block">
    <div className="mss-block-header">
      <div className="mss-block-bar" />
      <span className="mss-block-title">{title}</span>
    </div>
    <div className="mss-block-body">{children}</div>
  </div>
);

const FInput = ({ label, value, onChange, placeholder="" }) => (
  <div className="mb-2">
    {label && <label className="fl-label">{label}</label>}
    <input className="fl-input" value={value ?? ""} onChange={onChange}
      placeholder={placeholder} type="text" />
  </div>
);

const Radio = ({ name, value, checked, onChange, label }) => (
  <label className="radio-row" style={{ display:"inline-flex", marginRight:18, marginBottom:0 }}>
    <input type="radio" name={name} value={value} checked={checked} onChange={onChange} />
    {label}
  </label>
);

const Chk = ({ checked, onChange, label }) => (
  <label className="radio-row" style={{ display:"inline-flex", marginRight:18, marginBottom:0 }}>
    <input type="checkbox" checked={!!checked} onChange={onChange} />
    {label}
  </label>
);

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function MssDataSheet() {
  const [theme,   setTheme]   = useState("light");
  const [tab,     setTab]     = useState("project");
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [saving,  setSaving]  = useState(false);

  // "save" | "update" — driven by MssButtonApi
  const [buttonAction, setButtonAction] = useState("save");

  // ── URL params ──
  const getIds = () => {
    const hash = window.location.hash || "";
    const m = hash.match(/\/mss-datasheet\/(\d+)\/(\d+)/);
    if (m) return { projectId: m[1], fileId: m[2] };
    const qs = new URLSearchParams(window.location.search);
    return {
      projectId: qs.get("projectID") || "3272",
      fileId:    qs.get("fileId")    || "4990",
    };
  };
  const { projectId, fileId } = getIds();

  // ── Form state ──
  const [project,    setProject]    = useState({});
  const [siteDates,  setSiteDates]  = useState({});
  const [po,         setPo]         = useState({});
  const [dims,       setDims]       = useState([]);
  const [load,       setLoad]       = useState({});
  const [fnd,        setFnd]        = useState({});
  const [trolleys,   setTrolleys]   = useState([]);
  const [bearing,    setBearing]    = useState({});
  const [cladding,   setCladding]   = useState({});
  const [claddingHdrs, setCladdingHdrs] = useState([]);
  const [loadLvls,   setLoadLvls]   = useState({});
  const [partitions, setPartitions] = useState({});
  const [slotted,    setSlotted]    = useState([]);

  // matEst: keyed by MAT_LABELS[n].key
  // For hasEXT=true:  { qtyEXT, qtyINT, costEXT, costINT }
  // For hasEXT=false: { qty, cost }
  const [matEst, setMatEst] = useState({});
  const [siteMeas, setSiteMeas] = useState({});
  const [docs, setDocs] = useState([{ name:"", file:null }]);

  // ── Inject styles ──
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = STYLES;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  // ── Theme ──
  useEffect(() => {
    document.body.classList.toggle("dark-mss", theme === "dark");
    document.body.style.background = theme === "dark" ? "#13161e" : "#f0f4f8";
  }, [theme]);

  // ══════════════════════════════════════════════
  // Check button type from MssButtonApi
  // ══════════════════════════════════════════════
  useEffect(() => {
    const checkButton = async () => {
      try {
        const res  = await fetch(`${BUTTON_API}?projectID=${projectId}`);
        const json = await res.json();
        if (json.status === "success") {
          setButtonAction(json.button_type || "save");
        }
      } catch (e) {
        console.warn("Button check failed:", e.message);
      }
    };
    checkButton();
  }, [projectId]);

  // ══════════════════════════════════════════════
  // Fetch data sheet content
  // ══════════════════════════════════════════════
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res  = await fetch(
        `${API_BASE}/MssDatasheetApi.php?projectID=${projectId}&fileId=${fileId}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.status !== "success") throw new Error(json.message || "API error");

      const d = json.data;

      setProject(d.project || {});
      setPo(d.po || {});
      setSiteDates(d.site_dates || {});

      if (d.dimensions?.length) {
        setDims(d.dimensions.map(r => ({
          id: r.dimention_id,
          location: r.location        || "",
          length:   r.length          || "",
          width:    r.width           || "",
          height:   r.height          || "",
          super_structure: r.super_structure || "",
          quantity: r.quantity        || "",
          levels:   r.levels          || "",
          bays:     r.no_req_bays     || "",
        })));
      } else {
        setDims([{ id:null, location:"", length:"", width:"", height:"",
          super_structure:"", quantity:"", levels:"", bays:"" }]);
      }

      const ld   = d.load_details || {};
      const fuArr = ld.fix_units  || [];
      const muArr = ld.me_units   || [];
      setLoad({
        fixOPEN:      fuArr.includes("OPEN"),
        fixCPSheet:   fuArr.includes("CP Sheet"),
        fixENDCovers: fuArr.includes("END Covers"),
        fixDOORFrame: fuArr.includes("DOOR Frame"),
        fixOTHER:     fuArr.includes("OTHER"),
        fixOtherVal:  ld.fix_unit_other || "",
        meOPEN:       muArr.includes("OPEN"),
        meCPSheet:    muArr.includes("CP Sheet"),
        meENDCovers:  muArr.includes("END Covers"),
        meDOORFrame:  muArr.includes("DOOR Frame"),
        meOTHER:      muArr.includes("OTHER"),
        meOtherVal:   ld.me_unit_other || "",
        capacity:     ld.load_carrying_capacity || "",
        perPallet:    ld.load_per_pallet        || "",
        material:     ld.material_to_be_stored  || "",
        driveType:    ld.drive_type             || "",
      });

      setFnd(d.foundation || {});
      setTrolleys(d.trolley || []);
      setBearing(d.bearing  || {});

      const cl = d.cladding || {};
      setCladdingHdrs(cl._headers || []);
      const clMap = {};
      CLADDING_PANELS.forEach(p => {
        clMap[p.label] = cl[p.label] || { gauge:"", perforation:"", colour_shade:"", remarks:"", dynamic_data:[] };
      });
      setCladding(clMap);

      setLoadLvls(d.loading_levels || {});
      setPartitions(d.partitions   || {});

      setSlotted(
        d.slotted_angles?.length
          ? d.slotted_angles
          : [{ id:null, angle:"", size:"", details:"", colour:"" }]
      );

      const me = {};
      MAT_LABELS.forEach(m => {
        if (m.hasEXT) {
          const rE = d.material_estimation?.[m.key + "_Ext"] || {};
          const rI = d.material_estimation?.[m.key + "_Ixt"] || {};
          me[m.key] = { qtyEXT:rE.quantity||"", qtyINT:rI.quantity||"",
                        costEXT:rE.cost||"",    costINT:rI.cost||"" };
        } else {
          const raw = d.material_estimation?.[m.key] || {};
          me[m.key] = { qty:raw.quantity||"", cost:raw.cost||"" };
        }
      });
      setMatEst(me);

      setSiteMeas({
        measTaken:       d.site_measurements?.measurement_taken?.is_done    || "",
        measTakenRemark: d.site_measurements?.measurement_taken?.remark     || "",
        takenBy:         d.site_measurements?.measurement_taken_by?.is_done || "",
        takenByRemark:   d.site_measurements?.measurement_taken_by?.remark  || "",
        approval:        d.site_measurements?.customer_approval?.is_done    || "",
        approvalRemark:  d.site_measurements?.customer_approval?.remark     || "",
      });

      if (d.attached_documents?.length) {
        setDocs(d.attached_documents.map(doc => ({
          name: doc.doc_name, file: null, path: doc.doc_path
        })));
      }

    } catch (e) {
      setError(`Failed to load data: ${e.message}`);
      showToast(`Error: ${e.message}`, "error");
    } finally {
      setLoading(false);
    }
  }, [projectId, fileId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── State updaters ──
  const updProject  = (k, v) => setProject(p  => ({ ...p, [k]: v }));
  const updLoad     = (k, v) => setLoad    (p  => ({ ...p, [k]: v }));
  const updFnd      = (k, v) => setFnd     (p  => ({ ...p, [k]: v }));
  const updBearing  = (k, v) => setBearing (p  => ({ ...p, [k]: v }));
  const updCladding = (panel, k, v) => setCladding(p => ({ ...p, [panel]: { ...p[panel], [k]: v } }));
  const updSiteMeas = (k, v) => setSiteMeas(p  => ({ ...p, [k]: v }));

  const updDim  = (i, k, v) => setDims(r => r.map((row,idx) => idx===i ? {...row,[k]:v} : row));
  const addDim  = () => setDims(r => [...r, { id:null, location:"", length:"", width:"",
    height:"", super_structure:"", quantity:"", levels:"", bays:"" }]);
  const removeDim = (i) => setDims(r => r.filter((_,idx) => idx!==i));

  const updSlotted    = (i, k, v) => setSlotted(r => r.map((row,idx) => idx===i ? {...row,[k]:v} : row));
  const addSlotted    = () => setSlotted(r => [...r, { id:null, angle:"", size:"", details:"", colour:"" }]);
  const removeSlotted = (i) => setSlotted(r => r.filter((_,idx) => idx!==i));

  const updMatEst = (key, k, v) => setMatEst(p => ({ ...p, [key]: { ...p[key], [k]: v } }));

  const getLvl = (apiKey, field) => loadLvls[apiKey]?.[field] || "";
  const setLvl = (apiKey, field, v) =>
    setLoadLvls(p => ({ ...p, [apiKey]: { ...(p[apiKey]||{}), [field]: v } }));

  const addDoc    = () => setDocs(r => [...r, { name:"", file:null }]);
  const removeDoc = (i) => setDocs(r => r.filter((_,idx) => idx!==i));

  // ══════════════════════════════════════════════════════════════
  // BUILD FormData — field names match EXACTLY what PHP reads
  // via $input['fieldName'] (JSON body) or $_POST['fieldName']
  //
  // The PHP file reads:
  //   $body = json_decode(file_get_contents("php://input"), true);
  //   $input = !empty($body) ? $body : $_POST;
  //
  // We send multipart FormData so PHP uses $_POST path.
  // The 'action' field MUST be "save" or "update".
  // ══════════════════════════════════════════════════════════════
  const buildFormData = () => {
    const fd = new FormData();

    // ── Action + Core IDs ─────────────────────────────────────
    // PHP:  $action = strtolower($input['action'] ?? '');
    fd.append("action",    buttonAction);   // "save" or "update"
    // PHP:  $projectId = esc($con, $input['projectId'] ?? '');
    fd.append("projectId", projectId);
    // PHP:  $file_id   = esc($con, $input['fileid']   ?? '');
    fd.append("fileid",    fileId);

    // ── Project master fields ─────────────────────────────────
    // PHP: $customerAmbassador = esc($con, $input['custAmb1'] ?? '');
    const ambValue = project.customer_ambassador || "";
    fd.append("custAmb1", ambValue);
    // PHP: if ($customerAmbassador === 'OTHER') { $otherCustomerAmbassador = esc($con, $input['customerAmbassador1'] ?? ''); }
    if (ambValue === "OTHER") {
      fd.append("customerAmbassador1", project.ambassador_other || "");
    }

    // PHP: $transportDocument = esc($con, $input['document'] ?? '');
    const docValue = project.transport_document || "";
    fd.append("document", docValue);
    // PHP: if ($transportDocument === 'OTHER') { $otherDoc = esc($con, $input['document1'] ?? ''); }
    if (docValue === "OTHER") {
      fd.append("document1", project.transport_document_other || "");
    }

    // PHP: $specialOfficialRequirement = esc($con, $input['specialOfficialRequirement'] ?? '');
    fd.append("specialOfficialRequirement", project.special_official_requirement || "");
    // PHP: $specialInstructions = esc($con, $input['specialInstructions'] ?? '');
    fd.append("specialInstructions",        project.special_instructions         || "");
    // PHP: $specialRequirements = esc($con, $input['specialRequirements'] ?? '');
    fd.append("specialRequirements",        project.special_requirements         || "");
    // PHP: $aestheticsInfo = esc($con, $input['specialInstructionAesthetic'] ?? '');
    fd.append("specialInstructionAesthetic", project.aesthetics_info             || "");

    // ── Site Form Date Details ────────────────────────────────
    // PHP reads: $siteFormIssuedDate, $foundationDate, $dispatchFoundationDate,
    //            $primaryInfoDate, $firstDispatchDate, $completedFileDate,
    //            $lastDispatchDate, $commitedDispatchDate
    const dateFields = [
      "siteFormIssuedDate","foundationDate","dispatchFoundationDate",
      "primaryInfoDate","firstDispatchDate","completedFileDate",
      "lastDispatchDate","commitedDispatchDate",
    ];
    dateFields.forEach(k => fd.append(k, siteDates[k] || ""));

    // ── Dimension Info ────────────────────────────────────────
    // SAVE:   PHP reads $ftype[], $flength[], $fwidth[], $fheight[],
    //                   $fSuperstructure[], $fqty[], $flevels[], $fbays[]
    // UPDATE: PHP reads $dim[] (IDs), $flength1[], $fwidth1[], $fheight1[],
    //                   $fSuperstructure1[], $fqty1[], $flevels1[], $fbays1[]
    if (buttonAction === "save") {
      dims.forEach(row => {
        fd.append("ftype[]",           row.location        || "");
        fd.append("flength[]",         row.length          || "");
        fd.append("fwidth[]",          row.width           || "");
        fd.append("fheight[]",         row.height          || "");
        fd.append("fsuperstructure[]", row.super_structure || "");
        fd.append("fqty[]",            row.quantity        || "");
        fd.append("flevels[]",         row.levels          || "");
        fd.append("fbays[]",           row.bays            || "");
      });
    } else {
      // update — send existing IDs + new values
      dims.forEach(row => {
        fd.append("dim[]",              row.id             || "");
        fd.append("flength1[]",         row.length         || "");
        fd.append("fwidth1[]",          row.width          || "");
        fd.append("fheight1[]",         row.height         || "");
        fd.append("fsuperstructure1[]", row.super_structure|| "");
        fd.append("fqty1[]",            row.quantity       || "");
        fd.append("flevels1[]",         row.levels         || "");
        fd.append("fbays1[]",           row.bays           || "");
      });
      // also send ftype[] for rows that don't have an ID yet (new rows added during update)
      dims.forEach(row => {
        fd.append("ftype[]", row.location || "");
      });
    }

    // ── Material Estimation ───────────────────────────────────
    // PHP: foreach ($est as [$nameKey, $unitKey, $qtyKey, $costKey])
    // For each entry, $input[$nameKey] is the work-type string (the key itself).
    MAT_LABELS.forEach(m => {
      const me = matEst[m.key] || {};
      if (m.hasEXT) {
        // Sheet-metal / Powder: PHP reads
        //   $sm = $input['sheet-metal'] ?? ''  OR  $pw = $input['powder'] ?? ''
        //   $smExt = $input['sheet-metalExt'] ?? '';  $smExtCost = $input['sheet-metalExtCost'] ?? ''
        //   $smIxt = $input['sheet-metalIxt'] ?? '';  $smIxtCost = $input['sheet-metalIxtCost'] ?? ''
        //   $smUnit= $input['sheet-metalUnit'] ?? ''
        fd.append(m.key,             m.key);           // work_type name
        fd.append(m.key + "Ext",     me.qtyEXT  || "");
        fd.append(m.key + "Ixt",     me.qtyINT  || "");
        fd.append(m.key + "ExtCost", me.costEXT || "");
        fd.append(m.key + "IxtCost", me.costINT || "");
        fd.append(m.unitKey,         m.unit);
      } else {
        // Regular: PHP reads $input[$nameKey] for work-type,
        //          $input[$unitKey], $input[$qtyKey], $input[$costKey]
        fd.append(m.key,     m.key);            // work-type name (e.g. "foundation1")
        fd.append(m.unitKey, m.unit);
        fd.append(m.qtyKey,  me.qty  || "");
        fd.append(m.costKey, me.cost || "");
      }
    });

    // ── Site Load Details ─────────────────────────────────────
    // PHP: $loadCarringCapacityRack, $loadPerPallet, $materialToBeStored
    //      $MEUnit[] imploded, $fixUnit[] imploded
    fd.append("loadCarringCapacityRack", load.capacity  || "");
    fd.append("loadPerPallet",           load.perPallet || "");
    fd.append("materialToBeStored",      load.material  || "");

    // Fix units as array
    const fixUnitsArr = [];
    if (load.fixOPEN)      fixUnitsArr.push("OPEN");
    if (load.fixCPSheet)   fixUnitsArr.push("CP Sheet");
    if (load.fixENDCovers) fixUnitsArr.push("END Covers");
    if (load.fixDOORFrame) fixUnitsArr.push("DOOR Frame");
    if (load.fixOTHER)     fixUnitsArr.push(load.fixOtherVal ? "OTHER~" + load.fixOtherVal : "OTHER");
    fixUnitsArr.forEach(v => fd.append("fixUnit[]", v));

    // ME units as array
    const meUnitsArr = [];
    if (load.meOPEN)       meUnitsArr.push("OPEN");
    if (load.meCPSheet)    meUnitsArr.push("CP Sheet");
    if (load.meENDCovers)  meUnitsArr.push("END Covers");
    if (load.meDOORFrame)  meUnitsArr.push("DOOR Frame");
    if (load.meOTHER)      meUnitsArr.push(load.meOtherVal ? "OTHER~" + load.meOtherVal : "OTHER");
    meUnitsArr.forEach(v => fd.append("MEUnit[]", v));

    // Drive type — PHP: UPDATE site_load_details SET DRIVE_TYPE
    fd.append("driveType", fnd.drive_type || "");

    // ── Foundation ────────────────────────────────────────────
    // PHP: $siteFloornumber, $floorType, $foundationMaterial[], $foundation
    //      $foundationDataType[], $foundationDataType1, $foundationDataType2
    fd.append("siteFloornumber", fnd.site_floor_number || "");
    fd.append("foundation",      fnd.foundation        || "");

    // Floor type
    const floorTypeVal = fnd.floor_type || "";
    fd.append("floorTypes",  floorTypeVal);
    if (floorTypeVal === "OTHER") fd.append("floorTypes1", fnd.floor_type_other || "");

    // Foundation material checkboxes
    if (fnd.material_ms)    fd.append("foundationMaterial[]", "MS");
    if (fnd.material_ss)    fd.append("foundationMaterial[]", "SS");
    if (fnd.material_other) fd.append("foundationMaterial[]", "OTHER");
    if (fnd.material_other) fd.append("foundationMaterial1",  fnd.material_other_value || "");

    // Foundation type checkboxes + their mention fields
    // PHP: Flanged Wheel → just the value
    //      Rail Section  → value + foundationDataType1 (LB mention)
    //      Flat          → value + foundationDataType2 (flat mention)
    if (fnd.flanged_wheel)    fd.append("foundationDataType[]", "Flanged Wheel");
    if (fnd.rail_section) {
      fd.append("foundationDataType[]", "Rail Section");
      fd.append("foundationDataType1",  fnd.rail_lb        || "");
    }
    if (fnd.foundation_flat) {
      fd.append("foundationDataType[]", "Flat");
      fd.append("foundationDataType2",  fnd.flat_detail    || "");
    }

    // ── Trolley Details ───────────────────────────────────────
    // UPDATE path: PHP reads $tmmID[], $trolleyTYPE[], $trolleyTYPELength[],
    //              $lengthSection1[], $lengthSize1[], $lengthCOLOUR[]
    // NEW rows (both save & update): PHP reads countsize + trolleyType{i}, trolleyTypeLength{i},
    //              channelSectionType1{i}, lengthHeavy{i}, lengthColor{i}
    if (buttonAction === "update" && trolleys.length > 0) {
      const existingTrolleys = trolleys.filter(t => t.id);
      const newTrolleys      = trolleys.filter(t => !t.id);

      existingTrolleys.forEach(t => {
        fd.append("tmmID[]",          t.id      || "");
        fd.append("trolleyTYPE[]",    t.type    || "");
        fd.append("trolleyTYPELength[]", "");      // PHP description field; type carries the label
        fd.append("lengthSection1[]", t.section || "");
        fd.append("lengthSize1[]",    t.size    || "");
        fd.append("lengthCOLOUR[]",   t.colour  || "");
      });

      fd.append("countsize", String(newTrolleys.length));
      newTrolleys.forEach((t, i) => {
        const n = i + 1;
        fd.append(`trolleyType${n}`,         t.type    || "");
        fd.append(`trolleyTypeLength${n}`,   "");
        fd.append(`channelSectionType1${n}`, t.section || "");
        fd.append(`lengthHeavy${n}`,         t.size    || "");
        fd.append(`lengthColor${n}`,         t.colour  || "");
      });
    } else {
      // Save: all trolley rows are new
      fd.append("countsize", String(trolleys.length));
      trolleys.forEach((t, i) => {
        const n = i + 1;
        fd.append(`trolleyType${n}`,         t.type    || "");
        fd.append(`trolleyTypeLength${n}`,   "");
        fd.append(`channelSectionType1${n}`, t.section || "");
        fd.append(`lengthHeavy${n}`,         t.size    || "");
        fd.append(`lengthColor${n}`,         t.colour  || "");
      });
    }

    // ── Bearing ───────────────────────────────────────────────
    // PHP: $bearingTypeUCP, $ucpTick, $ucpParticulars
    //      $bearingTypePedestal, $pedestalTick, $pedestalParticulars
    //      $ucpTMM_ID, $pedestalTMM_ID (for update)
    fd.append("bearingTypeUCP",      "UCP");
    fd.append("ucpTick",             bearing.ucp_tick             ? "1" : "");
    fd.append("ucpParticulars",      bearing.ucp_particulars      || "");
    fd.append("ucpTMM_ID",           bearing.ucp_tmm_id           || "");

    fd.append("bearingTypePedestal", "Pedestal Type");
    fd.append("pedestalTick",        bearing.pedestal_tick        ? "1" : "");
    fd.append("pedestalParticulars", bearing.pedestal_particulars || "");
    fd.append("pedestalTMM_ID",      bearing.pedestal_tmm_id      || "");

    // ── Cladding ──────────────────────────────────────────────
    // PHP: $input[$nameKey] (e.g. "claddingFrontTop") for the cladding name/value
    //      $input[$gaugeKey], $input[$perfKey], $input[$colourKey], $input[$remarkKey]
    //      Dynamic dim cols: $dynamicCladdingName[] + $dynamicCladdingFT[], etc.
    CLADDING_PANELS.forEach(({ label, phpKey, gaugeK, perfK, colK, remK }) => {
      const c = cladding[label] || {};
      fd.append(phpKey,  label);            // work-type / name
      fd.append(gaugeK,  c.gauge        || "");
      fd.append(perfK,   c.perforation  || "");
      fd.append(colK,    c.colour_shade || "");
      fd.append(remK,    c.remarks      || "");
    });

    // ── Loading Levels ────────────────────────────────────────
    // PHP: insertLoadingLevel receives pre-escaped values
    //   $input['sectionalPanel'], $input['spAbbr'], $input['spThickness'],
    //   $input['spEnforcement'], $input['sp'], $input['spColourShade'], $input['spRemark']
    //   ... same pattern for lp-30, lp-45, lpt
    LOADING_LEVEL_KEYS.forEach(({ inputKey, abbrKey, thickKey, enfKey, pcKey, colKey, remKey }) => {
      fd.append(inputKey, inputKey);                          // the level name
      fd.append(abbrKey,  "");                               // abbreviation
      fd.append(thickKey, getLvl(inputKey.replace("levelPanel","Level Panels-").replace("levelPlatform","Level Platform").replace("sectionalPanel","Sectional Panels"), "sheet_thickness") || "");
      fd.append(enfKey,   getLvl(inputKey.replace("levelPanel","Level Panels-").replace("levelPlatform","Level Platform").replace("sectionalPanel","Sectional Panels"), "re_enforcement") || "");
      fd.append(pcKey,    getLvl(inputKey.replace("levelPanel","Level Panels-").replace("levelPlatform","Level Platform").replace("sectionalPanel","Sectional Panels"), "pc_synthetic") || "");
      fd.append(colKey,   getLvl(inputKey.replace("levelPanel","Level Panels-").replace("levelPlatform","Level Platform").replace("sectionalPanel","Sectional Panels"), "colour_shade") || "");
      fd.append(remKey,   getLvl(inputKey.replace("levelPanel","Level Panels-").replace("levelPlatform","Level Platform").replace("sectionalPanel","Sectional Panels"), "remarks") || "");
    });

    // ── Slotted Angle Partition ───────────────────────────────
    // PHP: $input['slottedPartitionCP'], $input['slottedPartitionType'],
    //      $input['slottedPartitionColour'], $input['slottedPartitionThickness'],
    //      $input['claddingDoorPerforation1'], $input['slottedPartitionRemark']
    //      similar for TP
    const partCP = partitions["CP"] || {};
    fd.append("slottedPartitionCP",        "CP");
    fd.append("slottedPartitionType",      partCP.partition_type  || "");
    fd.append("slottedPartitionColour",    partCP.colour          || "");
    fd.append("slottedPartitionThickness", partCP.sheet_thickness || "");
    fd.append("claddingDoorPerforation1",  partCP.perforation     || "");
    fd.append("slottedPartitionRemark",    partCP.remark          || "");

    const partTP = partitions["TP"] || {};
    fd.append("slottedPartitionTP",          "TP");
    fd.append("tppartitions",                partTP.partition_type  || "");
    fd.append("slottedPartitionTPColour",    partTP.colour          || "");
    fd.append("slottedPartitionTPThickness", partTP.sheet_thickness || "");
    fd.append("claddingDoorPerforation11",   partTP.perforation     || "");
    fd.append("slottedPartitionTPRemark",    partTP.remark          || "");

    // ── Slotted Angles PD ─────────────────────────────────────
    // UPDATE: $input['slottedID'][], $input['slRow1'][], $input['slSize1'][],
    //         $input['slThikness1'][], $input['slColourShade1'][]
    // INSERT: $input['slRow'][], $input['slSize'][], $input['slThikness'][], $input['slColourShade'][]
    if (buttonAction === "update") {
      const existingSA = slotted.filter(r => r.id);
      const newSA      = slotted.filter(r => !r.id);

      existingSA.forEach(row => {
        fd.append("slottedID[]",      row.id      || "");
        fd.append("slRow1[]",         row.angle   || "");
        fd.append("slSize1[]",        row.size    || "");
        fd.append("slThikness1[]",    row.details || "");
        fd.append("slColourShade1[]", row.colour  || "");
      });

      newSA.forEach(row => {
        fd.append("slRow[]",         row.angle   || "");
        fd.append("slSize[]",        row.size    || "");
        fd.append("slThikness[]",    row.details || "");
        fd.append("slColourShade[]", row.colour  || "");
      });
    } else {
      slotted.forEach(row => {
        fd.append("slRow[]",         row.angle   || "");
        fd.append("slSize[]",        row.size    || "");
        fd.append("slThikness[]",    row.details || "");
        fd.append("slColourShade[]", row.colour  || "");
      });
    }

    // ── Site Measurement Info ─────────────────────────────────
    // PHP inserts/updates rows by matching DESCRIPTION field
    //   Row 1: $measurementTaken, $siteMeasurementTaken, $siteMeasurementTakenRemark
    //   Row 2: $sitemeasuermentTakenBy, $measurementTakenBy, $measurementTakenByRemark
    //   Row 3: $customerApprovalLayout, $customerApproval, $customerApprovalRemark
    fd.append("measurementTaken",           "Actual Site Measurements Taken");
    fd.append("siteMeasurementTaken",       siteMeas.measTaken       || "");
    fd.append("siteMeasurementTakenRemark", siteMeas.measTakenRemark || "");

    fd.append("sitemeasuermentTakenBy",     "Measurements Taken By");
    fd.append("measurementTakenBy",         siteMeas.takenBy         || "");
    fd.append("measurementTakenByRemark",   siteMeas.takenByRemark   || "");

    fd.append("customerApprovalLayout",     "Approval of Layout from Customer Required");
    fd.append("customerApproval",           siteMeas.approval        || "");
    fd.append("customerApprovalRemark",     siteMeas.approvalRemark  || "");

    // ── File Uploads ──────────────────────────────────────────
    // PHP: $_FILES['Uploadfile'] + $_POST['project_data'][]
    const hasFiles = docs.some(d => d.file);
    if (hasFiles) {
      docs.forEach((doc, i) => {
        fd.append("project_data[]", doc.name || "");
        if (doc.file) {
          fd.append("Uploadfile[]",     doc.file, doc.file.name);
        }
      });
    }

    return fd;
  };

  // ══════════════════════════════════════════════
  // Save / Update handler
  // ══════════════════════════════════════════════
  const handleSave = async () => {
    setSaving(true);
    try {
      // Both save and update go to the same InsertMssApi.php endpoint.
      // The action field ("save" or "update") controls which branch PHP executes.
      const endpoint = SAVE_API;
      const fd       = buildFormData();

      // Debug — visible in browser console
      console.group(`📤 ${buttonAction.toUpperCase()} → ${endpoint}`);
      for (const [k, v] of fd.entries()) {
        if (!(v instanceof File)) console.log(`  ${k} =`, v);
        else console.log(`  ${k} = [File: ${v.name}]`);
      }
      console.groupEnd();

      const res  = await fetch(endpoint, {
        method: "POST",
        body:   fd,     // multipart/form-data — DO NOT set Content-Type manually
      });

      const text = await res.text();
      console.log("📥 Raw response:", text);

      let json;
      try {
        json = JSON.parse(text);
      } catch {
        showToast(`Server error: ${text.substring(0, 180)}`, "error");
        return;
      }

      if (json.status === "success" || json.status === "partial") {
        showToast(
          buttonAction === "update"
            ? "✓ MSS Data Sheet updated successfully!"
            : "✓ MSS Data Sheet saved successfully!",
          "success"
        );
        if (json.errors?.length) {
          console.warn("Partial errors:", json.errors);
          showToast(`Saved with ${json.errors.length} warning(s). Check console.`, "info");
        }
        // After a successful save, switch to update mode
        if (buttonAction === "save") setButtonAction("update");
      } else {
        showToast(`Failed: ${json.message || "Unknown error"}`, "error");
        console.error("❌ API error:", json);
      }
    } catch (err) {
      showToast(`Network error: ${err.message}`, "error");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const isUpdate = buttonAction === "update";
  const btnClass = `btn-save ${isUpdate ? "btn-save-update" : "btn-save-save"}`;
  const btnLabel = saving
    ? (isUpdate ? "Updating…" : "Saving…")
    : isUpdate
      ? "✏️ Update Data Sheet"
      : "💾 Save Data Sheet";

  // ══════════════════════════════════════════════
  // LOADING SCREEN
  // ══════════════════════════════════════════════
  if (loading) {
    return (
      <div className="loader-wrap">
        <div className="spinner" />
        <p style={{ color:"var(--muted)", fontFamily:"'DM Sans',sans-serif", fontWeight:500 }}>
          Loading MSS Data Sheet…
        </p>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════
  return (
    <div className="mss-wrap fade-up">

      {/* ─── HEADER ─── */}
      <div className="mss-header">
        <div className="mss-header-left">
          <div className="mss-header-icon">📐</div>
          <div>
            <div className="mss-header-title">
              {project.file_name || "MSS Project Data Sheet"}
            </div>
            <div className="mss-header-meta">
              {[
                ["#",  "File ID",  fileId],
                ["🏢", "Customer", project.customer_name],
                ["📦", "Product",  project.product_type],
              ].map(([icon, lbl, val]) => (
                <span key={lbl} className="mss-header-chip">
                  {icon} <strong>{lbl}:&nbsp;</strong>{val || "—"}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="mss-header-right">
          <button className="btn-ghost"
            onClick={() => setTheme(t => t === "light" ? "dark" : "light")}>
            {theme === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>
          <button className="btn-ghost" onClick={() => window.history.back()}>← Back</button>
        </div>
      </div>

      {error && <div className="err-banner">⚠️ {error}</div>}

      {/* ─── TABS ─── */}
      <div className="mss-tabs">
        {[
          { key:"project", icon:"📋", label:"Project Details" },
          { key:"po",      icon:"🧾", label:"PO Details"      },
        ].map(t => (
          <button key={t.key}
            className={`mss-tab${tab === t.key ? " active" : ""}`}
            onClick={() => setTab(t.key)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="mss-tab-content">

        {/* ══════════════════════════════════
            PROJECT TAB
        ══════════════════════════════════ */}
        {tab === "project" && (
          <div className="fade-up">

            {/* ── 1. PROJECT DETAILS ── */}
            <Block title="Project Details">
              <div className="row">
                {[
                  ["File No.",         project.file_name,        "file_name"],
                  ["Product Type",     project.product_type,     "product_type"],
                  ["Client Name",      project.customer_name,    "customer_name"],
                  ["Shipping Address", project.shipping_address, "shipping_address"],
                  ["Contact Person",   project.contact_person,   "contact_person"],
                  ["Contact Phone",    project.contact_number,   "contact_number"],
                ].map(([lbl, val, key]) => (
                  <div key={key} className="col-3">
                    <div className="info-row">
                      <div className="info-label">{lbl}</div>
                      <div className="info-value">{fmt(val)}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="row" style={{ marginTop:16 }}>
                <div className="col-6">
                  <span className="sec-lbl">Customer Ambassador</span>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                    {["AGP","SVJ","KBP","OTHER"].map(opt => (
                      <Radio key={opt} name="ambassador" value={opt}
                        checked={project.customer_ambassador === opt}
                        onChange={() => updProject("customer_ambassador", opt)} label={opt} />
                    ))}
                  </div>
                  {project.customer_ambassador === "OTHER" && (
                    <div style={{ marginTop:8 }}>
                      <FInput label="Mention Name"
                        value={project.ambassador_other || ""}
                        onChange={e => updProject("ambassador_other", e.target.value)} />
                    </div>
                  )}
                </div>
                <div className="col-6">
                  <span className="sec-lbl">Tax Documents</span>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                    {["SEZ","GST","OTHER"].map(opt => (
                      <Radio key={opt} name="taxdoc" value={opt}
                        checked={project.transport_document === opt}
                        onChange={() => updProject("transport_document", opt)} label={opt} />
                    ))}
                  </div>
                  {project.transport_document === "OTHER" && (
                    <div style={{ marginTop:8 }}>
                      <FInput label="Mention Document"
                        value={project.transport_document_other || ""}
                        onChange={e => updProject("transport_document_other", e.target.value)} />
                    </div>
                  )}
                </div>
              </div>
            </Block>

            {/* ── 2. SITE DATES + INSTRUCTIONS ── */}
            <div className="row">
              <div style={{ flex:"0 0 calc(58% - 8px)", minWidth:0 }}>
                <Block title="Site Date Details">
                  <div className="tbl-scroll">
                    <table className="mss-table">
                      <thead>
                        <tr><th></th><th>Dates</th><th></th><th>Dates</th></tr>
                      </thead>
                      <tbody>
                        {[
                          ["Site Form Issued",      "siteFormIssuedDate",     "Foundation date",                    "foundationDate"],
                          ["Dispatch-Foundation",   "dispatchFoundationDate", "Primary Info – Long-lead & Assy BD", "primaryInfoDate"],
                          ["1st Dispatch",          "firstDispatchDate",      "Design Date",                        "completedFileDate"],
                          ["Last Dispatch",         "lastDispatchDate",       "Committed date of handover",         "commitedDispatchDate"],
                        ].map(([l1,k1,l2,k2]) => (
                          <tr key={k1}>
                            <td style={{ fontWeight:500, minWidth:120, fontSize:".82rem" }}>{l1}</td>
                            <td><input type="date" value={siteDates[k1]||""} onChange={e=>setSiteDates(p=>({...p,[k1]:e.target.value}))} /></td>
                            <td style={{ fontSize:".82rem", minWidth:140 }}>{l2}</td>
                            <td><input type="date" value={siteDates[k2]||""} onChange={e=>setSiteDates(p=>({...p,[k2]:e.target.value}))} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Block>
              </div>

              <div style={{ flex:"0 0 calc(42% - 8px)", minWidth:0 }}>
                <Block title="Instructions">
                  {[
                    ["Any Special Official Requirement?",                                          "special_official_requirement"],
                    ["Special Instructions (if any) – staircase, corridors, beams, doors etc.",   "special_instructions"],
                    ["Special Requirements (if any) – Wire Mesh Doors, Tubular CP/TP etc.",       "special_requirements"],
                    ["Special Instruction regarding aesthetics / finishing etc.",                   "aesthetics_info"],
                  ].map(([lbl, key]) => (
                    <div key={key}>
                      <label className="fl-label">{lbl}</label>
                      <textarea className="fl-textarea"
                        value={project[key] || ""}
                        onChange={e => updProject(key, e.target.value)} />
                    </div>
                  ))}
                </Block>
              </div>
            </div>

            {/* ── 3. DIMENSION INFO ── */}
            <Block title="Dimension Info">
              <p style={{ fontSize:".85rem", fontWeight:600, marginBottom:10 }}>
                Overall Dimension Related Information:
              </p>
              <div className="tbl-scroll">
                <table className="mss-table">
                  <thead>
                    <tr>
                      <th style={{ width:44 }}>
                        <button className="btn-round" style={{ margin:"0 auto" }} onClick={addDim}>+</button>
                      </th>
                      <th>Location</th><th>Length (mm)</th><th>Width (mm)</th>
                      <th>Total Height From Ground (mm)</th><th>Superstructure Height (mm)</th>
                      <th>Qty</th><th>Levels</th><th>No. of bays</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dims.map((row, i) => (
                      <tr key={i}>
                        <td style={{ textAlign:"center" }}>
                          {i > 0 && (
                            <button className="btn-round"
                              style={{ background:"#dc2626", margin:"0 auto 4px" }}
                              onClick={() => removeDim(i)}>−</button>
                          )}
                        </td>
                        <td>
                          <input type="text" value={row.location}
                            onChange={e => updDim(i,"location",e.target.value)} placeholder="Type/Location" />
                        </td>
                        {["length","width","height","super_structure","quantity","levels","bays"].map(k => (
                          <td key={k}>
                            <input type="text" value={row[k]||""}
                              onChange={e => updDim(i,k,e.target.value)} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Fix Unit / ME Unit */}
              <div className="row" style={{ marginTop:18 }}>
                <div className="col-6">
                  <span className="sec-lbl">Fix Unit</span>
                  {[
                    ["fixOPEN","OPEN"],["fixCPSheet","CP Sheet"],["fixENDCovers","END Covers"],
                    ["fixDOORFrame","DOOR Frame"],["fixOTHER","OTHER"],
                  ].map(([k,lbl]) => (
                    <Chk key={k} checked={!!load[k]}
                      onChange={e=>updLoad(k,e.target.checked)} label={lbl} />
                  ))}
                  {load.fixOTHER && (
                    <div style={{ marginTop:6 }}>
                      <FInput label="Mention Other Fix Unit"
                        value={load.fixOtherVal||""} onChange={e=>updLoad("fixOtherVal",e.target.value)} />
                    </div>
                  )}
                </div>
                <div className="col-6">
                  <span className="sec-lbl">ME Unit</span>
                  {[
                    ["meOPEN","OPEN"],["meCPSheet","CP Sheet"],["meENDCovers","END Covers"],
                    ["meDOORFrame","DOOR Frame"],["meOTHER","OTHER"],
                  ].map(([k,lbl]) => (
                    <Chk key={k} checked={!!load[k]}
                      onChange={e=>updLoad(k,e.target.checked)} label={lbl} />
                  ))}
                  {load.meOTHER && (
                    <div style={{ marginTop:6 }}>
                      <FInput label="Mention Other ME Unit"
                        value={load.meOtherVal||""} onChange={e=>updLoad("meOtherVal",e.target.value)} />
                    </div>
                  )}
                </div>
              </div>

              {/* Load Details */}
              <span className="sec-lbl" style={{ marginTop:16 }}>Load Details</span>
              <div className="row">
                <div className="col-3">
                  <FInput label="Load Carrying Capacity of Rack (kg)"
                    value={load.capacity||""} onChange={e=>updLoad("capacity",e.target.value)} />
                </div>
                <div className="col-3">
                  <FInput label="Load Per Pallet (kg)"
                    value={load.perPallet||""} onChange={e=>updLoad("perPallet",e.target.value)} />
                </div>
                <div className="col-3">
                  <FInput label="Material to be Stored"
                    value={load.material||""} onChange={e=>updLoad("material",e.target.value)} />
                </div>
              </div>
            </Block>

            {/* ── 4. TECHNICAL & MATERIAL CONSIDERATION ── */}
            <Block title="Technical & Material Consideration from Marketing">
              <span className="sec-lbl">Foundation Related Information</span>
              <div className="row" style={{ marginBottom:14 }}>
                <div className="col-3">
                  <FInput label="Site Floor Number"
                    value={fnd.site_floor_number||""} onChange={e=>updFnd("site_floor_number",e.target.value)} />
                </div>
                <div className="col-6" style={{ alignSelf:"center" }}>
                  <span className="fl-label" style={{ marginBottom:6 }}>Foundation:</span>
                  <Radio name="foundation" value="Flush to floor"
                    checked={fnd.foundation==="Flush to floor"}
                    onChange={()=>updFnd("foundation","Flush to floor")} label="Flush to floor" />
                  <Radio name="foundation" value="Above floor"
                    checked={fnd.foundation==="Above floor"}
                    onChange={()=>updFnd("foundation","Above floor")} label="Above floor" />
                </div>
              </div>

              <div className="row">
                <div className="col-3">
                  <span className="sec-lbl">Foundation Type</span>
                  <Chk checked={!!fnd.flanged_wheel}   onChange={e=>updFnd("flanged_wheel",e.target.checked)}   label="Rail Section (30 lbs) & Flanged Wheel Rails Only" />
                  <Chk checked={!!fnd.rail_section}    onChange={e=>updFnd("rail_section",e.target.checked)}    label="Rail Section & All Rails" />
                  {fnd.rail_section && (
                    <div style={{ marginTop:4 }}>
                      <FInput label="Mention LB" value={fnd.rail_lb||""} onChange={e=>updFnd("rail_lb",e.target.value)} />
                    </div>
                  )}
                  <Chk checked={!!fnd.foundation_flat} onChange={e=>updFnd("foundation_flat",e.target.checked)} label="Foundation Flat & All Rails" />
                  {fnd.foundation_flat && (
                    <div style={{ marginTop:4 }}>
                      <FInput label="Mention Flat" value={fnd.flat_detail||""} onChange={e=>updFnd("flat_detail",e.target.value)} />
                    </div>
                  )}
                </div>
                <div className="col-3">
                  <span className="sec-lbl">Foundation Material</span>
                  <Chk checked={!!fnd.material_ms}    onChange={e=>updFnd("material_ms",e.target.checked)}    label="MS" />
                  <Chk checked={!!fnd.material_ss}    onChange={e=>updFnd("material_ss",e.target.checked)}    label="SS" />
                  <Chk checked={!!fnd.material_other} onChange={e=>updFnd("material_other",e.target.checked)} label="OTHER" />
                  {fnd.material_other && (
                    <div style={{ marginTop:4 }}>
                      <FInput label="Mention Other Material" value={fnd.material_other_value||""} onChange={e=>updFnd("material_other_value",e.target.value)} />
                    </div>
                  )}
                </div>
                <div className="col-3">
                  <span className="sec-lbl">Floor Type</span>
                  {["PCC","Kota","Tiles","Green Field","OTHER"].map(v => (
                    <Radio key={v} name="floorType" value={v}
                      checked={fnd.floor_type===v}
                      onChange={()=>updFnd("floor_type",v)} label={v} />
                  ))}
                  {fnd.floor_type==="OTHER" && (
                    <div style={{ marginTop:4 }}>
                      <FInput label="Mention Other Floor Type"
                        value={fnd.floor_type_other||""} onChange={e=>updFnd("floor_type_other",e.target.value)} />
                    </div>
                  )}
                </div>
                <div className="col-3">
                  <span className="sec-lbl">Drive</span>
                  <Radio name="drive" value="Single Twin"
                    checked={fnd.drive_type==="Single Twin"}
                    onChange={()=>updFnd("drive_type","Single Twin")} label="Single Twin" />
                  <Radio name="drive" value="Double Twin"
                    checked={fnd.drive_type==="Double Twin"}
                    onChange={()=>updFnd("drive_type","Double Twin")} label="Double Twin" />
                </div>
              </div>

              {/* Trolley Table */}
              <span className="sec-lbl" style={{ marginTop:18 }}>Technical and Material Consideration</span>
              <div className="tbl-scroll">
                <table className="mss-table">
                  <thead>
                    <tr>
                      <th>Type</th><th>Section Type</th>
                      <th>Size (e.g. 100x50)</th><th>Colour Shade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trolleys.length > 0 ? trolleys.map((t, i) => (
                      <tr key={i}>
                        <td><input type="text" value={t.type||""}
                          onChange={e=>setTrolleys(r=>r.map((x,idx)=>idx===i?{...x,type:e.target.value}:x))} /></td>
                        <td>
                          <Radio name={`sec_${i}`} value="ISMC"
                            checked={t.section==="ISMC"}
                            onChange={()=>setTrolleys(r=>r.map((x,idx)=>idx===i?{...x,section:"ISMC"}:x))} label="ISMC" />
                          <Radio name={`sec_${i}`} value="MSTube"
                            checked={t.section==="MSTube"}
                            onChange={()=>setTrolleys(r=>r.map((x,idx)=>idx===i?{...x,section:"MSTube"}:x))} label="MSTube" />
                        </td>
                        <td><input type="text" value={t.size||""}
                          onChange={e=>setTrolleys(r=>r.map((x,idx)=>idx===i?{...x,size:e.target.value}:x))} /></td>
                        <td><input type="text" value={t.colour||""}
                          onChange={e=>setTrolleys(r=>r.map((x,idx)=>idx===i?{...x,colour:e.target.value}:x))} /></td>
                      </tr>
                    )) : (
                      <tr><td colSpan={4} style={{ textAlign:"center", color:"var(--muted)" }}>No trolley data</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Bearing Table */}
              <div style={{ marginTop:16, maxWidth:600 }}>
                <table className="mss-table">
                  <thead>
                    <tr><th>Bearing</th><th>Tick</th><th>Particulars (e.g. UCP-214…)</th></tr>
                  </thead>
                  <tbody>
                    {[["UCP","ucp"],["Pedestal Type","pedestal"]].map(([label, k]) => (
                      <tr key={k}>
                        <td className="row-lbl">{label}</td>
                        <td style={{ textAlign:"center" }}>
                          <input type="checkbox"
                            checked={!!bearing[`${k}_tick`]}
                            onChange={e=>updBearing(`${k}_tick`,e.target.checked)} />
                        </td>
                        <td>
                          <input type="text"
                            value={bearing[`${k}_particulars`]||""}
                            onChange={e=>updBearing(`${k}_particulars`,e.target.value)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cladding Table */}
              <span className="sec-lbl" style={{ marginTop:20 }}>Cladding</span>
              <div className="tbl-scroll">
                <table className="mss-table">
                  <thead>
                    <tr>
                      <th>Cladding</th>
                      {claddingHdrs.map((h,i) => <th key={i}>{h}</th>)}
                      <th>Gauge (default 1mm)</th>
                      <th>Perforation Yes/No</th>
                      <th>Colour Shade / Make</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CLADDING_PANELS.map(({ label }) => {
                      const c = cladding[label] || {};
                      return (
                        <tr key={label}>
                          <td className="row-lbl" style={{ minWidth:130 }}>{label}</td>
                          {(c.dynamic_data||[]).map((dd, i) => (
                            <td key={i}>
                              <div style={{ display:"flex", gap:8 }}>
                                <Radio name={`${label}_dyn_${i}`} value="Yes"
                                  checked={dd.value==="Yes"}
                                  onChange={()=>setCladding(p=>({...p,[label]:{...p[label],dynamic_data:p[label].dynamic_data.map((x,xi)=>xi===i?{...x,value:"Yes"}:x)}}))} label="Yes" />
                                <Radio name={`${label}_dyn_${i}`} value="No"
                                  checked={dd.value==="No"}
                                  onChange={()=>setCladding(p=>({...p,[label]:{...p[label],dynamic_data:p[label].dynamic_data.map((x,xi)=>xi===i?{...x,value:"No"}:x)}}))} label="No" />
                              </div>
                            </td>
                          ))}
                          <td><input type="text" value={c.gauge||""}
                            onChange={e=>updCladding(label,"gauge",e.target.value)} /></td>
                          <td>
                            <div style={{ display:"flex", gap:8 }}>
                              <Radio name={`${label}_perf`} value="Yes"
                                checked={c.perforation==="Yes"}
                                onChange={()=>updCladding(label,"perforation","Yes")} label="Yes" />
                              <Radio name={`${label}_perf`} value="No"
                                checked={c.perforation==="No"}
                                onChange={()=>updCladding(label,"perforation","No")} label="No" />
                            </div>
                          </td>
                          <td><input type="text" value={c.colour_shade||""}
                            onChange={e=>updCladding(label,"colour_shade",e.target.value)} /></td>
                          <td><input type="text" value={c.remarks||""}
                            onChange={e=>updCladding(label,"remarks",e.target.value)} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Block>

            {/* ── 5. SPECIFICATION FOR SUPERSTRUCTURE ── */}
            <Block title="Specification for Superstructure">
              {/* Loading Levels */}
              <div className="tbl-scroll" style={{ marginBottom:20 }}>
                <table className="mss-table">
                  <thead>
                    <tr>
                      <th>Loading Levels</th><th>Abbr.</th>
                      <th>Sheet Thickness (mm)</th><th>Re-Enforcement</th>
                      <th colSpan={2}>PC / Synthetic Enamel</th>
                      <th>Color Shade</th><th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {LOADING_LEVEL_KEYS.map(({ label, apiKey }) => (
                      <tr key={apiKey}>
                        <td className="row-lbl">{label}</td>
                        <td style={{ textAlign:"center", fontWeight:600 }}>
                          { apiKey==="Sectional Panels" ? "SP" : apiKey==="Level Panels-30mm" ? "LP-30" : apiKey==="Level Panels-45mm" ? "LP-45" : "LPT" }
                        </td>
                        <td><input type="text" value={getLvl(apiKey,"sheet_thickness")}
                          onChange={e=>setLvl(apiKey,"sheet_thickness",e.target.value)} /></td>
                        <td><input type="text" value={getLvl(apiKey,"re_enforcement")}
                          onChange={e=>setLvl(apiKey,"re_enforcement",e.target.value)} /></td>
                        <td>
                          <Radio name={`pc_${apiKey}`} value="PC"
                            checked={getLvl(apiKey,"pc_synthetic")==="PC"}
                            onChange={()=>setLvl(apiKey,"pc_synthetic","PC")} label="PC" />
                        </td>
                        <td>
                          <Radio name={`pc_${apiKey}`} value="Synthetic Enamel"
                            checked={getLvl(apiKey,"pc_synthetic")==="Synthetic Enamel"}
                            onChange={()=>setLvl(apiKey,"pc_synthetic","Synthetic Enamel")} label="Synthetic Enamel" />
                        </td>
                        <td><input type="text" value={getLvl(apiKey,"colour_shade")}
                          onChange={e=>setLvl(apiKey,"colour_shade",e.target.value)} /></td>
                        <td><input type="text" value={getLvl(apiKey,"remarks")}
                          onChange={e=>setLvl(apiKey,"remarks",e.target.value)} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Partitions */}
              <div className="tbl-scroll" style={{ marginBottom:20 }}>
                <table className="mss-table">
                  <thead>
                    <tr>
                      <th>Partitions</th><th>(Full / Partial)</th>
                      <th>Colour Shade / Make</th>
                      <th>Sheet Thickness (default 0.65mm)</th>
                      <th colSpan={2}>Perforation Yes/No</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {["CP","TP"].map(pt => {
                      const p = partitions[pt] || {};
                      return (
                        <tr key={pt}>
                          <td className="row-lbl">{pt}</td>
                          <td>
                            <Radio name={`pt_${pt}`} value="Full"
                              checked={p.partition_type==="Full"}
                              onChange={()=>setPartitions(prev=>({...prev,[pt]:{...prev[pt],partition_type:"Full"}}))} label="Full" />
                            <Radio name={`pt_${pt}`} value="Partial"
                              checked={p.partition_type==="Partial"}
                              onChange={()=>setPartitions(prev=>({...prev,[pt]:{...prev[pt],partition_type:"Partial"}}))} label="Partial" />
                          </td>
                          <td><input type="text" value={p.colour||""}
                            onChange={e=>setPartitions(prev=>({...prev,[pt]:{...prev[pt],colour:e.target.value}}))} /></td>
                          <td><input type="text" value={p.sheet_thickness||""}
                            onChange={e=>setPartitions(prev=>({...prev,[pt]:{...prev[pt],sheet_thickness:e.target.value}}))} /></td>
                          <td>
                            <Radio name={`pf_${pt}`} value="Yes"
                              checked={p.perforation==="Yes"}
                              onChange={()=>setPartitions(prev=>({...prev,[pt]:{...prev[pt],perforation:"Yes"}}))} label="Yes" />
                          </td>
                          <td>
                            <Radio name={`pf_${pt}`} value="No"
                              checked={p.perforation==="No"}
                              onChange={()=>setPartitions(prev=>({...prev,[pt]:{...prev[pt],perforation:"No"}}))} label="No" />
                          </td>
                          <td><input type="text" value={p.remark||""}
                            onChange={e=>setPartitions(prev=>({...prev,[pt]:{...prev[pt],remark:e.target.value}}))} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Slotted Angles */}
              <div className="sa-wrap">
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                  <button className="btn-round" onClick={addSlotted}>+</button>
                  <span style={{ fontWeight:700, fontSize:".85rem" }}>Slotted Angles</span>
                </div>
                {slotted.map((row, i) => (
                  <div key={i} className="sa-row">
                    {i > 0 && (
                      <button className="btn-round" style={{ background:"#dc2626" }} onClick={() => removeSlotted(i)}>−</button>
                    )}
                    <input placeholder="Angle (40x40 / 60x40 / Other)" value={row.angle||""}   onChange={e=>updSlotted(i,"angle",e.target.value)} />
                    <input placeholder="Size"                           value={row.size||""}    onChange={e=>updSlotted(i,"size",e.target.value)} />
                    <input placeholder="Details (Thickness, holes etc)" value={row.details||""} onChange={e=>updSlotted(i,"details",e.target.value)} />
                    <input placeholder="Colour shade"                   value={row.colour||""}  onChange={e=>updSlotted(i,"colour",e.target.value)} />
                  </div>
                ))}
              </div>
            </Block>

            {/* ── 6. MATERIAL ESTIMATION ── */}
            <Block title="Material Estimation (Mktg)">
              <div className="tbl-scroll">
                <table className="mss-table">
                  <thead>
                    <tr>
                      <th style={{ width:180 }}>Material</th>
                      <th>Qty / Details</th>
                      <th>Weight Unit</th>
                      <th colSpan={2}>Cost In Rupees</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MAT_LABELS.map(m => {
                      const me = matEst[m.key] || {};
                      return (
                        <React.Fragment key={m.key}>
                          {m.hasEXT && (
                            <tr>
                              <td></td>
                              <td>
                                <span style={{ fontSize:".74rem", fontWeight:700, marginRight:24 }}>EXT</span>
                                <span style={{ fontSize:".74rem", fontWeight:700 }}>INT</span>
                              </td>
                              <td></td>
                              <td style={{ fontSize:".74rem", fontWeight:700 }}>EXT</td>
                              <td style={{ fontSize:".74rem", fontWeight:700 }}>INT</td>
                            </tr>
                          )}
                          <tr>
                            <td className="row-lbl">{m.label}</td>
                            <td>
                              {m.hasEXT ? (
                                <div style={{ display:"flex", gap:8 }}>
                                  <input type="text" value={me.qtyEXT||""} onChange={e=>updMatEst(m.key,"qtyEXT",e.target.value)} placeholder="EXT" />
                                  <input type="text" value={me.qtyINT||""} onChange={e=>updMatEst(m.key,"qtyINT",e.target.value)} placeholder="INT" />
                                </div>
                              ) : (
                                <input type="text" value={me.qty||""} onChange={e=>updMatEst(m.key,"qty",e.target.value)} />
                              )}
                            </td>
                            <td style={{ background:"var(--header-bg)", textAlign:"center",
                              fontWeight:600, fontSize:".8rem", color:"var(--muted)" }}>
                              {m.unit}
                            </td>
                            <td>
                              {m.hasEXT ? (
                                <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                                  <span>₹</span>
                                  <input type="text" value={me.costEXT||""} onChange={e=>updMatEst(m.key,"costEXT",e.target.value)} style={{ width:70 }} />
                                </div>
                              ) : (
                                <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                                  <span>₹</span>
                                  <input type="text" value={me.cost||""} onChange={e=>updMatEst(m.key,"cost",e.target.value)} />
                                </div>
                              )}
                            </td>
                            {m.hasEXT ? (
                              <td>
                                <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                                  <span>₹</span>
                                  <input type="text" value={me.costINT||""} onChange={e=>updMatEst(m.key,"costINT",e.target.value)} style={{ width:70 }} />
                                </div>
                              </td>
                            ) : <td></td>}
                          </tr>
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Block>

            {/* ── 7. SITE MEASUREMENTS ── */}
            <Block title="Site Measurements Info">
              <div className="tbl-scroll" style={{ marginBottom:20 }}>
                <table className="mss-table">
                  <thead>
                    <tr>
                      <th style={{ width:"35%" }}></th>
                      <th style={{ width:"35%" }}></th>
                      <th>Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight:500 }}>Actual Site Measurements Taken?</td>
                      <td>
                        <Radio name="measTaken" value="Yes" checked={siteMeas.measTaken==="Yes"} onChange={()=>updSiteMeas("measTaken","Yes")} label="Yes" />
                        <Radio name="measTaken" value="No"  checked={siteMeas.measTaken==="No"}  onChange={()=>updSiteMeas("measTaken","No")}  label="No" />
                      </td>
                      <td><input type="text" value={siteMeas.measTakenRemark||""} onChange={e=>updSiteMeas("measTakenRemark",e.target.value)} /></td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight:500 }}>Measurements Taken By</td>
                      <td><input type="text" value={siteMeas.takenBy||""} onChange={e=>updSiteMeas("takenBy",e.target.value)} /></td>
                      <td><input type="text" value={siteMeas.takenByRemark||""} onChange={e=>updSiteMeas("takenByRemark",e.target.value)} /></td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight:500 }}>Approval of Layout from Customer Required?</td>
                      <td>
                        <Radio name="approval" value="Yes" checked={siteMeas.approval==="Yes"} onChange={()=>updSiteMeas("approval","Yes")} label="Yes" />
                        <Radio name="approval" value="No"  checked={siteMeas.approval==="No"}  onChange={()=>updSiteMeas("approval","No")}  label="No" />
                      </td>
                      <td><input type="text" value={siteMeas.approvalRemark||""} onChange={e=>updSiteMeas("approvalRemark",e.target.value)} /></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Documents */}
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                <span style={{ fontWeight:600, fontSize:".85rem" }}>Documents Making Part Of Data-sheet</span>
                <button className="btn-round" onClick={addDoc}>+</button>
              </div>
              {docs.map((doc, i) => (
                <div key={i} style={{ display:"flex", gap:12, marginBottom:10, alignItems:"center" }}>
                  <input
                    type="text"
                    placeholder="Enter Document Name"
                    value={doc.name}
                    onChange={e => setDocs(r => r.map((x,idx) => idx===i ? {...x, name:e.target.value} : x))}
                    style={{ flex:1, border:"none", borderBottom:"1.5px solid var(--border)",
                      background:"transparent", outline:"none", fontSize:".85rem",
                      color:"var(--text)", padding:"4px 0", fontFamily:"'DM Sans',sans-serif" }}
                  />
                  <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", flexShrink:0 }}>
                    <span style={{ background:"transparent", border:"1px solid var(--border)",
                      borderRadius:6, padding:"4px 12px", fontSize:".8rem",
                      color:"var(--text)", cursor:"pointer" }}>
                      Choose File
                    </span>
                    <span style={{ fontSize:".79rem", color:"var(--muted)" }}>
                      {doc.file ? doc.file.name : doc.path ? "Uploaded" : "No file chosen"}
                    </span>
                    <input type="file" style={{ display:"none" }}
                      onChange={e => setDocs(r => r.map((x,idx) => idx===i ? {...x, file:e.target.files[0]} : x))} />
                  </label>
                  {i > 0 && (
                    <button className="btn-round" style={{ background:"#dc2626" }} onClick={() => removeDoc(i)}>−</button>
                  )}
                </div>
              ))}
            </Block>

            {/* ── SAVE / UPDATE BUTTON ── */}
            <div style={{ paddingTop:8 }}>
              <button className={btnClass} onClick={handleSave} disabled={saving}>
                {btnLabel}
              </button>
              <p style={{ textAlign:"center", marginTop:10, fontSize:".78rem", color:"var(--muted)" }}>
                Mode: <strong style={{ color: isUpdate ? "var(--accent2)" : "var(--accent)" }}>
                  {isUpdate ? "UPDATE" : "SAVE"}
                </strong>
                {" — "}POST to InsertMssApi.php with action="{buttonAction}"
              </p>
            </div>

          </div>
        )}

        {/* ══════════════════════════════════
            PO TAB
        ══════════════════════════════════ */}
        {tab === "po" && (
          <div className="fade-up">
            {Object.keys(po).length === 0 ? (
              <div style={{ textAlign:"center", padding:"48px 0", color:"var(--muted)" }}>
                <div style={{ fontSize:"2.5rem", marginBottom:12 }}>🧾</div>
                <p style={{ fontWeight:600 }}>No PO details available</p>
              </div>
            ) : (
              <div className="po-card">
                <div className="po-title">Purchase Order Details</div>
                {[["PO Number", po.po_number], ["PO Date", po.po_date]].map(([k, v]) => (
                  <div key={k} className="po-meta">
                    <strong>{k}: </strong>{fmt(v)}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}