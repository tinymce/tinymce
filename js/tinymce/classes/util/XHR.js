/**
 * XHR.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class enables you to send XMLHTTPRequests cross browser.
 * @class tinymce.util.XHR
 * @static
 * @example
 * // Sends a low level Ajax request
 * tinymce.util.XHR.send({
 *    url: 'someurl',
 *    success: function(text) {
 *       console.debug(text);
 *    }
 * });
 */
define("tinymce/util/XHR", [], function() {
	return {
		/**
		 * Sends a XMLHTTPRequest.
		 * Consult the Wiki for details on what settings this method takes.
		 *
		 * @method send
		 * @param {Object} settings Object will target URL, callbacks and other info needed to make the request.
		 */
		send: function(settings) {
			var xhr, count = 0;

			function ready() {
				if (!settings.async || xhr.readyState == 4 || count++ > 10000) {
					if (settings.success && count < 10000 && xhr.status == 200) {
						settings.success.call(settings.success_scope, '' + xhr.responseText, xhr, settings);
					} else if (settings.error) {
						settings.error.call(settings.error_scope, count > 10000 ? 'TIMED_OUT' : 'GENERAL', xhr, settings);
					}

					xhr = null;
				} else {
					setTimeout(ready, 10);
				}
			}

			// Default settings
			settings.scope = settings.scope || this;
			settings.success_scope = settings.success_scope || settings.scope;
			settings.error_scope = settings.error_scope || settings.scope;
			settings.async = settings.async === false ? false : true;
			settings.data = settings.data || '';

			xhr = new XMLHttpRequest();

			if (xhr) {
				if (xhr.overrideMimeType) {
					xhr.overrideMimeType(settings.content_type);
				}

				xhr.open(settings.type || (settings.data ? 'POST' : 'GET'), settings.url, settings.async);

				if (settings.content_type) {
					xhr.setRequestHeader('Content-Type', settings.content_type);
				}

				xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

				xhr.send(settings.data);

				// Syncronous request
				if (!settings.async) {
					return ready();
				}

				// Wait for response, onReadyStateChange can not be used since it leaks memory in IE
				setTimeout(ready, 10);
			}
		}
	};
});
