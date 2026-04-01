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

const GrnListGrid = () => {
    const [theme, setTheme] = useState('light');
    const [activeTab, setActiveTab] = useState('raw');
    const [rowData, setRowData] = useState([]);
    const [columnDefs, setColumnDefs] = useState([]);
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const gridRef = useRef();

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

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const generateRawColumnDefs = () => {
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
                field: "po_id",
                headerName: "PO ID",
                width: isMobile ? 150 : 180,
                pinned: 'left',
                checkboxSelection: true,
                headerCheckboxSelection: true,
                cellStyle: { fontWeight: 'bold' }
            },
            {
                field: "po_date",
                headerName: "PO Date",
                width: isMobile ? 120 : 140,
                cellStyle: { textAlign: 'center' },
                filter: 'agDateColumnFilter'
            },
            {
                field: "supplier_name",
                headerName: "Supplier Name",
                width: isMobile ? 200 : 280,
                cellStyle: { textAlign: 'left' }
            },
            {
                field: "grn_id",
                headerName: "GRN ID",
                width: isMobile ? 140 : 160,
                cellStyle: { textAlign: 'center', fontWeight: '600' }
            },
            {
                field: "files",
                headerName: "Files",
                width: isMobile ? 120 : 150,
                cellStyle: { textAlign: 'center' },
                valueGetter: (params) => {
                    return Array.isArray(params.data.files) ? params.data.files.join(', ') : params.data.files;
                }
            },
            {
                field: "po_status",
                headerName: "Status",
                width: isMobile ? 100 : 120,
                cellStyle: { textAlign: 'center' },
                cellRenderer: (params) => {
                    const status = params.value === "1" ? "Active" : "Inactive";
                    const color = params.value === "1" ? "#28a745" : "#dc3545";
                    return `<span style="color: ${color}; font-weight: bold;">${status}</span>`;
                }
            }
        ];
    };

    const generateAssemblyColumnDefs = () => {
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
                field: "dc_id",
                headerName: "DC ID",
                width: isMobile ? 150 : 180,
                pinned: 'left',
                checkboxSelection: true,
                headerCheckboxSelection: true,
                cellStyle: { fontWeight: 'bold' }
            },
            {
                field: "dc_date",
                headerName: "DC Date",
                width: isMobile ? 120 : 140,
                cellStyle: { textAlign: 'center' },
                filter: 'agDateColumnFilter'
            },
            {
                field: "vendor_name",
                headerName: "Vendor Name",
                width: isMobile ? 200 : 280,
                cellStyle: { textAlign: 'left' }
            },
            {
                field: "files",
                headerName: "Files",
                width: isMobile ? 180 : 220,
                cellStyle: { textAlign: 'center' },
                valueGetter: (params) => {
                    return Array.isArray(params.data.files) ? params.data.files.join(', ') : params.data.files;
                }
            }
        ];
    };

    const defaultColDef = useMemo(() => ({
        filter: true,
        sortable: true,
        floatingFilter: !isMobile,
        resizable: true,
        suppressMenu: isMobile,
        cellStyle: { textAlign: 'right' }
    }), [isMobile]);

    const fetchRawGrnData = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/GrnRawListApi.php",
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
                showToast(`Loaded ${data.count || data.data.length} raw GRN records`, 'success');
            } else if (Array.isArray(data)) {
                setRowData(data);
                showToast(`Loaded ${data.length} raw GRN records`, 'success');
            } else {
                setRowData([]);
                showToast('No raw GRN data found', 'info');
            }
        } catch (error) {
            console.error("Error fetching raw GRN data:", error);
            showToast(`Error fetching data: ${error.message}`, 'error');
            setRowData([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchAssemblyGrnData = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/GrnAsslyListApi.php",
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
                showToast(`Loaded ${data.count || data.data.length} assembly GRN records`, 'success');
            } else if (Array.isArray(data)) {
                setRowData(data);
                showToast(`Loaded ${data.length} assembly GRN records`, 'success');
            } else {
                setRowData([]);
                showToast('No assembly GRN data found', 'info');
            }
        } catch (error) {
            console.error("Error fetching assembly GRN data:", error);
            showToast(`Error fetching data: ${error.message}`, 'error');
            setRowData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'raw') {
            setColumnDefs(generateRawColumnDefs());
            fetchRawGrnData();
        } else {
            setColumnDefs(generateAssemblyColumnDefs());
            fetchAssemblyGrnData();
        }
    }, [activeTab, isMobile]);

    const onSelectionChanged = (event) => {
        const selectedNodes = event.api.getSelectedNodes();
        const selectedData = selectedNodes.map(node => node.data);
        setSelectedRows(selectedData);

        if (selectedData.length === 1) {
            const selectedRecord = selectedData[0];

            if (activeTab === 'raw') {
                if (!selectedRecord.po_id) {
                    showToast('PO ID not found in selected record', 'error');
                    return;
                }

                // Check if po_status is "1" (yellow row)
                if (selectedRecord.po_status === "1") {
                    // Navigate to create page for status "1"
                    const createUrl = `#/grn/create/${selectedRecord.po_id}`;
                    window.open(createUrl, '_blank');
                    showToast(`Opening GRN create page for PO ${selectedRecord.po_id}`, 'info');
                } else {
                    // Navigate to details page for other statuses
                    const detailsUrl = `#/grn/raw/details/${selectedRecord.po_id}`;
                    window.open(detailsUrl, '_blank');
                    showToast(`Opening details for PO ${selectedRecord.po_id}`, 'info');
                }
            } else {
                if (!selectedRecord.dc_id) {
                    showToast('DC ID not found in selected record', 'error');
                    return;
                }

                const detailsUrl = `#/grn/assembly/details/${selectedRecord.dc_id}`;
                window.open(detailsUrl, '_blank');
                showToast(`Opening details for DC ${selectedRecord.dc_id}`, 'info');
            }
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSelectedRows([]);
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
                fileName: `GRN_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`,
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

    const handleRefresh = () => {
        if (activeTab === 'raw') {
            fetchRawGrnData();
        } else {
            fetchAssemblyGrnData();
        }
        showToast('Refreshing data...', 'info');
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
    const gridHeight = isFullScreen ? 'calc(100vh - 300px)' : (isMobile ? '400px' : '600px');

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
                    <p style={{ marginTop: '1rem' }}>Loading GRN data...</p>
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
                <div style={{
                    backgroundColor: themeStyles.cardBg,
                    color: themeStyles.color,
                    border: theme === 'dark' ? '1px solid #495057' : '1px solid #dee2e6',
                    borderRadius: isFullScreen ? 0 : '8px',
                    overflow: 'hidden'
                }}>
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
                                    GRN List - {activeTab === 'raw' ? 'Raw Materials' : 'Assembly'}
                                </h4>
                                <small style={{ opacity: 0.8 }}>
                                    {`${rowData.length} records found`}
                                    {selectedRows.length > 0 && ` | ${selectedRows.length} selected`}
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
                                    onClick={downloadExcel}
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
                                    onClick={autoSizeAll}
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
                                    onClick={toggleFullScreen}
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
                                    {isFullScreen ? '🗗' : '🗖'} {!isMobile && (isFullScreen ? 'Exit' : 'Full')}
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

                    <div style={{
                        display: 'flex',
                        backgroundColor: theme === 'dark' ? '#2c3034' : '#f8f9fa',
                        borderBottom: theme === 'dark' ? '1px solid #495057' : '1px solid #dee2e6'
                    }}>
                        <button
                            onClick={() => handleTabChange('raw')}
                            style={{
                                flex: 1,
                                padding: '1rem 2rem',
                                fontSize: '1rem',
                                fontWeight: activeTab === 'raw' ? 'bold' : 'normal',
                                border: 'none',
                                borderBottom: activeTab === 'raw' ? '3px solid #007bff' : 'none',
                                backgroundColor: activeTab === 'raw' ? themeStyles.cardBg : 'transparent',
                                color: activeTab === 'raw' ? '#007bff' : themeStyles.color,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            🔧 Raw Materials
                        </button>
                        <button
                            onClick={() => handleTabChange('assembly')}
                            style={{
                                flex: 1,
                                padding: '1rem 2rem',
                                fontSize: '1rem',
                                fontWeight: activeTab === 'assembly' ? 'bold' : 'normal',
                                border: 'none',
                                borderBottom: activeTab === 'assembly' ? '3px solid #007bff' : 'none',
                                backgroundColor: activeTab === 'assembly' ? themeStyles.cardBg : 'transparent',
                                color: activeTab === 'assembly' ? '#007bff' : themeStyles.color,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            ⚙️ Assembly
                        </button>
                    </div>

                    <div style={{
                        backgroundColor: themeStyles.cardBg,
                        padding: isFullScreen ? 0 : '15px'
                    }}>
                        {rowData.length === 0 && !loading ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '50px',
                                color: themeStyles.color
                            }}>
                                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📦</div>
                                <h5>No {activeTab === 'raw' ? 'Raw Material' : 'Assembly'} GRN data available</h5>
                                <p>Try refreshing to load data.</p>
                                <button
                                    onClick={handleRefresh}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        fontSize: '1rem',
                                        borderRadius: '0.25rem',
                                        border: 'none',
                                        backgroundColor: '#007bff',
                                        color: 'white',
                                        cursor: 'pointer',
                                        marginTop: '1rem'
                                    }}
                                >
                                    🔄 Refresh Data
                                </button>
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
                                    rowData={rowData}
                                    columnDefs={columnDefs}
                                    defaultColDef={defaultColDef}
                                    pagination={true}
                                    paginationPageSize={isMobile ? 10 : 25}
                                    rowSelection="single"
                                    onSelectionChanged={onSelectionChanged}
                                    suppressMovableColumns={isMobile}
                                    enableRangeSelection={!isMobile}
                                    rowMultiSelectWithClick={false}
                                    animateRows={!isMobile}
                                    enableCellTextSelection={true}
                                    suppressHorizontalScroll={false}
                                    headerHeight={isMobile ? 40 : 48}
                                    rowHeight={isMobile ? 35 : 42}
                                    getRowStyle={(params) => {
                                        if (activeTab === 'raw' && params.data.po_status === "1") {
                                            return { 
                                                backgroundColor: theme === 'dark' ? '#5c5c00' : '#fff9c4',
                                                fontWeight: '500'
                                            };
                                        }
                                        return null;
                                    }}
                                    onGridReady={(params) => {
                                        console.log('GRN Grid is ready');
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

export default GrnListGrid;