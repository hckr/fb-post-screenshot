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
                let context_layer, menu_arrow, post, permalink;
                try {
                    context_layer = findParentWithClass(container, 'uiContextualLayerPositioner'),
                    menu_arrow = document.getElementById(context_layer.getAttribute('data-ownerid')),
                    post = findParentWithClass(menu_arrow, 'fbUserContent'),
                    permalink = post.querySelector('abbr').parentNode.href;
                    if (!permalink) {
                        return;
                    }
                } catch (e) {
                    return;
                }
                let menu_item = container.querySelector('.__MenuItem');
                if (menu_item) {
                    let save_screenshot = document.createElement('li'),
                        button_text = 'Save screenshot of this post';
                    save_screenshot.className = '_54ni _41t6 __MenuItem save_screenshot';
                    save_screenshot.role = 'presentation';
                    let save_screenshot_a = document.createElement('a');
                    save_screenshot_a.className = '_54nc';
                    save_screenshot_a.setAttribute('role', 'menuitem');
                    save_screenshot_a.title = button_text;
                    save_screenshot.appendChild(save_screenshot_a);
                    let save_screenshot_a_span = document.createElement('span');
                    save_screenshot_a.appendChild(save_screenshot_a_span);
                    let save_screenshot_a_span_span = document.createElement('span');
                    save_screenshot_a_span_span.className = '_54nh';
                    save_screenshot_a_span.appendChild(save_screenshot_a_span_span);
                    let save_screenshot_a_span_span_div = document.createElement('div');
                    save_screenshot_a_span_span_div.className = '_4p23';
                    save_screenshot_a_span_span.appendChild(save_screenshot_a_span_span_div);
                    let save_post_i_els = container.querySelector('[ajaxify^="/save"]').querySelectorAll('i');
                    let save_screenshot_a_span_span_div_i1 = document.createElement('i');
                    save_screenshot_a_span_span_div_i1.className = save_post_i_els[0].className;
                    let save_screenshot_a_span_span_div_i2 = document.createElement('i');
                    save_screenshot_a_span_span_div.appendChild(save_screenshot_a_span_span_div_i1);
                    save_screenshot_a_span_span_div_i2.className = save_post_i_els[1].className;
                    save_screenshot_a_span_span_div.appendChild(save_screenshot_a_span_span_div_i2);
                    let button_text_node = document.createTextNode(button_text);
                    save_screenshot_a_span_span_div.appendChild(button_text_node);
                    // save_screenshot.innerHTML = '<div class="_4p23"><i class="_4p24 img sp_CH8VYa8kmd6 sx_f85522"></i><i class="_4p25 img sp_CH8VYa8kmd6 sx_e405a2"></i><span class="__text"></span></div></span></span></a>';
                    save_screenshot.onmouseover = function() { this.classList.add('_54ne'); };
                    save_screenshot.onmouseout = function() { this.classList.remove('_54ne'); };
                    save_screenshot.onclick = clickHandler;
                    function clickHandler() {
                        save_screenshot.onclick = undefined;
                        button_text_node.textContent = 'Creating screenshot...'
                        let post_window = window.open(permalink, 's', 'width=300, height=100, left=0, top=0, resizable=yes, toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no');
                        post.click();
                        function responseCallback(response) {
                            let post_id = permalink.match(/(\d{2,})(?!.*\d{2,})/)[1],
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
                            button_text_node.textContent = button_text;
                            save_screenshot.onclick = clickHandler;
                        }
                        setTimeout(() => { sendMessage(post_window, { type: 'command', command: 'screenshot' }, responseCallback); }, 5000);
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
    switch(data.type) {
        case 'command':
            switch (data.command) {
                case 'screenshot':
                    function initScreenshot() {
                        document.querySelector('title').textContent = 'Screenshooting...';
                        let notice_outer_div = document.createElement('div');
                        notice_outer_div.style = 'position: fixed; top: 0; right: 0; bottom: 0; left: 0; z-index: 5000; color: #acf; background: #138; display: table; width:100%; height:100%; font-size: 24px';
                        let notice_inner_span = document.createElement('span');
                        notice_inner_span.style = 'display: table-cell; vertical-align: middle; text-align: center';
                        notice_inner_span.appendChild(document.createTextNode('Please wait...'));
                        notice_inner_span.appendChild(document.createElement('br'));
                        notice_inner_span.appendChild(document.createTextNode('Do not close any windows!'));
                        notice_outer_div.appendChild(notice_inner_span);
                        document.body.appendChild(notice_outer_div);
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
            }
            break;
    }
});

function screenshotPostInCurrentWindow(callback) {
    let post = document.querySelector('.fbUserContent'),
        post_wrapper = post.parentNode.parentNode;
    post_wrapper.style = post.style || '';
    post_wrapper.style += ';postition: relative; left: 200px; z-index: 1000000;';

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
        let pollOptions = post.querySelector('._3coo');
        if (pollOptions) {
            pollOptions.__wait = 10;
            unfoldQueue.push(pollOptions);
        }
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

    function anonymize() {
        let i = 1,
            profileLinkToAnonymousName = {};

        let opEl = document.querySelector('h5 a');
        profileLinkToAnonymousName[extractProfileLink(opEl)] = 'OP';
        opEl.textContent = 'OP';

        for (let nameEl of post.querySelectorAll('.UFICommentActorName, .profileLink')) {
            let profileLink = extractProfileLink(nameEl);
            if (!profileLinkToAnonymousName[profileLink]) {
                profileLinkToAnonymousName[profileLink] = 'Profile ' + i;
                ++i;
            }
            nameEl.textContent = profileLinkToAnonymousName[profileLink];
        }

        for (let avatar of [post.querySelector('img'), ...post.querySelectorAll('.UFIActorImage, .uiList img')]) {
            avatar.style = (avatar.style || '') + ';filter: blur(3px);';
        }

        let reactionsTextEl = document.querySelector('._4arz span'),
            reactionsText = reactionsTextEl.textContent,
            reactionsCountArr = reactionsText.match(/\d+/),
            reactionsCountStr = reactionsCountArr ? reactionsCountArr[0] : '0';

        if (reactionsCountStr.length != reactionsText.length) {
            reactionsCountStr = parseInt(reactionsCountStr) + 1;
        }
        reactionsTextEl.textContent = reactionsCountStr;

        function extractProfileLink(a) {
            return a.href.match(/[^?]+/)[0];
        }
    }

    unfoldComments(() => {
        // hide theater view:
        let style = document.createElement('style');
        document.head.appendChild(style);
        style.sheet.insertRule('#photos_snowlift { display: none; }', 0);
        // ------------------
        let commentAsSelector = document.querySelector('._pbn');
        if (commentAsSelector) {
            commentAsSelector.parentNode.removeChild(commentAsSelector);
        }
        for (let node of post.querySelectorAll('.UFIAddComment')) {
            node.parentNode.removeChild(node);
        }

        // anonymize();

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
            image_data_urls.push(canvas.toDataURL('image/jpeg', 0.95));

            y += partHeight;
            leftHeight -= partHeight;
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
