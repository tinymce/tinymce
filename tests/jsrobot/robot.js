/*
   Copyright 2010 Ephox Corporation

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
(function() {
	if (window.robot) {
		// Don't load if there's already a version of robot loaded.
		return;
	}
	
	window.robot = {
			
		onload: function(userCallback) {
			if (this.ready) {
				userCallback();
			} else {
				this.userCallback = userCallback;
			}
		},
		
		init: function(useDocumentWrite) {
			var jarUrl = "JSRobot.jar";
			var scripts = document.getElementsByTagName('script');
			for (var i = 0; i < scripts.length; i++) {
				var src = scripts[i].src;
				var regex = /^(.*\/?)robot.js(\?|$)/;
				if (src && regex.test(src)) {
					jarUrl = regex.exec(src)[1] + "JSRobot.jar";
				}
			}
			var appletTag = '<applet archive="' + jarUrl + '" code="com.ephox.jsrobot.JSRobot" id="robotApplet" width="10" height="10" mayscript="true"><param name="mayscript" value="true" /></applet>';
			if (useDocumentWrite) {
				document.write(appletTag);
			} else {
				var div = document.createElement('div');
				document.body.appendChild(div);
				div.innerHTML = appletTag;
			}
			this.appletInstance = document.getElementById('robotApplet');
		},
		
		callback: function() {
			this.ready = true;
			if (this.userCallback) {
				setTimeout(this.userCallback, 100);
			}
			return "Callback received.";
		},
		
		type: function(key, shiftKey, callback, focusElement) {
			shiftKey = !!shiftKey;
			this.appletAction(focusElement, callback, function() {
				return this.getApplet().typeKey(this.getKeycode(key), shiftKey);
			});
		},
		
		forwardDelete: function(callback, focusElement) {
			this.type(0x7F, false, callback, focusElement);
		},
		
		cut: function(callback, focusElement) {
			this.typeAsShortcut('x', callback, focusElement, 'cut');
		},
		
		copy: function(callback, focusElement) {
			this.typeAsShortcut('c', callback, focusElement, 'copy');
		},
		
		paste: function(callback, focusElement) {
			this.typeAsShortcut('v', callback, focusElement, 'paste');
		},
		
		pasteText: function(content, callback, focusElement) {
			var actionResult = this.getApplet().setClipboard(content);
			if (actionResult) {
				throw { message: "JSRobot error: " + actionResult };
			}
			this.paste(callback, focusElement);
		},
		
		typeAsShortcut: function(key, callback, focusElement, event) {
			this.appletAction(focusElement, callback, function() {
				return this.getApplet().typeAsShortcut(this.getKeycode(key));
			}, event);
		},
		
		getKeycode: function(key) {
			if (key.toUpperCase && key.charCodeAt) {
				if (/^[a-zA-Z\n\b\t]$/.test(key)) {
					return key.toUpperCase().charCodeAt(0);
				} else {
					throw { message: 'Invalid character to type. Must be a-z or A-Z, otherwise use the key code directly.' };
				}
			}
			return key;
		},
		
		captureScreenShot: function() {
			return this.getApplet().captureScreenShot();
		},
		
		setScreenShotDirectory: function(dir) {
			this.getApplet().setScreenShotDirectory(dir);
		},
		
		getApplet: function() {
			return this.appletInstance;
		},
		
		appletAction: function(focusElement, continueCallback, action, event) {
			var actionResult, listenerActivated = false, listenerType = event || 'keyup', timeout, curEl, toFocus = [], t = this;
			var listener = function() {
				if (listenerActivated) return;
				listenerActivated = true;
				clearTimeout(timeout);
				doListeners(false);
				if (continueCallback) {
					setTimeout(continueCallback, 0);
				}
			};
			var doListeners = function(add) {
				var target = focusElement.document || focusElement.ownerDocument || focusElement;
				if (focusElement.addEventListener) {
					target[add ? 'addEventListener' : 'removeEventListener'](listenerType, listener, true);
				} else {
					focusElement[add ? 'attachEvent' : 'detachEvent']('on' + listenerType, listener);
				}
			};
			
			focusElement = focusElement || document.activeElement;
			curEl = focusElement;
			while (curEl) {
				toFocus.push(curEl);
				if (curEl.frameElement) {
					curEl = frameElement;
				} else if (curEl.parent && curEl.parent !== curEl) {
					curEl = curEl.parent;
				} else if (curEl.defaultView) {
					curEl = curEl.defaultView;
				} else if (curEl.ownerDocument) {
					curEl = curEl.ownerDocument;
				} else {
					curEl = curEl.parentNode;
				}
			}
			while (toFocus.length > 0) {
				curEl = toFocus.pop();
				if (curEl.focus) curEl.focus();
			}
			if (focusElement) {
				focusElement.focus();
				doListeners(true);

				// Add a timeout of 5 seconds in case the target event isn't supported or something goes wrong.
				timeout = setTimeout(function() {
					if (this.onTimeout) {
						this.onTimeout(listenerType, continueCallback);
					} else if (continueCallback) {
						continueCallback();
					}
				}, 5000);
			}
			actionResult = action.apply(t);
			if (actionResult) {
				throw { message: "JSRobot error: " + actionResult };
			}
			if (!focusElement && continueCallback) {
				setTimeout(continueCallback, 100);
			}
		}
	};
	
	function robotOnload() {
		window.robot.init();
	}
	if (document.addEventListener) {
		window.addEventListener('load', robotOnload, true);
	} else {
		// If you don't init straight away on IE, it gets the applet context wrong.
		window.robot.init(true);
	}
})();
