import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Container, Spinner } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

/* ═══════════════════════════════════════════════════════════
   API BASE URLs
═══════════════════════════════════════════════════════════ */
const API_BASE =
  "http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/Productdatasheetapi.php";

const BUTTON_API =
  "http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/ProductButtonApi.php";

const SAVE_API =
  "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/saveProjectDatasheetApi.php";

const UPDATE_API =
  "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/updateProjectDataSheetApi.php";

/* ═══════════════════════════════════════════════════════════
   MATERIAL LABELS — postKey MUST match PHP key prefix exactly
═══════════════════════════════════════════════════════════ */
const MAT_LABELS = [
  { key: "Foundation",           postKey: "foundation",     unit: "Kgs"   },
  { key: "Fabrication",          postKey: "fabrication",    unit: "Kgs"   },
  { key: "Sheet-metal Exterior", postKey: "sheetExterior",  unit: "Kgs"   },
  { key: "Sheet-metal Super",    postKey: "sheetSuper",     unit: "Kgs"   },
  { key: "Powder Coat Super",    postKey: "powderSuper",    unit: "Sq ft" },
  { key: "Powder coat Exterior", postKey: "powderExterior", unit: ""      },
  { key: "Drive",                postKey: "drive",          unit: ""      },
  { key: "Assembly",             postKey: "assembly",       unit: "nos"   },
  { key: "Electrical Material",  postKey: "electrical",     unit: "Rs."   },
  { key: "Hardware",             postKey: "hardware",       unit: ""      },
  { key: "Total RM Cost",        postKey: "totalRmCost",    unit: "Sq ft" },
];

/* ═══════════════════════════════════════════════════════════
   GLOBAL CSS
═══════════════════════════════════════════════════════════ */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');

  @keyframes slideIn  { from{transform:translateX(420px);opacity:0} to{transform:translateX(0);opacity:1} }
  @keyframes slideOut { from{transform:translateX(0);opacity:1}     to{transform:translateX(420px);opacity:0} }
  @keyframes fadeUp   { from{opacity:0;transform:translateY(14px)}  to{opacity:1;transform:translateY(0)} }

  :root {
    --ds-bg:#f0f4f8; --ds-card:#fff; --ds-header-bg:#f7f9fc;
    --ds-border:#d8e0ec; --ds-text:#1a2340; --ds-muted:#7a8aaa;
    --ds-accent:#1d6fbd; --ds-accent-soft:rgba(29,111,189,.07);
  }

  .ds-root{font-family:'DM Sans',sans-serif;min-height:100vh;background:var(--ds-bg);padding:24px 0;}
  .fade-in{animation:fadeUp .45s ease both;}

  .ds-block{background:var(--ds-card);border:1px solid var(--ds-border);border-radius:14px;overflow:hidden;box-shadow:0 2px 14px rgba(0,0,0,.06);margin-bottom:20px;}
  .ds-block-header{background:var(--ds-header-bg);border-bottom:1px solid var(--ds-border);padding:10px 20px;display:flex;align-items:center;gap:10px;}
  .ds-block-bar{width:4px;height:18px;border-radius:2px;background:var(--ds-accent);flex-shrink:0;}
  .ds-block-title{font-family:'Syne',sans-serif;font-weight:700;font-size:.82rem;letter-spacing:.1em;text-transform:uppercase;color:var(--ds-accent);}
  .ds-block-body{padding:20px 22px 24px;}

  .ds-field{margin-bottom:16px;}
  .ds-field-label{font-size:.72rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--ds-muted);margin-bottom:4px;display:block;}
  .ds-field-value{font-size:.9rem;font-weight:600;color:var(--ds-accent);border-bottom:1.5px solid var(--ds-border);padding-bottom:4px;min-height:22px;}
  .ds-field-input{width:100%;border:none;border-bottom:1.5px solid var(--ds-border);background:transparent;padding:4px 2px;font-size:.88rem;color:var(--ds-text);outline:none;font-family:'DM Sans',sans-serif;transition:border .15s;}
  .ds-field-input:focus{border-bottom-color:var(--ds-accent);}
  .ds-field-textarea{width:100%;border:1px solid var(--ds-border);border-radius:7px;background:transparent;padding:6px 8px;font-size:.85rem;color:var(--ds-text);outline:none;font-family:'DM Sans',sans-serif;resize:vertical;min-height:46px;transition:border .15s;}
  .ds-field-textarea:focus{border-color:var(--ds-accent);}

  .ds-radio-row{display:flex;align-items:center;gap:7px;font-size:.84rem;color:var(--ds-text);cursor:pointer;margin-right:16px;}
  .ds-radio-row input{accent-color:var(--ds-accent);width:15px;height:15px;cursor:pointer;flex-shrink:0;}

  .ds-table{width:100%;border-collapse:collapse;}
  .ds-table th{background:linear-gradient(135deg,#e8560a,#f07030);color:#fff;padding:8px 12px;font-size:.8rem;font-weight:700;text-align:center;letter-spacing:.04em;border:1px solid rgba(255,255,255,.2);}
  .ds-table th.add-col{background:#e8560a;width:46px;text-align:center;}
  .ds-table td{border:1px solid var(--ds-border);padding:0;vertical-align:middle;}
  .ds-table td.ctrl-col{width:46px;text-align:center;background:var(--ds-header-bg);}
  .ds-table td.label-col{text-align:left;font-size:.84rem;font-weight:500;color:var(--ds-text);padding:6px 12px;}
  .ds-table td.unit-col{text-align:center;font-size:.8rem;color:var(--ds-muted);padding:4px 8px;}
  .ds-table td input{width:100%;border:none;background:transparent;padding:7px 10px;font-size:.85rem;color:var(--ds-text);outline:none;text-align:center;font-family:'DM Sans',sans-serif;}
  .ds-table td input:focus{background:var(--ds-accent-soft);}
  .ds-table tr:nth-child(even) td{background:var(--ds-header-bg);}

  .ds-header-grad{background:linear-gradient(135deg,#1e3a5f 0%,#2e6db4 60%,#1a9ed9 100%);}
  .ds-header-grad-dark{background:linear-gradient(135deg,#1a1f2e 0%,#2d3a52 100%);}

  .ctrl-btn{background:#e8560a;border:none;border-radius:50%;width:24px;height:24px;color:#fff;font-size:1.1rem;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;}
  .ctrl-btn-plus{background:#e8560a;border:none;border-radius:50%;width:26px;height:26px;color:#fff;font-size:1.2rem;cursor:pointer;line-height:26px;text-align:center;}

  body.dark-mode{
    --ds-bg:#13161e;--ds-card:#1e2330;--ds-header-bg:#252b3b;
    --ds-border:#2e3650;--ds-text:#e8edf5;--ds-muted:#8b95af;
    --ds-accent:#60a5fa;--ds-accent-soft:rgba(96,165,250,.1);
  }
`;

/* ═══════════════════════════════════════════════════════════
   MINI COMPONENTS
═══════════════════════════════════════════════════════════ */
const Block = ({ title, children }) => (
  <div className="ds-block">
    <div className="ds-block-header">
      <div className="ds-block-bar" />
      <span className="ds-block-title">{title}</span>
    </div>
    <div className="ds-block-body">{children}</div>
  </div>
);

const ReadField = ({ label, value }) => (
  <div className="ds-field">
    <span className="ds-field-label">{label}</span>
    <div className="ds-field-value">{value || "—"}</div>
  </div>
);

const FInput = ({ label, value, onChange, type = "text", placeholder = "" }) => (
  <div className="ds-field">
    {label && <span className="ds-field-label">{label}</span>}
    <input
      className="ds-field-input"
      type={type}
      value={value ?? ""}
      onChange={onChange}
      placeholder={placeholder}
    />
  </div>
);

const FTextarea = ({ label, value, onChange }) => (
  <div className="ds-field">
    {label && <span className="ds-field-label">{label}</span>}
    <textarea
      className="ds-field-textarea"
      value={value ?? ""}
      onChange={onChange}
      rows={2}
    />
  </div>
);

const Radio = ({ name, value, checked, onChange, label }) => (
  <label className="ds-radio-row">
    <input type="radio" name={name} value={value} checked={checked} onChange={onChange} />
    {label}
  </label>
);

const Chk = ({ checked, onChange, label }) => (
  <label className="ds-radio-row">
    <input type="checkbox" checked={!!checked} onChange={onChange} />
    {label}
  </label>
);

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
const ProductDataSheet = () => {

  const { projectId: paramPid, fileId: paramFid } = useParams();

  const getIds = () => {
    const hash = window.location.hash;
    const m    = hash.match(/\/product-datasheet\/(\d+)\/(\d+)/);
    if (m) return { projectId: m[1], fileId: m[2] };
    return { projectId: paramPid || "3272", fileId: paramFid || "4990" };
  };

  const { projectId, fileId } = getIds();

  const [theme,        setTheme]        = useState("light");
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [buttonAction, setButtonAction] = useState("save");
  const [header,       setHeader]       = useState(null);

  const [form, setForm] = useState({
    committedDispatch:    "",
    contactPersonAccDept: "",
    phoneOfAccDept:       "",
    transportCharge:      "",
    anyOtherDocs:         "",
    dimensionTakenBy:     "",
    materialSpecs:        "",
    designSpecs:          "",
    paint:                "",
    shade:                "",
    sketchChecked:        false,
    drawingChecked:       false,
    manualChecked:        false,
    computerChecked:      false,
    drawnBy:              "",
    drawingNumber:        "",
    siteDistance:         "",
    remark:               "",
    dispatchAllowed:      "",
  });

  const emptyDimRow = () => ({ location: "", length: "", width: "", height: "", quantity: "" });
  const [dimRows, setDimRows] = useState([emptyDimRow()]);

  const initMatRows = () =>
    MAT_LABELS.map((m) => ({
      desc:    m.key,
      postKey: m.postKey,
      unit:    m.unit,
      weight:  "",
      amount:  "",
    }));

  const [matRows,        setMatRows]        = useState(initMatRows());
  const [siteExpense,    setSiteExpense]    = useState("");
  const [manDaysAllowed, setManDaysAllowed] = useState("");
  const [transpCost,     setTranspCost]     = useState("");

  /* ── CSS inject ── */
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = GLOBAL_CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", theme === "dark");
    document.body.style.background = "var(--ds-bg)";
  }, [theme]);

  /* ── Toast ── */
  const toast = useCallback((msg, type = "info") => {
    const d  = document.createElement("div");
    const bg = type === "success" ? "#16a34a" : type === "error" ? "#dc2626" : "#2563eb";
    d.style.cssText = `position:fixed;top:22px;right:22px;padding:13px 22px;background:${bg};color:#fff;border-radius:10px;box-shadow:0 6px 20px rgba(0,0,0,.2);z-index:9999;font-family:'DM Sans',sans-serif;font-size:.9rem;font-weight:500;animation:slideIn .3s ease-out;max-width:380px;word-break:break-word;`;
    d.textContent = msg;
    document.body.appendChild(d);
    setTimeout(() => {
      d.style.animation = "slideOut .3s ease-out";
      setTimeout(() => d.remove(), 300);
    }, 4500);
  }, []);

  /* ── 1. Check button action ── */
  useEffect(() => {
    fetch(`${BUTTON_API}?project_id=${projectId}`)
      .then((r) => r.json())
      .then((j) => { if (j.status === "success") setButtonAction(j.action); })
      .catch((e) => console.warn("Button check:", e.message));
  }, [projectId]);

  /* ── 2. Fetch all data ── */
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const res  = await fetch(`${API_BASE}?section=all&projectID=${projectId}&fileId=${fileId}`);
        const json = await res.json();

        if (json.status !== "success" || !json.data) {
          toast("Failed to load data sheet", "error");
          return;
        }

        const d  = json.data;
        const ph = d.project_header      || {};
        const od = d.other_details       || {};
        const dm = d.dimensions          || [];
        const me = d.material_estimation || {};

        setHeader(ph);

        const sketchDraw = (od.sketch_drawing  || "").split(",").map((s) => s.trim());
        const manualComp = (od.manual_computer  || "").split(",").map((s) => s.trim());

        setForm({
          committedDispatch:    od.committed_dispatch_date || "",
          contactPersonAccDept: od.account_dept_person     || "",
          phoneOfAccDept:       od.account_contact         || "",
          transportCharge:      od.transport_charges       || "",
          anyOtherDocs:         ph.special_official_req    || "",
          dimensionTakenBy:     od.dimension_taken_by      || "",
          materialSpecs:        ph.special_instructions    || "",
          designSpecs:          ph.special_requirements    || "",
          paint:                od.paint                   || "",
          shade:                od.shade                   || "",
          sketchChecked:        sketchDraw.includes("Sketch"),
          drawingChecked:       sketchDraw.includes("Drawing"),
          manualChecked:        manualComp.includes("Manual"),
          computerChecked:      manualComp.includes("Computer"),
          drawnBy:              od.drawn_by                || "",
          drawingNumber:        od.drawing_number          || "",
          siteDistance:         od.site_distance           || "",
          remark:               od.remark                  || "",
          dispatchAllowed:      od.dispatch_allowed        || "",
        });

        if (dm.length > 0) {
          setDimRows(dm.map((r) => ({
            location: r.location || "",
            length:   r.length   || "",
            width:    r.width    || "",
            height:   r.height   || "",
            quantity: r.quantity || "",
          })));
        }

        if (me.table_rows?.length > 0) {
          setMatRows(MAT_LABELS.map((lbl) => {
            const found = me.table_rows.find((r) => r.work_type === lbl.key);
            return {
              desc:    lbl.key,
              postKey: lbl.postKey,
              unit:    found?.unit   || lbl.unit,
              weight:  found?.weight || "",
              amount:  found?.cost   || "",
            };
          }));
        }

        setSiteExpense(    me.site_expense      || "");
        setManDaysAllowed( me.man_days_allowed  || "");
        setTranspCost(     me.transportation    || "");

      } catch (err) {
        toast(`Load error: ${err.message}`, "error");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
    // eslint-disable-next-line
  }, [projectId, fileId]);

  /* ── Helpers ── */
  const addDimRow    = () => setDimRows((r) => [...r, emptyDimRow()]);
  const removeDimRow = (i) => setDimRows((r) => r.filter((_, idx) => idx !== i));
  const updDim       = (i, k, v) =>
    setDimRows((r) => r.map((row, idx) => (idx === i ? { ...row, [k]: v } : row)));
  const updMat       = (i, k, v) =>
    setMatRows((r) => r.map((row, idx) => (idx === i ? { ...row, [k]: v } : row)));
  const setF         = (k) => (e) =>
    setForm((p) => ({
      ...p,
      [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  /* ══════════════════════════════════════════════
     BUILD FormData — exactly matches PHP $_POST
     
     KEY RULES:
     • Checkboxes: send "Sketch"/"Drawing"/"Computer"/"Manual" or "" (empty string)
     • Dimensions:  L[], W[], H[], data[], QTY[]
     • Materials:   {postKey}Type / Unit / Weight / Cost
     • Weight:      send actual value or "" (NOT "0" for blank)
  ══════════════════════════════════════════════ */
  const buildFormData = () => {
    const fd = new FormData();

    // Core IDs
    fd.append("projID",  projectId);
    fd.append("FILE_ID", fileId);

    // Main fields
    fd.append("paint",                form.paint);
    fd.append("shade",                form.shade);
    fd.append("drawnBy",              form.drawnBy);
    fd.append("drawingNumber",        form.drawingNumber);
    fd.append("siteDistance",         form.siteDistance);
    fd.append("transportCharge",      form.transportCharge);
    fd.append("contactPersonAccDept", form.contactPersonAccDept);
    fd.append("phoneOfAccDept",       form.phoneOfAccDept);
    fd.append("dimensionTakenBy",     form.dimensionTakenBy);
    fd.append("dispatchAllowed",      form.dispatchAllowed);
    fd.append("remark",               form.remark);
    fd.append("siteExpense",          siteExpense);
    fd.append("manDaysAllowed",       manDaysAllowed);
    fd.append("transpCost",           transpCost);

    // Checkboxes → string values PHP uses
    fd.append("sketchInput",   form.sketchChecked   ? "Sketch"   : "");
    fd.append("drawingInput",  form.drawingChecked  ? "Drawing"  : "");
    fd.append("computerInput", form.computerChecked ? "Computer" : "");
    fd.append("manualInput",   form.manualChecked   ? "Manual"   : "");

    // Dimension arrays — PHP reads L[], W[], H[], data[], QTY[]
    dimRows.forEach((row) => {
      fd.append("L[]",    row.length);
      fd.append("W[]",    row.width);
      fd.append("H[]",    row.height);
      fd.append("data[]", row.location);
      fd.append("QTY[]",  row.quantity);
    });

    // Material rows — PHP reads {postKey}Type / Unit / Weight / Cost
    matRows.forEach((row) => {
      fd.append(`${row.postKey}Type`,   row.desc);
      fd.append(`${row.postKey}Unit`,   row.unit);
      fd.append(`${row.postKey}Weight`, row.weight);  // keep as-is (PHP skips if blank)
      fd.append(`${row.postKey}Cost`,   row.amount);
    });

    return fd;
  };

  /* ── 3. Save / Update handler ── */
  const handleSave = async () => {
    setSaving(true);
    try {
      const endpoint = buttonAction === "update" ? UPDATE_API : SAVE_API;
      const fd       = buildFormData();

      // Debug log — check browser console
      console.group(`📤 ${buttonAction.toUpperCase()} → ${endpoint}`);
      for (const [k, v] of fd.entries()) console.log(`  ${k} =`, v);
      console.groupEnd();

      const res  = await fetch(endpoint, { method: "POST", body: fd });
      const text = await res.text();  // read raw first to catch HTML PHP errors
      console.log("📥 Raw PHP response:", text);

      let json;
      try {
        json = JSON.parse(text);
      } catch {
        toast(`PHP error: ${text.substring(0, 200)}`, "error");
        return;
      }

      if (json.status === "success") {
        toast(
          buttonAction === "update"
            ? "✓ Data Sheet updated successfully!"
            : "✓ Data Sheet saved successfully!",
          "success"
        );
        setButtonAction("update");
      } else {
        toast(`Failed: ${json.message || "Unknown error"}`, "error");
        console.error("❌ API returned error:", json);
      }
    } catch (err) {
      toast(`Network error: ${err.message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const isUpdate  = buttonAction === "update";
  const btnBg     = saving ? "#94a3b8"
    : isUpdate ? "linear-gradient(135deg,#e8560a,#f07030)"
    : "linear-gradient(135deg,#1d6fbd 0%,#1a9ed9 100%)";
  const btnShadow = saving ? "none"
    : isUpdate ? "0 6px 20px rgba(232,86,10,.35)"
    : "0 6px 20px rgba(29,111,189,.35)";

  if (loading) {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center",
        justifyContent:"center", background:"var(--ds-bg)" }}>
        <div style={{ textAlign:"center" }}>
          <Spinner animation="border"
            style={{ width:"3rem", height:"3rem", color:"var(--ds-accent)" }} />
          <p style={{ marginTop:16, fontFamily:"'DM Sans',sans-serif",
            fontWeight:500, color:"var(--ds-text)" }}>Loading data sheet…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ds-root fade-in">
      <Container fluid style={{ maxWidth: 1440 }}>

        {/* ── TOP HEADER ── */}
        <div className="ds-block" style={{ marginBottom:20 }}>
          <div className={theme === "dark" ? "ds-header-grad-dark" : "ds-header-grad"}
            style={{ padding:"20px 26px", borderRadius:"14px 14px 0 0" }}>
            <div style={{ display:"flex", alignItems:"center",
              justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>

              <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ width:42, height:42, borderRadius:10,
                  background:"rgba(255,255,255,.18)", display:"flex",
                  alignItems:"center", justifyContent:"center", fontSize:"1.4rem" }}>
                  📋
                </div>
                <div>
                  <h4 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800,
                    color:"#fff", margin:0, fontSize:"1.2rem" }}>
                    Product Data Sheet
                  </h4>
                  <div style={{ display:"flex", gap:16, flexWrap:"wrap", marginTop:4 }}>
                    {[
                      { icon:"bi-hash",     label:"File",     val: header?.file_name    || fileId },
                      { icon:"bi-building", label:"Customer", val: header?.customer_name || "—" },
                      { icon:"bi-box",      label:"Product",  val: header?.product_name  || "—" },
                    ].map((it) => (
                      <span key={it.label} style={{ fontSize:".82rem",
                        color:"rgba(255,255,255,.82)", display:"flex",
                        alignItems:"center", gap:5 }}>
                        <i className={`bi ${it.icon}`} />
                        <strong style={{ color:"rgba(255,255,255,.6)", fontWeight:500 }}>
                          {it.label}:&nbsp;
                        </strong>
                        {it.val}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display:"flex", gap:10 }}>
                <button onClick={() => setTheme((t) => t === "light" ? "dark" : "light")}
                  style={{ background:"rgba(255,255,255,.15)",
                    border:"1.5px solid rgba(255,255,255,.3)", color:"#fff",
                    borderRadius:8, padding:"7px 16px", fontFamily:"'DM Sans',sans-serif",
                    fontWeight:600, fontSize:".83rem", cursor:"pointer" }}>
                  {theme === "light" ? "🌙 Dark" : "☀️ Light"}
                </button>
                <button onClick={() => window.history.back()}
                  style={{ background:"rgba(255,255,255,.15)",
                    border:"1.5px solid rgba(255,255,255,.3)", color:"#fff",
                    borderRadius:8, padding:"7px 16px", fontFamily:"'DM Sans',sans-serif",
                    fontWeight:600, fontSize:".83rem", cursor:"pointer" }}>
                  ← Back
                </button>
                <button onClick={() => window.print()}
                  style={{ background:"linear-gradient(135deg,#e8560a,#f07030)",
                    border:"none", color:"#fff", borderRadius:8, padding:"7px 20px",
                    fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:".83rem",
                    cursor:"pointer", boxShadow:"0 4px 14px rgba(232,86,10,.35)" }}>
                  <i className="bi bi-printer me-2" />Print
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════
            SECTION 1 — PRODUCT DATA SHEET
        ════════════════════════════════ */}
        <Block title="ADD PRODUCT DATA SHEET">

          {/* Row 1 — read-only */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr",
            gap:"0 24px", marginBottom:8 }}>
            <ReadField label="File No."           value={header?.file_name     || "—"} />
            <ReadField label="Name of the Client" value={header?.customer_name || "—"} />
            <ReadField label="Address"            value={header?.address       || "—"} />
            <ReadField label="Product Name"       value={header?.product_name  || "—"} />
          </div>

          {/* Row 2 — read-only */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr",
            gap:"0 24px", marginBottom:8 }}>
            <ReadField label="Concerned Person" value={header?.contact_person || "—"} />
            <ReadField label="Mobile No."       value={header?.contact_number || "—"} />
            <ReadField label="P.O. No."         value={header?.po_number      || "—"} />
            <ReadField label="P.O. Date"        value={header?.po_date        || "—"} />
          </div>

          {/* Row 3 — editable */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr",
            gap:"0 24px", marginBottom:16, alignItems:"end" }}>
            <FInput label="Committed date of Dispatch" type="date"
              value={form.committedDispatch}    onChange={setF("committedDispatch")} />
            <FInput label="Concern person of Accounts Dept"
              value={form.contactPersonAccDept} onChange={setF("contactPersonAccDept")} />
            <FInput label="Phone No. of Concern Person"
              value={form.phoneOfAccDept}       onChange={setF("phoneOfAccDept")} />
            <div className="ds-field">
              <span className="ds-field-label">Transport Charges</span>
              <div style={{ display:"flex", flexWrap:"wrap", gap:4, paddingTop:6 }}>
                {[
                  { v:"WePay",        l:"We Pay"          },
                  { v:"ToPay",        l:"To Pay"          },
                  { v:"payReimburse", l:"Pay & Reimburse" },
                ].map(({ v, l }) => (
                  <Radio key={v} name="transportCharge" value={v}
                    checked={form.transportCharge === v}
                    onChange={() => setForm((p) => ({ ...p, transportCharge: v }))}
                    label={l} />
                ))}
              </div>
            </div>
          </div>

          {/* Any other documents */}
          <div style={{ marginBottom:20 }}>
            <FInput label="Any other documents"
              value={form.anyOtherDocs} onChange={setF("anyOtherDocs")} />
          </div>

          {/* ── Dimension Table ── */}
          <div style={{ marginBottom:6, fontSize:".85rem",
            fontWeight:600, color:"var(--ds-accent)" }}>
            Overall Dimension Related Information :
          </div>
          <div style={{ overflowX:"auto", marginBottom:22 }}>
            <table className="ds-table">
              <thead>
                <tr>
                  <th className="add-col">
                    <button className="ctrl-btn-plus" onClick={addDimRow}>+</button>
                  </th>
                  <th>Location</th>
                  <th>L (mm)</th>
                  <th>W (mm)</th>
                  <th>H (mm)</th>
                  <th>Qty</th>
                </tr>
              </thead>
              <tbody>
                {dimRows.map((row, i) => (
                  <tr key={i}>
                    <td className="ctrl-col">
                      <button className="ctrl-btn" onClick={() => removeDimRow(i)}>−</button>
                    </td>
                    <td><input value={row.location}
                        onChange={(e) => updDim(i,"location",e.target.value)}
                        placeholder="Location" /></td>
                    <td><input value={row.length}
                        onChange={(e) => updDim(i,"length",e.target.value)}
                        placeholder="0" /></td>
                    <td><input value={row.width}
                        onChange={(e) => updDim(i,"width",e.target.value)}
                        placeholder="0" /></td>
                    <td><input value={row.height}
                        onChange={(e) => updDim(i,"height",e.target.value)}
                        placeholder="0" /></td>
                    <td><input value={row.quantity}
                        onChange={(e) => updDim(i,"quantity",e.target.value)}
                        placeholder="1" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Dims taken by | Material specs | Design specs */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr",
            gap:"0 24px", marginBottom:16 }}>
            <FInput label="Dimensions taken by"
              value={form.dimensionTakenBy} onChange={setF("dimensionTakenBy")} />
            <FInput label="Material Specifications"
              value={form.materialSpecs}    onChange={setF("materialSpecs")} />
            <FTextarea label="Design specifications considered"
              value={form.designSpecs}      onChange={setF("designSpecs")} />
          </div>

          {/* Paint | Shade | Checkboxes */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr",
            gap:"0 24px", marginBottom:16, alignItems:"end" }}>

            <div className="ds-field">
              <span className="ds-field-label">Paint</span>
              <div style={{ display:"flex", flexWrap:"wrap", gap:4, paddingTop:6 }}>
                {["Powder Coating","Synthetic Enamel","Combination"].map((v) => (
                  <Radio key={v} name="paint" value={v} checked={form.paint === v}
                    onChange={() => setForm((p) => ({ ...p, paint: v }))} label={v} />
                ))}
              </div>
            </div>

            <FInput label="Shade" value={form.shade} onChange={setF("shade")} />

            <div className="ds-field">
              <span className="ds-field-label">&nbsp;</span>
              <div style={{ display:"flex", gap:18, flexWrap:"wrap" }}>
                <Chk checked={form.sketchChecked}   onChange={setF("sketchChecked")}   label="SKETCH" />
                <Chk checked={form.drawingChecked}  onChange={setF("drawingChecked")}  label="DRAWING" />
              </div>
              <div style={{ display:"flex", gap:18, flexWrap:"wrap", marginTop:8 }}>
                <Chk checked={form.manualChecked}   onChange={setF("manualChecked")}   label="Manual" />
                <Chk checked={form.computerChecked} onChange={setF("computerChecked")} label="Computer" />
              </div>
            </div>
          </div>

          {/* Drawn By | Drawing No */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"0 24px" }}>
            <FInput label="Drawn by"   value={form.drawnBy}      onChange={setF("drawnBy")} />
            <FInput label="Drawing No" value={form.drawingNumber} onChange={setF("drawingNumber")} />
            <div />
          </div>
        </Block>

        {/* ════════════════════════════════
            SECTION 2 — MATERIAL ESTIMATION
        ════════════════════════════════ */}
        <Block title="MATERIAL ESTIMATION RELATED INFO">
          <div style={{ overflowX:"auto", marginBottom:20 }}>
            <table className="ds-table">
              <thead>
                <tr>
                  <th style={{ width:"36%", textAlign:"left", paddingLeft:20 }}>Description</th>
                  <th style={{ width:"22%" }}>Weight / Qty</th>
                  <th style={{ width:"14%" }}>Unit</th>
                  <th>Amount (Rs.)</th>
                </tr>
              </thead>
              <tbody>
                {matRows.map((row, i) => (
                  <tr key={i}>
                    <td className="label-col">{row.desc}</td>
                    <td>
                      <input value={row.weight}
                        onChange={(e) => updMat(i,"weight",e.target.value)}
                        placeholder="0" />
                    </td>
                    <td className="unit-col">{row.unit}</td>
                    <td>
                      <input value={row.amount}
                        onChange={(e) => updMat(i,"amount",e.target.value)}
                        placeholder="0.00" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr",
            gap:"0 24px", marginBottom:12 }}>
            <FInput label="Site Expense Allowed (Rs)"
              value={siteExpense}         onChange={(e) => setSiteExpense(e.target.value)} />
            <FInput label="No. of Man Days Allowed (Nos.)"
              value={manDaysAllowed}      onChange={(e) => setManDaysAllowed(e.target.value)} />
            <FInput label="No. of Dispatch Allowed (Nos.)"
              value={form.dispatchAllowed} onChange={setF("dispatchAllowed")} />
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"0 24px" }}>
            <FInput label="Transportation Cost (Rs.)"
              value={transpCost}        onChange={(e) => setTranspCost(e.target.value)} />
            <FInput label="Site Distance (Km.)"
              value={form.siteDistance} onChange={setF("siteDistance")} />
            <FTextarea label="Remark"
              value={form.remark}       onChange={setF("remark")} />
          </div>
        </Block>

        {/* ════════════════════════════════
            SAVE / UPDATE BUTTON
        ════════════════════════════════ */}
        <div style={{ textAlign:"center", paddingBottom:32 }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              background:    btnBg,
              border:        "none",
              color:         "#fff",
              borderRadius:  10,
              padding:       "13px 50px",
              fontFamily:    "'Syne',sans-serif",
              fontWeight:    700,
              fontSize:      "1rem",
              letterSpacing: ".04em",
              cursor:        saving ? "not-allowed" : "pointer",
              boxShadow:     btnShadow,
              transition:    "transform .18s,box-shadow .18s",
            }}
            onMouseEnter={(e) => {
              if (!saving) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = isUpdate
                  ? "0 10px 28px rgba(232,86,10,.45)"
                  : "0 10px 28px rgba(29,111,189,.45)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "";
              e.currentTarget.style.boxShadow = btnShadow;
            }}
          >
            {saving ? (
              <>
                <Spinner animation="border" size="sm"
                  style={{ marginRight:8, verticalAlign:"middle" }} />
                {isUpdate ? "Updating…" : "Saving…"}
              </>
            ) : isUpdate ? (
              <><i className="bi bi-pencil-square me-2" />Update Data Sheet</>
            ) : (
              <><i className="bi bi-floppy me-2" />Save Data Sheet</>
            )}
          </button>
        </div>

      </Container>
    </div>
  );
};

export default ProductDataSheet;