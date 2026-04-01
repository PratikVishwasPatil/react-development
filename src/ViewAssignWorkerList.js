import React, { useEffect, useMemo, useState, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { useNavigate } from 'react-router-dom';

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

const WorkerFilesGrid = ({ onNavigateToManager }) => {
    const navigate = useNavigate();

    const [theme, setTheme] = useState('light');
    const [rowData, setRowData] = useState([]);
    const [columnDefs, setColumnDefs] = useState([]);
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [loading, setLoading] = useState(true);
    const [selectedRows, setSelectedRows] = useState([]);
    const [autoNavigateOnSelect, setAutoNavigateOnSelect] = useState(false);
    const [financialYear, setFinancialYear] = useState('25-26');
    const [financialYearOptions, setFinancialYearOptions] = useState([]);
    const gridRef = useRef();

    const formTitle = "Worker Assigned Files";

    // Fetch financial years from API
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
                
                // Set the latest year as default (last item in the array)
                if (data.data.length > 0) {
                    setFinancialYear(data.data[data.data.length - 1].financial_year);
                }
                toast.success('Financial years loaded successfully');
            }
        } catch (error) {
            console.error("Error fetching financial years:", error);
            toast.error('Error loading financial years');
            // Fallback to default years if API fails
            setFinancialYearOptions([
                { value: '22-23', label: '2022-23' },
                { value: '23-24', label: '2023-24' },
                { value: '24-25', label: '2024-25' },
                { value: '25-26', label: '2025-26' }
            ]);
        }
    };

    // Fetch financial years on component mount
    useEffect(() => {
        fetchFinancialYears();
    }, []);

    // Fetch data when financial year changes
    useEffect(() => {
        if (financialYear) {
            fetchWorkerFilesData(financialYear);
        }
    }, [financialYear]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const generateWorkerFilesColumnDefs = () => {
        const workerColumns = [
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
            {
                field: "file_name",
                headerName: "FILE NAME",
                filter: "agTextColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 200 : 350,
                minWidth: 180,
                resizable: true,
                sortable: true,
                checkboxSelection: true,
                headerCheckboxSelection: true,
                pinned: 'left',
                lockPosition: true,
                cellStyle: { fontWeight: 'bold', fontSize: '12px' },
                tooltipField: "file_name"
            },
            {
                field: "product",
                headerName: "PRODUCT",
                filter: "agTextColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 200 : 300,
                minWidth: 150,
                resizable: true,
                sortable: true,
                cellStyle: { fontSize: '12px', color: '#28a745', fontWeight: '500' },
                tooltipField: "product"
            },
            {
                field: "skilled_count",
                headerName: "SKILLED",
                filter: "agNumberColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 100 : 120,
                minWidth: 80,
                resizable: true,
                sortable: true,
                cellStyle: { textAlign: 'center', fontWeight: '600', color: '#2563eb' }
            },
            {
                field: "unskilled_count",
                headerName: "UNSKILLED",
                filter: "agNumberColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 100 : 120,
                minWidth: 80,
                resizable: true,
                sortable: true,
                cellStyle: { textAlign: 'center', fontWeight: '600', color: '#7c3aed' }
            },
            {
                field: "site_supervisor_count",
                headerName: "SUPERVISOR",
                filter: "agNumberColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 100 : 120,
                minWidth: 80,
                resizable: true,
                sortable: true,
                cellStyle: { textAlign: 'center', fontWeight: '600', color: '#059669' }
            },
            {
                field: "inside_count",
                headerName: "INSIDE",
                filter: "agNumberColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 100 : 120,
                minWidth: 80,
                resizable: true,
                sortable: true,
                cellStyle: { textAlign: 'center', fontWeight: '600', color: '#dc2626' }
            },
            {
                field: "total",
                headerName: "TOTAL",
                filter: "agNumberColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 100 : 120,
                minWidth: 80,
                resizable: true,
                sortable: true,
                cellStyle: { textAlign: 'center', fontWeight: 'bold', backgroundColor: '#fef3c7', color: '#92400e' }
            },
            {
                field: "from_date",
                headerName: "FROM DATE",
                filter: "agDateColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 120 : 140,
                minWidth: 100,
                resizable: true,
                sortable: true,
                cellStyle: { textAlign: 'center', fontSize: '11px' }
            },
            {
                field: "handover_date",
                headerName: "HANDOVER DATE",
                filter: "agDateColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 140 : 160,
                minWidth: 120,
                resizable: true,
                sortable: true,
                cellStyle: { textAlign: 'center', fontSize: '11px' },
                valueFormatter: (params) => params.value || 'Not Set'
            },
            // Hidden field for file_id
            {
                field: "fileid",
                headerName: "File ID",
                hide: true,
                width: 0
            }
        ];

        return workerColumns;
    };

    const defaultColDef = useMemo(() => ({
        filter: true,
        sortable: true,
        floatingFilter: !isMobile,
        resizable: true,
        suppressMenu: isMobile,
        cellStyle: { textAlign: 'right' }
    }), [isMobile]);

    const fetchWorkerFilesData = async (fy = financialYear) => {
        setLoading(true);
        try {
            const response = await fetch(
                `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/ViewAssignWorkerListApi.php?FY=${fy}`,
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
            console.log("API Response:", result);

            if (result.status === true && Array.isArray(result.data)) {
                setRowData(result.data);
                toast.success(`Loaded ${result.data.length} worker file records for FY ${fy}`);
            } else {
                console.warn("No worker file data received");
                setRowData([]);
                toast.warning("No data available for selected financial year");
            }
        } catch (error) {
            console.error("Error fetching worker files data:", error);
            toast.error(`Error fetching data: ${error.message}`);
            setRowData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setColumnDefs(generateWorkerFilesColumnDefs());
    }, [isMobile, isFullScreen]);

    // Handle financial year change
    const handleFinancialYearChange = (event) => {
        const newYear = event.target.value;
        setFinancialYear(newYear);
        fetchWorkerFilesData(newYear);
    };

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    const toggleAutoNavigate = () => {
        setAutoNavigateOnSelect(!autoNavigateOnSelect);
        toast.info(`Auto-navigation ${!autoNavigateOnSelect ? 'enabled' : 'disabled'}`);
    };

    const onSelectionChanged = (event) => {
        const selectedNodes = event.api.getSelectedNodes();
        const selectedData = selectedNodes.map(node => node.data);
        setSelectedRows(selectedData);

        // Auto-navigate when a row is selected (if enabled)
        if (autoNavigateOnSelect && selectedData.length === 1) {
            const selectedRecord = selectedData[0];

            // Check if file_id exists (check both possible field names)
            const fileId = selectedRecord.fileid || selectedRecord.file_id;
            
            if (!fileId) {
                toast.error('File ID not found in selected record');
                return;
            }

            toast.info(`Navigating to workers for ${selectedRecord.file_name}...`);

            setTimeout(() => {
                // Navigate to the view all assign workers route with file_id
                navigate(`/project/site/view-all-assign-workers/${fileId}`);

                // Also call the callback if provided (for backward compatibility)
                if (onNavigateToManager) {
                    onNavigateToManager(fileId, selectedRecord);
                }
            }, 500);
        }
    };

    // Manual navigation handler
    const handleNavigateToWorkers = () => {
        if (selectedRows.length === 0) {
            toast.error('Please select a file to view workers');
            return;
        }

        if (selectedRows.length > 1) {
            toast.error('Please select only one file at a time');
            return;
        }

        const selectedRecord = selectedRows[0];
        const fileId = selectedRecord.fileid || selectedRecord.file_id;

        if (!fileId) {
            toast.error('File ID not found in selected record');
            return;
        }

        // Navigate to the view all assign workers route
        navigate(`/project/site/view-all-assign-workers/${fileId}`);

        // Also call the callback if provided
        if (onNavigateToManager) {
            onNavigateToManager(fileId, selectedRecord);
        }
    };

    const downloadExcel = () => {
        if (!gridRef.current?.api) return;

        try {
            const params = {
                fileName: `Worker_Assigned_Files_${financialYear}_${new Date().toISOString().split('T')[0]}.csv`,
                allColumns: true,
                onlySelected: false,
                suppressQuotes: false,
                columnSeparator: ','
            };

            gridRef.current.api.exportDataAsCsv(params);
            toast.success('Data exported successfully!');
        } catch (error) {
            console.error("Error exporting CSV:", error);
            toast.error('Error exporting data');
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
        fetchWorkerFilesData(financialYear);
    };

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
                    <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading worker files data...</p>
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
                    <div className="card-header" style={{
                        background: themeStyles.cardHeader,
                        color: theme === 'dark' ? '#ffffff' : '#000000',
                        fontFamily: "'Maven Pro', sans-serif",
                        padding: '1rem 2rem'
                    }}>
                        <div className="row align-items-center">
                            <div className="col-12 col-lg-4 mb-2 mb-lg-0">
                                <h4 className="mb-0">
                                    {formTitle}
                                </h4>
                                <small style={{ opacity: 0.8 }}>
                                    FY {financialYear} | {`${rowData.length} records found`}
                                    {selectedRows.length > 0 && ` | ${selectedRows.length} selected`}
                                    {autoNavigateOnSelect && ' | Auto-nav ON'}
                                </small>
                            </div>

                            <div className="col-12 col-lg-4 mb-2 mb-lg-0">
                                <div className="d-flex align-items-center">
                                    <label className="form-label me-2 mb-0" style={{ whiteSpace: 'nowrap' }}>
                                        Financial Year:
                                    </label>
                                    <select
                                        className="form-select form-select-sm"
                                        value={financialYear}
                                        onChange={handleFinancialYearChange}
                                        style={{ maxWidth: '120px' }}
                                    >
                                        {financialYearOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="col-12 col-lg-4">
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

                                    {/* View Workers Button (only show if auto-navigate is disabled and row is selected) */}
                                    {!autoNavigateOnSelect && selectedRows.length > 0 && (
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={handleNavigateToWorkers}
                                        >
                                            <i className="bi bi-people"></i>
                                            {!isMobile && ' View Workers'}
                                        </button>
                                    )}

                                    <div className="btn-group btn-group-sm">
                                        <button
                                            className="btn btn-primary"
                                            onClick={refreshData}
                                            title="Refresh Data"
                                        >
                                            <i className="bi bi-arrow-clockwise"></i>
                                            {!isMobile && ' Refresh'}
                                        </button>
                                        <button
                                            className="btn btn-success"
                                            onClick={downloadExcel}
                                            title="Download CSV"
                                        >
                                            <i className="bi bi-file-earmark-excel"></i>
                                            {!isMobile && ' Export'}
                                        </button>
                                        <button
                                            className="btn btn-info"
                                            onClick={autoSizeAll}
                                            title="Auto Size Columns"
                                        >
                                            <i className="bi bi-arrows-angle-expand"></i>
                                            {!isMobile && ' Auto Size'}
                                        </button>
                                    </div>

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
                                <i className="bi bi-files" style={{ fontSize: '3rem', marginBottom: '20px' }}></i>
                                <h5>No worker file data available</h5>
                                <p>Please check your API connection or select a different financial year.</p>
                                <button className="btn btn-primary" onClick={refreshData}>
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
                                    rowSelection="single"
                                    onSelectionChanged={onSelectionChanged}
                                    suppressMovableColumns={isMobile}
                                    enableRangeSelection={!isMobile}
                                    rowMultiSelectWithClick={false}
                                    animateRows={!isMobile}
                                    enableCellTextSelection={true}
                                    suppressHorizontalScroll={false}
                                    headerHeight={isMobile ? 40 : 48}
                                    rowHeight={isMobile ? 35 : 42}
                                    onGridReady={() => {
                                        console.log('Worker Files Grid is ready');
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

export default WorkerFilesGrid;