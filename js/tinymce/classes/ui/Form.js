/**
 * Form.js
 *
 * Copyright 2003-2012, Moxiecode Systems AB, All rights reserved.
 */

/**
 * ..
 *
 * @class tinymce.ui.Form
 * @extends tinymce.ui.Container
 */
define("tinymce/ui/Form", [
	"tinymce/ui/Container",
	"tinymce/ui/FormItem"
], function(Container, FormItem) {
	"use strict";

	return Container.extend({
		Defaults: {
			containerCls: 'form',
			layout: 'flex',
			direction: 'column',
			align: 'stretch',
			flex: 1,
			padding: 20,
			labelGap: 30,
			spacing: 10
		},

		preRender: function() {
			var self = this, items = self.items();

			// Wrap any labeled items in FormItems
			items.each(function(ctrl) {
				var formItem, label = ctrl.settings.label;

				if (label) {
					formItem = new FormItem({
						layout: 'flex',
						autoResize: "overflow",
						defaults: {flex: 1},
						items: [
							{type: 'label', text: label, flex: 0, forId: ctrl._id}
						]
					});

					formItem.type = 'formitem';

					if (typeof(ctrl.settings.flex) == "undefined") {
						ctrl.settings.flex = 1;
					}

					self.replace(ctrl, formItem);
					formItem.add(ctrl);
				}
			});
		},

		recalcLabels: function() {
			var self = this, maxLabelWidth = 0, labels = [], i, labelGap;

			if (self.settings.labelGapCalc === false) {
				return;
			}

			self.items().filter('formitem').each(function(item) {
				var labelCtrl = item.items()[0], labelWidth = labelCtrl.getEl().clientWidth;

				maxLabelWidth = labelWidth > maxLabelWidth ? labelWidth : maxLabelWidth;
				labels.push(labelCtrl);
			});

			labelGap = self.settings.labelGap || 0;

			i = labels.length;
			while (i--) {
				labels[i].settings.minWidth = maxLabelWidth + labelGap;
			}
		},

		visible: function(state) {
			var val = this._super(state);

			if (state === true && this._rendered) {
				this.recalcLabels();
			}

			return val;
		},

		fromJSON: function(data) {
			var self = this;

			if (data) {
				for (var name in data) {
					self.find('#' + name).value(data[name]);
				}
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

		submit: function() {
			return this.fire('submit', {data: this.toJSON()});
		},

		postRender: function() {
			var self = this;

			self._super();
			self.recalcLabels();
			self.fromJSON(self.settings.data);
		}
	});
});