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

const FileListGrid = () => {
    const [theme, setTheme] = useState('light');
    const [rowData, setRowData] = useState([]);
    const [columnDefs, setColumnDefs] = useState([]);
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [loading, setLoading] = useState(true);
    const [selectedRows, setSelectedRows] = useState([]);
    const gridRef = useRef();

    const formTitle = "Project File List - Site Details";

    // Handle window resize for mobile responsiveness
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Generate column definitions for file list data
    const generateFileColumnDefs = () => {
        const fileColumns = [
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
            // File Name with selection checkbox (SINGLE SELECTION ONLY)
            {
                field: "file_name",
                headerName: "FILE NAME",
                filter: "agTextColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 200 : 250,
                minWidth: 180,
                resizable: true,
                sortable: true,
                checkboxSelection: true,
                headerCheckboxSelection: false, // Disabled for single selection
                pinned: 'left',
                lockPosition: true,
                cellStyle: { fontWeight: 'bold', fontSize: '12px', color: '#0066cc' },
                tooltipField: "file_name",
                cellRenderer: (params) => {
                    return params.value;
                }
            },
            // File ID
            {
                field: "file_id",
                headerName: "FILE ID",
                filter: "agNumberColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 100 : 120,
                minWidth: 80,
                resizable: true,
                sortable: true,
                cellStyle: { textAlign: 'right', fontWeight: 'bold' }
            },
            // Customer Name
            {
                field: "customer_name",
                headerName: "CUSTOMER NAME",
                filter: "agTextColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 180 : 220,
                minWidth: 150,
                resizable: true,
                sortable: true,
                cellStyle: { fontWeight: '500' },
                tooltipField: "customer_name"
            },
            // Product Type
            {
                field: "product_type",
                headerName: "TYPE",
                filter: "agTextColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 120 : 150,
                minWidth: 100,
                resizable: true,
                sortable: true,
                cellStyle: { 
                    textAlign: 'center',
                    fontWeight: 'bold',
                    backgroundColor: '#f8f9fa',
                    color: '#495057'
                }
            },
            // Project Delivery Date
            {
                field: "project_delivery_date",
                headerName: "PROJECT DELIVERY DATE",
                filter: "agDateColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 160 : 200,
                minWidth: 140,
                resizable: true,
                sortable: true,
                cellRenderer: (params) => {
                    return params.value;
                },
                cellStyle: { textAlign: 'center' }
            },
            // Action Button Column
            // {
            //     headerName: "ACTION",
            //     field: "action",
            //     width: isMobile ? 120 : 150,
            //     minWidth: 100,
            //     pinned: 'right',
            //     lockPosition: true,
            //     cellRenderer: (params) => {
            //         return `
            //             <button 
            //                 class="btn btn-sm btn-primary view-drawings-btn" 
            //                 data-fileid="${params.data.file_id}"
            //                 style="padding: 4px 12px; font-size: 12px;"
            //             >
            //                 View Drawings
            //             </button>
            //         `;
            //     },
            //     cellStyle: { textAlign: 'center' }
            // }
        ];

        return fileColumns;
    };

    const defaultColDef = useMemo(() => ({
        filter: true,
        sortable: true,
        floatingFilter: !isMobile,
        resizable: true,
        suppressMenu: isMobile,
        cellStyle: { textAlign: 'right' }
    }), [isMobile]);

    // Fetch file list data from API
    const fetchFileData = async () => {
        setLoading(true);
        try {
            const response = await fetch("https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/ProjectListSiteApi.php", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.status === 'success' && Array.isArray(result.data) && result.data.length > 0) {
                setRowData(result.data);
                console.log(`Loaded ${result.data.length} file records`);
            } else {
                console.warn("No file data received or invalid response format:", result);
                setRowData([]);
            }
        } catch (error) {
            console.error("Error fetching file data:", error);
            setRowData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setColumnDefs(generateFileColumnDefs());
        fetchFileData();
    }, [isMobile, isFullScreen]);

    // Handle button clicks for "View Drawings"
    useEffect(() => {
        const handleButtonClick = (e) => {
            if (e.target.classList.contains('view-drawings-btn')) {
                const fileId = e.target.getAttribute('data-fileid');
                if (fileId) {
                    // Navigate to display drawings page
                    window.location.href = `#/display-drawings/${fileId}`;
                    // Or if using React Router programmatically:
                    // navigate(`/display-drawings/${fileId}`);
                }
            }
        };

        document.addEventListener('click', handleButtonClick);
        return () => document.removeEventListener('click', handleButtonClick);
    }, []);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    // SINGLE SELECTION: Ensure only one row can be selected at a time
    const onSelectionChanged = (event) => {
        const selectedNodes = event.api.getSelectedNodes();
        
        // If more than one row is selected, keep only the last selected one
        if (selectedNodes.length > 1) {
            const lastSelected = selectedNodes[selectedNodes.length - 1];
            event.api.deselectAll();
            lastSelected.setSelected(true);
            setSelectedRows([lastSelected.data]);
        } else {
            const selectedData = selectedNodes.map(node => node.data);
            setSelectedRows(selectedData);
        }

        if (selectedNodes.length === 1) {
            console.log("Selected file data:", selectedNodes[0].data);
        }
    };

    // Handle cell click for file name navigation
    const onCellClicked = (event) => {
        if (event.column.getColId() === 'file_name' && event.data) {
            // Navigate to display drawings page when file name is clicked
            const fileId = event.data.file_id;
            window.location.href = `#/display-drawings/${fileId}`;
            // Or if using React Router:
            // navigate(`/display-drawings/${fileId}`);
        }
    };

    // Export to CSV
    const downloadExcel = () => {
        if (!gridRef.current?.api) return;

        try {
            const params = {
                fileName: `File_List_${new Date().toISOString().split('T')[0]}.csv`,
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
        fetchFileData();
    };

    // Navigate to selected file's drawings page
    const viewSelectedDrawings = () => {
        if (selectedRows.length === 1) {
            const fileId = selectedRows[0].file_id;
            window.location.href = `#/display-drawings/${fileId}`;
            // Or if using React Router:
            // navigate(`/display-drawings/${fileId}`);
        } else {
            alert('Please select a file to view drawings');
        }
    };

    // Theme styles matching the original component
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
                    <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading file list data...</p>
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
                                <h4 className="mb-0">
                                    {formTitle}
                                </h4>
                                <small style={{ opacity: 0.8 }}>
                                    {`${rowData.length} files found`}
                                    {selectedRows.length > 0 && ` | ${selectedRows.length} selected`}
                                </small>
                            </div>

                            <div className="col-12 col-lg-6">
                                <div className="d-flex justify-content-end gap-2 flex-wrap align-items-center">
                                    {/* Action Buttons */}
                                    <div className="btn-group btn-group-sm">
                                        {selectedRows.length === 1 && (
                                            <button
                                                className="btn btn-warning"
                                                onClick={viewSelectedDrawings}
                                                title="View Drawings for Selected File"
                                            >
                                                View Drawings
                                            </button>
                                        )}
                                        <button
                                            className="btn btn-primary"
                                            onClick={refreshData}
                                            title="Refresh Data"
                                        >
                                            Refresh
                                        </button>
                                        <button
                                            className="btn btn-success"
                                            onClick={downloadExcel}
                                            title="Download CSV"
                                        >
                                            Export CSV
                                        </button>
                                        <button
                                            className="btn btn-info"
                                            onClick={autoSizeAll}
                                            title="Auto Size Columns"
                                        >
                                            Auto Size
                                        </button>
                                    </div>

                                    {/* View Controls */}
                                    <div className="btn-group btn-group-sm">
                                        <button
                                            className="btn btn-outline-light"
                                            onClick={toggleFullScreen}
                                            title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
                                        >
                                            {isFullScreen ? 'Exit' : 'Full'}
                                        </button>
                                        <button
                                            className="btn btn-outline-light"
                                            onClick={toggleTheme}
                                            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
                                        >
                                            {theme === 'light' ? 'Dark' : 'Light'}
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
                                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📂</div>
                                <h5>No file data available</h5>
                                <p>Please check your API connection or data source.</p>
                                <button 
                                    className="btn btn-primary mt-3"
                                    onClick={refreshData}
                                >
                                    Retry Loading
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
                                    paginationPageSize={isMobile ? 10 : 20}
                                    rowSelection="single"
                                    onSelectionChanged={onSelectionChanged}
                                    onCellClicked={onCellClicked}
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
                                        console.log('File List grid is ready');
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

export default FileListGrid;