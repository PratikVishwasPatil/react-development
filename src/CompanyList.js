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
import { Container, Button, Row, Col, Card, ButtonGroup, Form } from 'react-bootstrap';
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

const CustomerListGrid = () => {
    const navigate = useNavigate();
    const [theme, setTheme] = useState('light');
    const [rowData, setRowData] = useState([]);
    const [columnDefs, setColumnDefs] = useState([]);
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const gridRef = useRef();

    // Handle window resize for mobile responsiveness
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Column definitions for customer list data
    const generateColumnDefs = () => {
        return [
            {
                headerName: "Sr No",
                field: "serialNumber",
                valueGetter: (params) => params.node ? params.node.rowIndex + 1 : '',
                width: isMobile ? 60 : 80,
                minWidth: 50,
                pinned: 'left',
                lockPosition: true,
                cellStyle: { fontWeight: 'bold', textAlign: 'center' },
                filter: false,
                sortable: false,
                suppressMenu: true,
            },
            {
                field: "CUSTOMER_NAME",
                headerName: "Customer Name",
                width: isMobile ? 200 : 300,
                pinned: 'left',
                checkboxSelection: true,
                // No headerCheckboxSelection — single select only
                filter: 'agTextColumnFilter',
                cellStyle: { fontWeight: 'bold', textAlign: 'left' },
            },
            {
                field: "categoryName",
                headerName: "Category",
                width: isMobile ? 120 : 150,
                filter: 'agTextColumnFilter',
                cellStyle: { textAlign: 'right' },
            },
            {
                field: "EMAIL",
                headerName: "Email",
                width: isMobile ? 180 : 220,
                filter: 'agTextColumnFilter',
                cellStyle: { textAlign: 'right' },
                valueFormatter: (params) => (!params.value || params.value === 'na@gmail.com') ? '—' : params.value,
            },
            {
                field: "CustomerContact",
                headerName: "Contact Number",
                width: isMobile ? 140 : 160,
                filter: 'agTextColumnFilter',
                cellStyle: { textAlign: 'right' },
                valueFormatter: (params) => (!params.value || params.value === '0') ? '—' : params.value,
            },
            {
                field: "CONTACT_PERSON_NAME",
                headerName: "Contact Person",
                width: isMobile ? 160 : 200,
                filter: 'agTextColumnFilter',
                cellStyle: { textAlign: 'right' },
                valueFormatter: (params) => params.value || '—',
            },
            {
                field: "CONTACT_PERSON_DESIGNATION",
                headerName: "Designation",
                width: isMobile ? 140 : 170,
                filter: 'agTextColumnFilter',
                cellStyle: { textAlign: 'right' },
                valueFormatter: (params) => params.value || '—',
            },
            {
                field: "city",
                headerName: "City",
                width: isMobile ? 120 : 150,
                filter: 'agTextColumnFilter',
                cellStyle: { textAlign: 'right' },
                valueFormatter: (params) => params.value || '—',
            },
            {
                field: "state",
                headerName: "State",
                width: isMobile ? 120 : 150,
                filter: 'agTextColumnFilter',
                cellStyle: { textAlign: 'right' },
                valueFormatter: (params) => params.value || '—',
            },
            {
                field: "country",
                headerName: "Country",
                width: isMobile ? 100 : 130,
                filter: 'agTextColumnFilter',
                cellStyle: { textAlign: 'right' },
                valueFormatter: (params) => params.value || '—',
            },
            {
                field: "GSTN",
                headerName: "GSTN",
                width: isMobile ? 150 : 180,
                filter: 'agTextColumnFilter',
                cellStyle: { textAlign: 'right', fontFamily: 'monospace' },
                valueFormatter: (params) => params.value || '—',
            },
            {
                field: "PAN",
                headerName: "PAN",
                width: isMobile ? 120 : 140,
                filter: 'agTextColumnFilter',
                cellStyle: { textAlign: 'right', fontFamily: 'monospace' },
                valueFormatter: (params) => params.value || '—',
            },
            {
                field: "DETAIL_ADDRESS",
                headerName: "Address",
                width: isMobile ? 200 : 280,
                filter: 'agTextColumnFilter',
                cellStyle: { textAlign: 'right', whiteSpace: 'normal', lineHeight: '1.4' },
                wrapText: true,
                autoHeight: true,
                valueFormatter: (params) => params.value ? params.value.replace(/\n/g, ', ') : '—',
            },
            {
                field: "COMMENTS",
                headerName: "Comments",
                width: isMobile ? 150 : 200,
                filter: 'agTextColumnFilter',
                cellStyle: { textAlign: 'right' },
                valueFormatter: (params) => params.value || '—',
            },
            // Hidden fields
            {
                field: "CUSTOMER_ID",
                headerName: "Customer ID",
                hide: true,
                width: 0,
            },
            {
                field: "ADDRESS_ID",
                headerName: "Address ID",
                hide: true,
                width: 0,
            },
        ];
    };

    const defaultColDef = useMemo(() => ({
        filter: true,
        sortable: true,
        floatingFilter: !isMobile,
        resizable: true,
        suppressMenu: isMobile,
        cellStyle: { textAlign: 'left' }
    }), [isMobile]);

    // Fetch customer list data
    const fetchCustomerListData = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/company/listcustomeraggrid.php",
                {
                    method: "GET",
                    headers: { "Content-Type": "application/json" }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.status === true && Array.isArray(data.data)) {
                setRowData(data.data);
                toast.success(`Loaded ${data.count} customers successfully`);
            } else {
                throw new Error(data.message || "No data received");
            }
        } catch (error) {
            console.error("Error fetching customer data:", error);
            toast.error(`Error fetching data: ${error.message}`);
            setRowData([]);
        } finally {
            setLoading(false);
        }
    };

    // Initial data fetch
    useEffect(() => {
        setColumnDefs(generateColumnDefs());
        fetchCustomerListData();
    }, [isMobile]);

    // Quick filter (global search)
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchText(value);
        if (gridRef.current?.api) {
            gridRef.current.api.setGridOption('quickFilterText', value);
        }
    };

    // Direct redirect on checkbox selection — no button needed
    const onSelectionChanged = (event) => {
        const selectedNodes = event.api.getSelectedNodes();
        const selectedData = selectedNodes.map(node => node.data);

        if (selectedData.length === 1) {
            const record = selectedData[0];

            if (!record.CUSTOMER_ID) {
                toast.error('Customer ID not found in selected record');
                return;
            }

            navigate(`/customers/details/${record.CUSTOMER_ID}`, {
                state: {
                    customerId: record.CUSTOMER_ID,
                    customerName: record.CUSTOMER_NAME,
                    email: record.EMAIL,
                    contactNumber: record.CustomerContact,
                    addressId: record.ADDRESS_ID,
                    city: record.city,
                    state: record.state,
                    country: record.country,
                }
            });
        }
    };

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
    const toggleFullScreen = () => setIsFullScreen(!isFullScreen);

    // Export to CSV
    const downloadCSV = () => {
        if (!gridRef.current?.api) return;
        try {
            const params = {
                fileName: `CustomerList_${new Date().toISOString().split('T')[0]}.csv`,
                allColumns: false,
                columnKeys: columnDefs
                    .filter(c => !c.hide)
                    .map(c => c.field)
                    .filter(Boolean),
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
                const allColumnIds = gridRef.current.api.getColumns()?.map(col => col.getId()) || [];
                if (allColumnIds.length > 0) {
                    gridRef.current.api.autoSizeColumns(allColumnIds, false);
                }
            }, 100);
        } catch (error) {
            console.error('Error auto-sizing columns:', error);
        }
    };

    const handleRefresh = () => {
        fetchCustomerListData();
        toast.info('Refreshing customer data...');
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
    const gridHeight = isFullScreen ? 'calc(100vh - 230px)' : (isMobile ? '400px' : '600px');

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
                    <p className="mt-3">Loading customer data...</p>
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
                                    <i className="bi bi-people me-2"></i>
                                    Customer List Dashboard
                                </h4>
                                <small style={{ opacity: 0.8 }}>
                                    {`${rowData.length} records found`}
                                    {' | ☑ Click checkbox to open customer details'}
                                </small>
                            </Col>

                            <Col xs={12} lg={6}>
                                <div className="d-flex justify-content-end gap-2 flex-wrap align-items-center">
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={handleRefresh}
                                        title="Refresh data"
                                    >
                                        <i className="bi bi-arrow-clockwise"></i>
                                        {!isMobile && ' Refresh'}
                                    </Button>

                                    <ButtonGroup size="sm">
                                        <Button variant="success" onClick={downloadCSV}>
                                            <i className="bi bi-file-earmark-excel"></i>
                                            {!isMobile && ' Export CSV'}
                                        </Button>
                                        <Button variant="info" onClick={autoSizeAll}>
                                            <i className="bi bi-arrows-angle-expand"></i>
                                            {!isMobile && ' Auto Size'}
                                        </Button>
                                    </ButtonGroup>

                                    <ButtonGroup size="sm">
                                        <Button variant="outline-light" onClick={toggleFullScreen}>
                                            <i className={`bi ${isFullScreen ? 'bi-fullscreen-exit' : 'bi-fullscreen'}`}></i>
                                            {!isMobile && (isFullScreen ? ' Exit' : ' Full')}
                                        </Button>
                                        <Button variant="outline-light" onClick={toggleTheme}>
                                            {theme === 'light' ? '🌙' : '☀️'}
                                            {!isMobile && (theme === 'light' ? ' Dark' : ' Light')}
                                        </Button>
                                    </ButtonGroup>
                                </div>
                            </Col>
                        </Row>
                    </Card.Header>

                    {/* Search / Filter Bar */}
                    <div style={{
                        padding: '1rem 2rem',
                        backgroundColor: theme === 'dark' ? '#2c3034' : '#f8f9fa',
                        borderBottom: theme === 'dark' ? '1px solid #495057' : '1px solid #dee2e6'
                    }}>
                        <Row className="align-items-center">
                            <Col xs={12} md={6} lg={4}>
                                <Form.Group className="mb-0">
                                    <Form.Label className="mb-1 small">
                                        <i className="bi bi-search me-2"></i>
                                        Quick Search
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Search customers..."
                                        value={searchText}
                                        onChange={handleSearchChange}
                                        size="sm"
                                        style={{
                                            backgroundColor: theme === 'dark' ? '#343a40' : '#ffffff',
                                            color: theme === 'dark' ? '#f8f9fa' : '#212529',
                                            borderColor: theme === 'dark' ? '#495057' : '#dee2e6'
                                        }}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>

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
                                <i className="bi bi-people" style={{ fontSize: '3rem', marginBottom: '20px' }}></i>
                                <h5>No customer data available</h5>
                                <p>Could not load customer records. Please try refreshing.</p>
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
                                    onSelectionChanged={onSelectionChanged}
                                    suppressMovableColumns={isMobile}
                                    rowMultiSelectWithClick={false}
                                    animateRows={!isMobile}
                                    enableCellTextSelection={true}
                                    suppressHorizontalScroll={false}
                                    headerHeight={isMobile ? 40 : 48}
                                    rowHeight={isMobile ? 35 : 42}
                                    onGridReady={() => {
                                        console.log('Customer List Grid is ready');
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

export default CustomerListGrid;