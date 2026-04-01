import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { ModuleRegistry } from "ag-grid-community";
import {
    ClientSideRowModelModule,
    ValidationModule,
    TextFilterModule,
    NumberFilterModule,
    RowSelectionModule,
    PaginationModule,
    CsvExportModule
} from "ag-grid-community";

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ValidationModule,
    TextFilterModule,
    NumberFilterModule,
    RowSelectionModule,
    PaginationModule,
    CsvExportModule
]);

const PRINT_LIST_API = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/DispatchPrintNewListApi.php";
const YEARS_API      = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/GetYearsApi.php";

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ toasts }) => (
    <div style={{ position:"fixed", top:"1rem", right:"1rem", zIndex:9999, display:"flex", flexDirection:"column", gap:"0.5rem" }}>
        {toasts.map(t => (
            <div key={t.id} style={{
                padding:"0.875rem 1.25rem", borderRadius:8, color:"white",
                fontWeight:600, fontSize:"0.88rem", minWidth:220,
                boxShadow:"0 8px 24px rgba(0,0,0,0.18)",
                backgroundColor: t.type === "success" ? "#22c55e" : "#ef4444",
                animation:"toastIn 0.3s ease"
            }}>{t.message}</div>
        ))}
    </div>
);

// ─── Loader ───────────────────────────────────────────────────────────────────
const Loader = ({ isDark }) => (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:380, flexDirection:"column", gap:16 }}>
        <div style={{ width:40, height:40, border:`4px solid #6366f133`, borderTopColor:"#6366f1", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
        <span style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.83rem", color: isDark ? "#94a3b8" : "#64748b", letterSpacing:"0.05em" }}>
            FETCHING PRINT RECORDS...
        </span>
    </div>
);

// ─── Empty ────────────────────────────────────────────────────────────────────
const Empty = ({ isDark }) => (
    <div style={{ textAlign:"center", padding:"80px 20px", color: isDark ? "#475569" : "#94a3b8" }}>
        <div style={{ fontSize:"3rem", marginBottom:12 }}>🖨️</div>
        <p style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.83rem", letterSpacing:"0.08em" }}>NO PRINT RECORDS FOUND</p>
    </div>
);

// ─── Btn ──────────────────────────────────────────────────────────────────────
const Btn = ({ color, onClick, children, disabled }) => (
    <button onClick={onClick} disabled={disabled} style={{
        padding:"0.42rem 0.85rem", fontSize:"0.84rem", borderRadius:6, border:"none",
        background: disabled ? "#94a3b8" : color, color:"white", cursor: disabled ? "not-allowed" : "pointer",
        fontWeight:600, display:"flex", alignItems:"center", gap:"0.3rem",
        boxShadow: disabled ? "none" : `0 2px 6px ${color}55`,
        opacity: disabled ? 0.6 : 1
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
        <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
            <span style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.73rem", color: isDark ? "#7dd3fc" : "#0369a1", letterSpacing:"0.04em", whiteSpace:"nowrap" }}>
                📅 FY:
            </span>
            <select
                value={selected}
                onChange={e => onChange(e.target.value)}
                disabled={loading || years.length === 0}
                style={{ padding:"0.38rem 0.7rem", fontSize:"0.84rem", borderRadius:6, border, backgroundColor:bg, color, cursor:"pointer", fontWeight:600, outline:"none", minWidth:100 }}
            >
                {years.map(y => (
                    <option key={y.id || y.financial_year} value={y.financial_year}>{y.financial_year}</option>
                ))}
            </select>
        </div>
    );
};

// ─── Stats Bar ────────────────────────────────────────────────────────────────
const StatsBar = ({ data, isDark }) => {
    const stats = [
        { label:"Total Files", val: data.length, color:"#6366f1" },
    ];
    return (
        <div style={{ display:"flex", gap:"0.6rem", flexWrap:"wrap", marginTop:"0.5rem" }}>
            {stats.map(s => (
                <div key={s.label} style={{
                    background: isDark ? s.color+"15" : s.color+"12",
                    border:`1px solid ${s.color}33`,
                    borderRadius:10, padding:"0.6rem 1rem",
                    display:"flex", flexDirection:"column", gap:2, minWidth:90
                }}>
                    <span style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.68rem", color: isDark ? "#94a3b8" : "#64748b", letterSpacing:"0.05em" }}>{s.label}</span>
                    <span style={{ fontWeight:800, fontSize:"1.1rem", color:s.color, fontFamily:"'DM Mono',monospace" }}>{s.val}</span>
                </div>
            ))}
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const DispatchPrintList = () => {
    const [theme, setTheme]               = useState("light");
    const [isMobile, setIsMobile]         = useState(window.innerWidth <= 768);
    const [toasts, setToasts]             = useState([]);
    const [years, setYears]               = useState([]);
    const [yearsLoading, setYearsLoading] = useState(false);
    const [selectedYear, setSelectedYear] = useState("25-26");
    const [printData, setPrintData]       = useState([]);
    const [loading, setLoading]           = useState(false);
    const [selected, setSelected]         = useState([]);
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
                if (sorted.length > 0) {
                    setSelectedYear(sorted[sorted.length - 1].financial_year);
                }
            }
        } catch (e) {
            showToast(`Failed to load financial years: ${e.message}`, "error");
        } finally { setYearsLoading(false); }
    }, [showToast]);

    // ── Fetch Print List ──
    const fetchPrintList = useCallback(async (year) => {
        setLoading(true);
        try {
            const res  = await fetch(`${PRINT_LIST_API}?financial_year=${encodeURIComponent(year)}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            if ((json.status === true || json.status === "success") && Array.isArray(json.data)) {
                setPrintData(json.data);
                showToast(`Loaded ${json.data.length} records for FY ${year}`, "success");
            } else throw new Error(json.message || "Unexpected response");
        } catch (e) {
            showToast(`Fetch failed: ${e.message}`, "error");
            setPrintData([]);
        } finally { setLoading(false); }
    }, [showToast]);

    useEffect(() => { fetchYears(); }, [fetchYears]);
    useEffect(() => { if (selectedYear) fetchPrintList(selectedYear); }, [selectedYear, fetchPrintList]);

    // ── Navigate to print detail page ──
    const navigateToPrintDetail = useCallback((rowData) => {
        const fileId   = rowData.id;
        const fileName = encodeURIComponent(rowData.file_name);
        window.location.href = `#/dispatch-print-detail/${fileId}/${fileName}`;
    }, []);

    // ── Column Definitions ──
    const columns = useMemo(() => [
        {
            headerName: "#",
            valueGetter: "node.rowIndex + 1",
            width: 65, maxWidth: 65,
            pinned: "left",
            suppressSizeToFit: true,
            cellStyle: { textAlign:"center", fontWeight:700, color: isDark ? "#a5b4fc" : "#4f46e5", display:"flex", alignItems:"center", justifyContent:"center" }
        },
        {
            field: "file_name",
            headerName: "File Name",
            minWidth: 220, flex: 2,
            pinned: "left",
            checkboxSelection: true,
            headerCheckboxSelection: true,
            cellStyle: { display:"flex", alignItems:"center" },
            cellRenderer: (params) => (
                <span
                    onClick={() => navigateToPrintDetail(params.data)}
                    style={{
                        color: isDark ? "#38bdf8" : "#0284c7",
                        fontWeight:700, cursor:"pointer",
                        textDecoration:"underline", textUnderlineOffset:2,
                        fontFamily:"'DM Mono',monospace"
                    }}
                >
                    {params.value}
                </span>
            )
        },
        {
            field: "id",
            headerName: "ID",
            minWidth: 90, flex: 0.8,
            cellStyle: { textAlign:"center", fontFamily:"'DM Mono',monospace", fontSize:"0.82rem", color: isDark ? "#94a3b8" : "#64748b", display:"flex", alignItems:"center", justifyContent:"center" }
        },
        {
            headerName: "Print",
            minWidth: 130, flex: 1,
            cellStyle: { display:"flex", alignItems:"center", justifyContent:"center" },
            cellRenderer: (params) => (
                <button
                    onClick={() => navigateToPrintDetail(params.data)}
                    style={{
                        padding:"5px 16px",
                        background: isDark ? "#7c3aed" : "#6d28d9",
                        color:"#fff", border:"none", borderRadius:6,
                        cursor:"pointer", fontWeight:700, fontSize:"0.78rem",
                        display:"flex", alignItems:"center", gap:5,
                        boxShadow:`0 2px 8px #6d28d940`
                    }}
                >
                    🖨️ Print
                </button>
            )
        }
    ], [isDark, navigateToPrintDetail]);

    const defaultColDef = useMemo(() => ({
        filter: true,
        sortable: true,
        floatingFilter: !isMobile,
        resizable: true,
    }), [isMobile]);

    const exportCsv = () => {
        if (!gridRef.current?.api) return;
        gridRef.current.api.exportDataAsCsv({ fileName:`DispatchPrintList_FY${selectedYear}.csv`, allColumns:true });
        showToast("Exported!", "success");
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
        <div style={{ minHeight:"100vh", backgroundColor:bg, color: isDark ? "#e2e8f0" : "#0f172a", fontFamily:"Inter, sans-serif" }}>
            <Toast toasts={toasts} />
            <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>

            <div style={{ backgroundColor:cardBg, minHeight:"100vh" }}>
                {/* HEADER */}
                <div style={{ background:headerBg, padding:"1rem 1.5rem", borderBottom:border }}>
                    <div style={{ display:"flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", justifyContent:"space-between", gap:"0.75rem" }}>
                        <div style={{ flex:1 }}>
                            <h2 style={{ margin:0, fontWeight:800, fontSize: isMobile ? "1.2rem" : "1.45rem", color: isDark ? "#e0e7ff" : "#312e81", letterSpacing:"-0.02em" }}>
                                🖨️ Dispatch Print List
                            </h2>
                            <div style={{ display:"flex", gap:"1rem", marginTop:"0.25rem", flexWrap:"wrap", alignItems:"center" }}>
                                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.73rem", color: isDark ? "#a5b4fc" : "#4f46e5", letterSpacing:"0.04em" }}>
                                    RECORDS: {printData.length}
                                </span>
                                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.73rem", color: isDark ? "#94a3b8" : "#64748b", letterSpacing:"0.04em" }}>
                                    FY: {selectedYear}
                                </span>
                            </div>
                            {printData.length > 0 && <StatsBar data={printData} isDark={isDark} />}
                        </div>

                        <div style={{ display:"flex", flexWrap:"wrap", gap:"0.4rem", alignItems:"center" }}>
                            <YearSelector years={years} selected={selectedYear} onChange={setSelectedYear} isDark={isDark} loading={yearsLoading}/>
                            <Btn color="#16a34a" onClick={exportCsv}>📊{!isMobile && " Export"}</Btn>
                            <Btn color="#0891b2" onClick={autoSize}>↔{!isMobile && " Auto"}</Btn>
                            <Btn color={accent} onClick={() => fetchPrintList(selectedYear)}>↻{!isMobile && " Refresh"}</Btn>
                            <button
                                onClick={() => setTheme(t => t === "light" ? "dark" : "light")}
                                style={{ padding:"0.42rem 0.8rem", fontSize:"0.88rem", borderRadius:6, border, backgroundColor:"transparent", color: isDark ? "#e2e8f0" : "#334155", cursor:"pointer", fontWeight:600 }}
                            >
                                {isDark ? "☀️" : "🌙"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Selection bar */}
                {selected.length > 0 && (
                    <div style={{ padding:"0.45rem 1.5rem", backgroundColor: isDark ? "#1e1b4b" : "#ede9fe", borderBottom:border, display:"flex", alignItems:"center", gap:"0.75rem" }}>
                        <span style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.78rem", color: isDark ? "#a5b4fc" : "#4f46e5", fontWeight:700 }}>
                            {selected.length} ROW(S) SELECTED
                        </span>
                        <button
                            onClick={() => gridRef.current?.api?.deselectAll()}
                            style={{ padding:"2px 10px", fontSize:"0.76rem", borderRadius:4, border:"1px solid #c4b5fd", backgroundColor:"transparent", color: isDark ? "#a5b4fc" : "#4f46e5", cursor:"pointer" }}
                        >
                            Clear
                        </button>
                    </div>
                )}

                {/* GRID */}
                <div style={{ backgroundColor:cardBg }}>
                    {loading ? (
                        <Loader isDark={isDark}/>
                    ) : printData.length === 0 ? (
                        <Empty isDark={isDark}/>
                    ) : (
                        <div className="ag-theme-alpine" style={{ height:gridH, width:"100%", ...agDark }}>
                            <AgGridReact
                                ref={gridRef}
                                rowData={printData}
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

export default DispatchPrintList;