import React, { useEffect, useMemo, useState, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { ModuleRegistry, PinnedRowModule } from "ag-grid-community";
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
import { useParams } from "react-router-dom";

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  ValidationModule,
  DateFilterModule,
  NumberFilterModule,
  TextFilterModule,
  RowSelectionModule,
  PaginationModule,
  CsvExportModule,
  PinnedRowModule,
]);

const NewAnalysisAccountVsProjectAnalysis = () => {
  const [theme, setTheme] = useState("light");
  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([]);
  const [isFullScreen, setIsFullScreen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

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

  const numberFormatter = (params) => {
    if (
      params.value === null ||
      params.value === undefined ||
      params.value === ""
    ) {
      return "";
    }
    const num = Number(params.value);
    if (isNaN(num)) return params.value;
    return num.toLocaleString("en-IN"); 
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
        cellStyle: { textAlign: "center" },
      },
      {
        field: "pono",
        headerName: "PO No",
        width: isMobile ? 200 : "auto",
        pinned: "left",
      },
      {
        field: "file_name",
        headerName: "Material File Name",
        width: isMobile ? 200 : "auto",
      },
      {
        field: "l_file_name",
        headerName: "Labour File Name",
        width: isMobile ? 200 : "auto",
      },
      {
        field: "mpo",
        headerName: "Material PO",
        width: isMobile ? 200 : "auto",
        valueFormatter: numberFormatter,
      },
      {
        field: "lpo",
        headerName: "Labour PO",
        width: isMobile ? 200 : "auto",
        valueFormatter: numberFormatter,
      },
      {
        field: "totpo",
        headerName: "Total PO",
        width: isMobile ? 200 : "auto",
        valueFormatter: numberFormatter,
      },
      {
        field: "saleinv",
        headerName: "Sales (Billing TO Customer)invc",
        width: isMobile ? 200 : "auto",
        valueFormatter: numberFormatter,
      },
      {
        field: "labInv",
        headerName: "Labour Invc",
        width: isMobile ? 200 : "auto",
        valueFormatter: numberFormatter,
      },
      {
        field: "mktg_material_cost",
        headerName: "Marketing Material Cost Allowed",
        width: isMobile ? 200 : "auto",
        valueFormatter: numberFormatter,
      },
      {
        field: "actualmatconsump",
        headerName: "ERP Material Consumption",
        width: isMobile ? 200 : "auto",
        valueFormatter: numberFormatter,
      },
      {
        field: "mktg_labour_cost",
        headerName: "Marketing Labour Cost",
        width: isMobile ? 200 : "auto",
        valueFormatter: numberFormatter,
      },
      {
        field: "labpur",
        headerName: "A/C Labour Purchase (PPC Labour Work)",
        width: isMobile ? 200 : "auto",
        valueFormatter: numberFormatter,
      },
      {
        field: "labpoactcost",
        headerName: "ERP Labour Cost",
        width: isMobile ? 200 : "auto",
        valueFormatter: numberFormatter,
      },
      {
        field: "mktg_allowed_site_expe",
        headerName: "Marketing Allowed Site Expenses",
        width: isMobile ? 200 : "auto",
        valueFormatter: numberFormatter,
      },
      {
        field: "laboursite",
        headerName: "A/C Labour Site Expenses",
        width: isMobile ? 200 : "auto",
        valueFormatter: numberFormatter,
      },
      {
        field: "siteexp",
        headerName: "ERP Site Actual Expenses",
        width: isMobile ? 200 : "auto",
        valueFormatter: numberFormatter,
      },
      {
        field: "mktg_trasport_cost",
        headerName: "Marketing Allowed Transport Cost",
        width: isMobile ? 200 : "auto",
        valueFormatter: numberFormatter,
      },
      {
        field: "carriout",
        headerName:
          "A/C Transport Caarriage outward (transport outside to customer)",
        width: isMobile ? 200 : "auto",
        valueFormatter: numberFormatter,
      },
      {
        field: "transport",
        headerName: "ERP Transport Cost",
        width: isMobile ? 200 : "auto",
        valueFormatter: numberFormatter,
      },
      {
        field: "totalhamali",
        headerName: "Hamali Loading + Unloading",
        width: isMobile ? 200 : "auto",
        valueFormatter: numberFormatter,
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
      cellStyle: (params) => {
        const numericFields = [
          "mpo",
          "lpo",
          "totpo",
          "saleinv",
          "labInv",
          "mktg_material_cost",
          "actualmatconsump",
          "mktg_labour_cost",
          "labpur",
          "labpoactcost",
          "mktg_allowed_site_expe",
          "laboursite",
          "siteexp",
          "mktg_trasport_cost",
          "carriout",
          "transport",
          "totalhamali",
        ];

        if (numericFields.includes(params.colDef.field)) {
          return { textAlign: "right" };
        }
        return { textAlign: "left" };
      },
    }),
    [isMobile],
  );

  // Fetch PPC project list data

  const fetchPPCProjectData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/new_analysis/getaccountsvcpasApi.php`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status && Array.isArray(data.data)) {
        setRowData(data.data);

        showToast(`Loaded ${data.data.length} records `, "success");
      } else if (Array.isArray(data)) {
        setRowData(data.data);

        showToast(`Loaded ${data.length} records `, "success");
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

  // Initial load
  useEffect(() => {
    setColumnDefs(generateColumnDefs());
    fetchPPCProjectData();
  }, [isMobile]);

  // Handle selection changed - auto navigate
  // const onSelectionChanged = (event) => {
  //   const selectedNodes = event.api.getSelectedNodes();
  //   const selectedData = selectedNodes.map((node) => node.data);
  //   setSelectedRows(selectedData);

  //   if (selectedData.length === 1) {
  //     const selectedRecord = selectedData[0];

  //     if (!selectedRecord.po_id) {
  //       showToast("File ID not found in selected record", "error");
  //       return;
  //     }

  //     // Open details page in new tab

  //     const baseUrl = COMPANY_URL[selectedRecord.company];
  //     if (!baseUrl) return;

  //     window.open(
  //       `${baseUrl}/${selectedRecord.supplier_id}/${selectedRecord.po_id}`,
  //       "_blank",
  //     );
  //   }
  // };

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
        fileName: `Project_analysis${
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
    fetchPPCProjectData();
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
                <h4 className="mb-0">Accounts Vs Project Analysis</h4>

                <small style={{ opacity: 0.8 }}>
                  {`${rowData.length} records found`}
                  {selectedRows.length > 0 &&
                    ` | ${selectedRows.length} selected`}
                </small>
              </Col>

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
                  rowData={rowData}
                  columnDefs={columnDefs}
                  defaultColDef={defaultColDef}
                  pagination={true}
                  paginationPageSize={isMobile ? 10 : 20}
                  rowSelection="single"
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
                    setTimeout(() => autoSizeAll(), 500);
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

export default NewAnalysisAccountVsProjectAnalysis;
