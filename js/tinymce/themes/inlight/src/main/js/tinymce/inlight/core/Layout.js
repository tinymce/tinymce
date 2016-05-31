/**
 * Layout.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define('tinymce/inlight/core/Layout', [
	'global!tinymce.geom.Rect',
	'tinymce/inlight/core/Convert'
], function (Rect, Convert) {
	var result = function (elementRect, contentAreaRect, panelRect, position) {
		return {
			elementRect: elementRect,
			contentAreaRect: contentAreaRect,
			panelRect: panelRect,
			position: position
		};
	};

	var moveTo = function (rect, toRect) {
		return {x: toRect.x, y: toRect.y, w: rect.w, h: rect.h};
	};

	var calc = function (elementRect, contentAreaRect, panelRect) {
		var testPositions, relPos, relRect, outputPanelRect;

		testPositions = [
			'tc-bc', 'bc-tc',
			'tl-bl', 'bl-tl',
			'tr-br', 'br-tr'
		];

		relPos = Rect.findBestRelativePosition(panelRect, elementRect, contentAreaRect, testPositions);
		elementRect = Rect.clamp(elementRect, contentAreaRect);

		if (relPos) {
			relRect = Rect.relativePosition(panelRect, elementRect, relPos);
			outputPanelRect = moveTo(panelRect, relRect);
			return result(elementRect, contentAreaRect, outputPanelRect, relPos);
		}

		elementRect = Rect.intersect(contentAreaRect, elementRect);
		if (elementRect) {
			relPos = Rect.findBestRelativePosition(panelRect, elementRect, contentAreaRect, [
				'bc-tc', 'bl-tl', 'br-tr'
			]);

			if (relPos) {
				relRect = Rect.relativePosition(panelRect, elementRect, relPos);
				outputPanelRect = moveTo(panelRect, relRect);
				return result(elementRect, contentAreaRect, outputPanelRect, relPos);
			}

			outputPanelRect = moveTo(panelRect, elementRect);
			return result(elementRect, contentAreaRect, outputPanelRect, relPos);
		}

		return null;
	};

	var userConstrain = function(handler, result) {
		var elementRect, contentAreaRect, panelRect;

		elementRect = Convert.toClientRect(result.elementRect);
		contentAreaRect = Convert.toClientRect(result.contentAreaRect);
		panelRect = Convert.toClientRect(result.panelRect);

		if (typeof handler === 'function') {
			panelRect = handler({
				elementRect: elementRect,
				contentAreaRect: contentAreaRect,
				panelRect: panelRect
			});
		}

		return Convert.fromClientRect(panelRect);
	};

	return {
		calc: calc,
		userConstrain: userConstrain
	};
});
