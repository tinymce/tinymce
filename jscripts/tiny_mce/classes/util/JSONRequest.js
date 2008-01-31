/**
 * $Id$
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2006, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	var extend = tinymce.extend, JSON = tinymce.util.JSON, XHR = tinymce.util.XHR;

	/**#@+
	 * @class This class enables you to use JSON-RPC to call backend methods.
	 * @member tinymce.util.JSONRequest
	 */
	tinymce.create('tinymce.util.JSONRequest', {
		/**
		 * Constructs a new JSONRequest instance.
		 *
		 * @constructor
		 * @param {Object} s Optional settings object.
		 */
		JSONRequest : function(s) {
			this.settings = extend({
			}, s);
			this.count = 0;
		},

		/**#@+
		 * @method
		 */

		/**
		 * Sends a JSON-RPC call. Consult the Wiki API documentation for more details on what you can pass to this function.
		 *
		 * @param {Object} o Call object where there are three field id, method and params this object should also contain callbacks etc.
		 */
		send : function(o) {
			var ecb = o.error, scb = o.success;

			o = extend(this.settings, o);

			o.success = function(c, x) {
				c = JSON.parse(c);

				if (typeof(c) == 'undefined') {
					c = {
						error : 'JSON Parse error.'
					};
				}

				if (c.error)
					ecb.call(o.error_scope || o.scope, c.error, x);
				else
					scb.call(o.success_scope || o.scope, c.result);
			};

			o.error = function(ty, x) {
				ecb.call(o.error_scope || o.scope, ty, x);
			};

			o.data = JSON.serialize({
				id : o.id || 'c' + (this.count++),
				method : o.method,
				params : o.params
			});

			// JSON content type for Ruby on rails. Bug: #1883287
			o.content_type = 'application/json';

			XHR.send(o);
		},

		'static' : {
			/**
			 * Simple helper function to send a JSON-RPC request without the need to initialize an object.
			 * Consult the Wiki API documentation for more details on what you can pass to this function.
			 *
			 * @param {Object} o Call object where there are three field id, method and params this object should also contain callbacks etc.
			 */
			sendRPC : function(o) {
				return new tinymce.util.JSONRequest().send(o);
			}
		}

		/**#@-*/
	});
}());