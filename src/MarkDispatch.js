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

const BASE_URL    = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api";
const DISPATCH_API = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/savemarkSecondDcDispatchApi.php";

/* ─── Toast ─── */
const Toast = ({ toasts }) => (
    <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
        {toasts.map((t) => (
            <div key={t.id} style={{
                padding: "10px 20px", borderRadius: 6, color: "#fff", fontSize: 13, minWidth: 220,
                background: t.type === "success" ? "#28a745" : t.type === "error" ? "#dc3545" : "#0d6efd",
                boxShadow: "0 4px 12px rgba(0,0,0,0.18)", animation: "fadeIn .25s ease"
            }}>{t.msg}</div>
        ))}
        <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
);

/* ─── Editable Text Cell ─── */
const EditableCell = (props) => {
    const [val, setVal] = React.useState(props.value ?? "");
    React.useEffect(() => setVal(props.value ?? ""), [props.value]);
    return (
        <input
            type="text"
            value={val}
            onChange={(e) => { setVal(e.target.value); props.node.setDataValue(props.colDef.field, e.target.value); }}
            style={{
                width: "100%", height: "100%", border: "1px solid transparent",
                borderRadius: 3, padding: "2px 6px", textAlign: "center",
                fontSize: 12, background: "transparent", outline: "none", color: "inherit"
            }}
            onFocus={(e) => (e.target.style.border = "1.5px solid #e8650a")}
            onBlur={(e) => (e.target.style.border = "1px solid transparent")}
        />
    );
};

/* ══════════════════════════════════════════════════════════════ */
const VendorDCDispatchGrid = () => {
    const [rowData, setRowData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [theme, setTheme] = useState("light");
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [financialYear, setFinancialYear] = useState("25-26");
    const [fyOptions, setFyOptions] = useState([]);
    const [filters, setFilters] = useState({ vendor_name: "", file_id: "", file_name: "", dc_no: "", date: "" });
    const [toasts, setToasts] = useState([]);
    const [markingId, setMarkingId] = useState(null);
    const gridRef = useRef();

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

    /* ─── Fetch FY options ─── */
    useEffect(() => {
        const fetchFY = async () => {
            try {
                const res = await fetch(`${BASE_URL}/getDropdownOptions.php`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ rule_name: "financial_year" })
                });
                const data = await res.json();
                if (data.status === "success") {
                    setFyOptions(data.data.map(d => ({ value: d.financial_year, label: d.financial_year })));
                }
            } catch {
                setFyOptions([
                    { value: "23-24", label: "23-24" },
                    { value: "24-25", label: "24-25" },
                    { value: "25-26", label: "25-26" }
                ]);
            }
        };
        fetchFY();
    }, []);

    /* ─── Fetch main data ─── */
    const fetchData = async (fy = financialYear) => {
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/othervendorseconddcdispatchApi.php?financial_year=${fy}`);
            const text = await res.text();
            const jsonStart = text.indexOf("{");
            const data = JSON.parse(jsonStart >= 0 ? text.slice(jsonStart) : text);
            if (data.status && Array.isArray(data.data)) {
                setRowData(data.data);
                setFilteredData(data.data);
                showToast(`Loaded ${data.data.length} records for FY ${fy}`, "success");
            } else {
                setRowData([]); setFilteredData([]);
                showToast("No data found", "error");
            }
        } catch (e) {
            showToast("Error: " + e.message, "error");
            setRowData([]); setFilteredData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(financialYear); }, [financialYear]);

    /* ─── Column filter logic ─── */
    useEffect(() => {
        let data = [...rowData];
        if (filters.vendor_name) data = data.filter(r => r.vendor_name?.toLowerCase().includes(filters.vendor_name.toLowerCase()));
        if (filters.file_id) data = data.filter(r => String(r.file_id).includes(filters.file_id));
        if (filters.file_name) data = data.filter(r => r.file_name?.toLowerCase().includes(filters.file_name.toLowerCase()));
        if (filters.dc_no) data = data.filter(r => r.dc_no?.toLowerCase().includes(filters.dc_no.toLowerCase()));
        if (filters.date) data = data.filter(r => r.dc_date?.includes(filters.date));
        setFilteredData(data);
    }, [filters, rowData]);

    /* ─── Mark Dispatch — maps grid fields → API expected keys ─── */
    const handleMarkDispatch = async (rowNode) => {
        const record = rowNode.data;

        // Validate required fields before calling API
        if (!record.file_id || !record.file_name || !record.vendor_id || !record.dc_no) {
            showToast("❌ Missing required field: fileid, filename, vendorid or dc_no", "error");
            return;
        }

        const dcNo = record.dc_no;
        setMarkingId(dcNo);

        const payload = {
            fileid:   String(record.file_id),
            filename: String(record.file_name),
            vendorid: String(record.vendor_id),
            dcid:     String(record.dc_no)
        };

        try {
            const res = await fetch(DISPATCH_API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const text = await res.text();
            const jsonStart = text.indexOf("{");
            const result = JSON.parse(jsonStart >= 0 ? text.slice(jsonStart) : text);

            if (result.status === true || result.status === "true") {
                showToast(`✅ Dispatch marked for DC: ${dcNo}`, "success");
                // Refresh grid to reflect updated dispatch_status
                fetchData(financialYear);
            } else {
                showToast(`❌ ${result.message || "Mark dispatch failed"}`, "error");
            }
        } catch (e) {
            console.error("Mark dispatch error:", e);
            showToast("❌ Network error: " + e.message, "error");
        } finally {
            setMarkingId(null);
        }
    };

    /* ─── Action Button Cell ─── */
    const ActionCellRenderer = (props) => {
        const isMarking = markingId === props.data?.dc_no;
        return (
            <button
                onClick={() => handleMarkDispatch(props.node)}
                disabled={isMarking}
                style={{
                    padding: "5px 12px", fontSize: 11, fontWeight: 600,
                    background: isMarking ? "#ccc" : "#fff",
                    color: isMarking ? "#999" : "#333",
                    border: "1.5px solid #bbb", borderRadius: 4,
                    cursor: isMarking ? "not-allowed" : "pointer",
                    whiteSpace: "nowrap"
                }}
                onMouseEnter={(e) => { if (!isMarking) { e.target.style.background = "#e8650a"; e.target.style.color = "#fff"; e.target.style.borderColor = "#e8650a"; } }}
                onMouseLeave={(e) => { if (!isMarking) { e.target.style.background = "#fff"; e.target.style.color = "#333"; e.target.style.borderColor = "#bbb"; } }}
            >
                {isMarking ? "..." : "Mark Dispatch"}
            </button>
        );
    };

    /* ─── Status Badge ─── */
    const StatusCellRenderer = (props) => {
        const status = props.value?.toLowerCase();
        return (
            <span style={{
                padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600,
                background: status === "yes" ? "#d4edda" : "#fff3cd",
                color: status === "yes" ? "#155724" : "#856404"
            }}>
                {status === "yes" ? "Dispatched" : "Pending"}
            </span>
        );
    };

    /* ─── Column Definitions ─── */
    const columnDefs = useMemo(() => [
        {
            headerName: "Sr.No.",
            valueGetter: (p) => p.node.rowIndex + 1,
            width: 70, minWidth: 60, pinned: "left",
            cellStyle: { textAlign: "center", fontWeight: "700", fontSize: 12 }
        },
        {
            field: "vendor_id",
            headerName: "Vendor Id",
            width: 100, minWidth: 85,
            cellRenderer: EditableCell,
            cellStyle: { padding: 2, textAlign: "center", fontSize: 12 }
        },
        {
            field: "vendor_name",
            headerName: "Vendor Name",
            width: 240, minWidth: 180,
            cellRenderer: EditableCell,
            cellStyle: { padding: 2, fontSize: 12, textAlign: "left" }
        },
        {
            field: "file_id",
            headerName: "File Id",
            width: 95, minWidth: 80,
            cellRenderer: EditableCell,
            cellStyle: { padding: 2, textAlign: "center", fontSize: 12 }
        },
        {
            field: "file_name",
            headerName: "File Name",
            width: 220, minWidth: 170,
            cellRenderer: EditableCell,
            cellStyle: { padding: 2, fontSize: 12, textAlign: "right" }
        },
        {
            field: "dc_no",
            headerName: "DC_NO",
            width: 150, minWidth: 130,
            cellStyle: { textAlign: "center", fontWeight: "600", fontSize: 12 }
        },
        {
            field: "dc_date",
            headerName: "Date",
            width: 130, minWidth: 110,
            cellStyle: { textAlign: "center", fontSize: 12 }
        },
        {
            field: "dispatch_status",
            headerName: "Status",
            width: 110, minWidth: 95,
            cellRenderer: StatusCellRenderer,
            cellStyle: { textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center" }
        },
        {
            field: "action",
            headerName: "Action",
            width: 140, minWidth: 125,
            pinned: "right",
            cellRenderer: ActionCellRenderer,
            cellStyle: { textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center" }
        }
    ], [theme, markingId]);

    const defaultColDef = useMemo(() => ({
        sortable: true, resizable: true,
        suppressMenu: isMobile, filter: false
    }), [isMobile]);

    /* ─── Theme ─── */
    const T = theme === "dark"
        ? { bg: "#161b22", card: "#21262d", header: "#2c3034", border: "#495057", color: "#f8f9fa", sub: "#adb5bd", inputBg: "#343a40" }
        : { bg: "#f4f4f4", card: "#fff", header: "#f8f8f8", border: "#e0e0e0", color: "#1a1a1a", sub: "#666", inputBg: "#fff" };

    const gridH = isFullScreen ? "calc(100vh - 220px)" : (isMobile ? "400px" : "560px");

    const inputStyle = {
        padding: "5px 10px", fontSize: 12, borderRadius: 4,
        border: `1px solid ${T.border}`, background: T.inputBg,
        color: T.color, outline: "none", width: "100%"
    };

    if (loading) return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.bg }}>
            <div style={{ textAlign: "center", color: T.color }}>
                <div style={{
                    width: 44, height: 44, border: "4px solid #e8650a",
                    borderRightColor: "transparent", borderRadius: "50%",
                    animation: "spin 0.85s linear infinite", margin: "0 auto 14px"
                }} />
                <p style={{ margin: 0, fontSize: 14 }}>Loading Vendor DC Dispatch…</p>
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
                        background: T.header, padding: "13px 22px",
                        borderBottom: `1px solid ${T.border}`,
                        display: "flex", justifyContent: "space-between",
                        alignItems: "center", flexWrap: "wrap", gap: 12
                    }}>
                        <div>
                            <h4 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#e8650a" }}>
                                🚚 Vendor DC Dispatch
                            </h4>
                            <small style={{ color: T.sub }}>
                                {filteredData.length} of {rowData.length} records · FY {financialYear}
                            </small>
                        </div>

                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                            {/* Financial Year Dropdown */}
                            <select
                                value={financialYear}
                                onChange={(e) => setFinancialYear(e.target.value)}
                                style={{ ...inputStyle, width: 110, cursor: "pointer" }}
                            >
                                {fyOptions.length > 0
                                    ? fyOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)
                                    : <option value={financialYear}>{financialYear}</option>
                                }
                            </select>

                            <button onClick={() => fetchData(financialYear)}
                                style={{ padding: "7px 14px", borderRadius: 5, border: "none", background: "#0d6efd", color: "#fff", cursor: "pointer", fontSize: 12 }}>
                                🔄 Refresh
                            </button>

                            <button onClick={() => gridRef.current?.api?.exportDataAsCsv({ fileName: `VendorDC_${financialYear}_${new Date().toISOString().split("T")[0]}.csv` })}
                                style={{ padding: "7px 14px", borderRadius: 5, border: "none", background: "#28a745", color: "#fff", cursor: "pointer", fontSize: 12 }}>
                                📥 Export CSV
                            </button>

                            <button onClick={() => setIsFullScreen(f => !f)}
                                style={{ padding: "7px 13px", borderRadius: 5, border: `1px solid ${T.border}`, background: T.card, color: T.color, cursor: "pointer", fontSize: 12 }}>
                                {isFullScreen ? "⛶ Exit" : "⛶ Full"}
                            </button>

                            <button onClick={() => setTheme(t => t === "light" ? "dark" : "light")}
                                style={{ padding: "7px 13px", borderRadius: 5, border: `1px solid ${T.border}`, background: T.card, color: T.color, cursor: "pointer", fontSize: 12 }}>
                                {theme === "light" ? "🌙 Dark" : "☀️ Light"}
                            </button>
                        </div>
                    </div>

                    {/* ── Column Filters Row ── */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "70px 100px 1fr 95px 1fr 150px 130px 110px 140px",
                        gap: 0,
                        borderBottom: `1px solid ${T.border}`,
                        background: theme === "dark" ? "#2c3034" : "#fafafa"
                    }}>
                        <div style={{ padding: "6px 8px" }} />
                        <div style={{ padding: "6px 8px" }} />

                        <div style={{ padding: "6px 8px" }}>
                            <input placeholder="Vendor Name" value={filters.vendor_name}
                                onChange={e => setFilters(f => ({ ...f, vendor_name: e.target.value }))}
                                style={inputStyle} />
                        </div>

                        <div style={{ padding: "6px 8px" }}>
                            <input placeholder="File Id" value={filters.file_id}
                                onChange={e => setFilters(f => ({ ...f, file_id: e.target.value }))}
                                style={inputStyle} />
                        </div>

                        <div style={{ padding: "6px 8px" }}>
                            <input placeholder="File Name" value={filters.file_name}
                                onChange={e => setFilters(f => ({ ...f, file_name: e.target.value }))}
                                style={inputStyle} />
                        </div>

                        <div style={{ padding: "6px 8px" }}>
                            <input placeholder="DC_NO" value={filters.dc_no}
                                onChange={e => setFilters(f => ({ ...f, dc_no: e.target.value }))}
                                style={inputStyle} />
                        </div>

                        <div style={{ padding: "6px 8px" }}>
                            <input placeholder="Date" value={filters.date}
                                onChange={e => setFilters(f => ({ ...f, date: e.target.value }))}
                                style={inputStyle} />
                        </div>

                        <div style={{ padding: "6px 8px" }}>
                            <input placeholder="Status" readOnly style={{ ...inputStyle, cursor: "default", color: T.sub }} />
                        </div>

                        <div style={{ padding: "6px 8px" }} />
                    </div>

                    {/* ── Grid ── */}
                    <div>
                        {filteredData.length === 0 ? (
                            <div style={{ textAlign: "center", padding: 60, color: T.sub }}>
                                <div style={{ fontSize: 44 }}>📭</div>
                                <h5 style={{ marginTop: 14 }}>No records found</h5>
                                <p>Try adjusting filters or select a different financial year.</p>
                            </div>
                        ) : (
                            <>
                                <style>{`
                                    .ag-theme-alpine .ag-header-cell {
                                        background-color: #e8650a !important;
                                        color: #fff !important;
                                        font-size: 12px !important;
                                        font-weight: 700 !important;
                                    }
                                    .ag-theme-alpine .ag-header-cell-label {
                                        justify-content: center;
                                    }
                                    .ag-theme-alpine .ag-row-odd {
                                        background-color: ${theme === "dark" ? "#1e2630" : "#fdf6f0"} !important;
                                    }
                                    .ag-theme-alpine .ag-row-even {
                                        background-color: ${theme === "dark" ? "#21262d" : "#ffffff"} !important;
                                    }
                                    .ag-theme-alpine .ag-row:hover {
                                        background-color: ${theme === "dark" ? "#2c3a4a" : "#fff0e6"} !important;
                                    }
                                    .ag-theme-alpine .ag-row-selected {
                                        background-color: ${theme === "dark" ? "#3a4a5a" : "#ffe0cc"} !important;
                                    }
                                    ${theme === "dark" ? `
                                        .ag-theme-alpine {
                                            --ag-background-color: #21262d;
                                            --ag-foreground-color: #f8f9fa;
                                            --ag-border-color: #495057;
                                            --ag-row-hover-color: #2c3a4a;
                                        }
                                    ` : ""}
                                `}</style>
                                <div className="ag-theme-alpine" style={{ height: gridH, width: "100%" }}>
                                    <AgGridReact
                                        ref={gridRef}
                                        rowData={filteredData}
                                        columnDefs={columnDefs}
                                        defaultColDef={defaultColDef}
                                        pagination={true}
                                        paginationPageSize={isMobile ? 10 : 25}
                                        suppressMovableColumns={true}
                                        animateRows={!isMobile}
                                        enableCellTextSelection={true}
                                        headerHeight={isMobile ? 36 : 42}
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
                </div>
            </div>
        </div>
    );
};

export default VendorDCDispatchGrid;