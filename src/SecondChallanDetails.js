import React, { useState, useEffect, useRef } from 'react';

const API_BASE = 'https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/SecondChallanDetailApi.php';

// ── helpers ──────────────────────────────────────────────────────────────────
const formatINR = (n) => {
  if (n === undefined || n === null || n === '') return '';
  const num = parseFloat(n);
  if (isNaN(num)) return n;
  return num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const fmt = (n) => `₹ ${formatINR(n)}`;

// ── inline styles (print-safe, no external deps) ─────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Times+New+Roman&family=Calibri:wght@400;600;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body { background: #e8e8e8; font-family: Arial, Helvetica, sans-serif; font-size: 12px; }

  .page-wrapper {
    background: #e8e8e8;
    min-height: 100vh;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .toolbar {
    width: 100%;
    max-width: 1100px;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    align-items: center;
  }

  .toolbar-btn {
    padding: 7px 18px;
    border: none;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    font-family: Arial, sans-serif;
    transition: filter 0.15s;
  }
  .toolbar-btn:hover { filter: brightness(0.92); }
  .btn-print  { background: #ff630d; color: #fff; }
  .btn-back   { background: #6c757d; color: #fff; }
  .btn-reload { background: #17a2b8; color: #fff; }

  .challan-card {
    background: #fff;
    width: 100%;
    max-width: 1100px;
    border: 1px solid #ccc;
    padding: 18px 22px 28px;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 12px;
    color: #000;
    box-shadow: 0 2px 12px rgba(0,0,0,0.12);
  }

  /* ── SECTION TITLE ── */
  .section-title {
    font-size: 11.5px;
    font-weight: 600;
    color: #333;
    border-bottom: 1px solid #bbb;
    padding-bottom: 3px;
    margin-bottom: 10px;
  }

  /* ── TOP STRIP ── */
  .top-strip {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 14px;
  }

  .copy-colors { font-size: 11px; color: #555; line-height: 1.7; }

  .company-center { text-align: center; flex: 1; padding: 0 20px; }
  .company-center .dc-heading {
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.3px;
    margin-bottom: 5px;
  }
  .company-center .company-name {
    font-size: 13.5px;
    font-weight: 700;
    margin-bottom: 3px;
  }
  .company-center .company-addr {
    font-size: 11px;
    color: #333;
  }

  /* ── DC INFO TABLE ── */
  .dc-info-table {
    border-collapse: collapse;
    font-size: 12px;
    min-width: 260px;
  }
  .dc-info-table td {
    border: 1px solid #999;
    padding: 5px 8px;
    white-space: nowrap;
  }
  .dc-info-table td:first-child { font-weight: 600; background: #f5f5f5; }
  .dc-info-table td:last-child  { font-weight: 700; }
  .dc-no-value { font-size: 15px !important; font-weight: 700 !important; color: #000; }
  .date-input {
    border: 1px solid #aaa;
    padding: 2px 5px;
    font-size: 12px;
    font-family: Arial, sans-serif;
    width: 130px;
  }

  /* ── FILE / TO ROW ── */
  .file-to-row {
    display: flex;
    gap: 0;
    align-items: flex-start;
    margin-bottom: 12px;
    border-bottom: 1px solid #ddd;
    padding-bottom: 10px;
  }
  .file-col { min-width: 200px; font-size: 12px; }
  .file-col .file-label { font-weight: 700; font-size: 12.5px; }
  .to-col { flex: 1; font-size: 12px; }
  .to-col .to-label { font-weight: 700; font-size: 12.5px; }
  .to-col .receive-text { margin-left: 65px; margin-top: 4px; font-size: 11.5px; color: #222; }

  /* ── ITEMS TABLE ── */
  .items-table {
    width: 100%;
    border-collapse: collapse;
    border: 2px solid #cdcdcd;
    margin-bottom: 0;
    font-size: 11.5px;
  }
  .items-table th, .items-table td {
    border: 1px solid #cdcdcd;
    padding: 6px 7px;
    text-align: center;
    vertical-align: middle;
  }
  .items-table thead tr { background: rgba(158,158,158,0.19); }
  .items-table thead th { font-weight: 700; font-size: 11.5px; }
  .items-table tbody .mat-name { text-align: left; }
  .items-table tbody .num { text-align: right; }
  .items-table tbody .total-row td { font-weight: 700; background: rgba(158,158,158,0.1); }

  /* ── TOTALS STRIP ── */
  .totals-strip {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0 8px;
    border-bottom: 1px solid #ccc;
    margin-bottom: 6px;
  }
  .total-box { display: flex; align-items: center; gap: 6px; }
  .total-box .t-label { font-weight: 700; font-size: 12px; white-space: nowrap; }
  .total-box .t-value {
    font-weight: 700;
    font-size: 15px;
    border-bottom: 2px solid #000;
    padding: 2px 50px 2px 8px;
    min-width: 140px;
    text-align: left;
  }

  /* ── NOTICE ── */
  .notice-center { text-align: center; font-weight: 700; font-size: 13px; margin: 8px 0 4px; letter-spacing: 0.2px; }
  .finished-goods { font-size: 11.5px; margin-bottom: 12px; }

  /* ── SECTION HEADER ── */
  .section-header-center { text-align: center; font-weight: 700; font-size: 13px; margin: 14px 0 10px; letter-spacing: 0.2px; text-decoration: underline; }

  /* ── FIELD ROWS ── */
  .field-row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 12px;
    font-size: 12px;
  }
  .field-row .field-num { min-width: 16px; font-weight: 600; }
  .field-row .field-label { flex: 1; }
  .field-row .field-input {
    flex: 1;
    border: none;
    border-bottom: 1px solid #999;
    padding: 2px 4px;
    font-family: Arial, sans-serif;
    font-size: 12px;
    background: transparent;
    outline: none;
    min-width: 200px;
  }
  .field-row-textarea {
    display: flex;
    flex-direction: column;
    margin-bottom: 12px;
    font-size: 12px;
    gap: 6px;
  }
  .field-row-textarea .field-label-top { font-size: 12px; }
  .field-row-textarea textarea {
    width: 100%;
    min-height: 55px;
    border: 1px solid #ccc;
    border-radius: 6px;
    padding: 6px 8px;
    font-family: Arial, sans-serif;
    font-size: 12px;
    resize: vertical;
    background-image: repeating-linear-gradient(
      white, white 29px, #ccc 29px, #ccc 30px, white 30px
    );
    background-size: 100% 30px;
    line-height: 30px;
  }

  /* ── CERTIFIED ── */
  .certified-text { text-align: center; font-size: 12px; margin: 18px 0 24px; }

  /* ── SIGNATURE ROW ── */
  .sig-row {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 12px;
    font-size: 12px;
  }
  .sig-label { font-size: 11.5px; color: #333; }

  /* ── PLACE DATE NAME ADDR ── */
  .bottom-grid {
    display: flex;
    flex-direction: column;
    gap: 10px;
    font-size: 12px;
    margin-top: 6px;
  }
  .bottom-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .bottom-row .b-label { min-width: 60px; font-weight: 600; }
  .bottom-row .b-input {
    flex: 1;
    border: none;
    border-bottom: 1px solid #777;
    padding: 2px 4px;
    font-family: Arial, sans-serif;
    font-size: 12px;
    background: transparent;
    outline: none;
  }

  /* ── SUBMIT BTN ── */
  .submit-row { text-align: center; margin-top: 16px; }
  .submit-btn {
    background: #ff630d;
    color: #fff;
    border: none;
    padding: 8px 36px;
    font-size: 13px;
    font-weight: 700;
    border-radius: 4px;
    cursor: pointer;
    font-family: Arial, sans-serif;
    transition: background 0.15s;
  }
  .submit-btn:hover { background: #e0550a; }

  /* ── LOADER / ERROR ── */
  .loader-wrap {
    display: flex; align-items: center; justify-content: center;
    min-height: 300px; flex-direction: column; gap: 14px; background: #fff;
    width: 100%; max-width: 1100px; border: 1px solid #ccc; padding: 40px;
  }
  .spinner {
    width: 36px; height: 36px; border: 3px solid #e0e0e0;
    border-top-color: #ff630d; border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .error-box { color: #c00; font-size: 13px; text-align: center; }

  /* ── PRINT ── */
  @media print {
    body { background: #fff !important; }
    .page-wrapper { background: #fff !important; padding: 0 !important; }
    .toolbar { display: none !important; }
    .challan-card {
      box-shadow: none !important;
      border: none !important;
      max-width: 100% !important;
      padding: 10px 14px !important;
    }
    .submit-row { display: none !important; }
  }
`;

// ── COMPONENT ─────────────────────────────────────────────────────────────────
const SecondChallanPrint = ({
  vendorId = '681',
  fileId   = '4990',
  dcId     = '25-26-3262',
}) => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [dcDate,  setDcDate]  = useState('');

  // form fields state
  const [fields, setFields] = useState({
    despatch: '', qty2: '', nature: '', wasteReturn: '',
    wasteRetain: '', mfgGoods: '', valueAmt: '',
    place: '', date: '', factoryName: '', address: '',
    comments: '',
  });

  const updateField = (key, val) =>
    setFields(prev => ({ ...prev, [key]: val }));

  useEffect(() => {
    const tag = document.createElement('style');
    tag.textContent = css;
    document.head.appendChild(tag);
    return () => document.head.removeChild(tag);
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(`${API_BASE}?vendor_id=${vendorId}&file_id=${fileId}&dc_id=${dcId}`)
      .then(r => r.json())
      .then(json => {
        if (json.status === 'success') {
          setData(json.data);
          setDcDate(json.data.dc_info.dc_date || '');
        } else {
          setError(json.message || 'Failed to load data');
        }
      })
      .catch(e => setError('Network error: ' + e.message))
      .finally(() => setLoading(false));
  }, [vendorId, fileId, dcId]);

  if (loading) return (
    <div className="page-wrapper">
      <div className="loader-wrap">
        <div className="spinner" />
        <span style={{ fontSize: 13, color: '#555' }}>Loading challan data…</span>
      </div>
    </div>
  );

  if (error) return (
    <div className="page-wrapper">
      <div className="loader-wrap">
        <div className="error-box">⚠ {error}</div>
      </div>
    </div>
  );

  if (!data) return null;

  const { dc_info, file_info, vendor_info, company_info, items, totals } = data;

  const vendorLine =
    `${vendor_info.customer_name}(${vendor_info.address.trim()})(${vendor_info.gstin})`;

  return (
    <div className="page-wrapper">

      {/* ── TOOLBAR ── */}
      <div className="toolbar">
        <button className="toolbar-btn btn-print" onClick={() => window.print()}>
          🖨 Print
        </button>
        <button className="toolbar-btn btn-reload" onClick={() => window.location.reload()}>
          🔄 Reload
        </button>
        <button className="toolbar-btn btn-back" onClick={() => window.history.back()}>
          ← Back
        </button>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#555' }}>
          DC: <strong>{dc_info.dc_number}</strong> &nbsp;|&nbsp; File: <strong>{file_info.file_name}</strong>
        </span>
      </div>

      {/* ── CHALLAN CARD ── */}
      <div className="challan-card">

        {/* ── SECTION TITLE ── */}
        <div className="section-title">Delivery Challan</div>

        {/* ── TOP 3-COL ROW ── */}
        <div className="top-strip">

          {/* left: copy colors */}
          <div className="copy-colors">
            Orignal - Pink<br />
            Duplicate - Green<br />
            Triplicate - Blue<br />
            Quadruplicate - White
          </div>

          {/* center: company */}
          <div className="company-center">
            <div className="dc-heading">DELIVERY CHALLAN FOR JOB WORK</div>
            <br />
            <div className="company-name">{company_info.name}</div>
            <div className="company-addr">{company_info.address}</div>
          </div>

          {/* right: DC info table */}
          <table className="dc-info-table">
            <tbody>
              <tr>
                <td><strong>D.C. NO.</strong></td>
                <td className="dc-no-value">{dc_info.dc_number}</td>
              </tr>
              <tr>
                <td>Date</td>
                <td>
                  <input
                    type="date"
                    className="date-input"
                    value={dcDate}
                    onChange={e => setDcDate(e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <td>GSTIN</td>
                <td>{company_info.gstin}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── FILE / TO ROW ── */}
        <div className="file-to-row">
          <div className="file-col">
            <br />
            <span className="file-label">File : {file_info.file_name}</span>
          </div>
          <div className="to-col">
            <br />
            <div className="to-label">To : {vendorLine}</div>
            <div className="receive-text">
              Please receive the following material in good condition along with necessary drawing.
            </div>
          </div>
        </div>

        {/* ── ITEMS TABLE ── */}
        <div style={{ marginBottom: 0 }}>
          <table className="items-table">
            <thead>
              <tr>
                <th>Sr No</th>
                <th>Color</th>
                <th>Material Name</th>
                <th>Width</th>
                <th>Height</th>
                <th>Qty.</th>
                <th>Unit</th>
                <th>Approx Value</th>
                <th>Tax</th>
                <th>CGST</th>
                <th>SGST</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i}>
                  <td className="num">{item.sr_no}</td>
                  <td className="num">{item.colour}</td>
                  <td className="mat-name">{item.material_name}</td>
                  <td className="num">{formatINR(item.width)}</td>
                  <td className="num">{item.height}</td>
                  <td className="num">{item.qty}</td>
                  <td>{item.unit}</td>
                  <td className="num">{formatINR(item.approx_value)}</td>
                  <td className="num">{item.tax}</td>
                  <td className="num">{formatINR(item.cgst)}</td>
                  <td className="num">{formatINR(item.sgst)}</td>
                </tr>
              ))}

              {/* TOTAL row */}
              <tr className="total-row">
                <td colSpan={5} style={{ textAlign: 'left', fontWeight: 700 }}>TOTAL</td>
                <td className="num">{totals.total_qty}</td>
                <td></td>
                <td className="num">{formatINR(totals.total_value)}</td>
                <td></td>
                <td className="num">{formatINR(totals.total_cgst)}</td>
                <td className="num">{formatINR(totals.total_cgst)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── TOTALS STRIP ── */}
        <div className="totals-strip">
          <div className="total-box">
            <span className="t-label">TOTAL VALUE =</span>
            <span className="t-value">₹ {formatINR(totals.total_value)}</span>
          </div>
          <div className="total-box">
            <span className="t-label">TOTAL TAX =</span>
            <span className="t-value">₹ {formatINR(totals.grand_total_gst)}</span>
          </div>
          <div className="total-box">
            <span className="t-label">GRAND VALUE =</span>
            <span className="t-value">₹ {formatINR(totals.grand_value)}</span>
          </div>
        </div>

        {/* ── NOTICE ── */}
        <div className="notice-center">
          THIS IS COMPUTER GENERATED  DC HENCE SIGNATURE NOT REQUIRED
        </div>
        <div className="finished-goods">
          Finished Goods Ordered for conversion as per our instructions.
        </div>

        {/* ── SECTION HEADER ── */}
        <div className="section-header-center">
          TO BE FILLED IN BY THE JOB WORKER IN ORIGINAL &amp; DUPLICATE
        </div>

        {/* ── FIELD 1 (textarea) ── */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, marginBottom: 4 }}>
            1. &nbsp;&nbsp; Date of despatch of finished goods to parent factory / supplier and entry No. and date of receipt in the account in the processing factory :
          </div>
          <textarea
            className="notes"
            rows={3}
            value={fields.comments}
            onChange={e => updateField('comments', e.target.value)}
            style={{
              width: '100%',
              minHeight: 55,
              border: '1px solid #ccc',
              borderRadius: 6,
              padding: '6px 8px',
              fontFamily: 'Arial, sans-serif',
              fontSize: 12,
              resize: 'vertical',
              backgroundImage: 'repeating-linear-gradient(white, white 29px, #ccc 29px, #ccc 30px, white 30px)',
              backgroundSize: '100% 30px',
              lineHeight: '30px',
            }}
          />
        </div>

        {/* ── FIELDS 2–7 ── */}
        {[
          { num: 2, label: 'Quantity despatched (No./Weight/Liter/Metre) as entered in the account', key: 'qty2' },
          { num: 3, label: 'Nature of processing / manufacturing done', key: 'nature' },
          { num: 4, label: 'Quantity of waste or scrap or by-product, if any. returned to the supplier', key: 'wasteReturn' },
          { num: 5, label: 'Quantity of waste or scrap or by-product, if any. retained by the job worker', key: 'wasteRetain' },
          { num: 6, label: 'Description, quantity of the goods manufactured by the job worker out of the waste or scrap or by-product', key: 'mfgGoods' },
          { num: 7, label: 'Value / Amount cleared in the job work / processing', key: 'valueAmt' },
        ].map(({ num, label, key }) => (
          <div className="field-row" key={num}>
            <span className="field-num">{num}.</span>
            <span className="field-label" style={{ flex: 2 }}>&nbsp;&nbsp;{label}</span>
            <input
              type="text"
              className="field-input"
              value={fields[key]}
              onChange={e => updateField(key, e.target.value)}
            />
          </div>
        ))}

        {/* ── CERTIFIED ── */}
        <div className="certified-text">
          Certified that I/We have received  the goods under this challan and the same has been accounted for  in the accounts book.
        </div>

        {/* ── SIGNATURE ── */}
        <div className="sig-row">
          <span className="sig-label">
            Signature with Rubber Stamp of Processor / Job worker &amp; authorised agent
          </span>
        </div>

        {/* ── PLACE / DATE / FACTORY / ADDRESS ── */}
        <div className="bottom-grid">
          <div style={{ display: 'flex', gap: 20 }}>
            <div className="bottom-row" style={{ flex: 1 }}>
              <span className="b-label">Place :</span>
              <input type="text" className="b-input" value={fields.place} onChange={e => updateField('place', e.target.value)} />
            </div>
            <div className="bottom-row" style={{ flex: 1 }}>
              <span className="b-label" style={{ minWidth: 120 }}>Name of the factory :</span>
              <input type="text" className="b-input" value={fields.factoryName} onChange={e => updateField('factoryName', e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            <div className="bottom-row" style={{ flex: 1 }}>
              <span className="b-label">Date :</span>
              <input type="text" className="b-input" value={fields.date} onChange={e => updateField('date', e.target.value)} />
            </div>
            <div className="bottom-row" style={{ flex: 1 }}>
              <span className="b-label" style={{ minWidth: 120 }}>Address :</span>
              <input type="text" className="b-input" value={fields.address} onChange={e => updateField('address', e.target.value)} />
            </div>
          </div>
        </div>

        {/* ── SUBMIT (only if can_submit) ── */}
        {dc_info.can_submit && (
          <div className="submit-row">
            <button className="submit-btn" onClick={() => alert('Submit functionality — connect to save API')}>
              Submit
            </button>
          </div>
        )}

      </div>{/* end challan-card */}
    </div>
  );
};

export default SecondChallanPrint;