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
  ColumnAutoSizeModule,
  TextEditorModule,
  RowApiModule,
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
  ColumnAutoSizeModule,
  TextEditorModule,
  RowApiModule,
]);

/**
 * SearchableDropdown
 * - Placed in same file (as requested).
 * - Minimal, uses same inline style pattern and respects `theme` prop.
 * - props:
 *    label: string shown above box
 *    options: [{ label, value }]
 *    value: currently selected value (value)
 *    onSelect: function(value) -> called when user picks an option
 */
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
    <div style={{ width: "100%", position: "relative" }} ref={containerRef}>
      <label
        style={{
          fontSize: "1.2rem",
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
          fontSize: "1.2rem",
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

const PPCElectricalSendRfdMaterialToPackagingList = () => {
  const [theme, setTheme] = useState("light");
  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([]);
  const [isFullScreen, setIsFullScreen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [selectedFinancialYear, setSelectedFinancialYear] = useState("");
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [selectedElectricalFile, setSelectedElectricalFile] = useState([]);
  const [electricalFileList, setElectricalFileList] = useState([]);
  const [isAddExtraMaterial, setIsAddExtraMaterial] = useState(false);
  const [electricalMaterialList, setElectricalMaterialList] = useState([]);
  const [selectedElectricalMaterial, setSelectedElectricalMaterial] = useState(
    []
  );
  const [electricalMakeList, setElectricalMakeList] = useState([]);
  const [selectedMake, setSelectedMake] = useState([]);
  const [availableStock, setAvailableStock] = useState("");
  const [isInvalid, setIsInvalid] = useState(false);
  const [assignFileStock, setAssignFileStock] = useState("");
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
  }, [isMobile]);

  const onCellValueChanged = (event) => {
    if (event.colDef.field === "box_no") {
      console.log("Cell Value Changed for box_no:", event.newValue);

      const newRowData = [];
      event.api.forEachNode((node) => newRowData.push(node.data));
      setRowData(newRowData);
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
        field: "materialName",
        headerName: "Material Name",
        width: isMobile ? 200 : 280,
        pinned: "left",
        headerCheckboxSelection: false,
        lockPosition: true,
        cellStyle: { fontWeight: "bold" },
      },
      {
        field: "unit",
        headerName: "Unit",
        width: isMobile ? 180 : 280,
        minWidth: 150,
      },
      {
        field: "fileqty",
        headerName: "File Qty",
        width: isMobile ? 180 : 280,
        minWidth: 150,
      },
      {
        field: "disQty",
        headerName: "Dispatch Qty",
        width: isMobile ? 180 : 280,
        minWidth: 150,
      },
      {
        field: "dispatch_qty",
        headerName: "Remaining Qty",
        width: isMobile ? 180 : 280,
        minWidth: 150,
      },
      {
        field: "enterQty",
        headerName: "Enter Qty",
        width: isMobile ? 180 : 280,
        minWidth: 150,
      },
      {
        field: "box_no",
        headerName: "Box No",
        width: isMobile ? 150 : 200,
        minWidth: 150,
        editable: true,
        cellEditor: "agTextCellEditor",
        valueSetter: (params) => {
          const newValue = parseInt(params.newValue);
          if (isNaN(newValue) || newValue < 0) {
            showToast("Box No must be a valid positive number.", "error");
            return false;
          }
          params.data.box_no = newValue;
          return true;
        },
      },
      {
        field: "dispatch_date",
        headerName: "Dispatch Date",
        filter: "agDateColumnFilter",
        filterParams: {
          buttons: ["reset", "apply"],
          comparator: (filterLocalDateAtMidnight, cellValue) => {
            if (!cellValue) return -1;

            const cleaned = cellValue.replace(/\\/g, "").trim();

            const [day, month, year] = cleaned.split("/");

            const cellDate = new Date(`${year}-${month}-${day}`);

            if (isNaN(cellDate.getTime())) return -1;

            const cell = cellDate.setHours(0, 0, 0, 0);
            const filter = filterLocalDateAtMidnight.getTime();

            if (cell === filter) return 0;
            return cell < filter ? -1 : 1;
          },
        },
        width: isMobile ? 200 : 280,
        cellStyle: { fontWeight: "bold" },
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

  //   Fetch PPC ELectrical File Details
  const fetchElectricalFileDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/get_SendRfdPck_23.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ FILE_ID: selectedElectricalFile }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "success" && Array.isArray(data.data)) {
        setRowData(data.data);
        showToast(
          `Loaded ${data.count} records for File ${selectedElectricalFile}`,
          "success"
        );
      } else if (Array.isArray(data)) {
        setRowData(data);
        showToast(
          `Loaded ${data.length} records for File ${selectedElectricalFile}`,
          "success"
        );
      } else {
        setRowData([]);
        showToast("No data found for selected File", "info");
      }
    } catch (error) {
      console.error("Error fetching electrical file data:", error);
      showToast(`Error fetching data: ${error.message}`, "error");
      setRowData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch electrical file list
  const fetchElectricalFileList = async () => {
    setLoadingFiles(true);
    try {
      const response = await fetch(
        "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/get_filename_forsendRfdStk.php",
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

      let ElectricalFileData = [];
      if (data.status === "success" && Array.isArray(data.data)) {
        ElectricalFileData = data.data;
      } else if (Array.isArray(data)) {
        ElectricalFileData = data;
      }

      setElectricalFileList(ElectricalFileData);
    } catch (error) {
      console.error("Error fetching Electrical Files:", error);
      showToast(`Error loading Electrical Files: ${error.message}`, "error");
    } finally {
      setLoadingFiles(false);
    }
  };
  // fetch electrical material list
  const fetchElectricalMaterialList = async () => {
    setLoadingFiles(true);
    try {
      const response = await fetch(
        "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/get_materiallist_for_rfdsendstk.php",
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

      let ElectricalMaterailData = [];
      if (data.status === "success" && Array.isArray(data.data)) {
        ElectricalMaterailData = data.data;
      } else if (Array.isArray(data)) {
        ElectricalMaterailData = data;
      }

      setElectricalMaterialList(ElectricalMaterailData);
    } catch (error) {
      console.error("Error fetching Electrical Materials:", error);
      showToast(
        `Error loading Electrical Materials: ${error.message}`,
        "error"
      );
    } finally {
      setLoadingFiles(false);
    }
  };

  // fetch electrical make list
  const fetchElectricalMakeList = async () => {
    setLoadingFiles(true);
    try {
      const response = await fetch(
        "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/get_makelist_for_rfdsendStk.php",
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

      let ElectricalMakeData = [];
      if (data.status === "success" && Array.isArray(data.data)) {
        ElectricalMakeData = data.data;
      } else if (Array.isArray(data)) {
        ElectricalMakeData = data;
      }

      setElectricalMakeList(ElectricalMakeData);
    } catch (error) {
      console.error("Error fetching Make:", error);
      showToast(`Error loading Make: ${error.message}`, "error");
    } finally {
      setLoadingFiles(false);
    }
  };

  // Initial load
  useEffect(() => {
    setColumnDefs(generateColumnDefs());
    fetchElectricalFileList();
  }, [isMobile]);

  // Load data when file name changes
  useEffect(() => {
    if (selectedElectricalFile) {
      fetchElectricalFileDetails();
    }
  }, [selectedElectricalFile]);

  //Load When Add extra Material Toggles
  useEffect(() => {
    if (isAddExtraMaterial) {
      fetchElectricalMaterialList();
      fetchElectricalMakeList();
    }
  }, [isAddExtraMaterial]);

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

  //Select electrical file dropdown function
  function handleElectricalFileChange(event) {
    setSelectedElectricalFile(event.target.value);
    console.log(selectedElectricalFile);
  }

  const handleNumberInput = (e, setter, invalidSetter) => {
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

    // 5. validation
    invalidSetter(value !== "" && isNaN(Number(value)));
  };

  // action button function
  const handleSave = (params) => {
    const rowData = params.data;
    console.log("Saving row:", rowData);

    // Call your API here
  };

  // Assign Extra Material Function button function

  const handleAssignExtraMaterial = async () => {
    if (!selectedElectricalMaterial.trim()) {
      showToast("Please select a Material.", "error");
      return;
    }
    if (!selectedMake.trim()) {
      showToast("Please select a make.", "error");
      return;
    }
    if (!assignFileStock.trim()) {
      showToast("Please enter an Assign Stock.", "error");
      return;
    }

    try {
      const response = await fetch(
        "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/saveExtraMaterialEle_23.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            file_stock: assignFileStock,
            stock: availableStock,
            makeID: selectedMake,
            materialID: selectedElectricalMaterial,
            FileID: selectedElectricalFile,
          }),
        }
      );

      const data = await response.json();

      if (data.status === "success") {
        showToast("Extra material assigned successfully!", "success");
        setSelectedElectricalMaterial("");
        setSelectedMake("");
        setAvailableStock("");
        setAssignFileStock("");
        PPCElectricalSendRfdMaterialToPackagingList(selectedFinancialYear);
      } else {
        showToast(data.message || "Failed to add extra stock.", "error");
      }
    } catch (error) {
      console.error("Error adding extra material:", error);
      showToast(`Error: ${error.message}`, "error");
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
                <h4 className="mb-0"> Send RFD Material To Packaging List</h4>
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
            <br />
            <Row className="align-items-center">
              <Col xs={12} lg={6} className="mb-2 mb-lg-0">
                {/* Select Electrical File Name dropdown */}
                <SearchableDropdown
                  label="Select Electrical File Name"
                  theme={theme}
                  options={electricalFileList.map((e) => ({
                    label: e.FILE_NAME,
                    value: e.FILE_ID,
                  }))}
                  value={selectedElectricalFile}
                  onSelect={(val) => {
                    handleElectricalFileChange({ target: { value: val } });
                  }}
                />
              </Col>
              <Col xs={12} lg={6} className="mb-2 mb-lg-0">
                <div style={{ height: "35px" }}></div>

                <ButtonGroup size="md">
                  <Button
                    className="btn btn-primary"
                    onClick={() => setIsAddExtraMaterial(!isAddExtraMaterial)}
                  >
                    Add Extra Material
                  </Button>
                </ButtonGroup>
              </Col>
            </Row>
            <br />
            <Row className="align-items-center">
              {isAddExtraMaterial && (
                <>
                  <Col xs={12} lg={2} className="mb-2 mb-lg-0">
                    <SearchableDropdown
                      label="Select Electrical Material"
                      theme={theme}
                      options={electricalMaterialList.map((e) => ({
                        label: e.material_description,
                        value: e.material_description,
                      }))}
                      value={selectedElectricalMaterial}
                      onSelect={(val) => {
                        setSelectedElectricalMaterial(val);
                      }}
                    />
                  </Col>
                  <Col xs={12} lg={2} className="mb-2 mb-lg-0">
                    <SearchableDropdown
                      label="Select Make"
                      theme={theme}
                      options={electricalMakeList.map((e) => ({
                        label: e.make,
                        value: e.make,
                      }))}
                      value={selectedMake}
                      onSelect={(val) => {
                        setSelectedMake(val);
                      }}
                    />
                  </Col>
                  <Col xs={12} lg={2} className="mb-2 mb-lg-0">
                    <label className="mb-0">
                      <h5>Available stock</h5>
                    </label>
                    <input
                      type="number"
                      value={availableStock}
                      className="form-control"
                      onChange={(e) => {
                        handleNumberInput(e, setAvailableStock, setIsInvalid);
                      }}
                    ></input>
                  </Col>
                  <Col xs={12} lg={2} className="mb-2 mb-lg-0">
                    <label className="mb-0">
                      <h5>Assign File Stock</h5>
                    </label>
                    <input
                      type="number"
                      value={assignFileStock}
                      className="form-control"
                      onChange={(e) => {
                        handleNumberInput(e, setAssignFileStock, setIsInvalid);
                      }}
                    ></input>
                  </Col>
                  <Col xs={12} lg={4} className="mb-2 mb-lg-0">
                    <div style={{ height: "33px" }}></div>
                    <ButtonGroup size="md">
                      <Button
                        variant="success"
                        onClick={handleAssignExtraMaterial}
                      >
                        Assign Extra Material
                      </Button>
                    </ButtonGroup>
                  </Col>
                </>
              )}
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
                <p>Please select a electrical file</p>
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
                  singleClickEdit={true}
                  onCellValueChanged={onCellValueChanged}
                  paginationPageSize={isMobile ? 10 : 20}
                  rowSelection="single"
                  suppressMovableColumns={isMobile}
                  animateRows={!isMobile}
                  enableCellTextSelection={true}
                  suppressHorizontalScroll={false}
                  headerHeight={isMobile ? 40 : 48}
                  rowHeight={isMobile ? 35 : 42}
                  onGridReady={(params) => {
                    console.log("PPC Grid is ready");
                    // Auto-size columns after grid is ready
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

export default PPCElectricalSendRfdMaterialToPackagingList;
