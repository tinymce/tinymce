/**
 * $Id: TinyMCE_DOMUtils.class.js 91 2006-10-02 14:53:22Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2006, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	// Shorten names
	var each = tinymce.each;

	tinymce.create('tinymce.util.Dispatcher', {
		scope : null,
		listeners : null,

		Dispatcher : function(s) {
			this.scope = s || this;
			this.listeners = [];
		},

		add : function(cb, s) {
			this.listeners.push({cb : cb, scope : s || this.scope});

			return cb;
		},

		unshift : function(cb, s) {
			this.listeners.unshift({cb : cb, scope : s || this.scope});

			return cb;
		},

		remove : function(cb) {
			var l = this.listeners;

			each(l, function(c, i) {
				if (cb == c.cb) {
					l.splice(i, 1);
					return false;
				}
			});

			return cb;
		},

		dispatch : function() {
			var s, a = arguments;

			each(this.listeners, function(c) {
				return s = c.cb.apply(c.scope, a);
			});

			return s;
		}
	});
})();
