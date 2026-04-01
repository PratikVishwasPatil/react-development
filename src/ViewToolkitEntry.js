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

const ToolkitManagement = () => {
    const [theme, setTheme] = useState('light');
    const [activeTab, setActiveTab] = useState('inward');
    const [inwardData, setInwardData] = useState([]);
    const [outwardData, setOutwardData] = useState([]);
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [inwardTotal, setInwardTotal] = useState(0);
    const [outwardTotal, setOutwardTotal] = useState(0);
    const [toasts, setToasts] = useState([]);
    const gridRef = useRef();

    const showToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const inwardColumnDefs = useMemo(() => [
        {
            headerName: "Sr No",
            field: "sr_no",
            width: isMobile ? 80 : 100,
            pinned: 'left',
            lockPosition: true,
            cellStyle: { fontWeight: 'bold', textAlign: 'right' },
            checkboxSelection: true,
            headerCheckboxSelection: true
        },
        {
            field: "id",
            headerName: "ID",
            width: isMobile ? 100 : 120,
            cellStyle: { fontWeight: '700', color: '#2563eb' }
        },
        {
            field: "material_description",
            headerName: "Material Description",
            width: isMobile ? 200 : 300,
            cellStyle: { fontWeight: '600' }
        },
        {
            field: "quantityinward",
            headerName: "Quantity Inward",
            width: isMobile ? 140 : 160,
            cellStyle: { textAlign: 'right', fontWeight: '600', color: '#059669' }
        },
        {
            field: "chalan_no",
            headerName: "Challan No",
            width: isMobile ? 120 : 140,
            cellStyle: { textAlign: 'right' }
        },
        {
            field: "chalan_date",
            headerName: "Challan Date",
            width: isMobile ? 130 : 150,
            cellStyle: { textAlign: 'right' }
        },
        {
            field: "date",
            headerName: "Date",
            width: isMobile ? 130 : 150,
            cellStyle: { textAlign: 'right', backgroundColor: '#fef3c7' }
        },
        {
            field: "received_by",
            headerName: "Received By",
            width: isMobile ? 150 : 180
        },
        {
            field: "issued_by",
            headerName: "Issued By",
            width: isMobile ? 150 : 180
        }
    ], [isMobile]);

    const outwardColumnDefs = useMemo(() => [
        {
            headerName: "Sr No",
            field: "sr_no",
            width: isMobile ? 80 : 100,
            pinned: 'left',
            lockPosition: true,
            cellStyle: { fontWeight: 'bold', textAlign: 'right' },
            checkboxSelection: true,
            headerCheckboxSelection: true
        },
        {
            field: "id",
            headerName: "ID",
            width: isMobile ? 100 : 120,
            cellStyle: { fontWeight: '700', color: '#2563eb' }
        },
        {
            field: "FILE_NAME",
            headerName: "File Name",
            width: isMobile ? 160 : 200,
            cellStyle: { fontWeight: '600', backgroundColor: '#dbeafe' }
        },
        {
            field: "material_description",
            headerName: "Material Description",
            width: isMobile ? 200 : 300,
            cellStyle: { fontWeight: '600' }
        },
        {
            field: "quantityoutward",
            headerName: "Quantity Outward",
            width: isMobile ? 150 : 170,
            cellStyle: { textAlign: 'right', fontWeight: '600', color: '#dc2626' }
        },
        {
            field: "req_no",
            headerName: "Req No",
            width: isMobile ? 100 : 120,
            cellStyle: { textAlign: 'right' }
        },
        {
            field: "req_date",
            headerName: "Req Date",
            width: isMobile ? 130 : 150,
            cellStyle: { textAlign: 'right' }
        },
        {
            field: "date",
            headerName: "Date",
            width: isMobile ? 130 : 150,
            cellStyle: { textAlign: 'right', backgroundColor: '#fef3c7' }
        },
        {
            field: "received_by",
            headerName: "Received By",
            width: isMobile ? 180 : 220
        },
        {
            field: "issued_by",
            headerName: "Issued By",
            width: isMobile ? 180 : 220
        }
    ], [isMobile]);

    const defaultColDef = useMemo(() => ({
        filter: true,
        sortable: true,
        floatingFilter: !isMobile,
        resizable: true,
        suppressMenu: isMobile,
        cellStyle: { textAlign: 'right' }
    }), [isMobile]);

    const fetchInwardData = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                'https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/inwardToolkitApi.php'
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.status && Array.isArray(data.data)) {
                setInwardData(data.data);
                setInwardTotal(data.total_records || data.data.length);
                showToast(`Loaded ${data.data.length} inward records`, 'success');
            } else {
                throw new Error("Failed to fetch inward data");
            }
        } catch (error) {
            console.error("Error fetching inward data:", error);
            showToast(`Error fetching inward data: ${error.message}`, 'error');
            setInwardData([]);
            setInwardTotal(0);
        } finally {
            setLoading(false);
        }
    };

    const fetchOutwardData = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                'https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/outwardToolkitApi.php'
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.status && Array.isArray(data.data)) {
                setOutwardData(data.data);
                setOutwardTotal(data.total_records || data.data.length);
                showToast(`Loaded ${data.data.length} outward records`, 'success');
            } else {
                throw new Error("Failed to fetch outward data");
            }
        } catch (error) {
            console.error("Error fetching outward data:", error);
            showToast(`Error fetching outward data: ${error.message}`, 'error');
            setOutwardData([]);
            setOutwardTotal(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInwardData();
        fetchOutwardData();
    }, []);

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
                fileName: `Toolkit_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`,
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
        if (activeTab === 'inward') {
            fetchInwardData();
        } else {
            fetchOutwardData();
        }
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
    const gridHeight = isFullScreen ? 'calc(100vh - 240px)' : (isMobile ? '400px' : '600px');
    const currentData = activeTab === 'inward' ? inwardData : outwardData;
    const currentTotal = activeTab === 'inward' ? inwardTotal : outwardTotal;
    const currentColumns = activeTab === 'inward' ? inwardColumnDefs : outwardColumnDefs;

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

    if (loading && currentData.length === 0) {
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
                        width: '3rem',
                        height: '3rem',
                        border: '4px solid rgba(37, 99, 235, 0.2)',
                        borderTopColor: '#2563eb',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto'
                    }} />
                    <p style={{ marginTop: '1rem', fontWeight: '600' }}>Loading toolkit data...</p>
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
                                    🔧 Toolkit Management System
                                </h4>
                                <small style={{ opacity: 0.8, display: 'block', marginTop: '0.5rem', fontSize: '0.95rem' }}>
                                    {currentTotal} total records | {currentData.length} loaded
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

                    {/* Tabs */}
                    <div style={{
                        display: 'flex',
                        borderBottom: theme === 'dark' ? '2px solid #334155' : '2px solid #e2e8f0',
                        backgroundColor: theme === 'dark' ? '#0f172a' : '#f8fafc'
                    }}>
                        <button
                            onClick={() => setActiveTab('inward')}
                            style={{
                                flex: 1,
                                padding: '1rem 2rem',
                                fontSize: '1rem',
                                fontWeight: '700',
                                border: 'none',
                                cursor: 'pointer',
                                backgroundColor: activeTab === 'inward' 
                                    ? (theme === 'dark' ? '#1e293b' : '#ffffff')
                                    : 'transparent',
                                color: activeTab === 'inward'
                                    ? '#10b981'
                                    : (theme === 'dark' ? '#94a3b8' : '#64748b'),
                                borderBottom: activeTab === 'inward' ? '3px solid #10b981' : 'none',
                                transition: 'all 0.3s'
                            }}
                        >
                            📥 Inward ({inwardTotal})
                        </button>
                        <button
                            onClick={() => setActiveTab('outward')}
                            style={{
                                flex: 1,
                                padding: '1rem 2rem',
                                fontSize: '1rem',
                                fontWeight: '700',
                                border: 'none',
                                cursor: 'pointer',
                                backgroundColor: activeTab === 'outward'
                                    ? (theme === 'dark' ? '#1e293b' : '#ffffff')
                                    : 'transparent',
                                color: activeTab === 'outward'
                                    ? '#dc2626'
                                    : (theme === 'dark' ? '#94a3b8' : '#64748b'),
                                borderBottom: activeTab === 'outward' ? '3px solid #dc2626' : 'none',
                                transition: 'all 0.3s'
                            }}
                        >
                            📤 Outward ({outwardTotal})
                        </button>
                    </div>

                    {/* Grid */}
                    <div style={{
                        backgroundColor: themeStyles.cardBg,
                        padding: isFullScreen ? 0 : '15px'
                    }}>
                        {currentData.length === 0 ? (
                            <div style={{
                                textAlign: 'right',
                                padding: '60px 20px',
                                color: themeStyles.color
                            }}>
                                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>
                                    {activeTab === 'inward' ? '📥' : '📤'}
                                </div>
                                <h5 style={{ marginBottom: '10px', fontSize: '1.25rem' }}>
                                    No {activeTab} data available
                                </h5>
                                <p style={{ color: theme === 'dark' ? '#94a3b8' : '#64748b' }}>
                                    Please check your connection or try refreshing.
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
                                        '--ag-selected-row-background-color': activeTab === 'inward' ? '#10b981' : '#dc2626',
                                        '--ag-input-background-color': '#334155',
                                        '--ag-input-border-color': '#475569'
                                    })
                                }}
                            >
                                <AgGridReact
                                    ref={gridRef}
                                    rowData={currentData}
                                    columnDefs={currentColumns}
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
                                        console.log('Toolkit Grid ready');
                                        setTimeout(() => autoSizeAll(), 500);
                                    }}
                                />
                            </div>
                        )}
                    </div>
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
            `}</style>
        </div>
    );
};

export default ToolkitManagement;