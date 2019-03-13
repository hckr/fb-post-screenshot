let formatSelect = document.getElementById('format'),
    qualityLabel = document.getElementById('quality-label'),
    qualityInput = document.getElementById('quality');

for (let [el, ev] of [[formatSelect, 'change'], [qualityInput, 'input']]) {
    el.addEventListener(ev, _ => {
        saveValues();
        updateQualityVisibility();
    });
}

restoreValues();

function saveValues() {
    browser.storage.local.set({ format: formatSelect.value });
    if(qualityInput.checkValidity()) {
        browser.storage.local.set({ quality: parseFloat(qualityInput.value) });
    }
}

function restoreValues() {
    browser.storage.local.get().then(values => {
        formatSelect.value = values.format;
        qualityInput.value = values.quality;
        setTimeout(updateQualityVisibility, 50);
    });
}

function updateQualityVisibility() {
    if (formatSelect.value == 'image/jpeg') {
        qualityLabel.classList.add('visible');
    } else {
        qualityLabel.classList.remove('visible');
    }
}
