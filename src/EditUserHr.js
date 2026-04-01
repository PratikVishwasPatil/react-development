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
import { Container, Button, Row, Col, Card, Modal, Form, Spinner, Badge } from 'react-bootstrap';
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

const EmployeeWagesManagement = () => {
    const [theme, setTheme] = useState('light');
    const [employeeData, setEmployeeData] = useState([]);
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [pageSize, setPageSize] = useState(20);
    
    // Modal states
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    
    const gridRef = useRef();

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // API URL
    const EMPLOYEE_WAGES_API = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Hr/getEmployeesWithWagesApi.php";

    // Fetch employee wages data
    const fetchEmployeeWages = async () => {
        setLoading(true);
        try {
            const response = await fetch(EMPLOYEE_WAGES_API);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            
            if (result.status && result.data) {
                setEmployeeData(result.data);
                toast.success(`Loaded ${result.count} employee records`);
            } else {
                throw new Error("No data received");
            }
        } catch (error) {
            console.error("Error fetching employee wages:", error);
            toast.error(`Error fetching employee wages: ${error.message}`);
            setEmployeeData([]);
        } finally {
            setLoading(false);
        }
    };

    // Load data on mount
    useEffect(() => {
        fetchEmployeeWages();
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

    // Editable Text Cell Renderer
    const EditableTextCell = (props) => {
        const [editMode, setEditMode] = useState(false);
        const [inputValue, setInputValue] = useState(props.value || '');

        useEffect(() => {
            setInputValue(props.value || '');
        }, [props.value]);

        const handleChange = (e) => {
            setInputValue(e.target.value);
        };

        const handleBlur = () => {
            props.node.setDataValue(props.colDef.field, inputValue);
            setEditMode(false);
        };

        const handleKeyPress = (e) => {
            if (e.key === 'Enter') {
                props.node.setDataValue(props.colDef.field, inputValue);
                setEditMode(false);
            }
        };

        if (editMode) {
            return (
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onKeyPress={handleKeyPress}
                    style={{
                        width: '100%',
                        height: '100%',
                        border: '1px solid #007bff',
                        borderRadius: '3px',
                        fontSize: '11px',
                        padding: '4px',
                        backgroundColor: '#fff'
                    }}
                    autoFocus
                />
            );
        }

        return (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    cursor: 'pointer',
                    padding: '4px',
                    fontSize: '11px'
                }}
                onClick={() => setEditMode(true)}
            >
                {inputValue || '-'}
            </div>
        );
    };

    // Editable Date Cell Renderer
    const EditableDateCell = (props) => {
        const [inputValue, setInputValue] = useState(props.value || '');

        useEffect(() => {
            setInputValue(props.value || '');
        }, [props.value]);

        const handleChange = (e) => {
            const newValue = e.target.value;
            setInputValue(newValue);
            props.node.setDataValue(props.colDef.field, newValue);
        };

        const formatDateForInput = (dateStr) => {
            if (!dateStr || dateStr === '01-01-1970') return '';
            if (dateStr.includes('-')) {
                const parts = dateStr.split('-');
                if (parts[0].length === 4) {
                    return dateStr;
                } else {
                    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                }
            }
            return '';
        };

        return (
            <input
                type="date"
                value={formatDateForInput(inputValue)}
                onChange={handleChange}
                style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    backgroundColor: 'transparent',
                    fontSize: '11px',
                    outline: 'none',
                    textAlign: 'center',
                    padding: '0'
                }}
            />
        );
    };

    // Department Badge Renderer
    const DepartmentBadgeRenderer = (props) => {
        const departments = props.value ? props.value.split(',') : [];
        
        if (departments.length === 0) return <span>-</span>;

        const colors = ['primary', 'success', 'info', 'warning', 'secondary'];

        return (
            <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                {departments.slice(0, 3).map((dept, index) => (
                    <Badge 
                        key={index}
                        bg={colors[index % colors.length]} 
                        style={{ fontSize: '9px', padding: '2px 6px' }}
                    >
                        {dept.trim()}
                    </Badge>
                ))}
                {departments.length > 3 && (
                    <Badge bg="secondary" style={{ fontSize: '9px', padding: '2px 6px' }}>
                        +{departments.length - 3}
                    </Badge>
                )}
            </div>
        );
    };

    // Status Badge Renderer
    const StatusBadgeRenderer = (props) => {
        const status = props.value;
        const config = status === '1' ? 
            { label: 'Active', bg: 'success' } : 
            { label: 'Inactive', bg: 'danger' };

        return (
            <Badge bg={config.bg} style={{ fontSize: '10px', padding: '4px 8px' }}>
                {config.label}
            </Badge>
        );
    };

    // Employee Type Badge Renderer
    const EmployeeTypeBadgeRenderer = (props) => {
        const type = props.value;
        const config = type === 'Own' ? 
            { bg: 'primary' } : 
            { bg: 'secondary' };

        return (
            <Badge bg={config.bg} style={{ fontSize: '10px', padding: '4px 8px' }}>
                {type || '-'}
            </Badge>
        );
    };

    // Wages Cell Renderer - Editable for each financial year
    const WagesCellRenderer = (props) => {
        const { value, colDef, data, node } = props;
        const [editMode, setEditMode] = useState(false);
        const [inputValue, setInputValue] = useState(value || '0');
        const year = colDef.headerName; // e.g., "2024-2025"

        useEffect(() => {
            setInputValue(value || '0');
        }, [value]);

        const handleChange = (e) => {
            setInputValue(e.target.value);
        };

        const handleBlur = () => {
            // Update the wages object
            const newWages = { ...data.wages };
            newWages[year] = inputValue;
            node.setDataValue('wages', newWages);
            setEditMode(false);
        };

        const handleKeyPress = (e) => {
            if (e.key === 'Enter') {
                const newWages = { ...data.wages };
                newWages[year] = inputValue;
                node.setDataValue('wages', newWages);
                setEditMode(false);
            }
        };

        if (editMode) {
            return (
                <input
                    type="number"
                    value={inputValue}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onKeyPress={handleKeyPress}
                    style={{
                        width: '100%',
                        height: '100%',
                        border: '1px solid #007bff',
                        borderRadius: '3px',
                        fontSize: '11px',
                        textAlign: 'right',
                        padding: '4px',
                        backgroundColor: '#fff'
                    }}
                    autoFocus
                />
            );
        }

        const displayValue = value || '0';
        const numValue = parseFloat(displayValue);
        const color = numValue > 0 ? '#28a745' : '#dc3545';

        return (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    cursor: 'pointer',
                    padding: '4px',
                    fontSize: '11px',
                    textAlign: 'right',
                    color: color,
                    fontWeight: numValue > 0 ? 'bold' : 'normal'
                }}
                onClick={() => setEditMode(true)}
            >
                {displayValue}
            </div>
        );
    };

    // Actions Renderer
    const ActionsRenderer = (props) => {
        const { data } = props;

        const handleViewDetails = () => {
            setSelectedEmployee(data);
            setShowDetailsModal(true);
        };

        const handleSave = async () => {
            try {
                // Prepare data for API
                const saveData = {
                    employeeId: data.employeeId,
                    emp_code: data.emp_code,
                    name: data.name,
                    shortname: data.shortname,
                    deptname: data.deptname,
                    father_name: data.father_name,
                    mobile: data.mobile,
                    alt_mobile: data.alt_mobile,
                    email: data.email,
                    address: data.address,
                    zip_code: data.zip_code,
                    pan: data.pan,
                    adhar: data.adhar,
                    employee_type: data.employee_type,
                    joining_date: data.joining_date,
                    gender: data.gender,
                    birth_date: data.birth_date,
                    blood_group: data.blood_group,
                    ESIC_NO: data.ESIC_NO,
                    UAN_NO: data.UAN_NO,
                    wages: data.wages
                };

                console.log('Saving employee data:', saveData);
                toast.success('Employee data saved successfully!');
                
                // Here you would make an API call to save the data
                // const response = await fetch('YOUR_SAVE_API_URL', {
                //     method: 'POST',
                //     headers: { 'Content-Type': 'application/json' },
                //     body: JSON.stringify(saveData)
                // });
                
            } catch (error) {
                console.error('Error saving data:', error);
                toast.error('Error saving employee data');
            }
        };

        return (
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center', height: '100%' }}>
                <button
                    onClick={handleViewDetails}
                    style={{
                        padding: '3px 8px',
                        fontSize: '10px',
                        backgroundColor: '#17a2b8',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer'
                    }}
                    title="View Details"
                >
                    <i className="bi bi-eye"></i>
                </button>
                <button
                    onClick={handleSave}
                    style={{
                        padding: '3px 8px',
                        fontSize: '10px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer'
                    }}
                    title="Save"
                >
                    <i className="bi bi-save"></i>
                </button>
            </div>
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
            headerName: "Emp ID",
            field: "employeeId",
            width: 80,
            pinned: 'left',
            lockPosition: true,
            checkboxSelection: true,
            headerCheckboxSelection: true,
            cellStyle: { fontWeight: 'bold', textAlign: 'center', backgroundColor: '#f0f8ff' }
        },
        {
            headerName: "Emp Code",
            field: "emp_code",
            width: 100,
            cellRenderer: EditableTextCell,
            cellStyle: { backgroundColor: '#fff9f0' }
        },
        {
            headerName: "Name",
            field: "name",
            width: 180,
            pinned: 'left',
            cellRenderer: EditableTextCell,
            cellStyle: { fontWeight: 'bold', backgroundColor: '#f0f8ff' }
        },
        {
            headerName: "Short Name",
            field: "shortname",
            width: 120,
            cellRenderer: EditableTextCell
        },
        {
            headerName: "Department Name",
            field: "deptname",
            width: 200,
            cellRenderer: DepartmentBadgeRenderer
        },
        {
            headerName: "Father's Name",
            field: "father_name",
            width: 150,
            cellRenderer: EditableTextCell
        },
        {
            headerName: "Mobile No",
            field: "mobile",
            width: 130,
            cellRenderer: EditableTextCell,
            cellStyle: { backgroundColor: '#fff9f0' }
        },
        {
            headerName: "Alternate Mobile No",
            field: "alt_mobile",
            width: 150,
            cellRenderer: EditableTextCell
        },
        {
            headerName: "Email",
            field: "email",
            width: 200,
            cellRenderer: EditableTextCell,
            cellStyle: { backgroundColor: '#f0fff0' }
        },
        {
            headerName: "Detailed Address",
            field: "address",
            width: 250,
            cellRenderer: EditableTextCell
        },
        {
            headerName: "Country_State_City_Id",
            field: "zip_code",
            width: 150,
            cellRenderer: EditableTextCell
        },
        {
            headerName: "Zip Code",
            field: "zip_code",
            width: 100,
            cellRenderer: EditableTextCell
        },
        {
            headerName: "Status",
            field: "status",
            width: 100,
            cellRenderer: StatusBadgeRenderer
        },
        {
            headerName: "Employee Type",
            field: "employee_type",
            width: 130,
            cellRenderer: EmployeeTypeBadgeRenderer
        },
        {
            headerName: "Joining Date",
            field: "joining_date",
            width: 130,
            cellRenderer: EditableDateCell,
            cellStyle: { textAlign: 'center' }
        },
        {
            headerName: "Gender",
            field: "gender",
            width: 80,
            cellRenderer: (props) => {
                const genderMap = { 'M': 'Male', 'F': 'Female', 'O': 'Other' };
                return genderMap[props.value] || props.value || '-';
            }
        },
        {
            headerName: "Birth Date",
            field: "birth_date",
            width: 130,
            cellRenderer: EditableDateCell,
            cellStyle: { textAlign: 'center' }
        },
        {
            headerName: "Blood Group",
            field: "blood_group",
            width: 110,
            cellRenderer: EditableTextCell
        },
        {
            headerName: "PAN",
            field: "pan",
            width: 130,
            cellRenderer: EditableTextCell,
            cellStyle: { backgroundColor: '#fff9f0' }
        },
        {
            headerName: "Aadhar",
            field: "adhar",
            width: 140,
            cellRenderer: EditableTextCell,
            cellStyle: { backgroundColor: '#fff9f0' }
        },
        {
            headerName: "ESIC No",
            field: "ESIC_NO",
            width: 140,
            cellRenderer: EditableTextCell
        },
        {
            headerName: "UAN No",
            field: "UAN_NO",
            width: 140,
            cellRenderer: EditableTextCell
        },
        // Wages columns for different financial years
        {
            headerName: "2018-2019",
            field: "wages.2018-2019",
            width: 100,
            cellRenderer: WagesCellRenderer,
            cellStyle: { backgroundColor: '#f0f8ff', textAlign: 'right' },
            valueGetter: (params) => params.data.wages?.['2018-2019'] || '0'
        },
        {
            headerName: "2019-2020",
            field: "wages.2019-2020",
            width: 100,
            cellRenderer: WagesCellRenderer,
            cellStyle: { backgroundColor: '#f0f8ff', textAlign: 'right' },
            valueGetter: (params) => params.data.wages?.['2019-2020'] || '0'
        },
        {
            headerName: "2020-2021",
            field: "wages.2020-2021",
            width: 100,
            cellRenderer: WagesCellRenderer,
            cellStyle: { backgroundColor: '#f0f8ff', textAlign: 'right' },
            valueGetter: (params) => params.data.wages?.['2020-2021'] || '0'
        },
        {
            headerName: "2021-2022",
            field: "wages.2021-2022",
            width: 100,
            cellRenderer: WagesCellRenderer,
            cellStyle: { backgroundColor: '#f0f8ff', textAlign: 'right' },
            valueGetter: (params) => params.data.wages?.['2021-2022'] || '0'
        },
        {
            headerName: "2022-2023",
            field: "wages.2022-2023",
            width: 100,
            cellRenderer: WagesCellRenderer,
            cellStyle: { backgroundColor: '#f0f8ff', textAlign: 'right' },
            valueGetter: (params) => params.data.wages?.['2022-2023'] || '0'
        },
        {
            headerName: "2023-2024",
            field: "wages.2023-2024",
            width: 100,
            cellRenderer: WagesCellRenderer,
            cellStyle: { backgroundColor: '#f0f8ff', textAlign: 'right' },
            valueGetter: (params) => params.data.wages?.['2023-2024'] || '0'
        },
        {
            headerName: "2024-2025",
            field: "wages.2024-2025",
            width: 100,
            cellRenderer: WagesCellRenderer,
            cellStyle: { backgroundColor: '#f0f8ff', textAlign: 'right' },
            valueGetter: (params) => params.data.wages?.['2024-2025'] || '0'
        },
        {
            headerName: "2025-2026",
            field: "wages.2025-2026",
            width: 100,
            cellRenderer: WagesCellRenderer,
            cellStyle: { backgroundColor: '#f0f8ff', textAlign: 'right' },
            valueGetter: (params) => params.data.wages?.['2025-2026'] || '0'
        },
        {
            headerName: "Actions",
            cellRenderer: ActionsRenderer,
            width: 100,
            suppressMenu: true,
            sortable: false,
            filter: false,
            pinned: 'right'
        }
    ], [isMobile]);

    const defaultColDef = useMemo(() => ({
        resizable: true,
        sortable: true,
        filter: true,
        floatingFilter: !isMobile,
        suppressMenu: isMobile,
        flex: isMobile ? 1 : 0,
        cellStyle: { textAlign: 'left', fontSize: '11px' }
    }), [isMobile]);

    const onGridReady = (params) => {
        console.log('Employee Wages Grid is ready');
    };

    const handleExportCSV = () => {
        if (gridRef.current && gridRef.current.api) {
            gridRef.current.api.exportDataAsCsv({
                fileName: `Employee_Wages_${new Date().toISOString().split('T')[0]}.csv`
            });
            toast.success('Data exported to CSV');
        }
    };

    const handleRefresh = () => {
        fetchEmployeeWages();
    };

    const handlePageSizeChange = (event) => {
        const newSize = parseInt(event.target.value);
        setPageSize(newSize);
    };

    const getGridHeight = () => {
        if (isFullScreen) {
            return isMobile ? 'calc(100vh - 200px)' : 'calc(100vh - 220px)';
        }
        return isMobile ? '400px' : '600px';
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
                    <p className="mt-3">Loading employee wages data...</p>
                </div>
            </div>
        );
    }

    const totalRecords = employeeData.length;
    const totalPages = Math.ceil(totalRecords / pageSize);

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
                                    Employee Wages Management
                                </h4>
                                <small style={{ color: '#666', fontSize: '0.8rem' }}>
                                    {`${totalRecords} employees`}
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
                                <h5>No employee wages data available</h5>
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
                                    paginationPageSize={pageSize}
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
                                    headerHeight={isMobile ? 35 : 40}
                                    rowHeight={isMobile ? 40 : 45}
                                    suppressMenuHide={isMobile}
                                    suppressContextMenu={isMobile}
                                />
                            </div>
                        )}
                    </Card.Body>

                    {/* Footer */}
                    <Card.Footer style={{
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
                            <Form.Select
                                size="sm"
                                style={{ width: '80px' }}
                                value={pageSize}
                                onChange={handlePageSizeChange}
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </Form.Select>
                        </div>
                        <div>
                            Showing 1 to {Math.min(pageSize, totalRecords)} of {totalRecords}
                        </div>
                        <div>
                            Page 1 of {totalPages}
                        </div>
                    </Card.Footer>
                </Card>
            </Container>

            {/* Employee Details Modal */}
            <Modal 
                show={showDetailsModal} 
                onHide={() => {
                    setShowDetailsModal(false);
                    setSelectedEmployee(null);
                }} 
                centered 
                backdrop="static"
                size="lg"
            >
                <Modal.Header closeButton style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                    <Modal.Title>Employee Details</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ padding: '20px', maxHeight: '70vh', overflowY: 'auto' }}>
                    {selectedEmployee && (
                        <div>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>Employee ID:</strong>
                                    <div style={{ fontSize: '1.1rem', color: '#007bff' }}>{selectedEmployee.employeeId}</div>
                                </Col>
                                <Col md={6}>
                                    <strong>Employee Code:</strong>
                                    <div style={{ fontSize: '1.1rem' }}>{selectedEmployee.emp_code || '-'}</div>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={12}>
                                    <strong>Name:</strong>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{selectedEmployee.name}</div>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>Father's Name:</strong>
                                    <div>{selectedEmployee.father_name || '-'}</div>
                                </Col>
                                <Col md={6}>
                                    <strong>Gender:</strong>
                                    <div>{selectedEmployee.gender === 'M' ? 'Male' : selectedEmployee.gender === 'F' ? 'Female' : 'Other'}</div>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>Mobile:</strong>
                                    <div>{selectedEmployee.mobile || '-'}</div>
                                </Col>
                                <Col md={6}>
                                    <strong>Email:</strong>
                                    <div>{selectedEmployee.email || '-'}</div>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={12}>
                                    <strong>Address:</strong>
                                    <div>{selectedEmployee.address || '-'}</div>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>PAN:</strong>
                                    <div>{selectedEmployee.pan || '-'}</div>
                                </Col>
                                <Col md={6}>
                                    <strong>Aadhar:</strong>
                                    <div>{selectedEmployee.adhar || '-'}</div>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>ESIC No:</strong>
                                    <div>{selectedEmployee.ESIC_NO || '-'}</div>
                                </Col>
                                <Col md={6}>
                                    <strong>UAN No:</strong>
                                    <div>{selectedEmployee.UAN_NO || '-'}</div>
                                </Col>
                            </Row>

                            <hr />

                            <h6 className="mb-3">Wages Information</h6>
                            <Row>
                                {selectedEmployee.wages && Object.entries(selectedEmployee.wages).map(([year, wage]) => (
                                    <Col md={6} key={year} className="mb-2">
                                        <strong>{year}:</strong>
                                        <span style={{ 
                                            marginLeft: '10px', 
                                            color: parseFloat(wage || 0) > 0 ? '#28a745' : '#dc3545',
                                            fontWeight: 'bold'
                                        }}>
                                            {wage || '0'}
                                        </span>
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer style={{ justifyContent: 'center', padding: '15px' }}>
                    <Button 
                        variant="secondary" 
                        onClick={() => {
                            setShowDetailsModal(false);
                            setSelectedEmployee(null);
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

export default EmployeeWagesManagement;