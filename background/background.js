let objectURLs = new Map(); // id => objectURL

let destinationRelativePath = '',
    saveAs = undefined;
function updateLocalOptions(data) {
    if ('destinationRelativePath' in data) {
        destinationRelativePath = data.destinationRelativePath;
    }
    switch (data.saveAs) {
        case 'browser':
            saveAs = undefined;
            break;
        case 'yes':
            saveAs = true;
            break;
        case 'no':
            saveAs = false;
            break;
    }
}
// browser.storage.local.get().then(updateLocalOptions); -- updated in storage_defaults.js - triggers change
browser.storage.onChanged.addListener(changes => {
    let newData = {};
    [].forEach.call(Object.entries(changes), ([k, v]) => {
        newData[k] = v.newValue;
    });
    updateLocalOptions(newData);
});

browser.runtime.onMessage.addListener(data => {
    let blob = dataURItoBlob(data.data_uri),
        objectURL = URL.createObjectURL(blob),
        pathWithFileName = appendExtension([destinationRelativePath, data.filename].filter(x => x.length).join('/'), blob.type);
    browser.downloads.download({
        url: objectURL,
        filename: pathWithFileName,
        saveAs: saveAs
    }).then(id => {
        objectURLs.set(id, objectURL);
    }).catch(_ => {
        URL.revokeObjectURL(objectURL);
    });
});

browser.downloads.onChanged.addListener(delta => {
    if (objectURLs.has(delta.id) && delta.state.current == 'complete') {
        URL.revokeObjectURL(objectURLs.get(delta.id));
        objectURLs.delete(delta.id);
    }
});

function appendExtension(filename, mimetype) {
    let ext = '';
    switch (mimetype) {
        case 'image/png':
            ext = '.png';
            break;
        case 'image/jpeg':
            ext = '.jpg';
            break;
    }
    return filename + ext
}

function dataURItoBlob(dataURI) {
    let mime = dataURI.split(',')[0].split(':')[1].split(';')[0],
        binary = atob(dataURI.split(',')[1]),
        array = [];
    for (let i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
    }
    return new Blob([ new Uint8Array(array) ], { type: mime });
}
