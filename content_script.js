(function(){

let observer = new MutationObserver(callback);
observer.observe(document.documentElement, {
    childList: true,
    subtree: true
});

function callback(mutations) {
    for (let mutation of mutations) {
        for (let node of mutation.addedNodes) {
            if (!node.querySelector) {
                continue;
            }
            let container = node.querySelector('._54ng');
            if (container) {
                if (container.querySelector('.save_screenshot')) {
                    return;
                }
                let menu_item = container.querySelector('.__MenuItem');
                if (menu_item) {
                    let save_screenshot = document.createElement('li');
                    save_screenshot.className = '_54ni _41t6 __MenuItem save_screenshot';
                    save_screenshot.role = 'presentation';
                    save_screenshot.innerHTML = '<a class="_54nc" href="#" role="menuitem" title="Save screenshot of this post"><span><span class="_54nh"><div class="_4p23"><i class="_4p24 img sp_CH8VYa8kmd6 sx_f85522"></i><i class="_4p25 img sp_CH8VYa8kmd6 sx_e405a2"></i><span class="__text">Save screenshot of this post</span></div></span></span></a>';
                    save_screenshot.onmouseover = function() { this.classList.add('_54ne'); };
                    save_screenshot.onmouseout = function() { this.classList.remove('_54ne'); };
                    save_screenshot.onclick = clickHandler;
                    function clickHandler() {
                        save_screenshot.onclick = undefined;
                        let button_text = save_screenshot.querySelector('.__text'),
                            old_text = button_text.innerHTML;
                        button_text.innerHTML = 'Creating screenshot...'
                        let context_layer = findParentWithClass(container, 'uiContextualLayerPositioner'),
                            menu_arrow = document.getElementById(context_layer.getAttribute('data-ownerid')),
                            post = findParentWithClass(menu_arrow, 'fbUserContent'),
                            permalink = post.querySelector('abbr').parentNode.href,
                            post_window = window.open(permalink, 's', 'width=100, height=100, left=0, top=0, resizable=yes, toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no');
                        post.click();
                        setTimeout(() => sendMessage(post_window, { type: 'command', command: 'screenshot' }, response => {
                            let post_id = permalink.match(/(\d+)(?!.*\d)/)[1],
                                part_nr = 1;
                            for (let image_data_url of response.image_data_urls) {
                                let a = document.createElement('a');
                                a.href = image_data_url;
                                if (response.image_data_urls.length > 1) {
                                    a.download = `post-${post_id}-${part_nr++}-of-${response.image_data_urls.length}.jpg`;
                                } else {
                                    a.download = `post-${post_id}.jpg`;
                                }
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                            }
                            button_text.innerHTML = old_text;
                            save_screenshot.onclick = clickHandler;
                        }), 500);
                    }
                    menu_item.parentNode.insertBefore(save_screenshot, menu_item);
                    return;
                }
            }
        }
    }
}

let callbacks = {};

function sendMessage(win, json_data, callback) {
    let new_id = +new Date();
    callbacks[new_id] = callback;
    json_data['id'] = new_id;
    win.postMessage(JSON.stringify(json_data), 'https://www.facebook.com');
}

window.addEventListener('message', e => {
    let origin = e.origin || e.originalEvent.origin;
    if (origin !== 'https://www.facebook.com')
        return;
    if (e.data[0] !== '{')
        return;
    let data = JSON.parse(e.data);
    console.log(data);
    switch(data.type) {
        case 'command':
            switch (data.command) {
                case 'screenshot':
                    function initScreenshot() {
                        document.querySelector('title').innerHTML = 'Screenshooting...';
                        document.body.insertAdjacentHTML('beforeend', '<div style="position: fixed; top: 0; right: 0; bottom: 0; left: 0; z-index: 5000; color: #ddf; background: #111; display: table; width:100%; height:100%; font-size: 24px"><span style="display: table-cell; vertical-align: middle; text-align: center;">Please wait...<br>Do not close any windows!</span></div>');
                        screenshotPostInCurrentWindow(image_data_urls => {
                            e.source.postMessage(JSON.stringify({ type: 'response', id: data.id, image_data_urls: image_data_urls }), origin);
                            window.close();
                        });
                    }
                    window.addEventListener('load', initScreenshot);
                    if (document.readyState === 'complete') {
                        initScreenshot();
                    }
                    break;
            }
            break;
        case 'response':
            if (data.id in callbacks) {
                callbacks[data.id](data);
                delete callbacks[data.id];
            } else {
                console.warn('no callback for ' + data.id);
            }
            break;
    }
});

function screenshotPostInCurrentWindow(callback) {
    let post = document.querySelector('.fbUserContent'),
        post_wrapper = post.parentNode.parentNode;
    post_wrapper.style = post.style || '';

    let unfoldQueue = [];

    function discoverUnfoldLinks() {
        let pagers = post.querySelectorAll('.UFIPagerLink');
        pagers.forEach(node => node.__wait = 1000);
        let seeMores = post.querySelectorAll('.fss');
        seeMores.forEach(node => node.__wait = 150);
        let replies = [].filter.call(post.querySelectorAll('.UFICommentLink'), node => {
            node.__wait = 1000;
            return node.parentNode.parentNode.childNodes.length == 1;
        });
        unfoldQueue.push(...pagers);
        unfoldQueue.push(...replies);
        unfoldQueue.push(...seeMores);

        console.log(unfoldQueue);
    }

    function unfoldComments(callback) {
        if (!unfoldQueue.length) {
            discoverUnfoldLinks();
        }
        unfoldComments2(callback);
    }

    function unfoldComments2(callback) {
        if (unfoldQueue.length) {
            let node = unfoldQueue.pop();
            node.click();
            setTimeout(unfoldComments, node.__wait, callback);
        } else {
            setTimeout(callback, 150);
        }
    }

    unfoldComments(() => {
        for (let node of post.querySelectorAll('.UFIAddComment')) {
            node.parentNode.removeChild(node);
        }
        window.scrollTo(0, 0);
        let rect = post_wrapper.getBoundingClientRect(),
            x = Math.ceil(rect.x),
            y = Math.ceil(rect.y),
            width = Math.ceil(rect.width),
            height = Math.ceil(rect.height);
        let canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d');
        let maxPartSize = 8192,
            currentY = y,
            leftHeight = height,
            image_data_urls = [];
        while (leftHeight > 0) {
            let partHeight = leftHeight;
            if (leftHeight > maxPartSize) {
                partHeight = maxPartSize;
            }

            canvas.width = width;
            canvas.height = partHeight;
            ctx.drawWindow(window, x, y, width, partHeight, 'rgb(255,255,255)');
            image_data_urls.push(canvas.toDataURL(callback, 'image/jpeg', 0.95));

            y += partHeight;
            leftHeight -= partHeight;

            console.log(height, leftHeight, partHeight, y);
        }
        callback(image_data_urls);
    });
}

function findParentWithClass(el, klass) {
    let cur = el;
    while (cur !== document.documentElement) {
        cur = cur.parentNode;
        if (cur.classList.contains(klass)) {
            break;
        }
    }
    return cur;
}

})();
