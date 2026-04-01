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

const SecondDCLabourGrid = ({ onNavigateToManager }) => {
    const navigate = useNavigate();
    const [theme, setTheme] = useState('light');
    const [rowData, setRowData] = useState([]);
    const [columnDefs, setColumnDefs] = useState([]);
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [autoNavigateOnSelect, setAutoNavigateOnSelect] = useState(false);
    const [financialYear, setFinancialYear] = useState('25-26');
    const [fyOptions, setFyOptions] = useState([]);
    const gridRef = useRef();

    // Handle window resize
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch financial year dropdown options
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
                    setFyOptions(opts);
                }
            } catch (err) {
                console.error("Error fetching FY options:", err);
                // Fallback
                setFyOptions([
                    { value: '23-24', label: '23-24' },
                    { value: '24-25', label: '24-25' },
                    { value: '25-26', label: '25-26' },
                ]);
            }
        };
        fetchOptions();
    }, []);

    // Column definitions
    const generateColumnDefs = () => [
        {
            headerName: "Sr No",
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
            width: isMobile ? 200 : 320,
            pinned: 'left',
            checkboxSelection: true,
            headerCheckboxSelection: false,
            cellStyle: { fontWeight: 'bold', color: '#0d6efd', cursor: 'pointer' },
            filter: 'agTextColumnFilter',
            cellRenderer: (params) => {
                return params.value;
            }
        },
        {
            field: "file_id",
            headerName: "File ID",
            width: isMobile ? 90 : 110,
            cellStyle: { textAlign: 'center', color: '#6c757d', fontSize: '12px' },
            filter: 'agNumberColumnFilter'
        },
        {
            field: "delivery_date",
            headerName: "Delivery Date",
            width: isMobile ? 130 : 160,
            cellStyle: { textAlign: 'center' },
            filter: 'agTextColumnFilter',
            cellRenderer: (params) => {
                const val = params.value;
                // if (!val || val === '-' || val === '') {
                //     return `<span style="color:#aaa;font-style:italic;">—</span>`;
                // }
                return val;
            }
        },
        // {
        //     field: "redirect_url",
        //     headerName: "Action",
        //     width: isMobile ? 120 : 150,
        //     cellStyle: { textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' },
        //     cellRenderer: (params) => {
        //         const fileId = params.data?.file_id;
        //         return `<button
        //             onclick="window.__navigateSecondDC && window.__navigateSecondDC('${fileId}')"
        //             style="
        //                 padding:4px 12px;font-size:11px;font-weight:600;
        //                 background:#0d6efd;color:#fff;border:none;
        //                 border-radius:4px;cursor:pointer;
        //             "
        //         >View Details</button>`;
        //     }
        // }
    ];

    const defaultColDef = useMemo(() => ({
        filter: true,
        sortable: true,
        floatingFilter: !isMobile,
        resizable: true,
        suppressMenu: isMobile,
        cellStyle: { textAlign: 'left' }
    }), [isMobile]);

    // Fetch data
    const fetchData = async (fy = financialYear) => {
        setLoading(true);
        try {
            const response = await fetch(
                `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/secondDcLabourApi.php?financial_year=${fy}`
            );

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const text = await response.text();
            const jsonStart = text.indexOf("{");
            const data = JSON.parse(jsonStart >= 0 ? text.slice(jsonStart) : text);

            if (data.status === true && Array.isArray(data.data)) {
                setRowData(data.data);
                toast.success(`Loaded ${data.data.length} records for FY ${fy}`);
            } else {
                setRowData([]);
                toast.warning(data.message || "No data found");
            }
        } catch (error) {
            console.error("Error fetching Second DC Labour data:", error);
            toast.error(`Error fetching data: ${error.message}`);
            setRowData([]);
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        setColumnDefs(generateColumnDefs());
        fetchData();
    }, [financialYear, isMobile]);

    // Register global navigate for cell renderer button
    useEffect(() => {
        window.__navigateSecondDC = (fileId) => {
            if (!fileId) { toast.error('File ID not found'); return; }
            toast.info(`Opening details for File ID: ${fileId}...`);
            setTimeout(() => {
                navigate(`/project/ppc/second-dc-labour-details/${fileId}`);
            }, 300);
        };
        return () => { delete window.__navigateSecondDC; };
    }, [navigate]);

    // FY change
    const handleFinancialYearChange = (e) => {
        setFinancialYear(e.target.value);
    };

    // Row selection
    const onSelectionChanged = (event) => {
        const selectedNodes = event.api.getSelectedNodes();
        const selectedData = selectedNodes.map(node => node.data);
        setSelectedRows(selectedData);

        if (autoNavigateOnSelect && selectedData.length === 1) {
            const record = selectedData[0];
            if (!record?.file_id) { toast.error('File ID not found'); return; }
            toast.info(`Opening details for ${record.file_name}...`);
            setTimeout(() => {
                navigate(`/project/ppc/second-dc-labour-details/${record.file_id}`);
                if (onNavigateToManager) onNavigateToManager(record.file_id, record);
            }, 400);
        }
    };

    // Manual navigate
    const handleNavigateToDetails = () => {
        if (selectedRows.length === 0) return toast.error('Please select at least one record');
        if (selectedRows.length > 1) return toast.error('Please select only one record at a time');
        const record = selectedRows[0];
        if (!record?.file_id) return toast.error('File ID not found');
        navigate(`/project/ppc/second-dc-labour-details/${record.file_id}`, {
            state: { fileName: record.file_name, fileId: record.file_id }
        });
        if (onNavigateToManager) onNavigateToManager(record.file_id, record);
    };

    const toggleTheme = () => setTheme(p => p === 'light' ? 'dark' : 'light');
    const toggleFullScreen = () => setIsFullScreen(p => !p);
    const toggleAutoNavigate = () => {
        setAutoNavigateOnSelect(p => !p);
        toast.info(`Auto-navigation ${!autoNavigateOnSelect ? 'enabled' : 'disabled'}`);
    };

    const downloadExcel = () => {
        if (!gridRef.current?.api) return;
        gridRef.current.api.exportDataAsCsv({
            fileName: `SecondDCLabour_${financialYear}_${new Date().toISOString().split('T')[0]}.csv`,
            allColumns: true,
        });
        toast.success('Data exported successfully!');
    };

    const autoSizeAll = () => {
        if (!gridRef.current?.api) return;
        setTimeout(() => {
            const ids = gridRef.current.api.getColumns()?.map(c => c.getId()) || [];
            if (ids.length) gridRef.current.api.autoSizeColumns(ids, false);
        }, 100);
    };

    const handleRefresh = () => {
        fetchData(financialYear);
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
                minHeight: '100vh', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                background: themeStyles.backgroundColor
            }}>
                <div style={{ textAlign: 'center', color: themeStyles.color }}>
                    <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading Second DC Labour data...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: themeStyles.backgroundColor,
            color: themeStyles.color,
            padding: 0, margin: 0
        }}>
            <Container fluid={isFullScreen}>
                <Card style={{
                    backgroundColor: themeStyles.cardBg,
                    color: themeStyles.color,
                    border: theme === 'dark' ? '1px solid #495057' : '1px solid #dee2e6',
                    margin: isFullScreen ? 0 : 20,
                    borderRadius: isFullScreen ? 0 : 8
                }}>
                    {/* ── Header ── */}
                    <Card.Header style={{
                        background: themeStyles.cardHeader,
                        color: theme === 'dark' ? '#ffffff' : '#000000',
                        fontFamily: "'Maven Pro', sans-serif",
                        padding: '1rem 2rem'
                    }}>
                        <Row className="align-items-center">
                            <Col xs={12} lg={6} className="mb-2 mb-lg-0">
                                <h4 className="mb-0">
                                    <i className="bi bi-file-earmark-text me-2"></i>
                                    Second DC Labour List
                                </h4>
                                <small style={{ opacity: 0.8 }}>
                                    {`${rowData.length} records · FY ${financialYear}`}
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
                                        style={{ width: 'auto', minWidth: '120px' }}
                                        size="sm"
                                    >
                                        {fyOptions.length > 0
                                            ? fyOptions.map(o => (
                                                <option key={o.value} value={o.value}>{`FY ${o.label}`}</option>
                                            ))
                                            : <option value={financialYear}>{`FY ${financialYear}`}</option>
                                        }
                                    </Form.Select>

                                    {/* Refresh */}
                                    <Button variant="outline-primary" size="sm" onClick={handleRefresh} title="Refresh data">
                                        <i className="bi bi-arrow-clockwise"></i>
                                        {!isMobile && ' Refresh'}
                                    </Button>

                                    {/* Auto-Navigate Toggle */}
                                    <Button
                                        variant={autoNavigateOnSelect ? "success" : "outline-secondary"}
                                        size="sm"
                                        onClick={toggleAutoNavigate}
                                        title="Toggle auto-navigation on row select"
                                    >
                                        <i className="bi bi-lightning"></i>
                                        {!isMobile && ' Auto'}
                                    </Button>

                                    {/* View Details (manual) */}
                                    {!autoNavigateOnSelect && selectedRows.length > 0 && (
                                        <Button variant="primary" size="sm" onClick={handleNavigateToDetails}>
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

                    {/* ── Grid Body ── */}
                    <Card.Body style={{
                        backgroundColor: themeStyles.cardBg,
                        padding: isFullScreen ? 0 : 15
                    }}>
                        {rowData.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '50px', color: themeStyles.color }}>
                                <i className="bi bi-file-earmark-text" style={{ fontSize: '3rem', marginBottom: '20px', display: 'block' }}></i>
                                <h5>No data available</h5>
                                <p>Please select a different financial year or check your API connection.</p>
                                <Button variant="outline-primary" size="sm" onClick={handleRefresh}>
                                    <i className="bi bi-arrow-clockwise me-1"></i> Try Again
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
                                        '--ag-selected-row-background-color': '#0d6efd33',
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
                                    animateRows={!isMobile}
                                    enableCellTextSelection={true}
                                    suppressHorizontalScroll={false}
                                    headerHeight={isMobile ? 40 : 48}
                                    rowHeight={isMobile ? 35 : 42}
                                    onRowClicked={(params) => {
                                        const record = params.data;
                                        if (!record?.file_id) {
                                            toast.error('File ID not found');
                                            return;
                                        }
                                        navigate(`/project/ppc/second-dc-labour-details/${record.file_id}`, {
                                            state: { fileName: record.file_name, fileId: record.file_id }
                                        });
                                    }}
                                    onGridReady={() => {
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
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme={theme}
            />
        </div>
    );
};

export default SecondDCLabourGrid;