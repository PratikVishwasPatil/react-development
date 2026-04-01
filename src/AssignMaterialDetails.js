import React, { useState, useEffect, useMemo } from 'react';
import { Search, Package, AlertCircle, CheckCircle, XCircle, RefreshCw, Download, ChevronDown, Lock } from 'lucide-react';

const ModernMaterialAssign = () => {
  const [activeTab, setActiveTab] = useState('compareStock');
  const [theme, setTheme] = useState('light');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [materialData, setMaterialData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fileId, setFileId] = useState('');
  const [fileName, setFileName] = useState('');
  const [showFileDropdown, setShowFileDropdown] = useState(false);

  // Forward status states
  const [isForwarded, setIsForwarded] = useState(false);
  const [forwardCheckLoading, setForwardCheckLoading] = useState(false);

  // Extract fileId from URL
  useEffect(() => {
    const extractFileIdFromUrl = () => {
      const hash = window.location.hash;
      const match = hash.match(/\/assign-material\/(\d+)/);
      if (match && match[1]) {
        setFileId(match[1]);
      } else {
        // Fallback for testing
        setFileId('5568');
      }
    };

    extractFileIdFromUrl();
    window.addEventListener('hashchange', extractFileIdFromUrl);
    return () => window.removeEventListener('hashchange', extractFileIdFromUrl);
  }, []);

  const [filesList, setFilesList] = useState([]);
  const [selectedFileForCompare, setSelectedFileForCompare] = useState('');
  const [compareFileData, setCompareFileData] = useState([]);
  const [projectFileData, setProjectFileData] = useState([]);
  const [loadingCompareFile, setLoadingCompareFile] = useState(false);
  const [fileSearchTerm, setFileSearchTerm] = useState('');
  
  // PO related states
  const [poList, setPoList] = useState([]);
  const [selectedPO, setSelectedPO] = useState(null);
  const [poMaterialsData, setPoMaterialsData] = useState([]);
  const [poProjectFileData, setPoProjectFileData] = useState([]);
  const [loadingPO, setLoadingPO] = useState(false);
  const [poSearchTerm, setPoSearchTerm] = useState('');
  const [showPoDropdown, setShowPoDropdown] = useState(false);

  const [finalReqData, setFinalReqData] = useState([]);
  const [loadingFinalReq, setLoadingFinalReq] = useState(false);
  const [showForwardModal, setShowForwardModal] = useState(false);
const [reassignValues, setReassignValues] = useState({});
  const tabs = [
    { id: 'compareStock', label: 'Compare With Stock', icon: '📊', api: 'CompareWithStockApi.php' },
    { id: 'compareFile', label: 'Compare with File', icon: '📄', api: 'CompareWithFileApi.php' },
    { id: 'comparePO', label: 'Compare With PO', icon: '📋', api: 'CompareWithPOApi.php' },
    { id: 'finalReq', label: 'Final Req. Material', icon: '✓', api: 'FinalReqMaterialApi.php' },
  ];

  const themeColors = {
    light: {
      bg: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      cardBg: '#ffffff',
      headerBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      tabBg: '#f8f9fa',
      tabActive: '#667eea',
      text: '#2d3748',
      border: '#e2e8f0',
      rowHover: '#f7fafc',
      inputBg: '#ffffff',
    },
    dark: {
      bg: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
      cardBg: '#2d3748',
      headerBg: 'linear-gradient(135deg, #434190 0%, #5a4c8f 100%)',
      tabBg: '#1a202c',
      tabActive: '#5a67d8',
      text: '#e2e8f0',
      border: '#4a5568',
      rowHover: '#374151',
      inputBg: '#374151',
    },
  };

  const colors = themeColors[theme];

  

  // Check forward status
  const checkForwardStatus = async () => {
    if (!fileId) return;
    
    setForwardCheckLoading(true);
    try {
      const response = await fetch(`https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/checkMaterialForwardStatusApi.php?fileID=${fileId}`);
      const data = await response.json();
      
      if (data.status === 'forwarded') {
        setIsForwarded(true);
      } else {
        setIsForwarded(false);
      }
    } catch (error) {
      console.error('Error checking forward status:', error);
      setIsForwarded(false);
    } finally {
      setForwardCheckLoading(false);
    }
  };

  // Fetch data from API
  const fetchData = async (tabId) => {
    if (!fileId) return;
    
    setLoading(true);
    try {
      const currentTab = tabs.find(t => t.id === tabId);
      const apiUrl = `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/${currentTab.api}?fileId=${fileId}`;
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (data.status === 'success') {
        const formattedData = data.rows.map((row, index) => ({
          id: index + 1,
          sr_no: row.sr_no,
          material: row.material,
          unit: row.unit,
          qty: row.qty,
          vendor: row.vendor,
          date: row.date,
          assigned_qty: row.assigned_qty,
          material_id: row.material_id
        }));
        setMaterialData(formattedData);
        setFileName(data.fileName || `File-${fileId}`);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch files master list
  const fetchFilesList = async () => {
    try {
      const response = await fetch('https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/file_master.php');
      const data = await response.json();
      if (data.status === 'success') {
        setFilesList(data.files || []);
      }
    } catch (error) {
      console.error('Error fetching files list:', error);
    }
  };

  // Fetch PO list
  const fetchPOList = async () => {
    try {
      const response = await fetch('https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/getPoListApi.php');
      const data = await response.json();
      console.log('PO List Response:', data);
      if (data.status === 'success' && data.data) {
        setPoList(data.data || []);
      } else if (Array.isArray(data)) {
        setPoList(data);
      }
    } catch (error) {
      console.error('Error fetching PO list:', error);
    }
  };

  // Fetch project file data (auto-load for Compare tabs)
  const fetchProjectFileDataOnly = async () => {
    if (!fileId) return;
    
    try {
      const projectDataResponse = await fetch(`https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/getProjectbyfileApi.php?fileno=${fileId}`);
      const projectData = await projectDataResponse.json();
      
      if (projectData.status === 'success') {
        setProjectFileData(projectData.data || []);
        setPoProjectFileData(projectData.data || []); // Set for both PO and File compare
      }
    } catch (error) {
      console.error('Error fetching project file data:', error);
    }
  };

  // Fetch compare file data
  const fetchCompareFileData = async (fileNo) => {
    if (!fileNo) return;
    
    setLoadingCompareFile(true);
    try {
      const fileDataResponse = await fetch(`https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/getFileDataApi.php?fileno=${fileNo}`);
      const fileData = await fileDataResponse.json();
      
      if (fileData.status === 'success') {
        setCompareFileData(fileData.data || []);
      }
    } catch (error) {
      console.error('Error fetching compare file data:', error);
      alert('Failed to fetch file comparison data');
    } finally {
      setLoadingCompareFile(false);
    }
  };

  // Fetch PO materials data only
  const fetchPOData = async (poId) => {
    if (!poId) return;
    
    setLoadingPO(true);
    try {
      const poResponse = await fetch(`https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/getPoMaterialsDetailsApi.php?po_id=${poId}`);
      const poData = await poResponse.json();
      
      if (poData.status === 'success') {
        setPoMaterialsData(poData.data || []);
      }
    } catch (error) {
      console.error('Error fetching PO data:', error);
      alert('Failed to fetch PO data');
    } finally {
      setLoadingPO(false);
    }
  };

  const fetchFinalReqData = async () => {
    if (!fileId) return;
    setLoadingFinalReq(true);
    try {
      const response = await fetch(`https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/FinalReqMaterialApi.php?fileId=${fileId}`);
      const data = await response.json();
      console.log('Final Req API Response:', data);
      if (data.status === 'success') {
        setFinalReqData(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching final req data:', error);
    } finally {
      setLoadingFinalReq(false);
    }
  };

  // Handle forward action
 // Add this function in your ModernMaterialAssign component

const handleForwardSheet = async () => {
  try {
    // Prepare data arrays from finalReqData
    const materialName11 = [];
    const unitName = [];
    const qty = [];
    const purchaseqty = [];

    finalReqData.forEach((item) => {
      materialName11.push(item.material_name);
      unitName.push(item.unit || '');
      qty.push(item.required_qty || 0);
      purchaseqty.push(item.purchase_qty || 0);
    });

    const formData = new FormData();
    
    // Append arrays as required by the API
    materialName11.forEach((val, index) => {
      formData.append(`materialName11[${index}]`, val);
    });
    
    unitName.forEach((val, index) => {
      formData.append(`unitName[${index}]`, val);
    });
    
    qty.forEach((val, index) => {
      formData.append(`qty[${index}]`, val);
    });
    
    purchaseqty.forEach((val, index) => {
      formData.append(`purchaseqty[${index}]`, val);
    });

    // Add other required fields
    formData.append('fileId', fileId);
    formData.append('fileID1', fileId); // Assuming both are same
    formData.append('empID', '1'); // Replace with actual employee ID if available

    const response = await fetch(
      'https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/savePurchasedDataApi.php',
      {
        method: 'POST',
        body: formData
      }
    );

    const data = await response.json();

    if (data.status === 'success') {
      alert('Data sent to Purchase Department successfully!');
      setShowForwardModal(false);
      // Recheck forward status
      checkForwardStatus();
    } else {
      alert('Error: ' + (data.message || 'Failed to send data'));
    }

  } catch (error) {
    console.error('Error forwarding sheet:', error);
    alert('Failed to send data. Please try again.');
  }
};

  // Handle reassign value change
const handleReassignChange = (materialId, value) => {
  setReassignValues(prev => ({
    ...prev,
    [materialId]: value
  }));
};

// Handle assign material for compare file
const handleAssignFileToFile = async () => {
  if (isForwarded) {
    alert('Data already forwarded. No modifications allowed.');
    return;
  }

  try {
    let storedata = '';
    let storedata1 = '';

    // Build storedata from compareFileData (first table)
    compareFileData.forEach((item, index) => {
      const reassignValue = reassignValues[item.material_id] || '';
      
      if (reassignValue && parseFloat(reassignValue) > 0) {
        storedata += `${index}#${item.material_id}~${item.assigned_qty || 0}~${reassignValue},`;
      }
    });

    // Build storedata1 from projectFileData (second table - for reversal)
    projectFileData.forEach((item, index) => {
      storedata1 += `${index}#${item.material_id}~${item.material_name}~${selectedFileForCompare}~${item.assigned_qty || 0},`;
    });

    // Remove trailing commas
    storedata = storedata.replace(/,$/, '');
    storedata1 = storedata1.replace(/,$/, '');

    if (!storedata) {
      alert('Please enter reassign quantities');
      return;
    }

    const formData = new FormData();
    formData.append('storedata', storedata);
    formData.append('storedata1', storedata1);
    formData.append('taxType', fileId);

    const response = await fetch('https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/AssignFiletoFileMaterialApi.php', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (data.status === 'success') {
      alert('Materials assigned successfully!');
      setReassignValues({});
      // Refresh data
      fetchCompareFileData(selectedFileForCompare);
      fetchProjectFileDataOnly();
    } else {
      alert('Error: ' + (data.message || 'Failed to assign materials'));
    }

  } catch (error) {
    console.error('Error assigning materials:', error);
    alert('Failed to assign materials');
  }
};

  // Load files list, PO list, and check forward status on mount
  useEffect(() => {
    fetchFilesList();
    fetchPOList();
    if (fileId) {
      checkForwardStatus();
    }
  }, [fileId]);

  // Handle assign material for compare PO
const handleAssignPOToFile = async () => {
  if (isForwarded) {
    alert('Data already forwarded. No modifications allowed.');
    return;
  }

  try {
    let storedata11 = '';
    let storedata112 = '';

    // Build storedata11 from poMaterialsData (first table)
    poMaterialsData.forEach((item, index) => {
      const reassignKey = `po_${item.material_id}`;
      const reassignValue = reassignValues[reassignKey] || '';
      
      if (reassignValue && parseFloat(reassignValue) > 0) {
        storedata11 += `${index}#${item.material_id}~${item.order_qty || 0}~${reassignValue},`;
      }
    });

    // Build storedata112 from poProjectFileData (second table - unused but required)
    poProjectFileData.forEach((item, index) => {
      storedata112 += `${index}#${item.material_id}~${item.material_name}~${item.assigned_qty || 0},`;
    });

    // Remove trailing commas
    storedata11 = storedata11.replace(/,$/, '');
    storedata112 = storedata112.replace(/,$/, '');

    if (!storedata11) {
      alert('Please enter reassign quantities');
      return;
    }

    const formData = new FormData();
    formData.append('storedata11', storedata11);
    formData.append('storedata112', storedata112);
    formData.append('poID', selectedPO.po_id);
    formData.append('fileId', fileId);

    const response = await fetch('https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/AssignPotoFileMaterial.php', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (data.status === 'success') {
      alert('PO materials assigned successfully!');
      setReassignValues({});
      // Refresh data
      fetchPOData(selectedPO.po_id);
      fetchProjectFileDataOnly();
    } else {
      alert('Error: ' + (data.message || 'Failed to assign PO materials'));
    }

  } catch (error) {
    console.error('Error assigning PO materials:', error);
    alert('Failed to assign PO materials');
  }
};

// Handle PO reassign value change
const handlePOReassignChange = (materialId, value) => {
  setReassignValues(prev => ({
    ...prev,
    [`po_${materialId}`]: value
  }));
};

  // Auto-load project file data when entering Compare tabs
  useEffect(() => {
    if ((activeTab === 'compareFile' || activeTab === 'comparePO') && fileId) {
      fetchProjectFileDataOnly();
    }
  }, [activeTab, fileId]);

  // Fetch Final Req data when tab changes
  useEffect(() => {
    if (activeTab === 'finalReq' && fileId) {
      fetchFinalReqData();
    }
  }, [activeTab, fileId]);

  // Fetch compare file data when selected file changes
  useEffect(() => {
    if (selectedFileForCompare && activeTab === 'compareFile') {
      fetchCompareFileData(selectedFileForCompare);
    }
  }, [selectedFileForCompare, activeTab]);

  // Fetch PO data when selected PO changes
  useEffect(() => {
    if (selectedPO && activeTab === 'comparePO') {
      fetchPOData(selectedPO.po_id);
    }
  }, [selectedPO, activeTab]);

  // Fetch data when fileId or activeTab changes
  useEffect(() => {
    if (fileId && activeTab !== 'finalReq' && activeTab !== 'compareFile' && activeTab !== 'comparePO') {
      fetchData(activeTab);
    }
  }, [fileId, activeTab]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.file-dropdown-container')) {
        setShowFileDropdown(false);
      }
      if (!e.target.closest('.po-dropdown-container')) {
        setShowPoDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredFilesList = useMemo(() => {
    return filesList.filter(file =>
      file.FILE_NAME.toLowerCase().includes(fileSearchTerm.toLowerCase())
    );
  }, [filesList, fileSearchTerm]);

  const filteredPoList = useMemo(() => {
    if (!Array.isArray(poList)) return [];
    return poList.filter(po => {
      const searchLower = poSearchTerm.toLowerCase();
      return (
        (po.po_number && po.po_number.toString().toLowerCase().includes(searchLower)) ||
        (po.vendor_name && po.vendor_name.toLowerCase().includes(searchLower)) ||
        (po.po_id && po.po_id.toString().toLowerCase().includes(searchLower))
      );
    });
  }, [poList, poSearchTerm]);

  const filteredData = useMemo(() => {
    return materialData.filter(item =>
      item.material.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [materialData, searchTerm]);

  const toggleRowSelection = (id) => {
    if (isForwarded) return; // Disable selection if forwarded
    
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const handleAssignStock = () => {
    if (isForwarded) {
      alert('Data already forwarded. No modifications allowed.');
      return;
    }
    if (selectedRows.size === 0) {
      alert('Please select at least one item');
      return;
    }
    const selectedItems = filteredData.filter(item => selectedRows.has(item.id));
    console.log('Assigning stock for:', selectedItems);
    alert(`Assigning stock for ${selectedRows.size} selected items`);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.bg,
      padding: window.innerWidth <= 768 ? '12px' : '20px',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>
      {/* Header Card */}
      <div style={{
        background: colors.headerBg,
        borderRadius: '16px',
        padding: window.innerWidth <= 768 ? '16px' : '24px 32px',
        marginBottom: '16px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h1 style={{
              margin: 0,
              fontSize: window.innerWidth <= 768 ? '20px' : '28px',
              fontWeight: '700',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <Package size={window.innerWidth <= 768 ? 24 : 32} />
              Material Assignment
            </h1>
            <p style={{
              margin: '8px 0 0 0',
              fontSize: window.innerWidth <= 768 ? '12px' : '14px',
              color: 'rgba(255,255,255,0.9)',
            }}>
              File Name: <strong>{fileName || `SM-25-084-LUN`}</strong>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                checkForwardStatus();
                if (activeTab === 'finalReq') {
                  fetchFinalReqData();
                } else {
                  fetchData(activeTab);
                }
              }}
              disabled={loading || loadingFinalReq}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '12px',
                padding: window.innerWidth <= 768 ? '10px' : '12px 20px',
                color: '#ffffff',
                cursor: (loading || loadingFinalReq) ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              onMouseEnter={(e) => !(loading || loadingFinalReq) && (e.target.style.background = 'rgba(255,255,255,0.3)')}
              onMouseLeave={(e) => (e.target.style.background = 'rgba(255,255,255,0.2)')}
            >
              <RefreshCw size={16} style={{ animation: (loading || loadingFinalReq) ? 'spin 1s linear infinite' : 'none' }} />
              {window.innerWidth > 768 && 'Refresh'}
            </button>
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '12px',
                padding: window.innerWidth <= 768 ? '10px' : '12px 20px',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
            >
              {theme === 'light' ? '🌙' : '☀️'}
              {window.innerWidth > 768 && (theme === 'light' ? ' Dark' : ' Light')}
            </button>

           {activeTab === 'finalReq' && !isForwarded && (
  <>
    <button
      onClick={() => window.print()}
      style={{
        background: '#10b981',
        border: 'none',
        borderRadius: '12px',
        padding: window.innerWidth <= 768 ? '10px 16px' : '12px 20px',
        color: '#ffffff',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
      onMouseEnter={(e) => e.target.style.background = '#059669'}
      onMouseLeave={(e) => e.target.style.background = '#10b981'}
    >
      🖨️ Print
    </button>
    <button
      onClick={() => setShowForwardModal(true)}
      style={{
        background: '#f97316',
        border: 'none',
        borderRadius: '12px',
        padding: window.innerWidth <= 768 ? '10px 16px' : '12px 20px',
        color: '#ffffff',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
      onMouseEnter={(e) => e.target.style.background = '#ea580c'}
      onMouseLeave={(e) => e.target.style.background = '#f97316'}
    >
      ▶ Forward Sheet
    </button>
  </>
)}
          </div>
        </div>
      </div>

      {/* Forwarded Status Banner */}
      {isForwarded && (
        <div style={{
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          borderRadius: '12px',
          padding: '16px 24px',
          marginBottom: '16px',
          boxShadow: '0 4px 20px rgba(239, 68, 68, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#ffffff',
        }}>
          <Lock size={24} />
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
              DATA ALREADY SENT
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
              This material sheet has been forwarded to the Purchase Department. View-only mode is active.
            </p>
          </div>
        </div>
      )}

      {/* Main Content Card */}
      <div style={{
        background: colors.cardBg,
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        overflow: 'hidden',
      }}>
        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '4px',
          padding: window.innerWidth <= 768 ? '12px 12px 0 12px' : '16px 16px 0 16px',
          background: colors.tabBg,
          borderBottom: `2px solid ${colors.border}`,
          overflowX: 'auto',
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? colors.tabActive : 'transparent',
                color: activeTab === tab.id ? '#ffffff' : colors.text,
                border: 'none',
                borderRadius: '12px 12px 0 0',
                padding: window.innerWidth <= 768 ? '10px 16px' : '12px 24px',
                fontSize: window.innerWidth <= 768 ? '12px' : '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>{tab.icon}</span>
              {window.innerWidth > 768 ? tab.label : tab.label.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Table Content */}
        <div style={{ overflowX: 'auto' }}>
          {activeTab === 'finalReq' ? (
            // ======== FINAL REQ TAB CONTENT ========
            <div>
              {loadingFinalReq ? (
                <div style={{ padding: '60px', textAlign: 'center', color: colors.text }}>
                  <RefreshCw size={40} style={{ animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
                  <p>Loading final requirement data...</p>
                </div>
              ) : finalReqData.length === 0 ? (
                <div style={{ padding: '60px', textAlign: 'center', color: colors.text }}>
                  <Package size={40} style={{ marginBottom: '16px', opacity: 0.5 }} />
                  <p>No final requirement data available</p>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: colors.tabBg, borderBottom: `2px solid ${colors.border}` }}>
                      <th style={tableHeaderStyle(colors)}>Sr.No</th>
                      <th style={tableHeaderStyle(colors)}>Material Description</th>
                      <th style={tableHeaderStyle(colors)}>Unit</th>
                      <th style={tableHeaderStyle(colors)}>Qty</th>
                      <th style={tableHeaderStyle(colors)}>Stock Assign</th>
                      <th style={tableHeaderStyle(colors)}>File Assign</th>
                      <th style={tableHeaderStyle(colors)}>Purchase Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {finalReqData.map((item) => (
                      <tr
                        key={item.sr_no}
                        style={{ borderBottom: `1px solid ${colors.border}`, transition: 'all 0.2s ease' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = colors.rowHover}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{...tableCellStyle(colors), fontWeight: '600', textAlign: 'center'}}>
                          {item.sr_no}
                        </td>
                        <td style={{...tableCellStyle(colors), fontWeight: '500', color: '#f97316'}}>
                          {item.material_name}
                        </td>
                        <td style={tableCellStyle(colors)}>
                          {item.unit && (
                            <span style={{
                              background: colors.tabActive,
                              color: '#ffffff',
                              padding: '4px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                            }}>
                              {item.unit}
                            </span>
                          )}
                        </td>
                        <td style={{...tableCellStyle(colors), textAlign: 'center'}}>
                          <span style={{ fontWeight: '600', fontSize: '16px' }}>
                            {item.required_qty}
                          </span>
                        </td>
                        <td style={{...tableCellStyle(colors), textAlign: 'center'}}>
                          <span style={{ color: item.stock_assigned > 0 ? '#10b981' : '#9ca3af', fontWeight: '600' }}>
                            {item.stock_assigned}
                          </span>
                        </td>
                        <td style={{...tableCellStyle(colors), textAlign: 'center'}}>
                          <span style={{ color: item.file_assigned > 0 ? '#10b981' : '#9ca3af', fontWeight: '600' }}>
                            {item.file_assigned}
                          </span>
                        </td>
                        <td style={{...tableCellStyle(colors), textAlign: 'center'}}>
                          <span style={{ color: '#f59e0b', fontWeight: '600', fontSize: '16px' }}>
                            {item.purchase_qty}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ) : activeTab === 'comparePO' ? (
            // Compare with PO Tab Content
            <div>
              <div style={{
                padding: window.innerWidth <= 768 ? '12px' : '20px',
                borderBottom: `1px solid ${colors.border}`,
              }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: colors.text,
                }}>
                  Select Purchase Order:
                </label>
                <div className="po-dropdown-container" style={{ position: 'relative', maxWidth: '500px' }}>
                  <div
                    onClick={() => !isForwarded && setShowPoDropdown(!showPoDropdown)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: `1px solid ${colors.border}`,
                      borderRadius: '12px',
                      fontSize: '14px',
                      background: colors.inputBg,
                      color: colors.text,
                      cursor: isForwarded ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      opacity: isForwarded ? 0.6 : 1,
                    }}
                  >
                    <span>
                      {selectedPO 
                        ? `PO #${selectedPO.po_number} - ${selectedPO.vendor_name || 'N/A'}`
                        : 'Select a Purchase Order...'}
                    </span>
                    <ChevronDown size={20} style={{ 
                      transition: 'transform 0.3s',
                      transform: showPoDropdown ? 'rotate(180deg)' : 'rotate(0deg)'
                    }} />
                  </div>

                  {showPoDropdown && !isForwarded && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      marginTop: '4px',
                      background: colors.cardBg,
                      border: `1px solid ${colors.border}`,
                      borderRadius: '12px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                      zIndex: 1000,
                      maxHeight: '300px',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                    }}>
                      <div style={{ padding: '12px', borderBottom: `1px solid ${colors.border}` }}>
                        <div style={{ position:'relative' }}>
<Search size={16} style={{
position: 'absolute',
left: '12px',
top: '50%',
transform: 'translateY(-50%)',
color: '#9ca3af',
}} />
<input
type="text"
placeholder="Search PO..."
value={poSearchTerm}
onChange={(e) => setPoSearchTerm(e.target.value)}
onClick={(e) => e.stopPropagation()}
style={{
width: '100%',
padding: '8px 12px 8px 36px',
border: `1px solid ${colors.border}`,
borderRadius: '8px',
fontSize: '13px',
background: colors.inputBg,
color: colors.text,
outline: 'none',
}}
/>
</div>
</div>
                  <div style={{ overflowY: 'auto', maxHeight: '240px' }}>
                    {filteredPoList.length === 0 ? (
                      <div style={{
                        padding: '20px',
                        textAlign: 'center',
                        color: '#9ca3af',
                        fontSize: '13px',
                      }}>
                        {poList.length === 0 ? 'Loading PO list...' : 'No PO found'}
                      </div>
                    ) : (
                      filteredPoList.map((po) => (
                        <div
                          key={po.po_id}
                          onClick={() => {
                            setSelectedPO(po);
                            setShowPoDropdown(false);
                            setPoSearchTerm('');
                          }}
                          style={{
                            padding: '12px 16px',
                            cursor: 'pointer',
                            background: selectedPO?.po_id === po.po_id ? colors.tabActive + '20' : 'transparent',
                            color: colors.text,
                            borderBottom: `1px solid ${colors.border}`,
                            transition: 'background 0.2s',
                          }}
                          onMouseEnter={(e) => e.target.style.background = colors.rowHover}
                          onMouseLeave={(e) => {
                            e.target.style.background = selectedPO?.po_id === po.po_id 
                              ? colors.tabActive + '20' 
                              : 'transparent';
                          }}
                        >
                          <div style={{ fontWeight: '600', fontSize: '14px' }}>
                            PO #{po.po_number || po.po_id}
                          </div>
                          {po.vendor_name && (
                            <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                              {po.vendor_name}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {selectedPO && (
                    <div
                      onClick={() => {
                        setSelectedPO(null);
                        setShowPoDropdown(false);
                        setPoSearchTerm('');
                      }}
                      style={{
                        padding: '10px 16px',
                        borderTop: `1px solid ${colors.border}`,
                        cursor: 'pointer',
                        color: '#ef4444',
                        fontSize: '13px',
                        fontWeight: '600',
                        textAlign: 'center',
                        background: colors.tabBg,
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#fee2e2'}
                      onMouseLeave={(e) => e.target.style.background = colors.tabBg}
                    >
                      Clear Selection
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {loadingPO ? (
            <div style={{
              padding: '60px',
              textAlign: 'center',
              color: colors.text,
            }}>
              <RefreshCw size={40} style={{ animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
              <p>Loading PO data...</p>
            </div>
          ) : !selectedPO && poProjectFileData.length === 0 ? (
            <div style={{
              padding: '60px',
              textAlign: 'center',
              color: colors.text,
            }}>
              <Package size={40} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <p>Please select a Purchase Order to compare</p>
            </div>
          ) : (
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: window.innerWidth <= 1024 ? '1fr' : '1fr 1fr',
              gap: '20px',
              padding: window.innerWidth <= 768 ? '12px' : '20px',
            }}>
              {/* PO Materials table */}
              {selectedPO && poMaterialsData.length > 0 && (
                <div style={{
                  background: colors.tabBg,
                  borderRadius: '12px',
                  padding: '16px',
                  border: `1px solid ${colors.border}`,
                }}>
                  <h3 style={{
                    margin: '0 0 16px 0',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: colors.text,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <Package size={20} />
                    PO #{selectedPO.po_number}
                  </h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: `2px solid ${colors.border}` }}>
                          {!isForwarded && (
                            <th style={{...tableHeaderStyle(colors), background: 'transparent'}}>
                              <input type="checkbox" style={{ width: '16px', height: '16px' }} />
                            </th>
                          )}
                          <th style={{...tableHeaderStyle(colors), background: 'transparent'}}>Sr No</th>
                          <th style={{...tableHeaderStyle(colors), background: 'transparent'}}>Name</th>
                          <th style={{...tableHeaderStyle(colors), background: 'transparent'}}>Unit</th>
                          <th style={{...tableHeaderStyle(colors), background: 'transparent'}}>Order Qty</th>
                          <th style={{...tableHeaderStyle(colors), background: 'transparent'}}>Reassign</th>
                        </tr>
                      </thead>
                      <tbody>
                        {poMaterialsData.map((item) => (
                          <tr key={item.material_id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                            {!isForwarded && (
                              <td style={tableCellStyle(colors)}>
                                <input 
                                  type="checkbox" 
                                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                />
                              </td>
                            )}
                            <td style={{...tableCellStyle(colors), textAlign: 'center'}}>
                              {item.sr_no}
                            </td>
                            <td style={{...tableCellStyle(colors), fontWeight: '500', fontSize: '13px'}}>
                              {item.material_name}
                            </td>
                            <td style={tableCellStyle(colors)}>
                              {item.unit && (
                                <span style={{
                                  background: colors.tabActive,
                                  color: '#ffffff',
                                  padding: '3px 10px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: '600',
                                }}>
                                  {item.unit}
                                </span>
                              )}
                            </td>
                            <td style={{...tableCellStyle(colors), textAlign: 'center'}}>
                              <span style={{ 
                                color: '#f59e0b', 
                                fontWeight: '600',
                                fontSize: '16px',
                              }}>
                                {item.order_qty || 0}
                              </span>
                            </td>
                            <td style={tableCellStyle(colors)}>
  {!isForwarded ? (
    <input
      type="number"
      min="0"
      step="0.01"
      value={reassignValues[`po_${item.material_id}`] || ''}
      onChange={(e) => handlePOReassignChange(item.material_id, e.target.value)}
      placeholder="0"
      style={{
        width: '80px',
        padding: '6px 10px',
        border: `1px solid ${colors.border}`,
        borderRadius: '6px',
        fontSize: '13px',
        background: colors.inputBg,
        color: colors.text,
        outline: 'none',
      }}
    />
  ) : (
    <span style={{ color: '#9ca3af' }}>-</span>
  )}
</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Required Material File table - Always show on right */}
              {poProjectFileData.length > 0 && (
                <div style={{
                  background: colors.tabBg,
                  borderRadius: '12px',
                  padding: '16px',
                  border: `1px solid ${colors.border}`,
                }}>
                  <h3 style={{
                    margin: '0 0 16px 0',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: colors.text,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <Package size={20} />
                    Required Material File: {fileName || 'Current File'}
                  </h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: `2px solid ${colors.border}` }}>
                          {!isForwarded && (
                            <th style={{...tableHeaderStyle(colors), background: 'transparent'}}>
                              <input type="checkbox" style={{ width: '16px', height: '16px' }} />
                            </th>
                          )}
                          <th style={{...tableHeaderStyle(colors), background: 'transparent'}}>Sr No</th>
                          <th style={{...tableHeaderStyle(colors), background: 'transparent'}}>Name</th>
                          <th style={{...tableHeaderStyle(colors), background: 'transparent'}}>Unit</th>
                          <th style={{...tableHeaderStyle(colors), background: 'transparent'}}>Qty</th>
                          <th style={{...tableHeaderStyle(colors), background: 'transparent'}}>Assigned</th>
                        </tr>
                      </thead>
                      <tbody>
                        {poProjectFileData.map((item) => (
                          <tr key={item.material_id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                            {!isForwarded && (
                              <td style={tableCellStyle(colors)}>
                                <input 
                                  type="checkbox" 
                                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                />
                              </td>
                            )}
                            <td style={{...tableCellStyle(colors), textAlign: 'center'}}>
                              {item.sr_no}
                            </td>
                            <td style={{...tableCellStyle(colors), fontWeight: '500', fontSize: '13px'}}>
                              {item.material_name}
                            </td>
                            <td style={tableCellStyle(colors)}>
                              {item.unit && (
                                <span style={{
                                  background: colors.tabActive,
                                  color: '#ffffff',
                                  padding: '3px 10px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: '600',
                                }}>
                                  {item.unit}
                                </span>
                              )}
                            </td>
                            <td style={{...tableCellStyle(colors), textAlign: 'center'}}>
                              <span style={{ 
                                color: '#f59e0b', 
                                fontWeight: '600',
                                fontSize: '16px',
                              }}>
                                {item.qty}
                              </span>
                            </td>
                            <td style={{...tableCellStyle(colors), textAlign: 'center'}}>
                              <span style={{ 
                                color: item.assigned_qty > 0 ? '#10b981' : '#9ca3af',
                                fontWeight: '600',
                              }}>
                                {item.assigned_qty || 0}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : activeTab === 'compareFile' ? (
        // Compare with File content
        <div>
          <div style={{
            padding: window.innerWidth <= 768 ? '12px' : '20px',
            borderBottom: `1px solid ${colors.border}`,
          }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: colors.text,
            }}>
              Please Select a File:
            </label>
            <div className="file-dropdown-container" style={{ position: 'relative', maxWidth: '500px' }}>
              <div
                onClick={() => !isForwarded && setShowFileDropdown(!showFileDropdown)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '12px',
                  fontSize: '14px',
                  background: colors.inputBg,
                  color: colors.text,
                  cursor: isForwarded ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  opacity: isForwarded ? 0.6 : 1,
                }}
              >
                <span>
                  {selectedFileForCompare 
                    ? filesList.find(f => f.FILE_ID === selectedFileForCompare)?.FILE_NAME || 'File selected'
                    : 'Select a file...'}
                </span>
                <ChevronDown size={20} style={{ 
                  transition: 'transform 0.3s',
                  transform: showFileDropdown ? 'rotate(180deg)' : 'rotate(0deg)'
                }} />
              </div>

              {showFileDropdown && !isForwarded && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '4px',
                  background: colors.cardBg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  zIndex: 1000,
                  maxHeight: '300px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}>
                  <div style={{ padding: '12px', borderBottom: `1px solid ${colors.border}` }}>
                    <div style={{ position: 'relative' }}>
                      <Search size={16} style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#9ca3af',
                      }} />
                      <input
                        type="text"
                        placeholder="Search files..."
                        value={fileSearchTerm}
                        onChange={(e) => setFileSearchTerm(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          width: '100%',
                          padding: '8px 12px 8px 36px',
                          border: `1px solid ${colors.border}`,
                          borderRadius: '8px',
                          fontSize: '13px',
                          background: colors.inputBg,
                          color: colors.text,
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ overflowY: 'auto', maxHeight: '240px' }}>
                    {filteredFilesList.length === 0 ? (
                      <div style={{
                        padding: '20px',
                        textAlign: 'center',
                        color: '#9ca3af',
                        fontSize: '13px',
                      }}>
                        {filesList.length === 0 ? 'Loading files...' : 'No files found'}
                      </div>
                    ) : (
                      filteredFilesList.map((file) => (
                        <div
                          key={file.FILE_ID}
                          onClick={() => {
                            setSelectedFileForCompare(file.FILE_ID);
                            setShowFileDropdown(false);
                            setFileSearchTerm('');
                          }}
                          style={{
                            padding: '12px 16px',
                            cursor: 'pointer',
                            background: selectedFileForCompare === file.FILE_ID ? colors.tabActive + '20' : 'transparent',
                            color: colors.text,
                            borderBottom: `1px solid ${colors.border}`,
                            transition: 'background 0.2s',
                            fontSize: '14px',
                          }}
                          onMouseEnter={(e) => e.target.style.background = colors.rowHover}
                          onMouseLeave={(e) => {
                            e.target.style.background = selectedFileForCompare === file.FILE_ID 
                              ? colors.tabActive + '20' 
                              : 'transparent';
                          }}
                        >
                          {file.FILE_NAME}
                        </div>
                      ))
                    )}
                  </div>

                  {selectedFileForCompare && (
                    <div
                      onClick={() => {
                        setSelectedFileForCompare('');
                        setShowFileDropdown(false);
                        setFileSearchTerm('');
                      }}
                      style={{
                        padding: '10px 16px',
                        borderTop: `1px solid ${colors.border}`,
                        cursor: 'pointer',
                        color: '#ef4444',
                        fontSize: '13px',
                        fontWeight: '600',
                        textAlign: 'center',
                        background: colors.tabBg,
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#fee2e2'}
                      onMouseLeave={(e) => e.target.style.background = colors.tabBg}
                    >
                      Clear Selection
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {loadingCompareFile ? (
            <div style={{
              padding: '60px',
              textAlign: 'center',
              color: colors.text,
            }}>
              <RefreshCw size={40} style={{ animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
              <p>Loading comparison data...</p>
            </div>
          ) : !selectedFileForCompare && projectFileData.length === 0 ? (
            <div style={{
              padding: '60px',
              textAlign: 'center',
              color: colors.text,
            }}>
              <Package size={40} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <p>Please select a file to compare</p>
            </div>
          ) : (compareFileData.length > 0 || projectFileData.length > 0) && (
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: window.innerWidth <= 1024 ? '1fr' : '1fr 1fr',
              gap: '20px',
              padding: window.innerWidth <= 768 ? '12px' : '20px',
            }}>
              {selectedFileForCompare && compareFileData.length > 0 && (
                <div style={{
                  background: colors.tabBg,
                  borderRadius: '12px',
                  padding: '16px',
                  border: `1px solid ${colors.border}`,
                }}>
                  <h3 style={{
                    margin: '0 0 16px 0',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: colors.text,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <Package size={20} />
                    {filesList.find(f => f.FILE_ID === selectedFileForCompare)?.FILE_NAME || 'Selected File'}
                  </h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: `2px solid ${colors.border}` }}>
                          {!isForwarded && (
                            <th style={{...tableHeaderStyle(colors), background: 'transparent'}}>
                              <input type="checkbox" style={{ width: '16px', height: '16px' }} />
                            </th>
                          )}
                          <th style={{...tableHeaderStyle(colors), background: 'transparent'}}>Name</th>
                          <th style={{...tableHeaderStyle(colors), background: 'transparent'}}>Unit</th>
                          <th style={{...tableHeaderStyle(colors), background: 'transparent'}}>Assign Mat.</th>
                          <th style={{...tableHeaderStyle(colors), background: 'transparent'}}>Reassign Mat.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {compareFileData.map((item) => (
                          <tr key={item.material_id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                            {!isForwarded && (
                              <td style={tableCellStyle(colors)}>
                                <input 
                                  type="checkbox" 
                                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                />
                              </td>
                            )}
                            <td style={{...tableCellStyle(colors), fontWeight: '500', fontSize: '13px'}}>
                              {item.material}
                            </td>
                            <td style={tableCellStyle(colors)}>
                              {item.unit && (
                                <span style={{
                                  background: colors.tabActive,
                                  color: '#ffffff',
                                  padding: '3px 10px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: '600',
                                }}>
                                  {item.unit}
                                </span>
                              )}
                            </td>
                            <td style={{...tableCellStyle(colors), textAlign: 'center'}}>
                              <span style={{ 
                                color: '#f59e0b', 
                                fontWeight: '600',
                                fontSize: '16px',
                              }}>
                                {item.assigned_qty || 0}
                              </span>
                            </td>
                            <td style={tableCellStyle(colors)}>
  {!isForwarded ? (
    <input
      type="number"
      min="0"
      step="0.01"
      value={reassignValues[item.material_id] || ''}
      onChange={(e) => handleReassignChange(item.material_id, e.target.value)}
      placeholder="0"
      style={{
        width: '80px',
        padding: '6px 10px',
        border: `1px solid ${colors.border}`,
        borderRadius: '6px',
        fontSize: '13px',
        background: colors.inputBg,
        color: colors.text,
        outline: 'none',
      }}
    />
  ) : (
    <span style={{ color: '#9ca3af' }}>-</span>
  )}
</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {projectFileData.length > 0 && (
                <div style={{
                  background: colors.tabBg,
                  borderRadius: '12px',
                  padding: '16px',
                  border: `1px solid ${colors.border}`,
                }}>
                  <h3 style={{
                    margin: '0 0 16px 0',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: colors.text,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <Package size={20} />
                    Required Material File: {fileName || 'Current File'}
                  </h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: `2px solid ${colors.border}` }}>
                          {!isForwarded && (
                            <th style={{...tableHeaderStyle(colors), background: 'transparent'}}>
                              <input type="checkbox" style={{ width: '16px', height: '16px' }} />
                            </th>
                          )}
                          <th style={{...tableHeaderStyle(colors), background: 'transparent'}}>Name</th>
                          <th style={{...tableHeaderStyle(colors), background: 'transparent'}}>Unit</th>
                          <th style={{...tableHeaderStyle(colors), background: 'transparent'}}>Assign Mat.</th>
                          <th style={{...tableHeaderStyle(colors), background: 'transparent'}}>Reassign Mat.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projectFileData.map((item) => (
                          <tr key={item.material_id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                            {!isForwarded && (
                              <td style={tableCellStyle(colors)}>
                                <input 
                                  type="checkbox" 
                                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                />
                              </td>
                            )}
                            <td style={{...tableCellStyle(colors), fontWeight: '500', fontSize: '13px'}}>
                              {item.material_name}
                            </td>
                            <td style={tableCellStyle(colors)}>
                              {item.unit && (
                                <span style={{
                                  background: colors.tabActive,
                                  color: '#ffffff',
                                  padding: '3px 10px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: '600',
                                }}>
                                  {item.unit}
                                </span>
                              )}
                            </td>
                            <td style={{...tableCellStyle(colors), textAlign: 'center'}}>
                              <span style={{ 
                                color: '#f59e0b', 
                                fontWeight: '600',
                                fontSize: '16px',
                              }}>
                                {item.qty}
                              </span>
                            </td>
                          <td style={tableCellStyle(colors)}>
  <input
    type="number"
    value={item.assigned_qty || 0}
    disabled
    style={{
      width: '80px',
      padding: '6px 10px',
      border: `1px solid ${colors.border}`,
      borderRadius: '6px',
      fontSize: '13px',
      background: '#f3f4f6',
      color: '#9ca3af',
      cursor: 'not-allowed',
      textAlign: 'center',
    }}
  />
</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : loading ? (
        <div style={{
          padding: '60px',
          textAlign: 'center',
          color: colors.text,
        }}>
          <RefreshCw size={40} style={{ animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
          <p>Loading data...</p>
        </div>
      ) : filteredData.length === 0 ? (
        <div style={{
          padding: '60px',
          textAlign: 'center',
          color: colors.text,
        }}>
          <AlertCircle size={40} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <p>No data found</p>
        </div>
      ) : (
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
        }}>
          <thead>
            <tr style={{
              background: colors.tabBg,
              borderBottom: `2px solid ${colors.border}`,
            }}>
              {!isForwarded && (
                <th style={tableHeaderStyle(colors)}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows(new Set(filteredData.map(item => item.id)));
                      } else {
                        setSelectedRows(new Set());
                      }
                    }}
                    checked={selectedRows.size === filteredData.length && filteredData.length > 0}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </th>
              )}
              <th style={tableHeaderStyle(colors)}>COL_0</th>
              <th style={tableHeaderStyle(colors)}>COL_1</th>
              <th style={tableHeaderStyle(colors)}>COL_2</th>
              <th style={tableHeaderStyle(colors)}>COL_3</th>
              <th style={tableHeaderStyle(colors)}>COL_4</th>
              <th style={tableHeaderStyle(colors)}>COL_5</th>
              <th style={tableHeaderStyle(colors)}>COL_6</th>
              <th style={tableHeaderStyle(colors)}>Assigned Stock Qty</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr
                key={item.id}
                style={{
                  borderBottom: `1px solid ${colors.border}`,
                  background: selectedRows.has(item.id) ? `${colors.tabActive}15` : 'transparent',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!selectedRows.has(item.id)) {
                    e.currentTarget.style.background = colors.rowHover;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!selectedRows.has(item.id)) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {!isForwarded && (
                  <td style={tableCellStyle(colors)}>
                    <input
                      type="checkbox"
                      checked={selectedRows.has(item.id)}
                      onChange={() => toggleRowSelection(item.id)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    </td>
                )}
                <td style={{...tableCellStyle(colors), fontWeight: '600'}}>{item.sr_no}</td>
                <td style={{...tableCellStyle(colors), fontWeight: '500', minWidth: '200px'}}>{item.material}</td>
                <td style={tableCellStyle(colors)}>
                  {item.unit && (
                    <span style={{
                      background: colors.tabActive,
                      color: '#ffffff',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                    }}>
                      {item.unit}
                    </span>
                  )}
                </td>
                <td style={{...tableCellStyle(colors), fontWeight: '600', color: colors.tabActive}}>{item.qty}</td>
                <td style={tableCellStyle(colors)}>
                  {item.vendor !== '' && item.vendor !== null ? (
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: item.vendor === '0' ? '#ef4444' : '#10b981',
                    }}>
                      {item.vendor === '0' ? <XCircle size={16} /> : <CheckCircle size={16} />}
                      {item.vendor}
                    </span>
                  ) : '-'}
                </td>
                <td style={tableCellStyle(colors)}>
                  {item.date !== '' && item.date !== null ? (
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: item.date === '0' ? '#ef4444' : '#10b981',
                    }}>
                      {item.date === '0' ? <XCircle size={16} /> : <CheckCircle size={16} />}
                      {item.date}
                    </span>
                  ) : '-'}
                </td>
                <td style={tableCellStyle(colors)}>{item.material_id || '-'}</td>
                <td style={tableCellStyle(colors)}>
                  {item.assigned_qty > 0 ? (
                    <span style={{ fontWeight: '600', color: '#10b981' }}>{item.assigned_qty}</span>
                  ) : (
                    <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Not assigned</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>

    {/* Footer Actions */}
    {activeTab === 'comparePO' && selectedPO && (
      <div style={{
        padding: window.innerWidth <= 768 ? '16px' : '20px',
        borderTop: `1px solid ${colors.border}`,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <button
          onClick={() => {
  if (isForwarded) {
    alert('Data already forwarded. No modifications allowed.');
    return;
  }
  handleAssignPOToFile();
}}
          disabled={isForwarded}
          style={{
            background: isForwarded ? '#9ca3af' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            padding: window.innerWidth <= 768 ? '12px 28px' : '14px 40px',
            fontSize: window.innerWidth <= 768 ? '14px' : '16px',
            fontWeight: '600',
            cursor: isForwarded ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: isForwarded ? 'none' : '0 4px 15px rgba(245, 158, 11, 0.4)',
            transform: 'scale(1)',
            opacity: isForwarded ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isForwarded) {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.5)';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = isForwarded ? 'none' : '0 4px 15px rgba(245, 158, 11, 0.4)';
          }}
        >
          Assign1 Material
        </button>
      </div>
    )}
    
    {activeTab === 'compareFile' && selectedFileForCompare && compareFileData.length > 0 && projectFileData.length > 0 && (
      <div style={{
        padding: window.innerWidth <= 768 ? '16px' : '20px',
        borderTop: `1px solid ${colors.border}`,
        display: 'flex',
        justifyContent: 'center',
        alignItems:'center',
      }}>
        <button
         onClick={() => {
  if (isForwarded) {
    alert('Data already forwarded. No modifications allowed.');
    return;
  }
  handleAssignFileToFile();
}}
          disabled={isForwarded}
          style={{
            background: isForwarded ? '#9ca3af' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            padding: window.innerWidth <= 768 ? '12px 28px' : '14px 40px',
            fontSize: window.innerWidth <= 768 ? '14px' : '16px',
            fontWeight: '600',
            cursor: isForwarded ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: isForwarded ? 'none' : '0 4px 15px rgba(245, 158, 11, 0.4)',
            transform: 'scale(1)',
            opacity: isForwarded ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isForwarded) {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.5)';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = isForwarded ? 'none' : '0 4px 15px rgba(245, 158, 11, 0.4)';
          }}
        >
          Assign2 Material
        </button>
      </div>
    )}
  
    {activeTab !== 'compareFile' && activeTab !== 'comparePO' && activeTab !== 'finalReq' && (
      <div style={{
        padding: window.innerWidth <= 768 ? '16px' : '20px',
        borderTop: `1px solid ${colors.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div style={{
          fontSize: '14px',
          color: colors.text,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <AlertCircle size={18} />
          <span>
            {selectedRows.size} of {filteredData.length} selected
          </span>
        </div>
        <button
          onClick={handleAssignStock}
          disabled={selectedRows.size === 0 || isForwarded}
          style={{
            background: (selectedRows.size === 0 || isForwarded) ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            padding: window.innerWidth <= 768 ? '12px 24px' : '14px 32px',
            fontSize: window.innerWidth <= 768 ? '14px' : '16px',
            fontWeight: '600',
            cursor: (selectedRows.size === 0 || isForwarded) ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: (selectedRows.size === 0 || isForwarded) ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.4)',
            transform: 'scale(1)',
            opacity: (selectedRows.size === 0 || isForwarded) ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            if (selectedRows.size > 0 && !isForwarded) {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = (selectedRows.size === 0 || isForwarded) ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.4)';
          }}
        >
          Assign Stock
        </button>
      </div>
    )}
  </div>

  {/* Info Cards */}
  {activeTab !== 'finalReq' && (
    <div style={{
      display: 'grid',
      gridTemplateColumns: window.innerWidth <= 768 
        ? '1fr' 
        : 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: window.innerWidth <= 768 ? '12px' : '20px',
      marginTop: window.innerWidth <= 768 ? '16px' : '24px',
    }}>
      {[
        { label: 'Total Items', value: filteredData.length, color: '#667eea' },
        { label: 'Selected', value: selectedRows.size, color: '#764ba2' },
        { label: 'Assigned', value: filteredData.filter(i => i.assigned_qty > 0).length, color: '#10b981' },
        { label: 'Pending', value: filteredData.filter(i => i.assigned_qty === 0).length, color: '#f59e0b' },
      ].map((stat, idx) => (
        <div
          key={idx}
          style={{
            background: colors.cardBg,
            borderRadius: '12px',
            padding: window.innerWidth <= 768 ? '16px' : '20px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            borderLeft: `4px solid ${stat.color}`,
          }}
        >
          <div style={{ 
            fontSize: window.innerWidth <= 768 ? '12px' : '14px', 
            color: colors.text, 
            marginBottom: '8px' 
          }}>
            {stat.label}
          </div>
          <div style={{ 
            fontSize: window.innerWidth <= 768 ? '24px' : '32px', 
            fontWeight: '700', 
            color: stat.color 
          }}>
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  )}

  {/* Forward Modal */}
  {showForwardModal && (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px',
    }}>
      <div style={{
        background: colors.cardBg,
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        position: 'relative',
      }}>
        <button
          onClick={() => setShowForwardModal(false)}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: colors.text,
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => e.target.style.background = colors.border}
          onMouseLeave={(e) => e.target.style.background = 'transparent'}
        >
          ×
        </button>

        <h2 style={{
          margin: '0 0 24px 0',
          fontSize: '24px',
          fontWeight: '700',
          color: colors.text,
          textAlign: 'center',
        }}>
          Forward Sheet
        </h2>

        <p style={{
          margin: '0 0 32px 0',
          fontSize: '16px',
          color: colors.text,
          textAlign: 'center',
          lineHeight: '1.6',
        }}>
          Do you want to send this data to Purchase Department?
        </p>

        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
        }}>
          <button
            onClick={() => setShowForwardModal(false)}
            style={{
              background: colors.border,
              color: colors.text,
              border: 'none',
              borderRadius: '12px',
              padding: '14px 32px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.8'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            Close
          </button>
          <button
            onClick={handleForwardSheet}
            style={{
              background: '#f97316',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '14px 32px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => e.target.style.background = '#ea580c'}
            onMouseLeave={(e) => e.target.style.background = '#f97316'}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )}

  <style>{`
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @media print {
      /* Hide everything except the final req table */
      body * {
        visibility: hidden;
      }
      
      /* Show only the table container and its children */
      .print-section, .print-section * {
        visibility: visible;
      }
      
      .print-section {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
      }

      /* Hide buttons, tabs, header actions, info cards */
      button, .no-print {
        display: none !important;
      }

      /* Adjust table styling for print */
      table {
        width: 100%;
        border-collapse: collapse;
      }

      th, td {
        border: 1px solid #000 !important;
        padding: 8px !important;
        font-size: 11px !important;
      }

      th {
        background-color: #f0f0f0 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  `}</style>
</div>
  );
};

const tableHeaderStyle = (colors) => ({
  padding: window.innerWidth <= 768 ? '12px 8px' : '16px',
  textAlign: 'left',
  fontSize: window.innerWidth <= 768 ? '11px' : '13px',
  fontWeight: '700',
  color: colors.text,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
});

const tableCellStyle = (colors) => ({
  padding: window.innerWidth <= 768 ? '12px 8px' : '16px',
  fontSize: window.innerWidth <= 768 ? '12px' : '14px',
  color: colors.text,
});

export default ModernMaterialAssign;