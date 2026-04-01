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

const PurchaseOrderGrid = () => {
    const [theme, setTheme] = useState('light');
    const [rowData, setRowData] = useState([]);
    const [columnDefs, setColumnDefs] = useState([]);
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [loading, setLoading] = useState(true);
    const [selectedRows, setSelectedRows] = useState([]);
    const gridRef = useRef();

    const formTitle = "Purchase Order Account Details";

    // Handle window resize for mobile responsiveness
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Format currency values
    const formatCurrency = (value) => {
        if (!value || value === 0) return '0.00';
        return parseFloat(value).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    // Generate column definitions for purchase order data
    const generatePOColumnDefs = () => {
        const poColumns = [
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
            // PO Number with selection checkbox
            {
                field: "pono",
                headerName: "PO NO",
                filter: "agTextColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 200 : 280,
                minWidth: 180,
                resizable: true,
                sortable: true,
                checkboxSelection: false,
                headerCheckboxSelection: false,
                pinned: 'left',
                lockPosition: true,
                cellStyle: { fontWeight: 'bold', fontSize: '12px' },
                tooltipField: "pono"
            },
            // Material File No
            {
                field: "file_name",
                headerName: "MATERIAL FILE NO",
                filter: "agTextColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 120 : 150,
                minWidth: 100,
                resizable: true,
                sortable: true
            },
            // Labour File No
            {
                field: "l_file_name",
                headerName: "LABOUR FILE NO",
                filter: "agTextColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 120 : 150,
                minWidth: 100,
                resizable: true,
                sortable: true
            },
            // Material PO
            {
                field: "mpo",
                headerName: "MATERIAL PO",
                filter: "agNumberColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 120 : 140,
                minWidth: 100,
                resizable: true,
                sortable: true,
                cellRenderer: (params) => formatCurrency(params.value),
                cellStyle: { textAlign: 'right' }
            },
            // Labour PO
            {
                field: "lpo",
                headerName: "LABOUR PO",
                filter: "agNumberColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 120 : 140,
                minWidth: 100,
                resizable: true,
                sortable: true,
                cellRenderer: (params) => formatCurrency(params.value),
                cellStyle: { textAlign: 'right' }
            },
            // Total PO
            {
                field: "totpo",
                headerName: "TOTAL PO",
                filter: "agNumberColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 120 : 140,
                minWidth: 100,
                resizable: true,
                sortable: true,
                cellRenderer: (params) => formatCurrency(params.value),
                cellStyle: { textAlign: 'right', fontWeight: 'bold' }
            },
            // Sales Invoice
            {
                field: "saleinv",
                headerName: "SALES (Billing To Customer)",
                filter: "agNumberColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 150 : 200,
                minWidth: 120,
                resizable: true,
                sortable: true,
                cellRenderer: (params) => formatCurrency(params.value),
                cellStyle: { textAlign: 'right', color: '#28a745' }
            },
            // Labour Invoice
            {
                field: "labInv",
                headerName: "Labour Inv",
                filter: "agNumberColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 100 : 120,
                minWidth: 80,
                resizable: true,
                sortable: true,
                cellRenderer: (params) => formatCurrency(params.value),
                cellStyle: { textAlign: 'right' }
            },
            // ERP Consumption Material
            {
                field: "actualmatconsump",
                headerName: "ERP CONSUMP MATERIAL",
                filter: "agNumberColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 140 : 180,
                minWidth: 120,
                resizable: true,
                sortable: true,
                cellRenderer: (params) => formatCurrency(params.value),
                cellStyle: { textAlign: 'right' }
            },
            // ERP Labour Purchase
            {
                field: "labpur",
                headerName: "ERP LABOUR PURCHASE",
                filter: "agNumberColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 140 : 170,
                minWidth: 120,
                resizable: true,
                sortable: true,
                cellRenderer: (params) => formatCurrency(params.value),
                cellStyle: { textAlign: 'right' }
            },
            // A/C Labour Site Exp
            {
                field: "labpoactcost",
                headerName: "A/C LABOUR SITE EXP",
                filter: "agNumberColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 140 : 160,
                minWidth: 120,
                resizable: true,
                sortable: true,
                cellRenderer: (params) => formatCurrency(params.value),
                cellStyle: { textAlign: 'right' }
            },
            // ERP Site Actual Expenses
            {
                field: "laboursite",
                headerName: "ERP SITE ACTUAL EXPENSES",
                filter: "agNumberColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 140 : 190,
                minWidth: 120,
                resizable: true,
                sortable: true,
                cellRenderer: (params) => formatCurrency(params.value),
                cellStyle: { textAlign: 'right' }
            },
            // A/C Transport Carriage Outward
            {
                field: "siteexp",
                headerName: "A/C Transport Carriage Outward (Transport)",
                filter: "agNumberColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 180 : 240,
                minWidth: 160,
                resizable: true,
                sortable: true,
                cellRenderer: (params) => formatCurrency(params.value),
                cellStyle: { textAlign: 'right' }
            },
            // ADV Site All
            {
                field: "advsite",
                headerName: "ADV SITE All (CHG Header)",
                filter: "agNumberColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 160 : 180,
                minWidth: 140,
                resizable: true,
                sortable: true,
                cellRenderer: (params) => formatCurrency(params.value),
                cellStyle: { textAlign: 'right' }
            },
            // ERP Transport Cost
            {
                field: "carriout",
                headerName: "ERP TRANSPORT COST",
                filter: "agNumberColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 120 : 160,
                minWidth: 100,
                resizable: true,
                sortable: true,
                cellRenderer: (params) => formatCurrency(params.value),
                cellStyle: { textAlign: 'right' }
            },
            // Hamali Loading + Unloading
            {
                field: "transport",
                headerName: "HAMALI LOADING + UNLOADING",
                filter: "agNumberColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 160 : 200,
                minWidth: 140,
                resizable: true,
                sortable: true,
                cellRenderer: (params) => formatCurrency(params.value),
                cellStyle: { textAlign: 'right' }
            },
            // Total Hamali
            {
                field: "totalhamali",
                headerName: "HAMALI LOADING + UNLOADING",
                filter: "agNumberColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 140 : 180,
                minWidth: 120,
                resizable: true,
                sortable: true,
                cellRenderer: (params) => formatCurrency(params.value),
                cellStyle: { textAlign: 'right' }
            }
        ];

        return poColumns;
    };

    const defaultColDef = useMemo(() => ({
        filter: true,
        sortable: true,
        floatingFilter: !isMobile,
        resizable: true,
        suppressMenu: isMobile,
        cellStyle: { textAlign: 'right' }
    }), [isMobile]);

    // Fetch purchase order data from API
    const fetchPOData = async () => {
        setLoading(true);
        try {
            const response = await fetch("https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/getAccountSvc.php", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (Array.isArray(data) && data.length > 0) {
                setRowData(data);
                console.log(`Loaded ${data.length} purchase order records`);
            } else {
                console.warn("No purchase order data received or invalid response format:", data);
                setRowData([]);
            }
        } catch (error) {
            console.error("Error fetching purchase order data:", error);
            setRowData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setColumnDefs(generatePOColumnDefs());
        fetchPOData();
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

        if (selectedNodes.length === 1) {
            console.log("Selected PO data:", selectedData[0]);
        }
    };

    // Export to CSV
    const downloadExcel = () => {
        if (!gridRef.current?.api) return;

        try {
            const params = {
                fileName: `Purchase_Order_Account_${new Date().toISOString().split('T')[0]}.csv`,
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

    // Theme styles matching CostChitGrid
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
                    <p className="mt-3">Loading purchase order data...</p>
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
                                    {`${rowData.length} records found`}
                                    {selectedRows.length > 0 && ` | ${selectedRows.length} selected`}
                                </small>
                            </div>

                            <div className="col-12 col-lg-6">
                                <div className="d-flex justify-content-end gap-2 flex-wrap align-items-center">
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
                                <i className="bi bi-receipt" style={{ fontSize: '3rem', marginBottom: '20px' }}></i>
                                <h5>No purchase order data available</h5>
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
                                    paginationPageSize={isMobile ? 10 : 20}
                                    rowSelection="multiple"
                                    onSelectionChanged={onSelectionChanged}
                                    suppressMovableColumns={isMobile}
                                    enableRangeSelection={!isMobile}
                                    rowMultiSelectWithClick={true}
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
                                        console.log('Purchase Order grid is ready');
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

export default PurchaseOrderGrid;