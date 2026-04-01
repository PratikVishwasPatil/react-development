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

const RFDMaterialStockGrid = () => {
    const [theme, setTheme] = useState('light');
    const [rowData, setRowData] = useState([]);
    const [materialData, setMaterialData] = useState([]);
    const [columnDefs, setColumnDefs] = useState([]);
    const [materialColumnDefs, setMaterialColumnDefs] = useState([]);
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [loading, setLoading] = useState(false);
    const [loadingMaterial, setLoadingMaterial] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [financialYears, setFinancialYears] = useState([]);
    const [selectedFinancialYear, setSelectedFinancialYear] = useState('');
    const [loadingYears, setLoadingYears] = useState(false);
    const [showMaterialGrid, setShowMaterialGrid] = useState(false);
    const [selectedFileName, setSelectedFileName] = useState('');
    const gridRef = useRef();
    const materialGridRef = useRef();

    // Toast notification function
    const showToast = (message, type = 'info') => {
        const toastDiv = document.createElement('div');
        toastDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
            color: white;
            border-radius: 5px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.2);
            z-index: 9999;
            font-family: Arial, sans-serif;
            animation: slideIn 0.3s ease-out;
        `;
        toastDiv.textContent = message;
        document.body.appendChild(toastDiv);
        
        setTimeout(() => {
            toastDiv.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => document.body.removeChild(toastDiv), 300);
        }, 3000);
    };

    // Add animation styles
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(400px); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch Financial Years
    const fetchFinancialYears = async () => {
        setLoadingYears(true);
        try {
            const response = await fetch("https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/GetYearsApi.php", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            let yearsData = [];
            if (data.status === "success" && Array.isArray(data.data)) {
                yearsData = data.data;
            } else if (Array.isArray(data)) {
                yearsData = data;
            }

            // Sort financial years in descending order (latest first)
            yearsData.sort((a, b) => {
                const yearA = a.FINANCIAL_YEAR || a.financial_year;
                const yearB = b.FINANCIAL_YEAR || b.financial_year;
                return yearB.localeCompare(yearA);
            });

            setFinancialYears(yearsData);
            
            // Set latest year (25-26) as default
            if (yearsData.length > 0) {
                setSelectedFinancialYear(yearsData[0].FINANCIAL_YEAR || yearsData[0].financial_year);
            }
        } catch (error) {
            console.error("Error fetching financial years:", error);
            showToast(`Error loading financial years: ${error.message}`, 'error');
        } finally {
            setLoadingYears(false);
        }
    };

    // File List Column definitions - Only FILE_NAME
    const generateFileColumnDefs = () => {
        return [
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
                width: isMobile ? 300 : 600,
                flex: 1,
                checkboxSelection: true,
                headerCheckboxSelection: false,
                cellStyle: { 
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    color: '#007bff'
                }
            },
            {
                field: "FILE_ID",
                headerName: "File ID",
                hide: true,
                width: 0
            },
            {
                field: "CUSTOMER_NAME",
                headerName: "Customer Name",
                hide: true,
                width: 0
            }
        ];
    };

    // Material Data Column definitions
    const generateMaterialColumnDefs = (data) => {
        if (!data || data.length === 0) return [];

        const sampleRow = data[0];
        const columns = [
            {
                headerName: "Sr No",
                field: "serialNumber",
                valueGetter: (params) => params.node ? params.node.rowIndex + 1 : '',
                width: 70,
                minWidth: 50,
                pinned: 'left',
                lockPosition: true,
                cellStyle: { fontWeight: 'bold', textAlign: 'center' }
            }
        ];

        // Dynamically create columns based on API response keys
        Object.keys(sampleRow).forEach(key => {
            if (key !== 'serialNumber') {
                columns.push({
                    field: key,
                    headerName: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    width: 150,
                    minWidth: 120,
                    filter: true,
                    sortable: true
                });
            }
        });

        return columns;
    };

    const defaultColDef = useMemo(() => ({
        filter: true,
        sortable: true,
        floatingFilter: !isMobile,
        resizable: true,
        suppressMenu: isMobile,
        cellStyle: { textAlign: 'right' }
    }), [isMobile]);

    // Fetch File List data
    const fetchFileListData = async (financialYear) => {
        if (!financialYear) {
            showToast('Please select a financial year', 'error');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(
                `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/getRfdMaterialStock.php?financial_year=${encodeURIComponent(financialYear)}`,
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
                setRowData(data.data);
                showToast(`Loaded ${data.count} files for FY ${financialYear}`, 'success');
            } else if (Array.isArray(data)) {
                setRowData(data);
                showToast(`Loaded ${data.length} files for FY ${financialYear}`, 'success');
            } else {
                setRowData([]);
                showToast('No files found for selected financial year', 'info');
            }
        } catch (error) {
            console.error("Error fetching file list:", error);
            showToast(`Error fetching data: ${error.message}`, 'error');
            setRowData([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Material Stock Data
    const fetchMaterialStockData = async (fileId, fileName) => {
        if (!fileId || !selectedFinancialYear) {
            showToast('Missing file ID or financial year', 'error');
            return;
        }

        setLoadingMaterial(true);
        setShowMaterialGrid(true);
        setSelectedFileName(fileName);
        
        try {
            const response = await fetch(
                `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/getRfdMaterialStock.php?financial_year=${encodeURIComponent(selectedFinancialYear)}&file_id=${encodeURIComponent(fileId)}`,
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
                setMaterialData(data.data);
                setMaterialColumnDefs(generateMaterialColumnDefs(data.data));
                showToast(`Loaded ${data.data.length} material records`, 'success');
            } else if (Array.isArray(data)) {
                setMaterialData(data);
                setMaterialColumnDefs(generateMaterialColumnDefs(data));
                showToast(`Loaded ${data.length} material records`, 'success');
            } else {
                setMaterialData([]);
                setMaterialColumnDefs([]);
                showToast('No material data found', 'info');
            }
        } catch (error) {
            console.error("Error fetching material stock:", error);
            showToast(`Error fetching material data: ${error.message}`, 'error');
            setMaterialData([]);
            setMaterialColumnDefs([]);
        } finally {
            setLoadingMaterial(false);
        }
    };

    // Initial load
    useEffect(() => {
        setColumnDefs(generateFileColumnDefs());
        fetchFinancialYears();
    }, [isMobile]);

    // Load data when financial year changes
    useEffect(() => {
        if (selectedFinancialYear) {
            fetchFileListData(selectedFinancialYear);
            setShowMaterialGrid(false);
            setMaterialData([]);
        }
    }, [selectedFinancialYear]);

    // Handle selection changed - auto navigate to new tab
    const onSelectionChanged = (event) => {
        const selectedNodes = event.api.getSelectedNodes();
        const selectedData = selectedNodes.map(node => node.data);
        setSelectedRows(selectedData);

        if (selectedData.length === 1) {
            const selectedRecord = selectedData[0];

            if (!selectedRecord.FILE_ID) {
                showToast('File ID not found in selected record', 'error');
                return;
            }

            // Open material stock details page in new tab
            const detailsUrl = `#/rfd-material-stock/details/${selectedRecord.FILE_ID}`;
            window.open(detailsUrl, '_blank');
            
            // Optionally show a toast
            showToast(`Opening material stock for ${selectedRecord.FILE_NAME}`, 'info');
        }
    };

    // Handle financial year change
    const handleFinancialYearChange = (e) => {
        setSelectedFinancialYear(e.target.value);
    };

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    // Export to CSV
    const downloadExcel = (gridType = 'files') => {
        const currentGridRef = gridType === 'files' ? gridRef : materialGridRef;
        if (!currentGridRef.current?.api) return;

        try {
            const fileName = gridType === 'files' 
                ? `FileList_FY${selectedFinancialYear}_${new Date().toISOString().split('T')[0]}.csv`
                : `MaterialStock_${selectedFileName}_${new Date().toISOString().split('T')[0]}.csv`;

            const params = {
                fileName: fileName,
                allColumns: true,
                onlySelected: false
            };
            currentGridRef.current.api.exportDataAsCsv(params);
            showToast('Data exported successfully!', 'success');
        } catch (error) {
            console.error('Error exporting data:', error);
            showToast('Error exporting data', 'error');
        }
    };

    // Auto size columns
    const autoSizeAll = (gridType = 'files') => {
        const currentGridRef = gridType === 'files' ? gridRef : materialGridRef;
        if (!currentGridRef.current?.api) return;

        try {
            setTimeout(() => {
                const allColumnIds = currentGridRef.current.api.getColumns()?.map(column => column.getId()) || [];
                if (allColumnIds.length > 0) {
                    currentGridRef.current.api.autoSizeColumns(allColumnIds, false);
                }
            }, 100);
        } catch (error) {
            console.error('Error auto-sizing columns:', error);
        }
    };

    // Refresh data
    const handleRefresh = () => {
        if (selectedFinancialYear) {
            fetchFileListData(selectedFinancialYear);
            setShowMaterialGrid(false);
            setMaterialData([]);
            showToast('Refreshing data...', 'info');
        }
    };

    // Back to file list
    const handleBackToFileList = () => {
        setShowMaterialGrid(false);
        setMaterialData([]);
        setSelectedFileName('');
        if (gridRef.current?.api) {
            gridRef.current.api.deselectAll();
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

    if (loading && rowData.length === 0) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: themeStyles.backgroundColor
            }}>
                <div style={{ textAlign: 'center', color: themeStyles.color }}>
                    <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem', borderColor: '#007bff', borderRightColor: 'transparent' }}>
                        <span style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden' }}>Loading...</span>
                    </div>
                    <p style={{ marginTop: '1rem' }}>Loading file list...</p>
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
            <div style={{ 
                width: '100%', 
                maxWidth: isFullScreen ? '100%' : '1400px',
                margin: '0 auto',
                padding: isFullScreen ? 0 : '20px'
            }}>
                {/* File List Grid */}
                {!showMaterialGrid && (
                    <div style={{
                        backgroundColor: themeStyles.cardBg,
                        color: themeStyles.color,
                        border: theme === 'dark' ? '1px solid #495057' : '1px solid #dee2e6',
                        borderRadius: isFullScreen ? 0 : '8px',
                        overflow: 'hidden'
                    }}>
                        {/* Header */}
                        <div style={{
                            background: themeStyles.cardHeader,
                            color: theme === 'dark' ? '#ffffff' : '#000000',
                            fontFamily: "'Maven Pro', sans-serif",
                            padding: '1rem 2rem'
                        }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                                <div style={{ flex: isMobile ? '1 1 100%' : '1 1 auto' }}>
                                    <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span>📋</span>
                                        File List - Select to View Material Stock
                                    </h4>
                                    <small style={{ opacity: 0.8 }}>
                                        {`${rowData.length} files found`}
                                    </small>
                                </div>

                                <div style={{ 
                                    display: 'flex', 
                                    flexWrap: 'wrap',
                                    gap: '0.5rem',
                                    alignItems: 'center',
                                    flex: isMobile ? '1 1 100%' : '0 1 auto'
                                }}>
                                    {/* Financial Year Dropdown */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <label style={{ fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                                            FY:
                                        </label>
                                        <select
                                            value={selectedFinancialYear}
                                            onChange={handleFinancialYearChange}
                                            disabled={loadingYears}
                                            style={{
                                                padding: '0.375rem 0.75rem',
                                                fontSize: '0.875rem',
                                                borderRadius: '0.25rem',
                                                border: '1px solid #ced4da',
                                                backgroundColor: theme === 'dark' ? '#495057' : '#ffffff',
                                                color: theme === 'dark' ? '#ffffff' : '#000000',
                                                minWidth: '120px'
                                            }}
                                        >
                                            {financialYears.map((year, index) => (
                                                <option key={index} value={year.FINANCIAL_YEAR || year.financial_year}>
                                                    {year.FINANCIAL_YEAR || year.financial_year}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Action Buttons */}
                                    <button
                                        onClick={handleRefresh}
                                        disabled={loading}
                                        style={{
                                            padding: '0.375rem 0.75rem',
                                            fontSize: '0.875rem',
                                            borderRadius: '0.25rem',
                                            border: '1px solid #007bff',
                                            backgroundColor: 'transparent',
                                            color: '#007bff',
                                            cursor: 'pointer'
                                        }}
                                        title="Refresh data"
                                    >
                                        🔄 {!isMobile && 'Refresh'}
                                    </button>

                                    <button
                                        onClick={() => downloadExcel('files')}
                                        style={{
                                            padding: '0.375rem 0.75rem',
                                            fontSize: '0.875rem',
                                            borderRadius: '0.25rem',
                                            border: 'none',
                                            backgroundColor: '#28a745',
                                            color: 'white',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        📊 {!isMobile && 'Export CSV'}
                                    </button>

                                    <button
                                        onClick={() => autoSizeAll('files')}
                                        style={{
                                            padding: '0.375rem 0.75rem',
                                            fontSize: '0.875rem',
                                            borderRadius: '0.25rem',
                                            border: 'none',
                                            backgroundColor: '#17a2b8',
                                            color: 'white',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        ⇔ {!isMobile && 'Auto Size'}
                                    </button>

                                    <button
                                        onClick={toggleTheme}
                                        style={{
                                            padding: '0.375rem 0.75rem',
                                            fontSize: '0.875rem',
                                            borderRadius: '0.25rem',
                                            border: '1px solid #6c757d',
                                            backgroundColor: 'transparent',
                                            color: theme === 'dark' ? '#ffffff' : '#000000',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {theme === 'light' ? '🌙' : '☀️'} {!isMobile && (theme === 'light' ? 'Dark' : 'Light')}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* File List Grid Body */}
                        <div style={{
                            backgroundColor: themeStyles.cardBg,
                            padding: isFullScreen ? 0 : '15px'
                        }}>
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
                                    suppressMovableColumns={isMobile}
                                    enableRangeSelection={!isMobile}
                                    animateRows={!isMobile}
                                    enableCellTextSelection={true}
                                    suppressHorizontalScroll={false}
                                    headerHeight={isMobile ? 40 : 48}
                                    rowHeight={isMobile ? 35 : 42}
                                    onSelectionChanged={onSelectionChanged}
                                    onGridReady={(params) => {
                                        setTimeout(() => autoSizeAll('files'), 500);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Material Stock Grid */}
                {showMaterialGrid && (
                    <div style={{
                        backgroundColor: themeStyles.cardBg,
                        color: themeStyles.color,
                        border: theme === 'dark' ? '1px solid #495057' : '1px solid #dee2e6',
                        borderRadius: isFullScreen ? 0 : '8px',
                        overflow: 'hidden'
                    }}>
                        {/* Material Header */}
                        <div style={{
                            background: themeStyles.cardHeader,
                            color: theme === 'dark' ? '#ffffff' : '#000000',
                            fontFamily: "'Maven Pro', sans-serif",
                            padding: '1rem 2rem'
                        }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                                <div style={{ flex: isMobile ? '1 1 100%' : '1 1 auto' }}>
                                    <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span>📦</span>
                                        Material Stock - {selectedFileName}
                                    </h4>
                                    <small style={{ opacity: 0.8 }}>
                                        {`${materialData.length} records found`}
                                    </small>
                                </div>

                                <div style={{ 
                                    display: 'flex', 
                                    flexWrap: 'wrap',
                                    gap: '0.5rem',
                                    alignItems: 'center',
                                    flex: isMobile ? '1 1 100%' : '0 1 auto'
                                }}>
                                    <button
                                        onClick={handleBackToFileList}
                                        style={{
                                            padding: '0.375rem 0.75rem',
                                            fontSize: '0.875rem',
                                            borderRadius: '0.25rem',
                                            border: '1px solid #007bff',
                                            backgroundColor: 'transparent',
                                            color: '#007bff',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        ← {!isMobile && 'Back to Files'}
                                    </button>

                                    <button
                                        onClick={() => downloadExcel('material')}
                                        style={{
                                            padding: '0.375rem 0.75rem',
                                            fontSize: '0.875rem',
                                            borderRadius: '0.25rem',
                                            border: 'none',
                                            backgroundColor: '#28a745',
                                            color: 'white',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        📊 {!isMobile && 'Export CSV'}
                                    </button>

                                    <button
                                        onClick={() => autoSizeAll('material')}
                                        style={{
                                            padding: '0.375rem 0.75rem',
                                            fontSize: '0.875rem',
                                            borderRadius: '0.25rem',
                                            border: 'none',
                                            backgroundColor: '#17a2b8',
                                            color: 'white',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        ⇔ {!isMobile && 'Auto Size'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Material Grid Body */}
                        <div style={{
                            backgroundColor: themeStyles.cardBg,
                            padding: isFullScreen ? 0 : '15px'
                        }}>
                            {loadingMaterial ? (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '50px',
                                    color: themeStyles.color
                                }}>
                                    <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem', borderColor: '#007bff', borderRightColor: 'transparent' }}>
                                        <span style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden' }}>Loading...</span>
                                    </div>
                                    <p style={{ marginTop: '1rem' }}>Loading material stock data...</p>
                                </div>
                            ) : materialData.length === 0 ? (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '50px',
                                    color: themeStyles.color
                                }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📦</div>
                                    <h5>No Material Stock Data Available</h5>
                                    <p>No material records found for this file.</p>
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
                                        ref={materialGridRef}
                                        rowData={materialData}
                                        columnDefs={materialColumnDefs}
                                        defaultColDef={defaultColDef}
                                        pagination={true}
                                        paginationPageSize={isMobile ? 10 : 25}
                                        rowSelection="multiple"
                                        suppressMovableColumns={isMobile}
                                        enableRangeSelection={!isMobile}
                                        animateRows={!isMobile}
                                        enableCellTextSelection={true}
                                        suppressHorizontalScroll={false}
                                        headerHeight={isMobile ? 40 : 48}
                                        rowHeight={isMobile ? 35 : 42}
                                        onGridReady={(params) => {
                                            setTimeout(() => autoSizeAll('material'), 500);
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RFDMaterialStockGrid;