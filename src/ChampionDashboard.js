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

const ChampionDashboard = () => {
    const [theme, setTheme] = useState('light');
    const [rowData, setRowData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const gridRef = useRef();

    const formTitle = "Champion Dashboard - Total Weight KG";

    // Fetch data from API
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await fetch("http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/champion/ChampionDashboardListApi.php");
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.status === 'success' && Array.isArray(result.data)) {
                setRowData(result.data);
                console.log(`Loaded ${result.data.length} records`);
            } else {
                console.warn("No data received or invalid response format:", result);
                setRowData([]);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setRowData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Dropdown renderer component
    const DropdownRenderer = (props) => {
        const { value, data, colDef, node, api } = props;
        const options = colDef.cellEditorParams?.values || [];

        const handleChange = (e) => {
            const newValue = e.target.value;
            node.setDataValue(colDef.field, newValue);
            api.refreshCells({ rowNodes: [node], columns: [colDef.field] });
        };

        return (
            <select
                value={value || options[0] || ""}
                onChange={handleChange}
                style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    backgroundColor: "transparent",
                    fontSize: "11px",
                    outline: "none",
                    padding: "0 4px"
                }}
            >
                {options.map((option, index) => (
                    <option key={index} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        );
    };

    // Editable input cell
    const EditableInputCell = (props) => {
        const { value, node, colDef, api } = props;
        const [inputValue, setInputValue] = useState(value || "");

        useEffect(() => {
            setInputValue(value || "");
        }, [value]);

        const handleChange = (e) => {
            const newValue = e.target.value;
            setInputValue(newValue);
            node.setDataValue(colDef.field, newValue);
            api.refreshCells({ rowNodes: [node], columns: [colDef.field] });
        };

        return (
            <input
                type="text"
                value={inputValue}
                onChange={handleChange}
                style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    borderRadius: "0",
                    padding: "4px",
                    textAlign: "center",
                    fontSize: "11px",
                    backgroundColor: "transparent",
                    outline: "none"
                }}
            />
        );
    };

    // Date renderer
    const DateRenderer = (props) => {
        const { value, node, colDef, api } = props;

        const formatDateForInput = (dateStr) => {
            if (!dateStr) return "";
            if (dateStr.includes("-")) {
                const parts = dateStr.split("-");
                if (parts[0].length === 4) {
                    return dateStr;
                } else {
                    return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
                }
            }
            return "";
        };

        const handleDateChange = (e) => {
            const newDate = e.target.value;
            node.setDataValue(colDef.field, newDate);
            api.refreshCells({ rowNodes: [node], columns: [colDef.field] });
        };

        return (
            <input
                type="date"
                value={formatDateForInput(value)}
                onChange={handleDateChange}
                style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    backgroundColor: "transparent",
                    fontSize: "11px",
                    outline: "none",
                    textAlign: "center",
                    padding: "0 4px"
                }}
            />
        );
    };

    // Save button renderer
    const SaveButtonRenderer = (params) => {
        const handleSave = async () => {
            try {
                const button = document.getElementById(`save-btn-${params.node.rowIndex}`);
                
                // Show loading state
                if (button) {
                    button.disabled = true;
                    button.style.background = '#ffc107';
                    button.innerHTML = '⏳';
                }

                console.log('Saving data for:', params.data);

                // Format dates for API
                const formatDateForAPI = (dateStr) => {
                    if (!dateStr) return '';
                    if (dateStr.includes('-')) {
                        const parts = dateStr.split('-');
                        if (parts[0].length === 4) {
                            return dateStr;
                        } else {
                            return `${parts[2]}-${parts[1]}-${parts[0]}`;
                        }
                    }
                    return dateStr;
                };

                // Prepare payload
                const payload = {
                    file: params.data.FILE_ID || '',
                    material_received_status: params.data.material_received_status || '',
                    current_work: params.data.current_work || '',
                    startDate: formatDateForAPI(params.data.start_date),
                    fab: params.data.fab || '0',
                    fnd: params.data.fnd || '0',
                    finish: params.data.finish || '0',
                    fatDate: formatDateForAPI(params.data.fat_date),
                    dispatch: formatDateForAPI(params.data.dispatch_date),
                    remark: params.data.remark || '',
                    status: params.data.status || ''
                };

                console.log('Sending payload to API:', payload);

                // Call save API
                const response = await fetch('http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/champion/saveChampionDashboardApi.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();
                console.log('API Response:', result);

                if (result.status === 'success') {
                    // Show success state
                    if (button) {
                        button.style.background = '#28a745';
                        button.innerHTML = '✓';
                        button.disabled = false;
                        
                        // Reset button after 2 seconds
                        setTimeout(() => {
                            button.style.background = '#4CAF50';
                            button.innerHTML = 'Save';
                        }, 2000);
                    }
                    
                    console.log('✅ Data saved successfully');
                } else {
                    throw new Error(result.message || 'Save failed');
                }
            } catch (error) {
                console.error('❌ Error saving data:', error);
                
                // Show error state
                const button = document.getElementById(`save-btn-${params.node.rowIndex}`);
                if (button) {
                    button.style.background = '#dc3545';
                    button.innerHTML = '✗';
                    button.disabled = false;
                    
                    // Reset button after 2 seconds
                    setTimeout(() => {
                        button.style.background = '#4CAF50';
                        button.innerHTML = 'Save';
                    }, 2000);
                }
                
                alert('Error saving data: ' + error.message);
            }
        };

        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                height: '100%',
                justifyContent: 'center'
            }}>
                <button
                    id={`save-btn-${params.node.rowIndex}`}
                    onClick={handleSave}
                    style={{
                        background: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '5px 10px',
                        fontSize: '10px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        minWidth: '50px'
                    }}
                >
                    Save
                </button>
            </div>
        );
    };

    // Column definitions matching the screenshot
    const columnDefs = [
        {
            headerName: "SR.NO.",
            field: "count",
            valueGetter: (params) => params.node ? params.node.rowIndex + 1 : '',
            width: 80,
            minWidth: 70,
            pinned: 'left',
            lockPosition: true,
            cellStyle: { fontWeight: 'bold', textAlign: 'center', backgroundColor: '#f8f9fa' },
            filter: false
        },
        {
            headerName: "File Name",
            field: "file_name",
            filter: "agTextColumnFilter",
            floatingFilter: true,
            width: 150,
            minWidth: 130,
            pinned: 'left',
            cellStyle: { fontWeight: 'bold', backgroundColor: '#ffcdd2' }
        },
        {
            headerName: "Type",
            field: "product_Type",
            filter: "agTextColumnFilter",
            floatingFilter: true,
            width: 100,
            minWidth: 90,
            cellStyle: { backgroundColor: '#fff9c4', textAlign: 'center' }
        },
        {
            headerName: "Material Received",
            field: "material_received_status",
            width: 120,
            cellRenderer: DropdownRenderer,
            cellEditorParams: {
                values: ["Yes", "No"]
            },
            cellStyle: { backgroundColor: '#fff', padding: '0', textAlign: 'center' }
        },
        {
            headerName: "Current Work",
            field: "current_work",
            width: 150,
            cellRenderer: DropdownRenderer,
            cellEditorParams: {
                values: [
                    "Select Current Work",
                    "Fabrication",
                    "Foundation",
                    "Fabrication-Foun...",
                    "Assembly",
                    "Painting",
                    "Quality Check",
                    "Packing"
                ]
            },
            cellStyle: { backgroundColor: '#fff', padding: '0' }
        },
        {
            headerName: "Start Date",
            field: "start_date",
            width: 130,
            cellRenderer: DateRenderer,
            filter: "agDateColumnFilter",
            floatingFilter: true,
            cellStyle: { padding: '0', textAlign: 'center' }
        },
        {
            headerName: "FAB",
            field: "fab",
            width: 100,
            cellRenderer: EditableInputCell,
            cellStyle: { padding: '0', textAlign: 'center' }
        },
        {
            headerName: "FND",
            field: "fnd",
            width: 100,
            cellRenderer: EditableInputCell,
            cellStyle: { padding: '0', textAlign: 'center' }
        },
        {
            headerName: "Finish %",
            field: "finish",
            width: 100,
            cellRenderer: EditableInputCell,
            cellStyle: { padding: '0', textAlign: 'center' }
        },
        {
            headerName: "FAT Date",
            field: "fat_date",
            width: 130,
            cellRenderer: DateRenderer,
            filter: "agDateColumnFilter",
            floatingFilter: true,
            cellStyle: { padding: '0', textAlign: 'center' }
        },
        {
            headerName: "Dispatch Date",
            field: "dispatch_date",
            width: 130,
            cellRenderer: DateRenderer,
            filter: "agDateColumnFilter",
            floatingFilter: true,
            cellStyle: { padding: '0', textAlign: 'center' }
        },
        {
            headerName: "Remark",
            field: "remark",
            width: 120,
            cellRenderer: DropdownRenderer,
            cellEditorParams: {
                values: ["Select Remark", "Complete", "In Process", "Pending"]
            },
            cellStyle: { backgroundColor: '#fff', padding: '0' }
        },
        {
            headerName: "Status",
            field: "status",
            width: 140,
            cellRenderer: DropdownRenderer,
            cellEditorParams: {
                values: ["Select Remark", "RFD", "Dispatch", "Active", "Complete"]
            },
            cellStyle: { backgroundColor: '#fff', padding: '0' }
        },
        {
            headerName: "Action",
            field: "action",
            width: 90,
            cellRenderer: SaveButtonRenderer,
            cellStyle: { textAlign: 'center', padding: '2px' },
            filter: false,
            sortable: false,
            pinned: 'right'
        }
    ];

    const defaultColDef = {
        filter: true,
        sortable: true,
        resizable: true,
        cellStyle: { fontSize: '11px', textAlign: 'right' }
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
                fileName: `Champion_Dashboard_${new Date().toISOString().split('T')[0]}.csv`,
                allColumns: true
            };
            gridRef.current.api.exportDataAsCsv(params);
        } catch (error) {
            console.error("Error exporting CSV:", error);
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
    const gridHeight = isFullScreen ? 'calc(100vh - 180px)' : '600px';

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
                    <div style={{
                        width: '3rem',
                        height: '3rem',
                        border: '4px solid #f3f3f3',
                        borderTop: '4px solid #007bff',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto'
                    }}></div>
                    <p style={{ marginTop: '1rem' }}>Loading dashboard data...</p>
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); }}`}</style>
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
            <div className={`container-fluid ${isFullScreen ? 'p-0' : ''}`}>
                <div style={{
                    backgroundColor: themeStyles.cardBg,
                    color: themeStyles.color,
                    border: theme === 'dark' ? '1px solid #495057' : '1px solid #dee2e6',
                    margin: isFullScreen ? 0 : 20,
                    borderRadius: isFullScreen ? 0 : 8
                }}>
                    {/* Header */}
                    <div style={{
                        background: themeStyles.cardHeader,
                        color: theme === 'dark' ? '#ffffff' : '#000000',
                        padding: '1rem 2rem',
                        borderBottom: '1px solid #dee2e6'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                                <h4 style={{ margin: 0 }}>{formTitle}</h4>
                                <small style={{ opacity: 0.8 }}>
                                    {rowData.length} records found
                                </small>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                <button
                                    onClick={downloadExcel}
                                    style={{
                                        padding: '6px 12px',
                                        fontSize: '12px',
                                        background: '#28a745',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    📊 Export CSV
                                </button>
                                <button
                                    onClick={autoSizeAll}
                                    style={{
                                        padding: '6px 12px',
                                        fontSize: '12px',
                                        background: '#17a2b8',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    ↔️ Auto Size
                                </button>
                                <button
                                    onClick={toggleFullScreen}
                                    style={{
                                        padding: '6px 12px',
                                        fontSize: '12px',
                                        background: '#6c757d',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {isFullScreen ? '⛶ Exit' : '⛶ Full'}
                                </button>
                                <button
                                    onClick={toggleTheme}
                                    style={{
                                        padding: '6px 12px',
                                        fontSize: '12px',
                                        background: '#6c757d',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Grid Body */}
                    <div style={{
                        backgroundColor: themeStyles.cardBg,
                        padding: isFullScreen ? 0 : 15
                    }}>
                        <div style={{ height: gridHeight, backgroundColor: 'white' }}>
                            <style>
                                {`
                                    .ag-theme-alpine .ag-header-cell {
                                        font-size: 11px !important;
                                        font-weight: bold !important;
                                        background-color: #f8f9fa !important;
                                    }
                                    .ag-theme-alpine .ag-cell {
                                        font-size: 11px !important;
                                        border-right: 1px solid #ddd !important;
                                    }
                                    .ag-theme-alpine .ag-row {
                                        border-bottom: 1px solid #ddd !important;
                                    }
                                    ${theme === 'dark' ? `
                                        .ag-theme-alpine {
                                            --ag-background-color: #212529;
                                            --ag-header-background-color: #343a40;
                                            --ag-odd-row-background-color: #2c3034;
                                            --ag-foreground-color: #f8f9fa;
                                            --ag-border-color: #495057;
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
                                    paginationPageSize={20}
                                    suppressMovableColumns={false}
                                    animateRows={true}
                                    enableCellTextSelection={true}
                                    headerHeight={35}
                                    rowHeight={32}
                                    onGridReady={(params) => {
                                        console.log('Grid is ready');
                                        setTimeout(() => autoSizeAll(), 500);
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{
                        backgroundColor: themeStyles.cardBg,
                        borderTop: '1px solid #ddd',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '12px',
                        padding: '10px 20px',
                        flexWrap: 'wrap',
                        gap: '10px'
                    }}>
                        <div>
                            Page Size:
                            <select style={{
                                marginLeft: '8px',
                                padding: '4px',
                                fontSize: '12px',
                                border: '1px solid #ddd',
                                borderRadius: '4px'
                            }}>
                                <option>10</option>
                                <option defaultValue>20</option>
                                <option>50</option>
                            </select>
                        </div>
                        <div>
                            1 to {Math.min(20, rowData.length)} of {rowData.length}
                        </div>
                        <div>
                            Page 1 of {Math.ceil(rowData.length / 20)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChampionDashboard;