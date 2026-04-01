import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AgGridReact } from "ag-grid-react";
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

import "ag-grid-community/styles/ag-theme-alpine.css";

/* ---------------- REGISTER MODULES ---------------- */
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

/* ---------------- UTILS ---------------- */
/* ---------------- CURRENCY FORMATTER ---------------- */
const currencyFormatter = (params) => {
  if (params.value === null || params.value === undefined || params.value === "")
    return "";

  const num = Number(params.value);
  return num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const formatNumberWithCommas = (value) => {
  if (value === null || value === undefined || value === '') return value;
  // Check if value is a number or can be converted to number
  const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
  if (isNaN(num)) return value;
  return num.toLocaleString('en-IN');
};

/* ---------------- TAB CONFIG ---------------- */
const TAB_CONFIG = {
  1: {
    label: "All Material",
    api: "get_projectlist_23.php",
    columns: [
      "FILE_NAME",
      "CUSTOMER_AMBASADDOR",
      "FILE_ID",
      "CUSTOMER_NAME",
      "city",
      "state",
      "PRODUCT_NAME",
      "suply_po_no",
      "suply_po_date",
      "suply_po_amount",
      "labour_file",
      "labour_po_no",
      "labour_po_date",
      "labour_po_amount",
      "total_po_amount"
    ]
  },

  2: {
    label: "AMC",
    api: "get_projectlAMCist_23.php",
    columns: [
      "FILE_NAME",
      "FILE_ID",
      "CUSTOMER_AMBASADDOR",
      "CUSTOMER_NAME",
      "city",
      "state",
      "PRODUCT_NAME",
      "FILE_TYPE_NAME",
      "CONTACT_PERSON_NAME",
      "CONTACT_NUMBER",
      "DETAIL_ADDRESS",
      "stName",
      "po_no",
      "po_date",
      "po_amount"
    ]
  },

  3: { label: "Mis.Supply", api: "get_projectMissSupply_23.php", columns: [
    "FILE_NAME",
    "FILE_ID",
    "CUSTOMER_AMBASADDOR",
    "CUSTOMER_NAME",
    "city",
    "state",
    "PRODUCT_NAME",
    "FILE_TYPE_NAME",
    "CONTACT_PERSON_NAME",
    "CONTACT_NUMBER",
    "DETAIL_ADDRESS",
    "stName",

    "l_po_no",
    "l_po_date",
    "l_po_amount",

    "file_no",
    "po_no",
    "po_date",
    "po_amount",

    "total_po_amount"
  ]},
  4: { label: "Labour", api: "get_projectMiscLab_23.php",  columns: [
    "FILE_NAME",
    "FILE_ID",
    "suply_po_no",
    "CUSTOMER_AMBASADDOR",
    "CUSTOMER_NAME",
    "city",
    "state",
    "PRODUCT_NAME",
    "FILE_TYPE_NAME",
    "CONTACT_PERSON_NAME",
    "CONTACT_NUMBER",
    "DETAIL_ADDRESS",
    "stName",
    "labour_file",
    "labour_po_no",
    "labour_po_date",
    "labour_po_amount",

    "total_po_amount"
  ]},
  5: { label: "Labour SL1", api: "get_projectMiscLab_SL1_23.php",  columns: [
    "FILE_NAME",
    "FILE_ID",
    "CUSTOMER_AMBASADDOR",
    "CUSTOMER_NAME",
    "city",
    "state",
    "PRODUCT_NAME",
    "FILE_TYPE_NAME",
    "CONTACT_PERSON_NAME",
    "CONTACT_NUMBER",
    "DETAIL_ADDRESS",
    "stName",
    // "labour_file",
    "labour_po_no",
    "labour_po_date",
    "labour_po_amount",
    "suply_file_no",
    "suply_po_no",
    "suply_po_date",  
      "suply_po_amount",
   

    "total_po_amount"
  ] },
  6: { label: "Labour SL7", api: "get_projectMiscLab_SL7_23.php", columns: [
    "FILE_NAME",
    "FILE_ID",
    "CUSTOMER_AMBASADDOR",
    "CUSTOMER_NAME",
    "city",
    "state",
    "PRODUCT_NAME",
    "FILE_TYPE_NAME",
    "CONTACT_PERSON_NAME",
    "CONTACT_NUMBER",
    "DETAIL_ADDRESS",
    "stName",
    "suply_file_no",
    "suply_po_no",
    "suply_po_date",  
      "suply_po_amount",
    // "labour_file",
    "labour_po_no",
    "labour_po_date",
    "labour_po_amount",
 
   

    "total_po_amount"
  ]}
};

/* ---------------- MASTER COLUMNS ---------------- */
/* ---------------- MASTER COLUMNS ---------------- */
const ALL_COLUMNS = {
  FILE_NAME: {
    headerName: "File No",
    field: "FILE_NAME",
    pinned: "left",
    floatingFilter: true,
    headerCheckboxSelection: true,
    checkboxSelection: true,
    minWidth: 130,
    cellStyle: { textAlign: 'right' }
  },

  FILE_ID: {
    headerName: "File ID",
    field: "FILE_ID",
    floatingFilter: true,
    cellStyle: { textAlign: 'right' },
    valueFormatter: (params) => formatNumberWithCommas(params.value),
    minWidth: 130
  },

  CUSTOMER_AMBASADDOR: {
    headerName: "Owner Name",
    field: "CUSTOMER_AMBASADDOR",
    floatingFilter: true,
    minWidth: 200,
    cellStyle: { textAlign: 'right' }
  },

  CUSTOMER_NAME: {
    headerName: "Customer Name",
    field: "CUSTOMER_NAME",
    floatingFilter: true,
    minWidth: 200,
    cellStyle: { textAlign: 'right' }
  },

  city: { 
    headerName: "City", 
    field: "city", 
    floatingFilter: true, 
    minWidth: 120,
    cellStyle: { textAlign: 'right' }
  },
  
  state: { 
    headerName: "State", 
    field: "state", 
    floatingFilter: true, 
    minWidth: 120,
    cellStyle: { textAlign: 'right' }
  },

  PRODUCT_NAME: {
    headerName: "Product Type",
    field: "PRODUCT_NAME",
    floatingFilter: true,
    minWidth: 160,
    cellStyle: { textAlign: 'right' }
  },

  suply_po_no: { 
    headerName: "Supply PO No", 
    field: "suply_po_no", 
    floatingFilter: true, 
    minWidth: 150,
    cellStyle: { textAlign: 'right' }
  },
  
  suply_po_date: { 
    headerName: "Supply PO Date", 
    field: "suply_po_date", 
    floatingFilter: true, 
    minWidth: 150,
    cellStyle: { textAlign: 'right' }
  },
  
  suply_po_amount: {
    headerName: "Supply PO Amount",
    field: "suply_po_amount",
    floatingFilter: true,
    cellStyle: { textAlign: 'right' },
    valueFormatter: currencyFormatter,
    minWidth: 170
  },

  labour_file: {
    headerName: "Labour File Name",
    field: "labour_file",
    floatingFilter: true,
    minWidth: 180,
    cellStyle: { textAlign: 'right' }
  },

  labour_po_no: { 
    headerName: "Labour PO No", 
    field: "labour_po_no", 
    floatingFilter: true, 
    minWidth: 150,
    cellStyle: { textAlign: 'right' }
  },
  
  labour_po_date: { 
    headerName: "Labour PO Date", 
    field: "labour_po_date", 
    floatingFilter: true, 
    minWidth: 150,
    cellStyle: { textAlign: 'right' }
  },
  
  labour_po_amount: {
    headerName: "Labour PO Amount",
    field: "labour_po_amount",
    floatingFilter: true,
    cellStyle: { textAlign: 'right' },
    valueFormatter: currencyFormatter,
    minWidth: 170
  },

  total_po_amount: {
    headerName: "TOTAL PO Amount",
    field: "total_po_amount",
    floatingFilter: true,
    cellStyle: { textAlign: 'right' },
    valueFormatter: currencyFormatter,
    minWidth: 180
  },

  FILE_TYPE_NAME: { 
    headerName: "File Type", 
    field: "FILE_TYPE_NAME", 
    floatingFilter: true, 
    minWidth: 150,
    cellStyle: { textAlign: 'right' }
  },
  
  CONTACT_PERSON_NAME: { 
    headerName: "Shipping Contact Person", 
    field: "CONTACT_PERSON_NAME", 
    floatingFilter: true, 
    minWidth: 220,
    cellStyle: { textAlign: 'right' }
  },
  
  CONTACT_NUMBER: {
    headerName: "Shipping Contact Number",
    field: "CONTACT_NUMBER",
    floatingFilter: true,
    cellStyle: { textAlign: 'right' },
    valueFormatter: (params) => formatNumberWithCommas(params.value),
    minWidth: 180
  },
  
  DETAIL_ADDRESS: { 
    headerName: "Shipping Address", 
    field: "DETAIL_ADDRESS", 
    floatingFilter: true, 
    minWidth: 260,
    cellStyle: { textAlign: 'right' }
  },
  
  stName: { 
    headerName: "Store Location", 
    field: "stName", 
    floatingFilter: true, 
    minWidth: 160,
    cellStyle: { textAlign: 'right' }
  },
  
  po_no: { 
    headerName: "PO No", 
    field: "po_no", 
    floatingFilter: true, 
    minWidth: 150,
    cellStyle: { textAlign: 'right' }
  },
  
  po_date: { 
    headerName: "PO Date", 
    field: "po_date", 
    floatingFilter: true, 
    minWidth: 150,
    cellStyle: { textAlign: 'right' }
  },
  
  po_amount: {
    headerName: "PO Amount",
    field: "po_amount",
    floatingFilter: true,
    cellStyle: { textAlign: 'right' },
    valueFormatter: currencyFormatter,
    minWidth: 170
  },

  l_po_no: {
    headerName: "Labour PO No",
    field: "l_po_no",
    floatingFilter: true,
    minWidth: 150,
    cellStyle: { textAlign: 'right' }
  },

  l_po_date: {
    headerName: "Labour PO Date",
    field: "l_po_date",
    floatingFilter: true,
    minWidth: 150,
    cellStyle: { textAlign: 'right' }
  },

  l_po_amount: {
    headerName: "Labour PO Amount",
    field: "l_po_amount",
    floatingFilter: true,
    valueFormatter: currencyFormatter,
    cellStyle: { textAlign: 'right' },
    minWidth: 170
  },

  file_no: {
    headerName: "Supply File No",
    field: "file_no",
    floatingFilter: true,
    minWidth: 150,
    cellStyle: { textAlign: 'right' }
  },

  suply_file_no: {
    headerName: "Supply File No",
    field: "suply_file_no",
    floatingFilter: true,
    minWidth: 160,
    cellStyle: { textAlign: 'right' }
  }
};


const buildColumnDefs = (tabId) =>
  TAB_CONFIG[tabId].columns.map(k => ALL_COLUMNS[k]);

/* ---------------- COMPONENT ---------------- */
export default function PPCProjectListGrid() {
  const gridRef = useRef(null);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(1);
  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState(buildColumnDefs(1));
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('light');
  const [financialYears, setFinancialYears] = useState([]);
  const [selectedFinancialYear, setSelectedFinancialYear] = useState("");
  const [loadingYears, setLoadingYears] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const isMobile = window.innerWidth < 768;
  const isFullScreen = false;
  const gridHeight = isMobile ? "60vh" : "70vh";

  const themeStyles = {
    cardBg: "#ffffff",
    color: "#000"
  };

  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    cellStyle: { textAlign: 'right' }
}), []);


  const downloadExcel = () => {
    if (!gridRef.current?.api) return;

    try {
        const params = {
            fileName: `PPCProjectList_FY${selectedFinancialYear}_${new Date().toISOString().split('T')[0]}.csv`,
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
  /* ---------------- AUTO SIZE ---------------- */
  const autoSizeAll = () => {
    if (!gridRef.current?.api) return;
    const cols = gridRef.current.api.getColumns();
    gridRef.current.api.autoSizeColumns(cols.map(c => c.getColId()));
  };

  const handleRefresh = () => {
    setActiveTab(t => t);
  };

  const onSelectionChanged = useCallback(() => {
    const api = gridRef.current?.api;
    if (!api) return;
    const rows = api.getSelectedRows();
    setSelectedRow(rows.length === 1 ? rows[0] : null);
  }, []);

  const onRowClicked = useCallback((event) => {
    if (event?.node) {
      event.node.setSelected(true, true);
    }
  }, []);

  const goEditSelectedFile = () => {
    if (!selectedRow) return;
    const raw = String(selectedRow.FILE_ID ?? "").replace(/,/g, "").trim();
    if (!raw) return;
    navigate(`/marketing/project/edit-file/${raw}`);
  };
  const fetchFinancialYears = async () => {
    setLoadingYears(true);
    try {
      const res = await fetch(
        "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/GetYearsApi.php"
      );
      const json = await res.json();
  
      let years = [];
      if (json.status === "success" && Array.isArray(json.data)) {
        years = json.data;
      } else if (Array.isArray(json)) {
        years = json;
      }
  
      years.sort((a, b) =>
        (b.FINANCIAL_YEAR || b.financial_year).localeCompare(
          a.FINANCIAL_YEAR || a.financial_year
        )
      );
  
      setFinancialYears(years);
  
      if (years.length) {
        setSelectedFinancialYear(
          years[0].FINANCIAL_YEAR || years[0].financial_year
        );
      }
    } catch (e) {
      console.error("FY load error", e);
    } finally {
      setLoadingYears(false);
    }
  };
  useEffect(() => {
    fetchFinancialYears();
  }, []);
  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedFinancialYear) return;
  
      setLoading(true);
      try {
        const url = `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/project/${TAB_CONFIG[activeTab].api}?financial_year=${encodeURIComponent(selectedFinancialYear)}`;
  
        const res = await fetch(url);
        const json = await res.json();
        setRowData(json.data || json || []);
      } catch (error) {
        console.error("Error loading data", error);
        setRowData([]);
      } finally {
        setLoading(false);
        setTimeout(autoSizeAll, 300);
      }
    };
  
    setColumnDefs(buildColumnDefs(activeTab));
    fetchData();
  }, [activeTab, selectedFinancialYear]);
  

  return (
    
    <div style={{ padding: 20 }}>
      {/* ================= HEADER UI ================= */}
{/* ================= DASHBOARD HEADER ================= */}
<div
  style={{
    background: "#e9ecef",
    borderBottom: "1px solid #ced4da",
    padding: "16px 24px"
  }}
>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 16
    }}
  >
    {/* LEFT */}
    <div>
      <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
        📋 PPC Project List Dashboard
      </h3>
      <div style={{ fontSize: 14, color: "#6c757d" }}>
        {rowData.length} records found
      </div>
    </div>

    {/* RIGHT ACTIONS */}
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
      {selectedRow && (
        <button type="button" onClick={goEditSelectedFile} className="btn btn-primary">
          ✏️ Edit
        </button>
      )}
      {/* FY */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <strong>FY:</strong>
        <select
          value={selectedFinancialYear}
          onChange={(e) => setSelectedFinancialYear(e.target.value)}
          style={{
            padding: "6px 10px",
            borderRadius: 4,
            border: "1px solid #adb5bd",
            minWidth: 90
          }}
        >
          {financialYears.map((y, i) => (
            <option key={i} value={y.FINANCIAL_YEAR || y.financial_year}>
              {y.FINANCIAL_YEAR || y.financial_year}
            </option>
          ))}
        </select>
      </div>

      <button onClick={handleRefresh} className="btn btn-outline-primary">
        🔄 Refresh
      </button>

      <button   onClick={downloadExcel}className="btn btn-success">
        📊 Export CSV
      </button>

      <button onClick={autoSizeAll} className="btn btn-info text-white">
        ⇔ Auto Size
      </button>

      {/* <button onClick={toggleTheme} className="btn btn-outline-dark">
        🌙 Dark
      </button> */}
    </div>
  </div>
</div>

{/* ================= TABS BAR ================= */}
<div
  style={{
    padding: "12px 24px",
    background: "#ffffff",
    borderBottom: "1px solid #dee2e6"
  }}
>
  {Object.entries(TAB_CONFIG).map(([id, tab]) => (
    <button
      key={id}
      onClick={() => setActiveTab(+id)}
      style={{
        marginRight: 8,
        padding: "6px 16px",
        borderRadius: 20,
        border: "none",
        cursor: "pointer",
        background: activeTab === +id ? "#0d6efd" : "#e9ecef",
        color: activeTab === +id ? "#fff" : "#000",
        fontWeight: 500
      }}
    >
      {tab.label}
    </button>
  ))}
</div>

{/* ================= END HEADER UI ================= */}

      {/* FINANCIAL YEAR DROPDOWN */}
{/* <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
  <label style={{ fontWeight: 600 }}>Financial Year:</label>
  <select
    value={selectedFinancialYear}
    disabled={loadingYears}
    onChange={(e) => setSelectedFinancialYear(e.target.value)}
    style={{
      padding: "6px 10px",
      borderRadius: 4,
      border: "1px solid #ced4da",
      minWidth: 120
    }}
  >
    {financialYears.map((y, i) => (
      <option key={i} value={y.FINANCIAL_YEAR || y.financial_year}>
        {y.FINANCIAL_YEAR || y.financial_year}
      </option>
    ))}
  </select>
</div> */}

      {/* TABS */}
      {/* <div style={{ marginBottom: 10 }}>
        {Object.entries(TAB_CONFIG).map(([id, tab]) => (
          <button
            key={id}
            onClick={() => setActiveTab(+id)}
            style={{
              marginRight: 6,
              padding: "6px 12px",
              background: activeTab === +id ? "#007bff" : "#e9ecef",
              color: activeTab === +id ? "#fff" : "#000",
              border: "none",
              borderRadius: 4,
              cursor: "pointer"
            }}
          >
            {tab.label}
          </button>
        ))}
      </div> */}

      {/* GRID BODY */}
    {/* Grid Body */}
<div
  style={{
    backgroundColor: themeStyles.cardBg,
    padding: isFullScreen ? 0 : "15px"
  }}
>
  {rowData.length === 0 && !loading ? (
    <div
      style={{
        textAlign: "center",
        padding: "50px",
        color: themeStyles.color
      }}
    >
      <div style={{ fontSize: "3rem", marginBottom: "20px" }}>📋</div>
      <h5>No PPC project data available</h5>
      <p>Select a tab or try refreshing.</p>
      <button
        onClick={handleRefresh}
        style={{
          padding: "0.5rem 1rem",
          fontSize: "1rem",
          borderRadius: "0.25rem",
          border: "none",
          backgroundColor: "#007bff",
          color: "white",
          cursor: "pointer",
          marginTop: "1rem"
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
        ...(theme === "dark" && {
          "--ag-background-color": "#212529",
          "--ag-header-background-color": "#343a40",
          "--ag-odd-row-background-color": "#2c3034",
          "--ag-even-row-background-color": "#212529",
          "--ag-row-hover-color": "#495057",
          "--ag-foreground-color": "#f8f9fa",
          "--ag-header-foreground-color": "#f8f9fa",
          "--ag-border-color": "#495057",
          "--ag-input-background-color": "#343a40",
          "--ag-input-border-color": "#495057"
        })
      }}
    >
      <AgGridReact
        ref={gridRef}
        theme="legacy"
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        pagination
        paginationPageSize={isMobile ? 10 : 25}
        rowSelection="single"
        animateRows={!isMobile}
        enableCellTextSelection
        headerHeight={isMobile ? 40 : 48}
        rowHeight={isMobile ? 35 : 42}
        onGridReady={() => setTimeout(autoSizeAll, 500)}
        onRowClicked={onRowClicked}
        onSelectionChanged={onSelectionChanged}
      />
    </div>
  )}
</div>

    </div>
  );
}
