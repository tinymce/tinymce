/**
 * EditorCommands.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class enables you to add custom editor commands and it contains
 * overrides for native browser commands to address various bugs and issues.
 *
 * @class tinymce.EditorCommands
 */
define("tinymce/EditorCommands", [
	"tinymce/html/Serializer",
	"tinymce/Env",
	"tinymce/util/Tools"
], function(Serializer, Env, Tools) {
	// Added for compression purposes
	var each = Tools.each, extend = Tools.extend;
	var map = Tools.map, inArray = Tools.inArray, explode = Tools.explode;
	var isGecko = Env.gecko, isIE = Env.ie;
	var TRUE = true, FALSE = false;

	return function(editor) {
		var dom = editor.dom,
			selection = editor.selection,
			commands = {state: {}, exec: {}, value: {}},
			settings = editor.settings,
			formatter = editor.formatter,
			bookmark;

		/**
		 * Executes the specified command.
		 *
		 * @method execCommand
		 * @param {String} command Command to execute.
		 * @param {Boolean} ui Optional user interface state.
		 * @param {Object} value Optional value for command.
		 * @return {Boolean} true/false if the command was found or not.
		 */
		function execCommand(command, ui, value) {
			var func;

			command = command.toLowerCase();
			if ((func = commands.exec[command])) {
				func(command, ui, value);
				return TRUE;
			}

			return FALSE;
		}

		/**
		 * Queries the current state for a command for example if the current selection is "bold".
		 *
		 * @method queryCommandState
		 * @param {String} command Command to check the state of.
		 * @return {Boolean/Number} true/false if the selected contents is bold or not, -1 if it's not found.
		 */
		function queryCommandState(command) {
			var func;

			command = command.toLowerCase();
			if ((func = commands.state[command])) {
				return func(command);
			}

			return -1;
		}

		/**
		 * Queries the command value for example the current fontsize.
		 *
		 * @method queryCommandValue
		 * @param {String} command Command to check the value of.
		 * @return {Object} Command value of false if it's not found.
		 */
		function queryCommandValue(command) {
			var func;

			command = command.toLowerCase();
			if ((func = commands.value[command])) {
				return func(command);
			}

			return FALSE;
		}

		/**
		 * Adds commands to the command collection.
		 *
		 * @method addCommands
		 * @param {Object} command_list Name/value collection with commands to add, the names can also be comma separated.
		 * @param {String} type Optional type to add, defaults to exec. Can be value or state as well.
		 */
		function addCommands(command_list, type) {
			type = type || 'exec';

			each(command_list, function(callback, command) {
				each(command.toLowerCase().split(','), function(command) {
					commands[type][command] = callback;
				});
			});
		}

		// Expose public methods
		extend(this, {
			execCommand: execCommand,
			queryCommandState: queryCommandState,
			queryCommandValue: queryCommandValue,
			addCommands: addCommands
		});

		// Private methods

		function execNativeCommand(command, ui, value) {
			if (ui === undefined) {
				ui = FALSE;
			}

			if (value === undefined) {
				value = null;
			}

			return editor.getDoc().execCommand(command, ui, value);
		}

		function isFormatMatch(name) {
			return formatter.match(name);
		}

		function toggleFormat(name, value) {
			formatter.toggle(name, value ? {value: value} : undefined);
			editor.nodeChanged();
		}

		function storeSelection(type) {
			bookmark = selection.getBookmark(type);
		}

		function restoreSelection() {
			selection.moveToBookmark(bookmark);
		}

		// Add execCommand overrides
		addCommands({
			// Ignore these, added for compatibility
			'mceResetDesignMode,mceBeginUndoLevel': function() {},

			// Add undo manager logic
			'mceEndUndoLevel,mceAddUndoLevel': function() {
				editor.undoManager.add();
			},

			'Cut,Copy,Paste': function(command) {
				var doc = editor.getDoc(), failed;

				// Try executing the native command
				try {
					execNativeCommand(command);
				} catch (ex) {
					// Command failed
					failed = TRUE;
				}

				// Present alert message about clipboard access not being available
				if (failed || !doc.queryCommandSupported(command)) {
					var msg = editor.translate(
						"Your browser doesn't support direct access to the clipboard. " +
						"Please use the Ctrl+X/C/V keyboard shortcuts instead."
					);

					if (Env.mac) {
						msg = msg.replace(/Ctrl\+/g, '\u2318+');
					}

					editor.windowManager.alert(msg);
				}
			},

			// Override unlink command
			unlink: function() {
				if (selection.isCollapsed()) {
					var elm = selection.getNode();
					if (elm.tagName == 'A') {
						editor.dom.remove(elm, true);
					}

					return;
				}

				formatter.remove("link");
			},

			// Override justify commands to use the text formatter engine
			'JustifyLeft,JustifyCenter,JustifyRight,JustifyFull': function(command) {
				var align = command.substring(7);

				if (align == 'full') {
					align = 'justify';
				}

				// Remove all other alignments first
				each('left,center,right,justify'.split(','), function(name) {
					if (align != name) {
						formatter.remove('align' + name);
					}
				});

				toggleFormat('align' + align);
				execCommand('mceRepaint');
			},

			// Override list commands to fix WebKit bug
			'InsertUnorderedList,InsertOrderedList': function(command) {
				var listElm, listParent;

				execNativeCommand(command);

				// WebKit produces lists within block elements so we need to split them
				// we will replace the native list creation logic to custom logic later on
				// TODO: Remove this when the list creation logic is removed
				listElm = dom.getParent(selection.getNode(), 'ol,ul');
				if (listElm) {
					listParent = listElm.parentNode;

					// If list is within a text block then split that block
					if (/^(H[1-6]|P|ADDRESS|PRE)$/.test(listParent.nodeName)) {
						storeSelection();
						dom.split(listParent, listElm);
						restoreSelection();
					}
				}
			},

			// Override commands to use the text formatter engine
			'Bold,Italic,Underline,Strikethrough,Superscript,Subscript': function(command) {
				toggleFormat(command);
			},

			// Override commands to use the text formatter engine
			'ForeColor,HiliteColor,FontName': function(command, ui, value) {
				toggleFormat(command, value);
			},

			FontSize: function(command, ui, value) {
				var fontClasses, fontSizes;

				// Convert font size 1-7 to styles
				if (value >= 1 && value <= 7) {
					fontSizes = explode(settings.font_size_style_values);
					fontClasses = explode(settings.font_size_classes);

					if (fontClasses) {
						value = fontClasses[value - 1] || value;
					} else {
						value = fontSizes[value - 1] || value;
					}
				}

				toggleFormat(command, value);
			},

			RemoveFormat: function(command) {
				formatter.remove(command);
			},

			mceBlockQuote: function() {
				toggleFormat('blockquote');
			},

			FormatBlock: function(command, ui, value) {
				return toggleFormat(value || 'p');
			},

			mceCleanup: function() {
				var bookmark = selection.getBookmark();

				editor.setContent(editor.getContent({cleanup: TRUE}), {cleanup: TRUE});

				selection.moveToBookmark(bookmark);
			},

			mceRemoveNode: function(command, ui, value) {
				var node = value || selection.getNode();

				// Make sure that the body node isn't removed
				if (node != editor.getBody()) {
					storeSelection();
					editor.dom.remove(node, TRUE);
					restoreSelection();
				}
			},

			mceSelectNodeDepth: function(command, ui, value) {
				var counter = 0;

				dom.getParent(selection.getNode(), function(node) {
					if (node.nodeType == 1 && counter++ == value) {
						selection.select(node);
						return FALSE;
					}
				}, editor.getBody());
			},

			mceSelectNode: function(command, ui, value) {
				selection.select(value);
			},

			mceInsertContent: function(command, ui, value) {
				var parser, serializer, parentNode, rootNode, fragment, args;
				var marker, rng, node, node2, bookmarkHtml;

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

				// Check for whitespace before/after value
				if (/^ | $/.test(value)) {
					value = trimOrPaddLeftRight(value);
				}

				// Setup parser and serializer
				parser = editor.parser;
				serializer = new Serializer({}, editor.schema);
				bookmarkHtml = '<span id="mce_marker" data-mce-type="bookmark">&#xFEFF;&#200B;</span>';

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
					if (dom.isBlock(body.firstChild) && dom.isEmpty(body.firstChild)) {
						rng = dom.createRng();
						rng.setStart(body.firstChild, 0);
						rng.setEnd(body.firstChild, 0);
						selection.setRng(rng);
					}
				}

				// Insert node maker where we will insert the new HTML and get it's parent
				if (!selection.isCollapsed()) {
					editor.getDoc().execCommand('Delete', false, null);
				}

				parentNode = selection.getNode();

				// Parse the fragment within the context of the parent node
				var parserArgs = {context: parentNode.nodeName.toLowerCase()};
				fragment = parser.parse(value, parserArgs);

				// Move the caret to a more suitable location
				node = fragment.lastChild;
				if (node.attr('id') == 'mce_marker') {
					marker = node;

					for (node = node.prev; node; node = node.walk(true)) {
						if (node.type == 3 || !dom.isBlock(node.name)) {
							node.parent.insert(marker, node, node.name === 'br');
							break;
						}
					}
				}

				// If parser says valid we can insert the contents into that parent
				if (!parserArgs.invalid) {
					value = serializer.serialize(fragment);

					// Check if parent is empty or only has one BR element then set the innerHTML of that parent
					node = parentNode.firstChild;
					node2 = parentNode.lastChild;
					if (!node || (node === node2 && node.nodeName === 'BR')) {
						dom.setHTML(parentNode, value);
					} else {
						selection.setContent(value);
					}
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

				marker = dom.get('mce_marker');
				selection.scrollIntoView(marker);

				// Move selection before marker and remove it
				rng = dom.createRng();

				// If previous sibling is a text node set the selection to the end of that node
				node = marker.previousSibling;
				if (node && node.nodeType == 3) {
					rng.setStart(node, node.nodeValue.length);

					// TODO: Why can't we normalize on IE
					if (!isIE) {
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

				// Remove the marker node and set the new range
				dom.remove(marker);
				selection.setRng(rng);

				// Dispatch after event and add any visual elements needed
				editor.fire('SetContent', args);
				editor.addVisual();
			},

			mceInsertRawHTML: function(command, ui, value) {
				selection.setContent('tiny_mce_marker');
				editor.setContent(
					editor.getContent().replace(/tiny_mce_marker/g, function() {
						return value;
					})
				);
			},

			mceToggleFormat: function(command, ui, value) {
				toggleFormat(value);
			},

			mceSetContent: function(command, ui, value) {
				editor.setContent(value);
			},

			'Indent,Outdent': function(command) {
				var intentValue, indentUnit, value;

				// Setup indent level
				intentValue = settings.indentation;
				indentUnit = /[a-z%]+$/i.exec(intentValue);
				intentValue = parseInt(intentValue, 10);

				if (!queryCommandState('InsertUnorderedList') && !queryCommandState('InsertOrderedList')) {
					// If forced_root_blocks is set to false we don't have a block to indent so lets create a div
					if (!settings.forced_root_block && !dom.getParent(selection.getNode(), dom.isBlock)) {
						formatter.apply('div');
					}

					each(selection.getSelectedBlocks(), function(element) {
						var indentStyleName;

						if (element.nodeName != "LI") {
							indentStyleName = dom.getStyle(element, 'direction', true) == 'rtl' ? 'paddingRight' : 'paddingLeft';

							if (command == 'outdent') {
								value = Math.max(0, parseInt(element.style[indentStyleName] || 0, 10) - intentValue);
								dom.setStyle(element, indentStyleName, value ? value + indentUnit : '');
							} else {
								value = (parseInt(element.style[indentStyleName] || 0, 10) + intentValue) + indentUnit;
								dom.setStyle(element, indentStyleName, value);
							}
						}
					});
				} else {
					execNativeCommand(command);
				}
			},

			mceRepaint: function() {
				if (isGecko) {
					try {
						storeSelection(TRUE);

						if (selection.getSel()) {
							selection.getSel().selectAllChildren(editor.getBody());
						}

						selection.collapse(TRUE);
						restoreSelection();
					} catch (ex) {
						// Ignore
					}
				}
			},

			InsertHorizontalRule: function() {
				editor.execCommand('mceInsertContent', false, '<hr />');
			},

			mceToggleVisualAid: function() {
				editor.hasVisual = !editor.hasVisual;
				editor.addVisual();
			},

			mceReplaceContent: function(command, ui, value) {
				editor.execCommand('mceInsertContent', false, value.replace(/\{\$selection\}/g, selection.getContent({format: 'text'})));
			},

			mceInsertLink: function(command, ui, value) {
				var anchor;

				if (typeof(value) == 'string') {
					value = {href: value};
				}

				anchor = dom.getParent(selection.getNode(), 'a');

				// Spaces are never valid in URLs and it's a very common mistake for people to make so we fix it here.
				value.href = value.href.replace(' ', '%20');

				// Remove existing links if there could be child links or that the href isn't specified
				if (!anchor || !value.href) {
					formatter.remove('link');
				}

				// Apply new link to selection
				if (value.href) {
					formatter.apply('link', value, anchor);
				}
			},

			selectAll: function() {
				var root = dom.getRoot(), rng;

				if (selection.getRng().setStart) {
					rng = dom.createRng();
					rng.setStart(root, 0);
					rng.setEnd(root, root.childNodes.length);
					selection.setRng(rng);
				} else {
					// IE will render it's own root level block elements and sometimes
					// even put font elements in them when the user starts typing. So we need to
					// move the selection to a more suitable element from this:
					// <body>|<p></p></body> to this: <body><p>|</p></body>
					rng = selection.getRng();
					if (!rng.item) {
						rng.moveToElementText(root);
						rng.select();
					}
				}
			},

			"delete": function() {
				execNativeCommand("Delete");

				// Check if body is empty after the delete call if so then set the contents
				// to an empty string and move the caret to any block produced by that operation
				// this fixes the issue with root blocks not being properly produced after a delete call on IE
				var body = editor.getBody();

				if (dom.isEmpty(body)) {
					editor.setContent('');

					if (body.firstChild && dom.isBlock(body.firstChild)) {
						editor.selection.setCursorLocation(body.firstChild, 0);
					} else {
						editor.selection.setCursorLocation(body, 0);
					}
				}
			},

			mceNewDocument: function() {
				editor.setContent('');
			}
		});

		// Add queryCommandState overrides
		addCommands({
			// Override justify commands
			'JustifyLeft,JustifyCenter,JustifyRight,JustifyFull': function(command) {
				var name = 'align' + command.substring(7);
				var nodes = selection.isCollapsed() ? [dom.getParent(selection.getNode(), dom.isBlock)] : selection.getSelectedBlocks();
				var matches = map(nodes, function(node) {
					return !!formatter.matchNode(node, name);
				});
				return inArray(matches, TRUE) !== -1;
			},

			'Bold,Italic,Underline,Strikethrough,Superscript,Subscript': function(command) {
				return isFormatMatch(command);
			},

			mceBlockQuote: function() {
				return isFormatMatch('blockquote');
			},

			Outdent: function() {
				var node;

				if (settings.inline_styles) {
					if ((node = dom.getParent(selection.getStart(), dom.isBlock)) && parseInt(node.style.paddingLeft, 10) > 0) {
						return TRUE;
					}

					if ((node = dom.getParent(selection.getEnd(), dom.isBlock)) && parseInt(node.style.paddingLeft, 10) > 0) {
						return TRUE;
					}
				}

				return (
					queryCommandState('InsertUnorderedList') ||
					queryCommandState('InsertOrderedList') ||
					(!settings.inline_styles && !!dom.getParent(selection.getNode(), 'BLOCKQUOTE'))
				);
			},

			'InsertUnorderedList,InsertOrderedList': function(command) {
				var list = dom.getParent(selection.getNode(), 'ul,ol');

				return list &&
					(
						command === 'insertunorderedlist' && list.tagName === 'UL' ||
						command === 'insertorderedlist' && list.tagName === 'OL'
					);
			}
		}, 'state');

		// Add queryCommandValue overrides
		addCommands({
			'FontSize,FontName': function(command) {
				var value = 0, parent;

				if ((parent = dom.getParent(selection.getNode(), 'span'))) {
					if (command == 'fontsize') {
						value = parent.style.fontSize;
					} else {
						value = parent.style.fontFamily.replace(/, /g, ',').replace(/[\'\"]/g, '').toLowerCase();
					}
				}

				return value;
			}
		}, 'value');

		// Add undo manager logic
		addCommands({
			Undo: function() {
				editor.undoManager.undo();
			},

			Redo: function() {
				editor.undoManager.redo();
			}
		});
	};
});
