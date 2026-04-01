import React, { useEffect, useMemo, useState, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
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
import { Container, Button, Row, Col, Card, Modal, Form, Spinner } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

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

const EmployeeDocumentation = () => {
    const [theme, setTheme] = useState('light');
    const [employeeData, setEmployeeData] = useState([]);
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    
    // Modal states
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    
    // Data states
    const [uploadData, setUploadData] = useState({ 
        employeeId: '', 
        employeeName: '',
        documentType: '', 
        file: null 
    });
    const [generateData, setGenerateData] = useState({
        employeeId: '',
        employeeName: '',
        projectName: '',
        company: 'Surya Equipments Pvt. Lt.',
        fromDate: '',
        toDate: '',
        esicNo: '',
        uanNo: ''
    });
    const [viewData, setViewData] = useState({
        url: '',
        type: '', // 'image' or 'pdf'
        title: ''
    });
    
    const gridRef = useRef();

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // API URLs
    const EMPLOYEE_API_URL = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Hr/OutsideEmployeeListApi.php";
    const UPLOAD_API_URL = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Hr/uploadDocumentsApi.php";
    const EDIT_API_URL = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Hr/uploadEditOutsideEmployeeDocumentApi.php";
    const DELETE_API_URL = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Hr/deleteOutsideEmployeeDocumentApi.php";
    const GENERATE_CARD_API_URL = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Hr/generateIdentityCardApi.php";

    // Map React field names to PHP API type names
    const getApiDocumentType = (field) => {
        const typeMap = {
            'epic': 'person',
            'resume': 'resume',
            'aadhar': 'Aadhar',
            'pan': 'pan',
            'passport': 'passport',
            'pfuan': 'pfuan',
            'passbook': 'bank',
            'esic': 'esic',
            'esic_galaxy': 'esic_galaxy',
            'experience': 'experience',
            'father': 'father',
            'mother': 'mother',
            'wife': 'wife',
            'child1': 'child1',
            'child2': 'child2',
            'ssc_mark': 'ssc',
            'hsc_mark': 'hsc',
            'degree_mark': 'degree',
            'ssc_cert': 'sscCer',
            'hsc_cert': 'hscCer',
            'degree_cert': 'degreeCer',
        };
        return typeMap[field] || field;
    };

    // Map React field names to database column names for delete API
    const getDbColumnName = (field) => {
        const columnMap = {
            'epic': 'epic',
            'resume': 'resume_path',
            'aadhar': 'adhar',
            'pan': 'pan',
            'passport': 'passport',
            'pfuan': 'pfuan',
            'passbook': 'passbook',
            'esic': 'esic',
            'esic_galaxy': 'esic_galaxy',
            'experience': 'expcert',
            'father': 'father',
            'mother': 'mother',
            'wife': 'wife',
            'child1': 'child1',
            'child2': 'child2',
            'ssc_mark': 'mssc',
            'hsc_mark': 'mhsc',
            'degree_mark': 'mdegree',
            'ssc_cert': 'cssc',
            'hsc_cert': 'chsc',
            'degree_cert': 'cdegree',
        };
        return columnMap[field] || field;
    };

    // Fetch employee data
    const fetchEmployeeData = async () => {
        setLoading(true);
        try {
            const response = await fetch(EMPLOYEE_API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.success && data.data && data.data.employees) {
                setEmployeeData(data.data.employees);
                toast.success(`Loaded ${data.data.count} employee records`);
            } else {
                throw new Error("No data received");
            }
        } catch (error) {
            console.error("Error fetching employee data:", error);
            toast.error(`Error fetching employee data: ${error.message}`);
            setEmployeeData([]);
        } finally {
            setLoading(false);
        }
    };

    // Load data on mount
    useEffect(() => {
        fetchEmployeeData();
    }, []);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    // Handle selection changed
    const onSelectionChanged = (event) => {
        const selectedNodes = event.api.getSelectedNodes();
        const selectedData = selectedNodes.map(node => node.data);
        setSelectedRows(selectedData);
    };

    // Helper function to get document data from nested structure
    const getDocumentData = (employee, field) => {
        const docs = employee.documents;
        if (!docs) return null;

        const fieldMap = {
            'epic': docs.epic,
            'resume': docs.resume,
            'aadhar': docs.aadhar,
            'pan': docs.pan,
            'passport': docs.passport,
            'pfuan': docs.pfuan,
            'passbook': docs.passbook,
            'esic': docs.esic,
            'esic_galaxy': docs.esic_galaxy,
            'experience': docs.experience,
            'father': docs.family?.father,
            'mother': docs.family?.mother,
            'wife': docs.family?.wife,
            'child1': docs.family?.child1,
            'child2': docs.family?.child2,
            'ssc_mark': docs.education?.marksheets?.ssc,
            'hsc_mark': docs.education?.marksheets?.hsc,
            'degree_mark': docs.education?.marksheets?.degree,
            'ssc_cert': docs.education?.certificates?.ssc,
            'hsc_cert': docs.education?.certificates?.hsc,
            'degree_cert': docs.education?.certificates?.degree,
        };

        return fieldMap[field] || null;
    };

    // Get document label for display
    const getDocumentLabel = (field) => {
        const labelMap = {
            'epic': 'Person Photo',
            'resume': 'Biodata Resume',
            'aadhar': 'Aadhar Card',
            'pan': 'PAN Card',
            'passport': 'Passport',
            'pfuan': 'PF-UAN Document',
            'passbook': 'Bank Passbook',
            'esic': 'ESIC (Surya)',
            'esic_galaxy': 'ESIC (Galaxy)',
            'experience': 'Experience Certificate',
            'father': 'Father Document',
            'mother': 'Mother Document',
            'wife': 'Wife Document',
            'child1': 'Child 1 Document',
            'child2': 'Child 2 Document',
            'ssc_mark': 'S.S.C. Marksheet',
            'hsc_mark': 'H.S.C. Marksheet',
            'degree_mark': 'Degree Marksheet',
            'ssc_cert': 'S.S.C. Certificate',
            'hsc_cert': 'H.S.C. Certificate',
            'degree_cert': 'Degree Certificate',
        };
        return labelMap[field] || field;
    };

    // Document Action Button Renderer
    const DocumentActionRenderer = (props) => {
        const { data, colDef } = props;
        const documentType = colDef.field;
        const documentData = getDocumentData(data, documentType);

        if (!documentData) return <span>-</span>;

        const handleUpload = () => {
            setUploadData({
                employeeId: data.employee_id,
                employeeName: data.name,
                documentType: documentType,
                file: null
            });
            setIsEditMode(false);
            setShowUploadModal(true);
        };
        
        const handleView = () => {
            if (documentData.path) {
                const fileUrl = `https://www.erp.suryaequipments.com/uploads/${documentData.path}`;
                const fileExtension = documentData.path.split('.').pop().toLowerCase();
                
                setViewData({
                    url: fileUrl,
                    type: ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension) ? 'image' : 'pdf',
                    title: `${data.name} - ${getDocumentLabel(documentType)}`
                });
                setShowViewModal(true);
            }
        };

        const handleEdit = () => {
            setUploadData({
                employeeId: data.employee_id,
                employeeName: data.name,
                documentType: documentType,
                file: null
            });
            setIsEditMode(true);
            setShowUploadModal(true);
        };

        const handleDelete = async () => {
            if (window.confirm('Are you sure you want to delete this document?')) {
                try {
                    const dbColumnName = getDbColumnName(documentType);
                    
                    const response = await fetch(DELETE_API_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            type: dbColumnName,
                            empid: data.employee_id
                        })
                    });
                    
                    const result = await response.json();
                    
                    if (result.status) {
                        toast.success(result.message || 'Document deleted successfully');
                        fetchEmployeeData();
                    } else {
                        toast.error(result.message || 'Failed to delete document');
                    }
                } catch (error) {
                    console.error('Delete error:', error);
                    toast.error('Error deleting document: ' + error.message);
                }
            }
        };

        if (documentData.exists) {
            return (
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    <button 
                        onClick={handleView}
                        style={{
                            padding: '4px 8px',
                            fontSize: '11px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer'
                        }}
                    >
                        <i className="bi bi-eye"></i> View
                    </button>
                    <button 
                        onClick={handleEdit}
                        style={{
                            padding: '4px 8px',
                            fontSize: '11px',
                            backgroundColor: '#ffc107',
                            color: '#333',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer'
                        }}
                    >
                        <i className="bi bi-pencil"></i> Edit
                    </button>
                    <button 
                        onClick={handleDelete}
                        style={{
                            padding: '4px 8px',
                            fontSize: '11px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer'
                        }}
                    >
                        <i className="bi bi-trash"></i> Delete
                    </button>
                </div>
            );
        } else {
            return (
                <button 
                    onClick={handleUpload}
                    style={{
                        padding: '4px 8px',
                        fontSize: '11px',
                        backgroundColor: '#17a2b8',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer'
                    }}
                >
                    <i className="bi bi-upload"></i> Upload
                </button>
            );
        }
    };

    // Generate Identity Card Renderer
    const GenerateCardRenderer = (props) => {
        const { data } = props;
        
        const handleGenerate = () => {
            // Get employee documents for pre-filling data
            const docs = data.documents || {};
            
            setGenerateData({
                employeeId: data.employee_id,
                employeeName: data.name,
                projectName: '',
                company: 'Surya Equipments Pvt. Lt.',
                fromDate: data.joining_date || '',
                toDate: '',
                esicNo: docs.esic?.number || '',
                uanNo: docs.pfuan?.number || ''
            });
            setShowGenerateModal(true);
        };

        return (
            <button 
                onClick={handleGenerate}
                style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer'
                }}
            >
                <i className="bi bi-download"></i> Generate
            </button>
        );
    };

    // Theme styles
    const getThemeStyles = () => {
        if (theme === 'dark') {
            return {
                backgroundColor: 'linear-gradient(135deg, #21262d 0%, #161b22 100%)',
                color: '#f8f9fa',
                cardBg: '#2d3748',
                cardHeader: 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)',
                buttonVariant: 'outline-light',
                textClass: 'text-light',
                borderClass: 'border-secondary'
            };
        }
        return {
            backgroundColor: 'linear-gradient(135deg,rgba(252, 252, 255, 0.96) 0%,rgb(229, 235, 240) 100%)',
            color: '#212529',
            cardBg: '#ffffff',
            cardHeader: 'linear-gradient(135deg,rgba(218, 208, 208, 0.67) 0%,rgba(97, 91, 91, 0.56) 100%)',
            buttonVariant: 'outline-dark',
            textClass: 'text-dark',
            borderClass: 'border-light'
        };
    };

    const themeStyles = getThemeStyles();

    // Apply theme to document body
    useEffect(() => {
        if (theme === 'dark') {
            document.body.style.background = 'linear-gradient(135deg, #21262d 0%, #161b22 100%)';
            document.body.style.color = '#f8f9fa';
            document.body.style.minHeight = '100vh';
        } else {
            document.body.style.background = 'linear-gradient(135deg,rgba(252, 252, 255, 0.96) 0%,rgb(229, 235, 240) 100%)';
            document.body.style.color = '#212529';
            document.body.style.minHeight = '100vh';
        }

        return () => {
            document.body.style.background = '';
            document.body.style.color = '';
            document.body.style.minHeight = '';
        };
    }, [theme]);

    // AG Grid column definitions
    const columnDefs = useMemo(() => [
        {
            headerName: "Emp Code",
            field: "emp_code",
            filter: "agTextColumnFilter",
            sortable: true,
            width: 100,
            pinned: 'left',
            lockPosition: true,
            cellStyle: { fontWeight: 'bold', textAlign: 'center' }
        },
        {
            headerName: "Person Name",
            field: "name",
            filter: "agTextColumnFilter",
            sortable: true,
            width: 200,
            pinned: 'left',
            checkboxSelection: true,
            headerCheckboxSelection: true,
            cellStyle: { fontWeight: 'bold' }
        },
        {
            headerName: "Person Photo",
            field: "epic",
            cellRenderer: DocumentActionRenderer,
            width: 180,
            suppressMenu: true
        },
        {
            headerName: "Generate Identity Card",
            cellRenderer: GenerateCardRenderer,
            width: 180,
            suppressMenu: true
        },
        {
            headerName: "Biodata Resume",
            field: "resume",
            cellRenderer: DocumentActionRenderer,
            width: 180,
            suppressMenu: true
        },
        {
            headerName: "Joining Date",
            field: "joining_date",
            filter: "agDateColumnFilter",
            sortable: true,
            width: 130,
            cellStyle: { textAlign: 'center' }
        },
        {
            headerName: "Aadhar No.",
            field: "aadhar",
            cellRenderer: DocumentActionRenderer,
            width: 180,
            suppressMenu: true
        },
        {
            headerName: "PAN No.",
            field: "pan",
            cellRenderer: DocumentActionRenderer,
            width: 180,
            suppressMenu: true
        },
        {
            headerName: "Passport No.",
            field: "passport",
            cellRenderer: DocumentActionRenderer,
            width: 180,
            suppressMenu: true
        },
        {
            headerName: "PF-UAN No.",
            field: "pfuan",
            cellRenderer: DocumentActionRenderer,
            width: 180,
            suppressMenu: true
        },
        {
            headerName: "Bank Passbook",
            field: "passbook",
            cellRenderer: DocumentActionRenderer,
            width: 180,
            suppressMenu: true
        },
        {
            headerName: "ESIC No. (Surya)",
            field: "esic",
            cellRenderer: DocumentActionRenderer,
            width: 180,
            suppressMenu: true
        },
        {
            headerName: "ESIC No. (Galaxy)",
            field: "esic_galaxy",
            cellRenderer: DocumentActionRenderer,
            width: 180,
            suppressMenu: true
        },
        {
            headerName: "Experience Certificate",
            field: "experience",
            cellRenderer: DocumentActionRenderer,
            width: 180,
            suppressMenu: true
        },
        {
            headerName: "Father",
            field: "father",
            cellRenderer: DocumentActionRenderer,
            width: 180,
            suppressMenu: true,
            columnGroupShow: 'open'
        },
        {
            headerName: "Mother",
            field: "mother",
            cellRenderer: DocumentActionRenderer,
            width: 180,
            suppressMenu: true,
            columnGroupShow: 'open'
        },
        {
            headerName: "Wife",
            field: "wife",
            cellRenderer: DocumentActionRenderer,
            width: 180,
            suppressMenu: true,
            columnGroupShow: 'open'
        },
        {
            headerName: "Child 1",
            field: "child1",
            cellRenderer: DocumentActionRenderer,
            width: 180,
            suppressMenu: true,
            columnGroupShow: 'open'
        },
        {
            headerName: "Child 2",
            field: "child2",
            cellRenderer: DocumentActionRenderer,
            width: 180,
            suppressMenu: true,
            columnGroupShow: 'open'
        },
        {
            headerName: "S.S.C. (Mark)",
            field: "ssc_mark",
            cellRenderer: DocumentActionRenderer,
            width: 180,
            suppressMenu: true,
            columnGroupShow: 'open'
        },
        {
            headerName: "H.S.C. (Mark)",
            field: "hsc_mark",
            cellRenderer: DocumentActionRenderer,
            width: 180,
            suppressMenu: true,
            columnGroupShow: 'open'
        },
        {
            headerName: "Degree (Mark)",
            field: "degree_mark",
            cellRenderer: DocumentActionRenderer,
            width: 180,
            suppressMenu: true,
            columnGroupShow: 'open'
        },
        {
            headerName: "S.S.C. (Cert)",
            field: "ssc_cert",
            cellRenderer: DocumentActionRenderer,
            width: 180,
            suppressMenu: true,
            columnGroupShow: 'open'
        },
        {
            headerName: "H.S.C. (Cert)",
            field: "hsc_cert",
            cellRenderer: DocumentActionRenderer,
            width: 180,
            suppressMenu: true,
            columnGroupShow: 'open'
        },
        {
            headerName: "Degree (Cert)",
            field: "degree_cert",
            cellRenderer: DocumentActionRenderer,
            width: 180,
            suppressMenu: true,
            columnGroupShow: 'open'
        },
    ], [isMobile]);

    const defaultColDef = useMemo(() => ({
        resizable: true,
        sortable: true,
        filter: true,
        floatingFilter: !isMobile,
        suppressMenu: isMobile,
        flex: isMobile ? 1 : 0,
        cellStyle: { textAlign: 'left' }
    }), [isMobile]);

    const onGridReady = (params) => {
        console.log('Employee Documentation Grid is ready');
    };

    const handleExportCSV = () => {
        if (gridRef.current && gridRef.current.api) {
            gridRef.current.api.exportDataAsCsv({
                fileName: `Employee_Documentation_${new Date().toISOString().split('T')[0]}.csv`
            });
            toast.success('Data exported to CSV');
        }
    };

    const handleRefresh = () => {
        fetchEmployeeData();
    };

    // Handle Upload/Edit Submit
    const handleUploadSubmit = async () => {
        if (!uploadData.file) {
            toast.error('Please select a file');
            return;
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (uploadData.file.size > maxSize) {
            toast.error('File size must be less than 10MB');
            return;
        }

        const formData = new FormData();
        formData.append('empid', uploadData.employeeId);
        formData.append('type', getApiDocumentType(uploadData.documentType));
        formData.append('file', uploadData.file);

        // Log FormData contents for debugging
        console.log('Upload Data:', {
            empid: uploadData.employeeId,
            type: getApiDocumentType(uploadData.documentType),
            fileName: uploadData.file.name,
            fileSize: uploadData.file.size,
            fileType: uploadData.file.type,
            isEditMode: isEditMode
        });

        try {
            setLoading(true);
            const apiUrl = isEditMode ? EDIT_API_URL : UPLOAD_API_URL;
            
            console.log('Uploading to:', apiUrl);
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                body: formData
                // Note: DO NOT set Content-Type header - browser will set it automatically with boundary
            });
            
            console.log('Response status:', response.status);
            
            // Try to parse response as JSON
            let result;
            const responseText = await response.text();
            console.log('Response text:', responseText);
            
            try {
                result = JSON.parse(responseText);
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                throw new Error('Invalid response from server: ' + responseText.substring(0, 100));
            }
            
            if (result.status) {
                toast.success(result.message || `Document ${isEditMode ? 'updated' : 'uploaded'} successfully`);
                setShowUploadModal(false);
                setUploadData({ employeeId: '', employeeName: '', documentType: '', file: null });
                setIsEditMode(false);
                fetchEmployeeData();
            } else {
                toast.error(result.message || `Failed to ${isEditMode ? 'update' : 'upload'} document`);
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(`Error ${isEditMode ? 'updating' : 'uploading'} document: ` + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Handle Generate Identity Card
    const handleGenerateCard = async () => {
        // Validate required fields
        if (!generateData.projectName) {
            toast.error('Please enter project name');
            return;
        }
        if (!generateData.fromDate || !generateData.toDate) {
            toast.error('Please select both from and to dates');
            return;
        }

        try {
            setLoading(true);
            
            const requestBody = {
                projectName: generateData.projectName,
                empid: generateData.employeeId,
                company: generateData.company,
                fromdate: generateData.fromDate,
                todate: generateData.toDate,
                esic: generateData.esicNo,
                uan: generateData.uanNo
            };

            const response = await fetch(GENERATE_CARD_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            const result = await response.json();

            if (result.status) {
                toast.success(result.message || 'Identity card generated successfully');
                setShowGenerateModal(false);
                setGenerateData({
                    employeeId: '',
                    employeeName: '',
                    projectName: '',
                    company: 'Surya Equipments Pvt. Lt.',
                    fromDate: '',
                    toDate: '',
                    esicNo: '',
                    uanNo: ''
                });
                // Optionally refresh data to update ESIC and UAN numbers
                fetchEmployeeData();
            } else {
                toast.error(result.message || 'Failed to generate identity card');
            }
        } catch (error) {
            console.error('Generate card error:', error);
            toast.error('Error generating identity card: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const getGridHeight = () => {
        if (isFullScreen) {
            return isMobile ? 'calc(100vh - 200px)' : 'calc(100vh - 220px)';
        }
        return isMobile ? '400px' : '500px';
    };

    const containerStyles = isFullScreen ? {
        margin: 0,
        padding: 0,
        maxWidth: '100%',
        width: '100vw'
    } : {};

    const cardStyles = isFullScreen ? {
        margin: 0,
        borderRadius: 0,
        height: '100vh',
        border: 'none'
    } : {
        margin: isMobile ? '10px' : '20px',
        borderRadius: '8px'
    };

    if (loading && employeeData.length === 0) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: theme === 'dark'
                    ? 'linear-gradient(135deg, #21262d 0%, #161b22 100%)'
                    : 'linear-gradient(135deg,rgba(252, 252, 255, 0.96) 0%,rgb(229, 235, 240) 100%)'
            }}>
                <div style={{ textAlign: 'center', color: themeStyles.color }}>
                    <Spinner animation="border" style={{ width: '3rem', height: '3rem' }} />
                    <p className="mt-3">Loading employee data...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: theme === 'dark'
                ? 'linear-gradient(135deg, #21262d 0%, #161b22 100%)'
                : 'linear-gradient(135deg,rgba(252, 252, 255, 0.96) 0%,rgb(229, 235, 240) 100%)',
            color: themeStyles.color,
            padding: 0,
            margin: 0,
            overflow: isFullScreen ? 'hidden' : 'auto'
        }}>
            <Container
                fluid={isFullScreen}
                style={containerStyles}
                className={isFullScreen ? 'p-0' : ''}
            >
                <Card style={{
                    backgroundColor: themeStyles.cardBg,
                    color: themeStyles.color,
                    border: theme === 'dark' ? '1px solid #495057' : '1px solid #dee2e6',
                    ...cardStyles
                }}>
                    {/* Header */}
                    <Card.Header style={{
                        background: themeStyles.cardHeader,
                        color: '#ffffff',
                        fontFamily: "'Maven Pro', sans-serif",
                        padding: isMobile ? '10px 15px' : '0.5rem 2rem',
                        flexShrink: 0,
                        fontWeight: '100'
                    }}>
                        <Row className="align-items-center g-2">
                            <Col xs={12} lg={6} className="mb-2 mb-lg-0">
                                <h4
                                    className={`mb-1 ${isMobile ? 'fs-6' : ''}`}
                                    style={{
                                        fontFamily: "'Maven Pro', sans-serif",
                                        fontWeight: '100',
                                        color: 'black'
                                    }}
                                >
                                    Employee Documentation Management
                                </h4>
                                <small style={{ color: '#666', fontSize: '0.8rem' }}>
                                    {`${employeeData.length} employees`}
                                    {selectedRows.length > 0 && ` | ${selectedRows.length} selected`}
                                </small>
                            </Col>

                            <Col xs={12} lg={6}>
                                <div className="d-flex justify-content-end gap-1 flex-wrap">
                                    <Button
                                        variant="success"
                                        size="sm"
                                        onClick={handleRefresh}
                                        disabled={loading}
                                        title="Refresh Data"
                                    >
                                        <i className="bi bi-arrow-clockwise"></i> {isMobile ? '' : 'Refresh'}
                                    </Button>

                                    <Button
                                        variant="success"
                                        size="sm"
                                        onClick={handleExportCSV}
                                        title="Download CSV"
                                    >
                                        <i className="bi bi-download"></i> {isMobile ? '' : 'Export'}
                                    </Button>

                                    <Button
                                        variant="outline-light"
                                        size="sm"
                                        onClick={toggleFullScreen}
                                        title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
                                    >
                                        <i className={`bi ${isFullScreen ? 'bi-fullscreen-exit' : 'bi-fullscreen'}`}></i>
                                    </Button>

                                    <Button
                                        variant="outline-light"
                                        size="sm"
                                        onClick={toggleTheme}
                                        title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
                                    >
                                        {theme === 'light' ? '🌙' : '☀️'}
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    </Card.Header>

                    {/* Body Content - AG Grid */}
                    <Card.Body style={{
                        backgroundColor: themeStyles.cardBg,
                        color: themeStyles.color,
                        padding: isFullScreen ? '0' : (isMobile ? '10px' : '15px'),
                        flex: 1,
                        overflow: 'hidden'
                    }}>
                        {employeeData.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '50px',
                                color: themeStyles.color
                            }}>
                                <i className="bi bi-people" style={{ fontSize: '3rem', marginBottom: '20px' }}></i>
                                <h5>No employee data available</h5>
                                <p>Please check your API connection.</p>
                            </div>
                        ) : (
                            <div
                                className="ag-theme-alpine"
                                style={{
                                    height: getGridHeight(),
                                    width: '100%',
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
                                    rowData={employeeData}
                                    columnDefs={columnDefs}
                                    defaultColDef={defaultColDef}
                                    pagination={true}
                                    paginationPageSize={isMobile ? 10 : (isFullScreen ? 15 : 10)}
                                    rowSelection="multiple"
                                    onSelectionChanged={onSelectionChanged}
                                    onGridReady={onGridReady}
                                    suppressMovableColumns={isMobile}
                                    enableRangeSelection={!isMobile}
                                    animateRows={!isMobile}
                                    enableCellTextSelection={true}
                                    suppressHorizontalScroll={false}
                                    suppressColumnVirtualisation={isMobile}
                                    rowBuffer={isMobile ? 5 : 10}
                                    headerHeight={isMobile ? 40 : 48}
                                    rowHeight={isMobile ? 50 : 60}
                                    suppressMenuHide={isMobile}
                                    suppressContextMenu={isMobile}
                                />
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </Container>

            {/* Upload/Edit Files Modal */}
            <Modal 
                show={showUploadModal} 
                onHide={() => {
                    setShowUploadModal(false);
                    setUploadData({ employeeId: '', employeeName: '', documentType: '', file: null });
                    setIsEditMode(false);
                }} 
                centered 
                backdrop="static"
            >
                <Modal.Header closeButton style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                    <Modal.Title>{isEditMode ? 'Edit Document' : 'Upload Document'}</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ padding: '20px' }}>
                    <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#e7f3ff', borderRadius: '5px' }}>
                        <small>
                            <strong>Employee:</strong> {uploadData.employeeName} ({uploadData.employeeId})<br/>
                            <strong>Document Type:</strong> {getDocumentLabel(uploadData.documentType)}
                        </small>
                    </div>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label style={{ fontWeight: '600', marginBottom: '8px' }}>Select File</Form.Label>
                            <Form.Control 
                                type="file" 
                                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                                onChange={(e) => setUploadData({...uploadData, file: e.target.files[0]})}
                                style={{ padding: '8px' }}
                            />
                            <Form.Text className="text-muted">
                                Accepted formats: JPG, PNG, PDF, DOC, DOCX
                            </Form.Text>
                        </Form.Group>
                        {uploadData.file && (
                            <div style={{ 
                                padding: '10px', 
                                backgroundColor: '#d4edda', 
                                borderRadius: '5px',
                                marginTop: '10px'
                            }}>
                                <small>
                                    <strong>Selected file:</strong> {uploadData.file.name}
                                </small>
                            </div>
                        )}
                    </Form>
                </Modal.Body>
                <Modal.Footer style={{ justifyContent: 'center', gap: '10px', padding: '15px' }}>
                    <Button 
                        variant="success" 
                        onClick={handleUploadSubmit}
                        style={{ minWidth: '100px' }}
                        disabled={loading}
                    >
                        {loading ? <Spinner animation="border" size="sm" /> : (isEditMode ? 'Update' : 'Upload')}
                    </Button>
                    <Button 
                        variant="danger" 
                        onClick={() => {
                            setShowUploadModal(false);
                            setUploadData({ employeeId: '', employeeName: '', documentType: '', file: null });
                            setIsEditMode(false);
                        }}
                        style={{ minWidth: '100px' }}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Generate Identity Card Modal */}
            <Modal 
                show={showGenerateModal} 
                onHide={() => {
                    setShowGenerateModal(false);
                    setGenerateData({
                        employeeId: '',
                        employeeName: '',
                        projectName: '',
                        company: 'Surya Equipments Pvt. Lt.',
                        fromDate: '',
                        toDate: '',
                        esicNo: '',
                        uanNo: ''
                    });
                }} 
                centered 
                backdrop="static"
                size="lg"
            >
                <Modal.Header closeButton style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                    <Modal.Title>Generate Identity Card</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ padding: '20px' }}>
                    <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#e7f3ff', borderRadius: '5px' }}>
                        <small>
                            <strong>Employee:</strong> {generateData.employeeName} ({generateData.employeeId})
                        </small>
                    </div>
                    <Form>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label style={{ fontWeight: '600' }}>Enter Project Name <span style={{color: 'red'}}>*</span></Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        placeholder="Enter project name"
                                        value={generateData.projectName}
                                        onChange={(e) => setGenerateData({...generateData, projectName: e.target.value})}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label style={{ fontWeight: '600' }}>Select Company <span style={{color: 'red'}}>*</span></Form.Label>
                                    <Form.Select 
                                        value={generateData.company}
                                        onChange={(e) => setGenerateData({...generateData, company: e.target.value})}
                                    >
                                        <option value="Surya Equipments Pvt. Lt.">Surya Equipments Pvt. Lt.</option>
                                        <option value="Galaxy Equipment Pvt. Ltd.">Galaxy Equipment Pvt. Ltd.</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label style={{ fontWeight: '600' }}>From <span style={{color: 'red'}}>*</span></Form.Label>
                                    <Form.Control 
                                        type="date" 
                                        value={generateData.fromDate}
                                        onChange={(e) => setGenerateData({...generateData, fromDate: e.target.value})}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label style={{ fontWeight: '600' }}>To <span style={{color: 'red'}}>*</span></Form.Label>
                                    <Form.Control 
                                        type="date" 
                                        value={generateData.toDate}
                                        onChange={(e) => setGenerateData({...generateData, toDate: e.target.value})}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label style={{ fontWeight: '600' }}>ESIC No.</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        placeholder="Enter ESIC number"
                                        value={generateData.esicNo}
                                        onChange={(e) => setGenerateData({...generateData, esicNo: e.target.value})}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label style={{ fontWeight: '600' }}>UAN NO.</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        placeholder="Enter UAN number"
                                        value={generateData.uanNo}
                                        onChange={(e) => setGenerateData({...generateData, uanNo: e.target.value})}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer style={{ justifyContent: 'center', gap: '10px', padding: '15px' }}>
                    <Button 
                        variant="success" 
                        onClick={handleGenerateCard}
                        style={{ minWidth: '120px' }}
                        disabled={loading}
                    >
                        {loading ? <Spinner animation="border" size="sm" /> : 'Generate'}
                    </Button>
                    <Button 
                        variant="danger" 
                        onClick={() => {
                            setShowGenerateModal(false);
                            setGenerateData({
                                employeeId: '',
                                employeeName: '',
                                projectName: '',
                                company: 'Surya Equipments Pvt. Lt.',
                                fromDate: '',
                                toDate: '',
                                esicNo: '',
                                uanNo: ''
                            });
                        }}
                        style={{ minWidth: '120px' }}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* View Uploaded Files Modal */}
            <Modal 
                show={showViewModal} 
                onHide={() => {
                    setShowViewModal(false);
                    setViewData({ url: '', type: '', title: '' });
                }} 
                centered 
                size="lg"
                backdrop="static"
            >
                <Modal.Header closeButton style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                    <Modal.Title>View Document - {viewData.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ 
                    padding: '0', 
                    maxHeight: '70vh', 
                    overflow: 'auto',
                    backgroundColor: '#f8f9fa'
                }}>
                    {viewData.type === 'image' ? (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <img 
                                src={viewData.url} 
                                alt={viewData.title}
                                style={{ 
                                    maxWidth: '100%', 
                                    maxHeight: '60vh',
                                    objectFit: 'contain',
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}
                            />
                        </div>
                    ) : (
                        <iframe
                            src={viewData.url}
                            style={{
                                width: '100%',
                                height: '70vh',
                                border: 'none'
                            }}
                            title={viewData.title}
                        />
                    )}
                </Modal.Body>
                <Modal.Footer style={{ justifyContent: 'center', padding: '15px' }}>
                    <Button 
                        variant="primary"
                        href={viewData.url}
                        target="_blank"
                        style={{ minWidth: '100px' }}
                    >
                        <i className="bi bi-download"></i> Download
                    </Button>
                    <Button 
                        variant="danger" 
                        onClick={() => {
                            setShowViewModal(false);
                            setViewData({ url: '', type: '', title: '' });
                        }}
                        style={{ minWidth: '100px' }}
                    >
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
            
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
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

export default EmployeeDocumentation;