/**
 * Toolbar.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define('tinymce/inlite/ui/Toolbar', [
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

	var getSelectorStateResult = function (itemName, item) {
		var result = function (selector, handler) {
			return {
				selector: selector,
				handler: handler
			};
		};

		var activeHandler = function(state) {
			item.active(state);
		};

		var disabledHandler = function (state) {
			item.disabled(state);
		};

		if (itemName == 'bullist') {
			return result('ul > li', setActiveItem(item, 'UL'));
		}

		if (itemName == 'numlist') {
			return result('ol > li', setActiveItem(item, 'OL'));
		}

		if (item.settings.stateSelector) {
			return result(item.settings.stateSelector, activeHandler);
		}

		if (item.settings.disabledStateSelector) {
			return result(item.settings.disabledStateSelector, disabledHandler);
		}

		return null;
	};

	var bindSelectorChanged = function (editor, itemName, item) {
		return function () {
			var result = getSelectorStateResult(itemName, item);
			if (result !== null) {
				editor.selection.selectorChanged(result.selector, result.handler);
			}
		};
	};

	var create = function (editor, name, items) {
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
			name: name,
			items: toolbarItems
		});
	};

	return {
		create: create
	};
});
