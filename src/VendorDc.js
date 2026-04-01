import React, { useState, useEffect } from 'react';
import { X, Plus, Calendar, Save, Printer, RefreshCw, Maximize2, Minimize2, Moon, Sun, Download, Pin, Columns, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, ArrowLeft } from 'lucide-react';

// ─── THEME ───────────────────────────────────────────────────────────────────
const getTheme = (mode) =>
  mode === 'dark'
    ? { bg: '#0f1117', surface: '#1a1d27', surface2: '#22263a', border: '#2e3248', text: '#e2e8f0', textMuted: '#7c85a2', accent: '#38bdf8', accentHover: '#0ea5e9', success: '#34d399', danger: '#f87171', warning: '#fbbf24', tabActive: '#38bdf8', tabActiveBg: 'rgba(56,189,248,0.15)', inputBg: '#0f1117' }
    : { bg: '#f0f4ff', surface: '#ffffff', surface2: '#f8faff', border: '#e2e8f0', text: '#1e2235', textMuted: '#64748b', accent: '#f97316', accentHover: '#ea6c0a', success: '#10b981', danger: '#ef4444', warning: '#f59e0b', tabActive: '#f97316', tabActiveBg: 'rgba(249,115,22,0.08)', inputBg: '#ffffff' };

// ─── TOAST ────────────────────────────────────────────────────────────────────
const showToast = (message, type = 'info') => {
  const el = document.createElement('div');
  const colors = { error: '#ef4444', success: '#10b981', info: '#38bdf8', warning: '#f59e0b' };
  el.style.cssText = `position:fixed;top:20px;right:20px;padding:12px 20px;background:${colors[type]};color:#fff;border-radius:8px;z-index:99999;font-size:13px;font-weight:500;font-family:'DM Sans',sans-serif;box-shadow:0 8px 24px rgba(0,0,0,0.15);animation:toastIn 0.3s ease;max-width:320px;`;
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => { el.style.animation = 'toastOut 0.3s ease forwards'; setTimeout(() => el.remove(), 300); }, 3000);
};

// ─── INJECT GLOBAL STYLES ─────────────────────────────────────────────────────
const injectStyles = () => {
  if (document.getElementById('mas-styles')) return;
  const s = document.createElement('style');
  s.id = 'mas-styles';
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');
    @keyframes toastIn  { from{transform:translateX(100%);opacity:0} to{transform:translateX(0);opacity:1} }
    @keyframes toastOut { from{transform:translateX(0);opacity:1}   to{transform:translateX(100%);opacity:0} }
    @keyframes spin     { to{transform:rotate(360deg)} }
    @keyframes fadeIn   { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
    @keyframes slideIn  { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
    @keyframes shimmer  { 0%{background-position:-200px 0} 100%{background-position:calc(200px + 100%) 0} }
    .mas-root * { box-sizing:border-box; margin:0; padding:0; }
    .mas-root   { font-family:'DM Sans',sans-serif; }
    .mas-tab-btn { transition:all 0.2s ease; position:relative; outline:none; }
    .mas-tab-btn::after { content:''; position:absolute; bottom:0; left:0; right:0; height:3px; border-radius:3px 3px 0 0; background:transparent; transition:all 0.2s ease; }
    .mas-tab-btn.active::after { background:currentColor; }
    .mas-top-btn { transition:all 0.15s ease; }
    .mas-top-btn:hover { filter:brightness(1.08); transform:translateY(-1px); }
    .mas-top-btn:active { transform:translateY(0); }
    .mas-row { animation:fadeIn 0.2s ease both; }
    .mas-row:hover td { filter:brightness(0.97); }
    .mas-save-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 4px 12px rgba(0,0,0,0.2)!important; }
    .mas-save-btn:active:not(:disabled) { transform:translateY(0); }
    .mas-input:focus  { outline:2px solid #38bdf8; outline-offset:1px; }
    .mas-select:focus { outline:2px solid #38bdf8; outline-offset:1px; }
    .mas-shimmer { background:linear-gradient(90deg,#e2e8f0 25%,#f8faff 50%,#e2e8f0 75%);background-size:200px 100%;animation:shimmer 1.2s infinite;border-radius:4px; }
    .mas-page-btn:hover:not(:disabled) { background:rgba(56,189,248,0.12)!important; }
    .mas-page-btn:disabled { opacity:0.35; cursor:not-allowed; }
    .challan-print-wrap { animation:slideIn 0.3s ease; }
    /* ── CHALLAN PRINT PAGE STYLES ── */
    .cp-page { background:#e8e8e8; min-height:100vh; padding:16px; display:flex; flex-direction:column; align-items:center; gap:12px; font-family:Arial,Helvetica,sans-serif; font-size:12px; color:#000; }
    .cp-toolbar { width:100%; max-width:1100px; display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
    .cp-btn { padding:7px 18px; border:none; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:5px; font-family:Arial,sans-serif; transition:filter 0.15s; }
    .cp-btn:hover { filter:brightness(0.92); }
    .cp-card { background:#fff; width:100%; max-width:1100px; border:1px solid #ccc; padding:18px 22px 28px; box-shadow:0 2px 12px rgba(0,0,0,0.12); }
    .cp-section-title { font-size:11.5px; font-weight:600; color:#333; border-bottom:1px solid #bbb; padding-bottom:3px; margin-bottom:10px; }
    .cp-top-strip { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px; }
    .cp-copy-colors { font-size:11px; color:#555; line-height:1.8; }
    .cp-company-center { text-align:center; flex:1; padding:0 20px; }
    .cp-dc-heading { font-size:14px; font-weight:700; letter-spacing:0.3px; margin-bottom:5px; }
    .cp-company-name { font-size:13.5px; font-weight:700; margin-bottom:3px; }
    .cp-company-addr { font-size:11px; color:#333; }
    .cp-dc-table { border-collapse:collapse; font-size:12px; min-width:260px; }
    .cp-dc-table td { border:1px solid #999; padding:5px 8px; white-space:nowrap; }
    .cp-dc-table td:first-child { font-weight:600; background:#f5f5f5; }
    .cp-dc-table td:last-child { font-weight:700; }
    .cp-dc-no { font-size:15px!important; font-weight:700!important; color:#000; }
    .cp-date-inp { border:1px solid #aaa; padding:2px 5px; font-size:12px; font-family:Arial,sans-serif; width:130px; }
    .cp-file-to-row { display:flex; gap:0; align-items:flex-start; margin-bottom:12px; border-bottom:1px solid #ddd; padding-bottom:10px; }
    .cp-file-col { min-width:200px; font-size:12px; }
    .cp-file-label { font-weight:700; font-size:12.5px; }
    .cp-to-col { flex:1; font-size:12px; }
    .cp-to-label { font-weight:700; font-size:12.5px; }
    .cp-receive-text { margin-left:65px; margin-top:4px; font-size:11.5px; color:#222; }
    .cp-items-table { width:100%; border-collapse:collapse; border:2px solid #cdcdcd; margin-bottom:0; font-size:11.5px; }
    .cp-items-table th,.cp-items-table td { border:1px solid #cdcdcd; padding:6px 7px; text-align:center; vertical-align:middle; }
    .cp-items-table thead tr { background:rgba(158,158,158,0.19); }
    .cp-items-table thead th { font-weight:700; font-size:11.5px; }
    .cp-items-table .mat-name { text-align:left; }
    .cp-items-table .num { text-align:right; }
    .cp-items-table .total-row td { font-weight:700; background:rgba(158,158,158,0.1); }
    .cp-totals-strip { display:flex; justify-content:space-between; align-items:center; padding:10px 0 8px; border-bottom:1px solid #ccc; margin-bottom:6px; }
    .cp-total-box { display:flex; align-items:center; gap:6px; }
    .cp-t-label { font-weight:700; font-size:12px; white-space:nowrap; }
    .cp-t-value { font-weight:700; font-size:15px; border-bottom:2px solid #000; padding:2px 50px 2px 8px; min-width:140px; text-align:left; }
    .cp-notice-center { text-align:center; font-weight:700; font-size:13px; margin:8px 0 4px; letter-spacing:0.2px; }
    .cp-finished-goods { font-size:11.5px; margin-bottom:12px; }
    .cp-section-hdr { text-align:center; font-weight:700; font-size:13px; margin:14px 0 10px; letter-spacing:0.2px; text-decoration:underline; }
    .cp-field-row { display:flex; align-items:flex-start; gap:8px; margin-bottom:12px; font-size:12px; }
    .cp-field-num { min-width:16px; font-weight:600; }
    .cp-field-label { flex:2; }
    .cp-field-input { flex:1; border:none; border-bottom:1px solid #999; padding:2px 4px; font-family:Arial,sans-serif; font-size:12px; background:transparent; outline:none; min-width:200px; }
    .cp-certified { text-align:center; font-size:12px; margin:18px 0 24px; }
    .cp-sig-row { display:flex; justify-content:flex-end; margin-bottom:12px; font-size:12px; }
    .cp-sig-label { font-size:11.5px; color:#333; }
    .cp-bottom-grid { display:flex; flex-direction:column; gap:10px; font-size:12px; margin-top:6px; }
    .cp-bottom-row { display:flex; align-items:center; gap:12px; }
    .cp-b-label { min-width:60px; font-weight:600; }
    .cp-b-input { flex:1; border:none; border-bottom:1px solid #777; padding:2px 4px; font-family:Arial,sans-serif; font-size:12px; background:transparent; outline:none; }
    .cp-submit-row { text-align:center; margin-top:16px; }
    .cp-submit-btn { background:#ff630d; color:#fff; border:none; padding:8px 36px; font-size:13px; font-weight:700; border-radius:4px; cursor:pointer; font-family:Arial,sans-serif; transition:background 0.15s; }
    .cp-submit-btn:hover { background:#e0550a; }
    .cp-loader-wrap { display:flex; align-items:center; justify-content:center; min-height:300px; flex-direction:column; gap:14px; background:#fff; width:100%; max-width:1100px; border:1px solid #ccc; padding:40px; }
    .cp-spinner { width:36px; height:36px; border:3px solid #e0e0e0; border-top-color:#ff630d; border-radius:50%; animation:spin 0.8s linear infinite; }
    .cp-textarea { width:100%; min-height:55px; border:1px solid #ccc; border-radius:6px; padding:6px 8px; font-family:Arial,sans-serif; font-size:12px; resize:vertical; background-image:repeating-linear-gradient(white,white 29px,#ccc 29px,#ccc 30px,white 30px); background-size:100% 30px; line-height:30px; }
    @media print {
      .cp-toolbar { display:none!important; }
      .cp-card { box-shadow:none!important; border:none!important; max-width:100%!important; padding:10px 14px!important; }
      .cp-submit-row { display:none!important; }
    }
  `;
  document.head.appendChild(s);
};

const formatINR = (n) => {
  const num = parseFloat(n);
  if (isNaN(num)) return n || '';
  return num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECOND CHALLAN PRINT PAGE
// ═══════════════════════════════════════════════════════════════════════════════
const SecondChallanPrint = ({ vendorId, fileId, dcId, onBack }) => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [dcDate,  setDcDate]  = useState('');
  const [fields,  setFields]  = useState({
    comments: '', qty2: '', nature: '', wasteReturn: '',
    wasteRetain: '', mfgGoods: '', valueAmt: '',
    place: '', date: '', factoryName: '', address: '',
  });
  const upd = (k, v) => setFields(p => ({ ...p, [k]: v }));

  useEffect(() => {
    setLoading(true);
    fetch(`https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/SecondChallanDetailApi.php?vendor_id=${vendorId}&file_id=${fileId}&dc_id=${dcId}`)
      .then(r => r.json())
      .then(json => {
        if (json.status === 'success') { setData(json.data); setDcDate(json.data.dc_info.dc_date || ''); }
        else setError(json.message || 'Failed to load data');
      })
      .catch(e => setError('Network error: ' + e.message))
      .finally(() => setLoading(false));
  }, [vendorId, fileId, dcId]);

  if (loading) return (
    <div className="cp-page">
      <div className="cp-toolbar">
        <button className="cp-btn" style={{ background: '#6c757d', color: '#fff' }} onClick={onBack}>
          <ArrowLeft size={14} /> Back to List
        </button>
      </div>
      <div className="cp-loader-wrap">
        <div className="cp-spinner" />
        <span style={{ fontSize: 13, color: '#555' }}>Loading challan data…</span>
      </div>
    </div>
  );

  if (error) return (
    <div className="cp-page">
      <div className="cp-toolbar">
        <button className="cp-btn" style={{ background: '#6c757d', color: '#fff' }} onClick={onBack}>
          <ArrowLeft size={14} /> Back to List
        </button>
      </div>
      <div className="cp-loader-wrap">
        <div style={{ color: '#c00', fontSize: 13 }}>⚠ {error}</div>
      </div>
    </div>
  );

  const { dc_info, file_info, vendor_info, company_info, items, totals } = data;
  const vendorLine = `${vendor_info.customer_name}(${vendor_info.address.trim()})(${vendor_info.gstin})`;

  return (
    <div className="cp-page challan-print-wrap">
      <div className="cp-toolbar">
        <button className="cp-btn" style={{ background: '#6c757d', color: '#fff' }} onClick={onBack}>
          <ArrowLeft size={14} /> Back to List
        </button>
        <button className="cp-btn" style={{ background: '#ff630d', color: '#fff' }} onClick={() => window.print()}>
          🖨 Print
        </button>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 16, fontSize: 11, color: '#555', alignItems: 'center', flexWrap: 'wrap' }}>
          <span>Vendor ID: <strong style={{ color: '#0ea5e9' }}>{vendorId}</strong></span>
          <span>File ID: <strong style={{ color: '#10b981' }}>{fileId}</strong></span>
          <span>DC ID: <strong style={{ color: '#f97316' }}>{dcId}</strong></span>
          <span>File: <strong>{file_info.file_name}</strong></span>
        </div>
      </div>
      <div className="cp-card">
        <div className="cp-section-title">Delivery Challan</div>
        <div className="cp-top-strip">
          <div className="cp-copy-colors">
            Orignal - Pink<br />Duplicate - Green<br />Triplicate - Blue<br />Quadruplicate - White
          </div>
          <div className="cp-company-center">
            <div className="cp-dc-heading">DELIVERY CHALLAN FOR JOB WORK</div>
            <br />
            <div className="cp-company-name">{company_info.name}</div>
            <div className="cp-company-addr">{company_info.address}</div>
          </div>
          <table className="cp-dc-table">
            <tbody>
              <tr><td><strong>D.C. NO.</strong></td><td className="cp-dc-no">{dc_info.dc_number}</td></tr>
              <tr><td>Date</td><td><input type="date" className="cp-date-inp" value={dcDate} onChange={e => setDcDate(e.target.value)} /></td></tr>
              <tr><td>GSTIN</td><td>{company_info.gstin}</td></tr>
            </tbody>
          </table>
        </div>
        <div className="cp-file-to-row">
          <div className="cp-file-col"><br /><span className="cp-file-label">File : {file_info.file_name}</span></div>
          <div className="cp-to-col">
            <br />
            <div className="cp-to-label">To : {vendorLine}</div>
            <div className="cp-receive-text">Please receive the following material in good condition along with necessary drawing.</div>
          </div>
        </div>
        <table className="cp-items-table">
          <thead>
            <tr>{['Sr No','Color','Material Name','Width','Height','Qty.','Unit','Approx Value','Tax','CGST','SGST'].map(h => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                <td className="num">{item.sr_no}</td><td className="num">{item.colour}</td>
                <td className="mat-name">{item.material_name}</td><td className="num">{formatINR(item.width)}</td>
                <td className="num">{item.height}</td><td className="num">{item.qty}</td>
                <td>{item.unit}</td><td className="num">{formatINR(item.approx_value)}</td>
                <td className="num">{item.tax}</td><td className="num">{formatINR(item.cgst)}</td>
                <td className="num">{formatINR(item.sgst)}</td>
              </tr>
            ))}
            <tr className="total-row">
              <td colSpan={5} style={{ textAlign: 'left' }}>TOTAL</td>
              <td className="num">{totals.total_qty}</td><td></td>
              <td className="num">{formatINR(totals.total_value)}</td><td></td>
              <td className="num">{formatINR(totals.total_cgst)}</td>
              <td className="num">{formatINR(totals.total_cgst)}</td>
            </tr>
          </tbody>
        </table>
        <div className="cp-totals-strip">
          <div className="cp-total-box"><span className="cp-t-label">TOTAL VALUE =</span><span className="cp-t-value">₹ {formatINR(totals.total_value)}</span></div>
          <div className="cp-total-box"><span className="cp-t-label">TOTAL TAX =</span><span className="cp-t-value">₹ {formatINR(totals.grand_total_gst)}</span></div>
          <div className="cp-total-box"><span className="cp-t-label">GRAND VALUE =</span><span className="cp-t-value">₹ {formatINR(totals.grand_value)}</span></div>
        </div>
        <div className="cp-notice-center">THIS IS COMPUTER GENERATED DC HENCE SIGNATURE NOT REQUIRED</div>
        <div className="cp-finished-goods">Finished Goods Ordered for conversion as per our instructions.</div>
        <div className="cp-section-hdr">TO BE FILLED IN BY THE JOB WORKER IN ORIGINAL &amp; DUPLICATE</div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, marginBottom: 4 }}>1. &nbsp;&nbsp; Date of despatch of finished goods to parent factory / supplier and entry No. and date of receipt in the account in the processing factory :</div>
          <textarea className="cp-textarea" rows={3} value={fields.comments} onChange={e => upd('comments', e.target.value)} />
        </div>
        {[
          { num: 2, label: 'Quantity despatched (No./Weight/Liter/Metre) as entered in the account', key: 'qty2' },
          { num: 3, label: 'Nature of processing / manufacturing done', key: 'nature' },
          { num: 4, label: 'Quantity of waste or scrap or by-product, if any. returned to the supplier', key: 'wasteReturn' },
          { num: 5, label: 'Quantity of waste or scrap or by-product, if any. retained by the job worker', key: 'wasteRetain' },
          { num: 6, label: 'Description, quantity of the goods manufactured by the job worker out of the waste or scrap or by-product', key: 'mfgGoods' },
          { num: 7, label: 'Value / Amount cleared in the job work / processing', key: 'valueAmt' },
        ].map(({ num, label, key }) => (
          <div className="cp-field-row" key={num}>
            <span className="cp-field-num">{num}.</span>
            <span className="cp-field-label">&nbsp;&nbsp;{label}</span>
            <input type="text" className="cp-field-input" value={fields[key]} onChange={e => upd(key, e.target.value)} />
          </div>
        ))}
        <div className="cp-certified">Certified that I/We have received the goods under this challan and the same has been accounted for in the accounts book.</div>
        <div className="cp-sig-row"><span className="cp-sig-label">Signature with Rubber Stamp of Processor / Job worker &amp; authorised agent</span></div>
        <div className="cp-bottom-grid">
          <div style={{ display: 'flex', gap: 20 }}>
            <div className="cp-bottom-row" style={{ flex: 1 }}><span className="cp-b-label">Place :</span><input type="text" className="cp-b-input" value={fields.place} onChange={e => upd('place', e.target.value)} /></div>
            <div className="cp-bottom-row" style={{ flex: 1 }}><span className="cp-b-label" style={{ minWidth: 120 }}>Name of the factory :</span><input type="text" className="cp-b-input" value={fields.factoryName} onChange={e => upd('factoryName', e.target.value)} /></div>
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            <div className="cp-bottom-row" style={{ flex: 1 }}><span className="cp-b-label">Date :</span><input type="text" className="cp-b-input" value={fields.date} onChange={e => upd('date', e.target.value)} /></div>
            <div className="cp-bottom-row" style={{ flex: 1 }}><span className="cp-b-label" style={{ minWidth: 120 }}>Address :</span><input type="text" className="cp-b-input" value={fields.address} onChange={e => upd('address', e.target.value)} /></div>
          </div>
        </div>
        {dc_info.can_submit && (
          <div className="cp-submit-row"><button className="cp-submit-btn">Submit</button></div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// GENERIC DC LIST TAB (Assembly, RFD Smetal, RFD Found, RFD Fab, Powder Challan)
// ═══════════════════════════════════════════════════════════════════════════════
const GenericDcList = ({ apiUrl, tabLabel, theme, T }) => {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch]   = useState('');
  const [page, setPage]       = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pinnedRows, setPinnedRows] = useState(new Set());
  const [financialYears, setFinancialYears] = useState([]);
  const [selectedYear, setSelectedYear]     = useState('25-26');

  useEffect(() => {
    fetchFinancialYears();
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedYear, apiUrl]);

  const fetchFinancialYears = async () => {
    try {
      const res  = await fetch('https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/GetYearsApi.php');
      const json = await res.json();
      if (json.status === 'success') {
        setFinancialYears(json.data);
        const latest = json.data[json.data.length - 1];
        if (latest) setSelectedYear(latest.financial_year);
      }
    } catch (e) { console.error(e); }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${apiUrl}?financial_year=${selectedYear}`);
      const json = await res.json();
      if (json.status === 'success') { setData(json.data || []); setPage(1); }
      else showToast(`Failed to load ${tabLabel} data`, 'error');
    } catch (e) { showToast(`Error fetching ${tabLabel} data`, 'error'); }
    finally { setLoading(false); }
  };

  const togglePin = (id) => { const s = new Set(pinnedRows); s.has(id) ? s.delete(id) : s.add(id); setPinnedRows(s); };

  const filtered = data.filter(r =>
    !search ||
    r.CUSTOMER_NAME?.toLowerCase().includes(search.toLowerCase()) ||
    r.FILE_NAME?.toLowerCase().includes(search.toLowerCase()) ||
    String(r.dc_id || '').toLowerCase().includes(search.toLowerCase()) ||
    String(r.fileid || r.file_id || '').toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged      = filtered.slice((page - 1) * pageSize, page * pageSize);

  const s = {
    tableWrap: { overflowX: 'auto', animation: 'fadeIn 0.25s ease' },
    table:     { width: '100%', borderCollapse: 'collapse', background: T.surface, fontSize: 13 },
    th:        { padding: '11px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: T.textMuted, background: T.surface2, borderBottom: `2px solid ${T.border}`, whiteSpace: 'nowrap' },
    td:        { padding: '10px 14px', borderBottom: `1px solid ${T.border}`, color: T.text, verticalAlign: 'middle' },
    inp:       { border: `1.5px solid ${T.border}`, borderRadius: 6, padding: '6px 10px', fontSize: 13, background: T.inputBg, color: T.text, fontFamily: "'DM Sans',sans-serif", transition: 'border 0.15s' },
    topBtn:    (color = '#f97316') => ({ padding: '6px 14px', fontSize: 12, fontWeight: 600, borderRadius: 6, border: 'none', cursor: 'pointer', background: color, color: '#fff', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap', boxShadow: `0 2px 8px ${color}44` }),
    saveBtn:   (sv) => ({ background: sv ? T.textMuted : 'linear-gradient(135deg,#6366f1,#4f46e5)', color: '#fff', padding: '5px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, border: 'none', cursor: sv ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 5, boxShadow: sv ? 'none' : '0 2px 8px #6366f155', transition: 'all 0.2s', whiteSpace: 'nowrap' }),
  };

  return (
    <div style={{ animation: 'fadeIn 0.25s ease' }}>
      {/* Controls */}
      <div style={{ padding: '12px 20px', borderBottom: `1px solid ${T.border}`, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', justifyContent: 'space-between', background: T.surface2 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {[
            { label: 'Download Excel', icon: <Download size={13} />, color: '#10b981' },
            { label: 'Clear Pinned',   icon: <Pin size={13} />,      color: '#6366f1', action: () => setPinnedRows(new Set()) },
            { label: 'Size To Fit',    icon: <Columns size={13} />,  color: '#0ea5e9' },
          ].map(b => (
            <button key={b.label} className="mas-top-btn" onClick={b.action} style={s.topBtn(b.color)}>
              {b.icon}{b.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <select className="mas-select" value={selectedYear} onChange={e => { setSelectedYear(e.target.value); setPage(1); }}
            style={{ ...s.inp, minWidth: 100, fontSize: 13, padding: '6px 10px', cursor: 'pointer' }}>
            {financialYears.map(y => <option key={y.id} value={y.financial_year}>{y.financial_year}</option>)}
          </select>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: T.textMuted }} />
            <input className="mas-input" placeholder="Search…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{ ...s.inp, paddingLeft: 30, minWidth: 180 }} />
          </div>
          <button className="mas-top-btn" onClick={fetchData} style={s.topBtn('#64748b')}>
            <RefreshCw size={13} />Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              {['SR. No.','Vendor ID','Vendor Name','File ID','File Name','DC ID','Date','Print',''].map((h, i) => (
                <th key={i} style={{ ...s.th, textAlign: i === 0 ? 'center' : 'left', width: i === 8 ? 40 : undefined }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}><td colSpan={9} style={{ padding: '10px 14px' }}>
                  <div className="mas-shimmer" style={{ height: 20, width: '100%', opacity: 0.5 - i * 0.06 }} />
                </td></tr>
              ))
            ) : paged.length === 0 ? (
              <tr><td colSpan={9} style={{ ...s.td, textAlign: 'center', padding: 48, color: T.textMuted }}>No records found</td></tr>
            ) : paged.map((row, idx) => {
              const isPinned = pinnedRows.has(row.count);
              const fileIdVal = row.fileid || row.file_id || '';
              return (
                <tr key={idx} className="mas-row" style={{ background: isPinned ? (theme === 'dark' ? 'rgba(99,102,241,0.1)' : '#eef2ff') : idx % 2 === 0 ? T.surface : T.surface2 }}>
                  <td style={{ ...s.td, textAlign: 'center', width: 60 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                      <input type="checkbox" checked={isPinned} onChange={() => togglePin(row.count)}
                        style={{ accentColor: T.accent, width: 14, height: 14, cursor: 'pointer' }} />
                      <span style={{ color: T.textMuted, fontWeight: 600, fontSize: 12 }}>{row.count}</span>
                    </div>
                  </td>
                  <td style={s.td}>
                    <span style={{ background: theme === 'dark' ? 'rgba(56,189,248,0.12)' : '#e0f2fe', color: '#0ea5e9', padding: '3px 8px', borderRadius: 5, fontSize: 12, fontWeight: 600 }}>
                      {row.vendor_id}
                    </span>
                  </td>
                  <td style={{ ...s.td, fontWeight: 500, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={row.CUSTOMER_NAME}>{row.CUSTOMER_NAME}</td>
                  <td style={{ ...s.td, color: T.textMuted }}>{fileIdVal}</td>
                  <td style={{ ...s.td, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12 }} title={row.FILE_NAME}>{row.FILE_NAME}</td>
                  <td style={s.td}>
                    <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600, color: T.accent }}>{row.dc_id}</span>
                  </td>
                  <td style={{ ...s.td, fontSize: 12, color: T.textMuted, whiteSpace: 'nowrap' }}>{row.date}</td>
                  <td style={s.td}>
                    <button className="mas-save-btn" style={s.saveBtn(false)}>
                      <Printer size={12} />Print
                    </button>
                  </td>
                  <td style={{ ...s.td, padding: '10px 8px' }}>
                    <button onClick={() => togglePin(row.count)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isPinned ? '#6366f1' : T.textMuted, padding: 4, borderRadius: 4 }}>
                      <Pin size={14} fill={isPinned ? '#6366f1' : 'none'} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ padding: '12px 20px', borderTop: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, background: T.surface2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: T.textMuted }}>Page Size:</span>
          <select className="mas-select" value={pageSize} onChange={e => { setPageSize(+e.target.value); setPage(1); }}
            style={{ ...s.inp, padding: '4px 8px', fontSize: 12, width: 70 }}>
            {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div style={{ fontSize: 12, color: T.textMuted }}>
          {filtered.length === 0 ? '0' : `${(page - 1) * pageSize + 1} to ${Math.min(page * pageSize, filtered.length)}`} of {filtered.length} — Page {page} of {totalPages}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {[
            { icon: <ChevronsLeft size={14} />,  action: () => setPage(1),                              disabled: page === 1 },
            { icon: <ChevronLeft size={14} />,   action: () => setPage(p => Math.max(1, p - 1)),        disabled: page === 1 },
            { icon: <ChevronRight size={14} />,  action: () => setPage(p => Math.min(totalPages, p+1)), disabled: page === totalPages },
            { icon: <ChevronsRight size={14} />, action: () => setPage(totalPages),                     disabled: page === totalPages },
          ].map((b, i) => (
            <button key={i} className="mas-page-btn" onClick={b.action} disabled={b.disabled}
              style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${T.border}`, borderRadius: 6, background: T.surface, color: T.text, cursor: 'pointer', transition: 'all 0.15s' }}>
              {b.icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN — MATERIAL APPROVAL SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════
const MaterialApprovalSystem = () => {
  const [theme, setTheme]         = useState('light');
  const [activeTab, setActiveTab] = useState('assembly');
  const [fileId, setFileId]       = useState('');
  const [fileName]                = useState('S-25-065-KBA-Additional');
  const [rawData, setRawData]     = useState([]);
  const [electricalData, setElectricalData] = useState([]);
  const [assemblyData, setAssemblyData]     = useState([]);
  const [hardwareData, setHardwareData]     = useState([]);
  const [materialOptions, setMaterialOptions] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [reqNo, setReqNo]         = useState('REQ 1');
  const [reqDate, setReqDate]     = useState(new Date().toISOString().split('T')[0]);
  const [isFullScreen, setIsFullScreen] = useState(true);
  const [employeeId]              = useState(1);
  const [assignValues, setAssignValues] = useState({});
  const [saving, setSaving]       = useState({});

  // Second Challan list state
  const [challanData, setChallanData]       = useState([]);
  const [challanLoading, setChallanLoading] = useState(false);
  const [financialYears, setFinancialYears] = useState([]);
  const [selectedYear, setSelectedYear]     = useState('25-26');
  const [challanPage, setChallanPage]       = useState(1);
  const [challanPageSize, setChallanPageSize] = useState(10);
  const [challanSearch, setChallanSearch]   = useState('');
  const [pinnedRows, setPinnedRows]         = useState(new Set());

  // Navigation: null = list, object = print page
  const [challanPrintParams, setChallanPrintParams] = useState(null);

  const T = getTheme(theme);

  useEffect(() => {
    injectStyles();
    const hash = window.location.hash;
    const match = hash.match(/\/file-details-new\/(\d+)/);
    if (match) setFileId(match[1]);
    fetchMaterialOptions();
    fetchFinancialYears();
  }, []);

  useEffect(() => { if (fileId) fetchAllData(); }, [fileId]);
  useEffect(() => { if (activeTab === 'secondChallan') fetchChallanData(); }, [activeTab, selectedYear]);

  const fetchFinancialYears = async () => {
    try {
      const res  = await fetch('https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/GetYearsApi.php');
      const json = await res.json();
      if (json.status === 'success') {
        setFinancialYears(json.data);
        const latest = json.data[json.data.length - 1];
        if (latest) setSelectedYear(latest.financial_year);
      }
    } catch (e) { console.error(e); }
  };

  const fetchChallanData = async () => {
    setChallanLoading(true);
    try {
      const res  = await fetch(`https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/second_challan_list_api.php?financial_year=${selectedYear}`);
      const json = await res.json();
      if (json.status === 'success') { setChallanData(json.data); setChallanPage(1); }
      else showToast('Failed to load challan data', 'error');
    } catch (e) { showToast('Error fetching challan data', 'error'); }
    finally { setChallanLoading(false); }
  };

  const fetchMaterialOptions = async () => {
    try {
      const res  = await fetch('https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/MaterialListApi.php');
      const json = await res.json();
      if (json.status === 'success') setMaterialOptions(json.data);
    } catch (e) { console.error(e); }
  };

  const fetchAllData = async () => {
    if (!fileId) return;
    setLoading(true);
    try {
      const [r1, r2, r3, r4] = await Promise.all([
        fetch(`https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/getRawMaterialApprovalListApi.php?file_id=${fileId}`),
        fetch(`https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/getElectricalMaterialApprovalListApi.php?file_id=${fileId}`),
        fetch(`https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/getAssemblyMaterialApprovalListApi.php?file_id=${fileId}`),
        fetch(`https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/get_hardware_materialsApi.php?fileID=${fileId}&&revision=1`),
      ]);
      const [d1, d2, d3, d4] = await Promise.all([r1.json(), r2.json(), r3.json(), r4.json()]);
      if (d1.status) setRawData(d1.data);
      if (d2.status) setElectricalData(d2.data);
      if (d3.status) setAssemblyData(d3.data);
      if (d4.status) setHardwareData(d4.data);
      showToast('Data loaded', 'success');
    } catch (e) { showToast('Error fetching data', 'error'); }
    finally { setLoading(false); }
  };

  const saveMaterialApproval = async (item, idx, apiType) => {
    const qty = parseFloat(assignValues[idx] || 0);
    if (!qty || qty <= 0) return showToast('Enter a valid quantity', 'error');
    if (!reqNo || !reqDate) return showToast('Enter Req No and Date', 'error');
    setSaving(p => ({ ...p, [idx]: true }));
    try {
      const urls = {
        raw:        'https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/rawMaterialRequestionApprovalApi.php',
        electrical: 'https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/electricalRawMaterialRequestionApprovalApi.php',
        assembly:   'https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/asslyRawMaterialRequestionApprovalApi.php',
      };
      const payloads = {
        raw:        { value: qty, typeRaw: item.type, idRaw: item.id, mRaw: item.material_id, fileID: fileId, reqNo, reqDate, employee_id: employeeId },
        electrical: { value: qty, type: item.type, id: item.id, Mid: item.material_id, fileID: fileId, reqNo, reqDate, employee_id: employeeId },
        assembly:   { value: qty, type: item.type, id: item.id, Mid: item.material_id, fileID: fileId, reqNo, reqDate, employee_id: employeeId },
      };
      const res  = await fetch(urls[apiType], { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payloads[apiType]) });
      const json = await res.json();
      if (json.status === 'success') { showToast('Material assigned', 'success'); setAssignValues(p => ({ ...p, [idx]: '' })); fetchAllData(); }
      else showToast(json.message || 'Failed', 'error');
    } catch (e) { showToast('Error saving', 'error'); }
    finally { setSaving(p => ({ ...p, [idx]: false })); }
  };

  const handlePrint = (row) => {
    window.location.href = `#/store/second-challan-print/${row.vendor_id}/${row.file_id}/${row.dc_no}`;
  };

  const submitHardwareMaterials = async () => {
    const materialData = [], reassign = [], subName = [];
    hardwareData.forEach(item => {
      if (item.assigned_qty && parseFloat(item.assigned_qty) > 0) {
        materialData.push(`${item.material_name}_${item.isNew ? 'S' : 'M'}_${item.required_qty}`);
        reassign.push(parseFloat(item.assigned_qty));
        subName.push(item.material_id || '');
      }
    });
    if (!materialData.length) return showToast('Assign at least one material', 'error');
    setSaving({ hardware: true });
    try {
      const res  = await fetch('https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/HardwareRawMaterialRequestionApprovalApi.php', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materialData, reassign, subName, fileID: fileId, employee_id: employeeId }),
      });
      const json = await res.json();
      if (json.status === 'success') { showToast('Hardware materials assigned', 'success'); fetchAllData(); }
      else showToast(json.message || 'Failed', 'error');
    } catch (e) { showToast('Error submitting', 'error'); }
    finally { setSaving({ hardware: false }); }
  };

  const addHardwareRow    = (idx) => { const row = { index: hardwareData.length, material_id: null, material_name: '', unit: '', required_qty: 0, stock: 0, assigned_qty: 0, readonly: false, isNew: true }; const d = [...hardwareData]; d.splice(idx + 1, 0, row); setHardwareData(d); };
  const removeHardwareRow = (idx) => setHardwareData(hardwareData.filter((_, i) => i !== idx));
  const updateHardwareField = (idx, field, value) => {
    const d = [...hardwareData]; d[idx][field] = value;
    if (field === 'material_name') { const opt = materialOptions.find(o => o.value === value); if (opt) { d[idx].material_name = opt.value; d[idx].material_id = opt.id; } }
    setHardwareData(d);
  };

  const filteredChallan   = challanData.filter(r => !challanSearch || r.CUSTOMER_NAME?.toLowerCase().includes(challanSearch.toLowerCase()) || r.FILE_NAME?.toLowerCase().includes(challanSearch.toLowerCase()) || r.dc_no?.toLowerCase().includes(challanSearch.toLowerCase()));
  const totalChallanPages = Math.max(1, Math.ceil(filteredChallan.length / challanPageSize));
  const pagedChallan      = filteredChallan.slice((challanPage - 1) * challanPageSize, challanPage * challanPageSize);
  const togglePin         = (id) => { const s = new Set(pinnedRows); s.has(id) ? s.delete(id) : s.add(id); setPinnedRows(s); };

  const openChallanPrint  = (row) => setChallanPrintParams({ vendorId: String(row.vendor_id), fileId: String(row.file_id), dcId: String(row.dc_id) });
  const closeChallanPrint = () => setChallanPrintParams(null);

  const s = {
    root:      { minHeight: '100vh', background: T.bg, color: T.text, fontFamily: "'DM Sans',sans-serif" },
    wrapper:   { maxWidth: isFullScreen ? '100%' : 1440, margin: '0 auto', padding: isFullScreen ? 0 : 24 },
    card:      { background: T.surface, border: `1px solid ${T.border}`, borderRadius: isFullScreen ? 0 : 12, overflow: 'hidden', boxShadow: '0 4px 32px rgba(0,0,0,0.06)' },
    header:    { background: 'linear-gradient(135deg,#1e2235 0%,#2d3561 100%)', padding: '16px 24px 0', borderBottom: `1px solid ${T.border}` },
    headerTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, paddingBottom: 14 },
    title:     { fontSize: 18, fontWeight: 700, color: '#fff', fontFamily: "'Space Grotesk',sans-serif", letterSpacing: '-0.3px' },
    subtitle:  { fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2 },
    topBtnRow: { display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' },
    topBtn:    (color = '#f97316') => ({ padding: '6px 14px', fontSize: 12, fontWeight: 600, borderRadius: 6, border: 'none', cursor: 'pointer', background: color, color: '#fff', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap', boxShadow: `0 2px 8px ${color}44` }),
    iconBtn:   { padding: '6px 10px', fontSize: 12, fontWeight: 500, borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', background: 'rgba(255,255,255,0.07)', color: '#fff', display: 'flex', alignItems: 'center', gap: 5 },
    tabBar:    { display: 'flex', gap: 0, marginTop: 4, overflowX: 'auto' },
    tab:       (active) => ({ padding: '12px 22px', fontSize: 13, fontWeight: active ? 700 : 500, border: 'none', cursor: 'pointer', background: active ? T.tabActiveBg : 'transparent', color: active ? T.tabActive : 'rgba(255,255,255,0.55)', borderBottom: active ? `3px solid ${T.tabActive}` : '3px solid transparent', borderRadius: 0, whiteSpace: 'nowrap', transition: 'all 0.2s', fontFamily: "'DM Sans',sans-serif" }),
    subHeader: { background: theme === 'dark' ? 'rgba(56,189,248,0.06)' : 'rgba(249,115,22,0.04)', padding: '10px 24px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 },
    tableWrap: { overflowX: 'auto', animation: 'fadeIn 0.25s ease' },
    table:     { width: '100%', borderCollapse: 'collapse', background: T.surface, fontSize: 13 },
    th:        { padding: '11px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: T.textMuted, background: T.surface2, borderBottom: `2px solid ${T.border}`, whiteSpace: 'nowrap' },
    td:        { padding: '10px 14px', borderBottom: `1px solid ${T.border}`, color: T.text, verticalAlign: 'middle' },
    inp:       { border: `1.5px solid ${T.border}`, borderRadius: 6, padding: '6px 10px', fontSize: 13, background: T.inputBg, color: T.text, fontFamily: "'DM Sans',sans-serif", transition: 'border 0.15s' },
    badge:     (type) => ({ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: type === 'Stock' ? (theme === 'dark' ? 'rgba(52,211,153,0.15)' : '#d1fae5') : (theme === 'dark' ? 'rgba(56,189,248,0.15)' : '#e0f2fe'), color: type === 'Stock' ? '#10b981' : '#0ea5e9' }),
    saveBtn:   (sv) => ({ background: sv ? T.textMuted : `linear-gradient(135deg,${T.accent},${T.accentHover})`, color: '#fff', padding: '6px 16px', borderRadius: 6, fontSize: 12, fontWeight: 600, border: 'none', cursor: sv ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 5, boxShadow: sv ? 'none' : `0 2px 8px ${T.accent}55`, transition: 'all 0.2s', whiteSpace: 'nowrap' }),
  };

  // ── If print view is active, render it ───────────────────────────────────
  if (challanPrintParams) {
    return (
      <div className="mas-root" style={s.root}>
        <SecondChallanPrint
          vendorId={challanPrintParams.vendorId}
          fileId={challanPrintParams.fileId}
          dcId={challanPrintParams.dcId}
          onBack={closeChallanPrint}
        />
      </div>
    );
  }

  // ── RENDER MATERIAL TABLE ─────────────────────────────────────────────────
  const renderMaterialTable = (data, apiType) => (
    <div style={s.tableWrap}>
      <table style={s.table}>
        <thead>
          <tr>
            {['#','Material','Required','Stock','Assigned','Assign Qty','Action','Type'].map(h => (
              <th key={h} style={{ ...s.th, textAlign: h === '#' ? 'center' : h === 'Material' ? 'left' : 'right' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={8} style={{ ...s.td, textAlign: 'center', padding: 40, color: T.textMuted }}>
              {loading
                ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}><div style={{ width: 18, height: 18, border: `2px solid ${T.border}`, borderTop: `2px solid ${T.accent}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Loading…</div>
                : 'No data available'}
            </td></tr>
          ) : data.map((item, idx) => (
            <tr key={idx} className="mas-row" style={{ background: idx % 2 === 0 ? T.surface : T.surface2 }}>
              <td style={{ ...s.td, textAlign: 'center', width: 50, color: T.textMuted, fontWeight: 600 }}>{idx + 1}</td>
              <td style={s.td}>
                <div style={{ fontWeight: 500 }}>{item.material_name}</div>
                {item.material_id && <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>ID: {item.material_id}</div>}
              </td>
              <td style={{ ...s.td, textAlign: 'right' }}><span style={{ color: T.accent, fontWeight: 700 }}>{item.ppc_assign_qty || item.required_qty || 0}</span></td>
              <td style={{ ...s.td, textAlign: 'right' }}>{item.stock || 0}</td>
              <td style={{ ...s.td, textAlign: 'right' }}><span style={{ color: T.success, fontWeight: 700 }}>{item.assign_qty || 0}</span></td>
              <td style={{ ...s.td, textAlign: 'right' }}>
                <input className="mas-input" type="number" value={assignValues[idx] || ''} onChange={e => setAssignValues(p => ({ ...p, [idx]: e.target.value }))} placeholder="0" style={{ ...s.inp, width: 80, textAlign: 'right', padding: '5px 8px' }} />
              </td>
              <td style={{ ...s.td, textAlign: 'right' }}>
                <button className="mas-save-btn" style={s.saveBtn(saving[idx])} onClick={() => saveMaterialApproval(item, idx, apiType)} disabled={saving[idx]}>
                  <Save size={12} />{saving[idx] ? 'Saving…' : 'Save'}
                </button>
              </td>
              <td style={{ ...s.td, textAlign: 'right' }}><span style={s.badge(item.type)}>{item.type}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // ── RENDER SECOND CHALLAN LIST ────────────────────────────────────────────
  const renderChallan = () => (
    <div style={{ animation: 'fadeIn 0.25s ease' }}>
      {/* Controls */}
      <div style={{ padding: '12px 20px', borderBottom: `1px solid ${T.border}`, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', justifyContent: 'space-between', background: T.surface2 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {[
            { label: 'Download Excel', icon: <Download size={13} />, color: '#10b981' },
            { label: 'Clear Pinned',   icon: <Pin size={13} />,      color: '#6366f1', action: () => setPinnedRows(new Set()) },
            { label: 'Pinned',         icon: <Pin size={13} />,      color: '#8b5cf6' },
            { label: 'Size To Fit',    icon: <Columns size={13} />,  color: '#0ea5e9' },
            { label: 'Auto-Size All',  icon: <Maximize2 size={13} />,color: '#f59e0b' },
          ].map(b => (
            <button key={b.label} className="mas-top-btn" onClick={b.action} style={s.topBtn(b.color)}>
              {b.icon}{b.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <select className="mas-select" value={selectedYear} onChange={e => { setSelectedYear(e.target.value); setChallanPage(1); }}
            style={{ ...s.inp, minWidth: 100, fontSize: 13, padding: '6px 10px', cursor: 'pointer' }}>
            {financialYears.map(y => <option key={y.id} value={y.financial_year}>{y.financial_year}</option>)}
          </select>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: T.textMuted }} />
            <input className="mas-input" placeholder="Search…" value={challanSearch} onChange={e => { setChallanSearch(e.target.value); setChallanPage(1); }}
              style={{ ...s.inp, paddingLeft: 30, minWidth: 180 }} />
          </div>
          <button className="mas-top-btn" onClick={fetchChallanData} style={s.topBtn('#64748b')}>
            <RefreshCw size={13} />Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              {['SR. No.','Vendor ID','Vendor Name','File ID','File Name','DC No','Date','Print',''].map((h, i) => (
                <th key={i} style={{ ...s.th, textAlign: i === 0 ? 'center' : 'left', width: i === 8 ? 40 : undefined }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {challanLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}><td colSpan={9} style={{ padding: '10px 14px' }}>
                  <div className="mas-shimmer" style={{ height: 20, width: '100%', opacity: 0.5 - i * 0.06 }} />
                </td></tr>
              ))
            ) : pagedChallan.length === 0 ? (
              <tr><td colSpan={9} style={{ ...s.td, textAlign: 'center', padding: 48, color: T.textMuted }}>No records found</td></tr>
            ) : pagedChallan.map((row, idx) => {
              const isPinned = pinnedRows.has(row.count);
              return (
                <tr key={idx} className="mas-row" style={{ background: isPinned ? (theme === 'dark' ? 'rgba(99,102,241,0.1)' : '#eef2ff') : idx % 2 === 0 ? T.surface : T.surface2 }}>
                  <td style={{ ...s.td, textAlign: 'center', width: 60 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                      <input type="checkbox" checked={isPinned} onChange={() => togglePin(row.count)}
                        style={{ accentColor: T.accent, width: 14, height: 14, cursor: 'pointer' }} />
                      <span style={{ color: T.textMuted, fontWeight: 600, fontSize: 12 }}>{row.count}</span>
                    </div>
                  </td>
                  <td style={s.td}>
                    <span style={{ background: theme === 'dark' ? 'rgba(56,189,248,0.12)' : '#e0f2fe', color: '#0ea5e9', padding: '3px 8px', borderRadius: 5, fontSize: 12, fontWeight: 600 }}>
                      {row.vendor_id}
                    </span>
                  </td>
                  <td style={{ ...s.td, fontWeight: 500, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={row.CUSTOMER_NAME}>{row.CUSTOMER_NAME}</td>
                  <td style={{ ...s.td, color: T.textMuted }}>{row.file_id}</td>
                  <td style={{ ...s.td, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12 }} title={row.FILE_NAME}>{row.FILE_NAME}</td>
                  <td style={s.td}>
                    <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600, color: T.accent }}>{row.dc_no}</span>
                  </td>
                  <td style={{ ...s.td, fontSize: 12, color: T.textMuted, whiteSpace: 'nowrap' }}>{row.date}</td>
                  <td style={s.td}>
                    <button className="mas-save-btn"
                      style={{ ...s.saveBtn(false), background: 'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow: '0 2px 8px #6366f155', padding: '5px 14px' }}
                      onClick={() => handlePrint(row)}>
                      <Printer size={12} />Print
                    </button>
                  </td>
                  <td style={{ ...s.td, padding: '10px 8px' }}>
                    <button onClick={() => togglePin(row.count)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isPinned ? '#6366f1' : T.textMuted, padding: 4, borderRadius: 4 }}>
                      <Pin size={14} fill={isPinned ? '#6366f1' : 'none'} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ padding: '12px 20px', borderTop: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, background: T.surface2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: T.textMuted }}>Page Size:</span>
          <select className="mas-select" value={challanPageSize} onChange={e => { setChallanPageSize(+e.target.value); setChallanPage(1); }}
            style={{ ...s.inp, padding: '4px 8px', fontSize: 12, width: 70 }}>
            {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div style={{ fontSize: 12, color: T.textMuted }}>
          {filteredChallan.length === 0 ? '0' : `${(challanPage - 1) * challanPageSize + 1} to ${Math.min(challanPage * challanPageSize, filteredChallan.length)}`} of {filteredChallan.length} — Page {challanPage} of {totalChallanPages}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {[
            { icon: <ChevronsLeft size={14} />,  action: () => setChallanPage(1),                                       disabled: challanPage === 1 },
            { icon: <ChevronLeft size={14} />,   action: () => setChallanPage(p => Math.max(1, p - 1)),                 disabled: challanPage === 1 },
            { icon: <ChevronRight size={14} />,  action: () => setChallanPage(p => Math.min(totalChallanPages, p + 1)), disabled: challanPage === totalChallanPages },
            { icon: <ChevronsRight size={14} />, action: () => setChallanPage(totalChallanPages),                       disabled: challanPage === totalChallanPages },
          ].map((b, i) => (
            <button key={i} className="mas-page-btn" onClick={b.action} disabled={b.disabled}
              style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${T.border}`, borderRadius: 6, background: T.surface, color: T.text, cursor: 'pointer', transition: 'all 0.15s' }}>
              {b.icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ── TABS CONFIG ───────────────────────────────────────────────────────────
  const tabs = [
    { id: 'assembly',      label: 'Assembly' },
    { id: 'rfd_smetal',    label: 'RFD-Smetal' },
    { id: 'rfd_fab',       label: 'RFD-Fab' },
    { id: 'rfd_found',     label: 'RFD-Found' },
    { id: 'debit_note_dc', label: 'Debit Note Dc' },
    { id: 'secondChallan', label: 'Second Challan' },
    { id: 'powderChallan', label: 'Powder Challan Dc' },
  ];

  // Map tab IDs to their API URLs
  const tabApiMap = {
    assembly:      'https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/assembly_dc_list_api.php',
    rfd_smetal:    'https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/rfd_smetal_list_api.php',
    rfd_found:     'https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/rfd_found_list_api.php',
    rfd_fab:       'https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/rfd_fab_list_api.php',
    powderChallan: 'https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/powder_rawmaterial_list_api.php',
  };

  // Tabs that use the generic DC list component
  const genericListTabs = ['assembly', 'rfd_smetal', 'rfd_fab', 'rfd_found', 'powderChallan'];
  const showSubHeader    = !['hardware', 'secondChallan', ...genericListTabs, 'debit_note_dc'].includes(activeTab);

  return (
    <div className="mas-root" style={s.root}>
      <div style={s.wrapper}>
        <div style={s.card}>

          {/* Header */}
          <div style={s.header}>
            <div style={s.headerTop}>
              <div>
                <div style={s.title}>Material Approval System</div>
                <div style={s.subtitle}>File: {fileName}</div>
              </div>
              <div style={s.topBtnRow}>
                <button className="mas-top-btn" onClick={fetchAllData} disabled={loading} style={s.iconBtn}>
                  <RefreshCw size={14} style={{ animation: loading ? 'spin 0.8s linear infinite' : 'none' }} />Refresh
                </button>
                <button className="mas-top-btn" onClick={() => setIsFullScreen(p => !p)} style={s.iconBtn}>
                  {isFullScreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}{isFullScreen ? 'Exit Full' : 'Full Screen'}
                </button>
                <button className="mas-top-btn" onClick={() => setTheme(p => p === 'light' ? 'dark' : 'light')} style={s.iconBtn}>
                  {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}{theme === 'light' ? 'Dark' : 'Light'}
                </button>
              </div>
            </div>
            <div style={s.tabBar}>
              {tabs.map(t => (
                <button key={t.id} className={`mas-tab-btn ${activeTab === t.id ? 'active' : ''}`}
                  style={s.tab(activeTab === t.id)} onClick={() => setActiveTab(t.id)}>
                  {t.label}
                  {t.id === 'secondChallan' && challanData.length > 0 && (
                    <span style={{ marginLeft: 6, background: T.accent, color: '#fff', borderRadius: 20, padding: '1px 7px', fontSize: 10, fontWeight: 700 }}>
                      {challanData.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Sub-header (only for raw/electrical/assembly material approval) */}
          {showSubHeader && (
            <div style={s.subHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, whiteSpace: 'nowrap' }}>REQ NO</label>
                <input className="mas-input" type="text" value={reqNo} onChange={e => setReqNo(e.target.value)} placeholder="REQ NO" style={{ ...s.inp, fontWeight: 700, width: 130 }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar size={15} style={{ color: T.accent }} />
                <input className="mas-input" type="date" value={reqDate} onChange={e => setReqDate(e.target.value)} style={s.inp} />
              </div>
            </div>
          )}

          {/* Content */}
          <div style={{ padding: ['secondChallan', ...genericListTabs, 'debit_note_dc'].includes(activeTab) ? 0 : (isFullScreen ? '16px' : '24px') }}>

            {/* Generic DC List Tabs */}
            {genericListTabs.includes(activeTab) && tabApiMap[activeTab] && (
              <GenericDcList
                key={activeTab}
                apiUrl={tabApiMap[activeTab]}
                tabLabel={tabs.find(t => t.id === activeTab)?.label || activeTab}
                theme={theme}
                T={T}
              />
            )}

            {/* Second Challan */}
            {activeTab === 'secondChallan' && renderChallan()}

            {/* Debit Note DC — placeholder */}
            {activeTab === 'debit_note_dc' && (
              <div style={{ padding: 48, textAlign: 'center', color: T.textMuted, fontSize: 14 }}>
                Debit Note DC — coming soon
              </div>
            )}

            {/* Hardware */}
            {activeTab === 'hardware' && (
              <div style={s.tableWrap}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      {['','Material','Unit','Required','Stock','Assign',''].map((h, i) => (
                        <th key={i} style={{ ...s.th, textAlign: i > 1 ? 'right' : 'left' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {hardwareData.map((item, idx) => (
                      <tr key={idx} className="mas-row" style={{ background: item.readonly ? T.surface2 : idx % 2 === 0 ? T.surface : T.surface2 }}>
                        <td style={{ ...s.td, width: 40 }}>
                          {!item.readonly && <button onClick={() => addHardwareRow(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.accent }}><Plus size={16} /></button>}
                        </td>
                        <td style={s.td}>
                          {item.isNew
                            ? <select className="mas-select" value={item.material_name} onChange={e => updateHardwareField(idx, 'material_name', e.target.value)} style={{ ...s.inp, minWidth: 200 }}>
                                <option value="">Select Material</option>
                                {materialOptions.map((o, i) => <option key={i} value={o.value}>{o.label}</option>)}
                              </select>
                            : <span style={{ fontWeight: item.readonly ? 700 : 400 }}>{item.material_name}</span>}
                        </td>
                        <td style={{ ...s.td, textAlign: 'right', color: T.textMuted }}>{item.unit}</td>
                        <td style={{ ...s.td, textAlign: 'right' }}><span style={{ color: T.accent, fontWeight: 700 }}>{item.required_qty}</span></td>
                        <td style={{ ...s.td, textAlign: 'right' }}>{item.stock}</td>
                        <td style={s.td}>
                          {!item.readonly && <input className="mas-input" type="number" value={item.assigned_qty} onChange={e => updateHardwareField(idx, 'assigned_qty', e.target.value)} style={{ ...s.inp, width: 100, textAlign: 'right', padding: '5px 8px' }} />}
                        </td>
                        <td style={{ ...s.td, width: 40, textAlign: 'right' }}>
                          {!item.readonly && item.material_id && <button onClick={() => removeHardwareRow(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.danger }}><X size={16} /></button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 12, padding: '20px', flexWrap: 'wrap' }}>
                  <button className="mas-save-btn" onClick={submitHardwareMaterials} disabled={saving.hardware} style={s.saveBtn(saving.hardware)}>
                    <Save size={15} />{saving.hardware ? 'Submitting…' : 'Submit Hardware'}
                  </button>
                  <button className="mas-save-btn" style={{ ...s.saveBtn(false), background: 'linear-gradient(135deg,#6c757d,#5a6268)', boxShadow: 'none' }}>
                    <Printer size={15} />Print
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialApprovalSystem;