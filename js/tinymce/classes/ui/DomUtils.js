/**
 * DOMUtils.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define("tinymce/ui/DomUtils", [
	"tinymce/util/Tools",
	"tinymce/dom/DOMUtils"
], function(Tools, DOMUtils) {
	"use strict";

	return {
		id: function() {
			return DOMUtils.DOM.uniqueId();
		},

		createFragment: function(html) {
			return DOMUtils.DOM.createFragment(html);
		},

		getWindowSize: function() {
			return DOMUtils.DOM.getViewPort();
		},

		getSize: function(elm) {
			return DOMUtils.DOM.getSize(elm);
		},

		getPos: function(elm, root) {
			return DOMUtils.DOM.getPos(elm, root);
		},

		getViewPort: function(win) {
			return DOMUtils.DOM.getViewPort(win);
		},

		get: function(id) {
			return document.getElementById(id);
		},

		addClass : function(elm, cls) {
			return DOMUtils.DOM.addClass(elm, cls);
		},

		removeClass : function(elm, cls) {
			return DOMUtils.DOM.removeClass(elm, cls);
		},

		hasClass : function(elm, cls) {
			return DOMUtils.DOM.hasClass(elm, cls);
		},

		toggleClass: function(elm, cls, state) {
			return DOMUtils.DOM.toggleClass(elm, cls, state);
		},

		css: function(elm, name, value) {
			return DOMUtils.DOM.setStyle(elm, name, value);
		},

		on: function(target, name, callback, scope) {
			return DOMUtils.DOM.bind(target, name, callback, scope);
		},

		off: function(target, name, callback) {
			return DOMUtils.DOM.unbind(target, name, callback);
		},

		fire: function(target, name, args) {
			return DOMUtils.DOM.fire(target, name, args);
		}
	};
});