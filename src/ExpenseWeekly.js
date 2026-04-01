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
import Select from 'react-select';

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

const ExpenseWeeklyGrid = () => {
    const [theme, setTheme] = useState('light');
    const [rowData, setRowData] = useState([]);
    const [columnDefs, setColumnDefs] = useState([]);
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [financialYear, setFinancialYear] = useState('25-26');
    const [financialYearOptions, setFinancialYearOptions] = useState([]);
    const [summaryData, setSummaryData] = useState(null);
    const [fileNameOptions, setFileNameOptions] = useState([]);
    const [selectedFileName, setSelectedFileName] = useState(null);
    const [allData, setAllData] = useState([]);
    const gridRef = useRef();

    // Financial year options
    // const financialYearOptions = [
    //     { value: '16-17', label: '2016-17' },
    //     { value: '17-18', label: '2017-18' },
    //     { value: '18-19', label: '2018-19' },
    //     { value: '19-20', label: '2019-20' },
    //     { value: '20-21', label: '2020-21' },
    //     { value: '21-22', label: '2021-22' },
    //     { value: '22-23', label: '2022-23' },
    //     { value: '23-24', label: '2023-24' },
    //     { value: '24-25', label: '2024-25' },
    //     { value: '25-26', label: '2025-26' },
    // ];

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

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Column definitions
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
                field: "date",
                headerName: "Date",
                width: isMobile ? 100 : 120,
                pinned: 'left',
                checkboxSelection: false,
                headerCheckboxSelection: false,
            },
            {
                field: "FILE_NAME",
                headerName: "File Name",
                width: isMobile ? 150 : 180,
                cellStyle: { fontWeight: 'bold' }
            },
            {
                field: "translated_site_incharge",
                headerName: "Site Incharge",
                width: isMobile ? 150 : 200
            },
            {
                field: "project_estimated_cost",
                headerName: "Project Estimated Cost",
                width: isMobile ? 140 : 180,
                cellStyle: { textAlign: 'right' },
                cellRenderer: (params) => {
                    return params.value ? `₹ ${params.value}` : '-';
                }
            },
            {
                field: "wages",
                headerName: "Wages",
                width: isMobile ? 100 : 120,
                cellStyle: { textAlign: 'right', fontWeight: 'bold' },
                cellRenderer: (params) => {
                    const value = parseFloat(params.value) || 0;
                    return value > 0 ? `₹ ${value.toLocaleString()}` : '-';
                }
            },
            {
                field: "incentive",
                headerName: "Incentive",
                width: isMobile ? 100 : 120,
                cellStyle: { textAlign: 'right' },
                cellRenderer: (params) => {
                    const value = parseFloat(params.value) || 0;
                    return value > 0 ? `₹ ${value.toLocaleString()}` : '-';
                }
            },
            {
                field: "no_of_persons",
                headerName: "No. Of Persons",
                width: isMobile ? 100 : 130,
                cellStyle: { textAlign: 'center', fontWeight: 'bold' },
                cellRenderer: (params) => {
                    return params.value || '0';
                }
            },
            {
                field: "travelling",
                headerName: "Travelling",
                width: isMobile ? 100 : 120,
                cellStyle: { textAlign: 'right' },
                cellRenderer: (params) => {
                    const value = parseFloat(params.value) || 0;
                    return value > 0 ? `₹ ${value.toLocaleString()}` : '-';
                }
            },
            {
                field: "lodging",
                headerName: "Lodging",
                width: isMobile ? 100 : 120,
                cellStyle: { textAlign: 'right' },
                cellRenderer: (params) => {
                    const value = parseFloat(params.value) || 0;
                    return value > 0 ? `₹ ${value.toLocaleString()}` : '-';
                }
            },
            {
                field: "daily_allowance",
                headerName: "Daily Allowance",
                width: isMobile ? 120 : 140,
                cellStyle: { textAlign: 'right' },
                cellRenderer: (params) => {
                    const value = parseFloat(params.value) || 0;
                    return value > 0 ? `₹ ${value.toLocaleString()}` : '-';
                }
            },
            {
                field: "local_travel",
                headerName: "Local Travel",
                width: isMobile ? 100 : 120,
                cellStyle: { textAlign: 'right' },
                cellRenderer: (params) => {
                    const value = parseFloat(params.value) || 0;
                    return value > 0 ? `₹ ${value.toLocaleString()}` : '-';
                }
            },
            {
                field: "purchase",
                headerName: "Purchase",
                width: isMobile ? 100 : 120,
                cellStyle: { textAlign: 'right' },
                cellRenderer: (params) => {
                    const value = parseFloat(params.value) || 0;
                    return value > 0 ? `₹ ${value.toLocaleString()}` : '-';
                }
            },
            {
                field: "other",
                headerName: "Other",
                width: isMobile ? 100 : 120,
                cellStyle: { textAlign: 'right' },
                cellRenderer: (params) => {
                    const value = parseFloat(params.value) || 0;
                    return value > 0 ? `₹ ${value.toLocaleString()}` : '-';
                }
            },
            {
                field: "total",
                headerName: "Total",
                width: isMobile ? 120 : 140,
                cellStyle: { 
                    textAlign: 'right', 
                    fontWeight: 'bold',
                    backgroundColor: '#e8f5e8',
                    color: '#2e7d32'
                },
                cellRenderer: (params) => {
                    const value = parseFloat(params.value) || 0;
                    return `₹ ${value.toLocaleString()}`;
                }
            },
            {
                field: "comment",
                headerName: "Comment",
                width: isMobile ? 150 : 200,
                cellStyle: { fontStyle: 'italic' }
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

    // Fetch expense data
    const fetchExpenseData = async (fy = financialYear) => {
        setLoading(true);
        try {
            const response = await fetch(
                `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/ExpenseWeeklyDemoApi.php?financial_year=${fy}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.status === "success" && Array.isArray(data.data)) {
                setAllData(data.data);
                setRowData(data.data);
                setSummaryData(data.summary);
                
                // Extract unique file names for dropdown
                const uniqueFileNames = [...new Set(data.data.map(item => item.FILE_NAME))].filter(Boolean);
                const fileOptions = uniqueFileNames.map(fileName => ({
                    value: fileName,
                    label: fileName
                }));
                setFileNameOptions(fileOptions);
                
                toast.success(`Loaded ${data.data.length} expense records for FY ${fy}`);
            } else {
                throw new Error(data.message || "Failed to fetch expense data");
            }
        } catch (error) {
            console.error("Error fetching expense data:", error);
            toast.error(`Error fetching data: ${error.message}`);
            setRowData([]);
            setAllData([]);
            setFileNameOptions([]);
        } finally {
            setLoading(false);
        }
    };

    // Initial data fetch
useEffect(() => {
    setColumnDefs(generateColumnDefs());
    fetchFinancialYears();
}, [isMobile]);

// Fetch data when financial year changes
useEffect(() => {
    if (financialYear) {
        fetchExpenseData();
    }
}, [financialYear]);

    // Handle financial year change
    const handleFinancialYearChange = (e) => {
        const newFY = e.target.value;
        setFinancialYear(newFY);
        setSelectedFileName(null);
        fetchExpenseData(newFY);
    };

    // Handle file name selection
    const handleFileNameChange = (selectedOption) => {
        setSelectedFileName(selectedOption);
        
        if (selectedOption) {
            const filteredData = allData.filter(item => item.FILE_NAME === selectedOption.value);
            setRowData(filteredData);
        } else {
            setRowData(allData);
        }
    };

    // Clear file name filter
    const handleClearFilter = () => {
        setSelectedFileName(null);
        setRowData(allData);
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

    // Export to CSV
    const downloadExcel = () => {
        if (!gridRef.current?.api) return;
        
        try {
            const params = {
                fileName: `ExpenseWeekly_${financialYear}_${selectedFileName?.value || 'All'}_${new Date().toISOString().split('T')[0]}.csv`,
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
    const gridHeight = isFullScreen ? 'calc(100vh - 240px)' : (isMobile ? '400px' : '600px');

    // React Select custom styles
    const customSelectStyles = {
        control: (provided) => ({
            ...provided,
            minWidth: isMobile ? '150px' : '250px',
            backgroundColor: theme === 'dark' ? '#343a40' : '#ffffff',
            borderColor: theme === 'dark' ? '#495057' : '#ced4da',
            color: theme === 'dark' ? '#f8f9fa' : '#212529'
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: theme === 'dark' ? '#343a40' : '#ffffff',
            zIndex: 9999
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isFocused 
                ? (theme === 'dark' ? '#495057' : '#e9ecef')
                : (theme === 'dark' ? '#343a40' : '#ffffff'),
            color: theme === 'dark' ? '#f8f9fa' : '#212529',
            cursor: 'pointer'
        }),
        singleValue: (provided) => ({
            ...provided,
            color: theme === 'dark' ? '#f8f9fa' : '#212529'
        }),
        input: (provided) => ({
            ...provided,
            color: theme === 'dark' ? '#f8f9fa' : '#212529'
        })
    };

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
                                    <i className="bi bi-cash-stack me-2"></i>
                                    Expense Weekly Dashboard
                                </h4>
                                <small style={{ opacity: 0.8 }}>
                                    {summaryData ? (
                                        <>
                                            Total Records: {summaryData.total_records} | 
                                            Total Wages: ₹{parseFloat(summaryData.total_wages || 0).toLocaleString()} | 
                                            Total OT: ₹{parseFloat(summaryData.total_ot || 0).toLocaleString()}
                                        </>
                                    ) : (
                                        `${rowData.length} records found`
                                    )}
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
                                            {!isMobile && ' Export'}
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
                                        </Button>
                                        <Button
                                            variant="outline-light"
                                            onClick={toggleTheme}
                                        >
                                            {theme === 'light' ? '🌙' : '☀️'}
                                        </Button>
                                    </ButtonGroup>
                                </div>
                            </Col>
                        </Row>
                    </Card.Header>

                    {/* Filter Section */}
                    <Card.Body style={{
                        backgroundColor: themeStyles.cardBg,
                        borderBottom: theme === 'dark' ? '1px solid #495057' : '1px solid #dee2e6',
                        padding: '1rem 2rem'
                    }}>
                        <Row className="align-items-center">
                            <Col xs={12} md={6} lg={4} className="mb-2 mb-md-0">
                                <label style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.5rem', display: 'block' }}>
                                    <i className="bi bi-funnel me-2"></i>Select File Name
                                </label>
                                <Select
                                    value={selectedFileName}
                                    onChange={handleFileNameChange}
                                    options={fileNameOptions}
                                    isClearable
                                    placeholder="Search and select file name..."
                                    styles={customSelectStyles}
                                    isSearchable
                                />
                            </Col>
                            <Col xs={12} md={6} lg={3}>
                                <Button 
                                    variant="warning" 
                                    size="sm" 
                                    onClick={handleClearFilter}
                                    style={{ marginTop: isMobile ? '0' : '1.7rem' }}
                                >
                                    <i className="bi bi-x-circle me-1"></i>
                                    Clear Filter
                                </Button>
                            </Col>
                            <Col xs={12} lg={5} className="text-end">
                                <div style={{ marginTop: isMobile ? '1rem' : '1.7rem' }}>
                                    <small style={{ opacity: 0.8 }}>
                                        {selectedFileName 
                                            ? `Showing ${rowData.length} records for ${selectedFileName.label}`
                                            : `Showing all ${rowData.length} records`
                                        }
                                    </small>
                                </div>
                            </Col>
                        </Row>
                    </Card.Body>

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
                                <i className="bi bi-inbox" style={{ fontSize: '3rem', marginBottom: '20px' }}></i>
                                <h5>No expense data available</h5>
                                <p>Please select a different financial year or file name.</p>
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
                                        console.log('Expense Weekly Grid is ready');
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

export default ExpenseWeeklyGrid;