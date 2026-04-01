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
const PURCHASEverbalPOMs = () => {
  const [theme, setTheme] = useState("light");
  const [rowData, setRowData] = useState([]);
  //   const [columnDefs, setColumnDefs] = useState([]);
  const [isFullScreen, setIsFullScreen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  const [materialTypeList, setMaterialTypeList] = useState([]);
  const [selectedMaterialType, setSelectedMaterialType] = useState("");

  const [loadingMaterialType, setLoadingMaterialType] = useState(false);
  const [againstFileDropdown, setAgainstFileDropdown] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [materialComponentList, setMaterialComponentList] = useState([]);
  const [selectedMaterialComponent, setSelectedMaterialComponent] =
    useState("");
  const [financialYears, setFinancialYears] = useState([]);
  const [selectedFinancialYear, setSelectedFinancialYear] = useState("");
  const [loadingYears, setLoadingYears] = useState(false);
  const gridRef = useRef();
  const gridRefTab2 = useRef(null);

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

  // Fetch suppliers
  const fetchSupplierList = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/getSuppliersApi.php`,
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
      console.log(data);

      if (data.status === true && Array.isArray(data.data)) {
        setSuppliers(data.data);
        showToast(`Loaded ${data.data.length} suppliers`, "success");
      } else if (Array.isArray(data)) {
        setSuppliers(data);
        showToast(`Loaded ${data.length} suppliers`, "success");
      } else {
        setSuppliers([]);
        showToast("No data found for selected file", "info");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      showToast(`Error fetching data: ${error.message}`, "error");
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

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
        "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/common/GetFileNameId.php",
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
        field: "material_description",
        headerName: "Material Name",
        width: isMobile ? 120 : 200,
        minWidth: isMobile ? 90 : 150,
        pinned: "left",
        checkboxSelection: true,
        headerCheckboxSelection: true,
      },
      {
        field: "unit",
        headerName: "Unit",
        width: isMobile ? 120 : 200,
        minWidth: isMobile ? 90 : 150,
      },
      {
        headerName: "Against File",
        field: "FILE_NAME",
        width: 250,

        cellRenderer: (params) => {
          const files = params.data?.files || [];

          const handleChange = (e) => {
            const selectedName = e.target.value;
            console.log(files);
            const selectedFile = files.find(
              (s) => s.FILE_NAME === selectedName
            );

            if (!selectedFile) return;

            params.data.FILE_NAME = selectedFile.FILE_NAME;
            params.data.FILE_ID = selectedFile.FILE_ID;

            params.api.refreshCells({
              rowNodes: [params.node],
              columns: ["FILE_NAME"],
              force: true,
            });
          };

          return (
            <select
              value={params.data.FILE_NAME || ""}
              onChange={handleChange}
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                outline: "none",
                backgroundColor: "#f8f9fa",
                color: "#212529",
                fontSize: "11px",
                cursor: "pointer",
              }}
            >
              <option value="">Choose File</option>

              {files.map((s) => (
                <option
                  key={s.FILE_ID}
                  value={s.FILE_NAME}
                  style={{ color: "#212529" }}
                >
                  {s.FILE_NAME}
                </option>
              ))}
            </select>
          );
        },

        cellStyle: {
          backgroundColor: "#f8f9fa",
          fontSize: "11px",
          padding: "0",
        },
      },
      {
        headerName: "File Qty",
        field: "file_qty",
        width: isMobile ? 200 : 280,
        editable: true,
        singleClickEdit: true,
        cellEditor: "agTextCellEditor",

        valueParser: (params) => {
          const v = Number(params.newValue);
          return isNaN(v) ? "" : v;
        },

        valueSetter: (params) => {
          const newValue = Number(params.newValue);

          if (isNaN(newValue)) return false;

          params.data.file_qty = newValue;
          return true;
        },
      },
      {
        headerName: "NO.File Qty",
        field: "no_file_qty",
        width: isMobile ? 200 : 280,
        editable: true,
        singleClickEdit: true,
        cellEditor: "agTextCellEditor",

        valueParser: (params) => {
          const v = Number(params.newValue);
          return isNaN(v) ? "" : v;
        },

        valueSetter: (params) => {
          const newValue = Number(params.newValue);

          if (isNaN(newValue)) return false;

          params.data.no_file_qty = newValue;
          return true;
        },
      },
      {
        headerName: "Select Supplier",
        field: "supplier_name",
        width: 250,

        cellRenderer: (params) => {
          const handleChange = (e) => {
            const selectedName = e.target.value;
            console.log(suppliers);
            const selectedSupplier = suppliers.find(
              (s) => s.name === selectedName
            );

            if (!selectedSupplier) return;

            params.data.supplier_name = selectedSupplier.name;
            params.data.supplier_id = selectedSupplier.id;

            params.api.refreshCells({
              rowNodes: [params.node],
              columns: ["supplier_name"],
              force: true,
            });
          };

          return (
            <select
              value={params.data.supplier_name || ""}
              onChange={handleChange}
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                outline: "none",
                backgroundColor: "#f8f9fa",
                color: "#212529",
                fontSize: "11px",
                cursor: "pointer",
              }}
            >
              <option value="">Choose Supplier</option>

              {suppliers.map((s) => (
                <option key={s.id} value={s.name} style={{ color: "#212529" }}>
                  {s.name}
                </option>
              ))}
            </select>
          );
        },

        cellStyle: {
          backgroundColor: "#f8f9fa",
          fontSize: "11px",
          padding: "0",
        },
      },
      {
        headerName: "Order Qty",
        field: "total_qty",
        width: isMobile ? 200 : 280,
        editable: true,
        singleClickEdit: true,
        cellEditor: "agTextCellEditor",

        valueParser: (params) => {
          const v = Number(params.newValue);
          return isNaN(v) ? "" : v;
        },

        valueSetter: (params) => {
          const newValue = Number(params.newValue);

          if (isNaN(newValue)) return false;

          params.data.total_qty = newValue;
          return true;
        },
      },
      {
        field: "comment",
        headerName: "Comment and userName",
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
      showToast("Please select a component", "error");
      return;
    }
    console.log(materialComponent);

    setLoading(true);
    try {
      const response = await fetch(
        `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/getMaterialDataForPurchaseApi.php?material=${materialComponent}`,
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

      if (data.status === true && data.data) {
        const materials = data.data.materials || [];
        const files = data.data.files || [];
        materials.forEach((m) => (m.files = files)); // optional but useful
        setRowData(materials);
        showToast(`Loaded ${data.count} records`, "success");
      } else if (data) {
        const materials = data.data.materials || [];
        const files = data.data.files || [];
        materials.forEach((m) => (m.files = files)); // optional but useful
        setRowData(materials);
        showToast(`Loaded ${data.length} records  `, "success");
      } else if (data.data) {
        const materials = data.data.materials || [];
        const files = data.data.files || [];
        materials.forEach((m) => (m.files = files)); // optional but useful
        setRowData(materials);
        showToast(`Loaded ${data.TotolRow} records`, "success");
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

  // Fetch PPC project list data

  //   const fetchPPCProjectData = async (financialYear) => {
  //     setLoading(true);
  //     try {
  //       const response = await fetch(
  //         `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/hardwareForwardedFilesApi.php?financial_year=${financialYear}`,
  //         {
  //           method: "GET",
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //         }
  //       );

  //       if (!response.ok) {
  //         throw new Error(`HTTP error! status: ${response.status}`);
  //       }

  //       const data = await response.json();

  //       if (data.status === true && Array.isArray(data.data)) {
  //         setRowData(data.data);
  //         showToast(
  //           `Loaded ${data.data.length} records for FY ${financialYear}`,
  //           "success"
  //         );
  //       } else if (Array.isArray(data)) {
  //         setRowData(data);
  //         showToast(
  //           `Loaded ${data.length} records for FY ${financialYear}`,
  //           "success"
  //         );
  //       } else {
  //         setRowData([]);
  //         showToast("No data found for selected file", "info");
  //       }
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //       showToast(`Error fetching data: ${error.message}`, "error");
  //       setRowData([]);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  // Initial load
  useEffect(() => {
    fetchSupplierList();
    fetchAgainstFileName();

    // setColumnDefs(generateColumnDefs());
    fetchMaterialType();
  }, [isMobile]);

  // Load data when financial year changes
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
        fileName: `VerbalPO_${selectedFinancialYear}_${
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

  // Generate purchase Order Function
  const handlePurchaseOrderData = async () => {
    try {
      const api = gridRef.current?.api;
      if (!api) return;

      const formData = new FormData();

      let hasData = false;

      api.forEachNode((node, index) => {
        if (Number(node.data.file_qty) > 0) {
          if (!node.data.supplier_id) {
            throw new Error(`Supplier not selected at row ${index + 1}`);
          }

          if (!node.data.FILE_ID) {
            throw new Error(`File not selected at row ${index + 1}`);
          }

          hasData = true;

          formData.append("materialID[]", node.data.material_id);
          formData.append("supplier[]", node.data.supplier_id);
          formData.append("file_id[]", node.data.FILE_ID);
          formData.append("file_qty[]", node.data.file_qty);
          formData.append("nofile_qty[]", node.data.no_file_qty || "");
          formData.append("unit[]", node.data.unit);
          formData.append("comment[]", node.data.comment || "");
        }
      });

      if (!hasData) {
        alert("No items selected for purchase");
        return;
      }

      // ✅ DEBUG (VERY IMPORTANT)
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const response = await fetch(
        "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/generatePOVerbDataApi.php",
        {
          method: "POST",
          body: formData, // ✅ correct
        }
      );

      const result = await response.json();
      console.log(result);

      if (result.status === true) {
        showToast("Purchase Order created successfully", "success");
      } else {
        showToast(result.message || "Failed to create PO", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("API Error: " + error.message, "error");
    }
  };

  // Refresh data
  const handleRefresh = () => {
    fetchMaterialType();
    showToast("Refreshing data...", "info");
  };
  function handleRefreshData() {
    if (selectedMaterialComponent) {
      fetchMaterialData(selectedMaterialComponent);
      showToast("Refreshing data...", "info");
    }
  }

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
                <h4 className="mb-0">Verbal PO</h4>
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
            <Row className="align-items-center">
              <Col xs={12} lg={6} className="mb-2 mb-lg-0">
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
              </Col>
              <Col xs={12} lg={6} className="mb-2 mb-lg-0">
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
                  Please select a different material or check your API
                  connection.
                </p>
                <ButtonGroup size="sm">
                  <Button variant="success" onClick={handleRefreshData}>
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
                  suppressMovableColumns={isMobile}
                  enableRangeSelection={!isMobile}
                  rowMultiSelectWithClick={true}
                  animateRows={!isMobile}
                  enableCellTextSelection={true}
                  suppressHorizontalScroll={false}
                  headerHeight={isMobile ? 40 : 48}
                  rowHeight={isMobile ? 35 : 42}
                  onGridReady={(params) => {
                    console.log("Project Grid is ready");
                    // Auto-size columns after grid is ready
                    setTimeout(() => autoSizeAll(), 500);
                  }}
                />
              </div>
            )}
            <div className="d-flex justify-content-center gap-2 flex-wrap mt-2 mb-1">
              <Button
                variant="success"
                className="px-4"
                onClick={handlePurchaseOrderData}
              >
                Send to PO
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default PURCHASEverbalPOMs;
