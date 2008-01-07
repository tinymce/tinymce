/**
 * $Id$
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2008, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	var each = tinymce.each;

	/**#@+
	 * @class This class contains simple cookie manangement functions.
	 * @member tinymce.util.Cookie
	 * @static
	 */
	tinymce.create('static tinymce.util.Cookie', {
		/**#@+
		 * @method
		 */

		/**
		 * Parses the specified query string into an name/value object.
		 *
		 * @param {String} n String to parse into a n Hashtable object.
		 * @return {Object} Name/Value object with items parsed from querystring.
		 */
		getHash : function(n) {
			var v = this.get(n), h;

			if (v) {
				each(v.split('&'), function(v) {
					v = v.split('=');
					h = h || {};
					h[unescape(v[0])] = unescape(v[1]);
				});
			}

			return h;
		},

		/**
		 * Sets a hashtable name/value object to a cookie.
		 *
		 * @param {String} n Name of the cookie.
		 * @param {Object} v Hashtable object to set as cookie.
		 * @param {Date} d Optional date object for the expiration of the cookie.
		 * @param {String} p Optional path to restrict the cookie to.
		 * @param {String} d Optional domain to restrict the cookie to.
		 * @param {String} s Is the cookie secure or not.
		 */
		setHash : function(n, v, e, p, d, s) {
			var o = '';

			each(v, function(v, k) {
				o += (!o ? '' : '&') + escape(k) + '=' + escape(v);
			});

			this.set(n, o, e, p, d, s);
		},

		/**
		 * Gets the raw data of a cookie by name.
		 *
		 * @param {String} n Name of cookie to retrive.
		 * @return {String} Cookie data string.
		 */
		get : function(n) {
			var c = document.cookie, e, p = n + "=", b;

			// Strict mode
			if (!c)
				return;

			b = c.indexOf("; " + p);

			if (b == -1) {
				b = c.indexOf(p);

				if (b != 0)
					return null;
			} else
				b += 2;

			e = c.indexOf(";", b);

			if (e == -1)
				e = c.length;

			return unescape(c.substring(b + p.length, e));
		},

		/**
		 * Sets a raw cookie string.
		 *
		 * @param {String} n Name of the cookie.
		 * @param {String} v Raw cookie data.
		 * @param {Date} d Optional date object for the expiration of the cookie.
		 * @param {String} p Optional path to restrict the cookie to.
		 * @param {String} d Optional domain to restrict the cookie to.
		 * @param {String} s Is the cookie secure or not.
		 */
		set : function(n, v, e, p, d, s) {
			document.cookie = n + "=" + escape(v) +
				((e) ? "; expires=" + e.toGMTString() : "") +
				((p) ? "; path=" + escape(p) : "") +
				((d) ? "; domain=" + d : "") +
				((s) ? "; secure" : "");
		},

		/**
		 * Removes/deletes a cookie by name.
		 *
		 * @param {String} n Cookie name to remove/delete.
		 * @param {Strong} p Optional path to remove the cookie from.
		 */
		remove : function(n, p) {
			var d = new Date();

			d.setTime(d.getTime() - 1000);

			this.set(n, '', d, p, d);
		}

		/**#@-*/
	});
})();
