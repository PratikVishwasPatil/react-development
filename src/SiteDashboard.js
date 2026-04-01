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
// ✅ FIX: EditableInputCell is defined OUTSIDE the parent component.
//    Previously it was inside SiteDashboardGrid, which caused ag-Grid to treat
//    it as a new component on every render → cell remounted → value disappeared.
// ─────────────────────────────────────────────────────────────────────────────
const EditableInputCell = ({ value, node, colDef, api }) => {
    const [inputValue, setInputValue] = React.useState(value ?? "");
    const [focused, setFocused] = React.useState(false);

    // Sync when external value changes (e.g. after data refresh)
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
// ─────────────────────────────────────────────────────────────────────────────


const SiteDashboardGrid = () => {
    const [theme, setTheme] = useState('light');
    const [rowData, setRowData] = useState([]);
    const [columnDefs, setColumnDefs] = useState([]);
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [loading, setLoading] = useState(true);
    const [selectedRows, setSelectedRows] = useState([]);
    const [financialYear, setFinancialYear] = useState('25-26');
    const [financialYearOptions, setFinancialYearOptions] = useState([]);
    const [supervisors, setSupervisors] = useState([]);
    const gridRef = useRef();

    const formTitle = "Site Dashboard Details";

    // Fetch financial years from API
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

    useEffect(() => {
        fetchFinancialYears();
    }, []);

    useEffect(() => {
        if (financialYear) {
            fetchSiteData();
        }
    }, [financialYear]);

    // Handle window resize for mobile responsiveness
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        fetchSupervisors();
    }, []);

    useEffect(() => {
        setColumnDefs(generateSiteColumnDefs());
        fetchSiteData();
    }, [isMobile, isFullScreen, supervisors]);

    const fetchSupervisors = async () => {
        try {
            const response = await fetch('https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/getSupervisorListApi.php', {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const result = await response.json();

            if (result.status === 'success' && Array.isArray(result.data)) {
                const cleanedSupervisors = result.data.filter(supervisor =>
                    supervisor &&
                    supervisor.trim() !== '' &&
                    supervisor !== 'Please Select Supplier' &&
                    supervisor !== 'REMOVE'
                ).map(supervisor => supervisor.trim());

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

    // Format currency values
    const formatCurrency = (value) => {
        if (!value || value === 0) return '0.00';
        return parseFloat(value).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    // View handover report renderer
    const viewHandoverRenderer = (params) => {
        const filePath = params.value || params.data?.handover_file;

        if (!filePath) {
            return <span style={{ color: '#6c757d', fontSize: '10px' }}>No file</span>;
        }

        const handleViewFile = () => {
            const baseUrl = 'https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/';
            const fullUrl = filePath.startsWith('http') ? filePath : baseUrl + filePath;
            window.open(fullUrl, '_blank');
        };

        return (
            <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                <button
                    onClick={handleViewFile}
                    style={{
                        background: '#007bff', color: 'white', border: 'none',
                        borderRadius: '4px', padding: '4px 8px', fontSize: '10px', cursor: 'pointer'
                    }}
                >
                    <i className="bi bi-file-earmark-pdf" style={{ marginRight: '4px' }}></i>
                    View
                </button>
            </div>
        );
    };

    // Modern save button renderer
    const saveButtonRenderer = (params) => {
        const handleSave = async () => {
            try {
                const formatDateForAPI = (dateStr) => {
                    if (!dateStr) return '';
                    const parts = dateStr.split('-');
                    if (parts.length === 3 && parts[0].length === 4) {
                        return `${parts[2]}-${parts[1]}-${parts[0]}`;
                    }
                    return dateStr;
                };

                const formData = new FormData();
                formData.append('file', params.data.FILE_ID);
                formData.append('ProType', params.data.product_name || '');
                formData.append('date', formatDateForAPI(params.data.date));
                formData.append('supplier', params.data.supplerName || '');
                formData.append('no_of_person_surya', params.data.no_of_person_surya || '0');
                formData.append('no_of_person_vendor', params.data.no_of_person_vendor || '0');
                formData.append('CompWork', params.data.w_compl_status || '0');
                formData.append('location', params.data.city || '');
                formData.append('handover', formatDateForAPI(params.data.handover_date));
                formData.append('total_project_cost', params.data.total_project_cost || '0');

                const response = await fetch('https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/EditSiteDataApi.php', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (result.status === 'success') {
                    const button = document.getElementById(`save-btn-${params.data.FILE_ID}`);
                    if (button) {
                        button.style.background = '#28a745';
                        button.innerHTML = '✓ Saved';
                        setTimeout(() => {
                            button.style.background = 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)';
                            button.innerHTML = '💾 Save';
                        }, 2000);
                    }
                    toast.success('Record updated successfully!');
                } else {
                    toast.error('Save failed: ' + (result.message || 'Unknown error'));
                }
            } catch (error) {
                toast.error('Error saving data. Please check your connection and try again.');
            }
        };

        return (
            <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center' }}>
                <button
                    id={`save-btn-${params.data.FILE_ID}`}
                    onClick={handleSave}
                    style={{
                        background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                        color: 'white', border: 'none', borderRadius: '6px',
                        padding: '4px 12px', fontSize: '10px', cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(0,123,255,0.2)',
                        transition: 'all 0.3s ease',
                        display: 'flex', alignItems: 'center', gap: '4px'
                    }}
                    title="Save Record"
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,123,255,0.3)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,123,255,0.2)';
                    }}
                >
                    💾 Save
                </button>
            </div>
        );
    };

    const handleFileUpload = async (event, rowData, fieldName) => {
        const file = event.target.files[0];
        if (!file) return;

        const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

        if (!allowedTypes.includes(fileExtension)) {
            toast.error('Please select a valid file type: PDF, DOC, DOCX, JPG, JPEG, or PNG');
            event.target.value = '';
            return;
        }

        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            toast.error('File size must be less than 10MB');
            event.target.value = '';
            return;
        }

        try {
            const uploadButton = event.target.parentElement.querySelector('button');
            if (uploadButton) {
                uploadButton.disabled = true;
                uploadButton.innerHTML = '⏳ Uploading...';
            }

            const formData = new FormData();
            formData.append('file', file);
            formData.append('file_id', rowData.FILE_ID);
            formData.append('file_name', rowData.FILE_NAME);
            formData.append('field_name', fieldName);

            const response = await fetch('https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/uploadHandoverReport.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.status === 'success') {
                rowData[fieldName] = result.file_path;
                rowData.handover_file = result.file_path;

                if (gridRef.current?.api) {
                    gridRef.current.api.refreshCells({ force: true, columns: [fieldName, 'handover_file'] });
                }

                toast.success('File uploaded successfully!');
                if (uploadButton) {
                    uploadButton.disabled = false;
                    uploadButton.innerHTML = '↑ Replace File';
                }
            } else {
                toast.error('File upload failed: ' + (result.message || 'Unknown error'));
                if (uploadButton) {
                    uploadButton.disabled = false;
                    uploadButton.innerHTML = '↑ Upload File';
                }
            }
        } catch (error) {
            toast.error('Error uploading file. Please check your connection and try again.');
            const uploadButton = event.target.parentElement.querySelector('button');
            if (uploadButton) {
                uploadButton.disabled = false;
                uploadButton.innerHTML = '↑ Upload File';
            }
        } finally {
            event.target.value = '';
        }
    };

    // Generate column definitions for site dashboard data
    const generateSiteColumnDefs = () => {
        const siteColumns = [
            // Serial Number
            {
                headerName: "Sr No",
                field: "serialNumber",
                valueGetter: (params) => params.node ? params.node.rowIndex + 1 : '',
                width: isMobile ? 60 : 80,
                minWidth: 50,
                pinned: 'left',
                lockPosition: true,
                cellStyle: { fontWeight: 'bold', textAlign: 'center', backgroundColor: '#f8f9fa' },
                suppressSizeToFit: true
            },
            // File Name
            {
                field: "FILE_NAME",
                headerName: "File Name",
                filter: "agTextColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 120 : 150,
                minWidth: 120,
                resizable: true,
                sortable: true,
                pinned: 'left',
                lockPosition: true,
                cellStyle: { fontWeight: 'bold', fontSize: '11px', backgroundColor: '#f8f9fa' },
                tooltipField: "FILE_NAME"
            },
            // Product Name
            {
                field: "product_name",
                headerName: "Product",
                filter: "agTextColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 100 : 120,
                minWidth: 80,
                resizable: true,
                sortable: true,
                cellStyle: { backgroundColor: '#f8f9fa', fontSize: '11px' }
            },
            // City dropdown
            {
                field: "city",
                headerName: "City",
                cellRenderer: (params) => {
                    const cities = [
                        "Ahmedabad","Ankleshwar","Aurangabad","Baddi","Bangalore","Baroda",
                        "Belgaum","Dahej","Export","Gandhinagar","Gaziabad","Goa","Gokak",
                        "Gokul Shirgaon","Guwahati","Hyderabad","Indore","Jammu and Kashmir",
                        "Kagal","Kirloskarvadi","Kolhapur","Kurkumbh","Ratlam","Mumbai","Nagpur",
                        "Nashik","Puducherry","Pune","Roha","Roorkee","Sangli","Satara","Shiroli",
                        "Sikkim","Tarapur","Tardal","Toap","Vishakhapatnam","Patalganga"
                    ];

                    const handleChange = (e) => {
                        params.node.setDataValue("city", e.target.value);
                    };

                    return (
                        <select
                            value={params.data.city || ""}
                            onChange={handleChange}
                            style={{
                                width: "100%", height: "100%",
                                border: "none", background: "transparent", fontSize: "11px"
                            }}
                        >
                            <option value="">Select City</option>
                            {cities.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    );
                },
                cellStyle: { backgroundColor: "#f8f9fa", fontSize: "11px", padding: "0" }
            },
            // Site Start Date
            {
                field: "date",
                headerName: "Site Start Date",
                filter: "agDateColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 120 : 140,
                minWidth: 100,
                resizable: true,
                sortable: true,
                cellRenderer: (params) => {
                    const handleDateChange = (event) => {
                        params.node.setDataValue("date", event.target.value);
                    };

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
                            onChange={handleDateChange}
                            style={{
                                width: "100%", height: "100%",
                                border: "none", backgroundColor: "transparent",
                                fontSize: "11px", outline: "none", textAlign: "right"
                            }}
                        />
                    );
                },
                cellStyle: { textAlign: "right", backgroundColor: "#f8f9fa", fontSize: "11px", padding: "0" }
            },
            // Supervisor Name dropdown
            {
                field: "supplerName",
                headerName: "Supervisor",
                filter: "agTextColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 120 : 150,
                minWidth: 100,
                resizable: true,
                sortable: true,
                cellRenderer: (params) => {
                    const handleSupervisorChange = (event) => {
                        params.node.setDataValue("supplerName", event.target.value);
                    };

                    return (
                        <select
                            value={params.data.supplerName || ""}
                            onChange={handleSupervisorChange}
                            style={{
                                width: "100%", height: "100%",
                                border: "none", backgroundColor: "transparent",
                                fontSize: "11px", outline: "none"
                            }}
                        >
                            <option value="">Select Supervisor</option>
                            {supervisors.length === 0 ? (
                                <option value="" disabled>Loading supervisors...</option>
                            ) : (
                                supervisors.map((supervisor, index) => (
                                    <option key={`${supervisor}-${index}`} value={supervisor}>
                                        {supervisor}
                                    </option>
                                ))
                            )}
                        </select>
                    );
                },
                cellStyle: { backgroundColor: "#f8f9fa", fontSize: "11px", padding: "0" }
            },
            // ✅ Editable cells — uses stable external EditableInputCell
            {
                field: "no_of_person_surya",
                headerName: "Surya Persons",
                filter: "agNumberColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 100 : 120,
                minWidth: 80,
                resizable: true,
                sortable: true,
                cellRenderer: EditableInputCell,
                cellStyle: { backgroundColor: "#f8f9fa", padding: "2px", textAlign: "right" },
            },
            {
                field: "no_of_person_vendor",
                headerName: "Vendor Persons",
                filter: "agNumberColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 100 : 120,
                minWidth: 80,
                resizable: true,
                sortable: true,
                cellRenderer: EditableInputCell,
                cellStyle: { backgroundColor: "#f8f9fa", padding: "2px", textAlign: "right" },
            },
            {
                field: "w_compl_status",
                headerName: "Completion %",
                filter: "agNumberColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 120 : 140,
                minWidth: 100,
                resizable: true,
                sortable: true,
                cellRenderer: EditableInputCell,
                cellStyle: { backgroundColor: "#f8f9fa", padding: "2px", textAlign: "right" },
            },
            {
                field: "mktg_allowed_cost",
                headerName: "Mktg Allowed Cost",
                filter: "agNumberColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 130 : 150,
                minWidth: 120,
                resizable: true,
                sortable: true,
                cellRenderer: EditableInputCell,
                cellStyle: { backgroundColor: "#f8f9fa", padding: "2px", textAlign: "right" },
            },
            {
                field: "kg_design_value",
                headerName: "KG Design Value",
                filter: "agNumberColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 120 : 140,
                minWidth: 100,
                resizable: true,
                sortable: true,
                cellRenderer: EditableInputCell,
                cellStyle: { backgroundColor: "#f8f9fa", padding: "2px", textAlign: "right" },
            },
            // Mandays
            {
                field: "mandays",
                headerName: "Mandays",
                filter: "agNumberColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 80 : 100,
                minWidth: 60,
                resizable: true,
                sortable: true,
                cellStyle: { textAlign: 'right', backgroundColor: '#f8f9fa', fontSize: '11px' }
            },
            // Handover Date
            {
                field: "handover_date",
                headerName: "Handover Date",
                filter: "agDateColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 120 : 140,
                minWidth: 100,
                resizable: true,
                sortable: true,
                cellRenderer: (params) => {
                    const handleDateChange = (event) => {
                        params.node.setDataValue("handover_date", event.target.value);
                    };

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
                            onChange={handleDateChange}
                            style={{
                                width: "100%", height: "100%",
                                border: "none", backgroundColor: "transparent",
                                fontSize: "11px", outline: "none", textAlign: "right"
                            }}
                        />
                    );
                },
                cellStyle: { textAlign: "right", backgroundColor: "#f8f9fa", fontSize: "11px", padding: "0" }
            },
            // Total Project Cost
            {
                field: "total_project_cost",
                headerName: "Total Project Cost",
                filter: "agNumberColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 130 : 150,
                minWidth: 120,
                resizable: true,
                sortable: true,
                cellRenderer: (params) => formatCurrency(params.value),
                cellStyle: { textAlign: 'right', fontWeight: 'bold', backgroundColor: '#f8f9fa', fontSize: '11px' }
            },
            // Handover Report Upload
            {
                field: "handover_report",
                headerName: "Handover Report",
                width: isMobile ? 140 : 180,
                minWidth: 120,
                resizable: true,
                sortable: false,
                filter: false,
                cellRenderer: (params) => {
                    const hasFile = params.data?.handover_file && params.data.handover_file !== '';

                    return (
                        <div style={{ display: 'flex', alignItems: 'center', height: '100%', gap: '5px' }}>
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                onChange={(e) => handleFileUpload(e, params.data, "handover_report")}
                                style={{ display: 'none' }}
                                id={`file-upload-${params.data.FILE_ID}`}
                            />
                            {hasFile ? (
                                <>
                                    <span style={{
                                        fontSize: '9px', color: '#28a745',
                                        overflow: 'hidden', textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap', maxWidth: '60px', fontWeight: 'bold'
                                    }}>✓ Uploaded</span>
                                    <button
                                        onClick={() => document.getElementById(`file-upload-${params.data.FILE_ID}`).click()}
                                        style={{
                                            fontSize: '9px', padding: '2px 6px',
                                            border: '1px solid #17a2b8', borderRadius: '3px',
                                            background: '#17a2b8', color: 'white', cursor: 'pointer'
                                        }}
                                    >↺ Replace</button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => document.getElementById(`file-upload-${params.data.FILE_ID}`).click()}
                                        style={{
                                            fontSize: '9px', padding: '3px 8px',
                                            border: '1px solid #6c757d', borderRadius: '3px',
                                            background: '#6c757d', color: 'white', cursor: 'pointer'
                                        }}
                                    >↑ Upload File</button>
                                    <span style={{ fontSize: '8px', color: '#999', whiteSpace: 'nowrap' }}>No file</span>
                                </>
                            )}
                        </div>
                    );
                },
                cellStyle: { backgroundColor: '#f8f9fa' }
            },
            // View Handover Report
            {
                field: "handover_file",
                headerName: "View Report",
                width: isMobile ? 100 : 120,
                minWidth: 80,
                resizable: true,
                sortable: false,
                filter: false,
                cellRenderer: viewHandoverRenderer,
                cellStyle: { textAlign: 'center', backgroundColor: '#f8f9fa' }
            },
            // Save Action
            {
                field: "action",
                headerName: "Action",
                width: isMobile ? 80 : 100,
                minWidth: 70,
                resizable: true,
                sortable: false,
                filter: false,
                cellRenderer: saveButtonRenderer,
                cellStyle: { textAlign: 'center', backgroundColor: '#f8f9fa' }
            }
        ];

        return siteColumns;
    };

    const defaultColDef = useMemo(() => ({
        filter: true,
        sortable: true,
        floatingFilter: !isMobile,
        resizable: true,
        suppressMenu: isMobile,
    }), [isMobile]);

    // Fetch site dashboard data from API
    const fetchSiteData = async (year = financialYear) => {
        setLoading(true);
        try {
            const response = await fetch(
                `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/getSiteDashboardListApi.php?financial_year=${year}`,
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
            console.error("Error fetching site dashboard data:", error);
            setRowData([]);
        } finally {
            setLoading(false);
        }
    };

    // Handle financial year change
    const handleFinancialYearChange = (event) => {
        const newYear = event.target.value;
        setFinancialYear(newYear);
        fetchSiteData(newYear);
    };

    const toggleTheme = () => setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    const toggleFullScreen = () => setIsFullScreen(!isFullScreen);

    const onSelectionChanged = (event) => {
        const selectedNodes = event.api.getSelectedNodes();
        setSelectedRows(selectedNodes.map(node => node.data));
    };

    // Export to CSV
    const downloadExcel = () => {
        if (!gridRef.current?.api) return;
        gridRef.current.api.exportDataAsCsv({
            fileName: `Site_Dashboard_${financialYear}_${new Date().toISOString().split('T')[0]}.csv`,
            allColumns: true,
            columnKeys: columnDefs
                .filter(col => col.field !== 'handover_report_upload' && col.field !== 'action')
                .map(col => col.field)
        });
    };

    // Auto size columns
    const autoSizeAll = () => {
        if (!gridRef.current?.api) return;
        setTimeout(() => {
            const allColumnIds = gridRef.current.api.getColumns()?.map(column => column.getId()) || [];
            if (allColumnIds.length > 0) {
                gridRef.current.api.autoSizeColumns(allColumnIds, false);
            }
        }, 100);
    };

    const getThemeStyles = () => {
        if (theme === 'dark') {
            return {
                backgroundColor: 'linear-gradient(135deg, #21262d 0%, #161b22 100%)',
                color: '#f8f9fa', cardBg: '#343a40',
                cardHeader: 'linear-gradient(135deg, #495057 0%, #343a40 100%)'
            };
        }
        return {
            backgroundColor: 'linear-gradient(135deg, #f8f9ff 0%, #e6f3ff 100%)',
            color: '#212529', cardBg: '#ffffff',
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
                minHeight: '100vh', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                background: themeStyles.backgroundColor
            }}>
                <div style={{ textAlign: 'center', color: themeStyles.color }}>
                    <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading site dashboard data...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: themeStyles.backgroundColor,
            color: themeStyles.color,
            padding: 0, margin: 0
        }}>
            <div className={`container-fluid ${isFullScreen ? 'p-0' : ''}`}>
                <div className="card" style={{
                    backgroundColor: themeStyles.cardBg,
                    color: themeStyles.color,
                    border: theme === 'dark' ? '1px solid #495057' : '1px solid #dee2e6',
                    margin: isFullScreen ? 0 : 20,
                    borderRadius: isFullScreen ? 0 : 8
                }}>
                    {/* ── Header ── */}
                    <div className="card-header" style={{
                        background: themeStyles.cardHeader,
                        color: theme === 'dark' ? '#ffffff' : '#000000',
                        fontFamily: "'Maven Pro', sans-serif",
                        padding: '1rem 2rem'
                    }}>
                        <div className="row align-items-center">
                            <div className="col-12 col-lg-4 mb-2 mb-lg-0">
                                <h4 className="mb-0">{formTitle}</h4>
                                <small style={{ opacity: 0.8 }}>
                                    FY {financialYear} | {rowData.length} records found
                                    {selectedRows.length > 0 && ` | ${selectedRows.length} selected`}
                                </small>
                            </div>

                            <div className="col-12 col-lg-4 mb-2 mb-lg-0">
                                <div className="d-flex align-items-center">
                                    <label className="form-label me-2 mb-0" style={{ whiteSpace: 'nowrap' }}>
                                        Financial Year:
                                    </label>
                                    <select
                                        className="form-select form-select-sm"
                                        value={financialYear}
                                        onChange={handleFinancialYearChange}
                                        style={{ maxWidth: '120px' }}
                                    >
                                        {financialYearOptions.map(option => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
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
                                        <button
                                            className="btn btn-outline-light"
                                            onClick={toggleFullScreen}
                                            title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
                                        >
                                            <i className={`bi ${isFullScreen ? 'bi-fullscreen-exit' : 'bi-fullscreen'}`}></i>
                                            {!isMobile && (isFullScreen ? ' Exit' : ' Full')}
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

                    {/* ── Editable column legend ── */}
                    <div style={{
                        background: theme === 'dark' ? '#2d2a1a' : '#fffbeb',
                        borderBottom: '1px solid #f59e0b33',
                        padding: '6px 20px',
                        fontSize: 11,
                        color: '#92400e',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                    }}>
                        <span style={{
                            display: 'inline-block',
                            width: 12, height: 12,
                            background: '#f59e0b',
                            borderRadius: 2,
                            marginRight: 4
                        }}></span>
                        ✏️ Highlighted cells are editable — click to edit, then press Save
                    </div>

                    {/* ── Grid Body ── */}
                    <div className="card-body" style={{
                        backgroundColor: themeStyles.cardBg,
                        padding: isFullScreen ? 0 : 15
                    }}>
                        {rowData.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '50px', color: themeStyles.color }}>
                                <i className="bi bi-graph-up" style={{ fontSize: '3rem', marginBottom: '20px' }}></i>
                                <h5>No site dashboard data available</h5>
                                <p>Please check your API connection or try a different financial year.</p>
                            </div>
                        ) : (
                            <div style={{ height: gridHeight, backgroundColor: 'white', border: '1px solid #ddd' }}>
                                <style>{`
                                    .ag-theme-alpine .ag-header-cell {
                                        font-size: ${isMobile ? '10px' : '12px'} !important;
                                        font-weight: bold !important;
                                    }
                                    .ag-theme-alpine .ag-cell {
                                        font-size: ${isMobile ? '9px' : '11px'} !important;
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
                                            --ag-input-background-color: #343a40;
                                            --ag-input-border-color: #495057;
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
                                        paginationPageSize={isMobile ? 10 : 20}
                                        paginationPageSizeSelector={[10, 20, 50, 100]}
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
                                        headerHeight={isMobile ? 30 : 35}
                                        rowHeight={isMobile ? 32 : 36}
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
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '12px',
                        padding: '10px 20px'
                    }}>
                        <div>
                            Page Size:
                            <select className="form-select form-select-sm d-inline mx-2" style={{ width: 'auto' }}>
                                <option>10</option>
                                <option>25</option>
                                <option>50</option>
                            </select>
                        </div>
                        <div>1 to {Math.min(20, rowData.length)} of {rowData.length}</div>
                        <div>Page 1 of {Math.ceil(rowData.length / 20)}</div>
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

export default SiteDashboardGrid;