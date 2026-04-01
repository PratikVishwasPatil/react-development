import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams } from "react-router-dom";
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

const PPCGenerateAssemblyData = () => {
  const [theme, setTheme] = useState("light");
  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([]);
  const [isFullScreen, setIsFullScreen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [fileName, setFileName] = useState("");
  const [selectedFinancialYear, setSelectedFinancialYear] = useState("");
  const [loadingYears, setLoadingYears] = useState(false);
  const [selectedMainAssembly, setSelectedMainAssembly] = useState([]);
  const [mainAssemblyList, setMainAssemblyList] = useState([]);
  const [subAssemblyList, setSubAssemblyList] = useState([]);
  const [selectedSubAssembly, setSelectedSubAssembly] = useState([]);
  const [quantity, setQuantity] = useState("");
  const [isInvalid, setIsInvalid] = useState(false);
  const data = [
    { main: "assemblyA", sub: ["A-sub1", "A-sub2", "A-sub3"] },
    { main: "assemblyB", sub: ["B-sub1", "B-sub2"] },
    { main: "assemblyC", sub: ["C-sub1", "C-sub2", "C-sub3", "C-sub4"] },
  ];
  const gridRef = useRef();
  const { fileid, assemblyid } = useParams();

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

  // Fetch File Name
  const fetchFileName = async () => {
    try {
      const response = await fetch(
        " http://93.127.167.54/Surya_React/surya_dynamic_api/GetFilenameApi.php ",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fileid }),
        }
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        setFileName(data[0].FILE_NAME || data[0].file_name || "Unknown File");
      } else if (data.data && data.data.length > 0) {
        setFileName(
          data.data[0].FILE_NAME || data.data[0].file_name || "Unknown File"
        );
      } else {
        setFileName("Unknown File");
      }
    } catch (error) {
      console.error("Error fetching filename:", error);
      showToast("Error loading filename", "error");
    }
  };

  useEffect(() => {
    const mainAssemblyData = data.map((d) => d.main);
    setMainAssemblyList(mainAssemblyData);
  }, []);
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
        field: "assembly_name",
        headerName: "Process Material Description",
        width: isMobile ? 200 : 280,
        pinned: "left",
        checkboxSelection: true,
        headerCheckboxSelection: true,
        lockPosition: true,
        cellStyle: { fontWeight: "bold" },
      },
      {
        field: "assemblyQty",
        headerName: "Qty",
        width: isMobile ? 180 : 280,
        minWidth: 150,
      },
      {
        field: "status",
        headerName: "Reassign Qty",
        width: isMobile ? 150 : 200,
        minWidth: 150,
        editable: true,
        valueSetter: (params) => {
          const newValue = parseInt(params.newValue);
          if (isNaN(newValue)) return false; // reject
          params.data.qty = newValue;
          return true;
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
      cellStyle: { textAlign: "left" },
    }),
    [isMobile]
  );

  // Fetch PPC project list data
  // const fetchPPCProjectDataDetails = async () => {
  //   setLoading(true);
  //   try {
  //     const response = await fetch(" ", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ fileID: fileid, assemblyid: assemblyid }),
  //     });

  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }

  //     const data = await response.json();

  //     if (data.status === "success" && Array.isArray(data.data)) {
  //       setRowData(data.data);
  //       showToast(`Loaded ${data.count} records for File ${fileid}`, "success");
  //     } else if (Array.isArray(data)) {
  //       setRowData(data);
  //       showToast(
  //         `Loaded ${data.length} records for File ${fileid}`,
  //         "success"
  //       );
  //     } else {
  //       setRowData([]);
  //       showToast("No data found for selected File", "info");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching PPC project data:", error);
  //     showToast(`Error fetching data: ${error.message}`, "error");
  //     setRowData([]);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Initial load
  useEffect(() => {
    setColumnDefs(generateColumnDefs());
    fetchFileName();
    // fetchPPCProjectDataDetails();
    setRowData([
      {
        serialNumber: "1",
        assembly_name: "asdf",
        assemblyQty: "20",
        status: "",
      },
      {
        serialNumber: "1",
        assembly_name: "asdf",
        assemblyQty: "20",
        status: "",
      },
      {
        serialNumber: "1",
        assembly_name: "asdf",
        assemblyQty: "20",
        status: "",
      },
      {
        serialNumber: "1",
        assembly_name: "asdf",
        assemblyQty: "20",
        status: "",
      },
      {
        serialNumber: "1",
        assembly_name: "asdf",
        assemblyQty: "20",
        status: "",
      },
      {
        serialNumber: "1",
        assembly_name: "asdf",
        assemblyQty: "2",
        status: "200",
      },
      {
        serialNumber: "1",
        assembly_name: "asdf",
        assemblyQty: "20",
        status: "",
      },
      {
        serialNumber: "1",
        assembly_name: "asdf",
        assemblyQty: "20",
        status: "",
      },
    ]);
  }, [isMobile]);

  // Load data when financial year changes
  useEffect(() => {
    if (selectedFinancialYear) {
      // fetchPPCProjectDataDetails();
    }
  }, [selectedFinancialYear]);

  // Handle selection changed - auto navigate
  const onSelectionChanged = (event) => {
    const selectedNodes = event.api.getSelectedNodes();
    const selectedData = selectedNodes.map((node) => node.data);
    setSelectedRows(selectedData);

    if (selectedData.length === 1) {
      const selectedRecord = selectedData[0];

      if (!selectedRecord.FILE_ID) {
        showToast("File ID not found in selected record", "error");
        return;
      }

      // Open details page in new tab
      const detailsUrl = `/ppc-generate-assembly/file-details/assembly/${selectedRecord.FILE_ID}/${selectedRecord.assembly_name}`;
      window.open(detailsUrl, "_blank");
    }
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
        fileName: `ReceivedMaterialDetails_${fileName || "Data"}_${
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
      // fetchPPCProjectDataDetails();
      showToast("Refreshing data...", "info");
    }
  };

  //main assembly change
  function handleMainAssemblyChange(event) {
    setSubAssemblyList([]);
    setSelectedSubAssembly("");
    const newMainAssembly = event.target.value;
    setSelectedMainAssembly(newMainAssembly);
    const subAssemblyObj = data.find((d) => d.main === newMainAssembly);
    setSubAssemblyList(subAssemblyObj ? subAssemblyObj.sub : []);
  }
  // sub assembly change
  function handleSubAssemblyChange(event) {
    setSelectedSubAssembly(event.target.value);
  }

  //quantity dropdown change
  const handleQuantityChange = (e) => {
    let value = e.target.value;

    // 1. prevent negative
    if (value.startsWith("-")) return;

    // 2. prevent decimals
    if (value.includes(".")) return;

    // 3. allow only digits
    if (!/^\d*$/.test(value)) return;

    // 4. digit limit (4 digits example)
    if (value.length > 4) return;

    // update quantity
    setQuantity(value);

    // 5. validation (invalid only when non-number)
    setIsInvalid(value !== "" && isNaN(Number(value)));
  };

  // submit button function
  function handleSubmit() {}
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
    ? "calc(100vh - 420px)"
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
            style={{
              width: "3rem",
              height: "3rem",
              borderColor: "#007bff",
              borderRightColor: "transparent",
            }}
          >
            <span
              style={{
                position: "absolute",
                width: "1px",
                height: "1px",
                overflow: "hidden",
              }}
            >
              Loading...
            </span>
          </div>
          <p style={{ marginTop: "1rem" }}>Loading PPC project data...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "90vh",
        background: themeStyles.backgroundColor,
        color: themeStyles.color,
        padding: 0,
        margin: 0,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: isFullScreen ? "100%" : "1400px",
          margin: "0 auto",
          padding: isFullScreen ? 0 : "20px",
        }}
      >
        <div
          style={{
            backgroundColor: themeStyles.cardBg,
            color: themeStyles.color,
            border:
              theme === "dark" ? "1px solid #495057" : "1px solid #dee2e6",
            borderRadius: isFullScreen ? 0 : "8px",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: themeStyles.cardHeader,
              color: theme === "dark" ? "#ffffff" : "#000000",
              fontFamily: "'Maven Pro', sans-serif",
              padding: "1rem 2rem",
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1rem",
              }}
            >
              <div style={{ flex: isMobile ? "1 1 100%" : "1 1 auto" }}>
                <h4
                  style={{
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <span>📋</span>
                  Assembly Name: <strong>{`${assemblyid}`}</strong>
                </h4>

                <small style={{ opacity: 0.8 }}>
                  {`${rowData.length} records found`}
                  {selectedRows.length > 0 &&
                    ` | ${selectedRows.length} selected`}
                </small>
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                  alignItems: "center",
                  flex: isMobile ? "1 1 100%" : "0 1 auto",
                }}
              >
                {/* File Name Display */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <label style={{ fontSize: "0.875rem", whiteSpace: "nowrap" }}>
                    File:
                  </label>
                  <span
                    style={{
                      fontWeight: "bold",
                      fontSize: "0.9rem",
                      color: theme === "dark" ? "#0dcaf0" : "#007bff",
                    }}
                  >
                    {fileName || "Loading..."}
                  </span>
                </div>

                {/* Action Buttons */}
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  style={{
                    padding: "0.375rem 0.75rem",
                    fontSize: "0.875rem",
                    borderRadius: "0.25rem",
                    border: "1px solid #007bff",
                    backgroundColor: "transparent",
                    color: "#007bff",
                    cursor: "pointer",
                  }}
                  title="Refresh data"
                >
                  🔄 {!isMobile && "Refresh"}
                </button>

                <button
                  onClick={downloadExcel}
                  style={{
                    padding: "0.375rem 0.75rem",
                    fontSize: "0.875rem",
                    borderRadius: "0.25rem",
                    border: "none",
                    backgroundColor: "#28a745",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  📊 {!isMobile && "Export CSV"}
                </button>

                <button
                  onClick={autoSizeAll}
                  style={{
                    padding: "0.375rem 0.75rem",
                    fontSize: "0.875rem",
                    borderRadius: "0.25rem",
                    border: "none",
                    backgroundColor: "#17a2b8",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  ⇔ {!isMobile && "Auto Size"}
                </button>

                <button
                  onClick={toggleFullScreen}
                  style={{
                    padding: "0.375rem 0.75rem",
                    fontSize: "0.875rem",
                    borderRadius: "0.25rem",
                    border: "1px solid #6c757d",
                    backgroundColor: "transparent",
                    color: theme === "dark" ? "#ffffff" : "#000000",
                    cursor: "pointer",
                  }}
                >
                  {isFullScreen ? "🗗" : "🗖"}{" "}
                  {!isMobile && (isFullScreen ? "Exit" : "Full")}
                </button>

                <button
                  onClick={toggleTheme}
                  style={{
                    padding: "0.375rem 0.75rem",
                    fontSize: "0.875rem",
                    borderRadius: "0.25rem",
                    border: "1px solid #6c757d",
                    backgroundColor: "transparent",
                    color: theme === "dark" ? "#ffffff" : "#000000",
                    cursor: "pointer",
                  }}
                >
                  {theme === "light" ? "🌙" : "☀️"}{" "}
                  {!isMobile && (theme === "light" ? "Dark" : "Light")}
                </button>
              </div>
            </div>

            {/* Dropdwons */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "2rem",
                width: "100%",
                alignItems: "flex-start",
                marginTop: "1rem",
              }}
            >
              {/* Main assembly Dropdown */}
              <div
                style={{
                  width: "100%",
                }}
              >
                <label
                  style={{
                    fontSize: "1.27rem",
                    marginBottom: "6px",
                    display: "block",
                  }}
                >
                  Main Assembly
                </label>
                <select
                  value={selectedMainAssembly}
                  onChange={handleMainAssemblyChange}
                  // disabled={loadingYears}
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.75rem",
                    fontSize: "1.2rem",
                    borderRadius: "6px",
                    border:
                      theme === "dark" ? "1px solid #666" : "1px solid #ced4da",
                    backgroundColor: theme === "dark" ? "#343a40" : "#fff",
                    color: theme === "dark" ? "#fff" : "#000",
                    boxSizing: "border-box",
                  }}
                >
                  {mainAssemblyList.map((assembly, index) => (
                    <option key={index} value={assembly}>
                      {assembly}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sub assembly Dropdown */}
              <div
                style={{
                  width: "100%",
                }}
              >
                <label
                  style={{
                    fontSize: "1.27rem",
                    marginBottom: "6px",
                    display: "block",
                  }}
                >
                  Sub Assembly
                </label>
                <select
                  value={selectedSubAssembly}
                  onChange={handleSubAssemblyChange}
                  disabled={
                    !selectedMainAssembly || subAssemblyList.length === 0
                  }
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.75rem",
                    fontSize: "1.2rem",
                    borderRadius: "6px",
                    border:
                      theme === "dark" ? "1px solid #666" : "1px solid #ced4da",
                    backgroundColor: theme === "dark" ? "#343a40" : "#fff",
                    color: theme === "dark" ? "#fff" : "#000",
                    boxSizing: "border-box",
                  }}
                >
                  {subAssemblyList.map((sub, index) => (
                    <option key={index} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              {/* quantity dropdown */}
              <div
                style={{
                  width: "100%",
                }}
              >
                <label
                  style={{
                    fontSize: "1.27rem",
                    marginBottom: "6px",
                    display: "block",
                  }}
                >
                  Quantity
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={handleQuantityChange}
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.75rem",
                    fontSize: "1.1rem",
                    borderRadius: "6px",
                    border:
                      theme === "dark" ? "1px solid #666" : "1px solid #ced4da",
                    backgroundColor: theme === "dark" ? "#343a40" : "#fff",
                    color: theme === "dark" ? "#fff" : "#000",
                    boxSizing: "border-box",
                    border: isInvalid ? "1px solid red" : "1px solid #ced4da",
                  }}
                ></input>
              </div>
            </div>
          </div>

          {/* Grid Body */}
          <div
            style={{
              backgroundColor: themeStyles.cardBg,
              padding: isFullScreen ? 0 : "15px",
            }}
          >
            {rowData.length === 0 && !loading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "50px",
                  color: themeStyles.color,
                }}
              >
                <div style={{ fontSize: "3rem", marginBottom: "20px" }}>📋</div>
                <h5>No PPC project data available</h5>
                <p>Select a financial year or try refreshing.</p>
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
                  paginationPageSize={isMobile ? 10 : 25}
                  rowSelection="single"
                  onSelectionChanged={onSelectionChanged}
                  suppressMovableColumns={isMobile}
                  enableRangeSelection={!isMobile}
                  rowMultiSelectWithClick={false}
                  animateRows={!isMobile}
                  enableCellTextSelection={true}
                  suppressHorizontalScroll={false}
                  headerHeight={isMobile ? 40 : 48}
                  rowHeight={isMobile ? 35 : 42}
                  onGridReady={(params) => {
                    console.log("PPC Project Grid is ready");
                    setTimeout(() => autoSizeAll(), 500);
                  }}
                />
              </div>
            )}
          </div>
          <div
            style={{
              background: themeStyles.cardHeader,
              color: theme === "dark" ? "#ffffff" : "#000000",
              fontFamily: "'Maven Pro', sans-serif",
              padding: "1rem 2rem",
              height: "160px",
            }}
          >
            <button
              onSubmit={handleSubmit}
              style={{
                padding: "0.375rem 0.75rem",
                fontSize: "0.875rem",
                borderRadius: "0.25rem",
                border: "none",
                backgroundColor: "#28a745",
                color: "white",
                cursor: "pointer",
              }}
            >
              Submit
            </button>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1rem",
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PPCGenerateAssemblyData;
