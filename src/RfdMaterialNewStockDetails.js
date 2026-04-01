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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  const [sheetMetalData, setSheetMetalData] = useState([]);
  const [fabricationData, setFabricationData] = useState([]);
  const [foundationData, setFoundationData] = useState([]);
  const [assemblyData, setAssemblyData] = useState([]);
  
  const gridRef = useRef();
  const API_BASE_URL = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api";

  const tabs = ['Sheet Metal', 'Fabrication', 'Foundation', 'Assembly'];

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    { headerName: "File Name", field: "fileName", width: isMobile ? 140 : 180, pinned: isMobile ? null : 'left', filter: 'agTextColumnFilter' },
    { headerName: "Material Name", field: "materialName", width: isMobile ? 160 : 200, filter: 'agTextColumnFilter' },
    { headerName: "Weight", field: "weight", width: isMobile ? 100 : 120, filter: 'agNumberColumnFilter' },
    { headerName: "Height", field: "height", width: isMobile ? 100 : 120, filter: 'agNumberColumnFilter' },
    { headerName: "Colour", field: "colour", width: isMobile ? 100 : 120, filter: 'agTextColumnFilter' },
    { headerName: "Design Qty", field: "designQty", width: isMobile ? 110 : 130, filter: 'agNumberColumnFilter' },
    { headerName: "Stock", field: "stock", width: isMobile ? 90 : 100, filter: 'agNumberColumnFilter' },
    { headerName: "Dispatch Qty", field: "dispatchQty", width: isMobile ? 110 : 130, filter: 'agNumberColumnFilter' },
    { headerName: "Total Stock", field: "totalStock", width: isMobile ? 110 : 130, filter: 'agNumberColumnFilter' },
    { headerName: "Location", field: "location", width: isMobile ? 100 : 120, filter: 'agTextColumnFilter' }
  ], [isMobile]);

  // Column definitions for Fabrication
  const fabricationColumnDefs = useMemo(() => [
    { headerName: "File Name", field: "fileName", width: isMobile ? 140 : 180, pinned: isMobile ? null : 'left', filter: 'agTextColumnFilter' },
    { headerName: "Material Name", field: "materialName", width: isMobile ? 160 : 200, filter: 'agTextColumnFilter' },
    { headerName: "In MM", field: "inMM", width: isMobile ? 100 : 120, filter: 'agNumberColumnFilter' },
    { headerName: "Colour", field: "colour", width: isMobile ? 100 : 120, filter: 'agTextColumnFilter' },
    { headerName: "Design Qty", field: "designQty", width: isMobile ? 110 : 130, filter: 'agNumberColumnFilter' },
    { headerName: "Stock", field: "stock", width: isMobile ? 90 : 100, filter: 'agNumberColumnFilter' },
    { headerName: "Dispatch Qty", field: "dispatchQty", width: isMobile ? 110 : 130, filter: 'agNumberColumnFilter' },
    { headerName: "Total Stock", field: "totalStock", width: isMobile ? 110 : 130, filter: 'agNumberColumnFilter' },
    { headerName: "Location", field: "location", width: isMobile ? 100 : 120, filter: 'agTextColumnFilter' }
  ], [isMobile]);

  // Column definitions for Foundation
  const foundationColumnDefs = useMemo(() => [
    { headerName: "File Name", field: "fileName", width: isMobile ? 140 : 180, pinned: isMobile ? null : 'left', filter: 'agTextColumnFilter' },
    { headerName: "Material Name", field: "materialName", width: isMobile ? 160 : 200, filter: 'agTextColumnFilter' },
    { headerName: "MOC", field: "moc", width: isMobile ? 90 : 100, filter: 'agTextColumnFilter' },
    { headerName: "Size", field: "size", width: isMobile ? 100 : 120, filter: 'agTextColumnFilter' },
    { headerName: "Length", field: "length", width: isMobile ? 100 : 120, filter: 'agNumberColumnFilter' },
    { headerName: "Colour", field: "colour", width: isMobile ? 100 : 120, filter: 'agTextColumnFilter' },
    { headerName: "Design Qty", field: "designQty", width: isMobile ? 110 : 130, filter: 'agNumberColumnFilter' },
    { headerName: "Stock", field: "stock", width: isMobile ? 90 : 100, filter: 'agNumberColumnFilter' },
    { headerName: "Dispatch Qty", field: "dispatchQty", width: isMobile ? 110 : 130, filter: 'agNumberColumnFilter' },
    { headerName: "Total Stock", field: "totalStock", width: isMobile ? 110 : 130, filter: 'agNumberColumnFilter' },
    { headerName: "Location", field: "location", width: isMobile ? 100 : 120, filter: 'agTextColumnFilter' }
  ], [isMobile]);

  // Column definitions for Assembly
  const assemblyColumnDefs = useMemo(() => [
    { headerName: "File Name", field: "fileName", width: isMobile ? 140 : 180, pinned: isMobile ? null : 'left', filter: 'agTextColumnFilter' },
    { headerName: "Material Name", field: "materialName", width: isMobile ? 160 : 200, filter: 'agTextColumnFilter' },
    { headerName: "MOC", field: "moc", width: isMobile ? 90 : 100, filter: 'agTextColumnFilter' },
    { headerName: "Size", field: "size", width: isMobile ? 100 : 120, filter: 'agTextColumnFilter' },
    { headerName: "Length", field: "length", width: isMobile ? 100 : 120, filter: 'agNumberColumnFilter' },
    { headerName: "Colour", field: "colour", width: isMobile ? 100 : 120, filter: 'agTextColumnFilter' },
    { headerName: "Design Qty", field: "designQty", width: isMobile ? 110 : 130, filter: 'agNumberColumnFilter' },
    { headerName: "Stock", field: "stock", width: isMobile ? 90 : 100, filter: 'agNumberColumnFilter' },
    { headerName: "Dispatch Qty", field: "dispatchQty", width: isMobile ? 110 : 130, filter: 'agNumberColumnFilter' },
    { headerName: "Total Stock", field: "totalStock", width: isMobile ? 110 : 130, filter: 'agNumberColumnFilter' },
    { headerName: "Location", field: "location", width: isMobile ? 100 : 120, filter: 'agTextColumnFilter' }
  ], [isMobile]);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
    filter: true,
    floatingFilter: !isMobile
  }), [isMobile]);

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
          overflowX: 'auto',
          borderBottom: `2px solid ${theme === 'light' ? '#ddd' : '#444'}`,
          backgroundColor: theme === 'light' ? '#e8e8e8' : '#333',
          WebkitOverflowScrolling: 'touch'
        }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: isMobile ? '10px 16px' : '12px 24px',
                border: 'none',
                backgroundColor: activeTab === tab 
                  ? (theme === 'light' ? '#fff' : '#2d2d2d')
                  : 'transparent',
                color: theme === 'light' ? '#333' : '#fff',
                fontSize: isMobile ? '12px' : '14px',
                fontWeight: activeTab === tab ? '600' : '400',
                cursor: 'pointer',
                borderBottom: activeTab === tab ? '3px solid #ff6b35' : 'none',
                transition: 'all 0.2s ease',
                outline: 'none',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Action Buttons Section */}
        <div style={{
          padding: isMobile ? '12px' : '16px',
          backgroundColor: theme === 'light' ? '#fff' : '#2d2d2d',
          borderBottom: `1px solid ${theme === 'light' ? '#ddd' : '#444'}`,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          flexWrap: 'wrap',
          gap: isMobile ? '8px' : '10px',
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ 
            display: 'flex', 
            gap: isMobile ? '6px' : '8px', 
            flexWrap: 'wrap',
            justifyContent: isMobile ? 'space-between' : 'flex-start'
          }}>
            <button
              onClick={exportToCSV}
              style={{
                padding: isMobile ? '8px 12px' : '8px 16px',
                backgroundColor: '#ff6b35',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: isMobile ? '11px' : '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flex: isMobile ? '1 1 100%' : 'none'
              }}
            >
              {isMobile ? 'CSV Export' : 'Download CSV Export File'}
            </button>
            {!isMobile && (
              <>
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
              </>
            )}
            <button
              onClick={sizeToFit}
              style={{
                padding: isMobile ? '8px 12px' : '8px 16px',
                backgroundColor: '#ff6b35',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: isMobile ? '11px' : '13px',
                fontWeight: '600',
                cursor: 'pointer',
                flex: isMobile ? '1 1 48%' : 'none'
              }}
            >
              Size To Fit
            </button>
            {!isMobile && (
              <>
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
              </>
            )}
          </div>

          <div style={{ 
            display: 'flex', 
            gap: isMobile ? '8px' : '10px', 
            alignItems: 'center',
            flexWrap: 'wrap',
            justifyContent: isMobile ? 'space-between' : 'flex-end'
          }}>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              style={{
                padding: isMobile ? '8px 10px' : '8px 12px',
                backgroundColor: theme === 'light' ? '#fff' : '#3d3d3d',
                color: theme === 'light' ? '#333' : '#fff',
                border: `1px solid ${theme === 'light' ? '#ddd' : '#555'}`,
                borderRadius: '4px',
                fontSize: isMobile ? '12px' : '13px',
                cursor: 'pointer',
                flex: isMobile ? '0 0 auto' : 'none'
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <div style={{
              padding: isMobile ? '8px 12px' : '8px 16px',
              fontSize: isMobile ? '11px' : '13px',
              fontWeight: '600',
              backgroundColor: theme === 'light' ? '#f8f8f8' : '#3d3d3d',
              border: `1px solid ${theme === 'light' ? '#ddd' : '#555'}`,
              borderRadius: '4px',
              color: theme === 'light' ? '#333' : '#fff',
              flex: isMobile ? '1 1 100%' : 'none',
              textAlign: isMobile ? 'center' : 'left',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              File: <span style={{ color: '#ff6b35' }}>{fileName}</span>
            </div>
          </div>
        </div>

        {/* Grid Section */}
        <div style={{ padding: '0' }}>
          {loading ? (
            <div style={{
              padding: isMobile ? '40px 20px' : '60px',
              textAlign: 'center',
              fontSize: isMobile ? '14px' : '16px',
              color: theme === 'light' ? '#666' : '#999',
              backgroundColor: theme === 'light' ? '#fff' : '#2d2d2d'
            }}>
              <div style={{
                display: 'inline-block',
                width: isMobile ? '30px' : '40px',
                height: isMobile ? '30px' : '40px',
                border: '4px solid rgba(255, 107, 53, 0.2)',
                borderTopColor: '#ff6b35',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <div style={{ marginTop: '16px' }}>Loading data...</div>
            </div>
          ) : getCurrentRowData().length === 0 ? (
            <div style={{
              padding: isMobile ? '40px 20px' : '60px',
              textAlign: 'center',
              fontSize: isMobile ? '14px' : '16px',
              color: theme === 'light' ? '#666' : '#999',
              backgroundColor: theme === 'light' ? '#fff' : '#2d2d2d'
            }}>
              No Rows To Show
            </div>
          ) : (
            <div
              className={themeClass}
              style={{
                height: isMobile ? 'calc(100vh - 280px)' : 'calc(100vh - 200px)',
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
                paginationPageSizeSelector={isMobile ? [5, 10, 20] : [10, 20, 50, 100]}
                suppressMovableColumns={false}
                animateRows={true}
                domLayout='normal'
                headerHeight={isMobile ? 36 : 40}
                rowHeight={isMobile ? 34 : 38}
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

        .ag-theme-alpine .ag-header-cell,
        .ag-theme-alpine-dark .ag-header-cell {
          font-size: ${isMobile ? '11px' : '13px'};
        }

        .ag-theme-alpine .ag-cell,
        .ag-theme-alpine-dark .ag-cell {
          font-size: ${isMobile ? '11px' : '13px'};
        }

        .ag-theme-alpine ::-webkit-scrollbar,
        .ag-theme-alpine-dark ::-webkit-scrollbar {
          width: ${isMobile ? '6px' : '10px'};
          height: ${isMobile ? '6px' : '10px'};
        }

        @media (max-width: 768px) {
          .ag-theme-alpine .ag-paging-panel,
          .ag-theme-alpine-dark .ag-paging-panel {
            font-size: 11px;
          }

          .ag-theme-alpine .ag-paging-button,
          .ag-theme-alpine-dark .ag-paging-button {
            min-width: 30px;
          }
        }
      `}</style>
    </div>
  );
};

export default MaterialStockManager;