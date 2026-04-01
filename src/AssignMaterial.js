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
import { Container, Button, Row, Col, Card, ButtonGroup, Form, Badge } from 'react-bootstrap';
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

const AssignMaterialList = () => {
    const navigate = useNavigate();
    
    const [theme, setTheme] = useState('light');
    const [materialData, setMaterialData] = useState([]);
    const [years, setYears] = useState([]);
    const [selectedYear, setSelectedYear] = useState('25-26');
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [autoNavigateOnSelect, setAutoNavigateOnSelect] = useState(false);
    const [totalRecords, setTotalRecords] = useState(0);
    const gridRef = useRef();

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // API URLs
    const MATERIAL_API_URL = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/AssignMaterialListApi.php";
    const YEARS_API_URL = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/GetYearsApi.php";

    // Fetch years data
    const fetchYears = async () => {
        try {
            const response = await fetch(YEARS_API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.status === "success" && data.data) {
                const sortedYears = data.data
                    .sort((a, b) => parseInt(a.sequence_no) - parseInt(b.sequence_no))
                    .map(year => ({
                        value: year.financial_year,
                        label: `20${year.financial_year}`
                    }));
                
                setYears(sortedYears);

                // Set the most recent year as default
                if (sortedYears.length > 0) {
                    const latestYear = sortedYears[sortedYears.length - 1].value;
                    if (!sortedYears.find(y => y.value === selectedYear)) {
                        setSelectedYear(latestYear);
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching years:", error);
            toast.error(`Error fetching years: ${error.message}`);
        }
    };

    // Fetch material data
    const fetchMaterialData = async (financialYear) => {
        setLoading(true);
        try {
            const response = await fetch(`${MATERIAL_API_URL}?financial_year=${financialYear}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.status === "success" && data.data) {
                setMaterialData(data.data);
                setTotalRecords(data.total || data.data.length);
                toast.success(`Loaded ${data.data.length} records for FY ${financialYear}`);
            } else {
                throw new Error(data.message || "No data received");
            }
        } catch (error) {
            console.error("Error fetching material data:", error);
            toast.error(`Error fetching material data: ${error.message}`);
            setMaterialData([]);
            setTotalRecords(0);
        } finally {
            setLoading(false);
        }
    };

    // Load years on mount
    useEffect(() => {
        fetchYears();
    }, []);

    // Load data when year changes
    useEffect(() => {
        if (selectedYear) {
            fetchMaterialData(selectedYear);
        }
    }, [selectedYear]);

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

    // Handle selection changed
    const onSelectionChanged = (event) => {
        const selectedNodes = event.api.getSelectedNodes();
        const selectedData = selectedNodes.map(node => node.data);
        setSelectedRows(selectedData);

        // Auto-navigate when a row is selected (if enabled)
        if (autoNavigateOnSelect && selectedData.length === 1) {
            const selectedRecord = selectedData[0];

            // Check if FILE_ID exists
            if (!selectedRecord.FILE_ID) {
                toast.error('File ID not found in selected record');
                return;
            }

            // Show a brief toast before navigating
            toast.info(`Navigating to details for ${selectedRecord.FILE_NAME}...`);

            // Navigate after a short delay to show the toast
            setTimeout(() => {
                navigate(`/ppc/assign-material/${selectedRecord.FILE_ID}`);
            }, 500);
        }
    };

    // Handle manual navigation to detail page
    const handleNavigateToDetail = () => {
        if (selectedRows.length === 0) {
            toast.error('Please select at least one record to proceed');
            return;
        }

        if (selectedRows.length > 1) {
            toast.error('Please select only one record at a time');
            return;
        }

        const selectedRecord = selectedRows[0];

        // Check if FILE_ID exists
        if (!selectedRecord.FILE_ID) {
            toast.error('File ID not found in selected record');
            return;
        }

        // Navigate to the assign material detail page with FILE_ID
        navigate(`/ppc/assign-material/${selectedRecord.FILE_ID}`);
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

    // Status badge cell renderer
    const StatusCellRenderer = (props) => {
        const status = props.value;
        const variant = status === "Purchase Order Send" ? "success" : "danger";
        return (
            <Badge bg={variant} className="w-100" style={{ padding: '6px 10px', fontSize: '0.85rem' }}>
                {status}
            </Badge>
        );
    };

    // AG Grid column definitions
    const columnDefs = useMemo(() => [
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
            headerName: "File Name",
            field: "FILE_NAME",
            filter: "agTextColumnFilter",
            sortable: true,
            width: isMobile ? 150 : 250,
            pinned: 'left',
            checkboxSelection: true,
            headerCheckboxSelection: false,
            cellStyle: { fontWeight: 'bold', color: '#0066cc' }
        },
        {
            headerName: "Customer Name",
            field: "CUSTOMER_NAME",
            filter: "agTextColumnFilter",
            sortable: true,
            width: 300
        },
        {
            headerName: "Status",
            field: "statusName",
            filter: "agTextColumnFilter",
            sortable: true,
            width: 200,
            cellRenderer: StatusCellRenderer,
            cellStyle: { textAlign: 'center' }
        },
        {
            headerName: "Last Dispatch",
            field: "lastDispatchDate",
            filter: "agTextColumnFilter",
            sortable: true,
            width: 180,
            cellStyle: params => {
                if (params.value === "-" || !params.value) {
                    return { color: '#6c757d', fontStyle: 'italic' };
                }
                return { fontWeight: '500' };
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
        if (params.data.statusName === "Purchase Order Send") {
            return { 
                backgroundColor: theme === 'dark' ? '#1e4620' : '#d4edda',
                borderLeft: '4px solid #28a745'
            };
        } else if (params.data.statusName === "Purchase Order Not Send") {
            return { 
                backgroundColor: theme === 'dark' ? '#4a1f1f' : '#f8d7da',
                borderLeft: '4px solid #dc3545'
            };
        }
        return null;
    };

    const onGridReady = (params) => {
        console.log('Assign Material List Grid is ready');
        setTimeout(() => autoSizeAll(), 500);
    };

    const handleExportCSV = () => {
        if (gridRef.current && gridRef.current.api) {
            gridRef.current.api.exportDataAsCsv({
                fileName: `Assign_Material_List_${selectedYear}_${new Date().toISOString().split('T')[0]}.csv`
            });
            toast.success('Data exported to CSV');
        }
    };

    const handleRefresh = () => {
        fetchMaterialData(selectedYear);
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

    const gridHeight = isFullScreen ? 'calc(100vh - 180px)' : (isMobile ? '400px' : '600px');

    // Calculate statistics
    const stats = useMemo(() => {
        const poSent = materialData.filter(item => item.statusName === "Purchase Order Send").length;
        const poNotSent = materialData.filter(item => item.statusName === "Purchase Order Not Send").length;
        return { poSent, poNotSent };
    }, [materialData]);

    if (loading && materialData.length === 0) {
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
                    <p className="mt-3">Loading material data...</p>
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
                                <h4 className="mb-1">
                                    <i className="bi bi-box-seam me-2"></i>
                                    Assign Material List
                                </h4>
                                <small style={{ opacity: 0.8 }}>
                                    {`${totalRecords} total records for FY ${selectedYear}`}
                                    {selectedRows.length > 0 && ` | ${selectedRows.length} selected`}
                                    {autoNavigateOnSelect && ' | Auto-nav ON'}
                                </small>
                                {materialData.length > 0 && (
                                    <div className="mt-2 d-flex gap-2 flex-wrap">
                                        <Badge bg="success" style={{ fontSize: '0.85rem' }}>
                                            <i className="bi bi-check-circle me-1"></i>
                                            PO Sent: {stats.poSent}
                                        </Badge>
                                        <Badge bg="danger" style={{ fontSize: '0.85rem' }}>
                                            <i className="bi bi-x-circle me-1"></i>
                                            PO Not Sent: {stats.poNotSent}
                                        </Badge>
                                    </div>
                                )}
                            </Col>

                            <Col xs={12} lg={6}>
                                <div className="d-flex justify-content-end gap-2 flex-wrap align-items-center">
                                    {/* Financial Year Selector */}
                                    <Form.Select
                                        size="sm"
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(e.target.value)}
                                        style={{
                                            width: 'auto',
                                            minWidth: '120px',
                                            backgroundColor: themeStyles.inputBg,
                                            borderColor: themeStyles.inputBorder,
                                            color: themeStyles.inputColor
                                        }}
                                    >
                                        {years.map(year => (
                                            <option key={year.value} value={year.value}>
                                                FY {year.label}
                                            </option>
                                        ))}
                                    </Form.Select>

                                    {/* Auto-Navigate Toggle */}
                                    <Button
                                        variant={autoNavigateOnSelect ? "success" : "outline-secondary"}
                                        size="sm"
                                        onClick={toggleAutoNavigate}
                                        title="Toggle auto-navigation on row select"
                                    >
                                        <i className="bi bi-lightning-fill"></i>
                                        {!isMobile && ' Auto'}
                                    </Button>

                                    {/* Navigate to Detail Button */}
                                    {!autoNavigateOnSelect && selectedRows.length > 0 && (
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={handleNavigateToDetail}
                                        >
                                            <i className="bi bi-pencil-square"></i>
                                            {!isMobile && ' Assign Material'}
                                        </Button>
                                    )}

                                    <ButtonGroup size="sm">
                                        <Button
                                            variant="outline-light"
                                            onClick={handleRefresh}
                                            disabled={loading}
                                        >
                                            <i className={`bi bi-arrow-clockwise ${loading ? 'spinner-border spinner-border-sm' : ''}`}></i>
                                            {!isMobile && ' Refresh'}
                                        </Button>
                                        <Button
                                            variant="outline-light"
                                            onClick={handleExportCSV}
                                        >
                                            <i className="bi bi-download"></i>
                                            {!isMobile && ' Export'}
                                        </Button>
                                        <Button
                                            variant="info"
                                            onClick={autoSizeAll}
                                        >
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

                    {/* Body Content - AG Grid */}
                    <Card.Body style={{
                        backgroundColor: themeStyles.cardBg,
                        padding: isFullScreen ? 0 : 15
                    }}>
                        {materialData.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '50px',
                                color: themeStyles.color
                            }}>
                                <i className="bi bi-inbox" style={{ fontSize: '3rem', marginBottom: '20px', opacity: 0.5 }}></i>
                                <h5>No material assignment data available</h5>
                                <p>Please select a different financial year or check your API connection.</p>
                                <Button 
                                    variant="primary" 
                                    size="sm" 
                                    onClick={handleRefresh}
                                    className="mt-3"
                                >
                                    <i className="bi bi-arrow-clockwise me-2"></i>
                                    Retry Loading
                                </Button>
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
                                        '--ag-selected-row-background-color': '#0d6efd',
                                        '--ag-input-background-color': '#343a40',
                                        '--ag-input-border-color': '#495057'
                                    })
                                }}
                            >
                                <AgGridReact
                                    ref={gridRef}
                                    rowData={materialData}
                                    columnDefs={columnDefs}
                                    defaultColDef={defaultColDef}
                                    pagination={true}
                                    paginationPageSize={isMobile ? 10 : 20}
                                    paginationPageSizeSelector={[10, 20, 50, 100]}
                                    rowSelection="single"
                                    onSelectionChanged={onSelectionChanged}
                                    onGridReady={onGridReady}
                                    getRowStyle={getRowStyle}
                                    animateRows={!isMobile}
                                    enableCellTextSelection={true}
                                    suppressHorizontalScroll={false}
                                    headerHeight={isMobile ? 40 : 48}
                                    rowHeight={isMobile ? 35 : 42}
                                    rowMultiSelectWithClick={false}
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

export default AssignMaterialList;