import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { ModuleRegistry } from "ag-grid-community";
import Select from "react-select";
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

// ─── react-select custom styles factory ───────────────────────────────────────
const makeSelectStyles = (theme) => ({
    control: (base, state) => ({
        ...base,
        minHeight: '42px',
        borderRadius: '6px',
        border: `2px solid ${state.isFocused ? '#ef4444' : (theme === 'dark' ? '#334155' : '#e2e8f0')}`,
        backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
        color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
        boxShadow: 'none',
        fontSize: '13px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': { borderColor: '#ef4444' }
    }),
    menu: (base) => ({
        ...base,
        zIndex: 9999,
        backgroundColor: theme === 'dark' ? '#1e293b' : '#fff',
        border: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`,
        borderRadius: '6px',
        fontSize: '13px'
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
            ? '#ef4444'
            : state.isFocused
                ? (theme === 'dark' ? '#334155' : '#fff3f3')
                : 'transparent',
        color: state.isSelected ? '#fff' : (theme === 'dark' ? '#f1f5f9' : '#0f172a'),
        cursor: 'pointer',
        fontSize: '13px'
    }),
    singleValue: (base) => ({
        ...base,
        color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
        fontSize: '13px'
    }),
    placeholder: (base) => ({
        ...base,
        color: theme === 'dark' ? '#64748b' : '#94a3b8',
        fontSize: '13px'
    }),
    input: (base) => ({
        ...base,
        color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
        fontSize: '13px'
    }),
    indicatorSeparator: () => ({ display: 'none' }),
    dropdownIndicator: (base) => ({
        ...base,
        color: '#ef4444',
        '&:hover': { color: '#dc2626' }
    }),
    clearIndicator: (base) => ({
        ...base,
        color: '#94a3b8',
        '&:hover': { color: '#ef4444' }
    })
});

// Compact select styles for inside AG Grid cells
const gridCellSelectStyles = {
    control: (base) => ({
        ...base,
        minHeight: '28px',
        height: '28px',
        border: 'none',
        borderRadius: '3px',
        backgroundColor: '#fff3cd',
        boxShadow: 'none',
        fontSize: '11px',
        cursor: 'pointer'
    }),
    menu: (base) => ({
        ...base,
        zIndex: 99999,
        fontSize: '11px',
        minWidth: '150px'
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected ? '#ef4444' : state.isFocused ? '#fff3f3' : '#fff',
        color: state.isSelected ? '#fff' : '#222',
        fontSize: '11px',
        padding: '4px 8px',
        cursor: 'pointer'
    }),
    valueContainer: (base) => ({ ...base, padding: '0 4px', height: '28px' }),
    singleValue: (base) => ({ ...base, fontSize: '11px', color: '#222' }),
    placeholder: (base) => ({ ...base, fontSize: '11px', color: '#aaa' }),
    input: (base) => ({ ...base, fontSize: '11px', margin: 0, padding: 0 }),
    indicatorSeparator: () => ({ display: 'none' }),
    dropdownIndicator: (base) => ({ ...base, padding: '0 4px', color: '#999' }),
    clearIndicator: (base) => ({ ...base, padding: '0 2px' })
};

const MaterialManagerForm = () => {
    const [activeTab, setActiveTab] = useState('Add Material Code');
    const [theme, setTheme] = useState('light');
    const [materialType, setMaterialType] = useState(null);
    const [materialComponent, setMaterialComponent] = useState(null);
    const [maintainStock, setMaintainStock] = useState('no');
    const [specifications, setSpecifications] = useState(['', '', '', '']);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    // Dropdown data states
    const [materialTypes, setMaterialTypes] = useState([]);
    const [materialComponents, setMaterialComponents] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [materialCategories, setMaterialCategories] = useState([]);
    const [hsnList, setHsnList] = useState([]);
    const [unitList, setUnitList] = useState([]);

    // Grid data states
    const [unassignedData, setUnassignedData] = useState([]);
    const [viewMaterialData, setViewMaterialData] = useState([]);

    const [loading, setLoading] = useState(false);
    const [loadingComponents, setLoadingComponents] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [gridLoading, setGridLoading] = useState(false);

    // Add Material Initial states
    const [initialMaterialType, setInitialMaterialType] = useState(null);
    const [initialMaterialName, setInitialMaterialName] = useState('');

    // Edit Material Category states
    const [editMaterialType, setEditMaterialType] = useState(null);
    const [editMaterialComponent, setEditMaterialComponent] = useState(null);
    const [editComponents, setEditComponents] = useState([]);
    const [loadingEditComponents, setLoadingEditComponents] = useState(false);
    const [editMaterialData, setEditMaterialData] = useState([]);
    const [loadingEditGrid, setLoadingEditGrid] = useState(false);
    const editMaterialGridRef = useRef();
    const unassignedGridRef = useRef();
    const viewMaterialGridRef = useRef();
    const [makeList, setMakeList] = useState([]);

    const [formData, setFormData] = useState({
        materialDescription: '',
        weightRequired: false,
        weight: '',
        stockUnit: null,
        purchaseUnit: null,
        materialCategory: null,
        supplier: null,
        vendor: null,
        minStockQty: '',
        maxStockQty: '',
        reorderQty: '',
        minOrderQty: '',
        rate: '',
        leadTime: '',
        hsn: null,
        gst: null
    });

    const tabs = [
        'Add Material Code',
        'View Material Stock',
        'Edit Material Category',
        'Unmatch Material',
        'Unassigned Material',
        'Add Material Initial'
    ];

    const gstOptions = [
        { value: '9', label: '9%' },
        { value: '12', label: '12%' },
        { value: '18', label: '18%' },
        { value: '28', label: '28%' }
    ];

    const API_BASE_URL = 'https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store';

    const selectStyles = makeSelectStyles(theme);

    // ─── Helper: convert arrays to react-select options ──────────────────────
    const toOptions = (arr, valueKey, labelKey) =>
        arr.map(item => ({ value: item[valueKey], label: item[labelKey] }));

    const materialTypeOptions = useMemo(
        () => toOptions(materialTypes, 'main_material_type_id', 'main_material_name'),
        [materialTypes]
    );
    const supplierOptions = useMemo(
        () => toOptions(suppliers, 'CUSTOMER_ID', 'CUSTOMER_NAME'),
        [suppliers]
    );
    const vendorOptions = useMemo(
        () => toOptions(vendors, 'CUSTOMER_ID', 'CUSTOMER_NAME'),
        [vendors]
    );
    const categoryOptions = useMemo(
        () => toOptions(materialCategories, 'id', 'category'),
        [materialCategories]
    );
    const hsnOptions = useMemo(
        () => hsnList.map(h => ({ value: h.id, label: String(h.id) })),
        [hsnList]
    );
    const unitOptions = useMemo(
        () => unitList.map(u => ({ value: u.id, label: u.Unit })),
        [unitList]
    );
    const makeOptions = useMemo(
        () => makeList.map(m => ({ value: m.id, label: m.make })),
        [makeList]
    );

    // ─── Fetch helpers ────────────────────────────────────────────────────────
    const fetchMakeList = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/MakeListApi.php`);
            const json = await res.json();
            if (json.status === 'success') setMakeList(json.data || []);
        } catch (e) {
            console.error('Error fetching make list:', e);
        }
    };

    const fetchAllDropdowns = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/getAllDropdownApi.php`);
            const json = await res.json();
            if (json.status === 'success') {
                setMaterialTypes(json.data.mainMaterialTypes || []);
                setSuppliers(json.data.suppliers || []);
                setVendors(json.data.vendors || []);
                setMaterialCategories(json.data.materialCategories || []);
                setHsnList(json.data.hsnList || []);
                setUnitList(json.data.unitList || []);
            }
            await fetchMakeList();
        } catch (e) {
            console.error('Error fetching dropdowns:', e);
            showToast('Failed to load dropdown data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchUnassignedMaterial = async () => {
        setGridLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/get_unassignedMaterialApi.php`);
            const json = await res.json();
            if (json.status === 'success') {
                setUnassignedData(json.data || []);
                showToast(`Loaded ${json.count || 0} unassigned materials`, 'success');
            }
        } catch (e) {
            showToast('Failed to load unassigned materials', 'error');
        } finally {
            setGridLoading(false);
        }
    };

    const fetchViewMaterial = async () => {
        setGridLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/get_viewMaterialApi.php`);
            const json = await res.json();
            if (json.status === 'success') {
                setViewMaterialData(json.data || []);
                showToast(`Loaded ${json.count || 0} materials`, 'success');
            }
        } catch (e) {
            showToast('Failed to load materials', 'error');
        } finally {
            setGridLoading(false);
        }
    };

    const fetchMaterialComponents = async (materialTypeId) => {
        setLoadingComponents(true);
        try {
            const res = await fetch(`${API_BASE_URL}/getMaterialComponentApi.php?material=${materialTypeId}`);
            const json = await res.json();
            setMaterialComponents(json.status === 'success' ? json.data || [] : []);
        } catch (e) {
            setMaterialComponents([]);
        } finally {
            setLoadingComponents(false);
        }
    };

    const fetchEditMaterialComponents = async (materialTypeId) => {
        setLoadingEditComponents(true);
        try {
            const res = await fetch(`${API_BASE_URL}/getMaterialComponentApi.php?material=${materialTypeId}`);
            const json = await res.json();
            setEditComponents(json.status === 'success' ? json.data || [] : []);
        } catch (e) {
            setEditComponents([]);
        } finally {
            setLoadingEditComponents(false);
        }
    };

    const fetchEditMaterialData = async (materialTypeId, materialComponentId) => {
        setLoadingEditGrid(true);
        try {
            const res = await fetch(`${API_BASE_URL}/getMaterialDataForEditApi.php?material=${materialComponentId}`);
            const json = await res.json();
            if (json.status === 'success') {
                setEditMaterialData(json.data || []);
                showToast(`Loaded ${json.count || 0} materials`, 'success');
            } else {
                setEditMaterialData([]);
                showToast('No materials found', 'info');
            }
        } catch (e) {
            showToast('Failed to load material data', 'error');
            setEditMaterialData([]);
        } finally {
            setLoadingEditGrid(false);
        }
    };

    // ─── Effects ──────────────────────────────────────────────────────────────
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => { fetchAllDropdowns(); }, []);

    useEffect(() => {
        if (activeTab === 'Unassigned Material') fetchUnassignedMaterial();
        else if (activeTab === 'View Material Stock') fetchViewMaterial();
    }, [activeTab]);

    useEffect(() => {
        if (materialType) {
            fetchMaterialComponents(materialType.value);
        } else {
            setMaterialComponents([]);
            setMaterialComponent(null);
            setSpecifications(['', '', '', '']);
        }
    }, [materialType]);

    useEffect(() => {
        if (editMaterialType) {
            fetchEditMaterialComponents(editMaterialType.value);
        } else {
            setEditComponents([]);
            setEditMaterialComponent(null);
        }
    }, [editMaterialType]);

    useEffect(() => {
        if (editMaterialType && editMaterialComponent) {
            fetchEditMaterialData(editMaterialType.value, editMaterialComponent.value);
        } else {
            setEditMaterialData([]);
        }
    }, [editMaterialComponent]);

    useEffect(() => {
        if (materialComponent) {
            const label = materialComponent.label;
            setSpecifications([label, label, label, label]);
        } else {
            setSpecifications(['', '', '', '']);
        }
    }, [materialComponent]);

    // ─── materialComponents as react-select options ───────────────────────────
    const materialComponentOptions = useMemo(
        () => materialComponents.map(c => ({ value: c.value, label: c.label })),
        [materialComponents]
    );
    const editComponentOptions = useMemo(
        () => editComponents.map(c => ({ value: c.value, label: c.label })),
        [editComponents]
    );

    // ─── Toast ────────────────────────────────────────────────────────────────
    const showToast = (message, type = 'info') => {
        const colors = { success: '#28a745', error: '#dc3545', warning: '#ffc107', info: '#17a2b8' };
        const el = document.createElement('div');
        el.style.cssText = `
            position:fixed;top:20px;right:20px;padding:15px 20px;
            background:${colors[type]||colors.info};
            color:${type==='warning'?'#000':'white'};
            border-radius:5px;box-shadow:0 4px 6px rgba(0,0,0,.1);
            z-index:10000;font-size:14px;max-width:350px;
            animation:slideIn .3s ease-out;
        `;
        el.textContent = message;
        const style = document.createElement('style');
        style.textContent = `@keyframes slideIn{from{transform:translateX(400px);opacity:0}to{transform:translateX(0);opacity:1}}`;
        document.head.appendChild(style);
        document.body.appendChild(el);
        setTimeout(() => { el.style.animation='slideOut .3s ease-in'; setTimeout(()=>el.remove(),300); }, 3000);
    };

    // ─── Submit ───────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!materialType) { alert('Please select Material Type'); return; }
        if (!materialComponent) { alert('Please select Material Component'); return; }
        if (!formData.materialDescription) { alert('Please enter Material Description'); return; }
        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('employee_id', '1');
            fd.append('main_id', materialType.value);
            fd.append('material_initial', materialComponent.value);
            fd.append('material_description', formData.materialDescription);
            fd.append('isweight', formData.weightRequired ? 'on' : 'off');
            fd.append('weight_value', formData.weight || '0');
            fd.append('stockfUnit', formData.stockUnit?.value || '');
            fd.append('purchaseUnit', formData.purchaseUnit?.value || '');
            fd.append('supplier', formData.supplier?.value || '');
            fd.append('vendor', formData.vendor?.value || '');
            fd.append('stockMaintain', maintainStock === 'yes' ? 'Yes' : 'No');
            fd.append('min_stock', formData.minStockQty || '0');
            fd.append('max_stock', formData.maxStockQty || '0');
            fd.append('reorder_stock', formData.reorderQty || '0');
            fd.append('rate', formData.rate || '0');
            fd.append('lead_time', formData.leadTime || '0');
            fd.append('hsn', formData.hsn?.value || '');
            fd.append('gst', formData.gst?.value || '');
            fd.append('Materialcat', formData.materialCategory?.value || '');
            fd.append('makeID', formData.make?.value || '');
            fd.append('p21', 'Height'); fd.append('p2', specifications[1] || '0');
            fd.append('p31', 'Thickness'); fd.append('p3', specifications[2] || '0');
            fd.append('p41', 'Flange1'); fd.append('p4', specifications[3] || '0');
            fd.append('p51', ''); fd.append('p5', '');
            const res = await fetch(`${API_BASE_URL}/SaveMaterialDataApi.php`, { method: 'POST', body: fd });
            const json = await res.json();
            if (json.status === 'success') {
                showToast(`Material added successfully! ID: ${json.material_id}`, 'success');
                setMaterialType(null); setMaterialComponent(null);
                setSpecifications(['', '', '', '']); setMaintainStock('no');
                setFormData({ materialDescription:'', weightRequired:false, weight:'', stockUnit:null, purchaseUnit:null, materialCategory:null, supplier:null, vendor:null, minStockQty:'', maxStockQty:'', reorderQty:'', minOrderQty:'', rate:'', leadTime:'', hsn:null, gst:null });
            } else {
                showToast(`Error: ${json.message || 'Failed to save material'}`, 'error');
            }
        } catch (e) {
            showToast('Error submitting form. Please try again.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddMaterialInitial = async () => {
        if (!initialMaterialType) { showToast('Please select Material Type', 'error'); return; }
        if (!initialMaterialName.trim()) { showToast('Please enter Material Initial name', 'error'); return; }
        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('initial', initialMaterialName.trim());
            fd.append('mainId', initialMaterialType.value);
            fd.append('employee_id', '1');
            const res = await fetch(`${API_BASE_URL}/addNewInitialDataApi.php`, { method: 'POST', body: fd });
            const json = await res.json();
            if (json.status === 'success') {
                showToast('Material Initial added successfully!', 'success');
                setInitialMaterialType(null); setInitialMaterialName('');
            } else if (json.status === 'exists') {
                showToast('Material initial already exists', 'warning');
            } else {
                showToast(json.message || 'Failed to add material initial', 'error');
            }
        } catch (e) {
            showToast('Error adding material initial. Please try again.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const saveEditedRowData = async (rowData) => {
        try {
            showToast('Saving data...', 'info');
            const fd = new FormData();
            fd.append('material_id', rowData.materialID || '');
            fd.append('material_initial', rowData.materialInitial || '');
            fd.append('unit', rowData.Unit || '');
            fd.append('pur_unit', rowData.pur_unit || '');
            fd.append('make', rowData.make || '');
            fd.append('rate', rowData.rate || '');
            fd.append('weight', rowData.weight || '');
            fd.append('hsn', rowData.hsn || '');
            fd.append('gst', rowData.gst || '');
            fd.append('main_material_name', rowData.main_material_name || '');
            fd.append('category', rowData.category || '');
            fd.append('rfd', rowData.rfd || '');
            fd.append('min', rowData.min || '');
            fd.append('max', rowData.max || '');
            fd.append('reorder', rowData.reorder || '');
            fd.append('leadTime', rowData.leadTime || '');
            fd.append('Sqft', rowData.Sqft || '');
            fd.append('shmrate', rowData.shmrate || '');
            const res = await fetch(`${API_BASE_URL}/EditMaterialCategoryApi.php`, { method: 'POST', body: fd });
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const json = await res.json();
            if (json.status === 'success') {
                showToast(`✓ ${json.message} (ID: ${json.material_id})`, 'success');
                if (editMaterialType && editMaterialComponent) fetchEditMaterialData(editMaterialType.value, editMaterialComponent.value);
            } else {
                showToast('Error: ' + (json.message || 'Failed to save data'), 'error');
            }
        } catch (e) {
            showToast('Network error: ' + e.message, 'error');
        }
    };

    const downloadExcel = (gridRef, filename) => {
        if (!gridRef.current?.api) { showToast('Grid not ready', 'error'); return; }
        try {
            gridRef.current.api.exportDataAsCsv({ fileName: `${filename}_${new Date().toISOString().split('T')[0]}.csv`, allColumns: true });
            showToast('Data exported successfully', 'success');
        } catch (e) {
            showToast('Failed to export data', 'error');
        }
    };

    // ─── Theme ────────────────────────────────────────────────────────────────
    const toggleTheme = () => setTheme(p => p === 'light' ? 'dark' : 'light');
    const themeStyles = useMemo(() => theme === 'dark' ? {
        backgroundColor: '#0f172a', color: '#f1f5f9', cardBg: '#1e293b',
        inputBg: '#0f172a', inputBorder: '#334155', inputColor: '#f1f5f9',
        buttonBg: '#ef4444', labelColor: '#94a3b8', borderColor: '#334155'
    } : {
        backgroundColor: '#f8fafc', color: '#0f172a', cardBg: '#ffffff',
        inputBg: '#ffffff', inputBorder: '#e2e8f0', inputColor: '#0f172a',
        buttonBg: '#ef4444', labelColor: '#64748b', borderColor: '#e2e8f0'
    }, [theme]);

    // ─── Reusable label style ─────────────────────────────────────────────────
    const labelStyle = { display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: themeStyles.color };

    // ─── AG Grid column defs ──────────────────────────────────────────────────

    // RateCellRenderer (defined inside so it can close over nothing extra)
    const RateCellRenderer = (props) => {
        const [editMode, setEditMode] = useState(false);
        const [inputValue, setInputValue] = useState(props.data.rate || '');
        useEffect(() => { setInputValue(props.data.rate || ''); }, [props.data.rate]);
        const commit = () => { props.node.setDataValue("rate", inputValue); setEditMode(false); };
        if (editMode) {
            return (
                <input type="number" value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onBlur={commit}
                    onKeyPress={e => e.key === 'Enter' && commit()}
                    style={{ width:'100%', height:'100%', border:'1px solid #007bff', borderRadius:'3px', fontSize:'11px', textAlign:'right', backgroundColor:'#fff3cd' }}
                    autoFocus />
            );
        }
        return (
            <div style={{ textAlign:'right', cursor:'pointer', color:'#28a745', fontWeight:'bold' }}
                onClick={() => setEditMode(true)}>
                {inputValue ? `₹${parseFloat(inputValue).toFixed(2)}` : '-'}
            </div>
        );
    };

    const editMaterialColumnDefs = useMemo(() => [
        { headerName: "Sr No", field: "count", width: isMobile ? 70 : 90, minWidth: 60, pinned: 'left', cellStyle: { fontWeight: 'bold', textAlign: 'center' } },
        { field: "materialID", headerName: "Material ID", width: isMobile ? 100 : 120, minWidth: 90, pinned: 'left', checkboxSelection: true, headerCheckboxSelection: true, cellStyle: { fontWeight: '600', color: '#007bff' } },
        { field: "material_description", headerName: "Material Description", width: isMobile ? 200 : 350, minWidth: 180, flex: 1, cellStyle: { fontWeight: '500' } },
        {
            field: "materialInitial", headerName: "Initial", width: isMobile ? 150 : 180, minWidth: 130,
            cellRenderer: (params) => (
                <Select options={materialComponentOptions} value={materialComponentOptions.find(o => o.value === params.data.materialInitial) || null}
                    onChange={opt => params.node.setDataValue("materialInitial", opt ? opt.value : '')}
                    styles={gridCellSelectStyles} isClearable isSearchable placeholder="Select..." menuPortalTarget={document.body} menuPosition="fixed" />
            ),
            cellStyle: { backgroundColor: '#fff3cd', padding: '2px' }
        },
        {
            field: "Unit", headerName: "Stock Unit", width: isMobile ? 140 : 160, minWidth: 120,
            cellRenderer: (params) => (
                <Select options={unitOptions} value={unitOptions.find(o => o.value === params.data.Unit) || null}
                    onChange={opt => params.node.setDataValue("Unit", opt ? opt.value : '')}
                    styles={gridCellSelectStyles} isClearable isSearchable placeholder="Unit..." menuPortalTarget={document.body} menuPosition="fixed" />
            ),
            cellStyle: { backgroundColor: '#fff3cd', padding: '2px' }
        },
        {
            field: "pur_unit", headerName: "Purchase Unit", width: isMobile ? 140 : 160, minWidth: 120,
            cellRenderer: (params) => (
                <Select options={unitOptions} value={unitOptions.find(o => o.value === params.data.pur_unit) || null}
                    onChange={opt => params.node.setDataValue("pur_unit", opt ? opt.value : '')}
                    styles={gridCellSelectStyles} isClearable isSearchable placeholder="Unit..." menuPortalTarget={document.body} menuPosition="fixed" />
            ),
            cellStyle: { backgroundColor: '#fff3cd', padding: '2px' }
        },
        {
            field: "make", headerName: "Make", width: isMobile ? 140 : 160, minWidth: 120,
            cellRenderer: (params) => (
                <Select options={makeOptions} value={makeOptions.find(o => o.value === params.data.make) || null}
                    onChange={opt => params.node.setDataValue("make", opt ? opt.value : '')}
                    styles={gridCellSelectStyles} isClearable isSearchable placeholder="Make..." menuPortalTarget={document.body} menuPosition="fixed" />
            ),
            cellStyle: { backgroundColor: '#fff3cd', padding: '2px' }
        },
        { field: "rate", headerName: "Rate", width: isMobile ? 100 : 120, minWidth: 80, cellRenderer: RateCellRenderer, cellStyle: { backgroundColor: '#fff3cd', fontSize: '11px' } },
        {
            field: "weight", headerName: "Weight", width: isMobile ? 100 : 120, minWidth: 80,
            cellRenderer: (params) => (
                <input type="number" value={params.data.weight || ''} onChange={e => params.node.setDataValue("weight", e.target.value)}
                    style={{ width:'100%', height:'100%', border:'none', backgroundColor:'#fff3cd', fontSize:'11px', textAlign:'center', padding:0 }} />
            ),
            cellStyle: { backgroundColor: '#fff3cd', fontSize: '11px', padding: 0 }
        },
        {
            field: "hsn", headerName: "HSN", width: isMobile ? 130 : 150, minWidth: 120,
            cellRenderer: (params) => (
                <Select options={hsnOptions} value={hsnOptions.find(o => String(o.value) === String(params.data.hsn)) || null}
                    onChange={opt => params.node.setDataValue("hsn", opt ? opt.value : '')}
                    styles={gridCellSelectStyles} isClearable isSearchable placeholder="HSN..." menuPortalTarget={document.body} menuPosition="fixed" />
            ),
            cellStyle: { backgroundColor: '#fff3cd', padding: '2px' }
        },
        {
            field: "gst", headerName: "GST", width: isMobile ? 110 : 130, minWidth: 100,
            cellRenderer: (params) => (
                <Select options={gstOptions} value={gstOptions.find(o => o.value === String(params.data.gst)) || null}
                    onChange={opt => params.node.setDataValue("gst", opt ? opt.value : '')}
                    styles={gridCellSelectStyles} isClearable isSearchable placeholder="GST..." menuPortalTarget={document.body} menuPosition="fixed" />
            ),
            cellStyle: { backgroundColor: '#fff3cd', padding: '2px' }
        },
        {
            field: "main_material_name", headerName: "Main Material Type", width: isMobile ? 150 : 170, minWidth: 130,
            cellRenderer: (params) => {
                const opts = materialTypes.map(t => ({ value: t.main_material_name, label: t.main_material_name }));
                return (
                    <Select options={opts} value={opts.find(o => o.value === params.data.main_material_name) || null}
                        onChange={opt => params.node.setDataValue("main_material_name", opt ? opt.value : '')}
                        styles={gridCellSelectStyles} isClearable isSearchable placeholder="Type..." menuPortalTarget={document.body} menuPosition="fixed" />
                );
            },
            cellStyle: { backgroundColor: '#fff3cd', padding: '2px' }
        },
        {
            field: "category", headerName: "Material Category", width: isMobile ? 150 : 170, minWidth: 130,
            cellRenderer: (params) => (
                <Select options={categoryOptions} value={categoryOptions.find(o => o.label === params.data.category) || null}
                    onChange={opt => params.node.setDataValue("category", opt ? opt.label : '')}
                    styles={gridCellSelectStyles} isClearable isSearchable placeholder="Category..." menuPortalTarget={document.body} menuPosition="fixed" />
            ),
            cellStyle: { backgroundColor: '#fff3cd', padding: '2px' }
        },
        {
            field: "rfd", headerName: "RFD", width: isMobile ? 100 : 120, minWidth: 90,
            cellRenderer: (params) => {
                const opts = [{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }];
                return (
                    <Select options={opts} value={opts.find(o => o.value === params.data.rfd) || null}
                        onChange={opt => params.node.setDataValue("rfd", opt ? opt.value : '')}
                        styles={gridCellSelectStyles} isClearable placeholder="RFD..." menuPortalTarget={document.body} menuPosition="fixed" />
                );
            },
            cellStyle: { backgroundColor: '#fff3cd', padding: '2px' }
        },
        {
            field: "min", headerName: "Min Stock", width: isMobile ? 100 : 120, minWidth: 80,
            cellRenderer: (params) => (
                <input type="number" value={params.data.min || ''} onChange={e => params.node.setDataValue("min", e.target.value)}
                    style={{ width:'100%', height:'100%', border:'none', backgroundColor:'#fff3cd', fontSize:'11px', textAlign:'right', padding:0 }} />
            ),
            cellStyle: { backgroundColor: '#fff3cd', fontSize: '11px', padding: 0 }
        },
        {
            field: "max", headerName: "Max Stock", width: isMobile ? 100 : 120, minWidth: 80,
            cellRenderer: (params) => (
                <input type="number" value={params.data.max || ''} onChange={e => params.node.setDataValue("max", e.target.value)}
                    style={{ width:'100%', height:'100%', border:'none', backgroundColor:'#fff3cd', fontSize:'11px', textAlign:'right', padding:0 }} />
            ),
            cellStyle: { backgroundColor: '#fff3cd', fontSize: '11px', padding: 0 }
        },
        {
            field: "reorder", headerName: "Reorder", width: isMobile ? 100 : 120, minWidth: 80,
            cellRenderer: (params) => (
                <input type="number" value={params.data.reorder || ''} onChange={e => params.node.setDataValue("reorder", e.target.value)}
                    style={{ width:'100%', height:'100%', border:'none', backgroundColor:'#fff3cd', fontSize:'11px', textAlign:'right', padding:0 }} />
            ),
            cellStyle: { backgroundColor: '#fff3cd', fontSize: '11px', padding: 0 }
        },
        {
            field: "leadTime", headerName: "Lead Time", width: isMobile ? 100 : 120, minWidth: 80,
            cellRenderer: (params) => (
                <input type="number" value={params.data.leadTime || ''} onChange={e => params.node.setDataValue("leadTime", e.target.value)}
                    style={{ width:'100%', height:'100%', border:'none', backgroundColor:'#fff3cd', fontSize:'11px', textAlign:'center', padding:0 }} />
            ),
            cellStyle: { backgroundColor: '#fff3cd', fontSize: '11px', padding: 0 }
        },
        {
            field: "SqFt", headerName: "Sq Ft", width: isMobile ? 100 : 120, minWidth: 80,
            cellRenderer: (params) => (
                <input type="number" value={params.data.Sqft || ''} onChange={e => params.node.setDataValue("Sqft", e.target.value)}
                    style={{ width:'100%', height:'100%', border:'none', backgroundColor:'#fff3cd', fontSize:'11px', textAlign:'center', padding:0 }} />
            ),
            cellStyle: { backgroundColor: '#fff3cd', fontSize: '11px', padding: 0 }
        },
        {
            field: "shmrate", headerName: "Shm Rate", width: isMobile ? 100 : 120, minWidth: 80,
            cellRenderer: (params) => (
                <input type="number" value={params.data.shmrate || ''} onChange={e => params.node.setDataValue("shmrate", e.target.value)}
                    style={{ width:'100%', height:'100%', border:'none', backgroundColor:'#fff3cd', fontSize:'11px', textAlign:'center', padding:0 }} />
            ),
            cellStyle: { backgroundColor: '#fff3cd', fontSize: '11px', padding: 0 }
        },
        {
            field: "action", headerName: "Action", width: 100, minWidth: 80, pinned: 'right', resizable: true, sortable: false, filter: false,
            cellRenderer: (params) => (
                <div style={{ display:'flex', alignItems:'center', height:'100%', justifyContent:'center' }}>
                    <button onClick={() => saveEditedRowData(params.data)}
                        style={{ background:'linear-gradient(135deg,#007bff 0%,#0056b3 100%)', color:'white', border:'none', borderRadius:'4px', padding:'5px 12px', fontSize:'11px', fontWeight:'600', cursor:'pointer', boxShadow:'0 2px 4px rgba(0,123,255,.3)' }}>
                        💾 Save
                    </button>
                </div>
            ),
            cellStyle: { textAlign: 'center', backgroundColor: '#f8f9fa' }
        }
    ], [isMobile, materialComponentOptions, unitOptions, makeOptions, hsnOptions, gstOptions, materialTypes, categoryOptions]);

    const unassignedColumnDefs = useMemo(() => [
        { headerName: "Sr No", field: "count", width: isMobile ? 70 : 90, minWidth: 60, pinned: 'left', cellStyle: { fontWeight: 'bold', textAlign: 'center' } },
        { field: "id", headerName: "Material ID", width: isMobile ? 100 : 120, minWidth: 90, pinned: 'left', checkboxSelection: true, headerCheckboxSelection: true, cellStyle: { fontWeight: '600', color: '#007bff' } },
        { field: "material_description", headerName: "Material Description", width: isMobile ? 200 : 350, minWidth: 180, flex: 1, cellStyle: { fontWeight: '500' } },
        {
            field: "main_material_name", headerName: "Main Material", width: isMobile ? 120 : 150, minWidth: 100,
            cellStyle: (params) => ({ backgroundColor: params.value === 'UNMATCH' ? '#dc3545' : '#6c757d', color: 'white', fontWeight: '600', textAlign: 'center', padding: '4px 8px', borderRadius: '4px' })
        },
        { field: "rate", headerName: "Rate", width: isMobile ? 100 : 120, minWidth: 80, cellStyle: { textAlign: 'right', fontWeight: 'bold' }, valueFormatter: p => p.value ? `₹${parseFloat(p.value).toFixed(2)}` : '-' },
        { field: "hsn", headerName: "HSN", width: isMobile ? 100 : 120, minWidth: 80, cellStyle: { textAlign: 'center' } },
        { field: "gst", headerName: "GST", width: isMobile ? 80 : 100, minWidth: 70, cellStyle: { textAlign: 'center' }, valueFormatter: p => p.value ? `${p.value}%` : '-' }
    ], [isMobile]);

    const viewMaterialColumnDefs = useMemo(() => [
        { headerName: "Sr No", valueGetter: p => p.node ? p.node.rowIndex + 1 : '', width: isMobile ? 70 : 90, minWidth: 60, pinned: 'left', cellStyle: { fontWeight: 'bold', textAlign: 'center' } },
        { field: "material_id", headerName: "Material ID", width: isMobile ? 100 : 120, minWidth: 90, pinned: 'left', checkboxSelection: true, headerCheckboxSelection: true, cellStyle: { fontWeight: '600', color: '#007bff' } },
        { field: "description", headerName: "Description", width: isMobile ? 200 : 350, minWidth: 180, flex: 1, cellStyle: { fontWeight: '500' } },
        {
            field: "main_material_name", headerName: "Main Material", width: isMobile ? 120 : 150, minWidth: 100,
            cellStyle: (params) => {
                const v = (params.value || '').trim();
                const bg = v === 'RAW' ? '#007bff' : v === 'PACKING MATERIAL' ? '#28a745' : v === 'CONSUMABLES' ? '#ffc107' : v === 'HARDWARE' ? '#17a2b8' : v === 'DRIVE ITEMS' ? '#dc3545' : '#6c757d';
                return { backgroundColor: bg, color: 'white', fontWeight: '600', textAlign: 'center', padding: '4px 8px', borderRadius: '4px' };
            }
        },
        { field: "initial", headerName: "Initial", width: isMobile ? 100 : 120, minWidth: 80, cellStyle: { textAlign: 'center', fontWeight: '600' } },
        { field: "unit", headerName: "Unit", width: isMobile ? 80 : 100, minWidth: 70, cellStyle: { textAlign: 'center' } },
        {
            field: "stock", headerName: "Stock", width: isMobile ? 100 : 120, minWidth: 80,
            cellStyle: p => ({ textAlign: 'right', fontWeight: 'bold', color: parseFloat(p.value) < 0 ? '#dc3545' : '#28a745' }),
            valueFormatter: p => p.value ? parseFloat(p.value).toFixed(2) : '0.00'
        },
        { field: "rate", headerName: "Rate", width: isMobile ? 100 : 120, minWidth: 80, cellStyle: { textAlign: 'right', fontWeight: 'bold' }, valueFormatter: p => p.value ? `₹${parseFloat(p.value).toFixed(2)}` : '-' },
        { field: "MaterialCatg", headerName: "Category", width: isMobile ? 120 : 150, minWidth: 100, cellStyle: { textAlign: 'center' } },
        { field: "MinStock", headerName: "Min Stock", width: isMobile ? 100 : 120, minWidth: 80, cellStyle: { textAlign: 'right' } },
        { field: "MaxStock", headerName: "Max Stock", width: isMobile ? 100 : 120, minWidth: 80, cellStyle: { textAlign: 'right' } }
    ], [isMobile]);

    const defaultColDef = useMemo(() => ({
        resizable: true, sortable: true, filter: true, floatingFilter: !isMobile
    }), [isMobile]);

    const showSpecifications = materialType && materialComponent;
    const showStockFields = maintainStock === 'yes';

    if (loading) {
        return (
            <div style={{ minHeight:'100vh', backgroundColor: themeStyles.backgroundColor, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <div style={{ textAlign:'center', color: themeStyles.color }}>
                    <div style={{ display:'inline-block', width:'50px', height:'50px', border:'5px solid rgba(239,68,68,.2)', borderTopColor:'#ef4444', borderRadius:'50%', animation:'spin .8s linear infinite' }}></div>
                    <div style={{ marginTop:'20px', fontSize:'16px', fontWeight:'600' }}>Loading...</div>
                </div>
                <style>{`@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>
            </div>
        );
    }

    // ─── Shared input style ───────────────────────────────────────────────────
    const inputStyle = { width:'100%', padding:'10px 12px', border:`2px solid ${themeStyles.inputBorder}`, borderRadius:'6px', backgroundColor: themeStyles.inputBg, color: themeStyles.inputColor, fontSize:'13px', outline:'none' };

    return (
        <div style={{ minHeight:'100vh', backgroundColor: themeStyles.backgroundColor, color: themeStyles.color, padding:0, margin:0 }}>
            <style>{`@keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}`}</style>
            <div style={{ maxWidth:'100%', margin:'0 auto', padding:0 }}>
                <div style={{ backgroundColor: themeStyles.cardBg, border:`1px solid ${themeStyles.borderColor}`, borderRadius:0, overflow:'hidden', boxShadow: theme==='dark'?'0 10px 25px -5px rgba(0,0,0,.5)':'0 4px 15px -2px rgba(0,0,0,.1)' }}>

                    {/* Header / Tabs */}
                    <div style={{ display:'flex', borderBottom:`2px solid ${themeStyles.borderColor}`, backgroundColor: themeStyles.cardBg, justifyContent:'space-between', alignItems:'center', padding:'0 16px', flexWrap:'wrap', gap:'10px' }}>
                        <div style={{ display:'flex', gap:'2px', overflowX:'auto', flex:'1', minWidth:0 }}>
                            {tabs.map(tab => (
                                <button key={tab} onClick={() => setActiveTab(tab)}
                                    style={{ padding:'12px 20px', border:'none', background: activeTab===tab ? themeStyles.buttonBg : 'transparent', color: activeTab===tab ? '#fff' : themeStyles.labelColor, fontSize:'13px', fontWeight: activeTab===tab ? '600' : '500', cursor:'pointer', transition:'all .2s ease', outline:'none', borderRadius:'6px 6px 0 0', whiteSpace:'nowrap' }}>
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <button onClick={toggleTheme}
                            style={{ padding:'8px 12px', backgroundColor: themeStyles.inputBg, color: themeStyles.color, border:`2px solid ${themeStyles.inputBorder}`, borderRadius:'6px', fontSize:'16px', cursor:'pointer' }}>
                            {theme === 'light' ? '🌙' : '☀️'}
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div style={{ padding:'24px' }}>

                        {/* ── Add Material Code ── */}
                        {activeTab === 'Add Material Code' && (
                            <form onSubmit={handleSubmit}>
                                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:'20px', marginBottom:'24px' }}>
                                    <div>
                                        <label style={labelStyle}>Select Material Type</label>
                                        <Select options={materialTypeOptions} value={materialType} onChange={setMaterialType}
                                            styles={selectStyles} isClearable isSearchable placeholder="Search & Select Type..." menuPortalTarget={document.body} menuPosition="fixed" />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Select Material Component</label>
                                        <Select options={materialComponentOptions} value={materialComponent} onChange={setMaterialComponent}
                                            isDisabled={!materialType || loadingComponents}
                                            isLoading={loadingComponents}
                                            styles={selectStyles} isClearable isSearchable placeholder={loadingComponents ? 'Loading...' : 'Search & Select Component...'}
                                            menuPortalTarget={document.body} menuPosition="fixed" />
                                    </div>
                                </div>

                                {showSpecifications && (
                                    <>
                                        <div style={{ borderTop:`2px solid ${themeStyles.borderColor}`, paddingTop:'20px', marginBottom:'20px' }}>
                                            <h3 style={{ fontSize:'15px', fontWeight:'700', marginBottom:'16px', color: themeStyles.color }}>Specification</h3>
                                            {specifications.map((spec, index) => (
                                                <div key={index} style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'12px' }}>
                                                    <input type="text" value={spec} onChange={e => { const s=[...specifications]; s[index]=e.target.value; setSpecifications(s); }}
                                                        placeholder={index===0?'Component Name':'Specification'}
                                                        style={{ ...inputStyle, flex:'1' }} />
                                                    <button type="button" style={{ padding:'10px 24px', backgroundColor: themeStyles.buttonBg, color:'#fff', border:'none', borderRadius:'6px', fontSize:'13px', fontWeight:'600', cursor:'pointer', whiteSpace:'nowrap' }}>
                                                        Add Material
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        <div style={{ marginBottom:'20px' }}>
                                            <label style={labelStyle}>Material Description</label>
                                            <input type="text" value={formData.materialDescription} onChange={e => setFormData({...formData, materialDescription: e.target.value})} style={inputStyle} />
                                        </div>

                                        <div style={{ display:'flex', alignItems:'center', gap:'20px', marginBottom:'20px', flexWrap:'wrap' }}>
                                            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                                                <input type="checkbox" checked={formData.weightRequired} onChange={e => setFormData({...formData, weightRequired: e.target.checked})}
                                                    style={{ width:'18px', height:'18px', cursor:'pointer', accentColor:'#ef4444' }} />
                                                <label style={{ fontSize:'13px', fontWeight:'500', color: themeStyles.color }}>Is Weight in KG required</label>
                                            </div>
                                            {formData.weightRequired && (
                                                <input type="text" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})}
                                                    placeholder="Enter weight" style={{ ...inputStyle, width:'150px' }} />
                                            )}
                                        </div>

                                        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'20px', marginBottom:'20px' }}>
                                            <div>
                                                <label style={labelStyle}>Stock Unit</label>
                                                <Select options={unitOptions} value={formData.stockUnit} onChange={opt => setFormData({...formData, stockUnit: opt})}
                                                    styles={selectStyles} isClearable isSearchable placeholder="Search Unit..." menuPortalTarget={document.body} menuPosition="fixed" />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Purchase Unit</label>
                                                <Select options={unitOptions} value={formData.purchaseUnit} onChange={opt => setFormData({...formData, purchaseUnit: opt})}
                                                    styles={selectStyles} isClearable isSearchable placeholder="Search Unit..." menuPortalTarget={document.body} menuPosition="fixed" />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Material Category</label>
                                                <Select options={categoryOptions} value={formData.materialCategory} onChange={opt => setFormData({...formData, materialCategory: opt})}
                                                    styles={selectStyles} isClearable isSearchable placeholder="Search Category..." menuPortalTarget={document.body} menuPosition="fixed" />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Make</label>
                                                <Select options={makeOptions} value={formData.make} onChange={opt => setFormData({...formData, make: opt})}
                                                    styles={selectStyles} isClearable isSearchable placeholder="Search Make..." menuPortalTarget={document.body} menuPosition="fixed" />
                                            </div>
                                        </div>

                                        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:'20px', marginBottom:'20px' }}>
                                            <div>
                                                <label style={labelStyle}>Supplier</label>
                                                <Select options={supplierOptions} value={formData.supplier} onChange={opt => setFormData({...formData, supplier: opt})}
                                                    styles={selectStyles} isClearable isSearchable placeholder="Search Supplier..." menuPortalTarget={document.body} menuPosition="fixed" />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Vendor</label>
                                                <Select options={vendorOptions} value={formData.vendor} onChange={opt => setFormData({...formData, vendor: opt})}
                                                    styles={selectStyles} isClearable isSearchable placeholder="Search Vendor..." menuPortalTarget={document.body} menuPosition="fixed" />
                                            </div>
                                        </div>

                                        <div style={{ marginBottom:'20px', padding:'16px', backgroundColor: theme==='dark'?'#334155':'#f8fafc', borderRadius:'8px', border:`1px solid ${themeStyles.borderColor}` }}>
                                            <label style={{ ...labelStyle, marginBottom:'12px' }}>Do you want to maintain a stock</label>
                                            <div style={{ display:'flex', gap:'24px' }}>
                                                {['yes','no'].map(v => (
                                                    <label key={v} style={{ display:'flex', alignItems:'center', gap:'8px', cursor:'pointer' }}>
                                                        <input type="radio" name="maintainStock" value={v} checked={maintainStock===v} onChange={e => setMaintainStock(e.target.value)}
                                                            style={{ width:'18px', height:'18px', cursor:'pointer', accentColor:'#ef4444' }} />
                                                        <span style={{ fontSize:'13px', fontWeight:'500', color: themeStyles.color }}>{v.charAt(0).toUpperCase()+v.slice(1)}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {showStockFields && (
                                            <div style={{ borderTop:`2px solid ${themeStyles.borderColor}`, paddingTop:'20px', marginBottom:'20px' }}>
                                                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'20px' }}>
                                                    {[['minStockQty','Min Stock Qty'],['maxStockQty','Max Stock Qty'],['reorderQty','Reorder Qty'],['rate','Rate'],['leadTime','Lead Time']].map(([key, lbl]) => (
                                                        <div key={key}>
                                                            <label style={labelStyle}>{lbl}</label>
                                                            <input type="number" value={formData[key]} onChange={e => setFormData({...formData, [key]: e.target.value})} style={inputStyle} />
                                                        </div>
                                                    ))}
                                                    <div>
                                                        <label style={labelStyle}>HSN</label>
                                                        <Select options={hsnOptions} value={formData.hsn} onChange={opt => setFormData({...formData, hsn: opt})}
                                                            styles={selectStyles} isClearable isSearchable placeholder="Search HSN..." menuPortalTarget={document.body} menuPosition="fixed" />
                                                    </div>
                                                    <div>
                                                        <label style={labelStyle}>GST</label>
                                                        <Select options={gstOptions} value={formData.gst} onChange={opt => setFormData({...formData, gst: opt})}
                                                            styles={selectStyles} isClearable isSearchable placeholder="Select GST..." menuPortalTarget={document.body} menuPosition="fixed" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div style={{ display:'flex', justifyContent:'center', marginTop:'24px', paddingTop:'20px', borderTop:`2px solid ${themeStyles.borderColor}` }}>
                                            <button type="submit" disabled={submitting}
                                                style={{ padding:'12px 48px', backgroundColor: themeStyles.buttonBg, color:'#fff', border:'none', borderRadius:'6px', fontSize:'14px', fontWeight:'600', cursor: submitting?'not-allowed':'pointer', opacity: submitting?0.6:1, boxShadow:'0 2px 8px rgba(239,68,68,.3)' }}>
                                                {submitting ? 'Submitting...' : 'Submit'}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </form>
                        )}

                        {/* ── Edit Material Category ── */}
                        {activeTab === 'Edit Material Category' && (
                            <div>
                                <h3 style={{ fontSize:'18px', fontWeight:'700', marginBottom:'24px', color: themeStyles.color }}>Edit Material Category</h3>
                                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:'20px', marginBottom:'24px' }}>
                                    <div>
                                        <label style={labelStyle}>Select Material Type</label>
                                        <Select options={materialTypeOptions} value={editMaterialType} onChange={setEditMaterialType}
                                            styles={selectStyles} isClearable isSearchable placeholder="Search & Select Type..." menuPortalTarget={document.body} menuPosition="fixed" />
                                    </div>
                                    {editMaterialType && (
                                        <div>
                                            <label style={labelStyle}>Select Material Component</label>
                                            <Select options={editComponentOptions} value={editMaterialComponent} onChange={setEditMaterialComponent}
                                                isDisabled={loadingEditComponents} isLoading={loadingEditComponents}
                                                styles={selectStyles} isClearable isSearchable placeholder={loadingEditComponents ? 'Loading...' : 'Search & Select Component...'}
                                                menuPortalTarget={document.body} menuPosition="fixed" />
                                        </div>
                                    )}
                                </div>

                                {editMaterialType && editMaterialComponent && (
                                    <div style={{ marginTop:'30px' }}>
                                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px', flexWrap:'wrap', gap:'10px' }}>
                                            <h4 style={{ margin:0, fontSize:'16px', fontWeight:'600' }}>📋 Materials ({editMaterialData.length})</h4>
                                            <div style={{ display:'flex', gap:'10px' }}>
                                                <button onClick={() => fetchEditMaterialData(editMaterialType.value, editMaterialComponent.value)} disabled={loadingEditGrid}
                                                    style={{ padding:'8px 16px', backgroundColor:'#17a2b8', color:'white', border:'none', borderRadius:'5px', cursor: loadingEditGrid?'not-allowed':'pointer', fontSize:'14px', fontWeight:'600', opacity: loadingEditGrid?0.6:1 }}>
                                                    🔄 Refresh
                                                </button>
                                                <button onClick={() => downloadExcel(editMaterialGridRef, 'Edit_Material_Category')}
                                                    style={{ padding:'8px 16px', backgroundColor:'#28a745', color:'white', border:'none', borderRadius:'5px', cursor:'pointer', fontSize:'14px', fontWeight:'600' }}>
                                                    📥 Export
                                                </button>
                                            </div>
                                        </div>
                                        {loadingEditGrid ? (
                                            <div style={{ textAlign:'center', padding:'50px' }}>
                                                <div style={{ border:'4px solid #f3f3f3', borderTop:'4px solid #007bff', borderRadius:'50%', width:'50px', height:'50px', animation:'spin 1s linear infinite', margin:'0 auto' }}></div>
                                                <p style={{ marginTop:'20px', color: themeStyles.color }}>Loading data...</p>
                                            </div>
                                        ) : (
                                            <div className="ag-theme-alpine" style={{ height:'600px', width:'100%', ...(theme==='dark' && { '--ag-background-color':'#212529', '--ag-header-background-color':'#343a40', '--ag-odd-row-background-color':'#2c3034', '--ag-foreground-color':'#f8f9fa', '--ag-border-color':'#495057' }) }}>
                                                <AgGridReact ref={editMaterialGridRef} rowData={editMaterialData} columnDefs={editMaterialColumnDefs}
                                                    defaultColDef={defaultColDef} pagination={true} paginationPageSize={20} rowSelection="multiple" animateRows={true} />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── Add Material Initial ── */}
                        {activeTab === 'Add Material Initial' && (
                            <div>
                                <h3 style={{ fontSize:'18px', fontWeight:'700', marginBottom:'24px', color: themeStyles.color }}>Add Material Initial</h3>
                                <div style={{ maxWidth:'600px', margin:'0 auto', padding:'30px', backgroundColor: theme==='dark'?'#334155':'#f8fafc', borderRadius:'12px', border:`1px solid ${themeStyles.borderColor}`, boxShadow: theme==='dark'?'0 4px 15px rgba(0,0,0,.3)':'0 4px 15px rgba(0,0,0,.1)' }}>
                                    <div style={{ marginBottom:'24px' }}>
                                        <label style={labelStyle}>Select Material Type <span style={{ color:'#ef4444' }}>*</span></label>
                                        <Select options={materialTypeOptions} value={initialMaterialType} onChange={setInitialMaterialType}
                                            styles={selectStyles} isClearable isSearchable placeholder="Search & Select Type..." menuPortalTarget={document.body} menuPosition="fixed" />
                                    </div>
                                    <div style={{ marginBottom:'24px' }}>
                                        <label style={labelStyle}>Material Initial Name <span style={{ color:'#ef4444' }}>*</span></label>
                                        <input type="text" value={initialMaterialName} onChange={e => setInitialMaterialName(e.target.value)}
                                            placeholder="Enter material initial name (e.g., STEEL, COPPER)"
                                            style={{ ...inputStyle, padding:'12px 16px', fontSize:'14px' }} />
                                    </div>
                                    <div style={{ display:'flex', gap:'12px', justifyContent:'center', marginTop:'32px' }}>
                                        <button onClick={handleAddMaterialInitial} disabled={submitting}
                                            style={{ padding:'12px 40px', backgroundColor: submitting?'#ccc':themeStyles.buttonBg, color:'#fff', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:'600', cursor: submitting?'not-allowed':'pointer', boxShadow:'0 4px 12px rgba(239,68,68,.3)', opacity: submitting?0.6:1 }}>
                                            {submitting ? '⏳ Adding...' : '✓ Add Initial'}
                                        </button>
                                        <button onClick={() => { setInitialMaterialType(null); setInitialMaterialName(''); }}
                                            style={{ padding:'12px 40px', backgroundColor:'transparent', color: themeStyles.color, border:`2px solid ${themeStyles.inputBorder}`, borderRadius:'8px', fontSize:'14px', fontWeight:'600', cursor:'pointer' }}>
                                            ✕ Reset
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Unassigned Material ── */}
                        {activeTab === 'Unassigned Material' && (
                            <div>
                                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px', flexWrap:'wrap', gap:'10px' }}>
                                    <h4 style={{ margin:0, fontSize:'18px', fontWeight:'600' }}>📋 Unassigned Materials ({unassignedData.length})</h4>
                                    <div style={{ display:'flex', gap:'10px' }}>
                                        <button onClick={fetchUnassignedMaterial} disabled={gridLoading}
                                            style={{ padding:'8px 16px', backgroundColor:'#17a2b8', color:'white', border:'none', borderRadius:'5px', cursor: gridLoading?'not-allowed':'pointer', fontSize:'14px', fontWeight:'600', opacity: gridLoading?0.6:1 }}>
                                            🔄 Refresh
                                        </button>
                                        <button onClick={() => downloadExcel(unassignedGridRef, 'Unassigned_Materials')}
                                            style={{ padding:'8px 16px', backgroundColor:'#28a745', color:'white', border:'none', borderRadius:'5px', cursor:'pointer', fontSize:'14px', fontWeight:'600' }}>
                                            📥 Export
                                        </button>
                                    </div>
                                </div>
                                {gridLoading ? (
                                    <div style={{ textAlign:'center', padding:'50px' }}>
                                        <div style={{ border:'4px solid #f3f3f3', borderTop:'4px solid #007bff', borderRadius:'50%', width:'50px', height:'50px', animation:'spin 1s linear infinite', margin:'0 auto' }}></div>
                                        <p style={{ marginTop:'20px' }}>Loading data...</p>
                                    </div>
                                ) : (
                                    <div className="ag-theme-alpine" style={{ height:'600px', width:'100%', ...(theme==='dark' && { '--ag-background-color':'#212529', '--ag-header-background-color':'#343a40', '--ag-odd-row-background-color':'#2c3034', '--ag-foreground-color':'#f8f9fa', '--ag-border-color':'#495057' }) }}>
                                        <AgGridReact ref={unassignedGridRef} rowData={unassignedData} columnDefs={unassignedColumnDefs}
                                            defaultColDef={defaultColDef} pagination={true} paginationPageSize={20} rowSelection="multiple" animateRows={true} />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── View Material Stock ── */}
                        {activeTab === 'View Material Stock' && (
                            <div>
                                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px', flexWrap:'wrap', gap:'10px' }}>
                                    <h4 style={{ margin:0, fontSize:'18px', fontWeight:'600' }}>📦 Material Stock ({viewMaterialData.length})</h4>
                                    <div style={{ display:'flex', gap:'10px' }}>
                                        <button onClick={fetchViewMaterial} disabled={gridLoading}
                                            style={{ padding:'8px 16px', backgroundColor:'#17a2b8', color:'white', border:'none', borderRadius:'5px', cursor: gridLoading?'not-allowed':'pointer', fontSize:'14px', fontWeight:'600', opacity: gridLoading?0.6:1 }}>
                                            🔄 Refresh
                                        </button>
                                        <button onClick={() => downloadExcel(viewMaterialGridRef, 'Material_Stock')}
                                            style={{ padding:'8px 16px', backgroundColor:'#28a745', color:'white', border:'none', borderRadius:'5px', cursor:'pointer', fontSize:'14px', fontWeight:'600' }}>
                                            📥 Export
                                        </button>
                                    </div>
                                </div>
                                {gridLoading ? (
                                    <div style={{ textAlign:'center', padding:'50px' }}>
                                        <div style={{ border:'4px solid #f3f3f3', borderTop:'4px solid #007bff', borderRadius:'50%', width:'50px', height:'50px', animation:'spin 1s linear infinite', margin:'0 auto' }}></div>
                                        <p style={{ marginTop:'20px' }}>Loading data...</p>
                                    </div>
                                ) : (
                                    <div className="ag-theme-alpine" style={{ height:'600px', width:'100%', ...(theme==='dark' && { '--ag-background-color':'#212529', '--ag-header-background-color':'#343a40', '--ag-odd-row-background-color':'#2c3034', '--ag-foreground-color':'#f8f9fa', '--ag-border-color':'#495057' }) }}>
                                        <AgGridReact ref={viewMaterialGridRef} rowData={viewMaterialData} columnDefs={viewMaterialColumnDefs}
                                            defaultColDef={defaultColDef} pagination={true} paginationPageSize={20} rowSelection="multiple" animateRows={true} />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── Unmatch Material ── */}
                        {activeTab === 'Unmatch Material' && (
                            <div style={{ textAlign:'center', padding:'100px 20px', color: themeStyles.labelColor }}>
                                <div style={{ fontSize:'64px', marginBottom:'20px' }}>🔧</div>
                                <h3 style={{ marginBottom:'10px', color: themeStyles.color }}>Under Development</h3>
                                <p>The "Unmatch Material" functionality is coming soon!</p>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default MaterialManagerForm;