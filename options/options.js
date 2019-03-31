document.getElementById('new-issue').onclick = _ => window.open('https://github.com/hckr/fb-post-screenshot/issues/new');

let destinationRelativePathInput = document.getElementById('destination-relative-path'),
    saveAsSelect = document.getElementById('save-as'),
    formatSelect = document.getElementById('format'),
    qualityLabel = document.getElementById('quality-label'),
    qualityInput = document.getElementById('quality'),
    maxHeightInput = document.getElementById('max-height'),
    preventCuttingCheckbox = document.getElementById('prevent-cutting');

let elementEvents = [
    [destinationRelativePathInput, 'input'],
    [saveAsSelect, 'change'],
    [formatSelect, 'change'],
    [qualityInput, 'input'],
    [maxHeightInput, 'input'],
    [preventCuttingCheckbox, 'change']
];

for (let [el, ev] of elementEvents) {
    el.addEventListener(ev, _ => {
        saveValues();
        updateQualityVisibility();
    });
}

restoreValues();

function saveValues() {
    browser.storage.local.set({
        saveAs: saveAsSelect.value,
        format: formatSelect.value,
        preventCutting: preventCuttingCheckbox.checked
    });
    if (destinationRelativePathInput.checkValidity()) {
        browser.storage.local.set({ destinationRelativePath: destinationRelativePathInput.value });
    }
    if(qualityInput.checkValidity()) {
        browser.storage.local.set({ quality: parseFloat(qualityInput.value) });
    }
    if(maxHeightInput.checkValidity()) {
        browser.storage.local.set({ maxHeight: parseInt(maxHeightInput.value) });
    }
}

function restoreValues() {
    browser.storage.local.get().then(values => {
        destinationRelativePathInput.value = values.destinationRelativePath;
        saveAsSelect.value = values.saveAs;
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
