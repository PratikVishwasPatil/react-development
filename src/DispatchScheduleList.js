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

const DISPATCH_API   = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/DispatchScheduleListApi.php";
const YEARS_API      = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/GetYearsApi.php";

// ─── Toast ───────────────────────────────────────────────────────────────────
const Toast = ({ toasts }) => (
    <div style={{ position: "fixed", top: "1rem", right: "1rem", zIndex: 9999, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {toasts.map(t => (
            <div key={t.id} style={{
                padding: "0.875rem 1.25rem", borderRadius: 8, color: "white",
                fontWeight: 600, fontSize: "0.88rem", minWidth: 220,
                boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                backgroundColor: t.type === "success" ? "#22c55e" : "#ef4444",
                animation: "toastIn 0.3s ease"
            }}>{t.message}</div>
        ))}
    </div>
);

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadgeCell = ({ value, isDark }) => {
    const isComplete = value === "Complete";
    const bg    = isComplete ? (isDark ? "#14532d40" : "#dcfce7") : (isDark ? "#7c180840" : "#fff7ed");
    const color = isComplete ? (isDark ? "#4ade80" : "#15803d")  : (isDark ? "#fb923c" : "#c2410c");
    const dot   = isComplete ? (isDark ? "#4ade80" : "#16a34a")  : (isDark ? "#fb923c" : "#ea580c");
    return (
        <span style={{ background: bg, color, padding: "3px 10px", borderRadius: 20, fontSize: "0.74rem", fontWeight: 700, whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: dot, display: "inline-block" }} />
            {value}
        </span>
    );
};

// ─── Dispatch Type Badge ──────────────────────────────────────────────────────
const DispTypeBadgeCell = ({ value, isDark }) => {
    const colorMap = {
        D1: ["#ede9fe", "#6d28d9"],
        D2: ["#dbeafe", "#1d4ed8"],
        D3: ["#fef3c7", "#92400e"],
        D4: ["#d1fae5", "#065f46"],
        D5: ["#fce7f3", "#9d174d"],
        D6: ["#e0f2fe", "#0369a1"],
        D7: ["#f1f5f9", "#475569"],
    };
    const [lightBg, baseColor] = colorMap[value] || ["#f1f5f9", "#475569"];
    const bg    = isDark ? baseColor + "30" : lightBg;
    const color = isDark ? "#e2e8f0" : baseColor;
    return (
        <span style={{ background: bg, color, padding: "2px 10px", borderRadius: 20, fontSize: "0.74rem", fontWeight: 700, letterSpacing: "0.03em", whiteSpace: "nowrap" }}>
            {value}
        </span>
    );
};

// ─── Action Link Cell ─────────────────────────────────────────────────────────
const ActionLinkCell = ({ value, isDark, color }) => (
    <span style={{
        color: isDark ? color.dark : color.light,
        fontWeight: 600, fontSize: "0.78rem",
        cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 2
    }}>
        {value}
    </span>
);

// ─── File Name Cell ───────────────────────────────────────────────────────────
const FileNameCell = ({ value, isDark }) => (
    <span style={{
        color: isDark ? "#38bdf8" : "#0284c7",
        fontWeight: 700, cursor: "pointer",
        textDecoration: "underline", textUnderlineOffset: 2
    }}>
        {value}
    </span>
);

// ─── Loader / Empty ───────────────────────────────────────────────────────────
const Loader = ({ color = "#6366f1", isDark }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 380, flexDirection: "column", gap: 16 }}>
        <div style={{ width: 40, height: 40, border: `4px solid ${color}33`, borderTopColor: color, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.83rem", color: isDark ? "#94a3b8" : "#64748b", letterSpacing: "0.05em" }}>
            FETCHING DISPATCH RECORDS...
        </span>
    </div>
);

const Empty = ({ isDark }) => (
    <div style={{ textAlign: "center", padding: "80px 20px", color: isDark ? "#475569" : "#94a3b8" }}>
        <div style={{ fontSize: "3rem", marginBottom: 12 }}>🚚</div>
        <p style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.83rem", letterSpacing: "0.08em" }}>NO DISPATCH RECORDS FOUND</p>
    </div>
);

// ─── Btn ──────────────────────────────────────────────────────────────────────
const Btn = ({ color, onClick, children }) => (
    <button onClick={onClick} style={{
        padding: "0.42rem 0.85rem", fontSize: "0.84rem", borderRadius: 6, border: "none",
        background: color, color: "white", cursor: "pointer", fontWeight: 600,
        display: "flex", alignItems: "center", gap: "0.3rem",
        boxShadow: `0 2px 6px ${color}55`
    }}>
        {children}
    </button>
);

// ─── Year Selector ────────────────────────────────────────────────────────────
const YearSelector = ({ years, selected, onChange, isDark, loading }) => {
    const bg     = isDark ? "#1e293b" : "#ffffff";
    const border = isDark ? "1px solid #1e3a5f" : "1px solid #e2e8f0";
    const color  = isDark ? "#e2e8f0" : "#0f172a";
    return (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.73rem", color: isDark ? "#7dd3fc" : "#0369a1", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
                📅 FY:
            </span>
            <select
                value={selected}
                onChange={e => onChange(e.target.value)}
                disabled={loading || years.length === 0}
                style={{
                    padding: "0.38rem 0.7rem", fontSize: "0.84rem", borderRadius: 6,
                    border, backgroundColor: bg, color, cursor: "pointer", fontWeight: 600,
                    outline: "none", minWidth: 100
                }}
            >
                {years.map(y => (
                    <option key={y.id} value={y.financial_year}>{y.financial_year}</option>
                ))}
            </select>
        </div>
    );
};

// ─── Stats Cards ──────────────────────────────────────────────────────────────
const StatsBar = ({ data, isDark }) => {
    const total      = data.length;
    const complete   = data.filter(r => r.status === "Complete").length;
    const incomplete = total - complete;
    const types      = [...new Set(data.map(r => r.dispatch_type))].length;

    const cardStyle = (color) => ({
        background: isDark ? color + "15" : color + "12",
        border: `1px solid ${color}33`,
        borderRadius: 10, padding: "0.6rem 1rem",
        display: "flex", flexDirection: "column", gap: 2, minWidth: 90
    });

    const stats = [
        { label: "Total",      val: total,      color: "#6366f1" },
        { label: "Complete",   val: complete,   color: "#22c55e" },
        { label: "Pending",    val: incomplete, color: "#f59e0b" },
        { label: "Disp Types", val: types,      color: "#0ea5e9" },
    ];

    return (
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
            {stats.map(s => (
                <div key={s.label} style={cardStyle(s.color)}>
                    <span style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.68rem", color: isDark ? "#94a3b8" : "#64748b", letterSpacing: "0.05em" }}>{s.label}</span>
                    <span style={{ fontWeight: 800, fontSize: "1.1rem", color: s.color, fontFamily: "'DM Mono',monospace" }}>{s.val}</span>
                </div>
            ))}
        </div>
    );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const DispatchScheduleDashboard = () => {
    const [theme, setTheme]               = useState("light");
    const [isMobile, setIsMobile]         = useState(window.innerWidth <= 768);
    const [toasts, setToasts]             = useState([]);

    const [years, setYears]               = useState([]);
    const [yearsLoading, setYearsLoading] = useState(false);
    const [selectedYear, setSelectedYear] = useState("25-26");

    const [dispatchData, setDispatchData]     = useState([]);
    const [loading, setLoading]               = useState(false);
    const [count, setCount]                   = useState(0);
    const [selected, setSelected]             = useState([]);
    const gridRef = useRef();

    const isDark = theme === "dark";
    const accent = "#6366f1";

    const showToast = useCallback((message, type = "success") => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
    }, []);

    useEffect(() => {
        const fn = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener("resize", fn);
        return () => window.removeEventListener("resize", fn);
    }, []);

    // ── Fetch Financial Years ──
    const fetchYears = useCallback(async () => {
        setYearsLoading(true);
        try {
            const res  = await fetch(YEARS_API);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            if (json.status === "success" && Array.isArray(json.data)) {
                const sorted = [...json.data].sort((a, b) => Number(a.sequence_no) - Number(b.sequence_no));
                setYears(sorted);
                // Default to latest year
                if (sorted.length > 0) {
                    const latest = sorted[sorted.length - 1].financial_year;
                    setSelectedYear(latest);
                }
            } else throw new Error("Unexpected response");
        } catch (e) {
            showToast(`Failed to load financial years: ${e.message}`, "error");
        } finally { setYearsLoading(false); }
    }, [showToast]);

    // ── Fetch Dispatch Records ──
    const fetchDispatch = useCallback(async (year) => {
        setLoading(true);
        try {
            const url  = `${DISPATCH_API}?financial_year=${encodeURIComponent(year)}`;
            const res  = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            if ((json.status === "success" || json.success) && Array.isArray(json.data)) {
                setDispatchData(json.data);
                setCount(json.count || json.data.length);
                showToast(`Loaded ${json.data.length} dispatch records for FY ${year}`, "success");
            } else throw new Error("Unexpected response");
        } catch (e) {
            showToast(`Dispatch fetch failed: ${e.message}`, "error");
            setDispatchData([]);
        } finally { setLoading(false); }
    }, [showToast]);

    useEffect(() => { fetchYears(); }, [fetchYears]);
    useEffect(() => { if (selectedYear) fetchDispatch(selectedYear); }, [selectedYear, fetchDispatch]);

    const handleYearChange = useCallback((year) => {
        setSelectedYear(year);
    }, []);

    // ── Column Definitions ──
    const columns = useMemo(() => [
        {
            headerName: "#",
            valueGetter: "node.rowIndex + 1",
            width: 65, maxWidth: 65,
            pinned: "left",
            suppressSizeToFit: true,
            cellStyle: { textAlign: "center", fontWeight: 700, color: isDark ? "#a5b4fc" : "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center" }
        },
        {
            field: "FILE_NAME",
            headerName: "File Name",
            minWidth: 180, flex: 2,
            pinned: "left",
            checkboxSelection: true,
            headerCheckboxSelection: true,
            cellStyle: { display: "flex", alignItems: "center" },
            cellRenderer: (params) => <FileNameCell value={params.value} isDark={isDark} />
        },
        {
            field: "id",
            headerName: "ID",
            minWidth: 80, flex: 0.7,
            cellStyle: { textAlign: "center", fontFamily: "'DM Mono',monospace", fontSize: "0.82rem", color: isDark ? "#94a3b8" : "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }
        },
        {
            field: "file_id",
            headerName: "File ID",
            minWidth: 90, flex: 0.8,
            cellStyle: { textAlign: "center", fontFamily: "'DM Mono',monospace", fontSize: "0.82rem", color: isDark ? "#94a3b8" : "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }
        },
        {
            field: "disp_date",
            headerName: "Dispatch Date",
            minWidth: 130, flex: 1.2,
            cellStyle: { display: "flex", alignItems: "center", fontFamily: "'DM Mono',monospace", fontSize: "0.82rem", fontWeight: 600 }
        },
        {
            field: "dispatch_type",
            headerName: "Type",
            minWidth: 90, flex: 0.8,
            cellStyle: { display: "flex", alignItems: "center", justifyContent: "center" },
            cellRenderer: (params) => <DispTypeBadgeCell value={params.value} isDark={isDark} />
        },
        {
            field: "weight",
            headerName: "Weight",
            minWidth: 100, flex: 0.9,
            cellStyle: { display: "flex", alignItems: "center", justifyContent: "flex-end", fontFamily: "'DM Mono',monospace", fontSize: "0.82rem", paddingRight: 12 },
            valueFormatter: (params) => params.value ? Number(params.value).toLocaleString() : "—"
        },
        {
            field: "status",
            headerName: "Status",
            minWidth: 130, flex: 1,
            cellStyle: { display: "flex", alignItems: "center", justifyContent: "center" },
            cellRenderer: (params) => <StatusBadgeCell value={params.value} isDark={isDark} />
        },
        {
    field: "verifymaterial",
    headerName: "Verify Material",
    minWidth: 130, flex: 1,
    cellStyle: { display: "flex", alignItems: "center", justifyContent: "center" },
    cellRenderer: (params) => (
        <span
            onClick={() => {
                const fileId = params.data.file_id;
                const type   = params.data.dispatch_type;
                window.location.href = `#/verify-material/${fileId}/${type}`;
            }}
            style={{
                color: isDark ? "#a78bfa" : "#7c3aed",
                fontWeight: 600, fontSize: "0.78rem",
                cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 2
            }}
        >
            {params.value}
        </span>
    )
},
{
    field: "perform_disp",
    headerName: "Perform Disp.",
    minWidth: 130, flex: 1,
    cellStyle: { display: "flex", alignItems: "center", justifyContent: "center" },
    cellRenderer: (params) => (
        <span
            onClick={() => {
                const fileId = params.data.file_id;
                const type   = params.data.dispatch_type;
                window.location.href = `#/perform-dispatch/${fileId}/${type}`;
            }}
            style={{
                color: isDark ? "#67e8f9" : "#0891b2",
                fontWeight: 600, fontSize: "0.78rem",
                cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 2
            }}
        >
            {params.value}
        </span>
    )
},
{
    field: "dispdetails",
    headerName: "Disp. Details",
    minWidth: 120, flex: 1,
    cellStyle: { display: "flex", alignItems: "center", justifyContent: "center" },
    cellRenderer: (params) => (
        <span
            onClick={() => {
                const fileId = params.data.id;
                window.location.href = `#/dispatch-details/${fileId}`;
            }}
            style={{
                color: isDark ? "#fbbf24" : "#d97706",
                fontWeight: 600, fontSize: "0.78rem",
                cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 2
            }}
        >
            {params.value}
        </span>
    )
},
        {
            field: "timestamp",
            headerName: "Timestamp",
            minWidth: 155, flex: 1.3,
            cellStyle: { display: "flex", alignItems: "center", fontFamily: "'DM Mono',monospace", fontSize: "0.78rem", color: isDark ? "#64748b" : "#94a3b8" }
        },
        {
            field: "added_by",
            headerName: "Added By",
            minWidth: 100, flex: 0.9,
            cellStyle: { textAlign: "center", fontFamily: "'DM Mono',monospace", fontSize: "0.82rem", color: isDark ? "#94a3b8" : "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }
        }
    ], [isDark]);

    const defaultColDef = useMemo(() => ({
        filter: true,
        sortable: true,
        floatingFilter: !isMobile,
        resizable: true,
    }), [isMobile]);

    const exportCsv = () => {
        if (!gridRef.current?.api) return;
        gridRef.current.api.exportDataAsCsv({ fileName: `DispatchSchedule_FY${selectedYear}_${new Date().toISOString().split("T")[0]}.csv`, allColumns: true });
        showToast("Exported successfully!", "success");
    };

    const autoSize = () => {
        if (!gridRef.current?.api) return;
        setTimeout(() => {
            const ids = gridRef.current.api.getColumns()?.map(c => c.getId()) || [];
            if (ids.length) gridRef.current.api.autoSizeColumns(ids, false);
        }, 100);
    };

    // ── Theme ──
    const bg       = isDark ? "#0d1117" : "#f4f6fb";
    const cardBg   = isDark ? "#0f172a" : "#ffffff";
    const border   = isDark ? "1px solid #1e3a5f" : "1px solid #e2e8f0";
    const headerBg = isDark ? "#080f1e" : "#eef2ff";
    const gridH    = isMobile ? "calc(100vh - 320px)" : "calc(100vh - 260px)";

    const agDark = isDark ? {
        "--ag-background-color":              "#0f172a",
        "--ag-header-background-color":       "#1e293b",
        "--ag-odd-row-background-color":      "#0f172a",
        "--ag-even-row-background-color":     "#111827",
        "--ag-row-hover-color":               "rgba(99,102,241,0.07)",
        "--ag-foreground-color":              "#e2e8f0",
        "--ag-header-foreground-color":       "#a5b4fc",
        "--ag-border-color":                  "#1e3a5f",
        "--ag-selected-row-background-color": "rgba(99,102,241,0.13)",
        "--ag-input-background-color":        "#1e293b",
        "--ag-input-border-color":            "#334155",
        "--ag-checkbox-checked-color":        "#6366f1",
    } : {};

    return (
        <div style={{ minHeight: "100vh", backgroundColor: bg, color: isDark ? "#e2e8f0" : "#0f172a", fontFamily: "Inter, sans-serif" }}>
            <Toast toasts={toasts} />

            <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

            <div style={{ backgroundColor: cardBg, minHeight: "100vh" }}>

                {/* ═══ HEADER ═══ */}
                <div style={{ background: headerBg, padding: "1rem 1.5rem", borderBottom: border }}>
                    <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", gap: "0.75rem" }}>
                        <div style={{ flex: 1 }}>
                            <h2 style={{ margin: 0, fontWeight: 800, fontSize: isMobile ? "1.2rem" : "1.45rem", color: isDark ? "#e0e7ff" : "#312e81", letterSpacing: "-0.02em" }}>
                                🚚 Dispatch Schedule Dashboard
                            </h2>
                            <div style={{ display: "flex", gap: "1rem", marginTop: "0.25rem", flexWrap: "wrap", alignItems: "center" }}>
                                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.73rem", color: isDark ? "#a5b4fc" : "#4f46e5", letterSpacing: "0.04em" }}>
                                    RECORDS: {count}
                                </span>
                                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.73rem", color: isDark ? "#94a3b8" : "#64748b", letterSpacing: "0.04em" }}>
                                    FY: {selectedYear}
                                </span>
                            </div>
                            {dispatchData.length > 0 && <StatsBar data={dispatchData} isDark={isDark} />}
                        </div>

                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", alignItems: "center" }}>
                            {/* Year Selector */}
                            <YearSelector
                                years={years}
                                selected={selectedYear}
                                onChange={handleYearChange}
                                isDark={isDark}
                                loading={yearsLoading}
                            />

                            <Btn color="#16a34a" onClick={exportCsv}>
                                📊{!isMobile && " Export"}
                            </Btn>
                            <Btn color="#0891b2" onClick={autoSize}>
                                ↔{!isMobile && " Auto"}
                            </Btn>
                            <Btn color={accent} onClick={() => fetchDispatch(selectedYear)}>
                                ↻{!isMobile && " Refresh"}
                            </Btn>
                            <button
                                onClick={() => setTheme(t => t === "light" ? "dark" : "light")}
                                style={{ padding: "0.42rem 0.8rem", fontSize: "0.88rem", borderRadius: 6, border, backgroundColor: "transparent", color: isDark ? "#e2e8f0" : "#334155", cursor: "pointer", fontWeight: 600 }}
                            >
                                {isDark ? "☀️" : "🌙"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Selection bar */}
                {selected.length > 0 && (
                    <div style={{ padding: "0.45rem 1.5rem", backgroundColor: isDark ? "#1e1b4b" : "#ede9fe", borderBottom: border, display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.78rem", color: isDark ? "#a5b4fc" : "#4f46e5", fontWeight: 700 }}>
                            {selected.length} ROW(S) SELECTED
                        </span>
                        <button
                            onClick={() => { gridRef.current?.api?.deselectAll(); }}
                            style={{ padding: "2px 10px", fontSize: "0.76rem", borderRadius: 4, border: "1px solid #c4b5fd", backgroundColor: "transparent", color: isDark ? "#a5b4fc" : "#4f46e5", cursor: "pointer" }}
                        >
                            Clear
                        </button>
                    </div>
                )}

                {/* ═══ GRID ═══ */}
                <div style={{ backgroundColor: cardBg }}>
                    {loading ? (
                        <Loader isDark={isDark} color={accent} />
                    ) : dispatchData.length === 0 ? (
                        <Empty isDark={isDark} />
                    ) : (
                        <div className="ag-theme-alpine" style={{ height: gridH, width: "100%", ...agDark }}>
                            <AgGridReact
                                ref={gridRef}
                                rowData={dispatchData}
                                columnDefs={columns}
                                defaultColDef={defaultColDef}
                                rowSelection="multiple"
                                rowMultiSelectWithClick
                                onSelectionChanged={(e) => setSelected(e.api.getSelectedRows())}
                                pagination={true}
                                paginationPageSize={isMobile ? 10 : 25}
                                animateRows={!isMobile}
                                enableCellTextSelection={false}
                                headerHeight={isMobile ? 40 : 46}
                                rowHeight={isMobile ? 38 : 44}
                                onGridReady={(p) => {
                                    setTimeout(() => {
                                        const ids = p.api.getColumns()?.map(c => c.getId()) || [];
                                        if (ids.length) p.api.autoSizeColumns(ids, false);
                                    }, 300);
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes spin    { to { transform: rotate(360deg); } }
                @keyframes toastIn { from { opacity:0; transform:translateX(60px); } to { opacity:1; transform:translateX(0); } }
                .ag-header-cell-label { font-weight:700!important; font-size:0.81rem!important; letter-spacing:0.02em; }
                .ag-cell { font-size:0.86rem!important; }
                .ag-floating-filter-input { font-family:'DM Mono',monospace!important; font-size:0.79rem!important; }
                .ag-paging-panel { font-size:0.81rem!important; font-family:'DM Mono',monospace!important; }
            `}</style>
        </div>
    );
};

export default DispatchScheduleDashboard;