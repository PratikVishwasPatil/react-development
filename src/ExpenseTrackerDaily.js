import React, { useEffect, useMemo, useState, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { useNavigate } from "react-router-dom";

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

const ExpenseTrackerGrid = () => {
    const navigate = useNavigate();
    const [theme, setTheme] = useState('light');
    const [rowData, setRowData] = useState([]);
    const [columnDefs, setColumnDefs] = useState([]);
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [loading, setLoading] = useState(true);
    const [selectedRows, setSelectedRows] = useState([]);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    // ✅ NEW: Financial year state (mirrored from ExpenseWeeklyGrid)
    const [financialYear, setFinancialYear] = useState('25-26');
    const [financialYearOptions, setFinancialYearOptions] = useState([]);

    const gridRef = useRef();
    const formTitle = "Expense Tracker Daily";

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // ✅ NEW: Fetch financial years from API (copied from ExpenseWeeklyGrid)
    const fetchFinancialYears = async () => {
        try {
            const response = await fetch(
                "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/GetYearsApi.php"
            );
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();

            if (data.status === "success" && Array.isArray(data.data)) {
                const years = data.data.map(item => ({
                    value: item.financial_year,
                    label: `20${item.financial_year}`
                }));
                setFinancialYearOptions(years);

                // Set the latest year as default (last item in the array)
                if (years.length > 0) {
                    setFinancialYear(years[years.length - 1].value);
                }
            }
        } catch (error) {
            console.error("Error fetching financial years:", error);
        }
    };

    // Action Button Cell Renderer
    const ActionButtonRenderer = (props) => {
        const handleViewDetails = () => {
            const fileId = props.data.file_name;
            navigate(`/expense-analysis/${fileId}`);
        };
        return (
            <button
                onClick={handleViewDetails}
                style={{
                    padding: isMobile ? '4px 8px' : '5px 12px',
                    background: '#007bff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: isMobile ? '10px' : '11px',
                    fontWeight: 'bold'
                }}
                title="View Details"
            >
                <i className="bi bi-eye"></i> {!isMobile && 'View'}
            </button>
        );
    };

    const generateColumnDefs = () => {
        const columns = [
            {
                headerName: "Sr No",
                field: "serialNumber",
                valueGetter: (params) => params.node ? params.node.rowIndex + 1 : '',
                width: isMobile ? 50 : 80,
                minWidth: 50,
                pinned: isMobile ? null : 'left',
                lockPosition: true,
                cellStyle: { fontWeight: 'bold', textAlign: 'center', fontSize: isMobile ? '10px' : '12px' },
                suppressSizeToFit: true
            },
            {
                field: "file_name",
                headerName: "FILE NAME",
                filter: "agTextColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 150 : 300,
                minWidth: 150,
                resizable: true,
                sortable: true,
                checkboxSelection: true,
                headerCheckboxSelection: true,
                pinned: isMobile ? null : 'left',
                lockPosition: !isMobile,
                cellStyle: {
                    fontWeight: 'bold',
                    fontSize: isMobile ? '10px' : '12px',
                    cursor: 'pointer',
                    color: '#007bff',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                },
                tooltipField: "file_name",
                onCellClicked: (params) => {
                    if (params.data && params.data.file_name) {
                        navigate(`/expense-analysis/${params.data.file_name}`);
                    }
                }
            },
            {
                field: "type",
                headerName: "TYPE",
                filter: "agTextColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 120 : 200,
                minWidth: 100,
                resizable: true,
                sortable: true,
                cellStyle: { fontSize: isMobile ? '10px' : '12px' },
                tooltipField: "type"
            },
            {
                field: "date",
                headerName: "DATE",
                filter: "agDateColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 110 : 180,
                minWidth: 100,
                resizable: true,
                sortable: true,
                cellStyle: { fontSize: isMobile ? '10px' : '12px' }
            },
            {
                field: "site_incharge",
                headerName: "SITE INCHARGE",
                filter: "agTextColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 150 : 250,
                minWidth: 140,
                resizable: true,
                sortable: true,
                cellStyle: {
                    fontSize: isMobile ? '10px' : '12px',
                    color: '#28a745',
                    fontWeight: '500',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                },
                tooltipField: "site_incharge"
            },
            {
                field: "employee_type",
                headerName: "EMP TYPE",
                filter: "agTextColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 100 : 150,
                minWidth: 90,
                resizable: true,
                sortable: true,
                cellStyle: { fontSize: isMobile ? '10px' : '12px' }
            },
            {
                field: "project_estimated_cost",
                headerName: isMobile ? "EST COST" : "PROJECT ESTIMATED COST",
                filter: "agNumberColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 120 : 220,
                minWidth: 110,
                resizable: true,
                sortable: true,
                cellStyle: { fontSize: isMobile ? '10px' : '12px', textAlign: 'right' },
                valueFormatter: (params) => params.value ? Number(params.value).toLocaleString() : '0'
            },
            {
                field: "total_project_cost",
                headerName: isMobile ? "PROJECT COST" : "TOTAL PROJECT COST",
                filter: "agNumberColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 130 : 220,
                minWidth: 120,
                resizable: true,
                sortable: true,
                cellStyle: { fontSize: isMobile ? '10px' : '12px', textAlign: 'right' },
                valueFormatter: (params) => params.value ? Number(params.value).toLocaleString() : '0'
            },
            {
                field: "total_exp",
                headerName: isMobile ? "EXPENSE" : "TOTAL EXPENSE",
                filter: "agNumberColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 110 : 180,
                minWidth: 100,
                resizable: true,
                sortable: true,
                cellStyle: { fontSize: isMobile ? '10px' : '12px', textAlign: 'right' },
                valueFormatter: (params) => params.value ? Number(params.value).toLocaleString() : '0'
            },
            {
                field: "advance",
                headerName: "ADVANCE",
                filter: "agNumberColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 100 : 160,
                minWidth: 90,
                resizable: true,
                sortable: true,
                cellStyle: { fontSize: isMobile ? '10px' : '12px', textAlign: 'right' },
                valueFormatter: (params) => params.value ? Number(params.value).toLocaleString() : '0'
            },
            {
                field: "totalsum",
                headerName: isMobile ? "EST-EXP" : "PROJECT EST COST - TOTAL EXPENSE",
                filter: "agNumberColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 110 : 280,
                minWidth: 100,
                resizable: true,
                sortable: true,
                cellStyle: { fontSize: isMobile ? '10px' : '12px', textAlign: 'right' },
                valueFormatter: (params) => params.value ? Number(params.value).toLocaleString() : '0'
            }
        ];
        return columns;
    };

    const defaultColDef = useMemo(() => ({
        filter: true,
        sortable: true,
        floatingFilter: !isMobile,
        resizable: true,
        suppressMenu: isMobile,
        cellStyle: { textAlign: 'right' }
    }), [isMobile]);

    // ✅ UPDATED: fetchExpenseData now accepts and passes financial_year param
    const fetchExpenseData = async (fy = financialYear) => {
        setLoading(true);
        try {
            const response = await fetch(
                `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/ExpenseTrackerDaily.php?financial_year=${fy}`,
                {
                    method: "GET",
                    headers: { "Content-Type": "application/json" }
                }
            );

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const result = await response.json();
            console.log("API Response:", result);

            let data = [];
            if (result.status === 'success' && Array.isArray(result.data)) {
                data = result.data;
            } else if (Array.isArray(result)) {
                data = result;
            }

            setRowData(data.length > 0 ? data : []);
            if (data.length === 0) console.warn("No expense data received");

        } catch (error) {
            console.error("Error fetching expense data:", error);
            setRowData([]);
        } finally {
            setLoading(false);
        }
    };

    // ✅ UPDATED: Initial load fetches financial years first
    useEffect(() => {
        setColumnDefs(generateColumnDefs());
        fetchFinancialYears();
    }, [isMobile, isFullScreen]);

    // ✅ NEW: Re-fetch data whenever financialYear changes
    useEffect(() => {
        if (financialYear) {
            fetchExpenseData(financialYear);
        }
    }, [financialYear]);

    // ✅ NEW: Handle financial year dropdown change
    const handleFinancialYearChange = (e) => {
        setFinancialYear(e.target.value);
    };

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
    const toggleFullScreen = () => setIsFullScreen(!isFullScreen);
    const toggleMobileMenu = () => setShowMobileMenu(!showMobileMenu);

    const onSelectionChanged = (event) => {
        const selectedNodes = event.api.getSelectedNodes();
        setSelectedRows(selectedNodes.map(node => node.data));
    };

    const navigateToFileList = () => {
        if (selectedRows.length === 0) { alert('Please select at least one expense record'); return; }
        const fileNames = selectedRows.map(row => row.file_name).filter(Boolean);
        if (fileNames.length === 0) { alert('Selected records do not have file names'); return; }
        const queryString = fileNames.map(name => `${encodeURIComponent(name)}`).join('&');
        navigate(`/expense-analysis/${queryString}`);
        if (isMobile) setShowMobileMenu(false);
    };

    const downloadExcel = () => {
        if (!gridRef.current?.api) return;
        try {
            gridRef.current.api.exportDataAsCsv({
                fileName: `Expense_Tracker_Daily_FY${financialYear}_${new Date().toISOString().split('T')[0]}.csv`,
                allColumns: true,
                onlySelected: false,
                suppressQuotes: false,
                columnSeparator: ','
            });
        } catch (error) { console.error("Error exporting CSV:", error); }
        if (isMobile) setShowMobileMenu(false);
    };

    const autoSizeAll = () => {
        if (!gridRef.current?.api) return;
        try {
            setTimeout(() => {
                const allColumnIds = gridRef.current.api.getColumns()?.map(col => col.getId()) || [];
                if (allColumnIds.length > 0) gridRef.current.api.autoSizeColumns(allColumnIds, false);
            }, 100);
        } catch (error) { console.error('Error auto-sizing columns:', error); }
        if (isMobile) setShowMobileMenu(false);
    };

    const refreshData = () => {
        fetchExpenseData(financialYear);
        if (isMobile) setShowMobileMenu(false);
    };

    const getThemeStyles = () => {
        if (theme === 'dark') return {
            backgroundColor: 'linear-gradient(135deg, #21262d 0%, #161b22 100%)',
            color: '#f8f9fa', cardBg: '#343a40',
            cardHeader: 'linear-gradient(135deg, #495057 0%, #343a40 100%)'
        };
        return {
            backgroundColor: 'linear-gradient(135deg, #f8f9ff 0%, #e6f3ff 100%)',
            color: '#212529', cardBg: '#ffffff',
            cardHeader: 'linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%)'
        };
    };

    const themeStyles = getThemeStyles();
    const gridHeight = isMobile ? 'calc(100vh - 200px)' : isFullScreen ? 'calc(100vh - 180px)' : '600px';

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

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: themeStyles.backgroundColor }}>
                <div style={{ textAlign: 'center', color: themeStyles.color }}>
                    <div className="spinner-border" role="status" style={{ width: isMobile ? '2rem' : '3rem', height: isMobile ? '2rem' : '3rem' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3" style={{ fontSize: isMobile ? '14px' : '16px' }}>Loading expense data...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: themeStyles.backgroundColor, color: themeStyles.color, padding: 0, margin: 0 }}>
            <div className={`container-fluid ${isFullScreen ? 'p-0' : ''}`}>
                <div className="card" style={{
                    backgroundColor: themeStyles.cardBg,
                    color: themeStyles.color,
                    border: theme === 'dark' ? '1px solid #495057' : '1px solid #dee2e6',
                    margin: isMobile ? 0 : (isFullScreen ? 0 : 20),
                    borderRadius: isMobile ? 0 : (isFullScreen ? 0 : 8)
                }}>
                    <div className="card-header" style={{
                        background: themeStyles.cardHeader,
                        color: theme === 'dark' ? '#ffffff' : '#000000',
                        fontFamily: "'Maven Pro', sans-serif",
                        padding: isMobile ? '0.75rem 1rem' : '1rem 2rem'
                    }}>
                        <div className="row align-items-center">
                            <div className={`col-${isMobile ? '8' : '12'} col-lg-6 mb-${isMobile ? '0' : '2'} mb-lg-0`}>
                                <h4 className="mb-0" style={{ fontSize: isMobile ? '16px' : '20px' }}>
                                    {isMobile ? 'Expense Tracker' : formTitle}
                                </h4>
                                <small style={{ opacity: 0.8, fontSize: isMobile ? '11px' : '13px' }}>
                                    {`${rowData.length} records`}
                                    {selectedRows.length > 0 && ` | ${selectedRows.length} selected`}
                                </small>
                            </div>

                            <div className={`col-${isMobile ? '4' : '12'} col-lg-6`}>
                                {isMobile ? (
                                    <div className="d-flex justify-content-end">
                                        <button
                                            className="btn btn-sm btn-outline-light"
                                            onClick={toggleMobileMenu}
                                            style={{ fontSize: '18px', padding: '4px 12px' }}
                                        >
                                            <i className={`bi ${showMobileMenu ? 'bi-x' : 'bi-list'}`}></i>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="d-flex justify-content-end gap-2 flex-wrap align-items-center">

                                        {/* ✅ NEW: Financial Year Dropdown — matches Weekly pattern */}
                                        <select
                                            className="form-select form-select-sm"
                                            value={financialYear}
                                            onChange={handleFinancialYearChange}
                                            style={{ width: 'auto', minWidth: '130px' }}
                                        >
                                            {financialYearOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    FY {option.label}
                                                </option>
                                            ))}
                                        </select>

                                        <div className="btn-group btn-group-sm">
                                            {selectedRows.length > 0 && (
                                                <button className="btn btn-warning" onClick={navigateToFileList} title="View File List for Selected Records">
                                                    <i className="bi bi-folder-open"></i> View Files ({selectedRows.length})
                                                </button>
                                            )}
                                            <button className="btn btn-primary" onClick={refreshData} title="Refresh Data">
                                                <i className="bi bi-arrow-clockwise"></i> Refresh
                                            </button>
                                            <button className="btn btn-success" onClick={downloadExcel} title="Download CSV">
                                                <i className="bi bi-file-earmark-excel"></i> Export
                                            </button>
                                            <button className="btn btn-info" onClick={autoSizeAll} title="Auto Size Columns">
                                                <i className="bi bi-arrows-angle-expand"></i> Auto Size
                                            </button>
                                        </div>

                                        <div className="btn-group btn-group-sm">
                                            <button className="btn btn-outline-light" onClick={toggleFullScreen} title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}>
                                                <i className={`bi ${isFullScreen ? 'bi-fullscreen-exit' : 'bi-fullscreen'}`}></i>
                                                {isFullScreen ? ' Exit' : ' Full'}
                                            </button>
                                            <button className="btn btn-outline-light" onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}>
                                                {theme === 'light' ? '🌙' : '☀️'}
                                                {theme === 'light' ? ' Dark' : ' Light'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mobile Menu Dropdown */}
                        {isMobile && showMobileMenu && (
                            <div style={{
                                marginTop: '12px', padding: '10px',
                                backgroundColor: theme === 'dark' ? '#495057' : '#f8f9fa',
                                borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '8px'
                            }}>
                                {/* ✅ NEW: FY dropdown in mobile menu too */}
                                <select
                                    className="form-select form-select-sm"
                                    value={financialYear}
                                    onChange={handleFinancialYearChange}
                                >
                                    {financialYearOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            FY {option.label}
                                        </option>
                                    ))}
                                </select>

                                {selectedRows.length > 0 && (
                                    <button className="btn btn-sm btn-warning w-100" onClick={navigateToFileList}>
                                        <i className="bi bi-folder-open"></i> View Files ({selectedRows.length})
                                    </button>
                                )}
                                <button className="btn btn-sm btn-primary w-100" onClick={refreshData}>
                                    <i className="bi bi-arrow-clockwise"></i> Refresh
                                </button>
                                <button className="btn btn-sm btn-success w-100" onClick={downloadExcel}>
                                    <i className="bi bi-file-earmark-excel"></i> Export CSV
                                </button>
                                <button className="btn btn-sm btn-info w-100" onClick={autoSizeAll}>
                                    <i className="bi bi-arrows-angle-expand"></i> Auto Size
                                </button>
                                <div className="d-flex gap-2">
                                    <button className="btn btn-sm btn-outline-secondary flex-fill" onClick={toggleTheme}>
                                        {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="card-body" style={{
                        backgroundColor: themeStyles.cardBg,
                        padding: isMobile ? '8px' : (isFullScreen ? 0 : 15)
                    }}>
                        {rowData.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: isMobile ? '30px 15px' : '50px', color: themeStyles.color }}>
                                <i className="bi bi-receipt" style={{ fontSize: isMobile ? '2rem' : '3rem', marginBottom: '20px' }}></i>
                                <h5 style={{ fontSize: isMobile ? '16px' : '20px' }}>No expense data available</h5>
                                <p style={{ fontSize: isMobile ? '13px' : '15px' }}>Please check your API connection or data source.</p>
                                <button className={`btn btn-${isMobile ? 'sm' : ''} btn-primary`} onClick={refreshData}>
                                    <i className="bi bi-arrow-clockwise"></i> Try Again
                                </button>
                            </div>
                        ) : (
                            <div
                                className="ag-theme-alpine"
                                style={{
                                    height: gridHeight,
                                    width: "100%",
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
                                    rowData={rowData}
                                    columnDefs={columnDefs}
                                    defaultColDef={defaultColDef}
                                    pagination={true}
                                    paginationPageSize={isMobile ? 10 : 20}
                                    rowSelection="multiple"
                                    onSelectionChanged={onSelectionChanged}
                                    suppressMovableColumns={isMobile}
                                    enableRangeSelection={!isMobile}
                                    rowMultiSelectWithClick={false}
                                    animateRows={!isMobile}
                                    enableCellTextSelection={true}
                                    suppressHorizontalScroll={false}
                                    headerHeight={isMobile ? 36 : 48}
                                    rowHeight={isMobile ? 32 : 42}
                                    onGridReady={() => {
                                        console.log('Expense Tracker Grid is ready');
                                        if (!isMobile) setTimeout(() => autoSizeAll(), 500);
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .ag-theme-alpine .ag-paging-panel { font-size: 11px; }
                    .ag-theme-alpine .ag-paging-button { min-width: 28px; padding: 4px; }
                    .ag-theme-alpine .ag-header-cell-text { font-size: 10px; }
                    .ag-theme-alpine ::-webkit-scrollbar { width: 6px; height: 6px; }
                }
                .ag-theme-alpine ::-webkit-scrollbar { width: 8px; height: 8px; }
                .ag-theme-alpine ::-webkit-scrollbar-track { background: ${theme === 'dark' ? '#212529' : '#f1f1f1'}; }
                .ag-theme-alpine ::-webkit-scrollbar-thumb { background: ${theme === 'dark' ? '#495057' : '#888'}; border-radius: 4px; }
                .ag-theme-alpine ::-webkit-scrollbar-thumb:hover { background: ${theme === 'dark' ? '#6c757d' : '#555'}; }
            `}</style>
        </div>
    );
};

export default ExpenseTrackerGrid;