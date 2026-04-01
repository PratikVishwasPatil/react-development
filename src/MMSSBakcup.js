import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  Container, Card, Row, Col, Tabs, Tab,
  Button, Form, Table, Spinner, Alert,
} from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

/* ═══════════════════════════════════════════
   GLOBAL CSS
═══════════════════════════════════════════ */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');

  @keyframes slideIn  { from{transform:translateX(420px);opacity:0} to{transform:translateX(0);opacity:1} }
  @keyframes slideOut { from{transform:translateX(0);opacity:1}     to{transform:translateX(420px);opacity:0} }
  @keyframes fadeUp   { from{opacity:0;transform:translateY(12px)}  to{opacity:1;transform:translateY(0)} }
  @keyframes pulse-dot{ 0%,100%{transform:scale(1)} 50%{transform:scale(1.4)} }

  .ud-root { font-family:'DM Sans',sans-serif; }
  .fade-in  { animation:fadeUp .45s ease both; }

  .ud-info-row { display:flex;flex-direction:column;padding:10px 0;border-bottom:1px solid var(--ud-border); }
  .ud-info-row:last-child { border-bottom:none }
  .ud-info-label { font-size:.72rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--ud-muted);margin-bottom:3px; }
  .ud-info-value { font-size:.94rem;font-weight:500;color:var(--ud-text); }
  .ud-info-value.accent { color:var(--ud-accent);font-weight:600; }

  .ud-tabs .nav-link { font-family:'DM Sans',sans-serif;font-weight:600;font-size:.88rem;color:var(--ud-muted) !important;border:none !important;padding:14px 20px;border-radius:0 !important;transition:color .18s,box-shadow .18s; }
  .ud-tabs .nav-link:hover  { color:var(--ud-accent) !important; }
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
  .ud-date-table td.lnk { color:var(--ud-accent);font-weight:600; }
  .ud-date-table tr:last-child td { border-bottom:none; }
  .ud-date-table input[type=date] { border:1px solid var(--ud-border);border-radius:7px;padding:4px 8px;font-size:.82rem;background:var(--ud-bg);color:var(--ud-text);outline:none; }
  .ud-date-table input[type=date]:focus { border-color:var(--ud-accent); }

  .ud-instr-label { font-size:.82rem;font-weight:600;color:var(--ud-text);margin-bottom:5px;display:block;line-height:1.45; }
  .ud-instr-ta { width:100%;border:1px solid var(--ud-border);border-radius:8px;padding:7px 10px;font-size:.84rem;resize:vertical;min-height:50px;background:var(--ud-bg);color:var(--ud-text);outline:none;font-family:'DM Sans',sans-serif;transition:border .15s;margin-bottom:14px; }
  .ud-instr-ta:focus { border-color:var(--ud-accent); }

  .ud-po-card { border-left:4px solid var(--ud-accent);border-radius:12px;background:var(--ud-card);border:1px solid var(--ud-border);padding:20px;transition:transform .2s,box-shadow .2s;margin-bottom:16px; }
  .ud-po-card:hover { transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,.12); }

  .ud-badge { display:inline-flex;align-items:center;gap:5px;padding:4px 13px;border-radius:20px;font-size:.78rem;font-weight:700; }
  .ud-badge.active { background:#dcfce7;color:#15803d; }
  .dark-ud .ud-badge.active { background:#14532d;color:#86efac; }
  .ud-badge .dot { width:6px;height:6px;border-radius:50%;background:currentColor;animation:pulse-dot 1.5s infinite; }

  /* ── MMSS form ── */
  .mm-label { font-size:.8rem;font-weight:600;color:var(--ud-accent);margin-bottom:4px;display:block; }
  .mm-input { width:100%;border:none;border-bottom:1.5px solid var(--ud-border);background:transparent;padding:4px 2px;font-size:.88rem;color:var(--ud-text);outline:none;font-family:'DM Sans',sans-serif;transition:border .15s; }
  .mm-input:focus { border-bottom-color:var(--ud-accent); }
  .mm-radio-row { display:flex;align-items:center;gap:7px;font-size:.84rem;color:var(--ud-text);cursor:pointer;margin-bottom:6px; }
  .mm-radio-row input[type=radio],
  .mm-radio-row input[type=checkbox] { accent-color:var(--ud-accent);width:15px;height:15px;cursor:pointer;flex-shrink:0; }
  .mm-sec-lbl { font-size:.78rem;font-weight:700;color:var(--ud-accent);letter-spacing:.06em;text-transform:uppercase;margin-bottom:8px;display:block; }

  .dim-table { width:100%;border-collapse:collapse; }
  .dim-table th { background:var(--ud-header-bg);border:1px solid var(--ud-border);padding:7px 10px;font-size:.78rem;font-weight:700;color:var(--ud-muted);text-align:center;letter-spacing:.04em; }
  .dim-table td { border:1px solid var(--ud-border);padding:6px 8px;font-size:.84rem;color:var(--ud-text);vertical-align:middle; }
  .dim-table input { width:100%;border:none;background:transparent;font-size:.84rem;color:var(--ud-text);outline:none;text-align:center;font-family:'DM Sans',sans-serif; }

  .mat-table { width:100%;border-collapse:collapse; }
  .mat-table th { background:var(--ud-header-bg);border:1px solid var(--ud-border);padding:7px 10px;font-size:.78rem;font-weight:700;color:var(--ud-muted);text-align:center; }
  .mat-table td { border:1px solid var(--ud-border);padding:7px 10px;font-size:.84rem;color:var(--ud-text);text-align:center;vertical-align:middle; }
  .mat-table td.row-label { font-weight:600;color:var(--ud-accent);background:var(--ud-header-bg);white-space:nowrap; }
  .mat-table input { width:100%;border:none;border-bottom:1px solid var(--ud-border);background:transparent;font-size:.84rem;color:var(--ud-text);outline:none;text-align:center;padding:2px 0;font-family:'DM Sans',sans-serif; }

  .sm-table { width:100%;border-collapse:collapse; }
  .sm-table th { background:var(--ud-header-bg);border:1px solid var(--ud-border);padding:8px 12px;font-size:.78rem;font-weight:700;color:var(--ud-muted); }
  .sm-table td { border:1px solid var(--ud-border);padding:8px 12px;font-size:.85rem;color:var(--ud-text);vertical-align:middle; }
  .sm-table td.q-label { font-weight:500;background:var(--ud-header-bg);text-align:right;white-space:nowrap; }
  .sm-table input[type=text] { width:100%;border:none;border-bottom:1px solid var(--ud-border);background:transparent;outline:none;font-size:.84rem;color:var(--ud-text);font-family:'DM Sans',sans-serif; }

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

  .dark-ud .ud-date-table input[type=date] { color-scheme:dark; }
  .dark-ud .mm-input { color-scheme:dark; }
  .dark-ud .dim-table input { color-scheme:dark; }
`;

/* ═══════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════ */
const fmt = (v) => v || "N/A";

/* Reusable section block */
const Block = ({ title, children }) => (
  <div className="ud-block">
    <div className="ud-block-header">
      <div className="ud-block-bar" />
      <span className="ud-block-title">{title}</span>
    </div>
    <div className="ud-block-body">{children}</div>
  </div>
);

/* Underline input */
const UInput = ({ value, onChange, placeholder = "", style = {} }) => (
  <input className="mm-input" value={value} onChange={onChange} placeholder={placeholder} style={style} />
);

/* Radio */
const Radio = ({ name, value, checked, onChange, label }) => (
  <label className="mm-radio-row">
    <input type="radio" name={name} value={value} checked={checked} onChange={onChange} />
    {label}
  </label>
);

/* Checkbox */
const Chk = ({ checked, onChange, label }) => (
  <label className="mm-radio-row">
    <input type="checkbox" checked={checked} onChange={onChange} />
    {label}
  </label>
);

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
const UploadDrawingDetails = () => {
  const { projectId: paramProjectId, fileId: paramFileId } = useParams();

  const getIdsFromUrl = () => {
    const hash = window.location.hash;
    const m = hash.match(/\/upload-drawing-details\/(\d+)\/(\d+)/);
    if (m) return { projectId: m[1], fileId: m[2] };
    const m2 = hash.match(/\/upload-drawing-details\/(\d+)/);
    return { projectId: paramProjectId || "3272", fileId: m2 ? m2[1] : (paramFileId || "4990") };
  };

  const { projectId: _pid, fileId: _fid } = getIdsFromUrl();
  const [fileId]    = useState(_fid);
  const [projectId] = useState(_pid);
  const [theme, setTheme]       = useState("light");
  const [activeTab, setActiveTab] = useState("project");
  const [loading, setLoading]   = useState(false);

  /* ── API data ── */
  const [fileDetails,     setFileDetails]     = useState(null);
  const [siteDateDetails, setSiteDateDetails] = useState(null);
  const [poDetails,       setPoDetails]       = useState([]);

  /* ── Project section state ── */
  const [instructions, setInstructions] = useState({ specialOfficialReq:"", specialInstruction:"", specialRequirement:"", aestheticsInfo:"" });
  const [ambassador,      setAmbassador]      = useState("");
  const [ambassadorOther, setAmbassadorOther] = useState("");
  const [taxDoc,          setTaxDoc]          = useState("");
  const [taxDocOther,     setTaxDocOther]     = useState("");

  /* ── TYPE OF SYSTEM ── */
  const [systemType, setSystemType] = useState("");
  const [dimRows, setDimRows] = useState([
    { length:"", width:"", totalHeight:"", superHeight:"", qty:"", levels:"", bays:"" },
  ]);
  const [fixUnit, setFixUnit] = useState({ OPEN:false, CPSheet:false, ENDCovers:false, DOORFrame:false, OTHER:false });
  const [meUnit,  setMeUnit]  = useState({ OPEN:false, CPSheet:false, ENDCovers:false, DOORFrame:false, OTHER:false });
  const [loadDetails, setLoadDetails] = useState({ palletSize:"", loadPerPallet:"", materialStored:"", driveBox:"", matchingAngles:"", dimensionsTakenBy:"" });

  /* ── FOUNDATION ── */
  const [fnd, setFnd] = useState({
    siteFloorNumber:"", anyObstructions:"",
    ftRailSection30:false, ftRailSectionAll:false, ftMentionLB:"",
    ftFoundationFlat:false, ftMentionFlat:"",
    fmMS:false, fmSS:false, fmOTHER:false, fmMentionOther:"",
    fFoundation:"", wheelDesign:"",
    floorType:"", floorTypeOther:"",
    workingHours:"", weeklyHolidays:"",
  });

  /* ── TECHNICAL ── */
  const [tech, setTech] = useState({
    trolleyType:"", section:"", size:"", colourShade:"",
    hpM:"", companyM:"", hpME:"", companyME:"",
    bearingUCP:false, bearingUCPPart:"", bearingPedestal:false, bearingPedestalPart:"",
    elec:{ semiAuto:false, auto:false, autoWithPC:false, withVFD:false, withoutVFD:false, hangingTrolleys:false, wireRope:false, busBar:false, floorSensor:false, manInsideDisplay:false },
    electricalDesc:"",
  });

  const MAT_ROWS_INIT = [
    { label:"Foundation",      hasEXT:false, hasSqft:false, desc:"", weightEXT:"", weightINT:"", weight:"", unitWeight:"Kgs",  costEXT:"", costINT:"" },
    { label:"Fabrication",     hasEXT:false, hasSqft:false, desc:"", weightEXT:"", weightINT:"", weight:"", unitWeight:"Kgs",  costEXT:"", costINT:"" },
    { label:"Sheet-metal",     hasEXT:true,  hasSqft:false, desc:"", weightEXT:"", weightINT:"", weight:"", unitWeight:"Kgs",  costEXT:"", costINT:"" },
    { label:"Powder",          hasEXT:true,  hasSqft:true,  desc:"", weightEXT:"", weightINT:"", weight:"", unitWeight:"Sq ft",costEXT:"", costINT:"" },
    { label:"Hardware",        hasEXT:false, hasSqft:false, desc:"", weightEXT:"", weightINT:"", weight:"", unitWeight:"Kgs",  costEXT:"", costINT:"" },
    { label:"Assembly",        hasEXT:false, hasSqft:false, desc:"", weightEXT:"", weightINT:"", weight:"", unitWeight:"Kgs",  costEXT:"", costINT:"" },
    { label:"Electrical Mtl",  hasEXT:false, hasSqft:false, desc:"", weightEXT:"", weightINT:"", weight:"", unitWeight:"",     costEXT:"", costINT:"" },
    { label:"Man-Days on Site", hasEXT:false,hasSqft:false, desc:"", weightEXT:"", weightINT:"", weight:"", unitWeight:"Nos",  costEXT:"", costINT:"" },
    { label:"Site Expenses",   hasEXT:false, hasSqft:false, desc:"", weightEXT:"", weightINT:"", weight:"", unitWeight:"Rs.",  costEXT:"", costINT:"" },
    { label:"Despatch Lot",    hasEXT:false, hasSqft:false, desc:"", weightEXT:"", weightINT:"", weight:"", unitWeight:"",     costEXT:"", costINT:"" },
    { label:"Transportation Cost",hasEXT:false,hasSqft:false,desc:"",weightEXT:"", weightINT:"", weight:"", unitWeight:"",     costEXT:"", costINT:"" },
    { label:"Total Weight (KG)",hasEXT:false, hasSqft:false,desc:"", weightEXT:"", weightINT:"", weight:"", unitWeight:"",     costEXT:"", costINT:"" },
    { label:"RM Cost",         hasEXT:false, hasSqft:false, desc:"", weightEXT:"", weightINT:"", weight:"", unitWeight:"",     costEXT:"", costINT:"" },
  ];
  const [matRows, setMatRows] = useState(MAT_ROWS_INIT);
  const updMat = (i, k, v) => setMatRows(r => r.map((x, idx) => idx === i ? { ...x, [k]: v } : x));

  /* ── SITE MEASUREMENTS ── */
  const [siteMeas, setSiteMeas] = useState({ actualMeasTaken:"", actualMeasRemark:"", measTakenBy:"", measTakenByRemark:"", approvalRequired:"", approvalRemark:"" });
  const [docRows, setDocRows]   = useState([{ name:"", file:null }]);

  /* ── CSS + theme ── */
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = GLOBAL_CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  useEffect(() => {
    const r = document.documentElement;
    if (theme === "dark") {
      r.style.setProperty("--ud-bg",         "#13161e");
      r.style.setProperty("--ud-card",       "#1e2330");
      r.style.setProperty("--ud-header-bg",  "#252b3b");
      r.style.setProperty("--ud-border",     "#2e3650");
      r.style.setProperty("--ud-text",       "#e8edf5");
      r.style.setProperty("--ud-muted",      "#8b95af");
      r.style.setProperty("--ud-accent",     "#60a5fa");
      r.style.setProperty("--ud-accent-soft","rgba(96,165,250,.12)");
      document.body.classList.add("dark-ud");
    } else {
      r.style.setProperty("--ud-bg",         "#f0f4f8");
      r.style.setProperty("--ud-card",       "#ffffff");
      r.style.setProperty("--ud-header-bg",  "#f7f9fc");
      r.style.setProperty("--ud-border",     "#d8e0ec");
      r.style.setProperty("--ud-text",       "#1a2340");
      r.style.setProperty("--ud-muted",      "#7a8aaa");
      r.style.setProperty("--ud-accent",     "#1d6fbd");
      r.style.setProperty("--ud-accent-soft","rgba(29,111,189,.09)");
      document.body.classList.remove("dark-ud");
    }
    document.body.style.background = "var(--ud-bg)";
  }, [theme]);

  /* ── toast ── */
  const showToast = (msg, type = "info") => {
    const d = document.createElement("div");
    const bg = type === "success" ? "#16a34a" : type === "error" ? "#dc2626" : "#2563eb";
    d.style.cssText = `position:fixed;top:22px;right:22px;padding:13px 22px;background:${bg};color:#fff;border-radius:10px;box-shadow:0 6px 20px rgba(0,0,0,.2);z-index:9999;font-family:'DM Sans',sans-serif;font-size:.9rem;font-weight:500;animation:slideIn .3s ease-out;`;
    d.textContent = msg;
    document.body.appendChild(d);
    setTimeout(() => { d.style.animation = "slideOut .3s ease-out"; setTimeout(() => d.remove(), 300); }, 3000);
  };

  /* ── fetch ── */
  const fetchFileDetails = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/getProjectFileDetailsApi.php?projectID=${projectId}&fileId=${fileId}`);
      const data = await res.json();
      if (data.status === "success" && data.data) {
        setFileDetails(data.data);
        setAmbassador(data.data.customer_ambassador || "");
        setAmbassadorOther(data.data.ambassador_other || "");
        setTaxDoc((data.data.transport_document || "").toUpperCase());
        setTaxDocOther(data.data.transport_other || "");
        setInstructions({ specialOfficialReq:data.data.special_official_req||"", specialInstruction:data.data.special_instruction||"", specialRequirement:data.data.special_requirement||"", aestheticsInfo:data.data.aesthetics_info||"" });
      } else { showToast("Failed to load project details", "error"); }
    } catch (e) { showToast(`Error: ${e.message}`, "error"); }
    finally { setLoading(false); }
  };

  const fetchSiteDateDetails = async () => {
    try {
      const res  = await fetch(`http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/SiteDateDetailsApi.php?projectID=${projectId}&FILE_ID=${fileId}`);
      const data = await res.json();
      if (data.status === "success" && data.data) setSiteDateDetails(data.data);
    } catch (e) { console.warn(e); }
  };

  const fetchPoDetails = async () => {
    try {
      const res  = await fetch(`http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/uploadDrawingPoDetailsApi.php?FILE_ID=${fileId}`);
      const data = await res.json();
      if (data.status === "success" && Array.isArray(data.data)) setPoDetails(data.data);
    } catch (e) { console.warn(e); }
  };

  useEffect(() => {
    fetchFileDetails();
    fetchSiteDateDetails();
    fetchPoDetails();
  // eslint-disable-next-line
  }, [fileId]);

  const D = (k) => siteDateDetails?.dates?.[k] || "";

  /* ── dim row helpers ── */
  const addDimRow    = () => setDimRows(r => [...r, { length:"", width:"", totalHeight:"", superHeight:"", qty:"", levels:"", bays:"" }]);
  const removeDimRow = (i) => setDimRows(r => r.filter((_, idx) => idx !== i));
  const updDim       = (i, k, v) => setDimRows(r => r.map((row, idx) => idx === i ? { ...row, [k]: v } : row));

  /* ── doc row helpers ── */
  const addDocRow    = () => setDocRows(r => [...r, { name:"", file:null }]);
  const removeDocRow = (i) => setDocRows(r => r.filter((_, idx) => idx !== i));

  const handleViewDataSheet = () => {
    const pn = fileDetails?.product_type?.toUpperCase();
    let url = `#/product-datasheet/${projectId}/${fileId}`;
    if (pn === "MMSS") url = `#/mmss-datasheet/${projectId}/${fileId}`;
    else if (pn === "MSS") url = `#/mss-datasheet/${projectId}/${fileId}`;
    window.open(url, "_blank");
  };

  /* loading */
  if (loading && !fileDetails) {
    return (
      <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--ud-bg)" }}>
        <div style={{ textAlign:"center",color:"var(--ud-text)" }}>
          <Spinner animation="border" style={{ width:"3rem",height:"3rem",color:"var(--ud-accent)" }}/>
          <p className="mt-3" style={{ fontFamily:"'DM Sans',sans-serif",fontWeight:500 }}>Loading details…</p>
        </div>
      </div>
    );
  }

  const unitLabels = { OPEN:"OPEN", CPSheet:"CP Sheet", ENDCovers:"END Covers", DOORFrame:"DOOR Frame", OTHER:"OTHER" };

  /* ═══════════════════════ RENDER ═══════════════════════ */
  return (
    <div className="ud-root" style={{ minHeight:"100vh",background:"var(--ud-bg)",padding:"24px 0" }}>
      <Container fluid style={{ maxWidth:1440 }}>
        <Card style={{ background:"var(--ud-card)",border:"1px solid var(--ud-border)",borderRadius:16,boxShadow:"0 8px 32px rgba(0,0,0,.1)",overflow:"hidden" }}>

          {/* HEADER */}
          <Card.Header className={theme==="dark" ? "ud-header-grad-dark" : "ud-header-grad"} style={{ padding:"22px 28px",borderBottom:"none" }}>
            <Row className="align-items-center">
              <Col xs={12} lg={8}>
                <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:6 }}>
                  <div style={{ width:42,height:42,borderRadius:10,background:"rgba(255,255,255,.18)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.3rem" }}>📐</div>
                  <h4 style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,color:"#fff",margin:0,fontSize:"1.25rem",letterSpacing:".02em" }}>
                    {fileDetails?.file_name || "Upload Drawing Details"}
                  </h4>
                </div>
                <div style={{ display:"flex",gap:18,flexWrap:"wrap" }}>
                  {[{icon:"bi-hash",label:"File ID",val:fileId},{icon:"bi-building",label:"Customer",val:fileDetails?.customer_name||"—"},{icon:"bi-box",label:"Product",val:fileDetails?.product_type||"—"}].map(it=>(
                    <span key={it.label} style={{ fontSize:".82rem",color:"rgba(255,255,255,.82)",display:"flex",alignItems:"center",gap:5 }}>
                      <i className={`bi ${it.icon}`}/><strong style={{ color:"rgba(255,255,255,.6)",fontWeight:500 }}>{it.label}:&nbsp;</strong>{it.val}
                    </span>
                  ))}
                </div>
              </Col>
              <Col xs={12} lg={4} className="text-end mt-3 mt-lg-0">
                <button onClick={()=>setTheme(t=>t==="light"?"dark":"light")} style={{ background:"rgba(255,255,255,.15)",border:"1.5px solid rgba(255,255,255,.3)",color:"#fff",borderRadius:8,padding:"7px 16px",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:".83rem",cursor:"pointer",marginRight:10 }}>
                  {theme==="light"?"🌙 Dark":"☀️ Light"}
                </button>
                <button onClick={()=>window.history.back()} style={{ background:"rgba(255,255,255,.15)",border:"1.5px solid rgba(255,255,255,.3)",color:"#fff",borderRadius:8,padding:"7px 16px",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:".83rem",cursor:"pointer" }}>
                  ← Back
                </button>
              </Col>
            </Row>
          </Card.Header>

          {/* TABS */}
          <Card.Body style={{ padding:0 }}>
            <Tabs activeKey={activeTab} onSelect={setActiveTab} className="ud-tabs mb-0" style={{ background:"var(--ud-header-bg)" }}>

              {/* ══════════ PROJECT DETAILS TAB ══════════ */}
              <Tab eventKey="project" title={<span><i className="bi bi-file-text me-2"/>Project Details</span>}>
                <div style={{ padding:"28px 28px 40px" }} className="fade-in">

                  {/* ─ PROJECT DETAILS ─ */}
                  <Block title="PROJECT DETAILS">
                    <Row>
                      {[["File Name",fileDetails?.file_name],["Product Type",fileDetails?.product_type],["Client / Company Name",fileDetails?.customer_name],["Shipping Address",fileDetails?.shipping_address],["Contact Person Name",fileDetails?.contact_person],["Contact Person Phone",fileDetails?.contact_number]].map(([lbl,val])=>(
                        <Col xs={12} md={4} key={lbl} className="mb-3">
                          <div className="ud-info-row">
                            <span className="ud-info-label">{lbl}</span>
                            <span className="ud-info-value accent">{fmt(val)}</span>
                          </div>
                        </Col>
                      ))}
                    </Row>

                    {/* Ambassador + Tax */}
                    <Row className="mt-2">
                      <Col xs={12} md={6} className="mb-3">
                        <span className="ud-info-label d-block mb-2">Customer Ambassador</span>
                        <div style={{ display:"flex",gap:18,flexWrap:"wrap" }}>
                          {["AGP","SVJ","RPK","OTHER"].map(opt=>(
                            <label key={opt} className="mm-radio-row" style={{ marginBottom:0 }}>
                              <input type="radio" name="ambassador" value={opt} checked={ambassador===opt} onChange={()=>setAmbassador(opt)} />
                              {opt}
                            </label>
                          ))}
                        </div>
                        {ambassador==="OTHER" && (
                          <div style={{ marginTop:10 }}>
                            <span className="ud-info-label">Mention Customer Ambassador Name</span>
                            <UInput style={{ marginTop:4 }} value={ambassadorOther} onChange={e=>setAmbassadorOther(e.target.value)} placeholder="Enter name..." />
                          </div>
                        )}
                      </Col>
                      <Col xs={12} md={6} className="mb-3">
                        <span className="ud-info-label d-block mb-2">Tax Documents</span>
                        <div style={{ display:"flex",gap:18,flexWrap:"wrap" }}>
                          {["SEZ","GST","OTHER"].map(opt=>(
                            <label key={opt} className="mm-radio-row" style={{ marginBottom:0 }}>
                              <input type="radio" name="taxdoc" value={opt} checked={taxDoc===opt} onChange={()=>setTaxDoc(opt)} />
                              {opt}
                            </label>
                          ))}
                        </div>
                        {taxDoc==="OTHER" && (
                          <div style={{ marginTop:10 }}>
                            <span className="ud-info-label">Mention Other Documents</span>
                            <UInput style={{ marginTop:4 }} value={taxDocOther} onChange={e=>setTaxDocOther(e.target.value)} placeholder="Enter document..." />
                          </div>
                        )}
                      </Col>
                    </Row>
                  </Block>

                  {/* ─ SITE DATE + INSTRUCTIONS ─ */}
                  <Row className="g-3 mb-2">
                    <Col xs={12} lg={7}>
                      <Block title="SITE DATE DETAILS">
                        <table className="ud-date-table">
                          <thead>
                            <tr><th style={{ textAlign:"left" }}></th><th>Dates</th><th></th><th>Dates</th></tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>Site Form Issued</td><td><input type="date" defaultValue={D("siteFormIssuedDate")} /></td>
                              <td className="lnk">Foundation date</td><td><input type="date" defaultValue={D("foundationDate")} /></td>
                            </tr>
                            <tr>
                              <td className="lnk">Dispatch-Foundation</td><td><input type="date" defaultValue={D("dispatchFoundationDate")} /></td>
                              <td style={{ lineHeight:1.35,fontSize:".8rem" }}><span style={{ color:"var(--ud-accent)",fontWeight:600 }}>Primary Info</span><br/><span style={{ color:"var(--ud-muted)",fontSize:".75rem" }}>-- Long-lead &amp; Assy BD</span></td>
                              <td><input type="date" defaultValue={D("primaryInfoDate")} /></td>
                            </tr>
                            <tr>
                              <td>1st Dispatch</td><td><input type="date" defaultValue={D("firstDispatchDate")} /></td>
                              <td>Design Date</td><td><input type="date" defaultValue={D("completedFileDate")} /></td>
                            </tr>
                            <tr>
                              <td>Last Dispatch</td><td><input type="date" defaultValue={D("lastDispatchDate")} /></td>
                              <td style={{ fontSize:".82rem",lineHeight:1.3 }}>Committed date<br/><span style={{ fontSize:".75rem",color:"var(--ud-muted)" }}>of handover</span></td>
                              <td><input type="date" defaultValue={D("commitedDispatchDate")} /></td>
                            </tr>
                          </tbody>
                        </table>
                      </Block>
                    </Col>
                    <Col xs={12} lg={5}>
                      <Block title="INSTRUCTIONS">
                        <label className="ud-instr-label">Any Special Official Requirement?</label>
                        <textarea className="ud-instr-ta" value={instructions.specialOfficialReq} onChange={e=>setInstructions(p=>({...p,specialOfficialReq:e.target.value}))} />
                        <label className="ud-instr-label">Special Instructions (if any) - (e.g. Material movement related, staircase, corridors, ducts, beams, doors, windows, columns etc)</label>
                        <textarea className="ud-instr-ta" value={instructions.specialInstruction} onChange={e=>setInstructions(p=>({...p,specialInstruction:e.target.value}))} />
                        <label className="ud-instr-label">Special Requirements (if any)- (e.g. Wire Mesh Doors, Wire Mesh Partition, Tubular CP/TP, Hanging Partition, H Beams, Dec-on panels, Pallete Supports etc)</label>
                        <textarea className="ud-instr-ta" value={instructions.specialRequirement} onChange={e=>setInstructions(p=>({...p,specialRequirement:e.target.value}))} />
                        <label className="ud-instr-label">Special Instructions regarding aesthetics / finishing etc. (if any)-</label>
                        <textarea className="ud-instr-ta" style={{ marginBottom:0 }} value={instructions.aestheticsInfo} onChange={e=>setInstructions(p=>({...p,aestheticsInfo:e.target.value}))} />
                      </Block>
                    </Col>
                  </Row>

                  {/* ─ TYPE OF SYSTEM ─ */}
                  <Block title="TYPE OF SYSTEM">
                    <div style={{ marginBottom:16 }}>
                      <span style={{ fontSize:".88rem",fontWeight:600,color:"var(--ud-text)",marginRight:20 }}>Type of System :</span>
                      {["Slotted Angle","HDPR"].map(v=>(
                        <label key={v} className="mm-radio-row" style={{ display:"inline-flex",marginRight:20 }}>
                          <input type="radio" name="systemType" value={v} checked={systemType===v} onChange={()=>setSystemType(v)} />{v}
                        </label>
                      ))}
                    </div>

                    <div style={{ fontSize:".85rem",fontWeight:600,color:"var(--ud-text)",marginBottom:10 }}>Overall Dimension Related Information :</div>
                    <div style={{ overflowX:"auto",marginBottom:18 }}>
                      <table className="dim-table">
                        <thead>
                          <tr>
                            <th style={{ width:44 }}>
                              <button onClick={addDimRow} style={{ background:"#e8560a",border:"none",borderRadius:"50%",width:26,height:26,color:"#fff",fontSize:"1.2rem",cursor:"pointer",lineHeight:"26px",textAlign:"center" }}>+</button>
                            </th>
                            <th>Length<br/>(mm)</th><th>Width<br/>(mm)</th><th>Total Height From Ground<br/>(mm)</th><th>Superstructure Height (mm)</th><th>Qty</th><th>Levels</th><th style={{ color:"#e8560a" }}>No. of bays</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dimRows.map((row,i)=>(
                            <tr key={i}>
                              <td style={{ textAlign:"center" }}>
                                <div style={{ display:"flex",alignItems:"center",gap:4 }}>
                                  <button onClick={()=>removeDimRow(i)} style={{ background:"#e8560a",border:"none",borderRadius:"50%",width:22,height:22,color:"#fff",fontSize:"1rem",cursor:"pointer",lineHeight:"22px",textAlign:"center" }}>−</button>
                                  <span style={{ fontSize:".78rem",color:"var(--ud-muted)" }}>ENTER TYPE</span>
                                </div>
                              </td>
                              {["length","width","totalHeight","superHeight","qty","levels","bays"].map(k=>(
                                <td key={k}><input value={row[k]} onChange={e=>updDim(i,k,e.target.value)} /></td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <Row className="mb-3">
                      <Col xs={12} md={6}>
                        <span className="mm-sec-lbl">Fix Unit</span>
                        <div style={{ display:"flex",flexWrap:"wrap",gap:14 }}>
                          {Object.keys(fixUnit).map(k=>(
                            <Chk key={k} checked={fixUnit[k]} onChange={e=>setFixUnit(p=>({...p,[k]:e.target.checked}))} label={unitLabels[k]} />
                          ))}
                        </div>
                      </Col>
                      <Col xs={12} md={6}>
                        <span className="mm-sec-lbl">ME Unit</span>
                        <div style={{ display:"flex",flexWrap:"wrap",gap:14 }}>
                          {Object.keys(meUnit).map(k=>(
                            <Chk key={k} checked={meUnit[k]} onChange={e=>setMeUnit(p=>({...p,[k]:e.target.checked}))} label={unitLabels[k]} />
                          ))}
                        </div>
                      </Col>
                    </Row>

                    <span className="mm-sec-lbl">Load Details</span>
                    <Row>
                      {[["palletSize","Pallet Size"],["loadPerPallet","Load Per Pallet(KG)"],["materialStored","Material To Be Stored"],["driveBox","Drive Box"],["matchingAngles","Matching Angles"],["dimensionsTakenBy","Dimensions Taken By"]].map(([k,lbl])=>(
                        <Col xs={12} md={2} key={k} className="mb-3">
                          <span className="mm-label">{lbl}</span>
                          <UInput value={loadDetails[k]} onChange={e=>setLoadDetails(p=>({...p,[k]:e.target.value}))} />
                        </Col>
                      ))}
                    </Row>
                  </Block>

                  {/* ─ FOUNDATION RELATED INFO ─ */}
                  <Block title="FOUNDATION RELATED INFO">
                    <span className="mm-sec-lbl">Foundation Related Information</span>
                    <Row className="mb-3">
                      <Col xs={12} md={6}><span className="mm-label">Site Floor Number</span><UInput value={fnd.siteFloorNumber} onChange={e=>setFnd(p=>({...p,siteFloorNumber:e.target.value}))} /></Col>
                      <Col xs={12} md={6}><span className="mm-label">Any Obstructions</span><UInput value={fnd.anyObstructions} onChange={e=>setFnd(p=>({...p,anyObstructions:e.target.value}))} /></Col>
                    </Row>
                    <Row>
                      {/* Foundation Type */}
                      <Col xs={12} md={4} className="mb-3">
                        <span className="mm-sec-lbl">Foundation Type</span>
                        <Chk checked={fnd.ftRailSection30} onChange={e=>setFnd(p=>({...p,ftRailSection30:e.target.checked}))} label="Rail Section (30 lbs) & Flanged Wheel Rails Only (32 * 20 Rail)" />
                        <div style={{ marginTop:6 }}>
                          <Chk checked={fnd.ftRailSectionAll} onChange={e=>setFnd(p=>({...p,ftRailSectionAll:e.target.checked}))} label="Rail Section & All Rails" />
                          {fnd.ftRailSectionAll && (
                            <div style={{ marginLeft:22,marginTop:4 }}>
                              <span style={{ fontSize:".78rem",color:"var(--ud-muted)" }}>Mention LB</span>
                              <UInput value={fnd.ftMentionLB} onChange={e=>setFnd(p=>({...p,ftMentionLB:e.target.value}))} />
                            </div>
                          )}
                        </div>
                        <div style={{ marginTop:8 }}>
                          <Chk checked={fnd.ftFoundationFlat} onChange={e=>setFnd(p=>({...p,ftFoundationFlat:e.target.checked}))} label="Foundation Flat & All Rails" />
                          {fnd.ftFoundationFlat && (
                            <div style={{ marginLeft:22,marginTop:4 }}>
                              <span style={{ fontSize:".78rem",color:"var(--ud-muted)" }}>Mention Flat</span>
                              <UInput value={fnd.ftMentionFlat} onChange={e=>setFnd(p=>({...p,ftMentionFlat:e.target.value}))} />
                            </div>
                          )}
                        </div>
                      </Col>
                      {/* Foundation Material */}
                      <Col xs={12} md={2} className="mb-3">
                        <span className="mm-sec-lbl">Foundation Material</span>
                        <Chk checked={fnd.fmMS}    onChange={e=>setFnd(p=>({...p,fmMS:e.target.checked}))}    label="MS" />
                        <Chk checked={fnd.fmSS}    onChange={e=>setFnd(p=>({...p,fmSS:e.target.checked}))}    label="SS" />
                        <Chk checked={fnd.fmOTHER} onChange={e=>setFnd(p=>({...p,fmOTHER:e.target.checked}))} label="OTHER" />
                        {fnd.fmOTHER && (
                          <div style={{ marginTop:6 }}>
                            <span style={{ fontSize:".78rem",color:"var(--ud-muted)" }}>Mention Other Material</span>
                            <UInput value={fnd.fmMentionOther} onChange={e=>setFnd(p=>({...p,fmMentionOther:e.target.value}))} />
                          </div>
                        )}
                      </Col>
                      {/* Foundation position */}
                      <Col xs={12} md={2} className="mb-3">
                        <span className="mm-sec-lbl">Foundation</span>
                        {["Flush to floor","Above floor"].map(v=>(
                          <Radio key={v} name="fnd_pos" value={v} checked={fnd.fFoundation===v} onChange={()=>setFnd(p=>({...p,fFoundation:v}))} label={v} />
                        ))}
                      </Col>
                      {/* Wheel Design */}
                      <Col xs={12} md={2} className="mb-3">
                        <span className="mm-sec-lbl">Wheel Design</span>
                        {["Two Wheel","Three Wheel","Four Wheel"].map(v=>(
                          <Radio key={v} name="wheel" value={v} checked={fnd.wheelDesign===v} onChange={()=>setFnd(p=>({...p,wheelDesign:v}))} label={v} />
                        ))}
                      </Col>
                      {/* Floor Type */}
                      <Col xs={12} md={2} className="mb-3">
                        <span className="mm-sec-lbl">Floor Type</span>
                        {["PCC","Kota","Tiles","Green Field","OTHER"].map(v=>(
                          <Radio key={v} name="floor_type" value={v} checked={fnd.floorType===v} onChange={()=>setFnd(p=>({...p,floorType:v}))} label={v} />
                        ))}
                        {fnd.floorType==="OTHER" && (
                          <div style={{ marginTop:6 }}>
                            <span style={{ fontSize:".78rem",color:"var(--ud-muted)" }}>Mention Other Floor Type</span>
                            <UInput value={fnd.floorTypeOther} onChange={e=>setFnd(p=>({...p,floorTypeOther:e.target.value}))} />
                          </div>
                        )}
                      </Col>
                    </Row>
                    <span className="mm-sec-lbl mt-2">Time</span>
                    <Row>
                      <Col xs={12} md={5} className="mb-2"><span className="mm-label">Working hours</span><UInput value={fnd.workingHours} onChange={e=>setFnd(p=>({...p,workingHours:e.target.value}))} /></Col>
                      <Col xs={12} md={5} className="mb-2"><span className="mm-label">Weekly holidays</span><UInput value={fnd.weeklyHolidays} onChange={e=>setFnd(p=>({...p,weeklyHolidays:e.target.value}))} /></Col>
                    </Row>
                  </Block>

                  {/* ─ TECHNICAL & MATERIAL ─ */}
                  <Block title="TECHNICAL & MATERIAL CONSIDERATION FROM MARKETING">
                    <div style={{ overflowX:"auto",marginBottom:18 }}>
                      <table className="dim-table" style={{ minWidth:700 }}>
                        <thead>
                          <tr><th>Type</th><th>Trolley</th><th>Section</th><th>Size(e.g. 100x50)</th><th>Colour Shade</th></tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><input value={tech.trolleyType} onChange={e=>setTech(p=>({...p,trolleyType:e.target.value}))} /></td>
                            <td><input value={tech.trolleyType} onChange={e=>setTech(p=>({...p,trolleyType:e.target.value}))} /></td>
                            <td><input value={tech.section} onChange={e=>setTech(p=>({...p,section:e.target.value}))} /></td>
                            <td><input value={tech.size} onChange={e=>setTech(p=>({...p,size:e.target.value}))} /></td>
                            <td><input value={tech.colourShade} onChange={e=>setTech(p=>({...p,colourShade:e.target.value}))} /></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <Row>
                      {/* Gear-box */}
                      <Col xs={12} md={4} className="mb-3">
                        <table className="gear-table">
                          <thead>
                            <tr><th>Gear-box</th><th>HP rating<br/>(e.g. 1.5 hp...)</th><th>Company Name</th></tr>
                          </thead>
                          <tbody>
                            {[["M","hpM","companyM"],["ME","hpME","companyME"]].map(([lbl,hpKey,coKey])=>(
                              <tr key={lbl}>
                                <td style={{ fontWeight:600,color:"var(--ud-muted)",textAlign:"center" }}>{lbl}</td>
                                <td><input value={tech[hpKey]} onChange={e=>setTech(p=>({...p,[hpKey]:e.target.value}))} /></td>
                                <td>
                                  {["Transmatix","Kavitsu","OTHER"].map(v=>(
                                    <Radio key={v} name={coKey} value={v} checked={tech[coKey]===v} onChange={()=>setTech(p=>({...p,[coKey]:v}))} label={v} />
                                  ))}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </Col>

                      {/* Bearing */}
                      <Col xs={12} md={3} className="mb-3">
                        <table className="bearing-table">
                          <thead>
                            <tr><th>Bearing</th><th>Tick</th><th>Particulars<br/>(e.g.UCP-214...)</th></tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>UCP</td>
                              <td><input type="checkbox" checked={tech.bearingUCP} onChange={e=>setTech(p=>({...p,bearingUCP:e.target.checked}))} /></td>
                              <td><input type="text" value={tech.bearingUCPPart} onChange={e=>setTech(p=>({...p,bearingUCPPart:e.target.value}))} /></td>
                            </tr>
                            <tr>
                              <td>Pedestal Type</td>
                              <td><input type="checkbox" checked={tech.bearingPedestal} onChange={e=>setTech(p=>({...p,bearingPedestal:e.target.checked}))} /></td>
                              <td><input type="text" value={tech.bearingPedestalPart} onChange={e=>setTech(p=>({...p,bearingPedestalPart:e.target.value}))} /></td>
                            </tr>
                          </tbody>
                        </table>
                      </Col>

                      {/* Electrical */}
                      <Col xs={12} md={5} className="mb-3">
                        <div style={{ border:"1px solid var(--ud-border)",borderRadius:10,padding:"12px 14px" }}>
                          <span className="mm-sec-lbl">Electrical</span>
                          <Row>
                            <Col xs={7}>
                              {[["semiAuto","Semi Auto"],["autoWithPC","Auto With PC Interface"],["withVFD","With VFD"],["hangingTrolleys","Hanging Trolleys"],["busBar","Bus Bar"],["floorSensor","Floor Sensor"],["manInsideDisplay","MAN INSIDE display"]].map(([k,lbl])=>(
                                <Chk key={k} checked={tech.elec[k]} onChange={e=>setTech(p=>({...p,elec:{...p.elec,[k]:e.target.checked}}))} label={lbl} />
                              ))}
                            </Col>
                            <Col xs={5}>
                              {[["auto","Auto"],["withoutVFD","Without VFD"],["wireRope","Wire - Rope"]].map(([k,lbl])=>(
                                <Chk key={k} checked={tech.elec[k]} onChange={e=>setTech(p=>({...p,elec:{...p.elec,[k]:e.target.checked}}))} label={lbl} />
                              ))}
                              <div style={{ marginTop:10 }}>
                                <span className="mm-label">Description</span>
                                <UInput value={tech.electricalDesc} onChange={e=>setTech(p=>({...p,electricalDesc:e.target.value}))} />
                              </div>
                            </Col>
                          </Row>
                        </div>
                      </Col>
                    </Row>

                    {/* Material Estimation */}
                    <span className="mm-sec-lbl mt-2">Material Estimation (Mktg)</span>
                    <div style={{ overflowX:"auto" }}>
                      <table className="mat-table">
                        <thead>
                          <tr>
                            <th style={{ width:160 }}>Material</th>
                            <th style={{ minWidth:180 }}></th>
                            <th style={{ color:"#e8560a",minWidth:100 }}>Weight</th>
                            <th style={{ width:20 }}></th>
                            <th colSpan={2} style={{ color:"#1d6fbd" }}>Cost In Rupees</th>
                          </tr>
                        </thead>
                        <tbody>
                          {matRows.map((row,i)=>(
                            <React.Fragment key={i}>
                              {row.hasEXT && (
                                <tr>
                                  <td></td>
                                  <td style={{ padding:"3px 10px" }}>
                                    <div style={{ display:"flex",gap:40 }}>
                                      <span style={{ fontSize:".76rem",color:"#e8560a",fontWeight:700 }}>EXT</span>
                                      <span style={{ fontSize:".76rem",color:"#1d6fbd",fontWeight:700 }}>INT</span>
                                    </div>
                                  </td>
                                  <td></td><td></td>
                                  <td style={{ fontSize:".76rem",color:"#e8560a",fontWeight:700 }}>EXT</td>
                                  <td style={{ fontSize:".76rem",color:"#1d6fbd",fontWeight:700 }}>INT</td>
                                </tr>
                              )}
                              <tr>
                                <td className="row-label">{row.label}</td>
                                {row.hasEXT ? (
                                  <td>
                                    <div style={{ display:"flex",gap:8 }}>
                                      <input value={row.weightEXT} onChange={e=>updMat(i,"weightEXT",e.target.value)} style={{ flex:1 }} />
                                      <input value={row.weightINT} onChange={e=>updMat(i,"weightINT",e.target.value)} style={{ flex:1 }} />
                                    </div>
                                  </td>
                                ) : (
                                  <td><input value={row.desc} onChange={e=>updMat(i,"desc",e.target.value)} /></td>
                                )}
                                <td>
                                  <div style={{ display:"flex",alignItems:"center",gap:4,justifyContent:"center" }}>
                                    <input value={row.weight} onChange={e=>updMat(i,"weight",e.target.value)} style={{ width:60 }} />
                                    {row.unitWeight && <span style={{ fontSize:".76rem",color:"var(--ud-muted)",whiteSpace:"nowrap" }}>{row.unitWeight}</span>}
                                  </div>
                                </td>
                                <td></td>
                                <td><span style={{ marginRight:3 }}>₹</span><input value={row.costEXT} onChange={e=>updMat(i,"costEXT",e.target.value)} /></td>
                                {row.hasEXT ? (
                                  <td><span style={{ marginRight:3 }}>₹</span><input value={row.costINT} onChange={e=>updMat(i,"costINT",e.target.value)} /></td>
                                ) : <td></td>}
                              </tr>
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Block>

                  {/* ─ SITE MEASUREMENTS INFO ─ */}
                  <Block title="SITE MEASUREMENTS INFO">
                    <div style={{ overflowX:"auto",marginBottom:20 }}>
                      <table className="sm-table">
                        <thead>
                          <tr><th style={{ width:"32%" }}></th><th style={{ width:"36%" }}></th><th>Remark</th></tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="q-label">Actual Site measurements Taken?</td>
                            <td>
                              <div style={{ display:"flex",gap:20 }}>
                                <Radio name="actualMeas" value="Yes" checked={siteMeas.actualMeasTaken==="Yes"} onChange={()=>setSiteMeas(p=>({...p,actualMeasTaken:"Yes"}))} label="Yes" />
                                <Radio name="actualMeas" value="No"  checked={siteMeas.actualMeasTaken==="No"}  onChange={()=>setSiteMeas(p=>({...p,actualMeasTaken:"No"}))}  label="No" />
                              </div>
                            </td>
                            <td><input type="text" value={siteMeas.actualMeasRemark} onChange={e=>setSiteMeas(p=>({...p,actualMeasRemark:e.target.value}))} /></td>
                          </tr>
                          <tr>
                            <td className="q-label">Measurements taken by</td>
                            <td><input type="text" value={siteMeas.measTakenBy} onChange={e=>setSiteMeas(p=>({...p,measTakenBy:e.target.value}))} /></td>
                            <td><input type="text" value={siteMeas.measTakenByRemark} onChange={e=>setSiteMeas(p=>({...p,measTakenByRemark:e.target.value}))} /></td>
                          </tr>
                          <tr>
                            <td className="q-label">Approval of Layout from customer Required ?</td>
                            <td>
                              <div style={{ display:"flex",gap:20 }}>
                                <Radio name="approvalReq" value="Yes" checked={siteMeas.approvalRequired==="Yes"} onChange={()=>setSiteMeas(p=>({...p,approvalRequired:"Yes"}))} label="Yes" />
                                <Radio name="approvalReq" value="No"  checked={siteMeas.approvalRequired==="No"}  onChange={()=>setSiteMeas(p=>({...p,approvalRequired:"No"}))}  label="No" />
                              </div>
                            </td>
                            <td><input type="text" value={siteMeas.approvalRemark} onChange={e=>setSiteMeas(p=>({...p,approvalRemark:e.target.value}))} /></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:14 }}>
                      <span style={{ fontSize:".85rem",fontWeight:600,color:"var(--ud-text)" }}>Documents making part of data-sheet</span>
                      <button onClick={addDocRow} style={{ background:"#e8560a",border:"none",borderRadius:"50%",width:26,height:26,color:"#fff",fontSize:"1.2rem",cursor:"pointer",lineHeight:"26px",textAlign:"center" }}>+</button>
                    </div>
                    {docRows.map((row,i)=>(
                      <div key={i} style={{ display:"flex",alignItems:"center",gap:12,marginBottom:10 }}>
                        <input
                          type="text"
                          placeholder={i===0 ? "ENTER DOCUMENT NAME" : "ENTER PROJECT DATA SHEET"}
                          value={row.name}
                          onChange={e=>setDocRows(r=>r.map((x,idx)=>idx===i?{...x,name:e.target.value}:x))}
                          style={{ flex:1,border:"none",borderBottom:"1.5px solid var(--ud-border)",background:"transparent",outline:"none",fontSize:".85rem",color:"var(--ud-text)",padding:"3px 0",fontFamily:"'DM Sans',sans-serif" }}
                        />
                        <label style={{ display:"flex",alignItems:"center",gap:8,cursor:"pointer",flexShrink:0 }}>
                          <button style={{ background:"transparent",border:"1px solid var(--ud-border)",borderRadius:5,padding:"4px 12px",fontSize:".8rem",color:"var(--ud-text)",cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>Choose File</button>
                          <span style={{ fontSize:".8rem",color:"var(--ud-muted)" }}>{row.file ? row.file.name : "No file chosen"}</span>
                          <input type="file" style={{ display:"none" }} onChange={e=>setDocRows(r=>r.map((x,idx)=>idx===i?{...x,file:e.target.files[0]}:x))} />
                        </label>
                        {i>0 && (
                          <button onClick={()=>removeDocRow(i)} style={{ background:"#e8560a",border:"none",borderRadius:"50%",width:24,height:24,color:"#fff",fontSize:"1rem",cursor:"pointer",lineHeight:"24px",textAlign:"center",flexShrink:0 }}>−</button>
                        )}
                      </div>
                    ))}
                  </Block>

                  {/* View Data Sheet */}
                  <div className="text-center mt-3">
                    <button
                      onClick={handleViewDataSheet}
                      disabled={!fileDetails}
                      style={{ background:"linear-gradient(135deg,#1d6fbd 0%,#1a9ed9 100%)",border:"none",color:"#fff",borderRadius:10,padding:"13px 44px",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:"1rem",letterSpacing:".04em",cursor:fileDetails?"pointer":"not-allowed",opacity:fileDetails?1:.6,boxShadow:"0 6px 20px rgba(29,111,189,.35)",transition:"transform .18s,box-shadow .18s" }}
                      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 10px 28px rgba(29,111,189,.45)";}}
                      onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 6px 20px rgba(29,111,189,.35)";}}
                    >
                      <i className="bi bi-file-earmark-text me-2"/>View Project Data Sheet
                    </button>
                  </div>
                </div>
              </Tab>

              {/* ══════════ PO DETAILS TAB ══════════ */}
              <Tab eventKey="po" title={<span><i className="bi bi-receipt me-2"/>PO Details</span>}>
                <div style={{ padding:"28px" }} className="fade-in">
                  {poDetails.length === 0 ? (
                    <Alert variant="info" className="text-center">
                      <i className="bi bi-info-circle me-2"/>No PO details available
                    </Alert>
                  ) : (
                    <Row>
                      {poDetails.map((po,i)=>(
                        <Col lg={6} key={i} className="mb-4">
                          <div className="ud-po-card">
                            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14 }}>
                              <h5 style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,color:"var(--ud-accent)",margin:0 }}>{po.po_type} — V{po.po_version_no}</h5>
                              <span className="ud-badge active"><span className="dot"/>Active</span>
                            </div>
                            {[["PO Number",po.po_number],["PO Date",po.po_date],["PO Amount",`₹${parseFloat(po.po_basic_amount||0).toLocaleString("en-IN")}`],["PO Type",po.po_type]].map(([k,v])=>(
                              <div key={k} style={{ marginBottom:8,fontSize:".88rem" }}>
                                <strong style={{ color:"var(--ud-muted)",fontWeight:600 }}>{k}: </strong>
                                <span style={{ color:"var(--ud-text)" }}>{v}</span>
                              </div>
                            ))}
                            <div style={{ background:"var(--ud-header-bg)",borderRadius:8,padding:"10px 14px",marginTop:12,marginBottom:14,fontSize:".82rem",color:"var(--ud-muted)" }}>
                              <i className="bi bi-clock-history me-2" style={{ color:"var(--ud-accent)" }}/>
                              Last Uploaded: <strong style={{ color:"var(--ud-text)" }}>{po.last_uploaded}</strong>
                            </div>
                            <Button variant="outline-primary" size="sm" className="w-100">
                              <i className="bi bi-eye me-2"/>View PO Document
                            </Button>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  )}
                </div>
              </Tab>

            </Tabs>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default UploadDrawingDetails;