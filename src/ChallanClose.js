import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ChallanCloseDetail = () => {
  const [theme, setTheme] = useState('light');
  const [challanData, setChallanData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchDC, setSearchDC] = useState('');
  const [searchChallanNo, setSearchChallanNo] = useState('');
  const [searchChallanDate, setSearchChallanDate] = useState('');

  // Get file_id from URL
  const { file_id } = useParams();
  const navigate = useNavigate();

  const API_URL = 'http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/ChallanCloseApi.php';

  const getThemeStyles = () => {
    if (theme === 'dark') {
      return {
        bg: '#1a1d23',
        cardBg: '#25282e',
        headerBg: '#e07a3a',
        text: '#ffffff',
        border: '#3d4148',
        inputBg: '#1f2229',
        inputBorder: '#3d4148',
        hoverBg: '#2d3039'
      };
    }
    return {
      bg: '#f0f2f5',
      cardBg: '#ffffff',
      headerBg: '#ff8c42',
      text: '#333333',
      border: '#dee2e6',
      inputBg: '#ffffff',
      inputBorder: '#ced4da',
      hoverBg: '#f8f9fa'
    };
  };

  const styles = getThemeStyles();

  useEffect(() => {
    if (file_id) {
      fetchChallanData(file_id);
    }
  }, [file_id]);

  const fetchChallanData = async (fileNo) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?file_no=${fileNo}`);
      const result = await response.json();
      
      if (result.success && result.data && result.data.challans) {
        setChallanData(result.data.challans);
      } else {
        setChallanData([]);
      }
    } catch (error) {
      console.error('Error fetching challan data:', error);
      setChallanData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChallanClose = () => {
    // Navigate to new challan close page with file_id
    navigate(`/store/new-dc-close/${file_id}`);
  };

  const filteredData = challanData.filter(item => {
    const dcMatch = searchDC === '' || (item.type_cat && item.type_cat.toLowerCase().includes(searchDC.toLowerCase()));
    const challanNoMatch = searchChallanNo === '' || (item.challan_no && item.challan_no.toLowerCase().includes(searchChallanNo.toLowerCase()));
    const challanDateMatch = searchChallanDate === '' || (item.challan_date && item.challan_date.includes(searchChallanDate));
    return dcMatch && challanNoMatch && challanDateMatch;
  });

  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: styles.bg,
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  };

  const cardStyle = {
    backgroundColor: styles.cardBg,
    borderRadius: '8px',
    boxShadow: theme === 'dark' ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    maxWidth: '1200px',
    margin: '0 auto'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 20px',
    backgroundColor: styles.headerBg,
    color: '#ffffff',
    flexWrap: 'wrap',
    gap: '10px'
  };

  const buttonStyle = {
    padding: '8px 16px',
    backgroundColor: 'rgba(255,255,255,0.2)',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: '4px',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s'
  };

  const newChallanButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#28a745',
    border: '1px solid #28a745',
    padding: '10px 20px',
    fontSize: '15px',
    fontWeight: '600'
  };

  const tableContainerStyle = {
    padding: '20px',
    overflowX: 'auto'
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: styles.cardBg,
    color: styles.text
  };

  const thStyle = {
    backgroundColor: styles.headerBg,
    color: '#ffffff',
    padding: '12px',
    textAlign: 'left',
    fontWeight: '600',
    fontSize: '14px',
    borderBottom: `2px solid ${styles.border}`
  };

  const inputStyle = {
    width: '100%',
    padding: '8px',
    backgroundColor: styles.inputBg,
    border: `1px solid ${styles.inputBorder}`,
    borderRadius: '4px',
    color: styles.text,
    fontSize: '13px',
    outline: 'none'
  };

  const tdStyle = {
    padding: '12px',
    borderBottom: `1px solid ${styles.border}`,
    color: styles.text,
    fontSize: '14px'
  };

  const noDataStyle = {
    padding: '40px',
    textAlign: 'center',
    color: styles.text,
    fontSize: '14px'
  };

  const footerStyle = {
    padding: '15px 20px',
    backgroundColor: styles.cardBg,
    borderTop: `1px solid ${styles.border}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px',
    color: styles.text
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
              Challan Close Details
            </h3>
            <div style={{ 
              backgroundColor: 'rgba(255,255,255,0.2)',
              padding: '6px 12px',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              File No: {file_id}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handleNewChallanClose}
              style={newChallanButtonStyle}
              onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
            >
              ✚ New Challan Close
            </button>
            <button
              onClick={() => fetchChallanData(file_id)}
              style={buttonStyle}
              onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.3)'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'}
            >
              🔄 Refresh
            </button>
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              style={buttonStyle}
              onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.3)'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'}
            >
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </button>
            <button
              onClick={() => navigate('/store/challan-close-list')}
              style={buttonStyle}
              onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.3)'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'}
            >
              ← Back to List
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={tableContainerStyle}>
          {loading ? (
            <div style={noDataStyle}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
              <div>Loading data...</div>
            </div>
          ) : (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, width: '80px' }}>Sr.No.</th>
                  <th style={thStyle}>DC No.</th>
                  <th style={thStyle}>Challan No.</th>
                  <th style={thStyle}>Challan Date</th>
                </tr>
                <tr>
                  <td style={{ padding: '8px', backgroundColor: styles.headerBg }}></td>
                  <td style={{ padding: '8px', backgroundColor: styles.headerBg }}>
                    <input
                      type="text"
                      placeholder="Search DC No."
                      value={searchDC}
                      onChange={(e) => setSearchDC(e.target.value)}
                      style={inputStyle}
                    />
                  </td>
                  <td style={{ padding: '8px', backgroundColor: styles.headerBg }}>
                    <input
                      type="text"
                      placeholder="Search Challan"
                      value={searchChallanNo}
                      onChange={(e) => setSearchChallanNo(e.target.value)}
                      style={inputStyle}
                    />
                  </td>
                  <td style={{ padding: '8px', backgroundColor: styles.headerBg }}>
                    <input
                      type="text"
                      placeholder="Search Challan"
                      value={searchChallanDate}
                      onChange={(e) => setSearchChallanDate(e.target.value)}
                      style={inputStyle}
                    />
                  </td>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={noDataStyle}>
                      No data available in table
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item, index) => (
                    <tr
                      key={item.id}
                      style={{
                        backgroundColor: index % 2 === 0 ? styles.cardBg : styles.hoverBg,
                        transition: 'background-color 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = styles.hoverBg}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? styles.cardBg : styles.hoverBg}
                    >
                      <td style={tdStyle}>{item.id}</td>
                      <td style={tdStyle}>{item.type_cat || '-'}</td>
                      <td style={tdStyle}>
                        <a
                          href={item.detail_link}
                          style={{
                            color: styles.headerBg,
                            textDecoration: 'none',
                            fontWeight: '500'
                          }}
                        >
                          {item.challan_no || '-'}
                        </a>
                      </td>
                      <td style={tdStyle}>{item.challan_date || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div style={footerStyle}>
          <div style={{ fontSize: '14px' }}>
            Showing {filteredData.length > 0 ? '1' : '0'} to {filteredData.length} of {filteredData.length} entries
            {challanData.length !== filteredData.length && ` (filtered from ${challanData.length} total entries)`}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              style={{
                ...buttonStyle,
                backgroundColor: styles.inputBg,
                color: styles.text,
                border: `1px solid ${styles.border}`
              }}
              disabled
            >
              Previous
            </button>
            <button
              style={{
                ...buttonStyle,
                backgroundColor: styles.inputBg,
                color: styles.text,
                border: `1px solid ${styles.border}`
              }}
              disabled
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallanCloseDetail;