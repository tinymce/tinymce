/* Copyright 2010 Ephox Corporation.  All rights reserved. */
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
			var errorMessage = this.getApplet().typeKey(this.getKeycode(key), shiftKey);
			if (errorMessage) {
				throw { message: "JSRobot failed to type the requested key: " + errorMessage };
			}
			setTimeout(callback, 100);
		},
		
		forwardDelete: function(callback) {
			this.type(0x7F, false, callback);
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
		
		captureScreenShot: function(key) {
			return this.getApplet().captureScreenShot();
		},
		
		setScreenShotDirectory: function(dir) {
			this.getApplet().setScreenShotDirectory(dir);
		},
		
		getApplet: function() {
			return this.appletInstance;
		}
	};
	
	window.robot.init();
})();
