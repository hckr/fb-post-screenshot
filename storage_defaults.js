const defaults = {
    format: 'image/png',
    quality: 0.95,
    maxHeight: 8192,
    preventCutting: true
};

browser.storage.local.get().then(values =>
    browser.storage.local.set(
        Object.assign(Object.assign({}, defaults), values)));
