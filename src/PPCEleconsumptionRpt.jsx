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
import {
  Container,
  Button,
  Row,
  Col,
  Card,
  ButtonGroup,
  Form,
} from "react-bootstrap";
import "react-toastify/dist/ReactToastify.css";
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

const PPCEleconsumptionRpt = () => {
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
  const [newMake, setNewMake] = useState("");
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
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
  useEffect(() => {
    if (rowData.length > 0) {
      setTimeout(() => autoSizeAll(), 200);
    }
  }, [rowData]);
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

  // Fetch Filename with ID
  const fetchFinancialYears = async () => {
    setLoadingYears(true);
    try {
      const response = await fetch(
        "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/GetYearsApi.php",
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
      }

      // Sort by FILE_NAME
      yearsData.sort((a, b) =>
        b.financial_year.localeCompare(a.financial_year)
      );

      setFinancialYears(yearsData);

      // Set default selected file
      if (yearsData.length > 0) {
        setSelectedFinancialYear(yearsData[0].financial_year);
      }
    } catch (error) {
      console.error("Error fetching financial years:", error);
      showToast(`Error loading file names: ${error.message}`, "error");
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
        headerName: "File Name",
        field: "fname",

        width: isMobile ? 200 : 280,
        pinned: "left",
        cellStyle: { fontWeight: "bold" },
      },
      {
        headerName: "Material Name",
        field: "mname",

        width: isMobile ? 200 : 280,
        pinned: "left",
        cellStyle: { fontWeight: "bold" },
      },
      {
        headerName: "Make",
        field: "make",

        width: isMobile ? 200 : 280,

        cellStyle: { fontWeight: "bold" },
      },
      {
        headerName: "FILE Qty",
        field: "fqty",

        width: isMobile ? 200 : 280,

        cellStyle: { fontWeight: "bold" },
      },
      // {
      //     headerName: "Date",
      //     field: "cqty",

      //     width: isMobile ? 200 : 280,

      //     cellStyle: { fontWeight: 'bold' }
      // },
      {
        headerName: "Consumed  Qty",
        field: "cqty",

        width: isMobile ? 200 : 280,

        cellStyle: { fontWeight: "bold" },
      },
      {
        headerName: "Rate",
        field: "rate",

        width: isMobile ? 200 : 280,

        cellStyle: { fontWeight: "bold" },
      },
      {
        headerName: " Amount",
        field: "amount",

        width: isMobile ? 200 : 280,

        cellStyle: { fontWeight: "bold" },
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
      cellStyle: { textAlign: "left" },
    }),
    [isMobile]
  );

  // Fetch PPC project list data
  const fetchPPCProjectData = async (financialYear) => {
    if (!financialYear) {
      showToast("Please select a financial year", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/get_EleConsumption_23.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            financial_year: selectedFinancialYear, // sending selected FILE ID
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "success" && Array.isArray(data.data)) {
        const list = data.data;
        setRowData(list);

        showToast(
          `Loaded ${list.length} records for File ID ${selectedFinancialYear}`,
          "success"
        );
      } else if (Array.isArray(data)) {
        setRowData(data);

        showToast(
          `Loaded ${data.length} records for File ID ${selectedFinancialYear}`,
          "success"
        );
      } else {
        setRowData([]);
        showToast("No data found for the selected file", "info");
      }
    } catch (error) {
      console.error("Error fetching PPC project data:", error);
      showToast(`Error fetching data: ${error.message}`, "error");
      setRowData([]);
    } finally {
      setLoading(false);
    }
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

      if (!selectedRecord.financial_year) {
        showToast("File  not found in selected record", "error");
        return;
      }

      // Open details page in new tab
      const detailsUrl = `/ppc-received-material/details/${selectedRecord.FILE_ID}`;
      window.open(detailsUrl, "_blank");
    }
  };

  // Handle financial year change
  const handleFinancialYearChange = (selectedOption) => {
    setSelectedFinancialYear(selectedOption.value);
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
                <h4 className="mb-0">Electrical consumption Report</h4>
                <small style={{ opacity: 0.8 }}>
                  {`${rowData.length} records found`}
                  {selectedRows.length > 0 &&
                    ` | ${selectedRows.length} selected`}
                </small>
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
                <h5>No data available</h5>
                <p>
                  Please select a different financial year or check your API
                  connection.
                </p>
                <button
                  onClick={handleRefresh}
                  style={{
                    padding: "0.5rem 1rem",
                    fontSize: "1rem",
                    borderRadius: "0.25rem",
                    border: "none",
                    backgroundColor: "#007bff",
                    color: "white",
                    cursor: "pointer",
                    marginTop: "1rem",
                  }}
                >
                  🔄 Refresh Data
                </button>
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
                  rowData={rowData}
                  columnDefs={columnDefs}
                  defaultColDef={defaultColDef}
                  pagination={true}
                  paginationPageSize={isMobile ? 10 : 20}
                  // rowSelection="multiple"
                  // onSelectionChanged={onSelectionChanged}
                  suppressMovableColumns={isMobile}
                  enableRangeSelection={!isMobile}
                  rowMultiSelectWithClick={true}
                  animateRows={!isMobile}
                  enableCellTextSelection={true}
                  suppressHorizontalScroll={false}
                  headerHeight={isMobile ? 40 : 48}
                  rowHeight={isMobile ? 35 : 42}
                  onGridReady={(params) => {
                    console.log("PPC Project Grid is ready");
                    // store APIs for later use
                    setGridApi(params.api);
                    setGridColumnApi(params.columnApi);
                    // also keep ag-grid ref in sync (gridRef is used in other places)
                    if (gridRef.current == null) {
                      gridRef.current = {};
                    }
                    gridRef.current.api = params.api;
                    gridRef.current.columnApi = params.columnApi;

                    // auto-size after small delay (lets rows/cols render)
                    setTimeout(() => autoSizeAll(params.columnApi), 250);
                  }}
                />
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default PPCEleconsumptionRpt;
