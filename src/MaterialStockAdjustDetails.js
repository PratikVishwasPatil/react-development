import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Form, Button, Table, Badge, Nav, Spinner, Alert } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const ModernMaterialAdjust = () => {
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [materialData, setMaterialData] = useState([]);
  const [selectedRows, setSelectedRows] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [activeTab, setActiveTab] = useState('adjust-to-stock');
  const [fileId, setFileId] = useState('');
  
  useEffect(() => {
    const hash = window.location.hash;
    const pathParts = hash.split('/');
    const fileIdFromUrl = pathParts[pathParts.length - 1] || '5581';

    console.log('Full hash:', hash);
    console.log('Extracted file ID:', fileIdFromUrl);

    setFileId(fileIdFromUrl);
    fetchData(fileIdFromUrl);
  }, []);

  const financialYear = '25-26';
  const empId = '1'; // Replace with actual employee ID

  const fetchData = async (currentFileId) => {
    const idToUse = currentFileId || fileId;
    
    if (!idToUse) {
      toast.error('File ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/MaterialStockAdjustDetailsApi.php?financial_year=${financialYear}&fileId=${idToUse}`
      );
      const data = await response.json();
      
      if (data.status === 'success') {
        setMaterialData(data.data);
        toast.success(`Loaded ${data.total} records successfully!`);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const toggleRowSelection = (rowNumber) => {
    setSelectedRows(prev => ({
      ...prev,
      [rowNumber]: !prev[rowNumber]
    }));
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedRows({});
    } else {
      const allSelected = {};
      materialData.forEach(item => {
        allSelected[item.RowNumber] = true;
      });
      setSelectedRows(allSelected);
    }
    setSelectAll(!selectAll);
  };

  const handleSubmit = async () => {
    const selectedRowNumbers = Object.keys(selectedRows).filter(key => selectedRows[key]);
    
    if (selectedRowNumbers.length === 0) {
      toast.error('Please select at least one row');
      return;
    }

    setSubmitting(true);
    try {
      // Build arrays according to PHP expectations
      const alertName1 = [];
      const shippingCountry1 = []; // Issue Material ID (you may need to add this field to API)
      const unitData = [];
      const stockQty = [];
      const PurQty = [];
      const finishQty = [];
      const rowCount = []; // Project Material IDs
      const leftoverQty = [];
      const leftovermaterial = []; // Leftover Material ID (you may need to add this field to API)
      const comment = [];

      selectedRowNumbers.forEach(rowNum => {
        const item = materialData.find(m => m.RowNumber === rowNum);
        
        if (item) {
          alertName1.push(''); // Empty or can be populated if needed
          shippingCountry1.push(item.materialId || ''); // Issue Material ID - adjust based on your API response
          unitData.push(item.unitName || 'NOS');
          stockQty.push(item.Qty || 0);
          PurQty.push(item.Qty || 0);
          finishQty.push(item.finishQty || 0); // Adjust based on your API response
          rowCount.push(rowNum); // Project Material ID
          leftoverQty.push(item.remainingQty || 0);
          leftovermaterial.push(item.leftoverMaterialId || ''); // Adjust based on your API response
          comment.push(''); // Empty or can be populated if needed
        }
      });

      const payload = {
        fileId: fileId,
        empId: empId,
        alertName1: alertName1,
        shippingCountry1: shippingCountry1,
        unitData: unitData,
        stockQty: stockQty,
        PurQty: PurQty,
        finishQty: finishQty,
        rowCount: rowCount,
        leftoverQty: leftoverQty,
        leftovermaterial: leftovermaterial,
        comment: comment
      };

      console.log('Submitting payload:', payload);

      const response = await fetch(
        'https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/saveMaterialAdjustApi.php',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        }
      );

      const result = await response.json();

      if (result.status === 'success') {
        toast.success('Material adjustment saved successfully!');
        setTimeout(() => {
          fetchData();
          setSelectedRows({});
          setSelectAll(false);
        }, 1500);
      } else {
        toast.error(result.message || 'Failed to save adjustment');
      }
    } catch (error) {
      console.error('Error submitting:', error);
      toast.error('An error occurred while saving');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const themeStyles = {
    bg: theme === 'dark' ? '#1a202c' : '#f7fafc',
    cardBg: theme === 'dark' ? '#2d3748' : '#ffffff',
    text: theme === 'dark' ? '#e2e8f0' : '#2d3748',
    border: theme === 'dark' ? '#4a5568' : '#e2e8f0',
    headerBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    tableBg: theme === 'dark' ? '#2d3748' : '#ffffff',
    rowHover: theme === 'dark' ? '#4a5568' : '#f7fafc'
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: themeStyles.bg
      }}>
        <div style={{ textAlign: 'center' }}>
          <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
          <p className="mt-3" style={{ color: themeStyles.text }}>Loading data...</p>
        </div>
      </div>
    );
  }

  const selectedCount = Object.keys(selectedRows).filter(key => selectedRows[key]).length;

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: themeStyles.bg,
      padding: '20px'
    }}>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        theme={theme}
      />

      <Container fluid>
        {/* Header */}
        <Card style={{ 
          background: themeStyles.headerBg,
          border: 'none',
          borderRadius: '20px',
          marginBottom: '30px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
        }}>
          <Card.Body className="p-4">
            <Row className="align-items-center">
              <Col md={8}>
                <h2 className="mb-0" style={{ color: '#fff', fontWeight: '700' }}>
                  <i className="bi bi-box-seam me-3"></i>
                  Material Stock Adjustment
                </h2>
                <p className="mb-0 mt-2" style={{ color: 'rgba(255,255,255,0.9)' }}>
                  File ID: {fileId} | FY {financialYear} | {materialData.length} Records
                  {selectedCount > 0 && ` | ${selectedCount} Selected`}
                </p>
              </Col>
              <Col md={4} className="text-end">
                <Button
                  variant="light"
                  onClick={toggleTheme}
                  className="me-2"
                  style={{ borderRadius: '12px', fontWeight: '600' }}
                >
                  {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
                </Button>
                <Button
                  variant="light"
                  onClick={() => fetchData()}
                  style={{ borderRadius: '12px', fontWeight: '600' }}
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Refresh
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Nav variant="tabs" className="mb-0" style={{ borderBottom: 'none' }}>
          <Nav.Item>
            <Nav.Link
              active={activeTab === 'adjust-to-stock'}
              onClick={() => setActiveTab('adjust-to-stock')}
              style={{
                backgroundColor: activeTab === 'adjust-to-stock' ? '#667eea' : themeStyles.cardBg,
                color: activeTab === 'adjust-to-stock' ? '#fff' : themeStyles.text,
                borderRadius: '10px 10px 0 0',
                fontWeight: '500',
                padding: '12px 24px',
                border: 'none'
              }}
            >
              <i className="bi bi-activity me-2"></i>
              Active Material Replace to Stock
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              active={activeTab === 'approval-project'}
              onClick={() => setActiveTab('approval-project')}
              style={{
                backgroundColor: activeTab === 'approval-project' ? '#ffc107' : themeStyles.cardBg,
                color: activeTab === 'approval-project' ? '#000' : themeStyles.text,
                borderRadius: '10px 10px 0 0',
                fontWeight: '500',
                padding: '12px 24px',
                border: 'none'
              }}
            >
              <i className="bi bi-hourglass-split me-2"></i>
              Pending Material Replace Approval Project
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              active={activeTab === 'req-by-store'}
              onClick={() => setActiveTab('req-by-store')}
              style={{
                backgroundColor: activeTab === 'req-by-store' ? '#28a745' : themeStyles.cardBg,
                color: activeTab === 'req-by-store' ? '#fff' : themeStyles.text,
                borderRadius: '10px 10px 0 0',
                fontWeight: '500',
                padding: '12px 24px',
                border: 'none'
              }}
            >
              <i className="bi bi-check-circle me-2"></i>
              ✓ Material Replace Req. By Store
            </Nav.Link>
          </Nav.Item>
        </Nav>

        {/* Main Content Card */}
        <Card style={{
          backgroundColor: themeStyles.cardBg,
          border: `1px solid ${themeStyles.border}`,
          borderRadius: '0 20px 20px 20px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
          overflow: 'hidden'
        }}>
          <Card.Body className="p-0">
            <div style={{ overflowX: 'auto' }}>
              <Table hover responsive style={{ marginBottom: 0 }}>
                <thead style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#fff'
                }}>
                  <tr>
                    <th style={{ padding: '16px', width: '60px', textAlign: 'center' }}>
                      <Form.Check
                        type="checkbox"
                        checked={selectAll}
                        onChange={toggleSelectAll}
                        style={{ transform: 'scale(1.3)' }}
                      />
                    </th>
                    <th style={{ padding: '16px', width: '100px',textAlign: 'right' }}>Sr.No</th>
                    <th style={{ padding: '16px', minWidth: '350px',textAlign: 'right' }}>Material Description</th>
                    <th style={{ padding: '16px', width: '140px', textAlign: 'right' }}>Unit</th>
                    <th style={{ padding: '16px', width: '140px', textAlign: 'right' }}>Quantity</th>
                    <th style={{ padding: '16px', width: '140px', textAlign: 'right' }}>Remaining</th>
                  </tr>
                </thead>
                <tbody>
                  {materialData.map((item, index) => (
                    <tr 
                      key={item.RowNumber}
                      style={{
                        backgroundColor: selectedRows[item.RowNumber] 
                          ? (theme === 'dark' ? 'rgba(102, 126, 234, 0.2)' : 'rgba(102, 126, 234, 0.1)')
                          : (index % 2 === 0 ? themeStyles.tableBg : themeStyles.rowHover),
                        color: themeStyles.text,
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                      onClick={() => toggleRowSelection(item.RowNumber)}
                    >
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <Form.Check
                          type="checkbox"
                          checked={selectedRows[item.RowNumber] || false}
                          onChange={() => toggleRowSelection(item.RowNumber)}
                          style={{ transform: 'scale(1.2)' }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td style={{ padding: '16px', fontWeight: '600', fontSize: '15px', textAlign: 'right'  }}>
                        {item.count}
                      </td>
                      <td style={{ padding: '16px', fontSize: '15px', textAlign: 'right'  }}>
                        {item.materailName}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        {item.unitName && (
                          <Badge 
                            bg="warning" 
                            text="dark"
                            style={{
                              padding: '8px 14px',
                              fontSize: '13px',
                              fontWeight: '600',
                              borderRadius: '8px'
                            }}
                          >
                            {item.unitName}
                          </Badge>
                        )}
                      </td>
                      <td style={{ 
                        padding: '16px', 
                        textAlign: 'right',
                        fontSize: '17px',
                        fontWeight: '600'
                      }}>
                        {item.Qty}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <Badge 
                          bg={item.remainingQty > 0 ? 'success' : 'secondary'}
                          style={{
                            padding: '8px 14px',
                            fontSize: '14px',
                            fontWeight: '600',
                            borderRadius: '8px'
                          }}
                        >
                          {item.remainingQty}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>

        {/* Submit Button */}
        <div className="text-center mt-4 mb-4">
          <Button
            variant="primary"
            size="lg"
            onClick={handleSubmit}
            disabled={submitting || selectedCount === 0}
            style={{
              padding: '16px 60px',
              fontSize: '18px',
              fontWeight: '700',
              borderRadius: '16px',
              background: selectedCount > 0 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)',
              border: 'none',
              boxShadow: selectedCount > 0 
                ? '0 8px 24px rgba(102, 126, 234, 0.4)'
                : '0 4px 12px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              transform: submitting ? 'scale(0.95)' : 'scale(1)',
              opacity: selectedCount === 0 ? 0.6 : 1
            }}
            onMouseOver={(e) => {
              if (!submitting && selectedCount > 0) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(102, 126, 234, 0.5)';
              }
            }}
            onMouseOut={(e) => {
              if (!submitting && selectedCount > 0) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.4)';
              }
            }}
          >
            {submitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Processing...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-2"></i>
                Adjust Material {selectedCount > 0 && `(${selectedCount})`}
              </>
            )}
          </Button>
        </div>
      </Container>
    </div>
  );
};

export default ModernMaterialAdjust;