import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
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

// ─── Toast Notification Component ───────────────────────────────────────────
const ToastContainer = ({ toasts }) => (
    <div style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
    }}>
        {toasts.map(toast => (
            <div
                key={toast.id}
                style={{
                    padding: '1rem 1.5rem',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    color: 'white',
                    backgroundColor: toast.type === 'success' ? '#10b981' : '#ef4444',
                    animation: 'slideIn 0.3s ease-out',
                    minWidth: '250px',
                    fontWeight: '600'
                }}
            >
                {toast.message}
            </div>
        ))}
    </div>
);

// ─── Summary Card Component ─────────────────────────────────────────────────
const SummaryCard = ({ theme, label, value, color, isTotal = false }) => (
    <div
        style={{
            padding: '1rem',
            borderRadius: '8px',
            background: theme === 'dark' ? '#1e293b' : '#ffffff',
            border: isTotal
                ? `2px solid ${color}`
                : theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
            boxShadow: isTotal ? `0 4px 12px ${color}33` : '0 2px 4px rgba(0,0,0,0.05)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'default'
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = `0 6px 16px ${color}44`;
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = isTotal ? `0 4px 12px ${color}33` : '0 2px 4px rgba(0,0,0,0.05)';
        }}
    >
        <div style={{
            fontSize: '0.78rem',
            fontWeight: '600',
            color: theme === 'dark' ? '#94a3b8' : '#64748b',
            marginBottom: '0.4rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
        }}>
            {label}
        </div>
        <div style={{
            fontSize: isTotal ? '1.4rem' : '1.15rem',
            fontWeight: '700',
            color: color
        }}>
            ₹ {value.toLocaleString('en-IN')}
        </div>
    </div>
);

// ─── Main Component ─────────────────────────────────────────────────────────
const SupplierMaterialSummary = () => {
    // ── State ──────────────────────────────────────────────────────────────
    const [theme, setTheme] = useState('light');
    const [rowData, setRowData] = useState([]);
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [isMobile, setIsMobile] = useState(
        typeof window !== 'undefined' ? window.innerWidth <= 768 : false
    );
    const [loading, setLoading] = useState(false);
    const [financialYear, setFinancialYear] = useState('');
    const [financialYearOptions, setFinancialYearOptions] = useState([]);
    const [headerData, setHeaderData] = useState([]);   // dynamic columns from API
    const [recordCount, setRecordCount] = useState(0);
    const [toasts, setToasts] = useState([]);

    const gridRef = useRef(null);

    // ── Toast helper ───────────────────────────────────────────────────────
    const showToast = useCallback((message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    }, []);

    // ── Resize listener ───────────────────────────────────────────────────
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // ── Fetch financial year options ───────────────────────────────────────
    const fetchFinancialYears = useCallback(async () => {
        try {
            const response = await fetch(
                'https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/GetYearsApi.php'
            );
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            if (data.status === 'success' && Array.isArray(data.data)) {
                const years = data.data.map(item => ({
                    value: item.financial_year,
                    label: `20${item.financial_year}`
                }));
                setFinancialYearOptions(years);
                // Default to latest year
                if (years.length > 0) {
                    setFinancialYear(years[years.length - 1].value);
                }
            }
        } catch (err) {
            console.error('Error fetching financial years:', err);
            showToast('Error loading financial years', 'error');
        }
    }, [showToast]);

    useEffect(() => {
        fetchFinancialYears();
    }, [fetchFinancialYears]);

    // ── Fetch supplier material summary data ──────────────────────────────
    const fetchData = useCallback(async (fy) => {
        if (!fy) {
            showToast('Please select a financial year', 'error');
            return;
        }
        setLoading(true);
        try {
            const url =
                'https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/summary_report/supplier_material_summary_api.php' +
                `?financial_year=${fy}`;

            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();

            if (data.status && Array.isArray(data.dataArr)) {
                setRowData(data.dataArr);
                setRecordCount(data.records || data.dataArr.length);

                // headerData from API tells us which material columns exist
                // It includes "total" at the end – we keep it to drive the Total column
                if (Array.isArray(data.headerData)) {
                    setHeaderData(data.headerData);
                }

                showToast(`Loaded ${data.dataArr.length} records for FY ${fy}`, 'success');
            } else {
                throw new Error('Unexpected response format');
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            showToast(`Error: ${err.message}`, 'error');
            setRowData([]);
            setRecordCount(0);
            setHeaderData([]);
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    // Auto-fetch when FY changes
    useEffect(() => {
        if (financialYear) fetchData(financialYear);
    }, [financialYear, fetchData]);

    // ── Currency formatter (Indian locale, no decimals) ───────────────────
    const currencyFormatter = useCallback((params) => {
        if (params.value == null || params.value === 0) return '0';
        return parseFloat(params.value).toLocaleString('en-IN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    }, []);

    // ── Build column defs dynamically from headerData ─────────────────────
    const columnDefs = useMemo(() => {
        if (headerData.length === 0) return [];

        // Material columns = everything except "total"
        const materialHeaders = headerData.filter(h => h.toLowerCase() !== 'total');

        const cols = [
            // ── CUSTOMER_NAME (pinned left) ─────────────────────────────
            {
                headerName: 'CUSTOMER_NAME',
                field: 'CUSTOMER_NAME',
                width: isMobile ? 180 : 220,
                minWidth: 140,
                pinned: 'left',
                lockPosition: true,
                cellStyle: {
                    fontWeight: '600',
                    color: theme === 'dark' ? '#f1f5f9' : '#1e293b',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                },
                headerStyle: {
                    backgroundColor: theme === 'dark' ? '#334155' : '#dbeafe',
                    fontWeight: '700',
                    color: theme === 'dark' ? '#f1f5f9' : '#1e3a5f'
                }
            },
            // ── Dynamic material columns ────────────────────────────────
            ...materialHeaders.map(header => ({
                headerName: header,
                field: header,
                width: isMobile ? 110 : 130,
                minWidth: 90,
                type: 'numericColumn',
                valueFormatter: currencyFormatter,
                cellStyle: {
                    textAlign: 'right',
                    fontWeight: '500',
                    color: theme === 'dark' ? '#cbd5e1' : '#374151'
                },
                headerStyle: {
                    backgroundColor: theme === 'dark' ? '#334155' : '#dbeafe',
                    fontWeight: '700',
                    color: theme === 'dark' ? '#f1f5f9' : '#1e3a5f',
                    textAlign: 'center'
                }
            })),
            // ── Total (pinned right, orange theme from screenshot) ──────
            {
                headerName: 'Total',
                field: 'total',
                width: isMobile ? 130 : 150,
                minWidth: 110,
                pinned: 'right',
                lockPosition: true,
                type: 'numericColumn',
                valueFormatter: currencyFormatter,
                cellStyle: {
                    textAlign: 'right',
                    fontWeight: '700',
                    backgroundColor: theme === 'dark' ? '#92400e' : '#fdba74',
                    color: theme === 'dark' ? '#fff7ed' : '#7c2d12',
                    fontSize: '0.95rem'
                },
                headerStyle: {
                    backgroundColor: theme === 'dark' ? '#9a3412' : '#fb923c',
                    fontWeight: '800',
                    color: '#ffffff',
                    textAlign: 'center'
                }
            }
        ];

        return cols;
    }, [headerData, isMobile, theme, currencyFormatter]);

    // ── Default col def ────────────────────────────────────────────────────
    const defaultColDef = useMemo(() => ({
        filter: true,
        sortable: true,
        floatingFilter: !isMobile,
        resizable: true,
        suppressMenu: isMobile,
        cellStyle: { textAlign: 'left' }
    }), [isMobile]);

    // ── Calculate column totals for summary cards ─────────────────────────
    const totals = useMemo(() => {
        const materialHeaders = headerData.filter(h => h.toLowerCase() !== 'total');
        const acc = {};
        materialHeaders.forEach(h => (acc[h] = 0));
        acc['total'] = 0;

        rowData.forEach(row => {
            materialHeaders.forEach(h => {
                acc[h] = (acc[h] || 0) + (Number(row[h]) || 0);
            });
            acc['total'] = (acc['total'] || 0) + (Number(row['total']) || 0);
        });
        return acc;
    }, [rowData, headerData]);

    // ── Summary card color map ─────────────────────────────────────────────
    const CARD_COLORS = [
        '#059669', '#0891b2', '#7c3aed', '#dc2626',
        '#ea580c', '#0284c7', '#ca8a04', '#db2777',
        '#65a30d', '#6366f1', '#0d9488', '#b45309'
    ];

    // ── Utility: auto-size columns ─────────────────────────────────────────
    const autoSizeAll = useCallback(() => {
        if (!gridRef.current?.api) return;
        setTimeout(() => {
            try {
                const ids = gridRef.current.api.getColumns()?.map(c => c.getId()) || [];
                if (ids.length) gridRef.current.api.autoSizeColumns(ids, false);
            } catch (e) {
                console.error('autoSize error', e);
            }
        }, 150);
    }, []);

    // ── Export CSV ─────────────────────────────────────────────────────────
    const exportCSV = useCallback(() => {
        if (!gridRef.current?.api) return;
        try {
            gridRef.current.api.exportDataAsCsv({
                fileName: `SupplierMaterialSummary_FY${financialYear}_${new Date().toISOString().split('T')[0]}.csv`,
                allColumns: true
            });
            showToast('Exported successfully!', 'success');
        } catch (e) {
            showToast('Export failed', 'error');
        }
    }, [financialYear, showToast]);

    // ── Theme styles ───────────────────────────────────────────────────────
    const themeStyles = useMemo(() => {
        if (theme === 'dark') {
            return {
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                color: '#f1f5f9',
                cardBg: '#1e293b',
                cardHeader: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
                filterBg: '#0f172a',
                borderColor: '#334155'
            };
        }
        return {
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            color: '#0f172a',
            cardBg: '#ffffff',
            cardHeader: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
            filterBg: '#f8fafc',
            borderColor: '#e2e8f0'
        };
    }, [theme]);

    // ── Apply body bg ──────────────────────────────────────────────────────
    useEffect(() => {
        document.body.style.background = themeStyles.background;
        document.body.style.color = themeStyles.color;
        document.body.style.minHeight = '100vh';
        return () => {
            document.body.style.background = '';
            document.body.style.color = '';
            document.body.style.minHeight = '';
        };
    }, [themeStyles]);

    const gridHeight = isFullScreen ? 'calc(100vh - 340px)' : (isMobile ? '400px' : '560px');

    // ── Render ─────────────────────────────────────────────────────────────
    // Loading screen (first load only)
    if (loading && rowData.length === 0) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: themeStyles.background
            }}>
                <div style={{ textAlign: 'center', color: themeStyles.color }}>
                    <div style={{
                        width: '3rem', height: '3rem',
                        border: '4px solid rgba(37,99,235,0.2)',
                        borderTopColor: '#2563eb',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto'
                    }} />
                    <p style={{ marginTop: '1rem', fontWeight: '600' }}>Loading supplier data…</p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        );
    }

    // Material headers without "total" for summary cards
    const materialHeaders = headerData.filter(h => h.toLowerCase() !== 'total');

    return (
        <div style={{
            minHeight: '100vh',
            background: themeStyles.background,
            color: themeStyles.color,
            padding: 0,
            margin: 0
        }}>
            {/* ── Toasts ─────────────────────────────────────────────── */}
            <ToastContainer toasts={toasts} />

            <div style={{
                width: '100%',
                maxWidth: isFullScreen ? '100%' : '1440px',
                margin: isFullScreen ? 0 : '20px auto',
                padding: isFullScreen ? 0 : '0 20px'
            }}>
                <div style={{
                    backgroundColor: themeStyles.cardBg,
                    color: themeStyles.color,
                    border: `1px solid ${themeStyles.borderColor}`,
                    borderRadius: isFullScreen ? 0 : '12px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}>

                    {/* ── Header Bar ───────────────────────────────────── */}
                    <div style={{
                        background: themeStyles.cardHeader,
                        color: theme === 'dark' ? '#ffffff' : '#0f172a',
                        padding: '1.25rem 2rem',
                        borderBottom: `1px solid ${themeStyles.borderColor}`
                    }}>
                        <div style={{
                            display: 'flex',
                            flexDirection: isMobile ? 'column' : 'row',
                            alignItems: isMobile ? 'flex-start' : 'center',
                            justifyContent: 'space-between',
                            gap: '1rem'
                        }}>
                            {/* Title */}
                            <div>
                                <h4 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800' }}>
                                    📦 Supplier Material Summary
                                </h4>
                                <small style={{ opacity: 0.8, display: 'block', marginTop: '0.4rem', fontSize: '0.92rem' }}>
                                    {recordCount} suppliers
                                    {financialYear && ` | FY ${financialYear}`}
                                </small>
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                                {/* Refresh */}
                                <button onClick={() => fetchData(financialYear)} style={btnStyle('#3b82f6', '#2563eb')}>
                                    <span>↻</span>
                                    {!isMobile && <span>Refresh</span>}
                                </button>
                                {/* Export */}
                                <button onClick={exportCSV} style={btnStyle('#10b981', '#059669')}>
                                    <span>📊</span>
                                    {!isMobile && <span>Export</span>}
                                </button>
                                {/* Auto-size */}
                                <button onClick={autoSizeAll} style={btnStyle('#06b6d4', '#0891b2')}>
                                    <span>↔</span>
                                    {!isMobile && <span>Auto</span>}
                                </button>
                                {/* Full Screen toggle */}
                                <button
                                    onClick={() => setIsFullScreen(prev => !prev)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        fontSize: '0.9rem',
                                        borderRadius: '6px',
                                        border: `1px solid ${theme === 'dark' ? '#f1f5f9' : '#0f172a'}`,
                                        backgroundColor: 'transparent',
                                        color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
                                        cursor: 'pointer',
                                        fontWeight: '600'
                                    }}
                                >
                                    {isFullScreen ? '⛶ Exit' : '⛶ Full'}
                                </button>
                                {/* Theme toggle */}
                                <button
                                    onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        fontSize: '0.9rem',
                                        borderRadius: '6px',
                                        border: `1px solid ${theme === 'dark' ? '#f1f5f9' : '#0f172a'}`,
                                        backgroundColor: 'transparent',
                                        color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
                                        cursor: 'pointer',
                                        fontWeight: '600'
                                    }}
                                >
                                    {theme === 'light' ? '🌙' : '☀️'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ── Financial Year Filter ────────────────────────── */}
                    <div style={{
                        padding: '1.25rem 2rem',
                        background: themeStyles.filterBg,
                        borderBottom: `1px solid ${themeStyles.borderColor}`
                    }}>
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '1rem',
                            alignItems: 'flex-end'
                        }}>
                            {/* FY Select */}
                            <div style={{ flex: '1 1 200px', maxWidth: '280px' }}>
                                <label style={labelStyle(theme)}>
                                    Financial Year <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <select
                                    value={financialYear}
                                    onChange={e => setFinancialYear(e.target.value)}
                                    style={inputStyle(theme)}
                                >
                                    <option value="">Select FY</option>
                                    {financialYearOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>
                                            FY {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Submit */}
                            <button
                                onClick={() => fetchData(financialYear)}
                                disabled={!financialYear || loading}
                                style={{
                                    padding: '0.625rem 1.75rem',
                                    fontSize: '0.95rem',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: financialYear && !loading
                                        ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
                                        : '#94a3b8',
                                    color: 'white',
                                    cursor: financialYear && !loading ? 'pointer' : 'not-allowed',
                                    fontWeight: '700',
                                    boxShadow: financialYear && !loading
                                        ? '0 2px 8px rgba(139,92,246,0.3)' : 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                {loading ? (
                                    <>
                                        <div style={{
                                            width: '1rem', height: '1rem',
                                            border: '2px solid rgba(255,255,255,0.3)',
                                            borderTopColor: 'white',
                                            borderRadius: '50%',
                                            animation: 'spin 0.6s linear infinite'
                                        }} />
                                        <span>Loading…</span>
                                    </>
                                ) : (
                                    <>
                                        <span>🔍</span>
                                        <span>Submit</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* ── Summary Cards ────────────────────────────────── */}
                    {headerData.length > 0 && (
                        <div style={{
                            padding: '1.25rem 2rem',
                            background: themeStyles.filterBg,
                            borderBottom: `1px solid ${themeStyles.borderColor}`
                        }}>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: isMobile
                                    ? 'repeat(2, 1fr)'
                                    : 'repeat(auto-fit, minmax(150px, 1fr))',
                                gap: '0.75rem'
                            }}>
                                {materialHeaders.map((h, i) => (
                                    <SummaryCard
                                        key={h}
                                        theme={theme}
                                        label={h}
                                        value={totals[h] || 0}
                                        color={CARD_COLORS[i % CARD_COLORS.length]}
                                    />
                                ))}
                                {/* Grand Total card */}
                                <SummaryCard
                                    theme={theme}
                                    label="Grand Total"
                                    value={totals['total'] || 0}
                                    color="#fb923c"
                                    isTotal={true}
                                />
                            </div>
                        </div>
                    )}

                    {/* ── Data Grid ────────────────────────────────────── */}
                    <div style={{
                        backgroundColor: themeStyles.cardBg,
                        padding: isFullScreen ? 0 : '15px'
                    }}>
                        {rowData.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '60px 20px',
                                color: themeStyles.color
                            }}>
                                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📦</div>
                                <h5 style={{ marginBottom: '10px', fontSize: '1.25rem' }}>No supplier data available</h5>
                                <p style={{ color: theme === 'dark' ? '#94a3b8' : '#64748b' }}>
                                    {!financialYear
                                        ? 'Please select a financial year and click Submit'
                                        : 'No data found for the selected financial year'}
                                </p>
                            </div>
                        ) : (
                            <div
                                className="ag-theme-alpine"
                                style={{
                                    height: gridHeight,
                                    width: '100%',
                                    // Dark-mode CSS variable overrides for ag-grid
                                    ...(theme === 'dark' && {
                                        '--ag-background-color': '#1e293b',
                                        '--ag-header-background-color': '#334155',
                                        '--ag-odd-row-background-color': '#1e293b',
                                        '--ag-even-row-background-color': '#0f172a',
                                        '--ag-row-hover-color': '#334155',
                                        '--ag-foreground-color': '#f1f5f9',
                                        '--ag-header-foreground-color': '#f1f5f9',
                                        '--ag-border-color': '#334155',
                                        '--ag-selected-row-background-color': '#10b981',
                                        '--ag-input-background-color': '#334155',
                                        '--ag-input-border-color': '#475569'
                                    }),
                                    // Light-mode: subtle blue header like screenshot
                                    ...(theme === 'light' && {
                                        '--ag-header-background-color': '#dbeafe',
                                        '--ag-header-foreground-color': '#1e3a5f',
                                        '--ag-odd-row-background-color': '#ffffff',
                                        '--ag-even-row-background-color': '#f0f7ff',
                                        '--ag-row-hover-color': '#e0eaff'
                                    })
                                }}
                            >
                                <AgGridReact
                                    ref={gridRef}
                                    rowData={rowData}
                                    columnDefs={columnDefs}
                                    defaultColDef={defaultColDef}
                                    pagination={true}
                                    paginationPageSize={isMobile ? 10 : 15}
                                    suppressMovableColumns={isMobile}
                                    enableRangeSelection={!isMobile}
                                    animateRows={!isMobile}
                                    enableCellTextSelection={true}
                                    suppressHorizontalScroll={false}
                                    headerHeight={isMobile ? 40 : 48}
                                    rowHeight={isMobile ? 34 : 40}
                                    onGridReady={() => {
                                        console.log('SupplierMaterialSummary grid ready');
                                        setTimeout(() => autoSizeAll(), 600);
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Global Styles ──────────────────────────────────────── */}
            <style>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(100%); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                /* Pagination page-size selector text color fix for dark mode */
                .ag-theme-alpine select {
                    color: inherit;
                }
            `}</style>
        </div>
    );
};

// ─── Small style helpers (kept outside component to avoid re-creation) ──────
const btnStyle = (c1, c2) => ({
    padding: '0.5rem 1rem',
    fontSize: '0.9rem',
    borderRadius: '6px',
    border: 'none',
    background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: '600',
    boxShadow: `0 2px 8px ${c1}4D`
});

const labelStyle = (theme) => ({
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '600',
    fontSize: '0.9rem',
    color: theme === 'dark' ? '#f1f5f9' : '#0f172a'
});

const inputStyle = (theme) => ({
    width: '100%',
    padding: '0.625rem 0.875rem',
    fontSize: '0.95rem',
    borderRadius: '6px',
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #cbd5e1',
    backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
    color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
    fontWeight: '600',
    outline: 'none',
    boxSizing: 'border-box'
});

export default SupplierMaterialSummary;