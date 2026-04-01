import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Save, RotateCcw, Package } from 'lucide-react';

const MaterialAllocationSystem = () => {
  const [activeTab, setActiveTab] = useState('Raw');
  const [fileId, setFileId] = useState('S-25-198-CPG');
  const [rawData, setRawData] = useState([]);
  const [electricalData, setElectricalData] = useState([]);
  const [assemblyData, setAssemblyData] = useState([]);
  const [processedData, setProcessedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());

  const API_BASE = 'https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store';

  useEffect(() => {
    const hash = window.location.hash;
    const match = hash.match(/\/(\d+)$/);
    if (match) setFileId(match[1]);
  }, []);

  useEffect(() => {
    if (fileId) fetchTabData(activeTab);
  }, [activeTab, fileId]);

  const fetchTabData = async (tab) => {
    setLoading(true);
    try {
      const endpoints = {
        'Raw': `${API_BASE}/RawTabApi.php?file_id=${fileId}`,
        'Electrical': `${API_BASE}/electricalTabApi.php?file_id=${fileId}`,
        'Assembly': `${API_BASE}/assemblyTabApi.php?file_id=${fileId}`,
        'Processed Material': `${API_BASE}/processMaterialTabApi.php?file_id=${fileId}`,
      };
      const response = await fetch(endpoints[tab]);
      const result = await response.json();
      if (result.status) {
        const data = result.data || [];
        if (tab === 'Raw') setRawData(data);
        else if (tab === 'Electrical') setElectricalData(data);
        else if (tab === 'Assembly') setAssemblyData(data);
        else if (tab === 'Processed Material') setProcessedData(data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (srNo) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(srNo)) newExpanded.delete(srNo);
    else newExpanded.add(srNo);
    setExpandedRows(newExpanded);
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'Raw': return rawData;
      case 'Electrical': return electricalData;
      case 'Assembly': return assemblyData;
      case 'Processed Material': return processedData;
      default: return [];
    }
  };

  const handleInputChange = (index, field, value) => {
    const newData = [...getCurrentData()];
    newData[index][field] = value;
    if (activeTab === 'Raw') setRawData(newData);
    else if (activeTab === 'Electrical') setElectricalData(newData);
    else if (activeTab === 'Assembly') setAssemblyData(newData);
    else if (activeTab === 'Processed Material') setProcessedData(newData);
  };

  const handleSaveChanges = async () => {
    const currentData = getCurrentData();
    const dataToSubmit = currentData.filter(row => row.reassignQty && parseFloat(row.reassignQty) > 0);
    if (dataToSubmit.length === 0) { alert('Please enter reassign quantities before saving'); return; }
    setLoading(true);
    try {
      let payload = { action: '', employee_id: '1', file_id: fileId };
      if (activeTab === 'Raw') {
        payload.action = 'RawSubmit';
        payload.materialName = dataToSubmit.map(r => r.materialName);
        payload.reassignQty = dataToSubmit.map(r => r.reassignQty);
      } else if (activeTab === 'Electrical') {
        payload.action = 'ElecSubmit';
        payload.materialName = dataToSubmit.map(r => r.materialName);
        payload.reassignQty = dataToSubmit.map(r => r.reassignQty);
        payload.makeData = dataToSubmit.map(r => r.make || '');
      } else if (activeTab === 'Assembly') {
        payload.action = 'AsslySubmit';
        payload.materialName1 = dataToSubmit.map(r => r.material_name);
        payload.reassignQty1 = dataToSubmit.map(r => r.reassignQty);
      }
      const response = await fetch(
        'https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/saveAssignToProductionApi.php',
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
      );
      const result = await response.json();
      if (result.status === 'success') { alert(result.message); fetchTabData(activeTab); }
      else alert(result.message || 'Failed to save changes');
    } catch (error) {
      alert('An error occurred while saving. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignProcessMaterial = async () => {
    const dataToSubmit = processedData.filter(row => row.assignQty && parseFloat(row.assignQty) > 0);
    if (dataToSubmit.length === 0) { alert('Please enter assign quantities'); return; }
    setLoading(true);
    try {
      const payload = {
        action: 'AssignProcessMaterial', employee_id: '1',
        materialIDS: dataToSubmit.map(r => r.material_id),
        assignQtyProcess: dataToSubmit.map(r => r.assignQty),
        fileIDS1: fileId
      };
      const response = await fetch(
        'https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/saveAssignToProductionApi.php',
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
      );
      const result = await response.json();
      if (result.status === 'success') { alert(result.message); fetchTabData('Processed Material'); }
      else alert(result.message || 'Failed to assign materials');
    } catch (error) {
      alert('An error occurred while assigning. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => fetchTabData(activeTab);

  const renderRawElectricalTable = (data) => (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th className="th-sticky th-center">Action</th>
            <th className="th-sticky th-right">Sr No</th>
            <th className="th-right">Material Description</th>
            <th className="th-right">Unit</th>
            <th className="th-right">Required Qty</th>
            <th className="th-right">Stock</th>
            <th className="th-right">From File</th>
            <th className="th-right">From PO</th>
            <th className="th-right">Remaining</th>
            <th className="th-right">GRN Qty</th>
            <th className="th-right">New Stock</th>
            <th className="th-right">Reassign</th>
            <th className="th-right">Assign By</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => {
            const isExpanded = expandedRows.has(row.sr_no);
            const stockAssign = row.stockAssign || 0;
            const fileAssign = row.fileAssign || 0;
            const poAssign = row.internalReceived || 0;
            return (
              <React.Fragment key={row.sr_no}>
                <tr>
                  <td className="td-sticky td-center">
                    <button onClick={() => toggleExpand(row.sr_no)} className="expand-btn">
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                  </td>
                  <td className="td-sticky td-sr-no td-right">{row.sr_no}</td>
                  <td className="td-right">
                    <input type="text" value={row.materialName || ''} onChange={(e) => handleInputChange(index, 'materialName', e.target.value)} className="input-field input-right" />
                  </td>
                  <td className="td-right">{row.unit}</td>
                  <td className={`td-right td-required`}>{row.requiredQty}</td>
                  <td className={`td-right ${stockAssign > 0 ? 'td-stock' : ''}`}>{stockAssign}</td>
                  <td className={`td-right ${fileAssign > 0 ? 'td-file' : ''}`}>{fileAssign}</td>
                  <td className={`td-right ${poAssign > 0 ? 'td-po' : ''}`}>{poAssign}</td>
                  <td className={`td-right ${row.remainingQty > 0 ? 'td-remaining-red' : 'td-remaining-green'}`}>{row.remainingQty}</td>
                  <td className="td-right">
                    <input type="text" value={row.grnReceivedQty || ''} onChange={(e) => handleInputChange(index, 'grnReceivedQty', e.target.value)} className="input-field input-right" />
                  </td>
                  <td className="td-right td-new-stock">{row.newStock}</td>
                  <td className="td-right">
                    <input type="text" value={row.reassignQty || ''} onChange={(e) => handleInputChange(index, 'reassignQty', e.target.value)} className="input-field input-right" />
                  </td>
                  <td className="td-right">{row.assignedPerson}</td>
                </tr>
                {isExpanded && (
                  <tr className="expanded-row">
                    <td colSpan="13">
                      <div className="expanded-content">
                        <div className="detail-item"><span className="detail-badge">1</span><span>Assigned From Stock: <strong className="qty-stock">{stockAssign}</strong></span></div>
                        <div className="detail-item"><span className="detail-badge">2</span><span>Assigned From File: <strong className="qty-file">{fileAssign}</strong></span></div>
                        <div className="detail-item"><span className="detail-badge">3</span><span>Assigned From PO: <strong className="qty-po">{poAssign}</strong></span></div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const renderAssemblyTable = (data) => (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th className="th-sticky th-center">Action</th>
            <th className="th-sticky th-right">Sr No</th>
            <th className="th-right">Material Description</th>
            <th className="th-right">Material ID</th>
            <th className="th-right">Unit</th>
            <th className="th-right">Required Qty</th>
            <th className="th-right">Stock</th>
            <th className="th-right">From File</th>
            <th className="th-right">From PO</th>
            <th className="th-right">Remaining</th>
            <th className="th-right">GRN Qty</th>
            <th className="th-right">New Stock</th>
            <th className="th-right">Reassign</th>
            <th className="th-right">Assign By</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => {
            const isExpanded = expandedRows.has(row.sr_no);
            const stockAssign = row.stock_assign || 0;
            const fileAssign = row.file_assign || 0;
            const poAssign = row.internal_assign || 0;
            return (
              <React.Fragment key={row.sr_no}>
                <tr>
                  <td className="td-sticky td-center">
                    <button onClick={() => toggleExpand(row.sr_no)} className="expand-btn">
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                  </td>
                  <td className="td-sticky td-sr-no td-right">{row.sr_no}</td>
                  <td className="td-right">
                    <input type="text" value={row.material_name || ''} onChange={(e) => handleInputChange(index, 'material_name', e.target.value)} className="input-field input-right" />
                  </td>
                  <td className="td-right">{row.material_id}</td>
                  <td className="td-right">{row.unit}</td>
                  <td className="td-right td-required">{row.required_qty}</td>
                  <td className={`td-right ${stockAssign > 0 ? 'td-stock' : ''}`}>{stockAssign}</td>
                  <td className={`td-right ${fileAssign > 0 ? 'td-file' : ''}`}>{fileAssign}</td>
                  <td className={`td-right ${poAssign > 0 ? 'td-po' : ''}`}>{poAssign}</td>
                  <td className={`td-right ${row.remaining_qty > 0 ? 'td-remaining-red' : 'td-remaining-green'}`}>{row.remaining_qty}</td>
                  <td className="td-right">{row.grn_received_qty}</td>
                  <td className="td-right td-new-stock">{row.new_stock}</td>
                  <td className="td-right">
                    <input type="text" value={row.reassignQty || ''} onChange={(e) => handleInputChange(index, 'reassignQty', e.target.value)} className="input-field input-right" />
                  </td>
                  <td className="td-right">{row.assigned_person}</td>
                </tr>
                {isExpanded && (
                  <tr className="expanded-row">
                    <td colSpan="14">
                      <div className="expanded-content">
                        <div className="detail-item"><span className="detail-badge">1</span><span>Assigned From Stock: <strong className="qty-stock">{stockAssign}</strong></span></div>
                        <div className="detail-item"><span className="detail-badge">2</span><span>Assigned From File: <strong className="qty-file">{fileAssign}</strong></span></div>
                        <div className="detail-item"><span className="detail-badge">3</span><span>Assigned From PO: <strong className="qty-po">{poAssign}</strong></span></div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const renderProcessedTable = (data) => (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th className="th-right">Sr.No.</th>
            <th className="th-right">Material Name</th>
            <th className="th-right">Stock Qty</th>
            <th className="th-right">Assign Qty</th>
            <th className="th-right">Assign By</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={row.sr_no}>
              <td className="td-sr-no td-right">{row.sr_no}</td>
              <td className="td-right">{row.material_name}</td>
              <td className="td-right td-new-stock">{row.new_stock}</td>
              <td className="td-right">
                <input type="text" value={row.assignQty || ''} onChange={(e) => handleInputChange(index, 'assignQty', e.target.value)} className="input-field input-right" />
              </td>
              <td className="td-right">{row.assigned_person}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
          background: #f8fafc;
        }

        .app-container { min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }

        .header {
          background: white;
          box-shadow: 0 2px 8px rgba(0,0,0,.08);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-content { max-width: 1600px; margin: 0 auto; padding: 0 20px; }

        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0;
          gap: 16px;
          flex-wrap: wrap;
        }

        .file-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 8px;
          color: white;
          font-weight: 600;
          font-size: 14px;
        }

        .tabs {
          display: flex;
          gap: 4px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          padding-bottom: 2px;
        }
        .tabs::-webkit-scrollbar { display: none; }

        .tab-btn {
          padding: 12px 24px;
          border: none;
          background: transparent;
          color: #64748b;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all .3s;
          white-space: nowrap;
        }
        .tab-btn:hover { color: #667eea; }
        .tab-btn.active { color: #667eea; border-bottom-color: #667eea; }

        .main-content { max-width: 1600px; margin: 0 auto; padding: 20px; }

        .card { background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,.1); overflow: hidden; }

        .loading { text-align: center; padding: 80px 20px; }

        .spinner {
          width: 48px; height: 48px;
          border: 4px solid #e2e8f0;
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin .8s linear infinite;
          margin: 0 auto 16px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .table-container { overflow-x: auto; -webkit-overflow-scrolling: touch; }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
          min-width: 800px;
        }

        .data-table thead {
          background: #f8fafc;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        /* ── All header cells right-aligned by default ── */
        .data-table th {
          padding: 12px 10px;
          text-align: right;
          font-weight: 600;
          color: #475569;
          border-bottom: 2px solid #e2e8f0;
          white-space: nowrap;
        }

        /* ── All body cells right-aligned by default ── */
        .data-table td {
          padding: 12px 10px;
          border-bottom: 1px solid #f1f5f9;
          text-align: right;
        }

        /* Explicit utility classes */
        .th-right  { text-align: right !important; }
        .th-center { text-align: center !important; }
        .td-right  { text-align: right !important; }
        .td-center { text-align: center !important; }

        .th-sticky {
          position: sticky;
          background: #f8fafc;
          z-index: 11;
        }
        .th-sticky:nth-child(1) { left: 0; }
        .th-sticky:nth-child(2) { left: 60px; }

        .td-sticky {
          position: sticky;
          background: white;
          z-index: 5;
        }
        .td-sticky:nth-child(1) { left: 0; }
        .td-sticky:nth-child(2) { left: 60px; }

        .data-table tbody tr:hover .td-sticky { background: #f8fafc; }
        .data-table tbody tr:hover { background: #f8fafc; }

        .td-sr-no { font-weight: 600; color: #1e293b; }

        .expand-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all .2s;
          margin: 0 auto;
        }
        .expand-btn:hover { background: #5568d3; transform: scale(1.1); }

        .input-field {
          width: 100%;
          padding: 6px 8px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 13px;
          font-family: inherit;
          transition: all .2s;
        }
        .input-field:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102,126,234,.1); }

        /* Right-aligned inputs */
        .input-right { text-align: right; }

        .td-required  { background: #fef2f2; color: #dc2626; font-weight: 600; }
        .td-stock     { background: #f0fdf4; color: #16a34a; font-weight: 600; }
        .td-file      { background: #fffbeb; color: #d97706; font-weight: 600; }
        .td-po        { background: #faf5ff; color: #9333ea; font-weight: 600; }
        .td-remaining-red   { color: #dc2626; font-weight: 600; }
        .td-remaining-green { color: #16a34a; font-weight: 600; }
        .td-new-stock { background: #f8fafc; font-weight: 600; color: #334155; }

        .expanded-row { background: #fafbfc; }

        .expanded-content {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          border-left: 4px solid #667eea;
          text-align: left;
        }

        .detail-item { display: flex; align-items: center; gap: 12px; }

        .detail-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px; height: 28px;
          background: #667eea;
          color: white;
          border-radius: 6px;
          font-weight: 700;
          font-size: 12px;
          flex-shrink: 0;
        }

        .qty-stock { color: #16a34a; background: #dcfce7; padding: 2px 8px; border-radius: 4px; }
        .qty-file  { color: #d97706; background: #fef3c7; padding: 2px 8px; border-radius: 4px; }
        .qty-po    { color: #9333ea; background: #f3e8ff; padding: 2px 8px; border-radius: 4px; }

        .actions {
          margin-top: 20px;
          display: flex;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all .3s;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(102,126,234,.3);
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(102,126,234,.4); }

        .btn-success {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(16,185,129,.3);
        }
        .btn-success:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(16,185,129,.4); }

        .btn-secondary {
          background: linear-gradient(135deg, #64748b 0%, #475569 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(100,116,139,.3);
        }
        .btn-secondary:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(100,116,139,.4); }

        .btn:disabled { opacity: .6; cursor: not-allowed; transform: none; }

        @media (max-width: 768px) {
          .header-top { flex-direction: column; align-items: stretch; }
          .file-badge { justify-content: center; }
          .tab-btn { padding: 12px 16px; font-size: 13px; }
          .main-content { padding: 16px; }
          .data-table { font-size: 12px; }
          .data-table th, .data-table td { padding: 8px 6px; }
          .actions { flex-direction: column; }
          .btn { width: 100%; justify-content: center; }
        }

        @media (max-width: 480px) {
          .th-sticky:nth-child(2) { left: 50px; }
          .td-sticky:nth-child(2) { left: 50px; }
        }
      `}</style>

      <div className="app-container">
        <header className="header">
          <div className="header-content">
            <div className="header-top">
              <div className="file-badge">
                <Package size={18} />
                <span>File ID: {fileId}</span>
              </div>
            </div>
            <div className="tabs">
              {['Raw', 'Electrical', 'Assembly', 'Processed Material'].map(tab => (
                <button key={tab} onClick={() => { setActiveTab(tab); setExpandedRows(new Set()); }}
                  className={`tab-btn ${activeTab === tab ? 'active' : ''}`}>
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </header>

        <main className="main-content">
          {loading ? (
            <div className="card">
              <div className="loading">
                <div className="spinner"></div>
                <p style={{ color: '#64748b', fontWeight: 600 }}>Loading {activeTab} Materials...</p>
              </div>
            </div>
          ) : (
            <div className="card">
              {activeTab === 'Processed Material'
                ? renderProcessedTable(getCurrentData())
                : activeTab === 'Assembly'
                ? renderAssemblyTable(getCurrentData())
                : renderRawElectricalTable(getCurrentData())}
            </div>
          )}

          {activeTab !== 'Processed Material' && (
            <div className="actions">
              <button className="btn btn-primary" onClick={handleSaveChanges} disabled={loading}>
                <Save size={18} /><span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </button>
              <button className="btn btn-secondary" onClick={handleReset} disabled={loading}>
                <RotateCcw size={18} /><span>Reset</span>
              </button>
            </div>
          )}

          {activeTab === 'Processed Material' && (
            <div className="actions">
              <button className="btn btn-success" onClick={handleAssignProcessMaterial} disabled={loading}>
                <Package size={18} /><span>{loading ? 'Assigning...' : 'Assign Material'}</span>
              </button>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default MaterialAllocationSystem;