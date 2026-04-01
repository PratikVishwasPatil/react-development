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

    const gridRef = useRef();

    const formTitle = "Expense Tracker Daily";

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
                    padding: '5px 12px',
                    background: '#007bff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 'bold'
                }}
                title="View Details"
            >
                <i className="bi bi-eye"></i> View
            </button>
        );
    };

    const generateColumnDefs = () => {
        const columns = [
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
                width: isMobile ? 200 : 300,
                minWidth: 180,
                resizable: true,
                sortable: true,
                checkboxSelection: true,
                headerCheckboxSelection: true,
                pinned: 'left',
                lockPosition: true,
                cellStyle: { fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', color: '#007bff' },
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
                width: isMobile ? 150 : 200,
                minWidth: 120,
                resizable: true,
                sortable: true,
                cellStyle: { fontSize: '12px' },
                tooltipField: "type"
            },
            {
                field: "date",
                headerName: "DATE",
                filter: "agDateColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 130 : 180,
                minWidth: 120,
                resizable: true,
                sortable: true,
                cellStyle: { fontSize: '12px' }
            },
            {
                field: "site_incharge",
                headerName: "SITE INCHARGE",
                filter: "agTextColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 200 : 250,
                minWidth: 180,
                resizable: true,
                sortable: true,
                cellStyle: { fontSize: '12px', color: '#28a745', fontWeight: '500' },
                tooltipField: "site_incharge"
            },
            {
                field: "emp_type",
                headerName: "EMP TYPE",
                filter: "agTextColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 120 : 150,
                minWidth: 100,
                resizable: true,
                sortable: true,
                cellStyle: { fontSize: '12px' }
            },
            {
                field: "project_estimated_cost",
                headerName: "PROJECT ESTIMATED COST",
                filter: "agNumberColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 180 : 220,
                minWidth: 150,
                resizable: true,
                sortable: true,
                cellStyle: { fontSize: '12px', textAlign: 'right' },
                valueFormatter: (params) => params.value ? Number(params.value).toLocaleString() : '0'
            },
            {
                field: "total_project_cost",
                headerName: "TOTAL PROJECT COST",
                filter: "agNumberColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 180 : 220,
                minWidth: 150,
                resizable: true,
                sortable: true,
                cellStyle: { fontSize: '12px', textAlign: 'right' },
                valueFormatter: (params) => params.value ? Number(params.value).toLocaleString() : '0'
            },
            {
                field: "total_expense",
                headerName: "TOTAL EXPENSE",
                filter: "agNumberColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 150 : 180,
                minWidth: 130,
                resizable: true,
                sortable: true,
                cellStyle: { fontSize: '12px', textAlign: 'right' },
                valueFormatter: (params) => params.value ? Number(params.value).toLocaleString() : '0'
            },
            {
                field: "advance",
                headerName: "ADVANCE",
                filter: "agNumberColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 130 : 160,
                minWidth: 110,
                resizable: true,
                sortable: true,
                cellStyle: { fontSize: '12px', textAlign: 'right' },
                valueFormatter: (params) => params.value ? Number(params.value).toLocaleString() : '0'
            },
            {
                field: "project_est_cost_total_expense",
                headerName: "PROJECT EST COST - TOTAL EXPENSE",
                filter: "agNumberColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 220 : 280,
                minWidth: 200,
                resizable: true,
                sortable: true,
                cellStyle: { fontSize: '12px', textAlign: 'right' },
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
        cellStyle: { textAlign: 'left' }
    }), [isMobile]);

    const fetchExpenseData = async () => {
        setLoading(true);
        try {
            const response = await fetch("https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/ExpenseTrackerDaily.php", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log("API Response:", result);

            let data = [];
            if (result.status === 'success' && Array.isArray(result.data)) {
                data = result.data;
            } else if (Array.isArray(result)) {
                data = result;
            }

            if (data.length > 0) {
                setRowData(data);
            } else {
                console.warn("No expense data received");
                setRowData([]);
            }
        } catch (error) {
            console.error("Error fetching expense data:", error);
            setRowData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setColumnDefs(generateColumnDefs());
        fetchExpenseData();
    }, [isMobile, isFullScreen]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    const onSelectionChanged = (event) => {
        const selectedNodes = event.api.getSelectedNodes();
        const selectedData = selectedNodes.map(node => node.data);
        setSelectedRows(selectedData);
    };

    // NEW FUNCTION: Navigate with selected file names
    const navigateToFileList = () => {
        if (selectedRows.length === 0) {
            alert('Please select at least one expense record');
            return;
        }

        // Extract file names from selected rows
        const fileNames = selectedRows.map(row => row.file_name).filter(Boolean);
        
        if (fileNames.length === 0) {
            alert('Selected records do not have file names');
            return;
        }

        // Navigate to FileListGrid with file names as query parameters or state
        // Option 1: Using query parameters
        const queryString = fileNames.map(name => `${encodeURIComponent(name)}`).join('&');
        navigate(`/expense-analysis/${queryString}`);

        // Option 2: Using state (preferred for passing arrays)
        // navigate('/file-list', { state: { selectedFiles: fileNames } });
    };

    const downloadExcel = () => {
        if (!gridRef.current?.api) return;

        try {
            const params = {
                fileName: `Expense_Tracker_Daily_${new Date().toISOString().split('T')[0]}.csv`,
                allColumns: true,
                onlySelected: false,
                suppressQuotes: false,
                columnSeparator: ','
            };

            gridRef.current.api.exportDataAsCsv(params);
        } catch (error) {
            console.error("Error exporting CSV:", error);
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
        fetchExpenseData();
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
                    <p className="mt-3">Loading expense data...</p>
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
                            <div className="col-12 col-lg-6 mb-2 mb-lg-0">
                                <h4 className="mb-0">
                                    {formTitle}
                                </h4>
                                <small style={{ opacity: 0.8 }}>
                                    {`${rowData.length} records found`}
                                    {selectedRows.length > 0 && ` | ${selectedRows.length} selected`}
                                </small>
                            </div>

                            <div className="col-12 col-lg-6">
                                <div className="d-flex justify-content-end gap-2 flex-wrap align-items-center">
                                    <div className="btn-group btn-group-sm">
                                        {/* NEW BUTTON: View Selected Files */}
                                        {selectedRows.length > 0 && (
                                            <button
                                                className="btn btn-warning"
                                                onClick={navigateToFileList}
                                                title="View File List for Selected Records"
                                            >
                                                <i className="bi bi-folder-open"></i>
                                                {!isMobile && ` View Files (${selectedRows.length})`}
                                            </button>
                                        )}
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
                                <i className="bi bi-receipt" style={{ fontSize: '3rem', marginBottom: '20px' }}></i>
                                <h5>No expense data available</h5>
                                <p>Please check your API connection or data source.</p>
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
                                    rowSelection="multiple"
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
                                        console.log('Expense Tracker Grid is ready');
                                        setTimeout(() => autoSizeAll(), 500);
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExpenseTrackerGrid;