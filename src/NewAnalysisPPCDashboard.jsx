// import React, { useEffect, useMemo, useState, useRef } from "react";
// import { AgGridReact } from "ag-grid-react";
// import "ag-grid-community/styles/ag-theme-alpine.css";
// import { ModuleRegistry, PinnedRowModule } from "ag-grid-community";
// import {
//   ClientSideRowModelModule,
//   ValidationModule,
//   DateFilterModule,
//   NumberFilterModule,
//   TextFilterModule,
//   RowSelectionModule,
//   PaginationModule,
//   CsvExportModule,
// } from "ag-grid-community";
// import {
//   Container,
//   Button,
//   Row,
//   Col,
//   Card,
//   ButtonGroup,
//   Form,
// } from "react-bootstrap";

// import "bootstrap-icons/font/bootstrap-icons.css";

// ModuleRegistry.registerModules([
//   ClientSideRowModelModule,
//   ValidationModule,
//   DateFilterModule,
//   NumberFilterModule,
//   TextFilterModule,
//   RowSelectionModule,
//   PaginationModule,
//   CsvExportModule,
//   PinnedRowModule,
// ]);

// const NewAnalysisPPCDashboard = () => {
//   const [theme, setTheme] = useState("light");
//   const [rowData, setRowData] = useState([]);
//   const [columnDefs, setColumnDefs] = useState([]);
//   const [isFullScreen, setIsFullScreen] = useState(true);
//   const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
//   const [loading, setLoading] = useState(false);
//   const [selectedRows, setSelectedRows] = useState([]);
//   const [financialYears, setFinancialYears] = useState([]);
//   const [selectedFinancialYear, setSelectedFinancialYear] = useState("25-26");
//   const [loadingYears, setLoadingYears] = useState(false);
//   const [pinnedBottomRowData, setPinnedBottomRowData] = useState([]);

//   const gridRef = useRef();

//   // Toast notification function
//   const showToast = (message, type = "info") => {
//     const toastDiv = document.createElement("div");
//     toastDiv.style.cssText = `
//       position: fixed;
//       top: 20px;
//       right: 20px;
//       padding: 15px 25px;
//       background: ${
//         type === "success"
//           ? "#28a745"
//           : type === "error"
//             ? "#dc3545"
//             : "#17a2b8"
//       };
//       color: white;
//       border-radius: 5px;
//       box-shadow: 0 4px 6px rgba(0,0,0,0.2);
//       z-index: 9999;
//       font-family: Arial, sans-serif;
//       animation: slideIn 0.3s ease-out;
//     `;
//     toastDiv.textContent = message;
//     document.body.appendChild(toastDiv);

//     setTimeout(() => {
//       toastDiv.style.animation = "slideOut 0.3s ease-out";
//       setTimeout(() => document.body.removeChild(toastDiv), 300);
//     }, 3000);
//   };

//   // Add animation styles
//   useEffect(() => {
//     const style = document.createElement("style");
//     style.textContent = `
//       @keyframes slideIn {
//         from { transform: translateX(400px); opacity: 0; }
//         to { transform: translateX(0); opacity: 1; }
//       }
//       @keyframes slideOut {
//         from { transform: translateX(0); opacity: 1; }
//         to { transform: translateX(400px); opacity: 0; }
//       }
//     `;
//     document.head.appendChild(style);
//     return () => document.head.removeChild(style);
//   }, []);

//   // Handle window resize
//   useEffect(() => {
//     const handleResize = () => {
//       setIsMobile(window.innerWidth <= 768);
//     };
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   // Number formatter with Indian locale
//   const numberFormatter = (params) => {
//     if (
//       params.value === null ||
//       params.value === undefined ||
//       params.value === ""
//     ) {
//       return "";
//     }
//     const num = Number(params.value);
//     if (isNaN(num)) return params.value;
//     return num.toLocaleString("en-IN");
//   };

//   // Fetch Financial Years
//   const fetchFinancialYears = async () => {
//     setLoadingYears(true);
//     try {
//       const response = await fetch(
//         "http://93.127.167.54/Surya_React/surya_dynamic_api/GetYearsApi.php",
//         {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//           },
//         },
//       );

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();

//       let yearsData = [];
//       if (data.status === "success" && Array.isArray(data.data)) {
//         yearsData = data.data;
//       } else if (Array.isArray(data)) {
//         yearsData = data;
//       }

//       // Sort financial years in descending order
//       yearsData.sort((a, b) => {
//         const yearA = a.FINANCIAL_YEAR || a.financial_year;
//         const yearB = b.FINANCIAL_YEAR || b.financial_year;
//         return yearB.localeCompare(yearA);
//       });

//       setFinancialYears(yearsData);

//       // Set default year
//       if (yearsData.length > 0) {
//         setSelectedFinancialYear(
//           yearsData[0].FINANCIAL_YEAR || yearsData[0].financial_year,
//         );
//       }
//     } catch (error) {
//       console.error("Error fetching financial years:", error);
//       showToast(`Error loading financial years: ${error.message}`, "error");
//     } finally {
//       setLoadingYears(false);
//     }
//   };

//   // Calculate totals for pinned bottom row
//   const calculateTotals = (data) => {
//     const totals = {
//       file_name: "TOTAL",
//       sheet_metal: 0,
//       champion_sheet_metal: 0,
//       foundation_fab: 0,
//       assembly_amt: 0,
//       other_vendor: 0,
//       second_dc: 0,
//       totalRow: 0,
//       mktg_labour_cost: 0,
//       ppc_labour_cost: 0,
//       adjustment_cost: 0,
//       calculated_cost: 0,
//       isTotal: true,
//     };

//     data.forEach((row) => {
//       totals.sheet_metal += Number(row.sheet_metal) || 0;
//       totals.champion_sheet_metal += Number(row.champion_sheet_metal) || 0;
//       totals.foundation_fab += Number(row.foundation_fab) || 0;
//       totals.assembly_amt += Number(row.assembly_amt) || 0;
//       totals.other_vendor += Number(row.other_vendor) || 0;
//       totals.second_dc += Number(row.second_dc) || 0;
//       totals.totalRow += Number(row.totalRow) || 0;
//       totals.mktg_labour_cost += Number(row.mktg_labour_cost) || 0;
//       totals.ppc_labour_cost += Number(row.ppc_labour_cost) || 0;
//       totals.adjustment_cost += Number(row.adjustment_cost) || 0;
//       totals.calculated_cost += Number(row.calculated_cost) || 0;
//     });

//     return totals;
//   };

//   // Column definitions
//   const generateColumnDefs = () => {
//     const baseColumns = [
//       {
//         headerName: "Sr No",
//         field: "serialNumber",
//         valueGetter: (params) => {
//           if (params.data?.isTotal) return "";
//           return params.node ? params.node.rowIndex + 1 : "";
//         },
//         minWidth: 80,
//         pinned: "left",
//         lockPosition: true,
//         cellStyle: { textAlign: "center" },
//       },
//       {
//         field: "file_name",
//         headerName: "File Name",
//         minWidth: 200,
//         pinned: "left",
//         checkboxSelection: (params) => !params.data?.isTotal,
//         headerCheckboxSelection: true,
//         flex: 1,
//       },
//       {
//         field: "sheet_metal",
//         headerName: "Susham Sheet Metal",
//         minWidth: 130,
//         valueFormatter: numberFormatter,
//       },
//       {
//         field: "champion_sheet_metal",
//         headerName: "Champion Sheet Metal",
//         minWidth: 180,
//         valueFormatter: numberFormatter,
//       },
//       {
//         field: "foundation_fab",
//         headerName: "Foundation Fab",
//         minWidth: 150,
//         valueFormatter: numberFormatter,
//       },
//       {
//         field: "assembly_amt",
//         headerName: "Assembly Amount",
//         minWidth: 150,
//         valueFormatter: numberFormatter,
//       },
//       {
//         field: "other_vendor",
//         headerName: "Other Vendor",
//         minWidth: 140,
//         valueFormatter: numberFormatter,
//       },
//       {
//         field: "second_dc",
//         headerName: "Second DC",
//         minWidth: 120,
//         valueFormatter: numberFormatter,
//       },
//       {
//         field: "totalRow",
//         headerName: "Total Row",
//         minWidth: 130,
//         valueFormatter: numberFormatter,
//       },
//       {
//         field: "mktg_labour_cost",
//         headerName: "Mktg Labour Cost",
//         minWidth: 160,
//         valueFormatter: numberFormatter,
//       },
//       {
//         field: "ppc_labour_cost",
//         headerName: "PPC Labour Cost",
//         minWidth: 160,
//         valueFormatter: numberFormatter,
//       },
//       {
//         field: "adjustment_cost",
//         headerName: "Adjustment Cost",
//         minWidth: 150,
//         valueFormatter: numberFormatter,
//       },
//       {
//         field: "calculated_cost",
//         headerName: "Calculated Cost",
//         minWidth: 150,
//         valueFormatter: numberFormatter,
//       },
//       {
//         field: "comment",
//         headerName: "Comment",
//         minWidth: 200,
//         flex: 1,
//       },
//     ];

//     return baseColumns;
//   };

//   const defaultColDef = useMemo(
//     () => ({
//       filter: true,
//       sortable: true,
//       floatingFilter: !isMobile,
//       resizable: true,
//       suppressMenu: isMobile,
//       autoHeaderHeight: true,
//       wrapHeaderText: true,
//       cellStyle: (params) => {
//         const baseStyle = {};

//         // Numeric fields that should be right-aligned
//         const numericFields = [
//           "sheet_metal",
//           "champion_sheet_metal",
//           "foundation_fab",
//           "assembly_amt",
//           "other_vendor",
//           "second_dc",
//           "totalRow",
//           "mktg_labour_cost",
//           "ppc_labour_cost",
//           "adjustment_cost",
//           "calculated_cost",
//         ];

//         if (numericFields.includes(params.colDef.field)) {
//           baseStyle.textAlign = "right";
//         } else {
//           baseStyle.textAlign = "left";
//         }

//         // Highlight total row
//         if (params.data?.isTotal) {
//           return {
//             ...baseStyle,
//             fontWeight: "bold",
//             backgroundColor: theme === "dark" ? "#1f3d2b" : "#e9f7ef",
//             borderTop: "2px solid #28a745",
//             borderLeft: "1px solid #dee2e6",
//             borderRight: "1px solid #dee2e6",
//           };
//         }

//         return baseStyle;
//       },
//     }),
//     [isMobile, theme],
//   );

//   // Fetch PPC Dashboard Data
//   const fetchPPCDashboardData = async (financialYear) => {
//     setLoading(true);
//     try {
//       const response = await fetch(
//         `http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/dashboard/get_ppc_dashboard_analysis_Api.php?financial_year=${financialYear}`,
//         {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//           },
//         },
//       );

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();

//       if (data.data && Array.isArray(data.data)) {
//         setRowData(data.data);

//         // Calculate and set pinned bottom row
//         const totals = calculateTotals(data.data);
//         setPinnedBottomRowData([totals]);

//         showToast(
//           `Loaded ${data.data.length} records for FY ${financialYear}`,
//           "success",
//         );
//       } else if (Array.isArray(data)) {
//         setRowData(data);

//         const totals = calculateTotals(data);
//         setPinnedBottomRowData([totals]);

//         showToast(
//           `Loaded ${data.length} records for FY ${financialYear}`,
//           "success",
//         );
//       } else {
//         setRowData([]);
//         setPinnedBottomRowData([]);
//         showToast("No data found for selected financial year", "info");
//       }
//     } catch (error) {
//       console.error("Error fetching data:", error);
//       showToast(`Error fetching data: ${error.message}`, "error");
//       setRowData([]);
//       setPinnedBottomRowData([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Initial load
//   useEffect(() => {
//     setColumnDefs(generateColumnDefs());
//     fetchFinancialYears();
//   }, [isMobile]);

//   // Load data when financial year changes
//   useEffect(() => {
//     if (selectedFinancialYear) {
//       fetchPPCDashboardData(selectedFinancialYear);
//     }
//   }, [selectedFinancialYear]);

//   // Handle financial year change
//   const handleFinancialYearChange = (e) => {
//     setSelectedFinancialYear(e.target.value);
//   };

//   const toggleTheme = () => {
//     setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
//   };

//   const toggleFullScreen = () => {
//     setIsFullScreen(!isFullScreen);
//   };

//   // Export to CSV
//   const downloadExcel = () => {
//     if (!gridRef.current?.api) return;

//     try {
//       const params = {
//         fileName: `PPC_Dashboard_Analysis_${selectedFinancialYear}_${
//           new Date().toISOString().split("T")[0]
//         }.csv`,
//         allColumns: true,
//         onlySelected: false,
//       };
//       gridRef.current.api.exportDataAsCsv(params);
//       showToast("Data exported successfully!", "success");
//     } catch (error) {
//       console.error("Error exporting data:", error);
//       showToast("Error exporting data", "error");
//     }
//   };

//   // Auto size columns
//   const autoSizeAll = () => {
//     if (!gridRef.current?.api) return;

//     try {
//       setTimeout(() => {
//         const allColumnIds =
//           gridRef.current.api.getColumns()?.map((column) => column.getId()) ||
//           [];
//         if (allColumnIds.length > 0) {
//           gridRef.current.api.autoSizeColumns(allColumnIds, false);
//         }
//       }, 100);
//     } catch (error) {
//       console.error("Error auto-sizing columns:", error);
//     }
//   };

//   // Refresh data
//   const handleRefresh = () => {
//     if (selectedFinancialYear) {
//       fetchPPCDashboardData(selectedFinancialYear);
//       showToast("Refreshing data...", "info");
//     }
//   };

//   // Theme styles
//   const getThemeStyles = () => {
//     if (theme === "dark") {
//       return {
//         backgroundColor: "linear-gradient(135deg, #21262d 0%, #161b22 100%)",
//         color: "#f8f9fa",
//         cardBg: "#343a40",
//         cardHeader: "linear-gradient(135deg, #495057 0%, #343a40 100%)",
//       };
//     }
//     return {
//       backgroundColor: "linear-gradient(135deg, #f8f9ff 0%, #e6f3ff 100%)",
//       color: "#212529",
//       cardBg: "#ffffff",
//       cardHeader: "linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%)",
//     };
//   };

//   const themeStyles = getThemeStyles();
//   const gridHeight = isFullScreen
//     ? "calc(100vh - 240px)"
//     : isMobile
//       ? "400px"
//       : "600px";

//   // Apply theme to document body
//   useEffect(() => {
//     document.body.style.background = themeStyles.backgroundColor;
//     document.body.style.color = themeStyles.color;
//     document.body.style.minHeight = "100vh";

//     return () => {
//       document.body.style.background = "";
//       document.body.style.color = "";
//       document.body.style.minHeight = "";
//     };
//   }, [theme]);

//   if (loading && rowData.length === 0) {
//     return (
//       <div
//         style={{
//           minHeight: "100vh",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           background: themeStyles.backgroundColor,
//         }}
//       >
//         <div style={{ textAlign: "center", color: themeStyles.color }}>
//           <div
//             className="spinner-border"
//             role="status"
//             style={{ width: "3rem", height: "3rem" }}
//           >
//             <span className="visually-hidden">Loading...</span>
//           </div>
//           <p className="mt-3">Loading PPC Dashboard Analysis...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div
//       style={{
//         minHeight: "100vh",
//         background: themeStyles.backgroundColor,
//         color: themeStyles.color,
//         padding: 0,
//         margin: 0,
//       }}
//     >
//       <Container fluid={isFullScreen}>
//         <Card
//           style={{
//             backgroundColor: themeStyles.cardBg,
//             color: themeStyles.color,
//             border:
//               theme === "dark" ? "1px solid #495057" : "1px solid #dee2e6",
//             margin: isFullScreen ? 0 : 20,
//             borderRadius: isFullScreen ? 0 : 8,
//           }}
//         >
//           {/* Header */}
//           <Card.Header
//             style={{
//               background: themeStyles.cardHeader,
//               color: theme === "dark" ? "#ffffff" : "#000000",
//               fontFamily: "'Maven Pro', sans-serif",
//               padding: "1rem 2rem",
//             }}
//           >
//             <Row className="align-items-center">
//               <Col xs={12} lg={6} className="mb-2 mb-lg-0">
//                 <h4 className="mb-0">PPC Dashboard Analysis</h4>
//                 <small style={{ opacity: 0.8 }}>
//                   {`${rowData.length} records found`}
//                   {selectedRows.length > 0 &&
//                     ` | ${selectedRows.length} selected`}
//                 </small>
//               </Col>

//               <Col xs={12} lg={6}>
//                 <div className="d-flex justify-content-end gap-2 flex-wrap align-items-center">
//                   {/* Financial Year Selector */}
//                   <Form.Select
//                     value={selectedFinancialYear}
//                     onChange={handleFinancialYearChange}
//                     style={{ width: "auto", minWidth: "120px" }}
//                     size="sm"
//                   >
//                     {financialYears.map((option) => (
//                       <option
//                         key={option.financial_year}
//                         value={option.financial_year}
//                       >
//                         FY {option.financial_year}
//                       </option>
//                     ))}
//                   </Form.Select>

//                   <ButtonGroup size="sm">
//                     <Button variant="success" onClick={handleRefresh}>
//                       <i className="bi bi-arrow-clockwise"></i>
//                       {!isMobile && " Refresh"}
//                     </Button>
//                   </ButtonGroup>

//                   <ButtonGroup size="sm">
//                     <Button variant="success" onClick={downloadExcel}>
//                       <i className="bi bi-file-earmark-excel"></i>
//                       {!isMobile && " Export CSV"}
//                     </Button>
//                     <Button variant="info" onClick={autoSizeAll}>
//                       <i className="bi bi-arrows-angle-expand"></i>
//                       {!isMobile && " Auto Size"}
//                     </Button>
//                   </ButtonGroup>

//                   <ButtonGroup size="sm">
//                     <Button variant="outline-light" onClick={toggleFullScreen}>
//                       <i
//                         className={`bi ${
//                           isFullScreen ? "bi-fullscreen-exit" : "bi-fullscreen"
//                         }`}
//                       ></i>
//                       {!isMobile && (isFullScreen ? " Exit" : " Full")}
//                     </Button>
//                     <Button variant="outline-light" onClick={toggleTheme}>
//                       {theme === "light" ? "🌙" : "☀️"}
//                       {!isMobile && (theme === "light" ? " Dark" : " Light")}
//                     </Button>
//                   </ButtonGroup>
//                 </div>
//               </Col>
//             </Row>
//           </Card.Header>

//           {/* Grid Body */}
//           <Card.Body
//             style={{
//               backgroundColor: themeStyles.cardBg,
//               padding: isFullScreen ? 0 : 15,
//             }}
//           >
//             {rowData.length === 0 ? (
//               <div
//                 style={{
//                   textAlign: "center",
//                   padding: "50px",
//                   color: themeStyles.color,
//                 }}
//               >
//                 <i
//                   className="bi bi-bar-chart"
//                   style={{ fontSize: "3rem", marginBottom: "20px" }}
//                 ></i>
//                 <h5>No data available</h5>
//                 <p>
//                   Please select a different financial year or check your API
//                   connection.
//                 </p>
//                 <ButtonGroup size="sm">
//                   <Button variant="success" onClick={handleRefresh}>
//                     <i className="bi bi-arrow-clockwise"></i>
//                     {!isMobile && " Refresh"}
//                   </Button>
//                 </ButtonGroup>
//               </div>
//             ) : (
//               <div
//                 className="ag-theme-alpine"
//                 style={{
//                   height: gridHeight,
//                   width: "100%",
//                   ...(theme === "dark" && {
//                     "--ag-background-color": "#212529",
//                     "--ag-header-background-color": "#343a40",
//                     "--ag-odd-row-background-color": "#2c3034",
//                     "--ag-even-row-background-color": "#212529",
//                     "--ag-row-hover-color": "#495057",
//                     "--ag-foreground-color": "#f8f9fa",
//                     "--ag-header-foreground-color": "#f8f9fa",
//                     "--ag-border-color": "#495057",
//                     "--ag-selected-row-background-color": "#28a745",
//                     "--ag-input-background-color": "#343a40",
//                     "--ag-input-border-color": "#495057",
//                   }),
//                 }}
//               >
//                 <AgGridReact
//                   ref={gridRef}
//                   rowData={rowData}
//                   columnDefs={columnDefs}
//                   defaultColDef={defaultColDef}
//                   pinnedBottomRowData={pinnedBottomRowData}
//                   pagination={true}
//                   paginationPageSize={isMobile ? 10 : 20}
//                   rowSelection="multiple"
//                   suppressMovableColumns={isMobile}
//                   enableRangeSelection={!isMobile}
//                   rowMultiSelectWithClick={true}
//                   animateRows={!isMobile}
//                   enableCellTextSelection={true}
//                   suppressHorizontalScroll={false}
//                   headerHeight={isMobile ? 40 : 48}
//                   rowHeight={isMobile ? 35 : 42}
//                   onGridReady={(params) => {
//                     console.log("PPC Dashboard Grid is ready");
//                     setTimeout(() => autoSizeAll(), 500);
//                   }}
//                   onSelectionChanged={(event) => {
//                     const selectedNodes = event.api.getSelectedNodes();
//                     const selectedData = selectedNodes.map((node) => node.data);
//                     setSelectedRows(selectedData);
//                   }}
//                 />
//               </div>
//             )}
//           </Card.Body>
//         </Card>
//       </Container>
//     </div>
//   );
// };

// export default NewAnalysisPPCDashboard;

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

const NewAnalysisPPCDashboard = () => {
  const [theme, setTheme] = useState("light");
  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([]);
  const [isFullScreen, setIsFullScreen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [financialYears, setFinancialYears] = useState([]);
  const [selectedFinancialYear, setSelectedFinancialYear] = useState("25-26");
  const [loadingYears, setLoadingYears] = useState(false);
  const [pinnedBottomRowData, setPinnedBottomRowData] = useState([]);
  const [savingRows, setSavingRows] = useState(new Set());

  const gridRef = useRef();

  // Get user details from session storage
  const getUserDetails = () => {
    const shortName = sessionStorage.getItem("shortname") || "";
    const employeeId = sessionStorage.getItem("userId") || "";
    return { shortName, employeeId };
  };

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

  // Number formatter with Indian locale
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

  // Handle Save Row
  const handleSaveRow = async (params) => {
    if (!params.data || params.data.isTotal) return;

    const rowId = params.data.file_id;

    // Check if already saving
    if (savingRows.has(rowId)) {
      showToast("Save already in progress for this row", "info");
      return;
    }

    const { shortName, employeeId } = getUserDetails();

    if (!shortName || !employeeId) {
      showToast("User details not found", "error");
      return;
    }

    // Mark as saving
    setSavingRows((prev) => new Set(prev).add(rowId));

    const payload = {
      shortName: shortName,
      employee_id: employeeId,
      FILE_ID: params.data.file_id,
      FILE_NAME: params.data.file_name,
      sheet_metal: Number(params.data.sheet_metal) || 0,
      foundation_fab: Number(params.data.foundation_fab) || 0,
      champion_sheet_metal: Number(params.data.champion_sheet_metal) || 0,
      assembly_amt: Number(params.data.assembly_amt) || 0,
      other_vendor: Number(params.data.other_vendor) || 0,
      second_dc: Number(params.data.second_dc) || 0,
      totalRow: Number(params.data.totalRow) || 0,
      adjustment_cost: Number(params.data.adjustment_cost) || 0,
      calculated_cost: Number(params.data.calculated_cost) || 0,
      comment: params.data.comment || "",
    };

    try {
      const response = await fetch(
        "http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/dashboard/savePpcDashboardAnalysisApi.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status || result.success) {
        showToast(
          `Data saved successfully for ${params.data.file_name}`,
          "success",
        );

        // Mark row as saved (you can add visual feedback if needed)
        params.node.setDataValue("lastSaved", new Date().toISOString());

        // Refresh data to get latest totals
        fetchPPCDashboardData(selectedFinancialYear);
      } else {
        throw new Error(result.message || "Save failed");
      }
    } catch (error) {
      console.error("Error saving data:", error);
      showToast(`Error saving data: ${error.message}`, "error");
    } finally {
      // Remove from saving set
      setSavingRows((prev) => {
        const newSet = new Set(prev);
        newSet.delete(rowId);
        return newSet;
      });
    }
  };

  // Save button cell renderer
  const SaveButtonRenderer = (params) => {
    if (params.data?.isTotal) return null;

    const rowId = params.data?.file_id;
    const isSaving = savingRows.has(rowId);

    return (
      <button
        className="btn btn-sm btn-success"
        disabled={isSaving}
        onClick={() => handleSaveRow(params)}
        style={{
          opacity: isSaving ? 0.5 : 1,
          cursor: isSaving ? "not-allowed" : "pointer",
          width: isMobile ? "40px" : "70px",
          padding: isMobile ? "4px" : "6px 12px",
          fontSize: isMobile ? "14px" : "inherit",
        }}
      >
        {isSaving ? (
          isMobile ? (
            <span
              className="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
          ) : (
            <>
              <span
                className="spinner-border spinner-border-sm me-1"
                role="status"
                aria-hidden="true"
              ></span>
              Saving...
            </>
          )
        ) : isMobile ? (
          <i className="bi bi-save"></i>
        ) : (
          <>
            <i className="bi bi-save me-1"></i>
            Save
          </>
        )}
      </button>
    );
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
        },
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

      // Sort financial years in descending order
      yearsData.sort((a, b) => {
        const yearA = a.FINANCIAL_YEAR || a.financial_year;
        const yearB = b.FINANCIAL_YEAR || b.financial_year;
        return yearB.localeCompare(yearA);
      });

      setFinancialYears(yearsData);

      // Set default year
      if (yearsData.length > 0) {
        setSelectedFinancialYear(
          yearsData[0].FINANCIAL_YEAR || yearsData[0].financial_year,
        );
      }
    } catch (error) {
      console.error("Error fetching financial years:", error);
      showToast(`Error loading financial years: ${error.message}`, "error");
    } finally {
      setLoadingYears(false);
    }
  };

  // Calculate totals for pinned bottom row
  const calculateTotals = (data) => {
    const totals = {
      file_name: "TOTAL",
      sheet_metal: 0,
      champion_sheet_metal: 0,
      foundation_fab: 0,
      assembly_amt: 0,
      other_vendor: 0,
      second_dc: 0,
      totalRow: 0,
      mktg_labour_cost: 0,
      ppc_labour_cost: 0,
      adjustment_cost: 0,
      calculated_cost: 0,
      isTotal: true,
    };

    data.forEach((row) => {
      totals.sheet_metal += Number(row.sheet_metal) || 0;
      totals.champion_sheet_metal += Number(row.champion_sheet_metal) || 0;
      totals.foundation_fab += Number(row.foundation_fab) || 0;
      totals.assembly_amt += Number(row.assembly_amt) || 0;
      totals.other_vendor += Number(row.other_vendor) || 0;
      totals.second_dc += Number(row.second_dc) || 0;
      totals.totalRow += Number(row.totalRow) || 0;
      totals.mktg_labour_cost += Number(row.mktg_labour_cost) || 0;
      totals.ppc_labour_cost += Number(row.ppc_labour_cost) || 0;
      totals.adjustment_cost += Number(row.adjustment_cost) || 0;
      totals.calculated_cost += Number(row.calculated_cost) || 0;
    });

    return totals;
  };

  // Column definitions
  const generateColumnDefs = () => {
    const baseColumns = [
      {
        headerName: "Sr No",
        field: "serialNumber",
        valueGetter: (params) => {
          if (params.data?.isTotal) return "";
          return params.node ? params.node.rowIndex + 1 : "";
        },
        minWidth: 80,
        pinned: "left",
        lockPosition: true,
        cellStyle: { textAlign: "center" },
      },
      {
        field: "file_name",
        headerName: "File Name",
        minWidth: 200,
        pinned: "left",
        checkboxSelection: (params) => !params.data?.isTotal,
        headerCheckboxSelection: true,
        flex: 1,
      },
      {
        field: "sheet_metal",
        headerName: "Susham Sheet Metal",
        minWidth: 130,
        valueFormatter: numberFormatter,
      },
      {
        field: "champion_sheet_metal",
        headerName: "Champion Sheet Metal",
        minWidth: 180,
        valueFormatter: numberFormatter,
      },
      {
        field: "foundation_fab",
        headerName: "Foundation Fab",
        minWidth: 150,
        valueFormatter: numberFormatter,
      },
      {
        field: "assembly_amt",
        headerName: "Assembly Amount",
        minWidth: 150,
        valueFormatter: numberFormatter,
      },
      {
        field: "other_vendor",
        headerName: "Other Vendor",
        minWidth: 140,
        valueFormatter: numberFormatter,
      },
      {
        field: "second_dc",
        headerName: "Second DC",
        minWidth: 120,
        valueFormatter: numberFormatter,
      },
      {
        field: "totalRow",
        headerName: "Total Row",
        minWidth: 130,
        valueFormatter: numberFormatter,
      },
      {
        field: "mktg_labour_cost",
        headerName: "Mktg Labour Cost",
        minWidth: 160,
        valueFormatter: numberFormatter,
      },
      {
        field: "ppc_labour_cost",
        headerName: "PPC Labour Cost",
        minWidth: 160,
        valueFormatter: numberFormatter,
      },
      {
        field: "adjustment_cost",
        headerName: "Adjustment Cost",
        minWidth: 150,
        valueFormatter: numberFormatter,
        editable: (params) => !params.data?.isTotal,
        cellStyle: (params) => {
          const baseStyle = { textAlign: "right" };
          if (!params.data?.isTotal) {
            baseStyle.backgroundColor =
              theme === "dark" ? "#2d3748" : "#fff3cd";
            baseStyle.cursor = "pointer";
          }
          return baseStyle;
        },
      },
      {
        field: "calculated_cost",
        headerName: "Calculated Cost",
        minWidth: 150,
        valueFormatter: numberFormatter,
      },
      {
        field: "comment",
        headerName: "Comment",
        minWidth: 200,
        flex: 1,
        editable: (params) => !params.data?.isTotal,
        cellStyle: (params) => {
          const baseStyle = { textAlign: "left" };
          if (!params.data?.isTotal) {
            baseStyle.backgroundColor =
              theme === "dark" ? "#2d3748" : "#fff3cd";
            baseStyle.cursor = "pointer";
          }
          return baseStyle;
        },
      },
      {
        headerName: "Action",
        field: "action",
        minWidth: isMobile ? 60 : 120,
        width: isMobile ? 60 : 120,
        maxWidth: isMobile ? 60 : 120,
        pinned: "right",
        lockPosition: true,
        suppressSizeToFit: true,
        cellRenderer: SaveButtonRenderer,
        cellStyle: {
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: isMobile ? "2px" : "8px",
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
      autoHeaderHeight: true,
      wrapHeaderText: true,
      cellStyle: (params) => {
        const baseStyle = {};

        // Numeric fields that should be right-aligned
        const numericFields = [
          "sheet_metal",
          "champion_sheet_metal",
          "foundation_fab",
          "assembly_amt",
          "other_vendor",
          "second_dc",
          "totalRow",
          "mktg_labour_cost",
          "ppc_labour_cost",
          "adjustment_cost",
          "calculated_cost",
        ];

        if (numericFields.includes(params.colDef.field)) {
          baseStyle.textAlign = "right";
        } else {
          baseStyle.textAlign = "left";
        }

        // Highlight total row
        if (params.data?.isTotal) {
          return {
            ...baseStyle,
            fontWeight: "bold",
            backgroundColor: theme === "dark" ? "#1f3d2b" : "#e9f7ef",
            borderTop: "2px solid #28a745",
            borderLeft: "1px solid #dee2e6",
            borderRight: "1px solid #dee2e6",
          };
        }

        return baseStyle;
      },
    }),
    [isMobile, theme],
  );

  // Fetch PPC Dashboard Data
  const fetchPPCDashboardData = async (financialYear) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/dashboard/get_ppc_dashboard_analysis_Api.php?financial_year=${financialYear}`,
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

      if (data.data && Array.isArray(data.data)) {
        setRowData(data.data);

        // Calculate and set pinned bottom row
        const totals = calculateTotals(data.data);
        setPinnedBottomRowData([totals]);

        showToast(
          `Loaded ${data.data.length} records for FY ${financialYear}`,
          "success",
        );
      } else if (Array.isArray(data)) {
        setRowData(data);

        const totals = calculateTotals(data);
        setPinnedBottomRowData([totals]);

        showToast(
          `Loaded ${data.length} records for FY ${financialYear}`,
          "success",
        );
      } else {
        setRowData([]);
        setPinnedBottomRowData([]);
        showToast("No data found for selected financial year", "info");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      showToast(`Error fetching data: ${error.message}`, "error");
      setRowData([]);
      setPinnedBottomRowData([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    setColumnDefs(generateColumnDefs());
    fetchFinancialYears();
  }, [isMobile, theme, savingRows]);

  // Load data when financial year changes
  useEffect(() => {
    if (selectedFinancialYear) {
      fetchPPCDashboardData(selectedFinancialYear);
    }
  }, [selectedFinancialYear]);

  // Handle financial year change
  const handleFinancialYearChange = (e) => {
    setSelectedFinancialYear(e.target.value);
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
        fileName: `PPC_Dashboard_Analysis_${selectedFinancialYear}_${
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
      fetchPPCDashboardData(selectedFinancialYear);
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
          <p className="mt-3">Loading PPC Dashboard Analysis...</p>
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
                <h4 className="mb-0">PPC Dashboard Analysis</h4>
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
                <h5>No data available</h5>
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
                  rowData={rowData}
                  columnDefs={columnDefs}
                  defaultColDef={defaultColDef}
                  pinnedBottomRowData={pinnedBottomRowData}
                  pagination={true}
                  paginationPageSize={isMobile ? 10 : 20}
                  rowSelection="single"
                  suppressMovableColumns={isMobile}
                  enableRangeSelection={!isMobile}
                  rowMultiSelectWithClick={true}
                  animateRows={!isMobile}
                  enableCellTextSelection={true}
                  suppressHorizontalScroll={false}
                  headerHeight={isMobile ? 40 : 48}
                  rowHeight={isMobile ? 35 : 42}
                  onGridReady={(params) => {
                    console.log("PPC Dashboard Grid is ready");
                    setTimeout(() => autoSizeAll(), 500);
                  }}
                  onSelectionChanged={(event) => {
                    const selectedNodes = event.api.getSelectedNodes();
                    const selectedData = selectedNodes.map((node) => node.data);
                    setSelectedRows(selectedData);
                  }}
                  onCellValueChanged={(params) => {
                    console.log("Cell value changed:", params);
                    // You can add visual feedback here if needed
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

export default NewAnalysisPPCDashboard;
