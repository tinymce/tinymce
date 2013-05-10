/**
 * ButtonGroup.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This control enables you to put multiple buttons into a group. This is
 * useful when you want to combine similar toolbar buttons into a group.
 *
 * @example
 * // Create and render a buttongroup with two buttons to the body element
 * tinymce.ui.Factory({
 *     type: 'buttongroup',
 *     items: [
 *         {text: 'Button A'},
 *         {text: 'Button B'}
 *     ]
 * }).renderTo(document.body);
 *
 * @-x-less ButtonGroup.less
 * @class tinymce.ui.ButtonGroup
 * @extends tinymce.ui.Container
 */
define("tinymce/ui/ButtonGroup", [
	"tinymce/ui/Container"
], function(Container) {
	"use strict";

	return Container.extend({
		Defaults: {
			defaultType: 'button',
			role: 'toolbar'
		},

		/**
		 * Renders the control as a HTML string.
		 *
		 * @method renderHtml
		 * @return {String} HTML representing the control.
		 */
		renderHtml: function() {
			var self = this, layout = self._layout;

			self.addClass('btn-group');
			self.preRender();
			layout.preRender(self);

			return (
				'<div id="' + self._id + '" class="' + self.classes() + '">'+
					'<div id="' + self._id + '-body">'+
						(self.settings.html || '') + layout.renderHtml(self) +
					'</div>' +
				'</div>'
			);
		}
	});
});