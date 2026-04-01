import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Container, Card, Row, Col, Tabs, Tab,
  Button, Alert, Spinner,
} from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

/* ══════════════════════════════════════════
   CONFIG  –  update base URL to your server
══════════════════════════════════════════ */
const API_BASE = "http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/MMSSApi.php"; // ← change this

/* ══════════════════════════════════════════
   GLOBAL CSS
══════════════════════════════════════════ */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');

  @keyframes slideIn  { from{transform:translateX(420px);opacity:0} to{transform:translateX(0);opacity:1} }
  @keyframes slideOut { from{transform:translateX(0);opacity:1}     to{transform:translateX(420px);opacity:0} }
  @keyframes fadeUp   { from{opacity:0;transform:translateY(12px)}  to{opacity:1;transform:translateY(0)} }
  @keyframes pulse-dot{ 0%,100%{transform:scale(1)} 50%{transform:scale(1.4)} }

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
`;

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

const UInput = ({ value, onChange, placeholder = "", style = {} }) => (
  <input className="mm-input" value={value || ""} onChange={onChange} placeholder={placeholder} style={style} />
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
    <div style={{ padding: "10px 0", borderBottom: "1px solid var(--ud-border)" }}>
      <div className="ud-info-label">{label}</div>
      <div className="ud-info-value accent">{fmt(value)}</div>
    </div>
  </Col>
);

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
const MMSSDataSheet = () => {
  const { projectId: paramProjectId, fileId: paramFileId } = useParams();

  // Resolve IDs from params or URL hash
  const getIds = () => {
    const hash = window.location.hash;
    const m = hash.match(/\/mmss-datasheet\/(\d+)\/(\d+)/);
    if (m) return { projectId: m[1], fileId: m[2] };
    return { projectId: paramProjectId || "3272", fileId: paramFileId || "4990" };
  };

  const { projectId, fileId } = getIds();

  const [theme, setTheme]         = useState("light");
  const [activeTab, setActiveTab] = useState("project");
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  // ── All section data from API ──
  const [project,     setProject]     = useState(null);
  const [siteDates,   setSiteDates]   = useState(null);
  const [typeSystem,  setTypeSystem]  = useState(null);
  const [foundation,  setFoundation]  = useState(null);
  const [technical,   setTechnical]   = useState(null);
  const [siteMeasure, setSiteMeasure] = useState(null);

  // ── Editable states (pre-filled from API) ──
  const [instructions, setInstructions] = useState({ specialOfficialReq: "", specialInstruction: "", specialRequirement: "", aestheticsInfo: "" });
  const [ambassador,      setAmbassador]      = useState("");
  const [ambassadorOther, setAmbassadorOther] = useState("");
  const [taxDoc,          setTaxDoc]          = useState("");
  const [taxDocOther,     setTaxDocOther]     = useState("");
  const [dimRows, setDimRows] = useState([]);
  const [loadDet, setLoadDet] = useState({});
  const [fixUnit, setFixUnit] = useState({});
  const [meUnit,  setMeUnit]  = useState({});
  const [fnd, setFnd]         = useState({});
  const [tech, setTech]       = useState({ trolleyRows: [], gearM: null, gearME: null, bearingRows: [], matData: {}, elecRows: {} });
  const [measState, setMeasState] = useState({ actualMeasTaken: "", actualMeasRemark: "", measTakenBy: "", measTakenByRemark: "", approvalRequired: "", approvalRemark: "" });
  const [docRows, setDocRows] = useState([{ name: "", file: null }]);

  // CSS injection
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = GLOBAL_CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  // Theme CSS vars
  useEffect(() => {
    const r = document.documentElement;
    if (theme === "dark") {
      r.style.setProperty("--ud-bg", "#13161e");
      r.style.setProperty("--ud-card", "#1e2330");
      r.style.setProperty("--ud-header-bg", "#252b3b");
      r.style.setProperty("--ud-border", "#2e3650");
      r.style.setProperty("--ud-text", "#e8edf5");
      r.style.setProperty("--ud-muted", "#8b95af");
      r.style.setProperty("--ud-accent", "#60a5fa");
      document.body.classList.add("dark-ud");
    } else {
      r.style.setProperty("--ud-bg", "#f0f4f8");
      r.style.setProperty("--ud-card", "#ffffff");
      r.style.setProperty("--ud-header-bg", "#f7f9fc");
      r.style.setProperty("--ud-border", "#d8e0ec");
      r.style.setProperty("--ud-text", "#1a2340");
      r.style.setProperty("--ud-muted", "#7a8aaa");
      r.style.setProperty("--ud-accent", "#1d6fbd");
      document.body.classList.remove("dark-ud");
    }
    document.body.style.background = "var(--ud-bg)";
  }, [theme]);

  // Toast
  const toast = (msg, type = "info") => {
    const d = document.createElement("div");
    const bg = type === "success" ? "#16a34a" : type === "error" ? "#dc2626" : "#2563eb";
    d.style.cssText = `position:fixed;top:22px;right:22px;padding:13px 22px;background:${bg};color:#fff;border-radius:10px;box-shadow:0 6px 20px rgba(0,0,0,.2);z-index:9999;font-family:'DM Sans',sans-serif;font-size:.9rem;font-weight:500;animation:slideIn .3s ease-out;`;
    d.textContent = msg;
    document.body.appendChild(d);
    setTimeout(() => { d.style.animation = "slideOut .3s ease-out"; setTimeout(() => d.remove(), 300); }, 3000);
  };

  // ── Fetch ALL sections from new API ──
  const fetchAll = async () => {
    setLoading(true); setError(null);
    try {
      const url = `${API_BASE}?section=all&projectID=${projectId}&fileId=${fileId}`;
      const res  = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      if (json.status !== "success") throw new Error(json.message || "API error");

      const d = json.data;

      // Project details
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

      // Site dates
      setSiteDates(d.site_date_details || {});

      // Type of system
      const ts = d.type_of_system || {};
      setTypeSystem(ts);
      setDimRows(ts.dimensions || [{ length:"", width:"", totalHeight:"", superHeight:"", qty:"", levels:"", bays:"" }]);
      setFixUnit(ts.fix_unit   || {});
      setMeUnit(ts.me_unit     || {});
      setLoadDet(ts.load_details || {});

      // Foundation
      const fi = d.foundation_info || {};
      setFoundation(fi);
      setFnd({
        siteFloorNumber:  fi.site_floor_number    || "",
        anyObstructions:  fi.obstructions         || "",
        ftRailSection30:  fi.foundation_type?.flanged_wheel     || false,
        ftRailSectionAll: fi.foundation_type?.rail_section      || false,
        ftMentionLB:      fi.foundation_type?.rail_lb           || "",
        ftFoundationFlat: fi.foundation_type?.foundation_flat   || false,
        ftMentionFlat:    fi.foundation_type?.flat_detail       || "",
        fmMS:             fi.foundation_material?.MS     || false,
        fmSS:             fi.foundation_material?.SS     || false,
        fmOTHER:          fi.foundation_material?.OTHER  || false,
        fmMentionOther:   fi.foundation_material?.other_value || "",
        fFoundation:      fi.foundation   || "",
        wheelDesign:      fi.wheel_design || "",
        floorType:        fi.floor_type   || "",
        floorTypeOther:   fi.floor_type_other || "",
        workingHours:     fi.working_hours    || "",
        weeklyHolidays:   fi.weekly_holidays  || "",
      });

      // Technical & Material
      const tm = d.technical_material || {};
      setTechnical(tm);
      setTech({
        trolleyRows: tm.trolley_rows    || [],
        gearM:       tm.gear_box_m      || null,
        gearME:      tm.gear_box_me     || null,
        bearingRows: tm.bearing         || [],
        matData:     tm.material_estimation || {},
        elecRows:    tm.electrical_rows || {},
      });

      // Site measurements
      const sm = d.site_measurements || {};
      setSiteMeasure(sm);
      setMeasState({
        actualMeasTaken:    sm.actual_measurement_taken?.is_done || "",
        actualMeasRemark:   sm.actual_measurement_taken?.remark  || "",
        measTakenBy:        sm.measurement_taken_by?.is_done     || "",
        measTakenByRemark:  sm.measurement_taken_by?.remark      || "",
        approvalRequired:   sm.customer_approval?.is_done        || "",
        approvalRemark:     sm.customer_approval?.remark         || "",
      });

      toast("Data loaded successfully", "success");
    } catch (e) {
      setError(e.message);
      toast(`Error: ${e.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [fileId]);

  // Dim helpers
  const addDimRow    = () => setDimRows(r => [...r, { length:"", width:"", totalHeight:"", superHeight:"", qty:"", levels:"", bays:"" }]);
  const removeDimRow = (i) => setDimRows(r => r.filter((_,idx) => idx !== i));
  const updDim       = (i, k, v) => setDimRows(r => r.map((row, idx) => idx === i ? { ...row, [k]: v } : row));

  const D = (k) => siteDates?.dates?.[k] || "";

  const UNIT_LABELS = { OPEN:"OPEN", CPSheet:"CP Sheet", ENDCovers:"END Covers", DOORFrame:"DOOR Frame", OTHER:"OTHER" };

  const MAT_ROWS = [
    { key:"Foundation",       label:"Foundation",        unit:"Kgs",   hasEXT:false },
    { key:"Fabrication",      label:"Fabrication",       unit:"Kgs",   hasEXT:false },
    { key:"Sheet-metal_Ext",  label:"Sheet-metal (EXT)", unit:"Kgs",   hasEXT:false },
    { key:"Sheet-metal_Ixt",  label:"Sheet-metal (INT)", unit:"Kgs",   hasEXT:false },
    { key:"Powder_Ext",       label:"Powder (EXT)",      unit:"Sq ft", hasEXT:false },
    { key:"Powder_Ixt",       label:"Powder (INT)",      unit:"Sq ft", hasEXT:false },
    { key:"Hardware",         label:"Hardware",          unit:"Kgs",   hasEXT:false },
    { key:"Assembly",         label:"Assembly",          unit:"Kgs",   hasEXT:false },
    { key:"Electrical Mtl",   label:"Electrical Mtl",    unit:"",      hasEXT:false },
    { key:"Man-Days on Site", label:"Man-Days on Site",  unit:"Nos",   hasEXT:false },
    { key:"Site Expenses",    label:"Site Expenses",     unit:"Rs.",   hasEXT:false },
    { key:"Despatch Lot",     label:"Despatch Lot",      unit:"",      hasEXT:false },
    { key:"Transportation Cost", label:"Transportation Cost", unit:"", hasEXT:false },
    { key:"Total Weight (KG)", label:"Total Weight (KG)", unit:"",    hasEXT:false },
    { key:"RM Cost",          label:"RM Cost",            unit:"",     hasEXT:false },
  ];

  // ── Loading / Error ──
  if (loading) return (
    <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#f0f4f8" }}>
      <div style={{ textAlign:"center" }}>
        <Spinner animation="border" style={{ width:"3rem",height:"3rem",color:"#1d6fbd" }} />
        <p className="mt-3" style={{ fontFamily:"'DM Sans',sans-serif",fontWeight:500,color:"#1a2340" }}>Loading MMSS Data Sheet…</p>
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

  /* ═══════ RENDER ═══════ */
  return (
    <div className="ud-root" style={{ minHeight:"100vh",background:"var(--ud-bg)",padding:"24px 0" }}>
      <Container fluid style={{ maxWidth:1440 }}>
        <Card style={{ background:"var(--ud-card)",border:"1px solid var(--ud-border)",borderRadius:16,boxShadow:"0 8px 32px rgba(0,0,0,.1)",overflow:"hidden" }}>

          {/* ── HEADER ── */}
          <Card.Header className={theme === "dark" ? "ud-header-grad-dark" : "ud-header-grad"} style={{ padding:"22px 28px",borderBottom:"none" }}>
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
                    { icon:"bi-hash",    label:"File ID",   val:fileId },
                    { icon:"bi-building",label:"Customer",  val:project?.customer_name || "—" },
                    { icon:"bi-box",     label:"Product",   val:project?.product_type  || "—" },
                  ].map(it => (
                    <span key={it.label} style={{ fontSize:".82rem",color:"rgba(255,255,255,.82)",display:"flex",alignItems:"center",gap:5 }}>
                      <i className={`bi ${it.icon}`}/><strong style={{ color:"rgba(255,255,255,.6)",fontWeight:500 }}>{it.label}:&nbsp;</strong>{it.val}
                    </span>
                  ))}
                </div>
              </Col>
              <Col xs={12} lg={4} className="text-end mt-3 mt-lg-0">
                <button onClick={() => setTheme(t => t === "light" ? "dark" : "light")} style={{ background:"rgba(255,255,255,.15)",border:"1.5px solid rgba(255,255,255,.3)",color:"#fff",borderRadius:8,padding:"7px 16px",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:".83rem",cursor:"pointer",marginRight:10 }}>
                  {theme === "light" ? "🌙 Dark" : "☀️ Light"}
                </button>
                <button onClick={() => window.history.back()} style={{ background:"rgba(255,255,255,.15)",border:"1.5px solid rgba(255,255,255,.3)",color:"#fff",borderRadius:8,padding:"7px 16px",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:".83rem",cursor:"pointer" }}>
                  ← Back
                </button>
              </Col>
            </Row>
          </Card.Header>

          {/* ── TABS ── */}
          <Card.Body style={{ padding:0 }}>
            <Tabs activeKey={activeTab} onSelect={setActiveTab} className="ud-tabs mb-0" style={{ background:"var(--ud-header-bg)" }}>

              {/* ══ PROJECT DETAILS TAB ══ */}
              <Tab eventKey="project" title={<span><i className="bi bi-file-text me-2"/>Project Details</span>}>
                <div style={{ padding:"28px 28px 40px" }} className="fade-in">

                  {/* ── PROJECT DETAILS ── */}
                  <Block title="PROJECT DETAILS">
                    <Row>
                      <InfoRow label="File Name"            value={project?.file_name} />
                      <InfoRow label="Product Type"         value={project?.product_type} />
                      <InfoRow label="Client / Company"     value={project?.customer_name} />
                      <InfoRow label="Shipping Address"     value={project?.shipping_address} />
                      <InfoRow label="Contact Person"       value={project?.contact_person} />
                      <InfoRow label="Contact Phone"        value={project?.contact_number} />
                    </Row>
                    <Row className="mt-2">
                      <Col xs={12} md={6} className="mb-3">
                        <span className="ud-info-label d-block mb-2">Customer Ambassador</span>
                        <div style={{ display:"flex",gap:18,flexWrap:"wrap" }}>
                          {["AGP","SVJ","RPK","OTHER"].map(opt => (
                            <label key={opt} className="mm-radio-row" style={{ marginBottom:0 }}>
                              <input type="radio" name="ambassador" value={opt} checked={ambassador === opt} onChange={() => setAmbassador(opt)} />{opt}
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
                              <input type="radio" name="taxdoc" value={opt} checked={taxDoc === opt} onChange={() => setTaxDoc(opt)} />{opt}
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

                  {/* ── SITE DATE + INSTRUCTIONS ── */}
                  <Row className="g-3 mb-2">
                    <Col xs={12} lg={7}>
                      <Block title="SITE DATE DETAILS">
                        <table className="ud-date-table">
                          <thead><tr><th style={{ textAlign:"left" }}></th><th>Dates</th><th></th><th>Dates</th></tr></thead>
                          <tbody>
                            {[
                              ["Site Form Issued","siteFormIssuedDate","Foundation date","foundationDate"],
                              ["Dispatch-Foundation","dispatchFoundationDate","Primary Info","primaryInfoDate"],
                              ["1st Dispatch","firstDispatchDate","Design Date","completedFileDate"],
                              ["Last Dispatch","lastDispatchDate","Committed date of handover","commitedDispatchDate"],
                            ].map(([l1,k1,l2,k2]) => (
                              <tr key={k1}>
                                <td style={{ color:"var(--ud-accent)",fontWeight:600 }}>{l1}</td>
                                <td><input type="date" defaultValue={D(k1)} className="ud-date-table" /></td>
                                <td style={{ color:"var(--ud-accent)",fontWeight:600 }}>{l2}</td>
                                <td><input type="date" defaultValue={D(k2)} /></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </Block>
                    </Col>
                    <Col xs={12} lg={5}>
                      <Block title="INSTRUCTIONS">
                        {[
                          ["Any Special Official Requirement?","specialOfficialReq"],
                          ["Special Instructions (if any)","specialInstruction"],
                          ["Special Requirements (if any)","specialRequirement"],
                          ["Special Instructions regarding aesthetics","aestheticsInfo"],
                        ].map(([lbl,key]) => (
                          <div key={key}>
                            <label className="ud-instr-label">{lbl}</label>
                            <textarea className="ud-instr-ta" value={instructions[key]} onChange={e => setInstructions(p => ({ ...p, [key]: e.target.value }))} />
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

                    <div style={{ fontSize:".85rem",fontWeight:600,color:"var(--ud-text)",marginBottom:10 }}>Overall Dimension Related Information :</div>
                    <div style={{ overflowX:"auto",marginBottom:18 }}>
                      <table className="dim-table">
                        <thead>
                          <tr>
                            <th style={{ width:44 }}>
                              <button onClick={addDimRow} style={{ background:"#e8560a",border:"none",borderRadius:"50%",width:26,height:26,color:"#fff",fontSize:"1.2rem",cursor:"pointer" }}>+</button>
                            </th>
                            <th>Length (mm)</th><th>Width (mm)</th><th>Total Height (mm)</th>
                            <th>Superstructure (mm)</th><th>Qty</th><th>Levels</th><th>No. of bays</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dimRows.map((row, i) => (
                            <tr key={i}>
                              <td style={{ textAlign:"center" }}>
                                <button onClick={() => removeDimRow(i)} style={{ background:"#dc2626",border:"none",borderRadius:"50%",width:22,height:22,color:"#fff",cursor:"pointer" }}>−</button>
                              </td>
                              {["length","width","height","super_structure","quantity","levels","no_req_bays"].map(k => (
                                <td key={k}><input value={row[k] || ""} onChange={e => updDim(i, k, e.target.value)} /></td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <Row className="mb-3">
                      {[["Fix Unit", fixUnit, setFixUnit], ["ME Unit", meUnit, setMeUnit]].map(([lbl, state, setter]) => (
                        <Col xs={12} md={6} key={lbl}>
                          <span className="mm-sec-lbl">{lbl}</span>
                          <div style={{ display:"flex",flexWrap:"wrap",gap:14 }}>
                            {Object.keys(UNIT_LABELS).map(k => (
                              <Chk key={k} checked={state[k]} onChange={e => setter(p => ({ ...p, [k]: e.target.checked }))} label={UNIT_LABELS[k]} />
                            ))}
                          </div>
                          {state.OTHER && <div style={{ marginTop:8 }}><UInput value={state.other_value || ""} onChange={e => setter(p => ({ ...p, other_value: e.target.value }))} placeholder={`Other ${lbl}...`} /></div>}
                        </Col>
                      ))}
                    </Row>

                    <span className="mm-sec-lbl">Load Details</span>
                    <Row>
                      {[
                        ["pallet_size","Pallet Size"],["load_per_pallet","Load Per Pallet(KG)"],
                        ["material_to_stored","Material To Be Stored"],["drive_box","Drive Box"],
                        ["matching_angles","Matching Angles"],["dimension_taken_by","Dimensions Taken By"],
                      ].map(([k,lbl]) => (
                        <Col xs={12} md={2} key={k} className="mb-3">
                          <span className="mm-label">{lbl}</span>
                          <UInput value={loadDet[k]} onChange={e => setLoadDet(p => ({ ...p, [k]: e.target.value }))} />
                        </Col>
                      ))}
                    </Row>
                  </Block>

                  {/* ── FOUNDATION ── */}
                  <Block title="FOUNDATION RELATED INFO">
                    <Row className="mb-3">
                      <Col xs={12} md={6}><span className="mm-label">Site Floor Number</span><UInput value={fnd.siteFloorNumber} onChange={e => setFnd(p => ({ ...p, siteFloorNumber: e.target.value }))} /></Col>
                      <Col xs={12} md={6}><span className="mm-label">Any Obstructions</span><UInput value={fnd.anyObstructions} onChange={e => setFnd(p => ({ ...p, anyObstructions: e.target.value }))} /></Col>
                    </Row>
                    <Row>
                      <Col xs={12} md={4} className="mb-3">
                        <span className="mm-sec-lbl">Foundation Type</span>
                        <Chk checked={fnd.ftRailSection30} onChange={e => setFnd(p => ({ ...p, ftRailSection30: e.target.checked }))} label="Rail Section (30 lbs) & Flanged Wheel Rails Only" />
                        <Chk checked={fnd.ftRailSectionAll} onChange={e => setFnd(p => ({ ...p, ftRailSectionAll: e.target.checked }))} label="Rail Section & All Rails" />
                        {fnd.ftRailSectionAll && <div style={{ marginLeft:22,marginTop:4 }}><span style={{ fontSize:".76rem",color:"var(--ud-muted)" }}>Mention LB</span><UInput value={fnd.ftMentionLB} onChange={e => setFnd(p => ({ ...p, ftMentionLB: e.target.value }))} /></div>}
                        <Chk checked={fnd.ftFoundationFlat} onChange={e => setFnd(p => ({ ...p, ftFoundationFlat: e.target.checked }))} label="Foundation Flat & All Rails" />
                        {fnd.ftFoundationFlat && <div style={{ marginLeft:22,marginTop:4 }}><span style={{ fontSize:".76rem",color:"var(--ud-muted)" }}>Mention Flat</span><UInput value={fnd.ftMentionFlat} onChange={e => setFnd(p => ({ ...p, ftMentionFlat: e.target.value }))} /></div>}
                      </Col>
                      <Col xs={12} md={2} className="mb-3">
                        <span className="mm-sec-lbl">Foundation Material</span>
                        <Chk checked={fnd.fmMS}    onChange={e => setFnd(p => ({ ...p, fmMS:    e.target.checked }))} label="MS" />
                        <Chk checked={fnd.fmSS}    onChange={e => setFnd(p => ({ ...p, fmSS:    e.target.checked }))} label="SS" />
                        <Chk checked={fnd.fmOTHER} onChange={e => setFnd(p => ({ ...p, fmOTHER: e.target.checked }))} label="OTHER" />
                        {fnd.fmOTHER && <UInput value={fnd.fmMentionOther} onChange={e => setFnd(p => ({ ...p, fmMentionOther: e.target.value }))} placeholder="Mention material..." />}
                      </Col>
                      <Col xs={12} md={2} className="mb-3">
                        <span className="mm-sec-lbl">Foundation</span>
                        {["Flush to floor","Above floor"].map(v => <Radio key={v} name="fnd_pos" value={v} checked={fnd.fFoundation === v} onChange={() => setFnd(p => ({ ...p, fFoundation: v }))} label={v} />)}
                      </Col>
                      <Col xs={12} md={2} className="mb-3">
                        <span className="mm-sec-lbl">Wheel Design</span>
                        {["Two Wheel","Three Wheel","Four Wheel"].map(v => <Radio key={v} name="wheel" value={v} checked={fnd.wheelDesign === v} onChange={() => setFnd(p => ({ ...p, wheelDesign: v }))} label={v} />)}
                      </Col>
                      <Col xs={12} md={2} className="mb-3">
                        <span className="mm-sec-lbl">Floor Type</span>
                        {["PCC","Kota","Tiles","GreenField","OTHER"].map(v => <Radio key={v} name="floortype" value={v} checked={fnd.floorType === v} onChange={() => setFnd(p => ({ ...p, floorType: v }))} label={v === "GreenField" ? "Green Field" : v} />)}
                        {fnd.floorType === "OTHER" && <UInput value={fnd.floorTypeOther} onChange={e => setFnd(p => ({ ...p, floorTypeOther: e.target.value }))} placeholder="Mention floor type..." />}
                      </Col>
                    </Row>
                    <Row>
                      <Col xs={12} md={5} className="mb-2"><span className="mm-label">Working Hours</span><UInput value={fnd.workingHours} onChange={e => setFnd(p => ({ ...p, workingHours: e.target.value }))} /></Col>
                      <Col xs={12} md={5} className="mb-2"><span className="mm-label">Weekly Holidays</span><UInput value={fnd.weeklyHolidays} onChange={e => setFnd(p => ({ ...p, weeklyHolidays: e.target.value }))} /></Col>
                    </Row>
                  </Block>

                  {/* ── TECHNICAL & MATERIAL ── */}
                  <Block title="TECHNICAL & MATERIAL CONSIDERATION FROM MARKETING">
                    {/* Trolley Table */}
                    <div style={{ overflowX:"auto",marginBottom:18 }}>
                      <table className="dim-table" style={{ minWidth:600 }}>
                        <thead><tr><th>Type</th><th>Trolley</th><th>Section</th><th>Size</th><th>Colour Shade</th></tr></thead>
                        <tbody>
                          {tech.trolleyRows.length > 0 ? tech.trolleyRows.map((row, i) => (
                            <tr key={i}>
                              <td><input value={row.type || ""} readOnly /></td>
                              <td><input value={row.trolley || ""} readOnly /></td>
                              <td>
                                {["ISMC","MSTube"].map(v => (
                                  <label key={v} className="mm-radio-row" style={{ display:"inline-flex",marginRight:12 }}>
                                    <input type="radio" name={`section_${i}`} value={v} defaultChecked={row.section === v} readOnly />{v}
                                  </label>
                                ))}
                              </td>
                              <td><input value={row.size || ""} readOnly /></td>
                              <td><input value={row.colour_shade || ""} readOnly /></td>
                            </tr>
                          )) : (
                            <tr><td colSpan={5} style={{ color:"var(--ud-muted)",textAlign:"center",padding:16 }}>No trolley data</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <Row>
                      {/* Gear Box */}
                      <Col xs={12} md={4} className="mb-3">
                        <table className="gear-table">
                          <thead><tr><th>Gear-box</th><th>HP Rating</th><th>Company Name</th></tr></thead>
                          <tbody>
                            {[["M", tech.gearM], ["ME", tech.gearME]].map(([lbl, gear]) => (
                              <tr key={lbl}>
                                <td style={{ fontWeight:600,color:"var(--ud-muted)",textAlign:"center" }}>{lbl}</td>
                                <td><input value={gear?.hp_rating || ""} readOnly /></td>
                                <td>
                                  {["Transmatix","Kavitsu","OTHER"].map(v => (
                                    <Radio key={v} name={`vendor_${lbl}`} value={v} checked={(gear?.vendor || "") === v} onChange={() => {}} label={v} />
                                  ))}
                                  {gear?.vendor === "OTHER" && <div style={{ marginTop:4 }}><input value={gear?.vendor_other || ""} className="mm-input" readOnly /></div>}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </Col>

                      {/* Bearing */}
                      <Col xs={12} md={4} className="mb-3">
                        <table className="bearing-table">
                          <thead><tr><th>Bearing</th><th>Tick</th><th>Particulars</th></tr></thead>
                          <tbody>
                            {tech.bearingRows.map((b, i) => (
                              <tr key={i}>
                                <td>{b.type}</td>
                                <td><input type="checkbox" checked={b.tick} readOnly /></td>
                                <td><input type="text" value={b.particulars || ""} readOnly /></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </Col>

                      {/* Electrical */}
                      <Col xs={12} md={4} className="mb-3">
                        <div style={{ border:"1px solid var(--ud-border)",borderRadius:10,padding:"12px 14px" }}>
                          <span className="mm-sec-lbl">Electrical</span>
                          {Object.entries(tech.elecRows).map(([row, data]) => (
                            <div key={row} style={{ marginBottom:10,paddingBottom:8,borderBottom:"1px solid var(--ud-border)" }}>
                              <span style={{ fontSize:".8rem",fontWeight:700,color:"var(--ud-accent)" }}>Row {row}: </span>
                              <span style={{ fontSize:".83rem",color:"var(--ud-text)" }}>{data.value || "—"}</span>
                              {data.description && <div style={{ fontSize:".78rem",color:"var(--ud-muted)",marginTop:3 }}>{data.description}</div>}
                            </div>
                          ))}
                        </div>
                      </Col>
                    </Row>

                    {/* Material Estimation */}
                    <span className="mm-sec-lbl mt-2">Material Estimation (Mktg)</span>
                    <div style={{ overflowX:"auto" }}>
                      <table className="mat-table">
                        <thead>
                          <tr>
                            <th style={{ width:200, textAlign:"left" }}>Material</th>
                            <th>Quantity</th>
                            <th>Unit</th>
                            <th>Cost (₹)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {MAT_ROWS.map(({ key, label, unit }) => {
                            const d = tech.matData[key] || { quantity:"", cost:"" };
                            return (
                              <tr key={key}>
                                <td className="row-label">{label}</td>
                                <td><input value={d.quantity} onChange={e => setTech(p => ({ ...p, matData: { ...p.matData, [key]: { ...d, quantity: e.target.value } } }))} /></td>
                                <td style={{ fontSize:".78rem",color:"var(--ud-muted)" }}>{unit}</td>
                                <td><span style={{ marginRight:4 }}>₹</span><input value={d.cost} onChange={e => setTech(p => ({ ...p, matData: { ...p.matData, [key]: { ...d, cost: e.target.value } } }))} /></td>
                              </tr>
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
                        <thead><tr><th style={{ width:"34%" }}></th><th style={{ width:"34%" }}></th><th>Remark</th></tr></thead>
                        <tbody>
                          <tr>
                            <td className="q-label">Actual Site measurements Taken?</td>
                            <td>
                              <div style={{ display:"flex",gap:20 }}>
                                <Radio name="actualMeas" value="Yes" checked={measState.actualMeasTaken === "Yes"} onChange={() => setMeasState(p => ({ ...p, actualMeasTaken: "Yes" }))} label="Yes" />
                                <Radio name="actualMeas" value="No"  checked={measState.actualMeasTaken === "No"}  onChange={() => setMeasState(p => ({ ...p, actualMeasTaken: "No"  }))} label="No" />
                              </div>
                            </td>
                            <td><input type="text" value={measState.actualMeasRemark} onChange={e => setMeasState(p => ({ ...p, actualMeasRemark: e.target.value }))} /></td>
                          </tr>
                          <tr>
                            <td className="q-label">Measurements taken by</td>
                            <td><input type="text" value={measState.measTakenBy} onChange={e => setMeasState(p => ({ ...p, measTakenBy: e.target.value }))} /></td>
                            <td><input type="text" value={measState.measTakenByRemark} onChange={e => setMeasState(p => ({ ...p, measTakenByRemark: e.target.value }))} /></td>
                          </tr>
                          <tr>
                            <td className="q-label">Approval of Layout from customer Required?</td>
                            <td>
                              <div style={{ display:"flex",gap:20 }}>
                                <Radio name="approvalReq" value="Yes" checked={measState.approvalRequired === "Yes"} onChange={() => setMeasState(p => ({ ...p, approvalRequired: "Yes" }))} label="Yes" />
                                <Radio name="approvalReq" value="No"  checked={measState.approvalRequired === "No"}  onChange={() => setMeasState(p => ({ ...p, approvalRequired: "No"  }))} label="No" />
                              </div>
                            </td>
                            <td><input type="text" value={measState.approvalRemark} onChange={e => setMeasState(p => ({ ...p, approvalRemark: e.target.value }))} /></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Document uploads */}
                    <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:14 }}>
                      <span style={{ fontSize:".85rem",fontWeight:600,color:"var(--ud-text)" }}>Documents making part of data-sheet</span>
                      <button onClick={() => setDocRows(r => [...r, { name:"", file:null }])} style={{ background:"#e8560a",border:"none",borderRadius:"50%",width:26,height:26,color:"#fff",fontSize:"1.2rem",cursor:"pointer" }}>+</button>
                    </div>
                    {docRows.map((row, i) => (
                      <div key={i} style={{ display:"flex",alignItems:"center",gap:12,marginBottom:10 }}>
                        <input type="text" placeholder="Enter Document Name" value={row.name} onChange={e => setDocRows(r => r.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))} style={{ flex:1,border:"none",borderBottom:"1.5px solid var(--ud-border)",background:"transparent",outline:"none",fontSize:".85rem",color:"var(--ud-text)",padding:"3px 0",fontFamily:"'DM Sans',sans-serif" }} />
                        <label style={{ display:"flex",alignItems:"center",gap:8,cursor:"pointer",flexShrink:0 }}>
                          <button style={{ background:"transparent",border:"1px solid var(--ud-border)",borderRadius:5,padding:"4px 12px",fontSize:".8rem",color:"var(--ud-text)",cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>Choose File</button>
                          <span style={{ fontSize:".8rem",color:"var(--ud-muted)" }}>{row.file ? row.file.name : "No file chosen"}</span>
                          <input type="file" style={{ display:"none" }} onChange={e => setDocRows(r => r.map((x, idx) => idx === i ? { ...x, file: e.target.files[0] } : x))} />
                        </label>
                        {i > 0 && <button onClick={() => setDocRows(r => r.filter((_,idx) => idx !== i))} style={{ background:"#dc2626",border:"none",borderRadius:"50%",width:24,height:24,color:"#fff",cursor:"pointer",flexShrink:0 }}>−</button>}
                      </div>
                    ))}
                  </Block>

                  <div className="text-center mt-3">
                    <button
                      onClick={fetchAll}
                      style={{ background:"linear-gradient(135deg,#1d6fbd 0%,#1a9ed9 100%)",border:"none",color:"#fff",borderRadius:10,padding:"13px 44px",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:"1rem",letterSpacing:".04em",cursor:"pointer",boxShadow:"0 6px 20px rgba(29,111,189,.35)",marginRight:12 }}
                    >
                      <i className="bi bi-arrow-clockwise me-2"/>Refresh Data
                    </button>
                  </div>
                </div>
              </Tab>

              {/* ══ SYSTEM TYPE TAB ══ */}
              <Tab eventKey="system" title={<span><i className="bi bi-gear me-2"/>System Info</span>}>
                <div style={{ padding:"28px" }} className="fade-in">
                  <Alert variant="info" style={{ fontFamily:"'DM Sans',sans-serif" }}>
                    <i className="bi bi-info-circle me-2"/>
                    System type: <strong>{project?.system_type || "Not specified"}</strong> — Edit system details in the Project Details tab.
                  </Alert>
                  <Block title="DIMENSION SUMMARY">
                    <div style={{ overflowX:"auto" }}>
                      <table className="dim-table">
                        <thead>
                          <tr><th>#</th><th>Location</th><th>Length</th><th>Width</th><th>Height</th><th>Superstructure</th><th>Qty</th><th>Levels</th><th>Bays</th></tr>
                        </thead>
                        <tbody>
                          {dimRows.length > 0 ? dimRows.map((row, i) => (
                            <tr key={i}>
                              <td style={{ textAlign:"center",color:"var(--ud-muted)",fontWeight:700 }}>{i + 1}</td>
                              <td>{row.location || row.dim_id || "—"}</td>
                              <td>{row.length || "—"}</td>
                              <td>{row.width  || "—"}</td>
                              <td>{row.height || row.totalHeight || "—"}</td>
                              <td>{row.super_structure || row.superHeight || "—"}</td>
                              <td>{row.quantity || row.qty || "—"}</td>
                              <td>{row.levels   || "—"}</td>
                              <td>{row.no_req_bays || row.bays || "—"}</td>
                            </tr>
                          )) : <tr><td colSpan={9} style={{ textAlign:"center",color:"var(--ud-muted)",padding:20 }}>No dimensions found</td></tr>}
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