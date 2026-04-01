import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Container,
  Form,
  Button,
  Row,
  Col,
  Card,
  ButtonGroup,
  Accordion,
  Tab,
  Tabs,
} from "react-bootstrap";
import axios from "axios";
import Select from "react-select";
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
  CellStyleModule,
} from "ag-grid-community";
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
  CellStyleModule,
]);
export default function PPCElectricalAssignRFDMaterialCopy() {
  const [theme, setTheme] = useState("light");
  const [dark, setDark] = useState(false);
  const [file, setFile] = useState([]);
  const tabs = ["Assign From Stock", "Assign from File"];

  const [selectedFile, setSelectedFile] = useState("");
  const [selectedFileTab2LeftGrid, setSelectedFileTab2LeftGrid] = useState("");
  const [selectedFileTab2RightGrid, setSelectedFileTab2RightGrid] =
    useState("");

  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(tabs[0]);
 

  const [tab1LeftData, setTab1LeftData] = useState([]);
  const [tab1RightData, setTab1RightData] = useState([]);

  const [tab2LeftData, setTab2LeftData] = useState([]);
  const [tab2RightData, setTab2RightData] = useState([]);

  const [gridData, setGridData] = useState({});
  const [isFullScreen, setIsFullScreen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [columnDefs, setColumnDefs] = useState([]);

  // TAB 1
  const tab1LeftGridApiRef = useRef(null);
  const tab1RightGridApiRef = useRef(null);

  // TAB 2
  const tab2LeftGridApiRef = useRef(null);
  const tab2RightGridApiRef = useRef(null);

  const leftGridApiRef = useRef(null);
  const rightGridApiRef = useRef(null);
  const leftGridHeight = isMobile ? "300px" : "100%";
  const rightGridHeight = isMobile ? "300px" : "100%";

  //handle excell download
  //   const downloadExcel = () => {
  //     const tab = activeTab;
  //     if (!gridData[tab] || gridData[tab].length === 0) {
  //       showToast("No data available to export", "error");
  //       return;
  //     }

  //     const rows = gridData[tab];
  //     const headers = Object.keys(rows[0]).join(",");
  //     const csvRows = rows.map((row) =>
  //       Object.values(row)
  //         .map((v) => `"${v}"`)
  //         .join(",")
  //     );

  //     const csvContent = [headers, ...csvRows].join("\n");
  //     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  //     const url = URL.createObjectURL(blob);

  //     const a = document.createElement("a");
  //     a.href = url;
  //     a.download = `${tab}.csv`;
  //     a.click();
  //   };

  // Handle window resize
  const autoSizeAll = () => {
    const grid = document.querySelector(".ag-theme-alpine");
    if (!grid) return;

    const api = grid.__agGridInstance?.api;
    if (!api) return;

    const allCols = api.getAllColumns();
    api.autoSizeColumns(allCols);
  };

  //initial Load
  useEffect(() => {
    if (activeTab === "Assign From Stock") {
      fetchFileData();
      fetchTab1LeftData();
      setColumnDefs(generateColumnDefs());
    }
    if (activeTab === "Assign from File") {
    }
  }, [activeTab]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  // Fetch financial year options
  //   useEffect(() => {
  //     const fetchOptions = async () => {
  //       try {
  //         const res = await axios.post(
  //           "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/GetYearsApi.php"
  //         );
  //         if (res.data.status === "success") {
  //           const opts = res.data.data.map((item) => ({
  //             value: item.financial_year,
  //             label: item.financial_year,
  //           }));
  //           setOptions(opts);
  //           const defaultYear = opts.find((opt) => opt.value === "25-26");
  //           if (defaultYear) {
  //             setSelectedOption(defaultYear);
  //             fetchTabData();
  //           }
  //         }
  //       } catch (err) {
  //         console.error("Error fetching dropdown options:", err);
  //       }
  //     };
  //     fetchOptions();
  //   }, []);

  //searchable dropdown
  const SearchableDropdown = ({
    label,
    options = [],
    value,
    onSelect,
    theme,
  }) => {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState("");

    // find label of current value (so main box shows name)
    const selectedLabel =
      options.find((o) => String(o.value) === String(value))?.label || "";

    const filtered = options.filter((opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase())
    );

    // close on outside click
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
      <div style={{ width: "50%", position: "relative" }} ref={containerRef}>
        <label
          style={{
            paddingLeft: "10px",
            fontSize: "1.1rem",
            marginBottom: "8px",
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
            marginBottom: "8px",
            fontSize: "1.1rem",
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
              backgroundColor: theme === "dark" ? "#343a40" : "#ffffffff",
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
  //Select electrical file dropdown function
  function handleElectricalFileChange(value) {
    setSelectedFile(value);
    fetchTab1RightData(value);
  }
  function handleElectricalFileChangeTab2LeftGrid(value) {
    setSelectedFileTab2LeftGrid(value);
    fetchTab2LeftData(value);
  }
  function handleElectricalFileChangeTab2RightGrid(value) {
    setSelectedFileTab2RightGrid(value);
    fetchTab2RightData(value);
  }

  const DualGridLayout = ({
    leftData,
    rightData,
    leftCols,
    rightCols,
    isMobile,
    gridHeight,
    onLeftGridReady,
    onRightGridReady,
  }) => (
    <div
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        gap: "8px",
        height: isMobile ? "auto" : gridHeight,
        width: "100%",
        overflow: "hidden",
      }}
    >
      {/* LEFT GRID */}
      <div style={{ flex: 1, width: "100%" }}>
        <div
          className="ag-theme-alpine"
          style={{ height: isMobile ? "300px" : "100%", width: "100%" }}
        >
          <AgGridReact
            rowData={leftData}
            columnDefs={leftCols}
            defaultColDef={defaultColDef}
            onGridReady={onLeftGridReady}
            pagination={true}
            paginationPageSize={isMobile ? 10 : 20}
            rowSelection="single"
            suppressMovableColumns={true}
            enableRangeSelection={!isMobile}
            floatingFilter={!isMobile}
            suppressColumnVirtualisation={isMobile}
            animateRows={!isMobile}
            enableCellTextSelection={true}
            suppressHorizontalScroll={false}
            headerHeight={isMobile ? 40 : 48}
            rowHeight={isMobile ? 35 : 42}
          />
        </div>
      </div>

      {/* RIGHT GRID */}
      <div style={{ flex: 1, width: "100%" }}>
        <div
          className="ag-theme-alpine"
          style={{ height: isMobile ? "300px" : "100%", width: "100%" }}
        >
          <AgGridReact
            rowData={rightData}
            columnDefs={rightCols}
            defaultColDef={defaultColDef}
            onGridReady={onRightGridReady}
            pagination={true}
            paginationPageSize={isMobile ? 10 : 20}
            rowSelection="single"
            suppressMovableColumns={true}
            enableRangeSelection={!isMobile}
            floatingFilter={!isMobile}
            suppressColumnVirtualisation={isMobile}
            animateRows={!isMobile}
            enableCellTextSelection={true}
            suppressHorizontalScroll={false}
            headerHeight={isMobile ? 40 : 48}
            rowHeight={isMobile ? 35 : 42}
          />
        </div>
      </div>
    </div>
  );

  //send data
  const handleSendData = async () => {
    try {
      if (activeTab !== "Assign From Stock") return;

      if (!tab1LeftGridApiRef.current) {
        alert("Tab 1 left grid not ready");
        return;
      }

      if (!tab1RightGridApiRef.current) {
        alert("Tab 1 right grid not ready");
        return;
      }
      const shortName = sessionStorage.getItem("shortname");

      if (!shortName) {
        alert("User not logged in. Please login first.");
        return;
      }

      const dataToSend = [];
      const validLeftRows = tab1LeftData.filter(
        (item) => Number(item.assignQty1) > 0
      );

      const stockData = validLeftRows.map((item) => ({
        materialID: item.materialID,
        makeid: item.makeid,
        assignQty1: String(item.assignQty1), // ensure string
      }));
      const fileData = tab1RightData
        .filter((row) => row.comment && row.comment.trim() !== "")
        .map((row) => ({
          materialID: row.materialID,
          makeid: row.makeid,
          comment: row.comment.trim(),
        }));
      if (stockData.length === 0) {
        alert("Please assign quantity before submitting");
        return;
      }

      dataToSend.push({
        fileID: selectedFile,
        stockData,
        fileData,
      });

      if (dataToSend.length === 0) {
        alert("No items selected for return");
        return;
      }

      console.log("Sending payload:", dataToSend);
      const response = await fetch(
        "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/saveAssignRfdFromStockApi.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSend[0]),
        }
      );

      const result = await response.json();

      if (result.status === "success") {
        showToast("Material return request submitted", "success");
      } else {
        showToast(result.message || "Failed to submit return", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("API Error: " + error.message, "error");
    }
  };

  // assign from file submit function
  const handleAssignFromFile = async () => {
    try {
      if (activeTab !== "Assign from File") return;

      if (!tab2LeftGridApiRef.current) {
        alert("Tab 2 left grid not ready");
        return;
      }

      if (!tab2RightGridApiRef.current) {
        alert("Tab 2 right grid not ready");
        return;
      }
      const shortName = sessionStorage.getItem("shortname");

      if (!shortName) {
        alert("User not logged in. Please login first.");
        return;
      }

      const dataToSend = [];
      const validLeftRows = tab2LeftData.filter(
        (item) => Number(item.assign1) > 0
      );

      const stockData = validLeftRows.map((item) => ({
        materialID: item.materialID,
        makeid: item.makeid,
        assign1: String(item.assign1), // ensure string
      }));
      const fileData = tab2RightData
        .filter((row) => row.comment1 && row.comment1.trim() !== "")
        .map((row) => ({
          materialID: row.materialID,
          makeid: row.makeid,
          comment1: row.comment1.trim(),
        }));
      if (stockData.length === 0) {
        alert("Please assign quantity before submitting");
        return;
      }

      dataToSend.push({
        FromFileID: selectedFileTab2RightGrid,
        TofileID: selectedFileTab2LeftGrid,
        stockData,
        fileData,
      });

      if (dataToSend.length === 0) {
        alert("No items selected for return");
        return;
      }

      console.log("Sending payload:", dataToSend);
      const response = await fetch(
        "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/saveAssignRfdFromFileApi.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSend[0]),
        }
      );

      const result = await response.json();

      if (result.status === "success") {
        showToast("Material return request submitted", "success");
      } else {
        showToast(result.message || "Failed to submit return", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("API Error: " + error.message, "error");
    }
  };

  //tab1 left column definitions
  const generateColumnDefs = () => {
    const baseColumns = [
      {
        headerName: "Sr No",
        field: "serialNumber",
        valueGetter: (params) => (params.node ? params.node.rowIndex + 1 : ""),
        width: isMobile ? 120 : 200,
        minWidth: isMobile ? 90 : 150,
        pinned: "left",
        lockPosition: true,
        cellStyle: { textAlign: "center" },
      },
      {
        headerName: "Material Name",
        field: "materialName",
        width: isMobile ? 120 : 200,
        minWidth: isMobile ? 90 : 150,
        pinned: "left",
      },
      {
        headerName: " Make",
        field: "make",
        width: isMobile ? 120 : 200,
        minWidth: isMobile ? 90 : 150,
        pinned: "left",
      },
      {
        headerName: "Stock Qty",
        field: "stock",
        width: isMobile ? 120 : 200,
        minWidth: isMobile ? 90 : 150,
        valueFormatter: (params) => String(params.value),
      },

      {
        headerName: " Assign Qty",
        field: "assignQty1",
        width: isMobile ? 120 : 200,
        minWidth: isMobile ? 90 : 150,
        editable: true,
        singleClickEdit: true,
        cellEditor: "agTextCellEditor",

        valueParser: (params) => {
          const v = Number(params.newValue);
          return isNaN(v) ? "" : v;
        },

        valueSetter: (params) => {
          const newValue = Number(params.newValue);
          if (isNaN(newValue) || newValue < 0) {
            alert(`Please enter a valid positive number.`);
            return false;
          }

          params.data.assignQty1 = newValue;
        },
      },
    ];

    return baseColumns;
  };
  //tab 1 right column def
  const rightColumnDefs = useMemo(
    () => [
      {
        headerName: "Sr No",
        field: "serialNumber",
        valueGetter: (params) => (params.node ? params.node.rowIndex + 1 : ""),
        width: isMobile ? 120 : 200,
        minWidth: isMobile ? 90 : 150,
        pinned: "left",
        lockPosition: true,
        cellStyle: { textAlign: "center" },
      },
      {
        headerName: "Material Name",
        field: "materialName",
        width: isMobile ? 120 : 200,
        minWidth: isMobile ? 90 : 150,
        pinned: "left",
      },
      {
        headerName: " Make",
        field: "make",
        width: isMobile ? 120 : 200,
        minWidth: isMobile ? 90 : 150,
        pinned: "left",
      },
      {
        headerName: "Required Qty",
        field: "Qty1",
        width: isMobile ? 120 : 200,
        minWidth: isMobile ? 90 : 150,
        valueFormatter: (params) => String(params.value),
      },
      {
        headerName: "Assign Qty",
        field: "stock",
        width: isMobile ? 120 : 200,
        minWidth: isMobile ? 90 : 150,
        valueFormatter: (params) => String(params.value),
      },
      {
        headerName: " Comment",
        field: "comment",
        width: isMobile ? 120 : 200,
        minWidth: isMobile ? 90 : 150,
        editable: true,
        singleClickEdit: true,
        cellEditor: "agTextCellEditor",

        valueSetter: (params) => {
          const newValue = String(params.newValue);

          params.data.comment = newValue;
        },
      },
    ],
    []
  );
  //tab2 left col def
  const tab2LeftColDefs = useMemo(
    () => [
      {
        headerName: "Sr No",
        field: "serialNumber",
        valueGetter: (params) => (params.node ? params.node.rowIndex + 1 : ""),
        width: isMobile ? 120 : 200,
        minWidth: isMobile ? 90 : 150,
        pinned: "left",
        lockPosition: true,
        cellStyle: { textAlign: "center" },
      },
      {
        headerName: "Material Name",
        field: "materialName",
        width: isMobile ? 120 : 200,
        minWidth: isMobile ? 90 : 150,
        pinned: "left",
      },
      {
        headerName: " Make",
        field: "make",
        width: isMobile ? 120 : 200,
        minWidth: isMobile ? 90 : 150,
        pinned: "left",
      },
      {
        headerName: "Stock Qty",
        field: "stock",
        width: isMobile ? 120 : 200,
        minWidth: isMobile ? 90 : 150,
        valueFormatter: (params) => String(params.value),
      },

      {
        headerName: " Assign Qty",
        field: "assign1",
        width: isMobile ? 120 : 200,
        minWidth: isMobile ? 90 : 150,
        editable: true,
        singleClickEdit: true,
        cellEditor: "agTextCellEditor",

        valueParser: (params) => {
          const v = Number(params.newValue);
          return isNaN(v) ? "" : v;
        },

        valueSetter: (params) => {
          const newValue = Number(params.newValue);
          if (isNaN(newValue) || newValue < 0) {
            alert(`Please enter a valid positive number.`);
            return false;
          }

          params.data.assign1 = newValue;
        },
      },
    ],
    []
  );

  // tab2 right col def

  const tab2RightColDefs = useMemo(() => [
    {
      headerName: "Sr No",
      field: "serialNumber",
      valueGetter: (params) => (params.node ? params.node.rowIndex + 1 : ""),
      width: isMobile ? 120 : 200,
      minWidth: isMobile ? 90 : 150,
      pinned: "left",
      lockPosition: true,
      cellStyle: { textAlign: "center" },
    },
    {
      headerName: "Material Name",
      field: "materialName",
      width: isMobile ? 120 : 200,
      minWidth: isMobile ? 90 : 150,
      pinned: "left",
    },
    {
      headerName: " Make",
      field: "make",
      width: isMobile ? 120 : 200,
      minWidth: isMobile ? 90 : 150,
      pinned: "left",
    },
    {
      headerName: "Required Qty",
      field: "qty",
      width: isMobile ? 120 : 200,
      minWidth: isMobile ? 90 : 150,
      valueFormatter: (params) => String(params.value),
    },
    {
      headerName: "Assign Qty",
      field: "stock",
      width: isMobile ? 120 : 200,
      minWidth: isMobile ? 90 : 150,
      valueFormatter: (params) => String(params.value),
    },
    {
      headerName: " Comment",
      field: "comment1",
      width: isMobile ? 120 : 200,
      minWidth: isMobile ? 90 : 150,
      editable: true,
      singleClickEdit: true,
      cellEditor: "agTextCellEditor",

      valueSetter: (params) => {
        const newValue = String(params.newValue);

        params.data.comment1 = newValue;
      },
    },
  ]);
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

  // Fetch tab data
  const fetchTab1LeftData = async () => {
    try {
      const res = await axios.get(
        `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/ElectricalStockDataApi.php`
      );
      if (res.data.status === "success") setTab1LeftData(res.data.data || []);
    } catch (err) {
      console.error("Error fetching tab data:", err);
    }
  };
  const fetchTab1RightData = async (fileId) => {
    try {
      const res = await axios.get(
        `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/ElectricalFileStockDataApi.php?fileId=${fileId}`
      );
      if (res.data.status === "success") setTab1RightData(res.data.data || []);
    } catch (err) {
      console.error("Error fetching tab data:", err);
    }
  };
  const fetchTab2RightData = async (fileId) => {
    try {
      const res = await axios.get(
        `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/getElectricalFromFileDataApi.php?fileID=${fileId}`
      );
      if (res.data.status === "success") setTab2RightData(res.data.data || []);
    } catch (err) {
      console.error("Error fetching tab data:", err);
    }
  };
  const fetchTab2LeftData = async (fileId) => {
    try {
      const res = await axios.get(
        `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/getElectricalToFileDataApi.php?fileID=${fileId}`
      );
      if (res.data.status === "success") setTab2LeftData(res.data.data || []);
    } catch (err) {
      console.error("Error fetching tab data:", err);
    }
  };
  const fetchFileData = async () => {
    try {
      const res = await axios.get(
        "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/file_master.php"
      );
      if (res.data.status === "success") {
        setFile(res.data.files || []);
      }
    } catch (err) {
      console.error("Error fetching File data:", err);
    }
  };
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
  // // Handle Select change
  // const handleYearChange = (option) => {
  //   setSelectedOption(option);
  //   fetchTabData(field);
  // };
  const handleRefresh = () => {
    fetchFileData();
    fetchTab1LeftData();
  };
  // // Handle file selection
  // const handleFileChange = (e) => setFile(e.target.files[0]);

  // // Submit upload
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (!file || !selectedOption) {
  //     alert("Please select a file and a financial year!");
  //     return;
  //   }
  //   const formData = new FormData();
  //   formData.append("filename[]", file);
  //   formData.append("financial_year", selectedOption.value);

  //   try {
  //     const res = await fetch(
  //       "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/upload_manfact_data_23.php",
  //       { method: "POST", body: formData }
  //     );
  //     const data = await res.json();
  //     if (data.success) {
  //       alert("File uploaded successfully!");
  //       setGridData(data.tabData || {});
  //     } else {
  //       alert("Upload failed: " + data.message);
  //     }
  //   } catch (err) {
  //     console.error("Upload error:", err);
  //     alert("Upload failed!");
  //   }
  // };

  // Generate AG Grid columns dynamically
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
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

  if (loading && gridData.length === 0) {
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
          <p className="mt-3">Loading data...</p>
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
        overflowX: "hidden",
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
                <h4 className="mb-0">Assign RFD Material </h4>
              </Col>
              {/* Action Buttons */}
              <Col xs={12} lg={6}>
                <div className="d-flex justify-content-end gap-2 flex-wrap align-items-center">
                  <ButtonGroup size="sm">
                    <Button variant="success" onClick={handleRefresh}>
                      <i className="bi bi-arrow-clockwise"></i>
                      {!isMobile && " Refresh"}
                    </Button>
                  </ButtonGroup>

                  <ButtonGroup size="sm">
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
        </Card>
        <div style={{ height: "10px" }}></div>

        {/* Tabs Menu */}
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
          <Card.Body
            style={{
              backgroundColor: themeStyles.cardBg,
              padding: isFullScreen ? 3 : 15,
            }}
          >
            <Tabs
              id="controlled-tab-example"
              activeKey={activeTab}
              onSelect={(tab) => setActiveTab(tab)}
              className="mb-3"
            >
              <Tab eventKey="Assign From Stock" title="Assign From Stock">
                <div
                  key="Assign From Stock"
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
                  <Row className="align-items-center">
                    <Col xs={12} lg={4} className="mb-2 mb-lg-0">
                      <SearchableDropdown
                        label="Select File Name"
                        theme={theme}
                        options={file.map((e) => ({
                          label: e.FILE_NAME,
                          value: e.FILE_ID,
                        }))}
                        value={selectedFile}
                        onSelect={handleElectricalFileChange}
                      />
                    </Col>
                    <Col xs={12} lg={3} className="mb-2 mb-lg-0">
                      <ButtonGroup size="sm">
                        <Button
                          className="btn btn-primary"
                          onClick={handleSendData}
                        >
                          Assign Material From Stock
                        </Button>
                      </ButtonGroup>
                    </Col>
                  </Row>

                  <DualGridLayout
                    leftData={tab1LeftData}
                    rightData={tab1RightData}
                    leftCols={columnDefs}
                    rightCols={rightColumnDefs}
                    isMobile={isMobile}
                    gridHeight={gridHeight}
                    onLeftGridReady={(p) => {
                      tab1LeftGridApiRef.current = p.api;
                      setTimeout(() => autoSizeAll(), 500);
                    }}
                    onRightGridReady={(p) => {
                      tab1RightGridApiRef.current = p.api;
                      setTimeout(() => autoSizeAll(), 500);
                    }}
                  />
                </div>
              </Tab>
              <Tab eventKey="Assign from File" title="Assign from File">
                <div
                  key="Assign From File"
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
                  <Row className="align-items-center">
                    <Col xs={12} lg={4} className="mb-2 mb-lg-0">
                      <SearchableDropdown
                        label="Select File Name"
                        theme={theme}
                        options={file.map((e) => ({
                          label: e.FILE_NAME,
                          value: e.FILE_ID,
                        }))}
                        value={selectedFileTab2LeftGrid}
                        onSelect={handleElectricalFileChangeTab2LeftGrid}
                      />
                    </Col>
                    <Col xs={12} lg={4} className="mb-2 mb-lg-0">
                      <SearchableDropdown
                        label="Select File Name"
                        theme={theme}
                        options={file.map((e) => ({
                          label: e.FILE_NAME,
                          value: e.FILE_ID,
                        }))}
                        value={selectedFileTab2RightGrid}
                        onSelect={handleElectricalFileChangeTab2RightGrid}
                      />
                    </Col>
                    <Col xs={12} lg={3} className="mb-2 mb-lg-0">
                      <ButtonGroup size="sm">
                        <Button
                          className="btn btn-primary"
                          onClick={handleAssignFromFile}
                        >
                          Assign Material From File
                        </Button>
                      </ButtonGroup>
                    </Col>
                  </Row>

                  <DualGridLayout
                    leftData={tab2LeftData}
                    rightData={tab2RightData}
                    leftCols={tab2LeftColDefs}
                    rightCols={tab2RightColDefs}
                    isMobile={isMobile}
                    gridHeight={gridHeight}
                    onLeftGridReady={(p) => {
                      tab2LeftGridApiRef.current = p.api;
                      setTimeout(() => autoSizeAll(), 500);
                    }}
                    onRightGridReady={(p) => {
                      tab2RightGridApiRef.current = p.api;
                      setTimeout(() => autoSizeAll(), 500);
                    }}
                  />
                </div>
              </Tab>
            </Tabs>
          </Card.Body>
          <Card.Body
            style={{
              backgroundColor: themeStyles.cardBg,
              padding: isFullScreen ? 0 : 15,
            }}
          ></Card.Body>
        </Card>
      </Container>
    </div>
  );
}
