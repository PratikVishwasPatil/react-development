import React, { useEffect, useMemo, useState, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
        const match = path.match(/\/excel-list\/details\/(\d+)/);
        return match ? match[1] : '5507';
    };

    const [fileId] = useState(getFileIdFromUrl());
    const [activeTab, setActiveTab] = useState('Metal');
    const [theme, setTheme] = useState('light');
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [loading, setLoading] = useState(false);
    const [fileName, setFileName] = useState('');
    const [revision, setRevision] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);

    // Form data for Metal tab
    const [metalFormData, setMetalFormData] = useState({
        packingMaterial: '', cw: '', ch: '', hl: '', qty: '', w: '', h: '', qty1: '', wt: ''
    });

    // Form data for Foundation tab
    const [foundationFormData, setFoundationFormData] = useState({
        specification: '', moc: '', size: '', l: '', qty: '', mtrs: '', sqft: '', wtMtr: '', wt: ''
    });

    // Form data for Fabrication tab
    const [fabricationFormData, setFabricationFormData] = useState({
        specification: '', col2: '', inMm: '', qty: '', mtrs: '', sqft: '', color: '', weight: ''
    });

    // Form data for Assembly tab
    const [assemblyFormData, setAssemblyFormData] = useState({
        assemblyMaterial: '', col2: '', col3: '', col4: '', qty: '', col6: '', col7: ''
    });

    // Grid data
    const [metalRowData, setMetalRowData] = useState([]);
    const [foundationRowData, setFoundationRowData] = useState([]);
    const [fabricationRowData, setFabricationRowData] = useState([]);
    const [assemblyRowData, setAssemblyRowData] = useState([]);

    const gridRef = useRef();
    const API_BASE_URL = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api";

    const tabs = ['SMetal', 'Foundation', 'Fabrication', 'Assembly'];

    // Fetch Metal data
    const fetchMetalData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/smetalswapApi.php?file=${fileId}`);
            const result = await response.json();

            if (result.status === "success" && Array.isArray(result.data)) {
                const mappedData = result.data.map((item, index) => ({
                    index: item.id,
                    dbId: item.DT_RowId,
                    packingMaterial: item.pm || '',
                    cw: item.cw || '0',
                    ch: item.ch || '0',
                    hl: item.hl || '0',
                    qty: item.qty || '0',
                    w: item.mm || '0',
                    h: item.h || '0',
                    qty1: item.qty1 || '0',
                    sqm: item.sqm || '',
                    sqft: item.sqf || '',
                    colpc: item.col || '',
                    col11: item.col11 || '',
                    matlReqmt: item.matl || '',
                    col13: item.col13 || '',
                    col14: item.col14 || '',
                    wt: item.wt || '0',
                    updatedBy: item.updatedBy || '-'
                }));
                setMetalRowData(mappedData);
                setFileName(result.fileName || `File-${fileId}`);
                setRevision(result.revision || '0');
            }
        } catch (error) {
            console.error("Error fetching metal data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Foundation data
    const fetchFoundationData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/foundswapApi.php?file=${fileId}`);
            const result = await response.json();

            if (result.status === "success" && Array.isArray(result.data)) {
                const mappedData = result.data.map((item, index) => ({
                    index: item.id,
                    dbId: item.DT_RowId,
                    specification: item.spe || '',
                    moc: item.moc || '',
                    size: item.size || '',
                    l: item.l || '',
                    qty: item.qty || '0',
                    mtrs: item.mtrs || '',
                    sqft: item.sqft || '',
                    wtMtr: item.wtMtr || '',
                    wt: item.wt || '0',
                    updatedBy: item.updatedBy || '-'
                }));
                setFoundationRowData(mappedData);
                setFileName(result.fileName || `File-${fileId}`);
                setRevision(result.revision || '0');
            }
        } catch (error) {
            console.error("Error fetching foundation data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Fabrication data
    const fetchFabricationData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/fabswapApi.php?file=${fileId}`);
            const result = await response.json();

            if (result.status === "success" && Array.isArray(result.data)) {
                const mappedData = result.data.map((item, index) => ({
                     index: item.id,
                    dbId: item.DT_RowId,
                    specification: item.spe || '',
                    col2: item.col2 || '',
                    inMm: item.inmm || '',
                    qty: item.qty || '0',
                    mtrs: item.mtrs || '',
                    sqft: item.sqft || '',
                    color: item.color || '',
                    weight: item.weight || '0',
                    updatedBy: item.updatedBy || '-'
                }));
                setFabricationRowData(mappedData);
                setFileName(result.fileName || `File-${fileId}`);
                setRevision(result.revision || '0');
            }
        } catch (error) {
            console.error("Error fetching fabrication data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Assembly data
    const fetchAssemblyData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/assemswapApi.php?file=${fileId}`);
            const result = await response.json();

            if (result.status === "success" && Array.isArray(result.data)) {
                const mappedData = result.data.map((item, index) => ({
                    index: item.id,
                    dbId: item.DT_RowId,
                    assemblyMaterial: item.spe || '',
                    col2: item.col2 || '',
                    col3: item.col3 || '',
                    col4: item.col4 || '',
                    qty: item.qty || '0',
                    col6: item.col6 || '',
                    col7: item.col7 || '',
                    updatedBy: item.updatedBy || '-'
                }));
                setAssemblyRowData(mappedData);
                setFileName(result.fileName || `File-${fileId}`);
                setRevision(result.revision || '0');
            }
        } catch (error) {
            console.error("Error fetching assembly data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'Metal') {
            fetchMetalData();
        } else if (activeTab === 'Foundation') {
            fetchFoundationData();
        } else if (activeTab === 'Fabrication') {
            fetchFabricationData();
        } else if (activeTab === 'Assembly') {
            fetchAssemblyData();
        }
    }, [fileId, activeTab]);

    // Editable cell renderer
    const EditableCell = (props) => {
        const { value, node, colDef } = props;
        const [inputValue, setInputValue] = React.useState(value || "");
    
        React.useEffect(() => {
            setInputValue(value || "");
        }, [value]);
    
        const handleChange = (e) => {
            const newValue = e.target.value;
            setInputValue(newValue);
            node.setDataValue(colDef.field, newValue);
        };
    
        return (
            <input
                type="text"
                value={inputValue}
                onChange={handleChange}
                style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    outline: "none",
                    padding: "8px",
                    fontSize: "13px",
                    backgroundColor: "transparent",
                    textAlign: "right"  // Added right alignment
                }}
            />
        );
    };

   const MetalActionCell = (params) => {
        const handleSave = async () => {
            try {
                const shortname = sessionStorage.getItem('shortname') || 'admin';

                console.log('params.data:', params.data);

                const payload = {
                    selectedRow: [{
                        index: params.data.index || '',
                        string: params.data.dbId || '',
                        packing_material: params.data.packingMaterial || '',
                        CW: params.data.cw || '',
                        C_H: params.data.ch || '',
                        Qty: params.data.qty || '',
                        W: params.data.w || '',
                        H: params.data.h || '',
                        Qty1: params.data.qty1 || '',
                        sq_m: params.data.sqm || '',
                        Sq_Ft: params.data.sqft || '',
                        Col_PC: params.data.colpc || '',
                        COL_11: params.data.col11 || '',
                        Matl_Reqmt: params.data.matlReqmt || '',
                        COL_13: params.data.col13 || '',
                        COL_14: params.data.col14 || '',
                        Wt: params.data.wt || '',
                        shortname: shortname
                    }]
                };

                // Debug: Log payload
                console.log('Payload:', JSON.stringify(payload, null, 2));

                const response = await fetch(`${API_BASE_URL}/smetalUpdateApi.php`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();
                console.log('Response:', result);

                const button = document.getElementById(`save-btn-${params.data.index}`);

                if (result.status === 'success') {
                    if (button) {
                        button.style.background = '#28a745';
                        button.innerHTML = '✅ Saved';
                        setTimeout(() => {
                            button.style.background = 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)';
                            button.innerHTML = '💾 Save';
                        }, 2000);
                    }
                    toast.success('Record updated successfully!');
                    await fetchMetalData();
                } else {
                    if (button) {
                        button.style.background = '#dc3545';
                        button.innerHTML = '❌ Error';
                        setTimeout(() => {
                            button.style.background = 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)';
                            button.innerHTML = '💾 Save';
                        }, 2000);
                    }
                    // alert(`Error: ${result.message}`);
                    toast.error(`Error: ${result.message}`);

                }
            } catch (error) {
                console.error('Error updating:', error);
                // alert('Error updating record');
                toast.error(`Error updating record`);


            }
        };

        return (
            <div style={{ display: 'flex', justifyContent: 'center', height: '100%', alignItems: 'center' }}>
                <button
                    id={`save-btn-${params.data.index}`}
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
                        transition: 'all 0.3s ease'
                    }}
                    title="Save Record"
                >
                    💾 Save
                </button>
            </div>
        );
    };

    // Foundation Action Cell
    const FoundationActionCell = (params) => {
        const handleSave = async () => {
            try {
                const requestData = {
                    selectedRowfound: [{
                        string: params.data.dbId,
                        index: params.data.index,
                        specification: params.data.specification,
                        MOC: params.data.moc,
                        size: params.data.size,
                        L: params.data.l,
                        Qty: params.data.qty,
                        Mtrs: params.data.mtrs,
                        sq_ft: params.data.sqft,
                        Wt_Mtr: params.data.wtMtr,
                        Wt: params.data.wt
                    }]
                };

                const response = await fetch(`${API_BASE_URL}/foundationUpdateApi.php`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestData)
                });

                const result = await response.json();
                const button = document.getElementById(`save-btn-${params.data.index}`);

                if (result.status === 'success') {
                    if (button) {
                        button.style.background = '#28a745';
                        button.innerHTML = '✅ Saved';
                        setTimeout(() => {
                            button.style.background = 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)';
                            button.innerHTML = '💾 Save';
                        }, 2000);
                    }
                    // alert('Record updated successfully!');
                    toast.success(`Record updated successfully!`);

                    await fetchFoundationData();
                } else {
                    if (button) {
                        button.style.background = '#dc3545';
                        button.innerHTML = '❌ Error';
                        setTimeout(() => {
                            button.style.background = 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)';
                            button.innerHTML = '💾 Save';
                        }, 2000);
                    }
                    // alert(`Error: ${result.message}`);
                    toast.error(`Error: ${result.message}`);

                }
            } catch (error) {
                console.error('Error updating:', error);
                // alert('Error updating record');
                toast.error('Error updating record');

            }
        };

        return (
            <div style={{ display: 'flex', justifyContent: 'center', height: '100%', alignItems: 'center' }}>
                <button
                    id={`save-btn-${params.data.index}`}
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
                        transition: 'all 0.3s ease'
                    }}
                    title="Save Record"
                >
                    💾 Save
                </button>
            </div>
        );
    };

    // Fabrication Action Cell
    const FabricationActionCell = (params) => {
        const handleSave = async () => {
            try {
                const requestData = {
                    selectedRowfab: [{
                        string: params.data.dbId,
                        index: params.data.index,
                        specification: params.data.specification,
                        COL_2: params.data.col2,
                        in_mm: params.data.inMm,
                        Qty: params.data.qty,
                        Mtrs: params.data.mtrs,
                        Sqft: params.data.sqft,
                        color: params.data.color,
                        wt: params.data.weight
                    }]
                };

                const response = await fetch(`${API_BASE_URL}/FabricationUpdateApi.php`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestData)
                });

                const result = await response.json();
                const button = document.getElementById(`save-btn-${params.data.index}`);

                if (result.status === 'success') {
                    if (button) {
                        button.style.background = '#28a745';
                        button.innerHTML = '✅ Saved';
                        setTimeout(() => {
                            button.style.background = 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)';
                            button.innerHTML = '💾 Save';
                        }, 2000);
                    }
                    // alert('Record updated successfully!');
                    toast.success(`Record updated successfully!`);

                    await fetchFabricationData();
                } else {
                    if (button) {
                        button.style.background = '#dc3545';
                        button.innerHTML = '❌ Error';
                        setTimeout(() => {
                            button.style.background = 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)';
                            button.innerHTML = '💾 Save';
                        }, 2000);
                    }
                    // alert(`Error: ${result.message}`);
                    toast.error(`Error: ${result.message}`);

                }
            } catch (error) {
                console.error('Error updating:', error);
                // alert('Error updating record');
                toast.error('Error updating record');

            }
        };

        return (
            <div style={{ display: 'flex', justifyContent: 'center', height: '100%', alignItems: 'center' }}>
                <button
                    id={`save-btn-${params.data.index}`}
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
                        transition: 'all 0.3s ease'
                    }}
                    title="Save Record"
                >
                    💾 Save
                </button>
            </div>
        );
    };

    // Assembly Action Cell
    const AssemblyActionCell = (params) => {
        const handleSave = async () => {
            try {
                const requestData = {
                    selectedRowAsse: [{
                        string: params.data.dbId,
                        index: params.data.index,
                        assembly_mtrl: params.data.assemblyMaterial,
                        COL_2: params.data.col2,
                        COL_3: params.data.col3,
                        COL_4: params.data.col4,
                        Qty: params.data.qty,
                        COL_6: params.data.col6,
                        COL_7: params.data.col7
                    }]
                };

                const response = await fetch(`${API_BASE_URL}/assemblyUpdateApi.php`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestData)
                });

                const result = await response.json();
                const button = document.getElementById(`save-btn-${params.data.index}`);

                if (result.status === 'success') {
                    if (button) {
                        button.style.background = '#28a745';
                        button.innerHTML = '✅ Saved';
                        setTimeout(() => {
                            button.style.background = 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)';
                            button.innerHTML = '💾 Save';
                        }, 2000);
                    }
                    // alert('Record updated successfully!');
                    toast.success(`Record updated successfully!`);

                    await fetchAssemblyData();
                } else {
                    if (button) {
                        button.style.background = '#dc3545';
                        button.innerHTML = '❌ Error';
                        setTimeout(() => {
                            button.style.background = 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)';
                            button.innerHTML = '💾 Save';
                        }, 2000);
                    }
                    // alert(`Error: ${result.message}`);
                    toast.error(`Error: ${result.message}`);

                }
            } catch (error) {
                console.error('Error updating:', error);
                // alert('Error updating record');
                toast.error('Error updating record');

            }
        };

        return (
            <div style={{ display: 'flex', justifyContent: 'center', height: '100%', alignItems: 'center' }}>
                <button
                    id={`save-btn-${params.data.index}`}
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
                        transition: 'all 0.3s ease'
                    }}
                    title="Save Record"
                >
                    💾 Save
                </button>
            </div>
        );
    };

    // Generic Action Cell for other tabs
    const GenericActionCell = (params) => {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', height: '100%', alignItems: 'center' }}>
                <button
                    style={{
                        background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '4px 12px',
                        fontSize: '10px',
                        cursor: 'pointer'
                    }}
                    title="Edit Record"
                >
                    ✏️ Edit
                </button>
            </div>
        );
    };

    // Column definitions for Metal
    const metalColumnDefs = useMemo(() => [
        {
        headerName: "Index",
        field: "index",
        width: 80,
        pinned: 'left',
        cellRenderer: EditableCell,  // Changed to editable
        cellStyle: { fontWeight: 'bold', textAlign: 'center', backgroundColor: '#ff8c42', color: '#000' }
    },
    {
        headerName: "DT_RowId",
        field: "dbId",
        width: 80,
        pinned: 'left',
        cellStyle: { fontWeight: 'bold', textAlign: 'center', backgroundColor: '#ff8c42', color: '#000' }
    },
        {
            headerName: "Action",
            field: "action",
            width: 100,
            pinned: 'left',
            cellRenderer: MetalActionCell,
            cellStyle: { backgroundColor: '#ff8c42' }
        },
        { headerName: "Packing Material", field: "packingMaterial", width: 200, cellRenderer: EditableCell },
        { headerName: "CW", field: "cw", width: 80, cellRenderer: EditableCell },
        { headerName: "C H", field: "ch", width: 80, cellRenderer: EditableCell },
        { headerName: "H/L", field: "hl", width: 80, cellRenderer: EditableCell },
        { headerName: "Qty", field: "qty", width: 80, cellRenderer: EditableCell },
        { headerName: "W", field: "w", width: 80, cellRenderer: EditableCell },
        { headerName: "H", field: "h", width: 80, cellRenderer: EditableCell },
        { headerName: "Qty", field: "qty1", width: 80, cellRenderer: EditableCell },
        { headerName: "Sq. m", field: "sqm", width: 100, cellRenderer: EditableCell },
        { headerName: "Sq. Ft", field: "sqft", width: 100, cellRenderer: EditableCell },
        { headerName: "Col/P-C", field: "colpc", width: 100, cellRenderer: EditableCell },
        { headerName: "COL_11", field: "col11", width: 100, cellRenderer: EditableCell },
        { headerName: "Matl. Reqmt", field: "matlReqmt", width: 120, cellRenderer: EditableCell },
        { headerName: "COL_13", field: "col13", width: 100, cellRenderer: EditableCell },
        { headerName: "COL_14", field: "col14", width: 100, cellRenderer: EditableCell },
        { headerName: "Wt.", field: "wt", width: 80, cellRenderer: EditableCell },
        { headerName: "Updated by and time", field: "updatedBy", width: 180 }
    ], []);

    // Column definitions for Foundation
    const foundationColumnDefs = useMemo(() => [
        {
            headerName: "Index",
            field: "index",
            width: 80,
            pinned: 'left',
            cellRenderer: EditableCell,  // Changed to editable
            cellStyle: { fontWeight: 'bold', textAlign: 'center', backgroundColor: '#ff8c42', color: '#000' }
        },
        {
            headerName: "DT_RowId",
            field: "dbId",
            width: 80,
            pinned: 'left',
            cellStyle: { fontWeight: 'bold', textAlign: 'center', backgroundColor: '#ff8c42', color: '#000' }
        },
        {
            headerName: "Action",
            field: "action",
            width: 100,
            pinned: 'left',
            cellRenderer: FoundationActionCell,
            cellStyle: { backgroundColor: '#ff8c42' }
        },
        { headerName: "Specification", field: "specification", width: 200, cellRenderer: EditableCell },
        { headerName: "MOC", field: "moc", width: 100, cellRenderer: EditableCell },
        { headerName: "Size", field: "size", width: 120, cellRenderer: EditableCell },
        { headerName: "L", field: "l", width: 80, cellRenderer: EditableCell },
        { headerName: "Qty", field: "qty", width: 80, cellRenderer: EditableCell },
        { headerName: "Mtrs", field: "mtrs", width: 100, cellRenderer: EditableCell },
        { headerName: "Sq. Ft.", field: "sqft", width: 100, cellRenderer: EditableCell },
        { headerName: "Wt/Mtr", field: "wtMtr", width: 100, cellRenderer: EditableCell },
        { headerName: "Wt", field: "wt", width: 80, cellRenderer: EditableCell },
        { headerName: "Updated by and time", field: "updatedBy", width: 180 }
    ], []);

    // Column definitions for Fabrication
    const fabricationColumnDefs = useMemo(() => [
        {
            headerName: "Index",
            field: "index",
            width: 80,
            pinned: 'left',
            cellRenderer: EditableCell,  // Changed to editable
            cellStyle: { fontWeight: 'bold', textAlign: 'center', backgroundColor: '#ff8c42', color: '#000' }
        },
        {
            headerName: "DT_RowId",
            field: "dbId",
            width: 80,
            pinned: 'left',
            cellStyle: { fontWeight: 'bold', textAlign: 'center', backgroundColor: '#ff8c42', color: '#000' }
        },
        {
            headerName: "Action",
            field: "action",
            width: 100,
            pinned: 'left',
            cellRenderer: FabricationActionCell,
            cellStyle: { backgroundColor: '#ff8c42' }
        },
        { headerName: "Specification", field: "specification", width: 200, cellRenderer: EditableCell },
        { headerName: "COL_2", field: "col2", width: 100, cellRenderer: EditableCell },
        { headerName: "in mm", field: "inMm", width: 100, cellRenderer: EditableCell },
        { headerName: "Qty", field: "qty", width: 80, cellRenderer: EditableCell },
        { headerName: "Mtrs", field: "mtrs", width: 100, cellRenderer: EditableCell },
        { headerName: "Sq.ft", field: "sqft", width: 100, cellRenderer: EditableCell },
        { headerName: "color", field: "color", width: 100, cellRenderer: EditableCell },
        { headerName: "weight", field: "weight", width: 100, cellRenderer: EditableCell },
        { headerName: "Updated by and time", field: "updatedBy", width: 180 }
    ], []);

    // Column definitions for Assembly
    const assemblyColumnDefs = useMemo(() => [
        {
            headerName: "Index",
            field: "index",
            width: 80,
            pinned: 'left',
            cellRenderer: EditableCell,  // Changed to editable
            cellStyle: { fontWeight: 'bold', textAlign: 'center', backgroundColor: '#ff8c42', color: '#000' }
        },
        {
            headerName: "DT_RowId",
            field: "dbId",
            width: 80,
            pinned: 'left',
            cellStyle: { fontWeight: 'bold', textAlign: 'center', backgroundColor: '#ff8c42', color: '#000' }
        },
        {
            headerName: "Action",
            field: "action",
            width: 100,
            pinned: 'left',
            cellRenderer: AssemblyActionCell,
            cellStyle: { backgroundColor: '#ff8c42' }
        },
        { headerName: "Assembly Material ( M )", field: "assemblyMaterial", width: 250, cellRenderer: EditableCell },
        { headerName: "COL_2", field: "col2", width: 100, cellRenderer: EditableCell },
        { headerName: "COL_3", field: "col3", width: 100, cellRenderer: EditableCell },
        { headerName: "COL_4", field: "col4", width: 100, cellRenderer: EditableCell },
        { headerName: "Qty", field: "qty", width: 80, cellRenderer: EditableCell },
        { headerName: "COL_6", field: "col6", width: 100, cellRenderer: EditableCell },
        { headerName: "COL_7", field: "col7", width: 100, cellRenderer: EditableCell },
        { headerName: "Updated by and time", field: "updatedBy", width: 180 }
    ], []);

    const defaultColDef = useMemo(() => ({
        sortable: true,
        resizable: true,
        filter: false
    }), []);

    const handleAddMetal = async () => {
        if (!metalFormData.packingMaterial) {
            // alert('Please enter a packing material');
            toast.error(`Please enter a packing material`);

            return;
        }

        setLoading(true);
        try {
            const addFormData = new FormData();
            addFormData.append('fileIDs', fileId);
            addFormData.append('string', '');
            addFormData.append('index', metalFormData.index || '');
            addFormData.append('packing_material', metalFormData.packingMaterial);
            addFormData.append('CW', metalFormData.cw || '');
            addFormData.append('C_H', metalFormData.ch || '');
            addFormData.append('Qty', metalFormData.qty || '');
            addFormData.append('W', metalFormData.w || '');
            addFormData.append('H', metalFormData.h || '');
            addFormData.append('Qty1', metalFormData.qty1 || '');
            addFormData.append('sq_m', metalFormData.sq_m || '');
            addFormData.append('Sq_Ft', metalFormData.sqft || '');
            addFormData.append('Col_PC', metalFormData.colpc || '');
            addFormData.append('COL_11', metalFormData.col11 || '');
            addFormData.append('Matl_Reqmt', metalFormData.matlReqmt || '');
            addFormData.append('COL_13', metalFormData.col13 || '');
            addFormData.append('COL_14', metalFormData.col14 || '');
            addFormData.append('Wt', metalFormData.wt || '');

            const response = await fetch(`${API_BASE_URL}/SmetalAddApi.php`, {
                method: 'POST',
                body: addFormData
            });

            const result = await response.json();
            if (result.status === 'success') {
                // alert('Material added successfully!');
                toast.success(`Material added successfully!`);

                setMetalFormData({
                    packingMaterial: '', cw: '', ch: '', hl: '', qty: '', w: '', h: '', qty1: '',
                    wt: '', sq_m: '', sqft: '', colpc: '', col11: '', matlReqmt: '', col13: '', col14: '', index: ''
                });
                setShowAddForm(false);
                await fetchMetalData();
            } else {
                // alert(`Error: ${result.message || 'Failed to add material'}`);
                toast.error(`Error: ${result.message || 'Failed to add material'}`);

            }
        } catch (error) {
            console.error('Error adding material:', error);
            // alert('Error adding material: ' + error.message);
            toast.error('Error adding material: ' + error.message);

        } finally {
            setLoading(false);
        }
    };

    const handleAddFoundation = async () => {
        if (!foundationFormData.specification) {
            // alert('Please enter a specification');
            toast.error(`Please enter a specification`);

            return;
        }

        setLoading(true);
        try {
            const addFormData = new FormData();
            addFormData.append('fileIDs', fileId);
            addFormData.append('index', foundationFormData.index || '');
            addFormData.append('specification', foundationFormData.specification);
            addFormData.append('MOC', foundationFormData.moc || '');
            addFormData.append('size', foundationFormData.size || '');
            addFormData.append('L', foundationFormData.l || '');
            addFormData.append('Qty', foundationFormData.qty || '');
            addFormData.append('Mtrs', foundationFormData.mtrs || '');
            addFormData.append('sq_ft', foundationFormData.sqft || '');
            addFormData.append('Wt_Mtr', foundationFormData.wtMtr || '');
            addFormData.append('Wt', foundationFormData.wt || '');

            const response = await fetch(`${API_BASE_URL}/FoundationAddApi.php`, {
                method: 'POST',
                body: addFormData
            });

            const result = await response.json();
            if (result.status === 'success') {
                // alert('Foundation item added successfully!');
                toast.success(`Foundation item added successfully!`);

                setFoundationFormData({
                    specification: '', moc: '', size: '', l: '', qty: '', mtrs: '', sqft: '', wtMtr: '', wt: '', index: ''
                });
                setShowAddForm(false);
                await fetchFoundationData();
            } else {
                // alert(`Error: ${result.message || 'Failed to add foundation item'}`);
                toast.error(`Error: ${result.message || 'Failed to add foundation item'}`);

            }
        } catch (error) {
            console.error('Error adding foundation item:', error);
            // alert('Error adding foundation item: ' + error.message);
            toast.error(`Error adding foundation item: ' + error.message'}`);

        } finally {
            setLoading(false);
        }
    };

    const handleAddFab = async () => {
        if (!fabricationFormData.specification) {
            // alert('Please enter a specification');
            toast.error('Please enter a specification');
            return;
        }

        setLoading(true);
        try {
            const addFormData = new FormData();
            addFormData.append('fileIDs', fileId);
            addFormData.append('index', fabricationFormData.index || '');
            addFormData.append('specification', fabricationFormData.specification);
            addFormData.append('COL_2', fabricationFormData.col2 || '');
            addFormData.append('in_mm', fabricationFormData.inMm || '');
            addFormData.append('Qty', fabricationFormData.qty || '');
            addFormData.append('Mtrs', fabricationFormData.mtrs || '');
            addFormData.append('Sqft', fabricationFormData.sqft || '');
            addFormData.append('color', fabricationFormData.color || '');
            addFormData.append('weight', fabricationFormData.weight || '');

            const response = await fetch(`${API_BASE_URL}/FabricationAddApi.php`, {
                method: 'POST',
                body: addFormData
            });

            const result = await response.json();
            if (result.status === 'success') {
                // alert('Fabrication item added successfully!');
            toast.success('Fabrication item added successfully!');

                setFabricationFormData({
                    specification: '', col2: '', inMm: '', qty: '', mtrs: '', sqft: '', color: '', weight: '', index: ''
                });
                setShowAddForm(false);
                await fetchFabricationData();
            } else {
                // alert(`Error: ${result.message || 'Failed to add fabrication item'}`);
            toast.error(`Error: ${result.message || 'Failed to add fabrication item'}`);

            }
        } catch (error) {
            console.error('Error adding fabrication item:', error);
            // alert('Error adding fabrication item: ' + error.message);
            toast.error('Error adding fabrication item: ' + error.message);

        } finally {
            setLoading(false);
        }
    };

    const handleAddAssembly = async () => {
        if (!assemblyFormData.assemblyMaterial) {
            // alert('Please enter assembly material');
            toast.success('Please enter assembly material');

            return;
        }

        setLoading(true);
        try {
            const addFormData = new FormData();
            addFormData.append('fileIDs', fileId);
            addFormData.append('index', assemblyFormData.index || '');
            addFormData.append('assembly_mtrl', assemblyFormData.assemblyMaterial);
            addFormData.append('COL_2', assemblyFormData.col2 || '');
            addFormData.append('COL_3', assemblyFormData.col3 || '');
            addFormData.append('COL_4', assemblyFormData.col4 || '');
            addFormData.append('Qty', assemblyFormData.qty || '');
            addFormData.append('COL_6', assemblyFormData.col6 || '');
            addFormData.append('COL_7', assemblyFormData.col7 || '');

            const response = await fetch(`${API_BASE_URL}/AssemblyAddApi.php`, {
                method: 'POST',
                body: addFormData
            });

            const result = await response.json();
            if (result.status === 'success') {
                // alert('Assembly item added successfully!');
                toast.success('Assembly item added successfully!');
                setAssemblyFormData({
                    assemblyMaterial: '', col2: '', col3: '', col4: '', qty: '', col6: '', col7: '', index: ''
                });
                setShowAddForm(false);
                await fetchAssemblyData();
            } else {
                // alert(`Error: ${result.message || 'Failed to add assembly item'}`);
            toast.error(`Error: ${result.message || 'Failed to add assembly item'}`);

            }
        } catch (error) {
            console.error('Error adding assembly item:', error);
            // alert('Error adding assembly item: ' + error.message);
            toast.error('Error adding assembly item: ' + error.message);

        } finally {
            setLoading(false);
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

    const getCurrentRowData = () => {
        switch (activeTab) {
            case 'Metal': return metalRowData;
            case 'Foundation': return foundationRowData;
            case 'Fabrication': return fabricationRowData;
            case 'Assembly': return assemblyRowData;
            default: return [];
        }
    };

    const getCurrentColumnDefs = () => {
        switch (activeTab) {
            case 'Metal': return metalColumnDefs;
            case 'Foundation': return foundationColumnDefs;
            case 'Fabrication': return fabricationColumnDefs;
            case 'Assembly': return assemblyColumnDefs;
            default: return [];
        }
    };

    const renderAddForm = () => {
        if (activeTab === 'Metal') {
            return (

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '12px',
                    alignItems: 'end',
                    padding: '20px',
                    backgroundColor: theme === 'dark' ? '#1a202c' : '#f7fafc',
                    borderRadius: '8px',
                    border: `2px solid ${themeStyles.inputBorder}`
                }}>
                    <div>
    <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: theme === 'dark' ? '#a0aec0' : '#4a5568' }}>Enter Index</label>
    <input 
        type="text" 
        value={metalFormData.index || ''}
        onChange={(e) => setMetalFormData({ ...metalFormData, index: e.target.value })}
        placeholder="Enter Index" 
        style={{ width: '100%', padding: '8px 12px', border: `2px solid ${themeStyles.inputBorder}`, borderRadius: '6px', backgroundColor: themeStyles.inputBg, color: themeStyles.inputColor, fontSize: '13px' }} 
    />
</div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: theme === 'dark' ? '#a0aec0' : '#4a5568' }}>
                            Packing Material
                        </label>
                        <input
                            type="text"
                            value={metalFormData.packingMaterial}
                            onChange={(e) => setMetalFormData({ ...metalFormData, packingMaterial: e.target.value })}
                            placeholder="Enter material..."
                            style={{
                                width: '100%', padding: '8px 12px', border: `2px solid ${themeStyles.inputBorder}`,
                                borderRadius: '6px', backgroundColor: themeStyles.inputBg, color: themeStyles.inputColor,
                                fontSize: '13px', fontWeight: '500'
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: theme === 'dark' ? '#a0aec0' : '#4a5568' }}>CW</label>
                        <input type="text" value={metalFormData.cw} onChange={(e) => setMetalFormData({ ...metalFormData, cw: e.target.value })} placeholder="Enter CW..." style={{ width: '100%', padding: '8px 12px', border: `2px solid ${themeStyles.inputBorder}`, borderRadius: '6px', backgroundColor: themeStyles.inputBg, color: themeStyles.inputColor, fontSize: '13px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: theme === 'dark' ? '#a0aec0' : '#4a5568' }}>CH</label>
                        <input type="text" value={metalFormData.ch} onChange={(e) => setMetalFormData({ ...metalFormData, ch: e.target.value })} placeholder="Enter CH..." style={{ width: '100%', padding: '8px 12px', border: `2px solid ${themeStyles.inputBorder}`, borderRadius: '6px', backgroundColor: themeStyles.inputBg, color: themeStyles.inputColor, fontSize: '13px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: theme === 'dark' ? '#a0aec0' : '#4a5568' }}>Qty</label>
                        <input type="text" value={metalFormData.qty} onChange={(e) => setMetalFormData({ ...metalFormData, qty: e.target.value })} placeholder="Enter qty..." style={{ width: '100%', padding: '8px 12px', border: `2px solid ${themeStyles.inputBorder}`, borderRadius: '6px', backgroundColor: themeStyles.inputBg, color: themeStyles.inputColor, fontSize: '13px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: theme === 'dark' ? '#a0aec0' : '#4a5568' }}>W</label>
                        <input type="text" value={metalFormData.w} onChange={(e) => setMetalFormData({ ...metalFormData, w: e.target.value })} placeholder="Enter W..." style={{ width: '100%', padding: '8px 12px', border: `2px solid ${themeStyles.inputBorder}`, borderRadius: '6px', backgroundColor: themeStyles.inputBg, color: themeStyles.inputColor, fontSize: '13px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: theme === 'dark' ? '#a0aec0' : '#4a5568' }}>H</label>
                        <input type="text" value={metalFormData.h} onChange={(e) => setMetalFormData({ ...metalFormData, h: e.target.value })} placeholder="Enter H..." style={{ width: '100%', padding: '8px 12px', border: `2px solid ${themeStyles.inputBorder}`, borderRadius: '6px', backgroundColor: themeStyles.inputBg, color: themeStyles.inputColor, fontSize: '13px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: theme === 'dark' ? '#a0aec0' : '#4a5568' }}>Qty1</label>
                        <input type="text" value={metalFormData.qty1} onChange={(e) => setMetalFormData({ ...metalFormData, qty1: e.target.value })} placeholder="Enter qty1..." style={{ width: '100%', padding: '8px 12px', border: `2px solid ${themeStyles.inputBorder}`, borderRadius: '6px', backgroundColor: themeStyles.inputBg, color: themeStyles.inputColor, fontSize: '13px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: theme === 'dark' ? '#a0aec0' : '#4a5568' }}>Enter sq_m</label>
                        <input type="text" value={metalFormData.sq_m} onChange={(e) => setMetalFormData({ ...metalFormData, sq_m: e.target.value })} placeholder="Enter sq_m" style={{ width: '100%', padding: '8px 12px', border: `2px solid ${themeStyles.inputBorder}`, borderRadius: '6px', backgroundColor: themeStyles.inputBg, color: themeStyles.inputColor, fontSize: '13px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: theme === 'dark' ? '#a0aec0' : '#4a5568' }}>Enter sq_ft</label>
                        <input type="text" value={metalFormData.sqft} onChange={(e) => setMetalFormData({ ...metalFormData, sqft: e.target.value })} placeholder="Enter sq_ft" style={{ width: '100%', padding: '8px 12px', border: `2px solid ${themeStyles.inputBorder}`, borderRadius: '6px', backgroundColor: themeStyles.inputBg, color: themeStyles.inputColor, fontSize: '13px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: theme === 'dark' ? '#a0aec0' : '#4a5568' }}>Enter Col_PC</label>
                        <input type="text" value={metalFormData.colpc} onChange={(e) => setMetalFormData({ ...metalFormData, colpc: e.target.value })} placeholder="Enter colpc" style={{ width: '100%', padding: '8px 12px', border: `2px solid ${themeStyles.inputBorder}`, borderRadius: '6px', backgroundColor: themeStyles.inputBg, color: themeStyles.inputColor, fontSize: '13px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: theme === 'dark' ? '#a0aec0' : '#4a5568' }}>Enter Col_11</label>
                        <input type="text" value={metalFormData.col11} onChange={(e) => setMetalFormData({ ...metalFormData, col11: e.target.value })} placeholder="Enter col11" style={{ width: '100%', padding: '8px 12px', border: `2px solid ${themeStyles.inputBorder}`, borderRadius: '6px', backgroundColor: themeStyles.inputBg, color: themeStyles.inputColor, fontSize: '13px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: theme === 'dark' ? '#a0aec0' : '#4a5568' }}>Enter Matl_Reqmt</label>
                        <input type="text" value={metalFormData.matlReqmt} onChange={(e) => setMetalFormData({ ...metalFormData, matlReqmt: e.target.value })} placeholder="Enter Matl_Reqmt" style={{ width: '100%', padding: '8px 12px', border: `2px solid ${themeStyles.inputBorder}`, borderRadius: '6px', backgroundColor: themeStyles.inputBg, color: themeStyles.inputColor, fontSize: '13px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: theme === 'dark' ? '#a0aec0' : '#4a5568' }}>Enter Col_13</label>
                        <input type="text" value={metalFormData.col13} onChange={(e) => setMetalFormData({ ...metalFormData, col13: e.target.value })} placeholder="Enter col13" style={{ width: '100%', padding: '8px 12px', border: `2px solid ${themeStyles.inputBorder}`, borderRadius: '6px', backgroundColor: themeStyles.inputBg, color: themeStyles.inputColor, fontSize: '13px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: theme === 'dark' ? '#a0aec0' : '#4a5568' }}>Enter Col_14</label>
                        <input type="text" value={metalFormData.col14} onChange={(e) => setMetalFormData({ ...metalFormData, col14: e.target.value })} placeholder="Enter col14" style={{ width: '100%', padding: '8px 12px', border: `2px solid ${themeStyles.inputBorder}`, borderRadius: '6px', backgroundColor: themeStyles.inputBg, color: themeStyles.inputColor, fontSize: '13px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: theme === 'dark' ? '#a0aec0' : '#4a5568' }}>Wt</label>
                        <input type="text" value={metalFormData.wt} onChange={(e) => setMetalFormData({ ...metalFormData, wt: e.target.value })} placeholder="Enter weight..." style={{ width: '100%', padding: '8px 12px', border: `2px solid ${themeStyles.inputBorder}`, borderRadius: '6px', backgroundColor: themeStyles.inputBg, color: themeStyles.inputColor, fontSize: '13px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: 'transparent' }}>.</label>
                        <button
                            onClick={handleAddMetal}
                            style={{
                                width: '100%', background: 'linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%)',
                                border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: '600',
                                fontSize: '13px', color: '#fff', cursor: 'pointer', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s ease',
                                boxShadow: '0 4px 12px rgba(255, 140, 66, 0.3)'
                            }}
                        >
                            ➕ Add Row
                        </button>
                    </div>
                </div>
            );
        } else if (activeTab === 'Foundation') {
            return (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '12px',
                    alignItems: 'end',
                    padding: '20px',
                    backgroundColor: theme === 'dark' ? '#1a202c' : '#f7fafc',
                    borderRadius: '8px',
                    border: `2px solid ${themeStyles.inputBorder}`
                }}>
                    <div>
    <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: theme === 'dark' ? '#a0aec0' : '#4a5568' }}>Enter Index</label>
    <input 
        type="text" 
        value={foundationFormData.index || ''}
        onChange={(e) => setFoundationFormData({ ...foundationFormData, index: e.target.value })}
        placeholder="Enter Index" 
        style={{ width: '100%', padding: '8px 12px', border: `2px solid ${themeStyles.inputBorder}`, borderRadius: '6px', backgroundColor: themeStyles.inputBg, color: themeStyles.inputColor, fontSize: '13px' }} 
    />
</div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: theme === 'dark' ? '#a0aec0' : '#4a5568' }}>specification</label>
                        <input type="text" value={foundationFormData.specification} onChange={(e) => setFoundationFormData({ ...foundationFormData, specification: e.target.value })} placeholder="specification" style={{ width: '100%', padding: '8px 12px', border: `2px solid ${themeStyles.inputBorder}`, borderRadius: '6px', backgroundColor: themeStyles.inputBg, color: themeStyles.inputColor, fontSize: '13px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: theme === 'dark' ? '#a0aec0' : '#4a5568' }}>MOC</label>
                        <input type="text" value={foundationFormData.moc} onChange={(e) => setFoundationFormData({ ...foundationFormData, moc: e.target.value })} placeholder="MOC" style={{ width: '100%', padding: '8px 12px', border: `2px solid ${themeStyles.inputBorder}`, borderRadius: '6px', backgroundColor: themeStyles.inputBg, color: themeStyles.inputColor, fontSize: '13px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: theme === 'dark' ? '#a0aec0' : '#4a5568' }}>Enter Size</label>
                        <input type="text" value={foundationFormData.size} onChange={(e) => setFoundationFormData({ ...foundationFormData, size: e.target.value })} placeholder="Enter Size" style={{ width: '100%', padding: '8px 12px', border: `2px solid ${themeStyles.inputBorder}`, borderRadius: '6px', backgroundColor: themeStyles.inputBg, color: themeStyles.inputColor, fontSize: '13px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: theme === 'dark' ? '#a0aec0' : '#4a5568' }}>Enter L</label>
                        <input type="text" value={foundationFormData.l} onChange={(e) => setFoundationFormData({ ...foundationFormData, l: e.target.value })} placeholder="Enter L" style={{ width: '100%', padding: '8px 12px', border: `2px solid ${themeStyles.inputBorder}`, borderRadius: '6px', backgroundColor: themeStyles.inputBg, color: themeStyles.inputColor, fontSize: '13px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: theme === 'dark' ? '#a0aec0' : '#4a5568' }}>Enter Qty</label>
                        <input type="text" value={foundationFormData.qty} onChange={(e) => setFoundationFormData({ ...foundationFormData, qty: e.target.value })} placeholder="Enter Qty" style={{ width: '100%', padding: '8px 12px', border: `2px solid ${themeStyles.inputBorder}`, borderRadius: '6px', backgroundColor: themeStyles.inputBg, color: themeStyles.inputColor, fontSize: '13px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: theme === 'dark' ? '#a0aec0' : '#4a5568' }}>Enter Mtrs</label>
                        <input type="text" value={foundationFormData.mtrs} onChange={(e) => setFoundationFormData({ ...foundationFormData, mtrs: e.target.value })} placeholder="Enter Mtrs" style={{ width: '100%', padding: '8px 12px', border: `2px solid ${themeStyles.inputBorder}`, borderRadius: '6px', backgroundColor: themeStyles.inputBg, color: themeStyles.inputColor, fontSize: '13px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: theme === 'dark' ? '#a0aec0' : '#4a5568' }}>Enter sq_ft</label>
                        <input type="text" value={foundationFormData.sqft} onChange={(e) => setFoundationFormData({ ...foundationFormData, sqft: e.target.value })} placeholder="Enter sq_ft" style={{ width: '100%', padding: '8px 12px', border: `2px solid ${themeStyles.inputBorder}`, borderRadius: '6px', backgroundColor: themeStyles.inputBg, color: themeStyles.inputColor, fontSize: '13px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: theme === 'dark' ? '#a0aec0' : '#4a5568' }}>Enter Wt_Mtr</label>
                        <input type="text" value={foundationFormData.wtMtr} onChange={(e) => setFoundationFormData({ ...foundationFormData, wtMtr: e.target.value })} placeholder="Enter Wt_Mtr" style={{ width: '100%', padding: '8px 12px', border: `2px solid ${themeStyles.inputBorder}`, borderRadius: '6px', backgroundColor: themeStyles.inputBg, color: themeStyles.inputColor, fontSize: '13px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: theme === 'dark' ? '#a0aec0' : '#4a5568' }}>Enter Wt</label>
                        <input type="text" value={foundationFormData.wt} onChange={(e) => setFoundationFormData({ ...foundationFormData, wt: e.target.value })} placeholder="Enter Wt" style={{ width: '100%', padding: '8px 12px', border: `2px solid ${themeStyles.inputBorder}`, borderRadius: '6px', backgroundColor: themeStyles.inputBg, color: themeStyles.inputColor, fontSize: '13px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: 'transparent' }}>.</label>
                        <button
                            onClick={handleAddFoundation}
                            style={{
                                width: '100%', background: 'linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%)',
                                border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: '600',
                                fontSize: '13px', color: '#fff', cursor: 'pointer', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', gap: '6px'
                            }}
                        >
                            ➕ Save
                        </button>
                    </div>
                </div>
            );
        } else if (activeTab === 'Fabrication') {
            return (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '12px',
                    alignItems: 'end',
                    padding: '20px',
                    backgroundColor: theme === 'dark' ? '#1a202c' : '#f7fafc',
                    borderRadius: '8px',
                    border: `2px solid ${themeStyles.inputBorder}`
                }}>
                    <div>
    <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: theme === 'dark' ? '#a0aec0' : '#4a5568' }}>Enter Index</label>
    <input 
        type="text" 
        value={fabricationFormData.index || ''}
        onChange={(e) => setFabricationFormData({ ...fabricationFormData, index: e.target.value })}
        placeholder="Enter Index" 
        style={{ width: '100%', padding: '8px 12px', border: `2px solid ${themeStyles.inputBorder}`, borderRadius: '6px', backgroundColor: themeStyles.inputBg, color: themeStyles.inputColor, fontSize: '13px' }} 
    />
</div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: theme === 'dark' ? '#a0aec0' : '#4a5568' }}>specification</label>
                        <input type="text" value={fabricationFormData.specification} onChange={(e) => setFabricationFormData({ ...fabricationFormData, specification: e.target.value })} placeholder="specification" style={{ width: '100%', padding: '8px 12px', border: `2px solid ${themeStyles.inputBorder}`, borderRadius: '6px', backgroundColor: themeStyles.inputBg, color: themeStyles.inputColor, fontSize: '13px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: theme === 'dark' ? '#a0aec0' : '#4a5568' }}>COL_2</label>
                        <input type="text" value={fabricationFormData.col2} onChange={(e) => setFabricationFormData({ ...fabricationFormData, col2: e.target.value })} placeholder="COL_2" style={{ width: '100%', padding: '8px 12px', border: `2px solid ${themeStyles.inputBorder}`, borderRadius: '6px', backgroundColor: themeStyles.inputBg, color: themeStyles.inputColor, fontSize: '13px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: theme === 'dark' ? '#a0aec0' : '#4a5568' }}>Enter In_mm</label>
                        <input type="text" value={fabricationFormData.inMm} onChange={(e) => setFabricationFormData({ ...fabricationFormData, inMm: e.target.value })} placeholder="Enter In_mm" style={{ width: '100%', padding: '8px 12px', border: `2px solid ${themeStyles.inputBorder}`, borderRadius: '6px', backgroundColor: themeStyles.inputBg, color: themeStyles.inputColor, fontSize: '13px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: theme === 'dark' ? '#a0aec0' : '#4a5568' }}>Enter Qty</label>
                        <input type="text" value={fabricationFormData.qty} onChange={(e) => setFabricationFormData({ ...fabricationFormData, qty: e.target.value })} placeholder="Enter Qty" style={{ width: '100%', padding: '8px 12px', border: `2px solid ${themeStyles.inputBorder}`, borderRadius: '6px', backgroundColor: themeStyles.inputBg, color: themeStyles.inputColor, fontSize: '13px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: theme === 'dark' ? '#a0aec0' : '#4a5568' }}>Enter Mtrs</label>
                        <input type="text" value={fabricationFormData.mtrs} onChange={(e) => setFabricationFormData({ ...fabricationFormData, mtrs: e.target.value })} placeholder="Enter Mtrs" style={{ width: '100%', padding: '8px 12px', border: `2px solid ${themeStyles.inputBorder}`, borderRadius: '6px', backgroundColor: themeStyles.inputBg, color: themeStyles.inputColor, fontSize: '13px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: theme === 'dark' ? '#a0aec0' : '#4a5568' }}>Enter sq_ft</label>
                        <input type="text" value={fabricationFormData.sqft} onChange={(e) => setFabricationFormData({ ...fabricationFormData, sqft: e.target.value })} placeholder="Enter sq_ft" style={{ width: '100%', padding: '8px 12px', border: `2px solid ${themeStyles.inputBorder}`, borderRadius: '6px', backgroundColor: themeStyles.inputBg, color: themeStyles.inputColor, fontSize: '13px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: theme === 'dark' ? '#a0aec0' : '#4a5568' }}>Enter color</label>
                        <input type="text" value={fabricationFormData.color} onChange={(e) => setFabricationFormData({ ...fabricationFormData, color: e.target.value })} placeholder="Enter color" style={{ width: '100%', padding: '8px 12px', border: `2px solid ${themeStyles.inputBorder}`, borderRadius: '6px', backgroundColor: themeStyles.inputBg, color: themeStyles.inputColor, fontSize: '13px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: theme === 'dark' ? '#a0aec0' : '#4a5568' }}>Enter weight</label>
                        <input type="text" value={fabricationFormData.weight} onChange={(e) => setFabricationFormData({ ...fabricationFormData, weight: e.target.value })} placeholder="Enter weight" style={{ width: '100%', padding: '8px 12px', border: `2px solid ${themeStyles.inputBorder}`, borderRadius: '6px', backgroundColor: themeStyles.inputBg, color: themeStyles.inputColor, fontSize: '13px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: 'transparent' }}>.</label>
                        <button
                            onClick={handleAddFab}
                            style={{
                                width: '100%', background: 'linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%)',
                                border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: '600',
                                fontSize: '13px', color: '#fff', cursor: 'pointer', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', gap: '6px'
                            }}
                        >
                            ➕ Save
                        </button>
                    </div>
                </div>
            );
        } else if (activeTab === 'Assembly') {
            return (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '12px',
                    alignItems: 'end',
                    padding: '20px',
                    backgroundColor: theme === 'dark' ? '#1a202c' : '#f7fafc',
                    borderRadius: '8px',
                    border: `2px solid ${themeStyles.inputBorder}`
                }}>
                    <div>
    <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: theme === 'dark' ? '#a0aec0' : '#4a5568' }}>Enter Index</label>
    <input 
        type="text" 
        value={assemblyFormData.index || ''}
        onChange={(e) => setAssemblyFormData({ ...assemblyFormData, index: e.target.value })}
        placeholder="Enter Index" 
        style={{ width: '100%', padding: '8px 12px', border: `2px solid ${themeStyles.inputBorder}`, borderRadius: '6px', backgroundColor: themeStyles.inputBg, color: themeStyles.inputColor, fontSize: '13px' }} 
    />
</div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: theme === 'dark' ? '#a0aec0' : '#4a5568' }}>specification</label>
                        <input type="text" value={assemblyFormData.assemblyMaterial} onChange={(e) => setAssemblyFormData({ ...assemblyFormData, assemblyMaterial: e.target.value })} placeholder="specification" style={{ width: '100%', padding: '8px 12px', border: `2px solid ${themeStyles.inputBorder}`, borderRadius: '6px', backgroundColor: themeStyles.inputBg, color: themeStyles.inputColor, fontSize: '13px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: theme === 'dark' ? '#a0aec0' : '#4a5568' }}>COL_2</label>
                        <input type="text" value={assemblyFormData.col2} onChange={(e) => setAssemblyFormData({ ...assemblyFormData, col2: e.target.value })} placeholder="COL_2" style={{ width: '100%', padding: '8px 12px', border: `2px solid ${themeStyles.inputBorder}`, borderRadius: '6px', backgroundColor: themeStyles.inputBg, color: themeStyles.inputColor, fontSize: '13px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: theme === 'dark' ? '#a0aec0' : '#4a5568' }}>Enter COL_3</label>
                        <input type="text" value={assemblyFormData.col3} onChange={(e) => setAssemblyFormData({ ...assemblyFormData, col3: e.target.value })} placeholder="Enter COL_3" style={{ width: '100%', padding: '8px 12px', border: `2px solid ${themeStyles.inputBorder}`, borderRadius: '6px', backgroundColor: themeStyles.inputBg, color: themeStyles.inputColor, fontSize: '13px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: theme === 'dark' ? '#a0aec0' : '#4a5568' }}>Enter COL_4</label>
                        <input type="text" value={assemblyFormData.col4} onChange={(e) => setAssemblyFormData({ ...assemblyFormData, col4: e.target.value })} placeholder="Enter COL_4" style={{ width: '100%', padding: '8px 12px', border: `2px solid ${themeStyles.inputBorder}`, borderRadius: '6px', backgroundColor: themeStyles.inputBg, color: themeStyles.inputColor, fontSize: '13px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: theme === 'dark' ? '#a0aec0' : '#4a5568' }}>Enter Qty</label>
                        <input type="text" value={assemblyFormData.qty} onChange={(e) => setAssemblyFormData({ ...assemblyFormData, qty: e.target.value })} placeholder="Enter Qty" style={{ width: '100%', padding: '8px 12px', border: `2px solid ${themeStyles.inputBorder}`, borderRadius: '6px', backgroundColor: themeStyles.inputBg, color: themeStyles.inputColor, fontSize: '13px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: theme === 'dark' ? '#a0aec0' : '#4a5568' }}>Enter COL_6</label>
                        <input type="text" value={assemblyFormData.col6} onChange={(e) => setAssemblyFormData({ ...assemblyFormData, col6: e.target.value })} placeholder="Enter COL_6" style={{ width: '100%', padding: '8px 12px', border: `2px solid ${themeStyles.inputBorder}`, borderRadius: '6px', backgroundColor: themeStyles.inputBg, color: themeStyles.inputColor, fontSize: '13px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: theme === 'dark' ? '#a0aec0' : '#4a5568' }}>Enter COL_7</label>
                        <input type="text" value={assemblyFormData.col7} onChange={(e) => setAssemblyFormData({ ...assemblyFormData, col7: e.target.value })} placeholder="Enter COL_7" style={{ width: '100%', padding: '8px 12px', border: `2px solid ${themeStyles.inputBorder}`, borderRadius: '6px', backgroundColor: themeStyles.inputBg, color: themeStyles.inputColor, fontSize: '13px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: 'transparent' }}>.</label>
                        <button
                            onClick={handleAddAssembly}

                            style={{
                                width: '100%', background: 'linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%)',
                                border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: '600',
                                fontSize: '13px', color: '#fff', cursor: 'pointer', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', gap: '6px'
                            }}
                        >
                            ➕ Save
                        </button>
                    </div>
                </div>
            );
        }
        return null;
    };

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
                    boxShadow: theme === 'dark' ? '0 20px 40px rgba(0,0,0,0.4)' : '0 10px 30px rgba(0,0,0,0.08)'
                }}>
                    {/* Tabs Section */}
                    <div style={{
                        display: 'flex',
                        borderBottom: `2px solid ${theme === 'dark' ? '#2d3748' : '#e2e8f0'}`,
                        backgroundColor: themeStyles.cardBg
                    }}>
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: '14px 28px',
                                    border: 'none',
                                    backgroundColor: activeTab === tab ? '#ff8c42' : themeStyles.cardBg,
                                    color: activeTab === tab ? '#fff' : themeStyles.color,
                                    fontSize: '15px',
                                    fontWeight: activeTab === tab ? '600' : '500',
                                    cursor: 'pointer',
                                    borderBottom: activeTab === tab ? '3px solid #ff8c42' : 'none',
                                    transition: 'all 0.2s ease',
                                    outline: 'none'
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Header Section */}
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
                                        onClick={() => setShowAddForm(!showAddForm)}
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
                                        {showAddForm ? '✖ Hide Form' : '➕ Add New'}
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
                                    {renderAddForm()}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Grid Section */}
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
                                    rowData={getCurrentRowData()}
                                    columnDefs={getCurrentColumnDefs()}
                                    defaultColDef={defaultColDef}
                                    pagination={false}
                                    suppressMovableColumns={true}
                                    suppressCellFocus={false}
                                    animateRows={true}
                                    domLayout='normal'
                                    headerHeight={48}
                                    rowHeight={42}
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
/>
        </div>
    );
};

export default PackingListManager;