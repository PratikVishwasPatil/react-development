import React, { useEffect, useMemo, useState, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import axios from "axios";
import { Form, Accordion, Row, Col, Button } from "react-bootstrap";
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

const ManufacturingDataYearlyGrid = () => {
    const [theme, setTheme] = useState('light');
    const [rowData, setRowData] = useState([]);
    const [columnDefs, setColumnDefs] = useState([]);
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [file, setFile] = useState(null);
    const gridRef = useRef();

    // Toast notification function
    const showToast = (message, type = 'info') => {
        const toastDiv = document.createElement('div');
        toastDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
            color: white;
            border-radius: 5px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.2);
            z-index: 9999;
            font-family: Arial, sans-serif;
            animation: slideIn 0.3s ease-out;
        `;
        toastDiv.textContent = message;
        document.body.appendChild(toastDiv);
        
        setTimeout(() => {
            toastDiv.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => document.body.removeChild(toastDiv), 300);
        }, 3000);
    };
    useEffect(() => {
      fetchManufacturingDataYearly();
  }, []);
    // Add animation styles
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(400px); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

      
      
    const currencyFormatter = (params) => {
        if (!params.value) return '';
        return "₹ " + Number(params.value).toLocaleString("en-IN");
      };

    const formatNumberWithCommas = (value) => {
        if (value === null || value === undefined || value === '') return value;
        // Check if value is a number or can be converted to number
        const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
        if (isNaN(num)) return value;
        return num.toLocaleString('en-IN');
    };
    const staticColumnDefs = [
        { headerName: "Mktg Owner",field: 'Mktg_Owner', floatingFilter:true,pinned: 'left'},
        { headerName: "Design Owner/File Done By",field: 'Design_Owner_File_Done_By', floatingFilter:true},
        { headerName: "Sr. No.",field: 'Sr_No', floatingFilter:true,cellClass: 'ag-right-aligned-cell'},
        { headerName: "File No",field: 'file', floatingFilter:true },
        { headerName: "F.Y.",field: 'year', floatingFilter:true  },
        { headerName: "PO No.",field: 'po', floatingFilter:true, hide:false},
        { headerName: "PO Date",field: 'date', floatingFilter:true, hide:false },
        { headerName: "Client",field: 'client', floatingFilter:true},
        { headerName: "City",field: 'city',floatingFilter:true},
        { headerName: "State",field: 'state',floatingFilter:true},
        { headerName: "Unit Location",field: 'uloc',floatingFilter:true},
        { headerName: "Store Location",field: 'sloc',floatingFilter:true},
        { headerName: "Product",field: 'product',floatingFilter:true},
        { headerName: "Product Description + Highlights",field: 'desc',floatingFilter:true},
        { headerName: "Person",field: 'person',floatingFilter:true},
        { headerName: "Qtn No.",field: 'qtn',floatingFilter:true},
        { headerName: "QtnDate",field: 'qtnDate',floatingFilter:true},
        { headerName: "On",field: 'On',floatingFilter:true,cellClass: 'ag-right-aligned-cell'},
        { headerName: "Invoice No.",field: 'inv',floatingFilter:true},
        { headerName: "Invoice Date",field: 'invDate',floatingFilter:true},
        { headerName: "Supply PO Basic Amt",field: 'poAmt',floatingFilter:true,cellClass: 'ag-right-aligned-cell',valueFormatter: currencyFormatter},
        { headerName: "TAX",field: 'tax',floatingFilter:true},
        { headerName: "Bill Amt W/O Tax",field: 'billAmt',floatingFilter:true,cellClass: 'ag-right-aligned-cell',valueFormatter: currencyFormatter},
        { headerName: "Bill Amt With Tax",field: 'billAmtTax',floatingFilter:true,cellClass: 'ag-right-aligned-cell',valueFormatter: currencyFormatter},
        { headerName: "Labour PO Basic Amt",field: 'labour_basic_amt',floatingFilter:true,cellClass: 'ag-right-aligned-cell',valueFormatter: currencyFormatter},
        { headerName: "Labour File No.",field: 'labour_file_no',floatingFilter:true},
        { headerName: "Total PO Amount",field: 'totalPOAmt',floatingFilter:true,cellClass: 'ag-right-aligned-cell',valueFormatter: currencyFormatter},
        { headerName: "R/M Cost Mktg (A)",field: 'RM_Cost_Mktg_A',floatingFilter:true,cellClass: 'ag-right-aligned-cell',valueFormatter: currencyFormatter},
        { headerName: "R/M Cost Design (B)",field: 'RM_Cost_Design_B',floatingFilter:true,cellClass: 'ag-right-aligned-cell',valueFormatter: currencyFormatter},
        { headerName: "(A)-(B)",field: 'A-B',floatingFilter:true,cellClass: 'ag-right-aligned-cell',valueFormatter: currencyFormatter}
        
      ];
    const defaultColDef = useMemo(() => ({
        filter: true,
        sortable: true,
        floatingFilter: !isMobile,
        resizable: true,
        suppressMenu: isMobile,
       
    }), [isMobile]);

    // Fetch PPC project list data
    const fetchManufacturingDataYearly = async () => {
      try {
        const res = await axios.get(
          "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/get_genReport_Data_23.php"
        );
    
        if (res.data) {
          setRowData(res.data);
    
          setColumnDefs(staticColumnDefs);
    
          showToast(`Loaded ${res.data.length} records`, 'success');
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    


    // Load data when financial year changes
 

    // Handle selection changed - auto navigate
    
    

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    // Export to CSV
    const downloadExcel = () => {
        if (!gridRef.current?.api) return;

        try {
            const params = {
                fileName: `ManufacturingDataYearly_${new Date().toISOString().split('T')[0]}.csv`,
                allColumns: true,
                onlySelected: false
            };
            gridRef.current.api.exportDataAsCsv(params);
            showToast('Data exported successfully!', 'success');
        } catch (error) {
            console.error('Error exporting data:', error);
            showToast('Error exporting data', 'error');
        }
    };

    // Auto size columns
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

    // Refresh data
    const handleRefresh = () => {
        // if (selectedFinancialYear) {
             fetchManufacturingDataYearly();
        //     showToast('Refreshing data...', 'info');
        // }erp.
    };
   // const [file, setFile] = useState(null);

    // Handle file selection
  const handleFileChange = (e) => setFile(e.target.files[0]);

  // Handle file upload
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file!");
      return;
    }

    const formData = new FormData();
    formData.append("filename[]", file);

    try {
      const res = await fetch(
        "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/upload_genReport_23.php",
        { method: "POST", body: formData }
      );
      const data = await res.json();
      if (data.success) {
        showToast('File uploaded successfully!', 'success');
      
        fetchManufacturingDataYearly(); // Refresh grid data
        setFile(null);
      } else {
        alert("Upload failed: " + data.message);
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed!");
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
    const gridHeight = isFullScreen ? 'calc(100vh - 240px)' : (isMobile ? '400px' : '600px');

    // Apply theme to document body
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

    if (loading && rowData.length === 0) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: themeStyles.backgroundColor
            }}>
                <div style={{ textAlign: 'center', color: themeStyles.color }}>
                    <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem', borderColor: '#007bff', borderRightColor: 'transparent' }}>
                        <span style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden' }}>Loading...</span>
                    </div>
                    <p style={{ marginTop: '1rem' }}>Loading PPC project data...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: themeStyles.backgroundColor,
            color: themeStyles.color,
            padding: 0,
            margin: 0
        }}>
            <div style={{ 
                width: '100%', 
                maxWidth: isFullScreen ? '100%' : '1400px',
                margin: '0 auto',
                padding: isFullScreen ? 0 : '20px'
            }}>
              
              <Form onSubmit={handleSubmit}>
            <Accordion defaultActiveKey="0">
              <Accordion.Item eventKey="0">
                <Accordion.Header>Upload Yearly Manufacturing Data</Accordion.Header>
                <Accordion.Body>
                  <Row className="align-items-center">
                    <Col md={4}>
                      <Form.Group className="mb-0">
                        <Form.Label>Upload Excel File</Form.Label>
                        <Form.Control
                          key={file ? file.name : ""}
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={handleFileChange}
                        />
                      </Form.Group>
                    </Col>
    
                    <Col md={5} className="d-flex gap-2">
                      <Button
                        type="submit"
                        className="px-4 btn btn-primary btn-sm mt-4"
                      >
                        Submit
                      </Button>
    
                      <Button
                        type="button"
                        className="px-4 btn btn-danger btn-sm mt-4"
                        onClick={() => setFile(null)}
                      >
                        Reset
                      </Button>
                    </Col>
                  </Row>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Form>
    
                <div style={{
                    backgroundColor: themeStyles.cardBg,
                    color: themeStyles.color,
                    border: theme === 'dark' ? '1px solid #495057' : '1px solid #dee2e6',
                    borderRadius: isFullScreen ? 0 : '8px',
                    overflow: 'hidden'
                }}>
                    {/* Header */}
                    <div style={{
                        background: themeStyles.cardHeader,
                        color: theme === 'dark' ? '#ffffff' : '#000000',
                        fontFamily: "'Maven Pro', sans-serif",
                        padding: '1rem 2rem'
                    }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                            <div style={{ flex: isMobile ? '1 1 100%' : '1 1 auto' }}>
                                <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span>📋</span>
                                    Manufacturing Data Yearly
                                </h4>
                                <small style={{ opacity: 0.8 }}>
                                    {`${rowData.length} records found`}
                                    {selectedRows.length > 0 && ` | ${selectedRows.length} selected`}
                                </small>
                            </div>

                            <div style={{ 
                                display: 'flex', 
                                flexWrap: 'wrap',
                                gap: '0.5rem',
                                alignItems: 'center',
                                flex: isMobile ? '1 1 100%' : '0 1 auto'
                            }}>
                                
                                {/* Action Buttons */}
                                <button
                                    onClick={handleRefresh}
                                    disabled={loading}
                                    style={{
                                        padding: '0.375rem 0.75rem',
                                        fontSize: '0.875rem',
                                        borderRadius: '0.25rem',
                                        border: '1px solid #007bff',
                                        backgroundColor: 'transparent',
                                        color: '#007bff',
                                        cursor: 'pointer'
                                    }}
                                    title="Refresh data"
                                >
                                    🔄 {!isMobile && 'Refresh'}
                                </button>

                                <button
                                    onClick={downloadExcel}
                                    style={{
                                        padding: '0.375rem 0.75rem',
                                        fontSize: '0.875rem',
                                        borderRadius: '0.25rem',
                                        border: 'none',
                                        backgroundColor: '#28a745',
                                        color: 'white',
                                        cursor: 'pointer'
                                    }}
                                >
                                    📊 {!isMobile && 'Export CSV'}
                                </button>

                                <button
                                    onClick={autoSizeAll}
                                    style={{
                                        padding: '0.375rem 0.75rem',
                                        fontSize: '0.875rem',
                                        borderRadius: '0.25rem',
                                        border: 'none',
                                        backgroundColor: '#17a2b8',
                                        color: 'white',
                                        cursor: 'pointer'
                                    }}
                                >
                                    ⇔ {!isMobile && 'Auto Size'}
                                </button>

                                <button
                                    onClick={toggleFullScreen}
                                    style={{
                                        padding: '0.375rem 0.75rem',
                                        fontSize: '0.875rem',
                                        borderRadius: '0.25rem',
                                        border: '1px solid #6c757d',
                                        backgroundColor: 'transparent',
                                        color: theme === 'dark' ? '#ffffff' : '#000000',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {isFullScreen ? '🗗' : '🗖'} {!isMobile && (isFullScreen ? 'Exit' : 'Full')}
                                </button>

                                <button
                                    onClick={toggleTheme}
                                    style={{
                                        padding: '0.375rem 0.75rem',
                                        fontSize: '0.875rem',
                                        borderRadius: '0.25rem',
                                        border: '1px solid #6c757d',
                                        backgroundColor: 'transparent',
                                        color: theme === 'dark' ? '#ffffff' : '#000000',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {theme === 'light' ? '🌙' : '☀️'} {!isMobile && (theme === 'light' ? 'Dark' : 'Light')}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Grid Body */}
                    <div style={{
                        backgroundColor: themeStyles.cardBg,
                        padding: isFullScreen ? 0 : '15px'
                    }}>
                        {rowData.length === 0 && !loading ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '50px',
                                color: themeStyles.color
                            }}>
                                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📋</div>
                                <h5>No Manufacturing Data available</h5>
                               
                                <button
                                    onClick={handleRefresh}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        fontSize: '1rem',
                                        borderRadius: '0.25rem',
                                        border: 'none',
                                        backgroundColor: '#007bff',
                                        color: 'white',
                                        cursor: 'pointer',
                                        marginTop: '1rem'
                                    }}
                                >
                                    🔄 Refresh Data
                                </button>
                            </div>
                        ) : (
                            <div
                                className="ag-theme-alpine"
                                style={{
                                    height: gridHeight,
                                    width: "100%",
                                    ...(theme === 'dark' && {
                                        '--ag-background-color': '#212529',
                                        '--ag-header-background-color': '#343a40',
                                        '--ag-odd-row-background-color': '#2c3034',
                                        '--ag-even-row-background-color': '#212529',
                                        '--ag-row-hover-color': '#495057',
                                        '--ag-foreground-color': '#f8f9fa',
                                        '--ag-header-foreground-color': '#f8f9fa',
                                        '--ag-border-color': '#495057',
                                        '--ag-selected-row-background-color': '#28a745',
                                        '--ag-input-background-color': '#343a40',
                                        '--ag-input-border-color': '#495057'
                                    })
                                }}
                            >
                                <AgGridReact
                                    ref={gridRef}
                                    rowData={rowData}
                                    columnDefs={columnDefs}
                                    defaultColDef={defaultColDef}
                                    pagination={true}
                                    paginationPageSize={isMobile ? 10 : 25}
                                   // rowSelection="single"
                                   // onSelectionChanged={onSelectionChanged}
                                    suppressMovableColumns={isMobile}
                                    enableRangeSelection={!isMobile}
                                    rowMultiSelectWithClick={false}
                                    animateRows={!isMobile}
                                    enableCellTextSelection={true}
                                    suppressHorizontalScroll={false}
                                    headerHeight={isMobile ? 40 : 48}
                                    rowHeight={isMobile ? 35 : 42}
                                    onGridReady={(params) => {
                                        console.log('PPC Project Grid is ready');
                                        setTimeout(() => autoSizeAll(), 500);
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManufacturingDataYearlyGrid;