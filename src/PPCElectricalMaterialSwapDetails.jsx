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
import Select from "react-select";
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
]);

const PPCElectricalMaterialSwapDetails = () => {
  // const getFileIdFromUrl = () => {
  //     const path = window.location.pathname;
  //     const match = path.match(/ppc\/assembly\/material-swap-assembly\/details\/(\d+)/);
  //     return match ? match[1] : '5512';
  // };

  // const [fileId] = useState(getFileIdFromUrl());
  const fileIdObj = useParams();
  const fileId = fileIdObj.fileId;
  const [theme, setTheme] = useState("light");
  const [isFullScreen, setIsFullScreen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [revision, setRevision] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const gridOptions = useRef({
    domLayout: null,
  });
  const gridApiRef = useRef(null);
  const columnApiRef = useRef(null);

  // Dropdown states
  const [materialList, setMaterialList] = useState([]);
  const [unitList, setUnitList] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);

  // New input fields
  const [widthField, setWidthField] = useState("");
  const [quantityField, setQuantityField] = useState("");

  // Grid data
  const [rowData, setRowData] = useState([]);

  const gridRef = useRef();
  const API_BASE_URL =
    "http://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api";
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch material swap data
  const fetchMaterialSwapData = async () => {
    console.log(fileId);

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/PPC/getEleBomMaterialList.php?fileId=${fileId}`
      );
      const result = await response.json();

      if (result.status === "success" && Array.isArray(result.data)) {
        const mappedData = result.data.map((item, index) => ({
          srNo: item.sr_no || index + 1,
          rowId: item.row_id,
          materialId: item.material_id,
          materialDescription: item.material_name || "",
          unit: item.unit || "",
          qty: item.qty || "",
          poQty: item.po_qty || 0,
          stockQty: item.stock_qty || 0,
          finalQty: item.final_qty || 0,
          stockPoQty: item.stock_po_qty || 0,
          total: item.total || "",
          comment: item.comment || "",
          assignedBy: item.swap_by || "",
          timestamp: item.swap_date || "",
          status: item.status || "0",
        }));

        setRowData(mappedData);
        setFileName(`File-${fileId}`);
        setRevision(result.revision || "1");
      }
    } catch (error) {
      console.error("Error fetching material swap data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterialList = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/MaterialListApi.php`);
      const data = await response.json();
      if (data.status === "success" && Array.isArray(data.data)) {
        setMaterialList(data.data);
      }
    } catch (error) {
      console.error("Error fetching material list:", error);
    }
  };

  const fetchUnitList = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/UnitListApi.php`);
      const data = await response.json();
      if (data.status === "success" && Array.isArray(data.data)) {
        setUnitList(data.data);
      }
    } catch (error) {
      console.error("Error fetching unit list:", error);
    }
  };

  useEffect(() => {
    fetchMaterialSwapData();
    fetchMaterialList();
    fetchUnitList();
  }, [fileId]);

  const handleNumberInput = (e, setter) => {
    let value = e.target.value;

    // 1. prevent negative
    if (value.startsWith("-")) return;

    // 2. prevent decimals
    if (value.includes(".")) return;

    // 3. allow only digits
    if (!/^\d*$/.test(value)) return;

    // 4. digit limit (4 digits example)
    if (value.length > 4) return;

    // update state
    setter(value);
  };

  // print function
  // const handlePrintGrid = () => {
  //   if (!gridRef.current) {
  //     alert("Grid not ready yet");
  //     return;
  //   }

  //   const gridHtml = document.querySelector(".ag-theme-alpine").outerHTML;

  //   const newWindow = window.open("", "_blank", "width=900,height=700");
  //   if (!newWindow) {
  //     alert("Please allow pop-ups for this site to print the grid.");
  //     return;
  //   }

  //   newWindow.document.write(`
  //   <html>
  //     <head>
  //       <title>Print Grid Data</title>

  //       <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ag-grid-community/styles/ag-grid.css">
  //       <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ag-grid-community/styles/ag-theme-alpine.css">

  //     </head>
  //     <body>
  //       <h2>Material Swap Electrical</h2>
  //       ${gridHtml}
  //       <script>
  //         window.onload = function() {
  //           window.print();
  //         };
  //       </script>
  //     </body>
  //   </html>
  // `);

  //   newWindow.document.close();
  // };

  function handlePrintGrid() {
    const api = gridApiRef.current;
    const columnApi = columnApiRef.current;

    if (!api || !columnApi) {
      alert("Grid not ready yet");
      return;
    }

    // 1. Disable row virtualization (Official way)
    api.setDomLayout && api.setDomLayout("print");
    // if setDomLayout not available, fallback:
    if (api.refreshClientSideRowModel) {
      api.refreshClientSideRowModel("everything");
    }

    // 2. Expand width = sum of all column widths
    const allColumns = columnApi.getAllGridColumns();
    const totalWidth = allColumns.reduce(
      (sum, col) => sum + col.getActualWidth(),
      0
    );

    const gridDiv = document.querySelector(".ag-theme-alpine");
    const originalWidth = gridDiv.style.width;

    gridDiv.style.width = totalWidth + "px";

    setTimeout(() => {
      const gridHtml = gridDiv.outerHTML;

      const newWindow = window.open("", "_blank", "width=1200,height=800");

      newWindow.document.write(`
      <html>
      <head>
        <title>Print Grid</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ag-grid-community/styles/ag-grid.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ag-grid-community/styles/ag-theme-alpine.css" />
        <style>
          body { margin: 20px; font-family: Arial; }
        </style>
      </head>
      <body>
        <h2>Grid Data</h2>
        ${gridHtml}
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `);

      newWindow.document.close();

      // 3. Restore the original layout
      setTimeout(() => {
        api.setDomLayout && api.setDomLayout(null);
        gridDiv.style.width = originalWidth;
        api.refreshClientSideRowModel &&
          api.refreshClientSideRowModel("everything");
      }, 500);
    }, 300);
  }

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

  // Editable input cell component
  const EditableInputCell = (props) => {
    const { value, node, colDef, api } = props;
    const [inputValue, setInputValue] = React.useState(value || "");

    React.useEffect(() => {
      setInputValue(value || "");
    }, [value]);

    const handleChange = (e) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      node.setDataValue(colDef.field, newValue);
      api.refreshCells({ rowNodes: [node], columns: [colDef.field] });
    };

    return (
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        style={{
          width: "100%",
          height: "100%",
          border: "1px solid #ddd",
          borderRadius: "3px",
          padding: "4px",
          textAlign: "center",
          fontSize: isMobile ? "10px" : "11px",
          backgroundColor: "transparent",
          outline: "none",
        }}
        onFocus={(e) => {
          e.target.style.border = "2px solid #007bff";
        }}
        onBlur={(e) => {
          e.target.style.border = "1px solid #ddd";
        }}
      />
    );
  };

  const saveButtonRenderer = (params) => {
    const handleSave = async () => {
      try {
        console.log("Saving data for:", params.data);
        const shortName = sessionStorage.getItem("shortname");

        if (!shortName) {
          alert("User not logged in. Please login first.");
          return;
        }

        const formData = new FormData();
        formData.append("shortName", shortName);
        formData.append("rowid", params.data.rowId);
        formData.append("materialName", params.data.materialDescription);
        formData.append("unit", params.data.unit);
        formData.append("qty", params.data.qty || "0");
        formData.append("comment", params.data.comment || "");
        formData.append("revision", revision);

        if (params.data.materialDescription === "Total") {
          formData.append("totalId", params.data.rowId);
          formData.append("total", params.data.total || "0");
        }

        console.log("Sending data to API:", Object.fromEntries(formData));

        const response = await fetch(
          `${API_BASE_URL}/PPC/UpdateAssemblyMaterialApi.php`,
          {
            method: "POST",
            body: formData,
          }
        );

        const result = await response.json();
        console.log("API Response:", result);

        const button = document.getElementById(`save-btn-${params.data.srNo}`);

        if (result.status === "success") {
          if (button) {
            button.style.background = "#28a745";
            button.innerHTML = "✅";
            setTimeout(() => {
              button.style.background =
                "linear-gradient(135deg, #007bff 0%, #0056b3 100%)";
              button.innerHTML = isMobile ? "💾" : "💾 Save";
            }, 2000);
          }
          alert("Material updated successfully!");
          await fetchMaterialSwapData();
        } else {
          if (button) {
            button.style.background = "#dc3545";
            button.innerHTML = "❌";
            setTimeout(() => {
              button.style.background =
                "linear-gradient(135deg, #007bff 0%, #0056b3 100%)";
              button.innerHTML = isMobile ? "💾" : "💾 Save";
            }, 2000);
          }
          alert(`Error: ${result.message || "Update failed"}`);
        }
      } catch (error) {
        console.error("Error saving data:", error);

        const button = document.getElementById(`save-btn-${params.data.srNo}`);
        if (button) {
          button.style.background = "#dc3545";
          button.innerHTML = "❌";
          setTimeout(() => {
            button.style.background =
              "linear-gradient(135deg, #007bff 0%, #0056b3 100%)";
            button.innerHTML = isMobile ? "💾" : "💾 Save";
          }, 2000);
        }

        alert("Error saving data. Please try again.");
      }
    };

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: "100%",
          justifyContent: "center",
        }}
      >
        <button
          id={`save-btn-${params.data.srNo}`}
          onClick={handleSave}
          style={{
            background: "linear-gradient(135deg, #007bff 0%, #0056b3 100%)",
            color: "white",
            border: "none",
            borderRadius: "6px",
            padding: isMobile ? "4px 8px" : "4px 12px",
            fontSize: isMobile ? "9px" : "10px",
            cursor: "pointer",
            boxShadow: "0 2px 4px rgba(0,123,255,0.2)",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
          title="Save Record"
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-1px)";
            e.target.style.boxShadow = "0 4px 8px rgba(0,123,255,0.3)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 2px 4px rgba(0,123,255,0.2)";
          }}
        >
          {isMobile ? "💾" : "💾 Save"}
        </button>
      </div>
    );
  };

  const columnDefs = useMemo(
    () => [
      {
        headerName: "Sr No",
        field: "srNo",
        width: isMobile ? 60 : 80,
        pinned: isMobile ? null : "left",
        editable: false,
        cellStyle: {
          fontWeight: "bold",
          textAlign: "center",
          backgroundColor: "#ff8c42",
          color: "#000",
          fontSize: isMobile ? "10px" : "13px",
        },
      },
      {
        headerName: "Action",
        field: "action",
        width: isMobile ? 70 : 100,
        pinned: isMobile ? null : "left",
        editable: false,
        cellStyle: { backgroundColor: "#ff8c42" },
        cellRenderer: saveButtonRenderer,
      },
      {
        headerName: "Material ID",
        field: "materialId",
        width: isMobile ? 100 : 120,
        editable: false,
        cellStyle: {
          backgroundColor: "#f8f9fa",
          padding: "2px",
          fontSize: isMobile ? "10px" : "13px",
        },
      },
      {
        headerName: "Material Description",
        field: "materialDescription",
        width: isMobile ? 200 : 300,
        cellRenderer: EditableInputCell,
        cellStyle: {
          backgroundColor: "#f8f9fa",
          padding: "2px",
          fontSize: isMobile ? "10px" : "13px",
        },
      },
      {
        headerName: "Unit",
        field: "unit",
        width: isMobile ? 70 : 100,
        cellRenderer: EditableInputCell,
        cellStyle: {
          backgroundColor: "#f8f9fa",
          padding: "2px",
          textAlign: "center",
          fontSize: isMobile ? "10px" : "13px",
        },
      },
      {
        headerName: "Qty",
        field: "qty",
        width: isMobile ? 70 : 100,
        cellRenderer: EditableInputCell,
        cellStyle: {
          backgroundColor: "#f8f9fa",
          padding: "2px",
          textAlign: "center",
          fontSize: isMobile ? "10px" : "13px",
        },
      },
      {
        headerName: isMobile ? "PO Qty" : "Purchased Qty",
        field: "poQty",
        width: isMobile ? 90 : 140,
        editable: false,
        cellStyle: (params) => {
          const style = {
            padding: "2px",
            textAlign: "center",
            fontSize: isMobile ? "10px" : "13px",
          };
          if (params.value > 0) {
            style.backgroundColor = "#d4edda";
            style.color = "#155724";
            style.fontWeight = "bold";
          }
          return style;
        },
        valueFormatter: (params) => {
          if (params.value > 0) {
            return isMobile
              ? `P:${params.value}`
              : `Purchased: ${params.value}\nStock: ${params.data.stockQty}\nFinal: ${params.data.finalQty}`;
          }
          return params.value || "0";
        },
      },
      {
        headerName: isMobile ? "Assign" : "Assign Qty (Po + Stock)",
        field: "stockPoQty",
        width: isMobile ? 80 : 180,
        editable: false,
        cellStyle: (params) => {
          const style = {
            padding: "2px",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: isMobile ? "10px" : "13px",
          };
          if (params.value > 0) {
            style.backgroundColor = "#fff3cd";
            style.color = "#856404";
          } else {
            style.backgroundColor = "#f8d7da";
            style.color = "#721c24";
          }
          return style;
        },
      },
      {
        headerName: "Total",
        field: "total",
        width: isMobile ? 70 : 120,
        editable: false,
        cellStyle: (params) => {
          const style = {
            padding: "2px",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: isMobile ? "10px" : "13px",
          };
          if (params.data.srNo === rowData.length) {
            style.backgroundColor = "#ff8c42";
            style.color = "#000";
            style.fontSize = isMobile ? "11px" : "14px";
          }
          return style;
        },
      },
      {
        headerName: "Comment",
        field: "comment",
        width: isMobile ? 150 : 250,
        cellRenderer: EditableInputCell,
        cellStyle: {
          backgroundColor: "#f8f9fa",
          padding: "2px",
          fontSize: isMobile ? "10px" : "13px",
        },
      },
      {
        headerName: "Edited By",
        field: "assignedBy",
        width: isMobile ? 90 : 120,
        editable: false,
        cellStyle: {
          backgroundColor: "#f8f9fa",
          padding: "2px",
          fontSize: isMobile ? "10px" : "13px",
        },
      },
      {
        headerName: "Datetime",
        field: "timestamp",
        width: isMobile ? 130 : 180,
        editable: false,
        cellStyle: {
          backgroundColor: "#f8f9fa",
          padding: "2px",
          fontSize: isMobile ? "10px" : "13px",
        },
      },
    ],
    [rowData, isMobile]
  );

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      resizable: true,
      filter: false,
      cellStyle: { textAlign: "right" },

    }),
    []
  );

  const handleAddMaterial = async () => {
    if (!selectedMaterial) {
      alert("Please select a material");
      return;
    }

    if (!selectedUnit) {
      alert("Please select a unit");
      return;
    }

    if (!quantityField) {
      alert("Please enter quantity");
      return;
    }

    const employee_id = sessionStorage.getItem("userId");
    const shortName = sessionStorage.getItem("shortname");

    setLoading(true);

    try {
      const checkFormData = new FormData();
      checkFormData.append("matName", selectedMaterial.label);
      checkFormData.append("fileID", fileId);
      checkFormData.append("revision", revision);
      checkFormData.append("employee_id", employee_id);
      checkFormData.append("shortName", shortName);

      console.log("Checking if material exists:", {
        matName: selectedMaterial.label,
        fileID: fileId,
        revision: revision,
      });

      const checkResponse = await fetch(
        `${API_BASE_URL}/checkSwapMaterialApi.php`,
        {
          method: "POST",
          body: checkFormData,
        }
      );

      const checkResult = await checkResponse.json();
      console.log("Check material response:", checkResult);

      if (checkResult.status === "success" && checkResult.exists === true) {
        alert("Material already exists in this file and revision!");
        setLoading(false);
        return;
      }

      const addFormData = new FormData();
      addFormData.append("materialName", selectedMaterial.label);
      addFormData.append("unit", selectedUnit.label);
      addFormData.append("qty", quantityField);
      addFormData.append("fileId", fileId);
      addFormData.append("revision", revision);
      addFormData.append("comment", widthField ? ` ${widthField}` : "");
      addFormData.append("employee_id", employee_id);
      addFormData.append("shortName", shortName);

      console.log("Adding material:", {
        materialName: selectedMaterial.label,
        unit: selectedUnit.label,
        qty: quantityField,
        fileId: fileId,
        revision: revision,
      });

      const addResponse = await fetch(
        `${API_BASE_URL}/PPC/AddAssemblyMaterialApi.php`,
        {
          method: "POST",
          body: addFormData,
        }
      );

      const addResult = await addResponse.json();
      console.log("Add material response:", addResult);

      if (addResult.status === "success") {
        alert("Material added successfully!");

        setSelectedMaterial(null);
        setSelectedUnit(null);
        setWidthField("");
        setQuantityField("");

        await fetchMaterialSwapData();
      } else if (addResult.status === "info") {
        alert(addResult.message || "Material already exists");
      } else {
        alert(`Error: ${addResult.message || "Add failed"}`);
      }
    } catch (error) {
      console.error("Error adding material:", error);
      alert("Error adding material. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleAddForm = () => {
    setShowAddForm(!showAddForm);
    if (showAddForm) {
      setSelectedMaterial(null);
      setSelectedUnit(null);
      setWidthField("");
      setQuantityField("");
    }
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const getThemeStyles = () => {
    if (theme === "dark") {
      return {
        backgroundColor: "linear-gradient(135deg, #1a1d23 0%, #0f1419 100%)",
        color: "#f8f9fa",
        cardBg: "#252b36",
        cardHeader: "linear-gradient(135deg, #2d3748 0%, #1a202c 100%)",
        inputBg: "#1a202c",
        inputBorder: "#4a5568",
        inputColor: "#f7fafc",
        inputFocus: "#4299e1",
      };
    }
    return {
      backgroundColor: "linear-gradient(135deg, #f0f4f8 0%, #d9e8f5 100%)",
      color: "#1a202c",
      cardBg: "#ffffff",
      cardHeader: "linear-gradient(135deg, #ffffff 0%, #f7fafc 100%)",
      inputBg: "#ffffff",
      inputBorder: "#cbd5e0",
      inputColor: "#2d3748",
      inputFocus: "#4299e1",
    };
  };

  const themeStyles = getThemeStyles();
  const gridHeight = isMobile
    ? "calc(100vh - 380px)"
    : isFullScreen
    ? "calc(100vh - 280px)"
    : "600px";

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: themeStyles.inputBg,
      borderColor: state.isFocused
        ? themeStyles.inputFocus
        : themeStyles.inputBorder,
      borderWidth: "2px",
      borderRadius: "8px",
      minHeight: isMobile ? "38px" : "44px",
      boxShadow: state.isFocused
        ? `0 0 0 3px ${themeStyles.inputFocus}20`
        : "none",
      "&:hover": {
        borderColor: themeStyles.inputFocus,
      },
      transition: "all 0.2s ease",
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: themeStyles.inputBg,
      borderRadius: "8px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
      border: `1px solid ${themeStyles.inputBorder}`,
      overflow: "hidden",
      zIndex: 9999,
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#ff8c42"
        : state.isFocused
        ? theme === "dark"
          ? "#2d3748"
          : "#f7fafc"
        : themeStyles.inputBg,
      color: state.isSelected ? "#000" : themeStyles.inputColor,
      cursor: "pointer",
      padding: isMobile ? "10px 12px" : "12px 16px",
      fontSize: isMobile ? "12px" : "14px",
      transition: "all 0.2s ease",
      "&:active": {
        backgroundColor: "#ff8c42",
      },
    }),
    singleValue: (base) => ({
      ...base,
      color: themeStyles.inputColor,
      fontSize: isMobile ? "12px" : "14px",
    }),
    input: (base) => ({
      ...base,
      color: themeStyles.inputColor,
      fontSize: isMobile ? "12px" : "14px",
    }),
    placeholder: (base) => ({
      ...base,
      color: theme === "dark" ? "#a0aec0" : "#718096",
      fontSize: isMobile ? "12px" : "14px",
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: themeStyles.inputColor,
      padding: isMobile ? "4px" : "8px",
      "&:hover": {
        color: "#ff8c42",
      },
    }),
    clearIndicator: (base) => ({
      ...base,
      color: themeStyles.inputColor,
      padding: isMobile ? "4px" : "8px",
      "&:hover": {
        color: "#ff8c42",
      },
    }),
  };

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
      <div className={`container-fluid ${isFullScreen ? "p-0" : ""}`}>
        <div
          className="card"
          style={{
            backgroundColor: themeStyles.cardBg,
            color: themeStyles.color,
            border:
              theme === "dark" ? "1px solid #2d3748" : "1px solid #e2e8f0",
            margin: isFullScreen ? 0 : isMobile ? 10 : 20,
            borderRadius: isFullScreen ? 0 : isMobile ? 8 : 12,
            boxShadow:
              theme === "dark"
                ? "0 20px 40px rgba(0,0,0,0.4)"
                : "0 10px 30px rgba(0,0,0,0.08)",
          }}
        >
          <div
            className="card-header"
            style={{
              background: themeStyles.cardHeader,
              color: themeStyles.color,
              fontFamily: "'Inter', 'Segoe UI', sans-serif",
              padding: isMobile ? "1rem" : "1.5rem 2rem",
              borderBottom: `2px solid ${
                theme === "dark" ? "#2d3748" : "#e2e8f0"
              }`,
            }}
          >
            <div className="row align-items-center g-3">
              <div className="col-12">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: isMobile ? "8px" : "16px",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                  }}
                >
                  <button
                    onClick={toggleAddForm}
                    style={{
                      fontSize: isMobile ? "0.75rem" : "0.875rem",
                      padding: isMobile ? "8px 14px" : "10px 18px",
                      fontWeight: "600",
                      letterSpacing: "0.5px",
                      background: showAddForm
                        ? "linear-gradient(135deg, #dc3545 0%, #c82333 100%)"
                        : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {showAddForm ? "✖ Hide" : "➕ Add"}
                  </button>

                  <div
                    style={{
                      display: "flex",
                      gap: isMobile ? "6px" : "12px",
                      alignItems: "center",
                      flex: isMobile ? "0 0 auto" : 1,
                      minWidth: 0,
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        marginLeft: isMobile ? "0" : "auto",
                        display: "flex",
                        gap: isMobile ? "4px" : "8px",
                      }}
                    >
                      <button
                        onClick={toggleFullScreen}
                        style={{
                          border: `2px solid ${themeStyles.inputBorder}`,
                          backgroundColor: themeStyles.inputBg,
                          color: themeStyles.color,
                          padding: isMobile ? "6px 10px" : "8px 16px",
                          fontWeight: "600",
                          borderRadius: "8px",
                          transition: "all 0.2s ease",
                          cursor: "pointer",
                          fontSize: isMobile ? "12px" : "14px",
                        }}
                      >
                        {isFullScreen ? "📉" : "📈"}
                      </button>
                      <button
                        onClick={toggleTheme}
                        style={{
                          border: `2px solid ${themeStyles.inputBorder}`,
                          backgroundColor: themeStyles.inputBg,
                          color: themeStyles.color,
                          padding: isMobile ? "6px 10px" : "8px 16px",
                          fontWeight: "600",
                          borderRadius: "8px",
                          transition: "all 0.2s ease",
                          cursor: "pointer",
                          fontSize: isMobile ? "12px" : "14px",
                        }}
                      >
                        {theme === "light" ? "🌙" : "☀️"}
                      </button>
                    </div>

                    <div
                      style={{
                        fontSize: isMobile ? "11px" : "14px",
                        fontWeight: "600",
                        whiteSpace: isMobile ? "normal" : "nowrap",
                        padding: isMobile ? "6px 10px" : "8px 16px",
                        backgroundColor:
                          theme === "dark" ? "#2d3748" : "#f7fafc",
                        borderRadius: "8px",
                        border: `2px solid ${themeStyles.inputBorder}`,
                        flex: isMobile ? "1 1 auto" : "auto",
                        minWidth: 0,
                      }}
                    >
                      File: <span style={{ color: "#ff8c42" }}>{fileName}</span>
                      {revision && (
                        <span
                          style={{
                            marginLeft: "8px",
                            color: theme === "dark" ? "#a0aec0" : "#718096",
                            display: isMobile ? "block" : "inline",
                          }}
                        >
                          (Rev: {revision})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {showAddForm && (
                <div className="col-12">
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile
                        ? "1fr"
                        : "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "12px",
                      alignItems: "end",
                      padding: isMobile ? "12px" : "16px",
                      backgroundColor: theme === "dark" ? "#1a202c" : "#f7fafc",
                      borderRadius: "8px",
                      border: `2px solid ${themeStyles.inputBorder}`,
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontSize: isMobile ? "12px" : "13px",
                          fontWeight: "600",
                          color: theme === "dark" ? "#a0aec0" : "#4a5568",
                        }}
                      >
                        Select Material Name
                      </label>
                      <Select
                        value={selectedMaterial}
                        onChange={setSelectedMaterial}
                        options={materialList}
                        styles={selectStyles}
                        placeholder="Select Material..."
                        isClearable
                        isSearchable
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontSize: isMobile ? "12px" : "13px",
                          fontWeight: "600",
                          color: theme === "dark" ? "#a0aec0" : "#4a5568",
                        }}
                      >
                        Select Unit Name
                      </label>
                      <Select
                        value={selectedUnit}
                        onChange={setSelectedUnit}
                        options={unitList}
                        styles={selectStyles}
                        placeholder="Select Unit..."
                        isClearable
                        isSearchable
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontSize: isMobile ? "12px" : "13px",
                          fontWeight: "600",
                          color: theme === "dark" ? "#a0aec0" : "#4a5568",
                        }}
                      >
                        Comment
                      </label>
                      <input
                        type="text"
                        value={widthField}
                        onChange={(e) => setWidthField(e.target.value)}
                        placeholder="Enter comment..."
                        style={{
                          width: "100%",
                          padding: isMobile ? "8px 12px" : "10px 14px",
                          border: `2px solid ${themeStyles.inputBorder}`,
                          borderRadius: "8px",
                          backgroundColor: themeStyles.inputBg,
                          color: themeStyles.inputColor,
                          fontSize: isMobile ? "12px" : "14px",
                          fontWeight: "500",
                          transition: "all 0.2s ease",
                          outline: "none",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = themeStyles.inputFocus;
                          e.target.style.boxShadow = `0 0 0 3px ${themeStyles.inputFocus}20`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = themeStyles.inputBorder;
                          e.target.style.boxShadow = "none";
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontSize: isMobile ? "12px" : "13px",
                          fontWeight: "600",
                          color: theme === "dark" ? "#a0aec0" : "#4a5568",
                        }}
                      >
                        Quantity
                      </label>
                      <input
                        type="number"
                        value={quantityField}
                        onChange={(e) => handleNumberInput(e, setQuantityField)}
                        placeholder="Enter quantity..."
                        style={{
                          width: "100%",
                          padding: isMobile ? "8px 12px" : "10px 14px",
                          border: `2px solid ${themeStyles.inputBorder}`,
                          borderRadius: "8px",
                          backgroundColor: themeStyles.inputBg,
                          color: themeStyles.inputColor,
                          fontSize: isMobile ? "12px" : "14px",
                          fontWeight: "500",
                          transition: "all 0.2s ease",
                          outline: "none",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = themeStyles.inputFocus;
                          e.target.style.boxShadow = `0 0 0 3px ${themeStyles.inputFocus}20`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = themeStyles.inputBorder;
                          e.target.style.boxShadow = "none";
                        }}
                      />
                    </div>

                    <button
                      onClick={handleAddMaterial}
                      style={{
                        background:
                          "linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%)",
                        border: "none",
                        padding: isMobile ? "10px 20px" : "11px 24px",
                        borderRadius: "8px",
                        fontWeight: "600",
                        fontSize: isMobile ? "12px" : "14px",
                        color: "#fff",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        transition: "all 0.2s ease",
                        boxShadow: "0 4px 12px rgba(255, 140, 66, 0.3)",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow =
                          "0 6px 16px rgba(255, 140, 66, 0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow =
                          "0 4px 12px rgba(255, 140, 66, 0.3)";
                      }}
                    >
                      ➕ Add Material
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div style={{ margin: "15px" }}></div>
            <div className="row align-items-center g-3">
              <div className="col-3">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: isMobile ? "8px" : "16px",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                  }}
                >
                  <button
                    onClick={handlePrintGrid}
                    style={{
                      fontSize: isMobile ? "0.75rem" : "0.875rem",
                      padding: isMobile ? "8px 14px" : "10px 18px",
                      fontWeight: "600",
                      letterSpacing: "0.5px",
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "all 0.2s ease",
                    }}
                  >
                    Print
                  </button>
                  <button
                    onClick={autoSizeAll}
                    style={{
                      fontSize: isMobile ? "0.75rem" : "0.875rem",
                      padding: isMobile ? "8px 14px" : "10px 18px",
                      fontWeight: "600",
                      letterSpacing: "0.5px",
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "all 0.2s ease",
                    }}
                  >
                    Auto size Column
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="card-body" style={{ padding: 0 }}>
            {loading ? (
              <div
                style={{
                  padding: isMobile ? "40px" : "60px",
                  textAlign: "center",
                  fontSize: isMobile ? "16px" : "18px",
                  color: theme === "dark" ? "#a0aec0" : "#718096",
                }}
              >
                <div
                  style={{
                    display: "inline-block",
                    width: isMobile ? "40px" : "50px",
                    height: isMobile ? "40px" : "50px",
                    border: "4px solid rgba(255, 140, 66, 0.2)",
                    borderTopColor: "#ff8c42",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                ></div>
                <div style={{ marginTop: "16px" }}>Loading...</div>
              </div>
            ) : (
              <div
                className={
                  theme === "dark" ? "ag-theme-alpine-dark" : "ag-theme-alpine"
                }
                style={{
                  height: gridHeight,
                  width: "100%",
                  "--ag-header-background-color":
                    theme === "dark" ? "#2d3748" : "#f7fafc",
                  "--ag-header-foreground-color":
                    theme === "dark" ? "#f7fafc" : "#2d3748",
                  "--ag-odd-row-background-color":
                    theme === "dark" ? "#1a202c" : "#ffffff",
                  "--ag-background-color":
                    theme === "dark" ? "#252b36" : "#ffffff",
                  "--ag-foreground-color":
                    theme === "dark" ? "#f7fafc" : "#2d3748",
                  "--ag-border-color": theme === "dark" ? "#2d3748" : "#e2e8f0",
                  "--ag-row-hover-color":
                    theme === "dark" ? "#2d3748" : "#f7fafc",
                }}
              >
                <AgGridReact
                  ref={gridRef}
                  gridOptions={gridOptions.current}
                  rowData={rowData}
                  columnDefs={columnDefs}
                  defaultColDef={defaultColDef}
                  pagination={false}
                  suppressMovableColumns={true}
                  suppressCellFocus={false}
                  animateRows={true}
                  domLayout="normal"
                  onGridReady={(params) => {
                    gridApiRef.current = params.api;
                    columnApiRef.current = params.columnApi;
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            .ag-theme-alpine .ag-header-cell,
            .ag-theme-alpine-dark .ag-header-cell {
                font-weight: 600;
                font-size: ${isMobile ? "11px" : "13px"};
                letter-spacing: 0.3px;
            }

            .ag-theme-alpine .ag-cell,
            .ag-theme-alpine-dark .ag-cell {
                font-size: ${isMobile ? "10px" : "13px"};
                line-height: 1.5;
                display: flex;
                align-items: center;
            }

            .ag-theme-alpine .ag-row,
            .ag-theme-alpine-dark .ag-row {
                border-bottom: 1px solid ${
                  theme === "dark" ? "#2d3748" : "#e2e8f0"
                };
            }

            .ag-theme-alpine .ag-row-hover,
            .ag-theme-alpine-dark .ag-row-hover {
                background-color: ${
                  theme === "dark" ? "#2d3748" : "#f7fafc"
                } !important;
            }

            .ag-theme-alpine input[type="text"],
            .ag-theme-alpine-dark input[type="text"] {
                border-radius: 4px;
                padding: ${isMobile ? "4px 8px" : "6px 10px"};
                border: 1px solid ${theme === "dark" ? "#4a5568" : "#cbd5e0"};
                background-color: ${theme === "dark" ? "#1a202c" : "#ffffff"};
                color: ${theme === "dark" ? "#f7fafc" : "#2d3748"};
            }

            .ag-theme-alpine input[type="text"]:focus,
            .ag-theme-alpine-dark input[type="text"]:focus {
                outline: none;
                border-color: #4299e1;
                box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.2);
            }

            .ag-theme-alpine ::-webkit-scrollbar,
            .ag-theme-alpine-dark ::-webkit-scrollbar {
                width: ${isMobile ? "6px" : "10px"};
                height: ${isMobile ? "6px" : "10px"};
            }

            .ag-theme-alpine ::-webkit-scrollbar-track,
            .ag-theme-alpine-dark ::-webkit-scrollbar-track {
                background: ${theme === "dark" ? "#1a202c" : "#f7fafc"};
            }

            .ag-theme-alpine ::-webkit-scrollbar-thumb,
            .ag-theme-alpine-dark ::-webkit-scrollbar-thumb {
                background: ${theme === "dark" ? "#4a5568" : "#cbd5e0"};
                border-radius: 5px;
            }

            .ag-theme-alpine ::-webkit-scrollbar-thumb:hover,
            .ag-theme-alpine-dark ::-webkit-scrollbar-thumb:hover {
                background: #ff8c42;
            }
        `}</style>
    </div>
  );
};
export default PPCElectricalMaterialSwapDetails;
