document.getElementById('new-issue').onclick = _ => window.open('https://github.com/hckr/fb-post-screenshot/issues/new');

let destinationRelativePathInput = document.getElementById('destination-relative-path'),
    saveAsSelect = document.getElementById('save-as'),
    formatSelect = document.getElementById('format'),
    qualityLabel = document.getElementById('quality-label'),
    qualityInput = document.getElementById('quality'),
    maxHeightInput = document.getElementById('max-height'),
    preventCuttingCheckbox = document.getElementById('prevent-cutting'),
    zoomInput = document.getElementById('zoom'),
    sameAsPageZoomCheckbox = document.getElementById('same-as-page-zoom'),
    informAboutUpdateCheckbox = document.getElementById('inform-about-update'),
    screenshotTypeSelect = document.getElementById('screenshot-type'),
    watchGroupCheckbox = document.getElementById('watch-group'),
    watchGroupFrequencyInput = document.getElementById('watch-group-frequency');

let elementEvents = [
    [destinationRelativePathInput, 'input'],
    [saveAsSelect, 'change'],
    [formatSelect, 'change'],
    [qualityInput, 'input'],
    [maxHeightInput, 'input'],
    [preventCuttingCheckbox, 'change'],
    [zoomInput, 'input'],
    [sameAsPageZoomCheckbox, 'change'],
    [informAboutUpdateCheckbox, 'change'],
    [screenshotTypeSelect, 'change'],
    [watchGroupCheckbox, 'change'],
    [watchGroupFrequencyInput, 'input']
];

for (let [el, ev] of elementEvents) {
    el.addEventListener(ev, _ => {
        saveValues();
    });
    switch (el) {
        case formatSelect:
            el.addEventListener(ev, _ => {
                updateQualityVisibility();
            });
            break;
        case sameAsPageZoomCheckbox:
            el.addEventListener(ev, _ => {
                updateZoomInput();
            })
        case watchGroupCheckbox:
            el.addEventListener(ev, _ => {
                updateWatchGroupFrequencyVisibility();
            });
            break;
    }
}

restoreValues();

function saveValues() {
    browser.storage.local.set({
        saveAs: saveAsSelect.value,
        format: formatSelect.value,
        preventCutting: preventCuttingCheckbox.checked,
        sameAsPageZoom: sameAsPageZoomCheckbox.checked,
        informAboutUpdate: informAboutUpdateCheckbox.checked,
        screenshotType: screenshotTypeSelect.value,
        watchGroup: watchGroupCheckbox.checked
    });
    if (destinationRelativePathInput.checkValidity()) {
        browser.storage.local.set({ destinationRelativePath: destinationRelativePathInput.value });
    }
    if (qualityInput.checkValidity()) {
        browser.storage.local.set({ quality: parseFloat(qualityInput.value) });
    }
    if (maxHeightInput.checkValidity()) {
        browser.storage.local.set({ maxHeight: parseInt(maxHeightInput.value) });
    }
    if (zoomInput.checkValidity()) {
        browser.storage.local.set({ zoom: parseInt(zoomInput.value) });
    }
    if (watchGroupFrequencyInput.checkValidity()) {
        browser.storage.local.set({ watchGroupFrequency: parseInt(watchGroupFrequencyInput.value) });
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
        zoomInput.value = values.zoom;
        sameAsPageZoomCheckbox.checked = values.sameAsPageZoom;
        informAboutUpdateCheckbox.checked = values.informAboutUpdate;
        screenshotTypeSelect.value = values.screenshotType;
        watchGroupCheckbox.checked = values.watchGroup;
        watchGroupFrequencyInput.value = values.watchGroupFrequency;
        setTimeout(updateQualityVisibility, 50);
        setTimeout(updateZoomInput, 50);
        setTimeout(updateWatchGroupFrequencyVisibility, 50);
    });
}

function updateQualityVisibility() {
    if (formatSelect.value == 'image/jpeg') {
        qualityLabel.classList.add('visible');
    } else {
        qualityLabel.classList.remove('visible');
    }
}

function updateWatchGroupFrequencyVisibility() {
    let row = document.getElementById('watch-group-frequency-row');
    if (watchGroupCheckbox.checked) {
        row.classList.remove('hidden');
    } else {
        row.classList.add('hidden');
    }
}

function updateZoomInput() {
    zoomInput.disabled = sameAsPageZoomCheckbox.checked
}
