(function(){

let observer = new MutationObserver(callback);
observer.observe(document.documentElement, {
    childList: true,
    subtree: true
});

let infobox = document.createElement('div'),
    infobox_timeout = null;

infobox.style = 'position: fixed; top: 50px; left: calc(50% - 150px); border-radius: 3px; width: 350px; font-height: 30px; height: 30px; font-size: 14px; text-align: center; background-color: #d4e4f1; color: #1e394f; z-index: 1000; transition: .5s opacity ease-in;';
infobox.style.display = 'none';
infobox.style.opacity = 0;
document.body.appendChild(infobox);

function showInfoBox(msg) {
    infobox.innerText = msg;
    infobox.style.display = 'block';
    infobox.style.opacity = 1;
    clearTimeout(infobox_timeout);
    infobox_timeout = setTimeout(_ => {
        infobox.style.opacity = 0;
        setTimeout(_ => infobox.style.display = 'none', 600);
    }, 5000);
}

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
                    context_layer = findParentWithEitherClass(container, ['uiContextualLayerPositioner']);
                    menu_arrow = document.getElementById(context_layer.getAttribute('data-ownerid'));
                    post = findParentWithEitherClass(menu_arrow, ['userContentWrapper', 'fbPhotoSnowliftContainer']);
                    permalink = post.querySelector('abbr').parentNode.href;
                    if (!permalink) {
                        return;
                    }
                } catch (e) {
                    return;
                }
                let menu_item = container.querySelector('.__MenuItem');
                if (menu_item) {
                    function createMenuElement(button_text, button_text2) {
                        let button = document.createElement('li');
                        button.className = '_54ni _41t6 __MenuItem save_screenshot' + (menu_item.querySelector('._xaa._4i13') ? ' _xaa _4i13' : '');
                        button.role = 'presentation';
                        let button_a = document.createElement('a');
                        button_a.className = '_54nc';
                        button_a.setAttribute('role', 'menuitem');
                        button_a.title = button_text;
                        button.appendChild(button_a);
                        let button_a_span = document.createElement('span');
                        button_a.appendChild(button_a_span);
                        let button_a_span_span = document.createElement('span');
                        button_a_span_span.className = '_54nh';
                        button_a_span.appendChild(button_a_span_span);
                        let button_a_span_span_div = document.createElement('div');
                        button_a_span_span_div.className = '_4p23' + (menu_item.querySelector('._2ezx') ? ' _2ezx' : '');
                        button_a_span_span.appendChild(button_a_span_span_div);
                        let save_post_i_els = container.querySelector('[ajaxify^="/save"]').querySelectorAll('i');
                        let button_a_span_span_div_i1 = document.createElement('i');
                        button_a_span_span_div_i1.className = save_post_i_els[0].className;
                        let button_a_span_span_div_i2 = document.createElement('i');
                        button_a_span_span_div.appendChild(button_a_span_span_div_i1);
                        button_a_span_span_div_i2.className = save_post_i_els[1].className;
                        button_a_span_span_div.appendChild(button_a_span_span_div_i2);
                        let button_text_node = document.createTextNode(button_text);
                        button_a_span_span_div.appendChild(button_text_node);
                        button.onmouseover = function() { this.classList.add('_54ne'); };
                        button.onmouseout = function() { this.classList.remove('_54ne'); };
                        button.toggleText = function() {
                            if (button_text_node.textContent == button_text) {
                                button_text_node.textContent = button_text2;
                            } else {
                                button_text_node.textContent = button_text;
                            }
                        }
                        return button;
                    }
                    let save_screenshot = createMenuElement('Save screenshot', 'Creating screenshot...');
                    save_screenshot.onclick = clickHandler.bind(save_screenshot, false);
                    let save_screenshot_anon = createMenuElement('Save anonymized screenshot', 'Creating screenshot...');
                    save_screenshot_anon.onclick = clickHandler.bind(save_screenshot_anon, true);
                    function clickHandler(anonymize) {
                        let old_onclick = this.onclick;
                        this.onclick = undefined;
                        this.toggleText();
                        let post_window = window.open(permalink, 's', 'width=300, height=100, left=0, top=0, toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no');
                        post.click();
                        this.toggleText();
                        this.onclick = old_onclick;
                        
                        let received_secret = "";

                        function responseCallback(response) {
                            if ('confirmation_secret' in response) {
                                received_secret = response.confirmation_secret;
                                return;
                            }
                            let post_id = permalink.replace(/.+permalink/, '').match(/\d{2,}/)[0],
                                part_nr = 1;
                            
                            showInfoBox(`Saving screenshot of post ${post_id}...`);                            
                            
                            for (let image_data_url of response.image_data_urls) {
                                let filename;
                                if (response.image_data_urls.length > 1) {
                                    filename = `post-${post_id}-${part_nr++}-of-${response.image_data_urls.length}`;
                                } else {
                                    filename = `post-${post_id}`;
                                }
                                browser.runtime.sendMessage({
                                    command: 'download',
                                    data_uri: image_data_url,
                                    filename: filename
                                });
                            }
                        }
                        let confirmation_secret = Math.random().toString();
                        (function try_send_command_until_confirmation_received() {
                            if (received_secret != confirmation_secret) {
                                sendMessage(post_window, { type: 'command', command: 'screenshot', arguments: [ anonymize, confirmation_secret ] }, responseCallback);
                                setTimeout(try_send_command_until_confirmation_received, 1000);
                            }
                        })();
                    }
                    menu_item.parentNode.insertBefore(save_screenshot, menu_item);
                    menu_item.parentNode.insertBefore(save_screenshot_anon, menu_item);
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

let received_screenshot_command = false;

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
                    if (received_screenshot_command) {
                        break;
                    }
                    received_screenshot_command = true;
                    function initScreenshot() {
                        window.title = 'Screenshooting...';
                        let notice_outer_div = document.createElement('div');
                        notice_outer_div.style = 'position: fixed; top: 0; right: 0; bottom: 0; left: 0; z-index: 5000; color: #d4e4f1; background: #1e394f; display: table; width:100%; height:100%; font-size: 18px';
                        let notice_inner_span = document.createElement('span');
                        notice_inner_span.style = 'display: table-cell; vertical-align: middle; text-align: center';
                        notice_inner_span.appendChild(document.createTextNode('Please wait...'));
                        notice_inner_span.appendChild(document.createElement('br'));
                        notice_inner_span.appendChild(document.createTextNode('Do not close any windows!'));
                        notice_inner_span.appendChild(document.createElement('br'));
                        let status_span = document.createElement('span');
                        status_span.style = 'font-size: 12px';
                        status_span.innerHTML = 'Status: clicked <span id="__fb_post_screenshot_status_clicks_made">0</span> times, at least <span id="__fb_post_screenshot_status_clicks_more">0</span> more clicks...';
                        notice_inner_span.appendChild(status_span);
                        notice_outer_div.appendChild(notice_inner_span);
                        document.body.appendChild(notice_outer_div);
                        e.source.postMessage(JSON.stringify({ type: 'response', id: data.id, confirmation_secret: data.arguments[1] }), origin);
                        screenshotPostInCurrentWindow(data.arguments[0], image_data_urls => {
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
                // delete callbacks[data.id];
            }
            break;
    }
});

function screenshotPostInCurrentWindow(anonymize, callback) {
    // hide theater view:
    let style = document.createElement('style');
    document.head.appendChild(style);
    style.sheet.insertRule('#photos_snowlift { display: none; }', 0);
    // ------------------
    
    let postWrapper = document.querySelector('.userContentWrapper');
    findParentWithEitherClass(postWrapper, 'feed').style += ';position: relative; left: 1000px; background: white; z-index: 1000000;';

    let unfoldQueue = [];

    function discoverUnfoldLinks() {
        let pagers = postWrapper.querySelectorAll('.UFIPagerLink');
        pagers.forEach(node => node.__wait = 1000);
        let seeMores = postWrapper.querySelectorAll('.fss');
        seeMores.forEach(node => node.__wait = 150);
        let replies = [].filter.call(postWrapper.querySelectorAll('._4sxc, .UFIReplyList .UFICommentLink'),
                                     node => !node.querySelector('.UFICollapseIcon'));
        replies.forEach(node => node.__wait = 1000);
        unfoldQueue.push(...pagers);
        unfoldQueue.push(...seeMores);
        unfoldQueue.push(...replies);
        let pollOptions = postWrapper.querySelector('._3coo');
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
        let clicks_made = document.querySelector('#__fb_post_screenshot_status_clicks_made'),
            clicks_more = document.querySelector('#__fb_post_screenshot_status_clicks_more');
            clicks_more.innerText = unfoldQueue.length;
        if (unfoldQueue.length) {
            let node = unfoldQueue.pop();
            node.click();
            clicks_made.innerText = parseInt(clicks_made.innerText) + 1;
            setTimeout(unfoldComments, node.__wait, callback);
        } else {
            setTimeout(callback, 150);
        }
    }

    function anonymizePost() {
        let i = 1,
            profileLinkToAnonymousName = {};

        let opEl = document.querySelector('h5 a');
        profileLinkToAnonymousName[extractProfileId(opEl)] = 'OP';
        opEl.textContent = 'OP';

        for (let nameEl of postWrapper.querySelectorAll(':not(.fcg) > .profileLink, ._6qw4, .UFICommentActorName')) {
            let profileLink = extractProfileId(nameEl);
            if (!profileLinkToAnonymousName[profileLink]) {
                profileLinkToAnonymousName[profileLink] = 'Profile ' + i;
                ++i;
            }
            nameEl.textContent = profileLinkToAnonymousName[profileLink];
        }

        for (let avatar of [postWrapper.querySelector('img'), ...postWrapper.querySelectorAll('._3mf5, .UFIActorImage')]) {
            avatar.style = (avatar.style || '') + ';filter: blur(3px);';
        }

        let reactionsTextEl = document.querySelector('._3dlh span');
        if (reactionsTextEl) {
            let reactionsText = reactionsTextEl.textContent,
                reactionsCountArr = reactionsText.match(/\d+/),
                reactionsCountStr = reactionsCountArr ? reactionsCountArr[0] : '0';

            if (reactionsCountStr.length != reactionsText.length) {
                reactionsCountStr = parseInt(reactionsCountStr) + 1;
                if (reactionsText.indexOf(',') !== -1) {
                    reactionsCountStr += 1;
                }
            }
            reactionsTextEl.textContent = reactionsCountStr;
        }

        function extractProfileId(a) {
            let oldFormat = /profile.php\?id=([0-9]+)/,
                newFormat = /com\/([^?]+?)(?:\?|\/|$)/;
            return (a.href.match(oldFormat) || a.href.match(newFormat) || '  ')[1];
        }
    }

    unfoldComments(() => {
        if (anonymize) {
            anonymizePost();
        }
        
        browser.storage.local.get().then(options => {
            window.scrollTo(0, 0);
            let rect = postWrapper.getBoundingClientRect(),
                x = Math.ceil(rect.x),
                y = Math.ceil(rect.y),
                width = Math.ceil(rect.width),
                height = Math.ceil(rect.height);
            let canvas = document.createElement('canvas'),
                ctx = canvas.getContext('2d');
            let maxPartSize = 8192,
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
                image_data_urls.push(canvas.toDataURL(options.format, options.quality));

                y += partHeight;
                leftHeight -= partHeight;
            }
            callback(image_data_urls);
        });
    });
}

function findParentWithEitherClass(el, classes) {
    let cur = el;
    while (cur !== document.documentElement) {
        cur = cur.parentNode;
        for (let klass of classes) {
            if (cur.classList.contains(klass)) {
                return cur;
            }
        }
    }
    return cur;
}

})();
