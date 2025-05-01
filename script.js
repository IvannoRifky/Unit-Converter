const conversions = {
    distance: {
        km: 1000,
        m: 1,
        cm: 0.01,
        mm: 0.001,
        mi: 1609.34,
        in: 0.0254,
        ft: 0.3048,
        yd: 0.9144,
        // Added new units
        nm: 0.000000001, // nanometer
        µm: 0.000001,    // micrometer
        nmi: 1852        // nautical mile
    },
    weight: {
        kg: 1000,
        g: 1,
        mg: 0.001,
        lb: 453.592,
        oz: 28.3495,
        st: 6350.29,
        // Added new units
        t: 1000000,      // metric ton
        ct: 0.2,         // carat
        gr: 0.0648       // grain
    },
    temperature: {
        convert: function(value, fromUnit, toUnit) {
            let kelvin;
            if (fromUnit === 'c') {
                kelvin = value + 273.15;
            } else if (fromUnit === 'f') {
                kelvin = (value + 459.67) * (5/9);
            } else {
                kelvin = value;
            }

            if (toUnit === 'c') {
                return kelvin - 273.15;
            } else if (toUnit === 'f') {
                return kelvin * (9/5) - 459.67;
            } else {
                return kelvin;
            }
        }
    },
    // Added new conversion type
    area: {
        m2: 1,
        km2: 1000000,
        cm2: 0.0001,
        mm2: 0.000001,
        ha: 10000,
        acre: 4046.86,
        ft2: 0.092903,
        in2: 0.00064516,
        yd2: 0.836127
    },
    // Added new conversion type
    volume: {
        l: 1,
        ml: 0.001,
        m3: 1000,
        cm3: 0.001,
        mm3: 0.000001,
        gal: 3.78541,
        qt: 0.946353,
        pt: 0.473176,
        fl_oz: 0.0295735
    }
};

// Common conversion history storage
let conversionHistories = {};

// Save histories to localStorage
function saveHistories() {
    localStorage.setItem('unitConverterHistory', JSON.stringify(conversionHistories));
}

// Load histories from localStorage
function loadHistories() {
    const savedHistories = localStorage.getItem('unitConverterHistory');
    if (savedHistories) {
        conversionHistories = JSON.parse(savedHistories);
        
        // Display loaded histories
        for (const type in conversionHistories) {
            const historyContainer = document.getElementById(type + 'History');
            if (historyContainer) {
                historyContainer.innerHTML = '';
                conversionHistories[type].forEach(item => {
                    const historyItem = document.createElement('div');
                    historyItem.className = 'history-item';
                    historyItem.innerHTML = `${item} <button class="reuse-btn" onclick="reuseConversion(this)">Gunakan</button>`;
                    historyContainer.appendChild(historyItem);
                });
            }
        }
    }
}

// Initialize histories
document.addEventListener('DOMContentLoaded', function() {
    // Initialize conversionHistories for each type
    ['distance', 'weight', 'temperature', 'area', 'volume'].forEach(type => {
        if (!conversionHistories[type]) {
            conversionHistories[type] = [];
        }
    });
    
    // Load saved histories
    loadHistories();
    
    // Set theme preference from localStorage
    const savedTheme = localStorage.getItem('unitConverterTheme');
    if (savedTheme) {
        document.body.classList.add(savedTheme);
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.checked = (savedTheme === 'dark-theme');
        }
    }

    // For keyboard navigation
    setInitialTabIndex();
});

// Keyboard navigation setup
function setInitialTabIndex() {
    const tabbableElements = document.querySelectorAll('button, input, select');
    tabbableElements.forEach((element, index) => {
        element.tabIndex = index + 1;
    });
}

// Tab switching logic
document.querySelectorAll('.unit-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        switchTab(this.dataset.tab);
    });
});

function switchTab(tabName) {
    document.querySelectorAll('.unit-tab').forEach(t => {
        t.classList.remove('active');
    });
    document.querySelector(`.unit-tab[data-tab="${tabName}"]`).classList.add('active');

    document.querySelectorAll('.converter-container').forEach(container => {
        container.classList.remove('active');
    });
    document.getElementById(tabName + '-converter').classList.add('active');
    
    // Set focus to the value input of the active tab
    setTimeout(() => {
        const activeInput = document.getElementById(tabName + 'Value');
        if (activeInput) {
            activeInput.focus();
        }
    }, 100);
    
    // Update URL hash for bookmarking specific converter
    window.location.hash = tabName;
}

// Check for URL hash on page load to set active tab
window.addEventListener('load', function() {
    const hash = window.location.hash.substring(1);
    if (hash && document.querySelector(`.unit-tab[data-tab="${hash}"]`)) {
        switchTab(hash);
    }
});

// Theme toggle functionality
function toggleTheme() {
    const isDarkMode = document.body.classList.toggle('dark-theme');
    
    // Save theme preference
    localStorage.setItem('unitConverterTheme', isDarkMode ? 'dark-theme' : '');
    
    // Update meta theme-color for browsers that support it
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
        metaThemeColor.setAttribute('content', isDarkMode ? '#1a1a2e' : '#74ebd5');
    }
}

// Main conversion function
function convert(type) {
    const value = parseFloat(document.getElementById(type + 'Value').value);
    const fromUnit = document.getElementById(type + 'FromUnit').value;
    const toUnit = document.getElementById(type + 'ToUnit').value;
    const precision = parseInt(document.getElementById(type + 'Precision').value);

    if (isNaN(value)) {
        showError(type + 'Result', 'Harap masukkan nomor yang valid');
        return;
    }

    // Validate precision
    if (isNaN(precision) || precision < 0 || precision > 10) {
        showError(type + 'Result', 'Presisi harus antara 0 - 10');
        return;
    }

    let result;

    try {
        if (type === 'temperature') {
            result = conversions.temperature.convert(value, fromUnit, toUnit);
        } else {
            const fromFactor = conversions[type][fromUnit];
            const toFactor = conversions[type][toUnit];
            
            // Validation
            if (!fromFactor) {
                showError(type + 'Result', `Unit konversi tidak valid: ${fromUnit}`);
                return;
            }
            if (!toFactor) {
                showError(type + 'Result', `Unit konversi tidak valid: ${toUnit}`);
                return;
            }
            
            result = (value * fromFactor) / toFactor;
        }

        // Format with the specified precision
        const formattedResult = result.toFixed(precision);

        // Get unit display names
        const fromUnitName = document.getElementById(type + 'FromUnit').options[
            document.getElementById(type + 'FromUnit').selectedIndex
        ].text;

        const toUnitName = document.getElementById(type + 'ToUnit').options[
            document.getElementById(type + 'ToUnit').selectedIndex
        ].text;

        // Create formatted result strings
        const resultString = `${formatNumber(value)} ${fromUnitName} = ${formatNumber(formattedResult)} ${toUnitName}`;
        const resultDisplay = `<span class="result-value">${formatNumber(value)}</span> <span class="result-unit">${fromUnitName}</span> = <span class="result-value">${formatNumber(formattedResult)}</span> <span class="result-unit">${toUnitName}</span>`;

        // Display result
        document.getElementById(type + 'Result').innerHTML = resultDisplay;
        
        // Add success animation
        const resultContainer = document.getElementById(type + 'Result').parentElement;
        resultContainer.classList.add('success-flash');
        setTimeout(() => {
            resultContainer.classList.remove('success-flash');
        }, 1000);

        // Add to history
        addToHistory(type, resultString);
        
    } catch (error) {
        showError(type + 'Result', 'Terjadi kesalahan: ' + error.message);
    }
}

// Error display function
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    element.innerHTML = `<span class="error">${message}</span>`;
    
    // Add error animation
    const resultContainer = element.parentElement;
    resultContainer.classList.add('error-flash');
    setTimeout(() => {
        resultContainer.classList.remove('error-flash');
    }, 1000);
}

// Format numbers with thousand separators
function formatNumber(num) {
    return parseFloat(num).toLocaleString('id-ID');
}

// Add conversion to history
function addToHistory(type, text) {
    // Create history item
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.innerHTML = `${text} <button class="reuse-btn" onclick="reuseConversion(this)">Gunakan</button>`;

    // Get history container
    const historyContainer = document.getElementById(type + 'History');
    historyContainer.insertBefore(historyItem, historyContainer.firstChild);

    // Limit history items (circular buffer)
    if (historyContainer.children.length > 10) {
        historyContainer.removeChild(historyContainer.lastChild);
    }
    
    // Save to array and localStorage
    if (!conversionHistories[type]) {
        conversionHistories[type] = [];
    }
    
    // Add to start of array
    conversionHistories[type].unshift(text);
    
    // Limit array size
    if (conversionHistories[type].length > 10) {
        conversionHistories[type].pop();
    }
    
    // Save to localStorage
    saveHistories();
}

// Reuse a conversion from history
function reuseConversion(buttonElement) {
    const historyText = buttonElement.parentElement.textContent.replace('Gunakan', '').trim();
    
    // Parse the history text format: "10 Meter = 32.81 Kaki"
    const match = historyText.match(/^([\d,. ]+) (.+) = ([\d,. ]+) (.+)$/);
    
    if (match) {
        const [, value, fromUnitText, result, toUnitText] = match;
        
        // Find active converter
        const activeConverter = document.querySelector('.converter-container.active');
        if (activeConverter) {
            const type = activeConverter.id.replace('-converter', '');
            
            // Set value
            const valueInput = document.getElementById(type + 'Value');
            if (valueInput) {
                valueInput.value = parseFloat(value.replace(/,/g, ''));
            }
            
            // Set units
            setSelectByText(type + 'FromUnit', fromUnitText);
            setSelectByText(type + 'ToUnit', toUnitText);
            
            // Perform conversion
            convert(type);
        }
    }
}

// Helper to set select by displayed text
function setSelectByText(selectId, text) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].text.trim() === text.trim()) {
            select.selectedIndex = i;
            return;
        }
    }
}

// Copy result to clipboard
function copyResult(elementId) {
    const resultElement = document.getElementById(elementId);
    const resultText = resultElement.textContent;

    if (resultText === 'Hasil akan tampil di sini' || resultText.includes('Harap masukkan')) {
        return;
    }

    // Strip any HTML tags and copy plain text
    const tempElement = document.createElement('div');
    tempElement.innerHTML = resultText;
    const textToCopy = tempElement.textContent;

    navigator.clipboard.writeText(textToCopy).then(() => {
        const copyBtn = document.querySelector(`#${elementId}`).nextElementSibling;
        const originalText = copyBtn.innerText;

        copyBtn.innerText = 'Tersalin!';
        copyBtn.classList.add('copied');
        
        setTimeout(() => {
            copyBtn.innerText = originalText;
            copyBtn.classList.remove('copied');
        }, 2000);
    });
}

// Swap units
function swapUnits(type) {
    const fromSelect = document.getElementById(type + 'FromUnit');
    const toSelect = document.getElementById(type + 'ToUnit');
    
    const tempIndex = fromSelect.selectedIndex;
    fromSelect.selectedIndex = toSelect.selectedIndex;
    toSelect.selectedIndex = tempIndex;
    
    // Auto-convert if there's a value
    const value = document.getElementById(type + 'Value').value;
    if (value && !isNaN(parseFloat(value))) {
        convert(type);
    }
}

// Clear all inputs
function clearInputs(type) {
    document.getElementById(type + 'Value').value = '';
    document.getElementById(type + 'Result').innerHTML = 'Hasil akan tampil di sini';
    document.getElementById(type + 'Value').focus();
}

// Clear history
function clearHistory(type) {
    const historyContainer = document.getElementById(type + 'History');
    historyContainer.innerHTML = '';
    
    // Clear from storage
    conversionHistories[type] = [];
    saveHistories();
}

// Add event listeners to inputs
document.addEventListener('DOMContentLoaded', function() {
    ['distance', 'weight', 'temperature', 'area', 'volume'].forEach(type => {
        const valueInput = document.getElementById(type + 'Value');
        if (valueInput) {
            valueInput.addEventListener('keyup', function(event) {
                if (event.key === 'Enter') {
                    convert(type);
                }
            });
        }
        
        // Auto-conversion on unit select change
        const fromUnitSelect = document.getElementById(type + 'FromUnit');
        const toUnitSelect = document.getElementById(type + 'ToUnit');
        
        if (fromUnitSelect && toUnitSelect) {
            [fromUnitSelect, toUnitSelect].forEach(select => {
                select.addEventListener('change', function() {
                    const value = document.getElementById(type + 'Value').value;
                    if (value && !isNaN(parseFloat(value))) {
                        convert(type);
                    }
                });
            });
        }
    });
    
    // Install service worker for PWA support
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').then(registration => {
                console.log('ServiceWorker registration successful');
            }).catch(error => {
                console.log('ServiceWorker registration failed: ', error);
            });
        });
    }
});