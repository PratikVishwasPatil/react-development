import React, { useEffect, useMemo, useState, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { ModuleRegistry } from "ag-grid-community";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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

const EmployeeTabsGrid = () => {
    const [theme, setTheme] = useState('light');
    const [activeTabData, setActiveTabData] = useState([]);
    const [active1TabData, setActive1TabData] = useState([]);
    const [columnDefs, setColumnDefs] = useState([]);
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [loading, setLoading] = useState(true);
    const [selectedRows, setSelectedRows] = useState([]);
    const [currentTab, setCurrentTab] = useState('active');
    const gridRef = useRef();

    const formTitle = "Outside Employee Management";

    // Handle window resize for mobile responsiveness
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Custom checkbox renderer with status handling
    const CheckboxRenderer = (props) => {
        // Initialize based on current status from data
        const [checked, setChecked] = useState(props.data.status === '1' || props.data.status === 1);

        // Update checkbox when data changes (e.g., after refresh)
        useEffect(() => {
            setChecked(props.data.status === '1' || props.data.status === 1);
        }, [props.data.status]);

        const handleChange = async (event) => {
            const newCheckedState = event.target.checked;
            const previousState = checked;

            // Optimistically update UI
            setChecked(newCheckedState);

            // Determine status to send to API
            const statusToSend = newCheckedState ? 'active' : 'inactive';
            const employeeId = props.data.employee_id;

            // Call API to update status
            try {
                const response = await fetch('https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/ActiveInactiveEmpApi.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        status: statusToSend,
                        id: employeeId
                    })
                });

                const result = await response.json();
                if (result.status === 'success') {
                    console.log('Employee status updated successfully:', result);
                    toast.success('Employee status updated successfully:',result);
                    // Update the data source with new status
                    props.data.status = result.newStatus;
                    // Keep checkbox in the new state
                    setChecked(result.newStatus === '1' || result.newStatus === 1);
                } else {
                    console.error('Failed to update employee status:', result.message);
                    toast.error('Failed to update employee status:', result.message);
                    
                    setChecked(previousState); // Revert on error
                    // alert(`Failed to update status: ${result.message}`);
                    toast.error(`Failed to update status: ${result.message}`);
                    
                }
            } catch (error) {
                console.error('Error updating employee status:', error);
                setChecked(previousState); // Revert on error
                // alert('Error updating employee status. Please try again.');
                toast.error(`Error updating employee status. Please try again.`);
                
            }
        };

        return (
            <input
                type="checkbox"
                checked={checked}
                onChange={handleChange}
                style={{
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                    accentColor: '#28a745'
                }}
                title={checked ? 'Active - Click to deactivate' : 'Inactive - Click to activate'}
            />
        );
    };

    // Generate column definitions for employee data
    const generateEmployeeColumnDefs = () => {
        const employeeColumns = [
            // Serial Number Column
            {
                headerName: "Sr No",
                field: "serial_number",
                width: isMobile ? 60 : 80,
                minWidth: 50,
                pinned: 'left',
                lockPosition: true,
                cellStyle: { fontWeight: 'bold', textAlign: 'center' },
                suppressSizeToFit: true
            },
            // Employee Code
            {
                field: "emp_code",
                headerName: "EMP CODE",
                filter: "agTextColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 120 : 150,
                minWidth: 100,
                resizable: true,
                sortable: true,
                cellRenderer: (params) => {
                    const value = params.value;
                    if (value == 'NULL') {
                        return '-';
                    }
                    return value;
                }
            },
            // Checkbox Column
            {
                headerName: "STATUS",
                field: "status",
                width: isMobile ? 80 : 100,
                minWidth: 70,
                pinned: 'left',
                lockPosition: true,
                cellRenderer: CheckboxRenderer,
                cellStyle: { textAlign: 'center' },
                suppressSizeToFit: true,
                sortable: true,
                filter: "agNumberColumnFilter"
            },
            // Employee Name with selection checkbox
            {
                field: "employee_name",
                headerName: "EMPLOYEE NAME",
                filter: "agTextColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 180 : 220,
                minWidth: 150,
                resizable: true,
                sortable: true,
                // checkboxSelection: true,
                headerCheckboxSelection: true,
                cellStyle: { fontWeight: 'bold', fontSize: '12px' },
                tooltipField: "employee_name"
            },
            // Mobile Number
            {
                field: "mobile_number",
                headerName: "MOBILE NUMBER",
                filter: "agTextColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 140 : 160,
                minWidth: 120,
                resizable: true,
                sortable: true,
                cellStyle: { fontFamily: 'monospace' }
            },
            // Address
            {
                field: "address",
                headerName: "ADDRESS",
                filter: "agTextColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 200 : 300,
                minWidth: 180,
                resizable: true,
                sortable: true,
                tooltipField: "address",
                cellRenderer: (params) => {
                    const value = params.value;
                    return value;
                }
            },

            // Employee ID (hidden but useful)
            // {
            //     field: "employee_id",
            //     headerName: "ID",
            //     filter: "agNumberColumnFilter",
            //     width: isMobile ? 80 : 100,
            //     minWidth: 60,
            //     resizable: true,
            //     sortable: true,
            //     cellStyle: { textAlign: 'right', fontSize: '11px', color: '#6c757d' }
            // }
        ];

        return employeeColumns;
    };

    const defaultColDef = useMemo(() => ({
        filter: true,
        sortable: true,
        floatingFilter: !isMobile,
        resizable: true,
        suppressMenu: isMobile,
        cellStyle: { textAlign: 'right' }
    }), [isMobile]);

    // Fetch employee data from both APIs
    const fetchEmployeeData = async () => {
        setLoading(true);
        try {
            // Fetch data for both tabs
            const [activeResponse, active1Response] = await Promise.all([
                fetch("https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/OutsideEmployee1Api.php"),
                fetch("https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/OutsideEmployee2Api.php")
            ]);

            if (!activeResponse.ok || !active1Response.ok) {
                throw new Error("Failed to fetch employee data");
            }

            const activeData = await activeResponse.json();
            const active1Data = await active1Response.json();

            // Set data for Active tab
            if (activeData.status === 'success' && Array.isArray(activeData.data)) {
                setActiveTabData(activeData.data);
                console.log(`Loaded ${activeData.data.length} active employees`);
            } else {
                console.warn("No active employee data received:", activeData);
                setActiveTabData([]);
            }

            // Set data for Active1 tab
            if (active1Data.status === 'success' && Array.isArray(active1Data.data)) {
                setActive1TabData(active1Data.data);
                console.log(`Loaded ${active1Data.data.length} active1 employees`);
            } else {
                console.warn("No active1 employee data received:", active1Data);
                setActive1TabData([]);
            }

        } catch (error) {
            console.error("Error fetching employee data:", error);
            setActiveTabData([]);
            setActive1TabData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setColumnDefs(generateEmployeeColumnDefs());
        fetchEmployeeData();
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

        if (selectedNodes.length === 1) {
            console.log("Selected employee data:", selectedData[0]);
        }
    };

    // Handle tab change
    const handleTabChange = (tabName) => {
        setCurrentTab(tabName);
        setSelectedRows([]);
    };

    // Get current row data based on active tab
    const getCurrentRowData = () => {
        return currentTab === 'active' ? activeTabData : active1TabData;
    };

    // Export to CSV
    const downloadExcel = () => {
        if (!gridRef.current?.api) return;

        try {
            const params = {
                fileName: `${currentTab.toUpperCase()}_Employees_${new Date().toISOString().split('T')[0]}.csv`,
                allColumns: true,
                onlySelected: false,
                suppressQuotes: false,
                columnSeparator: ','
            };

            gridRef.current.api.exportDataAsCsv(params);
            console.log('Data exported successfully!');
        } catch (error) {
            console.error("Error exporting CSV:", error);
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
    const refreshData = () => {
        fetchEmployeeData();
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

    const themeStyles = getThemeStyles();
    const gridHeight = isFullScreen ? 'calc(100vh - 250px)' : (isMobile ? '400px' : '600px');
    const currentRowData = getCurrentRowData();

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
                    <p className="mt-3">Loading employee data...</p>
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
                <div className="card" style={{
                    backgroundColor: themeStyles.cardBg,
                    color: themeStyles.color,
                    border: theme === 'dark' ? '1px solid #495057' : '1px solid #dee2e6',
                    margin: isFullScreen ? 0 : 20,
                    borderRadius: isFullScreen ? 0 : 8
                }}>
                    {/* Header */}
                    <div className="card-header" style={{
                        background: themeStyles.cardHeader,
                        color: theme === 'dark' ? '#ffffff' : '#000000',
                        fontFamily: "'Maven Pro', sans-serif",
                        padding: '1rem 2rem'
                    }}>
                        <div className="row align-items-center">
                            <div className="col-12 col-lg-6 mb-2 mb-lg-0">
                                <h4 className="mb-0">
                                    👥 {formTitle}
                                </h4>
                                <small style={{ opacity: 0.8 }}>
                                    {`${currentRowData.length} employees found`}
                                    {selectedRows.length > 0 && ` | ${selectedRows.length} selected`}
                                </small>
                            </div>

                            <div className="col-12 col-lg-6">
                                <div className="d-flex justify-content-end gap-2 flex-wrap align-items-center">
                                    {/* Action Buttons */}
                                    <div className="btn-group btn-group-sm">
                                        <button
                                            className="btn btn-primary"
                                            onClick={refreshData}
                                            title="Refresh Data"
                                        >
                                            🔄 {!isMobile && 'Refresh'}
                                        </button>
                                        <button
                                            className="btn btn-success"
                                            onClick={downloadExcel}
                                            title="Download CSV"
                                        >
                                            📊 {!isMobile && 'Export CSV'}
                                        </button>
                                        <button
                                            className="btn btn-info"
                                            onClick={autoSizeAll}
                                            title="Auto Size Columns"
                                        >
                                            ↔️ {!isMobile && 'Auto Size'}
                                        </button>
                                    </div>

                                    {/* View Controls */}
                                    <div className="btn-group btn-group-sm">
                                        <button
                                            className="btn btn-outline-light"
                                            onClick={toggleFullScreen}
                                            title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
                                        >
                                            ⛶ {!isMobile && (isFullScreen ? 'Exit' : 'Full')}
                                        </button>
                                        <button
                                            className="btn btn-outline-light"
                                            onClick={toggleTheme}
                                            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
                                        >
                                            {theme === 'light' ? '🌙' : '☀️'}
                                            {!isMobile && (theme === 'light' ? ' Dark' : ' Light')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs Navigation */}
                    <div style={{
                        backgroundColor: themeStyles.cardBg,
                        borderBottom: theme === 'dark' ? '1px solid #495057' : '1px solid #dee2e6',
                        padding: '0 15px'
                    }}>
                        <ul className="nav nav-tabs" style={{ border: 'none' }}>
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${currentTab === 'active' ? 'active' : ''}`}
                                    onClick={() => handleTabChange('active')}
                                    style={{
                                        border: 'none',
                                        backgroundColor: currentTab === 'active' ? (theme === 'dark' ? '#495057' : '#e9ecef') : 'transparent',
                                        color: currentTab === 'active' ? (theme === 'dark' ? '#ffffff' : '#000000') : themeStyles.color,
                                        fontWeight: currentTab === 'active' ? 'bold' : 'normal'
                                    }}
                                >
                                    📋 Active ({activeTabData.length})
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${currentTab === 'active1' ? 'active' : ''}`}
                                    onClick={() => handleTabChange('active1')}
                                    style={{
                                        border: 'none',
                                        backgroundColor: currentTab === 'active1' ? (theme === 'dark' ? '#495057' : '#e9ecef') : 'transparent',
                                        color: currentTab === 'active1' ? (theme === 'dark' ? '#ffffff' : '#000000') : themeStyles.color,
                                        fontWeight: currentTab === 'active1' ? 'bold' : 'normal'
                                    }}
                                >
                                    ✅ Active1 ({active1TabData.length})
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Grid Body */}
                    <div className="card-body" style={{
                        backgroundColor: themeStyles.cardBg,
                        padding: isFullScreen ? 0 : 15
                    }}>
                        {currentRowData.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '50px',
                                color: themeStyles.color
                            }}>
                                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>👥</div>
                                <h5>No employee data available</h5>
                                <p>Please check your API connection or data source.</p>
                                <button
                                    className="btn btn-primary mt-3"
                                    onClick={refreshData}
                                >
                                    🔄 Retry Loading
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
                                        '--ag-secondary-border-color': '#343a40',
                                        '--ag-header-column-separator-color': '#495057',
                                        '--ag-row-border-color': '#343a40',
                                        '--ag-selected-row-background-color': '#28a745',
                                        '--ag-range-selection-background-color': '#28a74533',
                                        '--ag-cell-horizontal-border': '#343a40',
                                        '--ag-header-cell-hover-background-color': '#495057',
                                        '--ag-header-cell-moving-background-color': '#495057',
                                        '--ag-value-change-value-highlight-background-color': '#198754',
                                        '--ag-chip-background-color': '#495057',
                                        '--ag-input-background-color': '#343a40',
                                        '--ag-input-border-color': '#495057',
                                        '--ag-input-focus-border-color': '#28a745',
                                        '--ag-minichart-selected-chart-color': '#28a745',
                                        '--ag-minichart-selected-page-color': '#28a745',
                                        '--ag-pinned-left-border': '2px solid #495057',
                                        '--ag-pinned-right-border': '2px solid #495057'
                                    }),
                                    ...(theme === 'light' && {
                                        '--ag-selected-row-background-color': '#28a745',
                                        '--ag-range-selection-background-color': '#28a74533',
                                        '--ag-input-focus-border-color': '#28a745',
                                        '--ag-minichart-selected-chart-color': '#28a745',
                                        '--ag-minichart-selected-page-color': '#28a745',
                                        '--ag-checkbox-checked-color': '#28a745',
                                        '--ag-accent-color': '#28a745'
                                    })
                                }}
                            >
                                <AgGridReact
                                    ref={gridRef}
                                    rowData={currentRowData}
                                    columnDefs={columnDefs}
                                    defaultColDef={defaultColDef}
                                    pagination={true}
                                    paginationPageSize={isMobile ? 10 : 20}
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
                                    headerHeight={isMobile ? 40 : 48}
                                    rowHeight={isMobile ? 35 : 42}
                                    suppressMenuHide={isMobile}
                                    suppressContextMenu={isMobile}
                                    onGridReady={(params) => {
                                        console.log('Employee grid is ready');
                                        setTimeout(() => autoSizeAll(), 500);
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* // Add this just before the last closing </div> in your return statement */}
<ToastContainer
    position="top-right"
    autoClose={3000}
    hideProgressBar={false}
    newestOnTop
    closeOnClick
    rtl={false}
    pauseOnFocusLoss
    draggable
    pauseOnHover
    theme={theme}
/>
        </div>
    );
};

export default EmployeeTabsGrid;