import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { Container, Button, Row, Col, Card, ButtonGroup, Form, Table, Badge } from 'react-bootstrap';
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

const CostChitManager = () => {
    const { fileid } = useParams(); // Get fileid from URL (matches route parameter)
    const navigate = useNavigate();
    
    const [theme, setTheme] = useState('light');
    const [costChitData, setCostChitData] = useState(null);
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [loading, setLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        poTerms: '',
        customerAmbassador: '',
        discount: '',
        transport: '',
        salesCommission: '',
        weightMktg: '',
        weightDesign: '',
        orderType: {
            fixed: false,
            mss: false,
            mmss: false,
            spares: false,
            dismantling: false,
            hdpr: false,
            modification: false,
            other: false
        }
    });

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // API Base URL - Update this to your server
    const API_BASE_URL = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api";

    // Fetch cost chit data for the provided file ID
    const fetchCostChitData = async (fileIdParam) => {
        if (!fileIdParam) {
            toast.error('No file ID provided');
            return;
        }

        setLoading(true);
        try {
            const requestPayload = {
                action: 'getCostChitData',
                fileId: fileIdParam
            };

            const response = await fetch(`${API_BASE_URL}/getCostChitByFileId.php`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestPayload),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.status === "success" && data.data) {
                setCostChitData(data.data);
                setFormData({
                    poTerms: data.data.potandc || '',
                    customerAmbassador: data.data.customerAmbassador || '',
                    discount: data.data.discount || '',
                    transport: data.data.transportationCost || '',
                    salesCommission: '0',
                    weightMktg: data.data.weight || '',
                    weightDesign: data.data.weight || '',
                    orderType: {
                        fixed: data.data.productName?.toLowerCase().includes('fixed') || false,
                        mss: data.data.productName?.toLowerCase().includes('mss') || false,
                        mmss: data.data.productName?.toLowerCase().includes('mmss') || false,
                        spares: data.data.productName?.toLowerCase().includes('spares') || false,
                        dismantling: data.data.productName?.toLowerCase().includes('dismantling') || false,
                        hdpr: data.data.productName?.toLowerCase().includes('hdpr') || false,
                        modification: data.data.productName?.toLowerCase().includes('modification') || false,
                        other: false
                    }
                });
                toast.success('Cost chit data loaded successfully');
            } else {
                throw new Error(data.message || "No cost chit data received");
            }
        } catch (error) {
            console.error("Error fetching cost chit data:", error);
            toast.error(`Error fetching cost chit data: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Update cost chit data
    const updateCostChitData = async () => {
        setLoading(true);
        try {
            const requestPayload = {
                action: 'updateCostChit',
                fileId: fileid,
                ...formData
            };

            const response = await fetch(`${API_BASE_URL}/costChitManager.php`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestPayload),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.status === "success") {
                toast.success('Cost chit updated successfully');
            } else {
                throw new Error(data.message || "Update failed");
            }
        } catch (error) {
            console.error("Error updating cost chit:", error);
            toast.error(`Error updating cost chit: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Load data when fileid is available
    useEffect(() => {
        if (fileid) {
            fetchCostChitData(fileid);
        }
    }, [fileid]);

    const handleBackToGrid = () => {
        navigate('/marketing/cost-chit');
    };

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    const handleFormChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleOrderTypeChange = (type, checked) => {
        setFormData(prev => ({
            ...prev,
            orderType: {
                ...prev.orderType,
                [type]: checked
            }
        }));
    };

    const handleSubmit = async () => {
        if (!fileid) {
            toast.error('File ID is missing');
            return;
        }
    
        if (!formData.poTerms.trim()) {
            toast.error('Please enter PO Terms & Conditions');
            return;
        }
    
        setLoading(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('POTC', formData.poTerms);
            formDataToSend.append('fileID', fileid);
    
            const response = await fetch('http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/saveCostChitApi.php', {
                method: 'POST',
                body: formDataToSend
            });
    
            const result = await response.json();
    
            if (result.status === true) {
                toast.success(result.message || 'PO T & C added successfully');
            } else {
                toast.error(result.message || 'Failed to save');
            }
        } catch (error) {
            console.error('Error saving cost chit:', error);
            toast.error(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Theme styles
    const getThemeStyles = () => {
        if (theme === 'dark') {
            return {
                backgroundColor: 'linear-gradient(135deg, #21262d 0%, #161b22 100%)',
                color: '#f8f9fa',
                cardBg: '#343a40',
                cardHeader: 'linear-gradient(135deg, #495057 0%, #343a40 100%)',
                inputBg: '#495057',
                inputBorder: '#6c757d',
                inputColor: '#fff'
            };
        }
        return {
            backgroundColor: 'linear-gradient(135deg, #f8f9ff 0%, #e6f3ff 100%)',
            color: '#212529',
            cardBg: '#ffffff',
            cardHeader: 'linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%)',
            inputBg: '#ffffff',
            inputBorder: '#ced4da',
            inputColor: '#212529'
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
                    <p className="mt-3">Loading cost chit data...</p>
                </div>
            </div>
        );
    }

    if (!fileid) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: themeStyles.backgroundColor
            }}>
                <div style={{ textAlign: 'center', color: themeStyles.color }}>
                    <i className="bi bi-exclamation-circle" style={{ fontSize: '3rem', marginBottom: '20px' }}></i>
                    <h5>No File ID Provided</h5>
                    <p>Please navigate from the cost chit grid.</p>
                    <Button variant="primary" onClick={handleBackToGrid}>
                        <i className="bi bi-arrow-left"></i> Back to Grid
                    </Button>
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
                                <div className="d-flex align-items-center gap-3">
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={handleBackToGrid}
                                    >
                                        <i className="bi bi-arrow-left"></i> Back to Grid
                                    </Button>
                                    <div>
                                        <h4 className="mb-0">Cost Chit Manager</h4>
                                        <small style={{ opacity: 0.8 }}>
                                            File ID: {fileid}
                                            {costChitData && ` | ${costChitData.custName || costChitData.customerName}`}
                                        </small>
                                    </div>
                                </div>
                            </Col>

                            <Col xs={12} lg={6}>
                                <div className="d-flex justify-content-end gap-2 flex-wrap align-items-center">
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
                                </div>
                            </Col>
                        </Row>
                    </Card.Header>

                    {/* Body Content */}
                    <Card.Body style={{
                        backgroundColor: themeStyles.cardBg,
                        padding: isFullScreen ? 15 : 20
                    }}>
                        {costChitData ? (
                            <Row>
                                <Col lg={10} className="mx-auto">
                                    {/* Customer Info Header */}
                                    <div className="mb-4 p-3 rounded" style={{
                                        backgroundColor: theme === 'dark' ? '#495057' : '#f8f9fa',
                                        border: `1px solid ${theme === 'dark' ? '#6c757d' : '#dee2e6'}`
                                    }}>
                                        <Row>
                                            <Col md={6}>
                                                <div className="mb-2">
                                                    <small className="text-muted">CUSTOMER AMBASSADOR:</small>
                                                    <div className="d-flex gap-2 mt-1">
                                                        <Badge bg="primary">SVJ</Badge>
                                                        <Badge bg="secondary">AGP</Badge>
                                                        <Badge bg="info">RPK</Badge>
                                                        <Badge bg="warning">OTHER</Badge>
                                                    </div>
                                                </div>
                                                <div className="mb-2">
                                                    <small className="text-muted">Client Name:</small>
                                                    <div><strong>{costChitData.custName || costChitData.customerName}</strong></div>
                                                </div>
                                                <div className="mb-2">
                                                    <small className="text-muted">File No (Sale):</small>
                                                    <div><strong>{costChitData.file_name || costChitData.fileName}</strong></div>
                                                </div>
                                                <div className="mb-2">
                                                    <small className="text-muted">Project ID:</small>
                                                    <div><strong>{costChitData.projectId || '-'}</strong></div>
                                                </div>
                                            </Col>
                                            <Col md={6}>
                                                <div className="mb-2">
                                                    <small className="text-muted">Location / Place:</small>
                                                    <div><strong>{costChitData.city}, {costChitData.state}</strong></div>
                                                </div>
                                                <div className="mb-2">
                                                    <small className="text-muted">Product Name:</small>
                                                    <div><strong>{costChitData.productName || '-'}</strong></div>
                                                </div>
                                                <div className="mb-2">
                                                    <small className="text-muted">Store Location:</small>
                                                    <div><strong>{costChitData.storeLocation || '-'}</strong></div>
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>

                                    {/* Order Type Checkboxes */}
                                    <div className="mb-4">
                                        <div className="mb-2"><small className="text-muted">Order Type:</small></div>
                                        <div className="d-flex gap-3 flex-wrap">
                                            <Form.Check 
                                                type="checkbox" 
                                                label="Fixed" 
                                                checked={formData.orderType.fixed}
                                                onChange={(e) => handleOrderTypeChange('fixed', e.target.checked)}
                                            />
                                            <Form.Check 
                                                type="checkbox" 
                                                label="MSS" 
                                                checked={formData.orderType.mss}
                                                onChange={(e) => handleOrderTypeChange('mss', e.target.checked)}
                                            />
                                            <Form.Check 
                                                type="checkbox" 
                                                label="MMSS" 
                                                checked={formData.orderType.mmss}
                                                onChange={(e) => handleOrderTypeChange('mmss', e.target.checked)}
                                            />
                                            <Form.Check 
                                                type="checkbox" 
                                                label="Spares" 
                                                checked={formData.orderType.spares}
                                                onChange={(e) => handleOrderTypeChange('spares', e.target.checked)}
                                            />
                                            <Form.Check 
                                                type="checkbox" 
                                                label="Dismantling" 
                                                checked={formData.orderType.dismantling}
                                                onChange={(e) => handleOrderTypeChange('dismantling', e.target.checked)}
                                            />
                                            <Form.Check 
                                                type="checkbox" 
                                                label="HDPR" 
                                                checked={formData.orderType.hdpr}
                                                onChange={(e) => handleOrderTypeChange('hdpr', e.target.checked)}
                                            />
                                            <Form.Check 
                                                type="checkbox" 
                                                label="Modification" 
                                                checked={formData.orderType.modification}
                                                onChange={(e) => handleOrderTypeChange('modification', e.target.checked)}
                                            />
                                            <Form.Check 
                                                type="checkbox" 
                                                label="Other" 
                                                checked={formData.orderType.other}
                                                onChange={(e) => handleOrderTypeChange('other', e.target.checked)}
                                            />
                                        </div>
                                    </div>

                                    {/* Main Form Table */}
                                    <Table bordered hover responsive style={{
                                        backgroundColor: themeStyles.cardBg,
                                        color: themeStyles.color
                                    }}>
                                        <tbody>
                                            <tr>
                                                <td style={{ width: '20%' }}><strong>PO No.</strong></td>
                                                <td style={{ width: '30%' }}>
                                                    <div><strong>Sale</strong></div>
                                                    <div>{costChitData.poNumber || 'Verbal'}</div>
                                                </td>
                                                <td style={{ width: '30%' }}>
                                                    <div><strong>Labour</strong></div>
                                                    <div>{costChitData.labourPoNumber || '-'}</div>
                                                </td>
                                                <td style={{ width: '20%' }}>
                                                    <div><strong>PO Received Date</strong></div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td><strong>PO Value</strong></td>
                                                <td>₹ {Number(costChitData.poAmount || 0).toLocaleString()}</td>
                                                <td>₹ {Number(costChitData.labourAmount || 0).toLocaleString()}</td>
                                                <td></td>
                                            </tr>
                                            <tr>
                                                <td><strong>Transport</strong></td>
                                                <td>₹ {Number(costChitData.transportCost || 0).toLocaleString()}</td>
                                                <td>-</td>
                                                <td></td>
                                            </tr>
                                            <tr>
                                                <td><strong>Design Amount</strong></td>
                                                <td>₹ {Number(costChitData.designAmount || 0).toLocaleString()}</td>
                                                <td>-</td>
                                                <td></td>
                                            </tr>
                                            <tr>
                                                <td><strong>Marketing Ratio</strong></td>
                                                <td>{costChitData.mktgRatio || 0}%</td>
                                                <td>-</td>
                                                <td></td>
                                            </tr>
                                            <tr>
                                                <td><strong>Design Ratio</strong></td>
                                                <td>{costChitData.designRatio || 0}%</td>
                                                <td>-</td>
                                                <td></td>
                                            </tr>
                                            <tr>
                                                <td><strong>Weight:</strong></td>
                                                <td>{costChitData.materialWeight || 0} KG</td>
                                                <td><strong>Labour Status:</strong></td>
                                                <td>{costChitData.labourStatus || 'NO'}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Work Status:</strong></td>
                                                <td>{costChitData.workStatus || '0'}</td>
                                                <td><strong>Final Status:</strong></td>
                                                <td>
                                                    <Badge bg={costChitData.finalStatus === 'P' ? 'warning' : 'success'}>
                                                        {costChitData.finalStatus === 'P' ? 'Pending' : 'Complete'}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </Table>

                                    {/* PO Terms and Conditions */}
                                    <div className="mt-4">
                                        <div className="mb-2">
                                            <strong>PO Payment Terms & Conditions :-</strong>
                                        </div>
                                        <Form.Control
                                            as="textarea"
                                            rows={6}
                                            value={formData.poTerms}
                                            onChange={(e) => handleFormChange('poTerms', e.target.value)}
                                            style={{
                                                backgroundColor: themeStyles.inputBg,
                                                borderColor: themeStyles.inputBorder,
                                                color: themeStyles.inputColor
                                            }}
                                            placeholder="Enter PO terms and conditions..."
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <div className="mt-4 text-center">
                                        <ButtonGroup>
                                            <Button 
                                                variant="success" 
                                                size="lg" 
                                                onClick={handleSubmit}
                                                disabled={loading}
                                            >
                                                <i className="bi bi-check-circle"></i>
                                                {loading ? ' Updating...' : ' Submit'}
                                            </Button>
                                            <Button 
                                                variant="secondary" 
                                                size="lg" 
                                                onClick={handleBackToGrid}
                                            >
                                                <i className="bi bi-arrow-left"></i>
                                                Back to Grid
                                            </Button>
                                        </ButtonGroup>
                                    </div>
                                </Col>
                            </Row>
                        ) : (
                            <div style={{
                                textAlign: 'center',
                                padding: '50px',
                                color: themeStyles.color
                            }}>
                                <i className="bi bi-file-earmark-text" style={{ fontSize: '3rem', marginBottom: '20px' }}></i>
                                <h5>Unable to load data for File ID: {fileid}</h5>
                                <p>Unable to load data for File ID: {fileid}</p>
                                <Button variant="primary" onClick={handleBackToGrid}>
                                    <i className="bi bi-arrow-left"></i> Back to Grid
                                </Button>
                            </div>
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

export default CostChitManager;