// --- Global Constant for Default Settings ---
const DEFAULT_SETTINGS = {
    modalContainerBorderRadius: 30,
    mainHeaderTextColor: "#0A4D8C",
    salePriceTextColor: "#DB232D",
    successColor: "#22A958",
    attentionColor: "#D6232D",
    warningColor: "#FF7B00",
    outOfStockBadgeColor: "#FF7800",
    primaryButtonBackgroundColor: "#0A4D8C",
    primaryButtonTextColor: "#FFFFFF",
    primaryButtonBorderColor: "#FFFFFF",
    secondaryButtonBackgroundColor: "#D9D9D9",
    secondaryButtonTextColor: "#0A4D8C",
    secondaryButtonBorderColor: "#FFFFFF",
    buttonBorderRadius: 8,
    buttonBorderWidth: 0,
    disclaimerText: "Please ensure all items and quantities are correct.",
    productUnavailableMessageColor: "#D6232D",
    productUnavailableMessage: "This item is currently unavailable.",
    alternateProductMessageColor: "#0A4D8C",
    alternateProductMessage: "The item you selected previously is unavailable. We’ve found this item for you instead.",
};

// Settings object to store current values (Initialized from defaults)
let settings = {...DEFAULT_SETTINGS};

// =========================================================================
// UTILITY FUNCTIONS
// =========================================================================

/**
 * Converts any valid CSS color string (name, RGB, HSL, hex variants)
 * into a 7-character hex code (#RRGGBB) using custom normalization rules.
 * @param {string} colorString - The user-input color string.
 * @returns {string|null} The 7-character hex code (or null if conversion fails).
 */
function convertToHex(colorString) {
    if (!colorString || typeof colorString !== 'string') return null;
    
    let hex = colorString.trim().toLowerCase();
    let shorthand = hex.startsWith('#') ? hex.slice(1) : hex;
    const len = shorthand.length;
    
    // CRITICAL LOGIC: Explicitly reject plain "rgb" or "hsl" as they are functions, not colors.
    if (hex === 'rgb' || hex === 'hsl') {
        return null;
    }

    // NEW EXPLICIT CHECK: If it contains 'rgb' or 'hsl' but does NOT match a valid color function structure.
    if (hex.includes('rgb') || hex.includes('hsl')) {
        // Regex to broadly check for function structure with numbers/percentages: 
        // Example: rgb(0, 0, 0) or hsl(0, 0%, 0%)
        const structureRegex = /^(rgb|rgba|hsl|hsla)\s*\([\d\s\.\,\%]+\)$/i;
        if (!structureRegex.test(hex)) {
            return null; // Reject malformed structure like "rgb(p,p,p)" immediately.
        }
    }
    
    // Check if the input contains only hex characters (0-9, a-f) and is 1-6 digits long
    const isHexInput = /^[0-9a-f]{1,6}$/i.test(shorthand);

    // --- 1. CUSTOM HEX NORMALIZATION (1, 2, 3, 4, 5, 6 digits) ---
    if (len >= 1 && len <= 6 && isHexInput) {
        let normalizedHex = '';

        if (len === 1) {
            normalizedHex = shorthand.repeat(6);
        } else if (len === 2) {
            normalizedHex = shorthand.repeat(3);
        } else if (len === 3) {
            normalizedHex = shorthand.split('').map(char => char + char).join('');
        } else if (len === 4) {
             shorthand = shorthand.slice(0, 3);
            normalizedHex = shorthand.split('').map(char => char + char).join('');
        } else if (len === 5) {
            shorthand = shorthand.slice(0, 3);
            normalizedHex = shorthand.split('').map(char => char + char).join('');
        } else if (len === 6) {
            normalizedHex = shorthand;
        }

        return '#' + normalizedHex.toUpperCase();
    }
    // --- END CUSTOM HEX NORMALIZATION ---


    // --- 2. FALLBACK TO BROWSER-BASED CONVERSION ---
    const tempDiv = document.createElement('div');
    tempDiv.style.color = hex;
    document.body.appendChild(tempDiv); 
    
    const computedColor = getComputedStyle(tempDiv).color;
    document.body.removeChild(tempDiv);

    const rgbMatch = computedColor.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(,\s*\d*\.?\d+)?\)$/i);
    
    if (rgbMatch) {
        const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0');
        const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0');
        const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0');
        const hexResult = `#${r}${g}${b}`.toUpperCase();
        
        // VALIDATION LOGIC 1: Reject invalid color names/strings that fall back to black/white.
        if ((hexResult === '#000000' || hexResult === '#FFFFFF') && !isHexInput && !hex.includes('rgb') && !hex.includes('hsl')) {
            if (hex !== 'black' && hex !== 'white') {
                 return null; 
            }
        }
        
        return hexResult; 
    }
    
    // If the browser failed to convert a string that contains 'rgb'/'hsl' and it passed the structure check, 
    // it's invalid (e.g., component range error like rgb(256,0,0)).
    if (hex.includes('rgb') || hex.includes('hsl')) {
        return null;
    }

    return null;
}

/**
 * Converts a 3-digit hex code (#RGB) to a 6-digit hex code (#RRGGBB).
 * @param {string} hex - The hex color string.
 * @returns {string} The normalized 7-character hex color string.
 */
function normalizeHexColor(hex) {
    if (!hex || typeof hex !== 'string') return hex;

    const shorthand = hex.startsWith('#') ? hex.slice(1) : hex;

    if (shorthand.length === 3) {
        return '#' + shorthand.split('').map(char => char + char).join('').toUpperCase();
    }

    return hex.startsWith('#') ? hex.toUpperCase() : ('#' + hex).toUpperCase();
}


// =========================================================================
// CORE LOGIC & EVENT HANDLERS
// =========================================================================

/**
 * Dynamically generates the modalSettings JavaScript object string.
 */
function generateSettingsObject() {
    const outputSettings = {};
    for (const key in settings) {
        outputSettings[key] = settings[key];
    }

    let jsonString = JSON.stringify(outputSettings, null, 4);

    return "modalSettings = " + jsonString.replace(/"([^"]+)":/g, '$1:') + ";";
}

/**
 * Closes the modal if the click originated on the backdrop (overlay).
 */
function closeModalOnOutsideClick(event) {
    const codeModal = document.getElementById('codeModal');
    const helpModal = document.getElementById('helpModal');

    if (event.target === codeModal) {
        codeModal.classList.add('hidden');
    } else if (event.target === helpModal) {
        helpModal.classList.add('hidden');
    }
}

/**
 * Toggles the visibility of the code modal and populates content.
 */
function showCodeModal() {
    const modal = document.getElementById('codeModal');
    const content = document.getElementById('codeSnippetContent');
    
    const isHidden = modal.classList.toggle('hidden');

    if (!isHidden) {
        content.textContent = generateSettingsObject();
    }
}

/**
 * Copies the content of the code snippet and displays a custom toast.
 */
function copyCode() {
    const content = document.getElementById('codeSnippetContent').textContent;
    const toast = document.getElementById('copyToast');

    navigator.clipboard.writeText(content).then(() => {
        toast.style.opacity = '1';
        setTimeout(() => {
            toast.style.opacity = '0';
        }, 1500);

    }).catch(err => {
        console.error('Failed to copy: ', err);
        alert('Failed to copy code to clipboard.');
    });
}

/**
 * Toggles the visibility of the help modal.
 */
function showHelpModal() {
    const modal = document.getElementById('helpModal');
    modal.classList.toggle('hidden');
}

/**
 * Switches the active tab content within the help modal.
 */
function switchHelpTab(tabId, clickedTab) {
    document.querySelectorAll('#helpModal .tab').forEach(tab => {
        tab.classList.remove('active');
    });

    document.querySelectorAll('#helpModal .help-tab-content').forEach(content => {
        content.classList.add('hidden'); 
    });

    clickedTab.classList.add('active');
    document.getElementById(tabId).classList.remove('hidden');
}

/**
 * Toggles the error state of a form group based on color validity.
 * @param {string} inputId - The ID of the color input field.
 * @param {boolean} isValid - True if the color is valid, false if invalid/incomplete.
 */
function updateValidationError(inputId, isValid) {
    const inputElement = document.getElementById(inputId);
    const formGroup = inputElement ? inputElement.closest('.form-group') : null;
    
    if (!formGroup) return;

    const errorMsg = formGroup.querySelector('.error-message');

    if (isValid) {
        // Remove error state and hide the message
        inputElement.classList.remove('input-error');
        if (errorMsg) errorMsg.classList.add('error-hidden'); 
    } else {
        // Apply error state and show the message
        inputElement.classList.add('input-error');
        if (errorMsg) errorMsg.classList.remove('error-hidden'); 
    }
}

/* Removed: toggleHighlight function and PREVIEW_ELEMENTS map */


/**
 * Updates a single setting based on user input, ensuring the input field 
 * is updated with the normalized hex code upon successful validation.
 * @param {string} key - The setting key.
 * @param {string} value - The input value.
 * @param {boolean} isFinal - True if triggered by blur/enter (final submission), false if keyup (visual preview only).
 */
function updateSetting(key, value, isFinal = true) {
    let settingKey = key;
    if (key === 'questionColor') {
        settingKey = 'outOfStockBadgeColor';
    } 

    let finalValue = value;
    const isColorSetting = settingKey.includes('Color') || settingKey.includes('primaryButton') || settingKey.includes('secondaryButton') || settingKey === 'outOfStockBadgeColor';
    const inputId = (key === 'outOfStockBadgeColor' ? 'questionColor' : key);
    const inputElement = document.getElementById(inputId);

    // Removed: Highlight logic for !isFinal

    if (isColorSetting) {
        const hexEquivalent = convertToHex(value);
        
        // Determine if the input is considered a valid state (valid hex, 'transparent', or empty)
        const isValidState = !!hexEquivalent || value.trim().toLowerCase() === 'transparent' || value.trim() === '';

        if (isValidState) {
            // --- VALID/ACCEPTABLE INPUT ---
            
            updateValidationError(inputId, true); // Clear error

            if (hexEquivalent) {
                finalValue = hexEquivalent;
                
                // CRITICAL FIX: Only update the input element text if this is a final action (blur/enter)
                if (isFinal && inputElement && value.toUpperCase() !== hexEquivalent) {
                    inputElement.value = hexEquivalent; // Update visible text with normalized 6-digit hex
                }
                
            } else if (value.trim().toLowerCase() === 'transparent') {
                finalValue = 'transparent';
            } else if (value.trim() === '') {
                // REVERT LOGIC 1: Revert empty field to last saved color
                finalValue = settings[settingKey]; // Get the last valid color
                if (isFinal && inputElement) {
                    inputElement.value = finalValue;
                }
            } else {
                // Fallback for cases like short/invalid color names that pass validation but aren't hex/transparent/empty
                finalValue = ''; 
            }
        } else {
            // --- INVALID INPUT (Visual Snap and Error Display) ---
            
            // 1. Show the error message and red border
            updateValidationError(inputId, false);
            
            const lastValidColor = settings[settingKey]; // The color to revert to

            // CRITICAL LOGIC: Skip Visual Snap while user is actively typing a structured string
            if (!isFinal && (value.includes('rgb') || value.includes('hsl'))) {
                 return; // Just exit, preserving the user's invalid text and last valid color.
            }
            
            // REVERT LOGIC 2: Revert invalid input to last saved color on completion
            if (isFinal && inputElement) {
                // Set the input field back to the last valid value (e.g., #0A4D8C)
                inputElement.value = lastValidColor;
                
                // Update the swatch immediately after reverting the text
                updateColorSwatch(inputId, lastValidColor); 
                
                // Clear the error message/border after reverting
                updateValidationError(inputId, true); 
                
                // Set finalValue to the last valid color so the subsequent code uses it
                finalValue = lastValidColor; 
                
            } else {
                // This is the 'isFinal=false' case (User is still typing) - VISUAL SNAP
                
                // Temporarily update the visuals (swatch/preview) to black (#000000 snap)
                const snapValue = '#000000'; 
            
                // Snap Color Picker (The color picker receives the snap value)
                const colorPicker = document.getElementById(inputId + 'Picker');
                if (colorPicker) colorPicker.value = snapValue;
                
                // Directly update the swatch to black for the snap preview
                updateColorSwatch(inputId, snapValue);
            
                // Temporarily update settings to force preview snap, then restore
                settings[settingKey] = snapValue;
                updateAllPreviews(false); // Update preview only, not CSS vars
                settings[settingKey] = lastValidColor; 
                
                // Input element value is NOT updated here, allowing the user to keep typing.
                return; // Exit, preserving the user's invalid text in the input box.
            }
        }
    }

    // 3. Update the settings object with the new (or converted) value
    settings[settingKey] = finalValue;
    
    // Update the UI text for sliders and textareas
    if (key === 'modalContainerBorderRadius') {
        document.getElementById('modalContainerBorderRadiusValue').textContent = value;
    } else if (key === 'buttonBorderRadius') {
        document.getElementById('buttonBorderRadiusValue').textContent = value;
    } else if (key === 'buttonBorderWidth') {
        document.getElementById('buttonBorderWidthValue').textContent = value;
    } else if (key === 'disclaimerText') {
        const preview = document.getElementById('disclaimerTextPreview');
        if (preview) preview.textContent = value;
    } else if (key === 'productUnavailableMessage') {
        const preview = document.getElementById('productUnavailableMessagePreview');
        if (preview) preview.textContent = value;
    } else if (key === 'alternateProductMessage') {
        const preview = document.getElementById('alternateProductMessagePreview');
        if (preview) preview.textContent = value;
    }

    if (isColorSetting) {
        // The color picker requires a strict 6-digit hex code
        const colorPicker = document.getElementById(inputId + 'Picker');
        if (colorPicker) {
            const pickerValue = (finalValue === 'transparent' || finalValue === '' ? '#000000' : normalizeHexColor(finalValue));
            colorPicker.value = pickerValue;
        }
        
        // Update the visual swatch with the effective color
        updateColorSwatch(inputId, finalValue);
    }

    updateAllPreviews(isFinal); // Update color CSS vars only if it's the final event
    
    /* Removed: Highlight removal logic for isFinal */
}

/**
 * Updates the text input field when the color is selected via the color picker.
 */
function updateColorFromPicker(key, value) {
    // Special handling for the swatch/picker element IDs
    const inputId = key === 'outOfStockBadgeColor' ? 'questionColor' : key;
    
    // Update the visible text input with the new hex code
    document.getElementById(inputId).value = value.toUpperCase();
    
    // Update settings and previews (isFinal defaults to true)
    updateSetting(key, value, true);
    
    /* Removed: Explicit highlight removal call */
}

function updatePriceStyles() {
    const productItems = document.querySelectorAll('.product-item');

    productItems.forEach(item => {
        const salePrice = item.querySelector('.price-sale');
        const regularPrice = item.querySelector('.price-regular');

        if (salePrice && regularPrice) {
            if (salePrice.textContent.trim() === '') {
                regularPrice.classList.add('no-strikethrough');
            } else {
                regularPrice.classList.remove('no-strikethrough');
            }
        }
    });
}

function updateAllPreviews(updateColorVars = true) {
    // --- Update CSS Variables (Gated by updateColorVars flag) ---
    if (updateColorVars) {
        document.documentElement.style.setProperty('--attention-color', settings.attentionColor);
        document.documentElement.style.setProperty('--warning-color', settings.warningColor);
        document.documentElement.style.setProperty('--out-of-stock-color', settings.outOfStockBadgeColor);
        document.documentElement.style.setProperty('--success-color', settings.successColor);
        
        document.documentElement.style.setProperty('--main-header-text-color', settings.mainHeaderTextColor);
        document.documentElement.style.setProperty('--sale-price-text-color', settings.salePriceTextColor);
        document.documentElement.style.setProperty('--primary-button-bg-color', settings.primaryButtonBackgroundColor);
        document.documentElement.style.setProperty('--primary-button-text-color', settings.primaryButtonTextColor);
        document.documentElement.style.setProperty('--primary-button-border-color', settings.primaryButtonBorderColor);
        document.documentElement.style.setProperty('--secondary-button-bg-color', settings.secondaryButtonBackgroundColor);
        document.documentElement.style.setProperty('--secondary-button-text-color', settings.secondaryButtonTextColor);
        document.documentElement.style.setProperty('--secondary-button-border-color', settings.secondaryButtonBorderColor);
        
        document.documentElement.style.setProperty('--product-unavailable-message-color', settings.productUnavailableMessageColor);
        document.documentElement.style.setProperty('--alternate-product-message-color', settings.alternateProductMessageColor);
    }

    // --- Sizing Variables (ALWAYS update these) ---
    document.documentElement.style.setProperty('--button-border-radius', settings.buttonBorderRadius + 'px');
    document.documentElement.style.setProperty('--button-border-width', settings.buttonBorderWidth + 'px');
    document.documentElement.style.setProperty('--modal-border-radius', settings.modalContainerBorderRadius + 'px');

    // Update direct styles (Titles, success icons, etc.)
    const mainModalTitle = document.querySelector('#mainModal .modal-title');
    if(mainModalTitle) mainModalTitle.style.color = settings.mainHeaderTextColor;
    
    const mainModalSuccessItems = document.querySelectorAll('#mainModal .success-item');
    mainModalSuccessItems.forEach(item => {
        item.style.color = settings.successColor;
    });
    
    // Update confirmation modal title color
    const confirmationTitle = document.querySelector('#confirmationModal .confirmation-modal-title-text');
    if(confirmationTitle) confirmationTitle.style.color = settings.mainHeaderTextColor;


    // Update the message content itself
    const unavailablePreview = document.getElementById('productUnavailableMessagePreview');
    if (unavailablePreview) unavailablePreview.textContent = settings.productUnavailableMessage;
    
    const alternatePreview = document.getElementById('alternateProductMessagePreview');
    if (alternatePreview) alternateProductMessage.textContent = settings.alternateProductMessage;

    // Update button styles
    const allButtons = document.querySelectorAll('.btn');
    allButtons.forEach(btn => {
        btn.style.borderRadius = settings.buttonBorderRadius + 'px';
        btn.style.borderWidth = settings.buttonBorderWidth + 'px';
    });
    
    updatePriceStyles();
}

/**
 * Resets a single input field and its corresponding setting to its default value.
 * @param {string} inputId - The ID of the input element (e.g., 'mainHeaderTextColor').
 */
function resetField(inputId) {
    // 1. Determine the actual setting key and default value
    let settingKey = inputId;
    // Map the 'questionColor' input ID back to its setting key
    if (inputId === 'questionColor') {
        settingKey = 'outOfStockBadgeColor';
    } else if (inputId === 'disclaimerText') {
        settingKey = 'disclaimerText';
    } else if (inputId === 'productUnavailableMessage') {
        settingKey = 'productUnavailableMessage';
    } else if (inputId === 'alternateProductMessage') {
        settingKey = 'alternateProductMessage';
    }

    const defaultValue = DEFAULT_SETTINGS[settingKey];
    
    // 2. Get the input element and update its value
    const inputElement = document.getElementById(inputId);
    if (!inputElement) return;

    inputElement.value = defaultValue;
    
    // 3. Update the setting and the previews (treating it as a final, complete input)
    updateSetting(settingKey, defaultValue, true);

    // Ensure validation errors are cleared if they were present
    updateValidationError(inputId, true); 
}

/**
 * Resets all inputs and settings to their default values.
 */
function resetSettings() {
    
    // Reset the global settings object
    settings = {...DEFAULT_SETTINGS};
    
    // Loop through all default settings keys to update form elements
    for (const key in DEFAULT_SETTINGS) {
        const defaultValue = DEFAULT_SETTINGS[key];

        // Determine the ID of the field to update
        let inputId = key;
        if (key === 'outOfStockBadgeColor') {
            inputId = 'questionColor';
        }
        
        // 1. Reset the primary input/textarea/slider value
        const inputElement = document.getElementById(inputId);
        if (inputElement) {
            inputElement.value = defaultValue;
        }
        
        // 2. Reset the hidden COLOR PICKER for all color inputs
        if (key.includes('Color') || key.includes('Button')) {
            const colorPicker = document.getElementById(inputId + 'Picker');
            if (colorPicker) {
                // The color picker must receive a normalized 6-digit hex code
                const normalizedValue = normalizeHexColor(defaultValue);
                colorPicker.value = (normalizedValue.toLowerCase() === '#transparent' ? '#000000' : normalizedValue);
            }
        }
    }
    
    // 3. Manually reset SLIDER value displays (must be done after input.value is set)
    document.getElementById('modalContainerBorderRadiusValue').textContent = settings.modalContainerBorderRadius;
    document.getElementById('buttonBorderRadiusValue').textContent = settings.buttonBorderRadius;
    document.getElementById('buttonBorderWidthValue').textContent = settings.buttonBorderWidth;

    // 4. Manually reset TEXTAREA PREVIEWS
    const disclaimerPreview = document.getElementById('disclaimerTextPreview');
    if (disclaimerPreview) disclaimerPreview.textContent = settings.disclaimerText;
    
    const unavailablePreview = document.getElementById('productUnavailableMessagePreview');
    if (unavailablePreview) unavailablePreview.textContent = settings.productUnavailableMessage;
    
    const alternatePreview = document.getElementById('alternateProductMessagePreview');
    if (alternatePreview) alternatePreview.textContent = settings.alternateProductMessage;

    // 5. Reset color swatches and clear validation errors
    document.querySelectorAll('input[type="text"][id$="Color"], input[type="text"][id^="primaryButton"], input[type="text"][id^="secondaryButton"], #questionColor').forEach(input => {
        updateColorSwatch(input.id, input.value);
        updateValidationError(input.id, true); 
    });

    // 6. Final update to apply CSS variables and preview styles
    updateAllPreviews();
}

function updateColorSwatch(colorId, color) {
    // The picker's sibling is the swatch
    const swatch = document.getElementById(colorId + 'Picker').previousElementSibling; 
    if (swatch) {
        if (color.toLowerCase() === 'transparent') {
            swatch.style.background = 'repeating-linear-gradient(45deg, transparent, transparent 2px, #ccc 2px, #ccc 4px)';
            swatch.style.border = '1px solid #ccc';
        } else {
            swatch.style.background = 'initial';
            swatch.style.backgroundColor = color;
            if (color.toUpperCase() === '#FFFFFF') {
                swatch.style.border = '2px solid #ccc';
            } else {
                swatch.style.border = '1px solid #d1d1d6';
            }
        }
    }
}

/**
 * Switches the active preview modal based on the selected tab.
 */
function switchTab(tabId, clickedTab) {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });

    document.querySelectorAll('.modal-preview').forEach(preview => {
        preview.classList.add('hidden');
    });

    clickedTab.classList.add('active');
    document.getElementById(tabId + 'Modal').classList.remove('hidden');

    updateAllPreviews();
}

/**
 * Toggles the collapsed state of a sidebar section.
 */
function toggleSection(headerElement) {
    const section = headerElement.closest('.section');
    const chevron = headerElement.querySelector('.chevron');
    
    section.classList.toggle('collapsed');

    if (section.classList.contains('collapsed')) {
          chevron.textContent = 'chevron_right';
    } else {
          chevron.textContent = 'expand_more';
    }
}


// Initialize the app and set up event listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log("test")
    // const sdk = new AdAdapatedPayloadServiceSdk({
    //     sdkKey: "D883EB828827496A840A312C74263002",
    //     sdkEnv: "dev",
    //     retailerSettings: {
    //         allowOutOfStockAddToCart: false,
    //         userConfirmAddToCart: true,
    //     },
    //     unknownUserFeatures: {
    //         actionRequiresLogin: {
    //             addToCart: false,
    //             addToList: false,
    //             clipOffer: false,
    //         },
    //         modalSettings: {
                // mainHeaderTextColor: "#8e8e8e",
                // salePriceTextColor: "blue",
                // successColor: "gold",
                // attentionColor: "purple",
                // warningColor: "lightblue",
                // outOfStockBadgeColor: "pink",
                // primaryButtonBackgroundColor: "red",
                // primaryButtonTextColor: "rgb(14, 183, 44)",
                // primaryButtonBorderColor: "brown",
                // secondaryButtonBackgroundColor: "rgb(199, 32, 185)",
                // secondaryButtonTextColor: "white",
                // secondaryButtonBorderColor: "brown",
                // buttonBorderRadius: "3px",
                // buttonBorderWidth: "3px",
                // modalContainerBorderRadius: "15px",
    //             disclaimerText: "Please ensure all items and quantities are correct.",
    //         },
    //         callbacks: {
    //             loginRequested: () => {
    //                 console.log("Login successfully requested");
    //             },
    //         },
    //         methods: {
    //             isUserAuthenticated: () => {
    //                 return new Promise((resolve) => {
    //                     resolve(false);
    //                 });
    //             },
    //             getProductDetails: (skuList) => {
    //                 return new Promise((resolve) => {
    //                     const finalProductDetailsList = [];

    //                     for (const sku of skuList) {
    //                         let productDetail = {
    //                             sku,
    //                             stockCount: 0,
    //                         };

    //                         if (sku === "960051031") {
    //                             productDetail = {
    //                                 sku,
    //                                 name: "Honey Maid Fresh Stacks Graham Crackers - 6-12.2 Oz",
    //                                 imageUrl:
    //                                     "https://images.albertsons-media.com/is/image/ABS/960051031-C1N1?$ng-ecom-pdp-desktop$&defaultImage=Not_Available",
    //                                 stockCount: 0,
    //                                 regularPrice: 5.49,
    //                                 salePrice: 4.99,
    //                             };
    //                         } else if (sku === "102013701") {
    //                             productDetail = {
    //                                 sku,
    //                                 name: "Honey Maid Cinnamon Graham Crackers - 14.4 Oz",
    //                                 imageUrl:
    //                                     "https://images.albertsons-media.com/is/image/ABS/102013701-C1N1?$ng-ecom-pdp-desktop$&defaultImage=Not_Available",
    //                                 stockCount: 1,
    //                                 regularPrice: 5.49,
    //                                 salePrice: 4.99,
    //                             };
    //                         } else if (sku === "101050229") {
    //                             productDetail = {
    //                                 sku,
    //                                 name: "HERSHEY'S Milk Chocolate S'mores Candy Bars - 6-1.55 Oz",
    //                                 imageUrl:
    //                                     "https://images.albertsons-media.com/is/image/ABS/101050229-C1N1?$ng-ecom-pdp-desktop$&defaultImage=Not_Available",
    //                                 stockCount: 0,
    //                                 regularPrice: 6.99,
    //                             };
    //                         } else if (sku === "960045292") {
    //                             productDetail = {
    //                                 sku,
    //                                 name: "Jet-Puffed Marshmallows - 12 Oz",
    //                                 imageUrl:
    //                                     "https://images.albertsons-media.com/is/image/ABS/960045292-C1N1?$ng-ecom-pdp-desktop$&defaultImage=Not_Available",
    //                                 stockCount: 2,
    //                                 regularPrice: 2.69,
    //                             };
    //                         }

    //                         finalProductDetailsList.push(productDetail);
    //                     }

    //                     resolve(finalProductDetailsList);
    //                 });
    //             },
    //             addToCart: (productList) => {
    //                 return new Promise((resolve) => {
    //                     resolve();
    //                 });
    //             },
    //             addToList: (productList) => {
    //                 return new Promise((resolve) => {
    //                     resolve();
    //                 });
    //             },
    //             clipOffer: (offerIdList) => {
    //                 return new Promise((resolve) => {
    //                     resolve();
    //                 });
    //             },
    //         },
    //     },
    // });

    // Initialize all sections as expanded
    document.querySelectorAll('.section').forEach(section => {
          const chevron = section.querySelector('.chevron');
          section.classList.remove('collapsed');
          chevron.textContent = 'expand_more';
    });

    updateAllPreviews();
    
    // Setup event listeners for all interactive inputs
    document.querySelectorAll('input[type="text"], textarea, input[type="range"]').forEach(input => {
            
        let inputId = input.id;
        let settingKey = inputId;
        if (inputId === 'questionColor') {
            settingKey = 'outOfStockBadgeColor';
        }
        
        const isColorTextInput = input.type === 'text' && (settingKey.includes('Color') || settingKey.includes('Button') || settingKey === 'outOfStockBadgeColor');
        const isSlider = input.type === 'range';
        const isTextAreaOrSimpleText = input.tagName === 'TEXTAREA' || (input.type === 'text' && !isColorTextInput);


        if (isColorTextInput) {
            
            // KEY EVENT: Visual updates only (isFinal=false).
            input.addEventListener('input', () => {
                updateSetting(inputId, input.value, false);
            });
            
            // COMPLETION EVENT 1: blur (Triggers final update)
            input.addEventListener('blur', () => {
                updateSetting(inputId, input.value, true); 
            });
            
            // COMPLETION EVENT 2: Keydown (Enter/Tab)
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault(); 
                    updateSetting(inputId, input.value, true); 
                    e.target.blur(); // Blur triggers the blur event listener
                } else if (e.key === 'Tab') {
                    // Run final update BEFORE focus shifts
                    updateSetting(inputId, input.value, true); 
                }
            });
            
        } else if (isTextAreaOrSimpleText) {
            // Textarea and regular text inputs (not color) update on input
            input.addEventListener('input', () => {
                updateSetting(inputId, input.value, true);
            });
            
        } else if (isSlider) {
            // Sliders
            input.addEventListener('input', () => {
                updateSetting(inputId, input.value);
            });
        }
    });
    
    // Set initial color swatches and values on load
    document.querySelectorAll('input[type="text"][id$="Color"], input[type="text"][id^="primaryButton"], input[type="text"][id^="secondaryButton"], #questionColor').forEach(input => {
        updateColorSwatch(input.id, input.value);
        
        const colorPicker = document.getElementById(input.id + 'Picker');
        if(colorPicker) {
            colorPicker.value = normalizeHexColor(input.value);
        }
    });
    
    // Set initial value for sliders
    document.getElementById('modalContainerBorderRadiusValue').textContent = document.getElementById('modalContainerBorderRadius').value;
    document.getElementById('buttonBorderRadiusValue').textContent = document.getElementById('buttonBorderRadius').value;
    document.getElementById('buttonBorderWidthValue').textContent = document.getElementById('buttonBorderWidth').value;
    
    // Hide the secondary preview modals and help tabs on load
    document.getElementById('confirmationModal').classList.add('hidden');
    document.getElementById('helpConfirmation').classList.add('hidden');
    document.getElementById('helpMoreButtons').classList.add('hidden');
});