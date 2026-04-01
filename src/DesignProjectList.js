import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from 'react-router-dom';
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
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

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

const ProjectListGrid = () => {
    const navigate = useNavigate();
    const [theme, setTheme] = useState('light');
    const [rowData, setRowData] = useState([]);
    const [columnDefs, setColumnDefs] = useState([]);
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [loading, setLoading] = useState(true);
    const [selectedRows, setSelectedRows] = useState([]);
    const [financialYear, setFinancialYear] = useState('25-26');
    const [financialYearOptions, setFinancialYearOptions] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [autoNavigateOnSelect, setAutoNavigateOnSelect] = useState(false);
    const gridRef = useRef();

    const formTitle = "Project List - Material Files";

    // Handle window resize for mobile responsiveness
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch financial years from API
    const fetchFinancialYears = async () => {
        try {
            const response = await fetch(
                "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/GetYearsApi.php",
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.status === "success" && Array.isArray(result.data)) {
                // Sort by sequence_no to maintain order
                const sortedYears = result.data.sort((a, b) => 
                    parseInt(a.sequence_no) - parseInt(b.sequence_no)
                );
                
                setFinancialYearOptions(sortedYears);
                
                // Set the latest financial year as default (last in sorted array)
                if (sortedYears.length > 0) {
                    const latestYear = sortedYears[sortedYears.length - 1].financial_year;
                    setFinancialYear(latestYear);
                }
                
                console.log(`Loaded ${sortedYears.length} financial years`);
            } else {
                console.warn("No financial year data received");
                toast.warning("Could not load financial years");
            }
        } catch (error) {
            console.error("Error fetching financial years:", error);
            toast.error("Error loading financial years");
        }
    };

    // Generate column definitions for project list data
    const generateProjectColumnDefs = () => {
        const projectColumns = [
            // Serial Number Column
            {
                headerName: "Sr No",
                field: "serialNumber",
                valueGetter: (params) => params.node ? params.node.rowIndex + 1 : '',
                width: isMobile ? 60 : 80,
                minWidth: 50,
                pinned: 'left',
                lockPosition: true,
                cellStyle: { fontWeight: 'bold', textAlign: 'center' },
                suppressSizeToFit: true
            },
            // File ID with selection checkbox
            {
                field: "fileid",
                headerName: "FILE ID",
                filter: "agNumberColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 100 : 120,
                minWidth: 80,
                resizable: true,
                sortable: true,
                checkboxSelection: true,
                headerCheckboxSelection: true,
                pinned: 'left',
                lockPosition: true,
                cellStyle: { fontWeight: 'bold', fontSize: '12px', textAlign: 'center' },
                tooltipField: "fileid"
            },
            // File Name
            {
                field: "file_name",
                headerName: "FILE NAME",
                filter: "agTextColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 180 : 220,
                minWidth: 150,
                resizable: true,
                sortable: true,
                cellStyle: { fontWeight: 'bold', fontSize: '12px', color: '#0066cc' },
                tooltipField: "file_name"
            },
            // Customer Name
            {
                field: "customerName",
                headerName: "CUSTOMER NAME",
                filter: "agTextColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 200 : 300,
                minWidth: 180,
                resizable: true,
                sortable: true,
                cellStyle: { fontSize: '12px' },
                tooltipField: "customerName"
            },
            // Dispatch Date
            {
                field: "dateDispatch",
                headerName: "DISPATCH DATE",
                filter: "agTextColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 120 : 150,
                minWidth: 100,
                resizable: true,
                sortable: true,
                cellStyle: (params) => {
                    if (params.value === '-') {
                        return { textAlign: 'center', color: '#dc3545', fontStyle: 'italic' };
                    }
                    return { textAlign: 'center', color: '#28a745' };
                },
                cellRenderer: (params) => {
                    if (params.value === '-') {
                        return '<span>Pending</span>';
                    }
                    return params.value;
                }
            }
        ];

        return projectColumns;
    };

    const defaultColDef = useMemo(() => ({
        filter: true,
        sortable: true,
        floatingFilter: !isMobile,
        resizable: true,
        suppressMenu: isMobile,
        cellStyle: { textAlign: 'right' }
    }), [isMobile]);

    // Fetch project list data from API
    const fetchProjectData = async (fy = financialYear) => {
        setLoading(true);
        try {
            const response = await fetch(
                `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/GetProjectListApi.php?financial_year=${fy}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.status === "success" && Array.isArray(result.data) && result.data.length > 0) {
                setRowData(result.data);
                setTotalCount(result.count || result.data.length);
                setFinancialYear(result.financial_year);
                toast.success(`Loaded ${result.data.length} project records for FY ${result.financial_year}`);
                console.log(`Loaded ${result.data.length} project records for FY ${result.financial_year}`);
            } else {
                console.warn("No project data received or invalid response format:", result);
                setRowData([]);
                setTotalCount(0);
                toast.info(`No project data found for FY ${fy}`);
            }
        } catch (error) {
            console.error("Error fetching project data:", error);
            toast.error(`Error fetching data: ${error.message}`);
            setRowData([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    };

    // Initialize financial years on component mount
    useEffect(() => {
        fetchFinancialYears();
    }, []);

    // Fetch data when financial year changes
    useEffect(() => {
        if (financialYear) {
            setColumnDefs(generateProjectColumnDefs());
            fetchProjectData(financialYear);
        }
    }, [financialYear]);

    // Update column definitions when mobile/fullscreen changes
    useEffect(() => {
        setColumnDefs(generateProjectColumnDefs());
    }, [isMobile, isFullScreen]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    // Handle financial year change
    const handleFinancialYearChange = (e) => {
        const newFY = e.target.value;
        setFinancialYear(newFY);
        toast.info(`Switching to Financial Year ${newFY}...`);
    };

    // Toggle auto-navigation mode
    const toggleAutoNavigate = () => {
        setAutoNavigateOnSelect(!autoNavigateOnSelect);
        toast.info(`Auto-navigation ${!autoNavigateOnSelect ? 'enabled' : 'disabled'}`);
    };

    // Modified onSelectionChanged to handle auto-navigation
    const onSelectionChanged = (event) => {
        const selectedNodes = event.api.getSelectedNodes();
        const selectedData = selectedNodes.map(node => node.data);
        setSelectedRows(selectedData);

        // Auto-navigate when a row is selected (if enabled)
        if (autoNavigateOnSelect && selectedData.length === 1) {
            const selectedRecord = selectedData[0];

            // Check if fileid exists
            if (!selectedRecord.fileid) {
                toast.error('File ID not found in selected record');
                return;
            }

            // Show a brief toast before navigating
            toast.info(`Navigating to project details for ${selectedRecord.file_name}...`);

            // Navigate after a short delay to show the toast
            setTimeout(() => {
                navigate(`/project-details/${selectedRecord.fileid}`);
            }, 500);
        }

        if (selectedNodes.length === 1 && !autoNavigateOnSelect) {
            console.log("Selected Project data:", selectedData[0]);
        }
    };

    // Handle manual navigation to project details
    const handleNavigateToDetails = () => {
        if (selectedRows.length === 0) {
            toast.error('Please select a project to view details');
            return;
        }

        if (selectedRows.length > 1) {
            toast.error('Please select only one project at a time');
            return;
        }

        const selectedRecord = selectedRows[0];

        // Check if fileid exists
        if (!selectedRecord.fileid) {
            toast.error('File ID not found in selected record');
            return;
        }

        // Navigate to the project details route with fileid
        navigate(`/project-details/${selectedRecord.fileid}`);
    };

    // Export to CSV
    const downloadExcel = () => {
        if (!gridRef.current?.api) return;

        try {
            const params = {
                fileName: `Project_List_FY_${financialYear}_${new Date().toISOString().split('T')[0]}.csv`,
                allColumns: true,
                onlySelected: false,
                suppressQuotes: false,
                columnSeparator: ','
            };

            gridRef.current.api.exportDataAsCsv(params);
            console.log('Data exported successfully!');
        } catch (error) {
            console.error("Error exporting CSV:", error);
        }
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

    // Refresh data
    const refreshData = () => {
        fetchProjectData(financialYear);
    };

    // Theme styles
    const getThemeStyles = () => {
        if (theme === 'dark') {
            return {
                backgroundColor: 'linear-gradient(135deg, #21262d 0%, #161b22 100%)',
                color: '#f8f9fa',
                cardBg: '#343a40',
                cardHeader: 'linear-gradient(135deg, #495057 0%, #343a40 100%)'
            };
        }
        return {
            backgroundColor: 'linear-gradient(135deg, #f8f9ff 0%, #e6f3ff 100%)',
            color: '#212529',
            cardBg: '#ffffff',
            cardHeader: 'linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%)'
        };
    };

    const themeStyles = getThemeStyles();
    const gridHeight = isFullScreen ? 'calc(100vh - 180px)' : (isMobile ? '400px' : '600px');

    // Apply theme to document body
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
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: themeStyles.backgroundColor
            }}>
                <div style={{ textAlign: 'center', color: themeStyles.color }}>
                    <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem', borderColor: '#28a745', borderRightColor: 'transparent' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading project data...</p>
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
            <div className={`container-fluid ${isFullScreen ? 'p-0' : ''}`}>
                <div className="card" style={{
                    backgroundColor: themeStyles.cardBg,
                    color: themeStyles.color,
                    border: theme === 'dark' ? '1px solid #495057' : '1px solid #dee2e6',
                    margin: isFullScreen ? 0 : 20,
                    borderRadius: isFullScreen ? 0 : 8
                }}>
                    {/* Header */}
                    <div className="card-header" style={{
                        background: themeStyles.cardHeader,
                        color: theme === 'dark' ? '#ffffff' : '#000000',
                        fontFamily: "'Maven Pro', sans-serif",
                        padding: '1rem 2rem'
                    }}>
                        <div className="row align-items-center">
                            <div className="col-12 col-lg-6 mb-2 mb-lg-0">
                                <div className="d-flex flex-column">
                                    <h4 className="mb-1">
                                        {formTitle}
                                    </h4>
                                    <div className="d-flex align-items-center gap-2 flex-wrap">
                                        {/* Financial Year Selector - Prominent Position */}
                                        {financialYearOptions.length > 0 && (
                                            <div className="d-flex align-items-center gap-2">
                                                <label style={{ fontSize: '0.9rem', fontWeight: '500', marginBottom: 0 }}>
                                                    Financial Year:
                                                </label>
                                                <select
                                                    className="form-select form-select-sm"
                                                    value={financialYear}
                                                    onChange={handleFinancialYearChange}
                                                    style={{ 
                                                        width: 'auto', 
                                                        minWidth: '120px',
                                                        fontWeight: '600',
                                                        borderColor: '#28a745',
                                                        borderWidth: '2px'
                                                    }}
                                                >
                                                    {financialYearOptions.map(option => (
                                                        <option key={option.id} value={option.financial_year}>
                                                            FY {option.financial_year}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                        <small style={{ opacity: 0.8 }}>
                                            {totalCount} records
                                            {selectedRows.length > 0 && ` | ${selectedRows.length} selected`}
                                            {autoNavigateOnSelect && ' | Auto-nav ON'}
                                        </small>
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 col-lg-6">
                                <div className="d-flex justify-content-end gap-2 flex-wrap align-items-center">
                                    {/* Auto-Navigate Toggle */}
                                    <button
                                        className={`btn btn-sm ${autoNavigateOnSelect ? 'btn-success' : 'btn-outline-secondary'}`}
                                        onClick={toggleAutoNavigate}
                                        title="Toggle auto-navigation on checkbox select"
                                    >
                                        <i className="bi bi-lightning"></i>
                                        {!isMobile && ' Auto'}
                                    </button>

                                    {/* Navigate to Details Button (only show if auto-navigate is disabled and row is selected) */}
                                    {!autoNavigateOnSelect && selectedRows.length > 0 && (
                                        <button
                                            className="btn btn-sm btn-primary"
                                            onClick={handleNavigateToDetails}
                                        >
                                            <i className="bi bi-box-arrow-up-right"></i>
                                            {!isMobile && ' View Details'}
                                        </button>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="btn-group btn-group-sm">
                                        <button
                                            className="btn btn-success"
                                            onClick={downloadExcel}
                                            title="Download CSV"
                                        >
                                            <i className="bi bi-file-earmark-excel"></i>
                                            {!isMobile && ' Export CSV'}
                                        </button>
                                        <button
                                            className="btn btn-info"
                                            onClick={autoSizeAll}
                                            title="Auto Size Columns"
                                        >
                                            <i className="bi bi-arrows-angle-expand"></i>
                                            {!isMobile && ' Auto Size'}
                                        </button>
                                        <button
                                            className="btn btn-primary"
                                            onClick={refreshData}
                                            title="Refresh Data"
                                        >
                                            <i className="bi bi-arrow-clockwise"></i>
                                            {!isMobile && ' Refresh'}
                                        </button>
                                    </div>

                                    {/* View Controls */}
                                    <div className="btn-group btn-group-sm">
                                        <button
                                            className="btn btn-outline-light"
                                            onClick={toggleFullScreen}
                                            title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
                                        >
                                            <i className={`bi ${isFullScreen ? 'bi-fullscreen-exit' : 'bi-fullscreen'}`}></i>
                                            {!isMobile && (isFullScreen ? ' Exit' : ' Full')}
                                        </button>
                                        <button
                                            className="btn btn-outline-light"
                                            onClick={toggleTheme}
                                            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
                                        >
                                            {theme === 'light' ? '🌙' : '☀️'}
                                            {!isMobile && (theme === 'light' ? ' Dark' : ' Light')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Grid Body */}
                    <div className="card-body" style={{
                        backgroundColor: themeStyles.cardBg,
                        padding: isFullScreen ? 0 : 15
                    }}>
                        {rowData.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '50px',
                                color: themeStyles.color
                            }}>
                                <i className="bi bi-folder-x" style={{ fontSize: '3rem', marginBottom: '20px' }}></i>
                                <h5>No project data available</h5>
                                <p>Please check your API connection or data source.</p>
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
                                        '--ag-secondary-border-color': '#343a40',
                                        '--ag-header-column-separator-color': '#495057',
                                        '--ag-row-border-color': '#343a40',
                                        '--ag-selected-row-background-color': '#28a745',
                                        '--ag-range-selection-background-color': '#28a74533',
                                        '--ag-cell-horizontal-border': '#343a40',
                                        '--ag-header-cell-hover-background-color': '#495057',
                                        '--ag-header-cell-moving-background-color': '#495057',
                                        '--ag-value-change-value-highlight-background-color': '#198754',
                                        '--ag-chip-background-color': '#495057',
                                        '--ag-input-background-color': '#343a40',
                                        '--ag-input-border-color': '#495057',
                                        '--ag-input-focus-border-color': '#28a745',
                                        '--ag-minichart-selected-chart-color': '#28a745',
                                        '--ag-minichart-selected-page-color': '#28a745',
                                        '--ag-pinned-left-border': '2px solid #495057',
                                        '--ag-pinned-right-border': '2px solid #495057'
                                    }),
                                    ...(theme === 'light' && {
                                        '--ag-selected-row-background-color': '#28a745',
                                        '--ag-range-selection-background-color': '#28a74533',
                                        '--ag-input-focus-border-color': '#28a745',
                                        '--ag-minichart-selected-chart-color': '#28a745',
                                        '--ag-minichart-selected-page-color': '#28a745',
                                        '--ag-checkbox-checked-color': '#28a745',
                                        '--ag-accent-color': '#28a745'
                                    })
                                }}
                            >
                                <AgGridReact
                                    ref={gridRef}
                                    rowData={rowData}
                                    columnDefs={columnDefs}
                                    defaultColDef={defaultColDef}
                                    pagination={true}
                                    paginationPageSize={isMobile ? 10 : 50}
                                    rowSelection="single"
                                    onSelectionChanged={onSelectionChanged}
                                    suppressMovableColumns={isMobile}
                                    enableRangeSelection={!isMobile}
                                    rowMultiSelectWithClick={false}
                                    suppressRowClickSelection={false}
                                    animateRows={!isMobile}
                                    enableCellTextSelection={true}
                                    suppressHorizontalScroll={false}
                                    suppressColumnVirtualisation={isMobile}
                                    rowBuffer={isMobile ? 5 : 10}
                                    headerHeight={isMobile ? 40 : 48}
                                    rowHeight={isMobile ? 35 : 42}
                                    suppressMenuHide={isMobile}
                                    suppressContextMenu={isMobile}
                                    onGridReady={(params) => {
                                        console.log('Project List grid is ready');
                                        setTimeout(() => autoSizeAll(), 500);
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme={theme}
            />
        </div>
    );
};

export default ProjectListGrid;