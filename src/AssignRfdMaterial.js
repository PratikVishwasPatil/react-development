import React, { useEffect, useMemo, useState, useRef } from "react";
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

const STATUS_COLORS = {
    Pending:   { bg: '#fff3cd', color: '#856404', border: '#ffc107' },
    Completed: { bg: '#d1e7dd', color: '#0a3622', border: '#198754' },
    InProgress:{ bg: '#cff4fc', color: '#055160', border: '#0dcaf0' },
    Default:   { bg: '#e2e3e5', color: '#383d41', border: '#6c757d' },
};

const StatusBadge = ({ value }) => {
    const style = STATUS_COLORS[value] || STATUS_COLORS.Default;
    return (
        <span style={{
            display: 'inline-block',
            padding: '2px 10px',
            borderRadius: '20px',
            fontSize: '0.78rem',
            fontWeight: 700,
            background: style.bg,
            color: style.color,
            border: `1px solid ${style.border}`,
            letterSpacing: '0.03em'
        }}>
            {value || '—'}
        </span>
    );
};

const AssignAsslyMaterialListGrid = () => {
    const [theme, setTheme] = useState('light');
    const [rowData, setRowData] = useState([]);
    const [columnDefs, setColumnDefs] = useState([]);
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [financialYears, setFinancialYears] = useState([]);
    const [selectedFinancialYear, setSelectedFinancialYear] = useState('');
    const [loadingYears, setLoadingYears] = useState(false);
    const gridRef = useRef();

    // ── Toast ────────────────────────────────────────────────────────────────
    const showToast = (message, type = 'info') => {
        const colors = { success: '#198754', error: '#dc3545', info: '#0d6efd' };
        const toast = document.createElement('div');
        toast.style.cssText = `
            position:fixed;top:20px;right:20px;padding:12px 22px;
            background:${colors[type] || colors.info};color:#fff;
            border-radius:8px;box-shadow:0 6px 20px rgba(0,0,0,.18);
            z-index:9999;font-size:.875rem;font-family:'DM Sans',sans-serif;
            animation:toastIn .3s ease;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'toastOut .3s ease forwards';
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    };

    // ── Animation styles ─────────────────────────────────────────────────────
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
            @keyframes toastIn  { from{transform:translateX(120%);opacity:0} to{transform:translateX(0);opacity:1} }
            @keyframes toastOut { from{transform:translateX(0);opacity:1}    to{transform:translateX(120%);opacity:0} }
            @keyframes fadeUp   { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
            .mat-grid-wrap { animation: fadeUp .4s ease both; }
            .action-btn { transition: all .18s ease !important; }
            .action-btn:hover { transform: translateY(-1px) !important; box-shadow: 0 4px 12px rgba(0,0,0,.15) !important; }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    // ── Resize ────────────────────────────────────────────────────────────────
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    // ── Fetch Financial Years ─────────────────────────────────────────────────
    const fetchFinancialYears = async () => {
        setLoadingYears(true);
        try {
            const res = await fetch("https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/GetYearsApi.php");
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();

            let years = [];
            if (data.status === "success" && Array.isArray(data.data)) years = data.data;
            else if (Array.isArray(data)) years = data;

            years.sort((a, b) => {
                const ya = a.FINANCIAL_YEAR || a.financial_year;
                const yb = b.FINANCIAL_YEAR || b.financial_year;
                return yb.localeCompare(ya);
            });
            setFinancialYears(years);
            if (years.length > 0)
                setSelectedFinancialYear(years[0].FINANCIAL_YEAR || years[0].financial_year);
        } catch (err) {
            console.error(err);
            // Fallback: use hard-coded year so grid still loads
            setFinancialYears([{ FINANCIAL_YEAR: '25-26' }]);
            setSelectedFinancialYear('25-26');
        } finally {
            setLoadingYears(false);
        }
    };

    // ── Column Defs ───────────────────────────────────────────────────────────
    const generateColumnDefs = () => [
        {
            headerName: "#",
            valueGetter: p => (p.node ? p.node.rowIndex + 1 : ''),
            width: isMobile ? 55 : 70,
            minWidth: 50,
            pinned: 'left',
            lockPosition: true,
            cellStyle: { fontWeight: '600', textAlign: 'center', color: '#6c757d' },
            sortable: false,
            filter: false,
            floatingFilter: false,
        },
        {
            field: "file_name",
            headerName: "File Name",
            width: isMobile ? 160 : 220,
            pinned: 'left',
            checkboxSelection: true,
            headerCheckboxSelection: true,
            cellStyle: { fontWeight: '700', fontFamily: "'DM Mono', monospace", fontSize: '0.82rem' },
        },
        {
            field: "customer_name",
            headerName: "Customer Name",
            width: isMobile ? 200 : 280,
            minWidth: 150,
            cellStyle: { fontWeight: '500' },
        },
        {
            field: "doc_received_date",
            headerName: "Doc Received Date",
            width: isMobile ? 150 : 180,
            minWidth: 130,
            cellStyle: { textAlign: 'center', fontFamily: "'DM Mono', monospace", fontSize: '0.82rem' },
        },
        {
            field: "delivery_date",
            headerName: "Delivery Date",
            width: isMobile ? 130 : 160,
            minWidth: 120,
            cellStyle: { textAlign: 'center', fontFamily: "'DM Mono', monospace", fontSize: '0.82rem' },
        },
        {
            field: "mr_status",
            headerName: "MR Status",
            width: isMobile ? 120 : 150,
            minWidth: 110,
            cellRenderer: p => <StatusBadge value={p.value} />,
            cellStyle: { display: 'flex', alignItems: 'center' },
        },
        {
            field: "file_id",
            headerName: "File ID",
            hide: true,
        },
    ];

    const defaultColDef = useMemo(() => ({
        filter: true,
        sortable: true,
        floatingFilter: !isMobile,
        resizable: true,
        suppressMenu: isMobile,
        cellStyle: { textAlign: 'left', fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem' },
    }), [isMobile]);

    // ── Fetch Grid Data ───────────────────────────────────────────────────────
    const fetchData = async (fy) => {
        if (!fy) { showToast('Please select a financial year', 'error'); return; }
        setLoading(true);
        try {
            const res = await fetch(
                `http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/assignAsslyMaterialListApi.php?financial_year=${encodeURIComponent(fy)}`
            );
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();

            if (data.status && Array.isArray(data.data)) {
                setRowData(data.data);
                showToast(`${data.count ?? data.data.length} records loaded for FY ${fy}`, 'success');
            } else if (Array.isArray(data)) {
                setRowData(data);
                showToast(`${data.length} records loaded`, 'success');
            } else {
                setRowData([]);
                showToast('No data found for selected year', 'info');
            }
        } catch (err) {
            console.error(err);
            showToast(`Error: ${err.message}`, 'error');
            setRowData([]);
        } finally {
            setLoading(false);
        }
    };

    // ── Effects ───────────────────────────────────────────────────────────────
    useEffect(() => { setColumnDefs(generateColumnDefs()); }, [isMobile]);
    useEffect(() => { fetchFinancialYears(); }, []);
    useEffect(() => { if (selectedFinancialYear) fetchData(selectedFinancialYear); }, [selectedFinancialYear]);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const onSelectionChanged = (e) => {
        const rows = e.api.getSelectedNodes().map(n => n.data);
        setSelectedRows(rows);
        if (rows.length === 1 && rows[0].file_id) {
            window.open(`#/assign-rfd-details/${rows[0].file_id}`, '_blank');
        }
    };

    const handleRefresh = () => {
        if (selectedFinancialYear) {
            fetchData(selectedFinancialYear);
            showToast('Refreshing…', 'info');
        }
    };

    const downloadCsv = () => {
        if (!gridRef.current?.api) return;
        gridRef.current.api.exportDataAsCsv({
            fileName: `AsslyMaterialList_FY${selectedFinancialYear}_${new Date().toISOString().split('T')[0]}.csv`,
        });
        showToast('Exported successfully!', 'success');
    };

    const autoSizeAll = () => {
        setTimeout(() => {
            const ids = gridRef.current?.api?.getColumns()?.map(c => c.getId()) || [];
            if (ids.length) gridRef.current.api.autoSizeColumns(ids, false);
        }, 100);
    };

    // ── Theme ─────────────────────────────────────────────────────────────────
    const T = theme === 'dark'
        ? {
            pageBg:    '#0f1117',
            cardBg:    '#1a1d27',
            headerBg:  'linear-gradient(135deg, #1e2235 0%, #151826 100%)',
            text:      '#e8eaf0',
            subText:   '#8891a8',
            border:    '#2c3050',
            inputBg:   '#252840',
            inputText: '#e8eaf0',
            agVars: {
                '--ag-background-color':          '#1a1d27',
                '--ag-header-background-color':   '#1e2235',
                '--ag-odd-row-background-color':  '#1f2236',
                '--ag-even-row-background-color': '#1a1d27',
                '--ag-row-hover-color':           '#252945',
                '--ag-foreground-color':          '#e8eaf0',
                '--ag-header-foreground-color':   '#c8cde0',
                '--ag-border-color':              '#2c3050',
                '--ag-selected-row-background-color': '#1e4976',
                '--ag-input-background-color':    '#252840',
                '--ag-input-border-color':        '#3a3f66',
            }
        }
        : {
            pageBg:    '#f0f2f8',
            cardBg:    '#ffffff',
            headerBg:  'linear-gradient(135deg, #1a237e 0%, #283593 100%)',
            text:      '#1a1a2e',
            subText:   '#5c6480',
            border:    '#dce0f0',
            inputBg:   '#ffffff',
            inputText: '#1a1a2e',
            agVars: {}
        };

    const gridHeight = isFullScreen ? 'calc(100vh - 180px)' : (isMobile ? '420px' : '580px');

    // ── Loading Spinner ───────────────────────────────────────────────────────
    if (loading && rowData.length === 0) {
        return (
            <div style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center',
                justifyContent: 'center', background: T.pageBg, flexDirection: 'column', gap: '1rem'
            }}>
                <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    border: `4px solid ${theme === 'dark' ? '#2c3050' : '#dce0f0'}`,
                    borderTopColor: '#3f51b5',
                    animation: 'spin 0.8s linear infinite'
                }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                <p style={{ color: T.subText, fontFamily: "'DM Sans',sans-serif", margin: 0 }}>
                    Loading assembly material list…
                </p>
            </div>
        );
    }

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div style={{ minHeight: '100vh', background: T.pageBg, fontFamily: "'DM Sans', sans-serif" }}>
            <div className="mat-grid-wrap" style={{
                width: '100%',
                maxWidth: isFullScreen ? '100%' : '1440px',
                margin: '0 auto',
                padding: isFullScreen ? 0 : '20px',
            }}>
                <div style={{
                    background: T.cardBg,
                    border: `1px solid ${T.border}`,
                    borderRadius: isFullScreen ? 0 : '16px',
                    overflow: 'hidden',
                    boxShadow: isFullScreen ? 'none' : '0 8px 40px rgba(26,35,126,.08)',
                }}>

                    {/* ── Header ── */}
                    <div style={{
                        background: T.headerBg,
                        padding: '14px 20px',
                    }}>
                        <div style={{
                            display: 'flex', flexWrap: 'wrap',
                            alignItems: 'center', justifyContent: 'space-between', gap: '10px'
                        }}>
                            {/* Title */}
                            <div style={{ flex: isMobile ? '1 1 100%' : '1 1 auto' }}>
                                <h4 style={{
                                    margin: 0, color: '#ffffff',
                                    fontWeight: 700, fontSize: '1rem', letterSpacing: '.01em',
                                    display: 'flex', alignItems: 'center', gap: '8px'
                                }}>
                                    <span style={{
                                        background: 'rgba(255,255,255,.15)',
                                        borderRadius: '8px', padding: '4px 8px', fontSize: '1.1rem'
                                    }}>🔩</span>
                                    Assign Assembly Material List
                                </h4>
                                <p style={{ margin: '2px 0 0', color: 'rgba(255,255,255,.65)', fontSize: '0.78rem' }}>
                                    {rowData.length} records
                                    {selectedRows.length > 0 && ` · ${selectedRows.length} selected`}
                                    {loading && ' · Updating…'}
                                </p>
                            </div>

                            {/* Controls */}
                            <div style={{
                                display: 'flex', flexWrap: 'wrap', gap: '8px',
                                alignItems: 'center', flex: isMobile ? '1 1 100%' : '0 1 auto'
                            }}>
                                {/* FY Selector */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <label style={{ color: 'rgba(255,255,255,.75)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>FY:</label>
                                    <select
                                        value={selectedFinancialYear}
                                        onChange={e => setSelectedFinancialYear(e.target.value)}
                                        disabled={loadingYears}
                                        style={{
                                            padding: '5px 10px',
                                            fontSize: '0.82rem',
                                            borderRadius: '6px',
                                            border: '1px solid rgba(255,255,255,.25)',
                                            background: 'rgba(255,255,255,.12)',
                                            color: '#ffffff',
                                            outline: 'none',
                                            minWidth: '100px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {financialYears.map((y, i) => (
                                            <option key={i}
                                                value={y.FINANCIAL_YEAR || y.financial_year}
                                                style={{ background: '#1a237e', color: '#fff' }}>
                                                {y.FINANCIAL_YEAR || y.financial_year}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Buttons */}
                                {[
                                    { icon: '🔄', label: 'Refresh',   onClick: handleRefresh,  bg: 'rgba(255,255,255,.12)', border: 'rgba(255,255,255,.3)', color: '#fff', disabled: loading },
                                    { icon: '📊', label: 'Export CSV', onClick: downloadCsv,    bg: '#2e7d32', border: '#2e7d32', color: '#fff' },
                                    { icon: '⇔',  label: 'Auto Size', onClick: autoSizeAll,    bg: '#00838f', border: '#00838f', color: '#fff' },
                                    {
                                        icon: isFullScreen ? '🗗' : '🗖',
                                        label: isFullScreen ? 'Windowed' : 'Full',
                                        onClick: () => setIsFullScreen(f => !f),
                                        bg: 'rgba(255,255,255,.1)', border: 'rgba(255,255,255,.25)', color: '#fff'
                                    },
                                    {
                                        icon: theme === 'light' ? '🌙' : '☀️',
                                        label: theme === 'light' ? 'Dark' : 'Light',
                                        onClick: () => setTheme(t => t === 'light' ? 'dark' : 'light'),
                                        bg: 'rgba(255,255,255,.1)', border: 'rgba(255,255,255,.25)', color: '#fff'
                                    },
                                ].map((btn, i) => (
                                    <button key={i}
                                        className="action-btn"
                                        onClick={btn.onClick}
                                        disabled={btn.disabled}
                                        style={{
                                            padding: '5px 12px',
                                            fontSize: '0.82rem',
                                            borderRadius: '6px',
                                            border: `1px solid ${btn.border}`,
                                            background: btn.bg,
                                            color: btn.color,
                                            cursor: btn.disabled ? 'not-allowed' : 'pointer',
                                            opacity: btn.disabled ? .5 : 1,
                                            fontFamily: "'DM Sans', sans-serif",
                                            fontWeight: 600,
                                            display: 'flex', alignItems: 'center', gap: '4px'
                                        }}>
                                        <span>{btn.icon}</span>
                                        {!isMobile && <span>{btn.label}</span>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── Grid Body ── */}
                    <div style={{ background: T.cardBg, padding: isFullScreen ? 0 : '12px' }}>
                        {rowData.length === 0 && !loading ? (
                            <div style={{
                                textAlign: 'center', padding: '60px 20px', color: T.subText
                            }}>
                                <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>🔩</div>
                                <h5 style={{ color: T.text, margin: '0 0 6px' }}>No records found</h5>
                                <p style={{ margin: '0 0 20px', fontSize: '0.875rem' }}>
                                    Select a financial year or refresh to load data.
                                </p>
                                <button
                                    onClick={handleRefresh}
                                    style={{
                                        padding: '8px 20px', borderRadius: '8px',
                                        border: 'none', background: '#1a237e',
                                        color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
                                        fontWeight: 600, fontSize: '0.875rem'
                                    }}>
                                    🔄 Refresh Data
                                </button>
                            </div>
                        ) : (
                            <div
                                className="ag-theme-alpine"
                                style={{ height: gridHeight, width: '100%', ...T.agVars }}
                            >
                                <AgGridReact
                                    ref={gridRef}
                                    rowData={rowData}
                                    columnDefs={columnDefs}
                                    defaultColDef={defaultColDef}
                                    pagination={true}
                                    paginationPageSize={isMobile ? 10 : 25}
                                    rowSelection="single"
                                    onSelectionChanged={onSelectionChanged}
                                    suppressMovableColumns={isMobile}
                                    rowMultiSelectWithClick={false}
                                    animateRows={!isMobile}
                                    enableCellTextSelection={true}
                                    suppressHorizontalScroll={false}
                                    headerHeight={isMobile ? 40 : 48}
                                    rowHeight={isMobile ? 36 : 44}
                                    onGridReady={() => setTimeout(autoSizeAll, 500)}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssignAsslyMaterialListGrid;