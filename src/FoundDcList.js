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
    CsvExportModule
} from "ag-grid-community";

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ValidationModule,
    DateFilterModule,
    NumberFilterModule,
    TextFilterModule,
    RowSelectionModule,
    PaginationModule,
    CsvExportModule
]);

// Styles
const labelStyle = {
    display: 'block',
    marginBottom: '6px',
    fontWeight: '600',
    fontSize: '0.9rem',
    color: '#374151'
};

const inputStyle = {
    width: '100%',
    padding: '10px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '0.95rem',
    transition: 'border-color 0.2s',
    outline: 'none',
    boxSizing: 'border-box'
};

const headerStyle = {
    padding: '12px 8px',
    color: 'white',
    fontWeight: '700',
    textAlign: 'center',
    border: '1px solid rgba(255,255,255,0.2)',
    fontSize: '0.85rem'
};

const cellStyle = {
    padding: '8px',
    border: '1px solid #e5e7eb',
    textAlign: 'center'
};

const tableInputStyle = {
    width: '100%',
    padding: '6px 8px',
    borderRadius: '4px',
    fontSize: '0.9rem',
    boxSizing: 'border-box'
};

const summaryBoxStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '5px'
};

// Foundry DC Detail Page Component
const FoundryDcDetailPage = ({ vendorId, fileId, dcId, sequenceCount, onBack }) => {
    const [loading, setLoading] = useState(false);
    const [dcData, setDcData] = useState({
        dcNo: '',
        dcDate: '',
        gstin: '',
        financialYear: '',
        companyName: '',
        companyAddress: '',
        customerName: '',
        customerAddress: '',
        customerGstin: '',
        fileName: '',
        fileId: ''
    });
    const [materials, setMaterials] = useState([]);
    const [totals, setTotals] = useState(null);

    const [formData, setFormData] = useState({
        despatchDate: '',
        entryNo: '',
        receiptDate: '',
        quantityDespatched: '',
        processingNature: '',
        wasteQtySupplier: '',
        wasteQtyWorker: '',
        goodsDescription: '',
        valueAmount: ''
    });

    const updateFormData = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!dcData.dcDate) {
            alert('Please ensure DC date is available');
            return;
        }
    
        if (materials.length === 0) {
            alert('No materials found in the delivery challan');
            return;
        }
    
        const submissionData = {
            vendorId,
            fileId,
            dcId,
            sequenceCount,
            dcData,
            materials,
            totals,
            jobWorkerDetails: formData
        };
    
        console.log('Submitting foundry DC data:', submissionData);
        alert('Foundry DC data submitted successfully!');
    };

    useEffect(() => {
        const fetchDcDetails = async () => {
            if (!vendorId || !fileId || !dcId) return;
            
            setLoading(true);
            try {
                const response = await fetch(
                    `http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/FoundDcDetailsApi.php?vednor=${vendorId}&file=${fileId}&dc_id=${dcId}&sequenceCount=${sequenceCount}`
                );
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const result = await response.json();
                
                if (result.status === 'success' && result.data) {
                    const data = result.data;
                    
                    setDcData({
                        dcNo: data.dc_info?.dc_no || '',
                        dcDate: data.dc_info?.dc_date || '',
                        gstin: data.dc_info?.gstin || '',
                        financialYear: data.dc_info?.financial_year || '',
                        companyName: data.company?.name || '',
                        companyAddress: data.company?.address || '',
                        customerName: data.customer?.name || '',
                        customerAddress: data.customer?.address || '',
                        customerGstin: data.customer?.gstin || '',
                        fileName: data.file?.name || '',
                        fileId: data.file?.id || ''
                    });
                    
                    if (data.materials && data.materials.length > 0) {
                        const formattedMaterials = data.materials.map((item, index) => ({
                            id: index + 1,
                            srNo: item.sr_no || index + 1,
                            materialId: item.material_id || '',
                            materialName: item.material_name || '',
                            hsn: item.hsn || '',
                            qty: item.qty || '',
                            unit: item.unit || 'NOS',
                            unitId: item.unit_id || '',
                            kg: item.kg || '',
                            rate: item.rate || '',
                            approxValue: item.approx_value || '',
                            tax: item.tax || '18',
                            cgst: item.cgst || 0,
                            sgst: item.sgst || 0,
                            rfdName: item.rfd_name || '',
                            moc: item.moc || '',
                            size: item.size || '',
                            length: item.length || '',
                            rfdQty: item.rfd_qty || '',
                            constantWeight: item.constant_weight || '',
                            constantRate: item.constant_rate || ''
                        }));
                        setMaterials(formattedMaterials);
                    }

                    if (data.totals) {
                        setTotals({
                            totalRawQty: data.totals.total_raw_qty || 0,
                            totalKg: data.totals.total_kg || 0,
                            totalValue: data.totals.total_value || 0,
                            totalTax: data.totals.total_tax || 0,
                            grandTotal: data.totals.grand_total || 0,
                            totalRfdQty: data.totals.total_rfd_qty || 0
                        });
                    }
                }
            } catch (error) {
                console.error('Error fetching DC details:', error);
                alert('Error loading DC details: ' + error.message);
            } finally {
                setLoading(false);
            }
        };
        
        fetchDcDetails();
    }, [dcId, vendorId, fileId, sequenceCount]);

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%)'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '3rem',
                        height: '3rem',
                        border: '4px solid rgba(245, 158, 11, 0.2)',
                        borderTopColor: '#f59e0b',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto'
                    }} />
                    <p style={{ marginTop: '1rem', fontWeight: '600', color: '#1f2937' }}>Loading DC details...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            padding: '10px'
        }}>
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                overflow: 'hidden'
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: 'white',
                    padding: '16px 20px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
                            Delivery Challan for Foundry
                        </h3>
                        <small style={{ opacity: 0.9 }}>
                            DC ID: {dcId} | File: {fileId} | Vendor: {vendorId}
                        </small>
                    </div>
                    <button
                        onClick={onBack}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: 'white',
                            color: '#f59e0b',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.95rem',
                            transition: 'all 0.3s'
                        }}
                        onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                    >
                        ← Back to List
                    </button>
                </div>

                <div style={{
                    padding: '20px',
                    borderBottom: '2px solid #e5e7eb',
                    background: '#fffbeb'
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '15px',
                        marginBottom: '15px'
                    }}>
                        <div>
                            <label style={labelStyle}>D.C. NO.</label>
                            <input
                                type="text"
                                value={dcData.dcNo}
                                readOnly
                                style={{...inputStyle, backgroundColor: '#fef3c7', fontWeight: '700', color: '#92400e'}}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Date</label>
                            <input
                                type="text"
                                value={dcData.dcDate}
                                readOnly
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Company GSTIN</label>
                            <input
                                type="text"
                                value={dcData.gstin}
                                readOnly
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Financial Year</label>
                            <input
                                type="text"
                                value={dcData.financialYear}
                                readOnly
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    <div style={{
                        padding: '15px',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb'
                    }}>
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', color: '#1f2937' }}>
                            {dcData.companyName}
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#6b7280' }}>
                            {dcData.companyAddress}
                        </p>
                    </div>

                    <div style={{ marginTop: '15px' }}>
                        <label style={labelStyle}>File: {dcData.fileName}</label>
                        <p style={{ 
                            margin: '5px 0 0 0', 
                            fontSize: '1rem', 
                            fontWeight: '600',
                            color: '#1f2937'
                        }}>
                            To: {dcData.customerName}
                        </p>
                        {dcData.customerAddress && (
                            <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#6b7280' }}>
                                {dcData.customerAddress}
                            </p>
                        )}
                        {dcData.customerGstin && (
                            <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#6b7280' }}>
                                GSTIN: {dcData.customerGstin}
                            </p>
                        )}
                        <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#6b7280' }}>
                            Please receive the following material in good condition along with necessary drawing.
                        </p>
                    </div>
                </div>

                <div style={{ padding: '20px' }}>
                    <div style={{
                        overflowX: 'auto',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            minWidth: '1400px'
                        }}>
                            <thead>
                                <tr style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                                    <th style={headerStyle}>Sr</th>
                                    <th style={headerStyle}>Material Name</th>
                                    <th style={headerStyle}>RFD Name</th>
                                    <th style={headerStyle}>MOC</th>
                                    <th style={headerStyle}>Size</th>
                                    <th style={headerStyle}>Length</th>
                                    <th style={headerStyle}>HSN</th>
                                    <th style={headerStyle}>Qty</th>
                                    <th style={headerStyle}>Unit</th>
                                    <th style={headerStyle}>Kg</th>
                                    <th style={headerStyle}>Rate</th>
                                    <th style={headerStyle}>Value</th>
                                    <th style={headerStyle}>Tax%</th>
                                    <th style={headerStyle}>CGST</th>
                                    <th style={headerStyle}>SGST</th>
                                    <th style={headerStyle}>RFD Qty</th>
                                </tr>
                            </thead>
                            <tbody>
                                {materials.map((item, index) => (
                                    <tr key={item.id} style={{
                                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#fffbeb'
                                    }}>
                                        <td style={cellStyle}>
                                            <div style={{...tableInputStyle, textAlign: 'center', fontWeight: '600', backgroundColor: '#fef3c7'}}>
                                                {item.srNo}
                                            </div>
                                        </td>
                                        <td style={cellStyle}>
                                            <div style={{...tableInputStyle, backgroundColor: '#fef3c7', textAlign: 'right', fontSize: '0.85rem'}}>
                                                {item.materialName}
                                            </div>
                                        </td>
                                        <td style={cellStyle}>
                                            <div style={{...tableInputStyle, backgroundColor: '#fef3c7', textAlign: 'right'}}>
                                                {item.rfdName}
                                            </div>
                                        </td>
                                        <td style={cellStyle}>
                                            <div style={{...tableInputStyle, backgroundColor: '#fef3c7', textAlign: 'center'}}>
                                                {item.moc}
                                            </div>
                                        </td>
                                        <td style={cellStyle}>
                                            <div style={{...tableInputStyle, backgroundColor: '#fef3c7', textAlign: 'center'}}>
                                                {item.size}
                                            </div>
                                        </td>
                                        <td style={cellStyle}>
                                            <div style={{...tableInputStyle, backgroundColor: '#fef3c7', textAlign: 'center'}}>
                                                {item.length}
                                            </div>
                                        </td>
                                        <td style={cellStyle}>
                                            <div style={{...tableInputStyle, backgroundColor: '#fef3c7', textAlign: 'center'}}>
                                                {item.hsn}
                                            </div>
                                        </td>
                                        <td style={cellStyle}>
                                            <div style={{...tableInputStyle, backgroundColor: '#fef3c7', textAlign: 'center', fontWeight: '600'}}>
                                                {item.qty}
                                            </div>
                                        </td>
                                        <td style={cellStyle}>
                                            <div style={{...tableInputStyle, backgroundColor: '#fef3c7', textAlign: 'center'}}>
                                                {item.unit}
                                            </div>
                                        </td>
                                        <td style={cellStyle}>
                                            <div style={{...tableInputStyle, backgroundColor: '#fef3c7', textAlign: 'center', fontWeight: '600'}}>
                                                {item.kg}
                                            </div>
                                        </td>
                                        <td style={cellStyle}>
                                            <div style={{...tableInputStyle, backgroundColor: '#fef3c7', textAlign: 'right'}}>
                                                {parseFloat(item.rate).toFixed(2)}
                                            </div>
                                        </td>
                                        <td style={cellStyle}>
                                            <div style={{...tableInputStyle, backgroundColor: '#fef3c7', textAlign: 'right', fontWeight: '600'}}>
                                                {parseFloat(item.approxValue).toFixed(2)}
                                            </div>
                                        </td>
                                        <td style={cellStyle}>
                                            <div style={{...tableInputStyle, backgroundColor: '#fef3c7', textAlign: 'center'}}>
                                                {item.tax}%
                                            </div>
                                        </td>
                                        <td style={cellStyle}>
                                            <div style={{...tableInputStyle, backgroundColor: '#fef3c7', textAlign: 'right'}}>
                                                {parseFloat(item.cgst).toFixed(2)}
                                            </div>
                                        </td>
                                        <td style={cellStyle}>
                                            <div style={{...tableInputStyle, backgroundColor: '#fef3c7', textAlign: 'right'}}>
                                                {parseFloat(item.sgst).toFixed(2)}
                                            </div>
                                        </td>
                                        <td style={cellStyle}>
                                            <div style={{...tableInputStyle, backgroundColor: '#fef3c7', textAlign: 'center', fontWeight: '600'}}>
                                                {item.rfdQty}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {totals && (
                                    <tr style={{ backgroundColor: '#fef3c7', fontWeight: '700' }}>
                                        <td colSpan="7" style={{...cellStyle, textAlign: 'center', fontSize: '1rem'}}>
                                            TOTAL
                                        </td>
                                        <td style={{...cellStyle, textAlign: 'center', color: '#f59e0b', fontSize: '1.1rem'}}>
                                            {totals.totalRawQty}
                                        </td>
                                        <td style={cellStyle}></td>
                                        <td style={{...cellStyle, textAlign: 'center', color: '#f59e0b', fontSize: '1.1rem'}}>
                                            {totals.totalKg}
                                        </td>
                                        <td colSpan="5" style={cellStyle}></td>
                                        <td style={{...cellStyle, textAlign: 'center', color: '#f59e0b', fontSize: '1.1rem'}}>
                                            {totals.totalRfdQty}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totals && (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: '15px',
                            marginTop: '20px',
                            padding: '20px',
                            backgroundColor: '#fffbeb',
                            borderRadius: '8px',
                            border: '2px solid #fbbf24'
                        }}>
                            <div style={summaryBoxStyle}>
                                <span style={{ fontSize: '0.9rem', color: '#92400e' }}>TOTAL VALUE</span>
                                <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>
                                    ₹ {parseFloat(totals.totalValue).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                </span>
                            </div>
                            <div style={summaryBoxStyle}>
                                <span style={{ fontSize: '0.9rem', color: '#92400e' }}>TOTAL TAX</span>
                                <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>
                                    ₹ {parseFloat(totals.totalTax).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                </span>
                            </div>
                            <div style={summaryBoxStyle}>
                                <span style={{ fontSize: '0.9rem', color: '#92400e' }}>GRAND TOTAL</span>
                                <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f59e0b' }}>
                                    ₹ {parseFloat(totals.grandTotal).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                </span>
                            </div>
                        </div>
                    )}

                    <div style={{
                        marginTop: '20px',
                        padding: '15px',
                        backgroundColor: '#fef3c7',
                        borderRadius: '8px',
                        textAlign: 'center',
                        border: '1px dashed #f59e0b'
                    }}>
                        <p style={{ margin: 0, fontWeight: '600', color: '#92400e' }}>
                            THIS IS COMPUTER GENERATED DC HENCE SIGNATURE NOT REQUIRED
                        </p>
                        <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: '#92400e' }}>
                            Finished Goods Ordered for conversion as per our instructions.
                        </p>
                    </div>

                    <div style={{
                        marginTop: '25px',
                        padding: '20px',
                        backgroundColor: '#fef2f2',
                        borderRadius: '8px',
                        border: '2px solid #ef4444'
                    }}>
                        <h4 style={{ 
                            margin: '0 0 15px 0', 
                            color: '#991b1b',
                            fontSize: '1.2rem',
                            fontWeight: '700',
                            textAlign: 'center'
                        }}>
                            TO BE FILLED IN BY THE JOB WORKER IN ORIGINAL & DUPLICATE
                        </h4>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: '15px'
                        }}>
                            <div>
                                <label style={labelStyle}>1. Date of despatch & entry No.</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <input
                                        type="date"
                                        value={formData.despatchDate}
                                        onChange={(e) => updateFormData('despatchDate', e.target.value)}
                                        style={inputStyle}
                                    />
                                    <input
                                        type="text"
                                        value={formData.entryNo}
                                        onChange={(e) => updateFormData('entryNo', e.target.value)}
                                        placeholder="Entry No."
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>Receipt Date in Account</label>
                                <input
                                    type="date"
                                    value={formData.receiptDate}
                                    onChange={(e) => updateFormData('receiptDate', e.target.value)}
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        <div style={{ marginTop: '15px' }}>
                            <label style={labelStyle}>2. Quantity despatched</label>
                            <input
                                type="text"
                                value={formData.quantityDespatched}
                                onChange={(e) => updateFormData('quantityDespatched', e.target.value)}
                                style={inputStyle}
                            />
                        </div>

                        <div style={{ marginTop: '15px' }}>
                            <label style={labelStyle}>3. Nature of processing</label>
                            <textarea
                                value={formData.processingNature}
                                onChange={(e) => updateFormData('processingNature', e.target.value)}
                                rows="2"
                                style={{...inputStyle, resize: 'vertical'}}
                            />
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: '15px',
                            marginTop: '15px'
                        }}>
                            <div>
                                <label style={labelStyle}>4. Waste returned to supplier</label>
                                <input
                                    type="text"
                                    value={formData.wasteQtySupplier}
                                    onChange={(e) => updateFormData('wasteQtySupplier', e.target.value)}
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>5. Waste retained by job worker</label>
                                <input
                                    type="text"
                                    value={formData.wasteQtyWorker}
                                    onChange={(e) => updateFormData('wasteQtyWorker', e.target.value)}
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        <div style={{ marginTop: '15px' }}>
                            <label style={labelStyle}>6. Description & quantity of goods</label>
                            <textarea
                                value={formData.goodsDescription}
                                onChange={(e) => updateFormData('goodsDescription', e.target.value)}
                                rows="2"
                                style={{...inputStyle, resize: 'vertical'}}
                            />
                        </div>

                        <div style={{ marginTop: '15px' }}>
                            <label style={labelStyle}>7. Value / Amount</label>
                            <input
                                type="number"
                                value={formData.valueAmount}
                                onChange={(e) => updateFormData('valueAmount', e.target.value)}
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '30px', marginBottom: '20px' }}>
                        <button
                            onClick={handleSubmit}
                            style={{
                                padding: '14px 50px',
                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '1.1rem',
                                fontWeight: '700',
                                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                                transition: 'all 0.3s'
                            }}
                            onMouseOver={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.4)';
                            }}
                            onMouseOut={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
                            }}
                        >
                            Submit Foundry DC
                        </button>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

// Main Grid Component
const FoundryDcGrid = () => {
    const [theme, setTheme] = useState('light');
    const [rowData, setRowData] = useState([]);
    const [columnDefs, setColumnDefs] = useState([]);
    const [isFullScreen// Continuation of FoundryDcGrid component

        , setIsFullScreen] = useState(true);
            const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
            const [loading, setLoading] = useState(false);
            const [selectedRows, setSelectedRows] = useState([]);
            const [financialYear, setFinancialYear] = useState('25-26');
            const [financialYearOptions, setFinancialYearOptions] = useState([]);
            const [totalCount, setTotalCount] = useState(0);
            const [toasts, setToasts] = useState([]);
            const [showDetailPage, setShowDetailPage] = useState(false);
            const [selectedDc, setSelectedDc] = useState(null);
            const gridRef = useRef();
        
            const showToast = (message, type = 'success') => {
                const id = Date.now();
                setToasts(prev => [...prev, { id, message, type }]);
                setTimeout(() => {
                    setToasts(prev => prev.filter(t => t.id !== id));
                }, 3000);
            };
        
            const fetchFinancialYears = async () => {
                try {
                    const response = await fetch("https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/GetYearsApi.php");
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
        
                    const data = await response.json();
        
                    if (data.status === "success" && Array.isArray(data.data)) {
                        const years = data.data.map(item => ({
                            value: item.financial_year,
                            label: `20${item.financial_year}`
                        }));
                        setFinancialYearOptions(years);
                        
                        if (years.length > 0) {
                            setFinancialYear(years[years.length - 1].value);
                        }
                    }
                } catch (error) {
                    console.error("Error fetching financial years:", error);
                    showToast("Error loading financial years", 'error');
                }
            };
        
            useEffect(() => {
                const handleResize = () => {
                    setIsMobile(window.innerWidth <= 768);
                };
                window.addEventListener('resize', handleResize);
                return () => window.removeEventListener('resize', handleResize);
            }, []);
        
            const generateColumnDefs = () => {
                const baseColumns = [
                    {
                        headerName: "Sr",
                        field: "count",
                        width: isMobile ? 60 : 80,
                        minWidth: 50,
                        pinned: 'left',
                        lockPosition: true,
                        cellStyle: { fontWeight: 'bold', textAlign: 'center' }
                    },
                    {
                        field: "dc_id",
                        headerName: "DC ID",
                        width: isMobile ? 120 : 150,
                        pinned: 'left',
                        checkboxSelection: true,
                        headerCheckboxSelection: true,
                        cellStyle: { fontWeight: '700', color: '#f59e0b', cursor: 'pointer' },
                        onCellClicked: (params) => {
                            if (params.data) {
                                setSelectedDc({
                                    vendorId: params.data.vendor_id,
                                    fileId: params.data.file_id,
                                    dcId: params.data.dc_id,
                                    sequenceCount: params.data.sequence_count
                                });
                                setShowDetailPage(true);
                            }
                        }
                    },
                    {
                        field: "file_name",
                        headerName: "File Name",
                        width: isMobile ? 160 : 200,
                        cellStyle: { fontWeight: '600' }
                    },
                    {
                        field: "customer_name",
                        headerName: "Customer Name",
                        width: isMobile ? 180 : 250,
                        cellStyle: { fontWeight: '500' }
                    },
                    {
                        field: "dc_date",
                        headerName: "DC Date",
                        width: isMobile ? 120 : 140,
                        cellStyle: { textAlign: 'center' }
                    },
                    {
                        field: "status",
                        headerName: "Status",
                        width: isMobile ? 140 : 160,
                        cellStyle: (params) => {
                            const status = params.value;
                            if (status === 'Vendor Assigned') {
                                return { backgroundColor: '#fef3c7', color: '#92400e', fontWeight: '600', textAlign: 'center' };
                            }
                            return { textAlign: 'center' };
                        }
                    },
                    {
                        field: "sequence_count",
                        headerName: "Sequence Count",
                        width: isMobile ? 120 : 140,
                        cellStyle: { textAlign: 'center', backgroundColor: '#fffbeb' }
                    },
                    {
                        field: "vendor_id",
                        headerName: "Vendor ID",
                        width: isMobile ? 100 : 120,
                        cellStyle: { textAlign: 'center' }
                    },
                    {
                        field: "file_id",
                        headerName: "File ID",
                        width: isMobile ? 100 : 120,
                        cellStyle: { textAlign: 'center' }
                    }
                ];
        
                return baseColumns;
            };
        
            const defaultColDef = useMemo(() => ({
                filter: true,
                sortable: true,
                floatingFilter: !isMobile,
                resizable: true,
                suppressMenu: isMobile,
                cellStyle: { textAlign: 'right' }
            }), [isMobile]);
        
            const fetchDcData = async (fy = financialYear) => {
                setLoading(true);
                try {
                    const response = await fetch(
                        `http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/Store/FoundDcListApi.php?financial_year=${fy}`
                    );
        
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
        
                    const data = await response.json();
        
                    if (data.status === 'success' && Array.isArray(data.data)) {
                        setRowData(data.data);
                        setTotalCount(data.total || data.data.length);
                        showToast(`Loaded ${data.data.length} DC records for FY ${fy}`, 'success');
                    } else {
                        throw new Error("Failed to fetch DC data");
                    }
                } catch (error) {
                    console.error("Error fetching DC data:", error);
                    showToast(`Error fetching data: ${error.message}`, 'error');
                    setRowData([]);
                    setTotalCount(0);
                } finally {
                    setLoading(false);
                }
            };
        
            useEffect(() => {
                setColumnDefs(generateColumnDefs());
                fetchFinancialYears();
            }, [isMobile]);
        
            useEffect(() => {
                if (financialYear) {
                    fetchDcData();
                }
            }, [financialYear]);
        
            const handleFinancialYearChange = (e) => {
                const newFY = e.target.value;
                setFinancialYear(newFY);
                fetchDcData(newFY);
            };
        
            const onSelectionChanged = (event) => {
                const selectedNodes = event.api.getSelectedNodes();
                const selectedData = selectedNodes.map(node => node.data);
                setSelectedRows(selectedData);
            };
        
            const toggleTheme = () => {
                setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
            };
        
            const toggleFullScreen = () => {
                setIsFullScreen(!isFullScreen);
            };
        
            const downloadExcel = () => {
                if (!gridRef.current?.api) return;
                
                try {
                    const params = {
                        fileName: `FoundryDC_${financialYear}_${new Date().toISOString().split('T')[0]}.csv`,
                        allColumns: true,
                        onlySelected: false
                    };
                    gridRef.current.api.exportDataAsCsv(params);
                    showToast('Data exported successfully!', 'success');
                } catch (error) {
                    console.error('Error exporting data:', error);
                    showToast('Error exporting data', 'error');
                }
            };
        
            const autoSizeAll = () => {
                if (!gridRef.current?.api) return;
                
                try {
                    setTimeout(() => {
                        const allColumnIds = gridRef.current.api.getColumns()?.map(column => column.getId()) || [];
                        if (allColumnIds.length > 0) {
                            gridRef.current.api.autoSizeColumns(allColumnIds, false);
                        }
                    }, 100);
                } catch (error) {
                    console.error('Error auto-sizing columns:', error);
                }
            };
        
            const refreshData = () => {
                fetchDcData(financialYear);
            };
        
            const handleNavigateToDetail = () => {
                if (selectedRows.length === 0) {
                    showToast('Please select at least one row', 'error');
                    return;
                }
                setSelectedDc({
                    vendorId: selectedRows[0].vendor_id,
                    fileId: selectedRows[0].file_id,
                    dcId: selectedRows[0].dc_id,
                    sequenceCount: selectedRows[0].sequence_count
                });
                setShowDetailPage(true);
            };
        
            const getThemeStyles = () => {
                if (theme === 'dark') {
                    return {
                        backgroundColor: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                        color: '#f1f5f9',
                        cardBg: '#1e293b',
                        cardHeader: 'linear-gradient(135deg, #78350f 0%, #451a03 100%)'
                    };
                }
                return {
                    backgroundColor: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                    color: '#0f172a',
                    cardBg: '#ffffff',
                    cardHeader: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'
                };
            };
        
            const themeStyles = getThemeStyles();
            const gridHeight = isFullScreen ? 'calc(100vh - 180px)' : (isMobile ? '400px' : '600px');
        
            useEffect(() => {
                document.body.style.background = themeStyles.backgroundColor;
                document.body.style.color = themeStyles.color;
                document.body.style.minHeight = '100vh';
        
                return () => {
                    document.body.style.background = '';
                    document.body.style.color = '';
                    document.body.style.minHeight = '';
                };
            }, [theme]);
        
            if (showDetailPage && selectedDc) {
                return (
                    <FoundryDcDetailPage
                        vendorId={selectedDc.vendorId}
                        fileId={selectedDc.fileId}
                        dcId={selectedDc.dcId}
                        sequenceCount={selectedDc.sequenceCount}
                        onBack={() => {
                            setShowDetailPage(false);
                            setSelectedDc(null);
                        }}
                    />
                );
            }
        
            if (loading) {
                return (
                    <div style={{
                        minHeight: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: themeStyles.backgroundColor
                    }}>
                        <div style={{ textAlign: 'center', color: themeStyles.color }}>
                            <div style={{
                                width: '3rem',
                                height: '3rem',
                                border: '4px solid rgba(245, 158, 11, 0.2)',
                                borderTopColor: '#f59e0b',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite',
                                margin: '0 auto'
                            }} />
                            <p style={{ marginTop: '1rem', fontWeight: '600' }}>Loading foundry DC records...</p>
                            <style>{`
                                @keyframes spin {
                                    to { transform: rotate(360deg); }
                                }
                            `}</style>
                        </div>
                    </div>
                );
            }
        
            return (
                <div style={{
                    minHeight: '100vh',
                    background: themeStyles.backgroundColor,
                    color: themeStyles.color,
                    padding: 0,
                    margin: 0
                }}>
                    <div style={{
                        position: 'fixed',
                        top: '1rem',
                        right: '1rem',
                        zIndex: 9999,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem'
                    }}>
                        {toasts.map(toast => (
                            <div
                                key={toast.id}
                                style={{
                                    padding: '1rem 1.5rem',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    color: 'white',
                                    backgroundColor: toast.type === 'success' ? '#10b981' : '#ef4444',
                                    animation: 'slideIn 0.3s ease-out',
                                    minWidth: '250px',
                                    fontWeight: '600'
                                }}
                            >
                                {toast.message}
                            </div>
                        ))}
                    </div>
        
                    <div style={{
                        width: '100%',
                        maxWidth: isFullScreen ? '100%' : '1400px',
                        margin: isFullScreen ? 0 : '20px auto',
                        padding: isFullScreen ? 0 : '0 20px'
                    }}>
                        <div style={{
                            backgroundColor: themeStyles.cardBg,
                            color: themeStyles.color,
                            border: theme === 'dark' ? '1px solid #78350f' : '1px solid #fde68a',
                            borderRadius: isFullScreen ? 0 : '12px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 20px rgba(245, 158, 11, 0.15)'
                        }}>
                            <div style={{
                                background: themeStyles.cardHeader,
                                color: theme === 'dark' ? '#ffffff' : '#78350f',
                                padding: '1.25rem 2rem',
                                borderBottom: theme === 'dark' ? '1px solid #78350f' : '1px solid #fde68a'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    flexDirection: isMobile ? 'column' : 'row',
                                    alignItems: isMobile ? 'flex-start' : 'center',
                                    justifyContent: 'space-between',
                                    gap: '1rem'
                                }}>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800' }}>
                                            🔥 Foundation DC Vendor Dashboard
                                        </h4>
                                        <small style={{ opacity: 0.8, display: 'block', marginTop: '0.5rem', fontSize: '0.95rem' }}>
                                            {totalCount} total records | {rowData.length} loaded
                                            {selectedRows.length > 0 && ` | ${selectedRows.length} selected`}
                                        </small>
                                    </div>
        
                                    <div style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '0.5rem',
                                        alignItems: 'center'
                                    }}>
                                        <select
                                            value={financialYear}
                                            onChange={handleFinancialYearChange}
                                            style={{
                                                padding: '0.5rem 0.875rem',
                                                fontSize: '0.9rem',
                                                borderRadius: '6px',
                                                border: theme === 'dark' ? '1px solid #78350f' : '1px solid #fbbf24',
                                                backgroundColor: theme === 'dark' ? '#78350f' : '#fffbeb',
                                                color: theme === 'dark' ? '#fef3c7' : '#78350f',
                                                minWidth: '130px',
                                                fontWeight: '600'
                                            }}
                                        >
                                            {financialYearOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    FY {option.label}
                                                </option>
                                            ))}
                                        </select>
        
                                        {selectedRows.length > 0 && (
                                            <button
                                                onClick={handleNavigateToDetail}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    fontSize: '0.9rem',
                                                    borderRadius: '6px',
                                                    border: 'none',
                                                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                                    color: 'white',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    fontWeight: '600',
                                                    boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)'
                                                }}
                                            >
                                                <span>📝</span>
                                                {!isMobile && <span>Open Selected</span>}
                                            </button>
                                        )}
        
                                        <button
                                            onClick={refreshData}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                fontSize: '0.9rem',
                                                borderRadius: '6px',
                                                border: 'none',
                                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                                color: 'white',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                fontWeight: '600',
                                                boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
                                            }}
                                        >
                                            <span>↻</span>
                                            {!isMobile && <span>Refresh</span>}
                                        </button>
        
                                        <button
                                            onClick={downloadExcel}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                fontSize: '0.9rem',
                                                borderRadius: '6px',
                                                border: 'none',
                                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                color: 'white',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                fontWeight: '600',
                                                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                                            }}
                                        >
                                            <span>📊</span>
                                            {!isMobile && <span>Export</span>}
                                        </button>
        
                                        <button
                                            onClick={autoSizeAll}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                fontSize: '0.9rem',
                                                borderRadius: '6px',
                                                border: 'none',
                                                background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                                                color: 'white',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                fontWeight: '600'
                                            }}
                                        >
                                            <span>↔</span>
                                            {!isMobile && <span>Auto</span>}
                                        </button>
        
                                        <button
                                            onClick={toggleFullScreen}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                fontSize: '0.9rem',
                                                borderRadius: '6px',
                                                border: theme === 'dark' ? '1px solid #fef3c7' : '1px solid #78350f',
                                                backgroundColor: 'transparent',
                                                color: theme === 'dark' ? '#fef3c7' : '#78350f',
                                                cursor: 'pointer',
                                                fontWeight: '600'
                                            }}
                                        >
                                            {isFullScreen ? '⛶ Exit' : '⛶ Full'}
                                        </button>
        
                                        <button
                                            onClick={toggleTheme}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                fontSize: '0.9rem',
                                                borderRadius: '6px',
                                                border: theme === 'dark' ? '1px solid #fef3c7' : '1px solid #78350f',
                                                backgroundColor: 'transparent',
                                                color: theme === 'dark' ? '#fef3c7' : '#78350f',
                                                cursor: 'pointer',
                                                fontWeight: '600'
                                            }}
                                        >
                                            {theme === 'light' ? '🌙' : '☀️'}
                                        </button>
                                    </div>
                                </div>
                            </div>
        
                            <div style={{
                                backgroundColor: themeStyles.cardBg,
                                padding: isFullScreen ? 0 : '15px'
                            }}>
                                {rowData.length === 0 ? (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '60px 20px',
                                        color: themeStyles.color
                                    }}>
                                        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔥</div>
                                        <h5 style={{ marginBottom: '10px', fontSize: '1.25rem' }}>No foundry DC data available</h5>
                                        <p style={{ color: theme === 'dark' ? '#94a3b8' : '#78350f' }}>
                                            Please select a different financial year or check your connection.
                                        </p>
                                    </div>
                                ) : (
                                    <div
                                        className="ag-theme-alpine"
                                        style={{
                                            height: gridHeight,
                                            width: "100%",
                                            ...(theme === 'dark' && {
                                                '--ag-background-color': '#1e293b',
                                                '--ag-header-background-color': '#78350f',
                                                '--ag-odd-row-background-color': '#1e293b',
                                                '--ag-even-row-background-color': '#0f172a',
                                                '--ag-row-hover-color': '#78350f',
                                                '--ag-foreground-color': '#f1f5f9',
                                                '--ag-header-foreground-color': '#fef3c7',
                                                '--ag-border-color': '#78350f',
                                                '--ag-selected-row-background-color': '#f59e0b',
                                                '--ag-input-background-color': '#78350f',
                                                '--ag-input-border-color': '#92400e'
                                            })
                                        }}
                                    >
                                        <AgGridReact
                                            ref={gridRef}
                                            rowData={rowData}
                                            columnDefs={columnDefs}
                                            defaultColDef={defaultColDef}
                                            pagination={true}
                                            paginationPageSize={isMobile ? 10 : 20}
                                            rowSelection="multiple"
                                            onSelectionChanged={onSelectionChanged}
                                            suppressMovableColumns={isMobile}
                                            enableRangeSelection={!isMobile}
                                            rowMultiSelectWithClick={true}
                                            animateRows={!isMobile}
                                            enableCellTextSelection={true}
                                            suppressHorizontalScroll={false}
                                            headerHeight={isMobile ? 40 : 48}
                                            rowHeight={isMobile ? 38 : 45}
                                            onGridReady={(params) => {
                                                console.log('Foundry DC Grid ready');
                                                setTimeout(() => autoSizeAll(), 500);
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
        
                    <style>{`
                        @keyframes slideIn {
                            from {
                                opacity: 0;
                                transform: translateX(100%);
                            }
                            to {
                                opacity: 1;
                                transform: translateX(0);
                            }
                        }
                    `}</style>
                </div>
            );
        };
        
        export default FoundryDcGrid;