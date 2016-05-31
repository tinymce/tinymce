/**
 * Theme.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define('tinymce/inlight/Theme', [
	'global!tinymce.ThemeManager',
	'global!tinymce.util.Delay',
	'tinymce/inlight/ui/Panel',
	'tinymce/inlight/core/Measure',
	'tinymce/inlight/core/SkinLoader',
	'tinymce/inlight/core/Matcher'
], function(ThemeManager, Delay, Panel, Measure, SkinLoader, Matcher) {
	var DEFAULT_TEXT_SELECTION_ITEMS = 'bold italic | link h2 h3 blockquote';
	var DEFAULT_INSERT_TOOLBAR_ITEMS = 'image media table';

	var getSelectionElements = function (editor) {
		var node = editor.selection.getNode();
		var elms = editor.dom.getParents(node);
		return elms;
	};

	var getDefaultToolbars = function () {
		return [
			{
				predicate: function (elm) {
					return elm.nodeName === 'IMG';
				},

				items: 'alignleft aligncenter alignright | image'
			}
		];
	};

	var getToolbars = function (editor) {
		var toolbars = editor.contextToolbars || [];
		return toolbars.concat(getDefaultToolbars());
	};

	var getTextSelectionToolbar = function (editor) {
		var textSelectionItems = editor.settings.selection_toolbar;

		return {
			items: textSelectionItems || DEFAULT_TEXT_SELECTION_ITEMS
		};
	};

	var getEmptyTextBlockSelectionToolbar = function (editor) {
		var insertToolbarItems = editor.settings.insert_toolbar;

		return {
			items: insertToolbarItems || DEFAULT_INSERT_TOOLBAR_ITEMS
		};
	};

	var isTextSelection = function (editor, toolbars) {
		var selection = editor.selection;
		var selectedElm = selection.getNode();

		return !selection.isCollapsed() && Matcher.match(toolbars, [selectedElm]) === null;
	};

	var showTextSelectionToolbar = function (editor) {
		var textSelectionToolbar = getTextSelectionToolbar(editor);
		var selectionRect = Measure.getSelectionRect(editor);

		Panel.show(editor, textSelectionToolbar, selectionRect);
	};

	var toggleElementSelection = function (editor, toolbars, selectionElms) {
		var match = Matcher.match(toolbars, selectionElms);
		match ? Panel.show(editor, match.toolbar, Measure.getElementRect(editor, match.element)) : Panel.hide();
	};

	var showEmptyBlockToolbar = function (editor) {
		var textSelectionToolbar = getEmptyTextBlockSelectionToolbar(editor);
		var selectionRect = Measure.getSelectionRect(editor);

		Panel.show(editor, textSelectionToolbar, selectionRect);
	};

	var isEmptyTextBlock = function (editor, toolbars, selectionElms) {
		var textBlockElementsMap = editor.schema.getTextBlockElements();
		var match = Matcher.match(toolbars, selectionElms);
		var selectedBlock = editor.dom.getParent(editor.selection.getNode(), editor.dom.isBlock);

		return match === null && selectedBlock && selectedBlock.nodeName in textBlockElementsMap && editor.dom.isEmpty(selectedBlock);
	};

	var toggleSelection = function (editor, toolbars) {
		var selectionElms = getSelectionElements(editor);

		if (isEmptyTextBlock(editor, toolbars, selectionElms)) {
			showEmptyBlockToolbar(editor);
		} else {
			toggleElementSelection(editor, toolbars, selectionElms);
		}
	};

	var showPanel = function (editor) {
		return function () {
			var toolbars = getToolbars(editor);
			isTextSelection(editor, toolbars) ? showTextSelectionToolbar(editor) : toggleSelection(editor, toolbars);
		};
	};

	var bindContextualToolbarsEvents = function (editor) {
		var throttledShowPanel = Delay.throttle(showPanel(editor), 0);

		editor.on('blur hide ObjectResizeStart', Panel.hide);
		editor.on('nodeChange click', showPanel(editor));
		editor.on('ResizeEditor ResizeWindow keyup', throttledShowPanel);
		editor.on('remove', Panel.remove);
	};

	var renderInlineUI = function (editor) {
		var skinName = editor.settings.skin || 'lightgray';

		SkinLoader.load(editor, skinName, function () {
			bindContextualToolbarsEvents(editor);
		});

		return {};
	};

	var fail = function (message) {
		throw new Error(message);
	};

	ThemeManager.add('inlight', function (editor) {
		var renderUI = function () {
			return editor.inline ? renderInlineUI(editor) : fail('Inlight theme only supports inline mode.');
		};

		return {
			renderUI: renderUI
		};
	});

	return function() {};
});
