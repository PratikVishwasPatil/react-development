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

// ─────────────────────────────────────────────────────────────────────────────
// ✅ FIX: ALL cell renderer components are defined OUTSIDE the parent component.
//    Defining them inside caused ag-Grid to see a new function reference on
//    every render → cells remounted → typed values disappeared.
// ─────────────────────────────────────────────────────────────────────────────

// ── Editable Text Input Cell ──────────────────────────────────────────────────
const EditableInputCell = ({ value, node, colDef }) => {
    const [inputValue, setInputValue] = React.useState(value ?? "");
    const [focused, setFocused] = React.useState(false);

    React.useEffect(() => {
        setInputValue(value ?? "");
    }, [value]);

    const handleChange = (e) => {
        const newVal = e.target.value;
        setInputValue(newVal);
        node.setDataValue(colDef.field, newVal);
    };

    return (
        <input
            type="text"
            value={inputValue}
            onChange={handleChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
                width: "100%",
                height: "100%",
                border: focused ? "2px solid #f59e0b" : "1px solid transparent",
                borderRadius: 3,
                padding: "0 6px",
                textAlign: "right",
                fontSize: 11,
                background: focused ? "#fffdf0" : "transparent",
                outline: "none",
                fontWeight: 600,
                color: "#1a2332",
                transition: "all 0.15s"
            }}
        />
    );
};

// ── Work Completion Status Renderer (progress bar + inline edit) ──────────────
const WorkCompletionStatusRenderer = (props) => {
    const [editMode, setEditMode] = React.useState(false);
    const [inputValue, setInputValue] = React.useState(props.data.w_compl_status || 0);
    const [focused, setFocused] = React.useState(false);

    React.useEffect(() => {
        setInputValue(props.data.w_compl_status || 0);
    }, [props.data.w_compl_status]);

    const handleInputChange = (e) => {
        const newValue = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0));
        setInputValue(newValue);
    };

    const commitValue = () => {
        props.node.setDataValue("w_compl_status", inputValue);
        setEditMode(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === 'Tab') commitValue();
        if (e.key === 'Escape') setEditMode(false);
    };

    const value = props.data.w_compl_status || 0;
    const color = value >= 100 ? '#28a745' : value >= 80 ? '#ffc107' : value >= 50 ? '#17a2b8' : '#dc3545';

    if (editMode) {
        return (
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', height: '100%', gap: 4 }}>
                <input
                    type="number"
                    min="0"
                    max="100"
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={commitValue}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setFocused(true)}
                    autoFocus
                    style={{
                        width: '65px', height: '22px',
                        border: `2px solid #f59e0b`,
                        borderRadius: 3, fontSize: 11,
                        textAlign: 'center', background: '#fffdf0',
                        outline: 'none', fontWeight: 600
                    }}
                />
                <span style={{ fontSize: 11, color: '#666' }}>%</span>
            </div>
        );
    }

    return (
        <div
            style={{ width: '100%', display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 6 }}
            onClick={() => setEditMode(true)}
            title="Click to edit"
        >
            <div style={{
                flex: 1, height: 16, backgroundColor: '#e9ecef',
                borderRadius: 8, overflow: 'hidden'
            }}>
                <div style={{
                    width: `${Math.min(value, 100)}%`, height: '100%',
                    backgroundColor: color, transition: 'width 0.3s ease'
                }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color, minWidth: 30, textAlign: 'right' }}>
                {value}%
            </span>
        </div>
    );
};

// ── Project Cost Renderer (click-to-edit number) ──────────────────────────────
const ProjectCostRenderer = (props) => {
    const [editMode, setEditMode] = React.useState(false);
    const [inputValue, setInputValue] = React.useState(props.data.project_Est_cost || 0);

    React.useEffect(() => {
        setInputValue(props.data.project_Est_cost || 0);
    }, [props.data.project_Est_cost]);

    const handleInputChange = (e) => {
        setInputValue(parseFloat(e.target.value) || 0);
    };

    const commitValue = () => {
        props.node.setDataValue("project_Est_cost", inputValue);
        setEditMode(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === 'Tab') commitValue();
        if (e.key === 'Escape') setEditMode(false);
    };

    const formatCurrency = (val) =>
        Number(val).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

    if (editMode) {
        return (
            <input
                type="number"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={commitValue}
                onKeyDown={handleKeyDown}
                autoFocus
                style={{
                    width: '100%', height: '100%',
                    border: '2px solid #f59e0b', borderRadius: 3,
                    fontSize: 11, textAlign: 'right',
                    background: '#fffdf0', outline: 'none', fontWeight: 600
                }}
            />
        );
    }

    return (
        <div
            style={{ width: '100%', textAlign: 'right', cursor: 'pointer', color: '#28a745', fontSize: 11, fontWeight: 600 }}
            onClick={() => setEditMode(true)}
            title="Click to edit"
        >
            {formatCurrency(props.data.project_Est_cost || 0)}
        </div>
    );
};
// ─────────────────────────────────────────────────────────────────────────────


const SiteDashboardPending = () => {
    const [theme, setTheme] = useState('light');
    const [rowData, setRowData] = useState([]);
    const [columnDefs, setColumnDefs] = useState([]);
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [loading, setLoading] = useState(true);
    const [selectedRows, setSelectedRows] = useState([]);
    const [financialYear, setFinancialYear] = useState('25-26');
    const [financialYearOptions, setFinancialYearOptions] = useState([]);
    const [pageSize, setPageSize] = useState(10);
    const [supervisors, setSupervisors] = useState([]);
    const gridRef = useRef();

    const formTitle = "Site Dashboard Pending Files";

    // Handle window resize
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch financial years
    const fetchFinancialYears = async () => {
        try {
            const response = await fetch("https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/GetYearsApi.php");
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();

            if (data.status === "success" && Array.isArray(data.data)) {
                const years = data.data.map(item => ({
                    value: item.financial_year,
                    label: `20${item.financial_year}`
                }));
                setFinancialYearOptions(years);
                if (data.data.length > 0) {
                    setFinancialYear(data.data[data.data.length - 1].financial_year);
                }
            }
        } catch (error) {
            console.error("Error fetching financial years:", error);
            setFinancialYearOptions([
                { value: '22-23', label: '2022-23' },
                { value: '23-24', label: '2023-24' },
                { value: '24-25', label: '2024-25' },
                { value: '25-26', label: '2025-26' }
            ]);
        }
    };

    // Fetch supervisors
    const fetchSupervisors = async () => {
        try {
            const response = await fetch('https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/getSupervisorListApi.php', {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const result = await response.json();

            if (result.status === 'success' && Array.isArray(result.data)) {
                const cleanedSupervisors = result.data.filter(s =>
                    s && s.trim() !== '' &&
                    s !== 'Please Select Supplier' &&
                    s !== 'REMOVE'
                ).map(s => s.trim());
                setSupervisors(cleanedSupervisors);
            } else {
                setSupervisors([]);
            }
        } catch (error) {
            console.error("Error fetching supervisors:", error);
            setSupervisors([
                "Santosh Mahadev Salunkhe",
                "Mohan Prakash Patil",
                "Hari Namdev Masurakar",
                "Yuvraj Vitthal Chindage",
                "Bajirao Vishnu Lohar"
            ]);
        }
    };

    // Fetch pending files
    const fetchPendingFiles = async (year = financialYear) => {
        setLoading(true);
        try {
            const response = await fetch(
                `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/getSiteDashboardSavedListApi.php?financial_year=${year}`,
                { method: "GET", headers: { "Content-Type": "application/json" } }
            );
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const result = await response.json();

            if (result.status === 'success' && Array.isArray(result.data)) {
                setRowData(result.data);
            } else {
                setRowData([]);
            }
        } catch (error) {
            console.error("Error fetching pending files data:", error);
            setRowData([]);
        } finally {
            setLoading(false);
        }
    };

    // Save row data
    const saveRowData = async (data) => {
        try {
            const formData = new FormData();
            formData.append('file', data.FILE_ID || '');
            formData.append('ProType', data.product_name || '');
            formData.append('date', data.date || '');
            formData.append('supplier', data.supplerName || '');
            formData.append('CompWork', data.w_compl_status || '0');
            formData.append('location', data.city || '');
            formData.append('handover', data.handover_date || '');
            formData.append('project_Est_cost', data.project_Est_cost || '0');

            const response = await fetch(
                'https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/SaveEditSiteDataApi.php',
                { method: 'POST', body: formData }
            );
            const result = await response.json();

            if (result.status === 'success') {
                toast.success('Data saved successfully!');
            } else {
                toast.error('Error: ' + (result.message || 'Failed to save data'));
            }
        } catch (error) {
            toast.error('Network error: ' + error.message);
        }
    };

    // File upload handler
    const handleFileUpload = async (event, rowDataItem, fieldName) => {
        const file = event.target.files[0];
        if (!file) return;

        const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

        if (!allowedTypes.includes(fileExtension)) {
            toast.error('Please select a valid file type: PDF, DOC, DOCX, JPG, JPEG, or PNG');
            event.target.value = '';
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            toast.error('File size must be less than 10MB');
            event.target.value = '';
            return;
        }

        try {
            const uploadButton = event.target.parentElement.querySelector('button');
            if (uploadButton) { uploadButton.disabled = true; uploadButton.innerHTML = '⏳ Uploading...'; }

            const formData = new FormData();
            formData.append('handover_file', file);
            formData.append('file_id', rowDataItem.FILE_ID);
            formData.append('file_name', rowDataItem.FILE_NAME);
            formData.append('field_name', fieldName);

            const response = await fetch(
                'https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/uploadHandoverReport.php',
                { method: 'POST', body: formData }
            );
            const result = await response.json();

            if (result.status === 'success') {
                rowDataItem[fieldName] = result.file_path;
                rowDataItem.handover_file = result.file_path;
                if (gridRef.current?.api) {
                    gridRef.current.api.refreshCells({ force: true, columns: [fieldName, 'handover_file'] });
                }
                toast.success('File uploaded successfully!');
                if (uploadButton) { uploadButton.disabled = false; uploadButton.innerHTML = '↺ Replace File'; }
            } else {
                toast.error('File upload failed: ' + (result.message || 'Unknown error'));
                if (uploadButton) { uploadButton.disabled = false; uploadButton.innerHTML = '↑ Upload File'; }
            }
        } catch (error) {
            toast.error('Error uploading file. Please try again.');
            const uploadButton = event.target.parentElement.querySelector('button');
            if (uploadButton) { uploadButton.disabled = false; uploadButton.innerHTML = '↑ Upload File'; }
        } finally {
            event.target.value = '';
        }
    };

    // useEffects
    useEffect(() => { fetchFinancialYears(); fetchSupervisors(); }, []);
    useEffect(() => { if (financialYear) fetchPendingFiles(); }, [financialYear]);
    useEffect(() => { setColumnDefs(generateColumnDefs()); }, [isMobile, isFullScreen, supervisors]);

    // Column definitions — all cellRenderers reference stable external components
    const generateColumnDefs = () => [
        {
            headerName: "File No.",
            field: "FILE_NAME",
            width: 120, minWidth: 100,
            pinned: 'left', lockPosition: true,
            cellStyle: { fontWeight: 'bold', textAlign: 'center', backgroundColor: '#f8f9fa' }
        },
        {
            field: "product_name",
            headerName: "Type",
            filter: "agTextColumnFilter",
            floatingFilter: !isMobile,
            width: 120, minWidth: 100,
            resizable: true, sortable: true,
            cellStyle: { backgroundColor: '#f8f9fa', fontSize: '11px' }
        },
        {
            field: "city",
            headerName: "City",
            filter: "agTextColumnFilter",
            floatingFilter: !isMobile,
            width: 120, minWidth: 100,
            resizable: true, sortable: true,
            cellRenderer: (params) => {
                const cities = [
                    "Ahmedabad","Ankleshwar","Aurangabad","Baddi","Bangalore","Baroda",
                    "Belgaum","Dahej","Export","Gandhinagar","Gaziabad","Goa","Gokak",
                    "Gokul Shirgaon","Guwahati","Hyderabad","Indore","Jammu and Kashmir",
                    "Kagal","Kirloskarvadi","Kolhapur","Kurkumbh","Ratlam","Mumbai","Nagpur",
                    "Nashik","Puducherry","Pune","Roha","Roorkee","Sangli","Satara","Shiroli",
                    "Sikkim","Tarapur","Tardal","Toap","Vishakhapatnam","Patalganga"
                ];
                return (
                    <select
                        value={params.data.city || ""}
                        onChange={(e) => params.node.setDataValue("city", e.target.value)}
                        style={{ width: "100%", height: "100%", border: "none", background: "transparent", fontSize: "11px" }}
                    >
                        <option value="">Select City</option>
                        {cities.map(city => <option key={city} value={city}>{city}</option>)}
                    </select>
                );
            },
            cellStyle: { backgroundColor: "#f8f9fa", fontSize: "11px", padding: "0" }
        },
        {
            field: "date",
            headerName: "Site Start Date",
            filter: "agDateColumnFilter",
            floatingFilter: !isMobile,
            width: 140, minWidth: 120,
            resizable: true, sortable: true,
            cellRenderer: (params) => {
                const formatDateForInput = (dateStr) => {
                    if (!dateStr) return "";
                    if (dateStr.includes("-")) {
                        const parts = dateStr.split("-");
                        if (parts[0].length === 4) return dateStr;
                        return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
                    }
                    return "";
                };
                return (
                    <input
                        type="date"
                        value={formatDateForInput(params.data.date)}
                        onChange={(e) => params.node.setDataValue("date", e.target.value)}
                        style={{ width: "100%", height: "100%", border: "none", backgroundColor: "#f8f9fa", fontSize: "11px", outline: "none", textAlign: "center", padding: "0" }}
                    />
                );
            },
            cellStyle: { textAlign: "center", backgroundColor: "#f8f9fa", fontSize: "11px", padding: "0" }
        },
        {
            field: "supplerName",
            headerName: "Supervisor",
            filter: "agTextColumnFilter",
            floatingFilter: !isMobile,
            width: isMobile ? 120 : 150, minWidth: 100,
            resizable: true, sortable: true,
            cellRenderer: (params) => (
                <select
                    value={params.data.supplerName || ""}
                    onChange={(e) => params.node.setDataValue("supplerName", e.target.value)}
                    style={{ width: "100%", height: "100%", border: "none", backgroundColor: "transparent", fontSize: "11px", outline: "none" }}
                >
                    <option value="">Select Supervisor</option>
                    {supervisors.length === 0
                        ? <option value="" disabled>Loading supervisors...</option>
                        : supervisors.map((s, i) => <option key={`${s}-${i}`} value={s}>{s}</option>)
                    }
                </select>
            ),
            cellStyle: { backgroundColor: "#f8f9fa", fontSize: "11px", padding: "0" }
        },
        {
            field: "w_compl_status",
            headerName: "Status (Work % Completion)",
            filter: "agNumberColumnFilter",
            floatingFilter: !isMobile,
            width: 190, minWidth: 160,
            resizable: true, sortable: true,
            // ✅ References stable external component
            cellRenderer: WorkCompletionStatusRenderer,
            cellStyle: { backgroundColor: '#f8f9fa', padding: '4px 6px' }
        },
        {
            field: "project_Est_cost",
            headerName: "Project Est. Cost",
            filter: "agNumberColumnFilter",
            floatingFilter: !isMobile,
            width: 140, minWidth: 120,
            resizable: true, sortable: true,
            // ✅ References stable external component
            cellRenderer: ProjectCostRenderer,
            cellStyle: { textAlign: 'right', backgroundColor: '#f8f9fa', fontSize: '11px', padding: '0' }
        },
        {
            field: "total_project_cost",
            headerName: "Total Project Cost",
            filter: "agNumberColumnFilter",
            floatingFilter: !isMobile,
            width: 150, minWidth: 120,
            resizable: true, sortable: true,
            cellRenderer: (params) => {
                const value = params.value || 0;
                return Number(value).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
            },
            cellStyle: { textAlign: 'right', fontWeight: 'bold', backgroundColor: '#f8f9fa', fontSize: '11px' }
        },
        {
            field: "handover_date",
            headerName: "Handover Date",
            filter: "agDateColumnFilter",
            floatingFilter: !isMobile,
            width: 130, minWidth: 110,
            resizable: true, sortable: true,
            cellRenderer: (params) => {
                const formatDateForInput = (dateStr) => {
                    if (!dateStr) return "";
                    if (dateStr.includes("-")) {
                        const parts = dateStr.split("-");
                        if (parts[0].length === 4) return dateStr;
                        return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
                    }
                    return "";
                };
                return (
                    <input
                        type="date"
                        value={formatDateForInput(params.data.handover_date)}
                        onChange={(e) => params.node.setDataValue("handover_date", e.target.value)}
                        style={{ width: "100%", height: "100%", border: "none", backgroundColor: "#f8f9fa", fontSize: "11px", outline: "none", textAlign: "center", padding: "0" }}
                    />
                );
            },
            cellStyle: { textAlign: "center", backgroundColor: "#f8f9fa", fontSize: "11px", padding: "0" }
        },
        {
            field: "handover_report",
            headerName: "Handover Report",
            width: 180, minWidth: 150,
            resizable: true, sortable: false, filter: false,
            cellRenderer: (params) => {
                const hasFile = params.data?.handover_file && params.data.handover_file !== '';
                return (
                    <div style={{ display: 'flex', alignItems: 'center', height: '100%', gap: 5 }}>
                        <input
                            type="file"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload(e, params.data, "handover_report")}
                            style={{ display: 'none' }}
                            id={`file-upload-${params.data.FILE_ID}`}
                        />
                        {hasFile ? (
                            <>
                                <span style={{ fontSize: 9, color: '#28a745', fontWeight: 'bold', whiteSpace: 'nowrap' }}>✓ Uploaded</span>
                                <button
                                    onClick={() => document.getElementById(`file-upload-${params.data.FILE_ID}`).click()}
                                    style={{ fontSize: 8, padding: '2px 4px', border: 'none', borderRadius: 3, background: '#17a2b8', color: 'white', cursor: 'pointer' }}
                                >↺ Replace</button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => document.getElementById(`file-upload-${params.data.FILE_ID}`).click()}
                                    style={{ fontSize: 8, padding: '2px 6px', border: 'none', borderRadius: 3, background: '#6c757d', color: 'white', cursor: 'pointer' }}
                                >↑ Choose File</button>
                                <span style={{ fontSize: 8, color: '#dc3545', whiteSpace: 'nowrap' }}>No file</span>
                            </>
                        )}
                    </div>
                );
            },
            cellStyle: { backgroundColor: '#f8f9fa' }
        },
        {
            field: "action",
            headerName: "Action",
            width: 100, minWidth: 80,
            resizable: true, sortable: false, filter: false,
            cellRenderer: (params) => (
                <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center' }}>
                    <button
                        onClick={() => saveRowData(params.data)}
                        style={{
                            background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                            color: 'white', border: 'none', borderRadius: 6,
                            padding: '4px 12px', fontSize: 10, cursor: 'pointer',
                            fontWeight: 700,
                            boxShadow: '0 2px 4px rgba(0,123,255,0.2)',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,123,255,0.3)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,123,255,0.2)'; }}
                        title="Save Record"
                    >
                        💾 Save
                    </button>
                </div>
            ),
            cellStyle: { textAlign: 'center', backgroundColor: '#f8f9fa' }
        }
    ];

    const defaultColDef = useMemo(() => ({
        filter: true,
        sortable: true,
        floatingFilter: !isMobile,
        resizable: true,
        suppressMenu: isMobile,
    }), [isMobile]);

    const handleFinancialYearChange = (e) => {
        const newYear = e.target.value;
        setFinancialYear(newYear);
        fetchPendingFiles(newYear);
    };

    const handlePageSizeChange = (e) => setPageSize(parseInt(e.target.value));
    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
    const toggleFullScreen = () => setIsFullScreen(!isFullScreen);

    const onSelectionChanged = (event) => {
        setSelectedRows(event.api.getSelectedNodes().map(node => node.data));
    };

    const downloadExcel = () => {
        if (!gridRef.current?.api) return;
        gridRef.current.api.exportDataAsCsv({
            fileName: `Site_Dashboard_Pending_${financialYear}_${new Date().toISOString().split('T')[0]}.csv`,
            allColumns: true,
            columnKeys: columnDefs.filter(col => col.field !== 'action').map(col => col.field)
        });
    };

    const autoSizeAll = () => {
        if (!gridRef.current?.api) return;
        setTimeout(() => {
            const allColumnIds = gridRef.current.api.getColumns()?.map(c => c.getId()) || [];
            if (allColumnIds.length > 0) gridRef.current.api.autoSizeColumns(allColumnIds, false);
        }, 100);
    };

    const getThemeStyles = () => theme === 'dark'
        ? { backgroundColor: 'linear-gradient(135deg, #21262d 0%, #161b22 100%)', color: '#f8f9fa', cardBg: '#343a40', cardHeader: 'linear-gradient(135deg, #495057 0%, #343a40 100%)' }
        : { backgroundColor: 'linear-gradient(135deg, #f8f9ff 0%, #e6f3ff 100%)', color: '#212529', cardBg: '#ffffff', cardHeader: 'linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%)' };

    const themeStyles = getThemeStyles();
    const gridHeight = isFullScreen ? 'calc(100vh - 180px)' : (isMobile ? '400px' : '600px');
    const totalRecords = rowData.length;
    const totalPages = Math.ceil(totalRecords / pageSize);

    useEffect(() => {
        document.body.style.background = themeStyles.backgroundColor;
        document.body.style.color = themeStyles.color;
        document.body.style.minHeight = '100vh';
        return () => { document.body.style.background = ''; document.body.style.color = ''; document.body.style.minHeight = ''; };
    }, [theme]);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: themeStyles.backgroundColor }}>
                <div style={{ textAlign: 'center', color: themeStyles.color }}>
                    <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading pending files data...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: themeStyles.backgroundColor, color: themeStyles.color, padding: 0, margin: 0 }}>
            <div className={`container-fluid ${isFullScreen ? 'p-0' : ''}`}>
                <div className="card" style={{
                    backgroundColor: themeStyles.cardBg, color: themeStyles.color,
                    border: theme === 'dark' ? '1px solid #495057' : '1px solid #dee2e6',
                    margin: isFullScreen ? 0 : 20, borderRadius: isFullScreen ? 0 : 8
                }}>
                    {/* ── Header ── */}
                    <div className="card-header" style={{
                        background: themeStyles.cardHeader,
                        color: theme === 'dark' ? '#ffffff' : '#000000',
                        fontFamily: "'Maven Pro', sans-serif", padding: '1rem 2rem'
                    }}>
                        <div className="row align-items-center">
                            <div className="col-12 col-lg-4 mb-2 mb-lg-0">
                                <h4 className="mb-0">{formTitle}</h4>
                                <small style={{ opacity: 0.8 }}>
                                    FY {financialYear} | {totalRecords} records found
                                    {selectedRows.length > 0 && ` | ${selectedRows.length} selected`}
                                </small>
                            </div>
                            <div className="col-12 col-lg-4 mb-2 mb-lg-0">
                                <div className="d-flex align-items-center">
                                    <label className="form-label me-2 mb-0" style={{ whiteSpace: 'nowrap' }}>Financial Year:</label>
                                    <select className="form-select form-select-sm" value={financialYear} onChange={handleFinancialYearChange} style={{ maxWidth: '120px' }}>
                                        {financialYearOptions.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-12 col-lg-4">
                                <div className="d-flex justify-content-end gap-2 flex-wrap align-items-center">
                                    <div className="btn-group btn-group-sm">
                                        <button className="btn btn-success" onClick={downloadExcel} title="Download CSV">
                                            <i className="bi bi-file-earmark-excel"></i>
                                            {!isMobile && ' Export CSV'}
                                        </button>
                                        <button className="btn btn-info" onClick={autoSizeAll} title="Auto Size Columns">
                                            <i className="bi bi-arrows-angle-expand"></i>
                                            {!isMobile && ' Auto Size'}
                                        </button>
                                    </div>
                                    <div className="btn-group btn-group-sm">
                                        <button className="btn btn-outline-light" onClick={toggleFullScreen}>
                                            <i className={`bi ${isFullScreen ? 'bi-fullscreen-exit' : 'bi-fullscreen'}`}></i>
                                            {!isMobile && (isFullScreen ? ' Exit' : ' Full')}
                                        </button>
                                        <button className="btn btn-outline-light" onClick={toggleTheme}>
                                            {theme === 'light' ? '🌙' : '☀️'}
                                            {!isMobile && (theme === 'light' ? ' Dark' : ' Light')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Editable column legend ── */}
                    <div style={{
                        background: theme === 'dark' ? '#2d2a1a' : '#fffbeb',
                        borderBottom: '1px solid #f59e0b33',
                        padding: '6px 20px', fontSize: 11,
                        color: '#92400e', fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: 8
                    }}>
                        <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: 2, marginRight: 4 }}></span>
                        ✏️ Click on progress bar or cost cells to edit inline — then press Save
                    </div>

                    {/* ── Grid Body ── */}
                    <div className="card-body" style={{ backgroundColor: themeStyles.cardBg, padding: isFullScreen ? 0 : 15 }}>
                        {totalRecords === 0 ? (
                            <div style={{ textAlign: 'center', padding: '50px', color: themeStyles.color }}>
                                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📋</div>
                                <h5>No pending files available</h5>
                                <p>Please check your API connection or try a different financial year.</p>
                            </div>
                        ) : (
                            <div style={{ height: gridHeight, backgroundColor: 'white', border: '1px solid #ddd' }}>
                                <style>{`
                                    .ag-theme-alpine .ag-header-cell { font-size: ${isMobile ? '10px' : '11px'} !important; font-weight: bold !important; }
                                    .ag-theme-alpine .ag-cell { font-size: ${isMobile ? '9px' : '10px'} !important; }
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
                                `}</style>
                                <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' }}>
                                    <AgGridReact
                                        ref={gridRef}
                                        rowData={rowData}
                                        columnDefs={columnDefs}
                                        defaultColDef={defaultColDef}
                                        pagination={true}
                                        paginationPageSize={pageSize}
                                        paginationPageSizeSelector={[10, 25, 50, 100]}
                                        rowSelection="multiple"
                                        onSelectionChanged={onSelectionChanged}
                                        suppressMovableColumns={isMobile}
                                        rowMultiSelectWithClick={true}
                                        suppressRowClickSelection={false}
                                        animateRows={!isMobile}
                                        enableCellTextSelection={true}
                                        suppressHorizontalScroll={false}
                                        suppressColumnVirtualisation={isMobile}
                                        rowBuffer={isMobile ? 5 : 10}
                                        headerHeight={isMobile ? 28 : 32}
                                        rowHeight={isMobile ? 30 : 36}
                                        suppressMenuHide={isMobile}
                                        suppressContextMenu={isMobile}
                                        onGridReady={() => setTimeout(() => autoSizeAll(), 500)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Footer ── */}
                    <div className="card-footer" style={{
                        backgroundColor: themeStyles.cardBg,
                        borderTop: '1px solid #ddd',
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', fontSize: '12px', padding: '10px 20px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span>Page Size:</span>
                            <select className="form-select form-select-sm" style={{ width: 'auto' }} value={pageSize} onChange={handlePageSizeChange}>
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>
                        <div>1 to {Math.min(pageSize, totalRecords)} of {totalRecords}</div>
                        <div>Page 1 of {totalPages}</div>
                    </div>
                </div>
            </div>

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

export default SiteDashboardPending;