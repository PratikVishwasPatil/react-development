import React, { useEffect, useState } from "react";

const GRNFileInwardDetails = () => {
    // Extract PO ID from URL hash (e.g., #/grn/raw/details/SA25-26-2011)
    const getPoIdFromUrl = () => {
        const hash = window.location.hash;
        const parts = hash.split('/');
        return parts[parts.length - 1] || '';
    };

    const [poId, setPoId] = useState(getPoIdFromUrl());
    const [theme, setTheme] = useState('light');
    const [loading, setLoading] = useState(false);
    const [grnData, setGrnData] = useState([]);

    // Toast notification function
    const showToast = (message, type = 'info') => {
        const toastDiv = document.createElement('div');
        toastDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
            color: white;
            border-radius: 5px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.2);
            z-index: 9999;
            font-family: Arial, sans-serif;
            animation: slideIn 0.3s ease-out;
        `;
        toastDiv.textContent = message;
        document.body.appendChild(toastDiv);
        
        setTimeout(() => {
            toastDiv.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => document.body.removeChild(toastDiv), 300);
        }, 3000);
    };

    // Add animation styles
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(400px); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    // Listen to hash changes
    useEffect(() => {
        const handleHashChange = () => {
            setPoId(getPoIdFromUrl());
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // Fetch GRN Details
    const fetchGrnDetails = async () => {
        if (!poId) {
            showToast('PO ID not found', 'error');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(
                `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/po_grn_details_api.php?po_id=${poId}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.status === "success" && Array.isArray(data.data)) {
                setGrnData(data.data);
                showToast(`Loaded ${data.count || data.data.length} GRN records`, 'success');
            } else if (Array.isArray(data)) {
                setGrnData(data);
                showToast(`Loaded ${data.length} GRN records`, 'success');
            } else {
                setGrnData([]);
                showToast('No GRN data found for this PO', 'info');
            }
        } catch (error) {
            console.error("Error fetching GRN details:", error);
            showToast(`Error fetching data: ${error.message}`, 'error');
            setGrnData([]);
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        if (poId) {
            fetchGrnDetails();
        }
    }, [poId]);

    // Handle Generate New GRN
    const handleGenerateNewGrn = () => {
        // Navigate to new GRN creation page with PO ID
        const newGrnUrl = `#/grn/create/${poId}`;
        window.open(newGrnUrl, '_blank');
        showToast(`Opening Generate New GRN for PO: ${poId}`, 'info');
    };

    // Handle View GRN Details
    // const handleViewGrn = (grnUrl) => {
    //     if (grnUrl) {
    //         window.open(grnUrl, '_blank');
    //         showToast('Opening GRN details...', 'info');
    //     }
    // };

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    // Theme styles
    const getThemeStyles = () => {
        if (theme === 'dark') {
            return {
                backgroundColor: 'linear-gradient(135deg, #21262d 0%, #161b22 100%)',
                color: '#f8f9fa',
                cardBg: '#343a40',
                tableBg: '#2c3034',
                headerBg: '#495057',
                borderColor: '#495057'
            };
        }
        return {
            backgroundColor: 'linear-gradient(135deg, #f8f9ff 0%, #e6f3ff 100%)',
            color: '#212529',
            cardBg: '#ffffff',
            tableBg: '#f8f9fa',
            headerBg: '#e9ecef',
            borderColor: '#dee2e6'
        };
    };

    const themeStyles = getThemeStyles();

    // Apply theme to document body
    useEffect(() => {
        document.body.style.background = themeStyles.backgroundColor;
        document.body.style.color = themeStyles.color;
        document.body.style.minHeight = '100vh';

        return () => {
            document.body.style.background = '';
            document.body.style.color = '';
            document.body.style.minHeight = '';
        };
    }, [theme]);

    if (loading && grnData.length === 0) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: themeStyles.backgroundColor
            }}>
                <div style={{ textAlign: 'center', color: themeStyles.color }}>
                    <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem', borderColor: '#007bff', borderRightColor: 'transparent' }}>
                        <span style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden' }}>Loading...</span>
                    </div>
                    <p style={{ marginTop: '1rem' }}>Loading GRN Details...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: themeStyles.backgroundColor,
            color: themeStyles.color,
            padding: '20px'
        }}>
            <div style={{ 
                maxWidth: '1400px',
                margin: '0 auto'
            }}>
                {/* Header Section */}
                <div style={{
                    backgroundColor: themeStyles.cardBg,
                    border: `1px solid ${themeStyles.borderColor}`,
                    borderRadius: '8px',
                    padding: '20px',
                    marginBottom: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '15px'
                }}>
                    <div>
                        <h4 style={{ margin: 0, marginBottom: '5px', fontSize: '1.25rem' }}>
                            GRN Details For PO No : <span style={{ color: '#007bff' }}>{poId}</span>
                        </h4>
                        <small style={{ opacity: 0.7 }}>
                            {grnData.length} GRN record(s) found
                        </small>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button
                            onClick={handleGenerateNewGrn}
                            style={{
                                padding: '10px 20px',
                                fontSize: '0.95rem',
                                borderRadius: '5px',
                                border: 'none',
                                backgroundColor: '#28a745',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#218838'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#28a745'}
                        >
                            <span style={{ fontSize: '1.2rem' }}>➕</span>
                            Generate New GRN
                        </button>

                        <button
                            onClick={toggleTheme}
                            style={{
                                padding: '10px 15px',
                                fontSize: '0.875rem',
                                borderRadius: '5px',
                                border: `1px solid ${themeStyles.borderColor}`,
                                backgroundColor: 'transparent',
                                color: themeStyles.color,
                                cursor: 'pointer'
                            }}
                        >
                            {theme === 'light' ? '🌙' : '☀️'}
                        </button>
                    </div>
                </div>

                {/* GRN Table */}
                <div style={{
                    backgroundColor: themeStyles.cardBg,
                    border: `1px solid ${themeStyles.borderColor}`,
                    borderRadius: '8px',
                    overflow: 'hidden'
                }}>
                    {grnData.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '50px',
                            color: themeStyles.color
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📦</div>
                            <h5>No GRN records found for this PO</h5>
                            <p style={{ opacity: 0.7 }}>Click "Generate New GRN" to create a new GRN record.</p>
                        </div>
                    ) : (
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            fontSize: '0.95rem'
                        }}>
                            <thead>
                                <tr style={{
                                    backgroundColor: theme === 'dark' ? '#dc3545' : '#ff6b6b',
                                    color: 'white'
                                }}>
                                    <th style={{
                                        padding: '15px',
                                        textAlign: 'left',
                                        fontWeight: '600',
                                        borderBottom: `2px solid ${themeStyles.borderColor}`
                                    }}>GRN NO</th>
                                    <th style={{
                                        padding: '15px',
                                        textAlign: 'left',
                                        fontWeight: '600',
                                        borderBottom: `2px solid ${themeStyles.borderColor}`
                                    }}>GRN GENERATED DATE</th>
                                    <th style={{
                                        padding: '15px',
                                        textAlign: 'left',
                                        fontWeight: '600',
                                        borderBottom: `2px solid ${themeStyles.borderColor}`
                                    }}>GRN GENERATED BY</th>
                                    <th style={{
                                        padding: '15px',
                                        textAlign: 'left',
                                        fontWeight: '600',
                                        borderBottom: `2px solid ${themeStyles.borderColor}`
                                    }}>APPROVAL STATUS</th>
                                    {/* <th style={{
                                        padding: '15px',
                                        textAlign: 'center',
                                        fontWeight: '600',
                                        borderBottom: `2px solid ${themeStyles.borderColor}`
                                    }}>ACTION</th> */}
                                </tr>
                            </thead>
                            <tbody>
                                {grnData.map((grn, index) => (
                                    <tr key={index} style={{
                                        backgroundColor: index % 2 === 0 ? themeStyles.cardBg : themeStyles.tableBg,
                                        transition: 'background-color 0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? '#495057' : '#e3f2fd'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? themeStyles.cardBg : themeStyles.tableBg}
                                    >
                                        <td style={{
                                            padding: '12px 15px',
                                            borderBottom: `1px solid ${themeStyles.borderColor}`,
                                            fontWeight: '600',
                                            color: '#007bff'
                                        }}>{grn.grn_id}</td>
                                        <td style={{
                                            padding: '12px 15px',
                                            borderBottom: `1px solid ${themeStyles.borderColor}`
                                        }}>{grn.grn_date}</td>
                                        <td style={{
                                            padding: '12px 15px',
                                            borderBottom: `1px solid ${themeStyles.borderColor}`,
                                            fontWeight: '500'
                                        }}>{grn.added_by_name}</td>
                                        <td style={{
                                            padding: '12px 15px',
                                            borderBottom: `1px solid ${themeStyles.borderColor}`
                                        }}>
                                            <span style={{
                                                padding: '5px 12px',
                                                borderRadius: '20px',
                                                fontSize: '0.85rem',
                                                fontWeight: '600',
                                                backgroundColor: grn.grn_approval_status === "1" ? '#fff3cd' : '#d4edda',
                                                color: grn.grn_approval_status === "1" ? '#856404' : '#155724',
                                                display: 'inline-block'
                                            }}>
                                                {grn.grn_status_text}
                                            </span>
                                        </td>
                                        {/* <td style={{
                                            padding: '12px 15px',
                                            borderBottom: `1px solid ${themeStyles.borderColor}`,
                                            textAlign: 'center'
                                        }}>
                                            <button
                                                onClick={() => handleViewGrn(grn.grn_url)}
                                                style={{
                                                    padding: '6px 16px',
                                                    fontSize: '0.85rem',
                                                    borderRadius: '4px',
                                                    border: 'none',
                                                    backgroundColor: '#007bff',
                                                    color: 'white',
                                                    cursor: 'pointer',
                                                    fontWeight: '500'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
                                            >
                                                👁️ View
                                            </button>
                                        </td> */}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Back Button */}
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <button
                        onClick={() => window.history.back()}
                        style={{
                            padding: '10px 30px',
                            fontSize: '0.95rem',
                            borderRadius: '5px',
                            border: `1px solid ${themeStyles.borderColor}`,
                            backgroundColor: themeStyles.cardBg,
                            color: themeStyles.color,
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        ← Back to List
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GRNFileInwardDetails;