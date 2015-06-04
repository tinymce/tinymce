/**
 * Rect.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Contains various tools for rect/position calculation.
 *
 * @class tinymce.ui.Rect
 */
define("tinymce/ui/Rect", [
], function() {
	"use strict";

	/**
	 * Returns the rect positioned based on the relative position name
	 * to the target rect.
	 *
	 * @param {Rect} rect Source rect to modify into a new rect.
	 * @param {Rect} targetRect Rect to move relative to based on the rel option.
	 * @param {String} rel Relative position. For example: tr-bl.
	 */
	function relativePosition(rect, targetRect, rel) {
		var x, y, w, h, targetW, targetH;

		x = targetRect.x;
		y = targetRect.y;
		w = rect.w;
		h = rect.h;
		targetW = targetRect.w;
		targetH = targetRect.h;

		rel = (rel || '').split('');

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

		if (rel[3] === 'b') {
			y -= h;
		}

		if (rel[4] === 'r') {
			x -= w;
		}

		if (rel[3] === 'c') {
			y -= Math.round(h / 2);
		}

		if (rel[4] === 'c') {
			x -= Math.round(w / 2);
		}

		return {x: x, y: y, w: w, h: h};
	}

	/**
	 * Tests various positions to get the most suitable one.
	 *
	 * @method testMoveRel
	 * @param {DOMElement} elm Element to position against.
	 * @param {Array} rels Array with relative positions.
	 * @return {String} Best suitable relative position.
	 */
	function findBestRelativePosition(rect, targetRect, constrainRect, rels) {
		var pos, i;

		for (i = 0; i < rels.length; i++) {
			pos = relativePosition(rect, targetRect, rels[i]);

			if (pos.x > constrainRect.x && pos.x + pos.w < constrainRect.w + constrainRect.x &&
				pos.y > constrainRect.y && pos.y + pos.h < constrainRect.h + constrainRect.y) {
				return rels[i];
			}
		}
	}

	return {
		relativePosition: relativePosition,
		findBestRelativePosition: findBestRelativePosition
	};
});
