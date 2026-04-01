import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { ModuleRegistry } from "ag-grid-community";
import Select from "react-select";
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

/* ─── API endpoints ─── */
const LIST_API    = "http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/allowanceMasterListApi.php";
const SAVE_API    = "http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/saveAllowanceMasterDataApi.php";
const CITIES_API  = "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/getAllowanceCitiesApi.php";
const UPLOAD_API  = "http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/uploadAllowanceApi.php";

/* ─── Inline styles ─── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.am-root {
  font-family: 'DM Sans', sans-serif;
  background: #f5f6fa;
  min-height: 100vh;
  color: #222;
}

/* ── Upload bar ── */
.am-upload-bar {
  background: #fff;
  border-bottom: 1px solid #e2e2e2;
  padding: 10px 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: .85rem;
  font-weight: 600;
  color: #333;
  flex-wrap: wrap;
}
.am-upload-bar label { display:flex; align-items:center; gap:8px; }
.am-upload-bar input[type=file] { display:none; }
.am-file-btn {
  border: 1px solid #aaa;
  background: #f0f0f0;
  border-radius: 3px;
  padding: 3px 10px;
  font-size:.82rem;
  cursor: pointer;
  font-family: inherit;
}
.am-file-name { color: #c00; font-size:.82rem; }
.am-btn-orange {
  background: #e8560a;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 6px 22px;
  font-size: .85rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: background .15s;
}
.am-btn-orange:hover { background: #c94508; }
.am-btn-orange:disabled { background: #e0a070; cursor:not-allowed; }

/* ── Form section ── */
.am-form-wrap {
  background: #fff;
  border: 1px solid #e2e2e2;
  padding: 18px 20px 12px;
}
.am-form-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px 20px;
  margin-bottom: 14px;
}
.am-form-grid-2 {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px 20px;
  margin-bottom: 14px;
}
.am-field { display: flex; flex-direction: column; gap: 3px; }
.am-field label { font-size: .78rem; color: #555; font-weight: 500; }
.am-field input, .am-field select {
  border: none;
  border-bottom: 1.5px solid #e8560a;
  background: transparent;
  padding: 4px 2px;
  font-size: .88rem;
  color: #222;
  outline: none;
  font-family: inherit;
  width: 100%;
}
.am-field input::placeholder { color: #aaa; font-size:.82rem; }
.am-field input:focus { border-bottom-color: #c94508; }

/* react-select overrides */
.am-select-wrap .react-select__control {
  border: none !important;
  border-bottom: 1.5px solid #e8560a !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  background: transparent !important;
  min-height: 28px !important;
  font-family: 'DM Sans', sans-serif;
  font-size: .88rem;
}
.am-select-wrap .react-select__control:hover {
  border-bottom-color: #c94508 !important;
}
.am-select-wrap .react-select__control--is-focused {
  border-bottom-color: #c94508 !important;
}
.am-select-wrap .react-select__value-container { padding: 0 2px !important; }
.am-select-wrap .react-select__indicator-separator { display:none !important; }
.am-select-wrap .react-select__dropdown-indicator { padding: 2px !important; color: #e8560a !important; }
.am-select-wrap .react-select__menu { font-size: .85rem; font-family: 'DM Sans', sans-serif; z-index: 9999; }
.am-select-wrap .react-select__option--is-selected { background: #e8560a !important; }
.am-select-wrap .react-select__option--is-focused { background: #fff3ee !important; color: #222 !important; }
.am-select-wrap .react-select__placeholder { color: #aaa; font-size: .82rem; }
.am-select-wrap .react-select__single-value { color: #222; }

/* ── Toolbar ── */
.am-toolbar {
  background: #fff;
  border-top: 1px solid #e2e2e2;
  border-bottom: 2px solid #e2e2e2;
  padding: 8px 18px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.am-tool-btn {
  background: #e8560a;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 5px 14px;
  font-size: .8rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: background .15s;
  white-space: nowrap;
}
.am-tool-btn:hover { background: #c94508; }
.am-tool-btn.outline {
  background: transparent;
  border: 1.5px solid #e8560a;
  color: #e8560a;
}
.am-tool-btn.outline:hover { background: #fff3ee; }
.am-toolbar-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: .82rem;
  color: #555;
}
.am-page-size-select {
  border: 1px solid #ccc;
  border-radius: 3px;
  padding: 3px 6px;
  font-size: .82rem;
  font-family: inherit;
  cursor: pointer;
}

/* ── Grid ── */
.am-grid-wrap {
  width: 100%;
  height: calc(100vh - 360px);
  min-height: 400px;
}
.ag-theme-alpine .ag-header { background: #fff !important; border-bottom: 1.5px solid #d0d0d0 !important; }
.ag-theme-alpine .ag-header-cell { font-size: .8rem !important; font-weight: 700 !important; color: #333 !important; font-family: 'DM Sans', sans-serif !important; }
.ag-theme-alpine .ag-cell { font-size: .83rem !important; font-family: 'DM Sans', sans-serif !important; color: #222 !important; border-right: 1px solid #e8e8e8 !important; }
.ag-theme-alpine .ag-row-even { background: #fff !important; }
.ag-theme-alpine .ag-row-odd  { background: #fafafa !important; }
.ag-theme-alpine .ag-row:hover { background: #fff3ee !important; }
.ag-theme-alpine .ag-row-selected { background: #fde8dc !important; }
.ag-theme-alpine .ag-floating-filter-input { border: 1px solid #ccc !important; border-radius: 3px !important; font-size: .78rem !important; padding: 2px 6px !important; }
.ag-theme-alpine .ag-paging-panel { font-size: .8rem !important; font-family: 'DM Sans', sans-serif !important; border-top: 1.5px solid #e2e2e2 !important; }
.ag-theme-alpine .ag-icon { color: #e8560a !important; }

/* ── Toast ── */
.am-toast {
  position: fixed; top: 18px; right: 18px; z-index: 99999;
  background: #222; color: #fff;
  padding: 11px 22px; border-radius: 6px;
  font-family: 'DM Sans',sans-serif; font-size: .88rem; font-weight:500;
  box-shadow: 0 6px 20px rgba(0,0,0,.2);
  animation: amSlideIn .25s ease;
}
.am-toast.success { background: #16a34a; }
.am-toast.error   { background: #dc2626; }
@keyframes amSlideIn { from{transform:translateX(80px);opacity:0} to{transform:translateX(0);opacity:1} }

/* ── Loading ── */
.am-loading {
  min-height: 300px; display:flex; align-items:center; justify-content:center;
  flex-direction:column; gap:14px; font-size:.92rem; color:#888;
}
.am-spinner {
  width:36px; height:36px; border:3px solid #eee; border-top-color:#e8560a;
  border-radius:50%; animation:spin 1s linear infinite;
}
@keyframes spin { to{transform:rotate(360deg)} }

@media (max-width: 900px) {
  .am-form-grid, .am-form-grid-2 { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 540px) {
  .am-form-grid, .am-form-grid-2 { grid-template-columns: 1fr; }
}
`;

function showToast(msg, type = "info") {
  const el = document.createElement("div");
  el.className = `am-toast ${type}`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

const EMPTY_FORM = {
  id: "",
  city: null,          // react-select uses null for empty
  area_rate: "",
  travel_2way: "",
  local_2way: "",
  loading: "",
  site: "",
  labour_charge: "",
  allowance: "",
  incharge: "",
  days: "",
  totalKgPerson: "",
};

export default function AllowanceMaster() {
  const gridRef = useRef();
  const fileRef = useRef();

  const [rowData,    setRowData]    = useState([]);
  const [cities,     setCities]     = useState([]);   // from getAllowanceCitiesApi
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [uploading,  setUploading]  = useState(false);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [pageSize,   setPageSize]   = useState(10);
  const [uploadFile, setUploadFile] = useState(null);

  /* inject CSS once */
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  /* fetch cities from dedicated API */
  const fetchCities = useCallback(async () => {
    try {
      const res  = await fetch(CITIES_API);
      const json = await res.json();
      if (json.status === "success" && Array.isArray(json.cities)) {
        setCities(json.cities.map(c => ({ value: c, label: c })));
      }
    } catch (e) {
      showToast(`Cities load error: ${e.message}`, "error");
    }
  }, []);

  /* fetch grid data */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(LIST_API);
      const json = await res.json();
      if (json.status === "success" && json.data) {
        setRowData(json.data);
      } else {
        showToast("Failed to load data", "error");
      }
    } catch (e) {
      showToast(`Error: ${e.message}`, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCities();
    fetchData();
  }, [fetchCities, fetchData]);

  /* form field helper for plain inputs */
  const setF = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  /* when city selected via react-select, fill form from rowData if exists */
  const handleCityChange = (selected) => {
    const loc = selected ? selected.value : null;
    const found = rowData.find(r => r.location === loc);
    if (found) {
      setForm({
        id:             found.id || "",
        city:           selected,
        area_rate:      (found.areawise_rate || "").trim(),
        travel_2way:    (found.areawise_travelling_twoway || "").trim(),
        local_2way:     (found.local_twoway || "").trim(),
        loading:        (found.lodging_perhead || "").trim(),
        site:           (found.site_local_travelling || "").trim(),
        labour_charge:  (found.labour_charge || "").trim(),
        allowance:      (found.food_allowance || "").trim(),
        incharge:       (found.incen_site_incharge || "").trim(),
        days:           (found.travelling_days || "").trim(),
        totalKgPerson:  (found.totalKgPerson || ""),
      });
    } else {
      setForm({ ...EMPTY_FORM, city: selected });
    }
  };

  /* save */
  const handleSave = async () => {
    if (!form.city) { showToast("Please select a location", "error"); return; }
    setSaving(true);
    try {
      const body = new FormData();
      body.append("id",            form.id);
      body.append("city",          form.city.value);
      body.append("area_rate",     form.area_rate);
      body.append("travel_2way",   form.travel_2way);
      body.append("local_2way",    form.local_2way);
      body.append("loading",       form.loading);
      body.append("site_local",    form.site);        // ✅ FIXED: was "site"
      body.append("labour_charge", form.labour_charge);
      body.append("allowance",     form.allowance);
      body.append("incharge",      form.incharge);
      body.append("days",          form.days);
      body.append("totalKgPerson", form.totalKgPerson);
  
      const res  = await fetch(SAVE_API, { method: "POST", body });
      const json = await res.json();
      if (json.status === "success") {
        showToast(json.message || "Saved successfully!", "success");
        setForm(EMPTY_FORM);
        fetchData();
      } else {
        showToast(json.message || "Save failed", "error");
      }
    } catch (e) {
      showToast(`Error: ${e.message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  /* file upload */
  const handleUpload = async () => {
    if (!uploadFile) { showToast("Please choose a file first", "error"); return; }
    setUploading(true);
    try {
      const body = new FormData();
      body.append("filename[]", uploadFile);   // PHP reads $_FILES['filename']
      const res  = await fetch(UPLOAD_API, { method: "POST", body });
      const json = await res.json();
      if (json.status === "success") {
        showToast(json.message || `Uploaded! Rows inserted: ${json.rows_inserted}`, "success");
        setUploadFile(null);
        if (fileRef.current) fileRef.current.value = "";
        fetchData();
      } else {
        showToast(json.message || "Upload failed", "error");
      }
    } catch (e) {
      showToast(`Upload error: ${e.message}`, "error");
    } finally {
      setUploading(false);
    }
  };

  /* grid row click → fill form (read-only view; city must come from cities list) */
  const onRowClicked = (e) => {
    const r = e.data;
    const cityOpt = { value: r.location, label: r.location };
    setForm({
      id:             r.id || "",
      city:           cityOpt,
      area_rate:      (r.areawise_rate || "").trim(),
      travel_2way:    (r.areawise_travelling_twoway || "").trim(),
      local_2way:     (r.local_twoway || "").trim(),
      loading:        (r.lodging_perhead || "").trim(),
      site:           (r.site_local_travelling || "").trim(),
      labour_charge:  (r.labour_charge || "").trim(),
      allowance:      (r.food_allowance || "").trim(),
      incharge:       (r.incen_site_incharge || "").trim(),
      days:           (r.travelling_days || "").trim(),
      totalKgPerson:  (r.totalKgPerson || ""),
    });
  };

  /* toolbar actions */
  const handleExport  = () => { gridRef.current?.api?.exportDataAsCsv({ fileName: "AllowanceMaster.csv" }); showToast("Exported to CSV", "success"); };
  const handleAutoSize = () => { const ids = gridRef.current?.api?.getColumns()?.map(c => c.getId()) || []; gridRef.current?.api?.autoSizeColumns(ids, false); };
  const handleSizeToFit = () => gridRef.current?.api?.sizeColumnsToFit();
  const handlePageSizeChange = (e) => { const sz = Number(e.target.value); setPageSize(sz); gridRef.current?.api?.paginationSetPageSize(sz); };

  /* columns */
  const columnDefs = useMemo(() => [
    { headerName: "Sr No", field: "alloted_no", width: 75, pinned: "left", cellStyle: { fontWeight: "600", textAlign: "center", color: "#555" }, valueGetter: p => p.node ? p.node.rowIndex + 1 : "" },
    { headerName: "Location", field: "location", filter: "agTextColumnFilter", sortable: true, width: 160, pinned: "left", cellStyle: { fontWeight: "600" } },
    { headerName: "Areawise Rate", field: "areawise_rate", filter: "agNumberColumnFilter", sortable: true, width: 130, cellStyle: { textAlign: "right" }, valueFormatter: p => p.value ? Number(p.value).toLocaleString() : "" },
    { headerName: "Areawise Travelling (2 Way)", field: "areawise_travelling_twoway", filter: "agNumberColumnFilter", sortable: true, width: 190, cellStyle: { textAlign: "right" }, valueFormatter: p => p.value ? Number(p.value).toLocaleString() : "" },
    { headerName: "Local (2 Way)", field: "local_twoway", filter: "agNumberColumnFilter", sortable: true, width: 120, cellStyle: { textAlign: "right" }, valueFormatter: p => p.value ? Number(p.value).toLocaleString() : "" },
    { headerName: "Lodging (per head)", field: "lodging_perhead", filter: "agNumberColumnFilter", sortable: true, width: 150, cellStyle: { textAlign: "right" }, valueFormatter: p => p.value ? Number(p.value).toLocaleString() : "" },
    { headerName: "Site Local Travelling", field: "site_local_travelling", filter: "agNumberColumnFilter", sortable: true, width: 155, cellStyle: { textAlign: "right" }, valueFormatter: p => p.value ? Number(p.value).toLocaleString() : "" },
    { headerName: "Labour Charge", field: "labour_charge", filter: "agNumberColumnFilter", sortable: true, width: 140, cellStyle: { textAlign: "right" }, valueFormatter: p => p.value ? Number(p.value).toLocaleString() : "" },
    { headerName: "Food Allowance", field: "food_allowance", filter: "agNumberColumnFilter", sortable: true, width: 135, cellStyle: { textAlign: "right" }, valueFormatter: p => p.value ? Number(p.value).toLocaleString() : "" },
    { headerName: "Incen. for site Incharge", field: "incen_site_incharge", filter: "agNumberColumnFilter", sortable: true, width: 165, cellStyle: { textAlign: "right" }, valueFormatter: p => p.value ? Number(p.value).toLocaleString() : "" },
    { headerName: "Factor A", field: "factor_a", filter: "agNumberColumnFilter", sortable: true, width: 120, cellStyle: { textAlign: "right", fontWeight: "600" }, valueFormatter: p => p.value ? Number(p.value).toLocaleString() : "" },
    { headerName: "Factor B", field: "factor_b", filter: "agNumberColumnFilter", sortable: true, width: 120, cellStyle: { textAlign: "right", fontWeight: "600" }, valueFormatter: p => p.value ? Number(p.value).toLocaleString() : "" },
    { headerName: "Travelling Days", field: "travelling_days", filter: "agNumberColumnFilter", sortable: true, width: 130, cellStyle: { textAlign: "right" } },
  ], []);

  const defaultColDef = useMemo(() => ({
    resizable: true,
    sortable: true,
    filter: true,
    floatingFilter: true,
    cellStyle: { display: "flex", alignItems: "center" },
  }), []);

  /* react-select custom styles - keeps the underline look */
  const selectStyles = {
    control: (base) => ({ ...base }),
    menu: (base) => ({ ...base, zIndex: 9999 }),
  };

  return (
    <div className="am-root">

      {/* ── Upload Bar ── */}
      <div className="am-upload-bar">
        <span style={{ fontWeight: 700 }}>Upload File</span>
        <label>
          <span className="am-file-btn">Choose File</span>
          <input
            type="file"
            ref={fileRef}
            accept=".xls,.xlsx"
            onChange={e => setUploadFile(e.target.files[0] || null)}
          />
        </label>
        <span className="am-file-name">
          {uploadFile ? uploadFile.name : "No file chosen"}
        </span>
        <button
          className="am-btn-orange"
          onClick={handleUpload}
          disabled={uploading || !uploadFile}
        >
          {uploading ? "Uploading…" : "Submit"}
        </button>
      </div>

      {/* ── Form Section ── */}
      <div className="am-form-wrap">

        {/* Row 1 */}
        <div className="am-form-grid">
          {/* react-select searchable dropdown */}
          <div className="am-field am-select-wrap">
            <label>Select Location</label>
            <Select
              classNamePrefix="react-select"
              options={cities}
              value={form.city}
              onChange={handleCityChange}
              placeholder="Select Location..."
              isClearable
              isSearchable
              styles={selectStyles}
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
          </div>
          <div className="am-field">
            <label>Area Wise Rate</label>
            <input value={form.area_rate} onChange={setF("area_rate")} placeholder="0" type="number" />
          </div>
          <div className="am-field">
            <label>Area Wise Travelling (2 Way)</label>
            <input value={form.travel_2way} onChange={setF("travel_2way")} placeholder="0" type="number" />
          </div>
          <div className="am-field">
            <label>Local (2 Way)</label>
            <input value={form.local_2way} onChange={setF("local_2way")} placeholder="0" type="number" />
          </div>
          <div className="am-field">
            <label>Lodging (Per Head)</label>
            <input value={form.loading} onChange={setF("loading")} placeholder="0" type="number" />
          </div>
        </div>

        {/* Row 2 */}
        <div className="am-form-grid-2">
          <div className="am-field">
            <label>Site Local Travelling</label>
            <input value={form.site} onChange={setF("site")} placeholder="0" type="number" />
          </div>
          <div className="am-field">
            <label>Labour Charge</label>
            <input value={form.labour_charge} onChange={setF("labour_charge")} placeholder="0" type="number" />
          </div>
          <div className="am-field">
            <label>Food Allowance</label>
            <input value={form.allowance} onChange={setF("allowance")} placeholder="0" type="number" />
          </div>
          <div className="am-field">
            <label>Incen. For Site Incharge</label>
            <input value={form.incharge} onChange={setF("incharge")} placeholder="0" type="number" />
          </div>
          <div className="am-field">
            <label>Travelling Days</label>
            <input value={form.days} onChange={setF("days")} placeholder="0" type="number" />
          </div>
          <div className="am-field" style={{ gridColumn: "1" }}>
            <label>Total KG Person</label>
            <input value={form.totalKgPerson} onChange={setF("totalKgPerson")} placeholder="0" type="number" />
          </div>
        </div>

        {/* Submit */}
        <div style={{ paddingTop: 4, display: "flex", alignItems: "center", gap: 12 }}>
          <button className="am-btn-orange" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Submit"}
          </button>
          {form.id && (
            <span style={{ fontSize: ".8rem", color: "#e8560a", fontWeight: 600 }}>
              Editing ID: {form.id}
            </span>
          )}
          {form.city && (
            <button
              className="am-btn-orange"
              style={{ background: "transparent", border: "1.5px solid #e8560a", color: "#e8560a" }}
              onClick={() => setForm(EMPTY_FORM)}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="am-toolbar">
        <button className="am-tool-btn" onClick={handleExport}>Download Excel Export</button>
        <button className="am-tool-btn outline" onClick={() => gridRef.current?.api?.clearFocusedCell()}>Clear Pinned</button>
        <button className="am-tool-btn outline" onClick={() => {}}>Pinned</button>
        <button className="am-tool-btn outline" onClick={handleSizeToFit}>Size To Fit</button>
        <button className="am-tool-btn outline" onClick={handleAutoSize}>Auto-Size All</button>
        <button className="am-tool-btn outline" onClick={() => handleAutoSize()}>Auto-Size All (Skip Header)</button>
        <button className="am-tool-btn outline" onClick={fetchData}>↻ Refresh</button>

        <div className="am-toolbar-right">
          <label style={{ fontWeight: 600 }}>Page Size:</label>
          <select className="am-page-size-select" value={pageSize} onChange={handlePageSizeChange}>
            {[10, 20, 50, 100].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div className="am-loading">
          <div className="am-spinner" />
          Loading allowance master data…
        </div>
      ) : (
        <div className="ag-theme-alpine am-grid-wrap">
          <AgGridReact
            ref={gridRef}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            pagination={true}
            paginationPageSize={pageSize}
            rowSelection="single"
            onRowClicked={onRowClicked}
            animateRows={true}
            enableCellTextSelection={true}
            headerHeight={46}
            rowHeight={40}
            suppressMovableColumns={false}
            suppressHorizontalScroll={false}
            onGridReady={() => { setTimeout(handleAutoSize, 400); }}
          />
        </div>
      )}
    </div>
  );
}