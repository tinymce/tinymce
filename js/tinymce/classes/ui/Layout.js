/**
 * Layout.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Base layout manager class.
 *
 * @class tinymce.ui.Layout
 */
define("tinymce/ui/Layout", [
	"tinymce/util/Class",
	"tinymce/util/Tools"
], function(Class, Tools) {
	"use strict";

	return Class.extend({
		Defaults: {
			firstControlClass: 'first',
			lastControlClass: 'last'
		},

		/**
		 * Constructs a layout instance with the specified settings.
		 *
		 * @constructor
		 * @param {Object} settings Name/value object with settings.
		 */
		init: function(settings) {
			this.settings = Tools.extend({}, this.Defaults, settings);
		},

		/**
		 * This method gets invoked before the layout renders the controls.
		 *
		 * @method preRender
		 * @param {tinymce.ui.Container} container Container instance to preRender.
		 */
		preRender: function(container) {
			container.addClass(this.settings.containerClass, 'body');
		},

		/**
		 * Applies layout classes to the container.
		 *
		 * @private
		 */
		applyClasses: function(container) {
			var self = this, settings = self.settings, items, firstClass, lastClass;

			items = container.items().filter(':visible');
			firstClass = settings.firstControlClass;
			lastClass = settings.lastControlClass;

			items.each(function(item) {
				item.removeClass(firstClass).removeClass(lastClass);

				if (settings.controlClass) {
					item.addClass(settings.controlClass);
				}
			});

			items.eq(0).addClass(firstClass);
			items.eq(-1).addClass(lastClass);
		},

		/**
		 * Renders the specified container and any layout specific HTML.
		 *
		 * @method renderHtml
		 * @param {tinymce.ui.Container} container Container to render HTML for.
		 */
		renderHtml: function(container) {
			var self = this, settings = self.settings, items, html = '';

			items = container.items();
			items.eq(0).addClass(settings.firstControlClass);
			items.eq(-1).addClass(settings.lastControlClass);

			items.each(function(item) {
				if (settings.controlClass) {
					item.addClass(settings.controlClass);
				}

				html += item.renderHtml();
			});

			return html;
		},

		/**
		 * Recalculates the positions of the controls in the specified container.
		 *
		 * @method recalc
		 * @param {tinymce.ui.Container} container Container instance to recalc.
		 */
		recalc: function() {
		},

		/**
		 * This method gets invoked after the layout renders the controls.
		 *
		 * @method postRender
		 * @param {tinymce.ui.Container} container Container instance to postRender.
		 */
		postRender: function() {
		}
	});
});