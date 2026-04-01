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

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
            
            // Set the latest year as default (last item in the array)
            if (data.data.length > 0) {
                setFinancialYear(data.data[data.data.length - 1].financial_year);
            }
        }
    } catch (error) {
        console.error("Error fetching financial years:", error);
        // Fallback to default years if API fails
        setFinancialYearOptions([
            { value: '22-23', label: '2022-23' },
            { value: '23-24', label: '2023-24' },
            { value: '24-25', label: '2024-25' },
            { value: '25-26', label: '2025-26' }
        ]);
    }
};

// Initial data fetch
useEffect(() => {
    setColumnDefs(generateColumnDefs());
    fetchFinancialYears();
}, [isMobile]);

// Fetch data when financial year changes
useEffect(() => {
    if (financialYear) {
        fetchPendingFiles();
    }
}, [financialYear]);

    const fetchSupervisors = async () => {
        console.log('Starting to fetch supervisors...');
        try {
            const response = await fetch('https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/getSupervisorListApi.php', {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.status === 'success' && Array.isArray(result.data)) {
                const cleanedSupervisors = result.data.filter(supervisor =>
                    supervisor &&
                    supervisor.trim() !== '' &&
                    supervisor !== 'Please Select Supplier' &&
                    supervisor !== 'REMOVE'
                ).map(supervisor => supervisor.trim());

                setSupervisors(cleanedSupervisors);
                console.log(`Loaded ${cleanedSupervisors.length} supervisors`);
                toast.success(`Loaded ${cleanedSupervisors.length} supervisors`);
            } else {
                console.warn("No supervisor data received:", result);
                setSupervisors([]);
            }
        } catch (error) {
            console.error("Error fetching supervisors:", error);
            const fallbackSupervisors = [
                "Santosh Mahadev Salunkhe",
                "Mohan Prakash Patil",
                "Hari Namdev Masurakar",
                "Yuvraj Vitthal Chindage",
                "Bajirao Vishnu Lohar"
            ];
            setSupervisors(fallbackSupervisors);
        }
    };

    // FIXED: Work Completion Status Renderer with proper state management
    const WorkCompletionStatusRenderer = (props) => {
        const [editMode, setEditMode] = useState(false);
        // Use props.data to get current value from rowData instead of props.value
        const currentValue = props.data.w_compl_status || 0;
        const [inputValue, setInputValue] = useState(currentValue);

        // Update inputValue when data changes
        useEffect(() => {
            setInputValue(props.data.w_compl_status || 0);
        }, [props.data.w_compl_status]);

        const handleInputChange = (e) => {
            const newValue = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0));
            setInputValue(newValue);
        };

        const handleBlur = () => {
            // Update the actual row data
            props.node.setDataValue("w_compl_status", inputValue);
            setEditMode(false);
        };

        const handleKeyPress = (e) => {
            if (e.key === 'Enter') {
                props.node.setDataValue("w_compl_status", inputValue);
                setEditMode(false);
            }
        };

        const value = currentValue;
        const color = value >= 100 ? '#28a745' : value >= 80 ? '#ffc107' : value >= 50 ? '#17a2b8' : '#dc3545';

        if (editMode) {
            return (
                <div style={{ width: '100%', display: 'flex', alignItems: 'center', height: '100%' }}>
                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={inputValue}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        onKeyPress={handleKeyPress}
                        style={{
                            width: '60px',
                            height: '20px',
                            border: '1px solid #007bff',
                            borderRadius: '3px',
                            fontSize: '11px',
                            textAlign: 'center'
                        }}
                        autoFocus
                    />
                    <span style={{ fontSize: '11px', marginLeft: '5px' }}>%</span>
                </div>
            );
        }

        return (
            <div
                style={{ width: '100%', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => setEditMode(true)}
            >
                <div style={{
                    width: '60%',
                    height: '16px',
                    backgroundColor: '#e9ecef',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    marginRight: '8px'
                }}>
                    <div style={{
                        width: `${Math.min(value, 100)}%`,
                        height: '100%',
                        backgroundColor: color,
                        transition: 'width 0.3s ease'
                    }} />
                </div>
                <span style={{ fontSize: '11px', fontWeight: 'bold' }}>
                    {value}%
                </span>
            </div>
        );
    };

    // FIXED: Project Cost Renderer with proper state management
    const ProjectCostRenderer = (props) => {
        const [editMode, setEditMode] = useState(false);
        const currentValue = props.data.project_Est_cost || 0;
        const [inputValue, setInputValue] = useState(currentValue);

        useEffect(() => {
            setInputValue(props.data.project_Est_cost || 0);
        }, [props.data.project_Est_cost]);

        const handleInputChange = (e) => {
            const newValue = parseFloat(e.target.value) || 0;
            setInputValue(newValue);
        };

        const handleBlur = () => {
            props.node.setDataValue("project_Est_cost", inputValue);
            setEditMode(false);
        };

        const handleKeyPress = (e) => {
            if (e.key === 'Enter') {
                props.node.setDataValue("project_Est_cost", inputValue);
                setEditMode(false);
            }
        };

        const formatCurrency = (value) => {
            return value.toLocaleString('en-IN', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            });
        };

        if (editMode) {
            return (
                <input
                    type="number"
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    onKeyPress={handleKeyPress}
                    style={{
                        width: '100%',
                        height: '100%',
                        border: '1px solid #007bff',
                        borderRadius: '3px',
                        fontSize: '11px',
                        textAlign: 'right',
                        backgroundColor: '#f8f9fa'
                    }}
                    autoFocus
                />
            );
        }

        return (
            <div
                style={{
                    width: '100%',
                    textAlign: 'right',
                    cursor: 'pointer',
                    color: '#28a745',
                    fontSize: '11px'
                }}
                onClick={() => setEditMode(true)}
            >
                {formatCurrency(currentValue)}
            </div>
        );
    };

    const handleFileUpload = async (event, rowData, fieldName) => {
        const file = event.target.files[0];
        if (!file) return;

        const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

        if (!allowedTypes.includes(fileExtension)) {
            alert('Please select a valid file type: PDF, DOC, DOCX, JPG, JPEG, or PNG');
            event.target.value = '';
            return;
        }

        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            alert('File size must be less than 10MB');
            event.target.value = '';
            return;
        }

        try {
            const uploadButton = event.target.parentElement.querySelector('button');
            if (uploadButton) {
                uploadButton.disabled = true;
                uploadButton.innerHTML = 'Uploading...';
            }

            const formData = new FormData();
            formData.append('handover_file', file);
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
                    gridRef.current.api.refreshCells({
                        force: true,
                        columns: [fieldName, 'handover_file']
                    });
                }

                // alert('File uploaded successfully!');
                toast.success('File uploaded successfully!');


                if (uploadButton) {
                    uploadButton.disabled = false;
                    uploadButton.innerHTML = 'Replace File';
                }
            } else {
                alert('File upload failed: ' + (result.message || 'Unknown error'));
                if (uploadButton) {
                    uploadButton.disabled = false;
                    uploadButton.innerHTML = 'Upload File';
                }
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            // alert('Error uploading file. Please try again.');
            toast.error('Error uploading file. Please try again.');

        } finally {
            event.target.value = '';
        }
    };

    // Save function to send data to API
    const saveRowData = async (rowData) => {
        try {
            console.log('Saving row data:', rowData);

            const formData = new FormData();
            formData.append('file', rowData.FILE_ID || rowData.fileid || '');
            formData.append('ProType', rowData.product_name || rowData.type || '');
            formData.append('date', rowData.date || '');
            formData.append('supplier', rowData.supplerName || '');
            formData.append('CompWork', rowData.w_compl_status || '0');
            formData.append('location', rowData.city || rowData.location || '');
            formData.append('handover', rowData.handover_date || '');
            formData.append('project_Est_cost', rowData.project_Est_cost || '0');

            const response = await fetch('https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/SaveEditSiteDataApi.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.status === 'success') {
                console.log('Data saved successfully:', result);
                // alert('Data saved successfully!');
                toast.success('Data saved successfully!');
                return result;
            } else {
                console.error('Error saving data:', result);
                // alert('Error: ' + (result.message || 'Failed to save data'));
                toast.error('Error: ' + (result.message || 'Failed to save data'));
                
                return null;
            }
        } catch (error) {
            console.error('Network error:', error);
            alert('Network error: ' + error.message);
            return null;
        }
    };

    const EditableInputCell = (props) => {
        const { value, node, colDef, api } = props;
        const [inputValue, setInputValue] = useState(value || "");

        useEffect(() => {
            setInputValue(value || "");
        }, [value]);

        const handleChange = (e) => {
            const newValue = e.target.value;
            setInputValue(newValue);
            node.setDataValue(colDef.field, newValue);
            api.refreshCells({ rowNodes: [node], columns: [colDef.field] });
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
                    padding: "4px",
                    textAlign: "center",
                    fontSize: "11px",
                    backgroundColor: "transparent",
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

    const generateColumnDefs = () => {
        const columns = [
            {
                headerName: "File No.",
                field: "FILE_NAME",
                width: 120,
                minWidth: 100,
                pinned: 'left',
                lockPosition: true,
                cellStyle: { fontWeight: 'bold', textAlign: 'center', backgroundColor: '#f8f9fa' },
                suppressSizeToFit: false,
                checkboxSelection: false,
                headerCheckboxSelection: false
            },
            
            {
                field: "product_name",
                headerName: "Type",
                filter: "agTextColumnFilter",
                floatingFilter: !isMobile,
                width: 120,
                minWidth: 100,
                resizable: true,
                sortable: true,
                cellStyle: { backgroundColor: '#f8f9fa', fontSize: '11px' }
            },
            {
                field: "city",
                headerName: "City",
                filter: "agTextColumnFilter",
                floatingFilter: !isMobile,
                width: 120,
                minWidth: 100,
                resizable: true,
                sortable: true,
                cellRenderer: (params) => {
                    const cities = ["Ahmedabad","Ankleshwar","Aurangabad","Baddi","Bangalore","Baroda","Belgaum","Dahej","Export","Gandhinagar","Gaziabad","Goa","Gokak","Gokul Shirgaon","Guwahati","Hyderabad","Indore","Jammu and Kashmir","Kagal","Kirloskarvadi","Kolhapur","Kurkumbh","Ratlam","Mumbai","Nagpur","Nashik","Puducherry","Pune","Roha","Roorkee","Sangli","Satara","Shiroli","Sikkim","Tarapur","Tardal","Toap","Vishakhapatnam","Patalganga"];

                    const handleChange = (e) => {
                        const newCity = e.target.value;
                        params.node.setDataValue("city", newCity);
                    };

                    return (
                        <select
                            value={params.data.city || ""}
                            onChange={handleChange}
                            style={{
                                width: "100%",
                                height: "100%",
                                border: "none",
                                background: "transparent",
                                fontSize: "11px",
                                backgroundColor: "#f8f9fa"
                            }}
                        >
                            <option value="">Select City</option>
                            {cities.map(city => (
                                <option key={city} value={city}>
                                    {city}
                                </option>
                            ))}
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
                width: 140,
                minWidth: 120,
                resizable: true,
                sortable: true,
                cellRenderer: (params) => {
                    const handleDateChange = (event) => {
                        const newDate = event.target.value;
                        params.node.setDataValue("date", newDate);
                    };

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

                    return (
                        <input
                            type="date"
                            value={formatDateForInput(params.data.date)}
                            onChange={handleDateChange}
                            style={{
                                width: "100%",
                                height: "100%",
                                border: "none",
                                backgroundColor: "#f8f9fa",
                                fontSize: "11px",
                                outline: "none",
                                textAlign: "center",
                                padding: "0"
                            }}
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
                width: isMobile ? 120 : 150,
                minWidth: 100,
                resizable: true,
                sortable: true,
                cellRenderer: (params) => {
                    const handleSupervisorChange = (event) => {
                        const newSupervisor = event.target.value;
                        params.node.setDataValue("supplerName", newSupervisor);
                    };

                    return (
                        <select
                            value={params.data.supplerName || ""}
                            onChange={handleSupervisorChange}
                            style={{
                                width: "100%",
                                height: "100%",
                                border: "none",
                                backgroundColor: "transparent",
                                fontSize: "11px",
                                outline: "none"
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
                cellStyle: {
                    backgroundColor: "#f8f9fa",
                    fontSize: "11px",
                    padding: "0"
                }
            },
            {
                field: "w_compl_status",
                headerName: "Status (Work % Completion)",
                filter: "agNumberColumnFilter",
                floatingFilter: !isMobile,
                width: 180,
                minWidth: 150,
                resizable: true,
                sortable: true,
                cellRenderer: WorkCompletionStatusRenderer,
                cellStyle: { backgroundColor: '#f8f9fa' }
            },
            {
                field: "project_Est_cost",
                headerName: "Project Est. Cost",
                filter: "agNumberColumnFilter",
                floatingFilter: !isMobile,
                width: 140,
                minWidth: 120,
                resizable: true,
                sortable: true,
                cellRenderer: ProjectCostRenderer,
                cellStyle: { textAlign: 'right', color: '#28a745', backgroundColor: '#f8f9fa', fontSize: '11px' }
            },
            {
                field: "total_project_cost",
                headerName: "Total Project Cost",
                filter: "agNumberColumnFilter",
                floatingFilter: !isMobile,
                width: 150,
                minWidth: 120,
                resizable: true,
                sortable: true,
                cellRenderer: (params) => {
                    const value = params.value || 0;
                    return value.toLocaleString('en-IN', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                    });
                },
                cellStyle: { textAlign: 'right', fontWeight: 'bold', backgroundColor: '#f8f9fa', fontSize: '11px' }
            },
            {
                field: "handover_date",
                headerName: "Handover Date",
                filter: "agDateColumnFilter",
                floatingFilter: !isMobile,
                width: 130,
                minWidth: 110,
                resizable: true,
                sortable: true,
                cellRenderer: (params) => {
                    const handleDateChange = (event) => {
                        const newDate = event.target.value;
                        params.node.setDataValue("handover_date", newDate);
                    };

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

                    return (
                        <input
                            type="date"
                            value={formatDateForInput(params.data.handover_date)}
                            onChange={handleDateChange}
                            style={{
                                width: "100%",
                                height: "100%",
                                border: "none",
                                backgroundColor: "#f8f9fa",
                                fontSize: "11px",
                                outline: "none",
                                textAlign: "center",
                                padding: "0"
                            }}
                        />
                    );
                },
                cellStyle: { textAlign: "center", backgroundColor: "#f8f9fa", fontSize: "11px", padding: "0" }
            },
            {
                field: "handover_report",
                headerName: "Handover Report",
                width: 180,
                minWidth: 150,
                resizable: true,
                sortable: false,
                filter: false,
                cellRenderer: (params) => {
                    const hasFile = params.data?.handover_file && params.data.handover_file !== '';

                    return (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            height: '100%',
                            gap: '5px'
                        }}>
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
                                        fontSize: '9px',
                                        color: '#28a745',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        maxWidth: '80px',
                                        fontWeight: 'bold'
                                    }}>
                                        File Chosen
                                    </span>
                                    <button
                                        onClick={() => document.getElementById(`file-upload-${params.data.FILE_ID}`).click()}
                                        style={{
                                            fontSize: '8px',
                                            padding: '2px 4px',
                                            border: 'none',
                                            borderRadius: '3px',
                                            background: '#17a2b8',
                                            color: 'white',
                                            cursor: 'pointer'
                                        }}
                                        title="Replace file"
                                    >
                                        Replace
                                    </button>
                                </>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                    <button
                                        onClick={() => document.getElementById(`file-upload-${params.data.FILE_ID}`).click()}
                                        style={{
                                            fontSize: '8px',
                                            padding: '2px 6px',
                                            border: 'none',
                                            borderRadius: '3px',
                                            background: '#6c757d',
                                            color: 'white',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Choose File
                                    </button>
                                    <span style={{
                                        fontSize: '8px',
                                        color: '#dc3545',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        No file chosen
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                },
                cellStyle: { backgroundColor: '#f8f9fa' }
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
                                    padding: '3px 8px',
                                    fontSize: '9px',
                                    cursor: 'pointer',
                                    boxShadow: '0 1px 3px rgba(0,123,255,0.2)'
                                }}
                                title="Save Record"
                            >
                                Save
                            </button>
                        </div>
                    );
                },
                cellStyle: { textAlign: 'center', backgroundColor: '#f8f9fa' }
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
        cellStyle: { textAlign: 'right', fontSize: '25px' }
    }), [isMobile]);

    const fetchPendingFiles = async (year = financialYear) => {
        setLoading(true);
        try {
            const response = await fetch(`https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/getSiteDashboardSavedListApi.php?financial_year=${year}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.status === 'success' && Array.isArray(result.data)) {
                setRowData(result.data);
                console.log(`Loaded ${result.data.length} pending files for FY ${year}`);
            } else {
                console.warn("No pending files data received:", result);
                setRowData([]);
            }
        } catch (error) {
            console.error("Error fetching pending files data:", error);
            setRowData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSupervisors();
    }, []);

    useEffect(() => {
        setColumnDefs(generateColumnDefs());
        fetchPendingFiles();
    }, [isMobile, isFullScreen, supervisors]);

    const handleFinancialYearChange = (event) => {
        const newYear = event.target.value;
        setFinancialYear(newYear);
        fetchPendingFiles(newYear);
    };

    const handlePageSizeChange = (event) => {
        const newSize = parseInt(event.target.value);
        setPageSize(newSize);
    };

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

    const downloadExcel = () => {
        if (!gridRef.current?.api) return;

        try {
            const params = {
                fileName: `Site_Dashboard_Pending_${financialYear}_${new Date().toISOString().split('T')[0]}.csv`,
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
                    <p className="mt-3">Loading pending files data...</p>
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
                            <div className="col-12 col-lg-4 mb-2 mb-lg-0">
                                <h4 className="mb-0">{formTitle}</h4>
                                <small style={{ opacity: 0.8 }}>
                                    FY {financialYear} | {`${totalRecords} records found`}
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
        <option key={option.value} value={option.value}>
            {option.label}
        </option>
    ))}
</select>
                                </div>
                            </div>

                            <div className="col-12 col-lg-4">
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
                                            {theme === 'light' ? 'Dark' : 'Light'}
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
                                <h5>No pending files available</h5>
                                <p>Please check your API connection or try a different financial year.</p>
                            </div>
                        ) : (
                            <div style={{ height: gridHeight, backgroundColor: 'white', border: '1px solid #ddd' }}>
                                <style>
                                    {`
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
                                            console.log('Pending files grid is ready');
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

export default SiteDashboardPending;