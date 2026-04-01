import React, { useState, useEffect } from 'react';
import Select from 'react-select';

const ToolkitMaterialForm = () => {
  const [theme, setTheme] = useState('light');
  const [operationType, setOperationType] = useState('Issue');
  const [fileList, setFileList] = useState([]);
  const [supervisorList, setSupervisorList] = useState([]);
  const [materialList, setMaterialList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  
  // Form state
  const [formData, setFormData] = useState({
    fileNo: '',
    dchNo: '',
    receivedBy: '',
    issuedBy: '',
    dateOfIssue: '',
    dateOfMaterialReceived: '',
    receivedFrom: ''
  });

  // API URLs
  const FILE_LIST_API = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/getfilenamelistApi.php";
  const SUPERVISOR_API = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/getSupervisorApi.php";
  const MATERIAL_API = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/getmateriallistApi.php";
  const SUBMIT_API = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/saveToolkitApi.php";

  // Toast function
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  // Fetch file list
  useEffect(() => {
    fetchFileList();
    fetchSupervisorList();
  }, []);

  // Fetch material list when file is selected or operation type changes
  useEffect(() => {
    if (formData.fileNo) {
      fetchMaterialList(formData.fileNo, operationType);
    } else {
      setMaterialList([]);
    }
  }, [formData.fileNo, operationType]);

  const fetchFileList = async () => {
    try {
      const response = await fetch(FILE_LIST_API);
      const data = await response.json();
      if (data.status === 'success') {
        setFileList(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching file list:', error);
      showToast('Error loading file list', 'error');
    }
  };

  const fetchSupervisorList = async () => {
    try {
      const response = await fetch(SUPERVISOR_API);
      const data = await response.json();
      if (data.status === 'success') {
        setSupervisorList(data.receiverArr || []);
      }
    } catch (error) {
      console.error('Error fetching supervisor list:', error);
      showToast('Error loading supervisor list', 'error');
    }
  };

  const fetchMaterialList = async (fileId, opType) => {
    setLoading(true);
    try {
      const response = await fetch(`${MATERIAL_API}?fileid=${fileId}&operationtype=${opType}`);
      const data = await response.json();
      if (data.status === 'success') {
        const materials = (data.records || []).map(m => ({
          ...m,
          issueqty: '',
          receivedqty: '',
          req_date: '',
          remark: ''
        }));
        setMaterialList(materials);
        showToast(`Loaded ${materials.length} materials`, 'success');
      }
    } catch (error) {
      console.error('Error fetching material list:', error);
      showToast('Error loading materials', 'error');
      setMaterialList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOperationTypeChange = (e) => {
    setOperationType(e.target.value);
    if (e.target.value === 'Issue') {
      setFormData(prev => ({
        ...prev,
        receivedFrom: '',
        dateOfMaterialReceived: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        issuedBy: '',
        dateOfIssue: ''
      }));
    }
  };

  const handleMaterialChange = (index, field, value) => {
    const updatedList = [...materialList];
    updatedList[index][field] = value;
    setMaterialList(updatedList);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fileNo) {
      showToast('Please select a file number', 'error');
      return;
    }

    if (operationType === 'Issue') {
      if (!formData.receivedBy || !formData.issuedBy || !formData.dateOfIssue) {
        showToast('Please fill all required fields for Issue', 'error');
        return;
      }
    } else {
      if (!formData.receivedFrom || !formData.dateOfMaterialReceived) {
        showToast('Please fill all required fields for Receive', 'error');
        return;
      }
    }

    // Filter materials with quantities
    const filteredMaterials = materialList.filter(material => {
      if (operationType === 'Issue') {
        return material.issueqty && parseFloat(material.issueqty) > 0;
      } else {
        return material.receivedqty && parseFloat(material.receivedqty) > 0;
      }
    });

    if (filteredMaterials.length === 0) {
      showToast('Please enter at least one quantity', 'error');
      return;
    }

    setLoading(true);

    try {
      const apiPayload = {
        dchno: formData.dchNo || '',
        fileid: formData.fileNo,
        empid: formData.receivedBy || '',
        issued_by: formData.issuedBy || '',
        receiveddate: operationType === 'Receive' ? formData.dateOfMaterialReceived : '',
        issuedate: operationType === 'Issue' ? formData.dateOfIssue : '',
        tabledata: filteredMaterials.map(material => ({
          materialid: material.id,
          receivedqty: operationType === 'Receive' ? (material.receivedqty || 0) : 0,
          issueqty: operationType === 'Issue' ? (material.issueqty || 0) : 0,
          remark: material.remark || ''
        }))
      };

      console.log('Submitting to API:', apiPayload);

      const response = await fetch(SUBMIT_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload)
      });

      const result = await response.json();
      console.log('API Response:', result);

      if (result.status === true || result.status === 'success') {
        showToast(`Success! ${result.inserted_records || 0} records processed`, 'success');
        
        // Reset form
        const resetMaterials = materialList.map(m => ({
          ...m,
          issueqty: '',
          receivedqty: '',
          remark: '',
          req_date: ''
        }));
        setMaterialList(resetMaterials);
        
        setFormData({
          fileNo: '',
          dchNo: '',
          receivedBy: '',
          issuedBy: '',
          dateOfIssue: '',
          dateOfMaterialReceived: '',
          receivedFrom: ''
        });
      } else {
        showToast(result.message || 'Failed to save data', 'error');
      }
    } catch (error) {
      console.error('Error submitting:', error);
      showToast('Error submitting data: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const isDark = theme === 'dark';

  const getThemeStyles = () => {
    if (isDark) {
      return {
        bg: '#21262d',
        cardBg: '#343a40',
        cardHeader: '#495057',
        inputBg: '#2c3034',
        inputBorder: '#495057',
        text: '#f8f9fa',
        border: '#495057'
      };
    }
    return {
      bg: 'linear-gradient(135deg, #f8f9ff 0%, #e6f3ff 100%)',
      cardBg: '#ffffff',
      cardHeader: '#e9ecef',
      inputBg: '#ffffff',
      inputBorder: '#dee2e6',
      text: '#212529',
      border: '#dee2e6'
    };
  };

  const styles = getThemeStyles();

  // Custom styles for React Select
  const selectStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? '#007bff' : styles.inputBorder,
      backgroundColor: styles.inputBg,
      color: styles.text,
      minHeight: '42px',
      boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(0,123,255,.25)' : 'none',
      '&:hover': {
        borderColor: '#007bff'
      }
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: styles.cardBg,
      zIndex: 9999,
      border: `1px solid ${styles.border}`
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? '#007bff'
        : state.isFocused
          ? (isDark ? '#495057' : '#f8f9fa')
          : 'transparent',
      color: state.isSelected ? '#ffffff' : styles.text,
      '&:hover': {
        backgroundColor: state.isSelected ? '#007bff' : (isDark ? '#495057' : '#f8f9fa')
      }
    }),
    singleValue: (provided) => ({
      ...provided,
      color: styles.text
    }),
    placeholder: (provided) => ({
      ...provided,
      color: isDark ? '#adb5bd' : '#6c757d'
    }),
    input: (provided) => ({
      ...provided,
      color: styles.text
    })
  };

  // Format options for react-select
  const fileOptions = fileList.map(file => ({
    value: file.FILE_ID,
    label: file.FILE_NAME
  }));

  const supervisorOptions = supervisorList.map(supervisor => ({
    value: supervisor.employeeId,
    label: supervisor.name
  }));

  return (
    <div style={{
      minHeight: '100vh',
      background: styles.bg,
      padding: '20px',
      fontFamily: "'Maven Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>
      {/* Toast Notification */}
      {toast.show && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          padding: '16px 24px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          backgroundColor: toast.type === 'success' ? '#28a745' : toast.type === 'error' ? '#dc3545' : '#007bff',
          color: 'white',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <span>{toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}</span>
          {toast.message}
        </div>
      )}

      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{
          backgroundColor: styles.cardBg,
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: `1px solid ${styles.border}`,
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            background: `linear-gradient(135deg, ${styles.cardHeader} 0%, ${isDark ? '#343a40' : '#dee2e6'} 100%)`,
            padding: '20px 32px',
            borderBottom: `1px solid ${styles.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <h1 style={{
                margin: 0,
                fontSize: '24px',
                fontWeight: '700',
                color: styles.text,
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{ fontSize: '28px' }}>📦</span>
                LIST OF TOOLKIT MATERIAL
              </h1>
              <small style={{ color: styles.text, opacity: 0.7, marginTop: '4px', display: 'block' }}>
                {materialList.length > 0 && `${materialList.length} materials loaded`}
              </small>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={toggleTheme}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: `1px solid ${styles.border}`,
                  backgroundColor: isDark ? '#495057' : '#f8f9fa',
                  color: styles.text,
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                {isDark ? '☀️ Light' : '🌙 Dark'}
              </button>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '32px' }}>
            {/* First Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px',
              marginBottom: '24px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: styles.text,
                  fontSize: '14px'
                }}>
                  FILE NO. <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <Select
                  value={fileOptions.find(opt => opt.value === formData.fileNo) || null}
                  onChange={(selected) => handleInputChange({ target: { name: 'fileNo', value: selected?.value || '' }})}
                  options={fileOptions}
                  styles={selectStyles}
                  placeholder="Search and select file..."
                  isClearable
                  isSearchable
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: styles.text,
                  fontSize: '14px'
                }}>
                  OPERATION TYPE
                </label>
                <div style={{ display: 'flex', gap: '24px', alignItems: 'center', height: '42px' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    color: styles.text,
                    fontWeight: '500'
                  }}>
                    <input
                      type="radio"
                      name="operationType"
                      value="Issue"
                      checked={operationType === 'Issue'}
                      onChange={handleOperationTypeChange}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    Issue
                  </label>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    color: styles.text,
                    fontWeight: '500'
                  }}>
                    <input
                      type="radio"
                      name="operationType"
                      value="Receive"
                      checked={operationType === 'Receive'}
                      onChange={handleOperationTypeChange}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    Receive
                  </label>
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: styles.text,
                  fontSize: '14px'
                }}>
                  D. CH. NO.
                </label>
                <input
                  type="text"
                  name="dchNo"
                  value={formData.dchNo}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: `1px solid ${styles.inputBorder}`,
                    backgroundColor: styles.inputBg,
                    color: styles.text,
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#007bff'}
                  onBlur={(e) => e.target.style.borderColor = styles.inputBorder}
                />
              </div>
            </div>

            {/* Issue Section */}
            {operationType === 'Issue' && (
              <div style={{
                padding: '24px',
                borderRadius: '8px',
                backgroundColor: isDark ? 'rgba(255, 152, 0, 0.1)' : '#fff3e0',
                border: `1px solid ${isDark ? 'rgba(255, 152, 0, 0.3)' : '#ffe0b2'}`,
                marginBottom: '24px'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '24px'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '600',
                      color: isDark ? styles.text : '#212529',
                      fontSize: '14px'
                    }}>
                      RECEIVED BY <span style={{ color: '#dc3545' }}>*</span>
                    </label>
                    <Select
                      value={supervisorOptions.find(opt => opt.value === formData.receivedBy) || null}
                      onChange={(selected) => handleInputChange({ target: { name: 'receivedBy', value: selected?.value || '' }})}
                      options={supervisorOptions}
                      styles={selectStyles}
                      placeholder="Search and select..."
                      isClearable
                      isSearchable
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '600',
                      color: isDark ? styles.text : '#212529',
                      fontSize: '14px'
                    }}>
                      ISSUED BY <span style={{ color: '#dc3545' }}>*</span>
                    </label>
                    <Select
                      value={supervisorOptions.find(opt => opt.value === formData.issuedBy) || null}
                      onChange={(selected) => handleInputChange({ target: { name: 'issuedBy', value: selected?.value || '' }})}
                      options={supervisorOptions}
                      styles={selectStyles}
                      placeholder="Search and select..."
                      isClearable
                      isSearchable
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '600',
                      color: isDark ? styles.text : '#212529',
                      fontSize: '14px'
                    }}>
                      DATE OF ISSUE <span style={{ color: '#dc3545' }}>*</span>
                    </label>
                    <input
                      type="date"
                      name="dateOfIssue"
                      value={formData.dateOfIssue}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        border: `1px solid ${styles.inputBorder}`,
                        backgroundColor: styles.inputBg,
                        color: styles.text,
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Receive Section */}
            {operationType === 'Receive' && (
              <div style={{
                padding: '24px',
                borderRadius: '8px',
                backgroundColor: isDark ? 'rgba(76, 175, 80, 0.1)' : '#e8f5e9',
                border: `1px solid ${isDark ? 'rgba(76, 175, 80, 0.3)' : '#c8e6c9'}`,
                marginBottom: '24px'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '24px'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '600',
                      color: isDark ? styles.text : '#212529',
                      fontSize: '14px'
                    }}>
                      RECEIVED FROM <span style={{ color: '#dc3545' }}>*</span>
                    </label>
                    <Select
                      value={supervisorOptions.find(opt => opt.value === formData.receivedFrom) || null}
                      onChange={(selected) => handleInputChange({ target: { name: 'receivedFrom', value: selected?.value || '' }})}
                      options={supervisorOptions}
                      styles={selectStyles}
                      placeholder="Search and select..."
                      isClearable
                      isSearchable
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '600',
                      color: isDark ? styles.text : '#212529',
                      fontSize: '14px'
                    }}>
                      DATE OF MATERIAL RECEIVED <span style={{ color: '#dc3545' }}>*</span>
                    </label>
                    <input
                      type="date"
                      name="dateOfMaterialReceived"
                      value={formData.dateOfMaterialReceived}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        border: `1px solid ${styles.inputBorder}`,
                        backgroundColor: styles.inputBg,
                        color: styles.text,
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Material Table */}
            {materialList.length > 0 && (
              <div style={{
                overflowX: 'auto',
                overflowY: 'auto',
                maxHeight: '400px',
                marginBottom: '24px',
                borderRadius: '8px',
                border: `1px solid ${styles.border}`
              }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '14px'
                }}>
                  <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                    <tr style={{ backgroundColor: '#ff9800', color: '#000' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', borderRight: '1px solid rgba(0,0,0,0.1)' }}>SR. NO</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', borderRight: '1px solid rgba(0,0,0,0.1)', minWidth: '200px' }}>PARTICULARS</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', borderRight: '1px solid rgba(0,0,0,0.1)' }}>STOCK</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', borderRight: '1px solid rgba(0,0,0,0.1)' }}>TOTAL ISSUED QTY</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', borderRight: '1px solid rgba(0,0,0,0.1)' }}>UNIT</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', borderRight: '1px solid rgba(0,0,0,0.1)' }}>
                        {operationType === 'Issue' ? 'ISSUE QTY' : 'RECEIVED QTY'}
                      </th>
                      {operationType === 'Receive' && (
                        <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600' }}>ISSUED DATE</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {materialList.map((material, index) => (
                      <tr key={material.id || index} style={{
                        backgroundColor: index % 2 === 0 ? (isDark ? '#2c3034' : '#f8f9fa') : styles.cardBg,
                        borderBottom: `1px solid ${styles.border}`
                      }}>
                        <td style={{ padding: '12px 16px', textAlign: 'right', color: styles.text, fontWeight: '600' }}>{index + 1}</td>
                        <td style={{ padding: '12px 16px', color: styles.text }}>{material.material_description}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', color: styles.text, fontWeight: '600' }}>{material.stock}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', color: styles.text }}></td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', color: styles.text }}>{material.unit}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <input
                            type="number"
                            step="0.01"
                            value={operationType === 'Issue' ? (material.issueqty || '') : (material.receivedqty || '')}
                            onChange={(e) => handleMaterialChange(index, operationType === 'Issue' ? 'issueqty' : 'receivedqty', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              borderRadius: '4px',
                              border: `1px solid ${styles.inputBorder}`,
                              backgroundColor: styles.inputBg,
                              color: styles.text,
                              fontSize: '14px',
                              outline: 'none'
                            }}
                          />
                        </td>
                        {operationType === 'Receive' && (
                          <td style={{ padding: '12px 16px' }}>
                            <input
                              type="date"
                              value={material.req_date || ''}
                              onChange={(e) => handleMaterialChange(index, 'req_date', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                borderRadius: '4px',
                                border: `1px solid ${styles.inputBorder}`,
                                backgroundColor: styles.inputBg,
                                color: styles.text,
                                fontSize: '14px',
                                outline: 'none'
                              }}
                            />
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Submit Button */}
            <div style={{ textAlign: 'right', marginTop: '32px' }}>
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  padding: '14px 48px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: loading ? '#95a5a6' : '#ff9800',
                  color: '#000',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
                onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#f57c00')}
                onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#ff9800')}
              >
                {loading ? '⏳ Loading...' : '✓ Submit'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: ${isDark ? 'invert(1)' : 'invert(0)'};
        }
        
        /* Scrollbar styles */
        *::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        *::-webkit-scrollbar-track {
          background: ${isDark ? '#2c3034' : '#f1f1f1'};
          border-radius: 4px;
        }
        
        *::-webkit-scrollbar-thumb {
          background: ${isDark ? '#495057' : '#888'};
          border-radius: 4px;
        }
        
        *::-webkit-scrollbar-thumb:hover {
          background: ${isDark ? '#6c757d' : '#555'};
        }
      `}</style>
    </div>
  );
};

export default ToolkitMaterialForm;