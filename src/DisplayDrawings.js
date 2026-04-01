import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";

const UploadedDrawings = () => {
    // Remove fileid from props, only use useParams
    const { fileid } = useParams(); // Get fileid from URL (matches route parameter)

    const [theme, setTheme] = useState('light');
    const [drawingsData, setDrawingsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [selectedDocuments, setSelectedDocuments] = useState([]);

    // Handle window resize for mobile responsiveness
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch drawings data from API
    const fetchDrawingsData = async () => {
        if (!fileid) {
            setError('File ID is missing');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/DisplayDrawingsApi.php?fileId=${fileid}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.status === "success") {
                setDrawingsData(data);
            } else {
                throw new Error(data.message || "Failed to fetch drawings data");
            }
        } catch (error) {
            console.error("Error fetching drawings data:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch data when fileid changes
    useEffect(() => {
        if (fileid) {
            fetchDrawingsData();
        }
    }, [fileid]);

    // Handle checkbox selection
    const handleCheckboxChange = (docId) => {
        setSelectedDocuments(prev => {
            if (prev.includes(docId)) {
                return prev.filter(id => id !== docId);
            } else {
                return [...prev, docId];
            }
        });
    };

    // Theme styles
    const getThemeStyles = () => {
        if (theme === 'dark') {
            return {
                backgroundColor: '#21262d',
                color: '#f8f9fa',
                cardBg: '#2d333b',
                headerBg: '#343a40',
                border: '#495057',
                rowBg: '#2d333b',
                rowHoverBg: '#343a40'
            };
        }
        return {
            backgroundColor: '#f8f9ff',
            color: '#212529',
            cardBg: '#ffffff',
            headerBg: '#f8f9fa',
            border: '#dee2e6',
            rowBg: '#ffffff',
            rowHoverBg: '#f8f9fa'
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
            <p style={{ marginTop: '20px', color: themeStyles.color }}>Loading drawings...</p>
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
            margin: '20px'
        }}>
            <h3>Error Loading Drawings</h3>
            <p>{error}</p>
            <button
                onClick={fetchDrawingsData}
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

    // Show message if no fileid
    if (!fileid) {
        return (
            <div style={{
                minHeight: '100vh',
                backgroundColor: themeStyles.backgroundColor,
                color: themeStyles.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <h3>No File ID Provided</h3>
                    <p>Please navigate from a valid project.</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: themeStyles.backgroundColor,
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
                }
                .drawing-row:hover {
                    background-color: ${themeStyles.rowHoverBg} !important;
                }
            `}</style>

            {/* Header */}
            <div style={{
                backgroundColor: themeStyles.headerBg,
                padding: '1.5rem 2rem',
                borderBottom: `2px solid #fd7e14`,
                position: 'sticky',
                top: 0,
                zIndex: 100
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
                            fontWeight: 'bold',
                            color: '#fd7e14'
                        }}>
                            Uploaded Drawings
                        </h1>
                        <p style={{
                            margin: '5px 0 0 0',
                            fontSize: '14px',
                            opacity: 0.8
                        }}>
                            File ID: {fileid}
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={fetchDrawingsData}
                            disabled={loading}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#fd7e14',
                                border: 'none',
                                color: 'white',
                                borderRadius: '4px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                opacity: loading ? 0.6 : 1
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
                            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: isMobile ? '1rem' : '2rem' }}>
                {loading && <LoadingSpinner />}
                {error && <ErrorDisplay />}

                {drawingsData && !loading && !error && (
                    <div style={{
                        backgroundColor: themeStyles.cardBg,
                        borderRadius: '8px',
                        padding: isMobile ? '1rem' : '1.5rem',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                        {/* Summary Info */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '20px',
                            padding: '15px',
                            backgroundColor: themeStyles.headerBg,
                            borderRadius: '6px',
                            flexWrap: 'wrap',
                            gap: '10px'
                        }}>
                            <div>
                                <strong>Total Comments:</strong> {drawingsData.totalComments}
                            </div>
                            <div>
                                <strong>Total Documents:</strong> {
                                    drawingsData.data.reduce((sum, comment) =>
                                        sum + comment.documents.length, 0
                                    )
                                }
                            </div>
                            {selectedDocuments.length > 0 && (
                                <div style={{ color: '#fd7e14', fontWeight: 'bold' }}>
                                    Selected: {selectedDocuments.length}
                                </div>
                            )}
                        </div>

                        {/* Drawings Table */}
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                fontSize: isMobile ? '12px' : '14px'
                            }}>
                                <thead>
                                    <tr style={{
                                        backgroundColor: '#fd7e14',
                                        color: 'white'
                                    }}>
                                        <th style={headerCellStyle}>Uploaded Date</th>
                                        <th style={headerCellStyle}>Category</th>
                                        <th style={headerCellStyle}>File Name</th>
                                        <th style={headerCellStyle}>Preview</th>
                                        <th style={headerCellStyle}>Select</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {drawingsData.data.map((comment) =>
                                        comment.documents.map((doc, docIndex) => (
                                            <tr
                                                key={`${comment.commentId}-${doc.docId}`}
                                                className="drawing-row"
                                                style={{
                                                    backgroundColor: themeStyles.rowBg,
                                                    borderBottom: `1px solid ${themeStyles.border}`,
                                                    transition: 'background-color 0.2s'
                                                }}
                                            >
                                                <td style={dataCellStyle}>
                                                    {comment.uploadedDate}
                                                </td>
                                                <td style={dataCellStyle}>
                                                    {doc.docName}
                                                </td>
                                                <td style={dataCellStyle}>
                                                    {doc.fileName}
                                                </td>
                                                <td style={{ ...dataCellStyle, textAlign: 'right' }}>
                                                    <a
                                                        href={doc.fullFileUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{
                                                            textDecoration: 'none',
                                                            display: 'inline-block'
                                                        }}
                                                    >
                                                        {doc.isPdf ? (
                                                            <div style={{
                                                                width: '40px',
                                                                height: '40px',
                                                                backgroundColor: '#dc3545',
                                                                borderRadius: '4px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                color: 'white',
                                                                fontWeight: 'bold',
                                                                fontSize: '12px'
                                                            }}>
                                                                PDF
                                                            </div>
                                                        ) : (
                                                            <img
                                                                src={doc.thumbnailUrl}
                                                                alt={doc.fileName}
                                                                style={{
                                                                    width: '50px',
                                                                    height: '50px',
                                                                    objectFit: 'cover',
                                                                    borderRadius: '4px',
                                                                    border: '1px solid #ddd'
                                                                }}
                                                            />
                                                        )}
                                                    </a>
                                                </td>
                                                <td style={{ ...dataCellStyle, textAlign: 'right' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedDocuments.includes(doc.docId)}
                                                        onChange={() => handleCheckboxChange(doc.docId)}
                                                        style={{
                                                            width: '20px',
                                                            height: '20px',
                                                            cursor: 'pointer'
                                                        }}
                                                    />
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {drawingsData.data.length === 0 && (
                            <div style={{
                                textAlign: 'center',
                                padding: '40px',
                                color: themeStyles.color,
                                opacity: 0.7
                            }}>
                                <p>No drawings found for this project.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// Reusable cell styles
const headerCellStyle = {
    padding: '12px 16px',
    textAlign: 'left',
    fontWeight: 'bold',
    borderBottom: '2px solid rgba(255,255,255,0.2)',
    textAlign:"right"

};

const dataCellStyle = {
    padding: '12px 16px',
    borderBottom: '1px solid #dee2e6',
    textAlign:"right"
};

export default UploadedDrawings;