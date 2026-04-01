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

const FPDataConsolidatedReport = () => {
    const [theme, setTheme] = useState('light');
    const [rowData, setRowData] = useState([]);

    const [isFullScreen, setIsFullScreen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [financialYear, setFinancialYear] = useState('25-26');
    const [financialYearOptions, setFinancialYearOptions] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [toasts, setToasts] = useState([]);
    const [activeTab, setActiveTab] = useState('SUMMARY'); 
    // Date filter states
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    
    const gridRef = useRef();
    const REPORT_APIS = {
        SUMMARY: {
            list: 'get_fileList_summary_report.php',
            detail: 'get_summary_report.php'
        },
        CONSOLIDATED: {
            list: 'get_summary_report_details_23.php',
         //   detail: 'get_consolidated_report.php'
        }
    };
    const showToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };
    useEffect(() => {
        fetchFinancialYears();
    }, []);
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
        if (params.value == null || params.value === '') return '₹ 0';
        const numValue = parseFloat(params.value);
        if (isNaN(numValue)) return '₹ 0';
        return '₹ ' + numValue.toLocaleString('en-IN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    };

    // Weight formatter
    const weightFormatter = (params) => {
        if (params.value == null || params.value === '' || params.value === '0') return '-';
        return params.value;
    };

    const columnDefs = [
        {
            headerName: "File No",
            field: "FILE_NAME",
            pinned: "left",
            minWidth: 140,
            floatingFilter: false,
            cellClassRules: {
                'selected-row': params => params.data?.isSelected
            },
            onCellClicked: async (params) => {

                // ❌ Do nothing on second tab
                if (activeTab !== 'SUMMARY') {
                    return;
                }
            
                try {
                    params.api.showLoadingOverlay();
            
                    const res = await fetch(
                        `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/summary_report/${REPORT_APIS.SUMMARY.detail}`,
                        {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                            body: new URLSearchParams({
                                split_FILEID: params.data.fileID
                            })
                        }
                    );
            
                    const result = await res.json();
            
                    if (!Array.isArray(result) || result.length === 0) {
                        params.api.hideOverlay();
                        return;
                    }
            
                    const d = result[0];
            
                    setRowData(prev =>
                        prev.map(row =>
                            row.fileID === params.data.fileID
                                ? {
                                    ...row,
                                    consume: Number(d.consume || 0),
                                    vendor: Number(d.vendor || 0),
                                    Hardware: Number(d.Hardware || 0),
                                    ele: Number(d.ele || 0),
                                    ass: Number(d.ass || 0),
                                    req: Number(d.req || 0),
                                    rfd: Number(d.rfd || 0),
                                    smfiles: Number(d.smfiles || 0),
                                    nonDc: Number(d.nonDc || 0),
                                    total: Number(d.total || 0),
                                    isSelected: true
                                }
                                : row
                        )
                    );
            
                    params.api.hideOverlay();
                } catch (err) {
                    console.error(err);
                    params.api.hideOverlay();
                }
            }
            
        },
    
        {
            headerName: "Raw Consumption (SHM/FAB/FDN)",
            field: "consume",
            floatingFilter: false,
            valueFormatter: currencyFormatter,
            cellClass: "rag_last",
            headerClass: "head_last"
        },
        {
            headerName: "Other Vendor",
            field: "vendor",
            floatingFilter: false,
            valueFormatter: currencyFormatter,
            cellClass: "rag_last",
            headerClass: "head_last"
        },
        {
            headerName: "Hardware",
            field: "Hardware",
            floatingFilter: false,
            valueFormatter: currencyFormatter,
            cellClass: "rag_last",
            headerClass: "head_last"
        },
        {
            headerName: "Electrical",
            field: "ele",
            floatingFilter: false,
            valueFormatter: currencyFormatter,
            cellClass: "rag_last",
            headerClass: "head_last"
        },
        {
            headerName: "Assembly",
            field: "ass",
            floatingFilter: false,
            valueFormatter: currencyFormatter,
            cellClass: "rag_last",
            headerClass: "head_last"
        },
        {
            headerName: "Requisition Outward",
            field: "req",
            floatingFilter: false,
            valueFormatter: currencyFormatter,
            cellClass: "rag_last",
            headerClass: "head_last"
        },
        {
            headerName: "RFD Assigned",
            field: "rfd",
            floatingFilter: false,
            valueFormatter: currencyFormatter,
            cellClass: "rag_last",
            headerClass: "head_last"
        },
        {
            headerName: "Non DC Material",
            field: "nonDc",
            floatingFilter: false,
            valueFormatter: currencyFormatter,
            cellClass: "rag_last",
            headerClass: "head_last"
        },
        {
            headerName: "SM Files",
            field: "smfiles",
            floatingFilter: false,
            valueFormatter: currencyFormatter,
            cellClass: "rag_last",
            headerClass: "head_last"
        },
        {
            headerName: "Total",
            field: "total",
            floatingFilter: false,
            valueFormatter: currencyFormatter,
            pinned: "right",
            cellClass: "head-no_of_person",
            headerClass: "head-no_of_person"
        },
    
        {
            headerName: "Action",
            pinned: "right",
            width: 120,
            suppressMenu: true,
            sortable: false,
            filter: false,
            hide: activeTab !== 'SUMMARY',  
            cellRenderer: (params) => (
                <button
                    className="btn-save"
                    onClick={() => saveRow(params.data)}
                    style={{
                        padding: '4px 10px',
                        fontSize: '12px',
                        cursor: 'pointer'
                    }}
                >
                    Save
                </button>
            )
        }
    ];
    
    const defaultColDef = useMemo(() => ({
        filter: true,
        sortable: true,
        floatingFilter: false,  
        resizable: true,
        suppressMenu: isMobile,
        cellStyle: { textAlign: 'left' ,  cursor: activeTab === 'SUMMARY' ? 'pointer' : 'default'}
    }), [isMobile]);

    const fetchReportData = async () => {
        const api = REPORT_APIS[activeTab].list;
    
        const res = await fetch(
            `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/summary_report/${api}?financial_year=${financialYear}`
        );
    
        const data = await res.json();
        setRowData(Array.isArray(data) ? data : []);
    };
    
    

    const formatCurrency = (value) =>
    `₹ ${Number(value || 0).toLocaleString('en-IN')}`;

    // Auto-load data when financial year is set
    useEffect(() => {
        if (financialYear) {
            fetchReportData();
        }
    }, [activeTab, financialYear]);

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

        fetchReportData(financialYear, fromDate, toDate);
    };
//    const getPinnedBottomRowData = () => {
//     return [{
//         FILE_NAME: 'TOTAL',
//         consume: rowData.reduce((s, r) => s + Number(r.consume || 0), 0),
//         vendor: rowData.reduce((s, r) => s + Number(r.vendor || 0), 0),
//         Hardware: rowData.reduce((s, r) => s + Number(r.Hardware || 0), 0),
//         ele: rowData.reduce((s, r) => s + Number(r.ele || 0), 0),
//         ass: rowData.reduce((s, r) => s + Number(r.ass || 0), 0),
//         req: rowData.reduce((s, r) => s + Number(r.req || 0), 0),
//         rfd: rowData.reduce((s, r) => s + Number(r.rfd || 0), 0),
//         smfiles: rowData.reduce((s, r) => s + Number(r.smfiles || 0), 0),
//         nonDc: rowData.reduce((s, r) => s + Number(r.nonDc || 0), 0),
//         total: rowData.reduce((s, r) => s + Number(r.total || 0), 0),
//     }];
// };

    // const totalRow = useMemo(() => {
    //     return getPinnedBottomRowData()[0] || {};
    // }, [rowData]);
    const handleClearDates = () => {
        setFromDate('');
        setToDate('');
        fetchReportData(financialYear, '', '');
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
                fileName: `FPDataConsolidatedReport_${financialYear}_${new Date().toISOString().split('T')[0]}.csv`,
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
            const columns = gridRef.current.api.getAllDisplayedColumns();
    
            if (!columns || columns.length === 0) return;
    
            const colIds = columns.map(col => col.getId());
    
            gridRef.current.api.autoSizeColumns(colIds, false);
        } catch (err) {
            console.warn('Auto-size skipped:', err);
        }
    };
    
    

    const refreshData = () => {
        fetchReportData(financialYear, fromDate, toDate);
    };
    const saveRow = async (row) => {
        const res = await fetch('https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/summary_report/saveSummaryReportData_23.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                file_id: row.fileID,
                nonDc: row.nonDc,
                req: row.req,
                ass: row.ass,
                ele: row.ele,
                Hardware: row.Hardware,
                vendor: row.vendor,
                consume: row.consume,
                smfiles: row.smfiles,
                total: row.total,
                rfd: row.rfd
            })
        });
    
        alert(await res.text());
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
            cardHeader: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)'
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
                    <p style={{ marginTop: '1rem', fontWeight: '600' }}>Loading All consumptionReport...</p>
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
                                    📋 All consumption Report
                                </h4>
                                <small style={{ opacity: 0.8, display: 'block', marginTop: '0.5rem', fontSize: '0.95rem' }}>
                                    {totalCount} records
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
                            {/* <div>
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
                            </div> */}

                            {/* To Date */}
                            {/* <div>
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
                            </div> */}

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

                    <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
    <button
        onClick={() => setActiveTab('SUMMARY')}
        style={{
            padding: '8px 16px',
            fontWeight: 600,
            borderRadius: '6px',
            border: 'none',
            background: activeTab === 'SUMMARY' ? '#2563eb' : '#e5e7eb',
            color: activeTab === 'SUMMARY' ? '#fff' : '#000'
        }}
    >
        Summary Report
    </button>

    <button
        onClick={() => setActiveTab('CONSOLIDATED')}
        style={{
            padding: '8px 16px',
            fontWeight: 600,
            borderRadius: '6px',
            border: 'none',
            background: activeTab === 'CONSOLIDATED' ? '#2563eb' : '#e5e7eb',
            color: activeTab === 'CONSOLIDATED' ? '#fff' : '#000'
        }}
    >
        Consolidated Report
    </button>
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
                                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📋</div>
                                <h5 style={{ marginBottom: '10px', fontSize: '1.25rem' }}>No data available</h5>
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
                                        gridRef.current = params.api;
                                        setTimeout(() => {
                                            autoSizeAll();
                                        }, 0);
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


export default FPDataConsolidatedReport;