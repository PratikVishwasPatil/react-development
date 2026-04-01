import React, { useEffect, useMemo, useState, useRef } from "react";
import { Container, Form, Button, Accordion, Row, Col } from "react-bootstrap";
import axios from "axios";
import Select from "react-select";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { ColumnApiModule } from "ag-grid-community";
import { 
  ModuleRegistry,
  AllCommunityModule 
} from "ag-grid-community";
ModuleRegistry.registerModules([
  AllCommunityModule
]);


export default function UploadFPData() {

  const [theme, setTheme] = useState('light');
  const [dark, setDark] = useState(false);
  const [file, setFile] = useState(null);
  const [options, setOptions] = useState([]);
   const [selectedOption, setSelectedOption] = useState(null);
   const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("SEPL");
  const [gridData, setGridData] = useState({});
  const [isFullScreen, setIsFullScreen] = useState(true);
  const [selectedFinancialYear, setSelectedFinancialYear] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const gridRef = useRef();
  const [gridApi, setGridApi] = useState(null);
  const [columnApi, setColumnApi] = useState(null);
  const tabApiMap = {
    SEPL: "getseplTable2_23_new.php",
    AMC: "getAMCTable2_23_new.php",
    Misc_Supply: "getMiscSupplyTable2_23_new.php",
    Misc_Lab: "getMiscLabTable2_23_new.php",
    balance_billing: "get_balanceBilling_23.php",
    billing_done: "get_billingDone_23.php",
    po_value: "get_po_value_23.php",
    product_ownerwise: "get_product_ownerwise_23.php",
  };
  
  const formatNumberWithCommas = (value) => {
    if (value === null || value === undefined || value === '') return value;
    // Check if value is a number or can be converted to number
    const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
    if (isNaN(num)) return value;
    return num.toLocaleString('en-IN');
};

  const tabs = [
    "SEPL",
    "AMC",
    "Misc_Supply",
    "Misc_Lab",
    "balance_billing",
    "billing_done",
    "po_value",
    "product_ownerwise",
  ];
// Handle window resize
const downloadExcel = () => {
  const tab = activeTab;
  if (!gridData[tab] || gridData[tab].length === 0) {
      showToast("No data available to export", "error");
      return;
  }

  const rows = gridData[tab];
  const headers = Object.keys(rows[0]).join(",");
  const csvRows = rows.map(row =>
      Object.values(row)
          .map(v => `"${v}"`)
          .join(",")
  );

  const csvContent = [headers, ...csvRows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${tab}.csv`;
  a.click();
};
const autoSizeAll = () => {
  if (!columnApi) {
    console.log("Column API not ready");
    return;
  }

  const allColumnIds = [];
  columnApi.getAllColumns().forEach((col) => {
    allColumnIds.push(col.getId());
  });

  columnApi.autoSizeColumns(allColumnIds);
};

useEffect(() => {
  const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
  };
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
  // Fetch financial year options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await axios.post(
          "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/GetYearsApi.php",
         
        );
        if (res.data.status === "success") {
          const opts = res.data.data.map((item) => ({
            value: item.financial_year,
            label: item.financial_year,
          }));
          setOptions(opts);
          const defaultYear = opts.find(opt => opt.value === "25-26");
          if (defaultYear) {
            setSelectedOption(defaultYear);
            fetchTabData(defaultYear.value, "SEPL");
          }
        }
      } catch (err) {
        console.error("Error fetching dropdown options:", err);
      }
    };
    fetchOptions();
  }, []);

  // Fetch tab data
  const fetchTabData = async (year, tab) => {
    try {
      setLoading(true);
  
      const api = tabApiMap[tab];
  
      const res = await axios.get(
        `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/manufacturing/${api}`,
        {
          params: { financial_year: year }
        }
      );
  
      if (res.data.success) {
        setGridData(prev => ({
          ...prev,
          [tab]: res.data.data || []
        }));
      }
  
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };
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
  if (selectedOption) {
    fetchTabData(selectedOption.value, activeTab);
  }
}, [selectedOption]);
  // Handle Select change
  const handleYearChange = (option) => {
    setSelectedOption(option);
    fetchTabData(option.value, activeTab);
  };
  const handleRefresh = () => {
    if (selectedOption) {
      fetchTabData(selectedOption.value, activeTab);
      showToast('Refreshing...', 'info');
    }
  };;
  // Handle file selection
  const handleFileChange = (e) => setFile(e.target.files[0]);

  // Submit upload
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !selectedOption) {
      alert("Please select a file and a financial year!");
      return;
    }
    const formData = new FormData();
    formData.append("filename[]", file);
    formData.append("financial_year", selectedOption.value);

    try {
      const res = await fetch(
        "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/upload_manfact_data_23.php",
        { method: "POST", body: formData }
      );
      const data = await res.json();
      if (data.success) {
        alert("File uploaded successfully!");
        setGridData(data.tabData || {});
      } else {
        alert("Upload failed: " + data.message);
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed!");
    }
  };
  const gridHeight = isFullScreen ? 'calc(100vh - 240px)' : (isMobile ? '400px' : '600px');
  // Generate AG Grid columns dynamically
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
};
const toggleTheme = () => {
  setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
};
 // Add this number formatter function after your state declarations
// const formatNumberWithCommas = (value) => {
//   if (value === null || value === undefined || value === '') return value;
//   // Check if value is a number or can be converted to number
//   const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
//   if (isNaN(num)) return value;
//   return num.toLocaleString('en-IN');
// };
const filterParams = {
  comparator: (filterLocalDateAtMidnight, cellValue) => {
    if (!cellValue) return -1;

    const dateParts = cellValue.split("-");
    const cellDate = new Date(
      Number(dateParts[0]),
      Number(dateParts[1]) - 1,
      Number(dateParts[2])
    );

    if (cellDate < filterLocalDateAtMidnight) return -1;
    if (cellDate > filterLocalDateAtMidnight) return 1;
    return 0;
  }
};  
const currencyFormatter = (params) => {
  if (params.value === null || params.value === undefined || params.value === '') return '';

  const num = typeof params.value === 'string'
    ? parseFloat(params.value.replace(/,/g, ''))
    : params.value;

  if (isNaN(num)) return params.value;

  return num.toLocaleString('en-IN');
};

// Update the getColumnDefs function
const tabColumnMap = {
  SEPL: [
    { headerName: "Owner Name", field: 'CUSTOMER_AMBASADDOR', pinned: 'left' },
    { headerName: "FILE NO", field: 'file', pinned: 'left' },
    { headerName: "F.Y.", field: 'year' },
    { headerName: "PO DETAILS", field: 'po' },
    { headerName: "PO DATE", field: 'date', filterParams: filterParams },
    { headerName: "CLIENT", field: 'client' },
    { headerName: "CITY", field: 'city' },
    { headerName: "STATE", field: 'state' },
    { headerName: "UNIT LOCATION", field: 'uloc' },
    { headerName: "STORE LOCATION", field: 'sloc' },
    { headerName: "PRODUCT", field: 'type' },
    { headerName: "PRODUCT DESCRIPTION + HIGHLIGHTS", field: 'desc' },
    { headerName: "PERSON", field: 'person' },
    { headerName: "QTN. NO", field: 'qty' },
    { headerName: "QTN DATE", field: 'qtyDate', filterParams: filterParams },
    { headerName: "INV NO", field: 'inv' },
    { headerName: "INV DATE", field: 'invDate', filterParams: filterParams },
  
    { headerName: "SUPPLY PO BASIC AMT", field: 'poAmt', cellClass: 'ag-right-aligned-cell', valueFormatter: currencyFormatter },
    { headerName: "TAX", field: 'tax' },
    { headerName: "TAX AMOUNT", field: 'tax_amount', cellClass: 'ag-right-aligned-cell', valueFormatter: currencyFormatter },
    { headerName: "BALANCED BILLING", field: 'billing', cellClass: 'ag-right-aligned-cell', valueFormatter: currencyFormatter },
    { headerName: "PREVIOUS YEAR", field: 'pyear', cellClass: 'ag-right-aligned-cell', valueFormatter: currencyFormatter },
    { headerName: "BILL AMT W/O TAX", field: 'billAmt', cellClass: 'ag-right-aligned-cell', valueFormatter: currencyFormatter },
    { headerName: "BILL AMT WITH TAX", field: 'billAmtTax', cellClass: 'ag-right-aligned-cell', valueFormatter: currencyFormatter },
    { headerName: "SHE PO BASIC AMT", field: 'poAmt1', cellClass: 'ag-right-aligned-cell', valueFormatter: currencyFormatter },
    { headerName: "ERECTN PO BASIC AMT", field: 'poAmt2', cellClass: 'ag-right-aligned-cell', valueFormatter: currencyFormatter },
    { headerName: "ERECTN PO DETAILS", field: 'poDetails' },
    { headerName: "TOTAL PO AMOUNT", field: 'totalPOAmt', cellClass: 'ag-right-aligned-cell', valueFormatter: currencyFormatter },
  
    { headerName: "SITE EXPENSES MKTG", field: 'siteMKTG', cellClass: 'ag-right-aligned-cell' },
    { headerName: "MATERIAL AMOUNT MKTG", field: 'materialMKTG', valueFormatter: currencyFormatter },
    { headerName: "MTRL KG-MKTG", field: 'MtrlKgMKTG', valueFormatter: currencyFormatter },
    { headerName: "MATERIAL AMOUNT - DZN", field: 'MaterialAmountDZN', valueFormatter: currencyFormatter },
    { headerName: "MATL KG - DZN", field: 'MatlKgDZN', valueFormatter: currencyFormatter },
  
    { headerName: "RM RATIO", field: 'RMratio', valueFormatter: currencyFormatter },
    { headerName: "E & C RATIO", field: 'ECratio', valueFormatter: currencyFormatter },
    { headerName: "SITE FORM HANDOVER DATE", field: 'HandoverDate', filterParams: filterParams },
  ],

  AMC: [
    {  headerName: "Owner Name",field: 'CUSTOMER_AMBASADDOR',floatingFilter:true,pinned: 'left'},
    {  headerName: "FILE NO",field: 'file',floatingFilter:true,pinned: 'left'},
    {  headerName: "F.Y.",field: 'year',floatingFilter:true},
    {  headerName: "PO DETAILS",field: 'po', floatingFilter:true },
    {  headerName: "PO DATE",field: 'date', filter: 'agDateColumnFilter',floatingFilter:true,filterParams: filterParams},
    {  headerName: "CLIENT",field: 'client',floatingFilter:true},
    {  headerName: "CITY",field: 'city', floatingFilter:true },
    {  headerName: "STATE",field: 'state',floatingFilter:true},
    {  headerName: "UNIT LOCATION",field: 'uloc', floatingFilter:true },
    {  headerName: "STORE LOCATION",field: 'sloc',floatingFilter:true},
     // {  headerName: "PRODUCT",field: 'type', floatingFilter:true },
    {  headerName: "PRODUCT DESCRIPTION + HIGHLIGHTS",field: 'desc',floatingFilter:true},
    {  headerName: "PERSON",field: 'person', floatingFilter:true },
    {  headerName: "QTN. NO",field: 'qty',floatingFilter:true},
    {  headerName: "QTN DATE",field: 'qtyDate', filter: 'agDateColumnFilter',floatingFilter:true,filterParams: filterParams },
    {  headerName: "INV NO",field: 'inv',floatingFilter:true},
    {  headerName: "INV DATE",field: 'invDate', filter: 'agDateColumnFilter',floatingFilter:true,filterParams: filterParams },
    {  headerName: "SUPPLY PO BASIC AMT",field: 'poAmt',floatingFilter:true ,cellClass: 'ag-right-aligned-cell',valueFormatter: currencyFormatter},
    {  headerName: "TAX",field: 'tax', floatingFilter:true },
    {  headerName: "TAX AMOUNT",field: 'tax_amount', floatingFilter:true ,cellClass: 'ag-right-aligned-cell',valueFormatter: currencyFormatter},
    {  headerName: "BALANCED BILLING",field: 'billing',floatingFilter:true,cellClass: 'ag-right-aligned-cell',valueFormatter: currencyFormatter},
    {  headerName: "PREVIOUS YEAR",field: 'pyear', floatingFilter:true,cellClass: 'ag-right-aligned-cell',valueFormatter: currencyFormatter },
    {  headerName: "BILL AMT W/O TAX",field: 'billAmt',floatingFilter:true,cellClass: 'ag-right-aligned-cell',valueFormatter: currencyFormatter},
    {  headerName: "BILL AMT WITH TAX",field: 'billAmtTax', floatingFilter:true ,cellClass: 'ag-right-aligned-cell',valueFormatter: currencyFormatter},
    {  headerName: "SITE FORM HANDOVER DATE",field: 'HandoverDate',filter: 'agDateColumnFilter',floatingFilter:true,filterParams: filterParams},
  ],

  Misc_Supply: [
    {  headerName: "Owner Name",field: 'CUSTOMER_AMBASADDOR',floatingFilter:true,pinned: 'left'},
    {  headerName: "FILE NO",field: 'file',floatingFilter:true,pinned: 'left'},
    {  headerName: "F.Y.",field: 'year',floatingFilter:true},
    {  headerName: "PO DETAILS",field: 'po', floatingFilter:true },
    {  headerName: "PO DATE",field: 'date', filter: 'agDateColumnFilter',floatingFilter:true,filterParams: filterParams},
    {  headerName: "CLIENT",field: 'client',floatingFilter:true},
    {  headerName: "CITY",field: 'city', floatingFilter:true },
    {  headerName: "STATE",field: 'state',floatingFilter:true},
    {  headerName: "UNIT LOCATION",field: 'uloc', floatingFilter:true },
    {  headerName: "STORE LOCATION",field: 'sloc',floatingFilter:true},
    {  headerName: "PRODUCT",field: 'type', floatingFilter:true },
    {  headerName: "PRODUCT DESCRIPTION + HIGHLIGHTS",field: 'desc',floatingFilter:true},
    {  headerName: "PERSON",field: 'person', floatingFilter:true },
    {  headerName: "QTN. NO",field: 'qty',floatingFilter:true},
    {  headerName: "QTN DATE",field: 'qtyDate', filter: 'agDateColumnFilter',floatingFilter:true,filterParams: filterParams },
    {  headerName: "INV NO",field: 'inv',floatingFilter:true},
    {  headerName: "INV DATE",field: 'invDate', filter: 'agDateColumnFilter',floatingFilter:true,filterParams: filterParams },
    {  headerName: "SUPPLY PO BASIC AMT",field: 'poAmt',floatingFilter:true ,cellClass: 'ag-right-aligned-cell',valueFormatter: currencyFormatter},
    {  headerName: "TAX",field: 'tax', floatingFilter:true},
    
    {  headerName: "TAX AMOUNT",field: 'tax_amount', floatingFilter:true,cellClass: 'ag-right-aligned-cell' ,valueFormatter: currencyFormatter},
    {  headerName: "BALANCED BILLING",field: 'billing',floatingFilter:true,cellClass: 'ag-right-aligned-cell',valueFormatter: currencyFormatter},
    {  headerName: "PREVIOUS YEAR",field: 'pyear', floatingFilter:true,cellClass: 'ag-right-aligned-cell',valueFormatter: currencyFormatter },
    {  headerName: "BILL AMT W/O TAX",field: 'billAmt',floatingFilter:true,cellClass: 'ag-right-aligned-cell',valueFormatter: currencyFormatter},
    {  headerName: "BILL AMT WITH TAX",field: 'billAmtTax', floatingFilter:true ,cellClass: 'ag-right-aligned-cell',valueFormatter: currencyFormatter},
    {  headerName: "SITE FORM HANDOVER DATE",field: 'HandoverDate',filter: 'agDateColumnFilter',floatingFilter:true,filterParams: filterParams},
  ],
  Misc_Lab:[{  headerName: "Owner Name",field: 'CUSTOMER_AMBASADDOR',floatingFilter:true,pinned: 'left'},
  {  headerName: "FILE NO",field: 'file',floatingFilter:true,pinned: 'left'},
  {  headerName: "F.Y.",field: 'year',floatingFilter:true},
  {  headerName: "PO DETAILS",field: 'po', floatingFilter:true },
  {  headerName: "PO DATE",field: 'date', filter: 'agDateColumnFilter',floatingFilter:true,filterParams: filterParams},
  {  headerName: "CLIENT",field: 'client',floatingFilter:true},
  {  headerName: "CITY",field: 'city', floatingFilter:true },
  {  headerName: "STATE",field: 'state',floatingFilter:true},
  {  headerName: "UNIT LOCATION",field: 'uloc', floatingFilter:true },
  {  headerName: "STORE LOCATION",field: 'sloc',floatingFilter:true},
  {  headerName: "PRODUCT",field: 'type', floatingFilter:true },
  {  headerName: "PRODUCT DESCRIPTION + HIGHLIGHTS",field: 'desc',floatingFilter:true},
  {  headerName: "PERSON",field: 'person', floatingFilter:true },
  {  headerName: "QTN. NO",field: 'qty',floatingFilter:true},
  {  headerName: "QTN DATE",field: 'qtyDate', filter: 'agDateColumnFilter',floatingFilter:true,filterParams: filterParams },
  {  headerName: "INV NO",field: 'inv',floatingFilter:true},
  {  headerName: "INV DATE",field: 'invDate', filter: 'agDateColumnFilter',floatingFilter:true,filterParams: filterParams },
  {  headerName: "SUPPLY PO BASIC AMT",field: 'poAmt',floatingFilter:true ,cellClass: 'ag-right-aligned-cell' ,valueFormatter: currencyFormatter},
  {  headerName: "TAX",field: 'tax', floatingFilter:true },
  {  headerName: "TAX AMOUNT",field: 'tax_amount', floatingFilter:true,cellClass: 'ag-right-aligned-cell' ,valueFormatter: currencyFormatter},
  {  headerName: "BALANCED BILLING",field: 'billing',floatingFilter:true,cellClass: 'ag-right-aligned-cell' ,valueFormatter: currencyFormatter},
  {  headerName: "PREVIOUS YEAR",field: 'pyear', floatingFilter:true,cellClass: 'ag-right-aligned-cell' ,valueFormatter: currencyFormatter },
  {  headerName: "BILL AMT W/O TAX",field: 'billAmt',floatingFilter:true,cellClass: 'ag-right-aligned-cell' ,valueFormatter: currencyFormatter},
  {  headerName: "BILL AMT WITH TAX",field: 'billAmtTax', floatingFilter:true,cellClass: 'ag-right-aligned-cell' ,valueFormatter: currencyFormatter },
  {  headerName: "SITE FORM HANDOVER DATE",field: 'HandoverDate',filter: 'agDateColumnFilter',floatingFilter:true,filterParams: filterParams},
  ],
  balance_billing:[ {  headerName: "Balance Billing",field: 'billtype',floatingFilter:true,pinned: 'left'},
  {  headerName: "SVJ",field: 'SVJ',floatingFilter:true,cellClass: 'ag-right-aligned-cell',valueFormatter: currencyFormatter},
  {  headerName: "AGP",field: 'AGP',floatingFilter:true ,cellClass: 'ag-right-aligned-cell',valueFormatter: currencyFormatter},
  {  headerName: "RPK",field: 'RPK', floatingFilter:true ,cellClass: 'ag-right-aligned-cell',valueFormatter: currencyFormatter},
  {  headerName: "PAL",field: 'PAL',floatingFilter:true ,cellClass: 'ag-right-aligned-cell',valueFormatter: currencyFormatter},
  {  headerName: "VVD",field: 'VVD',floatingFilter:true ,cellClass: 'ag-right-aligned-cell',valueFormatter: currencyFormatter},
  {  headerName: "HMT",field: 'HMT', floatingFilter:true ,cellClass: 'ag-right-aligned-cell',valueFormatter: currencyFormatter },
  {  headerName: "VDK",field: 'VDK',floatingFilter:true ,cellClass: 'ag-right-aligned-cell',valueFormatter: currencyFormatter},
  {  headerName: "Total",field: 'grand_total', floatingFilter:true  ,cellClass: 'bg-color',headerClass: 'header-color', cellClass: "total-column",valueFormatter: currencyFormatter},
  ],
  billing_done:[
  {  headerName: "Total Billing Done",field: 'billtype',floatingFilter:true,pinned: 'left'},
  {  headerName: "SVJ",field: 'SVJ',floatingFilter:true,cellClass: 'ag-right-aligned-cell',valueFormatter: currencyFormatter},
  {  headerName: "AGP",field: 'AGP',floatingFilter:true ,cellClass: 'ag-right-aligned-cell',valueFormatter: currencyFormatter},
  {  headerName: "RPK",field: 'RPK', floatingFilter:true ,cellClass: 'ag-right-aligned-cell',valueFormatter: currencyFormatter},
  {  headerName: "PAL",field: 'PAL',floatingFilter:true ,cellClass: 'ag-right-aligned-cell',valueFormatter: currencyFormatter},
  {  headerName: "VVD",field: 'VVD',floatingFilter:true ,cellClass: 'ag-right-aligned-cell',valueFormatter: currencyFormatter},
  {  headerName: "HMT",field: 'HMT', floatingFilter:true ,cellClass: 'ag-right-aligned-cell',valueFormatter: currencyFormatter },
  {  headerName: "VDK",field: 'VDK',floatingFilter:true ,cellClass: 'ag-right-aligned-cell',valueFormatter: currencyFormatter},
  {  headerName: "Total",field: 'grand_total', floatingFilter:true  ,cellClass: 'bg-color',headerClass: 'header-color',  cellClass: "total-column",valueFormatter: currencyFormatter},
  ],
  po_value:[{  headerName: "Total PO Value",field: 'billtype',floatingFilter:true,pinned: 'left'},
  {  headerName: "SVJ",field: 'SVJ',floatingFilter:true,cellClass: 'ag-right-aligned-cell',valueFormatter: currencyFormatter},
  {  headerName: "AGP",field: 'AGP',floatingFilter:true ,cellClass: 'ag-right-aligned-cell',valueFormatter: currencyFormatter},
  {  headerName: "RPK",field: 'RPK', floatingFilter:true ,cellClass: 'ag-right-aligned-cell',valueFormatter: currencyFormatter},
  {  headerName: "PAL",field: 'PAL',floatingFilter:true ,cellClass: 'ag-right-aligned-cell',valueFormatter: currencyFormatter},
  {  headerName: "VVD",field: 'VVD',floatingFilter:true ,cellClass: 'ag-right-aligned-cell',valueFormatter: currencyFormatter},
  {  headerName: "HMT",field: 'HMT', floatingFilter:true ,cellClass: 'ag-right-aligned-cell',valueFormatter: currencyFormatter },
  {  headerName: "VDK",field: 'VDK',floatingFilter:true ,cellClass: 'ag-right-aligned-cell',valueFormatter: currencyFormatter},
  {  headerName: "Total",field: 'grand_total', floatingFilter:true ,cellClass: 'bg-color',headerClass: 'header-color', cellClass: "total-column",valueFormatter: currencyFormatter},
  ],
  product_ownerwise:[{  headerName: "Product-Ownerwise",field: 'billtype',floatingFilter:true,pinned: 'left'},
  {  headerName: "SVJ",field: 'SVJ',floatingFilter:true,cellClass: 'ag-right-aligned-cell',valueFormatter: currencyFormatter},
  {  headerName: "AGP",field: 'AGP',floatingFilter:true ,cellClass: 'ag-right-aligned-cell',valueFormatter: currencyFormatter},
  {  headerName: "RPK",field: 'RPK', floatingFilter:true ,cellClass: 'ag-right-aligned-cell',valueFormatter: currencyFormatter},
  {  headerName: "PAL",field: 'PAL',floatingFilter:true ,cellClass: 'ag-right-aligned-cell',valueFormatter: currencyFormatter},
  {  headerName: "VVD",field: 'VVD',floatingFilter:true ,cellClass: 'ag-right-aligned-cell',valueFormatter: currencyFormatter},
  {  headerName: "HMT",field: 'HMT', floatingFilter:true ,cellClass: 'ag-right-aligned-cell',valueFormatter: currencyFormatter },
  {  headerName: "VDK",field: 'VDK',floatingFilter:true ,cellClass: 'ag-right-aligned-cell',valueFormatter: currencyFormatter},
  {  headerName: "Total",field: 'grand_total', floatingFilter:true ,cellClass: 'bg-color',headerClass: 'header-color', cellClass: "total-column",valueFormatter: currencyFormatter},
  ]

};

const getColumnDefs = (tab, data) => {

  if (tabColumnMap[tab]) {
    return tabColumnMap[tab].map(col => ({
      flex: 1,
      minWidth: 120,
      sortable: true,
      filter: col.filter || "agTextColumnFilter",
      floatingFilter: true,
      resizable: true,

      ...col,

      // ✅ DO NOT override if already exists
      // valueFormatter: col.valueFormatter || ((params) => {
      //   const num = parseFloat(params.value);
      //   return !isNaN(num) ? formatNumberWithCommas(num) : params.value;
      // }),

      // ✅ Only right align numbers
      cellStyle: col.cellStyle || (
        typeof col.valueFormatter !== "undefined"
          ? { textAlign: "right" }
          : {}
      )
    }));
  }

  // fallback dynamic
  return data && data.length > 0
    ? Object.keys(data[0]).map(key => ({
        headerName: key.replace(/_/g, " "),
        field: key,
        flex: 1,
        minWidth: 120
      }))
    : [];
};

  return (
    <Container
      fluid
      className={`p-0 ${dark ? "bg-dark text-light" : "bg-light"}`}
      style={{ minHeight: "100vh" }}
    >
      <div className="p-0">
        <div
          className={`card shadow-sm ${dark ? "bg-secondary text-light" : ""}`}
          style={{ borderRadius: "12px", margin: "0 auto", maxWidth: "100%" }}
        >
          <div className={`p-3 ${dark ? "bg-dark" : "bg-light"}`}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h4>Manufacturing Data New</h4>
                {/* <p style={{ fontSize: "0.9rem" }}>
                  Please fill out all required fields
                </p> */}
              </div>
              <div className="d-flex gap-2">
                                {/* Action Buttons */}
                                 {/* Action Buttons */}
                                 <button
        onClick={handleRefresh}
        disabled={loading}
        style={{
          padding: "0.375rem 0.75rem",
          fontSize: "0.875rem",
          borderRadius: "0.25rem",
          border: "1px solid #007bff",
          backgroundColor: "transparent",
          color: "#007bff",
          cursor: "pointer",
        }}
        title="Refresh data"
      >
        🔄 {!isMobile && "Refresh"}
      </button>

      <button
        onClick={downloadExcel}
        style={{
          padding: "0.375rem 0.75rem",
          fontSize: "0.875rem",
          borderRadius: "0.25rem",
          border: "none",
          backgroundColor: "#28a745",
          color: "white",
          cursor: "pointer",
        }}
      >
        📊 {!isMobile && "Export CSV"}
      </button>

      <button
        onClick={autoSizeAll}
        style={{
          padding: "0.375rem 0.75rem",
          fontSize: "0.875rem",
          borderRadius: "0.25rem",
          border: "none",
          backgroundColor: "#17a2b8",
          color: "white",
          cursor: "pointer",
        }}
      >
        ⇔ {!isMobile && "Auto Size"}
      </button>

      <button
        onClick={toggleFullScreen}
        style={{
          padding: "0.375rem 0.75rem",
          fontSize: "0.875rem",
          borderRadius: "0.25rem",
          border: "1px solid #6c757d",
          backgroundColor: "transparent",
          color: theme === "dark" ? "#                                                                                                                                                                                                                                                                                                                                                                                                                        " : "#000000",
          cursor: "pointer",
        }}
      >
        {isFullScreen ? "🗗" : "🗖"} {!isMobile && (isFullScreen ? "Exit" : "Full")}
      </button>

      <button
        onClick={toggleTheme}
        style={{
          padding: "0.375rem 0.75rem",
          fontSize: "0.875rem",
          borderRadius: "0.25rem",
          border: "1px solid #6c757d",
          backgroundColor: "transparent",
          color: theme === "dark" ? "#ffffff" : "#000000",
          cursor: "pointer",
        }}
      >
        {theme === "light" ? "🌙" : "☀️"} {!isMobile && (theme === "light" ? "Dark" : "Light")}
      </button>

                                </div>
            </div>
          </div>

          <div className="p-4 card-body">
            {/* Upload Form */}
            <Form onSubmit={handleSubmit}>
              <Accordion defaultActiveKey="0">
                <Accordion.Item eventKey="0">
                  <Accordion.Header>Upload Manufacturing Data</Accordion.Header>
                  <Accordion.Body>
                    <Row className="align-items-center">
                      <Col md={3}>
                        <Form.Group className="mb-0">
                          <Form.Label>Financial Year</Form.Label>
                          <Select
                            options={options}
                            value={selectedOption}
                            onChange={handleYearChange}
                            placeholder="Select Financial Year..."
                            isClearable
                          />
                        </Form.Group>
                      </Col>

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
                          onClick={() => {
                            setFile(null);
                            setSelectedOption(null);
                          }}
                        >
                          Reset
                        </Button>
                      </Col>
                    </Row>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </Form>

            {/* Tabs Menu */}
            <div className="d-flex gap-2 flex-wrap mb-3 mt-3">
              {tabs.map((tab) => (
                <Button
                  key={tab}
                  size="sm"
                  variant={activeTab === tab ? "primary" : "outline-primary"}
                  onClick={() => {
                    setActiveTab(tab);
                  
                    if (!gridData[tab] && selectedOption) {
                      fetchTabData(selectedOption.value, tab);
                    }
                  }}
                >
                  {tab.replace(/_/g, " ")}
                </Button>
              ))}
            </div>

            {/* Responsive AG Grid Display */}
            {/* Loader */}
            {loading && (
  <div style={{
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "rgba(255,255,255,0.8)",
    padding: "10px 20px",
    borderRadius: "5px",
    zIndex: 10,
    
  }}>
    ⏳ Loading...
  </div>
)}
            {tabs.map(
              (tab) =>
                activeTab === tab &&
                gridData[tab] &&
                gridData[tab].length > 0 && (
                  <div
                    key={tab}
                    className="ag-theme-alpine"
                    // style={{
                    //   width: "100%",
                    //   height: "60vh", // responsive vertical height
                    //   overflow: "auto",
                    // }}
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
                      rowData={gridData[tab]}
                      columnDefs={getColumnDefs(tab, gridData[tab])}
                      defaultColDef={{
                        sortable: true,
                        filter: "agTextColumnFilter",
                        floatingFilter: true,
                        resizable: true,
                        minWidth: 120,
                        flex: 1,
                        
                      }}
                      rowClassRules={{
                        'total-row': (params) => {
                          const totalTabs = [
                            "balance_billing",
                            "billing_done",
                            "po_value",
                            "product_ownerwise"
                          ];
                      
                          return (
                            totalTabs.includes(activeTab) &&
                            params.node.rowIndex === gridData[activeTab].length - 1
                          );
                        }
                      }}
                      suppressMovableColumns={isMobile}
                      enableRangeSelection={!isMobile}
                      rowMultiSelectWithClick={false}
                      animateRows={!isMobile}
                      enableCellTextSelection={true}
                      suppressHorizontalScroll={false}
                      headerHeight={isMobile ? 40 : 48}
                      rowHeight={isMobile ? 35 : 42}
                      onGridReady={(params) => {
                        setGridApi(params.api);
                        setColumnApi(params.columnApi);
                    
                        params.api.sizeColumnsToFit(); // optional
                      }}
                    />
                  </div>
                )
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}
