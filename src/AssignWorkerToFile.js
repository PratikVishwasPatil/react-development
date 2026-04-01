import React, { useEffect, useMemo, useState, useRef } from "react";
import Select from 'react-select';
import { AgGridReact } from "ag-grid-react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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

const WorkerListManagement = () => {
    const [theme, setTheme] = useState('light');
    const [outsideRowData, setOutsideRowData] = useState([]);
    const [insideRowData, setInsideRowData] = useState([]);
    const [staffRowData, setStaffRowData] = useState([]);
    const [activeTab, setActiveTab] = useState('outside');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [loading, setLoading] = useState(true);
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [documents, setDocuments] = useState({
        esic: false,
        epf: false,
        wcPolicy: false,
        identity: false
    });
    const [assignedData, setAssignedData] = useState([]);
    const [filesList, setFilesList] = useState([]);
    const gridRef = useRef();

    const API_BASE_URL = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api";

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const commonColumnDefs = useMemo(() => [
        {
            headerName: "Sr No",
            valueGetter: (params) => params.node ? params.node.rowIndex + 1 : '',
            width: 80,
            minWidth: 50,
            pinned: 'left',
            cellStyle: { fontWeight: 'bold', textAlign: 'center' }
        },
        {
            headerName: "Select",
            field: "select",
            width: 80,
            pinned: 'left',
            headerCheckboxSelection: true,
            checkboxSelection: true
        },
        {
            field: "emp_code",
            headerName: "Employee Code",
            filter: "agTextColumnFilter",
            floatingFilter: true,
            width: 150,
            pinned: 'left'
        },
        {
            field: "emp_name",
            headerName: "Employee Name",
            filter: "agTextColumnFilter",
            floatingFilter: true,
            width: 200,
            tooltipField: "emp_name"
        },
        {
            field: "perDay",
            headerName: "Per Day",
            filter: "agNumberColumnFilter",
            floatingFilter: true,
            width: 120,
            cellStyle: { textAlign: 'right' }
        },
        {
            field: "category",
            headerName: "Category",
            filter: "agTextColumnFilter",
            floatingFilter: true,
            width: 150
        },
        {
            field: "file",
            headerName: "Assigned File",
            filter: "agTextColumnFilter",
            floatingFilter: true,
            width: 180
        },
        {
            field: "outside",
            headerName: "Work Location",
            filter: "agTextColumnFilter",
            floatingFilter: true,
            width: 140
        },
        {
            field: "assign_date",
            headerName: "From Date",
            filter: "agDateColumnFilter",
            floatingFilter: true,
            width: 130
        },
        {
            field: "status",
            headerName: "Is Site Incharge",
            filter: "agTextColumnFilter",
            floatingFilter: true,
            width: 140,
            cellStyle: (params) => ({
                color: params.value?.toLowerCase() === 'yes' ? '#28a745' : '#6c757d',
                fontWeight: params.value?.toLowerCase() === 'yes' ? 'bold' : 'normal'
            })
        }
    ], []);

    const defaultColDef = useMemo(() => ({
        filter: true,
        sortable: true,
        floatingFilter: true,
        resizable: true,
        cellStyle: { textAlign: 'right' }
    }), []);

    const fetchOutsideWorkers = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/WorkerListOutsideApi.php`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const result = await response.json();
            if (result.status === 'success' && Array.isArray(result.data)) {
                setOutsideRowData(result.data);
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

    const fetchInsideWorkers = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/WorkerListInsideApi.php`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const result = await response.json();
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

    const fetchStaffWorkers = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/WorkerListStaffApi.php`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const result = await response.json();
            if (result.status === 'success' && Array.isArray(result.data)) {
                setStaffRowData(result.data);
                return result.data.length;
            } else {
                setStaffRowData([]);
                return 0;
            }
        } catch (error) {
            console.error("Error fetching staff workers:", error);
            setStaffRowData([]);
            return 0;
        }
    };

    const fetchFilesList = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/WorkersFileListApi.php`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const result = await response.json();
            if (result.status === 'success' && Array.isArray(result.data)) {
                // Transform the data to react-select format
                const formattedFiles = result.data.map(item => ({
                    value: item.file_id,
                    label: item.file_name
                }));
                setFilesList(formattedFiles);
            } else {
                setFilesList([]);
            }
        } catch (error) {
            console.error("Error fetching files list:", error);
            setFilesList([]);
        }
    };

    const fetchAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchOutsideWorkers(),
                fetchInsideWorkers(),
                fetchStaffWorkers(),
                fetchFilesList()
            ]);
        } catch (error) {
            console.error("Error fetching worker data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const onSelectionChanged = (event) => {
        const selectedNodes = event.api.getSelectedNodes();
        setSelectedRows(selectedNodes.map(node => node.data));
    };

    const handleAssign = async () => {
        if (!selectedFile) {
            toast.error('Please select a file');
            return;
        }
        if (!selectedDate) {
            toast.error('Please select a date');
            return;
        }
        if (selectedRows.length === 0) {
            toast.error('Please select at least one employee');
            return;
        }
    
        const employee_id = sessionStorage.getItem('userId');
        if (!employee_id) {
            toast.error('User not authenticated. Please login again.');
            return;
        }
    
        const docArray = [];
        if (documents.esic) docArray.push('ESIC IP');
        if (documents.epf) docArray.push('EPF');
        if (documents.wcPolicy) docArray.push('WC POLICY');
        if (documents.identity) docArray.push('IDENTITY');
    
        const apiEndpoints = {
            outside: `${API_BASE_URL}/saveOutsideWorkerDataApi.php`,
            inside: `${API_BASE_URL}/saveInsideWorkerDataApi.php`,
            staff: `${API_BASE_URL}/saveStaffWorkerDataApi.php`
        };
    
        try {
            const formData = new FormData();
            formData.append('employee_id', employee_id);
            formData.append('selectedRows', JSON.stringify(selectedRows));
            formData.append('fileName', selectedFile.value);
            formData.append('companyname1', '');
            formData.append('date', selectedDate);
            formData.append('doc', JSON.stringify(docArray));
    
            console.log('Sending data:', {
                employee_id,
                selectedRows: selectedRows.length,
                fileName: selectedFile.value,
                date: selectedDate,
                doc: docArray
            });
    
            const response = await fetch(apiEndpoints[activeTab], {
                method: 'POST',
                body: formData
            });
    
            const result = await response.json();
            console.log('Response:', result);
    
            if (result.status) {
                const assignmentData = {
                    file: selectedFile.label,
                    fileId: selectedFile.value,
                    date: selectedDate,
                    documents: documents,
                    employees: selectedRows,
                    tab: activeTab,
                    timestamp: new Date().toISOString()
                };
    
                setAssignedData(prev => [...prev, assignmentData]);
                toast.success(result.message || `Successfully assigned ${selectedRows.length} employee(s)`);
                
                if (gridRef.current?.api) {
                    gridRef.current.api.deselectAll();
                }
                setSelectedRows([]);
                setSelectedFile(null);
                setSelectedDate('');
                setDocuments({ esic: false, epf: false, wcPolicy: false, identity: false });
                
                await fetchAllData();
            } else {
                console.error('Error details:', result);
                toast.error(result.error || result.message || 'Failed to assign workers');
                
                // Show debug info if available
                if (result.debug) {
                    console.log('Debug info:', result.debug);
                }
            }
        } catch (error) {
            console.error('Error assigning workers:', error);
            toast.error('Error assigning workers. Please try again.');
        }
    };

    const downloadCSV = () => {
        if (!gridRef.current?.api) return;
        try {
            gridRef.current.api.exportDataAsCsv({
                fileName: `${activeTab}_Workers_${new Date().toISOString().split('T')[0]}.csv`,
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

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
    const toggleFullScreen = () => setIsFullScreen(!isFullScreen);

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

    // Custom styles for react-select
    const selectStyles = {
        control: (base, state) => ({
            ...base,
            minHeight: '38px',
            borderColor: state.isFocused ? '#007bff' : '#ced4da',
            boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(0,123,255,.25)' : 'none',
            '&:hover': {
                borderColor: '#007bff'
            }
        }),
        menu: (base) => ({
            ...base,
            zIndex: 1000
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected ? '#007bff' : state.isFocused ? '#f8f9fa' : 'white',
            color: state.isSelected ? 'white' : '#495057',
            cursor: 'pointer',
            '&:active': {
                backgroundColor: '#007bff'
            }
        }),
        placeholder: (base) => ({
            ...base,
            color: '#6c757d'
        }),
        singleValue: (base) => ({
            ...base,
            color: '#495057'
        })
    };

    const themeStyles = getThemeStyles();
    const currentRowData = activeTab === 'outside' ? outsideRowData : 
                          activeTab === 'inside' ? insideRowData : staffRowData;
    const gridHeight = isFullScreen ? 'calc(100vh - 250px)' : '600px';

    useEffect(() => {
        document.body.style.background = themeStyles.backgroundColor;
        document.body.style.minHeight = '100vh';
        return () => {
            document.body.style.background = '';
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
                        width: '50px', 
                        height: '50px', 
                        border: '5px solid #f3f3f3',
                        borderTop: '5px solid #007bff',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 20px'
                    }}></div>
                    <p>Loading worker data...</p>
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
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .btn {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 500;
                    font-size: 14px;
                    transition: all 0.3s;
                }
                .btn-primary {
                    background: #007bff;
                    color: white;
                }
                .btn-primary:hover {
                    background: #0056b3;
                }
                .btn-success {
                    background: #28a745;
                    color: white;
                }
                .btn-success:hover {
                    background: #218838;
                }
                .btn-info {
                    background: #17a2b8;
                    color: white;
                }
                .btn-info:hover {
                    background: #138496;
                }
                .btn-outline-light {
                    background: transparent;
                    color: ${theme === 'dark' ? '#f8f9fa' : '#495057'};
                    border: 1px solid ${theme === 'dark' ? '#6c757d' : '#dee2e6'};
                }
                .btn-outline-light:hover {
                    background: ${theme === 'dark' ? '#495057' : '#e9ecef'};
                }
                .btn-group {
                    display: flex;
                    gap: 0;
                }
                .btn-group .btn {
                    border-radius: 0;
                }
                .btn-group .btn:first-child {
                    border-radius: 4px 0 0 4px;
                }
                .btn-group .btn:last-child {
                    border-radius: 0 4px 4px 0;
                }
                .custom-input {
                    padding: 8px 12px;
                    border: 1px solid #ced4da;
                    border-radius: 4px;
                    background: white;
                    font-size: 14px;
                    color: #495057;
                }
                .custom-checkbox {
                    width: 16px;
                    height: 16px;
                    cursor: pointer;
                }
                .assign-btn {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    padding: 12px 40px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 16px;
                    transition: all 0.3s;
                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                }
                .assign-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
                }
                .assign-btn:disabled {
                    background: #cccccc;
                    cursor: not-allowed;
                    box-shadow: none;
                    transform: none;
                }
            `}</style>

            <div style={{
                background: themeStyles.cardBg,
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
                    borderRadius: isFullScreen ? 0 : '8px 8px 0 0'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '15px'
                    }}>
                        <div>
                            <h4 style={{ margin: 0, marginBottom: '5px' }}>Worker List Management</h4>
                            <small style={{ opacity: 0.8 }}>
                                {currentRowData.length} workers
                                {selectedRows.length > 0 && ` | ${selectedRows.length} selected`}
                            </small>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <div className="btn-group">
                                <button className="btn btn-primary" onClick={fetchAllData}>
                                    ↻ Refresh
                                </button>
                                <button className="btn btn-success" onClick={downloadCSV}>
                                    ⬇ Export
                                </button>
                                <button className="btn btn-info" onClick={autoSizeAll}>
                                    ↔ Auto Size
                                </button>
                            </div>
                            <div className="btn-group">
                                <button className="btn btn-outline-light" onClick={toggleFullScreen}>
                                    {isFullScreen ? '⇱' : '⇲'}
                                </button>
                                <button className="btn btn-outline-light" onClick={toggleTheme}>
                                    {theme === 'light' ? '🌙' : '☀️'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ padding: '20px' }}>
                    {/* Assignment Controls */}
                    <div style={{
                        display: 'flex',
                        gap: '15px',
                        marginBottom: '20px',
                        flexWrap: 'wrap',
                        alignItems: 'center'
                    }}>
                        <div style={{ minWidth: '250px', flex: 1, maxWidth: '400px' }}>
                            <Select
                                value={selectedFile}
                                onChange={setSelectedFile}
                                options={filesList}
                                styles={selectStyles}
                                placeholder="Search and select file..."
                                isClearable
                                isSearchable
                                noOptionsMessage={() => "No files available"}
                            />
                        </div>

                        <input 
                            type="date" 
                            className="custom-input"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />

                        <div style={{ marginLeft: 'auto', display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '14px', fontWeight: '600' }}>Required Documents:</span>
                            {['ESIC IP', 'EPF', 'WC POLICY', 'IDENTITY'].map((doc, i) => {
                                const key = ['esic', 'epf', 'wcPolicy', 'identity'][i];
                                return (
                                    <label key={doc} style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                                        <input 
                                            type="checkbox" 
                                            className="custom-checkbox"
                                            checked={documents[key]}
                                            onChange={(e) => setDocuments({...documents, [key]: e.target.checked})}
                                        />
                                        <span style={{ fontSize: '14px' }}>{doc}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div style={{ marginBottom: '20px' }}>
                        <div className="btn-group" style={{ width: '100%' }}>
                            <button
                                className={`btn ${activeTab === 'outside' ? 'btn-primary' : 'btn-outline-light'}`}
                                onClick={() => setActiveTab('outside')}
                                style={{ flex: 1 }}
                            >
                                Outside ({outsideRowData.length})
                            </button>
                            <button
                                className={`btn ${activeTab === 'inside' ? 'btn-primary' : 'btn-outline-light'}`}
                                onClick={() => setActiveTab('inside')}
                                style={{ flex: 1 }}
                            >
                                Inside ({insideRowData.length})
                            </button>
                            <button
                                className={`btn ${activeTab === 'staff' ? 'btn-primary' : 'btn-outline-light'}`}
                                onClick={() => setActiveTab('staff')}
                                style={{ flex: 1 }}
                            >
                                Staff ({staffRowData.length})
                            </button>
                        </div>
                    </div>

                    {/* Grid */}
                    {currentRowData.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '50px', color: themeStyles.color }}>
                            <h5>No {activeTab} workers found</h5>
                            <p>No data available for this category.</p>
                            <button className="btn btn-primary" onClick={fetchAllData}>
                                Refresh Data
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="ag-theme-alpine" style={{
                                height: gridHeight,
                                width: "100%",
                                marginBottom: '20px',
                                ...(theme === 'dark' && {
                                    '--ag-background-color': '#212529',
                                    '--ag-header-background-color': '#343a40',
                                    '--ag-odd-row-background-color': '#2c3034',
                                    '--ag-foreground-color': '#f8f9fa',
                                    '--ag-border-color': '#495057'
                                })
                            }}>
                                <AgGridReact
                                    ref={gridRef}
                                    rowData={currentRowData}
                                    columnDefs={commonColumnDefs}
                                    defaultColDef={defaultColDef}
                                    pagination={true}
                                    paginationPageSize={pageSize}
                                    rowSelection="multiple"
                                    onSelectionChanged={onSelectionChanged}
                                    animateRows={true}
                                    onGridReady={() => setTimeout(() => autoSizeAll(), 500)}
                                />
                            </div>

                            {/* Assign Button */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: '20px',
                                borderTop: '2px solid #e9ecef'
                            }}>
                                <div style={{ textAlign: 'center' }}>
                                    {selectedRows.length > 0 && (
                                        <p style={{ marginBottom: '15px', fontSize: '14px', color: '#6c757d' }}>
                                            {selectedRows.length} employee(s) selected
                                        </p>
                                    )}
                                    <button 
                                        className="assign-btn"
                                        onClick={handleAssign}
                                        disabled={!selectedFile || !selectedDate || selectedRows.length === 0}
                                    >
                                        Assign Workers
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Assignment History */}
            {assignedData.length > 0 && (
                <div style={{
                    background: themeStyles.cardBg,
                    borderRadius: '8px',
                    padding: '20px',
                    margin: '20px',
                    border: theme === 'dark' ? '1px solid #495057' : '1px solid #dee2e6'
                }}>
                    <h5 style={{ marginBottom: '15px' }}>Assignment History</h5>
                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {assignedData.map((assignment, index) => (
                            <div key={index} style={{
                                padding: '10px',
                                marginBottom: '10px',
                                background: theme === 'dark' ? '#495057' : '#f8f9fa',
                                borderRadius: '4px',
                                fontSize: '13px'
                            }}>
                                <strong>Assignment #{index + 1}</strong> - 
                                File: {assignment.file} | 
                                Date: {assignment.date} | 
                                Employees: {assignment.employees.length} | 
                                Tab: {assignment.tab}
                            </div>
                        ))}
                    </div>
                </div>
            )}

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

export default WorkerListManagement;