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
                            let a = document.createElement('a');
                            a.href = response.image_data_url;
                            a.download = 'post.png';
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
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
    console.log(json_data);
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
                    console.log('here maybe?');
                    screenshotPostInCurrentWindow(image_data_url => {
                        e.source.postMessage(JSON.stringify({ type: 'response', id: data.id, image_data_url: image_data_url }), origin);
                        // window.close();
                    });
                    break;
            }
            break;
        case 'response':
            if (data.id in callbacks) {
                callbacks[data.id](data);
                delete callbacks[data.id];
            } else {
                console.log('no callback for ' + data.id);
            }
            break;
    }
});

function screenshotPostInCurrentWindow(callback) {
    window.addEventListener('load', function() {
        let post = document.querySelector('.fbUserContent'),
            post_wrapper = post.parentNode.parentNode;
        post_wrapper.style = post.style || '';
        post_wrapper.style += ';postition: relative; z-index: 1000000;';

        let unfoldQueue = [];

        function discoverUnfoldLinks() {
            let pagers = post.querySelectorAll('.UFIPagerLink');
            pagers.forEach(node => node.__wait = 5000);
            let seeMores = post.querySelectorAll('.fss');
            seeMores.forEach(node => node.__wait = 150);
            let replies = [].filter.call(post.querySelectorAll('.UFICommentLink'), node => {
                if (node.__visited)
                    return false;
                node.__visited = true;
                node.__wait = 1500;
                return true;
            });
            unfoldQueue.push(...pagers);
            unfoldQueue.push(...replies);
            unfoldQueue.push(...seeMores);

            console.log(unfoldQueue);
        }

        function unfoldComments(callback) {
            if (!unfoldQueue.length) {
                discoverUnfoldLinks();
                setTimeout(unfoldComments2, 10, callbacks);
            } else {
                unfoldComments2(callback);
            }
        }

        function unfoldComments2(callback) {
            if (unfoldQueue.length) {
                let node = unfoldQueue.pop();
                node.click();
                setTimeout(unfoldComments, node.__wait, callback);
            } else {
                console.log('Is it really nothing?');
                console.log([].filter.call(post.querySelectorAll('.UFICommentLink'), node => {
                    if (node.__visited)
                        return false;
                    return true;
                }));
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
            canvas.width = width;
            canvas.height = height;
            ctx.drawWindow(window, x, y, width, height, 'rgb(255,255,255)');
            callback(canvas.toDataURL());
        });
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
