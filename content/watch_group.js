let watchGroupConfig = {},
    savedWatchGroupConfig = sessionStorage.getItem('fbps_watchGroupConfig'),
    reloadTimeout,
    stopCheckInterval;

if (savedWatchGroupConfig) {
    watchGroupConfig = JSON.parse(savedWatchGroupConfig);
    stopCheckInterval = setInterval(checkIfAndStopWatchGroup, 5000);
    if (window.location.href == watchGroupConfig.groupURL) {
        WATCH_GROUP_RUNNING = true;
        if (document.readyState === 'complete') {
            screenshot();
        } else {
            window.addEventListener('load', screenshot);
        }
    } else {
        stopWatchGroup();
    }
}

function checkIfAndStopWatchGroup() {
    if (window.location.href != watchGroupConfig.groupURL) {
        clearTimeout(reloadTimeout);
        clearInterval(stopCheckInterval);
        WATCH_GROUP_RUNNING = false;
        sessionStorage.removeItem('fbps_watchGroupConfig');
        sessionStorage.removeItem('fbps_prevId');
    }
}

function startWatchGroup(cfg) {
    watchGroupConfig = cfg;
    sessionStorage.setItem('fbps_watchGroupConfig', JSON.stringify(cfg));
    window.location.href = watchGroupConfig.groupURL;
}

function screenshot() {
    reloadTimeout = setTimeout(
        _ => (window.location.href = watchGroupConfig.groupURL),
        watchGroupConfig.frequency * 1000
    );

    let announcements = document.getElementById('pagelet_announcement_posts');
    announcements.parentNode.removeChild(announcements);

    let post_id = document
            .querySelector('a[href*="/permalink"')
            .href.replace(/.+permalink/, '')
            .match(/\d{2,}/)[0],
        previous_post_id = sessionStorage.getItem('fbps_prevId');

    if (previous_post_id == post_id) return;

    let feed = document.querySelector('[role=feed]');
    if (feed) {
        feed.style.position = 'relative';
        feed.style.zIndex = 1000000;
    }

    browser.storage.local.get().then(values => {
        screenshotPostInCurrentWindow({
            options: {
                zoom: values['zoom'],
                maxHeight: values['maxHeight'],
            },
            callback: image_data_urls => {
                browser.runtime.sendMessage({
                    command: 'download',
                    data_uri: image_data_urls[0],
                    filename: `post-${post_id}`,
                    save_as_dialog: false,
                });
                sessionStorage.setItem('fbps_prevId', post_id);
            },
        });
    });

    if (feed) {
        feed.classList.remove('fb_post_screenshot__feed');
    }
}
