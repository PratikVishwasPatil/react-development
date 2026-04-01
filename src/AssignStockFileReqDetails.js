import React, { useState, useEffect } from 'react';
import { X, Plus, Calendar, Save, Printer, AlertCircle } from 'lucide-react';

const MaterialApprovalSystem = () => {
  const [theme, setTheme] = useState('light');
  const [activeTab, setActiveTab] = useState('raw');
  const [fileId, setFileId] = useState('');
  const [fileName, setFileName] = useState('S-25-065-KBA-Additional');
  const [rawData, setRawData] = useState([]);
  const [electricalData, setElectricalData] = useState([]);
  const [assemblyData, setAssemblyData] = useState([]);
  const [hardwareData, setHardwareData] = useState([]);
  const [materialOptions, setMaterialOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reqNo, setReqNo] = useState('REQ 1');
  const [reqDate, setReqDate] = useState(new Date().toISOString().split('T')[0]);
  const [isFullScreen, setIsFullScreen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [employeeId, setEmployeeId] = useState(1);
  const [selectedRows, setSelectedRows] = useState({});
  const [assignValues, setAssignValues] = useState({});
  const [saving, setSaving] = useState({});

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    const match = hash.match(/\/file-details-new\/(\d+)/);
    if (match) setFileId(match[1]);
  }, []);

  useEffect(() => {
    fetchMaterialOptions();
  }, []);

  useEffect(() => {
    if (fileId) fetchAllData();
  }, [fileId]);

  const fetchMaterialOptions = async () => {
    try {
      const response = await fetch('https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/MaterialListApi.php');
      const result = await response.json();
      if (result.status === 'success') setMaterialOptions(result.data);
    } catch (error) {
      console.error('Error fetching material options:', error);
      showToast('Error fetching material options', 'error');
    }
  };

  const fetchAllData = async () => {
    if (!fileId) return;
    setLoading(true);
    try {
      const [rawRes, electricalRes, assemblyRes, hardwareRes] = await Promise.all([
        fetch(`https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/getRawMaterialApprovalListApi.php?file_id=${fileId}`),
        fetch(`https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/getElectricalMaterialApprovalListApi.php?file_id=${fileId}`),
        fetch(`https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/getAssemblyMaterialApprovalListApi.php?file_id=${fileId}`),
        fetch(`https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/get_hardware_materialsApi.php?fileID=${fileId}&&revision=1`)
      ]);

      const [raw, electrical, assembly, hardware] = await Promise.all([
        rawRes.json(), electricalRes.json(), assemblyRes.json(), hardwareRes.json()
      ]);

      if (raw.status) setRawData(raw.data);
      if (electrical.status) setElectricalData(electrical.data);
      if (assembly.status) setAssemblyData(assembly.data);
      if (hardware.status) setHardwareData(hardware.data);
      
      showToast('Data loaded successfully', 'success');
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Error fetching data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'info') => {
    const toastEl = document.createElement('div');
    toastEl.textContent = message;
    toastEl.style.cssText = `
      position: fixed; top: 20px; right: 20px; padding: 12px 24px;
      background: ${type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#17a2b8'};
      color: white; border-radius: 4px; z-index: 9999;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1); animation: slideIn 0.3s ease-out;
    `;
    document.body.appendChild(toastEl);
    setTimeout(() => {
      toastEl.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => document.body.removeChild(toastEl), 300);
    }, 3000);
  };

  const handleAssignValueChange = (idx, value) => {
    setAssignValues(prev => ({
      ...prev,
      [idx]: value
    }));
  };

  const saveMaterialApproval = async (item, idx, apiType) => {
    const assignQty = parseFloat(assignValues[idx] || 0);
    
    if (!assignQty || assignQty <= 0) {
      showToast('Please enter a valid quantity', 'error');
      return;
    }

    if (!reqNo || !reqDate) {
      showToast('Please enter Req No and Date', 'error');
      return;
    }

    setSaving(prev => ({ ...prev, [idx]: true }));

    try {
      let apiUrl = '';
      let payload = {};

      switch (apiType) {
        case 'raw':
          apiUrl = 'https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/rawMaterialRequestionApprovalApi.php';
          payload = {
            value: assignQty,
            typeRaw: item.type,
            idRaw: item.id,
            mRaw: item.material_id,
            fileID: fileId,
            reqNo: reqNo,
            reqDate: reqDate,
            employee_id: employeeId
          };
          break;

        case 'electrical':
          apiUrl = 'https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/electricalRawMaterialRequestionApprovalApi.php';
          payload = {
            value: assignQty,
            type: item.type,
            id: item.id,
            Mid: item.material_id,
            fileID: fileId,
            reqNo: reqNo,
            reqDate: reqDate,
            employee_id: employeeId
          };
          break;

        case 'assembly':
          apiUrl = 'https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/asslyRawMaterialRequestionApprovalApi.php';
          payload = {
            value: assignQty,
            type: item.type,
            id: item.id,
            Mid: item.material_id,
            fileID: fileId,
            reqNo: reqNo,
            reqDate: reqDate,
            employee_id: employeeId
          };
          break;

        default:
          showToast('Invalid material type', 'error');
          return;
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.status === 'success') {
        showToast('Material assigned successfully', 'success');
        setAssignValues(prev => ({ ...prev, [idx]: '' }));
        fetchAllData();
      } else {
        showToast(result.message || 'Failed to assign material', 'error');
      }
    } catch (error) {
      console.error('Error saving material:', error);
      showToast('Error saving material approval', 'error');
    } finally {
      setSaving(prev => ({ ...prev, [idx]: false }));
    }
  };

  const submitHardwareMaterials = async () => {
    // Prepare data for API
    const materialData = [];
    const reassign = [];
    const subName = [];

    hardwareData.forEach((item) => {
      if (item.assigned_qty && parseFloat(item.assigned_qty) > 0) {
        // Format: materialName_type_requiredQty
        const type = item.isNew ? 'S' : 'M'; // S for submaterial, M for main material
        materialData.push(`${item.material_name}_${type}_${item.required_qty}`);
        reassign.push(parseFloat(item.assigned_qty));
        subName.push(item.material_id || '');
      }
    });

    if (materialData.length === 0) {
      showToast('Please assign at least one material', 'error');
      return;
    }

    setSaving({ hardware: true });

    try {
      const payload = {
        materialData: materialData,
        reassign: reassign,
        subName: subName,
        fileID: fileId,
        employee_id: employeeId
      };

      const response = await fetch(
        'https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/HardwareRawMaterialRequestionApprovalApi.php',
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
        showToast('Hardware materials assigned successfully', 'success');
        fetchAllData();
      } else {
        showToast(result.message || 'Failed to assign hardware materials', 'error');
      }
    } catch (error) {
      console.error('Error submitting hardware materials:', error);
      showToast('Error submitting hardware materials', 'error');
    } finally {
      setSaving({ hardware: false });
    }
  };

  const addHardwareRow = (index) => {
    const newRow = { 
      index: hardwareData.length, 
      material_id: null, 
      material_name: '', 
      unit: '', 
      required_qty: 0, 
      stock: 0, 
      assigned_qty: 0, 
      readonly: false, 
      sub_materials: [], 
      isNew: true 
    };
    const updatedData = [...hardwareData];
    updatedData.splice(index + 1, 0, newRow);
    setHardwareData(updatedData);
  };

  const removeHardwareRow = (index) => {
    setHardwareData(hardwareData.filter((_, i) => i !== index));
  };

  const updateHardwareField = (index, field, value) => {
    const updatedData = [...hardwareData];
    updatedData[index][field] = value;
    if (field === 'material_name') {
      const selectedMaterial = materialOptions.find(opt => opt.value === value);
      if (selectedMaterial) {
        updatedData[index].material_name = selectedMaterial.value;
        updatedData[index].material_id = selectedMaterial.id;
      }
    }
    setHardwareData(updatedData);
  };

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const toggleFullScreen = () => setIsFullScreen(!isFullScreen);

  const getThemeStyles = () => {
    if (theme === 'dark') {
      return {
        bg: 'linear-gradient(135deg, #21262d 0%, #161b22 100%)',
        color: '#f8f9fa',
        cardBg: '#343a40',
        cardHeader: 'linear-gradient(135deg, #495057 0%, #343a40 100%)',
        inputBg: '#495057',
        inputBorder: '#6c757d',
        inputColor: '#fff',
        tableBg: '#2c3034',
        tableHover: '#495057'
      };
    }
    return {
      bg: 'linear-gradient(135deg, #f8f9ff 0%, #e6f3ff 100%)',
      color: '#212529',
      cardBg: '#ffffff',
      cardHeader: 'linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%)',
      inputBg: '#ffffff',
      inputBorder: '#ced4da',
      inputColor: '#212529',
      tableBg: '#f8f9fa',
      tableHover: '#e9ecef'
    };
  };

  const styles = getThemeStyles();

  useEffect(() => {
    document.body.style.background = styles.bg;
    document.body.style.color = styles.color;
    document.body.style.minHeight = '100vh';
    
    const styleTag = document.createElement('style');
    styleTag.textContent = `
      @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
      @keyframes spin { to { transform: rotate(360deg); } }
    `;
    document.head.appendChild(styleTag);
    return () => {
      document.body.style.background = '';
      document.body.style.color = '';
      document.body.style.minHeight = '';
      document.head.removeChild(styleTag);
    };
  }, [theme]);

  const renderMaterialTable = (data, apiType) => {
    return (
      <div style={{ overflowX: 'auto', borderRadius: '8px', boxShadow: theme === 'dark' ? '0 4px 6px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: styles.cardBg }}>
          <thead>
            <tr style={{ background: styles.cardHeader }}>
              <th style={{ padding: '12px', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: styles.color, width: '50px' }}>#</th>
              <th style={{ padding: '12px', textAlign: 'right', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: styles.color }}>Material</th>
              <th style={{ padding: '12px', textAlign: 'right', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: styles.color }}>Required</th>
              <th style={{ padding: '12px', textAlign: 'right', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: styles.color }}>Stock</th>
              <th style={{ padding: '12px', textAlign: 'right', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: styles.color }}>Assigned</th>
              <th style={{ padding: '12px', textAlign: 'right', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: styles.color }}>Assign Qty</th>
              <th style={{ padding: '12px', textAlign: 'right', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: styles.color }}>Action</th>
              <th style={{ padding: '12px', textAlign: 'right', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: styles.color }}>Type</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? styles.tableBg : styles.cardBg, borderBottom: `1px solid ${styles.inputBorder}` }}>
                <td style={{ padding: '12px', textAlign: 'right', fontSize: '0.875rem', fontWeight: '500', color: styles.color }}>{idx + 1}</td>
                <td style={{ padding: '12px', fontSize: '0.875rem', fontWeight: '500', color: styles.color }}>
                  <div>{item.material_name}</div>
                  {item.material_id && <small style={{ opacity: 0.7 }}>ID: {item.material_id}</small>}
                </td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  <input 
                    type="number" 
                    value={item.ppc_assign_qty || item.required_qty || 0} 
                    disabled 
                    style={{ width: '80px', textAlign: 'right', backgroundColor: styles.inputBg, border: 'none', color: '#17a2b8', fontWeight: '600', borderRadius: '4px', padding: '6px' }} 
                  />
                </td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  <input 
                    type="number" 
                    value={item.stock || 0} 
                    disabled 
                    style={{ width: '80px', textAlign: 'right', backgroundColor: styles.inputBg, border: 'none', color: styles.inputColor, borderRadius: '4px', padding: '6px' }} 
                  />
                </td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  <input 
                    type="number" 
                    value={item.assign_qty || 0} 
                    disabled 
                    style={{ width: '80px', textAlign: 'right', backgroundColor: styles.inputBg, border: 'none', color: '#28a745', fontWeight: '600', borderRadius: '4px', padding: '6px' }} 
                  />
                </td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  <input 
                    type="number" 
                    value={assignValues[idx] || ''} 
                    onChange={(e) => handleAssignValueChange(idx, e.target.value)}
                    placeholder="0"
                    style={{ width: '80px', textAlign: 'right', border: `1px solid ${styles.inputBorder}`, backgroundColor: styles.inputBg, color: styles.inputColor, borderRadius: '4px', padding: '6px' }} 
                  />
                </td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  <button 
                    onClick={() => saveMaterialApproval(item, idx, apiType)}
                    disabled={saving[idx]}
                    style={{ 
                      backgroundColor: saving[idx] ? '#6c757d' : '#17a2b8', 
                      color: 'white', 
                      padding: '6px 16px', 
                      borderRadius: '4px', 
                      textAlign: 'right',
                      fontSize: '0.875rem', 
                      fontWeight: '500', 
                      border: 'none', 
                      cursor: saving[idx] ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'right',
                      gap: '4px',
                      margin: '0 auto'
                    }}
                  >
                    <Save size={14} />
                    {saving[idx] ? 'Saving...' : 'Save'}
                  </button>
                </td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: '9999px', 
                    fontSize: '0.75rem', 
                    fontWeight: '500', 
                    backgroundColor: item.type === 'Stock' ? (theme === 'dark' ? 'rgba(40,167,69,0.3)' : '#d4edda') : (theme === 'dark' ? 'rgba(23,162,184,0.3)' : '#e0f7fa'), 
                    color: item.type === 'Stock' ? '#28a745' : '#17a2b8' 
                  }}>
                    {item.type}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading && rawData.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'right', justifyContent: 'center', background: styles.bg }}>
        <div style={{ textAlign: 'right', color: styles.color }}>
          <div style={{ border: '4px solid rgba(0,0,0,0.1)', borderTop: '4px solid #17a2b8', borderRadius: '50%', width: '3rem', height: '3rem', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
          <p style={{ marginTop: '1rem' }}>Loading material data...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: styles.bg, color: styles.color, padding: 0, margin: 0 }}>
      <div style={{ maxWidth: isFullScreen ? '100%' : '1400px', margin: '0 auto', padding: isFullScreen ? 0 : '20px' }}>
        <div style={{ backgroundColor: styles.cardBg, border: `1px solid ${styles.inputBorder}`, borderRadius: isFullScreen ? 0 : 8, overflow: 'hidden' }}>
          
          {/* Header */}
          <div style={{ background: styles.cardHeader, padding: '1rem 2rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'right', gap: '1rem', justifyContent: 'space-between' }}>
              <div style={{ flex: '1 1 300px' }}>
                <h4 style={{ margin: 0, marginBottom: '0.25rem', color: styles.color }}>Material Approval System</h4>
                <small style={{ opacity: 0.8, color: styles.color }}>File: {fileName}</small>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'right' }}>
                <button onClick={fetchAllData} disabled={loading} style={{ padding: '0.375rem 0.75rem', fontSize: '0.875rem', borderRadius: '0.25rem', border: '1px solid rgba(255,255,255,0.3)', backgroundColor: 'transparent', color: styles.color, cursor: loading ? 'not-allowed' : 'pointer' }}>
                  🔄 {!isMobile && 'Refresh'}
                </button>
                
                <button onClick={toggleFullScreen} style={{ padding: '0.375rem 0.75rem', fontSize: '0.875rem', borderRadius: '0.25rem', border: '1px solid rgba(255,255,255,0.3)', backgroundColor: 'transparent', color: styles.color, cursor: 'pointer' }}>
                  {isFullScreen ? '🗗' : '🗖'} {!isMobile && (isFullScreen ? 'Exit' : 'Full')}
                </button>
                
                <button onClick={toggleTheme} style={{ padding: '0.375rem 0.75rem', fontSize: '0.875rem', borderRadius: '0.25rem', border: '1px solid rgba(255,255,255,0.3)', backgroundColor: 'transparent', color: styles.color, cursor: 'pointer' }}>
                  {theme === 'light' ? '🌙' : '☀️'} {!isMobile && (theme === 'light' ? 'Dark' : 'Light')}
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.25rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              {['raw', 'electrical', 'assembly', 'hardware'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '0.5rem 1.5rem', borderRadius: '0.375rem', fontSize: '0.875rem', fontWeight: '500', border: 'none', cursor: 'pointer', backgroundColor: activeTab === tab ? (theme === 'dark' ? '#ffffff' : '#17a2b8') : 'rgba(255,255,255,0.1)', color: activeTab === tab ? (theme === 'dark' ? '#17a2b8' : '#ffffff') : styles.color, transition: 'all 0.2s' }}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Sub Header for Raw/Electrical/Assembly */}
          {activeTab !== 'hardware' && (
            <div style={{ background: theme === 'dark' ? 'rgba(23,162,184,0.1)' : '#e0f7fa', padding: '0.75rem 2rem', borderBottom: `1px solid ${styles.inputBorder}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'right', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'right', gap: '1rem' }}>
                  <input 
                    type="text" 
                    value={reqNo} 
                    onChange={(e) => setReqNo(e.target.value)}
                    placeholder="REQ NO"
                    style={{ 
                      border: `1px solid ${styles.inputBorder}`, 
                      borderRadius: '0.375rem', 
                      padding: '0.375rem 0.75rem', 
                      fontSize: '0.875rem', 
                      backgroundColor: styles.inputBg, 
                      color: styles.inputColor,
                      fontWeight: '600'
                    }} 
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'right', gap: '0.75rem' }}>
                  <Calendar size={16} style={{ color: '#17a2b8' }} />
                  <input 
                    type="date" 
                    value={reqDate} 
                    onChange={(e) => setReqDate(e.target.value)} 
                    style={{ border: `1px solid ${styles.inputBorder}`, borderRadius: '0.375rem', padding: '0.375rem 0.75rem', fontSize: '0.875rem', backgroundColor: styles.inputBg, color: styles.inputColor }} 
                  />
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div style={{ padding: isFullScreen ? '1rem' : '1.5rem' }}>
            {activeTab === 'raw' && renderMaterialTable(rawData, 'raw')}
            {activeTab === 'electrical' && renderMaterialTable(electricalData, 'electrical')}
            {activeTab === 'assembly' && renderMaterialTable(assemblyData, 'assembly')}

            {activeTab === 'hardware' && (
              <div style={{ overflowX: 'auto', borderRadius: '8px', boxShadow: theme === 'dark' ? '0 4px 6px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.1)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: styles.cardBg }}>
                  <thead>
                    <tr style={{ background: styles.cardHeader }}>
                      <th style={{ padding: '12px', textAlign: 'right', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: styles.color, width: '50px' }}></th>
                      <th style={{ padding: '12px', textAlign: 'right', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: styles.color }}>Material</th>
                      <th style={{ padding: '12px', textAlign: 'right', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: styles.color }}>Unit</th>
                      <th style={{ padding: '12px', textAlign: 'right', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: styles.color }}>Required</th>
                      <th style={{ padding: '12px', textAlign: 'right', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: styles.color }}>Stock</th>
                      <th style={{ padding: '12px', textAlign: 'right', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: styles.color }}>Assign</th>
                      <th style={{ padding: '12px', textAlign: 'right', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: styles.color }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {hardwareData.map((item, idx) => (
                      <tr key={idx} style={{ backgroundColor: item.readonly ? styles.tableHover : (idx % 2 === 0 ? styles.tableBg : styles.cardBg), borderBottom: `1px solid ${styles.inputBorder}` }}>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          {!item.readonly && <button onClick={() => addHardwareRow(idx)} style={{ color: '#17a2b8', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Plus size={18} /></button>}
                        </td>
                        <td style={{ padding: '12px' }}>
                          {item.isNew ? (
                            <select value={item.material_name} onChange={(e) => updateHardwareField(idx, 'material_name', e.target.value)} style={{ width: '100%', border: `1px solid ${styles.inputBorder}`, borderRadius: '4px', padding: '6px', backgroundColor: styles.inputBg, color: styles.inputColor }}>
                              <option value="">Select Material</option>
                              {materialOptions.map((opt, i) => <option key={i} value={opt.value}>{opt.label}</option>)}
                            </select>
                          ) : (
                            <span style={{ fontSize: '0.875rem', fontWeight: item.readonly ? '600' : '400', color: styles.color }}>{item.material_name}</span>
                          )}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', fontSize: '0.875rem', color: styles.color }}>{item.unit}</td>
                        <td style={{ padding: '12px', textAlign: 'right' }}><input type="number" value={item.required_qty} disabled style={{ width: '70px', textAlign: 'right', backgroundColor: styles.inputBg, border: 'none', color: item.required_qty > 0 ? '#17a2b8' : styles.inputColor, fontWeight: item.required_qty > 0 ? '600' : 'normal', borderRadius: '4px', padding: '4px' }} /></td>
                        <td style={{ padding: '12px', textAlign: 'right' }}><input type="number" value={item.stock} disabled style={{ width: '70px', textAlign: 'right', backgroundColor: styles.inputBg, border: 'none', color: styles.inputColor, borderRadius: '4px', padding: '4px' }} /></td>
                        <td style={{ padding: '12px' }}>
                          {!item.readonly && <input type="number" value={item.assigned_qty} onChange={(e) => updateHardwareField(idx, 'assigned_qty', e.target.value)} style={{ width: '100%', textAlign: 'right', border: `1px solid ${styles.inputBorder}`, backgroundColor: styles.inputBg, color: styles.inputColor, borderRadius: '4px', padding: '4px' }} />}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          {!item.readonly && item.material_id && <button onClick={() => removeHardwareRow(idx)} style={{ color: '#dc3545', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><X size={18} /></button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                  <button 
                    onClick={submitHardwareMaterials}
                    disabled={saving.hardware}
                    style={{ 
                      background: saving.hardware ? '#6c757d' : 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)', 
                      color: 'white', 
                      padding: '0.625rem 2rem', 
                      borderRadius: '0.5rem', 
                      fontSize: '0.875rem', 
                      fontWeight: '600', 
                      border: 'none', 
                      cursor: saving.hardware ? 'not-allowed' : 'pointer', 
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)', 
                      display: 'flex', 
                      alignItems: 'right', 
                      gap: '0.5rem' 
                    }}
                  >
                    <Save size={16} />
                    {saving.hardware ? 'Submitting...' : 'Submit'}
                  </button>
                  <button style={{ background: 'linear-gradient(135deg, #6c757d 0%, #5a6268 100%)', color: 'white', padding: '0.625rem 2rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: '600', border: 'none', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'right', gap: '0.5rem' }}>
                    <Printer size={16} />
                    Print
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialApprovalSystem;