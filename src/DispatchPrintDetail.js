import React, { useEffect, useState, useCallback } from "react";

const PRINT_DETAIL_API = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/DispatchPrintDetailApi.php";
const GET_DATES_API    = "http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/getDispatchDatesApi.php";

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

const Loader = ({ isDark }) => (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:200, flexDirection:"column", gap:16 }}>
        <div style={{ width:36, height:36, border:`4px solid #6366f133`, borderTopColor:"#6366f1", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
        <span style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.83rem", color: isDark ? "#94a3b8" : "#64748b" }}>LOADING...</span>
    </div>
);

const Field = ({ label, isDark, children }) => (
    <div style={{ display:"flex", flexDirection:"column", gap:"0.35rem", flex:1, minWidth:160 }}>
        <label style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.69rem", fontWeight:600, color: isDark ? "#7dd3fc" : "#0369a1", letterSpacing:"0.06em", textTransform:"uppercase" }}>
            {label}
        </label>
        {children}
    </div>
);

const inputBaseStyle = (isDark) => ({
    padding:"0.5rem 0.75rem", fontSize:"0.9rem", borderRadius:7,
    border: isDark ? "1px solid #334155" : "1px solid #cbd5e1",
    backgroundColor: isDark ? "#1e293b" : "#f8fafc",
    color: isDark ? "#e2e8f0" : "#0f172a",
    outline:"none", width:"100%", fontFamily:"Inter, sans-serif",
    boxSizing:"border-box"
});

// ─── Main Component ───────────────────────────────────────────────────────────
const DispatchPrintDetail = () => {
    const getRouteParams = () => {
        const hash  = window.location.hash;
        const parts = hash.split("/");
        return {
            fileId:   parts[2] ? decodeURIComponent(parts[2]) : "",
            fileName: parts[3] ? decodeURIComponent(parts[3]) : "",
        };
    };

    const { fileId, fileName } = getRouteParams();

    const [theme, setTheme]                   = useState("light");
    const [isMobile, setIsMobile]             = useState(window.innerWidth <= 768);
    const [toasts, setToasts]                 = useState([]);
    const [loading, setLoading]               = useState(false);
    const [availableDates, setAvailableDates] = useState([]);
    const [dateDropdownOpen, setDateDropdownOpen] = useState(false);

    const [selectedDate,   setSelectedDate]   = useState("");
    const [transportName,  setTransportName]  = useState("");
    const [vehicleNo,      setVehicleNo]      = useState("");
    const [driverName,     setDriverName]     = useState("");
    const [driverContact,  setDriverContact]  = useState("");

    const isDark = theme === "dark";

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

    // ── Fetch available dates for this file ──
    const fetchDates = useCallback(async () => {
        if (!fileId) return;
        setLoading(true);
        try {
            const res  = await fetch(`${GET_DATES_API}?file=${encodeURIComponent(fileId)}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            // Response: { status: true, data: [{ dispatch_date: "YYYY-MM-DD" }, ...] }
            const dates = (json?.data || []).map(item => item.dispatch_date).filter(Boolean);
            setAvailableDates(dates);
            if (dates.length > 0) {
                setSelectedDate(dates[0]);
            }
        } catch (e) {
            console.warn("Date fetch skipped or failed:", e.message);
        } finally { setLoading(false); }
    }, [fileId]);

    useEffect(() => { fetchDates(); }, [fetchDates]);

    // ── Navigate to React Print Page ─────────────────────────────────────────
    const handlePrint = () => {
        if (!selectedDate) {
            showToast("Please select a date before printing", "error");
            return;
        }
        const segments = [
            "dispatch-print-page",
            encodeURIComponent(fileId),
            encodeURIComponent(fileName),
            encodeURIComponent(selectedDate),
            encodeURIComponent(transportName || ""),
            encodeURIComponent(vehicleNo     || ""),
            encodeURIComponent(driverName    || ""),
            encodeURIComponent(driverContact || ""),
        ];
        const url = `${window.location.origin}${window.location.pathname}#/${segments.join("/")}`;
        window.open(url, "_blank");
    };

    const handleBack = () => window.history.back();

    // ── Theme ──
    const bg       = isDark ? "#0d1117" : "#f4f6fb";
    const cardBg   = isDark ? "#0f172a" : "#ffffff";
    const border   = isDark ? "1px solid #1e3a5f" : "1px solid #e2e8f0";
    const headerBg = isDark ? "#080f1e" : "#eef2ff";

    return (
        <div style={{ minHeight:"100vh", backgroundColor:bg, color: isDark ? "#e2e8f0" : "#0f172a", fontFamily:"Inter, sans-serif" }}>
            <Toast toasts={toasts}/>
            <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>

            <div style={{ backgroundColor:cardBg, minHeight:"100vh" }}>

                {/* ─── HEADER ─── */}
                <div style={{ background:headerBg, padding:"1rem 1.5rem", borderBottom:border }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"0.75rem" }}>
                        <div>
                            <div style={{ display:"flex", alignItems:"center", gap:"0.75rem" }}>
                                <button onClick={handleBack} style={{ padding:"0.38rem 0.85rem", fontSize:"0.84rem", borderRadius:6, border, backgroundColor:"transparent", color: isDark ? "#a5b4fc" : "#4f46e5", cursor:"pointer", fontWeight:700 }}>
                                    ← Back
                                </button>
                                <h2 style={{ margin:0, fontWeight:800, fontSize: isMobile ? "1.1rem" : "1.4rem", color: isDark ? "#e0e7ff" : "#312e81", letterSpacing:"-0.02em" }}>
                                    🖨️ Dispatch Print
                                </h2>
                            </div>
                            <div style={{ marginTop:"0.3rem" }}>
                                <span style={{
                                    fontFamily:"'DM Mono',monospace", fontSize:"0.78rem", fontWeight:700,
                                    color: isDark ? "#38bdf8" : "#0284c7",
                                    background: isDark ? "#0c2a3f" : "#e0f2fe",
                                    padding:"2px 10px", borderRadius:20
                                }}>
                                    {fileName || `File #${fileId}`}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => setTheme(t => t === "light" ? "dark" : "light")}
                            style={{ padding:"0.42rem 0.8rem", fontSize:"0.88rem", borderRadius:6, border, backgroundColor:"transparent", color: isDark ? "#e2e8f0" : "#334155", cursor:"pointer", fontWeight:600 }}
                        >
                            {isDark ? "☀️" : "🌙"}
                        </button>
                    </div>
                </div>

                {/* ─── FORM CARD ─── */}
                <div style={{ padding: isMobile ? "1rem" : "1.5rem 2rem" }}>
                    {loading ? <Loader isDark={isDark}/> : (
                        <div style={{ background:cardBg, border, borderRadius:12, boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.4)" : "0 4px 24px rgba(99,102,241,0.07)", overflow:"hidden" }}>

                            {/* Card header */}
                            <div style={{ background: isDark ? "#1e293b" : "#eef2ff", borderBottom:border, padding:"0.9rem 1.5rem", display:"flex", alignItems:"center", gap:"0.6rem" }}>
                                <span style={{ fontSize:"1.1rem" }}>📋</span>
                                <span style={{ fontWeight:700, fontSize:"0.95rem", color: isDark ? "#a5b4fc" : "#312e81", fontFamily:"'DM Mono',monospace", letterSpacing:"0.03em" }}>
                                    PRINT DETAILS
                                </span>
                                <span style={{ marginLeft:"auto", fontFamily:"'DM Mono',monospace", fontSize:"0.72rem", color: isDark ? "#64748b" : "#94a3b8" }}>
                                    Fill details → Open Print Preview
                                </span>
                            </div>

                            <div style={{ padding: isMobile ? "1rem" : "1.5rem" }}>

                                {/* Row 1: File Name + Date */}
                                <div style={{ display:"flex", flexWrap:"wrap", gap:"1rem", marginBottom:"1.25rem" }}>
                                    <Field label="File Name" isDark={isDark}>
                                        <div style={{ ...inputBaseStyle(isDark), backgroundColor: isDark ? "#0f172a" : "#f1f5f9", color: isDark ? "#38bdf8" : "#0284c7", fontWeight:700, fontFamily:"'DM Mono',monospace", cursor:"not-allowed" }}>
                                            {fileName || `File #${fileId}`}
                                        </div>
                                    </Field>

                                    {/* Date dropdown — only API dates, no manual picker */}
                                    <Field label="Select Date *" isDark={isDark}>
                                        <div style={{ position:"relative" }}>
                                            <div
                                                onClick={() => availableDates.length > 0 && setDateDropdownOpen(o => !o)}
                                                style={{
                                                    ...inputBaseStyle(isDark),
                                                    cursor: availableDates.length > 0 ? "pointer" : "not-allowed",
                                                    display:"flex", alignItems:"center", justifyContent:"space-between", userSelect:"none",
                                                    color: selectedDate ? (isDark ? "#e2e8f0" : "#0f172a") : (isDark ? "#64748b" : "#94a3b8"),
                                                    fontWeight: selectedDate ? 600 : 400,
                                                    border: !selectedDate ? `1px solid #f97316` : (isDark ? "1px solid #334155" : "1px solid #cbd5e1")
                                                }}
                                            >
                                                <span>{selectedDate || (availableDates.length === 0 ? "No dates available" : "Select Date")}</span>
                                                {availableDates.length > 0 && (
                                                    <span style={{ fontSize:"0.7rem", color: isDark ? "#475569" : "#94a3b8" }}>{dateDropdownOpen ? "▲" : "▼"}</span>
                                                )}
                                            </div>

                                            {dateDropdownOpen && availableDates.length > 0 && (
                                                <div style={{
                                                    position:"absolute", top:"calc(100% + 4px)", left:0, zIndex:999,
                                                    background: isDark ? "#1e293b" : "#ffffff",
                                                    border: isDark ? "1px solid #334155" : "1px solid #e2e8f0",
                                                    borderRadius:8, boxShadow:"0 8px 24px rgba(0,0,0,0.15)",
                                                    minWidth:220, maxHeight:280, overflowY:"auto"
                                                }}>
                                                    <div style={{ padding:"0.4rem 0.75rem", fontFamily:"'DM Mono',monospace", fontSize:"0.68rem", color: isDark ? "#475569" : "#94a3b8", letterSpacing:"0.05em" }}>
                                                        AVAILABLE DATES
                                                    </div>
                                                    {availableDates.map(d => (
                                                        <div
                                                            key={d}
                                                            onClick={() => { setSelectedDate(d); setDateDropdownOpen(false); }}
                                                            style={{
                                                                padding:"0.55rem 0.75rem", cursor:"pointer",
                                                                fontFamily:"'DM Mono',monospace", fontSize:"0.86rem",
                                                                fontWeight: selectedDate === d ? 700 : 400,
                                                                background: selectedDate === d ? (isDark ? "rgba(99,102,241,0.15)" : "#ede9fe") : "transparent",
                                                                color: selectedDate === d ? (isDark ? "#a5b4fc" : "#4f46e5") : (isDark ? "#e2e8f0" : "#0f172a"),
                                                            }}
                                                        >
                                                            {d}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </Field>
                                </div>

                                <div style={{ borderTop: isDark ? "1px solid #1e3a5f" : "1px solid #f1f5f9", margin:"0.5rem 0 1.25rem" }}/>

                                {/* Row 2: Transport Details */}
                                <div style={{ marginBottom:"0.6rem" }}>
                                    <span style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.72rem", color: isDark ? "#7dd3fc" : "#0369a1", letterSpacing:"0.06em", fontWeight:600 }}>
                                        🚛 TRANSPORT DETAILS
                                    </span>
                                </div>
                                <div style={{ display:"flex", flexWrap:"wrap", gap:"1rem", marginBottom:"1.75rem" }}>
                                    <Field label="Transport Name" isDark={isDark}>
                                        <input type="text" value={transportName} onChange={e => setTransportName(e.target.value)} placeholder="e.g. abc transport" style={inputBaseStyle(isDark)}/>
                                    </Field>
                                    <Field label="Vehicle No" isDark={isDark}>
                                        <input type="text" value={vehicleNo} onChange={e => setVehicleNo(e.target.value)} placeholder="e.g. MH09 AB 1234" style={inputBaseStyle(isDark)}/>
                                    </Field>
                                    <Field label="Driver Name" isDark={isDark}>
                                        <input type="text" value={driverName} onChange={e => setDriverName(e.target.value)} placeholder="e.g. Rajesh Kumar" style={inputBaseStyle(isDark)}/>
                                    </Field>
                                    <Field label="Driver Contact No" isDark={isDark}>
                                        <input type="text" value={driverContact} onChange={e => setDriverContact(e.target.value)} placeholder="e.g. 9876543210" style={inputBaseStyle(isDark)}/>
                                    </Field>
                                </div>

                                {/* Action Buttons */}
                                <div style={{ display:"flex", gap:"0.75rem", flexWrap:"wrap", justifyContent:"flex-end" }}>
                                    <button
                                        onClick={handleBack}
                                        style={{ padding:"0.6rem 1.4rem", fontSize:"0.9rem", borderRadius:8, border: isDark ? "1px solid #334155" : "1px solid #cbd5e1", backgroundColor:"transparent", color: isDark ? "#94a3b8" : "#475569", cursor:"pointer", fontWeight:600 }}
                                    >
                                        ← Back
                                    </button>
                                    <button
                                        onClick={handlePrint}
                                        disabled={!selectedDate}
                                        style={{
                                            padding:"0.6rem 2rem", fontSize:"0.95rem", borderRadius:8, border:"none",
                                            background: !selectedDate ? "#94a3b8" : "linear-gradient(135deg,#f97316,#ea580c)",
                                            color:"white", cursor: !selectedDate ? "not-allowed" : "pointer",
                                            fontWeight:700, display:"flex", alignItems:"center", gap:"0.5rem",
                                            boxShadow: !selectedDate ? "none" : "0 4px 14px rgba(249,115,22,0.4)",
                                            opacity: !selectedDate ? 0.7 : 1, transition:"all 0.2s"
                                        }}
                                    >
                                        🖨️ Open Print Preview
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ─── Summary preview ─── */}
                {selectedDate && (
                    <div style={{ padding: isMobile ? "0 1rem 1.5rem" : "0 2rem 2rem" }}>
                        <div style={{ background:cardBg, border, borderRadius:12, boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.4)" : "0 4px 24px rgba(99,102,241,0.07)", overflow:"hidden" }}>
                            <div style={{ background: isDark ? "#1e293b" : "#fff7ed", borderBottom:border, padding:"0.9rem 1.5rem", display:"flex", alignItems:"center", gap:"0.6rem" }}>
                                <span style={{ fontSize:"1.1rem" }}>📄</span>
                                <span style={{ fontWeight:700, fontSize:"0.95rem", color: isDark ? "#fb923c" : "#c2410c", fontFamily:"'DM Mono',monospace", letterSpacing:"0.03em" }}>
                                    WILL PRINT WITH THESE DETAILS
                                </span>
                            </div>
                            <div style={{ padding:"1.25rem 1.5rem" }}>
                                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.88rem" }}>
                                    <tbody>
                                        {[
                                            ["File",           fileName || fileId],
                                            ["Date",           selectedDate],
                                            ["Transport Name", transportName || "—"],
                                            ["Vehicle No",     vehicleNo     || "—"],
                                            ["Driver Name",    driverName    || "—"],
                                            ["Driver Contact", driverContact || "—"],
                                        ].map(([k, v]) => (
                                            <tr key={k} style={{ borderBottom: isDark ? "1px solid #1e3a5f" : "1px solid #f1f5f9" }}>
                                                <td style={{ padding:"0.55rem 0.75rem", fontFamily:"'DM Mono',monospace", fontSize:"0.78rem", color: isDark ? "#7dd3fc" : "#0369a1", fontWeight:600, width:"40%", whiteSpace:"nowrap" }}>{k}</td>
                                                <td style={{ padding:"0.55rem 0.75rem", fontWeight:600, color: isDark ? "#e2e8f0" : "#0f172a" }}>{v}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {dateDropdownOpen && <div style={{ position:"fixed", inset:0, zIndex:998 }} onClick={() => setDateDropdownOpen(false)}/>}

            <style>{`
                @keyframes spin    { to { transform: rotate(360deg); } }
                @keyframes toastIn { from { opacity:0; transform:translateX(60px); } to { opacity:1; transform:translateX(0); } }
                input:focus { box-shadow: 0 0 0 3px rgba(99,102,241,0.18)!important; border-color: #6366f1!important; }
            `}</style>
        </div>
    );
};

export default DispatchPrintDetail;