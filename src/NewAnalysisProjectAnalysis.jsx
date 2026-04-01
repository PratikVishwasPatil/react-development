import React, { useEffect, useMemo, useState, useRef } from "react";
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
  CsvExportModule,
} from "ag-grid-community";
import {
  Container,
  Button,
  Row,
  Col,
  Card,
  ButtonGroup,
  Form,
  Tab,
  Tabs,
} from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  ValidationModule,
  DateFilterModule,
  NumberFilterModule,
  TextFilterModule,
  RowSelectionModule,
  PaginationModule,
  CsvExportModule,
]);

// ─── Dropdown Cell Editor ────────────────────────────────────────────────────
const DropdownCellEditor = React.forwardRef((props, ref) => {
  const [value, setValue] = useState(props.value || "");

  React.useImperativeHandle(ref, () => ({
    getValue: () => value,
    isCancelBeforeStart: () => false,
    isCancelAfterEnd: () => false,
  }));

  const options = props.options || [];

  return (
    <select
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => props.stopEditing()}
      style={{ width: "100%", height: "100%", border: "none", outline: "none" }}
      autoFocus
    >
      <option value="">-- Select --</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
});

const NewAnalysisProjectAnalysis = () => {
  const [theme, setTheme] = useState("light");
  const [rowDataTab1, setRowDataTab1] = useState([]);
  const [rowDataTab2, setRowDataTab2] = useState([]);
  const [rowDataTab3, setRowDataTab3] = useState([]);
  const [columnDefs, setColumnDefs] = useState([]);
  const [isFullScreen, setIsFullScreen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState([]);
  const [financialYears, setFinancialYears] = useState([]);
  const [selectedFinancialYearTab1, setSelectedFinancialYearTab1] = useState("");
  const [selectedFinancialYearTab2, setSelectedFinancialYearTab2] = useState("");
  const [selectedFinancialYearTab3, setSelectedFinancialYearTab3] = useState("");
  const [loadingYears, setLoadingYears] = useState(false);
  const [cityOptions, setCityOptions] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);
  const gridRefTab1 = useRef(null);
  const gridRefTab2 = useRef(null);
  const gridRefTab3 = useRef(null);

  const tabs = [
    "Project Analysis",
    "Project Details",
    "Project Detail File Splitwise",
  ];
  const [activeTab, setActiveTab] = useState(tabs[0]);

  // ─── Toast ────────────────────────────────────────────────────────────────
  const showToast = (message, type = "info") => {
    const toastDiv = document.createElement("div");
    toastDiv.style.cssText = `
      position: fixed; top: 20px; right: 20px;
      padding: 15px 25px;
      background: ${type === "success" ? "#28a745" : type === "error" ? "#dc3545" : "#17a2b8"};
      color: white; border-radius: 5px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.2);
      z-index: 9999; font-family: Arial, sans-serif;
      animation: slideIn 0.3s ease-out;
    `;
    toastDiv.textContent = message;
    document.body.appendChild(toastDiv);
    setTimeout(() => {
      toastDiv.style.animation = "slideOut 0.3s ease-out";
      setTimeout(() => document.body.removeChild(toastDiv), 300);
    }, 3000);
  };

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(400px); opacity: 0; } }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ─── Fetch Cities & Types ─────────────────────────────────────────────────
  const fetchCities = async () => {
    try {
      const res = await fetch(
        "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/getAllowanceCitiesApi.php"
      );
      const data = await res.json();
      if (data.status === "success" && Array.isArray(data.cities)) {
        setCityOptions(data.cities);
      }
    } catch (err) {
      console.error("Error fetching cities:", err);
    }
  };

  const fetchTypes = async () => {
    try {
      const res = await fetch(
        "http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/getProjectTypesApi.php"
      );
      const data = await res.json();
      if (data.status === "success" && Array.isArray(data.types)) {
        setTypeOptions(data.types);
      }
    } catch (err) {
      console.error("Error fetching types:", err);
    }
  };

  // ─── Fetch Financial Years ────────────────────────────────────────────────
  const fetchFinancialYears = async () => {
    setLoadingYears(true);
    try {
      const response = await fetch(
        "http://93.127.167.54/Surya_React/surya_dynamic_api/GetYearsApi.php",
        { method: "GET", headers: { "Content-Type": "application/json" } }
      );
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      let yearsData = [];
      if (data.status === "success" && Array.isArray(data.data)) {
        yearsData = data.data;
      } else if (Array.isArray(data)) {
        yearsData = data;
      }

      yearsData.sort((a, b) => {
        const yearA = a.FINANCIAL_YEAR || a.financial_year;
        const yearB = b.FINANCIAL_YEAR || b.financial_year;
        return yearB.localeCompare(yearA);
      });

      setFinancialYears(yearsData);

      if (yearsData.length > 0) {
        const defaultYear = yearsData[0].FINANCIAL_YEAR || yearsData[0].financial_year;
        setSelectedFinancialYearTab1(defaultYear);
        setSelectedFinancialYearTab2(defaultYear);
        setSelectedFinancialYearTab3(defaultYear);
      }
    } catch (error) {
      console.error("Error fetching financial years:", error);
      showToast(`Error loading financial years: ${error.message}`, "error");
    } finally {
      setLoadingYears(false);
      setInitialLoading(false);
    }
  };

  // ─── Fetch Tab Data ───────────────────────────────────────────────────────
  const fetchDataTab1 = async (financialYear) => {
    if (!financialYear) { showToast("Please select a financial year", "error"); return; }
    setLoading(true);
    try {
      const response = await fetch(
        `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/new_analysis/get_filelist_for_project_analysisApi.php?financial_year=${financialYear}`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
      );
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data.status === "success" && Array.isArray(data.data)) {
        setRowDataTab1(data.data);
        showToast(`Loaded ${data.data.length} records for FY ${financialYear}`, "success");
      } else if (Array.isArray(data)) {
        setRowDataTab1(data);
        showToast(`Loaded ${data.length} records for FY ${financialYear}`, "success");
      } else {
        setRowDataTab1([]);
        showToast("No data found for selected financial year", "info");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      showToast(`Error fetching data: ${error.message}`, "error");
      setRowDataTab1([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDataTab2 = async (financialYear) => {
    if (!financialYear) { showToast("Please select a financial year", "error"); return; }
    setLoading(true);
    try {
      const response = await fetch(
        `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/new_analysis/get_filesplitlistApi.php?financial_year=${financialYear}`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
      );
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data.status === true && Array.isArray(data.data)) {
        setRowDataTab2(data.data);
        showToast(`Loaded ${data.count} records for FY ${financialYear}`, "success");
      } else if (Array.isArray(data)) {
        setRowDataTab2(data);
        showToast(`Loaded ${data.length} records for FY ${financialYear}`, "success");
      } else {
        setRowDataTab2([]);
        showToast("No data found for selected financial year", "info");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      showToast(`Error fetching data: ${error.message}`, "error");
      setRowDataTab2([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDataTab3 = async (financialYear) => {
    if (!financialYear) { showToast("Please select a financial year", "error"); return; }
    setLoading(true);
    try {
      const response = await fetch(
        `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/new_analysis/get_project_analysis_detailsApi.php?financial_year=${financialYear}`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
      );
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data.status && Array.isArray(data.data)) {
        setRowDataTab3(data.data);
        showToast(`Loaded ${data.count} records for FY ${financialYear}`, "success");
      } else if (Array.isArray(data)) {
        setRowDataTab3(data);
        showToast(`Loaded ${data.length} records for FY ${financialYear}`, "success");
      } else {
        setRowDataTab3([]);
        showToast("No data found for selected financial year", "info");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      showToast(`Error fetching data: ${error.message}`, "error");
      setRowDataTab3([]);
    } finally {
      setLoading(false);
    }
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const n = (v) => (v === undefined || v === null || v === "" ? 0 : Number(v));
  const s = (v) => (v === undefined || v === null ? "" : String(v));

  const buildProjectPayload = (row) => ({
    file_name: s(row.FILE_NAME),
    owner_name: s(row.owner_name),
    city: s(row.location),
    type: s(row.product_type),
    spec: s(row.specification),
    cname: s(row.client_name),
    poamt: n(row.material_po),
    mktg_material_cost: n(row.mktg_material_cost),
    desgin_bom: n(row.desgin_bom),
    electrical_bom: n(row.electrical_bom),
    function_call: n(row.function_call),
    Diff_Between_Mktg_and_At_Actual: n(row.Diff_Between_Mktg_and_At_Actual),
    mktg_trasport_cost: n(row.mktg_trasport_cost),
    transport_actual_cost: n(row.transport_actual_cost),
    mktg_labour_cost: n(row.mktg_labour_cost),
    kg: n(row.kg || row.kg_mktg),
    kg_design: n(row.kg_design_value),
    Diff_Between_Supply_PO_and_Actual_material_consumption: n(row.Diff_Between_Supply_PO_and_Actual_material_consumption),
    LabourPOActualcost: n(row.LabourPOActualcost),
    person: n(row.person_to_display),
    kg_person: n(row.kg_person_to_display1 || row.kg_person_to_display),
    total_kg: n(row.total_kg_person_to_display),
    working_days: n(row.working_days_to_display),
    totalManDays: n(row.totalManDays_to_display),
    travellingDays: n(row.travellingDays_to_display),
    actualDays: n(row.actualDays_to_display),
    covid: n(row.covid_to_display),
    cost: n(row.project_cost_to_display),
    FactorA: n(row.FactorA_to_display),
    FactorB: n(row.FactorB_to_display),
    mktg_allowed_site_expe: n(row.mktg_allowed_site_expe),
    actual_site_expe: n(row.actual_site_expe),
    wages: n(row.wages),
    Diff_Between_Mktg_Allowed_and_Actual_site_Exp: n(row.Diff_Between_Mktg_Allowed_and_Actual_site_Exp),
    Diff_Between_Labor_PO_and_Actual_site_expenses: n(row.Diff_Between_Labor_PO_and_Actual_site_expenses),
    totalPo: n(row.totalPo),
    Total_Mktg_Allowed: n(row.Total_Mktg_Allowed),
    Total_Expense: n(row.Total_Expense),
    TOppccost: n(row.gettotallcost),
    Diff_between_tot_mktg_allowed_and_total_expense: n(row.Diff_between_tot_mktg_allowed_and_total_expense),
  });

  const saveProjectData = async (payload) => {
    const res = await fetch(
      "http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/new_analysis/saveProjectDataApi.php",
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
    );
    return res.json();
  };

  // ─── File Click Handlers ──────────────────────────────────────────────────
  const handleFileClick = async (params) => {
    const fileKey = params.data.keyname || params.data.FILE_NAME;
    const financialYear = selectedFinancialYearTab1;
    if (!fileKey) { showToast("File key not found", "error"); return; }
    try {
      const res = await fetch(
        `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/new_analysis/getDataOfProjectAnalysisTabAPi.php?financial_year=${financialYear}&split_FILEID=${fileKey}`
      );
      const json = await res.json();
      if (json.status !== "success" || !json.data?.length) { showToast("No file data found", "info"); return; }
      const updatedRow = { ...params.data, ...json.data[0], FILE_NAME: params.data.FILE_NAME, detailsLoaded: true };
      params.api.applyTransaction({ update: [updatedRow] });
      params.api.refreshCells({ rowNodes: [params.node], force: true });
      showToast("File data loaded", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to load file data", "error");
    }
  };

  const handleSaveRowTab1 = async (params) => {
    try {
      const payload = buildProjectPayload(params.data);
      const json = await saveProjectData(payload);
      if (json.status) {
        params.node.setData({ ...params.data, isDirty: false });
        showToast("Project data saved successfully", "success");
      } else {
        showToast("Save failed", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Save API error", "error");
    }
  };

  const handleFileClickTab3 = async (params) => {
    const fileKey = params.data.keyname || params.data.FILE_NAME;
    const financialYear = selectedFinancialYearTab3;
    if (!fileKey || !financialYear) { showToast("Missing file or financial year", "error"); return; }
    try {
      const res = await fetch(
        `http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/new_analysis/get_project_analysis_testApi.php?split_FILEID=${encodeURIComponent(fileKey)}`
      );
      const json = await res.json();
      if (json.status !== "success" || !json.data?.length) { showToast("No data found", "info"); return; }
      const updatedRow = { ...params.data, ...json.data[0], FILE_NAME: params.data.FILE_NAME, detailsLoaded: true };
      params.api.applyTransaction({ update: [updatedRow] });
      params.api.refreshCells({ rowNodes: [params.node], force: true });
      showToast("File details loaded", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to load file details", "error");
    }
  };

  // ─── Formatters ───────────────────────────────────────────────────────────
  const numberFormatter = (params) => {
    if (params.value === null || params.value === undefined || params.value === "") return "";
    const num = Number(params.value);
    if (isNaN(num)) return params.value;
    return num.toLocaleString("en-IN");
  };

  // ─── Column Definitions ───────────────────────────────────────────────────
  const generateColumnDefs = () => [
    {
      headerName: "Sr No",
      field: "serialNumber",
      valueGetter: (params) => (params.node ? params.node.rowIndex + 1 : ""),
      width: isMobile ? 60 : 80,
      minWidth: 50,
      pinned: "left",
      lockPosition: true,
      cellStyle: { textAlign: "center" },
    },
    { field: "owner_name", headerName: "Owner Name", width: isMobile ? 200 : 280, pinned: "left" },
    {
      field: "FILE_NAME", headerName: "File Name", width: isMobile ? 200 : 280, pinned: "left",
      checkboxSelection: true, headerCheckboxSelection: true,
      cellRenderer: (params) => (
        <span style={{ color: "#0d6efd", cursor: "pointer", fontWeight: 600 }} onClick={() => handleFileClick(params)}>
          {params.value}
        </span>
      ),
    },
    {
      field: "location", headerName: "Location", width: isMobile ? 200 : 280, pinned: "left",
      editable: true, cellEditor: DropdownCellEditor,
      cellEditorParams: () => ({ options: cityOptions }), cellEditorPopup: false,
    },
    {
      field: "product_type", headerName: "Type", width: isMobile ? 200 : 280,
      editable: true, cellEditor: DropdownCellEditor,
      cellEditorParams: () => ({ options: typeOptions }), cellEditorPopup: false,
    },
    { field: "specification", headerName: "Specification", width: isMobile ? 200 : 280 },
    { field: "client_name", headerName: "Client Name", width: isMobile ? 200 : 280 },
    { field: "material_po", headerName: "Material PO", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { field: "mktg_material_cost", headerName: "Marketing Material Cost Allowed", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { field: "desgin_bom", headerName: "Design BOM", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { field: "Diff_Between_Mktg_and_At_Actual", headerName: "Diff between Marketing and At actual", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { field: "mktg_trasport_cost", headerName: "Marketing allowed transport Cost", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { field: "transport_actual_cost", headerName: "Transport Actual Cost", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { field: "mktg_labour_cost", headerName: "Marketing Labour Cost", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { field: "kg_mktg", headerName: "KG Marketing", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { field: "kg_design_value", headerName: "Kg Design", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { field: "Diff_Between_Supply_PO_and_Actual_material_consumption", headerName: "Diff between Supply PO and Actual PO Consumption", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { field: "LabourPOActualcost", headerName: "Labour PO", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { field: "mktg_allowed_site_expe", headerName: "Marketing Allowed Site Expenses", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { field: "actual_site_expe", headerName: "Actual Site Expenses", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { field: "Diff_Between_Mktg_Allowed_and_Actual_site_Exp", headerName: "Diff between Marketing Allowed and Actual Site Expenses", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { field: "Diff_Between_Labor_PO_and_Actual_site_expenses", headerName: "Diff between Labour PO and Actual Site Expenses", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { field: "totalPo", headerName: "Total PO", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { field: "Total_Mktg_Allowed", headerName: "Total Marketing Allowed (Mtrl + Site + Transport)", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { field: "Total_Expense", headerName: "Total Expenses (Act Mtrl + cons + Site + Transport)", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { field: "Diff_between_tot_mktg_allowed_and_total_expense", headerName: "Diff betw Total Marketing Allowed and Total as Actual Expe", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    {
      headerName: "Action", field: "action", width: isMobile ? 70 : 100,
      pinned: isMobile ? null : "right", editable: false,
      cellRenderer: (params) => {
        const canSave = params.data.detailsLoaded || params.data.isDirty;
        return (
          <button
            className="btn btn-sm btn-success"
            disabled={!canSave}
            onClick={() => handleSaveRowTab1(params)}
            style={{ opacity: canSave ? 1 : 0.5, cursor: canSave ? "pointer" : "not-allowed" }}
          >
            Save
          </button>
        );
      },
    },
  ];

  const rightColDef = [
    { headerName: "Sr No", field: "serialNumber", valueGetter: (params) => (params.node ? params.node.rowIndex + 1 : ""), width: isMobile ? 60 : 80, minWidth: 50, pinned: "left", lockPosition: true, cellStyle: { textAlign: "center" } },
    { field: "owner_name", headerName: "Owner Name", width: isMobile ? 200 : 280, pinned: "left" },
    { field: "file_name", headerName: "File Name", width: isMobile ? 200 : 280, pinned: "left", checkboxSelection: true, headerCheckboxSelection: true },
    { field: "city", headerName: "Location", width: isMobile ? 200 : 280, pinned: "left" },
    { field: "type", headerName: "Type", width: isMobile ? 200 : 280 },
    { field: "specification", headerName: "Specification", width: isMobile ? 200 : 280 },
    { field: "client_name", headerName: "Client Name", width: isMobile ? 200 : 280 },
    { field: "material_po", headerName: "Material PO", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { field: "mktg_material_cost", headerName: "Marketing Material Cost Allowed", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { field: "desgin_bom", headerName: "Design BOM", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { field: "Diff_Between_Mktg_and_At_Actual", headerName: "Diff between Marketing and At actual", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { field: "mktg_trasport_cost", headerName: "Marketing allowed transport Cost", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { field: "transport_actual_cost", headerName: "Transport Actual Cost", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { field: "mktg_labour_cost", headerName: "Marketing Labour Cost", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { field: "kg_mktg", headerName: "KG Marketing", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { field: "kg_design_value", headerName: "Kg Design", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { field: "Diff_Between_Supply_PO_and_Actual_material_consumption", headerName: "Diff between Supply PO and Actual PO Consumption", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { field: "LabourPOActualcost", headerName: "Labour PO", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { field: "mktg_allowed_site_expe", headerName: "Marketing Allowed Site Expenses", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { field: "actual_site_expe", headerName: "Actual Site Expenses", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { field: "Diff_Between_Mktg_Allowed_and_Actual_site_Exp", headerName: "Diff between Marketing Allowed and Actual Site Expenses", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { field: "Diff_Between_Labor_PO_and_Actual_site_expenses", headerName: "Diff between Labour PO and Actual Site Expenses", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { field: "totalPo", headerName: "Total PO", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { field: "Total_Mktg_Allowed", headerName: "Total Marketing Allowed (Mtrl + Site + Transport)", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { field: "Total_Expense", headerName: "Total Expenses (Act Mtrl + cons + Site + Transport)", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { field: "Diff_between_tot_mktg_allowed_and_total_expense", headerName: "Diff betw Total Marketing Allowed and Total as Actual Expe", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { headerName: "TIMESTAMP", field: "timestamp", width: isMobile ? 120 : 200, minWidth: isMobile ? 90 : 150, valueFormatter: (params) => String(params.value) },
  ];

  const generateColumnDefsTab3 = [
    { headerName: "Sr No", field: "serialNumber", valueGetter: (params) => (params.node ? params.node.rowIndex + 1 : ""), width: isMobile ? 60 : 80, minWidth: 50, pinned: "left", lockPosition: true, cellStyle: { textAlign: "center" } },
    { field: "owner_name", headerName: "Owner Name", width: isMobile ? 200 : 280, pinned: "left" },
    {
      field: "FILE_NAME", headerName: "File Name", width: isMobile ? 200 : 280, pinned: "left",
      checkboxSelection: true, headerCheckboxSelection: true,
      cellRenderer: (params) => (
        <span style={{ color: "#0d6efd", cursor: "pointer", fontWeight: 600 }} onClick={(e) => { e.stopPropagation(); handleFileClickTab3(params); }}>
          {params.value}
        </span>
      ),
    },
    { field: "location", headerName: "Location", width: isMobile ? 200 : 280, pinned: "left", editable: true },
    { field: "product_type", headerName: "Type", width: isMobile ? 200 : 280, editable: true },
    { field: "specification", headerName: "Specification", width: isMobile ? 200 : 280 },
    { field: "client_name", headerName: "Client Name", width: isMobile ? 200 : 280 },
    { field: "material_po", headerName: "Material PO", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { field: "mktg_material_cost", headerName: "Marketing Material Cost Allowed", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { field: "desgin_bom", headerName: "Design BOM", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { field: "Diff_Between_Mktg_and_At_Actual", headerName: "Diff between Marketing and At actual", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { field: "mktg_trasport_cost", headerName: "Marketing allowed transport Cost", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { field: "transport_actual_cost", headerName: "Transport Actual Cost", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { field: "mktg_labour_cost", headerName: "Marketing Labour Cost", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { field: "kg_mktg", headerName: "KG Marketing", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { field: "kg_design_value", headerName: "Kg Design", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { field: "Diff_Between_Supply_PO_and_Actual_material_consumption", headerName: "Diff between Supply PO and Actual PO Consumption", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { field: "LabourPOActualcost", headerName: "Labour PO", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { field: "mktg_allowed_site_expe", headerName: "Marketing Allowed Site Expenses", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { field: "actual_site_expe", headerName: "Actual Site Expenses", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { field: "Diff_Between_Mktg_Allowed_and_Actual_site_Exp", headerName: "Diff between Marketing Allowed and Actual Site Expenses", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { field: "Diff_Between_Labor_PO_and_Actual_site_expenses", headerName: "Diff between Labour PO and Actual Site Expenses", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { field: "totalPo", headerName: "Total PO", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { field: "Total_Mktg_Allowed", headerName: "Total Marketing Allowed (Mtrl + Site + Transport)", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { field: "Total_Expense", headerName: "Total Expenses (Act Mtrl + cons + Site + Transport)", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
    { field: "Diff_between_tot_mktg_allowed_and_total_expense", headerName: "Diff betw Total Marketing Allowed and Total as Actual Expe", width: isMobile ? 200 : 280, valueFormatter: numberFormatter },
  ];

  // ─── defaultColDef ────────────────────────────────────────────────────────
  const defaultColDef = useMemo(() => ({
    filter: true, sortable: true, floatingFilter: !isMobile,
    resizable: true, suppressMenu: isMobile,
    cellStyle: (params) => {
      const numericFields = [
        "material_po","m_po","mktg_material_cost","desgin_bom","electrical_bom",
        "mktg_trasport_cost","kg_mktg","kg","transport_actual_cost","kg_design_value",
        "kg_design","Diff_Between_Supply_PO_and_Actual_material_consumption",
        "LabourPOActualcost","mktg_allowed_site_expe","actual_site_expe","mktg_labour_cost",
        "Diff_Between_Mktg_Allowed_and_Actual_site_Exp","Diff_Between_Labor_PO_and_Actual_site_expenses",
        "totalPo","Total_Mktg_Allowed","Total_Expense","labourcostsusham",
        "championlabourcostsmetal","championlabourcostfabfound","assemblylabour",
        "othervendorlabour","seconddclabour","gettotallcost","Diff_Between_Mktg_and_At_Actual",
        "function_call","Diff_between_tot_mktg_allowed_and_total_expense","wages",
        "person_to_display","person","kg_person_to_display","kg_person",
        "working_days_to_display","working_days","total_kg_person_to_display","total_kg_person",
        "totalManDays_to_display","totalManDays","travellingDays_to_display","travellingDays",
        "actualDays_to_display","actualDays","covid_to_display","covid",
        "project_cost_to_display","cost","FactorA_to_display","FactorA",
        "FactorB_to_display","FactorB","actual_material_consumption",
        "actual_ppc_labour_cost","poamt","TOppccost",
      ];
      return numericFields.includes(params.colDef.field)
        ? { textAlign: "right" }
        : { textAlign: "left" };
    },
  }), [isMobile]);

  // ─── Effects ──────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchFinancialYears();
    fetchCities();
    fetchTypes();
  }, []);

  useEffect(() => {
    setColumnDefs(generateColumnDefs());
  }, [cityOptions, typeOptions, isMobile]);

  useEffect(() => {
    if (selectedFinancialYearTab1) fetchDataTab1(selectedFinancialYearTab1);
  }, [selectedFinancialYearTab1]);

  useEffect(() => {
    if (selectedFinancialYearTab2) fetchDataTab2(selectedFinancialYearTab2);
  }, [selectedFinancialYearTab2]);

  useEffect(() => {
    if (selectedFinancialYearTab3) fetchDataTab3(selectedFinancialYearTab3);
  }, [selectedFinancialYearTab3]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const onSelectionChanged = (event) => {
    const selectedNodes = event.api.getSelectedNodes();
    const selectedData = selectedNodes.map((node) => node.data);
    setSelectedRows(selectedData);
    if (selectedData.length === 1) {
      const selectedRecord = selectedData[0];
      if (activeTab === tabs[2]) {
        if (!selectedRecord.split_FILEID) { showToast("File ID not found in selected record", "error"); return; }
        const detailsUrl = `/#/new_analysis/project_analysis/details/${selectedRecord.split_FILEID}`;
        window.open(detailsUrl, "_blank");
      }
    }
  };

  const handleFinancialYearChange = (e) => {
    if (activeTab === tabs[0]) setSelectedFinancialYearTab1(e.target.value);
    if (activeTab === tabs[1]) setSelectedFinancialYearTab2(e.target.value);
    if (activeTab === tabs[2]) setSelectedFinancialYearTab3(e.target.value);
  };

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));
  const toggleFullScreen = () => setIsFullScreen(!isFullScreen);

  const downloadExcel = () => {
    const api = activeTab === tabs[0] ? gridRefTab1.current : activeTab === tabs[1] ? gridRefTab2.current : gridRefTab3.current;
    if (!api) return;
    try {
      api.exportDataAsCsv({
        fileName: `ProjectAnalysis_${activeTab}_${new Date().toISOString().split("T")[0]}.csv`,
        allColumns: true, onlySelected: false,
      });
      showToast("Data exported successfully!", "success");
    } catch (error) {
      console.error("Error exporting data:", error);
      showToast("Error exporting data", "error");
    }
  };

  const autoSizeAll = () => {
    const api = activeTab === tabs[0] ? gridRefTab1.current : activeTab === tabs[1] ? gridRefTab2.current : gridRefTab3.current;
    if (!api) return;
    setTimeout(() => {
      const allColumnIds = api.getColumns()?.map((col) => col.getId()) || [];
      if (allColumnIds.length > 0) api.autoSizeColumns(allColumnIds, false);
    }, 100);
  };

  const handleRefresh = () => {
    if (activeTab === tabs[0]) fetchDataTab1(selectedFinancialYearTab1);
    if (activeTab === tabs[1]) fetchDataTab2(selectedFinancialYearTab2);
    if (activeTab === tabs[2]) fetchDataTab3(selectedFinancialYearTab3);
    showToast("Refreshing data...", "info");
  };

  // ─── Theme ────────────────────────────────────────────────────────────────
  const getThemeStyles = () =>
    theme === "dark"
      ? { backgroundColor: "linear-gradient(135deg, #21262d 0%, #161b22 100%)", color: "#f8f9fa", cardBg: "#343a40", cardHeader: "linear-gradient(135deg, #495057 0%, #343a40 100%)" }
      : { backgroundColor: "linear-gradient(135deg, #f8f9ff 0%, #e6f3ff 100%)", color: "#212529", cardBg: "#ffffff", cardHeader: "linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%)" };

  const themeStyles = getThemeStyles();
  const gridHeight = isFullScreen ? "calc(100vh - 240px)" : isMobile ? "400px" : "600px";

  const darkGridStyle = {
    "--ag-background-color": "#212529", "--ag-header-background-color": "#343a40",
    "--ag-odd-row-background-color": "#2c3034", "--ag-even-row-background-color": "#212529",
    "--ag-row-hover-color": "#495057", "--ag-foreground-color": "#f8f9fa",
    "--ag-header-foreground-color": "#f8f9fa", "--ag-border-color": "#495057",
    "--ag-selected-row-background-color": "#28a745", "--ag-input-background-color": "#343a40",
    "--ag-input-border-color": "#495057",
  };

  useEffect(() => {
    document.body.style.background = themeStyles.backgroundColor;
    document.body.style.color = themeStyles.color;
    document.body.style.minHeight = "100vh";
    return () => {
      document.body.style.background = "";
      document.body.style.color = "";
      document.body.style.minHeight = "";
    };
  }, [theme]);

  // ─── Empty state per tab ──────────────────────────────────────────────────
  const EmptyState = () => (
    <div style={{ textAlign: "center", padding: "50px", color: themeStyles.color }}>
      <i className="bi bi-bar-chart" style={{ fontSize: "3rem", marginBottom: "20px", display: "block" }}></i>
      <h5>No data available for this financial year</h5>
      <p>Please select a different financial year or check your API connection.</p>
      <Button variant="success" size="sm" onClick={handleRefresh}>
        <i className="bi bi-arrow-clockwise"></i> Refresh
      </Button>
    </div>
  );

  // ─── Initial full-page loading ────────────────────────────────────────────
  if (initialLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: themeStyles.backgroundColor }}>
        <div style={{ textAlign: "center", color: themeStyles.color }}>
          <div className="spinner-border" role="status" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading projects...</p>
        </div>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: themeStyles.backgroundColor, color: themeStyles.color, padding: 0, margin: 0 }}>
      <Container fluid={isFullScreen}>
        <Card style={{ backgroundColor: themeStyles.cardBg, color: themeStyles.color, border: theme === "dark" ? "1px solid #495057" : "1px solid #dee2e6", margin: isFullScreen ? 0 : 20, borderRadius: isFullScreen ? 0 : 8 }}>

          {/* ── Header ── */}
          <Card.Header style={{ background: themeStyles.cardHeader, color: theme === "dark" ? "#ffffff" : "#000000", fontFamily: "'Maven Pro', sans-serif", padding: "1rem 2rem" }}>
            <Row className="align-items-center">
              <Col xs={12} lg={6} className="mb-2 mb-lg-0">
                <h4 className="mb-0">Project Analysis</h4>
                <small style={{ opacity: 0.8 }}>{selectedRows.length > 0 && ` | ${selectedRows.length} selected`}</small>
              </Col>
              <Col xs={12} lg={6}>
                <div className="d-flex justify-content-end gap-2 flex-wrap align-items-center">
                  <Form.Select
                    value={activeTab === tabs[0] ? selectedFinancialYearTab1 : activeTab === tabs[1] ? selectedFinancialYearTab2 : selectedFinancialYearTab3}
                    onChange={handleFinancialYearChange}
                    style={{ width: "auto", minWidth: "120px" }} size="sm"
                  >
                    {financialYears.map((option) => (
                      <option key={option.FINANCIAL_YEAR || option.financial_year} value={option.FINANCIAL_YEAR || option.financial_year}>
                        FY {option.FINANCIAL_YEAR || option.financial_year}
                      </option>
                    ))}
                  </Form.Select>
                  <ButtonGroup size="sm">
                    <Button variant="success" onClick={handleRefresh}><i className="bi bi-arrow-clockwise"></i>{!isMobile && " Refresh"}</Button>
                  </ButtonGroup>
                  <ButtonGroup size="sm">
                    <Button variant="success" onClick={downloadExcel}><i className="bi bi-file-earmark-excel"></i>{!isMobile && " Export CSV"}</Button>
                    <Button variant="info" onClick={autoSizeAll}><i className="bi bi-arrows-angle-expand"></i>{!isMobile && " Auto Size"}</Button>
                  </ButtonGroup>
                  <ButtonGroup size="sm">
                    <Button variant="outline-light" onClick={toggleFullScreen}>
                      <i className={`bi ${isFullScreen ? "bi-fullscreen-exit" : "bi-fullscreen"}`}></i>
                      {!isMobile && (isFullScreen ? " Exit" : " Full")}
                    </Button>
                    <Button variant="outline-light" onClick={toggleTheme}>
                      {theme === "light" ? "🌙" : "☀️"}{!isMobile && (theme === "light" ? " Dark" : " Light")}
                    </Button>
                  </ButtonGroup>
                </div>
              </Col>
            </Row>
          </Card.Header>

          {/* ── Body ── */}
          <Card.Body style={{ backgroundColor: themeStyles.cardBg, padding: isFullScreen ? 0 : 15 }}>
            <Tabs id="project-analysis-tabs" activeKey={activeTab} onSelect={(tab) => setActiveTab(tab)} className="mb-3">

              {/* Tab 1 */}
              <Tab eventKey={tabs[0]} title={tabs[0]}>
                {loading ? (
                  <div style={{ textAlign: "center", padding: "50px" }}>
                    <div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div>
                  </div>
                ) : rowDataTab1.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="ag-theme-alpine" style={{ height: gridHeight, width: "100%", ...(theme === "dark" && darkGridStyle) }}>
                    <AgGridReact
                      rowData={rowDataTab1}
                      columnDefs={columnDefs}
                      defaultColDef={defaultColDef}
                      getRowId={(params) => params.data.FILE_NAME}
                      pagination paginationPageSize={isMobile ? 10 : 20}
                      rowSelection="single"
                      onCellValueChanged={(params) => { if (params.oldValue !== params.newValue) params.node.setData({ ...params.data, isDirty: true }); }}
                      suppressMovableColumns={isMobile}
                      enableRangeSelection={!isMobile}
                      rowMultiSelectWithClick animateRows={!isMobile}
                      enableCellTextSelection suppressHorizontalScroll={false}
                      headerHeight={isMobile ? 40 : 48} rowHeight={isMobile ? 35 : 42}
                      onGridReady={(p) => { gridRefTab1.current = p.api; setTimeout(autoSizeAll, 500); }}
                    />
                  </div>
                )}
              </Tab>

              {/* Tab 2 */}
              <Tab eventKey={tabs[1]} title={tabs[1]}>
                {loading ? (
                  <div style={{ textAlign: "center", padding: "50px" }}>
                    <div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div>
                  </div>
                ) : rowDataTab2.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="ag-theme-alpine" style={{ height: gridHeight, width: "100%", ...(theme === "dark" && darkGridStyle) }}>
                    <AgGridReact
                      rowData={rowDataTab2}
                      columnDefs={rightColDef}
                      defaultColDef={defaultColDef}
                      pagination paginationPageSize={isMobile ? 10 : 20}
                      rowSelection="single"
                      suppressMovableColumns={isMobile}
                      enableRangeSelection={!isMobile}
                      rowMultiSelectWithClick animateRows={!isMobile}
                      enableCellTextSelection suppressHorizontalScroll={false}
                      headerHeight={isMobile ? 40 : 48} rowHeight={isMobile ? 35 : 42}
                      onGridReady={(p) => { gridRefTab2.current = p.api; setTimeout(autoSizeAll, 500); }}
                    />
                  </div>
                )}
              </Tab>

              {/* Tab 3 */}
              <Tab eventKey={tabs[2]} title={tabs[2]}>
                {loading ? (
                  <div style={{ textAlign: "center", padding: "50px" }}>
                    <div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div>
                  </div>
                ) : rowDataTab3.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="ag-theme-alpine" style={{ height: gridHeight, width: "100%", ...(theme === "dark" && darkGridStyle) }}>
                    <AgGridReact
                      rowData={rowDataTab3}
                      columnDefs={generateColumnDefsTab3}
                      defaultColDef={defaultColDef}
                      getRowId={(params) => params.data.FILE_NAME}
                      onSelectionChanged={onSelectionChanged}
                      pagination paginationPageSize={isMobile ? 10 : 20}
                      rowSelection="single"
                      onCellValueChanged={(params) => { if (params.oldValue !== params.newValue) params.node.setData({ ...params.data, isDirty: true }); }}
                      suppressMovableColumns={isMobile}
                      enableRangeSelection={!isMobile}
                      rowMultiSelectWithClick animateRows={!isMobile}
                      enableCellTextSelection suppressHorizontalScroll={false}
                      headerHeight={isMobile ? 40 : 48} rowHeight={isMobile ? 35 : 42}
                      onGridReady={(p) => { gridRefTab3.current = p.api; setTimeout(autoSizeAll, 500); }}
                    />
                  </div>
                )}
              </Tab>

            </Tabs>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default NewAnalysisProjectAnalysis;