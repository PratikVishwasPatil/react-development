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

const TotalStatusBar = (props) => {
  const { basic, grand } = props;

  return (
    <div
      style={{
        display: "flex",
        gap: "30px",
        padding: "6px 12px",
        fontWeight: 600,
        alignItems: "center",
      }}
    >
      <span>TOTAL</span>
      <span>Basic: {basic.toFixed(2)}</span>
      <span>Grand: {grand.toFixed(2)}</span>
    </div>
  );
};
const COMPANY_URL = {
  Surya: "/#/purchase/raised_po/details/surya",
  Vividh: "/#/purchase/raised_po/details/vividh",
  Susham: "/#/purchase/raised_po/details/susham",
};
const PURCHASERaisedPO = () => {
  const [theme, setTheme] = useState("light");
  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([]);
  const [isFullScreen, setIsFullScreen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [financialYears, setFinancialYears] = useState([]);
  const [selectedFinancialYear, setSelectedFinancialYear] = useState("");
  const [loadingYears, setLoadingYears] = useState(false);
  const [totals, setTotals] = useState({ basic: 0, grand: 0 });
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const gridRef = useRef();

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

  const getFYDateRange = (fy) => {
    if (!fy) return { min: "", max: "" };

    // Extract years safely
    const match = fy.match(/(\d{2,4})\s*-\s*(\d{2,4})/);
    if (!match) return { min: "", max: "" };

    let startYear = match[1];
    let endYear = match[2];

    // Convert 2-digit years → 4-digit
    if (startYear.length === 2) startYear = `20${startYear}`;
    if (endYear.length === 2) endYear = `20${endYear}`;

    return {
      min: `${startYear}-04-01`,
      max: `${endYear}-03-31`,
    };
  };

  const toDateObj = (dateStr) => {
    if (!dateStr) return null;

    // Handle DD-MM-YYYY or DD/MM/YYYY
    if (dateStr.includes("-") || dateStr.includes("/")) {
      const parts = dateStr.split(/[-/]/);
      if (parts[0].length === 2) {
        // DD-MM-YYYY
        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      }
    }

    // ISO fallback
    return new Date(dateStr);
  };

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
        setSelectedFinancialYear(
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
        field: "supplier_name",
        headerName: "Supplier Name",
        width: isMobile ? 200 : 280,
        pinned: "left",
        checkboxSelection: true,
        headerCheckboxSelection: true,
      },

      {
        headerName: " Company",
        field: "company",
        width: isMobile ? 120 : 200,
        minWidth: isMobile ? 90 : 150,
      },
      {
        headerName: " PO No",
        field: "po_id",
        width: isMobile ? 120 : 200,
        minWidth: isMobile ? 90 : 150,
      },
      {
        headerName: "PO Date",
        field: "po_date",
        width: isMobile ? 120 : 200,
        minWidth: isMobile ? 90 : 150,
        valueFormatter: (params) => String(params.value),
      },
      {
        headerName: " Basic Amount",
        field: "basic_amount",
        width: isMobile ? 120 : 200,
        minWidth: isMobile ? 90 : 150,
      },
      {
        headerName: " Grand Amount",
        field: "grand_amount",
        width: isMobile ? 120 : 200,
        minWidth: isMobile ? 90 : 150,
      },
      {
        headerName: " File Details",
        field: "files",
        width: isMobile ? 120 : 200,
        minWidth: isMobile ? 90 : 150,
      },
      {
        headerName: " Category",
        field: "category",
        width: isMobile ? 120 : 200,
        minWidth: isMobile ? 90 : 150,
      },
      {
        headerName: " Action",
        field: "approval_status",
        width: isMobile ? 120 : 200,
        minWidth: isMobile ? 90 : 150,
      },
    ];

    return baseColumns;
  };

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

  const fetchPPCProjectData = async (financialYear) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/getRaisedPoListApi.php?year=${financialYear}`,
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
        setRowData(data.data);
        const totalsCalc = calculateTotals(data.data || data);
        setTotals(totalsCalc);

        showToast(
          `Loaded ${data.data.length} records for FY ${financialYear}`,
          "success"
        );
      } else if (Array.isArray(data)) {
        setRowData(data);

        showToast(
          `Loaded ${data.length} records for FY ${financialYear}`,
          "success"
        );
      } else {
        setRowData([]);

        showToast("No data found for selected file", "info");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      showToast(`Error fetching data: ${error.message}`, "error");
      setRowData([]);
    } finally {
      setLoading(false);
    }
  };
  const filteredRowData = useMemo(() => {
    if (!fromDate || !toDate) return rowData;

    const from = new Date(fromDate);
    const to = new Date(toDate);

    return rowData.filter((row) => {
      if (!row.po_date) return false;

      const poDate = toDateObj(row.po_date);
      if (!poDate || isNaN(poDate)) return false;

      return poDate >= from && poDate <= to;
    });
  }, [rowData, fromDate, toDate]);

  const calculateTotals = (data) => {
    return data.reduce(
      (acc, row) => {
        acc.basic += Number(row.basic_amount || 0);
        acc.grand += Number(row.grand_amount || 0);
        return acc;
      },
      { basic: 0, grand: 0 }
    );
  };

  // Initial load
  useEffect(() => {
    setColumnDefs(generateColumnDefs());
    fetchFinancialYears();
  }, [isMobile]);

  // Load data when financial year changes
  useEffect(() => {
    if (selectedFinancialYear) {
      fetchPPCProjectData(selectedFinancialYear);
    }
  }, [selectedFinancialYear]);

  // Handle selection changed - auto navigate
  const onSelectionChanged = (event) => {
    const selectedNodes = event.api.getSelectedNodes();
    const selectedData = selectedNodes.map((node) => node.data);
    setSelectedRows(selectedData);

    if (selectedData.length === 1) {
      const selectedRecord = selectedData[0];

      if (!selectedRecord.po_id) {
        showToast("File ID not found in selected record", "error");
        return;
      }

      // Open details page in new tab

      const baseUrl = COMPANY_URL[selectedRecord.company];
      if (!baseUrl) return;

      window.open(
        `${baseUrl}/${selectedRecord.supplier_id}/${selectedRecord.po_id}`,
        "_blank"
      );
    }
  };

  // Handle financial year change
  const handleFinancialYearChange = (e) => {
    setSelectedFinancialYear(e.target.value);
    setFromDate("");
    setToDate("");
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // Export to CSV
  const downloadExcel = () => {
    if (!gridRef.current?.api) return;

    try {
      const params = {
        fileName: `ReceivedMaterialList_${selectedFinancialYear}_${
          new Date().toISOString().split("T")[0]
        }.csv`,
        allColumns: true,
        onlySelected: false,
      };
      gridRef.current.api.exportDataAsCsv(params);
      showToast("Data exported successfully!", "success");
    } catch (error) {
      console.error("Error exporting data:", error);
      showToast("Error exporting data", "error");
    }
  };

  // Auto size columns
  const autoSizeAll = () => {
    if (!gridRef.current?.api) return;

    try {
      setTimeout(() => {
        const allColumnIds =
          gridRef.current.api.getColumns()?.map((column) => column.getId()) ||
          [];
        if (allColumnIds.length > 0) {
          gridRef.current.api.autoSizeColumns(allColumnIds, false);
        }
      }, 100);
    } catch (error) {
      console.error("Error auto-sizing columns:", error);
    }
  };

  // Refresh data
  const handleRefresh = () => {
    if (selectedFinancialYear) {
      fetchPPCProjectData(selectedFinancialYear);
      showToast("Refreshing data...", "info");
    }
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
                <h4 className="mb-0">Raised Purchase Order</h4>

                <small style={{ opacity: 0.8 }}>
                  {`${rowData.length} records found`}
                  {selectedRows.length > 0 &&
                    ` | ${selectedRows.length} selected`}
                </small>

                {/* DATE FILTERS */}
                <Row className="mt-2 g-2">
                  <Col xs={12} sm={6}>
                    <Form.Group controlId="fromDate">
                      <Form.Label
                        style={{ fontSize: "12px", marginBottom: "2px" }}
                      >
                        From Date
                      </Form.Label>
                      <Form.Control
                        type="date"
                        size="sm"
                        value={fromDate}
                        min={getFYDateRange(selectedFinancialYear).min}
                        max={getFYDateRange(selectedFinancialYear).max}
                        onChange={(e) => {
                          setFromDate(e.target.value);
                          setToDate("");
                        }}
                      />
                    </Form.Group>
                  </Col>

                  <Col xs={12} sm={6}>
                    <Form.Group controlId="toDate">
                      <Form.Label
                        style={{ fontSize: "12px", marginBottom: "2px" }}
                      >
                        To Date
                      </Form.Label>
                      <Form.Control
                        type="date"
                        size="sm"
                        value={toDate}
                        disabled={!fromDate}
                        min={fromDate}
                        max={getFYDateRange(selectedFinancialYear).max}
                        onChange={(e) => setToDate(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Col>

              <Col xs={12} lg={6}>
                <div className="d-flex justify-content-end gap-2 flex-wrap align-items-center">
                  {/* Financial Year Selector */}
                  <Form.Select
                    value={selectedFinancialYear}
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
            {rowData.length === 0 ? (
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
                  ref={gridRef}
                  rowData={filteredRowData}
                  columnDefs={columnDefs}
                  defaultColDef={defaultColDef}
                  pagination={true}
                  paginationPageSize={isMobile ? 10 : 20}
                  rowSelection="single"
                  onSelectionChanged={onSelectionChanged}
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
                <div
                  style={{
                    position: "sticky",
                    bottom: 0,
                    zIndex: 10,
                    background: theme === "dark" ? "#212529" : "#f1f8f4",
                    borderTop: "2px solid #28a745",
                    padding: isMobile ? "10px 12px" : "8px 16px",
                    fontWeight: 600,

                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    alignItems: isMobile ? "flex-start" : "center",
                    justifyContent: isMobile ? "center" : "flex-end",
                    gap: isMobile ? "6px" : "40px",
                  }}
                >
                  <span
                    style={{
                      fontSize: isMobile ? "14px" : "inherit",
                    }}
                  >
                    TOTAL
                  </span>

                  <span
                    style={{
                      fontSize: isMobile ? "13px" : "inherit",
                    }}
                  >
                    Basic: ₹{totals.basic.toFixed(2)}
                  </span>

                  <span
                    style={{
                      fontSize: isMobile ? "13px" : "inherit",
                    }}
                  >
                    Grand: ₹{totals.grand.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default PURCHASERaisedPO;
