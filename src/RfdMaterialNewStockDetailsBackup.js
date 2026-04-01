import React, { useState, useRef, useMemo, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-theme-alpine.css";

const MaterialStockManager = () => {
  const getFileIdFromUrl = () => {
    const path = window.location.pathname;
    const match = path.match(/\/(\d+)/);
    return match ? match[1] : '5519';
  };

  const [fileId] = useState(getFileIdFromUrl());
  const [activeTab, setActiveTab] = useState('Sheet Metal');
  const [theme, setTheme] = useState('light');
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('SM-25-064-MAK-Sectional Panel');
  
  const [sheetMetalData, setSheetMetalData] = useState([]);
  const [fabricationData, setFabricationData] = useState([]);
  const [foundationData, setFoundationData] = useState([]);
  const [assemblyData, setAssemblyData] = useState([]);
  
  const gridRef = useRef();
  const API_BASE_URL = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api";

  const tabs = ['Sheet Metal', 'Fabrication', 'Foundation', 'Assembly'];

  // Fetch Sheet Metal data
  const fetchSheetMetalData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/RfdNewStockSmetalApi.php?fileId=${fileId}`);
      const result = await response.json();

      if (result.status === "success" && Array.isArray(result.data)) {
        const mappedData = result.data.map(item => ({
          fileName: item.filename || '',
          materialName: item.material_name || '',
          weight: item.weight || '',
          height: item.height || '',
          colour: item.colour || '',
          designQty: item.designQty || 0,
          stock: item.stock || 0,
          dispatchQty: item.dispatchQty || 0,
          totalStock: item.totalQty || 0,
          location: item.storelocation || ''
        }));
        setSheetMetalData(mappedData);
        if (mappedData.length > 0) {
          setFileName(mappedData[0].fileName || `File-${fileId}`);
        }
      }
    } catch (error) {
      console.error("Error fetching sheet metal data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Fabrication data
  const fetchFabricationData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/RfdNewStockFabApi.php?fileId=${fileId}`);
      const result = await response.json();

      if (result.status === "success" && Array.isArray(result.data)) {
        const mappedData = result.data.map(item => ({
          fileName: item.filename || '',
          materialName: item.material_name || '',
          inMM: item.inmm || '',
          colour: item.colour || '',
          designQty: item.designQty || 0,
          stock: item.stock || 0,
          dispatchQty: item.dispatchQty || 0,
          totalStock: item.totalQty || 0,
          location: item.storelocation || ''
        }));
        setFabricationData(mappedData);
        if (mappedData.length > 0) {
          setFileName(mappedData[0].fileName || `File-${fileId}`);
        }
      }
    } catch (error) {
      console.error("Error fetching fabrication data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Foundation data
  const fetchFoundationData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/RfdNewStockFoundApi.php?fileId=${fileId}`);
      const result = await response.json();

      if (result.status === "success" && Array.isArray(result.data)) {
        const mappedData = result.data.map(item => ({
          fileName: item.filename || '',
          materialName: item.material_name || '',
          moc: item.moc || '',
          size: item.size || '',
          length: item.length || '',
          colour: item.colour || '',
          designQty: item.designQty || 0,
          stock: item.stock || 0,
          dispatchQty: item.dispatchQty || 0,
          totalStock: item.totalQty || 0,
          location: item.storelocation || ''
        }));
        setFoundationData(mappedData);
        if (mappedData.length > 0) {
          setFileName(mappedData[0].fileName || `File-${fileId}`);
        }
      }
    } catch (error) {
      console.error("Error fetching foundation data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Assembly data
  const fetchAssemblyData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/RfdNewStockAsslyApi.php?fileId=${fileId}`);
      const result = await response.json();

      if (result.status === "success" && Array.isArray(result.data)) {
        const mappedData = result.data.map(item => ({
          fileName: item.filename || '',
          materialName: item.material_name || '',
          moc: item.moc || '',
          size: item.size || '',
          length: item.length || '',
          colour: item.colour || '',
          designQty: item.designQty || 0,
          stock: item.stock || 0,
          dispatchQty: item.dispatchQty || 0,
          totalStock: item.totalQty || 0,
          location: item.storelocation || ''
        }));
        setAssemblyData(mappedData);
        if (mappedData.length > 0) {
          setFileName(mappedData[0].fileName || `File-${fileId}`);
        }
      }
    } catch (error) {
      console.error("Error fetching assembly data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when tab changes
  useEffect(() => {
    if (activeTab === 'Sheet Metal') {
      fetchSheetMetalData();
    } else if (activeTab === 'Fabrication') {
      fetchFabricationData();
    } else if (activeTab === 'Foundation') {
      fetchFoundationData();
    } else if (activeTab === 'Assembly') {
      fetchAssemblyData();
    }
  }, [activeTab, fileId]);

  // Column definitions for Sheet Metal
  const sheetMetalColumnDefs = useMemo(() => [
    { headerName: "File Name", field: "fileName", width: 180, pinned: 'left', filter: 'agTextColumnFilter' },
    { headerName: "Material Name", field: "materialName", width: 200, filter: 'agTextColumnFilter' },
    { headerName: "Weight", field: "weight", width: 120, filter: 'agNumberColumnFilter' },
    { headerName: "Height", field: "height", width: 120, filter: 'agNumberColumnFilter' },
    { headerName: "Colour", field: "colour", width: 120, filter: 'agTextColumnFilter' },
    { headerName: "Design Qty", field: "designQty", width: 130, filter: 'agNumberColumnFilter' },
    { headerName: "Stock", field: "stock", width: 100, filter: 'agNumberColumnFilter' },
    { headerName: "Dispatch Qty", field: "dispatchQty", width: 130, filter: 'agNumberColumnFilter' },
    { headerName: "Total Stock", field: "totalStock", width: 130, filter: 'agNumberColumnFilter' },
    { headerName: "Location", field: "location", width: 120, filter: 'agTextColumnFilter' }
  ], []);

  // Column definitions for Fabrication
  const fabricationColumnDefs = useMemo(() => [
    { headerName: "File Name", field: "fileName", width: 180, pinned: 'left', filter: 'agTextColumnFilter' },
    { headerName: "Material Name", field: "materialName", width: 200, filter: 'agTextColumnFilter' },
    { headerName: "In MM", field: "inMM", width: 120, filter: 'agNumberColumnFilter' },
    { headerName: "Colour", field: "colour", width: 120, filter: 'agTextColumnFilter' },
    { headerName: "Design Qty", field: "designQty", width: 130, filter: 'agNumberColumnFilter' },
    { headerName: "Stock", field: "stock", width: 100, filter: 'agNumberColumnFilter' },
    { headerName: "Dispatch Qty", field: "dispatchQty", width: 130, filter: 'agNumberColumnFilter' },
    { headerName: "Total Stock", field: "totalStock", width: 130, filter: 'agNumberColumnFilter' },
    { headerName: "Location", field: "location", width: 120, filter: 'agTextColumnFilter' }
  ], []);

  // Column definitions for Foundation
  const foundationColumnDefs = useMemo(() => [
    { headerName: "File Name", field: "fileName", width: 180, pinned: 'left', filter: 'agTextColumnFilter' },
    { headerName: "Material Name", field: "materialName", width: 200, filter: 'agTextColumnFilter' },
    { headerName: "MOC", field: "moc", width: 100, filter: 'agTextColumnFilter' },
    { headerName: "Size", field: "size", width: 120, filter: 'agTextColumnFilter' },
    { headerName: "Length", field: "length", width: 120, filter: 'agNumberColumnFilter' },
    { headerName: "Colour", field: "colour", width: 120, filter: 'agTextColumnFilter' },
    { headerName: "Design Qty", field: "designQty", width: 130, filter: 'agNumberColumnFilter' },
    { headerName: "Stock", field: "stock", width: 100, filter: 'agNumberColumnFilter' },
    { headerName: "Dispatch Qty", field: "dispatchQty", width: 130, filter: 'agNumberColumnFilter' },
    { headerName: "Total Stock", field: "totalStock", width: 130, filter: 'agNumberColumnFilter' },
    { headerName: "Location", field: "location", width: 120, filter: 'agTextColumnFilter' }
  ], []);

  // Column definitions for Assembly (same as Foundation based on your API)
  const assemblyColumnDefs = useMemo(() => [
    { headerName: "File Name", field: "fileName", width: 180, pinned: 'left', filter: 'agTextColumnFilter' },
    { headerName: "Material Name", field: "materialName", width: 200, filter: 'agTextColumnFilter' },
    { headerName: "MOC", field: "moc", width: 100, filter: 'agTextColumnFilter' },
    { headerName: "Size", field: "size", width: 120, filter: 'agTextColumnFilter' },
    { headerName: "Length", field: "length", width: 120, filter: 'agNumberColumnFilter' },
    { headerName: "Colour", field: "colour", width: 120, filter: 'agTextColumnFilter' },
    { headerName: "Design Qty", field: "designQty", width: 130, filter: 'agNumberColumnFilter' },
    { headerName: "Stock", field: "stock", width: 100, filter: 'agNumberColumnFilter' },
    { headerName: "Dispatch Qty", field: "dispatchQty", width: 130, filter: 'agNumberColumnFilter' },
    { headerName: "Total Stock", field: "totalStock", width: 130, filter: 'agNumberColumnFilter' },
    { headerName: "Location", field: "location", width: 120, filter: 'agTextColumnFilter' }
  ], []);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
    filter: true,
    floatingFilter: true
  }), []);

  const getCurrentRowData = () => {
    switch (activeTab) {
      case 'Sheet Metal': return sheetMetalData;
      case 'Fabrication': return fabricationData;
      case 'Foundation': return foundationData;
      case 'Assembly': return assemblyData;
      default: return [];
    }
  };

  const getCurrentColumnDefs = () => {
    switch (activeTab) {
      case 'Sheet Metal': return sheetMetalColumnDefs;
      case 'Fabrication': return fabricationColumnDefs;
      case 'Foundation': return foundationColumnDefs;
      case 'Assembly': return assemblyColumnDefs;
      default: return [];
    }
  };

  const exportToCSV = () => {
    if (gridRef.current && gridRef.current.api) {
      gridRef.current.api.exportDataAsCsv({
        fileName: `${activeTab}_${fileName}_Export.csv`
      });
    }
  };

  const clearPinned = () => {
    if (gridRef.current && gridRef.current.api) {
      gridRef.current.api.applyColumnState({
        state: getCurrentColumnDefs().map(col => ({
          colId: col.field,
          pinned: null
        }))
      });
    }
  };

  const setPinned = () => {
    if (gridRef.current && gridRef.current.api) {
      gridRef.current.api.applyColumnState({
        state: [{ colId: 'fileName', pinned: 'left' }]
      });
    }
  };

  const sizeToFit = () => {
    if (gridRef.current && gridRef.current.api) {
      gridRef.current.api.sizeColumnsToFit();
    }
  };

  const autoSizeAll = (skipHeader = false) => {
    if (gridRef.current && gridRef.current.api) {
      const allColumnIds = gridRef.current.api.getColumns().map(column => column.getId());
      gridRef.current.api.autoSizeColumns(allColumnIds, skipHeader);
    }
  };

  const themeClass = theme === 'light' ? 'ag-theme-alpine' : 'ag-theme-alpine-dark';

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: theme === 'light' ? '#f5f5f5' : '#1a1a1a',
      padding: 0,
      margin: 0
    }}>
      <div style={{
        backgroundColor: theme === 'light' ? '#fff' : '#2d2d2d',
        minHeight: '100vh'
      }}>
        {/* Tabs Section */}
        <div style={{
          display: 'flex',
          borderBottom: `2px solid ${theme === 'light' ? '#ddd' : '#444'}`,
          backgroundColor: theme === 'light' ? '#e8e8e8' : '#333'
        }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '12px 24px',
                border: 'none',
                backgroundColor: activeTab === tab 
                  ? (theme === 'light' ? '#fff' : '#2d2d2d')
                  : 'transparent',
                color: theme === 'light' ? '#333' : '#fff',
                fontSize: '14px',
                fontWeight: activeTab === tab ? '600' : '400',
                cursor: 'pointer',
                borderBottom: activeTab === tab ? '3px solid #ff6b35' : 'none',
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Action Buttons Section */}
        <div style={{
          padding: '16px',
          backgroundColor: theme === 'light' ? '#fff' : '#2d2d2d',
          borderBottom: `1px solid ${theme === 'light' ? '#ddd' : '#444'}`,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={exportToCSV}
              style={{
                padding: '8px 16px',
                backgroundColor: '#ff6b35',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Download CSV Export File
            </button>
            <button
              onClick={clearPinned}
              style={{
                padding: '8px 16px',
                backgroundColor: '#ff6b35',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Clear Pinned
            </button>
            <button
              onClick={setPinned}
              style={{
                padding: '8px 16px',
                backgroundColor: '#ff6b35',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Pinned
            </button>
            <button
              onClick={sizeToFit}
              style={{
                padding: '8px 16px',
                backgroundColor: '#ff6b35',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Size To Fit
            </button>
            <button
              onClick={() => autoSizeAll(false)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#ff6b35',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Auto-Size All
            </button>
            <button
              onClick={() => autoSizeAll(true)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#ff6b35',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Auto-Size All (Skip Header)
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              style={{
                padding: '8px 12px',
                backgroundColor: theme === 'light' ? '#fff' : '#3d3d3d',
                color: theme === 'light' ? '#333' : '#fff',
                border: `1px solid ${theme === 'light' ? '#ddd' : '#555'}`,
                borderRadius: '4px',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <div style={{
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: '600',
              backgroundColor: theme === 'light' ? '#f8f8f8' : '#3d3d3d',
              border: `1px solid ${theme === 'light' ? '#ddd' : '#555'}`,
              borderRadius: '4px',
              color: theme === 'light' ? '#333' : '#fff'
            }}>
              File Name: <span style={{ color: '#ff6b35' }}>{fileName}</span>
            </div>
          </div>
        </div>

        {/* Grid Section */}
        <div style={{ padding: '0' }}>
          {loading ? (
            <div style={{
              padding: '60px',
              textAlign: 'center',
              fontSize: '16px',
              color: theme === 'light' ? '#666' : '#999',
              backgroundColor: theme === 'light' ? '#fff' : '#2d2d2d'
            }}>
              <div style={{
                display: 'inline-block',
                width: '40px',
                height: '40px',
                border: '4px solid rgba(255, 107, 53, 0.2)',
                borderTopColor: '#ff6b35',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <div style={{ marginTop: '16px' }}>Loading data...</div>
            </div>
          ) : getCurrentRowData().length === 0 ? (
            <div style={{
              padding: '60px',
              textAlign: 'center',
              fontSize: '16px',
              color: theme === 'light' ? '#666' : '#999',
              backgroundColor: theme === 'light' ? '#fff' : '#2d2d2d'
            }}>
              No Rows To Show
            </div>
          ) : (
            <div
              className={themeClass}
              style={{
                height: 'calc(100vh - 200px)',
                width: '100%'
              }}
            >
              <AgGridReact
                ref={gridRef}
                rowData={getCurrentRowData()}
                columnDefs={getCurrentColumnDefs()}
                defaultColDef={defaultColDef}
                pagination={true}
                paginationPageSize={pageSize}
                paginationPageSizeSelector={[10, 20, 50, 100]}
                suppressMovableColumns={false}
                animateRows={true}
                domLayout='normal'
                headerHeight={40}
                rowHeight={38}
              />
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MaterialStockManager;