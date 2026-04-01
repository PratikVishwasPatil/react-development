import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  FileText,
  CheckCircle,
  Clock,
  User,
  Send,
} from "lucide-react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const ProjectDetailsManager = () => {
  const [mainTab, setMainTab] = useState("project-details");
  const [activeTab, setActiveTab] = useState("Foundation");
  const [selectedDrawings, setSelectedDrawings] = useState([]);
  const [apiData, setApiData] = useState(null);
  const [drawingsData, setDrawingsData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [fileId, setFileId] = useState(null);
  const [tabData, setTabData] = useState(null);
  const [tabLoading, setTabLoading] = useState(false);
  const [showForwardPopup, setShowForwardPopup] = useState(false);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [tabs, setTabs] = useState([
    "Foundation",
    "Assly",
    "Fab",
    "SMetal",
    "Hardware",
    "MtlRqmt",
    "Packing List",
    "UDL",
  ]);
  const [showAdvancePopup, setShowAdvancePopup] = useState(false);
  const [advanceSelectedSheet, setAdvanceSelectedSheet] = useState("");
  const [showDrawingsPopup, setShowDrawingsPopup] = useState(false);
  const [drawingsSelectedDepartment, setDrawingsSelectedDepartment] = useState("");
  const [sheetNames, setSheetNames] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingSheets, setLoadingSheets] = useState(false);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [drawingsError, setDrawingsError] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    let path;
    
    if (hash) {
      path = hash.substring(1);
    } else {
      path = window.location.pathname;
    }
    
    const matches = path.match(/\/details\/(\d+)/);
    if (matches && matches[1]) {
      setFileId(matches[1]);
      console.log("File ID extracted:", matches[1]);
    } else {
      console.error("Could not extract file ID from:", path);
    }
  }, []);

  useEffect(() => {
    if (!fileId) return;
    
    const fetchSheetNames = async () => {
      setLoadingSheets(true);
      try {
        const response = await fetch(
          `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPCselectsheetnameApi.php?fileId=${fileId}`,
        );
        const result = await response.json();
        if (result.status === "success") {
          setSheetNames(result.data);
          console.log(result.data);
        }
      } catch (error) {
        console.error("Error fetching sheet names:", error);
      } finally {
        setLoadingSheets(false);
      }
    };
    fetchSheetNames();
  }, [fileId]);

  useEffect(() => {
    if (!fileId) return;
    
    const fetchDepartments = async () => {
      setLoadingDepts(true);
      try {
        const response = await fetch(
          `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPCselectdeptApi.php?fileId=${fileId}`,
        );
        const result = await response.json();
        if (result.status === "success") {
          setDepartments(result.data);
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
      } finally {
        setLoadingDepts(false);
      }
    };
    fetchDepartments();
  }, [fileId]);

  useEffect(() => {
    if (!fileId || !activeTab) return;

    const fetchTabData = async () => {
      try {
        setTabLoading(true);
        const response = await fetch(
          `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPCTabwisedataApi.php?fileId=${fileId}&tabName=${activeTab.toLowerCase()}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch tab data");
        }

        const result = await response.json();

        if (result.status === "success") {
          setTabData(result);
        } else {
          setTabData(null);
        }
      } catch (err) {
        console.error("Error fetching tab data:", err);
        setTabData(null);
      } finally {
        setTabLoading(false);
      }
    };

    fetchTabData();
  }, [fileId, activeTab]);

  useEffect(() => {
    if (!fileId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response1 = await fetch(
          `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/giveUpdateSwapExcelApi.php?file=${fileId}`,
        );

        if (!response1.ok) {
          throw new Error("Network response was not ok");
        }

        const result1 = await response1.json();

        if (result1.status === "success") {
          setApiData(result1.data);
        } else {
          setError("Failed to fetch project details from API");
        }

        const response2 = await fetch(
          `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPCDisplayDrawingsApi.php?fileId=${fileId}`,
        );

        if (!response2.ok) {
          throw new Error("Network response was not ok for drawings");
        }

        const result2 = await response2.json();

        if (result2.status === "success" && result2.data) {
          const allDrawings = result2.data.flatMap((comment) =>
            comment.documents.map((doc) => ({
              doc_id: doc.doc_id,
              date: comment.comment_date,
              time: comment.comment_time,
              type: doc.drawing_name,
              fileName: doc.file_path.split("/").pop().replace(".pdf", ""),
              filePath: doc.file_path,
              fileExtension: doc.file_extension,
            })),
          );
          setDrawingsData(allDrawings);
        } else {
          console.warn("No drawings data available");
        }

        setHistoryLoading(true);
        const response3 = await fetch(
          `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPCHistoryApi.php?fileId=${fileId}`,
        );

        if (!response3.ok) {
          throw new Error("Network response was not ok for history");
        }

        const result3 = await response3.json();

        if (result3.status === "success" && result3.data) {
          setHistoryData(result3.data);
        } else {
          console.warn("No history data available");
        }
        setHistoryLoading(false);

        const response4 = await fetch(
          `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPCgetTabsApi.php?fileId=${fileId}`,
        );

        if (!response4.ok) {
          throw new Error("Network response was not ok for tabs");
        }

        const result4 = await response4.json();

        if (result4.status === "success" && result4.data) {
          const tabNames = result4.data.map((tab) => tab.sheetName);
          setTabs(tabNames);
          if (tabNames.length > 0) {
            setActiveTab(tabNames[0]);
          }
        } else {
          console.warn("No tabs data available, using defaults");
        }
      } catch (err) {
        setError("Error loading data: " + err.message);
        console.error("Fetch error:", err);
        setHistoryLoading(false);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fileId]);

  const uploadedDrawings = [
    {
      date: "04-11-2025",
      type: "Sheet Metal",
      fileName: "5223_Shm DB Cover F",
      filePath: "",
    },
    {
      date: "04-11-2025",
      type: "Sheet Metal",
      fileName: "5223_Shm DB Cover M",
      filePath: "",
    },
  ];

  const historyItems = [
    {
      sheet_name: "MtlRqmt",
      timestamp: "05-11-2025 09:20:51 am",
      sender: "Susham",
      to_department: "Dispatch",
    },
  ];

  const displayDrawings = drawingsData.length > 0 ? drawingsData : uploadedDrawings;
  const displayHistory = historyData.length > 0 ? historyData : historyItems;

  const openPDF = (filePath) => {
    if (filePath) {
      const fullUrl = `https://www.erp.suryaequipments.com${filePath}`;
      window.open(fullUrl, "_blank");
    }
  };

  const getModuleColor = (sheetName) => {
    const colors = {
      SMetal: "#3498db",
      "Sheet Metal": "#3498db",
      Fabrication: "#e74c3c",
      Fab: "#e74c3c",
      MtlRqmt: "#9b59b6",
      Foundation: "#f39c12",
      Assly: "#1abc9c",
      Hardware: "#34495e",
      "Packing List": "#16a085",
      UDL: "#d35400",
    };
    return colors[sheetName] || "#667eea";
  };

  const toggleDrawingSelection = (index) => {
    setSelectedDrawings((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const parseStatusMessage = (message) => {
    if (!message || message.includes("None")) {
      return { text: message || "No data available", user: null, date: null };
    }

    const parts = message.split(" by ");
    if (parts.length > 1) {
      const afterBy = parts[1].split(" on ");
      return {
        text: message,
        user: afterBy[0] || null,
        date: afterBy[1] || null,
      };
    }

    return { text: message, user: null, date: null };
  };

  const handleSendForward = async () => {
    const employeeId = sessionStorage.getItem('userId');
    
    if (!employeeId) {
      toast.error("Employee ID not found. Please login again.");
      return;
    }

    if (!selectedSheet) {
      toast.warning("Please select a sheet name");
      return;
    }

    if (!selectedDepartment) {
      toast.warning("Please select a department");
      return;
    }

    try {
      const payload = {
        fileId: fileId,
        department: [selectedDepartment],
        sheetName: [selectedSheet],
        employee_id: employeeId
      };

      console.log("Sending Forward Sheets payload:", payload);

      const response = await fetch(
        "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPCForwardSheetsApi.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (result.status === "success") {
        toast.success(result.message || "Sheets forwarded successfully!");
        console.log("Success:", result);
        setShowForwardPopup(false);
        setSelectedSheet("");
        setSelectedDepartment("");
      } else {
        toast.error(result.message || "Failed to forward sheets");
        console.error("Error:", result);
      }
    } catch (error) {
      toast.error(`Error forwarding sheets: ${error.message}`);
      console.error("Fetch error:", error);
    }
  };

  const handleSendAdvance = async () => {
    const employeeId = sessionStorage.getItem('userId');
    
    if (!employeeId) {
      toast.error("Employee ID not found. Please login again.");
      return;
    }

    if (!advanceSelectedSheet) {
      toast.warning("Please select a sheet name");
      return;
    }

    if (!selectedDepartment) {
      toast.warning("Please select a department");
      return;
    }

    try {
      const payload = {
        fileId: fileId,
        department: [selectedDepartment],
        sheetName: [advanceSelectedSheet],
        employee_id: employeeId
      };

      console.log("Sending Advance Copy payload:", payload);

      const response = await fetch(
        "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPCForwardAdvanceApi.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (result.status === "success") {
        toast.success(result.message || "Advance copy forwarded successfully!");
        console.log("Success:", result);
        setShowAdvancePopup(false);
        setAdvanceSelectedSheet("");
        setSelectedDepartment("");
      } else {
        toast.error(result.message || "Failed to forward advance copy");
        console.error("Error:", result);
      }
    } catch (error) {
      toast.error(`Error forwarding advance copy: ${error.message}`);
      console.error("Fetch error:", error);
    }
  };

  const handleSendDrawings = async () => {
    const employeeId = sessionStorage.getItem('userId');
    
    if (!employeeId) {
      toast.error("Employee ID not found. Please login again.");
      return;
    }

    if (selectedDrawings.length === 0) {
      toast.warning("Please select at least one drawing");
      return;
    }

    if (!drawingsSelectedDepartment) {
      toast.warning("Please select a department");
      return;
    }

    try {
      const drawingIds = selectedDrawings.map(index => {
        const drawing = displayDrawings[index];
        return drawing.doc_id;
      });

      const payload = {
        fileId: fileId,
        department: [drawingsSelectedDepartment],
        drawingIds: drawingIds,
        employee_id: employeeId
      };

      console.log("Sending Drawings payload:", payload);

      const response = await fetch(
        "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPCSaveDrawingApi.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (result.status === "success") {
        toast.success(
          `Drawings forwarded successfully! ${result.data?.totalRecordsInserted || ''} records inserted.`
        );
        console.log("Success:", result);
        setShowDrawingsPopup(false);
        setDrawingsSelectedDepartment("");
        setSelectedDrawings([]);
      } else {
        toast.error(result.message || "Failed to forward drawings");
        console.error("Error:", result);
      }
    } catch (error) {
      toast.error(`Error sending drawings: ${error.message}`);
      console.error("Fetch error:", error);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        padding: "0",
      }}
    >
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .mobile-scroll {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
        }
      `}</style>

      {/* Header Tabs */}
      <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row" }}>
        <button
          onClick={() => setMainTab("project-details")}
          style={{
            flex: 1,
            background:
              mainTab === "project-details"
                ? "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                : "linear-gradient(135deg, #a8b8d8 0%, #8e9ebc 100%)",
            color: "white",
            border: "none",
            padding: isMobile ? "14px 16px" : "18px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontWeight: "700",
            fontSize: isMobile ? "14px" : "17px",
            cursor: "pointer",
            transition: "all 0.3s ease",
            letterSpacing: "0.5px",
            boxShadow:
              mainTab === "project-details"
                ? "0 4px 15px rgba(106, 146, 180, 0.4)"
                : "none",
          }}
        >
          <span style={{ flex: 1, textAlign: "left" }}>
            {isMobile ? "Project Details" : "Project Details (S-25-084-SHI)"}
          </span>
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.25)",
              borderRadius: "50%",
              padding: isMobile ? "4px" : "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
            }}
            onClick={(e) => {
              e.stopPropagation();
              setShowForwardPopup(true);
            }}
          >
            <ChevronRight size={isMobile ? 16 : 20} strokeWidth={3} />
          </div>
        </button>
        <button
          onClick={() => setMainTab("advance-copy")}
          style={{
            flex: 1,
            background:
              mainTab === "advance-copy"
                ? "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                : "linear-gradient(135deg, #e0e0e0 0%, #c4c4c4 100%)",
            color: mainTab === "advance-copy" ? "white" : "#666",
            border: "none",
            padding: isMobile ? "14px 16px" : "18px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontWeight: "700",
            fontSize: isMobile ? "14px" : "17px",
            cursor: "pointer",
            transition: "all 0.3s ease",
            letterSpacing: "0.5px",
            boxShadow:
              mainTab === "advance-copy"
                ? "0 4px 15px rgba(245, 87, 108, 0.4)"
                : "none",
          }}
        >
          <span style={{ flex: 1, textAlign: "left" }}>
            {isMobile ? "Advance Copy" : "Advance Copy (Long Lead Material)"}
          </span>
          <div
            style={{
              backgroundColor:
                mainTab === "advance-copy"
                  ? "rgba(255,255,255,0.25)"
                  : "#4facfe",
              borderRadius: "50%",
              padding: isMobile ? "4px" : "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              cursor: "pointer",
              flexShrink: 0,
            }}
            onClick={(e) => {
              e.stopPropagation();
              setShowAdvancePopup(true);
            }}
          >
            <ChevronRight size={isMobile ? 16 : 20} strokeWidth={3} />
          </div>
        </button>
      </div>

      {/* Forward Sheets Popup */}
      {showForwardPopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: isMobile ? "16px" : "0",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              width: isMobile ? "100%" : "500px",
              maxWidth: isMobile ? "100%" : "90%",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
              maxHeight: isMobile ? "90vh" : "auto",
              overflowY: isMobile ? "auto" : "visible",
            }}
          >
            <div
              style={{
                padding: isMobile ? "16px" : "20px 24px",
                borderBottom: "1px solid #e0e0e0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: isMobile ? "18px" : "20px",
                  fontWeight: "600",
                  color: "#333",
                }}
              >
                Forward Sheets
              </h2>
              <button
                onClick={() => setShowForwardPopup(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "28px",
                  cursor: "pointer",
                  color: "#666",
                  padding: "0",
                  width: "30px",
                  height: "30px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "300",
                  lineHeight: "1",
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: isMobile ? "16px" : "24px" }}>
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    color: "#666",
                    fontWeight: "500",
                  }}
                >
                  Select Sheet Name
                </label>
                <select
                  value={selectedSheet}
                  onChange={(e) => setSelectedSheet(e.target.value)}
                  disabled={loadingSheets}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    fontSize: "14px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    outline: "none",
                    backgroundColor: loadingSheets ? "#f5f5f5" : "white",
                    cursor: loadingSheets ? "not-allowed" : "pointer",
                    color: "#333",
                  }}
                >
                  <option value="">
                    {loadingSheets ? "Loading sheets..." : "Select a sheet..."}
                  </option>
                  {sheetNames.map((sheet, index) => (
                    <option key={index} value={sheet}>
                      {sheet}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    color: "#666",
                    fontWeight: "500",
                  }}
                >
                  Select Department
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  disabled={loadingDepts}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    fontSize: "14px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    outline: "none",
                    backgroundColor: loadingDepts ? "#f5f5f5" : "white",
                    cursor: loadingDepts ? "not-allowed" : "pointer",
                    color: "#333",
                  }}
                >
                  <option value="">
                    {loadingDepts ? "Loading departments..." : "Select a department..."}
                  </option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                  flexDirection: isMobile ? "column" : "row",
                }}
              >
                <button
                  onClick={() => {
                    setShowForwardPopup(false);
                    setSelectedSheet("");
                    setSelectedDepartment("");
                  }}
                  style={{
                    padding: "10px 24px",
                    fontSize: "14px",
                    fontWeight: "600",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    backgroundColor: "white",
                    color: "#666",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    width: isMobile ? "100%" : "auto",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#f5f5f5";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "white";
                  }}
                >
                  Close
                </button>
                <button
                  onClick={handleSendForward}
                  disabled={!selectedSheet || !selectedDepartment}
                  style={{
                    padding: "10px 24px",
                    fontSize: "14px",
                    fontWeight: "600",
                    border: "none",
                    borderRadius: "6px",
                    backgroundColor: !selectedSheet || !selectedDepartment ? "#ccc" : "#ff5722",
                    color: "white",
                    cursor: !selectedSheet || !selectedDepartment ? "not-allowed" : "pointer",
                    transition: "all 0.2s ease",
                    opacity: !selectedSheet || !selectedDepartment ? 0.6 : 1,
                    width: isMobile ? "100%" : "auto",
                  }}
                  onMouseEnter={(e) => {
                    if (selectedSheet && selectedDepartment) {
                      e.target.style.backgroundColor = "#e64a19";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedSheet && selectedDepartment) {
                      e.target.style.backgroundColor = "#ff5722";
                    }
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Forward Advance Copy Popup */}
      {showAdvancePopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: isMobile ? "16px" : "0",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              width: isMobile ? "100%" : "500px",
              maxWidth: isMobile ? "100%" : "90%",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
              maxHeight: isMobile ? "90vh" : "auto",
              overflowY: isMobile ? "auto" : "visible",
            }}
          >
            <div
              style={{
                padding: isMobile ? "16px" : "20px 24px",
                borderBottom: "1px solid #e0e0e0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: isMobile ? "18px" : "20px",
                  fontWeight: "600",
                  color: "#333",
                }}
              >
                Forward Advance Copy
              </h2>
              <button
                onClick={() => setShowAdvancePopup(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "28px",
                  cursor: "pointer",
                  color: "#666",
                  padding: "0",
                  width: "30px",
                  height: "30px",
                  display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "300",
              lineHeight: "1",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: isMobile ? "16px" : "24px" }}>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                color: "#666",
                fontWeight: "500",
              }}
            >
              Select Sheet Name
            </label>
            <select
              value={advanceSelectedSheet}
              onChange={(e) => setAdvanceSelectedSheet(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                fontSize: "14px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                outline: "none",
                backgroundColor: "white",
                cursor: "pointer",
                color: "#333",
              }}
            >
              <option value="">Select a sheet...</option>
              {tabs.map((tab) => (
                <option key={tab} value={tab}>
                  {tab}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                color: "#666",
                fontWeight: "500",
              }}
            >
              Select Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              disabled={loadingDepts}
              style={{
                width: "100%",
                padding: "10px 12px",
                fontSize: "14px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                outline: "none",
                backgroundColor: loadingDepts ? "#f5f5f5" : "white",
                cursor: loadingDepts ? "not-allowed" : "pointer",
                color: "#333",
              }}
            >
              <option value="">
                {loadingDepts ? "Loading departments..." : "Select a department..."}
              </option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              flexDirection: isMobile ? "column" : "row",
            }}
          >
            <button
              onClick={() => {
                setShowAdvancePopup(false);
                setAdvanceSelectedSheet("");
                setSelectedDepartment("");
              }}
              style={{
                padding: "10px 24px",
                fontSize: "14px",
                fontWeight: "600",
                border: "1px solid #ddd",
                borderRadius: "6px",
                backgroundColor: "white",
                color: "#666",
                cursor: "pointer",
                transition: "all 0.2s ease",
                width: isMobile ? "100%" : "auto",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#f5f5f5";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "white";
              }}
            >
              Close
            </button>
            <button
              onClick={handleSendAdvance}
              disabled={!advanceSelectedSheet || !selectedDepartment}
              style={{
                padding: "10px 24px",
                fontSize: "14px",
                fontWeight: "600",
                border: "none",
                borderRadius: "6px",
                backgroundColor: !advanceSelectedSheet || !selectedDepartment ? "#ccc" : "#ff5722",
                color: "white",
                cursor: !advanceSelectedSheet || !selectedDepartment ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                opacity: !advanceSelectedSheet || !selectedDepartment ? 0.6 : 1,
                width: isMobile ? "100%" : "auto",
              }}
              onMouseEnter={(e) => {
                if (advanceSelectedSheet && selectedDepartment) {
                  e.target.style.backgroundColor = "#e64a19";
                }
              }}
              onMouseLeave={(e) => {
                if (advanceSelectedSheet && selectedDepartment) {
                  e.target.style.backgroundColor = "#ff5722";
                }
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )}

  {/* Forward Drawings Popup */}
  {showDrawingsPopup && (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: isMobile ? "16px" : "0",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          width: isMobile ? "100%" : "500px",
          maxWidth: isMobile ? "100%" : "90%",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          maxHeight: isMobile ? "90vh" : "auto",
          overflowY: isMobile ? "auto" : "visible",
        }}
      >
        <div
          style={{
            padding: isMobile ? "16px" : "20px 24px",
            borderBottom: "1px solid #e0e0e0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: isMobile ? "18px" : "20px",
              fontWeight: "600",
              color: "#333",
            }}
          >
            Forward Drawings
          </h2>
          <button
            onClick={() => setShowDrawingsPopup(false)}
            style={{
              background: "none",
              border: "none",
              fontSize: "28px",
              cursor: "pointer",
              color: "#666",
              padding: "0",
              width: "30px",
              height: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "300",
              lineHeight: "1",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: isMobile ? "16px" : "24px" }}>
          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                color: "#666",
                fontWeight: "500",
              }}
            >
              Select Department
            </label>
            <select
              value={drawingsSelectedDepartment}
              onChange={(e) => setDrawingsSelectedDepartment(e.target.value)}
              disabled={loadingDepts}
              style={{
                width: "100%",
                padding: "10px 12px",
                fontSize: "14px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                outline: "none",
                backgroundColor: loadingDepts ? "#f5f5f5" : "white",
                cursor: loadingDepts ? "not-allowed" : "pointer",
                color: "#333",
              }}
            >
              <option value="">
                {loadingDepts ? "Loading departments..." : "Select a department..."}
              </option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              flexDirection: isMobile ? "column" : "row",
            }}
          >
            <button
              onClick={() => {
                setShowDrawingsPopup(false);
                setDrawingsSelectedDepartment("");
              }}
              style={{
                padding: "10px 24px",
                fontSize: "14px",
                fontWeight: "600",
                border: "1px solid #ddd",
                borderRadius: "6px",
                backgroundColor: "white",
                color: "#666",
                cursor: "pointer",
                transition: "all 0.2s ease",
                width: isMobile ? "100%" : "auto",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#f5f5f5";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "white";
              }}
            >
              Close
            </button>
            <button
              onClick={handleSendDrawings}
              disabled={!drawingsSelectedDepartment}
              style={{
                padding: "10px 24px",
                fontSize: "14px",
                fontWeight: "600",
                border: "none",
                borderRadius: "6px",
                backgroundColor: !drawingsSelectedDepartment ? "#ccc" : "#ff5722",
                color: "white",
                cursor: !drawingsSelectedDepartment ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                opacity: !drawingsSelectedDepartment ? 0.6 : 1,
                width: isMobile ? "100%" : "auto",
              }}
              onMouseEnter={(e) => {
                if (drawingsSelectedDepartment) {
                  e.target.style.backgroundColor = "#e64a19";
                }
              }}
              onMouseLeave={(e) => {
                if (drawingsSelectedDepartment) {
                  e.target.style.backgroundColor = "#ff5722";
                }
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )}
  {mainTab === "project-details" ? (
        <div style={{ padding: isMobile ? "16px" : "32px" }}>
          {/* Loading state - already responsive */}
          {loading && (
            <div
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                padding: isMobile ? "24px" : "32px",
                borderRadius: "16px",
                textAlign: "center",
                marginBottom: "24px",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  width: "40px",
                  height: "40px",
                  border: "4px solid #f3f3f3",
                  borderTop: "4px solid #667eea",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  marginBottom: "16px",
                }}
              />
              <div
                style={{
                  fontSize: isMobile ? "16px" : "18px",
                  fontWeight: "700",
                  color: "#667eea",
                }}
              >
                Loading Project Data...
              </div>
            </div>
          )}

          {/* Error state - already responsive */}
          {error && (
            <div
              style={{
                background: "linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)",
                padding: isMobile ? "16px 20px" : "20px 24px",
                borderRadius: "12px",
                color: "#c62828",
                fontSize: isMobile ? "14px" : "15px",
                fontWeight: "600",
                marginBottom: "24px",
                boxShadow: "0 4px 15px rgba(198, 40, 40, 0.2)",
                border: "2px solid rgba(198, 40, 40, 0.3)",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <Clock size={isMobile ? 18 : 20} />
              {error}
            </div>
          )}

          {!loading && apiData && (
            <>
              {/* Search input */}
              <div style={{ marginBottom: "16px" }}>
                <input
                  type="text"
                  placeholder="Search..."
                  style={{
                    padding: isMobile ? "10px 12px" : "8px 12px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    fontSize: "14px",
                    width: "100%",
                    maxWidth: isMobile ? "100%" : "300px",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#1976d2";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#ccc";
                  }}
                />
              </div>

              {/* Status cards grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(400px, 1fr))",
                  gap: "16px",
                  marginBottom: "24px",
                }}
              >
                <div
                  style={{
                    background: "linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)",
                    padding: isMobile ? "14px 18px" : "16px 20px",
                    borderRadius: "12px",
                    color: "#006064",
                    fontSize: isMobile ? "13px" : "14px",
                    fontWeight: "600",
                    boxShadow: "0 4px 15px rgba(0, 150, 136, 0.15)",
                    border: "2px solid rgba(0, 150, 136, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <Clock size={isMobile ? 16 : 18} />
                  <span>{parseStatusMessage(apiData.smetal).text}</span>
                </div>
                <div
                  style={{
                    background: "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
                    padding: isMobile ? "14px 18px" : "16px 20px",
                    borderRadius: "12px",
                    color: "#e65100",
                    fontSize: isMobile ? "13px" : "14px",
                    fontWeight: "600",
                    boxShadow: "0 4px 15px rgba(255, 152, 0, 0.15)",
                    border: "2px solid rgba(255, 152, 0, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <Clock size={isMobile ? 16 : 18} />
                  <span>{parseStatusMessage(apiData.found).text}</span>
                </div>
                <div
                  style={{
                    background: "linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)",
                    padding: isMobile ? "14px 18px" : "16px 20px",
                    borderRadius: "12px",
                    color: "#4a148c",
                    fontSize: isMobile ? "13px" : "14px",
                    fontWeight: "600",
                    boxShadow: "0 4px 15px rgba(156, 39, 176, 0.15)",
                    border: "2px solid rgba(156, 39, 176, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <Clock size={isMobile ? 16 : 18} />
                  <span>{parseStatusMessage(apiData.assly).text}</span>
                </div>
                <div
                  style={{
                    background: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
                    padding: isMobile ? "14px 18px" : "16px 20px",
                    borderRadius: "12px",
                    color: "#1b5e20",
                    fontSize: isMobile ? "13px" : "14px",
                    fontWeight: "600",
                    boxShadow: "0 4px 15px rgba(76, 175, 80, 0.15)",
                    border: "2px solid rgba(76, 175, 80, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <Clock size={isMobile ? 16 : 18} />
                  <span>{parseStatusMessage(apiData.fab).text}</span>
                </div>
              </div>
            </>
          )}

          {/* Send to Rackline button */}
          {!loading && (
            <button
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                padding: isMobile ? "12px 24px" : "14px 32px",
                borderRadius: "10px",
                fontWeight: "700",
                fontSize: isMobile ? "14px" : "15px",
                cursor: "pointer",
                marginBottom: "24px",
                boxShadow: "0 6px 20px rgba(102, 126, 234, 0.4)",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                width: isMobile ? "100%" : "auto",
                justifyContent: "center",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 8px 25px rgba(102, 126, 234, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.4)";
              }}
            >
              <Send size={isMobile ? 16 : 18} />
              Send To Rackline
            </button>
          )}

          {/* Tabs section */}
          {!loading && (
            <>
              <div
                className={isMobile ? "mobile-scroll" : ""}
                style={{
                  display: "flex",
                  gap: "6px",
                  marginBottom: "0",
                  overflowX: "auto",
                  paddingBottom: "4px",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: isMobile ? "12px 20px" : "14px 28px",
                      border: "none",
                      background:
                        activeTab === tab
                          ? "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)"
                          : "rgba(255, 255, 255, 0.5)",
                      color: activeTab === tab ? "#667eea" : "#666",
                      fontSize: isMobile ? "13px" : "14px",
                      fontWeight: activeTab === tab ? "700" : "600",
                      cursor: "pointer",
                      borderTopLeftRadius: "10px",
                      borderTopRightRadius: "10px",
                      transition: "all 0.3s ease",
                      borderBottom: activeTab === tab ? "4px solid #667eea" : "none",
                      boxShadow:
                        activeTab === tab ? "0 -4px 12px rgba(102, 126, 234, 0.15)" : "none",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Table container */}
              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: "0 12px 12px 12px",
                  overflow: "hidden",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
                  marginBottom: isMobile ? "24px" : "32px",
                  maxHeight: isMobile ? "400px" : "500px",
                  display: "flex",
                  flexDirection: "column",
                  border: "2px solid #e9ecef",
                }}
              >
                <div
                  style={{
                    background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                    padding: isMobile ? "12px 16px" : "16px 24px",
                    borderBottom: "3px solid #dee2e6",
                    fontSize: isMobile ? "12px" : "14px",
                    fontWeight: "700",
                    color: "#495057",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    flexShrink: 0,
                    overflowX: "auto",
                  }}
                >
                  <User size={isMobile ? 16 : 18} style={{ color: "#667eea", flexShrink: 0 }} />
                  <span style={{ whiteSpace: isMobile ? "nowrap" : "normal" }}>
                    {tabData
                      ? `${tabData.file_name} | Uploaded By And Time : ${tabData.uploaded_by} ${tabData.uploaded_time}`
                      : "Loading..."}
                  </span>
                </div>

                {tabLoading ? (
                  <div style={{ padding: isMobile ? "40px 20px" : "60px", textAlign: "center" }}>
                    <div
                      style={{
                        display: "inline-block",
                        width: isMobile ? "30px" : "40px",
                        height: isMobile ? "30px" : "40px",
                        border: "4px solid #f3f3f3",
                        borderTop: "4px solid #667eea",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                      }}
                    />
                    <div
                      style={{
                        fontSize: isMobile ? "14px" : "16px",
                        fontWeight: "700",
                        color: "#667eea",
                        marginTop: "16px",
                      }}
                    >
                      Loading {activeTab} data...
                    </div>
                  </div>
                ) : tabData && tabData.rows && tabData.rows.length > 0 ? (
                  <div
                    style={{
                      overflowX: "auto",
                      overflowY: "auto",
                      flex: 1,
                      maxHeight: isMobile ? "335px" : "435px",
                    }}
                  >
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        border: "1px solid #dee2e6",
                      }}
                    >
                      <tbody>
                        {tabData.rows.map((row, idx) => (
                          <tr
                            key={idx}
                            style={{
                              transition: "all 0.2s ease",
                              backgroundColor: row.highlight ? "#fff3cd" : "transparent",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = row.highlight
                                ? "#ffe69c"
                                : "#f8f9ff";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = row.highlight
                                ? "#fff3cd"
                                : "transparent";
                            }}
                          >
                            {activeTab === "Packing List" && (
                              <td
                                style={{
                                  padding: isMobile ? "12px 16px" : "18px 24px",
                                  textAlign: "right",
                                  border: "1px solid #dee2e6",
                                  width: isMobile ? "50px" : "60px",
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedDrawings.includes(idx)}
                                  onChange={() => toggleDrawingSelection(idx)}
                                  style={{
                                    width: isMobile ? "16px" : "18px",
                                    height: isMobile ? "16px" : "18px",
                                    cursor: "pointer",
                                    accentColor: "#667eea",
                                  }}
                                />
                              </td>
                            )}
                            {row.data.map((cell, cellIdx) => (
                              <td
                                key={cellIdx}
                                style={{
                                  padding: isMobile ? "12px 16px" : "18px 24px",
                                  fontSize:
                                    cellIdx === 0
                                      ? isMobile ? "13px" : "15px"
                                      : cellIdx === 1
                                        ? isMobile ? "13px" : "15px"
                                        : isMobile ? "12px" : "14px",
                                  fontWeight:
                                    cellIdx === 0 ? "700" : cellIdx === 1 ? "600" : "500",
                                  color:
                                    cellIdx === 0
                                      ? "#667eea"
                                      : cellIdx === 1
                                        ? "#2c3e50"
                                        : "#7f8c8d",
                                  textAlign: cellIdx <= 1 ? "left" : "right",
                                  minWidth:
                                    cellIdx === 1
                                      ? isMobile ? "200px" : "250px"
                                      : cellIdx <= 3
                                        ? isMobile ? "120px" : "150px"
                                        : isMobile ? "80px" : "100px",
                                  whiteSpace: cellIdx === 1 ? "normal" : "nowrap",
                                  border: "1px solid #dee2e6",
                                }}
                              >
                                {cell || (cellIdx > 1 ? "0" : "")}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div
                    style={{
                      padding: isMobile ? "40px 20px" : "60px",
                      textAlign: "center",
                      color: "#95a5a6",
                      fontSize: isMobile ? "14px" : "16px",
                      fontWeight: "600",
                    }}
                  >
                    No data available for {activeTab}
                  </div>
                )}
              </div>

              {/* Drawings and History section */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1.8fr 1fr",
                  gap: isMobile ? "24px" : "32px",
                }}
              >
                {/* Uploaded Drawings */}
                <div
                  style={{
                    backgroundColor: "white",
                    borderRadius: "16px",
                    padding: isMobile ? "20px" : "28px",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "24px",
                      paddingBottom: "16px",
                      borderBottom: "3px solid #f0f0f0",
                      flexWrap: isMobile ? "wrap" : "nowrap",
                      gap: isMobile ? "12px" : "0",
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: isMobile ? "16px" : "18px",
                        fontWeight: "700",
                        color: "#2c3e50",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <FileText size={isMobile ? 20 : 22} style={{ color: "#667eea" }} />
                      <span>Uploaded Drawings {!isMobile && "(S-25-084-SHI)"}</span>
                    </h3>
                    <div
                      style={{
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "white",
                        borderRadius: "50%",
                        padding: isMobile ? "6px" : "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                      }}
                      onClick={() => {
                        if (selectedDrawings.length === 0) {
                          setDrawingsError("Please select at least one drawing");
                          setTimeout(() => setDrawingsError(""), 3000);
                        } else {
                          setDrawingsError("");
                          setShowDrawingsPopup(true);
                        }
                      }}
                    >
                      <ChevronRight size={isMobile ? 18 : 20} strokeWidth={3} />
                    </div>
                  </div>

                  {drawingsError && (
                    <div
                      style={{
                        background: "linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)",
                        padding: "12px 16px",
                        borderRadius: "8px",
                        color: "#c62828",
                        fontSize: isMobile ? "12px" : "13px",
                        fontWeight: "600",
                        marginBottom: "16px",
                        boxShadow: "0 4px 15px rgba(198, 40, 40, 0.2)",
                        border: "2px solid rgba(198, 40, 40, 0.3)",
                        display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <Clock size={16} />
                  {drawingsError}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  maxHeight: isMobile ? "400px" : "600px",
                  overflowY: "auto",
                }}
              >
                {displayDrawings.map((drawing, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile
                        ? "1fr 60px 35px"
                        : "140px 130px 1fr 85px 45px",
                      alignItems: "center",
                      gap: isMobile ? "8px" : "16px",
                      padding: isMobile ? "12px 14px" : "16px 18px",
                      background: "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)",
                      borderRadius: "10px",
                      fontSize: isMobile ? "12px" : "13px",
                      border: "2px solid #e9ecef",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateX(4px)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 16px rgba(102, 126, 234, 0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateX(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    {isMobile ? (
                      <>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <span style={{ color: "#7f8c8d", fontWeight: "600" }}>
                            {drawing.date}
                          </span>
                          <span
                            style={{
                              color: "#2c3e50",
                              fontWeight: "700",
                              fontSize: "11px",
                            }}
                          >
                            {drawing.type}
                          </span>
                          <span
                            style={{
                              color: "#34495e",
                              fontWeight: "500",
                              fontSize: "12px",
                              wordBreak: "break-word",
                            }}
                          >
                            {drawing.fileName}
                          </span>
                        </div>
                        <div
                          style={{
                            background:
                              "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)",
                            color: "white",
                            padding: "8px 10px",
                            borderRadius: "8px",
                            textAlign: "center",
                            fontSize: "11px",
                            fontWeight: "700",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "4px",
                            boxShadow: "0 4px 12px rgba(231, 76, 60, 0.3)",
                            transition: "all 0.2s ease",
                          }}
                          onClick={() => openPDF(drawing.filePath)}
                        >
                          <FileText size={12} />
                          PDF
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedDrawings.includes(idx)}
                          onChange={() => toggleDrawingSelection(idx)}
                          style={{
                            width: "18px",
                            height: "18px",
                            cursor: "pointer",
                            accentColor: "#667eea",
                          }}
                        />
                      </>
                    ) : (
                      <>
                        <span style={{ color: "#7f8c8d", fontWeight: "600" }}>
                          Date: {drawing.date}
                        </span>
                        <span
                          style={{
                            color: "#2c3e50",
                            fontWeight: "700",
                            fontSize: "12px",
                          }}
                        >
                          {drawing.type}
                        </span>
                        <span
                          style={{
                            color: "#34495e",
                            fontWeight: "500",
                            fontSize: "13px",
                          }}
                        >
                          {drawing.fileName}
                        </span>
                        <div
                          style={{
                            background:
                              "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)",
                            color: "white",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            textAlign: "center",
                            fontSize: "12px",
                            fontWeight: "700",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            boxShadow: "0 4px 12px rgba(231, 76, 60, 0.3)",
                            transition: "all 0.2s ease",
                          }}
                          onClick={() => openPDF(drawing.filePath)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "scale(1.05)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                          }}
                        >
                          <FileText size={14} />
                          PDF
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedDrawings.includes(idx)}
                          onChange={() => toggleDrawingSelection(idx)}
                          style={{
                            width: "20px",
                            height: "20px",
                            cursor: "pointer",
                            accentColor: "#667eea",
                          }}
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* History section */}
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "16px",
                padding: isMobile ? "20px" : "28px",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
              }}
            >
              <h3
                style={{
                  margin: "0 0 24px 0",
                  fontSize: isMobile ? "16px" : "18px",
                  fontWeight: "700",
                  color: "#2c3e50",
                  paddingBottom: "16px",
                  borderBottom: "3px solid #f0f0f0",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <Clock size={isMobile ? 20 : 22} style={{ color: "#667eea" }} />
                <span>History {!isMobile && "(S-25-084-SHI)"}</span>
              </h3>

              {historyLoading ? (
                <div style={{ textAlign: "center", padding: isMobile ? "30px 0" : "40px 0" }}>
                  <div
                    style={{
                      display: "inline-block",
                      width: isMobile ? "25px" : "30px",
                      height: isMobile ? "25px" : "30px",
                      border: "3px solid #f3f3f3",
                      borderTop: "3px solid #667eea",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  <div
                    style={{
                      fontSize: isMobile ? "13px" : "14px",
                      color: "#7f8c8d",
                      marginTop: "12px",
                      fontWeight: "600",
                    }}
                  >
                    Loading history...
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    position: "relative",
                    maxHeight: isMobile ? "400px" : "600px",
                    overflowY: "auto",
                  }}
                >
                  {displayHistory.length > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        left: isMobile ? "11px" : "13px",
                        top: "35px",
                        bottom: "35px",
                        width: isMobile ? "2px" : "3px",
                        background: "linear-gradient(180deg, #667eea 0%, #e9ecef 100%)",
                      }}
                    />
                  )}

                  {displayHistory.length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "40px 20px",
                        color: "#95a5a6",
                        fontSize: isMobile ? "13px" : "14px",
                        fontWeight: "600",
                      }}
                    >
                      No history records found
                    </div>
                  ) : (
                    displayHistory.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          position: "relative",
                          paddingLeft: isMobile ? "40px" : "48px",
                          marginBottom: isMobile ? "24px" : "28px",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            left: "0",
                            top: "2px",
                            width: isMobile ? "26px" : "30px",
                            height: isMobile ? "26px" : "30px",
                            borderRadius: "50%",
                            background: `linear-gradient(135deg, ${getModuleColor(item.sheet_name)} 0%, ${getModuleColor(item.sheet_name)}dd 100%)`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: `0 4px 16px ${getModuleColor(item.sheet_name)}40`,
                            border: isMobile ? "2px solid white" : "3px solid white",
                          }}
                        >
                          <CheckCircle
                            size={isMobile ? 14 : 16}
                            color="white"
                            strokeWidth={3}
                          />
                        </div>

                        <div
                          style={{
                            backgroundColor: "#f8f9fa",
                            padding: isMobile ? "12px 14px" : "16px",
                            borderRadius: "10px",
                            border: "2px solid #e9ecef",
                            transition: "all 0.3s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateX(4px)";
                            e.currentTarget.style.boxShadow =
                              "0 4px 16px rgba(102, 126, 234, 0.15)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateX(0)";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              marginBottom: "10px",
                              flexWrap: isMobile ? "wrap" : "nowrap",
                              gap: isMobile ? "8px" : "0",
                            }}
                          >
                            <span
                              style={{
                                fontSize: isMobile ? "12px" : "13px",
                                fontWeight: "700",
                                color: getModuleColor(item.sheet_name),
                                background: `${getModuleColor(item.sheet_name)}15`,
                                padding: isMobile ? "5px 10px" : "6px 12px",
                                borderRadius: "6px",
                                border: `1.5px solid ${getModuleColor(item.sheet_name)}40`,
                              }}
                            >
                              {item.sheet_name}
                            </span>
                            <span
                              style={{
                                fontSize: isMobile ? "10px" : "11px",
                                color: "#95a5a6",
                                fontWeight: "600",
                              }}
                            >
                              {item.timestamp}
                            </span>
                          </div>

                          <div
                            style={{
                              fontSize: isMobile ? "12px" : "13px",
                              color: "#34495e",
                              fontWeight: "600",
                              marginBottom: "6px",
                            }}
                          >
                            <span style={{ color: "#7f8c8d" }}>From:</span> {item.sender}
                          </div>

                          <div
                            style={{
                              fontSize: isMobile ? "12px" : "13px",
                              color: "#34495e",
                              fontWeight: "600",
                            }}
                          >
                            <span style={{ color: "#7f8c8d" }}>To:</span>{" "}
                            {item.to_department}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  ) : (
    // Advance Copy section
    <div
      style={{
        padding: isMobile ? "16px" : "32px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: isMobile ? "40px 24px" : "60px 40px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
          maxWidth: "600px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            width: isMobile ? "60px" : "80px",
            height: isMobile ? "60px" : "80px",
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            boxShadow: "0 8px 24px rgba(245, 87, 108, 0.4)",
          }}
        >
          <FileText
            size={isMobile ? 30 : 40}
            color="white"
            strokeWidth={2.5}
          />
        </div>
        <h2
          style={{
            fontSize: isMobile ? "22px" : "28px",
            fontWeight: "700",
            color: "#2c3e50",
            marginBottom: "16px",
          }}
        >
          Advance Copy Section
        </h2>
        <p
          style={{
            fontSize: isMobile ? "14px" : "16px",
            color: "#7f8c8d",
            lineHeight: "1.6",
            fontWeight: "500",
          }}
        >
          Long Lead Material management coming soon...
        </p>
      </div>
    </div>
  )}
</div>
);
};
export default ProjectDetailsManager;