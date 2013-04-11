/**
 * Throbber.js
 *
 * Copyright 2003-2013, Moxiecode Systems AB, All rights reserved.
 */

/**
 * ..
 *
 * @-x-less Throbber.less
 * @class tinymce.ui.Throbber
 */
define("tinymce/ui/Throbber", [
	"tinymce/ui/DomUtils"
], function(DomUtils) {
	"use strict";

	return function(elm) {
		var self = this, state;

		self.show = function(time) {
			self.hide();

			state = true;

			window.setTimeout(function() {
				if (state) {
					elm.appendChild(DomUtils.createFragment('<div class="mce-throbber"></div>'));
				}
			}, time || 0);

			return self;
		},

		self.hide = function() {
			var child = elm.lastChild;

			if (child && child.className.indexOf('throbber') != -1) {
				child.parentNode.removeChild(child);
			}

			state = false;

			return self;
		};
	};
});