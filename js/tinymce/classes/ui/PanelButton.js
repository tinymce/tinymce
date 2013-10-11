/**
 * PanelButton.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Creates a new panel button.
 *
 * @class tinymce.ui.PanelButton
 * @extends tinymce.ui.Button
 */
define("tinymce/ui/PanelButton", [
	"tinymce/ui/Button",
	"tinymce/ui/FloatPanel"
], function(Button, FloatPanel) {
	"use strict";

	return Button.extend({
		/**
		 * Shows the panel for the button.
		 *
		 * @method showPanel
		 */
		showPanel: function() {
			var self = this, settings = self.settings;

			self.active(true);

			if (!self.panel) {
				var panelSettings = settings.panel;

				// Wrap panel in grid layout if type if specified
				// This makes it possible to add forms or other containers directly in the panel option
				if (panelSettings.type) {
					panelSettings = {
						layout: 'grid',
						items: panelSettings
					};
				}

				panelSettings.popover = true;
				panelSettings.autohide = true;

				self.panel = new FloatPanel(panelSettings).on('hide', function() {
					self.active(false);
				}).parent(self).renderTo(self.getContainerElm());
				self.panel.fire('show');
				self.panel.reflow();
			} else {
				self.panel.show();
			}

			self.panel.moveRel(self.getEl(), settings.popoverAlign || (self.isRtl() ? ['bc-tr', 'bc-tc'] : ['bc-tl', 'bc-tc']));
		},

		/**
		 * Hides the panel for the button.
		 *
		 * @method hidePanel
		 */
		hidePanel: function() {
			var self = this;

			if (self.panel) {
				self.panel.hide();
			}
		},

		/**
		 * Called after the control has been rendered.
		 *
		 * @method postRender
		 */
		postRender: function() {
			var self = this;

			self.on('click', function(e) {
				if (e.control === self) {
					if (self.panel && self.panel.visible()) {
						self.hidePanel();
					} else {
						self.showPanel();
					}
				}
			});

			return self._super();
		}
	});
});