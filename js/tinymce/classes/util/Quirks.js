/**
 * Quirks.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 *
 * @ignore-file
 */

/**
 * This file includes fixes for various browser quirks it's made to make it easy to add/remove browser specific fixes.
 *
 * @class tinymce.util.Quirks
 */
define("tinymce/util/Quirks", [
	"tinymce/util/VK",
	"tinymce/dom/RangeUtils",
	"tinymce/html/Node",
	"tinymce/html/Entities",
	"tinymce/Env",
	"tinymce/util/Tools"
], function(VK, RangeUtils, Node, Entities, Env, Tools) {
	return function(editor) {
		var each = Tools.each;
		var BACKSPACE = VK.BACKSPACE, DELETE = VK.DELETE, dom = editor.dom, selection = editor.selection,
			settings = editor.settings, parser = editor.parser, serializer = editor.serializer;
		var isGecko = Env.gecko, isIE = Env.ie, isWebKit = Env.webkit;

		/**
		 * Executes a command with a specific state this can be to enable/disable browser editing features.
		 */
		function setEditorCommandState(cmd, state) {
			try {
				editor.getDoc().execCommand(cmd, false, state);
			} catch (ex) {
				// Ignore
			}
		}

		/**
		 * Returns current IE document mode.
		 */
		function getDocumentMode() {
			var documentMode = editor.getDoc().documentMode;

			return documentMode ? documentMode : 6;
		}

		/**
		 * Returns true/false if the event is prevented or not.
		 *
		 * @private
		 * @param {Event} e Event object.
		 * @return {Boolean} true/false if the event is prevented or not.
		 */
		function isDefaultPrevented(e) {
			return e.isDefaultPrevented();
		}

		/**
		 * Fixes a WebKit bug when deleting contents using backspace or delete key.
		 * WebKit will produce a span element if you delete across two block elements.
		 *
		 * Example:
		 * <h1>a</h1><p>|b</p>
		 *
		 * Will produce this on backspace:
		 * <h1>a<span class="Apple-style-span" style="<all runtime styles>">b</span></p>
		 *
		 * This fixes the backspace to produce:
		 * <h1>a|b</p>
		 *
		 * See bug: https://bugs.webkit.org/show_bug.cgi?id=45784
		 *
		 * This code is a bit of a hack and hopefully it will be fixed soon in WebKit.
		 */
		function cleanupStylesWhenDeleting() {
			function removeMergedFormatSpans(isDelete) {
				var rng, blockElm, wrapperElm, bookmark, container, offset, elm;

				function isAtStartOrEndOfElm() {
					if (container.nodeType == 3) {
						if (isDelete && offset == container.length) {
							return true;
						}

						if (!isDelete && offset === 0) {
							return true;
						}
					}
				}

				rng = selection.getRng();
				var tmpRng = [rng.startContainer, rng.startOffset, rng.endContainer, rng.endOffset];

				if (!rng.collapsed) {
					isDelete = true;
				}

				container = rng[(isDelete ? 'start' : 'end') + 'Container'];
				offset = rng[(isDelete ? 'start' : 'end') + 'Offset'];

				if (container.nodeType == 3) {
					blockElm = dom.getParent(rng.startContainer, dom.isBlock);

					// On delete clone the root span of the next block element
					if (isDelete) {
						blockElm = dom.getNext(blockElm, dom.isBlock);
					}

					if (blockElm && (isAtStartOrEndOfElm() || !rng.collapsed)) {
						// Wrap children of block in a EM and let WebKit stick is
						// runtime styles junk into that EM
						wrapperElm = dom.create('em', {'id': '__mceDel'});

						each(Tools.grep(blockElm.childNodes), function(node) {
							wrapperElm.appendChild(node);
						});

						blockElm.appendChild(wrapperElm);
					}
				}

				// Do the backspace/delete action
				rng = dom.createRng();
				rng.setStart(tmpRng[0], tmpRng[1]);
				rng.setEnd(tmpRng[2], tmpRng[3]);
				selection.setRng(rng);
				editor.getDoc().execCommand(isDelete ? 'ForwardDelete' : 'Delete', false, null);

				// Remove temp wrapper element
				if (wrapperElm) {
					bookmark = selection.getBookmark();

					while ((elm = dom.get('__mceDel'))) {
						dom.remove(elm, true);
					}

					selection.moveToBookmark(bookmark);
				}
			}

			editor.on('keydown', function(e) {
				var isDelete;

				isDelete = e.keyCode == DELETE;
				if (!isDefaultPrevented(e) && (isDelete || e.keyCode == BACKSPACE) && !VK.modifierPressed(e)) {
					e.preventDefault();
					removeMergedFormatSpans(isDelete);
				}
			});

			editor.addCommand('Delete', function() {removeMergedFormatSpans();});
		}

		/**
		 * Makes sure that the editor body becomes empty when backspace or delete is pressed in empty editors.
		 *
		 * For example:
		 * <p><b>|</b></p>
		 *
		 * Or:
		 * <h1>|</h1>
		 *
		 * Or:
		 * [<h1></h1>]
		 */
		function emptyEditorWhenDeleting() {
			function serializeRng(rng) {
				var body = dom.create("body");
				var contents = rng.cloneContents();
				body.appendChild(contents);
				return selection.serializer.serialize(body, {format: 'html'});
			}

			function allContentsSelected(rng) {
				var selection = serializeRng(rng);

				var allRng = dom.createRng();
				allRng.selectNode(editor.getBody());

				var allSelection = serializeRng(allRng);
				return selection === allSelection;
			}

			editor.on('keydown', function(e) {
				var keyCode = e.keyCode, isCollapsed;

				// Empty the editor if it's needed for example backspace at <p><b>|</b></p>
				if (!isDefaultPrevented(e) && (keyCode == DELETE || keyCode == BACKSPACE)) {
					isCollapsed = editor.selection.isCollapsed();

					// Selection is collapsed but the editor isn't empty
					if (isCollapsed && !dom.isEmpty(editor.getBody())) {
						return;
					}

					// IE deletes all contents correctly when everything is selected
					if (isIE && !isCollapsed) {
						return;
					}

					// Selection isn't collapsed but not all the contents is selected
					if (!isCollapsed && !allContentsSelected(editor.selection.getRng())) {
						return;
					}

					// Manually empty the editor
					e.preventDefault();
					editor.setContent('');
					editor.selection.setCursorLocation(editor.getBody(), 0);
					editor.nodeChanged();
				}
			});
		}

		/**
		 * WebKit doesn't select all the nodes in the body when you press Ctrl+A.
		 * This selects the whole body so that backspace/delete logic will delete everything
		 */
		function selectAll() {
			editor.on('keydown', function(e) {
				if (!isDefaultPrevented(e) && e.keyCode == 65 && VK.metaKeyPressed(e)) {
					e.preventDefault();
					editor.execCommand('SelectAll');
				}
			});
		}

		/**
		 * WebKit has a weird issue where it some times fails to properly convert keypresses to input method keystrokes.
		 * The IME on Mac doesn't initialize when it doesn't fire a proper focus event.
		 *
		 * This seems to happen when the user manages to click the documentElement element then the window doesn't get proper focus until
		 * you enter a character into the editor.
		 *
		 * It also happens when the first focus in made to the body.
		 *
		 * See: https://bugs.webkit.org/show_bug.cgi?id=83566
		 */
		function inputMethodFocus() {
			if (!editor.settings.content_editable) {
				// Case 1 IME doesn't initialize if you focus the document
				dom.bind(editor.getDoc(), 'focusin', function() {
					selection.setRng(selection.getRng());
				});

				// Case 2 IME doesn't initialize if you click the documentElement it also doesn't properly fire the focusin event
				dom.bind(editor.getDoc(), 'mousedown', function(e) {
					if (e.target == editor.getDoc().documentElement) {
						editor.getWin().focus();
						selection.setRng(selection.getRng());
					}
				});
			}
		}

		/**
		 * Backspacing in FireFox/IE from a paragraph into a horizontal rule results in a floating text node because the
		 * browser just deletes the paragraph - the browser fails to merge the text node with a horizontal rule so it is
		 * left there. TinyMCE sees a floating text node and wraps it in a paragraph on the key up event (ForceBlocks.js
		 * addRootBlocks), meaning the action does nothing. With this code, FireFox/IE matche the behaviour of other
		 * browsers
		 */
		function removeHrOnBackspace() {
			editor.on('keydown', function(e) {
				if (!isDefaultPrevented(e) && e.keyCode === BACKSPACE) {
					if (selection.isCollapsed() && selection.getRng(true).startOffset === 0) {
						var node = selection.getNode();
						var previousSibling = node.previousSibling;

						if (previousSibling && previousSibling.nodeName && previousSibling.nodeName.toLowerCase() === "hr") {
							dom.remove(previousSibling);
							e.preventDefault();
						}
					}
				}
			});
		}

		/**
		 * Firefox 3.x has an issue where the body element won't get proper focus if you click out
		 * side it's rectangle.
		 */
		function focusBody() {
			// Fix for a focus bug in FF 3.x where the body element
			// wouldn't get proper focus if the user clicked on the HTML element
			if (!window.Range.prototype.getClientRects) { // Detect getClientRects got introduced in FF 4
				editor.on('mousedown', function(e) {
					if (!isDefaultPrevented(e) && e.target.nodeName === "HTML") {
						var body = editor.getBody();

						// Blur the body it's focused but not correctly focused
						body.blur();

						// Refocus the body after a little while
						setTimeout(function() {
							body.focus();
						}, 0);
					}
				});
			}
		}

		/**
		 * WebKit has a bug where it isn't possible to select image, hr or anchor elements
		 * by clicking on them so we need to fake that.
		 */
		function selectControlElements() {
			editor.on('click', function(e) {
				e = e.target;

				// Workaround for bug, http://bugs.webkit.org/show_bug.cgi?id=12250
				// WebKit can't even do simple things like selecting an image
				// Needs tobe the setBaseAndExtend or it will fail to select floated images
				if (/^(IMG|HR)$/.test(e.nodeName)) {
					selection.getSel().setBaseAndExtent(e, 0, e, 1);
				}

				if (e.nodeName == 'A' && dom.hasClass(e, 'mceItemAnchor')) {
					selection.select(e);
				}

				editor.nodeChanged();
			});
		}

		/**
		 * Fixes a Gecko bug where the style attribute gets added to the wrong element when deleting between two block elements.
		 *
		 * Fixes do backspace/delete on this:
		 * <p>bla[ck</p><p style="color:red">r]ed</p>
		 *
		 * Would become:
		 * <p>bla|ed</p>
		 *
		 * Instead of:
		 * <p style="color:red">bla|ed</p>
		 */
		function removeStylesWhenDeletingAccrossBlockElements() {
			function getAttributeApplyFunction() {
				var template = dom.getAttribs(selection.getStart().cloneNode(false));

				return function() {
					var target = selection.getStart();

					if (target !== editor.getBody()) {
						dom.setAttrib(target, "style", null);

						each(template, function(attr) {
							target.setAttributeNode(attr.cloneNode(true));
						});
					}
				};
			}

			function isSelectionAcrossElements() {
				return !selection.isCollapsed() &&
					dom.getParent(selection.getStart(), dom.isBlock) != dom.getParent(selection.getEnd(), dom.isBlock);
			}

			editor.on('keypress', function(e) {
				var applyAttributes;

				if (!isDefaultPrevented(e) && (e.keyCode == 8 || e.keyCode == 46) && isSelectionAcrossElements()) {
					applyAttributes = getAttributeApplyFunction();
					editor.getDoc().execCommand('delete', false, null);
					applyAttributes();
					e.preventDefault();
					return false;
				}
			});

			dom.bind(editor.getDoc(), 'cut', function(e) {
				var applyAttributes;

				if (!isDefaultPrevented(e) && isSelectionAcrossElements()) {
					applyAttributes = getAttributeApplyFunction();

					setTimeout(function() {
						applyAttributes();
					}, 0);
				}
			});
		}

		/**
		 * Fire a nodeChanged when the selection is changed on WebKit this fixes selection issues on iOS5. It only fires the nodeChange
		 * event every 50ms since it would other wise update the UI when you type and it hogs the CPU.
		 */
		function selectionChangeNodeChanged() {
			var lastRng, selectionTimer;

			editor.on('selectionchange', function() {
				if (selectionTimer) {
					clearTimeout(selectionTimer);
					selectionTimer = 0;
				}

				selectionTimer = window.setTimeout(function() {
					var rng = selection.getRng();

					// Compare the ranges to see if it was a real change or not
					if (!lastRng || !RangeUtils.compareRanges(rng, lastRng)) {
						editor.nodeChanged();
						lastRng = rng;
					}
				}, 50);
			});
		}

		/**
		 * Screen readers on IE needs to have the role application set on the body.
		 */
		function ensureBodyHasRoleApplication() {
			document.body.setAttribute("role", "application");
		}

		/**
		 * Backspacing into a table behaves differently depending upon browser type.
		 * Therefore, disable Backspace when cursor immediately follows a table.
		 */
		function disableBackspaceIntoATable() {
			editor.on('keydown', function(e) {
				if (!isDefaultPrevented(e) && e.keyCode === BACKSPACE) {
					if (selection.isCollapsed() && selection.getRng(true).startOffset === 0) {
						var previousSibling = selection.getNode().previousSibling;
						if (previousSibling && previousSibling.nodeName && previousSibling.nodeName.toLowerCase() === "table") {
							e.preventDefault();
							return false;
						}
					}
				}
			});
		}

		/**
		 * Old IE versions can't properly render BR elements in PRE tags white in contentEditable mode. So this
		 * logic adds a \n before the BR so that it will get rendered.
		 */
		function addNewLinesBeforeBrInPre() {
			// IE8+ rendering mode does the right thing with BR in PRE
			if (getDocumentMode() > 7) {
				return;
			}

			 // Enable display: none in area and add a specific class that hides all BR elements in PRE to
			 // avoid the caret from getting stuck at the BR elements while pressing the right arrow key
			setEditorCommandState('RespectVisibilityInDesign', true);
			editor.contentStyles.push('.mceHideBrInPre pre br {display: none}');
			dom.addClass(editor.getBody(), 'mceHideBrInPre');

			// Adds a \n before all BR elements in PRE to get them visual
			parser.addNodeFilter('pre', function(nodes) {
				var i = nodes.length, brNodes, j, brElm, sibling;

				while (i--) {
					brNodes = nodes[i].getAll('br');
					j = brNodes.length;
					while (j--) {
						brElm = brNodes[j];

						// Add \n before BR in PRE elements on older IE:s so the new lines get rendered
						sibling = brElm.prev;
						if (sibling && sibling.type === 3 && sibling.value.charAt(sibling.value - 1) != '\n') {
							sibling.value += '\n';
						} else {
							brElm.parent.insert(new Node('#text', 3), brElm, true).value = '\n';
						}
					}
				}
			});

			// Removes any \n before BR elements in PRE since other browsers and in contentEditable=false mode they will be visible
			serializer.addNodeFilter('pre', function(nodes) {
				var i = nodes.length, brNodes, j, brElm, sibling;

				while (i--) {
					brNodes = nodes[i].getAll('br');
					j = brNodes.length;
					while (j--) {
						brElm = brNodes[j];
						sibling = brElm.prev;
						if (sibling && sibling.type == 3) {
							sibling.value = sibling.value.replace(/\r?\n$/, '');
						}
					}
				}
			});
		}

		/**
		 * Moves style width/height to attribute width/height when the user resizes an image on IE.
		 */
		function removePreSerializedStylesWhenSelectingControls() {
			dom.bind(editor.getBody(), 'mouseup', function() {
				var value, node = selection.getNode();

				// Moved styles to attributes on IMG eements
				if (node.nodeName == 'IMG') {
					// Convert style width to width attribute
					if ((value = dom.getStyle(node, 'width'))) {
						dom.setAttrib(node, 'width', value.replace(/[^0-9%]+/g, ''));
						dom.setStyle(node, 'width', '');
					}

					// Convert style height to height attribute
					if ((value = dom.getStyle(node, 'height'))) {
						dom.setAttrib(node, 'height', value.replace(/[^0-9%]+/g, ''));
						dom.setStyle(node, 'height', '');
					}
				}
			});
		}

		/**
		 * Backspace or delete on WebKit will combine all visual styles in a span if the last character is deleted.
		 *
		 * For example backspace on:
		 * <p><b>x|</b></p>
		 *
		 * Will produce:
		 * <p><span style="font-weight: bold">|<br></span></p>
		 *
		 * When it should produce:
		 * <p><b>|<br></b></p>
		 *
		 * See: https://bugs.webkit.org/show_bug.cgi?id=81656
		 */
		function keepInlineElementOnDeleteBackspace() {
			editor.on('keydown', function(e) {
				var isDelete, rng, container, offset, brElm, sibling, collapsed, nonEmptyElements;

				isDelete = e.keyCode == DELETE;
				if (!isDefaultPrevented(e) && (isDelete || e.keyCode == BACKSPACE) && !VK.modifierPressed(e)) {
					rng = selection.getRng();
					container = rng.startContainer;
					offset = rng.startOffset;
					collapsed = rng.collapsed;

					// Override delete if the start container is a text node and is at the beginning of text or
					// just before/after the last character to be deleted in collapsed mode
					if (container.nodeType == 3 && container.nodeValue.length > 0 && ((offset === 0 && !collapsed) ||
						(collapsed && offset === (isDelete ? 0 : 1)))) {
						// Edge case when deleting <p><b><img> |x</b></p>
						sibling = container.previousSibling;
						if (sibling && sibling.nodeName == "IMG") {
							return;
						}

						nonEmptyElements = editor.schema.getNonEmptyElements();

						// Prevent default logic since it's broken
						e.preventDefault();

						// Insert a BR before the text node this will prevent the containing element from being deleted/converted
						brElm = dom.create('br', {id: '__tmp'});
						container.parentNode.insertBefore(brElm, container);

						// Do the browser delete
						editor.getDoc().execCommand(isDelete ? 'ForwardDelete' : 'Delete', false, null);

						// Check if the previous sibling is empty after deleting for example: <p><b></b>|</p>
						container = selection.getRng().startContainer;
						sibling = container.previousSibling;
						if (sibling && sibling.nodeType == 1 && !dom.isBlock(sibling) && dom.isEmpty(sibling) &&
							!nonEmptyElements[sibling.nodeName.toLowerCase()]) {
							dom.remove(sibling);
						}

						// Remove the temp element we inserted
						dom.remove('__tmp');
					}
				}
			});
		}

		/**
		 * Removes a blockquote when backspace is pressed at the beginning of it.
		 *
		 * For example:
		 * <blockquote><p>|x</p></blockquote>
		 *
		 * Becomes:
		 * <p>|x</p>
		 */
		function removeBlockQuoteOnBackSpace() {
			// Add block quote deletion handler
			editor.on('keydown', function(e) {
				var rng, container, offset, root, parent;

				if (isDefaultPrevented(e) || e.keyCode != VK.BACKSPACE) {
					return;
				}

				rng = selection.getRng();
				container = rng.startContainer;
				offset = rng.startOffset;
				root = dom.getRoot();
				parent = container;

				if (!rng.collapsed || offset !== 0) {
					return;
				}

				while (parent && parent.parentNode && parent.parentNode.firstChild == parent && parent.parentNode != root) {
					parent = parent.parentNode;
				}

				// Is the cursor at the beginning of a blockquote?
				if (parent.tagName === 'BLOCKQUOTE') {
					// Remove the blockquote
					editor.formatter.toggle('blockquote', null, parent);

					// Move the caret to the beginning of container
					rng = dom.createRng();
					rng.setStart(container, 0);
					rng.setEnd(container, 0);
					selection.setRng(rng);
				}
			});
		}

		/**
		 * Sets various Gecko editing options on mouse down and before a execCommand to disable inline table editing that is broken etc.
		 */
		function setGeckoEditingOptions() {
			function setOpts() {
				editor._refreshContentEditable();

				setEditorCommandState("StyleWithCSS", false);
				setEditorCommandState("enableInlineTableEditing", false);

				if (!settings.object_resizing) {
					setEditorCommandState("enableObjectResizing", false);
				}
			}

			if (!settings.readonly) {
				editor.on('BeforeExecCommand MouseDown', setOpts);
			}
		}

		/**
		 * Fixes a gecko link bug, when a link is placed at the end of block elements there is
		 * no way to move the caret behind the link. This fix adds a bogus br element after the link.
		 *
		 * For example this:
		 * <p><b><a href="#">x</a></b></p>
		 *
		 * Becomes this:
		 * <p><b><a href="#">x</a></b><br></p>
		 */
		function addBrAfterLastLinks() {
			function fixLinks() {
				each(dom.select('a'), function(node) {
					var parentNode = node.parentNode, root = dom.getRoot();

					if (parentNode.lastChild === node) {
						while (parentNode && !dom.isBlock(parentNode)) {
							if (parentNode.parentNode.lastChild !== parentNode || parentNode === root) {
								return;
							}

							parentNode = parentNode.parentNode;
						}

						dom.add(parentNode, 'br', {'data-mce-bogus': 1});
					}
				});
			}

			editor.on('SetContent ExecCommand', function(e) {
				if (e.type == "setcontent" || e.command === 'mceInsertLink') {
					fixLinks();
				}
			});
		}

		/**
		 * WebKit will produce DIV elements here and there by default. But since TinyMCE uses paragraphs by
		 * default we want to change that behavior.
		 */
		function setDefaultBlockType() {
			if (settings.forced_root_block) {
				editor.on('init', function() {
					setEditorCommandState('DefaultParagraphSeparator', settings.forced_root_block);
				});
			}
		}

		/**
		 * Removes ghost selections from images/tables on Gecko.
		 */
		function removeGhostSelection() {
			editor.on('Undo Redo SetContent', function(e) {
				if (!e.initial) {
					editor.execCommand('mceRepaint');
				}
			});
		}

		/**
		 * Deletes the selected image on IE instead of navigating to previous page.
		 */
		function deleteControlItemOnBackSpace() {
			editor.on('keydown', function(e) {
				var rng;

				if (!isDefaultPrevented(e) && e.keyCode == BACKSPACE) {
					rng = editor.getDoc().selection.createRange();
					if (rng && rng.item) {
						e.preventDefault();
						editor.undoManager.beforeChange();
						dom.remove(rng.item(0));
						editor.undoManager.add();
					}
				}
			});
		}

		/**
		 * IE10 doesn't properly render block elements with the right height until you add contents to them.
		 * This fixes that by adding a padding-right to all empty text block elements.
		 * See: https://connect.microsoft.com/IE/feedback/details/743881
		 */
		function renderEmptyBlocksFix() {
			var emptyBlocksCSS;

			// IE10+
			if (getDocumentMode() >= 10) {
				emptyBlocksCSS = '';
				each('p div h1 h2 h3 h4 h5 h6'.split(' '), function(name, i) {
					emptyBlocksCSS += (i > 0 ? ',' : '') + name + ':empty';
				});

				editor.contentStyles.push(emptyBlocksCSS + '{padding-right: 1px !important}');
			}
		}

		/**
		 * Old IE versions can't retain contents within noscript elements so this logic will store the contents
		 * as a attribute and the insert that value as it's raw text when the DOM is serialized.
		 */
		function keepNoScriptContents() {
			if (getDocumentMode() < 9) {
				parser.addNodeFilter('noscript', function(nodes) {
					var i = nodes.length, node, textNode;

					while (i--) {
						node = nodes[i];
						textNode = node.firstChild;

						if (textNode) {
							node.attr('data-mce-innertext', textNode.value);
						}
					}
				});

				serializer.addNodeFilter('noscript', function(nodes) {
					var i = nodes.length, node, textNode, value;

					while (i--) {
						node = nodes[i];
						textNode = nodes[i].firstChild;

						if (textNode) {
							textNode.value = Entities.decode(textNode.value);
						} else {
							// Old IE can't retain noscript value so an attribute is used to store it
							value = node.attributes.map['data-mce-innertext'];
							if (value) {
								node.attr('data-mce-innertext', null);
								textNode = new Node('#text', 3);
								textNode.value = value;
								textNode.raw = true;
								node.append(textNode);
							}
						}
					}
				});
			}
		}

		/**
		 * IE has an issue where you can't select/move the caret by clicking outside the body if the document is in standards mode.
		 */
		function fixCaretSelectionOfDocumentElementOnIe() {
			var doc = dom.doc, body = doc.body, started, startRng, htmlElm;

			// Return range from point or null if it failed
			function rngFromPoint(x, y) {
				var rng = body.createTextRange();

				try {
					rng.moveToPoint(x, y);
				} catch (ex) {
					// IE sometimes throws and exception, so lets just ignore it
					rng = null;
				}

				return rng;
			}

			// Fires while the selection is changing
			function selectionChange(e) {
				var pointRng;

				// Check if the button is down or not
				if (e.button) {
					// Create range from mouse position
					pointRng = rngFromPoint(e.x, e.y);

					if (pointRng) {
						// Check if pointRange is before/after selection then change the endPoint
						if (pointRng.compareEndPoints('StartToStart', startRng) > 0) {
							pointRng.setEndPoint('StartToStart', startRng);
						} else {
							pointRng.setEndPoint('EndToEnd', startRng);
						}

						pointRng.select();
					}
				} else {
					endSelection();
				}
			}

			// Removes listeners
			function endSelection() {
				var rng = doc.selection.createRange();

				// If the range is collapsed then use the last start range
				if (startRng && !rng.item && rng.compareEndPoints('StartToEnd', rng) === 0) {
					startRng.select();
				}

				dom.unbind(doc, 'mouseup', endSelection);
				dom.unbind(doc, 'mousemove', selectionChange);
				startRng = started = 0;
			}

			// Make HTML element unselectable since we are going to handle selection by hand
			doc.documentElement.unselectable = true;

			// Detect when user selects outside BODY
			dom.bind(doc, 'mousedown contextmenu', function(e) {
				if (e.target.nodeName === 'HTML') {
					if (started) {
						endSelection();
					}

					// Detect vertical scrollbar, since IE will fire a mousedown on the scrollbar and have target set as HTML
					htmlElm = doc.documentElement;
					if (htmlElm.scrollHeight > htmlElm.clientHeight) {
						return;
					}

					started = 1;
					// Setup start position
					startRng = rngFromPoint(e.x, e.y);
					if (startRng) {
						// Listen for selection change events
						dom.bind(doc, 'mouseup', endSelection);
						dom.bind(doc, 'mousemove', selectionChange);

						dom.win.focus();
						startRng.select();
					}
				}
			});
		}

		/**
		 * Fixes selection issues on Gecko where the caret can be placed between two inline elements like <b>a</b>|<b>b</b>
		 * this fix will lean the caret right into the closest inline element.
		 */
		function normalizeSelection() {
			// Normalize selection for example <b>a</b><i>|a</i> becomes <b>a|</b><i>a</i> except for Ctrl+A since it selects everything
			editor.on('keyup focusin', function(e) {
				if (e.keyCode != 65 || !VK.metaKeyPressed(e)) {
					selection.normalize();
				}
			});
		}

		/**
		 * Forces Gecko to render a broken image icon if it fails to load an image.
		 */
		function showBrokenImageIcon() {
			editor.contentStyles.push(
				'img:-moz-broken {' +
					'-moz-force-broken-image-icon:1;' +
					'min-width:24px;' +
					'min-height:24px' +
				'}'
			);
		}

		// All browsers
		disableBackspaceIntoATable();
		removeBlockQuoteOnBackSpace();
		emptyEditorWhenDeleting();
		normalizeSelection();

		// WebKit
		if (isWebKit) {
			keepInlineElementOnDeleteBackspace();
			cleanupStylesWhenDeleting();
			inputMethodFocus();
			selectControlElements();
			setDefaultBlockType();

			// iOS
			if (Env.iOS) {
				selectionChangeNodeChanged();
			} else {
				selectAll();
			}
		}

		// IE
		if (isIE) {
			removeHrOnBackspace();
			ensureBodyHasRoleApplication();
			addNewLinesBeforeBrInPre();
			removePreSerializedStylesWhenSelectingControls();
			deleteControlItemOnBackSpace();
			renderEmptyBlocksFix();
			keepNoScriptContents();
			fixCaretSelectionOfDocumentElementOnIe();
		}

		// Gecko
		if (isGecko) {
			removeHrOnBackspace();
			focusBody();
			removeStylesWhenDeletingAccrossBlockElements();
			setGeckoEditingOptions();
			addBrAfterLastLinks();
			removeGhostSelection();
			showBrokenImageIcon();
		}
	};
});