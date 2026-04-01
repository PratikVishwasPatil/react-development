import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { Container, Button, Row, Col, Card, ButtonGroup, Badge } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const FileMaterialAdjustList = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { fileId: urlFileIdFromParams } = useParams();
    
    const [theme, setTheme] = useState('light');
    const [fileData, setFileData] = useState([]);
    const [selectedFile, setSelectedFile] = useState('');
    const [fileNames, setFileNames] = useState([]);
    const [firstTableData, setFirstTableData] = useState([]);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const [leftoverSearchTerms, setLeftoverSearchTerms] = useState({});
    const [showLeftoverDropdown, setShowLeftoverDropdown] = useState({});
    const [secondTableData, setSecondTableData] = useState([]);
    const leftoverDropdownRefs = useRef({});
    
    const [showFirstTable, setShowFirstTable] = useState(false);
    const [showSecondTable, setShowSecondTable] = useState(false);
    
    const [initialLoadDone, setInitialLoadDone] = useState(false);
    const [urlFileInfo, setUrlFileInfo] = useState(null);
    
    // State for extracted file ID from URL
    const [urlFileId, setUrlFileId] = useState(null);

    // Extract fileId from hash URL
    useEffect(() => {
        const extractFileIdFromHash = () => {
            // First try useParams
            if (urlFileIdFromParams) {
                console.log("✅ FileId from useParams:", urlFileIdFromParams);
                setUrlFileId(urlFileIdFromParams);
                return;
            }
            
            // If useParams doesn't work, extract manually from hash
            const hash = window.location.hash;
            console.log("🔍 Current hash:", hash);
            
            if (hash) {
                const path = hash.substring(1);
                console.log("🔍 Path from hash:", path);
                
                // Try different patterns
                const patterns = [
                    /\/file-material-adjust\/(\d+)/,
                    /\/details\/(\d+)/,
                    /\/(\d+)$/
                ];
                
                for (const pattern of patterns) {
                    const matches = path.match(pattern);
                    if (matches && matches[1]) {
                        console.log("✅ FileId extracted from hash:", matches[1]);
                        setUrlFileId(matches[1]);
                        return;
                    }
                }
                
                console.error("❌ Could not extract file ID from hash:", hash);
            }
        };
        
        extractFileIdFromHash();
    }, [urlFileIdFromParams, location]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
            Object.keys(leftoverDropdownRefs.current).forEach(key => {
                if (leftoverDropdownRefs.current[key] && !leftoverDropdownRefs.current[key].contains(event.target)) {
                    setShowLeftoverDropdown(prev => ({ ...prev, [key]: false }));
                }
            });
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const FILE_MASTER_API = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/file_master.php";
    const FILE_DATA_API = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/getFileDataForAdjustApi.php";
    const SECOND_TABLE_API = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/getFileMaterialDataForReplaceApi.php";

    // Fetch file master data
    const fetchFileData = async () => {
        setLoading(true);
        try {
            const response = await fetch(FILE_MASTER_API);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.status === "success" && data.files) {
                setFileData(data.files);
                
                const names = data.files.map(item => ({
                    value: String(item.FILE_ID),
                    label: item.FILE_NAME
                }));
                setFileNames(names);
                setInitialLoadDone(true);
                
                toast.success(`Loaded ${data.count} files`);
            } else {
                throw new Error(data.message || "No data received");
            }
        } catch (error) {
            console.error("Error fetching file data:", error);
            toast.error(`Error fetching file data: ${error.message}`);
            setFileData([]);
        } finally {
            setLoading(false);
        }
    };

    // Load first table data - Uses DROPDOWN selected file ID
    const loadFirstTableData = async (dropdownFileId) => {
        try {
            const url = `${FILE_DATA_API}?id=${dropdownFileId}`;
            console.log("🔵 First Table API (Dropdown ID):", url);
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            if (data.status === "success" && data.materials) {
                const transformedData = data.materials.map((item, index) => ({
                    id: index + 1,
                    materialId: item.materialId,
                    materialName: item.materialName,
                    unit: item.unit,
                    qty: item.stock || 0,
                    reqQty: "",
                    leftoverName: "",
                    leftoverQty: "",
                    comment: "",
                    isChecked: false,
                    leftoverOptions: item.leftoverOptions || []
                }));
                
                setFirstTableData(transformedData);
                
                const searchTerms = {};
                transformedData.forEach(item => {
                    searchTerms[item.id] = "";
                });
                setLeftoverSearchTerms(searchTerms);
                
                console.log("✅ First table loaded:", transformedData.length, "items");
                toast.success(`First Table: Loaded ${data.materials.length} materials`);
                return true;
            } else {
                console.log("⚠️ No materials in first table response");
                return false;
            }
        } catch (error) {
            console.error("❌ Error fetching first table data:", error);
            toast.error(`Error fetching first table data: ${error.message}`);
            setFirstTableData([]);
            return false;
        }
    };

    // Load second table data - Uses URL file ID
    const loadSecondTableData = async (urlId) => {
        try {
            const url = `${SECOND_TABLE_API}?file_id=${urlId}`;
            console.log("🟠 Second Table API (URL ID):", url);
            
            const response = await fetch(url);
            console.log("📡 Response status:", response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log("📦 Second Table API Response:", data);
            
            if (data.status === "success" && data.materials) {
                const transformedData = data.materials.map((item) => ({
                    id: item.checkbox_id,
                    rowId: item.row_id,
                    materialId: item.material_id,
                    materialName: item.material_name,
                    unit: item.unit,
                    qty: item.qty,
                    stock: item.stock,
                    date: item.date,
                    isChecked: false,
                    leftoverName: "",
                    leftoverOptions: []
                }));
                
                console.log("✅ Second table loaded:", transformedData.length, "items");
                setSecondTableData(transformedData);
                toast.success(`Second Table: Loaded ${data.materials.length} materials`);
                return true;
            } else {
                console.log("⚠️ No materials in second table response");
                return false;
            }
        } catch (error) {
            console.error("❌ Error fetching second table data:", error);
            toast.error(`Error fetching second table data: ${error.message}`);
            setSecondTableData([]);
            return false;
        }
    };

    // Initial load - fetch file master
    useEffect(() => {
        fetchFileData();
    }, []);

    // When URL fileId exists AND file master is loaded, load ONLY second table
    useEffect(() => {
        const loadSecondTableForUrlFileId = async () => {
            if (urlFileId && initialLoadDone && fileNames.length > 0) {
                console.log("🔍 URL FileId (extracted):", urlFileId);
                
                const foundFile = fileNames.find(f => String(f.value) === String(urlFileId));
                console.log("🎯 URL File found:", foundFile);
                
                if (foundFile) {
                    setUrlFileInfo(foundFile);
                    setLoading(true);
                    
                    console.log("📞 Calling SECOND table API with URL fileId:", urlFileId);
                    const success = await loadSecondTableData(urlFileId);
                    
                    if (success) {
                        setShowFirstTable(false);
                        setShowSecondTable(true);
                        console.log("✅ Second table should now be visible");
                    }
                    
                    setLoading(false);
                } else {
                    console.log("❌ URL File not found in list");
                    toast.error('File from URL not found');
                }
            }
        };
        
        loadSecondTableForUrlFileId();
    }, [urlFileId, initialLoadDone, fileNames]);

    const handleSecondTableCheckbox = (id) => {
        setSecondTableData(prev => 
            prev.map(item => 
                item.id === id ? { ...item, isChecked: !item.isChecked } : item
            )
        );
    };

    const filteredFiles = fileNames.filter(file => {
        const searchLower = searchTerm.toLowerCase();
        return file.label.toLowerCase().includes(searchLower);
    });

    // Handle file selection from dropdown - Load FIRST table with dropdown ID
    const handleFileSelect = async (file) => {
        setSelectedFile(file.value);
        setSearchTerm(file.label);
        setShowDropdown(false);
        
        setLoading(true);
        
        try {
            console.log("📌 Dropdown Selected File ID:", file.value);
            console.log("📌 URL File ID:", urlFileId);
            
            // Load FIRST table with DROPDOWN selected file ID
            const firstSuccess = await loadFirstTableData(file.value);
            
            // If second table not loaded yet, load it with URL file ID
            if (secondTableData.length === 0 && urlFileId) {
                await loadSecondTableData(urlFileId);
            }
            
            // Show FIRST table (second table remains as is)
            if (firstSuccess) {
                setShowFirstTable(true);
            }
            // Keep second table visible if it has data
            if (secondTableData.length > 0 || urlFileId) {
                setShowSecondTable(true);
            }
            
        } catch (error) {
            console.error("Error loading tables:", error);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredLeftoverOptions = (itemId, options) => {
        const term = leftoverSearchTerms[itemId] || "";
        if (!term) return options;
        
        const searchLower = term.toLowerCase();
        return options.filter(option => 
            option.name.toLowerCase().includes(searchLower)
        );
    };

    const handleLeftoverSelect = (itemId, leftover) => {
        setFirstTableData(prev =>
            prev.map(item =>
                item.id === itemId 
                    ? { ...item, leftoverName: leftover.name }
                    : item
            )
        );
        setLeftoverSearchTerms(prev => ({
            ...prev,
            [itemId]: leftover.name
        }));
        setShowLeftoverDropdown(prev => ({ ...prev, [itemId]: false }));
    };

    const handleLeftoverSearchChange = (itemId, value) => {
        setLeftoverSearchTerms(prev => ({
            ...prev,
            [itemId]: value
        }));
        setFirstTableData(prev =>
            prev.map(item =>
                item.id === itemId 
                    ? { ...item, leftoverName: value }
                    : item
            )
        );
        setShowLeftoverDropdown(prev => ({ ...prev, [itemId]: true }));
    };

    const handleFirstTableCheckbox = (id) => {
        setFirstTableData(prev => 
            prev.map(item => 
                item.id === id ? { ...item, isChecked: !item.isChecked } : item
            )
        );
    };

    const handleFirstTableInput = (id, field, value) => {
        setFirstTableData(prev =>
            prev.map(item =>
                item.id === id ? { ...item, [field]: value } : item
            )
        );
    };

   // Replace your existing handleSubmit function with this:

// Add this at the top of your component (after imports)
// to get user credentials from wherever they're stored in your app

// Add this at the top of your component (after imports)
// to get user credentials from wherever they're stored in your app

const handleSubmit = async () => {
    const checkedFirstTable = firstTableData.filter(item => item.isChecked);
    const checkedSecondTable = secondTableData.filter(item => item.isChecked);
    
    if (checkedFirstTable.length === 0 && checkedSecondTable.length === 0) {
        toast.warning('Please select at least one material from the table');
        return;
    }

    // Validation: Check if required fields are filled for checked items
    for (const item of checkedFirstTable) {
        if (!item.reqQty || item.reqQty.trim() === '') {
            toast.error(`Please enter required quantity for ${item.materialName}`);
            return;
        }
    }

    setLoading(true);

    try {
        // ⚠️ IMPORTANT: Get these values from wherever you store user session
        // Option 1: From sessionStorage
        let shortName = sessionStorage.getItem('shortName');
        let employeeId = sessionStorage.getItem('employee_id');
        
        // Option 2: From localStorage
        if (!shortName) shortName = localStorage.getItem('shortName');
        if (!employeeId) employeeId = localStorage.getItem('employee_id');
        
        // Option 3: From Redux/Context (if you're using state management)
        // const { shortName, employeeId } = useSelector(state => state.user);
        
        // Option 4: Hardcode for testing (REMOVE IN PRODUCTION!)
        if (!shortName) shortName = 'TEST_USER'; // Replace with actual username
        if (!employeeId) employeeId = '1'; // Replace with actual employee ID

        console.log('🔐 User Credentials:', { shortName, employeeId });

        if (!shortName || !employeeId || shortName === 'null' || employeeId === 'null') {
            toast.error('Session expired. Please login again.');
            setLoading(false);
            return;
        }

        const API_URL = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/AdjustFileMaterialAfterPurchaseApi.php";

        // Process each checked item from first table
        const promises = [];

        for (const item of checkedFirstTable) {
            // Find corresponding second table item if checked
            const secondTableItem = checkedSecondTable.length > 0 ? checkedSecondTable[0] : null;

            // Get leftover material ID from leftoverOptions
            let leftoverMaterialId = '';
            if (item.leftoverName && item.leftoverOptions) {
                const leftoverOption = item.leftoverOptions.find(
                    option => option.name === item.leftoverName
                );
                leftoverMaterialId = leftoverOption ? leftoverOption.id : '';
            }

            // Format data according to PHP API structure
            // storeddata format: "data1#materialID~reqQty~leftoverID~leftoverQty~comment"
            const storeddata = `data1#${item.materialId}~${item.reqQty}~${leftoverMaterialId}~${item.leftoverQty || ''}~${item.comment || ''}`;
            
            // storedata1 format: "data2#mainMaterialID~field2~projectMaterialID"
            const storedata1 = secondTableItem 
                ? `data2#${secondTableItem.materialId}~field2~${secondTableItem.rowId}`
                : `data2#~~`;

            const formData = new FormData();
            formData.append('shortName', shortName);
            formData.append('employee_id', employeeId);
            formData.append('storeddata', storeddata);
            formData.append('storedata1', storedata1);
            formData.append('fileID', selectedFile); // First table file ID
            formData.append('fileData', urlFileId); // Second table file ID (from URL)

            console.log('📤 Sending data:', {
                shortName,
                employee_id: employeeId,
                storeddata,
                storedata1,
                fileID: selectedFile,
                fileData: urlFileId
            });

            // Send API request
            const promise = fetch(API_URL, {
                method: 'POST',
                body: formData
            })
            .then(response => {
                console.log('📡 Response status:', response.status);
                return response.json();
            })
            .then(data => {
                console.log('✅ API Response:', data);
                if (!data.success) {
                    console.error('❌ API Error:', data.message);
                    if (data.debug) {
                        console.error('🔍 Debug info:', data.debug);
                    }
                    if (data.errors) {
                        console.error('🚨 SQL Errors:', data.errors);
                    }
                    if (data.queries_attempted) {
                        console.error('📋 Queries attempted:', data.queries_attempted);
                    }
                }
                return data;
            })
            .catch(error => {
                console.error('❌ Fetch Error:', error);
                return { success: false, message: error.message };
            });

            promises.push(promise);
        }

        // Wait for all requests to complete
        const results = await Promise.all(promises);

        // Check if all were successful
        const allSuccessful = results.every(result => result.success);
        const successCount = results.filter(result => result.success).length;

        if (allSuccessful) {
            toast.success(`✅ Successfully submitted ${successCount} materials`);
            
            // Reset checkboxes and inputs after successful submission
            setFirstTableData(prev =>
                prev.map(item => ({
                    ...item,
                    isChecked: false,
                    reqQty: '',
                    leftoverName: '',
                    leftoverQty: '',
                    comment: ''
                }))
            );
            
            setSecondTableData(prev =>
                prev.map(item => ({
                    ...item,
                    isChecked: false
                }))
            );

            // Optionally reload data
            if (selectedFile) {
                await loadFirstTableData(selectedFile);
            }
            if (urlFileId) {
                await loadSecondTableData(urlFileId);
            }
        } else {
            const failedCount = results.length - successCount;
            toast.error(`⚠️ ${successCount} succeeded, ${failedCount} failed. Check console for details.`);
            
            // Log failed items
            results.forEach((result, index) => {
                if (!result.success) {
                    console.error(`Failed item ${index + 1}:`, result.message);
                }
            });
        }

    } catch (error) {
        console.error('❌ Error submitting data:', error);
        toast.error(`Error submitting data: ${error.message}`);
    } finally {
        setLoading(false);
    }
};

// Helper function to get leftover material ID from leftoverOptions
const getLeftoverMaterialId = (item) => {
    if (!item.leftoverName || !item.leftoverOptions) return '';
    
    const leftoverOption = item.leftoverOptions.find(
        option => option.name === item.leftoverName
    );
    
    return leftoverOption ? leftoverOption.id : '';
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
                cardBorder: '#334155',
                inputBg: '#1e293b',
                inputBorder: '#475569',
                inputColor: '#f1f5f9',
                headerBg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                headerColor: '#ffffff',
                tableHeaderBg: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                tableRowBg: '#1e293b',
                tableRowHoverBg: '#334155',
                tableBorder: '#475569',
                buttonPrimary: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                buttonSuccess: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                accentColor: '#60a5fa',
                shadowColor: 'rgba(0, 0, 0, 0.5)'
            };
        }
        return {
            backgroundColor: '#f8fafc',
            color: '#0f172a',
            cardBg: '#ffffff',
            cardBorder: '#e2e8f0',
            inputBg: '#ffffff',
            inputBorder: '#cbd5e1',
            inputColor: '#0f172a',
            headerBg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            headerColor: '#ffffff',
            tableHeaderBg: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            tableRowBg: '#ffffff',
            tableRowHoverBg: '#f1f5f9',
            tableBorder: '#e2e8f0',
            buttonPrimary: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            buttonSuccess: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            accentColor: '#3b82f6',
            shadowColor: 'rgba(0, 0, 0, 0.1)'
        };
    };

    const themeStyles = getThemeStyles();

    useEffect(() => {
        document.body.style.background = themeStyles.backgroundColor;
        document.body.style.color = themeStyles.color;
        document.body.style.minHeight = '100vh';
        document.body.style.margin = '0';
        document.body.style.fontFamily = "'Inter', 'Segoe UI', sans-serif";

        return () => {
            document.body.style.background = '';
            document.body.style.color = '';
            document.body.style.minHeight = '';
            document.body.style.margin = '';
            document.body.style.fontFamily = '';
        };
    }, [theme]);

    // Loading screen
    if (loading && fileData.length === 0) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: themeStyles.backgroundColor
            }}>
                <div style={{ textAlign: 'center', color: themeStyles.color }}>
                    <div className="spinner-border" role="status" style={{ 
                        width: '3rem', 
                        height: '3rem',
                        borderColor: themeStyles.accentColor,
                        borderRightColor: 'transparent'
                    }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3" style={{ fontSize: '16px', fontWeight: '500' }}>Loading data...</p>
                </div>
            </div>
        );
    }

    const selectedFileData = fileNames.find(f => f.value === selectedFile);

    return (
        <div style={{
            minHeight: '100vh',
            background: themeStyles.backgroundColor,
            color: themeStyles.color,
            padding: isFullScreen ? '0' : '20px'
        }}>
            <Container fluid={isFullScreen} style={{ maxWidth: isFullScreen ? '100%' : '1400px' }}>
                {/* Header Card */}
                <Card style={{
                    backgroundColor: themeStyles.cardBg,
                    border: `1px solid ${themeStyles.cardBorder}`,
                    borderRadius: '16px',
                    boxShadow: `0 4px 6px -1px ${themeStyles.shadowColor}`,
                    marginBottom: '24px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        background: themeStyles.headerBg,
                        padding: '20px 24px',
                        borderBottom: `1px solid ${themeStyles.cardBorder}`
                    }}>
                        <Row className="align-items-center">
                            <Col xs={12} md={6}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <i className="bi bi-file-earmark-text" style={{ fontSize: '24px', color: '#fff' }}></i>
                                    </div>
                                    <div>
                                        <h3 style={{ 
                                            margin: 0, 
                                            color: '#ffffff',
                                            fontSize: '24px',
                                            fontWeight: '700',
                                            letterSpacing: '-0.5px'
                                        }}>
                                            File Material Adjustment
                                        </h3>
                                        <p style={{ 
                                            margin: 0, 
                                            color: 'rgba(255, 255, 255, 0.9)',
                                            fontSize: '14px',
                                            fontWeight: '500'
                                        }}>
                                            Manage material requirements and leftovers
                                        </p>
                                    </div>
                                </div>
                            </Col>
                            <Col xs={12} md={6} className="text-end mt-3 mt-md-0">
                                <ButtonGroup>
                                    <Button
                                        onClick={toggleFullScreen}
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.2)',
                                            border: 'none',
                                            color: '#fff',
                                            padding: '8px 16px',
                                            borderRadius: '8px 0 0 8px',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
                                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                                    >
                                        <i className={`bi ${isFullScreen ? 'bi-fullscreen-exit' : 'bi-fullscreen'}`}></i>
                                        {!isMobile && <span className="ms-2">{isFullScreen ? 'Exit' : 'Full'}</span>}
                                    </Button>
                                    <Button
                                        onClick={toggleTheme}
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.2)',
                                            border: 'none',
                                            color: '#fff',
                                            padding: '8px 16px',
                                            borderRadius: '0 8px 8px 0',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
                                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                                    >
                                        {theme === 'light' ? '🌙' : '☀️'}
                                        {!isMobile && <span className="ms-2">{theme === 'light' ? 'Dark' : 'Light'}</span>}
                                    </Button>
                                </ButtonGroup>
                            </Col>
                        </Row>
                    </div>

                    {/* File Selection */}
                    <div style={{ padding: '24px' }}>
                        <Row>
                            <Col xs={12}>
                                <label style={{ 
                                    display: 'block', 
                                    marginBottom: '12px',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    color: themeStyles.color,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    <i className="bi bi-folder2-open me-2" style={{ color: themeStyles.accentColor }}></i>
                                    Select File Name (For First Table)
                                </label>
                                <div ref={dropdownRef} style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setShowDropdown(true);
                                        }}
                                        onFocus={() => setShowDropdown(true)}
                                        placeholder="Search files..."
                                        style={{
                                            width: '100%',
                                            backgroundColor: themeStyles.inputBg,
                                            borderColor: themeStyles.inputBorder,
                                            color: themeStyles.inputColor,
                                            fontSize: '15px',
                                            padding: '12px 16px',
                                            borderRadius: '10px',
                                            fontWeight: '500',
                                            border: `2px solid ${themeStyles.inputBorder}`,
                                            transition: 'all 0.3s ease',
                                            outline: 'none'
                                        }}
                                    />
                                    {showDropdown && filteredFiles.length > 0 && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '100%',
                                            left: 0,
                                            right: 0,
                                            maxHeight: '300px',
                                            overflowY: 'auto',
                                            backgroundColor: themeStyles.cardBg,
                                            border: `2px solid ${themeStyles.inputBorder}`,
                                            borderRadius: '10px',
                                            marginTop: '4px',
                                            zIndex: 1000,
                                            boxShadow: `0 4px 12px ${themeStyles.shadowColor}`
                                        }}>
                                            {filteredFiles.map(file => (
                                                <div
                                                    key={file.value}
                                                    onClick={() => handleFileSelect(file)}
                                                    style={{
                                                        padding: '12px 16px',
                                                        cursor: 'pointer',
                                                        borderBottom: `1px solid ${themeStyles.inputBorder}`,
                                                        color: themeStyles.color,
                                                        transition: 'all 0.2s ease',
                                                        fontWeight: '600'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = themeStyles.tableRowHoverBg;
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                    }}
                                                >
                                                    {file.label}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Col>
                        </Row>

                        {/* Show both file info */}
                        <Row className="mt-3">
                            {/* First Table File Info */}
                            {selectedFile && selectedFileData && (
                                <Col xs={12} md={6}>
                                    <div style={{
                                        padding: '16px',
                                        background: theme === 'dark' 
                                            ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(79, 70, 229, 0.05) 100%)'
                                            : 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(79, 70, 229, 0.02) 100%)',
                                        borderRadius: '10px',
                                        border: `1px solid #6366f140`
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                            <span style={{
                                                background: '#6366f1',
                                                color: '#fff',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                fontSize: '10px',
                                                fontWeight: '700'
                                            }}>FIRST TABLE</span>
                                            <span style={{ 
                                                fontSize: '12px', 
                                                color: themeStyles.color,
                                                opacity: 0.7,
                                                fontWeight: '600',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                Dropdown Selection
                                            </span>
                                        </div>
                                        <div style={{ 
                                            fontSize: '16px', 
                                            fontWeight: '700',
                                            color: '#6366f1',
                                            marginTop: '4px'
                                        }}>
                                            {selectedFileData.label}
                                            <span style={{ fontSize: '12px', opacity: 0.7, marginLeft: '8px' }}>
                                                (ID: {selectedFile})
                                            </span>
                                        </div>
                                    </div>
                                </Col>
                            )}
                            
                            {/* Second Table File Info */}
                            {urlFileId && urlFileInfo && (
                                <Col xs={12} md={6} className={selectedFile ? '' : ''}>
                                    <div style={{
                                        padding: '16px',
                                        background: theme === 'dark' 
                                            ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(234, 88, 12, 0.05) 100%)'
                                            : 'linear-gradient(135deg, rgba(249, 115, 22, 0.05) 0%, rgba(234, 88, 12, 0.02) 100%)',
                                        borderRadius: '10px',
                                        border: `1px solid #f9731640`,
                                        marginTop: selectedFile && isMobile ? '12px' : '0'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                            <span style={{
                                                background: '#f97316',
                                                color: '#fff',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                fontSize: '10px',
                                                fontWeight: '700'
                                            }}>SECOND TABLE</span>
                                            <span style={{ 
                                                fontSize: '12px', 
                                                color: themeStyles.color,
                                                opacity: 0.7,
                                                fontWeight: '600',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                From URL
                                            </span>
                                        </div>
                                        <div style={{ 
                                            fontSize: '16px', 
                                            fontWeight: '700',
                                            color: '#f97316',
                                            marginTop: '4px'
                                        }}>
                                            {urlFileInfo.label}
                                            <span style={{ fontSize: '12px', opacity: 0.7, marginLeft: '8px' }}>
                                                (ID: {urlFileId})
                                            </span>
                                        </div>
                                    </div>
                                </Col>
                            )}
                        </Row>
                    </div>
                </Card>

                {/* Debug Info */}
                {/* <div style={{ 
                    padding: '10px', 
                    marginBottom: '20px', 
                    background: '#d1fae5', 
                    borderRadius: '8px',
                    color: '#065f46',
                    fontSize: '12px'
                }}>
                    <strong>🔍 Debug Info:</strong><br/>
                    • Current Hash: <strong>{window.location.hash}</strong><br/>
                    • useParams fileId: <strong style={{color: '#dc2626'}}>{urlFileIdFromParams || 'null'}</strong><br/>
                    • Extracted fileId: <strong style={{color: '#16a34a'}}>{urlFileId || 'null'}</strong><br/>
                    • First Table API uses: <strong style={{color: '#6366f1'}}>{selectedFile || 'Not selected yet'}</strong> (from dropdown)<br/>
                    • Second Table API uses: <strong style={{color: '#f97316'}}>{urlFileId || 'No URL param'}</strong> (from URL)
                </div> */}

                {/* First Table - Material Requirements (Uses Dropdown File ID) */}
                {showFirstTable && firstTableData.length > 0 && (
                    <Card style={{
                        backgroundColor: themeStyles.cardBg,
                        border: `1px solid ${themeStyles.cardBorder}`,
                        borderRadius: '16px',
                        boxShadow: `0 4px 6px -1px ${themeStyles.shadowColor}`,
                        marginBottom: '24px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            background: themeStyles.tableHeaderBg,
                            padding: '16px 24px',
                            borderBottom: `1px solid ${themeStyles.cardBorder}`
                        }}>
                            <h5 style={{ 
                                margin: 0, 
                                color: '#ffffff',
                                fontSize: '18px',
                                fontWeight: '700',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                flexWrap: 'wrap'
                            }}>
                                <i className="bi bi-box-seam"></i>
                                Material Requirements & Leftovers
                                <Badge bg="warning" text="dark" style={{
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    padding: '4px 8px',
                                    borderRadius: '4px'
                                }}>
                                    File ID: {selectedFile}
                                </Badge>
                                <Badge bg="light" text="dark" style={{
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    padding: '4px 12px',
                                    borderRadius: '20px'
                                }}>
                                    {firstTableData.filter(m => m.isChecked).length} / {firstTableData.length} selected
                                </Badge>
                            </h5>
                        </div>
                        <div style={{ padding: '24px', overflowX: 'auto' }}>
                            <table style={{
                                width: '100%',
                                borderCollapse: 'separate',
                                borderSpacing: '0',
                                fontSize: '14px'
                            }}>
                                <thead>
                                    <tr>
                                        <th style={{
                                            background: themeStyles.tableHeaderBg,
                                            color: '#ffffff',
                                            padding: '14px 16px',
                                            fontWeight: '700',
                                            textAlign: 'center',
                                            width: '60px',
                                            borderTop: `2px solid ${themeStyles.tableBorder}`,
                                            borderBottom: `2px solid ${themeStyles.tableBorder}`,
                                            borderLeft: `2px solid ${themeStyles.tableBorder}`,
                                            borderRight: `2px solid ${themeStyles.tableBorder}`
                                        }}>
                                            <i className="bi bi-check-square" style={{ fontSize: '16px' }}></i>
                                        </th>
                                        {['Material Name', 'Unit', 'Stock', 'Req.qty', 'Leftover Name', 'Qty', 'Comment'].map((header, index) => (
                                            <th key={index} style={{
                                                background: themeStyles.tableHeaderBg,
                                                color: '#ffffff',
                                                padding: '14px 16px',
                                                fontWeight: '700',
                                                textAlign: 'center',
                                                fontSize: '13px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                borderTop: `2px solid ${themeStyles.tableBorder}`,
                                                borderBottom: `2px solid ${themeStyles.tableBorder}`,
                                                borderRight: `2px solid ${themeStyles.tableBorder}`,
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {firstTableData.map((item, rowIndex) => (
                                        <tr key={item.id} style={{
                                            transition: 'all 0.2s ease',
                                            backgroundColor: item.isChecked
                                                ? (theme === 'dark' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)')
                                                : themeStyles.tableRowBg
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!item.isChecked) {
                                                e.currentTarget.style.backgroundColor = themeStyles.tableRowHoverBg;
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!item.isChecked) {
                                                e.currentTarget.style.backgroundColor = themeStyles.tableRowBg;
                                            } else {
                                                e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)';
                                            }
                                        }}
                                        >
                                            <td style={{
                                                padding: '14px 16px',
                                                textAlign: 'right',
                                                borderLeft: `2px solid ${themeStyles.tableBorder}`,
                                                borderRight: `2px solid ${themeStyles.tableBorder}`,
                                                borderBottom: rowIndex === firstTableData.length - 1 ? `2px solid ${themeStyles.tableBorder}` : `1px solid ${themeStyles.tableBorder}`
                                            }}>
                                                <input
                                                    type="checkbox"
                                                    checked={item.isChecked}
                                                    onChange={() => handleFirstTableCheckbox(item.id)}
                                                    style={{
                                                        width: '20px',
                                                        height: '20px',
                                                        cursor: 'pointer',
                                                        accentColor: themeStyles.accentColor
                                                    }}
                                                />
                                            </td>
                                            <td style={{
                                                padding: '14px 16px',
                                                color: themeStyles.color,
                                                textAlign: 'right',

                                                borderRight: `2px solid ${themeStyles.tableBorder}`,
                                                borderBottom: rowIndex === firstTableData.length - 1 ? `2px solid ${themeStyles.tableBorder}` : `1px solid ${themeStyles.tableBorder}`,
                                                fontWeight: '600'
                                            }}>{item.materialName}</td>
                                            <td style={{
                                                padding: '14px 16px',
                                                color: themeStyles.color,
                                                textAlign: 'right',
                                                borderRight: `2px solid ${themeStyles.tableBorder}`,
                                                borderBottom: rowIndex === firstTableData.length - 1 ? `2px solid ${themeStyles.tableBorder}` : `1px solid ${themeStyles.tableBorder}`
                                            }}>{item.unit}</td>
                                            <td style={{
                                                padding: '14px 16px',
                                                color: themeStyles.accentColor,
                                                textAlign: 'right',
                                                fontWeight: '700',
                                                borderRight: `2px solid ${themeStyles.tableBorder}`,
                                                borderBottom: rowIndex === firstTableData.length - 1 ? `2px solid ${themeStyles.tableBorder}` : `1px solid ${themeStyles.tableBorder}`
                                            }}>{item.qty}</td>
                                            <td style={{
                                                padding: '8px',
                                                textAlign: 'right',
                                                borderRight: `2px solid ${themeStyles.tableBorder}`,
                                                borderBottom: rowIndex === firstTableData.length - 1 ? `2px solid ${themeStyles.tableBorder}` : `1px solid ${themeStyles.tableBorder}`
                                            }}>
                                                <input
                                                    type="text"
                                                    value={item.reqQty}
                                                    onChange={(e) => handleFirstTableInput(item.id, 'reqQty', e.target.value)}
                                                    style={{
                                                        width: '80px',
                                                        padding: '6px',
                                                        backgroundColor: themeStyles.inputBg,
                                                        border: `1px solid ${themeStyles.inputBorder}`,
                                                        borderRadius: '4px',
                                                        color: '#10b981',
                                                        fontWeight: '700',
                                                        textAlign: 'right'
                                                    }}
                                                />
                                            </td>
                                            <td style={{
                                                padding: '8px',
                                                borderRight: `2px solid ${themeStyles.tableBorder}`,
                                                borderBottom: rowIndex === firstTableData.length - 1 ? `2px solid ${themeStyles.tableBorder}` : `1px solid ${themeStyles.tableBorder}`,
                                                position: 'relative'
                                            }}>
                                                <div
                                                    ref={el => leftoverDropdownRefs.current[item.id] = el}
                                                    style={{ position: 'relative' }}
                                                >
                                                    <input
                                                        type="text"
                                                        value={leftoverSearchTerms[item.id] || item.leftoverName}
                                                        onChange={(e) => handleLeftoverSearchChange(item.id, e.target.value)}
                                                        onFocus={() => setShowLeftoverDropdown(prev => ({ ...prev, [item.id]: true }))}
                                                        placeholder="Search leftover..."
                                                        style={{
                                                            width: '100%',
                                                            minWidth: '200px',
                                                            padding: '6px',
                                                            backgroundColor: themeStyles.inputBg,
                                                            border: `1px solid ${themeStyles.inputBorder}`,
                                                            borderRadius: '4px',
                                                            color: '#f97316',
                                                            fontWeight: '500'
                                                        }}
                                                    />
                                                    {showLeftoverDropdown[item.id] && item.leftoverOptions && getFilteredLeftoverOptions(item.id, item.leftoverOptions).length > 0 && (
                                                        <div style={{
                                                            position: 'absolute',
                                                            top: '100%',
                                                            left: 0,
                                                            right: 0,
                                                            maxHeight: '200px',
                                                            overflowY: 'auto',
                                                            backgroundColor: themeStyles.cardBg,
                                                            border: `2px solid ${themeStyles.inputBorder}`,
                                                            borderRadius: '6px',
                                                            marginTop: '4px',
                                                            zIndex: 1000,
                                                            boxShadow: `0 4px 12px ${themeStyles.shadowColor}`
                                                        }}>
                                                            {getFilteredLeftoverOptions(item.id, item.leftoverOptions).map(leftover => (
                                                                <div
                                                                    key={leftover.id}
                                                                    onClick={() => handleLeftoverSelect(item.id, leftover)}
                                                                    style={{
                                                                        padding: '8px 12px',
                                                                        cursor: 'pointer',
                                                                        borderBottom: `1px solid ${themeStyles.inputBorder}`,
                                                                        color: themeStyles.color,
                                                                        fontSize: '13px',
                                                                        transition: 'all 0.2s ease'
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.currentTarget.style.backgroundColor = themeStyles.tableRowHoverBg;
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                                    }}
                                                                >
                                                                    {leftover.name}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{
                                                padding: '8px',
                                                textAlign: 'right',
                                                borderRight: `2px solid ${themeStyles.tableBorder}`,
                                                borderBottom: rowIndex === firstTableData.length - 1 ? `2px solid ${themeStyles.tableBorder}` : `1px solid ${themeStyles.tableBorder}`
                                            }}>
                                                <input
                                                    type="text"
                                                    value={item.leftoverQty}
                                                    onChange={(e) => handleFirstTableInput(item.id, 'leftoverQty', e.target.value)}
                                                    style={{
                                                        width: '80px',
                                                        padding: '6px',
                                                        backgroundColor: themeStyles.inputBg,
                                                        border: `1px solid ${themeStyles.inputBorder}`,
                                                        borderRadius: '4px',
                                                        color: themeStyles.color,
                                                        textAlign: 'right'
                                                    }}
                                                />
                                            </td>
                                            <td style={{
                                                padding: '8px',
                                                borderRight: `2px solid ${themeStyles.tableBorder}`,
                                                borderBottom: rowIndex === firstTableData.length - 1 ? `2px solid ${themeStyles.tableBorder}` : `1px solid ${themeStyles.tableBorder}`
                                            }}>
                                                <input
                                                    type="text"
                                                    value={item.comment}
                                                    onChange={(e) => handleFirstTableInput(item.id, 'comment', e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        minWidth: '150px',
                                                        padding: '6px',
                                                        backgroundColor: themeStyles.inputBg,
                                                        border: `1px solid ${themeStyles.inputBorder}`,
                                                        borderRadius: '4px',
                                                        color: themeStyles.color,
                                                        fontStyle: 'italic'
                                                    }}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {/* Second Table - Material Description (Uses URL File ID) */}
                {showSecondTable && secondTableData.length > 0 && (
                    <Card style={{
                        backgroundColor: themeStyles.cardBg,
                        border: `1px solid ${themeStyles.cardBorder}`,
                        borderRadius: '16px',
                        boxShadow: `0 4px 6px -1px ${themeStyles.shadowColor}`,
                        marginBottom: '24px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                            padding: '16px 24px',
                            borderBottom: `1px solid ${themeStyles.cardBorder}`
                        }}>
                            <h5 style={{ 
                                margin: 0, 
                                color: '#ffffff',
                                fontSize: '18px',
                                fontWeight: '700',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                flexWrap: 'wrap'
                            }}>
                                <i className="bi bi-list-check"></i>
                                Material Description
                                <Badge bg="warning" text="dark" style={{
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    padding: '4px 8px',
                                    borderRadius: '4px'
                                }}>
                                    File ID: {urlFileId}
                                </Badge>
                                <Badge bg="light" text="dark" style={{
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    padding: '4px 12px',
                                    borderRadius: '20px'
                                }}>
                                    {secondTableData.filter(m => m.isChecked).length} / {secondTableData.length} selected
                                </Badge>
                            </h5>
                        </div>
                        <div style={{ padding: '24px', overflowX: 'auto' }}>
                            <table style={{
                                width: '100%',
                                borderCollapse: 'separate',
                                borderSpacing: '0',
                                fontSize: '14px'
                            }}>
                                <thead>
                                    <tr>
                                        <th style={{
                                            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                                            color: '#ffffff',
                                            padding: '14px 16px',
                                            fontWeight: '700',
                                            textAlign: 'right',
                                            width: '60px',
                                            borderTop: `2px solid ${themeStyles.tableBorder}`,
                                            borderBottom: `2px solid ${themeStyles.tableBorder}`,
                                            borderLeft: `2px solid ${themeStyles.tableBorder}`,
                                            borderRight: `2px solid ${themeStyles.tableBorder}`
                                        }}>
                                            <i className="bi bi-check-square" style={{ fontSize: '16px' }}></i>
                                        </th>
                                        {['Material Description', 'Unit', 'Qty'].map((header, index) => (
                                            <th key={index} style={{
                                                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                                                color: '#ffffff',
                                                padding: '14px 16px',
                                                fontWeight: '700',
                                                textAlign: 'right',
                                                fontSize: '13px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                borderTop: `2px solid ${themeStyles.tableBorder}`,
                                                borderBottom: `2px solid ${themeStyles.tableBorder}`,
                                                borderRight: `2px solid ${themeStyles.tableBorder}`,
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {secondTableData.map((item, rowIndex) => (
                                        <tr key={item.id} style={{
                                            transition: 'all 0.2s ease',
                                            backgroundColor: item.isChecked
                                                ? (theme === 'dark' ? 'rgba(249, 115, 22, 0.15)' : 'rgba(249, 115, 22, 0.08)')
                                                : themeStyles.tableRowBg
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!item.isChecked) {
                                                e.currentTarget.style.backgroundColor = themeStyles.tableRowHoverBg;
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!item.isChecked) {
                                                e.currentTarget.style.backgroundColor = themeStyles.tableRowBg;
                                            } else {
                                                e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(249, 115, 22, 0.15)' : 'rgba(249, 115, 22, 0.08)';
                                            }
                                        }}
                                        >
                                            <td style={{
                                                padding: '14px 16px',
                                                textAlign: 'right',
                                                borderLeft: `2px solid ${themeStyles.tableBorder}`,
                                                borderRight: `2px solid ${themeStyles.tableBorder}`,
                                                borderBottom: rowIndex === secondTableData.length - 1 ? `2px solid ${themeStyles.tableBorder}` : `1px solid ${themeStyles.tableBorder}`
                                            }}>
                                                <input
                                                    type="checkbox"
                                                    checked={item.isChecked}
                                                    onChange={() => handleSecondTableCheckbox(item.id)}
                                                    style={{
                                                        width: '20px',
                                                        height: '20px',
                                                        cursor: 'pointer',
                                                        accentColor: '#f97316'
                                                    }}
                                                />
                                            </td>
                                            <td style={{
                                                padding: '14px 16px',
                                                color: themeStyles.color,
                                                textAlign: 'right',
                                                borderRight: `2px solid ${themeStyles.tableBorder}`,
                                                borderBottom: rowIndex === secondTableData.length - 1 ? `2px solid ${themeStyles.tableBorder}` : `1px solid ${themeStyles.tableBorder}`,
                                                fontWeight: '600'
                                            }}>{item.materialName}</td>
                                            <td style={{
                                                padding: '14px 16px',
                                                color: themeStyles.color,
                                                textAlign: 'right',
                                                borderRight: `2px solid ${themeStyles.tableBorder}`,
                                                borderBottom: rowIndex === secondTableData.length - 1 ? `2px solid ${themeStyles.tableBorder}` : `1px solid ${themeStyles.tableBorder}`
                                            }}>{item.unit}</td>
                                            <td style={{
                                                padding: '14px 16px',
                                                color: '#f97316',
                                                textAlign: 'right',
                                                fontWeight: '700',
                                                fontSize: '15px',
                                                borderRight: `2px solid ${themeStyles.tableBorder}`,
                                                borderBottom: rowIndex === secondTableData.length - 1 ? `2px solid ${themeStyles.tableBorder}` : `1px solid ${themeStyles.tableBorder}`
                                            }}>{item.qty}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {/* Submit Button */}
                {(showFirstTable || showSecondTable) && (
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <Button 
                            onClick={handleSubmit}
                            style={{
                                background: themeStyles.buttonSuccess,
                                border: 'none',
                                padding: '14px 48px',
                                fontSize: '16px',
                                fontWeight: '700',
                                borderRadius: '12px',
                                color: '#fff',
                                boxShadow: `0 4px 12px ${themeStyles.shadowColor}`,
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                                letterSpacing: '0.5px',
                                textTransform: 'uppercase'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = `0 6px 20px ${themeStyles.shadowColor}`;
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = `0 4px 12px ${themeStyles.shadowColor}`;
                            }}
                        >
                            <i className="bi bi-check-circle me-2"></i>
                            Submit ({firstTableData.filter(m => m.isChecked).length + secondTableData.filter(m => m.isChecked).length} items)
                        </Button>
                    </div>
                )}
            </Container>
            
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme={theme}
                style={{ fontSize: '14px' }}
            />
        </div>
    );
};

export default FileMaterialAdjustList;