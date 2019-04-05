browser.runtime.onInstalled.addListener(({ reason }) => {
    switch (reason) {
        case 'install':
            browser.tabs.create({ url: 'https://hckr.pl/fb-post-screenshot/?installed' });
            break;
        case 'update':
            browser.storage.local.get().then(values => {
                if (values.informAboutUpdate) {
                    browser.tabs.create({ url: 'https://hckr.pl/fb-post-screenshot/?updated' });
                }
            });
            break;
    }
});
