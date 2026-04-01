import React, { useEffect, useState } from "react";

const GRNDeliveryChallanForm = () => {
    const getPoIdFromUrl = () => {
        const hash = window.location.hash;
        const parts = hash.split('/');
        return parts[parts.length - 1] || '25-26-2484';
    };

    const [poId, setPoId] = useState(getPoIdFromUrl());
    const [loading, setLoading] = useState(false);
    const [grnData, setGrnData] = useState(null);
    
    // Form fields
    const [vendorName, setVendorName] = useState('');
    const [challanNo, setChallanNo] = useState('');
    const [challanDate, setChallanDate] = useState('');
    const [gstNo, setGstNo] = useState('');
    const [grnNo, setGrnNo] = useState('');
    const [grnDate, setGrnDate] = useState('');
    const [dcNo, setDcNo] = useState('');
    const [dcDate, setDcDate] = useState('');
    const [billNo, setBillNo] = useState('');
    const [billDate, setBillDate] = useState('');
    const [transporter, setTransporter] = useState('');
    const [vehicleNo, setVehicleNo] = useState('');
    const [enteredBy, setEnteredBy] = useState('susham');
    const [dcAmount, setDcAmount] = useState('0');
    const [billAmount, setBillAmount] = useState('');
    const [remark, setRemark] = useState('');
    
    const [items, setItems] = useState([]);
    const [units, setUnits] = useState([]);

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


    // Add this function before the return statement in your component

const handleSubmit = async () => {
    // Validation
    if (!challanNo) {
        showToast('Please enter Challan No', 'error');
        return;
    }
    if (!challanDate) {
        showToast('Please enter Challan Date', 'error');
        return;
    }
    if (!grnDate) {
        showToast('Please enter GRN Date', 'error');
        return;
    }

    // Check if at least one item has inward quantity
    const hasInwardQty = items.some(item => parseFloat(item.inward_qty) > 0);
    if (!hasInwardQty) {
        showToast('Please enter Inward Quantity for at least one item', 'error');
        return;
    }

    // Prepare data
    const material_ids = items.map(item => item.material_id);
    const inward_quantities = items.map(item => item.inward_qty || 0);
    const invoice_units = items.map(item => item.invoice_uom);

    const payload = {
        po_id: poId,
        challan_no: challanNo,
        challan_date: challanDate,
        grn_date: grnDate,
        supplierID: grnData?.po_details?.customer_id || '',
        materil_id: material_ids,
        inward_qty: inward_quantities,
        unit: invoice_units,
        bill_no: billNo,
        bill_date: billDate || null,
        bill_amt: billAmount || 0,
        transporter_name: transporter,
        vehicle_no: vehicleNo,
        remark: remark,
        employee_id: 1 // Change this as per your session/user data
    };

    setLoading(true);
    
    try {
        const response = await fetch(
            'https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/saveDcGrnApi.php',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            }
        );

        const result = await response.json();

        if (result.status === 'success') {
            showToast(result.message || 'GRN Sent For Approval Successfully!', 'success');
            
            // Optional: Reset form or redirect after success
            setTimeout(() => {
                window.history.back(); // Or redirect to another page
            }, 2000);
        } else {
            showToast(result.message || 'Failed to submit GRN', 'error');
        }
    } catch (error) {
        console.error('Submit error:', error);
        showToast('Network error. Please try again.', 'error');
    } finally {
        setLoading(false);
    }
};

    const fetchGRNData = async () => {
        if (!poId) return;

        setLoading(true);
        try {
            const response = await fetch(
                `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/grn_dc_api.php?po_id=${poId}`,
                { method: "GET", headers: { "Content-Type": "application/json" } }
            );

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();

            if (data.status === 'success') {
                setGrnData(data.data);
                
                setVendorName(data.data.po_details.customer_name || '');
                setGstNo(data.data.po_details.gst_no || '');
                setGrnNo(data.data.grn.grn_no || '');
                setGrnDate(data.data.grn.today || '');
                setDcNo(poId);
                setDcDate(data.data.po_details.po_date || '');
                
                const itemsWithInputs = data.data.items.map(item => ({
                    ...item,
                    inward_qty: '',
                    dc_qty: item.qty,
                    dc_bal: '',
                    weight: '',
                    invoice_uom: '1',
                    dc_uom: '1',
                    hsn_rate: '',
                    amount: ''
                }));
                setItems(itemsWithInputs);
                setUnits(data.data.units || []);
                
                showToast('GRN data loaded successfully', 'success');
            } else {
                showToast('Failed to load GRN data', 'error');
            }
        } catch (error) {
            console.error("Error fetching GRN data:", error);
            showToast(`Error: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (poId) {
            fetchGRNData();
        }
    }, [poId]);

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...items];
        updatedItems[index][field] = value;
        
        // Auto-calculate amount when inward_qty changes
        if (field === 'inward_qty') {
            const inwardQty = parseFloat(value) || 0;
            const rate = parseFloat(updatedItems[index].rate) || 0;
            updatedItems[index].amount = (inwardQty * rate).toFixed(2);
        }
        
        // Auto-calculate DC Bal (DC Qty - Inward Qty)
        if (field === 'inward_qty' || field === 'dc_qty') {
            const dcQty = parseFloat(updatedItems[index].dc_qty) || 0;
            const inwardQty = parseFloat(updatedItems[index].inward_qty) || 0;
            updatedItems[index].dc_bal = (dcQty - inwardQty).toFixed(2);
        }
        
        setItems(updatedItems);
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    };

    const inputStyle = {
        width: '100%',
        padding: '8px 12px',
        fontSize: '0.9rem',
        border: '1px solid #ddd',
        borderRadius: '6px',
        boxSizing: 'border-box',
        transition: 'all 0.2s ease',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    };

    const labelStyle = {
        fontWeight: '600',
        marginBottom: '6px',
        fontSize: '0.85rem',
        color: '#444',
        display: 'block',
        letterSpacing: '0.3px'
    };

    const cardStyle = {
        border: '1px solid #e0e0e0',
        padding: '20px',
        backgroundColor: '#fafafa',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
    };

    if (loading && !grnData) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f5f5f5'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                        width: '50px', 
                        height: '50px', 
                        border: '5px solid #f3f3f3',
                        borderTop: '5px solid #ff6600',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto'
                    }}></div>
                    <p style={{ marginTop: '1.5rem', color: '#666', fontSize: '1rem', fontWeight: '500' }}>Loading GRN Form...</p>
                </div>
            </div>
        );
    }

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
                    boxShadow: '0 4px 12px rgba(255, 102, 0, 0.2)'
                }}>
                    <h4 style={{ 
                        margin: 0, 
                        fontSize: 'clamp(1rem, 3vw, 1.3rem)', 
                        fontWeight: '600',
                        letterSpacing: '0.5px'
                    }}>
                        📋 GRN Against Delivery Challan
                    </h4>
                </div>

                {/* Main Form Container */}
                <div style={{
                    backgroundColor: 'white',
                    border: '1px solid #e0e0e0',
                    borderTop: 'none',
                    borderRadius: '0 0 12px 12px',
                    padding: 'clamp(15px, 3vw, 25px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                }}>
                    {/* Top Section - Two Columns (Responsive) */}
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
                            <div style={{ marginBottom: '15px' }}>
                                <label style={labelStyle}>Vendor Name</label>
                                <input 
                                    type="text" 
                                    value={vendorName} 
                                    onChange={(e) => setVendorName(e.target.value)}
                                    style={inputStyle}
                                    onFocus={(e) => e.target.style.borderColor = '#ff6600'}
                                    onBlur={(e) => e.target.style.borderColor = '#ddd'}
                                />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={labelStyle}>Challan No</label>
                                <input 
                                    type="text" 
                                    value={challanNo}
                                    onChange={(e) => setChallanNo(e.target.value)}
                                    style={inputStyle}
                                    onFocus={(e) => e.target.style.borderColor = '#ff6600'}
                                    onBlur={(e) => e.target.style.borderColor = '#ddd'}
                                />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={labelStyle}>Challan Date</label>
                                <input 
                                    type="date" 
                                    value={challanDate}
                                    onChange={(e) => setChallanDate(e.target.value)}
                                    style={inputStyle}
                                    onFocus={(e) => e.target.style.borderColor = '#ff6600'}
                                    onBlur={(e) => e.target.style.borderColor = '#ddd'}
                                />
                            </div>
                            <div style={{ marginBottom: '0' }}>
                                <label style={labelStyle}>GST No</label>
                                <input 
                                    type="text" 
                                    value={gstNo} 
                                    readOnly 
                                    style={{...inputStyle, backgroundColor: '#f0f0f0', cursor: 'not-allowed'}}
                                />
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
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '15px' }}>
                                <div>
                                    <label style={labelStyle}>GRN No</label>
                                    <input 
                                        type="text" 
                                        value={grnNo} 
                                        readOnly 
                                        style={{...inputStyle, backgroundColor: '#e8f5e9', fontWeight: '600', cursor: 'not-allowed'}}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>GRN Date</label>
                                    <input 
                                        type="text" 
                                        value={grnDate} 
                                        readOnly 
                                        style={{...inputStyle, backgroundColor: '#f0f0f0', cursor: 'not-allowed'}}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '15px' }}>
                                <div>
                                    <label style={labelStyle}>DC No</label>
                                    <input 
                                        type="text" 
                                        value={dcNo} 
                                        readOnly 
                                        style={{...inputStyle, backgroundColor: '#e3f2fd', fontWeight: '600', cursor: 'not-allowed'}}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>DC Date</label>
                                    <input 
                                        type="text" 
                                        value={dcDate} 
                                        readOnly 
                                        style={{...inputStyle, backgroundColor: '#f0f0f0', cursor: 'not-allowed'}}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '15px' }}>
                                <div>
                                    <label style={labelStyle}>Bill No</label>
                                    <input 
                                        type="text" 
                                        value={billNo}
                                        onChange={(e) => setBillNo(e.target.value)}
                                        style={inputStyle}
                                        onFocus={(e) => e.target.style.borderColor = '#ff6600'}
                                        onBlur={(e) => e.target.style.borderColor = '#ddd'}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Bill Date</label>
                                    <input 
                                        type="date" 
                                        value={billDate}
                                        onChange={(e) => setBillDate(e.target.value)}
                                        style={inputStyle}
                                        onFocus={(e) => e.target.style.borderColor = '#ff6600'}
                                        onBlur={(e) => e.target.style.borderColor = '#ddd'}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '15px' }}>
                                <div>
                                    <label style={labelStyle}>Transporter</label>
                                    <input 
                                        type="text" 
                                        value={transporter}
                                        onChange={(e) => setTransporter(e.target.value)}
                                        style={inputStyle}
                                        onFocus={(e) => e.target.style.borderColor = '#ff6600'}
                                        onBlur={(e) => e.target.style.borderColor = '#ddd'}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Vehicle No</label>
                                    <input 
                                        type="text" 
                                        value={vehicleNo}
                                        onChange={(e) => setVehicleNo(e.target.value)}
                                        style={inputStyle}
                                        onFocus={(e) => e.target.style.borderColor = '#ff6600'}
                                        onBlur={(e) => e.target.style.borderColor = '#ddd'}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                                <div>
                                    <label style={labelStyle}>Entered By</label>
                                    <input 
                                        type="text" 
                                        value={enteredBy}
                                        onChange={(e) => setEnteredBy(e.target.value)}
                                        style={inputStyle}
                                        onFocus={(e) => e.target.style.borderColor = '#ff6600'}
                                        onBlur={(e) => e.target.style.borderColor = '#ddd'}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>DC Amount</label>
                                    <input 
                                        type="text" 
                                        value={`₹ ${dcAmount}`}
                                        readOnly 
                                        style={{...inputStyle, backgroundColor: '#fff3e0', fontWeight: '600', cursor: 'not-allowed'}}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bill Amount and Remark Row */}
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                        gap: '15px', 
                        marginBottom: '25px' 
                    }}>
                        <div>
                            <label style={labelStyle}>Bill Amount</label>
                            <input 
                                type="text" 
                                value={billAmount}
                                onChange={(e) => setBillAmount(e.target.value)}
                                placeholder="Enter amount"
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = '#ff6600'}
                                onBlur={(e) => e.target.style.borderColor = '#ddd'}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Remark</label>
                            <input 
                                type="text" 
                                value={remark}
                                onChange={(e) => setRemark(e.target.value)}
                                placeholder="Enter remark"
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = '#ff6600'}
                                onBlur={(e) => e.target.style.borderColor = '#ddd'}
                            />
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
                                minWidth: '1200px'
                            }}>
                                <thead>
                                    <tr style={{ 
                                        background: 'linear-gradient(135deg, #ff6600 0%, #ff8533 100%)', 
                                        color: 'white' 
                                    }}>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', whiteSpace: 'nowrap', fontWeight: '600' }}>Sr</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', minWidth: '180px', fontWeight: '600' }}>Item</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>File No</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>DC Qty</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>DC Bal</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>Inward Qty</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>DC UOM</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>Weight</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>Invoice UOM</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>Rate</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>HSN No</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>HSN Rate</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>Amount</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>Category</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>Location</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.length === 0 ? (
                                        <tr>
                                            <td colSpan="15" style={{ 
                                                padding: '60px 20px', 
                                                textAlign: 'center', 
                                                color: '#999',
                                                backgroundColor: '#fafafa'
                                            }}>
                                                <div style={{ fontSize: '3rem', marginBottom: '15px', opacity: 0.5 }}>📦</div>
                                                <p style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: '500', color: '#666' }}>No items found</p>
                                                <small style={{ color: '#999' }}>Items will appear here when loaded</small>
                                            </td>
                                        </tr>
                                    ) : (
                                        items.map((item, index) => (
                                            <tr key={index} style={{ 
                                                backgroundColor: index % 2 === 0 ? 'white' : '#fafafa',
                                                transition: 'background-color 0.2s'
                                            }}>
                                                <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0', textAlign: 'center', fontWeight: '500' }}>{item.sr_no}</td>
                                                <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0', fontWeight: '500' }}>{item.material_description}</td>
                                                <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0', color: '#666' }}>{item.file_name}</td>
                                                <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0', textAlign: 'center', fontWeight: '500' }}>{item.dc_qty}</td>
                                                <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0', textAlign: 'center' }}>
                                                    <input 
                                                        type="text" 
                                                        value={item.dc_bal}
                                                        onChange={(e) => handleItemChange(index, 'dc_bal', e.target.value)}
                                                        style={{ 
                                                            width: '70px', 
                                                            padding: '6px', 
                                                            border: '1px solid #ddd', 
                                                            borderRadius: '4px',
                                                            textAlign: 'center'
                                                        }} 
                                                    />
                                                </td>
                                                <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0' }}>
                                                    <input 
                                                        type="number" 
                                                        value={item.inward_qty}
                                                        onChange={(e) => handleItemChange(index, 'inward_qty', e.target.value)}
                                                        placeholder="0"
                                                        style={{ 
                                                            width: '80px', 
                                                            padding: '6px', 
                                                            border: '1px solid #ddd', 
                                                            borderRadius: '4px',
                                                            textAlign: 'center'
                                                        }} 
                                                    />
                                                </td>
                                                <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0' }}>
                                                    <select 
                                                        value={item.dc_uom}
                                                        onChange={(e) => handleItemChange(index, 'dc_uom', e.target.value)}
                                                        style={{ 
                                                            width: '110px', 
                                                            padding: '6px', 
                                                            border: '1px solid #ddd', 
                                                            borderRadius: '4px',
                                                            backgroundColor: 'white'
                                                        }}
                                                    >
                                                        {units.map(unit => (
                                                            <option key={unit.id} value={unit.id}>{unit.name}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0' }}>
                                                    <input 
                                                        type="text" 
                                                        value={item.weight}
                                                        onChange={(e) => handleItemChange(index, 'weight', e.target.value)}
                                                        placeholder="0"
                                                        style={{ 
                                                            width: '80px', 
                                                            padding: '6px', 
                                                            border: '1px solid #ddd', 
                                                            borderRadius: '4px',
                                                            textAlign: 'center'
                                                        }} 
                                                    />
                                                </td>
                                                <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0' }}>
                                                    <select 
                                                        value={item.invoice_uom}
                                                        onChange={(e) => handleItemChange(index, 'invoice_uom', e.target.value)}
                                                        style={{ 
                                                            width: '110px', 
                                                            padding: '6px', 
                                                            border: '1px solid #ddd', 
                                                            borderRadius: '4px',
                                                            backgroundColor: 'white'
                                                        }}
                                                    >
                                                        {units.map(unit => (
                                                            <option key={unit.id} value={unit.id}>{unit.name}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0', textAlign: 'right', fontWeight: '500', color: '#333' }}>₹{item.rate}</td>
                                                <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0', textAlign: 'center', color: '#666' }}>{item.hsn}</td>
                                                <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0' }}>
                                                    <input 
                                                        type="text"
                                                        value={item.hsn_rate}
                                                        onChange={(e) => handleItemChange(index, 'hsn_rate', e.target.value)}
                                                        placeholder="0"
                                                        style={{ 
                                                            width: '80px', 
                                                            padding: '6px', 
                                                            border: '1px solid #ddd', 
                                                            borderRadius: '4px',
                                                            textAlign: 'center'
                                                        }} 
                                                    />
                                                </td>
                                                <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0' }}>
                                                    <input 
                                                        type="text"
                                                        value={item.amount}
                                                        onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                                                        placeholder="0.00"
                                                        style={{ 
                                                            width: '100px', 
                                                            padding: '6px', 
                                                            border: '1px solid #ddd', 
                                                            borderRadius: '4px',
                                                            textAlign: 'right',
                                                            fontWeight: '500'
                                                        }} 
                                                    />
                                                </td>
                                                <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0', fontSize: '0.8rem', color: '#666' }}>{item.main_material_name}</td>
                                                <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0' }}>
                                                    <select 
                                                        defaultValue="1"
                                                        style={{ 
                                                            width: '110px', 
                                                            padding: '6px', 
                                                            border: '1px solid #ddd', 
                                                            borderRadius: '4px',
                                                            backgroundColor: 'white'
                                                        }}
                                                    >
                                                        <option value="1">Surya</option>
                                                        <option value="2">Susham</option>
                                                        <option value='3'>Vivid</option>
                                                        <option value="4">Racline</option>
                                                        <option value="5">Other</option>

                                                    </select>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                    {/* Total Row */}
                                    {items.length > 0 && (
                                        <tr style={{ 
                                            backgroundColor: '#fff3e0', 
                                            fontWeight: '600',
                                            borderTop: '2px solid #ff6600'
                                        }}>
                                            <td colSpan="12" style={{ 
                                                padding: '12px 16px', 
                                                border: '1px solid #e0e0e0', 
                                                textAlign: 'right',
                                                fontSize: '0.95rem',
                                                color: '#333'
                                            }}>
                                                Total Amount:
                                            </td>
                                            <td style={{ 
                                                padding: '12px 16px', 
                                                border: '1px solid #e0e0e0', 
                                                textAlign: 'right',
                                                fontSize: '1rem',
                                                color: '#ff6600'
                                            }}>
                                                ₹ {calculateTotal().toFixed(2)}
                                            </td>
                                            <td colSpan="2" style={{ 
                                                padding: '12px 16px', 
                                                border: '1px solid #e0e0e0',
                                                textAlign: 'center',
                                                color: '#999'
                                            }}>
                                                /-
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
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
        background: loading ? '#ccc' : 'linear-gradient(135deg, #ff6600 0%, #ff8533 100%)',
        color: 'white',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        boxShadow: '0 4px 12px rgba(255, 102, 0, 0.3)',
        transition: 'all 0.3s ease',
        minWidth: '200px'
    }}
    onClick={handleSubmit}
    disabled={loading}
    onMouseEnter={(e) => {
        if (!loading) {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(255, 102, 0, 0.4)';
        }
    }}
    onMouseLeave={(e) => {
        if (!loading) {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(255, 102, 0, 0.3)';
        }
    }}
>
    {loading ? '⏳ Submitting...' : '📤 Send For Approval'}
</button>
                        <button 
                            style={{
                                padding: '12px 40px',
                                fontSize: '0.95rem',
                                borderRadius: '8px',
                                border: '2px solid #ddd',
                                background: 'white',
                                color: '#666',
                                cursor: 'pointer',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                transition: 'all 0.3s ease',
                                minWidth: '150px'
                            }}
                            onClick={() => window.history.back()}
                            onMouseEnter={(e) => {
                                e.target.style.borderColor = '#ff6600';
                                e.target.style.color = '#ff6600';
                                e.target.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.borderColor = '#ddd';
                                e.target.style.color = '#666';
                                e.target.style.transform = 'translateY(0)';
                            }}
                        >
                            ← Back
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    textAlign: 'center',
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

export default GRNDeliveryChallanForm;