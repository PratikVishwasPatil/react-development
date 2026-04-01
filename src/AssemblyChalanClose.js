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
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

const AssemblyChallanClose = () => {
    const [theme, setTheme] = useState('light');
    const [rowData, setRowData] = useState([]);
    const [columnDefs, setColumnDefs] = useState([]);
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [loading, setLoading] = useState(true);
    const [selectedRows, setSelectedRows] = useState([]);
    const [pageSize, setPageSize] = useState(25);
    const gridRef = useRef();

    const formTitle = "Assembly Challan Close Dashboard";

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Editable Cell Renderer for text inputs
    const EditableTextCell = (props) => {
        const { value, node, colDef, api } = props;
        const [inputValue, setInputValue] = useState(value || "");

        useEffect(() => {
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
                    padding: "4px 8px",
                    fontSize: "11px",
                    backgroundColor: "#fff8dc",
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

    // Editable Date Cell Renderer
    const EditableDateCell = (props) => {
        const { value, node, colDef } = props;
        
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
        };

        return (
            <input
                type="date"
                value={formatDateForInput(value)}
                onChange={handleDateChange}
                style={{
                    width: "100%",
                    height: "100%",
                    border: "1px solid #ddd",
                    borderRadius: "3px",
                    padding: "4px",
                    fontSize: "11px",
                    backgroundColor: "#fff8dc",
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

    // Editable Number Cell Renderer for labour amount
    const EditableNumberCell = (props) => {
        const { value, node, colDef } = props;
        const [inputValue, setInputValue] = useState(value || "");

        useEffect(() => {
            setInputValue(value || "");
        }, [value]);

        const handleChange = (e) => {
            const newValue = e.target.value;
            setInputValue(newValue);
            node.setDataValue(colDef.field, newValue);
        };

        return (
            <input
                type="number"
                value={inputValue}
                onChange={handleChange}
                style={{
                    width: "100%",
                    height: "100%",
                    border: "1px solid #ddd",
                    borderRadius: "3px",
                    padding: "4px 8px",
                    fontSize: "11px",
                    backgroundColor: "#fff8dc",
                    textAlign: "right",
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

    // Save function to send data to API
    const saveRowData = async (rowData) => {
        try {
            console.log('Saving row data:', rowData);
    
            // Validate required fields
            if (!rowData.dcid) {
                // alert('DC ID is required');
                toast.error('DC ID is required');
                return null;
            }
            if (!rowData.challanNo) {
                // alert('Challan No is required');
                toast.error('Challan No is required');
                return null;
            }
            if (!rowData.challanclosedate) {
                // alert('Challan Close Date is required');
                toast.error('Challan Close Date is required');
                return null;
            }
    
            // Prepare JSON payload
            const payload = {
                fileid: rowData.fileid || '',
                vendorid: rowData.vendorid || '',
                dcid: rowData.dcid || '',
                challanNo: rowData.challanNo || '',
                challanclosedate: rowData.challanclosedate || '',
                labouramount: rowData.labouramount || '0',
                comment: rowData.comment || '',
                employee_id: '1' // Replace with actual employee ID
            };
    
            console.log('Sending payload:', payload);
    
            const response = await fetch('https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/saveChalancloseAsslyApi.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });
    
            const result = await response.json();
            console.log('API Response:', result);
    
            if (result.status === 'success') {
                // alert('✅ ' + result.message);
                toast.success('✅ ' + result.message);
                fetchChallanData(); // Refresh grid data
                return result;
            } else {
                // alert('❌ Error: ' + (result.message || 'Failed to save data'));
                toast.error('❌ Error: ' + (result.message || 'Failed to save data'));
                return null;
            }
        } catch (error) {
            console.error('Network error:', error);
            // alert('❌ Network error: ' + error.message);
            toast.error('❌ Network error: ' + error.message);
            return null;
        }
    };

    const generateColumnDefs = () => {
        const columns = [
            {
                headerName: "Sr. No.",
                field: "count",
                width: 80,
                minWidth: 70,
                pinned: 'left',
                lockPosition: true,
                cellStyle: { 
                    fontWeight: 'bold', 
                    textAlign: 'center', 
                    backgroundColor: '#f8f9fa',
                    fontSize: '11px'  // Add this
                },
                suppressSizeToFit: false,
                checkboxSelection: true,
                headerCheckboxSelection: true
            },
            {
                field: "customer_name",
                headerName: "Customer Name",
                filter: "agTextColumnFilter",
                floatingFilter: !isMobile,
                width: 200,
                minWidth: 150,
                resizable: true,
                sortable: true,
                cellStyle: { 
                    backgroundColor: '#f8f9fa', 
                    fontSize: '11px',
                    fontWeight: 'normal'  // Add this
                }
            },
            {
                field: "file_name",
                headerName: "File Name",
                filter: "agTextColumnFilter",
                floatingFilter: !isMobile,
                width: 150,
                minWidth: 120,
                resizable: true,
                sortable: true,
                cellStyle: { 
                    backgroundColor: '#f8f9fa', 
                    fontSize: '11px',
                    fontWeight: 'normal'  // Add this
                }
            },
            {
                field: "dcid",
                headerName: "DC ID",
                filter: "agTextColumnFilter",
                floatingFilter: !isMobile,
                width: 130,
                minWidth: 100,
                resizable: true,
                sortable: true,
                cellStyle: { 
                    backgroundColor: '#f8f9fa', 
                    fontSize: '11px', 
                    fontWeight: 'bold' 
                }
            },
            {
                field: "dc_date",
                headerName: "DC Date",
                filter: "agDateColumnFilter",
                floatingFilter: !isMobile,
                width: 120,
                minWidth: 100,
                resizable: true,
                sortable: true,
                cellStyle: { 
                    textAlign: 'center', 
                    backgroundColor: '#f8f9fa', 
                    fontSize: '11px',
                    fontWeight: 'normal'  // Add this
                }
            },
            {
                field: "approx_value",
                headerName: "Approx Value",
                filter: "agNumberColumnFilter",
                floatingFilter: !isMobile,
                width: 130,
                minWidth: 100,
                resizable: true,
                sortable: true,
                cellRenderer: (params) => {
                    const value = params.value || 0;
                    return value.toLocaleString('en-IN', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                    });
                },
                cellStyle: { 
                    textAlign: 'right', 
                    backgroundColor: '#f8f9fa', 
                    fontSize: '11px', 
                    color: '#28a745',
                    fontWeight: 'normal'  // Add this
                }
            },
            {
                field: "challanNo",
                headerName: "Challan No",
                width: 150,
                minWidth: 120,
                resizable: true,
                sortable: true,
                editable: true,
                cellRenderer: EditableTextCell,
                cellStyle: { 
                    backgroundColor: '#fff8dc', 
                    fontSize: '11px',
                    fontWeight: 'normal'  // Add this
                }
            },
            {
                field: "challanclosedate",
                headerName: "Challan Close Date",
                width: 160,
                minWidth: 140,
                resizable: true,
                sortable: true,
                editable: true,
                cellRenderer: EditableDateCell,
                cellStyle: { 
                    backgroundColor: '#fff8dc', 
                    fontSize: '11px', 
                    textAlign: 'center',
                    fontWeight: 'normal'  // Add this
                }
            },
            {
                field: "labouramount",
                headerName: "Labour Amount",
                width: 150,
                minWidth: 120,
                resizable: true,
                sortable: true,
                editable: true,
                cellRenderer: EditableNumberCell,
                cellStyle: { 
                    backgroundColor: '#fff8dc', 
                    fontSize: '11px', 
                    textAlign: 'right',
                    fontWeight: 'normal'  // Add this
                }
            },
            {
                field: "comment",
                headerName: "Comment",
                width: 200,
                minWidth: 150,
                resizable: true,
                sortable: true,
                editable: true,
                cellRenderer: EditableTextCell,
                cellStyle: { 
                    backgroundColor: '#fff8dc', 
                    fontSize: '11px',
                    fontWeight: 'normal'  // Add this
                }
            },
            {
                field: "action",
                headerName: "Action",
                width: 100,
                minWidth: 80,
                resizable: true,
                sortable: false,
                filter: false,
                cellRenderer: (params) => {
                    return (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            height: '100%',
                            justifyContent: 'center'
                        }}>
                            <button
                                onClick={() => saveRowData(params.data)}
                                style={{
                                    background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    padding: '4px 12px',
                                    fontSize: '10px',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 4px rgba(0,123,255,0.3)',
                                    fontWeight: 'bold'
                                }}
                                title="Save Record"
                            >
                                Save
                            </button>
                        </div>
                    );
                },
                cellStyle: { 
                    textAlign: 'center', 
                    backgroundColor: '#f8f9fa',
                    fontWeight: 'normal'  // Add this
                }
            }
        ];
    
        return columns;
    };

    const defaultColDef = useMemo(() => ({
        filter: true,
        sortable: true,
        floatingFilter: !isMobile,
        resizable: true,
        suppressMenu: isMobile,
        cellStyle: { textAlign: 'right', fontSize: '11px' }
    }), [isMobile]);

    const fetchChallanData = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/AssmblyChalanCloseApi.php', {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.status === true && Array.isArray(result.data)) {
                setRowData(result.data);
                console.log(`Loaded ${result.data.length} challan records`);
            } else {
                console.warn("No challan data received:", result);
                setRowData([]);
            }
        } catch (error) {
            console.error("Error fetching challan data:", error);
            setRowData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setColumnDefs(generateColumnDefs());
        fetchChallanData();
    }, [isMobile, isFullScreen]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    const onSelectionChanged = (event) => {
        const selectedNodes = event.api.getSelectedNodes();
        const selectedData = selectedNodes.map(node => node.data);
        setSelectedRows(selectedData);
    };

    const handlePageSizeChange = (event) => {
        const newSize = parseInt(event.target.value);
        setPageSize(newSize);
    };

    const downloadExcel = () => {
        if (!gridRef.current?.api) return;

        try {
            const params = {
                fileName: `Assembly_Challan_Close_${new Date().toISOString().split('T')[0]}.csv`,
                allColumns: true,
                onlySelected: false,
                suppressQuotes: false,
                columnSeparator: ',',
                columnKeys: columnDefs.filter(col => col.field !== 'action').map(col => col.field)
            };

            gridRef.current.api.exportDataAsCsv(params);
            console.log('Data exported successfully!');
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
                    <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading challan data...</p>
                </div>
            </div>
        );
    }

    const totalRecords = rowData.length;
    const currentPageStart = 1;
    const currentPageEnd = Math.min(pageSize, totalRecords);
    const totalPages = Math.ceil(totalRecords / pageSize);

    return (
        <div style={{
            minHeight: '100vh',
            background: themeStyles.backgroundColor,
            color: themeStyles.color,
            padding: 0,
            margin: 0
        }}>
            <div className={`container-fluid ${isFullScreen ? 'p-0' : ''}`}>
                <div className="card" style={{
                    backgroundColor: themeStyles.cardBg,
                    color: themeStyles.color,
                    border: theme === 'dark' ? '1px solid #495057' : '1px solid #dee2e6',
                    margin: isFullScreen ? 0 : 20,
                    borderRadius: isFullScreen ? 0 : 8
                }}>
                    <div className="card-header" style={{
                        background: themeStyles.cardHeader,
                        color: theme === 'dark' ? '#ffffff' : '#000000',
                        fontFamily: "'Maven Pro', sans-serif",
                        padding: '1rem 2rem'
                    }}>
                        <div className="row align-items-center">
                            <div className="col-12 col-lg-6 mb-2 mb-lg-0">
                                <h4 className="mb-0">{formTitle}</h4>
                                <small style={{ opacity: 0.8 }}>
                                    {`${totalRecords} records found`}
                                    {selectedRows.length > 0 && ` | ${selectedRows.length} selected`}
                                </small>
                            </div>

                            <div className="col-12 col-lg-6">
                                <div className="d-flex justify-content-end gap-2 flex-wrap align-items-center">
                                    <div className="btn-group btn-group-sm">
                                        <button
                                            className="btn btn-success"
                                            onClick={downloadExcel}
                                            title="Download CSV"
                                        >
                                            Export CSV
                                        </button>
                                        <button
                                            className="btn btn-info"
                                            onClick={autoSizeAll}
                                            title="Auto Size Columns"
                                        >
                                            Auto Size
                                        </button>
                                    </div>

                                    <div className="btn-group btn-group-sm">
                                        <button
                                            className="btn btn-outline-light"
                                            onClick={toggleFullScreen}
                                            title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
                                        >
                                            {isFullScreen ? 'Exit' : 'Full'}
                                        </button>
                                        <button
                                            className="btn btn-outline-light"
                                            onClick={toggleTheme}
                                            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
                                        >
                                            {theme === 'light' ? '🌙' : '☀️'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card-body" style={{
                        backgroundColor: themeStyles.cardBg,
                        padding: isFullScreen ? 0 : 15
                    }}>
                        {totalRecords === 0 ? (
    <div style={{
        textAlign: 'center',
        padding: '50px',
        color: themeStyles.color
    }}>
        <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📋</div>
        <h5>No challan records available</h5>
        <p>Please check your API connection.</p>
    </div>
) : (
    <div style={{ height: gridHeight, backgroundColor: 'white', border: '1px solid #ddd' }}>
        <style>
            {`
                .ag-theme-alpine .ag-checkbox-input-wrapper {
                    width: 16px !important;
                    height: 16px !important;
                }
                .ag-theme-alpine .ag-checkbox-input-wrapper input {
                    width: 16px !important;
                    height: 16px !important;
                }
                .ag-theme-alpine .ag-header-cell {
                    font-size: ${isMobile ? '10px' : '11px'} !important;
                    font-weight: bold !important;
                }
                .ag-theme-alpine .ag-cell {
                    font-size: ${isMobile ? '9px' : '10px'} !important;
                }
                ${theme === 'dark' ? `
                    .ag-theme-alpine {
                        --ag-background-color: #212529;
                        --ag-header-background-color: #343a40;
                        --ag-odd-row-background-color: #2c3034;
                        --ag-even-row-background-color: #212529;
                        --ag-row-hover-color: #495057;
                        --ag-foreground-color: #f8f9fa;
                        --ag-header-foreground-color: #f8f9fa;
                        --ag-border-color: #495057;
                        --ag-selected-row-background-color: #28a745;
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
                paginationPageSize={pageSize}
                rowSelection="multiple"
                onSelectionChanged={onSelectionChanged}
                suppressMovableColumns={isMobile}
                enableRangeSelection={!isMobile}
                rowMultiSelectWithClick={true}
                suppressRowClickSelection={false}
                animateRows={!isMobile}
                enableCellTextSelection={true}
                suppressHorizontalScroll={false}
                suppressColumnVirtualisation={isMobile}
                rowBuffer={isMobile ? 5 : 10}
                headerHeight={isMobile ? 28 : 32}
                rowHeight={isMobile ? 26 : 30}
                suppressMenuHide={isMobile}
                suppressContextMenu={isMobile}
                onGridReady={(params) => {
                    console.log('Grid is ready');
                    setTimeout(() => autoSizeAll(), 500);
                }}
            />
        </div>
    </div>
)}
                    </div>

                    <div className="card-footer" style={{
                        backgroundColor: themeStyles.cardBg,
                        borderTop: '1px solid #ddd',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '12px',
                        padding: '10px 20px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span>Page Size:</span>
                            <select
                                className="form-select form-select-sm"
                                style={{ width: 'auto' }}
                                value={pageSize}
                                onChange={handlePageSizeChange}
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>
                        <div>
                            {currentPageStart} to {currentPageEnd} of {totalRecords}
                        </div>
                        <div>
                            Page 1 of {totalPages}
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
        </div>
    );
};

export default AssemblyChallanClose;