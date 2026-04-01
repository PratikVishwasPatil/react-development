import React, { useEffect, useState, useRef, useMemo } from "react";
import Select from 'react-select';
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

const ConsolidatedRfdStock = () => {
    const [activeTab, setActiveTab] = useState('Sheet Metal');
    const [theme, setTheme] = useState('light');
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    
    const [financialYears, setFinancialYears] = useState([]);
    const [selectedYear, setSelectedYear] = useState('25-26');
    const [stockData, setStockData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [columnDefs, setColumnDefs] = useState([]);
    
    const gridRef = useRef();

    const API_BASE_URL = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api";
    const tabs = ['Sheet Metal', 'Fabrication', 'Foundation', 'Assembly'];

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    // Generate column definitions based on active tab
    const generateColumnDefs = (tab) => {
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
            }
        ];

        let specificColumns = [];
        
        if (tab === 'Sheet Metal') {
            specificColumns = [
                { field: 'material_name', headerName: 'Material Name', width: 250, flex: 1, cellStyle: { fontWeight: '600' } },
                { field: 'weight', headerName: 'Weight', width: 100, filter: 'agNumberColumnFilter' },
                { field: 'height', headerName: 'Height', width: 100, filter: 'agNumberColumnFilter' },
                { field: 'filename', headerName: 'File Name', width: 200, flex: 1 },
                { field: 'fileQty', headerName: 'File Qty', width: 100, filter: 'agNumberColumnFilter' },
                { 
                    field: 'totalQty', 
                    headerName: 'Total Qty', 
                    width: 110, 
                    filter: 'agNumberColumnFilter',
                    cellStyle: { fontWeight: '600', color: '#10b981' }
                },
                { 
                    field: 'remQty', 
                    headerName: 'Rem Qty', 
                    width: 110, 
                    filter: 'agNumberColumnFilter',
                    cellStyle: (params) => ({
                        fontWeight: '600',
                        color: parseFloat(params.value || 0) > 0 ? '#ef4444' : '#10b981'
                    })
                },
                { field: 'color', headerName: 'Color', width: 120 },
                { field: 'vendorName', headerName: 'Vendor Name', width: 200, flex: 1 },
                { field: 'storeLocation', headerName: 'Store Location', width: 150 }
            ];
        } else if (tab === 'Fabrication') {
            specificColumns = [
                { field: 'material_name', headerName: 'Material Name', width: 250, flex: 1, cellStyle: { fontWeight: '600' } },
                { field: 'inmm', headerName: 'In MM', width: 100, filter: 'agNumberColumnFilter' },
                { field: 'vendorname', headerName: 'Vendor Name', width: 200, flex: 1 },
                { field: 'fileQty', headerName: 'File Qty', width: 100, filter: 'agNumberColumnFilter' },
                { 
                    field: 'totalQty', 
                    headerName: 'Total Qty', 
                    width: 110, 
                    filter: 'agNumberColumnFilter',
                    cellStyle: { fontWeight: '600', color: '#10b981' }
                },
                { 
                    field: 'remQty', 
                    headerName: 'Rem Qty', 
                    width: 110, 
                    filter: 'agNumberColumnFilter',
                    cellStyle: (params) => ({
                        fontWeight: '600',
                        color: parseFloat(params.value || 0) > 0 ? '#ef4444' : '#10b981'
                    })
                },
                { field: 'color', headerName: 'Color', width: 120 },
                { field: 'storelocation', headerName: 'Store Location', width: 150 }
            ];
        } else if (tab === 'Foundation') {
            specificColumns = [
                { field: 'material_name', headerName: 'Material Name', width: 200, flex: 1, cellStyle: { fontWeight: '600' } },
                { field: 'moc', headerName: 'MOC', width: 100 },
                { field: 'size', headerName: 'Size', width: 100 },
                { field: 'length', headerName: 'Length', width: 100, filter: 'agNumberColumnFilter' },
                { field: 'vendorname', headerName: 'Vendor Name', width: 200, flex: 1 },
                { field: 'fileQty', headerName: 'File Qty', width: 100, filter: 'agNumberColumnFilter' },
                { 
                    field: 'totalQty', 
                    headerName: 'Total Qty', 
                    width: 110, 
                    filter: 'agNumberColumnFilter',
                    cellStyle: { fontWeight: '600', color: '#10b981' }
                },
                { 
                    field: 'remQty', 
                    headerName: 'Rem Qty', 
                    width: 110, 
                    filter: 'agNumberColumnFilter',
                    cellStyle: (params) => ({
                        fontWeight: '600',
                        color: parseFloat(params.value || 0) > 0 ? '#ef4444' : '#10b981'
                    })
                },
                { field: 'completedQty', headerName: 'Completed Qty', width: 130, filter: 'agNumberColumnFilter' },
                { field: 'assignQty', headerName: 'Assign Qty', width: 110, filter: 'agNumberColumnFilter' },
                { field: 'color', headerName: 'Color', width: 120 },
                { field: 'storelocation', headerName: 'Store Location', width: 150 }
            ];
        } else if (tab === 'Assembly') {
            specificColumns = [
                { field: 'material_name', headerName: 'Material Name', width: 300, flex: 1, cellStyle: { fontWeight: '600' } },
                { field: 'filename', headerName: 'File Name', width: 200, flex: 1 },
                { field: 'fileQty', headerName: 'File Qty', width: 100, filter: 'agNumberColumnFilter' },
                { 
                    field: 'totalQty', 
                    headerName: 'Total Qty', 
                    width: 110, 
                    filter: 'agNumberColumnFilter',
                    cellStyle: { fontWeight: '600', color: '#10b981' }
                },
                { field: 'storelocation', headerName: 'Store Location', width: 150 }
            ];
        }

        return [...baseColumns, ...specificColumns];
    };

    const defaultColDef = useMemo(() => ({
        filter: true,
        sortable: true,
        floatingFilter: !isMobile,
        resizable: true,
        suppressMenu: isMobile,
        cellStyle: { textAlign: 'right' }
    }), [isMobile]);

    // Fetch financial years
    const fetchFinancialYears = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/PPC/getFinancialYearsApi.php`);
            const result = await response.json();
            if (result.status === "success" && Array.isArray(result.data)) {
                setFinancialYears(result.data);
            }
        } catch (error) {
            console.error("Error fetching financial years:", error);
            // Fallback data
            setFinancialYears([
                { id: "6", sequence_no: "6", financial_year: "25-26" },
                { id: "5", sequence_no: "5", financial_year: "24-25" },
                { id: "3", sequence_no: "4", financial_year: "23-24" },
                { id: "2", sequence_no: "3", financial_year: "22-23" },
                { id: "4", sequence_no: "2", financial_year: "21-22" },
                { id: "1", sequence_no: "1", financial_year: "20-21" }
            ]);
        }
    };

    // Fetch stock data based on active tab
    const fetchStockData = async () => {
        if (!selectedYear) return;
        
        setLoading(true);
        try {
            let endpoint = '';
            
            if (activeTab === 'Sheet Metal') {
                endpoint = 'ConsolidatedRfdStockSmetalApi.php';
            } else if (activeTab === 'Fabrication') {
                endpoint = 'ConsolidatedRfdStockFabApi.php';
            } else if (activeTab === 'Foundation') {
                endpoint = 'ConsolidatedRfdStockFoundApi.php';
            } else if (activeTab === 'Assembly') {
                endpoint = 'ConsolidatedRfdStockAsslyApi.php';
            }
            
            const response = await fetch(`${API_BASE_URL}/PPC/${endpoint}?financial_year=${selectedYear}`);
            const result = await response.json();

            if (result.status === "success" && Array.isArray(result.data)) {
                setStockData(result.data);
                showToast(`Loaded ${result.data.length} records for ${activeTab}`, 'success');
            } else {
                setStockData([]);
                showToast('No data available', 'info');
            }
        } catch (error) {
            console.error("Error fetching stock data:", error);
            setStockData([]);
            showToast('Error fetching data', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFinancialYears();
    }, []);

    useEffect(() => {
        setColumnDefs(generateColumnDefs(activeTab));
    }, [activeTab, isMobile]);

    useEffect(() => {
        fetchStockData();
    }, [selectedYear, activeTab]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
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

    // Export to CSV
    const downloadExcel = () => {
        if (!gridRef.current?.api) return;

        try {
            const fileName = `${activeTab}_Stock_FY${selectedYear}_${new Date().toISOString().split('T')[0]}.csv`;

            const params = {
                fileName: fileName,
                allColumns: true,
                onlySelected: false
            };
            gridRef.current.api.exportDataAsCsv(params);
            showToast('Data exported successfully!', 'success');
        } catch (error) {
            console.error('Error exporting data:', error);
            showToast('Error exporting data', 'error');
        }
    };

    // Refresh data
    const handleRefresh = () => {
        if (selectedYear) {
            fetchStockData();
            showToast('Refreshing data...', 'info');
        }
    };

    const getThemeStyles = () => {
        if (theme === 'dark') {
            return {
                backgroundColor: '#0f172a',
                color: '#f1f5f9',
                cardBg: '#1e293b',
                inputBg: '#0f172a',
                inputBorder: '#334155',
                inputColor: '#f1f5f9',
                tabBg: '#334155',
                tabActiveBg: '#3b82f6',
                tabBorder: '#334155',
                buttonGradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                labelColor: '#94a3b8',
                cardHeader: 'linear-gradient(135deg, #495057 0%, #343a40 100%)'
            };
        }
        return {
            backgroundColor: '#f8fafc',
            color: '#0f172a',
            cardBg: '#ffffff',
            inputBg: '#ffffff',
            inputBorder: '#e2e8f0',
            inputColor: '#0f172a',
            tabBg: '#f1f5f9',
            tabActiveBg: '#3b82f6',
            tabBorder: '#e2e8f0',
            buttonGradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            labelColor: '#64748b',
            cardHeader: 'linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%)'
        };
    };

    const themeStyles = getThemeStyles();

    useEffect(() => {
        document.body.style.background = themeStyles.backgroundColor;
        document.body.style.color = themeStyles.color;
        document.body.style.minHeight = '100vh';
        document.body.style.margin = '0';
        document.body.style.padding = '0';

        return () => {
            document.body.style.background = '';
            document.body.style.color = '';
            document.body.style.minHeight = '';
            document.body.style.margin = '';
            document.body.style.padding = '';
        };
    }, [theme]);

    // Filter data based on search term (for AG Grid quick filter)
    useEffect(() => {
        if (gridRef.current?.api) {
            gridRef.current.api.setGridOption('quickFilterText', searchTerm);
        }
    }, [searchTerm]);

    const gridHeight = isFullScreen ? 'calc(100vh - 280px)' : (isMobile ? '400px' : '600px');

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: themeStyles.backgroundColor,
            color: themeStyles.color,
            padding: 0,
            margin: 0
        }}>
            <div style={{ 
                maxWidth: isFullScreen ? '100%' : '1400px',
                margin: '0 auto',
                padding: isFullScreen ? 0 : '24px'
            }}>
                <div style={{
                    backgroundColor: themeStyles.cardBg,
                    border: `1px solid ${themeStyles.tabBorder}`,
                    borderRadius: isFullScreen ? 0 : '16px',
                    overflow: 'hidden',
                    boxShadow: theme === 'dark' 
                        ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' 
                        : '0 10px 30px -5px rgba(0, 0, 0, 0.1)'
                }}>
                    {/* Header with Tabs */}
                    <div style={{
                        display: 'flex',
                        borderBottom: `2px solid ${themeStyles.tabBorder}`,
                        backgroundColor: themeStyles.cardBg,
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0 24px',
                        flexWrap: isMobile ? 'wrap' : 'nowrap'
                    }}>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    style={{
                                        padding: isMobile ? '12px 16px' : '16px 32px',
                                        border: 'none',
                                        background: activeTab === tab ? themeStyles.buttonGradient : 'transparent',
                                        color: activeTab === tab ? '#ffffff' : themeStyles.labelColor,
                                        fontSize: isMobile ? '12px' : '14px',
                                        fontWeight: activeTab === tab ? '600' : '500',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        outline: 'none',
                                        borderRadius: '8px 8px 0 0',
                                        position: 'relative'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (activeTab !== tab) {
                                            e.target.style.backgroundColor = theme === 'dark' ? '#334155' : '#f1f5f9';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (activeTab !== tab) {
                                            e.target.style.backgroundColor = 'transparent';
                                        }
                                    }}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px 0' }}>
                            <button
                                onClick={toggleFullScreen}
                                style={{
                                    padding: '10px 14px',
                                    backgroundColor: themeStyles.inputBg,
                                    color: themeStyles.color,
                                    border: `2px solid ${themeStyles.inputBorder}`,
                                    borderRadius: '8px',
                                    fontSize: '18px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.borderColor = '#3b82f6';
                                    e.target.style.transform = 'scale(1.05)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.borderColor = themeStyles.inputBorder;
                                    e.target.style.transform = 'scale(1)';
                                }}
                            >
                                {isFullScreen ? '📉' : '📈'}
                            </button>
                            <button
                                onClick={toggleTheme}
                                style={{
                                    padding: '10px 14px',
                                    backgroundColor: themeStyles.inputBg,
                                    color: themeStyles.color,
                                    border: `2px solid ${themeStyles.inputBorder}`,
                                    borderRadius: '8px',
                                    fontSize: '18px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.borderColor = '#3b82f6';
                                    e.target.style.transform = 'scale(1.05)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.borderColor = themeStyles.inputBorder;
                                    e.target.style.transform = 'scale(1)';
                                }}
                            >
                                {theme === 'light' ? '🌙' : '☀️'}
                            </button>
                        </div>
                    </div>

                    {/* Filters Section */}
                    <div style={{ padding: '28px', backgroundColor: theme === 'dark' ? '#1e293b' : '#f8fafc' }}>
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 2fr', 
                            gap: '20px',
                            alignItems: 'end'
                        }}>
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '10px',
                                    fontWeight: '600',
                                    fontSize: '15px',
                                    color: themeStyles.color,
                                    letterSpacing: '0.3px'
                                }}>
                                    Financial Year:
                                </label>
                                <Select
                                    value={financialYears.find(year => year.financial_year === selectedYear) 
                                        ? { 
                                            value: selectedYear, 
                                            label: selectedYear
                                        }
                                        : null
                                    }
                                    onChange={(selectedOption) => setSelectedYear(selectedOption ? selectedOption.value : '')}
                                    options={financialYears.map(year => ({
                                        value: year.financial_year,
                                        label: year.financial_year
                                    }))}
                                    styles={{
                                        control: (provided, state) => ({
                                            ...provided,
                                            borderColor: state.isFocused ? '#3b82f6' : themeStyles.inputBorder,
                                            backgroundColor: themeStyles.inputBg,
                                            color: themeStyles.inputColor,
                                            minHeight: '48px',
                                            boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
                                            '&:hover': {
                                                borderColor: '#3b82f6'
                                            }
                                        }),
                                        menu: (provided) => ({
                                            ...provided,
                                            backgroundColor: themeStyles.inputBg,
                                            zIndex: 9999
                                        }),
                                        option: (provided, state) => ({
                                            ...provided,
                                            backgroundColor: state.isSelected
                                                ? '#3b82f6'
                                                : state.isFocused
                                                    ? (theme === 'dark' ? '#334155' : '#f1f5f9')
                                                    : 'transparent',
                                            color: state.isSelected
                                                ? '#ffffff'
                                                : themeStyles.inputColor,
                                            '&:hover': {
                                                backgroundColor: state.isSelected ? '#3b82f6' : (theme === 'dark' ? '#334155' : '#f1f5f9')
                                            }
                                        }),
                                        singleValue: (provided) => ({
                                            ...provided,
                                            color: themeStyles.inputColor
                                        }),
                                        placeholder: (provided) => ({
                                            ...provided,
                                            color: themeStyles.labelColor
                                        }),
                                        input: (provided) => ({
                                            ...provided,
                                            color: themeStyles.inputColor
                                        })
                                    }}
                                    placeholder="Select year..."
                                    isClearable
                                    isSearchable
                                />
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '10px',
                                    fontWeight: '600',
                                    fontSize: '15px',
                                    color: themeStyles.color,
                                    letterSpacing: '0.3px'
                                }}>
                                    Total Records:
                                </label>
                                <div style={{
                                    padding: '12px 16px',
                                    background: themeStyles.buttonGradient,
                                    color: '#ffffff',
                                    borderRadius: '8px',
                                    fontSize: '18px',
                                    fontWeight: '700',
                                    textAlign: 'center'
                                }}>
                                    {stockData.length}
                                </div>
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '10px',
                                    fontWeight: '600',
                                    fontSize: '15px',
                                    color: themeStyles.color,
                                    letterSpacing: '0.3px'
                                }}>
                                    Search:
                                </label>
                                <input
                                    type="text"
                                    placeholder="Search in table..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        border: `2px solid ${themeStyles.inputBorder}`,
                                        borderRadius: '8px',
                                        backgroundColor: themeStyles.inputBg,
                                        color: themeStyles.inputColor,
                                        fontSize: '14px',
                                        outline: 'none',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#3b82f6';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = themeStyles.inputBorder;
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ 
                            display: 'flex', 
                            gap: '10px', 
                            marginTop: '20px',
                            flexWrap: 'wrap'
                        }}>
                            <button
                                onClick={handleRefresh}
                                disabled={loading}
                                style={{
                                    padding: '10px 20px',
                                    fontSize: '14px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    backgroundColor: '#007bff',
                                    color: 'white',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    opacity: loading ? 0.6 : 1
                                }}
                            >
                                🔄 Refresh
                            </button>

                            <button
                                onClick={downloadExcel}
                                style={{
                                    padding: '10px 20px',
                                    fontSize: '14px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    backgroundColor: '#28a745',
                                    color: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                📊 Export CSV
                            </button>

                            <button
                                onClick={autoSizeAll}
                                style={{
                                    padding: '10px 20px',
                                    fontSize: '14px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    backgroundColor: '#17a2b8',
                                    color: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                ⇔ Auto Size
                            </button>
                        </div>
                    </div>

                    {/* AG Grid Section */}
                    <div style={{ padding: '28px' }}>
                        <div style={{ 
                            marginBottom: '20px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                    <div style={{
    fontSize: '17px',
    fontWeight: '700',
    color: themeStyles.color,
    borderBottom: `2px solid ${themeStyles.tabBorder}`,
    paddingBottom: '12px'
}}>
                    {activeTab} - Consolidated RFD Stock
                    </div>
                    </div>
                    {loading && stockData.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px', color: themeStyles.color }}>
                            <div style={{
                                display: 'inline-block',
                                width: '50px',
                                height: '50px',
                                border: '5px solid rgba(59, 130, 246, 0.2)',
                                borderTopColor: '#3b82f6',
                                borderRadius: '50%',
                                animation: 'spin 0.8s linear infinite'
                            }}></div>
                            <div style={{ marginTop: '20px', fontSize: '15px', fontWeight: '500' }}>Loading data...</div>
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
                                rowData={stockData}
                                columnDefs={columnDefs}
                                defaultColDef={defaultColDef}
                                pagination={true}
                                paginationPageSize={isMobile ? 10 : 25}
                                suppressMovableColumns={isMobile}
                                enableRangeSelection={!isMobile}
                                animateRows={!isMobile}
                                enableCellTextSelection={true}
                                suppressHorizontalScroll={false}
                                headerHeight={isMobile ? 40 : 48}
                                rowHeight={isMobile ? 35 : 42}
                                onGridReady={(params) => {
                                    setTimeout(() => autoSizeAll(), 500);
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
export default ConsolidatedRfdStock;
