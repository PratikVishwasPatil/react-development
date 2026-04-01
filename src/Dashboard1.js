import { useEffect, useMemo, useState, useRef } from "react";

// ─── Styles ──────────────────────────────────────────────────────────────────
const G = {
  blue: "#2563eb",
  blueDark: "#1e40af",
  blueLight: "#eff6ff",
  green: "#059669",
  greenLight: "#d1fae5",
  red: "#dc2626",
  redLight: "#fee2e2",
  amber: "#d97706",
  amberLight: "#fef3c7",
  purple: "#7c3aed",
  cyan: "#0891b2",
  gray50: "#f9fafb",
  gray100: "#f3f4f6",
  gray200: "#e5e7eb",
  gray300: "#d1d5db",
  gray400: "#9ca3af",
  gray500: "#6b7280",
  gray600: "#4b5563",
  gray700: "#374151",
  gray800: "#1f2937",
  gray900: "#111827",
  white: "#ffffff",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@400;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body { font-family: 'Syne', sans-serif; background: #f0f4f8; color: ${G.gray800}; }

  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: ${G.gray100}; }
  ::-webkit-scrollbar-thumb { background: ${G.gray300}; border-radius: 3px; }

  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes slideIn { from { opacity:0; transform: translateX(100%); } to { opacity:1; transform: translateX(0); } }
  @keyframes fadeUp { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform: translateY(0); } }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.5; } }

  .nav-item { transition: all .2s; }
  .nav-item:hover { background: rgba(37,99,235,.08) !important; color: ${G.blue} !important; }
  .nav-item:hover .nav-icon { color: ${G.blue} !important; }

  .sidebar-link { display:flex; align-items:center; gap:10px; padding:10px 16px; border-radius:8px;
    color: ${G.gray600}; cursor:pointer; font-weight:600; font-size:.9rem; transition:all .2s; }
  .sidebar-link:hover, .sidebar-link.active { background:${G.blueLight}; color:${G.blue}; }

  .stat-card { animation: fadeUp .4s ease both; }
  .stat-card:nth-child(2) { animation-delay:.05s; }
  .stat-card:nth-child(3) { animation-delay:.1s; }
  .stat-card:nth-child(4) { animation-delay:.15s; }

  .btn-action { transition: all .2s; }
  .btn-action:hover { transform: translateY(-1px); filter: brightness(1.1); }

  .grid-row:hover { background: ${G.blueLight} !important; }

  .challan-row:nth-child(even) { background: ${G.gray50}; }
  .challan-row:hover { background: ${G.blueLight} !important; }

  input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: ${G.blue} !important;
    box-shadow: 0 0 0 3px rgba(37,99,235,.15);
  }

  @media (max-width: 900px) {
    .sidebar-wrapper { transform: translateX(-100%); position:fixed !important; z-index:200; transition:.3s; }
    .sidebar-wrapper.open { transform: translateX(0); }
    .main-grid { grid-template-columns: 1fr !important; }
  }
`;

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ toasts }) => (
  <div style={{ position:"fixed", top:16, right:16, zIndex:9999, display:"flex", flexDirection:"column", gap:8 }}>
    {toasts.map(t => (
      <div key={t.id} style={{
        padding:"12px 20px", borderRadius:8, color:"#fff", fontWeight:600, fontSize:".9rem",
        background: t.type==="success" ? G.green : G.red,
        boxShadow:"0 4px 16px rgba(0,0,0,.15)", animation:"slideIn .3s ease-out", minWidth:220
      }}>
        {t.type==="success" ? "✓" : "✕"} {t.message}
      </div>
    ))}
  </div>
);

// ─── Sidebar ──────────────────────────────────────────────────────────────────
// const NAV_ITEMS = [
//   { icon:"🏠", label:"Dashboard", active:true },
//   { icon:"📋", label:"Delivery Challans" },
//   { icon:"🏭", label:"Store" },
//   { icon:"🔩", label:"Assembly" },
//   { icon:"📦", label:"Inventory" },
//   { icon:"👥", label:"Vendors" },
//   { icon:"📊", label:"Reports" },
//   { icon:"⚙️", label:"Settings" },
// ];

// const Sidebar = ({ open }) => (
//   <aside className={`sidebar-wrapper${open ? " open" : ""}`} style={{
//     width:220, background:G.white, borderRight:`1px solid ${G.gray200}`,
//     minHeight:"calc(100vh - 60px)", padding:"16px 12px",
//     display:"flex", flexDirection:"column", gap:4
//   }}>
//     {NAV_ITEMS.map((n, i) => (
//       <div key={i} className={`sidebar-link${n.active ? " active" : ""}`}>
//         <span style={{ fontSize:"1.1rem" }}>{n.icon}</span>
//         <span>{n.label}</span>
//       </div>
//     ))}
//   </aside>
// );

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, color, bg, delay }) => (
  <div className="stat-card" style={{
    background:G.white, borderRadius:12, padding:"20px",
    border:`1px solid ${G.gray200}`, boxShadow:"0 2px 8px rgba(0,0,0,.04)",
    display:"flex", alignItems:"center", gap:16, animationDelay:`${delay}s`
  }}>
    <div style={{
      width:52, height:52, background:bg, borderRadius:12,
      display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.5rem"
    }}>{icon}</div>
    <div>
      <p style={{ color:G.gray500, fontSize:".85rem", fontWeight:600, marginBottom:4 }}>{label}</p>
      <p style={{ color:G.gray900, fontSize:"1.75rem", fontWeight:800, fontFamily:"'DM Mono',monospace" }}>{value}</p>
    </div>
  </div>
);

// ─── Project Table ────────────────────────────────────────────────────────────
const STATUS_MAP = {
  Developing: { bg:G.blueLight, color:G.blue },
  Inprogress: { bg:G.greenLight, color:G.green },
  Pending: { bg:G.redLight, color:G.red },
  Approved: { bg:G.greenLight, color:G.green },
};

const PROJECTS = [
  { id:562, name:"S-18-024-TPL", status:"Developing", progress:"Assigned Mode" },
  { id:563, name:"S-18-025-TPL", status:"Inprogress", progress:"File Received" },
  { id:564, name:"S-18-028-SPG", status:"Pending", progress:"Ready To Complete" },
  { id:565, name:"S-18-032-MKL", status:"Developing", progress:"Assigned Mode" },
  { id:568, name:"S-18-036-VSK", status:"Approved", progress:"File Received" },
];

const TASKS = [
  { color:G.green, date:"10:50", desc:<>Call to customer <b style={{color:G.blue}}>Cipla</b></> },
  { color:G.red, date:"Thu, 27 Dec", desc:<><b style={{color:G.blue}}>Varun</b> assigned you a task to <b style={{color:G.blue}}>Design</b></> },
  { color:G.blue, date:"Mon, 31 Dec", desc:<>Dispatch Lupin D1</> },
  { color:G.red, date:"Fri, 02 Jan", desc:<>Approved <b style={{color:G.blue}}>Design</b></> },
  { color:G.blue, date:"Wed, 10 Jan", desc:<>Site Inspection At Baddi</> },
];

const ProjectTable = () => (
  <div style={{ background:G.white, borderRadius:12, border:`1px solid ${G.gray200}`, overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,.04)" }}>
    <div style={{ padding:"16px 20px", borderBottom:`1px solid ${G.gray200}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
      <h3 style={{ fontWeight:700, fontSize:"1rem", color:G.gray800 }}>Project Status</h3>
      <span style={{ fontSize:".8rem", color:G.gray400, fontWeight:600 }}>{PROJECTS.length} projects</span>
    </div>
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:".875rem" }}>
        <thead>
          <tr style={{ background:G.gray50 }}>
            {["ID","Project","Status","Progress"].map(h => (
              <th key={h} style={{ padding:"10px 16px", textAlign:"left", fontWeight:700, color:G.gray500, fontSize:".8rem", whiteSpace:"nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PROJECTS.map((p, i) => {
            const s = STATUS_MAP[p.status] || {};
            return (
              <tr key={i} className="challan-row" style={{ borderTop:`1px solid ${G.gray100}` }}>
                <td style={{ padding:"12px 16px", fontFamily:"'DM Mono',monospace", fontWeight:600, color:G.gray600, fontSize:".85rem" }}>{p.id}</td>
                <td style={{ padding:"12px 16px", fontWeight:600, color:G.gray800 }}>{p.name}</td>
                <td style={{ padding:"12px 16px" }}>
                  <span style={{ padding:"3px 10px", borderRadius:20, background:s.bg, color:s.color, fontWeight:700, fontSize:".78rem" }}>{p.status}</span>
                </td>
                <td style={{ padding:"12px 16px", color:G.gray500, fontSize:".85rem" }}>{p.progress}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

const TaskList = () => (
  <div style={{ background:G.white, borderRadius:12, border:`1px solid ${G.gray200}`, boxShadow:"0 2px 8px rgba(0,0,0,.04)" }}>
    <div style={{ padding:"16px 20px", borderBottom:`1px solid ${G.gray100}` }}>
      <h3 style={{ fontWeight:700, fontSize:"1rem", color:G.gray800 }}>Tasks</h3>
    </div>
    <div style={{ padding:"8px 16px 16px" }}>
      {TASKS.map((t, i) => (
        <div key={i} style={{ display:"flex", gap:12, padding:"10px 0", borderBottom: i<TASKS.length-1 ? `1px solid ${G.gray100}` : "none" }}>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", paddingTop:2 }}>
            <div style={{ width:10, height:10, borderRadius:"50%", background:t.color, flexShrink:0 }} />
            {i<TASKS.length-1 && <div style={{ width:1, flex:1, background:G.gray200, margin:"4px 0" }} />}
          </div>
          <div>
            <p style={{ fontSize:".78rem", color:G.gray400, fontWeight:600, marginBottom:2 }}>{t.date}</p>
            <p style={{ fontSize:".88rem", color:G.gray600 }}>{t.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Challan Detail Page ──────────────────────────────────────────────────────
const labelStyle = { display:"block", marginBottom:6, fontWeight:600, fontSize:".85rem", color:G.gray700 };
const inputStyle = {
  width:"100%", padding:"9px 12px", border:`1px solid ${G.gray300}`, borderRadius:8,
  fontSize:".9rem", outline:"none", boxSizing:"border-box", fontFamily:"'Syne',sans-serif"
};
const hdrStyle = { padding:"11px 10px", color:"#fff", fontWeight:700, textAlign:"center", border:`1px solid rgba(255,255,255,.15)`, fontSize:".82rem" };
const cellSt = { padding:"8px 10px", border:`1px solid ${G.gray200}`, textAlign:"center" };
const tblInput = { width:"100%", padding:"5px 8px", border:`1px solid ${G.gray300}`, borderRadius:5, fontSize:".88rem", outline:"none", boxSizing:"border-box" };

const ChallanDetailPage = ({ vendorId, fileId, dcId, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [challanData, setChallanData] = useState({ dcNumber:"", date:"", gstin:"", fileName:"", customerName:"", address:"" });
  const [items, setItems] = useState([]);
  const [apiTotals, setApiTotals] = useState(null);
  const [formData, setFormData] = useState({ despatchDate:"", entryNo:"", receiptDate:"", quantityDespatched:"", processingNature:"", wasteQtySupplier:"", wasteQtyWorker:"", goodsDescription:"", valueAmount:"" });

  useEffect(() => {
    const load = async () => {
      if (!vendorId || !fileId || !dcId) { setLoading(false); return; }
      try {
        const res = await fetch(`https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/getAsslyDeliveryChallanFullApi.php?vendor=${vendorId}&file=${fileId}&dc_id=${dcId}`);
        const data = await res.json();
        if (data.status && data.header) {
          setChallanData({ dcNumber:data.header.dc_no||"", date:data.header.dc_date||"", gstin:(data.header.gst_no||"").trim(), fileName:data.header.file_name||"", customerName:data.header.vendor_name||"", address:data.header.address||"" });
          if (data.items?.length) {
            setItems(data.items.map((it, i) => ({
              id:i+1, srNo:i+1, description:it.material||"", assemblyName:it.assembly||"",
              hsn:it.hsn||"", quantity:it.qty||"", unit:"NOS", kg:it.kg||"",
              approxValue:it.basic_value||it.approx_value||"", tax:it.gst||"18"
            })));
          }
          if (data.totals && data.summary) {
            setApiTotals({ totalQty:data.totals.total_qty||0, totalKg:data.totals.total_kg||0, totalTax:data.totals.total_tax||0, basicValue:data.summary.total_basic_value||0, taxValue:data.summary.tax_value||0, grandValue:data.summary.grand_value||0 });
          }
        }
      } catch(e) { console.error(e); } finally { setLoading(false); }
    };
    load();
  }, [dcId, vendorId, fileId]);

  const totals = apiTotals || (() => {
    const totalQty = items.reduce((s,it) => s+(parseFloat(it.quantity)||0), 0);
    const totalKg = items.reduce((s,it) => s+(parseFloat(it.kg)||0), 0);
    const basicValue = items.reduce((s,it) => s+(parseFloat(it.approxValue)||0), 0);
    const taxValue = items.reduce((s,it) => { const v=parseFloat(it.approxValue)||0; return s+(v*(parseFloat(it.tax)||0)/100); }, 0);
    return { totalQty, totalKg, totalTax:taxValue, basicValue, taxValue, grandValue:basicValue+taxValue };
  })();

  const fmt = v => parseFloat(v).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2});

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:400 }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:40, height:40, border:`4px solid ${G.blueLight}`, borderTopColor:G.blue, borderRadius:"50%", animation:"spin 1s linear infinite", margin:"0 auto 12px" }} />
        <p style={{ fontWeight:600, color:G.gray600 }}>Loading challan details…</p>
      </div>
    </div>
  );

  return (
    <div style={{ animation:"fadeUp .4s ease" }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:10 }}>
        <div>
          <h2 style={{ fontWeight:800, fontSize:"1.4rem", color:G.gray900 }}>Delivery Challan for Job Work</h2>
          <p style={{ color:G.gray500, fontSize:".85rem", marginTop:4 }}>DC: {dcId} | File: {fileId} | Vendor: {vendorId}</p>
        </div>
        <button className="btn-action" onClick={onBack} style={{
          padding:"10px 20px", background:G.white, color:G.blue, border:`2px solid ${G.blue}`,
          borderRadius:8, cursor:"pointer", fontWeight:700, fontFamily:"'Syne',sans-serif"
        }}>← Back to List</button>
      </div>

      {/* Info Section */}
      <div style={{ background:G.white, borderRadius:12, border:`1px solid ${G.gray200}`, padding:20, marginBottom:20 }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:15, marginBottom:15 }}>
          {[
            { label:"D.C. No.", value:challanData.dcNumber, readOnly:true, style:{ background:G.amberLight, fontWeight:700, color:G.amber } },
            { label:"Date", type:"date", value:challanData.date, onChange:v=>setChallanData(p=>({...p,date:v})) },
            { label:"GSTIN", value:challanData.gstin, onChange:v=>setChallanData(p=>({...p,gstin:v})), placeholder:"27AAECS4252M1Z1" },
          ].map((f,i) => (
            <div key={i}>
              <label style={labelStyle}>{f.label}</label>
              <input type={f.type||"text"} value={f.value} readOnly={f.readOnly} placeholder={f.placeholder}
                onChange={f.onChange ? e=>f.onChange(e.target.value) : undefined}
                style={{...inputStyle, ...(f.style||{}), ...(f.readOnly?{cursor:"not-allowed"}:{})}} />
            </div>
          ))}
        </div>
        <div style={{ background:G.blueLight, borderRadius:8, padding:14 }}>
          <p style={{ fontWeight:700, color:G.blueDark, fontSize:"1rem" }}>Surya Equipments Pvt. Ltd.</p>
          <p style={{ color:G.blue, fontSize:".85rem", marginTop:4 }}>B-39, M.I.D.C, Gokul Shirgaon, Kolhapur-416234</p>
        </div>
        <div style={{ marginTop:14 }}>
          <p style={{ fontWeight:600, color:G.gray500, fontSize:".82rem" }}>File: {challanData.fileName}</p>
          <p style={{ fontWeight:700, color:G.gray800, fontSize:"1rem", marginTop:4 }}>To: {challanData.customerName}</p>
          {challanData.address && <p style={{ color:G.gray500, fontSize:".88rem", marginTop:4 }}>{challanData.address}</p>}
        </div>
      </div>

      {/* Material Table */}
      <div style={{ background:G.white, borderRadius:12, border:`1px solid ${G.gray200}`, overflow:"hidden", marginBottom:20 }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", minWidth:820 }}>
            <thead>
              <tr style={{ background:`linear-gradient(135deg,${G.blue},${G.blueDark})` }}>
                {["Sr","Description","Assembly","HSN","Qty","Unit","Kg","Approx Value","Tax %"].map(h=>(
                  <th key={h} style={hdrStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={it.id} className="challan-row" style={{ background: i%2===0 ? G.white : G.gray50 }}>
                  <td style={cellSt}><span style={{ fontWeight:700, color:G.gray700, fontFamily:"'DM Mono',monospace" }}>{it.srNo}</span></td>
                  {["description","assemblyName","hsn"].map(f => (
                    <td key={f} style={cellSt}><input type="text" value={it[f]} readOnly style={{...tblInput,background:G.gray100,cursor:"not-allowed"}} /></td>
                  ))}
                  <td style={cellSt}><input type="number" value={it.quantity} readOnly style={{...tblInput,background:G.gray100,cursor:"not-allowed"}} /></td>
                  <td style={cellSt}>
                    <select value={it.unit} onChange={e=>setItems(p=>p.map(x=>x.id===it.id?{...x,unit:e.target.value}:x))} style={tblInput}>
                      {["NOS","KG","MTR","PCS"].map(u=><option key={u}>{u}</option>)}
                    </select>
                  </td>
                  {["kg","approxValue","tax"].map(f => (
                    <td key={f} style={cellSt}><input type="number" value={it[f]} readOnly style={{...tblInput,background:G.gray100,cursor:"not-allowed"}} /></td>
                  ))}
                </tr>
              ))}
              <tr style={{ background:G.gray100, fontWeight:700 }}>
                <td colSpan={4} style={{...cellSt, fontWeight:700, color:G.gray700, textAlign:"center"}}>TOTAL</td>
                <td style={{...cellSt, color:G.blue, fontFamily:"'DM Mono',monospace", fontWeight:800}}>{totals.totalQty}</td>
                <td style={cellSt}></td>
                <td style={{...cellSt, color:G.blue, fontFamily:"'DM Mono',monospace", fontWeight:800}}>{parseFloat(totals.totalKg).toFixed(2)}</td>
                <td colSpan={2} style={cellSt}></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:15, marginBottom:20 }}>
        {[
          { label:"Total Basic Value", value:`₹ ${fmt(totals.basicValue)}`, color:G.gray800, bg:G.gray50 },
          { label:"Total Tax (CGST+SGST)", value:`₹ ${fmt(totals.totalTax)}`, color:G.blue, bg:G.blueLight },
          { label:"Grand Value", value:`₹ ${fmt(totals.grandValue)}`, color:G.green, bg:G.greenLight },
        ].map((c,i) => (
          <div key={i} style={{ background:c.bg, borderRadius:12, padding:20, border:`1px solid ${G.gray200}`, textAlign:"center" }}>
            <p style={{ color:G.gray500, fontSize:".82rem", fontWeight:600 }}>{c.label}</p>
            <p style={{ color:c.color, fontSize:"1.4rem", fontWeight:800, fontFamily:"'DM Mono',monospace", marginTop:6 }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Computer Generated Note */}
      <div style={{ background:G.amberLight, border:`1px dashed ${G.amber}`, borderRadius:8, padding:14, textAlign:"center", marginBottom:20 }}>
        <p style={{ fontWeight:700, color:G.amber, fontSize:".9rem" }}>THIS IS COMPUTER GENERATED DC HENCE SIGNATURE NOT REQUIRED</p>
        <p style={{ color:G.amber, fontSize:".82rem", marginTop:4 }}>Finished Goods Ordered for conversion as per our instructions.</p>
      </div>

      {/* Job Worker Section */}
      <div style={{ background:G.redLight, border:`2px solid ${G.red}`, borderRadius:12, padding:20, marginBottom:24 }}>
        <h4 style={{ textAlign:"center", color:G.red, fontWeight:800, fontSize:"1rem", marginBottom:16 }}>
          TO BE FILLED IN BY THE JOB WORKER IN ORIGINAL & DUPLICATE
        </h4>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:14 }}>
          {[
            { label:"1. Date of despatch", type:"date", key:"despatchDate" },
            { label:"Entry No.", key:"entryNo", placeholder:"Entry No." },
            { label:"Receipt Date in Account", type:"date", key:"receiptDate" },
            { label:"2. Quantity despatched", key:"quantityDespatched" },
            { label:"4. Waste returned to supplier", key:"wasteQtySupplier" },
            { label:"5. Waste retained by job worker", key:"wasteQtyWorker" },
            { label:"7. Value / Amount cleared", type:"number", key:"valueAmount" },
          ].map(f => (
            <div key={f.key}>
              <label style={labelStyle}>{f.label}</label>
              <input type={f.type||"text"} value={formData[f.key]} placeholder={f.placeholder}
                onChange={e=>setFormData(p=>({...p,[f.key]:e.target.value}))} style={{...inputStyle,background:G.white}} />
            </div>
          ))}
        </div>
        {[
          { label:"3. Nature of processing / manufacturing done", key:"processingNature" },
          { label:"6. Description & quantity of goods manufactured", key:"goodsDescription" },
        ].map(f => (
          <div key={f.key} style={{ marginTop:14 }}>
            <label style={labelStyle}>{f.label}</label>
            <textarea value={formData[f.key]} onChange={e=>setFormData(p=>({...p,[f.key]:e.target.value}))}
              rows={2} style={{...inputStyle,background:G.white,resize:"vertical"}} />
          </div>
        ))}

        <div style={{ background:G.white, borderRadius:8, padding:12, textAlign:"center", marginTop:16, fontSize:".85rem", color:G.gray600 }}>
          Certified that I/We have received the goods under this challan and the same has been accounted for in the accounts book.
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:12, marginTop:14 }}>
          {["Place:","Date:","Name of factory:","Address:"].map((l,i) => (
            <div key={i}><label style={labelStyle}>{l}</label><input style={{...inputStyle,background:G.white}} type={l==="Date:" ? "date" : "text"} /></div>
          ))}
        </div>
        <p style={{ textAlign:"right", fontSize:".82rem", fontStyle:"italic", color:G.red, marginTop:12 }}>
          Signature with Rubber Stamp of Processor / Job worker & authorised agent
        </p>
      </div>

      {/* Submit */}
      <div style={{ textAlign:"center" }}>
        <button className="btn-action" onClick={() => alert("Challan submitted!")} style={{
          padding:"14px 50px", background:`linear-gradient(135deg,${G.green},#047857)`,
          color:"#fff", border:"none", borderRadius:10, cursor:"pointer",
          fontSize:"1rem", fontWeight:700, fontFamily:"'Syne',sans-serif",
          boxShadow:`0 4px 16px rgba(5,150,105,.3)`
        }}>Submit Challan</button>
      </div>
    </div>
  );
};

// ─── Challan Grid Table ───────────────────────────────────────────────────────
const ChallanGrid = ({ onOpenDetail }) => {
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [financialYear, setFinancialYear] = useState("25-26");
  const [fyOptions, setFyOptions] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const showToast = (msg, type) => {
    // bubble up via parent
  };

  const fetchFY = async () => {
    try {
      const res = await fetch("https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/GetYearsApi.php");
      const data = await res.json();
      if (data.status === "success" && Array.isArray(data.data)) {
        const opts = data.data.map(it => ({ value:it.financial_year, label:`FY 20${it.financial_year}` }));
        setFyOptions(opts);
        if (opts.length) setFinancialYear(opts[opts.length-1].value);
      }
    } catch(e) { console.error(e); }
  };

  const fetchData = async (fy = financialYear) => {
    setLoading(true);
    try {
      const res = await fetch(`https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/DcAssemblyListApi.php?financial_year=${fy}`);
      const data = await res.json();
      if (data.status && Array.isArray(data.data)) setRowData(data.data);
      else setRowData([]);
    } catch(e) { console.error(e); setRowData([]); } finally { setLoading(false); }
  };

  useEffect(() => { fetchFY(); }, []);
  useEffect(() => { if (financialYear) fetchData(); }, [financialYear]);

  const filtered = rowData.filter(r =>
    !search || Object.values(r).some(v => String(v).toLowerCase().includes(search.toLowerCase()))
  );
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page-1)*pageSize, page*pageSize);

  return (
    <div style={{ background:G.white, borderRadius:12, border:`1px solid ${G.gray200}`, overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,.04)" }}>
      {/* Toolbar */}
      <div style={{ padding:"14px 20px", borderBottom:`1px solid ${G.gray200}`, display:"flex", gap:10, flexWrap:"wrap", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <h3 style={{ fontWeight:700, fontSize:"1rem", color:G.gray800 }}>📋 Delivery Challans</h3>
          <span style={{ background:G.blueLight, color:G.blue, padding:"2px 10px", borderRadius:20, fontSize:".78rem", fontWeight:700 }}>{filtered.length}</span>
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Search…" style={{
            padding:"7px 12px", border:`1px solid ${G.gray300}`, borderRadius:8, fontSize:".88rem", outline:"none", fontFamily:"'Syne',sans-serif", width:180
          }} />
          <select value={financialYear} onChange={e=>setFinancialYear(e.target.value)} style={{
            padding:"7px 12px", border:`1px solid ${G.gray300}`, borderRadius:8, fontSize:".88rem", outline:"none", fontFamily:"'Syne',sans-serif", fontWeight:600
          }}>
            {fyOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button className="btn-action" onClick={()=>fetchData()} style={{
            padding:"7px 14px", background:G.blue, color:"#fff", border:"none", borderRadius:8, cursor:"pointer", fontWeight:700, fontFamily:"'Syne',sans-serif", fontSize:".85rem"
          }}>↻ Refresh</button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding:60, textAlign:"center" }}>
          <div style={{ width:36, height:36, border:`3px solid ${G.blueLight}`, borderTopColor:G.blue, borderRadius:"50%", animation:"spin 1s linear infinite", margin:"0 auto 12px" }} />
          <p style={{ color:G.gray500, fontWeight:600 }}>Loading challans…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding:60, textAlign:"center", color:G.gray400 }}>
          <div style={{ fontSize:"3rem", marginBottom:12 }}>📋</div>
          <p style={{ fontWeight:600 }}>No challan data available</p>
        </div>
      ) : (
        <>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:".875rem" }}>
              <thead>
                <tr style={{ background:G.gray50, borderBottom:`2px solid ${G.gray200}` }}>
                  {["#","DC ID","File Name","Customer","Date","Vendor ID","File ID","Action"].map(h => (
                    <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontWeight:700, color:G.gray500, fontSize:".78rem", whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.map((row, i) => (
                  <tr key={i} className="challan-row" style={{ borderTop:`1px solid ${G.gray100}` }}>
                    <td style={{ padding:"11px 14px", color:G.gray400, fontFamily:"'DM Mono',monospace", fontSize:".82rem" }}>{(page-1)*pageSize+i+1}</td>
                    <td style={{ padding:"11px 14px" }}>
                      <span style={{ fontWeight:700, color:G.blue, fontFamily:"'DM Mono',monospace", cursor:"pointer" }}
                        onClick={() => onOpenDetail({ vendorId:row.vendor_id, fileId:row.fileid, dcId:row.dc_id })}>
                        {row.dc_id}
                      </span>
                    </td>
                    <td style={{ padding:"11px 14px", fontWeight:600, color:G.gray800 }}>{row.FILE_NAME}</td>
                    <td style={{ padding:"11px 14px", color:G.gray600 }}>{row.CUSTOMER_NAME}</td>
                    <td style={{ padding:"11px 14px", color:G.gray500, fontFamily:"'DM Mono',monospace", fontSize:".82rem" }}>{row.new_date}</td>
                    <td style={{ padding:"11px 14px" }}>
                      <span style={{ background:G.amberLight, color:G.amber, padding:"2px 8px", borderRadius:6, fontFamily:"'DM Mono',monospace", fontWeight:700, fontSize:".82rem" }}>{row.vendor_id}</span>
                    </td>
                    <td style={{ padding:"11px 14px", color:G.gray500, fontFamily:"'DM Mono',monospace", fontSize:".82rem" }}>{row.fileid}</td>
                    <td style={{ padding:"11px 14px" }}>
                      <button className="btn-action" onClick={() => onOpenDetail({ vendorId:row.vendor_id, fileId:row.fileid, dcId:row.dc_id })} style={{
                        padding:"5px 12px", background:G.blueLight, color:G.blue, border:"none", borderRadius:6,
                        cursor:"pointer", fontWeight:700, fontSize:".8rem", fontFamily:"'Syne',sans-serif"
                      }}>View →</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div style={{ padding:"12px 20px", borderTop:`1px solid ${G.gray100}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
            <p style={{ color:G.gray500, fontSize:".82rem", fontWeight:600 }}>
              Showing {(page-1)*pageSize+1}–{Math.min(page*pageSize, filtered.length)} of {filtered.length}
            </p>
            <div style={{ display:"flex", gap:4 }}>
              {[...Array(totalPages)].map((_,pi) => (
                <button key={pi} onClick={()=>setPage(pi+1)} style={{
                  width:32, height:32, border:`1px solid ${page===pi+1 ? G.blue : G.gray300}`,
                  background: page===pi+1 ? G.blue : G.white,
                  color: page===pi+1 ? "#fff" : G.gray600,
                  borderRadius:6, cursor:"pointer", fontWeight:700, fontSize:".82rem"
                }}>{pi+1}</button>
              )).slice(Math.max(0,page-3), page+2)}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ─── Dashboard Home ───────────────────────────────────────────────────────────
const DashboardHome = ({ onOpenDetail }) => (
  <div style={{ display:"flex", flexDirection:"column", gap:20, animation:"fadeUp .4s ease" }}>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:16 }}>
      <StatCard icon="💰" label="All Earnings" value="30,000" color={G.purple} bg="#ede9fe" delay={0} />
      <StatCard icon="🚀" label="Projects Launched" value="35" color={G.green} bg={G.greenLight} delay={0.05} />
      <StatCard icon="📂" label="Running Projects" value="14" color={G.blue} bg={G.blueLight} delay={0.1} />
      <StatCard icon="📦" label="Upcoming Delivery" value="48" color={G.amber} bg={G.amberLight} delay={0.15} />
    </div>
    <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:16 }} className="main-grid">
      <ProjectTable />
      <TaskList />
    </div>
    <ChallanGrid onOpenDetail={onOpenDetail} />
  </div>
);

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [detailPage, setDetailPage] = useState(null);
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type="success") => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
  };

  return (
    <>
      <style>{css}</style>
      <Toast toasts={toasts} />
      <div style={{ display:"flex", minHeight:"100vh" }}>
        {/* <Sidebar open={sidebarOpen} /> */}
        <main style={{ flex:1, padding:24, overflowX:"hidden", background:"#f0f4f8" }}>
          {detailPage ? (
            <ChallanDetailPage
              vendorId={detailPage.vendorId}
              fileId={detailPage.fileId}
              dcId={detailPage.dcId}
              onBack={() => setDetailPage(null)}
            />
          ) : (
            <DashboardHome onOpenDetail={d => setDetailPage(d)} />
          )}
        </main>
      </div>
    </>
  );
}