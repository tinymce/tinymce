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

	var count = 0;

	return {
		id: function() {
			return 'mceu_' + (count++);
		},

		createFragment: function(html) {
			return DOMUtils.DOM.createFragment(html);
		},

		getWindowSize: function() {
			return DOMUtils.DOM.getViewPort();
		},

		getSize: function(elm) {
			var width, height;

			if (elm.getBoundingClientRect) {
				var rect = elm.getBoundingClientRect();

				width = Math.max(rect.width || (rect.right - rect.left), elm.offsetWidth);
				height = Math.max(rect.height || (rect.bottom - rect.bottom), elm.offsetHeight);
			} else {
				width = elm.offsetWidth;
				height = elm.offsetHeight;
			}

			return {width: width, height: height};
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

		getRuntimeStyle: function(elm, name) {
			return DOMUtils.DOM.getStyle(elm, name, true);
		},

		on: function(target, name, callback, scope) {
			return DOMUtils.DOM.bind(target, name, callback, scope);
		},

		off: function(target, name, callback) {
			return DOMUtils.DOM.unbind(target, name, callback);
		},

		fire: function(target, name, args) {
			return DOMUtils.DOM.fire(target, name, args);
		},

		innerHtml: function(elm, html) {
			// Workaround for <div> in <p> bug on IE 8 #6178
			DOMUtils.DOM.setHTML(elm, html);
		}
	};
});