import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
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
import { Container, Button, Row, Col, Card, ButtonGroup, Form, Badge, Spinner } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
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
]);

// ─── API URLs ─────────────────────────────────────────────────────────────────
const REPORT_API = "http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/Report/stockAssignedmiscApi.php";
const YEARS_API  = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/GetYearsApi.php";

// ─── Theme configs (mirrors StockMaterialAdjustList pattern) ─────────────────
const getThemeStyles = (theme) => {
    if (theme === "dark") {
        return {
            pageBg:       "linear-gradient(135deg, #21262d 0%, #161b22 100%)",
            color:        "#f8f9fa",
            cardBg:       "#1e2329",
            cardHeader:   "linear-gradient(135deg, #2d333b 0%, #22272e 100%)",
            headerText:   "#ffffff",
            inputBg:      "#2d333b",
            inputBorder:  "#444c56",
            inputColor:   "#f0f6fc",
            subtext:      "#8b949e",
            statBg:       "#2d333b",
            statBorder:   "#444c56",
        };
    }
    return {
        pageBg:       "linear-gradient(135deg, #f0f4f8 0%, #e8f0fe 100%)",
        color:        "#1a2332",
        cardBg:       "#ffffff",
        cardHeader:   "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)",
        headerText:   "#ffffff",
        inputBg:      "#ffffff",
        inputBorder:  "#d1d9e6",
        inputColor:   "#1a2332",
        subtext:      "#64748b",
        statBg:       "#f8fafc",
        statBorder:   "#e2e8f0",
    };
};

// ─── Format helpers ───────────────────────────────────────────────────────────
const fmtINR = (n) => {
    if (n === null || n === undefined || n === "") return "—";
    const num = Number(n);
    if (isNaN(num)) return "—";
    return "₹" + num.toLocaleString("en-IN", { maximumFractionDigits: 2 });
};

const fmtCr = (n) => {
    const num = Number(n) || 0;
    if (num >= 10000000) return "₹" + (num / 10000000).toFixed(2) + " Cr";
    if (num >= 100000)   return "₹" + (num / 100000).toFixed(2) + " L";
    return "₹" + num.toLocaleString("en-IN");
};

const fmtNum = (n) => {
    if (n === null || n === undefined || n === "") return "—";
    return Number(n).toLocaleString("en-IN");
};

// ─── Stat Card Component ──────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, color, dark }) => (
    <div style={{
        background: dark ? "#2d333b" : color + "10",
        border: `1px solid ${color}33`,
        borderLeft: `4px solid ${color}`,
        borderRadius: 10,
        padding: "10px 16px",
        minWidth: 140,
        flex: "1 1 140px",
    }}>
        <div style={{ fontSize: 10, color, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 2 }}>
            <i className={`bi ${icon} me-1`}></i>{label}
        </div>
        <div style={{ fontSize: 17, fontWeight: 800, color, lineHeight: 1.2 }}>{value}</div>
    </div>
);

// ─── Calculation Tooltip Cell ─────────────────────────────────────────────────
const CalcCell = ({ value }) => (
    <span
        title={value || ""}
        style={{
            fontSize: 11, color: "#64748b", fontStyle: "italic",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            display: "block", maxWidth: 220,
        }}
    >{value || "—"}</span>
);

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const StockAssignedMiscReport = () => {
    const [theme, setTheme]               = useState("light");
    const [rowData, setRowData]           = useState([]);
    const [years, setYears]               = useState([]);
    const [selectedYear, setSelectedYear] = useState("25-26");
    const [loading, setLoading]           = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [isMobile, setIsMobile]         = useState(window.innerWidth <= 768);
    const [totalRecords, setTotalRecords] = useState(0);
    const [grandTotal, setGrandTotal]     = useState(0);
    const [selectedRows, setSelectedRows] = useState([]);
    const [quickFilter, setQuickFilter]   = useState("");

    const gridRef = useRef();
    const T = getThemeStyles(theme);

    // Responsive
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    // Apply theme to body
    useEffect(() => {
        document.body.style.background = T.pageBg;
        document.body.style.color      = T.color;
        document.body.style.minHeight  = "100vh";
        return () => {
            document.body.style.background = "";
            document.body.style.color      = "";
            document.body.style.minHeight  = "";
        };
    }, [theme]);

    // ── Fetch Years ───────────────────────────────────────────────────────────
    const fetchYears = useCallback(async () => {
        try {
            const res  = await fetch(YEARS_API);
            const data = await res.json();
            if (data.status === "success" && data.data) {
                const sorted = data.data
                    .sort((a, b) => parseInt(a.sequence_no) - parseInt(b.sequence_no))
                    .map((y) => ({ value: y.financial_year, label: `20${y.financial_year}` }));
                setYears(sorted);
                if (sorted.length > 0) {
                    const latest = sorted[sorted.length - 1].value;
                    setSelectedYear(latest);
                }
            }
        } catch (err) {
            console.error("Years fetch error:", err);
            // Fallback
            setYears([
                { value: "23-24", label: "2023-24" },
                { value: "24-25", label: "2024-25" },
                { value: "25-26", label: "2025-26" },
            ]);
        }
    }, []);

    // ── Fetch Report Data ─────────────────────────────────────────────────────
    const fetchData = useCallback(async (year) => {
        setLoading(true);
        try {
            const res  = await fetch(`${REPORT_API}?financial_year=${year}`);
            const data = await res.json();
            if (data.status) {
                setRowData(data.data || []);
                setTotalRecords(data.total_records || data.data?.length || 0);
                setGrandTotal(data.grand_total || 0);
                toast.success(`✓ Loaded ${data.total_records?.toLocaleString("en-IN") || data.data?.length} records for FY ${year}`);
            } else {
                setRowData([]);
                toast.error(data.message || "No data received");
            }
        } catch (err) {
            setRowData([]);
            toast.error("Fetch failed: " + err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchYears(); }, [fetchYears]);
    useEffect(() => { if (selectedYear) fetchData(selectedYear); }, [selectedYear, fetchData]);

    // ── Quick filter ──────────────────────────────────────────────────────────
    useEffect(() => {
        if (gridRef.current?.api) {
            gridRef.current.api.setGridOption("quickFilterText", quickFilter);
        }
    }, [quickFilter]);

    // ── Grid helpers ──────────────────────────────────────────────────────────
    const autoSizeAll = useCallback(() => {
        setTimeout(() => {
            const ids = gridRef.current?.api?.getColumns()?.map((c) => c.getId()) || [];
            if (ids.length) gridRef.current.api.autoSizeColumns(ids, false);
        }, 100);
    }, []);

    const handleExportCSV = () => {
        gridRef.current?.api?.exportDataAsCsv({
            fileName: `StockAssignedMisc_FY${selectedYear}_${new Date().toISOString().split("T")[0]}.csv`,
        });
        toast.success("Exported to CSV");
    };

    const onSelectionChanged = (e) => {
        const sel = e.api.getSelectedNodes().map((n) => n.data);
        setSelectedRows(sel);
    };

    const onGridReady = () => { setTimeout(autoSizeAll, 500); };

    // ── Summary stats (live from filtered grid) ───────────────────────────────
    const stats = useMemo(() => {
        const uniqueFiles    = new Set(rowData.map((r) => r.file_id)).size;
        const uniqueMaterials = new Set(rowData.map((r) => r.material_id)).size;
        const totalQty       = rowData.reduce((s, r) => s + Number(r.qty || 0), 0);
        const totalConsumed  = rowData.reduce((s, r) => s + Number(r.consumed || 0), 0);
        return { uniqueFiles, uniqueMaterials, totalQty, totalConsumed };
    }, [rowData]);

    // ── Column Definitions ────────────────────────────────────────────────────
    const columnDefs = useMemo(() => [
        {
            headerName: "Sr No",
            valueGetter: (p) => (p.node ? p.node.rowIndex + 1 : ""),
            width: 70, minWidth: 55,
            pinned: "left", lockPosition: true,
            sortable: false, filter: false,
            cellStyle: { fontWeight: 700, textAlign: "center", color: "#94a3b8", fontSize: 11 },
        },
        {
            field: "file_name", headerName: "File Name",
            width: 175, minWidth: 140,
            pinned: "left",
            filter: "agTextColumnFilter", floatingFilter: !isMobile,
            checkboxSelection: true,
            headerCheckboxSelection: true,
            cellStyle: { fontWeight: 700, color: "#2563eb", fontSize: 11 },
            tooltipField: "file_name",
        },
        {
            field: "file_id", headerName: "File ID",
            width: 90, minWidth: 70,
            filter: "agTextColumnFilter", floatingFilter: !isMobile,
            cellStyle: { fontFamily: "monospace", color: "#7c3aed", fontWeight: 600, fontSize: 11 },
        },
        {
            field: "material_id", headerName: "Mat ID",
            width: 85, minWidth: 70,
            filter: "agTextColumnFilter", floatingFilter: !isMobile,
            cellStyle: { fontFamily: "monospace", fontSize: 11, color: "#64748b", textAlign: "center" },
        },
        {
            field: "material", headerName: "Material Description",
            flex: 1, minWidth: 220,
            filter: "agTextColumnFilter", floatingFilter: !isMobile,
            cellStyle: { fontSize: 11, fontWeight: 500 },
            tooltipField: "material",
        },
        {
            field: "unit", headerName: "Unit",
            width: 80, minWidth: 65,
            filter: "agTextColumnFilter", floatingFilter: !isMobile,
            cellStyle: { textAlign: "center", fontSize: 11, fontWeight: 600, color: "#0891b2" },
        },
        {
            field: "qty", headerName: "Qty",
            width: 85, minWidth: 70,
            filter: "agNumberColumnFilter", floatingFilter: !isMobile,
            valueFormatter: (p) => fmtNum(p.value),
            cellStyle: { textAlign: "right", fontWeight: 600, fontSize: 11 },
        },
        {
            field: "weight_per_unit", headerName: "Wt/Unit",
            width: 90, minWidth: 75,
            filter: "agNumberColumnFilter", floatingFilter: !isMobile,
            valueFormatter: (p) => fmtNum(p.value),
            cellStyle: { textAlign: "right", fontSize: 11 },
        },
        {
            field: "consumed", headerName: "Consumed",
            width: 105, minWidth: 85,
            filter: "agNumberColumnFilter", floatingFilter: !isMobile,
            valueFormatter: (p) => fmtNum(p.value),
            cellStyle: (p) => ({
                textAlign: "right", fontWeight: 700, fontSize: 11,
                color: Number(p.value) > 0 ? "#16a34a" : "#94a3b8",
            }),
        },
        {
            field: "rate", headerName: "Rate (₹)",
            width: 110, minWidth: 90,
            filter: "agNumberColumnFilter", floatingFilter: !isMobile,
            valueFormatter: (p) => fmtINR(p.value),
            cellStyle: { textAlign: "right", fontWeight: 600, fontSize: 11, color: "#2563eb" },
        },
        {
            field: "total", headerName: "Total (₹)",
            width: 120, minWidth: 100,
            filter: "agNumberColumnFilter", floatingFilter: !isMobile,
            valueFormatter: (p) => fmtINR(p.value),
            cellStyle: (p) => ({
                textAlign: "right", fontWeight: 800, fontSize: 11,
                color: Number(p.value) >= 10000 ? "#dc2626" : Number(p.value) >= 1000 ? "#f97316" : "#16a34a",
            }),
            pinned: "right",
        },
        {
            field: "calculation", headerName: "Calculation",
            width: 230, minWidth: 160,
            filter: "agTextColumnFilter", floatingFilter: !isMobile,
            cellRenderer: (p) => <CalcCell value={p.value} />,
            cellStyle: { padding: "0 8px", display: "flex", alignItems: "center" },
        },
    ], [isMobile]);

    const defaultColDef = useMemo(() => ({
        sortable: true,
        resizable: true,
        suppressHeaderMenuButton: false,
    }), []);

    const getRowStyle = (p) => ({
        background: p.node.rowIndex % 2 === 0
            ? (theme === "dark" ? "#1e2329" : "#f8fafc")
            : (theme === "dark" ? "#22272e" : "#ffffff"),
    });

    const gridHeight = isFullScreen
        ? "calc(100vh - 220px)"
        : isMobile ? "420px" : "600px";

    const fyLabel = years.find((y) => y.value === selectedYear)?.label || selectedYear;

    // ── Full-page loader ──────────────────────────────────────────────────────
    if (loading && rowData.length === 0) {
        return (
            <div style={{
                minHeight: "100vh", display: "flex", alignItems: "center",
                justifyContent: "center", background: T.pageBg, flexDirection: "column", gap: 16,
            }}>
                <Spinner animation="border" style={{ width: 48, height: 48, color: "#2563eb" }} />
                <p style={{ color: T.subtext, fontSize: 14, fontWeight: 600 }}>Loading stock data…</p>
            </div>
        );
    }

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div style={{ minHeight: "100vh", background: T.pageBg, color: T.color, padding: 0 }}>
            <Container fluid={isFullScreen} style={{ padding: isFullScreen ? 0 : "20px" }}>
                <Card style={{
                    backgroundColor: T.cardBg,
                    color: T.color,
                    border: theme === "dark" ? "1px solid #30363d" : "1px solid #e2e8f0",
                    margin: isFullScreen ? 0 : undefined,
                    borderRadius: isFullScreen ? 0 : 12,
                    boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
                    overflow: "hidden",
                }}>

                    {/* ── HEADER ── */}
                    <Card.Header style={{
                        background: T.cardHeader,
                        padding: "14px 20px",
                        borderBottom: "none",
                    }}>
                        <Row className="align-items-center g-2">
                            {/* Title */}
                            <Col xs={12} lg={5}>
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <div style={{
                                        width: 38, height: 38, borderRadius: 9,
                                        background: "linear-gradient(135deg,#f59e0b,#ef4444)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: 18, boxShadow: "0 3px 10px rgba(245,158,11,0.5)",
                                        flexShrink: 0,
                                    }}>📦</div>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: 15, color: "#fff", letterSpacing: 0.3 }}>
                                            Stock Assigned Misc Report
                                        </div>
                                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", letterSpacing: 0.5 }}>
                                            {loading
                                                ? "Refreshing…"
                                                : `${totalRecords.toLocaleString("en-IN")} records · FY ${fyLabel}`}
                                            {selectedRows.length > 0 && (
                                                <Badge bg="warning" text="dark" className="ms-2" style={{ fontSize: 10 }}>
                                                    {selectedRows.length} selected
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Col>

                            {/* Controls */}
                            <Col xs={12} lg={7}>
                                <div className="d-flex justify-content-lg-end align-items-center gap-2 flex-wrap">

                                    {/* Search */}
                                    <div style={{ position: "relative", minWidth: 180 }}>
                                        <i className="bi bi-search" style={{
                                            position: "absolute", left: 9, top: "50%",
                                            transform: "translateY(-50%)",
                                            color: "rgba(255,255,255,0.5)", fontSize: 13,
                                        }} />
                                        <input
                                            type="text"
                                            placeholder="Quick search…"
                                            value={quickFilter}
                                            onChange={(e) => setQuickFilter(e.target.value)}
                                            style={{
                                                paddingLeft: 30, paddingRight: 10,
                                                height: 32, borderRadius: 7,
                                                border: "1px solid rgba(255,255,255,0.25)",
                                                background: "rgba(255,255,255,0.12)",
                                                color: "#fff", fontSize: 12, outline: "none",
                                                width: "100%",
                                            }}
                                        />
                                    </div>

                                    {/* FY Select */}
                                    <Form.Select
                                        size="sm"
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(e.target.value)}
                                        style={{
                                            width: "auto", minWidth: 120,
                                            background: "rgba(255,255,255,0.15)",
                                            border: "1px solid rgba(255,255,255,0.3)",
                                            color: "#fff", fontWeight: 700, fontSize: 13,
                                            borderRadius: 7,
                                        }}
                                    >
                                        {years.map((y) => (
                                            <option key={y.value} value={y.value} style={{ color: "#000", background: "#fff" }}>
                                                FY {y.label}
                                            </option>
                                        ))}
                                    </Form.Select>

                                    {/* Action buttons */}
                                    <ButtonGroup size="sm">
                                        <Button
                                            variant="outline-light"
                                            onClick={() => fetchData(selectedYear)}
                                            disabled={loading}
                                            title="Refresh"
                                        >
                                            {loading
                                                ? <Spinner animation="border" size="sm" />
                                                : <i className="bi bi-arrow-clockwise"></i>}
                                            {!isMobile && <span className="ms-1">Refresh</span>}
                                        </Button>
                                        <Button variant="outline-light" onClick={handleExportCSV} title="Export CSV">
                                            <i className="bi bi-download"></i>
                                            {!isMobile && <span className="ms-1">CSV</span>}
                                        </Button>
                                        <Button variant="outline-light" onClick={autoSizeAll} title="Auto Size Columns">
                                            <i className="bi bi-arrows-angle-expand"></i>
                                            {!isMobile && <span className="ms-1">Fit</span>}
                                        </Button>
                                    </ButtonGroup>

                                    <ButtonGroup size="sm">
                                        <Button
                                            variant="outline-light"
                                            onClick={() => setIsFullScreen(!isFullScreen)}
                                            title={isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
                                        >
                                            <i className={`bi ${isFullScreen ? "bi-fullscreen-exit" : "bi-fullscreen"}`}></i>
                                            {!isMobile && <span className="ms-1">{isFullScreen ? "Exit" : "Full"}</span>}
                                        </Button>
                                        <Button
                                            variant="outline-light"
                                            onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
                                            title="Toggle theme"
                                        >
                                            {theme === "light" ? "🌙" : "☀️"}
                                            {!isMobile && <span className="ms-1">{theme === "light" ? "Dark" : "Light"}</span>}
                                        </Button>
                                    </ButtonGroup>
                                </div>
                            </Col>
                        </Row>
                    </Card.Header>

                    {/* ── SUMMARY STRIP ── */}
                    {!loading && rowData.length > 0 && (
                        <div style={{
                            background: T.cardBg,
                            borderBottom: `1px solid ${T.statBorder}`,
                            padding: "10px 20px",
                            display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center",
                        }}>
                            <StatCard icon="bi-currency-rupee" label="Grand Total"       value={fmtCr(grandTotal)}              color="#2563eb" dark={theme === "dark"} />
                            <StatCard icon="bi-folder2"        label="Unique Files"       value={stats.uniqueFiles}              color="#7c3aed" dark={theme === "dark"} />
                            <StatCard icon="bi-boxes"          label="Material Types"     value={stats.uniqueMaterials}          color="#0891b2" dark={theme === "dark"} />
                            <StatCard icon="bi-stack"          label="Total Qty"          value={fmtNum(stats.totalQty)}         color="#f59e0b" dark={theme === "dark"} />
                            <StatCard icon="bi-check2-circle"  label="Total Consumed"     value={fmtNum(stats.totalConsumed)}    color="#16a34a" dark={theme === "dark"} />
                            <StatCard icon="bi-list-ol"        label="Total Records"      value={totalRecords.toLocaleString("en-IN")} color="#ef4444" dark={theme === "dark"} />

                            {/* Editable legend */}
                            <div style={{ marginLeft: "auto" }}>
                                <div style={{
                                    background: "rgba(37,99,235,0.08)", border: "1px solid #2563eb33",
                                    borderLeft: "3px solid #2563eb", borderRadius: 6,
                                    padding: "4px 12px", fontSize: 11, color: T.subtext, fontWeight: 600,
                                }}>
                                    <i className="bi bi-info-circle me-1"></i>
                                    Total column color: <span style={{ color: "#dc2626" }}>≥₹10k</span> ·{" "}
                                    <span style={{ color: "#f97316" }}>≥₹1k</span> ·{" "}
                                    <span style={{ color: "#16a34a" }}>&lt;₹1k</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── GRID BODY ── */}
                    <Card.Body style={{ backgroundColor: T.cardBg, padding: isFullScreen ? 0 : 16 }}>
                        {rowData.length === 0 && !loading ? (
                            <div style={{ textAlign: "center", padding: "70px 20px", color: T.subtext }}>
                                <i className="bi bi-inbox" style={{ fontSize: "3.5rem", display: "block", marginBottom: 16, color: "#94a3b8" }}></i>
                                <h5 style={{ fontWeight: 700, marginBottom: 8 }}>No data available</h5>
                                <p style={{ fontSize: 14 }}>Select a different financial year or check your API connection.</p>
                                <Button variant="primary" size="sm" onClick={() => fetchData(selectedYear)}>
                                    <i className="bi bi-arrow-clockwise me-2"></i>Try Again
                                </Button>
                            </div>
                        ) : (
                            <>
                                <style>{`
                                    .ag-theme-alpine .ag-header-cell { font-size: 11px !important; font-weight: 700 !important; }
                                    .ag-theme-alpine-dark .ag-header-cell { font-size: 11px !important; font-weight: 700 !important; }
                                    .ag-floating-filter-input { font-size: 11px !important; }
                                    .ag-theme-alpine .ag-paging-panel { font-size: 12px !important; }
                                    .ag-theme-alpine-dark .ag-paging-panel { font-size: 12px !important; }
                                `}</style>

                                <div
                                    className={theme === "light" ? "ag-theme-alpine" : "ag-theme-alpine-dark"}
                                    style={{
                                        height: gridHeight,
                                        width: "100%",
                                        "--ag-background-color":         T.cardBg,
                                        "--ag-header-background-color":  "#1e3a5f",
                                        "--ag-header-foreground-color":  "#fff",
                                        "--ag-foreground-color":         T.color,
                                        "--ag-border-color":             theme === "dark" ? "#30363d" : "#e2e8f0",
                                        "--ag-row-hover-color":          theme === "dark" ? "#2d333b" : "#eff6ff",
                                        "--ag-selected-row-background-color": theme === "dark" ? "#1e3a5f" : "#dbeafe",
                                        "--ag-font-size":                "11px",
                                        "--ag-odd-row-background-color": theme === "dark" ? "#1e2329" : "#f8fafc",
                                    }}
                                >
                                    <AgGridReact
                                        ref={gridRef}
                                        rowData={rowData}
                                        columnDefs={columnDefs}
                                        defaultColDef={defaultColDef}
                                        pagination
                                        paginationPageSize={isMobile ? 15 : 25}
                                        paginationPageSizeSelector={[10, 15, 25, 50, 100]}
                                        rowSelection="multiple"
                                        onSelectionChanged={onSelectionChanged}
                                        onGridReady={onGridReady}
                                        getRowStyle={getRowStyle}
                                        animateRows={!isMobile}
                                        enableCellTextSelection
                                        rowHeight={isMobile ? 34 : 36}
                                        headerHeight={isMobile ? 40 : 44}
                                        floatingFiltersHeight={isMobile ? 0 : 34}
                                        suppressMovableColumns={isMobile}
                                        tooltipShowDelay={300}
                                    />
                                </div>
                            </>
                        )}
                    </Card.Body>
                </Card>
            </Container>

            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                pauseOnHover
                draggable
                theme={theme}
            />
        </div>
    );
};

export default StockAssignedMiscReport;