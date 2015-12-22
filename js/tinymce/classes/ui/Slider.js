/**
 * Slider.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Slider control.
 *
 * @-x-less Slider.less
 * @class tinymce.ui.Slider
 * @extends tinymce.ui.Widget
 */
define("tinymce/ui/Slider", [
	"tinymce/ui/Widget",
	"tinymce/ui/DragHelper",
	"tinymce/ui/DomUtils"
], function(Widget, DragHelper, DomUtils) {
	"use strict";

	function constrain(value, minVal, maxVal) {
		if (value < minVal) {
			value = minVal;
		}

		if (value > maxVal) {
			value = maxVal;
		}

		return value;
	}

	function updateSliderHandle(ctrl, value) {
		var maxHandlePos, shortSizeName, sizeName, stylePosName, styleValue;

		if (ctrl.settings.orientation == "v") {
			stylePosName = "top";
			sizeName = "height";
			shortSizeName = "h";
		} else {
			stylePosName = "left";
			sizeName = "width";
			shortSizeName = "w";
		}

		maxHandlePos = (ctrl.layoutRect()[shortSizeName] || 100) - DomUtils.getSize(ctrl.getEl('handle'))[sizeName];

		styleValue = (maxHandlePos * ((value - ctrl._minValue) / (ctrl._maxValue - ctrl._minValue))) + 'px';
		ctrl.getEl('handle').style[stylePosName] = styleValue;
		ctrl.getEl('handle').style.height = ctrl.layoutRect().h + 'px';
	}

	return Widget.extend({
		init: function(settings) {
			var self = this;

			if (!settings.previewFilter) {
				settings.previewFilter = function(value) {
					return Math.round(value * 100) / 100.0;
				};
			}

			self._super(settings);
			self.classes.add('slider');

			if (settings.orientation == "v") {
				self.classes.add('vertical');
			}

			self._minValue = settings.minValue || 0;
			self._maxValue = settings.maxValue || 100;
			self._initValue = self.state.get('value');
		},

		renderHtml: function() {
			var self = this, id = self._id, prefix = self.classPrefix;

			return (
				'<div id="' + id + '" class="' + self.classes + '">' +
					'<div id="' + id + '-handle" class="' + prefix + 'slider-handle"></div>' +
				'</div>'
			);
		},

		reset: function() {
			this.value(this._initValue).repaint();
		},

		postRender: function() {
			var self = this, startPos, startHandlePos, handlePos = 0, value, minValue, maxValue, maxHandlePos;
			var screenCordName, stylePosName, sizeName, shortSizeName;

			minValue = self._minValue;
			maxValue = self._maxValue;
			value = self.value();

			if (self.settings.orientation == "v") {
				screenCordName = "screenY";
				stylePosName = "top";
				sizeName = "height";
				shortSizeName = "h";
			} else {
				screenCordName = "screenX";
				stylePosName = "left";
				sizeName = "width";
				shortSizeName = "w";
			}

			self._super();

			self._dragHelper = new DragHelper(self._id, {
				handle: self._id + "-handle",

				start: function(e) {
					startPos = e[screenCordName];
					startHandlePos = parseInt(self.getEl('handle').style[stylePosName], 10);
					maxHandlePos = (self.layoutRect()[shortSizeName] || 100) - DomUtils.getSize(self.getEl('handle'))[sizeName];
					self.fire('dragstart', {value: value});
				},

				drag: function(e) {
					var delta = e[screenCordName] - startPos, handleEl = self.getEl('handle');

					handlePos = constrain(startHandlePos + delta, 0, maxHandlePos);
					handleEl.style[stylePosName] = handlePos + 'px';

					value = minValue + (handlePos / maxHandlePos) * (maxValue - minValue);
					self.value(value);

					self.tooltip().text('' + self.settings.previewFilter(value)).show().moveRel(handleEl, 'bc tc');

					self.fire('drag', {value: value});
				},

				stop: function() {
					self.tooltip().hide();
					self.fire('dragend', {value: value});
				}
			});
		},

		repaint: function() {
			this._super();
			updateSliderHandle(this, this.value());
		},

		bindStates: function() {
			var self = this;

			self.state.on('change:value', function(e) {
				updateSliderHandle(self, e.value);
			});

			return self._super();
		}
	});
});