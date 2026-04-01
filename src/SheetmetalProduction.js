import React, { useEffect, useState, useRef, useMemo } from "react";
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

const FETCH_API = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/SheetMetalFilterListApi.php";
const SAVE_API  = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/saveShmProductionApi.php";

/* ─── Editable Date Cell ─── */
const DateCellRenderer = (params) => {
    const formatForInput = (val) => {
        if (!val) return "";
        if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
        const p = val.split("-");
        if (p.length === 3 && p[0].length !== 4)
            return `${p[2]}-${p[1].padStart(2, "0")}-${p[0].padStart(2, "0")}`;
        return "";
    };
    return (
        <input
            type="date"
            defaultValue={formatForInput(params.value)}
            onChange={(e) => params.node.setDataValue(params.colDef.field, e.target.value)}
            style={{
                width: "100%", height: "100%", border: "none",
                backgroundColor: "transparent", fontSize: "12px",
                outline: "none", textAlign: "center", color: "#e8650a", cursor: "pointer"
            }}
        />
    );
};

/* ─── Editable Text/Number Cell ─── */
const EditableCellRenderer = (props) => {
    const [val, setVal] = React.useState(props.value ?? "");
    React.useEffect(() => setVal(props.value ?? ""), [props.value]);
    return (
        <input
            type="text"
            value={val}
            onChange={(e) => {
                setVal(e.target.value);
                props.node.setDataValue(props.colDef.field, e.target.value);
            }}
            style={{
                width: "100%", height: "100%", border: "1px solid transparent",
                borderRadius: "3px", padding: "2px 6px", textAlign: "center",
                fontSize: "12px", backgroundColor: "transparent",
                outline: "none", color: "#e8650a"
            }}
            onFocus={(e) => (e.target.style.border = "1.5px solid #e8650a")}
            onBlur={(e) => (e.target.style.border = "1px solid transparent")}
        />
    );
};

/* ─── Toast ─── */
const Toast = ({ toasts }) => (
    <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
        {toasts.map((t) => (
            <div key={t.id} style={{
                padding: "10px 20px", borderRadius: 6, color: "#fff", fontSize: 13,
                background: t.type === "success" ? "#28a745" : t.type === "error" ? "#dc3545" : "#0d6efd",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)", animation: "fadeIn .3s ease"
            }}>
                {t.msg}
            </div>
        ))}
        <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
);

/* ══════════════════════════════════════════════════════════════ */
const SheetMetalGrid = () => {
    const [rowData, setRowData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [theme, setTheme] = useState("light");
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [search, setSearch] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [toasts, setToasts] = useState([]);
    const gridRef = useRef();
    const searchRef = useRef();

    const showToast = (msg, type = "info") => {
        const id = Date.now();
        setToasts((p) => [...p, { id, msg, type }]);
        setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
    };

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    /* ─── Fetch ─── */
    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(FETCH_API, { method: "POST" });
            const text = await res.text();
            const jsonStart = text.indexOf("{");
            const clean = jsonStart >= 0 ? text.slice(jsonStart) : text;
            const data = JSON.parse(clean);
            if (data.status && Array.isArray(data.data)) {
                setRowData(data.data);
                setFilteredData(data.data);
                showToast(`Loaded ${data.data.length} records`, "success");
            } else {
                showToast("No data found", "error");
            }
        } catch (e) {
            console.error(e);
            showToast("Error fetching data: " + e.message, "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    /* ─── Search / Filter ─── */
    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearch(val);
        if (val.trim() === "") {
            setFilteredData(rowData);
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }
        const lower = val.toLowerCase();
        const matched = rowData.filter((r) =>
            r.file_name?.toLowerCase().includes(lower)
        );
        setSuggestions(matched.slice(0, 8));
        setShowSuggestions(true);
        setFilteredData(matched);
    };

    const selectSuggestion = (item) => {
        setSearch(item.file_name);
        setFilteredData([item]);
        setShowSuggestions(false);
    };

    /* ─── Collect all current grid row data ─── */
    const getAllGridRows = () => {
        const rows = [];
        gridRef.current?.api?.forEachNode((node) => rows.push(node.data));
        return rows;
    };

    /* ─── Submit — maps grid fields → API expected keys ─── */
    const handleSubmit = async () => {
        const allRows = getAllGridRows();
        if (!allRows.length) { showToast("No data to submit", "error"); return; }

        // Validate: every row must have a file_id and start_date
        const invalid = allRows.filter(r => !r.file_id || !r.start_date);
        if (invalid.length > 0) {
            showToast(`${invalid.length} row(s) missing File ID or Start Date`, "error");
            return;
        }

        // Build parallel arrays as expected by PHP API
        const fileId        = allRows.map(r => r.file_id);
        const startDate     = allRows.map(r => r.start_date     ?? "");
        const totalWeight   = allRows.map(r => r.total_weight   ?? 0);
        const CompWork      = allRows.map(r => r.comp_work      ?? 0);
        const sqFeet        = allRows.map(r => r.sq_feet        ?? 0);
        const CompWorkPaint = allRows.map(r => r.comp_work_paint ?? 0);
        const dispDate      = allRows.map(r => r.dispatch_date  ?? "");

        const payload = {
            fileId,
            startDate,
            totalWeight,
            CompWork,
            sqFeet,
            CompWorkPaint,
            dispDate
        };

        setSubmitting(true);
        try {
            const res = await fetch(SAVE_API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const text = await res.text();
            const jsonStart = text.indexOf("{");
            const result = JSON.parse(jsonStart >= 0 ? text.slice(jsonStart) : text);

            if (result.status === true || result.status === "true") {
                const updated  = result.data?.filter(d => d.action === "updated").length  ?? 0;
                const inserted = result.data?.filter(d => d.action === "inserted").length ?? 0;
                showToast(
                    `✅ Saved! ${inserted} inserted, ${updated} updated` +
                    (result.errors?.length ? ` | ⚠️ ${result.errors.length} error(s)` : ""),
                    "success"
                );
            } else {
                const errMsg = result.message || "Save failed";
                const errList = result.errors?.join(", ") || "";
                showToast(`❌ ${errMsg}${errList ? ": " + errList : ""}`, "error");
            }
        } catch (e) {
            console.error("Submit error:", e);
            showToast("❌ Network error: " + e.message, "error");
        } finally {
            setSubmitting(false);
        }
    };

    /* ─── Column Definitions ─── */
    const columnDefs = useMemo(() => [
        {
            headerName: "Sr No.",
            valueGetter: (p) => p.node.rowIndex + 1,
            width: 70, minWidth: 60,
            pinned: "left",
            cellStyle: { textAlign: "center", fontWeight: "600", fontSize: "12px" }
        },
        {
            field: "file_name",
            headerName: "File No.",
            width: 170, minWidth: 140,
            pinned: "left",
            cellStyle: {
                fontWeight: "700", fontSize: "12px",
                backgroundColor: theme === "dark" ? "#2c3034" : "#fff8f0"
            },
            filter: "agTextColumnFilter"
        },
        // ── Sheet Metal group ──
        {
            headerName: "Sheet Metal",
            children: [
                {
                    field: "start_date",
                    headerName: "Start Date",
                    width: 160, minWidth: 145,
                    cellRenderer: DateCellRenderer,
                    cellStyle: { padding: "0", backgroundColor: theme === "dark" ? "#1e2630" : "#fff3e6" }
                },
                {
                    field: "total_weight",
                    headerName: "Total Weight (Kg)",
                    width: 140, minWidth: 120,
                    cellRenderer: EditableCellRenderer,
                    cellStyle: { padding: "2px", backgroundColor: theme === "dark" ? "#1e2630" : "#fff3e6" }
                },
                {
                    field: "comp_work",
                    headerName: "Work Complete Status %",
                    width: 170, minWidth: 150,
                    cellRenderer: EditableCellRenderer,
                    cellStyle: { padding: "2px", backgroundColor: theme === "dark" ? "#1e2630" : "#fff3e6" }
                },
                {
                    field: "sq_feet",
                    headerName: "Total Sq. Ft.",
                    width: 130, minWidth: 110,
                    cellRenderer: EditableCellRenderer,
                    cellStyle: { padding: "2px", backgroundColor: theme === "dark" ? "#1e2630" : "#fff3e6" }
                }
            ]
        },
        // ── Power Coating group ──
        {
            headerName: "Power Coating",
            children: [
                {
                    field: "comp_work_paint",
                    headerName: "Work Complete Status %",
                    width: 170, minWidth: 150,
                    cellRenderer: EditableCellRenderer,
                    cellStyle: { padding: "2px", backgroundColor: theme === "dark" ? "#1e2630" : "#fef0e0" }
                },
                {
                    field: "dispatch_date",
                    headerName: "Dispatch Date",
                    width: 160, minWidth: 145,
                    cellRenderer: DateCellRenderer,
                    cellStyle: { padding: "0", backgroundColor: theme === "dark" ? "#1e2630" : "#fef0e0" }
                }
            ]
        }
    ], [theme]);

    const defaultColDef = useMemo(() => ({
        sortable: true,
        resizable: true,
        suppressMenu: isMobile,
        filter: false,
        floatingFilter: false
    }), [isMobile]);

    /* ─── Theme ─── */
    const T = theme === "dark"
        ? { bg: "#161b22", card: "#21262d", header: "#2c3034", border: "#495057", color: "#f8f9fa", sub: "#adb5bd" }
        : { bg: "#f5f5f5", card: "#ffffff", header: "#f8f8f8", border: "#e0e0e0", color: "#1a1a1a", sub: "#666" };

    const gridHeight = isFullScreen ? "calc(100vh - 230px)" : (isMobile ? "400px" : "560px");

    if (loading) return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.bg }}>
            <div style={{ textAlign: "center", color: T.color }}>
                <div style={{
                    width: 48, height: 48, border: "4px solid #e8650a",
                    borderRightColor: "transparent", borderRadius: "50%",
                    animation: "spin 0.9s linear infinite", margin: "0 auto 16px"
                }} />
                <p style={{ margin: 0, fontSize: 15 }}>Loading Sheet Metal data…</p>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: "100vh", background: T.bg, color: T.color, margin: 0, padding: 0 }}>
            <Toast toasts={toasts} />

            <div style={{ padding: isFullScreen ? 0 : 20 }}>
                <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: isFullScreen ? 0 : 10 }}>

                    {/* ── Header ── */}
                    <div style={{
                        background: T.header, padding: "14px 24px",
                        borderBottom: `1px solid ${T.border}`,
                        display: "flex", justifyContent: "space-between",
                        alignItems: "center", flexWrap: "wrap", gap: 12
                    }}>
                        <div>
                            <h4 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#e8650a" }}>
                                🔩 Sheet Metal Dashboard
                            </h4>
                            <small style={{ color: T.sub }}>
                                {filteredData.length} of {rowData.length} records
                            </small>
                        </div>

                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                            {/* Searchable File Name */}
                            <div ref={searchRef} style={{ position: "relative" }}>
                                <input
                                    type="text"
                                    placeholder="🔍 Search File Name…"
                                    value={search}
                                    onChange={handleSearchChange}
                                    onFocus={() => search && setShowSuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                    style={{
                                        padding: "7px 12px", borderRadius: 6,
                                        border: `1.5px solid ${T.border}`,
                                        background: T.card, color: T.color,
                                        fontSize: 13, width: 200, outline: "none"
                                    }}
                                />
                                {showSuggestions && suggestions.length > 0 && (
                                    <div style={{
                                        position: "absolute", top: "110%", left: 0, zIndex: 1000,
                                        background: T.card, border: `1px solid ${T.border}`,
                                        borderRadius: 6, minWidth: 220, boxShadow: "0 4px 16px rgba(0,0,0,0.12)"
                                    }}>
                                        {suggestions.map((s) => (
                                            <div
                                                key={s.file_id}
                                                onMouseDown={() => selectSuggestion(s)}
                                                style={{
                                                    padding: "8px 14px", cursor: "pointer",
                                                    fontSize: 13, color: T.color,
                                                    borderBottom: `1px solid ${T.border}`
                                                }}
                                                onMouseEnter={(e) => e.target.style.background = "#e8650a22"}
                                                onMouseLeave={(e) => e.target.style.background = "transparent"}
                                            >
                                                {s.file_name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {search && (
                                <button onClick={() => { setSearch(""); setFilteredData(rowData); setSuggestions([]); }}
                                    style={{ padding: "7px 12px", borderRadius: 6, border: `1px solid ${T.border}`, background: T.card, color: T.color, cursor: "pointer", fontSize: 13 }}>
                                    ✕ Clear
                                </button>
                            )}

                            <button onClick={fetchData}
                                style={{ padding: "7px 14px", borderRadius: 6, border: "none", background: "#0d6efd", color: "#fff", cursor: "pointer", fontSize: 13 }}>
                                🔄 Refresh
                            </button>

                            <button onClick={() => gridRef.current?.api?.exportDataAsCsv({ fileName: `SheetMetal_${new Date().toISOString().split("T")[0]}.csv` })}
                                style={{ padding: "7px 14px", borderRadius: 6, border: "none", background: "#28a745", color: "#fff", cursor: "pointer", fontSize: 13 }}>
                                📥 Export CSV
                            </button>

                            <button onClick={() => setIsFullScreen(!isFullScreen)}
                                style={{ padding: "7px 14px", borderRadius: 6, border: `1px solid ${T.border}`, background: T.card, color: T.color, cursor: "pointer", fontSize: 13 }}>
                                {isFullScreen ? "⛶ Exit" : "⛶ Full"}
                            </button>

                            <button onClick={() => setTheme(t => t === "light" ? "dark" : "light")}
                                style={{ padding: "7px 14px", borderRadius: 6, border: `1px solid ${T.border}`, background: T.card, color: T.color, cursor: "pointer", fontSize: 13 }}>
                                {theme === "light" ? "🌙 Dark" : "☀️ Light"}
                            </button>
                        </div>
                    </div>

                    {/* ── Grid ── */}
                    <div style={{ padding: isFullScreen ? 0 : 12 }}>
                        {filteredData.length === 0 ? (
                            <div style={{ textAlign: "center", padding: 60, color: T.sub }}>
                                <div style={{ fontSize: 48 }}>🔍</div>
                                <h5 style={{ marginTop: 16 }}>No records found</h5>
                                <p>Try a different search term or refresh the data.</p>
                            </div>
                        ) : (
                            <>
                                <style>{`
                                    .ag-theme-alpine .ag-header-group-cell {
                                        background-color: #e8650a !important;
                                        color: #fff !important;
                                        font-weight: 700 !important;
                                        font-size: 13px !important;
                                        border-right: 2px solid #fff !important;
                                    }
                                    .ag-theme-alpine .ag-header-cell {
                                        background-color: #f97316 !important;
                                        color: #fff !important;
                                        font-size: 11px !important;
                                        font-weight: 600 !important;
                                    }
                                    .ag-theme-alpine .ag-row:hover {
                                        background-color: #fff3e6 !important;
                                    }
                                    ${theme === "dark" ? `
                                        .ag-theme-alpine {
                                            --ag-background-color: #21262d;
                                            --ag-header-background-color: #2c3034;
                                            --ag-odd-row-background-color: #1e2630;
                                            --ag-foreground-color: #f8f9fa;
                                            --ag-header-foreground-color: #fff;
                                            --ag-border-color: #495057;
                                            --ag-row-hover-color: #2c3a4a;
                                        }
                                    ` : ""}
                                `}</style>
                                <div className="ag-theme-alpine" style={{ height: gridHeight, width: "100%" }}>
                                    <AgGridReact
                                        ref={gridRef}
                                        rowData={filteredData}
                                        columnDefs={columnDefs}
                                        defaultColDef={defaultColDef}
                                        pagination={true}
                                        paginationPageSize={isMobile ? 10 : 20}
                                        suppressMovableColumns={true}
                                        animateRows={!isMobile}
                                        enableCellTextSelection={true}
                                        headerHeight={isMobile ? 36 : 42}
                                        groupHeaderHeight={isMobile ? 32 : 38}
                                        rowHeight={isMobile ? 34 : 40}
                                        onGridReady={() => {
                                            setTimeout(() => {
                                                const ids = gridRef.current?.api?.getColumns()?.map(c => c.getId()) || [];
                                                if (ids.length) gridRef.current.api.autoSizeColumns(ids, false);
                                            }, 300);
                                        }}
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    {/* ── Submit Button ── */}
                    <div style={{
                        padding: "16px 24px",
                        borderTop: `1px solid ${T.border}`,
                        display: "flex", justifyContent: "center",
                        background: T.header
                    }}>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            style={{
                                padding: "11px 60px",
                                fontSize: 15, fontWeight: 700,
                                background: submitting ? "#ccc" : "#e8650a",
                                color: "#fff", border: "none",
                                borderRadius: 8, cursor: submitting ? "not-allowed" : "pointer",
                                letterSpacing: "0.5px",
                                boxShadow: submitting ? "none" : "0 4px 14px rgba(232,101,10,0.4)",
                                transition: "all 0.2s ease"
                            }}
                            onMouseEnter={(e) => { if (!submitting) e.target.style.background = "#c9540a"; }}
                            onMouseLeave={(e) => { if (!submitting) e.target.style.background = "#e8650a"; }}
                        >
                            {submitting ? "⏳ Submitting…" : "Submit"}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SheetMetalGrid;