(function(){

var observer = new MutationObserver(callback);
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
                            permalink = post.querySelector('.timestamp').parentNode.href;
                        screenshotPost(permalink, (image_data_url) => {
                            post.click();
                            let a = document.createElement('a');
                            a.href = image_data_url;
                            a.download = 'post.png';
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            button_text.innerHTML = old_text;
                            save_screenshot.onclick = clickHandler;
                        });
                    }
                    menu_item.parentNode.insertBefore(save_screenshot, menu_item);
                    return;
                }
            }
        }
    }
}

function screenshotPost(permalink, callback) {
    permalink += "?"; // so it works on posts' page
    let iframe = document.createElement('iframe');
    iframe.width = 1200;
    iframe.height = 800;
    iframe.onload = function() {
        let post = iframe.contentDocument.querySelector('.fbUserContent'),
            post_wrapper = post.parentNode.parentNode;
        post_wrapper.style = post.style || '';
        post_wrapper.style += ';postition: relative; z-index: 1000;';
        setTimeout(() => {
            iframe.contentWindow.scrollTo(0, 0);
            let rect = post_wrapper.getBoundingClientRect(),
                x = Math.ceil(rect.x),
                y = Math.ceil(rect.y),
                width = Math.ceil(rect.width),
                height = Math.ceil(rect.height);
            let canvas = document.createElement('canvas'),
                ctx = canvas.getContext('2d');
            canvas.width = width;
            canvas.height = height;
            ctx.drawWindow(iframe.contentWindow, x, y, width, height, 'rgb(255,255,255)');
            let image_data_url = canvas.toDataURL();
            document.body.removeChild(iframe);
            callback(image_data_url);
        }, 500);
    };
    iframe.src = permalink;
    document.body.append(iframe);
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
