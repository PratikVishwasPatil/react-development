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
import { Container, Button, Row, Col, Card, ButtonGroup, Form } from 'react-bootstrap';

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

const AmcDashboard = () => {
    const [theme, setTheme] = useState('light');
    const [rowData, setRowData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState('');
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [selectedRows, setSelectedRows] = useState([]);
    const gridRef = useRef();

    // Handle window resize for mobile responsiveness
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Custom cell renderer for file upload buttons
    const FileUploadCellRenderer = (params) => {
        const { value, data, colDef } = params;
        const visitNumber = colDef.field.match(/visit_report(\d+)/)?.[1];
        
        if (value && value !== '') {
            return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleFileView(value)}
                        style={{ fontSize: '10px', padding: '2px 6px' }}
                    >
                        View
                    </button>
                    <span style={{ fontSize: '9px', color: '#666' }}>
                        {value.split('/').pop().substring(0, 15)}...
                    </span>
                </div>
            );
        }
        
        return (
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    style={{ display: 'none' }}
                    id={`file-${data.fileid}-${visitNumber}`}
                    onChange={(e) => handleFileUpload(e, data, visitNumber)}
                />
                <button 
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => document.getElementById(`file-${data.fileid}-${visitNumber}`).click()}
                    style={{ fontSize: '9px', padding: '1px 4px' }}
                >
                    Choose File
                </button>
                <span style={{ fontSize: '8px', color: '#999', marginLeft: '3px' }}>
                    No file chosen
                </span>
            </div>
        );
    };

    const handleFileView = (filePath) => {
        console.log('Viewing file:', filePath);
        // Implement file view logic - open in new tab/modal
        window.open(`https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/${filePath}`, '_blank');
    };

    const handleFileUpload = (event, rowData, visitNumber) => {
        const file = event.target.files[0];
        if (file) {
            console.log('Uploading file for:', rowData.FILE_NAME, 'Visit:', visitNumber, 'File:', file.name);
            // Implement file upload logic here
        }
    };

    // Column definitions with enhanced styling
    const columnDefs = useMemo(() => [
        {
            headerName: "Sr No",
            field: "serialNumber",
            valueGetter: (params) => params.node ? params.node.rowIndex + 1 : '',
            width: isMobile ? 60 : 80,
            minWidth: 50,
            pinned: 'left',
            lockPosition: true,
            cellStyle: { fontWeight: 'bold', textAlign: 'center', backgroundColor: '#f8f9fa' }
        },
        {
            headerName: "File Name",
            field: "FILE_NAME",
            width: isMobile ? 120 : 150,
            pinned: 'left',
            cellStyle: { fontWeight: 'bold', backgroundColor: '#f8f9fa' }
        },
        {
            headerName: "City",
            field: "city1",
            width: isMobile ? 100 : 120,
            cellStyle: { backgroundColor: '#f8f9fa' }
        },
        {
            headerName: "Store Location",
            field: "STORE_LOCATION",
            width: isMobile ? 100 : 120,
            cellStyle: { backgroundColor: '#f8f9fa' }
        },
        {
            headerName: "No.Of Visits",
            field: "amc_visit",
            width: isMobile ? 80 : 100,
            cellStyle: { textAlign: 'center', backgroundColor: '#f8f9fa' }
        },
        {
            headerName: "Wages",
            field: "wages",
            width: isMobile ? 80 : 100,
            valueFormatter: (params) => params.value ? params.value.toLocaleString() : '0',
            cellStyle: { textAlign: 'right', backgroundColor: '#f8f9fa' }
        },
        {
            headerName: "Site Expense",
            field: "site_expense",
            width: isMobile ? 80 : 100,
            valueFormatter: (params) => params.value ? params.value.toLocaleString() : '0',
            cellStyle: { textAlign: 'right', backgroundColor: '#f8f9fa' }
        },
        {
            headerName: "Po Amount",
            field: "po_amount",
            width: isMobile ? 100 : 120,
            valueFormatter: (params) => params.value ? parseFloat(params.value).toLocaleString() : '0',
            cellStyle: { textAlign: 'right', backgroundColor: '#f8f9fa' }
        },
        {
            headerName: "Supervisor",
            field: "suppliername1",
            width: isMobile ? 120 : 180,
            cellStyle: { backgroundColor: '#f8f9fa' }
        },
        {
            headerName: "Visit Date",
            field: "visitDate1",
            width: isMobile ? 100 : 120,
            cellStyle: { backgroundColor: '#f8f9fa' }
        },
        // Visit 1 Group
        {
            headerName: "Visit1",
            headerClass: 'visit-header visit1-header',
            children: [
                {
                    headerName: "Supervisor",
                    field: "suppliername1",
                    width: isMobile ? 120 : 160,
                    cellStyle: { backgroundColor: '#ffebee', fontSize: '10px' }
                },
                {
                    headerName: "Visit Date",
                    field: "visitDate1",
                    width: isMobile ? 100 : 120,
                    cellStyle: { backgroundColor: '#ffebee', fontSize: '10px' }
                },
                {
                    headerName: "View Report",
                    field: "visit_report1",
                   width: isMobile ? 150 : 180,
                    cellRenderer: FileUploadCellRenderer,
                    cellStyle: { backgroundColor: '#e8f5e8' }
                },
                {
                    headerName: "View Visit Report",
                    field: "view_visit_report1",
                    width: isMobile ? 150 : 180,
                    cellRenderer: FileUploadCellRenderer,
                    cellStyle: { backgroundColor: '#ffebee' }
                },
            ]
        },
        // Visit 2 Group
        {
            headerName: "Visit2",
            headerClass: 'visit-header visit2-header',
            children: [
                {
                    headerName: "Visit Date",
                    field: "visitDate2",
                    width: isMobile ? 100 : 120,
                    cellStyle: { backgroundColor: '#e8f5e8', fontSize: '10px' }
                },
                {
                    headerName: "Visit Report",
                    field: "visit_report2",
                    width: isMobile ? 150 : 180,
                    cellRenderer: FileUploadCellRenderer,
                    cellStyle: { backgroundColor: '#e8f5e8' }
                },
                {
                    headerName: "View Visit Report",
                    field: "view_visit_report2",
                    width: isMobile ? 80 : 100,
                    cellRenderer: () => (
                        <button className="btn btn-sm btn-outline-info" style={{ fontSize: '9px', padding: '1px 4px' }}>
                            View
                        </button>
                    ),
                    cellStyle: { backgroundColor: '#e8f5e8', textAlign: 'center' }
                }
            ]
        },
        // Visit 3 Group
        {
            headerName: "Visit3",
            headerClass: 'visit-header visit3-header',
            children: [
                {
                    headerName: "Supervisor",
                    field: "suppliername3",
                    width: isMobile ? 120 : 160,
                    cellStyle: { backgroundColor: '#e3f2fd', fontSize: '10px' }
                },
                {
                    headerName: "Visit Date",
                    field: "visitDate3",
                    width: isMobile ? 100 : 120,
                    cellStyle: { backgroundColor: '#e3f2fd', fontSize: '10px' }
                },
                {
                    headerName: "Visit Report",
                    field: "visit_report3",
                    width: isMobile ? 150 : 180,
                    cellRenderer: FileUploadCellRenderer,
                    cellStyle: { backgroundColor: '#e3f2fd' }
                }
            ]
        },
        // Visit 4 Group
        {
            headerName: "Visit4",
            headerClass: 'visit-header visit4-header',
            children: [
                {
                    headerName: "Supervisor",
                    field: "suppliername4",
                    width: isMobile ? 120 : 160,
                    cellStyle: { backgroundColor: '#b3e5fc', fontSize: '10px' }
                },
                {
                    headerName: "Visit Date",
                    field: "visitDate4",
                    width: isMobile ? 100 : 120,
                    cellStyle: { backgroundColor: '#b3e5fc', fontSize: '10px' }
                },
                {
                    headerName: "Visit Report",
                    field: "visit_report4",
                    width: isMobile ? 150 : 180,
                    cellRenderer: FileUploadCellRenderer,
                    cellStyle: { backgroundColor: '#b3e5fc' }
                },
                {
                    headerName: "View Visit Report",
                    field: "view_visit_report4",
                    width: isMobile ? 80 : 100,
                    cellRenderer: () => (
                        <button className="btn btn-sm btn-outline-info" style={{ fontSize: '9px', padding: '1px 4px' }}>
                            View
                        </button>
                    ),
                    cellStyle: { backgroundColor: '#b3e5fc', textAlign: 'center' }
                },
                {
                    headerName: "Last Updated Time",
                    field: "lastAmcTime",
                    width: isMobile ? 120 : 140,
                    cellStyle: { backgroundColor: '#b3e5fc', fontSize: '10px' }
                },
                {
                    headerName: "Action",
                    field: "action",
                    width: isMobile ? 60 : 80,
                    cellRenderer: () => (
                        <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: '9px', padding: '1px 4px' }}>
                            📁
                        </button>
                    ),
                    cellStyle: { backgroundColor: '#b3e5fc', textAlign: 'center' }
                }
            ]
        }
    ], [isMobile]);

    const defaultColDef = useMemo(() => ({
        filter: true,
        sortable: true,
        floatingFilter: !isMobile,
        resizable: true,
        suppressMenu: isMobile,
        cellStyle: { textAlign: 'left', fontSize: '11px' }
    }), [isMobile]);

    // Fetch AMC Dashboard data
    const fetchAmcData = async () => {
        setLoading(true);
        try {
            const response = await fetch("https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/amc_dashboard_api.php", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.status === "success" && Array.isArray(result.data)) {
                setRowData(result.data);
                setLastUpdated(result.lastTime || new Date().toISOString());
            } else {
                throw new Error(result.message || "No data received");
            }
        } catch (error) {
            console.error("Error fetching AMC data:", error);
            setRowData([]);
        } finally {
            setLoading(false);
        }
    };

    // Initial data fetch
    useEffect(() => {
        fetchAmcData();
    }, []);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    // Export to Excel
    const downloadExcel = () => {
        if (!gridRef.current?.api) return;
        
        try {
            const params = {
                fileName: `AMC_Dashboard_${new Date().toISOString().split('T')[0]}.csv`,
                allColumns: true,
                onlySelected: false
            };
            gridRef.current.api.exportDataAsCsv(params);
        } catch (error) {
            console.error('Error exporting data:', error);
        }
    };

    // Auto size all columns
    const autoSizeAll = () => {
        if (!gridRef.current?.api) return;
        
        setTimeout(() => {
            const allColumnIds = gridRef.current.api.getColumns()?.map(column => column.getId()) || [];
            if (allColumnIds.length > 0) {
                gridRef.current.api.autoSizeColumns(allColumnIds, false);
            }
        }, 100);
    };

    // Size columns to fit
    const sizeColumnsToFit = () => {
        if (!gridRef.current?.api) return;
        gridRef.current.api.sizeColumnsToFit();
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
                    <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading AMC Dashboard...</p>
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
            <Container fluid={isFullScreen}>
                <Card style={{
                    backgroundColor: themeStyles.cardBg,
                    color: themeStyles.color,
                    border: theme === 'dark' ? '1px solid #495057' : '1px solid #dee2e6',
                    margin: isFullScreen ? 0 : 20,
                    borderRadius: isFullScreen ? 0 : 8
                }}>
                    {/* Header */}
                    <Card.Header style={{
                        background: themeStyles.cardHeader,
                        color: theme === 'dark' ? '#ffffff' : '#000000',
                        fontFamily: "'Maven Pro', sans-serif",
                        padding: '1rem 2rem'
                    }}>
                        <Row className="align-items-center">
                            <Col xs={12} lg={6} className="mb-2 mb-lg-0">
                                <h4 className="mb-0">
                                    AMC Dashboard
                                </h4>
                                <small style={{ opacity: 0.8 }}>
                                    {`${rowData.length} AMC records found`}
                                    {selectedRows.length > 0 && ` | ${selectedRows.length} selected`}
                                </small>
                            </Col>

                            <Col xs={12} lg={6}>
                                <div className="d-flex justify-content-end gap-2 flex-wrap align-items-center">
                                    <ButtonGroup size="sm">
                                        <Button 
                                            variant="success" 
                                            onClick={downloadExcel}
                                            title="Download Excel Export File"
                                        >
                                            <i className="bi bi-file-earmark-excel"></i>
                                            {!isMobile && ' Download Excel Export File'}
                                        </Button>
                                        <Button 
                                            variant="warning" 
                                            onClick={() => {/* Clear pinned logic */}}
                                            title="Clear Pinned"
                                        >
                                            <i className="bi bi-pin-angle"></i>
                                            {!isMobile && ' Clear Pinned'}
                                        </Button>
                                        <Button 
                                            variant="info" 
                                            onClick={() => {/* Pinned logic */}}
                                            title="Pinned"
                                        >
                                            <i className="bi bi-pin-fill"></i>
                                            {!isMobile && ' Pinned'}
                                        </Button>
                                    </ButtonGroup>

                                    <ButtonGroup size="sm">
                                        <Button variant="secondary" onClick={sizeColumnsToFit}>
                                            <i className="bi bi-arrows-angle-contract"></i>
                                            {!isMobile && ' Size To Fit'}
                                        </Button>
                                        <Button variant="info" onClick={autoSizeAll}>
                                            <i className="bi bi-arrows-angle-expand"></i>
                                            {!isMobile && ' Auto-Size All'}
                                        </Button>
                                        <Button variant="outline-info" onClick={autoSizeAll}>
                                            <i className="bi bi-arrows-angle-expand"></i>
                                            {!isMobile && ' Auto-Size All (Skip Header)'}
                                        </Button>
                                    </ButtonGroup>

                                    <ButtonGroup size="sm">
                                        <Button
                                            variant="outline-light"
                                            onClick={toggleFullScreen}
                                        >
                                            <i className={`bi ${isFullScreen ? 'bi-fullscreen-exit' : 'bi-fullscreen'}`}></i>
                                            {!isMobile && (isFullScreen ? ' Exit' : ' Full')}
                                        </Button>
                                        <Button
                                            variant="outline-light"
                                            onClick={toggleTheme}
                                        >
                                            {theme === 'light' ? '🌙' : '☀️'}
                                            {!isMobile && (theme === 'light' ? ' Dark' : ' Light')}
                                        </Button>
                                    </ButtonGroup>

                                    <div style={{ color: themeStyles.color, fontSize: '12px' }}>
                                        Recent Updated Date: {lastUpdated ? new Date(lastUpdated).toLocaleString() : 'N/A'}
                                    </div>

                                    <select 
                                        className="form-select form-select-sm"
                                        style={{ width: 'auto', minWidth: '60px' }}
                                        defaultValue="10"
                                    >
                                        <option value="10">10</option>
                                        <option value="25">25</option>
                                        <option value="50">50</option>
                                        <option value="100">100</option>
                                    </select>
                                </div>
                            </Col>
                        </Row>
                    </Card.Header>

                    {/* Grid Body */}
                    <Card.Body style={{
                        backgroundColor: themeStyles.cardBg,
                        padding: isFullScreen ? 0 : 15
                    }}>
                        {rowData.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '50px',
                                color: themeStyles.color
                            }}>
                                <i className="bi bi-clipboard-data" style={{ fontSize: '3rem', marginBottom: '20px' }}></i>
                                <h5>No AMC data available</h5>
                                <p>Please check your API connection or refresh the page.</p>
                            </div>
                        ) : (
                            <div style={{ height: gridHeight, backgroundColor: 'white', border: '1px solid #ddd' }}>
                                <style>
                                    {`
                                        .visit-header {
                                            text-align: center !important;
                                            font-weight: bold !important;
                                        }
                                        .visit1-header {
                                            background-color: #ffebee !important;
                                        }
                                        .visit2-header {
                                            background-color: #e8f5e8 !important;
                                        }
                                        .visit3-header {
                                            background-color: #e3f2fd !important;
                                        }
                                        .visit4-header {
                                            background-color: #b3e5fc !important;
                                        }
                                        .ag-header-group-cell-label {
                                            font-weight: bold !important;
                                        }
                                        .ag-theme-alpine .ag-header-cell {
                                            font-size: ${isMobile ? '10px' : '12px'} !important;
                                        }
                                        .ag-theme-alpine .ag-cell {
                                            font-size: ${isMobile ? '9px' : '11px'} !important;
                                        }
                                        .ag-theme-alpine .ag-header-group-cell {
                                            font-weight: bold !important;
                                            text-align: center !important;
                                        }
                                        ${theme === 'dark' ? `
                                            .ag-theme-alpine {
                                                --ag-background-color: #212529;
                                                --ag-header-background-color: #343a40;
                                                --ag-odd-row-background-color: #2c3034;
                                                --ag-even-row-background-color: #212529;
                                                --ag-row-hover-color: #495057;
                                                --ag-foreground-color: #f8f9fa;
                                                --ag-header-foreground-color: #f8f9fa;
                                                --ag-border-color: #495057;
                                                --ag-selected-row-background-color: #28a745;
                                                --ag-input-background-color: #343a40;
                                                --ag-input-border-color: #495057;
                                            }
                                        ` : ''}
                                    `}
                                </style>
                                <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' }}>
                                    <AgGridReact
                                        ref={gridRef}
                                        rowData={rowData}
                                        columnDefs={columnDefs}
                                        defaultColDef={defaultColDef}
                                        pagination={true}
                                        paginationPageSize={isMobile ? 10 : 20}
                                        rowSelection="single"
                                        suppressMovableColumns={isMobile}
                                        enableRangeSelection={!isMobile}
                                        animateRows={!isMobile}
                                        headerHeight={isMobile ? 30 : 35}
                                        rowHeight={isMobile ? 28 : 32}
                                        groupHeaderHeight={isMobile ? 35 : 40}
                                        onGridReady={() => {
                                            console.log('AMC Grid is ready');
                                            setTimeout(() => autoSizeAll(), 500);
                                        }}
                                        onSelectionChanged={(event) => {
                                            const selectedNodes = event.api.getSelectedNodes();
                                            const selectedData = selectedNodes.map(node => node.data);
                                            setSelectedRows(selectedData);
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </Card.Body>

                    {/* Footer with pagination info */}
                    <Card.Footer style={{
                        backgroundColor: themeStyles.cardBg,
                        borderTop: '1px solid #ddd',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '12px',
                        padding: '10px 20px'
                    }}>
                        <div>
                            Page Size: 
                            <select className="form-select form-select-sm d-inline mx-2" style={{ width: 'auto' }}>
                                <option>10</option>
                                <option>25</option>
                                <option>50</option>
                            </select>
                        </div>
                        <div>
                            1 to {Math.min(10, rowData.length)} of {rowData.length}
                        </div>
                        <div>
                            Page 1 of {Math.ceil(rowData.length / 10)}
                        </div>
                        <div style={{ color: '#ccc', fontSize: '10px', textAlign: 'right' }}>
                            Activate Windows<br/>
                            <small>Go to Settings to activate Windows.</small>
                        </div>
                    </Card.Footer>
                </Card>
            </Container>
        </div>
    );
};

export default AmcDashboard;