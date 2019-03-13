const defaults = {
    format: 'image/png',
    quality: 0.95
};

browser.storage.local.get().then(values =>
    browser.storage.local.set(
        Object.assign(Object.assign({}, defaults), values)));
