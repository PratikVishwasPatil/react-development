import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Form, Button, Row, Col, Card, Spinner, Accordion, Badge, Table } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useLocation } from 'react-router-dom';

export function evaluateFormula(formula, formData, currentFieldName = '') {
    console.log("=== FORMULA EVALUATION DEBUG ===");
    console.log("Original formula:", formula);
    console.log("Current field name:", currentFieldName);
    console.log("Form data keys:", Object.keys(formData));

    try {
        if (!formula.includes('=')) return null;

        // Split formula into LHS and RHS
        const [lhs, rhs] = formula.split('=').map(s => s.trim());
        console.log("LHS:", lhs);
        console.log("RHS:", rhs);

        // Extract the index from the current field name
        let currentIndex = '';
        const indexMatch = currentFieldName.match(/_(\d+)$/);
        if (indexMatch) {
            currentIndex = `_${indexMatch[1]}`;
            console.log("Detected index:", currentIndex);
        }

        // Create variables object with sanitized names
        const variables = {};
        const fieldMapping = {};

        // Process all form data
        Object.entries(formData).forEach(([key, val]) => {
            const isNumber = !isNaN(parseFloat(val)) && isFinite(val);
            const parsedVal = isNumber ? parseFloat(val) : 0;

            // Create sanitized version (replace spaces with underscores)
            const sanitized = key.replace(/\s+/g, '_').trim();

            // Store the mapping
            fieldMapping[key] = sanitized;
            variables[sanitized] = parsedVal;

            // Also store base name without index
            const baseName = sanitized.replace(/_\d+$/, '');
            if (baseName !== sanitized) {
                fieldMapping[baseName] = sanitized;
                variables[baseName] = parsedVal;
            }

            console.log(`Field: "${key}" -> Sanitized: "${sanitized}" -> Base: "${baseName}" -> Value: ${parsedVal}`);
        });

        console.log("Field mapping:", fieldMapping);
        console.log("Available variables:", variables);

        // Parse the RHS expression and replace field names
        let expression = rhs;
        console.log("Starting expression:", expression);

        // Find all variable names in the expression (letters, numbers, underscores)
        const variableMatches = expression.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || [];
        console.log("Variables in expression:", variableMatches);

        // For each variable in the expression, find the corresponding field
        const uniqueVars = [...new Set(variableMatches)];

        uniqueVars.forEach(varName => {
            console.log(`\nProcessing variable: "${varName}"`);

            let replacementVar = null;
            let foundValue = 0;

            // Strategy 1: Check if variable exists as-is
            if (variables.hasOwnProperty(varName)) {
                replacementVar = varName;
                foundValue = variables[varName];
                console.log(`✓ Direct match: ${varName} = ${foundValue}`);
            }
            // Strategy 2: Try with current index
            else if (currentIndex) {
                const withIndex = varName + currentIndex;
                if (variables.hasOwnProperty(withIndex)) {
                    replacementVar = withIndex;
                    foundValue = variables[withIndex];
                    console.log(`✓ With index: ${varName} -> ${withIndex} = ${foundValue}`);

                    // Replace in expression
                    const regex = new RegExp(`\\b${varName}\\b`, 'g');
                    expression = expression.replace(regex, withIndex);
                    console.log(`Expression after replacement: ${expression}`);
                }
            }

            // Strategy 3: Look for similar named fields
            if (!replacementVar) {
                Object.keys(variables).forEach(availableVar => {
                    const baseVar = availableVar.replace(/_\d+$/, '');
                    if (baseVar.toLowerCase() === varName.toLowerCase()) {
                        replacementVar = availableVar;
                        foundValue = variables[availableVar];
                        console.log(`✓ Base match: ${varName} -> ${availableVar} = ${foundValue}`);

                        // Replace in expression
                        const regex = new RegExp(`\\b${varName}\\b`, 'g');
                        expression = expression.replace(regex, availableVar);
                        console.log(`Expression after replacement: ${expression}`);
                    }
                });
            }

            // If still not found, set to 0
            if (!replacementVar) {
                console.log(`⚠️ Variable "${varName}" not found, will be set to 0`);
                variables[varName] = 0;
            }
        });

        console.log("Final expression:", expression);
        console.log("Final variables:", variables);

        // Validate that expression doesn't contain any problematic characters
        if (expression.includes(',') && !expression.includes('(') && !expression.includes('[')) {
            console.error("Expression contains unexpected commas:", expression);
            return null;
        }

        // Get all unique variable names used in the final expression
        const finalVarNames = expression.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || [];
        const uniqueFinalVars = [...new Set(finalVarNames)];

        console.log("Final variables in expression:", uniqueFinalVars);

        // Ensure all variables exist
        uniqueFinalVars.forEach(varName => {
            if (!variables.hasOwnProperty(varName)) {
                console.log(`Adding missing variable: ${varName} = 0`);
                variables[varName] = 0;
            }
        });

        // Create the function with only the variables that are actually used
        const usedVarNames = uniqueFinalVars;
        const usedVarValues = usedVarNames.map(name => variables[name]);

        console.log("Creating function with variables:", usedVarNames);
        console.log("With values:", usedVarValues);
        console.log("Expression:", expression);

        const func = new Function(...usedVarNames, `return ${expression}`);
        const rawResult = func(...usedVarValues);

        console.log("Raw result:", rawResult);

        // Process result
        const resultValue = typeof rawResult === 'string' && rawResult.startsWith("'") && rawResult.endsWith("'")
            ? rawResult.slice(1, -1) : rawResult;

        console.log("Processed result:", resultValue);

        if (isNaN(resultValue)) {
            console.warn(`⚠️ Formula result is NaN`);
        }

        // Determine the target field name
        let targetFieldName = lhs.trim();
        console.log("Original target field from LHS:", targetFieldName);

        // Sanitize the target field name (replace spaces with underscores)
        const sanitizedTarget = targetFieldName.replace(/\s+/g, '_');
        console.log("Sanitized target:", sanitizedTarget);

        // Add the current index to the target field
        let targetWithIndex = sanitizedTarget;
        if (currentIndex) {
            targetWithIndex = sanitizedTarget + currentIndex;
            console.log("Target with index:", targetWithIndex);
        }

        // Try to find the actual field name in form data
        let actualTargetField = null;

        console.log("Searching for target field...");
        console.log("Looking for:", targetWithIndex);

        // Strategy 1: Look for exact match with index (prioritize this)
        Object.keys(formData).forEach(key => {
            if (key === targetWithIndex) {
                actualTargetField = key;
                console.log(`✓ Found exact match with index: ${key}`);
                return;
            }
        });

        // Strategy 2: Look for case-insensitive match with index
        if (!actualTargetField) {
            Object.keys(formData).forEach(key => {
                if (key.toLowerCase() === targetWithIndex.toLowerCase()) {
                    actualTargetField = key;
                    console.log(`✓ Found case-insensitive match with index: ${key}`);
                    return;
                }
            });
        }

        // Strategy 3: Look for sanitized match (handle spaces vs underscores)
        if (!actualTargetField) {
            Object.keys(formData).forEach(key => {
                const keySanitized = key.replace(/\s+/g, '_').trim();
                if (keySanitized.toLowerCase() === targetWithIndex.toLowerCase()) {
                    actualTargetField = key;
                    console.log(`✓ Found sanitized match with index: ${key}`);
                    return;
                }
            });
        }

        // Strategy 4: Look for fields with spaces instead of underscores
        if (!actualTargetField) {
            const targetWithSpaces = targetFieldName + (currentIndex || '');
            Object.keys(formData).forEach(key => {
                if (key === targetWithSpaces || key.toLowerCase() === targetWithSpaces.toLowerCase()) {
                    actualTargetField = key;
                    console.log(`✓ Found match with spaces: ${key}`);
                    return;
                }
            });
        }

        // If still not found, use the constructed name with index
        if (!actualTargetField) {
            actualTargetField = targetWithIndex;
            console.log(`⚠️ Target field not found in form data, will create: ${targetWithIndex}`);
        }

        console.log("Final target field that will be returned:", actualTargetField);
        console.log("=== END DEBUG ===\n");

        return {
            key: actualTargetField,
            value: resultValue
        };

    } catch (error) {
        console.error("=== FORMULA EVALUATION ERROR ===");
        console.error("Error:", error);
        console.error("Formula:", formula);
        console.error("Current field:", currentFieldName);
        console.error("=== END ERROR ===");
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
    const [dynamicOptions, setDynamicOptions] = useState({});
    const [categoryEntries, setCategoryEntries] = useState({});
    const [showLabourFields, setShowLabourFields] = useState(false);
    const [allCategories, setAllCategories] = useState([]);
    const [futureCategories, setFutureCategories] = useState([]);
    const [tableRows, setTableRows] = useState({}); // For dynamic table rows
    const [selectedFileTypes, setSelectedFileTypes] = useState({}); // Track file types per entry
    const [highlightedFields, setHighlightedFields] = useState([]);
    const [fileTypeEntries, setFileTypeEntries] = useState({}); // NEW: Track entries per file type

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

        axios.post('http://93.127.167.54/Surya_React/surya_dynamic_api/get_fields.php', submissionData)
            .then((res) => {
                const fetchedCategories = res.data;

                fetchedCategories.sort((a, b) => a.sequence - b.sequence);

                const clonedCategories = JSON.parse(JSON.stringify(fetchedCategories));
                clonedCategories.forEach(category1 => {
                    category1.fields = category1.fields.map(field1 => {
                        field1.field_label = field1.field_label || formatFieldName(field1.field_name);
                        field1.field_type = field1.field_type;

                        if (field1.options && typeof field1.options === 'string' && field1.options.trim() !== '') {
                            field1.options = field1.options.split(',').map(opt => opt.trim());
                        } else {
                            field1.options = Array.isArray(field1.options) ? field1.options : [];
                        }

                        field1.help_text = field1.help_text || '';
                        field1.readonly = field1.readonly || false;

                        return field1;
                    });
                });

                setFutureCategories(clonedCategories);

                fetchedCategories.forEach(category => {
                    if (category.id == 11) {
                        category.fields = category.fields
                            .filter(field => field.field_name.toLowerCase().includes('file_type'))
                            .map(field => {
                                if (field.options && typeof field.options === 'string' && field.options.trim() !== '') {
                                    field.options = field.options.split(',').map(opt => opt.trim());
                                } else {
                                    field.options = Array.isArray(field.options) ? field.options : [];
                                }
                                field.field_label = field.field_label || formatFieldName(field.field_name);
                                field.help_text = field.help_text || '';
                                field.readonly = field.readonly || false;
                                return field;
                            });
                    } else {
                        category.fields = category.fields.map(field => {
                            field.field_label = field.field_label || formatFieldName(field.field_name);
                            field.field_type = field.field_type;

                            if (field.options && typeof field.options === 'string' && field.options.trim() !== '') {
                                field.options = field.options.split(',').map(opt => opt.trim());
                            } else {
                                field.options = Array.isArray(field.options) ? field.options : [];
                            }

                            field.help_text = field.help_text || '';
                            field.readonly = field.readonly || false;

                            return field;
                        });
                    }

                    category.fieldsOriginal = [...category.fields];
                    category.fields.sort((a, b) => a.field_sequence - b.field_sequence);
                });

                setAllCategories(fetchedCategories);
                const initialFilteredCategories = filterCategoriesByLabourPreference(fetchedCategories, false);
                setCategories(initialFilteredCategories);

                const defaultForm = {};
                initialFilteredCategories.forEach(category => {
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
    }, [formattedTitle]);

    const filterCategoriesByLabourPreference = (allCats, showLabour) => {
        const filteredCategories = allCats.map(category => ({
            ...category,
            fields: category.fields.filter(field => {
                const groupValue = field.group ? field.group.trim().toLowerCase() : '';

                if (showLabour) {
                    return true;
                } else {
                    return groupValue !== 'labour';
                }
            })
        })).filter(category => category.fields && category.fields.length > 0);

        return filteredCategories;
    };

    const formatFieldName = (fieldName) => {
        return fieldName
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const addCategoryEntry = (categoryKey) => {
        const category = categories.find(cat => cat.category_key === categoryKey);
        if (!category || category.is_multiple !== 'yes') {
            return;
        }

        setCategoryEntries(prev => {
            const currentEntries = prev[categoryKey] || [0];
            const newIndex = Math.max(...currentEntries) + 1;
            const newEntries = [...currentEntries, newIndex];

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

    const removeCategoryEntry = (categoryKey, entryIndex) => {
        const category = categories.find(cat => cat.category_key === categoryKey);
        if (!category || category.is_multiple !== 'yes') {
            return;
        }

        setCategoryEntries(prev => {
            const currentEntries = prev[categoryKey] || [0];
            if (currentEntries.length <= 1) return prev;

            const newEntries = currentEntries.filter(index => index !== entryIndex);

            if (category.fields && Array.isArray(category.fields)) {
                setFormData(prevFormData => {
                    const newFormData = { ...prevFormData };
                    category.fields.forEach(field => {
                        delete newFormData[`${field.field_name}_${entryIndex}`];
                    });
                    return newFormData;
                });
            }

            // Also remove file type selection for this entry
            setSelectedFileTypes(prev => {
                const newSelected = { ...prev };
                delete newSelected[entryIndex.toString()];
                return newSelected;
            });

            // Remove table rows for this entry
            setTableRows(prev => {
                const newTableRows = { ...prev };
                Object.keys(newTableRows).forEach(key => {
                    if (key.includes(`_${entryIndex}`)) {
                        delete newTableRows[key];
                    }
                });
                return newTableRows;
            });

            // Remove file type entries for this main entry
            setFileTypeEntries(prev => {
                const newFileTypeEntries = { ...prev };
                Object.keys(newFileTypeEntries).forEach(key => {
                    if (key.includes(`_${entryIndex}`)) {
                        delete newFileTypeEntries[key];
                    }
                });
                return newFileTypeEntries;
            });

            return {
                ...prev,
                [categoryKey]: newEntries
            };
        });
    };

    // NEW: Add file type entry function
    // const addFileTypeEntry = (fileType, categoryKey, baseEntryIndex) => {
    //     const entryKey = `${fileType}_${baseEntryIndex}`;

    //     setFileTypeEntries(prev => {
    //         const currentEntries = prev[entryKey] || [0];
    //         const newIndex = Math.max(...currentEntries) + 1;
    //         const newEntries = [...currentEntries, newIndex];

    //         // Get fields for this file type
    //         const fileTypeFields = futureCategories
    //             .find(cat => cat.id == 11)?.fields
    //             .filter(field =>
    //                 field.group &&
    //                 field.group.toLowerCase() === fileType.toLowerCase() &&
    //                 !field.field_name.toLowerCase().includes('file_type')
    //             ) || [];

    //         // Add form data for new file type entry
    //         setFormData(prevFormData => {
    //             const newFormData = { ...prevFormData };
    //             fileTypeFields.forEach(field => {
    //                 const fieldKey = `${field.field_name}_${baseEntryIndex}_${fileType}_${newIndex}`;
    //                 newFormData[fieldKey] = field.field_type === 'checkbox' || field.field_type === 'multiselect' ? [] : '';
    //             });
    //             return newFormData;
    //         });

    //         return {
    //             ...prev,
    //             [entryKey]: newEntries
    //         };
    //     });
    // };

    const addFileTypeEntry = (fileType, categoryKey, baseEntryIndex) => {
        const entryKey = `${fileType}_${baseEntryIndex}`;

        setFileTypeEntries(prev => {
            const currentEntries = prev[entryKey] || [];

            // FIXED: Only add one entry if none exists
            if (currentEntries.length === 0) {
                const newEntries = [0]; // Start with index 0

                // Get fields for this file type
                const fileTypeFields = futureCategories
                    .find(cat => cat.id == 11)?.fields
                    .filter(field =>
                        field.group &&
                        field.group.toLowerCase() === fileType.toLowerCase() &&
                        !field.field_name.toLowerCase().includes('file_type')
                    ) || [];

                // Add form data for new file type entry
                setFormData(prevFormData => {
                    const newFormData = { ...prevFormData };
                    fileTypeFields.forEach(field => {
                        const fieldKey = `${field.field_name}_${baseEntryIndex}_${fileType}_0`;
                        newFormData[fieldKey] = field.field_type === 'checkbox' || field.field_type === 'multiselect' ? [] : '';
                    });
                    return newFormData;
                });

                return {
                    ...prev,
                    [entryKey]: newEntries
                };
            } else {
                // If entries already exist, add a new one with the next index
                const newIndex = Math.max(...currentEntries) + 1;
                const newEntries = [...currentEntries, newIndex];

                // Get fields for this file type
                const fileTypeFields = futureCategories
                    .find(cat => cat.id == 11)?.fields
                    .filter(field =>
                        field.group &&
                        field.group.toLowerCase() === fileType.toLowerCase() &&
                        !field.field_name.toLowerCase().includes('file_type')
                    ) || [];

                // Add form data for new file type entry
                setFormData(prevFormData => {
                    const newFormData = { ...prevFormData };
                    fileTypeFields.forEach(field => {
                        const fieldKey = `${field.field_name}_${baseEntryIndex}_${fileType}_${newIndex}`;
                        newFormData[fieldKey] = field.field_type === 'checkbox' || field.field_type === 'multiselect' ? [] : '';
                    });
                    return newFormData;
                });

                return {
                    ...prev,
                    [entryKey]: newEntries
                };
            }
        });
    };

    // NEW: Remove file type entry function
    const removeFileTypeEntry = (fileType, categoryKey, baseEntryIndex, fileTypeEntryIndex) => {
        const entryKey = `${fileType}_${baseEntryIndex}`;

        setFileTypeEntries(prev => {
            const currentEntries = prev[entryKey] || [0];
            if (currentEntries.length <= 1) return prev;

            const newEntries = currentEntries.filter(index => index !== fileTypeEntryIndex);

            // Remove form data for this file type entry
            const fileTypeFields = futureCategories
                .find(cat => cat.id == 11)?.fields
                .filter(field =>
                    field.group &&
                    field.group.toLowerCase() === fileType.toLowerCase() &&
                    !field.field_name.toLowerCase().includes('file_type')
                ) || [];

            setFormData(prevFormData => {
                const newFormData = { ...prevFormData };
                fileTypeFields.forEach(field => {
                    const fieldKey = `${field.field_name}_${baseEntryIndex}_${fileType}_${fileTypeEntryIndex}`;
                    delete newFormData[fieldKey];
                });
                return newFormData;
            });

            return {
                ...prev,
                [entryKey]: newEntries
            };
        });
    };

    // NEW: Show popup and handle file type entry addition
    const showAddFileTypePopup = (fileType, categoryKey, baseEntryIndex) => {
        const confirmed = window.confirm(`Do you want to add another ${fileType} file?`);
        if (confirmed) {
            addFileTypeEntry(fileType, categoryKey, baseEntryIndex);
        }
    };

    // Add table row function
    const addTableRow = (groupName) => {
        setTableRows(prev => {
            const currentRows = prev[groupName] || [0];
            const newIndex = Math.max(...currentRows) + 1;
            const newRows = [...currentRows, newIndex];

            // Add form data for new row
            setFormData(prevFormData => {
                const newFormData = { ...prevFormData };
                const groupFields = getFieldsByGroup(groupName.split('_')[0]); // Get base group name
                groupFields.forEach(field => {
                    newFormData[`${field.field_name}_${groupName.split('_')[1]}_${newIndex}`] = field.field_type === 'checkbox' || field.field_type === 'multiselect'
                        ? []
                        : '';
                });
                return newFormData;
            });

            return {
                ...prev,
                [groupName]: newRows
            };
        });
    };

    // Remove table row function
    const removeTableRow = (groupName, rowIndex) => {
        setTableRows(prev => {
            const currentRows = prev[groupName] || [0];
            if (currentRows.length <= 1) return prev;

            const newRows = currentRows.filter(index => index !== rowIndex);

            // Remove form data for this row
            setFormData(prevFormData => {
                const newFormData = { ...prevFormData };
                const groupFields = getFieldsByGroup(groupName.split('_')[0]); // Get base group name
                groupFields.forEach(field => {
                    delete newFormData[`${field.field_name}_${groupName.split('_')[1]}_${rowIndex}`];
                });
                return newFormData;
            });

            return {
                ...prev,
                [groupName]: newRows
            };
        });
    };

    // Get fields by group
    const getFieldsByGroup = (groupName) => {
        const allFields = [];
        futureCategories.forEach(category => {
            category.fields.forEach(field => {
                if (field.group && field.group.toLowerCase() === groupName.toLowerCase()) {
                    allFields.push(field);
                }
            });
        });
        return allFields;
    };

    const handleChange = (e, change_rule_id, entryIndex = 0) => {
        let name, value, type, checked;
        if (e?.target) {
            ({ name, value, type, checked } = e.target);
        } else {
            name = e.name;
            value = e.value;
            type = 'custom';
        }

        console.log("HandleChange called with:", { name, value, entryIndex });

        let newFormData = { ...formData };

        if (type === 'checkbox') {
            const current = newFormData[name] || [];
            newFormData[name] = checked
                ? [...current, value]
                : current.filter(item => item !== value);
        } else {
            newFormData[name] = value;
        }

        // Track file type selection PER ENTRY
        if (name.toLowerCase().includes('file_type')) {
            const entryKey = `${entryIndex}`;
            setSelectedFileTypes(prev => ({
                ...prev,
                [entryKey]: value.toLowerCase()
            }));
            console.log("File type updated:", value.toLowerCase(), "for entry:", entryIndex);
        }

        // FIXED: Check if this is the "Do you want to add Concerned Labour file" field
        const fieldNameLower = name.toLowerCase().replace(/\s+/g, '').replace(/_/g, '');
        console.log("Processed field name:", fieldNameLower);

        if (fieldNameLower.includes('doyouwanttoaddconcernedlabourfile') ||
            fieldNameLower.includes('concernedlabourfile') ||
            fieldNameLower.includes('addconcernedlabour')) {

            console.log("✅ Concerned Labour field detected:", name, "Value:", value);

            if (value && value.toLowerCase() === 'yes') {
                console.log("✅ User selected YES");

                // Get the current entry's file type
                const entryKey = `${entryIndex}`;
                const currentEntryFileType = selectedFileTypes[entryKey] || '';

                console.log("Current file type for entry", entryIndex, ":", currentEntryFileType);

                if (currentEntryFileType && currentEntryFileType.trim() !== '') {
                    console.log("✅ File type exists, showing popup");

                    // FIXED: Show popup with setTimeout to ensure state is updated first
                    setTimeout(() => {
                        const confirmed = window.confirm(`Do you want to add another ${currentEntryFileType.toUpperCase()} file for concerned labour?`);
                        if (confirmed) {
                            console.log("✅ User confirmed, adding additional file entry");
                            addFileTypeEntry(currentEntryFileType.toLowerCase(), 'uploads', entryIndex);
                        } else {
                            console.log("❌ User cancelled");
                            // Reset the radio button to 'No' if user cancels
                            setFormData(prev => ({
                                ...prev,
                                [name]: 'No'
                            }));
                        }
                    }, 100);
                } else {
                    console.log("❌ No file type selected");
                    setTimeout(() => {
                        alert('Please select a file type first before adding concerned labour files.');
                        // Reset the radio button to 'No'
                        setFormData(prev => ({
                            ...prev,
                            [name]: 'No'
                        }));
                    }, 100);
                }
            }
        }

        // Rest of your existing handleChange logic remains the same...
        const originalFieldNameLower = name.toLowerCase();
        if (originalFieldNameLower.includes('concerned') && originalFieldNameLower.includes('labour') &&
            !originalFieldNameLower.includes('file')) {
            const shouldShowLabour = value.toLowerCase() === 'yes';
            setShowLabourFields(shouldShowLabour);

            const updatedCategories = filterCategoriesByLabourPreference(allCategories, shouldShowLabour);
            setCategories(updatedCategories);

            if (shouldShowLabour) {
                allCategories.forEach(category => {
                    category.fields.forEach(field => {
                        const groupValue = field.group ? field.group.trim().toLowerCase() : '';
                        if (groupValue === 'labour' && !newFormData.hasOwnProperty(field.field_name)) {
                            newFormData[field.field_name] = field.field_type === 'checkbox' || field.field_type === 'multiselect'
                                ? []
                                : '';
                        }
                    });
                });
            } else {
                allCategories.forEach(category => {
                    category.fields.forEach(field => {
                        const groupValue = field.group ? field.group.trim().toLowerCase() : '';
                        if (groupValue === 'labour') {
                            delete newFormData[field.field_name];
                        }
                    });
                });
            }
        }

        // Execute rules logic (your existing code)
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
                        const variables = {};
                        const varNameToOriginalKey = {};

                        Object.keys(newFormData).forEach(key => {
                            const sanitized = key.trim().replace(/\s+/g, '_');
                            variables[sanitized] = parseFloat(newFormData[key]) || 0;
                            varNameToOriginalKey[sanitized] = key;
                        });

                        allRuleResults.forEach(ruleResult => {
                            const { to_set, data: values, formulla, triggerFields, showHideFormulla, highlighted_fields } = ruleResult;

                            // Handle highlighted fields
                            if (highlighted_fields && typeof highlighted_fields === 'string') {
                                const fieldsArray = highlighted_fields.split(',').map(field => field.trim().toLowerCase());
                                setHighlightedFields(fieldsArray);
                            }

                            if (formulla) {
                                const formulaResult = evaluateFormula(formulla, newFormData, name);
                                console.log("formulaResult", formulaResult);

                                if (formulaResult) {
                                    let { key: resultKey, value: resultValue } = formulaResult;
                                    console.log(`Formula result: ${resultKey} = ${resultValue}`);

                                    let matchedKey = null;

                                    if (newFormData.hasOwnProperty(resultKey)) {
                                        matchedKey = resultKey;
                                    } else {
                                        Object.keys(newFormData).forEach(key => {
                                            if (key.toLowerCase() === resultKey.toLowerCase()) {
                                                matchedKey = key;
                                            }
                                        });
                                    }

                                    if (!matchedKey) {
                                        const resultKeySanitized = resultKey.replace(/\s+/g, '_').toLowerCase();
                                        matchedKey = Object.keys(newFormData).find(k => {
                                            const kSanitized = k.trim().replace(/\s+/g, '_').toLowerCase();
                                            return kSanitized === resultKeySanitized;
                                        });
                                    }

                                    if (!matchedKey) {
                                        const resultBase = resultKey.replace(/_\d+$/, '').replace(/\s+/g, '_').toLowerCase();
                                        const resultIndexMatch = resultKey.match(/_(\d+)$/);
                                        const resultIndex = resultIndexMatch ? resultIndexMatch[0] : '';

                                        Object.keys(newFormData).forEach(key => {
                                            const keyBase = key.replace(/_\d+$/, '').replace(/\s+/g, '_').toLowerCase();
                                            const keyIndexMatch = key.match(/_(\d+)$/);
                                            const keyIndex = keyIndexMatch ? keyIndexMatch[0] : '';

                                            if (keyBase === resultBase && keyIndex === resultIndex) {
                                                matchedKey = key;
                                            }
                                        });
                                    }

                                    if (matchedKey) {
                                        newFormData[matchedKey] = resultValue;
                                    } else {
                                        newFormData[resultKey] = resultValue;
                                    }

                                    if (resultKey.toLowerCase().includes('accordion_to_show')) {
                                        const accordionToShow = `${resultValue}`;
                                        setCategoryEntries(prev => ({
                                            ...prev,
                                            [accordionToShow]: prev[accordionToShow] || [0]
                                        }));
                                        setActiveKey(accordionToShow);
                                    }
                                }
                            } else if (showHideFormulla) {
                                // FIXED: Don't update categories here to prevent duplicate sections
                                // Just track the file type selection, the fields will show based on selectedFileTypes

                                // Initialize table rows for AMC type only
                                const entryKey = `${entryIndex}`;
                                const currentEntryFileType = selectedFileTypes[entryKey] || value.toLowerCase();

                                if (currentEntryFileType === 'amc') {
                                    const groupFields = getFieldsByGroup(currentEntryFileType);
                                    if (groupFields.length > 0) {
                                        const tableKey = `${currentEntryFileType}_${entryIndex}`;
                                        setTableRows(prev => ({
                                            ...prev,
                                            [tableKey]: prev[tableKey] || [0]
                                        }));

                                        setFormData(prevFormData => {
                                            const newFormData = { ...prevFormData };
                                            groupFields.forEach(field => {
                                                const fieldKey = `${field.field_name}_${entryIndex}_0`;
                                                if (!newFormData.hasOwnProperty(fieldKey)) {
                                                    newFormData[fieldKey] = field.field_type === 'checkbox' || field.field_type === 'multiselect'
                                                        ? []
                                                        : '';
                                                }
                                            });
                                            return newFormData;
                                        });
                                    }
                                }
                            } else if (Array.isArray(values)) {
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
                })
                .catch(err => {
                    console.error("Error executing rule:", err);
                });
        }
        setFormData(newFormData);
    };

    const isFieldHighlighted = (fieldName) => {
        return highlightedFields.some(highlightedField =>
            fieldName.toLowerCase().includes(highlightedField) ||
            highlightedField.includes(fieldName.toLowerCase())
        );
    };

    const handleReset = () => {
        const resetForm = {};
        const resetEntries = {};

        categories.forEach(category => {
            resetEntries[category.category_key] = [0];
            if (category.fields && Array.isArray(category.fields)) {
                category.fields.forEach(field => {
                    resetForm[`${field.field_name}_0`] = field.field_type === 'checkbox' || field.field_type === 'multiselect' ? [] : '';
                });
            }
        });

        setFormData(resetForm);
        setCategoryEntries(resetEntries);
        setTableRows({});
        setSelectedFileTypes({});
        setFileTypeEntries({}); // Reset file type entries
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { billingaddress, shippingaddress, ...rest } = formData;
        const billing_add = formData.billingaddress;
        const shipping_add = formData.shippingaddress;

        const submissionData = {
            type: "insert",
            table: "submitted_forms",
            form_name: formattedTitle,
            insert_array: [
                {
                    form_data: {
                        ...rest,
                        form_name: formattedTitle
                    }
                }
            ]
        };

        axios.post('http://93.127.167.54/Surya_React/surya_dynamic_api/insertData.php', submissionData)
            .then(res => {
                let insert_id = res.data.insert_id;

                const submissionData1 = {
                    type: "insert_multiple",
                    table: "submitted_forms",
                    form_name: formattedTitle,
                    insert_array: [
                        {
                            form_data: {
                                ...rest,
                                form_name: shipping_add
                            },
                            ref_id: insert_id
                        }
                    ]
                };

                axios.post('http://93.127.167.54/Surya_React/surya_dynamic_api/insertData.php', submissionData1)
                    .then(res1 => {
                        const submissionData2 = {
                            type: "insert_multiple",
                            table: "submitted_forms",
                            form_name: formattedTitle,
                            insert_array: [
                                {
                                    form_data: {
                                        ...rest,
                                        form_name: billing_add
                                    },
                                    ref_id: insert_id
                                }
                            ]
                        };

                        axios.post('http://93.127.167.54/Surya_React/surya_dynamic_api/insertData.php', submissionData2)
                            .then(res2 => {
                                toast.success('Form submitted successfully');
                            })
                            .catch(err => {
                                console.error('Error submitting form:', err);
                                toast.error('Error submitting form');
                            });
                    })
                    .catch(err => {
                        console.error('Error submitting form:', err);
                        toast.error('Error submitting form');
                    });
            })
            .catch(err => {
                console.error('Error submitting form:', err);
                toast.error('Error submitting form');
            });
    };

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    // Render table for grouped fields - ONLY for AMC type
    const renderTable = (groupName, groupFields) => {
        const rows = tableRows[groupName] || [0];
        const darkModeClasses = theme === 'dark' ? 'table-dark' : '';
        const entryIndex = groupName.split('_')[1]; // Extract entry index from groupName

        return (
            <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0 fw-bold text-capitalize">
                        {groupName.split('_')[0]} Details - Entry #{parseInt(entryIndex) + 1}
                    </h6>
                    <Button
                        variant={theme === 'dark' ? 'outline-info' : 'primary'}
                        size="sm"
                        onClick={() => addTableRow(groupName)}
                        className="d-flex align-items-center gap-1"
                    >
                        <i className="bi bi-plus-circle"></i>
                        Add Row
                    </Button>
                </div>

                <div className="table-responsive">
                    <Table striped bordered hover className={darkModeClasses}>
                        <thead>
                            <tr>
                                <th style={{ width: '50px' }}>#</th>
                                {groupFields.map((field, idx) => (
                                    <th key={idx}>{field.field_label}</th>
                                ))}
                                <th style={{ width: '80px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((rowIndex, idx) => (
                                <tr key={rowIndex}>
                                    <td className="text-center fw-bold">{idx + 1}</td>
                                    {groupFields.map((field, fieldIdx) => (
                                        <td key={fieldIdx} style={{ minWidth: '150px' }}>
                                            {renderTableField(field, entryIndex, rowIndex)}
                                        </td>
                                    ))}
                                    <td className="text-center">
                                        {rows.length > 1 && (
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => removeTableRow(groupName, rowIndex)}
                                                title="Remove Row"
                                            >
                                                <i className="bi bi-trash3"></i>
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </div>
        );
    };

    // Render field inside table
    const renderTableField = (field, entryIndex = 0, rowIndex = 0) => {
        const fieldKey = `${field.field_name}_${entryIndex}_${rowIndex}`;

        if (field.field_type === 'select') {
            return (
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
                        handleChange(event, field.change_rule_id, entryIndex);
                    }}
                    options={(() => {
                        const staticOptions = field.options?.map(opt => ({ value: opt, label: opt })) || [];

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
                                break;
                            }
                        }

                        return [...staticOptions, ...dynamicOptionsArray];
                    })()}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder={`Select ${field.field_label}...`}
                    styles={{
                        control: (base) => ({
                            ...base,
                            minHeight: '35px',
                            fontSize: '14px',
                            backgroundColor: theme === 'dark' ? '#343a40' : '#fff',
                            borderColor: theme === 'dark' ? '#495057' : '#ced4da'
                        }),
                        menu: (base) => ({
                            ...base,
                            backgroundColor: theme === 'dark' ? '#343a40' : '#fff',
                            zIndex: 9999
                        }),
                        option: (base, state) => ({
                            ...base,
                            backgroundColor: state.isFocused
                                ? (theme === 'dark' ? '#495057' : '#e7f1ff')
                                : 'transparent',
                            color: theme === 'dark' ? '#fff' : '#000'
                        })
                    }}
                />
            );
        } else if (field.field_type === 'textarea') {
            return (
                <Form.Control
                    as="textarea"
                    rows={2}
                    name={fieldKey}
                    value={formData[fieldKey] || ''}
                    onChange={(e) => {
                        const event = {
                            name: fieldKey,
                            value: e.target.value
                        };
                        handleChange(event, field.change_rule_id, entryIndex);
                    }}
                    readOnly={field.readonly}
                    className="form-control-sm"
                    style={{ fontSize: '14px' }}
                />
            );
        } else {
            return (
                <Form.Control
                    type={field.field_type}
                    name={fieldKey}
                    value={formData[fieldKey] || ''}
                    onChange={(e) => {
                        const event = {
                            name: fieldKey,
                            value: e.target.value
                        };
                        handleChange(event, field.change_rule_id, entryIndex);
                    }}
                    readOnly={field.readonly}
                    className="form-control-sm"
                    style={{ fontSize: '14px' }}
                />
            );
        }
    };

    const renderField = (field, entryIndex = 0) => {
        const fieldKey = `${field.field_name}_${entryIndex}`;
        const darkModeClasses = theme === 'dark' ? 'bg-dark text-light border-secondary' : '';

        return (
            <Form.Group className="mb-3 position-relative" key={fieldKey}>
                <Form.Label className={`fw-bold ${theme === 'dark' ? 'text-light' : ''}`}>
                    {field.field_label}
                </Form.Label>

                {field.field_type === 'text' && (
                    <Form.Control
                        type={field.field_type}
                        name={fieldKey}
                        value={formData[fieldKey] || ''}
                        onChange={(e) => {
                            const event = {
                                name: `${field.field_name}_${entryIndex}`,
                                value: e.target.value,
                            };
                            handleChange(event, field.change_rule_id, entryIndex);
                        }}
                        className={`shadow-sm ${darkModeClasses}`}
                        disabled={field.readonly}
                    />
                )}

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
                            handleChange(event, field.change_rule_id, entryIndex);
                        }}
                        options={(() => {
                            const staticOptions = field.options?.map(opt => ({ value: opt, label: opt })) || [];

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
                            }),
                            singleValue: (base) => ({
                                ...base,
                                color: theme === 'dark' ? '#fff' : '#000'
                            }),
                            placeholder: (base) => ({
                                ...base,
                                color: theme === 'dark' ? '#adb5bd' : '#6c757d'
                            })
                        }}
                    />
                )}

                {field.field_type === 'multiselect' && (
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
                        }}
                        className="react-select-container mb-2"
                        classNamePrefix="react-select"
                        placeholder={`Search and select ${field.field_label}...`}
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
                        }}
                    />
                )}

                {field.field_type === 'textarea' && (
                    <Form.Control
                        as="textarea"
                        rows={3}
                        name={fieldKey}
                        value={formData[fieldKey] || ''}
                        onChange={(e) => {
                            const event = {
                                name: fieldKey,
                                value: e.target.value
                            };
                            handleChange(event, field.change_rule_id, entryIndex);
                        }}
                        readOnly={field.readonly}
                        className={`shadow-sm ${darkModeClasses}`}
                        placeholder={`Enter ${field.field_label.toLowerCase()} here...`}
                    />
                )}

                {field.field_type === 'password' && (
                    <div className="position-relative">
                        <Form.Control
                            type={passwordVisibility[fieldKey] ? 'text' : 'password'}
                            name={fieldKey}
                            value={formData[fieldKey] || ''}
                            onChange={(e) => {
                                const event = {
                                    name: fieldKey,
                                    value: e.target.value
                                };
                                handleChange(event, field.change_rule_id, entryIndex);
                            }}
                            readOnly={field.readonly}
                            className={`shadow-sm pe-5 ${darkModeClasses}`}
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
                )}

                {field.field_type === 'radio' && (
                    <div className="d-flex flex-wrap gap-3 mt-2">
                        {field.options?.map((opt, idx) => (
                            <Form.Check
                                key={idx}
                                type="radio"
                                label={opt}
                                name={fieldKey}
                                value={opt}
                                checked={formData[fieldKey] === opt}
                                onChange={(e) => {
                                    const event = {
                                        name: fieldKey,
                                        value: e.target.value
                                    };
                                    handleChange(event, field.change_rule_id, entryIndex);
                                }}
                                className={`me-3 ${theme === 'dark' ? 'text-light' : ''}`}
                                id={`${fieldKey}-${idx}`}
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
                                name={fieldKey}
                                value={opt}
                                checked={formData[fieldKey]?.includes(opt)}
                                onChange={(e) => {
                                    const event = {
                                        target: {
                                            name: fieldKey,
                                            value: opt,
                                            type: 'checkbox',
                                            checked: e.target.checked
                                        }
                                    };
                                    handleChange(event, field.change_rule_id, entryIndex);
                                }}
                                className={`me-3 ${theme === 'dark' ? 'text-light' : ''}`}
                                id={`${fieldKey}-${idx}`}
                                disabled={field.readonly}
                            />
                        ))}
                    </div>
                )}

                {field.field_type === 'file' && (
                    <Form.Control
                        type="file"
                        name={fieldKey}
                        onChange={(e) => {
                            const event = {
                                name: fieldKey,
                                value: e.target.value
                            };
                            handleChange(event, field.change_rule_id, entryIndex);
                        }}
                        className={`shadow-sm ${darkModeClasses}`}
                        disabled={field.readonly}
                    />
                )}

                {['select', 'multiselect', 'textarea', 'password', 'radio', 'checkbox', 'file', 'text'].indexOf(field.field_type) === -1 && (
                    <Form.Control
                        type={field.field_type}
                        name={fieldKey}
                        value={formData[fieldKey] || ''}
                        onChange={(e) => {
                            const event = {
                                name: fieldKey,
                                value: e.target.value
                            };
                            handleChange(event, field.change_rule_id, entryIndex);
                        }}
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

    // NEW: Render field with custom key for file type entries
    // Render field with custom key for file type entries (already in your code)
    const renderFieldWithCustomKey = (field, entryIndex, fileTypeEntryIndex, fileType) => {
        const fieldKey = `${field.field_name}_${entryIndex}_${fileType}_${fileTypeEntryIndex}`;
        const darkModeClasses = theme === 'dark' ? 'bg-dark text-light border-secondary' : '';

        return (
            <Form.Group className="mb-3 position-relative" key={fieldKey}>
                <Form.Label className={`fw-bold ${theme === 'dark' ? 'text-light' : ''}`}>
                    {field.field_label}
                </Form.Label>

                {field.field_type === 'text' && (
                    <Form.Control
                        type={field.field_type}
                        name={fieldKey}
                        value={formData[fieldKey] || ''}
                        onChange={(e) => {
                            const event = {
                                name: fieldKey,
                                value: e.target.value,
                            };
                            handleChange(event, field.change_rule_id, entryIndex);
                        }}
                        className={`shadow-sm ${darkModeClasses}`}
                        disabled={field.readonly}
                    />
                )}

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
                            handleChange(event, field.change_rule_id, entryIndex);
                        }}
                        options={field.options?.map(opt => ({ value: opt, label: opt })) || []}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        placeholder={`Select ${field.field_label}...`}
                        styles={{
                            control: (base) => ({
                                ...base,
                                backgroundColor: theme === 'dark' ? '#343a40' : '#fff',
                                borderColor: theme === 'dark' ? '#495057' : '#ced4da'
                            }),
                            menu: (base) => ({
                                ...base,
                                backgroundColor: theme === 'dark' ? '#343a40' : '#fff',
                                zIndex: 9999
                            }),
                            option: (base, state) => ({
                                ...base,
                                backgroundColor: state.isFocused
                                    ? (theme === 'dark' ? '#495057' : '#e7f1ff')
                                    : 'transparent',
                                color: theme === 'dark' ? '#fff' : '#000'
                            })
                        }}
                    />
                )}

                {field.field_type === 'textarea' && (
                    <Form.Control
                        as="textarea"
                        rows={3}
                        name={fieldKey}
                        value={formData[fieldKey] || ''}
                        onChange={(e) => {
                            const event = {
                                name: fieldKey,
                                value: e.target.value
                            };
                            handleChange(event, field.change_rule_id, entryIndex);
                        }}
                        readOnly={field.readonly}
                        className={`shadow-sm ${darkModeClasses}`}
                        placeholder={`Enter ${field.field_label.toLowerCase()} here...`}
                    />
                )}

                {field.field_type === 'radio' && (
                    <div className="d-flex flex-wrap gap-3 mt-2">
                        {field.options?.map((opt, idx) => (
                            <Form.Check
                                key={idx}
                                type="radio"
                                label={opt}
                                name={fieldKey}
                                value={opt}
                                checked={formData[fieldKey] === opt}
                                onChange={(e) => {
                                    const event = {
                                        name: fieldKey,
                                        value: e.target.value
                                    };
                                    handleChange(event, field.change_rule_id, entryIndex);
                                }}
                                className={`me-3 ${theme === 'dark' ? 'text-light' : ''}`}
                                id={`${fieldKey}-${idx}`}
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
                                name={fieldKey}
                                value={opt}
                                checked={formData[fieldKey]?.includes(opt)}
                                onChange={(e) => {
                                    const event = {
                                        target: {
                                            name: fieldKey,
                                            value: opt,
                                            type: 'checkbox',
                                            checked: e.target.checked
                                        }
                                    };
                                    handleChange(event, field.change_rule_id, entryIndex);
                                }}
                                className={`me-3 ${theme === 'dark' ? 'text-light' : ''}`}
                                id={`${fieldKey}-${idx}`}
                                disabled={field.readonly}
                            />
                        ))}
                    </div>
                )}

                {field.field_type === 'file' && (
                    <Form.Control
                        type="file"
                        name={fieldKey}
                        onChange={(e) => {
                            const event = {
                                name: fieldKey,
                                value: e.target.value
                            };
                            handleChange(event, field.change_rule_id, entryIndex);
                        }}
                        className={`shadow-sm ${darkModeClasses}`}
                        disabled={field.readonly}
                    />
                )}

                {['select', 'multiselect', 'textarea', 'password', 'radio', 'checkbox', 'file', 'text'].indexOf(field.field_type) === -1 && (
                    <Form.Control
                        type={field.field_type}
                        name={fieldKey}
                        value={formData[fieldKey] || ''}
                        onChange={(e) => {
                            const event = {
                                name: fieldKey,
                                value: e.target.value
                            };
                            handleChange(event, field.change_rule_id, entryIndex);
                        }}
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

    // MISSING PART: Render file type entries section
    // const renderFileTypeEntries = (category, entryIndex, currentEntryFileType) => {
    //     if (!currentEntryFileType || category.id != 11) return null;

    //     const entryKey = `${currentEntryFileType}_${entryIndex}`;
    //     const fileTypeEntryIndices = fileTypeEntries[entryKey] || [];

    //     // FIXED: Only show if there are additional entries (more than just the base entry)
    //     if (fileTypeEntryIndices.length === 0) return null;

    //     // Get fields for this file type
    //     const fileTypeFields = futureCategories
    //         .find(cat => cat.id == 11)?.fields
    //         .filter(field =>
    //             field.group &&
    //             field.group.toLowerCase() === currentEntryFileType.toLowerCase() &&
    //             !field.field_name.toLowerCase().includes('file_type')
    //         ) || [];

    //     if (fileTypeFields.length === 0) return null;

    //     return (
    //         <div className="mt-4">
    //             <h6 className="fw-bold mb-3 text-capitalize">
    //                 Additional {currentEntryFileType} Files
    //             </h6>

    //             {fileTypeEntryIndices.map((fileTypeEntryIndex, idx) => (
    //                 <div key={`${entryKey}_${fileTypeEntryIndex}`} className="mb-4 p-3 rounded"
    //                     style={{
    //                         backgroundColor: theme === 'dark' ? '#2c3034' : '#f8f9fa',
    //                         border: `1px solid ${theme === 'dark' ? '#495057' : '#dee2e6'}`
    //                     }}>

    //                     <div className="d-flex justify-content-between align-items-center mb-3">
    //                         <h7 className="mb-0 fw-bold text-capitalize">
    //                             Additional {currentEntryFileType} File #{idx + 1}
    //                         </h7>
    //                         <Button
    //                             variant="outline-danger"
    //                             size="sm"
    //                             onClick={() => removeFileTypeEntry(currentEntryFileType, category.category_key, entryIndex, fileTypeEntryIndex)}
    //                             className="d-flex align-items-center gap-1"
    //                         >
    //                             <i className="bi bi-trash3"></i>
    //                             Remove
    //                         </Button>
    //                     </div>

    //                     <Row>
    //                         {fileTypeFields.map((field, fieldIndex) => (
    //                             <Col md={4} key={`${field.field_name}_${entryIndex}_${currentEntryFileType}_${fileTypeEntryIndex}`}>
    //                                 {renderFieldWithCustomKey(field, entryIndex, fileTypeEntryIndex, currentEntryFileType)}
    //                             </Col>
    //                         ))}
    //                     </Row>
    //                 </div>
    //             ))}
    //         </div>
    //     );
    // };

    const renderFileTypeEntries = (category, entryIndex, currentEntryFileType) => {
        if (!currentEntryFileType || category.id != 11) return null;

        const entryKey = `${currentEntryFileType}_${entryIndex}`;
        const fileTypeEntryIndices = fileTypeEntries[entryKey] || [];

        // FIXED: Show entries if they exist (remove the length === 0 check)
        if (fileTypeEntryIndices.length === 0) return null;

        // Get fields for this file type
        const fileTypeFields = futureCategories
            .find(cat => cat.id == 11)?.fields
            .filter(field =>
                field.group &&
                field.group.toLowerCase() === currentEntryFileType.toLowerCase() &&
                !field.field_name.toLowerCase().includes('file_type')
            ) || [];

        if (fileTypeFields.length === 0) return null;

        return (
            <div className="mt-4">
                <h6 className="fw-bold mb-3 text-capitalize">
                    Concerned Labour {currentEntryFileType.toUpperCase()} Files
                </h6>

                {fileTypeEntryIndices.map((fileTypeEntryIndex, idx) => (
                    <div key={`${entryKey}_${fileTypeEntryIndex}`} className="mb-4 p-3 rounded"
                        style={{
                            backgroundColor: theme === 'dark' ? '#2c3034' : '#f8f9fa',
                            border: `1px solid ${theme === 'dark' ? '#495057' : '#dee2e6'}`
                        }}>

                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h7 className="mb-0 fw-bold text-capitalize">
                                Concerned Labour {currentEntryFileType.toUpperCase()} File #{idx + 1}
                            </h7>
                            <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => removeFileTypeEntry(currentEntryFileType, category.category_key, entryIndex, fileTypeEntryIndex)}
                                className="d-flex align-items-center gap-1"
                            >
                                <i className="bi bi-trash3"></i>
                                Remove
                            </Button>
                        </div>

                        <Row>
                            {fileTypeFields.map((field, fieldIndex) => (
                                <Col md={4} key={`${field.field_name}_${entryIndex}_${currentEntryFileType}_${fileTypeEntryIndex}`}>
                                    {renderFieldWithCustomKey(field, entryIndex, fileTypeEntryIndex, currentEntryFileType)}
                                </Col>
                            ))}
                        </Row>
                    </div>
                ))}
            </div>
        );
    };

    // Helper function to get non-grouped fields and conditional grouped fields
    const getNonGroupedFields = (fields, currentEntryFileType, entryIndex) => {
        return fields.filter(field => {
            // Always show file_type fields
            if (field.field_name.toLowerCase().includes('file_type')) {
                return true;
            }

            // For fields without group, always show them
            if (!field.group) {
                return true;
            }

            // FIXED: Don't show grouped fields here - they will be handled separately
            // This prevents duplicate field rendering
            return false;
        });
    };

    // Helper function to get highlighted fields for form rendering
    const getHighlightedFieldsForForm = (categoryId, fileType, entryIndex) => {
        if (categoryId == 11 && fileType === 'amc') {
            // For AMC type, show only highlighted fields as regular form fields
            return futureCategories
                .find(cat => cat.id == categoryId)?.fields
                .filter(field => {
                    const isHighlighted = isFieldHighlighted(field.field_name);
                    const isGroupedField = field.group && field.group.toLowerCase() === fileType.toLowerCase();
                    return isHighlighted && isGroupedField && !field.field_name.toLowerCase().includes('file_type');
                }) || [];
        }
        return [];
    };

    // Helper function to get grouped fields
    const getGroupedFields = (categoryId) => {
        const category = futureCategories.find(cat => cat.id == categoryId);
        if (!category) return null;

        const grouped = {};
        category.fields.forEach(field => {
            if (field.group && !field.field_name.toLowerCase().includes('file_type')) {
                const groupName = field.group.toLowerCase();
                if (!grouped[groupName]) {
                    grouped[groupName] = [];
                }
                grouped[groupName].push(field);
            }
        });

        return grouped;
    };

    // Theme styles object
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
            maxWidth: '100%',
            width: '100%',
            border: `1px solid ${themeStyles.borderColor}`,
        },
        accordionStyles: {
            backgroundColor: themeStyles.accordionBg,
            borderRadius: '8px',
            marginBottom: '0.75rem',
            border: `1px solid ${themeStyles.borderColor}`,
            overflow: 'hidden',
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

    if (loading) {
        return (
            <Container className="mt-5 text-center">
                <Spinner animation="border" role="status" variant={theme === 'dark' ? 'light' : 'primary'}>
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className={`mt-3 ${theme === 'dark' ? 'text-light' : ''}`}>Loading form...</p>
            </Container>
        );
    }

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
                                            color: 'white'
                                        }}
                                    >
                                        {formattedTitle}
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
                                                        <Badge
                                                            bg={theme === 'dark' ? 'info' : 'primary'}
                                                            className="me-2"
                                                        >
                                                            {categoryIndex + 1}
                                                        </Badge>
                                                        <span className="fw-bold">
                                                            {category.category_label || formatFieldName(category.category_key)}
                                                        </span>
                                                        {category.is_multiple === 'yes' && (
                                                            <Badge bg={theme === 'dark' ? 'secondary' : 'success'} className="ms-2">
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
                                                    {(categoryEntries[category.category_key] || [0]).map((entryIndex, idx) => {
                                                        const entryKey = `${entryIndex}`;
                                                        const currentEntryFileType = selectedFileTypes[entryKey] || '';

                                                        return (
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
                                                                    {getNonGroupedFields(category.fields, currentEntryFileType, entryIndex).map((field, fieldIndex) => (
                                                                        <Col md={4} key={field.field_name}>
                                                                            {renderField(field, entryIndex)}
                                                                        </Col>
                                                                    ))}
                                                                </Row>

                                                                {currentEntryFileType && (
                                                                    <Row>
                                                                        {category.id == 11 && (() => {
                                                                            if (currentEntryFileType.toLowerCase() === 'amc') {
                                                                                return getHighlightedFieldsForForm(category.id, currentEntryFileType, entryIndex).map((field, fieldIndex) => (
                                                                                    <Col md={4} key={field.field_name}>
                                                                                        {renderField(field, entryIndex)}
                                                                                    </Col>
                                                                                ));
                                                                            } else {
                                                                                const groupedFields = getGroupedFields(category.id);
                                                                                if (groupedFields) {
                                                                                    return Object.entries(groupedFields).map(([groupName, groupFields]) => {
                                                                                        if (groupName === currentEntryFileType.toLowerCase()) {
                                                                                            return groupFields.map((field, fieldIndex) => (
                                                                                                <Col md={4} key={field.field_name}>
                                                                                                    {renderField(field, entryIndex)}
                                                                                                </Col>
                                                                                            ));
                                                                                        }
                                                                                        return null;
                                                                                    });
                                                                                }
                                                                            }
                                                                            return null;
                                                                        })()}
                                                                    </Row>
                                                                )}

                                                                {renderFileTypeEntries(category, entryIndex, currentEntryFileType)}

                                                                {category.id == 11 && currentEntryFileType === 'amc' && getGroupedFields(category.id) &&
                                                                    Object.entries(getGroupedFields(category.id)).map(([groupName, groupFields]) => {
                                                                        if (groupName === currentEntryFileType.toLowerCase()) {
                                                                            const tableKey = `${groupName}_${entryIndex}`;
                                                                            return (
                                                                                <div key={tableKey}>
                                                                                    {renderTable(tableKey, groupFields)}
                                                                                </div>
                                                                            );
                                                                        }
                                                                        return null;
                                                                    })}
                                                            </div>
                                                        );
                                                    })}

                                                    {category.is_multiple === 'yes' && (
                                                        <div className="text-center mt-4">
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
                                            Submit
                                        </Button>
                                        <Button
                                            variant={themeStyles.buttonSecondary}
                                            type="button"
                                            size="sm"
                                            className="px-4 shadow-sm"
                                            onClick={handleReset}
                                            style={{ fontFamily: "'Maven Pro', sans-serif" }}
                                        >
                                            Reset
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