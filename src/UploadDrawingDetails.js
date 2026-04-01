import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
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
  Modal,
} from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const UploadDrawingDetails = () => {
  const { fileId: paramFileId } = useParams();
  const location = useLocation();
  
  // Extract fileId from hash-based routing or regular routing
  const getFileIdFromUrl = () => {
    // Check URL hash first (for hash routing like /#/upload-drawing-details/5772)
    const hash = window.location.hash;
    const hashMatch = hash.match(/\/upload-drawing-details\/(\d+)/);
    if (hashMatch && hashMatch[1]) {
      return hashMatch[1];
    }
    
    // Fall back to React Router params
    return paramFileId;
  };
  
  const [fileId, setFileId] = useState(getFileIdFromUrl());
  const [theme, setTheme] = useState("light");
  const [activeTab, setActiveTab] = useState("project");
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Project Details State
  const [fileDetails, setFileDetails] = useState(null);
  const [quotationDetails, setQuotationDetails] = useState(null);

  // PO Details State
  const [poDetails, setPoDetails] = useState([]);

  // Upload Drawings State
  const [drawingCategories, setDrawingCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [designComments, setDesignComments] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    docName: "",
    comment: "",
    file: null,
  });

  const fileInputRef = useRef(null);

  // Toast notification function
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

  // Add animation styles
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .fade-in {
        animation: fadeIn 0.5s ease-out;
      }
      .info-row {
        padding: 12px 15px;
        border-bottom: 1px solid #e0e0e0;
        transition: background-color 0.2s;
      }
      .info-row:hover {
        background-color: rgba(0, 123, 255, 0.05);
      }
      .info-label {
        font-weight: 600;
        color: #495057;
        font-size: 0.9rem;
      }
      .info-value {
        color: #212529;
        font-size: 0.95rem;
      }
      .dark-theme .info-row {
        border-bottom: 1px solid #495057;
      }
      .dark-theme .info-row:hover {
        background-color: rgba(255, 255, 255, 0.05);
      }
      .dark-theme .info-label {
        color: #adb5bd;
      }
      .dark-theme .info-value {
        color: #f8f9fa;
      }
      .po-card {
        border-left: 4px solid #007bff;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .po-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }
      .comment-card {
        border-left: 4px solid #28a745;
        margin-bottom: 20px;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .comment-card:hover {
        transform: translateX(5px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }
      .document-row {
        padding: 10px;
        border-radius: 5px;
        transition: background-color 0.2s;
      }
      .document-row:hover {
        background-color: rgba(0, 123, 255, 0.05);
      }
      .avatar-circle {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 1.2rem;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Add this function before the return statement (after getThemeStyles)
const handleViewDataSheet = () => {
    const projectId = fileDetails?.PROJECT_ID;
    const productName = fileDetails?.PRODUCT_NAME?.toUpperCase();
  
    if (!projectId || !fileId) {
      showToast("Project ID or File ID not available", "error");
      return;
    }
  
    let dataSheetUrl;
  
    if (productName === "MMSS") {
      // MMSS Data Sheet Route
      dataSheetUrl = `#/mmss-datasheet/${projectId}/${fileId}`;
    } else if (productName === "MSS") {
      // MSS Data Sheet Route
      dataSheetUrl = `#/mss-datasheet/${projectId}/${fileId}`;
    } else {
      // Default Product Data Sheet Route
      dataSheetUrl = `#/product-datasheet/${projectId}/${fileId}`;
    }
  
    console.log(`Navigating to: ${dataSheetUrl} for product: ${productName}`);
    window.open(dataSheetUrl, "_blank");
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update fileId when URL changes
  useEffect(() => {
    const handleHashChange = () => {
      const newFileId = getFileIdFromUrl();
      if (newFileId && newFileId !== fileId) {
        console.log('File ID updated from URL:', newFileId);
        setFileId(newFileId);
      }
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [fileId]);

  // Debug: Log fileId whenever it changes
  useEffect(() => {
    console.log('Current File ID:', fileId);
    if (!fileId) {
      console.warn('No File ID found in URL!');
      showToast('No File ID found in URL', 'error');
    }
  }, [fileId]);

  // Fetch File Details (Project Details Tab)
  const fetchFileDetails = async () => {
    if (!fileId) {
      console.error('Cannot fetch file details: No fileId');
      return;
    }

    setLoading(true);
    const apiUrl = `http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/getUploadDrawingFileDetailsApi.php?FILE_ID=${fileId}`;
    console.log('Fetching file details from:', apiUrl);
    
    try {
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('File details response:', data);

      if (data.status === "success" && data.data) {
        setFileDetails(data.data.file_details);
        setQuotationDetails(data.data.quotation_details);
        showToast('File details loaded successfully', 'success');
      } else {
        showToast("Failed to load file details", "error");
        console.error('Invalid response format:', data);
      }
    } catch (error) {
      console.error("Error fetching file details:", error);
      showToast(`Error: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch PO Details
  const fetchPoDetails = async () => {
    if (!fileId) {
      console.error('Cannot fetch PO details: No fileId');
      return;
    }

    setLoading(true);
    const apiUrl = `http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/uploadDrawingPoDetailsApi.php?FILE_ID=${fileId}`;
    console.log('Fetching PO details from:', apiUrl);
    
    try {
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('PO details response:', data);

      if (data.status === "success" && Array.isArray(data.data)) {
        setPoDetails(data.data);
        showToast(`Loaded ${data.count} PO record(s)`, 'success');
      } else {
        setPoDetails([]);
        console.warn('No PO details found');
      }
    } catch (error) {
      console.error("Error fetching PO details:", error);
      showToast(`Error: ${error.message}`, "error");
      setPoDetails([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Drawing Categories
  const fetchDrawingCategories = async () => {
    const apiUrl = 'http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/getDrawingCategoriesApi.php';
    console.log('Fetching drawing categories from:', apiUrl);
    
    try {
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Drawing categories response:', data);

      if (data.status === "success" && Array.isArray(data.data)) {
        setDrawingCategories(data.data);
        console.log(`Loaded ${data.count} drawing categories`);
      } else {
        setDrawingCategories([]);
        console.warn('No drawing categories found');
      }
    } catch (error) {
      console.error("Error fetching drawing categories:", error);
      showToast(`Error: ${error.message}`, "error");
    }
  };

  // Fetch Design Comments
  const fetchDesignComments = async () => {
    if (!fileId) {
      console.error('Cannot fetch design comments: No fileId');
      return;
    }

    setLoading(true);
    const apiUrl = `http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/getDesignCommentsApi.php?file_id=${fileId}`;
    console.log('Fetching design comments from:', apiUrl);
    
    try {
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Design comments response:', data);

      if (data.status === "success" && Array.isArray(data.data)) {
        setDesignComments(data.data);
        showToast(`Loaded ${data.count} drawing comment(s)`, 'success');
      } else {
        setDesignComments([]);
        console.warn('No design comments found');
      }
    } catch (error) {
      console.error("Error fetching design comments:", error);
      showToast(`Error: ${error.message}`, "error");
      setDesignComments([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchFileDetails();
    fetchPoDetails();
    fetchDrawingCategories();
    fetchDesignComments();
  }, [fileId]);

  // Handle tab change
  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  // Toggle theme
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setUploadForm({ ...uploadForm, file });
  };

  // Handle upload submit
  const handleUploadSubmit = async () => {
    if (!selectedCategory) {
      showToast("Please select a drawing category", "error");
      return;
    }

    if (!uploadForm.docName) {
      showToast("Please enter document name", "error");
      return;
    }

    if (!uploadForm.file) {
      showToast("Please select a file to upload", "error");
      return;
    }

    // Here you would implement the actual upload logic
    // For now, we'll just show a success message
    showToast("Upload functionality will be implemented", "info");
    setShowUploadModal(false);
  };

  // Open upload modal
  const openUploadModal = () => {
    setShowUploadModal(true);
    setUploadForm({ docName: "", comment: "", file: null });
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return "??";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Theme styles
  const getThemeStyles = () => {
    if (theme === "dark") {
      return {
        backgroundColor: "#1a1d23",
        color: "#f8f9fa",
        cardBg: "#2d3238",
        cardHeader: "#3a3f47",
        borderColor: "#495057",
      };
    }
    return {
      backgroundColor: "#f5f7fa",
      color: "#212529",
      cardBg: "#ffffff",
      cardHeader: "#f8f9fa",
      borderColor: "#dee2e6",
    };
  };

  const themeStyles = getThemeStyles();

  // Apply theme to document body
  useEffect(() => {
    document.body.style.background = themeStyles.backgroundColor;
    document.body.style.color = themeStyles.color;
    document.body.style.minHeight = "100vh";

    if (theme === "dark") {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }

    return () => {
      document.body.style.background = "";
      document.body.style.color = "";
      document.body.style.minHeight = "";
      document.body.classList.remove("dark-theme");
    };
  }, [theme]);

  if (loading && !fileDetails) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: themeStyles.backgroundColor,
        }}
      >
        <div style={{ textAlign: "center", color: themeStyles.color }}>
          <Spinner animation="border" style={{ width: "3rem", height: "3rem" }} />
          <p className="mt-3">Loading details...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: themeStyles.backgroundColor,
        color: themeStyles.color,
        padding: "20px 0",
      }}
    >
      <Container fluid>
        <Card
          style={{
            backgroundColor: themeStyles.cardBg,
            border: `1px solid ${themeStyles.borderColor}`,
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          {/* Header */}
          <Card.Header
            style={{
              background: theme === "dark" 
                ? "linear-gradient(135deg, #3a3f47 0%, #2d3238 100%)"
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "#ffffff",
              padding: "1.5rem 2rem",
              borderRadius: "12px 12px 0 0",
            }}
          >
            <Row className="align-items-center">
              <Col xs={12} lg={8}>
                <h4 className="mb-1" style={{ fontWeight: "700" }}>
                  {fileDetails?.FILE_NAME || "Upload Drawing Details"}
                </h4>
                <small style={{ opacity: 0.9 }}>
                  File ID: {fileId} | Customer: {fileDetails?.CUSTOMER_NAME || "N/A"}
                </small>
              </Col>
              <Col xs={12} lg={4} className="text-end mt-3 mt-lg-0">
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={toggleTheme}
                  className="me-2"
                >
                  {theme === "light" ? "🌙 Dark" : "☀️ Light"}
                </Button>
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={() => window.history.back()}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Back
                </Button>
              </Col>
            </Row>
          </Card.Header>

          {/* Tabs */}
          <Card.Body style={{ padding: 0 }}>
            <Tabs
              activeKey={activeTab}
              onSelect={handleTabChange}
              className="mb-0"
              style={{
                borderBottom: `2px solid ${themeStyles.borderColor}`,
                backgroundColor: themeStyles.cardHeader,
                padding: "0 1.5rem",
              }}
            >
              {/* Project Details Tab */}
              <Tab
                eventKey="project"
                title={
                  <span>
                    <i className="bi bi-file-text me-2"></i>
                    Project Details
                  </span>
                }
              >
                <div style={{ padding: "2rem" }} className="fade-in">
                  <Row>
                    <Col lg={6} className="mb-4">
                      <h5
                        style={{
                          borderBottom: `2px solid ${
                            theme === "dark" ? "#667eea" : "#764ba2"
                          }`,
                          paddingBottom: "10px",
                          marginBottom: "20px",
                          fontWeight: "600",
                        }}
                      >
                        File Information
                      </h5>
                      <div>
                        <div className="info-row">
                          <div className="info-label">File No.</div>
                          <div className="info-value">
                            {fileDetails?.FILE_NAME || "N/A"}
                          </div>
                        </div>
                        <div className="info-row">
                          <div className="info-label">Customer Name</div>
                          <div className="info-value">
                            {fileDetails?.CUSTOMER_NAME || "N/A"}
                          </div>
                        </div>
                        <div className="info-row">
                          <div className="info-label">Product Type</div>
                          <div className="info-value">
                            {fileDetails?.PRODUCT_NAME || "N/A"}
                          </div>
                        </div>
                      </div>
                    </Col>

                    <Col lg={6} className="mb-4">
                      <h5
                        style={{
                          borderBottom: `2px solid ${
                            theme === "dark" ? "#667eea" : "#764ba2"
                          }`,
                          paddingBottom: "10px",
                          marginBottom: "20px",
                          fontWeight: "600",
                        }}
                      >
                        Shipping Information
                      </h5>
                      <div>
                        <div className="info-row">
                          <div className="info-label">Shipping Address</div>
                          <div className="info-value">
                            {fileDetails?.SHIPPING_ADDRESS || "N/A"}
                          </div>
                        </div>
                        <div className="info-row">
                          <div className="info-label">Shipping Contact Person</div>
                          <div className="info-value">
                            {fileDetails?.SHIPPING_PERSON || "N/A"}
                          </div>
                        </div>
                        <div className="info-row">
                          <div className="info-label">Shipping Contact Number</div>
                          <div className="info-value">
                            {fileDetails?.SHIPPING_CONTACT || "N/A"}
                          </div>
                        </div>
                      </div>
                    </Col>

                    <Col lg={6} className="mb-4">
                      <h5
                        style={{
                          borderBottom: `2px solid ${
                            theme === "dark" ? "#667eea" : "#764ba2"
                          }`,
                          paddingBottom: "10px",
                          marginBottom: "20px",
                          fontWeight: "600",
                        }}
                      >
                        Billing Information
                      </h5>
                      <div>
                        <div className="info-row">
                          <div className="info-label">Billing Address</div>
                          <div className="info-value">
                            {fileDetails?.BILLING_ADDRESS || "N/A"}
                          </div>
                        </div>
                        <div className="info-row">
                          <div className="info-label">Billing Contact Person</div>
                          <div className="info-value">
                            {fileDetails?.BILLING_PERSON || "N/A"}
                          </div>
                        </div>
                        <div className="info-row">
                          <div className="info-label">Billing Contact Number</div>
                          <div className="info-value">
                            {fileDetails?.BILLING_CONTACT || "N/A"}
                          </div>
                        </div>
                      </div>
                    </Col>

                    <Col lg={6} className="mb-4">
                      <h5
                        style={{
                          borderBottom: `2px solid ${
                            theme === "dark" ? "#667eea" : "#764ba2"
                          }`,
                          paddingBottom: "10px",
                          marginBottom: "20px",
                          fontWeight: "600",
                        }}
                      >
                        Additional Information
                      </h5>
                      <div>
                        <div className="info-row">
                          <div className="info-label">Quotation Number</div>
                          <div className="info-value">
                            {quotationDetails?.QUOT_NUMBER || "N/A"}
                          </div>
                        </div>
                        <div className="info-row">
                          <div className="info-label">Quotation Date</div>
                          <div className="info-value">
                            {quotationDetails?.QUOT_DATE || "N/A"}
                          </div>
                        </div>
                        <div className="info-row">
                          <div className="info-label">Financial Year</div>
                          <div className="info-value">
                            {fileDetails?.FINANCIAL_YEAR || "N/A"}
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>

                  <div className="text-center mt-4">
                            <Button
                variant="primary"
                size="lg"
                onClick={handleViewDataSheet}
                disabled={!fileDetails}
                style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
                padding: "12px 40px",
                fontWeight: "600",
                }}
                >
                <i className="bi bi-file-earmark-text me-2"></i>
                View Project Data Sheet
                </Button>
                  </div>
                </div>
              </Tab>

              {/* PO Details Tab */}
              <Tab
                eventKey="po"
                title={
                  <span>
                    <i className="bi bi-receipt me-2"></i>
                    PO Details
                  </span>
                }
              >
                <div style={{ padding: "2rem" }} className="fade-in">
                  {poDetails.length === 0 ? (
                    <Alert variant="info" className="text-center">
                      <i className="bi bi-info-circle me-2"></i>
                      No PO details available
                    </Alert>
                  ) : (
                    <Row>
                      {poDetails.map((po, index) => (
                        <Col lg={6} key={index} className="mb-4">
                          <Card
                            className="po-card"
                            style={{
                              backgroundColor: themeStyles.cardBg,
                              border: `1px solid ${themeStyles.borderColor}`,
                            }}
                          >
                            <Card.Body>
                              <div className="d-flex justify-content-between align-items-start mb-3">
                                <h5 style={{ fontWeight: "700", color: "#667eea" }}>
                                  {po.po_type} - V{po.po_version_no}
                                </h5>
                                <span
                                  style={{
                                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                    color: "white",
                                    padding: "5px 15px",
                                    borderRadius: "20px",
                                    fontSize: "0.85rem",
                                    fontWeight: "600",
                                  }}
                                >
                                  Active
                                </span>
                              </div>

                              <div className="mb-2">
                                <strong>PO Number:</strong>{" "}
                                <span style={{ color: "#495057" }}>{po.po_number}</span>
                              </div>
                              <div className="mb-2">
                                <strong>PO Date:</strong>{" "}
                                <span style={{ color: "#495057" }}>{po.po_date}</span>
                              </div>
                              <div className="mb-2">
                                <strong>PO Basic Amount:</strong>{" "}
                                <span style={{ color: "#495057" }}>
                                  ₹{parseFloat(po.po_basic_amount).toLocaleString("en-IN")}
                                </span>
                              </div>
                              <div className="mb-3">
                                <strong>PO Type:</strong>{" "}
                                <span style={{ color: "#495057" }}>{po.po_type}</span>
                              </div>

                              <div
                                style={{
                                  background: theme === "dark" ? "#3a3f47" : "#f8f9fa",
                                  padding: "12px",
                                  borderRadius: "8px",
                                  marginBottom: "15px",
                                }}
                              >
                                <div className="d-flex align-items-center">
                                  <i
                                    className="bi bi-clock-history me-2"
                                    style={{ color: "#667eea" }}
                                  ></i>
                                  <small>
                                    Last Uploaded:{" "}
                                    <strong>{po.last_uploaded}</strong>
                                  </small>
                                </div>
                              </div>

                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="w-100"
                              >
                                <i className="bi bi-eye me-2"></i>
                                View PO Document
                              </Button>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  )}
                </div>
              </Tab>

              {/* Upload Drawings Tab */}
              <Tab
                eventKey="upload"
                title={
                  <span>
                    <i className="bi bi-cloud-upload me-2"></i>
                    Upload Drawings
                  </span>
                }
              >
                <div style={{ padding: "2rem" }} className="fade-in">
                  {/* Upload Form */}
                  <Card
                    style={{
                      backgroundColor: theme === "dark" ? "#3a3f47" : "#f8f9fa",
                      border: `2px dashed ${themeStyles.borderColor}`,
                      marginBottom: "30px",
                    }}
                  >
                    <Card.Body>
                      <Row className="align-items-end">
                        <Col md={3} className="mb-3 mb-md-0">
                          <Form.Label style={{ fontWeight: "600" }}>
                            Select Drawing List
                          </Form.Label>
                          <Form.Select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            style={{
                              backgroundColor: themeStyles.cardBg,
                              color: themeStyles.color,
                              borderColor: themeStyles.borderColor,
                            }}
                          >
                            <option value="">Choose...</option>
                            {drawingCategories.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.drawing_name}
                              </option>
                            ))}
                          </Form.Select>
                        </Col>
                        <Col md={3} className="mb-3 mb-md-0">
                          <Form.Label style={{ fontWeight: "600" }}>
                            Enter Doc Name
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Document name"
                            value={uploadForm.docName}
                            onChange={(e) =>
                              setUploadForm({ ...uploadForm, docName: e.target.value })
                            }
                            style={{
                              backgroundColor: themeStyles.cardBg,
                              color: themeStyles.color,
                              borderColor: themeStyles.borderColor,
                            }}
                          />
                        </Col>
                        <Col md={3} className="mb-3 mb-md-0">
                          <Form.Label style={{ fontWeight: "600" }}>Comment</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Add comment"
                            value={uploadForm.comment}
                            onChange={(e) =>
                              setUploadForm({ ...uploadForm, comment: e.target.value })
                            }
                            style={{
                              backgroundColor: themeStyles.cardBg,
                              color: themeStyles.color,
                              borderColor: themeStyles.borderColor,
                            }}
                          />
                        </Col>
                        <Col md={2} className="mb-3 mb-md-0">
                          <Button
                            variant="outline-secondary"
                            className="w-100"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <i className="bi bi-paperclip me-2"></i>
                            Choose Files
                          </Button>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            style={{ display: "none" }}
                            accept=".pdf,.doc,.docx,.dwg"
                          />
                        </Col>
                        <Col md={1} className="mb-3 mb-md-0">
                          <Button
                            variant="primary"
                            className="w-100"
                            onClick={handleUploadSubmit}
                            style={{
                              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                              border: "none",
                            }}
                          >
                            <i className="bi bi-send"></i>
                          </Button>
                        </Col>
                      </Row>
                      {uploadForm.file && (
                        <div className="mt-3">
                          <small>
                            <i className="bi bi-file-earmark me-2"></i>
                            Selected: {uploadForm.file.name}
                          </small>
                        </div>
                      )}
                    </Card.Body>
                  </Card>

                  {/* Drawings List */}
                  <h5
                    style={{
                      borderBottom: `2px solid ${
                        theme === "dark" ? "#667eea" : "#764ba2"
                      }`,
                      paddingBottom: "10px",
                      marginBottom: "25px",
                      fontWeight: "600",
                    }}
                  >
                    Drawings
                  </h5>

                  {designComments.length === 0 ? (
                    <Alert variant="info" className="text-center">
                      <i className="bi bi-inbox me-2"></i>
                      No drawings uploaded yet
                    </Alert>
                  ) : (
                    designComments.map((comment, index) => (
                      <Card
                        key={comment.comment_id}
                        className="comment-card mb-4"
                        style={{
                          backgroundColor: themeStyles.cardBg,
                          border: `1px solid ${themeStyles.borderColor}`,
                        }}
                      >
                        <Card.Body>
                          <div className="d-flex align-items-start mb-3">
                            <div className="avatar-circle me-3">
                              {getInitials(comment.employee_name)}
                            </div>
                            <div className="flex-grow-1">
                              <h6 style={{ fontWeight: "700", marginBottom: "5px" }}>
                                {comment.employee_name}
                              </h6>
                              <div style={{ fontSize: "0.85rem", opacity: 0.7 }}>
                                <i className="bi bi-calendar me-2"></i>
                                {comment.comment_date}
                                <i className="bi bi-clock ms-3 me-2"></i>
                                {comment.comment_time}
                              </div>
                            </div>
                          </div>

                          <p
                            style={{
                              padding: "15px",
                              background: theme === "dark" ? "#2d3238" : "#f8f9fa",
                              borderRadius: "8px",
                              marginBottom: "20px",
                            }}
                          >
                            {comment.comment_text}
                          </p>

                          {comment.has_documents && comment.documents && (
                            <div>
                              <h6 style={{ fontWeight: "600", marginBottom: "15px" }}>
                                <i className="bi bi-file-earmark-text me-2"></i>
                                Documents ({comment.documents.length})
                              </h6>
                              <Table
                                hover
                                size="sm"
                                style={{
                                  backgroundColor: themeStyles.cardBg,
                                  color: themeStyles.color,
                                }}
                              >
                                <thead
                                  style={{
                                    background: theme === "dark" ? "#3a3f47" : "#e9ecef",
                                  }}
                                >
                                  <tr>
                                    <th>Sr No</th>
                                    <th>Document Category</th>
                                    <th>Document Name</th>
                                    <th>Comment</th>
                                    <th>File Name</th>
                                    <th>Document</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {comment.documents.map((doc) => (
                                    <tr key={doc.sr_no} className="document-row">
                                      <td>{doc.sr_no}</td>
                                      <td>{doc.category_name}</td>
                                      <td>{doc.document_name}</td>
                                      <td>{comment.comment_text}</td>
                                      <td>
                                        <small style={{ fontSize: "0.85rem" }}>
                                          {doc.file_name}
                                        </small>
                                      </td>
                                      <td>
                                        <Button
                                          variant="link"
                                          size="sm"
                                          onClick={() => window.open(doc.file_path, "_blank")}
                                          style={{ padding: 0 }}
                                        >
                                          <i
                                            className="bi bi-file-pdf"
                                            style={{ fontSize: "1.5rem", color: "#dc3545" }}
                                          ></i>
                                        </Button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </Table>
                            </div>
                          )}
                        </Card.Body>
                      </Card>
                    ))
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