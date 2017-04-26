function rewriteHeader(e) {
    for (var header of e.responseHeaders) {
        if (header.name.toLowerCase() == 'x-frame-options') {
            header.value = 'ALLOW';
            break;
        }
    }
    return {
        responseHeaders: e.responseHeaders
    };
}

browser.webRequest.onHeadersReceived.addListener(
    rewriteHeader,
    { urls: [ '*://*.facebook.com/*' ] },
    [ "blocking", "responseHeaders" ]
);
