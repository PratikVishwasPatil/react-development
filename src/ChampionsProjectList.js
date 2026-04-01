import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
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

const ChampionProjectList = () => {
    const navigate = useNavigate();
    
    const [theme, setTheme] = useState('light');
    const [projectData, setProjectData] = useState([]);
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [loading, setLoading] = useState(false);
    const gridRef = useRef();

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // API URL
    const PROJECT_API_URL = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/champion/ChampionProjectListApi.php";

    // Fetch project data
    const fetchProjectData = async () => {
        setLoading(true);
        try {
            const response = await fetch(PROJECT_API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.status && data.data) {
                setProjectData(data.data);
                toast.success(`Loaded ${data.count} projects successfully`);
            } else {
                throw new Error("No data received");
            }
        } catch (error) {
            console.error("Error fetching project data:", error);
            toast.error(`Error fetching project data: ${error.message}`);
            setProjectData([]);
        } finally {
            setLoading(false);
        }
    };

    // Load data on mount
    useEffect(() => {
        fetchProjectData();
    }, []);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    // Cell renderer for clickable file name - Design File
    const DesignFileCellRenderer = (props) => {
        const handleClick = () => {
            if (props.data && props.data.FILE_ID) {
                navigate(`/champion/project-detail/${props.data.FILE_ID}`);
            } else {
                toast.error('File ID not found');
            }
        };

        return (
            <div 
                onClick={handleClick}
                style={{
                    cursor: 'pointer',
                    color: '#0066cc',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    padding: '8px 4px'
                }}
                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
            >
                {props.value || '-'}
            </div>
        );
    };

    // Cell renderer for clickable file name - Close Challan
    const CloseChallanCellRenderer = (props) => {
        const handleClick = () => {
            if (props.data && props.data.FILE_ID) {
                navigate(`/champion/challan-close/${props.data.FILE_ID}`);
            } else {
                toast.error('File ID not found');
            }
        };

        return (
            <div 
                onClick={handleClick}
                style={{
                    cursor: 'pointer',
                    color: '#0066cc',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    padding: '8px 4px'
                }}
                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
            >
                {props.value || '-'}
            </div>
        );
    };

    // Cell renderer for clickable file name - Champion RH close Challan
    const ChampionRHCloseChallanCellRenderer = (props) => {
        const handleClick = () => {
            if (props.data && props.data.FILE_ID) {
                navigate(`/champion/rh-challan-close/${props.data.FILE_ID}`);
            } else {
                toast.error('File ID not found');
            }
        };

        return (
            <div 
                onClick={handleClick}
                style={{
                    cursor: 'pointer',
                    color: '#0066cc',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    padding: '8px 4px'
                }}
                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
            >
                {props.value || '-'}
            </div>
        );
    };

    // Theme styles
    const getThemeStyles = () => {
        if (theme === 'dark') {
            return {
                backgroundColor: 'linear-gradient(135deg, #21262d 0%, #161b22 100%)',
                color: '#f8f9fa',
                cardBg: '#343a40',
                cardHeader: 'linear-gradient(135deg, #495057 0%, #343a40 100%)',
                inputBg: '#495057',
                inputBorder: '#6c757d',
                inputColor: '#fff'
            };
        }
        return {
            backgroundColor: 'linear-gradient(135deg, #f8f9ff 0%, #e6f3ff 100%)',
            color: '#212529',
            cardBg: '#ffffff',
            cardHeader: 'linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%)',
            inputBg: '#ffffff',
            inputBorder: '#ced4da',
            inputColor: '#212529'
        };
    };

    const themeStyles = getThemeStyles();

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

    // AG Grid column definitions
    const columnDefs = useMemo(() => [
        {
            headerName: "Design File",
            field: "FILE_NAME",
            filter: "agTextColumnFilter",
            sortable: true,
            width: isMobile ? 200 : 400,
            pinned: 'left',
            cellRenderer: DesignFileCellRenderer,
            cellStyle: { 
                padding: 0
            }
        },
        {
            headerName: "Close Challan",
            field: "FILE_NAME",
            filter: "agTextColumnFilter",
            sortable: true,
            width: isMobile ? 200 : 400,
            cellRenderer: CloseChallanCellRenderer,
            cellStyle: { 
                padding: 0
            }
        },
        {
            headerName: "Champion RH close Challan",
            field: "FILE_NAME",
            filter: "agTextColumnFilter",
            sortable: true,
            width: isMobile ? 200 : 400,
            cellRenderer: ChampionRHCloseChallanCellRenderer,
            cellStyle: { 
                padding: 0
            }
        },
        {
            headerName: "Project Deliver Status",
            field: "proj_date",
            filter: "agTextColumnFilter",
            sortable: true,
            width: isMobile ? 120 : 200,
            cellStyle: params => {
                if (params.value === "-") {
                    return { color: '#dc3545', fontStyle: 'italic', textAlign: 'center' };
                }
                return { color: '#28a745', fontWeight: '500', textAlign: 'center' };
            }
        },
        // Hidden field for FILE_ID
        {
            field: "FILE_ID",
            headerName: "File ID",
            hide: true,
            width: 0
        }
    ], [isMobile]);

    const defaultColDef = useMemo(() => ({
        resizable: true,
        sortable: true,
        filter: true,
        floatingFilter: !isMobile,
        suppressMenu: isMobile,
    }), [isMobile]);

    // Grid options with row styling
    const getRowStyle = params => {
        if (params.data.proj_date && params.data.proj_date !== "-") {
            return { 
                backgroundColor: theme === 'dark' ? '#1e4620' : '#d4edda',
                borderLeft: '4px solid #28a745'
            };
        }
        return null;
    };

    const onGridReady = (params) => {
        console.log('Champion Project List Grid is ready');
        setTimeout(() => autoSizeAll(), 500);
    };

    const handleExportCSV = () => {
        if (gridRef.current && gridRef.current.api) {
            gridRef.current.api.exportDataAsCsv({
                fileName: `Champion_Project_List_${new Date().toISOString().split('T')[0]}.csv`
            });
            toast.success('Data exported to CSV');
        }
    };

    const handleRefresh = () => {
        fetchProjectData();
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

    // Pin all columns
    const handlePinAll = () => {
        if (gridRef.current && gridRef.current.api) {
            const allColumns = gridRef.current.api.getColumns();
            allColumns.forEach(column => {
                gridRef.current.api.setColumnPinned(column.getColId(), 'left');
            });
            toast.success('All columns pinned');
        }
    };

    // Clear all pinned columns
    const handleClearPinned = () => {
        if (gridRef.current && gridRef.current.api) {
            const allColumns = gridRef.current.api.getColumns();
            allColumns.forEach(column => {
                gridRef.current.api.setColumnPinned(column.getColId(), null);
            });
            toast.success('All columns unpinned');
        }
    };

    // Size columns to fit
    const handleSizeToFit = () => {
        if (gridRef.current && gridRef.current.api) {
            gridRef.current.api.sizeColumnsToFit();
            toast.success('Columns sized to fit');
        }
    };

    const gridHeight = isFullScreen ? 'calc(100vh - 180px)' : (isMobile ? '400px' : '600px');

    if (loading && projectData.length === 0) {
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
                                    <i className="bi bi-folder-fill me-2"></i>
                                    Champion Project List
                                </h4>
                                <small style={{ opacity: 0.8 }}>
                                    {`${projectData.length} projects found`}
                                </small>
                            </Col>

                            <Col xs={12} lg={6}>
                                <div className="d-flex justify-content-end gap-2 flex-wrap align-items-center">
                                    <ButtonGroup size="sm">
                                        <Button
                                            variant="danger"
                                            onClick={handleExportCSV}
                                            title="Download Excel Export"
                                        >
                                            <i className="bi bi-file-earmark-excel"></i>
                                            {!isMobile && ' Download Excel Export'}
                                        </Button>
                                        <Button
                                            variant="warning"
                                            onClick={handleClearPinned}
                                            title="Clear Pinned"
                                        >
                                            <i className="bi bi-pin-angle"></i>
                                            {!isMobile && ' Clear Pinned'}
                                        </Button>
                                        <Button
                                            variant="success"
                                            onClick={handlePinAll}
                                            title="Pinned"
                                        >
                                            <i className="bi bi-pin-fill"></i>
                                            {!isMobile && ' Pinned'}
                                        </Button>
                                        <Button
                                            variant="primary"
                                            onClick={handleSizeToFit}
                                            title="Size To Fit"
                                        >
                                            <i className="bi bi-arrows-angle-contract"></i>
                                            {!isMobile && ' Size To Fit'}
                                        </Button>
                                    </ButtonGroup>

                                    <ButtonGroup size="sm">
                                        <Button
                                            variant="outline-light"
                                            onClick={handleRefresh}
                                            disabled={loading}
                                        >
                                            <i className="bi bi-arrow-clockwise"></i>
                                            {!isMobile && ' Refresh'}
                                        </Button>
                                        <Button
                                            variant="info"
                                            onClick={autoSizeAll}
                                        >
                                            <i className="bi bi-arrows-angle-expand"></i>
                                            {!isMobile && ' Auto-Size All'}
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

                    {/* Body Content - AG Grid */}
                    <Card.Body style={{
                        backgroundColor: themeStyles.cardBg,
                        padding: isFullScreen ? 0 : 15
                    }}>
                        {projectData.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '50px',
                                color: themeStyles.color
                            }}>
                                <i className="bi bi-folder-x" style={{ fontSize: '3rem', marginBottom: '20px' }}></i>
                                <h5>No project data available</h5>
                                <p>Please check your API connection and try again.</p>
                            </div>
                        ) : (
                            <div
                                className="ag-theme-alpine"
                                style={{
                                    height: gridHeight,
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
                                        '--ag-selected-row-background-color': '#28a745',
                                        '--ag-input-background-color': '#343a40',
                                        '--ag-input-border-color': '#495057'
                                    })
                                }}
                            >
                                <AgGridReact
                                    ref={gridRef}
                                    rowData={projectData}
                                    columnDefs={columnDefs}
                                    defaultColDef={defaultColDef}
                                    pagination={true}
                                    paginationPageSize={isMobile ? 10 : 20}
                                    onGridReady={onGridReady}
                                    getRowStyle={getRowStyle}
                                    animateRows={!isMobile}
                                    enableCellTextSelection={true}
                                    suppressHorizontalScroll={false}
                                    headerHeight={isMobile ? 40 : 48}
                                    rowHeight={isMobile ? 35 : 42}
                                    suppressMovableColumns={isMobile}
                                    enableRangeSelection={!isMobile}
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

export default ChampionProjectList;