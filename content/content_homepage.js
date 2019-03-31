let downloadLink = document.querySelector('.download-link');
if (downloadLink) {
    downloadLink.innerText = 'See it on Firefox Add-ons website';

    if (!document.querySelector('.addon-info')) {
        let addonIconInfo = document.createElement('div');
        addonIconInfo.className = 'content-block addon-info';
        if (window.location.search.search('updated') != -1) {
            addonIconInfo.classList.add('highlighted');
            addonIconInfo.innerText = `A new version (${browser.runtime.getManifest().version}) of the extension has been installed. You can see the changelog below. `;
        } else if (window.location.search.search('installed') != -1) {
            addonIconInfo.classList.add('highlighted');
            addonIconInfo.innerText = 'Congratulations, the extension has been installed.';
        } else {
            addonIconInfo.innerText = `You have the extension installed (v. ${browser.runtime.getManifest().version}).`;
        }
        addonIconInfo.innerText += " If you'd like to check out the options, please find the icon in the top right corner of the window, where the arrow is pointing.";
        downloadLink.parentNode.insertBefore(addonIconInfo, downloadLink);
    }

    let issueTrackerLink = document.querySelector('.content-block a[title="Facebook Post Screenshot issue tracker"]');
    if (issueTrackerLink) {
        downloadLink.parentNode.insertBefore(issueTrackerLink.closest('.content-block'), downloadLink);
    }
}

if (!document.querySelector('.addon-icon-pointer')) {
    let arrow = document.createElement('div');
    arrow.className = 'addon-icon-pointer';
    arrow.innerText = '⬆';
    document.body.appendChild(arrow);
}
