function dataURItoBlob(dataURI) {
  var mime = dataURI.split(',')[0].split(':')[1].split(';')[0];
  var binary = atob(dataURI.split(',')[1]);
  var array = [];
  for (var i = 0; i < binary.length; i++) {
     array.push(binary.charCodeAt(i));
  }
  return new Blob([new Uint8Array(array)], {type: mime});
}

browser.runtime.onMessage.addListener(({data_uri, filename}) => {
    browser.downloads.download({
        url: URL.createObjectURL(dataURItoBlob(data_uri)),
        filename: filename
    });
});
