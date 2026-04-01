import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Form, Button, Row, Col, Card, Spinner, Accordion, Navbar, Nav, NavDropdown, Badge } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useLocation } from 'react-router-dom';

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
    const [activeKey, setActiveKey] = useState('0'); // For accordion control
    const [passwordVisibility, setPasswordVisibility] = useState({});
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [dynamicOptions, setDynamicOptions] = useState({});
    const [categoryEntries, setCategoryEntries] = useState({});

    const location = useLocation();
    const path = location.pathname.split('/').pop();
    const formattedTitle = path
        ? path.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        : 'Dynamic Form';

    useEffect(() => {
        const linkElement = document.createElement('link');
        linkElement.rel = 'stylesheet';
        linkElement.href = 'https://fonts.googleapis.com/css2?family=Maven+Pro:wght@400;500;700&display=swap';
        document.head.appendChild(linkElement);

        document.body.style.fontFamily = "'Maven Pro', sans-serif";

        setLoading(true);

        const formName = formattedTitle;
        const submissionData = {
            form_name: formName
        };

        axios.post('https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/get_fields.php', submissionData)
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

                const defaultForm = {};
                fetchedCategories.forEach(category => {
                    category.fields.forEach(field => {
                        defaultForm[field.field_name] = field.field_type === 'checkbox' || field.field_type === 'multiselect'
                            ? []
                            : '';
                    });
                });

                setFormData(defaultForm);
            })
            .catch((err) => {
                console.error("Error fetching fields:", err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        setLoading(true);
        axios.get(`https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/get_statelist.php`)
            .then(response => {
                console.log("response");
                console.log(response);
                setStates(response.data.data); // Access the data array from your JSON structure
            })
            .catch(err => {
                console.error("Error fetching states:", err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []); // Empty dependency array - runs only once on component mount

    useEffect(() => {
        const stateId = formData.state; // or whatever your state field name is

        if (stateId) {
            setLoading(true);

            // Method 1: Using POST with form data
            const formDataForCities = new FormData();
            formDataForCities.append('state', stateId);
            axios.post(`https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/get_citylist.php`, formDataForCities)
                .then(response => {
                    console.log('Cities API Response:', response.data);

                    if (response.data && response.data.data && Array.isArray(response.data.data)) {
                        setCities(response.data.data);
                        console.log('Cities loaded:', response.data.data.length);
                    } else {
                        console.error('Unexpected cities API response structure:', response.data);
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
    const cleanFormData = (formData) => {
        const cleanedData = {};

        Object.keys(formData).forEach(key => {
            // If the key ends with _0, use the base name instead
            if (key.endsWith('_0')) {
                const baseKey = key.replace(/_0$/, '');
                // Only use the _0 value if the base key doesn't exist or is empty
                if (!formData[baseKey] || formData[baseKey] === '') {
                    cleanedData[baseKey] = formData[key];
                } else {
                    cleanedData[baseKey] = formData[baseKey];
                }
            } else if (!key.match(/_\d+$/)) {
                // Include keys that don't end with _number pattern
                cleanedData[key] = formData[key];
            }
            // Skip keys that end with _number (except _0 which we handled above)
        });

        return cleanedData;
    };

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
            axios.post('https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/exceute_rule.php', submissionData)
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
                            } else if (Array.isArray(values)) {
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
                    } else {
                        console.error('Expected array but got:', typeof allRuleResults, allRuleResults);
                    }
                })
                .catch(err => {
                    console.error("Error executing rule:", err);
                });
        }
        setFormData(newFormData);
    };
    const handleReset = () => {
        const resetForm = {};
        categories.forEach(category => {
            category.fields.forEach(field => {
                resetForm[field.field_name] = field.field_type === 'checkbox' || field.field_type === 'multiselect' ? [] : '';
            });
        });
        setFormData(resetForm);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Clean the form data to remove _0 suffixes and duplicates
        const cleanedFormData = cleanFormData(formData);

        // Structure the data in the required format
        const submissionData = {
            type: "insert",
            table: "submitted_forms",
            form_name: formattedTitle,
            insert_array: [
                {
                    form_data: {
                        ...cleanedFormData,
                        form_name: formattedTitle
                    }
                }
            ]
        };

        console.log('Cleaned form data for submission:', cleanedFormData);
        console.log('Full submission data:', submissionData);

        axios.post('https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/insertData.php', submissionData)
            .then(res => {
                toast.success('Form submitted successfully');
                handleReset();
            })
            .catch(err => {
                console.error('Error submitting form:', err);
                toast.error('Error submitting form');
            });
    };


    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const renderField = (field, entryIndex = 0) => {
        // const fieldKey = `${field.field_name}_${entryIndex}`;
        // const darkModeClasses = theme === 'dark' ? 'bg-dark text-light border-secondary' : '';
        const fieldKey = entryIndex === 0 ? field.field_name : `${field.field_name}_${entryIndex}`;
        const darkModeClasses = theme === 'dark' ? 'bg-dark text-light border-secondary' : '';
        return (
            <Form.Group className="mb-3 position-relative" key={field.field_name}>
                <Form.Label className={`fw-bold ${theme === 'dark' ? 'text-light' : ''}`}>
                    {field.field_label}
                </Form.Label>

                {field.field_type === 'select' && (
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

                            // Dynamic options - use the actual fieldKey without modification
                            const possibleDynamicKeys = [
                                fieldKey,
                                fieldKey.replace(/ /g, '_'),
                                fieldKey.replace(/_/g, ' '),
                                field.field_name
                            ];

                            let dynamicOptionsArray = [];
                            for (const key of possibleDynamicKeys) {
                                if (dynamicOptions[key] && Array.isArray(dynamicOptions[key])) {
                                    dynamicOptionsArray = dynamicOptions[key].map(opt => ({ value: opt, label: opt }));
                                    break;
                                }
                            }

                            const allOptions = [...staticOptions, ...dynamicOptionsArray];
                            return allOptions;
                        })()}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        placeholder={`Search and select ${field.field_label}...`}
                        noOptionsMessage={() => "No options found"}
                        styles={{
                            control: (base, state) => ({
                                ...base,
                                backgroundColor: theme === 'dark' ? '#343a40' : '#fff',
                                color: theme === 'dark' ? '#fff' : '#000',
                                borderColor: state.isFocused ? (theme === 'dark' ? '#6ea8fe' : '#0d6efd') : base.borderColor,
                                boxShadow: state.isFocused ? `0 0 0 0.2rem ${theme === 'dark' ? 'rgba(110, 168, 254, 0.25)' : 'rgba(13, 110, 253, 0.25)'}` : 'none',
                                '&:hover': {
                                    borderColor: theme === 'dark' ? '#6ea8fe' : '#0d6efd'
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
                )}

                {field.field_type === 'multiselect' && (
                    <Select
                        isMulti
                        isSearchable
                        name={field.field_name}
                        isDisabled={field.readonly}
                        options={field.options?.map(opt => ({ value: opt, label: opt })) || []}
                        value={(formData[field.field_name] || []).map(val => ({ value: val, label: val }))}
                        onChange={(selectedOptions) => {
                            const values = selectedOptions.map(option => option.value);
                            setFormData(prev => ({
                                ...prev,
                                [field.field_name]: values
                            }));
                        }}
                        className="react-select-container mb-2"
                        classNamePrefix="react-select"
                        placeholder={`Select ${field.field_label}`}
                        styles={{
                            control: (base) => ({
                                ...base,
                                backgroundColor: theme === 'dark' ? '#343a40' : '#fff',
                                color: theme === 'dark' ? '#fff' : '#000',
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
                )}

                {field.field_type === 'textarea' && (
                    <Form.Control
                        as="textarea"
                        rows={3}
                        name={field.field_name}
                        value={formData[field.field_name] || ''}
                        onChange={handleChange}
                        readOnly={field.readonly}
                        className={`shadow-sm ${darkModeClasses}`}
                        placeholder={`Enter ${field.field_label.toLowerCase()} here...`}
                    />
                )}

                {field.field_type === 'password' && (
                    <div className="position-relative">
                        <Form.Control
                            type={passwordVisibility[field.field_name] ? 'text' : 'password'}
                            name={field.field_name}
                            value={formData[field.field_name] || ''}
                            onChange={handleChange}
                            readOnly={field.readonly}
                            className={`shadow-sm pe-5 ${darkModeClasses}`}
                            placeholder={`Enter ${field.field_label.toLowerCase()} here...`}
                        />
                        <span
                            onClick={() =>
                                setPasswordVisibility(prev => ({
                                    ...prev,
                                    [field.field_name]: !prev[field.field_name]
                                }))
                            }
                            className="position-absolute top-50 end-0 translate-middle-y me-3"
                            style={{ cursor: 'pointer', zIndex: 10 }}
                        >
                            <i className={`bi ${passwordVisibility[field.field_name] ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                        </span>
                    </div>
                )}

                {field.field_type === 'radio' && (
                    <div className="d-flex flex-wrap gap-3 mt-2">
                        {field.options?.map((opt, idx) => (
                            <Form.Check
                                key={idx}
                                type="radio"
                                label={opt}
                                name={field.field_name}
                                value={opt}
                                checked={formData[field.field_name] === opt}
                                onChange={handleChange}
                                className={`me-3 ${theme === 'dark' ? 'text-light' : ''}`}
                                id={`${field.field_name}-${idx}`}
                                disabled={field.readonly}
                            />
                        ))}
                    </div>
                )}

                {field.field_type === 'checkbox' && (
                    <div className="d-flex flex-wrap gap-2 mt-2">
                        {field.options?.map((opt, idx) => (
                            <Form.Check
                                key={idx}
                                type="checkbox"
                                label={opt}
                                name={field.field_name}
                                value={opt}
                                checked={formData[field.field_name]?.includes(opt)}
                                onChange={handleChange}
                                className={`me-3 ${theme === 'dark' ? 'text-light' : ''}`}
                                id={`${field.field_name}-${idx}`}
                                disabled={field.readonly}
                            />
                        ))}
                    </div>
                )}

                {field.field_type === 'file' && (
                    <Form.Control
                        type="file"
                        name={field.field_name}
                        onChange={handleChange}
                        className={`shadow-sm ${darkModeClasses}`}
                        disabled={field.readonly}
                    />
                )}

                {['select', 'multiselect', 'textarea', 'password', 'radio', 'checkbox', 'file'].indexOf(field.field_type) === -1 && (
                    <Form.Control
                        type={field.field_type}
                        name={fieldKey}  // Changed from field.field_name to fieldKey
                        value={formData[fieldKey] || ''}
                        onChange={handleChange}
                        readOnly={field.readonly}
                        className={`shadow-sm ${darkModeClasses}`}
                        placeholder={`Enter ${field.field_label.toLowerCase()} here...`}
                    />
                )}

                {field.help_text && (
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
            margin: '0 auto',
            width: '100%',
            padding: '1rem',
            maxWidth: '100%',
            boxShadow: theme === 'dark'
                ? '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3)'
                : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            backgroundColor: themeStyles.cardBg,
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
                                        {formTitle}
                                    </h4>

                                    <p className="mb-0" style={{
                                        fontSize: '0.9rem',
                                        color: themeStyles.textSecondary,
                                        fontWeight: '400'
                                    }}>
                                        Please fill out all fields
                                    </p>
                                </div>
                                <button
                                    style={fullScreenStyles.themeToggle}
                                    onClick={toggleTheme}
                                    className="btn"
                                    onMouseOver={(e) => {
                                        e.target.style.backgroundColor = theme === 'dark' ? '#30363d' : '#f1f5f9';
                                        e.target.style.transform = 'translateY(-1px)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.backgroundColor = 'transparent';
                                        e.target.style.transform = 'translateY(0)';
                                    }}
                                >
                                    <span>{theme === 'light' ? '🌙' : '☀️'}</span>
                                    <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
                                </button>
                            </div>
                        </div>
                        <Card.Body className={`p-4 ${theme === 'dark' ? 'bg-dark text-light' : ''}`}>
                            {loading ? (
                                <div className="text-center py-5">
                                    <Spinner animation="border" variant={theme === 'dark' ? 'light' : 'primary'} />
                                    <p className="mt-3" style={{ fontFamily: "'Maven Pro', sans-serif" }}>
                                        Loading and organizing form fields...
                                    </p>
                                </div>
                            ) : (
                                <Form onSubmit={handleSubmit} noValidate>
                                    <input type="hidden" name="form_name" value={formTitle} />
                                    <Accordion defaultActiveKey="0" activeKey={activeKey} onSelect={(key) => setActiveKey(key)}>
                                        {categories.map((category, index) => (
                                            <Accordion.Item
                                                eventKey={index.toString()}
                                                key={category.category_key}
                                                style={fullScreenStyles.accordionStyles}
                                            >
                                                <Accordion.Header>
                                                    <div style={{ fontFamily: "'Maven Pro', sans-serif", fontWeight: 'bold' }}>
                                                        <i className={category.badge}></i> {category.category_label}
                                                    </div>
                                                </Accordion.Header>
                                                <Accordion.Body className={theme === 'dark' ? 'bg-dark text-light' : ''}>
                                                    <Row>
                                                        {category.fields.map((field) => {
                                                            const isFullWidth = ['textarea', 'checkbox'].includes(field.field_type) || field.options?.length > 3;
                                                            const colWidth = isFullWidth ? 12 : 6; // Adjust for better balance

                                                            return (
                                                                <Col md={colWidth} sm={12} key={field.field_name} className="mb-2">
                                                                    {renderField(field)}
                                                                </Col>
                                                            );
                                                        })}
                                                    </Row>
                                                </Accordion.Body>
                                            </Accordion.Item>
                                        ))}
                                    </Accordion>
                                    <div className="d-flex justify-content-center flex-wrap gap-3 mt-4 pt-4 border-top">
                                        <Button
                                            variant="primary"
                                            type="submit"
                                            size="md"
                                            className="px-4 py-2 rounded-pill shadow-sm btn-modern"
                                        >
                                            <i className="bi bi-send me-2"></i> Submit Form
                                        </Button>
                                        <Button
                                            variant="outline-danger"
                                            type="button"
                                            size="md"
                                            className="px-4 py-2 rounded-pill shadow-sm btn-modern"
                                            onClick={handleReset}
                                        >
                                            <i className="bi bi-x-circle me-2"></i> Reset
                                        </Button>
                                    </div>
                                </Form>
                            )}
                        </Card.Body>
                    </div>
                </div>
            </Container>
        </>
    );
}

export default DynamicForm;