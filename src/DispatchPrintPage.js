import React, { useEffect, useState, useCallback, useRef } from "react";

// ── API ───────────────────────────────────────────────────────────────────────
const PRINT_DATA_API = "http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/printAllData.php";
// Query params: ?file_id=5454&date=2025-10-25

// Company info
const COMPANY = {
    name:    "Surya Equipments Pvt. Ltd.",
    address: "B-39, M.I.D.C. Gokul Shirgaon, Kolhapur - 416234(M.S) India",
    phone:   "Ph No : (0231) 2671588, Mob : (+91) 9146036041",
    email:   "E-mail : mktg@suryaequipments.co.in / surya@suryaequipments.co.in",
    web:     "www.suryaequipments.in",
    gstin:   "GSTIN No. 27AAECS4252M1Z1",
    logo:    "https://www.erp.suryaequipments.com/Surya_React/assets/surya_logo.png",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getRouteParams = () => {
    // Route: #/dispatch-print-page/:fileId/:fileName/:date/:tname/:vcno/:dname/:dcno
    const hash  = window.location.hash;
    const parts = hash.split("/");
    return {
        fileId:        parts[2] ? decodeURIComponent(parts[2]) : "",
        fileName:      parts[3] ? decodeURIComponent(parts[3]) : "",
        date:          parts[4] ? decodeURIComponent(parts[4]) : "",
        transportName: parts[5] ? decodeURIComponent(parts[5]) : "",
        vehicleNo:     parts[6] ? decodeURIComponent(parts[6]) : "",
        driverName:    parts[7] ? decodeURIComponent(parts[7]) : "",
        driverContact: parts[8] ? decodeURIComponent(parts[8]) : "",
    };
};

// ─── Loader ───────────────────────────────────────────────────────────────────
const Loader = () => (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", flexDirection:"column", gap:16 }}>
        <div style={{ width:40, height:40, border:"4px solid #f9731622", borderTopColor:"#f97316", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
        <span style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.85rem", color:"#64748b", letterSpacing:"0.06em" }}>
            PREPARING PRINT DOCUMENT...
        </span>
    </div>
);

// ─── Print Page ───────────────────────────────────────────────────────────────
const DispatchPrintPage = () => {
    const params = getRouteParams();
    const [data,    setData]    = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState(null);
    const printRef = useRef();

    // ── Fetch print data from API ──
    const fetchPrintData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const qs = new URLSearchParams({
                file_id: params.fileId,
                date:    params.date,
            });
            const res  = await fetch(`${PRINT_DATA_API}?${qs}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();

            if ((json.status === true || json.status === "success") && json.data) {
                // Merge URL params for transport/driver if API doesn't return them
                const d = json.data;
                setData({
                    ...d,
                    transport_name: d.transport_name || params.transportName,
                    vehicle_no:     d.vehicle_no     || params.vehicleNo,
                    driver_name:    d.driver_name    || params.driverName,
                    driver_contact: d.driver_contact || params.driverContact,
                });
            } else {
                setData({
                    file_name:      params.fileName,
                    dispatch_type:  "Packing List",
                    date:           params.date,
                    transport_name: params.transportName,
                    vehicle_no:     params.vehicleNo,
                    driver_name:    params.driverName,
                    driver_contact: params.driverContact,
                    items:          [],
                    total_sent:     0,
                    total_bundles:  0,
                });
            }
        } catch (e) {
            setData({
                file_name:      params.fileName,
                dispatch_type:  "Packing List",
                date:           params.date,
                transport_name: params.transportName,
                vehicle_no:     params.vehicleNo,
                driver_name:    params.driverName,
                driver_contact: params.driverContact,
                items:          [],
                total_sent:     0,
                total_bundles:  0,
            });
            setError(`Note: Could not load item details (${e.message})`);
        } finally {
            setLoading(false);
        }
    }, [params.fileId, params.date, params.transportName, params.vehicleNo, params.driverName, params.driverContact, params.fileName]);

    useEffect(() => { fetchPrintData(); }, [fetchPrintData]);

    const handlePrint = () => window.print();
    const handleBack  = () => window.history.back();

    if (loading) return (
        <>
            <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"/>
            <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
            <Loader/>
        </>
    );

    const d     = data || {};
    const items = Array.isArray(d.items) ? d.items : [];

    // Totals — use API values, fallback to summing rows
    const totalSent    = d.total_sent    ?? items.reduce((s, r) => s + (Number(r.sent)    || 0), 0);
    const totalBundles = d.total_bundles ?? items.reduce((s, r) => s + (Number(r.bundles) || 0), 0);

    return (
        <>
            <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=EB+Garamond:wght@400;600;700&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet"/>

            {/* ── Screen-only toolbar ── */}
            <div className="no-print screen-toolbar">
                <button onClick={handleBack}  className="tb-btn back-btn">← Back</button>
                <div className="tb-center">
                    <span className="tb-title">Print Preview</span>
                    <span className="tb-file">{d.file_name || params.fileName}</span>
                </div>
                <button onClick={handlePrint} className="tb-btn print-btn">🖨️ Print</button>
            </div>

            {error && (
                <div className="no-print error-bar">{error}</div>
            )}

            {/* ══════════════════════════════════════
                PRINT DOCUMENT
            ══════════════════════════════════════ */}
            <div className="print-page" ref={printRef}>

                {/* ── Company Header ── */}
                <div className="company-header">
                    <div className="logo-wrap">
                        <img
                            src={COMPANY.logo}
                            alt="Surya Logo"
                            className="company-logo"
                            onError={e => { e.target.style.display = "none"; }}
                        />
                    </div>
                    <div className="company-info">
                        <div className="company-name">{COMPANY.name}</div>
                        <div className="company-detail">{COMPANY.address}</div>
                        <div className="company-detail">{COMPANY.phone}</div>
                        <div className="company-detail">{COMPANY.email}</div>
                        <div className="company-detail">{COMPANY.web}</div>
                        <div className="company-gstin">{COMPANY.gstin}</div>
                    </div>
                </div>

                <div className="header-rule"/>

                {/* ── File / Type / Date row ── */}
                <table className="meta-table">
                    <tbody>
                        <tr>
                            <td className="meta-cell"><span className="meta-label">File :</span> {d.file_name || params.fileName}</td>
                            <td className="meta-cell"><span className="meta-label">Type :</span> {d.dispatch_type || "Packing List"}</td>
                            <td className="meta-cell"><span className="meta-label">Date :</span> {d.date || params.date}</td>
                        </tr>
                    </tbody>
                </table>

                {/* ── Transport / Driver table ── */}
                <table className="transport-table">
                    <thead>
                        <tr>
                            <th>Transport Name</th>
                            <th>Vehicle No</th>
                            <th>Driver Name</th>
                            <th>Driver Contact No.</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{d.transport_name || "—"}</td>
                            <td>{d.vehicle_no     || "—"}</td>
                            <td>{d.driver_name    || "—"}</td>
                            <td>{d.driver_contact || "—"}</td>
                        </tr>
                    </tbody>
                </table>

                {/* ── Items table ── */}
                <table className="items-table">
                    <thead>
                        <tr>
                            <th className="col-srno">Sr No</th>
                            <th className="col-type">Type</th>
                            <th className="col-desc">Description</th>
                            <th className="col-ww">WW (mm)</th>
                            <th className="col-hl">H/L (mm)</th>
                            <th className="col-plan">PLAN</th>
                            <th className="col-sent">SENT</th>
                            <th className="col-bundles">BUNDLES</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length > 0 ? items.map((row, i) => (
                            <tr key={i} className={i % 2 === 1 ? "row-alt" : ""}>
                                <td className="tc">{row.sr_no ?? i + 1}</td>
                                <td className="tc">{row.type        || "—"}</td>
                                <td>{row.description || "—"}</td>
                                <td className="tc">{row.ww_mm       || ""}</td>
                                <td className="tc">{row.hl_mm       || ""}</td>
                                <td className="tr">{row.plan        ?? ""}</td>
                                <td className="tr">{row.sent        ?? ""}</td>
                                <td className="tr">{row.bundles     ?? ""}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={8} style={{ textAlign:"center", padding:"18px", color:"#94a3b8", fontStyle:"italic" }}>
                                    No item records found
                                </td>
                            </tr>
                        )}

                        {/* Totals row */}
                        <tr className="totals-row">
                            <td colSpan={5} className="tr total-label">Total</td>
                            <td className="tr total-val"></td>
                            <td className="tr total-val">{totalSent}</td>
                            <td className="tr total-val">{totalBundles}</td>
                        </tr>
                    </tbody>
                </table>

                {/* ── Footer ── */}
                <div className="print-footer">
                    <div className="footer-sig">
                        <div className="sig-line"/>
                        <div className="sig-label">Authorised Signatory</div>
                    </div>
                </div>

            </div>

            {/* ══════════════════════════════════════
                STYLES
            ══════════════════════════════════════ */}
            <style>{`
                *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }

                body {
                    background: #e8eaf0;
                    font-family: 'Source Sans 3', 'Segoe UI', sans-serif;
                }

                /* ── Screen toolbar ── */
                .screen-toolbar {
                    position: sticky;
                    top: 0;
                    z-index: 100;
                    background: #1e293b;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0.65rem 1.5rem;
                    gap: 1rem;
                    box-shadow: 0 2px 12px rgba(0,0,0,0.25);
                }
                .tb-center {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 2px;
                }
                .tb-title {
                    font-family: 'DM Mono', monospace;
                    font-size: 0.72rem;
                    color: #94a3b8;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                }
                .tb-file {
                    font-family: 'DM Mono', monospace;
                    font-size: 0.92rem;
                    font-weight: 700;
                    color: #38bdf8;
                    letter-spacing: 0.03em;
                }
                .tb-btn {
                    padding: 0.45rem 1.2rem;
                    border-radius: 7px;
                    border: none;
                    font-size: 0.88rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .back-btn  { background: #334155; color: #e2e8f0; }
                .print-btn { background: linear-gradient(135deg,#f97316,#ea580c); color: white; box-shadow: 0 3px 10px rgba(249,115,22,0.4); }
                .back-btn:hover  { background: #475569; }
                .print-btn:hover { transform: translateY(-1px); box-shadow: 0 5px 16px rgba(249,115,22,0.5); }

                .error-bar {
                    background: #fff7ed;
                    border-bottom: 1px solid #fed7aa;
                    color: #c2410c;
                    font-size: 0.82rem;
                    padding: 0.5rem 1.5rem;
                    font-family: 'DM Mono', monospace;
                }

                /* ── Print document wrapper ── */
                .print-page {
                    width: 210mm;
                    min-height: 297mm;
                    margin: 1.5rem auto;
                    background: #ffffff;
                    padding: 14mm 14mm 18mm;
                    box-shadow: 0 8px 40px rgba(0,0,0,0.18);
                    border-radius: 3px;
                    font-size: 11pt;
                    color: #111;
                }

                /* ── Company header ── */
                .company-header {
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                    padding-bottom: 10px;
                }
                .logo-wrap {
                    flex-shrink: 0;
                    width: 72px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .company-logo {
                    width: 64px;
                    height: auto;
                    object-fit: contain;
                }
                .company-info {
                    flex: 1;
                    text-align: center;
                }
                .company-name {
                    font-family: 'EB Garamond', Georgia, serif;
                    font-size: 17pt;
                    font-weight: 700;
                    letter-spacing: 0.01em;
                    color: #111;
                    margin-bottom: 3px;
                }
                .company-detail {
                    font-size: 8.5pt;
                    color: #333;
                    line-height: 1.55;
                }
                .company-gstin {
                    font-size: 8.5pt;
                    font-weight: 700;
                    color: #111;
                    margin-top: 2px;
                }
                .header-rule {
                    border: none;
                    border-top: 2px solid #111;
                    margin: 8px 0 10px;
                }

                /* ── Meta table (File / Type / Date) ── */
                .meta-table {
                    width: 100%;
                    border-collapse: collapse;
                    border: 1.5px solid #111;
                    margin-bottom: 0;
                }
                .meta-table .meta-cell {
                    border: 1.5px solid #111;
                    padding: 5px 10px;
                    font-size: 9.5pt;
                    font-weight: 600;
                    width: 33.33%;
                }
                .meta-label {
                    font-weight: 700;
                    color: #111;
                }

                /* ── Transport table ── */
                .transport-table {
                    width: 100%;
                    border-collapse: collapse;
                    border: 1.5px solid #111;
                    border-top: none;
                    margin-bottom: 0;
                }
                .transport-table th {
                    background: #f1f5f9;
                    border: 1px solid #111;
                    padding: 5px 8px;
                    font-size: 8.5pt;
                    font-weight: 700;
                    text-align: left;
                }
                .transport-table td {
                    border: 1px solid #111;
                    padding: 5px 8px;
                    font-size: 9pt;
                    text-align: left;
                }

                /* ── Items table ── */
                .items-table {
                    width: 100%;
                    border-collapse: collapse;
                    border: 1.5px solid #111;
                    border-top: none;
                    margin-bottom: 16px;
                }
                .items-table th {
                    background: #f1f5f9;
                    border: 1px solid #888;
                    padding: 5px 6px;
                    font-size: 8.5pt;
                    font-weight: 700;
                    text-align: center;
                    white-space: nowrap;
                }
                .items-table td {
                    border: 1px solid #bbb;
                    padding: 4px 6px;
                    font-size: 9pt;
                }
                .items-table .row-alt td {
                    background: #f9fafb;
                }

                /* Column widths */
                .col-srno    { width: 5%; }
                .col-type    { width: 7%; }
                .col-desc    { width: 38%; }
                .col-ww      { width: 9%; }
                .col-hl      { width: 9%; }
                .col-plan    { width: 9%; }
                .col-sent    { width: 9%; }
                .col-bundles { width: 9%; }

                /* Cell alignment helpers */
                .tc { text-align: center; }
                .tr { text-align: right; }

                /* Totals row */
                .totals-row td {
                    border: 1.5px solid #111;
                    background: #f1f5f9;
                    font-weight: 700;
                    font-size: 9.5pt;
                    padding: 5px 6px;
                }
                .total-label { text-align: right; font-weight: 700; }
                .total-val   { text-align: right; font-weight: 800; font-size: 10.5pt; }

                /* ── Footer ── */
                .print-footer {
                    display: flex;
                    justify-content: flex-end;
                    margin-top: 28px;
                }
                .footer-sig {
                    text-align: center;
                    width: 160px;
                }
                .sig-line {
                    border-top: 1.5px solid #111;
                    margin-bottom: 5px;
                }
                .sig-label {
                    font-size: 8.5pt;
                    font-weight: 600;
                    color: #333;
                }

                /* ══════════════════════════════
                   PRINT MEDIA RULES
                ══════════════════════════════ */
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 10mm 10mm 12mm;
                    }
                    body { background: white !important; }
                    .no-print,
                    .screen-toolbar,
                    .error-bar { display: none !important; }
                    .print-page {
                        width: 100%;
                        margin: 0;
                        padding: 0;
                        box-shadow: none;
                        border-radius: 0;
                        page-break-inside: avoid;
                    }
                    .items-table tr { page-break-inside: avoid; }
                    .totals-row     { page-break-inside: avoid; }
                }

                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </>
    );
};

export default DispatchPrintPage;