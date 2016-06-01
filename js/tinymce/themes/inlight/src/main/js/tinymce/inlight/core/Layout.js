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
	var result = function (rect, position) {
		return {
			rect: rect,
			position: position
		};
	};

	var moveTo = function (rect, toRect) {
		return {x: toRect.x, y: toRect.y, w: rect.w, h: rect.h};
	};

	var calc = function (targetRect, contentAreaRect, panelRect) {
		var testPositions, relPos, relRect, outputPanelRect;

		testPositions = [
			'tc-bc', 'bc-tc',
			'tl-bl', 'bl-tl',
			'tr-br', 'br-tr'
		];

		relPos = Rect.findBestRelativePosition(panelRect, targetRect, contentAreaRect, testPositions);
		targetRect = Rect.clamp(targetRect, contentAreaRect);

		if (relPos) {
			relRect = Rect.relativePosition(panelRect, targetRect, relPos);
			outputPanelRect = moveTo(panelRect, relRect);
			return result(outputPanelRect, relPos);
		}

		targetRect = Rect.intersect(contentAreaRect, targetRect);
		if (targetRect) {
			relPos = Rect.findBestRelativePosition(panelRect, targetRect, contentAreaRect, [
				'bc-tc', 'bl-tl', 'br-tr'
			]);

			if (relPos) {
				relRect = Rect.relativePosition(panelRect, targetRect, relPos);
				outputPanelRect = moveTo(panelRect, relRect);
				return result(outputPanelRect, relPos);
			}

			outputPanelRect = moveTo(panelRect, targetRect);
			return result(outputPanelRect, relPos);
		}

		return null;
	};

	var userConstrain = function (handler, targetRect, contentAreaRect, panelRect) {
		var userConstrainedPanelRect;

		if (typeof handler === 'function') {
			userConstrainedPanelRect = handler({
				elementRect: Convert.toClientRect(targetRect),
				contentAreaRect: Convert.toClientRect(contentAreaRect),
				panelRect: Convert.toClientRect(panelRect)
			});

			return Convert.fromClientRect(userConstrainedPanelRect);
		}

		return panelRect;
	};

	return {
		calc: calc,
		userConstrain: userConstrain
	};
});
