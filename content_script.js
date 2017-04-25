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
                    save_screenshot.innerHTML = '<a class="_54nc" href="#" role="menuitem" title="Save screenshot of this post"><span><span class="_54nh"><div class="_4p23"><i class="_4p24 img sp_CH8VYa8kmd6 sx_f85522"></i><i class="_4p25 img sp_CH8VYa8kmd6 sx_e405a2"></i>Save screenshot of this post</div></span></span></a>';
                    save_screenshot.onmouseover = function() { this.classList.add('_54ne'); };
                    save_screenshot.onmouseout = function() { this.classList.remove('_54ne'); };
                    save_screenshot.onclick = function() {
                        let context_layer = findParentWithClass(container, 'uiContextualLayerPositioner'),
                            menu_arrow = document.getElementById(context_layer.getAttribute('data-ownerid')),
                            post = findParentWithClass(menu_arrow, 'fbUserContent'),
                            permalink = post.querySelector('.timestamp').parentNode.href;
                        post.click();
                        console.log(permalink);
                    }
                    menu_item.parentNode.insertBefore(save_screenshot, menu_item);
                    return;
                }
            }
        }
    }
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
