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

const PowderDcGrid = () => {
    const [theme, setTheme] = useState('light');
    const [rowData, setRowData] = useState([]);
    const [columnDefs, setColumnDefs] = useState([]);
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [financialYear, setFinancialYear] = useState('25-26');
    const [financialYearOptions, setFinancialYearOptions] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [toasts, setToasts] = useState([]);
    const [showDetailPage, setShowDetailPage] = useState(false);
    const [selectedDc, setSelectedDc] = useState(null);
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

    const generateColumnDefs = () => {
        const baseColumns = [
            {
                headerName: "Sr",
                field: "count",
                width: isMobile ? 60 : 80,
                minWidth: 50,
                pinned: 'left',
                lockPosition: true,
                cellStyle: { fontWeight: 'bold', textAlign: 'center' }
            },
            {
                field: "dc_id",
                headerName: "DC ID",
                width: isMobile ? 120 : 150,
                pinned: 'left',
                checkboxSelection: true,
                headerCheckboxSelection: true,
                cellStyle: { fontWeight: '700', color: '#8b5cf6', cursor: 'pointer' },
                onCellClicked: (params) => {
                    if (params.data) {
                        setSelectedDc({
                            customerId: params.data.customer_id,
                            fileId: params.data.file_id,
                            dcId: params.data.dc_id
                        });
                        setShowDetailPage(true);
                    }
                }
            },
            {
                field: "file_name",
                headerName: "File Name",
                width: isMobile ? 160 : 200,
                cellStyle: { fontWeight: '600' }
            },
            {
                field: "customer_name",
                headerName: "Customer Name",
                width: isMobile ? 180 : 280,
                cellStyle: { fontWeight: '500' }
            },
            {
                field: "date",
                headerName: "Date",
                width: isMobile ? 120 : 140,
                cellStyle: { textAlign: 'center' }
            },
            {
                field: "customer_id",
                headerName: "Customer ID",
                width: isMobile ? 100 : 120,
                cellStyle: { textAlign: 'center' }
            },
            {
                field: "file_id",
                headerName: "File ID",
                width: isMobile ? 100 : 120,
                cellStyle: { textAlign: 'center' }
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
        cellStyle: { textAlign: 'right' }
    }), [isMobile]);

    const fetchDcData = async (fy = financialYear) => {
        setLoading(true);
        try {
            const response = await fetch(
                `http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/PowderDcListApi.php?financial_year=${fy}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.status === 'success' && Array.isArray(data.data)) {
                setRowData(data.data);
                setTotalCount(data.total || data.data.length);
                showToast(`Loaded ${data.data.length} Powder DC records for FY ${fy}`, 'success');
            } else {
                throw new Error("Failed to fetch DC data");
            }
        } catch (error) {
            console.error("Error fetching DC data:", error);
            showToast(`Error fetching data: ${error.message}`, 'error');
            setRowData([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setColumnDefs(generateColumnDefs());
        fetchFinancialYears();
    }, [isMobile]);

    useEffect(() => {
        if (financialYear) {
            fetchDcData();
        }
    }, [financialYear]);

    const handleFinancialYearChange = (e) => {
        const newFY = e.target.value;
        setFinancialYear(newFY);
        fetchDcData(newFY);
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
                fileName: `PowderDC_${financialYear}_${new Date().toISOString().split('T')[0]}.csv`,
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
        fetchDcData(financialYear);
    };

    const handleNavigateToDetail = () => {
        if (selectedRows.length === 0) {
            showToast('Please select at least one row', 'error');
            return;
        }
        setSelectedDc({
            customerId: selectedRows[0].customer_id,
            fileId: selectedRows[0].file_id,
            dcId: selectedRows[0].dc_id
        });
        setShowDetailPage(true);
    };

    const getThemeStyles = () => {
        if (theme === 'dark') {
            return {
                backgroundColor: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                color: '#f1f5f9',
                cardBg: '#1e293b',
                cardHeader: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)'
            };
        }
        return {
            backgroundColor: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
            color: '#0f172a',
            cardBg: '#ffffff',
            cardHeader: 'linear-gradient(135deg, #e9d5ff 0%, #d8b4fe 100%)'
        };
    };

    const themeStyles = getThemeStyles();
    const gridHeight = isFullScreen ? 'calc(100vh - 180px)' : (isMobile ? '400px' : '600px');

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

    if (showDetailPage && selectedDc) {
        return (
            <PowderDcDetail
                customerId={selectedDc.customerId}
                fileId={selectedDc.fileId}
                dcId={selectedDc.dcId}
                onBack={() => {
                    setShowDetailPage(false);
                    setSelectedDc(null);
                }}
            />
        );
    }

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
                        border: '4px solid rgba(139, 92, 246, 0.2)',
                        borderTopColor: '#8b5cf6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto'
                    }} />
                    <p style={{ marginTop: '1rem', fontWeight: '600' }}>Loading Powder DC records...</p>
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
                    border: theme === 'dark' ? '1px solid #7c3aed' : '1px solid #d8b4fe',
                    borderRadius: isFullScreen ? 0 : '12px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(139, 92, 246, 0.15)'
                }}>
                    <div style={{
                        background: themeStyles.cardHeader,
                        color: theme === 'dark' ? '#ffffff' : '#6b21a8',
                        padding: '1.25rem 2rem',
                        borderBottom: theme === 'dark' ? '1px solid #7c3aed' : '1px solid #d8b4fe'
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
                                    🎨 Powder Coating DC Dashboard
                                </h4>
                                <small style={{ opacity: 0.8, display: 'block', marginTop: '0.5rem', fontSize: '0.95rem' }}>
                                    {totalCount} total records | {rowData.length} loaded
                                    {selectedRows.length > 0 && ` | ${selectedRows.length} selected`}
                                </small>
                            </div>

                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '0.5rem',
                                alignItems: 'center'
                            }}>
                                <select
                                    value={financialYear}
                                    onChange={handleFinancialYearChange}
                                    style={{
                                        padding: '0.5rem 0.875rem',
                                        fontSize: '0.9rem',
                                        borderRadius: '6px',
                                        border: theme === 'dark' ? '1px solid #7c3aed' : '1px solid #a855f7',
                                        backgroundColor: theme === 'dark' ? '#7c3aed' : '#faf5ff',
                                        color: theme === 'dark' ? '#e9d5ff' : '#6b21a8',
                                        minWidth: '130px',
                                        fontWeight: '600'
                                    }}
                                >
                                    {financialYearOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            FY {option.label}
                                        </option>
                                    ))}
                                </select>

                                {selectedRows.length > 0 && (
                                    <button
                                        onClick={handleNavigateToDetail}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            fontSize: '0.9rem',
                                            borderRadius: '6px',
                                            border: 'none',
                                            background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                                            color: 'white',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            fontWeight: '600',
                                            boxShadow: '0 2px 8px rgba(236, 72, 153, 0.3)'
                                        }}
                                    >
                                        <span>📝</span>
                                        {!isMobile && <span>Open Selected</span>}
                                    </button>
                                )}

                                <button
                                    onClick={refreshData}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        fontSize: '0.9rem',
                                        borderRadius: '6px',
                                        border: 'none',
                                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                        color: 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontWeight: '600',
                                        boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)'
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
                                        border: theme === 'dark' ? '1px solid #e9d5ff' : '1px solid #6b21a8',
                                        backgroundColor: 'transparent',
                                        color: theme === 'dark' ? '#e9d5ff' : '#6b21a8',
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
                                        border: theme === 'dark' ? '1px solid #e9d5ff' : '1px solid #6b21a8',
                                        backgroundColor: 'transparent',
                                        color: theme === 'dark' ? '#e9d5ff' : '#6b21a8',
                                        cursor: 'pointer',
                                        fontWeight: '600'
                                    }}
                                >
                                    {theme === 'light' ? '🌙' : '☀️'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div style={{
                        backgroundColor: themeStyles.cardBg,
                        padding: isFullScreen ? 0 : '15px'
                    }}>
                        {rowData.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '60px 20px',
                                color: themeStyles.color
                            }}>
                                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎨</div>
                                <h5 style={{ marginBottom: '10px', fontSize: '1.25rem' }}>No Powder DC data available</h5>
                                <p style={{ color: theme === 'dark' ? '#94a3b8' : '#6b21a8' }}>
                                    Please select a different financial year or check your connection.
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
                                        '--ag-header-background-color': '#7c3aed',
                                        '--ag-odd-row-background-color': '#1e293b',
                                        '--ag-even-row-background-color': '#0f172a',
                                        '--ag-row-hover-color': '#7c3aed',
                                        '--ag-foreground-color': '#f1f5f9',
                                        '--ag-header-foreground-color': '#e9d5ff',
                                        '--ag-border-color': '#7c3aed',
                                        '--ag-selected-row-background-color': '#8b5cf6',
                                        '--ag-input-background-color': '#7c3aed',
                                        '--ag-input-border-color': '#5b21b6'
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
                                        console.log('Powder DC Grid ready');
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
            `}</style>
        </div>
    );
};

const PowderDcDetail = ({ customerId, fileId, dcId, onBack }) => {
    const [loading, setLoading] = useState(false);
    const [dcData, setDcData] = useState({
        challanNo: '',
        dcDate: '',
        gstin: '',
        financialYear: '',
        customerName: '',
        customerAddress: '',
        customerGstin: '',
        fileName: '',
        fileId: ''
    });
    const [materials, setMaterials] = useState([]);
    const [totals, setTotals] = useState(null);

    useEffect(() => {
        const fetchDcDetails = async () => {
            if (!customerId || !fileId || !dcId) return;
            
            setLoading(true);
            try {
                const response = await fetch(
                    `http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/PowderDcDetailsApi.php?file=${fileId}&vendor=${customerId}&dc_id=${dcId}`
                );
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const result = await response.json();
                
                if (result.success && result.data) {
                    const data = result.data;
                    
                    setDcData({
                        challanNo: data.challan_info?.challan_no || '',
                        dcDate: data.challan_info?.dc_date || '',
                        gstin: data.challan_info?.gstin || '',
                        financialYear: data.challan_info?.financial_year || '',
                        customerName: data.vendor_info?.customer_name || '',
                        customerAddress: data.vendor_info?.address || '',
                        customerGstin: data.vendor_info?.gst_no || '',
                        fileName: data.file_info?.file_name || '',
                        fileId: data.file_info?.file_id || ''
                    });
                    
                    if (data.materials && data.materials.length > 0) {
                        const formattedMaterials = data.materials.map((item, index) => ({
                            id: index + 1,
                            srNo: item.sr_no || index + 1,
                            rid: item.rid || '',
                            materialName: item.material_name || '',
                            hsn: item.hsn || '',
                            qty: item.qty || '',
                            unit: item.unit || 'KG',
                            unitId: item.unit_id || '',
                            kg: item.kg || 0,
                            rfdName: item.rfd_name || '',
                            weight: item.weight || '',
                            height: item.height || '',
                            rfdRate: item.rfd_rate || '',
                            rfdColor: item.rfd_color || '',
                            constantWeight: item.constant_weight || '',
                            constantRate: item.constant_rate || '',
                            rowId: item.row_id || ''
                        }));
                        setMaterials(formattedMaterials);
                    }

                    if (data.totals) {
                        setTotals({
                            totalKg: data.totals.total_kg || 0
                        });
                    }
                }
            } catch (error) {
                console.error('Error fetching DC details:', error);
                alert('Error loading DC details: ' + error.message);
            } finally {
                setLoading(false);
            }
        };
        
        fetchDcDetails();
    }, [dcId, customerId, fileId]);

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '3rem',
                        height: '3rem',
                        border: '4px solid rgba(139, 92, 246, 0.2)',
                        borderTopColor: '#8b5cf6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto'
                    }} />
                    <p style={{ marginTop: '1rem', fontWeight: '600', color: '#1f2937' }}>Loading DC details...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
            padding: '10px'
        }}>
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                overflow: 'hidden'
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    color: 'white',
                    padding: '16px 20px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
                            Delivery Challan for Powder Coating Job Work
                        </h3>
                        <small style={{ opacity: 0.9 }}>
                            DC ID: {dcId} | File: {fileId} | Customer: {customerId}
                        </small>
                    </div>
                    <button
                        onClick={onBack}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: 'white',
                            color: '#8b5cf6',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.95rem',
                            transition: 'all 0.3s'
                        }}
                        onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                    >
                        ← Back to List
                    </button>
                </div>

                <div style={{
                    padding: '20px',
                    borderBottom: '2px solid #e5e7eb',
                    background: '#faf5ff'
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '15px',
                        marginBottom: '15px'
                    }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.9rem', color: '#374151' }}>Challan NO.</label>
                            <input
                                type="text"
                                value={dcData.challanNo}
                                readOnly
                                style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.95rem', backgroundColor: '#e9d5ff', fontWeight: '700', color: '#5b21b6', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.9rem', color: '#374151' }}>Date</label>
                            <input
                                type="text"
                                value={dcData.dcDate}
                                readOnly
                                style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.95rem', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.9rem', color: '#374151' }}>Company GSTIN</label>
                            <input
                                type="text"
                                value={dcData.gstin}
                                readOnly
                                style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.95rem', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.9rem', color: '#374151' }}>Financial Year</label>
                            <input
                                type="text"
                                value={dcData.financialYear}
                                readOnly
                                style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.95rem', boxSizing: 'border-box' }}
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.9rem', color: '#374151' }}>File: {dcData.fileName}</label>
                        <p style={{ margin: '5px 0 0 0', fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>
                            To: {dcData.customerName}
                        </p>
                        {dcData.customerAddress && (
                            <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#6b7280' }}>
                                {dcData.customerAddress}
                            </p>
                        )}
                        {dcData.customerGstin && (
                            <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#6b7280' }}>
                                GSTIN: {dcData.customerGstin}
                            </p>
                        )}
                    </div>
                </div>

                <div style={{ padding: '20px' }}>
                    <div style={{
                        overflowX: 'auto',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            minWidth: '1200px'
                        }}>
                            <thead>
                                <tr style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
                                    <th style={{ padding: '12px 8px', color: 'white', fontWeight: '700', textAlign: 'center', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.85rem' }}>Sr</th>
                                    <th style={{ padding: '12px 8px', color: 'white', fontWeight: '700', textAlign: 'center', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.85rem' }}>Material Name</th>
                                    <th style={{ padding: '12px 8px', color: 'white', fontWeight: '700', textAlign: 'center', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.85rem' }}>RFD Name</th>
                                    <th style={{ padding: '12px 8px', color: 'white', fontWeight: '700', textAlign: 'center', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.85rem' }}>Color</th>
                                    <th style={{ padding: '12px 8px', color: 'white', fontWeight: '700', textAlign: 'center', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.85rem' }}>HSN</th>
                                    <th style={{ padding: '12px 8px', color: 'white', fontWeight: '700', textAlign: 'center', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.85rem' }}>Qty</th>
                                    <th style={{ padding: '12px 8px', color: 'white', fontWeight: '700', textAlign: 'center', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.85rem' }}>Unit</th>
                                    <th style={{ padding: '12px 8px', color: 'white', fontWeight: '700', textAlign: 'center', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.85rem' }}>Kg</th>
                                    <th style={{ padding: '12px 8px', color: 'white', fontWeight: '700', textAlign: 'center', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.85rem' }}>Rate</th>
                                    <th style={{ padding: '12px 8px', color: 'white', fontWeight: '700', textAlign: 'center', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.85rem' }}>RID</th>
                                </tr>
                            </thead>
                            <tbody>
                                {materials.map((item, index) => (
                                    <tr key={item.id} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#faf5ff' }}>
                                        <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                                            <div style={{ textAlign: 'center', fontWeight: '600', backgroundColor: '#e9d5ff', padding: '6px 8px', borderRadius: '4px' }}>
                                                {item.srNo}
                                            </div>
                                        </td>
                                        <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                                            <div style={{ backgroundColor: '#e9d5ff', textAlign: 'right', fontSize: '0.85rem', padding: '6px 8px', borderRadius: '4px' }}>
                                                {item.materialName}
                                            </div>
                                        </td>
                                        <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                                            <div style={{ backgroundColor: '#e9d5ff', textAlign: 'center', padding: '6px 8px', borderRadius: '4px' }}>
                                                {item.rfdName}
                                            </div>
                                        </td>
                                        <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                                            <div style={{ backgroundColor: '#e9d5ff', textAlign: 'center', padding: '6px 8px', borderRadius: '4px' }}>
                                                {item.rfdColor}
                                            </div>
                                        </td>
                                        <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                                            <div style={{ backgroundColor: '#e9d5ff', textAlign: 'center', padding: '6px 8px', borderRadius: '4px' }}>
                                                {item.hsn}
                                            </div>
                                        </td>
                                        <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                                            <div style={{ backgroundColor: '#e9d5ff', textAlign: 'center', fontWeight: '600', padding: '6px 8px', borderRadius: '4px' }}>
                                                {item.qty}
                                            </div>
                                        </td>
                                        <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                                            <div style={{ backgroundColor: '#e9d5ff', textAlign: 'center', padding: '6px 8px', borderRadius: '4px' }}>
                                                {item.unit}
                                            </div>
                                        </td>
                                        <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                                            <div style={{ backgroundColor: '#e9d5ff', textAlign: 'center', fontWeight: '600', padding: '6px 8px', borderRadius: '4px' }}>
                                                {item.kg}
                                            </div>
                                        </td>
                                        <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                                            <div style={{ backgroundColor: '#e9d5ff', textAlign: 'right', padding: '6px 8px', borderRadius: '4px' }}>
                                                {parseFloat(item.constantRate).toFixed(2)}
                                            </div>
                                        </td>
                                        <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                                            <div style={{ backgroundColor: '#e9d5ff', textAlign: 'center', padding: '6px 8px', borderRadius: '4px' }}>
                                                {item.rid}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {totals && (
                                    <tr style={{ backgroundColor: '#e9d5ff', fontWeight: '700' }}>
                                        <td colSpan="7" style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center', fontSize: '1rem' }}>
                                            TOTAL
                                        </td>
                                        <td style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center', color: '#8b5cf6', fontSize: '1.1rem' }}>
                                            {totals.totalKg}
                                        </td>
                                        <td colSpan="2" style={{ padding: '8px', border: '1px solid #e5e7eb' }}></td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div style={{
                        marginTop: '20px',
                        padding: '15px',
                        backgroundColor: '#e9d5ff',
                        borderRadius: '8px',
                        textAlign: 'center',
                        border: '1px dashed #8b5cf6'
                    }}>
                        <p style={{ margin: 0, fontWeight: '600', color: '#5b21b6' }}>
                            THIS IS COMPUTER GENERATED DC HENCE SIGNATURE NOT REQUIRED
                        </p>
                        <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: '#5b21b6' }}>
                            Finished Goods Ordered for powder coating as per our instructions.
                        </p>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default PowderDcGrid;