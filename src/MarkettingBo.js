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
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Container, Button, Row, Col, Card, ButtonGroup, Form, Modal, Alert } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';

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

const FinancialSummaryGrid = () => {
    const [theme, setTheme] = useState('light');
    const [categoryData, setCategoryData] = useState([]);
    const [productData, setProductData] = useState([]);
    const [summaryData, setSummaryData] = useState({});
    const [activeTab, setActiveTab] = useState('categories');
    const [selectedFinancialYear, setSelectedFinancialYear] = useState('25-26');
    const [isFullScreen, setIsFullScreen] = useState(true); // Default to full screen
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [loading, setLoading] = useState(false);
    const [showYearModal, setShowYearModal] = useState(false);
    const [tempFinancialYear, setTempFinancialYear] = useState('25-26');
    const [financialYearOptions, setFinancialYearOptions] = useState([]);
    const [loadingYears, setLoadingYears] = useState(true);
    const gridRef = useRef();

    // Handle window resize for mobile responsiveness
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch financial years from API
    const fetchFinancialYears = async () => {
        setLoadingYears(true);
        try {
            const response = await fetch('https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/GetYearsApi.php', {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.status === "success" && data.data) {
                // Sort by sequence_no and transform the data
                const sortedYears = data.data
                    .sort((a, b) => parseInt(a.sequence_no) - parseInt(b.sequence_no))
                    .map(year => ({
                        value: year.financial_year,
                        label: `20${year.financial_year}`
                    }));
                
                setFinancialYearOptions(sortedYears);

                // Set the most recent year as default if current selection is not in the list
                if (sortedYears.length > 0) {
                    const latestYear = sortedYears[sortedYears.length - 1].value;
                    if (!sortedYears.find(y => y.value === selectedFinancialYear)) {
                        setSelectedFinancialYear(latestYear);
                        setTempFinancialYear(latestYear);
                    }
                }
            } else {
                throw new Error(data.message || "Failed to fetch financial years");
            }
        } catch (error) {
            console.error("Error fetching financial years:", error);
            toast.error("Failed to load financial years: " + error.message);
            // Fallback to default years if API fails
            setFinancialYearOptions([
                { value: '20-21', label: '2020-21' },
                { value: '21-22', label: '2021-22' },
                { value: '22-23', label: '2022-23' },
                { value: '23-24', label: '2023-24' },
                { value: '24-25', label: '2024-25' },
                { value: '25-26', label: '2025-26' },
            ]);
        } finally {
            setLoadingYears(false);
        }
    };

    // Fetch financial years on component mount
    useEffect(() => {
        fetchFinancialYears();
    }, []);

    // Column definitions for categories
    const categoryColumnDefs = useMemo(() => [
        {
            headerName: "Sr No",
            field: "id",
            width: isMobile ? 60 : 80,
            minWidth: 50,
            pinned: 'left',
            lockPosition: true,
            cellStyle: { fontWeight: 'bold', textAlign: 'center' },
            suppressSizeToFit: true
        },
        {
            field: "category",
            headerName: "Category",
            width: isMobile ? 120 : 180,
            minWidth: 100,
            pinned: 'left',
            cellStyle: { fontWeight: 'bold' }
        },
        {
            field: "file_count",
            headerName: "No. Of Files",
            width: isMobile ? 100 : 120,
            minWidth: 90,
            cellStyle: { textAlign: 'right' }
        },
        {
            field: "po_amount_formatted",
            headerName: "Basic PO Amount",
            width: isMobile ? 140 : 160,
            minWidth: 120,
            cellStyle: { textAlign: 'right', fontWeight: '500' }
        },
        {
            field: "billing_amount_formatted",
            headerName: "Billing Amount",
            width: isMobile ? 120 : 140,
            minWidth: 100,
            cellStyle: { textAlign: 'right' },
            cellRenderer: () => '-'
        },
        {
            field: "balance_amount_formatted",
            headerName: "Balance Amount",
            width: isMobile ? 140 : 160,
            minWidth: 120,
            cellStyle: { textAlign: 'right', fontWeight: '500', color: '#28a745' }
        }
    ], [isMobile]);

    // Column definitions for products
    const productColumnDefs = useMemo(() => [
        {
            headerName: "Sr No",
            valueGetter: (params) => params.node ? params.node.rowIndex + 1 : '',
            width: isMobile ? 60 : 80,
            minWidth: 50,
            pinned: 'left',
            lockPosition: true,
            cellStyle: { fontWeight: 'bold', textAlign: 'center' },
            suppressSizeToFit: true
        },
        {
            field: "product_name",
            headerName: "Product Name",
            width: isMobile ? 150 : 200,
            minWidth: 120,
            pinned: 'left',
            cellStyle: { fontWeight: 'bold' }
        },
        {
            field: "file_count",
            headerName: "No. Of Files",
            width: isMobile ? 100 : 120,
            minWidth: 90,
            cellStyle: { textAlign: 'right' }
        },
        {
            field: "po_amount_formatted",
            headerName: "Basic PO Amount",
            width: isMobile ? 140 : 160,
            minWidth: 120,
            cellStyle: { textAlign: 'right', fontWeight: '500' },
            valueFormatter: (params) => formatNumberWithCommas(params.value)
        },
        {
            field: "billing_amount_formatted",
            headerName: "Billing Amount",
            width: isMobile ? 120 : 140,
            minWidth: 100,
            cellStyle: { textAlign: 'right' },
            cellRenderer: () => '-',
            valueFormatter: (params) => formatNumberWithCommas(params.value)
        },
        {
            field: "balance_amount_formatted",
            headerName: "Balance Amount",
            width: isMobile ? 140 : 160,
            minWidth: 120,
            cellStyle: { textAlign: 'right', fontWeight: '500', color: '#28a745' },
            valueFormatter: (params) => formatNumberWithCommas(params.value)
        }
    ], [isMobile]);

    const formatNumberWithCommas = (value) => {
        if (value === null || value === undefined || value === '') return '-';
        // Remove any existing commas and convert to number
        const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
        if (isNaN(num)) return value;
        return num.toLocaleString('en-IN');
    };
    const defaultColDef = useMemo(() => ({
        resizable: true,
        sortable: true,
        filter: false,
        flex: isMobile ? 1 : 0,
        cellStyle: { textAlign: 'right' }
    }), [isMobile]);

    // Fetch financial data
    const fetchFinancialData = async (financialYear = selectedFinancialYear) => {
        setLoading(true);
        try {
            // Replace with your actual API endpoint
            const response = await fetch(`https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/financial_summary.php?year=${financialYear}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.status === "success") {
                setCategoryData(data.data.categories || []);
                setProductData(data.data.products || []);
                setSummaryData(data.data.summary || {});
                const selectedYearLabel = financialYearOptions.find(option => option.value === financialYear)?.label || financialYear;
                toast.success(`Financial data loaded for year ${selectedYearLabel}`);
            } else {
                throw new Error(data.message || "Failed to fetch data");
            }
        } catch (error) {
            console.error("Error fetching financial data:", error);
            setCategoryData([]);
            setProductData([]);
            setSummaryData({});
            toast.error("Failed to fetch financial data: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Only fetch financial data if years are loaded and a year is selected
        if (!loadingYears && selectedFinancialYear && financialYearOptions.length > 0) {
            fetchFinancialData();
        }
    }, [selectedFinancialYear, loadingYears, financialYearOptions]);

    const handleYearChange = () => {
        setSelectedFinancialYear(tempFinancialYear);
        setShowYearModal(false);
        fetchFinancialData(tempFinancialYear);
    };

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    const downloadExcel = () => {
        if (!gridRef.current || !gridRef.current.api) {
            console.warn("Grid API not available");
            return;
        }

        try {
            const api = gridRef.current.api;
            const selectedYearLabel = financialYearOptions.find(option => option.value === selectedFinancialYear)?.label || selectedFinancialYear;
            const params = {
                fileName: `Financial_Summary_${activeTab}_${selectedYearLabel}_${new Date().toISOString().split('T')[0]}.csv`,
                allColumns: true,
                onlySelected: false,
                suppressQuotes: false,
                columnSeparator: ','
            };

            api.exportDataAsCsv(params);
            toast.success("Data exported successfully");
        } catch (error) {
            console.error("Error exporting CSV:", error);
            toast.error("Failed to export data");
        }
    };

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

    const currentData = activeTab === 'categories' ? categoryData : productData;
    const currentColumnDefs = activeTab === 'categories' ? categoryColumnDefs : productColumnDefs;
    const selectedYearLabel = financialYearOptions.find(option => option.value === selectedFinancialYear)?.label || selectedFinancialYear;

    // Show loading screen while fetching years or initial data
    if ((loadingYears || loading) && currentData.length === 0) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: theme === 'dark'
                    ? 'linear-gradient(135deg, #21262d 0%, #161b22 100%)'
                    : 'linear-gradient(135deg,rgba(109, 104, 204, 0.91) 0%,rgba(83, 92, 100, 0.32) 100%)'
            }}>
                <div style={{ textAlign: 'center', color: theme === 'dark' ? '#f8f9fa' : '#212529' }}>
                    <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">
                        {loadingYears ? 'Loading financial years...' : `Loading financial data for year ${selectedYearLabel}...`}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            style={{
                minHeight: '100vh',
                background: theme === 'dark'
                    ? 'linear-gradient(135deg, #21262d 0%, #161b22 100%)'
                    : 'linear-gradient(135deg,rgba(109, 104, 204, 0.91) 0%,rgba(83, 92, 100, 0.32) 100%)',
                color: themeStyles.color,
                padding: 0,
                margin: 0,
                overflow: isFullScreen ? 'hidden' : 'auto'
            }}
        >
            <Container
                fluid={isFullScreen}
                style={containerStyles}
                className={isFullScreen ? 'p-0' : ''}
            >
                <Card
                    style={{
                        backgroundColor: themeStyles.cardBg,
                        color: themeStyles.color,
                        border: theme === 'dark' ? '1px solid #495057' : '1px solid #dee2e6',
                        ...cardStyles
                    }}
                >
                    {/* Header */}
                    <Card.Header
                        style={{
                            background: themeStyles.cardHeader,
                            color: '#ffffff',
                            fontFamily: "'Maven Pro', sans-serif",
                            padding: isMobile ? '10px 15px' : '0.5rem 2rem',
                            flexShrink: 0,
                            fontWeight: '100'
                        }}
                    >
                        <Row className="align-items-center g-2">
                            <Col xs={12} lg={6} className="mb-2 mb-lg-0">
                                <h4
                                    className={`mb-1 ${isMobile ? 'fs-6' : ''}`}
                                    style={{
                                        fontFamily: "'Maven Pro', sans-serif",
                                        fontWeight: '100',
                                        color: 'black'
                                    }}
                                >
                                    Financial Summary - {activeTab === 'categories' ? 'Categories' : 'Products'}
                                </h4>
                                <small style={{ color: '#666', fontSize: '0.8rem' }}>
                                    Year: {selectedYearLabel} | Total Records: {currentData.length}
                                    {summaryData.total_files && ` | Total Files: ${summaryData.total_files}`}
                                </small>
                            </Col>

                            <Col xs={12} lg={6}>
                                <div className="d-flex justify-content-end gap-1 flex-wrap">
                                    {/* Year Selection */}
                                    <Button
                                        variant="info"
                                        size="sm"
                                        onClick={() => setShowYearModal(true)}
                                        title="Change Financial Year"
                                    >
                                        <i className="bi bi-calendar"></i> {isMobile ? '' : selectedYearLabel}
                                    </Button>

                                    {/* Tab Toggle */}
                                    <ButtonGroup size="sm">
                                        <Button
                                            variant={activeTab === 'categories' ? 'primary' : 'outline-primary'}
                                            onClick={() => setActiveTab('categories')}
                                        >
                                            {isMobile ? 'Cat' : 'Categories'}
                                        </Button>
                                        <Button
                                            variant={activeTab === 'products' ? 'primary' : 'outline-primary'}
                                            onClick={() => setActiveTab('products')}
                                        >
                                            {isMobile ? 'Prod' : 'Products'}
                                        </Button>
                                    </ButtonGroup>

                                    {/* Export Button */}
                                    <Button
                                        variant="success"
                                        size="sm"
                                        onClick={downloadExcel}
                                        title="Download CSV"
                                    >
                                        <i className="bi bi-download"></i> {isMobile ? '' : 'Export'}
                                    </Button>

                                    {/* Full Screen Toggle */}
                                    <Button
                                        variant="outline-light"
                                        size="sm"
                                        onClick={toggleFullScreen}
                                        title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
                                    >
                                        <i className={`bi ${isFullScreen ? 'bi-fullscreen-exit' : 'bi-fullscreen'}`}></i>
                                    </Button>

                                    {/* Theme Toggle */}
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
                    </Card.Header>

                    {/* Summary Cards */}
                    {summaryData && Object.keys(summaryData).length > 0 && (
                        <div style={{ 
                            padding: isMobile ? '10px' : '15px',
                            backgroundColor: theme === 'dark' ? '#343a40' : '#f8f9fa'
                        }}>
                            <Row className="g-2">
                                <Col xs={6} md={3}>
                                    <Card className="text-center" style={{
                                        backgroundColor: theme === 'dark' ? '#495057' : '#ffffff',
                                        color: theme === 'dark' ? '#f8f9fa' : '#212529',
                                        border: theme === 'dark' ? '1px solid #6c757d' : '1px solid #dee2e6'
                                    }}>
                                        <Card.Body style={{ padding: isMobile ? '10px' : '15px' }}>
                                            <h6 className="mb-1" style={{ fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
                                                Total Files
                                            </h6>
                                            <h5 style={{ 
                                                color: '#007bff', 
                                                fontSize: isMobile ? '1.1rem' : '1.3rem',
                                                fontWeight: 'bold'
                                            }}>
                                                {summaryData.total_files || 0}
                                            </h5>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col xs={6} md={3}>
                                    <Card className="text-center" style={{
                                        backgroundColor: theme === 'dark' ? '#495057' : '#ffffff',
                                        color: theme === 'dark' ? '#f8f9fa' : '#212529',
                                        border: theme === 'dark' ? '1px solid #6c757d' : '1px solid #dee2e6'
                                    }}>
                                        <Card.Body style={{ padding: isMobile ? '10px' : '15px' }}>
                                            <h6 className="mb-1" style={{ fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
                                                Category Total
                                            </h6>
                                            <h5 style={{ 
                                                color: '#28a745', 
                                                fontSize: isMobile ? '0.9rem' : '1.1rem',
                                                fontWeight: 'bold'
                                            }}>
                                                {summaryData.category_total_formatted || '0'}
                                            </h5>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col xs={6} md={3}>
                                    <Card className="text-center" style={{
                                        backgroundColor: theme === 'dark' ? '#495057' : '#ffffff',
                                        color: theme === 'dark' ? '#f8f9fa' : '#212529',
                                        border: theme === 'dark' ? '1px solid #6c757d' : '1px solid #dee2e6'
                                    }}>
                                        <Card.Body style={{ padding: isMobile ? '10px' : '15px' }}>
                                            <h6 className="mb-1" style={{ fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
                                                Product Total
                                            </h6>
                                            <h5 style={{ 
                                                color: '#17a2b8', 
                                                fontSize: isMobile ? '0.9rem' : '1.1rem',
                                                fontWeight: 'bold'
                                            }}>
                                                {summaryData.product_total_formatted || '0'}
                                            </h5>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col xs={6} md={3}>
                                    <Card className="text-center" style={{
                                        backgroundColor: theme === 'dark' ? '#495057' : '#ffffff',
                                        color: theme === 'dark' ? '#f8f9fa' : '#212529',
                                        border: theme === 'dark' ? '1px solid #6c757d' : '1px solid #dee2e6'
                                    }}>
                                        <Card.Body style={{ padding: isMobile ? '10px' : '15px' }}>
                                            <h6 className="mb-1" style={{ fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
                                                Active Tab
                                            </h6>
                                            <h5 style={{ 
                                                color: '#ffc107', 
                                                fontSize: isMobile ? '1.1rem' : '1.3rem',
                                                fontWeight: 'bold'
                                            }}>
                                                {currentData.length}
                                            </h5>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </div>
                    )}

                    {/* Grid Body */}
                    <Card.Body
                        style={{
                            backgroundColor: themeStyles.cardBg,
                            color: themeStyles.color,
                            padding: isFullScreen ? '0' : (isMobile ? '10px' : '15px'),
                            flex: 1,
                            overflow: 'hidden'
                        }}
                    >
                        {loading ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '50px',
                                color: theme === 'dark' ? '#f8f9fa' : '#212529'
                            }}>
                                <div className="spinner-border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="mt-3">Loading {activeTab}...</p>
                            </div>
                        ) : currentData.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '50px',
                                color: theme === 'dark' ? '#f8f9fa' : '#212529'
                            }}>
                                <i className="bi bi-graph-up" style={{ fontSize: '3rem', marginBottom: '20px' }}></i>
                                <h5>No financial data found</h5>
                                <p>No data available for year {selectedYearLabel}. Please try a different year.</p>
                            </div>
                        ) : (
                            <div
                                className="ag-theme-alpine"
                                style={{
                                    height: getGridHeight(),
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
                                    rowData={currentData}
                                    columnDefs={currentColumnDefs}
                                    defaultColDef={defaultColDef}
                                    pagination={true}
                                    paginationPageSize={isMobile ? 10 : (isFullScreen ? 15 : 10)}
                                    suppressMovableColumns={isMobile}
                                    enableRangeSelection={!isMobile}
                                    animateRows={!isMobile}
                                    enableCellTextSelection={true}
                                    suppressHorizontalScroll={false}
                                    suppressColumnVirtualisation={isMobile}
                                    rowBuffer={isMobile ? 5 : 10}
                                    headerHeight={isMobile ? 40 : 48}
                                    rowHeight={isMobile ? 35 : 42}
                                    suppressMenuHide={isMobile}
                                    suppressContextMenu={isMobile}
                                    onGridReady={(params) => {
                                        console.log('Financial grid is ready');
                                    }}
                                />
                            </div>
                        )}
                    </Card.Body>
                </Card>

                {/* Financial Year Selection Modal */}
                <Modal
                    show={showYearModal}
                    onHide={() => setShowYearModal(false)}
                    centered
                    backdrop="static"
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Select Financial Year</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group>
                            <Form.Label>Financial Year</Form.Label>
                            <Form.Select
                                value={tempFinancialYear}
                                onChange={(e) => setTempFinancialYear(e.target.value)}
                            >
                                {financialYearOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Alert variant="info" className="mt-3">
                            <small>
                                <i className="bi bi-info-circle"></i> Select the financial year to view data for that period.
                            </small>
                        </Alert>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant="secondary"
                            onClick={() => setShowYearModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleYearChange}
                            disabled={!tempFinancialYear}
                        >
                            Load Data
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
            </Container>
        </div>
    );
};

export default FinancialSummaryGrid;