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

const PPCAssChallenClose = () => {
    const [theme, setTheme] = useState('light');
    const [rowData, setRowData] = useState([]);
    const [columnDefs, setColumnDefs] = useState([]);
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const gridRef = useRef();

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
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

   

    // Column definitions
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
                field: "vendor_id",
                headerName: "Vendor Id",
                width: isMobile ? 200 : 280,
                pinned: 'left',
              
                cellStyle: { fontWeight: 'bold' }
            },
            {
                field: "customer_name",
                headerName: "Vendor Name",
                width: isMobile ? 180 : 280,
                minWidth: 150
            },
            {
                field: "file_id",
                headerName: "File ID",
                width: isMobile ? 150 : 200,
                minWidth: 150
            },
            {
                field: "file_name",
                headerName: "FILE NAME",
                width: isMobile ? 180 : 220,
                minWidth: 150
            },
            {
                field: "dc_id",
                headerName: "DC ID",
                width: isMobile ? 100 : 120,
                minWidth: 90
            },
            
            // 👉 DC Date (visible)
        {
            field: "dc_date",
            headerName: "DC Date",
            width: isMobile ? 150 : 180,
            valueFormatter: (p) => p.value ? p.value : ""
        },

        // 👉 Approx Value (visible, right aligned)
        {
            field: "approx_value",
            headerName: "DC Amt (Basic)",
            width: isMobile ? 150 : 180,
            cellStyle: { textAlign: "right", fontWeight: "bold" }
        },

        // 👉 Editable Challan No
        {
            field: "challan_no",
            headerName: "Challan No",
            editable: true,
            width: isMobile ? 140 : 180,
            cellEditor: "agTextCellEditor"
        },

        // 👉 Editable Challan Close Date
        {
            field: "challan_close_date",
            headerName: "Challan Close Date",
            editable: true,
            cellEditor: "agDateCellEditor",
            valueGetter: (params) => params.data.challan_close_date || "",
            valueSetter: (params) => {
                const val = params.newValue;
            
                if (!val) {
                    params.data.challan_close_date = "";
                    return true;
                }
            
                let yyyy, mm, dd;
            
                // If user typed manually → string
                if (typeof val === "string") {
                    // Check for yyyy-mm-dd
                    if (val.includes("-")) {
                        [yyyy, mm, dd] = val.split("-");
                    }
                }
            
                // If AG Grid gives a Date object → convert properly
                if (val instanceof Date) {
                    yyyy = val.getFullYear();
                    mm = String(val.getMonth() + 1).padStart(2, "0");
                    dd = String(val.getDate()).padStart(2, "0");
                }
            
                // Final clean-up fallback
                if (!yyyy || !mm || !dd) return false;
            
                // Save as dd-mm-yyyy (your API format)
                params.data.challan_close_date = `${dd}-${mm}-${yyyy}`;
            
                return true;
            },
            width: 150
        },
        

        // 👉 Editable Labour Amount
        {
            field: "labour_amount",
            headerName: "Labour Amt",
            editable: true,
            width: isMobile ? 120 : 150,
            cellStyle: { textAlign: "right" },
            cellEditor: "agTextCellEditor"
        },

        // 👉 Editable Comment
        {
            field: "comment",
            headerName: "Comment",
            editable: true,
            width: isMobile ? 200 : 250,
            cellEditor: "agTextCellEditor"
        },{
            headerName: "Action",
            field: "action",
            width: isMobile ? 120 : 140,
            cellRenderer: SaveButtonRenderer
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
    const SaveButtonRenderer = (props) => {
        const handleSave = () => {
            const row = props.data;
            console.log("Saving Row:", row);
    
            if (props.context?.showToast) {
                props.context.showToast(`Save clicked for DC: ${row.dc_id}`, "success");
            }
    
            // TODO: Call your Save API here
            // fetch("save_api.php", { method:"POST", body: JSON.stringify(row) })
        };
    
        return (
            <button
                className="save-row-btn"
                onClick={handleSave}
                style={{
                    padding: "4px 10px",
                    background: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                }}
            >
                Save
            </button>
        );
    };
    
    // Fetch PPC project list data
    const fetchPPCProjectData = async () => {
      

        setLoading(true);
        setLoading(true);
        try {
            const response = await fetch(
                "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/get_AssemblyChallanOpen.php",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({})
                }
            );
        
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        
            const result = await response.json();
            // result = { data: [...], total: 9999 }
        
            if (Array.isArray(result.data)) {
                setRowData(result.data);
        
                showToast(
                    `Loaded ${result.data.length} records (Value: ₹${result.total}) `,
                    "success"
                );
            } else {
                setRowData([]);
                showToast("No data found for selected financial year", "info");
            }
        
        } catch (error) {
            console.error("Error fetching Assembly Chalen Close :", error);
            showToast(`Error fetching data: ${error.message}`, "error");
            setRowData([]);
        } finally {
            setLoading(false);
        }
        
        
    };

    // Initial load
    useEffect(() => {
        setColumnDefs(generateColumnDefs());
       
    }, [isMobile]);

    // Load data when financial year changes
    useEffect(() => {
        fetchPPCProjectData();
    }, []); // <--- FIXED
    

    // Handle selection changed - auto navigate
    const onSelectionChanged = (event) => {
        const selectedNodes = event.api.getSelectedNodes();
        const selectedData = selectedNodes.map(node => node.data);
        setSelectedRows(selectedData);

        if (selectedData.length === 1) {
            const selectedRecord = selectedData[0];

            if (!selectedRecord.FILE_ID) {
                showToast('File ID not found in selected record', 'error');
                return;
            }

            // Open details page in new tab
            const detailsUrl = `#/ppc-project/details/${selectedRecord.FILE_ID}`;
            window.open(detailsUrl, '_blank');
        }
    };

    // Handle financial year change
    // const handleFinancialYearChange = (e) => {
    //     setSelectedFinancialYear(e.target.value);
    // };

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    // Export to CSV
    const downloadExcel = () => {
        if (!gridRef.current?.api) return;

        try {
            const params = {
                fileName: `AssemblyChallenlist${new Date().toISOString().split('T')[0]}.csv`,
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

    // Refresh data
    const handleRefresh = () => {
       
            fetchPPCProjectData();
            showToast('Refreshing data...', 'info');
       
    };

    // Theme styles
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
    const handleSaveRow = async (row) => {
        // Validate
        if (!row.challan_no || !row.challan_close_date) {
            showToast("Challan No & Close Date are required", "error");
            return;
        }
    
        try {
            const response = await fetch(
                "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/save_AssemblyChallanClose.php",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        dc_id: row.dc_id,
                        file_id: row.file_id,
                        vendor_id: row.vendor_id,
                        challan_no: row.challan_no,
                        challan_close_date: row.challan_close_date,
                        labour_amount: row.labour_amount,
                        comment: row.comment
                    })
                }
            );
    
            const result = await response.json();
    
            if (result.status === "success") {
                showToast("Row saved successfully!", "success");
            } else {
                showToast("Save failed! " + (result.message || ""), "error");
            }
        } catch (error) {
            showToast("Save API Error: " + error.message, "error");
        }
    };
    

    const themeStyles = getThemeStyles();
    const gridHeight = isFullScreen ? 'calc(100vh - 240px)' : (isMobile ? '400px' : '600px');

    // Apply theme to document body
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
                    <p style={{ marginTop: '1rem' }}>Loading Assembly Chalen Close</p>
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
                    {/* Header */}
                    <div style={{
                        background: themeStyles.cardHeader,
                        color: theme === 'dark' ? '#ffffff' : '#000000',
                        fontFamily: "'Maven Pro', sans-serif",
                        padding: '1rem 2rem'
                    }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                            <div style={{ flex: isMobile ? '1 1 100%' : '1 1 auto' }}>
                                <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span>📋</span>
                                    Assembly Chalen Close
                                </h4>
                                <small style={{ opacity: 0.8 }}>
                                    {`${rowData.length} records found`}
                                </small>
                            </div>

                            <div style={{ 
                                display: 'flex', 
                                flexWrap: 'wrap',
                                gap: '0.5rem',
                                alignItems: 'center',
                                flex: isMobile ? '1 1 100%' : '0 1 auto'
                            }}>
                                {/* Financial Year Dropdown */}
                                {/* <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                                        FY:
                                    </label>
                                    <select
                                        value={selectedFinancialYear}
                                        onChange={handleFinancialYearChange}
                                        disabled={loadingYears}
                                        style={{
                                            padding: '0.375rem 0.75rem',
                                            fontSize: '0.875rem',
                                            borderRadius: '0.25rem',
                                            border: '1px solid #ced4da',
                                            backgroundColor: theme === 'dark' ? '#495057' : '#ffffff',
                                            color: theme === 'dark' ? '#ffffff' : '#000000',
                                            minWidth: '120px'
                                        }}
                                    >
                                        {financialYears.map((year, index) => (
                                            <option key={index} value={year.FINANCIAL_YEAR || year.financial_year}>
                                                {year.FINANCIAL_YEAR || year.financial_year}
                                            </option>
                                        ))}
                                    </select>
                                </div> */}

                                {/* Action Buttons */}
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

                    {/* Grid Body */}
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
                                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📋</div>
                                <h5>No Assembly Consumption Report available</h5>
                                <p>Select a financial year or try refreshing.</p>
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
                                    // rowSelection="single"
                                    // onSelectionChanged={onSelectionChanged}
                                    // suppressMovableColumns={isMobile}
                                    // enableRangeSelection={!isMobile}
                                    // rowMultiSelectWithClick={false}
                                    animateRows={!isMobile}
                                    enableCellTextSelection={true}
                                    suppressHorizontalScroll={false}
                                    headerHeight={isMobile ? 40 : 48}
                                    rowHeight={isMobile ? 35 : 42}
                                    context={{ showToast }}
                                    onGridReady={(params) => {
                                        console.log('Assembly Chalen Close is ready');
                                        setTimeout(() => autoSizeAll(), 500);
                                    }}
                                    onCellClicked={(params) => {
                                        if (params.colDef.field === "action") {
                                            handleSaveRow(params.data);
                                        }
                                    }}
                                />
                                <style>
        {`
            .save-row-btn:hover {
                background:#0056b3 !important;
            }
        `}
        </style>
                            </div>
                            
                        )}
                    </div>
                </div>
            </div>
            
        </div>
    );
};

export default PPCAssChallenClose;