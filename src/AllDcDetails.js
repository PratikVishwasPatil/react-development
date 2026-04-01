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

const ConsolidatedDCReport = () => {
    const [theme, setTheme] = useState('light');
    const [reportData, setReportData] = useState([]);
    const [years, setYears] = useState([]);
    const [selectedYear, setSelectedYear] = useState('25-26');
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const gridRef = useRef();

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // API URLs
    const REPORT_API_URL = "http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/get_consolidateddcreportApi.php";
    const YEARS_API_URL = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/GetYearsApi.php";

    // Fetch years data
    const fetchYears = async () => {
        try {
            const response = await fetch(YEARS_API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.status === "success" && data.data) {
                const sortedYears = data.data
                    .sort((a, b) => parseInt(a.sequence_no) - parseInt(b.sequence_no))
                    .map(year => ({
                        value: year.financial_year,
                        label: `20${year.financial_year}`
                    }));
                
                setYears(sortedYears);

                if (sortedYears.length > 0) {
                    const latestYear = sortedYears[sortedYears.length - 1].value;
                    if (!sortedYears.find(y => y.value === selectedYear)) {
                        setSelectedYear(latestYear);
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching years:", error);
            showToast(`Error fetching years: ${error.message}`, 'error');
        }
    };

    // Fetch report data
    const fetchReportData = async (financialYear) => {
        setLoading(true);
        try {
            const response = await fetch(`${REPORT_API_URL}?financial_year=${financialYear}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.status && data.data) {
                setReportData(data.data);
                showToast(`Loaded ${data.total || data.data.length} records for FY ${financialYear}`, 'success');
            } else {
                throw new Error("No data received");
            }
        } catch (error) {
            console.error("Error fetching report data:", error);
            showToast(`Error fetching report data: ${error.message}`, 'error');
            setReportData([]);
        } finally {
            setLoading(false);
        }
    };

    // Simple toast notification
    const showToast = (message, type = 'info') => {
        const toastEl = document.createElement('div');
        toastEl.className = `toast-notification toast-${type}`;
        toastEl.textContent = message;
        toastEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            background: ${type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#17a2b8'};
            color: white;
            border-radius: 4px;
            z-index: 9999;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            animation: slideIn 0.3s ease-out;
        `;
        document.body.appendChild(toastEl);
        setTimeout(() => {
            toastEl.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => document.body.removeChild(toastEl), 300);
        }, 3000);
    };

    // Load years on mount
    useEffect(() => {
        fetchYears();
    }, []);

    // Load data when year changes
    useEffect(() => {
        if (selectedYear) {
            fetchReportData(selectedYear);
        }
    }, [selectedYear]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    // Handle selection changed
    const onSelectionChanged = (event) => {
        const selectedNodes = event.api.getSelectedNodes();
        const selectedData = selectedNodes.map(node => node.data);
        setSelectedRows(selectedData);
    };

    // Theme styles
    const getThemeStyles = () => {
        if (theme === 'dark') {
            return {
                backgroundColor: 'linear-gradient(135deg, #21262d 0%, #161b22 100%)',
                color: '#f8f9fa',
                cardBg: '#343a40',
                cardHeader: 'linear-gradient(135deg, #495057 0%, #343a40 100%)',
                inputBg: '#495057',
                inputBorder: '#6c757d',
                inputColor: '#fff'
            };
        }
        return {
            backgroundColor: 'linear-gradient(135deg, #f8f9ff 0%, #e6f3ff 100%)',
            color: '#212529',
            cardBg: '#ffffff',
            cardHeader: 'linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%)',
            inputBg: '#ffffff',
            inputBorder: '#ced4da',
            inputColor: '#212529'
        };
    };

    const themeStyles = getThemeStyles();

    // Apply theme to document body
    useEffect(() => {
        document.body.style.background = themeStyles.backgroundColor;
        document.body.style.color = themeStyles.color;
        document.body.style.minHeight = '100vh';

        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);

        return () => {
            document.body.style.background = '';
            document.body.style.color = '';
            document.body.style.minHeight = '';
            document.head.removeChild(style);
        };
    }, [theme]);

    // Format currency
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value || 0);
    };

    // AG Grid column definitions
    const columnDefs = useMemo(() => [
        {
            headerName: "Sr No",
            field: "count",
            width: isMobile ? 60 : 80,
            minWidth: 50,
            pinned: 'left',
            lockPosition: true,
            cellStyle: { fontWeight: 'bold', textAlign: 'right' }
        },
        {
            headerName: "DC Number",
            field: "dc_number",
            filter: "agTextColumnFilter",
            sortable: true,
            width: isMobile ? 100 : 120,
            pinned: 'left',
            checkboxSelection: false,
            headerCheckboxSelection: false,
            cellStyle: { fontWeight: 'bold' }
        },
        {
            headerName: "DC ID",
            field: "dc_id",
            filter: "agTextColumnFilter",
            sortable: true,
            width: 120
        },
        {
            headerName: "DC Date",
            field: "dc_date",
            filter: "agTextColumnFilter",
            sortable: true,
            width: 130
        },
        {
            headerName: "File Name",
            field: "FILE_NAME",
            filter: "agTextColumnFilter",
            sortable: true,
            width: 200,
            cellStyle: { fontWeight: 'bold' }
        },
        {
            headerName: "Customer Name",
            field: "CUSTOMER_NAME",
            filter: "agTextColumnFilter",
            sortable: true,
            width: 250
        },
        {
            headerName: "Material Name",
            field: "materialname",
            filter: "agTextColumnFilter",
            sortable: true,
            width: 300
        },
        {
            headerName: "Category",
            field: "materialcategoryname",
            filter: "agTextColumnFilter",
            sortable: true,
            width: 150,
            cellStyle: params => {
                const colors = {
                    'FABRICATION': { bg: '#e3f2fd', color: '#1565c0' },
                    'PAINT': { bg: '#f3e5f5', color: '#6a1b9a' },
                    'HARDWARE': { bg: '#e8f5e9', color: '#2e7d32' }
                };
                const style = colors[params.value] || { bg: '#fff3e0', color: '#e65100' };
                return { 
                    backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : style.bg,
                    color: theme === 'dark' ? '#fff' : style.color,
                    fontWeight: 'bold',
                    textAlign: 'right'
                };
            }
        },
        {
            headerName: "Unit",
            field: "materialunitname",
            filter: "agTextColumnFilter",
            sortable: true,
            width: 100,
            cellStyle: { textAlign: 'right' }
        },
        {
            headerName: "Weight",
            field: "weight",
            filter: "agNumberColumnFilter",
            sortable: true,
            width: 120,
            cellStyle: { textAlign: 'right', fontWeight: 'bold' },
            valueFormatter: params => params.value ? `${params.value} kg` : '-'
        },
        {
            headerName: "Quantity",
            field: "qty",
            filter: "agNumberColumnFilter",
            sortable: true,
            width: 120,
            cellStyle: { textAlign: 'right', fontWeight: 'bold' }
        },
        {
            headerName: "Approx Value",
            field: "approxvalue",
            filter: "agNumberColumnFilter",
            sortable: true,
            width: 150,
            cellStyle: { textAlign: 'right', fontWeight: 'bold', color: '#28a745' },
            valueFormatter: params => formatCurrency(params.value)
        }
    ], [isMobile, theme]);

    const defaultColDef = useMemo(() => ({
        resizable: true,
        sortable: true,
        filter: true,
        floatingFilter: !isMobile,
        suppressMenu: isMobile,
    }), [isMobile]);

    // Grid options with row styling
    const getRowStyle = params => {
        if (params.node.rowIndex % 2 === 0) {
            return { 
                backgroundColor: theme === 'dark' ? '#2c3034' : '#f8f9fa'
            };
        }
        return null;
    };

    const onGridReady = (params) => {
        console.log('Consolidated DC Report Grid is ready');
        setTimeout(() => autoSizeAll(), 500);
    };

    const handleExportCSV = () => {
        if (gridRef.current && gridRef.current.api) {
            gridRef.current.api.exportDataAsCsv({
                fileName: `Consolidated_DC_Report_${selectedYear}_${new Date().toISOString().split('T')[0]}.csv`
            });
            showToast('Data exported to CSV', 'success');
        }
    };

    const handleRefresh = () => {
        fetchReportData(selectedYear);
    };

    // Auto size columns
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

    const gridHeight = isFullScreen ? 'calc(100vh - 180px)' : (isMobile ? '400px' : '600px');

    if (loading && reportData.length === 0) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: themeStyles.backgroundColor
            }}>
                <div style={{ textAlign: 'right', color: themeStyles.color }}>
                    <div style={{ 
                        border: '4px solid rgba(0,0,0,0.1)',
                        borderTop: '4px solid #007bff',
                        borderRadius: '50%',
                        width: '3rem',
                        height: '3rem',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto'
                    }}></div>
                    <p style={{ marginTop: '1rem' }}>Loading report data...</p>
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
            <div style={{ 
                maxWidth: isFullScreen ? '100%' : '1400px',
                margin: '0 auto',
                padding: isFullScreen ? 0 : '20px'
            }}>
                <div style={{
                    backgroundColor: themeStyles.cardBg,
                    color: themeStyles.color,
                    border: theme === 'dark' ? '1px solid #495057' : '1px solid #dee2e6',
                    borderRadius: isFullScreen ? 0 : 8,
                    overflow: 'hidden'
                }}>
                    {/* Header */}
                    <div style={{
                        background: themeStyles.cardHeader,
                        color: theme === 'dark' ? '#ffffff' : '#000000',
                        fontFamily: "'Maven Pro', sans-serif",
                        padding: '1rem 2rem'
                    }}>
                        <div style={{ 
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            gap: '1rem'
                        }}>
                            <div style={{ flex: '1 1 300px' }}>
                                <h4 style={{ margin: 0, marginBottom: '0.25rem' }}>Consolidated DC Report</h4>
                                <small style={{ opacity: 0.8 }}>
                                    {`${reportData.length} records found for FY ${selectedYear}`}
                                    {selectedRows.length > 0 && ` | ${selectedRows.length} selected`}
                                </small>
                            </div>

                            <div style={{ 
                                display: 'flex',
                                gap: '0.5rem',
                                flexWrap: 'wrap',
                                alignItems: 'center'
                            }}>
                                {/* Financial Year Selector */}
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    style={{
                                        padding: '0.375rem 0.75rem',
                                        fontSize: '0.875rem',
                                        borderRadius: '0.25rem',
                                        border: '1px solid',
                                        minWidth: '120px',
                                        backgroundColor: themeStyles.inputBg,
                                        borderColor: themeStyles.inputBorder,
                                        color: themeStyles.inputColor
                                    }}
                                >
                                    {years.map(year => (
                                        <option key={year.value} value={year.value}>
                                            FY {year.label}
                                        </option>
                                    ))}
                                </select>

                                <button
                                    onClick={handleRefresh}
                                    disabled={loading}
                                    style={{
                                        padding: '0.375rem 0.75rem',
                                        fontSize: '0.875rem',
                                        borderRadius: '0.25rem',
                                        border: '1px solid rgba(255,255,255,0.3)',
                                        backgroundColor: 'transparent',
                                        color: theme === 'dark' ? '#fff' : '#000',
                                        cursor: loading ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    🔄 {!isMobile && 'Refresh'}
                                </button>
                                
                                <button
                                    onClick={handleExportCSV}
                                    style={{
                                        padding: '0.375rem 0.75rem',
                                        fontSize: '0.875rem',
                                        borderRadius: '0.25rem',
                                        border: '1px solid rgba(255,255,255,0.3)',
                                        backgroundColor: 'transparent',
                                        color: theme === 'dark' ? '#fff' : '#000',
                                        cursor: 'pointer'
                                    }}
                                >
                                    📥 {!isMobile && 'Export'}
                                </button>
                                
                                <button
                                    onClick={autoSizeAll}
                                    style={{
                                        padding: '0.375rem 0.75rem',
                                        fontSize: '0.875rem',
                                        borderRadius: '0.25rem',
                                        border: '1px solid rgba(23,162,184,0.5)',
                                        backgroundColor: '#17a2b8',
                                        color: '#fff',
                                        cursor: 'pointer'
                                    }}
                                >
                                    📐 {!isMobile && 'Auto Size'}
                                </button>

                                <button
                                    onClick={toggleFullScreen}
                                    style={{
                                        padding: '0.375rem 0.75rem',
                                        fontSize: '0.875rem',
                                        borderRadius: '0.25rem',
                                        border: '1px solid rgba(255,255,255,0.3)',
                                        backgroundColor: 'transparent',
                                        color: theme === 'dark' ? '#fff' : '#000',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {isFullScreen ? '🗗' : '🗖'} {!isMobile && (isFullScreen ? 'Exit' : 'Full')}
                                </button>
                                
                                <button
                                    onClick={toggleTheme}
                                    style={{
                                        padding: '0.375rem 0.75rem',
                                        fontSize: '0.875rem',
                                        borderRadius: '0.25rem',
                                        border: '1px solid rgba(255,255,255,0.3)',
                                        backgroundColor: 'transparent',
                                        color: theme === 'dark' ? '#fff' : '#000',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {theme === 'light' ? '🌙' : '☀️'} {!isMobile && (theme === 'light' ? 'Dark' : 'Light')}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Body Content - AG Grid */}
                    <div style={{
                        backgroundColor: themeStyles.cardBg,
                        padding: isFullScreen ? 0 : 15
                    }}>
                        {reportData.length === 0 ? (
                            <div style={{
                                textAlign: 'right',
                                padding: '50px',
                                color: themeStyles.color
                            }}>
                                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📄</div>
                                <h5>No report data available</h5>
                                <p>Please select a different financial year or check your API connection.</p>
                            </div>
                        ) : (
                            <div
                                className="ag-theme-alpine"
                                style={{
                                    height: gridHeight,
                                    width: '100%',
                                    ...(theme === 'dark' && {
                                        '--ag-background-color': '#212529',
                                        '--ag-header-background-color': '#343a40',
                                        '--ag-odd-row-background-color': '#2c3034',
                                        '--ag-even-row-background-color': '#212529',
                                        '--ag-row-hover-color': '#495057',
                                        '--ag-foreground-color': '#f8f9fa',
                                        '--ag-header-foreground-color': '#f8f9fa',
                                        '--ag-border-color': '#495057',
                                        '--ag-selected-row-background-color': '#28a745',
                                        '--ag-input-background-color': '#343a40',
                                        '--ag-input-border-color': '#495057'
                                    })
                                }}
                            >
                                <AgGridReact
                                    ref={gridRef}
                                    rowData={reportData}
                                    columnDefs={columnDefs}
                                    defaultColDef={defaultColDef}
                                    pagination={true}
                                    paginationPageSize={isMobile ? 10 : 20}
                                    rowSelection="multiple"
                                    onSelectionChanged={onSelectionChanged}
                                    onGridReady={onGridReady}
                                    getRowStyle={getRowStyle}
                                    animateRows={!isMobile}
                                    enableCellTextSelection={true}
                                    suppressHorizontalScroll={false}
                                    headerHeight={isMobile ? 40 : 48}
                                    rowHeight={isMobile ? 35 : 42}
                                    rowMultiSelectWithClick={false}
                                    suppressMovableColumns={isMobile}
                                    enableRangeSelection={!isMobile}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConsolidatedDCReport;