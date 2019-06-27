let menuWrapper = document.getElementById('menu-wrapper');

setTimeout(() => {
    let footerSeparator = document.createElement('div');
    footerSeparator.className = 'panel-section-separator';
    menuWrapper.appendChild(footerSeparator);

    let footer = document.createElement('div');
    footer.className = 'panel-list-item disabled footer';
    footer.innerText = `Facebook Post Screenshot v. ${browser.runtime.getManifest().version}`;
    menuWrapper.appendChild(footer);
});

document.getElementById('show-options').addEventListener('click', _ => {
    browser.runtime.openOptionsPage();
    window.close();
});

document.body.addEventListener('click', e => e.target.closest('a') && setTimeout(window.close, 50));

Promise.all([
    browser.storage.local.get(),
    browser.tabs.executeScript({
        code: '(typeof WATCH_GROUP_RUNNING != "undefined" && WATCH_GROUP_RUNNING == true) ? "RUNNING" : window.location.href'
    })
]).then(([options, [currentTabURL]]) => {
    if (options.watchGroup && (
        currentTabURL.match('https://.+\.facebook\.com/groups/.+') ||
        currentTabURL == 'RUNNING')) {
            let watchGroupOption = document.createElement('div'),
                watchGroupOptionContent = document.createElement('div'),
                separator = document.createElement('div');
            watchGroupOption.classList = '';
            watchGroupOptionContent.classList = 'panel-list-item';
            watchGroupOptionContent.innerText = 'Watch this group';
            watchGroupOption.appendChild(watchGroupOptionContent);
            separator.classList = 'panel-section-separator';
            menuWrapper.insertBefore(separator, menuWrapper.firstChild);
            menuWrapper.insertBefore(watchGroupOption, separator);
            if (currentTabURL == 'RUNNING') {
                watchGroupOptionContent.classList.add('disabled');
                watchGroupOptionContent.innerText += ' (running)';
            } else {
                watchGroupOption.addEventListener('click', _ => {
                    watchGroup(currentTabURL, options.watchGroupFrequency);
                });
            }
    }
});

function watchGroup(tabURL, frequency) {
    let groupChronologicalURL = tabURL.match('(https://.+\.facebook\.com/groups/[^\?/]+)')[1] + '/?sorting_setting=CHRONOLOGICAL';
    browser.tabs.executeScript({
        code: `
            startWatchGroup({
                groupURL: "${groupChronologicalURL}",
                frequency: ${parseInt(frequency)}
            });`
    });
    setTimeout(window.close, 50);
}
