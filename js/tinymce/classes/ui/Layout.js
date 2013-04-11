/**
 * Layout.js
 *
 * Copyright 2003-2012, Moxiecode Systems AB, All rights reserved.
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

		init: function(settings) {
			this.settings = Tools.extend({}, this.Defaults, settings);
		},

		preRender: function(container) {
			container.addClass(this.settings.containerClass, 'body');
		},

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

		recalc: function() {
		},

		postRender: function() {
		}
	});
});