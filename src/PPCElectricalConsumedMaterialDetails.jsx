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
  NumberEditorModule,
  ClientSideRowModelApiModule,
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
  ColumnApiModule,
  NumberEditorModule,
  ClientSideRowModelApiModule,
]);

const PPCElectricalConsumedMaterialDetails = () => {
  const [theme, setTheme] = useState("light");
  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([]);
  const [isFullScreen, setIsFullScreen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const gridRef = useRef();
  const { fileId, fileName } = useParams();
  const gridApiRef = useRef(null);
  const columnApiRef = useRef(null);
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

  // save function
  // action button function
  const handleSave = (params) => {
    const rowData = params.data;
    console.log("Saving row:", rowData);

    // Call your API here
  };

  // print function
  //   function handlePrintGrid() {
  //     const api = gridApiRef.current;
  //     const columnApi = columnApiRef.current;

  //     if (!api || !columnApi) {
  //       alert("Grid not ready yet");
  //       return;
  //     }

  //     // 1. Disable row virtualization (Official way)
  //     api.setDomLayout && api.setDomLayout("print");
  //     // if setDomLayout not available, fallback:
  //     if (api.refreshClientSideRowModel) {
  //       api.refreshClientSideRowModel("everything");
  //     }

  //     // 2. Expand width = sum of all column widths
  //     const allColumns = columnApi.getAllGridColumns();
  //     const totalWidth = allColumns.reduce(
  //       (sum, col) => sum + col.getActualWidth(),
  //       0
  //     );

  //     const gridDiv = document.querySelector(".ag-theme-alpine");
  //     const originalWidth = gridDiv.style.width;

  //     gridDiv.style.width = totalWidth + "px";

  //     setTimeout(() => {
  //       const gridHtml = gridDiv.outerHTML;

  //       const newWindow = window.open("", "_blank", "width=1200,height=800");

  //       newWindow.document.write(`
  //       <html>
  //       <head>
  //         <title>Print Grid</title>
  //         <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ag-grid-community/styles/ag-grid.css" />
  //         <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ag-grid-community/styles/ag-theme-alpine.css" />
  //         <style>
  //           body { margin: 20px; font-family: Arial; }
  //         </style>
  //       </head>
  //       <body>
  //         <h2>Grid Data</h2>
  //         ${gridHtml}
  //         <script>
  //           window.onload = function() {
  //             window.print();
  //           };
  //         </script>
  //       </body>
  //       </html>
  //     `);

  //       newWindow.document.close();

  //       // 3. Restore the original layout
  //       setTimeout(() => {
  //         api.setDomLayout && api.setDomLayout(null);
  //         gridDiv.style.width = originalWidth;
  //         api.refreshClientSideRowModel &&
  //           api.refreshClientSideRowModel("everything");
  //       }, 500);
  //     }, 300);
  //   }

  const onCellValueChanged = (params) => {
    if (params.colDef.field === "assignQty" && gridApi) {
      const updatedRow = params.data;
      gridApi.applyTransaction({
        update: [updatedRow],
      });
    }
  };

  //   const handleReturnData = async () => {
  //     try {
  //       const api = gridApiRef.current;

  //       if (!api) {
  //         alert("Grid not ready yet");
  //         return;
  //       }
  //       const shortName = sessionStorage.getItem("shortname");

  //       if (!shortName) {
  //         alert("User not logged in. Please login first.");
  //         return;
  //       }

  //       const dataToSend = [];

  //       api.forEachNode((node) => {
  //         if (node.data.returningQty > 0) {
  //           dataToSend.push({
  //             fileId,
  //             type: "Ele",
  //             materialId: node.data.material_id,
  //             return_qty: String(node.data.returningQty),
  //             shortName: shortName,
  //           });
  //           //   dataToSend.push({
  //           //     fileId,
  //           //     type: "Ele",
  //           //     material_id: [node.data.material_id],
  //           //     return_qty: [String(node.data.returningQty)],
  //           //     shortName: shortName,
  //           //   });
  //         }
  //       });

  //       if (dataToSend.length === 0) {
  //         alert("No items selected for return");
  //         return;
  //       }

  //       console.log("Sending payload:", dataToSend);
  //       const response = await fetch(
  //         "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/ElectReturnDataApi.php",
  //         {
  //           method: "POST",
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //           body: JSON.stringify({
  //             // you already have this from useParams()
  //             ...dataToSend,
  //           }),
  //         }
  //       );

  //       const result = await response.json();

  //       if (result.status === "success") {
  //         showToast("Material return request submitted", "success");
  //       } else {
  //         showToast(result.message || "Failed to submit return", "error");
  //       }
  //     } catch (error) {
  //       console.error(error);
  //       showToast("API Error: " + error.message, "error");
  //     }
  //   };

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
        headerName: "Material ID",
        field: "materialID",
        width: isMobile ? 200 : 250,
        pinned: "left",
        valueFormatter: (params) => String(params.value),
      },
      {
        headerName: "Material Description",
        field: "materialName",
        width: isMobile ? 160 : 190,
        pinned: "left",
      },
      {
        headerName: "Unit",
        field: "unit",
        width: isMobile ? 150 : 180,
      },
      {
        headerName: "Required Quantity",
        field: "qty",
        width: isMobile ? 150 : 180,
      },

      {
        headerName: "Received  Quantity",
        field: "stockQty",
        width: isMobile ? 50 : 180,
      },
      {
        headerName: "Consumed Quantity",
        field: "consumedQty",
        width: isMobile ? 150 : 180,

        cellRenderer: (params) => {
          return params.value || 0;
        },
      },

      {
        headerName: " Pending Quantity",
        field: "pendingQty",
        width: isMobile ? 150 : 180,
      },
      {
        headerName: " Assign Material (qty)",
        field: "assignQty",
        width: isMobile ? 150 : 180,
        editable: (params) => params.data.stockQty > 0, // LOGIC: Only editable if Received > 0
        singleClickEdit: true,
        cellEditor: "agTextCellEditor",

        valueParser: (params) => {
          const v = Number(params.newValue);
          return isNaN(v) ? "" : v;
        },

        valueSetter: (params) => {
          const newValue = Number(params.newValue);
          const currentStock = Number(params.data.stockQty);
          const previousAssignQty = Number(params.data.assignQty) || 0;
          const initialConsumedQty = Number(params.data.consumedQty) || 0;
          const delta = newValue - previousAssignQty; // The change in quantity

          if (isNaN(newValue) || newValue < 0) {
            alert(`Please enter a valid positive number.`);
            return false;
          }

          if (newValue > currentStock) {
            alert(
              `You cannot assign more than the received quantity (${currentStock})`
            );
            return false;
          }

          params.data.assignQty = newValue;

          params.data.consumedQty = initialConsumedQty + delta;
          return true;
        },
      },
      {
        headerName: "Action",
        field: "save",
        width: 120,
        cellRenderer: (params) => {
          return (
            <ButtonGroup size="sm">
              <Button variant="success" onClick={() => handleSave(params)}>
                save
              </Button>
            </ButtonGroup>
          );
        },
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
  const fetchPPCProjectData = async (fileId) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/ConsumedMaterialDetailsApi.php?fileId=${fileId}`,
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

      if (data.status === "success" && Array.isArray(data.data)) {
        const list = data.data;
        setRowData(list);

        showToast(
          `Loaded ${list.length} records for File Name ${fileName}`,
          "success"
        );
      } else if (Array.isArray(data)) {
        setRowData(data);

        showToast(`Loaded ${data.length} records for File ID `, "success");
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
    fetchPPCProjectData(fileId);
  }, [isMobile]);

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
        fileName: `ReceivedMaterialList_${
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
    fetchPPCProjectData(fileId);
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
                <h4 className="mb-0">Electrical Consumed Material Details </h4>
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
            {/* <Row className="align-items-center">
              <Col xs={12} lg={3} className="mb-2 mb-lg-0">
                <ButtonGroup size="sm">
                  <Button className="btn btn-primary" onClick={handlePrintGrid}>
                    {!isMobile && " Print Data"}
                  </Button>
                </ButtonGroup>
              </Col> 
              <Col xs={12} lg={3} className="mb-2 mb-lg-0">
                <ButtonGroup size="sm">
                  <Button
                    className="btn btn-primary"
                    onClick={handleReturnData}
                  >
                    {!isMobile && " Return Data"}
                  </Button>
                </ButtonGroup>
              </Col>
            </Row> */}
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
                <p>Please Check your API connection.</p>
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
                  onCellValueChanged={onCellValueChanged}
                  suppressMovableColumns={isMobile}
                  enableRangeSelection={!isMobile}
                  animateRows={!isMobile}
                  enableCellTextSelection={true}
                  suppressHorizontalScroll={false}
                  headerHeight={isMobile ? 40 : 48}
                  rowHeight={isMobile ? 35 : 42}
                  onGridReady={(params) => {
                    console.log("PPC Project Grid is ready");
                    autoSizeAll();
                    gridApiRef.current = params.api;
                    columnApiRef.current = params.columnApi;
                    // store APIs for later use
                    setGridApi(params.api);
                    setGridColumnApi(params.columnApi);
                    // // also keep ag-grid ref in sync (gridRef is used in other places)
                    // if (gridRef.current == null) {
                    //   gridRef.current = {};
                    // }
                    // gridRef.current.api = params.api;
                    // gridRef.current.columnApi = params.columnApi;

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

export default PPCElectricalConsumedMaterialDetails;
