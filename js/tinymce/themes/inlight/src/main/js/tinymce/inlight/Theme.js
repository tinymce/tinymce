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
	'tinymce/inlight/core/SkinLoader',
	'tinymce/inlight/core/SelectionMatcher',
	'tinymce/inlight/core/ElementMatcher',
	'tinymce/inlight/core/Matcher',
	'tinymce/inlight/alien/Arr',
	'tinymce/inlight/core/PredicateId'
], function(ThemeManager, Delay, Panel, SkinLoader, SelectionMatcher, ElementMatcher, Matcher, Arr, PredicateId) {
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
			createToolbar(editor, 'img', 'image', 'alignleft aligncenter alignright | image')
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

		return result;
	};

	var showPanel = function (editor) {
		return function () {
			var toolbars = getToolbars(editor);
			var result = findMatchResult(editor, toolbars);
			result ? Panel.show(editor, result.id, result.rect, toolbars) : Panel.hide();
		};
	};

	var bindContextualToolbarsEvents = function (editor) {
		var throttledShowPanel = Delay.throttle(showPanel(editor), 0);

		editor.on('blur hide ObjectResizeStart', Panel.hide);
		editor.on('nodeChange click mouseup', throttledShowPanel);
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
