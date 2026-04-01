import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Form, Button, Table, Badge, Nav, Spinner, Alert } from 'react-bootstrap';
import Select from 'react-select';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const MaterialReplaceToStock = () => {
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
    const hash = window.location.hash;
    const pathParts = hash.split('/');
    const fileIdFromUrl = pathParts[pathParts.length - 1] || '5600';

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
        `http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/getMaterialRequirementList.php?file_id=${fileId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const data = await response.json();

      if (data.status === 'success' && data.data) {
        const transformedRows = data.data.map((record, index) => ({
          id: record.row_id || index + 1,
          srNo: record.row_no,
          materialId: record.material_id,
          materialDescription: record.material_name,
          unit: record.unit,
          qty: record.required_qty,
          assignedQty: record.assigned_qty,
          remainingQty: record.remaining_qty,
          vendor: record.vendor,
          date: record.date,
          alternateItems: record.alternate_items || [],
          subMaterials: []
        }));

        setMaterialRows(transformedRows);

        const initialExpandedState = {};
        transformedRows.forEach(row => {
          initialExpandedState[row.id] = false;
        });
        setExpandedRows(initialExpandedState);

        toast.success(`Loaded ${data.total} material records successfully!`);
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

  const toggleRowExpansion = (rowId) => {
    setExpandedRows(prev => ({
      ...prev,
      [rowId]: !prev[rowId]
    }));

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
                assignStock: '',
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
              assignStock: '',
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
        if (!sub.materialName || !sub.unit || !sub.stockQty) {
          hasErrors = true;
        }
      });
    });

    if (hasErrors) {
      toast.error('Please fill in Material Name, Unit, and Stock Qty for all sub-materials');
      return;
    }

    setLoading(true);
    try {
      // Prepare form data according to PHP API expectations
      const formData = new FormData();
      formData.append('file_id', fileId);

      // Prepare arrays for all fields
      const alertName1 = [];      // Not used in this context, can be empty
      const shippingCountry1 = []; // material IDs
      const unitData = [];
      const stockQty = [];
      const PurQty = [];
      const rowCount = [];         // IDs from MtlRqmt table

      // Build arrays from expanded rows with sub-materials
      rowsWithSubMaterials.forEach(row => {
        row.subMaterials.forEach(sub => {
          alertName1.push('');                           // Empty for now
          shippingCountry1.push(sub.materialName?.value || ''); // Material ID
          unitData.push(sub.unit?.value || '');
          stockQty.push(sub.stockQty || '0');
          PurQty.push(sub.assignStock || '0');
          rowCount.push(row.id);                         // Row ID from MtlRqmt table
        });
      });

      // Append arrays to formData
      alertName1.forEach(val => formData.append('alertName1[]', val));
      shippingCountry1.forEach(val => formData.append('shippingCountry1[]', val));
      unitData.forEach(val => formData.append('unitData[]', val));
      stockQty.forEach(val => formData.append('stockQty[]', val));
      PurQty.forEach(val => formData.append('PurQty[]', val));
      rowCount.forEach(val => formData.append('rowCount[]', val));

      // Submit to API
      const response = await fetch(
        'http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/saveAdjustMaterialApi.php',
        {
          method: 'POST',
          body: formData
        }
      );

      const result = await response.json();

      if (result.status === 'success') {
        toast.success('Material adjustment submitted successfully!');
        console.log('API Response:', result);
        
        // Optionally refresh the data
        setTimeout(() => {
          fetchMaterialData(fileId);
          // Reset expanded rows
          setExpandedRows({});
        }, 1500);
      } else {
        toast.error('Failed to adjust material');
        console.error('API Error:', result);
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
        tableHeaderBg: '#ff6b35',
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
      color: state.isSelected ? '#ffffff' : themeStyles.inputColor,
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
      color: themeStyles.color,
      padding: '20px',
      transition: 'all 0.3s ease'
    }}>
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
      
      <Container fluid>
        {/* Header Card */}
        <Card 
          className="mb-4 shadow-lg"
          style={{ 
            backgroundColor: themeStyles.cardBg,
            borderColor: themeStyles.cardBorder,
            borderRadius: '15px',
            border: 'none'
          }}
        >
          <Card.Body>
            <Row className="align-items-center">
              <Col md={8}>
                <h2 style={{ 
                  color: '#ff6b35', 
                  fontWeight: 'bold',
                  marginBottom: '5px'
                }}>
                  <i className="bi bi-arrow-left-right me-2"></i>
                  Material Replace Dashboard
                </h2>
                <p style={{ 
                  color: themeStyles.color, 
                  marginBottom: '0',
                  fontSize: '14px'
                }}>
                  Replace and manage material requirements efficiently - File ID: {fileId}
                </p>
              </Col>
              <Col md={4} className="text-end">
                <Button
                  variant={theme === 'light' ? 'dark' : 'light'}
                  onClick={toggleTheme}
                  style={{
                    borderRadius: '10px',
                    padding: '10px 20px',
                    fontWeight: '500'
                  }}
                >
                  {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Tabs Navigation */}
        {/* <Nav variant="tabs" className="mb-0" style={{ borderBottom: 'none' }}>
          <Nav.Item>
            <Nav.Link
              active={activeTab === 'adjust-to-stock'}
              onClick={() => setActiveTab('adjust-to-stock')}
              style={{
                backgroundColor: activeTab === 'adjust-to-stock' ? themeStyles.tableHeaderBg : themeStyles.tabInactiveBg,
                color: activeTab === 'adjust-to-stock' ? '#fff' : themeStyles.color,
                borderRadius: '10px 10px 0 0',
                fontWeight: '500',
                padding: '12px 24px',
                border: 'none',
                position: 'relative'
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
                backgroundColor: activeTab === 'approval-project' ? '#ffc107' : themeStyles.tabInactiveBg,
                color: activeTab === 'approval-project' ? '#000' : themeStyles.color,
                borderRadius: '10px 10px 0 0',
                fontWeight: '500',
                padding: '12px 24px',
                border: 'none',
                position: 'relative'
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
                backgroundColor: activeTab === 'req-by-store' ? '#28a745' : themeStyles.tabInactiveBg,
                color: activeTab === 'req-by-store' ? '#fff' : themeStyles.color,
                borderRadius: '10px 10px 0 0',
                fontWeight: '500',
                padding: '12px 24px',
                border: 'none',
                position: 'relative'
              }}
            >
              <i className="bi bi-check-circle me-2"></i>
              ✓ Material Replace Req. By Store
            </Nav.Link>
          </Nav.Item>
        </Nav> */}

        {/* Table Content */}
        {loading || loadingOptions ? (
          <Card 
            style={{ 
              backgroundColor: themeStyles.cardBg,
              borderColor: themeStyles.cardBorder,
              borderRadius: '0 15px 15px 15px',
              minHeight: '400px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div className="text-center">
              <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
              <p className="mt-3" style={{ color: themeStyles.color }}>
                {loading ? 'Loading material data...' : 'Loading options...'}
              </p>
            </div>
          </Card>
        ) : error ? (
          <Alert variant="danger">
            <Alert.Heading>Error Loading Data</Alert.Heading>
            <p>{error}</p>
            <Button 
              variant="outline-danger" 
              onClick={() => fetchMaterialData(fileId)}
            >
              Retry
            </Button>
          </Alert>
        ) : (
          <>
            <Card 
              style={{ 
                backgroundColor: themeStyles.cardBg,
                borderColor: themeStyles.cardBorder,
                borderRadius: '0 15px 15px 15px',
                border: 'none'
              }}
            >
              <Card.Body style={{ padding: '0', overflow: 'auto' }}>
                <Table 
                  responsive 
                  hover 
                  style={{ 
                    marginBottom: '0',
                    backgroundColor: themeStyles.tableBg
                  }}
                >
                  <thead>
                    <tr style={{ 
                      backgroundColor: themeStyles.tableHeaderBg,
                      color: '#ffffff'
                    }}>
                      <th style={{ padding: '15px', fontWeight: '600', textAlign: 'right' }}>Actions</th>
                      <th style={{ padding: '15px', fontWeight: '600', textAlign: 'right' }}>Sr.No</th>
                      <th style={{ padding: '15px', fontWeight: '600', minWidth: '300px', textAlign: 'right' }}>Material Description</th>
                      <th style={{ padding: '15px', fontWeight: '600', textAlign: 'right' }}>Unit</th>
                      <th style={{ padding: '15px', fontWeight: '600', textAlign: 'right' }}>Qty</th>
                      <th style={{ padding: '15px', fontWeight: '600', textAlign: 'right' }}>Add</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materialRows.map((row, rowIndex) => (
                      <React.Fragment key={row.id}>
                        {/* Main Row */}
                        <tr style={{ 
                          backgroundColor: rowIndex % 2 === 0 ? themeStyles.tableRowBg : themeStyles.tableBg,
                          borderBottom: `2px solid ${themeStyles.cardBorder}`
                        }}>
                          <td style={{ 
                            padding: '15px', 
                            verticalAlign: 'right',
                            textAlign: 'right',
                            fontWeight: '600'
                          }}>
                            <Button
                              variant={expandedRows[row.id] ? 'danger' : 'success'}
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
                              {expandedRows[row.id] ? '×' : '+'}
                            </Button>
                          </td>
                          <td style={{ padding: '15px', verticalAlign: 'right', textAlign: 'right' }}>
                            {row.srNo}
                          </td>
                          <td style={{ padding: '15px', verticalAlign: 'right', textAlign:'right' }}>
                            {row.materialDescription}
                          </td>
                          <td style={{ 
                            padding: '15px', 
                            verticalAlign: 'right',
                            textAlign: 'right'
                          }}>
                            {row.unit && (
                              <Badge 
                                bg="warning" 
                                text="dark"
                                style={{
                                  padding: '8px 12px',
                                  fontSize: '13px',
                                  fontWeight: '600'
                                }}
                              >
                                {row.unit}
                              </Badge>
                            )}
                          </td>
                          <td style={{ 
                            padding: '15px', 
                            verticalAlign: 'right',
                            textAlign: 'right',
                            fontWeight: '600',
                            fontSize: '16px'
                          }}>
                            {row.qty}
                          </td>
                          <td style={{ 
                            padding: '15px', 
                            verticalAlign: 'right',
                            textAlign: 'right'
                          }}>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => addSubMaterial(row.id)}
                              disabled={!expandedRows[row.id]}
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
                        </tr>

                        {/* Sub-material Headers and Rows - only show if expanded */}
                        {expandedRows[row.id] && (
                          <>
                            {/* Sub-material Headers */}
                            <tr style={{ 
                              backgroundColor: '#667eea',
                              color: '#ffffff'
                            }}>
                              <th style={{ padding: '12px', fontWeight: '600', textAlign: 'center' }}>Remove</th>
                              <th colSpan="2" style={{ padding: '12px', fontWeight: '600' }}>Material Name</th>
                              <th style={{ padding: '12px', fontWeight: '600', textAlign: 'center' }}>Units</th>
                              <th style={{ padding: '12px', fontWeight: '600', textAlign: 'center' }}>Stock Qty</th>
                              <th style={{ padding: '12px', fontWeight: '600', textAlign: 'center' }}>Assign Stock</th>
                            </tr>

                            {/* Sub-material Rows */}
                            {row.subMaterials.map((subMaterial, subIndex) => (
                              <tr 
                                key={subMaterial.id}
                                style={{ 
                                  backgroundColor: theme === 'dark' ? '#383d47' : '#f8f9fa',
                                  borderBottom: `1px solid ${themeStyles.cardBorder}`
                                }}
                              >
                                <td style={{ padding: '12px', textAlign: 'right' }}>
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
                                <td colSpan="2" style={{ padding: '12px' }}>
                                  <Select
                                    value={subMaterial.materialName}
                                    options={materialOptions}
                                    onChange={(selected) => handleSubMaterialChange(row.id, subMaterial.id, 'materialName', selected)}
                                    styles={getSelectStyles()}
                                    placeholder="Select Material Name"
                                    isClearable
                                    isSearchable
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                  />
                                </td>
                                <td style={{ padding: '12px' }}>
                                  <Select
                                    value={subMaterial.unit}
                                    options={unitOptions}
                                    onChange={(selected) => handleSubMaterialChange(row.id, subMaterial.id, 'unit', selected)}
                                    styles={getSelectStyles(true)}
                                    placeholder="Unit"
                                    isClearable={false}
                                    isSearchable
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                  />
                                </td>
                                <td style={{ padding: '12px' }}>
                                  <Form.Control
                                    type="number"
                                    value={subMaterial.stockQty}
                                    onChange={(e) => handleSubMaterialChange(row.id, subMaterial.id, 'stockQty', e.target.value)}
                                    placeholder="0"
                                    style={{
                                      backgroundColor: themeStyles.inputBg,
                                      color: themeStyles.inputColor,
                                      border: `1px solid ${themeStyles.inputBorder}`,
                                      borderRadius: '6px',
                                      textAlign: 'right'
                                    }}
                                  />
                                </td>
                                <td style={{ padding: '12px' }}>
                                  <Form.Control
                                    type="number"
                                    value={subMaterial.assignStock}
                                    onChange={(e) => handleSubMaterialChange(row.id, subMaterial.id, 'assignStock', e.target.value)}
                                    placeholder="0"
                                    style={{
                                      backgroundColor: themeStyles.inputBg,
                                      color: themeStyles.inputColor,
                                      border: `1px solid ${themeStyles.inputBorder}`,
                                      borderRadius: '6px',
                                      textAlign: 'right'
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
              </Card.Body>
            </Card>

            {/* Action Button */}
            <div className="text-center mt-4">
              <Button
                variant="danger"
                size="lg"
                onClick={handleAdjustMaterial}
                disabled={loading}
                style={{
                  padding: '15px 50px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  borderRadius: '12px',
                  backgroundColor: '#ff6b35',
                  border: 'none',
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
      </Container>
    </div>
  );
};

export default MaterialReplaceToStock;