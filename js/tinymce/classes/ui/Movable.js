/**
 * Movable.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Movable mixin. Makes controls movable absolute and relative to other elements.
 *
 * @mixin tinymce.ui.Movable
 */
define("tinymce/ui/Movable", [
	"tinymce/ui/DomUtils"
], function(DomUtils) {
	"use strict";

	return {
		/**
		 * Move relative to the specified element.
		 *
		 * @method moveRel
		 * @param {Element} elm Element to move relative to.
		 * @param {String} rel Relative mode. For example: br-tl.
		 * @return {tinymce.ui.Control} Current control instance.
		 */
		moveRel: function(elm, rel) {
			var self = this, ctrlElm, pos, x, y, selfW, selfH, targetW, targetH;

			// Get pos of target
			pos = DomUtils.getPos(elm);
			x = pos.x;
			y = pos.y;

			// Get size of self
			ctrlElm = self.getEl();
			selfW = ctrlElm.offsetWidth;
			selfH = ctrlElm.offsetHeight;

			// Get size of target
			targetW = elm.offsetWidth;
			targetH = elm.offsetHeight;

			// Parse align string
			rel = (rel || '').split('');

			// Target corners
			if (rel[0] === 'b') {
				y += targetH;
			}

			if (rel[1] === 'r') {
				x += targetW;
			}

			if (rel[0] === 'c') {
				y += Math.round(targetH / 2);
			}

			if (rel[1] === 'c') {
				x += Math.round(targetW / 2);
			}

			// Self corners
			if (rel[3] === 'b') {
				y -= selfH;
			}

			if (rel[4] === 'r') {
				x -= selfW;
			}

			if (rel[3] === 'c') {
				y -= Math.round(selfH / 2);
			}

			if (rel[4] === 'c') {
				x -= Math.round(selfW / 2);
			}

			self.moveTo(x, y);

			return self;
		},

		/**
		 * Move by a relative x, y values.
		 *
		 * @method moveBy
		 * @param {Number} dx Relative x position.
		 * @param {Number} dy Relative y position.
		 * @return {tinymce.ui.Control} Current control instance.
		 */
		moveBy: function(dx, dy) {
			var self = this, rect = self.layoutRect();

			self.moveTo(rect.x + dx, rect.y + dy);

			return self;
		},

		/**
		 * Move to absolute position.
		 *
		 * @method moveTo
		 * @param {Number} x Absolute x position.
		 * @param {Number} y Absolute y position.
		 * @return {tinymce.ui.Control} Current control instance.
		 */
		moveTo: function(x, y) {
			var self = this;

			if (self._rendered) {
				self.layoutRect({x: x, y: y}).repaint();
			} else {
				self.settings.x = x;
				self.settings.y = y;
			}

			self.fire('move', {x: x, y: y});

			return self;
		}
	};
});