let formatSelect = document.getElementById('format'),
    qualityLabel = document.getElementById('quality-label'),
    qualityInput = document.getElementById('quality'),
    maxHeightInput = document.getElementById('max-height'),
    preventCuttingCheckbox = document.getElementById('prevent-cutting');

for (let [el, ev] of [[formatSelect, 'change'], [qualityInput, 'input'], [maxHeightInput, 'input'], [preventCuttingCheckbox, 'change']]) {
    el.addEventListener(ev, _ => {
        saveValues();
        updateQualityVisibility();
    });
}

restoreValues();

function saveValues() {
    browser.storage.local.set({
        format: formatSelect.value,
        preventCutting: preventCuttingCheckbox.checked
    });
    if(qualityInput.checkValidity()) {
        browser.storage.local.set({ quality: parseFloat(qualityInput.value) });
    }
    if(maxHeightInput.checkValidity()) {
        browser.storage.local.set({ maxHeight: parseInt(maxHeightInput.value) });
    }
}

function restoreValues() {
    browser.storage.local.get().then(values => {
        formatSelect.value = values.format;
        qualityInput.value = values.quality;
        maxHeightInput.value = values.maxHeight;
        preventCuttingCheckbox.checked = values.preventCutting;
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
