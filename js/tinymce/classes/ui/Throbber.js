/**
 * Throbber.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class enables you to display a Throbber for any element.
 *
 * @-x-less Throbber.less
 * @class tinymce.ui.Throbber
 */
define("tinymce/ui/Throbber", [
	"tinymce/ui/DomUtils",
	"tinymce/ui/Control"
], function(DomUtils, Control) {
	"use strict";

	/**
	 * Constructs a new throbber.
	 *
	 * @constructor
	 * @param {Element} elm DOM Html element to display throbber in.
	 * @param {Boolean} inline Optional true/false state if the throbber should be appended to end of element for infinite scroll.
	 */
	return function(elm, inline) {
		var self = this, state, classPrefix = Control.classPrefix;

		/**
		 * Shows the throbber.
		 *
		 * @method show
		 * @param {Number} [time] Time to wait before showing.
		 * @return {tinymce.ui.Throbber} Current throbber instance.
		 */
		self.show = function(time) {
			self.hide();

			state = true;

			window.setTimeout(function() {
				if (state) {
					elm.appendChild(DomUtils.createFragment(
						'<div class="' + classPrefix + 'throbber' + (inline ? ' ' + classPrefix + 'throbber-inline' : '') + '"></div>'
					));
				}
			}, time || 0);

			return self;
		};

		/**
		 * Hides the throbber.
		 *
		 * @method hide
		 * @return {tinymce.ui.Throbber} Current throbber instance.
		 */
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