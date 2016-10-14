/**
 * plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global tinymce:true */

tinymce.PluginManager.add('noneditable', function(editor) {
	var editClass, nonEditClass, nonEditableRegExps, contentEditableAttrName = 'contenteditable';

	function hasClass(checkClassName) {
		return function(node) {
			return (" " + node.attr("class") + " ").indexOf(checkClassName) !== -1;
		};
	}

	function convertRegExpsToNonEditable(e) {
		var i = nonEditableRegExps.length, content = e.content, cls = tinymce.trim(nonEditClass);

		function replaceMatchWithSpan(match) {
			var args = arguments, index = args[args.length - 2];
			var prevChar = index > 0 ? content.charAt(index - 1) : '';

			// Is value inside an attribute then don't replace
			if (prevChar === '"') {
				return match;
			}

			// Is value inside a contentEditable="false" tag
			if (prevChar === '>') {
				var findStartTagIndex = content.lastIndexOf('<', index);
				if (findStartTagIndex !== -1) {
					var tagHtml = content.substring(findStartTagIndex, index);
					if (tagHtml.indexOf('contenteditable="false"') !== -1) {
						return match;
					}
				}
			}

			return (
				'<span class="' + cls + '" data-mce-content="' + editor.dom.encode(args[0]) + '">' +
				editor.dom.encode(typeof args[1] === "string" ? args[1] : args[0]) + '</span>'
			);
		}

		// Don't replace the variables when raw is used for example on undo/redo
		if (e.format == "raw") {
			return;
		}

		while (i--) {
			content = content.replace(nonEditableRegExps[i], replaceMatchWithSpan);
		}

		e.content = content;
	}

	editClass = " " + tinymce.trim(editor.getParam("noneditable_editable_class", "mceEditable")) + " ";
	nonEditClass = " " + tinymce.trim(editor.getParam("noneditable_noneditable_class", "mceNonEditable")) + " ";

	var hasEditClass = hasClass(editClass);
	var hasNonEditClass = hasClass(nonEditClass);

	nonEditableRegExps = editor.getParam("noneditable_regexp");
	if (nonEditableRegExps && !nonEditableRegExps.length) {
		nonEditableRegExps = [nonEditableRegExps];
	}

	editor.on('PreInit', function() {
		if (nonEditableRegExps) {
			editor.on('BeforeSetContent', convertRegExpsToNonEditable);
		}

		editor.parser.addAttributeFilter('class', function(nodes) {
			var i = nodes.length, node;

			while (i--) {
				node = nodes[i];

				if (hasEditClass(node)) {
					node.attr(contentEditableAttrName, "true");
				} else if (hasNonEditClass(node)) {
					node.attr(contentEditableAttrName, "false");
				}
			}
		});

		editor.serializer.addAttributeFilter(contentEditableAttrName, function(nodes) {
			var i = nodes.length, node;

			while (i--) {
				node = nodes[i];
				if (!hasEditClass(node) && !hasNonEditClass(node)) {
					continue;
				}

				if (nonEditableRegExps && node.attr('data-mce-content')) {
					node.name = "#text";
					node.type = 3;
					node.raw = true;
					node.value = node.attr('data-mce-content');
				} else {
					node.attr(contentEditableAttrName, null);
				}
			}
		});
	});
});