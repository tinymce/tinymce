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
		
		init: function() {
			var jarUrl = "JSRobot.jar";
			var scripts = document.getElementsByTagName('script');
			for (var i = 0; i < scripts.length; i++) {
				var src = scripts[i].src;
				var regex = /^(.*\/?)robot.js(\?|$)/;
				if (src && regex.test(src)) {
					jarUrl = regex.exec(src)[1] + "JSRobot.jar";
				}
			}
			document.write('<applet archive="' + jarUrl + '" code="com.ephox.jsrobot.JSRobot" id="robotApplet" width="10" height="10" mayscript="true"><param name="mayscript" value="true" /></applet>');
			this.appletInstance = document.getElementById('robotApplet');
		},
		
		callback: function() {
			this.ready = true;
			if (this.userCallback) {
				this.userCallback();
			}
		},
		
		type: function(key, shiftKey, callback) {
			shiftKey = !!shiftKey;
			this.appletAction(this.getApplet().typeKey(this.getKeycode(key), shiftKey), callback);
		},
		
		forwardDelete: function(callback) {
			this.type(0x7F, false, callback);
		},
		
		cut: function(callback) {
			this.typeAsShortcut('x', callback);
		},
		
		copy: function(callback) {
			this.typeAsShortcut('c', callback);
		},
		
		paste: function(callback) {
			this.typeAsShortcut('v', callback);
		},
		
		typeAsShortcut: function(key, callback) {
			this.appletAction(this.getApplet().typeAsShortcut(this.getKeycode(key)), callback);
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
		
		appletAction: function(actionResult, callback) {
			if (actionResult) {
				throw { message: "JSRobot error: " + actionResult };
			}
			setTimeout(callback, 100);
		}
	};
	
	window.robot.init();
})();
