/**
 * Toolbar.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define('tinymce/inlight/ui/Toolbar', [
	'global!tinymce.util.Tools',
	'global!tinymce.ui.Factory'
], function (Tools, Factory) {
	var setActiveItem = function (item, name) {
		return function(state, args) {
			var nodeName, i = args.parents.length;

			while (i--) {
				nodeName = args.parents[i].nodeName;
				if (nodeName == 'OL' || nodeName == 'UL') {
					break;
				}
			}

			item.active(state && nodeName == name);
		};
	};

	var bindSelectorChanged = function (editor, itemName, item) {
		return function () {
			var selection = editor.selection;

			if (itemName == 'bullist') {
				selection.selectorChanged('ul > li', setActiveItem(item, 'UL'));
			}

			if (itemName == 'numlist') {
				selection.selectorChanged('ol > li', setActiveItem(item, 'OL'));
			}

			if (item.settings.stateSelector) {
				selection.selectorChanged(item.settings.stateSelector, function(state) {
					item.active(state);
				}, true);
			}

			if (item.settings.disabledStateSelector) {
				selection.selectorChanged(item.settings.disabledStateSelector, function(state) {
					item.disabled(state);
				});
			}
		};
	};

	var create = function (editor, items) {
		var toolbarItems = [], buttonGroup;

		if (!items) {
			return;
		}

		Tools.each(items.split(/[ ,]/), function(item) {
			var itemName;

			if (item == '|') {
				buttonGroup = null;
			} else {
				if (Factory.has(item)) {
					item = {type: item};
					toolbarItems.push(item);
					buttonGroup = null;
				} else {
					if (!buttonGroup) {
						buttonGroup = {type: 'buttongroup', items: []};
						toolbarItems.push(buttonGroup);
					}

					if (editor.buttons[item]) {
						itemName = item;
						item = editor.buttons[itemName];

						if (typeof item == 'function') {
							item = item();
						}

						item.type = item.type || 'button';

						item = Factory.create(item);
						item.on('postRender', bindSelectorChanged(editor, itemName, item));
						buttonGroup.items.push(item);
					}
				}
			}
		});

		return Factory.create({
			type: 'toolbar',
			layout: 'flow',
			items: toolbarItems
		});
	};

	return {
		create: create
	};
});
