import React, { useEffect, useState } from "react";

const PerformRfdManager = () => {
    const getFileIdFromUrl = () => {
        const hash = window.location.hash;
        const segments = hash.split('/');
        return segments[segments.length - 1] || '5600';
    };
    
    const [fileId] = useState(getFileIdFromUrl());
    const [activeTab, setActiveTab] = useState('Sheet Metal');
    const [theme, setTheme] = useState('light');
    const [loading, setLoading] = useState(false);
    const [loadingMaterial, setLoadingMaterial] = useState(false);
    
    // Table 1 data
    const [rfdListData, setRfdListData] = useState([]);
    const [selectedRfdRows, setSelectedRfdRows] = useState([]);
    const [rfdAssignQuantities, setRfdAssignQuantities] = useState({});
    
    // Table 2 data
    const [materialListData, setMaterialListData] = useState([]);
    const [selectedMaterialRows, setSelectedMaterialRows] = useState([]);
    const [materialAssignQuantities, setMaterialAssignQuantities] = useState({});
    
    // Vendor assignment states
    const [vendorAssignments, setVendorAssignments] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const API_BASE_URL = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC";
    const tabs = ['Sheet Metal', 'Fabrication', 'Foundation'];

    // Fetch Table 1 Data based on active tab
    const fetchRfdListData = async () => {
        setLoading(true);
        try {
            let endpoint = '';
            
            if (activeTab === 'Sheet Metal') {
                endpoint = `${API_BASE_URL}/smetalRfdListApi.php?fileID=${fileId}`;
            } else if (activeTab === 'Fabrication') {
                endpoint = `${API_BASE_URL}/FabRfdMaterialListApi.php?fileID=${fileId}`;
            } else if (activeTab === 'Foundation') {
                endpoint = `${API_BASE_URL}/foundRfdMaterialListApi.php?fileID=${fileId}`;
            }
            
            const response = await fetch(endpoint);
            const result = await response.json();

            if (activeTab === 'Fabrication') {
                setRfdListData(Array.isArray(result) ? result : []);
            } else if (result.status === "success" && Array.isArray(result.data)) {
                setRfdListData(result.data);
            } else {
                setRfdListData([]);
            }
        } catch (error) {
            console.error("Error fetching RFD list data:", error);
            setRfdListData([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Table 2 Data
    const fetchMaterialListData = async () => {
        setLoadingMaterial(true);
        try {
            let endpoint = '';
            
            if (activeTab === 'Sheet Metal') {
                endpoint = `${API_BASE_URL}/smetalRfdMaterialListApi.php?fileID=${fileId}`;
            } else if (activeTab === 'Fabrication' || activeTab === 'Foundation') {
                endpoint = `${API_BASE_URL}/FabrawMaterialListApi.php?fileID=${fileId}`;
            }
            
            const response = await fetch(endpoint);
            const result = await response.json();

            if (result.status === "success" && Array.isArray(result.data)) {
                setMaterialListData(result.data);
            } else {
                setMaterialListData([]);
            }
        } catch (error) {
            console.error("Error fetching material list data:", error);
            setMaterialListData([]);
        } finally {
            setLoadingMaterial(false);
        }
    };

    useEffect(() => {
        fetchRfdListData();
        fetchMaterialListData();
        setSelectedRfdRows([]);
        setSelectedMaterialRows([]);
        setRfdAssignQuantities({});
        setMaterialAssignQuantities({});
        setVendorAssignments({});
    }, [activeTab, fileId]);

    const handleRfdCheckboxChange = (index) => {
        setSelectedRfdRows(prev => {
            if (prev.includes(index)) {
                return prev.filter(i => i !== index);
            } else {
                return [...prev, index];
            }
        });
    };

    const handleMaterialCheckboxChange = (index) => {
        setSelectedMaterialRows(prev => {
            if (prev.includes(index)) {
                return prev.filter(i => i !== index);
            } else {
                return [...prev, index];
            }
        });
    };

    const handleRfdQuantityChange = (index, value) => {
        setRfdAssignQuantities({
            ...rfdAssignQuantities,
            [index]: value
        });
    };

    const handleMaterialQuantityChange = (index, value) => {
        setMaterialAssignQuantities({
            ...materialAssignQuantities,
            [index]: value
        });
    };
    
    const handleVendorAssignment = (sequenceCount, vendorName) => {
        setVendorAssignments({
            ...vendorAssignments,
            [sequenceCount]: vendorName
        });
    };

    // Submit handler for RFD and Material data
    const handleSubmit = async () => {
        // Validate selections
        if (selectedRfdRows.length === 0 && selectedMaterialRows.length === 0) {
            alert('Please select at least one RFD or Material row');
            return;
        }

        setSubmitting(true);

        try {
            let apiEndpoint = '';
            
            // Prepare data based on active tab
            const rfdData = selectedRfdRows.map((index) => {
                const row = rfdListData[index];
                const qty = rfdAssignQuantities[index] || row.qty || '0';
                
                if (activeTab === 'Sheet Metal') {
                    return `${index}#${row.materialName || ''}~${row.weight || '0'}~${fileId}~${qty}~${row.colour || ''}`;
                } else if (activeTab === 'Fabrication') {
                    return `${index}#${row.material_name || ''}~${fileId}~${row.in_mm || '0'}~${row.color || ''}~${qty}`;
                } else if (activeTab === 'Foundation') {
                    return `${index}#${row.materialName || ''}~${fileId}~${row.moc || ''}~${row.size || ''}~${row.length || '0'}~${qty}`;
                }
                return '';
            }).filter(Boolean).join(',');

            const materialData = selectedMaterialRows.map((index) => {
                const row = materialListData[index];
                const qty = materialAssignQuantities[index] || row.stockQty || '0';
                const materialName = row.materialName || row.materialID || '';
                
                return `${index}#${materialName}~${fileId}~${qty}`;
            }).filter(Boolean).join(',');

            // Determine API endpoint
            if (activeTab === 'Sheet Metal') {
                apiEndpoint = `${API_BASE_URL}/saveSmetalRfdMaterialApi.php`;
            } else if (activeTab === 'Fabrication') {
                apiEndpoint = `${API_BASE_URL}/saveFabRfdMaterialApi.php`;
            } else if (activeTab === 'Foundation') {
                apiEndpoint = `${API_BASE_URL}/saveFoundRfdMaterialApi.php`;
            }

            const payload = {
                fileID: fileId,
                storeddata: rfdData,
                storedata1: materialData
            };

            console.log('Sending payload:', payload);

            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            console.log('API Response:', result);

            if (result.status === 'success') {
                alert(`Success! ${result.message}\nSequence Count: ${result.sequence_count || 'N/A'}`);
                
                // Refresh data
                fetchRfdListData();
                fetchMaterialListData();
                
                // Clear selections
                setSelectedRfdRows([]);
                setSelectedMaterialRows([]);
                setRfdAssignQuantities({});
                setMaterialAssignQuantities({});
            } else {
                alert(`Error: ${result.message || 'Failed to submit data'}`);
            }

        } catch (error) {
            console.error('Error submitting data:', error);
            alert('Error: Failed to submit data. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAssignVendor = async () => {
        setSubmitting(true);

        try {
            const sequenceCount = Object.keys(vendorAssignments);
            const vendorName = {};
            
            sequenceCount.forEach(seq => {
                vendorName[seq] = vendorAssignments[seq];
            });

            let apiType = '';
            if (activeTab === 'Sheet Metal') {
                apiType = 'Smetal';
            } else if (activeTab === 'Fabrication') {
                apiType = 'Fab';
            } else if (activeTab === 'Foundation') {
                apiType = 'Found';
            }

            const payload = {
                fileID: fileId,
                empID: 'EMP001',
                type: apiType,
                sequenceCount: sequenceCount,
                vendorName: vendorName,
                alertName: [],
                shippingCountry: [],
                LeftOverQty: []
            };

            console.log('Sending vendor payload:', payload);

            const response = await fetch(
                'https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/SaveAssignVendorApi.php',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                }
            );

            const result = await response.json();
            console.log('API Response:', result);

            if (result.status === 'success') {
                alert(`Vendor assigned successfully!\nUpdated: ${result.updated_rows} rows\nInserted: ${result.inserted_rows} rows`);
                
                fetchRfdListData();
                fetchMaterialListData();
                
                setVendorAssignments({});
            } else {
                alert(`Error: ${result.message || 'Failed to assign vendor'}`);
            }

        } catch (error) {
            console.error('Error assigning vendor:', error);
            alert('Error: Failed to assign vendor. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
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
                tableBorder: '#334155',
                tableHeaderBg: '#ef4444',
                tableRowEven: '#1e293b',
                tableRowOdd: '#0f172a',
                buttonBg: '#ef4444',
                buttonHover: '#dc2626',
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
            tabActiveBg: '#ef4444',
            tableBorder: '#e2e8f0',
            tableHeaderBg: '#ef4444',
            tableRowEven: '#ffffff',
            tableRowOdd: '#f8fafc',
            buttonBg: '#ef4444',
            buttonHover: '#dc2626',
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

    const renderRfdListTable = () => {
        if (loading) {
            return (
                <div style={{ textAlign: 'center', padding: '40px', color: themeStyles.color }}>
                    <div style={{
                        display: 'inline-block',
                        width: '40px',
                        height: '40px',
                        border: '4px solid rgba(239, 68, 68, 0.2)',
                        borderTopColor: '#ef4444',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite'
                    }}></div>
                    <div style={{ marginTop: '15px', fontSize: '14px', fontWeight: '500' }}>Loading data...</div>
                </div>
            );
        }

        if (rfdListData.length === 0) {
            return (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '40px',
                    color: themeStyles.labelColor,
                    fontSize: '14px'
                }}>
                    No data available
                </div>
            );
        }

        let columns = [];
        
        if (activeTab === 'Sheet Metal') {
            columns = [
                { key: 'checkbox', label: '☑', width: '50px' },
                { key: 'materialName', label: 'RFD Material', align: 'left', width: '200px' },
                { key: 'weight', label: 'Width', width: '70px' },
                { key: 'length', label: 'Height', width: '70px' },
                { key: 'qty', label: 'Qty', width: '60px' },
                { key: 'weight1', label: 'Width', width: '70px' },
                { key: 'height1', label: 'Height', width: '70px' },
                { key: 'qty1', label: 'Qty', width: '60px' },
                { key: 'sqMtrs', label: 'Sq.Meter', width: '80px' },
                { key: 'sqFet', label: 'Sq.Feet', width: '80px' },
                { key: 'colour', label: 'COL/P-C', width: '100px' },
                { key: 'requi', label: 'Material', width: '90px' },
                { key: 'col12', label: 'MATL RQMT', width: '100px' },
                { key: 'col13', label: '', width: '60px' },
                { key: 'col14', label: '', width: '60px' },
                { key: 'assignedQty', label: 'Assigned Qty', width: '100px' },
                // { key: 'vendor', label: 'Vendor', width: '150px' },
                { key: 'assignQty', label: 'Assign Qty', width: '120px' }
            ];
        } else if (activeTab === 'Fabrication') {
            columns = [
                { key: 'checkbox', label: '☑', width: '50px' },
                { key: 'material_name', label: 'RFD Material Name', align: 'left', width: '250px' },
                { key: 'raw_material', label: 'Raw Material', width: '150px' },
                { key: 'in_mm', label: 'IN MM', width: '80px' },
                { key: 'qty', label: 'Qty', width: '80px' },
                { key: 'mtrs', label: 'IN Mtrs', width: '80px' },
                { key: 'sq_ft', label: 'Sq.Feet', width: '80px' },
                { key: 'color', label: 'Color', width: '100px' },
                { key: 'assigned_qty', label: 'Assigned Qty', width: '100px' },
                // { key: 'vendor', label: 'Vendor', width: '150px' },
                { key: 'assignQty', label: 'Assign', width: '120px' }
            ];
        } else if (activeTab === 'Foundation') {
            columns = [
                { key: 'checkbox', label: '☑', width: '50px' },
                { key: 'materialName', label: 'RFD Material Name', align: 'left', width: '200px' },
                { key: 'moc', label: 'MOC', width: '80px' },
                { key: 'size', label: 'Size', width: '80px' },
                { key: 'length', label: 'Lenght', width: '80px' },
                { key: 'qty', label: 'Qty', width: '80px' },
                { key: 'mtrs', label: 'Mtrs', width: '80px' },
                { key: 'sq_ft', label: 'Sq.Feet', width: '80px' },
                { key: 'weight_per_mtr', label: 'Wt/Mtr', width: '80px' },
                { key: 'weight', label: 'Wt', width: '80px' },
                { key: 'assignedQty', label: 'Assigned Qty', width: '100px' },
                // { key: 'vendor', label: 'Vendor', width: '150px' },
                { key: 'assignQty', label: 'Assign', width: '120px' }
            ];
        }

        return (
            <div style={{ 
                overflowX: 'auto',
                borderRadius: '8px',
                border: `1px solid ${themeStyles.tableBorder}`,
                marginBottom: '20px'
            }}>
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '12px',
                    minWidth: '800px'
                }}>
                    <thead>
                        <tr style={{ backgroundColor: themeStyles.tableHeaderBg, color: '#ffffff' }}>
                            {columns.map((col, idx) => (
                                <th key={idx} style={{
                                    padding: '10px 8px',
                                    textAlign: col.align || 'center',
                                    fontWeight: '600',
                                    fontSize: '11px',
                                    borderRight: '1px solid rgba(255,255,255,0.2)',
                                    width: col.width,
                                    whiteSpace: 'nowrap'
                                }}>
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rfdListData.map((row, index) => (
                            <tr key={index} style={{
                                backgroundColor: selectedRfdRows.includes(index) 
                                    ? (theme === 'dark' ? '#334155' : '#fee2e2')
                                    : (index % 2 === 0 ? themeStyles.tableRowEven : themeStyles.tableRowOdd)
                            }}>
                                {columns.map((col, colIdx) => {
                                    if (col.key === 'checkbox') {
                                        return (
                                            <td key={colIdx} style={{
                                                padding: '8px',
                                                textAlign: 'center',
                                                border: `1px solid ${themeStyles.tableBorder}`
                                            }}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedRfdRows.includes(index)}
                                                    onChange={() => handleRfdCheckboxChange(index)}
                                                    style={{ 
                                                        cursor: 'pointer',
                                                        width: '16px',
                                                        height: '16px',
                                                        accentColor: '#ef4444'
                                                    }} 
                                                />
                                            </td>
                                        );
                                    }
                                    
                                    if (col.key === 'vendor') {
                                        const sequenceCount = row.sequence_count || row.sequenceCount || index;
                                        
                                        return (
                                            {/* <td key={colIdx} style={{
                                                padding: '8px',
                                                textAlign: 'center',
                                                border: `1px solid ${themeStyles.tableBorder}`
                                            }}>
                                                <input
                                                    type="text"
                                                    placeholder="Vendor Name"
                                                    value={vendorAssignments[sequenceCount] || ''}
                                                    onChange={(e) => handleVendorAssignment(sequenceCount, e.target.value)}
                                                    style={{
                                                        width: '130px',
                                                        padding: '6px 8px',
                                                        border: `2px solid ${themeStyles.inputBorder}`,
                                                        borderRadius: '4px',
                                                        backgroundColor: themeStyles.inputBg,
                                                        color: themeStyles.inputColor,
                                                        fontSize: '12px',
                                                        fontWeight: '500',
                                                        transition: 'all 0.2s ease',
                                                        cursor: 'text',
                                                        outline: 'none'
                                                    }}
                                                    onFocus={(e) => {
                                                        e.target.style.borderColor = '#ef4444';
                                                        e.target.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
                                                    }}
                                                    onBlur={(e) => {
                                                        e.target.style.borderColor = themeStyles.inputBorder;
                                                        e.target.style.boxShadow = 'none';
                                                    }}
                                                />
                                            </td> */}
                                        );
                                    }
                                    
                                    if (col.key === 'assignQty') {
                                        return (
                                            <td key={colIdx} style={{
                                                padding: '8px',
                                                textAlign: 'center',
                                                border: `1px solid ${themeStyles.tableBorder}`
                                            }}>
                                                <input
                                                    type="number"
                                                    placeholder="Enter"
                                                    value={rfdAssignQuantities[index] || ''}
                                                    onChange={(e) => handleRfdQuantityChange(index, e.target.value)}
                                                    disabled={!selectedRfdRows.includes(index)}
                                                    style={{
                                                        width: '90px',
                                                        padding: '6px 8px',
                                                        border: `2px solid ${themeStyles.inputBorder}`,
                                                        borderRadius: '4px',
                                                        backgroundColor: selectedRfdRows.includes(index) ? themeStyles.inputBg : '#e2e8f0',
                                                        color: themeStyles.inputColor,
                                                        fontSize: '12px',
                                                        fontWeight: '500',
                                                        transition: 'all 0.2s ease',
                                                        cursor: selectedRfdRows.includes(index) ? 'text' : 'not-allowed',
                                                        outline: 'none'
                                                    }}
                                                    onFocus={(e) => {
                                                        if (selectedRfdRows.includes(index)) {
                                                            e.target.style.borderColor = '#ef4444';
                                                            e.target.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
                                                        }
                                                    }}
                                                    onBlur={(e) => {
                                                        e.target.style.borderColor = themeStyles.inputBorder;
                                                        e.target.style.boxShadow = 'none';
                                                    }}
                                                />
                                            </td>
                                        );
                                    }
                                    
                                    const cellValue = row[col.key] !== undefined && row[col.key] !== null && row[col.key] !== '' 
                                        ? row[col.key] 
                                        : '0';
                                    
                                    return (
                                        <td key={colIdx} style={{
                                            padding: '8px',
                                            textAlign: col.align || 'center',
                                            border: `1px solid ${themeStyles.tableBorder}`,
                                            color: themeStyles.color,
                                            fontSize: '12px',
                                            fontWeight: (col.key === 'materialName' || col.key === 'material_name') ? '500' : 'normal',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            maxWidth: col.width
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

    const renderMaterialListTable = () => {
        if (loadingMaterial) {
            return (
                <div style={{ textAlign: 'center', padding: '40px', color: themeStyles.color }}>
                    <div style={{
                        display: 'inline-block',
                        width: '40px',
                        height: '40px',
                        border: '4px solid rgba(239, 68, 68, 0.2)',
                        borderTopColor: '#ef4444',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite'
                    }}></div>
                    <div style={{ marginTop: '15px', fontSize: '14px', fontWeight: '500' }}>Loading data...</div>
                </div>
            );
        }

        if (materialListData.length === 0) {
            return (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '40px',
                    color: themeStyles.labelColor,
                    fontSize: '14px'
                }}>
                    No data available
                </div>
            );
        }

        const columns = [
            { key: 'checkbox', label: '☑', width: '50px' },
            { key: 'materialName', label: 'Material Description', align: 'left', width: '300px' },
            { key: 'unit', label: 'Unit', width: '80px' },
            { key: 'stockQty', label: activeTab === 'Sheet Metal' ? 'Qty.122' : 'Qty', width: '100px' },
            { key: 'assignQty', label: 'Assign Qty', width: '120px' }
        ];

        return (
            <div style={{ 
                overflowX: 'auto',
                borderRadius: '8px',
                border: `1px solid ${themeStyles.tableBorder}`
            }}>
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '12px',
                    minWidth: '600px'
                }}>
                    <thead>
                        <tr style={{ backgroundColor: themeStyles.tableHeaderBg, color: '#ffffff' }}>
                            {columns.map((col, idx) => (
                                <th key={idx} style={{
                                    padding: '10px 8px',
                                    textAlign: col.align || 'center',
                                    fontWeight: '600',
                                    fontSize: '11px',
                                    borderRight: '1px solid rgba(255,255,255,0.2)',
                                    width: col.width,
                                    whiteSpace: 'nowrap'
                                }}>
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {materialListData.map((row, index) => (
                            <tr key={index} style={{
                                backgroundColor: selectedMaterialRows.includes(index)
                                    ? (theme === 'dark' ? '#334155' : '#fee2e2')
                                    : (index % 2 === 0 ? themeStyles.tableRowEven : themeStyles.tableRowOdd)
                            }}>
                                {columns.map((col, colIdx) => {
                                    if (col.key === 'checkbox') {
                                        return (
                                            <td key={colIdx} style={{
                                                padding: '8px',
                                                textAlign: 'center',
                                                border: `1px solid ${themeStyles.tableBorder}`
                                            }}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedMaterialRows.includes(index)}
                                                    onChange={() => handleMaterialCheckboxChange(index)}
                                                    style={{ 
                                                        cursor: 'pointer',
                                                        width: '16px',
                                                        height: '16px',
                                                        accentColor: '#ef4444'
                                                    }} 
                                                />
                                            </td>
                                        );
                                    }
                                    
                                    if (col.key === 'assignQty') {
                                        return (
                                            <td key={colIdx} style={{
                                                padding: '8px',
                                                textAlign: 'center',
                                                border: `1px solid ${themeStyles.tableBorder}`
                                            }}>
                                                <input
                                                    type="number"
                                                    placeholder="Enter"
                                                    value={materialAssignQuantities[index] || ''}
                                                    onChange={(e) => handleMaterialQuantityChange(index, e.target.value)}
                                                    style={{
                                                        width: '90px',
                                                        padding: '6px 8px',
                                                        border: `2px solid ${themeStyles.inputBorder}`,
                                                        borderRadius: '4px',
                                                        backgroundColor: themeStyles.inputBg,
                                                        color: themeStyles.inputColor,
                                                        fontSize: '12px',
                                                        fontWeight: '500',
                                                        transition: 'all 0.2s ease',
                                                        cursor: 'text',
                                                        outline: 'none'
                                                    }}
                                                    onFocus={(e) => {
                                                        e.target.style.borderColor = '#ef4444';
                                                        e.target.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
                                                    }}
                                                    onBlur={(e) => {
                                                        e.target.style.borderColor = themeStyles.inputBorder;
                                                        e.target.style.boxShadow = 'none';
                                                    }}
                                                />
                                            </td>
                                        );
                                    }
                                    
                                    let cellValue = '0';
                                    if (col.key === 'materialName') {
                                        cellValue = row.materialName || row.materialID || '0';
                                    } else if (col.key === 'stockQty') {
                                        cellValue = row.stockQty !== undefined ? row.stockQty : '0';
                                    } else {
                                        cellValue = row[col.key] !== undefined && row[col.key] !== null && row[col.key] !== '' ? row[col.key] : '0';
                                    }
                                    
                                    return (
                                        <td key={colIdx} style={{
                                            padding: '8px',
                                            textAlign: col.align || 'center',
                                            border: `1px solid ${themeStyles.tableBorder}`,
                                            color: themeStyles.color,
                                            fontSize: '12px',
                                            fontWeight: col.key === 'materialName' ? '500' : 'normal',
                                            whiteSpace: col.key === 'materialName' ? 'normal' : 'nowrap',
                                            wordWrap: col.key === 'materialName' ? 'break-word' : 'normal'
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

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: themeStyles.backgroundColor,
            color: themeStyles.color,
            padding: 0,
            margin: 0
        }}>
            <div style={{ 
                maxWidth: '100%',
                margin: '0 auto',
                padding: 0
            }}>
                <div style={{
                    backgroundColor: themeStyles.cardBg,
                    border: `1px solid ${themeStyles.tableBorder}`,
                    borderRadius: 0,
                    overflow: 'hidden',
                    boxShadow: theme === 'dark' ? '0 10px 25px -5px rgba(0, 0, 0, 0.5)' : '0 4px 15px -2px rgba(0, 0, 0, 0.1)'
                }}>
                    {/* Header with tabs and theme toggle */}
                    <div style={{
                        display: 'flex',
                        borderBottom: `2px solid ${themeStyles.tableBorder}`,
                        backgroundColor: themeStyles.cardBg,
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0 16px',
                        flexWrap: 'wrap',
                        gap: '10px'
                    }}>
                        <div style={{
                            display: 'flex',
                            gap: '2px',
                            overflowX: 'auto',
                            flex: '1',
                            minWidth: '0'
                        }}>
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    style={{
                                        padding: '12px 20px',
                                        border: 'none',
                                        background: activeTab === tab ? themeStyles.buttonBg : 'transparent',
                                        color: activeTab === tab ? '#ffffff' : themeStyles.labelColor,
                                        fontSize: '13px',
                                        fontWeight: activeTab === tab ? '600' : '500',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        outline: 'none',
                                        borderRadius: '6px 6px 0 0',
                                        whiteSpace: 'nowrap'
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
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '8px 0'
                        }}>
                            <div style={{
                                marginRight: '12px',
                                fontSize: '12px',
                                fontWeight: '600',
                                color: themeStyles.color,
                                whiteSpace: 'nowrap'
                            }}>
                                File Name: SM-25-084-LUN
                            </div>
                            <button
                                onClick={toggleTheme}
                                style={{
                                    padding: '8px 12px',
                                    backgroundColor: themeStyles.inputBg,
                                    color: themeStyles.color,
                                    border: `2px solid ${themeStyles.inputBorder}`,
                                    borderRadius: '6px',
                                    fontSize: '16px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.borderColor = '#ef4444';
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

                    {/* Main Content */}
                    <div style={{ padding: '16px' }}>
                        {/* RFD List Table */}
                        {renderRfdListTable()}

                        {/* Material List Table */}
                        <div style={{ 
                            marginTop: '24px',
                            borderTop: `2px solid ${themeStyles.tableBorder}`,
                            paddingTop: '20px'
                        }}>
                            <div style={{
                                fontSize: '14px',
                                fontWeight: '700',
                                color: themeStyles.color,
                                marginBottom: '12px',
                                paddingBottom: '8px',
                                borderBottom: `1px solid ${themeStyles.tableBorder}`
                            }}>
                                Material Description
                            </div>
                            {renderMaterialListTable()}
                        </div>

                        {/* Action Buttons */}
                        <div style={{ 
                            marginTop: '24px',
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '12px',
                            flexWrap: 'wrap',
                            paddingTop: '16px',
                            borderTop: `2px solid ${themeStyles.tableBorder}`
                        }}>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                style={{
                                    padding: '12px 32px',
                                    background: submitting ? '#9ca3af' : themeStyles.buttonBg,
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: submitting ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
                                    opacity: submitting ? 0.6 : 1
                                }}
                                onMouseEnter={(e) => {
                                    if (!submitting) {
                                        e.target.style.backgroundColor = themeStyles.buttonHover;
                                        e.target.style.transform = 'translateY(-1px)';
                                        e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!submitting) {
                                        e.target.style.backgroundColor = themeStyles.buttonBg;
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3)';
                                    }
                                }}
                            >
                                {submitting ? 'Submitting...' : 'Submit'}
                            </button>
                            <button
                                onClick={handleAssignVendor}
                                disabled={submitting}
                                style={{
                                    padding: '12px 32px',
                                    background: submitting ? '#9ca3af' : themeStyles.buttonBg,
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: submitting ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
                                    opacity: submitting ? 0.6 : 1
                                }}
                                onMouseEnter={(e) => {
                                    if (!submitting) {
                                        e.target.style.backgroundColor = themeStyles.buttonHover;
                                        e.target.style.transform = 'translateY(-1px)';
                                        e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!submitting) {
                                        e.target.style.backgroundColor = themeStyles.buttonBg;
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3)';
                                    }
                                }}
                            >
                                {submitting ? 'Assigning...' : 'Assign Vendor'}
                            </button>
                        </div>
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
                
                @media (max-width: 768px) {
                    table {
                        font-size: 11px !important;
                    }
                    
                    th, td {
                        padding: 6px 4px !important;
                    }
                    
                    button {
                        padding: 10px 16px !important;
                        fontSize: 12px !important;
                    }
                    
                    input[type="number"], input[type="text"] {
                        width: 70px !important;
                        font-size: 11px !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default PerformRfdManager;