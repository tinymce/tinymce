/**
 * Rect.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
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

	var min = Math.min, max = Math.max, round = Math.round;

	/**
	 * Returns the rect positioned based on the relative position name
	 * to the target rect.
	 *
	 * @method relativePosition
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
			y += round(targetH / 2);
		}

		if (rel[1] === 'c') {
			x += round(targetW / 2);
		}

		if (rel[3] === 'b') {
			y -= h;
		}

		if (rel[4] === 'r') {
			x -= w;
		}

		if (rel[3] === 'c') {
			y -= round(h / 2);
		}

		if (rel[4] === 'c') {
			x -= round(w / 2);
		}

		return {x: x, y: y, w: w, h: h};
	}

	/**
	 * Tests various positions to get the most suitable one.
	 *
	 * @method findBestRelativePosition
	 * @param {Rect} Rect Rect to use as source.
	 * @param {Rect} targetRect Rect to move relative to.
	 * @param {Rect} constrainRect Rect to constrain within.
	 * @param {Array} Array of relative positions to test against.
	 */
	function findBestRelativePosition(rect, targetRect, constrainRect, rels) {
		var pos, i;

		for (i = 0; i < rels.length; i++) {
			pos = relativePosition(rect, targetRect, rels[i]);

			if (pos.x >= constrainRect.x && pos.x + pos.w <= constrainRect.w + constrainRect.x &&
				pos.y >= constrainRect.y && pos.y + pos.h <= constrainRect.h + constrainRect.y) {
				return rels[i];
			}
		}
	}

	/**
	 * Inflates the rect in all directions.
	 *
	 * @method inflate
	 * @param {Rect} rect Rect to expand.
	 * @param {Number} w Relative width to expand by.
	 * @param {Number} h Relative height to expand by.
	 * @return {Rect} New expanded rect.
	 */
	function inflate(rect, w, h) {
		return {
			x: rect.x - w,
			y: rect.y - h,
			w: rect.w + w * 2,
			h: rect.h + h * 2
		};
	}

	/**
	 * Returns the intersection of the specified rectangles.
	 *
	 * @method intersect
	 * @param {Rect} rect The first rectangle to compare.
	 * @param {Rect} cropRect The second rectangle to compare.
	 * @return {Rect} The intersection of the two rectangles or null if they don't intersect.
	 */
	function intersect(rect1, rect2) {
		var x1, y1, x2, y2;

		x1 = max(rect1.x, rect2.x);
		y1 = max(rect1.y, rect2.y);
		x2 = min(rect1.x + rect1.w, rect2.x + rect2.w);
		y2 = min(rect1.y + rect1.h, rect2.y + rect2.h);

		if (x2 - x1 < 0 || y2 - y1 < 0) {
			return null;
		}

		return {x: x1, y: y1, w: x2 - x1, h: y2 - y1};
	}

	/**
	 * Returns a rect clamped within the specified clamp rect. This forces the
	 * rect to be inside the clamp rect.
	 *
	 * @method clamp
	 * @param {Rect} rect Rectangle to force within clamp rect.
	 * @param {Rect} clampRect Rectable to force within.
	 * @param {Boolean} fixedSize True/false if size should be fixed.
	 * @return {Rect} Clamped rect.
	 */
	function clamp(rect, clampRect, fixedSize) {
		var underflowX1, underflowY1, overflowX2, overflowY2,
			x1, y1, x2, y2, cx2, cy2;

		x1 = rect.x;
		y1 = rect.y;
		x2 = rect.x + rect.w;
		y2 = rect.y + rect.h;
		cx2 = clampRect.x + clampRect.w;
		cy2 = clampRect.y + clampRect.h;

		underflowX1 = max(0, clampRect.x - x1);
		underflowY1 = max(0, clampRect.y - y1);
		overflowX2 = max(0, x2 - cx2);
		overflowY2 = max(0, y2 - cy2);

		x1 += underflowX1;
		y1 += underflowY1;

		if (fixedSize) {
			x2 += underflowX1;
			y2 += underflowY1;
			x1 -= overflowX2;
			y1 -= overflowY2;
		}

		x2 -= overflowX2;
		y2 -= overflowY2;

		return {x: x1, y: y1, w: x2 - x1, h: y2 - y1};
	}

	return {
		inflate: inflate,
		relativePosition: relativePosition,
		findBestRelativePosition: findBestRelativePosition,
		intersect: intersect,
		clamp: clamp
	};
});
