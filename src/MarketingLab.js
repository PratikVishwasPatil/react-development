import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TotalMktgExpensesChart = () => {
    const [theme, setTheme] = useState('light');
    const [selectedYear, setSelectedYear] = useState('25-26');
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
const [financialYearOptions, setFinancialYearOptions] = useState([]);
    // const financialYears = [
    //     { value: '20-21', label: '2020-21' },
    //     { value: '21-22', label: '2021-22' },
    //     { value: '22-23', label: '2022-23' },
    //     { value: '23-24', label: '2023-24' },
    //     { value: '24-25', label: '2024-25' },
    //     { value: '25-26', label: '2025-26' }
    // ];

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
            
            // Set the latest year as default
            if (years.length > 0) {
                setSelectedYear(years[years.length - 1].value);
            }
        }
    } catch (error) {
        console.error("Error fetching financial years:", error);
        setError("Error loading financial years");
    }
};

useEffect(() => {
    fetchFinancialYears();
}, []);

    useEffect(() => {
        fetchChartData(selectedYear);
    }, [selectedYear]);

    const fetchChartData = async (year) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/MarketingPoAPI.php?financial_year=${year}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('API Response:', result);

            if (result.status === 'success' && result.data) {
                setChartData(result.data);
            } else {
                setError(result.message || 'Failed to fetch data');
            }
        } catch (err) {
            console.error('Error fetching chart data:', err);
            setError('Failed to load chart data');
        } finally {
            setLoading(false);
        }
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
                chartGrid: '#3a3f47',
                chartText: '#e4e6eb'
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
            chartGrid: '#e2e8f0',
            chartText: '#1a202c'
        };
    };

    const themeStyles = getThemeStyles();

    const formatCurrency = (value) => {
        return `₹${value.toLocaleString('en-IN')}`;
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: themeStyles.cardBg,
                    border: `1px solid ${themeStyles.borderColor}`,
                    borderRadius: '8px',
                    padding: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                    <p style={{ margin: '0 0 8px 0', fontWeight: '700', color: themeStyles.color }}>
                        {label}
                    </p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ margin: '4px 0', color: entry.color, fontSize: '13px' }}>
                            <span style={{ fontWeight: '600' }}>{entry.name}:</span> {formatCurrency(entry.value)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

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
                }
                select {
                    cursor: pointer;
                }
                select:focus {
                    outline: 2px solid ${themeStyles.primaryAccent};
                    outline-offset: 2px;
                }
            `}</style>

            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
                padding: '16px 20px',
                background: themeStyles.cardBg,
                borderRadius: '8px',
                border: `1px solid ${themeStyles.borderColor}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                flexWrap: 'wrap',
                gap: '12px'
            }}>
                <h5 style={{ margin: 0, fontWeight: '700', fontSize: '18px' }}>
                    Total Marketing & Expenses Analysis by Financial Year
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

            {/* Financial Year Selector */}
            <div style={{
                background: themeStyles.cardBg,
                border: `1px solid ${themeStyles.borderColor}`,
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
                <label style={{
                    display: 'block',
                    marginBottom: '12px',
                    fontWeight: '600',
                    fontSize: '15px',
                    color: themeStyles.color
                }}>
                    Select Financial Year
                </label>
                <select
    value={selectedYear}
    onChange={(e) => setSelectedYear(e.target.value)}
    style={{
        width: '100%',
        maxWidth: '300px',
        padding: '12px 16px',
        border: `1px solid ${themeStyles.borderColor}`,
        borderRadius: '6px',
        background: themeStyles.inputBg,
        color: themeStyles.color,
        fontSize: '14px',
        fontWeight: '500'
    }}
>
    {financialYearOptions.map(year => (
        <option key={year.value} value={year.value}>
            {year.label}
        </option>
    ))}
</select>
            </div>

            {/* Chart Section */}
            <div style={{
                background: themeStyles.cardBg,
                border: `1px solid ${themeStyles.borderColor}`,
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
                <div style={{
                    background: themeStyles.headerBg,
                    padding: '12px 20px',
                    borderRadius: '6px 6px 0 0',
                    marginBottom: '20px'
                }}>
                    <h6 style={{ margin: '0 0 12px 0', color: '#ffffff', fontWeight: '600', fontSize: '15px' }}>
                        TOTAL MKTG ALLOWED, LABOUR PO, PROJECT ESTIMATED EXPENSES FOR SITE AND AS ACTUAL SITE COST BY FILE
                    </h6>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ffffff', fontSize: '13px' }}>
                            <span style={{ width: '16px', height: '16px', background: '#8b5cf6', borderRadius: '3px' }}></span>
                            Total Mktg Allowed
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ffffff', fontSize: '13px' }}>
                            <span style={{ width: '16px', height: '16px', background: '#3b82f6', borderRadius: '3px' }}></span>
                            Labour PO
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ffffff', fontSize: '13px' }}>
                            <span style={{ width: '16px', height: '16px', background: '#f97316', borderRadius: '3px' }}></span>
                            Project Estimated Expenses
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ffffff', fontSize: '13px' }}>
                            <span style={{ width: '16px', height: '16px', background: '#eab308', borderRadius: '3px' }}></span>
                            As Actual Site Cost
                        </span>
                    </div>
                </div>

                {loading ? (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '60px 20px',
                        color: themeStyles.color
                    }}>
                        <div style={{
                            width: '3rem',
                            height: '3rem',
                            border: '4px solid #e2e8f0',
                            borderTop: '4px solid #3b82f6',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }}></div>
                        <p style={{ marginTop: '20px' }}>Loading chart data...</p>
                    </div>
                ) : error ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        color: '#ef4444',
                        fontSize: '14px'
                    }}>
                        <p style={{ margin: 0, fontWeight: '600' }}>⚠️ {error}</p>
                    </div>
                ) : chartData.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        color: themeStyles.color,
                        fontSize: '14px'
                    }}>
                        <p style={{ margin: 0 }}>No data available for the selected financial year</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={Math.max(600, chartData.length * 40)}>
                        <BarChart
                            data={chartData}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke={themeStyles.chartGrid} />
                            <XAxis 
                                type="number"
                                tickFormatter={formatCurrency}
                                stroke={themeStyles.chartText}
                                style={{ fontSize: '12px' }}
                            />
                            <YAxis 
                                dataKey="fileName" 
                                type="category"
                                width={90}
                                stroke={themeStyles.chartText}
                                style={{ fontSize: '11px' }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="totalMktgAllowed" fill="#8b5cf6" name="Total Mktg Allowed" barSize={12} />
                            <Bar dataKey="labourPO" fill="#3b82f6" name="Labour PO" barSize={12} />
                            <Bar dataKey="projectEstimatedExpenses" fill="#f97316" name="Project Estimated Expenses" barSize={12} />
                            <Bar dataKey="actualSiteCost" fill="#eab308" name="As Actual Site Cost" barSize={12} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

export default TotalMktgExpensesChart;