import React, { useState, useEffect } from 'react';

const FATMaterialSelector = () => {
    const [theme, setTheme] = useState('light');
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedFATLocation, setSelectedFATLocation] = useState('');
    const [activeTab, setActiveTab] = useState('fatList');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [fileOptions, setFileOptions] = useState([]);
    const [loadingFiles, setLoadingFiles] = useState(false);
    const [packingListData, setPackingListData] = useState([]);
    const [assignedPackingData, setAssignedPackingData] = useState([]);
    const [loadingData, setLoadingData] = useState(false);
    const [saving, setSaving] = useState(false);
    
    // State for tracking checked items and their FAT quantities
    const [checkedItems, setCheckedItems] = useState(new Set());
    const [fatQuantities, setFatQuantities] = useState({});

    // FAT Location options
    const fatLocationOptions = [
        'VIVID',
        'SUSHAM'
    ];

    // Handle window resize for mobile responsiveness
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Reset states when file changes
    useEffect(() => {
        setCheckedItems(new Set());
        setFatQuantities({});
    }, [selectedFile]);

    // Fetch file options from API
    const fetchFileOptions = async () => {
        setLoadingFiles(true);
        try {
            const response = await fetch("https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/file_master.php");
            const data = await response.json();
            if (data.status === "success" && Array.isArray(data.files)) {
                const options = data.files.map(file => ({
                    value: file.FILE_ID,
                    label: `${file.FILE_NAME} (ID: ${file.FILE_ID})`
                }));
                setFileOptions(options);
            } else {
                console.error("Invalid API response:", data);
                setFileOptions([]);
            }
        } catch (error) {
            console.error("Error fetching files:", error);
            setFileOptions([]);
        } finally {
            setLoadingFiles(false);
        }
    };

    // Fetch packing list data based on file ID
    const fetchPackingListData = async (fileId) => {
        setLoadingData(true);
        try {
            const response = await fetch(`https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/getPackingListData.php?fileid=${fileId}`);
            const data = await response.json();
            if (data.status === "success" && Array.isArray(data.data)) {
                setPackingListData(data.data);
            } else {
                console.error("Invalid packing list API response:", data);
                setPackingListData([]);
            }
        } catch (error) {
            console.error("Error fetching packing list data:", error);
            setPackingListData([]);
        } finally {
            setLoadingData(false);
        }
    };

    // Fetch assigned packing list data based on file ID
    const fetchAssignedPackingData = async (fileId) => {
        setLoadingData(true);
        try {
            const response = await fetch(`https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/assignPackingList.php?fileid=${fileId}`);
            const data = await response.json();
            if (data.status === "success" && Array.isArray(data.data)) {
                setAssignedPackingData(data.data);
            } else {
                console.error("Invalid assigned packing API response:", data);
                setAssignedPackingData([]);
            }
        } catch (error) {
            console.error("Error fetching assigned packing data:", error);
            setAssignedPackingData([]);
        } finally {
            setLoadingData(false);
        }
    };

    // Handle file selection
    const handleFileSelect = (selectedOption) => {
        setSelectedFile(selectedOption);
        if (selectedOption && selectedOption.value) {
            fetchPackingListData(selectedOption.value);
            fetchAssignedPackingData(selectedOption.value);
        } else {
            setPackingListData([]);
            setAssignedPackingData([]);
        }
    };

    // Handle checkbox change
    const handleCheckboxChange = (index, isChecked) => {
        const newCheckedItems = new Set(checkedItems);
        if (isChecked) {
            newCheckedItems.add(index);
        } else {
            newCheckedItems.delete(index);
            // Remove quantity when unchecked
            const newFatQuantities = { ...fatQuantities };
            delete newFatQuantities[index];
            setFatQuantities(newFatQuantities);
        }
        setCheckedItems(newCheckedItems);
    };

    // Handle FAT quantity change
    const handleFatQuantityChange = (index, quantity) => {
        setFatQuantities({
            ...fatQuantities,
            [index]: quantity
        });
    };

    // Save selected materials to API - FIXED VERSION
    const handleAssignAndSave = async () => {
        if (!selectedFile) {
            alert('Please select a file first');
            return;
        }

        if (!selectedFATLocation) {
            alert('Please select a FAT location first');
            return;
        }

        if (checkedItems.size === 0) {
            alert('Please select at least one material by checking the checkbox');
            return;
        }

        // Validate that all checked items have quantities
        const checkedItemsArray = Array.from(checkedItems);
        const missingQuantities = checkedItemsArray.filter(index => 
            !fatQuantities[index] || fatQuantities[index] <= 0
        );

        if (missingQuantities.length > 0) {
            alert('Please enter valid FAT quantities for all selected materials');
            return;
        }

        setSaving(true);

        try {
            // FIXED: Prepare data in the correct format for PHP parsing
            const storeDataArray = checkedItemsArray.map(index => {
                const row = packingListData[index];
                const fatQty = fatQuantities[index];
                
                // Helper function to handle empty values for numeric fields
                const getNumericValue = (value) => {
                    if (value === null || value === undefined || value === '' || value === 'NULL') {
                        return '0';
                    }
                    const numStr = String(value).replace(/[^\d.-]/g, '');
                    return numStr || '0';
                };

                // Helper function to handle string values
                const getStringValue = (value) => {
                    if (value === null || value === undefined || value === 'NULL') {
                        return '';
                    }
                    return String(value).trim();
                };

                const description = getStringValue(row.description || row.DESCRIPTION);
                const width = getNumericValue(row.width || row.W_MM || row.wMm);
                const height = getNumericValue(row.height || row.H_L_MM || row.hLMm);
                const quantity = getNumericValue(row.quantity || row.QTY || row.qty);
                const weight = getNumericValue(row.weight || row.WT || row.wt);
                
                // FIXED FORMAT: Remove the index prefix and just send the data
                // Format: "fileId~description~width~height~quantity~weight~fatQuantity"
                return `${selectedFile.value}~${description}~${width}~${height}~${quantity}~${weight}~${fatQty}`;
            });

            const storedata = storeDataArray.join(',');

            const payload = {
                storedata: storedata,
                locationFat: selectedFATLocation,
                userName: 'system'
            };

            console.log('Sending payload:', payload);
            console.log('Sample data format:', storeDataArray[0]);

            const response = await fetch('https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/save_project_fat_list.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            console.log('API Response:', result);

            if (result.status === 'success' || result.status === 'partial_success') {
                alert(`Success! ${result.data.inserted} records inserted successfully.`);
                
                // Reset form
                setCheckedItems(new Set());
                setFatQuantities({});
                
                // Refresh the assigned packing data
                if (selectedFile?.value) {
                    fetchAssignedPackingData(selectedFile.value);
                }
            } else {
                alert(`Error: ${result.message}`);
                if (result.data?.errors) {
                    console.error('API Errors:', result.data.errors);
                }
            }

        } catch (error) {
            console.error('Error saving data:', error);
            alert('Error occurred while saving data. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        fetchFileOptions();
    }, []);

    // Theme styles
    const getThemeStyles = () => {
        if (theme === 'dark') {
            return {
                backgroundColor: 'linear-gradient(135deg, #21262d 0%, #161b22 100%)',
                color: '#f8f9fa',
                cardBg: '#343a40',
                cardHeader: 'linear-gradient(135deg, #495057 0%, #343a40 100%)',
                tableBg: '#2c3034',
                tableHeader: '#495057',
                border: '#495057',
                inputBg: '#343a40',
                inputBorder: '#495057'
            };
        }
        return {
            backgroundColor: 'linear-gradient(135deg, #f8f9ff 0%, #e6f3ff 100%)',
            color: '#212529',
            cardBg: '#ffffff',
            cardHeader: 'linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%)',
            tableBg: '#ffffff',
            tableHeader: '#f8f9fa',
            border: '#dee2e6',
            inputBg: '#ffffff',
            inputBorder: '#ced4da'
        };
    };

    const themeStyles = getThemeStyles();

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const renderFATListTable = () => {
        if (loadingData) {
            return (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <div style={{ 
                        border: '4px solid #f3f3f3',
                        borderTop: '4px solid #3498db',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        animation: 'spin 2s linear infinite',
                        margin: '0 auto'
                    }}></div>
                    <p style={{ marginTop: '20px' }}>Loading packing list data...</p>
                </div>
            );
        }

        if (packingListData.length === 0) {
            return (
                <div style={{ textAlign: 'center', padding: '50px', color: themeStyles.color }}>
                    <p>No packing list data available for selected file.</p>
                </div>
            );
        }

        return (
            <div style={{ overflowX: 'auto' }}>
                <table style={{ 
                    width: '100%',
                    borderCollapse: 'collapse',
                    backgroundColor: themeStyles.tableBg,
                    color: themeStyles.color,
                    fontSize: isMobile ? '12px' : '14px'
                }}>
                    <thead style={{ backgroundColor: themeStyles.tableHeader }}>
                        <tr>
                            <th style={{ padding: '8px', border: `1px solid ${themeStyles.border}` }}>
                                Select
                            </th>
                            <th style={{ padding: '8px', border: `1px solid ${themeStyles.border}`, minWidth: '120px' }}>Description</th>
                            <th style={{ padding: '8px', border: `1px solid ${themeStyles.border}`, minWidth: '80px' }}>W (mm)</th>
                            <th style={{ padding: '8px', border: `1px solid ${themeStyles.border}`, minWidth: '80px' }}>H / L (mm)</th>
                            <th style={{ padding: '8px', border: `1px solid ${themeStyles.border}`, minWidth: '60px' }}>Qty</th>
                            <th style={{ padding: '8px', border: `1px solid ${themeStyles.border}`, minWidth: '60px' }}>WT</th>
                            <th style={{ padding: '8px', border: `1px solid ${themeStyles.border}`, minWidth: '120px', backgroundColor: '#fd7e14', color: 'white' }}>
                                Enter FAT Quantity
                            </th>
                        </tr>
                        {selectedFile && (
                            <tr style={{ backgroundColor: '#fd7e14', color: 'white' }}>
                                <th colSpan="7" style={{ padding: '8px', border: `1px solid ${themeStyles.border}`, textAlign: 'center' }}>
                                    {selectedFile.label}
                                </th>
                            </tr>
                        )}
                    </thead>
                    <tbody>
                        {packingListData.map((row, index) => (
                            <tr key={index} style={{
                                backgroundColor: checkedItems.has(index) ? (theme === 'dark' ? '#2d5016' : '#d1edcc') : 'transparent'
                            }}>
                                <td style={{ padding: '6px', border: `1px solid ${themeStyles.border}`, textAlign: 'center' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={checkedItems.has(index)}
                                        onChange={(e) => handleCheckboxChange(index, e.target.checked)}
                                    />
                                </td>
                                <td style={{ padding: '6px', border: `1px solid ${themeStyles.border}` }}>
                                    {row.description || row.DESCRIPTION || ''}
                                </td>
                                <td style={{ padding: '6px', border: `1px solid ${themeStyles.border}`, textAlign: 'right' }}>
                                    {row.width || row.W_MM || row.wMm || ''}
                                </td>
                                <td style={{ padding: '6px', border: `1px solid ${themeStyles.border}`, textAlign: 'right' }}>
                                    {row.height || row.H_L_MM || row.hLMm || ''}
                                </td>
                                <td style={{ padding: '6px', border: `1px solid ${themeStyles.border}`, textAlign: 'center' }}>
                                    {row.quantity || row.QTY || row.qty || ''}
                                </td>
                                <td style={{ padding: '6px', border: `1px solid ${themeStyles.border}`, textAlign: 'right' }}>
                                    {row.weight || row.WT || row.wt || ''}
                                </td>
                                <td style={{ padding: '6px', border: `1px solid ${themeStyles.border}` }}>
                                    <input 
                                        type="number" 
                                        style={{
                                            width: '100%',
                                            padding: '4px',
                                            backgroundColor: themeStyles.inputBg,
                                            border: `1px solid ${themeStyles.inputBorder}`,
                                            color: themeStyles.color,
                                            fontSize: '12px'
                                        }}
                                        placeholder="0"
                                        min="0"
                                        value={fatQuantities[index] || ''}
                                        onChange={(e) => handleFatQuantityChange(index, parseInt(e.target.value) || 0)}
                                        disabled={!checkedItems.has(index)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderAssignedMaterialTable = () => {
        if (loadingData) {
            return (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <div style={{ 
                        border: '4px solid #f3f3f3',
                        borderTop: '4px solid #3498db',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        animation: 'spin 2s linear infinite',
                        margin: '0 auto'
                    }}></div>
                    <p style={{ marginTop: '20px' }}>Loading assigned material data...</p>
                </div>
            );
        }

        if (assignedPackingData.length === 0) {
            return (
                <div style={{ textAlign: 'center', padding: '50px', color: themeStyles.color }}>
                    <p>No assigned material data available for selected file.</p>
                </div>
            );
        }

        return (
            <div style={{ overflowX: 'auto' }}>
                <table style={{ 
                    width: '100%',
                    borderCollapse: 'collapse',
                    backgroundColor: themeStyles.tableBg,
                    color: themeStyles.color,
                    fontSize: isMobile ? '12px' : '14px'
                }}>
                    <thead style={{ backgroundColor: themeStyles.tableHeader }}>
                        <tr>
                            <th style={{ padding: '8px', border: `1px solid ${themeStyles.border}` }}>Sr. No.</th>
                            <th style={{ padding: '8px', border: `1px solid ${themeStyles.border}` }}>Description</th>
                            <th style={{ padding: '8px', border: `1px solid ${themeStyles.border}` }}>W (mm)</th>
                            <th style={{ padding: '8px', border: `1px solid ${themeStyles.border}` }}>H / L (mm)</th>
                            <th style={{ padding: '8px', border: `1px solid ${themeStyles.border}` }}>Qty</th>
                            <th style={{ padding: '8px', border: `1px solid ${themeStyles.border}` }}>WT</th>
                            <th style={{ padding: '8px', border: `1px solid ${themeStyles.border}` }}>FAT Quantity</th>
                            <th style={{ padding: '8px', border: `1px solid ${themeStyles.border}` }}>FAT Location</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assignedPackingData.map((row, index) => (
                            <tr key={index}>
                                <td style={{ padding: '6px', border: `1px solid ${themeStyles.border}`, textAlign: 'center' }}>
                                    {index + 1}
                                </td>
                                <td style={{ padding: '6px', border: `1px solid ${themeStyles.border}` }}>
                                    {row.description || row.DESCRIPTION || ''}
                                </td>
                                <td style={{ padding: '6px', border: `1px solid ${themeStyles.border}`, textAlign: 'right' }}>
                                    {row.width || row.w || ''}
                                </td>
                                <td style={{ padding: '6px', border: `1px solid ${themeStyles.border}`, textAlign: 'right' }}>
                                    {row.height || row.hl || row.hLMm || ''}
                                </td>
                                <td style={{ padding: '6px', border: `1px solid ${themeStyles.border}`, textAlign: 'center' }}>
                                    {row.quantity || row.design_qty || row.qty || ''}
                                </td>
                                <td style={{ padding: '6px', border: `1px solid ${themeStyles.border}`, textAlign: 'right' }}>
                                    {row.weight || row.WT || row.wt || ''}
                                </td>
                                <td style={{ padding: '6px', border: `1px solid ${themeStyles.border}`, textAlign: 'center' }}>
                                    {row.fatQuantity || row.FAT_QUANTITY || row.fat_quantity || row.fat_qty || '1'}
                                </td>
                                <td style={{ padding: '6px', border: `1px solid ${themeStyles.border}`, textAlign: 'center' }}>
                                    <span style={{ 
                                        backgroundColor: '#28a745', 
                                        color: 'white', 
                                        padding: '2px 8px', 
                                        borderRadius: '12px',
                                        fontSize: '11px'
                                    }}>
                                        {row.fatLocation || row.FAT_LOCATION || row.fat_location || 'VIVID'}
                                    </span>
                                </td>
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
            background: themeStyles.backgroundColor,
            color: themeStyles.color,
            padding: '20px'
        }}>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
            
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{
                    backgroundColor: themeStyles.cardBg,
                    color: themeStyles.color,
                    border: `1px solid ${themeStyles.border}`,
                    borderRadius: '8px'
                }}>
                    {/* Header */}
                    <div style={{
                        background: themeStyles.cardHeader,
                        color: theme === 'dark' ? '#ffffff' : '#000000',
                        padding: '1rem 2rem',
                        borderRadius: '8px 8px 0 0'
                    }}>
                        <div style={{ 
                            display: 'flex',
                            flexDirection: isMobile ? 'column' : 'row',
                            alignItems: isMobile ? 'stretch' : 'center',
                            gap: '1rem'
                        }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ 
                                    display: 'grid',
                                    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                                    gap: '1rem'
                                }}>
                                    {/* Select File Dropdown */}
                                    <div>
                                        <label style={{ 
                                            display: 'block',
                                            fontSize: '14px', 
                                            marginBottom: '5px',
                                            fontWeight: 'bold'
                                        }}>
                                            Select File
                                        </label>
                                        <select
                                            value={selectedFile?.value || ''}
                                            onChange={(e) => {
                                                const option = fileOptions.find(opt => opt.value === e.target.value);
                                                handleFileSelect(option || null);
                                            }}
                                            style={{
                                                width: '100%',
                                                padding: '8px',
                                                backgroundColor: themeStyles.inputBg,
                                                border: `1px solid ${themeStyles.inputBorder}`,
                                                color: themeStyles.color,
                                                fontSize: '14px',
                                                borderRadius: '4px'
                                            }}
                                            disabled={loadingFiles}
                                        >
                                            <option value="">{loadingFiles ? "Loading files..." : "Select File..."}</option>
                                            {fileOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                        {loadingFiles && (
                                            <small style={{ color: themeStyles.color, opacity: 0.7 }}>
                                                Fetching file list from server...
                                            </small>
                                        )}
                                    </div>

                                    {/* Select FAT Location Dropdown */}
                                    <div>
                                        <label style={{ 
                                            display: 'block',
                                            fontSize: '14px', 
                                            marginBottom: '5px',
                                            fontWeight: 'bold'
                                        }}>
                                            Select FAT Location *
                                        </label>
                                        <select 
                                            value={selectedFATLocation}
                                            onChange={(e) => setSelectedFATLocation(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '8px',
                                                backgroundColor: themeStyles.inputBg,
                                                border: `1px solid ${themeStyles.inputBorder}`,
                                                color: themeStyles.color,
                                                fontSize: '14px',
                                                borderRadius: '4px'
                                            }}
                                            required
                                        >
                                            <option value="">Select FAT Location...</option>
                                            {fatLocationOptions.map((location, index) => (
                                                <option key={index} value={location}>
                                                    {location}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div style={{ 
                                display: 'flex',
                                gap: '10px',
                                justifyContent: isMobile ? 'center' : 'flex-end'
                            }}>
                                <button
                                    onClick={fetchFileOptions}
                                    disabled={loadingFiles}
                                    title="Refresh File List"
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: 'transparent',
                                        border: `1px solid ${themeStyles.border}`,
                                        color: themeStyles.color,
                                        borderRadius: '4px',
                                        cursor: loadingFiles ? 'not-allowed' : 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    {loadingFiles ? 'Loading...' : 'Refresh Files'}
                                </button>
                                <button
                                    onClick={toggleTheme}
                                    title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: 'transparent',
                                        border: `1px solid ${themeStyles.border}`,
                                        color: themeStyles.color,
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    {theme === 'light' ? 'Dark' : 'Light'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tabs and Content */}
                    <div>
                        {/* Tab Navigation */}
                        <div style={{ 
                            display: 'flex',
                            backgroundColor: themeStyles.cardBg,
                            borderBottom: `1px solid ${themeStyles.border}`,
                            paddingLeft: '1rem'
                        }}>
                            <button
                                onClick={() => setActiveTab('fatList')}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: activeTab === 'fatList' ? '#fd7e14' : 'transparent',
                                    color: activeTab === 'fatList' ? 'white' : themeStyles.color,
                                    border: `1px solid ${themeStyles.border}`,
                                    borderBottom: activeTab === 'fatList' ? 'none' : `1px solid ${themeStyles.border}`,
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    borderRadius: '4px 4px 0 0'
                                }}
                            >
                                Packing List Data
                                {checkedItems.size > 0 && (
                                    <span style={{
                                        marginLeft: '8px',
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                        padding: '2px 6px',
                                        borderRadius: '10px',
                                        fontSize: '11px'
                                    }}>
                                        {checkedItems.size}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('assignedMaterial')}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: activeTab === 'assignedMaterial' ? '#fd7e14' : 'transparent',
                                    color: activeTab === 'assignedMaterial' ? 'white' : themeStyles.color,
                                    border: `1px solid ${themeStyles.border}`,
                                    borderBottom: activeTab === 'assignedMaterial' ? 'none' : `1px solid ${themeStyles.border}`,
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    borderRadius: '4px 4px 0 0'
                                }}
                            >
                                Assigned Packing List
                                {assignedPackingData.length > 0 && (
                                    <span style={{
                                        marginLeft: '8px',
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                        padding: '2px 6px',
                                        borderRadius: '10px',
                                        fontSize: '11px'
                                    }}>
                                        {assignedPackingData.length}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div style={{ padding: '1rem' }}>
                            {!selectedFile ? (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '50px',
                                    color: themeStyles.color
                                }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📁</div>
                                    <h3>Please select a file to view data</h3>
                                    <p>Choose a file from the dropdown above to display the material information.</p>
                                </div>
                            ) : (
                                <>
                                    {activeTab === 'fatList' && renderFATListTable()}
                                    {activeTab === 'assignedMaterial' && renderAssignedMaterialTable()}
                                </>
                            )}
                        </div>

                        {/* Action Button - Only show when file is selected and on fatList tab */}
                        {selectedFile && activeTab === 'fatList' && (
                            <div style={{ 
                                padding: '1rem', 
                                borderTop: `1px solid ${themeStyles.border}`,
                                textAlign: 'center'
                            }}>
                                <div style={{ marginBottom: '10px', fontSize: '14px', color: themeStyles.color }}>
                                    Selected: {checkedItems.size} items | 
                                    FAT Location: {selectedFATLocation || 'Not selected'}
                                </div>
                                <button 
                                    onClick={handleAssignAndSave}
                                    disabled={saving || checkedItems.size === 0 || !selectedFATLocation}
                                    style={{
                                        backgroundColor: saving ? '#6c757d' : '#fd7e14',
                                        color: 'white',
                                        border: 'none',
                                        padding: '12px 30px',
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        borderRadius: '5px',
                                        cursor: (saving || checkedItems.size === 0 || !selectedFATLocation) ? 'not-allowed' : 'pointer',
                                        opacity: (saving || checkedItems.size === 0 || !selectedFATLocation) ? 0.6 : 1
                                    }}
                                >
                                    {saving ? (
                                        <>
                                            <span style={{ 
                                                display: 'inline-block',
                                                width: '16px',
                                                height: '16px',
                                                border: '2px solid #ffffff',
                                                borderTop: '2px solid transparent',
                                                borderRadius: '50%',
                                                animation: 'spin 1s linear infinite',
                                                marginRight: '8px'
                                            }}></span>
                                            Saving...
                                        </>
                                    ) : (
                                        'Assign & Send To PPC'
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FATMaterialSelector;