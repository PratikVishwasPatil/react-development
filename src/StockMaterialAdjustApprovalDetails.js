import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// ─── Confirmation Modal ────────────────────────────────────────────────────────
const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, type }) => {
    if (!isOpen) return null;
    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{
                background: '#fff', borderRadius: 10, padding: '2rem',
                maxWidth: 420, width: '90%',
                boxShadow: '0 8px 32px rgba(0,0,0,0.25)'
            }}>
                <div style={{ fontSize: 36, textAlign: 'center', marginBottom: 8 }}>
                    {type === 'approve' ? '✅' : '❌'}
                </div>
                <h5 style={{ textAlign: 'center', margin: '0 0 8px', fontWeight: 700, color: '#212529' }}>{title}</h5>
                <p style={{ textAlign: 'center', color: '#6c757d', fontSize: 14, marginBottom: '1.5rem' }}>{message}</p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                    <button onClick={onCancel} style={{
                        padding: '8px 20px', borderRadius: 5, border: '1px solid #dee2e6',
                        background: '#fff', cursor: 'pointer', fontSize: 13, color: '#495057'
                    }}>Cancel</button>
                    <button onClick={onConfirm} style={{
                        padding: '8px 20px', borderRadius: 5, border: 'none',
                        background: type === 'approve' ? '#28a745' : '#dc3545',
                        color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700
                    }}>
                        {type === 'approve' ? 'Yes, Approve' : 'Yes, Reject'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Toast Notification ────────────────────────────────────────────────────────
const Toast = ({ toast }) => {
    if (!toast) return null;
    const color = toast.type === 'success' ? '#28a745' : '#dc3545';
    return (
        <div style={{
            position: 'fixed', top: 24, right: 24, zIndex: 99999,
            background: color, color: '#fff',
            padding: '12px 24px', borderRadius: 8,
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            fontSize: 14, fontWeight: 600,
            animation: 'slideIn 0.3s ease'
        }}>
            {toast.type === 'success' ? '✅' : '❌'} {toast.message}
            <style>{`@keyframes slideIn { from { transform: translateX(60px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
        </div>
    );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const MaterialAdjustApprovalPage = () => {

    // ── Read fileId from URL: /project/stockMaterialAdjustApprovalDetails/:fileId
    const { fileId } = useParams();
    const navigate   = useNavigate();

    const [rows,       setRows]       = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [modal,      setModal]      = useState(null);   // { type, materialId }
    const [toast,      setToast]      = useState(null);
    const [processing, setProcessing] = useState(false);
    const [fileName,   setFileName]   = useState('');

    const BASE_URL = 'https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api';

    // ── Fetch rows ─────────────────────────────────────────────────────────────
    const fetchRows = async () => {
        if (!fileId) return;
        setLoading(true);
        try {
            const res = await fetch(
                `${BASE_URL}/getMaterialAdjustByFileApi.php?fileId=${fileId}`
            );
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const result = await res.json();
            if (result.status === 'success' && Array.isArray(result.data)) {
                setRows(result.data);
                // Pick file_name from first row if API returns it
                if (result.file_name) setFileName(result.file_name);
            } else {
                setRows([]);
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setRows([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRows(); }, [fileId]);

    // ── Toast helper ───────────────────────────────────────────────────────────
    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // ── Approve / Reject handlers ──────────────────────────────────────────────
    const handleApprove = (materialId) => setModal({ type: 'approve', materialId });
    const handleReject  = (materialId) => setModal({ type: 'reject',  materialId });

    const handleConfirm = async () => {
        const { type, materialId } = modal;
        setModal(null);
        setProcessing(true);

        const url = type === 'approve'
            ? `${BASE_URL}/MaterialAdjustApprovalApi.php`
            : `${BASE_URL}/MaterialAdjustRejectApi.php`;

        try {
            const formData = new FormData();
            formData.append('id', materialId);

            const res    = await fetch(url, { method: 'POST', body: formData });
            const result = await res.json();

            if (result.result === 'success') {
                showToast(
                    type === 'approve'
                        ? 'Material Adjustment Approved successfully!'
                        : 'Material Adjustment Rejected successfully!',
                    'success'
                );
                fetchRows();
            } else {
                throw new Error(result.message || 'Operation failed');
            }
        } catch (err) {
            console.error(err);
            showToast('Error: ' + err.message, 'error');
        } finally {
            setProcessing(false);
        }
    };

    // ── Status badge ───────────────────────────────────────────────────────────
    const StatusBadge = ({ status }) => {
        const map = {
            '0': { label: 'Pending',  bg: '#fff3cd', color: '#856404', border: '#ffc107' },
            '1': { label: 'Approved', bg: '#d4edda', color: '#155724', border: '#28a745' },
            '2': { label: 'Rejected', bg: '#f8d7da', color: '#721c24', border: '#dc3545' },
        };
        const s = map[String(status)] || map['0'];
        return (
            <span style={{
                display: 'inline-block', padding: '3px 10px', borderRadius: 12,
                fontSize: 11, fontWeight: 700,
                background: s.bg, color: s.color, border: `1px solid ${s.border}`
            }}>{s.label}</span>
        );
    };

    // ── Guard: no fileId ───────────────────────────────────────────────────────
    if (!fileId) {
        return (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#dc3545' }}>
                ❌ No File ID found in URL. Expected format:
                <br /><code>/project/stockMaterialAdjustApprovalDetails/:fileId</code>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f8f9ff 0%, #e6f3ff 100%)',
            padding: 0, margin: 0
        }}>
            <Toast toast={toast} />

            <ConfirmModal
                isOpen={!!modal}
                type={modal?.type}
                title={modal?.type === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
                message={
                    modal?.type === 'approve'
                        ? 'Are you sure you want to approve this material adjustment?'
                        : 'Are you sure you want to reject this material adjustment? This cannot be undone.'
                }
                onConfirm={handleConfirm}
                onCancel={() => setModal(null)}
            />

            <div style={{ backgroundColor: '#fff', border: '1px solid #dee2e6', margin: 0, borderRadius: 0 }}>

                {/* ── Header ── */}
                <div style={{
                    background: 'linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%)',
                    padding: '1rem 2rem',
                    borderBottom: '1px solid #dee2e6',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {/* ── Back button uses navigate(-1) to go to previous page ── */}
                        <button
                            onClick={() => navigate(-1)}
                            style={{
                                background: '#6c757d', color: 'white', border: 'none',
                                borderRadius: 4, padding: '6px 14px',
                                fontSize: 12, cursor: 'pointer', fontWeight: 'bold'
                            }}
                        >
                            ← Back
                        </button>
                        <div>
                            <h4 style={{ margin: 0, fontSize: 16 }}>Material Replace / Adjustment</h4>
                            <small style={{ opacity: 0.7 }}>
                                {fileName && <><strong>{fileName}</strong> &nbsp;|&nbsp;</>}
                                File ID: <strong>{fileId}</strong>
                            </small>
                        </div>
                    </div>
                    <button
                        onClick={fetchRows}
                        style={{
                            padding: '6px 12px', fontSize: 12, background: '#17a2b8',
                            color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer'
                        }}
                    >
                        🔄 Refresh
                    </button>
                </div>

                {/* ── Body ── */}
                <div style={{ padding: '16px', overflowX: 'auto' }}>
                    {loading ? (
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: '4rem', flexDirection: 'column', gap: 12
                        }}>
                            <div style={{
                                width: 40, height: 40,
                                border: '4px solid #f3f3f3',
                                borderTop: '4px solid #007bff',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }}></div>
                            <span style={{ fontSize: 13, color: '#6c757d' }}>Loading material adjustments...</span>
                            <style>{`@keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }`}</style>
                        </div>
                    ) : rows.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#6c757d', fontSize: 14 }}>
                            📭 No material adjustments found for File ID: <strong>{fileId}</strong>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 900 }}>
                            <thead>
                                <tr>
                                    {[
                                        'SR.NO.',
                                        'Req. Stock Material Name',
                                        'Qty',
                                        'Adjust Material Name',
                                        'Qty',
                                        'Leftover Material Name',
                                        'Qty',
                                        'Comment',
                                        'Status',
                                        'Action'
                                    ].map((h, i) => (
                                        <th key={i} style={{
                                            background: '#bddff7',
                                            border: '1px solid #74797d',
                                            padding: '6px 8px',
                                            fontWeight: 700,
                                            textAlign: 'center',
                                            whiteSpace: 'nowrap',
                                            fontSize: 11
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, idx) => (
                                    <tr key={idx} style={{ background: idx % 2 === 0 ? '#ffffff' : '#f0f5f7' }}>
                                        <td style={tdStyle}>{idx + 1}</td>
                                        <td style={tdStyle}>{row.req_material_name        || '-'}</td>
                                        <td style={{ ...tdStyle, textAlign: 'center' }}>{row.req_qty             || '-'}</td>
                                        <td style={tdStyle}>{row.adjust_material_name     || '-'}</td>
                                        <td style={{ ...tdStyle, textAlign: 'center' }}>{row.adjust_qty          || '-'}</td>
                                        <td style={tdStyle}>{row.leftover_material_name   || '-'}</td>
                                        <td style={{ ...tdStyle, textAlign: 'center' }}>{row.leftover_qty        || '-'}</td>
                                        <td style={tdStyle}>{row.comment                  || '-'}</td>
                                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                                            <StatusBadge status={row.project_approval_status} />
                                        </td>
                                        <td style={{ ...tdStyle, textAlign: 'center', whiteSpace: 'nowrap' }}>
                                            {String(row.project_approval_status) === '0' ? (
                                                <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                                                    <button
                                                        disabled={processing}
                                                        onClick={() => handleApprove(row.material_id)}
                                                        style={{
                                                            background: '#28a745', color: '#fff',
                                                            border: 'none', borderRadius: 4,
                                                            padding: '4px 10px', fontSize: 10,
                                                            cursor: processing ? 'not-allowed' : 'pointer',
                                                            fontWeight: 700, opacity: processing ? 0.7 : 1
                                                        }}
                                                    >✔ Approve</button>
                                                    <button
                                                        disabled={processing}
                                                        onClick={() => handleReject(row.material_id)}
                                                        style={{
                                                            background: '#dc3545', color: '#fff',
                                                            border: 'none', borderRadius: 4,
                                                            padding: '4px 10px', fontSize: 10,
                                                            cursor: processing ? 'not-allowed' : 'pointer',
                                                            fontWeight: 700, opacity: processing ? 0.7 : 1
                                                        }}
                                                    >✖ Reject</button>
                                                </div>
                                            ) : (
                                                <StatusBadge status={row.project_approval_status} />
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* ── Footer ── */}
                <div style={{
                    borderTop: '1px solid #ddd',
                    padding: '10px 20px',
                    fontSize: 12,
                    color: '#6c757d',
                    display: 'flex',
                    justifyContent: 'space-between'
                }}>
                    <span>Total Records: <strong>{rows.length}</strong></span>
                    <span>File ID: <strong>{fileId}</strong></span>
                </div>
            </div>
        </div>
    );
};

const tdStyle = {
    border: '1px solid #74797d',
    padding: '5px 8px',
    color: '#212529',
    fontSize: 11
};

export default MaterialAdjustApprovalPage;