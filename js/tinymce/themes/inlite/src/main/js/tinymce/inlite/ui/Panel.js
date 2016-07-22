/**
 * Panel.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define('tinymce/inlite/ui/Panel', [
	'global!tinymce.util.Tools',
	'global!tinymce.ui.Factory',
	'global!tinymce.DOM',
	'tinymce/inlite/ui/Toolbar',
	'tinymce/inlite/ui/Forms',
	'tinymce/inlite/core/Measure',
	'tinymce/inlite/core/Layout'
], function (Tools, Factory, DOM, Toolbar, Forms, Measure, Layout) {
	return function () {
		var DEFAULT_TEXT_SELECTION_ITEMS = 'bold italic | quicklink h2 h3 blockquote';
		var DEFAULT_INSERT_TOOLBAR_ITEMS = 'quickimage quicktable';
		var panel, currentRect;

		var createToolbars = function (editor, toolbars) {
			return Tools.map(toolbars, function (toolbar) {
				return Toolbar.create(editor, toolbar.id, toolbar.items);
			});
		};

		var getTextSelectionToolbarItems = function (settings) {
			var value = settings.selection_toolbar;
			return value ? value : DEFAULT_TEXT_SELECTION_ITEMS;
		};

		var getInsertToolbarItems = function (settings) {
			var value = settings.insert_toolbar;
			return value ? value : DEFAULT_INSERT_TOOLBAR_ITEMS;
		};

		var create = function (editor, toolbars) {
			var items, settings = editor.settings;

			items = createToolbars(editor, toolbars);
			items = items.concat([
				Toolbar.create(editor, 'text', getTextSelectionToolbarItems(settings)),
				Toolbar.create(editor, 'insert', getInsertToolbarItems(settings)),
				Forms.createQuickLinkForm(editor, hide)
			]);

			return Factory.create({
				type: 'floatpanel',
				role: 'dialog',
				classes: 'tinymce tinymce-inline arrow',
				ariaLabel: 'Inline toolbar',
				layout: 'flex',
				direction: 'column',
				align: 'stretch',
				autohide: false,
				autofix: true,
				fixed: true,
				border: 1,
				items: items,
				oncancel: function() {
					editor.focus();
				}
			});
		};

		var showPanel = function (panel) {
			if (panel) {
				panel.show();
			}
		};

		var movePanelTo = function (panel, pos) {
			panel.moveTo(pos.x, pos.y);
		};

		var togglePositionClass = function (panel, relPos) {
			relPos = relPos ? relPos.substr(0, 2) : '';

			Tools.each({
				t: 'down',
				b: 'up',
				c: 'center'
			}, function(cls, pos) {
				panel.classes.toggle('arrow-' + cls, pos === relPos.substr(0, 1));
			});

			if (relPos === 'cr') {
				panel.classes.toggle('arrow-left', true);
				panel.classes.toggle('arrow-right', false);
			} else if (relPos === 'cl') {
				panel.classes.toggle('arrow-left', true);
				panel.classes.toggle('arrow-right', true);
			} else {
				Tools.each({
					l: 'left',
					r: 'right'
				}, function(cls, pos) {
					panel.classes.toggle('arrow-' + cls, pos === relPos.substr(1, 1));
				});
			}
		};

		var showToolbar = function (panel, id) {
			var toolbars = panel.items().filter('#' + id);

			if (toolbars.length > 0) {
				toolbars[0].show();
				panel.reflow();
			}
		};

		var showPanelAt = function (panel, id, editor, targetRect) {
			var contentAreaRect, panelRect, result, userConstainHandler;

			showPanel(panel);
			panel.items().hide();
			showToolbar(panel, id);

			userConstainHandler = editor.settings.inline_toolbar_position_handler;
			contentAreaRect = Measure.getContentAreaRect(editor);
			panelRect = DOM.getRect(panel.getEl());

			if (id === 'insert') {
				result = Layout.calcInsert(targetRect, contentAreaRect, panelRect);
			} else {
				result = Layout.calc(targetRect, contentAreaRect, panelRect);
			}

			if (result) {
				panelRect = result.rect;
				currentRect = targetRect;
				movePanelTo(panel, Layout.userConstrain(userConstainHandler, targetRect, contentAreaRect, panelRect));

				togglePositionClass(panel, result.position);
			} else {
				hide(panel);
			}
		};

		var hasFormVisible = function () {
			return panel.items().filter('form:visible').length > 0;
		};

		var showForm = function (editor, id) {
			if (panel) {
				panel.items().hide();
				showToolbar(panel, id);

				var contentAreaRect, panelRect, result, userConstainHandler;

				showPanel(panel);
				panel.items().hide();
				showToolbar(panel, id);

				userConstainHandler = editor.settings.inline_toolbar_position_handler;
				contentAreaRect = Measure.getContentAreaRect(editor);
				panelRect = DOM.getRect(panel.getEl());

				result = Layout.calc(currentRect, contentAreaRect, panelRect);

				if (result) {
					panelRect = result.rect;
					movePanelTo(panel, Layout.userConstrain(userConstainHandler, currentRect, contentAreaRect, panelRect));

					togglePositionClass(panel, result.position);
				}
			}
		};

		var show = function (editor, id, targetRect, toolbars) {
			if (!panel) {
				panel = create(editor, toolbars);
				panel.renderTo(document.body).reflow().moveTo(targetRect.x, targetRect.y);
				editor.nodeChanged();
			}

			showPanelAt(panel, id, editor, targetRect);
		};

		var hide = function () {
			if (panel) {
				panel.hide();
			}
		};

		var focus = function () {
			if (panel) {
				panel.find('toolbar:visible').eq(0).each(function (item) {
					item.focus(true);
				});
			}
		};

		var remove = function () {
			if (panel) {
				panel.remove();
				panel = null;
			}
		};

		var inForm = function () {
			return panel && panel.visible() && hasFormVisible();
		};

		return {
			show: show,
			showForm: showForm,
			inForm: inForm,
			hide: hide,
			focus: focus,
			remove: remove
		};
	};
});
