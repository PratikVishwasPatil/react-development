import React, { useEffect, useState } from "react";

const GRNDCAssemblyView = () => {
    const getGrnIdFromUrl = () => {
        const hash = window.location.hash;
        const parts = hash.split('/');
        return parts[parts.length - 1] || '708';
    };

    const [grnId, setGrnId] = useState(getGrnIdFromUrl());
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [approving, setApproving] = useState(false);

    const showToast = (message, type = 'info') => {
        const toastDiv = document.createElement('div');
        toastDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 8px 16px rgba(0,0,0,0.2);
            z-index: 9999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            animation: slideIn 0.3s ease-out;
            max-width: 90%;
        `;
        toastDiv.textContent = message;
        document.body.appendChild(toastDiv);
        
        setTimeout(() => {
            toastDiv.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => document.body.removeChild(toastDiv), 300);
        }, 3000);
    };

    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(400px); opacity: 0; }
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            * {
                box-sizing: border-box;
            }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    const fetchGRNDetails = async () => {
        if (!grnId) return;

        setLoading(true);
        try {
            const response = await fetch(
                `http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/grndcAsslyDetailsApi.php?grn_id=${grnId}`,
                { method: "GET", headers: { "Content-Type": "application/json" } }
            );

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const result = await response.json();

            if (result.status === 'success' && result.data) {
                setData(result.data);
                showToast('GRN DC Assembly details loaded successfully', 'success');
            } else {
                showToast('Failed to load GRN details', 'error');
            }
        } catch (error) {
            console.error("Error fetching GRN details:", error);
            showToast(`Error: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (grnId) {
            fetchGRNDetails();
        }
    }, [grnId]);

    const handleApproval = async () => {
        if (!data || !data.items || data.items.length === 0) {
            showToast('No items to approve', 'error');
            return;
        }

        // Confirm before approval
        if (!window.confirm('Are you sure you want to approve this GRN for inward material?')) {
            return;
        }

        setApproving(true);

        try {
            // Prepare form data
            const formData = new FormData();
            formData.append('SAVE', '1');
            formData.append('grn_id', data.grn_details?.grn_no || grnId);
            formData.append('grn_date', data.grn_details?.grn_date || '');
            formData.append('po_id', data.po_details?.po_id || '');
            formData.append('employee_id', 'susham'); // Replace with actual employee ID if available

            // Add material IDs and inward quantities as arrays
            data.items.forEach((item, index) => {
                formData.append(`materil_id[${index}]`, item.material_id || '');
                formData.append(`inward_qty[${index}]`, item.inward_qty || '0');
            });

            const response = await fetch(
                'http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/saveAsslyApproveApi.php',
                {
                    method: 'POST',
                    body: formData
                }
            );

            const result = await response.json();

            if (result.status === true || result.status === 'success') {
                showToast(result.message || 'GRN approved successfully!', 'success');
                // Refresh the data after approval
                setTimeout(() => {
                    fetchGRNDetails();
                }, 1500);
            } else {
                showToast(result.message || 'Failed to approve GRN', 'error');
            }
        } catch (error) {
            console.error('Error approving GRN:', error);
            showToast(`Error: ${error.message}`, 'error');
        } finally {
            setApproving(false);
        }
    };

    const fieldStyle = {
        display: 'flex',
        marginBottom: '12px',
        fontSize: '0.9rem'
    };

    const labelStyle = {
        fontWeight: '600',
        minWidth: '140px',
        color: '#333',
        display: 'flex',
        alignItems: 'center'
    };

    const valueStyle = {
        color: '#666',
        flex: 1
    };

    const cardStyle = {
        border: '1px solid #e0e0e0',
        padding: '20px',
        backgroundColor: '#fafafa',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
    };

    if (loading && !data) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f5f5f5'
            }}>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                        width: '50px', 
                        height: '50px', 
                        border: '5px solid #f3f3f3',
                        borderTop: '5px solid #ff6600',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto'
                    }}></div>
                    <p style={{ marginTop: '1.5rem', color: '#666', fontSize: '1rem', fontWeight: '500' }}>Loading GRN DC Assembly Details...</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f5f5f5'
            }}>
                <div style={{ textAlign: 'right', padding: '40px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📦</div>
                    <p style={{ color: '#666', fontSize: '1.1rem' }}>No GRN data available</p>
                </div>
            </div>
        );
    }

    const { grn_details, supplier_details, po_details, items, totals } = data;

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f5f5f5',
            padding: '10px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto', animation: 'fadeIn 0.5s ease' }}>
                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #ff6600 0%, #ff8533 100%)',
                    color: 'white',
                    padding: '16px 24px',
                    borderRadius: '12px 12px 0 0',
                    marginBottom: '0',
                    boxShadow: '0 4px 12px rgba(255, 102, 0, 0.2)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h4 style={{ 
                        margin: 0, 
                        fontSize: 'clamp(1rem, 3vw, 1.3rem)', 
                        fontWeight: '600',
                        letterSpacing: '0.5px'
                    }}>
                        📦 GRN DC Assembly Details
                    </h4>
                </div>

                {/* Main Container */}
                <div style={{
                    backgroundColor: 'white',
                    border: '1px solid #e0e0e0',
                    borderTop: 'none',
                    borderRadius: '0 0 12px 12px',
                    padding: 'clamp(15px, 3vw, 25px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                }}>
                    {/* Two Column Layout */}
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                        gap: '20px', 
                        marginBottom: '20px' 
                    }}>
                        {/* Left Column - Vendor Info */}
                        <div style={cardStyle}>
                            <h5 style={{ 
                                margin: '0 0 15px 0', 
                                fontSize: '1rem', 
                                color: '#ff6600', 
                                borderBottom: '2px solid #ff6600',
                                paddingBottom: '8px',
                                fontWeight: '600'
                            }}>
                                Vendor Information
                            </h5>
                            <div style={fieldStyle}>
                                <span style={labelStyle}>Vendor Name :</span>
                                <span style={valueStyle}>{supplier_details?.supplier_name || '-'}</span>
                            </div>
                            <div style={fieldStyle}>
                                <span style={labelStyle}>Challan No :</span>
                                <span style={valueStyle}>{grn_details?.challan_no || '-'}</span>
                            </div>
                            <div style={fieldStyle}>
                                <span style={labelStyle}>Challan Date :</span>
                                <span style={valueStyle}>{grn_details?.challan_date || '-'}</span>
                            </div>
                            <div style={fieldStyle}>
                                <span style={labelStyle}>GST No :</span>
                                <span style={valueStyle}>{supplier_details?.gst_no || '-'}</span>
                            </div>
                        </div>

                        {/* Right Column - GRN Info */}
                        <div style={cardStyle}>
                            <h5 style={{ 
                                margin: '0 0 15px 0', 
                                fontSize: '1rem', 
                                color: '#ff6600', 
                                borderBottom: '2px solid #ff6600',
                                paddingBottom: '8px',
                                fontWeight: '600'
                            }}>
                                GRN Details
                            </h5>
                            <div style={fieldStyle}>
                                <span style={labelStyle}>GRN No :</span>
                                <span style={{...valueStyle, fontWeight: '600', color: '#28a745'}}>{grn_details?.grn_no || '-'}</span>
                            </div>
                            <div style={fieldStyle}>
                                <span style={labelStyle}>GRN Date :</span>
                                <span style={valueStyle}>{grn_details?.grn_date || '-'}</span>
                            </div>
                            <div style={fieldStyle}>
                                <span style={labelStyle}>DC No :</span>
                                <span style={{...valueStyle, fontWeight: '600', color: '#007bff'}}>{po_details?.po_id || '-'}</span>
                            </div>
                            <div style={fieldStyle}>
                                <span style={labelStyle}>DC Date :</span>
                                <span style={valueStyle}>{po_details?.po_date || '-'}</span>
                            </div>
                            <div style={fieldStyle}>
                                <span style={labelStyle}>Bill No :</span>
                                <span style={valueStyle}>{grn_details?.bill_no || '-'}</span>
                            </div>
                            <div style={fieldStyle}>
                                <span style={labelStyle}>Bill Date :</span>
                                <span style={valueStyle}>{grn_details?.bill_date || '-'}</span>
                            </div>
                            <div style={fieldStyle}>
                                <span style={labelStyle}>Transporter :</span>
                                <span style={valueStyle}>{grn_details?.transporter_name || '-'}</span>
                            </div>
                            <div style={fieldStyle}>
                                <span style={labelStyle}>Vehicle No :</span>
                                <span style={valueStyle}>{grn_details?.vehicle_number || '-'}</span>
                            </div>
                            <div style={fieldStyle}>
                                <span style={labelStyle}>Entered By :</span>
                                <span style={valueStyle}>susham</span>
                            </div>
                            <div style={fieldStyle}>
                                <span style={labelStyle}>DC Amount :</span>
                                <span style={{...valueStyle, fontWeight: '600', color: '#ff6600'}}>₹ {po_details?.po_amount || '0'}</span>
                            </div>
                            <div style={fieldStyle}>
                                <span style={labelStyle}>Bill Amount :</span>
                                <span style={valueStyle}>{grn_details?.bill_amount || '-'}</span>
                            </div>
                            <div style={fieldStyle}>
                                <span style={labelStyle}>Remark :</span>
                                <span style={valueStyle}>{grn_details?.remark || '-'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Materials Table */}
                    <div style={{ 
                        marginBottom: '25px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: '1px solid #e0e0e0'
                    }}>
                        <h5 style={{ 
                            margin: '0', 
                            padding: '12px 16px',
                            fontSize: '1rem', 
                            backgroundColor: '#f5f5f5',
                            color: '#333',
                            fontWeight: '600',
                            borderBottom: '2px solid #ff6600'
                        }}>
                            📦 Material Items
                        </h5>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                fontSize: '0.85rem',
                                minWidth: '1400px'
                            }}>
                                <thead>
                                    <tr style={{ 
                                        background: 'linear-gradient(135deg, #ff6600 0%, #ff8533 100%)', 
                                        color: 'white' 
                                    }}>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>Sr</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', minWidth: '250px', fontWeight: '600' }}>Item</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>PO Qty</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>PO Bal</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>Inward Qty</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>PO UOM</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>Weight</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>Invoice UOM</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>Rate</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>HSN No</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>HSN Rate</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items && items.map((item, index) => (
                                        <tr key={index} style={{ 
                                            backgroundColor: index % 2 === 0 ? 'white' : '#fafafa'
                                        }}>
                                            <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0', textAlign: 'right', fontWeight: '500' }}>{index + 1}</td>
                                            <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0', fontWeight: '500' }}>{item.material_description || '-'}</td>
                                            <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0', textAlign: 'right', fontWeight: '500' }}>{item.po_qty || 0}</td>
                                            <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0', textAlign: 'right', fontWeight: '500', color: '#ff6600' }}>{item.remaining_qty || 0}</td>
                                            <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0', textAlign: 'right', fontWeight: '500', color: '#28a745' }}>{item.inward_qty || 0}</td>
                                            <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0', textAlign: 'right', color: '#666' }}>{item.po_uom || 'NOS'}</td>
                                            <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0', textAlign: 'right' }}>{item.weight || '0.00'}</td>
                                            <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0', textAlign: 'right', color: '#666' }}>{item.invoice_uom || '-'}</td>
                                            <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0', textAlign: 'right', fontWeight: '500' }}>{item.rate || '0.00'}</td>
                                            <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0', textAlign: 'right', color: '#666' }}>{item.hsn || '-'}</td>
                                            <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0', textAlign: 'right', color: '#666' }}>{item.gst || '0'}%</td>
                                            <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0', textAlign: 'right', fontWeight: '600', color: '#ff6600' }}>₹ {item.basic_amount || '0.00'}</td>
                                        </tr>
                                    ))}
                                    {/* Total Row */}
                                    <tr style={{ 
                                        backgroundColor: '#fff3e0', 
                                        fontWeight: '600',
                                        borderTop: '2px solid #ff6600'
                                    }}>
                                        <td colSpan="2" style={{ 
                                            padding: '12px 16px', 
                                            border: '1px solid #e0e0e0', 
                                            textAlign: 'right',
                                            fontSize: '0.95rem',
                                            fontWeight: '700'
                                        }}>
                                            Total
                                        </td>
                                        <td style={{ 
                                            padding: '12px 16px', 
                                            border: '1px solid #e0e0e0', 
                                            textAlign: 'right',
                                            fontSize: '0.95rem',
                                            fontWeight: '700'
                                        }}>
                                            {totals?.total_po_qty || 0}
                                        </td>
                                        <td style={{ 
                                            padding: '12px 16px', 
                                            border: '1px solid #e0e0e0', 
                                            textAlign: 'right',
                                            fontSize: '0.95rem',
                                            fontWeight: '700'
                                        }}>
                                            {totals?.total_remaining_qty || 0}
                                        </td>
                                        <td style={{ 
                                            padding: '12px 16px', 
                                            border: '1px solid #e0e0e0', 
                                            textAlign: 'right',
                                            fontSize: '0.95rem',
                                            fontWeight: '700',
                                            color: '#28a745'
                                        }}>
                                            {totals?.total_inward_qty || 0}
                                        </td>
                                        <td style={{ 
                                            padding: '12px 16px', 
                                            border: '1px solid #e0e0e0', 
                                            textAlign: 'right',
                                            fontSize: '0.95rem',
                                            fontWeight: '700'
                                        }}>
                                            -
                                        </td>
                                        <td style={{ 
                                            padding: '12px 16px', 
                                            border: '1px solid #e0e0e0', 
                                            textAlign: 'right',
                                            fontSize: '0.95rem',
                                            fontWeight: '700'
                                        }}>
                                            {totals?.total_weight || 0}
                                        </td>
                                        <td colSpan="4" style={{ 
                                            padding: '12px 16px', 
                                            border: '1px solid #e0e0e0', 
                                            textAlign: 'right',
                                            fontSize: '0.95rem',
                                            fontWeight: '700'
                                        }}>
                                            -
                                        </td>
                                        <td style={{ 
                                            padding: '12px 16px', 
                                            border: '1px solid #e0e0e0', 
                                            textAlign: 'right',
                                            fontSize: '1rem',
                                            fontWeight: '700',
                                            color: '#ff6600'
                                        }}>
                                            ₹ {totals?.total_basic_amount || '0.00'}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Summary Section */}
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'flex-end', 
                        marginBottom: '25px' 
                    }}>
                        <div style={{ 
                            width: '400px', 
                            border: '2px solid #e0e0e0', 
                            borderRadius: '8px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                        }}>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                padding: '12px 20px', 
                                borderBottom: '1px solid #e0e0e0',
                                backgroundColor: '#fafafa'
                            }}>
                                <span style={{ fontWeight: '600', color: '#333' }}>Total Basic Amount</span>
                                <span style={{ fontWeight: '600', color: '#333' }}>₹ {totals?.total_basic_amount || '0.00'}</span>
                            </div>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                padding: '12px 20px', 
                                borderBottom: '1px solid #e0e0e0',
                                backgroundColor: 'white'
                            }}>
                                <span style={{ fontWeight: '600', color: '#333' }}>Other Charges</span>
                                <span style={{ fontWeight: '600', color: '#333' }}>₹ {totals?.other_charges || '0.00'}</span>
                            </div>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                padding: '12px 20px', 
                                borderBottom: '1px solid #e0e0e0',
                                backgroundColor: '#fafafa'
                            }}>
                                <span style={{ fontWeight: '600', color: '#333' }}>Total Amount</span>
                                <span style={{ fontWeight: '600', color: '#333' }}>₹ {totals?.total_amount || '0.00'}</span>
                            </div>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                padding: '12px 20px', 
                                borderBottom: '2px solid #ff6600',
                                backgroundColor: 'white'
                            }}>
                                <span style={{ fontWeight: '600', color: '#333' }}>GST Amount</span>
                                <span style={{ fontWeight: '600', color: '#333' }}>₹ {totals?.gst_amount || '0.00'}</span>
                            </div>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                padding: '15px 20px',
                                background: 'linear-gradient(135deg, #ffcccc 0%, #ffb3b3 100%)'
                            }}>
                                <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#333' }}>Grand Total</span>
                                <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#dc3545' }}>₹ {totals?.grand_total || '0.00'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ 
                        display: 'flex', 
                        gap: '12px',
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                        marginTop: '30px' 
                    }}>
                        <button 
                            style={{
                                padding: '12px 40px',
                                fontSize: '0.95rem',
                                borderRadius: '8px',
                                border: 'none',
                                background: approving 
                                    ? 'linear-gradient(135deg, #999 0%, #777 100%)' 
                                    : 'linear-gradient(135deg, #ff6600 0%, #ff8533 100%)',
                                color: 'white',
                                cursor: approving ? 'not-allowed' : 'pointer',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                boxShadow: '0 4px 12px rgba(255, 102, 0, 0.3)',
                                transition: 'all 0.3s ease',
                                minWidth: '280px',
                                opacity: approving ? 0.7 : 1
                            }}
                            onClick={handleApproval}
                            disabled={approving}
                        >
                            {approving ? '⏳ APPROVING...' : 'APPROVAL FOR INWARD MATERIAL'}
                        </button>
                        <button 
                            style={{
                                padding: '12px 40px',
                                fontSize: '0.95rem',
                                borderRadius: '8px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                boxShadow: '0 4px 12px rgba(0, 123, 255, 0.3)',
                                transition: 'all 0.3s ease',
                                minWidth: '150px'
                            }}
                            onClick={() => window.print()}
                        >
                            🖨️ Print</button>
                    </div>
                </div>
                {/* Footer */}
            <div style={{
                textAlign: 'right',
                padding: '20px',
                color: '#999',
                fontSize: '0.85rem'
            }}>
                <p style={{ margin: 0 }}>© 2025 Surya Equipments | ERP System</p>
            </div>
        </div>
    </div>
);
};
export default GRNDCAssemblyView;
