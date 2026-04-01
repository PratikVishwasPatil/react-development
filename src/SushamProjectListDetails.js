import React, { useState, useEffect } from 'react';
import { Download, Printer, FileText, Wrench, CheckCircle, Package, Layers, RefreshCw, FileDown, Loader } from 'lucide-react';

const SushamProjectDetail = () => {
  const [activeStaticTab, setActiveStaticTab] = useState('smetal');
  const [activeSubTab, setActiveSubTab] = useState('drawing');
  const [activeDynamicTab, setActiveDynamicTab] = useState('');
  const [theme, setTheme] = useState('light');
  const [dynamicTabs, setDynamicTabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  
  const [drawingData, setDrawingData] = useState([]);
  const [leftOverData, setLeftOverData] = useState([]);
  const [materialData, setMaterialData] = useState([]);
  const [specData, setSpecData] = useState(null);
  const [error, setError] = useState(null);

  const [rfdTable1Data, setRfdTable1Data] = useState([]);
const [rfdTable2Data, setRfdTable2Data] = useState([]);
const [rfdTable3Data, setRfdTable3Data] = useState({ data: [], totals: {} });
const [rfdTable4Data, setRfdTable4Data] = useState({ data: [], totals: {} });

// Add this state at the top with other states
const [leftOverInputs, setLeftOverInputs] = useState({});
const [submitting, setSubmitting] = useState(false);

// Add these states at the top with other states
const [materialInputs, setMaterialInputs] = useState({});
const [materialSubmitting, setMaterialSubmitting] = useState(false);
  
const [selectedMaterials, setSelectedMaterials] = useState([]);
  const getFileIdFromUrl = () => {
    const hash = window.location.hash;
    const match = hash.match(/\/project-detail\/(\d+)/);
    return match ? match[1] : '5700';
  };
  
  const fileId = getFileIdFromUrl();

  const staticTabs = [
    { id: 'smetal', label: 'SMetal' },
    { id: 'foundation', label: 'Foundation' },
    { id: 'fabrication', label: 'Fabrication' }
  ];

  const subTabs = [
    { id: 'rfd-material-list', label: 'RFD Material List', icon: FileText },
    { id: 'drawing', label: 'Drawing', icon: FileText },
    { id: 'rfd-completion', label: 'RFD Completion Status', icon: CheckCircle },
    { id: 'left-over', label: 'Left Over', icon: Wrench },
    { id: 'material', label: 'Material', icon: Package }
  ];

  const BASE_URL = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/susham";

  

 const getApiEndpoints = () => {
  if (activeStaticTab === 'smetal') {
    return {
      tabs: `${BASE_URL}/getTabsRfdApi.php?fileId=${fileId}`,
      spec: (tabName) => `${BASE_URL}/specFileApi.php?fileId=${fileId}&&tabName=${tabName}`,
      drawing: `${BASE_URL}/smetalDrawingListApi.php?fileId=${fileId}`,
      leftover: `${BASE_URL}/smetalLeftOverApi.php?fileId=${fileId}`,
      material: `${BASE_URL}/smetalMaterialListApi.php?fileId=${fileId}`,
      rfdCompletion1: `${BASE_URL}/RfdCompletionApi.php?fileId=${fileId}`,
      rfdCompletion2: `${BASE_URL}/RfdMaterialList2Api.php?fileId=${fileId}`,
      rfdCompletion3: `${BASE_URL}/RfdMaterialList3Api.php?fileId=${fileId}`,
      rfdCompletion4: `${BASE_URL}/RfdMaterialList4Api.php?fileId=${fileId}`
    };
  } else if (activeStaticTab === 'foundation') {
    return {
      tabs: `${BASE_URL}/getTabsfoundApi.php?fileId=${fileId}`,
      spec: (tabName) => `${BASE_URL}/specFileApi.php?fileId=${fileId}&&tabName=${tabName}`,
      drawing: `${BASE_URL}/foundDrawingListApi.php?fileId=${fileId}`,
      leftover: `${BASE_URL}/foundLeftOverMaterialApi.php?fileId=${fileId}`,
      material: `${BASE_URL}/foundMaterialListApi.php?fileId=${fileId}`,
      rfdCompletion1: `${BASE_URL}/RfdCompletionApi.php?fileId=${fileId}`,
      rfdCompletion2: `${BASE_URL}/RfdMaterialList2Api.php?fileId=${fileId}`,
      rfdCompletion3: `${BASE_URL}/RfdMaterialList3Api.php?fileId=${fileId}`,
      rfdCompletion4: `${BASE_URL}/RfdMaterialList4Api.php?fileId=${fileId}`
    };
  } else if (activeStaticTab === 'fabrication') {
    return {
      tabs: `${BASE_URL}/getTabsfabApi.php?fileId=${fileId}`,
      spec: (tabName) => `${BASE_URL}/specFileApi.php?fileId=${fileId}&&tabName=${tabName}`,
      drawing: `${BASE_URL}/fabDrawingListApi.php?fileId=${fileId}`,
      leftover: `${BASE_URL}/fabLeftOverMaterialApi.php?fileId=${fileId}`,
      material: `${BASE_URL}/fabMaterialListApi.php?fileId=${fileId}`,
      rfdCompletion1: `${BASE_URL}/RfdCompletionApi.php?fileId=${fileId}`,
      rfdCompletion2: `${BASE_URL}/RfdMaterialList2Api.php?fileId=${fileId}`,
      rfdCompletion3: `${BASE_URL}/RfdMaterialList3Api.php?fileId=${fileId}`,
      rfdCompletion4: `${BASE_URL}/RfdMaterialList4Api.php?fileId=${fileId}`
    };
  }
  return null;
};

  useEffect(() => {
    fetchDynamicTabs();
  }, [activeStaticTab]);

  useEffect(() => {
    if (activeDynamicTab) {
      fetchSpecData(activeDynamicTab);
    }
  }, [activeDynamicTab]);

 useEffect(() => {
  if (activeSubTab === 'drawing') {
    fetchDrawingData();
  } else if (activeSubTab === 'left-over') {
    fetchLeftOverData();
  } else if (activeSubTab === 'material') {
    fetchMaterialData();
  } else if (activeSubTab === 'rfd-completion') {
    fetchRfdCompletionData();
  }
}, [activeSubTab, activeStaticTab]);

  const fetchDynamicTabs = async () => {
    try {
      setLoading(true);
      setError(null);
      const endpoints = getApiEndpoints();
      if (!endpoints) return;

      const response = await fetch(endpoints.tabs);
      const result = await response.json();
      
      if (result.status && result.data && result.data.length > 0) {
        setDynamicTabs(result.data);
        const activeTab = result.data.find(tab => tab.is_active || tab.tab_active);
        if (activeTab) {
          setActiveDynamicTab(activeTab.sheet_key);
        }
      }
    } catch (err) {
      setError('Failed to load tabs: ' + err.message);
      console.error('Error fetching tabs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecData = async (tabName) => {
    try {
      setDataLoading(true);
      setError(null);
      const endpoints = getApiEndpoints();
      if (!endpoints) return;

      const response = await fetch(endpoints.spec(tabName));
      const result = await response.json();
      
      if (result.status) {
        setSpecData(result);
      } else {
        setError('No data available for this tab');
      }
    } catch (err) {
      setError('Failed to load data: ' + err.message);
      console.error('Error fetching spec data:', err);
    } finally {
      setDataLoading(false);
    }
  };

  const fetchDrawingData = async () => {
    try {
      setDataLoading(true);
      const endpoints = getApiEndpoints();
      if (!endpoints) return;

      const response = await fetch(endpoints.drawing);
      const result = await response.json();
      
      if (result.status && result.data) {
        setDrawingData(result.data);
      } else {
        setDrawingData([]);
      }
    } catch (err) {
      console.error('Error fetching drawing data:', err);
      setDrawingData([]);
    } finally {
      setDataLoading(false);
    }
  };

  const fetchLeftOverData = async () => {
    try {
      setDataLoading(true);
      const endpoints = getApiEndpoints();
      if (!endpoints) return;

      const response = await fetch(endpoints.leftover);
      const result = await response.json();
      
      if (result.status && result.data) {
        setLeftOverData(result.data);
      } else {
        setLeftOverData([]);
      }
    } catch (err) {
      console.error('Error fetching leftover data:', err);
      setLeftOverData([]);
    } finally {
      setDataLoading(false);
    }
  };

  const fetchMaterialData = async () => {
    try {
      setDataLoading(true);
      const endpoints = getApiEndpoints();
      if (!endpoints) return;

      const response = await fetch(endpoints.material);
      const result = await response.json();
      
      if (result.status && result.data) {
        setMaterialData(result.data);
      } else {
        setMaterialData([]);
      }
    } catch (err) {
      console.error('Error fetching material data:', err);
      setMaterialData([]);
    } finally {
      setDataLoading(false);
    }
  };

  const fetchRfdCompletionData = async () => {
  try {
    setDataLoading(true);
    const endpoints = getApiEndpoints();
    if (!endpoints) return;

    // Fetch all 4 tables
    const [res1, res2, res3, res4] = await Promise.all([
      fetch(endpoints.rfdCompletion1),
      fetch(endpoints.rfdCompletion2),
      fetch(endpoints.rfdCompletion3),
      fetch(endpoints.rfdCompletion4)
    ]);

    const [data1, data2, data3, data4] = await Promise.all([
      res1.json(),
      res2.json(),
      res3.json(),
      res4.json()
    ]);

    if (data1.status && data1.items) {
      setRfdTable1Data(data1.items);
    } else {
      setRfdTable1Data([]);
    }

    if (data2.status && data2.data) {
      setRfdTable2Data(data2.data);
    } else {
      setRfdTable2Data([]);
    }

    setRfdTable3Data(data3.status ? data3 : { data: [], totals: {} });
    setRfdTable4Data(data4.status ? data4 : { data: [], totals: {} });

  } catch (err) {
    console.error('Error fetching RFD completion data:', err);
    setRfdTable1Data([]);
    setRfdTable2Data([]);
    setRfdTable3Data({ data: [], totals: {} });
    setRfdTable4Data({ data: [], totals: {} });
  } finally {
    setDataLoading(false);
  }
};

  const getThemeStyles = () => {
    if (theme === 'dark') {
      return {
        backgroundColor: '#0f172a',
        color: '#f1f5f9',
        cardBg: '#1e293b',
        inputBg: '#0f172a',
        inputBorder: '#334155',
        inputColor: '#f1f5f9',
        tabBg: '#334155',
        tabActiveBg: '#ef4444',
        buttonBg: '#ef4444',
        buttonHover: '#dc2626',
        labelColor: '#94a3b8',
        borderColor: '#334155',
        tableBg: '#1e293b',
        tableHeaderBg: '#334155',
        tableRowHover: '#334155'
      };
    }
    return {
      backgroundColor: '#f8fafc',
      color: '#0f172a',
      cardBg: '#ffffff',
      inputBg: '#ffffff',
      inputBorder: '#e2e8f0',
      inputColor: '#0f172a',
      tabBg: '#f1f5f9',
      tabActiveBg: '#ef4444',
      buttonBg: '#ef4444',
      buttonHover: '#dc2626',
      labelColor: '#64748b',
      borderColor: '#e2e8f0',
      tableBg: '#ffffff',
      tableHeaderBg: '#fef3c7',
      tableRowHover: '#f8fafc'
    };
  };

  const themeStyles = getThemeStyles();

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // const groupRowsByCategory = (rows) => {
  //   const categories = [];
  //   let currentCategory = null;
  //   let currentItems = [];

  //   rows.forEach((row, index) => {
  //     const isCategoryHeader = row[1] && (
  //       row[1].includes('Front Panel') || 
  //       row[1].includes('DGuard') || 
  //       row[1].includes('DG PANELS') ||
  //       row[1].includes('DB Cover') ||
  //       row[1].includes('Mounting Angles') ||
  //       row[1].includes('Front Panels') ||
  //       row[1].includes('Specification')
  //     ) && (!row[0] || row[0] === '');

  //     if (isCategoryHeader) {
  //       if (currentCategory) {
  //         categories.push({
  //           category: currentCategory,
  //           items: currentItems
  //         });
  //       }
  //       currentCategory = row[1];
  //       currentItems = [];
  //     } else if (row[0] && (row[0].startsWith('s') || row[0].startsWith('fd'))) {
  //       currentItems.push(row);
  //     }
  //   });

  //   if (currentCategory && currentItems.length > 0) {
  //     categories.push({
  //       category: currentCategory,
  //       items: currentItems
  //     });
  //   }

  //   return categories;
  // };

  const groupRowsByCategory = (rows) => {
  // If no rows or very few rows, return single category with all items
  if (!rows || rows.length <= 2) {
    return [{
      category: 'Items',
      items: rows.filter(row => row && row.length > 0)
    }];
  }

  const categories = [];
  let currentCategory = null;
  let currentItems = [];

  rows.forEach((row, index) => {
    const isCategoryHeader = row[1] && (
      row[1].includes('Front Panel') || 
      row[1].includes('DGuard') || 
      row[1].includes('DG PANELS') ||
      row[1].includes('DB Cover') ||
      row[1].includes('Mounting Angles') ||
      row[1].includes('Front Panels') ||
      row[1].includes('Specification') ||
      row[1].includes('ANGLE FRAMES') ||
      row[1].includes('FRAMES')
    ) && (!row[0] || row[0] === '');

    if (isCategoryHeader) {
      if (currentCategory) {
        categories.push({
          category: currentCategory,
          items: currentItems
        });
      }
      currentCategory = row[1];
      currentItems = [];
    } else if (row[0] && (row[0].startsWith('s') || row[0].startsWith('fd') || row[0].startsWith('f'))) {
      currentItems.push(row);
    } else if (!currentCategory && row && row.length > 0) {
      // For rows without category (like fabrication), add them directly
      currentItems.push(row);
    }
  });

  // Add last category or all items if no category found
  if (currentCategory && currentItems.length > 0) {
    categories.push({
      category: currentCategory,
      items: currentItems
    });
  } else if (currentItems.length > 0) {
    categories.push({
      category: 'Items',
      items: currentItems
    });
  }

  // If no categories found, create one with all non-empty rows
  if (categories.length === 0) {
    const allItems = rows.filter(row => row && row.length > 0 && row.some(cell => cell !== '' && cell !== null));
    if (allItems.length > 0) {
      categories.push({
        category: 'Fabrication Items',
        items: allItems
      });
    }
  }

  return categories;
};
  const renderRFDMaterialList = () => {
    if (!specData || !specData.rows) {
      return (
        <div style={{
          backgroundColor: themeStyles.cardBg,
          borderRadius: '12px',
          padding: '60px 24px',
          textAlign: 'right',
          color: themeStyles.labelColor
        }}>
          <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <div>No data available</div>
        </div>
      );
    }

    const categories = groupRowsByCategory(specData.rows);

    return (
      <div style={{ overflowX: 'auto' }}>
      <style>{`
  table tbody td {
    text-align: right !important;
  }
  table tbody td:first-child,
  table tbody td:nth-child(2) {
    text-align: left !important;
  }
  table tbody td input {
    text-align: right !important;
  }
`}</style>
        <div style={{
          backgroundColor: themeStyles.cardBg,
          borderRadius: '12px',
          border: `1px solid ${themeStyles.borderColor}`,
          overflow: 'hidden',
          boxShadow: theme === 'dark' ? '0 10px 25px -5px rgba(0, 0, 0, 0.5)' : '0 4px 15px -2px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            backgroundColor: theme === 'dark' ? '#334155' : '#f8fafc',
            padding: '16px 24px',
            borderBottom: `2px solid ${themeStyles.borderColor}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ fontSize: '14px' }}>
              <span style={{ fontWeight: '700', color: themeStyles.color }}>{specData.meta?.fileName || 'File'}</span>
              <span style={{ marginLeft: '16px', color: themeStyles.labelColor, fontSize: '13px' }}>
                📤 Uploaded By: {specData.meta?.uploadedBy} • {specData.meta?.uploadedTime}
              </span>
            </div>
          </div>
          
          {categories.map((section, idx) => (
            <div key={idx} style={{ borderBottom: `1px solid ${themeStyles.borderColor}` }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: themeStyles.tableHeaderBg }}>
                    <td colSpan="20" style={{
                      padding: '12px 16px',
                      border: `1px solid ${themeStyles.borderColor}`,
                      fontWeight: '700',
                      fontSize: '13px',
                      color: theme === 'dark' ? '#fbbf24' : '#92400e'
                    }}>
                      {section.category}
                    </td>
                  </tr>
                  <tr style={{ backgroundColor: theme === 'dark' ? '#422006' : '#fef3c7' }}>
                    {specData.headers && specData.headers.slice(0, 16).map((header, hIdx) => (
                      <td key={hIdx} style={{
                        padding: '8px 12px',
                        border: `1px solid ${themeStyles.borderColor}`,
                        fontSize: '11px',
                        fontWeight: '600',
                        minWidth: hIdx === 1 ? '200px' : '80px'
                      }}>
                        {header.replace('COL_', '')}
                      </td>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.items.map((item, itemIdx) => (
                    <tr key={itemIdx} style={{
                      backgroundColor: itemIdx % 2 === 0 ? themeStyles.cardBg : (theme === 'dark' ? '#1e293b' : '#f9fafb'),
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeStyles.tableRowHover}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = itemIdx % 2 === 0 ? themeStyles.cardBg : (theme === 'dark' ? '#1e293b' : '#f9fafb')}
                    >
                      {item.slice(0, 16).map((cell, cellIdx) => (
                        <td key={cellIdx} style={{
                          padding: '10px 12px',
                          border: `1px solid ${themeStyles.borderColor}`,
                          fontSize: '12px',
                          fontWeight: cellIdx === 0 ? '600' : cellIdx === 1 ? '500' : '400',
                          textAlign: cellIdx > 1 ? 'center' : 'left',
                          backgroundColor: cell === '50' ? (theme === 'dark' ? '#fbbf24' : '#fef3c7') : 'transparent',
                          color: cell === '50' ? (theme === 'dark' ? '#000' : '#92400e') : 'inherit'
                        }}>
                          {cell || ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
          
          <div style={{ padding: '24px', textAlign: 'right', backgroundColor: themeStyles.cardBg }}>
            <button style={{
              backgroundColor: themeStyles.buttonBg,
              color: '#ffffff',
              padding: '12px 48px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
            }}>
              <Printer style={{ display: 'inline-block', marginRight: '8px', verticalAlign: 'middle' }} size={16} />
              Print Material List
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderDrawing = () => {
    if (drawingData.length === 0) {
      return (
        <div style={{
          backgroundColor: themeStyles.cardBg,
          borderRadius: '12px',
          border: `1px solid ${themeStyles.borderColor}`,
          overflow: 'hidden',
          boxShadow: theme === 'dark' ? '0 10px 25px -5px rgba(0, 0, 0, 0.5)' : '0 4px 15px -2px rgba(0, 0, 0, 0.1)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#ff6b35' }}>
                <td style={{ padding: '12px 16px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '13px', fontWeight: '600', color: '#000000' }}>Sr No</td>
                <td style={{ padding: '12px 16px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '13px', fontWeight: '600', color: '#000000' }}>Drawing Name</td>
                <td style={{ padding: '12px 16px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '13px', fontWeight: '600', color: '#000000' }}>Uploaded Date</td>
                <td style={{ padding: '12px 16px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '13px', fontWeight: '600', color: '#000000' }}>Action</td>
                <td style={{ padding: '12px 16px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '13px', fontWeight: '600', color: '#000000' }}>Print</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="5" style={{ padding: '80px 24px', textAlign: 'right', color: themeStyles.labelColor }}>
                  <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                  <div style={{ fontSize: '15px', fontWeight: '500' }}>No drawings available</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: `1px solid ${themeStyles.borderColor}` }}>
          <thead>
            <tr style={{ backgroundColor: '#ff6b35' }}>
              <td style={{ padding: '12px 16px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '13px', fontWeight: '600', color: '#000000', width: '80px' }}>Sr No</td>
              <td style={{ padding: '12px 16px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '13px', fontWeight: '600', color: '#000000' }}>Drawing Name</td>
              <td style={{ padding: '12px 16px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '13px', fontWeight: '600', color: '#000000', width: '200px' }}>Uploaded Date</td>
              <td style={{ padding: '12px 16px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '13px', fontWeight: '600', color: '#000000', width: '120px' }}>Action</td>
              <td style={{ padding: '12px 16px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '13px', fontWeight: '600', color: '#000000', width: '120px' }}>Print</td>
            </tr>
          </thead>
          <tbody>
            {drawingData.map((drawing, index) => (
              <tr key={drawing.doc_id} style={{
                backgroundColor: themeStyles.cardBg,
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? '#2d3748' : '#f7fafc'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = themeStyles.cardBg}
              >
                <td style={{
                  padding: '10px 16px',
                  border: `1px solid ${themeStyles.borderColor}`,
                  fontSize: '13px',
                  fontWeight: '400',
                  textAlign: 'right',
                  color: themeStyles.color
                }}>
                  {drawing.sr_no}
                </td>
                <td style={{
                  padding: '10px 16px',
                  border: `1px solid ${themeStyles.borderColor}`,
                  fontSize: '13px',
                  fontWeight: '400',
                  color: themeStyles.color
                }}>
                  {drawing.document_name}
                </td>
                <td style={{
                  padding: '10px 16px',
                  border: `1px solid ${themeStyles.borderColor}`,
                  fontSize: '13px',
                  color: themeStyles.color
                }}>
                  {drawing.uploaded_on || drawing.timestamp}
                </td>
                <td style={{
                  padding: '10px 16px',
                  border: `1px solid ${themeStyles.borderColor}`,
                  textAlign: 'right'
                }}>
                  <a
                    href={`https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/susham/${drawing.document_url.replace('../', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#dc3545',
                      textDecoration: 'none',
                      fontSize: '20px',
                      display: 'inline-block',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                    }}
                    title="View PDF"
                  >
                    📄
                  </a>
                </td>
                <td style={{
                  padding: '10px 16px',
                  border: `1px solid ${themeStyles.borderColor}`,
                  textAlign: 'right'
                }}>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input type="checkbox" style={{ cursor: 'pointer' }} />
                    <span style={{ fontSize: '16px' }}>🖨️</span>
                    <span style={{ fontSize: '12px', color: themeStyles.color }}>Print</span>
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderLeftOver = () => {
  if (leftOverData.length === 0) {
    return (
      <div style={{
        backgroundColor: themeStyles.cardBg,
        borderRadius: '12px',
        padding: '60px 24px',
        textAlign: 'right',
        color: themeStyles.labelColor
      }}>
        <Wrench size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
        <div>No leftover materials available</div>
      </div>
    );
  }

  const handleInputChange = (materialId, value) => {
    setLeftOverInputs(prev => ({
      ...prev,
      [materialId]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      // Prepare data
      const rowids = [];
      const leftover = [];
      
      leftOverData.forEach(item => {
        const materialId = item.material_id || item.id;
        const inputValue = leftOverInputs[materialId];
        
        if (inputValue && inputValue.trim() !== '') {
          rowids.push(materialId);
          leftover.push(inputValue);
        }
      });

      if (rowids.length === 0) {
        alert('Please enter at least one quantity');
        setSubmitting(false);
        return;
      }

      // Determine API endpoint based on active tab
      let apiUrl = '';
      if (activeStaticTab === 'smetal') {
        apiUrl = `${BASE_URL}/SaveSmetalLeftOverApi.php`;
      } else if (activeStaticTab === 'foundation') {
        apiUrl = `${BASE_URL}/SaveFoundlLeftOverApi.php`;
      } else if (activeStaticTab === 'fabrication') {
        apiUrl = `${BASE_URL}/SaveFabLeftOverApi.php`;
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileId: fileId,
          rowids: rowids,
          leftover: leftover
        })
      });

      const result = await response.json();
      
      if (result.status) {
        alert(result.message || 'Material Track Saved Successfully');
        // Clear inputs
        setLeftOverInputs({});
        // Refresh data
        fetchLeftOverData();
      } else {
        alert(result.message || 'Failed to save data');
      }
    } catch (err) {
      console.error('Error submitting leftover data:', err);
      alert('Error submitting data: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: `1px solid ${themeStyles.borderColor}` }}>
          <thead>
            <tr style={{ backgroundColor: '#ff6b35' }}>
              <td style={{ padding: '12px 16px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '13px', fontWeight: '600', color: '#000000' }}>Material Name</td>
              <td style={{ padding: '12px 16px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '13px', fontWeight: '600', color: '#000000', width: '150px' }}>Assigned Qty</td>
              <td style={{ padding: '12px 16px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '13px', fontWeight: '600', color: '#000000', width: '150px' }}>Enter Qty</td>
            </tr>
          </thead>
          <tbody>
            {leftOverData.map((item, index) => {
              const materialId = item.material_id || item.id;
              return (
                <tr key={materialId || index} style={{
                  backgroundColor: themeStyles.cardBg,
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? '#2d3748' : '#f7fafc'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = themeStyles.cardBg}
                >
                  <td style={{
                    padding: '10px 16px',
                    border: `1px solid ${themeStyles.borderColor}`,
                    fontSize: '13px',
                    fontWeight: '400',
                    color: themeStyles.color
                  }}>
                    {item.material_name}
                  </td>
                  <td style={{
                    padding: '10px 16px',
                    border: `1px solid ${themeStyles.borderColor}`,
                    fontSize: '13px',
                    fontWeight: '400',
                    textAlign: 'right',
                    color: themeStyles.color
                  }}>
                    {item.assigned_qty}
                  </td>
                  <td style={{
                    padding: '10px 16px',
                    border: `1px solid ${themeStyles.borderColor}`,
                    textAlign: 'right'
                  }}>
                    <input 
                      type="text"
                      value={leftOverInputs[materialId] || ''}
                      onChange={(e) => handleInputChange(materialId, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        border: `1px solid ${themeStyles.borderColor}`,
                        borderRadius: '4px',
                        backgroundColor: themeStyles.inputBg,
                        color: themeStyles.color,
                        fontSize: '13px',
                        textAlign: 'right'
                      }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div style={{ marginTop: '20px', textAlign: 'right' }}>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            backgroundColor: submitting ? '#94a3b8' : '#ff6b35',
            color: '#ffffff',
            padding: '12px 48px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: submitting ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (!submitting) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(255, 107, 53, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!submitting) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(255, 107, 53, 0.3)';
            }
          }}
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </div>
  );
};


const renderMaterial = () => {
  if (materialData.length === 0) {
    return (
      <div style={{
        backgroundColor: themeStyles.cardBg,
        borderRadius: '12px',
        padding: '60px 24px',
        textAlign: 'right',
        color: themeStyles.labelColor
      }}>
        <Package size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
        <div>No material data available</div>
      </div>
    );
  }

  const handleCheckboxChange = (materialId) => {
    setSelectedMaterials(prev => {
      if (prev.includes(materialId)) {
        return prev.filter(id => id !== materialId);
      } else {
        return [...prev, materialId];
      }
    });
  };

  const handleReturnQtyChange = (materialId, value) => {
    setMaterialInputs(prev => ({
      ...prev,
      [materialId]: value
    }));
  };

  const handleSendMaterial = async () => {
    try {
      setMaterialSubmitting(true);

      const selectedItems = materialData.filter((item, index) => 
        selectedMaterials.includes(item.material_id || index)
      );

      if (selectedItems.length === 0) {
        alert('Please select at least one material');
        setMaterialSubmitting(false);
        return;
      }

      // Determine type based on active tab
      let type = '';
      if (activeStaticTab === 'smetal') {
        type = 'sheetmetal';
      } else if (activeStaticTab === 'foundation') {
        type = 'foundation';
      } else if (activeStaticTab === 'fabrication') {
        type = 'fabrication';
      }

      const apiUrl = `${BASE_URL}/ReturnStockApi.php`;

      // Submit each selected material
      const promises = selectedItems.map(async (item) => {
        const materialId = item.material_id || item.id;
        const returnQty = materialInputs[materialId] || item.qty_remaining || 0;
        const dcId = item.dc_id || item.chalan_id;

        const formData = new FormData();
        formData.append('remain', returnQty);
        formData.append('name', materialId);
        formData.append('fileid', fileId);
        formData.append('type', type);
        formData.append('dc_value', dcId);
        formData.append('employee_id', 'vendor'); // You might want to get this from user session

        const response = await fetch(apiUrl, {
          method: 'POST',
          body: formData
        });

        return response.json();
      });

      const results = await Promise.all(promises);

      const allSuccess = results.every(result => result.status);

      if (allSuccess) {
        alert('Materials returned to stock successfully');
        // Clear selections and inputs
        setSelectedMaterials([]);
        setMaterialInputs({});
        // Refresh data
        fetchMaterialData();
      } else {
        const failedCount = results.filter(r => !r.status).length;
        alert(`${results.length - failedCount} materials returned successfully, ${failedCount} failed`);
      }

    } catch (err) {
      console.error('Error submitting material data:', err);
      alert('Error submitting data: ' + err.message);
    } finally {
      setMaterialSubmitting(false);
    }
  };

  return (
    <div>
      {/* Export Button - positioned at top right */}
      <div style={{ textAlign: 'right', marginBottom: '16px' }}>
        <button
          style={{
            backgroundColor: '#ff6b35',
            color: '#ffffff',
            padding: '10px 40px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 16px rgba(255, 107, 53, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(255, 107, 53, 0.3)';
          }}
        >
          Export
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: `1px solid ${themeStyles.borderColor}`, minWidth: '1400px' }}>
          <thead>
            <tr style={{ backgroundColor: '#ff6b35' }}>
              <td style={{ padding: '12px 16px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '13px', fontWeight: '600', color: '#000000', width: '120px' }}>Chalan Id</td>
              <td style={{ padding: '12px 16px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '13px', fontWeight: '600', color: '#000000' }}>Material Name</td>
              <td style={{ padding: '12px 16px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '13px', fontWeight: '600', color: '#000000', width: '90px' }}>Quantity</td>
              <td style={{ padding: '12px 16px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '13px', fontWeight: '600', color: '#000000', width: '90px' }}>Enter Qty</td>
              <td style={{ padding: '12px 16px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '13px', fontWeight: '600', color: '#000000', width: '130px' }}>Consumed Qty.</td>
              <td style={{ padding: '12px 16px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '13px', fontWeight: '600', color: '#000000', width: '130px' }}>Remaining Qty</td>
              <td style={{ padding: '12px 16px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '13px', fontWeight: '600', color: '#000000', width: '100px' }}>Return Qty</td>
              <td style={{ padding: '12px 16px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '13px', fontWeight: '600', color: '#000000', width: '140px' }}>Total Returned Qty</td>
              <td style={{ padding: '12px 16px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '13px', fontWeight: '600', color: '#000000', width: '80px' }}>Return</td>
              <td style={{ padding: '12px 16px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '13px', fontWeight: '600', color: '#000000', width: '80px' }}>Unit</td>
              <td style={{ padding: '12px 16px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '13px', fontWeight: '600', color: '#000000', width: '80px' }}>Action</td>
            </tr>
          </thead>
          <tbody>
            {materialData.map((item, index) => {
              const materialId = item.material_id || index;
              return (
                <tr key={materialId} style={{
                  backgroundColor: themeStyles.cardBg,
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? '#2d3748' : '#f7fafc'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = themeStyles.cardBg}
                >
                  <td style={{
                    padding: '10px 16px',
                    border: `1px solid ${themeStyles.borderColor}`,
                    fontSize: '13px',
                    fontWeight: '400',
                    textAlign: 'right',
                    color: themeStyles.color
                  }}>
                    {item.dc_id || item.chalan_id}
                  </td>
                  <td style={{
                    padding: '10px 16px',
                    border: `1px solid ${themeStyles.borderColor}`,
                    fontSize: '13px',
                    fontWeight: '400',
                    color: themeStyles.color
                  }}>
                    {item.material_name}
                  </td>
                  <td style={{
                    padding: '10px 16px',
                    border: `1px solid ${themeStyles.borderColor}`,
                    fontSize: '13px',
                    fontWeight: '400',
                    textAlign: 'right',
                    color: themeStyles.color
                  }}>
                    {item.qty_assigned || item.quantity}
                  </td>
                  <td style={{
                    padding: '10px 16px',
                    border: `1px solid ${themeStyles.borderColor}`,
                    textAlign: 'right',
                    backgroundColor: theme === 'dark' ? '#1a202c' : '#e2e8f0'
                  }}>
                    <input 
                      type="text"
                      value={item.qty_consumed || 0}
                      readOnly
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        border: `1px solid ${themeStyles.borderColor}`,
                        borderRadius: '4px',
                        backgroundColor: 'transparent',
                        color: themeStyles.color,
                        fontSize: '13px',
                        textAlign: 'right',
                        cursor: 'not-allowed'
                      }}
                    />
                  </td>
                  <td style={{
                    padding: '10px 16px',
                    border: `1px solid ${themeStyles.borderColor}`,
                    fontSize: '13px',
                    fontWeight: '400',
                    textAlign: 'right',
                    color: themeStyles.color,
                    backgroundColor: theme === 'dark' ? '#1a202c' : '#e2e8f0'
                  }}>
                    {item.qty_consumed || 0}
                  </td>
                  <td style={{
                    padding: '10px 16px',
                    border: `1px solid ${themeStyles.borderColor}`,
                    fontSize: '13px',
                    fontWeight: '400',
                    textAlign: 'right',
                    color: themeStyles.color,
                    backgroundColor: theme === 'dark' ? '#1a202c' : '#e2e8f0'
                  }}>
                    {item.qty_remaining}
                  </td>
                  <td style={{
                    padding: '10px 16px',
                    border: `1px solid ${themeStyles.borderColor}`,
                    textAlign: 'right'
                  }}>
                    <input 
                      type="text"
                      value={materialInputs[materialId] || ''}
                      onChange={(e) => handleReturnQtyChange(materialId, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        border: `1px solid ${themeStyles.borderColor}`,
                        borderRadius: '4px',
                        backgroundColor: themeStyles.inputBg,
                        color: themeStyles.color,
                        fontSize: '13px',
                        textAlign: 'right'
                      }}
                    />
                  </td>
                  <td style={{
                    padding: '10px 16px',
                    border: `1px solid ${themeStyles.borderColor}`,
                    fontSize: '13px',
                    fontWeight: '400',
                    textAlign: 'right',
                    color: themeStyles.color
                  }}>
                    NO
                  </td>
                  <td style={{
                    padding: '10px 16px',
                    border: `1px solid ${themeStyles.borderColor}`,
                    fontSize: '13px',
                    fontWeight: '400',
                    textAlign: 'right',
                    color: themeStyles.color
                  }}>
                    {item.unit}
                  </td>
                  <td style={{
                    padding: '10px 16px',
                    border: `1px solid ${themeStyles.borderColor}`,
                    fontSize: '13px',
                    fontWeight: '400',
                    textAlign: 'right',
                    color: themeStyles.color
                  }}>
                    KG
                  </td>
                  <td style={{
                    padding: '10px 16px',
                    border: `1px solid ${themeStyles.borderColor}`,
                    textAlign: 'right'
                  }}>
                    <input 
                      type="checkbox"
                      checked={selectedMaterials.includes(materialId)}
                      onChange={() => handleCheckboxChange(materialId)}
                      style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {selectedMaterials.length > 0 && (
          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <button
              onClick={handleSendMaterial}
              disabled={materialSubmitting}
              style={{
                backgroundColor: materialSubmitting ? '#94a3b8' : '#ff6b35',
                color: '#ffffff',
                padding: '12px 48px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: materialSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!materialSubmitting) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(255, 107, 53, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!materialSubmitting) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(255, 107, 53, 0.3)';
                }
              }}
            >
              {materialSubmitting ? 'Sending...' : 'Send'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

  const renderRfdCompletion = () => {
  if (dataLoading) {
    return (
      <div style={{
        backgroundColor: themeStyles.cardBg,
        borderRadius: '12px',
        padding: '60px 24px',
        textAlign: 'right',
        color: themeStyles.labelColor
      }}>
        <Loader size={48} style={{ margin: '0 auto 16px' }} />
        <div>Loading RFD Completion Status...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Table 1 */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: `1px solid ${themeStyles.borderColor}`, minWidth: '2000px' }}>
          <thead>
            <tr style={{ backgroundColor: '#ff6b35' }}>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>Material Name</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>DC ID</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>Width</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>Height</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>Qty</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>COL/P-C</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>Assign Qty</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>Vendor</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000', backgroundColor: '#90EE90' }}>Semifinished Qty</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000', backgroundColor: '#90EE90' }}>RFD Qty</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000', backgroundColor: '#90EE90' }}>Completed Qty</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000', backgroundColor: '#90EE90' }}>Pending Qty</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000', backgroundColor: '#90EE90' }}>Dispatch Qty</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000', backgroundColor: '#90EE90' }}>Remaining Dispatch</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000', backgroundColor: '#90EE90' }}>Completed SHM Qty</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000', backgroundColor: '#90EE90' }}>Remaining SHM Qty</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>Enter SHM Qty</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>SHM Rate</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>SHM Amt</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>Sq Ft</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>PC Rate</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>Pc Amt</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>Total Amt</td>
            </tr>
          </thead>
          <tbody>
            {rfdTable1Data.length === 0 ? (
              <tr>
                <td colSpan="23" style={{ padding: '40px', textAlign: 'right', color: themeStyles.labelColor }}>No data available</td>
              </tr>
            ) : (
              rfdTable1Data.map((item, index) => (
                <tr key={item.row_id || index} style={{ backgroundColor: themeStyles.cardBg }}>
                  <td style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', color: themeStyles.color }}>{item.material}</td>
                  <td style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', color: themeStyles.color }}>{item.dc_id}</td>
                  <td style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', textAlign: 'right', color: themeStyles.color }}>{item.weight}</td>
                  <td style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', textAlign: 'right', color: themeStyles.color }}>{item.height}</td>
                  <td style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', textAlign: 'right', color: themeStyles.color }}>{item.qty}</td>
                  <td style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', color: themeStyles.color }}>{item.colour}</td>
                  <td style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', textAlign: 'right', color: themeStyles.color }}>{item.assignQty}</td>
                  <td style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', color: themeStyles.color }}>{item.vendor}</td>
                  <td style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', textAlign: 'right', backgroundColor: '#f0f9ff', color: themeStyles.color }}>-</td>
                  <td style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', textAlign: 'right', backgroundColor: '#f0f9ff', color: themeStyles.color }}>-</td>
                  <td style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', textAlign: 'right', backgroundColor: '#f0f9ff', color: themeStyles.color }}>{item.completedQty}</td>
                  <td style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', textAlign: 'right', backgroundColor: '#f0f9ff', color: themeStyles.color }}>{item.remainingQty}</td>
                  <td style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', textAlign: 'right', backgroundColor: '#f0f9ff', color: themeStyles.color }}>{item.dispatchQty}</td>
                  <td style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', textAlign: 'right', backgroundColor: '#f0f9ff', color: themeStyles.color }}>-</td>
                  <td style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', textAlign: 'right', backgroundColor: '#f0f9ff', color: themeStyles.color }}>-</td>
                  <td style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', textAlign: 'right', backgroundColor: '#f0f9ff', color: themeStyles.color }}>-</td>
                  <td style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}`, textAlign: 'right' }}>
                    <input type="text" style={{ width: '60px', padding: '4px', border: `1px solid ${themeStyles.borderColor}`, borderRadius: '4px', backgroundColor: themeStyles.inputBg, color: themeStyles.color, fontSize: '11px', textAlign: 'right' }} />
                  </td>
                  <td style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', textAlign: 'right', color: themeStyles.color }}>{item.sq_rate || ''}</td>
                  <td style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', textAlign: 'right', color: themeStyles.color }}>{item.sq_amount || ''}</td>
                  <td style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', textAlign: 'right', color: themeStyles.color }}>{item.sq_ft || ''}</td>
                  <td style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', textAlign: 'right', color: themeStyles.color }}>{item.pc_rate || ''}</td>
                  <td style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', textAlign: 'right', color: themeStyles.color }}>{item.pc_amount || ''}</td>
                  <td style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', textAlign: 'right', color: themeStyles.color }}>{item.totalAmt || ''}</td>
                </tr>
              ))
            )}
            {rfdTable1Data.length > 0 && (
              <tr style={{ backgroundColor: '#fffbeb' }}>
                <td colSpan="2" style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '12px', fontWeight: '700' }}>TOTAL</td>
                <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px' }}></td>
                <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px' }}></td>
                <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', textAlign: 'right', fontWeight: '600' }}>
                  {rfdTable1Data.reduce((sum, item) => sum + (parseInt(item.qty) || 0), 0)}
                </td>
                <td colSpan="18" style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}` }}></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table 2 */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: `1px solid ${themeStyles.borderColor}`, minWidth: '1600px' }}>
          <thead>
            <tr style={{ backgroundColor: '#90EE90' }}>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>Material Name(1)</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>DC ID</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>Width</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>Height</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>Qty</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>COL/P-C</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>Assign Qty</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>Vendor</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>SHM Qty</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>SHM Rate</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>SHM Amt</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>Sq Ft</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>PC Rate</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>Pc Amt</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>Total Amt</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>Datetime</td>
            </tr>
          </thead>
          <tbody>
            {rfdTable2Data.length === 0 ? (
              <tr>
                <td colSpan="16" style={{ padding: '40px', textAlign: 'right', color: themeStyles.labelColor }}>No data available</td>
              </tr>
            ) : (
              rfdTable2Data.map((item, index) => (
                <tr key={item.row_id || index} style={{ backgroundColor: themeStyles.cardBg }}>
                  <td style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', color: themeStyles.color }}>{item.material}</td>
                  <td style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', color: themeStyles.color }}>{item.dc_id}</td>
                  <td style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', textAlign: 'right', color: themeStyles.color }}>{item.weight}</td>
                  <td style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', textAlign: 'right', color: themeStyles.color }}>{item.height}</td>
                  <td style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', textAlign: 'right', color: themeStyles.color }}>{item.qty}</td>
                  <td style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', color: themeStyles.color }}>{item.colour}</td>
                  <td style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', textAlign: 'right', color: themeStyles.color }}>{item.assignQty}</td>
                  <td style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', color: themeStyles.color }}>{item.vendor}</td>
                  <td style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', textAlign: 'right', color: themeStyles.color }}>{item.labourQty || item.sqft || ''}</td>
                  <td style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', textAlign: 'right', color: themeStyles.color }}>{item.sq_rate || ''}</td>
                  <td style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', textAlign: 'right', color: themeStyles.color }}>{item.sq_amount || ''}</td>
                  <td style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', textAlign: 'right', color: themeStyles.color }}>{item.sqft || ''}</td>
                  <td style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', textAlign: 'right', color: themeStyles.color }}>{item.pc_rate || ''}</td>
                  <td style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', textAlign: 'right', color: themeStyles.color }}>{item.pc_amount || ''}</td>
                  <td style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', textAlign: 'right', color: themeStyles.color }}>{item.total_amount || ''}</td>
                  <td style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', color: themeStyles.color }}>{item.datetime || ''}</td>
                </tr>
              ))
            )}
            {rfdTable2Data.length > 0 && (
              <tr style={{ backgroundColor: '#fffbeb' }}>
                <td colSpan="4" style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '12px', fontWeight: '700' }}>TOTAL</td>
                <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', textAlign: 'right', fontWeight: '600' }}>
                  {rfdTable2Data.reduce((sum, item) => sum + (parseInt(item.qty) || 0), 0)}
                </td>
                <td colSpan="11" style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}` }}></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table 3 */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: `1px solid ${themeStyles.borderColor}` }}>
          <thead>
            <tr style={{ backgroundColor: '#ff6b35' }}>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>Material Name</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>SECOND DC ID</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>Width</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>Height</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>Qty</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>COL/P-C</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>Assign Qty</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>Vendor</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000', backgroundColor: '#90EE90' }}>Semifinished Qty</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000', backgroundColor: '#90EE90' }}>RFD Qty</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000', backgroundColor: '#90EE90' }}>Completed Qty</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000', backgroundColor: '#90EE90' }}>Pending Qty</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000', backgroundColor: '#90EE90' }}>Dispatch Qty</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000', backgroundColor: '#90EE90' }}>Remaining Dispatch</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000', backgroundColor: '#90EE90' }}>Completed SHM Qty</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000', backgroundColor: '#90EE90' }}>Remaining SHM Qty</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>Enter SHM Qty</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>SHM Rate</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>SHM Amt</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>Sq Ft</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>PC Rate</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>Pc Amt</td>
              <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>Total Amt</td>
            </tr>
          </thead>
          <tbody>
            {rfdTable3Data.data && rfdTable3Data.data.length === 0 ? (
              <tr>
                <td colSpan="23" style={{ padding: '40px', textAlign: 'right', color: themeStyles.labelColor }}>No data available</td>
              </tr>
            ) : (
              rfdTable3Data.data?.map((item, index) => (
                <tr key={index} style={{ backgroundColor: themeStyles.cardBg }}>
                  <td style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', color: themeStyles.color }}>{item.material}</td>
                  <td style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', color: themeStyles.color }}>{item.dc_id}</td>
                  <td style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', textAlign: 'right', color: themeStyles.color }}>{item.width}</td>
                  <td style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', textAlign: 'right', color: themeStyles.color }}>{item.height}</td>
                  <td style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', textAlign: 'right', color: themeStyles.color }}>{item.qty}</td>
                  <td style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', color: themeStyles.color }}>{item.colour}</td>
                  <td style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', textAlign: 'right', color: themeStyles.color }}>{item.assign_qty}</td>
                  <td style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', color: themeStyles.color }}>{item.vendor}</td>
                  <td style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', textAlign: 'right', backgroundColor: '#f0f9ff', color: themeStyles.color }}>-</td>
                  <td style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', textAlign: 'right', backgroundColor: '#f0f9ff', color: themeStyles.color }}>-</td>
                  <td style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', textAlign: 'right', backgroundColor: '#f0f9ff', color: themeStyles.color }}>{item.completed_qty}</td>
                  <td style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', textAlign: 'right', backgroundColor: '#f0f9ff', color: themeStyles.color }}>-</td>
                  <td style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', textAlign: 'right', backgroundColor: '#f0f9ff', color: themeStyles.color }}>{item.dispatch_qty}</td>                   
                  <td colSpan="10" style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}`}}></td></tr>
                  ))
                  )}             
                  <tr style={{ backgroundColor: '#fffbeb' }}>
                  <td colSpan="8" style={{ padding: '8px 12px', border:`1px solid ${themeStyles.borderColor}`, fontSize: '12px', fontWeight: '700' }}>TOTAL</td> 
                  <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', textAlign: 'right', fontWeight: '600' }}>{rfdTable3Data.totals?.qty || 0}</td>  
                  <td colSpan="14" style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}` }}></td>
                </tr>
            </tbody>
        </table>
          <div style={{ marginTop: '16px', textAlign: 'right' }}>
          <button style={{
          backgroundColor: '#ff6b35',
          color: '#ffffff',
          padding: '10px 40px',
          border: 'none',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: '600',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)',
          transition: 'all 0.2s ease'
          }}>
          Assign Data Against Second DC
          </button>
          </div>
          </div>
       {/* Table 4 */}
      <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', border: `1px solid ${themeStyles.borderColor}` }}>
      <thead>
        <tr style={{ backgroundColor: '#90EE90' }}>
          <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>Material Name</td>
          <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>DC ID111</td>
          <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>Width</td>
          <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>Height</td>
          <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>Qty</td>
          <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>COL/P-C</td>
          <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>Assign Qty</td>
          <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>Vendor</td>
          <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>SHM Qty</td>
          <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>SHM Rate</td>
          <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>SHM Amt</td>
          <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>Sq Ft</td>
          <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>PC Rate</td>
          <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>Pc Amt</td>
          <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>Total Amt</td>
          <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', fontWeight: '600', color: '#000' }}>Datetime</td>
        </tr>
      </thead>
      <tbody>
        {rfdTable4Data.data && rfdTable4Data.data.length === 0 ? (
          <tr>
            <td colSpan="16" style={{ padding: '40px', textAlign: 'right', color: themeStyles.labelColor }}>No data available</td>
          </tr>
        ) : (
          rfdTable4Data.data?.map((item, index) => (
            <tr key={index} style={{ backgroundColor: themeStyles.cardBg }}>
              <td style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', color: themeStyles.color }}>{item.material}</td>
              <td colSpan="15" style={{ padding: '6px 10px', border: `1px solid ${themeStyles.borderColor}` }}></td>
            </tr>
          ))
        )}
        <tr style={{ backgroundColor: '#fffbeb' }}>
          <td colSpan="4" style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '12px', fontWeight: '700' }}>TOTAL</td>
          <td style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}`, fontSize: '11px', textAlign: 'right', fontWeight: '600' }}>{rfdTable4Data.totals?.total_qty || 0}</td>
          <td colSpan="11" style={{ padding: '8px 12px', border: `1px solid ${themeStyles.borderColor}` }}></td>
        </tr>
      </tbody>
    </table>
  </div>

  {/* Export Button */}
  <div style={{ textAlign: 'right', marginTop: '16px' }}>
    <button style={{
      backgroundColor: '#ff6b35',
      color: '#ffffff',
      padding: '10px 40px',
      border: 'none',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)',
      transition: 'all 0.2s ease'
    }}>
      Export
    </button>
  </div>
</div>
);
};


  const renderContent = () => {
  if (loading) {
    return (
      <div style={{
        backgroundColor: themeStyles.cardBg,
        borderRadius: '12px',
        padding: '60px 24px',
        textAlign: 'right',
        color: themeStyles.labelColor
      }}>
        <Loader size={48} style={{ margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
        <div>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        backgroundColor: themeStyles.cardBg,
        borderRadius: '12px',
        padding: '60px 24px',
        textAlign: 'right',
        color: '#ef4444'
      }}>
        <div>{error}</div>
      </div>
    );
  }

  if (activeSubTab === 'rfd-material-list') {
    return dataLoading ? (
      <div style={{
        backgroundColor: themeStyles.cardBg,
        borderRadius: '12px',
        padding: '60px 24px',
        textAlign: 'right',
        color: themeStyles.labelColor
      }}>
        <Loader size={48} style={{ margin: '0 auto 16px' }} />
        <div>Loading data...</div>
      </div>
    ) : renderRFDMaterialList();
  } else if (activeSubTab === 'drawing') {
    return renderDrawing();
  } else if (activeSubTab === 'rfd-completion') {
    return renderRfdCompletion();
  } else if (activeSubTab === 'left-over') {
    return renderLeftOver();
  } else if (activeSubTab === 'material') {
    return renderMaterial();
  }
  
  return null;
};

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: themeStyles.backgroundColor,
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          backgroundColor: themeStyles.cardBg,
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: theme === 'dark' ? '0 10px 25px -5px rgba(0, 0, 0, 0.5)' : '0 4px 15px -2px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${themeStyles.borderColor}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: themeStyles.color }}>
              Project Detail - File #{fileId}
            </h1>
            <button
              onClick={toggleTheme}
              style={{
                padding: '10px 20px',
                backgroundColor: themeStyles.buttonBg,
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = themeStyles.buttonHover}
              onMouseLeave={(e) => e.target.style.backgroundColor = themeStyles.buttonBg}
            >
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </button>
          </div>
        </div>

        {/* Static Tabs */}
        <div style={{
          backgroundColor: themeStyles.cardBg,
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          boxShadow: theme === 'dark' ? '0 10px 25px -5px rgba(0, 0, 0, 0.5)' : '0 4px 15px -2px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${themeStyles.borderColor}`
        }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {staticTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveStaticTab(tab.id)}
                style={{
                  padding: '12px 32px',
                  backgroundColor: activeStaticTab === tab.id ? themeStyles.tabActiveBg : themeStyles.tabBg,
                  color: activeStaticTab === tab.id ? '#ffffff' : themeStyles.color,
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: activeStaticTab === tab.id ? '0 4px 12px rgba(239, 68, 68, 0.3)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (activeStaticTab !== tab.id) {
                    e.target.style.backgroundColor = theme === 'dark' ? '#475569' : '#e2e8f0';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeStaticTab !== tab.id) {
                    e.target.style.backgroundColor = themeStyles.tabBg;
                  }
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sub Tabs */}
        <div style={{
          backgroundColor: themeStyles.cardBg,
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          boxShadow: theme === 'dark' ? '0 10px 25px -5px rgba(0, 0, 0, 0.5)' : '0 4px 15px -2px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${themeStyles.borderColor}`
        }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {subTabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: activeSubTab === tab.id ? themeStyles.tabActiveBg : themeStyles.tabBg,
                    color: activeSubTab === tab.id ? '#ffffff' : themeStyles.color,
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: activeSubTab === tab.id ? '0 4px 12px rgba(239, 68, 68, 0.3)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (activeSubTab !== tab.id) {
                      e.target.style.backgroundColor = theme === 'dark' ? '#475569' : '#e2e8f0';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeSubTab !== tab.id) {
                      e.target.style.backgroundColor = themeStyles.tabBg;
                    }
                  }}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Tabs (for RFD Material List) */}
        {activeSubTab === 'rfd-material-list' && dynamicTabs.length > 0 && (
          <div style={{
            backgroundColor: themeStyles.cardBg,
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            boxShadow: theme === 'dark' ? '0 10px 25px -5px rgba(0, 0, 0, 0.5)' : '0 4px 15px -2px rgba(0, 0, 0, 0.1)',
            border: `1px solid ${themeStyles.borderColor}`
          }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {dynamicTabs.map(tab => (
                <button
                  key={tab.sheet_key}
                  onClick={() => setActiveDynamicTab(tab.sheet_key)}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: activeDynamicTab === tab.sheet_key ? '#10b981' : themeStyles.tabBg,
                    color: activeDynamicTab === tab.sheet_key ? '#ffffff' : themeStyles.color,
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: activeDynamicTab === tab.sheet_key ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (activeDynamicTab !== tab.sheet_key) {
                      e.target.style.backgroundColor = theme === 'dark' ? '#475569' : '#e2e8f0';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeDynamicTab !== tab.sheet_key) {
                      e.target.style.backgroundColor = themeStyles.tabBg;
                    }
                  }}
                >
                  <Layers size={14} style={{ display: 'inline-block', marginRight: '6px', verticalAlign: 'middle' }} />
                  {tab.sheet_name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content Area */}
        <div>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SushamProjectDetail;