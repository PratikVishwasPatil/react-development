import React, { useEffect, useMemo, useState, useRef } from "react";
import Select from 'react-select';

import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { ModuleRegistry } from "ag-grid-community";
import {
    ClientSideRowModelModule,
    ValidationModule,
    DateFilterModule,
    NumberFilterModule,
    TextFilterModule,
    RowSelectionModule,
    PaginationModule,
    CsvExportModule
} from "ag-grid-community";

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ValidationModule,
    DateFilterModule,
    NumberFilterModule,
    TextFilterModule,
    RowSelectionModule,
    PaginationModule,
    CsvExportModule
]);

const PackingListManager = () => {
    const getFileIdFromUrl = () => {
        const path = window.location.pathname;
        const match = path.match(/\/packing-list\/details\/(\d+)/);
        return match ? match[1] : '5451';
    };

    const [fileId] = useState(getFileIdFromUrl());
    const [theme, setTheme] = useState('light');
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [loading, setLoading] = useState(false);
    const [fileName, setFileName] = useState('');
    const [revision, setRevision] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);

    // Dropdown states
    const [materialList, setMaterialList] = useState([]);
    const [unitList, setUnitList] = useState([]);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [selectedUnit, setSelectedUnit] = useState(null);

    // New input fields
    const [customField1, setCustomField1] = useState('');
    const [customField2, setCustomField2] = useState('');

    // Grid data
    const [rowData, setRowData] = useState([]);

    const gridRef = useRef();
    const API_BASE_URL = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api";

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch packing list data
    const fetchPackingListData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/SwapPackingDetailsApi.php?fileId=${fileId}`);
            const result = await response.json();

            if (result.status === "success" && Array.isArray(result.data)) {
                // Map API data to grid format
                const mappedData = result.data.map((item) => ({
                    id: item.srNo,
                    dbId: item.id,
                    materialDescription: item.materialName || '',
                    packingListMaterialName: item.packingName || '',
                    width: item.mm || '',
                    heightLength: item.hl || '',
                    qty: item.qty || '',
                    weight: item.wt || '',
                    color: item.color || '',
                    comment: item.comment || ''
                }));

                setRowData(mappedData);

                // Extract filename from first row's width field or use fileId
                if (mappedData.length > 0 && mappedData[0].width) {
                    setFileName(mappedData[0].width);
                } else {
                    setFileName(`File-${fileId}`);
                }

                setRevision(result.revision || '0');
            }
        } catch (error) {
            console.error("Error fetching packing list data:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMaterialList = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/MaterialListApi.php`);
            const data = await response.json();
            if (data.status === "success" && Array.isArray(data.data)) {
                setMaterialList(data.data);
            }
        } catch (error) {
            console.error("Error fetching material list:", error);
        }
    };

    const fetchUnitList = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/UnitListApi.php`);
            const data = await response.json();
            if (data.status === "success" && Array.isArray(data.data)) {
                setUnitList(data.data);
            }
        } catch (error) {
            console.error("Error fetching unit list:", error);
        }
    };

    useEffect(() => {
        fetchPackingListData();
        fetchMaterialList();
        fetchUnitList();
    }, [fileId]);

    // Editable input cell component (from Site Dashboard)
    const EditableInputCell = (props) => {
        const { value, node, colDef, api } = props;
        const [inputValue, setInputValue] = React.useState(value || "");

        React.useEffect(() => {
            setInputValue(value || "");
        }, [value]);

        const handleChange = (e) => {
            const newValue = e.target.value;
            setInputValue(newValue);
            node.setDataValue(colDef.field, newValue);
            api.refreshCells({ rowNodes: [node], columns: [colDef.field] });
        };

        return (
            <input
                type="text"
                value={inputValue}
                onChange={handleChange}
                style={{
                    width: "100%",
                    height: "100%",
                    border: "1px solid #ddd",
                    borderRadius: "3px",
                    padding: "4px",
                    textAlign: "center",
                    fontSize: "11px",
                    backgroundColor: "transparent",
                    outline: "none"
                }}
                onFocus={(e) => {
                    e.target.style.border = "2px solid #007bff";
                }}
                onBlur={(e) => {
                    e.target.style.border = "1px solid #ddd";
                }}
            />
        );
    };

    // Save button renderer with API integration
    const saveButtonRenderer = (params) => {
        const handleSave = async () => {
            try {
                console.log('Saving data for:', params.data);
                const shortname = sessionStorage.getItem('shortname');

                if (!shortname) {
                    alert('User not logged in. Please login first.');
                    return;
                }

                const formData = new FormData();
                formData.append('mid', params.data.dbId);
                formData.append('file', fileId);
                formData.append('comment', params.data.comment || '');
                formData.append('mname', params.data.materialDescription);
                formData.append('packid', params.data.dbId);
                formData.append('packName', params.data.packingListMaterialName);
                formData.append('qty', params.data.qty || '');
                formData.append('mm', params.data.width || '');
                formData.append('hl', params.data.heightLength || '');
                formData.append('color', params.data.color || '');
                formData.append('WT', params.data.weight || '');
                formData.append('shortname', shortname); // ✅ Added shortname

                console.log('Sending data to API:', Object.fromEntries(formData));

                const response = await fetch(`${API_BASE_URL}/UpdatePackingListApi.php`, {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();
                console.log('API Response:', result);

                const button = document.getElementById(`save-btn-${params.data.id}`);

                if (result.status === 'success') {
                    if (button) {
                        button.style.background = '#28a745';
                        button.innerHTML = '✅ Saved';
                        setTimeout(() => {
                            button.style.background = 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)';
                            button.innerHTML = '💾 Save';
                        }, 2000);
                    }
                    alert('Record updated successfully!');
                } else {
                    if (button) {
                        button.style.background = '#dc3545';
                        button.innerHTML = '❌ Error';
                        setTimeout(() => {
                            button.style.background = 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)';
                            button.innerHTML = '💾 Save';
                        }, 2000);
                    }
                    alert(`Error: ${result.message || 'Update failed'}`);
                }
            } catch (error) {
                console.error('Error saving data:', error);

                const button = document.getElementById(`save-btn-${params.data.id}`);
                if (button) {
                    button.style.background = '#dc3545';
                    button.innerHTML = '❌ Error';
                    setTimeout(() => {
                        button.style.background = 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)';
                        button.innerHTML = '💾 Save';
                    }, 2000);
                }

                alert('Error saving data. Please try again.');
            }
        };

        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                height: '100%',
                justifyContent: 'center'
            }}>
                <button
                    id={`save-btn-${params.data.id}`}
                    onClick={handleSave}
                    style={{
                        background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '4px 12px',
                        fontSize: '10px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(0,123,255,0.2)',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}
                    title="Save Record"
                    onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-1px)';
                        e.target.style.boxShadow = '0 4px 8px rgba(0,123,255,0.3)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 2px 4px rgba(0,123,255,0.2)';
                    }}
                >
                    💾 Save
                </button>
            </div>
        );
    };

    const columnDefs = useMemo(() => [
        {
            headerName: "#",
            field: "id",
            width: 60,
            pinned: 'left',
            editable: false,
            cellStyle: {
                fontWeight: 'bold',
                textAlign: 'center',
                backgroundColor: '#ff8c42',
                color: '#000'
            }
        },
        {
            headerName: "Action",
            field: "action",
            width: 100,
            pinned: 'left',
            editable: false,
            cellStyle: { backgroundColor: '#ff8c42' },
            cellRenderer: saveButtonRenderer // Save button for ALL rows
        },
        {
            headerName: "Material Description",
            field: "materialDescription",
            width: 250,
            cellRenderer: EditableInputCell, // Editable
            cellStyle: (params) => {
                if (params.data.id === 2) {
                    return { fontWeight: 'bold', backgroundColor: '#ff8c42', color: '#000' };
                }
                return { backgroundColor: '#f8f9fa', padding: '2px' };
            }
        },
        {
            headerName: "Packing List Material Name",
            field: "packingListMaterialName",
            width: 250,
            editable: false, // NON-EDITABLE as requested
            cellStyle: (params) => {
                if (params.data.id === 2) {
                    return { fontWeight: 'bold', backgroundColor: '#ff8c42', color: '#000' };
                }
                return { backgroundColor: '#f8f9fa', padding: '2px' };
            }
        },
        {
            headerName: "W (mm)",
            field: "width",
            width: 150,
            cellRenderer: EditableInputCell, // Editable
            cellStyle: (params) => {
                if (params.data.id === 1) {
                    return { backgroundColor: '#f0f0f0', border: '1px solid #000', fontWeight: 'bold' };
                }
                if (params.data.id === 2) {
                    return { fontWeight: 'bold', backgroundColor: '#ff8c42', color: '#000' };
                }
                return { backgroundColor: '#f8f9fa', padding: '2px' };
            }
        },
        {
            headerName: "H / L (mm)",
            field: "heightLength",
            width: 120,
            cellRenderer: EditableInputCell, // Editable
            cellStyle: (params) => {
                if (params.data.id === 1) {
                    return { backgroundColor: '#f0f0f0', border: '1px solid #000' };
                }
                if (params.data.id === 2) {
                    return { fontWeight: 'bold', backgroundColor: '#ff8c42', color: '#000' };
                }
                return { backgroundColor: '#f8f9fa', padding: '2px' };
            }
        },
        {
            headerName: "Qty",
            field: "qty",
            width: 80,
            cellRenderer: EditableInputCell, // Editable
            cellStyle: (params) => {
                if (params.data.id === 2) {
                    return { fontWeight: 'bold', backgroundColor: '#ff8c42', color: '#000' };
                }
                return { backgroundColor: '#f8f9fa', padding: '2px' };
            }
        },
        {
            headerName: "Wt",
            field: "weight",
            width: 80,
            cellRenderer: EditableInputCell, // Editable
            cellStyle: (params) => {
                if (params.data.id === 2) {
                    return { fontWeight: 'bold', backgroundColor: '#ff8c42', color: '#000' };
                }
                return { backgroundColor: '#f8f9fa', padding: '2px' };
            }
        },
        {
            headerName: "Color",
            field: "color",
            width: 150,
            cellRenderer: EditableInputCell, // Editable
            cellStyle: (params) => {
                if (params.data.id === 2) {
                    return { fontWeight: 'bold', backgroundColor: '#ff8c42', color: '#000' };
                }
                return { backgroundColor: '#f8f9fa', padding: '2px' };
            }
        },
        {
            headerName: "Comment",
            field: "comment",
            width: 150,
            cellRenderer: EditableInputCell, // Editable
            cellStyle: (params) => {
                if (params.data.id === 2) {
                    return { fontWeight: 'bold', backgroundColor: '#ff8c42', color: '#000' };
                }
                return { backgroundColor: '#f8f9fa', padding: '2px' };
            }
        }
    ], []);

    const defaultColDef = useMemo(() => ({
        sortable: true,
        resizable: true,
        filter: false
    }), []);

    const handleAddMaterial = async () => {
        if (!selectedMaterial) {
            alert('Please select a material');
            return;
        }

        if (!selectedUnit) {
            alert('Please select a unit');
            return;
        }

        if (!customField2) {
            alert('Please enter quantity');
            return;
        }

        setLoading(true);

        try {
            // Step 1: Check if material already exists
            const checkFormData = new FormData();
            checkFormData.append('file', fileId);
            checkFormData.append('mname', selectedMaterial.value);
            checkFormData.append('revision', revision);

            const checkResponse = await fetch(`${API_BASE_URL}/CheckMaterialApi.php`, {
                method: 'POST',
                body: checkFormData
            });

            const checkResult = await checkResponse.json();

            if (checkResult.status === 'success' && checkResult.exists) {
                alert(`Material "${selectedMaterial.label}" already exists in the packing list!`);
                setLoading(false);
                return;
            }

            // Step 2: Add material if it doesn't exist
            const addFormData = new FormData();
            addFormData.append('file', fileId);
            addFormData.append('mname', selectedMaterial.value);
            addFormData.append('unit', selectedUnit.value);
            addFormData.append('qty', customField2);
            addFormData.append('comment_add', ''); // Add comment if needed

            const addResponse = await fetch(`${API_BASE_URL}/AddMaterialPackingListApi.php`, {
                method: 'POST',
                body: addFormData
            });

            const addResult = await addResponse.json();

            if (addResult.status === 'success') {
                alert('Material added successfully!');

                // Add the new row to the grid
                const newRow = {
                    id: rowData.length + 1,
                    dbId: addResult.data.id,
                    materialDescription: selectedMaterial.value,
                    packingListMaterialName: selectedMaterial.value,
                    width: customField1,
                    heightLength: selectedUnit.value,
                    qty: customField2,
                    weight: '',
                    color: '',
                    comment: ''
                };

                setRowData([...rowData, newRow]);

                // Reset form
                setSelectedMaterial(null);
                setSelectedUnit(null);
                setCustomField1('');
                setCustomField2('');

                // Optionally refresh the data from server
                await fetchPackingListData();
            } else {
                alert(`Error: ${addResult.message}`);
            }
        } catch (error) {
            console.error('Error adding material:', error);
            alert('Error adding material. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const toggleAddForm = () => {
        setShowAddForm(!showAddForm);
        if (showAddForm) {
            setSelectedMaterial(null);
            setSelectedUnit(null);
            setCustomField1('');
            setCustomField2('');
        }
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
                backgroundColor: 'linear-gradient(135deg, #1a1d23 0%, #0f1419 100%)',
                color: '#f8f9fa',
                cardBg: '#252b36',
                cardHeader: 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)',
                inputBg: '#1a202c',
                inputBorder: '#4a5568',
                inputColor: '#f7fafc',
                inputFocus: '#4299e1'
            };
        }
        return {
            backgroundColor: 'linear-gradient(135deg, #f0f4f8 0%, #d9e8f5 100%)',
            color: '#1a202c',
            cardBg: '#ffffff',
            cardHeader: 'linear-gradient(135deg, #ffffff 0%, #f7fafc 100%)',
            inputBg: '#ffffff',
            inputBorder: '#cbd5e0',
            inputColor: '#2d3748',
            inputFocus: '#4299e1'
        };
    };

    const themeStyles = getThemeStyles();
    const gridHeight = isFullScreen ? 'calc(100vh - 280px)' : '600px';

    // React Select custom styles
   const selectStyles = {
    control: (base, state) => ({
        ...base,
        backgroundColor: themeStyles.inputBg,
        borderColor: state.isFocused ? themeStyles.inputFocus : themeStyles.inputBorder,
        borderWidth: '2px',
        borderRadius: '8px',
        minHeight: '44px',
        boxShadow: state.isFocused ? `0 0 0 3px ${themeStyles.inputFocus}20` : 'none',
        '&:hover': {
            borderColor: themeStyles.inputFocus
        },
        transition: 'all 0.2s ease'
    }),
    menu: (base) => ({
        ...base,
        backgroundColor: themeStyles.inputBg,
        borderRadius: '8px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
        border: `1px solid ${themeStyles.inputBorder}`,
        overflow: 'hidden',
        zIndex: 9999
    }),
    menuList: (base) => ({
        ...base,
        padding: '4px',
        maxHeight: '300px'
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
            ? '#ff8c42'
            : state.isFocused
                ? theme === 'dark' ? '#2d3748' : '#f7fafc'
                : themeStyles.inputBg,
        color: state.isSelected ? '#fff' : themeStyles.inputColor,
        cursor: 'pointer',
        padding: '12px 16px',
        transition: 'all 0.2s ease',
        borderRadius: '4px',
        margin: '2px 0',
        '&:active': {
            backgroundColor: '#ff8c42'
        }
    }),
    singleValue: (base) => ({
        ...base,
        color: themeStyles.inputColor,
        fontWeight: '500'
    }),
    input: (base) => ({
        ...base,
        color: themeStyles.inputColor
    }),
    placeholder: (base) => ({
        ...base,
        color: theme === 'dark' ? '#a0aec0' : '#718096',
        fontWeight: '400'
    }),
    dropdownIndicator: (base, state) => ({
        ...base,
        color: themeStyles.inputColor,
        transition: 'all 0.2s ease',
        transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        '&:hover': {
            color: '#ff8c42'
        }
    }),
    clearIndicator: (base) => ({
        ...base,
        color: themeStyles.inputColor,
        transition: 'all 0.2s ease',
        '&:hover': {
            color: '#ff8c42',
            transform: 'scale(1.1)'
        }
    }),
    indicatorSeparator: (base) => ({
        ...base,
        backgroundColor: themeStyles.inputBorder
    }),
    noOptionsMessage: (base) => ({
        ...base,
        color: theme === 'dark' ? '#a0aec0' : '#718096',
        padding: '12px',
        fontSize: '14px'
    }),
    loadingMessage: (base) => ({
        ...base,
        color: theme === 'dark' ? '#a0aec0' : '#718096',
        padding: '12px',
        fontSize: '14px'
    })
};

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

    return (
        <div style={{
            minHeight: '100vh',
            background: themeStyles.backgroundColor,
            color: themeStyles.color,
            padding: 0,
            margin: 0
        }}>
            <div className={`container-fluid ${isFullScreen ? 'p-0' : ''}`}>
                <div className="card" style={{
                    backgroundColor: themeStyles.cardBg,
                    color: themeStyles.color,
                    border: theme === 'dark' ? '1px solid #2d3748' : '1px solid #e2e8f0',
                    margin: isFullScreen ? 0 : 20,
                    borderRadius: isFullScreen ? 0 : 12,
                    boxShadow: theme === 'dark'
                        ? '0 20px 40px rgba(0,0,0,0.4)'
                        : '0 10px 30px rgba(0,0,0,0.08)'
                }}>
                    <div className="card-header" style={{
                        background: themeStyles.cardHeader,
                        color: themeStyles.color,
                        fontFamily: "'Inter', 'Segoe UI', sans-serif",
                        padding: '1.5rem 2rem',
                        borderBottom: `2px solid ${theme === 'dark' ? '#2d3748' : '#e2e8f0'}`
                    }}>
                        <div className="row align-items-center g-3">
                            <div className="col-12">
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    flexWrap: 'wrap',
                                    justifyContent: 'space-between'
                                }}>
                                    <button
                                        onClick={toggleAddForm}
                                        style={{
                                            fontSize: '0.875rem',
                                            padding: '10px 18px',
                                            fontWeight: '600',
                                            letterSpacing: '0.5px',
                                            background: showAddForm
                                                ? 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)'
                                                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: '#fff',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        {showAddForm ? '✖ Hide Form' : '➕ Add Material'}
                                    </button>

                                    <div style={{
                                        display: 'flex',
                                        gap: '12px',
                                        alignItems: 'center',
                                        flex: 1,
                                        minWidth: 0
                                    }}>
                                        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={toggleFullScreen}
                                                style={{
                                                    border: `2px solid ${themeStyles.inputBorder}`,
                                                    backgroundColor: themeStyles.inputBg,
                                                    color: themeStyles.color,
                                                    padding: '8px 16px',
                                                    fontWeight: '600',
                                                    borderRadius: '8px',
                                                    transition: 'all 0.2s ease',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {isFullScreen ? '📉' : '📈'}
                                            </button>
                                            <button
                                                onClick={toggleTheme}
                                                style={{
                                                    border: `2px solid ${themeStyles.inputBorder}`,
                                                    backgroundColor: themeStyles.inputBg,
                                                    color: themeStyles.color,
                                                    padding: '8px 16px',
                                                    fontWeight: '600',
                                                    borderRadius: '8px',
                                                    transition: 'all 0.2s ease',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {theme === 'light' ? '🌙' : '☀️'}
                                            </button>
                                        </div>

                                        <div style={{
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            whiteSpace: 'nowrap',
                                            padding: '8px 16px',
                                            backgroundColor: theme === 'dark' ? '#2d3748' : '#f7fafc',
                                            borderRadius: '8px',
                                            border: `2px solid ${themeStyles.inputBorder}`
                                        }}>
                                            File: <span style={{ color: '#ff8c42' }}>{fileName}</span>
                                            {revision && <span style={{ marginLeft: '8px', color: theme === 'dark' ? '#a0aec0' : '#718096' }}>
                                                (Rev: {revision})
                                            </span>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {showAddForm && (
                                <div className="col-12">
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                        gap: '12px',
                                        alignItems: 'end',
                                        padding: '16px',
                                        backgroundColor: theme === 'dark' ? '#1a202c' : '#f7fafc',
                                        borderRadius: '8px',
                                        border: `2px solid ${themeStyles.inputBorder}`
                                    }}>
                                        <div>
    <label style={{
        display: 'block',
        marginBottom: '6px',
        fontSize: '13px',
        fontWeight: '600',
        color: theme === 'dark' ? '#a0aec0' : '#4a5568'
    }}>
        Material Name
    </label>
    <Select
        value={selectedMaterial}
        onChange={(selected) => setSelectedMaterial(selected)}
        options={materialList}
        styles={selectStyles}
        placeholder="Search and select material..."
        isClearable
        isSearchable
        noOptionsMessage={() => "No materials found"}
        className="react-select-container"
        classNamePrefix="react-select"
    />
</div>

                                        <div>
                                            <label style={{
                                                display: 'block',
                                                marginBottom: '6px',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                color: theme === 'dark' ? '#a0aec0' : '#4a5568'
                                            }}>
                                                Width
                                            </label>
                                            <input
                                                type="text"
                                                value={customField1}
                                                onChange={(e) => setCustomField1(e.target.value)}
                                                placeholder="Enter width..."
                                                style={{
                                                    width: '100%',
                                                    padding: '10px 14px',
                                                    border: `2px solid ${themeStyles.inputBorder}`,
                                                    borderRadius: '8px',
                                                    backgroundColor: themeStyles.inputBg,
                                                    color: themeStyles.inputColor,
                                                    fontSize: '14px',
                                                    fontWeight: '500',
                                                    transition: 'all 0.2s ease',
                                                    outline: 'none'
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.borderColor = themeStyles.inputFocus;
                                                    e.target.style.boxShadow = `0 0 0 3px ${themeStyles.inputFocus}20`;
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = themeStyles.inputBorder;
                                                    e.target.style.boxShadow = 'none';
                                                }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{
                                                display: 'block',
                                                marginBottom: '6px',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                color: theme === 'dark' ? '#a0aec0' : '#4a5568'
                                            }}>
                                                Quantity
                                            </label>
                                            <input
                                                type="text"
                                                value={customField2}
                                                onChange={(e) => setCustomField2(e.target.value)}
                                                placeholder="Enter quantity..."
                                                style={{
                                                    width: '100%',
                                                    padding: '10px 14px',
                                                    border: `2px solid ${themeStyles.inputBorder}`,
                                                    borderRadius: '8px',
                                                    backgroundColor: themeStyles.inputBg,
                                                    color: themeStyles.inputColor,
                                                    fontSize: '14px',
                                                    fontWeight: '500',
                                                    transition: 'all 0.2s ease',
                                                    outline: 'none'
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.borderColor = themeStyles.inputFocus;
                                                    e.target.style.boxShadow = `0 0 0 3px ${themeStyles.inputFocus}20`;
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = themeStyles.inputBorder;
                                                    e.target.style.boxShadow = 'none';
                                                }}
                                            />
                                        </div>

                                        <div>
    <label style={{
        display: 'block',
        marginBottom: '6px',
        fontSize: '13px',
        fontWeight: '600',
        color: theme === 'dark' ? '#a0aec0' : '#4a5568'
    }}>
        Unit
    </label>
    <Select
        value={selectedUnit}
        onChange={(selected) => setSelectedUnit(selected)}
        options={unitList}
        styles={selectStyles}
        placeholder="Search and select unit..."
        isClearable
        isSearchable
        noOptionsMessage={() => "No units found"}
        className="react-select-container"
        classNamePrefix="react-select"
    />
</div>


                                        <button
                                            onClick={handleAddMaterial}
                                            style={{
                                                background: 'linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%)',
                                                border: 'none',
                                                padding: '11px 24px',
                                                borderRadius: '8px',
                                                fontWeight: '600',
                                                fontSize: '14px',
                                                color: '#fff',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                transition: 'all 0.2s ease',
                                                boxShadow: '0 4px 12px rgba(255, 140, 66, 0.3)'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.transform = 'translateY(-2px)';
                                                e.target.style.boxShadow = '0 6px 16px rgba(255, 140, 66, 0.4)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.transform = 'translateY(0)';
                                                e.target.style.boxShadow = '0 4px 12px rgba(255, 140, 66, 0.3)';
                                            }}
                                        >
                                            ➕ Add Row
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="card-body" style={{ padding: 0 }}>
                        {loading ? (
                            <div style={{
                                padding: '60px',
                                textAlign: 'center',
                                fontSize: '18px',
                                color: theme === 'dark' ? '#a0aec0' : '#718096'
                            }}>
                                <div style={{
                                    display: 'inline-block',
                                    width: '50px',
                                    height: '50px',
                                    border: '4px solid rgba(255, 140, 66, 0.2)',
                                    borderTopColor: '#ff8c42',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }}></div>
                                <div style={{ marginTop: '16px' }}>Loading...</div>
                            </div>
                        ) : (
                            <div
                                className={theme === 'dark' ? 'ag-theme-alpine-dark' : 'ag-theme-alpine'}
                                style={{
                                    height: gridHeight,
                                    width: '100%',
                                    '--ag-header-background-color': theme === 'dark' ? '#2d3748' : '#f7fafc',
                                    '--ag-header-foreground-color': theme === 'dark' ? '#f7fafc' : '#2d3748',
                                    '--ag-odd-row-background-color': theme === 'dark' ? '#1a202c' : '#ffffff',
                                    '--ag-background-color': theme === 'dark' ? '#252b36' : '#ffffff',
                                    '--ag-foreground-color': theme === 'dark' ? '#f7fafc' : '#2d3748',
                                    '--ag-border-color': theme === 'dark' ? '#2d3748' : '#e2e8f0',
                                    '--ag-row-hover-color': theme === 'dark' ? '#2d3748' : '#f7fafc'
                                }}
                            >
                                <AgGridReact
                                    ref={gridRef}
                                    rowData={rowData}
                                    columnDefs={columnDefs}
                                    defaultColDef={defaultColDef}
                                    pagination={false}
                                    suppressMovableColumns={true}
                                    suppressCellFocus={false}
                                    animateRows={true}
                                    domLayout='normal'
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .ag-theme-alpine .ag-header-cell,
                .ag-theme-alpine-dark .ag-header-cell {
                    font-weight: 600;
                    font-size: 13px;
                    letter-spacing: 0.3px;
                }

                .ag-theme-alpine .ag-cell,
                .ag-theme-alpine-dark .ag-cell {
                    font-size: 13px;
                    line-height: 1.5;
                    display: flex;
                    align-items: center;
                }

                .ag-theme-alpine .ag-row,
                .ag-theme-alpine-dark .ag-row {
                    border-bottom: 1px solid ${theme === 'dark' ? '#2d3748' : '#e2e8f0'};
                }

                .ag-theme-alpine .ag-row-hover,
                .ag-theme-alpine-dark .ag-row-hover {
                    background-color: ${theme === 'dark' ? '#2d3748' : '#f7fafc'} !important;
                }

                .ag-theme-alpine input[type="text"],
                .ag-theme-alpine-dark input[type="text"] {
                    border-radius: 4px;
                    padding: 6px 10px;
                    border: 1px solid ${theme === 'dark' ? '#4a5568' : '#cbd5e0'};
                    background-color: ${theme === 'dark' ? '#1a202c' : '#ffffff'};
                    color: ${theme === 'dark' ? '#f7fafc' : '#2d3748'};
                }

                .ag-theme-alpine input[type="text"]:focus,
                .ag-theme-alpine-dark input[type="text"]:focus {
                    outline: none;
                    border-color: #4299e1;
                    box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.2);
                }

                /* Scrollbar styling */
                .ag-theme-alpine ::-webkit-scrollbar,
                .ag-theme-alpine-dark ::-webkit-scrollbar {
                    width: 10px;
                    height: 10px;
                }

                .ag-theme-alpine ::-webkit-scrollbar-track,
                .ag-theme-alpine-dark ::-webkit-scrollbar-track {
                    background: ${theme === 'dark' ? '#1a202c' : '#f7fafc'};
                }

                .ag-theme-alpine ::-webkit-scrollbar-thumb,
                .ag-theme-alpine-dark ::-webkit-scrollbar-thumb {
                    background: ${theme === 'dark' ? '#4a5568' : '#cbd5e0'};
                    border-radius: 5px;
                }

                .ag-theme-alpine ::-webkit-scrollbar-thumb:hover,
                .ag-theme-alpine-dark ::-webkit-scrollbar-thumb:hover {
                    background: #ff8c42;
                }

                /* Mobile responsiveness */
                @media (max-width: 768px) {
                    .ag-theme-alpine,
                    .ag-theme-alpine-dark {
                        font-size: 12px;
                    }

                    .ag-theme-alpine .ag-header-cell,
                    .ag-theme-alpine-dark .ag-header-cell {
                        font-size: 11px;
                        padding: 8px 4px;
                    }

                    .ag-theme-alpine .ag-cell,
                    .ag-theme-alpine-dark .ag-cell {
                        font-size: 11px;
                        padding: 6px 4px;
                    }
                }
            `}</style>
        </div>
    );
};

export default PackingListManager;