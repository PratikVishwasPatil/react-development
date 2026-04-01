import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from 'react-router-dom';
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
import { Container, Button, Row, Col, Card, Form, Table } from 'react-bootstrap';
import Select from 'react-select';
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

const RequiredMaterialComponent = () => {
    const { fileid } = useParams();
    console.log("file_id from URL 👉", fileid);

    const navigate = useNavigate();
    const [theme, setTheme] = useState('light');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [loading, setLoading] = useState(false);

    // Required Material States
    const [materialTypes, setMaterialTypes] = useState([]);
    const [selectedMaterialType, setSelectedMaterialType] = useState('');
    const [initials, setInitials] = useState([]);
    const [selectedInitial, setSelectedInitial] = useState('');
    const [requiredMaterials, setRequiredMaterials] = useState([]);
    const [loadingInitials, setLoadingInitials] = useState(false);
    const [loadingMaterialData, setLoadingMaterialData] = useState(false);

    // Received Material States
    const [receivedMaterials, setReceivedMaterials] = useState([]);
    const [totalQty, setTotalQty] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);

    const requiredGridRef = useRef();
    const receivedGridRef = useRef();

    // Custom Cell Renderer for Quantity Input
    const QuantityCellRenderer = (props) => {
        const [localValue, setLocalValue] = useState(props.value || '');

        // Update local value when props change
        useEffect(() => {
            setLocalValue(props.value || '');
        }, [props.value]);

        const handleChange = (e) => {
            const newValue = e.target.value;
            setLocalValue(newValue);

            // Update the data in parent component
            const updatedData = [...requiredMaterials];
            const rowIndex = updatedData.findIndex(item => item.srNo === props.data.srNo);
            if (rowIndex !== -1) {
                updatedData[rowIndex] = { ...props.data, reqQty: newValue };
                setRequiredMaterials(updatedData);

                // Safely update the grid data
                const rowNode = props.api.getRowNode(props.node.id);
                if (rowNode) {
                    rowNode.setData(updatedData[rowIndex]);
                }
            }
        };

        const handleBlur = () => {
            // Additional validation on blur if needed
            if (localValue && isNaN(parseFloat(localValue))) {
                setLocalValue('');
                toast.warning('Please enter a valid number for quantity');
            }
        };

        return (
            <input
                type="number"
                value={localValue}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter qty"
                style={{
                    width: '100%',
                    height: '32px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    textAlign: 'center',
                    fontSize: '13px',
                    backgroundColor: '#fff',
                    outline: 'none'
                }}
                step="0.01"
                min="0"
            />
        );
    };


    // Custom Cell Renderer for Comment Input
    const CommentCellRenderer = (props) => {
        const [localValue, setLocalValue] = useState(props.value || '');

        // Update local value when props change
        useEffect(() => {
            setLocalValue(props.value || '');
        }, [props.value]);

        const handleChange = (e) => {
            const newValue = e.target.value;
            setLocalValue(newValue);

            // Update the data in parent component
            const updatedData = [...requiredMaterials];
            const rowIndex = updatedData.findIndex(item => item.srNo === props.data.srNo);
            if (rowIndex !== -1) {
                updatedData[rowIndex] = { ...props.data, comment: newValue };
                setRequiredMaterials(updatedData);

                // Safely update the grid data
                const rowNode = props.api.getRowNode(props.node.id);
                if (rowNode) {
                    rowNode.setData(updatedData[rowIndex]);
                }
            }
        };

        return (
            <textarea
                value={localValue}
                onChange={handleChange}
                placeholder="Enter comment"
                maxLength={200}
                rows={2}
                style={{
                    width: '100%',
                    height: '40px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '12px',
                    backgroundColor: '#fff',
                    outline: 'none',
                    resize: 'none',
                    fontFamily: 'inherit'
                }}
            />
        );
    };

    // Handle window resize for mobile responsiveness
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Required Material Table Column Definitions with custom cell renderers
    const requiredColumnDefs = [
        {
            field: "srNo",
            headerName: "Sr.No.",
            width: 80,
            pinned: 'left',
            cellStyle: { backgroundColor: '#ff8533', color: '#fff', fontWeight: 'bold', textAlign: 'center' }
        },
        {
            field: "materialName",
            headerName: "Material Name",
            width: 300,
            cellStyle: { backgroundColor: '#ff8533', color: '#fff', fontWeight: 'bold' }
        },
        {
            field: "unit",
            headerName: "Unit",
            width: 100,
            cellStyle: { backgroundColor: '#ff8533', color: '#fff', fontWeight: 'bold', textAlign: 'center' }
        },
        {
            field: "reqQty",
            headerName: "Req. Qty",
            width: 120,
            cellRenderer: QuantityCellRenderer,
            cellStyle: {
                backgroundColor: '#f8f9ff',
                border: '1px solid #ccc',
                padding: '4px'
            }
        },
        {
            field: "comment",
            headerName: "Comment",
            width: 200,
            cellRenderer: CommentCellRenderer,
            cellStyle: {
                backgroundColor: '#f8f9ff',
                border: '1px solid #ccc',
                padding: '4px'
            }
        }
    ];

    // Received Material Column Definitions
    const receivedColumnDefs = [
        {
            field: "srn",
            headerName: "Srn",
            width: 60,
            cellStyle: { backgroundColor: '#ff8533', color: '#fff', fontWeight: 'bold', textAlign: 'center' }
        },
        {
            field: "materialDescription",
            headerName: "Material Description",
            width: 200,
            cellStyle: { backgroundColor: '#ff8533', color: '#fff', fontWeight: 'bold' }
        },
        {
            field: "unit",
            headerName: "Unit",
            width: 80,
            cellStyle: { backgroundColor: '#ff8533', color: '#fff', fontWeight: 'bold', textAlign: 'center' }
        },
        {
            field: "reqQty",
            headerName: "Req Qty",
            width: 90,
            cellStyle: { backgroundColor: '#ff8533', color: '#fff', fontWeight: 'bold', textAlign: 'center' }
        },
        {
            field: "comment",
            headerName: "Comment",
            width: 150,
            cellStyle: { backgroundColor: '#ff8533', color: '#fff', fontWeight: 'bold' }
        },
        {
            field: "reqBy",
            headerName: "Req. By",
            width: 100,
            cellStyle: { backgroundColor: '#ff8533', color: '#fff', fontWeight: 'bold' }
        },
        {
            field: "recdQty",
            headerName: "Recd. Qty",
            width: 90,
            cellStyle: { backgroundColor: '#ff8533', color: '#fff', fontWeight: 'bold', textAlign: 'center' }
        },
        {
            field: "rate",
            headerName: "Rate",
            width: 80,
            cellStyle: { backgroundColor: '#ff8533', color: '#fff', fontWeight: 'bold', textAlign: 'right' }
        },
        {
            field: "weight",
            headerName: "weight",
            width: 80,
            cellStyle: { backgroundColor: '#ff8533', color: '#fff', fontWeight: 'bold', textAlign: 'right' }
        },
        {
            field: "amount",
            headerName: "Amount",
            width: 100,
            cellStyle: { backgroundColor: '#ff8533', color: '#fff', fontWeight: 'bold', textAlign: 'right' }
        },
        {
            field: "assignedBy",
            headerName: "Assigned. By",
            width: 120,
            cellStyle: { backgroundColor: '#ff8533', color: '#fff', fontWeight: 'bold' }
        },
        {
            field: "reqNo",
            headerName: "Req. No",
            width: 100,
            cellStyle: { backgroundColor: '#ff8533', color: '#fff', fontWeight: 'bold', textAlign: 'center' }
        },
        {
            field: "assignedDate",
            headerName: "Assigned. Date",
            width: 130,
            cellStyle: { backgroundColor: '#ff8533', color: '#fff', fontWeight: 'bold', textAlign: 'center' }
        },
        {
            field: "action",
            headerName: "Action",
            width: 100,
            cellStyle: { backgroundColor: '#ff8533', color: '#fff', fontWeight: 'bold', textAlign: 'center' },
            cellRenderer: (params) => {
                return (
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteReceived(params.data)}
                    >
                        Delete
                    </Button>
                );
            }
        }
    ];

    const defaultColDef = {
        resizable: true,
        sortable: false,
        filter: false,
        suppressMenu: true
    };

    // Load initial data
    useEffect(() => {
        loadMaterialTypes();
        loadReceivedMaterials();
    }, []);

    // Load initials when material type changes
    useEffect(() => {
        if (selectedMaterialType) {
            loadInitials(selectedMaterialType);
        } else {
            setInitials([]);
            setSelectedInitial('');
            setRequiredMaterials([]);
        }
    }, [selectedMaterialType]);

    // Load material data when both material type and initial are selected
    useEffect(() => {
        if (selectedMaterialType && selectedInitial) {
            loadMaterialData();
        } else {
            setRequiredMaterials([]);
        }
    }, [selectedMaterialType, selectedInitial]);

    // Load material types from API
    const loadMaterialTypes = async () => {
        try {
            console.log('Loading material types...');
            const response = await fetch('https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/GetMaterialType.php');
            console.log('Response status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Material types data:', data);

            if (data.status === 'success' && data.materials) {
                const formattedTypes = data.materials.map(type => ({
                    value: type.main_material_type_id,
                    label: type.main_material_name
                }));

                formattedTypes.sort((a, b) => a.label.localeCompare(b.label));
                setMaterialTypes(formattedTypes);
                console.log('Material types loaded successfully:', formattedTypes.length);
            } else {
                console.warn('Invalid API response format:', data);
                setMaterialTypes([]);
            }
        } catch (error) {
            console.error('Error loading material types:', error);
            toast.error('Failed to load material types');
            const mockTypes = [
                { value: '1', label: 'Steel' },
                { value: '2', label: 'Concrete' },
                { value: '3', label: 'Wood' },
                { value: '4', label: 'Aluminum' }
            ];
            setMaterialTypes(mockTypes);
        }
    };

    // Load initials from API based on selected material type
    const loadInitials = async (materialId) => {
        try {
            setLoadingInitials(true);
            console.log('Loading initials for material ID:', materialId);

            const response = await fetch(`https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/GetInitial.php?material=${materialId}`);
            console.log('Initials API response status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Initials API response data:', data);

            if (data.status === 'success' && data.components && Array.isArray(data.components)) {
                const formattedInitials = data.components.map(component => ({
                    value: component.value,
                    label: component.label,
                    material_initial: component.material_initial,
                    main_material_type_id: component.main_material_type_id
                }));

                formattedInitials.sort((a, b) => a.label.localeCompare(b.label));
                setInitials(formattedInitials);
                console.log('Initials loaded successfully:', formattedInitials.length);
                toast.success(`${formattedInitials.length} material components loaded successfully`);
            } else {
                console.warn('Invalid initials API response format:', data);
                setInitials([]);
                toast.warning('No material components found for selected material type');
            }
        } catch (error) {
            console.error('Error loading initials:', error);
            toast.error('Failed to load material components for selected material type');
            const mockInitials = [
                { value: 'AB', label: 'AB - Admin' },
                { value: 'CD', label: 'CD - Manager' },
                { value: 'EF', label: 'EF - Supervisor' },
                { value: 'GH', label: 'GH - Engineer' },
                { value: 'IJ', label: 'IJ - Operator' }
            ];
            setInitials(mockInitials);
        } finally {
            setLoadingInitials(false);
        }
    };

    // Load material data from API
    const loadMaterialData = async () => {
        try {
            setLoadingMaterialData(true);
            const materialParam = selectedInitial;
            console.log('Loading material data for:', materialParam);

            const response = await fetch(`https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/GetMaterialDataForExchange.php?material=${encodeURIComponent(materialParam)}`);
            console.log('Material data API response status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Material data API response:', data);

            if (data.status === 'success' && data.data && Array.isArray(data.data)) {
                const formattedMaterials = data.data.map((material, index) => ({
                    srNo: material.count || index + 1,
                    materialName: material.material_description || `Material ${index + 1}`,
                    unit: material.unit || 'KG',
                    reqQty: '',
                    comment: '',
                    materialId: material.material_id,
                    rate: material.rate,
                    gst: material.gst,
                    hsn: material.hsn,
                    makeName: material.make_name
                }));

                setRequiredMaterials(formattedMaterials);
                console.log('Material data loaded successfully:', formattedMaterials.length);
                toast.success(`${formattedMaterials.length} materials loaded successfully`);
            } else if (data.status === 'success' && (!data.data || data.data.length === 0)) {
                setRequiredMaterials([]);
                toast.info('No materials found for selected combination');
            } else {
                console.warn('Invalid material data API response format:', data);
                setRequiredMaterials([]);
                toast.warning('Invalid response format from material data API');
            }
        } catch (error) {
            console.error('Error loading material data:', error);
            toast.error('Failed to load material data');

            const mockMaterials = [
                { srNo: 1, materialName: 'DSB 205 R1', unit: 'KG', reqQty: '', comment: '', materialId: 1 },
                { srNo: 2, materialName: 'DSB 205 R2', unit: 'KG', reqQty: '', comment: '', materialId: 2 },
                { srNo: 3, materialName: 'DSB 205 R3', unit: 'KG', reqQty: '', comment: '', materialId: 3 },
                { srNo: 4, materialName: 'DSB 206 R1', unit: 'KG', reqQty: '', comment: '', materialId: 4 },
                { srNo: 5, materialName: 'DSB 206 R2', unit: 'KG', reqQty: '', comment: '', materialId: 5 },
                { srNo: 6, materialName: 'DSB 206 R3', unit: 'KG', reqQty: '', comment: '', materialId: 6 },
                { srNo: 7, materialName: 'DSB 207 R1', unit: 'KG', reqQty: '', comment: '', materialId: 7 },
                { srNo: 8, materialName: 'DSB 207 R2', unit: 'KG', reqQty: '', comment: '', materialId: 8 },
                { srNo: 9, materialName: 'DSB 207 R3', unit: 'KG', reqQty: '', comment: '', materialId: 9 },
                { srNo: 10, materialName: 'DSB 209 R1', unit: 'KG', reqQty: '', comment: '', materialId: 10 },
                { srNo: 11, materialName: 'DSB 209 R2', unit: 'KG', reqQty: '', comment: '', materialId: 11 },
                { srNo: 12, materialName: 'DSB 209 R3', unit: 'KG', reqQty: '', comment: '', materialId: 12 },
                { srNo: 13, materialName: 'DSB 211 R1', unit: 'KG', reqQty: '', comment: '', materialId: 13 },
                { srNo: 14, materialName: 'DSB 211 R2', unit: 'KG', reqQty: '', comment: '', materialId: 14 }
            ];
            setRequiredMaterials(mockMaterials);
        } finally {
            setLoadingMaterialData(false);
        }
    };

    const loadReceivedMaterials = () => {
        setReceivedMaterials([]);
        setTotalQty(0);
        setTotalAmount(0);
    };

    // Handle material type change
    const handleMaterialTypeChange = (selectedOption) => {
        const materialId = selectedOption ? selectedOption.value : '';
        setSelectedMaterialType(materialId);

        setSelectedInitial('');
        setRequiredMaterials([]);

        if (materialId) {
            toast.info('Loading material components for selected type...');
        }
    };

    // Handle initial change
    const handleInitialChange = (selectedOption) => {
        const initialValue = selectedOption ? selectedOption.value : '';
        setSelectedInitial(initialValue);

        setRequiredMaterials([]);

        if (selectedMaterialType && initialValue) {
            toast.info('Loading material data...');
        }
    };

    // Handle send to requisition
    const handleSendToRequisition = async () => {
        if (requiredMaterials.length === 0) {
            toast.error('Please add at least one required material');
            return;
        }

        if (!selectedMaterialType || !selectedInitial) {
            toast.error('Please select Material Type and Initial');
            return;
        }

        const materialsWithQty = requiredMaterials.filter(row =>
            row.reqQty && parseFloat(row.reqQty) > 0
        );

        if (materialsWithQty.length === 0) {
            toast.error('Please enter required quantity for at least one material');
            return;
        }

        setLoading(true);

        try {
            const dataToSend = {
                file_id: fileid,
                employee_id: 1,
                materials: materialsWithQty.map(material => ({
                    material_id: material.materialId,
                    material_name: material.materialName,
                    unit: material.unit,
                    req_qty: parseFloat(material.reqQty),
                    comment: material.comment || '',
                    rate: material.rate || 0,
                    gst: material.gst || 0,
                    hsn: material.hsn || ''
                }))
            };
            console.log('Sending data to requisition:', dataToSend);

            const response = await fetch('https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/saveMaterialRequisition.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend)
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('API response:', result);

            if (result.status === 'success') {
                toast.success(`Successfully sent ${result.data.inserted_count} materials to requisition!`);

                const clearedMaterials = requiredMaterials.map(material => ({
                    ...material,
                    reqQty: '',
                    comment: ''
                }));
                setRequiredMaterials(clearedMaterials);

            } else if (result.status === 'partial_success') {
                toast.warning(`Partially successful: ${result.message}`);
                console.warn('Partial success errors:', result.data.errors);

                const clearedMaterials = requiredMaterials.map(material => ({
                    ...material,
                    reqQty: '',
                    comment: ''
                }));
                setRequiredMaterials(clearedMaterials);

            } else {
                throw new Error(result.message || 'Failed to save requisition data');
            }

        } catch (error) {
            console.error('Error sending to requisition:', error);

            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                toast.error('Network error: Unable to connect to server');
            } else if (error.message.includes('HTTP error')) {
                toast.error(`Server error: ${error.message}`);
            } else {
                toast.error(`Error: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle delete received material
    const handleDeleteReceived = (rowData) => {
        const updatedData = receivedMaterials.filter(item => item.srn !== rowData.srn);
        setReceivedMaterials(updatedData);
        toast.success('Material removed successfully');
    };

    // Handle print
    const handlePrint = () => {
        window.print();
    };

    // Get selected material type name for display
    const getSelectedMaterialTypeName = () => {
        const selectedType = materialTypes.find(type => type.value === selectedMaterialType);
        return selectedType ? selectedType.label : '';
    };

    // Custom styles for React Select - Material Type
    const materialTypeSelectStyles = {
        control: (provided, state) => ({
            ...provided,
            borderColor: selectedMaterialType ? '#28a745' : (theme === 'dark' ? '#495057' : '#ced4da'),
            backgroundColor: theme === 'dark' ? '#343a40' : '#ffffff',
            color: theme === 'dark' ? '#ffffff' : '#000000',
            minHeight: '38px',
            boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(40, 167, 69, 0.25)' : 'none',
            '&:hover': {
                borderColor: selectedMaterialType ? '#28a745' : '#80bdff'
            }
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: theme === 'dark' ? '#343a40' : '#ffffff',
            zIndex: 9999
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? '#ff8533'
                : state.isFocused
                    ? (theme === 'dark' ? '#495057' : '#f8f9fa')
                    : 'transparent',
            color: state.isSelected
                ? '#ffffff'
                : (theme === 'dark' ? '#ffffff' : '#000000'),
            '&:hover': {
                backgroundColor: state.isSelected ? '#ff8533' : (theme === 'dark' ? '#495057' : '#f8f9fa')
            }
        }),
        singleValue: (provided) => ({
            ...provided,
            color: theme === 'dark' ? '#ffffff' : '#000000'
        }),
        placeholder: (provided) => ({
            ...provided,
            color: theme === 'dark' ? '#adb5bd' : '#6c757d'
        }),
        input: (provided) => ({
            ...provided,
            color: theme === 'dark' ? '#ffffff' : '#000000'
        })
    };

    // Custom styles for React Select - Initial
    const initialSelectStyles = {
        control: (provided, state) => ({
            ...provided,
            borderColor: selectedInitial ? '#28a745' : (theme === 'dark' ? '#495057' : '#ced4da'),
            backgroundColor: theme === 'dark' ? '#343a40' : '#ffffff',
            color: theme === 'dark' ? '#ffffff' : '#000000',
            minHeight: '38px',
            boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(40, 167, 69, 0.25)' : 'none',
            '&:hover': {
                borderColor: selectedInitial ? '#28a745' : '#80bdff'
            },
            opacity: loadingInitials ? 0.6 : 1
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: theme === 'dark' ? '#343a40' : '#ffffff',
            zIndex: 9999
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? '#ff8533'
                : state.isFocused
                    ? (theme === 'dark' ? '#495057' : '#f8f9fa')
                    : 'transparent',
            color: state.isSelected
                ? '#ffffff'
                : (theme === 'dark' ? '#ffffff' : '#000000'),
            '&:hover': {
                backgroundColor: state.isSelected ? '#ff8533' : (theme === 'dark' ? '#495057' : '#f8f9fa')
            }
        }),
        singleValue: (provided) => ({
            ...provided,
            color: theme === 'dark' ? '#ffffff' : '#000000'
        }),
        placeholder: (provided) => ({
            ...provided,
            color: theme === 'dark' ? '#adb5bd' : '#6c757d'
        }),
        input: (provided) => ({
            ...provided,
            color: theme === 'dark' ? '#ffffff' : '#000000'
        })
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

    return (
        <div style={{
            minHeight: '100vh',
            background: themeStyles.backgroundColor,
            color: themeStyles.color,
            padding: '20px'
        }}>
            <Container fluid>
                {/* Header */}
                <Row className="mb-3">
                    <Col>
                        <div className="d-flex justify-content-between align-items-center">
                            <h3>Material Management - File ID: {fileid}</h3>
                            <div className="d-flex align-items-center gap-2">
                                {selectedMaterialType && (
                                    <span className="badge bg-info">
                                        Selected: {getSelectedMaterialTypeName()}
                                    </span>
                                )}
                                <Button
                                    variant="outline-light"
                                    onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                                >
                                    {theme === 'light' ? '🌙' : '☀️'}
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>

                {/* Required Material Section */}
                <Card style={{
                    backgroundColor: themeStyles.cardBg,
                    color: themeStyles.color,
                    border: theme === 'dark' ? '1px solid #495057' : '1px solid #dee2e6',
                    marginBottom: '20px'
                }}>
                    <Card.Header style={{
                        background: themeStyles.cardHeader,
                        color: theme === 'dark' ? '#ffffff' : '#000000',
                        fontWeight: 'bold'
                    }}>
                        <Row className="align-items-center">
                            <Col md={8}>
                                <h5 className="mb-0">REQUIRED MATERIAL</h5>
                            </Col>
                            <Col md={4} className="text-end">
                                <span>File Name : SM-25-057-LUA</span>
                            </Col>
                        </Row>
                    </Card.Header>

                    <Card.Body>
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label style={{ color: '#ff8533', fontWeight: 'bold' }}>
                                        Select Material Type
                                        {materialTypes.length > 0 && (
                                            <span className="ms-2 text-success">({materialTypes.length} types available)</span>
                                        )}
                                    </Form.Label>
                                    <Select
                                        value={materialTypes.find(type => type.value === selectedMaterialType) || null}
                                        onChange={handleMaterialTypeChange}
                                        options={materialTypes}
                                        styles={materialTypeSelectStyles}
                                        placeholder="Search and select material type..."
                                        isClearable
                                        isSearchable
                                        noOptionsMessage={() => "No material types found"}
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label style={{ color: '#ff8533', fontWeight: 'bold' }}>
                                        Select Material Component
                                        {loadingInitials && (
                                            <span className="ms-2 text-info">
                                                <i className="bi bi-arrow-clockwise"></i> Loading...
                                            </span>
                                        )}
                                        {initials.length > 0 && !loadingInitials && (
                                            <span className="ms-2 text-success">({initials.length} components available)</span>
                                        )}
                                    </Form.Label>
                                    <Select
                                        value={initials.find(initial => initial.value === selectedInitial) || null}
                                        onChange={handleInitialChange}
                                        options={initials}
                                        styles={initialSelectStyles}
                                        placeholder={
                                            loadingInitials
                                                ? "Loading components..."
                                                : !selectedMaterialType
                                                    ? "Select material type first..."
                                                    : initials.length === 0
                                                        ? "No components available"
                                                        : "Search and select component..."
                                        }
                                        isClearable
                                        isSearchable
                                        isDisabled={loadingInitials || !selectedMaterialType}
                                        noOptionsMessage={() =>
                                            !selectedMaterialType
                                                ? "Select a material type first"
                                                : "No components found for selected material type"
                                        }
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Loading indicator for material data */}
                        {loadingMaterialData && (
                            <Row className="mb-3">
                                <Col className="text-center">
                                    <div className="text-info">
                                        <i className="bi bi-arrow-clockwise"></i> Loading material data...
                                    </div>
                                </Col>
                            </Row>
                        )}

                        {/* Instructions for users */}
                        {requiredMaterials.length > 0 && (
                            <Row className="mb-3">
                                <Col>
                                    <div className="alert alert-info">
                                        <i className="bi bi-info-circle"></i>
                                        <strong> Instructions:</strong> Enter quantity and comments directly in the input fields below. All fields are editable.
                                    </div>
                                </Col>
                            </Row>
                        )}

                        <div
                            className="ag-theme-alpine"
                            style={{
                                height: '350px',
                                width: "100%",
                                marginBottom: '20px'
                            }}
                        >
                            <AgGridReact
                                ref={requiredGridRef}
                                rowData={requiredMaterials}
                                columnDefs={requiredColumnDefs}
                                defaultColDef={defaultColDef}
                                suppressHorizontalScroll={false}
                                headerHeight={40}
                                rowHeight={45}
                                suppressCellFocus={false}
                            />
                        </div>

                        <Row>
                            <Col className="text-center">
                                <Button
                                    variant="primary"
                                    onClick={handleSendToRequisition}
                                    disabled={loading || loadingInitials || requiredMaterials.length === 0}
                                    style={{ backgroundColor: '#ff8533', borderColor: '#ff8533' }}
                                    size="lg"
                                >
                                    {loading ? (
                                        <>
                                            <i className="bi bi-arrow-clockwise"></i> Sending...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-send"></i> Send To Requisition
                                        </>
                                    )}
                                </Button>
                            </Col>
                        </Row>

                        {/* Summary of materials with quantities */}
                        {requiredMaterials.length > 0 && (
                            <Row className="mt-3">
                                <Col>
                                    <div className="text-muted small">
                                        Materials loaded: {requiredMaterials.length} |
                                        With quantities: {requiredMaterials.filter(m => m.reqQty && parseFloat(m.reqQty) > 0).length}
                                    </div>
                                </Col>
                            </Row>
                        )}
                    </Card.Body>
                </Card>

                {/* Received Material Section */}
                <Card style={{
                    backgroundColor: themeStyles.cardBg,
                    color: themeStyles.color,
                    border: theme === 'dark' ? '1px solid #495057' : '1px solid #dee2e6'
                }}>
                    <Card.Header style={{
                        background: themeStyles.cardHeader,
                        color: theme === 'dark' ? '#ffffff' : '#000000',
                        fontWeight: 'bold'
                    }}>
                        <Row className="align-items-center">
                            <Col md={8}>
                                <h5 className="mb-0">RECEIVED MATERIAL</h5>
                            </Col>
                            <Col md={4} className="text-end">
                                <Button variant="warning" onClick={handlePrint}>
                                    <i className="bi bi-printer"></i> Print
                                </Button>
                            </Col>
                        </Row>
                    </Card.Header>

                    <Card.Body>
                        <div
                            className="ag-theme-alpine"
                            style={{
                                height: '300px',
                                width: "100%",
                                marginBottom: '20px'
                            }}
                        >
                            <AgGridReact
                                ref={receivedGridRef}
                                rowData={receivedMaterials}
                                columnDefs={receivedColumnDefs}
                                defaultColDef={defaultColDef}
                                suppressHorizontalScroll={false}
                                headerHeight={40}
                                rowHeight={35}
                            />
                        </div>

                        <Row>
                            <Col className="text-end">
                                <Table responsive size="sm" style={{ maxWidth: '300px', marginLeft: 'auto' }}>
                                    <tbody>
                                        <tr>
                                            <td><strong>Total Qty:</strong></td>
                                            <td><strong>{totalQty}</strong></td>
                                        </tr>
                                        <tr>
                                            <td><strong>Total Amount:</strong></td>
                                            <td><strong>{totalAmount}</strong></td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </Container>

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

export default RequiredMaterialComponent;