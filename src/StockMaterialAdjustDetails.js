import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Form, Button, Table, Badge, Nav, Spinner, Alert } from 'react-bootstrap';
import Select from 'react-select';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const MaterialAdjustToStock = () => {
    const [theme, setTheme] = useState('light');
    const [activeTab, setActiveTab] = useState('adjust-to-stock');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fileId, setFileId] = useState('');
    
    // API data states
    const [materialOptions, setMaterialOptions] = useState([]);
    const [unitOptions, setUnitOptions] = useState([]);
    const [loadingOptions, setLoadingOptions] = useState(true);
    
    // Material rows state
    const [materialRows, setMaterialRows] = useState([]);
    // Track which rows are expanded
    const [expandedRows, setExpandedRows] = useState({});

    // Fetch material and unit options from API
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                setLoadingOptions(true);
                
                // Fetch material options
                const materialResponse = await fetch(
                    'https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/MaterialListApi.php'
                );
                const materialData = await materialResponse.json();
                
                if (materialData.status === 'success') {
                    setMaterialOptions(materialData.data);
                }
                
                // Fetch unit options
                const unitResponse = await fetch(
                    'https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/UnitListApi.php'
                );
                const unitData = await unitResponse.json();
                
                if (unitData.status === 'success') {
                    setUnitOptions(unitData.data);
                }
                
                setLoadingOptions(false);
            } catch (err) {
                console.error('Error fetching options:', err);
                toast.error('Failed to load material/unit options');
                setLoadingOptions(false);
            }
        };
        
        fetchOptions();
    }, []);

    // Get file_id from URL and fetch data
    useEffect(() => {
        // Extract file_id from hash route like: /#/ppc/stock-material-adjust/5561
        const hash = window.location.hash;
        const pathParts = hash.split('/');
        const fileIdFromUrl = pathParts[pathParts.length - 1] || '5563'; // Get last segment
        
        console.log('Full hash:', hash);
        console.log('Extracted file ID:', fileIdFromUrl);
        
        setFileId(fileIdFromUrl);
        fetchMaterialData(fileIdFromUrl);
    }, []);

    const fetchMaterialData = async (fileId) => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch(
                `http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/StockMaterialAdjustDetailsApi.php?file_id=${fileId}`
            );
            
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            
            const data = await response.json();
            
            if (data.status === 'success' && data.records) {
                // Transform API data to component state format
                const transformedRows = data.records.map((record, index) => ({
                    id: record.row_number || index + 1,
                    srNo: index + 1,
                    materialId: record.material_id,
                    materialDescription: record.material_name,
                    unit: record.unit,
                    qty: record.required_qty,
                    assignedQty: record.assigned_qty,
                    remainingQty: record.remaining_qty,
                    subMaterials: [] // Initialize with empty sub-materials
                }));
                
                setMaterialRows(transformedRows);
                // Initialize all rows as collapsed
                const initialExpandedState = {};
                transformedRows.forEach(row => {
                    initialExpandedState[row.id] = false;
                });
                setExpandedRows(initialExpandedState);
                
                toast.success('Material data loaded successfully!');
            } else {
                throw new Error('Invalid data format');
            }
        } catch (err) {
            setError(err.message);
            toast.error('Failed to load material data');
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    // Toggle row expansion - when clicked, add initial sub-materials if empty
    const toggleRowExpansion = (rowId) => {
        setExpandedRows(prev => ({
            ...prev,
            [rowId]: !prev[rowId]
        }));
        
        // If expanding and no sub-materials exist, add initial ones
        if (!expandedRows[rowId]) {
            setMaterialRows(materialRows.map(row => {
                if (row.id === rowId && row.subMaterials.length === 0) {
                    return {
                        ...row,
                        subMaterials: [
                            { 
                                id: `sub${rowId}-1`, 
                                materialName: null, 
                                unit: unitOptions.length > 0 ? unitOptions[0] : { value: 'METERS', label: 'METERS' }, 
                                stockQty: '', 
                                purchaseQty: '', 
                                finalQty: '', 
                                leftOverMaterial: null, 
                                leftoverQty: '', 
                                comment: '' 
                            },
                            { 
                                id: `sub${rowId}-2`, 
                                materialName: null, 
                                unit: unitOptions.length > 0 ? unitOptions[0] : { value: 'METERS', label: 'METERS' }, 
                                stockQty: '', 
                                purchaseQty: '', 
                                finalQty: '', 
                                leftOverMaterial: null, 
                                leftoverQty: '', 
                                comment: '' 
                            }
                        ]
                    };
                }
                return row;
            }));
        }
    };

    const addSubMaterial = (rowId) => {
        setMaterialRows(materialRows.map(row => {
            if (row.id === rowId) {
                return {
                    ...row,
                    subMaterials: [
                        ...row.subMaterials,
                        { 
                            id: `sub${rowId}-${Date.now()}`, 
                            materialName: null, 
                            unit: unitOptions.length > 0 ? unitOptions[0] : { value: 'METERS', label: 'METERS' }, 
                            stockQty: '', 
                            purchaseQty: '', 
                            finalQty: '', 
                            leftOverMaterial: null, 
                            leftoverQty: '', 
                            comment: '' 
                        }
                    ]
                };
            }
            return row;
        }));
        toast.success('Sub-material row added');
    };

    const removeSubMaterial = (rowId, subId) => {
        setMaterialRows(materialRows.map(row => {
            if (row.id === rowId) {
                return {
                    ...row,
                    subMaterials: row.subMaterials.filter(sub => sub.id !== subId)
                };
            }
            return row;
        }));
        toast.info('Sub-material row removed');
    };

    const handleSubMaterialChange = (rowId, subId, field, value) => {
        setMaterialRows(materialRows.map(row => {
            if (row.id === rowId) {
                return {
                    ...row,
                    subMaterials: row.subMaterials.map(sub => {
                        if (sub.id === subId) {
                            return { ...sub, [field]: value };
                        }
                        return sub;
                    })
                };
            }
            return row;
        }));
    };

    const handleAdjustMaterial = async () => {
        // Validate that at least one row has sub-materials
        const rowsWithSubMaterials = materialRows.filter(row => 
            row.subMaterials && row.subMaterials.length > 0
        );

        if (rowsWithSubMaterials.length === 0) {
            toast.error('Please add at least one sub-material to adjust');
            return;
        }

        // Validate all sub-materials have required fields
        let hasErrors = false;
        rowsWithSubMaterials.forEach(row => {
            row.subMaterials.forEach(sub => {
                if (!sub.materialName || !sub.unit || !sub.purchaseQty) {
                    hasErrors = true;
                }
            });
        });

        if (hasErrors) {
            toast.error('Please fill in Material Name, Unit, and Purchase Qty for all sub-materials');
            return;
        }

        setLoading(true);

        try {
            // Prepare form data
            const formData = new FormData();
            formData.append('AdjustMaterial', '1');
            formData.append('file_id', fileId);
            formData.append('employee_id', '1'); // You may want to get this from user session

            // Prepare arrays for all fields
            const alertName1 = [];
            const shippingCountry1 = [];
            const unitData = [];
            const stockQty = [];
            const PurQty = [];
            const rowCount = [];
            const leftoverQty = [];
            const leftovermaterial = [];
            const comment = [];

            // Build arrays from expanded rows with sub-materials
            rowsWithSubMaterials.forEach(row => {
                row.subMaterials.forEach(sub => {
                    alertName1.push(row.materialId || ''); // Main material ID
                    shippingCountry1.push(row.materialId || ''); // New material ID
                    unitData.push(sub.unit?.value || '');
                    stockQty.push(sub.stockQty || '0');
                    PurQty.push(sub.purchaseQty || '0');
                    rowCount.push(row.id);
                    leftoverQty.push(sub.leftoverQty || '0');
                    leftovermaterial.push(sub.leftOverMaterial?.value || '');
                    comment.push(sub.comment || '');
                });
            });

            // Append arrays to formData
            alertName1.forEach(val => formData.append('alertName1[]', val));
            shippingCountry1.forEach(val => formData.append('shippingCountry1[]', val));
            unitData.forEach(val => formData.append('unitData[]', val));
            stockQty.forEach(val => formData.append('stockQty[]', val));
            PurQty.forEach(val => formData.append('PurQty[]', val));
            rowCount.forEach(val => formData.append('rowCount[]', val));
            leftoverQty.forEach(val => formData.append('leftoverQty[]', val));
            leftovermaterial.forEach(val => formData.append('leftovermaterial[]', val));
            comment.forEach(val => formData.append('comment[]', val));

            // Submit to API
            const response = await fetch(
                'https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/AddStockMaterialAdjustApi.php',
                {
                    method: 'POST',
                    body: formData
                }
            );

            const result = await response.json();

            if (result.status === 'success') {
                toast.success(result.message || 'Material adjustment submitted successfully!');
                // Optionally refresh the data
                setTimeout(() => {
                    fetchMaterialData(fileId);
                }, 1500);
            } else {
                toast.error(result.message || 'Failed to adjust material');
            }
        } catch (error) {
            console.error('Error submitting material adjustment:', error);
            toast.error('An error occurred while submitting the adjustment');
        } finally {
            setLoading(false);
        }
    };

    // Theme styles
    const getThemeStyles = () => {
        if (theme === 'dark') {
            return {
                backgroundColor: '#1a1d23',
                color: '#e8eaed',
                cardBg: '#2d3139',
                cardBorder: '#404752',
                inputBg: '#383d47',
                inputBorder: '#4a5160',
                inputColor: '#e8eaed',
                tableBg: '#2d3139',
                tableHeaderBg: '#383d47',
                tableRowBg: '#323842',
                tabActiveBg: '#4a5160',
                tabInactiveBg: '#383d47'
            };
        }
        return {
            backgroundColor: '#f5f7fa',
            color: '#2c3e50',
            cardBg: '#ffffff',
            cardBorder: '#e1e8ed',
            inputBg: '#ffffff',
            inputBorder: '#cbd5e0',
            inputColor: '#2c3e50',
            tableBg: '#ffffff',
            tableHeaderBg: '#ff6b35',
            tableRowBg: '#f8f9fa',
            tabActiveBg: '#28a745',
            tabInactiveBg: '#e9ecef'
        };
    };

    const themeStyles = getThemeStyles();

    // Custom styles for React Select
    const getSelectStyles = (isUnit = false) => ({
        control: (base, state) => ({
            ...base,
            backgroundColor: themeStyles.inputBg,
            borderColor: state.isFocused ? '#667eea' : themeStyles.inputBorder,
            borderRadius: '6px',
            minHeight: '38px',
            boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(102, 126, 234, 0.25)' : 'none',
            '&:hover': {
                borderColor: '#667eea'
            }
        }),
        singleValue: (base) => ({
            ...base,
            color: isUnit ? '#ff6b35' : themeStyles.inputColor,
            fontWeight: isUnit ? '600' : 'normal'
        }),
        placeholder: (base) => ({
            ...base,
            color: '#ff6b35',
            fontWeight: '500'
        }),
        menu: (base) => ({
            ...base,
            backgroundColor: themeStyles.inputBg,
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 9999
        }),
        menuList: (base) => ({
            ...base,
            padding: '4px',
            maxHeight: '200px'
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected 
                ? '#667eea' 
                : state.isFocused 
                ? theme === 'dark' ? '#4a5160' : '#f0f0f0'
                : 'transparent',
            color: state.isSelected 
                ? '#ffffff' 
                : themeStyles.inputColor,
            cursor: 'pointer',
            padding: '10px 12px',
            borderRadius: '4px',
            margin: '2px 0',
            '&:active': {
                backgroundColor: '#667eea'
            }
        }),
        input: (base) => ({
            ...base,
            color: themeStyles.inputColor
        }),
        dropdownIndicator: (base) => ({
            ...base,
            color: themeStyles.inputColor,
            '&:hover': {
                color: '#667eea'
            }
        }),
        clearIndicator: (base) => ({
            ...base,
            color: themeStyles.inputColor,
            '&:hover': {
                color: '#dc3545'
            }
        })
    });

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: themeStyles.backgroundColor,
            padding: '20px 0'
        }}>
            <Container fluid>
                {/* Header Card */}
                <Card style={{
                    backgroundColor: themeStyles.cardBg,
                    border: `1px solid ${themeStyles.cardBorder}`,
                    borderRadius: '12px',
                    boxShadow: theme === 'dark' 
                        ? '0 4px 20px rgba(0,0,0,0.4)' 
                        : '0 4px 20px rgba(0,0,0,0.08)',
                    marginBottom: '20px'
                }}>
                    <Card.Header style={{
                        background: theme === 'dark' 
                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: '#ffffff',
                        borderRadius: '12px 12px 0 0',
                        padding: '20px 30px',
                        border: 'none'
                    }}>
                        <Row className="align-items-center">
                            <Col xs={12} lg={8}>
                                <h3 className="mb-0" style={{ fontWeight: '600', fontSize: '1.75rem' }}>
                                    <i className="bi bi-box-seam me-3"></i>
                                    Material Adjustment Dashboard
                                </h3>
                                <small style={{ opacity: 0.9, fontSize: '0.95rem' }}>
                                    Manage and adjust material stock efficiently
                                </small>
                            </Col>
                            <Col xs={12} lg={4} className="text-lg-end mt-3 mt-lg-0">
                                <Button
                                    variant="light"
                                    size="sm"
                                    onClick={toggleTheme}
                                    style={{
                                        borderRadius: '20px',
                                        padding: '8px 20px',
                                        fontWeight: '500'
                                    }}
                                >
                                    {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
                                </Button>
                            </Col>
                        </Row>
                    </Card.Header>

                    {/* Tabs Navigation */}
                    <div style={{
                        padding: '20px 30px 0',
                        backgroundColor: themeStyles.cardBg,
                        borderBottom: `2px solid ${themeStyles.cardBorder}`
                    }}>
                        <Nav variant="pills" style={{ gap: '10px' }}>
                            <Nav.Item>
                                <Nav.Link
                                    active={activeTab === 'adjust-to-stock'}
                                    onClick={() => setActiveTab('adjust-to-stock')}
                                    style={{
                                        backgroundColor: activeTab === 'adjust-to-stock' 
                                            ? themeStyles.tableHeaderBg 
                                            : themeStyles.tabInactiveBg,
                                        color: activeTab === 'adjust-to-stock' ? '#fff' : themeStyles.color,
                                        borderRadius: '10px 10px 0 0',
                                        fontWeight: '500',
                                        padding: '12px 24px',
                                        border: 'none',
                                        position: 'relative'
                                    }}
                                >
                                    <Badge 
                                        bg="secondary" 
                                        pill 
                                        style={{ 
                                            position: 'absolute', 
                                            top: '5px', 
                                            right: '5px',
                                            backgroundColor: '#6c757d'
                                        }}
                                    >
                                        Active
                                    </Badge>
                                    Material Adjust to Stock
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link
                                    active={activeTab === 'approval-project'}
                                    onClick={() => setActiveTab('approval-project')}
                                    style={{
                                        backgroundColor: activeTab === 'approval-project' 
                                            ? '#ffc107' 
                                            : themeStyles.tabInactiveBg,
                                        color: activeTab === 'approval-project' ? '#000' : themeStyles.color,
                                        borderRadius: '10px 10px 0 0',
                                        fontWeight: '500',
                                        padding: '12px 24px',
                                        border: 'none',
                                        position: 'relative'
                                    }}
                                >
                                    <Badge 
                                        bg="warning" 
                                        pill 
                                        style={{ 
                                            position: 'absolute', 
                                            top: '5px', 
                                            right: '5px',
                                            color: '#000'
                                        }}
                                    >
                                        Pending
                                    </Badge>
                                    Material Adjust Approval Project
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link
                                    active={activeTab === 'req-by-store'}
                                    onClick={() => setActiveTab('req-by-store')}
                                    style={{
                                        backgroundColor: activeTab === 'req-by-store' 
                                            ? '#28a745' 
                                            : themeStyles.tabInactiveBg,
                                        color: activeTab === 'req-by-store' ? '#fff' : themeStyles.color,
                                        borderRadius: '10px 10px 0 0',
                                        fontWeight: '500',
                                        padding: '12px 24px',
                                        border: 'none',
                                        position: 'relative'
                                    }}
                                >
                                    <Badge 
                                        bg="success" 
                                        pill 
                                        style={{ 
                                            position: 'absolute', 
                                            top: '5px', 
                                            right: '5px'
                                        }}
                                    >
                                        ✓
                                    </Badge>
                                    Material Adjust Req. By Store
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </div>

                    {/* Table Content */}
                    <Card.Body style={{ 
                        padding: '30px',
                        backgroundColor: themeStyles.cardBg 
                    }}>
                        {loading || loadingOptions ? (
                            <div style={{ textAlign: 'center', padding: '50px' }}>
                                <Spinner animation="border" variant="primary" />
                                <p style={{ marginTop: '20px', color: themeStyles.color }}>
                                    {loading ? 'Loading material data...' : 'Loading options...'}
                                </p>
                            </div>
                        ) : error ? (
                            <Alert variant="danger">
                                <Alert.Heading>Error Loading Data</Alert.Heading>
                                <p>{error}</p>
                                <Button 
                                    variant="outline-danger" 
                                    size="sm"
                                    onClick={() => fetchMaterialData(fileId)}
                                >
                                    Retry
                                </Button>
                            </Alert>
                        ) : (
                            <>
                                <div style={{ 
                                    overflowX: 'auto',
                                    borderRadius: '8px',
                                    border: `1px solid ${themeStyles.cardBorder}`
                                }}>
                                    <Table 
                                        bordered 
                                        hover 
                                        responsive 
                                        style={{ 
                                            marginBottom: 0,
                                            backgroundColor: themeStyles.tableBg,
                                            color: themeStyles.color
                                        }}
                                    >
                                        <thead>
                                            <tr style={{ 
                                                backgroundColor: themeStyles.tableHeaderBg,
                                                color: '#ffffff'
                                            }}>
                                                <th style={{ 
                                                    width: '40px', 
                                                    textAlign: 'right',
                                                    fontWeight: '600',
                                                    padding: '15px 10px',
                                                    borderRight: '2px solid rgba(255,255,255,0.2)'
                                                }}></th>
                                                <th style={{ 
                                                    width: '80px', 
                                                    textAlign: 'right',
                                                    fontWeight: '600',
                                                    padding: '15px',
                                                    borderRight: '2px solid rgba(255,255,255,0.2)'
                                                }}>Sr.No</th>
                                                <th style={{ 
                                                    minWidth: '300px',
                                                    fontWeight: '600',
                                                    padding: '15px',
                                                    textAlign: 'right',

                                                    borderRight: '2px solid rgba(255,255,255,0.2)'
                                                }}>Material Description</th>
                                                <th style={{ 
                                                    width: '100px', 
                                                    textAlign: 'right',

                                                    fontWeight: '600',
                                                    padding: '15px',
                                                    borderRight: '2px solid rgba(255,255,255,0.2)'
                                                }}>Unit</th>
                                                <th style={{ 
                                                    width: '100px', 
                                                    textAlign: 'right',

                                                    fontWeight: '600',
                                                    padding: '15px'
                                                }}>Qty</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {materialRows.map((row, rowIndex) => (
                                                <React.Fragment key={row.id}>
                                                    {/* Main Row */}
                                                    <tr style={{ 
                                                        backgroundColor: rowIndex % 2 === 0 
                                                            ? themeStyles.tableRowBg 
                                                            : themeStyles.tableBg,
                                                        borderBottom: '2px solid ' + themeStyles.cardBorder
                                                    }}>
                                                        <td style={{ 
                                                            textAlign: 'right', 
                                                            verticalAlign: 'middle',
                                                            padding: '15px 10px'
                                                        }}>
                                                            <Button
                                                                variant={expandedRows[row.id] ? "secondary" : "success"}
                                                                size="sm"
                                                                onClick={() => toggleRowExpansion(row.id)}
                                                                style={{
                                                                    width: '30px',
                                                                    height: '30px',
                                                                    padding: '0',
                                                                    borderRadius: '6px',
                                                                    fontWeight: 'bold',
                                                                    fontSize: '18px'
                                                                }}
                                                            >
                                                                {expandedRows[row.id] ? '−' : '+'}
                                                            </Button>
                                                        </td>
                                                        <td style={{ 
                                                            textAlign: 'right', 
                                                            fontWeight: 'bold',
                                                            fontSize: '1.1rem',
                                                            padding: '15px'
                                                        }}>{row.srNo}</td>
                                                        <td style={{ 
                                                            padding: '15px',
                                                            textAlign: 'right', 
                                                            color: row.materialDescription === 'Sub Total' 
                                                                ? '#ff6b35' 
                                                                : themeStyles.color,
                                                            fontWeight: row.materialDescription === 'Sub Total' 
                                                                ? 'bold' 
                                                                : 'normal'
                                                        }}>
                                                            {row.materialDescription}
                                                        </td>
                                                        <td style={{ 
                                                           textAlign: 'right', 
                                                            padding: '15px'
                                                        }}>
                                                            {row.unit && (
                                                                <Badge 
                                                                    bg="primary" 
                                                                    style={{ 
                                                                        fontSize: '0.85rem',
                                                                        padding: '6px 12px',
                                                                        borderRadius: '6px'
                                                                    }}
                                                                >
                                                                    {row.unit}
                                                                </Badge>
                                                            )}
                                                        </td>
                                                        <td style={{ 
                                                            textAlign: 'right', 
                                                            fontWeight: 'bold',
                                                            fontSize: '1.1rem',
                                                            padding: '15px'
                                                        }}>{row.qty}</td>
                                                    </tr>

                                                    {/* Sub-material Headers and Rows - only show if expanded */}
                                                    {expandedRows[row.id] && (
                                                        <>
                                                            {/* Sub-material Headers */}
                                                            <tr style={{ 
                                                                backgroundColor: theme === 'dark' ? '#383d47' : '#e9ecef',
                                                                fontSize: '0.85rem',
                                                                fontWeight: '600'
                                                            }}>
                                                                <td style={{ padding: '10px', textAlign: 'center' }}>
                                                                    <Button
                                                                        variant="success"
                                                                        size="sm"
                                                                        onClick={() => addSubMaterial(row.id)}
                                                                        style={{
                                                                            width: '30px',
                                                                            height: '30px',
                                                                            padding: '0',
                                                                            borderRadius: '6px',
                                                                            fontWeight: 'bold',
                                                                            fontSize: '18px'
                                                                        }}
                                                                    >
                                                                        +
                                                                    </Button>
                                                                </td>
                                                                <td colSpan="2" style={{ padding: '10px' }}>
                                                                    <div style={{ display: 'flex', gap: '10px' }}>
                                                                        <div style={{ flex: 1 }}>Select Material Name</div>
                                                                        <div style={{ width: '150px', textAlign: 'center' }}>Unit</div>
                                                                    </div>
                                                                </td>
                                                                <td style={{ padding: '10px', textAlign: 'center' }}>Stock Qty</td>
                                                                <td style={{ padding: '10px', textAlign: 'center' }}>Purchase Qty</td>
                                                                <td style={{ padding: '10px', textAlign: 'center' }}>Final Qty</td>
                                                                <td style={{ padding: '10px', textAlign: 'center' }}>Left over material</td>
                                                                <td style={{ padding: '10px', textAlign: 'center' }}>Leftover Qty</td>
                                                                <td style={{ padding: '10px', textAlign: 'center' }}>Comment</td>
                                                            </tr>

                                                            {/* Sub-material Rows */}
                                                            {row.subMaterials.map((subMaterial, subIndex) => (
                                                                <tr 
                                                                    key={subMaterial.id}
                                                                    style={{ 
                                                                        backgroundColor: themeStyles.tableBg,
                                                                        borderBottom: `1px solid ${themeStyles.cardBorder}`
                                                                    }}
                                                                >
                                                                    <td style={{ 
                                                                        textAlign: 'center', 
                                                                        verticalAlign: 'middle',
                                                                        padding: '10px'
                                                                    }}>
                                                                        <Button
                                                                            variant="danger"
                                                                            size="sm"
                                                                            onClick={() => removeSubMaterial(row.id, subMaterial.id)}
                                                                            style={{
                                                                                width: '30px',
                                                                                height: '30px',
                                                                                padding: '0',
                                                                                borderRadius: '6px',
                                                                                fontWeight: 'bold',
                                                                                fontSize: '18px'
                                                                            }}
                                                                        >
                                                                            ×
                                                                        </Button>
                                                                    </td>
                                                                    <td colSpan="2" style={{ padding: '10px' }}>
                                                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                                            <div style={{ flex: 1 }}>
                                                                                <Select
                                                                                    options={materialOptions}
                                                                                    value={subMaterial.materialName}
                                                                                    onChange={(selected) => handleSubMaterialChange(row.id, subMaterial.id, 'materialName', selected)}
                                                                                    styles={getSelectStyles()}
                                                                                    placeholder="Select Material Name"
                                                                                    isClearable
                                                                                    isSearchable
                                                                                    menuPortalTarget={document.body}
                                                                                    menuPosition="fixed"
                                                                                />
                                                                            </div>
                                                                            <div style={{ width: '150px' }}>
                                                                                <Select
                                                                                    options={unitOptions}
                                                                                    value={subMaterial.unit}
                                                                                    onChange={(selected) => handleSubMaterialChange(row.id, subMaterial.id, 'unit', selected)}
                                                                                    styles={getSelectStyles(true)}
                                                                                    placeholder="Unit"
                                                                                    isClearable={false}
                                                                                    isSearchable
                                                                                    menuPortalTarget={document.body}
                                                                                    menuPosition="fixed"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td style={{ padding: '10px' }}>
                                                                        <Form.Control
                                                                            type="number"
                                                                            size="sm"
                                                                            placeholder="0"
                                                                            value={subMaterial.stockQty}
                                                                            onChange={(e) => handleSubMaterialChange(row.id, subMaterial.id, 'stockQty', e.target.value)}
                                                                            style={{
                                                                                backgroundColor: themeStyles.inputBg,
                                                                                color: themeStyles.inputColor,
                                                                                border: `1px solid ${themeStyles.inputBorder}`,
                                                                                borderRadius: '6px',textAlign: 'center'
                                                                        }}
                                                                    />
                                                                </td>
                                                                <td style={{ padding: '10px' }}>
                                                                    <Form.Control
                                                                        type="number"
                                                                        size="sm"
                                                                        placeholder="0"
                                                                        value={subMaterial.purchaseQty}
                                                                        onChange={(e) => handleSubMaterialChange(row.id, subMaterial.id, 'purchaseQty', e.target.value)}
                                                                        style={{
                                                                            backgroundColor: themeStyles.inputBg,
                                                                            color: themeStyles.inputColor,
                                                                            border: `1px solid ${themeStyles.inputBorder}`,
                                                                            borderRadius: '6px',
                                                                            textAlign: 'center'
                                                                        }}
                                                                    />
                                                                </td>
                                                                <td style={{ padding: '10px' }}>
                                                                    <Form.Control
                                                                        type="number"
                                                                        size="sm"
                                                                        placeholder="0"
                                                                        value={subMaterial.finalQty}
                                                                        onChange={(e) => handleSubMaterialChange(row.id, subMaterial.id, 'finalQty', e.target.value)}
                                                                        style={{
                                                                            backgroundColor: themeStyles.inputBg,
                                                                            color: themeStyles.inputColor,
                                                                            border: `1px solid ${themeStyles.inputBorder}`,
                                                                            borderRadius: '6px',
                                                                            textAlign: 'center'
                                                                        }}
                                                                    />
                                                                </td>
                                                                <td style={{ padding: '10px' }}>
                                                                    <Select
                                                                        options={materialOptions}
                                                                        value={subMaterial.leftOverMaterial}
                                                                        onChange={(selected) => handleSubMaterialChange(row.id, subMaterial.id, 'leftOverMaterial', selected)}
                                                                        styles={getSelectStyles()}
                                                                        placeholder="Select Material Name"
                                                                        isClearable
                                                                        isSearchable
                                                                        menuPortalTarget={document.body}
                                                                        menuPosition="fixed"
                                                                    />
                                                                </td>
                                                                <td style={{ padding: '10px' }}>
                                                                    <Form.Control
                                                                        type="number"
                                                                        size="sm"
                                                                        placeholder="0"
                                                                        value={subMaterial.leftoverQty}
                                                                        onChange={(e) => handleSubMaterialChange(row.id, subMaterial.id, 'leftoverQty', e.target.value)}
                                                                        style={{
                                                                            backgroundColor: themeStyles.inputBg,
                                                                            color: themeStyles.inputColor,
                                                                            border: `1px solid ${themeStyles.inputBorder}`,
                                                                            borderRadius: '6px',
                                                                            textAlign: 'center'
                                                                        }}
                                                                    />
                                                                </td>
                                                                <td style={{ padding: '10px' }}>
                                                                    <Form.Control
                                                                        type="text"
                                                                        size="sm"
                                                                        placeholder="Add comment..."
                                                                        value={subMaterial.comment}
                                                                        onChange={(e) => handleSubMaterialChange(row.id, subMaterial.id, 'comment', e.target.value)}
                                                                        style={{
                                                                            backgroundColor: themeStyles.inputBg,
                                                                            color: themeStyles.inputColor,
                                                                            border: `1px solid ${themeStyles.inputBorder}`,
                                                                            borderRadius: '6px'
                                                                        }}
                                                                    />
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>

                            {/* Action Button */}
                            <div style={{ marginTop: '30px', textAlign: 'left' }}>
                                <Button
                                    variant="warning"
                                    size="lg"
                                    onClick={handleAdjustMaterial}
                                    disabled={loading}
                                    style={{
                                        backgroundColor: '#ff6b35',
                                        border: 'none',
                                        borderRadius: '10px',
                                        padding: '15px 40px',
                                        fontWeight: '600',
                                        fontSize: '1.1rem',
                                        boxShadow: '0 4px 15px rgba(255,107,53,0.3)',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(255,107,53,0.4)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(255,107,53,0.3)';
                                    }}
                                >
                                    <i className="bi bi-check-circle me-2"></i>
                                    Adjust Material
                                </Button>
                            </div>
                        </>
                    )}
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
export default MaterialAdjustToStock;