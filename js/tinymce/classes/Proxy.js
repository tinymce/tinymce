/**
 * Proxy.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class enables you to proxy command to an iframe located on an other domain.
 *
 * @class tinymce.Proxy
 */
define("tinymce/Proxy", [
	"tinymce/util/Tools"
], function(Tools) {

	return function (win, domain, isParent) {
		var handlers = {},

			// Unique id of the communication to make sure we only receive information of the good iframe.
			// Without this we would receive message from other iframe RTE
			uniqueIdentifier = (isParent) ? createUniqueIdentifier() : "",
			ready = false,
			initInterval,
			extend = Tools.extend,
			callbackCache = {};

		function on(eventName, callback) {
			if (!handlers[eventName]) {
				handlers[eventName]= [];
			}

			handlers[eventName].push(callback);
		}

		function send(eventName, params, callback) {
			var eventObj = {
				eventName : eventName,
				params : params,
				source : uniqueIdentifier,
				callId : createUniqueIdentifier()
			};

			if (eventName !== "__callback") {
				callbackCache[eventObj.callId] = callback;
			}

			try {
				var strObj = JSON.stringify(eventObj);
				win.postMessage(strObj, "*");
			} catch (e) {
				console.error(e);
				// Communication channel may not be ready yet, no need for exception.
			}
		}

		extend(this, {
			on : on,
			send : send
		});

		window.addEventListener("message", messageHandle, false);

		// Set the internal callback
		on("__setIdentifier", function (identifier) {

			if (!uniqueIdentifier) { 
				uniqueIdentifier = identifier;
			}

			if (!ready) {
				ready = true;
				send("__setIdentifier", [identifier]);
				trigger("ready", []);

				if (initInterval) {
					clearInterval(initInterval);
				}
			}
		});

		on("__callback", function (callbackId, returnValue) {
			if (typeof callbackCache[callbackId] == "function") {
				callbackCache[callbackId](returnValue);
			}

			delete callbackCache[callbackId];
		});
		
		// Parent decides the ID of the communication channel and sends it to the iframe.
		if (isParent) {
			initInterval = setInterval(function () {
				send("__setIdentifier", [uniqueIdentifier]);
			}, 500);
		}

		// Private functions

		function messageHandle(event) {
			// We need to ignore message from domain that we do not expect. //
			if (event.origin !== domain && domain !== "*") {
				return;
			}

			var jsonData = event.data,
			    obj = JSON.parse(jsonData),
			    i,
			    returnValues;

			console.log("[" + document.domain + "] " + event.data);

			// Make sure we only handle message of the good iframe.
			if (obj.source == uniqueIdentifier || obj.eventName == "__setIdentifier") {
				returnValues = trigger(obj.eventName, obj.params);

				if (obj.eventName !== "__callback") {
					send("__callback", [obj.callId, returnValues]);
				}
			}
		}

		function trigger(eventName, params) {
			var returnValues = [],
				returnValue,
				i;

			if (handlers[eventName]) {
				for (i=0; i<handlers[eventName].length; i++) {
					try {
						returnValue = handlers[eventName][i].apply(null, params);

						if (typeof returnValue !== "undefined") {
							returnValues.push(returnValue);
						}
					} catch (e) {
						console.error(e);
						// Make sure callback failure don't crash everything
					}
				}
			}

			if (returnValues.length <= 1) {
				returnValues = returnValues[0];
			}

			return returnValues;
		}

		function createUniqueIdentifier() {
			return "" + 
				(Math.random().toString(16)+"000000000").substr(2,8) + 
				(Math.random().toString(16)+"000000000").substr(2,8);
		}
	};

});