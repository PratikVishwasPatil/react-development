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

const RFDMaterialStockManager = () => {
    const getFileIdFromUrl = () => {
        const path = window.location.pathname;
        const match = path.match(/\/excel-list\/details\/(\d+)/);
        return match ? match[1] : '5523';
    };

    const [fileId] = useState(getFileIdFromUrl());
    const [activeTab, setActiveTab] = useState('Sheet Metal');
    const [theme, setTheme] = useState('light');
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [loading, setLoading] = useState(false);
    const [fileName, setFileName] = useState('');

    // Grid data for each tab
    const [sheetMetalData, setSheetMetalData] = useState([]);
    const [fabricationData, setFabricationData] = useState([]);
    const [foundationData, setFoundationData] = useState([]);
    const [assemblyData, setAssemblyData] = useState([]);

    const gridRef = useRef();
    const API_BASE_URL = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api";

    const tabs = ['Sheet Metal', 'Fabrication', 'Foundation', 'Assembly'];

    // Fetch Sheet Metal data
    const fetchSheetMetalData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/getRfdMaterialStockSmetalApi.php?fileId=${fileId}`);
            const result = await response.json();

            if (result.status === "success" && Array.isArray(result.data)) {
                setSheetMetalData(result.data);
                if (result.data.length > 0) {
                    setFileName(result.data[0].FILE_NAME || `File-${fileId}`);
                }
            }
        } catch (error) {
            console.error("Error fetching sheet metal data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Fabrication data
    const fetchFabricationData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/getRfdMaterialStockFabApi.php?fileId=${fileId}`);
            const result = await response.json();

            if (result.status === "success" && Array.isArray(result.data)) {
                setFabricationData(result.data);
                if (result.data.length > 0) {
                    setFileName(result.data[0].FILE_NAME || `File-${fileId}`);
                }
            }
        } catch (error) {
            console.error("Error fetching fabrication data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Foundation data
    const fetchFoundationData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/getRfdMaterialStockFoundApi.php?fileId=${fileId}`);
            const result = await response.json();

            if (result.status === "success" && Array.isArray(result.data)) {
                setFoundationData(result.data);
                if (result.data.length > 0) {
                    setFileName(result.data[0].FILE_NAME || `File-${fileId}`);
                }
            }
        } catch (error) {
            console.error("Error fetching foundation data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Assembly data
    const fetchAssemblyData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/getRfdMaterialStockAsslyApi.php?fileId=${fileId}`);
            const result = await response.json();

            if (result.status === "success" && Array.isArray(result.data)) {
                setAssemblyData(result.data);
                if (result.data.length > 0) {
                    setFileName(result.data[0].FILE_NAME || `File-${fileId}`);
                }
            }
        } catch (error) {
            console.error("Error fetching assembly data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'Sheet Metal') {
            fetchSheetMetalData();
        } else if (activeTab === 'Fabrication') {
            fetchFabricationData();
        } else if (activeTab === 'Foundation') {
            fetchFoundationData();
        } else if (activeTab === 'Assembly') {
            fetchAssemblyData();
        }
    }, [fileId, activeTab]);

    // Column definitions for Sheet Metal
    const sheetMetalColumnDefs = useMemo(() => [
        { headerName: "File Name", field: "FILE_NAME", width: 150, pinned: 'left' },
        { headerName: "Material Name", field: "rfd_name", width: 200 },
        { headerName: "Width", field: "weight", width: 120 },
        { headerName: "Height", field: "height", width: 120 },
        { headerName: "File Qty", field: "rfdqty", width: 100 },
        { headerName: "RFD Total Qty Regular", field: "totalQty", width: 160 },
        { headerName: "RFD Total Qty Semi", field: "totalQty_", width: 160 },
        { headerName: "RFD Remaining Qty", field: "remainingQty", width: 160 },
        { headerName: "Color", field: "colour", width: 120 },
        { headerName: "Chalan Type", field: "Type", width: 120 },
        { headerName: "Vendor", field: "CUSTOMER_NAME", width: 200 },
        { headerName: "Location", field: "storelocation", width: 150 }
    ], []);

    // Column definitions for Fabrication
    const fabricationColumnDefs = useMemo(() => [
        { headerName: "File Name", field: "FILE_NAME", width: 150, pinned: 'left' },
        { headerName: "Material Name", field: "rfd_name", width: 200 },
        { headerName: "In MM", field: "inmm", width: 120 },
        { headerName: "File Qty", field: "rfdqty", width: 100 },
        { headerName: "RFD Total Qty Regular", field: "totalQty", width: 160 },
        { headerName: "RFD Total Qty Semi", field: "totalQty_", width: 160 },
        { headerName: "RFD Remaining Qty", field: "remainingQty", width: 160 },
        { headerName: "Color", field: "colour", width: 120 },
        { headerName: "Chalan Type", field: "Type", width: 120 },
        { headerName: "Vendor", field: "CUSTOMER_NAME", width: 200 },
        { headerName: "Location", field: "storelocation", width: 150 }
    ], []);

    // Column definitions for Foundation
    const foundationColumnDefs = useMemo(() => [
        { headerName: "File Name", field: "FILE_NAME", width: 150, pinned: 'left', 
          cellStyle: { textAlign: 'center' } },
        { headerName: "Material Name", field: "rfd_name", width: 200 },
        { headerName: "MOC", field: "moc", width: 100 },
        { headerName: "Size", field: "size", width: 150 },
        { headerName: "Length", field: "length", width: 120 },
        { headerName: "File Qty", field: "rfdqty", width: 100 },
        { headerName: "RFD Total Qty Regular", field: "totalQty", width: 160 },
        { headerName: "RFD Total Qty Semi", field: "totalQty_", width: 160 },
        { headerName: "RFD Remaining Qty", field: "remainingQty", width: 160 },
        { headerName: "Color", field: "colour", width: 120 },
        { headerName: "Chalan Type", field: "Type", width: 120 },
        { headerName: "Vendor", field: "CUSTOMER_NAME", width: 200 },
        { headerName: "Location", field: "storelocation", width: 150 }
    ], []);

    // Column definitions for Assembly
    const assemblyColumnDefs = useMemo(() => [
        { headerName: "File Name", field: "FILE_NAME", width: 150, pinned: 'left' },
        { headerName: "Material Name", field: "rfd_name", width: 200 },
        { headerName: "File Qty", field: "rfdqty", width: 100 },
        { headerName: "Total Qty", field: "totalQty", width: 120 },
        { headerName: "Chalan No", field: "dc_id", width: 150 },
        { headerName: "Vendor", field: "CUSTOMER_NAME", width: 200 },
        { headerName: "Location", field: "storelocation", width: 150 }
    ], []);

    const defaultColDef = useMemo(() => ({
        sortable: true,
        resizable: true,
        filter: true,
        floatingFilter: true
    }), []);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    const exportToCSV = () => {
        if (gridRef.current && gridRef.current.api) {
            gridRef.current.api.exportDataAsCsv({
                fileName: `${activeTab}_${fileName}_Export.csv`
            });
        }
    };

    const autoSizeAll = (skipHeader = false) => {
        if (gridRef.current && gridRef.current.api) {
            const allColumnIds = gridRef.current.api.getColumns().map(column => column.getId());
            gridRef.current.api.autoSizeColumns(allColumnIds, skipHeader);
        }
    };

    const sizeToFit = () => {
        if (gridRef.current && gridRef.current.api) {
            gridRef.current.api.sizeColumnsToFit();
        }
    };

    const getThemeStyles = () => {
        if (theme === 'dark') {
            return {
                backgroundColor: '#1a1d23',
                color: '#f8f9fa',
                cardBg: '#252b36',
                cardHeader: '#2d3748',
                inputBg: '#1a202c',
                inputBorder: '#4a5568',
                inputColor: '#f7fafc',
                tabBg: '#1a202c',
                tabActiveBg: '#2d3748',
                tabBorder: '#4a5568'
            };
        }
        return {
            backgroundColor: '#f0f4f8',
            color: '#1a202c',
            cardBg: '#ffffff',
            cardHeader: '#f7fafc',
            inputBg: '#ffffff',
            inputBorder: '#cbd5e0',
            inputColor: '#2d3748',
            tabBg: '#e2e8f0',
            tabActiveBg: '#ffffff',
            tabBorder: '#cbd5e0'
        };
    };

    const themeStyles = getThemeStyles();
    const gridHeight = isFullScreen ? 'calc(100vh - 250px)' : '600px';

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

    const getCurrentRowData = () => {
        switch (activeTab) {
            case 'Sheet Metal': return sheetMetalData;
            case 'Fabrication': return fabricationData;
            case 'Foundation': return foundationData;
            case 'Assembly': return assemblyData;
            default: return [];
        }
    };

    const getCurrentColumnDefs = () => {
        switch (activeTab) {
            case 'Sheet Metal': return sheetMetalColumnDefs;
            case 'Fabrication': return fabricationColumnDefs;
            case 'Foundation': return foundationColumnDefs;
            case 'Assembly': return assemblyColumnDefs;
            default: return [];
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: themeStyles.backgroundColor,
            color: themeStyles.color,
            padding: 0,
            margin: 0
        }}>
            <div className={`container-fluid ${isFullScreen ? 'p-0' : ''}`}>
                <div style={{
                    backgroundColor: themeStyles.cardBg,
                    color: themeStyles.color,
                    border: `1px solid ${themeStyles.tabBorder}`,
                    margin: isFullScreen ? 0 : 20,
                    borderRadius: isFullScreen ? 0 : 8,
                    boxShadow: theme === 'dark' ? '0 20px 40px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.08)'
                }}>
                    {/* Tabs Section */}
                    <div style={{
                        display: 'flex',
                        borderBottom: `2px solid ${themeStyles.tabBorder}`,
                        backgroundColor: themeStyles.cardBg
                    }}>
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: '14px 28px',
                                    border: 'none',
                                    backgroundColor: activeTab === tab ? themeStyles.tabActiveBg : themeStyles.tabBg,
                                    color: themeStyles.color,
                                    fontSize: '14px',
                                    fontWeight: activeTab === tab ? '600' : '500',
                                    cursor: 'pointer',
                                    borderBottom: activeTab === tab ? '3px solid #007bff' : 'none',
                                    transition: 'all 0.2s ease',
                                    outline: 'none'
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Action Buttons Section */}
                    <div style={{
                        padding: '16px 20px',
                        backgroundColor: themeStyles.cardHeader,
                        borderBottom: `1px solid ${themeStyles.tabBorder}`,
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '12px',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button
                                onClick={exportToCSV}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#ff6b35',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                Download CSV Export File
                            </button>
                            <button
                                onClick={sizeToFit}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#ff6b35',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Size To Fit
                            </button>
                            <button
                                onClick={() => autoSizeAll(false)}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#ff6b35',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Auto-Size All
                            </button>
                            <button
                                onClick={() => autoSizeAll(true)}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#ff6b35',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Auto-Size All (Skip Header)
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <button
                                onClick={toggleFullScreen}
                                style={{
                                    padding: '8px 12px',
                                    backgroundColor: themeStyles.inputBg,
                                    color: themeStyles.color,
                                    border: `1px solid ${themeStyles.inputBorder}`,
                                    borderRadius: '4px',
                                    fontSize: '18px',
                                    cursor: 'pointer'
                                }}
                            >
                                {isFullScreen ? '📉' : '📈'}
                            </button>
                            <button
                                onClick={toggleTheme}
                                style={{
                                    padding: '8px 12px',
                                    backgroundColor: themeStyles.inputBg,
                                    color: themeStyles.color,
                                    border: `1px solid ${themeStyles.inputBorder}`,
                                    borderRadius: '4px',
                                    fontSize: '18px',
                                    cursor: 'pointer'
                                }}
                            >
                                {theme === 'light' ? '🌙' : '☀️'}
                            </button>
                            <div style={{
                                padding: '8px 16px',
                                fontSize: '13px',
                                fontWeight: '600',
                                backgroundColor: themeStyles.inputBg,
                                border: `1px solid ${themeStyles.inputBorder}`,
                                borderRadius: '4px'
                            }}>
                                File Name: <span style={{ color: '#007bff' }}>{fileName}</span>
                            </div>
                        </div>
                    </div>

                    {/* Grid Section */}
                    <div style={{ padding: 0 }}>
                        {loading ? (
                            <div style={{
                                padding: '60px',
                                textAlign: 'center',
                                fontSize: '16px',
                                color: theme === 'dark' ? '#a0aec0' : '#718096'
                            }}>
                                <div style={{
                                    display: 'inline-block',
                                    width: '40px',
                                    height: '40px',
                                    border: '4px solid rgba(0, 123, 255, 0.2)',
                                    borderTopColor: '#007bff',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }}></div>
                                <div style={{ marginTop: '16px' }}>Loading data...</div>
                            </div>
                        ) : (
                            <div
                                className={theme === 'dark' ? 'ag-theme-alpine-dark' : 'ag-theme-alpine'}
                                style={{
                                    height: gridHeight,
                                    width: '100%',
                                    '--ag-header-background-color': theme === 'dark' ? '#2d3748' : '#f7fafc',
                                    '--ag-header-foreground-color': theme === 'dark' ? '#f7fafc' : '#2d3748',
                                    '--ag-odd-row-background-color': theme === 'dark' ? '#1a202c' : '#ffffff',
                                    '--ag-background-color': theme === 'dark' ? '#252b36' : '#ffffff',
                                    '--ag-foreground-color': theme === 'dark' ? '#f7fafc' : '#2d3748',
                                    '--ag-border-color': theme === 'dark' ? '#2d3748' : '#e2e8f0',
                                    '--ag-row-hover-color': theme === 'dark' ? '#2d3748' : '#f7fafc'
                                }}
                            >
                                <AgGridReact
                                    ref={gridRef}
                                    rowData={getCurrentRowData()}
                                    columnDefs={getCurrentColumnDefs()}
                                    defaultColDef={defaultColDef}
                                    pagination={true}
                                    paginationPageSize={10}
                                    paginationPageSizeSelector={[10, 20, 50, 100]}
                                    suppressMovableColumns={false}
                                    animateRows={true}
                                    domLayout='normal'
                                    headerHeight={40}
                                    rowHeight={38}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .ag-theme-alpine .ag-header-cell,
                .ag-theme-alpine-dark .ag-header-cell {
                    font-weight: 600;
                    font-size: 13px;
                }

                .ag-theme-alpine .ag-cell,
                .ag-theme-alpine-dark .ag-cell {
                    font-size: 13px;
                    line-height: 1.5;
                }

                .ag-theme-alpine .ag-row,
                .ag-theme-alpine-dark .ag-row {
                    border-bottom: 1px solid ${theme === 'dark' ? '#2d3748' : '#e2e8f0'};
                }

                .ag-theme-alpine ::-webkit-scrollbar,
                .ag-theme-alpine-dark ::-webkit-scrollbar {
                    width: 10px;
                    height: 10px;
                }

                .ag-theme-alpine ::-webkit-scrollbar-track,
                .ag-theme-alpine-dark ::-webkit-scrollbar-track {
                    background: ${theme === 'dark' ? '#1a202c' : '#f7fafc'};
                }

                .ag-theme-alpine ::-webkit-scrollbar-thumb,
                .ag-theme-alpine-dark ::-webkit-scrollbar-thumb {
                    background: ${theme === 'dark' ? '#4a5568' : '#cbd5e0'};
                    border-radius: 5px;
                }

                .ag-theme-alpine ::-webkit-scrollbar-thumb:hover,
                .ag-theme-alpine-dark ::-webkit-scrollbar-thumb:hover {
                    background: #007bff;
                }
            `}</style>
        </div>
    );
};

export default RFDMaterialStockManager;