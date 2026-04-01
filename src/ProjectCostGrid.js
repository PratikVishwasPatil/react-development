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

const ProjectCostGrid = () => {
    const [theme, setTheme] = useState('light');
    const [rowData, setRowData] = useState([]);
    const [columnDefs, setColumnDefs] = useState([]);
    const [isFullScreen, setIsFullScreen] = useState(true); // Default to full screen
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [financialYear, setFinancialYear] = useState('25-26'); // Default to latest year
    const [financialYearOptions, setFinancialYearOptions] = useState([]);
    const [summaryData, setSummaryData] = useState(null);
    const gridRef = useRef();


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
            if (years.length > 0) {
                setFinancialYear(years[years.length - 1].value);
            }
        }
    } catch (error) {
        console.error("Error fetching financial years:", error);
        toast.error("Error loading financial years");
    }
};

    // Handle window resize for mobile responsiveness
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Column definitions for project cost data
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
                field: "FILE_NAME",
                headerName: "File Name",
                width: isMobile ? 150 : 200,
                pinned: 'left',
                checkboxSelection: false,
                headerCheckboxSelection: false,
                cellRenderer: (params) => {
                    return `${params.value}`;
                }
            },
            {
                field: "CUSTOMER_NAME",
                headerName: "Customer",
                width: isMobile ? 120 : 150
            },
            {
                field: "owner",
                headerName: "Owner",
                width: isMobile ? 100 : 120
            },
            {
                field: "location12",
                headerName: "Location",
                width: isMobile ? 100 : 120
            },
            {
                field: "PO_AMOUNT",
                headerName: "PO Amount",
                width: isMobile ? 120 : 140,
                cellStyle: { textAlign: 'right', fontWeight: 'bold' },
                cellRenderer: (params) => {
                    return params.value ? `₹ ${params.value}` : '-';
                }
            },
            {
                field: "transportCost",
                headerName: "Transport Cost",
                width: isMobile ? 120 : 140,
                cellStyle: { textAlign: 'right' },
                cellRenderer: (params) => {
                    return params.value ? `₹ ${params.value}` : '-';
                }
            },
            {
                field: "DesingAmount",
                headerName: "Design Amount",
                width: isMobile ? 120 : 140,
                cellStyle: { textAlign: 'right' },
                cellRenderer: (params) => {
                    return params.value ? `₹ ${params.value}` : '-';
                }
            },
            {
                field: "mktgRatio",
                headerName: "Marketing Ratio (%)",
                width: isMobile ? 120 : 140,
                cellStyle: (params) => {
                    const value = parseFloat(params.value);
                    return {
                        textAlign: 'center',
                        backgroundColor: value > 70 ? '#ffebee' : '#e8f5e8',
                        color: value > 70 ? '#c62828' : '#2e7d32',
                        fontWeight: 'bold'
                    };
                },
                cellRenderer: (params) => {
                    const value = parseFloat(params.value);
                    return `${value}%`;
                }
            },
            {
                field: "DesignRatio",
                headerName: "Design Ratio (%)",
                width: isMobile ? 120 : 140,
                cellStyle: (params) => {
                    const value = parseFloat(params.value);
                    return {
                        textAlign: 'center',
                        backgroundColor: value > 70 ? '#ffebee' : '#e8f5e8',
                        color: value > 70 ? '#c62828' : '#2e7d32',
                        fontWeight: 'bold'
                    };
                },
                cellRenderer: (params) => {
                    const value = parseFloat(params.value);
                    return `${value}%`;
                }
            },
            {
                field: "Rstatus",
                headerName: "R Status",
                width: isMobile ? 80 : 100,
                cellStyle: (params) => {
                    return {
                        textAlign: 'center',
                        backgroundColor: params.value === 'R' ? '#ffebee' : '#e8f5e8',
                        color: params.value === 'R' ? '#c62828' : '#2e7d32',
                        fontWeight: 'bold'
                    };
                }
            },
            {
                field: "labourPOAmt",
                headerName: "Labour PO Amount",
                width: isMobile ? 140 : 160,
                cellStyle: { textAlign: 'right' },
                cellRenderer: (params) => {
                    return params.value ? `₹ ${params.value}` : '-';
                }
            },
            {
                field: "labourStatus",
                headerName: "Labour Status",
                width: isMobile ? 100 : 120,
                cellStyle: (params) => {
                    return {
                        textAlign: 'center',
                        backgroundColor: params.value === 'YES' ? '#e8f5e8' : '#fff3e0',
                        color: params.value === 'YES' ? '#2e7d32' : '#ef6c00',
                        fontWeight: 'bold'
                    };
                }
            },
            {
                field: "workStatus",
                headerName: "Work Status (%)",
                width: isMobile ? 120 : 140,
                cellStyle: (params) => {
                    const value = parseFloat(params.value) || 0;
                    return {
                        textAlign: 'center',
                        backgroundColor: value === 100 ? '#e8f5e8' : value > 50 ? '#fff3e0' : '#ffebee',
                        color: value === 100 ? '#2e7d32' : value > 50 ? '#ef6c00' : '#c62828',
                        fontWeight: 'bold'
                    };
                },
                cellRenderer: (params) => {
                    const value = parseFloat(params.value) || 0;
                    return `${value}%`;
                }
            },
            {
                field: "materialTotalKG",
                headerName: "Total Weight (KG)",
                width: isMobile ? 120 : 140,
                cellStyle: { textAlign: 'right' }
            },
            {
                field: "overallRatioMKTG",
                headerName: "Overall Ratio MKTG",
                width: isMobile ? 140 : 160,
                cellStyle: { textAlign: 'center' },
                cellRenderer: (params) => {
                    const value = parseFloat(params.value);
                    return `${value}`;
                }
            },
            {
                field: "finalStatus",
                headerName: "Final Status",
                width: isMobile ? 100 : 120,
                cellStyle: (params) => {
                    return {
                        textAlign: 'center',
                        backgroundColor: params.value === 'X' ? '#ffebee' : '#e8f5e8',
                        color: params.value === 'X' ? '#c62828' : '#2e7d32',
                        fontWeight: 'bold'
                    };
                }
            },
            {
                field: "NC",
                headerName: "NC Status",
                width: isMobile ? 80 : 100,
                cellStyle: (params) => {
                    return {
                        textAlign: 'center',
                        backgroundColor: params.value === 'Yes' ? '#fff3e0' : '#e8f5e8',
                        color: params.value === 'Yes' ? '#ef6c00' : '#2e7d32',
                        fontWeight: 'bold'
                    };
                }
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
        cellStyle: { textAlign: 'right' }
    }), [isMobile]);

    // Fetch project cost analysis data
    const fetchProjectData = async (fy = financialYear) => {
        setLoading(true);
        try {
            const requestPayload = {
                type: "GetProjectCostAnalysis",
                financial_year: fy
            };

            const response = await fetch("https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/cost_chit_list.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestPayload),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.status === "success" && Array.isArray(data.data)) {
                setRowData(data.data);
                toast.success(`Loaded ${data.data.length} project records for FY ${fy}`);
            } else {
                throw new Error(data.message || "Failed to fetch project data");
            }
        } catch (error) {
            console.error("Error fetching project data:", error);
            toast.error(`Error fetching data: ${error.message}`);
            setRowData([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch project summary
    const fetchSummaryData = async (fy = financialYear) => {
        try {
            const requestPayload = {
                type: "GetProjectSummary",
                financial_year: fy
            };

            const response = await fetch("https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/cost_chit_list.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestPayload),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.status === "success") {
                setSummaryData(data.data);
            }
        } catch (error) {
            console.error("Error fetching summary:", error);
        }
    };

    // Initial data fetch
    // useEffect(() => {
    //     setColumnDefs(generateColumnDefs());
    //     fetchProjectData();
    //     fetchSummaryData();
    // }, [financialYear, isMobile]);
    // Initial data fetch
useEffect(() => {
    setColumnDefs(generateColumnDefs());
    fetchFinancialYears();
}, [isMobile]);

// Fetch data when financial year changes
useEffect(() => {
    if (financialYear) {
        fetchProjectData();
        fetchSummaryData();
    }
}, [financialYear]);

    // Handle financial year change
    const handleFinancialYearChange = (e) => {
        const newFY = e.target.value;
        setFinancialYear(newFY);
        fetchProjectData(newFY);
        fetchSummaryData(newFY);
    };

    const onSelectionChanged = (event) => {
        const selectedNodes = event.api.getSelectedNodes();
        const selectedData = selectedNodes.map(node => node.data);
        setSelectedRows(selectedData);
    };

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    // Export to CSV - Fixed
    const downloadExcel = () => {
        if (!gridRef.current?.api) return;
        
        try {
            const params = {
                fileName: `ProjectCostAnalysis_${financialYear}_${new Date().toISOString().split('T')[0]}.csv`,
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

    // Auto size columns - Fixed API call
    const autoSizeAll = () => {
        if (!gridRef.current?.api) return;
        
        try {
            setTimeout(() => {
                // Use the correct AG Grid API method
                const allColumnIds = gridRef.current.api.getColumns()?.map(column => column.getId()) || [];
                if (allColumnIds.length > 0) {
                    gridRef.current.api.autoSizeColumns(allColumnIds, false);
                }
            }, 100);
        } catch (error) {
            console.error('Error auto-sizing columns:', error);
        }
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
                    <p className="mt-3">Loading project cost analysis...</p>
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
                                    Project Cost Analysis Dashboard
                                </h4>
                                <small style={{ opacity: 0.8 }}>
                                    {summaryData ? 
                                        `${summaryData.total_projects} projects | Total PO: ₹${summaryData.total_po_amount}` :
                                        `${rowData.length} records found`
                                    }
                                    {selectedRows.length > 0 && ` | ${selectedRows.length} selected`}
                                </small>
                            </Col>

                            <Col xs={12} lg={6}>
                                <div className="d-flex justify-content-end gap-2 flex-wrap align-items-center">
                                    {/* Financial Year Selector */}
                                    <Form.Select
                                        value={financialYear}
                                        onChange={handleFinancialYearChange}
                                        style={{ width: 'auto', minWidth: '120px' }}
                                        size="sm"
                                    >
                                        {financialYearOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                FY {option.label}
                                            </option>
                                        ))}
                                    </Form.Select>

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
                                <i className="bi bi-bar-chart" style={{ fontSize: '3rem', marginBottom: '20px' }}></i>
                                <h5>No project data available</h5>
                                <p>Please select a different financial year or check your API connection.</p>
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
                                    rowMultiSelectWithClick={true}
                                    animateRows={!isMobile}
                                    enableCellTextSelection={true}
                                    suppressHorizontalScroll={false}
                                    headerHeight={isMobile ? 40 : 48}
                                    rowHeight={isMobile ? 35 : 42}
                                    onGridReady={(params) => {
                                        console.log('Project Cost Grid is ready');
                                        // Auto-size columns after grid is ready
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

export default ProjectCostGrid;