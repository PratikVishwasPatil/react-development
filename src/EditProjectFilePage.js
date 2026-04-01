import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const API_ROOT =
  "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/addproject";
const MASTER_API = `${API_ROOT}/addproject_data_api.php`;
const FILE_GET = `${API_ROOT}/file_edit_get.php`;
const FILE_UPDATE = `${API_ROOT}/file_edit_update.php`;
const PO_FILES_BASE = `${API_ROOT}/po_files`;

const getFileTypeId = (fileTypeValue) => String(fileTypeValue || "").split("-")[0];
const isAmcFile = (fileTypeId) => getFileTypeId(fileTypeId) === "2";
const isLabourFile = (fileTypeId) => getFileTypeId(fileTypeId) === "4";

const isoDate = (value) => {
  if (value == null || value === "") return "";
  const s = String(value);
  return s.length >= 10 ? s.slice(0, 10) : s;
};

function buildPoDocumentUrl(relativePath) {
  if (!relativePath || typeof relativePath !== "string") return "";
  const clean = relativePath.replace(/^[/\\]+/, "").replace(/\\/g, "/");
  if (!clean) return "";
  const segments = clean.split("/").filter(Boolean).map(encodeURIComponent);
  return `${PO_FILES_BASE}/${segments.join("/")}`;
}

function poPreviewKind(path) {
  const lower = path.toLowerCase();
  if (lower.endsWith(".pdf")) return "pdf";
  if (/\.(jpe?g|png|gif|webp)$/.test(lower)) return "image";
  return "other";
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const msg = data.error || `Request failed (${response.status})`;
    throw new Error(msg);
  }
  return data;
}

const pageStyles = `
  .epf-root {
    --epf-border: #e2e8f0;
    --epf-text: #1e293b;
    --epf-muted: #64748b;
    --epf-accent: #2563eb;
    --epf-accent2: #4f46e5;
    --epf-glow: 0 4px 14px rgba(37, 99, 235, 0.2);
    min-height: calc(100vh - 56px);
    padding: 1.5rem 1rem 3rem;
    background: #ffffff;
    color: var(--epf-text);
  }
  .epf-inner { max-width: 1180px; margin: 0 auto; }
  .epf-hero {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1.25rem;
    margin-bottom: 1.5rem;
  }
  .epf-title-block h1 {
    font-size: 1.65rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    margin: 0 0 0.35rem;
    color: #0f172a;
  }
  .epf-title-block p { margin: 0; color: var(--epf-muted); font-size: 0.9rem; }
  .epf-actions { display: flex; gap: 0.6rem; flex-wrap: wrap; }
  .epf-btn-ghost {
    background: #fff;
    border: 1px solid var(--epf-border);
    color: #334155 !important;
    border-radius: 10px;
    padding: 0.5rem 1.1rem;
    font-weight: 500;
  }
  .epf-btn-ghost:hover { background: #f8fafc; border-color: #cbd5e1; color: #0f172a !important; }
  .epf-root .btn.epf-btn-save {
    background: linear-gradient(135deg, var(--epf-accent) 0%, var(--epf-accent2) 100%) !important;
    border: none !important;
    border-radius: 10px;
    padding: 0.5rem 1.35rem;
    font-weight: 600;
    color: #fff !important;
    box-shadow: var(--epf-glow);
  }
  .epf-root .btn.epf-btn-save:hover { filter: brightness(1.05); color: #fff !important; }
  .epf-root .btn.epf-btn-save:disabled { opacity: 0.65; filter: none; }
  .epf-meta {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 0.75rem;
    margin-bottom: 1.25rem;
  }
  .epf-chip {
    background: #f8fafc;
    border: 1px solid var(--epf-border);
    border-radius: 12px;
    padding: 0.85rem 1rem;
  }
  .epf-chip label {
    display: block;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--epf-muted);
    margin-bottom: 0.25rem;
  }
  .epf-chip span { font-weight: 600; font-size: 0.95rem; color: var(--epf-text); }
  .epf-disclaimer {
    font-size: 0.8rem;
    color: var(--epf-muted);
    border-left: 3px solid var(--epf-accent);
    padding: 0.5rem 0 0.5rem 0.85rem;
    margin-bottom: 1.5rem;
    background: #eff6ff;
    border-radius: 0 8px 8px 0;
  }
  .epf-panel {
    background: #ffffff;
    border: 1px solid var(--epf-border);
    border-radius: 16px;
    padding: 1.35rem 1.35rem 1.5rem;
    margin-bottom: 1.25rem;
    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
  }
  .epf-section-head {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1.1rem;
    padding-bottom: 0.65rem;
    border-bottom: 1px solid var(--epf-border);
  }
  .epf-section-head i { color: var(--epf-accent); font-size: 1.15rem; }
  .epf-section-head h2 { margin: 0; font-size: 1.05rem; font-weight: 600; color: #0f172a; }
  .epf-form-label {
    color: var(--epf-muted) !important;
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 0.35rem;
  }
  .epf-root .form-control,
  .epf-root .form-select {
    background: #ffffff;
    border: 1px solid var(--epf-border);
    color: var(--epf-text);
    border-radius: 10px;
    padding: 0.55rem 0.85rem;
  }
  .epf-root .form-control:focus,
  .epf-root .form-select:focus {
    background: #ffffff;
    border-color: var(--epf-accent);
    color: var(--epf-text);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
  }
  .epf-root .form-control::placeholder { color: #94a3b8; }
  .epf-root .form-select option { background: #fff; color: #1e293b; }
  .epf-locked-type {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    background: #fffbeb;
    border: 1px dashed #fcd34d;
    border-radius: 10px;
    padding: 0.65rem 0.9rem;
    min-height: 42px;
  }
  .epf-locked-type i { color: #d97706; }
  .epf-locked-type strong { font-size: 0.95rem; color: var(--epf-text); }
  .epf-locked-type small { color: var(--epf-muted); display: block; font-size: 0.72rem; margin-top: 0.15rem; }
  .epf-po-viewer {
    background: #f8fafc;
    border: 1px solid var(--epf-border);
    border-radius: 14px;
    overflow: hidden;
    min-height: 420px;
    display: flex;
    flex-direction: column;
  }
  .epf-po-viewer-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 0.65rem 1rem;
    background: #f1f5f9;
    border-bottom: 1px solid var(--epf-border);
    font-size: 0.85rem;
    font-weight: 600;
    color: #0f172a;
  }
  .epf-po-viewer-head a {
    color: var(--epf-accent);
    text-decoration: none;
    font-size: 0.8rem;
    font-weight: 500;
  }
  .epf-po-viewer-head a:hover { text-decoration: underline; }
  .epf-po-frame-wrap {
    flex: 1;
    min-height: 380px;
    position: relative;
    background: #e2e8f0;
  }
  .epf-po-frame-wrap iframe {
    width: 100%;
    height: 100%;
    min-height: 380px;
    border: none;
    background: #f1f5f9;
  }
  .epf-po-img {
    width: 100%;
    max-height: 480px;
    object-fit: contain;
    display: block;
    margin: 0 auto;
    background: #f1f5f9;
  }
  .epf-po-fallback {
    padding: 2rem 1.25rem;
    text-align: center;
    color: var(--epf-muted);
    font-size: 0.9rem;
  }
  .epf-loader {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 280px;
    color: var(--epf-muted);
    background: #ffffff;
  }
  .epf-loader .spinner-border { color: var(--epf-accent); }
  @media (max-width: 991px) {
    .epf-po-viewer { margin-top: 1rem; min-height: 320px; }
    .epf-po-frame-wrap iframe { min-height: 320px; }
  }
`;

export default function EditProjectFilePage() {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lockedFileTypeName, setLockedFileTypeName] = useState("");
  const [masterData, setMasterData] = useState({
    file_types: [],
    financial_years: [],
    products: [],
    tax_types: []
  });
  const [context, setContext] = useState({
    customerName: "",
    ownerName: "",
    projectId: ""
  });
  const [parentFiles, setParentFiles] = useState([]);
  const [form, setForm] = useState({
    fileName: "",
    fileTypeId: "",
    parentFileNo: "",
    finacialYear: "",
    productId: "",
    projectDescription: "",
    storeLocation: "",
    unitLocation: "",
    cashAmount: "0",
    comment: "",
    quotationNumber: "",
    quotationDate: "",
    po_number: "",
    po_date: "",
    po_amount: "",
    lb_amount: "0",
    taxType: "",
    amcFrom: "",
    amcTo: "",
    amcVisit: "",
    mae: "",
    eea: ""
  });
  const [poFile, setPoFile] = useState(null);
  const [existingPoPath, setExistingPoPath] = useState("");

  const poDocumentUrl = useMemo(() => buildPoDocumentUrl(existingPoPath), [existingPoPath]);
  const poKind = useMemo(
    () => (existingPoPath ? poPreviewKind(existingPoPath) : null),
    [existingPoPath]
  );

  const loadMasters = useCallback(async () => {
    const data = await fetchJson(MASTER_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        actions: ["file_types", "financial_years", "products", "tax_types"]
      })
    });
    setMasterData({
      file_types: data.data?.file_types || [],
      financial_years: data.data?.financial_years || [],
      products: data.data?.products || [],
      tax_types: data.data?.tax_types || []
    });
    return data;
  }, []);

  useEffect(() => {
    document.title = "Edit project file";
  }, []);

  useEffect(() => {
    const run = async () => {
      const id = String(fileId || "").replace(/\D/g, "");
      if (!id) {
        toast.error("Invalid file id");
        setLoading(false);
        return;
      }
      try {
        const [masterRes, fileRes] = await Promise.all([
          loadMasters(),
          fetchJson(`${FILE_GET}?file_id=${encodeURIComponent(id)}`)
        ]);
        if (!fileRes.ok || !fileRes.file) {
          throw new Error(fileRes.error || "Failed to load file");
        }
        const fm = fileRes.file;
        const po = fileRes.po || null;
        const qv = fileRes.quotation || null;

        setContext({
          customerName: fm.CUSTOMER_NAME || "",
          ownerName: fm.owner_name || "",
          projectId: String(fm.PROJECT_ID ?? "")
        });
        setParentFiles(fileRes.parent_files || []);

        const types = masterRes.data?.file_types || [];
        const ft = types.find((t) => String(t.FILE_TYPE_ID) === String(fm.FILE_TYPE_ID));
        const fileTypeId = ft ? `${ft.FILE_TYPE_ID}-${ft.FILE_TYPE_MAPPING}` : String(fm.FILE_TYPE_ID);
        setLockedFileTypeName(ft?.FILE_TYPE_NAME || `Type ${fm.FILE_TYPE_ID ?? "—"}`);

        const taxes = masterRes.data?.tax_types || [];
        const taxRow = po ? taxes.find((t) => String(t.TAX_ID) === String(po.TAX_ID)) : null;
        const taxType = taxRow ? `${taxRow.TAX_ID}-${taxRow.TAX_PERCENTAGE}` : po?.TAX_ID ? String(po.TAX_ID) : "";

        setExistingPoPath(po?.PO_IMAGE_PATH || "");

        setForm({
          fileName: fm.FILE_NAME || "",
          fileTypeId,
          parentFileNo: fm.PARENT_FILE_ID != null ? String(fm.PARENT_FILE_ID) : "",
          finacialYear: fm.FINANCIAL_YEAR || "",
          productId: String(fm.PRODUCT_ID ?? ""),
          projectDescription: fm.PRODUCT_DESCRIPTION || "",
          storeLocation: fm.STORE_LOCATION || "",
          unitLocation: fm.UNIT_LOCATION || "",
          cashAmount: fm.cashamount != null && fm.cashamount !== "" ? String(fm.cashamount) : "0",
          comment: fm.comment || "",
          quotationNumber: qv?.QUOT_NUMBER || "",
          quotationDate: isoDate(qv?.QUOT_DATE),
          po_number: po?.PO_NUMBER || "",
          po_date: isoDate(po?.PO_DATE),
          po_amount: po?.PO_AMOUNT != null && po.PO_AMOUNT !== "" ? String(po.PO_AMOUNT) : "",
          lb_amount: po?.labour_amt != null && po.labour_amt !== "" ? String(po.labour_amt) : "0",
          taxType: taxType || (taxes[0] ? `${taxes[0].TAX_ID}-${taxes[0].TAX_PERCENTAGE}` : ""),
          amcFrom: isoDate(fm.AMC_Start_date),
          amcTo: isoDate(fm.AMC_end_date),
          amcVisit: fm.AMC_visit != null ? String(fm.AMC_visit) : "",
          mae: fm.Marketing_amount != null ? String(fm.Marketing_amount) : "",
          eea: fm.AMC_amount != null ? String(fm.AMC_amount) : ""
        });
      } catch (e) {
        console.error(e);
        toast.error(e.message || "Load failed");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [fileId, loadMasters]);

  const amcRow = useMemo(() => isAmcFile(form.fileTypeId), [form.fileTypeId]);
  const labourRow = useMemo(() => isLabourFile(form.fileTypeId), [form.fileTypeId]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const id = String(fileId || "").replace(/\D/g, "");
    if (!id) return;
    if (!form.fileName.trim() || !form.productId) {
      toast.error("File name and product are required");
      return;
    }

    const payload = {
      file_id: id,
      file: {
        fileName: form.fileName.trim(),
        fileTypeId: form.fileTypeId,
        parentFileNo: form.parentFileNo,
        finacialYear: form.finacialYear,
        productId: form.productId,
        projectDescription: form.projectDescription,
        storeLocation: form.storeLocation,
        unitLocation: form.unitLocation,
        cashAmount: form.cashAmount,
        comment: form.comment,
        amcFrom: amcRow ? form.amcFrom : "",
        amcTo: amcRow ? form.amcTo : "",
        amcVisit: amcRow ? form.amcVisit : "0",
        mae: form.mae,
        eea: form.eea
      },
      po: {
        po_number: form.po_number,
        po_date: form.po_date,
        po_amount: form.po_amount,
        lb_amount: form.lb_amount,
        taxType: form.taxType,
        unit_location: form.unitLocation
      },
      quotation: {
        quotationNumber: form.quotationNumber,
        quotationDate: form.quotationDate
      }
    };

    setSaving(true);
    try {
      if (poFile) {
        const fd = new FormData();
        fd.append("payload", JSON.stringify(payload));
        fd.append("poFile", poFile);
        const res = await fetch(FILE_UPDATE, { method: "POST", body: fd });
        const data = await res.json();
        if (!data.ok) throw new Error(data.error || "Save failed");
      } else {
        const data = await fetchJson(FILE_UPDATE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!data.ok) throw new Error(data.error || "Save failed");
      }
      toast.success("File updated");
      navigate("/marketing/project/project-list");
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const renderPoPreview = () => {
    if (!poDocumentUrl) return null;
    if (poKind === "pdf") {
      return <iframe title="PO document" src={poDocumentUrl} />;
    }
    if (poKind === "image") {
      return <img src={poDocumentUrl} alt="Purchase order" className="epf-po-img" />;
    }
    return (
      <div className="epf-po-fallback">
        <i className="bi bi-file-earmark-binary d-block mb-2" style={{ fontSize: "2rem", opacity: 0.5 }} />
        Inline preview is not available for this file type.
        <div className="mt-2">
          <a href={poDocumentUrl} target="_blank" rel="noopener noreferrer">
            Open document in new tab
          </a>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="epf-root">
        <style>{pageStyles}</style>
        <div className="epf-inner epf-loader">
          <Spinner animation="border" role="status" />
          <p className="mt-3 mb-0">Loading file…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="epf-root">
      <style>{pageStyles}</style>
      <ToastContainer position="top-right" theme="light" />
      <Container fluid className="epf-inner px-0">
        <header className="epf-hero">
          <div className="epf-title-block">
            <h1>Edit file data</h1>
            <p>
              <i className="bi bi-pencil-square me-1" />
              Update file, product, locations, PO and quotation — file type is fixed for this record.
            </p>
          </div>
          <div className="epf-actions">
            <Button variant="outline-secondary" className="epf-btn-ghost" onClick={() => navigate("/marketing/project/project-list")}>
              <i className="bi bi-arrow-left me-1" />
              Back to list
            </Button>
            <Button className="epf-btn-save text-white" onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-2" role="status" />
                  Saving…
                </>
              ) : (
                <>
                  <i className="bi bi-check2-circle me-1" />
                  Save changes
                </>
              )}
            </Button>
          </div>
        </header>

        <div className="epf-meta">
          <div className="epf-chip">
            <label>File ID</label>
            <span>{fileId}</span>
          </div>
          <div className="epf-chip">
            <label>Project ID</label>
            <span>{context.projectId || "—"}</span>
          </div>
          <div className="epf-chip">
            <label>Customer</label>
            <span>{context.customerName || "—"}</span>
          </div>
          <div className="epf-chip">
            <label>Owner</label>
            <span>{context.ownerName || "—"}</span>
          </div>
        </div>

        <p className="epf-disclaimer">
          Only file-level fields can be changed here — not project or customer master. File type cannot be changed after creation.
        </p>

        <section className="epf-panel">
          <div className="epf-section-head">
            <i className="bi bi-folder2-open" />
            <h2>File details</h2>
          </div>
          <Row className="g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label className="epf-form-label">File no / name</Form.Label>
                <Form.Control value={form.fileName} onChange={(e) => handleChange("fileName", e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="epf-form-label">File type</Form.Label>
                <div className="epf-locked-type">
                  <i className="bi bi-lock-fill" aria-hidden />
                  <div>
                    <strong>{lockedFileTypeName}</strong>
                    <small>Locked — cannot be changed</small>
                  </div>
                </div>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="epf-form-label">Financial year</Form.Label>
                <Form.Select value={form.finacialYear} onChange={(e) => handleChange("finacialYear", e.target.value)}>
                  <option value="">Select</option>
                  {masterData.financial_years.map((y) => (
                    <option key={y.id || y.financial_year} value={y.financial_year}>
                      {y.financial_year}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="epf-form-label">Parent file</Form.Label>
                <Form.Select value={form.parentFileNo} onChange={(e) => handleChange("parentFileNo", e.target.value)}>
                  <option value="">None</option>
                  {parentFiles.map((p) => (
                    <option key={p.FILE_ID} value={String(p.FILE_ID)}>
                      {p.FILE_NAME} (ID {p.FILE_ID})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="epf-form-label">Product</Form.Label>
                <Form.Select value={form.productId} onChange={(e) => handleChange("productId", e.target.value)}>
                  <option value="">Select</option>
                  {masterData.products.map((p) => (
                    <option key={p.PRODUCT_ID} value={String(p.PRODUCT_ID)}>
                      {p.PRODUCT_NAME}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="epf-form-label">Cash amount</Form.Label>
                <Form.Control value={form.cashAmount} onChange={(e) => handleChange("cashAmount", e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label className="epf-form-label">Product description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={form.projectDescription}
                  onChange={(e) => handleChange("projectDescription", e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="epf-form-label">Store location</Form.Label>
                <Form.Control value={form.storeLocation} onChange={(e) => handleChange("storeLocation", e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="epf-form-label">Unit location</Form.Label>
                <Form.Control value={form.unitLocation} onChange={(e) => handleChange("unitLocation", e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label className="epf-form-label">Comment</Form.Label>
                <Form.Control value={form.comment} onChange={(e) => handleChange("comment", e.target.value)} />
              </Form.Group>
            </Col>
          </Row>
        </section>

        {!labourRow && (
          <section className="epf-panel">
            <div className="epf-section-head">
              <i className="bi bi-file-text" />
              <h2>Quotation</h2>
            </div>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="epf-form-label">Quotation number</Form.Label>
                  <Form.Control
                    value={form.quotationNumber}
                    onChange={(e) => handleChange("quotationNumber", e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="epf-form-label">Quotation date</Form.Label>
                  <Form.Control
                    type="date"
                    value={form.quotationDate}
                    onChange={(e) => handleChange("quotationDate", e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
          </section>
        )}

        <section className="epf-panel">
          <div className="epf-section-head">
            <i className="bi bi-receipt" />
            <h2>Purchase order</h2>
          </div>
          <Row className="g-3">
            <Col lg={poDocumentUrl ? 6 : 12}>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="epf-form-label">PO number</Form.Label>
                    <Form.Control value={form.po_number} onChange={(e) => handleChange("po_number", e.target.value)} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="epf-form-label">PO date</Form.Label>
                    <Form.Control type="date" value={form.po_date} onChange={(e) => handleChange("po_date", e.target.value)} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="epf-form-label">Tax</Form.Label>
                    <Form.Select value={form.taxType} onChange={(e) => handleChange("taxType", e.target.value)}>
                      <option value="">Select</option>
                      {masterData.tax_types.map((t) => (
                        <option key={t.TAX_ID} value={`${t.TAX_ID}-${t.TAX_PERCENTAGE}`}>
                          {t.TAX_PERCENTAGE}%
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="epf-form-label">PO amount</Form.Label>
                    <Form.Control value={form.po_amount} onChange={(e) => handleChange("po_amount", e.target.value)} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="epf-form-label">Labour amount</Form.Label>
                    <Form.Control value={form.lb_amount} onChange={(e) => handleChange("lb_amount", e.target.value)} />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="epf-form-label">Replace PO document (optional)</Form.Label>
                    <Form.Control type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => setPoFile(e.target.files?.[0] || null)} />
                    {poFile ? (
                      <Form.Text className="text-warning">New file selected: {poFile.name} (saved on submit)</Form.Text>
                    ) : existingPoPath ? (
                      <Form.Text muted className="d-block mt-1">
                        Stored path: {existingPoPath}
                      </Form.Text>
                    ) : null}
                  </Form.Group>
                </Col>
              </Row>
            </Col>
            {poDocumentUrl ? (
              <Col lg={6}>
                <div className="epf-po-viewer">
                  <div className="epf-po-viewer-head">
                    <span>
                      <i className="bi bi-eye me-1" />
                      Current PO document
                    </span>
                    <a href={poDocumentUrl} target="_blank" rel="noopener noreferrer">
                      Open full screen
                      <i className="bi bi-box-arrow-up-right ms-1" />
                    </a>
                  </div>
                  <div className="epf-po-frame-wrap">{renderPoPreview()}</div>
                </div>
              </Col>
            ) : null}
          </Row>
          {!poDocumentUrl ? (
            <div className="epf-po-fallback mt-2 mb-0" style={{ background: "#f1f5f9", borderRadius: 12, border: "1px solid #e2e8f0" }}>
              No PO document on file. Upload one above if needed.
            </div>
          ) : null}
        </section>

        {amcRow && (
          <section className="epf-panel">
            <div className="epf-section-head">
              <i className="bi bi-calendar-check" />
              <h2>AMC</h2>
            </div>
            <Row className="g-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="epf-form-label">AMC from</Form.Label>
                  <Form.Control type="date" value={form.amcFrom} onChange={(e) => handleChange("amcFrom", e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="epf-form-label">AMC to</Form.Label>
                  <Form.Control type="date" value={form.amcTo} onChange={(e) => handleChange("amcTo", e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="epf-form-label">AMC visits</Form.Label>
                  <Form.Control value={form.amcVisit} onChange={(e) => handleChange("amcVisit", e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="epf-form-label">Marketing amount</Form.Label>
                  <Form.Control value={form.mae} onChange={(e) => handleChange("mae", e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="epf-form-label">AMC amount</Form.Label>
                  <Form.Control value={form.eea} onChange={(e) => handleChange("eea", e.target.value)} />
                </Form.Group>
              </Col>
            </Row>
          </section>
        )}
      </Container>
    </div>
  );
}
