/**
 * SplitButton.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Creates a split button.
 *
 * @-x-less SplitButton.less
 * @class tinymce.ui.SplitButton
 * @extends tinymce.ui.Button
 */
define("tinymce/ui/SplitButton", [
	"tinymce/ui/MenuButton",
	"tinymce/ui/DomUtils"
], function(MenuButton, DomUtils) {
	return MenuButton.extend({
		Defaults: {
			classes: "widget btn splitbtn",
			role: "button"
		},

		/**
		 * Repaints the control after a layout operation.
		 *
		 * @method repaint
		 */
		repaint: function() {
			var self = this, elm = self.getEl(), rect = self.layoutRect(), mainButtonElm, menuButtonElm;

			self._super();

			mainButtonElm = elm.firstChild;
			menuButtonElm = elm.lastChild;

			DomUtils.css(mainButtonElm, {
				width: rect.w - DomUtils.getSize(menuButtonElm).width,
				height: rect.h - 2
			});

			DomUtils.css(menuButtonElm, {
				height: rect.h - 2
			});

			return self;
		},

		/**
		 * Sets the active menu state.
		 *
		 * @private
		 */
		activeMenu: function(state) {
			var self = this;

			DomUtils.toggleClass(self.getEl().lastChild, self.classPrefix + 'active', state);
		},

		/**
		 * Renders the control as a HTML string.
		 *
		 * @method renderHtml
		 * @return {String} HTML representing the control.
		 */
		renderHtml: function() {
			var self = this, id = self._id, prefix = self.classPrefix;
			var icon = self.settings.icon ? prefix + 'ico ' + prefix + 'i-' + self.settings.icon : '';

			return (
				'<div id="' + id + '" class="' + self.classes() + '" role="button" tabindex="-1">' +
					'<button type="button" hidefocus tabindex="-1">' +
						(icon ? '<i class="' + icon + '"></i>' : '') +
						(self._text ? (icon ? ' ' : '') + self._text : '') +
					'</button>' +
					'<button type="button" class="' + prefix + 'open" hidefocus tabindex="-1">' +
						//(icon ? '<i class="' + icon + '"></i>' : '') +
						(self._menuBtnText ? (icon ? '\u00a0' : '') + self._menuBtnText : '') +
						' <i class="' + prefix + 'caret"></i>' +
					'</button>' +
				'</div>'
			);
		},

		/**
		 * Called after the control has been rendered.
		 *
		 * @method postRender
		 */
		postRender: function() {
			var self = this, onClickHandler = self.settings.onclick;

			self.on('click', function(e) {
				var node = e.target;

				if (e.control == this) {
					// Find clicks that is on the main button
					while (node) {
						if ((e.aria && e.aria.key != 'down') || (node.nodeName == 'BUTTON' && node.className.indexOf('open') == -1)) {
							e.stopImmediatePropagation();
							onClickHandler.call(this, e);
							return;
						}

						node = node.parentNode;
					}
				}
			});

			delete self.settings.onclick;

			return self._super();
		}
	});
});