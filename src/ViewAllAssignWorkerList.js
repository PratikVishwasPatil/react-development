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
import { useNavigate } from 'react-router-dom';

import { useParams } from "react-router-dom";

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

const ViewAllAssignWorkerList = () => {
    // In your actual implementation with react-router-dom, use:
    const { fileid } = useParams();
    const navigate = useNavigate();

    const [theme, setTheme] = useState('light');
    const [outsideRowData, setOutsideRowData] = useState([]);
    const [insideRowData, setInsideRowData] = useState([]);
    const [activeTab, setActiveTab] = useState('outside');
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [loading, setLoading] = useState(true);
    const [selectedRows, setSelectedRows] = useState([]);
    const [fileInfo, setFileInfo] = useState(null);
    const gridRef = useRef();

    const API_BASE_URL = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api";

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const outsideColumnDefs = useMemo(() => [
        {
            headerName: "Sr No",
            valueGetter: (params) => params.node ? params.node.rowIndex + 1 : '',
            width: isMobile ? 60 : 80,
            minWidth: 50,
            pinned: 'left',
            cellStyle: { fontWeight: 'bold', textAlign: 'center' }
        },
        {
            field: "emp_code",
            headerName: "Employee Code",
            filter: "agTextColumnFilter",
            floatingFilter: !isMobile,
            width: isMobile ? 120 : 150,
            checkboxSelection: false,
            headerCheckboxSelection: false,
            pinned: 'left'
        },
        {
            field: "name",
            headerName: "Employee Name",
            filter: "agTextColumnFilter",
            floatingFilter: !isMobile,
            width: isMobile ? 180 : 250,
            tooltipField: "name"
        },
        {
            field: "outside_employee_type",
            headerName: "Category",
            filter: "agTextColumnFilter",
            floatingFilter: !isMobile,
            width: isMobile ? 150 : 200
        },
        {
            field: "is_site_incharge",
            headerName: "Is Site Incharge",
            filter: "agTextColumnFilter",
            floatingFilter: !isMobile,
            width: isMobile ? 120 : 150,
            cellStyle: (params) => ({
                color: params.value === 'Yes' ? '#28a745' : '#6c757d',
                fontWeight: params.value === 'Yes' ? 'bold' : 'normal'
            })
        },
        {
            field: "FILE_NAME",
            headerName: "File Name",
            filter: "agTextColumnFilter",
            floatingFilter: !isMobile,
            width: isMobile ? 150 : 200
        },
        {
            field: "location",
            headerName: "Work Location",
            filter: "agTextColumnFilter",
            floatingFilter: !isMobile,
            width: isMobile ? 120 : 150
        },
        {
            field: "date",
            headerName: "From Date",
            filter: "agDateColumnFilter",
            floatingFilter: !isMobile,
            width: isMobile ? 120 : 150
        }
    ], [isMobile]);

    const insideColumnDefs = useMemo(() => [
        {
            headerName: "Sr No",
            valueGetter: (params) => params.node ? params.node.rowIndex + 1 : '',
            width: isMobile ? 60 : 80,
            minWidth: 50,
            pinned: 'left',
            cellStyle: { fontWeight: 'bold', textAlign: 'center' }
        },
        {
            field: "emp_code",
            headerName: "Employee Code",
            filter: "agTextColumnFilter",
            floatingFilter: !isMobile,
            width: isMobile ? 120 : 150,
            checkboxSelection: false,
            headerCheckboxSelection: false,
            pinned: 'left'
        },
        {
            field: "name",
            headerName: "Employee Name",
            filter: "agTextColumnFilter",
            floatingFilter: !isMobile,
            width: isMobile ? 180 : 250,
            tooltipField: "name"
        },
        {
            field: "outside_employee_type",
            headerName: "Category",
            filter: "agTextColumnFilter",
            floatingFilter: !isMobile,
            width: isMobile ? 150 : 200
        },
        {
            field: "FILE_NAME",
            headerName: "File Name",
            filter: "agTextColumnFilter",
            floatingFilter: !isMobile,
            width: isMobile ? 150 : 200
        },
        {
            field: "location",
            headerName: "Work Location",
            filter: "agTextColumnFilter",
            floatingFilter: !isMobile,
            width: isMobile ? 120 : 150
        },
        {
            field: "date",
            headerName: "From Date",
            filter: "agDateColumnFilter",
            floatingFilter: !isMobile,
            width: isMobile ? 120 : 150
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

    const fetchOutsideWorkers = async (fileid) => {
        try {
            const response = await fetch(`${API_BASE_URL}/ViewAllAssignWorkerListApi.php?file_id=${fileid}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const result = await response.json();
            console.log("Outside Workers API Response:", result);

            if (result.status === 'success' && Array.isArray(result.data)) {
                setOutsideRowData(result.data);
                if (result.data.length > 0) {
                    setFileInfo({
                        fileName: result.data[0].FILE_NAME,
                        total: result.total || result.data.length
                    });
                }
                return result.data.length;
            } else {
                setOutsideRowData([]);
                return 0;
            }
        } catch (error) {
            console.error("Error fetching outside workers:", error);
            setOutsideRowData([]);
            return 0;
        }
    };

    const fetchInsideWorkers = async (fileid) => {
        try {
            const response = await fetch(`${API_BASE_URL}/ViewInsideAssignWorkerListApi.php?file_id=${fileid}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const result = await response.json();
            console.log("Inside Workers API Response:", result);

            if (result.status === 'success' && Array.isArray(result.data)) {
                setInsideRowData(result.data);
                return result.data.length;
            } else {
                setInsideRowData([]);
                return 0;
            }
        } catch (error) {
            console.error("Error fetching inside workers:", error);
            setInsideRowData([]);
            return 0;
        }
    };

    const fetchAllData = async () => {
        if (!fileid) {
            console.error("No file ID provided");
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            await Promise.all([
                fetchOutsideWorkers(fileid),
                fetchInsideWorkers(fileid)
            ]);
        } catch (error) {
            console.error("Error fetching worker data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (fileid) {
            fetchAllData();
        }
    }, [fileid]);

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
    const toggleFullScreen = () => setIsFullScreen(!isFullScreen);

    const onSelectionChanged = (event) => {
        const selectedNodes = event.api.getSelectedNodes();
        setSelectedRows(selectedNodes.map(node => node.data));
    };

    const downloadExcel = () => {
        if (!gridRef.current?.api) return;
        try {
            gridRef.current.api.exportDataAsCsv({
                fileName: `${activeTab}_Workers_${fileid}_${new Date().toISOString().split('T')[0]}.csv`,
                allColumns: true,
                onlySelected: false
            });
        } catch (error) {
            console.error("Error exporting CSV:", error);
        }
    };

    const autoSizeAll = () => {
        if (!gridRef.current?.api) return;
        setTimeout(() => {
            const allColumnIds = gridRef.current.api.getColumns()?.map(col => col.getId()) || [];
            if (allColumnIds.length > 0) {
                gridRef.current.api.autoSizeColumns(allColumnIds, false);
            }
        }, 100);
    };

    const handleBackToGrid = () => {
        navigate('/project/site/view-assign-workers');
        console.log('Navigate back to grid');
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
    const gridHeight = isFullScreen ? 'calc(100vh - 250px)' : (isMobile ? '400px' : '600px');
    const currentRowData = activeTab === 'outside' ? outsideRowData : insideRowData;
    const currentColumnDefs = activeTab === 'outside' ? outsideColumnDefs : insideColumnDefs;

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
                    <p className="mt-3">Loading worker assignments...</p>
                </div>
            </div>
        );
    }

    if (!fileid) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: themeStyles.backgroundColor
            }}>
                <div style={{ textAlign: 'center', color: themeStyles.color }}>
                    <i className="bi bi-exclamation-circle" style={{ fontSize: '3rem', marginBottom: '20px' }}></i>
                    <h5>No File ID Provided</h5>
                    <p>Please navigate from the worker assignment grid.</p>
                    <button className="btn btn-primary" onClick={handleBackToGrid}>
                        <i className="bi bi-arrow-left"></i> Back to Grid
                    </button>
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
                    <div className="card-header" style={{
                        background: themeStyles.cardHeader,
                        color: theme === 'dark' ? '#ffffff' : '#000000',
                        fontFamily: "'Maven Pro', sans-serif",
                        padding: '1rem 2rem'
                    }}>
                        <div className="row align-items-center">
                            <div className="col-12 col-lg-6 mb-2 mb-lg-0">
                                <div className="d-flex align-items-center gap-3">
                                    <button className="btn btn-outline-secondary btn-sm" onClick={handleBackToGrid}>
                                        <i className="bi bi-arrow-left"></i> Back
                                    </button>
                                    <div>
                                        <h4 className="mb-0">Assigned Workers</h4>
                                        <small style={{ opacity: 0.8 }}>
                                            File: {fileInfo?.fileName || fileid} | {currentRowData.length} workers
                                            {selectedRows.length > 0 && ` | ${selectedRows.length} selected`}
                                        </small>
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 col-lg-6">
                                <div className="d-flex justify-content-end gap-2 flex-wrap">
                                    <div className="btn-group btn-group-sm">
                                        <button className="btn btn-primary" onClick={fetchAllData}>
                                            <i className="bi bi-arrow-clockwise"></i>
                                            {!isMobile && ' Refresh'}
                                        </button>
                                        <button className="btn btn-success" onClick={downloadExcel}>
                                            <i className="bi bi-file-earmark-excel"></i>
                                            {!isMobile && ' Export'}
                                        </button>
                                        <button className="btn btn-info" onClick={autoSizeAll}>
                                            <i className="bi bi-arrows-angle-expand"></i>
                                            {!isMobile && ' Auto Size'}
                                        </button>
                                    </div>
                                    <div className="btn-group btn-group-sm">
                                        <button className="btn btn-outline-light" onClick={toggleFullScreen}>
                                            <i className={`bi ${isFullScreen ? 'bi-fullscreen-exit' : 'bi-fullscreen'}`}></i>
                                        </button>
                                        <button className="btn btn-outline-light" onClick={toggleTheme}>
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
                        <div className="mb-3" style={{ padding: '0 15px' }}>
                            <div className="btn-group w-100">
                                <button
                                    className={`btn ${activeTab === 'outside' ? 'btn-primary' : 'btn-outline-primary'}`}
                                    onClick={() => setActiveTab('outside')}
                                    style={{ flex: 1 }}
                                >
                                    <i className="bi bi-geo-alt"></i> Outside ({outsideRowData.length})
                                </button>
                                <button
                                    className={`btn ${activeTab === 'inside' ? 'btn-primary' : 'btn-outline-primary'}`}
                                    onClick={() => setActiveTab('inside')}
                                    style={{ flex: 1 }}
                                >
                                    <i className="bi bi-building"></i> Inside ({insideRowData.length})
                                </button>
                            </div>
                        </div>

                        {currentRowData.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '50px', color: themeStyles.color }}>
                                <i className="bi bi-people" style={{ fontSize: '3rem', marginBottom: '20px' }}></i>
                                <h5>No {activeTab} workers assigned</h5>
                                <p>No workers found for this file in the {activeTab} category.</p>
                                <button className="btn btn-primary" onClick={fetchAllData}>
                                    <i className="bi bi-arrow-clockwise"></i> Refresh
                                </button>
                            </div>
                        ) : (
                            <div className="ag-theme-alpine" style={{
                                height: gridHeight,
                                width: "100%",
                                ...(theme === 'dark' && {
                                    '--ag-background-color': '#212529',
                                    '--ag-header-background-color': '#343a40',
                                    '--ag-odd-row-background-color': '#2c3034',
                                    '--ag-foreground-color': '#f8f9fa',
                                    '--ag-border-color': '#495057',
                                    '--ag-selected-row-background-color': '#28a745'
                                })
                            }}>
                                <AgGridReact
                                    ref={gridRef}
                                    rowData={currentRowData}
                                    columnDefs={currentColumnDefs}
                                    defaultColDef={defaultColDef}
                                    pagination={true}
                                    paginationPageSize={isMobile ? 10 : 20}
                                    rowSelection="multiple"
                                    onSelectionChanged={onSelectionChanged}
                                    animateRows={!isMobile}
                                    onGridReady={() => setTimeout(autoSizeAll, 500)}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewAllAssignWorkerList;