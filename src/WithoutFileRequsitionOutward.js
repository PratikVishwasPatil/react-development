import React, { useState, useEffect } from 'react';
import Select from 'react-select';

const RequisitionOutwardForm = () => {
  const [materialTypes, setMaterialTypes] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [components, setComponents] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [todayOutwardData, setTodayOutwardData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMaterialTypes();
    fetchFileList();
    fetchEmployees();
    fetchTodayOutwardData();
  }, []);

  const fetchMaterialTypes = async () => {
    try {
      const response = await fetch('https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/GetMaterialType.php');
      const data = await response.json();
      if (data.status === 'success') {
        const options = data.materials.map(m => ({
          value: m.main_material_type_id,
          label: m.main_material_name
        }));
        setMaterialTypes(options);
      }
    } catch (error) {
      console.error('Error fetching material types:', error);
    }
  };

  const fetchFileList = async () => {
    try {
      const response = await fetch('https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/file_master.php');
      const data = await response.json();
      if (data.status === 'success') {
        const options = [
          { value: 'Nofile', label: 'No File' },
          ...data.files.map(f => ({
            value: f.FILE_ID,
            label: f.FILE_NAME
          }))
        ];
        setFileList(options);
      }
    } catch (error) {
      console.error('Error fetching file list:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch('https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/getEmployeeApi.php');
      const data = await response.json();
      if (data.status === true) {
        const options = data.data.map(e => ({
          value: e.id,
          label: e.name
        }));
        setEmployees(options);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchTodayOutwardData = async () => {
    try {
      const response = await fetch('https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/getTodayOutwardStockApi.php');
      const data = await response.json();
      if (data.status === 'success') {
        setTodayOutwardData(data.data);
      }
    } catch (error) {
      console.error('Error fetching today outward data:', error);
    }
  };

  const handleMaterialChange = async (option) => {
    setSelectedMaterial(option);
    setSelectedComponent(null);
    setStockData([]);
    
    if (!option) return;

    try {
      const response = await fetch(`https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/getMaterialComponentApi.php?material=${option.value}`);
      const data = await response.json();
      if (data.status === 'success') {
        setComponents(data.data);
      }
    } catch (error) {
      console.error('Error fetching components:', error);
    }
  };

  const handleComponentChange = async (option) => {
    setSelectedComponent(option);
    
    if (!option) {
      setStockData([]);
      return;
    }
  
    const [materialId, componentName] = option.value.split('@');
    
    try {
      setLoading(true);
      const response = await fetch(
        `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/getMaterialOutwardApi.php?matrial=${encodeURIComponent(option.value)}&id=${materialId}&initial=${encodeURIComponent(componentName)}`
      );
      const data = await response.json();
      if (data.status === 'success' && data.data.length > 0) {
        // Extract employees and units from the first item (they're the same for all)
        const firstItem = data.data[0];
        
        // Map employees to Select options format
        if (firstItem.employees) {
          const employeeOptions = firstItem.employees.map(emp => ({
            value: emp.employee_id,
            label: emp.name
          }));
          setEmployees(employeeOptions);
        }
        
        // Map units to Select options format
        if (firstItem.units) {
          const unitOptions = firstItem.units.map(unit => ({
            value: unit.id,
            label: unit.unit
          }));
          // Store units in state if you need a separate units state
          // setUnits(unitOptions);
        }
        
        const transformedData = data.data.map(item => ({
          ...item,
          stock: parseFloat(item.stock) || 0,
          fileNo: null,
          employee: null,
          materialType: null,
          outwardQty: '',
          reqNo: '',
          reqDate: '',
          totalWt: '0.00',
          unit: item.unit || 'NOS',
          ratePerUnit: parseFloat(item.rate) || 0,
          existingStock: parseFloat(item.stock) || 0,
          gst: item.gst || 18,
          grandValue: '0.00',
          unitOptions: item.units ? item.units.map(u => ({ value: u.id, label: u.unit })) : []
        }));
        setStockData(transformedData);
      }
    } catch (error) {
      console.error('Error fetching stock data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStockRow = (index, field, value) => {
    const newData = [...stockData];
    newData[index][field] = value;
    
    if (field === 'outwardQty') {
      const outwardQty = parseFloat(value) || 0;
      const existingStock = newData[index].existingStock;
      newData[index].stock = existingStock - outwardQty;
      
      const rate = parseFloat(newData[index].ratePerUnit) || 0;
      const weight = parseFloat(newData[index].weight_kg) || 0;
      newData[index].totalWt = (outwardQty * weight).toFixed(2);
      
      const subtotal = outwardQty * rate;
      const gst = parseFloat(newData[index].gst) || 0;
      const gstAmount = (subtotal * gst) / 100;
      newData[index].grandValue = (subtotal + gstAmount).toFixed(2);
    }
    
    setStockData(newData);
  };

  const handleSubmit = async () => {
    const validRows = stockData.filter(row => parseFloat(row.outwardQty) > 0);
    
    if (validRows.length === 0) {
      alert('Please enter at least one outward quantity');
      return;
    }

    // Prepare data for submission
    const payload = {
      materialId: validRows.map(row => row.material_id),
      outward: validRows.map(row => row.outwardQty),
      materialType: validRows.map(row => row.materialType?.value || selectedMaterial.value),
      employee: validRows.map(row => row.employee?.value || ''),
      fileNo: validRows.map(row => row.fileNo?.value || 'Nofile'),
      reqNo: validRows.map(row => row.reqNo),
      reqDate: validRows.map(row => row.reqDate),
      rate: validRows.map(row => row.ratePerUnit),
      username: 'SYSTEM'
    };

    try {
      setLoading(true);
      const response = await fetch('https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/saveOutwardStockApi.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (result.status) {
        alert(`Success! ${result.inserted_records || 'Records'} saved.`);
        await fetchTodayOutwardData();
        setStockData([]);
        setSelectedComponent(null);
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      console.error('Error submitting data:', error);
      alert('Error submitting data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      padding: '4px',
      border: state.isFocused ? '2px solid #ff6b6b' : '2px solid #dee2e6',
      borderRadius: '8px',
      fontSize: '15px',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#ff6b6b'
      }
    }),
    option: (provided, state) => ({
      ...provided,
      fontSize: '14px',
      backgroundColor: state.isSelected ? '#ff6b6b' : state.isFocused ? '#fff3e0' : 'white',
      color: state.isSelected ? 'white' : '#212529',
      cursor: 'pointer'
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 100
    })
  };

  const smallSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: '34px',
      border: '1px solid #ced4da',
      borderRadius: '6px',
      fontSize: '13px',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#ff6b6b'
      }
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: '0 8px'
    }),
    input: (provided) => ({
      ...provided,
      margin: '0',
      padding: '0'
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      height: '34px'
    }),
    option: (provided, state) => ({
      ...provided,
      fontSize: '13px',
      backgroundColor: state.isSelected ? '#ff6b6b' : state.isFocused ? '#fff3e0' : 'white',
      color: state.isSelected ? 'white' : '#212529'
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 1000
    })
  };

  return (
    <div style={{ 
      padding: '0', 
      backgroundColor: '#f8f9fa', 
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%)',
        color: 'white',
        padding: '16px 24px',
        fontSize: '20px',
        fontWeight: '700',
        letterSpacing: '0.5px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        REQUISITION OUTWARD
      </div>

      <div style={{ padding: '16px' }}>
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          marginBottom: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          border: '1px solid #e9ecef'
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '20px' 
          }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '10px', 
                fontWeight: '600',
                fontSize: '14px',
                color: '#495057',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                AMC
              </label>
              <Select
                value={selectedMaterial}
                onChange={handleMaterialChange}
                options={materialTypes}
                placeholder="Select Material Type"
                isClearable
                styles={customSelectStyles}
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '10px', 
                fontWeight: '600',
                fontSize: '14px',
                color: '#495057',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                AMC OTHER
              </label>
              <Select
                value={selectedComponent}
                onChange={handleComponentChange}
                options={components}
                placeholder="Select Component"
                isClearable
                isDisabled={!selectedMaterial}
                styles={customSelectStyles}
              />
            </div>
          </div>
        </div>

        {stockData.length > 0 && (
          <div style={{
            backgroundColor: 'white',
            padding: '0',
            marginBottom: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            border: '1px solid #e9ecef'
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '2px solid #e9ecef',
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
            }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: '16px',
                fontWeight: '700',
                color: '#495057',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Requisition
              </h3>
            </div>
            
            <div style={{ 
              overflowX: 'auto',
              overflowY: 'auto',
              maxHeight: '500px'
            }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse', 
                fontSize: '13px',
                minWidth: '2000px'
              }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                  <tr style={{ 
                    background: 'linear-gradient(135deg, #ff9966 0%, #ff8c5a 100%)',
                    color: 'white'
                  }}>
                    <th style={{ padding: '14px 10px', textAlign: 'left', fontWeight: '600', minWidth: '200px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Description</th>
                    <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: '600', minWidth: '80px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Stock</th>
                    <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: '600', minWidth: '80px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>HSN</th>
                    <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: '600', minWidth: '150px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>File No</th>
                    <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: '600', minWidth: '180px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Employee</th>
                    <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: '600', minWidth: '150px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Material Type</th>
                    <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: '600', minWidth: '100px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Outward Qty</th>
                    <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: '600', minWidth: '100px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>REQ. No.</th>
                    <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: '600', minWidth: '130px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>REQ. Date</th>
                    <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: '600', minWidth: '90px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Total Wt.</th>
                    <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: '600', minWidth: '70px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Unit</th>
                    <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: '600', minWidth: '90px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Rate/ Unit</th>
                    <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: '600', minWidth: '100px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Existing Stock Qty</th>
                    <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: '600', minWidth: '70px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>GST</th>
                    <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: '600', minWidth: '120px' }}>Existing Stock Grand Value</th>
                  </tr>
                </thead>
                <tbody>
                  {stockData.map((item, index) => (
                    <tr key={index} style={{ 
                      backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa'
                    }}>
                      <td style={{ padding: '10px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef' }}>
                        {item.description}
                      </td>
                      <td style={{ 
                        padding: '10px', 
                        borderBottom: '1px solid #e9ecef', 
                        borderRight: '1px solid #e9ecef', 
                        textAlign: 'right',
                        color: item.stock < 0 ? '#dc3545' : item.stock === 0 ? '#ff9800' : '#28a745',
                        fontWeight: '600'
                      }}>
                        {item.stock}
                      </td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef', textAlign: 'right' }}>
                        {item.hsn}
                      </td>
                      <td style={{ padding: '6px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef' }}>
                        <Select
                          value={item.fileNo}
                          onChange={(option) => updateStockRow(index, 'fileNo', option)}
                          options={fileList}
                          placeholder="Select File"
                          isClearable
                          styles={smallSelectStyles}
                        />
                      </td>
                      <td style={{ padding: '6px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef' }}>
                        <Select
                          value={item.employee}
                          onChange={(option) => updateStockRow(index, 'employee', option)}
                          options={employees}
                          placeholder="Select Employee"
                          isClearable
                          styles={smallSelectStyles}
                        />
                      </td>
                      <td style={{ padding: '6px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef' }}>
                        <Select
                          value={item.materialType}
                          onChange={(option) => updateStockRow(index, 'materialType', option)}
                          options={materialTypes}
                          placeholder="Select Type"
                          isClearable
                          styles={smallSelectStyles}
                        />
                      </td>
                      <td style={{ padding: '6px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef' }}>
                        <input
                          type="number"
                          value={item.outwardQty}
                          onChange={(e) => updateStockRow(index, 'outwardQty', e.target.value)}
                          placeholder="0"
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #ced4da',
                            borderRadius: '6px',
                            fontSize: '13px',
                            textAlign: 'right',
                            outline: 'none'
                          }}
                        />
                      </td>
                      <td style={{ padding: '6px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef' }}>
                        <input
                          type="text"
                          value={item.reqNo}
                          onChange={(e) => updateStockRow(index, 'reqNo', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #ced4da',
                            borderRadius: '6px',
                            fontSize: '13px',
                            textAlign: 'right',
                            outline: 'none'
                          }}
                        />
                      </td>
                      <td style={{ padding: '6px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef' }}>
                        <input
                          type="date"
                          value={item.reqDate}
                          onChange={(e) => updateStockRow(index, 'reqDate', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #ced4da',
                            borderRadius: '6px',
                            fontSize: '13px',
                            outline: 'none'
                          }}
                        />
                      </td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef', textAlign: 'right', fontWeight: '500' }}>
                        {item.totalWt}
                      </td>
                      <td style={{ padding: '6px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef' }}>
  <Select
    value={item.unitOptions?.find(opt => opt.label === item.unit)}
    onChange={(option) => updateStockRow(index, 'unit', option?.label || 'NOS')}
    options={item.unitOptions || []}
    placeholder="Select Unit"
    styles={smallSelectStyles}
  />
</td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef', textAlign: 'right', fontWeight: '500' }}>
                        {parseFloat(item.ratePerUnit).toFixed(2)}
                      </td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef', textAlign: 'right', fontWeight: '600', color: '#007bff' }}>
                        {item.existingStock}
                      </td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef', textAlign: 'right' }}>
                        {item.gst}
                      </td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #e9ecef', textAlign: 'right', fontWeight: '600', color: '#28a745' }}>
                        {item.grandValue}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ 
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              borderTop: '2px solid #e9ecef',
              backgroundColor: '#f8f9fa'
            }}>
              <div style={{ fontSize: '13px', color: '#6c757d', textAlign: 'right' }}>
                Showing 1 to {stockData.length} of {stockData.length} entries
              </div>
              <button
                onClick={handleSubmit}
                style={{
                  padding: '12px 36px',
                  background: 'linear-gradient(135deg, #ff6347 0%, #ff4500 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '700',
                  boxShadow: '0 4px 12px rgba(255, 99, 71, 0.3)',
                  transition: 'all 0.3s',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  width: '100%',
                  maxWidth: '300px',
                  margin: '0 auto'
                }}
              >
                Submit
              </button>
            </div>
          </div>
        )}

        <div style={{
          backgroundColor: 'white',
          padding: '0',
          borderRadius: '12px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          border: '1px solid #e9ecef'
        }}>
          <div style={{
            padding: '20px 24px',
            borderBottom: '2px solid #e9ecef',
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
          }}>
            <h3 style={{ 
              margin: 0, 
              fontSize: '18px',
              fontWeight: '700',
              color: '#495057',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Today's Requisition Outward Data
            </h3>
          </div>
          
          <div style={{ 
            overflowX: 'auto',
            overflowY: 'auto',
            maxHeight: '400px'
          }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse', 
              fontSize: '13px',
              minWidth: '1600px'
            }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                <tr style={{ 
                  background: 'linear-gradient(135deg, #ff9966 0%, #ff8c5a 100%)',
                  color: 'white'
                }}>
                  <th style={{ padding: '14px 12px', textAlign: 'left', fontWeight: '600', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Description</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right', fontWeight: '600', borderRight: '1px solid rgba(255,255,255,0.2)' }}>File No</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right', fontWeight: '600', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Requisition By</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right', fontWeight: '600', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Material Type</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right', fontWeight: '600', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Outward Qty</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right', fontWeight: '600', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Req No</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right', fontWeight: '600', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Req Date</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right', fontWeight: '600', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Unit</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right', fontWeight: '600', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Rate</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right', fontWeight: '600', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Grand Value</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right', fontWeight: '600', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Stock</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right', fontWeight: '600' }}>Assigned By</th>
                </tr>
              </thead>
              <tbody>
                {todayOutwardData.length === 0 ? (
                  <tr>
                    <td colSpan="12" style={{ 
                      padding: '60px 20px', 
                      textAlign: 'right',
                      color: '#6c757d',
                      fontSize: '15px'
                    }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>📦</div>
                      <div style={{ fontWeight: '600', marginBottom: '8px' }}>No outward data for today</div>
                      <div style={{ fontSize: '13px' }}>Data will appear here once entries are submitted</div>
                    </td>
                  </tr>
                ) : (
                  todayOutwardData.map((item, idx) => (
                    <tr key={idx} style={{ 
                      backgroundColor: idx % 2 === 0 ? 'white' : '#f8f9fa'
                    }}>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef' }}>{item.material}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef', textAlign: 'right' }}>{item.file_name}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef', textAlign: 'right' }}>{item.requested_by}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef', textAlign: 'right' }}>{item.category}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef', textAlign: 'right', fontWeight: '600', color: '#007bff' }}>{item.quantity}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef', textAlign: 'right' }}>{item.req_no}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef', textAlign: 'right' }}>{item.req_date}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef', textAlign: 'right' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          backgroundColor: '#fff3cd',
                          color: '#856404',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {item.unit || 'NOS'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef', textAlign: 'right', fontWeight: '500' }}>{parseFloat(item.rate).toFixed(2)}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef', textAlign: 'right', fontWeight: '600', color: '#28a745' }}>{parseFloat(item.value).toFixed(2)}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef', textAlign: 'right', fontWeight: '600', color: '#007bff' }}>{item.stock}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', textAlign: 'right' }}>{item.issued_by}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {loading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px 50px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            textAlign: 'right'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '5px solid #f3f3f3',
              borderTop: '5px solid #ff6b6b',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }} />
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#495057' }}>
              Loading...
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default RequisitionOutwardForm