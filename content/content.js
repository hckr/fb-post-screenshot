function setMutationHandler(target, selector, handler, options) {
// or    setMutationHandler(selector, handler, options) {
// or    setMutationHandler(options) {
	if (typeof arguments[0] == 'string') {
		options = arguments[2] || {};
		handler = arguments[1];
		selector = arguments[0];
		target = document;
	} else if (arguments.length == 1 && target && typeof target.handler == 'function') {
		options = arguments[0];
		handler = options.handler;
		selector = options.selector;
		target = options.target || document;
	} else if (!(target instanceof Node)) {
		throw 'Bad params for setMutationHandler.\n' +
			'A: [optional Node] target, [String] selector, [Function] handler, [optional Object] options\n' +
			'B: [Object] options\n' +
			'Options: target, selector, handler, processExisting, childList, attributes, characterData, subtree, attributeOldValue, characterDataOldValue, attributeFilter';
	} else
    	options = options || {};

	if (options.processExisting && target.querySelector(selector))
		handler.call(null, Array.prototype.slice.call(target.querySelectorAll(selector)));
	if (!options.attributes && !options.characterData && !options.childList && options.subtree === undefined)
		options.childList = options.subtree = true;

	var cb;
	if (/^#[\w\d-]+$/.test(selector)) {
		selector = selector.substr(1);
		cb = MOhandlerForId;
	} else {
		cb = MOhandler;
	}
	var observer = new MutationObserver(cb);
	observer.observe(target, options || {subtree:true, childList:true});
	return observer;

	function MOhandler(mutations) {
		if (mutations.length > 100 && !document.querySelector(selector))
			return;
		var found = [];
		for (var i=0, m; (m = mutations[i++]); ) {
			switch (m.type) {
				case 'childList':
					var nodes = m.addedNodes, nl = nodes.length;
					var textNodesOnly = true;
					for (var j=0; j < nl; j++) {
						var n = nodes[j];
						textNodesOnly &= n.nodeType == 3; // TEXT_NODE
						if (n.nodeType != 1) // ELEMENT_NODE
							continue;
						if (n.matches(selector))
							found.push(n);
						else if (n.querySelector(selector)) {
							n = n.querySelectorAll(selector);
							if (n.length < 1000)
								found.push.apply(found, n);
							else
								found = found.concat(found.slice.call(n));
						}
					}
					if (textNodesOnly && m.target.matches(selector))
						found.push(m.target);
					break;
				case 'attributes':
					if (m.target.matches(selector))
						found.push(m.target);
					break;
				case 'characterData':
					if (m.target.parentNode && m.target.parentNode.matches(selector))
						found.push(m.target.parentNode);
					break;
			}
		}
		if (!found.length)
			return;
		if (handler.call(observer, found) === false)
			observer.disconnect();
	}

	function MOhandlerForId(mutations) {
		var el = document.getElementById(selector);
		if (el && target.contains(el))
			if (handler.call(observer, [el]) === false)
				observer.disconnect();
	}
}


let i = 0;

let feed, post, post_header, post_menu, save_screenshot_button;


let infobox = document.createElement('div'),
    infobox_timeout = null;

infobox.className = 'fb_post_screenshot_infobox';
infobox.setAttribute('style','position: fixed;top: 50px;left: calc(50% - 150px);border-radius: 6px;width: 350px;padding: 10px 10px 10px;font-size: 16px;text-align: center;background-color: #111;color: #ddd;z-index: 1000;transition: 0.5s opacity ease-in');
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
        setTimeout(_ => (infobox.style.display = 'none'), 600);
    }, 5000);
}



function revealHREFs() {
    setMutationHandler({
        target: document,
        selector: '.b1v8xokw',
        handler: nodes => nodes.forEach(node => {
            var event1 = new MouseEvent('pointerover', {bubbles: true});
            node.dispatchEvent(event1);

        })

    })
} revealHREFs();

function pollPosts() {
    setMutationHandler({
        target: document,
        selector: '.pybr56ya.btwxx1t3.j83agx80.ll8tlv6m',
        handler: nodes => nodes.forEach(node => {
            if(!node.parentNode.innerText.includes('SCR')) {
                node.setAttribute('style','border-top:2px solid #404040;');
                node.insertAdjacentHTML('beforebegin','<span class="save_screenshot" style="background:#303135;border-top:0;border-left:1px solid #222;border-right:0;border-bottom:0;border-radius:2px;color:#bbb;display:inline-block;width:auto;height:24px;padding-left:10px;padding-right:12px;line-height:18px;font-size:14px;position:relative;left:0px">Screenshot</span>');

                node.previousSibling.addEventListener("click", function(){
                    this.toggleText = function () {
                        if (this.style.color == 'rgb(187, 187, 187)') {
                            this.style.color = 'rgb(255, 187, 187)';
                        } else {
                            this.style.color = 'rgb(187, 187, 187)';
                        }

                    };
                    this.toggleText();

                    setTimeout( function() {
                        node.previousSibling.style.color = 'rgb(100, 255, 100)';
                        var permalink = node.previousSibling.nextSibling.childNodes[1].childNodes[0].childNodes[1].childNodes[0].childNodes[0].childNodes[1].childNodes[0].childNodes[0];
                        let post_window = window.open(
                            permalink,
                            's',
                            'width=600, height=600, left=237, top=270, toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no'
                        );
                        let received_secret = '';

                        function responseCallback(response) {
                            //alert(JSON.stringify(response));
                            if ('confirmation_secret' in response) {
                                //alert('Yes');
                                received_secret = response.confirmation_secret;
                                //return;
                            }
                        let post_id = permalink.href.replace(/.+permalink/, '').match(/\d{2,}/)[0],
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
                                    filename: filename,
                                });
                            }

                        }

                        let confirmation_secret = Math.random().toString();
                        (function try_send_command_until_confirmation_received() {
                            if (received_secret != confirmation_secret) {
                                sendMessage(
                                    post_window,
                                    {
                                        type: 'command',
                                        command: 'screenshot',
                                        arguments: ['aaa', confirmation_secret],
                                    },
                                    responseCallback
                                );
                                setTimeout(try_send_command_until_confirmation_received, 8000);
                            }
                        })();
                    },100);

                    setTimeout( function() {
                        node.previousSibling.style.color = 'rgb(187, 187, 187)';
                    },6000);

                });
            }
        })
    })
} pollPosts();


let callbacks = {};

function sendMessage(win, json_data, callback) {
    let new_id = +new Date();
    callbacks[new_id] = callback;
    json_data['id'] = new_id;
    win.postMessage(JSON.stringify(json_data), 'https://www.facebook.com');
}

let received_screenshot_command = false;

if(document.readyState === 'complete') {
    var interval = setInterval(function() {

        if(document.querySelector('.gile2uim')) {
            feed = document.querySelector('.gile2uim');
            post = feed.querySelector('.du4w35lb.k4urcfbm.l9j0dhe7.sjgh65i0');
            post_header = post.querySelector('.pybr56ya.btwxx1t3.j83agx80.ll8tlv6m');
            post_menu = post_header.childNodes[2].childNodes[0];
            console.log('Feed:',feed,'\nPost:',post,'\nPost Header:',post_header,'\nPost Menu:',post_menu);
            save_screenshot_button = post_header.previousSibling;
            console.log('Screenshot Button:',save_screenshot_button);
            clearInterval(interval);
        } i++; if(i==5) {
            console.log('Loading Elements ...'+i);
        }
    }, 1000);
}


window.addEventListener('message', e => {
    if(e) {
        let origin = e.origin || e.originalEvent.origin;
        if (origin == 'https://www.facebook.com') {
            console.log('e.origin: '+JSON.stringify(origin));
            console.log('e.data: '+JSON.stringify(e.data));
            console.log('e.data[0]: '+e.data[0]);
            console.log(JSON.stringify(e.data.type));
            console.log(e.source);
        }
        if (e.data[0] !== '{') {
            //alert('edata not bracket');
        }
        let data = JSON.parse(e.data);
        switch (data.type) {
            case 'command':
                switch (data.command) {
                    case 'screenshot':
                        if (received_screenshot_command) {
                            //alert(JSON.stringify(e.data));
                        }
                        received_screenshot_command = true;
                        function initScreenshot() {
                            window.title = 'Screenshotting...';
                            document.body.style += ';overflow: hidden;';
                            e.source.postMessage(
                                JSON.stringify({
                                    type: 'response',
                                    id: data.id,
                                    confirmation_secret: data.arguments[1],
                                }),
                                origin
                            );
                            browser.storage.local.get().then(values => {
                                screenshotPostInCurrentWindow({
                                    anonymize: data.arguments[0],
                                    options: values,
                                    callback: image_data_urls => {
                                        e.source.postMessage(
                                            JSON.stringify({
                                                type: 'response',
                                                id: data.id,
                                                image_data_urls,
                                            }),
                                            origin
                                        );
                                        window.close();
                                    },
                                });
                            });
                            console.log(data);

                            function screenshotPostInCurrentWindow({anonymize, options, callback: afterScreenshotCallback}) {
                                let postWrapper = document.querySelector('.rq0escxv.l9j0dhe7.du4w35lb.hybvsw6c.ue3kfks5.pw54ja7n.uo3d90p7.l82x9zwi.ni8dbmo4.stjgntxs.k4urcfbm.sbcfpzgs'),
                                feed = postWrapper.parentNode.parentNode,  
                                    unfoldQueue = []; 
                                    feed.classList.add('fb_post_screenshot__feed');
                                    
                                    //if (!options.screenshotType == 'with-all-comments') {
                                    //    alert('Error 205');
                                    //} 
                                    setTimeout( function() { 

                                        if (document.readyState === 'complete') {
                                         
                                        
                                        screenshotPost();}

                                     },1000)
                                    
                                    
                                    function screenshotPost() {
                                    
                                        window.scrollTo(0, 0);
                                        console.log(postWrapper.getBoundingClientRect());
                                        [].forEach.call(document.querySelectorAll('.invisible_elem'), x => x.classList.remove('invisible_elem'));
                                
                                        if (anonymize) {
                                            //anonymizePost();
                                        }
                                
                                        let rect = postWrapper.getBoundingClientRect(),
                                            x = Math.ceil(rect.x),
                                            y = Math.ceil(rect.y),
                                            width = Math.ceil(rect.width-1),
                                            height = Math.ceil(rect.height-1);

   
                                        if (options.preventCutting) {
                                            postWrapper.style.width = `${width}px`;
                                            feed.classList.add('fb_post_screenshot__feed_preventCutting');
                                            document.body.appendChild(feed);
                                            document.querySelector('.fb_post_screenshot__feed_preventCutting').setAttribute('style','background:#18191a!important;border-top-left:0px solid #0000;');
                                            rect = postWrapper.getBoundingClientRect();
                                            x = Math.ceil(rect.x);
                                            y = Math.ceil(rect.y);
                                        }

                                    
                                        let canvas = document.createElement('canvas'),
                                            ctx = canvas.getContext('2d');
                                        const zoomRatio = options.sameAsPageZoom ? window.devicePixelRatio : options.zoom / 100;
                                
                                        let maxPartSize = (options.maxHeight / zoomRatio) | 0,
                                            leftHeight = height,
                                            image_data_urls = [];
                                
                                        while (leftHeight > 0) {
                                            let partHeight = leftHeight;
                                            if (leftHeight > maxPartSize) {
                                                partHeight = maxPartSize;
                                
                                                if (options.preventCutting) {
                                                    window.scrollTo(0, y + partHeight - 10);
                                                    let cutThroughComment = document.elementFromPoint(100, 10).closest('li');
                                                    if (cutThroughComment) {
                                                        window.scrollTo(0, 0);
                                                        newPartHeight = cutThroughComment.getBoundingClientRect().y - y;
                                                        if (newPartHeight > 0) {
                                                            partHeight = newPartHeight;
                                                        }
                                                    }
                                                }
                                            }
                                
                                            canvas.width = (width * zoomRatio) | 0;
                                            canvas.height = (partHeight * zoomRatio) | 0;
                                            ctx.scale(zoomRatio, zoomRatio);
                                            ctx.drawWindow(window, x, y, width, partHeight, '#f00');
                                            image_data_urls.push(canvas.toDataURL(options.format, options.quality));
                                
                                            y += partHeight;
                                            leftHeight -= partHeight;
                                        }
                                
                                        feed.classList.remove('fb_post_screenshot__feed');
                                
                                        afterScreenshotCallback(image_data_urls);
                                    
                                    }

                                }
                        }
                        window.addEventListener('load', initScreenshot);
                        if (document.readyState === 'complete') {
                            //alert('1111');
                            initScreenshot();
                        }
                        break;

                }
                break;
            case 'response':
                //alert('Response is '+data.type.response);
                //alert('callbacks '+callbacks);
                if (data.id in callbacks) {
                    //alert(data.id); alert(callbacks[data.id]); alert(data.confirmation_secret); alert(callbacks[data.id](data));
                    callbacks[data.id](data);
                    // delete callbacks[data.id];
                }
                //break;
        }
    }})
