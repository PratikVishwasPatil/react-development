import React, { useEffect, useState } from "react";

const ExpenseAnalysis = () => {
    const getFileIdFromUrl = () => {
        const path = window.location.pathname;
        const parts = path.split('/');
        return parts[parts.length - 1] || 'S-25-143-CSK';
    };

    const [fileid] = useState(getFileIdFromUrl());
    const [theme, setTheme] = useState('light');
    const [loading, setLoading] = useState(true);
    const [expenseData, setExpenseData] = useState(null);
    const [detailRows, setDetailRows] = useState([{
        id: 1,
        date: '2025-10-01',
        advance: 0,
        fileName: '',
        siteIncharge: '',
        wages: 0,
        wages8h: 0,
        otCharges: 0,
        incentive: 0,
        noOfPersons: 0,
        travelling: 0,
        lodging: 0,
        dailyAllowance: 0,
        localTravel: 0,
        purchase: 0,
        comment: '',
        other: 0,
        total: 0
    }]);

    const [summaryData, setSummaryData] = useState({
        totalManDays: 0,
        marketingAllowed: 0,
        totalAdvance: 0,
        totalWages: 0,
        incentive: 0,
        totalExpense: 0,
        totalProjectCost: 0,
        balanceAmount: 0
    });

    useEffect(() => {
        fetchExpenseAnalysisData();
    }, [fileid]);

    const fetchExpenseAnalysisData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://93.127.167.54/Surya_React/surya_dynamic_api/ExpenseAnalysisDetail.php?fileid=${fileid}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log("Expense Analysis API Response:", result);

            if (result.status === 'success' && result.data) {
                setExpenseData(result.data);
                if (result.data.details && Array.isArray(result.data.details)) {
                    setDetailRows(result.data.details);
                }
                if (result.data.summary) {
                    setSummaryData(result.data.summary);
                }
            }
        } catch (error) {
            console.error("Error fetching expense analysis data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (index, field, value) => {
        const updatedRows = [...detailRows];
        updatedRows[index][field] = value;

        if (['wages', 'incentive', 'travelling', 'lodging', 'dailyAllowance', 'localTravel', 'purchase', 'other'].includes(field)) {
            const row = updatedRows[index];
            row.total = (
                parseFloat(row.wages || 0) +
                parseFloat(row.incentive || 0) +
                parseFloat(row.travelling || 0) +
                parseFloat(row.lodging || 0) +
                parseFloat(row.dailyAllowance || 0) +
                parseFloat(row.localTravel || 0) +
                parseFloat(row.purchase || 0) +
                parseFloat(row.other || 0)
            );
        }

        setDetailRows(updatedRows);
        calculateTotals(updatedRows);
    };

    const calculateTotals = (rows) => {
        const totals = rows.reduce((acc, row) => {
            acc.advance += parseFloat(row.advance || 0);
            acc.wages += parseFloat(row.wages || 0);
            acc.incentive += parseFloat(row.incentive || 0);
            acc.travelling += parseFloat(row.travelling || 0);
            acc.lodging += parseFloat(row.lodging || 0);
            acc.total += parseFloat(row.total || 0);
            return acc;
        }, { advance: 0, wages: 0, incentive: 0, travelling: 0, lodging: 0, total: 0 });

        setSummaryData(prev => ({
            ...prev,
            totalAdvance: totals.advance,
            totalWages: totals.wages,
            incentive: totals.incentive,
            totalExpense: totals.total,
            totalProjectCost: totals.total,
            balanceAmount: prev.marketingAllowed - totals.total
        }));
    };

    const addNewRow = () => {
        const newRow = {
            id: detailRows.length + 1,
            date: '',
            advance: 0,
            fileName: fileid,
            siteIncharge: expenseData?.site_incharge || '',
            wages: 0,
            wages8h: 0,
            otCharges: 0,
            incentive: 0,
            noOfPersons: 0,
            travelling: 0,
            lodging: 0,
            dailyAllowance: 0,
            localTravel: 0,
            purchase: 0,
            comment: '',
            other: 0,
            total: 0
        };
        setDetailRows([...detailRows, newRow]);
    };

    const deleteRow = (index) => {
        if (detailRows.length > 1) {
            const updatedRows = detailRows.filter((_, i) => i !== index);
            setDetailRows(updatedRows);
            calculateTotals(updatedRows);
        } else {
            alert('At least one row must remain');
        }
    };

    const handleSave = async () => {
        try {
            const response = await fetch('http://93.127.167.54/Surya_React/surya_dynamic_api/SaveExpenseAnalysis.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fileid: fileid,
                    summary: summaryData,
                    details: detailRows
                })
            });

            const result = await response.json();
            if (result.status === 'success') {
                alert('Expense data saved successfully!');
            } else {
                alert('Error saving data: ' + result.message);
            }
        } catch (error) {
            console.error('Error saving expense data:', error);
            alert('Error saving data. Please try again.');
        }
    };

    const handleBack = () => {
        window.history.back();
    };

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const getThemeStyles = () => {
        if (theme === 'dark') {
            return {
                backgroundColor: '#1a1d23',
                color: '#e4e6eb',
                cardBg: '#242830',
                inputBg: '#2f3439',
                borderColor: '#3a3f47',
                headerBg: '#4a5568',
                primaryAccent: '#3b82f6',
                sectionTitleBg: '#2d3748'
            };
        }
        return {
            backgroundColor: '#f5f7fa',
            color: '#1a202c',
            cardBg: '#ffffff',
            inputBg: '#ffffff',
            borderColor: '#e2e8f0',
            headerBg: '#4a5568',
            primaryAccent: '#3b82f6',
            sectionTitleBg: '#edf2f7'
        };
    };

    const themeStyles = getThemeStyles();

    const headerCellStyle = {
        padding: '12px 8px',
        border: `1px solid ${themeStyles.borderColor}`,
        textAlign: 'center',
        fontSize: '11px',
        fontWeight: '600',
        color: '#ffffff',
        background: themeStyles.headerBg,
        lineHeight: '1.3'
    };

    const dataCellStyle = {
        padding: '8px',
        border: `1px solid ${themeStyles.borderColor}`,
        textAlign: 'center',
        fontSize: '12px',
        color: themeStyles.color,
        background: themeStyles.cardBg
    };

    const inputStyle = {
        width: '100%',
        padding: '6px',
        border: `1px solid ${themeStyles.borderColor}`,
        borderRadius: '4px',
        background: themeStyles.inputBg,
        color: themeStyles.color,
        fontSize: '12px',
        minWidth: '80px'
    };

    const buttonStyle = (bgColor) => ({
        padding: '10px 24px',
        background: bgColor,
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        transition: 'all 0.2s',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    });

    const sectionTitleStyle = {
        background: themeStyles.sectionTitleBg,
        padding: '12px 20px',
        borderRadius: '6px 6px 0 0',
        fontWeight: '600',
        fontSize: '15px',
        color: themeStyles.color,
        borderBottom: `2px solid ${themeStyles.primaryAccent}`
    };

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
                        border: '4px solid #e2e8f0',
                        borderTop: '4px solid #3b82f6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto'
                    }}></div>
                    <p style={{ marginTop: '20px' }}>Loading expense analysis...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: themeStyles.backgroundColor,
            color: themeStyles.color,
            padding: '20px'
        }}>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                button:hover {
                    opacity: 0.9;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
                }
            `}</style>

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
                padding: '16px 20px',
                background: themeStyles.cardBg,
                borderRadius: '8px',
                border: `1px solid ${themeStyles.borderColor}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
                <h5 style={{ margin: 0, fontWeight: '700', fontSize: '18px' }}>
                    File: {fileid}
                </h5>
                <button
                    onClick={toggleTheme}
                    style={{
                        padding: '8px 16px',
                        background: themeStyles.primaryAccent,
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        color: '#ffffff',
                        fontSize: '14px',
                        fontWeight: '600'
                    }}
                >
                    {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
                </button>
            </div>

            <div style={{
                background: themeStyles.cardBg,
                border: `1px solid ${themeStyles.borderColor}`,
                borderRadius: '8px',
                marginBottom: '24px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
                <div style={sectionTitleStyle}>
                    Project Summary & Budget Overview
                </div>
                <div style={{ padding: '20px' }}>
                    <div style={{
                        textAlign: 'center',
                        fontSize: '15px',
                        fontWeight: '600',
                        padding: '12px',
                        background: themeStyles.sectionTitleBg,
                        borderRadius: '6px',
                        marginBottom: '16px'
                    }}>
                        Site Incharge: {expenseData?.site_incharge || 'Mukund Madhukar Gurav'}
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            border: `1px solid ${themeStyles.borderColor}`
                        }}>
                            <thead>
                                <tr>
                                    <th style={headerCellStyle}>Total Man Days</th>
                                    <th style={headerCellStyle}>Marketing Allowed<br/>Site Expenses (FP)</th>
                                    <th style={headerCellStyle}>Total Advance</th>
                                    <th style={headerCellStyle}>Total Wages</th>
                                    <th style={headerCellStyle}>Incentive</th>
                                    <th style={headerCellStyle}>Total Expense</th>
                                    <th style={headerCellStyle}>Total Project Cost<br/>(Exp+Wages+Incentive)</th>
                                    <th style={headerCellStyle}>Balance Amount<br/>(Allowed - Project Cost)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={dataCellStyle}>{summaryData.totalManDays}</td>
                                    <td style={dataCellStyle}>{summaryData.marketingAllowed.toLocaleString()}</td>
                                    <td style={dataCellStyle}>{summaryData.totalAdvance.toLocaleString()}</td>
                                    <td style={dataCellStyle}>{summaryData.totalWages.toLocaleString()}</td>
                                    <td style={dataCellStyle}>{summaryData.incentive.toLocaleString()}</td>
                                    <td style={dataCellStyle}>{summaryData.totalExpense.toLocaleString()}</td>
                                    <td style={dataCellStyle}>{summaryData.totalProjectCost.toLocaleString()}</td>
                                    <td style={{...dataCellStyle, fontWeight: '700', color: summaryData.balanceAmount < 0 ? '#ef4444' : '#10b981'}}>
                                        {summaryData.balanceAmount.toLocaleString()}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '12px',
                marginBottom: '24px',
                flexWrap: 'wrap'
            }}>
                <button onClick={handleSave} style={buttonStyle('#10b981')}>Save Changes</button>
                <button onClick={addNewRow} style={buttonStyle('#3b82f6')}>Add New Entry</button>
                <button onClick={handleBack} style={buttonStyle('#6b7280')}>Back</button>
            </div>

            <div style={{
                background: themeStyles.cardBg,
                border: `1px solid ${themeStyles.borderColor}`,
                borderRadius: '8px',
                marginBottom: '24px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
                <div style={sectionTitleStyle}>
                    Attendance & Workforce Tracking
                </div>
                <div style={{ padding: '20px', overflowX: 'auto' }}>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        border: `1px solid ${themeStyles.borderColor}`,
                        minWidth: '600px'
                    }}>
                        <thead>
                            <tr>
                                <th style={headerCellStyle}>Sr No.</th>
                                <th style={headerCellStyle}>Missing Dates</th>
                                <th style={headerCellStyle}>No. of Persons</th>
                                <th style={headerCellStyle}>Wages</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={dataCellStyle}>1</td>
                                <td style={dataCellStyle}>0</td>
                                <td style={dataCellStyle}>0</td>
                                <td style={dataCellStyle}>0</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div style={{
                background: themeStyles.cardBg,
                border: `1px solid ${themeStyles.borderColor}`,
                borderRadius: '8px',
                marginBottom: '24px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
                <div style={sectionTitleStyle}>
                    Daily Expense Entry (Editable)
                </div>
                <div style={{ padding: '20px', overflowX: 'auto' }}>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        border: `1px solid ${themeStyles.borderColor}`,
                        minWidth: '1400px'
                    }}>
                        <thead>
                            <tr>
                                <th style={headerCellStyle}>Sr No.</th>
                                <th style={headerCellStyle}>Date</th>
                                <th style={headerCellStyle}>Advance</th>
                                <th style={headerCellStyle}>File Name</th>
                                <th style={headerCellStyle}>Site Incharge</th>
                                <th style={headerCellStyle}>Wages</th>
                                <th style={headerCellStyle}>Incentive</th>
                                <th style={headerCellStyle}>No. Of Persons</th>
                                <th style={headerCellStyle}>Travelling</th>
                                <th style={headerCellStyle}>Lodging</th>
                                <th style={headerCellStyle}>Daily Allowance</th>
                                <th style={headerCellStyle}>Local Travel</th>
                                <th style={headerCellStyle}>Purchase</th>
                                <th style={headerCellStyle}>Comment</th>
                                <th style={headerCellStyle}>Other</th>
                                <th style={headerCellStyle}>Total</th>
                                <th style={headerCellStyle}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {detailRows.map((row, index) => (
                                <tr key={row.id}>
                                    <td style={dataCellStyle}>{index + 1}</td>
                                    <td style={dataCellStyle}>
                                        <input
                                            type="date"
                                            value={row.date}
                                            onChange={(e) => handleInputChange(index, 'date', e.target.value)}
                                            style={inputStyle}
                                        />
                                    </td>
                                    <td style={dataCellStyle}>
                                        <input
                                            type="number"
                                            value={row.advance}
                                            onChange={(e) => handleInputChange(index, 'advance', e.target.value)}
                                            style={inputStyle}
                                        />
                                    </td>
                                    <td style={dataCellStyle}>{fileid}</td>
                                    <td style={dataCellStyle}>
                                        <select 
                                            value={row.siteIncharge}
                                            onChange={(e) => handleInputChange(index, 'siteIncharge', e.target.value)}
                                            style={inputStyle}
                                        >
                                            <option value="">--Select--</option>
                                            <option value="Mukund Madhukar Gurav">Mukund Madhukar Gurav</option>
                                        </select>
                                    </td>
                                    <td style={dataCellStyle}>
                                        <input
                                            type="number"
                                            value={row.wages}
                                            onChange={(e) => handleInputChange(index, 'wages', e.target.value)}
                                            style={inputStyle}
                                        />
                                    </td>
                                    <td style={dataCellStyle}>
                                        <input
                                            type="number"
                                            value={row.incentive}
                                            onChange={(e) => handleInputChange(index, 'incentive', e.target.value)}
                                            style={inputStyle}
                                        />
                                    </td>
                                    <td style={dataCellStyle}>
                                        <input
                                            type="number"
                                            value={row.noOfPersons}
                                            onChange={(e) => handleInputChange(index, 'noOfPersons', e.target.value)}
                                            style={inputStyle}
                                        />
                                    </td>
                                    <td style={dataCellStyle}>
                                        <input
                                            type="number"
                                            value={row.travelling}
                                            onChange={(e) => handleInputChange(index, 'travelling', e.target.value)}
                                            style={inputStyle}
                                        />
                                    </td>
                                    <td style={dataCellStyle}>
                                        <input
                                            type="number"
                                            value={row.lodging}
                                            onChange={(e) => handleInputChange(index, 'lodging', e.target.value)}
                                            style={inputStyle}
                                        />
                                    </td>
                                    <td style={dataCellStyle}>
                                        <input
                                            type="number"
                                            value={row.dailyAllowance}
                                            onChange={(e) => handleInputChange(index, 'dailyAllowance', e.target.value)}
                                            style={inputStyle}
                                        />
                                    </td>
                                    <td style={dataCellStyle}>
                                        <input
                                            type="number"
                                            value={row.localTravel}
                                            onChange={(e) => handleInputChange(index, 'localTravel', e.target.value)}
                                            style={inputStyle}
                                        />
                                    </td>
                                    <td style={dataCellStyle}>
                                        <input
                                            type="number"
                                            value={row.purchase}
                                            onChange={(e) => handleInputChange(index, 'purchase', e.target.value)}
                                            style={inputStyle}
                                        />
                                    </td>
                                    <td style={dataCellStyle}>
                                        <input
                                            type="text"
                                            value={row.comment}
                                            onChange={(e) => handleInputChange(index, 'comment', e.target.value)}
                                            style={inputStyle}
                                        />
                                    </td>
                                    <td style={dataCellStyle}>
                                        <input
                                            type="number"
                                            value={row.other}
                                            onChange={(e) => handleInputChange(index, 'other', e.target.value)}
                                            style={inputStyle}
                                        />
                                    </td>
                                    <td style={{...dataCellStyle, fontWeight: '700', color: themeStyles.primaryAccent}}>
                                        {row.total.toLocaleString()}
                                    </td>
                                    <td style={dataCellStyle}>
                                        <button
                                            onClick={() => deleteRow(index)}
                                            disabled={detailRows.length === 1}
                                            style={{
                                                padding: '6px 12px',
                                                background: detailRows.length === 1 ? '#9ca3af' : '#ef4444',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: detailRows.length === 1 ? 'not-allowed' : 'pointer',
                                                fontSize: '11px',
                                                fontWeight: '600'
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div style={{
                background: themeStyles.cardBg,
                border: `1px solid ${themeStyles.borderColor}`,
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
                <div style={sectionTitleStyle}>
                    Comprehensive Expense Report (Summary View)
                </div>
                <div style={{ padding: '20px', overflowX: 'auto' }}>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        border: `1px solid ${themeStyles.borderColor}`,
                        minWidth: '1400px'
                    }}>
                        <thead>
                            <tr>
                                <th style={headerCellStyle}>Sr No.</th>
                                <th style={headerCellStyle}>Date</th>
                                <th style={headerCellStyle}>Advance</th>
                                <th style={headerCellStyle}>Total Wages</th>
                                <th style={headerCellStyle}>Wages (8 hrs)</th>
                                <th style={headerCellStyle}>OT Charges (8+ hrs)</th>
                                <th style={headerCellStyle}>Incentive</th>
                                <th style={headerCellStyle}>Site Incharge</th>
                                <th style={headerCellStyle}>No. Of Persons</th>
                                <th style={headerCellStyle}>Travelling</th>
                                <th style={headerCellStyle}>Lodging</th>
                                <th style={headerCellStyle}>Daily Allowance</th>
                                <th style={headerCellStyle}>Local Travel</th>
                                <th style={headerCellStyle}>Purchase</th>
                                <th style={headerCellStyle}>Comment</th>
                                <th style={headerCellStyle}>Other</th>
                                <th style={headerCellStyle}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {detailRows.map((row, index) => (
                                <tr key={row.id}>
                                    <td style={dataCellStyle}>{index + 1}</td>
                                    <td style={dataCellStyle}>{row.date}</td>
                                    <td style={dataCellStyle}>{row.advance}</td>
                                    <td style={dataCellStyle}>{row.wages}</td>
                                    <td style={dataCellStyle}>{row.wages8h}</td>
                                    <td style={dataCellStyle}>{row.otCharges}</td>
                                    <td style={dataCellStyle}>{row.incentive}</td>
                                    <td style={dataCellStyle}>{row.siteIncharge}</td>
                                    <td style={dataCellStyle}>{row.noOfPersons}</td>
                                    <td style={dataCellStyle}>{row.travelling}</td>
                                    <td style={dataCellStyle}>{row.lodging.toLocaleString()}</td>
                                    <td style={dataCellStyle}>{row.dailyAllowance}</td>
                                    <td style={dataCellStyle}>{row.localTravel}</td>
                                    <td style={dataCellStyle}>{row.purchase}</td>
                                    <td style={dataCellStyle}>{row.comment}</td>
                                    <td style={dataCellStyle}>{row.other}</td>
                                    <td style={{...dataCellStyle, fontWeight: '700'}}>{row.total.toLocaleString()}</td>
                                </tr>
                            ))}
                            <tr style={{ fontWeight: '700' }}>
                                <td colSpan="2" style={{...dataCellStyle, background: '#fbbf24'}}>TOTAL</td>
                                <td style={{...dataCellStyle, background: '#fbbf24'}}>{summaryData.totalAdvance.toLocaleString()}</td>
                                <td style={{...dataCellStyle, background: '#fbbf24'}}>{summaryData.totalWages.toLocaleString()}</td>
                                <td style={{...dataCellStyle, background: '#fbbf24'}}>0</td>
                                <td style={{...dataCellStyle, background: '#fbbf24'}}>0</td>
                                <td style={{...dataCellStyle, background: '#fbbf24'}}>{summaryData.incentive.toLocaleString()}</td>
                                <td style={{...dataCellStyle, background: '#fbbf24'}}>-</td>
                                <td style={{...dataCellStyle, background: '#fbbf24'}}>-</td>
                                <td style={{...dataCellStyle, background: '#fbbf24'}}>0</td>
                                <td style={{...dataCellStyle, background: '#fbbf24'}}>{summaryData.totalExpense.toLocaleString()}</td>
                                <td style={{...dataCellStyle, background: '#fbbf24'}}>0</td>
                                <td style={{...dataCellStyle, background: '#fbbf24'}}>0</td>
                                <td style={{...dataCellStyle, background: '#fbbf24'}}>0</td>
                                <td style={{...dataCellStyle, background: '#fbbf24'}}>-</td>
                                <td style={{...dataCellStyle, background: '#fbbf24'}}>0</td>
                                <td style={{...dataCellStyle, background: '#fbbf24', fontSize: '14px'}}>{summaryData.totalExpense.toLocaleString()}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ExpenseAnalysis;