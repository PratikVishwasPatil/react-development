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

const StockAssignedReportGrid = () => {
    const [theme, setTheme] = useState('light');
    const [rowData, setRowData] = useState([]);
    const [columnDefs, setColumnDefs] = useState([]);
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [financialYear, setFinancialYear] = useState('25-26');
    const [financialYearOptions, setFinancialYearOptions] = useState([]);
    const [toasts, setToasts] = useState([]);
    const [pageSize, setPageSize] = useState(10);
    
    // Statistics
    const [totalCount, setTotalCount] = useState(0);
    const [totalWeight, setTotalWeight] = useState(0);
    const [totalRate, setTotalRate] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [totalAssignQty, setTotalAssignQty] = useState(0);
    
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

    // Number formatter
    const numberFormatter = (params) => {
        if (params.value == null || params.value === '') return '';
        return parseFloat(params.value).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    // Currency formatter
    const currencyFormatter = (params) => {
        if (params.value == null || params.value === '') return '';
        return '₹ ' + parseFloat(params.value).toLocaleString('en-IN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    };

    const generateColumnDefs = () => {
        const baseColumns = [
            {
                headerName: "Count",
                field: "count",
                width: 100,
                minWidth: 80,
                pinned: 'left',
                lockPosition: true,
                cellStyle: { 
                    fontWeight: 'bold', 
                    textAlign: 'center',
                    backgroundColor: '#fff4e6'
                },
                checkboxSelection: true,
                headerCheckboxSelection: true
            },
            {
                field: "file_name",
                headerName: "File",
                width: 200,
                minWidth: 160,
                pinned: 'left',
                cellStyle: { fontWeight: '700', color: '#2563eb' },
                filter: 'agTextColumnFilter'
            },
            {
                field: "id",
                headerName: "Material ID",
                width: 130,
                minWidth: 100,
                cellStyle: { 
                    textAlign: 'center', 
                    fontWeight: '600',
                    backgroundColor: '#fef3c7'
                },
                filter: 'agTextColumnFilter'
            },
            {
                field: "materailName",
                headerName: "Material Description",
                width: 320,
                minWidth: 250,
                cellStyle: { fontWeight: '600', color: '#0f172a' },
                filter: 'agTextColumnFilter',
                tooltipField: 'materailName'
            },
            {
                field: "unitName",
                headerName: "Unit",
                width: 100,
                minWidth: 80,
                cellStyle: { textAlign: 'center', fontWeight: '600' },
                filter: 'agTextColumnFilter'
            },
            {
                field: "Qty",
                headerName: "Assign. Qty.",
                width: 130,
                minWidth: 100,
                valueFormatter: (params) => {
                    if (params.value == null || params.value === '') return '0';
                    return parseFloat(params.value).toLocaleString('en-IN');
                },
                cellStyle: { 
                    textAlign: 'right', 
                    fontWeight: '700',
                    color: '#7c3aed',
                    backgroundColor: '#faf5ff'
                },
                type: 'numericColumn',
                filter: 'agNumberColumnFilter'
            },
            {
                field: "weight_kg",
                headerName: "Weight",
                width: 120,
                minWidth: 100,
                valueFormatter: numberFormatter,
                cellStyle: { 
                    textAlign: 'right', 
                    fontWeight: '600',
                    color: '#059669'
                },
                type: 'numericColumn',
                filter: 'agNumberColumnFilter'
            },
            {
                field: "rate",
                headerName: "Rate",
                width: 120,
                minWidth: 100,
                valueFormatter: numberFormatter,
                cellStyle: { 
                    textAlign: 'right', 
                    fontWeight: '600',
                    color: '#dc2626'
                },
                type: 'numericColumn',
                filter: 'agNumberColumnFilter'
            },
            {
                field: "basic_amt",
                headerName: "Total",
                width: 150,
                minWidth: 120,
                valueFormatter: currencyFormatter,
                cellStyle: { 
                    textAlign: 'right', 
                    fontWeight: '700',
                    backgroundColor: '#dcfce7',
                    color: '#166534',
                    fontSize: '1.05rem'
                },
                type: 'numericColumn',
                filter: 'agNumberColumnFilter',
                pinned: isMobile ? null : 'right'
            },
            {
                field: "calc",
                headerName: "Calculation as per",
                width: 280,
                minWidth: 220,
                cellStyle: { 
                    textAlign: 'left',
                    fontWeight: '500',
                    color: '#64748b',
                    fontSize: '0.85rem'
                },
                filter: 'agTextColumnFilter',
                tooltipField: 'calc'
            }
        ];

        return baseColumns;
    };

    const defaultColDef = useMemo(() => ({
        sortable: true,
        floatingFilter: !isMobile,
        resizable: true,
        suppressMenu: isMobile,
        cellStyle: { textAlign: 'left' }
    }), [isMobile]);

    const fetchStockAssignedData = async (fy = financialYear) => {
        if (!fy) {
            showToast('Please select a financial year', 'error');
            return;
        }

        setLoading(true);
        try {
            const url = `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/summary_report/stock_assigned_reportApi.php?financial_year=${fy}`;
            
            console.log('Fetching from:', url);
            
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('API Response:', result);

            if (result.success && Array.isArray(result.data)) {
                setRowData(result.data);
                
                // Calculate totals
                const totals = calculateTotals(result.data);
                setTotalCount(result.data.length);
                setTotalAssignQty(totals.qty);
                setTotalWeight(totals.weight);
                setTotalRate(totals.rate);
                setTotalAmount(totals.basic_amt);
                
                showToast(`Loaded ${result.data.length} records for FY ${fy}`, 'success');
            } else {
                throw new Error(result.message || "Failed to fetch stock assigned data");
            }
        } catch (error) {
            console.error("Error fetching stock assigned data:", error);
            showToast(`Error fetching data: ${error.message}`, 'error');
            setRowData([]);
            setTotalCount(0);
            setTotalAssignQty(0);
            setTotalWeight(0);
            setTotalRate(0);
            setTotalAmount(0);
        } finally {
            setLoading(false);
        }
    };

    const calculateTotals = (data) => {
        return data.reduce((acc, row) => {
            acc.qty += parseFloat(row.Qty) || 0;
            acc.weight += parseFloat(row.weight_kg) || 0;
            acc.rate += parseFloat(row.rate) || 0;
            acc.basic_amt += parseFloat(row.basic_amt) || 0;
            return acc;
        }, {
            qty: 0,
            weight: 0,
            rate: 0,
            basic_amt: 0
        });
    };

    useEffect(() => {
        setColumnDefs(generateColumnDefs());
        fetchFinancialYears();
    }, [isMobile]);

    // Auto-load data when financial year is set
    useEffect(() => {
        if (financialYear) {
            fetchStockAssignedData();
        }
    }, [financialYear]);

    const handleFinancialYearChange = (e) => {
        const newFY = e.target.value;
        setFinancialYear(newFY);
    };

    const handlePageSizeChange = (e) => {
        const newSize = parseInt(e.target.value);
        setPageSize(newSize);
        if (gridRef.current?.api) {
            gridRef.current.api.paginationSetPageSize(newSize);
        }
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
                fileName: `StockAssignedReport_${financialYear}_${new Date().toISOString().split('T')[0]}.csv`,
                allColumns: true,
                onlySelected: false
            };
            gridRef.current.api.exportDataAsCsv(params);
            showToast('Excel format exported as CSV successfully!', 'success');
        } catch (error) {
            console.error('Error exporting data:', error);
            showToast('Error exporting data', 'error');
        }
    };

    const downloadCSV = () => {
        if (!gridRef.current?.api) return;
        
        try {
            const params = {
                fileName: `StockAssignedReport_${financialYear}_${new Date().toISOString().split('T')[0]}.csv`,
                allColumns: true,
                onlySelected: false
            };
            gridRef.current.api.exportDataAsCsv(params);
            showToast('CSV exported successfully!', 'success');
        } catch (error) {
            console.error('Error exporting CSV:', error);
            showToast('Error exporting CSV', 'error');
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

    const autoSizeAllSkipHeader = () => {
        if (!gridRef.current?.api) return;
        
        try {
            setTimeout(() => {
                const allColumnIds = gridRef.current.api.getColumns()?.map(column => column.getId()) || [];
                if (allColumnIds.length > 0) {
                    gridRef.current.api.autoSizeColumns(allColumnIds, true);
                }
            }, 100);
        } catch (error) {
            console.error('Error auto-sizing columns:', error);
        }
    };

    const sizeToFit = () => {
        if (!gridRef.current?.api) return;
        
        try {
            gridRef.current.api.sizeColumnsToFit();
        } catch (error) {
            console.error('Error sizing to fit:', error);
        }
    };

    const clearPinned = () => {
        if (!gridRef.current?.api) return;
        
        try {
            const updatedColumnDefs = columnDefs.map(col => {
                if (col.field !== 'count' && col.field !== 'file_name') {
                    return { ...col, pinned: null };
                }
                return col;
            });
            setColumnDefs(updatedColumnDefs);
            showToast('Pinned columns cleared', 'success');
        } catch (error) {
            console.error('Error clearing pinned columns:', error);
        }
    };

    const setPinned = () => {
        if (!gridRef.current?.api) return;
        
        try {
            setColumnDefs(generateColumnDefs());
            showToast('Columns pinned', 'success');
        } catch (error) {
            console.error('Error setting pinned columns:', error);
        }
    };

    const refreshData = () => {
        fetchStockAssignedData(financialYear);
    };

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
            cardHeader: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'
        };
    };

    const themeStyles = getThemeStyles();
    const gridHeight = isFullScreen ? 'calc(100vh - 320px)' : (isMobile ? '400px' : '600px');

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
                    <p style={{ marginTop: '1rem', fontWeight: '600' }}>Loading stock assigned data...</p>
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
                maxWidth: isFullScreen ? '100%' : '1600px',
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
                        borderBottom: theme === 'dark' ? '1px solid #334155' : '1px solid #f59e0b'
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
                                    📦 Stock Assigned Report
                                </h4>
                                <small style={{ opacity: 0.8, display: 'block', marginTop: '0.5rem', fontSize: '0.95rem' }}>
                                    {totalCount} records | Total Amount: ₹ {totalAmount.toLocaleString('en-IN')}
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

                    {/* Toolbar Section */}
                    <div style={{
                        padding: '1rem 2rem',
                        background: theme === 'dark' ? '#0f172a' : '#fffbeb',
                        borderBottom: theme === 'dark' ? '1px solid #334155' : '1px solid #fbbf24',
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: '1rem',
                        alignItems: isMobile ? 'stretch' : 'center',
                        justifyContent: 'space-between'
                    }}>
                        {/* Left Side - Filters */}
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    fontSize: '0.9rem',
                                    color: theme === 'dark' ? '#f1f5f9' : '#0f172a'
                                }}>
                                    Financial Year
                                </label>
                                <select
                                    value={financialYear}
                                    onChange={handleFinancialYearChange}
                                    style={{
                                        padding: '0.625rem 0.875rem',
                                        fontSize: '0.95rem',
                                        borderRadius: '6px',
                                        border: theme === 'dark' ? '1px solid #334155' : '1px solid #fbbf24',
                                        backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                                        color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
                                        fontWeight: '600',
                                        outline: 'none',
                                        minWidth: '150px'
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

                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    fontSize: '0.9rem',
                                    color: theme === 'dark' ? '#f1f5f9' : '#0f172a'
                                }}>
                                    Page Size
                                </label>
                                <select
                                    value={pageSize}
                                    onChange={handlePageSizeChange}
                                    style={{
                                        padding: '0.625rem 0.875rem',
                                        fontSize: '0.95rem',
                                        borderRadius: '6px',
                                        border: theme === 'dark' ? '1px solid #334155' : '1px solid #fbbf24',
                                        backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                                        color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
                                        fontWeight: '600',
                                        outline: 'none',
                                        minWidth: '100px'
                                    }}
                                >
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                    <option value="477">All (477)</option>
                                </select>
                            </div>
                        </div>

                        {/* Right Side - Action Buttons */}
                        <div style={{
                            display: 'flex',
                            gap: '0.5rem',
                            flexWrap: 'wrap'
                        }}>
                            <button
                                onClick={downloadExcel}
                                style={{
                                    padding: '0.625rem 1rem',
                                    fontSize: '0.9rem',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    boxShadow: '0 2px 8px rgba(249, 115, 22, 0.3)'
                                }}
                            >
                                📊 Download Excel Export
                            </button>

                            <button
                                onClick={downloadCSV}
                                style={{
                                    padding: '0.625rem 1rem',
                                    fontSize: '0.9rem',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                                }}
                            >
                                📄 Download CSV Export File
                            </button>

                            <button
                                onClick={clearPinned}
                                style={{
                                    padding: '0.625rem 1rem',
                                    fontSize: '0.9rem',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                Clear Pinned
                            </button>

                            <button
                                onClick={setPinned}
                                style={{
                                    padding: '0.625rem 1rem',
                                    fontSize: '0.9rem',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                Pinned
                            </button>

                            <button
                                onClick={sizeToFit}
                                style={{
                                    padding: '0.625rem 1rem',
                                    fontSize: '0.9rem',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                Size To Fit
                            </button>

                            <button
                                onClick={autoSizeAll}
                                style={{
                                    padding: '0.625rem 1rem',
                                    fontSize: '0.9rem',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                Auto-Size All
                            </button>

                            <button
                                onClick={autoSizeAllSkipHeader}
                                style={{
                                    padding: '0.625rem 1rem',
                                    fontSize: '0.9rem',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                Auto-Size All (Skip Header)
                            </button>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div style={{
                        padding: '1.5rem 2rem',
                        background: theme === 'dark' ? '#0f172a' : '#fffbeb',
                        borderBottom: theme === 'dark' ? '1px solid #334155' : '1px solid #fbbf24'
                    }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '1rem'
                        }}>
                            <SummaryCard 
                                theme={theme}
                                label="Total Records"
                                value={totalCount}
                                color="#2563eb"
                                isCount={true}
                            />
                            <SummaryCard 
                                theme={theme}
                                label="Total Assign Qty"
                                value={totalAssignQty}
                                color="#7c3aed"
                                isCount={true}
                            />
                            <SummaryCard 
                                theme={theme}
                                label="Total Weight"
                                value={totalWeight}
                                color="#059669"
                                isDecimal={true}
                            />
                            <SummaryCard 
                                theme={theme}
                                label="Total Rate"
                                value={totalRate}
                                color="#dc2626"
                                isDecimal={true}
                            />
                            <SummaryCard 
                                theme={theme}
                                label="Grand Total"
                                value={totalAmount}
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
                                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📦</div>
                                <h5 style={{ marginBottom: '10px', fontSize: '1.25rem' }}>No stock assigned data available</h5>
                                <p style={{ color: theme === 'dark' ? '#94a3b8' : '#64748b' }}>
                                    {!financialYear 
                                        ? 'Please select a financial year'
                                        : 'No data found for the selected financial year'}
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
                                    paginationPageSize={pageSize}
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
                                        console.log('Stock Assigned Report Grid ready');
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
const SummaryCard = ({ theme, label, value, color, isTotal = false, isCount = false, isDecimal = false }) => {
    const formatValue = () => {
        if (isCount) {
            return value.toLocaleString('en-IN');
        } else if (isDecimal) {
            return value.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        } else {
            return '₹ ' + value.toLocaleString('en-IN', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            });
        }
    };

    return (
        <div style={{
            padding: '1rem',
            borderRadius: '8px',
            background: theme === 'dark' ? '#1e293b' : '#ffffff',
            border: isTotal 
                ? `2px solid ${color}`
                : theme === 'dark' ? '1px solid #334155' : '1px solid #fbbf24',
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
                {formatValue()}
            </div>
        </div>
    );
};

export default StockAssignedReportGrid;