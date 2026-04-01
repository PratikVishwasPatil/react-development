import React, { useState, useEffect } from 'react';

const MaterialRequisitionForm = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reqNo, setReqNo] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileId, setFileId] = useState('');
  const [reqDate, setReqDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    setReqDate(today);
    fetchMaterialData();
  }, []);

  const fetchMaterialData = async () => {
    try {
      setLoading(true);
      const hash = window.location.hash;
      // Match pattern: #/next-page/fileId=5637
      const pathMatch = hash.match(/fileId=(\d+)/);
      const extractedFileId = pathMatch ? pathMatch[1] : '5652';
      setFileId(extractedFileId);
      
      const response = await fetch(
        `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/get_misc_listDetailsApi.php?file_id=${extractedFileId}`
      );
      
      const result = await response.json();
      
      if (result.status) {
        setMaterials(result.data.map(item => ({
          ...item,
          reassign_qty: item.assigned_qty || ''
        })));
        setReqNo(result.req_no);
        setFileName(`SM-25-094-ULV`);
        showToast(`Loaded ${result.data.length} material items`, 'success');
      } else {
        setError(result.message || 'Failed to fetch data');
        showToast(result.message || 'Failed to fetch data', 'error');
      }
    } catch (err) {
      setError('Failed to load material data. Please try again.');
      showToast('Failed to load material data', 'error');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReassignQtyChange = (id, value) => {
    setMaterials(prev =>
      prev.map(item =>
        item.id === id ? { ...item, reassign_qty: value } : item
      )
    );
    if (validationErrors[id]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    let hasErrors = false;

    if (!reqDate) {
      showToast('Please select a requisition date', 'error');
      return false;
    }

    materials.forEach(item => {
      const reassignQty = parseFloat(item.reassign_qty) || 0;
      
      if (!item.reassign_qty && item.reassign_qty !== 0 && item.reassign_qty !== '') {
        errors[item.id] = 'Required';
        hasErrors = true;
      } else if (reassignQty < 0) {
        errors[item.id] = 'Cannot be negative';
        hasErrors = true;
      } else if (reassignQty > item.stock) {
        errors[item.id] = `Max: ${item.stock}`;
        hasErrors = true;
      } else if (reassignQty > item.requested_qty) {
        errors[item.id] = `Max: ${item.requested_qty}`;
        hasErrors = true;
      }
    });

    setValidationErrors(errors);
    
    if (hasErrors) {
      showToast('Please fix validation errors', 'error');
    }
    
    return !hasErrors;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);

    try {
      // Build storeData string
      // Format: count_id_materialId_reqQty_assignQty_type_fileID
      const storeDataArray = materials.map((item, index) => {
        return `${index + 1}_${item.id}_${item.material_id}_${item.requested_qty}_${item.reassign_qty}_RAW_${fileId}`;
      });
      const storeData = storeDataArray.join(',');

      // Create FormData
      const formData = new FormData();
      formData.append('storeData', storeData);
      formData.append('fileID', fileId);
      formData.append('reqNo', reqNo);
      formData.append('reqDate', reqDate);

      const response = await fetch(
        'https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/AddMiscMaterialApi.php',
        {
          method: 'POST',
          body: formData
        }
      );

      const result = await response.json();

      if (result.status) {
        showToast('Material assigned successfully!', 'success');
        console.log('Submitted successfully:', result);
        
        // Optionally refresh data or redirect
        setTimeout(() => {
          fetchMaterialData();
        }, 1500);
      } else {
        showToast(result.message || 'Submission failed', 'error');
      }
    } catch (err) {
      showToast('Failed to submit. Please try again.', 'error');
      console.error('Error submitting data:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid rgba(0,0,0,0.1)',
            borderLeftColor: '#007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <p>Loading material requisition data...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f5f5',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          background: toast.type === 'success' ? '#28a745' : toast.type === 'error' ? '#dc3545' : '#007bff',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          animation: 'slideIn 0.3s ease-out'
        }}>
          {toast.message}
          <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; }}`}</style>
        </div>
      )}

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {/* Header with Orange Background */}
        <div style={{
          background: '#ff9933',
          padding: '12px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid #e68a00',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#000' }}>
            REQ {reqNo}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: '#000', fontWeight: 'bold' }}>
              Date:
            </label>
            <input
              type="date"
              value={reqDate}
              onChange={(e) => setReqDate(e.target.value)}
              style={{
                padding: '6px 12px',
                fontSize: '14px',
                border: '1px solid #e68a00',
                borderRadius: '4px',
                background: 'white',
                color: '#000',
                cursor: 'pointer'
              }}
            />
          </div>
          <div style={{ fontSize: '14px', color: '#000' }}>
            File Name : {fileName}
          </div>
        </div>

        {/* Table */}
        {error ? (
          <div style={{
            padding: '40px',
            textAlign: 'right',
            color: '#dc3545'
          }}>
            ⚠️ {error}
          </div>
        ) : materials.length === 0 ? (
          <div style={{
            padding: '40px',
            textAlign: 'right',
            color: '#666'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📭</div>
            <h5>No materials available</h5>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{ background: '#ff9933' }}>
                    <th style={headerCellStyle}>Sr No</th>
                    <th style={headerCellStyle}>Material Name</th>
                    <th style={headerCellStyle}>Unit</th>
                    <th style={headerCellStyle}>Req. Qty</th>
                    <th style={headerCellStyle}>Requested BY</th>
                    <th style={headerCellStyle}>Stock</th>
                    <th style={headerCellStyle}>Assing Qty</th>
                    <th style={headerCellStyle}>Reassign Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map((item, index) => (
                    <tr
                      key={item.id}
                      style={{
                        background: 'white',
                        borderBottom: '1px solid #ddd'
                      }}
                    >
                      <td style={bodyCellStyle}>
                        <div style={{
                          color: '#e63946',
                          fontWeight: 'bold',
                          fontSize: '18px',
                          textDecoration: 'underline'
                        }}>
                          {index + 1}
                        </div>
                      </td>
                      <td style={bodyCellStyle}>{item.material_name}</td>
                      <td style={{ ...bodyCellStyle, textAlign: 'right' }}>{item.unit}</td>
                      <td style={{ ...bodyCellStyle, textAlign: 'right' }}>{item.requested_qty || ''}</td>
                      <td style={bodyCellStyle}>{item.requested_by}</td>
                      <td style={{ ...bodyCellStyle, textAlign: 'right' }}>{item.stock}</td>
                      <td style={{ ...bodyCellStyle, textAlign: 'right' }}>{item.assigned_qty}</td>
                      <td style={{ ...bodyCellStyle, textAlign: 'right' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <input
                            type="number"
                            min="0"
                            max={Math.min(item.stock, item.requested_qty)}
                            value={item.reassign_qty}
                            onChange={(e) => handleReassignQtyChange(item.id, e.target.value)}
                            disabled={item.is_readonly}
                            style={{
                              width: '100px',
                              padding: '6px 8px',
                              textAlign: 'right',
                              border: `1px solid ${validationErrors[item.id] ? '#dc3545' : '#ddd'}`,
                              borderRadius: '4px',
                              fontSize: '14px',
                              opacity: item.is_readonly ? 0.6 : 1,
                              cursor: item.is_readonly ? 'not-allowed' : 'text'
                            }}
                          />
                          {validationErrors[item.id] && (
                            <small style={{ color: '#dc3545', fontSize: '11px', marginTop: '4px' }}>
                              {validationErrors[item.id]}
                            </small>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Submit Button */}
            <div style={{
              padding: '24px',
              textAlign: 'right',
              background: 'white'
            }}>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  padding: '12px 48px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  background: submitting ? '#6c757d' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
                onMouseEnter={(e) => {
                  if (!submitting) {
                    e.target.style.background = '#218838';
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!submitting) {
                    e.target.style.background = '#28a745';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                  }
                }}
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Styles
const headerCellStyle = {
  padding: '12px 16px',
  textAlign: 'right',
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#000',
  border: '1px solid #e68a00',
  whiteSpace: 'nowrap'
};

const bodyCellStyle = {
  padding: '12px 16px',
  fontSize: '14px',
  color: '#333',
  border: '1px solid #ddd'
};

export default MaterialRequisitionForm;