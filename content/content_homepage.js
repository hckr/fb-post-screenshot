let downloadLink = document.querySelector('.download-link');
if (downloadLink) {
    downloadLink.innerText = 'See it on Firefox Add-ons website';

    if (!document.querySelector('.addon-info')) {
        let addonIconInfo = document.createElement('div');
        addonIconInfo.className = 'content-block addon-info';
        if (window.location.search.search('updated') != -1) {
            addonIconInfo.classList.add('highlighted');
            let highlightedText = document.createElement('span');
            highlightedText.className = 'highlighted-text';
            highlightedText.innerText = `A new version (${
                browser.runtime.getManifest().version
            }) of the extension has been installed. You can see the changelog below. `;
            addonIconInfo.appendChild(highlightedText);
        } else if (window.location.search.search('installed') != -1) {
            addonIconInfo.classList.add('highlighted');
            let highlightedText = document.createElement('span');
            highlightedText.className = 'highlighted-text';
            highlightedText.innerText = 'Congratulations, the extension has been installed.';
            addonIconInfo.appendChild(highlightedText);
        } else {
            let highlightedText = document.createElement('span');
            highlightedText.className = 'highlighted-text';
            highlightedText.innerText = `You have the extension installed (v. ${
                browser.runtime.getManifest().version
            }).`;
            addonIconInfo.appendChild(highlightedText);
        }
        addonIconInfo.appendChild(
            document.createTextNode(
                " If you'd like to check out the options, please find the icon in the top right corner of the window, where the arrow is pointing."
            )
        );
        if (window.location.search.search('updated') != -1) {
            addonIconInfo.appendChild(
                document.createTextNode(
                    ' You can prevent the opening of this page on every update by changing an option.'
                )
            );
        }
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
