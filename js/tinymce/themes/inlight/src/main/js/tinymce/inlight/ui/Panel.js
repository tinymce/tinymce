/**
 * Panel.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define('tinymce/inlight/ui/Panel', [
	'global!tinymce.util.Tools',
	'global!tinymce.ui.Factory',
	'global!tinymce.DOM',
	'tinymce/inlight/ui/Toolbar',
	'tinymce/inlight/core/Measure',
	'tinymce/inlight/core/Layout'
], function (Tools, Factory, DOM, Toolbar, Measure, Layout) {
	var DEFAULT_TEXT_SELECTION_ITEMS = 'bold italic | link h2 h3 blockquote';
	var DEFAULT_INSERT_TOOLBAR_ITEMS = 'image media table';
	var panel;

	var createToolbars = function (editor, toolbars) {
		return Tools.map(toolbars, function (toolbar) {
			return Toolbar.create(editor, toolbar.id, toolbar.items);
		});
	};

	var create = function (editor, toolbars) {
		var items;

		items = createToolbars(editor, toolbars);
		items = items.concat([
			Toolbar.create(editor, 'text', DEFAULT_TEXT_SELECTION_ITEMS),
			Toolbar.create(editor, 'insert', DEFAULT_INSERT_TOOLBAR_ITEMS)
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
			b: 'up'
		}, function(cls, pos) {
			panel.classes.toggle('arrow-' + cls, pos === relPos.substr(0, 1));
		});

		Tools.each({
			l: 'left',
			r: 'right'
		}, function(cls, pos) {
			panel.classes.toggle('arrow-' + cls, pos === relPos.substr(1, 1));
		});
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

		result = Layout.calc(targetRect, contentAreaRect, panelRect);

		if (result) {
			panelRect = result.rect;
			movePanelTo(panel, Layout.userConstrain(userConstainHandler, targetRect, contentAreaRect, panelRect));
			togglePositionClass(panel, result.position);
		} else {
			hide(panel);
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

	var remove = function () {
		if (panel) {
			panel.remove();
			panel = null;
		}
	};

	return {
		show: show,
		hide: hide,
		remove: remove
	};
});
