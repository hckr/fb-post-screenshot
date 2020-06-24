const defaults = {
    destinationRelativePath: '',
    saveAs: 'browser',
    format: 'image/png',
    quality: 0.95,
    maxHeight: 8192,
    preventCutting: true,
    zoom: 100,
    sameAsPageZoom: false,
    informAboutUpdate: true,
    screenshotType: 'with-all-comments',
    watchGroup: false,
    watchGroupFrequency: 60,
};

browser.storage.local
    .get()
    .then(values => browser.storage.local.set(Object.assign(Object.assign({}, defaults), values)));
