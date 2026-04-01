import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Form,
  Button,
  Row,
  Col,
  Card,
  ButtonGroup,
  Accordion,
  Tab,
  Tabs,
} from "react-bootstrap";
import axios from "axios";
import Select from "react-select";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-theme-alpine.css";

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
  CellStyleModule,
} from "ag-grid-community";

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  ValidationModule,
  DateFilterModule,
  NumberFilterModule,
  TextFilterModule,
  RowSelectionModule,
  PaginationModule,
  CsvExportModule,
  CellStyleModule,
]);
export default function MarketingManufacturingData() {
  const [theme, setTheme] = useState("light");
  const [dark, setDark] = useState(false);
  const [file, setFile] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("SEPL");
  const [gridData, setGridData] = useState({});
  const [isFullScreen, setIsFullScreen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const tabs = [
    "SEPL",
    "AMC",
    "Misc_Supply",
    "Misc_Lab",
    "balance_billing",
    "billing_done",
    "po_value",
    "product_ownerwise",
  ];

  //handle excell download
  const downloadExcel = () => {
    const tab = activeTab;
    if (!gridData[tab] || gridData[tab].length === 0) {
      showToast("No data available to export", "error");
      return;
    }

    const rows = gridData[tab];
    const headers = Object.keys(rows[0]).join(",");
    const csvRows = rows.map((row) =>
      Object.values(row)
        .map((v) => `"${v}"`)
        .join(",")
    );

    const csvContent = [headers, ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${tab}.csv`;
    a.click();
  };

  // Handle window resize
  const autoSizeAll = () => {
    const grid = document.querySelector(".ag-theme-alpine");
    if (!grid) return;

    const api = grid.__agGridInstance?.api;
    if (!api) return;

    const allCols = api.getAllColumns();
    api.autoSizeColumns(allCols);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  // Fetch financial year options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await axios.post(
          "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/GetYearsApi.php"
        );
        if (res.data.status === "success") {
          const opts = res.data.data.map((item) => ({
            value: item.financial_year,
            label: item.financial_year,
          }));
          setOptions(opts);
          const defaultYear = opts.find((opt) => opt.value === "25-26");
          if (defaultYear) {
            setSelectedOption(defaultYear);
            fetchTabData(defaultYear.value);
          }
        }
      } catch (err) {
        console.error("Error fetching dropdown options:", err);
      }
    };
    fetchOptions();
  }, []);

  const defaultColDef = useMemo(
    () => ({
      filter: true,
      sortable: true,
      floatingFilter: !isMobile,
      resizable: true,
      suppressMenu: isMobile,
      cellStyle: { textAlign: "left" },
    }),
    [isMobile]
  );

  // Fetch tab data
  const fetchTabData = async (year) => {
    try {
      const res = await axios.get(
        `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/get_manufacturing_uploaded_data.php?financial_year=${year}`
      );
      if (res.data.success) setGridData(res.data.tabData || {});
    } catch (err) {
      console.error("Error fetching tab data:", err);
    }
  };
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
  // Handle Select change
  const handleYearChange = (option) => {
    setSelectedOption(option);
    fetchTabData(option.value);
  };
  const handleRefresh = () => {
    if (options) {
      MarketingManufacturingData(options);
      showToast("Refreshing data...", "info");
    }
  };
  // Handle file selection
  const handleFileChange = (e) => setFile(e.target.files[0]);

  // Submit upload
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !selectedOption) {
      alert("Please select a file and a financial year!");
      return;
    }
    const formData = new FormData();
    formData.append("filename[]", file);
    formData.append("financial_year", selectedOption.value);

    try {
      const res = await fetch(
        "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/upload_manfact_data_23.php",
        { method: "POST", body: formData }
      );
      const data = await res.json();
      if (data.success) {
        alert("File uploaded successfully!");
        setGridData(data.tabData || {});
      } else {
        alert("Upload failed: " + data.message);
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed!");
    }
  };

  // Generate AG Grid columns dynamically
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };
  const getColumnDefs = (data) =>
    data && data.length > 0
      ? Object.keys(data[0]).map((key) => ({
          headerName: key.replace(/_/g, " "),
          field: key,
          flex: 1,
          minWidth: 120, // ensures horizontal scroll
          sortable: true,
          filter: "agTextColumnFilter",
          floatingFilter: true,
          resizable: true,
        }))
      : [];

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

  if (loading && gridData.length === 0) {
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
                <h4 className="mb-0">Manufacturing Data New</h4>
              </Col>
              {/* Action Buttons */}
              <Col xs={12} lg={6}>
                <div className="d-flex justify-content-end gap-2 flex-wrap align-items-center">
                  <ButtonGroup size="sm">
                    <Button variant="success" onClick={handleRefresh}>
                      <i className="bi bi-arrow-clockwise"></i>
                      {!isMobile && " Refresh"}
                    </Button>
                  </ButtonGroup>

                  <ButtonGroup size="sm">
                    <Button variant="success" onClick={downloadExcel}>
                      <i className="bi bi-file-earmark-excel"></i>
                      {!isMobile && " Export CSV"}
                    </Button>
                    <Button variant="info" onClick={autoSizeAll}>
                      <i className="bi bi-arrows-angle-expand"></i>
                      {!isMobile && " Auto Size"}
                    </Button>
                  </ButtonGroup>

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
        <div style={{ height: "10px" }}></div>

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
          {/* Upload Form */}
          <Form onSubmit={handleSubmit}>
            <Accordion defaultActiveKey="0">
              <Accordion.Item eventKey="0">
                <Accordion.Header>Upload Manufacturing Data</Accordion.Header>
                <Accordion.Body>
                  <Row className="align-items-center">
                    <Col md={3}>
                      <Form.Group className="mb-0">
                        <Form.Label>Financial Year</Form.Label>
                        <Select
                          options={options}
                          value={selectedOption}
                          onChange={handleYearChange}
                          placeholder="Select Financial Year..."
                          isClearable
                        />
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group className="mb-0">
                        <Form.Label>Upload Excel File</Form.Label>
                        <Form.Control
                          key={file ? file.name : ""}
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={handleFileChange}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={5} className="d-flex gap-2">
                      <Button
                        type="submit"
                        className="px-4 btn btn-primary btn-sm mt-4"
                      >
                        Submit
                      </Button>
                      <Button
                        type="button"
                        className="px-4 btn btn-danger btn-sm mt-4"
                        onClick={() => {
                          setFile(null);
                          setSelectedOption(null);
                        }}
                      >
                        Reset
                      </Button>
                    </Col>
                  </Row>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Form>
        </Card>
        <div style={{ height: "10px" }}></div>
        {/* Tabs Menu */}
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
              padding: isFullScreen ? 0 : 15,
            }}
          >
            <Tabs
              id="controlled-tab-example"
              activeKey={activeTab}
              onSelect={(tab) => setActiveTab(tab)}
              className="mb-3"
            >
              {tabs.map((tab) => (
                <Tab eventKey={tab} title={tab.replace(/_/g, " ")}>
                  <div
                    key={tab}
                    className="ag-theme-alpine"
                    style={{
                      height: gridHeight,
                      width: "100%",
                      ...(theme === "dark" && {
                        "--ag-background-color": "#212529",
                        "--ag-header-background-color": "#343a40",
                        "--ag-odd-row-background-color": "#2c3034",
                        "--ag-even-row-background-color": "#212529",
                        "--ag-row-hover-color": "#495057",
                        "--ag-foreground-color": "#f8f9fa",
                        "--ag-header-foreground-color": "#f8f9fa",
                        "--ag-border-color": "#495057",
                        "--ag-selected-row-background-color": "#28a745",
                        "--ag-input-background-color": "#343a40",
                        "--ag-input-border-color": "#495057",
                      }),
                    }}
                  >
                    <AgGridReact
                      rowData={gridData[tab]}
                      columnDefs={getColumnDefs(gridData[tab])}
                      defaultColDef={defaultColDef}
                      pagination={true}
                      paginationPageSize={isMobile ? 10 : 20}
                      rowSelection="multiple"
                      suppressMovableColumns={isMobile}
                      enableRangeSelection={!isMobile}
                      rowMultiSelectWithClick={true}
                      animateRows={!isMobile}
                      enableCellTextSelection={true}
                      suppressHorizontalScroll={false}
                      headerHeight={isMobile ? 40 : 48}
                      rowHeight={isMobile ? 35 : 42}
                      onGridReady={(params) => {
                        console.log(" PPC Project Grid is ready");
                        // Auto-size columns after grid is ready
                        setTimeout(() => autoSizeAll(), 500);
                      }}
                    />
                  </div>
                </Tab>
              ))}
            </Tabs>
          </Card.Body>
          <Card.Body
            style={{
              backgroundColor: themeStyles.cardBg,
              padding: isFullScreen ? 0 : 15,
            }}
          >
            {/* Responsive AG Grid Display */}
            {/* {tabs.map(
              (tab) =>
                activeTab === tab &&
                gridData[tab] &&
                gridData[tab].length > 0 && 
            )} */}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}
