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
  SelectEditorModule,
  RenderApiModule,
} from "ag-grid-community";
import {
  Container,
  Button,
  Row,
  Col,
  Card,
  ButtonGroup,
  Form,
  Tab,
  Tabs,
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
  SelectEditorModule,
  RenderApiModule,
]);

const PURCHASEHardwareMaterialDetails = () => {
  const [theme, setTheme] = useState("light");
  const [rowDataRightTab, setRowDataRightTab] = useState([]);
  const [isFullScreen, setIsFullScreen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const gridRefTab2 = useRef(null);

  const { fileId, fileName } = useParams();

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

  // Column definitions

  const rightColDef = [
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
      field: "material_name",
      headerName: "Material Description",
      width: isMobile ? 120 : 200,
      minWidth: isMobile ? 90 : 150,
    },

    {
      field: "unit",
      headerName: "Unit",
      width: isMobile ? 120 : 200,
      minWidth: isMobile ? 90 : 150,
      editable: true,
      singleClickEdit: true,
      cellEditor: "agTextCellEditor",

      valueSetter: (params) => {
        const newValue = params.newValue;

        params.data.unit = newValue;
        return true;
      },
    },
    {
      field: "required_qty",
      headerName: "Required Material",
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

        if (isNaN(newValue)) return false;

        params.data.required_qty = newValue;
        return true;
      },
    },

    {
      headerName: "Supplier",
      field: "supplier_list",
      width: 250,

      cellRenderer: (params) => {
        const handleChange = (e) => {
          const selectedName = e.target.value;
          console.log(suppliers);
          const selectedSupplier = suppliers.find(
            (s) => s.name === selectedName
          );

          if (!selectedSupplier) return;

          params.data.name = selectedSupplier.name;
          params.data.id = selectedSupplier.id;

          params.api.refreshCells({
            rowNodes: [params.node],
            columns: ["supplier_list"],
            force: true,
          });
        };

        return (
          <select
            value={params.data.name || ""}
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
      headerName: "Supplier Qty",
      field: "swap_qty",
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

        params.data.swap_qty = newValue;
        return true;
      },
    },
    {
      field: "comment",
      headerName: "Comment and userName",
      width: isMobile ? 120 : 200,
      minWidth: isMobile ? 90 : 150,
      editable: true,
      singleClickEdit: true,
      cellEditor: "agTextCellEditor",

      valueSetter: (params) => {
        const newValue = params.newValue;

        params.data.comment = newValue;
        return true;
      },
    },
  ];

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

  const fetchDataRightTab = async (fileId) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/getHardwareRequiredMaterialApi.php?fileId=${fileId}`,
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

      if (data.status === true && Array.isArray(data.data)) {
        setRowDataRightTab(data.data);
        showToast(
          `Loaded ${data.count} records for File name ${fileName}`,
          "success"
        );
      } else if (Array.isArray(data)) {
        setRowDataRightTab(data);
        showToast(
          `Loaded ${data.length} records for File name ${fileName}`,
          "success"
        );
      } else {
        setRowDataRightTab([]);
        showToast("No data found for selected file", "info");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      showToast(`Error fetching data: ${error.message}`, "error");
      setRowDataRightTab([]);
    } finally {
      setLoading(false);
    }
  };
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

      if (data.status === true && Array.isArray(data.data)) {
        setSuppliers(data.data);
        showToast(`Loaded ${data.count} suppliers`, "success");
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

  // Initial load
  useEffect(() => {
    fetchSupplierList();
    fetchDataRightTab(fileId);
  }, [isMobile]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // Export to CSV
  const downloadExcel = () => {
    const api = gridRefTab2.current;
    if (!api) return;

    try {
      const params = {
        fileName: `PurchaseAssemblyMaterial__${
          new Date().toISOString().split("T")[0]
        }.csv`,
        allColumns: true,
        onlySelected: false,
      };
      api.exportDataAsCsv(params);
      showToast("Data exported successfully!", "success");
    } catch (error) {
      console.error("Error exporting data:", error);
      showToast("Error exporting data", "error");
    }
  };

  // Auto size columns
  const autoSizeAll = () => {
    const api = gridRefTab2.current;
    if (!api) return;

    try {
      setTimeout(() => {
        const allColumnIds =
          api.getColumns()?.map((column) => column.getId()) || [];
        if (allColumnIds.length > 0) {
          api.autoSizeColumns(allColumnIds, false);
        }
      }, 100);
    } catch (error) {
      console.error("Error auto-sizing columns:", error);
    }
  };

  // Refresh data
  const handleRefresh = () => {
    fetchDataRightTab(fileId);

    showToast("Refreshing data...", "info");
  };

  // Generate purchase Order Function
  const handlePurchaseOrderData = async () => {
    try {
      const api = gridRefTab2.current;
      if (!api) return;

      const formData = new FormData();
      let hasData = false;

      formData.append("generatePO", "true");
      formData.append("filepoid", fileId); // ✅ NOT array

      api.forEachNode((node) => {
        if (Number(node.data.swap_qty) > 0) {
          hasData = true;

          formData.append("materialName[]", node.data.material_name);
          formData.append("unitName1[]", node.data.unit);
          formData.append("purQty[]", node.data.required_qty);
          formData.append("supplierQty[]", node.data.swap_qty);
          formData.append("shippingCountry[]", node.data.id);
          formData.append("note[]", node.data.comment || "");
        }
      });

      if (!hasData) {
        alert("No items selected for purchase");
        return;
      }

      // 🔍 Debug (IMPORTANT)
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const response = await fetch(
        "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/generateRawPoApi.php",
        {
          method: "POST",
          body: formData, // ✅ NO headers
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

  // const submitPO = () => {
  //   const formData = new FormData();

  //   formData.append("fileid", fileId);

  //   rows.forEach((row, index) => {
  //     formData.append("materialId[]", row.uid);
  //     formData.append("materialName[]", row.material_name);
  //     formData.append("unitName1[]", row.make);
  //     formData.append("purQty[]", row.required_qty);
  //     formData.append("supplierQty[]", row.order_qty);
  //     formData.append("shippingCountry[]", row.supplier_id);
  //     formData.append("note[]", row.note || "");
  //   });

  //   axios.post(
  //     "/api/createElectricalPoApi.php",
  //     formData,
  //     {
  //       headers: { "Content-Type": "multipart/form-data" }
  //     }
  //   ).then(res => {
  //     if (res.data.status) {
  //       alert("PO Created Successfully");
  //     } else {
  //       alert(res.data.message);
  //     }
  //   });
  // };

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

  if (loading && rowDataRightTab.length === 0) {
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
          <p className="mt-3">Loading projects...</p>
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
                <h4 className="mb-0">Assembly Material List</h4>
                <small style={{ opacity: 0.8 }}>
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
            {rowDataRightTab.length === 0 ? (
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

                <p>Please Refresh or check your API connection.</p>

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
                  rowData={rowDataRightTab}
                  columnDefs={rightColDef}
                  defaultColDef={defaultColDef}
                  pagination
                  popupParent={document.body}
                  paginationPageSize={isMobile ? 10 : 20}
                  suppressMovableColumns={isMobile}
                  enableRangeSelection={!isMobile}
                  rowMultiSelectWithClick
                  animateRows={!isMobile}
                  enableCellTextSelection
                  suppressHorizontalScroll={false}
                  headerHeight={isMobile ? 40 : 48}
                  rowHeight={isMobile ? 35 : 42}
                  onGridReady={(p) => {
                    gridRefTab2.current = p.api;
                    setTimeout(autoSizeAll, 500);
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
                Generate Purchase Order
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default PURCHASEHardwareMaterialDetails;
