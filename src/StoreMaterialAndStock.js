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

const MaterialsAndStockReport = () => {
    const [theme, setTheme] = useState('light');
    const [reportData, setReportData] = useState([]);
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [filterCategory, setFilterCategory] = useState('ALL');
    const [filterStock, setFilterStock] = useState('ALL');
    const gridRef = useRef();

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // API URL
    const MATERIALS_API_URL = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/getMaterialsAndStockApi.php";

    // Fetch materials data
    const fetchMaterialsData = async () => {
        setLoading(true);
        try {
            const response = await fetch(MATERIALS_API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.status && data.data) {
                setReportData(data.data);
                showToast(`Loaded ${data.total || data.data.length} material records`, 'success');
            } else {
                throw new Error("No data received");
            }
        } catch (error) {
            console.error("Error fetching materials data:", error);
            showToast(`Error fetching materials data: ${error.message}`, 'error');
            setReportData([]);
        } finally {
            setLoading(false);
        }
    };

    // Simple toast notification
    const showToast = (message, type = 'info') => {
        const toastEl = document.createElement('div');
        toastEl.className = `toast-notification toast-${type}`;
        toastEl.textContent = message;
        toastEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            background: ${type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#17a2b8'};
            color: white;
            border-radius: 4px;
            z-index: 9999;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            animation: slideIn 0.3s ease-out;
            max-width: 400px;
        `;
        document.body.appendChild(toastEl);
        setTimeout(() => {
            toastEl.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => document.body.removeChild(toastEl), 300);
        }, 3000);
    };

    // Load data on mount
    useEffect(() => {
        fetchMaterialsData();
    }, []);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    // Handle selection changed
    const onSelectionChanged = (event) => {
        const selectedNodes = event.api.getSelectedNodes();
        const selectedData = selectedNodes.map(node => node.data);
        setSelectedRows(selectedData);
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

        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);

        return () => {
            document.body.style.background = '';
            document.body.style.color = '';
            document.body.style.minHeight = '';
            document.head.removeChild(style);
        };
    }, [theme]);

    // Get unique categories
    const categories = useMemo(() => {
        const cats = [...new Set(reportData.map(item => item.materialCategory))].filter(Boolean);
        return ['ALL', ...cats.sort()];
    }, [reportData]);

    // Filter data based on selections
    const filteredData = useMemo(() => {
        let filtered = [...reportData];
        
        if (filterCategory !== 'ALL') {
            filtered = filtered.filter(item => item.materialCategory === filterCategory);
        }
        
        if (filterStock === 'IN_STOCK') {
            filtered = filtered.filter(item => parseFloat(item.stock) > 0);
        } else if (filterStock === 'OUT_OF_STOCK') {
            filtered = filtered.filter(item => parseFloat(item.stock) === 0);
        }
        
        return filtered;
    }, [reportData, filterCategory, filterStock]);

    // AG Grid column definitions
    const columnDefs = useMemo(() => [
        {
            headerName: "Sr No",
            field: "id",
            width: isMobile ? 60 : 80,
            minWidth: 50,
            pinned: 'left',
            lockPosition: true,
            cellStyle: { fontWeight: 'bold', textAlign: 'right' }
        },
        {
            headerName: "Material ID",
            field: "materialId",
            filter: "agTextColumnFilter",
            sortable: true,
            width: isMobile ? 100 : 120,
            pinned: 'left',
            checkboxSelection: false,
            headerCheckboxSelection: false,
            cellStyle: { fontWeight: 'bold', textAlign: 'right', color: '#0066cc' }
        },
        {
            headerName: "Material Name",
            field: "materialName",
            filter: "agTextColumnFilter",
            sortable: true,
            width: 400,
            cellStyle: { fontWeight: '500' }
        },
        {
            headerName: "Initial",
            field: "materialInitial",
            filter: "agTextColumnFilter",
            sortable: true,
            width: 150,
            hide: isMobile
        },
        {
            headerName: "Category",
            field: "materialCategory",
            filter: "agTextColumnFilter",
            sortable: true,
            width: 150,
            cellStyle: params => {
                if (params.value === 'BOUGHT OUT') {
                    return { backgroundColor: theme === 'dark' ? '#1e3a5f' : '#e3f2fd', color: theme === 'dark' ? '#90caf9' : '#1565c0', fontWeight: '500' };
                } else if (params.value === 'PRODUCTION') {
                    return { backgroundColor: theme === 'dark' ? '#2e5f1e' : '#e8f5e9', color: theme === 'dark' ? '#81c784' : '#2e7d32', fontWeight: '500' };
                } else if (params.value === 'RAW') {
                    return { backgroundColor: theme === 'dark' ? '#5f2e1e' : '#fff3e0', color: theme === 'dark' ? '#ffb74d' : '#e65100', fontWeight: '500' };
                }
                return { fontWeight: '500' };
            }
        },
        {
            headerName: "Make",
            field: "makeName",
            filter: "agTextColumnFilter",
            sortable: true,
            width: 120,
            hide: isMobile
        },
        {
            headerName: "Main Material",
            field: "mainMaterialName",
            filter: "agTextColumnFilter",
            sortable: true,
            width: 150,
            hide: isMobile
        },
        {
            headerName: "Rate (₹)",
            field: "rate",
            filter: "agNumberColumnFilter",
            sortable: true,
            width: 120,
            cellStyle: { textAlign: 'right', fontWeight: 'bold', color: '#6c757d' },
            valueFormatter: params => params.value ? `₹${parseFloat(params.value).toFixed(2)}` : '-'
        },
        {
            headerName: "Stock",
            field: "stock",
            filter: "agNumberColumnFilter",
            sortable: true,
            width: 120,
            cellStyle: params => {
                const stock = parseFloat(params.value) || 0;
                if (stock === 0) {
                    return { textAlign: 'right', fontWeight: 'bold', color: '#dc3545', backgroundColor: theme === 'dark' ? '#5f1e1e' : '#ffe6e6' };
                } else if (stock > 0 && stock <= 10) {
                    return { textAlign: 'right', fontWeight: 'bold', color: '#ffc107', backgroundColor: theme === 'dark' ? '#5f4e1e' : '#fff8e1' };
                } else {
                    return { textAlign: 'right', fontWeight: 'bold', color: '#28a745', backgroundColor: theme === 'dark' ? '#1e5f2e' : '#e6ffe6' };
                }
            },
            valueFormatter: params => {
                const stock = parseFloat(params.value) || 0;
                return stock.toFixed(2);
            }
        },
        {
            headerName: "Stock Value (₹)",
            field: "stockValue",
            sortable: true,
            width: 150,
            cellStyle: { textAlign: 'right', fontWeight: 'bold', color: '#007bff' },
            valueGetter: params => {
                const stock = parseFloat(params.data.stock) || 0;
                const rate = parseFloat(params.data.rate) || 0;
                return stock * rate;
            },
            valueFormatter: params => params.value ? `₹${params.value.toFixed(2)}` : '₹0.00'
        }
    ], [isMobile, theme]);

    const defaultColDef = useMemo(() => ({
        resizable: true,
        sortable: true,
        filter: true,
        floatingFilter: !isMobile,
        suppressMenu: isMobile,
    }), [isMobile]);

    // Grid options with row styling
    const getRowStyle = params => {
        if (params.node.rowIndex % 2 === 0) {
            return { 
                backgroundColor: theme === 'dark' ? '#2c3034' : '#f8f9fa'
            };
        }
        return null;
    };

    const onGridReady = (params) => {
        console.log('Materials and Stock Report Grid is ready');
        setTimeout(() => autoSizeAll(), 500);
    };

    const handleExportCSV = () => {
        if (gridRef.current && gridRef.current.api) {
            gridRef.current.api.exportDataAsCsv({
                fileName: `Materials_Stock_Report_${new Date().toISOString().split('T')[0]}.csv`
            });
            showToast('Data exported to CSV', 'success');
        }
    };

    const handleRefresh = () => {
        fetchMaterialsData();
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

    // Calculate statistics
    const statistics = useMemo(() => {
        const totalValue = filteredData.reduce((sum, row) => {
            const stock = parseFloat(row.stock) || 0;
            const rate = parseFloat(row.rate) || 0;
            return sum + (stock * rate);
        }, 0);

        const inStock = filteredData.filter(row => parseFloat(row.stock) > 0).length;
        const outOfStock = filteredData.filter(row => parseFloat(row.stock) === 0).length;
        const lowStock = filteredData.filter(row => {
            const stock = parseFloat(row.stock) || 0;
            return stock > 0 && stock <= 10;
        }).length;

        return {
            totalValue,
            inStock,
            outOfStock,
            lowStock,
            totalItems: filteredData.length
        };
    }, [filteredData]);

    const gridHeight = isFullScreen ? 'calc(100vh - 220px)' : (isMobile ? '400px' : '600px');

    if (loading && reportData.length === 0) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: themeStyles.backgroundColor
            }}>
                <div style={{ textAlign: 'right', color: themeStyles.color }}>
                    <div style={{ 
                        border: '4px solid rgba(0,0,0,0.1)',
                        borderTop: '4px solid #007bff',
                        borderRadius: '50%',
                        width: '3rem',
                        height: '3rem',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto'
                    }}></div>
                    <p style={{ marginTop: '1rem' }}>Loading materials and stock data...</p>
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
                maxWidth: isFullScreen ? '100%' : '1400px',
                margin: '0 auto',
                padding: isFullScreen ? 0 : '20px'
            }}>
                <div style={{
                    backgroundColor: themeStyles.cardBg,
                    color: themeStyles.color,
                    border: theme === 'dark' ? '1px solid #495057' : '1px solid #dee2e6',
                    borderRadius: isFullScreen ? 0 : 8,
                    overflow: 'hidden'
                }}>
                    {/* Header */}
                    <div style={{
                        background: themeStyles.cardHeader,
                        color: theme === 'dark' ? '#ffffff' : '#000000',
                        fontFamily: "'Maven Pro', sans-serif",
                        padding: '1rem 2rem'
                    }}>
                        <div style={{ 
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            gap: '1rem'
                        }}>
                            <div style={{ flex: '1 1 300px' }}>
                                <h4 style={{ margin: 0, marginBottom: '0.25rem' }}>
                                    📦 Materials and Stock Report
                                </h4>
                                <small style={{ opacity: 0.8 }}>
                                    {`${statistics.totalItems} items | In Stock: ${statistics.inStock} | Out: ${statistics.outOfStock} | Low: ${statistics.lowStock}`}
                                    {selectedRows.length > 0 && ` | ${selectedRows.length} selected`}
                                </small>
                            </div>

                            <div style={{ 
                                display: 'flex',
                                gap: '0.5rem',
                                flexWrap: 'wrap',
                                alignItems: 'center'
                            }}>
                                {/* Category Filter */}
                                <select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    style={{
                                        padding: '0.375rem 0.75rem',
                                        fontSize: '0.875rem',
                                        borderRadius: '0.25rem',
                                        border: '1px solid',
                                        minWidth: '140px',
                                        backgroundColor: themeStyles.inputBg,
                                        borderColor: themeStyles.inputBorder,
                                        color: themeStyles.inputColor
                                    }}
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>
                                            {cat === 'ALL' ? 'All Categories' : cat}
                                        </option>
                                    ))}
                                </select>

                                {/* Stock Filter */}
                                <select
                                    value={filterStock}
                                    onChange={(e) => setFilterStock(e.target.value)}
                                    style={{
                                        padding: '0.375rem 0.75rem',
                                        fontSize: '0.875rem',
                                        borderRadius: '0.25rem',
                                        border: '1px solid',
                                        minWidth: '130px',
                                        backgroundColor: themeStyles.inputBg,
                                        borderColor: themeStyles.inputBorder,
                                        color: themeStyles.inputColor
                                    }}
                                >
                                    <option value="ALL">All Stock</option>
                                    <option value="IN_STOCK">In Stock</option>
                                    <option value="OUT_OF_STOCK">Out of Stock</option>
                                </select>

                                <button
                                    onClick={handleRefresh}
                                    disabled={loading}
                                    style={{
                                        padding: '0.375rem 0.75rem',
                                        fontSize: '0.875rem',
                                        borderRadius: '0.25rem',
                                        border: '1px solid rgba(255,255,255,0.3)',
                                        backgroundColor: 'transparent',
                                        color: theme === 'dark' ? '#fff' : '#000',
                                        cursor: loading ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    🔄 {!isMobile && 'Refresh'}
                                </button>
                                
                                <button
                                    onClick={handleExportCSV}
                                    style={{
                                        padding: '0.375rem 0.75rem',
                                        fontSize: '0.875rem',
                                        borderRadius: '0.25rem',
                                        border: '1px solid rgba(255,255,255,0.3)',
                                        backgroundColor: 'transparent',
                                        color: theme === 'dark' ? '#fff' : '#000',
                                        cursor: 'pointer'
                                    }}
                                >
                                    📥 {!isMobile && 'Export'}
                                </button>
                                
                                <button
                                    onClick={autoSizeAll}
                                    style={{
                                        padding: '0.375rem 0.75rem',
                                        fontSize: '0.875rem',
                                        borderRadius: '0.25rem',
                                        border: '1px solid rgba(23,162,184,0.5)',
                                        backgroundColor: '#17a2b8',
                                        color: '#fff',
                                        cursor: 'pointer'
                                    }}
                                >
                                    📐 {!isMobile && 'Auto Size'}
                                </button>

                                <button
                                    onClick={toggleFullScreen}
                                    style={{
                                        padding: '0.375rem 0.75rem',
                                        fontSize: '0.875rem',
                                        borderRadius: '0.25rem',
                                        border: '1px solid rgba(255,255,255,0.3)',
                                        backgroundColor: 'transparent',
                                        color: theme === 'dark' ? '#fff' : '#000',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {isFullScreen ? '🗗' : '🗖'} {!isMobile && (isFullScreen ? 'Exit' : 'Full')}
                                </button>
                                
                                <button
                                    onClick={toggleTheme}
                                    style={{
                                        padding: '0.375rem 0.75rem',
                                        fontSize: '0.875rem',
                                        borderRadius: '0.25rem',
                                        border: '1px solid rgba(255,255,255,0.3)',
                                        backgroundColor: 'transparent',
                                        color: theme === 'dark' ? '#fff' : '#000',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {theme === 'light' ? '🌙' : '☀️'} {!isMobile && (theme === 'light' ? 'Dark' : 'Light')}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Statistics Bar */}
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '1rem',
                        padding: '1rem 2rem',
                        backgroundColor: theme === 'dark' ? '#2c3034' : '#f8f9fa',
                        borderBottom: `1px solid ${theme === 'dark' ? '#495057' : '#dee2e6'}`
                    }}>
                        <div style={{ flex: '1 1 150px', textAlign: 'right' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#007bff' }}>
                                ₹{statistics.totalValue.toFixed(2)}
                            </div>
                            <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Total Stock Value</div>
                        </div>
                        <div style={{ flex: '1 1 150px', textAlign: 'right' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745' }}>
                                {statistics.inStock}
                            </div>
                            <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>In Stock</div>
                        </div>
                        <div style={{ flex: '1 1 150px', textAlign: 'right' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffc107' }}>
                                {statistics.lowStock}
                            </div>
                            <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Low Stock</div>
                        </div>
                        <div style={{ flex: '1 1 150px', textAlign: 'right' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc3545' }}>
                                {statistics.outOfStock}
                            </div>
                            <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Out of Stock</div>
                        </div>
                    </div>

                    {/* Body Content - AG Grid */}
                    <div style={{
                        backgroundColor: themeStyles.cardBg,
                        padding: isFullScreen ? 0 : 15
                    }}>
                        {filteredData.length === 0 ? (
                            <div style={{
                                textAlign: 'right',
                                padding: '50px',
                                color: themeStyles.color
                            }}>
                                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📦</div>
                                <h5>No materials data available</h5>
                                <p>Please adjust your filters or check your API connection.</p>
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
                                    rowData={filteredData}
                                    columnDefs={columnDefs}
                                    defaultColDef={defaultColDef}
                                    pagination={true}
                                    paginationPageSize={isMobile ? 10 : 20}
                                    rowSelection="multiple"
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MaterialsAndStockReport;