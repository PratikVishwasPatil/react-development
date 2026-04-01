import React, { useEffect, useMemo, useState, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-theme-alpine.css";
// add this import near the top with your other ag-grid imports
import { ColumnApiModule } from "ag-grid-community";
import { ModuleRegistry } from "ag-grid-community";
import {
  ClientSideRowModelModule,
  ValidationModule,
  DateFilterModule,
  NumberFilterModule,
  TextFilterModule,
  RowSelectionModule,
  PaginationModule,
  CsvExportModule,
} from "ag-grid-community";
import Select from "react-select";
import { useParams } from "react-router-dom";
import {
  Container,
  Button,
  Row,
  Col,
  Card,
  ButtonGroup,
  Form,
} from "react-bootstrap";

import "bootstrap-icons/font/bootstrap-icons.css";
ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  ValidationModule,
  DateFilterModule,
  NumberFilterModule,
  TextFilterModule,
  RowSelectionModule,
  PaginationModule,
  CsvExportModule,
  ColumnApiModule,
]);
// ===== Forwarded Drawing Card Component =====
const baseURL =
  "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/";

const ForwardedDrawingCard = ({ drawing }) => {
  console.log("item" + drawing);
  // FIX PATH
  const fileUrl = baseURL + drawing.DOCUMENT_PATH.replace("./", "");

  return (
    <div className="col-sm-8">
      <p>Uploaded Date: {drawing.UPLOADED_DATE}</p>
      <p>Document Name: {drawing.DOCUMENT_NAME}</p>

      {drawing.EXT === "pdf" ? (
        <a href={fileUrl} target="_blank" rel="noreferrer">
          <img
            src="https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/common/pdf.png"
            alt="PDF"
            style={{ width: 80, height: 90 }}
          />
        </a>
      ) : (
        <a href={fileUrl} target="_blank" rel="noreferrer">
          <img
            src={fileUrl}
            alt={drawing.DOCUMENT_NAME}
            style={{ width: 100, height: 100 }}
          />
        </a>
      )}
    </div>
  );
};

const PPCBasicEleWorkDetails = () => {
  const [theme, setTheme] = useState("light");
  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([]);
  const [isFullScreen, setIsFullScreen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  const gridRef = useRef();
  const { fileid } = useParams();
  const [fileName, setFileName] = useState("");
  const [drawings, setDrawings] = useState([]);

  const [pdfUrl, setPdfUrl] = useState("");
  const [fileUpload, setFileUpload] = useState(null);
  const [comment, setComment] = useState("");
  const [revisions, setRevisions] = useState([]);
  const [selectedRevision, setSelectedRevision] = useState(null);
  //Reviisom
  useEffect(() => {
    if (!fileid) return;

    const loadRevisions = async () => {
      try {
        const res = await fetch(
          "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/getElectricalRevisions.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileId: fileid }),
          }
        );
        const result = await res.json();
        if (result.status === "success") {
          setRevisions(result.data); // e.g., [{revision: 0}, {revision: 1}]
          setSelectedRevision(result.data[0]?.revision || null);
        }
      } catch (err) {
        console.error("Revision load error:", err);
      }
    };

    loadRevisions();
  }, [fileid]);

  useEffect(() => {
    if (!fileid) return;

    const loadDrawings = async () => {
      try {
        const res = await fetch(
          "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/electricalDrawings.php",
          {
            method: "POST",
            body: JSON.stringify({ fileId: fileid }),
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await res.json();
        console.log("result.data");
        console.log(result.data);
        setDrawings(result.data); // ← SAVE JSON TO STATE
      } catch (err) {
        console.error("Drawing load error:", err);
      }
    };

    loadDrawings();
  }, [fileid]);

  useEffect(() => {
    console.log("Effect running... fileid =", fileid);

    if (!fileid) {
      console.log("fileid missing — effect stopped");
      return;
    }

    const fetchFileName = async () => {
      try {
        console.log("Calling API...");

        const response = await fetch(
          "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/common/getfilenameByFileId.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileid: fileid }),
          }
        );

        const result = await response.json();
        console.log("API response:", result);

        if (result.status === "success" && result.data.length > 0) {
          setFileName(result.data[0].FILE_NAME);
        }
      } catch (error) {
        console.error("API ERROR:", error);
      }
    };

    fetchFileName();
  }, []);

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
        `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // Theme styles
  const getThemeStyles = () => {
    if (theme === "dark") {
      return {
        backgroundColor: "linear-gradient(135deg, #21262d 0%, #161b22 100%)",
        color: "#f8f9fa",
        cardBg: "#343a40",
        cardHeader: "linear-gradient(135deg, #495057 0%, #343a40 100%)",
      };
    }
    return {
      backgroundColor: "linear-gradient(135deg, #f8f9ff 0%, #e6f3ff 100%)",
      color: "#212529",
      cardBg: "#ffffff",
      cardHeader: "linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%)",
    };
  };

  const themeStyles = getThemeStyles();
  const gridHeight = isFullScreen
    ? "calc(100vh - 240px)"
    : isMobile
    ? "400px"
    : "600px";

  // Apply theme to document body
  useEffect(() => {
    document.body.style.background = themeStyles.backgroundColor;
    document.body.style.color = themeStyles.color;
    document.body.style.minHeight = "100vh";

    return () => {
      document.body.style.background = "";
      document.body.style.color = "";
      document.body.style.minHeight = "";
    };
  }, [theme]);

  if (loading && rowData.length === 0) {
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
          <div
            className="spinner-border"
            role="status"
            style={{ width: "3rem", height: "3rem" }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading project cost analysis...</p>
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
        padding: 0,
        margin: 0,
      }}
    >
      <Container fluid={isFullScreen}>
        <Card
          style={{
            backgroundColor: themeStyles.cardBg,
            color: themeStyles.color,
            border:
              theme === "dark" ? "1px solid #495057" : "1px solid #dee2e6",
            margin: isFullScreen ? 0 : 20,
            borderRadius: isFullScreen ? 0 : 8,
          }}
        >
          {/* Header */}
          <Card.Header
            style={{
              background: themeStyles.cardHeader,
              color: theme === "dark" ? "#ffffff" : "#000000",
              fontFamily: "'Maven Pro', sans-serif",
              padding: "1rem 2rem",
            }}
          >
            <Row className="align-items-center">
              <Col xs={12} lg={6} className="mb-2 mb-lg-0">
                <h4 className="mb-0">Electrical Basic Work</h4>
                <small style={{ opacity: 0.8 }}>
                  {`${rowData.length} records found`}
                  {selectedRows.length > 0 &&
                    ` | ${selectedRows.length} selected`}
                </small>
              </Col>

              <Col xs={12} lg={6}>
                <div className="d-flex justify-content-end gap-2 flex-wrap align-items-center">
                  <label style={{ fontSize: "0.875rem", whiteSpace: "nowrap" }}>
                    File Name:
                  </label>

                  <span
                    style={{
                      padding: "6px 12px",
                      background: "#e9ecef",
                      borderRadius: "6px",
                      fontWeight: "bold",
                    }}
                  >
                    {fileName || "Loading..."}
                  </span>

                  <ButtonGroup size="sm">
                    <Button variant="outline-light" onClick={toggleFullScreen}>
                      <i
                        className={`bi ${
                          isFullScreen ? "bi-fullscreen-exit" : "bi-fullscreen"
                        }`}
                      ></i>
                      {!isMobile && (isFullScreen ? " Exit" : " Full")}
                    </Button>
                    <Button variant="outline-light" onClick={toggleTheme}>
                      {theme === "light" ? "🌙" : "☀️"}
                      {!isMobile && (theme === "light" ? " Dark" : " Light")}
                    </Button>
                  </ButtonGroup>
                </div>
              </Col>
            </Row>
          </Card.Header>
        </Card>
        <div style={{ height: "15px" }}></div>

        {/* Grid Body */}
        <Card
          style={{
            backgroundColor: themeStyles.cardBg,
            color: themeStyles.color,
            border:
              theme === "dark" ? "1px solid #495057" : "1px solid #dee2e6",
            margin: isFullScreen ? 0 : 20,
            borderRadius: isFullScreen ? 0 : 8,
          }}
        >
          <Card.Body
            style={{
              backgroundColor: themeStyles.cardBg,
              padding: isFullScreen ? 15 : 15,
            }}
          >
            <Row className="align-items-center">
              <Col xs={12} lg={14} className="mb-2 mb-lg-0">
                <h5>Forwarded Excel ({fileName})</h5>
              </Col>
            </Row>
          </Card.Body>
        </Card>
        <div style={{ height: "15px" }}></div>
        <Card
          style={{
            backgroundColor: themeStyles.cardBg,
            color: themeStyles.color,
            border:
              theme === "dark" ? "1px solid #495057" : "1px solid #dee2e6",
            margin: isFullScreen ? 0 : 20,
            borderRadius: isFullScreen ? 0 : 8,
          }}
        >
          <Card.Body
            style={{
              backgroundColor: themeStyles.cardBg,
              padding: isFullScreen ? 15 : 15,
            }}
          >
            <Row className="align-items-center">
              <Col xs={12} lg={14} className="mb-2 mb-lg-0">
                <h5>Forwarded Drawings ({fileName})</h5>
              </Col>
            </Row>
            <Row className="align-items-center">
              {drawings.length > 0 ? (
                drawings.map((d, index) => (
                  <Col xs={12} lg={3} className="mb-2 mb-lg-0">
                    <ForwardedDrawingCard key={index} drawing={d} />
                  </Col>
                ))
              ) : (
                <p>No drawings found</p>
              )}
            </Row>
          </Card.Body>
        </Card>
        <div style={{ height: "15px" }}></div>
        <Card
          style={{
            backgroundColor: themeStyles.cardBg,
            color: themeStyles.color,
            border:
              theme === "dark" ? "1px solid #495057" : "1px solid #dee2e6",
            margin: isFullScreen ? 0 : 20,
            borderRadius: isFullScreen ? 0 : 8,
          }}
        >
          <Card.Body
            style={{
              backgroundColor: themeStyles.cardBg,
              padding: isFullScreen ? 15 : 15,
            }}
          >
            <Row className="align-items-center">
              <Col xs={12} lg={14} className="mb-2 mb-lg-0">
                <h5>Upload Electrical Excel ({fileName})</h5>
              </Col>
            </Row>
            <Row className="align-items-center">
              <Col xs={12} lg={14} className="mb-2 mb-lg-0">
                {/* Revision Tabs */}
                <ul className="nav nav-tabs">
                  {revisions.length > 0 ? (
                    revisions.map((rev) => (
                      <li className="nav-item" key={rev.revision}>
                        <button
                          className={`nav-link ${
                            rev.revision === selectedRevision ? "active" : ""
                          }`}
                          onClick={() => setSelectedRevision(rev.revision)}
                        >
                          Revision-{rev.revision}
                        </button>
                      </li>
                    ))
                  ) : (
                    <li className="nav-item">
                      <span>No revisions</span>
                    </li>
                  )}
                </ul>
              </Col>
            </Row>
            <br />
            <Row>
              <Col xs={12} lg={14} className="mb-2 mb-lg-0">
                {/* Comment Box */}
                <h6>Comment:</h6>
                <textarea
                  className="form-control"
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Please enter a comment"
                />
              </Col>
            </Row>
            <br />
            <Row>
              <Col xs={12} lg={3} className="mb-2 mb-lg-0">
                {/* File Upload */}
                <input
                  type="file"
                  onChange={(e) => setFileUpload(e.target.files[0])}
                  className="form-control"
                />
              </Col>
              <Col xs={12} lg={3} className="mb-2 mb-lg-0">
                {/* Upload Button */}
                <button
                  className="btn btn-primary"
                  onClick={async () => {
                    if (!fileUpload)
                      return showToast("Please select a file", "error");

                    const formData = new FormData();
                    formData.append("fileupload", fileUpload);
                    formData.append("fileId", fileid);
                    formData.append("revision", selectedRevision);
                    formData.append("commentbox", comment);

                    try {
                      const res = await fetch(
                        "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/uploadElectricalExcel.php",
                        {
                          method: "POST",
                          body: formData,
                        }
                      );
                      const data = await res.json();
                      showToast(
                        data.message,
                        data.status === "success" ? "success" : "error"
                      );
                    } catch (err) {
                      showToast("Upload failed", "error");
                    }
                  }}
                >
                  Upload
                </button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default PPCBasicEleWorkDetails;
