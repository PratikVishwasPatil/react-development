import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Card, Row, Col, Form, Button, Table, Alert } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NewDCClose = () => {
    const { file_id } = useParams();
    
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        challan_no: '',
        challan_date: '',
        file_no: '',
        file_name: '',
        vehicle_no: '',
        semi_finish: false
    });
    
    const [materials, setMaterials] = useState([]);
    const [selectedMaterials, setSelectedMaterials] = useState({});
    const [assignQuantities, setAssignQuantities] = useState({});
    
    const API_URL = `http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/newDCCloseApi.php?file_id=${file_id}`;

    // Fetch data on component mount
    useEffect(() => {
        if (file_id) {
            fetchData();
        }
    }, [file_id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            if (data.success && data.data) {
                // Set form data
                setFormData({
                    ...formData,
                    file_no: data.data.file_details?.file_id || '',
                    file_name: data.data.file_details?.file_name || '',
                    challan_date: data.data.today || ''
                });
                
                // Set materials
                setMaterials(data.data.materials || []);
                
                toast.success('Data loaded successfully');
            } else {
                throw new Error(data.message || "Failed to load data");
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error(`Error: ${error.message}`);
            setMaterials([]);
        } finally {
            setLoading(false);
        }
    };

    // Handle checkbox change
    const handleCheckboxChange = (materialId, checked) => {
        setSelectedMaterials(prev => ({
            ...prev,
            [materialId]: checked
        }));
        
        // Clear quantity if unchecked
        if (!checked) {
            setAssignQuantities(prev => {
                const newQuantities = { ...prev };
                delete newQuantities[materialId];
                return newQuantities;
            });
        }
    };

    // Handle quantity change
    const handleQuantityChange = (materialId, value) => {
        // Find the material to validate against remaining qty
        const material = materials.find(m => m.id === materialId);
        if (material && parseFloat(value) > material.remaining_qty) {
            toast.error(`Quantity cannot exceed remaining quantity (${material.remaining_qty})`);
            return;
        }
        
        setAssignQuantities(prev => ({
            ...prev,
            [materialId]: value
        }));
    };

    // Handle form input change
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Handle assign data
    const handleAssignData = async () => {
        // Validate challan number and date
        if (!formData.challan_no || !formData.challan_date) {
            toast.error('Please enter Challan No and Challan Date');
            return;
        }

        // Get selected materials with quantities
        const selectedMaterialsList = Object.keys(selectedMaterials)
            .filter(id => selectedMaterials[id])
            .map(id => ({
                rfd_id: id,
                assign_qty: assignQuantities[id] || 0
            }))
            .filter(m => m.assign_qty > 0);

        if (selectedMaterialsList.length === 0) {
            toast.error('Please select materials and enter quantities');
            return;
        }

        // Prepare POST data
        const postData = {
            challan_no: formData.challan_no,
            challan_date: formData.challan_date,
            file_id: file_id,
            vehicle_no: formData.vehicle_no,
            semi_finish: formData.semi_finish,
            materials: selectedMaterialsList
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData)
            });

            const result = await response.json();
            
            if (result.success) {
                toast.success('Materials assigned successfully!');
                
                // Reset form
                setSelectedMaterials({});
                setAssignQuantities({});
                
                // Reload data
                setTimeout(() => {
                    fetchData();
                }, 1000);
            } else {
                toast.error(result.message || 'Failed to assign materials');
            }
        } catch (error) {
            console.error('Error assigning materials:', error);
            toast.error('Error assigning materials');
        }
    };

    if (loading) {
        return (
            <Container className="mt-5">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading data...</p>
                </div>
            </Container>
        );
    }

    return (
        <Container fluid className="py-4">
            <Card style={{ border: '2px solid #4CAF50' }}>
                {/* Header */}
                <Card.Header style={{ 
                    backgroundColor: '#e8f5e9', 
                    borderBottom: '2px solid #4CAF50',
                    padding: '15px'
                }}>
                    <h5 className="mb-0" style={{ color: '#2e7d32', fontWeight: 'bold' }}>
                        GRN Against Purchase Order
                    </h5>
                </Card.Header>

                <Card.Body style={{ padding: '20px' }}>
                    {/* Form Section */}
                    <div style={{ 
                        border: '2px solid #ff9800', 
                        padding: '20px', 
                        marginBottom: '20px',
                        borderRadius: '4px'
                    }}>
                        <Row>
                            {/* Left Column */}
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Row>
                                        <Col md={4}>
                                            <Form.Label style={{ 
                                                backgroundColor: '#2196F3', 
                                                color: 'white', 
                                                padding: '8px 15px',
                                                borderRadius: '4px',
                                                fontWeight: 'bold',
                                                display: 'inline-block'
                                            }}>
                                                Challan No :
                                            </Form.Label>
                                        </Col>
                                        <Col md={8}>
                                            <Form.Control
                                                type="text"
                                                value={formData.challan_no}
                                                onChange={(e) => handleInputChange('challan_no', e.target.value)}
                                                style={{ borderBottom: '1px solid gray', borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}
                                            />
                                        </Col>
                                    </Row>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Row>
                                        <Col md={4}>
                                            <Form.Label style={{ fontWeight: '500' }}>File No :</Form.Label>
                                        </Col>
                                        <Col md={8}>
                                            <Form.Control
                                                type="text"
                                                value={formData.file_name}
                                                readOnly
                                                style={{ 
                                                    backgroundColor: '#f5f5f5',
                                                    border: '1px solid #ddd'
                                                }}
                                            />
                                        </Col>
                                    </Row>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Row>
                                        <Col md={4}>
                                            <Form.Label style={{ fontWeight: '500' }}>Vehicle No :</Form.Label>
                                        </Col>
                                        <Col md={8}>
                                            <Form.Control
                                                type="text"
                                                value={formData.vehicle_no}
                                                onChange={(e) => handleInputChange('vehicle_no', e.target.value)}
                                            />
                                        </Col>
                                    </Row>
                                </Form.Group>
                            </Col>

                            {/* Right Column */}
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Row>
                                        <Col md={4}>
                                            <Form.Label style={{ fontWeight: '500' }}>Challan Date :</Form.Label>
                                        </Col>
                                        <Col md={8}>
                                            <Form.Control
                                                type="date"
                                                value={formData.challan_date}
                                                onChange={(e) => handleInputChange('challan_date', e.target.value)}
                                            />
                                        </Col>
                                    </Row>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Row>
                                        <Col md={4}>
                                            <Form.Label style={{ fontWeight: '500' }}>Semi Finish :</Form.Label>
                                        </Col>
                                        <Col md={8}>
                                            <Form.Check
                                                type="checkbox"
                                                checked={formData.semi_finish}
                                                onChange={(e) => handleInputChange('semi_finish', e.target.checked)}
                                                style={{ marginTop: '8px' }}
                                            />
                                        </Col>
                                    </Row>
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>

                    {/* Table Section */}
                    <div className="table-responsive">
                        <Table bordered hover style={{ marginBottom: '20px' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#ff9800', color: 'white' }}>
                                    <th></th>
                                    <th>DC No</th>
                                    <th>Material Name</th>
                                    <th>Width</th>
                                    <th>Length</th>
                                    <th>Req. Qty</th>
                                    <th>Com. Qty</th>
                                    <th>Rem. Qty</th>
                                    <th>UOM</th>
                                    <th>Color</th>
                                    <th>Assign Qty</th>
                                </tr>
                            </thead>
                            <tbody>
                                {materials.length === 0 ? (
                                    <tr>
                                        <td colSpan="11" className="text-center">
                                            No materials available
                                        </td>
                                    </tr>
                                ) : (
                                    materials.map((material, index) => (
                                        <tr key={material.id}>
                                            <td className="text-center">
                                                <Form.Check
                                                    type="checkbox"
                                                    checked={selectedMaterials[material.id] || false}
                                                    onChange={(e) => handleCheckboxChange(material.id, e.target.checked)}
                                                />
                                            </td>
                                            <td>{material.dc_id || '-'}</td>
                                            <td>{material.rfd_name}</td>
                                            <td>{material.width}</td>
                                            <td>{material.length}</td>
                                            <td>{material.required_qty}</td>
                                            <td>{material.completed_qty}</td>
                                            <td>{material.remaining_qty}</td>
                                            <td>-</td>
                                            <td>{material.colour || '-'}</td>
                                            <td>
                                                <Form.Control
                                                    type="number"
                                                    value={assignQuantities[material.id] || ''}
                                                    onChange={(e) => handleQuantityChange(material.id, e.target.value)}
                                                    disabled={!selectedMaterials[material.id]}
                                                    style={{ width: '100px' }}
                                                    placeholder="0"
                                                    min="0"
                                                    max={material.remaining_qty}
                                                    step="0.01"
                                                />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </div>

                    {/* Assign Button */}
                    <div className="text-center">
                        <Button
                            variant="warning"
                            size="lg"
                            onClick={handleAssignData}
                            style={{
                                backgroundColor: '#ff9800',
                                border: 'none',
                                color: 'white',
                                fontWeight: 'bold',
                                padding: '10px 40px',
                                borderRadius: '25px'
                            }}
                        >
                            Assign Data
                        </Button>
                    </div>

                    {materials.length > 0 && (
                        <div className="text-center mt-3">
                            <Alert variant="info">
                                Total Materials: {materials.length} | 
                                Selected: {Object.values(selectedMaterials).filter(Boolean).length}
                            </Alert>
                        </div>
                    )}
                </Card.Body>
            </Card>

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
                theme="light"
            />
        </Container>
    );
};

export default NewDCClose;