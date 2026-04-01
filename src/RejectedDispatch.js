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
import axios from "axios";
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

const CostChitGrid = ({ onNavigateToManager }) => {
    const navigate = useNavigate();
    const [theme, setTheme] = useState('light');
    const [rowData, setRowData] = useState([]);
    const [columnDefs, setColumnDefs] = useState([]);
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [options, setOptions] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);
    
    const [financialYear, setFinancialYear] = useState('25-26');
    const [autoNavigateOnSelect, setAutoNavigateOnSelect] = useState(false);
    const gridRef = useRef();

    // Financial year options
    const financialYearOptions = [
        { value: 'all', label: 'All Years' },
        { value: '16-17', label: '2016-17' },
        { value: '17-18', label: '2017-18' },
        { value: '18-19', label: '2018-19' },
        { value: '19-20', label: '2019-20' },
        { value: '20-21', label: '2020-21' },
        { value: '21-22', label: '2021-22' },
        { value: '22-23', label: '2022-23' },
        { value: '23-24', label: '2023-24' },
        { value: '24-25', label: '2024-25' },
        { value: '25-26', label: '2025-26' },
    ];
 // ⬇️ Fetch dropdown options
 useEffect(() => {
    const fetchOptions = async () => {
        try {
            const res = await axios.post(
                "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/getDropdownOptions.php",
                { rule_name: "financial_year" },
                { headers: { "Content-Type": "application/json" } }
            );
            if (res.data.status === "success") {
                const opts = res.data.data.map((item) => ({
                    value: item.financial_year,
                    label: item.financial_year,
                }));
                setOptions(opts);
                const defaultOption = opts.find(o => o.value === "25-26");
                if (defaultOption) setSelectedOption(defaultOption);
            }
        } catch (err) {
            console.error("Error fetching dropdown options:", err);
        }
    };

    fetchOptions();
}, []);
    // Handle window resize for mobile responsiveness
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Column definitions for SM file list data
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
                cellStyle: { fontWeight: 'bold' },
                cellRenderer: (params) => {
                    return `${params.value}`;
                }
            },
            {
                field: "dispatchDate",
                headerName: "Dispatch Date",
                width: isMobile ? 140 : 180,
                filter: 'agTextColumnFilter'
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
        cellStyle: { textAlign: 'right' }
    }), [isMobile]);

    // Fetch SM file list data
    const fetchSMFileListData = async (fy = financialYear) => {
        setLoading(true);
        try {
            // Create form data for POST request
            const formData = new FormData();
            formData.append('financial_year', fy);

            const response = await fetch("https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/project/disptch/get_rejectedDispatch_23.php", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('API Response:', data); // Debug log

            // Handle different response formats
            if (data.status === "success" && Array.isArray(data.data)) {
                setRowData(data.data);
                toast.success(`Loaded ${data.data.length} file records for FY ${fy}`);
            } else if (Array.isArray(data)) {
                // Direct array response
                setRowData(data);
                toast.success(`Loaded ${data.length} file records for FY ${fy}`);
            } else if (data.status === "error") {
                throw new Error(data.message || "API returned error");
            } else {
                console.warn('Unexpected data format:', data);
                setRowData([]);
                toast.warning("No data found or unexpected response format");
            }
        } catch (error) {
            console.error("Error fetching Rejected Dispatch File List:", error);
            toast.error(`Error fetching data: ${error.message}`);
            setRowData([]);
        } finally {
            setLoading(false);
        }
    };

    // Initial data fetch
    useEffect(() => {
        setColumnDefs(generateColumnDefs());
        fetchSMFileListData();
    }, [financialYear, isMobile]);

    // Handle financial year change
    const handleFinancialYearChange = (e) => {
        const newFY = e.target.value;
        setFinancialYear(newFY);
        fetchSMFileListData(newFY);
    };

    // Modified onSelectionChanged to handle auto-navigation
   // Modified onSelectionChanged to handle auto-navigation
const onSelectionChanged = (event) => {
    const selectedNodes = event.api.getSelectedNodes();
    const selectedData = selectedNodes.map(node => node.data);
    setSelectedRows(selectedData);

    // Auto-navigate when a row is selected (if enabled)
    if (autoNavigateOnSelect && selectedData.length === 1) {
        const selectedRecord = selectedData[0];

        // ✅ Fixed field name: fileid instead of file_id
        if (!selectedRecord.fileid) {
            toast.error('File ID not found in selected record');
            return;
        }

        // Show a brief toast before navigating
        toast.info(`Opening file details for ${selectedRecord.FILE_NAME}...`);

        // Navigate after a short delay to show the toast
        setTimeout(() => {
            // ✅ Fixed URL path to match your pattern
            navigate(`/project/dispatch/Rejected-dispatch-details/${selectedRecord.file_id}`);

            // Also call callback if provided
            if (onNavigateToManager) {
                onNavigateToManager(selectedRecord.fileid, selectedRecord);
            }
        }, 400);
    }
};


    // Handle navigation to Cost Chit Manager (manual navigation)
    const handleNavigateToManager = () => {
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

        // Navigate to the marketing cost route with fileid
        navigate(`/misc-file-required-material/${selectedRecord.fileid}`);

        // Also call the callback if provided (for backward compatibility)
        if (onNavigateToManager) {
            onNavigateToManager(selectedRecord.fileid, selectedRecord);
        }
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
                fileName: `SMFileListData_${financialYear}_${new Date().toISOString().split('T')[0]}.csv`,
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
                    <p className="mt-3">Loading Rejected Dispatch File List...</p>
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
                                Rejected Dispatch File List
                                </h4>
                                <small style={{ opacity: 0.8 }}>
                                    {`${rowData.length} records found for FY ${financialYear}`}
                                    {selectedRows.length > 0 && ` | ${selectedRows.length} selected`}
                                    {autoNavigateOnSelect && ' | Auto-nav ON'}
                                </small>
                            </Col>

                            <Col xs={12} lg={6}>
                                <div className="d-flex justify-content-end gap-2 flex-wrap align-items-center">
                                    {/* Financial Year Selector */}
                                    <Form.Select
                                        value={financialYear}
                                        onChange={handleFinancialYearChange}
                                        style={{ width: 'auto', minWidth: '140px' }}
                                        size="sm"
                                    >
                                        {options.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.value === 'all' ? 'All Years' : `FY ${option.label}`}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    {/* <Select
                                        options={options}
                                        value={selectedOption}
                                        onChange={handleYearChange}
                                        placeholder="Select Financial Year..."
                                        isClearable
                                        styles={{
                                            container: (base) => ({ ...base, minWidth: 200 }),
                                        }}
                                    /> */}
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

                                    {/* Navigate to Manager Button (only show if auto-navigate is disabled) */}
                                    {!autoNavigateOnSelect && selectedRows.length > 0 && (
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={handleNavigateToManager}
                                        >
                                            <i className="bi bi-pencil-square"></i>
                                            {!isMobile && ' Manage'}
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
                                <i className="bi bi-files" style={{ fontSize: '3rem', marginBottom: '20px' }}></i>
                                <h5>No file data available</h5>
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
                                    rowSelection="single"
                                    onSelectionChanged={onSelectionChanged}
                                    suppressMovableColumns={isMobile}
                                    enableRangeSelection={!isMobile}
                                    rowMultiSelectWithClick={false}
                                    animateRows={!isMobile}
                                    enableCellTextSelection={true}
                                    suppressHorizontalScroll={false}
                                    headerHeight={isMobile ? 40 : 48}
                                    rowHeight={isMobile ? 35 : 42}
                                    onRowClicked={(params) => {
                                        // ✅ Single-click navigation
                                        const record = params.data;
                                        if (!record?.file_id) {
                                          toast.error('File ID not found for this record');
                                          return;
                                        }
                                        navigate(`/project/dispatch/Rejected-dispatch-details/${record.file_id}`);
                                      }}
                                    onGridReady={(params) => {
                                        console.log('Rejected Dispatch File List  Grid is ready');
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

export default CostChitGrid;