/**
 * FlexLayout.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This layout manager works similar to the CSS flex box.
 *
 * @setting {String} direction row|row-reverse|column|column-reverse
 * @setting {Number} flex A positive-number to flex by.
 * @setting {String} align start|end|center|stretch
 * @setting {String} pack start|end|justify
 *
 * @class tinymce.ui.FlexLayout
 * @extends tinymce.ui.AbsoluteLayout
 */
define("tinymce/ui/FlexLayout", [
	"tinymce/ui/AbsoluteLayout"
], function(AbsoluteLayout) {
	"use strict";

	return AbsoluteLayout.extend({
		/**
		 * Recalculates the positions of the controls in the specified container.
		 *
		 * @method recalc
		 * @param {tinymce.ui.Container} container Container instance to recalc.
		 */
		recalc: function(container) {
			// A ton of variables, needs to be in the same scope for performance
			var i, l, items, contLayoutRect, contPaddingBox, contSettings, align, pack, spacing, totalFlex, availableSpace, direction;
			var ctrl, ctrlLayoutRect, ctrlSettings, flex, maxSizeItems = [], size, maxSize, ratio, rect, pos, maxAlignEndPos;
			var sizeName, minSizeName, posName, maxSizeName, beforeName, innerSizeName, afterName, deltaSizeName, contentSizeName;
			var alignAxisName, alignInnerSizeName, alignSizeName, alignMinSizeName, alignMaxSizeName, alignBeforeName, alignAfterName;
			var alignDeltaSizeName, alignContentSizeName;
			var max = Math.max, min = Math.min;

			// Get container items, properties and settings
			items = container.items().filter(':visible');
			contLayoutRect = container.layoutRect();
			contPaddingBox = container._paddingBox;
			contSettings = container.settings;
			direction = contSettings.direction;
			align = contSettings.align;
			pack = contSettings.pack;
			spacing = contSettings.spacing || 0;

			if (direction == "row-reversed" || direction == "column-reverse") {
				items = items.set(items.toArray().reverse());
				direction = direction.split('-')[0];
			}

			// Setup axis variable name for row/column direction since the calculations is the same
			if (direction == "column") {
				posName = "y";
				sizeName = "h";
				minSizeName = "minH";
				maxSizeName = "maxH";
				innerSizeName = "innerH";
				beforeName = 'top';
				afterName = 'bottom';
				deltaSizeName = "deltaH";
				contentSizeName = "contentH";

				alignBeforeName = "left";
				alignSizeName = "w";
				alignAxisName = "x";
				alignInnerSizeName = "innerW";
				alignMinSizeName = "minW";
				alignMaxSizeName = "maxW";
				alignAfterName = "right";
				alignDeltaSizeName = "deltaW";
				alignContentSizeName = "contentW";
			} else {
				posName = "x";
				sizeName = "w";
				minSizeName = "minW";
				maxSizeName = "maxW";
				innerSizeName = "innerW";
				beforeName = 'left';
				afterName = 'right';
				deltaSizeName = "deltaW";
				contentSizeName = "contentW";

				alignBeforeName = "top";
				alignSizeName = "h";
				alignAxisName = "y";
				alignInnerSizeName = "innerH";
				alignMinSizeName = "minH";
				alignMaxSizeName = "maxH";
				alignAfterName = "bottom";
				alignDeltaSizeName = "deltaH";
				alignContentSizeName = "contentH";
			}

			// Figure out total flex, availableSpace and collect any max size elements
			availableSpace = contLayoutRect[innerSizeName] - contPaddingBox[beforeName] - contPaddingBox[beforeName];
			maxAlignEndPos = totalFlex = 0;
			for (i = 0, l = items.length; i < l; i++) {
				ctrl = items[i];
				ctrlLayoutRect = ctrl.layoutRect();
				ctrlSettings = ctrl.settings;
				flex = ctrlSettings.flex;
				availableSpace -= (i < l - 1 ? spacing : 0);

				if (flex > 0) {
					totalFlex += flex;

					// Flexed item has a max size then we need to check if we will hit that size
					if (ctrlLayoutRect[maxSizeName]) {
						maxSizeItems.push(ctrl);
					}

					ctrlLayoutRect.flex = flex;
				}

				availableSpace -= ctrlLayoutRect[minSizeName];

				// Calculate the align end position to be used to check for overflow/underflow
				size = contPaddingBox[alignBeforeName] + ctrlLayoutRect[alignMinSizeName] + contPaddingBox[alignAfterName];
				if (size > maxAlignEndPos) {
					maxAlignEndPos = size;
				}
			}

			// Calculate minW/minH
			rect = {};
			if (availableSpace < 0) {
				rect[minSizeName] = contLayoutRect[minSizeName] - availableSpace + contLayoutRect[deltaSizeName];
			} else {
				rect[minSizeName] = contLayoutRect[innerSizeName] - availableSpace + contLayoutRect[deltaSizeName];
			}

			rect[alignMinSizeName] = maxAlignEndPos + contLayoutRect[alignDeltaSizeName];

			rect[contentSizeName] = contLayoutRect[innerSizeName] - availableSpace;
			rect[alignContentSizeName] = maxAlignEndPos;
			rect.minW = min(rect.minW, contLayoutRect.maxW);
			rect.minH = min(rect.minH, contLayoutRect.maxH);
			rect.minW = max(rect.minW, contLayoutRect.startMinWidth);
			rect.minH = max(rect.minH, contLayoutRect.startMinHeight);

			// Resize container container if minSize was changed
			if (contLayoutRect.autoResize && (rect.minW != contLayoutRect.minW || rect.minH != contLayoutRect.minH)) {
				rect.w = rect.minW;
				rect.h = rect.minH;

				container.layoutRect(rect);
				this.recalc(container);

				// Forced recalc for example if items are hidden/shown
				if (container._lastRect === null) {
					var parentCtrl = container.parent();
					if (parentCtrl) {
						parentCtrl._lastRect = null;
						parentCtrl.recalc();
					}
				}

				return;
			}

			// Handle max size elements, check if they will become to wide with current options
			ratio = availableSpace / totalFlex;
			for (i = 0, l = maxSizeItems.length; i < l; i++) {
				ctrl = maxSizeItems[i];
				ctrlLayoutRect = ctrl.layoutRect();
				maxSize = ctrlLayoutRect[maxSizeName];
				size = ctrlLayoutRect[minSizeName] + Math.ceil(ctrlLayoutRect.flex * ratio);

				if (size > maxSize) {
					availableSpace -= (ctrlLayoutRect[maxSizeName] - ctrlLayoutRect[minSizeName]);
					totalFlex -= ctrlLayoutRect.flex;
					ctrlLayoutRect.flex = 0;
					ctrlLayoutRect.maxFlexSize = maxSize;
				} else {
					ctrlLayoutRect.maxFlexSize = 0;
				}
			}

			// Setup new ratio, target layout rect, start position
			ratio = availableSpace / totalFlex;
			pos = contPaddingBox[beforeName];
			rect = {};

			// Handle pack setting moves the start position to end, center
			if (totalFlex === 0) {
				if (pack == "end") {
					pos = availableSpace + contPaddingBox[beforeName];
				} else if (pack == "center") {
					pos = Math.round(
						(contLayoutRect[innerSizeName] / 2) - ((contLayoutRect[innerSizeName] - availableSpace) / 2)
					) + contPaddingBox[beforeName];

					if (pos < 0) {
						pos = contPaddingBox[beforeName];
					}
				} else if (pack == "justify") {
					pos = contPaddingBox[beforeName];
					spacing = Math.floor(availableSpace / (items.length - 1));
				}
			}

			// Default aligning (start) the other ones needs to be calculated while doing the layout
			rect[alignAxisName] = contPaddingBox[alignBeforeName];

			// Start laying out controls
			for (i = 0, l = items.length; i < l; i++) {
				ctrl = items[i];
				ctrlLayoutRect = ctrl.layoutRect();
				size = ctrlLayoutRect.maxFlexSize || ctrlLayoutRect[minSizeName];

				// Align the control on the other axis
				if (align === "center") {
					rect[alignAxisName] = Math.round((contLayoutRect[alignInnerSizeName] / 2) - (ctrlLayoutRect[alignSizeName] / 2));
				} else if (align === "stretch") {
					rect[alignSizeName] = max(
						ctrlLayoutRect[alignMinSizeName] || 0,
						contLayoutRect[alignInnerSizeName] - contPaddingBox[alignBeforeName] - contPaddingBox[alignAfterName]
					);
					rect[alignAxisName] = contPaddingBox[alignBeforeName];
				} else if (align === "end") {
					rect[alignAxisName] = contLayoutRect[alignInnerSizeName]  - ctrlLayoutRect[alignSizeName]  - contPaddingBox.top;
				}

				// Calculate new size based on flex
				if (ctrlLayoutRect.flex > 0) {
					size += Math.ceil(ctrlLayoutRect.flex * ratio);
				}

				rect[sizeName] = size;
				rect[posName] = pos;
				ctrl.layoutRect(rect);

				// Recalculate containers
				if (ctrl.recalc) {
					ctrl.recalc();
				}

				// Move x/y position
				pos += size + spacing;
			}
		}
	});
});