import React, { useEffect, useState, useRef } from "react";
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

const DispatchScheduleGrid = () => {
    const [theme, setTheme] = useState('light');
    const [rowData, setRowData] = useState([]);
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('S');
    const gridRef = useRef();

    const formTitle = "Dispatch Schedule Management";

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Action Cell Renderer
    const ActionCellRenderer = (props) => {
        const handleSave = () => {
            const rowData = props.data;
            console.log('Saving row data:', rowData);
            saveDispatchData(rowData);
        };

        return (
            <button
                onClick={handleSave}
                style={{
                    padding: '6px 12px',
                    background: '#0d6efd',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    color: 'white',
                    fontSize: '11px',
                    fontWeight: '500'
                }}
                title="Save"
            >
                💾 Save
            </button>
        );
    };

    // Date Cell Renderer (like Site Dashboard)
    const DateCellRenderer = (params) => {
        const handleDateChange = (event) => {
            const newDate = event.target.value;
            params.node.setDataValue(params.colDef.field, newDate);
            console.log(`Date changed for ${params.data.fname}:`, params.colDef.field, "→", newDate);
        };

        const formatDateForInput = (dateStr) => {
            if (!dateStr) return "";
            if (dateStr.includes("-")) {
                const parts = dateStr.split("-");
                if (parts[0].length === 4) {
                    return dateStr; // already YYYY-MM-DD
                } else {
                    // DD-MM-YYYY to YYYY-MM-DD
                    return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
                }
            }
            return "";
        };

        return (
            <input
                type="date"
                value={formatDateForInput(params.value)}
                onChange={handleDateChange}
                style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    backgroundColor: "transparent",
                    fontSize: "11px",
                    outline: "none",
                    textAlign: "center",
                    padding: "4px"
                }}
            />
        );
    };

    // Weight/Text Cell Renderer (like Site Dashboard EditableInputCell)
    const WeightCellRenderer = (props) => {
        const { value, node, colDef } = props;
        const [inputValue, setInputValue] = React.useState(value || "");

        React.useEffect(() => {
            setInputValue(value || "");
        }, [value]);

        const handleChange = (e) => {
            const newValue = e.target.value;
            setInputValue(newValue);
            node.setDataValue(colDef.field, newValue);
        };

        return (
            <input
                type="text"
                value={inputValue}
                onChange={handleChange}
                style={{
                    width: "100%",
                    height: "100%",
                    border: "1px solid #ddd",
                    borderRadius: "3px",
                    padding: "4px",
                    textAlign: "center",
                    fontSize: "11px",
                    backgroundColor: "transparent",
                    outline: "none"
                }}
                onFocus={(e) => {
                    e.target.style.border = "2px solid #007bff";
                }}
                onBlur={(e) => {
                    e.target.style.border = "1px solid #ddd";
                }}
            />
        );
    };

    // Static column definitions with proper renderers
    const columnDefs = [
        {
            headerName: "File Name",
            field: "fname",
            width: 220,
            minWidth: 180,
            pinned: 'left',
            cellStyle: {
                fontWeight: '600',
                backgroundColor: theme === 'dark' ? '#495057' : '#fff3cd',
                color: theme === 'dark' ? '#fff' : '#000',
                fontSize: '11px'
            },
            editable: false,
            tooltipField: "fname"
        },
        {
            headerName: "System Type",
            field: "type",
            width: 140,
            minWidth: 120,
            cellStyle: {
                textAlign: 'center',
                backgroundColor: theme === 'dark' ? '#495057' : '#fff3cd',
                fontWeight: '500',
                color: '#fd7e14',
                fontSize: '11px'
            },
            editable: false
        },
        // D1 Columns
        {
            headerName: "D1 Dispatch Date",
            field: "d1_date",
            width: 160,
            minWidth: 150,
            cellRenderer: DateCellRenderer,
            cellStyle: {
                backgroundColor: theme === 'dark' ? '#343a40' : '#ffe5cc',
                textAlign: 'center',
                padding: '0'
            }
        },
        {
            headerName: "D1 Weight",
            field: "d1_weight",
            width: 120,
            minWidth: 100,
            cellRenderer: WeightCellRenderer,
            cellStyle: {
                backgroundColor: theme === 'dark' ? '#343a40' : '#ffe5cc',
                padding: '2px'
            }
        },
        // D2 Columns
        {
            headerName: "D2 Dispatch Date",
            field: "d2_date",
            width: 160,
            minWidth: 150,
            cellRenderer: DateCellRenderer,
            cellStyle: {
                backgroundColor: theme === 'dark' ? '#343a40' : '#ffe5cc',
                textAlign: 'center',
                padding: '0'
            }
        },
        {
            headerName: "D2 Weight",
            field: "d2_weight",
            width: 120,
            minWidth: 100,
            cellRenderer: WeightCellRenderer,
            cellStyle: {
                backgroundColor: theme === 'dark' ? '#343a40' : '#ffe5cc',
                padding: '2px'
            }
        },
        // D3 Columns
        {
            headerName: "D3 Dispatch Date",
            field: "d3_date",
            width: 160,
            minWidth: 150,
            cellRenderer: DateCellRenderer,
            cellStyle: {
                backgroundColor: theme === 'dark' ? '#343a40' : '#ffe5cc',
                textAlign: 'center',
                padding: '0'
            }
        },
        {
            headerName: "D3 Weight",
            field: "d3_weight",
            width: 120,
            minWidth: 100,
            cellRenderer: WeightCellRenderer,
            cellStyle: {
                backgroundColor: theme === 'dark' ? '#343a40' : '#ffe5cc',
                padding: '2px'
            }
        },
        // D4 Columns
        {
            headerName: "D4 Dispatch Date",
            field: "d4_date",
            width: 160,
            minWidth: 150,
            cellRenderer: DateCellRenderer,
            cellStyle: {
                backgroundColor: theme === 'dark' ? '#343a40' : '#ffe5cc',
                textAlign: 'center',
                padding: '0'
            }
        },
        {
            headerName: "D4 Weight",
            field: "d4_weight",
            width: 120,
            minWidth: 100,
            cellRenderer: WeightCellRenderer,
            cellStyle: {
                backgroundColor: theme === 'dark' ? '#343a40' : '#ffe5cc',
                padding: '2px'
            }
        },
        // D5 Columns
        {
            headerName: "D5 Dispatch Date",
            field: "d5_date",
            width: 160,
            minWidth: 150,
            cellRenderer: DateCellRenderer,
            cellStyle: {
                backgroundColor: theme === 'dark' ? '#343a40' : '#ffe5cc',
                textAlign: 'center',
                padding: '0'
            }
        },
        {
            headerName: "D5 Weight",
            field: "d5_weight",
            width: 120,
            minWidth: 100,
            cellRenderer: WeightCellRenderer,
            cellStyle: {
                backgroundColor: theme === 'dark' ? '#343a40' : '#ffe5cc',
                padding: '2px'
            }
        },
        // DF Columns
        {
            headerName: "DF Dispatch Date",
            field: "df_date",
            width: 160,
            minWidth: 150,
            cellRenderer: DateCellRenderer,
            cellStyle: {
                backgroundColor: theme === 'dark' ? '#343a40' : '#ffe5cc',
                textAlign: 'center',
                padding: '0'
            }
        },
        {
            headerName: "DF Weight",
            field: "df_weight",
            width: 120,
            minWidth: 100,
            cellRenderer: WeightCellRenderer,
            cellStyle: {
                backgroundColor: theme === 'dark' ? '#343a40' : '#ffe5cc',
                padding: '2px'
            }
        },
        // DP Columns
        {
            headerName: "DP Dispatch Date",
            field: "dp_date",
            width: 160,
            minWidth: 150,
            cellRenderer: DateCellRenderer,
            cellStyle: {
                backgroundColor: theme === 'dark' ? '#343a40' : '#ffe5cc',
                textAlign: 'center',
                padding: '0'
            }
        },
        {
            headerName: "DP Weight",
            field: "dp_weight",
            width: 120,
            minWidth: 100,
            cellRenderer: WeightCellRenderer,
            cellStyle: {
                backgroundColor: theme === 'dark' ? '#343a40' : '#ffe5cc',
                padding: '2px'
            }
        },
        // Action Column
        {
            headerName: "Action",
            field: "action",
            width: 110,
            minWidth: 100,
            pinned: 'right',
            cellRenderer: ActionCellRenderer,
            cellStyle: {
                textAlign: 'center',
                backgroundColor: theme === 'dark' ? '#495057' : '#fff3cd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            },
            editable: false
        }
    ];

    const defaultColDef = {
        sortable: true,
        resizable: true,
        suppressMenu: isMobile,
        filter: false,
        floatingFilter: false
    };

    // Fetch data from API
    const fetchDispatchData = async (type) => {
        setLoading(true);
        try {
            const apiUrl = type === 'S'
                ? 'https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/AddDispatchScheduleApi.php'
                : 'https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/AddDispatchScheduleSMApi.php';

            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    type: type
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.status === "success" && result.data) {
                const transformedData = result.data.map(item => ({
                    FILE_ID: item.FILE_ID,
                    fname: item.fname,
                    type: item.type,
                    d1_date: item.d1_date || '',
                    d1_weight: item.d1_weight || '',
                    d2_date: item.d2_date || '',
                    d2_weight: item.d2_weight || '',
                    d3_date: item.d3_date || '',
                    d3_weight: item.d3_weight || '',
                    d4_date: item.d4_date || '',
                    d4_weight: item.d4_weight || '',
                    d5_date: item.d5_date || '',
                    d5_weight: item.d5_weight || '',
                    df_date: item.df_date || '',
                    df_weight: item.df_weight || '',
                    dp_date: item.dp_date || '',
                    dp_weight: item.dp_weight || ''
                }));

                setRowData(transformedData);
                showToast(`Loaded ${transformedData.length} records for ${type === 'S' ? 'For S' : 'For SM'}`, 'success');
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error("Error fetching dispatch data:", error);
            showToast(`Error fetching data: ${error.message}`, 'error');
            setRowData([]);
        } finally {
            setLoading(false);
        }
    };

    // Save dispatch data
    const saveDispatchData = async (rowData) => {
        try {
            // Determine API URL based on active tab
            const apiUrl = activeTab === 'S'
                ? 'https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/SaveDispatchSApi.php'
                : 'https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/SaveDispatchSmApi.php';

            // Prepare payload
            const payload = {
                fileID: rowData.FILE_ID,
                date1: rowData.d1_date || '',
                dip1: rowData.d1_weight || '',
                date2: rowData.d2_date || '',
                dip2: rowData.d2_weight || '',
                date3: rowData.d3_date || '',
                dip3: rowData.d3_weight || '',
                date4: rowData.d4_date || '',
                dip4: rowData.d4_weight || '',
                date5: rowData.d5_date || '',
                dip5: rowData.d5_weight || '',
                date6: rowData.df_date || '',
                dip6: rowData.df_weight || '',
                date7: rowData.dp_date || '',
                dip7: rowData.dp_weight || ''
            };

            console.log('Saving dispatch data:', payload);

            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: 'include', // Include session cookies
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.status === "success") {
                showToast(`✅ ${result.message} - ${rowData.fname}`, 'success');
                console.log(result.message);
                // Optionally refresh the grid to show updated data
                setTimeout(() => {
                    fetchDispatchData(activeTab);
                }, 500);
            } else {
                throw new Error(result.message || 'Failed to save data');
            }
        } catch (error) {
            console.error("Error saving dispatch data:", error);
            showToast(`❌ Error: ${error.message}`, 'error');
        }
    };

    // Initialize data
    useEffect(() => {
        fetchDispatchData(activeTab);
    }, [activeTab]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        showToast(`Switched to ${tab === 'S' ? 'For S' : 'For SM'} tab`, 'info');
    };

    const downloadExcel = () => {
        if (!gridRef.current?.api) return;

        try {
            const params = {
                fileName: `Dispatch_Schedule_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`,
                allColumns: true,
                onlySelected: false,
                suppressQuotes: false,
                columnSeparator: ','
            };

            gridRef.current.api.exportDataAsCsv(params);
            showToast('Data exported successfully!', 'success');
        } catch (error) {
            console.error("Error exporting CSV:", error);
            showToast("Error exporting data", 'error');
        }
    };

    const refreshData = () => {
        fetchDispatchData(activeTab);
    };

    const showToast = (message, type = 'info') => {
        console.log(`[${type.toUpperCase()}] ${message}`);
    };

    const getThemeStyles = () => {
        if (theme === 'dark') {
            return {
                backgroundColor: '#21262d',
                color: '#f8f9fa',
                cardBg: '#343a40',
                cardHeader: '#495057',
                tabActiveBg: '#198754',
                tabInactiveBg: '#6c757d',
                buttonBg: '#495057',
                buttonHover: '#5a6268'
            };
        }
        return {
            backgroundColor: '#f8f9ff',
            color: '#212529',
            cardBg: '#ffffff',
            cardHeader: '#e9ecef',
            tabActiveBg: '#28a745',
            tabInactiveBg: '#dee2e6',
            buttonBg: '#e9ecef',
            buttonHover: '#dee2e6'
        };
    };

    const themeStyles = getThemeStyles();
    const gridHeight = isFullScreen ? 'calc(100vh - 240px)' : (isMobile ? '400px' : '600px');

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
                    <div style={{
                        width: '48px',
                        height: '48px',
                        border: '4px solid #28a745',
                        borderRightColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 16px'
                    }} />
                    <p style={{ margin: 0, fontSize: '16px' }}>Loading dispatch schedule data...</p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
            <div style={{ padding: isFullScreen ? 0 : '20px' }}>
                <div style={{
                    backgroundColor: themeStyles.cardBg,
                    color: themeStyles.color,
                    border: `1px solid ${theme === 'dark' ? '#495057' : '#dee2e6'}`,
                    borderRadius: isFullScreen ? 0 : '8px'
                }}>
                    {/* Header */}
                    <div style={{
                        background: themeStyles.cardHeader,
                        padding: '16px 32px',
                        borderBottom: `1px solid ${theme === 'dark' ? '#495057' : '#dee2e6'}`
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                            <div>
                                <h4 style={{ margin: '0 0 8px 0', fontSize: '20px' }}>{formTitle}</h4>
                                <small style={{ opacity: 0.8 }}>
                                    {rowData.length} records loaded
                                </small>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                <button
                                    onClick={downloadExcel}
                                    style={{
                                        padding: '8px 16px',
                                        background: '#28a745',
                                        border: 'none',
                                        borderRadius: '4px',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                    title="Download CSV"
                                >
                                    📥 Export CSV
                                </button>
                                <button
                                    onClick={refreshData}
                                    style={{
                                        padding: '8px 16px',
                                        background: '#0d6efd',
                                        border: 'none',
                                        borderRadius: '4px',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                    title="Refresh Data"
                                >
                                    🔄 Refresh
                                </button>
                                <button
                                    onClick={toggleFullScreen}
                                    style={{
                                        padding: '8px 16px',
                                        background: themeStyles.buttonBg,
                                        border: `1px solid ${theme === 'dark' ? '#495057' : '#dee2e6'}`,
                                        borderRadius: '4px',
                                        color: themeStyles.color,
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                    title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
                                >
                                    {isFullScreen ? '⛶ Exit' : '⛶ Full'}
                                </button>
                                <button
                                    onClick={toggleTheme}
                                    style={{
                                        padding: '8px 16px',
                                        background: themeStyles.buttonBg,
                                        border: `1px solid ${theme === 'dark' ? '#495057' : '#dee2e6'}`,
                                        borderRadius: '4px',
                                        color: themeStyles.color,
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                    title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
                                >
                                    {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div style={{
                        backgroundColor: themeStyles.cardBg,
                        borderBottom: `1px solid ${theme === 'dark' ? '#495057' : '#dee2e6'}`,
                        padding: '8px 32px'
                    }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => handleTabChange('S')}
                                style={{
                                    padding: '8px 24px',
                                    fontWeight: activeTab === 'S' ? 'bold' : 'normal',
                                    backgroundColor: activeTab === 'S' ? themeStyles.tabActiveBg : 'transparent',
                                    border: `1px solid ${activeTab === 'S' ? themeStyles.tabActiveBg : themeStyles.tabInactiveBg}`,
                                    borderRadius: '4px',
                                    color: activeTab === 'S' ? 'white' : themeStyles.color,
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                For S
                            </button>
                            <button
                                onClick={() => handleTabChange('SM')}
                                style={{
                                    padding: '8px 24px',
                                    fontWeight: activeTab === 'SM' ? 'bold' : 'normal',
                                    backgroundColor: activeTab === 'SM' ? themeStyles.tabActiveBg : 'transparent',
                                    border: `1px solid ${activeTab === 'SM' ? themeStyles.tabActiveBg : themeStyles.tabInactiveBg}`,
                                    borderRadius: '4px',
                                    color: activeTab === 'SM' ? 'white' : themeStyles.color,
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                For SM
                            </button>
                        </div>
                    </div>

                    {/* Grid Body */}
                    <div style={{
                        backgroundColor: themeStyles.cardBg,
                        padding: isFullScreen ? 0 : '15px'
                    }}>
                        {rowData.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '50px',
                                color: themeStyles.color
                            }}>
                                <div style={{ fontSize: '48px', marginBottom: '20px' }}>📭</div>
                                <h5>No dispatch schedule data available</h5>
                                <p>Please check your data source.</p>
                            </div>
                        ) : (
                            <div style={{ height: gridHeight, backgroundColor: 'white', border: '1px solid #ddd' }}>
                                <style>
                                    {`
                                        .ag-theme-alpine .ag-header-cell {
                                            font-size: ${isMobile ? '10px' : '12px'} !important;
                                            font-weight: bold !important;
                                        }
                                        .ag-theme-alpine .ag-cell {
                                            font-size: ${isMobile ? '9px' : '11px'} !important;
                                        }
                                        ${theme === 'dark' ? `
                                            .ag-theme-alpine {
                                                --ag-background-color: #212529;
                                                --ag-header-background-color: #343a40;
                                                --ag-odd-row-background-color: #2c3034;
                                                --ag-foreground-color: #f8f9fa;
                                                --ag-header-foreground-color: #f8f9fa;
                                                --ag-border-color: #495057;
                                                --ag-row-hover-color: #495057;
                                            }
                                        ` : ''}
                                    `}
                                </style>
                                <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' }}>
                                    <AgGridReact
                                        ref={gridRef}
                                        rowData={rowData}
                                        columnDefs={columnDefs}
                                        defaultColDef={defaultColDef}
                                        pagination={true}
                                        paginationPageSize={isMobile ? 10 : 50}
                                        suppressMovableColumns={true}
                                        animateRows={!isMobile}
                                        enableCellTextSelection={true}
                                        suppressHorizontalScroll={false}
                                        headerHeight={isMobile ? 35 : 40}
                                        rowHeight={isMobile ? 32 : 38}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DispatchScheduleGrid;