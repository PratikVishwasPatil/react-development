import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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

const MATERIAL_API   = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/ProjectListApi.php";
const SUPPLY_AMC_API = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/OutwardListApi.php";

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

// ─── Badge ────────────────────────────────────────────────────────────────────
const Badge = ({ value, colorMap, isDark, defaultColors = ["#f1f5f9", "#475569"] }) => {
    const [lightBg, baseColor] = colorMap[value] || defaultColors;
    const bg    = isDark ? baseColor + "30" : lightBg;
    const color = isDark ? "#e2e8f0" : baseColor;
    return (
        <span style={{
            background: bg, color, padding: "2px 10px", borderRadius: 20,
            fontSize: "0.74rem", fontWeight: 700, letterSpacing: "0.02em", whiteSpace: "nowrap"
        }}>
            {value}
        </span>
    );
};



// ─── Cell Renderers (React components) ───────────────────────────────────────
const MaterialFileNameCell = ({ value, data, isDark, onNavigate }) => (
    <span
        onClick={() => data && onNavigate(data.sheet_type, data.project_id, data.file_id)}
        style={{
            color: isDark ? "#38bdf8" : "#0284c7",
            fontWeight: 700,
            cursor: "pointer",
            textDecoration: "underline",
            textUnderlineOffset: 2
        }}
    >
        {value}
    </span>
);

const SupplyFileNameCell = ({ value, data, isDark, onNavigate }) => (
    <span
        onClick={() => data && onNavigate(data.project_id, data.file_id)}
        style={{
            color: isDark ? "#fbbf24" : "#d97706",
            fontWeight: 700,
            cursor: "pointer",
            textDecoration: "underline",
            textUnderlineOffset: 2
        }}
    >
        {(value || "").trim()}
    </span>
);

const ProductBadgeCell = ({ value, isDark }) => {
    const colorMap = {
        MMSS:   ["#ede9fe", "#7c3aed"],
        MSS:    ["#dbeafe", "#1d4ed8"],
        FxRx:   ["#fef3c7", "#92400e"],
        Spares: ["#d1fae5", "#065f46"],
    };
    return <Badge value={value || ""} colorMap={colorMap} isDark={isDark} />;
};

const FileTypeBadgeCell = ({ value, isDark }) => {
    const val    = value || "";
    const isMisc = val.toLowerCase().includes("misc");
    const bg     = isMisc ? (isDark ? "#0c4a6e40" : "#e0f2fe") : (isDark ? "#134e4a40" : "#d1fae5");
    const color  = isMisc ? (isDark ? "#7dd3fc" : "#0369a1")   : (isDark ? "#6ee7b7" : "#065f46");
    return (
        <span style={{ background: bg, color, padding: "2px 10px", borderRadius: 20, fontSize: "0.74rem", fontWeight: 600, whiteSpace: "nowrap" }}>
            {val}
        </span>
    );
};

const SupplyProductBadgeCell = ({ value, isDark }) => {
    const val     = value || "";
    const isSpare = val.toLowerCase() === "spares";
    const bg    = isSpare ? (isDark ? "#451a0340" : "#fef3c7") : (isDark ? "#1c191740" : "#f5f5f4");
    const color = isSpare ? (isDark ? "#fbbf24"  : "#92400e") : (isDark ? "#a8a29e"  : "#57534e");
    return (
        <span style={{ background: bg, color, padding: "2px 10px", borderRadius: 20, fontSize: "0.74rem", fontWeight: 700, whiteSpace: "nowrap" }}>
            {val}
        </span>
    );
};

// ─── Loader / Empty ───────────────────────────────────────────────────────────
const Loader = ({ color = "#0ea5e9", isDark }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 380, flexDirection: "column", gap: 16 }}>
        <div style={{ width: 40, height: 40, border: `4px solid ${color}33`, borderTopColor: color, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.83rem", color: isDark ? "#94a3b8" : "#64748b", letterSpacing: "0.05em" }}>
            FETCHING RECORDS...
        </span>
    </div>
);

const Empty = ({ icon, msg, isDark }) => (
    <div style={{ textAlign: "center", padding: "80px 20px", color: isDark ? "#475569" : "#94a3b8" }}>
        <div style={{ fontSize: "3rem", marginBottom: 12 }}>{icon}</div>
        <p style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.83rem", letterSpacing: "0.08em" }}>{msg}</p>
    </div>
);

// ─── Tab ─────────────────────────────────────────────────────────────────────
const Tab = ({ label, count, active, activeColor, isDark, loading, onClick }) => (
    <button onClick={onClick} style={{
        padding: "0.48rem 1.1rem", fontSize: "0.84rem",
        borderRadius: "6px 6px 0 0",
        border: active ? `2px solid ${activeColor}` : (isDark ? "1px solid #1e3a5f" : "1px solid #e2e8f0"),
        borderBottom: active ? `3px solid ${activeColor}` : "none",
        backgroundColor: active ? activeColor : (isDark ? "#1e293b" : "#f8fafc"),
        color: active ? "white" : (isDark ? "#64748b" : "#94a3b8"),
        cursor: "pointer", fontWeight: 700,
        display: "flex", alignItems: "center", gap: "0.45rem",
        transition: "all 0.18s",
        boxShadow: active ? `0 3px 10px ${activeColor}55` : "none"
    }}>
        {label}
        <span style={{
            backgroundColor: active ? "rgba(255,255,255,0.25)" : (isDark ? "#334155" : "#e2e8f0"),
            color: active ? "white" : (isDark ? "#64748b" : "#94a3b8"),
            borderRadius: 20, padding: "1px 8px", fontSize: "0.71rem", fontFamily: "'DM Mono',monospace"
        }}>
            {loading ? "…" : count}
        </span>
    </button>
);

// ─── Action Button ────────────────────────────────────────────────────────────
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

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const ProjectListDashboard = () => {
    const navigate = useNavigate();

    const [activeTab, setActiveTab]               = useState("material");
    const [theme, setTheme]                       = useState("light");
    const [isMobile, setIsMobile]                 = useState(window.innerWidth <= 768);
    const [toasts, setToasts]                     = useState([]);

    const [materialData, setMaterialData]         = useState([]);
    const [materialLoading, setMaterialLoading]   = useState(false);
    const [materialCount, setMaterialCount]       = useState(0);
    const [materialSelected, setMaterialSelected] = useState([]);
    const materialGridRef = useRef();

    const [supplyData, setSupplyData]             = useState([]);
    const [supplyLoading, setSupplyLoading]       = useState(false);
    const [supplyCount, setSupplyCount]           = useState(0);
    const [supplySelected, setSupplySelected]     = useState([]);
    const supplyGridRef = useRef();

    const isDark = theme === "dark";
    const isMat  = activeTab === "material";

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

    const fetchMaterial = useCallback(async () => {
        setMaterialLoading(true);
        try {
            const res  = await fetch(MATERIAL_API);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            if (json.success && Array.isArray(json.data)) {
                setMaterialData(json.data);
                setMaterialCount(json.count || json.data.length);
                showToast(`Loaded ${json.data.length} material records`, "success");
            } else throw new Error("Unexpected response");
        } catch (e) {
            showToast(`Material fetch failed: ${e.message}`, "error");
            setMaterialData([]);
        } finally { setMaterialLoading(false); }
    }, [showToast]);

    const fetchSupply = useCallback(async () => {
        setSupplyLoading(true);
        try {
            const res  = await fetch(SUPPLY_AMC_API);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            if (json.success && Array.isArray(json.data)) {
                setSupplyData(json.data);
                setSupplyCount(json.count || json.data.length);
                showToast(`Loaded ${json.data.length} supply & AMC records`, "success");
            } else throw new Error("Unexpected response");
        } catch (e) {
            showToast(`Supply fetch failed: ${e.message}`, "error");
            setSupplyData([]);
        } finally { setSupplyLoading(false); }
    }, [showToast]);

    useEffect(() => { fetchMaterial(); }, [fetchMaterial]);
    useEffect(() => { fetchSupply();   }, [fetchSupply]);

    // ── Navigation handlers ──
    const navigateToSheet = useCallback((sheetType, projectId, fileId) => {
        if (sheetType === "MMSS") navigate(`/mmss-datasheet/${projectId}/${fileId}`);
        else if (sheetType === "MSS") navigate(`/mss-datasheet/${projectId}/${fileId}`);
        else navigate(`/product-datasheet/${projectId}/${fileId}`);
    }, [navigate]);

    const navigateToProduct = useCallback((projectId, fileId) => {
        navigate(`/product-datasheet/${projectId}/${fileId}`);
    }, [navigate]);

    // ── Material columns ──
    const materialCols = useMemo(() => [
        {
            headerName: "#",
            valueGetter: "node.rowIndex + 1",
            width: 65, maxWidth: 65,
            pinned: "left",
            suppressSizeToFit: true,
            cellStyle: { textAlign: "center", fontWeight: 700, color: isDark ? "#7dd3fc" : "#0369a1", display: "flex", alignItems: "center", justifyContent: "center" }
        },
        {
            field: "file_name",
            headerName: "File Name",
            minWidth: 180, flex: 2,
            pinned: "left",
            checkboxSelection: true,
            headerCheckboxSelection: true,
            cellStyle: { display: "flex", alignItems: "center" },
            cellRenderer: (params) => (
                <MaterialFileNameCell
                    value={params.value}
                    data={params.data}
                    isDark={isDark}
                    onNavigate={navigateToSheet}
                />
            )
        },
        {
            field: "customer_name",
            headerName: "Customer Name",
            minWidth: 200, flex: 3,
            cellStyle: { display: "flex", alignItems: "center", fontWeight: 500 }
        },
        {
            field: "product_name",
            headerName: "Product",
            minWidth: 110, flex: 1,
            cellStyle: { display: "flex", alignItems: "center", justifyContent: "center" },
            cellRenderer: (params) => <ProductBadgeCell value={params.value} isDark={isDark} />
        },
        {
            field: "file_type_name",
            headerName: "File Type",
            minWidth: 120, flex: 1,
            cellStyle: { display: "flex", alignItems: "center", justifyContent: "center" },
            cellRenderer: (params) => <FileTypeBadgeCell value={params.value} isDark={isDark} />
        },
        {
            field: "file_id",
            headerName: "File ID",
            minWidth: 90, flex: 1,
            cellStyle: { textAlign: "center", fontFamily: "'DM Mono',monospace", fontSize: "0.82rem", color: isDark ? "#94a3b8" : "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }
        },
        {
            field: "project_id",
            headerName: "Project ID",
            minWidth: 100, flex: 1,
            cellStyle: { textAlign: "center", fontFamily: "'DM Mono',monospace", fontSize: "0.82rem", color: isDark ? "#94a3b8" : "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }
        }
    ], [isDark, navigateToSheet]);

    // ── Supply & AMC columns ──
    const supplyCols = useMemo(() => [
        {
            headerName: "#",
            valueGetter: "node.rowIndex + 1",
            width: 65, maxWidth: 65,
            pinned: "left",
            suppressSizeToFit: true,
            cellStyle: { textAlign: "center", fontWeight: 700, color: isDark ? "#fbbf24" : "#d97706", display: "flex", alignItems: "center", justifyContent: "center" }
        },
        {
            field: "file_name",
            headerName: "File Name",
            minWidth: 180, flex: 2,
            pinned: "left",
            checkboxSelection: true,
            cellStyle: { display: "flex", alignItems: "center" },
            cellRenderer: (params) => (
                <SupplyFileNameCell
                    value={params.value}
                    data={params.data}
                    isDark={isDark}
                    onNavigate={navigateToProduct}
                />
            )
        },
        {
            field: "customer_name",
            headerName: "Customer Name",
            minWidth: 200, flex: 3,
            cellStyle: { display: "flex", alignItems: "center", fontWeight: 500 }
        },
        {
            field: "product_name",
            headerName: "Product Type",
            minWidth: 130, flex: 1,
            cellStyle: { display: "flex", alignItems: "center", justifyContent: "center" },
            cellRenderer: (params) => <SupplyProductBadgeCell value={params.value} isDark={isDark} />
        },
        {
            field: "file_id",
            headerName: "File ID",
            minWidth: 90, flex: 1,
            cellStyle: { textAlign: "center", fontFamily: "'DM Mono',monospace", fontSize: "0.82rem", color: isDark ? "#94a3b8" : "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }
        },
        {
            field: "project_id",
            headerName: "Project ID",
            minWidth: 100, flex: 1,
            cellStyle: { textAlign: "center", fontFamily: "'DM Mono',monospace", fontSize: "0.82rem", color: isDark ? "#94a3b8" : "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }
        }
    ], [isDark, navigateToProduct]);

    const defaultColDef = useMemo(() => ({
        filter: true,
        sortable: true,
        floatingFilter: !isMobile,
        resizable: true,
    }), [isMobile]);

    // Supply: navigate on checkbox selection
    const onSupplySelectionChanged = useCallback((e) => {
        const rows = e.api.getSelectedRows();
        setSupplySelected(rows);
        if (rows.length === 1) {
            navigate(`/product-datasheet/${rows[0].project_id}/${rows[0].file_id}`);
        }
    }, [navigate]);

    const exportCsv = (ref, name) => {
        if (!ref.current?.api) return;
        ref.current.api.exportDataAsCsv({ fileName: `${name}_${new Date().toISOString().split("T")[0]}.csv`, allColumns: true });
        showToast("Exported successfully!", "success");
    };

    const autoSize = (ref) => {
        if (!ref.current?.api) return;
        setTimeout(() => {
            const ids = ref.current.api.getColumns()?.map(c => c.getId()) || [];
            if (ids.length) ref.current.api.autoSizeColumns(ids, false);
        }, 100);
    };

    // ── Theme tokens ──
    const bg       = isDark ? "#0d1117" : "#f0f7ff";
    const cardBg   = isDark ? "#0f172a" : "#ffffff";
    const border   = isDark ? "1px solid #1e3a5f" : "1px solid #e2e8f0";
    const headerBg = isDark ? "#080f1e" : "#e8f4fd";
    const matColor = isDark ? "#0369a1" : "#0ea5e9";
    const supColor = isDark ? "#b45309" : "#f59e0b";
    const gridH    = isMobile ? "calc(100vh - 290px)" : "calc(100vh - 235px)";

    const agDark = isDark ? {
        "--ag-background-color":              "#0f172a",
        "--ag-header-background-color":       "#1e293b",
        "--ag-odd-row-background-color":      "#0f172a",
        "--ag-even-row-background-color":     "#111827",
        "--ag-row-hover-color":               "rgba(14,165,233,0.07)",
        "--ag-foreground-color":              "#e2e8f0",
        "--ag-header-foreground-color":       "#7dd3fc",
        "--ag-border-color":                  "#1e3a5f",
        "--ag-selected-row-background-color": "rgba(14,165,233,0.13)",
        "--ag-input-background-color":        "#1e293b",
        "--ag-input-border-color":            "#334155",
        "--ag-checkbox-checked-color":        "#0ea5e9",
    } : {};

    const sharedGridProps = {
        defaultColDef,
        pagination: true,
        paginationPageSize: isMobile ? 10 : 25,
        animateRows: !isMobile,
        enableCellTextSelection: false,
        headerHeight: isMobile ? 40 : 46,
        rowHeight: isMobile ? 38 : 44,
    };

    return (
        <div style={{ minHeight: "100vh", backgroundColor: bg, color: isDark ? "#e2e8f0" : "#0f172a", fontFamily: "Inter, sans-serif" }}>
            <Toast toasts={toasts} />

            <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

            <div style={{ backgroundColor: cardBg, minHeight: "100vh" }}>

                {/* ═══ HEADER ═══ */}
                <div style={{ background: headerBg, padding: "1rem 1.5rem", borderBottom: border }}>
                    <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", gap: "0.75rem" }}>
                        <div>
                            <h2 style={{ margin: 0, fontWeight: 800, fontSize: isMobile ? "1.2rem" : "1.45rem", color: isDark ? "#f0f9ff" : "#0c4a6e", letterSpacing: "-0.02em" }}>
                                📋 Project Files Dashboard
                            </h2>
                            <div style={{ display: "flex", gap: "1.25rem", marginTop: "0.25rem", flexWrap: "wrap" }}>
                                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.73rem", color: matColor, letterSpacing: "0.04em" }}>
                                    MATERIAL: {materialCount} records
                                </span>
                                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.73rem", color: supColor, letterSpacing: "0.04em" }}>
                                    SUPPLY & AMC: {supplyCount} records
                                </span>
                            </div>
                        </div>

                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", alignItems: "center" }}>
                            <Btn color="#16a34a" onClick={() => isMat ? exportCsv(materialGridRef, "Material") : exportCsv(supplyGridRef, "SupplyAMC")}>
                                📊{!isMobile && " Export"}
                            </Btn>
                            <Btn color="#0891b2" onClick={() => isMat ? autoSize(materialGridRef) : autoSize(supplyGridRef)}>
                                ↔{!isMobile && " Auto"}
                            </Btn>
                            <Btn color={matColor} onClick={() => isMat ? fetchMaterial() : fetchSupply()}>
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

                    {/* Tabs */}
                    <div style={{ display: "flex", gap: "0.35rem", marginTop: "0.9rem" }}>
                        <Tab label="📦 Material"     count={materialCount} active={isMat}  activeColor={matColor} isDark={isDark} loading={materialLoading} onClick={() => setActiveTab("material")} />
                        <Tab label="🔧 Supply & AMC" count={supplyCount}   active={!isMat} activeColor={supColor} isDark={isDark} loading={supplyLoading}  onClick={() => setActiveTab("supply")} />
                    </div>
                </div>

                {/* Selection bar */}
                {((isMat && materialSelected.length > 0) || (!isMat && supplySelected.length > 0)) && (
                    <div style={{ padding: "0.45rem 1.5rem", backgroundColor: isDark ? "#1e3a5f" : "#dbeafe", borderBottom: border, display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.78rem", color: isDark ? "#7dd3fc" : "#0369a1", fontWeight: 700 }}>
                            {isMat ? materialSelected.length : supplySelected.length} ROW(S) SELECTED
                        </span>
                        <button
                            onClick={() => { (isMat ? materialGridRef : supplyGridRef).current?.api?.deselectAll(); }}
                            style={{ padding: "2px 10px", fontSize: "0.76rem", borderRadius: 4, border: "1px solid #93c5fd", backgroundColor: "transparent", color: isDark ? "#94a3b8" : "#0369a1", cursor: "pointer" }}
                        >
                            Clear
                        </button>
                    </div>
                )}

                {/* ═══ GRIDS ═══ */}
                <div style={{ backgroundColor: cardBg }}>

                    {/* Material Grid */}
                    <div style={{ display: isMat ? "block" : "none" }}>
                        {materialLoading ? (
                            <Loader isDark={isDark} color={matColor} />
                        ) : materialData.length === 0 ? (
                            <Empty icon="📦" msg="NO MATERIAL RECORDS FOUND" isDark={isDark} />
                        ) : (
                            <div className="ag-theme-alpine" style={{ height: gridH, width: "100%", ...agDark }}>
                                <AgGridReact
                                    ref={materialGridRef}
                                    rowData={materialData}
                                    columnDefs={materialCols}
                                    rowSelection="multiple"
                                    rowMultiSelectWithClick
                                    onSelectionChanged={(e) => setMaterialSelected(e.api.getSelectedRows())}
                                    onGridReady={(p) => {
                                        setTimeout(() => {
                                            const ids = p.api.getColumns()?.map(c => c.getId()) || [];
                                            if (ids.length) p.api.autoSizeColumns(ids, false);
                                        }, 300);
                                    }}
                                    {...sharedGridProps}
                                />
                            </div>
                        )}
                    </div>

                    {/* Supply & AMC Grid */}
                    <div style={{ display: !isMat ? "block" : "none" }}>
                        {supplyLoading ? (
                            <Loader isDark={isDark} color={supColor} />
                        ) : supplyData.length === 0 ? (
                            <Empty icon="🔧" msg="NO SUPPLY & AMC RECORDS FOUND" isDark={isDark} />
                        ) : (
                            <div className="ag-theme-alpine" style={{ height: gridH, width: "100%", ...agDark }}>
                                <AgGridReact
                                    ref={supplyGridRef}
                                    rowData={supplyData}
                                    columnDefs={supplyCols}
                                    rowSelection="single"
                                    onSelectionChanged={onSupplySelectionChanged}
                                    onGridReady={(p) => {
                                        setTimeout(() => {
                                            const ids = p.api.getColumns()?.map(c => c.getId()) || [];
                                            if (ids.length) p.api.autoSizeColumns(ids, false);
                                        }, 300);
                                    }}
                                    {...sharedGridProps}
                                />
                            </div>
                        )}
                    </div>
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

export default ProjectListDashboard;