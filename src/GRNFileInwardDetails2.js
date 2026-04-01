import React, { useEffect, useState } from "react";

const GRNCreateForm = () => {
    const getPoIdFromUrl = () => {
        const hash = window.location.hash;
        const parts = hash.split('/');
        return parts[parts.length - 1] || '';
    };

    const [poId, setPoId] = useState(getPoIdFromUrl());
    const [loading, setLoading] = useState(false);
    const [headerData, setHeaderData] = useState(null);
    const [materials, setMaterials] = useState([]);
    const [totals, setTotals] = useState({ total_po_qty: 0, total_remaining_qty: 0 });
    const [units, setUnits] = useState([
        { id: '1', name: 'NOS' },
        { id: '2', name: 'KG' },
        { id: '3', name: 'MTR' },
        { id: '4', name: 'LTR' }
    ]);
    
    // Form fields
    const [challanNo, setChallanNo] = useState('');
    const [challanDate, setChallanDate] = useState('');
    const [billDate, setBillDate] = useState('');
    const [tempInvoice, setTempInvoice] = useState('');
    const [transporter, setTransporter] = useState('');
    const [enteredBy, setEnteredBy] = useState('susham');
    const [billAmount, setBillAmount] = useState('');
    const [freightCharges, setFreightCharges] = useState('0');
    const [vehicleNo, setVehicleNo] = useState('');
    const [remark, setRemark] = useState('');
    const [note, setNote] = useState('FOR STOCK');
    const [isTempInvoice, setIsTempInvoice] = useState(false);

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

    const fetchHeaderData = async () => {
        if (!poId) return;

        setLoading(true);
        try {
            const response = await fetch(
                `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/get_grn_header_api.php?po_id=${poId}`,
                { method: "GET", headers: { "Content-Type": "application/json" } }
            );

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();

            if (data.status && data.data) {
                setHeaderData(data.data);
                showToast('GRN header loaded successfully', 'success');
            } else {
                showToast('Failed to load GRN header', 'error');
            }
        } catch (error) {
            console.error("Error fetching header:", error);
            showToast(`Error: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    // const fetchMaterialsData = async () => {
    //     if (!poId) return;

    //     try {
    //         const response = await fetch(
    //             `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/get_grn_materials_api.php?po_id=${poId}`,
    //             { method: "GET", headers: { "Content-Type": "application/json" } }
    //         );

    //         if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    //         const data = await response.json();

    //         if (data.status) {
    //             const materialsWithInputs = (data.materials || []).map(material => ({
    //                 ...material,
    //                 inward_qty: '',
    //                 weight: '',
    //                 invoice_uom: '1',
    //                 calculated_amount: '0'
    //             }));
    //             setMaterials(materialsWithInputs);
    //             setTotals(data.totals || { total_po_qty: 0, total_remaining_qty: 0 });
    //         }
    //     } catch (error) {
    //         console.error("Error fetching materials:", error);
    //         showToast(`Error loading materials: ${error.message}`, 'error');
    //     }
    // };
    const fetchMaterialsData = async () => {
        if (!poId) return;
    
        try {
            const response = await fetch(
                `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/get_grn_materials_api.php?po_id=${poId}`,
                { method: "GET", headers: { "Content-Type": "application/json" } }
            );
    
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
            const data = await response.json();
    
            if (data.status) {
                const materialsWithInputs = (data.materials || []).map(material => ({
                    ...material,
                    inward_qty: '',
                    weight: '',
                    invoice_uom: '1',
                    calculated_amount: '0'
                }));
                setMaterials(materialsWithInputs);
                setUnits(data.units || []); // Use units from API
                setTotals(data.totals || { total_po_qty: 0, total_remaining_qty: 0 });
            }
        } catch (error) {
            console.error("Error fetching materials:", error);
            showToast(`Error loading materials: ${error.message}`, 'error');
        }
    };
    useEffect(() => {
        if (poId) {
            fetchHeaderData();
            fetchMaterialsData();
        }
    }, [poId]);

    // const handleMaterialChange = (index, field, value) => {
    //     const updatedMaterials = [...materials];
    //     updatedMaterials[index][field] = value;
        
    //     // Calculate amount when inward_qty changes
    //     if (field === 'inward_qty') {
    //         const inwardQty = parseFloat(value) || 0;
    //         const rate = parseFloat(updatedMaterials[index].rate) || 0;
    //         const discount = parseFloat(updatedMaterials[index].discount) || 0;
            
    //         const basicAmount = inwardQty * rate;
    //         const discountAmount = (basicAmount * discount) / 100;
    //         const amountAfterDiscount = basicAmount - discountAmount;
            
    //         updatedMaterials[index].calculated_amount = amountAfterDiscount.toFixed(2);
    //     }
        
    //     setMaterials(updatedMaterials);
    // };

    const handleMaterialChange = (index, field, value) => {
        const updatedMaterials = [...materials];
        
        // Validate Inward Qty against PO Remaining
        if (field === 'inward_qty') {
            const inwardQty = parseFloat(value) || 0;
            const poRemaining = parseFloat(updatedMaterials[index].po_remaining) || 0;
            
            if (inwardQty > poRemaining) {
                showToast(`Inward Qty cannot exceed PO Remaining (${poRemaining})`, 'error');
                return;
            }
            
            // Calculate GRN Balance (PO Remaining - Inward Qty)
            updatedMaterials[index].grn_bal = (poRemaining - inwardQty).toFixed(2);
            
            // Calculate amount
            const rate = parseFloat(updatedMaterials[index].rate) || 0;
            const discount = parseFloat(updatedMaterials[index].discount) || 0;
            
            const basicAmount = inwardQty * rate;
            const discountAmount = (basicAmount * discount) / 100;
            const amountAfterDiscount = basicAmount - discountAmount;
            
            updatedMaterials[index].calculated_amount = amountAfterDiscount.toFixed(2);
        }
        
        updatedMaterials[index][field] = value;
        setMaterials(updatedMaterials);
    };

    const calculateTotalBasicAmount = () => {
        return materials.reduce((sum, material) => {
            const inwardQty = parseFloat(material.inward_qty) || 0;
            const rate = parseFloat(material.rate) || 0;
            return sum + (inwardQty * rate);
        }, 0);
    };

    const calculateTotalDiscount = () => {
        return materials.reduce((sum, material) => {
            const inwardQty = parseFloat(material.inward_qty) || 0;
            const rate = parseFloat(material.rate) || 0;
            const discount = parseFloat(material.discount) || 0;
            const basicAmount = inwardQty * rate;
            return sum + ((basicAmount * discount) / 100);
        }, 0);
    };

    const calculateTotalAmount = () => {
        const basicAmount = calculateTotalBasicAmount();
        const discount = calculateTotalDiscount();
        const otherCharges = parseFloat(freightCharges) || 0;
        return basicAmount - discount + otherCharges;
    };

    const calculateGSTAmount = () => {
        return materials.reduce((sum, material) => {
            const amount = parseFloat(material.calculated_amount) || 0;
            const gstRate = parseFloat(material.gst) || 0;
            return sum + ((amount * gstRate) / 100);
        }, 0);
    };

    const calculateGrandTotal = () => {
        const totalAmount = calculateTotalAmount();
        const gstAmount = calculateGSTAmount();
        return totalAmount + gstAmount;
    };

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

        const hasInwardQty = materials.some(material => parseFloat(material.inward_qty) > 0);
        if (!hasInwardQty) {
            showToast('Please enter Inward Quantity for at least one item', 'error');
            return;
        }

        // Prepare data for API
        const materialsWithQty = materials.filter(material => parseFloat(material.inward_qty) > 0);
        
        const materil_id = materialsWithQty.map(m => m.material_id);
        const inward_qty = materialsWithQty.map(m => m.inward_qty);
        const unit = materialsWithQty.map(m => m.invoice_uom);
        const location = materialsWithQty.map(m => '1'); // Default location value from select
        const weightData = materialsWithQty.map(m => m.weight || '0');
        const make = materialsWithQty.map(m => m.make_id || '');
        const file_id = materialsWithQty.map(m => m.file_id || '');
        const rate = materialsWithQty.map(m => m.rate || '0');
        const remaining_qty = materialsWithQty.map(m => m.grn_bal || '0');

        const payload = {
            po_id: poId,
            challan_no: challanNo,
            challan_date: challanDate,
            grn_date: headerData?.grn_date || new Date().toISOString().split('T')[0],
            supplierID: headerData?.customer_id || '',
            bill_no: tempInvoice || '',
            bill_date: billDate || null,
            bill_amt: billAmount || '0',
            transporter_name: transporter || '',
            vehicle_no: vehicleNo || '',
            remark: remark || '',
            employee_id: 1,
            freight_charges: freightCharges || '0',
            is_temp_invoice: isTempInvoice,
            materil_id: materil_id,
            inward_qty: inward_qty,
            unit: unit,
            location: location,
            weight: weightData,
            make: make,
            file_id: file_id,
            rate: rate,
            remaining_qty: remaining_qty,
            total_basic_amt: calculateTotalBasicAmount().toFixed(2),
            other_charges: freightCharges || '0',
            total_amt: calculateTotalAmount().toFixed(2),
            gst_amt: calculateGSTAmount().toFixed(2),
            grand_total: calculateGrandTotal().toFixed(2)
        };

        setLoading(true);
        
        try {
            const response = await fetch(
                'https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/saveGrnSendApprovalApi.php',
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
                
                setTimeout(() => {
                    window.history.back();
                }, 2000);
            } else {
                showToast(result.message || 'Failed to save GRN', 'error');
            }
        } catch (error) {
            console.error('Submit error:', error);
            showToast('Network error. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
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

    if (loading && !headerData) {
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
                        📦 GRN Against Purchase Order
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
                    {/* Top Section - Two Columns */}
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                        gap: '20px', 
                        marginBottom: '20px' 
                    }}>
                        {/* Left Column - Supplier Info */}
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
                            <div style={{ marginBottom: '15px' }}>
                                <label style={labelStyle}>Supplier Name</label>
                                <input 
                                    type="text" 
                                    value={headerData?.supplier_name || ''} 
                                    readOnly 
                                    style={{...inputStyle, backgroundColor: '#f0f0f0', cursor: 'not-allowed'}}
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
                                    value={headerData?.supplier_gst_no || ''} 
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
                                        value={headerData?.generated_grn_no || ''} 
                                        readOnly 
                                        style={{...inputStyle, backgroundColor: '#e8f5e9', fontWeight: '600', cursor: 'not-allowed'}}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>GRN Date</label>
                                    <input 
                                        type="text" 
                                        value={headerData?.grn_date ? new Date(headerData.grn_date).toLocaleDateString('en-GB') : ''} 
                                        readOnly 
                                        style={{...inputStyle, backgroundColor: '#f0f0f0', cursor: 'not-allowed'}}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '15px' }}>
                                <div>
                                    <label style={labelStyle}>PO No</label>
                                    <input 
                                        type="text" 
                                        value={headerData?.po_id || poId} 
                                        readOnly 
                                        style={{...inputStyle, backgroundColor: '#e3f2fd', fontWeight: '600', cursor: 'not-allowed'}}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>PO Date</label>
                                    <input 
                                        type="text" 
                                        value={headerData?.po_date || ''} 
                                        readOnly 
                                        style={{...inputStyle, backgroundColor: '#f0f0f0', cursor: 'not-allowed'}}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '15px' }}>
                                <div>
                                    <label style={labelStyle}>
                                        <input 
                                            type="checkbox" 
                                            checked={isTempInvoice}
                                            onChange={(e) => setIsTempInvoice(e.target.checked)}
                                            style={{ marginRight: '5px' }}
                                        />
                                        Bill No
                                    </label>
                                    <input 
                                        type="text" 
                                        value={tempInvoice}
                                        onChange={(e) => setTempInvoice(e.target.value)}
                                        placeholder="Temp_2"
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
                                    <label style={labelStyle}>PO Amount</label>
                                    <input 
                                        type="text" 
                                        value={headerData?.po_amount_with_tax ? `₹ ${headerData.po_amount_with_tax}` : '₹ 0'} 
                                        readOnly 
                                        style={{...inputStyle, backgroundColor: '#fff3e0', fontWeight: '600', cursor: 'not-allowed'}}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Fields Row */}
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
                            <label style={labelStyle}>Freight Charges</label>
                            <input 
                                type="text" 
                                value={freightCharges}
                                onChange={(e) => setFreightCharges(e.target.value)}
                                placeholder="0"
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
                        <div>
                            <label style={labelStyle}>Note</label>
                            <input 
                                type="text" 
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                style={{...inputStyle, color: '#ff6600', fontWeight: '600'}}
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
                                minWidth: '1400px'
                            }}>
                                <thead>
                                    <tr style={{ 
                                        background: 'linear-gradient(135deg, #ff6600 0%, #ff8533 100%)', 
                                        color: 'white' 
                                    }}>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', whiteSpace: 'nowrap', fontWeight: '600' }}>Sr. No.</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>HSN No</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>Material No</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', minWidth: '180px', fontWeight: '600' }}>Item</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>Make</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>File No</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>PO Qty</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>PO Rem.</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>GRN Bal</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>Inward Qty</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>PO UOM</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>Weight</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>Invoice UOM</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>Rate</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>Discount</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>GST</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>Amount</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>Category</th>
                                        <th style={{ padding: '12px 8px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>Location</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {materials.length === 0 ? (
                                        <tr>
                                            <td colSpan="19" style={{ 
                                                padding: '60px 20px', 
                                                textAlign: 'center', 
                                                color: '#999',
                                                backgroundColor: '#fafafa'
                                            }}>
                                                <div style={{ fontSize: '3rem', marginBottom: '15px', opacity: 0.5 }}>📦</div>
                                                <p style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: '500', color: '#666' }}>No materials found</p>
                                                <small style={{ color: '#999' }}>Materials will appear here when loaded</small>
                                            </td>
                                        </tr>
                                    ) : (
                                        materials.map((material, index) => (
                                            <tr key={index} style={{ 
                                                backgroundColor: index % 2 === 0 ? 'white' : '#fafafa',
                                                transition: 'background-color 0.2s'
                                            }}>
                                                <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0', textAlign: 'center', fontWeight: '500' }}>{index + 1}</td>
                                                <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0', color: '#666' }}>{material.hsn_no || ''}</td>
                                                <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0', color: '#666' }}>{material.material_no || ''}</td>
                                                <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0', fontWeight: '500' }}>{material.item || ''}</td>
                                                <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0', color: '#666' }}>{material.make || ''}</td>
                                                <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0', color: '#666' }}>{material.file_no || ''}</td>
                                                <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0', textAlign: 'center', fontWeight: '500' }}>{material.po_qty || 0}</td>
                                                <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0', textAlign: 'center', fontWeight: '500', color: '#ff6600' }}>{material.po_remaining || 0}</td>
                                                <td style={{ 
    padding: '10px 8px', 
    border: '1px solid #e0e0e0', 
    textAlign: 'center', 
    fontWeight: '500', 
    color: '#28a745',
    backgroundColor: parseFloat(material.grn_bal) > 0 ? '#e8f5e9' : 'transparent'
}}>
    {material.grn_bal}
</td>
                                                <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0' }}>
                                                    <input 
                                                        type="number" 
                                                        value={material.inward_qty}
                                                        onChange={(e) => handleMaterialChange(index, 'inward_qty', e.target.value)}
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
                                                <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0', textAlign: 'center', color: '#666' }}>{material.po_uom || 'NOS'}</td>
                                                <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0' }}>
                                                    <input 
                                                        type="text" 
                                                        value={material.weight}
                                                        onChange={(e) => handleMaterialChange(index, 'weight', e.target.value)}
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
                                                        value={material.invoice_uom}
                                                        onChange={(e) => handleMaterialChange(index, 'invoice_uom', e.target.value)}
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
                                                <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0', textAlign: 'right', fontWeight: '500', color: '#333' }}>₹{material.rate || 0}</td>
                                                <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0', textAlign: 'center', color: '#666' }}>{material.discount || 0}%</td>
                                                <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0', textAlign: 'center', color: '#666' }}>{material.gst || 0}%</td>
                                                <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0', textAlign: 'right', fontWeight: '500', color: '#ff6600' }}>₹{material.calculated_amount}</td>
                                                <td style={{ padding: '10px 8px', border: '1px solid #e0e0e0', fontSize: '0.8rem', color: '#666' }}>{material.category || ''}</td>
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
                                                        <option value="3">Vivid</option>
                                                        <option value="4">Racline</option>
                                                        <option value="5">Other</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                    {/* Total Row */}
                                    {materials.length > 0 && (
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
                                                color: '#333'
                                            }}>
                                                Total:
                                            </td>
                                            <td style={{ 
                                                padding: '12px 16px', 
                                                border: '1px solid #e0e0e0', 
                                                textAlign: 'center',
                                                fontSize: '0.95rem',
                                                color: '#333'
                                            }}>
                                                {totals.total_po_qty}
                                            </td>
                                            <td style={{ 
                                                padding: '12px 16px', 
                                                border: '1px solid #e0e0e0', 
                                                textAlign: 'center',
                                                fontSize: '0.95rem',
                                                color: '#ff6600'
                                            }}>
                                                {totals.total_remaining_qty}
                                            </td>
                                            <td colSpan="8" style={{ 
                                                padding: '12px 16px', 
                                                border: '1px solid #e0e0e0', 
                                                textAlign: 'right',
                                                fontSize: '0.95rem',
                                                color: '#333'
                                            }}>
                                                Total Basic Amount:
                                            </td>
                                            <td style={{ 
                                                padding: '12px 16px', 
                                                border: '1px solid #e0e0e0', 
                                                textAlign: 'right',
                                                fontSize: '1rem',
                                                color: '#ff6600'
                                            }}>
                                                ₹ {calculateTotalBasicAmount().toFixed(2)}
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

                    {/* Summary Section */}
                    {materials.length > 0 && (
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
                                    backgroundColor: 'white'
                                }}>
                                    <span style={{ fontWeight: '600', color: '#333' }}>Other Charges</span>
                                    <span style={{ fontWeight: '600', color: '#dc3545' }}>{parseFloat(freightCharges || 0).toFixed(2)}</span>
                                </div>
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    padding: '12px 20px', 
                                    borderBottom: '1px solid #e0e0e0',
                                    backgroundColor: '#fafafa'
                                }}>
                                    <span style={{ fontWeight: '600', color: '#333' }}>Total Amount</span>
                                    <span style={{ fontWeight: '600', color: '#dc3545' }}>₹ {calculateTotalAmount().toFixed(2)}</span>
                                </div>
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    padding: '12px 20px', 
                                    borderBottom: '2px solid #ff6600',
                                    backgroundColor: 'white'
                                }}>
                                    <span style={{ fontWeight: '600', color: '#333' }}>GST Amount</span>
                                    <span style={{ fontWeight: '600', color: '#dc3545' }}>₹ {calculateGSTAmount().toFixed(2)}</span>
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
                    )}

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
                                background: loading ? '#ccc' : 'linear-gradient(135deg, #28a745 0%, #34ce57 100%)',
                                color: 'white',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)',
                                transition: 'all 0.3s ease',
                                minWidth: '200px'
                            }}
                            onClick={handleSubmit}
                            disabled={loading}
                            onMouseEnter={(e) => {
                                if (!loading) {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.4)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!loading) {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.3)';
                                }
                            }}
                        >
                            {loading ? '⏳ Saving...' : '💾 Save GRN'}
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

export default GRNCreateForm;