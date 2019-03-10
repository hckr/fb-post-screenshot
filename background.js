function dataURItoBlob(dataURI) {
  var mime = dataURI.split(',')[0].split(':')[1].split(';')[0];
  var binary = atob(dataURI.split(',')[1]);
  var array = [];
  for (var i = 0; i < binary.length; i++) {
     array.push(binary.charCodeAt(i));
  }
  return new Blob([new Uint8Array(array)], {type: mime});
}

let objectURLs = new Map(); // id => objectURL

browser.runtime.onMessage.addListener(data => {
    let objectURL = URL.createObjectURL(dataURItoBlob(data.data_uri));
    browser.downloads.download({
        url: objectURL,
        filename: data.filename
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
