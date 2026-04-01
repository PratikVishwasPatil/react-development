import React, { useEffect, useMemo, useState, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
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
import { Container, Button, Row, Col, Card, Modal, Form, Spinner, Badge } from 'react-bootstrap';
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

const WorkerAssignment = () => {
    const [theme, setTheme] = useState('light');
    const [workerData, setWorkerData] = useState([]);
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Current month
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Current year
    
    // Modal states
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedWorker, setSelectedWorker] = useState(null);
    
    const gridRef = useRef();

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // API URL
    const WORKER_ASSIGNMENT_API_URL = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Hr/getWorkerAssignByMonthApi.php";

    // Fetch worker assignment data
    const fetchWorkerData = async (month = selectedMonth) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('month', month.toString().padStart(2, '0'));

            const response = await fetch(WORKER_ASSIGNMENT_API_URL, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.status && result.data) {
                setWorkerData(result.data);
                toast.success(`Loaded ${result.count} worker assignment records for month ${result.month}`);
            } else {
                throw new Error("No data received");
            }
        } catch (error) {
            console.error("Error fetching worker data:", error);
            toast.error(`Error fetching worker data: ${error.message}`);
            setWorkerData([]);
        } finally {
            setLoading(false);
        }
    };

    // Load data on mount and when month changes
    useEffect(() => {
        fetchWorkerData(selectedMonth);
    }, [selectedMonth]);

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

    // Documents Badge Renderer
    const DocumentsBadgeRenderer = (props) => {
        const { value } = props;
        
        if (!value) return <span>-</span>;

        const docs = value.split(',').filter(d => d.trim());
        
        const docLabels = {
            'esicIp': 'ESIC IP',
            'epf': 'EPF',
            'identity': 'ID Card',
            'wcPolicy': 'WC Policy'
        };

        return (
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {docs.map((doc, index) => (
                    <Badge 
                        key={index}
                        bg="info" 
                        style={{ 
                            fontSize: '10px',
                            padding: '4px 8px'
                        }}
                    >
                        {docLabels[doc.trim()] || doc.trim()}
                    </Badge>
                ))}
            </div>
        );
    };

    // Status Badge Renderer
    const StatusBadgeRenderer = (props) => {
        const { value } = props;
        
        const statusConfig = {
            '0': { label: 'Inactive', bg: 'danger' },
            '1': { label: 'Active', bg: 'success' }
        };

        const config = statusConfig[value] || { label: 'Unknown', bg: 'secondary' };

        return (
            <Badge bg={config.bg} style={{ fontSize: '11px', padding: '5px 10px' }}>
                {config.label}
            </Badge>
        );
    };

    // Site Incharge Badge Renderer
    const SiteInchargeRenderer = (props) => {
        const { value } = props;
        
        if (value === 'yes') {
            return (
                <Badge bg="warning" text="dark" style={{ fontSize: '11px', padding: '5px 10px' }}>
                    <i className="bi bi-star-fill"></i> Yes
                </Badge>
            );
        }
        
        return <span style={{ color: '#999' }}>No</span>;
    };

    // Location Badge Renderer
    const LocationBadgeRenderer = (props) => {
        const { value } = props;
        
        const locationConfig = {
            'Inside': { bg: 'primary' },
            'Outside': { bg: 'secondary' }
        };

        const config = locationConfig[value] || { bg: 'secondary' };

        return (
            <Badge bg={config.bg} style={{ fontSize: '11px', padding: '5px 10px' }}>
                {value}
            </Badge>
        );
    };

    // Company Type Badge Renderer
    const CompanyTypeBadgeRenderer = (props) => {
        const { value } = props;
        
        const companyConfig = {
            'Surya': { bg: 'success' },
            'Galaxy': { bg: 'info' }
        };

        const config = companyConfig[value] || { bg: 'secondary' };

        return (
            <Badge bg={config.bg} style={{ fontSize: '11px', padding: '5px 10px' }}>
                {value}
            </Badge>
        );
    };

    // Actions Renderer
    const ActionsRenderer = (props) => {
        const { data } = props;

        const handleViewDetails = () => {
            setSelectedWorker(data);
            setShowDetailsModal(true);
        };

        return (
            <button 
                onClick={handleViewDetails}
                style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    backgroundColor: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer'
                }}
            >
                <i className="bi bi-eye"></i> View
            </button>
        );
    };

    // Theme styles
    const getThemeStyles = () => {
        if (theme === 'dark') {
            return {
                backgroundColor: 'linear-gradient(135deg, #21262d 0%, #161b22 100%)',
                color: '#f8f9fa',
                cardBg: '#2d3748',
                cardHeader: 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)',
                buttonVariant: 'outline-light',
                textClass: 'text-light',
                borderClass: 'border-secondary'
            };
        }
        return {
            backgroundColor: 'linear-gradient(135deg,rgba(252, 252, 255, 0.96) 0%,rgb(229, 235, 240) 100%)',
            color: '#212529',
            cardBg: '#ffffff',
            cardHeader: 'linear-gradient(135deg,rgba(218, 208, 208, 0.67) 0%,rgba(97, 91, 91, 0.56) 100%)',
            buttonVariant: 'outline-dark',
            textClass: 'text-dark',
            borderClass: 'border-light'
        };
    };

    const themeStyles = getThemeStyles();

    // Apply theme to document body
    useEffect(() => {
        if (theme === 'dark') {
            document.body.style.background = 'linear-gradient(135deg, #21262d 0%, #161b22 100%)';
            document.body.style.color = '#f8f9fa';
            document.body.style.minHeight = '100vh';
        } else {
            document.body.style.background = 'linear-gradient(135deg,rgba(252, 252, 255, 0.96) 0%,rgb(229, 235, 240) 100%)';
            document.body.style.color = '#212529';
            document.body.style.minHeight = '100vh';
        }

        return () => {
            document.body.style.background = '';
            document.body.style.color = '';
            document.body.style.minHeight = '';
        };
    }, [theme]);

    // AG Grid column definitions
    const columnDefs = useMemo(() => [
        {
            headerName: "Employee ID",
            field: "emp_id",
            filter: "agTextColumnFilter",
            sortable: true,
            width: 130,
            pinned: 'left',
            lockPosition: true,
            checkboxSelection: true,
            headerCheckboxSelection: true,
            cellStyle: { fontWeight: 'bold', textAlign: 'center' }
        },
        {
            headerName: "File ID",
            field: "file_id",
            filter: "agTextColumnFilter",
            sortable: true,
            width: 120,
            cellStyle: { textAlign: 'center' }
        },
        {
            headerName: "Location",
            field: "location",
            cellRenderer: LocationBadgeRenderer,
            filter: "agTextColumnFilter",
            sortable: true,
            width: 120
        },
        {
            headerName: "Company Type",
            field: "companyType",
            cellRenderer: CompanyTypeBadgeRenderer,
            filter: "agTextColumnFilter",
            sortable: true,
            width: 140
        },
        {
            headerName: "Documents",
            field: "doc",
            cellRenderer: DocumentsBadgeRenderer,
            width: 300,
            filter: "agTextColumnFilter",
            sortable: false
        },
        {
            headerName: "Status",
            field: "status",
            cellRenderer: StatusBadgeRenderer,
            filter: "agTextColumnFilter",
            sortable: true,
            width: 120
        },
        {
            headerName: "Site Incharge",
            field: "is_site_incharge",
            cellRenderer: SiteInchargeRenderer,
            filter: "agTextColumnFilter",
            sortable: true,
            width: 140
        },
        {
            headerName: "Assignment Date",
            field: "date",
            filter: "agDateColumnFilter",
            sortable: true,
            width: 150,
            cellStyle: { textAlign: 'center' },
            valueFormatter: (params) => {
                if (!params.value) return '-';
                const date = new Date(params.value);
                return date.toLocaleDateString('en-IN', { 
                    day: '2-digit', 
                    month: 'short', 
                    year: 'numeric' 
                });
            }
        },
        {
            headerName: "Actions",
            cellRenderer: ActionsRenderer,
            width: 100,
            suppressMenu: true,
            sortable: false,
            filter: false
        }
    ], [isMobile]);

    const defaultColDef = useMemo(() => ({
        resizable: true,
        sortable: true,
        filter: true,
        floatingFilter: !isMobile,
        suppressMenu: isMobile,
        flex: isMobile ? 1 : 0,
        cellStyle: { textAlign: 'left' }
    }), [isMobile]);

    const onGridReady = (params) => {
        console.log('Worker Assignment Grid is ready');
    };

    const handleExportCSV = () => {
        if (gridRef.current && gridRef.current.api) {
            gridRef.current.api.exportDataAsCsv({
                fileName: `Worker_Assignment_${selectedYear}_${selectedMonth.toString().padStart(2, '0')}.csv`
            });
            toast.success('Data exported to CSV');
        }
    };

    const handleRefresh = () => {
        fetchWorkerData(selectedMonth);
    };

    const handleMonthChange = (e) => {
        const month = parseInt(e.target.value);
        setSelectedMonth(month);
    };

    const getGridHeight = () => {
        if (isFullScreen) {
            return isMobile ? 'calc(100vh - 200px)' : 'calc(100vh - 220px)';
        }
        return isMobile ? '400px' : '500px';
    };

    const containerStyles = isFullScreen ? {
        margin: 0,
        padding: 0,
        maxWidth: '100%',
        width: '100vw'
    } : {};

    const cardStyles = isFullScreen ? {
        margin: 0,
        borderRadius: 0,
        height: '100vh',
        border: 'none'
    } : {
        margin: isMobile ? '10px' : '20px',
        borderRadius: '8px'
    };

    // Get statistics
    const getStatistics = () => {
        const total = workerData.length;
        const active = workerData.filter(w => w.status === '1').length;
        const inactive = workerData.filter(w => w.status === '0').length;
        const siteIncharge = workerData.filter(w => w.is_site_incharge === 'yes').length;
        const insideLocation = workerData.filter(w => w.location === 'Inside').length;
        const outsideLocation = workerData.filter(w => w.location === 'Outside').length;

        return { total, active, inactive, siteIncharge, insideLocation, outsideLocation };
    };

    const stats = getStatistics();

    if (loading && workerData.length === 0) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: theme === 'dark'
                    ? 'linear-gradient(135deg, #21262d 0%, #161b22 100%)'
                    : 'linear-gradient(135deg,rgba(252, 252, 255, 0.96) 0%,rgb(229, 235, 240) 100%)'
            }}>
                <div style={{ textAlign: 'center', color: themeStyles.color }}>
                    <Spinner animation="border" style={{ width: '3rem', height: '3rem' }} />
                    <p className="mt-3">Loading worker assignment data...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: theme === 'dark'
                ? 'linear-gradient(135deg, #21262d 0%, #161b22 100%)'
                : 'linear-gradient(135deg,rgba(252, 252, 255, 0.96) 0%,rgb(229, 235, 240) 100%)',
            color: themeStyles.color,
            padding: 0,
            margin: 0,
            overflow: isFullScreen ? 'hidden' : 'auto'
        }}>
            <Container
                fluid={isFullScreen}
                style={containerStyles}
                className={isFullScreen ? 'p-0' : ''}
            >
                <Card style={{
                    backgroundColor: themeStyles.cardBg,
                    color: themeStyles.color,
                    border: theme === 'dark' ? '1px solid #495057' : '1px solid #dee2e6',
                    ...cardStyles
                }}>
                    {/* Header */}
                    <Card.Header style={{
                        background: themeStyles.cardHeader,
                        color: '#ffffff',
                        fontFamily: "'Maven Pro', sans-serif",
                        padding: isMobile ? '10px 15px' : '0.5rem 2rem',
                        flexShrink: 0,
                        fontWeight: '100'
                    }}>
                        <Row className="align-items-center g-2">
                            <Col xs={12} lg={4} className="mb-2 mb-lg-0">
                                <h4
                                    className={`mb-1 ${isMobile ? 'fs-6' : ''}`}
                                    style={{
                                        fontFamily: "'Maven Pro', sans-serif",
                                        fontWeight: '100',
                                        color: 'black'
                                    }}
                                >
                                    Worker Assignment Management
                                </h4>
                                <small style={{ color: '#666', fontSize: '0.8rem' }}>
                                    {`${stats.total} workers`}
                                    {selectedRows.length > 0 && ` | ${selectedRows.length} selected`}
                                </small>
                            </Col>

                            <Col xs={12} lg={4} className="mb-2 mb-lg-0">
                                <Form.Group>
                                    <Form.Select 
                                        size="sm"
                                        value={selectedMonth}
                                        onChange={handleMonthChange}
                                        style={{ 
                                            maxWidth: '200px',
                                            margin: isMobile ? '0' : '0 auto'
                                        }}
                                    >
                                        <option value="1">January</option>
                                        <option value="2">February</option>
                                        <option value="3">March</option>
                                        <option value="4">April</option>
                                        <option value="5">May</option>
                                        <option value="6">June</option>
                                        <option value="7">July</option>
                                        <option value="8">August</option>
                                        <option value="9">September</option>
                                        <option value="10">October</option>
                                        <option value="11">November</option>
                                        <option value="12">December</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col xs={12} lg={4}>
                                <div className="d-flex justify-content-end gap-1 flex-wrap">
                                    <Button
                                        variant="success"
                                        size="sm"
                                        onClick={handleRefresh}
                                        disabled={loading}
                                        title="Refresh Data"
                                    >
                                        <i className="bi bi-arrow-clockwise"></i> {isMobile ? '' : 'Refresh'}
                                    </Button>

                                    <Button
                                        variant="success"
                                        size="sm"
                                        onClick={handleExportCSV}
                                        title="Download CSV"
                                    >
                                        <i className="bi bi-download"></i> {isMobile ? '' : 'Export'}
                                    </Button>

                                    <Button
                                        variant="outline-light"
                                        size="sm"
                                        onClick={toggleFullScreen}
                                        title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
                                    >
                                        <i className={`bi ${isFullScreen ? 'bi-fullscreen-exit' : 'bi-fullscreen'}`}></i>
                                    </Button>

                                    <Button
                                        variant="outline-light"
                                        size="sm"
                                        onClick={toggleTheme}
                                        title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
                                    >
                                        {theme === 'light' ? '🌙' : '☀️'}
                                    </Button>
                                </div>
                            </Col>
                        </Row>

                        {/* Statistics Row */}
                        <Row className="mt-3 g-2">
                            <Col xs={6} md={2}>
                                <div style={{ 
                                    backgroundColor: 'rgba(40, 167, 69, 0.2)', 
                                    padding: '8px', 
                                    borderRadius: '5px',
                                    textAlign: 'center'
                                }}>
                                    <small style={{ color: '#28a745', fontWeight: 'bold' }}>Active</small>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#28a745' }}>{stats.active}</div>
                                </div>
                            </Col>
                            <Col xs={6} md={2}>
                                <div style={{ 
                                    backgroundColor: 'rgba(220, 53, 69, 0.2)', 
                                    padding: '8px', 
                                    borderRadius: '5px',
                                    textAlign: 'center'
                                }}>
                                    <small style={{ color: '#dc3545', fontWeight: 'bold' }}>Inactive</small>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#dc3545' }}>{stats.inactive}</div>
                                </div>
                            </Col>
                            <Col xs={6} md={2}>
                                <div style={{ 
                                    backgroundColor: 'rgba(255, 193, 7, 0.2)', 
                                    padding: '8px', 
                                    borderRadius: '5px',
                                    textAlign: 'center'
                                }}>
                                    <small style={{ color: '#ffc107', fontWeight: 'bold' }}>Site Incharge</small>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ffc107' }}>{stats.siteIncharge}</div>
                                </div>
                            </Col>
                            <Col xs={6} md={2}>
                                <div style={{ 
                                    backgroundColor: 'rgba(0, 123, 255, 0.2)', 
                                    padding: '8px', 
                                    borderRadius: '5px',
                                    textAlign: 'center'
                                }}>
                                    <small style={{ color: '#007bff', fontWeight: 'bold' }}>Inside</small>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#007bff' }}>{stats.insideLocation}</div>
                                </div>
                            </Col>
                            <Col xs={6} md={2}>
                                <div style={{ 
                                    backgroundColor: 'rgba(108, 117, 125, 0.2)', 
                                    padding: '8px', 
                                    borderRadius: '5px',
                                    textAlign: 'center'
                                }}>
                                    <small style={{ color: '#6c757d', fontWeight: 'bold' }}>Outside</small>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#6c757d' }}>{stats.outsideLocation}</div>
                                </div>
                            </Col>
                            <Col xs={6} md={2}>
                                <div style={{ 
                                    backgroundColor: 'rgba(23, 162, 184, 0.2)', 
                                    padding: '8px', 
                                    borderRadius: '5px',
                                    textAlign: 'center'
                                }}>
                                    <small style={{ color: '#17a2b8', fontWeight: 'bold' }}>Total</small>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#17a2b8' }}>{stats.total}</div>
                                </div>
                            </Col>
                        </Row>
                    </Card.Header>

                    {/* Body Content - AG Grid */}
                    <Card.Body style={{
                        backgroundColor: themeStyles.cardBg,
                        color: themeStyles.color,
                        padding: isFullScreen ? '0' : (isMobile ? '10px' : '15px'),
                        flex: 1,
                        overflow: 'hidden'
                    }}>
                        {workerData.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '50px',
                                color: themeStyles.color
                            }}>
                                <i className="bi bi-people" style={{ fontSize: '3rem', marginBottom: '20px' }}></i>
                                <h5>No worker assignment data available</h5>
                                <p>Please check your API connection or select a different month.</p>
                            </div>
                        ) : (
                            <div
                                className="ag-theme-alpine"
                                style={{
                                    height: getGridHeight(),
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
                                    rowData={workerData}
                                    columnDefs={columnDefs}
                                    defaultColDef={defaultColDef}
                                    pagination={true}
                                    paginationPageSize={isMobile ? 10 : (isFullScreen ? 15 : 10)}
                                    rowSelection="multiple"
                                    onSelectionChanged={onSelectionChanged}
                                    onGridReady={onGridReady}
                                    suppressMovableColumns={isMobile}
                                    enableRangeSelection={!isMobile}
                                    animateRows={!isMobile}
                                    enableCellTextSelection={true}
                                    suppressHorizontalScroll={false}
                                    suppressColumnVirtualisation={isMobile}
                                    rowBuffer={isMobile ? 5 : 10}
                                    headerHeight={isMobile ? 40 : 48}
                                    rowHeight={isMobile ? 50 : 60}
                                    suppressMenuHide={isMobile}
                                    suppressContextMenu={isMobile}
                                />
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </Container>

            {/* Worker Details Modal */}
            <Modal 
                show={showDetailsModal} 
                onHide={() => {
                    setShowDetailsModal(false);
                    setSelectedWorker(null);
                }} 
                centered 
                backdrop="static"
            >
                <Modal.Header closeButton style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                    <Modal.Title>Worker Assignment Details</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ padding: '20px' }}>
                    {selectedWorker && (
                        <div>
                            <Row className="mb-3">
                                <Col xs={6}>
                                    <strong>Employee ID:</strong>
                                    <div style={{ fontSize: '1.1rem', color: '#007bff' }}>{selectedWorker.emp_id}</div>
                                </Col>
                                <Col xs={6}>
                                    <strong>File ID:</strong>
                                    <div style={{ fontSize: '1.1rem', color: '#6c757d' }}>{selectedWorker.file_id}</div>
                                </Col>
                            </Row>
                            
                            <Row className="mb-3">
                                <Col xs={6}>
                                    <strong>Location:</strong>
                                    <div className="mt-1">
                                        <Badge bg={selectedWorker.location === 'Inside' ? 'primary' : 'secondary'}>
                                            {selectedWorker.location}
                                        </Badge>
                                    </div>
                                </Col>
                                <Col xs={6}>
                                    <strong>Company Type:</strong>
                                    <div className="mt-1">
                                        <Badge bg={selectedWorker.companyType === 'Surya' ? 'success' : 'info'}>
                                            {selectedWorker.companyType}
                                        </Badge>
                                    </div>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col xs={12}>
                                    <strong>Documents:</strong>
                                    <div className="mt-2 d-flex gap-2 flex-wrap">
                                        {selectedWorker.doc && selectedWorker.doc.split(',').map((doc, index) => {
                                            const docLabels = {
                                                'esicIp': 'ESIC IP',
                                                'epf': 'EPF',
                                                'identity': 'ID Card',
                                                'wcPolicy': 'WC Policy'
                                            };
                                            return (
                                                <Badge key={index} bg="info">
                                                    {docLabels[doc.trim()] || doc.trim()}
                                                </Badge>
                                            );
                                        })}
                                    </div>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col xs={6}>
                                    <strong>Status:</strong>
                                    <div className="mt-1">
                                        <Badge bg={selectedWorker.status === '1' ? 'success' : 'danger'}>
                                            {selectedWorker.status === '1' ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                </Col>
                                <Col xs={6}>
                                    <strong>Site Incharge:</strong>
                                    <div className="mt-1">
                                        {selectedWorker.is_site_incharge === 'yes' ? (
                                            <Badge bg="warning" text="dark">
                                                <i className="bi bi-star-fill"></i> Yes
                                            </Badge>
                                        ) : (
                                            <span style={{ color: '#999' }}>No</span>
                                        )}
                                    </div>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col xs={12}>
                                    <strong>Assignment Date:</strong>
                                    <div style={{ fontSize: '1.1rem', color: '#495057' }}>
                                        {new Date(selectedWorker.date).toLocaleDateString('en-IN', {
                                            day: '2-digit',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer style={{ justifyContent: 'center', padding: '15px' }}>
                    <Button 
                        variant="secondary" 
                        onClick={() => {
                            setShowDetailsModal(false);
                            setSelectedWorker(null);
                        }}
                        style={{ minWidth: '100px' }}
                    >
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
            
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
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

export default WorkerAssignment;