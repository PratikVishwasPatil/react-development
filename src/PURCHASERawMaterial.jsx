import React, { useEffect, useMemo, useState, useRef } from "react";
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
} from "ag-grid-community";
import {
  Container,
  Button,
  Row,
  Col,
  Card,
  ButtonGroup,
  Form,
  Tab,
  Tabs,
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
]);

const PURCHASERawMaterial = () => {
  const [theme, setTheme] = useState("light");
  const [rowDataLeftTab, setRowDataLeftTab] = useState([]);
  const [rowDataRightTab, setRowDataRightTab] = useState([]);
  const [columnDefs, setColumnDefs] = useState([]);
  const [isFullScreen, setIsFullScreen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [financialYears, setFinancialYears] = useState([]);
  const [selectedFinancialYearLeftTab, setSelectedFinancialYearLeftTab] =
    useState("");
  const [selectedFinancialYearRightTab, setSelectedFinancialYearRightTab] =
    useState("");
  const [loadingYears, setLoadingYears] = useState(false);
  const gridRefTab1 = useRef(null);
  const gridRefTab2 = useRef(null);
  const tabs = ["File Wise Material Requirement", "File"];
  const [activeTab, setActiveTab] = useState(tabs[0]);

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

  // Fetch Financial Years
  const fetchFinancialYears = async () => {
    setLoadingYears(true);
    try {
      const response = await fetch(
        "http://93.127.167.54/Surya_React/surya_dynamic_api/GetYearsApi.php",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      let yearsData = [];
      if (data.status === "success" && Array.isArray(data.data)) {
        yearsData = data.data;
      } else if (Array.isArray(data)) {
        yearsData = data;
      }

      // Sort financial years in descending order (latest first)
      yearsData.sort((a, b) => {
        const yearA = a.FINANCIAL_YEAR || a.financial_year;
        const yearB = b.FINANCIAL_YEAR || b.financial_year;
        return yearB.localeCompare(yearA);
      });

      setFinancialYears(yearsData);

      // Set latest year (25-26) as default
      if (yearsData.length > 0) {
        setSelectedFinancialYearLeftTab(
          yearsData[0].FINANCIAL_YEAR || yearsData[0].financial_year
        );
        setSelectedFinancialYearRightTab(
          yearsData[0].FINANCIAL_YEAR || yearsData[0].financial_year
        );
      }
    } catch (error) {
      console.error("Error fetching financial years:", error);
      showToast(`Error loading financial years: ${error.message}`, "error");
    } finally {
      setLoadingYears(false);
    }
  };

  // Column definitions
  const generateColumnDefs = () => {
    const baseColumns = [
      {
        headerName: "Sr No",
        field: "serialNumber",
        valueGetter: (params) => (params.node ? params.node.rowIndex + 1 : ""),
        width: isMobile ? 60 : 80,
        minWidth: 50,
        pinned: "left",
        lockPosition: true,
        cellStyle: { fontWeight: "bold", textAlign: "center" },
      },
      {
        field: "FILE_NAME",
        headerName: "File Name",
        width: isMobile ? 200 : 280,
        pinned: "left",
        checkboxSelection: true,
        headerCheckboxSelection: true,
      },
      {
        headerName: "Assign To Purch. Dept. Date",
        field: "timeStamp",
        width: isMobile ? 120 : 200,
        minWidth: isMobile ? 90 : 150,
        valueFormatter: (params) => String(params.value),
      },
      {
        headerName: " Supplier Name",
        field: "Supplier",
        width: isMobile ? 120 : 200,
        minWidth: isMobile ? 90 : 150,
      },
      {
        headerName: "Material Order Date",
        field: "orderDate",
        width: isMobile ? 120 : 200,
        minWidth: isMobile ? 90 : 150,
        valueFormatter: (params) => String(params.value),
      },
      {
        headerName: " Order Status",
        field: "orderstatus",
        width: isMobile ? 120 : 200,
        minWidth: isMobile ? 90 : 150,
      },
      {
        headerName: "Design Excel Uploaded Date",
        field: "exDate",
        width: isMobile ? 120 : 200,
        minWidth: isMobile ? 90 : 150,
        valueFormatter: (params) => String(params.value),
      },
      {
        headerName: "Project Delivery Date",
        field: "lastDispatchDate",
        width: isMobile ? 120 : 200,
        minWidth: isMobile ? 90 : 150,
        valueFormatter: (params) => String(params.value),
      },
    ];

    return baseColumns;
  };

  const rightColDef = [
    {
      headerName: "Sr No",
      field: "serialNumber",
      valueGetter: (params) => (params.node ? params.node.rowIndex + 1 : ""),
      width: isMobile ? 60 : 80,
      minWidth: 50,
      pinned: "left",
      lockPosition: true,
      cellStyle: { fontWeight: "bold", textAlign: "center" },
    },
    {
      field: "FILE_NAME",
      headerName: "File Name",
      width: isMobile ? 120 : 200,
      minWidth: isMobile ? 90 : 150,
      pinned: "left",
      checkboxSelection: true,
      headerCheckboxSelection: true,
    },
    {
      field: "CUSTOMER_NAME",
      headerName: "Customer Name",
      width: isMobile ? 120 : 200,
      minWidth: isMobile ? 90 : 150,
    },
    {
      field: "PRODUCT_NAME",
      headerName: "Product Type",
      width: isMobile ? 120 : 200,
      minWidth: isMobile ? 90 : 150,
    },
    {
      field: "IS_FP_Upload",
      headerName: "FP Upload",
      width: isMobile ? 120 : 200,
      minWidth: isMobile ? 90 : 150,
    },
    {
      headerName: "TIMESTAMP",
      field: "TIMESTAMP",
      width: isMobile ? 120 : 200,
      minWidth: isMobile ? 90 : 150,
      valueFormatter: (params) => String(params.value),
    },
    {
      headerName: "Added By",
      field: "user",
      width: isMobile ? 120 : 200,
      minWidth: isMobile ? 90 : 150,
    },
  ];

  const defaultColDef = useMemo(
    () => ({
      filter: true,
      sortable: true,
      floatingFilter: !isMobile,
      resizable: true,
      suppressMenu: isMobile,
      cellStyle: { textAlign: "right" },
    }),
    [isMobile]
  );

  // Fetch PPC project list data
  const fetchDataLeftTab = async (financialYear) => {
    console.log(selectedFinancialYearLeftTab);

    if (!financialYear) {
      showToast("Please select a financial year", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/get_purchaselistApi.php?financial_year=${financialYear}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === true && Array.isArray(data.data)) {
        setRowDataLeftTab(data.data);
        showToast(
          `Loaded ${data.count} records for FY ${financialYear}`,
          "success"
        );
      } else if (Array.isArray(data)) {
        setRowDataLeftTab(data);
        showToast(
          `Loaded ${data.length} records for FY ${financialYear}`,
          "success"
        );
      } else {
        setRowDataLeftTab([]);
        showToast("No data found for selected financial year", "info");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      showToast(`Error fetching data: ${error.message}`, "error");
      setRowDataLeftTab([]);
    } finally {
      setLoading(false);
    }
  };
  const fetchDataRightTab = async (financialYear) => {
    console.log(selectedFinancialYearRightTab);

    if (!financialYear) {
      showToast("Please select a financial year", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/getexcelUploadFileListApi.php?financial_year=${financialYear}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === true && Array.isArray(data.data)) {
        setRowDataRightTab(data.data);
        showToast(
          `Loaded ${data.count} records for FY ${financialYear}`,
          "success"
        );
      } else if (Array.isArray(data)) {
        setRowDataRightTab(data);
        showToast(
          `Loaded ${data.length} records for FY ${financialYear}`,
          "success"
        );
      } else {
        setRowDataRightTab([]);
        showToast("No data found for selected financial year", "info");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      showToast(`Error fetching data: ${error.message}`, "error");
      setRowDataRightTab([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    console.log("financial years fethcing");

    fetchFinancialYears();
    setColumnDefs(generateColumnDefs());
  }, [isMobile]);

  // Load data when financial year changes
  useEffect(() => {
    console.log("fetching tab1 data");
    if (selectedFinancialYearLeftTab)
      fetchDataLeftTab(selectedFinancialYearLeftTab);
  }, [selectedFinancialYearLeftTab]);
  useEffect(() => {
    console.log("fetching tab2 data");

    if (selectedFinancialYearRightTab)
      fetchDataRightTab(selectedFinancialYearRightTab);
  }, [selectedFinancialYearRightTab]);

  // Handle selection changed - auto navigate
  const onSelectionChanged = (event) => {
    const selectedNodes = event.api.getSelectedNodes();
    const selectedData = selectedNodes.map((node) => node.data);
    setSelectedRows(selectedData);

    if (selectedData.length === 1) {
      const selectedRecord = selectedData[0];

      if (activeTab === tabs[0]) {
        if (!selectedRecord.FILE_ID) {
          showToast("File ID not found in selected record", "error");
          return;
        }

        const detailsUrl = `/#/purchase/purchase_material/raw_material/details/${selectedRecord.FILE_ID}/${selectedRecord.FILE_NAME}`;
        window.open(detailsUrl, "_blank");
      }

      // 🔸 TAB 2 LOGIC
      if (activeTab === tabs[1]) {
        if (!selectedRecord.FILE_ID) {
          showToast("File ID not found in selected record", "error");
          return;
        }

        const detailsUrl = `/#/ppc/electrical/file/details/${selectedRecord.FILE_ID}/${selectedRecord.FILE_NAME}`;
        window.open(detailsUrl, "_blank");
      }
    }
  };

  // Handle financial year change
  const handleFinancialYearChange = (e) => {
    activeTab === tabs[0]
      ? setSelectedFinancialYearLeftTab(e.target.value)
      : setSelectedFinancialYearRightTab(e.target.value);
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // Export to CSV
  const downloadExcel = () => {
    const api =
      activeTab === tabs[0] ? gridRefTab1.current : gridRefTab2.current;
    if (!api) return;

    try {
      const params = {
        fileName: `PurchaseRowMaterial_${activeTab}_${
          new Date().toISOString().split("T")[0]
        }.csv`,
        allColumns: true,
        onlySelected: false,
      };
      api.exportDataAsCsv(params);
      showToast("Data exported successfully!", "success");
    } catch (error) {
      console.error("Error exporting data:", error);
      showToast("Error exporting data", "error");
    }
  };

  // Auto size columns
  const autoSizeAll = () => {
    const api =
      activeTab === tabs[0] ? gridRefTab1.current : gridRefTab2.current;
    if (!api) return;

    try {
      setTimeout(() => {
        const allColumnIds =
          api.getColumns()?.map((column) => column.getId()) || [];
        if (allColumnIds.length > 0) {
          api.autoSizeColumns(allColumnIds, false);
        }
      }, 100);
    } catch (error) {
      console.error("Error auto-sizing columns:", error);
    }
  };

  // Refresh data
  const handleRefresh = () => {
    console.log(activeTab);
    activeTab === tabs[0]
      ? fetchDataLeftTab(selectedFinancialYearLeftTab)
      : fetchDataRightTab(selectedFinancialYearRightTab);

    showToast("Refreshing data...", "info");
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

  if (
    (loading && rowDataLeftTab.length === 0) ||
    rowDataRightTab.length === 0
  ) {
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
          <p className="mt-3">Loading projects...</p>
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
                <h4 className="mb-0">Raw Material</h4>
                <small style={{ opacity: 0.8 }}>
                  {selectedRows.length > 0 &&
                    ` | ${selectedRows.length} selected`}
                </small>
              </Col>

              <Col xs={12} lg={6}>
                <div className="d-flex justify-content-end gap-2 flex-wrap align-items-center">
                  {/* Financial Year Selector */}
                  <Form.Select
                    value={
                      activeTab === tabs[0]
                        ? selectedFinancialYearLeftTab
                        : selectedFinancialYearRightTab
                    }
                    onChange={handleFinancialYearChange}
                    style={{ width: "auto", minWidth: "120px" }}
                    size="sm"
                  >
                    {financialYears.map((option) => (
                      <option
                        key={option.financial_year}
                        value={option.financial_year}
                      >
                        FY {option.financial_year}
                      </option>
                    ))}
                  </Form.Select>

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

          {/* Grid Body */}
          <Card.Body
            style={{
              backgroundColor: themeStyles.cardBg,
              padding: isFullScreen ? 0 : 15,
            }}
          >
            {rowDataLeftTab.length === 0 || rowDataRightTab.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "50px",
                  color: themeStyles.color,
                }}
              >
                <i
                  className="bi bi-bar-chart"
                  style={{ fontSize: "3rem", marginBottom: "20px" }}
                ></i>

                <h5>No project data available</h5>

                <p>
                  Please select a different financial year or check your API
                  connection.
                </p>

                <ButtonGroup size="sm">
                  <Button variant="success" onClick={handleRefresh}>
                    <i className="bi bi-arrow-clockwise"></i>
                    {!isMobile && " Refresh"}
                  </Button>
                </ButtonGroup>
              </div>
            ) : (
              <Tabs
                id="controlled-tab-example"
                activeKey={activeTab}
                onSelect={(tab) => setActiveTab(tab)}
                className="mb-3"
              >
                <Tab eventKey={tabs[0]} title={tabs[0]}>
                  <div
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
                      rowData={rowDataLeftTab}
                      columnDefs={columnDefs}
                      defaultColDef={defaultColDef}
                      pagination
                      paginationPageSize={isMobile ? 10 : 20}
                      rowSelection="multiple"
                      onSelectionChanged={onSelectionChanged}
                      suppressMovableColumns={isMobile}
                      enableRangeSelection={!isMobile}
                      rowMultiSelectWithClick
                      animateRows={!isMobile}
                      enableCellTextSelection
                      suppressHorizontalScroll={false}
                      headerHeight={isMobile ? 40 : 48}
                      rowHeight={isMobile ? 35 : 42}
                      onGridReady={(p) => {
                        gridRefTab1.current = p.api;
                        setTimeout(autoSizeAll, 500);
                      }}
                    />
                  </div>
                </Tab>
                <Tab eventKey={tabs[1]} title={tabs[1]}>
                  <div
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
                      rowData={rowDataRightTab}
                      columnDefs={rightColDef}
                      defaultColDef={defaultColDef}
                      pagination
                      paginationPageSize={isMobile ? 10 : 20}
                      rowSelection="multiple"
                      onSelectionChanged={onSelectionChanged}
                      suppressMovableColumns={isMobile}
                      enableRangeSelection={!isMobile}
                      rowMultiSelectWithClick
                      animateRows={!isMobile}
                      enableCellTextSelection
                      suppressHorizontalScroll={false}
                      headerHeight={isMobile ? 40 : 48}
                      rowHeight={isMobile ? 35 : 42}
                      onGridReady={(p) => {
                        gridRefTab2.current = p.api;
                        setTimeout(autoSizeAll, 500);
                      }}
                    />
                  </div>
                </Tab>
              </Tabs>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default PURCHASERawMaterial;
