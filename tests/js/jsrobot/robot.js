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
			var appletTag = '<applet archive="' + jarUrl + '" code="com.ephox.jsrobot.JSRobot" id="robotApplet" width="10" height="10" mayscript="true" initial_focus="false"><param name="initial_focus" value="false" /><param name="mayscript" value="true" /></applet>';
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
			if (window.robotUsesSymbols){
				this.initSymbols();
			} else if (this.userCallback) {
				setTimeout(this.userCallback, 100);
			}

			return "Callback received.";
		},

		initSymbols: function(){
			var input = document.createElement("input");
			document.body.appendChild(input);
			input.focus(); 
			var t = this;
			function loadSymbolsFromInput(){
				t.symbols = input.value;
				t.ready = true;
				document.body.removeChild(input);

				if (t.userCallback) {
					setTimeout(t.userCallback, 100);
				}
			}

		  	this.appletAction(input, loadSymbolsFromInput, function() {
				  return this.getApplet().typeSymbolsAboveNumberKeys();
			});  
		},

		type: function(key, shiftKey, callback, focusElement) {
			var keycode = this.getKeycode(key);
			shiftKey = !!shiftKey;
			this.appletAction(focusElement, callback, function() {
				return this.getApplet().typeKey(keycode, shiftKey);
			});
		},

		typeSymbol: function(symbol, callback, focusElement) { 
			if (!window.robotUsesSymbols) {
				alert("need to define the attribute\nwindow.robotUsesSymbols\nbefore using the typeSymbol function.");
			}
			var t = this;

			var symbolNumber = t.symbols.search("\\"+symbol);
			if (symbolNumber <0) {
				throw new Error("The symbol "+ symbol + " could not be located on your keyboard.  Unable to press key");
			}
			return t.type(symbolNumber+48, true, callback, focusElement);
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
			var keycode = this.getKeycode(key);
			this.appletAction(focusElement, callback, function() {
				return this.getApplet().typeAsShortcut(keycode);
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

			// Make sure the focus change has taken effect.
			var afterFocused = function() {
				timeout = setTimeout(function() {
					if (listenerActivated) return false;
					doListeners(false);
					if (continueCallback) {
						setTimeout(continueCallback, 0);
					}
				}, 10000);
				actionResult = action.apply(t);
				if (actionResult) {
					throw { message: "JSRobot error: " + actionResult };
				}
				if (!focusElement && continueCallback) {
					setTimeout(continueCallback, 100);
				}
			};
			
			var listener = function() {
				if (listenerActivated) return;
				listenerActivated = true;
				clearTimeout(timeout);
				doListeners(false);
				if (continueCallback) {
					setTimeout(continueCallback, 100);
				}
			};
			var doListeners = function(add) {
				// Listen as high up in the hierarchy as possible to give us the best chance of getting the event before any JS listeners cancel it.
				var target = focusElement.defaultView || focusElement.ownerDocument || focusElement;
				if (focusElement.addEventListener) {
					target[add ? 'addEventListener' : 'removeEventListener'](listenerType, listener, true);
				} else {
					focusElement[add ? 'attachEvent' : 'detachEvent']('on' + listenerType, listener);
					target[add ? 'attachEvent' : 'detachEvent']('on' + listenerType, listener);
				}
			};
			
			if (!focusElement) {
				focusElement = document.activeElement;
				while (focusElement && (focusElement.contentDocument || focusElement.contentWindow)) {
					if (focusElement.contentDocument) {
						focusElement = focusElement.contentDocument.activeElement;
					} else {
						focusElement = focusElement.contentWindow.document.activeElement;
					}
				}
			}
			if (navigator.userAgent.indexOf('MSIE') < 0) {
				curEl = focusElement;
				while (curEl) {
					if (curEl.frameElement) {
						toFocus.push(curEl);
						toFocus.push(curEl.frameElement);
						curEl = curEl.frameElement;
					} else if (curEl.parent && curEl.parent !== curEl) {
						toFocus.push(curEl.parent);
						curEl = curEl.parent;
					} else if (curEl.defaultView) {
						toFocus.push(curEl.defaultView);
						curEl = curEl.defaultView;
					} else if (curEl.ownerDocument) {
						toFocus.push(curEl.ownerDocument.body);
						curEl = curEl.ownerDocument;
					} else {
						curEl = null;
					}
				}
			}
			
			var focused = [];
			var focusNext = function() {
				if (toFocus.length > 0) {
					curEl = toFocus.pop();
					focused.push(curEl);
					if (curEl.focus) curEl.focus();
					setTimeout(focusNext, 0);
				} else {
					doListeners(true);
					focusElement.focus();
					
					setTimeout(afterFocused, 0);
				}
			};
			if (focusElement) {
				focusNext();
			} else {
				afterFocused();
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
