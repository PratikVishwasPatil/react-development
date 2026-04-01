import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
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
    CsvExportModule
} from "ag-grid-community";

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ValidationModule,
    DateFilterModule,
    NumberFilterModule,
    TextFilterModule,
    RowSelectionModule,
    PaginationModule,
    CsvExportModule
]);

// ─── Color palette mapped to each dynamic category ───────────────────────────
const CATEGORY_COLORS = {
    "BOUGHT OUT":      "#059669",
    "CONSUMABLES":     "#0891b2",
    "DRIVE":           "#7c3aed",
    "ELECTRICAL":      "#dc2626",
    "FABRICATION":     "#ea580c",
    "FOUNDATION":      "#0284c7",
    "HARDWARE":        "#b45309",
    "PACKING MTR":     "#6d28d9",
    "PAINT":           "#be185d",
    "POWDER":          "#9333ea",
    "SHEET":           "#0369a1",
    "SHEET METAL":     "#047857",
    "total":           "#16a34a",
    "marketing expenses":                          "#e11d48",
    "design bom":                                  "#2563eb",
    "Difference between total and marketing expenses": "#d97706"
};

const getColor = (header) => CATEGORY_COLORS[header] || "#64748b";

// ─── Toast helper ─────────────────────────────────────────────────────────────
const useToast = () => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = "success") => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
    }, []);

    const ToastContainer = (
        <div style={{
            position: "fixed", top: "1rem", right: "1rem", zIndex: 9999,
            display: "flex", flexDirection: "column", gap: "0.5rem"
        }}>
            {toasts.map((toast) => (
                <div key={toast.id} style={{
                    padding: "0.85rem 1.4rem",
                    borderRadius: "8px",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
                    color: "#fff",
                    backgroundColor: toast.type === "success" ? "#10b981" : "#ef4444",
                    animation: "toastSlide 0.3s ease-out",
                    minWidth: "240px",
                    fontWeight: 600,
                    fontSize: "0.9rem"
                }}>
                    {toast.type === "success" ? "✓ " : "✕ "}{toast.message}
                </div>
            ))}
        </div>
    );

    return { showToast, ToastContainer };
};

// ─── Summary Card ─────────────────────────────────────────────────────────────
const SummaryCard = ({ theme, label, value, color, isTotal = false }) => (
    <div
        style={{
            padding: "1rem",
            borderRadius: "10px",
            background: theme === "dark" ? "#1e293b" : "#fff",
            border: isTotal ? `2px solid ${color}` : theme === "dark" ? "1px solid #334155" : "1px solid #e2e8f0",
            boxShadow: isTotal ? `0 4px 14px ${color}33` : "0 2px 6px rgba(0,0,0,0.06)",
            transition: "transform 0.2s, box-shadow 0.2s",
            cursor: "default"
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-3px)";
            e.currentTarget.style.boxShadow = `0 8px 20px ${color}44`;
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = isTotal ? `0 4px 14px ${color}33` : "0 2px 6px rgba(0,0,0,0.06)";
        }}
    >
        <div style={{
            fontSize: "0.75rem", fontWeight: 700, color: theme === "dark" ? "#94a3b8" : "#64748b",
            marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.6px"
        }}>
            {label}
        </div>
        <div style={{ fontSize: isTotal ? "1.45rem" : "1.15rem", fontWeight: 700, color }}>
            ₹ {Number(value).toLocaleString("en-IN")}
        </div>
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const FilewiseMaterialCostReport = () => {
    // ── state ──
    const [theme, setTheme] = useState("light");
    const [rowData, setRowData] = useState([]);
    const [headerData, setHeaderData] = useState([]);   // dynamic headers from API
    const [columnDefs, setColumnDefs] = useState([]);
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);

    const [financialYear, setFinancialYear] = useState("");
    const [financialYearOptions, setFinancialYearOptions] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);

    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const gridRef = useRef(null);
    const { showToast, ToastContainer } = useToast();

    // ── responsive listener ──
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    // ── fetch financial year dropdown ──
    const fetchFinancialYears = useCallback(async () => {
        try {
            const res = await fetch(
                "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/GetYearsApi.php"
            );
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();

            if (data.status === "success" && Array.isArray(data.data)) {
                const years = data.data.map((item) => ({
                    value: item.financial_year,
                    label: `20${item.financial_year}`
                }));
                setFinancialYearOptions(years);
                if (years.length > 0) setFinancialYear(years[years.length - 1].value);
            }
        } catch (err) {
            console.error("fetchFinancialYears →", err);
            showToast("Error loading financial years", "error");
        }
    }, [showToast]);

    useEffect(() => { fetchFinancialYears(); }, [fetchFinancialYears]);

    // ── currency formatter ──
    const currencyFormatter = (params) => {
        if (params.value == null) return "₹ 0";
        return "₹ " + parseFloat(params.value).toLocaleString("en-IN", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    };

    // ── build ag-grid columns whenever headerData or mobile flag changes ──
    const buildColumns = useCallback((headers) => {
        // Fixed left columns
        const fixed = [
            {
                headerName: "Sr No",
                field: "__srNo",
                valueGetter: (p) => (p.node ? p.node.rowIndex + 1 : ""),
                width: isMobile ? 58 : 72,
                minWidth: 48,
                pinned: "left",
                lockPosition: true,
                cellStyle: { fontWeight: 700, textAlign: "center" }
            },
            {
                headerName: "File Name",
                field: "FILE_NAME",
                width: isMobile ? 175 : 240,
                minWidth: 140,
                pinned: "left",
                cellStyle: { fontWeight: 700, color: "#2563eb" }
            },
            {
                headerName: "File ID",
                field: "FILE_ID",
                width: isMobile ? 80 : 100,
                cellStyle: { textAlign: "center", backgroundColor: "#fef3c7", fontWeight: 600 }
            }
        ];

        // Dynamic columns from headerData  ── skip "total" here; we pin it at the end
        const dynamic = headers
            .filter((h) => h.toLowerCase() !== "total")
            .map((h) => ({
                headerName: h,
                field: h,
                width: isMobile ? 130 : 155,
                minWidth: 100,
                valueFormatter: currencyFormatter,
                type: "numericColumn",
                cellStyle: {
                    textAlign: "right",
                    fontWeight: 600,
                    color: getColor(h)
                }
            }));

        // Pinned "total" column (right)
        const totalCol = {
            headerName: "Total",
            field: "total",
            width: isMobile ? 140 : 160,
            minWidth: 120,
            valueFormatter: currencyFormatter,
            type: "numericColumn",
            pinned: isMobile ? null : "right",
            cellStyle: {
                textAlign: "right",
                fontWeight: 700,
                backgroundColor: "#dcfce7",
                color: "#166534",
                fontSize: "1.05rem"
            }
        };

        return [...fixed, ...dynamic, totalCol];
    }, [isMobile]);

    // ── main data fetch ──
    const fetchData = useCallback(async (fy = financialYear, sdate = fromDate, edate = toDate) => {
        if (!fy) { showToast("Please select a financial year", "error"); return; }
        setLoading(true);

        try {
            let params = `financial_year=${fy}`;
            if (sdate) params += `&sdate=${sdate}`;
            if (edate) params += `&edate=${edate}`;

            const url =
                "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/summary_report/filewise_material_cost_reportApi.php?" + params;

            console.log("Fetching →", url);
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data = await res.json();
            console.log("API Response →", data);

            if (data.status && Array.isArray(data.dataArr)) {
                setRowData(data.dataArr);
                setHeaderData(data.headerData || []);
                setColumnDefs(buildColumns(data.headerData || []));
                setTotalRecords(data.records || data.dataArr.length);

                let info = `FY ${fy}`;
                if (sdate && edate) info += ` (${fmtDate(sdate)} – ${fmtDate(edate)})`;
                showToast(`Loaded ${data.dataArr.length} records for ${info}`, "success");
            } else {
                throw new Error("Unexpected response structure");
            }
        } catch (err) {
            console.error("fetchData →", err);
            showToast(`Error: ${err.message}`, "error");
            setRowData([]);
            setHeaderData([]);
            setColumnDefs([]);
            setTotalRecords(0);
        } finally {
            setLoading(false);
        }
    }, [financialYear, fromDate, toDate, showToast, buildColumns]);

    // auto-load when FY changes
    useEffect(() => {
        if (financialYear) fetchData(financialYear, "", "");
    }, [financialYear]);                          // eslint-disable-line react-hooks/exhaustive-deps

    // ── handlers ──
    const handleSubmit = () => {
        if (!financialYear) { showToast("Please select a financial year", "error"); return; }
        if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
            showToast("From date cannot be after To date", "error");
            return;
        }
        fetchData(financialYear, fromDate, toDate);
    };

    const handleClearDates = () => {
        setFromDate("");
        setToDate("");
        fetchData(financialYear, "", "");
    };

    const refreshData = () => fetchData(financialYear, fromDate, toDate);

    const downloadCsv = () => {
        if (!gridRef.current?.api) return;
        try {
            gridRef.current.api.exportDataAsCsv({
                fileName: `MaterialCostReport_${financialYear}_${new Date().toISOString().split("T")[0]}.csv`,
                allColumns: true,
                onlySelected: false
            });
            showToast("CSV exported successfully!", "success");
        } catch (e) {
            console.error(e);
            showToast("Export failed", "error");
        }
    };

    const autoSizeAll = () => {
        if (!gridRef.current?.api) return;
        setTimeout(() => {
            try {
                const ids = gridRef.current.api.getColumns()?.map((c) => c.getId()) || [];
                if (ids.length) gridRef.current.api.autoSizeColumns(ids, false);
            } catch (e) { console.error(e); }
        }, 120);
    };

    // ── calculate totals row for summary cards (only numeric headerData fields) ──
    const totals = useMemo(() => {
        const map = {};
        headerData.forEach((h) => { map[h] = 0; });
        rowData.forEach((row) => {
            headerData.forEach((h) => { map[h] = (map[h] || 0) + (Number(row[h]) || 0); });
        });
        return map;
    }, [rowData, headerData]);

    // ── theme helpers ──
    const ts = useMemo(() => {
        const dark = theme === "dark";
        return {
            bg: dark ? "linear-gradient(135deg,#1e293b 0%,#0f172a 100%)" : "linear-gradient(135deg,#f0f9ff 0%,#e0f2fe 100%)",
            color: dark ? "#f1f5f9" : "#0f172a",
            cardBg: dark ? "#1e293b" : "#fff",
            cardHeader: dark ? "linear-gradient(135deg,#334155 0%,#1e293b 100%)" : "linear-gradient(135deg,#e0f2fe 0%,#bae6fd 100%)",
            border: dark ? "1px solid #334155" : "1px solid #e2e8f0",
            filterBg: dark ? "#0f172a" : "#f8fafc",
            inputBg: dark ? "#1e293b" : "#fff",
            inputBorder: dark ? "1px solid #334155" : "1px solid #cbd5e1"
        };
    }, [theme]);

    useEffect(() => {
        document.body.style.background = ts.bg;
        document.body.style.color = ts.color;
        document.body.style.minHeight = "100vh";
        return () => {
            document.body.style.background = "";
            document.body.style.color = "";
            document.body.style.minHeight = "";
        };
    }, [ts]);

    const defaultColDef = useMemo(() => ({
        filter: true,
        sortable: true,
        floatingFilter: !isMobile,
        resizable: true,
        suppressMenu: isMobile,
        cellStyle: { textAlign: "left" }
    }), [isMobile]);

    const gridHeight = isFullScreen ? "calc(100vh - 340px)" : isMobile ? "400px" : "560px";

    // ─── loading screen ───
    if (loading && rowData.length === 0) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: ts.bg }}>
                <div style={{ textAlign: "center", color: ts.color }}>
                    <div style={{
                        width: "3rem", height: "3rem",
                        border: "4px solid rgba(37,99,235,0.2)",
                        borderTopColor: "#2563eb",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                        margin: "0 auto"
                    }} />
                    <p style={{ marginTop: "1rem", fontWeight: 600 }}>Loading material cost data…</p>
                </div>
                <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
            </div>
        );
    }

    // ─── render ───────────────────────────────────────────────────────────────
    return (
        <div style={{ minHeight: "100vh", background: ts.bg, color: ts.color, padding: 0, margin: 0 }}>
            {ToastContainer}

            <div style={{
                width: "100%",
                maxWidth: isFullScreen ? "100%" : "1440px",
                margin: isFullScreen ? 0 : "20px auto",
                padding: isFullScreen ? 0 : "0 20px"
            }}>
                <div style={{
                    backgroundColor: ts.cardBg,
                    color: ts.color,
                    border: ts.border,
                    borderRadius: isFullScreen ? 0 : "14px",
                    overflow: "hidden",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.09)"
                }}>

                    {/* ── Header bar ── */}
                    <div style={{
                        background: ts.cardHeader,
                        color: theme === "dark" ? "#fff" : "#0f172a",
                        padding: "1.2rem 2rem",
                        borderBottom: ts.border
                    }}>
                        <div style={{
                            display: "flex",
                            flexDirection: isMobile ? "column" : "row",
                            alignItems: isMobile ? "flex-start" : "center",
                            justifyContent: "space-between",
                            gap: "1rem"
                        }}>
                            {/* title */}
                            <div>
                                <h4 style={{ margin: 0, fontSize: "1.7rem", fontWeight: 800 }}>
                                    📦 File-wise Material Cost Report
                                </h4>
                                <small style={{ opacity: 0.75, display: "block", marginTop: "0.35rem", fontSize: "0.92rem" }}>
                                    {totalRecords} files
                                    {selectedRows.length > 0 && ` · ${selectedRows.length} selected`}
                                </small>
                            </div>

                            {/* action buttons */}
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem", alignItems: "center" }}>
                                {[
                                    { label: "Refresh", icon: "↻", bg: "linear-gradient(135deg,#3b82f6,#2563eb)", shadow: "0 2px 8px rgba(59,130,246,0.3)", onClick: refreshData },
                                    { label: "Export",  icon: "📊", bg: "linear-gradient(135deg,#10b981,#059669)", shadow: "0 2px 8px rgba(16,185,129,0.3)", onClick: downloadCsv },
                                    { label: "Auto",    icon: "↔",  bg: "linear-gradient(135deg,#06b6d4,#0891b2)", shadow: "none",                                  onClick: autoSizeAll }
                                ].map((btn) => (
                                    <button key={btn.label} onClick={btn.onClick} style={{
                                        padding: "0.48rem 0.9rem", fontSize: "0.88rem", borderRadius: "6px",
                                        border: "none", background: btn.bg, color: "#fff", cursor: "pointer",
                                        display: "flex", alignItems: "center", gap: "0.4rem",
                                        fontWeight: 600, boxShadow: btn.shadow
                                    }}>
                                        <span>{btn.icon}</span>
                                        {!isMobile && <span>{btn.label}</span>}
                                    </button>
                                ))}

                                {/* full-screen toggle */}
                                <button onClick={() => setIsFullScreen((v) => !v)} style={{
                                    padding: "0.48rem 0.9rem", fontSize: "0.88rem", borderRadius: "6px",
                                    border: ts.border, backgroundColor: "transparent",
                                    color: ts.color, cursor: "pointer", fontWeight: 600
                                }}>
                                    {isFullScreen ? "⛶ Exit" : "⛶ Full"}
                                </button>

                                {/* theme toggle */}
                                <button onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))} style={{
                                    padding: "0.48rem 0.9rem", fontSize: "0.88rem", borderRadius: "6px",
                                    border: ts.border, backgroundColor: "transparent",
                                    color: ts.color, cursor: "pointer", fontWeight: 600
                                }}>
                                    {theme === "light" ? "🌙" : "☀️"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ── Filters ── */}
                    <div style={{ padding: "1.4rem 2rem", background: ts.filterBg, borderBottom: ts.border }}>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(190px, 1fr))",
                            gap: "1rem",
                            alignItems: "end"
                        }}>
                            {/* Financial Year */}
                            <div>
                                <label style={{ display: "block", marginBottom: "0.45rem", fontWeight: 600, fontSize: "0.88rem", color: ts.color }}>
                                    Financial Year <span style={{ color: "#ef4444" }}>*</span>
                                </label>
                                <select
                                    value={financialYear}
                                    onChange={(e) => setFinancialYear(e.target.value)}
                                    style={{
                                        width: "100%", padding: "0.6rem 0.85rem", fontSize: "0.93rem",
                                        borderRadius: "6px", border: ts.inputBorder,
                                        backgroundColor: ts.inputBg, color: ts.color,
                                        fontWeight: 600, outline: "none"
                                    }}
                                >
                                    <option value="">Select FY</option>
                                    {financialYearOptions.map((o) => (
                                        <option key={o.value} value={o.value}>FY {o.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* From Date */}
                            <div>
                                <label style={{ display: "block", marginBottom: "0.45rem", fontWeight: 600, fontSize: "0.88rem", color: ts.color }}>
                                    From Date
                                </label>
                                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={{
                                    width: "100%", padding: "0.6rem 0.85rem", fontSize: "0.93rem",
                                    borderRadius: "6px", border: ts.inputBorder,
                                    backgroundColor: ts.inputBg, color: ts.color, outline: "none",
                                    boxSizing: "border-box"
                                }} />
                            </div>

                            {/* To Date */}
                            <div>
                                <label style={{ display: "block", marginBottom: "0.45rem", fontWeight: 600, fontSize: "0.88rem", color: ts.color }}>
                                    To Date
                                </label>
                                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={{
                                    width: "100%", padding: "0.6rem 0.85rem", fontSize: "0.93rem",
                                    borderRadius: "6px", border: ts.inputBorder,
                                    backgroundColor: ts.inputBg, color: ts.color, outline: "none",
                                    boxSizing: "border-box"
                                }} />
                            </div>

                            {/* Submit / Clear */}
                            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!financialYear || loading}
                                    style={{
                                        flex: 1, minWidth: "100px", padding: "0.6rem 1.4rem", fontSize: "0.93rem",
                                        borderRadius: "6px", border: "none",
                                        background: financialYear && !loading
                                            ? "linear-gradient(135deg,#8b5cf6,#7c3aed)" : "#94a3b8",
                                        color: "#fff",
                                        cursor: financialYear && !loading ? "pointer" : "not-allowed",
                                        fontWeight: 700,
                                        boxShadow: financialYear && !loading ? "0 2px 8px rgba(139,92,246,0.3)" : "none",
                                        display: "flex", alignItems: "center", justifyContent: "center", gap: "0.45rem"
                                    }}
                                >
                                    {loading ? (
                                        <>
                                            <div style={{
                                                width: "1rem", height: "1rem",
                                                border: "2px solid rgba(255,255,255,0.3)",
                                                borderTopColor: "#fff", borderRadius: "50%",
                                                animation: "spin 0.6s linear infinite"
                                            }} />
                                            <span>Loading…</span>
                                        </>
                                    ) : (
                                        <><span>🔍</span><span>Submit</span></>
                                    )}
                                </button>

                                <button
                                    onClick={handleClearDates}
                                    disabled={!fromDate && !toDate}
                                    style={{
                                        padding: "0.6rem 1rem", fontSize: "0.93rem", borderRadius: "6px",
                                        border: "none",
                                        background: fromDate || toDate
                                            ? "linear-gradient(135deg,#ef4444,#dc2626)" : "#94a3b8",
                                        color: "#fff",
                                        cursor: fromDate || toDate ? "pointer" : "not-allowed",
                                        fontWeight: 600,
                                        display: "flex", alignItems: "center", gap: "0.4rem"
                                    }}
                                >
                                    <span>✖</span><span>Clear</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ── Summary Cards (dynamic) ── */}
                    <div style={{ padding: "1.3rem 2rem", background: ts.filterBg, borderBottom: ts.border }}>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fit, minmax(160px, 1fr))",
                            gap: "0.8rem"
                        }}>
                            {headerData.map((h) => (
                                <SummaryCard
                                    key={h}
                                    theme={theme}
                                    label={h}
                                    value={totals[h] || 0}
                                    color={getColor(h)}
                                    isTotal={h.toLowerCase() === "total"}
                                />
                            ))}
                        </div>
                    </div>

                    {/* ── Data Grid ── */}
                    <div style={{ backgroundColor: ts.cardBg, padding: isFullScreen ? 0 : "14px" }}>
                        {rowData.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "60px 20px", color: ts.color }}>
                                <div style={{ fontSize: "3.8rem", marginBottom: "16px" }}>📦</div>
                                <h5 style={{ marginBottom: "8px", fontSize: "1.2rem" }}>No material cost data available</h5>
                                <p style={{ color: theme === "dark" ? "#94a3b8" : "#64748b" }}>
                                    {!financialYear
                                        ? "Select a financial year and click Submit"
                                        : "No data found for the selected criteria"}
                                </p>
                            </div>
                        ) : (
                            <div
                                className="ag-theme-alpine"
                                style={{
                                    height: gridHeight,
                                    width: "100%",
                                    ...(theme === "dark" && {
                                        "--ag-background-color": "#1e293b",
                                        "--ag-header-background-color": "#334155",
                                        "--ag-odd-row-background-color": "#1e293b",
                                        "--ag-even-row-background-color": "#0f172a",
                                        "--ag-row-hover-color": "#334155",
                                        "--ag-foreground-color": "#f1f5f9",
                                        "--ag-header-foreground-color": "#f1f5f9",
                                        "--ag-border-color": "#334155",
                                        "--ag-selected-row-background-color": "#10b981",
                                        "--ag-input-background-color": "#334155",
                                        "--ag-input-border-color": "#475569"
                                    })
                                }}
                            >
                                <AgGridReact
                                    ref={gridRef}
                                    rowData={rowData}
                                    columnDefs={columnDefs}
                                    defaultColDef={defaultColDef}
                                    pagination={true}
                                    paginationPageSize={isMobile ? 10 : 25}
                                    rowSelection="multiple"
                                    onSelectionChanged={(e) =>
                                        setSelectedRows(e.api.getSelectedNodes().map((n) => n.data))
                                    }
                                    suppressMovableColumns={isMobile}
                                    enableRangeSelection={!isMobile}
                                    rowMultiSelectWithClick={true}
                                    animateRows={!isMobile}
                                    enableCellTextSelection={true}
                                    suppressHorizontalScroll={false}
                                    headerHeight={isMobile ? 40 : 48}
                                    rowHeight={isMobile ? 36 : 44}
                                    onGridReady={() => {
                                        console.log("Material Cost Grid ready");
                                        setTimeout(() => autoSizeAll(), 500);
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── global keyframes ── */}
            <style>{`
                @keyframes toastSlide {
                    from { opacity:0; transform:translateX(100%); }
                    to   { opacity:1; transform:translateX(0);    }
                }
                @keyframes spin {
                    to { transform:rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

// ─── tiny date formatter ──────────────────────────────────────────────────────
function fmtDate(str) {
    if (!str) return "";
    return new Date(str).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default FilewiseMaterialCostReport;