/**
 * Button.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class is used to create buttons. You can create them directly or through the Factory.
 *
 * @example
 * // Create and render a button to the body element
 * tinymce.ui.Factory.create({
 *     type: 'button',
 *     text: 'My button'
 * }).renderTo(document.body);
 *
 * @-x-less Button.less
 * @class tinymce.ui.Button
 * @extends tinymce.ui.Widget
 */
define("tinymce/ui/Button", [
	"tinymce/ui/Widget"
], function(Widget) {
	"use strict";

	return Widget.extend({
		Defaults: {
			classes: "widget btn",
			role: "button"
		},

		/**
		 * Constructs a new button instance with the specified settings.
		 *
		 * @constructor
		 * @param {Object} settings Name/value object with settings.
		 * @setting {String} size Size of the button small|medium|large.
		 * @setting {String} image Image to use for icon.
		 * @setting {String} icon Icon to use for button.
		 */
		init: function(settings) {
			var self = this, size;

			self.on('click mousedown', function(e) {
				e.preventDefault();
			});

			self.on('mouseover', function() {
				var el = self.getEl();
				var i;
				for (i = 0; i < el.children.length; i++)	{
					el.children[i].title = "";
				}
			});

			self.on('mouseleave', function() {
				var el = self.getEl();
				var i;
				for (i = 0; i < el.children.length; i++) {
					el.children[i].title = self.encode(self._text || self.settings.tooltip);
				}
			});

			self._super(settings);
			size = settings.size;

			if (settings.subtype) {
				self.addClass(settings.subtype);
			}

			if (size) {
				self.addClass('btn-' + size);
			}
		},

		/**
		 * Sets/gets the current button icon.
		 *
		 * @method icon
		 * @param {String} [icon] New icon identifier.
		 * @return {String|tinymce.ui.MenuButton} Current icon or current MenuButton instance.
		 */
		icon: function(icon) {
			var self = this, prefix = self.classPrefix;

			if (typeof icon == 'undefined') {
				return self.settings.icon;
			}

			self.settings.icon = icon;
			icon = icon ? prefix + 'ico ' + prefix + 'i-' + self.settings.icon : '';

			if (self._rendered) {
				var btnElm = self.getEl().firstChild, iconElm = btnElm.getElementsByTagName('i')[0];

				if (icon) {
					if (!iconElm || iconElm != btnElm.firstChild) {
						iconElm = document.createElement('i');
						btnElm.insertBefore(iconElm, btnElm.firstChild);
					}

					iconElm.className = icon;
				} else if (iconElm) {
					btnElm.removeChild(iconElm);
				}

				self.text(self._text); // Set text again to fix whitespace between icon + text
			}

			return self;
		},

		/**
		 * Repaints the button for example after it's been resizes by a layout engine.
		 *
		 * @method repaint
		 */
		repaint: function() {
			var btnStyle = this.getEl().firstChild.style;

			btnStyle.width = btnStyle.height = "100%";

			this._super();
		},

		/**
		 * Sets/gets the current button text.
		 *
		 * @method text
		 * @param {String} [text] New button text.
		 * @return {String|tinymce.ui.Button} Current text or current Button instance.
		 */
		text: function(text) {
			var self = this;

			if (self._rendered) {
				var textNode = self.getEl().lastChild.lastChild;
				if (textNode) {
					textNode.data = self.translate(text);
				}
			}

			return self._super(text);
		},

		/**
		 * Renders the control as a HTML string.
		 *
		 * @method renderHtml
		 * @return {String} HTML representing the control.
		 */
		renderHtml: function() {
			var self = this, id = self._id, prefix = self.classPrefix;
			var icon = self.settings.icon, image;

			image = self.settings.image;
			if (image) {
				icon = 'none';

				// Support for [high dpi, low dpi] image sources
				if (typeof image != "string") {
					image = window.getSelection ? image[0] : image[1];
				}

				image = ' style="background-image: url(\'' + image + '\')"';
			} else {
				image = '';
			}

			icon = self.settings.icon ? prefix + 'ico ' + prefix + 'i-' + icon : '';

			return (
				'<div id="' + id + '" class="' + self.classes() + '" tabindex="-1" aria-labelledby="' + id + '">' +
					'<button role="presentation" type="button" tabindex="-1" ' +
					'title="' + self.encode(self._text || self.settings.tooltip) + '">' +
						(icon ? '<i class="' + icon + '"' + image + '></i>' : '') +
						(self._text ? (icon ? '\u00a0' : '') + self.encode(self._text) : '') +
					'</button>' +
				'</div>'
			);
		}
	});
});