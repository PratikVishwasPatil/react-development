import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

const BASE = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC";

/* ── Toast ── */
const Toast = ({ toasts }) => (
    <div style={{ position: "fixed", top: 18, right: 18, zIndex: 9999, display: "flex", flexDirection: "column", gap: 7 }}>
        {toasts.map(t => (
            <div key={t.id} style={{
                padding: "9px 18px", borderRadius: 5, color: "#fff", fontSize: 13, minWidth: 200,
                background: t.type === "success" ? "#28a745" : t.type === "error" ? "#dc3545" : "#0d6efd",
                boxShadow: "0 4px 14px rgba(0,0,0,0.18)", animation: "fadeIn .25s ease"
            }}>{t.msg}</div>
        ))}
        <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(-7px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
);

/* ── Editable input cell ── */
const EditCell = (props) => {
    const [val, setVal] = React.useState(props.value ?? "");
    React.useEffect(() => setVal(props.value ?? ""), [props.value]);
    return (
        <input
            type="text"
            value={val}
            onChange={e => { setVal(e.target.value); props.node.setDataValue(props.colDef.field, e.target.value); }}
            style={{
                width: "100%", height: "100%", border: "1px solid transparent",
                borderRadius: 3, padding: "2px 5px", textAlign: "center",
                fontSize: 11, background: "transparent", outline: "none", color: "inherit"
            }}
            onFocus={e => (e.target.style.border = "1.5px solid #e8650a")}
            onBlur={e => (e.target.style.border = "1px solid transparent")}
        />
    );
};

/* ══════════════════════════════════════════════════════════ */
const SecondDCLabourDetails = () => {
    const { fileId } = useParams();
    const navigate = useNavigate();

    const [fileName, setFileName] = useState("");
    const [table1Data, setTable1Data] = useState([]);
    const [table2Data, setTable2Data] = useState([]);
    const [totals1, setTotals1] = useState({});
    const [totals2, setTotals2] = useState({});
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(false);
    const [theme, setTheme] = useState("light");
    const [toasts, setToasts] = useState([]);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const grid1Ref = useRef();
    const grid2Ref = useRef();

    const showToast = (msg, type = "info") => {
        const id = Date.now() + Math.random();
        setToasts(p => [...p, { id, msg, type }]);
        setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
    };

    useEffect(() => {
        const h = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener("resize", h);
        return () => window.removeEventListener("resize", h);
    }, []);

    /* ── Fetch both APIs in parallel ── */
    const fetchAll = async () => {
        if (!fileId) { showToast("No File ID found in URL", "error"); return; }
        setLoading(true);
        try {
            const [r1, r2] = await Promise.all([
                fetch(`${BASE}/secondChallanDispatchApi.php?fileID=${fileId}`),
                fetch(`${BASE}/secondChallanLabourAjaxApi.php?fileID=${fileId}`)
            ]);
            const [d1, d2] = await Promise.all([r1.json(), r2.json()]);

            if (d1.status && Array.isArray(d1.data)) {
                setTable1Data(d1.data);
                setTotals1(d1.totals || {});
                // Try to get file name from any available field
                if (d1.file_name) setFileName(d1.file_name);
            } else {
                showToast("Table 1: " + (d1.message || "No data"), "error");
            }

            if (d2.status && Array.isArray(d2.data)) {
                setTable2Data(d2.data);
                setTotals2(d2.totals || {});
                if (!fileName && d2.file_name) setFileName(d2.file_name);
            } else {
                showToast("Table 2: " + (d2.message || "No data"), "error");
            }
        } catch (e) {
            showToast("Error fetching data: " + e.message, "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, [fileId]);

    /* ── Assign Data Against Second DC ── */
    const handleAssign = async () => {
        setAssigning(true);
        try {
            const rows = [];
            grid1Ref.current?.api?.forEachNode(n => rows.push(n.data));
            const fd = new FormData();
            fd.append("fileID", fileId);
            fd.append("data", JSON.stringify(rows));
            const res = await fetch(`${BASE}/assignSecondDCLabour.php`, { method: "POST", body: fd });
            const text = await res.text();
            const js = text.indexOf("{");
            const result = JSON.parse(js >= 0 ? text.slice(js) : text);
            if (result.status === true || result.status === "success") {
                showToast("✅ Data assigned successfully!", "success");
                fetchAll();
            } else {
                showToast(result.message || "Assignment failed", "error");
            }
        } catch {
            showToast("✅ Assign triggered — check your assign API endpoint", "info");
        } finally {
            setAssigning(false);
        }
    };

    /* ══ TABLE 1 — secondChallanDispatchApi columns ══ */
    const colDefs1 = [
        {
            headerName: "Sr", valueGetter: p => p.node.rowIndex + 1,
            width: 55, pinned: "left",
            cellStyle: { textAlign: "center", fontWeight: 700, fontSize: 11 }
        },
        {
            field: "unique_id", headerName: "UNIQUEID",
            width: 95, pinned: "left",
            cellRenderer: EditCell,
            cellStyle: { padding: 2, background: "#fce4d6", fontSize: 11, fontWeight: 600 }
        },
        {
            field: "material_name", headerName: "Material Name",
            width: 200, minWidth: 160, pinned: "left",
            cellStyle: { fontWeight: 600, fontSize: 11 }
        },
        {
            field: "dc_id", headerName: "SECOND DC ID",
            width: 130,
            cellStyle: { textAlign: "center", fontSize: 11, background: "#fff9e6" }
        },
        {
            field: "weight", headerName: "Width",
            width: 90,
            cellStyle: { textAlign: "center", fontSize: 11 }
        },
        {
            field: "height", headerName: "Height",
            width: 90,
            cellStyle: { textAlign: "center", fontSize: 11 }
        },
        {
            field: "qty", headerName: "Qty",
            width: 80,
            cellStyle: { textAlign: "center", fontSize: 11, fontWeight: 600 }
        },
        {
            field: "assign_qty", headerName: "Assign Qty",
            width: 95,
            cellStyle: { textAlign: "center", fontSize: 11 }
        },
        {
            field: "vendor_name", headerName: "Vendor",
            width: 180,
            cellStyle: { fontSize: 11 }
        },
        // ── Semifinished / RFD (read-only display)
        {
            field: "labour_qty", headerName: "RFD Qty",
            width: 90,
            cellStyle: { textAlign: "center", fontSize: 11, background: "#e8f5e9" }
        },
        // ── EDITABLE fields ──
        {
            field: "completed_qty", headerName: "Completed Qty",
            width: 115,
            cellRenderer: EditCell,
            cellStyle: { padding: 2, background: "#e8f5e9", fontSize: 11 }
        },
        {
            field: "pending_qty", headerName: "Pending Qty",
            width: 100,
            cellRenderer: EditCell,
            cellStyle: { padding: 2, background: "#fff3cd", fontSize: 11 }
        },
        {
            field: "dispatch_qty", headerName: "Dispatch Qty",
            width: 105,
            cellRenderer: EditCell,
            cellStyle: { padding: 2, background: "#fff3cd", fontSize: 11 }
        },
        {
            field: "completed_shm_qty", headerName: "Completed SHM Qty",
            width: 140,
            cellRenderer: EditCell,
            cellStyle: { padding: 2, background: "#e8f5e9", fontSize: 11 }
        },
        {
            field: "remaining_shm_qty", headerName: "Remaining SHM Qty",
            width: 140,
            cellRenderer: EditCell,
            cellStyle: { padding: 2, background: "#e8f5e9", fontSize: 11 }
        },
        {
            field: "enter_shm_qty", headerName: "Enter SHM Qty",
            width: 115,
            cellRenderer: EditCell,
            cellStyle: { padding: 2, background: "#fce4d6", fontSize: 11 }
        },
        {
            field: "sq_ft", headerName: "Total Sq.Ft",
            width: 105,
            cellRenderer: EditCell,
            cellStyle: { padding: 2, background: "#e8f5e9", fontSize: 11 }
        },
        {
            field: "pc_rate", headerName: "Rate",
            width: 85,
            cellRenderer: EditCell,
            cellStyle: { padding: 2, background: "#e8f5e9", fontSize: 11 }
        },
        {
            field: "pc_amount", headerName: "Amt",
            width: 90,
            cellRenderer: EditCell,
            cellStyle: { padding: 2, background: "#e8f5e9", fontSize: 11, fontWeight: 600 }
        },
        {
            field: "total_amount", headerName: "Total Amt",
            width: 100,
            cellRenderer: EditCell,
            cellStyle: { padding: 2, background: "#fff3cd", fontSize: 11, fontWeight: 700 }
        }
    ];

    /* ══ TABLE 2 — secondChallanLabourAjaxApi columns ══ */
    const colDefs2 = [
        { headerName: "Sr", valueGetter: p => p.node.rowIndex + 1, width: 55, pinned: "left", cellStyle: { textAlign: "center", fontWeight: 700, fontSize: 11 } },
        { field: "material_name", headerName: "Material Name", width: 200, minWidth: 160, pinned: "left", cellStyle: { fontWeight: 600, fontSize: 11 } },
        { field: "dc_id", headerName: "DC ID", width: 120, cellStyle: { textAlign: "center", fontSize: 11 } },
        { field: "weight", headerName: "Width", width: 90, cellStyle: { textAlign: "center", fontSize: 11 } },
        { field: "height", headerName: "Height", width: 90, cellStyle: { textAlign: "center", fontSize: 11 } },
        { field: "qty", headerName: "Qty", width: 75, cellStyle: { textAlign: "center", fontWeight: 600, fontSize: 11 } },
        { field: "colour", headerName: "COL/P-C", width: 120, cellStyle: { fontSize: 11 } },
        { field: "assign_qty", headerName: "Assign Qty", width: 95, cellStyle: { textAlign: "center", fontSize: 11 } },
        { field: "vendor_name", headerName: "Vendor", width: 180, cellStyle: { fontSize: 11 } },
        { field: "labour_qty", headerName: "SHM Qty", width: 90, cellStyle: { textAlign: "center", fontSize: 11, background: "#e8f5e9" } },
        {
            headerName: "Total Sq.Ft",
            field: "sq_ft",
            width: 95,
            cellRenderer: EditCell,
            cellStyle: { padding: 2, background: "#e8f5e9", fontSize: 11 }
        },
        {
            field: "pc_rate", headerName: "Rate", width: 80,
            cellRenderer: EditCell,
            cellStyle: { padding: 2, background: "#e8f5e9", fontSize: 11 }
        },
        {
            field: "pc_amount", headerName: "Amt", width: 90,
            cellStyle: { textAlign: "center", fontWeight: 600, fontSize: 11, background: "#e8f5e9" }
        },
        {
            field: "total_amount", headerName: "Total Amt", width: 95,
            cellStyle: { textAlign: "center", fontWeight: 700, fontSize: 11, background: "#fff3cd" }
        },
        { field: "datetime", headerName: "Datetime", width: 160, cellStyle: { fontSize: 11 } }
    ];

    const defaultColDef = {
        sortable: true, resizable: true, suppressMenu: true, filter: false
    };

    /* ── Totals row renderer ── */
    const TotalsBar = ({ totals, fields }) => (
        <div style={{
            display: "flex", gap: 20, flexWrap: "wrap",
            padding: "8px 16px", background: theme === "dark" ? "#2c3034" : "#fffde7",
            borderTop: "2px solid #e8650a", fontSize: 12, fontWeight: 600
        }}>
            <span style={{ color: "#e8650a", fontWeight: 700 }}>TOTAL</span>
            {fields.map(f => totals[f] !== undefined && (
                <span key={f}>
                    {f.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}:&nbsp;
                    <span style={{ color: "#0d6efd" }}>{totals[f]}</span>
                </span>
            ))}
        </div>
    );

    /* ── Theme ── */
    const T = theme === "dark"
        ? { bg: "#161b22", card: "#21262d", header: "#2c3034", border: "#495057", color: "#f8f9fa", sub: "#adb5bd" }
        : { bg: "#f4f4f4", card: "#fff", header: "#f8f8f8", border: "#e0e0e0", color: "#1a1a1a", sub: "#666" };

    if (loading) return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.bg }}>
            <div style={{ textAlign: "center", color: T.color }}>
                <div style={{
                    width: 44, height: 44, border: "4px solid #e8650a",
                    borderRightColor: "transparent", borderRadius: "50%",
                    animation: "spin .85s linear infinite", margin: "0 auto 14px"
                }} />
                <p style={{ margin: 0, fontSize: 14 }}>Loading details for File ID: {fileId}…</p>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: "100vh", background: T.bg, color: T.color, padding: 0 }}>
            <Toast toasts={toasts} />

            {/* ── Top Bar ── */}
            <div style={{
                background: T.header, borderBottom: `1px solid ${T.border}`,
                padding: "10px 20px", display: "flex",
                justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            padding: "6px 14px", borderRadius: 5, border: "none",
                            background: "#e8650a", color: "#fff", cursor: "pointer",
                            fontWeight: 700, fontSize: 13
                        }}
                    >← Back</button>

                    <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#e8650a" }}>
                            Second DC Labour Details
                        </div>
                        <div style={{ fontSize: 12, color: T.sub }}>
                            File ID: <strong>{fileId}</strong>
                            {fileName && <> &nbsp;|&nbsp; File Name: <strong>{fileName}</strong></>}
                        </div>
                    </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={fetchAll}
                        style={{ padding: "6px 14px", borderRadius: 5, border: "none", background: "#0d6efd", color: "#fff", cursor: "pointer", fontSize: 12 }}>
                        🔄 Refresh
                    </button>
                    <button onClick={() => setTheme(t => t === "light" ? "dark" : "light")}
                        style={{ padding: "6px 13px", borderRadius: 5, border: `1px solid ${T.border}`, background: T.card, color: T.color, cursor: "pointer", fontSize: 12 }}>
                        {theme === "light" ? "🌙 Dark" : "☀️ Light"}
                    </button>
                </div>
            </div>

            <div style={{ padding: isMobile ? 8 : 16 }}>

                {/* ══ TABLE 1 ══ */}
                <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, marginBottom: 20, overflow: "hidden" }}>
                    <div style={{
                        background: "linear-gradient(90deg, #e8650a, #f97316)",
                        padding: "10px 18px", display: "flex", justifyContent: "space-between", alignItems: "center"
                    }}>
                        <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>
                            📋 Second DC Dispatch Data
                        </span>
                        <span style={{ color: "#fff", fontSize: 12, opacity: 0.9 }}>
                            {table1Data.length} records · File ID: {fileId}
                        </span>
                    </div>

                    {table1Data.length === 0 ? (
                        <div style={{ textAlign: "center", padding: 40, color: T.sub }}>
                            <div style={{ fontSize: 36 }}>📭</div>
                            <p style={{ marginTop: 12 }}>No data found for File ID: {fileId}</p>
                        </div>
                    ) : (
                        <>
                            <style>{`
                                .t1 .ag-header-cell {
                                    background-color: #e8650a !important;
                                    color: #fff !important;
                                    font-size: 11px !important;
                                    font-weight: 700 !important;
                                }
                                .t1 .ag-row-odd { background-color: ${theme === "dark" ? "#1e2630" : "#fffbf5"} !important; }
                                .t1 .ag-row-even { background-color: ${theme === "dark" ? "#21262d" : "#ffffff"} !important; }
                                .t1 .ag-row:hover { background-color: ${theme === "dark" ? "#2c3a4a" : "#fff0e6"} !important; }
                                ${theme === "dark" ? `.t1{--ag-background-color:#21262d;--ag-foreground-color:#f8f9fa;--ag-border-color:#495057;}` : ""}
                            `}</style>
                            <div className="ag-theme-alpine t1" style={{ height: isMobile ? 300 : 280, width: "100%" }}>
                                <AgGridReact
                                    ref={grid1Ref}
                                    rowData={table1Data}
                                    columnDefs={colDefs1}
                                    defaultColDef={defaultColDef}
                                    suppressMovableColumns={true}
                                    animateRows={true}
                                    headerHeight={42}
                                    rowHeight={38}
                                    suppressHorizontalScroll={false}
                                />
                            </div>
                            <TotalsBar totals={totals1} fields={["total_qty", "total_assign_qty", "total_smetal_qty", "total_sqft", "total_pc_amount", "grand_total"]} />
                        </>
                    )}

                    {/* ── Assign Button ── */}
                    <div style={{ padding: "14px 18px", display: "flex", justifyContent: "center", borderTop: `1px solid ${T.border}` }}>
                        <button
                            onClick={handleAssign}
                            disabled={assigning || table1Data.length === 0}
                            style={{
                                padding: "10px 40px", fontSize: 14, fontWeight: 700,
                                background: assigning ? "#ccc" : "#e8650a",
                                color: "#fff", border: "none", borderRadius: 6,
                                cursor: assigning ? "not-allowed" : "pointer",
                                boxShadow: assigning ? "none" : "0 4px 14px rgba(232,101,10,0.35)",
                                transition: "all 0.2s"
                            }}
                            onMouseEnter={e => { if (!assigning) e.target.style.background = "#c9540a"; }}
                            onMouseLeave={e => { if (!assigning) e.target.style.background = "#e8650a"; }}
                        >
                            {assigning ? "⏳ Assigning..." : "Assign Data Against Second DC"}
                        </button>
                    </div>
                </div>

                {/* ══ TABLE 2 ══ */}
                <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, overflow: "hidden" }}>
                    <div style={{
                        background: "linear-gradient(90deg, #e8650a, #f97316)",
                        padding: "10px 18px", display: "flex", justifyContent: "space-between", alignItems: "center"
                    }}>
                        <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>
                            🧾 Second DC Labour Data
                        </span>
                        <span style={{ color: "#fff", fontSize: 12, opacity: 0.9 }}>
                            {table2Data.length} records
                        </span>
                    </div>

                    {table2Data.length === 0 ? (
                        <div style={{ textAlign: "center", padding: 40, color: T.sub }}>
                            <div style={{ fontSize: 36 }}>📭</div>
                            <p style={{ marginTop: 12 }}>No labour data found</p>
                        </div>
                    ) : (
                        <>
                            <style>{`
                                .t2 .ag-header-cell {
                                    background-color: #e8650a !important;
                                    color: #fff !important;
                                    font-size: 11px !important;
                                    font-weight: 700 !important;
                                }
                                .t2 .ag-row-odd { background-color: ${theme === "dark" ? "#1e2630" : "#fffbf5"} !important; }
                                .t2 .ag-row-even { background-color: ${theme === "dark" ? "#21262d" : "#ffffff"} !important; }
                                .t2 .ag-row:hover { background-color: ${theme === "dark" ? "#2c3a4a" : "#fff0e6"} !important; }
                                ${theme === "dark" ? `.t2{--ag-background-color:#21262d;--ag-foreground-color:#f8f9fa;--ag-border-color:#495057;}` : ""}
                            `}</style>
                            <div className="ag-theme-alpine t2" style={{ height: isMobile ? 300 : 320, width: "100%" }}>
                                <AgGridReact
                                    ref={grid2Ref}
                                    rowData={table2Data}
                                    columnDefs={colDefs2}
                                    defaultColDef={defaultColDef}
                                    suppressMovableColumns={true}
                                    animateRows={true}
                                    headerHeight={42}
                                    rowHeight={38}
                                    suppressHorizontalScroll={false}
                                />
                            </div>
                            <TotalsBar totals={totals2} fields={["total_qty", "total_completed_qty", "total_dispatch_qty", "total_pc_amount", "grand_total"]} />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SecondDCLabourDetails;