import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  Container, Card, Row, Col, Tabs, Tab,
  Button, Alert, Spinner,
} from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

/* ══════════════════════════════════════════
   API  CONFIG
══════════════════════════════════════════ */
const API_BASE   = "http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/MMSSApi.php";
const BUTTON_API = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/MssButtonApi.php";
const SAVE_API   = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/InsertMssApi.php";
// Both save and update go to the same endpoint; the `action` field ("save"/"update") controls PHP branch

/* ══════════════════════════════════════════
   GLOBAL CSS
══════════════════════════════════════════ */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');

  @keyframes slideIn  { from{transform:translateX(420px);opacity:0} to{transform:translateX(0);opacity:1} }
  @keyframes slideOut { from{transform:translateX(0);opacity:1}     to{transform:translateX(420px);opacity:0} }
  @keyframes fadeUp   { from{opacity:0;transform:translateY(12px)}  to{opacity:1;transform:translateY(0)} }
  @keyframes spin     { to{transform:rotate(360deg)} }

  .ud-root { font-family:'DM Sans',sans-serif; }
  .fade-in  { animation:fadeUp .45s ease both; }

  .ud-info-label { font-size:.72rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--ud-muted);margin-bottom:3px; }
  .ud-info-value { font-size:.94rem;font-weight:500;color:var(--ud-text); }
  .ud-info-value.accent { color:var(--ud-accent);font-weight:600; }

  .ud-tabs .nav-link { font-family:'DM Sans',sans-serif;font-weight:600;font-size:.88rem;color:var(--ud-muted) !important;border:none !important;padding:14px 20px;border-radius:0 !important;transition:color .18s,box-shadow .18s; }
  .ud-tabs .nav-link:hover { color:var(--ud-accent) !important; }
  .ud-tabs .nav-link.active { color:var(--ud-accent) !important;background:transparent !important;box-shadow:inset 0 -3px 0 var(--ud-accent); }
  .ud-tabs { border-bottom:2px solid var(--ud-border) !important;padding:0 24px; }

  .ud-block { background:var(--ud-card);border:1px solid var(--ud-border);border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.05);margin-bottom:20px; }
  .ud-block-header { background:var(--ud-header-bg);border-bottom:1px solid var(--ud-border);padding:10px 20px;display:flex;align-items:center;gap:10px; }
  .ud-block-bar { width:4px;height:18px;border-radius:2px;background:var(--ud-accent);flex-shrink:0; }
  .ud-block-title { font-family:'Syne',sans-serif;font-weight:700;font-size:.82rem;letter-spacing:.1em;text-transform:uppercase;color:var(--ud-accent); }
  .ud-block-body { padding:18px 20px 22px; }

  .ud-date-table { width:100%;border-collapse:collapse; }
  .ud-date-table th { font-size:.72rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--ud-muted);padding:8px 12px;text-align:center;background:var(--ud-header-bg);border-bottom:1px solid var(--ud-border); }
  .ud-date-table td { padding:9px 12px;border-bottom:1px solid var(--ud-border);font-size:.87rem;color:var(--ud-text);text-align:center;vertical-align:middle; }
  .ud-date-table td:first-child { text-align:left;font-weight:500; }
  .ud-date-table tr:last-child td { border-bottom:none; }
  .ud-date-table input[type=date] { border:1px solid var(--ud-border);border-radius:7px;padding:4px 8px;font-size:.82rem;background:var(--ud-bg);color:var(--ud-text);outline:none; }
  .ud-date-table input[type=date]:focus { border-color:var(--ud-accent); }

  .ud-instr-label { font-size:.82rem;font-weight:600;color:var(--ud-text);margin-bottom:5px;display:block;line-height:1.45; }
  .ud-instr-ta { width:100%;border:1px solid var(--ud-border);border-radius:8px;padding:7px 10px;font-size:.84rem;resize:vertical;min-height:50px;background:var(--ud-bg);color:var(--ud-text);outline:none;font-family:'DM Sans',sans-serif;transition:border .15s;margin-bottom:14px; }
  .ud-instr-ta:focus { border-color:var(--ud-accent); }

  .mm-label { font-size:.8rem;font-weight:600;color:var(--ud-accent);margin-bottom:4px;display:block; }
  .mm-input { width:100%;border:none;border-bottom:1.5px solid var(--ud-border);background:transparent;padding:4px 2px;font-size:.88rem;color:var(--ud-text);outline:none;font-family:'DM Sans',sans-serif;transition:border .15s; }
  .mm-input:focus { border-bottom-color:var(--ud-accent); }
  .mm-radio-row { display:flex;align-items:center;gap:7px;font-size:.84rem;color:var(--ud-text);cursor:pointer;margin-bottom:6px; }
  .mm-radio-row input[type=radio], .mm-radio-row input[type=checkbox] { accent-color:var(--ud-accent);width:15px;height:15px;cursor:pointer;flex-shrink:0; }
  .mm-sec-lbl { font-size:.78rem;font-weight:700;color:var(--ud-accent);letter-spacing:.06em;text-transform:uppercase;margin-bottom:8px;display:block; }

  .dim-table { width:100%;border-collapse:collapse; }
  .dim-table th { background:var(--ud-header-bg);border:1px solid var(--ud-border);padding:7px 10px;font-size:.78rem;font-weight:700;color:var(--ud-muted);text-align:center;letter-spacing:.04em; }
  .dim-table td { border:1px solid var(--ud-border);padding:6px 8px;font-size:.84rem;color:var(--ud-text);vertical-align:middle; }
  .dim-table input { width:100%;border:none;background:transparent;font-size:.84rem;color:var(--ud-text);outline:none;text-align:center;font-family:'DM Sans',sans-serif; }

  .mat-table { width:100%;border-collapse:collapse; }
  .mat-table th { background:var(--ud-header-bg);border:1px solid var(--ud-border);padding:7px 10px;font-size:.78rem;font-weight:700;color:var(--ud-muted);text-align:center; }
  .mat-table td { border:1px solid var(--ud-border);padding:7px 10px;font-size:.84rem;color:var(--ud-text);text-align:center;vertical-align:middle; }
  .mat-table td.row-label { font-weight:600;color:var(--ud-accent);background:var(--ud-header-bg);white-space:nowrap;text-align:left; }
  .mat-table input { width:100%;border:none;border-bottom:1px solid var(--ud-border);background:transparent;font-size:.84rem;color:var(--ud-text);outline:none;text-align:center;padding:2px 0;font-family:'DM Sans',sans-serif; }

  .gear-table { width:100%;border-collapse:collapse; }
  .gear-table th { background:var(--ud-header-bg);border:1px solid var(--ud-border);padding:7px 10px;font-size:.77rem;font-weight:700;color:var(--ud-muted);text-align:center; }
  .gear-table td { border:1px solid var(--ud-border);padding:7px 9px;font-size:.84rem;color:var(--ud-text);vertical-align:middle; }
  .gear-table input { width:100%;border:none;background:transparent;outline:none;font-size:.84rem;color:var(--ud-text);font-family:'DM Sans',sans-serif;text-align:center; }

  .bearing-table { width:100%;border-collapse:collapse; }
  .bearing-table th { background:var(--ud-header-bg);border:1px solid var(--ud-border);padding:7px 10px;font-size:.77rem;font-weight:700;color:var(--ud-muted);text-align:center; }
  .bearing-table td { border:1px solid var(--ud-border);padding:7px 9px;font-size:.84rem;color:var(--ud-text);vertical-align:middle;text-align:center; }
  .bearing-table input[type=checkbox] { accent-color:var(--ud-accent);width:15px;height:15px;cursor:pointer; }
  .bearing-table input[type=text] { width:100%;border:none;background:transparent;outline:none;font-size:.84rem;color:var(--ud-text);font-family:'DM Sans',sans-serif; }

  .ud-header-grad      { background:linear-gradient(135deg,#1e3a5f 0%,#2e6db4 60%,#1a9ed9 100%); }
  .ud-header-grad-dark { background:linear-gradient(135deg,#1a1f2e 0%,#2d3a52 100%); }

  .sm-table { width:100%;border-collapse:collapse; }
  .sm-table th { background:var(--ud-header-bg);border:1px solid var(--ud-border);padding:8px 12px;font-size:.78rem;font-weight:700;color:var(--ud-muted); }
  .sm-table td { border:1px solid var(--ud-border);padding:8px 12px;font-size:.85rem;color:var(--ud-text);vertical-align:middle; }
  .sm-table td.q-label { font-weight:500;background:var(--ud-header-bg);text-align:right;white-space:nowrap; }
  .sm-table input[type=text] { width:100%;border:none;border-bottom:1px solid var(--ud-border);background:transparent;outline:none;font-size:.84rem;color:var(--ud-text);font-family:'DM Sans',sans-serif; }

  /* Save / Update button */
  .btn-mmss-save {
    background:linear-gradient(135deg,#1d6fbd 0%,#1a9ed9 100%);
    box-shadow:0 6px 20px rgba(29,111,189,.35);
    border:none;color:#fff;border-radius:10px;padding:13px 50px;
    font-family:'Syne',sans-serif;font-weight:700;font-size:1rem;
    letter-spacing:.04em;cursor:pointer;transition:transform .18s,box-shadow .18s;
  }
  .btn-mmss-save:hover:not(:disabled) { transform:translateY(-2px);box-shadow:0 10px 28px rgba(29,111,189,.45); }

  .btn-mmss-update {
    background:linear-gradient(135deg,#e8560a 0%,#f07030 100%);
    box-shadow:0 6px 20px rgba(232,86,10,.35);
    border:none;color:#fff;border-radius:10px;padding:13px 50px;
    font-family:'Syne',sans-serif;font-weight:700;font-size:1rem;
    letter-spacing:.04em;cursor:pointer;transition:transform .18s,box-shadow .18s;
  }
  .btn-mmss-update:hover:not(:disabled) { transform:translateY(-2px);box-shadow:0 10px 28px rgba(232,86,10,.45); }

  .btn-mmss-save:disabled, .btn-mmss-update:disabled { opacity:.6;cursor:not-allowed;transform:none; }
`;

/* ══════════════════════════════════════════
   MATERIAL ESTIMATION ROWS
   PHP field keys match exactly: foundation1, fabrication, sheet-metal, powder,
   hardware, assembly, manDaysOnSite, siteExpenses, despatchLot, transportation,
   total_Weight, RM_Cost
   Sheet-metal and powder use Ext/Ixt suffix pattern
══════════════════════════════════════════ */
const MAT_LABELS = [
  { key:"foundation1",    label:"Foundation",          unit:"Kgs",   unitKey:"foundationUnit",    qtyKey:"foundationQnty",    costKey:"foundationCost",    hasEXT:false },
  { key:"fabrication",    label:"Fabrication",         unit:"Kgs",   unitKey:"fabricationUnit",   qtyKey:"fabricationQnty",   costKey:"fabricationCost",   hasEXT:false },
  { key:"sheet-metal",    label:"Sheet-Metal",         unit:"Kgs",   unitKey:"sheet-metalUnit",   hasEXT:true  },
  { key:"powder",         label:"Powder",              unit:"Sq ft", unitKey:"powderUnit",         hasEXT:true  },
  { key:"hardware",       label:"Hardware",            unit:"Kgs",   unitKey:"hardwareUnit",      qtyKey:"hardwareQnty",      costKey:"hardwareCost",      hasEXT:false },
  { key:"assembly",       label:"Assembly",            unit:"Kgs",   unitKey:"assemblyUnit",      qtyKey:"assemblyQnty",      costKey:"assemblyCost",      hasEXT:false },
  { key:"manDaysOnSite",  label:"Man-Days on Site",    unit:"Nos",   unitKey:"manDaysOnSiteUnit", qtyKey:"manDaysOnSiteQnty", costKey:"manDaysOnSiteCost", hasEXT:false },
  { key:"siteExpenses",   label:"Site Expenses",       unit:"Rs.",   unitKey:"siteExpensesUnit",  qtyKey:"siteExpensesQnty",  costKey:"siteExpensesCost",  hasEXT:false },
  { key:"despatchLot",    label:"Despatch Lot",        unit:"Nos",   unitKey:"despatchLotsUnit",  qtyKey:"despatchLotQnty",   costKey:"despatchLotCost",   hasEXT:false },
  { key:"transportation", label:"Transportation Cost", unit:"",      unitKey:"transportationUnit",qtyKey:"transportationQnty",costKey:"traspotationCost",  hasEXT:false },
  { key:"total_Weight",   label:"Total Weight (KG)",   unit:"",      unitKey:"totalUnit",         qtyKey:"tolalQnty",         costKey:"totalWeightCost",   hasEXT:false },
  { key:"RM_Cost",        label:"RM Cost",             unit:"",      unitKey:"RMCostUnit",        qtyKey:"RMCostQnty",        costKey:"RMCost",            hasEXT:false },
];

/* ══════════════════════════════════════════
   HELPERS
══════════════════════════════════════════ */
const fmt = (v) => v || "N/A";

const Block = ({ title, children }) => (
  <div className="ud-block">
    <div className="ud-block-header">
      <div className="ud-block-bar" />
      <span className="ud-block-title">{title}</span>
    </div>
    <div className="ud-block-body">{children}</div>
  </div>
);

const UInput = ({ value, onChange, placeholder = "", style = {}, readOnly = false }) => (
  <input className="mm-input" value={value || ""} onChange={onChange}
    placeholder={placeholder} style={style} readOnly={readOnly} />
);

const Radio = ({ name, value, checked, onChange, label }) => (
  <label className="mm-radio-row">
    <input type="radio" name={name} value={value} checked={!!checked} onChange={onChange} />
    {label}
  </label>
);

const Chk = ({ checked, onChange, label }) => (
  <label className="mm-radio-row">
    <input type="checkbox" checked={!!checked} onChange={onChange} />
    {label}
  </label>
);

const InfoRow = ({ label, value }) => (
  <Col xs={12} md={4} className="mb-3">
    <div style={{ padding:"10px 0", borderBottom:"1px solid var(--ud-border)" }}>
      <div className="ud-info-label">{label}</div>
      <div className="ud-info-value accent">{fmt(value)}</div>
    </div>
  </Col>
);

const showToast = (msg, type = "info") => {
  const d = document.createElement("div");
  const bg = type === "success" ? "#16a34a" : type === "error" ? "#dc2626" : "#2563eb";
  d.style.cssText = `position:fixed;top:22px;right:22px;padding:13px 22px;background:${bg};color:#fff;border-radius:10px;box-shadow:0 6px 20px rgba(0,0,0,.2);z-index:9999;font-family:'DM Sans',sans-serif;font-size:.9rem;font-weight:500;max-width:400px;word-break:break-word;animation:slideIn .3s ease-out;`;
  d.textContent = msg;
  document.body.appendChild(d);
  setTimeout(() => {
    d.style.animation = "slideOut .3s ease-out";
    setTimeout(() => d.remove(), 300);
  }, 3500);
};

/* ══════════════════════════════════════════
   UNIT LABELS for Fix / ME unit checkboxes
══════════════════════════════════════════ */
const UNIT_LABELS = {
  OPEN:"OPEN", CPSheet:"CP Sheet", ENDCovers:"END Covers", DOORFrame:"DOOR Frame", OTHER:"OTHER"
};

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
const MMSSDataSheet = () => {
  const { projectId: paramProjectId, fileId: paramFileId } = useParams();

  const getIds = () => {
    const hash = window.location.hash;
    const m = hash.match(/\/mmss-datasheet\/(\d+)\/(\d+)/);
    if (m) return { projectId: m[1], fileId: m[2] };
    const qs = new URLSearchParams(window.location.search);
    return {
      projectId: qs.get("projectID") || paramProjectId || "3272",
      fileId:    qs.get("fileId")    || paramFileId    || "4990",
    };
  };

  const { projectId, fileId } = getIds();

  const [theme,     setTheme]     = useState("light");
  const [activeTab, setActiveTab] = useState("project");
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [saving,    setSaving]    = useState(false);

  // ── "save" | "update" — driven by MssButtonApi ──
  const [buttonAction, setButtonAction] = useState("save");

  // ── API data ──
  const [project,    setProject]    = useState(null);
  const [siteDates,  setSiteDates]  = useState({});

  // ── Editable form states ──
  const [instructions, setInstructions] = useState({
    specialOfficialReq:"", specialInstruction:"", specialRequirement:"", aestheticsInfo:""
  });
  const [ambassador,      setAmbassador]      = useState("");
  const [ambassadorOther, setAmbassadorOther] = useState("");
  const [taxDoc,          setTaxDoc]          = useState("");
  const [taxDocOther,     setTaxDocOther]     = useState("");

  // Dimensions
  const [dimRows, setDimRows] = useState([
    { id:null, location:"", length:"", width:"", height:"", super_structure:"", quantity:"", levels:"", bays:"" }
  ]);

  // Fix Unit / ME Unit
  const [fixUnit, setFixUnit] = useState({ OPEN:false, CPSheet:false, ENDCovers:false, DOORFrame:false, OTHER:false, other_value:"" });
  const [meUnit,  setMeUnit]  = useState({ OPEN:false, CPSheet:false, ENDCovers:false, DOORFrame:false, OTHER:false, other_value:"" });

  // Load details
  const [loadDet, setLoadDet] = useState({
    pallet_size:"", load_per_pallet:"", material_to_stored:"",
    drive_box:"", matching_angles:"", dimension_taken_by:""
  });

  // Foundation
  const [fnd, setFnd] = useState({
    siteFloorNumber:"", anyObstructions:"",
    ftRailSection30:false, ftRailSectionAll:false, ftMentionLB:"",
    ftFoundationFlat:false, ftMentionFlat:"",
    fmMS:false, fmSS:false, fmOTHER:false, fmMentionOther:"",
    fFoundation:"", wheelDesign:"",
    floorType:"", floorTypeOther:"",
    workingHours:"", weeklyHolidays:"",
    driveType:"",
  });

  // Technical
  const [trolleyRows, setTrolleyRows] = useState([]);
  const [gearM,       setGearM]       = useState({ hp_rating:"", vendor:"", vendor_other:"", tmm_id:"" });
  const [gearME,      setGearME]      = useState({ hp_rating:"", vendor:"", vendor_other:"", tmm_id:"" });
  const [bearingRows, setBearingRows] = useState([
    { type:"UCP",          tick:false, particulars:"", tmm_id:"" },
    { type:"Pedestal Type",tick:false, particulars:"", tmm_id:"" },
  ]);

  // Material estimation: keyed by MAT_LABELS[n].key
  const [matEst, setMatEst] = useState({});

  // Site measurements
  const [measState, setMeasState] = useState({
    actualMeasTaken:"", actualMeasRemark:"",
    measTakenBy:"", measTakenByRemark:"",
    approvalRequired:"", approvalRemark:"",
  });

  // Documents
  const [docRows, setDocRows] = useState([{ name:"", file:null }]);

  /* ── CSS injection ── */
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = GLOBAL_CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  /* ── Theme CSS vars ── */
  useEffect(() => {
    const r = document.documentElement;
    if (theme === "dark") {
      r.style.setProperty("--ud-bg",        "#13161e");
      r.style.setProperty("--ud-card",      "#1e2330");
      r.style.setProperty("--ud-header-bg", "#252b3b");
      r.style.setProperty("--ud-border",    "#2e3650");
      r.style.setProperty("--ud-text",      "#e8edf5");
      r.style.setProperty("--ud-muted",     "#8b95af");
      r.style.setProperty("--ud-accent",    "#60a5fa");
    } else {
      r.style.setProperty("--ud-bg",        "#f0f4f8");
      r.style.setProperty("--ud-card",      "#ffffff");
      r.style.setProperty("--ud-header-bg", "#f7f9fc");
      r.style.setProperty("--ud-border",    "#d8e0ec");
      r.style.setProperty("--ud-text",      "#1a2340");
      r.style.setProperty("--ud-muted",     "#7a8aaa");
      r.style.setProperty("--ud-accent",    "#1d6fbd");
    }
    document.body.style.background = "var(--ud-bg)";
  }, [theme]);

  /* ══════════════════════════════════════════
     STEP 1 — Check button type (save / update)
  ══════════════════════════════════════════ */
  useEffect(() => {
    const check = async () => {
      try {
        const res  = await fetch(`${BUTTON_API}?projectID=${projectId}`);
        const json = await res.json();
        if (json.status === "success") {
          setButtonAction(json.button_type || "save");
          console.log("🔘 MMSS Button type:", json.button_type);
        }
      } catch (e) {
        console.warn("MssButtonApi check failed:", e.message);
      }
    };
    check();
  }, [projectId]);

  /* ══════════════════════════════════════════
     STEP 2 — Fetch all data from MMSS API
  ══════════════════════════════════════════ */
  const fetchAll = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const url  = `${API_BASE}?section=all&projectID=${projectId}&fileId=${fileId}`;
      const res  = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.status !== "success") throw new Error(json.message || "API error");

      const d = json.data;

      /* ── Project details ── */
      const pd = d.project_details || {};
      setProject(pd);
      setAmbassador(pd.customer_ambassador || "");
      setAmbassadorOther(pd.ambassador_other || "");
      setTaxDoc(pd.transport_document || "");
      setTaxDocOther(pd.transport_other || "");
      setInstructions({
        specialOfficialReq: pd.special_official_req  || "",
        specialInstruction: pd.special_instruction   || "",
        specialRequirement: pd.special_requirement   || "",
        aestheticsInfo:     pd.aesthetics_info       || "",
      });

      /* ── Site dates ── */
      setSiteDates(d.site_date_details?.dates || {});

      /* ── Type of system / Dimensions ── */
      const ts = d.type_of_system || {};
      if (ts.dimensions?.length) {
        setDimRows(ts.dimensions.map(r => ({
          id:              r.dimention_id     || null,
          location:        r.location         || "",
          length:          r.length           || "",
          width:           r.width            || "",
          height:          r.height           || r.totalHeight || "",
          super_structure: r.super_structure  || r.superHeight || "",
          quantity:        r.quantity         || r.qty         || "",
          levels:          r.levels           || "",
          bays:            r.no_req_bays      || r.bays        || "",
        })));
      }

      /* Fix/ME units */
      const fu = ts.fix_unit || {};
      const mu = ts.me_unit  || {};
      setFixUnit({
        OPEN:        !!fu.OPEN,        CPSheet:  !!fu.CPSheet,
        ENDCovers:   !!fu.ENDCovers,   DOORFrame:!!fu.DOORFrame,
        OTHER:       !!fu.OTHER,       other_value: fu.other_value || "",
      });
      setMeUnit({
        OPEN:        !!mu.OPEN,        CPSheet:  !!mu.CPSheet,
        ENDCovers:   !!mu.ENDCovers,   DOORFrame:!!mu.DOORFrame,
        OTHER:       !!mu.OTHER,       other_value: mu.other_value || "",
      });
      setLoadDet(ts.load_details || {});

      /* ── Foundation ── */
      const fi = d.foundation_info || {};
      setFnd({
        siteFloorNumber:  fi.site_floor_number                   || "",
        anyObstructions:  fi.obstructions                        || "",
        ftRailSection30:  !!fi.foundation_type?.flanged_wheel,
        ftRailSectionAll: !!fi.foundation_type?.rail_section,
        ftMentionLB:      fi.foundation_type?.rail_lb            || "",
        ftFoundationFlat: !!fi.foundation_type?.foundation_flat,
        ftMentionFlat:    fi.foundation_type?.flat_detail        || "",
        fmMS:             !!fi.foundation_material?.MS,
        fmSS:             !!fi.foundation_material?.SS,
        fmOTHER:          !!fi.foundation_material?.OTHER,
        fmMentionOther:   fi.foundation_material?.other_value    || "",
        fFoundation:      fi.foundation                          || "",
        wheelDesign:      fi.wheel_design                        || "",
        floorType:        fi.floor_type                          || "",
        floorTypeOther:   fi.floor_type_other                    || "",
        workingHours:     fi.working_hours                       || "",
        weeklyHolidays:   fi.weekly_holidays                     || "",
        driveType:        fi.drive_type                          || "",
      });

      /* ── Technical / Material ── */
      const tm = d.technical_material || {};
      setTrolleyRows(tm.trolley_rows || []);

      const gm  = tm.gear_box_m  || {};
      const gme = tm.gear_box_me || {};
      setGearM ({hp_rating:gm.hp_rating ||"",  vendor:gm.vendor ||"",  vendor_other:gm.vendor_other ||"",  tmm_id:gm.tmm_id ||""  });
      setGearME({hp_rating:gme.hp_rating||"",  vendor:gme.vendor||"",  vendor_other:gme.vendor_other||"",  tmm_id:gme.tmm_id||""  });

      /* Bearing rows — map API data, default to 2 rows if none */
      if (tm.bearing?.length) {
        setBearingRows(tm.bearing.map(b => ({
          type:        b.type        || "",
          tick:        !!b.tick,
          particulars: b.particulars || "",
          tmm_id:      b.tmm_id      || "",
        })));
      }

      /* Material estimation — map API into our keyed structure */
      const meInit = {};
      MAT_LABELS.forEach(m => {
        if (m.hasEXT) {
          const rE = tm.material_estimation?.[m.key + "_Ext"] || tm.material_estimation?.[m.key + "~Ext"] || {};
          const rI = tm.material_estimation?.[m.key + "_Ixt"] || tm.material_estimation?.[m.key + "~Ixt"] || {};
          meInit[m.key] = { qtyEXT:rE.quantity||"", qtyINT:rI.quantity||"", costEXT:rE.cost||"", costINT:rI.cost||"" };
        } else {
          const raw = tm.material_estimation?.[m.key] || {};
          meInit[m.key] = { qty:raw.quantity||"", cost:raw.cost||"" };
        }
      });
      setMatEst(meInit);

      /* ── Site measurements ── */
      const sm = d.site_measurements || {};
      setMeasState({
        actualMeasTaken:   sm.actual_measurement_taken?.is_done || "",
        actualMeasRemark:  sm.actual_measurement_taken?.remark  || "",
        measTakenBy:       sm.measurement_taken_by?.is_done     || "",
        measTakenByRemark: sm.measurement_taken_by?.remark      || "",
        approvalRequired:  sm.customer_approval?.is_done        || "",
        approvalRemark:    sm.customer_approval?.remark         || "",
      });

      if (d.attached_documents?.length) {
        setDocRows(d.attached_documents.map(doc => ({
          name: doc.doc_name, file:null, path:doc.doc_path
        })));
      }

      showToast("Data loaded successfully", "success");
    } catch (e) {
      setError(e.message);
      showToast(`Error: ${e.message}`, "error");
    } finally {
      setLoading(false);
    }
  }, [projectId, fileId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ── Dimension helpers ── */
  const addDimRow    = () => setDimRows(r => [...r, { id:null, location:"", length:"", width:"", height:"", super_structure:"", quantity:"", levels:"", bays:"" }]);
  const removeDimRow = (i) => setDimRows(r => r.filter((_,idx) => idx !== i));
  const updDim       = (i, k, v) => setDimRows(r => r.map((row,idx) => idx===i ? {...row,[k]:v} : row));

  const updMatEst    = (key, k, v) => setMatEst(p => ({ ...p, [key]: { ...p[key], [k]: v } }));

  /* ══════════════════════════════════════════
     STEP 3 — Build FormData with EXACT PHP keys
     PHP (InsertMssApi.php) reads:
       $input['action'], $input['projectId'], $input['fileid']
       $input['custAmb1'], $input['customerAmbassador1']
       $input['document'], $input['document1']
       $input['specialOfficialRequirement'], $input['specialInstructions'],
       $input['specialRequirements'], $input['specialInstructionAesthetic']
       $input['siteFormIssuedDate'] ... $input['commitedDispatchDate']
       $ftype[], $flength[], $fwidth[], $fheight[], $fsuperstructure[],
         $fqty[], $flevels[], $fbays[]   ← SAVE
       $dim[], $flength1[], $fwidth1[], $fheight1[], $fsuperstructure1[],
         $fqty1[], $flevels1[], $fbays1[]  ← UPDATE
       $input['loadCarringCapacityRack'], $input['loadPerPallet'],
         $input['materialToBeStored'], $fixUnit[], $MEUnit[], $driveType
       $input['siteFloornumber'], $input['foundation'],
         $input['floorTypes'], $input['floorTypes1'],
         $input['foundationMaterial[]'], $input['foundationMaterial1'],
         $input['foundationDataType[]'], $input['foundationDataType1'],
         $input['foundationDataType2']
       countsize + trolleyType{n}, trolleyTypeLength{n},
         channelSectionType1{n}, lengthHeavy{n}, lengthColor{n}
       tmmID[], trolleyTYPE[], ... (update existing trolleys)
       $input['bearingTypeUCP'], $input['ucpTick'], $input['ucpParticulars'],
         $input['ucpTMM_ID']
       $input['bearingTypePedestal'], $input['pedestalTick'],
         $input['pedestalParticulars'], $input['pedestalTMM_ID']
       Material estimation: foundation1, foundationUnit, foundationQnty,
         foundationCost, fabrication, ... (per MAT_LABELS keys)
       sheet-metal, sheet-metalExt, sheet-metalIxt,
         sheet-metalExtCost, sheet-metalIxtCost, sheet-metalUnit
       powder, powderExt, powderIxt, powderExtCost, powderIxtCost, powderUnit
       $input['measurementTaken'], $input['siteMeasurementTaken'],
         $input['siteMeasurementTakenRemark']
       $input['sitemeasuermentTakenBy'], $input['measurementTakenBy'],
         $input['measurementTakenByRemark']
       $input['customerApprovalLayout'], $input['customerApproval'],
         $input['customerApprovalRemark']
       $_FILES['Uploadfile'], $_POST['project_data'][]
  ══════════════════════════════════════════ */
  const buildFormData = () => {
    const fd = new FormData();

    /* ── Action + Core IDs ── */
    fd.append("action",    buttonAction);   // "save" or "update"
    fd.append("projectId", projectId);      // PHP: $input['projectId']
    fd.append("fileid",    fileId);         // PHP: $input['fileid']

    /* ── Customer Ambassador ── */
    fd.append("custAmb1", ambassador);      // PHP: $input['custAmb1']
    if (ambassador === "OTHER") {
      fd.append("customerAmbassador1", ambassadorOther); // PHP: $input['customerAmbassador1']
    }

    /* ── Tax / Transport Document ── */
    fd.append("document", taxDoc);          // PHP: $input['document']
    if (taxDoc === "OTHER") {
      fd.append("document1", taxDocOther);  // PHP: $input['document1']
    }

    /* ── Instructions ── */
    fd.append("specialOfficialRequirement",  instructions.specialOfficialReq  || ""); // PHP: $input['specialOfficialRequirement']
    fd.append("specialInstructions",         instructions.specialInstruction   || ""); // PHP: $input['specialInstructions']
    fd.append("specialRequirements",         instructions.specialRequirement   || ""); // PHP: $input['specialRequirements']
    fd.append("specialInstructionAesthetic", instructions.aestheticsInfo       || ""); // PHP: $input['specialInstructionAesthetic']

    /* ── Site Date Details ── */
    // PHP: $siteFormIssuedDate, $foundationDate, $dispatchFoundationDate,
    //      $primaryInfoDate, $firstDispatchDate, $completedFileDate,
    //      $lastDispatchDate, $commitedDispatchDate
    [
      "siteFormIssuedDate","foundationDate","dispatchFoundationDate",
      "primaryInfoDate","firstDispatchDate","completedFileDate",
      "lastDispatchDate","commitedDispatchDate",
    ].forEach(k => fd.append(k, siteDates[k] || ""));

    /* ── Dimension Rows ── */
    if (buttonAction === "save") {
      // PHP: $ftype[], $flength[], $fwidth[], $fheight[],
      //      $fsuperstructure[], $fqty[], $flevels[], $fbays[]
      dimRows.forEach(row => {
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
      // PHP: $dim[], $flength1[], $fwidth1[], $fheight1[],
      //      $fsuperstructure1[], $fqty1[], $flevels1[], $fbays1[]
      dimRows.forEach(row => {
        fd.append("dim[]",              row.id             || "");
        fd.append("flength1[]",         row.length         || "");
        fd.append("fwidth1[]",          row.width          || "");
        fd.append("fheight1[]",         row.height         || "");
        fd.append("fsuperstructure1[]", row.super_structure|| "");
        fd.append("fqty1[]",            row.quantity       || "");
        fd.append("flevels1[]",         row.levels         || "");
        fd.append("fbays1[]",           row.bays           || "");
      });
      // Also send ftype[] for rows that may not yet have an ID (new rows added during update)
      dimRows.forEach(row => fd.append("ftype[]", row.location || ""));
    }

    /* ── Fix Unit ──  PHP: $fixUnit[] imploded as ME:..~ FIX:... */
    const fixArr = [];
    if (fixUnit.OPEN)      fixArr.push("OPEN");
    if (fixUnit.CPSheet)   fixArr.push("CP Sheet");
    if (fixUnit.ENDCovers) fixArr.push("END Covers");
    if (fixUnit.DOORFrame) fixArr.push("DOOR Frame");
    if (fixUnit.OTHER)     fixArr.push(fixUnit.other_value ? "OTHER~" + fixUnit.other_value : "OTHER");
    fixArr.forEach(v => fd.append("fixUnit[]", v));

    /* ── ME Unit ── */
    const meArr = [];
    if (meUnit.OPEN)      meArr.push("OPEN");
    if (meUnit.CPSheet)   meArr.push("CP Sheet");
    if (meUnit.ENDCovers) meArr.push("END Covers");
    if (meUnit.DOORFrame) meArr.push("DOOR Frame");
    if (meUnit.OTHER)     meArr.push(meUnit.other_value ? "OTHER~" + meUnit.other_value : "OTHER");
    meArr.forEach(v => fd.append("MEUnit[]", v));

    /* ── Site Load Details ── */
    fd.append("loadCarringCapacityRack", loadDet.load_per_pallet     || ""); // PHP: $loadCarringCapacityRack
    fd.append("loadPerPallet",           loadDet.load_per_pallet     || ""); // PHP: $loadPerPallet
    fd.append("materialToBeStored",      loadDet.material_to_stored  || ""); // PHP: $materialToBeStored

    /* ── Drive Type ── */
    fd.append("driveType", fnd.driveType || loadDet.drive_box || ""); // PHP: $driveType → UPDATE site_load_details

    /* ── Foundation ── */
    fd.append("siteFloornumber", fnd.siteFloorNumber || ""); // PHP: $siteFloornumber
    fd.append("foundation",      fnd.fFoundation     || ""); // PHP: $foundation

    // Floor type
    fd.append("floorTypes",  fnd.floorType      || ""); // PHP: $floorType
    if (fnd.floorType === "OTHER") {
      fd.append("floorTypes1", fnd.floorTypeOther || ""); // PHP: $floorTypeOther
    }

    // Foundation material — PHP: $foundationMaterial[]
    if (fnd.fmMS)    fd.append("foundationMaterial[]", "MS");
    if (fnd.fmSS)    fd.append("foundationMaterial[]", "SS");
    if (fnd.fmOTHER) fd.append("foundationMaterial[]", "OTHER");
    if (fnd.fmOTHER) fd.append("foundationMaterial1",  fnd.fmMentionOther || ""); // PHP: $foundationOther

    // Foundation type — PHP: $foundationDataType[], $foundationDataType1, $foundationDataType2
    if (fnd.ftRailSection30)  fd.append("foundationDataType[]", "Flanged Wheel");
    if (fnd.ftRailSectionAll) {
      fd.append("foundationDataType[]", "Rail Section");
      fd.append("foundationDataType1",  fnd.ftMentionLB   || ""); // PHP: $f_MentionLB
    }
    if (fnd.ftFoundationFlat) {
      fd.append("foundationDataType[]", "Flat");
      fd.append("foundationDataType2",  fnd.ftMentionFlat || ""); // PHP: $f_MentionFlat
    }

    /* ── Trolley Details ── */
    if (buttonAction === "update") {
      // PHP UPDATE path: $tmmID[], $trolleyTYPE[], $trolleyTYPELength[],
      //                  $lengthSection1[], $lengthSize1[], $lengthCOLOUR[]
      const existingTrolleys = trolleyRows.filter(t => t.tmm_id || t.id);
      const newTrolleys      = trolleyRows.filter(t => !(t.tmm_id || t.id));

      existingTrolleys.forEach(t => {
        fd.append("tmmID[]",             t.tmm_id  || t.id  || "");
        fd.append("trolleyTYPE[]",       t.type    || "");
        fd.append("trolleyTYPELength[]", t.trolley || "");
        fd.append("lengthSection1[]",    t.section || "");
        fd.append("lengthSize1[]",       t.size    || "");
        fd.append("lengthCOLOUR[]",      t.colour_shade || t.colour || "");
      });

      // New rows (countsize pattern)
      fd.append("countsize", String(newTrolleys.length));
      newTrolleys.forEach((t, i) => {
        const n = i + 1;
        fd.append(`trolleyType${n}`,         t.type    || "");
        fd.append(`trolleyTypeLength${n}`,   t.trolley || "");
        fd.append(`channelSectionType1${n}`, t.section || "");
        fd.append(`lengthHeavy${n}`,         t.size    || "");
        fd.append(`lengthColor${n}`,         t.colour_shade || t.colour || "");
      });
    } else {
      // PHP SAVE path: countsize + trolleyType{n}, trolleyTypeLength{n},
      //                channelSectionType1{n}, lengthHeavy{n}, lengthColor{n}
      fd.append("countsize", String(trolleyRows.length));
      trolleyRows.forEach((t, i) => {
        const n = i + 1;
        fd.append(`trolleyType${n}`,         t.type    || "");
        fd.append(`trolleyTypeLength${n}`,   t.trolley || "");
        fd.append(`channelSectionType1${n}`, t.section || "");
        fd.append(`lengthHeavy${n}`,         t.size    || "");
        fd.append(`lengthColor${n}`,         t.colour_shade || t.colour || "");
      });
    }

    /* ── Bearing ── */
    // PHP: $bearingTypeUCP, $ucpTick, $ucpParticulars, $ucpTMM_ID
    const ucpRow  = bearingRows.find(b => b.type === "UCP") || bearingRows[0] || {};
    const pedRow  = bearingRows.find(b => b.type === "Pedestal Type") || bearingRows[1] || {};

    fd.append("bearingTypeUCP",       gearM.vendor ? "UCP" : "UCP");        // work-type label
    fd.append("ucpTick",              ucpRow.tick        ? "1" : "");
    fd.append("ucpParticulars",       ucpRow.particulars || "");
    fd.append("ucpTMM_ID",            ucpRow.tmm_id      || "");

    fd.append("bearingTypePedestal",  "Pedestal Type");                     // work-type label
    fd.append("pedestalTick",         pedRow.tick        ? "1" : "");
    fd.append("pedestalParticulars",  pedRow.particulars || "");
    fd.append("pedestalTMM_ID",       pedRow.tmm_id      || "");

    /* ── Material Estimation ── */
    // PHP upsertEstimation called via $est array with [$nameKey,$unitKey,$qtyKey,$costKey]
    // $input[$nameKey] is the work-type string (the key itself)
    MAT_LABELS.forEach(m => {
      const me = matEst[m.key] || {};
      if (m.hasEXT) {
        // PHP: $sm = $input['sheet-metal'], $smExt = $input['sheet-metalExt'], etc.
        fd.append(m.key,             m.key);             // work_type name e.g. "sheet-metal"
        fd.append(m.unitKey,         m.unit || "");
        fd.append(m.key + "Ext",     me.qtyEXT   || "");
        fd.append(m.key + "Ixt",     me.qtyINT   || "");
        fd.append(m.key + "ExtCost", me.costEXT  || "");
        fd.append(m.key + "IxtCost", me.costINT  || "");
      } else {
        // PHP: $input[$nameKey] as work-type, $input[$unitKey], $input[$qtyKey], $input[$costKey]
        fd.append(m.key,     m.key);                     // e.g. "foundation1"
        fd.append(m.unitKey, m.unit || "");
        fd.append(m.qtyKey,  me.qty  || "");
        fd.append(m.costKey, me.cost || "");
      }
    });

    /* ── Site Measurement Info ── */
    // PHP inserts/updates 3 rows, each matched by DESCRIPTION field
    // Row 1:  measurementTaken (description), siteMeasurementTaken (is_done), siteMeasurementTakenRemark (remark)
    fd.append("measurementTaken",           "Actual Site Measurements Taken");
    fd.append("siteMeasurementTaken",       measState.actualMeasTaken   || "");
    fd.append("siteMeasurementTakenRemark", measState.actualMeasRemark  || "");

    // Row 2:  sitemeasuermentTakenBy (description), measurementTakenBy (is_done), measurementTakenByRemark (remark)
    fd.append("sitemeasuermentTakenBy",     "Measurements Taken By");
    fd.append("measurementTakenBy",         measState.measTakenBy       || "");
    fd.append("measurementTakenByRemark",   measState.measTakenByRemark || "");

    // Row 3:  customerApprovalLayout (description), customerApproval (is_done), customerApprovalRemark (remark)
    fd.append("customerApprovalLayout",     "Approval of Layout from Customer Required");
    fd.append("customerApproval",           measState.approvalRequired  || "");
    fd.append("customerApprovalRemark",     measState.approvalRemark    || "");

    /* ── File Uploads ── */
    // PHP: $_FILES['Uploadfile'] (multiple) + $_POST['project_data'][]
    const hasFiles = docRows.some(d => d.file);
    if (hasFiles) {
      docRows.forEach((doc) => {
        fd.append("project_data[]", doc.name || "");
        if (doc.file) fd.append("Uploadfile[]", doc.file, doc.file.name);
      });
    }

    return fd;
  };

  /* ══════════════════════════════════════════
     STEP 4 — Submit (Save / Update)
  ══════════════════════════════════════════ */
  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = buildFormData();

      // Debug
      console.group(`📤 MMSS ${buttonAction.toUpperCase()} → ${SAVE_API}`);
      for (const [k, v] of fd.entries()) {
        if (!(v instanceof File)) console.log(`  ${k} =`, v);
        else console.log(`  ${k} = [File: ${v.name}]`);
      }
      console.groupEnd();

      const res  = await fetch(SAVE_API, { method:"POST", body:fd });
      const text = await res.text();
      console.log("📥 Raw response:", text);

      let json;
      try   { json = JSON.parse(text); }
      catch { showToast(`Server error: ${text.substring(0,180)}`, "error"); return; }

      if (json.status === "success" || json.status === "partial") {
        showToast(
          buttonAction === "update"
            ? "✓ MMSS Data Sheet updated successfully!"
            : "✓ MMSS Data Sheet saved successfully!",
          "success"
        );
        if (json.errors?.length) {
          console.warn("Partial errors:", json.errors);
          showToast(`Saved with ${json.errors.length} warning(s). Check console.`, "info");
        }
        // After first save, switch to update mode
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

  /* ── Button style ── */
  const isUpdate = buttonAction === "update";
  const btnClass = isUpdate ? "btn-mmss-update" : "btn-mmss-save";
  const btnLabel = saving
    ? (isUpdate ? "Updating…" : "Saving…")
    : isUpdate
      ? "✏️ Update Data Sheet"
      : "💾 Save Data Sheet";

  /* ══════════════════════════════════════════
     LOADING / ERROR SCREENS
  ══════════════════════════════════════════ */
  if (loading) return (
    <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#f0f4f8" }}>
      <div style={{ textAlign:"center" }}>
        <Spinner animation="border" style={{ width:"3rem",height:"3rem",color:"#1d6fbd" }} />
        <p className="mt-3" style={{ fontFamily:"'DM Sans',sans-serif",fontWeight:500,color:"#1a2340" }}>
          Loading MMSS Data Sheet…
        </p>
      </div>
    </div>
  );

  if (error) return (
    <Container className="mt-5">
      <Alert variant="danger">
        <Alert.Heading>Failed to load data</Alert.Heading>
        <p>{error}</p>
        <Button onClick={fetchAll}>Retry</Button>
      </Alert>
    </Container>
  );

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
  return (
    <div className="ud-root" style={{ minHeight:"100vh",background:"var(--ud-bg)",padding:"24px 0" }}>
      <Container fluid style={{ maxWidth:1440 }}>
        <Card style={{ background:"var(--ud-card)",border:"1px solid var(--ud-border)",borderRadius:16,boxShadow:"0 8px 32px rgba(0,0,0,.1)",overflow:"hidden" }}>

          {/* ── HEADER ── */}
          <Card.Header
            className={theme === "dark" ? "ud-header-grad-dark" : "ud-header-grad"}
            style={{ padding:"22px 28px",borderBottom:"none" }}>
            <Row className="align-items-center">
              <Col xs={12} lg={8}>
                <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:6 }}>
                  <div style={{ width:42,height:42,borderRadius:10,background:"rgba(255,255,255,.18)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.3rem" }}>📐</div>
                  <h4 style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,color:"#fff",margin:0,fontSize:"1.25rem" }}>
                    {project?.file_name || "MMSS Project Data Sheet"}
                  </h4>
                </div>
                <div style={{ display:"flex",gap:18,flexWrap:"wrap" }}>
                  {[
                    { icon:"bi-hash",    label:"File ID",  val:fileId },
                    { icon:"bi-building",label:"Customer", val:project?.customer_name || "—" },
                    { icon:"bi-box",     label:"Product",  val:project?.product_type  || "—" },
                  ].map(it => (
                    <span key={it.label} style={{ fontSize:".82rem",color:"rgba(255,255,255,.82)",display:"flex",alignItems:"center",gap:5 }}>
                      <i className={`bi ${it.icon}`} />
                      <strong style={{ color:"rgba(255,255,255,.6)",fontWeight:500 }}>{it.label}:&nbsp;</strong>
                      {it.val}
                    </span>
                  ))}
                </div>
              </Col>
              <Col xs={12} lg={4} className="text-end mt-3 mt-lg-0">
                <button
                  onClick={() => setTheme(t => t === "light" ? "dark" : "light")}
                  style={{ background:"rgba(255,255,255,.15)",border:"1.5px solid rgba(255,255,255,.3)",color:"#fff",borderRadius:8,padding:"7px 16px",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:".83rem",cursor:"pointer",marginRight:10 }}>
                  {theme === "light" ? "🌙 Dark" : "☀️ Light"}
                </button>
                <button
                  onClick={() => window.history.back()}
                  style={{ background:"rgba(255,255,255,.15)",border:"1.5px solid rgba(255,255,255,.3)",color:"#fff",borderRadius:8,padding:"7px 16px",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:".83rem",cursor:"pointer" }}>
                  ← Back
                </button>
              </Col>
            </Row>
          </Card.Header>

          {/* ── TABS ── */}
          <Card.Body style={{ padding:0 }}>
            <Tabs activeKey={activeTab} onSelect={setActiveTab} className="ud-tabs mb-0" style={{ background:"var(--ud-header-bg)" }}>

              {/* ════════════════════════════
                  PROJECT DETAILS TAB
              ════════════════════════════ */}
              <Tab eventKey="project" title={<span><i className="bi bi-file-text me-2" />Project Details</span>}>
                <div style={{ padding:"28px 28px 40px" }} className="fade-in">

                  {/* ── PROJECT DETAILS ── */}
                  <Block title="PROJECT DETAILS">
                    <Row>
                      <InfoRow label="File Name"        value={project?.file_name} />
                      <InfoRow label="Product Type"     value={project?.product_type} />
                      <InfoRow label="Client / Company" value={project?.customer_name} />
                      <InfoRow label="Shipping Address" value={project?.shipping_address} />
                      <InfoRow label="Contact Person"   value={project?.contact_person} />
                      <InfoRow label="Contact Phone"    value={project?.contact_number} />
                    </Row>
                    <Row className="mt-2">
                      <Col xs={12} md={6} className="mb-3">
                        <span className="ud-info-label d-block mb-2">Customer Ambassador</span>
                        <div style={{ display:"flex",gap:18,flexWrap:"wrap" }}>
                          {["AGP","SVJ","RPK","OTHER"].map(opt => (
                            <label key={opt} className="mm-radio-row" style={{ marginBottom:0 }}>
                              <input type="radio" name="ambassador" value={opt}
                                checked={ambassador === opt}
                                onChange={() => setAmbassador(opt)} />
                              {opt}
                            </label>
                          ))}
                        </div>
                        {ambassador === "OTHER" && (
                          <div style={{ marginTop:10 }}>
                            <span className="mm-label">Mention Customer Ambassador Name</span>
                            <UInput value={ambassadorOther} onChange={e => setAmbassadorOther(e.target.value)} placeholder="Enter name..." />
                          </div>
                        )}
                      </Col>
                      <Col xs={12} md={6} className="mb-3">
                        <span className="ud-info-label d-block mb-2">Tax Documents</span>
                        <div style={{ display:"flex",gap:18,flexWrap:"wrap" }}>
                          {["SEZ","GST","OTHER"].map(opt => (
                            <label key={opt} className="mm-radio-row" style={{ marginBottom:0 }}>
                              <input type="radio" name="taxdoc" value={opt}
                                checked={taxDoc === opt}
                                onChange={() => setTaxDoc(opt)} />
                              {opt}
                            </label>
                          ))}
                        </div>
                        {taxDoc === "OTHER" && (
                          <div style={{ marginTop:10 }}>
                            <span className="mm-label">Mention Other Documents</span>
                            <UInput value={taxDocOther} onChange={e => setTaxDocOther(e.target.value)} />
                          </div>
                        )}
                      </Col>
                    </Row>
                  </Block>

                  {/* ── SITE DATES + INSTRUCTIONS ── */}
                  <Row className="g-3 mb-2">
                    <Col xs={12} lg={7}>
                      <Block title="SITE DATE DETAILS">
                        <table className="ud-date-table">
                          <thead>
                            <tr>
                              <th style={{ textAlign:"left" }}></th>
                              <th>Dates</th><th></th><th>Dates</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              ["Site Form Issued",    "siteFormIssuedDate",     "Foundation date",               "foundationDate"],
                              ["Dispatch-Foundation", "dispatchFoundationDate", "Primary Info",                  "primaryInfoDate"],
                              ["1st Dispatch",        "firstDispatchDate",      "Design Date",                   "completedFileDate"],
                              ["Last Dispatch",       "lastDispatchDate",       "Committed date of handover",    "commitedDispatchDate"],
                            ].map(([l1,k1,l2,k2]) => (
                              <tr key={k1}>
                                <td style={{ color:"var(--ud-accent)",fontWeight:600 }}>{l1}</td>
                                <td>
                                  <input type="date"
                                    value={siteDates[k1] || ""}
                                    onChange={e => setSiteDates(p => ({...p,[k1]:e.target.value}))}
                                    style={{ border:"1px solid var(--ud-border)",borderRadius:7,padding:"4px 8px",fontSize:".82rem",background:"var(--ud-bg)",color:"var(--ud-text)",outline:"none" }} />
                                </td>
                                <td style={{ color:"var(--ud-accent)",fontWeight:600 }}>{l2}</td>
                                <td>
                                  <input type="date"
                                    value={siteDates[k2] || ""}
                                    onChange={e => setSiteDates(p => ({...p,[k2]:e.target.value}))}
                                    style={{ border:"1px solid var(--ud-border)",borderRadius:7,padding:"4px 8px",fontSize:".82rem",background:"var(--ud-bg)",color:"var(--ud-text)",outline:"none" }} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </Block>
                    </Col>
                    <Col xs={12} lg={5}>
                      <Block title="INSTRUCTIONS">
                        {[
                          ["Any Special Official Requirement?",                     "specialOfficialReq"],
                          ["Special Instructions (if any)",                         "specialInstruction"],
                          ["Special Requirements (if any)",                         "specialRequirement"],
                          ["Special Instructions regarding aesthetics / finishing",  "aestheticsInfo"],
                        ].map(([lbl,key]) => (
                          <div key={key}>
                            <label className="ud-instr-label">{lbl}</label>
                            <textarea className="ud-instr-ta"
                              value={instructions[key]}
                              onChange={e => setInstructions(p => ({...p,[key]:e.target.value}))} />
                          </div>
                        ))}
                      </Block>
                    </Col>
                  </Row>

                  {/* ── TYPE OF SYSTEM ── */}
                  <Block title="TYPE OF SYSTEM">
                    <div style={{ marginBottom:14 }}>
                      <span style={{ fontSize:".88rem",fontWeight:600,color:"var(--ud-text)",marginRight:18 }}>Type of System :</span>
                      {(project?.system_type || "").split(",").map(s => s.trim()).filter(Boolean).map(s => (
                        <span key={s} style={{ background:"var(--ud-accent)",color:"#fff",borderRadius:6,padding:"2px 12px",fontSize:".8rem",fontWeight:700,marginRight:8 }}>{s}</span>
                      ))}
                    </div>

                    <div style={{ fontSize:".85rem",fontWeight:600,color:"var(--ud-text)",marginBottom:10 }}>
                      Overall Dimension Related Information :
                    </div>
                    <div style={{ overflowX:"auto",marginBottom:18 }}>
                      <table className="dim-table">
                        <thead>
                          <tr>
                            <th style={{ width:44 }}>
                              <button onClick={addDimRow}
                                style={{ background:"#e8560a",border:"none",borderRadius:"50%",width:26,height:26,color:"#fff",fontSize:"1.2rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto" }}>+</button>
                            </th>
                            <th>Location</th><th>Length (mm)</th><th>Width (mm)</th>
                            <th>Total Height (mm)</th><th>Superstructure (mm)</th>
                            <th>Qty</th><th>Levels</th><th>No. of bays</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dimRows.map((row, i) => (
                            <tr key={i}>
                              <td style={{ textAlign:"center" }}>
                                {i > 0 && (
                                  <button onClick={() => removeDimRow(i)}
                                    style={{ background:"#dc2626",border:"none",borderRadius:"50%",width:22,height:22,color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto" }}>−</button>
                                )}
                              </td>
                              <td>
                                <input value={row.location || ""} onChange={e => updDim(i,"location",e.target.value)} placeholder="Location/Type" />
                              </td>
                              {["length","width","height","super_structure","quantity","levels","bays"].map(k => (
                                <td key={k}>
                                  <input value={row[k] || ""} onChange={e => updDim(i,k,e.target.value)} />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Fix Unit / ME Unit */}
                    <Row className="mb-3">
                      {[["Fix Unit", fixUnit, setFixUnit], ["ME Unit", meUnit, setMeUnit]].map(([lbl, state, setter]) => (
                        <Col xs={12} md={6} key={lbl}>
                          <span className="mm-sec-lbl">{lbl}</span>
                          <div style={{ display:"flex",flexWrap:"wrap",gap:14 }}>
                            {Object.keys(UNIT_LABELS).map(k => (
                              <Chk key={k}
                                checked={state[k]}
                                onChange={e => setter(p => ({...p,[k]:e.target.checked}))}
                                label={UNIT_LABELS[k]} />
                            ))}
                          </div>
                          {state.OTHER && (
                            <div style={{ marginTop:8 }}>
                              <UInput value={state.other_value || ""}
                                onChange={e => setter(p => ({...p,other_value:e.target.value}))}
                                placeholder={`Other ${lbl}...`} />
                            </div>
                          )}
                        </Col>
                      ))}
                    </Row>

                    {/* Load Details */}
                    <span className="mm-sec-lbl">Load Details</span>
                    <Row>
                      {[
                        ["pallet_size",          "Pallet Size"],
                        ["load_per_pallet",       "Load Per Pallet (KG)"],
                        ["material_to_stored",    "Material To Be Stored"],
                        ["drive_box",             "Drive Box"],
                        ["matching_angles",       "Matching Angles"],
                        ["dimension_taken_by",    "Dimensions Taken By"],
                      ].map(([k,lbl]) => (
                        <Col xs={12} md={2} key={k} className="mb-3">
                          <span className="mm-label">{lbl}</span>
                          <UInput value={loadDet[k] || ""}
                            onChange={e => setLoadDet(p => ({...p,[k]:e.target.value}))} />
                        </Col>
                      ))}
                    </Row>
                  </Block>

                  {/* ── FOUNDATION ── */}
                  <Block title="FOUNDATION RELATED INFO">
                    <Row className="mb-3">
                      <Col xs={12} md={4}>
                        <span className="mm-label">Site Floor Number</span>
                        <UInput value={fnd.siteFloorNumber} onChange={e => setFnd(p => ({...p,siteFloorNumber:e.target.value}))} />
                      </Col>
                      <Col xs={12} md={4}>
                        <span className="mm-label">Any Obstructions</span>
                        <UInput value={fnd.anyObstructions} onChange={e => setFnd(p => ({...p,anyObstructions:e.target.value}))} />
                      </Col>
                      <Col xs={12} md={4}>
                        <span className="mm-label">Drive Type</span>
                        <div style={{ display:"flex",gap:16,marginTop:4 }}>
                          {["Single Twin","Double Twin"].map(v => (
                            <Radio key={v} name="driveType" value={v}
                              checked={fnd.driveType === v}
                              onChange={() => setFnd(p => ({...p,driveType:v}))} label={v} />
                          ))}
                        </div>
                      </Col>
                    </Row>
                    <Row>
                      <Col xs={12} md={4} className="mb-3">
                        <span className="mm-sec-lbl">Foundation Type</span>
                        <Chk checked={fnd.ftRailSection30}  onChange={e => setFnd(p => ({...p,ftRailSection30:e.target.checked}))}  label="Rail Section (30 lbs) & Flanged Wheel Rails Only" />
                        <Chk checked={fnd.ftRailSectionAll} onChange={e => setFnd(p => ({...p,ftRailSectionAll:e.target.checked}))} label="Rail Section & All Rails" />
                        {fnd.ftRailSectionAll && (
                          <div style={{ marginLeft:22,marginTop:4 }}>
                            <span style={{ fontSize:".76rem",color:"var(--ud-muted)" }}>Mention LB</span>
                            <UInput value={fnd.ftMentionLB} onChange={e => setFnd(p => ({...p,ftMentionLB:e.target.value}))} />
                          </div>
                        )}
                        <Chk checked={fnd.ftFoundationFlat} onChange={e => setFnd(p => ({...p,ftFoundationFlat:e.target.checked}))} label="Foundation Flat & All Rails" />
                        {fnd.ftFoundationFlat && (
                          <div style={{ marginLeft:22,marginTop:4 }}>
                            <span style={{ fontSize:".76rem",color:"var(--ud-muted)" }}>Mention Flat</span>
                            <UInput value={fnd.ftMentionFlat} onChange={e => setFnd(p => ({...p,ftMentionFlat:e.target.value}))} />
                          </div>
                        )}
                      </Col>
                      <Col xs={12} md={2} className="mb-3">
                        <span className="mm-sec-lbl">Foundation Material</span>
                        <Chk checked={fnd.fmMS}    onChange={e => setFnd(p => ({...p,fmMS:e.target.checked}))}    label="MS" />
                        <Chk checked={fnd.fmSS}    onChange={e => setFnd(p => ({...p,fmSS:e.target.checked}))}    label="SS" />
                        <Chk checked={fnd.fmOTHER} onChange={e => setFnd(p => ({...p,fmOTHER:e.target.checked}))} label="OTHER" />
                        {fnd.fmOTHER && (
                          <UInput value={fnd.fmMentionOther}
                            onChange={e => setFnd(p => ({...p,fmMentionOther:e.target.value}))}
                            placeholder="Mention material..." />
                        )}
                      </Col>
                      <Col xs={12} md={2} className="mb-3">
                        <span className="mm-sec-lbl">Foundation</span>
                        {["Flush to floor","Above floor"].map(v => (
                          <Radio key={v} name="fnd_pos" value={v}
                            checked={fnd.fFoundation === v}
                            onChange={() => setFnd(p => ({...p,fFoundation:v}))} label={v} />
                        ))}
                      </Col>
                      <Col xs={12} md={2} className="mb-3">
                        <span className="mm-sec-lbl">Wheel Design</span>
                        {["Two Wheel","Three Wheel","Four Wheel"].map(v => (
                          <Radio key={v} name="wheel" value={v}
                            checked={fnd.wheelDesign === v}
                            onChange={() => setFnd(p => ({...p,wheelDesign:v}))} label={v} />
                        ))}
                      </Col>
                      <Col xs={12} md={2} className="mb-3">
                        <span className="mm-sec-lbl">Floor Type</span>
                        {["PCC","Kota","Tiles","GreenField","OTHER"].map(v => (
                          <Radio key={v} name="floortype" value={v}
                            checked={fnd.floorType === v}
                            onChange={() => setFnd(p => ({...p,floorType:v}))} label={v === "GreenField" ? "Green Field" : v} />
                        ))}
                        {fnd.floorType === "OTHER" && (
                          <UInput value={fnd.floorTypeOther}
                            onChange={e => setFnd(p => ({...p,floorTypeOther:e.target.value}))}
                            placeholder="Mention floor type..." />
                        )}
                      </Col>
                    </Row>
                    <Row>
                      <Col xs={12} md={4} className="mb-2">
                        <span className="mm-label">Working Hours</span>
                        <UInput value={fnd.workingHours} onChange={e => setFnd(p => ({...p,workingHours:e.target.value}))} />
                      </Col>
                      <Col xs={12} md={4} className="mb-2">
                        <span className="mm-label">Weekly Holidays</span>
                        <UInput value={fnd.weeklyHolidays} onChange={e => setFnd(p => ({...p,weeklyHolidays:e.target.value}))} />
                      </Col>
                    </Row>
                  </Block>

                  {/* ── TECHNICAL & MATERIAL ── */}
                  <Block title="TECHNICAL & MATERIAL CONSIDERATION FROM MARKETING">

                    {/* Trolley Table */}
                    <div style={{ overflowX:"auto",marginBottom:18 }}>
                      <table className="dim-table" style={{ minWidth:600 }}>
                        <thead>
                          <tr><th>Type</th><th>Trolley</th><th>Section</th><th>Size</th><th>Colour Shade</th></tr>
                        </thead>
                        <tbody>
                          {trolleyRows.length > 0 ? trolleyRows.map((row, i) => (
                            <tr key={i}>
                              <td>
                                <input value={row.type || ""}
                                  onChange={e => setTrolleyRows(r => r.map((x,idx) => idx===i?{...x,type:e.target.value}:x))} />
                              </td>
                              <td>
                                <input value={row.trolley || ""}
                                  onChange={e => setTrolleyRows(r => r.map((x,idx) => idx===i?{...x,trolley:e.target.value}:x))} />
                              </td>
                              <td>
                                {["ISMC","MSTube"].map(v => (
                                  <label key={v} className="mm-radio-row" style={{ display:"inline-flex",marginRight:12 }}>
                                    <input type="radio" name={`section_${i}`} value={v}
                                      checked={row.section === v}
                                      onChange={() => setTrolleyRows(r => r.map((x,idx) => idx===i?{...x,section:v}:x))} />
                                    {v}
                                  </label>
                                ))}
                              </td>
                              <td>
                                <input value={row.size || ""}
                                  onChange={e => setTrolleyRows(r => r.map((x,idx) => idx===i?{...x,size:e.target.value}:x))} />
                              </td>
                              <td>
                                <input value={row.colour_shade || row.colour || ""}
                                  onChange={e => setTrolleyRows(r => r.map((x,idx) => idx===i?{...x,colour_shade:e.target.value}:x))} />
                              </td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan={5} style={{ color:"var(--ud-muted)",textAlign:"center",padding:16 }}>
                                No trolley data
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <Row>
                      {/* Gear Box */}
                      <Col xs={12} md={4} className="mb-3">
                        <table className="gear-table">
                          <thead>
                            <tr><th>Gear-box</th><th>HP Rating</th><th>Vendor</th></tr>
                          </thead>
                          <tbody>
                            {[["M", gearM, setGearM], ["ME", gearME, setGearME]].map(([lbl, gear, setGear]) => (
                              <tr key={lbl}>
                                <td style={{ fontWeight:600,color:"var(--ud-muted)",textAlign:"center" }}>{lbl}</td>
                                <td>
                                  <input value={gear.hp_rating || ""}
                                    onChange={e => setGear(p => ({...p,hp_rating:e.target.value}))} />
                                </td>
                                <td>
                                  {["Transmatix","Kavitsu","OTHER"].map(v => (
                                    <Radio key={v} name={`vendor_${lbl}`} value={v}
                                      checked={gear.vendor === v}
                                      onChange={() => setGear(p => ({...p,vendor:v}))} label={v} />
                                  ))}
                                  {gear.vendor === "OTHER" && (
                                    <input className="mm-input" value={gear.vendor_other || ""}
                                      onChange={e => setGear(p => ({...p,vendor_other:e.target.value}))} placeholder="Other vendor..." />
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </Col>

                      {/* Bearing */}
                      <Col xs={12} md={4} className="mb-3">
                        <table className="bearing-table">
                          <thead>
                            <tr><th>Bearing</th><th>Tick</th><th>Particulars</th></tr>
                          </thead>
                          <tbody>
                            {bearingRows.map((b, i) => (
                              <tr key={i}>
                                <td style={{ fontWeight:600,color:"var(--ud-accent)" }}>{b.type}</td>
                                <td>
                                  <input type="checkbox" checked={!!b.tick}
                                    onChange={e => setBearingRows(r => r.map((x,idx) => idx===i?{...x,tick:e.target.checked}:x))} />
                                </td>
                                <td>
                                  <input type="text" value={b.particulars || ""}
                                    onChange={e => setBearingRows(r => r.map((x,idx) => idx===i?{...x,particulars:e.target.value}:x))} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </Col>
                    </Row>

                    {/* Material Estimation */}
                    <span className="mm-sec-lbl mt-2">Material Estimation (Mktg)</span>
                    <div style={{ overflowX:"auto" }}>
                      <table className="mat-table">
                        <thead>
                          <tr>
                            <th style={{ width:200,textAlign:"left" }}>Material</th>
                            <th>Quantity</th>
                            <th>Unit</th>
                            <th colSpan={2}>Cost (₹)</th>
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
                                      <span style={{ fontSize:".74rem",fontWeight:700,marginRight:24 }}>EXT</span>
                                      <span style={{ fontSize:".74rem",fontWeight:700 }}>INT</span>
                                    </td>
                                    <td></td>
                                    <td style={{ fontSize:".74rem",fontWeight:700 }}>EXT</td>
                                    <td style={{ fontSize:".74rem",fontWeight:700 }}>INT</td>
                                  </tr>
                                )}
                                <tr>
                                  <td className="row-label">{m.label}</td>
                                  <td>
                                    {m.hasEXT ? (
                                      <div style={{ display:"flex",gap:8 }}>
                                        <input value={me.qtyEXT||""} onChange={e=>updMatEst(m.key,"qtyEXT",e.target.value)} placeholder="EXT" />
                                        <input value={me.qtyINT||""} onChange={e=>updMatEst(m.key,"qtyINT",e.target.value)} placeholder="INT" />
                                      </div>
                                    ) : (
                                      <input value={me.qty||""} onChange={e=>updMatEst(m.key,"qty",e.target.value)} />
                                    )}
                                  </td>
                                  <td style={{ fontSize:".78rem",color:"var(--ud-muted)",fontWeight:600 }}>{m.unit}</td>
                                  <td>
                                    {m.hasEXT ? (
                                      <div style={{ display:"flex",alignItems:"center",gap:4 }}>
                                        <span>₹</span>
                                        <input style={{ width:70 }} value={me.costEXT||""} onChange={e=>updMatEst(m.key,"costEXT",e.target.value)} />
                                      </div>
                                    ) : (
                                      <div style={{ display:"flex",alignItems:"center",gap:4 }}>
                                        <span>₹</span>
                                        <input value={me.cost||""} onChange={e=>updMatEst(m.key,"cost",e.target.value)} />
                                      </div>
                                    )}
                                  </td>
                                  {m.hasEXT ? (
                                    <td>
                                      <div style={{ display:"flex",alignItems:"center",gap:4 }}>
                                        <span>₹</span>
                                        <input style={{ width:70 }} value={me.costINT||""} onChange={e=>updMatEst(m.key,"costINT",e.target.value)} />
                                      </div>
                                    </td>
                                  ) : <td />}
                                </tr>
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </Block>

                  {/* ── SITE MEASUREMENTS ── */}
                  <Block title="SITE MEASUREMENTS INFO">
                    <div style={{ overflowX:"auto",marginBottom:20 }}>
                      <table className="sm-table">
                        <thead>
                          <tr>
                            <th style={{ width:"34%" }}></th>
                            <th style={{ width:"34%" }}></th>
                            <th>Remark</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="q-label">Actual Site Measurements Taken?</td>
                            <td>
                              <div style={{ display:"flex",gap:20 }}>
                                <Radio name="actualMeas" value="Yes" checked={measState.actualMeasTaken === "Yes"} onChange={() => setMeasState(p => ({...p,actualMeasTaken:"Yes"}))} label="Yes" />
                                <Radio name="actualMeas" value="No"  checked={measState.actualMeasTaken === "No"}  onChange={() => setMeasState(p => ({...p,actualMeasTaken:"No"}))}  label="No" />
                              </div>
                            </td>
                            <td><input type="text" value={measState.actualMeasRemark} onChange={e => setMeasState(p => ({...p,actualMeasRemark:e.target.value}))} /></td>
                          </tr>
                          <tr>
                            <td className="q-label">Measurements Taken By</td>
                            <td><input type="text" value={measState.measTakenBy} onChange={e => setMeasState(p => ({...p,measTakenBy:e.target.value}))} /></td>
                            <td><input type="text" value={measState.measTakenByRemark} onChange={e => setMeasState(p => ({...p,measTakenByRemark:e.target.value}))} /></td>
                          </tr>
                          <tr>
                            <td className="q-label">Approval of Layout from Customer Required?</td>
                            <td>
                              <div style={{ display:"flex",gap:20 }}>
                                <Radio name="approvalReq" value="Yes" checked={measState.approvalRequired === "Yes"} onChange={() => setMeasState(p => ({...p,approvalRequired:"Yes"}))} label="Yes" />
                                <Radio name="approvalReq" value="No"  checked={measState.approvalRequired === "No"}  onChange={() => setMeasState(p => ({...p,approvalRequired:"No"}))}  label="No" />
                              </div>
                            </td>
                            <td><input type="text" value={measState.approvalRemark} onChange={e => setMeasState(p => ({...p,approvalRemark:e.target.value}))} /></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Document uploads */}
                    <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:14 }}>
                      <span style={{ fontSize:".85rem",fontWeight:600,color:"var(--ud-text)" }}>
                        Documents making part of data-sheet
                      </span>
                      <button onClick={() => setDocRows(r => [...r,{name:"",file:null}])}
                        style={{ background:"#e8560a",border:"none",borderRadius:"50%",width:26,height:26,color:"#fff",fontSize:"1.2rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>+</button>
                    </div>
                    {docRows.map((row, i) => (
                      <div key={i} style={{ display:"flex",alignItems:"center",gap:12,marginBottom:10 }}>
                        <input type="text" placeholder="Enter Document Name"
                          value={row.name}
                          onChange={e => setDocRows(r => r.map((x,idx) => idx===i?{...x,name:e.target.value}:x))}
                          style={{ flex:1,border:"none",borderBottom:"1.5px solid var(--ud-border)",background:"transparent",outline:"none",fontSize:".85rem",color:"var(--ud-text)",padding:"3px 0",fontFamily:"'DM Sans',sans-serif" }} />
                        <label style={{ display:"flex",alignItems:"center",gap:8,cursor:"pointer",flexShrink:0 }}>
                          <span style={{ background:"transparent",border:"1px solid var(--ud-border)",borderRadius:5,padding:"4px 12px",fontSize:".8rem",color:"var(--ud-text)",cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>
                            Choose File
                          </span>
                          <span style={{ fontSize:".8rem",color:"var(--ud-muted)" }}>
                            {row.file ? row.file.name : row.path ? "Uploaded" : "No file chosen"}
                          </span>
                          <input type="file" style={{ display:"none" }}
                            onChange={e => setDocRows(r => r.map((x,idx) => idx===i?{...x,file:e.target.files[0]}:x))} />
                        </label>
                        {i > 0 && (
                          <button onClick={() => setDocRows(r => r.filter((_,idx) => idx!==i))}
                            style={{ background:"#dc2626",border:"none",borderRadius:"50%",width:24,height:24,color:"#fff",cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center" }}>−</button>
                        )}
                      </div>
                    ))}
                  </Block>

                  {/* ══ SAVE / UPDATE BUTTON ══
                      Blue  (btn-mmss-save)   → action="save"   → InsertMssApi.php
                      Orange (btn-mmss-update) → action="update" → InsertMssApi.php
                  ══════════════════════════════ */}
                  <div className="text-center mt-4">
                    <button
                      className={btnClass}
                      onClick={handleSave}
                      disabled={saving}>
                      {btnLabel}
                    </button>
                    <p style={{ marginTop:10,fontSize:".78rem",color:"var(--ud-muted)" }}>
                      Mode: <strong style={{ color: isUpdate ? "#e8560a" : "#1d6fbd" }}>
                        {isUpdate ? "UPDATE" : "SAVE"}
                      </strong>
                      {" — "}POST to InsertMssApi.php · action="{buttonAction}"
                    </p>
                  </div>

                </div>
              </Tab>

              {/* ════════════════════════════
                  SYSTEM INFO TAB
              ════════════════════════════ */}
              <Tab eventKey="system" title={<span><i className="bi bi-gear me-2" />System Info</span>}>
                <div style={{ padding:"28px" }} className="fade-in">
                  <Alert variant="info" style={{ fontFamily:"'DM Sans',sans-serif" }}>
                    <i className="bi bi-info-circle me-2" />
                    System type: <strong>{project?.system_type || "Not specified"}</strong> — Edit system details in the Project Details tab.
                  </Alert>
                  <Block title="DIMENSION SUMMARY">
                    <div style={{ overflowX:"auto" }}>
                      <table className="dim-table">
                        <thead>
                          <tr>
                            <th>#</th><th>Location</th><th>Length</th><th>Width</th>
                            <th>Height</th><th>Superstructure</th><th>Qty</th><th>Levels</th><th>Bays</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dimRows.length > 0 ? dimRows.map((row, i) => (
                            <tr key={i}>
                              <td style={{ textAlign:"center",color:"var(--ud-muted)",fontWeight:700 }}>{i + 1}</td>
                              <td>{row.location || "—"}</td>
                              <td>{row.length   || "—"}</td>
                              <td>{row.width    || "—"}</td>
                              <td>{row.height   || "—"}</td>
                              <td>{row.super_structure || "—"}</td>
                              <td>{row.quantity || "—"}</td>
                              <td>{row.levels   || "—"}</td>
                              <td>{row.bays     || "—"}</td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan={9} style={{ textAlign:"center",color:"var(--ud-muted)",padding:20 }}>
                                No dimensions found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </Block>
                </div>
              </Tab>

            </Tabs>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default MMSSDataSheet;