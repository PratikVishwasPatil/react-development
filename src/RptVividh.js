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
    const [columnDefs, setColumnDefs] = useState([]);
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);

    const [totalCount, setTotalCount] = useState(0);
    const [toasts, setToasts] = useState([]);
    
    // Date filter states
    // const [fromDate, setFromDate] = useState('');
    // const [toDate, setToDate] = useState('');
    
    const gridRef = useRef();

    const showToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };

    

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const currencyFormatter = params =>
    "₹ " + Number(params.value || 0).toLocaleString("en-IN");

    // Weight formatter
    const weightFormatter = (params) => {
        if (params.value == null || params.value === '' || params.value === '0') return '-';
        return params.value;
    };

    const generateColumnDefs = () => {
        return [
            {
                headerName: "ID",
                field: "id",
                pinned: "left",
                width: 80
            },
            {
                headerName: "File Name",
                field: "file_name",
                filter: true
            },
            {
                headerName: "Material Description",
                field: "material_description",
                filter: true
            },
            {
                headerName: "Category",
                field: "category",
                filter: true
            },
            {
                headerName: "Unit",
                field: "unit",
                width: 100
            },
            {
                headerName: "Design Qty",
                field: "material_quantity",
                cellClass: "ag-right-aligned-cell",
                valueFormatter: p => Number(p.value || 0).toLocaleString('en-IN')
            },
            {
                headerName: "Rate",
                field: "rate",
                cellClass: "ag-right-aligned-cell",
                valueFormatter: p => Number(p.value || 0).toLocaleString('en-IN')
            },
            {
                headerName: "Requested Qty",
                field: "qty",
                cellClass: "ag-right-aligned-cell",
                valueFormatter: p => Number(p.value || 0).toLocaleString('en-IN')
            },
            {
                headerName: "Total Amount",
                field: "total_amount",
                cellClass: "ag-right-aligned-cell",
                valueFormatter: p => "₹ " + Number(p.value || 0).toLocaleString('en-IN')
            }
        ];
    };
    const filterParams = {
        comparator: (filterLocalDateAtMidnight, cellValue) => {
            if (!cellValue) return -1;
    
            // Expected format: "01-March-2026"
            const parts = cellValue.split('-');
            if (parts.length !== 3) return -1;
    
            const day = parseInt(parts[0], 10);
            const monthName = parts[1];
            const year = parseInt(parts[2], 10);
    
            // Convert month name to month index
            const monthMap = {
                January: 0,
                February: 1,
                March: 2,
                April: 3,
                May: 4,
                June: 5,
                July: 6,
                August: 7,
                September: 8,
                October: 9,
                November: 10,
                December: 11
            };
    
            const month = monthMap[monthName];
            if (month === undefined) return -1;
    
            const cellDate = new Date(year, month, day);
    
            if (cellDate < filterLocalDateAtMidnight) return -1;
            if (cellDate > filterLocalDateAtMidnight) return 1;
            return 0;
        },
    
        browserDatePicker: true,
        minValidYear: 2000,
        maxValidYear: 2100,
        inRangeFloatingFilterDateFormat: 'DD-MMMM-YYYY'
    };
    const defaultColDef = useMemo(() => ({
        filter: true,
        sortable: true,
        floatingFilter: !isMobile,
        resizable: true,
        suppressMenu: isMobile,
        cellStyle: { textAlign: 'left' }
    }), [isMobile]);

    const fetchReportData = async () => {
        setLoading(true);
        gridRef.current?.api?.showLoadingOverlay();
    
        try {
            const url = `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Report/get_vividh_report.php`;
    
            const response = await fetch(url);
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const data = await response.json();
    
            if (Array.isArray(data)) {
                setRowData(data);
                setTotalCount(data.length);
                showToast(`Loaded ${data.length} records`, 'success');
            } else {
                throw new Error('Invalid API response');
            }
        } catch (error) {
            console.error(error);
            showToast(`Error fetching data: ${error.message}`, 'error');
            setRowData([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setColumnDefs(generateColumnDefs());
      
    }, [isMobile]);

   // Auto-load data when financial year is set
    useEffect(() => {
        fetchReportData();
    }, []);


    const summaryConfig = [
        { label: "Advance", key: "Advance", color: "#64748b" },
        { label: "Total Wages", key: "Total Wages", color: "#16a34a", isTotal: true },
        { label: "8 Hrs Wages", key: "Wages_8_hours", color: "#0284c7" },
        { label: "OT Charges", key: "OT_Charges", color: "#dc2626" },
        { label: "Incentive", key: "Incentive", color: "#f97316" },
        { label: "Travelling", key: "Travelling", color: "#7c3aed" },
        { label: "Lodging", key: "Lodging", color: "#0d9488" },
        { label: "Daily Allowance", key: "Daily_allowence", color: "#eab308" },
        { label: "Local Travel", key: "Local_travel", color: "#8b5cf6" },
        { label: "Purchase", key: "Purchase", color: "#ea580c" },
        { label: "Grand Total", key: "total", color: "#059669", isTotal: true }
      ];
      const summaryTotals = useMemo(() => {
        return summaryConfig.reduce((acc, item) => {
          acc[item.key] = rowData.reduce(
            (sum, row) => sum + Number(row?.[item.key] || 0),
            0
          );
          return acc;
        }, {});
      }, [rowData])
      const indianCurrencyFormatter = params => {
        const value = Number(params.value || 0);
        return value.toLocaleString('en-IN');
      };

      const columnTypes = useMemo(() => ({
      
        indianCurrency: {
          valueFormatter: indianCurrencyFormatter,
          cellStyle: {
            textAlign: 'right',
            fontWeight: '600'
          },
          filter: 'agNumberColumnFilter'
        }
      }), []);
    //   const handleSubmit = () => {
    //     if (!fromDate || !toDate) {
    //         showToast("Please select both dates", "error");
    //         return;
    //     }
    
    //     fetchReportData(fromDate, toDate);
    // };

    // const handleClearDates = () => {
    //     setFromDate('');
    //     setToDate('');
    //     setRowData([]);   // ✅ clear grid
    //     setTotalCount(0);
    // };
    const getPinnedBottomRow = () => {
        if (!rowData.length) return [];
    
        const totals = rowData.reduce((acc, row) => {
            acc.material_quantity += Number(row.material_quantity || 0);
          //  acc.rate += Number(row.rate || 0); // optional (usually not summed)
            acc.qty += Number(row.qty || 0);
            acc.total_amount += Number(row.total_amount || 0);
    
            return acc;
        }, {
            material_quantity: 0,
            rate: 0,
            qty: 0,
            total_amount: 0
        });
    
        return [{
            file_name: 'TOTAL',   // 👈 match column field
            material_description: '',
            category: '',
            unit: '',
    
            ...totals
        }];
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
                fileName: `weekly-expense-total-summary-report_.csv`,
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
        fetchReportData();
    };

    // Calculate column totals
    const calculateTotals = () => {
        if (rowData.length === 0) {
            return {
                R_F_COST: 0,
                FAB_COST: 0,
                ShM_Ext_COST: 0,
                PC_Ext_COST: 0,
                ShM_SUP_COST: 0,
                PC_SUP_COST: 0,
                NUT_BOLT_COST: 0,
                DRIVE_COST: 0,
                ELE_COST: 0,
                M_DAY_COST: 0,
                TRANSPORT_COST: 0,
                LABOUR_COST: 0,
                SYS_COST: 0,
                TOTAL_COST: 0
            };
        }

        return rowData.reduce((acc, row) => {
            acc.R_F_COST += parseFloat(row.R_F_COST || 0);
            acc.FAB_COST += parseFloat(row.FAB_COST || 0);
            acc.ShM_Ext_COST += parseFloat(row.ShM_Ext_COST || 0);
            acc.PC_Ext_COST += parseFloat(row.PC_Ext_COST || 0);
            acc.ShM_SUP_COST += parseFloat(row.ShM_SUP_COST || 0);
            acc.PC_SUP_COST += parseFloat(row.PC_SUP_COST || 0);
            acc.NUT_BOLT_COST += parseFloat(row.NUT_BOLT_COST || 0);
            acc.DRIVE_COST += parseFloat(row.DRIVE_COST || 0);
            acc.ELE_COST += parseFloat(row.ELE_COST || 0);
            acc.M_DAY_COST += parseFloat(row.M_DAY_COST || 0);
            acc.TRANSPORT_COST += parseFloat(row.TRANSPORT_COST || 0);
            acc.LABOUR_COST += parseFloat(row.LABOUR_COST || 0);
            acc.SYS_COST += parseFloat(row.SYS_COST || 0);
            acc.TOTAL_COST += parseFloat(row.TOTAL_COST || 0);
            return acc;
        }, {
            R_F_COST: 0,
            FAB_COST: 0,
            ShM_Ext_COST: 0,
            PC_Ext_COST: 0,
            ShM_SUP_COST: 0,
            PC_SUP_COST: 0,
            NUT_BOLT_COST: 0,
            DRIVE_COST: 0,
            ELE_COST: 0,
            M_DAY_COST: 0,
            TRANSPORT_COST: 0,
            LABOUR_COST: 0,
            SYS_COST: 0,
            TOTAL_COST: 0
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
                    <p style={{ marginTop: '1rem', fontWeight: '600' }}>Loading Vividh Report...</p>
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
                                    📋 Vividh Report
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
                    
{/* Filters Section */}
{/* <div style={{
    padding: '12px 20px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    alignItems: 'center',
    borderBottom: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
    background: theme === 'dark' ? '#0f172a' : '#f8fafc'
}}>
    <label style={{ fontWeight: 600 }}>From Date:</label>
    <input
        type="date"
        value={fromDate}
        onChange={(e) => setFromDate(e.target.value)}
        style={{
            padding: '6px 10px',
            borderRadius: '6px',
            border: '1px solid #cbd5f5'
        }}
    />

    <label style={{ fontWeight: 600 }}>To Date:</label>
    <input
        type="date"
        value={toDate}
        onChange={(e) => setToDate(e.target.value)}
        style={{
            padding: '6px 10px',
            borderRadius: '6px',
            border: '1px solid #cbd5f5'
        }}
    />

    <button
        onClick={handleSubmit}
        style={{
            padding: '6px 14px',
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: 'pointer'
        }}
    >
        Apply
    </button>

    <button
        onClick={handleClearDates}
        style={{
            padding: '6px 14px',
            background: '#64748b',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: 'pointer'
        }}
    >
        Clear
    </button>
</div> */}
                 


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
                                    columnTypes={columnTypes}  
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
                                    pinnedBottomRowData={getPinnedBottomRow()}
                                    onGridReady={(params) => {
                                        console.log('FP Data Report Grid ready');
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
            padding: '0.75rem',
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
                fontSize: '0.7rem',
                fontWeight: '600',
                color: theme === 'dark' ? '#94a3b8' : '#64748b',
                marginBottom: '0.4rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
            }}>
                {label}
            </div>
            <div style={{
                fontSize: isTotal ? '1.25rem' : '1rem',
                fontWeight: '700',
                color: color
            }}>
                ₹ {value.toLocaleString('en-IN')}
            </div>
        </div>
    );
};

export default FPDataConsolidatedReport;