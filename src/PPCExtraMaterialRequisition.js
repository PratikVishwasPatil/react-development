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

const SearchableDropdown = ({
  label,
  options = [],
  value,
  onSelect,
  theme,
}) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const selectedLabel =
    options.find((o) => String(o.value) === String(value))?.label || "";

  const filtered = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const containerRef = React.useRef(null);
  useEffect(() => {
    const onDocClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  return (
    <div style={{ width: "100%", position: "relative" }} ref={containerRef}>
      <label
        style={{
          fontSize: "1.1rem",
          marginBottom: "6px",
          display: "block",
        }}
      >
        {label}
      </label>

      {/* main box */}
      <div
        onClick={() => {
          setOpen((s) => !s);
          setSearch("");
        }}
        style={{
          width: "100%",
          padding: "0.5rem 0.75rem",
          fontSize: "0.9rem",
          borderRadius: "6px",
          border: theme === "dark" ? "1px solid #666" : "1px solid #ced4da",
          backgroundColor: theme === "dark" ? "#343a40" : "#fff",
          color: theme === "dark" ? "#fff" : "#000",
          cursor: "pointer",
          boxSizing: "border-box",
        }}
      >
        {selectedLabel || "Select..."}
      </div>

      {/* dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            width: "100%",
            backgroundColor: theme === "dark" ? "#343a40" : "#fff",
            border: theme === "dark" ? "1px solid #666" : "1px solid #ced4da",
            borderRadius: "6px",
            marginTop: "4px",
            zIndex: 200,
            maxHeight: "220px",
            overflowY: "auto",
          }}
        >
          {/* search */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            autoFocus
            style={{
              width: "100%",
              padding: "0.5rem",
              fontSize: "1rem",
              border: "none",
              borderBottom:
                theme === "dark" ? "1px solid #555" : "1px solid #ddd",
              outline: "none",
              backgroundColor: theme === "dark" ? "#3c3c3c" : "#fff",
              color: theme === "dark" ? "#fff" : "#000",
              boxSizing: "border-box",
            }}
          />

          {/* list */}
          {filtered.map((opt, idx) => (
            <div
              key={idx}
              onClick={() => {
                onSelect(opt.value);
                setOpen(false);
                setSearch("");
              }}
              style={{
                padding: "0.5rem 0.75rem",
                cursor: "pointer",
                fontSize: "1.1rem",
                color: theme === "dark" ? "#fff" : "#000",
                borderBottom: "1px solid rgba(0,0,0,0.03)",
              }}
            >
              {opt.label}
            </div>
          ))}

          {filtered.length === 0 && (
            <div
              style={{
                padding: "0.5rem 0.75rem",
                color: "#888",
                fontSize: "1.1rem",
              }}
            >
              No results
            </div>
          )}
        </div>
      )}
    </div>
  );
};
const PPCElectricalExtraMaterialRequisition = () => {
  const [theme, setTheme] = useState("light");
  const [rowData, setRowData] = useState([]);
  // const [columnDefs, setColumnDefs] = useState([]);
  const [isFullScreen, setIsFullScreen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [materialTypeList, setMaterialTypeList] = useState([]);
  const [selectedMaterialType, setSelectedMaterialType] = useState("");

  const [loadingMaterialType, setLoadingMaterialType] = useState(false);
  const [againstFileDropdown, setAgainstFileDropdown] = useState([]);

  const [materialComponentList, setMaterialComponentList] = useState([]);
  const [selectedMaterialComponent, setSelectedMaterialComponent] =
    useState("");

  useState(false);
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

  // Fetch Material Type
  const fetchMaterialType = async () => {
    setLoadingMaterialType(true);
    try {
      const response = await fetch(
        "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/get_material_type.php",
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

      let MaterialTypeData = [];
      if (data.status === "success" && Array.isArray(data.data)) {
        MaterialTypeData = data.data;
      } else if (Array.isArray(data)) {
        MaterialTypeData = data;
      }

      setMaterialTypeList(MaterialTypeData);
    } catch (error) {
      console.error("Error fetching material type:", error);
      showToast(`Error loading material type: ${error.message}`, "error");
    } finally {
      setLoadingMaterialType(false);
    }
  };
  // Fetch file names for against file dropdwon
  const fetchAgainstFileName = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/common/GetFileNameForDropdown.php",
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

      let againstFileData = [];
      if (data.status === "success" && Array.isArray(data.data)) {
        againstFileData = data.data;
      } else if (Array.isArray(data)) {
        againstFileData = data;
      }
      const options = againstFileData.map((item) => item.FILE_NAME);
      setAgainstFileDropdown(options);
      console.log(againstFileData);
      console.log(options);
      // console.log(againstFileDropdown);
    } catch (error) {
      console.error("Error fetching file names:", error);
      showToast(`Error loading: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

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
        field: "material_description",
        headerName: "Material Name",
        width: isMobile ? 200 : 280,
        pinned: "left",
        checkboxSelection: true,
        headerCheckboxSelection: true,
        cellStyle: { fontWeight: "bold" },
      },
      {
        field: "unitName",
        headerName: "Unit",
        width: isMobile ? 180 : 280,
        minWidth: 150,
      },
      {
        field: "FILE_NAME",
        headerName: "Against File",
        width: isMobile ? 180 : 280,
        minWidth: 150,
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: () => ({
          values: againstFileDropdown || [],
        }),
      },
      {
        field: "fileqty",
        headerName: "File Qty",
        width: isMobile ? 180 : 280,
        minWidth: 150,
        editable: true,
        valueSetter: (params) => {
          const newValue = parseInt(params.newValue);
          if (isNaN(newValue)) return false; // reject
          params.data.fileqty  = newValue;
          return true;
        },
      },
      {
        field: "totalqty",
        headerName: "Order Qty",
        width: isMobile ? 180 : 280,
        minWidth: 150,
        editable: true,
        valueSetter: (params) => {
          const newValue = parseInt(params.newValue);
          if (isNaN(newValue)) return false; // reject
          params.data.totalqty = newValue;
          return true;
        },
      },
      {
        field: "comment",
        headerName: "Comment",
        width: isMobile ? 180 : 280,
        minWidth: 150,
        editable: true,
        valueSetter: (params) => {
          const newValue = params.newValue?.trim();
          if (!newValue) return false; // reject
          params.data.comment = newValue;
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
  //fetching data for material component dropdown
  const fetchMaterialComponentList = async (materialType) => {
    if (!materialType) {
      showToast("Please select a material type", "error");
      return;
    }
    // console.log(typeof materialType, materialType);

    setLoading(true);
    try {
      const response = await fetch(
        "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/get_material_compoent.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            main_material_type_id: materialType,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      let MaterialComponentData = [];
      if (data.status === "success" && Array.isArray(data.data)) {
        MaterialComponentData = data.data;
      } else if (Array.isArray(data)) {
        MaterialComponentData = data;
      }

      setMaterialComponentList(MaterialComponentData);
    } catch (error) {
      console.error("Error fetching material component data:", error);
      showToast(`Error fetching data: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterialData = async (materialComponent) => {
    if (!materialComponent) {
      showToast("Please select a financial year", "error");
      return;
    }
    console.log(materialComponent);

    setLoading(true);
    try {
      const response = await fetch(
        " https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/get_ppcextraMaterialRequisition_23.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ material_id: materialComponent }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "success" && Array.isArray(data.data)) {
        setRowData(data.data);
        showToast(`Loaded ${data.count} records for `, "success");
      } else if (Array.isArray(data)) {
        setRowData(data);
        showToast(`Loaded ${data.length} records for  `, "success");
      } else if (Array.isArray(data.data)) {
        setRowData(data.data);
        showToast(`Loaded ${data.TotolRow} records for `, "success");
      } else {
        setRowData([]);
        showToast("No data found for selected material component", "info");
      }
    } catch (error) {
      console.error("Error fetching material component data:", error);
      showToast(`Error fetching data: ${error.message}`, "error");
      setRowData([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchAgainstFileName();

    // setColumnDefs(generateColumnDefs());
    fetchMaterialType();
  }, [isMobile]);

  const columnDefs = useMemo(() => {
    console.log(againstFileDropdown);
    return generateColumnDefs();
  }, [againstFileDropdown, isMobile]);

  // Load data after material type selection changes
  useEffect(() => {
    if (selectedMaterialType) {
      fetchMaterialComponentList(selectedMaterialType);
    }
  }, [selectedMaterialType]);

  // Load grid data after material component selection
  useEffect(() => {
    if (selectedMaterialComponent) {
      fetchMaterialData(selectedMaterialComponent);
    }
  }, [selectedMaterialComponent]);

  // Handle selection changed - auto navigate
  //   const onSelectionChanged = (event) => {
  //     const selectedNodes = event.api.getSelectedNodes();
  //     const selectedData = selectedNodes.map((node) => node.data);
  //     setSelectedRows(selectedData);

  //     if (selectedData.length === 1) {
  //       const selectedRecord = selectedData[0];

  //       if (!selectedRecord.FILE_ID) {
  //         showToast("File ID not found in selected record", "error");
  //         return;
  //       }

  //       // Open details page in new tab
  //       //   const detailsUrl = `  /${selectedRecord.FILE_ID}`;
  //       //   window.open(detailsUrl, "_blank");
  //     }
  //   };

  // Handle financial year change
  const handleMaterialTypeChange = (e) => {
    setSelectedMaterialType(e.target.value);
    console.log(selectedMaterialType);
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
        fileName: `ExtraMaterialRequisition_${selectedMaterialType}_${selectedMaterialComponent}.csv`,
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
    fetchMaterialType();
    showToast("Refreshing data...", "info");
  };
  // Refresh grid data
  function handleRefreshData() {
    if (selectedMaterialComponent) {
      fetchMaterialData(selectedMaterialComponent);
      showToast("Refreshing data...", "info");
    }
  }
  // added by tejasvi save code
  const handleSave = async () => {
    if (!gridRef.current?.api) {
      showToast("Grid not ready", "error");
      return;
    }
  
    const rowData = [];
  
    gridRef.current.api.forEachNode((node) => {
      const r = node.data;
  
      if (r.FILE_NAME || r.totalqty) {
        rowData.push({
          FILE_NAME: r.FILE_NAME || "",
          material_id: r.material_id,
          unit: r.unitName,
          file_qty: r.fileqty || "",
          nofile_qty: "",
          total_qty: r.totalqty || "",
          comment: r.comment || "",
        });
      }
    });
  
    if (rowData.length === 0) {
      showToast("No data to save", "warning");
      return;
    }
  
    // 🔑 PHP needs FORM DATA, not JSON
    const formData = new FormData();
    formData.append("rowData", JSON.stringify(rowData));
  
    try {
      const response = await fetch(
        "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/savePPCExtraMaterialRequisition_23.php",
        {
          method: "POST",
          body: formData, // ✅ NO headers needed
        }
      );
  
      const text = await response.text();
  
      if (text.includes("Record Save Successfully")) {
        showToast("Data saved successfully", "success");
          // reload page after short delay (recommended)
  setTimeout(() => {
    window.location.reload();
  }, 1000);
      } else {
        showToast(text, "warning");
      }
    } catch (error) {
      console.error(error);
      showToast("Save failed", "error");
    }
  };
  // end  save code
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
    ? "calc(100vh - 300px)"
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
          <p style={{ marginTop: "1rem" }}>Loading Extra Material Requisition...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100vh",
        background: themeStyles.backgroundColor,
        color: themeStyles.color,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        padding: 0,
        margin: 0,
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: isFullScreen ? "100%" : "1400px",
            margin: "0 auto",
            padding: isFullScreen ? 0 : "20px",
            display: "flex",
            flexDirection: "column",
            flex: 1,
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
              display: "flex",
              flexDirection: "column",
              flex: 1,
            }}
          >
            {/* Header */}
            <div
              style={{
                background: themeStyles.cardHeader,
                color: theme === "dark" ? "#ffffff" : "#000000",
                fontFamily: "'Maven Pro', sans-serif",
                padding: "1rem 2rem",
                flexShrink: 0,
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
                  Extra Material Requisition
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
                  {/* Select Material Type dropdown */}
                  <div
                    style={{
                      width: "100%",
                    }}
                  >
                    <SearchableDropdown
                      label="Select Material Type"
                      theme={theme}
                      options={materialTypeList.map((e) => ({
                        label: e.main_material_name,
                        value: e.main_material_type_id,
                      }))}
                      value={selectedMaterialType}
                      onSelect={(val) => {
                        setSelectedMaterialType(val);
                      }}
                    />
                  </div>

                  {/* Select Material Component DropDown */}
                  <div
                    style={{
                      width: "100%",
                    }}
                  >
                    <SearchableDropdown
                      label="Select Material Component"
                      theme={theme}
                      options={materialComponentList.map((e) => ({
                        label: e.material_initial,
                        value: e.id,
                      }))}
                      value={selectedMaterialComponent}
                      onSelect={(val) => {
                        setSelectedMaterialComponent(val);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Grid Body */}
            <div
              style={{
                backgroundColor: themeStyles.cardBg,
                padding: isFullScreen ? 0 : "15px",
                flex: 1,
                overflow: "auto",
                display: "flex",
                flexDirection: "column",
                height: gridHeight,
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
                  <div style={{ fontSize: "3rem", marginBottom: "20px" }}>
                    📋
                  </div>
                  <h5>No Extra Material Requisition available</h5>
                  <p>Select a material component or try refreshing.</p>
                  <button
                    onClick={handleRefreshData}
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
                    flex: 1,
                    height: "100%",
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
                    singleClickEdit={true}
                    defaultColDef={defaultColDef}
                    pagination={true}
                    paginationPageSize={isMobile ? 10 : 25}
                    rowSelection="single"
                    //   onSelectionChanged={onSelectionChanged}
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
            {/* Footer */}
            <div
              style={{
                background: themeStyles.cardHeader,
                color: theme === "dark" ? "#ffffff" : "#000000",
                fontFamily: "'Maven Pro', sans-serif",
                padding: "1rem 2rem",
                flexShrink: 0,
                height: "auto",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "1rem",
                }}
              >
                <button
          onClick={handleSave}
                  style={{
                    display: "flex",
                    flexWrap: "wrap",

                    padding: "0.5rem 1rem",
                    fontSize: "0.9 rem",
                    borderRadius: "0.25rem",
                    border: "none",
                    backgroundColor: "#28a745",
                    color: "white",
                    cursor: "pointer",
                    marginTop: "2.26rem",
                  }}
                >
                  Send To PO
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PPCElectricalExtraMaterialRequisition;
