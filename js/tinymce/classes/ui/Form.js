/**
 * Form.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class creates a form container. A form container has the ability
 * to automatically wrap items in tinymce.ui.FormItem instances.
 *
 * Each FormItem instance is a container for the label and the item.
 *
 * @example
 * tinymce.ui.Factory.create({
 *     type: 'form',
 *     items: [
 *         {type: 'textbox', label: 'My text box'}
 *     ]
 * }).renderTo(document.body);
 *
 * @class tinymce.ui.Form
 * @extends tinymce.ui.Container
 */
define("tinymce/ui/Form", [
	"tinymce/ui/Container",
	"tinymce/ui/FormItem",
	"tinymce/util/Tools"
], function(Container, FormItem, Tools) {
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
			spacing: 10,
			callbacks: {
				submit: function() {
					this.submit();
				}
			}
		},

		/**
		 * This method gets invoked before the control is rendered.
		 *
		 * @method preRender
		 */
		preRender: function() {
			var self = this, items = self.items();

			if (!self.settings.formItemDefaults) {
				self.settings.formItemDefaults = {
					layout: 'flex',
					autoResize: "overflow",
					defaults: {flex: 1}
				};
			}

			// Wrap any labeled items in FormItems
			items.each(function(ctrl) {
				var formItem, label = ctrl.settings.label;

				if (label) {
					formItem = new FormItem(Tools.extend({
						items: {
							type: 'label',
							id: ctrl._id + '-l',
							text: label,
							flex: 0,
							forId: ctrl._id,
							disabled: ctrl.disabled()
						}
					}, self.settings.formItemDefaults));

					formItem.type = 'formitem';
					ctrl.aria('labelledby', ctrl._id + '-l');

					if (typeof ctrl.settings.flex == "undefined") {
						ctrl.settings.flex = 1;
					}

					self.replace(ctrl, formItem);
					formItem.add(ctrl);
				}
			});
		},

		/**
		 * Fires a submit event with the serialized form.
		 *
		 * @method submit
		 * @return {Object} Event arguments object.
		 */
		submit: function() {
			return this.fire('submit', {data: this.toJSON()});
		},

		/**
		 * Post render method. Called after the control has been rendered to the target.
		 *
		 * @method postRender
		 * @return {tinymce.ui.ComboBox} Current combobox instance.
		 */
		postRender: function() {
			var self = this;

			self._super();
			self.fromJSON(self.settings.data);
		},

		bindStates: function() {
			var self = this;

			self._super();

			function recalcLabels() {
				var maxLabelWidth = 0, labels = [], i, labelGap, items;

				if (self.settings.labelGapCalc === false) {
					return;
				}

				if (self.settings.labelGapCalc == "children") {
					items = self.find('formitem');
				} else {
					items = self.items();
				}

				items.filter('formitem').each(function(item) {
					var labelCtrl = item.items()[0], labelWidth = labelCtrl.getEl().clientWidth;

					maxLabelWidth = labelWidth > maxLabelWidth ? labelWidth : maxLabelWidth;
					labels.push(labelCtrl);
				});

				labelGap = self.settings.labelGap || 0;

				i = labels.length;
				while (i--) {
					labels[i].settings.minWidth = maxLabelWidth + labelGap;
				}
			}

			self.on('show', recalcLabels);
			recalcLabels();
		}
	});
});