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
const flattenMenuTreeDynamic = (mainMenu, tree) => {
  const rows = [];

  const traverse = (node, path = []) => {
    const newPath = [...path, node.name];

    // Leaf node → row
    if (!node.children || Object.keys(node.children).length === 0) {
      rows.push({
        main: mainMenu,
        levels: newPath, // dynamic depth
        meta: node.meta,
      });
      return;
    }

    // Traverse deeper
    Object.values(node.children).forEach((child) => traverse(child, newPath));
  };

  Object.values(tree || {}).forEach((node) => traverse(node));

  return rows;
};

const HRMenuMaster = () => {
  const [theme, setTheme] = useState("light");
  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([]);
  const [isFullScreen, setIsFullScreen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [selectedRows, setSelectedRows] = useState([]);
  const [financialYears, setFinancialYears] = useState([]);
  const [selectedFinancialYear, setSelectedFinancialYear] = useState("");
  const [loadingYears, setLoadingYears] = useState(false);
  const gridRef = useRef();

  const [menus, setMenus] = useState([]);
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [changedItems, setChangedItems] = useState({});

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

  const getMaxDepth = (rows) => {
    return Math.max(...rows.map((r) => r.levels.length), 0);
  };

  // Fetch PPC project list data

  const fetchPPCProjectData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Hr/menuMasterApiList.php`,
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

      const result = await response.json();

      if (result.success && result.data?.levels) {
        const formatted = result.data.levels.map((item) => ({
          level: item.level,
          level_id: item.level_id,
          sub_menu: [], // will be filled by next API
        }));

        setMenus(formatted);
      } else if (result.levels) {
        const formatted = result.levels.map((item) => ({
          level: item.level,
          level_id: item.level_id,
          sub_menu: [], // will be filled by next API
        }));

        setMenus(formatted);
      } else {
        setMenus([]);
        showToast("No data found for selected file", "info");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      showToast(`Error fetching data: ${error.message}`, "error");
      setMenus([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubMenus = async (dept) => {
    const res = await fetch(
      `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Hr/getMenuMasterListApi.php?dept=${dept.toLowerCase()}`,
    );

    const json = await res.json();

    if (!json.success) return {};

    return buildMenuTree(json.data.items);
  };

  const buildMenuTree = (items) => {
    const tree = {};

    items.forEach((item) => {
      const l1 = item.level1;
      const l2 = item.level2;
      const l3 = item.level3;

      if (!tree[l1]) {
        tree[l1] = {
          name: l1,
          children: {},
          meta: item,
        };
      }

      if (l2) {
        if (!tree[l1].children[l2]) {
          tree[l1].children[l2] = {
            name: l2,
            children: {},
            meta: item,
          };
        }

        if (l3) {
          tree[l1].children[l2].children[l3] = {
            name: l3,
            meta: item,
          };
        }
      }
    });

    return tree;
  };

  const payload = [];

  menus.forEach((menu) => {
    Object.values(menu.sub_menu_tree || {}).forEach((l1) => {
      Object.values(l1.children || {}).forEach((l2) => {
        Object.values(l2.children || {}).forEach((l3) => {
          payload.push({
            id: l3.meta.id,
            display_flag: l3.meta.display_flag_checked ? 1 : 0,
          });
        });
      });
    });
  });

  console.log(payload);

  const toggleExpand = (levelId) => {
    setExpandedMenu(expandedMenu === levelId ? null : levelId);
  };

  const handleSave = async () => {
    const payloadList = Object.values(changedItems);

    if (payloadList.length === 0) {
      showToast("No changes to save", "info");
      return;
    }

    try {
      showToast("Saving menu access...", "info");

      for (const payload of payloadList) {
        const response = await fetch(
          "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Hr/updateMenuDisplayStatusApi.php",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();

        if (!result.status) {
          throw new Error(result.message || "Failed to update menu status");
        }
      }

      showToast("Menu access updated successfully ✅", "success");
      setChangedItems({});
    } catch (error) {
      console.error("Save failed:", error);
      showToast(`Error saving menu access: ${error.message}`, "error");
    }
  };

  useEffect(() => {
    fetchPPCProjectData();
  }, []);

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
  // const downloadExcel = () => {
  //   if (!gridRef.current?.api) return;

  //   try {
  //     const params = {
  //       fileName: `ReceivedMaterialList_${selectedFinancialYear}_${
  //         new Date().toISOString().split("T")[0]
  //       }.csv`,
  //       allColumns: true,
  //       onlySelected: false,
  //     };
  //     gridRef.current.api.exportDataAsCsv(params);
  //     showToast("Data exported successfully!", "success");
  //   } catch (error) {
  //     console.error("Error exporting data:", error);
  //     showToast("Error exporting data", "error");
  //   }
  // };

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
    fetchPPCProjectData();
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
                <h4 className="mb-0">Menu Master</h4>
              </Col>

              <Col xs={12} lg={6}>
                <div className="d-flex justify-content-end gap-2 flex-wrap align-items-center">
                  <ButtonGroup size="sm">
                    <Button
                      size="sm"
                      variant="success"
                      onClick={handleSave}
                      disabled={Object.keys(changedItems).length === 0}
                    >
                      <i className="bi bi-save"></i>
                      {!isMobile && " Save Changes"}
                    </Button>
                  </ButtonGroup>

                  <ButtonGroup size="sm">
                    <Button variant="success" onClick={handleRefresh}>
                      <i className="bi bi-arrow-clockwise"></i>
                      {!isMobile && " Refresh"}
                    </Button>
                  </ButtonGroup>

                  <ButtonGroup size="sm">
                    {/* <Button variant="success" onClick={downloadExcel}>
                      <i className="bi bi-file-earmark-excel"></i>
                      {!isMobile && " Export CSV"}
                    </Button> */}
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
            {menus.length === 0 ? (
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

                <ButtonGroup size="sm">
                  <Button variant="success" onClick={handleRefresh}>
                    <i className="bi bi-arrow-clockwise"></i>
                    {!isMobile && " Refresh"}
                  </Button>
                </ButtonGroup>
              </div>
            ) : (
              <div>
                {loading && (
                  <div className="text-center p-4">
                    <div className="spinner-border" role="status" />
                    <p className="mt-2">Loading menus...</p>
                  </div>
                )}

                {error && (
                  <div className="text-center text-danger p-4">{error}</div>
                )}

                <Row>
                  {/* ================= LEFT : MAIN MENU ================= */}
                  <Col md={3} style={{ borderRight: "1px solid #ddd" }}>
                    {menus.map((menu) => (
                      <div
                        key={menu.level_id}
                        className={`p-2 mb-1 rounded ${
                          expandedMenu === menu.level
                            ? "bg-light fw-bold"
                            : "cursor-pointer"
                        }`}
                        style={{ cursor: "pointer" }}
                        onClick={async () => {
                          setExpandedMenu(menu.level);

                          if (menu.loaded) return;

                          const tree = await fetchSubMenus(menu.level);

                          setMenus((prev) =>
                            prev.map((m) =>
                              m.level === menu.level
                                ? {
                                    ...m,
                                    sub_menu_tree: tree,
                                    loaded: true,
                                  }
                                : m,
                            ),
                          );
                        }}
                      >
                        {menu.level}
                      </div>
                    ))}
                  </Col>

                  {/* ================= RIGHT : SUB MENU ================= */}
                  <Col md={9}>
                    {menus
                      .filter((m) => m.level === expandedMenu)
                      .map((menu) => {
                        const rows = flattenMenuTreeDynamic(
                          menu.level,
                          menu.sub_menu_tree,
                        );

                        const maxDepth = getMaxDepth(rows);

                        return (
                          <div key={menu.level}>
                            <div className="table-responsive">
                              <table className="table table-bordered table-sm">
                                <thead className="table-light">
                                  <tr>
                                    <th>Main Menu</th>

                                    {/* Dynamic level headers */}
                                    {Array.from({ length: maxDepth }).map(
                                      (_, i) => (
                                        <th key={i}>Level {i + 1}</th>
                                      ),
                                    )}

                                    <th className="text-center">Hide / Show</th>
                                  </tr>
                                </thead>

                                <tbody>
                                  {rows.map((row, rowIndex) => (
                                    <tr key={rowIndex}>
                                      <td>{row.main}</td>

                                      {/* Dynamic level cells */}
                                      {Array.from({ length: maxDepth }).map(
                                        (_, i) => (
                                          <td key={i}>{row.levels[i] || ""}</td>
                                        ),
                                      )}

                                      <td className="text-center">
                                        <input
                                          type="checkbox"
                                          checked={
                                            row.meta.display_flag_checked
                                          }
                                          onChange={() => {
                                            const newValue =
                                              !row.meta.display_flag_checked;

                                            row.meta.display_flag_checked =
                                              newValue;
                                            setMenus([...menus]);

                                            setChangedItems((prev) => ({
                                              ...prev,
                                              [row.meta.sequence_no]: {
                                                sequence_no:
                                                  row.meta.sequence_no,
                                                user_status: newValue ? 1 : 0,
                                              },
                                            }));
                                          }}
                                        />
                                      </td>
                                    </tr>
                                  ))}

                                  {rows.length === 0 && (
                                    <tr>
                                      <td
                                        colSpan={maxDepth + 2}
                                        className="text-center text-muted"
                                      >
                                        No menu items
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        );
                      })}
                  </Col>
                </Row>

                {!loading && menus.length === 0 && (
                  <div className="text-center text-muted p-5">
                    No menu levels available
                  </div>
                )}
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default HRMenuMaster;
