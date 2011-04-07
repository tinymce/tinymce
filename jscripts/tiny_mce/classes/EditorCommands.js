/**
 * EditorCommands.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	// Added for compression purposes
	var each = tinymce.each, undefined, TRUE = true, FALSE = false;

	/**
	 * This class enables you to add custom editor commands and it contains
	 * overrides for native browser commands to address various bugs and issues.
	 *
	 * @class tinymce.EditorCommands
	 */
	tinymce.EditorCommands = function(editor) {
		var dom = editor.dom,
			selection = editor.selection,
			commands = {state: {}, exec : {}, value : {}},
			settings = editor.settings,
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
			if (func = commands.exec[command]) {
				func(command, ui, value);
				return TRUE;
			}

			return FALSE;
		};

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
			if (func = commands.state[command])
				return func(command);

			return -1;
		};

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
			if (func = commands.value[command])
				return func(command);

			return FALSE;
		};

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
		};

		// Expose public methods
		tinymce.extend(this, {
			execCommand : execCommand,
			queryCommandState : queryCommandState,
			queryCommandValue : queryCommandValue,
			addCommands : addCommands
		});

		// Private methods

		function execNativeCommand(command, ui, value) {
			if (ui === undefined)
				ui = FALSE;

			if (value === undefined)
				value = null;

			return editor.getDoc().execCommand(command, ui, value);
		};

		function isFormatMatch(name) {
			return editor.formatter.match(name);
		};

		function toggleFormat(name, value) {
			editor.formatter.toggle(name, value ? {value : value} : undefined);
		};

		function storeSelection(type) {
			bookmark = selection.getBookmark(type);
		};

		function restoreSelection() {
			selection.moveToBookmark(bookmark);
		};

		// Add execCommand overrides
		addCommands({
			// Ignore these, added for compatibility
			'mceResetDesignMode,mceBeginUndoLevel' : function() {},

			// Add undo manager logic
			'mceEndUndoLevel,mceAddUndoLevel' : function() {
				editor.undoManager.add();
			},

			'Cut,Copy,Paste' : function(command) {
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
					if (tinymce.isGecko) {
						editor.windowManager.confirm(editor.getLang('clipboard_msg'), function(state) {
							if (state)
								open('http://www.mozilla.org/editor/midasdemo/securityprefs.html', '_blank');
						});
					} else
						editor.windowManager.alert(editor.getLang('clipboard_no_support'));
				}
			},

			// Override unlink command
			unlink : function(command) {
				if (selection.isCollapsed())
					selection.select(selection.getNode());

				execNativeCommand(command);
				selection.collapse(FALSE);
			},

			// Override justify commands to use the text formatter engine
			'JustifyLeft,JustifyCenter,JustifyRight,JustifyFull' : function(command) {
				var align = command.substring(7);

				// Remove all other alignments first
				each('left,center,right,full'.split(','), function(name) {
					if (align != name)
						editor.formatter.remove('align' + name);
				});

				toggleFormat('align' + align);
				execCommand('mceRepaint');
			},

			// Override list commands to fix WebKit bug
			'InsertUnorderedList,InsertOrderedList' : function(command) {
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
			'Bold,Italic,Underline,Strikethrough,Superscript,Subscript' : function(command) {
				toggleFormat(command);
			},

			// Override commands to use the text formatter engine
			'ForeColor,HiliteColor,FontName' : function(command, ui, value) {
				toggleFormat(command, value);
			},

			FontSize : function(command, ui, value) {
				var fontClasses, fontSizes;

				// Convert font size 1-7 to styles
				if (value >= 1 && value <= 7) {
					fontSizes = tinymce.explode(settings.font_size_style_values);
					fontClasses = tinymce.explode(settings.font_size_classes);

					if (fontClasses)
						value = fontClasses[value - 1] || value;
					else
						value = fontSizes[value - 1] || value;
				}

				toggleFormat(command, value);
			},

			RemoveFormat : function(command) {
				editor.formatter.remove(command);
			},

			mceBlockQuote : function(command) {
				toggleFormat('blockquote');
			},

			FormatBlock : function(command, ui, value) {
				return toggleFormat(value || 'p');
			},

			mceCleanup : function() {
				var bookmark = selection.getBookmark();

				editor.setContent(editor.getContent({cleanup : TRUE}), {cleanup : TRUE});

				selection.moveToBookmark(bookmark);
			},

			mceRemoveNode : function(command, ui, value) {
				var node = value || selection.getNode();

				// Make sure that the body node isn't removed
				if (node != editor.getBody()) {
					storeSelection();
					editor.dom.remove(node, TRUE);
					restoreSelection();
				}
			},

			mceSelectNodeDepth : function(command, ui, value) {
				var counter = 0;

				dom.getParent(selection.getNode(), function(node) {
					if (node.nodeType == 1 && counter++ == value) {
						selection.select(node);
						return FALSE;
					}
				}, editor.getBody());
			},

			mceSelectNode : function(command, ui, value) {
				selection.select(value);
			},

			mceInsertContent : function(command, ui, value) {
				var caretNode, rng, rootNode, parent, node, rng, nodeRect, viewPortRect, args;

				function findSuitableCaretNode(node, root_node, next) {
					var walker = new tinymce.dom.TreeWalker(next ? node.nextSibling : node.previousSibling, root_node);

					while ((node = walker.current())) {
						if ((node.nodeType == 3 && tinymce.trim(node.nodeValue).length) || node.nodeName == 'BR' || node.nodeName == 'IMG')
							return node;

						if (next)
							walker.next();
						else
							walker.prev();
					}
				};

				args = {content: value, format: 'html'};
				selection.onBeforeSetContent.dispatch(selection, args);
				value = args.content;

				// Add caret at end of contents if it's missing
				if (value.indexOf('{$caret}') == -1)
					value += '{$caret}';

				// Set the content at selection to a span and replace it's contents with the value
				selection.setContent('<span id="__mce">\uFEFF</span>', {no_events : false});
				dom.setOuterHTML('__mce', value.replace(/\{\$caret\}/, '<span data-mce-type="bookmark" id="__mce">\uFEFF</span>'));

				caretNode = dom.select('#__mce')[0];
				rootNode = dom.getRoot();

				// Move the caret into the last suitable location within the previous sibling if it's a block since the block might be split
				if (caretNode.previousSibling && dom.isBlock(caretNode.previousSibling) || caretNode.parentNode == rootNode) {
					node = findSuitableCaretNode(caretNode, rootNode);
					if (node) {
						if (node.nodeName == 'BR')
							node.parentNode.insertBefore(caretNode, node);
						else
							dom.insertAfter(caretNode, node);
					}
				}

				// Find caret root parent and clean it up using the serializer to avoid nesting
				while (caretNode) {
					if (caretNode === rootNode) {
						// Clean up the parent element by parsing and serializing it
						// This will remove invalid elements/attributes and fix nesting issues
						dom.setOuterHTML(parent, 
							new tinymce.html.Serializer({}, editor.schema).serialize(
								editor.parser.parse(dom.getOuterHTML(parent))
							)
						);

						break;
					}

					parent = caretNode;
					caretNode = caretNode.parentNode;
				}

				// Find caret after cleanup and move selection to that location
				caretNode = dom.select('#__mce')[0];
				if (caretNode) {
					node = findSuitableCaretNode(caretNode, rootNode) || findSuitableCaretNode(caretNode, rootNode, true);
					dom.remove(caretNode);

					if (node) {
						rng = dom.createRng();

						if (node.nodeType == 3) {
							rng.setStart(node, node.length);
							rng.setEnd(node, node.length);
						} else {
							if (node.nodeName == 'BR') {
								rng.setStartBefore(node);
								rng.setEndBefore(node);
							} else {
								rng.setStartAfter(node);
								rng.setEndAfter(node);
							}
						}

						selection.setRng(rng);

						// Scroll range into view scrollIntoView on element can't be used since it will scroll the main view port as well
						if (!tinymce.isIE) {
							node = dom.create('span', null, '\u00a0');
							rng.insertNode(node);
							nodeRect = dom.getRect(node);
							viewPortRect = dom.getViewPort(editor.getWin());

							// Check if node is out side the viewport if it is then scroll to it
							if ((nodeRect.y > viewPortRect.y + viewPortRect.h || nodeRect.y < viewPortRect.y) ||
								(nodeRect.x > viewPortRect.x + viewPortRect.w || nodeRect.x < viewPortRect.x)) {
								editor.getBody().scrollLeft = nodeRect.x;
								editor.getBody().scrollTop = nodeRect.y;
							}

							dom.remove(node);
						}

						// Make sure that the selection is collapsed after we removed the node fixes a WebKit bug
						// where WebKit would place the endContainer/endOffset at a different location than the startContainer/startOffset
						selection.collapse(true);
					}
				}

				selection.onSetContent.dispatch(selection, args);
				editor.addVisual();
			},

			mceInsertRawHTML : function(command, ui, value) {
				selection.setContent('tiny_mce_marker');
				editor.setContent(editor.getContent().replace(/tiny_mce_marker/g, function() { return value }));
			},

			mceSetContent : function(command, ui, value) {
				editor.setContent(value);
			},

			'Indent,Outdent' : function(command) {
				var intentValue, indentUnit, value;

				// Setup indent level
				intentValue = settings.indentation;
				indentUnit = /[a-z%]+$/i.exec(intentValue);
				intentValue = parseInt(intentValue);

				if (!queryCommandState('InsertUnorderedList') && !queryCommandState('InsertOrderedList')) {
					each(selection.getSelectedBlocks(), function(element) {
						if (command == 'outdent') {
							value = Math.max(0, parseInt(element.style.paddingLeft || 0) - intentValue);
							dom.setStyle(element, 'paddingLeft', value ? value + indentUnit : '');
						} else
							dom.setStyle(element, 'paddingLeft', (parseInt(element.style.paddingLeft || 0) + intentValue) + indentUnit);
					});
				} else
					execNativeCommand(command);
			},

			mceRepaint : function() {
				var bookmark;

				if (tinymce.isGecko) {
					try {
						storeSelection(TRUE);

						if (selection.getSel())
							selection.getSel().selectAllChildren(editor.getBody());

						selection.collapse(TRUE);
						restoreSelection();
					} catch (ex) {
						// Ignore
					}
				}
			},

			mceToggleFormat : function(command, ui, value) {
				editor.formatter.toggle(value);
			},

			InsertHorizontalRule : function() {
				editor.execCommand('mceInsertContent', false, '<hr />');
			},

			mceToggleVisualAid : function() {
				editor.hasVisual = !editor.hasVisual;
				editor.addVisual();
			},

			mceReplaceContent : function(command, ui, value) {
				editor.execCommand('mceInsertContent', false, value.replace(/\{\$selection\}/g, selection.getContent({format : 'text'})));
			},

			mceInsertLink : function(command, ui, value) {
				var link = dom.getParent(selection.getNode(), 'a'), img, floatVal;

				if (tinymce.is(value, 'string'))
					value = {href : value};

				// Spaces are never valid in URLs and it's a very common mistake for people to make so we fix it here.
				value.href = value.href.replace(' ', '%20');

				if (!link) {
					// WebKit can't create links on float images for some odd reason so just remove it and restore it later
					if (tinymce.isWebKit) {
						img = dom.getParent(selection.getNode(), 'img');

						if (img) {
							floatVal = img.style.cssFloat;
							img.style.cssFloat = null;
						}
					}

					execNativeCommand('CreateLink', FALSE, 'javascript:mctmp(0);');

					// Restore float value
					if (floatVal)
						img.style.cssFloat = floatVal;

					each(dom.select("a[href='javascript:mctmp(0);']"), function(link) {
						dom.setAttribs(link, value);
					});
				} else {
					if (value.href)
						dom.setAttribs(link, value);
					else
						editor.dom.remove(link, TRUE);
				}
			},
			
			selectAll : function() {
				var root = dom.getRoot(), rng = dom.createRng();

				rng.setStart(root, 0);
				rng.setEnd(root, root.childNodes.length);

				editor.selection.setRng(rng);
			}
		});

		// Add queryCommandState overrides
		addCommands({
			// Override justify commands
			'JustifyLeft,JustifyCenter,JustifyRight,JustifyFull' : function(command) {
				return isFormatMatch('align' + command.substring(7));
			},

			'Bold,Italic,Underline,Strikethrough,Superscript,Subscript' : function(command) {
				return isFormatMatch(command);
			},

			mceBlockQuote : function() {
				return isFormatMatch('blockquote');
			},

			Outdent : function() {
				var node;

				if (settings.inline_styles) {
					if ((node = dom.getParent(selection.getStart(), dom.isBlock)) && parseInt(node.style.paddingLeft) > 0)
						return TRUE;

					if ((node = dom.getParent(selection.getEnd(), dom.isBlock)) && parseInt(node.style.paddingLeft) > 0)
						return TRUE;
				}

				return queryCommandState('InsertUnorderedList') || queryCommandState('InsertOrderedList') || (!settings.inline_styles && !!dom.getParent(selection.getNode(), 'BLOCKQUOTE'));
			},

			'InsertUnorderedList,InsertOrderedList' : function(command) {
				return dom.getParent(selection.getNode(), command == 'insertunorderedlist' ? 'UL' : 'OL');
			}
		}, 'state');

		// Add queryCommandValue overrides
		addCommands({
			'FontSize,FontName' : function(command) {
				var value = 0, parent;

				if (parent = dom.getParent(selection.getNode(), 'span')) {
					if (command == 'fontsize')
						value = parent.style.fontSize;
					else
						value = parent.style.fontFamily.replace(/, /g, ',').replace(/[\'\"]/g, '').toLowerCase();
				}

				return value;
			}
		}, 'value');

		// Add undo manager logic
		if (settings.custom_undo_redo) {
			addCommands({
				Undo : function() {
					editor.undoManager.undo();
				},

				Redo : function() {
					editor.undoManager.redo();
				}
			});
		}
	};
})(tinymce);
