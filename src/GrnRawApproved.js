import React, { useEffect, useState } from "react";

const GRNDetailsView = () => {
    const getGrnIdFromUrl = () => {
        const hash = window.location.hash;
        const parts = hash.split('/');
        return parts[parts.length - 1] || '25-26-2816';
    };

    const [grnId, setGrnId] = useState(getGrnIdFromUrl());
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [items, setItems] = useState([]);
    const [units, setUnits] = useState([
        { id: '1', name: 'NOS' },
        { id: '2', name: 'KG' },
        { id: '3', name: 'MTR' },
        { id: '4', name: 'LTR' }
    ]);
    const [freightCharges, setFreightCharges] = useState('0');
    const [isEditable, setIsEditable] = useState(false);
    const [apiTotals, setApiTotals] = useState(null);
const [isFreightModified, setIsFreightModified] = useState(false); //
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
                `http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/grnDetailsApi.php?grn_id=${grnId}`,
                { method: "GET", headers: { "Content-Type": "application/json" } }
            );

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const result = await response.json();

            if (result.status === 'success' && result.data) {
                setData(result.data);
                
                // Use API's basic_amount directly (no recalculation)
                const editableItems = (result.data.items || []).map(item => {
                    const inwardQty = parseFloat(item.inward_qty) || 0;
                    const remainingQty = parseFloat(item.remaining_qty) || 0;
                    
                    // GRN Balance = PO Remaining - Inward Qty
                    const grnBal = remainingQty - inwardQty;
                    
                    // Parse API's basic_amount (remove commas)
                    const apiBasicAmount = typeof item.basic_amount === 'string' 
                        ? parseFloat(item.basic_amount.replace(/,/g, '')) 
                        : parseFloat(item.basic_amount) || 0;
                    
                    return {
                        ...item,
                        grn_bal: grnBal.toFixed(2),
                        calculated_amount: apiBasicAmount.toFixed(2),
                        invoice_uom: item.invoice_uom || '1',
                        location: item.location || 'Surya',
                        weight: item.weight || '0'
                    };
                });
                
                setItems(editableItems);

// Parse freight charges from API totals (handle empty strings, commas, and null)
const apiFreight = result.data.totals?.other_charges || result.data.grn_details?.freight;
const parsedFreight = apiFreight && apiFreight !== '' 
    ? parseFloat(String(apiFreight).replace(/,/g, '')) 
    : 0;
setFreightCharges(parsedFreight.toString());

// Store API totals
if (result.data.totals) {
    setApiTotals(result.data.totals);
}
       setIsFreightModified(false); // Reset the modified flag         
                showToast('GRN details loaded successfully', 'success');
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

    // const handleItemChange = (index, field, value) => {
    //     const updatedItems = [...items];
        
    //     // Update the field first
    //     updatedItems[index][field] = value;
        
    //     if (field === 'inward_qty') {
    //         const inwardQty = parseFloat(value) || 0;
    //         const poQty = parseFloat(updatedItems[index].po_qty) || 0;
            
    //         if (inwardQty > poQty) {
    //             showToast(`Inward Qty cannot exceed PO Qty (${poQty})`, 'error');
    //             return;
    //         }
            
    //         // Calculate GRN Balance
    //         const poRemaining = parseFloat(updatedItems[index].remaining_qty) || 0;
    //         const originalInwardQty = parseFloat(items[index].inward_qty) || 0;
    //         updatedItems[index].grn_bal = (poRemaining + originalInwardQty - inwardQty).toFixed(2);
    //     }
        
    //     // Recalculate amount when user edits: weight, rate, or discount
    //     if (field === 'weight' || field === 'rate' || field === 'discount') {
    //         const weight = parseFloat(updatedItems[index].weight) || 0;
    //         const rate = parseFloat(updatedItems[index].rate) || 0;
    //         const discount = parseFloat(updatedItems[index].discount) || 0;
            
    //         // Formula: (weight × rate) - discount%
    //         const basicAmount = weight * rate;
    //         const discountAmount = (basicAmount * discount) / 100;
    //         const amountAfterDiscount = basicAmount - discountAmount;
            
    //         updatedItems[index].calculated_amount = amountAfterDiscount.toFixed(2);
    //     }
        
    //     setItems(updatedItems);
    // };

    const handleFreightChargeChange = (value) => {
    setFreightCharges(value);
    setIsFreightModified(true); // Mark as modified when changed
};
    const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    
    // Update the field first
    updatedItems[index][field] = value;
    
    if (field === 'inward_qty') {
        const inwardQty = parseFloat(value) || 0;
        const poQty = parseFloat(updatedItems[index].po_qty) || 0;
        
        if (inwardQty > poQty) {
            showToast(`Inward Qty cannot exceed PO Qty (${poQty})`, 'error');
            return;
        }
        
        // Calculate GRN Balance
        const poRemaining = parseFloat(updatedItems[index].remaining_qty) || 0;
        const originalInwardQty = parseFloat(items[index].inward_qty) || 0;
        updatedItems[index].grn_bal = (poRemaining + originalInwardQty - inwardQty).toFixed(2);
    }
    
    // Always recalculate amount for any field change
    const weight = parseFloat(updatedItems[index].weight) || 0;
    const inwardQty = parseFloat(updatedItems[index].inward_qty) || 0;
    const rate = parseFloat(updatedItems[index].rate) || 0;
    const discount = parseFloat(updatedItems[index].discount) || 0;
    
    // Logic: 
    // - If changing inward_qty: use inward_qty
    // - If changing weight: use weight
    // - Otherwise: use weight if > 0, else inward_qty
    let quantityForCalculation;
    if (field === 'inward_qty') {
        quantityForCalculation = inwardQty;
    } else if (field === 'weight') {
        quantityForCalculation = weight;
    } else {
        quantityForCalculation = weight > 0 ? weight : inwardQty;
    }
    
    const basicAmount = quantityForCalculation * rate;
    const discountAmount = (basicAmount * discount) / 100;
    const amountAfterDiscount = basicAmount - discountAmount;
    
    updatedItems[index].calculated_amount = amountAfterDiscount.toFixed(2);
    
    setItems(updatedItems);
};

    const calculateTotalBasicAmount = () => {
    // If not in edit mode and API totals exist, use API value
    if (!isEditable && apiTotals?.total_basic_amount) {
        const apiValue = typeof apiTotals.total_basic_amount === 'string'
            ? parseFloat(apiTotals.total_basic_amount.replace(/,/g, ''))
            : parseFloat(apiTotals.total_basic_amount);
        return apiValue;
    }
    // Calculate from items
    return items.reduce((sum, item) => {
        return sum + (parseFloat(item.calculated_amount) || 0);
    }, 0);
};

const calculateGSTAmount = () => {
    // If freight hasn't been modified and API totals exist, use API value
    if (!isFreightModified && apiTotals?.gst_amount) {
        const apiValue = typeof apiTotals.gst_amount === 'string'
            ? parseFloat(apiTotals.gst_amount.replace(/,/g, ''))
            : parseFloat(apiTotals.gst_amount);
        return apiValue;
    }
    
    // If freight was modified, calculate GST on Total Amount
    const basicAmount = calculateTotalBasicAmount();
    const otherCharges = parseFloat(freightCharges) || 0;
    const totalBeforeGST = basicAmount + otherCharges;
    
    // Use 18% GST rate (or calculate average from items)
    const avgGSTRate = items.length > 0 
        ? items.reduce((sum, item) => sum + (parseFloat(item.gst) || 0), 0) / items.length
        : 18;
    
    return (totalBeforeGST * avgGSTRate) / 100;
};

const calculateTotalAmount = () => {
    // If freight hasn't been modified and API totals exist, use API value
    if (!isFreightModified && apiTotals?.total_amount) {
        const apiValue = typeof apiTotals.total_amount === 'string'
            ? parseFloat(apiTotals.total_amount.replace(/,/g, ''))
            : parseFloat(apiTotals.total_amount);
        return apiValue;
    }
    
    // Calculate if freight was modified
    const basicAmount = calculateTotalBasicAmount();
    const otherCharges = parseFloat(freightCharges) || 0;
    return basicAmount + otherCharges;
};

const calculateGrandTotal = () => {
    // If freight hasn't been modified and API totals exist, use API value
    if (!isFreightModified && apiTotals?.grand_total) {
        const apiValue = typeof apiTotals.grand_total === 'string'
            ? parseFloat(apiTotals.grand_total.replace(/,/g, ''))
            : parseFloat(apiTotals.grand_total);
        return apiValue;
    }
    
    // Calculate if freight was modified
    const totalAmount = calculateTotalAmount();
    const gstAmount = calculateGSTAmount();
    return totalAmount + gstAmount;
};

    const calculateTotals = () => {
        const totalPoQty = items.reduce((sum, item) => sum + (parseFloat(item.po_qty) || 0), 0);
        const totalRemainingQty = items.reduce((sum, item) => sum + (parseFloat(item.remaining_qty) || 0), 0);
        const totalInwardQty = items.reduce((sum, item) => sum + (parseFloat(item.inward_qty) || 0), 0);
        const totalWeight = items.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0);
        
        return {
            totalPoQty,
            totalRemainingQty,
            totalInwardQty,
            totalWeight
        };
    };

    const handleApproval = async () => {
    if (!items || items.length === 0) {
        showToast('No items to approve', 'error');
        return;
    }

    // Confirm approval
    if (!window.confirm('Are you sure you want to approve this GRN?')) {
        return;
    }

    setLoading(true);
    
    try {
        // Prepare form data
        const formData = new FormData();
        formData.append('SAVE', '1');
        formData.append('grn_id', grnId);
        formData.append('po_id', po_details?.po_id || '');
        formData.append('grn_date', grn_details?.grn_date || '');
        formData.append('employee_id', 'MAP');
        
        // Add totals
        formData.append('total_basic_Amt', calculateTotalBasicAmount().toFixed(2));
        formData.append('other_charges', parseFloat(freightCharges || 0).toFixed(2));
        formData.append('total_Amt', calculateTotalAmount().toFixed(2));
        formData.append('GST_Amount', calculateGSTAmount().toFixed(2));
        formData.append('GrandTotal', calculateGrandTotal().toFixed(2));

        // Add item arrays with proper indexing
        items.forEach((item, index) => {
            formData.append(`materil_id[${index}]`, item.material_id || '');
            formData.append(`inward_qty[${index}]`, item.inward_qty || '0');
            formData.append(`make[${index}]`, item.make || '');
            formData.append(`rejectQty[${index}]`, '0');
            formData.append(`filename[${index}]`, item.file_name || '');
            formData.append(`unitchange[${index}]`, item.invoice_uom || '1'); // This is the unit ID (1,2,3,4)
            formData.append(`weight[${index}]`, item.weight || '0');
            formData.append(`location[${index}]`, item.location || 'Surya');
        });

        // Debug: Log the FormData
        console.log('=== FormData Contents ===');
        for (let [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
        }

        const response = await fetch(
            'http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/saveRawGrnApproveApi.php',
            {
                method: 'POST',
                body: formData
            }
        );

        const result = await response.json();
        console.log('API Response:', result);

        if (result.status === true || result.status === 'success') {
            showToast('GRN approved successfully!', 'success');
            // Refresh the data after 1.5 seconds
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
        setLoading(false);
    }
};

    const handleReject = async () => {
        showToast('GRN rejected', 'error');
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
                    <p style={{ marginTop: '1.5rem', color: '#666', fontSize: '1rem', fontWeight: '500' }}>Loading GRN Details...</p>
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

    const { grn_details, supplier_details, po_details } = data;
    const totals = calculateTotals();

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f5f5f5',
            padding: '10px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto', animation: 'fadeIn 0.5s ease' }}>
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
                        📦 GRN Details
                    </h4>
                    <button
                        onClick={() => setIsEditable(!isEditable)}
                        style={{
                            padding: '8px 20px',
                            backgroundColor: 'white',
                            color: '#ff6600',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                        }}
                    >
                        {isEditable ? '🔒 Lock' : '✏️ Edit'}
                    </button>
                </div>

                <div style={{
                    backgroundColor: 'white',
                    border: '1px solid #e0e0e0',
                    borderTop: 'none',
                    borderRadius: '0 0 12px 12px',
                    padding: 'clamp(15px, 3vw, 25px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                }}>
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                        gap: '20px', 
                        marginBottom: '20px' 
                    }}>
                        <div style={cardStyle}>
                            <h5 style={{ 
                                margin: '0 0 15px 0', 
                                fontSize: '1rem', 
                                color: '#ff6600', 
                                borderBottom: '2px solid #ff6600',
                                paddingBottom: '8px',
                                fontWeight: '600'
                            }}>
                                Supplier Information
                            </h5>
                            <div style={fieldStyle}>
                                <span style={labelStyle}>Supplier :</span>
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
                                <span style={labelStyle}>Bill No :</span>
                                <span style={valueStyle}>{grn_details?.bill_no || '-'}</span>
                            </div>
                            <div style={fieldStyle}>
                                <span style={labelStyle}>Bill Date :</span>
                                <span style={valueStyle}>{grn_details?.bill_date || '-'}</span>
                            </div>
                            <div style={fieldStyle}>
                                <span style={labelStyle}>Bill Amount :</span>
                                <span style={valueStyle}>{grn_details?.bill_amount || '-'}</span>
                            </div>
                            <div style={fieldStyle}>
                                <span style={labelStyle}>GST No :</span>
                                <span style={valueStyle}>{supplier_details?.gst_no || '-'}</span>
                            </div>
                            <div style={fieldStyle}>
                                <span style={labelStyle}>Freight Charges :</span>
                                <span style={valueStyle}>{grn_details?.freight || '0'}</span>
                            </div>
                        </div>

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
                                <span style={labelStyle}>PO No :</span>
                                <span style={{...valueStyle, fontWeight: '600', color: '#007bff'}}>{po_details?.po_id || '-'}</span>
                            </div>
                            <div style={fieldStyle}>
                                <span style={labelStyle}>PO Date :</span>
                                <span style={valueStyle}>{po_details?.po_date || '-'}</span>
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
                                <span style={valueStyle}>MAP</span>
                            </div>
                            <div style={fieldStyle}>
                                <span style={labelStyle}>PO Amount :</span>
                                <span style={{...valueStyle, fontWeight: '600', color: '#ff6600'}}>₹ {po_details?.po_amount || '0'}</span>
                            </div>
                            <div style={fieldStyle}>
                                <span style={labelStyle}>Remark :</span>
                                <span style={valueStyle}>{grn_details?.remark || '-'}</span>
                            </div>
                        </div>
                    </div>

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
                                minWidth: '1600px'
                            }}>
                                <thead>
                                    <tr style={{ 
                                        background: 'linear-gradient(135deg, #ff6600 0%, #ff8533 100%)', 
                                        color: 'white' 
                                    }}>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>Sr. No.</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>HSN</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>Item No</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', minWidth: '200px', fontWeight: '600' }}>Item</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>Make</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>File Name</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>PO Qty</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>PO Rem.</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>Inward Qty</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>PO UOM</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>Wt.</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>Invoice UOM</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>Rate</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>Disc</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>GST</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>Amount</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>Location</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, index) => (
                                        <tr key={index} style={{ 
                                            backgroundColor: index % 2 === 0 ? 'white' : '#fafafa'
                                        }}>
                                            <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0', textAlign: 'right', fontWeight: '500' }}>{index + 1}</td>
                                            <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0', color: '#666' }}>{item.hsn || '-'}</td>
                                            <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0', color: '#666' }}>{item.material_id || '-'}</td>
                                            <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0', fontWeight: '500' }}>{item.material_description || '-'}</td>
                                            <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0', color: '#666' }}>{item.make || '-'}</td>
                                            <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0', color: '#ff6600' }}>{item.file_name || '-'}</td>
                                            <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0', textAlign: 'right', fontWeight: '500' }}>{item.po_qty || 0}</td>
                                            <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0', textAlign: 'right', fontWeight: '500', color: '#ff6600' }}>{item.remaining_qty || 0}</td>
                                           
                                            <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0' }}>
                                                <input 
                                                    type="number" 
                                                    value={item.inward_qty || ''}
                                                    onChange={(e) => handleItemChange(index, 'inward_qty', e.target.value)}
                                                    disabled={!isEditable}
                                                    style={{ 
                                                        width: '80px', 
                                                        padding: '6px', 
                                                        border: '1px solid #ddd', 
                                                        borderRadius: '4px',
                                                        textAlign: 'right',
                                                        backgroundColor: isEditable ? 'white' : '#f0f0f0',
                                                        cursor: isEditable ? 'text' : 'not-allowed'
                                                    }} 
                                                />
                                            </td>
                                            <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0', textAlign: 'right', color: '#666' }}>{item.po_uom || 'NOS'}</td>
                                            <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0' }}>
                                                <input 
                                                    type="text" 
                                                    value={item.weight || ''}
                                                    onChange={(e) => handleItemChange(index, 'weight', e.target.value)}
                                                    disabled={!isEditable}
                                                    style={{ 
                                                        width: '80px', 
                                                        padding: '6px', 
                                                        border: '1px solid #ddd', 
                                                        borderRadius: '4px',
                                                        textAlign: 'right',
                                                        backgroundColor: isEditable ? 'white' : '#f0f0f0',
                                                        cursor: isEditable ? 'text' : 'not-allowed'
                                                    }} 
                                                />
                                            </td>
                                            <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0' }}>
                                                <select 
                                                    value={item.invoice_uom || '1'}
                                                    onChange={(e) => handleItemChange(index, 'invoice_uom', e.target.value)}
                                                    disabled={!isEditable}
                                                    style={{ 
                                                        width: '110px', 
                                                        padding: '6px', 
                                                        border: '1px solid #ddd', 
                                                        borderRadius: '4px',
                                                        backgroundColor: isEditable ? 'white' : '#f0f0f0',
                                                        cursor: isEditable ? 'pointer' : 'not-allowed'
                                                    }}
                                                >
                                                    {units.map(unit => (
                                                        <option key={unit.id} value={unit.id}>{unit.name}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0' }}>
                                                <input 
                                                    type="number" value={item.rate || ''}
                                                    onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                                                    disabled={!isEditable}
                                                    style={{ 
                                                        width: '90px', 
                                                        padding: '6px', 
                                                        border: '1px solid #ddd', 
                                                        borderRadius: '4px',
                                                        textAlign: 'right',
                                                        backgroundColor: isEditable ? 'white' : '#f0f0f0',
                                                        cursor: isEditable ? 'text' : 'not-allowed'
                                                    }} 
                                                />
                                            </td>
                                            <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0', textAlign: 'right', color: '#666' }}>{item.discount || 0}</td>
                                            <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0', textAlign: 'right', color: '#666' }}>{item.gst || 0}</td>
                                            <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0', textAlign: 'right', fontWeight: '500', color: '#ff6600' }}>₹{item.calculated_amount || 0}</td>
                                            <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0' }}>
                                                <select 
                                                    value={item.location || 'Surya'}
                                                    onChange={(e) => handleItemChange(index, 'location', e.target.value)}
                                                    disabled={!isEditable}
                                                    style={{ 
                                                        width: '110px', 
                                                        padding: '6px', 
                                                        border: '1px solid #ddd', 
                                                        borderRadius: '4px',
                                                        backgroundColor: isEditable ? 'white' : '#f0f0f0',
                                                        cursor: isEditable ? 'pointer' : 'not-allowed'
                                                    }}
                                                >
                                                    <option value="Surya">Surya</option>
                                                    <option value="Vividh">Vividh</option>
                                                    <option value="Susham">Susham</option>
                                                    <option value="Rackline">Rackline</option>
                                                    <option value="SD-5">SD-5</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                    <tr style={{ 
                                        backgroundColor: '#fff3e0', 
                                        fontWeight: '600',
                                        borderTop: '2px solid #ff6600'
                                    }}>
                                        <td colSpan="6" style={{ 
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
                                            {totals.totalPoQty}
                                        </td>
                                        <td style={{ 
                                            padding: '12px 16px', 
                                            border: '1px solid #e0e0e0', 
                                            textAlign: 'right',
                                            fontSize: '0.95rem',
                                            fontWeight: '700'
                                        }}>
                                            {totals.totalRemainingQty}
                                        </td>
                                        <td colSpan="2" style={{ 
                                            padding: '12px 16px', 
                                            border: '1px solid #e0e0e0', 
                                            textAlign: 'right',
                                            fontSize: '0.95rem',
                                            fontWeight: '700',
                                            color: '#ff6600'
                                        }}>
                                            {totals.totalInwardQty}
                                        </td>
                                        <td style={{ 
                                            padding: '12px 16px', 
                                            border: '1px solid #e0e0e0', 
                                            textAlign: 'right',
                                            fontSize: '0.95rem',
                                            fontWeight: '700'
                                        }}>
                                            {totals.totalWeight.toFixed(2)}
                                        </td>
                                        <td colSpan="5" style={{ 
                                            padding: '12px 16px', 
                                            border: '1px solid #e0e0e0', 
                                            textAlign: 'right',
                                            fontSize: '0.95rem',
                                            fontWeight: '700'
                                        }}>
                                            Total Basic Amount
                                        </td>
                                        <td style={{ 
                                            padding: '12px 16px', 
                                            border: '1px solid #e0e0e0', 
                                            textAlign: 'right',
                                            fontSize: '1rem',
                                            fontWeight: '700',
                                            color: '#ff6600'
                                        }}>
                                            ₹ {calculateTotalBasicAmount().toFixed(2)}
                                        </td>
                                        <td style={{ 
                                            padding: '12px 16px', 
                                            border: '1px solid #e0e0e0',
                                            textAlign: 'right'
                                        }}>
                                            -
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

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
                                <span style={{ fontWeight: '600', color: '#333' }}>₹ {calculateTotalBasicAmount().toFixed(2)}</span>
                            </div>
                            <div style={{ 
    display: 'flex', 
    justifyContent: 'space-between', 
    padding: '12px 20px', 
    borderBottom: '1px solid #e0e0e0',
    backgroundColor: 'white',
    alignItems: 'center'
}}>
    <span style={{ fontWeight: '600', color: '#333' }}>Other Charges</span>
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span style={{ fontWeight: '600', color: '#333' }}>₹</span>
        <input
            type="number"
            value={freightCharges || '0'}
            onChange={(e) => handleFreightChargeChange(e.target.value)}
            disabled={!isEditable}
            style={{
                width: '100px',
                padding: '6px 8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                textAlign: 'right',
                fontWeight: '600',
                color: '#333',
                fontSize: '0.95rem',
                backgroundColor: isEditable ? 'white' : '#f0f0f0',
                cursor: isEditable ? 'text' : 'not-allowed'
            }}
        />
    </div>
</div>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                padding: '12px 20px', 
                                borderBottom: '1px solid #e0e0e0',
                                backgroundColor: '#fafafa'
                            }}>
                                <span style={{ fontWeight: '600', color: '#333' }}>Total Amount</span>
                                <span style={{ fontWeight: '600', color: '#333' }}>₹ {calculateTotalAmount().toFixed(2)}</span>
                            </div>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                padding: '12px 20px', 
                                borderBottom: '2px solid #ff6600',
                                backgroundColor: 'white'
                            }}>
                                <span style={{ fontWeight: '600', color: '#333' }}>GST Amount</span>
                                <span style={{ fontWeight: '600', color: '#333' }}>₹ {calculateGSTAmount().toFixed(2)}</span>
                            </div>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                padding: '15px 20px',
                                background: 'linear-gradient(135deg, #ffcccc 0%, #ffb3b3 100%)'
                            }}>
                                <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#333' }}>Grand Total</span>
                                <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#dc3545' }}>₹ {calculateGrandTotal().toFixed(2)}</span>
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
    {grn_details?.grn_approval_status === "1" ? (
        <>
            <button 
                style={{
                    padding: '12px 40px',
                    fontSize: '0.95rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #ff6600 0%, #ff8533 100%)',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    boxShadow: '0 4px 12px rgba(255, 102, 0, 0.3)',
                    transition: 'all 0.3s ease',
                    minWidth: '200px'
                }}
                onClick={handleApproval}
                onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(255, 102, 0, 0.4)';
                }}
                onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(255, 102, 0, 0.3)';
                }}
            >
                ✓ Approval For Inward Material
            </button>
            <button 
                style={{
                    padding: '12px 40px',
                    fontSize: '0.95rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    boxShadow: '0 4px 12px rgba(220, 53, 69, 0.3)',
                    transition: 'all 0.3s ease',
                    minWidth: '150px'
                }}
                onClick={handleReject}
                onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(220, 53, 69, 0.4)';
                }}
                onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.3)';
                }}
            >
                ✗ Reject
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
                onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(0, 123, 255, 0.4)';
                }}
                onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0, 123, 255, 0.3)';
                }}
            >
                🖨️ Print
            </button>
        </>
    ) : null}
    
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

export default GRNDetailsView;