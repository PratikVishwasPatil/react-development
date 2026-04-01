import React, { useEffect, useMemo, useState, useRef } from "react";
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
import { Container, Button, Row, Col, Card, ButtonGroup, Badge } from 'react-bootstrap';
import Select from 'react-select';
import { Plus, Edit2, Save, X } from 'lucide-react';

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
    const [editingRowId, setEditingRowId] = useState(null);

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
    const API_BASE_URL = "http://93.127.167.54/Surya_React/surya_dynamic_api";

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

    const handleEditRow = (rowId) => {
        setEditingRowId(rowId);
    };

    const handleSaveRow = (rowId) => {
        // Save logic here - you can add API call to save the row
        setEditingRowId(null);
        console.log('Saving row:', rowId);
    };

    const handleCancelEdit = () => {
        setEditingRowId(null);
        // Optionally refresh data to revert changes
        fetchPackingListData();
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
            cellRenderer: (params) => {
                const isEditing = editingRowId === params.data.id;

                if (params.data.id === 1) {
                    return (
                        <div style={{ display: 'flex', gap: '5px', padding: '5px 0' }}>
                            <button style={{
                                border: '1px solid #000',
                                background: '#fff',
                                padding: '2px 8px',
                                cursor: 'pointer',
                                borderRadius: '3px'
                            }}>
                                <span style={{ fontSize: '12px' }}>📋</span>
                            </button>
                            <button style={{
                                border: '1px solid #000',
                                background: '#fff',
                                padding: '2px 8px',
                                cursor: 'pointer',
                                borderRadius: '3px'
                            }}>
                                <span style={{ fontSize: '12px' }}>✖</span>
                            </button>
                        </div>
                    );
                }

                if (isEditing) {
                    return (
                        <div style={{ display: 'flex', gap: '5px', padding: '5px 0' }}>
                            <button
                                onClick={() => handleSaveRow(params.data.id)}
                                style={{
                                    border: '1px solid #28a745',
                                    background: '#28a745',
                                    color: '#fff',
                                    padding: '2px 8px',
                                    cursor: 'pointer',
                                    borderRadius: '3px'
                                }}
                                title="Save"
                            >
                                <span style={{ fontSize: '12px' }}>💾</span>
                            </button>
                            <button
                                onClick={handleCancelEdit}
                                style={{
                                    border: '1px solid #dc3545',
                                    background: '#dc3545',
                                    color: '#fff',
                                    padding: '2px 8px',
                                    cursor: 'pointer',
                                    borderRadius: '3px'
                                }}
                                title="Cancel"
                            >
                                <span style={{ fontSize: '12px' }}>✖</span>
                            </button>
                        </div>
                    );
                }

                return (
                    <button
                        onClick={() => handleEditRow(params.data.id)}
                        style={{
                            border: '1px solid #000',
                            background: '#fff',
                            padding: '2px 8px',
                            cursor: 'pointer',
                            borderRadius: '3px'
                        }}
                        title="Edit"
                    >
                        <span style={{ fontSize: '12px' }}>✏️</span>
                    </button>
                );
            }
        },
        {
            headerName: "Material Description",
            field: "materialDescription",
            width: 250,
            editable: (params) => editingRowId === params.data.id && params.data.id !== 2,
            cellStyle: (params) => {
                if (params.data.id === 2) {
                    return { fontWeight: 'bold', backgroundColor: '#ff8c42', color: '#000' };
                }
                if (editingRowId === params.data.id) {
                    return { backgroundColor: '#fff8dc' };
                }
                return {};
            }
        },
        {
            headerName: "Packing List Material Name",
            field: "packingListMaterialName",
            width: 250,
            editable: (params) => editingRowId === params.data.id && params.data.id !== 2,
            cellStyle: (params) => {
                if (params.data.id === 2) {
                    return { fontWeight: 'bold', backgroundColor: '#ff8c42', color: '#000' };
                }
                if (editingRowId === params.data.id) {
                    return { backgroundColor: '#fff8dc' };
                }
                return {};
            }
        },
        {
            headerName: "W (mm)",
            field: "width",
            width: 120,
            editable: (params) => editingRowId === params.data.id && params.data.id !== 1 && params.data.id !== 2,
            cellStyle: (params) => {
                if (params.data.id === 1) {
                    return { backgroundColor: '#f0f0f0', border: '1px solid #000' };
                }
                if (params.data.id === 2) {
                    return { fontWeight: 'bold', backgroundColor: '#ff8c42', color: '#000' };
                }
                if (editingRowId === params.data.id) {
                    return { backgroundColor: '#fff8dc' };
                }
                return {};
            }
        },
        {
            headerName: "H / L (mm)",
            field: "heightLength",
            width: 120,
            editable: (params) => editingRowId === params.data.id && params.data.id !== 1 && params.data.id !== 2,
            cellStyle: (params) => {
                if (params.data.id === 1) {
                    return { backgroundColor: '#f0f0f0', border: '1px solid #000' };
                }
                if (params.data.id === 2) {
                    return { fontWeight: 'bold', backgroundColor: '#ff8c42', color: '#000' };
                }
                if (editingRowId === params.data.id) {
                    return { backgroundColor: '#fff8dc' };
                }
                return {};
            }
        },
        {
            headerName: "Qty",
            field: "qty",
            width: 80,
            editable: (params) => editingRowId === params.data.id && params.data.id !== 2,
            cellStyle: (params) => {
                if (params.data.id === 2) {
                    return { fontWeight: 'bold', backgroundColor: '#ff8c42', color: '#000' };
                }
                if (editingRowId === params.data.id) {
                    return { backgroundColor: '#fff8dc' };
                }
                return {};
            }
        },
        {
            headerName: "Wt",
            field: "weight",
            width: 80,
            editable: (params) => editingRowId === params.data.id && params.data.id !== 2,
            cellStyle: (params) => {
                if (params.data.id === 2) {
                    return { fontWeight: 'bold', backgroundColor: '#ff8c42', color: '#000' };
                }
                if (editingRowId === params.data.id) {
                    return { backgroundColor: '#fff8dc' };
                }
                return {};
            }
        },
        {
            headerName: "Color",
            field: "color",
            width: 120,
            editable: (params) => editingRowId === params.data.id && params.data.id !== 2,
            cellStyle: (params) => {
                if (params.data.id === 2) {
                    return { fontWeight: 'bold', backgroundColor: '#ff8c42', color: '#000' };
                }
                if (editingRowId === params.data.id) {
                    return { backgroundColor: '#fff8dc' };
                }
                return {};
            }
        },
        {
            headerName: "Comment",
            field: "comment",
            width: 200,
            editable: (params) => editingRowId === params.data.id && params.data.id !== 2,
            cellStyle: (params) => {
                if (params.data.id === 2) {
                    return { fontWeight: 'bold', backgroundColor: '#ff8c42', color: '#000' };
                }
                if (editingRowId === params.data.id) {
                    return { backgroundColor: '#fff8dc' };
                }
                return {};
            }
        }
    ], [editingRowId]);

    const defaultColDef = useMemo(() => ({
        sortable: true,
        resizable: true,
        filter: false,
        singleClickEdit: true
    }), []);

    const handleAddMaterial = () => {
        if (!selectedMaterial || !selectedUnit) {
            alert('Please select both Material and Unit');
            return;
        }

        const newRow = {
            id: rowData.length + 1,
            dbId: null,
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
        setSelectedMaterial(null);
        setSelectedUnit(null);
        setCustomField1('');
        setCustomField2('');
    };

    const toggleAddForm = () => {
        setShowAddForm(!showAddForm);
        if (showAddForm) {
            // Clear form when hiding
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
            overflow: 'hidden'
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected
                ? '#ff8c42'
                : state.isFocused
                    ? theme === 'dark' ? '#2d3748' : '#f7fafc'
                    : themeStyles.inputBg,
            color: state.isSelected ? '#000' : themeStyles.inputColor,
            cursor: 'pointer',
            padding: '12px 16px',
            transition: 'all 0.2s ease',
            '&:active': {
                backgroundColor: '#ff8c42'
            }
        }),
        singleValue: (base) => ({
            ...base,
            color: themeStyles.inputColor
        }),
        input: (base) => ({
            ...base,
            color: themeStyles.inputColor
        }),
        placeholder: (base) => ({
            ...base,
            color: theme === 'dark' ? '#a0aec0' : '#718096'
        }),
        dropdownIndicator: (base) => ({
            ...base,
            color: themeStyles.inputColor,
            '&:hover': {
                color: '#ff8c42'
            }
        }),
        clearIndicator: (base) => ({
            ...base,
            color: themeStyles.inputColor,
            '&:hover': {
                color: '#ff8c42'
            }
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
            <Container fluid={isFullScreen}>
                <Card style={{
                    backgroundColor: themeStyles.cardBg,
                    color: themeStyles.color,
                    border: theme === 'dark' ? '1px solid #2d3748' : '1px solid #e2e8f0',
                    margin: isFullScreen ? 0 : 20,
                    borderRadius: isFullScreen ? 0 : 12,
                    boxShadow: theme === 'dark'
                        ? '0 20px 40px rgba(0,0,0,0.4)'
                        : '0 10px 30px rgba(0,0,0,0.08)'
                }}>
                    <Card.Header style={{
                        background: themeStyles.cardHeader,
                        color: themeStyles.color,
                        fontFamily: "'Inter', 'Segoe UI', sans-serif",
                        padding: '1.5rem 2rem',
                        borderBottom: `2px solid ${theme === 'dark' ? '#2d3748' : '#e2e8f0'}`
                    }}>
                        <Row className="align-items-center g-3">
                            <Col xs={12}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    flexWrap: 'wrap',
                                    justifyContent: 'space-between'
                                }}>
                                    <Button
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
                                        {showAddForm ? <X size={16} /> : <Plus size={16} />}
                                        {showAddForm ? 'Hide Form' : 'Add Material'}
                                    </Button>

                                    <div style={{
                                        display: 'flex',
                                        gap: '12px',
                                        alignItems: 'center',
                                        flex: 1,
                                        minWidth: 0
                                    }}>
                                        <ButtonGroup size="sm" style={{ marginLeft: 'auto' }}>
                                            <Button
                                                variant="outline-secondary"
                                                onClick={toggleFullScreen}
                                                style={{
                                                    border: `2px solid ${themeStyles.inputBorder}`,
                                                    backgroundColor: themeStyles.inputBg,
                                                    color: themeStyles.color,
                                                    padding: '8px 16px',
                                                    fontWeight: '600',
                                                    borderRadius: '8px 0 0 8px',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                {isFullScreen ? '📉' : '📈'}
                                            </Button>
                                            <Button
                                                variant="outline-secondary"
                                                onClick={toggleTheme}
                                                style={{
                                                    border: `2px solid ${themeStyles.inputBorder}`,
                                                    borderLeft: 'none',
                                                    backgroundColor: themeStyles.inputBg,
                                                    color: themeStyles.color,
                                                    padding: '8px 16px',
                                                    fontWeight: '600',
                                                    borderRadius: '0 8px 8px 0',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                {theme === 'light' ? '🌙' : '☀️'}
                                            </Button>
                                        </ButtonGroup>

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
                            </Col>

                            {showAddForm && (
                                <Col xs={12}>
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
                                                onChange={setSelectedMaterial}
                                                options={materialList}
                                                styles={selectStyles}
                                                placeholder="Select Material..."
                                                isClearable
                                                isSearchable
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
                                                onChange={setSelectedUnit}
                                                options={unitList}
                                                styles={selectStyles}
                                                placeholder="Select Unit..."
                                                isClearable
                                                isSearchable
                                            />
                                        </div>

                                        <Button
                                            style={{
                                                background: 'linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%)',
                                                border: 'none',
                                                padding: '11px 24px', borderRadius: '8px',
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
                                            onClick={handleAddMaterial}
                                            onMouseEnter={(e) => {
                                                e.target.style.transform = 'translateY(-2px)';
                                                e.target.style.boxShadow = '0 6px 16px rgba(255, 140, 66, 0.4)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.transform = 'translateY(0)';
                                                e.target.style.boxShadow = '0 4px 12px rgba(255, 140, 66, 0.3)';
                                            }}
                                        >
                                            <Plus size={16} />
                                            Add Row
                                        </Button>
                                    </div>
                                </Col>
                            )}
                        </Row>
                    </Card.Header>

                    <Card.Body style={{ padding: 0 }}>
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
                    </Card.Body>
                </Card>
            </Container>

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