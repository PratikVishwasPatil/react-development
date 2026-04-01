// import React, { useEffect, useMemo, useState, useRef } from "react";
// import { AgGridReact } from "ag-grid-react";
// import "ag-grid-community/styles/ag-theme-alpine.css";
// import { ModuleRegistry } from "ag-grid-community";
// import { ClientSideRowModelModule, CsvExportModule } from "ag-grid-community";
// import {
//   Container,
//   Button,
//   Row,
//   Col,
//   Card,
//   ButtonGroup,
// } from "react-bootstrap";
// import { useParams } from "react-router-dom";

// ModuleRegistry.registerModules([ClientSideRowModelModule, CsvExportModule]);

// /* ---------------- HELPERS ---------------- */

// const buildColumnDefsFromApi = (headers) =>
//   headers.map((h) => ({
//     headerName: h,
//     field: h,
//     minWidth: 120,
//     resizable: true,
//     sortable: false,
//     filter: false,
//   }));

// const transformUdlApiResponse = (apiResponse) => {
//   const { headers, rows } = apiResponse;

//   const rowData = rows.map((row) => {
//     const obj = {};
//     let highlightRow = false;

//     row.forEach((cell, index) => {
//       obj[headers[index]] = cell.value;
//       if (cell.highlight) highlightRow = true;
//     });

//     obj._highlight = highlightRow;
//     return obj;
//   });

//   return {
//     columnDefs: buildColumnDefsFromApi(headers),
//     rowData,
//   };
// };

// /* ---------------- COMPONENT ---------------- */

// const PURCHASEUdlDetails = () => {
//   const { fileId, fileName } = useParams();

//   const [rowData, setRowData] = useState([]);
//   const [columnDefs, setColumnDefs] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [isFullScreen, setIsFullScreen] = useState(true);
//   const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
//   const gridRef = useRef();

//   /* ---------------- FETCH DATA ---------------- */

//   const fetchUdlStickerData = async (fid) => {
//     if (!fid) return;

//     setLoading(true);
//     try {
//       const res = await fetch(
//         `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/getUdlStickerMaterialApi.php?fileId=${fid}`
//       );
//       const data = await res.json();

//       if (data.status === true) {
//         const transformed = transformUdlApiResponse(data);
//         setColumnDefs(transformed.columnDefs);
//         setRowData(transformed.rowData);
//       } else {
//         setRowData([]);
//       }
//     } catch (err) {
//       console.error("UDL fetch error:", err);
//       setRowData([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (fileId) {
//       fetchUdlStickerData(fileId);
//     }
//   }, [fileId]);

//   /* ---------------- GRID UTILS ---------------- */

//   // Refresh data
//   const handleRefresh = () => {
//     if (fileId) {
//       fetchUdlStickerData(fileId);
//       showToast("Refreshing data...", "info");
//     }
//   };

//   const autoSizeAll = () => {
//     if (!gridRef.current?.api) return;

//     const allCols = gridRef.current.api.getColumns()?.map((c) => c.getId());

//     if (allCols?.length) {
//       gridRef.current.api.autoSizeColumns(allCols, false);
//     }
//   };

//   const toggleFullScreen = () => {
//     setIsFullScreen(!isFullScreen);
//   };
//   const downloadExcel = () => {
//     if (!gridRef.current?.api) return;

//     gridRef.current.api.exportDataAsCsv({
//       fileName: `UDL_Sticker_${fileId}.csv`,
//     });
//   };

//   const defaultColDef = useMemo(
//     () => ({
//       resizable: true,
//       sortable: false,
//       filter: false,
//       cellStyle: { textAlign: "left" },
//     }),
//     []
//   );

//   /* ---------------- UI ---------------- */

//   return (
//     <div style={{ minHeight: "100vh", padding: 10 }}>
//       <Container fluid>
//         <Card>
//           {/* -------- HEADER -------- */}
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
//                 <h4 className="mb-0">
//                   UDL Sticker {fileName && `- ${decodeURIComponent(fileName)}`}
//                 </h4>
//                 <small style={{ opacity: 0.8 }}>
//                   {`${rowData.length} records found`}
//                   {selectedRows.length > 0 &&
//                     ` | ${selectedRows.length} selected`}
//                 </small>
//               </Col>

//               <Col xs={12} md={6}>
//                 <div className="d-flex justify-content-end gap-2 flex-wrap align-items-center">
//                   <ButtonGroup size="sm">
//                     <Button variant="success" onClick={handleRefresh}>
//                       <i className="bi bi-arrow-clockwise"></i>
//                       {!isMobile && " Refresh"}
//                     </Button>
//                   </ButtonGroup>
//                   <ButtonGroup size="sm">
//                     <Button variant="success" onClick={downloadExcel}>
//                       Export CSV
//                     </Button>
//                     <Button variant="info" onClick={autoSizeAll}>
//                       Auto Size
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

//           {/* -------- GRID -------- */}
//           <Card.Body style={{ padding: 0 }}>
//             {loading ? (
//               <div style={{ padding: 40, textAlign: "center" }}>
//                 Loading UDL data...
//               </div>
//             ) : (
//               <div
//                 className="ag-theme-alpine"
//                 style={{ height: "70vh", width: "100%" }}
//               >
//                 <AgGridReact
//                   ref={gridRef}
//                   rowData={rowData}
//                   columnDefs={columnDefs}
//                   defaultColDef={defaultColDef}
//                   pagination
//                   paginationPageSize={20}
//                   rowClassRules={{
//                     "ag-row-highlight": (params) =>
//                       params.data?._highlight === true,
//                   }}
//                   onGridReady={() => {
//                     setTimeout(autoSizeAll, 300);
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

// export default PURCHASEUdlDetails;

import React, { useEffect, useMemo, useState, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { ModuleRegistry } from "ag-grid-community";
import { ClientSideRowModelModule, CsvExportModule } from "ag-grid-community";
import {
  Container,
  Button,
  Row,
  Col,
  Card,
  ButtonGroup,
} from "react-bootstrap";
import { useParams } from "react-router-dom";

ModuleRegistry.registerModules([ClientSideRowModelModule, CsvExportModule]);

/* ---------------- HELPERS ---------------- */

const buildColumnDefsFromApi = (headers) =>
  headers.map((h) => ({
    headerName: h,
    field: h,
    minWidth: 120,
    resizable: true,
    sortable: false,
    filter: false,
  }));

const transformUdlApiResponse = (apiResponse) => {
  const { headers, rows } = apiResponse;

  const rowData = rows.map((row) => {
    const obj = {};
    let highlightRow = false;

    row.forEach((cell, index) => {
      obj[headers[index]] = cell.value;
      if (cell.highlight) highlightRow = true;
    });

    obj._highlight = highlightRow;
    return obj;
  });

  return {
    columnDefs: buildColumnDefsFromApi(headers),
    rowData,
  };
};

/* ---------------- COMPONENT ---------------- */

const PURCHASEUdlDetails = () => {
  const { fileId, fileName } = useParams();

  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔹 EXISTING PATTERN (RESTORED)
  const [theme, setTheme] = useState("light");
  const [isFullScreen, setIsFullScreen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [selectedRows, setSelectedRows] = useState([]);

  const gridRef = useRef();

  /* ---------------- THEME (same as your main page) ---------------- */

  const themeStyles =
    theme === "dark"
      ? {
          cardHeader: "linear-gradient(135deg, #495057 0%, #343a40 100%)",
        }
      : {
          cardHeader: "linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%)",
        };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  /* ---------------- RESPONSIVE ---------------- */

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ---------------- FETCH DATA ---------------- */

  const fetchUdlStickerData = async (fid) => {
    if (!fid) return;

    setLoading(true);
    try {
      const res = await fetch(
        `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/getUdlStickerMaterialApi.php?fileId=${fid}`
      );
      const data = await res.json();

      if (data.status === true) {
        const transformed = transformUdlApiResponse(data);
        setColumnDefs(transformed.columnDefs);
        setRowData(transformed.rowData);
      } else {
        setRowData([]);
      }
    } catch (err) {
      console.error("UDL fetch error:", err);
      setRowData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fileId) {
      fetchUdlStickerData(fileId);
    }
  }, [fileId]);

  /* ---------------- GRID UTILS ---------------- */

  const handleRefresh = () => {
    if (fileId) fetchUdlStickerData(fileId);
  };

  const autoSizeAll = () => {
    if (!gridRef.current?.api) return;
    const allCols = gridRef.current.api.getColumns()?.map((c) => c.getId());
    if (allCols?.length) {
      gridRef.current.api.autoSizeColumns(allCols, false);
    }
  };

  const downloadExcel = () => {
    if (!gridRef.current?.api) return;
    gridRef.current.api.exportDataAsCsv({
      fileName: `UDL_Sticker_${fileId}.csv`,
    });
  };

  const toggleFullScreen = () => {
    setIsFullScreen((prev) => !prev);
  };

  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      sortable: false,
      filter: false,
      cellStyle: { textAlign: "right" },
    }),
    []
  );

  const gridHeight = isFullScreen
    ? "calc(100vh - 240px)"
    : isMobile
    ? "400px"
    : "600px";

  /* ---------------- UI (UNCHANGED STRUCTURE) ---------------- */

  return (
    <div style={{ minHeight: "100vh", padding: 10 }}>
      <Container fluid>
        <Card>
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
                <h4 className="mb-0">
                  UDL Sticker {fileName && `- ${decodeURIComponent(fileName)}`}
                </h4>
                <small style={{ opacity: 0.8 }}>
                  {`${rowData.length} records found`}
                  {selectedRows.length > 0 &&
                    ` | ${selectedRows.length} selected`}
                </small>
              </Col>

              <Col xs={12} md={6}>
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

          <Card.Body style={{ padding: 0 }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: "center" }}>
                Loading UDL data...
              </div>
            ) : (
              <div
                className="ag-theme-alpine"
                style={{ height: gridHeight, width: "100%" }}
              >
                <AgGridReact
                  ref={gridRef}
                  rowData={rowData}
                  columnDefs={columnDefs}
                  defaultColDef={defaultColDef}
                  pagination
                  paginationPageSize={isMobile ? 10 : 20}
                  rowClassRules={{
                    "ag-row-highlight": (params) =>
                      params.data?._highlight === true,
                  }}
                  onGridReady={() => setTimeout(autoSizeAll, 300)}
                />
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default PURCHASEUdlDetails;
