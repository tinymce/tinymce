/**
 * TabPanel.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Creates a tab panel control.
 *
 * @-x-less TabPanel.less
 * @class tinymce.ui.TabPanel
 * @extends tinymce.ui.Panel
 *
 * @setting {Number} activeTab Active tab index.
 */
define("tinymce/ui/TabPanel", [
	"tinymce/ui/Panel",
	"tinymce/ui/DomUtils"
], function(Panel, DomUtils) {
	"use strict";

	return Panel.extend({
		lastIdx: 0,

		Defaults: {
			layout: 'absolute',
			defaults: {
				type: 'panel'
			}
		},

		/**
		 * Activates the specified tab by index.
		 *
		 * @method activateTab
		 * @param {Number} idx Index of the tab to activate.
		 */
		activateTab: function(idx) {
			if (this.activeTabId) {
				DomUtils.removeClass(this.getEl(this.activeTabId), this.classPrefix + 'active');
			}

			this.activeTabId = 't' + idx;

			DomUtils.addClass(this.getEl('t' + idx), this.classPrefix + 'active');

			if (idx != this.lastIdx) {
				this.items()[this.lastIdx].hide();
				this.lastIdx = idx;
			}

			this.items()[idx].show().fire('showtab');
			this.reflow();
		},

		/**
		 * Renders the control as a HTML string.
		 *
		 * @method renderHtml
		 * @return {String} HTML representing the control.
		 */
		renderHtml: function() {
			var self = this, layout = self._layout, tabsHtml = '', prefix = self.classPrefix;

			self.preRender();
			layout.preRender(self);

			self.items().each(function(ctrl, i) {
				tabsHtml += (
					'<div id="' + self._id + '-t' + i + '" class="' + prefix + 'tab" unselectable="on">' +
						self.encode(ctrl.settings.title) +
					'</div>'
				);
			});

			return (
				'<div id="' + self._id + '" class="' + self.classes() + '" hideFocus="1" tabIndex="-1">' +
					'<div id="' + self._id + '-head" class="' + prefix + 'tabs">' +
						tabsHtml +
					'</div>' +
					'<div id="' + self._id + '-body" class="' + self.classes('body') + '">' +
						layout.renderHtml(self) +
					'</div>' +
				'</div>'
			);
		},

		/**
		 * Called after the control has been rendered.
		 *
		 * @method postRender
		 */
		postRender: function() {
			var self = this;

			self._super();

			self.settings.activeTab = self.settings.activeTab || 0;
			self.activateTab(self.settings.activeTab);

			this.on('click', function(e) {
				var targetParent = e.target.parentNode;

				if (e.target.parentNode.id == self._id + '-head') {
					var i = targetParent.childNodes.length;

					while (i--) {
						if (targetParent.childNodes[i] == e.target) {
							self.activateTab(i);
						}
					}
				}
			});
		},

		/**
		 * Initializes the current controls layout rect.
		 * This will be executed by the layout managers to determine the
		 * default minWidth/minHeight etc.
		 *
		 * @method initLayoutRect
		 * @return {Object} Layout rect instance.
		 */
		initLayoutRect: function() {
			var self = this, rect, minW, minH;

			minW = self.getEl('head').offsetWidth;
			minW = minW < 0 ? 0 : minW;
			minH = 0;
			self.items().each(function(item, i) {
				minW = Math.max(minW, item.layoutRect().minW);
				minH = Math.max(minH, item.layoutRect().minH);
				if (self.settings.activeTab != i) {
					item.hide();
				}
			});

			self.items().each(function(ctrl) {
				ctrl.settings.x = 0;
				ctrl.settings.y = 0;
				ctrl.settings.w = minW;
				ctrl.settings.h = minH;

				ctrl.layoutRect({
					x: 0,
					y: 0,
					w: minW,
					h: minH
				});
			});

			var headH = self.getEl('head').offsetHeight;

			self.settings.minWidth = minW;
			self.settings.minHeight = minH + headH;

			rect = self._super();
			rect.deltaH += self.getEl('head').offsetHeight;
			rect.innerH = rect.h - rect.deltaH;

			return rect;
		}
	});
});
