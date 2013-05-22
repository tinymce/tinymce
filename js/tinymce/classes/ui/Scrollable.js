/**
 * Scrollable.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This mixin makes controls scrollable using custom scrollbars.
 *
 * @-x-less Scrollable.less
 * @mixin tinymce.ui.Scrollable
 */
define("tinymce/ui/Scrollable", [
	"tinymce/ui/DomUtils",
	"tinymce/ui/DragHelper"
], function(DomUtils, DragHelper) {
	"use strict";

	return {
		init: function() {
			var self = this;
			self.on('repaint', self.renderScroll);
		},

		renderScroll: function() {
			var self = this, margin = 2;

			function repaintScroll() {
				var hasScrollH, hasScrollV, bodyElm;

				function repaintAxis(axisName, posName, sizeName, contentSizeName, hasScroll, ax) {
					var containerElm, scrollBarElm, scrollThumbElm;
					var containerSize, scrollSize, ratio, rect;
					var posNameLower, sizeNameLower;

					scrollBarElm = self.getEl('scroll' + axisName);
					if (scrollBarElm) {
						posNameLower = posName.toLowerCase();
						sizeNameLower = sizeName.toLowerCase();

						if (self.getEl('absend')) {
							DomUtils.css(self.getEl('absend'), posNameLower, self.layoutRect()[contentSizeName] - 1);
						}

						if (!hasScroll) {
							DomUtils.css(scrollBarElm, 'display', 'none');
							return;
						}

						DomUtils.css(scrollBarElm, 'display', 'block');
						containerElm = self.getEl('body');
						scrollThumbElm = self.getEl('scroll' + axisName + "t");
						containerSize = containerElm["client" + sizeName] - (margin * 2);
						containerSize -= hasScrollH && hasScrollV ? scrollBarElm["client" + ax] : 0;
						scrollSize = containerElm["scroll" + sizeName];
						ratio = containerSize / scrollSize;

						rect = {};
						rect[posNameLower] = containerElm["offset" + posName] + margin;
						rect[sizeNameLower] = containerSize;
						DomUtils.css(scrollBarElm, rect);

						rect = {};
						rect[posNameLower] = containerElm["scroll" + posName] * ratio;
						rect[sizeNameLower] = containerSize * ratio;
						DomUtils.css(scrollThumbElm, rect);
					}
				}

				bodyElm = self.getEl('body');
				hasScrollH = bodyElm.scrollWidth > bodyElm.clientWidth;
				hasScrollV = bodyElm.scrollHeight > bodyElm.clientHeight;

				repaintAxis("h", "Left", "Width", "contentW", hasScrollH, "Height");
				repaintAxis("v", "Top", "Height", "contentH", hasScrollV, "Width");
			}

			function addScroll() {
				function addScrollAxis(axisName, posName, sizeName, deltaPosName, ax) {
					var scrollStart, axisId = self._id + '-scroll' + axisName, prefix = self.classPrefix;

					self.getEl().appendChild(DomUtils.createFragment(
						'<div id="' + axisId + '" class="' + prefix + 'scrollbar ' + prefix + 'scrollbar-' + axisName + '">' +
							'<div id="' + axisId + 't" class="' + prefix + 'scrollbar-thumb"></div>' +
						'</div>'
					));

					self.draghelper = new DragHelper(axisId + 't', {
						start: function() {
							scrollStart = self.getEl('body')["scroll" + posName];
							DomUtils.addClass(DomUtils.get(axisId), prefix + 'active');
						},

						drag: function(e) {
							var ratio, hasScrollH, hasScrollV, containerSize, layoutRect = self.layoutRect();

							hasScrollH = layoutRect.contentW > layoutRect.innerW;
							hasScrollV = layoutRect.contentH > layoutRect.innerH;
							containerSize = self.getEl('body')["client" + sizeName] - (margin * 2);
							containerSize -= hasScrollH && hasScrollV ? self.getEl('scroll' + axisName)["client" + ax] : 0;

							ratio = containerSize / self.getEl('body')["scroll" + sizeName];
							self.getEl('body')["scroll" + posName] = scrollStart + (e["delta" + deltaPosName] / ratio);
						},

						stop: function() {
							DomUtils.removeClass(DomUtils.get(axisId), prefix + 'active');
						}
					});
/*
					self.on('click', function(e) {
						if (e.target.id == self._id + '-scrollv') {

						}
					});*/
				}

				self.addClass('scroll');

				addScrollAxis("v", "Top", "Height", "Y", "Width");
				addScrollAxis("h", "Left", "Width", "X", "Height");
			}

			if (self.settings.autoScroll) {
				if (!self._hasScroll) {
					self._hasScroll = true;
					addScroll();

					self.on('wheel', function(e) {
						var bodyEl = self.getEl('body');

						bodyEl.scrollLeft += (e.deltaX || 0) * 10;
						bodyEl.scrollTop += e.deltaY * 10;

						repaintScroll();
					});

					DomUtils.on(self.getEl('body'), "scroll", repaintScroll);
				}

				repaintScroll();
			}
		}
	};
});