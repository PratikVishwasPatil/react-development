import React, { useState, useEffect } from 'react';
import Select from 'react-select';

const RequisitionInwardForm = () => {
  const [materialTypes, setMaterialTypes] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [components, setComponents] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [todayInwardData, setTodayInwardData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [makeList, setMakeList] = useState([]);

  useEffect(() => {
    fetchMaterialTypes();
    fetchFileList();
    fetchSuppliers();
    fetchTodayInwardData();
    fetchMakeList();
  }, []);

  const fetchMakeList = async () => {
    try {
      const response = await fetch('https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/getMaterialMakeApi.php');
      const data = await response.json();
      if (data.status === true) {
        const options = data.data.map(m => ({
          value: m.make,
          label: m.make
        }));
        setMakeList(options);
      }
    } catch (error) {
      console.error('Error fetching make list:', error);
    }
  };

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

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/getSuppliersApi.php');
      const data = await response.json();
      if (data.status === true) {
        // alert(setSuppliers(options));
        const options = data.data.map(s => ({
          value: s.id,
          label: s.name
        }));
        setSuppliers(options);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const fetchTodayInwardData = async () => {
    try {
      const response = await fetch('https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/getTodayInwardStockApi.php');
      const data = await response.json();
      if (data.status === 'success') {
        setTodayInwardData(data.data);
      }
    } catch (error) {
      console.error('Error fetching today inward data:', error);
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
        `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/getMaterialStockAndInwardApi.php?mname=${encodeURIComponent(componentName)}&id=${materialId}`
      );
      const data = await response.json();
      if (data.status === 'success') {
        const transformedData = data.data.map(item => ({
          ...item,
          inwardQty: '',
          totalStock: parseFloat(item.stock) || 0,
          grnNo: 'NOS',
          grnDate: '',
          fileNo: null,
          challanNo: '',
          challanDate: '',
          supplier: null,
          makeName: null,
          wtPerUnit: parseFloat(item.weight) || 0,
          ratePerUnit: parseFloat(item.rate) || 0,
          value: '0.00'
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
    
    if (field === 'inwardQty') {
      const stock = parseFloat(newData[index].stock) || 0;
      const inwardQty = parseFloat(value) || 0;
      newData[index].totalStock = stock + inwardQty;
      
      const rate = parseFloat(newData[index].ratePerUnit) || 0;
      newData[index].value = (inwardQty * rate).toFixed(2);
    }
    
    if (field === 'ratePerUnit') {
      const inwardQty = parseFloat(newData[index].inwardQty) || 0;
      const rate = parseFloat(value) || 0;
      newData[index].value = (inwardQty * rate).toFixed(2);
    }
    
    setStockData(newData);
  };

  const handleSubmit = async () => {
    const validRows = stockData.filter(row => parseFloat(row.inwardQty) > 0);
    
    if (validRows.length === 0) {
      alert('Please enter at least one inward quantity');
      return;
    }

    // Prepare data according to PHP API structure
    const payload = {
      matrialId: validRows.map(row => row.material_id),
      inward: validRows.map(row => row.inwardQty),
      materialtype: selectedMaterial.value,
      makename: validRows.map(row => row.makeName?.value || ''),
      grnno: validRows.map(row => row.grnNo),
      grndate: validRows.map(row => row.grnDate),
      supplier: validRows.map(row => row.supplier?.value || ''),
      fileInward: validRows.map(row => row.fileNo?.value || 'Nofile'),
      chalanno: validRows.map(row => row.challanNo),
      chalandate: validRows.map(row => row.challanDate),
      rate: validRows.map(row => row.ratePerUnit),
      username: 'SYSTEM'
    };

    try {
      setLoading(true);
      const response = await fetch('https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/saveInwardStockApi.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (result.status) {
        alert(`Success! ${result.inserted_records} records inserted.`);
        // Refresh today's inward data
        await fetchTodayInwardData();
        // Reset form
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

  const handleUpdateClick = (index) => {
    setEditingRow(index);
  };

  const handleSaveEdit = async (index) => {
    const row = todayInwardData[index];
    
    const formData = new FormData();
    formData.append('inward', row.inward_qty);
    formData.append('rate', row.rate_per_unit || row.rate);
    formData.append('id', row.quantity_id);
    formData.append('mid', row.material_id);

    try {
      setLoading(true);
      const response = await fetch('https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/updateInwardRateApi.php', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.status) {
        alert('Changes saved successfully!');
        setEditingRow(null);
        await fetchTodayInwardData();
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      console.error('Error updating data:', error);
      alert('Error updating data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingRow(null);
    fetchTodayInwardData();
  };

  const updateTodayInwardRow = (index, field, value) => {
    const newData = [...todayInwardData];
    newData[index][field] = value;
    
    if (field === 'rate_per_unit' || field === 'inward_qty') {
      const qty = parseFloat(newData[index].inward_qty) || 0;
      const rate = parseFloat(newData[index].rate_per_unit || newData[index].rate) || 0;
      newData[index].value = (qty * rate).toFixed(2);
    }
    
    setTodayInwardData(newData);
  };

  const deleteInwardRow = async (quantityId, materialId) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;

    const formData = new FormData();
    formData.append('id', quantityId);
    formData.append('mid', materialId);

    try {
      setLoading(true);
      const response = await fetch('https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/deleteInwardApi.php', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.status) {
        alert('Record deleted successfully!');
        await fetchTodayInwardData();
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      console.error('Error deleting data:', error);
      alert('Error deleting data. Please try again.');
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
        REQUISITION INWARD
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
                    <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: '600', minWidth: '80px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>HSN</th>
                    <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: '600', minWidth: '80px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Stock</th>
                    <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: '600', minWidth: '100px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Inward Qty</th>
                    <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: '600', minWidth: '100px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Total Stock</th>
                    <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: '600', minWidth: '70px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Unit</th>
                    {selectedMaterial?.value === '19' && (
                      <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: '600', minWidth: '150px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Make</th>
                    )}
                    <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: '600', minWidth: '90px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>GRN No</th>
                    <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: '600', minWidth: '130px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>GRN Date</th>
                    <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: '600', minWidth: '180px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>File No</th>
                    <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: '600', minWidth: '100px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Chalan No</th>
                    <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: '600', minWidth: '130px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Chalan Date</th>
                    <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: '600', minWidth: '200px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Supplier</th>
                    <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: '600', minWidth: '90px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Wt Per Unit</th>
                    <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: '600', minWidth: '90px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Rate Per Unit</th>
                    <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: '600', minWidth: '90px' }}>Value</th>
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
                      <td style={{ padding: '10px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef', textAlign: 'right' }}>
                        {item.hsn}
                      </td>
                      <td style={{ 
                        padding: '10px', 
                        borderBottom: '1px solid #e9ecef', 
                        borderRight: '1px solid #e9ecef', 
                        textAlign: 'right',
                        color: item.stock === 0 ? '#ff9800' : '#212529',
                        fontWeight: item.stock === 0 ? '600' : '400'
                      }}>
                        {item.stock}
                      </td>
                      <td style={{ padding: '6px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef' }}>
                        <input
                          type="number"
                          value={item.inwardQty}
                          onChange={(e) => updateStockRow(index, 'inwardQty', e.target.value)}
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
                      <td style={{ padding: '10px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef', textAlign: 'right', fontWeight: '600', color: '#28a745' }}>
                        {item.totalStock}
                      </td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef', textAlign: 'right' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          backgroundColor: '#fff3cd',
                          color: '#856404',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {item.unit}
                        </span>
                      </td>
                      {selectedMaterial?.value === '19' && (
                        <td style={{ padding: '6px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef' }}>
                          <Select
                            value={item.makeName}
                            onChange={(option) => updateStockRow(index, 'makeName', option)}
                            options={makeList}
                            placeholder="Select Make"
                            isClearable
                            styles={smallSelectStyles}
                          />
                        </td>
                      )}
                      <td style={{ padding: '6px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef' }}>
                        <input
                          type="text"
                          value=""
                          onChange={(e) => updateStockRow(index, 'grnNo', e.target.value)}
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
                          value={item.grnDate}
                          onChange={(e) => updateStockRow(index, 'grnDate', e.target.value)}
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
                        <input
                          type="text"
                          value={item.challanNo}
                          onChange={(e) => updateStockRow(index, 'challanNo', e.target.value)}
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
                      <td style={{ padding: '6px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef' }}>
                        <input
                          type="date"
                          value={item.challanDate}
                          onChange={(e) => updateStockRow(index, 'challanDate', e.target.value)}
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
                      <td style={{ padding: '6px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef' }}>
                        <Select
                          value={item.supplier}
                          onChange={(option) => updateStockRow(index, 'supplier', option)}
                          options={suppliers}
                          placeholder="Select Supplier"
                          isClearable
                          styles={smallSelectStyles}
                        />
                      </td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef', textAlign: 'right' }}>
                        {item.wtPerUnit}
                      </td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef', textAlign: 'right', fontWeight: '500' }}>
                        {parseFloat(item.ratePerUnit).toFixed(2)}
                      </td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #e9ecef', textAlign: 'right', fontWeight: '600', color: '#007bff' }}>
                        {item.value}
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
              Today's Inward Data
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
                  <th style={{ padding: '14px 12px', textAlign: 'right', fontWeight: '600', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Make</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right', fontWeight: '600', borderRight: '1px solid rgba(255,255,255,0.2)' }}>File No</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right', fontWeight: '600', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Inward Qty</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right', fontWeight: '600', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Total Stock</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right', fontWeight: '600', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Unit</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right', fontWeight: '600', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Wt Per Unit</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right', fontWeight: '600', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Rate Per Unit</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right', fontWeight: '600', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Value</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right', fontWeight: '600', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Inserted By</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right', fontWeight: '600', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Update</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right', fontWeight: '600' }}>Delete</th>
                </tr>
              </thead>
              <tbody>
                {todayInwardData.length === 0 ? (
                  <tr>
                    <td colSpan="12" style={{ 
                      padding: '60px 20px', 
                      textAlign: 'right',
                      color: '#6c757d',
                      fontSize: '15px'
                    }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>📦</div>
                      <div style={{ fontWeight: '600', marginBottom: '8px' }}>No inward data for today</div>
                      <div style={{ fontSize: '13px' }}>Data will appear here once entries are submitted</div>
                    </td>
                  </tr>
                ) : (
                  todayInwardData.map((item, idx) => (
                    <tr key={idx} style={{ 
                      backgroundColor: idx % 2 === 0 ? 'white' : '#f8f9fa'
                    }}>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef' }}>{item.description}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef', textAlign: 'right' }}>{item.make || '-'}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef', textAlign: 'right' }}>{item.file_name}</td>
                      <td style={{ padding: '6px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef' }}>
                        {editingRow === idx ? (
                          <input
                            type="number"
                            value={item.inward_qty}
                            onChange={(e) => updateTodayInwardRow(idx, 'inward_qty', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '6px',
                              border: '2px solid #ff6b6b',
                              borderRadius: '4px',
                              fontSize: '13px',
                              textAlign: 'right'
                            }}
                          />
                        ) : (
                          <div style={{ textAlign: 'right', fontWeight: '600', color: '#007bff' }}>{item.inward_qty}</div>
                        )}
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef', textAlign: 'right', fontWeight: '600', color: '#28a745' }}>{item.stock}</td>
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
                          {item.unit}
                        </span>
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef', textAlign: 'right' }}>{item.weight}</td>
                      <td style={{ padding: '6px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef' }}>
                        {editingRow === idx ? (
                          <input
                            type="number"
                            step="0.01"
                            value={item.rate_per_unit || item.rate}
                            onChange={(e) => updateTodayInwardRow(idx, 'rate_per_unit', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '6px',
                              border: '2px solid #ff6b6b',
                              borderRadius: '4px',
                              fontSize: '13px',
                              textAlign: 'right'
                            }}
                          />
                        ) : (
                          <div style={{ textAlign: 'right', fontWeight: '500' }}>{parseFloat(item.rate_per_unit || item.rate).toFixed(2)}</div>
                        )}
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef', textAlign: 'right', fontWeight: '600', color: '#007bff' }}>{item.value}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef', textAlign: 'right' }}>{item.inserted_by}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef', textAlign: 'right' }}>
                        {editingRow === idx ? (
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                            <button
                              onClick={() => handleSaveEdit(idx)}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '600'
                              }}
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#6c757d',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '600'
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleUpdateClick(idx)}
                            style={{
                              padding: '6px 16px',
                              backgroundColor: '#007bff',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}
                          >
                            Update
                          </button>
                        )}
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', textAlign: 'right' }}>
                        <button
                          onClick={() => deleteInwardRow(item.quantity_id, item.material_id)}
                          style={{
                            padding: '6px 16px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                        >
                          Delete
                        </button>
                      </td>
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

export default RequisitionInwardForm;