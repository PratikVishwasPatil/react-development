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

// Challan Detail Page Component
const ChallanDetailPage = ({ fileId, onBack }) => {
    const [challanDate, setChallanDate] = useState('');
    const [vendorName, setVendorName] = useState('');
    const [challanItems, setChallanItems] = useState([
        { id: 1, challanDate: '', challanId: '', rfdid: '', materialName: '', weight: '', height: '', quantity: '', qty: '', unit: '', apprxValue: '', tax: '', cgst: '', sgst: '' }
    ]);

    // Add this state at the top with other states
const [vendorOptions, setVendorOptions] = useState([]);

const fetchVendors = async () => {
    try {
        const response = await fetch("https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/getVendorOutwardApi.php");
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.status && Array.isArray(data.data)) {
            // Format for react-select
            const formattedVendors = data.data.map(vendor => ({
                value: vendor.id,
                label: vendor.name
            }));
            setVendorOptions(formattedVendors);
        }
    } catch (error) {
        console.error("Error fetching vendors:", error);
    }
};

// Add useEffect
useEffect(() => {
    fetchVendors();
}, []);


// Add this useEffect to fetch vendors when component mounts
useEffect(() => {
    fetchVendors();
}, []);

    const addNewRow = () => {
        const newId = challanItems.length + 1;
        setChallanItems([...challanItems, {
            id: newId,
            challanDate: '',
            challanId: '',
            rfdid: '',
            materialName: '',
            weight: '',
            height: '',
            quantity: '',
            qty: '',
            unit: '',
            apprxValue: '',
            tax: '',
            cgst: '',
            sgst: ''
        }]);
    };

    const removeRow = (id) => {
        if (challanItems.length > 1) {
            setChallanItems(challanItems.filter(item => item.id !== id));
        }
    };

    const updateItem = (id, field, value) => {
        setChallanItems(challanItems.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const handleSubmit = () => {
        console.log('Submitting challan data:', {
            fileId,
            challanDate,
            vendorName,
            items: challanItems
        });
        alert('Challan data submitted successfully!');
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f8f9ff 0%, #e6f3ff 100%)',
            padding: '20px'
        }}>
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)',
                    color: 'white',
                    padding: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h3 style={{ margin: 0 }}>Second Challan Entry</h3>
                        <small>File Name: {fileId}</small>
                    </div>
                    <button
                        onClick={onBack}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: 'white',
                            color: '#0d6efd',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        ← Back to Grid
                    </button>
                </div>

                {/* Form Content */}
                <div style={{ padding: '20px' }}>
                    {/* Top Input Row */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '15px',
                        marginBottom: '20px',
                        alignItems: 'end'
                    }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                                File Name
                            </label>
                            <input
                                type="text"
                                value={fileId}
                                readOnly
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    backgroundColor: '#f8f9fa',
                                    color: '#ff6600',
                                    fontWeight: 'bold'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                                Challan Date
                            </label>
                            <input
                                type="date"
                                value={challanDate}
                                onChange={(e) => setChallanDate(e.target.value)}
                                placeholder="mm/dd/yyyy"
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px'
                                }}
                            />
                        </div>
                        <div>
    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
        Select Vendor Name
    </label>
    <Select
        value={vendorOptions.find(option => option.value === vendorName)}
        onChange={(selectedOption) => setVendorName(selectedOption ? selectedOption.value : '')}
        options={vendorOptions}
        placeholder="Select Vendor Name"
        isClearable
        isSearchable
        styles={{
            control: (base) => ({
                ...base,
                padding: '0px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                minHeight: '38px'
            })
        }}
    />
</div>
                    </div>

                    {/* Table Header */}
                    <div style={{
                        overflowX: 'auto',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                    }}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            minWidth: '1200px'
                        }}>
                            <thead>
                                <tr style={{ backgroundColor: '#ff6600' }}>
                                    <th style={headerCellStyle}>CHALLAN DATE</th>
                                    <th style={headerCellStyle}>CHALLAN ID</th>
                                    <th style={headerCellStyle}>RFDID</th>
                                    <th style={headerCellStyle}>Material Name</th>
                                    <th style={headerCellStyle}>Weight</th>
                                    <th style={headerCellStyle}>Height</th>
                                    <th style={headerCellStyle}>Quantity</th>
                                    <th style={headerCellStyle}>Qty</th>
                                    <th style={headerCellStyle}>Unit</th>
                                    <th style={headerCellStyle}>Apprx Value</th>
                                    <th style={headerCellStyle}>Tax</th>
                                    <th style={headerCellStyle}>CGST</th>
                                    <th style={headerCellStyle}>SGST</th>
                                    <th style={headerCellStyle}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {challanItems.map((item, index) => (
                                    <tr key={item.id} style={{
                                        backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa'
                                    }}>
                                        <td style={cellStyle}>
                                            <input
                                                type="date"
                                                value={item.challanDate}
                                                onChange={(e) => updateItem(item.id, 'challanDate', e.target.value)}
                                                style={inputStyle}
                                            />
                                        </td>
                                        <td style={cellStyle}>
                                            <input
                                                type="text"
                                                value={item.challanId}
                                                onChange={(e) => updateItem(item.id, 'challanId', e.target.value)}
                                                style={inputStyle}
                                            />
                                        </td>
                                        <td style={cellStyle}>
                                            <input
                                                type="text"
                                                value={item.rfdid}
                                                onChange={(e) => updateItem(item.id, 'rfdid', e.target.value)}
                                                style={inputStyle}
                                            />
                                        </td>
                                        <td style={cellStyle}>
                                            <input
                                                type="text"
                                                value={item.materialName}
                                                onChange={(e) => updateItem(item.id, 'materialName', e.target.value)}
                                                style={inputStyle}
                                            />
                                        </td>
                                        <td style={cellStyle}>
                                            <input
                                                type="number"
                                                value={item.weight}
                                                onChange={(e) => updateItem(item.id, 'weight', e.target.value)}
                                                style={inputStyle}
                                            />
                                        </td>
                                        <td style={cellStyle}>
                                            <input
                                                type="number"
                                                value={item.height}
                                                onChange={(e) => updateItem(item.id, 'height', e.target.value)}
                                                style={inputStyle}
                                            />
                                        </td>
                                        <td style={cellStyle}>
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                                                style={inputStyle}
                                            />
                                        </td>
                                        <td style={cellStyle}>
                                            <input
                                                type="number"
                                                value={item.qty}
                                                onChange={(e) => updateItem(item.id, 'qty', e.target.value)}
                                                style={inputStyle}
                                            />
                                        </td>
                                        <td style={cellStyle}>
                                            <input
                                                type="text"
                                                value={item.unit}
                                                onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                                                style={inputStyle}
                                            />
                                        </td>
                                        <td style={cellStyle}>
                                            <input
                                                type="number"
                                                value={item.apprxValue}
                                                onChange={(e) => updateItem(item.id, 'apprxValue', e.target.value)}
                                                style={inputStyle}
                                            />
                                        </td>
                                        <td style={cellStyle}>
                                            <input
                                                type="number"
                                                value={item.tax}
                                                onChange={(e) => updateItem(item.id, 'tax', e.target.value)}
                                                style={inputStyle}
                                            />
                                        </td>
                                        <td style={cellStyle}>
                                            <input
                                                type="number"
                                                value={item.cgst}
                                                onChange={(e) => updateItem(item.id, 'cgst', e.target.value)}
                                                style={inputStyle}
                                            />
                                        </td>
                                        <td style={cellStyle}>
                                            <input
                                                type="number"
                                                value={item.sgst}
                                                onChange={(e) => updateItem(item.id, 'sgst', e.target.value)}
                                                style={inputStyle}
                                            />
                                        </td>
                                        <td style={cellStyle}>
                                            <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                                                <button
                                                    onClick={addNewRow}
                                                    style={{
                                                        padding: '4px 8px',
                                                        backgroundColor: '#28a745',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    +
                                                </button>
                                                {challanItems.length > 1 && (
                                                    <button
                                                        onClick={() => removeRow(item.id)}
                                                        style={{
                                                            padding: '4px 8px',
                                                            backgroundColor: '#dc3545',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        -
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Submit Button */}
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <button
                            onClick={handleSubmit}
                            style={{
                                padding: '12px 40px',
                                backgroundColor: '#ff6600',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: 'bold'
                            }}
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const headerCellStyle = {
    padding: '12px 8px',
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    border: '1px solid white',
    fontSize: '12px'
};

const cellStyle = {
    padding: '8px',
    border: '1px solid #ddd',
    textAlign: 'center'
};

const inputStyle = {
    width: '100%',
    padding: '6px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '13px'
};

// Main Grid Component
const SecondChallanGrid = () => {
    const [theme, setTheme] = useState('light');
    const [rowData, setRowData] = useState([]);
    const [columnDefs, setColumnDefs] = useState([]);
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [financialYear, setFinancialYear] = useState('25-26');
    const [financialYearOptions, setFinancialYearOptions] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [toasts, setToasts] = useState([]);
    const [showDetailPage, setShowDetailPage] = useState(false);
    const [selectedFileId, setSelectedFileId] = useState(null);
    const gridRef = useRef();

    // Toast notification
    const showToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };

    // Fetch financial years
    const fetchFinancialYears = async () => {
        try {
            const response = await fetch("https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/GetYearsApi.php");
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.status === "success" && Array.isArray(data.data)) {
                const years = data.data.map(item => ({
                    value: item.financial_year,
                    label: `20${item.financial_year}`
                }));
                setFinancialYearOptions(years);
                
                if (years.length > 0) {
                    setFinancialYear(years[years.length - 1].value);
                }
            }
        } catch (error) {
            console.error("Error fetching financial years:", error);
            showToast("Error loading financial years", 'error');
        }
    };

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Column definitions
    const generateColumnDefs = () => {
        const baseColumns = [
            {
                headerName: "Sr No",
                field: "serialNumber",
                valueGetter: (params) => params.node ? params.node.rowIndex + 1 : '',
                width: isMobile ? 60 : 80,
                minWidth: 50,
                pinned: 'left',
                lockPosition: true,
                cellStyle: { fontWeight: 'bold', textAlign: 'center' }
            },
            {
                field: "FILE_NAME",
                headerName: "File Name",
                width: isMobile ? 180 : 220,
                pinned: 'left',
                checkboxSelection: true,
                headerCheckboxSelection: true,
                cellStyle: { fontWeight: '600', color: '#0d6efd', cursor: 'pointer' },
                onCellClicked: (params) => {
                    if (params.data && params.data.FILE_ID) {
                        setSelectedFileId(params.data.FILE_ID);
                        setShowDetailPage(true);
                    }
                }
            },
            {
                field: "FILE_ID",
                headerName: "File ID",
                width: isMobile ? 100 : 120,
                cellStyle: { textAlign: 'center' }
            },
            {
                field: "custName",
                headerName: "Customer Name",
                width: isMobile ? 180 : 250,
                cellStyle: { fontWeight: '500' }
            },
            {
                field: "productName",
                headerName: "Product Name",
                width: isMobile ? 120 : 150,
                cellStyle: (params) => {
                    const colors = {
                        'Miscellaneous': { bg: '#fff3cd', color: '#856404' },
                        'MSS': { bg: '#d1ecf1', color: '#0c5460' },
                        'HDPR': { bg: '#d4edda', color: '#155724' },
                        'default': { bg: '#f8f9fa', color: '#212529' }
                    };
                    const style = colors[params.value] || colors.default;
                    return {
                        backgroundColor: style.bg,
                        color: style.color,
                        fontWeight: 'bold',
                        textAlign: 'center',
                        padding: '4px 8px',
                        borderRadius: '4px'
                    };
                }
            },
            {
                field: "lastDispatchDate",
                headerName: "Last Dispatch Date",
                width: isMobile ? 140 : 180,
                cellStyle: (params) => {
                    return {
                        textAlign: 'center',
                        backgroundColor: params.value === '-' ? '#ffebee' : '#e8f5e8',
                        color: params.value === '-' ? '#c62828' : '#2e7d32',
                        fontWeight: params.value === '-' ? 'bold' : 'normal'
                    };
                },
                cellRenderer: (params) => {
                    if (params.value === '-') {
                        return 'Not Dispatched';
                    }
                    return params.value;
                }
            }
        ];

        return baseColumns;
    };

    const defaultColDef = useMemo(() => ({
        filter: true,
        sortable: true,
        floatingFilter: !isMobile,
        resizable: true,
        suppressMenu: isMobile,
        cellStyle: { textAlign: 'right' }
    }), [isMobile]);

    // Fetch challan data
    const fetchChallanData = async (fy = financialYear) => {
        setLoading(true);
        try {
            const response = await fetch(
                `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/getsecondChallanDetailsApi.php?financial_year=${fy}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.status && Array.isArray(data.data)) {
                setRowData(data.data);
                setTotalCount(data.count || data.data.length);
                showToast(`Loaded ${data.data.length} challan records for FY ${fy}`, 'success');
            } else {
                throw new Error("Failed to fetch challan data");
            }
        } catch (error) {
            console.error("Error fetching challan data:", error);
            showToast(`Error fetching data: ${error.message}`, 'error');
            setRowData([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    };

    // Initial data fetch
    useEffect(() => {
        setColumnDefs(generateColumnDefs());
        fetchFinancialYears();
    }, [isMobile]);

    useEffect(() => {
        if (financialYear) {
            fetchChallanData();
        }
    }, [financialYear]);

    const handleFinancialYearChange = (e) => {
        const newFY = e.target.value;
        setFinancialYear(newFY);
        fetchChallanData(newFY);
    };

    const onSelectionChanged = (event) => {
        const selectedNodes = event.api.getSelectedNodes();
        const selectedData = selectedNodes.map(node => node.data);
        setSelectedRows(selectedData);
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
                fileName: `SecondChallanDetails_${financialYear}_${new Date().toISOString().split('T')[0]}.csv`,
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

    const refreshData = () => {
        fetchChallanData(financialYear);
    };

    const handleNavigateToDetail = () => {
        if (selectedRows.length === 0) {
            showToast('Please select at least one row', 'error');
            return;
        }
        setSelectedFileId(selectedRows[0].FILE_ID);
        setShowDetailPage(true);
    };

    // Theme styles
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

    // Apply theme to body
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

    if (showDetailPage) {
        return (
            <ChallanDetailPage
                fileId={selectedFileId}
                onBack={() => {
                    setShowDetailPage(false);
                    setSelectedFileId(null);
                }}
            />
        );
    }

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
                        border: '4px solid rgba(0,0,0,0.1)',
                        borderTopColor: '#0d6efd',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto'
                    }} />
                    <p style={{ marginTop: '1rem' }}>Loading second challan details...</p>
                    <style>{`
                        @keyframes spin {
                            to { transform: rotate(360deg); }
                        }
                    `}</style>
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
            {/* Toast Container */}
            <div style={{
                position: 'fixed',
                top: '1rem',
                right: '1rem',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
            }}>
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        style={{
                            padding: '1rem 1.5rem',
                            borderRadius: '0.5rem',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            color: 'white',
                            backgroundColor: toast.type === 'success' ? '#28a745' : '#dc3545',
                            animation: 'slideIn 0.3s ease-out',
                            minWidth: '250px'
                        }}
                    >
                        {toast.message}
                    </div>
                ))}
            </div>

            <div style={{
                width: '100%',
                maxWidth: isFullScreen ? '100%' : '1400px',
                margin: isFullScreen ? 0 : '20px auto',
                padding: isFullScreen ? 0 : '0 20px'
            }}>
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
                        padding: '1rem 2rem',
                        borderBottom: theme === 'dark' ? '1px solid #495057' : '1px solid #dee2e6'
                    }}>
                        <div style={{
                            display: 'flex',
                            flexDirection: isMobile ? 'column' : 'row',
                            alignItems: isMobile ? 'flex-start' : 'center',
                            justifyContent: 'space-between',
                            gap: '1rem'
                        }}>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
                                    Second Challan Details Dashboard
                                </h4>
                                <small style={{ opacity: 0.8, display: 'block', marginTop: '0.25rem' }}>
                                    {totalCount} total records | {rowData.length} loaded
                                    {selectedRows.length > 0 && ` | ${selectedRows.length} selected`}
                                </small>
                                </div>

                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '0.5rem',
                                alignItems: 'center'
                            }}>
                                {/* Financial Year Selector */}
                                <select
                                    value={financialYear}
                                    onChange={handleFinancialYearChange}
                                    style={{
                                        padding: '0.375rem 0.75rem',
                                        fontSize: '0.875rem',
                                        borderRadius: '0.25rem',
                                        border: theme === 'dark' ? '1px solid #495057' : '1px solid #ced4da',
                                        backgroundColor: theme === 'dark' ? '#495057' : '#ffffff',
                                        color: theme === 'dark' ? '#f8f9fa' : '#212529',
                                        minWidth: '120px'
                                    }}
                                >
                                    {financialYearOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            FY {option.label}
                                        </option>
                                    ))}
                                </select>

                                {/* Open Selected Button */}
                                {selectedRows.length > 0 && (
                                    <button
                                        onClick={handleNavigateToDetail}
                                        style={{
                                            padding: '0.375rem 0.75rem',
                                            fontSize: '0.875rem',
                                            borderRadius: '0.25rem',
                                            border: 'none',
                                            backgroundColor: '#6f42c1',
                                            color: 'white',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.25rem'
                                        }}
                                    >
                                        <span style={{ fontSize: '1rem' }}>📝</span>
                                        {!isMobile && <span>Open Selected</span>}
                                    </button>
                                )}

                                {/* Refresh Button */}
                                <button
                                    onClick={refreshData}
                                    style={{
                                        padding: '0.375rem 0.75rem',
                                        fontSize: '0.875rem',
                                        borderRadius: '0.25rem',
                                        border: 'none',
                                        backgroundColor: '#0d6efd',
                                        color: 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem'
                                    }}
                                >
                                    <span style={{ fontSize: '1rem' }}>↻</span>
                                    {!isMobile && <span>Refresh</span>}
                                </button>

                                {/* Export Button */}
                                <button
                                    onClick={downloadExcel}
                                    style={{
                                        padding: '0.375rem 0.75rem',
                                        fontSize: '0.875rem',
                                        borderRadius: '0.25rem',
                                        border: 'none',
                                        backgroundColor: '#28a745',
                                        color: 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem'
                                    }}
                                >
                                    <span style={{ fontSize: '1rem' }}>📊</span>
                                    {!isMobile && <span>Export CSV</span>}
                                </button>

                                {/* Auto Size Button */}
                                <button
                                    onClick={autoSizeAll}
                                    style={{
                                        padding: '0.375rem 0.75rem',
                                        fontSize: '0.875rem',
                                        borderRadius: '0.25rem',
                                        border: 'none',
                                        backgroundColor: '#17a2b8',
                                        color: 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem'
                                    }}
                                >
                                    <span style={{ fontSize: '1rem' }}>↔</span>
                                    {!isMobile && <span>Auto Size</span>}
                                </button>

                                {/* Fullscreen Toggle */}
                                <button
                                    onClick={toggleFullScreen}
                                    style={{
                                        padding: '0.375rem 0.75rem',
                                        fontSize: '0.875rem',
                                        borderRadius: '0.25rem',
                                        border: theme === 'dark' ? '1px solid #f8f9fa' : '1px solid #212529',
                                        backgroundColor: 'transparent',
                                        color: theme === 'dark' ? '#f8f9fa' : '#212529',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {isFullScreen ? '⛶' : '⛶'}
                                    {!isMobile && (isFullScreen ? ' Exit' : ' Full')}
                                </button>

                                {/* Theme Toggle */}
                                <button
                                    onClick={toggleTheme}
                                    style={{
                                        padding: '0.375rem 0.75rem',
                                        fontSize: '0.875rem',
                                        borderRadius: '0.25rem',
                                        border: theme === 'dark' ? '1px solid #f8f9fa' : '1px solid #212529',
                                        backgroundColor: 'transparent',
                                        color: theme === 'dark' ? '#f8f9fa' : '#212529',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {theme === 'light' ? '🌙' : '☀️'}
                                    {!isMobile && (theme === 'light' ? ' Dark' : ' Light')}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Grid Body */}
                    <div style={{
                        backgroundColor: themeStyles.cardBg,
                        padding: isFullScreen ? 0 : '15px'
                    }}>
                        {rowData.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '50px',
                                color: themeStyles.color
                            }}>
                                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📋</div>
                                <h5 style={{ marginBottom: '10px' }}>No challan data available</h5>
                                <p>Please select a different financial year or check your API connection.</p>
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
                                    paginationPageSize={isMobile ? 10 : 20}
                                    rowSelection="multiple"
                                    onSelectionChanged={onSelectionChanged}
                                    suppressMovableColumns={isMobile}
                                    enableRangeSelection={!isMobile}
                                    rowMultiSelectWithClick={true}
                                    animateRows={!isMobile}
                                    enableCellTextSelection={true}
                                    suppressHorizontalScroll={false}
                                    headerHeight={isMobile ? 40 : 48}
                                    rowHeight={isMobile ? 35 : 42}
                                    onGridReady={(params) => {
                                        console.log('Second Challan Grid is ready');
                                        setTimeout(() => autoSizeAll(), 500);
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default SecondChallanGrid;