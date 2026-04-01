import React, { useState, useEffect } from 'react';
import Select from 'react-select';

const BinCardMaterialViewer = () => {
    const [theme, setTheme] = useState('light');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [materialOptions, setMaterialOptions] = useState([]);
    const [loadingMaterials, setLoadingMaterials] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [binCardData, setBinCardData] = useState([]);
    const [loadingBinCard, setLoadingBinCard] = useState(false);

    // Handle window resize for mobile responsiveness
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch material list from API on component mount
    useEffect(() => {
        fetchMaterialList();
    }, []);

    // Fetch material list
    const fetchMaterialList = async () => {
        setLoadingMaterials(true);
        try {
            const response = await fetch("https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/storeMaterialListApi.php");
            const data = await response.json();
            
            if (data.status === "success" && Array.isArray(data.data)) {
                const options = data.data
                    .filter(item => item.material_description && item.material_description.trim() !== "")
                    .map(item => ({
                        value: item.id,
                        label: `${item.material_description} (ID: ${item.id})`
                    }));
                setMaterialOptions(options);
            } else {
                console.error("Invalid API response:", data);
                setMaterialOptions([]);
            }
        } catch (error) {
            console.error("Error fetching materials:", error);
            setMaterialOptions([]);
            alert("Error fetching material list. Please try again.");
        } finally {
            setLoadingMaterials(false);
        }
    };

    // Fetch bin card details based on material ID
    const fetchBinCardDetails = async (materialId) => {
        setLoadingBinCard(true);
        setBinCardData([]);
        try {
            const response = await fetch(`https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/getBinCardDetailsApi.php?id=${materialId}`);
            const data = await response.json();
            
            if (data.status === "success" && Array.isArray(data.data)) {
                setBinCardData(data.data);
            } else {
                console.error("Invalid bin card API response:", data);
                setBinCardData([]);
            }
        } catch (error) {
            console.error("Error fetching bin card details:", error);
            setBinCardData([]);
            alert("Error fetching bin card details. Please try again.");
        } finally {
            setLoadingBinCard(false);
        }
    };

    // Handle material selection
    const handleMaterialSelect = (selectedOption) => {
        setSelectedMaterial(selectedOption);
        if (selectedOption && selectedOption.value) {
            fetchBinCardDetails(selectedOption.value);
        } else {
            setBinCardData([]);
        }
    };

    // Theme styles
    const getThemeStyles = () => {
        if (theme === 'dark') {
            return {
                backgroundColor: '#1a1d23',
                color: '#f8f9fa',
                cardBg: '#2d3139',
                headerBg: '#fd7e14',
                tableBg: '#2d3139',
                tableHeaderBg: '#3a3f4b',
                border: '#495057',
                inputBg: '#343a40',
                inputBorder: '#495057',
                rowHoverBg: '#3a3f4b'
            };
        }
        return {
            backgroundColor: '#f5f7fa',
            color: '#212529',
            cardBg: '#ffffff',
            headerBg: '#fd7e14',
            tableBg: '#ffffff',
            tableHeaderBg: '#fd7e14',
            border: '#dee2e6',
            inputBg: '#ffffff',
            inputBorder: '#ced4da',
            rowHoverBg: '#f8f9fa'
        };
    };

    const themeStyles = getThemeStyles();

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: themeStyles.backgroundColor,
            color: themeStyles.color,
            padding: isMobile ? '10px' : '20px',
            fontFamily: 'Arial, sans-serif'
        }}>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                table {
                    border-collapse: collapse;
                }
                
                @media (max-width: 768px) {
                    .table-wrapper {
                        overflow-x: auto;
                        -webkit-overflow-scrolling: touch;
                    }
                }
            `}</style>
            
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header Card */}
                <div style={{
                    backgroundColor: themeStyles.cardBg,
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    marginBottom: '20px'
                }}>
                    {/* Orange Header */}
                    <div style={{
                        background: themeStyles.headerBg,
                        color: 'white',
                        padding: isMobile ? '12px 15px' : '15px 25px',
                        borderRadius: '8px 8px 0 0',
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        alignItems: isMobile ? 'stretch' : 'center',
                        gap: '15px',
                        justifyContent: 'space-between'
                    }}>
                        {/* Material Selector */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <label style={{ 
                                display: 'block',
                                fontSize: '13px', 
                                marginBottom: '8px',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                Selected Material ID is:
                            </label>
                            <Select
                                value={selectedMaterial}
                                onChange={handleMaterialSelect}
                                options={materialOptions}
                                styles={{
                                    control: (provided, state) => ({
                                        ...provided,
                                        backgroundColor: 'white',
                                        borderColor: state.isFocused ? '#fd7e14' : '#ced4da',
                                        minHeight: '40px',
                                        boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(253, 126, 20, 0.25)' : 'none',
                                        '&:hover': {
                                            borderColor: '#fd7e14'
                                        }
                                    }),
                                    menu: (provided) => ({
                                        ...provided,
                                        backgroundColor: 'white',
                                        zIndex: 9999
                                    }),
                                    option: (provided, state) => ({
                                        ...provided,
                                        backgroundColor: state.isSelected
                                            ? '#fd7e14'
                                            : state.isFocused
                                                ? '#fff3e6'
                                                : 'white',
                                        color: state.isSelected ? 'white' : '#212529',
                                        cursor: 'pointer'
                                    }),
                                    singleValue: (provided) => ({
                                        ...provided,
                                        color: '#212529',
                                        fontWeight: '600'
                                    }),
                                    placeholder: (provided) => ({
                                        ...provided,
                                        color: '#6c757d'
                                    }),
                                    input: (provided) => ({
                                        ...provided,
                                        color: '#212529'
                                    })
                                }}
                                placeholder={loadingMaterials ? "Loading materials..." : "Search and select material..."}
                                isClearable
                                isSearchable
                                isDisabled={loadingMaterials}
                                noOptionsMessage={() => "No materials found"}
                                className="react-select-container"
                                classNamePrefix="react-select"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div style={{ 
                            display: 'flex',
                            gap: '10px',
                            flexShrink: 0
                        }}>
                            <button
                                onClick={fetchMaterialList}
                                disabled={loadingMaterials}
                                style={{
                                    padding: '10px 16px',
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    border: '1px solid rgba(255,255,255,0.5)',
                                    color: 'white',
                                    borderRadius: '5px',
                                    cursor: loadingMaterials ? 'not-allowed' : 'pointer',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.3s'
                                }}
                                onMouseEnter={(e) => {
                                    if (!loadingMaterials) {
                                        e.target.style.backgroundColor = 'rgba(255,255,255,0.3)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
                                }}
                            >
                                🔄 Refresh
                            </button>
                            <button
                                onClick={toggleTheme}
                                style={{
                                    padding: '10px 16px',
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    border: '1px solid rgba(255,255,255,0.5)',
                                    color: 'white',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.3s'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = 'rgba(255,255,255,0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
                                }}
                            >
                                {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
                            </button>
                        </div>
                    </div>

                    {/* Table Content */}
                    <div style={{ padding: isMobile ? '10px' : '20px' }}>
                        {!selectedMaterial ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '60px 20px',
                                color: themeStyles.color
                            }}>
                                <div style={{ fontSize: '4rem', marginBottom: '20px', opacity: 0.5 }}>📦</div>
                                <h3 style={{ marginBottom: '10px', fontSize: isMobile ? '18px' : '22px' }}>No Material Selected</h3>
                                <p style={{ color: theme === 'dark' ? '#adb5bd' : '#6c757d', fontSize: '14px' }}>
                                    Please select a material from the dropdown above to view bin card details
                                </p>
                            </div>
                        ) : loadingBinCard ? (
                            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                                <div style={{ 
                                    border: '4px solid #f3f3f3',
                                    borderTop: '4px solid #fd7e14',
                                    borderRadius: '50%',
                                    width: '50px',
                                    height: '50px',
                                    animation: 'spin 1s linear infinite',
                                    margin: '0 auto 20px'
                                }}></div>
                                <p style={{ color: themeStyles.color }}>Loading bin card details...</p>
                            </div>
                        ) : binCardData.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '60px 20px',
                                color: themeStyles.color
                            }}>
                                <div style={{ fontSize: '3rem', marginBottom: '20px', opacity: 0.5 }}>📋</div>
                                <h3 style={{ marginBottom: '10px', fontSize: isMobile ? '18px' : '22px' }}>No Data Found</h3>
                                <p style={{ color: theme === 'dark' ? '#adb5bd' : '#6c757d', fontSize: '14px' }}>
                                    No bin card records available for the selected material
                                </p>
                            </div>
                        ) : (
                            <div className="table-wrapper" style={{ overflowX: 'auto' }}>
                                <table style={{ 
                                    width: '100%',
                                    backgroundColor: themeStyles.tableBg,
                                    color: themeStyles.color,
                                    fontSize: isMobile ? '11px' : '13px',
                                    minWidth: '900px'
                                }}>
                                    <thead>
                                        <tr style={{ 
                                            backgroundColor: themeStyles.tableHeaderBg,
                                            color: 'white'
                                        }}>
                                            <th style={{ 
                                                padding: isMobile ? '10px 8px' : '12px 10px',
                                                border: '1px solid rgba(0,0,0,0.1)',
                                                fontWeight: '600',
                                                textAlign: 'left',
                                                whiteSpace: 'nowrap'
                                            }}>File Name</th>
                                            <th style={{ 
                                                padding: isMobile ? '10px 8px' : '12px 10px',
                                                border: '1px solid rgba(0,0,0,0.1)',
                                                fontWeight: '600',
                                                textAlign: 'left',
                                                whiteSpace: 'nowrap'
                                            }}>Party</th>
                                            <th style={{ 
                                                padding: isMobile ? '10px 8px' : '12px 10px',
                                                border: '1px solid rgba(0,0,0,0.1)',
                                                fontWeight: '600',
                                                textAlign: 'center',
                                                whiteSpace: 'nowrap'
                                            }}>Is Toolkit</th>
                                            <th style={{ 
                                                padding: isMobile ? '10px 8px' : '12px 10px',
                                                border: '1px solid rgba(0,0,0,0.1)',
                                                fontWeight: '600',
                                                textAlign: 'left',
                                                whiteSpace: 'nowrap'
                                            }}>Toolkit File Name</th>
                                            <th style={{ 
                                                padding: isMobile ? '10px 8px' : '12px 10px',
                                                border: '1px solid rgba(0,0,0,0.1)',
                                                fontWeight: '600',
                                                textAlign: 'center',
                                                whiteSpace: 'nowrap'
                                            }}>Stock</th>
                                            <th style={{ 
                                                padding: isMobile ? '10px 8px' : '12px 10px',
                                                border: '1px solid rgba(0,0,0,0.1)',
                                                fontWeight: '600',
                                                textAlign: 'center',
                                                whiteSpace: 'nowrap'
                                            }}>Inward</th>
                                            <th style={{ 
                                                padding: isMobile ? '10px 8px' : '12px 10px',
                                                border: '1px solid rgba(0,0,0,0.1)',
                                                fontWeight: '600',
                                                textAlign: 'center',
                                                whiteSpace: 'nowrap'
                                            }}>Outward</th>
                                            <th style={{ 
                                                padding: isMobile ? '10px 8px' : '12px 10px',
                                                border: '1px solid rgba(0,0,0,0.1)',
                                                fontWeight: '600',
                                                textAlign: 'center',
                                                whiteSpace: 'nowrap',
                                                backgroundColor: '#ffe6e6'
                                            }}>Balance</th>
                                            <th style={{ 
                                                padding: isMobile ? '10px 8px' : '12px 10px',
                                                border: '1px solid rgba(0,0,0,0.1)',
                                                fontWeight: '600',
                                                textAlign: 'center',
                                                whiteSpace: 'nowrap'
                                            }}>Dispatch</th>
                                            <th style={{ 
                                                padding: isMobile ? '10px 8px' : '12px 10px',
                                                border: '1px solid rgba(0,0,0,0.1)',
                                                fontWeight: '600',
                                                textAlign: 'center',
                                                whiteSpace: 'nowrap'
                                            }}>Dispatch Date</th>
                                            <th style={{ 
                                                padding: isMobile ? '10px 8px' : '12px 10px',
                                                border: '1px solid rgba(0,0,0,0.1)',
                                                fontWeight: '600',
                                                textAlign: 'left',
                                                whiteSpace: 'nowrap'
                                            }}>GRN/DC/REQ NO</th>
                                            <th style={{ 
                                                padding: isMobile ? '10px 8px' : '12px 10px',
                                                border: '1px solid rgba(0,0,0,0.1)',
                                                fontWeight: '600',
                                                textAlign: 'center',
                                                whiteSpace: 'nowrap'
                                            }}>Date</th>
                                            <th style={{ 
                                                padding: isMobile ? '10px 8px' : '12px 10px',
                                                border: '1px solid rgba(0,0,0,0.1)',
                                                fontWeight: '600',
                                                textAlign: 'center',
                                                whiteSpace: 'nowrap'
                                            }}>Emp Name</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {binCardData.map((row, index) => (
                                            <tr key={row.qty_id || index} style={{
                                                borderBottom: `1px solid ${themeStyles.border}`,
                                                transition: 'background-color 0.2s'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = themeStyles.rowHoverBg;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                            }}>
                                                <td style={{ 
                                                    padding: '10px',
                                                    border: `1px solid ${themeStyles.border}`
                                                }}>{row.file_name || '-'}</td>
                                                <td style={{ 
                                                    padding: '10px',
                                                    border: `1px solid ${themeStyles.border}`
                                                }}>{row.supplier_name || '-'}</td>
                                                <td style={{ 
                                                    padding: '10px',
                                                    border: `1px solid ${themeStyles.border}`,
                                                    textAlign: 'right'
                                                }}>{row.is_toolkit || ''}</td>
                                                <td style={{ 
                                                    padding: '10px',
                                                    border: `1px solid ${themeStyles.border}`
                                                }}>{row.toolkit_file || ''}</td>
                                                <td style={{ 
                                                    padding: '10px',
                                                    border: `1px solid ${themeStyles.border}`,
                                                    textAlign: 'right'
                                                }}>{row.stock_type || '-'}</td>
                                                <td style={{ 
                                                    padding: '10px',
                                                    border: `1px solid ${themeStyles.border}`,
                                                    textAlign: 'right',
                                                    fontWeight: '600'
                                                }}>{row.qty_in || 0}</td>
                                                <td style={{ 
                                                    padding: '10px',
                                                    border: `1px solid ${themeStyles.border}`,
                                                    textAlign: 'right',
                                                    fontWeight: '600'
                                                }}>{row.qty_out || 0}</td>
                                                <td style={{ 
                                                    padding: '10px',
                                                    border: `1px solid ${themeStyles.border}`,
                                                    textAlign: 'right',
                                                    fontWeight: '700',
                                                    backgroundColor: row.balance === 0 ? '#ffe6e6' : (theme === 'dark' ? '#2d3139' : 'transparent'),
                                                    color: row.balance === 0 ? '#dc3545' : themeStyles.color
                                                }}>{row.balance}</td>
                                                <td style={{ 
                                                    padding: '10px',
                                                    border: `1px solid ${themeStyles.border}`,
                                                    textAlign: 'right'
                                                }}>{row.dispatch_status || 'no'}</td>
                                                <td style={{ 
                                                    padding: '10px',
                                                    border: `1px solid ${themeStyles.border}`,
                                                    textAlign: 'right'
                                                }}>{row.dispatch_date || ''}</td>
                                                <td style={{ 
                                                    padding: '10px',
                                                    border: `1px solid ${themeStyles.border}`
                                                }}>{row.reference || ''}</td>
                                                <td style={{ 
                                                    padding: '10px',
                                                    border: `1px solid ${themeStyles.border}`,
                                                    textAlign: 'right',
                                                    whiteSpace: 'nowrap'
                                                }}>{row.date || ''}</td>
                                                <td style={{ 
                                                    padding: '10px',
                                                    border: `1px solid ${themeStyles.border}`,
                                                    textAlign: 'right'
                                                }}>{row.employee || ''}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        
                        {/* Summary Footer */}
                        {binCardData.length > 0 && (
                            <div style={{
                                marginTop: '20px',
                                padding: '15px',
                                backgroundColor: theme === 'dark' ? '#3a3f4b' : '#f8f9fa',
                                borderRadius: '5px',
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '20px',
                                justifyContent: 'space-around',
                                fontSize: isMobile ? '12px' : '14px'
                            }}>
                                <div>
                                    <strong>Total Records:</strong> {binCardData.length}
                                </div>
                                <div>
                                    <strong>Total Inward:</strong> {binCardData.reduce((sum, row) => sum + (parseInt(row.qty_in) || 0), 0)}
                                </div>
                                <div>
                                    <strong>Total Outward:</strong> {binCardData.reduce((sum, row) => sum + (parseInt(row.qty_out) || 0), 0)}
                                </div>
                                <div>
                                    <strong style={{ color: '#fd7e14' }}>Current Balance:</strong> {binCardData.length > 0 ? binCardData[binCardData.length - 1].balance : 0}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BinCardMaterialViewer;