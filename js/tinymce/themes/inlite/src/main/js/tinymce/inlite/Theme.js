/**
 * Theme.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define('tinymce/inlite/Theme', [
	'global!tinymce.ThemeManager',
	'global!tinymce.util.Delay',
	'tinymce/inlite/ui/Panel',
	'tinymce/inlite/ui/Buttons',
	'tinymce/inlite/core/SkinLoader',
	'tinymce/inlite/core/SelectionMatcher',
	'tinymce/inlite/core/ElementMatcher',
	'tinymce/inlite/core/Matcher',
	'tinymce/inlite/alien/Arr',
	'tinymce/inlite/alien/EditorSettings',
	'tinymce/inlite/core/PredicateId'
], function(ThemeManager, Delay, Panel, Buttons, SkinLoader, SelectionMatcher, ElementMatcher, Matcher, Arr, EditorSettings, PredicateId) {
	var getSelectionElements = function (editor) {
		var node = editor.selection.getNode();
		var elms = editor.dom.getParents(node);
		return elms;
	};

	var createToolbar = function (editor, selector, id, items) {
		var selectorPredicate = function (elm) {
			return editor.dom.is(elm, selector);
		};

		return {
			predicate: selectorPredicate,
			id: id,
			items: items
		};
	};

	var getToolbars = function (editor) {
		var contextToolbars = editor.contextToolbars;

		return Arr.flatten([
			contextToolbars ? contextToolbars : [],
			createToolbar(editor, 'img', 'image', 'alignleft aligncenter alignright')
		]);
	};

	var findMatchResult = function (editor, toolbars) {
		var result, elements, contextToolbarsPredicateIds;

		elements = getSelectionElements(editor);
		contextToolbarsPredicateIds = PredicateId.fromContextToolbars(toolbars);

		result = Matcher.match(editor, [
			ElementMatcher.element(elements[0], contextToolbarsPredicateIds),
			SelectionMatcher.textSelection('text'),
			SelectionMatcher.emptyTextBlock(elements, 'insert'),
			ElementMatcher.parent(elements, contextToolbarsPredicateIds)
		]);

		return result && result.rect ? result : null;
	};

	var togglePanel = function (editor, panel) {
		var toggle = function () {
			var toolbars = getToolbars(editor);
			var result = findMatchResult(editor, toolbars);

			if (result) {
				panel.show(editor, result.id, result.rect, toolbars);
			} else {
				panel.hide();
			}
		};

		return function () {
			if (!editor.removed) {
				toggle();
			}
		};
	};

	var repositionPanel = function (editor, panel) {
		return function () {
			var toolbars = getToolbars(editor);
			var result = findMatchResult(editor, toolbars);

			if (result) {
				panel.reposition(editor, result.id, result.rect);
			}
		};
	};

	var ignoreWhenFormIsVisible = function (panel, f) {
		return function () {
			if (!panel.inForm()) {
				f();
			}
		};
	};

	var bindContextualToolbarsEvents = function (editor, panel) {
		var throttledTogglePanel = Delay.throttle(togglePanel(editor, panel), 0);
		var throttledTogglePanelWhenNotInForm = Delay.throttle(ignoreWhenFormIsVisible(panel, togglePanel(editor, panel)), 0);

		editor.on('blur hide ObjectResizeStart', panel.hide);
		editor.on('click', throttledTogglePanel);
		editor.on('nodeChange mouseup', throttledTogglePanelWhenNotInForm);
		editor.on('ResizeEditor keyup', throttledTogglePanel);
		editor.on('ResizeWindow', repositionPanel(editor, panel));
		editor.on('remove', panel.remove);

		editor.shortcuts.add('Alt+F10', '', panel.focus);
	};

	var overrideLinkShortcut = function (editor, panel) {
		editor.shortcuts.remove('meta+k');
		editor.shortcuts.add('meta+k', '', function () {
			var toolbars = getToolbars(editor);
			var result = result = Matcher.match(editor, [
				SelectionMatcher.textSelection('quicklink')
			]);

			if (result) {
				panel.show(editor, result.id, result.rect, toolbars);
			}
		});
	};

	var renderInlineUI = function (editor, panel) {
		SkinLoader.load(editor, function () {
			bindContextualToolbarsEvents(editor, panel);
			overrideLinkShortcut(editor, panel);
		});

		return {};
	};

	var fail = function (message) {
		throw new Error(message);
	};

	ThemeManager.add('inlite', function (editor) {
		var panel = new Panel();

		Buttons.addToEditor(editor, panel);

		var renderUI = function () {
			return editor.inline ? renderInlineUI(editor, panel) : fail('inlite theme only supports inline mode.');
		};

		return {
			renderUI: renderUI
		};
	});

	return function() {};
});
