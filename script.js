const conversions = {
    distance: {
        km: 1000,
        m: 1,
        cm: 0.01,
        mm: 0.001,
        mi: 1609.34,
        in: 0.0254,
        ft: 0.3048,
        yd: 0.9144
    },
    weight: {
        kg: 1000,
        g: 1,
        mg: 0.001,
        lb: 453.592,
        oz: 28.3495,
        st: 6350.29
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
    }
};

document.querySelectorAll('.unit-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        const tabName = this.dataset.tab;

        document.querySelectorAll('.unit-tab').forEach(t => {
            t.classList.remove('active');
        });
        this.classList.add('active');

        document.querySelectorAll('.converter-container').forEach(container => {
            container.classList.remove('active');
        });
        document.getElementById(tabName + '-converter').classList.add('active');
    });
});

function convert(type) {
    const value = parseFloat(document.getElementById(type + 'Value').value);
    const fromUnit = document.getElementById(type + 'FromUnit').value;
    const toUnit = document.getElementById(type + 'ToUnit').value;
    const precision = parseFloat(document.getElementById(type + 'Precision').value);

    if (isNaN(value)) {
        document.getElementById(type + 'Result').innerText = 'Harap masukkan nomor yang valid';
        return;
    }

    let result;

    if (type === 'temperature') {
        result = conversions.temperature.convert(value, fromUnit, toUnit);
    } else {
        const fromFactor = conversions[type][fromUnit];
        const toFactor = conversions[type][toUnit];
        result = (value * fromFactor) / toFactor;
    }

    const formattedResult = result.toFixed(precision);

    const fromUnitName = document.getElementById(type + 'FromUnit').options[
        document.getElementById(type + 'FromUnit').selectedIndex
    ].text;

    const toUnitName = document.getElementById(type + 'ToUnit').options[
        document.getElementById(type + 'ToUnit').selectedIndex
    ].text;

    const resultString = `${value} ${fromUnitName} = ${formattedResult} ${toUnitName}`;

    document.getElementById(type + 'Result').innerText = resultString;

    addToHistory(type, resultString);
}

function addToHistory(type, text) {
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.innerText = text;

    const historyContainer = document.getElementById(type + 'History');
    historyContainer.insertBefore(historyItem, historyContainer.firstChild);

    if (historyContainer.children.length > 10) {
        historyContainer.removeChild(historyContainer.lastChild);
    }
}

function copyResult(elementId) {
    const resultText = document.getElementById(elementId).innerText;

    if (resultText === 'Hasilnya akan muncul di sini' || resultText === 'Harap masukkan nomor yang valid') {
        return;
    }

    navigator.clipboard.writeText(resultText).then(() => {
        const copyBtn = document.querySelector(`#${elementId}`).nextElementSibling;
        const originalText = copyBtn.innerText;

        copyBtn.innerText = 'Tersalin!';
        setTimeout(() => {
            copyBtn.innerText = originalText;
        }, 2000);
    });
}

['distance', 'weight', 'temperature'].forEach(type => {
    document.getElementById(type + 'Value').addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            convert(type);
        }
    });
});