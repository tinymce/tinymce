/**
 * Panel.js
 *
 * Copyright 2003-2012, Moxiecode Systems AB, All rights reserved.
 */

/**
 * ..
 *
 * @-x-less Panel.less
 * @class tinymce.ui.Panel
 * @extends tinymce.ui.Container
 */
define("tinymce/ui/Panel", [
	"tinymce/ui/Container",
	"tinymce/ui/Scrollable"
], function(Container, Scrollable) {
	"use strict";

	var Panel = Container.extend({
		Defaults: {
			layout: 'fit',
			containerCls: 'panel'
		},

		Mixins: [Scrollable],

		fromJSON: function(data) {
			var self = this;

			for (var name in data) {
				self.find('#' + name).value(data[name]);
			}

			return self;
		},

		toJSON: function() {
			var self = this, data = {};

			self.find('*').each(function(ctrl) {
				var name = ctrl.name(), value = ctrl.value();

				if (name && typeof(value) != "undefined") {
					data[name] = value;
				}
			});

			return data;
		},

		renderHtml: function() {
			var self = this, layout = self._layout, innerHtml = self.settings.html;

			self.preRender();
			layout.preRender(self);

			if (typeof(innerHtml) == "undefined") {
				innerHtml = (
					'<div id="' + self._id + '-body" class="' + self.classes('body') + '">' +
						layout.renderHtml(self) +
					'</div>'
				);
			} else {
				if (typeof(innerHtml) == 'function') {
					innerHtml = innerHtml.call(self);
				}

				self._hasBody = false;
			}

			return (
				'<div id="' + self._id + '" class="' + self.classes() + '" hideFocus="1" tabIndex="-1">' +
					(self._preBodyHtml || '') +
					innerHtml +
				'</div>'
			);
		}
	});

	return Panel;
});