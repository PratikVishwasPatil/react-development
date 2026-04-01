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

const ReqOutwardRegisterGrid = () => {
    const [theme, setTheme] = useState('light');
    const [outwardData, setOutwardData] = useState([]);
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [loading, setLoading] = useState(false);
    const gridRef = useRef();

    // Handle window resize for mobile responsiveness
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Column definitions
    const columnDefs = useMemo(() => [
        {
            headerName: "Sr No",
            field: "count",
            valueGetter: (params) => params.data?.count || (params.node ? params.node.rowIndex + 1 : ''),
            width: isMobile ? 70 : 90,
            minWidth: 60,
            pinned: 'left',
            lockPosition: true,
            cellStyle: { fontWeight: 'bold', textAlign: 'center' },
            suppressSizeToFit: true
        },
        {
            field: "req_no",
            headerName: "Req No",
            width: isMobile ? 100 : 130,
            minWidth: 90,
            pinned: 'left',
            checkboxSelection: true,
            headerCheckboxSelection: true,
            cellStyle: { fontWeight: '600', color: '#007bff', textAlign: 'center' }
        },
        {
            field: "req_date",
            headerName: "Req Date",
            width: isMobile ? 120 : 140,
            minWidth: 100,
            cellStyle: { textAlign: 'center' },
            cellRenderer: (params) => {
                return params.value || '-';
            }
        },
        {
            field: "fileName",
            headerName: "File Name",
            width: isMobile ? 150 : 200,
            minWidth: 120,
            cellStyle: { fontWeight: '500', color: '#495057' }
        },
        {
            field: "name",
            headerName: "Name",
            width: isMobile ? 180 : 300,
            minWidth: 150,
            flex: 1,
            cellStyle: { fontWeight: '500' }
        },
        {
            field: "material_description",
            headerName: "Material Description",
            width: isMobile ? 200 : 350,
            minWidth: 180,
            flex: 1,
            cellStyle: { fontStyle: 'italic', color: '#28a745' }
        },
        {
            field: "main_material_name",
            headerName: "Main Material",
            width: isMobile ? 140 : 180,
            minWidth: 130,
            cellStyle: (params) => {
                const value = params.value ? params.value.trim() : '';
                let bgColor = '#6c757d';
                
                if (value === 'RAW') bgColor = '#007bff';
                else if (value === 'PACKING MATERIAL') bgColor = '#28a745';
                else if (value === 'CONSUMABLES') bgColor = '#ffc107';
                else if (value === 'HARDWARE') bgColor = '#17a2b8';
                else if (value === 'DRIVE ITEMS') bgColor = '#dc3545';
                else if (value === 'ELECTRICAL') bgColor = '#6c757d';
                else if (value === 'COLOUR/SPRAY/POWDER') bgColor = '#343a40';
                else if (value === 'SHEET METAL COMPONENT') bgColor = '#6f42c1';
                
                return {
                    backgroundColor: bgColor,
                    color: 'white',
                    fontWeight: '600',
                    textAlign: 'center',
                    padding: '4px 8px',
                    borderRadius: '4px'
                };
            },
            valueFormatter: (params) => params.value ? params.value.trim() : '-'
        },
        {
            field: "Unit",
            headerName: "Unit",
            width: isMobile ? 80 : 100,
            minWidth: 70,
            cellStyle: { textAlign: 'center', fontWeight: '600' },
            valueFormatter: (params) => params.value || '-'
        },
        {
            field: "quantityoutward",
            headerName: "Quantity",
            width: isMobile ? 100 : 120,
            minWidth: 90,
            cellStyle: { textAlign: 'right', fontWeight: 'bold', color: '#fd7e14' },
            valueFormatter: (params) => {
                if (!params.value) return '0';
                const numValue = typeof params.value === 'string' ? parseFloat(params.value) : params.value;
                return new Intl.NumberFormat('en-IN').format(numValue);
            }
        }
    ], [isMobile]);

    const defaultColDef = useMemo(() => ({
        resizable: true,
        sortable: true,
        filter: true,
        floatingFilter: !isMobile,
        flex: isMobile ? 0 : 0,
        cellStyle: { textAlign: 'left' }
    }), [isMobile]);

    // Fetch outward register data
    const fetchOutwardData = async () => {
        setLoading(true);
        try {
            const response = await fetch("https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/getReqOutwardRegisterApi.php", {
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
                setOutwardData(data.data || []);
                showToast(`Successfully loaded ${data.records || data.data?.length || 0} records`, 'success');
            } else {
                throw new Error(data.message || "Failed to fetch data");
            }
        } catch (error) {
            console.error("Error fetching outward data:", error);
            setOutwardData([]);
            showToast("Failed to fetch outward data: " + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOutwardData();
    }, []);

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
            const params = {
                fileName: `Request_Outward_Register_${new Date().toISOString().split('T')[0]}.csv`,
                allColumns: true,
                onlySelected: false,
                suppressQuotes: false,
                columnSeparator: ','
            };

            api.exportDataAsCsv(params);
            showToast("Data exported successfully", 'success');
        } catch (error) {
            console.error("Error exporting CSV:", error);
            showToast("Failed to export data", 'error');
        }
    };

    const showToast = (message, type = 'info') => {
        const toastEl = document.createElement('div');
        toastEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
            color: white;
            border-radius: 5px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 10000;
            font-size: 14px;
            max-width: 350px;
            animation: slideIn 0.3s ease-out;
        `;
        toastEl.textContent = message;
        
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
        
        document.body.appendChild(toastEl);
        setTimeout(() => {
            toastEl.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => toastEl.remove(), 300);
        }, 3000);
    };

    // Apply theme to document body
    useEffect(() => {
        if (theme === 'dark') {
            document.body.style.background = 'linear-gradient(135deg, #21262d 0%, #161b22 100%)';
            document.body.style.color = '#f8f9fa';
            document.body.style.minHeight = '100vh';
        } else {
            document.body.style.background = 'linear-gradient(135deg,rgba(109, 104, 204, 0.91) 0%,rgba(83, 92, 100, 0.32) 100%)';
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
                borderClass: 'border-secondary'
            };
        }
        return {
            backgroundColor: 'linear-gradient(135deg,rgba(109, 104, 204, 0.91) 0%,rgba(83, 92, 100, 0.32) 100%)',
            color: '#212529',
            cardBg: '#ffffff',
            cardHeader: 'linear-gradient(135deg,rgba(218, 208, 208, 0.67) 0%,rgba(97, 91, 91, 0.56) 100%)',
            borderClass: 'border-light'
        };
    };

    const themeStyles = getThemeStyles();

    const getGridHeight = () => {
        if (isFullScreen) {
            return isMobile ? 'calc(100vh - 220px)' : 'calc(100vh - 240px)';
        }
        return isMobile ? '400px' : '500px';
    };

    const containerStyles = isFullScreen ? {
        margin: 0,
        padding: 0,
        maxWidth: '100%',
        width: '100vw'
    } : {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: isMobile ? '10px' : '20px'
    };

    const cardStyles = isFullScreen ? {
        margin: 0,
        borderRadius: 0,
        height: '100vh',
        border: 'none'
    } : {
        margin: isMobile ? '10px' : '20px',
        borderRadius: '8px'
    };

    // Calculate summary statistics
    const summaryStats = useMemo(() => {
        if (!outwardData.length) return { 
            totalQty: 0, 
            uniqueNames: 0, 
            uniqueFiles: 0, 
            materialTypes: {},
            totalMaterialTypes: 0
        };
        
        const totalQty = outwardData.reduce((sum, row) => {
            const qty = typeof row.quantityoutward === 'string' ? parseFloat(row.quantityoutward) : row.quantityoutward;
            return sum + (qty || 0);
        }, 0);
        const uniqueNames = new Set(outwardData.map(row => row.name)).size;
        const uniqueFiles = new Set(outwardData.map(row => row.fileName)).size;
        
        // Count material types
        const materialTypes = {};
        outwardData.forEach(row => {
            const type = row.main_material_name ? row.main_material_name.trim() : 'Unknown';
            materialTypes[type] = (materialTypes[type] || 0) + 1;
        });
        
        const totalMaterialTypes = Object.keys(materialTypes).length;
        
        return { totalQty, uniqueNames, uniqueFiles, materialTypes, totalMaterialTypes };
    }, [outwardData]);

    if (loading && outwardData.length === 0) {
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
                    <div style={{
                        border: '4px solid #f3f3f3',
                        borderTop: '4px solid #007bff',
                        borderRadius: '50%',
                        width: '50px',
                        height: '50px',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 20px'
                    }}></div>
                    <style>{`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}</style>
                    <p style={{ fontSize: '18px' }}>Loading request outward register data...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: theme === 'dark'
                ? 'linear-gradient(135deg, #21262d 0%, #161b22 100%)'
                : 'linear-gradient(135deg,rgba(109, 104, 204, 0.91) 0%,rgba(83, 92, 100, 0.32) 100%)',
            color: themeStyles.color,
            padding: 0,
            margin: 0,
            overflow: isFullScreen ? 'hidden' : 'auto'
        }}>
            <div style={containerStyles}>
                <div style={{
                    backgroundColor: themeStyles.cardBg,
                    color: themeStyles.color,
                    border: theme === 'dark' ? '1px solid #495057' : '1px solid #dee2e6',
                    ...cardStyles
                }}>
                    {/* Header */}
                    <div style={{
                        background: themeStyles.cardHeader,
                        color: '#ffffff',
                        padding: isMobile ? '10px 15px' : '15px 25px',
                        flexShrink: 0
                    }}>
                        <div style={{
                            display: 'flex',
                            flexDirection: isMobile ? 'column' : 'row',
                            alignItems: isMobile ? 'flex-start' : 'center',
                            justifyContent: 'space-between',
                            gap: '15px'
                        }}>
                            <div>
                                <h4 style={{
                                    margin: '0 0 5px 0',
                                    fontSize: isMobile ? '18px' : '24px',
                                    fontWeight: '100',
                                    color: 'black'
                                }}>
                                    📋 Request Outward Register
                                </h4>
                                <small style={{ color: '#666', fontSize: '0.8rem' }}>
                                    Total Records: {outwardData.length} | Total Quantity: {summaryStats.totalQty.toLocaleString('en-IN')}
                                </small>
                            </div>

                            <div style={{
                                display: 'flex',
                                gap: '10px',
                                flexWrap: 'wrap'
                            }}>
                                {/* Refresh Button */}
                                <button
                                    onClick={fetchOutwardData}
                                    disabled={loading}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: '#17a2b8',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        opacity: loading ? 0.6 : 1
                                    }}
                                >
                                    🔄 {isMobile ? '' : 'Refresh'}
                                </button>

                                {/* Export Button */}
                                <button
                                    onClick={downloadExcel}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: '#28a745',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '600'
                                    }}
                                >
                                    📥 {isMobile ? '' : 'Export'}
                                </button>

                                {/* Full Screen Toggle */}
                                <button
                                    onClick={toggleFullScreen}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                        color: 'white',
                                        border: '1px solid rgba(255,255,255,0.3)',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '600'
                                    }}
                                >
                                    {isFullScreen ? '⛶' : '⛶'}
                                </button>

                                {/* Theme Toggle */}
                                <button
                                    onClick={toggleTheme}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                        color: 'white',
                                        border: '1px solid rgba(255,255,255,0.3)',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '600'
                                    }}
                                >
                                    {theme === 'light' ? '🌙' : '☀️'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    {outwardData.length > 0 && (
                        <div style={{
                            padding: isMobile ? '10px' : '15px',
                            backgroundColor: theme === 'dark' ? '#343a40' : '#f8f9fa',
                            display: 'grid',
                            gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: isMobile ? '10px' : '15px'
                        }}>
                            <div style={{
                                backgroundColor: theme === 'dark' ? '#495057' : '#ffffff',
                                color: theme === 'dark' ? '#f8f9fa' : '#212529',
                                border: theme === 'dark' ? '1px solid #6c757d' : '1px solid #dee2e6',
                                padding: isMobile ? '10px' : '15px',
                                borderRadius: '5px',
                                textAlign: 'center'
                            }}>
                                <h6 style={{ margin: '0 0 5px 0', fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
                                    Total Records
                                </h6>
                                <h5 style={{
                                    margin: 0,
                                    color: '#007bff',
                                    fontSize: isMobile ? '1.1rem' : '1.3rem',
                                    fontWeight: 'bold'
                                }}>
                                    {outwardData.length}
                                </h5>
                            </div>

                            <div style={{
                                backgroundColor: theme === 'dark' ? '#495057' : '#ffffff',
                                color: theme === 'dark' ? '#f8f9fa' : '#212529',
                                border: theme === 'dark' ? '1px solid #6c757d' : '1px solid #dee2e6',
                                padding: isMobile ? '10px' : '15px',
                                borderRadius: '5px',
                                textAlign: 'center'
                            }}>
                                <h6 style={{ margin: '0 0 5px 0', fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
                                    Total Quantity
                                </h6>
                                <h5 style={{
                                    margin: 0,
                                    color: '#fd7e14',
                                    fontSize: isMobile ? '1.1rem' : '1.3rem',
                                    fontWeight: 'bold'
                                }}>
                                    {summaryStats.totalQty.toLocaleString('en-IN')}
                                </h5>
                            </div>

                            <div style={{
                                backgroundColor: theme === 'dark' ? '#495057' : '#ffffff',
                                color: theme === 'dark' ? '#f8f9fa' : '#212529',
                                border: theme === 'dark' ? '1px solid #6c757d' : '1px solid #dee2e6',
                                padding: isMobile ? '10px' : '15px',
                                borderRadius: '5px',
                                textAlign: 'center'
                            }}>
                                <h6 style={{ margin: '0 0 5px 0', fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
                                    Unique Names
                                </h6>
                                <h5 style={{
                                    margin: 0,
                                    color: '#28a745',
                                    fontSize: isMobile ? '1.1rem' : '1.3rem',
                                    fontWeight: 'bold'
                                }}>
                                    {summaryStats.uniqueNames}
                                </h5>
                            </div>

                            <div style={{
                                backgroundColor: theme === 'dark' ? '#495057' : '#ffffff',
                                color: theme === 'dark' ? '#f8f9fa' : '#212529',
                                border: theme === 'dark' ? '1px solid #6c757d' : '1px solid #dee2e6',
                                padding: isMobile ? '10px' : '15px',
                                borderRadius: '5px',
                                textAlign: 'center'
                            }}>
                                <h6 style={{ margin: '0 0 5px 0', fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
                                    Unique Files
                                </h6>
                                <h5 style={{
                                    margin: 0,
                                    color: '#6f42c1',
                                    fontSize: isMobile ? '1.1rem' : '1.3rem',
                                    fontWeight: 'bold'
                                }}>
                                    {summaryStats.uniqueFiles}
                                </h5>
                            </div>

                            <div style={{
                                backgroundColor: theme === 'dark' ? '#495057' : '#ffffff',
                                color: theme === 'dark' ? '#f8f9fa' : '#212529',
                                border: theme === 'dark' ? '1px solid #6c757d' : '1px solid #dee2e6',
                                padding: isMobile ? '10px' : '15px',
                                borderRadius: '5px',
                                textAlign: 'center'
                            }}>
                                <h6 style={{ margin: '0 0 5px 0', fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
                                    Material Types
                                </h6>
                                <h5 style={{
                                    margin: 0,
                                    color: '#dc3545',
                                    fontSize: isMobile ? '1.1rem' : '1.3rem',
                                    fontWeight: 'bold'
                                }}>
                                    {summaryStats.totalMaterialTypes}
                                </h5>
                            </div>
                        </div>
                    )}

                    {/* Grid Body */}
                    <div style={{
                        backgroundColor: themeStyles.cardBg,
                        color: themeStyles.color,
                        padding: isFullScreen ? '0' : (isMobile ? '10px' : '15px'),
                        flex: 1,
                        overflow: 'hidden'
                    }}>
                        {outwardData.length === 0 && !loading ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '50px',
                                color: theme === 'dark' ? '#f8f9fa' : '#212529'
                            }}>
                                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📋</div>
                                <h5>No request outward data found</h5>
                                <p>No records available. Please try refreshing the data.</p>
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
                                        '--ag-pinned-left-border': '2px solid #495057',
                                        '--ag-pinned-right-border': '2px solid #495057'
                                    }),
                                    ...(theme === 'light' && {
                                        '--ag-selected-row-background-color': '#28a745',
                                        '--ag-range-selection-background-color': '#28a74533',
                                        '--ag-input-focus-border-color': '#28a745',
                                        '--ag-checkbox-checked-color': '#28a745',
                                        '--ag-accent-color': '#28a745'
                                    })
                                }}
                            >
                                <AgGridReact
                                    ref={gridRef}
                                    rowData={outwardData}
                                    columnDefs={columnDefs}
                                    defaultColDef={defaultColDef}
                                    pagination={true}
                                    paginationPageSize={isMobile ? 10 : (isFullScreen ? 20 : 10)}
                                    rowSelection="multiple"
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
                                    suppressRowClickSelection={true}
                                    onGridReady={(params) => {
                                        console.log('Outward register grid is ready');
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ReqOutwardRegisterGrid;
