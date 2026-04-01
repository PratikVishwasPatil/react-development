import React, { useEffect, useState } from "react";
import Select from 'react-select';

const AssignRfdMaterialManager = () => {
  const getFileIdFromUrl = () => {
    const pathname = window.location.pathname;
    const segments = pathname.split('/');
    return segments[segments.length - 1] || '5526';
};
    const [fileId] = useState(getFileIdFromUrl());

    const [activeTab, setActiveTab] = useState('Sheet Metal');
    const [theme, setTheme] = useState('light');
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [loading, setLoading] = useState(false);
    const [loadingFrom, setLoadingFrom] = useState(false);
    
    const [assignToFiles, setAssignToFiles] = useState([]);
    const [selectedAssignToFile, setSelectedAssignToFile] = useState('');
    const [assignToData, setAssignToData] = useState([]);
    const [assignToQuantities, setAssignToQuantities] = useState({});
    
    const [assignFromFiles, setAssignFromFiles] = useState([]);
    const [selectedAssignFromFile, setSelectedAssignFromFile] = useState('');
    const [assignFromData, setAssignFromData] = useState([]);
    const [assignFromQuantities, setAssignFromQuantities] = useState({});

    const API_BASE_URL = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api";
    const tabs = ['Sheet Metal', 'Fabrication', 'Foundation'];

    const fetchAssignToFiles = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/AssignToFilesApi.php?fileId=${fileId}`);
            const result = await response.json();
            if (result.status === "success" && Array.isArray(result.data)) {
                setAssignToFiles(result.data);
                if (result.data.length > 0) {
                    setSelectedAssignToFile(result.data[0].FILE_ID);
                }
            }
        } catch (error) {
            console.error("Error fetching assign to files:", error);
        }
    };

    const fetchAssignFromFiles = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/AssignFromFilesApi.php`);
            const result = await response.json();
            if (result.status === "success" && Array.isArray(result.data)) {
                setAssignFromFiles(result.data);
                if (result.data.length > 0) {
                    setSelectedAssignFromFile(result.data[0].fileId);
                }
            }
        } catch (error) {
            console.error("Error fetching assign from files:", error);
        }
    };

    const fetchAssignToData = async () => {
        if (!selectedAssignToFile) return;
        
        setLoading(true);
        try {
            let endpoint = 'smetalAssignDataApi.php';
            
            if (activeTab === 'Fabrication') {
                endpoint = 'fabAssignDataApi.php';
            } else if (activeTab === 'Foundation') {
                endpoint = 'foundAssignDataApi.php';
            }
            
            const response = await fetch(`${API_BASE_URL}/${endpoint}?fileId=${selectedAssignToFile}`);
            const result = await response.json();

            if (result.status === "success" && Array.isArray(result.data)) {
                setAssignToData(result.data);
            } else {
                setAssignToData([]);
            }
        } catch (error) {
            console.error("Error fetching assign to data:", error);
            setAssignToData([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchAssignFromData = async () => {
        if (!selectedAssignFromFile) return;
        
        setLoadingFrom(true);
        try {
            let typeParam = 'smetal';
            let type1Param = 'susham';
            
            if (activeTab === 'Fabrication') {
                typeParam = 'fab';
                type1Param = 'rackline';
            } else if (activeTab === 'Foundation') {
                typeParam = 'Found';
                type1Param = 'rackline';
            }
            
            const response = await fetch(
                `${API_BASE_URL}/getRfdMaterialApi.php?val=${selectedAssignFromFile}&type=${typeParam}&type1=${type1Param}`
            );
            const result = await response.json();

            if (result.status === "success" && Array.isArray(result.data)) {
                setAssignFromData(result.data);
            } else {
                setAssignFromData([]);
            }
        } catch (error) {
            console.error("Error fetching assign from data:", error);
            setAssignFromData([]);
        } finally {
            setLoadingFrom(false);
        }
    };

    useEffect(() => {
        fetchAssignToFiles();
        fetchAssignFromFiles();
    }, []);

    useEffect(() => {
        fetchAssignToData();
    }, [selectedAssignToFile, activeTab]);

    useEffect(() => {
        fetchAssignFromData();
    }, [selectedAssignFromFile, activeTab]);

    const handleToQuantityChange = (index, value) => {
        setAssignToQuantities({
            ...assignToQuantities,
            [index]: value
        });
    };

    const handleFromQuantityChange = (index, value) => {
        setAssignFromQuantities({
            ...assignFromQuantities,
            [index]: value
        });
    };

    const handleAssignData = () => {
        console.log("Assign To Quantities:", assignToQuantities);
        console.log("Assign From Quantities:", assignFromQuantities);
        alert("Assign Data functionality will be implemented here!");
    };

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
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
                tabActiveBg: '#3b82f6',
                tabBorder: '#334155',
                tableBorder: '#334155',
                tableHeaderBg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                tableRowEven: '#1e293b',
                tableRowOdd: '#0f172a',
                tableRowHover: '#334155',
                buttonGradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                labelColor: '#94a3b8'
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
            tabActiveBg: '#3b82f6',
            tabBorder: '#e2e8f0',
            tableBorder: '#e2e8f0',
            tableHeaderBg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            tableRowEven: '#ffffff',
            tableRowOdd: '#f8fafc',
            tableRowHover: '#f1f5f9',
            buttonGradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            labelColor: '#64748b'
        };
    };

    const themeStyles = getThemeStyles();

    useEffect(() => {
        document.body.style.background = themeStyles.backgroundColor;
        document.body.style.color = themeStyles.color;
        document.body.style.minHeight = '100vh';
        document.body.style.margin = '0';
        document.body.style.padding = '0';

        return () => {
            document.body.style.background = '';
            document.body.style.color = '';
            document.body.style.minHeight = '';
            document.body.style.margin = '';
            document.body.style.padding = '';
        };
    }, [theme]);

    const renderAssignToTable = () => {
        if (loading) {
            return (
                <div style={{ textAlign: 'center', padding: '60px', color: themeStyles.color }}>
                    <div style={{
                        display: 'inline-block',
                        width: '50px',
                        height: '50px',
                        border: '5px solid rgba(59, 130, 246, 0.2)',
                        borderTopColor: '#3b82f6',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite'
                    }}></div>
                    <div style={{ marginTop: '20px', fontSize: '15px', fontWeight: '500' }}>Loading data...</div>
                </div>
            );
        }

        if (assignToData.length === 0) {
            return (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '60px',
                    color: themeStyles.labelColor,
                    fontSize: '15px'
                }}>
                    No data available for this file.
                </div>
            );
        }

        let columns = [];
        
        if (activeTab === 'Sheet Metal') {
            columns = [
                { key: 'checkbox', label: '#', width: '60px' },
                { key: 'materialName', label: 'Material Name', align: 'left' },
                { key: 'weight', label: 'Width' },
                { key: 'height', label: 'Height' },
                { key: 'qty', label: 'Qty' },
                { key: 'weight1', label: 'Width' },
                { key: 'height1', label: 'Height' },
                { key: 'qty1', label: 'Qty' },
                { key: 'sqMtrs', label: 'Sq.Mtr' },
                { key: 'sqFet', label: 'Sq.Feet' },
                { key: 'colpc', label: 'COL/P-C' },
                { key: 'requi', label: 'Material' },
                { key: 'col12', label: 'Mat RQMT' },
                { key: 'col13', label: 'Val' },
                { key: 'col14', label: 'Val' },
                { key: 'assignedQty', label: 'Asgn.Qty' },
                { key: 'assignQty', label: 'Assign Qty' }
            ];
        } else if (activeTab === 'Fabrication') {
            columns = [
                { key: 'checkbox', label: '#', width: '60px' },
                { key: 'material_name', label: 'RFD Material Name', align: 'left' },
                { key: 'raw_material', label: 'Raw Material' },
                { key: 'in_mm', label: 'IN MM' },
                { key: 'qty', label: 'Qty' },
                { key: 'mtrs', label: 'IN Mtrs' },
                { key: 'sq_ft', label: 'Sq.Feet' },
                { key: 'color', label: 'Color' },
                { key: 'assignedQty', label: 'Assigned Qty' },
                { key: 'assignQty', label: 'Assign' }
            ];
        } else if (activeTab === 'Foundation') {
            columns = [
                { key: 'checkbox', label: '#', width: '60px' },
                { key: 'material_name', label: 'RFD Material Name', align: 'left' },
                { key: 'moc', label: 'MOC' },
                { key: 'size', label: 'Size' },
                { key: 'length', label: 'Lenght' },
                { key: 'qty', label: 'Qty' },
                { key: 'mtrs', label: 'Mtrs' },
                { key: 'sq_ft', label: 'Sq.Feet' },
                { key: 'wt_per_mtr', label: 'Wt/Mtr' },
                { key: 'weight', label: 'Wt' },
                { key: 'assigned_qty', label: 'Assigned Qty' },
                { key: 'assignQty', label: 'Assign' }
            ];
        }

        return (
            <div style={{ 
                overflowX: 'auto',
                borderRadius: '12px',
                border: `1px solid ${themeStyles.tableBorder}`
            }}>
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '13px'
                }}>
                    <thead>
                        <tr style={{ background: themeStyles.tableHeaderBg, color: '#ffffff' }}>
                            {columns.map((col, idx) => (
                                <th key={idx} style={{
                                    ...headerCellStyle,
                                    width: col.width || 'auto',
                                    textAlign: col.align || 'center'
                                }}>
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {assignToData.map((row, index) => (
                            <tr key={index} style={{
                                backgroundColor: index % 2 === 0 ? themeStyles.tableRowEven : themeStyles.tableRowOdd
                            }}>
                                {columns.map((col, colIdx) => {
                                    if (col.key === 'checkbox') {
                                        return (
                                            <td key={colIdx} style={bodyCellStyle}>
                                                <input 
                                                    type="checkbox" 
                                                    style={{ 
                                                        cursor: 'pointer',
                                                        width: '18px',
                                                        height: '18px',
                                                        accentColor: '#3b82f6'
                                                    }} 
                                                />
                                            </td>
                                        );
                                    }
                                    
                                    if (col.key === 'assignQty') {
                                        return (
                                            <td key={colIdx} style={bodyCellStyle}>
                                                <input
                                                    type="number"
                                                    placeholder="Enter"
                                                    value={assignToQuantities[index] || ''}
                                                    onChange={(e) => handleToQuantityChange(index, e.target.value)}
                                                    style={{
                                                        width: '90px',
                                                        padding: '6px 10px',
                                                        border: `2px solid ${themeStyles.inputBorder}`,
                                                        borderRadius: '6px',
                                                        backgroundColor: themeStyles.inputBg,
                                                        color: themeStyles.inputColor,
                                                        fontSize: '13px',
                                                        fontWeight: '500',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                    onFocus={(e) => {
                                                        e.target.style.borderColor = '#3b82f6';
                                                        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                                    }}
                                                    onBlur={(e) => {
                                                        e.target.style.borderColor = themeStyles.inputBorder;
                                                        e.target.style.boxShadow = 'none';
                                                    }}
                                                />
                                            </td>
                                        );
                                    }
                                    
                                    const cellValue = row[col.key] || '0';
                                    return (
                                        <td key={colIdx} style={{
                                            ...bodyCellStyle,
                                            textAlign: col.align || 'center',
                                            fontWeight: col.key === 'materialName' || col.key === 'rfd_name' ? '500' : 'normal'
                                        }}>
                                            {cellValue}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderAssignFromTable = () => {
        if (loadingFrom) {
            return (
                <div style={{ textAlign: 'center', padding: '60px', color: themeStyles.color }}>
                    <div style={{
                        display: 'inline-block',
                        width: '50px',
                        height: '50px',
                        border: '5px solid rgba(59, 130, 246, 0.2)',
                        borderTopColor: '#3b82f6',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite'
                    }}></div>
                    <div style={{ marginTop: '20px', fontSize: '15px', fontWeight: '500' }}>Loading data...</div>
                </div>
            );
        }

        if (assignFromData.length === 0) {
            return (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '60px',
                    color: themeStyles.labelColor,
                    fontSize: '15px'
                }}>
                    No data available for this file.
                </div>
            );
        }

        let columns = [];
        
        if (activeTab === 'Sheet Metal') {
            columns = [
                { key: 'checkbox', label: '#', width: '60px' },
                { key: 'rfd_name', label: 'Material Name', align: 'left' },
                { key: 'stock', label: 'Stock' },
                { key: 'weight', label: 'Weight' },
                { key: 'height', label: 'Height' },
                { key: 'colour', label: 'Color' },
                { key: 'storelocation', label: 'Location' },
                { key: 'assignQty', label: 'Assign Qty' }
            ];
        } else if (activeTab === 'Fabrication') {
            columns = [
                { key: 'checkbox', label: '#', width: '60px' },
                { key: 'rfd_name', label: 'Material Name', align: 'left' },
                { key: 'stock', label: 'Stock' },
                { key: 'inmm', label: 'In mm' },
                { key: 'color', label: 'Color' },
                { key: 'location', label: 'Location' },
                { key: 'assignQty', label: 'Assign Qty' }
            ];
        } else if (activeTab === 'Foundation') {
            columns = [
                { key: 'checkbox', label: '#', width: '60px' },
                { key: 'rfd_name', label: 'Material Name', align: 'left' },
                { key: 'stock', label: 'Stock' },
                { key: 'moc', label: 'Moc' },
                { key: 'size', label: 'Size' },
                { key: 'length', label: 'Lenght' },
                { key: 'color', label: 'Color' },
                { key: 'location', label: 'Location' },
                { key: 'assignQty', label: 'Assign Qty' }
            ];
        }

        return (
            <div style={{ 
                overflowX: 'auto',
                borderRadius: '12px',
                border: `1px solid ${themeStyles.tableBorder}`
            }}>
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '13px'
                }}>
                    <thead>
                        <tr style={{ background: themeStyles.tableHeaderBg, color: '#ffffff' }}>
                            {columns.map((col, idx) => (
                                <th key={idx} style={{
                                    ...headerCellStyle,
                                    width: col.width || 'auto',
                                    textAlign: col.align || 'center'
                                }}>
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {assignFromData.map((row, index) => (
                            <tr key={index} style={{
                                backgroundColor: index % 2 === 0 ? themeStyles.tableRowEven : themeStyles.tableRowOdd
                            }}>
                                {columns.map((col, colIdx) => {
                                    if (col.key === 'checkbox') {
                                        return (
                                            <td key={colIdx} style={bodyCellStyle}>
                                                <input 
                                                    type="checkbox" 
                                                    style={{ 
                                                        cursor: 'pointer',
                                                        width: '18px',
                                                        height: '18px',
                                                        accentColor: '#3b82f6'
                                                    }} 
                                                />
                                            </td>
                                        );
                                    }
                                    
                                    if (col.key === 'assignQty') {
                                        return (
                                            <td key={colIdx} style={bodyCellStyle}>
                                                <input
                                                    type="number"
                                                    placeholder="Enter Qty"
                                                    value={assignFromQuantities[index] || ''}
                                                    onChange={(e) => handleFromQuantityChange(index, e.target.value)}
                                                    style={{
                                                        width: '100px',
                                                        padding: '6px 10px',
                                                        border: `2px solid ${themeStyles.inputBorder}`,
                                                        borderRadius: '6px',
                                                        backgroundColor: themeStyles.inputBg,
                                                        color: themeStyles.inputColor,
                                                        fontSize: '13px',
                                                        fontWeight: '500',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                    onFocus={(e) => {
                                                        e.target.style.borderColor = '#3b82f6';
                                                        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                                    }}
                                                    onBlur={(e) => {
                                                        e.target.style.borderColor = themeStyles.inputBorder;
                                                        e.target.style.boxShadow = 'none';
                                                    }}
                                                />
                                            </td>
                                        );
                                    }
                                    
                                    if (col.key === 'stock') {
                                        return (
                                            <td key={colIdx} style={{...bodyCellStyle, fontWeight: '600', color: '#3b82f6'}}>
                                                {row[col.key] || '0'}
                                            </td>
                                        );
                                    }
                                    
                                    const cellValue = row[col.key] || (col.key === 'colour' || col.key === 'storelocation' ? 'N/A' : '0');
                                    return (
                                        <td key={colIdx} style={{
                                            ...bodyCellStyle,
                                            textAlign: col.align || 'center',
                                            fontWeight: col.key === 'rfd_name' ? '500' : 'normal'
                                        }}>
                                            {cellValue}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const headerCellStyle = {
        padding: '14px 12px',
        textAlign: 'center',
        fontWeight: '600',
        fontSize: '13px',
        letterSpacing: '0.3px',
        textTransform: 'uppercase',
        borderRight: '1px solid rgba(255,255,255,0.1)'
    };

    const bodyCellStyle = {
        padding: '12px',
        textAlign: 'center',
        border: `1px solid ${themeStyles.tableBorder}`,
        color: themeStyles.color,
        fontSize: '13px'
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: themeStyles.backgroundColor,
            color: themeStyles.color,
            padding: 0,
            margin: 0
        }}>
            <div style={{ 
                maxWidth: isFullScreen ? '100%' : '1400px',
                margin: '0 auto',
                padding: isFullScreen ? 0 : '24px'
            }}>
                <div style={{
                    backgroundColor: themeStyles.cardBg,
                    border: `1px solid ${themeStyles.tabBorder}`,
                    borderRadius: isFullScreen ? 0 : '16px',
                    overflow: 'hidden',
                    boxShadow: theme === 'dark' 
                        ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' 
                        : '0 10px 30px -5px rgba(0, 0, 0, 0.1)'
                }}>
                    {/* Tabs Section */}
                    <div style={{
                        display: 'flex',
                        borderBottom: `2px solid ${themeStyles.tabBorder}`,
                        backgroundColor: themeStyles.cardBg,
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0 24px'
                    }}>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    style={{
                                        padding: '16px 32px',
                                        border: 'none',
                                        background: activeTab === tab ? themeStyles.buttonGradient : 'transparent',
                                        color: activeTab === tab ? '#ffffff' : themeStyles.labelColor,
                                        fontSize: '14px',
                                        fontWeight: activeTab === tab ? '600' : '500',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        outline: 'none',
                                        borderRadius: '8px 8px 0 0',
                                        position: 'relative'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (activeTab !== tab) {
                                            e.target.style.backgroundColor = theme === 'dark' ? '#334155' : '#f1f5f9';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (activeTab !== tab) {
                                            e.target.style.backgroundColor = 'transparent';
                                        }
                                    }}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px 0' }}>
                            <button
                                onClick={toggleFullScreen}
                                style={{
                                    padding: '10px 14px',
                                    backgroundColor: themeStyles.inputBg,
                                    color: themeStyles.color,
                                    border: `2px solid ${themeStyles.inputBorder}`,
                                    borderRadius: '8px',
                                    fontSize: '18px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.borderColor = '#3b82f6';
                                    e.target.style.transform = 'scale(1.05)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.borderColor = themeStyles.inputBorder;
                                    e.target.style.transform = 'scale(1)';
                                }}
                            >
                                {isFullScreen ? '📉' : '📈'}
                            </button>
                            <button
                                onClick={toggleTheme}
                                style={{
                                    padding: '10px 14px',
                                    backgroundColor: themeStyles.inputBg,
                                    color: themeStyles.color,
                                    border: `2px solid ${themeStyles.inputBorder}`,
                                    borderRadius: '8px',
                                    fontSize: '18px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.borderColor = '#3b82f6';
                                    e.target.style.transform = 'scale(1.05)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.borderColor = themeStyles.inputBorder;
                                    e.target.style.transform = 'scale(1)';
                                }}
                            >
                                {theme === 'light' ? '🌙' : '☀️'}
                            </button>
                        </div>
                    </div>

                    {/* Assign To Section */}
                    <div style={{ padding: '28px' }}>
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '10px',
                                fontWeight: '600',
                                fontSize: '15px',
                                color: themeStyles.color,
                                letterSpacing: '0.3px'
                            }}>
                                Assign To File:
                            </label>
                            <Select
                                value={assignToFiles.find(file => file.FILE_ID === selectedAssignToFile) 
                                    ? { 
                                        value: selectedAssignToFile, 
                                        label: `${selectedAssignToFile} - ${assignToFiles.find(f => f.FILE_ID === selectedAssignToFile).FILE_NAME}` 
                                    }
                                    : null
                                }
                                onChange={(selectedOption) => setSelectedAssignToFile(selectedOption ? selectedOption.value : '')}
                                options={assignToFiles.map(file => ({
                                    value: file.FILE_ID,label: `${file.FILE_ID} - ${file.FILE_NAME}`
                            }))}
                            styles={{
                                control: (provided, state) => ({
                                    ...provided,
                                    borderColor: state.isFocused ? '#3b82f6' : themeStyles.inputBorder,
                                    backgroundColor: themeStyles.inputBg,
                                    color: themeStyles.inputColor,
                                    minHeight: '48px',
                                    boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
                                    '&:hover': {
                                        borderColor: '#3b82f6'
                                    }
                                }),
                                menu: (provided) => ({
                                    ...provided,
                                    backgroundColor: themeStyles.inputBg,
                                    zIndex: 9999
                                }),
                                option: (provided, state) => ({
                                    ...provided,
                                    backgroundColor: state.isSelected
                                        ? '#3b82f6'
                                        : state.isFocused
                                            ? (theme === 'dark' ? '#334155' : '#f1f5f9')
                                            : 'transparent',
                                    color: state.isSelected
                                        ? '#ffffff'
                                        : themeStyles.inputColor,
                                    '&:hover': {
                                        backgroundColor: state.isSelected ? '#3b82f6' : (theme === 'dark' ? '#334155' : '#f1f5f9')
                                    }
                                }),
                                singleValue: (provided) => ({
                                    ...provided,
                                    color: themeStyles.inputColor
                                }),
                                placeholder: (provided) => ({
                                    ...provided,
                                    color: themeStyles.labelColor
                                }),
                                input: (provided) => ({
                                    ...provided,
                                    color: themeStyles.inputColor
                                })
                            }}
                            placeholder="Search and select file..."
                            isClearable
                            isSearchable
                            noOptionsMessage={() => "No files found"}
                        />
                    </div>

                    <div style={{ 
                        marginBottom: '20px',
                        fontSize: '17px',
                        fontWeight: '700',
                        color: themeStyles.color,
                        borderBottom: `2px solid ${themeStyles.tableBorder}`,
                        paddingBottom: '12px'
                    }}>
                        Assign To Material Data
                    </div>

                    {renderAssignToTable()}
                </div>

                {/* Assign From Section */}
                <div style={{ 
                    padding: '28px',
                    backgroundColor: theme === 'dark' ? '#0f172a' : '#f8fafc',
                    borderTop: `2px solid ${themeStyles.tableBorder}`
                }}>
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '10px',
                            fontWeight: '600',
                            fontSize: '15px',
                            color: themeStyles.color,
                            letterSpacing: '0.3px'
                        }}>
                            Assign From File:
                        </label>
                        <Select
                            value={assignFromFiles.find(file => file.fileId === selectedAssignFromFile) 
                                ? { 
                                    value: selectedAssignFromFile, 
                                    label: `${selectedAssignFromFile} - ${assignFromFiles.find(f => f.fileId === selectedAssignFromFile).fileName}` 
                                }
                                : null
                            }
                            onChange={(selectedOption) => setSelectedAssignFromFile(selectedOption ? selectedOption.value : '')}
                            options={assignFromFiles.map(file => ({
                                value: file.fileId,
                                label: `${file.fileId} - ${file.fileName}`
                            }))}
                            styles={{
                                control: (provided, state) => ({
                                    ...provided,
                                    borderColor: state.isFocused ? '#3b82f6' : themeStyles.inputBorder,
                                    backgroundColor: themeStyles.inputBg,
                                    color: themeStyles.inputColor,
                                    minHeight: '48px',
                                    boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
                                    '&:hover': {
                                        borderColor: '#3b82f6'
                                    }
                                }),
                                menu: (provided) => ({
                                    ...provided,
                                    backgroundColor: themeStyles.inputBg,
                                    zIndex: 9999
                                }),
                                option: (provided, state) => ({
                                    ...provided,
                                    backgroundColor: state.isSelected
                                        ? '#3b82f6'
                                        : state.isFocused
                                            ? (theme === 'dark' ? '#334155' : '#f1f5f9')
                                            : 'transparent',
                                    color: state.isSelected
                                        ? '#ffffff'
                                        : themeStyles.inputColor,
                                    '&:hover': {
                                        backgroundColor: state.isSelected ? '#3b82f6' : (theme === 'dark' ? '#334155' : '#f1f5f9')
                                    }
                                }),
                                singleValue: (provided) => ({
                                    ...provided,
                                    color: themeStyles.inputColor
                                }),
                                placeholder: (provided) => ({
                                    ...provided,
                                    color: themeStyles.labelColor
                                }),
                                input: (provided) => ({
                                    ...provided,
                                    color: themeStyles.inputColor
                                })
                            }}
                            placeholder="Search and select file..."
                            isClearable
                            isSearchable
                            noOptionsMessage={() => "No files found"}
                        />
                    </div>

                    <div style={{ 
                        marginBottom: '20px',
                        fontSize: '17px',
                        fontWeight: '700',
                        color: themeStyles.color,
                        borderBottom: `2px solid ${themeStyles.tableBorder}`,
                        paddingBottom: '12px'
                    }}>
                        Assign From Material Data
                    </div>

                    {renderAssignFromTable()}
                </div>

                {/* Action Buttons */}
                <div style={{ 
                    padding: '24px 28px',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '16px',
                    borderTop: `2px solid ${themeStyles.tableBorder}`
                }}>
                    <button
                        onClick={handleAssignData}
                        style={{
                            padding: '14px 40px',
                            background: themeStyles.buttonGradient,
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '15px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                        }}
                    >
                        Assign Data
                    </button>
                </div>
            </div>
        </div>

        <style>{`
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            input[type="number"]::-webkit-inner-spin-button,
            input[type="number"]::-webkit-outer-spin-button {
                opacity: 1;
            }
        `}</style>
    </div>
);
};
export default AssignRfdMaterialManager;