/**
 * Form.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
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

		/**
		 * This method gets invoked before the control is rendered.
		 *
		 * @method preRender
		 */
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

		/**
		 * Recalcs label widths.
		 *
		 * @private
		 */
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

		/**
		 * Getter/setter for the visibility state.
		 *
		 * @method visible
		 * @param {Boolean} [state] True/false state to show/hide.
		 * @return {tinymce.ui.Form|Boolean} True/false state or current control.
		 */
		visible: function(state) {
			var val = this._super(state);

			if (state === true && this._rendered) {
				this.recalcLabels();
			}

			return val;
		},

		/**
		 * Fires a submit event with the serialized form.
		 *
		 * @method submit
		 * @return {Object} Event arguments object.
		 */
		submit: function() {
			// Blur current control so a onchange is fired before submit
			var ctrl = this.getParentCtrl(document.activeElement);
			if (ctrl) {
				ctrl.blur();
			}

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
			self.recalcLabels();
			self.fromJSON(self.settings.data);
		}
	});
});