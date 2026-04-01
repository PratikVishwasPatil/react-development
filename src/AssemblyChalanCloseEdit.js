import React, { useState, useEffect, useRef, useMemo } from 'react';
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
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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



const AssemblyChalanTable = () => {
  const [theme, setTheme] = useState('light');
  const [rowData, setRowData] = useState([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(10);
  // Add this state at the top with other useState declarations
const [showConfirm, setShowConfirm] = useState(false);
const [confirmData, setConfirmData] = useState(null);
  const gridRef = useRef();

  const formTitle = "Assembly Chalan Close Edit";

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/AssemblyChalanCloseEditApi.php');
      const result = await response.json();
      if (result.status && result.data) {
        setRowData(result.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (data) => {
    try {
      const response = await fetch('https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/updateAsslyEditApi.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dcid: data.dcid,
          labouramount: data.labouramount,
          comment: data.comment
        })
      });
  
      const result = await response.json();
      
      if (result.status === 'success') {
        // alert(`Success: ${result.message}`);
        toast.success(`Success: ${result.message}`);
        fetchData();
      } else {
        // alert(`Error: ${result.message}`);
        toast.error(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Error updating:', error);
      // alert('Failed to update. Please try again.');
      toast.error('Failed to update. Please try again.');
    }
  };
  
  // Update the handleMarkDispatch function
  const handleMarkDispatch = (data) => {
    setConfirmData(data);
    setShowConfirm(true);
  };
  
  const confirmMarkDispatch = async () => {
    setShowConfirm(false);
    
    try {
      const response = await fetch('https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/markDispatchAsslyEditApi.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dcid: confirmData.dcid,
          fileid: confirmData.fileid || '',
          vendorid: confirmData.vendorid || '',
          challanNo: confirmData.challanno || '',
          challanclosedate: confirmData.challanclosedate || '',
          labouramount: confirmData.labouramount || 0,
          comment: confirmData.comment || ''
        })
      });
  
      const result = await response.json();
      
      if (result.status === 'success') {
        // alert(`Success: ${result.message}`);
        toast.success(`Success: ${result.message}`);
        fetchData();
      } else {
        // alert(`Error: ${result.message}`);
        toast.error(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Error marking dispatch:', error);
      // alert('Failed to mark as dispatch. Please try again.');
      toast.error('Failed to mark as dispatch. Please try again.');
    }
  };
  

  // Editable Cell Renderer for Old Labour Amount
  const EditableNumberCell = (props) => {
    const [editMode, setEditMode] = useState(false);
    const currentValue = props.data[props.column.colId] || '';
    const [inputValue, setInputValue] = useState(currentValue);

    useEffect(() => {
      setInputValue(props.data[props.column.colId] || '');
    }, [props.data, props.column.colId]);

    const handleInputChange = (e) => {
      setInputValue(e.target.value);
    };

    const handleBlur = () => {
      props.node.setDataValue(props.column.colId, inputValue);
      setEditMode(false);
    };

    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        props.node.setDataValue(props.column.colId, inputValue);
        setEditMode(false);
      }
    };

    if (editMode) {
      return (
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyPress={handleKeyPress}
          style={{
            width: '100%',
            height: '100%',
            border: '2px solid #007bff',
            borderRadius: '3px',
            fontSize: '11px',
            textAlign: 'right',
            backgroundColor: '#fff9e6',
            padding: '4px',
            outline: 'none'
          }}
          autoFocus
        />
      );
    }

    return (
      <div
        style={{
          width: '100%',
          textAlign: 'right',
          cursor: 'pointer',
          padding: '4px',
          fontSize: '11px'
        }}
        onClick={() => setEditMode(true)}
      >
        {currentValue}
      </div>
    );
  };

  // Editable Cell Renderer for Comment
  const EditableTextCell = (props) => {
    const [editMode, setEditMode] = useState(false);
    const currentValue = props.data[props.column.colId] || '';
    const [inputValue, setInputValue] = useState(currentValue);

    useEffect(() => {
      setInputValue(props.data[props.column.colId] || '');
    }, [props.data, props.column.colId]);

    const handleInputChange = (e) => {
      setInputValue(e.target.value);
    };

    const handleBlur = () => {
      props.node.setDataValue(props.column.colId, inputValue);
      setEditMode(false);
    };

    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        props.node.setDataValue(props.column.colId, inputValue);
        setEditMode(false);
      }
    };

    if (editMode) {
      return (
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyPress={handleKeyPress}
          style={{
            width: '100%',
            height: '100%',
            border: '2px solid #007bff',
            borderRadius: '3px',
            fontSize: '11px',
            backgroundColor: '#fff9e6',
            padding: '4px',
            outline: 'none'
          }}
          autoFocus
        />
      );
    }

    return (
      <div
        style={{
          width: '100%',
          cursor: 'pointer',
          padding: '4px',
          fontSize: '11px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
        onClick={() => setEditMode(true)}
        title={currentValue}
      >
        {currentValue}
      </div>
    );
  };

  // Update Button Renderer
  const UpdateButtonRenderer = (props) => {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        height: '100%',
        justifyContent: 'center'
      }}>
        <button
          onClick={() => handleUpdate(props.data)}
          style={{
            background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '4px 12px',
            fontSize: '10px',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,123,255,0.2)',
            fontWeight: '500'
          }}
        >
          Update
        </button>
      </div>
    );
  };

  // Mark Dispatch Button Renderer
  const DispatchButtonRenderer = (props) => {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        height: '100%',
        justifyContent: 'center'
      }}>
        <button
          onClick={() => handleMarkDispatch(props.data)}
          style={{
            background: 'linear-gradient(135deg, #28a745 0%, #218838 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '4px 10px',
            fontSize: '10px',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(40,167,69,0.2)',
            fontWeight: '500',
            whiteSpace: 'nowrap'
          }}
        >
          Mark Disp
        </button>
      </div>
    );
  };

  const columnDefs = useMemo(() => [
    {
      headerName: 'Sr. No.',
      field: 'count',
      width: 90,
      cellStyle: { 
        fontWeight: 'bold', 
        textAlign: 'center', 
        backgroundColor: '#f8f9fa', 
        fontSize: '11px' 
      }
    },
    {
      headerName: 'File Name',
      field: 'file_name',
      width: 140,
      cellStyle: { 
        backgroundColor: '#f8f9fa', 
        fontSize: '11px',
        fontWeight: 'normal'
      }
    },
    {
      headerName: 'DC No',
      field: 'dcid',
      width: 130,
      cellStyle: { 
        backgroundColor: '#f8f9fa', 
        fontSize: '11px',
        fontWeight: 'normal'
      }
    },
    {
      headerName: 'DC Date',
      field: 'dc_date',
      width: 120,
      cellStyle: { 
        textAlign: 'center', 
        backgroundColor: '#f8f9fa', 
        fontSize: '11px',
        fontWeight: 'normal'
      }
    },
    {
      headerName: 'DC Amt',
      field: 'approx_value',
      width: 120,
      cellStyle: { 
        textAlign: 'right', 
        backgroundColor: '#f8f9fa', 
        fontSize: '11px', 
        fontWeight: 'bold' 
      },
      valueFormatter: (params) => params.value ? params.value.toLocaleString('en-IN') : '0'
    },
    {
      headerName: 'Chalan No.',
      field: 'challanno',
      width: 110,
      cellStyle: { 
        textAlign: 'center', 
        backgroundColor: '#f8f9fa', 
        fontSize: '11px',
        fontWeight: 'normal'
      }
    },
    {
      headerName: 'Chalan Close Date',
      field: 'challanclosedate',
      width: 150,
      cellStyle: { 
        textAlign: 'center', 
        backgroundColor: '#f8f9fa', 
        fontSize: '11px',
        fontWeight: 'normal'
      }
    },
    {
      headerName: 'Old Labour Amt',
      field: 'labouramount',
      width: 140,
      cellRenderer: EditableNumberCell,
      cellStyle: { 
        backgroundColor: '#fff9e6', 
        textAlign: 'right', 
        fontSize: '11px',
        fontWeight: 'normal'
      }
    },
    {
      headerName: 'Comment',
      field: 'comment',
      width: 180,
      cellRenderer: EditableTextCell,
      cellStyle: { 
        backgroundColor: '#fff9e6', 
        fontSize: '11px',
        fontWeight: 'normal'
      }
    },
    {
      headerName: 'Actions',
      field: 'actions',
      width: 110,
      cellRenderer: UpdateButtonRenderer,
      cellStyle: { 
        textAlign: 'center', 
        backgroundColor: '#f8f9fa',
        fontWeight: 'normal'
      },
      sortable: false,
      filter: false
    },
    {
      headerName: 'Dispatch',
      field: 'dispatch',
      width: 120,
      cellRenderer: DispatchButtonRenderer,
      cellStyle: { 
        textAlign: 'center', 
        backgroundColor: '#f8f9fa',
        fontWeight: 'normal'
      },
      sortable: false,
      filter: false
    }
  ], []);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    floatingFilter: !isMobile,
    cellStyle: { textAlign: 'right', fontSize: '11px' }

  }), [isMobile]);

  const onCellValueChanged = (params) => {
    console.log('Cell value changed:', params.data);
  };

  const calculateTotal = () => {
    return rowData.reduce((sum, row) => sum + parseFloat(row.approx_value || 0), 0);
  };

  const pinnedBottomRowData = useMemo(() => {
    if (rowData.length === 0) return [];
    
    const total = calculateTotal();
    
    return [{
      count: '',
      file_name: '',
      dcid: '',
      dc_date: 'Total',
      approx_value: total,
      challanno: '',
      challanclosedate: '',
      labouramount: '',
      comment: '',
      actions: 'update',
      dispatch: ''
    }];
  }, [rowData]);

  const getRowStyle = (params) => {
    if (params.node.rowPinned) {
      return { 
        backgroundColor: '#FED7AA', 
        fontWeight: 'bold',
        fontSize: '11px'
      };
    }
  };

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const downloadExcel = () => {
    if (!gridRef.current?.api) return;

    try {
      const params = {
        fileName: `Assembly_Chalan_${new Date().toISOString().split('T')[0]}.csv`,
        allColumns: true,
        columnKeys: columnDefs.filter(col => col.field !== 'actions' && col.field !== 'dispatch').map(col => col.field)
      };

      gridRef.current.api.exportDataAsCsv(params);
    } catch (error) {
      console.error("Error exporting CSV:", error);
    }
  };

  const autoSizeAll = () => {
    if (!gridRef.current?.api) return;

    try {
      setTimeout(() => {
        const allColumnIds = gridRef.current.api.getColumns()?.map(column => column.getId()) || [];
        if (allColumnIds.length > 0) {
          gridRef.current.api.autoSizeColumns(allColumnIds, false);
        }
      }, 100);
    } catch (error) {
      console.error('Error auto-sizing columns:', error);
    }
  };

  const getThemeStyles = () => {
    if (theme === 'dark') {
      return {
        backgroundColor: 'linear-gradient(135deg, #21262d 0%, #161b22 100%)',
        color: '#f8f9fa',
        cardBg: '#343a40',
        cardHeader: 'linear-gradient(135deg, #495057 0%, #343a40 100%)'
      };
    }
    return {
      backgroundColor: 'linear-gradient(135deg, #f8f9ff 0%, #e6f3ff 100%)',
      color: '#212529',
      cardBg: '#ffffff',
      cardHeader: 'linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%)'
    };
  };

  const themeStyles = getThemeStyles();
  const gridHeight = isFullScreen ? 'calc(100vh - 180px)' : (isMobile ? '400px' : '600px');

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: themeStyles.backgroundColor
      }}>
        <div style={{ textAlign: 'center', color: themeStyles.color }}>
          <div style={{ 
            width: '3rem', 
            height: '3rem', 
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }} />
          <p style={{ marginTop: '1rem' }}>Loading data...</p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); }}`}</style>
        </div>
      </div>
    );
  }

  const totalRecords = rowData.length;
  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <div 
      className="assembly-chalan-close-edit-wrapper"
      style={{
        minHeight: '100vh',
        background: themeStyles.backgroundColor,
        color: themeStyles.color,
        padding: 0,
        margin: 0
      }}
    >
      {/* Scoped styles ONLY for this component */}
      <style>
        {`
          /* Scope all styles to this specific component only */
          .assembly-chalan-close-edit-wrapper .ag-theme-alpine .ag-checkbox-input-wrapper {
            width: 16px !important;
            height: 16px !important;
          }
          .assembly-chalan-close-edit-wrapper .ag-theme-alpine .ag-checkbox-input-wrapper input {
            width: 16px !important;
            height: 16px !important;
          }
          .assembly-chalan-close-edit-wrapper .ag-theme-alpine .ag-header-cell {
            font-size: ${isMobile ? '10px' : '11px'} !important;
            font-weight: bold !important;
            background-color: #e9ecef !important;
          }
          .assembly-chalan-close-edit-wrapper .ag-theme-alpine .ag-cell {
            font-size: ${isMobile ? '9px' : '10px'} !important;
          }
          .assembly-chalan-close-edit-wrapper .ag-theme-alpine .ag-row-hover {
            background-color: #f1f3f5 !important;
          }
          ${theme === 'dark' ? `
            .assembly-chalan-close-edit-wrapper .ag-theme-alpine {
              --ag-background-color: #212529;
              --ag-header-background-color: #343a40;
              --ag-odd-row-background-color: #2c3034;
              --ag-even-row-background-color: #212529;
              --ag-row-hover-color: #495057;
              --ag-foreground-color: #f8f9fa;
              --ag-header-foreground-color: #f8f9fa;
              --ag-border-color: #495057;
            }
          ` : ''}
        `}
      </style>

      <div style={{ padding: isFullScreen ? 0 : '0 20px' }}>
        <div style={{
          backgroundColor: themeStyles.cardBg,
          color: themeStyles.color,
          border: theme === 'dark' ? '1px solid #495057' : '1px solid #dee2e6',
          margin: isFullScreen ? 0 : 20,
          borderRadius: isFullScreen ? 0 : 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          {/* Header */}
          <div style={{
            background: themeStyles.cardHeader,
            color: theme === 'dark' ? '#ffffff' : '#000000',
            fontFamily: "'Maven Pro', sans-serif",
            padding: '1rem 2rem',
            borderBottom: '1px solid #dee2e6'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>{formTitle}</h4>
                <small style={{ opacity: 0.8 }}>
                  {`${totalRecords} records found`}
                </small>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  onClick={downloadExcel}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Export CSV
                </button>
                <button
                  onClick={autoSizeAll}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    background: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Auto Size
                </button>
                <button
                  onClick={toggleFullScreen}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {isFullScreen ? 'Exit' : 'Full'}
                </button>
                <button
                  onClick={toggleTheme}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {theme === 'light' ? 'Dark' : 'Light'}
                </button>
              </div>
            </div>
          </div>

          {/* Grid Body */}
          <div style={{
            backgroundColor: themeStyles.cardBg,
            padding: isFullScreen ? 0 : 15
          }}>
            {totalRecords === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '50px',
                color: themeStyles.color
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📋</div>
                <h5>No data available</h5>
                <p>Please check your API connection.</p>
              </div>
            ) : (
              <div style={{ height: gridHeight, backgroundColor: 'white', border: '1px solid #ddd' }}>
                <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' }}>
                  <AgGridReact
                    ref={gridRef}
                    rowData={rowData}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    pinnedBottomRowData={pinnedBottomRowData}
                    onCellValueChanged={onCellValueChanged}
                    getRowStyle={getRowStyle}
                    pagination={true}
                    paginationPageSize={pageSize}
                    animateRows={!isMobile}
                    rowHeight={isMobile ? 28 : 32}
                    headerHeight={isMobile ? 30 : 35}
                    enableCellTextSelection={true}
                    onGridReady={() => {
                      setTimeout(() => autoSizeAll(), 500);
                    }}
                  />
                </div>
              </div>
            )}

            {showConfirm && (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999
  }}>
    <div style={{
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      maxWidth: '400px',
      width: '90%'
    }}>
      <h5 style={{ marginTop: 0, color: '#000' }}>Confirm Dispatch</h5>
      <p style={{ color: '#000' }}>Are you sure you want to mark DC No {confirmData?.dcid} as dispatched?</p>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
        <button
          onClick={() => setShowConfirm(false)}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
        <button
          onClick={confirmMarkDispatch}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
)}
          </div>

          {/* Footer */}
          <div style={{
            backgroundColor: themeStyles.cardBg,
            borderTop: '1px solid #ddd',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '12px',
            padding: '10px 20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>Page Size:</span>
              <select
                style={{ padding: '4px 8px', fontSize: '12px' }}
                value={pageSize}
                onChange={(e) => setPageSize(parseInt(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <div>
              Total: {totalRecords} records
            </div>
            <div>
              Page 1 of {totalPages}
            </div>
          </div>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default AssemblyChalanTable;