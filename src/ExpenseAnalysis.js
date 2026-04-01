import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ExpenseAnalysis = () => {
    // const getFileIdFromUrl = () => {
    //     const path = window.location.pathname;
    //     const parts = path.split('/');
    //     return parts[parts.length - 1] || 'S-25-081-LUG';
    // };
    const getFileIdFromUrl = () => {
    const hash = window.location.hash; // "#/expense-analysis/S-25-247-FDCA"
    const parts = hash.split('/');
    const raw = parts[parts.length - 1] || 'S-25-081-LUG';
    return decodeURIComponent(raw);
};

    const [fileid] = useState(getFileIdFromUrl());
    const [theme, setTheme] = useState('light');
    const [loading, setLoading] = useState(true);
    const [expenseData, setExpenseData] = useState(null);
    const [detailRows, setDetailRows] = useState([{
        id: 1,
        date: '',
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
    const [attendanceData, setAttendanceData] = useState([]);
    const [siteInchargeList, setSiteInchargeList] = useState([]);

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
            const response = await fetch(`https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/ExpenseAnalysisCalculationApi.php?file_name=${fileid}`, {
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
                toast.success("Expense Daily Data Loaded Successfully!");
                // alert("jd");

                if (result.data.summary) {
                    setSummaryData(result.data.summary);
                }

                if (result.data.attendance && Array.isArray(result.data.attendance)) {
                    setAttendanceData(result.data.attendance);
                }

                if (result.data.site_incharge) {
                    const names = result.data.site_incharge.split(',').map(name => name.trim());
                    setSiteInchargeList(names);
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

        if (['advance', 'wages', 'incentive', 'travelling', 'lodging', 'dailyAllowance', 'localTravel', 'purchase', 'other'].includes(field)) {
            const row = updatedRows[index];
            row.total = (
                parseFloat(row.advance || 0) +
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
            acc.dailyAllowance += parseFloat(row.dailyAllowance || 0);
            acc.localTravel += parseFloat(row.localTravel || 0);
            acc.purchase += parseFloat(row.purchase || 0);
            acc.other += parseFloat(row.other || 0);
            acc.total += parseFloat(row.total || 0);
            return acc;
        }, { advance: 0, wages: 0, incentive: 0, travelling: 0, lodging: 0, dailyAllowance: 0, localTravel: 0, purchase: 0, other: 0, total: 0 });

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
            if (detailRows.length === 0) {
                toast.error('No data to save', {
                    position: "top-right",
                    autoClose: 3000,
                });
                return;
            }

            const hasEmptyDates = detailRows.some(row => !row.date);
            if (hasEmptyDates) {
                toast.warning('Please fill in all dates before saving', {
                    position: "top-right",
                    autoClose: 3000,
                });
                return;
            }

            // Show loading toast
            const loadingToast = toast.loading('Saving data...', {
                position: "top-right"
            });

            // Create FormData object
            const formData = new FormData();

            // Append data as arrays with indexed keys
            detailRows.forEach((row, idx) => {
                formData.append(`date[${idx}]`, row.date || '');
                formData.append(`advance[${idx}]`, row.advance || 0);
                formData.append(`fileno[${idx}]`, row.fileName || fileid);
                formData.append(`projcost[${idx}]`, summaryData.totalProjectCost || 0);
                formData.append(`wages[${idx}]`, row.wages || 0);
                formData.append(`incentive[${idx}]`, row.incentive || 0);
                formData.append(`site_i[${idx}]`, row.siteIncharge || '');
                formData.append(`person[${idx}]`, row.noOfPersons || 0);
                formData.append(`travelling[${idx}]`, row.travelling || 0);
                formData.append(`lodging[${idx}]`, row.lodging || 0);
                formData.append(`daily[${idx}]`, row.dailyAllowance || 0);
                formData.append(`local[${idx}]`, row.localTravel || 0);
                formData.append(`purchase[${idx}]`, row.purchase || 0);
                formData.append(`comment[${idx}]`, row.comment || '');
                formData.append(`other[${idx}]`, row.other || 0);
                formData.append(`totalWages[${idx}]`, row.wages || 0);
            });

            console.log('Sending data to API...');

            const response = await fetch('https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/SaveExpenseDataApi.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            console.log('API Response:', result);

            // Dismiss loading toast
            toast.dismiss(loadingToast);

            if (result.status === 'success') {
                // alert('adasd');
                toast.success(`data saved successfully`);
                // Refresh the data after successful save
                fetchExpenseAnalysisData();
            } else if (result.status === 'partial_success') {
                toast.warning(`${result.message} - Inserted: ${result.records_inserted}, Failed: ${result.records_failed}`, {
                    position: "top-right",
                    // autoClose: 5000,
                });
                console.error('Errors:', result.errors);
            } else {
                toast.error(`Error: ${result.message}`);
                if (result.errors) {
                    console.error('Errors:', result.errors);
                }
            }
        } catch (error) {
            console.error('Error saving expense data:', error);
            toast.error('Error saving data. Please check console for details.', {
                position: "top-right",
                autoClose: 4000,
            });
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

    const readOnlyInputStyle = {
        ...inputStyle,
        background: '#f0f0f0',
        cursor: 'not-allowed'
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
                    File Name: {fileid}
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
                    Site Incharge: {expenseData?.site_incharge || 'N/A'}
                </div>
                <div style={{ padding: '20px', overflowX: 'auto' }}>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        border: `1px solid ${themeStyles.borderColor}`
                    }}>
                        <thead>
                            <tr>
                                <th style={headerCellStyle}>Total Man Days</th>
                                <th style={headerCellStyle}>Marketing Allowed<br />Site Expenses (FP)</th>
                                <th style={headerCellStyle}>Total Advance</th>
                                <th style={headerCellStyle}>Total wages</th>
                                <th style={headerCellStyle}>Incentive</th>
                                <th style={headerCellStyle}>Total Expense</th>
                                <th style={headerCellStyle}>Total Project Cost<br />(Total EXP+Wages+Incentive)</th>
                                <th style={headerCellStyle}>Balance Amount<br />(Mktg Allowed - Total Project Cost)</th>
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
                                <td style={{ ...dataCellStyle, fontWeight: '700', color: summaryData.balanceAmount < 0 ? '#ef4444' : '#10b981' }}>
                                    {summaryData.balanceAmount.toLocaleString()}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '12px',
                marginBottom: '24px',
                flexWrap: 'wrap'
            }}>
                <button onClick={handleSave} style={buttonStyle('#ef6c00')}>Save</button>
                <button onClick={addNewRow} style={buttonStyle('#ffc107')}>ADD</button>
                <button onClick={handleBack} style={buttonStyle('#4caf50')}>Back</button>
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
                    Missing Attendance Data
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
                                <th style={headerCellStyle}>Sr No</th>
                                <th style={headerCellStyle}>Missing Dates</th>
                                <th style={headerCellStyle}>No Of Person</th>
                                <th style={headerCellStyle}>Wages</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendanceData.length > 0 ? (
                                attendanceData.map((item, index) => (
                                    <tr key={index}>
                                        <td style={dataCellStyle}>{index + 1}</td>
                                        <td style={dataCellStyle}>{item.date}</td>
                                        <td style={dataCellStyle}>{item.manDays}</td>
                                        <td style={dataCellStyle}>{item.totalAmount?.toLocaleString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" style={dataCellStyle}>No missing attendance data</td>
                                </tr>
                            )}
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
                        minWidth: '1600px'
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
                                <th style={headerCellStyle}>Daily Allowence</th>
                                <th style={headerCellStyle}>Local Travel</th>
                                <th style={headerCellStyle}>Purchase</th>
                                <th style={headerCellStyle}>Comment</th>
                                <th style={headerCellStyle}>Other</th>
                                <th style={headerCellStyle}>Total</th>
                                <th style={headerCellStyle}>Delete</th>

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
                                            <option value="">--Select Incharge--</option>
                                            {siteInchargeList.map((name, idx) => (
                                                <option key={idx} value={name}>{name}</option>
                                            ))}
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
                                    <td style={{ ...dataCellStyle, fontWeight: '700' }}>
                                        {row.total.toLocaleString()}
                                    </td>
                                    <td style={dataCellStyle}>
                                        <button
                                            onClick={() => deleteRow(index)}
                                            disabled={detailRows.length === 1}
                                            style={{
                                                padding: '6px 12px',
                                                background: detailRows.length === 1 ? '#9ca3af' : '#dc2626',
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
                        minWidth: '1600px'
                    }}>
                        <thead>
                            <tr>
                                <th style={headerCellStyle}>Sr No.</th>
                                <th style={headerCellStyle}>Date</th>
                                <th style={headerCellStyle}>Advance</th>
                                <th style={headerCellStyle}>Total Wages</th>
                                <th style={headerCellStyle}>Wages (8 hours)</th>
                                <th style={headerCellStyle}>OT Charges (8+ hours)</th>
                                <th style={headerCellStyle}>Incentive</th>
                                <th style={headerCellStyle}>Site Incharge</th>
                                <th style={headerCellStyle}>No. Of Persons</th>
                                <th style={headerCellStyle}>Travelling</th>
                                <th style={headerCellStyle}>Lodging</th>
                                <th style={headerCellStyle}>Daily Allowence</th>
                                <th style={headerCellStyle}>Local Travel</th>
                                <th style={headerCellStyle}>Purchase</th>
                                <th style={headerCellStyle}>Comment</th>
                                <th style={headerCellStyle}>Other</th>
                                <th style={headerCellStyle}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenseData?.expenseReportDetails?.records && expenseData.expenseReportDetails.records.map((row, index) => (
                                <tr key={index}>
                                    <td style={dataCellStyle}>{index + 1}</td>
                                    <td style={dataCellStyle}>{row.date}</td>
                                    <td style={dataCellStyle}>{row.advance?.toLocaleString()}</td>
                                    <td style={dataCellStyle}>{row.totalWages?.toLocaleString()}</td>
                                    <td style={dataCellStyle}>{row.regularWages?.toLocaleString()}</td>
                                    <td style={dataCellStyle}>{row.otCharges?.toLocaleString()}</td>
                                    <td style={dataCellStyle}>{row.incentive?.toLocaleString()}</td>
                                    <td style={dataCellStyle}>{row.siteIncharge?.toLocaleString()}</td>
                                    <td style={dataCellStyle}>{row.noOfPersons?.toLocaleString()}</td>
                                    <td style={dataCellStyle}>{row.travelling?.toLocaleString()}</td>
                                    <td style={dataCellStyle}>{row.lodging?.toLocaleString()}</td>
                                    <td style={dataCellStyle}>{row.dailyAllowance?.toLocaleString()}</td>
                                    <td style={dataCellStyle}>{row.localTravel?.toLocaleString()}</td>
                                    <td style={dataCellStyle}>{row.purchase?.toLocaleString()}</td>
                                    <td style={dataCellStyle}>{row.comment?.toLocaleString()}</td>
                                    <td style={dataCellStyle}>{row.other?.toLocaleString()}</td>
                                    <td style={{ ...dataCellStyle, fontWeight: '700' }}>{row.totalExpense?.toLocaleString()}</td>

                                </tr>
                            ))}
                            <tr style={{ fontWeight: '700', background: '#fbbf24' }}>
                                <td colSpan="2" style={{ ...dataCellStyle, background: '#fbbf24' }}>Total</td>
                                <td style={{ ...dataCellStyle, background: '#fbbf24' }}>
                                    {expenseData?.expenseReportDetails?.totals?.totalAdvance?.toLocaleString() || 0}
                                </td>
                                <td style={{ ...dataCellStyle, background: '#fbbf24' }}>
                                    {expenseData?.expenseReportDetails?.totals?.totalWages?.toLocaleString() || 0}
                                </td>
                                <td style={{ ...dataCellStyle, background: '#fbbf24' }}>
                                    {expenseData?.expenseReportDetails?.totals?.totalRegularWages?.toLocaleString() || 0}
                                </td>
                                <td style={{ ...dataCellStyle, background: '#fbbf24' }}>
                                    {expenseData?.expenseReportDetails?.totals?.totalOtCharges?.toLocaleString() || 0}
                                </td>
                                <td style={{ ...dataCellStyle, background: '#fbbf24' }}>
                                    {detailRows.reduce((sum, row) => sum + parseFloat(row.incentive || 0), 0).toLocaleString()}
                                </td>
                                <td style={{ ...dataCellStyle, background: '#fbbf24' }}>-</td>
                                <td style={{ ...dataCellStyle, background: '#fbbf24' }}>
                                    {expenseData?.expenseReportDetails?.totals?.totalPersons || 0}
                                </td>
                                <td style={{ ...dataCellStyle, background: '#fbbf24' }}>
                                    {expenseData?.expenseReportDetails?.totals?.totalTravelling?.toLocaleString() || 0}
                                </td>
                                <td style={{ ...dataCellStyle, background: '#fbbf24' }}>
                                    {expenseData?.expenseReportDetails?.totals?.totalLodging?.toLocaleString() || 0}
                                </td>
                                <td style={{ ...dataCellStyle, background: '#fbbf24' }}>
                                    {expenseData?.expenseReportDetails?.totals?.totalDailyAllowance?.toLocaleString() || 0}
                                </td>
                                <td style={{ ...dataCellStyle, background: '#fbbf24' }}>
                                    {expenseData?.expenseReportDetails?.totals?.totalLocalTravel?.toLocaleString() || 0}
                                </td>
                                <td style={{ ...dataCellStyle, background: '#fbbf24' }}>
                                    {expenseData?.expenseReportDetails?.totals?.totalPurchase?.toLocaleString() || 0}
                                </td>
                                <td style={{ ...dataCellStyle, background: '#fbbf24' }}>-</td>
                                <td style={{ ...dataCellStyle, background: '#fbbf24' }}>
                                    {expenseData?.expenseReportDetails?.totals?.totalOther?.toLocaleString() || 0}
                                </td>
                                <td style={{ ...dataCellStyle, background: '#fbbf24', fontSize: '14px' }}>
                                    {expenseData?.expenseReportDetails?.totals?.grandTotal?.toLocaleString() || 0}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            {/* // Add this just before the last closing </div> in your return statement */}
<ToastContainer
    position="top-right"
    autoClose={3000}
    hideProgressBar={false}
    newestOnTop
    closeOnClick
    rtl={false}
    pauseOnFocusLoss
    draggable
    pauseOnHover
    theme={theme}
/>
        </div>
    );
};

export default ExpenseAnalysis;