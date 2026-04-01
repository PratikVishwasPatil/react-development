import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Card,
  Row,
  Col,
  Tabs,
  Tab,
  Button,
  Form,
  Table,
  Spinner,
  Alert,
} from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

/* ─────────────────────────────────────────────
   GLOBAL STYLES injected once
───────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');

  @keyframes slideIn  { from { transform:translateX(420px);opacity:0 } to { transform:translateX(0);opacity:1 } }
  @keyframes slideOut { from { transform:translateX(0);opacity:1 }     to { transform:translateX(420px);opacity:0 } }
  @keyframes fadeUp   { from { opacity:0;transform:translateY(14px) }  to { opacity:1;transform:translateY(0) } }
  @keyframes shimmer  { 0%,100%{opacity:.5} 50%{opacity:1} }
  @keyframes pulse-dot{ 0%,100%{transform:scale(1)} 50%{transform:scale(1.4)} }

  .ud-root { font-family:'DM Sans',sans-serif; }

  /* ── info rows ── */
  .ud-info-row {
    display:flex; flex-direction:column;
    padding:10px 0; border-bottom:1px solid var(--ud-border);
    transition:background .18s;
  }
  .ud-info-row:last-child { border-bottom:none }
  .ud-info-label {
    font-size:.72rem; font-weight:700; letter-spacing:.07em;
    text-transform:uppercase; color:var(--ud-muted); margin-bottom:3px;
  }
  .ud-info-value { font-size:.94rem; font-weight:500; color:var(--ud-text); }
  .ud-info-value.accent { color:var(--ud-accent); font-weight:600; }

  /* ── section header ── */
  .ud-section-title {
    font-family:'Syne',sans-serif; font-size:.95rem; font-weight:700;
    letter-spacing:.06em; text-transform:uppercase;
    color:var(--ud-accent); margin-bottom:16px;
    display:flex; align-items:center; gap:8px;
  }
  .ud-section-title::after {
    content:''; flex:1; height:1px; background:var(--ud-accent);
    opacity:.25;
  }

  /* ── section card ── */
  .ud-section-card {
    background:var(--ud-card); border:1px solid var(--ud-border);
    border-radius:14px; padding:22px 24px; height:100%;
    transition:box-shadow .2s;
    animation:fadeUp .45s ease both;
  }
  .ud-section-card:hover { box-shadow:0 6px 24px rgba(0,0,0,.08); }

  /* ── radio group ── */
  .ud-radio-group { display:flex; gap:10px; flex-wrap:wrap; margin-top:6px; }
  .ud-radio-pill {
    display:inline-flex; align-items:center; gap:6px;
    padding:5px 14px; border-radius:20px; font-size:.82rem; font-weight:600;
    border:1.5px solid var(--ud-border); cursor:pointer;
    transition:all .18s; color:var(--ud-muted); background:transparent;
    user-select:none;
  }
  .ud-radio-pill.active {
    border-color:var(--ud-accent); color:var(--ud-accent);
    background:var(--ud-accent-soft);
  }
  .ud-radio-pill .dot {
    width:8px; height:8px; border-radius:50%; border:2px solid currentColor;
    display:inline-block; transition:background .15s;
  }
  .ud-radio-pill.active .dot { background:var(--ud-accent); }

  /* ── date table ── */
  .ud-date-table { width:100%; border-collapse:collapse; }
  .ud-date-table th {
    font-size:.72rem; font-weight:700; letter-spacing:.07em;
    text-transform:uppercase; color:var(--ud-muted);
    padding:8px 12px; text-align:center;
    background:var(--ud-header-bg); border-bottom:1px solid var(--ud-border);
  }
  .ud-date-table td {
    padding:10px 12px; border-bottom:1px solid var(--ud-border);
    font-size:.88rem; color:var(--ud-text); text-align:center; vertical-align:middle;
  }
  .ud-date-table td:first-child { text-align:left; font-weight:500; }
  .ud-date-table td.link-cell { color:var(--ud-accent); font-weight:600; cursor:pointer; }
  .ud-date-table td.link-cell:hover { text-decoration:underline; }
  .ud-date-table tr:last-child td { border-bottom:none; }
  .ud-date-table input[type=date] {
    border:1px solid var(--ud-border); border-radius:7px;
    padding:4px 8px; font-size:.82rem; background:var(--ud-bg);
    color:var(--ud-text); outline:none; transition:border .18s;
  }
  .ud-date-table input[type=date]:focus { border-color:var(--ud-accent); }

  /* ── textarea instruction ── */
  .ud-instruction-label {
    font-size:.82rem; font-weight:600; color:var(--ud-text);
    margin-bottom:6px; display:block; line-height:1.45;
  }
  .ud-instruction-textarea {
    width:100%; border:1px solid var(--ud-border); border-radius:8px;
    padding:8px 11px; font-size:.85rem; resize:vertical; min-height:54px;
    background:var(--ud-bg); color:var(--ud-text); outline:none;
    font-family:'DM Sans',sans-serif; transition:border .18s;
    margin-bottom:16px;
  }
  .ud-instruction-textarea:focus { border-color:var(--ud-accent); }

  /* ── tabs ── */
  .ud-tabs .nav-link {
    font-family:'DM Sans',sans-serif; font-weight:600; font-size:.88rem;
    color:var(--ud-muted) !important; border:none !important;
    padding:14px 20px; border-radius:0 !important;
    transition:color .18s, box-shadow .18s;
  }
  .ud-tabs .nav-link:hover { color:var(--ud-accent) !important; }
  .ud-tabs .nav-link.active {
    color:var(--ud-accent) !important; background:transparent !important;
    box-shadow:inset 0 -3px 0 var(--ud-accent);
  }
  .ud-tabs { border-bottom:2px solid var(--ud-border) !important; padding:0 24px; }

  /* ── upload form ── */
  .ud-upload-zone {
    border:2px dashed var(--ud-border); border-radius:14px;
    background:var(--ud-header-bg); padding:22px 24px; margin-bottom:28px;
    transition:border-color .2s;
  }
  .ud-upload-zone:hover { border-color:var(--ud-accent); }

  /* ── po card ── */
  .ud-po-card {
    border-left:4px solid var(--ud-accent); border-radius:12px;
    background:var(--ud-card); border:1px solid var(--ud-border);
    border-left:4px solid var(--ud-accent); padding:20px;
    transition:transform .2s,box-shadow .2s; margin-bottom:16px;
  }
  .ud-po-card:hover { transform:translateY(-3px); box-shadow:0 8px 24px rgba(0,0,0,.12); }

  /* ── comment card ── */
  .ud-comment-card {
    border-left:4px solid #22c55e; border-radius:12px;
    background:var(--ud-card); border:1px solid var(--ud-border);
    padding:22px; margin-bottom:20px;
    transition:transform .2s,box-shadow .2s;
  }
  .ud-comment-card:hover { transform:translateX(5px); box-shadow:0 4px 20px rgba(0,0,0,.1); }

  .ud-avatar {
    width:48px; height:48px; border-radius:50%;
    background:linear-gradient(135deg,#667eea,#764ba2);
    display:flex; align-items:center; justify-content:center;
    color:#fff; font-weight:700; font-size:1.1rem; flex-shrink:0;
  }

  /* ── header gradient ── */
  .ud-header-grad { background:linear-gradient(135deg,#1e3a5f 0%,#2e6db4 60%,#1a9ed9 100%); }
  .ud-header-grad-dark { background:linear-gradient(135deg,#1a1f2e 0%,#2d3a52 100%); }

  /* ── fade in ── */
  .fade-in { animation:fadeUp .5s ease both; }

  /* ── status badge ── */
  .ud-badge {
    display:inline-flex; align-items:center; gap:5px;
    padding:4px 13px; border-radius:20px; font-size:.78rem; font-weight:700;
    letter-spacing:.04em;
  }
  .ud-badge.active { background:#dcfce7; color:#15803d; }
  .dark-ud .ud-badge.active { background:#14532d; color:#86efac; }
  .ud-badge .dot { width:6px; height:6px; border-radius:50%; background:currentColor; animation:pulse-dot 1.5s infinite; }

  .dark-ud .ud-date-table input[type=date] { color-scheme:dark; }
  .dark-ud .ud-date-table td, .dark-ud .ud-date-table th { color:var(--ud-text); }
  .dark-ud .ud-instruction-textarea { color-scheme:dark; }
`;

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const fmt = (v) => v || "N/A";
const getInitials = (name) => {
  if (!name) return "??";
  const p = name.trim().split(" ");
  return p.length >= 2 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
};

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const UploadDrawingDetails = () => {
  const { projectId: paramProjectId, fileId: paramFileId } = useParams();

  const getIdsFromUrl = () => {
    const hash = window.location.hash;
    // matches /#/upload-drawing-details/3272/4990
    const m = hash.match(/\/upload-drawing-details\/(\d+)\/(\d+)/);
    if (m) return { projectId: m[1], fileId: m[2] };
    // fallback: single param + React Router param
    const m2 = hash.match(/\/upload-drawing-details\/(\d+)/);
    return {
      projectId: paramProjectId || "3272",
      fileId:    m2 ? m2[1] : (paramFileId || "4990"),
    };
  };

  const { projectId: _pid, fileId: _fid } = getIdsFromUrl();
  const [fileId]    = useState(_fid);
  const [projectId] = useState(_pid);
  const [theme, setTheme] = useState("light");
  const [activeTab, setActiveTab] = useState("project");
  const [loading, setLoading] = useState(false);

  /* project */
  const [fileDetails,      setFileDetails]      = useState(null);
  const [siteDateDetails,  setSiteDateDetails]  = useState(null);

  /* po */
  const [poDetails, setPoDetails] = useState([]);

  /* drawings */
  const [drawingCategories, setDrawingCategories] = useState([]);
  const [selectedCategory,  setSelectedCategory]  = useState("");
  const [designComments,    setDesignComments]    = useState([]);

  /* upload form */
  const [uploadForm, setUploadForm] = useState({ docName: "", comment: "", file: null });
  const fileInputRef = useRef(null);

  /* instruction state */
  const [instructions, setInstructions] = useState({
    specialOfficialReq: "",
    specialInstruction: "",
    specialRequirement: "",
    aestheticsInfo: "",
  });

  /* ── inject CSS ── */
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = GLOBAL_CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  /* ── theme CSS vars on :root ── */
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.style.setProperty("--ud-bg",         "#13161e");
      root.style.setProperty("--ud-card",       "#1e2330");
      root.style.setProperty("--ud-header-bg",  "#252b3b");
      root.style.setProperty("--ud-border",     "#2e3650");
      root.style.setProperty("--ud-text",       "#e8edf5");
      root.style.setProperty("--ud-muted",      "#8b95af");
      root.style.setProperty("--ud-accent",     "#60a5fa");
      root.style.setProperty("--ud-accent-soft","rgba(96,165,250,.12)");
      document.body.classList.add("dark-ud");
    } else {
      root.style.setProperty("--ud-bg",         "#f0f4f8");
      root.style.setProperty("--ud-card",       "#ffffff");
      root.style.setProperty("--ud-header-bg",  "#f7f9fc");
      root.style.setProperty("--ud-border",     "#d8e0ec");
      root.style.setProperty("--ud-text",       "#1a2340");
      root.style.setProperty("--ud-muted",      "#7a8aaa");
      root.style.setProperty("--ud-accent",     "#1d6fbd");
      root.style.setProperty("--ud-accent-soft","rgba(29,111,189,.09)");
      document.body.classList.remove("dark-ud");
    }
    document.body.style.background = "var(--ud-bg)";
  }, [theme]);

  /* ── TOAST ── */
  const showToast = (msg, type = "info") => {
    const d = document.createElement("div");
    const bg = type === "success" ? "#16a34a" : type === "error" ? "#dc2626" : "#2563eb";
    d.style.cssText = `
      position:fixed;top:22px;right:22px;padding:13px 22px;
      background:${bg};color:#fff;border-radius:10px;
      box-shadow:0 6px 20px rgba(0,0,0,.2);z-index:9999;
      font-family:'DM Sans',sans-serif;font-size:.9rem;font-weight:500;
      animation:slideIn .3s ease-out;
    `;
    d.textContent = msg;
    document.body.appendChild(d);
    setTimeout(() => {
      d.style.animation = "slideOut .3s ease-out";
      setTimeout(() => d.remove(), 300);
    }, 3000);
  };

  /* ── FETCH file details (project tab) ── */
  const fetchFileDetails = async () => {
    setLoading(true);
    try {
      const res  = await fetch(
        `http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/getProjectFileDetailsApi.php?projectID=${projectId}&fileId=${fileId}`
      );
      const data = await res.json();
      if (data.status === "success" && data.data) {
        setFileDetails(data.data);
        setInstructions({
          specialOfficialReq: data.data.special_official_req || "",
          specialInstruction: data.data.special_instruction  || "",
          specialRequirement: data.data.special_requirement  || "",
          aestheticsInfo:     data.data.aesthetics_info      || "",
        });
      } else {
        showToast("Failed to load project details", "error");
      }
    } catch (e) {
      showToast(`Error: ${e.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  /* ── FETCH site date details ── */
  const fetchSiteDateDetails = async () => {
    try {
      const res  = await fetch(
        `http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/SiteDateDetailsApi.php?projectID=${projectId}&FILE_ID=${fileId}`
      );
      const data = await res.json();
      if (data.status === "success" && data.data) {
        setSiteDateDetails(data.data);
      }
    } catch (e) {
      console.warn("Site date fetch error:", e);
    }
  };

  /* ── FETCH PO ── */
  const fetchPoDetails = async () => {
    try {
      const res  = await fetch(
        `http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/uploadDrawingPoDetailsApi.php?FILE_ID=${fileId}`
      );
      const data = await res.json();
      if (data.status === "success" && Array.isArray(data.data)) setPoDetails(data.data);
    } catch (e) { console.warn(e); }
  };

  /* ── FETCH drawing categories ── */
  const fetchDrawingCategories = async () => {
    try {
      const res  = await fetch(
        "http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/getDrawingCategoriesApi.php"
      );
      const data = await res.json();
      if (data.status === "success" && Array.isArray(data.data)) setDrawingCategories(data.data);
    } catch (e) { console.warn(e); }
  };

  /* ── FETCH design comments ── */
  const fetchDesignComments = async () => {
    try {
      const res  = await fetch(
        `http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/getDesignCommentsApi.php?file_id=${fileId}`
      );
      const data = await res.json();
      if (data.status === "success" && Array.isArray(data.data)) setDesignComments(data.data);
    } catch (e) { console.warn(e); }
  };

  /* ── initial load ── */
  useEffect(() => {
    fetchFileDetails();
    fetchSiteDateDetails();
    fetchPoDetails();
    fetchDrawingCategories();
    fetchDesignComments();
    // eslint-disable-next-line
  }, [fileId]);

  /* ── view data sheet ── */
  const handleViewDataSheet = () => {
    const pn = fileDetails?.product_type?.toUpperCase();
    let url = `#/product-datasheet/${projectId}/${fileId}`;
    if (pn === "MMSS") url = `#/mmss-datasheet/${projectId}/${fileId}`;
    else if (pn === "MSS") url = `#/mss-datasheet/${projectId}/${fileId}`;
    window.open(url, "_blank");
  };

  /* ── upload ── */
  const handleUploadSubmit = () => {
    if (!selectedCategory) return showToast("Please select a drawing category", "error");
    if (!uploadForm.docName) return showToast("Please enter document name", "error");
    if (!uploadForm.file)    return showToast("Please select a file", "error");
    showToast("Upload functionality will be implemented", "info");
  };

  /* ── date value helper ── */
  const D = (path) => {
    if (!siteDateDetails) return "";
    return siteDateDetails.dates?.[path] || "";
  };

  /* ─────────────────── LOADING SCREEN ─────────────────── */
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

  /* ─────────────────── RENDER ─────────────────── */
  return (
    <div className="ud-root" style={{ minHeight:"100vh",background:"var(--ud-bg)",padding:"24px 0" }}>
      <Container fluid style={{ maxWidth:1400 }}>

        {/* ── MAIN CARD ── */}
        <Card style={{
          background:"var(--ud-card)",
          border:"1px solid var(--ud-border)",
          borderRadius:16,
          boxShadow:"0 8px 32px rgba(0,0,0,.1)",
          overflow:"hidden",
        }}>

          {/* ── HEADER ── */}
          <Card.Header className={theme==="dark" ? "ud-header-grad-dark" : "ud-header-grad"} style={{
            padding:"22px 28px",
            borderBottom:"none",
          }}>
            <Row className="align-items-center">
              <Col xs={12} lg={8}>
                <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:6 }}>
                  <div style={{
                    width:42,height:42,borderRadius:10,
                    background:"rgba(255,255,255,.18)",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:"1.3rem",
                  }}>📐</div>
                  <h4 style={{
                    fontFamily:"'Syne',sans-serif",fontWeight:800,
                    color:"#ffffff",margin:0,fontSize:"1.25rem",letterSpacing:".02em",
                  }}>
                    {fileDetails?.file_name || "Upload Drawing Details"}
                  </h4>
                </div>
                <div style={{ display:"flex",gap:18,flexWrap:"wrap" }}>
                  {[
                    { icon:"bi-hash",   label:"File ID",  val:fileId },
                    { icon:"bi-building",label:"Customer",val:fileDetails?.customer_name || "—" },
                    { icon:"bi-box",    label:"Product",  val:fileDetails?.product_type  || "—" },
                  ].map(it => (
                    <span key={it.label} style={{
                      fontSize:".82rem",color:"rgba(255,255,255,.82)",
                      display:"flex",alignItems:"center",gap:5,
                    }}>
                      <i className={`bi ${it.icon}`}></i>
                      <strong style={{ color:"rgba(255,255,255,.6)",fontWeight:500 }}>{it.label}:&nbsp;</strong>
                      {it.val}
                    </span>
                  ))}
                </div>
              </Col>
              <Col xs={12} lg={4} className="text-end mt-3 mt-lg-0">
                <button onClick={() => setTheme(t => t==="light"?"dark":"light")} style={{
                  background:"rgba(255,255,255,.15)",border:"1.5px solid rgba(255,255,255,.3)",
                  color:"#fff",borderRadius:8,padding:"7px 16px",
                  fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:".83rem",
                  cursor:"pointer",marginRight:10,transition:"background .18s",
                }}>
                  {theme==="light" ? "🌙 Dark" : "☀️ Light"}
                </button>
                <button onClick={() => window.history.back()} style={{
                  background:"rgba(255,255,255,.15)",border:"1.5px solid rgba(255,255,255,.3)",
                  color:"#fff",borderRadius:8,padding:"7px 16px",
                  fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:".83rem",
                  cursor:"pointer",transition:"background .18s",
                }}>
                  ← Back
                </button>
              </Col>
            </Row>
          </Card.Header>

          {/* ── TABS ── */}
          <Card.Body style={{ padding:0 }}>
            <Tabs
              activeKey={activeTab}
              onSelect={setActiveTab}
              className="ud-tabs mb-0"
              style={{ background:"var(--ud-header-bg)" }}
            >

              {/* ════════════════════════ PROJECT DETAILS TAB ════════════════════════ */}
              <Tab eventKey="project" title={<span><i className="bi bi-file-text me-2"/>Project Details</span>}>
                <div style={{ padding:"28px 28px 36px" }} className="fade-in">

                  {/* ── SECTION 1: PROJECT DETAILS info card ── */}
                  <div style={{
                    background:"var(--ud-card)",border:"1px solid var(--ud-border)",
                    borderRadius:14,marginBottom:22,overflow:"hidden",
                    boxShadow:"0 2px 12px rgba(0,0,0,.05)",
                  }}>
                    {/* Section label bar */}
                    <div style={{
                      background:"var(--ud-header-bg)",borderBottom:"1px solid var(--ud-border)",
                      padding:"10px 20px",display:"flex",alignItems:"center",gap:10,
                    }}>
                      <div style={{
                        width:4,height:18,borderRadius:2,
                        background:"var(--ud-accent)",
                      }}/>
                      <span style={{
                        fontFamily:"'Syne',sans-serif",fontWeight:700,
                        fontSize:".82rem",letterSpacing:".1em",
                        textTransform:"uppercase",color:"var(--ud-accent)",
                      }}>PROJECT DETAILS</span>
                    </div>

                    <div style={{ padding:"18px 20px 22px" }}>
                      <Row>
                        {/* Row 1 */}
                        <Col xs={12} md={4} className="mb-4">
                          <div className="ud-info-row">
                            <span className="ud-info-label">File Name</span>
                            <span className="ud-info-value accent">{fmt(fileDetails?.file_name)}</span>
                          </div>
                        </Col>
                        <Col xs={12} md={4} className="mb-4">
                          <div className="ud-info-row">
                            <span className="ud-info-label">Product Type</span>
                            <span className="ud-info-value accent">{fmt(fileDetails?.product_type)}</span>
                          </div>
                        </Col>
                        <Col xs={12} md={4} className="mb-4">
                          <div className="ud-info-row">
                            <span className="ud-info-label">Client / Company Name</span>
                            <span className="ud-info-value accent">{fmt(fileDetails?.customer_name)}</span>
                          </div>
                        </Col>

                        {/* Row 2 */}
                        <Col xs={12} md={4} className="mb-4">
                          <div className="ud-info-row">
                            <span className="ud-info-label">Shipping Address</span>
                            <span className="ud-info-value accent">{fmt(fileDetails?.shipping_address)}</span>
                          </div>
                        </Col>
                        <Col xs={12} md={4} className="mb-4">
                          <div className="ud-info-row">
                            <span className="ud-info-label">Contact Person Name</span>
                            <span className="ud-info-value accent">{fmt(fileDetails?.contact_person)}</span>
                          </div>
                        </Col>
                        <Col xs={12} md={4} className="mb-4">
                          <div className="ud-info-row">
                            <span className="ud-info-label">Contact Person Phone</span>
                            <span className="ud-info-value accent">{fmt(fileDetails?.contact_number)}</span>
                          </div>
                        </Col>
                      </Row>

                      {/* Customer Ambassador */}
                      <Row>
                        <Col xs={12} md={6} className="mb-3">
                          <div className="ud-info-label mb-2">Customer Ambassador</div>
                          <div className="ud-radio-group">
                            {["AGP","SVJ","RPK","OTHER"].map(opt => (
                              <span key={opt} className={`ud-radio-pill ${fileDetails?.customer_ambassador===opt?"active":""}`}>
                                <span className="dot"/>
                                {opt}
                              </span>
                            ))}
                          </div>
                          {fileDetails?.customer_ambassador==="OTHER" && (
                            <div style={{ marginTop:10 }}>
                              <span className="ud-info-label">Mention Customer Ambassador Name</span>
                              <div style={{
                                borderBottom:"1px solid var(--ud-border)",
                                paddingBottom:4,marginTop:4,
                                fontSize:".88rem",color:"var(--ud-text)",minHeight:22,
                              }}>{fileDetails?.ambassador_other || ""}</div>
                            </div>
                          )}
                        </Col>

                        {/* Tax Documents */}
                        <Col xs={12} md={6} className="mb-3">
                          <div className="ud-info-label mb-2">Tax Documents</div>
                          <div className="ud-radio-group">
                            {["SEZ","GST","OTHER"].map(opt => {
                              const td = (fileDetails?.transport_document||"").toUpperCase();
                              return (
                                <span key={opt} className={`ud-radio-pill ${td===opt?"active":""}`}>
                                  <span className="dot"/>
                                  {opt}
                                </span>
                              );
                            })}
                          </div>
                          {(fileDetails?.transport_document||"").toUpperCase()==="OTHER" && (
                            <div style={{ marginTop:10 }}>
                              <span className="ud-info-label">Mention Other Documents</span>
                              <div style={{
                                borderBottom:"1px solid var(--ud-border)",
                                paddingBottom:4,marginTop:4,
                                fontSize:".88rem",color:"var(--ud-text)",minHeight:22,
                              }}>{fileDetails?.transport_other || ""}</div>
                            </div>
                          )}
                        </Col>
                      </Row>
                    </div>
                  </div>

                  {/* ── SECTION 2: SITE DATE DETAILS + INSTRUCTIONS side by side ── */}
                  <Row className="g-3 mb-4">

                    {/* LEFT: Site Date Details */}
                    <Col xs={12} lg={7}>
                      <div style={{
                        background:"var(--ud-card)",border:"1px solid var(--ud-border)",
                        borderRadius:14,overflow:"hidden",
                        boxShadow:"0 2px 12px rgba(0,0,0,.05)",height:"100%",
                      }}>
                        <div style={{
                          background:"var(--ud-header-bg)",borderBottom:"1px solid var(--ud-border)",
                          padding:"10px 20px",display:"flex",alignItems:"center",gap:10,
                        }}>
                          <div style={{ width:4,height:18,borderRadius:2,background:"var(--ud-accent)" }}/>
                          <span style={{
                            fontFamily:"'Syne',sans-serif",fontWeight:700,
                            fontSize:".82rem",letterSpacing:".1em",
                            textTransform:"uppercase",color:"var(--ud-accent)",
                          }}>SITE DATE DETAILS</span>
                        </div>
                        <div style={{ padding:"16px 20px" }}>
                          <table className="ud-date-table">
                            <thead>
                              <tr>
                                <th style={{ textAlign:"left" }}></th>
                                <th>Dates</th>
                                <th></th>
                                <th>Dates</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>Site Form Issued</td>
                                <td><input type="date" defaultValue={D("siteFormIssuedDate")} /></td>
                                <td className="link-cell">Foundation date</td>
                                <td><input type="date" defaultValue={D("foundationDate")} /></td>
                              </tr>
                              <tr>
                                <td className="link-cell" style={{ color:"var(--ud-accent)" }}>Dispatch-Foundation</td>
                                <td><input type="date" defaultValue={D("dispatchFoundationDate")} /></td>
                                <td style={{ lineHeight:1.3, fontSize:".8rem" }}>
                                  <span style={{ color:"var(--ud-accent)",fontWeight:600 }}>Primary Info</span><br/>
                                  <span style={{ color:"var(--ud-muted)",fontSize:".75rem" }}>-- Long-lead<br/>& Assy BD</span>
                                </td>
                                <td><input type="date" defaultValue={D("primaryInfoDate")} /></td>
                              </tr>
                              <tr>
                                <td>1st Dispatch</td>
                                <td><input type="date" defaultValue={D("firstDispatchDate")} /></td>
                                <td>Design Date</td>
                                <td><input type="date" defaultValue={D("completedFileDate")} /></td>
                              </tr>
                              <tr>
                                <td>Last Dispatch</td>
                                <td><input type="date" defaultValue={D("lastDispatchDate")} /></td>
                                <td style={{ lineHeight:1.3, fontSize:".82rem" }}>
                                  Committed date<br/>
                                  <span style={{ fontSize:".78rem",color:"var(--ud-muted)" }}>of handover</span>
                                </td>
                                <td><input type="date" defaultValue={D("commitedDispatchDate")} /></td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </Col>

                    {/* RIGHT: Instructions */}
                    <Col xs={12} lg={5}>
                      <div style={{
                        background:"var(--ud-card)",border:"1px solid var(--ud-border)",
                        borderRadius:14,overflow:"hidden",
                        boxShadow:"0 2px 12px rgba(0,0,0,.05)",height:"100%",
                      }}>
                        <div style={{
                          background:"var(--ud-header-bg)",borderBottom:"1px solid var(--ud-border)",
                          padding:"10px 20px",display:"flex",alignItems:"center",gap:10,
                        }}>
                          <div style={{ width:4,height:18,borderRadius:2,background:"var(--ud-accent)" }}/>
                          <span style={{
                            fontFamily:"'Syne',sans-serif",fontWeight:700,
                            fontSize:".82rem",letterSpacing:".1em",
                            textTransform:"uppercase",color:"var(--ud-accent)",
                          }}>INSTRUCTIONS</span>
                        </div>
                        <div style={{ padding:"16px 20px" }}>

                          <label className="ud-instruction-label">
                            Any Special Official Requirement?
                          </label>
                          <textarea
                            className="ud-instruction-textarea"
                            value={instructions.specialOfficialReq}
                            onChange={e => setInstructions(p=>({...p,specialOfficialReq:e.target.value}))}
                          />

                          <label className="ud-instruction-label">
                            Special Instructions (if any) - (e.g. Material movement related, staircase, corridors, ducts, beams, doors, windows, columns etc)
                          </label>
                          <textarea
                            className="ud-instruction-textarea"
                            value={instructions.specialInstruction}
                            onChange={e => setInstructions(p=>({...p,specialInstruction:e.target.value}))}
                          />

                          <label className="ud-instruction-label">
                            Special Requirements (if any)- (e.g. Wire Mesh Doors, Wire Mesh Partition, Tubular CP/TP, Hanging Partition, H Beams, Dec-on panels, Pallete Supports etc)
                          </label>
                          <textarea
                            className="ud-instruction-textarea"
                            value={instructions.specialRequirement}
                            onChange={e => setInstructions(p=>({...p,specialRequirement:e.target.value}))}
                          />

                          <label className="ud-instruction-label">
                            Special Instructions regarding aesthetics / finishing etc. (if any)-
                          </label>
                          <textarea
                            className="ud-instruction-textarea"
                            style={{ marginBottom:0 }}
                            value={instructions.aestheticsInfo}
                            onChange={e => setInstructions(p=>({...p,aestheticsInfo:e.target.value}))}
                          />
                        </div>
                      </div>
                    </Col>
                  </Row>

                  {/* ── View Data Sheet Button ── */}
                  <div className="text-center mt-2">
                    <button
                      onClick={handleViewDataSheet}
                      disabled={!fileDetails}
                      style={{
                        background:"linear-gradient(135deg,#1d6fbd 0%,#1a9ed9 100%)",
                        border:"none",color:"#fff",borderRadius:10,
                        padding:"13px 44px",
                        fontFamily:"'Syne',sans-serif",fontWeight:700,
                        fontSize:"1rem",letterSpacing:".04em",
                        cursor:fileDetails?"pointer":"not-allowed",opacity:fileDetails?1:.6,
                        boxShadow:"0 6px 20px rgba(29,111,189,.35)",
                        transition:"transform .18s,box-shadow .18s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 10px 28px rgba(29,111,189,.45)"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="0 6px 20px rgba(29,111,189,.35)"; }}
                    >
                      <i className="bi bi-file-earmark-text me-2"/>
                      View Project Data Sheet
                    </button>
                  </div>
                </div>
              </Tab>

              {/* ════════════════════════ PO DETAILS TAB ════════════════════════ */}
              <Tab eventKey="po" title={<span><i className="bi bi-receipt me-2"/>PO Details</span>}>
                <div style={{ padding:"28px" }} className="fade-in">
                  {poDetails.length === 0 ? (
                    <Alert variant="info" className="text-center">
                      <i className="bi bi-info-circle me-2"/>No PO details available
                    </Alert>
                  ) : (
                    <Row>
                      {poDetails.map((po, i) => (
                        <Col lg={6} key={i} className="mb-4">
                          <div className="ud-po-card">
                            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14 }}>
                              <h5 style={{ fontFamily:"'Syne',sans-serif",fontWeight:700,color:"var(--ud-accent)",margin:0 }}>
                                {po.po_type} — V{po.po_version_no}
                              </h5>
                              <span className="ud-badge active"><span className="dot"/>Active</span>
                            </div>
                            {[
                              ["PO Number",   po.po_number],
                              ["PO Date",     po.po_date],
                              ["PO Amount",   `₹${parseFloat(po.po_basic_amount||0).toLocaleString("en-IN")}`],
                              ["PO Type",     po.po_type],
                            ].map(([k,v]) => (
                              <div key={k} style={{ marginBottom:8,fontSize:".88rem" }}>
                                <strong style={{ color:"var(--ud-muted)",fontWeight:600 }}>{k}: </strong>
                                <span style={{ color:"var(--ud-text)" }}>{v}</span>
                              </div>
                            ))}
                            <div style={{
                              background:"var(--ud-header-bg)",borderRadius:8,
                              padding:"10px 14px",marginTop:12,marginBottom:14,
                              fontSize:".82rem",color:"var(--ud-muted)",
                            }}>
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

              {/* ════════════════════════ UPLOAD DRAWINGS TAB ════════════════════════ */}
              <Tab eventKey="upload" title={<span><i className="bi bi-cloud-upload me-2"/>Upload Drawings</span>}>
                <div style={{ padding:"28px" }} className="fade-in">

                  {/* Upload Zone */}
                  <div className="ud-upload-zone">
                    <Row className="align-items-end g-3">
                      <Col md={3}>
                        <Form.Label style={{ fontWeight:600,fontSize:".85rem",color:"var(--ud-text)" }}>
                          Select Drawing List
                        </Form.Label>
                        <Form.Select
                          value={selectedCategory}
                          onChange={e => setSelectedCategory(e.target.value)}
                          style={{ background:"var(--ud-card)",color:"var(--ud-text)",borderColor:"var(--ud-border)" }}
                        >
                          <option value="">Choose…</option>
                          {drawingCategories.map(c => (
                            <option key={c.id} value={c.id}>{c.drawing_name}</option>
                          ))}
                        </Form.Select>
                      </Col>
                      <Col md={3}>
                        <Form.Label style={{ fontWeight:600,fontSize:".85rem",color:"var(--ud-text)" }}>Enter Doc Name</Form.Label>
                        <Form.Control
                          type="text" placeholder="Document name"
                          value={uploadForm.docName}
                          onChange={e => setUploadForm(p=>({...p,docName:e.target.value}))}
                          style={{ background:"var(--ud-card)",color:"var(--ud-text)",borderColor:"var(--ud-border)" }}
                        />
                      </Col>
                      <Col md={3}>
                        <Form.Label style={{ fontWeight:600,fontSize:".85rem",color:"var(--ud-text)" }}>Comment</Form.Label>
                        <Form.Control
                          type="text" placeholder="Add comment"
                          value={uploadForm.comment}
                          onChange={e => setUploadForm(p=>({...p,comment:e.target.value}))}
                          style={{ background:"var(--ud-card)",color:"var(--ud-text)",borderColor:"var(--ud-border)" }}
                        />
                      </Col>
                      <Col md={2}>
                        <Button variant="outline-secondary" className="w-100" onClick={() => fileInputRef.current?.click()}>
                          <i className="bi bi-paperclip me-2"/>Choose Files
                        </Button>
                        <input type="file" ref={fileInputRef} onChange={e => setUploadForm(p=>({...p,file:e.target.files[0]}))}
                          style={{ display:"none" }} accept=".pdf,.doc,.docx,.dwg" />
                      </Col>
                      <Col md={1}>
                        <Button className="w-100" onClick={handleUploadSubmit}
                          style={{ background:"linear-gradient(135deg,#1d6fbd,#1a9ed9)",border:"none" }}>
                          <i className="bi bi-send"/>
                        </Button>
                      </Col>
                    </Row>
                    {uploadForm.file && (
                      <div style={{ marginTop:12,fontSize:".83rem",color:"var(--ud-muted)" }}>
                        <i className="bi bi-file-earmark me-2"/>Selected: {uploadForm.file.name}
                      </div>
                    )}
                  </div>

                  {/* Drawings List */}
                  <div style={{
                    borderBottom:`2px solid var(--ud-accent)`,
                    paddingBottom:10,marginBottom:24,
                    fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:"1rem",
                    letterSpacing:".04em",color:"var(--ud-text)",
                  }}>Drawings</div>

                  {designComments.length === 0 ? (
                    <Alert variant="info" className="text-center">
                      <i className="bi bi-inbox me-2"/>No drawings uploaded yet
                    </Alert>
                  ) : designComments.map((comment) => (
                    <div key={comment.comment_id} className="ud-comment-card">
                      <div style={{ display:"flex",alignItems:"flex-start",marginBottom:14,gap:14 }}>
                        <div className="ud-avatar">{getInitials(comment.employee_name)}</div>
                        <div>
                          <h6 style={{ fontWeight:700,marginBottom:4,color:"var(--ud-text)" }}>{comment.employee_name}</h6>
                          <span style={{ fontSize:".82rem",color:"var(--ud-muted)" }}>
                            <i className="bi bi-calendar me-2"/>{comment.comment_date}
                            <i className="bi bi-clock ms-3 me-2"/>{comment.comment_time}
                          </span>
                        </div>
                      </div>
                      <p style={{
                        padding:"12px 16px",
                        background:"var(--ud-header-bg)",borderRadius:8,marginBottom:18,
                        fontSize:".88rem",color:"var(--ud-text)",
                      }}>{comment.comment_text}</p>
                      {comment.has_documents && comment.documents && (
                        <div>
                          <div style={{ fontWeight:600,marginBottom:12,fontSize:".88rem",color:"var(--ud-text)" }}>
                            <i className="bi bi-file-earmark-text me-2"/>
                            Documents ({comment.documents.length})
                          </div>
                          <Table hover size="sm" style={{ background:"var(--ud-card)",color:"var(--ud-text)" }}>
                            <thead style={{ background:"var(--ud-header-bg)" }}>
                              <tr>
                                <th>Sr No</th><th>Category</th><th>Doc Name</th>
                                <th>Comment</th><th>File Name</th><th>Doc</th>
                              </tr>
                            </thead>
                            <tbody>
                              {comment.documents.map(doc => (
                                <tr key={doc.sr_no}>
                                  <td>{doc.sr_no}</td>
                                  <td>{doc.category_name}</td>
                                  <td>{doc.document_name}</td>
                                  <td>{comment.comment_text}</td>
                                  <td style={{ fontSize:".82rem" }}>{doc.file_name}</td>
                                  <td>
                                    <Button variant="link" size="sm" style={{ padding:0 }}
                                      onClick={() => window.open(doc.file_path,"_blank")}>
                                      <i className="bi bi-file-pdf" style={{ fontSize:"1.4rem",color:"#dc2626" }}/>
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      )}
                    </div>
                  ))}
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