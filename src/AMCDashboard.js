import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
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
import { Container, Button, Row, Col, Card, ButtonGroup } from 'react-bootstrap';

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

// ─── Toast helper ─────────────────────────────────────────────────────────────
const useToast = () => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = "success") => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
    }, []);

    const ToastContainer = (
        <div style={{
            position: "fixed", top: "1rem", right: "1rem", zIndex: 9999,
            display: "flex", flexDirection: "column", gap: "0.5rem"
        }}>
            {toasts.map((toast) => (
                <div key={toast.id} style={{
                    padding: "0.85rem 1.4rem",
                    borderRadius: "8px",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
                    color: "#fff",
                    backgroundColor: toast.type === "success" ? "#10b981" : "#ef4444",
                    animation: "toastSlide 0.3s ease-out",
                    minWidth: "240px",
                    fontWeight: 600,
                    fontSize: "0.9rem"
                }}>
                    {toast.type === "success" ? "✓ " : "✕ "}{toast.message}
                </div>
            ))}
        </div>
    );

    return { showToast, ToastContainer };
};

const AmcDashboard = () => {
    const [theme, setTheme] = useState('light');
    const [rowData, setRowData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState('');
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [selectedRows, setSelectedRows] = useState([]);
    const [supervisors, setSupervisors] = useState([]);
    const gridRef = useRef();
    
    const { showToast, ToastContainer } = useToast();

    // Location array for city dropdown
    const locationArr = [
        "Ahmedabad", "Ankleshwar", "Aurangabad", "Baddi", "Bangalore", "Baroda", 
        "Belgaum", "Dahej", "Export", "Gandhinagar", "Gaziabad", "Goa", "Gokak", 
        "Gokul Shirgaon", "Guwahati", "Hyderabad", "Indore", "Jammu and Kashmir", 
        "Kagal", "Kirloskarvadi", "Kolhapur", "Kurkumbh", "Ratlam", "Mumbai", 
        "Nagpur", "Nashik", "Puducherry", "Pune", "Roha", "Roorkee", "Sangli", 
        "Satara", "Shiroli", "Sikkim", "Tarapur", "Tardal", "Toap", 
        "Vishakhapatnam", "Patalganga"
    ];

    // Handle window resize for mobile responsiveness
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch supervisors from API
    const fetchSupervisors = useCallback(async () => {
        console.log('Fetching supervisors...');
        try {
            const response = await fetch('http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/getSupervisorListApi.php', {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Supervisor API Response:', result);

            if (result.status === 'success' && Array.isArray(result.data)) {
                const cleanedSupervisors = result.data.filter(supervisor =>
                    supervisor &&
                    supervisor.trim() !== '' &&
                    supervisor !== 'Please Select Supplier' &&
                    supervisor !== 'REMOVE'
                ).map(supervisor => supervisor.trim());

                console.log('✅ Loaded supervisors:', cleanedSupervisors);
                setSupervisors(cleanedSupervisors);
                showToast(`Loaded ${cleanedSupervisors.length} supervisors`, "success");
            } else {
                console.warn("⚠️ No supervisor data received");
                setSupervisors([]);
                showToast("No supervisor data received", "error");
            }
        } catch (error) {
            console.error("❌ Error fetching supervisors:", error);
            showToast(`Error loading supervisors: ${error.message}`, "error");
            // Fallback supervisors
            setSupervisors([
                "Santosh Mahadev Salunkhe",
                "Mohan Prakash Patil",
                "Hari Namdev Masurakar",
                "Yuvraj Vitthal chindage",
                "Bajirao Vishnu Lohar"
            ]);
        }
    }, [showToast]);

    // Initial data fetch
    useEffect(() => {
        fetchSupervisors();
        fetchAmcData();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Format date from YYYY-MM-DD to DD-MM-YYYY for display
    const formatDateForDisplay = (dateStr) => {
        if (!dateStr) return '';
        
        if (dateStr.includes('-')) {
            const parts = dateStr.split('-');
            if (parts[0].length === 4) {
                return `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
        }
        return dateStr;
    };

    // Format date from DD-MM-YYYY to YYYY-MM-DD for input
    const formatDateForInput = (dateStr) => {
        if (!dateStr) return '';
        
        if (dateStr.includes('-')) {
            const parts = dateStr.split('-');
            if (parts.length === 3) {
                if (parts[0].length === 2) {
                    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                } else if (parts[0].length === 4) {
                    return dateStr;
                }
            }
        }
        return dateStr;
    };

    // City Dropdown Cell Renderer
    const CityDropdownRenderer = (params) => {
        const handleChange = (e) => {
            const newCity = e.target.value;
            params.node.setDataValue("city1", newCity);
            console.log("City changed for:", params.data.FILE_NAME, "→", newCity);
        };

        return (
            <select
                value={params.data.city1 || ""}
                onChange={handleChange}
                style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    background: "transparent",
                    fontSize: "11px",
                    outline: "none"
                }}
            >
                <option value="">Select City</option>
                {locationArr.map(city => (
                    <option key={city} value={city}>
                        {city}
                    </option>
                ))}
            </select>
        );
    };

    // Supervisor Dropdown Cell Renderer
    const SupervisorDropdownRenderer = (params) => {
        const { field } = params.colDef;
        
        const handleChange = (e) => {
            const newSupervisor = e.target.value;
            params.node.setDataValue(field, newSupervisor);
            console.log(`${field} changed for:`, params.data.FILE_NAME, "→", newSupervisor);
        };

        return (
            <select
                value={params.data[field] || ""}
                onChange={handleChange}
                style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    background: "transparent",
                    fontSize: "10px",
                    outline: "none"
                }}
            >
                <option value="">Select Supervisor</option>
                {supervisors.length === 0 ? (
                    <option value="" disabled>Loading...</option>
                ) : (
                    supervisors.map((supervisor, index) => (
                        <option key={`${supervisor}-${index}`} value={supervisor}>
                            {supervisor}
                        </option>
                    ))
                )}
            </select>
        );
    };

    // Date Cell Renderer with DD-MM-YYYY format
    const DateCellRenderer = (params) => {
        const { field } = params.colDef;
        
        const handleDateChange = (event) => {
            const newDate = event.target.value;
            const parts = newDate.split('-');
            const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
            
            params.node.setDataValue(field, formattedDate);
            console.log(`${field} changed for:`, params.data.FILE_NAME, "New date:", formattedDate);
        };

        return (
            <input
                type="date"
                value={formatDateForInput(params.data[field])}
                onChange={handleDateChange}
                style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    backgroundColor: "transparent",
                    fontSize: "10px",
                    outline: "none",
                    textAlign: "center"
                }}
            />
        );
    };

    // Custom cell renderer for file upload buttons
    const FileUploadCellRenderer = (params) => {
        const { value, data, colDef } = params;
        const visitNumber = colDef.field.match(/visit_report(\d+)/)?.[1];
        
        if (value && value !== '') {
            return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleFileView(value)}
                        style={{ fontSize: '10px', padding: '2px 6px' }}
                    >
                        View
                    </button>
                    <span style={{ fontSize: '9px', color: '#666' }}>
                        {value.split('/').pop().substring(0, 15)}...
                    </span>
                </div>
            );
        }
        
        return (
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    style={{ display: 'none' }}
                    id={`file-${data.fileid}-${visitNumber}`}
                    onChange={(e) => handleFileUpload(e, data, visitNumber)}
                />
                <button 
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => document.getElementById(`file-${data.fileid}-${visitNumber}`).click()}
                    style={{ fontSize: '9px', padding: '1px 4px' }}
                >
                    Choose File
                </button>
                <span style={{ fontSize: '8px', color: '#999', marginLeft: '3px' }}>
                    No file chosen
                </span>
            </div>
        );
    };

    const handleFileView = (filePath) => {
        console.log('Viewing file:', filePath);
        window.open(`https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/${filePath}`, '_blank');
    };

    const handleFileUpload = async (event, rowData, visitNumber) => {
        const file = event.target.files[0];
        if (!file) return;
    
        try {
            console.log('📤 Uploading file for:', rowData.FILE_NAME, 'Visit:', visitNumber);
            
            // Validation
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                showToast("File size must be less than 5MB", "error");
                return;
            }
    
            const allowedTypes = ['application/pdf', 'application/msword', 
                                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                                  'image/jpeg', 'image/png'];
            if (!allowedTypes.includes(file.type)) {
                showToast("Only PDF, DOC, DOCX, JPG, PNG files allowed", "error");
                return;
            }
    
            // Get authentication data
            const employee_id = localStorage.getItem('employee_id') || '1';
            const shortName = localStorage.getItem('user_name') || 'Admin';
    
            // Create FormData
            const formData = new FormData();
            formData.append('employee_id', employee_id);
            formData.append('shortName', shortName);
            formData.append('fileid', rowData.fileid);
            formData.append('visit_number', visitNumber);
            formData.append('visit_report', file);
    
            console.log('📤 Upload details:', {
                filename: file.name,
                size: `${(file.size / 1024).toFixed(2)} KB`,
                type: file.type,
                fileid: rowData.fileid,
                visit: visitNumber
            });
    
            // Show loading toast
            showToast(`Uploading ${file.name}...`, "success");
    
            // Upload file
            const response = await fetch('http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/saveVisitReportApi.php', {
                method: 'POST',
                body: formData
            });
    
            const result = await response.json();
            console.log('📡 Upload response:', result);
    
            if (result.status === true) {
                showToast(`✓ File uploaded successfully`, "success");
                
                // Refresh grid to show uploaded file
                await fetchAmcData();
            } else {
                console.error('❌ Upload failed:', result.message);
                showToast(`Upload failed: ${result.message}`, "error");
            }
    
        } catch (error) {
            console.error('💥 Upload error:', error);
            showToast(`Error uploading file: ${error.message}`, "error");
        }
    };

  
const SaveButtonRenderer = (params) => {
    const handleSave = async () => {
        try {
            console.log('🔄 Starting save process for:', params.data.FILE_NAME);
            console.log('📋 Original data:', params.data);

            // Validate required fields
            if (!params.data.fileid) {
                showToast("File ID is missing", "error");
                console.error('❌ Missing fileid');
                return;
            }

            if (!params.data.FILE_NAME) {
                showToast("File name is missing", "error");
                console.error('❌ Missing FILE_NAME');
                return;
            }

            if (!params.data.amc_visit) {
                showToast("AMC Visit count is required", "error");
                console.error('❌ Missing amc_visit');
                return;
            }

            // ⚠️ IMPORTANT: Get employee_id and user_name from your authentication
            // Replace these with actual values from localStorage, context, or props
            const employee_id = localStorage.getItem('employee_id') || '1';
            const shortName = localStorage.getItem('user_name') || 'Admin';

            // Create FormData object (PHP expects $_POST data)
            const formData = new FormData();
            
            // Add all fields to FormData
            formData.append('employee_id', employee_id);
            formData.append('shortName', shortName);
            formData.append('fileid', params.data.fileid || '');
            formData.append('city', params.data.city1 || '');
            formData.append('unitlocation', params.data.STORE_LOCATION || '');
            formData.append('amc_visit', params.data.amc_visit || '');
            
            // Visit 1
            formData.append('suppliername1', params.data.suppliername1 || '');
            formData.append('visitDate1', params.data.visitDate1 || '');
            
            // Visit 2
            formData.append('suppliername2', params.data.suppliername2 || '');
            formData.append('visitDate2', params.data.visitDate2 || '');
            
            // Visit 3
            formData.append('suppliername3', params.data.suppliername3 || '');
            formData.append('visitDate3', params.data.visitDate3 || '');
            
            // Visit 4
            formData.append('suppliername4', params.data.suppliername4 || '');
            formData.append('visitDate4', params.data.visitDate4 || '');

            // Debug: Log FormData contents
            console.log('📤 FormData contents:');
            for (let [key, value] of formData.entries()) {
                console.log(`  ${key}: "${value}"`);
            }

            // Show loading state on button
            const button = document.getElementById(`save-btn-${params.data.fileid}`);
            if (button) {
                button.disabled = true;
                button.style.opacity = '0.6';
                button.style.cursor = 'not-allowed';
                button.innerHTML = '<div style="width:12px;height:12px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.6s linear infinite"></div> Saving...';
            }

            console.log('🌐 Making API request to: http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/saveAmcVisitsApi.php');

            // Make API call with FormData (PHP uses $_POST)
            const response = await fetch('http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/saveAmcVisitsApi.php', {
                method: 'POST',
                body: formData  // Send as FormData, NOT JSON
                // Note: Don't set Content-Type header - FormData sets it automatically with boundary
            });

            console.log('📡 Response status:', response.status);
            console.log('📡 Response statusText:', response.statusText);

            // Get response as text
            const responseText = await response.text();
            console.log('📄 Raw response:', responseText);

            // Reset button state
            if (button) {
                button.disabled = false;
                button.style.opacity = '1';
                button.style.cursor = 'pointer';
            }

            // Check response (PHP returns "SUCCESS|AMC_ID=...")
            if (responseText.includes('SUCCESS')) {
                // Show success state
                if (button) {
                    button.style.background = '#28a745';
                    button.style.boxShadow = '0 4px 12px rgba(40,167,69,0.4)';
                    button.innerHTML = '<i class="bi bi-check2-circle"></i> Saved!';
                    
                    // Reset after 2 seconds
                    setTimeout(() => {
                        button.style.background = 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)';
                        button.style.boxShadow = '0 2px 4px rgba(0,123,255,0.2)';
                        button.innerHTML = '<i class="bi bi-floppy"></i> Save';
                    }, 2000);
                }
                
                console.log('✅ SUCCESS! Record saved successfully');
                showToast(`✓ Saved: ${params.data.FILE_NAME}`, "success");
                
            } else {
                // Show error state
                if (button) {
                    button.style.background = '#dc3545';
                    button.innerHTML = '<i class="bi bi-x-circle"></i> Failed';
                    
                    // Reset after 2 seconds
                    setTimeout(() => {
                        button.style.background = 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)';
                        button.innerHTML = '<i class="bi bi-floppy"></i> Save';
                    }, 2000);
                }
                
                console.error('❌ API returned error:', responseText);
                showToast(`Failed: ${responseText}`, "error");
            }

        } catch (error) {
            console.error('💥 Exception during save operation:', error);
            console.error('💥 Error stack:', error.stack);
            
            // Reset button to original state
            const button = document.getElementById(`save-btn-${params.data.fileid}`);
            if (button) {
                button.disabled = false;
                button.style.opacity = '1';
                button.style.cursor = 'pointer';
                button.style.background = '#dc3545';
                button.innerHTML = '<i class="bi bi-x-circle"></i> Error';
                
                setTimeout(() => {
                    button.style.background = 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)';
                    button.innerHTML = '<i class="bi bi-floppy"></i> Save';
                }, 2000);
            }
            
            showToast(`Error: ${error.message}`, "error");
        }
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            height: '100%',
            justifyContent: 'center'
        }}>
            <button
                id={`save-btn-${params.data.fileid}`}
                onClick={handleSave}
                style={{
                    background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 12px',
                    fontSize: '10px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,123,255,0.2)',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontWeight: 600
                }}
                title="Save AMC Visit Record"
                onMouseEnter={(e) => {
                    if (!e.target.disabled) {
                        e.target.style.transform = 'translateY(-1px)';
                        e.target.style.boxShadow = '0 4px 8px rgba(0,123,255,0.3)';
                    }
                }}
                onMouseLeave={(e) => {
                    if (!e.target.disabled) {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 2px 4px rgba(0,123,255,0.2)';
                    }
                }}
            >
                <i className="bi bi-floppy"></i>
                Save
            </button>
        </div>
    );
};

    // Column definitions with enhanced styling
    const columnDefs = useMemo(() => [
        {
            headerName: "Sr No",
            field: "serialNumber",
            valueGetter: (params) => params.node ? params.node.rowIndex + 1 : '',
            width: isMobile ? 60 : 80,
            minWidth: 50,
            pinned: 'left',
            lockPosition: true,
            cellStyle: { fontWeight: 'bold', textAlign: 'center', backgroundColor: '#f8f9fa' }
        },
        {
            headerName: "File Name",
            field: "FILE_NAME",
            width: isMobile ? 120 : 150,
            pinned: 'left',
            cellStyle: { fontWeight: 'bold', backgroundColor: '#f8f9fa' }
        },
        {
            headerName: "City",
            field: "city1",
            width: isMobile ? 120 : 140,
            cellRenderer: CityDropdownRenderer,
            cellStyle: { backgroundColor: '#f8f9fa', padding: '0' }
        },
        {
            headerName: "Store Location",
            field: "STORE_LOCATION",
            width: isMobile ? 100 : 120,
            cellStyle: { backgroundColor: '#f8f9fa' }
        },
        {
            headerName: "No.Of Visits",
            field: "amc_visit",
            width: isMobile ? 80 : 100,
            cellStyle: { textAlign: 'center', backgroundColor: '#f8f9fa' }
        },
        {
            headerName: "Wages",
            field: "wages",
            width: isMobile ? 80 : 100,
            valueFormatter: (params) => params.value ? params.value.toLocaleString() : '0',
            cellStyle: { textAlign: 'right', backgroundColor: '#f8f9fa' }
        },
        {
            headerName: "Site Expense",
            field: "site_expense",
            width: isMobile ? 80 : 100,
            valueFormatter: (params) => params.value ? params.value.toLocaleString() : '0',
            cellStyle: { textAlign: 'right', backgroundColor: '#f8f9fa' }
        },
        {
            headerName: "Po Amount",
            field: "po_amount",
            width: isMobile ? 100 : 120,
            valueFormatter: (params) => params.value ? parseFloat(params.value).toLocaleString() : '0',
            cellStyle: { textAlign: 'right', backgroundColor: '#f8f9fa' }
        },
        // Visit 1 Group
        {
            headerName: "Visit1",
            headerClass: 'visit-header visit1-header',
            children: [
                {
                    headerName: "Supervisor",
                    field: "suppliername1",
                    width: isMobile ? 140 : 180,
                    cellRenderer: SupervisorDropdownRenderer,
                    cellStyle: { backgroundColor: '#ffebee', fontSize: '10px', padding: '0' }
                },
                {
                    headerName: "Visit Date",
                    field: "visitDate1",
                    width: isMobile ? 120 : 140,
                    cellRenderer: DateCellRenderer,
                    cellStyle: { backgroundColor: '#ffebee', fontSize: '10px', padding: '0' }
                },
                {
                    headerName: "View Report",
                    field: "visit_report1",
                    width: isMobile ? 150 : 180,
                    cellRenderer: FileUploadCellRenderer,
                    cellStyle: { backgroundColor: '#ffebee' }
                },
                {
                    headerName: "View Visit Report",
                    field: "view_visit_report1",
                    width: isMobile ? 150 : 180,
                    cellRenderer: FileUploadCellRenderer,
                    cellStyle: { backgroundColor: '#ffebee' }
                },
            ]
        },
        // Visit 2 Group
        {
            headerName: "Visit2",
            headerClass: 'visit-header visit2-header',
            children: [
                {
                    headerName: "Supervisor",
                    field: "suppliername2",
                    width: isMobile ? 140 : 180,
                    cellRenderer: SupervisorDropdownRenderer,
                    cellStyle: { backgroundColor: '#e8f5e8', fontSize: '10px', padding: '0' }
                },
                {
                    headerName: "Visit Date",
                    field: "visitDate2",
                    width: isMobile ? 120 : 140,
                    cellRenderer: DateCellRenderer,
                    cellStyle: { backgroundColor: '#e8f5e8', fontSize: '10px', padding: '0' }
                },
                {
                    headerName: "Visit Report",
                    field: "visit_report2",
                    width: isMobile ? 150 : 180,
                    cellRenderer: FileUploadCellRenderer,
                    cellStyle: { backgroundColor: '#e8f5e8' }
                },
                {
                    headerName: "View Visit Report",
                    field: "view_visit_report2",
                    width: isMobile ? 80 : 100,
                    cellRenderer: () => (
                        <button className="btn btn-sm btn-outline-info" style={{ fontSize: '9px', padding: '1px 4px' }}>
                            View
                        </button>
                    ),
                    cellStyle: { backgroundColor: '#e8f5e8', textAlign: 'center' }
                }
            ]
        },
        // Visit 3 Group
        {
            headerName: "Visit3",
            headerClass: 'visit-header visit3-header',
            children: [
                {
                    headerName: "Supervisor",
                    field: "suppliername3",
                    width: isMobile ? 140 : 180,
                    cellRenderer: SupervisorDropdownRenderer,
                    cellStyle: { backgroundColor: '#e3f2fd', fontSize: '10px', padding: '0' }
                },
                {
                    headerName: "Visit Date",
                    field: "visitDate3",
                    width: isMobile ? 120 : 140,
                    cellRenderer: DateCellRenderer,
                    cellStyle: { backgroundColor: '#e3f2fd', fontSize: '10px', padding: '0' }
                },
                {
                    headerName: "Visit Report",
                    field: "visit_report3",
                    width: isMobile ? 150 : 180,
                    cellRenderer: FileUploadCellRenderer,
                    cellStyle: { backgroundColor: '#e3f2fd' }
                }
            ]
        },
        // Visit 4 Group
        {
            headerName: "Visit4",
            headerClass: 'visit-header visit4-header',
            children: [
                {
                    headerName: "Supervisor",
                    field: "suppliername4",
                    width: isMobile ? 140 : 180,
                    cellRenderer: SupervisorDropdownRenderer,
                    cellStyle: { backgroundColor: '#b3e5fc', fontSize: '10px', padding: '0' }
                },
                {
                    headerName: "Visit Date",
                    field: "visitDate4",
                    width: isMobile ? 120 : 140,
                    cellRenderer: DateCellRenderer,
                    cellStyle: { backgroundColor: '#b3e5fc', fontSize: '10px', padding: '0' }
                },
                {
                    headerName: "Visit Report",
                    field: "visit_report4",
                    width: isMobile ? 150 : 180,
                    cellRenderer: FileUploadCellRenderer,
                    cellStyle: { backgroundColor: '#b3e5fc' }
                },
                {
                    headerName: "View Visit Report",
                    field: "view_visit_report4",
                    width: isMobile ? 80 : 100,
                    cellRenderer: () => (
                        <button className="btn btn-sm btn-outline-info" style={{ fontSize: '9px', padding: '1px 4px' }}>
                            View
                        </button>
                    ),
                    cellStyle: { backgroundColor: '#b3e5fc', textAlign: 'center' }
                },
                {
                    headerName: "Last Updated Time",
                    field: "lastAmcTime",
                    width: isMobile ? 120 : 140,
                    cellStyle: { backgroundColor: '#b3e5fc', fontSize: '10px' }
                },
                {
                    headerName: "Action",
                    field: "action",
                    width: isMobile ? 80 : 100,
                    cellRenderer: SaveButtonRenderer,
                    cellStyle: { backgroundColor: '#b3e5fc', textAlign: 'center', padding: '2px' }
                }
            ]
        }
    ], [isMobile, supervisors]);

    const defaultColDef = useMemo(() => ({
        filter: true,
        sortable: true,
        floatingFilter: !isMobile,
        resizable: true,
        suppressMenu: isMobile,
        cellStyle: { textAlign: 'right', fontSize: '11px' }
    }), [isMobile]);

    // Fetch AMC Dashboard data
    const fetchAmcData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch("https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/amc_dashboard_api.php", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.status === "success" && Array.isArray(result.data)) {
                setRowData(result.data);
                setLastUpdated(result.lastTime || new Date().toISOString());
                showToast(`Loaded ${result.data.length} AMC records successfully`, "success");
            } else {
                throw new Error(result.message || "No data received");
            }
        } catch (error) {
            console.error("Error fetching AMC data:", error);
            showToast(`Error loading AMC data: ${error.message}`, "error");
            setRowData([]);
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    // Export to Excel
    const downloadExcel = () => {
        if (!gridRef.current?.api) return;
        
        try {
            const params = {
                fileName: `AMC_Dashboard_${new Date().toISOString().split('T')[0]}.csv`,
                allColumns: true,
                onlySelected: false
            };
            gridRef.current.api.exportDataAsCsv(params);
            showToast("CSV exported successfully!", "success");
        } catch (error) {
            console.error('Error exporting data:', error);
            showToast("Error exporting CSV", "error");
        }
    };

    // Auto size all columns
    const autoSizeAll = () => {
        if (!gridRef.current?.api) return;
        
        setTimeout(() => {
            const allColumnIds = gridRef.current.api.getColumns()?.map(column => column.getId()) || [];
            if (allColumnIds.length > 0) {
                gridRef.current.api.autoSizeColumns(allColumnIds, false);
                showToast("Columns auto-sized", "success");
            }
        }, 100);
    };

    // Size columns to fit
    const sizeColumnsToFit = () => {
        if (!gridRef.current?.api) return;
        gridRef.current.api.sizeColumnsToFit();
        showToast("Columns fitted to screen", "success");
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
    const gridHeight = isFullScreen ? 'calc(100vh - 180px)' : (isMobile ? '400px' : '600px');

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
    }, [theme, themeStyles]);

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
                    <p className="mt-3">Loading AMC Dashboard...</p>
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
            {ToastContainer}
            
            <Container fluid={isFullScreen}>
                <Card style={{
                    backgroundColor: themeStyles.cardBg,
                    color: themeStyles.color,
                    border: theme === 'dark' ? '1px solid #495057' : '1px solid #dee2e6',
                    margin: isFullScreen ? 0 : 20,
                    borderRadius: isFullScreen ? 0 : 8
                }}>
                    {/* Header */}
                    <Card.Header style={{
                        background: themeStyles.cardHeader,
                        color: theme === 'dark' ? '#ffffff' : '#000000',
                        fontFamily: "'Maven Pro', sans-serif",
                        padding: '1rem 2rem'
                    }}>
                        <Row className="align-items-center">
                            <Col xs={12} lg={6} className="mb-2 mb-lg-0">
                                <h4 className="mb-0">
                                    AMC Dashboard
                                </h4>
                                <small style={{ opacity: 0.8 }}>
                                    {`${rowData.length} AMC records found`}
                                    {selectedRows.length > 0 && ` | ${selectedRows.length} selected`}
                                </small>
                            </Col>

                            <Col xs={12} lg={6}>
                                <div className="d-flex justify-content-end gap-2 flex-wrap align-items-center">
                                    <ButtonGroup size="sm">
                                        <Button 
                                            variant="success" 
                                            onClick={downloadExcel}
                                            title="Download Excel Export File"
                                        >
                                            <i className="bi bi-file-earmark-excel"></i>
                                            {!isMobile && ' Download Excel Export File'}
                                        </Button>
                                        <Button 
                                            variant="warning" 
                                            onClick={() => {/* Clear pinned logic */}}
                                            title="Clear Pinned"
                                        >
                                            <i className="bi bi-pin-angle"></i>
                                            {!isMobile && ' Clear Pinned'}
                                        </Button>
                                        <Button 
                                            variant="info" 
                                            onClick={() => {/* Pinned logic */}}
                                            title="Pinned"
                                        >
                                            <i className="bi bi-pin-fill"></i>
                                            {!isMobile && ' Pinned'}
                                        </Button>
                                    </ButtonGroup>

                                    <ButtonGroup size="sm">
                                        <Button variant="secondary" onClick={sizeColumnsToFit}>
                                            <i className="bi bi-arrows-angle-contract"></i>
                                            {!isMobile && ' Size To Fit'}
                                        </Button>
                                        <Button variant="info" onClick={autoSizeAll}>
                                            <i className="bi bi-arrows-angle-expand"></i>
                                            {!isMobile && ' Auto-Size All'}
                                        </Button>
                                        <Button variant="outline-info" onClick={autoSizeAll}>
                                            <i className="bi bi-arrows-angle-expand"></i>
                                            {!isMobile && ' Auto-Size All (Skip Header)'}
                                        </Button>
                                    </ButtonGroup>

                                    <ButtonGroup size="sm">
                                        <Button
                                            variant="outline-light"
                                            onClick={toggleFullScreen}
                                        >
                                            <i className={`bi ${isFullScreen ? 'bi-fullscreen-exit' : 'bi-fullscreen'}`}></i>
                                            {!isMobile && (isFullScreen ? ' Exit' : ' Full')}
                                        </Button>
                                        <Button
                                            variant="outline-light"
                                            onClick={toggleTheme}
                                        >
                                            {theme === 'light' ? '🌙' : '☀️'}
                                            {!isMobile && (theme === 'light' ? ' Dark' : ' Light')}
                                        </Button>
                                    </ButtonGroup>

                                    <div style={{ color: themeStyles.color, fontSize: '12px' }}>
                                        Recent Updated Date: {lastUpdated ? new Date(lastUpdated).toLocaleString() : 'N/A'}
                                    </div>

                                    <select 
                                        className="form-select form-select-sm"
                                        style={{ width: 'auto', minWidth: '60px' }}
                                        defaultValue="10"
                                    >
                                        <option value="10">10</option>
                                        <option value="25">25</option>
                                        <option value="50">50</option>
                                        <option value="100">100</option>
                                    </select>
                                </div>
                            </Col>
                        </Row>
                    </Card.Header>

                    {/* Grid Body */}
                    <Card.Body style={{
                        backgroundColor: themeStyles.cardBg,
                        padding: isFullScreen ? 0 : 15
                    }}>
                        {rowData.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '50px',
                                color: themeStyles.color
                            }}>
                                <i className="bi bi-clipboard-data" style={{ fontSize: '3rem', marginBottom: '20px' }}></i>
                                <h5>No AMC data available</h5>
                                <p>Please check your API connection or refresh the page.</p>
                            </div>
                        ) : (
                            <div style={{ height: gridHeight, backgroundColor: 'white', border: '1px solid #ddd' }}>
                                <style>
                                    {`
                                        .visit-header {
                                            text-align: center !important;
                                            font-weight: bold !important;
                                        }
                                        .visit1-header {
                                            background-color: #ffebee !important;
                                        }
                                        .visit2-header {
                                            background-color: #e8f5e8 !important;
                                        }
                                        .visit3-header {
                                            background-color: #e3f2fd !important;
                                        }
                                        .visit4-header {
                                            background-color: #b3e5fc !important;
                                        }
                                        .ag-header-group-cell-label {
                                            font-weight: bold !important;
                                        }
                                        .ag-theme-alpine .ag-header-cell {
                                            font-size: ${isMobile ? '10px' : '12px'} !important;
                                        }
                                        .ag-theme-alpine .ag-cell {
                                            font-size: ${isMobile ? '9px' : '11px'} !important;
                                        }
                                        .ag-theme-alpine .ag-header-group-cell {
                                            font-weight: bold !important;
                                            text-align: center !important;
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
                                        @keyframes toastSlide {
                                            from { opacity:0; transform:translateX(100%); }
                                            to   { opacity:1; transform:translateX(0);    }
                                        }
                                    `}
                                </style>
                                <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' }}>
                                    <AgGridReact
                                        ref={gridRef}
                                        rowData={rowData}
                                        columnDefs={columnDefs}
                                        defaultColDef={defaultColDef}
                                        pagination={true}
                                        paginationPageSize={isMobile ? 10 : 20}
                                        rowSelection="single"
                                        suppressMovableColumns={isMobile}
                                        enableRangeSelection={!isMobile}
                                        animateRows={!isMobile}
                                        headerHeight={isMobile ? 30 : 35}
                                        rowHeight={isMobile ? 28 : 32}
                                        groupHeaderHeight={isMobile ? 35 : 40}
                                        onGridReady={() => {
                                            console.log('AMC Grid is ready');
                                            setTimeout(() => autoSizeAll(), 500);
                                        }}
                                        onSelectionChanged={(event) => {
                                            const selectedNodes = event.api.getSelectedNodes();
                                            const selectedData = selectedNodes.map(node => node.data);
                                            setSelectedRows(selectedData);
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </Card.Body>

                    {/* Footer with pagination info */}
                    <Card.Footer style={{
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
                        <div>
                            1 to {Math.min(10, rowData.length)} of {rowData.length}
                        </div>
                        <div>
                            Page 1 of {Math.ceil(rowData.length / 10)}
                        </div>
                        <div style={{ color: '#ccc', fontSize: '10px', textAlign: 'right' }}>
                            Activate Windows<br/>
                            <small>Go to Settings to activate Windows.</small>
                        </div>
                    </Card.Footer>
                </Card>
            </Container>
        </div>
    );
};

export default AmcDashboard;