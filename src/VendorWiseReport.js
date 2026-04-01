import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { ModuleRegistry } from "ag-grid-community";
import {
    ClientSideRowModelModule,
    ValidationModule,
    NumberFilterModule,
    TextFilterModule,
    RowSelectionModule,
    PaginationModule,
    CsvExportModule
} from "ag-grid-community";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip
} from "recharts";

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ValidationModule,
    NumberFilterModule,
    TextFilterModule,
    RowSelectionModule,
    PaginationModule,
    CsvExportModule
]);

/* ─── 64-colour palette ─────────────────────────────────────────────────── */
const PALETTE = [
    "#e6194b","#3cb44b","#ffe119","#4363d8","#f58231","#911eb4",
    "#42d4f4","#f032e6","#bfef45","#fabed4","#469990","#dcbeff",
    "#9A6324","#fffac8","#800000","#aaffc3","#808000","#ffd8b1",
    "#000075","#a9a9a9","#e6beff","#1abc9c","#e74c3c","#9b59b6",
    "#3498db","#2ecc71","#f39c12","#e67e22","#16a085","#8e44ad",
    "#2980b9","#27ae60","#d35400","#c0392b","#2c3e50","#7f8c8d",
    "#e8a838","#6c5ce7","#00cec9","#fd79a8","#a29bfe","#55efc4",
    "#fdcb6e","#e17055","#0984e3","#fab1a0","#636e72","#b2bec3",
    "#74b9ff","#ffeaa7","#81ecec","#d63031","#0652DD","#FDA7DF",
    "#6ab04c","#f0932b","#eb4d4b","#badc58","#4834d4","#be2edd",
    "#130f40","#5f27cd","#01a3a4","#f368e0"
];

/* ─── Toast ─────────────────────────────────────────────────────────────── */
const ToastContainer = ({ toasts }) => (
    <div style={{ position:"fixed", top:"1rem", right:"1rem", zIndex:9999, display:"flex", flexDirection:"column", gap:"0.5rem" }}>
        {toasts.map(t => (
            <div key={t.id} style={{
                padding:"0.85rem 1.4rem", borderRadius:"8px", boxShadow:"0 4px 12px rgba(0,0,0,.18)",
                color:"#fff", backgroundColor: t.type==="success" ? "#10b981" : "#ef4444",
                animation:"slideIn .3s ease-out", minWidth:"240px", fontWeight:"600", fontSize:"0.92rem"
            }}>{t.message}</div>
        ))}
    </div>
);

/* ─── Summary Card ──────────────────────────────────────────────────────── */
const SummaryCard = ({ theme, label, value, color, isTotal }) => (
    <div style={{
        padding:"0.9rem 1rem", borderRadius:"10px",
        background: theme==="dark" ? "#1e293b" : "#fff",
        border: isTotal ? `2px solid ${color}` : theme==="dark" ? "1px solid #334155" : "1px solid #e2e8f0",
        boxShadow: isTotal ? `0 4px 14px ${color}33` : "0 2px 6px rgba(0,0,0,.06)",
        transition:"transform .2s, box-shadow .2s", cursor:"default"
    }}
    onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow=`0 8px 20px ${color}44`; }}
    onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow= isTotal ? `0 4px 14px ${color}33` : "0 2px 6px rgba(0,0,0,.06)"; }}
    >
        <div style={{ fontSize:"0.73rem", fontWeight:"700", color: theme==="dark" ? "#94a3b8" : "#64748b", textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:"0.35rem" }}>{label}</div>
        <div style={{ fontSize: isTotal ? "1.35rem" : "1.1rem", fontWeight:"700", color }}> ₹ {value.toLocaleString("en-IN")}</div>
    </div>
);

/* ─── Custom Legend – responsive grid, handles 60+ items cleanly ────────── */
const CustomLegend = ({ data, theme }) => {
    const textColor = theme === "dark" ? "#cbd5e1" : "#374151";
    return (
        <div style={{
            display:"grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap:"5px 16px",
            padding:"16px 8px 6px 8px",
            borderTop: theme==="dark" ? "1px solid #334155" : "1px solid #e2e8f0",
            marginTop:"10px"
        }}>
            {data.map((item, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:"6px", overflow:"hidden" }}>
                    <div style={{ width:"10px", height:"10px", borderRadius:"50%", backgroundColor: item.fill, flexShrink:0 }} />
                    <span style={{ fontSize:"11px", fontWeight:"600", color: textColor, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                        {item.name}
                    </span>
                </div>
            ))}
        </div>
    );
};

/* ─── Main ──────────────────────────────────────────────────────────────── */
const VendorWiseDCReport = () => {
    const [theme, setTheme]                     = useState("light");
    const [rowData, setRowData]                 = useState([]);
    const [isFullScreen, setIsFullScreen]       = useState(true);
    const [isMobile, setIsMobile]               = useState(typeof window !== "undefined" ? window.innerWidth <= 768 : false);
    const [loading, setLoading]                 = useState(false);
    const [financialYear, setFinancialYear]     = useState("");
    const [financialYearOptions, setFYOptions]  = useState([]);
    const [headerData, setHeaderData]           = useState([]);
    const [recordCount, setRecordCount]         = useState(0);
    const [toasts, setToasts]                   = useState([]);
    const [chartData, setChartData]             = useState([]);
    const [pageSize, setPageSize]               = useState(10);

    const gridRef = useRef(null);

    /* ── toast ── */
    const showToast = useCallback((msg, type = "success") => {
        const id = Date.now() + Math.random();
        setToasts(p => [...p, { id, message: msg, type }]);
        setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3200);
    }, []);

    /* ── resize ── */
    useEffect(() => {
        const h = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener("resize", h);
        return () => window.removeEventListener("resize", h);
    }, []);

    /* ── fetch FY list ── */
    const fetchFYs = useCallback(async () => {
        try {
            const r = await fetch("https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/GetYearsApi.php");
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            const d = await r.json();
            if (d.status === "success" && Array.isArray(d.data)) {
                const yrs = d.data.map(i => ({ value: i.financial_year, label: `20${i.financial_year}` }));
                setFYOptions(yrs);
                if (yrs.length) setFinancialYear(yrs[yrs.length - 1].value);
            }
        } catch (e) { console.error(e); showToast("Error loading financial years", "error"); }
    }, [showToast]);

    useEffect(() => { fetchFYs(); }, [fetchFYs]);

    /* ── fetch main data ── */
    const fetchData = useCallback(async (fy) => {
        if (!fy) { showToast("Please select a financial year", "error"); return; }
        setLoading(true);
        try {
            const url = `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/summary_report/get_vendor_wise_dc_report_Api.php?financial_year=${fy}`;
            const r   = await fetch(url);
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            const json = await r.json();

            const payload = json.data || json;
            if (payload && Array.isArray(payload.dataArr)) {
                setRowData(payload.dataArr);
                setRecordCount(payload.dataArr.length);
                if (Array.isArray(payload.headerData)) setHeaderData(payload.headerData);
                showToast(`Loaded ${payload.dataArr.length} vendors for FY ${fy}`, "success");
            } else {
                throw new Error("Unexpected response shape");
            }
        } catch (e) {
            console.error(e);
            showToast(`Error: ${e.message}`, "error");
            setRowData([]); setRecordCount(0); setHeaderData([]);
        } finally { setLoading(false); }
    }, [showToast]);

    useEffect(() => { if (financialYear) fetchData(financialYear); }, [financialYear, fetchData]);

    /* ── derive chart data ──────────────────────────────────────────────
       FIX 1 – colour is assigned on original index BEFORE sort, so legend
               dot colours stay locked to the correct vendor.
       FIX 2 – ALL vendors are kept (even total === 0).  Recharts Pie
               simply draws nothing for a 0-value slice but the legend still
               shows the name – exactly like the screenshot.
       FIX 3 – `percentage` is pre-computed here so the label renderer can
               use it directly without re-calculating.                        */
    useEffect(() => {
        if (!rowData.length) { setChartData([]); return; }

        /* step 1: colour BEFORE sort */
        const withColour = rowData.map((r, i) => ({
            name:  r.CUSTOMER_NAME,
            value: Number(r.total) || 0,
            fill:  PALETTE[i % PALETTE.length]
        }));

        /* step 2: sort descending */
        withColour.sort((a, b) => b.value - a.value);

        /* step 3: pre-compute percentage */
        const grandTotal = withColour.reduce((s, d) => s + d.value, 0);
        withColour.forEach(d => {
            d.percentage = grandTotal > 0 ? (d.value / grandTotal) * 100 : 0;
        });

        setChartData(withColour);
    }, [rowData]);

    /* ── number formatter ── */
    const numFmt = useCallback(p => {
        const v = Number(p.value);
        return v === 0 ? "0" : v.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }, []);

    /* ── column defs ── */
    const columnDefs = useMemo(() => {
        if (!headerData.length) return [];
        const materialCols = headerData.filter(h => h.toLowerCase() !== "total");
        return [
            {
                headerName: "CUSTOMER_NAME", field: "CUSTOMER_NAME",
                width: isMobile ? 170 : 230, minWidth: 140,
                pinned: "left", lockPosition: true,
                cellStyle: { fontWeight:"600", color: theme==="dark" ? "#f1f5f9" : "#1e293b", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }
            },
            ...materialCols.map(h => ({
                headerName: h, field: h,
                width: isMobile ? 108 : 135, minWidth: 85,
                type: "numericColumn", valueFormatter: numFmt,
                cellStyle: { textAlign:"right", fontWeight:"500", color: theme==="dark" ? "#cbd5e1" : "#374151" }
            })),
            {
                headerName: "Total", field: "total",
                width: isMobile ? 130 : 155, minWidth: 110,
                pinned: "right", lockPosition: true,
                type: "numericColumn", valueFormatter: numFmt,
                cellStyle: {
                    textAlign:"right", fontWeight:"700", fontSize:"0.97rem",
                    backgroundColor: theme==="dark" ? "#92400e" : "#fcd9a3",
                    color: theme==="dark" ? "#fff7ed" : "#7c2d12"
                }
            }
        ];
    }, [headerData, isMobile, theme, numFmt]);

    /* ── default col def ── */
    const defaultColDef = useMemo(() => ({
        filter: true, sortable: true, floatingFilter: !isMobile,
        resizable: true, suppressMenu: isMobile, cellStyle: { textAlign:"left" }
    }), [isMobile]);

    /* ── pinned bottom (Total) row ── */
    const pinnedBottomRowData = useMemo(() => {
        if (!rowData.length || !headerData.length) return [];
        const materialCols = headerData.filter(h => h.toLowerCase() !== "total");
        const sums = { CUSTOMER_NAME: "Total" };
        materialCols.forEach(h => { sums[h] = rowData.reduce((a, r) => a + (Number(r[h]) || 0), 0); });
        sums.total = rowData.reduce((a, r) => a + (Number(r.total) || 0), 0);
        return [sums];
    }, [rowData, headerData]);

    /* ── totals for summary cards ── */
    const totals = useMemo(() => {
        const materialCols = headerData.filter(h => h.toLowerCase() !== "total");
        const acc = {};
        materialCols.forEach(h => (acc[h] = 0));
        acc.total = 0;
        rowData.forEach(r => {
            materialCols.forEach(h => { acc[h] = (acc[h] || 0) + (Number(r[h]) || 0); });
            acc.total = (acc.total || 0) + (Number(r.total) || 0);
        });
        return acc;
    }, [rowData, headerData]);

    /* ── utilities ── */
    const autoSizeAll = useCallback((skipHeader = false) => {
        if (!gridRef.current?.api) return;
        setTimeout(() => {
            try {
                const ids = gridRef.current.api.getColumns()?.map(c => c.getId()) || [];
                if (ids.length) gridRef.current.api.autoSizeColumns(ids, skipHeader);
            } catch (e) { console.error(e); }
        }, 180);
    }, []);

    const sizeToFit = useCallback(() => {
        if (!gridRef.current?.api) return;
        try { gridRef.current.api.sizeColumnsToFit(); } catch (e) { console.error(e); }
    }, []);

    const exportCSV = useCallback(() => {
        if (!gridRef.current?.api) return;
        try {
            gridRef.current.api.exportDataAsCsv({ fileName: `VendorWiseDC_FY${financialYear}_${new Date().toISOString().split("T")[0]}.csv`, allColumns: true });
            showToast("CSV exported successfully!", "success");
        } catch (e) { showToast("Export failed", "error"); }
    }, [financialYear, showToast]);

    const exportExcel = useCallback(() => {
        if (!gridRef.current?.api) return;
        try {
            gridRef.current.api.exportDataAsCsv({ fileName: `VendorWiseDC_FY${financialYear}_${new Date().toISOString().split("T")[0]}.xlsx`, allColumns: true });
            showToast("Excel file exported!", "success");
        } catch (e) { showToast("Export failed", "error"); }
    }, [financialYear, showToast]);

    const clearPinned = useCallback(() => {
        if (!gridRef.current?.api) return;
        try {
            (gridRef.current.api.getColumns() || []).forEach(col => {
                const id = col.getId();
                if      (id === "CUSTOMER_NAME") col.setPinned("left");
                else if (id === "total")         col.setPinned("right");
                else                             col.setPinned(null);
            });
            showToast("Extra pins cleared", "success");
        } catch (e) { showToast("Could not clear pins", "error"); }
    }, [showToast]);

    /* ── theme object ── */
    const ts = useMemo(() => theme === "dark" ? {
        bg:"linear-gradient(135deg,#1e293b 0%,#0f172a 100%)", color:"#f1f5f9",
        cardBg:"#1e293b", cardHdr:"linear-gradient(135deg,#334155 0%,#1e293b 100%)",
        filterBg:"#0f172a", border:"#334155"
    } : {
        bg:"linear-gradient(135deg,#f0f9ff 0%,#e0f2fe 100%)", color:"#0f172a",
        cardBg:"#ffffff", cardHdr:"linear-gradient(135deg,#e0f2fe 0%,#bae6fd 100%)",
        filterBg:"#f8fafc", border:"#e2e8f0"
    }, [theme]);

    useEffect(() => {
        document.body.style.background = ts.bg;
        document.body.style.color = ts.color;
        document.body.style.minHeight = "100vh";
        return () => { document.body.style.background=""; document.body.style.color=""; document.body.style.minHeight=""; };
    }, [ts]);

    const CARD_COLORS = ["#059669","#0891b2","#7c3aed","#dc2626","#ea580c","#0284c7","#ca8a04","#db2777","#65a30d","#6366f1","#0d9488","#b45309"];
    const materialHeaders = headerData.filter(h => h.toLowerCase() !== "total");
    const gridHeight = isFullScreen ? "calc(100vh - 380px)" : (isMobile ? "420px" : "580px");

    /* ── loading ── */
    if (loading && !rowData.length) return (
        <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background: ts.bg }}>
            <div style={{ textAlign:"center", color: ts.color }}>
                <div style={{ width:"3rem", height:"3rem", border:"4px solid rgba(37,99,235,.2)", borderTopColor:"#2563eb", borderRadius:"50%", animation:"spin 1s linear infinite", margin:"0 auto" }} />
                <p style={{ marginTop:"1rem", fontWeight:"600" }}>Loading Vendor-wise DC report…</p>
            </div>
        </div>
    );

    /* ──── RENDER ── */
    return (
        <div style={{ minHeight:"100vh", background: ts.bg, color: ts.color, padding:0, margin:0 }}>
            <ToastContainer toasts={toasts} />

            <div style={{ width:"100%", maxWidth: isFullScreen ? "100%" : "1440px", margin: isFullScreen ? 0 : "20px auto", padding: isFullScreen ? 0 : "0 20px" }}>
                <div style={{ backgroundColor: ts.cardBg, color: ts.color, border:`1px solid ${ts.border}`, borderRadius: isFullScreen ? 0 : "12px", overflow:"hidden", boxShadow:"0 4px 24px rgba(0,0,0,.1)" }}>

                    {/* ── HEADER BAR ── */}
                    <div style={{ background: ts.cardHdr, color: theme==="dark" ? "#fff" : "#0f172a", padding:"1.2rem 1.8rem", borderBottom:`1px solid ${ts.border}` }}>
                        <div style={{ display:"flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", justifyContent:"space-between", gap:"0.8rem" }}>
                            <div>
                                <h4 style={{ margin:0, fontSize:"1.7rem", fontWeight:"800" }}>📦 Vendor-wise DC Report</h4>
                                <small style={{ opacity:.78, display:"block", marginTop:".35rem", fontSize:".92rem" }}>
                                    {recordCount} vendors{financialYear && ` | FY ${financialYear}`} | Grand Total: ₹ {(totals.total || 0).toLocaleString("en-IN")}
                                </small>
                            </div>
                            <div style={{ display:"flex", gap:".45rem", flexWrap:"wrap" }}>
                                <button onClick={() => setIsFullScreen(p => !p)} style={outlineBtnStyle(theme)}>{isFullScreen ? "⛶ Exit" : "⛶ Full"}</button>
                                <button onClick={() => setTheme(t => t==="light" ? "dark" : "light")} style={outlineBtnStyle(theme)}>{theme==="light" ? "🌙" : "☀️"}</button>
                            </div>
                        </div>
                    </div>

                    {/* ── ORANGE TOOLBAR ── */}
                    <div style={{ display:"flex", flexWrap:"wrap", gap:".4rem", padding:".7rem 1.2rem", background: theme==="dark" ? "#1a1005" : "#fff3e0", borderBottom:`1px solid ${ts.border}`, alignItems:"center" }}>
                        <OrangeBtn onClick={exportExcel}>⬇ Download Excel Export File</OrangeBtn>
                        <OrangeBtn onClick={exportCSV}>⬇ Download CSV Export File</OrangeBtn>
                        <OrangeBtn onClick={clearPinned}>📌 Clear Pinned</OrangeBtn>
                        <OrangeBtn onClick={() => showToast("CUSTOMER_NAME & Total are pinned", "success")}>📌 Pinned</OrangeBtn>
                        <OrangeBtn onClick={sizeToFit}>↔ Size To Fit</OrangeBtn>
                        <OrangeBtn onClick={() => autoSizeAll(false)}>↔ Auto-Size All</OrangeBtn>
                        <OrangeBtn onClick={() => autoSizeAll(true)}>↔ Auto-Size All (Skip Header)</OrangeBtn>

                        <div style={{ marginLeft:"auto", display:"flex", gap:".7rem", alignItems:"center", flexWrap:"wrap" }}>
                            <select value={financialYear} onChange={e => setFinancialYear(e.target.value)}
                                style={{ padding:".4rem .7rem", fontSize:".88rem", borderRadius:"5px", border:"1px solid #f09030", color:"#e65100", fontWeight:"700", background: theme==="dark" ? "#1e293b" : "#fff", outline:"none", cursor:"pointer" }}>
                                <option value="">Select FY</option>
                                {financialYearOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                            <select value={pageSize} onChange={e => { const n = Number(e.target.value); setPageSize(n); if (gridRef.current?.api) gridRef.current.api.paginationSetPageSize(n); }}
                                style={{ padding:".4rem .7rem", fontSize:".88rem", borderRadius:"5px", border:"1px solid #ccc", background: theme==="dark" ? "#1e293b" : "#fff", color: theme==="dark" ? "#f1f5f9" : "#374151", outline:"none", cursor:"pointer" }}>
                                {[10,25,50,100].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* ── SUMMARY CARDS ── */}
                    {headerData.length > 0 && (
                        <div style={{ padding:"1rem 1.6rem", background: ts.filterBg, borderBottom:`1px solid ${ts.border}` }}>
                            <div style={{ display:"grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(auto-fit, minmax(140px,1fr))", gap:".65rem" }}>
                                {materialHeaders.map((h, i) => <SummaryCard key={h} theme={theme} label={h} value={totals[h]||0} color={CARD_COLORS[i % CARD_COLORS.length]} />)}
                                <SummaryCard theme={theme} label="Grand Total" value={totals.total||0} color="#fb923c" isTotal />
                            </div>
                        </div>
                    )}

                    {/* ── AG-GRID ── */}
                    <div style={{ backgroundColor: ts.cardBg }}>
                        {rowData.length === 0 ? (
                            <div style={{ textAlign:"center", padding:"60px 20px", color: ts.color }}>
                                <div style={{ fontSize:"4rem", marginBottom:"18px" }}>📦</div>
                                <h5 style={{ marginBottom:"8px", fontSize:"1.2rem" }}>No vendor data available</h5>
                                <p style={{ color: theme==="dark" ? "#94a3b8" : "#64748b" }}>
                                    {!financialYear ? "Please select a financial year" : "No data found for the selected FY"}
                                </p>
                            </div>
                        ) : (
                            <div className="ag-theme-alpine" style={{
                                height: gridHeight, width:"100%",
                                ...(theme==="dark" && {
                                    "--ag-background-color":"#1e293b",
                                    "--ag-header-background-color":"#e8812a",
                                    "--ag-odd-row-background-color":"#1e293b",
                                    "--ag-even-row-background-color":"#0f172a",
                                    "--ag-row-hover-color":"#334155",
                                    "--ag-foreground-color":"#f1f5f9",
                                    "--ag-header-foreground-color":"#ffffff",
                                    "--ag-border-color":"#334155",
                                    "--ag-selected-row-background-color":"#10b981",
                                    "--ag-input-background-color":"#334155",
                                    "--ag-input-border-color":"#475569",
                                    "--ag-pinned-col-boxshadow":"inset 2px 0 4px rgba(0,0,0,.25)"
                                }),
                                ...(theme==="light" && {
                                    "--ag-header-background-color":"#f09030",
                                    "--ag-header-foreground-color":"#ffffff",
                                    "--ag-odd-row-background-color":"#ffffff",
                                    "--ag-even-row-background-color":"#faf5f0",
                                    "--ag-row-hover-color":"#fff0e0",
                                    "--ag-pinned-col-boxshadow":"inset 2px 0 4px rgba(0,0,0,.08)"
                                })
                            }}>
                                <AgGridReact
                                    ref={gridRef}
                                    rowData={rowData}
                                    columnDefs={columnDefs}
                                    defaultColDef={defaultColDef}
                                    pagination={true}
                                    paginationPageSize={pageSize}
                                    pinnedBottomRowData={pinnedBottomRowData}
                                    suppressMovableColumns={isMobile}
                                    enableRangeSelection={!isMobile}
                                    animateRows={!isMobile}
                                    enableCellTextSelection={true}
                                    suppressHorizontalScroll={false}
                                    headerHeight={isMobile ? 42 : 50}
                                    rowHeight={isMobile ? 38 : 44}
                                    floatingFilterHeight={isMobile ? 32 : 38}
                                    onGridReady={() => setTimeout(() => autoSizeAll(false), 600)}
                                    getRowStyle={params => {
                                        if (params.node.rowPinned === "bottom") return {
                                            fontWeight:"700",
                                            backgroundColor: theme==="dark" ? "#92400e" : "#f5c08a",
                                            color: theme==="dark" ? "#fff7ed" : "#7c2d12",
                                            fontSize:"0.96rem"
                                        };
                                        return {};
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    
                    {chartData.length > 0 && (
                        <div style={{ backgroundColor: ts.cardBg, padding:"2rem 1rem 1.5rem", borderTop:`2px solid ${ts.border}` }}>
                            <h5 style={{ margin:"0 0 0.8rem 0", textAlign:"center", fontSize:"1.45rem", fontWeight:"700", color: ts.color }}>
                                Vendorwise dc Report
                            </h5>

                            {/* Pie only – no Legend inside */}
                            <ResponsiveContainer width="100%" height={isMobile ? 320 : 380}>
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={isMobile ? 105 : 140}
                                        innerRadius={isMobile ? 58 : 78}
                                        dataKey="value"
                                        labelLine={{ stroke: theme==="dark" ? "#94a3b8" : "#555", strokeWidth:1 }}
                                        label={({ name, percentage, value }) => {
                                            /* FIX 4: percentage is already on the object */
                                            if (percentage < 0.8) return "";
                                            return `${name}: (${percentage.toFixed(2)}%) ₹${value.toLocaleString("en-IN")}`;
                                        }}
                                    >
                                        {chartData.map((entry, i) => (
                                            <Cell
                                                key={`cell-${i}`}
                                                fill={entry.fill}
                                                stroke={theme==="dark" ? "#1e293b" : "#fff"}
                                                strokeWidth={2}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: theme==="dark" ? "#334155" : "#fff",
                                            border: theme==="dark" ? "1px solid #475569" : "1px solid #e2e8f0",
                                            borderRadius:"8px", padding:"10px 14px",
                                            boxShadow:"0 4px 12px rgba(0,0,0,.15)",
                                            color: ts.color, fontSize:"13px"
                                        }}
                                        formatter={(value, name) => [`₹ ${Number(value).toLocaleString("en-IN")}`, name]}
                                    />
                                </PieChart>
                            </ResponsiveContainer>

                            {/* FIX 5 – custom legend rendered outside ResponsiveContainer */}
                            <CustomLegend data={chartData} theme={theme} />
                        </div>
                    )}

                </div>
            </div>

            <style>{`
                @keyframes slideIn { from { opacity:0; transform:translateX(100%); } to { opacity:1; transform:translateX(0); } }
                @keyframes spin    { to   { transform:rotate(360deg); } }
                .ag-theme-alpine .ag-header-cell            { font-weight:700 !important; font-size:0.88rem !important; }
                .ag-theme-alpine .ag-cell                   { font-size:0.93rem !important; padding:0 10px !important; }
                .ag-theme-alpine .ag-floating-filter-input  { font-size:0.82rem !important; }
                .ag-theme-alpine .ag-row-pinned-bottom .ag-cell { border-top:2px solid #e08020 !important; }
            `}</style>
        </div>
    );
};

/* ─── Orange Button ─────────────────────────────────────────────────────── */
const OrangeBtn = ({ onClick, children }) => (
    <button onClick={onClick} style={{
        padding:".42rem .88rem", fontSize:".81rem", borderRadius:"5px", border:"none",
        background:"linear-gradient(135deg,#f09030 0%,#e07020 100%)", color:"#fff",
        cursor:"pointer", fontWeight:"600", whiteSpace:"nowrap",
        boxShadow:"0 2px 6px rgba(230,100,0,.3)", transition:"filter .15s"
    }}
    onMouseEnter={e => e.currentTarget.style.filter="brightness(1.12)"}
    onMouseLeave={e => e.currentTarget.style.filter="brightness(1)"}
    >{children}</button>
);

/* ─── Outline Button Style ──────────────────────────────────────────────── */
const outlineBtnStyle = (theme) => ({
    padding:".45rem .95rem", fontSize:".88rem", borderRadius:"6px",
    border:`1px solid ${theme==="dark" ? "#f1f5f9" : "#0f172a"}`,
    backgroundColor:"transparent", color: theme==="dark" ? "#f1f5f9" : "#0f172a",
    cursor:"pointer", fontWeight:"600"
});

export default VendorWiseDCReport;