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
import { useNavigate } from "react-router-dom";

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

const StockMaterialApprovalDashboard = () => {
    const [theme, setTheme] = useState('light');
    const [rowData, setRowData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [selectedRows, setSelectedRows] = useState([]);
    const gridRef = useRef();
    const navigate = useNavigate();

    const formTitle = "Stock Material Adjust Approval";

    // ── Toast notification ─────────────────────────────────────────────────────
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

    // ── Animation styles ───────────────────────────────────────────────────────
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

    // ── Handle window resize ───────────────────────────────────────────────────
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // ── Fetch data ─────────────────────────────────────────────────────────────
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                "http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/stockMaterialAdjustApprovalApi.php"
            );

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const result = await response.json();

            if (result.status === 'success' && Array.isArray(result.data)) {
                setRowData(result.data);
                showToast(`Loaded ${result.data.length} records`, 'success');
            } else {
                console.warn("No data or invalid format:", result);
                setRowData([]);
                showToast('No data found', 'info');
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            showToast(`Error fetching data: ${error.message}`, 'error');
            setRowData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // ── Navigate to detail page with file ID in URL ────────────────────────────
    const handleViewFile = (fileId) => {
        if (!fileId) {
            showToast('File ID not found in selected record', 'error');
            return;
        }
        navigate(`/project/stockMaterialAdjustApprovalDetails/${fileId}`);
    };

    // ── Handle row selection (single click auto-navigate) ──────────────────────
    const onSelectionChanged = (event) => {
        const selectedNodes = event.api.getSelectedNodes();
        const selectedData = selectedNodes.map(node => node.data);
        setSelectedRows(selectedData);

        if (selectedData.length === 1) {
            handleViewFile(selectedData[0].fileid);
        }
    };

    // ── Status badge renderer ──────────────────────────────────────────────────
    const StatusBadgeRenderer = (params) => {
        const value = params.value || '';
        const isNotSend = value.toLowerCase().includes('not send');
        return (
            <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                <span style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: 10,
                    fontSize: 10,
                    fontWeight: 'bold',
                    background: isNotSend ? '#fff3cd' : '#d4edda',
                    color: isNotSend ? '#856404' : '#155724',
                    border: `1px solid ${isNotSend ? '#ffc107' : '#28a745'}`
                }}>
                    {value}
                </span>
            </div>
        );
    };

    // ── File ID renderer (clickable) ───────────────────────────────────────────
    const FileIdRenderer = (params) => {
        const { fileid } = params.data;
        return (
            <div
                onClick={() => handleViewFile(fileid)}
                style={{
                    color: '#007bff',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    textDecoration: 'underline',
                    display: 'flex',
                    alignItems: 'center',
                    height: '100%'
                }}
                title={`Click to open file ${fileid}`}
            >
                {fileid}
            </div>
        );
    };

    // ── Action button renderer ─────────────────────────────────────────────────
    const ActionButtonRenderer = (params) => {
        const { fileid } = params.data;
        return (
            <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', gap: 4 }}>
                <button
                    onClick={() => handleViewFile(fileid)}
                    style={{
                        background: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        padding: '4px 10px',
                        fontSize: 10,
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    View →
                </button>
            </div>
        );
    };

    // ── Column definitions ─────────────────────────────────────────────────────
    const columnDefs = useMemo(() => [
        {
            headerName: "SR.NO.",
            valueGetter: (params) => params.node ? params.node.rowIndex + 1 : '',
            width: isMobile ? 60 : 80,
            minWidth: 50,
            pinned: 'left',
            lockPosition: true,
            filter: false,
            sortable: false,
            cellStyle: { fontWeight: 'bold', textAlign: 'center', backgroundColor: '#f8f9fa' }
        },
        {
            headerName: "File ID",
            field: "fileid",
            cellRenderer: FileIdRenderer,
            filter: "agNumberColumnFilter",
            floatingFilter: !isMobile,
            width: isMobile ? 80 : 100,
            minWidth: 80,
            pinned: 'left',
            cellStyle: { backgroundColor: '#f8f9fa' }
        },
        {
            headerName: "File Name",
            field: "file_name",
            filter: "agTextColumnFilter",
            floatingFilter: !isMobile,
            width: isMobile ? 200 : 220,
            minWidth: 150,
            pinned: 'left',
            checkboxSelection: true,
            headerCheckboxSelection: true,
            cellStyle: { fontWeight: 'bold', backgroundColor: '#f8f9fa' }
        },
        {
            headerName: "Customer Name",
            field: "custName",
            filter: "agTextColumnFilter",
            floatingFilter: !isMobile,
            width: isMobile ? 180 : 280,
            minWidth: 150,
            cellStyle: { textAlign: 'left' }
        },
        {
            headerName: "Status",
            field: "statusName",
            filter: "agTextColumnFilter",
            floatingFilter: !isMobile,
            width: isMobile ? 140 : 220,
            minWidth: 120,
            cellRenderer: StatusBadgeRenderer,
            cellStyle: { textAlign: 'left' }
        },
        {
            headerName: "Date",
            field: "date",
            filter: "agTextColumnFilter",
            floatingFilter: !isMobile,
            width: isMobile ? 100 : 120,
            minWidth: 90,
            cellStyle: { textAlign: 'center' }
        },
        {
            headerName: "Action",
            field: "action",
            width: isMobile ? 80 : 100,
            minWidth: 80,
            cellRenderer: ActionButtonRenderer,
            cellStyle: { textAlign: 'center', padding: '0' },
            filter: false,
            sortable: false
        }
    ], [isMobile]);

    const defaultColDef = useMemo(() => ({
        filter: true,
        sortable: true,
        floatingFilter: !isMobile,
        resizable: true,
        suppressMenu: isMobile,
        cellStyle: { fontSize: '11px', textAlign: 'left' }
    }), [isMobile]);

    // ── Theme helpers ──────────────────────────────────────────────────────────
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

    const toggleTheme = () => setTheme(p => p === 'light' ? 'dark' : 'light');
    const toggleFullScreen = () => setIsFullScreen(p => !p);

    // ── Export to CSV ──────────────────────────────────────────────────────────
    const downloadExcel = () => {
        if (!gridRef.current?.api) return;
        try {
            gridRef.current.api.exportDataAsCsv({
                fileName: `Stock_Material_Approval_${new Date().toISOString().split('T')[0]}.csv`,
                allColumns: true,
                onlySelected: false
            });
            showToast('Data exported successfully!', 'success');
        } catch (error) {
            console.error('Error exporting data:', error);
            showToast('Error exporting data', 'error');
        }
    };

    // ── Auto size columns ──────────────────────────────────────────────────────
    const autoSizeAll = () => {
        if (!gridRef.current?.api) return;
        try {
            setTimeout(() => {
                const ids = gridRef.current.api.getColumns()?.map(c => c.getId()) || [];
                if (ids.length) gridRef.current.api.autoSizeColumns(ids, false);
            }, 100);
        } catch (error) {
            console.error('Error auto-sizing columns:', error);
        }
    };

    // ── Apply theme to document body ───────────────────────────────────────────
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

    // ── Loading state ──────────────────────────────────────────────────────────
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
                        border: '4px solid #f3f3f3',
                        borderTop: '4px solid #007bff',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto'
                    }} />
                    <p style={{ marginTop: '1rem' }}>Loading approval data...</p>
                </div>
            </div>
        );
    }

    // ── Main render ────────────────────────────────────────────────────────────
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

                    {/* ── Header ── */}
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
                            justifyContent: 'space-between',
                            gap: '1rem'
                        }}>
                            <div style={{ flex: isMobile ? '1 1 100%' : '1 1 auto' }}>
                                <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span>🛠️</span>
                                    {formTitle}
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
                                    onClick={fetchData}
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

                    {/* ── Grid Body ── */}
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
                                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🛠️</div>
                                <h5>No approval data available</h5>
                                <p>Try refreshing to load records.</p>
                                <button
                                    onClick={fetchData}
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
                                    rowData={rowData}
                                    columnDefs={columnDefs}
                                    defaultColDef={defaultColDef}
                                    pagination={true}
                                    paginationPageSize={isMobile ? 10 : 20}
                                    rowSelection="single"
                                    onSelectionChanged={onSelectionChanged}
                                    suppressMovableColumns={isMobile}
                                    rowMultiSelectWithClick={false}
                                    animateRows={!isMobile}
                                    enableCellTextSelection={true}
                                    suppressHorizontalScroll={false}
                                    headerHeight={isMobile ? 40 : 35}
                                    rowHeight={isMobile ? 35 : 32}
                                    onGridReady={() => setTimeout(() => autoSizeAll(), 500)}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StockMaterialApprovalDashboard;