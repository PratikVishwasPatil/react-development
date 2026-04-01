import React, { useEffect, useState, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Form,
} from "react-bootstrap";
import { useParams } from "react-router-dom";
import CommonAlertModal from "./CommonAlertModal";

export default function PURCHASEApprovePOListDetails() {
  // 1️⃣ Logic: Holds data coming from API (Restored)
  const [poData, setPoData] = useState(null);
  const { supplier_id, po_number } = useParams();
  const [theme, setTheme] = useState("light");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    message: "",
    variant: "success",
  });

  // 2️⃣ Logic: Holds user-entered data (Restored)
  const [formData, setFormData] = useState({
    yourRefNo: "",
    poDate: "",
    validDate: "",
    refDate: "",
    note: "",
  });

  const [loading, setLoading] = useState(false);
  const dateFields = [
    { label: "PO Date", name: "poDate" },
    { label: "Valid Date", name: "validDate" },
    { label: "Ref. Date", name: "refDate" },
  ];

  // Theme styles (Reference to your first code's logic)
  const themeStyles = useMemo(() => {
    if (theme === "dark") {
      return {
        backgroundColor: "linear-gradient(135deg, #21262d 0%, #161b22 100%)",
        color: "#f8f9fa",
        cardBg: "#343a40",
      };
    }
    return {
      backgroundColor: "linear-gradient(135deg, #f8f9ff 0%, #e6f3ff 100%)",
      color: "#212529",
      cardBg: "#ffffff",
    };
  }, [theme]);

  // Handle Resize Logic
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Toast notification logic (Restored exactly from your first code)
  const showToast = (message, type = "info") => {
    const toastDiv = document.createElement("div");
    toastDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            background: ${
              type === "success"
                ? "#28a745"
                : type === "error"
                ? "#dc3545"
                : "#17a2b8"
            };
            color: white;
            border-radius: 5px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.2);
            z-index: 9999;
            font-family: Arial, sans-serif;
            animation: slideIn 0.3s ease-out;
        `;
    toastDiv.textContent = message;
    document.body.appendChild(toastDiv);
    setTimeout(() => {
      toastDiv.style.animation = "slideOut 0.3s ease-out";
      setTimeout(() => document.body.removeChild(toastDiv), 300);
    }, 3000);
  };

  // 3️⃣ Logic: API call on load (Restored)
  useEffect(() => {
    fetchPODetails(supplier_id, po_number);
  }, []);

  // 4️⃣ Logic: API function (Restored exactly)
  const fetchPODetails = async (supplier_id, po_number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/approval_po_details_susham_api.php?supplier_id=${supplier_id}&po_number=${po_number}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data.status === "success" && data.data) {
        setPoData(data.data);
        showToast(`Loaded records`, "success");
      } else if (data) {
        setPoData(data);
        showToast(`Loaded records`, "success");
      }
    } catch (error) {
      showToast(`Error: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  //  Approve handler
  const handleApprove = () => {
    const payload = {
      po_number: poData?.po_details?.po_number || poData?.poNo,
      supplierId: supplier_id,
      action: "APPROVE",
      ...formData,
    };

    console.log("Approve Payload:", payload);
    setModalConfig({
      title: "Success",
      message: "Purchase Order approved successfully.",
      variant: "success",
    });
    setShowModal(true);
  };

  // Reject handler
  const handleReject = () => {
    const payload = {
      po_number: poData?.po_details?.po_number || poData?.poNo,
      supplierId: supplier_id,
      action: "REJECT",
      ...formData,
    };
    console.log("Reject Payload:", payload);
    setModalConfig({
      title: "Rejected",
      message: "Purchase Order rejected successfully.",
      variant: "danger",
    });
    setShowModal(true);
  };

  //print handler
  const handlePrint = () => {
    window.print();
  };

  if (!poData) {
    return (
      <div className="p-5 text-center" style={{ color: themeStyles.color }}>
        Loading PO details...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: themeStyles.backgroundColor,
        color: themeStyles.color,
      }}
    >
      <style>
        {`
@media print {
  div[style*="overflow-x"] {
    overflow: visible !important;
  }
  body * {
    visibility: hidden;
  }

  #print-area,
  #print-area * {
    visibility: visible;
  }

  #print-area {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }

  button {
    display: none !important;
  }

  .card {
    box-shadow: none !important;
    border: none !important;
  }

  table {
    font-size: 11px;
  }

  th, td {
    padding: 4px !important;
  }

  tr {
    page-break-inside: avoid;
  }

  /* FORCE DESKTOP LAYOUT */
  .row {
    display: flex !important;
    flex-wrap: nowrap !important;
  }

  [class*="col-"] {
    flex: 0 0 auto !important;
    width: auto !important;
  }

  .small,
  .h6 {
    font-size: 12px !important;
  }

  .h5 {
    font-size: 14px !important;
  }

  body {
    min-width: 1024px;
  }

  @page {
    size: A4;
    margin: 10mm;
  }
     table {
    width: 100% !important;
    table-layout: fixed !important;
    font-size: 10px !important;
  }

  th, td {
    white-space: normal !important;
    word-break: break-word !important;
    padding: 4px !important;
  }

  .text-nowrap {
    white-space: normal !important;
  }
}
`}
      </style>

      <Container fluid className="py-4" style={{ maxWidth: "1500px" }}>
        {/* Responsive Theme/Action Toggle */}
        <div className="d-flex justify-content-end mb-3">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
          </Button>
        </div>

        <Card
          className="p-2 p-md-4 shadow-sm"
          id="print-area"
          style={{
            backgroundColor: themeStyles.cardBg,
            color: themeStyles.color,
            border: theme === "dark" ? "1px solid #444" : "",
          }}
        >
          {/* HEADER (Responsive Text Sizes) */}
          <div className="text-center mb-3">
            <h3 className={`fw-bold mb-1 ${isMobile ? "h5" : ""}`}>
              PURCHASE ORDER
            </h3>
            <h4 className={`mb-0 ${isMobile ? "h6" : ""}`}>
              Surya Equipments Pvt. Ltd.
            </h4>
            <p className="mb-0 x-small">
              B-39, M.I.D.C. Gokul Shirgaon Kolhapur, 416234.
            </p>
            <p className="mb-0 x-small">Phone No. (0231) 2672414</p>
            <p className="mb-2 x-small">GSTIN NO:27AAECS4252M1Z1</p>
            <div
              className={`d-flex justify-content-center gap-5 flex-wrap ${
                isMobile ? "small" : ""
              }`}
            >
              <div>WebSite: www.suryaequipments.com </div>
              <div> E-mail: purchase@suryaequipments.co.in</div>
            </div>
          </div>

          <hr className="mt-0" />

          {/* SUPPLIER + PO INFO (Responsive Stacked Grid) */}
          <Row className="mb-3 g-3">
            <Col xs={12} lg={4}>
              {/* Supplier Info */}
              {[
                { label: "Name", val: poData?.customer?.name },
                { label: "Address", val: poData?.address?.detail_address },
                { label: "Phone No.", val: poData?.address?.contact_number },
                { label: "State Name", val: poData?.address?.state },
                { label: "State Code", val: poData?.address?.state_code },
                { label: "GST No", val: poData?.address?.gstn },
              ].map((item, i) => (
                <Row key={i} className="mb-1 small">
                  <Col xs={5} sm={3} lg={4} className="fw-bold">
                    {item.label}:
                  </Col>
                  <Col xs={7} sm={9} lg={8}>
                    {item.val}
                  </Col>
                </Row>
              ))}
            </Col>

            <Col xs={12} lg={4}>
              {/* PO Info */}
              <Row className="mb-1 small">
                <Col xs={5} sm={3} lg={4} className="fw-bold">
                  P.O. No.:
                </Col>
                <Col xs={7} sm={9} lg={8}>
                  {poData?.po_details?.po_number}
                </Col>
              </Row>
              <Row className="mb-1 small">
                <Col xs={5} sm={3} lg={4} className="fw-bold">
                  P.O. Type:
                </Col>
                <Col xs={7} sm={9} lg={8}>
                  {poData?.po_details?.po_type}
                </Col>
              </Row>
              <Row className="mb-0 small">
                <Col xs={5} sm={3} lg={4} className="fw-bold">
                  Credit Days:
                </Col>
                <Col xs={7} sm={9} lg={8}>
                  {poData?.po_details?.credit_days}
                </Col>
              </Row>

              <Form.Group as={Row} className="mt-0 align-items-center">
                <Form.Label
                  column
                  xs={5}
                  sm={3}
                  lg={4}
                  className="fw-bold small"
                >
                  Your Ref.No.
                </Form.Label>
                <Col xs={7} sm={9} lg={8}>
                  <Form.Control
                    type="number"
                    size="sm"
                    className="border-0 border-bottom rounded-0 shadow-none bg-transparent"
                    style={{ color: themeStyles.color }}
                    name="yourRefNo"
                    placeholder={poData?.po_details?.your_ref_no}
                    value={formData.yourRefNo}
                    onChange={handleChange}
                  />
                </Col>
              </Form.Group>
            </Col>

            <Col xs={12} lg={4}>
              {/* Dates */}
              {dateFields.map(({ label, name }) => (
                <Form.Group
                  as={Row}
                  key={name}
                  className="mb-2 align-items-center"
                >
                  <Form.Label
                    column
                    xs={5}
                    sm={3}
                    lg={4}
                    className="fw-bold small"
                  >
                    {label}:
                  </Form.Label>
                  <Col xs={7} sm={9} lg={8}>
                    <Form.Control
                      type="date"
                      size="sm"
                      name={name}
                      value={formData[name]}
                      onChange={handleChange}
                      className="border-0 border-bottom rounded-0 shadow-none bg-transparent text-muted"
                    />
                  </Col>
                </Form.Group>
              ))}
            </Col>
          </Row>

          <Row className="mb-3 small">
            <h6 className="fw-bold">Kind Attention:</h6>
            <p className="mb-0">
              We are pleased to place an order with you for the following
              material or other services subject to the terms and conditions
              printed overleaf &/or annexed.
            </p>
          </Row>

          {/* ITEM TABLE (Responsive Wrapper: Restored all Columns) */}
          <div style={{ overflowX: "auto", border: "1px solid #dee2e6" }}>
            <Table
              bordered
              size="sm"
              className={`mb-0 ${theme === "dark" ? "table-dark" : ""}`}
            >
              <thead className="table-light">
                <tr className="small text-nowrap">
                  <th>Sr.No</th>
                  <th>Description</th>
                  <th>HSN/SAC</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Rate</th>
                  <th>Prch Unit</th>
                  <th>Rate/Unit</th>
                  <th>Total Weight</th>
                  <th>Delivery Date</th>
                  <th>Dics %</th>
                  <th>GST %</th>
                  <th>GST Amt</th>
                  <th>Basic Amt</th>
                  <th>Total Amount</th>
                </tr>
              </thead>
             <tbody className="small">
  {poData?.items?.map((item, idx) => (
    <tr key={idx} className="text-nowrap">
      <td className="text-center">{idx + 1}</td>
      <td>{item.material_description}</td>
      <td className="text-end">{item.hsn}</td>
      <td className="text-end">{item.quantity}</td>
      <td className="text-end">{item.unit}</td>
      <td className="text-end">{item.rate}</td>
      <td className="text-end">{item.purchase_unit}</td>
      <td className="text-end">{item.rate_per_unit}</td>
      <td className="text-end">{item.total_weight}</td>
      <td className="text-end">{item.delivery_date_formatted}</td>
      <td className="text-end">{item.discount}</td>
      <td className="text-end">{item.gst_rate}</td>
      <td className="text-end">{item.gst_amount}</td>
      <td className="text-end">{item.basic_amount}</td>
      <td className="text-end">{item.total_amount}</td>
    </tr>
  ))}
</tbody>
            </Table>
          </div>

          <Row className="justify-content-between mt-3">
            <Col xs={12} lg={6}>
              {/* PO Info */}
              <Row className="mb-1 small">
                <Col xs={5} sm={3} lg={4} className="fw-bold">
                  Transport Arrangement:
                </Col>
                <Col xs={7} sm={9} lg={8}>
                  {poData?.po_details?.transport}
                </Col>
              </Row>
              <Row className="mb-1 small">
                <Col xs={5} sm={3} lg={4} className="fw-bold">
                  freight:
                </Col>
                <Col xs={7} sm={9} lg={8}>
                  {poData?.po_details?.freight}
                </Col>
              </Row>
              <Row className="mb-0 small">
                <Col xs={5} sm={3} lg={4} className="fw-bold">
                  Insurance:
                </Col>
                <Col xs={7} sm={9} lg={8}>
                  {poData?.po_details?.insurance}
                </Col>
              </Row>

              <Form.Group as={Row} className="mt-0 align-items-center">
                <Form.Label
                  column
                  xs={5}
                  sm={3}
                  lg={4}
                  className="fw-bold small"
                >
                  Enter Note:
                </Form.Label>
                <Col xs={7} sm={9} lg={8}>
                  <Form.Control
                    type="text"
                    size="sm"
                    className="border-0 border-bottom rounded-0 shadow-none bg-transparent"
                    style={{ color: themeStyles.color }}
                    name="note"
                    placeholder={poData?.po_details?.note}
                    value={formData.note}
                    onChange={handleChange}
                  />
                </Col>
              </Form.Group>
            </Col>
            <Col xs={12} lg={4}>
              <Row className="mb-1 small">
                <Col xs={5} sm={3} lg={4} className="fw-bold">
                  Basic Amount:
                </Col>
                <Col xs={7} sm={9} lg={8}>
                  {poData?.totals?.basic_amount}
                </Col>
              </Row>
              <Row className="mb-1 small">
                <Col xs={5} sm={3} lg={4} className="fw-bold">
                  CGST & SGST Amount:
                </Col>
                <Col xs={7} sm={9} lg={8}>
                  {poData?.totals?.gst_amount}
                </Col>
              </Row>
            </Col>
          </Row>
          {/* TOTAL */}

          <Row className="justify-content-between mt-4">
            <Col xs={12} lg={6}>
              <Row className="mb-1 small">
                <Col xs={5} sm={3} lg={4} className="fw-bold">
                  In Words:
                </Col>
                <Col xs={5} sm={3} lg={8}>
                  {poData?.totals?.amount_in_words}
                </Col>
              </Row>
            </Col>
            <Col xs={12} lg={4}>
              <Row className="mb-1 small">
                <div className="d-flex justify-content-between p-2 border">
                  <strong>Grand Total</strong>
                  <strong>₹ {poData?.totals?.grand_total}</strong>
                </div>
              </Row>
            </Col>
          </Row>

          {/* REMARKS */}
          <Row className="mb-3 g-3">
            <Col xs={12}>
              {poData?.important_notes.map((item, index) => {
                const parts = item.split(/(\s+)/);

                return (
                  <Row key={index} className="mb-1 small text-muted">
                    <Col xs={12}>
                      <strong>{index + 1}.</strong>{" "}
                      {parts.map((part, i) =>
                        part.trim() &&
                        part === part.toUpperCase() &&
                        /[A-Z]/.test(part) ? (
                          <strong key={i}>{part}</strong>
                        ) : (
                          <span key={i}>{part}</span>
                        )
                      )}
                    </Col>
                  </Row>
                );
              })}
            </Col>
          </Row>
          <Row className=" mt-3 mb-3">
            <Col xs={4} className="ms-auto text-center">
              <h5 className={`mb-0 ${isMobile ? "h6" : ""}`}>
                For Surya Equipments Pvt. Ltd
              </h5>
            </Col>
          </Row>
          <Row className="justify-content-between mt-5">
            <Col xs={12} lg={4}>
              <h5 className={`mb-0 ${isMobile ? "h6" : ""} text-center`}>
                BTP
              </h5>
              <h5 className={`mb-0 ${isMobile ? "h6" : ""} text-center`}>
                PREPARED BY
              </h5>
            </Col>
            <Col xs={12} lg={4}>
              <h5 className={`mb-0 ${isMobile ? "h6" : ""} text-center`}>
                MUM
              </h5>
              <h5 className={`mb-0 ${isMobile ? "h6" : ""} text-center`}>
                CHECKED BY
              </h5>
              <p className="text-center mt-3 small text-muted">
                Subject to Kolhapur Jurisdiction
              </p>
            </Col>
            <Col xs={12} lg={4}>
              <h5 className={`mt-3 ${isMobile ? "h6" : ""} text-center`}>
                AUTHORISED SIGNATORY
              </h5>
            </Col>
          </Row>

          <hr />

          {/* FOOTER BUTTONS (Responsive gap and size) */}
          <div className="d-flex justify-content-center gap-2 flex-wrap mt-2">
            <Button variant="success" className="px-4" onClick={handleApprove}>
              Approve
            </Button>
            <Button variant="danger" className="px-4" onClick={handleReject}>
              Reject
            </Button>
            <Button variant="secondary" className="px-4" onClick={handlePrint}>
              Print
            </Button>
          </div>
        </Card>
      </Container>
      <CommonAlertModal
        show={showModal}
        onClose={() => setShowModal(false)}
        title={modalConfig.title}
        message={modalConfig.message}
        variant={modalConfig.variant}
      />
    </div>
  );
}
