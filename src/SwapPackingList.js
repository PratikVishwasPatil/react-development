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
import { Container, Button, Row, Col, Card, ButtonGroup } from 'react-bootstrap';
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

const PackingListGrid = () => {
    const navigate = useNavigate();
    const [theme, setTheme] = useState('light');
    const [rowData, setRowData] = useState([]);
    const [columnDefs, setColumnDefs] = useState([]);
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [autoNavigateOnSelect, setAutoNavigateOnSelect] = useState(false);
    const gridRef = useRef();

    // Handle window resize for mobile responsiveness
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Column definitions for packing list data
    const generateColumnDefs = () => {
        const baseColumns = [
            {
                headerName: "Sr No",
                field: "serialNumber",
                valueGetter: (params) => params.node ? params.node.rowIndex + 1 : '',
                width: isMobile ? 60 : 80,
                minWidth: 50,
                pinned: 'left',
                lockPosition: true,
                cellStyle: { fontWeight: 'bold', textAlign: 'center' }
            },
            {
                field: "file_name",
                headerName: "File Name",
                width: isMobile ? 200 : 300,
                pinned: 'left',
                checkboxSelection: true,
                headerCheckboxSelection: true,
                cellStyle: { fontWeight: 'bold' },
                cellRenderer: (params) => {
                    return `${params.value}`;
                }
            },
            // Hidden field for fileid
            {
                field: "fileid",
                headerName: "File ID",
                hide: true,
                width: 0
            }
        ];

        return baseColumns;
    };

    const defaultColDef = useMemo(() => ({
        filter: true,
        sortable: true,
        floatingFilter: !isMobile,
        resizable: true,
        suppressMenu: isMobile,
       // cellStyle: { textAlign: 'right' }
    }), [isMobile]);

    // Fetch packing list data
    const fetchPackingListData = async () => {
        setLoading(true);
        try {
            const response = await fetch("https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PackingListApi.php", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.status === "success" && Array.isArray(data.data)) {
                setRowData(data.data);
                toast.success(`Loaded ${data.count} packing list records`);
            } else if (Array.isArray(data)) {
                setRowData(data);
                toast.success(`Loaded ${data.length} packing list records`);
            } else {
                throw new Error("No data received");
            }
        } catch (error) {
            console.error("Error fetching packing list data:", error);
            toast.error(`Error fetching data: ${error.message}`);
            setRowData([]);
        } finally {
            setLoading(false);
        }
    };

    // Initial data fetch
    useEffect(() => {
        setColumnDefs(generateColumnDefs());
        fetchPackingListData();
    }, [isMobile]);

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
            toast.info(`Navigating to details for ${selectedRecord.file_name}...`);

            // Navigate after a short delay to show the toast
            setTimeout(() => {
                // Navigate to the packing list details route with fileid
                navigate(`/packing-list/details/${selectedRecord.fileid}`);
            }, 500);
        }
    };

    // Handle navigation to details page (manual navigation)
    const handleNavigateToDetails = () => {
        if (selectedRows.length === 0) {
            toast.error('Please select at least one record to proceed');
            return;
        }

        if (selectedRows.length > 1) {
            toast.error('Please select only one record at a time');
            return;
        }

        const selectedRecord = selectedRows[0];

        // Check if fileid exists
        if (!selectedRecord.fileid) {
            toast.error('File ID not found in selected record');
            return;
        }

        // Navigate to the packing list details route with fileid
        navigate(`/packing-list/details/${selectedRecord.fileid}`, {
            state: { fileName: selectedRecord.file_name }
        });
    };

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    // Toggle auto-navigation mode
    const toggleAutoNavigate = () => {
        setAutoNavigateOnSelect(!autoNavigateOnSelect);
        toast.info(`Auto-navigation ${!autoNavigateOnSelect ? 'enabled' : 'disabled'}`);
    };

    // Export to CSV
    const downloadExcel = () => {
        if (!gridRef.current?.api) return;

        try {
            const params = {
                fileName: `PackingList_${new Date().toISOString().split('T')[0]}.csv`,
                allColumns: true,
                onlySelected: false
            };
            gridRef.current.api.exportDataAsCsv(params);
            toast.success('Data exported successfully!');
        } catch (error) {
            console.error('Error exporting data:', error);
            toast.error('Error exporting data');
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
    const handleRefresh = () => {
        fetchPackingListData();
        toast.info('Refreshing data...');
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
                    <p className="mt-3">Loading packing list data...</p>
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
                                    <i className="bi bi-box-seam me-2"></i>
                                    Packing List Dashboard
                                </h4>
                                <small style={{ opacity: 0.8 }}>
                                    {`${rowData.length} records found`}
                                    {selectedRows.length > 0 && ` | ${selectedRows.length} selected`}
                                    {autoNavigateOnSelect && ' | Auto-nav ON'}
                                </small>
                            </Col>

                            <Col xs={12} lg={6}>
                                <div className="d-flex justify-content-end gap-2 flex-wrap align-items-center">
                                    {/* Refresh Button */}
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={handleRefresh}
                                        title="Refresh data"
                                    >
                                        <i className="bi bi-arrow-clockwise"></i>
                                        {!isMobile && ' Refresh'}
                                    </Button>

                                    {/* Auto-Navigate Toggle */}
                                    <Button
                                        variant={autoNavigateOnSelect ? "success" : "outline-secondary"}
                                        size="sm"
                                        onClick={toggleAutoNavigate}
                                        title="Toggle auto-navigation on checkbox select"
                                    >
                                        <i className="bi bi-lightning"></i>
                                        {!isMobile && ' Auto'}
                                    </Button>

                                    {/* View Details Button (only show if auto-navigate is disabled) */}
                                    {!autoNavigateOnSelect && selectedRows.length > 0 && (
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={handleNavigateToDetails}
                                        >
                                            <i className="bi bi-eye"></i>
                                            {!isMobile && ' View Details'}
                                        </Button>
                                    )}

                                    <ButtonGroup size="sm">
                                        <Button variant="success" onClick={downloadExcel}>
                                            <i className="bi bi-file-earmark-excel"></i>
                                            {!isMobile && ' Export CSV'}
                                        </Button>
                                        <Button variant="info" onClick={autoSizeAll}>
                                            <i className="bi bi-arrows-angle-expand"></i>
                                            {!isMobile && ' Auto Size'}
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
                                <i className="bi bi-box-seam" style={{ fontSize: '3rem', marginBottom: '20px' }}></i>
                                <h5>No packing list data available</h5>
                                <p>Please check your API connection or try refreshing.</p>
                                <Button variant="primary" onClick={handleRefresh}>
                                    <i className="bi bi-arrow-clockwise me-2"></i>
                                    Refresh Data
                                </Button>
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
                                    paginationPageSize={isMobile ? 10 : 25}
                                    rowSelection="single"
                                    suppressRowClickSelection={true} 
                                    onSelectionChanged={onSelectionChanged}
                                    suppressMovableColumns={isMobile}
                                    enableRangeSelection={!isMobile}
                                    rowMultiSelectWithClick={false}
                                    animateRows={!isMobile}
                                    enableCellTextSelection={true}
                                    suppressHorizontalScroll={false}
                                    headerHeight={isMobile ? 40 : 48}
                                    rowHeight={isMobile ? 35 : 42}
                                    onGridReady={(params) => {
                                        console.log('Packing List Grid is ready');
                                        setTimeout(() => autoSizeAll(), 500);
                                    }}
                                />
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </Container>

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

export default PackingListGrid;