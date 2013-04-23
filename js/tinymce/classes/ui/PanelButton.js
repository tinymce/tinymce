/**
 * MenuButton.js
 *
 * Copyright 2003-2012, Moxiecode Systems AB, All rights reserved.
 */

/**
 * ..
 *
 * @class tinymce.ui.MenuButton
 * @extends tinymce.ui.Button
 */
define("tinymce/ui/PanelButton", [
	"tinymce/ui/Button",
	"tinymce/ui/FloatPanel"
], function(Button, FloatPanel) {
	"use strict";

	var PanelButton = Button.extend({
		showPanel: function() {
			var self = this, settings = self.settings;

			settings.panel.popover = true;
			settings.panel.autohide = true;
			self.active(true);

			if (!self.panel) {
				self.panel = new FloatPanel(settings.panel).on('hide', function() {
					self.active(false);
				}).parent(self).renderTo(self.getContainerElm()).reflow().moveRel(self.getEl(), settings.popoverAlign || 'bc-tc');
			} else {
				self.panel.show();
			}
		},

		hidePanel: function() {
			var self = this;

			if (self.panel) {
				self.panel.hide();
			}
		},

		postRender: function() {
			var self = this;

			self.on('click', function(e) {
				if (e.control === self) {
					self.showPanel();
				}
			});

			return self._super();
		}
	});

	return PanelButton;
});