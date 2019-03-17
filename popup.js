document.querySelector('.footer').innerText += ` v. ${browser.runtime.getManifest().version}`;

document.getElementById('show-options').addEventListener('click', _ => {
    browser.runtime.openOptionsPage();
    window.close();
});

document.body.addEventListener('click', e => e.target.closest('a') && setTimeout(window.close, 50));
