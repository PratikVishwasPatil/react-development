import React, { useEffect, useState, useCallback, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { ModuleRegistry } from "ag-grid-community";
import {
    ClientSideRowModelModule,
    ValidationModule,
    TextFilterModule,
    NumberFilterModule,
    PaginationModule,
    CsvExportModule
} from "ag-grid-community";

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ValidationModule,
    TextFilterModule,
    NumberFilterModule,
    PaginationModule,
    CsvExportModule
]);

const VERIFY_API = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/VerifyMaterialApi.php";

// ── Parse route params from hash ──────────────────────────────────────────────
const getParams = () => {
    const hash = window.location.hash || "";
    const m    = hash.match(/\/verify-material\/(\d+)\/([^/]+)/);
    if (m) return { fileId: m[1], type: m[2] };
    const qs = new URLSearchParams(window.location.search);
    return {
        fileId: qs.get("fileId") || "",
        type:   qs.get("type")   || "ALL",
    };
};

// ── Stock qty cell with colour coding ────────────────────────────────────────
const StockCell = ({ value }) => {
    const n  = Number(value);
    const bg = n > 0 ? "#d1fae5" : n < 0 ? "#fee2e2" : "#f1f5f9";
    const cl = n > 0 ? "#065f46" : n < 0 ? "#991b1b" : "#64748b";
    return (
        <span style={{
            background: bg, color: cl,
            padding: "2px 10px", borderRadius: 20,
            fontWeight: 700, fontSize: "0.78rem",
            fontFamily: "'JetBrains Mono', monospace",
            whiteSpace: "nowrap"
        }}>
            {n.toLocaleString()}
        </span>
    );
};

// ── Dash for empty values ─────────────────────────────────────────────────────
const dash = (v) => (v === "" || v == null ? "—" : v);

// ── Summary card ─────────────────────────────────────────────────────────────
const StatCard = ({ label, value, color, icon }) => (
    <div style={{
        background: color + "12",
        border: `1.5px solid ${color}30`,
        borderRadius: 12, padding: "14px 20px",
        minWidth: 110, flex: 1
    }}>
        <div style={{ fontSize: "1.4rem", marginBottom: 4 }}>{icon}</div>
        <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.65rem", color: color,
            letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 2
        }}>
            {label}
        </div>
        <div style={{
            fontWeight: 800, fontSize: "1.35rem",
            fontFamily: "'JetBrains Mono', monospace", color: color
        }}>
            {value}
        </div>
    </div>
);

// ── Main ─────────────────────────────────────────────────────────────────────
const VerifyMaterial = () => {
    const { fileId, type } = getParams();

    const [data,       setData]       = useState([]);
    const [meta,       setMeta]       = useState({});
    const [loading,    setLoading]    = useState(true);
    const [error,      setError]      = useState("");
    const [theme,      setTheme]      = useState("light");
    const [search,     setSearch]     = useState("");

    const isDark = theme === "dark";

    // ── Inject Google Font ──
    useEffect(() => {
        const link = document.createElement("link");
        link.rel   = "stylesheet";
        link.href  = "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap";
        document.head.appendChild(link);
        return () => document.head.removeChild(link);
    }, []);

    // ── Fetch ──
    const fetchData = useCallback(async () => {
        if (!fileId) { setError("No fileId provided"); setLoading(false); return; }
        setLoading(true); setError("");
        try {
            const url  = `${VERIFY_API}?fileId=${fileId}&type=${encodeURIComponent(type)}`;
            const res  = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            if (json.status !== "success") throw new Error(json.message || "API error");
            setMeta({
                fileid:       json.fileid,
                type:         json.type,
                despatchLot:  json.despatch_lot,
                hasTypeData:  json.has_type_data,
                totalItems:   json.total_items,
            });
            setData(json.items || []);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [fileId, type]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // ── Filtered rows ──
    const filtered = useMemo(() => {
        if (!search.trim()) return data;
        const q = search.toLowerCase();
        return data.filter(r =>
            (r.material_name || "").toLowerCase().includes(q) ||
            (r.location      || "").toLowerCase().includes(q)
        );
    }, [data, search]);

    // ── Stats ──
    const totalStock    = data.reduce((s, r) => s + Number(r.stock_qty || 0), 0);
    const inStockCount  = data.filter(r => Number(r.stock_qty) > 0).length;
    const zeroCount     = data.filter(r => Number(r.stock_qty) === 0).length;

    // ── Column defs ──
    const columns = useMemo(() => [
        {
            headerName: "#",
            valueGetter: "node.rowIndex + 1",
            width: 58, maxWidth: 58, suppressSizeToFit: true,
            cellStyle: {
                textAlign: "center", fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace",
                color: isDark ? "#818cf8" : "#4f46e5",
                display: "flex", alignItems: "center", justifyContent: "center"
            }
        },
        {
            field: "material_name",
            headerName: "Material Description",
            minWidth: 220, flex: 3,
            cellStyle: {
                fontWeight: 600, fontSize: "0.84rem",
                color: isDark ? "#e2e8f0" : "#1e293b",
                display: "flex", alignItems: "center"
            }
        },
        {
            field: "width_mm",
            headerName: "W (mm)",
            minWidth: 100, flex: 1,
            cellStyle: {
                textAlign: "center", fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.82rem", color: isDark ? "#94a3b8" : "#475569",
                display: "flex", alignItems: "center", justifyContent: "center"
            },
            valueFormatter: (p) => dash(p.value)
        },
        {
            field: "height_length_mm",
            headerName: "H / L (mm)",
            minWidth: 100, flex: 1,
            cellStyle: {
                textAlign: "center", fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.82rem", color: isDark ? "#94a3b8" : "#475569",
                display: "flex", alignItems: "center", justifyContent: "center"
            },
            valueFormatter: (p) => dash(p.value)
        },
        {
            field: "qty",
            headerName: "Qty",
            minWidth: 80, flex: 0.8,
            cellStyle: {
                textAlign: "center", fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600, fontSize: "0.84rem",
                display: "flex", alignItems: "center", justifyContent: "center"
            },
            valueFormatter: (p) => dash(p.value)
        },
        {
            field: "stock_qty",
            headerName: "Stock Qty (Before Dispatch)",
            minWidth: 175, flex: 1.6,
            cellStyle: { display: "flex", alignItems: "center", justifyContent: "center" },
            cellRenderer: (params) => <StockCell value={params.value} />
        },
        {
            field: "location",
            headerName: "Location",
            minWidth: 120, flex: 1.2,
            cellStyle: {
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.8rem", color: isDark ? "#7dd3fc" : "#0369a1",
                display: "flex", alignItems: "center",
                fontWeight: 600
            },
            valueFormatter: (p) => dash(p.value)
        },
    ], [isDark]);

    const defaultColDef = useMemo(() => ({
        filter: true, sortable: true,
        resizable: true, floatingFilter: true,
    }), []);

    // ── Theme tokens ──
    const bg      = isDark ? "#090e1a"  : "#f0f4ff";
    const card    = isDark ? "#0f1629"  : "#ffffff";
    const border  = isDark ? "#1e3060"  : "#e0e7ff";
    const muted   = isDark ? "#475569"  : "#94a3b8";
    const accent  = "#6366f1";

    const agVars = isDark ? {
        "--ag-background-color":              "#0f1629",
        "--ag-header-background-color":       "#131e38",
        "--ag-odd-row-background-color":      "#0f1629",
        "--ag-even-row-background-color":     "#111b35",
        "--ag-row-hover-color":               "rgba(99,102,241,0.08)",
        "--ag-foreground-color":              "#e2e8f0",
        "--ag-header-foreground-color":       "#818cf8",
        "--ag-border-color":                  "#1e3060",
        "--ag-selected-row-background-color": "rgba(99,102,241,0.14)",
        "--ag-input-background-color":        "#1e293b",
        "--ag-input-border-color":            "#334155",
        "--ag-checkbox-checked-color":        "#6366f1",
    } : {};

    // ── Render states ──
    if (loading) return (
        <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20, fontFamily: "'Outfit', sans-serif" }}>
            <div style={{ width: 48, height: 48, border: `4px solid ${accent}33`, borderTopColor: accent, borderRadius: "50%", animation: "spin 0.85s linear infinite" }} />
            <div style={{ color: muted, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.82rem", letterSpacing: "0.08em" }}>
                LOADING VERIFY MATERIAL…
            </div>
            <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
        </div>
    );

    if (error) return (
        <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Outfit', sans-serif" }}>
            <div style={{ background: card, border: `1px solid #ef444433`, borderRadius: 16, padding: "32px 48px", textAlign: "center", maxWidth: 420 }}>
                <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>⚠️</div>
                <div style={{ fontWeight: 700, color: "#ef4444", fontSize: "1.05rem", marginBottom: 8 }}>Failed to load</div>
                <div style={{ color: muted, fontSize: "0.85rem", marginBottom: 20 }}>{error}</div>
                <button onClick={fetchData} style={{ background: accent, color: "#fff", border: "none", borderRadius: 8, padding: "9px 24px", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem" }}>
                    Retry
                </button>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: "100vh", background: bg, fontFamily: "'Outfit', sans-serif", color: isDark ? "#e2e8f0" : "#0f172a" }}>

            {/* ── TOP BAR ── */}
            <div style={{
                background: isDark
                    ? "linear-gradient(135deg, #0d1b40 0%, #131e38 100%)"
                    : "linear-gradient(135deg, #312e81 0%, #4f46e5 60%, #6366f1 100%)",
                padding: "20px 28px",
                display: "flex", alignItems: "center",
                justifyContent: "space-between", flexWrap: "wrap", gap: 12,
                boxShadow: "0 4px 24px rgba(99,102,241,0.25)"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <button
                        onClick={() => window.history.back()}
                        style={{
                            background: "rgba(255,255,255,0.12)", border: "1.5px solid rgba(255,255,255,0.25)",
                            color: "#fff", borderRadius: 8, padding: "6px 14px",
                            fontWeight: 700, cursor: "pointer", fontSize: "0.82rem",
                            fontFamily: "'Outfit', sans-serif"
                        }}
                    >
                        ← Back
                    </button>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: "1.3rem" }}>📦</span>
                            <h2 style={{ margin: 0, fontWeight: 800, fontSize: "1.25rem", color: "#fff", letterSpacing: "-0.02em" }}>
                                Verify Material
                            </h2>
                        </div>
                        <div style={{ display: "flex", gap: 14, marginTop: 4, flexWrap: "wrap" }}>
                            {[
                                ["File ID", meta.fileid],
                                ["Type",    type],
                                ["Mode",    meta.hasTypeData ? type : "ALL"],
                                meta.despatchLot ? ["Despatch Lot", meta.despatchLot] : null,
                            ].filter(Boolean).map(([k, v]) => (
                                <span key={k} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", color: "rgba(255,255,255,0.75)", display: "flex", alignItems: "center", gap: 5 }}>
                                    <strong style={{ color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>{k}:</strong>
                                    {v}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button
                        onClick={fetchData}
                        style={{ background: "rgba(255,255,255,0.12)", border: "1.5px solid rgba(255,255,255,0.25)", color: "#fff", borderRadius: 8, padding: "7px 16px", fontWeight: 700, cursor: "pointer", fontSize: "0.82rem" }}
                    >
                        ↻ Refresh
                    </button>
                    <button
                        onClick={() => setTheme(t => t === "light" ? "dark" : "light")}
                        style={{ background: "rgba(255,255,255,0.12)", border: "1.5px solid rgba(255,255,255,0.25)", color: "#fff", borderRadius: 8, padding: "7px 14px", fontWeight: 700, cursor: "pointer", fontSize: "0.88rem" }}
                    >
                        {isDark ? "☀️" : "🌙"}
                    </button>
                </div>
            </div>

            {/* ── BODY ── */}
            <div style={{ padding: "24px 28px" }}>

                {/* Warning banner if no type-specific data */}
                {!meta.hasTypeData && (
                    <div style={{
                        background: isDark ? "#451a0320" : "#fff7ed",
                        border: `1px solid ${isDark ? "#92400e40" : "#fed7aa"}`,
                        borderRadius: 10, padding: "10px 18px",
                        marginBottom: 18, display: "flex", alignItems: "center", gap: 10,
                        fontSize: "0.84rem", color: isDark ? "#fbbf24" : "#92400e", fontWeight: 600
                    }}>
                        <span>⚠️</span>
                        There is no material of type <strong style={{ marginLeft: 4 }}>{type}</strong> — showing ALL materials
                    </div>
                )}

                {/* ── STATS ── */}
                <div style={{ display: "flex", gap: 14, marginBottom: 22, flexWrap: "wrap" }}>
                    <StatCard label="Total Items"    value={meta.totalItems}  color="#6366f1" icon="📋" />
                    <StatCard label="In Stock"        value={inStockCount}     color="#22c55e" icon="✅" />
                    <StatCard label="Zero Stock"      value={zeroCount}        color="#f59e0b" icon="⚠️" />
                    <StatCard label="Total Stock Qty" value={totalStock.toLocaleString()} color="#0ea5e9" icon="📊" />
                </div>

                {/* ── SEARCH + GRID CARD ── */}
                <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, overflow: "hidden", boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.4)" : "0 4px 24px rgba(99,102,241,0.08)" }}>

                    {/* Card header */}
                    <div style={{
                        padding: "14px 20px",
                        background: isDark ? "#131e38" : "#eef2ff",
                        borderBottom: `1px solid ${border}`,
                        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10
                    }}>
                        <span style={{ fontWeight: 700, fontSize: "0.9rem", color: isDark ? "#818cf8" : "#4338ca", letterSpacing: "0.03em" }}>
                            📦 Material List — {filtered.length} of {data.length} items
                        </span>
                        <input
                            type="text"
                            placeholder="Search material or location…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{
                                padding: "7px 14px", borderRadius: 8, fontSize: "0.84rem",
                                border: `1.5px solid ${border}`,
                                background: isDark ? "#0f1629" : "#fff",
                                color: isDark ? "#e2e8f0" : "#0f172a",
                                outline: "none", fontFamily: "'Outfit', sans-serif",
                                width: 240
                            }}
                        />
                    </div>

                    {/* AG Grid */}
                    <div className="ag-theme-alpine" style={{ height: "calc(100vh - 360px)", width: "100%", ...agVars }}>
                        <AgGridReact
                            rowData={filtered}
                            columnDefs={columns}
                            defaultColDef={defaultColDef}
                            pagination={true}
                            paginationPageSize={25}
                            animateRows={true}
                            headerHeight={46}
                            rowHeight={44}
                            onGridReady={(p) => {
                                setTimeout(() => {
                                    const ids = p.api.getColumns()?.map(c => c.getId()) || [];
                                    if (ids.length) p.api.autoSizeColumns(ids, false);
                                }, 200);
                            }}
                        />
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                .ag-header-cell-label { font-weight: 700 !important; font-size: 0.8rem !important; letter-spacing: 0.02em; font-family: 'JetBrains Mono', monospace !important; }
                .ag-cell { font-size: 0.85rem !important; font-family: 'Outfit', sans-serif !important; }
                .ag-floating-filter-input { font-family: 'JetBrains Mono', monospace !important; font-size: 0.78rem !important; }
                .ag-paging-panel { font-size: 0.8rem !important; font-family: 'JetBrains Mono', monospace !important; }
            `}</style>
        </div>
    );
};

export default VerifyMaterial;