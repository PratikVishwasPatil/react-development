import React, { useState, useEffect } from 'react';
import Select from 'react-select';

const DCOutwardForm = () => {
  const [materialTypes, setMaterialTypes] = useState([]);
  const [driveItemsTypes, setDriveItemsTypes] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [selectedDriveItem, setSelectedDriveItem] = useState(null);
  const [stockData, setStockData] = useState([]);
  const [todayOutwardData, setTodayOutwardData] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFileList();
    fetchVendors();
    fetchMaterialTypes();
    fetchTodayOutwardData();
  }, []);

  const fetchFileList = async () => {
    try {
      const response = await fetch('https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/file_master.php');
      const data = await response.json();
      if (data.status === 'success') {
        const options = [
          { value: 'Stock', label: 'Stock' },
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

  const fetchVendors = async () => {
    try {
      const response = await fetch('https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/getVendorOutwardApi.php');
      const data = await response.json();
      if (data.status === true) {
        const options = data.data.map(v => ({
          value: v.id,
          label: v.name
        }));
        setVendors(options);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
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

  const fetchTodayOutwardData = async () => {
    try {
      const response = await fetch('https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/getTodayOutwardStockApi.php');
      const data = await response.json();
      if (data.status === true) {
        setTodayOutwardData(data.data);
      }
    } catch (error) {
      console.error('Error fetching today outward data:', error);
    }
  };

  const handleMaterialChange = async (option) => {
    setSelectedMaterial(option);
    setSelectedDriveItem(null);
    setStockData([]);
    
    if (!option) return;

    try {
      const response = await fetch(`https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/getMaterialComponentApi.php?material=${option.value}`);
      const data = await response.json();
      if (data.status === 'success') {
        setDriveItemsTypes(data.data);
      }
    } catch (error) {
      console.error('Error fetching components:', error);
    }
  };

  const handleDriveItemChange = async (option) => {
    setSelectedDriveItem(option);
    setStockData([]);
    
    if (!option) return;

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
          outwardQty: '',
          fileNo: null,
          vendor: null,
          materialType: null,
          dcNo: '',
          dcDate: '',
          ratePerUnit: parseFloat(item.rate) || 0,
          existingStockQty: parseFloat(item.stock) || 0,
          gst: item.gst_rate || '18',
          existingStockGrandValue: '0.00'
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
    setStockData(newData);
  };

  const handleSubmit = async () => {
    const validRows = stockData.filter(row => parseFloat(row.outwardQty) > 0);
    
    if (validRows.length === 0) {
      alert('Please enter at least one outward quantity');
      return;
    }

    alert('Submit functionality to be implemented based on your API endpoint');
  };

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      padding: '4px',
      border: state.isFocused ? '2px solid #ff6600' : '2px solid #dee2e6',
      borderRadius: '8px',
      fontSize: '15px',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#ff6600'
      }
    }),
    option: (provided, state) => ({
      ...provided,
      fontSize: '14px',
      backgroundColor: state.isSelected ? '#ff6600' : state.isFocused ? '#fff3e0' : 'white',
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
        borderColor: '#ff6600'
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
      backgroundColor: state.isSelected ? '#ff6600' : state.isFocused ? '#fff3e0' : 'white',
      color: state.isSelected ? 'white' : '#212529',
      padding: '8px 12px'
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
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #ff6600 0%, #ff5200 100%)',
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
        DC OUTWARD
      </div>

      <div style={{ padding: '16px', maxWidth: '100%' }}>
        {/* Selection Cards */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          marginBottom: '20px',
          border: '1px solid #e9ecef',
          borderRadius: '12px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
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
                Assembly
              </label>
              <Select
                value={selectedMaterial}
                onChange={handleMaterialChange}
                options={materialTypes}
                placeholder="Select Assembly"
                isClearable
                styles={customSelectStyles}
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600',
                fontSize: '13px',
                color: '#495057',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Drive Items Other
              </label>
              <Select
                value={selectedDriveItem}
                onChange={handleDriveItemChange}
                options={driveItemsTypes}
                placeholder="Select Drive Item"
                isClearable
                isDisabled={!selectedMaterial}
                styles={customSelectStyles}
              />
            </div>
          </div>
        </div>

        {/* Outward Table */}
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
                    <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: '600', minWidth: '80px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Stock</th>
                    <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: '600', minWidth: '80px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>HSN</th>
                    <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: '600', minWidth: '180px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>File No</th>
                    <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: '600', minWidth: '200px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Vendor</th>
                    <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: '600', minWidth: '180px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Material Type</th>
                    <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: '600', minWidth: '100px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Outward</th>
                    <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: '600', minWidth: '100px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Outward Qty</th>
                    <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: '600', minWidth: '120px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>DC/REQ No.</th>
                    <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: '600', minWidth: '130px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>DC/REQ Date</th>
                    <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: '600', minWidth: '90px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Total Wt</th>
                    <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: '600', minWidth: '70px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Unit</th>
                    <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: '600', minWidth: '90px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Rate/Unit</th>
                    <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: '600', minWidth: '70px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>GST</th>
                    <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: '600', minWidth: '100px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Stock Qty</th>
                    <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: '600', minWidth: '100px' }}>Stock Value</th>
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
                        color: item.stock === 0 ? '#ff9800' : '#212529',
                        fontWeight: item.stock === 0 ? '600' : '400'
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
                          placeholder="Select File No"
                          isClearable
                          styles={smallSelectStyles}
                        />
                      </td>
                      <td style={{ padding: '6px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef' }}>
                        <Select
                          value={item.vendor}
                          onChange={(option) => updateStockRow(index, 'vendor', option)}
                          options={vendors}
                          placeholder="Select Vendor"
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
                      <td style={{ padding: '10px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef', textAlign: 'right', fontWeight: '600' }}>
                        {item.outwardQty || 0}
                      </td>
                      <td style={{ padding: '6px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef' }}>
                        <input
                          type="text"
                          value={item.dcNo}
                          onChange={(e) => updateStockRow(index, 'dcNo', e.target.value)}
                          placeholder="DC Number"
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
                          value={item.dcDate}
                          onChange={(e) => updateStockRow(index, 'dcDate', e.target.value)}
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
                      <td style={{ padding: '10px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef', textAlign: 'right' }}>
                        {item.weight_kg || 1}
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
                      <td style={{ padding: '10px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef', textAlign: 'right', fontWeight: '500' }}>
                        {parseFloat(item.rate).toFixed(2)}
                      </td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef', textAlign: 'right' }}>
                        {item.gst}%
                      </td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef', textAlign: 'right' }}>
                        {item.existingStockQty}
                      </td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #e9ecef', textAlign: 'right', fontWeight: '600', color: '#007bff' }}>
                        {item.existingStockGrandValue}
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

        {/* Today's Outward Data */}
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
              Today's Outward Data
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
                  <th style={{ padding: '14px 12px', textAlign: 'right', fontWeight: '600', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Vendor</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right', fontWeight: '600', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Material Type</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right', fontWeight: '600', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Outward</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right', fontWeight: '600', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Outward Qty</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right', fontWeight: '600', borderRight: '1px solid rgba(255,255,255,0.2)' }}>DC No</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right', fontWeight: '600', borderRight: '1px solid rgba(255,255,255,0.2)' }}>DC Date</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right', fontWeight: '600', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Unit</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right', fontWeight: '600', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Rate</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right', fontWeight: '600', borderRight: '1px solid rgba(255,255,255,0.2)' }}>Grand Value</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right', fontWeight: '600' }}>Employee</th>
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
                      <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef' }}>{item.material_description}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef', textAlign: 'right' }}>{item.file_name}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef' }}>{item.customer_name}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef' }}>{item.category}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef', textAlign: 'right', fontWeight: '700', color: '#ff6600' }}>
                        {item.quantity_outward}
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef', textAlign: 'right', fontWeight: '600' }}>{item.quantity_outward}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef', textAlign: 'right' }}>{item.dc_no}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef', textAlign: 'right' }}>{item.dc_date}</td>
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
                      <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef', textAlign: 'right', fontWeight: '500' }}>{parseFloat(item.rate).toFixed(2)}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', borderRight: '1px solid #e9ecef', textAlign: 'right', fontWeight: '700', color: '#007bff' }}>
                        ₹{parseFloat(item.value).toFixed(2)}
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e9ecef', textAlign: 'right' }}>{item.employee}</td>
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
              borderTop: '5px solid #ff6600',
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
        
        @media (max-width: 768px) {
          table {
            font-size: 12px !important;
          }
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: #ff6600;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #e55a00;
        }
      `}</style>
    </div>
  );
};

const headerStyle = {
  padding: '14px 12px',
  textAlign: 'right',
  fontWeight: '700',
  color: 'white',
  borderRight: '1px solid rgba(255,255,255,0.3)',
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.3px',
  whiteSpace: 'nowrap'
};

const cellStyle = {
  padding: '10px 12px',
  borderBottom: '1px solid #e9ecef',
  borderRight: '1px solid #e9ecef',
  fontSize: '13px'
};

const inputStyle = {
  width: '100%',
  padding: '7px 10px',
  border: '1px solid #ced4da',
  borderRadius: '4px',
  fontSize: '13px',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box'
};

export default DCOutwardForm;