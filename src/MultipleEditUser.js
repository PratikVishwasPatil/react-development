import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Form, Button, Row, Col, Card, Spinner, Alert, Accordion, Navbar, Nav, NavDropdown, Badge } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useLocation, useParams } from 'react-router-dom';
function evaluateFormula(formula, formData, categoryEntries) {
    try {
        // Handle SUMIF syntax: SUMIF(column, value, sumColumn)
        if (/SUMIF\(/i.test(formula)) {
            return formula.replace(/SUMIF\s*\(\s*([\w_]+)\s*,\s*'([^']+)'\s*,\s*([\w_]+)\s*\)/gi,
                (match, filterField, filterValue, sumField) => {
                    let total = 0;

                    // Convert formData into array of entries for processing
                    // Group form data by entry indices
                    const entriesByIndex = {};

                    Object.keys(formData).forEach(key => {
                        const match = key.match(/^(.+)_(\d+)$/);
                        if (match) {
                            const [, fieldName, index] = match;
                            if (!entriesByIndex[index]) {
                                entriesByIndex[index] = {};
                            }
                            entriesByIndex[index][fieldName] = formData[key];
                        } else {
                            // Handle fields without index (index 0)
                            if (!entriesByIndex['0']) {
                                entriesByIndex['0'] = {};
                            }
                            entriesByIndex['0'][key] = formData[key];
                        }
                    });

                    // Convert to array of entries
                    const entries = Object.values(entriesByIndex);

                    console.log('Processing SUMIF formula:', formula);
                    console.log('Filter field:', filterField);
                    console.log('Filter value:', filterValue);
                    console.log('Sum field:', sumField);
                    console.log('Entries to process:', entries);

                    // Process each entry
                    entries.forEach(entry => {
                        console.log('Checking entry:', entry);
                        console.log(`Entry[${filterField}]:`, entry[filterField]);
                        console.log(`Entry[${sumField}]:`, entry[sumField]);

                        if (entry[filterField] === filterValue) {
                            const value = Number(entry[sumField] || 0);
                            total += value;
                            console.log(`Added ${value} to total. New total: ${total}`);
                        }
                    });

                    console.log('Final SUMIF total:', total);
                    return total;
                }
            );
        }

        // Default eval for normal formulas
        const fn = new Function(...Object.keys(formData), `return ${formula};`);
        return fn(...Object.values(formData));

    } catch (err) {
        console.error("Error evaluating formula:", err, "Formula:", formula);
        return null;
    }
}

function DynamicForm() {

    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [theme, setTheme] = useState('light');
    const [activeKey, setActiveKey] = useState('0');
    const [passwordVisibility, setPasswordVisibility] = useState({});
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});

    // Add categoryEntries state for multiple entries support
    const [categoryEntries, setCategoryEntries] = useState({});
    const [dynamicOptions, setDynamicOptions] = useState({});
    const [formTouched, setFormTouched] = useState(false);
    const [validationTimeout, setValidationTimeout] = useState(null);

    const location = useLocation();
    const params = useParams();

    // Updated useEffect for dynamic route detection
    useEffect(() => {
        const path = location.pathname;

        // Check for different edit routes
        if (path.includes('/add-user/')) {
            const id = path.split('/add-user/')[1];
            setIsEditMode(true);
            setEditId(id);
        } else if (path.includes('/add-company/')) {
            const id = path.split('/add-company/')[1];
            setIsEditMode(true);
            setEditId(id);
        } else if (path.includes('/allowance-master/')) {
            const id = path.split('/allowance-master/')[1];
            setIsEditMode(true);
            setEditId(id);
        } else if (path.includes('/add-student/')) {
            const id = path.split('/add-student/')[1];
            setIsEditMode(true);
            setEditId(id);
        } else if (path.includes('/edit-record/')) {
            const id = path.split('/edit-record/')[1];
            setIsEditMode(true);
            setEditId(id);
        }  else if (path.includes('/nc-list/')) {
            const id = path.split('/nc-list/')[1];
            setIsEditMode(true);
            setEditId(id);
        }else {
            setIsEditMode(false);
            setEditId(null);
        }
    }, [location]);

    // Updated formattedTitle logic
    const getFormDetails = () => {
        const path = location.pathname;

        // Extract form type and determine appropriate titles
        if (path.includes('/add-user')) {
            return { formattedTitle: 'Add User', displayTitle: 'Add User' };
        } else if (path.includes('/add-company')) {
            return { formattedTitle: 'Add Company', displayTitle: 'Add Company' };
        } else if (path.includes('/allowance-master')) {
            return { formattedTitle: 'Allowance Master', displayTitle: 'Allowance Master' };
        } else if (path.includes('/add-student')) {
            return { formattedTitle: 'Add Student', displayTitle: 'Add Student' };
        } else if (path.includes('/edit-record')) {
            return { formattedTitle: 'Vendor', displayTitle: 'Edit record' };
        }  else if (path.includes('/nc-list')) {
            return { formattedTitle: 'Add Nc', displayTitle: 'nc list' };
        } else {
            // Fallback for other routes
            const pathSegment = path.split('/').pop();
            const title = pathSegment
                ? pathSegment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                : 'Dynamic Form';
            return { formattedTitle: title, displayTitle: title };
        }
    };

    const { formattedTitle, displayTitle } = getFormDetails();

    // Updated fetchEditData to handle the exact structure you provided
    const fetchEditData = async (id, defaultFormData, formName) => {
        try {
            const requestData = {
                type: "SelectwithWhereConditionWithColumnName",
                table: "submitted_forms",
                form_name: formName,
                whereCondition: [
                    {
                        id: id
                    }
                ]
            };

            const response = await axios.post('http://93.127.167.54/Surya_React/surya_dynamic_api/selectData.php', requestData);

            if (response.data && response.data.status === 'success' && response.data.data && response.data.data.length > 0) {
                const existingData = response.data.data[0];

                let parsedFormData = {};
                let newCategoryEntries = {};

                // Check if data has form_data structure
                const sourceData = existingData.form_data ? JSON.parse(existingData.form_data) : existingData;

                if (sourceData.categories) {
                    // Handle nested structure with categories
                    Object.keys(sourceData.categories).forEach(categoryKey => {
                        const categoryData = sourceData.categories[categoryKey];

                        // Find all entry_X keys to determine how many entries exist
                        const entryKeys = Object.keys(categoryData).filter(key => key.startsWith('entry_'));

                        if (entryKeys.length > 0) {
                            // Multiple entries exist
                            const entryIndices = [];

                            entryKeys.forEach((entryKey, index) => {
                                const entryData = categoryData[entryKey];
                                const entryIndex = index; // Use sequential index
                                entryIndices.push(entryIndex);

                                // Map each field with the entry index
                                Object.keys(entryData).forEach(fieldName => {
                                    const fieldKey = `${fieldName}_${entryIndex}`;
                                    parsedFormData[fieldKey] = entryData[fieldName];
                                });
                            });

                            // Store the entry indices for this category
                            newCategoryEntries[categoryKey] = entryIndices;
                        } else {
                            // Single entry without entry_ prefix (backward compatibility)
                            newCategoryEntries[categoryKey] = [0];

                            // Map direct category data to _0 suffix
                            Object.keys(categoryData).forEach(fieldName => {
                                if (!fieldName.startsWith('entry_')) {
                                    const fieldKey = `${fieldName}_0`;
                                    parsedFormData[fieldKey] = categoryData[fieldName];
                                }
                            });
                        }
                    });
                } else {
                    // Handle flat structure (existing logic)
                    parsedFormData = { ...sourceData };

                    // Remove non-form fields dynamically
                    const nonFormFields = ['form_name', 'id', 'created_at', 'updated_at', 'submission_timestamp', 'total_entries'];
                    nonFormFields.forEach(field => {
                        delete parsedFormData[field];
                    });

                    // Initialize category entries for flat structure
                    categories.forEach(category => {
                        newCategoryEntries[category.category_key] = [0];
                    });
                }

                // Get all form field names from categories to create dynamic mapping
                const formFieldNames = new Set();
                categories.forEach(category => {
                    category.fields.forEach(field => {
                        formFieldNames.add(field.field_name);
                    });
                });

                // Create dynamic mapping based on actual form fields
                const mappedFormData = {};

                // First, add all existing data as-is
                Object.keys(parsedFormData).forEach(key => {
                    mappedFormData[key] = parsedFormData[key];
                });

                // Then, try to match fields by converting spaces to different formats
                formFieldNames.forEach(formFieldName => {
                    Object.keys(newCategoryEntries).forEach(categoryKey => {
                        const entryIndices = newCategoryEntries[categoryKey] || [0];

                        entryIndices.forEach(entryIndex => {
                            const fieldKey = `${formFieldName}_${entryIndex}`;

                            if (!(fieldKey in mappedFormData)) {
                                // Try different key variations
                                const variations = [
                                    formFieldName,
                                    formFieldName.replace(/([A-Z])/g, ' $1').toLowerCase().trim(),
                                    formFieldName.replace(/\s+(.)/g, (match, letter) => letter.toUpperCase()),
                                    formFieldName.toLowerCase(),
                                    formFieldName.replace(/\s+/g, ''),
                                    formFieldName.replace(/\s+/g, '_')
                                ];

                                for (const variation of variations) {
                                    const variationKey = `${variation}_${entryIndex}`;
                                    if (parsedFormData[variationKey] !== undefined) {
                                        mappedFormData[fieldKey] = parsedFormData[variationKey];
                                        break;
                                    }
                                    // Also check without index suffix
                                    if (parsedFormData[variation] !== undefined) {
                                        mappedFormData[fieldKey] = parsedFormData[variation];
                                        break;
                                    }
                                }
                            }
                        });
                    });
                });

                // Merge with default form data to ensure all fields are present
                const mergedFormData = { ...defaultFormData, ...mappedFormData };

                // Handle array fields and special conversions dynamically
                Object.keys(mergedFormData).forEach(key => {
                    const value = mergedFormData[key];

                    // Find the field configuration to determine its type
                    let fieldConfig = null;
                    categories.forEach(category => {
                        const baseFieldName = key.replace(/_\d+$/, '');
                        const field = category.fields.find(f => f.field_name === baseFieldName);
                        if (field) {
                            fieldConfig = field;
                        }
                    });

                    if (typeof value === 'string' && value.trim() !== '') {
                        // Handle array fields based on field type
                        if (fieldConfig && (fieldConfig.field_type === 'multiselect' || fieldConfig.field_type === 'checkbox')) {
                            try {
                                const parsed = JSON.parse(value);
                                if (Array.isArray(parsed)) {
                                    mergedFormData[key] = parsed;
                                } else {
                                    mergedFormData[key] = value.split(',').map(item => item.trim()).filter(item => item !== '');
                                }
                            } catch (e) {
                                mergedFormData[key] = value.split(',').map(item => item.trim()).filter(item => item !== '');
                            }
                        } else {
                            // Handle boolean-like strings
                            if (value.toLowerCase() === 'yes') {
                                mergedFormData[key] = true;
                            } else if (value.toLowerCase() === 'no') {
                                mergedFormData[key] = false;
                            }
                        }
                    } else if (value === null || value === undefined) {
                        if (fieldConfig) {
                            if (fieldConfig.field_type === 'multiselect' || fieldConfig.field_type === 'checkbox') {
                                mergedFormData[key] = [];
                            } else {
                                mergedFormData[key] = '';
                            }
                        }
                    }
                });

                console.log('Merged Form Data:', mergedFormData);
                console.log('Category Entries:', newCategoryEntries);

                setFormData(mergedFormData);
                setCategoryEntries(newCategoryEntries);
                toast.success(`${formName} data loaded successfully`);

            } else {
                console.log('API Response:', response.data);
                toast.error(`No ${formName} data found`);
            }
        } catch (error) {
            console.error("Error fetching edit data:", error);
            console.error("Response:", error.response?.data);
            toast.error(`Error loading ${formName} data`);
        } finally {
            setLoading(false);
        }
    };

    // Add new entry for a category (only if is_multiple is "yes")
    const addCategoryEntry = (categoryKey) => {
        const category = categories.find(cat => cat.category_key === categoryKey);
        if (!category || category.is_multiple !== 'yes') {
            return; // Don't allow adding if not multiple
        }

        setCategoryEntries(prev => {
            const currentEntries = prev[categoryKey] || [0];
            const newIndex = Math.max(...currentEntries) + 1;
            const newEntries = [...currentEntries, newIndex];

            // Initialize form data for new entry
            if (category.fields && Array.isArray(category.fields)) {
                setFormData(prevFormData => {
                    const newFormData = { ...prevFormData };
                    category.fields.forEach(field => {
                        newFormData[`${field.field_name}_${newIndex}`] = field.field_type === 'checkbox' || field.field_type === 'multiselect'
                            ? []
                            : '';
                    });
                    return newFormData;
                });
            }

            return {
                ...prev,
                [categoryKey]: newEntries
            };
        });
    };

    // Remove entry for a category (only if is_multiple is "yes")
    const removeCategoryEntry = (categoryKey, entryIndex) => {
        const category = categories.find(cat => cat.category_key === categoryKey);
        if (!category || category.is_multiple !== 'yes') {
            return; // Don't allow removing if not multiple
        }

        setCategoryEntries(prev => {
            const currentEntries = prev[categoryKey] || [0];
            if (currentEntries.length <= 1) return prev; // Don't allow removing the last entry

            const newEntries = currentEntries.filter(index => index !== entryIndex);

            // Remove form data for this entry
            if (category.fields && Array.isArray(category.fields)) {
                setFormData(prevFormData => {
                    const newFormData = { ...prevFormData };
                    category.fields.forEach(field => {
                        delete newFormData[`${field.field_name}_${entryIndex}`];
                    });
                    return newFormData;
                });
            }

            return {
                ...prev,
                [categoryKey]: newEntries
            };
        });
    };

    // Main useEffect with updated form name logic
    useEffect(() => {
        const linkElement = document.createElement('link');
        linkElement.rel = 'stylesheet';
        linkElement.href = 'https://fonts.googleapis.com/css2?family=Maven+Pro:wght@400;500;700&display=swap';
        document.head.appendChild(linkElement);

        document.body.style.fontFamily = "'Maven Pro', sans-serif";

        setLoading(true);

        // Use the dynamically determined form name
        const formName = formattedTitle;

        const submissionData = {
            form_name: formName
        };

        axios.post('http://93.127.167.54/Surya_React/surya_dynamic_api/get_fields.php', submissionData)
            .then((res) => {
                const fetchedCategories = res.data;

                fetchedCategories.sort((a, b) => a.sequence - b.sequence);

                fetchedCategories.forEach(category => {
                    category.fields.forEach(field => {
                        field.field_label = field.field_label || formatFieldName(field.field_name);
                        field.field_type = field.field_type;
                        if (field.options && typeof field.options === 'string' && field.options.trim() !== '') {
                            field.options = field.options.split(',').map(opt => opt.trim());
                        } else {
                            field.options = Array.isArray(field.options) ? field.options : [];
                        }

                        field.help_text = field.help_text || '';
                        field.readonly = field.readonly || false;
                    });
                    category.fields.sort((a, b) => a.field_sequence - b.field_sequence);
                });

                setCategories(fetchedCategories);

                // Initialize form with default values using _0 suffix for all fields
                const defaultForm = {};
                const defaultCategoryEntries = {};

                fetchedCategories.forEach(category => {
                    defaultCategoryEntries[category.category_key] = [0]; // Initialize with single entry

                    if (category.fields && Array.isArray(category.fields)) {
                        category.fields.forEach(field => {
                            defaultForm[`${field.field_name}_0`] = field.field_type === 'checkbox' || field.field_type === 'multiselect' ? [] : '';
                        });
                    }
                });

                setFormData(defaultForm);
                setCategoryEntries(defaultCategoryEntries);

                // If in edit mode, fetch existing data
                if (isEditMode && editId) {
                    fetchEditData(editId, defaultForm, formName);
                } else {
                    setLoading(false);
                }
            })
            .catch((err) => {
                console.error("Error fetching fields:", err);
                setLoading(false);
            });

        // Fetch countries
        axios.get('http://localhost:5000/api/countries')
            .then(response => {
                setCountries(response.data);
            })
            .catch(err => {
                console.error("Error fetching countries:", err);
            });
    }, [isEditMode, editId, formattedTitle]);

    // Other useEffects for states and cities remain the same...
    useEffect(() => {
        setLoading(true);
        axios.get(`http://localhost/surya_apis/api/get_statelist.php`)
            .then(response => {
                setStates(response.data.data);
            })
            .catch(err => {
                console.error("Error fetching states:", err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        const stateId = formData.state;

        if (stateId) {
            setLoading(true);

            const formDataForPost = new FormData();
            formDataForPost.append('state', stateId);

            axios.post(`http://localhost/surya_apis/api/get_citylist.php`, formDataForPost)
                .then(response => {
                    if (response.data && response.data.data && Array.isArray(response.data.data)) {
                        setCities(response.data.data);
                    } else {
                        setCities([]);
                    }
                })
                .catch(err => {
                    console.error("Error fetching cities:", err);
                    setCities([]);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setCities([]);
        }
    }, [formData.state]);

    const formatFieldName = (fieldName) => {
        return fieldName
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    // const handleChange = (e, entryIndex = 0) => {
    //     const { name, value, type, checked } = e.target;

    //     let newFormData = { ...formData };

    //     if (type === 'checkbox') {
    //         const current = newFormData[name] || [];
    //         newFormData[name] = checked
    //             ? [...current, value]
    //             : current.filter(item => item !== value);
    //     } else {
    //         newFormData[name] = value;
    //     }

    //     setFormData(newFormData);
    // };

    const handleChange = (e, change_rule_id, entryIndex = 0) => {
        let name, value, type, checked;
        if (e?.target) {
            // Standard input
            ({ name, value, type, checked } = e.target);
        } else {
            // Custom input (like react-select)
            name = e.name;
            value = e.value;
            type = 'custom';
        }
        let newFormData = { ...formData };

        if (type === 'checkbox') {
            const current = newFormData[name] || [];
            newFormData[name] = checked
                ? [...current, value]
                : current.filter(item => item !== value);
        } else {
            newFormData[name] = value;
        }

        console.log("change_rule_id", change_rule_id);
        if (change_rule_id && parseInt(change_rule_id) > 0) {
            const submissionData = {
                rule_id: change_rule_id,
                value: value
            };
            axios.post('http://93.127.167.54/Surya_React/surya_dynamic_api/exceute_rule.php', submissionData)
                .then((res) => {
                    const allRuleResults = res.data;
                    console.log("Execute rule response:", allRuleResults);

                    if (Array.isArray(allRuleResults)) {
                        // STEP 1: Prepare sanitized variables from form data
                        const variables = {};
                        const varNameToOriginalKey = {};

                        Object.keys(newFormData).forEach(key => {
                            const sanitized = key.trim().replace(/\s+/g, '_');
                            variables[sanitized] = parseFloat(newFormData[key]) || 0;
                            varNameToOriginalKey[sanitized] = key;
                        });

                        // STEP 2: Loop over rule results and apply formula logic
                        allRuleResults.forEach(ruleResult => {
                            const { to_set, data: values, formulla, triggerFields, function_name, paramater } = ruleResult;

                            if (formulla) {
                                // Use the new evaluateFormula function with index support
                                // const formulaResult = evaluateFormula(formulla, newFormData, name);
                                const formulaResult = evaluateFormula(formulla, newFormData, categoryEntries);
                                console.log("formulaResult", formulaResult);

                                if (formulaResult) {
                                    let { key: resultKey, value: resultValue } = formulaResult;
                                    console.log(`Formula result: ${resultKey} = ${resultValue}`);
                                    console.log("Available form data keys:", Object.keys(newFormData));

                                    // Check if the target key exists in form data (exact match first)
                                    let matchedKey = null;

                                    // Strategy 1: Exact match
                                    if (newFormData.hasOwnProperty(resultKey)) {
                                        matchedKey = resultKey;
                                        console.log(`✓ Exact match found: ${matchedKey}`);
                                    }

                                    // Strategy 2: Case-insensitive exact match
                                    if (!matchedKey) {
                                        Object.keys(newFormData).forEach(key => {
                                            if (key.toLowerCase() === resultKey.toLowerCase()) {
                                                matchedKey = key;
                                                console.log(`✓ Case-insensitive exact match found: ${matchedKey}`);
                                            }
                                        });
                                    }

                                    // Strategy 3: Sanitized comparison (spaces vs underscores)
                                    if (!matchedKey) {
                                        const resultKeySanitized = resultKey.replace(/\s+/g, '_').toLowerCase();
                                        matchedKey = Object.keys(newFormData).find(k => {
                                            const kSanitized = k.trim().replace(/\s+/g, '_').toLowerCase();
                                            const match = kSanitized === resultKeySanitized;
                                            if (match) {
                                                console.log(`✓ Sanitized match found: ${k} matches ${resultKey}`);
                                            }
                                            return match;
                                        });
                                    }

                                    // Strategy 4: Partial match (base name + index)
                                    if (!matchedKey) {
                                        const resultBase = resultKey.replace(/_\d+$/, '').replace(/\s+/g, '_').toLowerCase();
                                        const resultIndexMatch = resultKey.match(/_(\d+)$/);
                                        const resultIndex = resultIndexMatch ? resultIndexMatch[0] : '';

                                        console.log(`Looking for base: "${resultBase}" with index: "${resultIndex}"`);

                                        Object.keys(newFormData).forEach(key => {
                                            const keyBase = key.replace(/_\d+$/, '').replace(/\s+/g, '_').toLowerCase();
                                            const keyIndexMatch = key.match(/_(\d+)$/);
                                            const keyIndex = keyIndexMatch ? keyIndexMatch[0] : '';

                                            if (keyBase === resultBase && keyIndex === resultIndex) {
                                                matchedKey = key;
                                                console.log(`✓ Base + index match found: ${key}`);
                                            }
                                        });
                                    }

                                    console.log(`Final matched key: ${matchedKey}`);
                                    console.log(`Value to set: ${resultValue}`);
                                    console.log(`Before update - field value:`, newFormData[matchedKey]);

                                    if (matchedKey) {
                                        newFormData[matchedKey] = resultValue;
                                        console.log(`✓ Updated existing field: ${matchedKey} = ${resultValue}`);
                                        console.log(`After update - field value:`, newFormData[matchedKey]);
                                    } else {
                                        newFormData[resultKey] = resultValue;
                                        console.log(`✓ Created new field: ${resultKey} = ${resultValue}`);
                                    }

                                    // Force a state update to ensure the UI reflects the change
                                    console.log("Forcing form data update...");

                                    // Handle accordion showing logic
                                    if (resultKey.toLowerCase().includes('accordion_to_show')) {
                                        const accordionToShow = `${resultValue}`;
                                        setCategoryEntries(prev => ({
                                            ...prev,
                                            [accordionToShow]: prev[accordionToShow] || [0]
                                        }));
                                        setActiveKey(accordionToShow);
                                    }
                                }
                            } else if (function_name) {

                                if (function_name && typeof window[function_name] === 'function') {
                                    const paramList = paramater.split(',');
                                    window[function_name](...paramList);
                                } else {
                                    console.warn(`${function_name} is not defined on window`);
                                }
                            }
                            else if (Array.isArray(values)) {
                                // ... rest of your existing logic for dropdown options
                                const uniqueOptions = [...new Set(values)];
                                const cleanedToSet = to_set.trim().replace(/\s+/g, '_');
                                setDynamicOptions(prev => ({
                                    ...prev,
                                    [cleanedToSet]: uniqueOptions
                                }));

                                if (uniqueOptions.length === 1) {
                                    const fieldKey = cleanedToSet;
                                    const originalKey = varNameToOriginalKey[fieldKey];
                                    if (originalKey) {
                                        newFormData[originalKey] = uniqueOptions[0];
                                    }
                                }
                            }
                        });
                    }
                    else {
                        console.error('Expected array but got:', typeof allRuleResults, allRuleResults);
                    }
                })
                .catch(err => {
                    console.error("Error executing rule:", err);
                });
        }
        //console.log("Updated formData:", newFormData)
        setFormData(newFormData);
        setFormTouched(true);

        // Clear previous timeout
        if (validationTimeout) {
            clearTimeout(validationTimeout);
        }

        // Set new timeout for validation
        // const newTimeout = setTimeout(() => {
        //     validateWithAI(newFormData);
        // }, 500);

        // setValidationTimeout(newTimeout);
    };

    const handleReset = () => {
        const resetForm = {};
        const resetEntries = {};

        categories.forEach(category => {
            resetEntries[category.category_key] = [0]; // Reset to single entry
            if (category.fields && Array.isArray(category.fields)) {
                category.fields.forEach(field => {
                    resetForm[`${field.field_name}_0`] = field.field_type === 'checkbox' || field.field_type === 'multiselect' ? [] : '';
                });
            }
        });

        setFormData(resetForm);
        setCategoryEntries(resetEntries);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Group data by categories and entries for both insert and update
        const groupedData = {};

        // Process form data to group by categories
        categories.forEach(category => {
            const categoryKey = category.category_key;
            const entries = categoryEntries[categoryKey] || [0];

            groupedData[categoryKey] = {};

            entries.forEach((entryIndex, idx) => {
                const entryData = {};

                category.fields.forEach(field => {
                    const fieldKey = `${field.field_name}_${entryIndex}`;
                    if (formData.hasOwnProperty(fieldKey)) {
                        entryData[field.field_name] = formData[fieldKey];
                    }
                });

                // Store each entry with a numbered key
                groupedData[categoryKey][`entry_${idx + 1}`] = entryData;
            });

            // If only one entry, also store without entry number for backward compatibility
            if (entries.length === 1) {
                Object.keys(groupedData[categoryKey]['entry_1']).forEach(fieldName => {
                    groupedData[categoryKey][fieldName] = groupedData[categoryKey]['entry_1'][fieldName];
                });
            }
        });

        // Create the form data payload
        const formDataPayload = {
            form_name: formattedTitle,
            categories: groupedData,
            submission_timestamp: new Date().toISOString(),
            total_entries: Object.keys(categoryEntries).reduce((total, key) => {
                return total + (categoryEntries[key] || [0]).length;
            }, 0)
        };

        let submissionData;
        let apiUrl;

        if (isEditMode && editId) {
            // Update existing record using the new update_form_data method
            submissionData = {
                type: "update_form_data",
                table: "submitted_forms",
                form_name: formattedTitle,
                update_values: [
                    {
                        form_data: formDataPayload
                    }
                ],
                where_values: [
                    {
                        id: editId
                    }
                ]
            };
            apiUrl = 'http://93.127.167.54/Surya_React/surya_dynamic_api/UpdateDataMultiple.php';
        } else {
            // Insert new record
            submissionData = {
                type: "insert",
                table: "submitted_forms",
                form_name: formattedTitle,
                insert_array: [
                    {
                        form_data: formDataPayload
                    }
                ]
            };
            apiUrl = 'http://93.127.167.54/Surya_React/surya_dynamic_api/insertData.php';
        }

        console.log('Submission Data:', JSON.stringify(submissionData, null, 2));

        try {
            const response = await axios.post(apiUrl, submissionData);
            console.log('API Response:', response.data);

            const message = isEditMode ? `${formattedTitle} updated successfully` : 'Form submitted successfully';
            toast.success(message);

            if (!isEditMode) {
                handleReset();
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            console.error('Response:', error.response?.data);
            const errorMessage = isEditMode ? `Error updating ${formattedTitle}` : 'Error submitting form';
            toast.error(errorMessage);
        }
    };

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    // const renderField = (field, entryIndex = 0) => {
    //     const fieldKey = `${field.field_name}_${entryIndex}`;
    //     const darkModeClasses = theme === 'dark' ? 'bg-dark text-light border-secondary' : '';
    //     const hasError = validationErrors[fieldKey];
    //     const isInvalid = formTouched && hasError;


    //     const getInvalidFeedbackDiv = () =>
    //         isInvalid && (
    //             <div className="invalid-feedback d-block">
    //                 {validationErrors[fieldKey]}
    //             </div>
    //         );

    //     return (
    //         <Form.Group className="mb-3 position-relative" key={fieldKey}>
    //             <Form.Label className={`fw-bold ${theme === 'dark' ? 'text-light' : ''}`}>
    //                 {field.field_label}
    //             </Form.Label>

    //             {field.field_type === 'select' && (
    //                 <>
    //                     <Select
    //                         name={fieldKey}
    //                         isSearchable={true}
    //                         isClearable={true}
    //                         isDisabled={field.readonly}
    //                         value={formData[fieldKey] ? { value: formData[fieldKey], label: formData[fieldKey] } : null}
    //                         onChange={(selectedOption) => {
    //                             const value = selectedOption ? selectedOption.value : '';
    //                             const event = {
    //                                 name: fieldKey,
    //                                 value: value
    //                             };
    //                             handleChange(event, field.change_rule_id);
    //                         }}
    //                         options={(() => {
    //                             // Static options from field.options
    //                             const staticOptions = field.options?.map(opt => ({ value: opt, label: opt })) || [];

    //                             // Dynamic options from API calls - try different field name variations
    //                             const possibleDynamicKeys = [
    //                                 fieldKey,
    //                                 fieldKey.replace(/ /g, '_'),
    //                                 fieldKey.replace(/_/g, ' '),
    //                                 field.field_name + '_0',
    //                                 field.field_name.replace(/_/g, ' ') + '_0'
    //                             ];

    //                             let dynamicOptionsArray = [];
    //                             for (const key of possibleDynamicKeys) {
    //                                 if (dynamicOptions[key] && Array.isArray(dynamicOptions[key])) {
    //                                     dynamicOptionsArray = dynamicOptions[key].map(opt => ({ value: opt, label: opt }));
    //                                     //console.log('Found dynamic options for key:', key, dynamicOptionsArray);
    //                                     break;
    //                                 }
    //                             }

    //                             const allOptions = [...staticOptions, ...dynamicOptionsArray];


    //                             return allOptions;
    //                         })()}
    //                         className={`react-select-container ${isInvalid ? 'is-invalid' : ''}`}
    //                         classNamePrefix="react-select"
    //                         placeholder={`Search and select ${field.field_label}...`}
    //                         noOptionsMessage={() => "No options found"}
    //                         styles={{
    //                             control: (base, state) => ({
    //                                 ...base,
    //                                 backgroundColor: theme === 'dark' ? '#343a40' : '#fff',
    //                                 color: theme === 'dark' ? '#fff' : '#000',
    //                                 borderColor: isInvalid ? '#dc3545' : (state.isFocused ? (theme === 'dark' ? '#6ea8fe' : '#0d6efd') : base.borderColor),
    //                                 boxShadow: state.isFocused ? `0 0 0 0.2rem ${theme === 'dark' ? 'rgba(110, 168, 254, 0.25)' : 'rgba(13, 110, 253, 0.25)'}` : 'none',
    //                                 '&:hover': {
    //                                     borderColor: isInvalid ? '#dc3545' : (theme === 'dark' ? '#6ea8fe' : '#0d6efd')
    //                                 }
    //                             }),
    //                             menu: (base) => ({
    //                                 ...base,
    //                                 backgroundColor: theme === 'dark' ? '#343a40' : '#fff',
    //                                 border: `1px solid ${theme === 'dark' ? '#495057' : '#dee2e6'}`,
    //                                 zIndex: 9999
    //                             }),
    //                             option: (base, state) => ({
    //                                 ...base,
    //                                 backgroundColor: state.isFocused
    //                                     ? (theme === 'dark' ? '#495057' : '#e7f1ff')
    //                                     : state.isSelected
    //                                         ? (theme === 'dark' ? '#0d6efd' : '#0d6efd')
    //                                         : 'transparent',
    //                                 color: state.isSelected
    //                                     ? '#fff'
    //                                     : (theme === 'dark' ? '#fff' : '#000'),
    //                                 '&:hover': {
    //                                     backgroundColor: theme === 'dark' ? '#495057' : '#e7f1ff',
    //                                     color: theme === 'dark' ? '#fff' : '#000'
    //                                 }
    //                             }),
    //                             singleValue: (base) => ({
    //                                 ...base,
    //                                 color: theme === 'dark' ? '#fff' : '#000'
    //                             }),
    //                             placeholder: (base) => ({
    //                                 ...base,
    //                                 color: theme === 'dark' ? '#adb5bd' : '#6c757d'
    //                             }),
    //                             input: (base) => ({
    //                                 ...base,
    //                                 color: theme === 'dark' ? '#fff' : '#000'
    //                             }),
    //                             indicatorSeparator: (base) => ({
    //                                 ...base,
    //                                 backgroundColor: theme === 'dark' ? '#495057' : '#dee2e6'
    //                             }),
    //                             dropdownIndicator: (base) => ({
    //                                 ...base,
    //                                 color: theme === 'dark' ? '#adb5bd' : '#6c757d',
    //                                 '&:hover': {
    //                                     color: theme === 'dark' ? '#fff' : '#000'
    //                                 }
    //                             }),
    //                             clearIndicator: (base) => ({
    //                                 ...base,
    //                                 color: theme === 'dark' ? '#adb5bd' : '#6c757d',
    //                                 '&:hover': {
    //                                     color: theme === 'dark' ? '#fff' : '#000'
    //                                 }
    //                             })
    //                         }}
    //                     />
    //                     {getInvalidFeedbackDiv()}
    //                 </>
    //             )}

    //             {field.field_type === 'multiselect' && (
    //                 <Select
    //                     isMulti
    //                     isSearchable
    //                     name={fieldKey}
    //                     isDisabled={field.readonly}
    //                     options={field.options?.map(opt => ({ value: opt, label: opt })) || []}
    //                     value={(formData[fieldKey] || []).map(val => ({ value: val, label: val }))}
    //                     onChange={(selectedOptions) => {
    //                         const values = selectedOptions ? selectedOptions.map(option => option.value) : [];
    //                         setFormData(prev => ({
    //                             ...prev,
    //                             [fieldKey]: values
    //                         }));
    //                     }}
    //                     className="react-select-container mb-2"
    //                     classNamePrefix="react-select"
    //                     placeholder={`Select ${field.field_label}`}
    //                     styles={{
    //                         control: (base) => ({
    //                             ...base,
    //                             backgroundColor: theme === 'dark' ? '#343a40' : '#fff',
    //                             color: theme === 'dark' ? '#fff' : '#000',
    //                         }),
    //                         menu: (base) => ({
    //                             ...base,
    //                             backgroundColor: theme === 'dark' ? '#343a40' : '#fff',
    //                         }),
    //                         multiValue: (base) => ({
    //                             ...base,
    //                             backgroundColor: theme === 'dark' ? '#495057' : '#dee2e6',
    //                         }),
    //                         multiValueLabel: (base) => ({
    //                             ...base,
    //                             color: theme === 'dark' ? '#fff' : '#000',
    //                         }),
    //                         multiValueRemove: (base) => ({
    //                             ...base,
    //                             color: theme === 'dark' ? '#adb5bd' : '#495057',
    //                             ':hover': {
    //                                 backgroundColor: '#ff6b6b',
    //                                 color: 'white',
    //                             },
    //                         }),
    //                     }}
    //                 />
    //             )}

    //             {field.field_type === 'textarea' && (
    //                 <Form.Control
    //                     as="textarea"
    //                     rows={3}
    //                     name={fieldKey}
    //                     value={formData[fieldKey] || ''}
    //                     onChange={(e) => {
    //                         const event = {
    //                             target: {
    //                                 name: fieldKey,
    //                                 value: e.target.value,
    //                                 type: 'textarea'
    //                             }
    //                         };
    //                         handleChange(event, entryIndex);
    //                     }}
    //                     readOnly={field.readonly}
    //                     className={`shadow-sm ${darkModeClasses}`}
    //                     placeholder={`Enter ${field.field_label.toLowerCase()} here...`}
    //                 />
    //             )}

    //             {field.field_type === 'password' && (
    //                 <div className="position-relative">
    //                     <Form.Control
    //                         type={passwordVisibility[fieldKey] ? 'text' : 'password'}
    //                         name={fieldKey}
    //                         value={formData[fieldKey] || ''}
    //                         onChange={(e) => {
    //                             const event = {
    //                                 target: {
    //                                     name: fieldKey,
    //                                     value: e.target.value,
    //                                     type: 'password'
    //                                 }
    //                             };
    //                             handleChange(event, entryIndex);
    //                         }}
    //                         readOnly={field.readonly}
    //                         className={`shadow-sm pe-5 ${darkModeClasses}`}
    //                         placeholder={`Enter ${field.field_label.toLowerCase()} here...`}
    //                     />
    //                     <span
    //                         onClick={() =>
    //                             setPasswordVisibility(prev => ({
    //                                 ...prev,
    //                                 [fieldKey]: !prev[fieldKey]
    //                             }))
    //                         }
    //                         className="position-absolute top-50 end-0 translate-middle-y me-3"
    //                         style={{ cursor: 'pointer', zIndex: 10 }}
    //                     >
    //                         <i className={`bi ${passwordVisibility[fieldKey] ? 'bi-eye-slash' : 'bi-eye'}`}></i>
    //                     </span>
    //                 </div>
    //             )}

    //             {field.field_type === 'radio' && (
    //                 <div className="d-flex flex-wrap gap-3 mt-2">
    //                     {field.options?.map((opt, idx) => (
    //                         <Form.Check
    //                             key={idx}
    //                             type="radio"
    //                             label={opt}
    //                             name={fieldKey}
    //                             value={opt}
    //                             checked={formData[fieldKey] === opt}
    //                             onChange={(e) => {
    //                                 const event = {
    //                                     target: {
    //                                         name: fieldKey,
    //                                         value: e.target.value,
    //                                         type: 'radio'
    //                                     }
    //                                 };
    //                                 handleChange(event, entryIndex);
    //                             }}
    //                             className={`me-3 ${theme === 'dark' ? 'text-light' : ''}`}
    //                             id={`${fieldKey}-${idx}`}
    //                             disabled={field.readonly}
    //                         />
    //                     ))}
    //                 </div>
    //             )}

    //             {field.field_type === 'checkbox' && (
    //                 <div className="d-flex flex-wrap gap-2 mt-2">
    //                     {field.options?.map((opt, idx) => (
    //                         <Form.Check
    //                             key={idx}
    //                             type="checkbox"
    //                             label={opt}
    //                             name={fieldKey}
    //                             value={opt}
    //                             checked={formData[fieldKey]?.includes(opt)}
    //                             onChange={(e) => {
    //                                 const event = {
    //                                     target: {
    //                                         name: fieldKey,
    //                                         value: e.target.value,
    //                                         type: 'checkbox',
    //                                         checked: e.target.checked
    //                                     }
    //                                 };
    //                                 handleChange(event, entryIndex);
    //                             }}
    //                             className={`me-3 ${theme === 'dark' ? 'text-light' : ''}`}
    //                             id={`${fieldKey}-${idx}`}
    //                             disabled={field.readonly}
    //                         />
    //                     ))}
    //                 </div>
    //             )}

    //             {field.field_type === 'file' && (
    //                 <Form.Control
    //                     type="file"
    //                     name={fieldKey}
    //                     onChange={(e) => {
    //                         const event = {
    //                             target: {
    //                                 name: fieldKey,
    //                                 value: e.target.value,
    //                                 type: 'file'
    //                             }
    //                         };
    //                         handleChange(event, entryIndex);
    //                     }}
    //                     className={`shadow-sm ${darkModeClasses}`}
    //                     disabled={field.readonly}
    //                 />
    //             )}

    //             {['select', 'multiselect', 'textarea', 'password', 'radio', 'checkbox', 'file'].indexOf(field.field_type) === -1 && (
    //                 <Form.Control
    //                     type={field.field_type}
    //                     name={fieldKey}
    //                     value={formData[fieldKey] || ''}
    //                     onChange={(e) => {
    //                         const event = {
    //                             target: {
    //                                 name: fieldKey,
    //                                 value: e.target.value,
    //                                 type: field.field_type
    //                             }
    //                         };
    //                         handleChange(event, entryIndex);
    //                     }}
    //                     readOnly={field.readonly}
    //                     className={`shadow-sm ${darkModeClasses}`}
    //                     placeholder={`Enter ${field.field_label.toLowerCase()} here...`}
    //                 />
    //             )}

    //             {field.help_text && (
    //                 <Form.Text className={`mt-1 d-block ${theme === 'dark' ? 'text-light opacity-75' : 'text-muted'}`}>
    //                     <small>{field.help_text}</small>
    //                 </Form.Text>
    //             )}
    //         </Form.Group>
    //     );
    // };


    const renderField = (field, entryIndex = 0) => {
        const fieldKey = `${field.field_name}_${entryIndex}`;
        const darkModeClasses = theme === 'dark' ? 'bg-dark text-light border-secondary' : '';
        const hasError = validationErrors[fieldKey];
        const isInvalid = formTouched && hasError;
        const isRequired = field.field_name.includes('email');

        const getFieldFeedback = () =>
            isInvalid && (
                <Form.Control.Feedback type="invalid">
                    {validationErrors[fieldKey]}
                </Form.Control.Feedback>
            );

        const getInvalidFeedbackDiv = () =>
            isInvalid && (
                <div className="invalid-feedback d-block">
                    {validationErrors[fieldKey]}
                </div>
            );

        return (
            <Form.Group className="mb-3 position-relative" key={fieldKey}>
                <Form.Label className={`fw-bold ${theme === 'dark' ? 'text-light' : ''}`}>
                    {field.field_label} {isRequired && <span className="text-danger">*</span>}
                </Form.Label>

                {field.field_type === 'text' && (
                    <>
                        <Form.Control
                            type={field.field_type}
                            name={fieldKey}
                            value={formData[fieldKey] || ''}
                            // onChange={(e) => {
                            //     const event = {
                            //         name: e.target.name,
                            //         value: e.target.value
                            //     };
                            //     handleChange(event, field.change_rule_id);
                            // }}
                            onChange={(e) => {
                                const event = {
                                    name: `${field.field_name}_${entryIndex}`,
                                    value: e.target.value,
                                };
                                handleChange(event, field.change_rule_id, entryIndex);
                            }}
                            required={isRequired}
                            className={`shadow-sm ${darkModeClasses} ${isInvalid ? 'is-invalid' : ''}`}
                            disabled={field.readonly}
                        />
                        {getFieldFeedback()}
                    </>
                )}

                {field.field_type === 'select' && (
                    <>
                        <Select
                            name={fieldKey}
                            isSearchable={true}
                            isClearable={true}
                            isDisabled={field.readonly}
                            value={formData[fieldKey] ? { value: formData[fieldKey], label: formData[fieldKey] } : null}
                            onChange={(selectedOption) => {
                                const value = selectedOption ? selectedOption.value : '';
                                const event = {
                                    name: fieldKey,
                                    value: value
                                };
                                handleChange(event, field.change_rule_id);
                            }}
                            options={(() => {
                                // Static options from field.options
                                const staticOptions = field.options?.map(opt => ({ value: opt, label: opt })) || [];

                                // Dynamic options from API calls - try different field name variations
                                const possibleDynamicKeys = [
                                    fieldKey,
                                    fieldKey.replace(/ /g, '_'),
                                    fieldKey.replace(/_/g, ' '),
                                    field.field_name + '_0',
                                    field.field_name.replace(/_/g, ' ') + '_0'
                                ];

                                let dynamicOptionsArray = [];
                                for (const key of possibleDynamicKeys) {
                                    if (dynamicOptions[key] && Array.isArray(dynamicOptions[key])) {
                                        dynamicOptionsArray = dynamicOptions[key].map(opt => ({ value: opt, label: opt }));
                                        //console.log('Found dynamic options for key:', key, dynamicOptionsArray);
                                        break;
                                    }
                                }

                                const allOptions = [...staticOptions, ...dynamicOptionsArray];


                                return allOptions;
                            })()}
                            className={`react-select-container ${isInvalid ? 'is-invalid' : ''}`}
                            classNamePrefix="react-select"
                            placeholder={`Search and select ${field.field_label}...`}
                            noOptionsMessage={() => "No options found"}
                            styles={{
                                control: (base, state) => ({
                                    ...base,
                                    backgroundColor: theme === 'dark' ? '#343a40' : '#fff',
                                    color: theme === 'dark' ? '#fff' : '#000',
                                    borderColor: isInvalid ? '#dc3545' : (state.isFocused ? (theme === 'dark' ? '#6ea8fe' : '#0d6efd') : base.borderColor),
                                    boxShadow: state.isFocused ? `0 0 0 0.2rem ${theme === 'dark' ? 'rgba(110, 168, 254, 0.25)' : 'rgba(13, 110, 253, 0.25)'}` : 'none',
                                    '&:hover': {
                                        borderColor: isInvalid ? '#dc3545' : (theme === 'dark' ? '#6ea8fe' : '#0d6efd')
                                    }
                                }),
                                menu: (base) => ({
                                    ...base,
                                    backgroundColor: theme === 'dark' ? '#343a40' : '#fff',
                                    border: `1px solid ${theme === 'dark' ? '#495057' : '#dee2e6'}`,
                                    zIndex: 9999
                                }),
                                option: (base, state) => ({
                                    ...base,
                                    backgroundColor: state.isFocused
                                        ? (theme === 'dark' ? '#495057' : '#e7f1ff')
                                        : state.isSelected
                                            ? (theme === 'dark' ? '#0d6efd' : '#0d6efd')
                                            : 'transparent',
                                    color: state.isSelected
                                        ? '#fff'
                                        : (theme === 'dark' ? '#fff' : '#000'),
                                    '&:hover': {
                                        backgroundColor: theme === 'dark' ? '#495057' : '#e7f1ff',
                                        color: theme === 'dark' ? '#fff' : '#000'
                                    }
                                }),
                                singleValue: (base) => ({
                                    ...base,
                                    color: theme === 'dark' ? '#fff' : '#000'
                                }),
                                placeholder: (base) => ({
                                    ...base,
                                    color: theme === 'dark' ? '#adb5bd' : '#6c757d'
                                }),
                                input: (base) => ({
                                    ...base,
                                    color: theme === 'dark' ? '#fff' : '#000'
                                }),
                                indicatorSeparator: (base) => ({
                                    ...base,
                                    backgroundColor: theme === 'dark' ? '#495057' : '#dee2e6'
                                }),
                                dropdownIndicator: (base) => ({
                                    ...base,
                                    color: theme === 'dark' ? '#adb5bd' : '#6c757d',
                                    '&:hover': {
                                        color: theme === 'dark' ? '#fff' : '#000'
                                    }
                                }),
                                clearIndicator: (base) => ({
                                    ...base,
                                    color: theme === 'dark' ? '#adb5bd' : '#6c757d',
                                    '&:hover': {
                                        color: theme === 'dark' ? '#fff' : '#000'
                                    }
                                })
                            }}
                        />
                        {getInvalidFeedbackDiv()}
                    </>
                )}

                {field.field_type === 'multiselect' && (
                    <>
                        <Select
                            isMulti
                            isSearchable
                            name={fieldKey}
                            isDisabled={field.readonly}
                            options={field.options?.map(opt => ({ value: opt, label: opt })) || []}
                            value={(formData[fieldKey] || []).map(val => ({ value: val, label: val }))}
                            onChange={(selectedOptions) => {
                                const values = selectedOptions ? selectedOptions.map(option => option.value) : [];
                                setFormData(prev => ({
                                    ...prev,
                                    [fieldKey]: values
                                }));

                                // setTimeout(() => {
                                //     validateWithAI({
                                //         ...formData,
                                //         [fieldKey]: values
                                //     });
                                // }, 300);
                            }}
                            className={`react-select-container mb-2 ${isInvalid ? 'is-invalid' : ''}`}
                            classNamePrefix="react-select"
                            placeholder={`Search and select ${field.field_label}...`}
                            styles={{
                                control: (base) => ({
                                    ...base,
                                    backgroundColor: theme === 'dark' ? '#343a40' : '#fff',
                                    color: theme === 'dark' ? '#fff' : '#000',
                                    borderColor: isInvalid ? '#dc3545' : base.borderColor,
                                }),
                                menu: (base) => ({
                                    ...base,
                                    backgroundColor: theme === 'dark' ? '#343a40' : '#fff',
                                }),
                                multiValue: (base) => ({
                                    ...base,
                                    backgroundColor: theme === 'dark' ? '#495057' : '#dee2e6',
                                }),
                                multiValueLabel: (base) => ({
                                    ...base,
                                    color: theme === 'dark' ? '#fff' : '#000',
                                }),
                                multiValueRemove: (base) => ({
                                    ...base,
                                    color: theme === 'dark' ? '#adb5bd' : '#495057',
                                    ':hover': {
                                        backgroundColor: '#ff6b6b',
                                        color: 'white',
                                    },
                                }),
                            }}
                        />
                        {getInvalidFeedbackDiv()}
                    </>
                )}

                {field.field_type === 'textarea' && (
                    <>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name={fieldKey}
                            value={formData[fieldKey] || ''}
                            onChange={handleChange}
                            readOnly={field.readonly}
                            required={isRequired}
                            className={`shadow-sm ${darkModeClasses} ${isInvalid ? 'is-invalid' : ''}`}
                            placeholder={`Enter ${field.field_label.toLowerCase()} here...`}
                        />
                        {getFieldFeedback()}
                    </>
                )}

                {field.field_type === 'password' && (
                    <>
                        <div className="position-relative">
                            <Form.Control
                                type={passwordVisibility[fieldKey] ? 'text' : 'password'}
                                name={fieldKey}
                                value={formData[fieldKey] || ''}
                                onChange={handleChange}
                                readOnly={field.readonly}
                                required={isRequired}
                                className={`shadow-sm pe-5 ${darkModeClasses} ${isInvalid ? 'is-invalid' : ''}`}
                                placeholder={`Enter ${field.field_label.toLowerCase()} here...`}
                            />
                            <span
                                onClick={() =>
                                    setPasswordVisibility(prev => ({
                                        ...prev,
                                        [fieldKey]: !prev[fieldKey]
                                    }))
                                }
                                className="position-absolute top-50 end-0 translate-middle-y me-3"
                                style={{ cursor: 'pointer', zIndex: 10 }}
                            >
                                <i className={`bi ${passwordVisibility[fieldKey] ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                            </span>
                        </div>
                        {getFieldFeedback()}
                    </>
                )}

                {field.field_type === 'radio' && (
                    <>
                        <div className="d-flex flex-wrap gap-3 mt-2">
                            {field.options?.map((opt, idx) => (
                                <Form.Check
                                    key={idx}
                                    type="radio"
                                    label={opt}
                                    name={fieldKey}
                                    value={opt}
                                    checked={formData[fieldKey] === opt}
                                    onChange={(e) => handleChange(e, field.change_rule_id, entryIndex)}
                                    className={`me-3 ${theme === 'dark' ? 'text-light' : ''}`}
                                    id={`${fieldKey}-${idx}`}
                                    required={isRequired}
                                    disabled={field.readonly}
                                    isInvalid={isInvalid}
                                />
                            ))}
                        </div>
                        {getInvalidFeedbackDiv()}
                    </>
                )}

                {field.field_type === 'checkbox' && (
                    <>
                        <div className="d-flex flex-wrap gap-2 mt-2">
                            {field.options?.map((opt, idx) => (
                                <Form.Check
                                    key={idx}
                                    type="checkbox"
                                    label={opt}
                                    name={fieldKey}
                                    value={opt}
                                    checked={formData[fieldKey]?.includes(opt)}
                                    onChange={handleChange}
                                    className={`me-3 ${theme === 'dark' ? 'text-light' : ''}`}
                                    id={`${fieldKey}-${idx}`}
                                    required={isRequired}
                                    disabled={field.readonly}
                                    isInvalid={isInvalid}
                                />
                            ))}
                        </div>
                        {getInvalidFeedbackDiv()}
                    </>
                )}

                {field.field_type === 'file' && (
                    <>
                        <Form.Control
                            type="file"
                            name={fieldKey}
                            onChange={handleChange}
                            className={`shadow-sm ${darkModeClasses} ${isInvalid ? 'is-invalid' : ''}`}
                            disabled={field.readonly}
                        />
                        {getFieldFeedback()}
                    </>
                )}

                {['select', 'multiselect', 'textarea', 'password', 'radio', 'checkbox', 'file', 'text'].indexOf(field.field_type) === -1 && (
                    <>
                        <Form.Control
                            type={field.field_type}
                            name={fieldKey}
                            value={formData[fieldKey] || ''}
                            onChange={handleChange}
                            readOnly={field.readonly}
                            required={isRequired}
                            className={`shadow-sm ${darkModeClasses} ${isInvalid ? 'is-invalid' : ''}`}
                            placeholder={`Enter ${field.field_label.toLowerCase()} here...`}
                        />
                        {getFieldFeedback()}
                    </>
                )}

                {field.help_text && !isInvalid && (
                    <Form.Text className={`mt-1 d-block ${theme === 'dark' ? 'text-light opacity-75' : 'text-muted'}`}>
                        <small>{field.help_text}</small>
                    </Form.Text>
                )}
            </Form.Group>
        );
    };
    const getThemeStyles = () => {
        if (theme === 'dark') {
            return {
                backgroundColor: '#121212',
                color: '#f8f9fa',
                cardBg: '#212529',
                cardHeader: '#343a40',
                accordionBg: '#1e2125',
                accordionHeader: '#2c3034',
                buttonPrimary: 'outline-info',
                buttonSecondary: 'outline-danger',
                formBg: '#2c3034',
                navBg: '#121212'
            };
        }
        return {
            backgroundColor: '#f0f2f5',
            color: '#212529',
            cardBg: '#ffffff',
            cardHeader: 'primary',
            accordionBg: '#ffffff',
            accordionHeader: '#f8f9fa',
            buttonPrimary: 'primary',
            buttonSecondary: 'danger',
            formBg: ''
        };
    };

    const themeStyles = getThemeStyles();
    const fullScreenStyles = {
        pageContainer: {
            backgroundColor: themeStyles.backgroundColor,
            minHeight: '100vh',
            width: '100%',
            padding: '0',
            margin: '0',
            maxWidth: '100%'
        },
        mainContent: {
            padding: '0rem 0',
        },
        formCard: {
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: theme === 'dark'
                ? '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3)'
                : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            backgroundColor: themeStyles.cardBg,
            margin: '0 auto',
            maxWidth: '1400px',
            border: `1px solid ${themeStyles.borderColor}`,
        },
        accordionStyles: {
            backgroundColor: themeStyles.accordionBg,
            borderRadius: '8px',
            marginBottom: '0.75rem',
            border: `1px solid ${themeStyles.borderColor}`,
            overflow: 'hidden',
        },
        accordionButton: {
            backgroundColor: themeStyles.accordionHeader,
            color: themeStyles.color,
            fontFamily: "'Maven Pro', sans-serif",
            fontWeight: '600',
            padding: '0.75rem 1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            textAlign: 'left',
            border: 'none',
            borderRadius: '0',
            transition: 'all 0.2s ease',
            fontSize: '0.95rem',
            minHeight: '45px',
        },
        formHeader: {
            background: theme === 'dark'
                ? 'linear-gradient(135deg,rgb(169, 172, 177) 0%, #161b22 100%)'
                : 'linear-gradient(135deg,rgba(197, 184, 184, 0.51) 0%,rgba(97, 91, 91, 0.56) 100%)',
            color: themeStyles.color,
            padding: '0.5rem 2rem',
            borderBottom: `2px solid ${themeStyles.borderColor}`,
            position: 'relative',
            overflow: 'hidden',
        },
        formHeaderContent: {
            position: 'relative',
            zIndex: 2,
        },
        themeToggle: {
            backgroundColor: 'transparent',
            border: `2px solid ${themeStyles.borderColor}`,
            color: themeStyles.color,
            borderRadius: '25px',
            padding: '0.4rem 0.8rem',
            fontSize: '0.85rem',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
        },
    };

    const formTitle = formattedTitle;

    return (
        <>
            <ToastContainer />
            <Container fluid style={fullScreenStyles.pageContainer}>
                <div style={fullScreenStyles.mainContent}>
                    <div style={fullScreenStyles.formCard}>
                        <div style={fullScreenStyles.formHeader}>
                            <div style={fullScreenStyles.formHeaderContent} className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h4
                                        className="mb-1 mb-lg-0"
                                        style={{
                                            fontFamily: "'Maven Pro', sans-serif",
                                            fontWeight: '100',
                                            color: 'black'
                                        }}
                                    >
                                        {formTitle} {isEditMode && <Badge bg="info" className="ms-2">ID: {editId}</Badge>}
                                    </h4>

                                    <p className="mb-0" style={{
                                        fontSize: '0.9rem',
                                        color: themeStyles.textSecondary,
                                        fontWeight: '400'
                                    }}>
                                        {isEditMode ? 'Update the information below and save changes' : 'Please fill out all required fields'}
                                    </p>
                                </div>
                                <button
                                    style={fullScreenStyles.themeToggle}
                                    onClick={toggleTheme}
                                    className="hover-effect"
                                >
                                    <i className={`bi ${theme === 'dark' ? 'bi-sun' : 'bi-moon'}`}></i>
                                    {theme === 'dark' ? 'Light' : 'Dark'}
                                </button>
                            </div>
                        </div>

                        <div className="p-4" style={{ backgroundColor: themeStyles.formBg }}>
                            {loading ? (
                                <div className="text-center py-5">
                                    <Spinner animation="border" variant={theme === 'dark' ? 'light' : 'primary'} />
                                    <p className={`mt-3 ${theme === 'dark' ? 'text-light' : ''}`}>
                                        Loading form fields...
                                    </p>
                                </div>
                            ) : (
                                <Form onSubmit={handleSubmit}>
                                    <Accordion
                                        activeKey={activeKey}
                                        onSelect={(k) => setActiveKey(k)}
                                        className="mb-4"
                                    >
                                        {categories.map((category, categoryIndex) => (
                                            <Accordion.Item
                                                eventKey={categoryIndex.toString()}
                                                key={category.category_key}
                                                style={fullScreenStyles.accordionStyles}
                                            >
                                                <Accordion.Header
                                                    className={`d-flex justify-content-between align-items-center ${theme === 'dark' ? 'bg-dark text-light' : ''
                                                        }`}
                                                    style={{
                                                        backgroundColor: themeStyles.accordionHeader,
                                                        fontFamily: "'Maven Pro', sans-serif",
                                                    }}
                                                >
                                                    <div className="d-flex align-items-center gap-2">
                                                        <i className={category.badge}></i>
                                                        <span className="fw-bold">
                                                            {category.category_label || formatFieldName(category.category_key)}
                                                        </span>
                                                        {category.is_multiple === 'yes' && (
                                                            <Badge bg={theme === 'dark' ? 'secondary' : 'primary'} className="ms-2">
                                                                {(categoryEntries[category.category_key]?.length || 1)} entr{(categoryEntries[category.category_key]?.length || 1) === 1 ? 'y' : 'ies'}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </Accordion.Header>
                                                <Accordion.Body
                                                    className={theme === 'dark' ? 'bg-dark text-light' : ''}
                                                    style={{
                                                        backgroundColor: themeStyles.accordionBg,
                                                        fontFamily: "'Maven Pro', sans-serif"
                                                    }}
                                                >
                                                    {(categoryEntries[category.category_key] || [0]).map((entryIndex, idx) => (
                                                        <div key={entryIndex} className="mb-4">
                                                            {category.is_multiple === 'yes' && (categoryEntries[category.category_key] || []).length > 1 && (
                                                                <div className="d-flex justify-content-between align-items-center mb-3 p-3 rounded"
                                                                    style={{
                                                                        backgroundColor: theme === 'dark' ? '#2c3034' : '#f8f9fa',
                                                                        border: `1px solid ${theme === 'dark' ? '#495057' : '#dee2e6'}`
                                                                    }}>
                                                                    <h6 className="mb-0 fw-bold">
                                                                        Entry #{idx + 1}
                                                                    </h6>
                                                                    {(categoryEntries[category.category_key] || []).length > 1 && (
                                                                        <Button
                                                                            variant={themeStyles.buttonSecondary}
                                                                            size="sm"
                                                                            onClick={() => removeCategoryEntry(category.category_key, entryIndex)}
                                                                            className="d-flex align-items-center gap-1"
                                                                        >
                                                                            <i className="bi bi-trash3"></i>
                                                                            Remove
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            )}

                                                            <Row>
                                                                {category.fields && category.fields.map((field, fieldIndex) => (
                                                                    <Col
                                                                        key={`${field.field_name}_${entryIndex}`}
                                                                        xs={12}
                                                                        md={field.field_type === 'textarea' ? 12 : 6}
                                                                        lg={field.field_type === 'textarea' ? 12 : 4}
                                                                    >
                                                                        {renderField(field, entryIndex)}
                                                                    </Col>
                                                                ))}
                                                            </Row>
                                                        </div>
                                                    ))}

                                                    {category.is_multiple === 'yes' && (
                                                        <div className="text-center mt-3">
                                                            <Button
                                                                variant={themeStyles.buttonPrimary}
                                                                onClick={() => addCategoryEntry(category.category_key)}
                                                                className="d-flex align-items-center gap-2 mx-auto"
                                                            >
                                                                <i className="bi bi-plus-circle"></i>
                                                                Add Another {category.category_label || formatFieldName(category.category_key)}
                                                            </Button>
                                                        </div>
                                                    )}
                                                </Accordion.Body>
                                            </Accordion.Item>
                                        ))}
                                    </Accordion>

                                    <div className="d-flex justify-content-center gap-3 mt-4 pt-3 border-top">
                                        <Button
                                            variant={themeStyles.buttonPrimary}
                                            type="submit"
                                            size="sm"
                                            className="px-4 shadow-sm"
                                            style={{ fontFamily: "'Maven Pro', sans-serif" }}
                                        >
                                            {isEditMode ? "Update Form" : "Submit Form"}
                                        </Button>

                                        <Button
                                            variant={themeStyles.buttonSecondary}
                                            type="button"
                                            size="sm"
                                            className="px-4 shadow-sm"
                                            onClick={handleReset}
                                            style={{ fontFamily: "'Maven Pro', sans-serif" }}
                                        >
                                            Reset Form
                                        </Button>
                                    </div>
                                </Form>
                            )}
                        </div>
                    </div>
                </div>
            </Container>

            <style jsx>{`
                .react-select-container .react-select__control {
                    border-radius: 6px;
                    border: 1px solid #ced4da;
                    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
                    transition: all 0.15s ease-in-out;
                }

                .react-select-container .react-select__control:hover {
                    border-color: #86b7fe;
                }

                .react-select-container .react-select__control--is-focused {
                    border-color: #86b7fe;
                    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
                }

                .hover-effect:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
                }

                .form-control:focus, .form-select:focus {
                    border-color: #86b7fe;
                    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
                }

                .btn:hover {
                    transform: translateY(-1px);
                    transition: all 0.2s ease;
                }

                .accordion-button:not(.collapsed) {
                    background-color: ${themeStyles.accordionHeader};
                    color: ${themeStyles.color};
                    box-shadow: none;
                }

                .accordion-button:focus {
                    border-color: ${theme === 'dark' ? '#495057' : '#86b7fe'};
                    box-shadow: 0 0 0 0.25rem ${theme === 'dark' ? 'rgba(73, 80, 87, 0.25)' : 'rgba(13, 110, 253, 0.25)'};
                }

                .accordion-button::after {
                    filter: ${theme === 'dark' ? 'invert(1)' : 'none'};
                }

                .form-check-input:checked {
                    background-color: #0d6efd;
                    border-color: #0d6efd;
                }

                .form-check-input:focus {
                    border-color: #86b7fe;
                    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
                }

                @media (max-width: 768px) {
                    .form-header {
                        padding: 1rem !important;
                    }
                    
                    .form-header h4 {
                        font-size: 1.1rem !important;
                    }
                    
                    .theme-toggle {
                        font-size: 0.8rem !important;
                        padding: 0.3rem 0.6rem !important;
                    }
                }
            `}</style>
        </>
    );
}

export default DynamicForm;