/**
 * InsertContent.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Handles inserts of contents into the editor instance.
 *
 * @class tinymce.InsertContent
 * @private
 */
define("tinymce/InsertContent", [
	"tinymce/Env",
	"tinymce/util/Tools",
	"tinymce/html/Serializer",
	"tinymce/caret/CaretWalker",
	"tinymce/caret/CaretPosition",
	"tinymce/dom/ElementUtils",
	"tinymce/dom/NodeType",
	"tinymce/InsertList"
], function(Env, Tools, Serializer, CaretWalker, CaretPosition, ElementUtils, NodeType, InsertList) {
	var isTableCell = NodeType.matchNodeNames('td th');

	var validInsertion = function (editor, value, parentNode) {
		// Should never insert content into bogus elements, since these can
		// be resize handles or similar
		if (parentNode.getAttribute('data-mce-bogus') === 'all') {
			parentNode.parentNode.insertBefore(editor.dom.createFragment(value), parentNode);
		} else {
			// Check if parent is empty or only has one BR element then set the innerHTML of that parent
			var node = parentNode.firstChild;
			var node2 = parentNode.lastChild;
			if (!node || (node === node2 && node.nodeName === 'BR')) {///
				editor.dom.setHTML(parentNode, value);
			} else {
				editor.selection.setContent(value);
			}
		}
	};

	var insertHtmlAtCaret = function(editor, value, details) {
		var parser, serializer, parentNode, rootNode, fragment, args;
		var marker, rng, node, node2, bookmarkHtml, merge;
		var textInlineElements = editor.schema.getTextInlineElements();
		var selection = editor.selection, dom = editor.dom;

		function trimOrPaddLeftRight(html) {
			var rng, container, offset;

			rng = selection.getRng(true);
			container = rng.startContainer;
			offset = rng.startOffset;

			function hasSiblingText(siblingName) {
				return container[siblingName] && container[siblingName].nodeType == 3;
			}

			if (container.nodeType == 3) {
				if (offset > 0) {
					html = html.replace(/^&nbsp;/, ' ');
				} else if (!hasSiblingText('previousSibling')) {
					html = html.replace(/^ /, '&nbsp;');
				}

				if (offset < container.length) {
					html = html.replace(/&nbsp;(<br>|)$/, ' ');
				} else if (!hasSiblingText('nextSibling')) {
					html = html.replace(/(&nbsp;| )(<br>|)$/, '&nbsp;');
				}
			}

			return html;
		}

		// Removes &nbsp; from a [b] c -> a &nbsp;c -> a c
		function trimNbspAfterDeleteAndPaddValue() {
			var rng, container, offset;

			rng = selection.getRng(true);
			container = rng.startContainer;
			offset = rng.startOffset;

			if (container.nodeType == 3 && rng.collapsed) {
				if (container.data[offset] === '\u00a0') {
					container.deleteData(offset, 1);

					if (!/[\u00a0| ]$/.test(value)) {
						value += ' ';
					}
				} else if (container.data[offset - 1] === '\u00a0') {
					container.deleteData(offset - 1, 1);

					if (!/[\u00a0| ]$/.test(value)) {
						value = ' ' + value;
					}
				}
			}
		}

		function reduceInlineTextElements() {
			if (merge) {
				var root = editor.getBody(), elementUtils = new ElementUtils(dom);

				Tools.each(dom.select('*[data-mce-fragment]'), function(node) {
					for (var testNode = node.parentNode; testNode && testNode != root; testNode = testNode.parentNode) {
						if (textInlineElements[node.nodeName.toLowerCase()] && elementUtils.compare(testNode, node)) {
							dom.remove(node, true);
						}
					}
				});
			}
		}

		function markFragmentElements(fragment) {
			var node = fragment;

			while ((node = node.walk())) {
				if (node.type === 1) {
					node.attr('data-mce-fragment', '1');
				}
			}
		}

		function umarkFragmentElements(elm) {
			Tools.each(elm.getElementsByTagName('*'), function(elm) {
				elm.removeAttribute('data-mce-fragment');
			});
		}

		function isPartOfFragment(node) {
			return !!node.getAttribute('data-mce-fragment');
		}

		function canHaveChildren(node) {
			return node && !editor.schema.getShortEndedElements()[node.nodeName];
		}

		function moveSelectionToMarker(marker) {
			var parentEditableFalseElm, parentBlock, nextRng;

			function getContentEditableFalseParent(node) {
				var root = editor.getBody();

				for (; node && node !== root; node = node.parentNode) {
					if (editor.dom.getContentEditable(node) === 'false') {
						return node;
					}
				}

				return null;
			}

			if (!marker) {
				return;
			}

			selection.scrollIntoView(marker);

			// If marker is in cE=false then move selection to that element instead
			parentEditableFalseElm = getContentEditableFalseParent(marker);
			if (parentEditableFalseElm) {
				dom.remove(marker);
				selection.select(parentEditableFalseElm);
				return;
			}

			// Move selection before marker and remove it
			rng = dom.createRng();

			// If previous sibling is a text node set the selection to the end of that node
			node = marker.previousSibling;
			if (node && node.nodeType == 3) {
				rng.setStart(node, node.nodeValue.length);

				// TODO: Why can't we normalize on IE
				if (!Env.ie) {
					node2 = marker.nextSibling;
					if (node2 && node2.nodeType == 3) {
						node.appendData(node2.data);
						node2.parentNode.removeChild(node2);
					}
				}
			} else {
				// If the previous sibling isn't a text node or doesn't exist set the selection before the marker node
				rng.setStartBefore(marker);
				rng.setEndBefore(marker);
			}

			function findNextCaretRng(rng) {
				var caretPos = CaretPosition.fromRangeStart(rng);
				var caretWalker = new CaretWalker(editor.getBody());

				caretPos = caretWalker.next(caretPos);
				if (caretPos) {
					return caretPos.toRange();
				}
			}

			// Remove the marker node and set the new range
			parentBlock = dom.getParent(marker, dom.isBlock);
			dom.remove(marker);

			if (parentBlock && dom.isEmpty(parentBlock)) {
				editor.$(parentBlock).empty();

				rng.setStart(parentBlock, 0);
				rng.setEnd(parentBlock, 0);

				if (!isTableCell(parentBlock) && !isPartOfFragment(parentBlock) && (nextRng = findNextCaretRng(rng))) {
					rng = nextRng;
					dom.remove(parentBlock);
				} else {
					dom.add(parentBlock, dom.create('br', {'data-mce-bogus': '1'}));
				}
			}

			selection.setRng(rng);
		}

		// Check for whitespace before/after value
		if (/^ | $/.test(value)) {
			value = trimOrPaddLeftRight(value);
		}

		// Setup parser and serializer
		parser = editor.parser;
		merge = details.merge;

		serializer = new Serializer({
			validate: editor.settings.validate
		}, editor.schema);
		bookmarkHtml = '<span id="mce_marker" data-mce-type="bookmark">&#xFEFF;&#x200B;</span>';

		// Run beforeSetContent handlers on the HTML to be inserted
		args = {content: value, format: 'html', selection: true};
		editor.fire('BeforeSetContent', args);
		value = args.content;

		// Add caret at end of contents if it's missing
		if (value.indexOf('{$caret}') == -1) {
			value += '{$caret}';
		}

		// Replace the caret marker with a span bookmark element
		value = value.replace(/\{\$caret\}/, bookmarkHtml);

		// If selection is at <body>|<p></p> then move it into <body><p>|</p>
		rng = selection.getRng();
		var caretElement = rng.startContainer || (rng.parentElement ? rng.parentElement() : null);
		var body = editor.getBody();
		if (caretElement === body && selection.isCollapsed()) {
			if (dom.isBlock(body.firstChild) && canHaveChildren(body.firstChild) && dom.isEmpty(body.firstChild)) {
				rng = dom.createRng();
				rng.setStart(body.firstChild, 0);
				rng.setEnd(body.firstChild, 0);
				selection.setRng(rng);
			}
		}

		// Insert node maker where we will insert the new HTML and get it's parent
		if (!selection.isCollapsed()) {
			// Fix for #2595 seems that delete removes one extra character on
			// WebKit for some odd reason if you double click select a word
			editor.selection.setRng(editor.selection.getRng());
			editor.getDoc().execCommand('Delete', false, null);
			trimNbspAfterDeleteAndPaddValue();
		}

		parentNode = selection.getNode();

		// Parse the fragment within the context of the parent node
		var parserArgs = {context: parentNode.nodeName.toLowerCase(), data: details.data};
		fragment = parser.parse(value, parserArgs);

		// Custom handling of lists
		if (details.paste === true && InsertList.isListFragment(fragment) && InsertList.isParentBlockLi(dom, parentNode)) {
			rng = InsertList.insertAtCaret(serializer, dom, editor.selection.getRng(true), fragment);
			editor.selection.setRng(rng);
			editor.fire('SetContent', args);
			return;
		}

		markFragmentElements(fragment);

		// Move the caret to a more suitable location
		node = fragment.lastChild;
		if (node.attr('id') == 'mce_marker') {
			marker = node;

			for (node = node.prev; node; node = node.walk(true)) {
				if (node.type == 3 || !dom.isBlock(node.name)) {
					if (editor.schema.isValidChild(node.parent.name, 'span')) {
						node.parent.insert(marker, node, node.name === 'br');
					}
					break;
				}
			}
		}

		editor._selectionOverrides.showBlockCaretContainer(parentNode);

		// If parser says valid we can insert the contents into that parent
		if (!parserArgs.invalid) {
			value = serializer.serialize(fragment);
			validInsertion(editor, value, parentNode);
		} else {
			// If the fragment was invalid within that context then we need
			// to parse and process the parent it's inserted into

			// Insert bookmark node and get the parent
			selection.setContent(bookmarkHtml);
			parentNode = selection.getNode();
			rootNode = editor.getBody();

			// Opera will return the document node when selection is in root
			if (parentNode.nodeType == 9) {
				parentNode = node = rootNode;
			} else {
				node = parentNode;
			}

			// Find the ancestor just before the root element
			while (node !== rootNode) {
				parentNode = node;
				node = node.parentNode;
			}

			// Get the outer/inner HTML depending on if we are in the root and parser and serialize that
			value = parentNode == rootNode ? rootNode.innerHTML : dom.getOuterHTML(parentNode);
			value = serializer.serialize(
				parser.parse(
					// Need to replace by using a function since $ in the contents would otherwise be a problem
					value.replace(/<span (id="mce_marker"|id=mce_marker).+?<\/span>/i, function() {
						return serializer.serialize(fragment);
					})
				)
			);

			// Set the inner/outer HTML depending on if we are in the root or not
			if (parentNode == rootNode) {
				dom.setHTML(rootNode, value);
			} else {
				dom.setOuterHTML(parentNode, value);
			}
		}

		reduceInlineTextElements();
		moveSelectionToMarker(dom.get('mce_marker'));
		umarkFragmentElements(editor.getBody());
		editor.fire('SetContent', args);
		editor.addVisual();
	};

	var processValue = function (value) {
		var details;

		if (typeof value !== 'string') {
			details = Tools.extend({
				paste: value.paste,
				data: {
					paste: value.paste
				}
			}, value);

			return {
				content: value.content,
				details: details
			};
		}

		return {
			content: value,
			details: {}
		};
	};

	var insertAtCaret = function (editor, value) {
		var result = processValue(value);
		insertHtmlAtCaret(editor, result.content, result.details);
	};

	return {
		insertAtCaret: insertAtCaret
	};
});