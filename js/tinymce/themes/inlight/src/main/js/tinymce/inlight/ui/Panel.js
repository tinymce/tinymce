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
	var panel;

	var create = function (editor) {
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

	var togglePositionClass = function (panel, relPos, predicate) {
		relPos = relPos ? relPos.substr(0, 2) : '';

		Tools.each({
			t: 'down',
			b: 'up'
		}, function(cls, pos) {
			panel.classes.toggle('arrow-' + cls, predicate(pos, relPos.substr(0, 1)));
		});

		Tools.each({
			l: 'left',
			r: 'right'
		}, function(cls, pos) {
			panel.classes.toggle('arrow-' + cls, predicate(pos, relPos.substr(1, 1)));
		});
	};

	var showToolbar = function (editor, panel, toolbarMatch) {
		var toolbars = panel.items().filter(function (toolbar) {
			return toolbar.settings.key === toolbarMatch.items;
		});

		if (toolbars.length > 0) {
			return toolbars[0];
		}

		var toolbarCtrl = Toolbar.create(editor, toolbarMatch.items);
		toolbarCtrl.settings.key = toolbarMatch.items;
		panel.add(toolbarCtrl).renderNew();
		return toolbarCtrl;
	};

	var showPanelAt = function (panel, toolbar, editor, elementRect) {
		var contentAreaRect, panelRect, result, userConstainHandler;

		showPanel(panel);
		panel.items().hide();
		showToolbar(editor, panel, toolbar).show();
		panel.reflow();

		userConstainHandler = editor.settings.inline_toolbar_position_handler;
		contentAreaRect = Measure.getContentAreaRect(editor);
		panelRect = DOM.getRect(panel.getEl());

		result = Layout.calc(elementRect, contentAreaRect, panelRect);

		if (result) {
			movePanelTo(panel, Layout.userConstrain(userConstainHandler, result));

			elementRect = result.elementRect;
			togglePositionClass(panel, result.position, function(pos1, pos2) {
				return (!elementRect || elementRect.w > 1) && pos1 === pos2;
			});
		} else {
			hide(panel);
		}
	};

	var show = function (editor, toolbar, targetRect) {
		if (!panel) {
			panel = create(editor);
			panel.renderTo(document.body).moveTo(targetRect.x, targetRect.y).reflow();
		}

		showPanelAt(panel, toolbar, editor, targetRect);
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
