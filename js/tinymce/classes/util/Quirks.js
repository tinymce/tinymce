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
		 * <h1>a<span style="<all runtime styles>">b</span></p>
		 *
		 * This fixes the backspace to produce:
		 * <h1>a|b</p>
		 *
		 * See bug: https://bugs.webkit.org/show_bug.cgi?id=45784
		 *
		 * This fixes the following delete scenarios:
		 *  1. Delete by pressing backspace key.
		 *  2. Delete by pressing delete key.
		 *  3. Delete by pressing backspace key with ctrl/cmd (Word delete).
		 *  4. Delete by pressing delete key with ctrl/cmd (Word delete).
		 *  5. Delete by drag/dropping contents inside the editor.
		 *  6. Delete by using Cut Ctrl+X/Cmd+X.
		 *  7. Delete by selecting contents and writing a character.'
		 *
		 * This code is a ugly hack since writing full custom delete logic for just this bug
		 * fix seemed like a huge task. I hope we can remove this before the year 2030.
		 */
		function cleanupStylesWhenDeleting() {
			var doc = editor.getDoc(), urlPrefix = 'data:text/mce-internal,';
			var MutationObserver = window.MutationObserver, olderWebKit, dragStartRng;

			// Add mini polyfill for older WebKits
			// TODO: Remove this when old Safari versions gets updated
			if (!MutationObserver) {
				olderWebKit = true;

				MutationObserver = function() {
					var records = [], target;

					function nodeInsert(e) {
						var target = e.relatedNode || e.target;
						records.push({target: target, addedNodes: [target]});
					}

					function attrModified(e) {
						var target = e.relatedNode || e.target;
						records.push({target: target, attributeName: e.attrName});
					}

					this.observe = function(node) {
						target = node;
						target.addEventListener('DOMSubtreeModified', nodeInsert, false);
						target.addEventListener('DOMNodeInsertedIntoDocument', nodeInsert, false);
						target.addEventListener('DOMNodeInserted', nodeInsert, false);
						target.addEventListener('DOMAttrModified', attrModified, false);
					};

					this.disconnect = function() {
						target.removeEventListener('DOMSubtreeModified', nodeInsert, false);
						target.removeEventListener('DOMNodeInsertedIntoDocument', nodeInsert, false);
						target.removeEventListener('DOMNodeInserted', nodeInsert, false);
						target.removeEventListener('DOMAttrModified', attrModified, false);
					};

					this.takeRecords = function() {
						return records;
					};
				};
			}

			function customDelete(isForward) {
				var mutationObserver = new MutationObserver(function() {});

				Tools.each(editor.getBody().getElementsByTagName('*'), function(elm) {
					// Mark existing spans
					if (elm.tagName == 'SPAN') {
						elm.setAttribute('mce-data-marked', 1);
					}

					// Make sure all elements has a data-mce-style attribute
					if (!elm.hasAttribute('data-mce-style') && elm.hasAttribute('style')) {
						editor.dom.setAttrib(elm, 'style', editor.dom.getAttrib(elm, 'style'));
					}
				});

				// Observe added nodes and style attribute changes
				mutationObserver.observe(editor.getDoc(), {
					childList: true,
					attributes: true,
					subtree: true,
					attributeFilter: ['style']
				});

				editor.getDoc().execCommand(isForward ? 'ForwardDelete' : 'Delete', false, null);

				var rng = editor.selection.getRng();
				var caretElement = rng.startContainer.parentNode;

				Tools.each(mutationObserver.takeRecords(), function(record) {
					if (!dom.isChildOf(record.target, editor.getBody())) {
						return;
					}

					// Restore style attribute to previous value
					if (record.attributeName == "style") {
						var oldValue = record.target.getAttribute('data-mce-style');

						if (oldValue) {
							record.target.setAttribute("style", oldValue);
						} else {
							record.target.removeAttribute("style");
						}
					}

					// Remove all spans that isn't maked and retain selection
					Tools.each(record.addedNodes, function(node) {
						if (node.nodeName == "SPAN" && !node.getAttribute('mce-data-marked')) {
							var offset, container;

							if (node == caretElement) {
								offset = rng.startOffset;
								container = node.firstChild;
							}

							dom.remove(node, true);

							if (container) {
								rng.setStart(container, offset);
								rng.setEnd(container, offset);
								editor.selection.setRng(rng);
							}
						}
					});
				});

				mutationObserver.disconnect();

				// Remove any left over marks
				Tools.each(editor.dom.select('span[mce-data-marked]'), function(span) {
					span.removeAttribute('mce-data-marked');
				});
			}

			editor.on('keydown', function(e) {
				var isForward = e.keyCode == DELETE, isMeta = VK.metaKeyPressed(e);

				if (!isDefaultPrevented(e) && (isForward || e.keyCode == BACKSPACE)) {
					var rng = editor.selection.getRng(), container = rng.startContainer, offset = rng.startOffset;

					// Ignore non meta delete in the where there is text before/after the caret
					if (!isMeta && rng.collapsed && container.nodeType == 3) {
						if (isForward ? offset < container.data.length : offset > 0) {
							return;
						}
					}

					e.preventDefault();

					if (isMeta) {
						editor.selection.getSel().modify("extend", isForward ? "forward" : "backward", "word");
					}

					customDelete(isForward);
				}
			});

			editor.on('keypress', function(e) {
				if (!isDefaultPrevented(e) && !selection.isCollapsed() && e.charCode && !VK.metaKeyPressed(e)) {
					e.preventDefault();
					customDelete(true);
					editor.selection.setContent(String.fromCharCode(e.charCode));
				}
			});

			editor.addCommand('Delete', function() {
				customDelete();
			});

			editor.addCommand('ForwardDelete', function() {
				customDelete(true);
			});

			// Older WebKits doesn't properly handle the clipboard so we can't add the rest
			if (olderWebKit) {
				return;
			}

			editor.on('dragstart', function(e) {
				var selectionHtml;

				if (editor.selection.isCollapsed() && e.target.tagName == 'IMG') {
					selection.select(e.target);
				}

				dragStartRng = selection.getRng();
				selectionHtml = editor.selection.getContent();

				// Safari doesn't support custom dataTransfer items so we can only use URL and Text
				if (selectionHtml.length > 0) {
					e.dataTransfer.setData('URL', 'data:text/mce-internal,' + escape(selectionHtml));
				}
			});

			editor.on('drop', function(e) {
				if (!isDefaultPrevented(e)) {
					var internalContent = e.dataTransfer.getData('URL');

					if (!internalContent || internalContent.indexOf(urlPrefix) == -1 || !doc.caretRangeFromPoint) {
						return;
					}

					internalContent = unescape(internalContent.substr(urlPrefix.length));
					if (doc.caretRangeFromPoint) {
						e.preventDefault();

						// Safari has a weird issue where drag/dropping images sometimes
						// produces a green plus icon. When this happens the caretRangeFromPoint
						// will return "null" even though the x, y coordinate is correct.
						// But if we detach the insert from the drop event we will get a proper range
						window.setTimeout(function() {
							var pointRng = doc.caretRangeFromPoint(e.x, e.y);

							if (dragStartRng) {
								selection.setRng(dragStartRng);
								dragStartRng = null;
							}

							customDelete();

							selection.setRng(pointRng);
							editor.insertContent(internalContent);
						}, 0);
					}

				}
			});

			editor.on('cut', function(e) {
				if (!isDefaultPrevented(e) && e.clipboardData) {
					e.preventDefault();
					e.clipboardData.clearData();
					e.clipboardData.setData('text/html', editor.selection.getContent());
					e.clipboardData.setData('text/plain', editor.selection.getContent({format: 'text'}));
					customDelete(true);
				}
			});
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
				if (!rng.setStart) {
					if (rng.item) {
						return false;
					}

					var bodyRng = rng.duplicate();
					bodyRng.moveToElementText(editor.getBody());
					return RangeUtils.compareRanges(rng, bodyRng);
				}

				var selection = serializeRng(rng);

				var allRng = dom.createRng();
				allRng.selectNode(editor.getBody());

				var allSelection = serializeRng(allRng);
				return selection === allSelection;
			}

			editor.on('keydown', function(e) {
				var keyCode = e.keyCode, isCollapsed, body;

				// Empty the editor if it's needed for example backspace at <p><b>|</b></p>
				if (!isDefaultPrevented(e) && (keyCode == DELETE || keyCode == BACKSPACE)) {
					isCollapsed = editor.selection.isCollapsed();
					body = editor.getBody();

					// Selection is collapsed but the editor isn't empty
					if (isCollapsed && !dom.isEmpty(body)) {
						return;
					}

					// Selection isn't collapsed but not all the contents is selected
					if (!isCollapsed && !allContentsSelected(editor.selection.getRng())) {
						return;
					}

					// Manually empty the editor
					e.preventDefault();
					editor.setContent('');

					if (body.firstChild && dom.isBlock(body.firstChild)) {
						editor.selection.setCursorLocation(body.firstChild, 0);
					} else {
						editor.selection.setCursorLocation(body, 0);
					}

					editor.nodeChanged();
				}
			});
		}

		/**
		 * WebKit doesn't select all the nodes in the body when you press Ctrl+A.
		 * IE selects more than the contents <body>[<p>a</p>]</body> instead of <body><p>[a]</p]</body> see bug #6438
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
				// Needs to be both down/up due to weird rendering bug on Chrome Windows
				dom.bind(editor.getDoc(), 'mousedown mouseup', function(e) {
					if (e.target == editor.getDoc().documentElement) {
						editor.getBody().focus();

						if (e.type == 'mousedown') {
							// Edge case for mousedown, drag select and mousedown again within selection on Chrome Windows to render caret
							selection.placeCaretAt(e.clientX, e.clientY);
						} else {
							selection.setRng(selection.getRng());
						}
					}
				});
			}
		}

		/**
		 * Backspacing in FireFox/IE from a paragraph into a horizontal rule results in a floating text node because the
		 * browser just deletes the paragraph - the browser fails to merge the text node with a horizontal rule so it is
		 * left there. TinyMCE sees a floating text node and wraps it in a paragraph on the key up event (ForceBlocks.js
		 * addRootBlocks), meaning the action does nothing. With this code, FireFox/IE matche the behaviour of other
		 * browsers.
		 *
		 * It also fixes a bug on Firefox where it's impossible to delete HR elements.
		 */
		function removeHrOnBackspace() {
			editor.on('keydown', function(e) {
				if (!isDefaultPrevented(e) && e.keyCode === BACKSPACE) {
					// Check if there is any HR elements this is faster since getRng on IE 7 & 8 is slow
					if (!editor.getBody().getElementsByTagName('hr').length) {
						return;
					}

					if (selection.isCollapsed() && selection.getRng(true).startOffset === 0) {
						var node = selection.getNode();
						var previousSibling = node.previousSibling;

						if (node.nodeName == 'HR') {
							dom.remove(node);
							e.preventDefault();
							return;
						}

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
				var target = e.target;

				// Workaround for bug, http://bugs.webkit.org/show_bug.cgi?id=12250
				// WebKit can't even do simple things like selecting an image
				// Needs to be the setBaseAndExtend or it will fail to select floated images
				if (/^(IMG|HR)$/.test(target.nodeName)) {
					e.preventDefault();
					selection.getSel().setBaseAndExtent(target, 0, target, 1);
					editor.nodeChanged();
				}

				if (target.nodeName == 'A' && dom.hasClass(target, 'mce-item-anchor')) {
					e.preventDefault();
					selection.select(target);
				}
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
		function removeStylesWhenDeletingAcrossBlockElements() {
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

						dom.getRoot().focus();
						startRng.select();
					}
				}
			});
		}

		/**
		 * Fixes selection issues where the caret can be placed between two inline elements like <b>a</b>|<b>b</b>
		 * this fix will lean the caret right into the closest inline element.
		 */
		function normalizeSelection() {
			// Normalize selection for example <b>a</b><i>|a</i> becomes <b>a|</b><i>a</i> except for Ctrl+A since it selects everything
			editor.on('keyup focusin mouseup', function(e) {
				if (e.keyCode != 65 || !VK.metaKeyPressed(e)) {
					selection.normalize();
				}
			}, true);
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

		/**
		 * iOS has a bug where it's impossible to type if the document has a touchstart event
		 * bound and the user touches the document while having the on screen keyboard visible.
		 *
		 * The touch event moves the focus to the parent document while having the caret inside the iframe
		 * this fix moves the focus back into the iframe document.
		 */
		function restoreFocusOnKeyDown() {
			if (!editor.inline) {
				editor.on('keydown', function() {
					if (document.activeElement == document.body) {
						editor.getWin().focus();
					}
				});
			}
		}

		/**
		 * IE 11 has an annoying issue where you can't move focus into the editor
		 * by clicking on the white area HTML element. We used to be able to to fix this with
		 * the fixCaretSelectionOfDocumentElementOnIe fix. But since M$ removed the selection
		 * object it's not possible anymore. So we need to hack in a ungly CSS to force the
		 * body to be at least 150px. If the user clicks the HTML element out side this 150px region
		 * we simply move the focus into the first paragraph. Not ideal since you loose the
		 * positioning of the caret but goot enough for most cases.
		 */
		function bodyHeight() {
			if (!editor.inline) {
				editor.contentStyles.push('body {min-height: 150px}');
				editor.on('click', function(e) {
					if (e.target.nodeName == 'HTML') {
						editor.getBody().focus();
						editor.selection.normalize();
						editor.nodeChanged();
					}
				});
			}
		}

		/**
		 * Firefox on Mac OS will move the browser back to the previous page if you press CMD+Left arrow.
		 * You might then loose all your work so we need to block that behavior and replace it with our own.
		 */
		function blockCmdArrowNavigation() {
			if (Env.mac) {
				editor.on('keydown', function(e) {
					if (VK.metaKeyPressed(e) && (e.keyCode == 37 || e.keyCode == 39)) {
						e.preventDefault();
						editor.selection.getSel().modify('move', e.keyCode == 37 ? 'backward' : 'forward', 'word');
					}
				});
			}
		}

		/**
		 * Disables the autolinking in IE 9+ this is then re-enabled by the autolink plugin.
		 */
		function disableAutoUrlDetect() {
			setEditorCommandState("AutoUrlDetect", false);
		}

		/**
		 * IE 11 has a fantastic bug where it will produce two trailing BR elements to iframe bodies when
		 * the iframe is hidden by display: none on a parent container. The DOM is actually out of sync
		 * with innerHTML in this case. It's like IE adds shadow DOM BR elements that appears on innerHTML
		 * but not as the lastChild of the body. However is we add a BR element to the body then remove it
		 * it doesn't seem to add these BR elements makes sence right?!
		 *
		 * Example of what happens: <body>text</body> becomes <body>text<br><br></body>
		 */
		function doubleTrailingBrElements() {
			if (!editor.inline) {
				editor.on('focus blur beforegetcontent', function() {
					var br = editor.dom.create('br');
					editor.getBody().appendChild(br);
					br.parentNode.removeChild(br);
				}, true);
			}
		}

		/**
		 * iOS 7.1 introduced two new bugs:
		 * 1) It's possible to open links within a contentEditable area by clicking on them.
		 * 2) If you hold down the finger it will display the link/image touch callout menu.
		 */
		function tapLinksAndImages() {
			editor.on('click', function(e) {
				var elm = e.target;

				do {
					if (elm.tagName === 'A') {
						e.preventDefault();
						return;
					}
				} while ((elm = elm.parentNode));
			});

			editor.contentStyles.push('.mce-content-body {-webkit-touch-callout: none}');
		}

		/**
		 * iOS Safari and possible other browsers have a bug where it won't fire
		 * a click event when a contentEditable is focused. This function fakes click events
		 * by using touchstart/touchend and measuring the time and distance travelled.
		 */
		function touchClickEvent() {
			editor.on('touchstart', function(e) {
				var elm, time, startTouch, changedTouches;

				elm = e.target;
				time = new Date().getTime();
				changedTouches = e.changedTouches;

				if (!changedTouches || changedTouches.length > 1) {
					return;
				}

				startTouch = changedTouches[0];

				editor.once('touchend', function(e) {
					var endTouch = e.changedTouches[0], args;

					if (new Date().getTime() - time > 500) {
						return;
					}

					if (Math.abs(startTouch.clientX - endTouch.clientX) > 5) {
						return;
					}

					if (Math.abs(startTouch.clientY - endTouch.clientY) > 5) {
						return;
					}

					args = {
						target: elm
					};

					each('pageX pageY clientX clientY screenX screenY'.split(' '), function(key) {
						args[key] = endTouch[key];
					});

					args = editor.fire('click', args);

					if (!args.isDefaultPrevented()) {
						// iOS WebKit can't place the caret properly once
						// you bind touch events so we need to do this manually
						// TODO: Expand to the closest word? Touble tap still works.
						editor.selection.placeCaretAt(endTouch.clientX, endTouch.clientY);
						editor.nodeChanged();
					}
				});
			});
		}

		/**
		 * WebKit has a bug where it will allow forms to be submitted if they are inside a contentEditable element.
		 * For example this: <form><button></form>
		 */
		function blockFormSubmitInsideEditor() {
			editor.on('init', function() {
				editor.dom.bind(editor.getBody(), 'submit', function(e) {
					e.preventDefault();
				});
			});
		}

		/**
		 * Sometimes WebKit/Blink generates BR elements with the Apple-interchange-newline class.
		 *
		 * Scenario:
		 *  1) Create a table 2x2.
		 *  2) Select and copy cells A2-B2.
		 *  3) Paste and it will add BR element to table cell.
		 */
		function removeAppleInterchangeBrs() {
			parser.addNodeFilter('br', function(nodes) {
				var i = nodes.length;

				while (i--) {
					if (nodes[i].attr('class') == 'Apple-interchange-newline') {
						nodes[i].remove();
					}
				}
			});
		}

		// All browsers
		removeBlockQuoteOnBackSpace();
		emptyEditorWhenDeleting();
		normalizeSelection();

		// WebKit
		if (isWebKit) {
			cleanupStylesWhenDeleting();
			inputMethodFocus();
			selectControlElements();
			setDefaultBlockType();
			blockFormSubmitInsideEditor();
			disableBackspaceIntoATable();
			removeAppleInterchangeBrs();
			touchClickEvent();

			// iOS
			if (Env.iOS) {
				restoreFocusOnKeyDown();
				bodyHeight();
				tapLinksAndImages();
			} else {
				selectAll();
			}
		}

		// IE
		if (isIE && Env.ie < 11) {
			removeHrOnBackspace();
			ensureBodyHasRoleApplication();
			addNewLinesBeforeBrInPre();
			removePreSerializedStylesWhenSelectingControls();
			deleteControlItemOnBackSpace();
			renderEmptyBlocksFix();
			keepNoScriptContents();
			fixCaretSelectionOfDocumentElementOnIe();
		}

		if (Env.ie >= 11) {
			bodyHeight();
			doubleTrailingBrElements();
			disableBackspaceIntoATable();
		}

		if (Env.ie) {
			selectAll();
			disableAutoUrlDetect();
		}

		// Gecko
		if (isGecko) {
			removeHrOnBackspace();
			focusBody();
			removeStylesWhenDeletingAcrossBlockElements();
			setGeckoEditingOptions();
			addBrAfterLastLinks();
			removeGhostSelection();
			showBrokenImageIcon();
			blockCmdArrowNavigation();
			disableBackspaceIntoATable();
		}
	};
});