import React, { useEffect, useMemo, useState, useRef } from "react";
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

const LabourReportGrid = () => {
    const [theme, setTheme] = useState('light');
    const [rowData, setRowData] = useState([]);
    const [columnDefs, setColumnDefs] = useState([]);
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [financialYear, setFinancialYear] = useState('25-26');
    const [financialYearOptions, setFinancialYearOptions] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [totalAssembly, setTotalAssembly] = useState(0);
    const [toasts, setToasts] = useState([]);
    
    // Date filter states
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    
    const gridRef = useRef();

    const showToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };

    const fetchFinancialYears = async () => {
        try {
            const response = await fetch("https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/GetYearsApi.php");
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.status === "success" && Array.isArray(data.data)) {
                const years = data.data.map(item => ({
                    value: item.financial_year,
                    label: `20${item.financial_year}`
                }));
                setFinancialYearOptions(years);
                
                if (years.length > 0) {
                    setFinancialYear(years[years.length - 1].value);
                }
            }
        } catch (error) {
            console.error("Error fetching financial years:", error);
            showToast("Error loading financial years", 'error');
        }
    };

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Currency formatter
    const currencyFormatter = (params) => {
        if (params.value == null) return '₹ 0';
        return '₹ ' + parseFloat(params.value).toLocaleString('en-IN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    };

    const generateColumnDefs = () => {
        const baseColumns = [
            {
                headerName: "Sr No",
                field: "serialNumber",
                valueGetter: (params) => params.node ? params.node.rowIndex + 1 : '',
                width: isMobile ? 60 : 80,
                minWidth: 50,
                pinned: 'left',
                lockPosition: true,
                cellStyle: { fontWeight: 'bold', textAlign: 'center' }
            },
            {
                field: "file_name",
                headerName: "File Name",
                width: isMobile ? 180 : 250,
                pinned: 'left',
                checkboxSelection: false,
                headerCheckboxSelection: false,
                cellStyle: { fontWeight: '700', color: '#2563eb' }
            },
            {
                field: "FILE_ID",
                headerName: "File ID",
                width: isMobile ? 100 : 120,
                cellStyle: { textAlign: 'center', backgroundColor: '#fef3c7', fontWeight: '600' }
            },
            {
                field: "sheet_metal",
                headerName: "Sheet Metal",
                width: isMobile ? 140 : 160,
                valueFormatter: currencyFormatter,
                cellStyle: { textAlign: 'right', fontWeight: '600', color: '#059669' },
                type: 'numericColumn'
            },
            {
                field: "champion_sheet_metal",
                headerName: "Champion Sheet Metal",
                width: isMobile ? 160 : 180,
                valueFormatter: currencyFormatter,
                cellStyle: { textAlign: 'right', fontWeight: '600', color: '#0891b2' },
                type: 'numericColumn'
            },
            {
                field: "foundation_fab",
                headerName: "Foundation Fab",
                width: isMobile ? 140 : 160,
                valueFormatter: currencyFormatter,
                cellStyle: { textAlign: 'right', fontWeight: '600', color: '#7c3aed' },
                type: 'numericColumn'
            },
            {
                field: "assembly_amt",
                headerName: "Assembly Amount",
                width: isMobile ? 150 : 170,
                valueFormatter: currencyFormatter,
                cellStyle: { textAlign: 'right', fontWeight: '600', color: '#dc2626' },
                type: 'numericColumn'
            },
            {
                field: "other_vendor",
                headerName: "Other Vendor",
                width: isMobile ? 140 : 160,
                valueFormatter: currencyFormatter,
                cellStyle: { textAlign: 'right', fontWeight: '600', color: '#ea580c' },
                type: 'numericColumn'
            },
            {
                field: "second_dc",
                headerName: "Second DC",
                width: isMobile ? 130 : 150,
                valueFormatter: currencyFormatter,
                cellStyle: { textAlign: 'right', fontWeight: '600', color: '#0284c7' },
                type: 'numericColumn'
            },
            {
                field: "totalRow",
                headerName: "Total",
                width: isMobile ? 140 : 160,
                valueFormatter: currencyFormatter,
                cellStyle: { 
                    textAlign: 'right', 
                    fontWeight: '700', 
                    backgroundColor: '#dcfce7',
                    color: '#166534',
                    fontSize: '1.05rem'
                },
                type: 'numericColumn',
                pinned: isMobile ? null : 'right'
            }
        ];

        return baseColumns;
    };

    const defaultColDef = useMemo(() => ({
        filter: true,
        sortable: true,
        floatingFilter: !isMobile,
        resizable: true,
        suppressMenu: isMobile,
        cellStyle: { textAlign: 'left' }
    }), [isMobile]);

    const fetchLabourReportData = async (fy = financialYear, sdate = fromDate, edate = toDate) => {
        if (!fy) {
            showToast('Please select a financial year', 'error');
            return;
        }

        setLoading(true);
        try {
            // Build query parameters
            let queryParams = `financial_year=${fy}`;
            
            if (sdate) {
                queryParams += `&sdate=${sdate}`;
            }
            if (edate) {
                queryParams += `&edate=${edate}`;
            }

            const url = `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/summary_report/labourReportApi.php?${queryParams}`;
            
            console.log('Fetching from:', url);
            
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('API Response:', data);

            if (data.status && Array.isArray(data.data)) {
                setRowData(data.data);
                setTotalCount(data.count || data.data.length);
                setTotalAssembly(data.totalAssembly || 0);
                
                let dateInfo = `FY ${fy}`;
                if (sdate && edate) {
                    dateInfo += ` (${formatDateForDisplay(sdate)} to ${formatDateForDisplay(edate)})`;
                }
                
                showToast(`Loaded ${data.data.length} records for ${dateInfo}`, 'success');
            } else {
                throw new Error("Failed to fetch labour report data");
            }
        } catch (error) {
            console.error("Error fetching labour report data:", error);
            showToast(`Error fetching data: ${error.message}`, 'error');
            setRowData([]);
            setTotalCount(0);
            setTotalAssembly(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setColumnDefs(generateColumnDefs());
        fetchFinancialYears();
    }, [isMobile]);

    // Auto-load data when financial year is set
    useEffect(() => {
        if (financialYear) {
            fetchLabourReportData();
        }
    }, [financialYear]);

    const handleFinancialYearChange = (e) => {
        const newFY = e.target.value;
        setFinancialYear(newFY);
    };

    const handleSubmit = () => {
        if (!financialYear) {
            showToast('Please select a financial year', 'error');
            return;
        }

        // Validate dates if both are provided
        if (fromDate && toDate) {
            if (new Date(fromDate) > new Date(toDate)) {
                showToast('From date cannot be greater than To date', 'error');
                return;
            }
        }

        fetchLabourReportData(financialYear, fromDate, toDate);
    };

    const handleClearDates = () => {
        setFromDate('');
        setToDate('');
        fetchLabourReportData(financialYear, '', '');
    };

    const formatDateForDisplay = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const onSelectionChanged = (event) => {
        const selectedNodes = event.api.getSelectedNodes();
        const selectedData = selectedNodes.map(node => node.data);
        setSelectedRows(selectedData);
    };

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    const downloadExcel = () => {
        if (!gridRef.current?.api) return;
        
        try {
            const params = {
                fileName: `LabourReport_${financialYear}_${new Date().toISOString().split('T')[0]}.csv`,
                allColumns: true,
                onlySelected: false
            };
            gridRef.current.api.exportDataAsCsv(params);
            showToast('Data exported successfully!', 'success');
        } catch (error) {
            console.error('Error exporting data:', error);
            showToast('Error exporting data', 'error');
        }
    };

    const autoSizeAll = () => {
        if (!gridRef.current?.api) return;
        
        try {
            setTimeout(() => {
                const allColumnIds = gridRef.current.api.getColumns()?.map(column => column.getId()) || [];
                if (allColumnIds.length > 0) {
                    gridRef.current.api.autoSizeColumns(allColumnIds, false);
                }
            }, 100);
        } catch (error) {
            console.error('Error auto-sizing columns:', error);
        }
    };

    const refreshData = () => {
        fetchLabourReportData(financialYear, fromDate, toDate);
    };

    // Calculate column totals
    const calculateTotals = () => {
        if (rowData.length === 0) {
            return {
                sheet_metal: 0,
                champion_sheet_metal: 0,
                foundation_fab: 0,
                assembly_amt: 0,
                other_vendor: 0,
                second_dc: 0,
                totalRow: 0
            };
        }

        return rowData.reduce((acc, row) => {
            acc.sheet_metal += row.sheet_metal || 0;
            acc.champion_sheet_metal += row.champion_sheet_metal || 0;
            acc.foundation_fab += row.foundation_fab || 0;
            acc.assembly_amt += row.assembly_amt || 0;
            acc.other_vendor += row.other_vendor || 0;
            acc.second_dc += row.second_dc || 0;
            acc.totalRow += row.totalRow || 0;
            return acc;
        }, {
            sheet_metal: 0,
            champion_sheet_metal: 0,
            foundation_fab: 0,
            assembly_amt: 0,
            other_vendor: 0,
            second_dc: 0,
            totalRow: 0
        });
    };

    const totals = calculateTotals();

    const getThemeStyles = () => {
        if (theme === 'dark') {
            return {
                backgroundColor: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                color: '#f1f5f9',
                cardBg: '#1e293b',
                cardHeader: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)'
            };
        }
        return {
            backgroundColor: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            color: '#0f172a',
            cardBg: '#ffffff',
            cardHeader: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)'
        };
    };

    const themeStyles = getThemeStyles();
    const gridHeight = isFullScreen ? 'calc(100vh - 260px)' : (isMobile ? '400px' : '600px');

    useEffect(() => {
        document.body.style.background = themeStyles.backgroundColor;
        document.body.style.color = themeStyles.color;
        document.body.style.minHeight = '100vh';

        return () => {
            document.body.style.background = '';
            document.body.style.color = '';
            document.body.style.minHeight = '';
        };
    }, [theme]);

    if (loading && rowData.length === 0) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: themeStyles.backgroundColor
            }}>
                <div style={{ textAlign: 'center', color: themeStyles.color }}>
                    <div style={{
                        width: '3rem',
                        height: '3rem',
                        border: '4px solid rgba(37, 99, 235, 0.2)',
                        borderTopColor: '#2563eb',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto'
                    }} />
                    <p style={{ marginTop: '1rem', fontWeight: '600' }}>Loading labour report data...</p>
                    <style>{`
                        @keyframes spin {
                            to { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: themeStyles.backgroundColor,
            color: themeStyles.color,
            padding: 0,
            margin: 0
        }}>
            {/* Toast Notifications */}
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

            <div style={{
                width: '100%',
                maxWidth: isFullScreen ? '100%' : '1400px',
                margin: isFullScreen ? 0 : '20px auto',
                padding: isFullScreen ? 0 : '0 20px'
            }}>
                <div style={{
                    backgroundColor: themeStyles.cardBg,
                    color: themeStyles.color,
                    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
                    borderRadius: isFullScreen ? 0 : '12px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}>
                    {/* Header */}
                    <div style={{
                        background: themeStyles.cardHeader,
                        color: theme === 'dark' ? '#ffffff' : '#0f172a',
                        padding: '1.25rem 2rem',
                        borderBottom: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0'
                    }}>
                        <div style={{
                            display: 'flex',
                            flexDirection: isMobile ? 'column' : 'row',
                            alignItems: isMobile ? 'flex-start' : 'center',
                            justifyContent: 'space-between',
                            gap: '1rem'
                        }}>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800' }}>
                                    📊 Labour Cost Report
                                </h4>
                                <small style={{ opacity: 0.8, display: 'block', marginTop: '0.5rem', fontSize: '0.95rem' }}>
                                    {totalCount} files | Total Assembly: ₹ {totalAssembly.toLocaleString('en-IN')}
                                    {selectedRows.length > 0 && ` | ${selectedRows.length} selected`}
                                </small>
                            </div>

                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '0.5rem',
                                alignItems: 'center'
                            }}>
                                <button
                                    onClick={refreshData}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        fontSize: '0.9rem',
                                        borderRadius: '6px',
                                        border: 'none',
                                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                        color: 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontWeight: '600',
                                        boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                                    }}
                                >
                                    <span>↻</span>
                                    {!isMobile && <span>Refresh</span>}
                                </button>

                                <button
                                    onClick={downloadExcel}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        fontSize: '0.9rem',
                                        borderRadius: '6px',
                                        border: 'none',
                                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                        color: 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontWeight: '600',
                                        boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                                    }}
                                >
                                    <span>📊</span>
                                    {!isMobile && <span>Export</span>}
                                </button>

                                <button
                                    onClick={autoSizeAll}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        fontSize: '0.9rem',
                                        borderRadius: '6px',
                                        border: 'none',
                                        background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                                        color: 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontWeight: '600'
                                    }}
                                >
                                    <span>↔</span>
                                    {!isMobile && <span>Auto</span>}
                                </button>

                                <button
                                    onClick={toggleFullScreen}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        fontSize: '0.9rem',
                                        borderRadius: '6px',
                                        border: theme === 'dark' ? '1px solid #f1f5f9' : '1px solid #0f172a',
                                        backgroundColor: 'transparent',
                                        color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
                                        cursor: 'pointer',
                                        fontWeight: '600'
                                    }}
                                >
                                    {isFullScreen ? '⛶ Exit' : '⛶ Full'}
                                </button>

                                <button
                                    onClick={toggleTheme}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        fontSize: '0.9rem',
                                        borderRadius: '6px',
                                        border: theme === 'dark' ? '1px solid #f1f5f9' : '1px solid #0f172a',
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

                    {/* Filters Section */}
                    <div style={{
                        padding: '1.5rem 2rem',
                        background: theme === 'dark' ? '#0f172a' : '#f8fafc',
                        borderBottom: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0'
                    }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '1rem',
                            alignItems: 'end'
                        }}>
                            {/* Financial Year */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    fontSize: '0.9rem',
                                    color: theme === 'dark' ? '#f1f5f9' : '#0f172a'
                                }}>
                                    Financial Year <span style={{color: '#ef4444'}}>*</span>
                                </label>
                                <select
                                    value={financialYear}
                                    onChange={handleFinancialYearChange}
                                    style={{
                                        width: '100%',
                                        padding: '0.625rem 0.875rem',
                                        fontSize: '0.95rem',
                                        borderRadius: '6px',
                                        border: theme === 'dark' ? '1px solid #334155' : '1px solid #cbd5e1',
                                        backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                                        color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
                                        fontWeight: '600',
                                        outline: 'none'
                                    }}
                                >
                                    <option value="">Select FY</option>
                                    {financialYearOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            FY {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* From Date */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    fontSize: '0.9rem',
                                    color: theme === 'dark' ? '#f1f5f9' : '#0f172a'
                                }}>
                                    From Date
                                </label>
                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.625rem 0.875rem',
                                        fontSize: '0.95rem',
                                        borderRadius: '6px',
                                        border: theme === 'dark' ? '1px solid #334155' : '1px solid #cbd5e1',
                                        backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                                        color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            {/* To Date */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    fontSize: '0.9rem',
                                    color: theme === 'dark' ? '#f1f5f9' : '#0f172a'
                                }}>
                                    To Date
                                </label>
                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.625rem 0.875rem',
                                        fontSize: '0.95rem',
                                        borderRadius: '6px',
                                        border: theme === 'dark' ? '1px solid #334155' : '1px solid #cbd5e1',
                                        backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                                        color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            {/* Buttons */}
                            <div style={{
                                display: 'flex',
                                gap: '0.5rem',
                                flexWrap: 'wrap'
                            }}>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!financialYear || loading}
                                    style={{
                                        flex: 1,
                                        minWidth: '100px',
                                        padding: '0.625rem 1.5rem',
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
                                            ? '0 2px 8px rgba(139, 92, 246, 0.3)'
                                            : 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    {loading ? (
                                        <>
                                            <div style={{
                                                width: '1rem',
                                                height: '1rem',
                                                border: '2px solid rgba(255,255,255,0.3)',
                                                borderTopColor: 'white',
                                                borderRadius: '50%',
                                                animation: 'spin 0.6s linear infinite'
                                            }} />
                                            <span>Loading...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>🔍</span>
                                            <span>Submit</span>
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={handleClearDates}
                                    disabled={!fromDate && !toDate}
                                    style={{
                                        padding: '0.625rem 1rem',
                                        fontSize: '0.95rem',
                                        borderRadius: '6px',
                                        border: 'none',
                                        background: fromDate || toDate 
                                            ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                                            : '#94a3b8',
                                        color: 'white',
                                        cursor: fromDate || toDate ? 'pointer' : 'not-allowed',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <span>✖</span>
                                    <span>Clear</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div style={{
                        padding: '1.5rem 2rem',
                        background: theme === 'dark' ? '#0f172a' : '#f8fafc',
                        borderBottom: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0'
                    }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(180px, 1fr))',
                            gap: '1rem'
                        }}>
                            <SummaryCard 
                                theme={theme}
                                label="Sheet Metal"
                                value={totals.sheet_metal}
                                color="#059669"
                            />
                            <SummaryCard 
                                theme={theme}
                                label="Champion SM"
                                value={totals.champion_sheet_metal}
                                color="#0891b2"
                            />
                            <SummaryCard 
                                theme={theme}
                                label="Foundation Fab"
                                value={totals.foundation_fab}
                                color="#7c3aed"
                            />
                            <SummaryCard 
                                theme={theme}
                                label="Assembly"
                                value={totals.assembly_amt}
                                color="#dc2626"
                            />
                            <SummaryCard 
                                theme={theme}
                                label="Other Vendor"
                                value={totals.other_vendor}
                                color="#ea580c"
                            />
                            <SummaryCard 
                                theme={theme}
                                label="Second DC"
                                value={totals.second_dc}
                                color="#0284c7"
                            />
                            <SummaryCard 
                                theme={theme}
                                label="Grand Total"
                                value={totals.totalRow}
                                color="#16a34a"
                                isTotal={true}
                            />
                        </div>
                    </div>

                    {/* Grid Section */}
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
                                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📊</div>
                                <h5 style={{ marginBottom: '10px', fontSize: '1.25rem' }}>No labour report data available</h5>
                                <p style={{ color: theme === 'dark' ? '#94a3b8' : '#64748b' }}>
                                    {!financialYear 
                                        ? 'Please select a financial year and click Submit'
                                        : 'No data found for the selected criteria'}
                                </p>
                            </div>
                        ) : (
                            <div
                                className="ag-theme-alpine"
                                style={{
                                    height: gridHeight,
                                    width: "100%",
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
                                    })
                                }}
                            >
                                <AgGridReact
                                    ref={gridRef}
                                    rowData={rowData}
                                    columnDefs={columnDefs}
                                    defaultColDef={defaultColDef}
                                    pagination={true}
                                    paginationPageSize={isMobile ? 10 : 20}
                                    rowSelection="multiple"
                                    onSelectionChanged={onSelectionChanged}
                                    suppressMovableColumns={isMobile}
                                    enableRangeSelection={!isMobile}
                                    rowMultiSelectWithClick={true}
                                    animateRows={!isMobile}
                                    enableCellTextSelection={true}
                                    suppressHorizontalScroll={false}
                                    headerHeight={isMobile ? 40 : 48}
                                    rowHeight={isMobile ? 38 : 45}
                                    onGridReady={(params) => {
                                        console.log('Labour Report Grid ready');
                                        setTimeout(() => autoSizeAll(), 500);
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

// Summary Card Component
const SummaryCard = ({ theme, label, value, color, isTotal = false }) => {
    return (
        <div style={{
            padding: '1rem',
            borderRadius: '8px',
            background: theme === 'dark' ? '#1e293b' : '#ffffff',
            border: isTotal 
                ? `2px solid ${color}`
                : theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
            boxShadow: isTotal ? `0 4px 12px ${color}33` : '0 2px 4px rgba(0,0,0,0.05)',
            transition: 'transform 0.2s, box-shadow 0.2s'
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
                fontSize: '0.8rem',
                fontWeight: '600',
                color: theme === 'dark' ? '#94a3b8' : '#64748b',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
            }}>
                {label}
            </div>
            <div style={{
                fontSize: isTotal ? '1.5rem' : '1.25rem',
                fontWeight: '700',
                color: color
            }}>
                ₹ {value.toLocaleString('en-IN')}
            </div>
        </div>
    );
};

export default LabourReportGrid;