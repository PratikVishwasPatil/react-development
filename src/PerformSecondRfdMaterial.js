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
import { 
  Container, 
  Card, 
  Button, 
  Form, 
  Spinner,
  Badge,
  Row,
  Col,
  ButtonGroup
} from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useNavigate } from 'react-router-dom';

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

const PerformRfdMaterialList = () => {
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(true);
  const [materialData, setMaterialData] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('25-26');
  const [isFullScreen, setIsFullScreen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [selectedRows, setSelectedRows] = useState([]);
  const [autoNavigateOnSelect, setAutoNavigateOnSelect] = useState(false);
  const gridRef = useRef();
  const navigate = useNavigate();

  // API URLs
  const MATERIAL_API_URL = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/PPC/PerformRfdMaterialList.php";
  const YEARS_API_URL = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/GetYearsApi.php";

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch years data
  const fetchYears = async () => {
    try {
      const response = await fetch(YEARS_API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.status === "success" && data.data) {
        const sortedYears = data.data
          .sort((a, b) => parseInt(a.sequence_no) - parseInt(b.sequence_no))
          .map(year => ({
            value: year.financial_year,
            label: `20${year.financial_year}`
          }));
        
        setYears(sortedYears);

        if (sortedYears.length > 0) {
          const latestYear = sortedYears[sortedYears.length - 1].value;
          if (!sortedYears.find(y => y.value === selectedYear)) {
            setSelectedYear(latestYear);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching years:", error);
      toast.error(`Error fetching years: ${error.message}`);
    }
  };

  // Fetch material data
  const fetchMaterialData = async (financialYear) => {
    setLoading(true);
    try {
      const response = await fetch(`${MATERIAL_API_URL}?financial_year=${financialYear}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      if (data.status === "success" && data.data) {
        setMaterialData(data.data);
        toast.success(`Loaded ${data.total} records for FY ${financialYear}`);
      } else {
        throw new Error(data.message || "No data received");
      }
    } catch (error) {
      console.error("Error fetching material data:", error);
      toast.error(`Error fetching data: ${error.message}`);
      setMaterialData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchYears();
  }, []);

  useEffect(() => {
    if (selectedYear) {
      fetchMaterialData(selectedYear);
    }
  }, [selectedYear]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // Toggle auto-navigation mode
  const toggleAutoNavigate = () => {
    setAutoNavigateOnSelect(!autoNavigateOnSelect);
    toast.info(`Auto-navigation ${!autoNavigateOnSelect ? 'enabled' : 'disabled'}`);
  };

  // Handle selection changed with auto-navigation support
  const onSelectionChanged = (event) => {
    const selectedNodes = event.api.getSelectedNodes();
    const selectedData = selectedNodes.map(node => node.data);
    setSelectedRows(selectedData);

    // Auto-navigate when a row is selected (if enabled)
    if (autoNavigateOnSelect && selectedData.length === 1) {
      const selectedRecord = selectedData[0];

      // Check if FILE_ID exists
      if (!selectedRecord.FILE_ID) {
        toast.error('File ID not found in selected record');
        return;
      }

      // Show a brief toast before navigating
      toast.info(`Navigating to details for ${selectedRecord.FILE_NAME}...`);

      // Navigate after a short delay to show the toast
      setTimeout(() => {
        // Navigate to the perform RFD detail page with FILE_ID
        navigate(`/ppc/perform-rfd/${selectedRecord.FILE_ID}`);
      }, 500);
    }
  };

  // Handle manual navigation to detail page
  const handleNavigateToDetail = () => {
    if (selectedRows.length === 0) {
      toast.error('Please select at least one record to proceed');
      return;
    }

    if (selectedRows.length > 1) {
      toast.error('Please select only one record at a time');
      return;
    }

    const selectedRecord = selectedRows[0];

    // Check if FILE_ID exists
    if (!selectedRecord.FILE_ID) {
      toast.error('File ID not found in selected record');
      return;
    }

    // Navigate to the perform RFD detail page with FILE_ID
    navigate(`/ppc/perform-second-rfd/${selectedRecord.FILE_ID}`);
  };

  // Theme styles
  const getThemeStyles = () => {
    if (theme === 'dark') {
      return {
        backgroundColor: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
        color: '#f8f9fa',
        cardBg: '#2d3748',
        cardHeader: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        inputBg: '#2d3748',
        inputBorder: '#4a5568',
        inputColor: '#fff',
        tableBg: '#2d3748',
        rowHover: '#4a5568'
      };
    }
    return {
      backgroundColor: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
      color: '#212529',
      cardBg: '#ffffff',
      cardHeader: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      inputBg: '#ffffff',
      inputBorder: '#e2e8f0',
      inputColor: '#212529',
      tableBg: '#ffffff',
      rowHover: '#f7fafc'
    };
  };

  const themeStyles = getThemeStyles();

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

  // AG Grid column definitions
  const columnDefs = useMemo(() => [
    {
      headerName: "Sr No",
      field: "serialNumber",
      valueGetter: (params) => params.node ? params.node.rowIndex + 1 : '',
      width: isMobile ? 70 : 90,
      minWidth: 60,
      pinned: 'left',
      lockPosition: true,
      cellStyle: { fontWeight: 'bold', textAlign: 'center' }
    },
    {
      headerName: "File Name",
      field: "FILE_NAME",
      filter: "agTextColumnFilter",
      sortable: true,
      width: isMobile ? 180 : 250,
      pinned: 'left',
      checkboxSelection: true,
      headerCheckboxSelection: true,
      cellStyle: { fontWeight: '600', color: '#667eea' }
    },
    {
      headerName: "Customer Name",
      field: "CUSTOMER_NAME",
      filter: "agTextColumnFilter",
      sortable: true,
      width: isMobile ? 200 : 350,
      cellStyle: { fontWeight: '500' }
    },
    {
      headerName: "Last Dispatch Date",
      field: "lastDispatchDate",
      filter: "agTextColumnFilter",
      sortable: true,
      width: isMobile ? 150 : 180,
      cellStyle: { textAlign: 'center' },
      cellRenderer: (params) => {
        if (params.value === '-' || !params.value) {
          return (
            <Badge 
              bg="secondary"
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '600',
                borderRadius: '8px'
              }}
            >
              No Dispatch
            </Badge>
          );
        }
        return (
          <Badge 
            bg="success"
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '600',
              borderRadius: '8px'
            }}
          >
            {params.value}
          </Badge>
        );
      }
    },
    {
      field: "FILE_ID",
      headerName: "File ID",
      hide: true,
      width: 0
    }
  ], [isMobile]);

  const defaultColDef = useMemo(() => ({
    resizable: true,
    sortable: true,
    filter: true,
    floatingFilter: !isMobile,
    suppressMenu: isMobile,
  }), [isMobile]);

  const onGridReady = (params) => {
    console.log('Perform RFD Material List Grid is ready');
    setTimeout(() => autoSizeAll(), 500);
  };

  const handleExportCSV = () => {
    if (gridRef.current && gridRef.current.api) {
      gridRef.current.api.exportDataAsCsv({
        fileName: `Perform_RFD_Material_List_${selectedYear}_${new Date().toISOString().split('T')[0]}.csv`
      });
      toast.success('Data exported to CSV');
    }
  };

  const handleRefresh = () => {
    fetchMaterialData(selectedYear);
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

  const getRowStyle = params => {
    return {
      backgroundColor: params.node.rowIndex % 2 === 0 ? themeStyles.tableBg : themeStyles.rowHover
    };
  };

  const gridHeight = isFullScreen ? 'calc(100vh - 220px)' : (isMobile ? '400px' : '600px');

  if (loading && materialData.length === 0) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: themeStyles.backgroundColor
      }}>
        <div style={{ textAlign: 'center' }}>
          <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
          <p className="mt-3" style={{ color: themeStyles.color }}>Loading material data...</p>
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

      <Container fluid={isFullScreen}>
        <Card style={{
          backgroundColor: themeStyles.cardBg,
          color: themeStyles.color,
          border: 'none',
          margin: isFullScreen ? 0 : 20,
          borderRadius: isFullScreen ? 0 : 15,
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <Card.Header style={{
            background: themeStyles.cardHeader,
            color: '#ffffff',
            fontFamily: "'Maven Pro', sans-serif",
            padding: '1.5rem 2rem',
            border: 'none'
          }}>
            <Row className="align-items-center">
              <Col xs={12} lg={6} className="mb-2 mb-lg-0">
                <h3 className="mb-0" style={{ fontWeight: '700' }}>
                  <i className="bi bi-clipboard-data me-3"></i>
                  Perform RFD Material List
                </h3>
                <p className="mb-0 mt-2" style={{ opacity: 0.9, fontSize: '14px' }}>
                  {`${materialData.length} records found for FY ${selectedYear}`}
                  {selectedRows.length > 0 && ` | ${selectedRows.length} selected`}
                  {autoNavigateOnSelect && ' | Auto-nav ON'}
                </p>
              </Col>

              <Col xs={12} lg={6}>
                <div className="d-flex justify-content-end gap-2 flex-wrap align-items-center">
                  {/* Financial Year Selector */}
                  <Form.Select
                    size="sm"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    style={{
                      width: 'auto',
                      minWidth: '130px',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      borderColor: 'rgba(255,255,255,0.3)',
                      color: '#ffffff',
                      fontWeight: '600',
                      borderRadius: '8px'
                    }}
                  >
                    {years.map(year => (
                      <option 
                        key={year.value} 
                        value={year.value}
                        style={{ 
                          backgroundColor: theme === 'dark' ? '#2d3748' : '#ffffff',
                          color: theme === 'dark' ? '#ffffff' : '#2d3748'
                        }}
                      >
                        FY {year.label}
                      </option>
                    ))}
                  </Form.Select>

                  {/* Auto-Navigate Toggle */}
                  <Button
                    variant={autoNavigateOnSelect ? "success" : "light"}
                    size="sm"
                    onClick={toggleAutoNavigate}
                    title="Toggle auto-navigation on checkbox select"
                    style={{ 
                      fontWeight: '600',
                      borderRadius: '8px'
                    }}
                  >
                    <i className="bi bi-lightning"></i>
                    {!isMobile && ' Auto'}
                  </Button>

                  {/* Navigate to Detail Button (only show if auto-navigate is disabled) */}
                  {!autoNavigateOnSelect && selectedRows.length > 0 && (
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={handleNavigateToDetail}
                      style={{ 
                        fontWeight: '600',
                        borderRadius: '8px'
                      }}
                    >
                      <i className="bi bi-pencil-square"></i>
                      {!isMobile && ' View Details'}
                    </Button>
                  )}

                  <ButtonGroup size="sm">
                    <Button
                      variant="light"
                      onClick={handleRefresh}
                      disabled={loading}
                      style={{ 
                        borderRadius: '8px 0 0 8px',
                        fontWeight: '600'
                      }}
                    >
                      <i className="bi bi-arrow-clockwise"></i>
                      {!isMobile && ' Refresh'}
                    </Button>
                    <Button
                      variant="light"
                      onClick={handleExportCSV}
                      style={{ fontWeight: '600' }}
                    >
                      <i className="bi bi-download"></i>
                      {!isMobile && ' Export'}
                    </Button>
                    <Button
                      variant="info"
                      onClick={autoSizeAll}
                      style={{ 
                        borderRadius: '0 8px 8px 0',
                        fontWeight: '600'
                      }}
                    >
                      <i className="bi bi-arrows-angle-expand"></i>
                      {!isMobile && ' Auto Size'}
                    </Button>
                  </ButtonGroup>

                  <ButtonGroup size="sm">
                    <Button
                      variant="light"
                      onClick={toggleFullScreen}
                      style={{ 
                        borderRadius: '8px 0 0 8px',
                        fontWeight: '600'
                      }}
                    >
                      <i className={`bi ${isFullScreen ? 'bi-fullscreen-exit' : 'bi-fullscreen'}`}></i>
                      {!isMobile && (isFullScreen ? ' Exit' : ' Full')}
                    </Button>
                    <Button
                      variant="light"
                      onClick={toggleTheme}
                      style={{ 
                        borderRadius: '0 8px 8px 0',
                        fontWeight: '600'
                      }}
                    >
                      {theme === 'light' ? '🌙' : '☀️'}
                      {!isMobile && (theme === 'light' ? ' Dark' : ' Light')}
                    </Button>
                  </ButtonGroup>
                </div>
              </Col>
            </Row>
          </Card.Header>

          <Card.Body style={{
            backgroundColor: themeStyles.cardBg,
            padding: 0
          }}>
            {materialData.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '80px 20px',
                color: themeStyles.color
              }}>
                <i className="bi bi-inbox" style={{ fontSize: '4rem', marginBottom: '20px', opacity: 0.5 }}></i>
                <h4>No Material Data Available</h4>
                <p style={{ opacity: 0.7 }}>
                  Please select a different financial year or check your connection.
                </p>
                <Button 
                  variant="primary" 
                  onClick={handleRefresh}
                  style={{
                    marginTop: '20px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '10px 30px',
                    fontWeight: '600'
                  }}
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Retry
                </Button>
              </div>
            ) : (
              <div
                className="ag-theme-alpine"
                style={{
                  height: gridHeight,
                  width: '100%',
                  ...(theme === 'dark' && {
                    '--ag-background-color': '#2d3748',
                    '--ag-header-background-color': '#667eea',
                    '--ag-odd-row-background-color': '#2d3748',
                    '--ag-even-row-background-color': '#374151',
                    '--ag-row-hover-color': '#4a5568',
                    '--ag-foreground-color': '#f8f9fa',
                    '--ag-header-foreground-color': '#ffffff',
                    '--ag-border-color': '#4a5568',
                    '--ag-selected-row-background-color': '#667eea',
                    '--ag-input-background-color': '#2d3748',
                    '--ag-input-border-color': '#4a5568'
                  }),
                  ...(theme === 'light' && {
                    '--ag-header-background-color': '#667eea',
                    '--ag-header-foreground-color': '#ffffff',
                    '--ag-selected-row-background-color': 'rgba(102, 126, 234, 0.2)'
                  })
                }}
              >
                <AgGridReact
                  ref={gridRef}
                  rowData={materialData}
                  columnDefs={columnDefs}
                  defaultColDef={defaultColDef}
                  pagination={true}
                  paginationPageSize={isMobile ? 10 : 20}
                  rowSelection="single"
                  onSelectionChanged={onSelectionChanged}
                  onGridReady={onGridReady}
                  getRowStyle={getRowStyle}
                  animateRows={!isMobile}
                  enableCellTextSelection={true}
                  suppressHorizontalScroll={false}
                  headerHeight={isMobile ? 40 : 50}
                  rowHeight={isMobile ? 40 : 48}
                  rowMultiSelectWithClick={false}
                  suppressMovableColumns={isMobile}
                  enableRangeSelection={!isMobile}
                  suppressRowClickSelection={true}
                />
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default PerformRfdMaterialList;