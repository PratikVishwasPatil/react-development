import React, { useEffect, useMemo, useState, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { useNavigate } from "react-router-dom";
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
import 'react-toastify/dist/ReactToastify.css';
import { useLocation } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Container, Button, Row, Col, Card, ButtonGroup, Dropdown, Modal, Nav, Tab } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

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

const GridExample = () => {
    const [theme, setTheme] = useState('light');
    const [rowData, setRowData] = useState([]);
    const [columnDefs, setColumnDefs] = useState([]);
    const [isFullScreen, setIsFullScreen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [loading, setLoading] = useState(true);
    const [selectedRows, setSelectedRows] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [activeTab, setActiveTab] = useState(''); // Will be set dynamically
    const [tabData, setTabData] = useState({}); // Cache data for each tab
    const [tabConfig, setTabConfig] = useState([]); // Dynamic tab configuration
    const [tabsLoading, setTabsLoading] = useState(true);
    // const [formName, setFormName] = useState('Add Company'); // Default form name, you can make this dynamic

    const gridRef = useRef();
    const navigate = useNavigate();
    const location = useLocation();

    // Format title from route or use default
    const path = location.pathname.split('/').pop();
    const formattedTitle = path
        ? path.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        : 'Dynamic AI Form';

    const formName = formattedTitle;
    // Fetch dynamic tabs from get_fields.php API
    const fetchTabs = async () => {
        let newFormName = '';

        if (formattedTitle === 'Company List') {
            newFormName = 'Add Company';
        } else if (formattedTitle === 'Nc List') {
            newFormName = 'Add Nc';

        } else {
            newFormName = 'Add Company';


        }
        setTabsLoading(true);
        try {
            const response = await axios.post('https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/get_fields.php', {
                form_name: newFormName
            });

            if (response.data && Array.isArray(response.data)) {
                const dynamicTabs = response.data.map(category => ({
                    key: category.category_key,
                    label: category.category_label,
                    categoryId: category.id,
                    sequence: category.sequence,
                    icon: category.badge || 'bi-folder',
                    isMultiple: category.is_multiple,
                    fields: category.fields,
                    is_tab: category.is_tab,
                    tab_name: category.tab_name,
                    formName: newFormName
                }));

                // Sort tabs by sequence
                dynamicTabs.sort((a, b) => a.sequence - b.sequence);

                setTabConfig(dynamicTabs);

                // Set first tab as active if no active tab is set
                if (dynamicTabs.length > 0 && !activeTab) {
                    setActiveTab(dynamicTabs[0].key);
                }
            } else {
                console.error('Invalid response format for tabs:', response.data);
                toast.error('Failed to load tabs');
            }
        } catch (error) {
            console.error('Error fetching tabs:', error);
            toast.error('Error loading tabs: ' + error.message);
        } finally {
            setTabsLoading(false);
        }
    };

    // Get current tab configuration
    const getCurrentTabConfig = () => {
        return tabConfig.find(tab => tab.key === activeTab) || tabConfig[0];
    };

    // Customizable gradient colors - easily adjustable
    const gradientColors = {
        dark: {
            color1: '#1a1a2e',
            color2: '#16213e',
            percentage1: '0%',
            percentage2: '100%',
            angle: '135deg'
        },
        light: {
            color1: '#f8f9ff',
            color2: '#e6f3ff',
            percentage1: '0%',
            percentage2: '100%',
            angle: '135deg'
        }
    };

    // Handle window resize for mobile responsiveness
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Load tabs on component mount
    useEffect(() => {
        fetchTabs();
    }, [formName]);

    // Function to create column name from field key
    const createColumnName = (key) => {
        return key
            .replace(/[_-]/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase())
            .trim();
    };

    // Function to determine column width based on content and field type
    const getColumnWidth = (key, sampleValue) => {
        const baseWidth = isMobile ? 120 : 150;
        const keyLength = key.length;
        const valueLength = sampleValue ? String(sampleValue).length : 0;

        // Calculate width based on content length
        const contentWidth = Math.max(keyLength, valueLength) * 8 + 40;
        const minWidth = isMobile ? 100 : 120;
        const maxWidth = isMobile ? 200 : 300;

        return Math.min(Math.max(contentWidth, minWidth), maxWidth);
    };

    // Enhanced function to clean HTML content and extract text
    const cleanHtmlContent = (value) => {
        if (!value) return '-';

        // Handle different data types
        if (typeof value !== 'string') {
            return String(value);
        }

        // Check if value contains HTML tags
        const hasHTMLTags = /<[^>]*>/g.test(value);

        if (!hasHTMLTags) {
            // No HTML tags, return as is (but handle empty strings)
            return value.trim() || '-';
        }

        // Create a temporary DOM element to parse HTML safely
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = value;

        // Extract text content
        let cleanValue = tempDiv.textContent || tempDiv.innerText || '';

        // Additional cleanup for common HTML entities
        cleanValue = cleanValue
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&apos;/g, "'")
            .trim();

        // Return dash if empty after cleaning
        return cleanValue || '-';
    };

    // Function to generate column definitions for tab-specific fields
    const generateTabColumnDefs = (tabFields, currentTab) => {
        if (!tabFields || tabFields.length === 0) return [];

        const dynamicColumns = [
            // Serial Number Column
            {
                headerName: "Sr No",
                field: "serialNumber",
                valueGetter: (params) => params.node ? params.node.rowIndex + 1 : '',
                width: isMobile ? 60 : 80,
                minWidth: 50,
                pinned: 'left',
                lockPosition: true,
                cellStyle: { fontWeight: 'bold', textAlign: 'center' },
                suppressSizeToFit: true
            }
        ];

        // Add Tab Name column if is_tab is "yes"
        if (currentTab && currentTab.is_tab === 'yes') {
            dynamicColumns.push({
                headerName: "Tab Name",
                field: "tab_name",
                filter: "agTextColumnFilter",
                floatingFilter: !isMobile,
                width: isMobile ? 120 : 150,
                minWidth: isMobile ? 100 : 120,
                resizable: true,
                sortable: true,
                pinned: 'left',
                lockPosition: true,
                cellStyle: {
                    fontWeight: 'bold',
                    textAlign: 'center',
                    backgroundColor: theme === 'dark' ? '#495057' : '#e9ecef',
                    color: theme === 'dark' ? '#fff' : '#495057'
                },
                cellRenderer: (params) => {
                    return currentTab.tab_name || '-';
                },
                valueGetter: () => currentTab.tab_name || ''
            });
        }

        // Add checkbox selection to first data column
        let isFirstDataColumn = true;

        tabFields.forEach((field, index) => {
            const columnWidth = getColumnWidth(field.field_name, '');

            const columnDef = {
                field: field.field_name,
                headerName: createColumnName(field.field_name),
                filter: "agTextColumnFilter",
                floatingFilter: !isMobile,
                width: columnWidth,
                minWidth: isMobile ? 80 : 100,
                resizable: true,
                sortable: true,
                ...(isFirstDataColumn && {
                    checkboxSelection: true,
                    headerCheckboxSelection: true,
                    pinned: 'left',
                    lockPosition: true
                }),
                // Hide some columns on mobile to prevent overcrowding
                ...(isMobile && index > 2 && !isFullScreen && {
                    hide: true
                }),
                // Enhanced cell renderer with better HTML handling
                cellRenderer: (params) => {
                    let value = params.value;

                    // Handle null/undefined values first
                    if (value === null || value === undefined) {
                        return '-';
                    }

                    // Clean HTML content
                    const cleanedValue = cleanHtmlContent(value);

                    // Handle empty values after cleaning
                    if (cleanedValue === '-' || cleanedValue === '') {
                        return '-';
                    }

                    // Format dates for date fields
                    if (field.field_type === 'date' && cleanedValue !== '-') {
                        try {
                            const date = new Date(cleanedValue);
                            if (!isNaN(date.getTime())) {
                                return date.toLocaleDateString();
                            }
                        } catch (e) {
                            // If date parsing fails, return cleaned value
                        }
                    }

                    // Handle select/radio options
                    if ((field.field_type === 'select' || field.field_type === 'radio') && field.options) {
                        const options = Array.isArray(field.options) ? field.options : field.options.split(',');
                        const matchedOption = options.find(opt => opt.trim() === cleanedValue);
                        return matchedOption || cleanedValue;
                    }

                    // Return cleaned value
                    return cleanedValue;
                },
                // Enhanced value getter for sorting and filtering
                valueGetter: (params) => {
                    const value = params.data[field.field_name];
                    return cleanHtmlContent(value);
                }
            };

            dynamicColumns.push(columnDef);
            isFirstDataColumn = false;
        });

        return dynamicColumns;
    };

    const defaultColDef = useMemo(() => ({
        filter: true,
        sortable: true,
        floatingFilter: !isMobile,
        resizable: true,
        suppressMenu: isMobile,
        flex: isMobile ? 1 : 0,
        cellStyle: { textAlign: 'left' }
    }), [isMobile]);

    // Enhanced fetch data function with tab support
    const fetchData = async (tabKey = activeTab) => {
        let newFormName = '';

        if (formattedTitle === 'Company List') {
            newFormName = 'Add Company';
        }
        setLoading(true);
        try {
            const currentTab = tabConfig.find(tab => tab.key === tabKey);
            if (!currentTab) {
                console.error('Tab configuration not found for:', tabKey);
                return;
            }

            let requestPayload = {
                type: "SelectAll",
                table: "submitted_forms",
                form_name: newFormName,
                category_key: currentTab.key // Filter by category if needed
            };

            const response = await fetch("https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/get_aggrid_dynamic_data.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestPayload),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.status === "success" && Array.isArray(data.data) && data.data.length > 0) {
                // Filter data to only include fields from current tab
                const tabFieldNames = currentTab.fields.map(field => field.field_name);

                const formattedData = data.data.map((row, index) => {
                    const cleanedRow = {};

                    // Add ID field (assuming it exists)
                    if (row.id) cleanedRow.id = row.id;

                    // Add tab_name if is_tab is "yes"
                    if (currentTab.is_tab === 'yes') {
                        cleanedRow.tab_name = currentTab.tab_name;
                    }

                    // Only include fields that belong to this tab
                    tabFieldNames.forEach(fieldName => {
                        if (row.hasOwnProperty(fieldName)) {
                            cleanedRow[fieldName] = cleanHtmlContent(row[fieldName]);
                        }
                    });

                    return cleanedRow;
                });

                // Generate column definitions based on tab fields
                const tabColumnDefs = generateTabColumnDefs(currentTab.fields, currentTab);

                // Cache the data for this tab
                setTabData(prev => ({
                    ...prev,
                    [tabKey]: {
                        rowData: formattedData,
                        columnDefs: tabColumnDefs
                    }
                }));

                // Update current view if this is the active tab
                if (tabKey === activeTab) {
                    setRowData(formattedData);
                    setColumnDefs(tabColumnDefs);
                }
            } else {
                console.warn("No data received or invalid response format:", data);
                setTabData(prev => ({
                    ...prev,
                    [tabKey]: {
                        rowData: [],
                        columnDefs: generateTabColumnDefs(currentTab.fields, currentTab)
                    }
                }));

                if (tabKey === activeTab) {
                    setRowData([]);
                    setColumnDefs(generateTabColumnDefs(currentTab.fields, currentTab));
                }
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error(`Error loading data for ${tabConfig.find(t => t.key === tabKey)?.label}: ${error.message}`);

            const currentTab = tabConfig.find(tab => tab.key === tabKey);
            const fallbackColumnDefs = currentTab ? generateTabColumnDefs(currentTab.fields, currentTab) : [];

            setTabData(prev => ({
                ...prev,
                [tabKey]: {
                    rowData: [],
                    columnDefs: fallbackColumnDefs
                }
            }));

            if (tabKey === activeTab) {
                setRowData([]);
                setColumnDefs(fallbackColumnDefs);
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle tab change
    const handleTabChange = async (tabKey) => {
        setActiveTab(tabKey);
        setSelectedRows([]); // Clear selection when switching tabs

        // Check if data is already cached
        if (tabData[tabKey]) {
            setRowData(tabData[tabKey].rowData);
            setColumnDefs(tabData[tabKey].columnDefs);
        } else {
            // Fetch data for the new tab
            await fetchData(tabKey);
        }
    };

    // Load initial data when tabs are loaded and active tab is set
    useEffect(() => {
        if (activeTab && tabConfig.length > 0) {
            fetchData(activeTab);
        }
    }, [activeTab, tabConfig, isMobile, isFullScreen]);

    const handleEditRow = () => {
        if (selectedRows.length !== 1) {
            toast.error('Please select exactly one row to edit');
            return;
        }

        const selectedRow = selectedRows[0];
        const currentTab = getCurrentTabConfig();

        // Check if the row has an ID field
        if (!selectedRow.id) {
            toast.error('Selected row does not have an ID field');
            return;
        }

        const editRoute = `/${formName.toLowerCase().replace(/\s+/g, '-')}/${selectedRow.id}`;

        // Navigate to the appropriate edit route with the ID
        navigate(editRoute, {
            state: {
                userData: selectedRow,
                formTitle: formName,
                categoryKey: currentTab.key,
                categoryLabel: currentTab.label
            }
        });
    };

    // Delete functionality
    const handleDeleteRows = async () => {
        if (selectedRows.length === 0) return;

        setDeleteLoading(true);
        const currentTab = getCurrentTabConfig();

        try {
            // Delete each selected row
            const deletePromises = selectedRows.map(async (row) => {
                const requestPayload = {
                    type: "delete",
                    table: "submitted_forms",
                    form_name: formName,
                    delete_values: {
                        where_values: {
                            id: row.id
                        }
                    }
                };

                const response = await fetch("https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/deleteData.php", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestPayload),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                if (data.status !== "success") {
                    throw new Error(data.message || "Delete failed");
                }

                return data;
            });

            await Promise.all(deletePromises);

            // Show success message
            toast.success(`Successfully deleted ${selectedRows.length} row(s)`);

            // Clear cached data for current tab and refresh
            setTabData(prev => {
                const newData = { ...prev };
                delete newData[activeTab];
                return newData;
            });

            // Refresh the data for current tab
            await fetchData(activeTab);

            // Clear selection
            setSelectedRows([]);

            // Close modal
            setShowDeleteModal(false);

        } catch (error) {
            toast.error(`Error deleting rows: ${error.message}`);
            console.error("Error deleting rows:", error);
        } finally {
            setDeleteLoading(false);
        }
    };

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    // Apply theme to document body
    useEffect(() => {
        if (theme === 'dark') {
            document.body.style.background = 'linear-gradient(135deg, #21262d 0%, #161b22 100%)';
            document.body.style.color = '#f8f9fa';
            document.body.style.minHeight = '100vh';
        } else {
            document.body.style.background = 'linear-gradient(135deg,rgba(252, 252, 255, 0.96) 0%,rgb(229, 235, 240) 100%)';
            document.body.style.color = '#212529';
            document.body.style.minHeight = '100vh';
        }

        return () => {
            document.body.style.background = '';
            document.body.style.color = '';
            document.body.style.minHeight = '';
        };
    }, [theme]);

    const onSelectionChanged = (event) => {
        const selectedNodes = event.api.getSelectedNodes();
        const selectedData = selectedNodes.map(node => node.data);
        setSelectedRows(selectedData);

        if (selectedNodes.length === 1) {
            console.log("Selected row data:", selectedData[0]);
        }
    };

    // Enhanced grid utility functions
    const downloadExcel = () => {
        if (!gridRef.current || !gridRef.current.api) {
            console.warn("Grid API not available");
            return;
        }

        try {
            const api = gridRef.current.api;
            const currentTab = getCurrentTabConfig();
            const params = {
                fileName: `${formName}_${currentTab?.label || 'data'}_${new Date().toISOString().split('T')[0]}.csv`,
                allColumns: true,
                onlySelected: false,
                suppressQuotes: false,
                columnSeparator: ',',
                processCellCallback: (params) => {
                    // Clean HTML from exported data
                    return cleanHtmlContent(params.value);
                }
            };

            api.exportDataAsCsv(params);
        } catch (error) {
            console.error("Error exporting CSV:", error);
        }
    };

    const getThemeStyles = () => {
        const currentGradient = gradientColors[theme];
        const gradientBackground = `linear-gradient(${currentGradient.angle}, ${currentGradient.color1} ${currentGradient.percentage1}, ${currentGradient.color2} ${currentGradient.percentage2})`;

        if (theme === 'dark') {
            return {
                backgroundColor: gradientBackground,
                color: '#f8f9fa',
                cardBg: '#ffffff',
                cardHeader: 'linear-gradient(135deg,rgb(203, 210, 219) 0%, #161b22 100%)',
                buttonVariant: 'outline-light',
                textClass: 'text-light',
                borderClass: 'border-secondary'
            };
        }
        return {
            backgroundColor: gradientBackground,
            color: '#212529',
            cardBg: '#ffffff',
            cardHeader: 'linear-gradient(135deg,rgba(218, 208, 208, 0.67) 0%,rgba(97, 91, 91, 0.56) 100%)',
            buttonVariant: 'outline-dark',
            textClass: 'text-dark',
            borderClass: 'border-light'
        };
    };

    const themeStyles = getThemeStyles();

    const getGridHeight = () => {
        if (isFullScreen) {
            return isMobile ? 'calc(100vh - 220px)' : 'calc(100vh - 240px)'; // Adjusted for tabs
        }
        return isMobile ? '350px' : '550px'; // Adjusted for tabs
    };

    const gridHeight = getGridHeight();
    const containerStyles = isFullScreen ? {
        margin: 0,
        padding: 0,
        maxWidth: '100%',
        width: '100vw'
    } : {};

    const cardStyles = isFullScreen ? {
        margin: 0,
        borderRadius: 0,
        height: '100vh',
        border: 'none'
    } : {
        margin: isMobile ? '10px' : '20px',
        borderRadius: '8px'
    };

    if (loading || tabsLoading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: theme === 'dark'
                    ? 'linear-gradient(135deg, #21262d 0%, #161b22 100%)'
                    : 'linear-gradient(135deg,rgba(109, 104, 204, 0.91) 0%,rgba(83, 92, 100, 0.32) 100%)'
            }}>
                <div style={{ textAlign: 'center', color: theme === 'dark' ? '#f8f9fa' : '#212529' }}>
                    <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading dynamic tabs and form fields...</p>
                </div>
            </div>
        );
    }

    return (
        <div
            style={{
                minHeight: '100vh',
                background: theme === 'dark'
                    ? 'linear-gradient(135deg, #21262d 0%, #161b22 100%)'
                    : 'linear-gradient(135deg,rgba(109, 104, 204, 0.91) 0%,rgba(83, 92, 100, 0.32) 100%)',
                color: themeStyles.color,
                padding: 0,
                margin: 0,
                overflow: isFullScreen ? 'hidden' : 'auto'
            }}
        >
            <Container
                fluid={isFullScreen}
                style={containerStyles}
                className={isFullScreen ? 'p-0' : ''}
            >
                <Card
                    style={{
                        backgroundColor: themeStyles.cardBg,
                        color: themeStyles.color,
                        border: theme === 'dark' ? '1px solid #495057' : '1px solid #dee2e6',
                        ...cardStyles
                    }}
                >
                    {/* Header */}
                    <Card.Header
                        style={{
                            background: themeStyles.cardHeader,
                            color: '#ffffff',
                            fontFamily: "'Maven Pro', sans-serif",
                            padding: isMobile ? '10px 15px' : '0.5rem 2rem',
                            flexShrink: 0,
                            fontWeight: '100'
                        }}
                    >
                        <Row className="align-items-center g-2">
                            <Col xs={12} lg={6} className="mb-2 mb-lg-0">
                                <h4
                                    className={`mb-0 ${isMobile ? 'fs-6' : ''}`}
                                    style={{
                                        fontFamily: "'Maven Pro', sans-serif",
                                        fontWeight: '100',
                                        color: 'black'
                                    }}
                                >
                                    {formName} - {getCurrentTabConfig()?.label || 'Category'} Management
                                    {getCurrentTabConfig()?.is_tab === 'yes' && getCurrentTabConfig()?.tab_name && (
                                        <span
                                            className="ms-2 badge bg-info text-dark"
                                            style={{ fontSize: '0.8rem' }}
                                        >
                                            {getCurrentTabConfig().tab_name}
                                        </span>
                                    )}
                                </h4>
                                <small style={{ color: '#666', fontSize: '0.8rem' }}>
                                    {rowData.length} records found
                                    {selectedRows.length > 0 && ` | ${selectedRows.length} selected`}
                                </small>
                            </Col>

                            <Col xs={12} lg={6}>
                                <div className="d-flex justify-content-end gap-1 flex-wrap">
                                    {/* Mobile: Show only essential buttons */}
                                    {isMobile ? (
                                        <>
                                            {selectedRows.length === 1 && (
                                                <Button
                                                    variant="warning"
                                                    size="sm"
                                                    onClick={handleEditRow}
                                                    title="Edit Selected"
                                                >
                                                    <i className="bi bi-pencil"></i>
                                                </Button>
                                            )}

                                            {selectedRows.length > 0 && (
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => setShowDeleteModal(true)}
                                                    title="Delete Selected"
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </Button>
                                            )}

                                            <Button
                                                variant="success"
                                                size="sm"
                                                onClick={downloadExcel}
                                                title="Download CSV"
                                            >
                                                <i className="bi bi-download"></i>
                                            </Button>

                                            <Button
                                                variant="outline-light"
                                                size="sm"
                                                onClick={toggleFullScreen}
                                                title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
                                            >
                                                <i className={`bi ${isFullScreen ? 'bi-fullscreen-exit' : 'bi-fullscreen'}`}></i>
                                            </Button>

                                            <Button
                                                variant="outline-light"
                                                size="sm"
                                                onClick={toggleTheme}
                                                title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
                                            >
                                                {theme === 'light' ? '🌙' : '☀️'}
                                            </Button>
                                        </>
                                    ) : (
                                        // Desktop: Show all buttons
                                        <>
                                            {selectedRows.length === 1 && (
                                                <Button
                                                    variant="warning"
                                                    size="sm"
                                                    onClick={handleEditRow}
                                                    title="Edit Selected Row"
                                                >
                                                    <i className="bi bi-pencil"></i> Edit
                                                </Button>
                                            )}

                                            {selectedRows.length > 0 && (
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => setShowDeleteModal(true)}
                                                    title="Delete Selected Rows"
                                                >
                                                    <i className="bi bi-trash"></i> Delete ({selectedRows.length})
                                                </Button>
                                            )}

                                            <ButtonGroup size="sm">
                                                <Button
                                                    variant="success"
                                                    onClick={downloadExcel}
                                                    title="Download CSV"
                                                >
                                                    <i className="bi bi-file-earmark-excel"></i> Export CSV
                                                </Button>
                                            </ButtonGroup>

                                            <ButtonGroup size="sm">
                                                <Button
                                                    variant="outline-light"
                                                    onClick={toggleFullScreen}
                                                    title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
                                                >
                                                    <i className={`bi ${isFullScreen ? 'bi-fullscreen-exit' : 'bi-fullscreen'}`}></i>
                                                    {isFullScreen ? ' Exit' : ' Full'}
                                                </Button>

                                                <Button
                                                    variant="outline-light"
                                                    onClick={toggleTheme}
                                                    title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
                                                >
                                                    {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
                                                </Button>
                                            </ButtonGroup>

                                            <Button
                                                variant="info"
                                                size="sm"
                                                onClick={fetchTabs}
                                                title="Refresh Tabs"
                                            >
                                                <i className="bi bi-arrow-clockwise"></i> Refresh
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </Col>
                        </Row>
                    </Card.Header>

                    {/* Dynamic Tabs Navigation - Based on Field Categories */}
                    {tabConfig.length > 0 && (
                        <div style={{
                            backgroundColor: theme === 'dark' ? '#343a40' : '#f8f9fa',
                            borderBottom: theme === 'dark' ? '1px solid #495057' : '1px solid #dee2e6'
                        }}>
                            <Nav variant="tabs" className="px-3">
                                {tabConfig.map((tab) => (
                                    <Nav.Item key={tab.key}>
                                        <Nav.Link
                                            active={activeTab === tab.key}
                                            onClick={() => handleTabChange(tab.key)}
                                            style={{
                                                color: activeTab === tab.key
                                                    ? (theme === 'dark' ? '#fff' : '#007bff')
                                                    : (theme === 'dark' ? '#adb5bd' : '#6c757d'),
                                                backgroundColor: activeTab === tab.key
                                                    ? (theme === 'dark' ? '#495057' : '#fff')
                                                    : 'transparent',
                                                border: activeTab === tab.key
                                                    ? (theme === 'dark' ? '1px solid #6c757d' : '1px solid #dee2e6')
                                                    : '1px solid transparent',
                                                borderBottom: activeTab === tab.key ? 'none' : undefined,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease-in-out'
                                            }}
                                            className={isMobile ? 'px-2 py-1' : 'px-3 py-2'}
                                        >
                                            <i className={`${tab.icon} me-1`}></i>
                                            {isMobile ? tab.label.substring(0, 8) + (tab.label.length > 8 ? '...' : '') : tab.label}
                                            {tab.isMultiple === 'yes' && (
                                                <span
                                                    className="ms-1 badge rounded-pill bg-info"
                                                    style={{ fontSize: '0.6em' }}
                                                    title="Multiple entries allowed"
                                                >
                                                    M
                                                </span>
                                            )}
                                            {tabData[tab.key] && (
                                                <span
                                                    className="ms-1 badge rounded-pill bg-secondary"
                                                    style={{ fontSize: '0.7em' }}
                                                >
                                                    {tabData[tab.key].rowData.length}
                                                </span>
                                            )}
                                        </Nav.Link>
                                    </Nav.Item>
                                ))}
                            </Nav>
                        </div>
                    )}

                    {/* Grid Body */}
                    <Card.Body
                        style={{
                            backgroundColor: themeStyles.cardBg,
                            color: themeStyles.color,
                            padding: isFullScreen ? '0' : (isMobile ? '10px' : '15px'),
                            flex: 1,
                            overflow: 'hidden'
                        }}
                    >
                        {rowData.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '50px',
                                color: theme === 'dark' ? '#f8f9fa' : '#212529'
                            }}>
                                <i className={`${getCurrentTabConfig()?.icon || 'bi-inbox'}`} style={{ fontSize: '3rem', marginBottom: '20px' }}></i>
                                <h5>No data available for {getCurrentTabConfig()?.label || 'this category'}</h5>
                                <p>
                                    {getCurrentTabConfig()?.fields?.length > 0
                                        ? `This category contains ${getCurrentTabConfig().fields.length} fields: ${getCurrentTabConfig().fields.slice(0, 3).map(f => f.field_name).join(', ')}${getCurrentTabConfig().fields.length > 3 ? '...' : ''}`
                                        : 'No fields configured for this category'
                                    }
                                </p>
                                <Button
                                    variant="outline-primary"
                                    onClick={() => fetchData(activeTab)}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                            Loading...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-arrow-clockwise me-2"></i>
                                            Retry
                                        </>
                                    )}
                                </Button>
                            </div>
                        ) : (
                            <div
                                className="ag-theme-alpine"
                                style={{
                                    height: gridHeight,
                                    width: "100%",
                                    ...(theme === 'dark' && {
                                        '--ag-background-color': '#212529',
                                        '--ag-header-background-color': '#343a40',
                                        '--ag-odd-row-background-color': '#2c3034',
                                        '--ag-even-row-background-color': '#212529',
                                        '--ag-row-hover-color': '#495057',
                                        '--ag-foreground-color': '#f8f9fa',
                                        '--ag-header-foreground-color': '#f8f9fa',
                                        '--ag-border-color': '#495057',
                                        '--ag-secondary-border-color': '#343a40',
                                        '--ag-header-column-separator-color': '#495057',
                                        '--ag-row-border-color': '#343a40',
                                        '--ag-selected-row-background-color': '#28a745',
                                        '--ag-range-selection-background-color': '#28a74533',
                                        '--ag-cell-horizontal-border': '#343a40',
                                        '--ag-header-cell-hover-background-color': '#495057',
                                        '--ag-header-cell-moving-background-color': '#495057',
                                        '--ag-value-change-value-highlight-background-color': '#198754',
                                        '--ag-chip-background-color': '#495057',
                                        '--ag-input-background-color': '#343a40',
                                        '--ag-input-border-color': '#495057',
                                        '--ag-input-focus-border-color': '#28a745',
                                        '--ag-minichart-selected-chart-color': '#28a745',
                                        '--ag-minichart-selected-page-color': '#28a745',
                                        '--ag-pinned-left-border': '2px solid #495057',
                                        '--ag-pinned-right-border': '2px solid #495057'
                                    }),
                                    ...(theme === 'light' && {
                                        '--ag-selected-row-background-color': '#28a745',
                                        '--ag-range-selection-background-color': '#28a74533',
                                        '--ag-input-focus-border-color': '#28a745',
                                        '--ag-minichart-selected-chart-color': '#28a745',
                                        '--ag-minichart-selected-page-color': '#28a745',
                                        '--ag-checkbox-checked-color': '#28a745',
                                        '--ag-accent-color': '#28a745'
                                    })
                                }}
                            >
                                <AgGridReact
                                    ref={gridRef}
                                    rowData={rowData}
                                    columnDefs={columnDefs}
                                    defaultColDef={defaultColDef}
                                    pagination={true}
                                    paginationPageSize={isMobile ? 10 : (isFullScreen ? 20 : 10)}
                                    rowSelection="multiple"
                                    onSelectionChanged={onSelectionChanged}
                                    suppressMovableColumns={isMobile}
                                    enableRangeSelection={!isMobile}
                                    enableCharts={!isMobile}
                                    enableAdvancedFilter={!isMobile}
                                    rowMultiSelectWithClick={true}
                                    suppressRowClickSelection={false}
                                    animateRows={!isMobile}
                                    enableCellTextSelection={true}
                                    suppressHorizontalScroll={false}
                                    suppressColumnVirtualisation={isMobile}
                                    rowBuffer={isMobile ? 5 : 10}
                                    headerHeight={isMobile ? 40 : 48}
                                    rowHeight={isMobile ? 35 : 42}
                                    suppressMenuHide={isMobile}
                                    suppressContextMenu={isMobile}
                                    onGridReady={(params) => {
                                        console.log('Grid is ready for tab:', activeTab);
                                    }}
                                />
                            </div>
                        )}
                    </Card.Body>
                </Card>

                {/* Delete Confirmation Modal */}
                <Modal
                    show={showDeleteModal}
                    onHide={() => setShowDeleteModal(false)}
                    centered
                    backdrop="static"
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Confirm Delete</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Are you sure you want to delete {selectedRows.length} selected row(s) from {getCurrentTabConfig()?.label}?</p>
                        <p className="text-danger">This action cannot be undone.</p>
                        {selectedRows.length > 0 && (
                            <div className="mt-3">
                                <small className="text-muted">
                                    <strong>Selected rows:</strong>
                                    {selectedRows.slice(0, 3).map((row, index) => (
                                        <div key={index}>
                                            {getCurrentTabConfig()?.fields?.[0]?.field_name && row[getCurrentTabConfig().fields[0].field_name] ?
                                                `• ${row[getCurrentTabConfig().fields[0].field_name]}` :
                                                `• Row ID: ${row.id}`
                                            }
                                        </div>
                                    ))}
                                    {selectedRows.length > 3 && (
                                        <div>... and {selectedRows.length - 3} more</div>
                                    )}
                                </small>
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant="secondary"
                            onClick={() => setShowDeleteModal(false)}
                            disabled={deleteLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleDeleteRows}
                            disabled={deleteLoading}
                        >
                            {deleteLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Deleting...
                                </>
                            ) : (
                                <>Delete {selectedRows.length} Row(s)</>
                            )}
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* Toast Container for notifications */}
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme={theme === 'dark' ? 'dark' : 'light'}
                />
            </Container>
        </div>
    );
};

export default GridExample;