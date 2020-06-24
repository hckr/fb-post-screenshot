browser.runtime.onInstalled.addListener(({reason}) => {
    switch (reason) {
        case 'install':
            browser.tabs.create({url: 'https://hckr.pl/fb-post-screenshot/?installed'});
            break;
        case 'update':
            browser.storage.local.get().then(values => {
                if (values.informAboutUpdate) {
                    browser.tabs.create({url: 'https://hckr.pl/fb-post-screenshot/?updated'});
                }
            });
            break;
    }
});

browser.runtime.setUninstallURL(
    'https://docs.google.com/forms/d/e/1FAIpQLSf60CRLXn1wINJnYst2aykHMicQ01fWk4SsMgwj0z0D7hy3pg/viewform?usp=sf_link'
);
