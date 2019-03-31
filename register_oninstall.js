browser.runtime.onInstalled.addListener(({ reason }) => {
    switch (reason) {
        case 'install':
            browser.tabs.create({ url: 'https://hckr.pl/fb-post-screenshot/?installed' });
            break;
        case 'update': 
            browser.tabs.create({ url: 'https://hckr.pl/fb-post-screenshot/?updated' });
            break;
    }
});
