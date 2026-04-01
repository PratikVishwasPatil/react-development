import React, { useEffect, useMemo, useState, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
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
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

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

const CategoryPOReport = () => {
    const [theme, setTheme] = useState('light');
    const [rowData, setRowData] = useState([]);
    const [columnDefs, setColumnDefs] = useState([]);
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [financialYear, setFinancialYear] = useState('25-26');
    const [financialYearOptions, setFinancialYearOptions] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [toasts, setToasts] = useState([]);
    const [chartData, setChartData] = useState([]);
    
    const gridRef = useRef();

    const showToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };

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
                
                if (years.length > 0) {
                    setFinancialYear(years[years.length - 1].value);
                }
            }
        } catch (error) {
            console.error("Error fetching financial years:", error);
            showToast("Error loading financial years", 'error');
        }
    };

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Currency formatter
    const currencyFormatter = (params) => {
        if (params.value == null) return '₹ 0';
        return '₹ ' + parseFloat(params.value).toLocaleString('en-IN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    };

    // Percentage formatter with color coding
    const percentageFormatter = (params) => {
        if (params.value == null) return '0%';
        return parseFloat(params.value).toFixed(2) + '%';
    };

    // Cell style for percentage based on value
    const getPercentageCellStyle = (params) => {
        if (!params.value) return { textAlign: 'center', fontWeight: '600' };
        
        const value = params.value;
        let backgroundColor, color;
        
        if (value >= 30) {
            backgroundColor = '#dcfce7';
            color = '#166534';
        } else if (value >= 15) {
            backgroundColor = '#fef3c7';
            color = '#854d0e';
        } else if (value >= 5) {
            backgroundColor = '#dbeafe';
            color = '#1e3a8a';
        } else {
            backgroundColor = '#f3f4f6';
            color = '#374151';
        }

        return {
            textAlign: 'center',
            fontWeight: '700',
            backgroundColor,
            color,
            fontSize: '0.95rem'
        };
    };

    // Category icon renderer
    const categoryIcons = {
        'BOUGHT OUT': '🛒',
        'CONSUMABLES': '🧪',
        'DRIVE': '⚙️',
        'ELECTRICAL': '⚡',
        'FABRICATION': '🔨',
        'FOUNDATION': '🏗️',
        'HARDWARE': '🔩',
        'PACKING MTR': '📦',
        'PAINT': '🎨',
        'POWDER': '💨',
        'SHEET': '📄',
        'SHEET METAL': '🔧',
        'SOFTWARE': '💻',
        'TOOLS': '🛠️'
    };

    const categoryValueGetter = (params) => {
        if (!params.data || !params.data.category) return '';
        const icon = categoryIcons[params.data.category] || '📊';
        return `${icon} ${params.data.category}`;
    };

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
                field: "category",
                headerName: "Category",
                width: isMobile ? 180 : 250,
                pinned: 'left',
                valueGetter: categoryValueGetter,
                cellStyle: { fontWeight: '700', color: '#2563eb', textTransform: 'uppercase', fontSize: '0.9rem' }
            },
            {
                field: "po_amount",
                headerName: "PO Amount",
                width: isMobile ? 150 : 200,
                valueFormatter: currencyFormatter,
                cellStyle: { textAlign: 'right', fontWeight: '600', color: '#059669' },
                type: 'numericColumn'
            },
            {
                field: "percentage",
                headerName: "Percentage",
                width: isMobile ? 120 : 150,
                valueFormatter: percentageFormatter,
                cellStyle: getPercentageCellStyle,
                type: 'numericColumn',
                pinned: isMobile ? null : 'right'
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
        cellStyle: { textAlign: 'left' }
    }), [isMobile]);

    const fetchCategoryPOData = async (fy = financialYear) => {
        if (!fy) {
            showToast('Please select a financial year', 'error');
            return;
        }

        setLoading(true);
        try {
            const url = `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/summary_report/material_category_po_reportApi.php?financial_year=${fy}`;
            
            console.log('Fetching from:', url);
            
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('API Response:', data);

            if (data.status && Array.isArray(data.dataArr)) {
                // Calculate total for percentage
                const total = data.dataArr.reduce((sum, item) => sum + (item.po_amount || 0), 0);
                
                // Add percentage to each row
                const dataWithPercentage = data.dataArr.map(item => ({
                    ...item,
                    percentage: total > 0 ? (item.po_amount / total) * 100 : 0
                }));
                
                setRowData(dataWithPercentage);
                setTotalRecords(data.records || data.dataArr.length);
                
                // Generate chart data
                generateChartData(dataWithPercentage, total);
                
                showToast(`Loaded ${data.dataArr.length} categories for FY ${fy}`, 'success');
            } else {
                throw new Error("Failed to fetch category PO data");
            }
        } catch (error) {
            console.error("Error fetching category PO data:", error);
            showToast(`Error fetching data: ${error.message}`, 'error');
            setRowData([]);
            setTotalRecords(0);
            setChartData([]);
        } finally {
            setLoading(false);
        }
    };

    const generateChartData = (data, total) => {
        // Color mapping for categories (matching the screenshot)
        const categoryColors = {
            'BOUGHT OUT': '#3b82f6',
            'CONSUMABLES': '#8b5cf6',
            'DRIVE': '#10b981',
            'ELECTRICAL': '#f97316',
            'FABRICATION': '#ec4899',
            'FOUNDATION': '#d946ef',
            'HARDWARE': '#06b6d4',
            'PACKING MTR': '#ef4444',
            'PAINT': '#f59e0b',
            'POWDER': '#14b8a6',
            'SHEET': '#2563eb',
            'SHEET METAL': '#7c3aed',
            'SOFTWARE': '#22c55e',
            'TOOLS': '#f43f5e'
        };

        // Filter out zero values and prepare chart data
        const preparedChartData = data
            .filter(item => item.po_amount > 0)
            .map(item => {
                const color = categoryColors[item.category] || '#64748b';
                return {
                    name: item.category,
                    value: item.po_amount,
                    percentage: item.percentage,
                    fill: color,  // Add fill property for Recharts
                    color: color  // Keep color for reference
                };
            })
            .sort((a, b) => b.value - a.value); // Sort by amount descending

        console.log('Chart data prepared:', preparedChartData);
        setChartData(preparedChartData);
    };

    useEffect(() => {
        setColumnDefs(generateColumnDefs());
        fetchFinancialYears();
    }, [isMobile]);

    // Auto-load data when financial year is set
    useEffect(() => {
        if (financialYear) {
            fetchCategoryPOData();
        }
    }, [financialYear]);

    // Update chart when theme changes
    useEffect(() => {
        if (rowData.length > 0) {
            const total = rowData.reduce((sum, item) => sum + (item.po_amount || 0), 0);
            generateChartData(rowData, total);
        }
    }, [theme, isMobile]);

    const handleFinancialYearChange = (e) => {
        const newFY = e.target.value;
        setFinancialYear(newFY);
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

    const downloadExcel = () => {
        if (!gridRef.current?.api) return;
        
        try {
            const params = {
                fileName: `CategoryPOReport_${financialYear}_${new Date().toISOString().split('T')[0]}.csv`,
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

    const refreshData = () => {
        fetchCategoryPOData(financialYear);
    };

    // Calculate total
    const calculateTotal = () => {
        if (rowData.length === 0) return 0;
        return rowData.reduce((sum, row) => sum + (row.po_amount || 0), 0);
    };

    const totalAmount = calculateTotal();

    // Custom Tooltip for Pie Chart
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div style={{
                    backgroundColor: theme === 'dark' ? '#334155' : '#ffffff',
                    border: theme === 'dark' ? '1px solid #475569' : '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                    <p style={{ 
                        margin: '0 0 8px 0', 
                        fontWeight: '700',
                        fontSize: '14px',
                        color: themeStyles.color 
                    }}>
                        {data.name}
                    </p>
                    <p style={{ 
                        margin: '4px 0', 
                        fontSize: '13px',
                        color: themeStyles.color 
                    }}>
                        <span style={{ fontWeight: '600' }}>Amount:</span>{' '}
                        <span style={{ color: data.color, fontWeight: '700' }}>
                            ₹{data.value.toLocaleString('en-IN')}
                        </span>
                    </p>
                    <p style={{ 
                        margin: '4px 0 0 0', 
                        fontSize: '13px',
                        color: themeStyles.color 
                    }}>
                        <span style={{ fontWeight: '600' }}>Percentage:</span>{' '}
                        <span style={{ fontWeight: '700' }}>
                            {data.percentage.toFixed(2)}%
                        </span>
                    </p>
                </div>
            );
        }
        return null;
    };

    const getThemeStyles = () => {
        if (theme === 'dark') {
            return {
                backgroundColor: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                color: '#f1f5f9',
                cardBg: '#1e293b',
                cardHeader: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)'
            };
        }
        return {
            backgroundColor: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            color: '#0f172a',
            cardBg: '#ffffff',
            cardHeader: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)'
        };
    };

    const themeStyles = getThemeStyles();
    const gridHeight = isFullScreen ? 'calc(100vh - 450px)' : (isMobile ? '500px' : '600px');

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
                    <div style={{
                        width: '3rem',
                        height: '3rem',
                        border: '4px solid rgba(37, 99, 235, 0.2)',
                        borderTopColor: '#2563eb',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto'
                    }} />
                    <p style={{ marginTop: '1rem', fontWeight: '600' }}>Loading category PO report...</p>
                    <style>{`
                        @keyframes spin {
                            to { transform: rotate(360deg); }
                        }
                    `}</style>
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
            {/* Toast Notifications */}
            <div style={{
                position: 'fixed',
                top: '1rem',
                right: '1rem',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
            }}>
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        style={{
                            padding: '1rem 1.5rem',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            color: 'white',
                            backgroundColor: toast.type === 'success' ? '#10b981' : '#ef4444',
                            animation: 'slideIn 0.3s ease-out',
                            minWidth: '250px',
                            fontWeight: '600'
                        }}
                    >
                        {toast.message}
                    </div>
                ))}
            </div>

            <div style={{
                width: '100%',
                maxWidth: isFullScreen ? '100%' : '1400px',
                margin: isFullScreen ? 0 : '20px auto',
                padding: isFullScreen ? 0 : '0 20px'
            }}>
                <div style={{
                    backgroundColor: themeStyles.cardBg,
                    color: themeStyles.color,
                    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
                    borderRadius: isFullScreen ? 0 : '12px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}>
                    {/* Header */}
                    <div style={{
                        background: themeStyles.cardHeader,
                        color: theme === 'dark' ? '#ffffff' : '#0f172a',
                        padding: '1.25rem 2rem',
                        borderBottom: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0'
                    }}>
                        <div style={{
                            display: 'flex',
                            flexDirection: isMobile ? 'column' : 'row',
                            alignItems: isMobile ? 'flex-start' : 'center',
                            justifyContent: 'space-between',
                            gap: '1rem'
                        }}>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800' }}>
                                    📊 Categorywise PO Report
                                </h4>
                                <small style={{ opacity: 0.8, display: 'block', marginTop: '0.5rem', fontSize: '0.95rem' }}>
                                    {totalRecords} categories | Total Amount: ₹ {totalAmount.toLocaleString('en-IN')}
                                    {selectedRows.length > 0 && ` | ${selectedRows.length} selected`}
                                </small>
                            </div>

                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '0.5rem',
                                alignItems: 'center'
                            }}>
                                <button
                                    onClick={refreshData}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        fontSize: '0.9rem',
                                        borderRadius: '6px',
                                        border: 'none',
                                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                        color: 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontWeight: '600',
                                        boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                                    }}
                                >
                                    <span>↻</span>
                                    {!isMobile && <span>Refresh</span>}
                                </button>

                                <button
                                    onClick={downloadExcel}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        fontSize: '0.9rem',
                                        borderRadius: '6px',
                                        border: 'none',
                                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                        color: 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontWeight: '600',
                                        boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                                    }}
                                >
                                    <span>📊</span>
                                    {!isMobile && <span>Export</span>}
                                </button>

                                <button
                                    onClick={autoSizeAll}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        fontSize: '0.9rem',
                                        borderRadius: '6px',
                                        border: 'none',
                                        background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                                        color: 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontWeight: '600'
                                    }}
                                >
                                    <span>↔</span>
                                    {!isMobile && <span>Auto</span>}
                                </button>

                                <button
                                    onClick={toggleFullScreen}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        fontSize: '0.9rem',
                                        borderRadius: '6px',
                                        border: theme === 'dark' ? '1px solid #f1f5f9' : '1px solid #0f172a',
                                        backgroundColor: 'transparent',
                                        color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
                                        cursor: 'pointer',
                                        fontWeight: '600'
                                    }}
                                >
                                    {isFullScreen ? '⛶ Exit' : '⛶ Full'}
                                </button>

                                <button
                                    onClick={toggleTheme}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        fontSize: '0.9rem',
                                        borderRadius: '6px',
                                        border: theme === 'dark' ? '1px solid #f1f5f9' : '1px solid #0f172a',
                                        backgroundColor: 'transparent',
                                        color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
                                        cursor: 'pointer',
                                        fontWeight: '600'
                                    }}
                                >
                                    {theme === 'light' ? '🌙' : '☀️'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Filters Section */}
                    <div style={{
                        padding: '1.5rem 2rem',
                        background: theme === 'dark' ? '#0f172a' : '#f8fafc',
                        borderBottom: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0'
                    }}>
                        <div style={{
                            display: 'flex',
                            gap: '1rem',
                            alignItems: 'end',
                            flexWrap: 'wrap'
                        }}>
                            {/* Financial Year */}
                            <div style={{ flex: '1 1 200px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    fontSize: '0.9rem',
                                    color: theme === 'dark' ? '#f1f5f9' : '#0f172a'
                                }}>
                                    Financial Year <span style={{color: '#ef4444'}}>*</span>
                                </label>
                                <select
                                    value={financialYear}
                                    onChange={handleFinancialYearChange}
                                    style={{
                                        width: '100%',
                                        padding: '0.625rem 0.875rem',
                                        fontSize: '0.95rem',
                                        borderRadius: '6px',
                                        border: theme === 'dark' ? '1px solid #334155' : '1px solid #cbd5e1',
                                        backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                                        color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
                                        fontWeight: '600',
                                        outline: 'none'
                                    }}
                                >
                                    <option value="">Select FY</option>
                                    {financialYearOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            FY {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Summary Statistics Cards */}
                    {rowData.length > 0 && (
                        <div style={{
                            padding: '1.5rem 2rem',
                            background: theme === 'dark' ? '#0f172a' : '#f8fafc',
                            borderBottom: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0'
                        }}>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '1rem'
                            }}>
                                {/* Top 3 Categories */}
                                {chartData.slice(0, 3).map((category, index) => (
                                    <StatCard
                                        key={category.name}
                                        theme={theme}
                                        label={category.name}
                                        value={category.value}
                                        percentage={category.percentage}
                                        color={category.fill || category.color}
                                        rank={index + 1}
                                    />
                                ))}
                                
                                {/* Total Card */}
                                <StatCard
                                    theme={theme}
                                    label="TOTAL"
                                    value={totalAmount}
                                    percentage={100}
                                    color="#16a34a"
                                    isTotal={true}
                                />
                            </div>
                        </div>
                    )}

                    {/* Grid Section */}
                    <div style={{
                        backgroundColor: themeStyles.cardBg,
                        padding: 0,
                        minHeight: '650px'
                    }}>
                        {rowData.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '60px 20px',
                                color: themeStyles.color
                            }}>
                                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📊</div>
                                <h5 style={{ marginBottom: '10px', fontSize: '1.25rem' }}>No category PO data available</h5>
                                <p style={{ color: theme === 'dark' ? '#94a3b8' : '#64748b' }}>
                                    {!financialYear 
                                        ? 'Please select a financial year'
                                        : 'No data found for the selected financial year'}
                                </p>
                            </div>
                        ) : (
                            <div
                                className="ag-theme-alpine"
                                style={{
                                    height: gridHeight,
                                    width: "100%",
                                    ...(theme === 'dark' && {
                                        '--ag-background-color': '#1e293b',
                                        '--ag-header-background-color': '#334155',
                                        '--ag-odd-row-background-color': '#1e293b',
                                        '--ag-even-row-background-color': '#0f172a',
                                        '--ag-row-hover-color': '#334155',
                                        '--ag-foreground-color': '#f1f5f9',
                                        '--ag-header-foreground-color': '#f1f5f9',
                                        '--ag-border-color': '#334155',
                                        '--ag-selected-row-background-color': '#10b981',
                                        '--ag-input-background-color': '#334155',
                                        '--ag-input-border-color': '#475569'
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
                                    rowHeight={isMobile ? 38 : 45}
                                    onGridReady={(params) => {
                                        console.log('Category PO Report Grid ready');
                                        setTimeout(() => autoSizeAll(), 500);
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Chart Section */}
                    {chartData.length > 0 && (
                        <div style={{
                            backgroundColor: themeStyles.cardBg,
                            padding: '2rem',
                            borderTop: theme === 'dark' ? '2px solid #334155' : '2px solid #e2e8f0',
                            marginTop: 0
                        }}>
                            <h5 style={{
                                margin: '0 0 2rem 0',
                                textAlign: 'center',
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                color: themeStyles.color
                            }}>
                                Categorywise PO Report
                            </h5>
                            <ResponsiveContainer width="100%" height={isMobile ? 600 : 700}>
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={{
                                            stroke: theme === 'dark' ? '#94a3b8' : '#64748b',
                                            strokeWidth: 1
                                        }}
                                        label={(entry) => {
                                            // Only show label if percentage is > 1% to avoid clutter
                                            if (entry.percentage > 1) {
                                                return `${entry.name}: (${entry.percentage.toFixed(2)}%) ₹${entry.value.toLocaleString('en-IN')}`;
                                            }
                                            return '';
                                        }}
                                        outerRadius={isMobile ? 140 : 180}
                                        dataKey="value"
                                        style={{
                                            fontSize: isMobile ? '10px' : '11px',
                                            fontWeight: '600',
                                            fill: theme === 'dark' ? '#f1f5f9' : '#0f172a'
                                        }}
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={entry.fill || entry.color}
                                                stroke={theme === 'dark' ? '#1e293b' : '#ffffff'}
                                                strokeWidth={2}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        content={<CustomTooltip />}
                                        cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                                    />
                                    <Legend 
                                        verticalAlign="bottom" 
                                        height={isMobile ? 100 : 80}
                                        wrapperStyle={{
                                            paddingTop: '30px',
                                            fontSize: isMobile ? '11px' : '12px',
                                            fontWeight: '600'
                                        }}
                                        iconType="circle"
                                        iconSize={10}
                                        formatter={(value, entry) => {
                                            const data = entry.payload;
                                            return `${value}: ${data.percentage.toFixed(2)}%`;
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                
                /* Remove any default margins/paddings that create gaps */
                .ag-theme-alpine {
                    border: none !important;
                }
                
                .ag-root-wrapper {
                    border: none !important;
                }
            `}</style>
        </div>
    );
};

// Stat Card Component for Top Categories
const StatCard = ({ theme, label, value, percentage, color, rank, isTotal = false }) => {
    const getRankEmoji = (rank) => {
        switch(rank) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return '📊';
        }
    };

    return (
        <div style={{
            padding: '1rem 1.25rem',
            borderRadius: '10px',
            background: theme === 'dark' ? '#1e293b' : '#ffffff',
            border: isTotal 
                ? `2px solid ${color}`
                : theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
            boxShadow: isTotal 
                ? `0 4px 16px ${color}33` 
                : '0 2px 8px rgba(0,0,0,0.05)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            position: 'relative',
            overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = `0 8px 20px ${color}44`;
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = isTotal ? `0 4px 16px ${color}33` : '0 2px 8px rgba(0,0,0,0.05)';
        }}
        >
            {/* Background decoration */}
            <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: `${color}15`,
                zIndex: 0
            }} />
            
            <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.75rem'
                }}>
                    <div style={{
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        color: theme === 'dark' ? '#94a3b8' : '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        {label}
                    </div>
                    {rank && (
                        <div style={{ fontSize: '1.25rem' }}>
                            {getRankEmoji(rank)}
                        </div>
                    )}
                    {isTotal && (
                        <div style={{ fontSize: '1.25rem' }}>
                            💰
                        </div>
                    )}
                </div>
                
                <div style={{
                    fontSize: isTotal ? '1.75rem' : '1.5rem',
                    fontWeight: '700',
                    color: color,
                    marginBottom: '0.5rem',
                    lineHeight: '1.2'
                }}>
                    ₹ {value.toLocaleString('en-IN')}
                </div>
                
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <div style={{
                        flex: 1,
                        height: '6px',
                        backgroundColor: theme === 'dark' ? '#334155' : '#e2e8f0',
                        borderRadius: '3px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            width: `${percentage}%`,
                            height: '100%',
                            backgroundColor: color,
                            borderRadius: '3px',
                            transition: 'width 0.5s ease'
                        }} />
                    </div>
                    <span style={{
                        fontSize: '0.875rem',
                        fontWeight: '700',
                        color: color,
                        minWidth: '55px',
                        textAlign: 'right'
                    }}>
                        {percentage.toFixed(2)}%
                    </span>
                </div>
            </div>
        </div>
    );
};

export default CategoryPOReport;