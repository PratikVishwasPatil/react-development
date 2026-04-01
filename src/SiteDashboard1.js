import React, { useState, useEffect } from 'react';

const SiteDashboard = () => {
    const [theme, setTheme] = useState('light');
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    // Handle window resize for mobile responsiveness
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch dashboard data from API
    const fetchDashboardData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch("https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/SiteDashboard1Api.php");
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status === "success") {
                setDashboardData(data.data);
            } else {
                throw new Error(data.message || "Failed to fetch dashboard data");
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Theme styles
    const getThemeStyles = () => {
        if (theme === 'dark') {
            return {
                backgroundColor: 'linear-gradient(135deg, #21262d 0%, #161b22 100%)',
                color: '#f8f9fa',
                cardBg: '#343a40',
                cardHeader: 'linear-gradient(135deg, #495057 0%, #343a40 100%)',
                tableBg: '#2c3034',
                tableHeader: '#495057',
                border: '#495057',
                inputBg: '#343a40',
                inputBorder: '#495057'
            };
        }
        return {
            backgroundColor: 'linear-gradient(135deg, #f8f9ff 0%, #e6f3ff 100%)',
            color: '#212529',
            cardBg: '#ffffff',
            cardHeader: 'linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%)',
            tableBg: '#ffffff',
            tableHeader: '#f8f9fa',
            border: '#dee2e6',
            inputBg: '#ffffff',
            inputBorder: '#ced4da'
        };
    };

    const themeStyles = getThemeStyles();

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    // Loading component
    const LoadingSpinner = () => (
        <div style={{ textAlign: 'center', padding: '50px' }}>
            <div style={{ 
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #fd7e14',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                animation: 'spin 2s linear infinite',
                margin: '0 auto'
            }}></div>
            <p style={{ marginTop: '20px', color: themeStyles.color }}>Loading dashboard data...</p>
        </div>
    );

    // Error component
    const ErrorDisplay = () => (
        <div style={{ 
            textAlign: 'center', 
            padding: '50px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            borderRadius: '8px',
            margin: '20px 0'
        }}>
            <h3>Error Loading Dashboard</h3>
            <p>{error}</p>
            <button 
                onClick={fetchDashboardData}
                style={{
                    padding: '10px 20px',
                    backgroundColor: '#fd7e14',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginTop: '10px'
                }}
            >
                Retry
            </button>
        </div>
    );

    // Employee Statistics Table
    const EmployeeStatsTable = () => (
        <div style={{ marginBottom: '30px' }}>
            <h3 style={{ 
                color: themeStyles.color, 
                marginBottom: '15px',
                fontSize: isMobile ? '18px' : '20px'
            }}>
                Employee Status Overview
            </h3>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ 
                    width: '100%',
                    borderCollapse: 'collapse',
                    backgroundColor: themeStyles.tableBg,
                    color: themeStyles.color,
                    fontSize: isMobile ? '12px' : '14px',
                    border: `1px solid ${themeStyles.border}`,
                    textAlign:"right"
                }}>
                    <thead>
                        <tr style={{ backgroundColor: '#fd7e14', color: 'white' }}>
                            <th style={{ 
                                padding: '12px 8px', 
                                border: `1px solid ${themeStyles.border}`,
                                textAlign: 'right',
                                fontWeight: 'bold'
                            }}>
                                Employee Type
                            </th>
                            <th style={{ 
                                padding: '12px 8px', 
                                border: `1px solid ${themeStyles.border}`,
                                textAlign: 'right',
                                fontWeight: 'bold'
                            }}>
                                Active
                            </th>
                            <th style={{ 
                                padding: '12px 8px', 
                                border: `1px solid ${themeStyles.border}`,
                                textAlign: 'right',
                                fontWeight: 'bold'
                            }}>
                                Inactive
                            </th>
                            <th style={{ 
                                padding: '12px 8px', 
                                border: `1px solid ${themeStyles.border}`,
                                textAlign: 'right',
                                fontWeight: 'bold'
                            }}>
                                Total
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {dashboardData?.employee_stats?.map((row, index) => (
                            <tr key={index} style={{
                                backgroundColor: row.employee_type === 'Total' ? '#fd7e14' : 'transparent',
                                color: row.employee_type === 'Total' ? 'white' : themeStyles.color,
                                fontWeight: row.employee_type === 'Total' ? 'bold' : 'normal'
                            }}>
                                <td style={{ 
                                    padding: '10px 8px', 
                                    border: `1px solid ${themeStyles.border}`,
                                    textTransform: 'capitalize',
                                    fontWeight: row.employee_type === 'Total' ? 'bold' : 'normal'
                                }}>
                                    {row.employee_type}
                                </td>
                                <td style={{ 
                                    padding: '10px 8px', 
                                    border: `1px solid ${themeStyles.border}`,
                                    textAlign: 'right'
                                }}>
                                    {row.active_count}
                                </td>
                                <td style={{ 
                                    padding: '10px 8px', 
                                    border: `1px solid ${themeStyles.border}`,
                                    textAlign: 'right'
                                }}>
                                    {row.inactive_count}
                                </td>
                                <td style={{ 
                                    padding: '10px 8px', 
                                    border: `1px solid ${themeStyles.border}`,
                                    textAlign: 'right'
                                }}>
                                    {row.total_count}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    // Project Statistics Table
    const ProjectStatsTable = () => (
        <div>
            <h3 style={{ 
                color: themeStyles.color, 
                marginBottom: '15px',
                fontSize: isMobile ? '18px' : '20px'
            }}>
                Project Worker Distribution
            </h3>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ 
                    width: '100%',
                    borderCollapse: 'collapse',
                    backgroundColor: themeStyles.tableBg,
                    color: themeStyles.color,
                    fontSize: isMobile ? '12px' : '14px',
                    border: `1px solid ${themeStyles.border}`
                }}>
                    <thead>
                        <tr style={{ backgroundColor: '#fd7e14', color: 'white' }}>
                            <th style={{ 
                                padding: '12px 8px', 
                                border: `1px solid ${themeStyles.border}`,
                                textAlign: 'right',
                                fontWeight: 'bold',

                                minWidth: '120px'
                            }}>
                                Type Of Project
                            </th>
                            <th style={{ 
                                padding: '12px 8px', 
                                border: `1px solid ${themeStyles.border}`,
                                textAlign: 'right',
                                fontWeight: 'bold'
                            }}>
                                Supervisor
                            </th>
                            <th style={{ 
                                padding: '12px 8px', 
                                border: `1px solid ${themeStyles.border}`,
                                textAlign: 'right',
                                fontWeight: 'bold'
                            }}>
                                Skilled Worker
                            </th>
                            <th style={{ 
                                padding: '12px 8px', 
                                border: `1px solid ${themeStyles.border}`,
                                textAlign: 'right',
                                fontWeight: 'bold'
                            }}>
                                Unskilled Worker
                            </th>
                            <th style={{ 
                                padding: '12px 8px', 
                                border: `1px solid ${themeStyles.border}`,
                                textAlign: 'right',
                                fontWeight: 'bold'
                            }}>
                                Total No Of Projects
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {dashboardData?.project_stats?.map((row, index) => (
                            <tr key={index} style={{
                                backgroundColor: (row.project_type === 'Total' || row.project_type === 'Total Sites') ? '#fd7e14' : 'transparent',
                                color: (row.project_type === 'Total' || row.project_type === 'Total Sites') ? 'white' : themeStyles.color,
                                fontWeight: (row.project_type === 'Total' || row.project_type === 'Total Sites') ? 'bold' : 'normal',textAlign:"right"
                            }}>
                                <td style={{ 
                                    padding: '10px 8px', 
                                    border: `1px solid ${themeStyles.border}`,
                                    fontWeight: (row.project_type === 'Total' || row.project_type === 'Total Sites') ? 'bold' : 'normal'
                                }}>
                                    {row.project_type}
                                </td>
                                <td style={{ 
                                    padding: '10px 8px', 
                                    border: `1px solid ${themeStyles.border}`,
                                    textAlign: 'right'
                                }}>
                                    {row.supervisor !== null ? row.supervisor : ''}
                                </td>
                                <td style={{ 
                                    padding: '10px 8px', 
                                    border: `1px solid ${themeStyles.border}`,
                                    textAlign: 'right'
                                }}>
                                    {row.skilled_worker !== null ? row.skilled_worker : ''}
                                </td>
                                <td style={{ 
                                    padding: '10px 8px', 
                                    border: `1px solid ${themeStyles.border}`,
                                    textAlign: 'right'
                                }}>
                                    {row.unskilled_worker !== null ? row.unskilled_worker : ''}
                                </td>
                                <td style={{ 
                                    padding: '10px 8px', 
                                    border: `1px solid ${themeStyles.border}`,
                                    textAlign: 'right'
                                }}>
                                    {row.total !== null ? row.total : ''}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div style={{
            minHeight: '100vh',
            background: themeStyles.backgroundColor,
            color: themeStyles.color,
            padding: '0',
            margin: '0'
        }}>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                body {
                    margin: 0;
                    padding: 0;
                    overflow-x: auto;
                }
            `}</style>
            
            <div style={{ width: '100%', minHeight: '100vh' }}>
                <div style={{
                    backgroundColor: themeStyles.cardBg,
                    color: themeStyles.color,
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {/* Header */}
                    <div style={{
                        background: themeStyles.cardHeader,
                        color: theme === 'dark' ? '#ffffff' : '#000000',
                        padding: '1rem 2rem',
                        borderBottom: `1px solid ${themeStyles.border}`
                    }}>
                        <div style={{ 
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '1rem'
                        }}>
                            <div>
                                <h1 style={{ 
                                    margin: '0', 
                                    fontSize: isMobile ? '20px' : '24px',
                                    fontWeight: 'bold'
                                }}>
                                    Site Dashboard
                                </h1>
                                <p style={{ 
                                    margin: '5px 0 0 0', 
                                    fontSize: '14px', 
                                    opacity: 0.8 
                                }}>
                                    Employee & Project Overview
                                </p>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={fetchDashboardData}
                                    disabled={loading}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: 'transparent',
                                        border: `1px solid ${themeStyles.border}`,
                                        color: themeStyles.color,
                                        borderRadius: '4px',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    {loading ? 'Loading...' : 'Refresh'}
                                </button>
                                <button
                                    onClick={toggleTheme}
                                    title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: 'transparent',
                                        border: `1px solid ${themeStyles.border}`,
                                        color: themeStyles.color,
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    {theme === 'light' ? 'Dark' : 'Light'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div style={{ 
                        padding: '2rem',
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        {loading && <LoadingSpinner />}
                        {error && <ErrorDisplay />}
                        {dashboardData && !loading && (
                            <>
                                <EmployeeStatsTable />
                                <ProjectStatsTable />
                            </>
                        )}
                        
                        {!loading && !error && !dashboardData && (
                            <div style={{
                                textAlign: 'center',
                                padding: '50px',
                                color: themeStyles.color
                            }}>
                                <h3>No data available</h3>
                                <p>Please check your API connection and try again.</p>
                                <button 
                                    onClick={fetchDashboardData}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: '#fd7e14',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        marginTop: '10px'
                                    }}
                                >
                                    Load Data
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SiteDashboard;