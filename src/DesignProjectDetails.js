import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const ProjectDetails = () => {
    const { fileid } = useParams();
    const navigate = useNavigate();
    const [theme, setTheme] = useState('light');
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('PROJECT DETAILS');
    const [projectData, setProjectData] = useState(null);
    const [poDetails, setPoDetails] = useState([]);
    const [selectedPo, setSelectedPo] = useState(null);

    // Tabs configuration
    const tabs = [
        'PROJECT DETAILS',
        'ADVANCE COPY(LONG LEAD MATERIAL)',
        'DESIGN EXCEL',
        'DRAWINGS'
    ];

    // Mock data - Replace with API call later
    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setProjectData({
                fileId: 'SM-25-001-CG-IV',
                fileName: 'CIPLA/GOA-IV/PHARMA DTAPlot No L-139 to L-146,Verna Elec',
                customerName: 'CIPLA LIMITED',
                contactPerson: 'Mr Kiran',
                siteEngineer: 'Mr Rohan',
                dateDispatch: '2025-04-03',
                financialYear: '25-26',
                location: 'Goa',
                city: 'Verna',
                miscellaneous: 'NA'
            });

            setPoDetails([
                {
                    id: 1,
                    poType: 'SUPPLY - V1',
                    poNumber: '4800722999',
                    poDate: '02-04-2025',
                    basicAmount: '32400',
                    type: 'Supply',
                    lastUploaded: '03-04-2025 21:49:56',
                    viewCount: 0
                },
                {
                    id: 2,
                    poType: 'INSTALLATION - V2',
                    poNumber: '4800723000',
                    poDate: '05-04-2025',
                    basicAmount: '15600',
                    type: 'Installation',
                    lastUploaded: '06-04-2025 10:30:22',
                    viewCount: 5
                }
            ]);

            setSelectedPo(0); // Select first PO by default
            setLoading(false);
        }, 500);
    }, [fileid]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const handleBackToList = () => {
        navigate('/');
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        toast.info(`Switched to ${tab}`);
    };

    const handlePoSelect = (index) => {
        setSelectedPo(index);
    };

    // Theme styles
    const getThemeStyles = () => {
        if (theme === 'dark') {
            return {
                backgroundColor: 'linear-gradient(135deg, #21262d 0%, #161b22 100%)',
                color: '#f8f9fa',
                cardBg: '#343a40',
                cardHeader: 'linear-gradient(135deg, #495057 0%, #343a40 100%)',
                inputBg: '#2c3034',
                borderColor: '#495057'
            };
        }
        return {
            backgroundColor: 'linear-gradient(135deg, #f8f9ff 0%, #e6f3ff 100%)',
            color: '#212529',
            cardBg: '#ffffff',
            cardHeader: 'linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%)',
            inputBg: '#f8f9fa',
            borderColor: '#dee2e6'
        };
    };

    const themeStyles = getThemeStyles();

    // Apply theme to document body
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
                    <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem', borderColor: '#ff6b35', borderRightColor: 'transparent' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading project details...</p>
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
            <div className="container-fluid">
                {/* Header with Back Button and Theme Toggle */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={handleBackToList}
                    >
                        <i className="bi bi-arrow-left"></i> Back to Project List
                    </button>
                    <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={toggleTheme}
                        title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
                    >
                        {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
                    </button>
                </div>

                {/* Tabs Navigation */}
                <div className="card mb-3" style={{
                    backgroundColor: themeStyles.cardBg,
                    border: `1px solid ${themeStyles.borderColor}`
                }}>
                    <div className="card-body p-0">
                        <div className="d-flex flex-wrap" style={{ gap: '0' }}>
                            {tabs.map((tab, index) => (
                                <button
                                    key={tab}
                                    className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-outline-secondary'}`}
                                    style={{
                                        flex: '1',
                                        minWidth: '200px',
                                        borderRadius: '0',
                                        padding: '12px 20px',
                                        fontWeight: '600',
                                        fontSize: '13px',
                                        backgroundColor: activeTab === tab ? '#ff6b35' : 'transparent',
                                        borderColor: themeStyles.borderColor,
                                        color: activeTab === tab ? '#ffffff' : themeStyles.color,
                                        borderBottom: activeTab === tab ? '3px solid #ff6b35' : 'none'
                                    }}
                                    onClick={() => handleTabChange(tab)}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                {activeTab === 'PROJECT DETAILS' && (
                    <div className="row">
                        {/* Left Side - Project Information */}
                        <div className="col-md-9">
                            <div className="card" style={{
                                backgroundColor: themeStyles.cardBg,
                                border: `1px solid ${themeStyles.borderColor}`,
                                marginBottom: '20px'
                            }}>
                                <div className="card-header" style={{
                                    background: themeStyles.cardHeader,
                                    fontWeight: 'bold',
                                    padding: '12px 20px'
                                }}>
                                    {projectData?.fileId}
                                </div>
                                <div className="card-body">
                                    <div className="row g-3">
                                        {/* File Name */}
                                        <div className="col-12">
                                            <label className="form-label mb-1" style={{ 
                                                fontWeight: '500', 
                                                fontSize: '13px',
                                                color: '#ff6b35' 
                                            }}>
                                                File Name
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={projectData?.fileName}
                                                readOnly
                                                style={{
                                                    backgroundColor: themeStyles.inputBg,
                                                    border: `1px solid ${themeStyles.borderColor}`,
                                                    color: '#ff6b35',
                                                    fontWeight: '500'
                                                }}
                                            />
                                        </div>

                                        {/* Customer Name and Miscellaneous */}
                                        <div className="col-md-6">
                                            <label className="form-label mb-1" style={{ 
                                                fontWeight: '500', 
                                                fontSize: '13px',
                                                color: '#ff6b35' 
                                            }}>
                                                Customer Name
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={projectData?.customerName}
                                                readOnly
                                                style={{
                                                    backgroundColor: themeStyles.inputBg,
                                                    border: `1px solid ${themeStyles.borderColor}`,
                                                    color: themeStyles.color
                                                }}
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label mb-1" style={{ 
                                                fontWeight: '500', 
                                                fontSize: '13px',
                                                color: '#ff6b35' 
                                            }}>
                                                Miscellaneous
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={projectData?.miscellaneous}
                                                readOnly
                                                style={{
                                                    backgroundColor: themeStyles.inputBg,
                                                    border: `1px solid ${themeStyles.borderColor}`,
                                                    color: themeStyles.color
                                                }}
                                            />
                                        </div>

                                        {/* Contact Person and Financial Year */}
                                        <div className="col-md-6">
                                            <label className="form-label mb-1" style={{ 
                                                fontWeight: '500', 
                                                fontSize: '13px',
                                                color: '#ff6b35' 
                                            }}>
                                                Contact Person
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={projectData?.contactPerson}
                                                readOnly
                                                style={{
                                                    backgroundColor: themeStyles.inputBg,
                                                    border: `1px solid ${themeStyles.borderColor}`,
                                                    color: themeStyles.color
                                                }}
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label mb-1" style={{ 
                                                fontWeight: '500', 
                                                fontSize: '13px',
                                                color: '#ff6b35' 
                                            }}>
                                                Financial Year
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={projectData?.financialYear}
                                                readOnly
                                                style={{
                                                    backgroundColor: themeStyles.inputBg,
                                                    border: `1px solid ${themeStyles.borderColor}`,
                                                    color: '#ff6b35',
                                                    fontWeight: '500'
                                                }}
                                            />
                                        </div>

                                        {/* Site Engineer */}
                                        <div className="col-md-6">
                                            <label className="form-label mb-1" style={{ 
                                                fontWeight: '500', 
                                                fontSize: '13px',
                                                color: '#ff6b35' 
                                            }}>
                                                Site Engineer
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={projectData?.siteEngineer}
                                                readOnly
                                                style={{
                                                    backgroundColor: themeStyles.inputBg,
                                                    border: `1px solid ${themeStyles.borderColor}`,
                                                    color: themeStyles.color
                                                }}
                                            />
                                        </div>

                                        {/* Location */}
                                        <div className="col-md-6">
                                            <label className="form-label mb-1" style={{ 
                                                fontWeight: '500', 
                                                fontSize: '13px',
                                                color: '#ff6b35' 
                                            }}>
                                                Location
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={projectData?.location}
                                                readOnly
                                                style={{
                                                    backgroundColor: themeStyles.inputBg,
                                                    border: `1px solid ${themeStyles.borderColor}`,
                                                    color: themeStyles.color
                                                }}
                                            />
                                        </div>

                                        {/* Date Dispatch */}
                                        <div className="col-md-6">
                                            <label className="form-label mb-1" style={{ 
                                                fontWeight: '500', 
                                                fontSize: '13px',
                                                color: '#ff6b35' 
                                            }}>
                                                Date Dispatch
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={projectData?.dateDispatch}
                                                readOnly
                                                style={{
                                                    backgroundColor: themeStyles.inputBg,
                                                    border: `1px solid ${themeStyles.borderColor}`,
                                                    color: '#ff6b35',
                                                    fontWeight: '500'
                                                }}
                                            />
                                        </div>

                                        {/* City */}
                                        <div className="col-md-6">
                                            <label className="form-label mb-1" style={{ 
                                                fontWeight: '500', 
                                                fontSize: '13px',
                                                color: '#ff6b35' 
                                            }}>
                                                City
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={projectData?.city}
                                                readOnly
                                                style={{
                                                    backgroundColor: themeStyles.inputBg,
                                                    border: `1px solid ${themeStyles.borderColor}`,
                                                    color: themeStyles.color
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - PO Details */}
                        <div className="col-md-3">
                            <div className="card" style={{
                                backgroundColor: themeStyles.cardBg,
                                border: `1px solid ${themeStyles.borderColor}`
                            }}>
                                <div className="card-header" style={{
                                    background: themeStyles.cardHeader,
                                    fontWeight: 'bold',
                                    padding: '12px 20px'
                                }}>
                                    PO Details
                                </div>
                                <div className="card-body p-0">
                                    {poDetails.map((po, index) => (
                                        <div
                                            key={po.id}
                                            className={`p-3 ${selectedPo === index ? 'border-start border-3 border-primary' : ''}`}
                                            style={{
                                                cursor: 'pointer',
                                                backgroundColor: selectedPo === index ? (theme === 'dark' ? '#495057' : '#e7f3ff') : 'transparent',
                                                borderBottom: `1px solid ${themeStyles.borderColor}`,
                                                transition: 'all 0.3s ease'
                                            }}
                                            onClick={() => handlePoSelect(index)}
                                        >
                                            <div style={{
                                                fontWeight: 'bold',
                                                color: '#0066cc',
                                                fontSize: '14px',
                                                marginBottom: '8px'
                                            }}>
                                                {po.poType}
                                            </div>
                                            <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                                                <span style={{ fontWeight: '500' }}>PO Number:</span> {po.poNumber}
                                            </div>
                                            <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                                                <span style={{ fontWeight: '500' }}>PO Date:</span> {po.poDate}
                                            </div>
                                            <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                                                <span style={{ fontWeight: '500' }}>PO Basic Amount:</span> {po.basicAmount}
                                            </div>
                                            <div style={{ fontSize: '12px', marginBottom: '8px' }}>
                                                <span style={{ fontWeight: '500' }}>PO Type:</span> {po.type}
                                            </div>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                fontSize: '11px',
                                                color: '#666'
                                            }}>
                                                <div>
                                                    <i className="bi bi-clock"></i> Last Uploaded:
                                                    <span style={{
                                                        display: 'inline-block',
                                                        backgroundColor: '#ff6b35',
                                                        color: 'white',
                                                        padding: '2px 6px',
                                                        borderRadius: '3px',
                                                        marginLeft: '4px',
                                                        fontSize: '10px'
                                                    }}>
                                                        {po.lastUploaded}
                                                    </span>
                                                </div>
                                                <div>
                                                    <i className="bi bi-eye"></i> {po.viewCount}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Other Tabs Content */}
                {activeTab !== 'PROJECT DETAILS' && (
                    <div className="card" style={{
                        backgroundColor: themeStyles.cardBg,
                        border: `1px solid ${themeStyles.borderColor}`
                    }}>
                        <div className="card-body text-center py-5">
                            <i className="bi bi-inbox" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                            <h5 className="mt-3">Content for {activeTab}</h5>
                            <p className="text-muted">This section will be populated with API data</p>
                        </div>
                    </div>
                )}
            </div>

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

export default ProjectDetails;