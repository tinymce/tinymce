/**
 * Quirks.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This file includes fixes for various browser quirks it's made to make it easy to add/remove browser specific fixes.
 */
tinymce.util.Quirks = function(editor) {
	var VK = tinymce.VK, BACKSPACE = VK.BACKSPACE, DELETE = VK.DELETE, dom = editor.dom, selection = editor.selection, settings = editor.settings;

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
			var rng, blockElm, node, clonedSpan;

			rng = selection.getRng();

			// Find root block
			blockElm = dom.getParent(rng.startContainer, dom.isBlock);

			// On delete clone the root span of the next block element
			if (isDelete)
				blockElm = dom.getNext(blockElm, dom.isBlock);

			// Locate root span element and clone it since it would otherwise get merged by the "apple-style-span" on delete/backspace
			if (blockElm) {
				node = blockElm.firstChild;

				// Ignore empty text nodes
				while (node && node.nodeType == 3 && node.nodeValue.length === 0)
					node = node.nextSibling;

				if (node && node.nodeName === 'SPAN') {
					clonedSpan = node.cloneNode(false);
				}
			}

			// Do the backspace/delete action
			editor.getDoc().execCommand(isDelete ? 'ForwardDelete' : 'Delete', false, null);

			// Find all odd apple-style-spans
			blockElm = dom.getParent(rng.startContainer, dom.isBlock);
			tinymce.each(dom.select('span.Apple-style-span,font.Apple-style-span', blockElm), function(span) {
				var bm = selection.getBookmark();

				if (clonedSpan) {
					dom.replace(clonedSpan.cloneNode(false), span, true);
				} else {
					dom.remove(span, true);
				}

				// Restore the selection
				selection.moveToBookmark(bm);
			});
		};

		editor.onKeyDown.add(function(editor, e) {
			var isDelete;

			isDelete = e.keyCode == DELETE;
			if (!e.isDefaultPrevented() && (isDelete || e.keyCode == BACKSPACE) && !VK.modifierPressed(e)) {
				e.preventDefault();
				removeMergedFormatSpans(isDelete);
			}
		});

		editor.addCommand('Delete', function() {removeMergedFormatSpans();});
	};
	
	/**
	 * Makes sure that the editor body becomes empty if the selection is the whole body contents.
	 *
	 * Example a selection like this would empty the editor:
	 * <p><b>[text</b></p><p><i>text]</i></p>
	 *
	 * But not a selection like this:
	 * <p><b>[text]</b></p>
	 *
	 * Since it should produce:
	 * <p><b>|</b></p>
	 */
	function emptyEditorWhenDeleting() {
		function getEndPointNode(rng, start) {
			var container, offset, prefix = start ? 'start' : 'end';

			container = rng[prefix + 'Container'];
			offset = rng[prefix + 'Offset'];

			// Resolve indexed container
			if (container.nodeType == 1 && container.hasChildNodes()) {
				container = container.childNodes[Math.min(start ? offset : (offset > 0 ? offset - 1 : 0), container.childNodes.length - 1)]
			}

			return container;
		};

		function isAtStartEndOfBody(rng, start) {
			var container, offset, root, childNode, prefix = start ? 'start' : 'end', isAfter;

			container = rng[prefix + 'Container'];
			offset = rng[prefix + 'Offset'];
			root = dom.getRoot();

			// Resolve indexed container
			if (container.nodeType == 1) {
				isAfter = offset >= container.childNodes.length;
				container = getEndPointNode(rng, start);

				if (container.nodeType == 3) {
					offset = start && !isAfter ? 0 : container.nodeValue.length;
				}
			}

			// Check if start/end is in the middle of text
			if (container.nodeType == 3 && ((start && offset > 0) || (!start && offset < container.nodeValue.length))) {
				return false;
			}

			// Walk up the DOM tree to see if the endpoint is at the beginning/end of body
			while (container !== root) {
				childNode = container.parentNode[start ? 'firstChild' : 'lastChild'];

				// If first/last element is a BR then jump to it's sibling in case: <p>x<br></p>
				if (childNode.nodeName == "BR") {
					childNode = childNode[start ? 'nextSibling' : 'previousSibling'] || childNode;
				}

				// If the childNode isn't the container node then break in case <p><span>A</span>[X]</p>
				if (childNode !== container) {
					return false;
				}

				container = container.parentNode;
			}

			return true;
		};

		editor.onKeyDown.addToTop(function(editor, e) {
			var rng, keyCode = e.keyCode;

			if (!e.isDefaultPrevented() && (keyCode == DELETE || keyCode == BACKSPACE)) {
				rng = selection.getRng(true);

				if (isAtStartEndOfBody(rng, true) && isAtStartEndOfBody(rng, false) &&
					(rng.collapsed || dom.findCommonAncestor(getEndPointNode(rng, true), getEndPointNode(rng)) === dom.getRoot())) {
					editor.setContent('');
					editor.nodeChanged();
					e.preventDefault();
				}
			}
		});
	};

	/**
	 * WebKit has a weird issue where it some times fails to properly convert keypresses to input method keystrokes. The IME on Mac doesn't
	 * initialize when it doesn't fire a proper focus event.
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
			dom.bind(editor.getDoc(), 'focusin', function(e) {
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
	};

	/**
	 * Backspacing in FireFox/IE from a paragraph into a horizontal rule results in a floating text node because the
	 * browser just deletes the paragraph - the browser fails to merge the text node with a horizontal rule so it is
	 * left there. TinyMCE sees a floating text node and wraps it in a paragraph on the key up event (ForceBlocks.js
	 * addRootBlocks), meaning the action does nothing. With this code, FireFox/IE matche the behaviour of other
	 * browsers
	 */
	function removeHrOnBackspace() {
		editor.onKeyDown.add(function(editor, e) {
			if (!e.isDefaultPrevented() && e.keyCode === BACKSPACE) {
				if (selection.isCollapsed() && selection.getRng(true).startOffset === 0) {
					var node = selection.getNode();
					var previousSibling = node.previousSibling;

					if (previousSibling && previousSibling.nodeName && previousSibling.nodeName.toLowerCase() === "hr") {
						dom.remove(previousSibling);
						tinymce.dom.Event.cancel(e);
					}
				}
			}
		})
	}

	/**
	 * Firefox 3.x has an issue where the body element won't get proper focus if you click out
	 * side it's rectangle.
	 */
	function focusBody() {
		// Fix for a focus bug in FF 3.x where the body element
		// wouldn't get proper focus if the user clicked on the HTML element
		if (!Range.prototype.getClientRects) { // Detect getClientRects got introduced in FF 4
			editor.onMouseDown.add(function(editor, e) {
				if (e.target.nodeName === "HTML") {
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
	};

	/**
	 * WebKit has a bug where it isn't possible to select image, hr or anchor elements
	 * by clicking on them so we need to fake that.
	 */
	function selectControlElements() {
		editor.onClick.add(function(editor, e) {
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
	};

	/**
	 * Fixes a Gecko bug where the style attribute gets added to the wrong element when deleting between two block elements.
	 */
	function removeStylesWhenDeletingAccrossBlockElements() {
		function getAttributeApplyFunction() {
			var template = dom.getAttribs(selection.getStart().cloneNode(false));

			return function() {
				var target = selection.getStart();

				if (target !== editor.getBody()) {
					dom.setAttrib(target, "style", null);

					tinymce.each(template, function(attr) {
						target.setAttributeNode(attr.cloneNode(true));
					});
				}
			};
		}

		function isSelectionAcrossElements() {
			return !selection.isCollapsed() && selection.getStart() != selection.getEnd();
		}

		function blockEvent(editor, e) {
			e.preventDefault();
			return false;
		}

		editor.onKeyPress.add(function(editor, e) {
			var applyAttributes;

			if ((e.keyCode == 8 || e.keyCode == 46) && isSelectionAcrossElements()) {
				applyAttributes = getAttributeApplyFunction();
				editor.getDoc().execCommand('delete', false, null);
				applyAttributes();
				e.preventDefault();
				return false;
			}
		});

		dom.bind(editor.getDoc(), 'cut', function(e) {
			var applyAttributes;

			if (isSelectionAcrossElements()) {
				applyAttributes = getAttributeApplyFunction();
				editor.onKeyUp.addToTop(blockEvent);

				setTimeout(function() {
					applyAttributes();
					editor.onKeyUp.remove(blockEvent);
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

		dom.bind(editor.getDoc(), 'selectionchange', function() {
			if (selectionTimer) {
				clearTimeout(selectionTimer);
				selectionTimer = 0;
			}

			selectionTimer = window.setTimeout(function() {
				var rng = selection.getRng();

				// Compare the ranges to see if it was a real change or not
				if (!lastRng || !tinymce.dom.RangeUtils.compareRanges(rng, lastRng)) {
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
		editor.onKeyDown.add(function(editor, e) {
			if (!e.isDefaultPrevented() && e.keyCode === BACKSPACE) {
				if (selection.isCollapsed() && selection.getRng(true).startOffset === 0) {
					var previousSibling = selection.getNode().previousSibling;
					if (previousSibling && previousSibling.nodeName && previousSibling.nodeName.toLowerCase() === "table") {
						return tinymce.dom.Event.cancel(e);
					}
				}
			}
		})
	}

	/**
	 * Old IE versions can't properly render BR elements in PRE tags white in contentEditable mode. So this logic adds a \n before the BR so that it will get rendered.
	 */
	function addNewLinesBeforeBrInPre() {
		var documentMode = editor.getDoc().documentMode;

		// IE8+ rendering mode does the right thing with BR in PRE
		if (documentMode && documentMode > 7) {
			return;
		}

		 // Enable display: none in area and add a specific class that hides all BR elements in PRE to
		 // avoid the caret from getting stuck at the BR elements while pressing the right arrow key
		setEditorCommandState('RespectVisibilityInDesign', true);
		dom.addClass(editor.getBody(), 'mceHideBrInPre');

		// Adds a \n before all BR elements in PRE to get them visual
		editor.parser.addNodeFilter('pre', function(nodes, name) {
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
						brElm.parent.insert(new tinymce.html.Node('#text', 3), brElm, true).value = '\n';
					}
				}
			}
		});

		// Removes any \n before BR elements in PRE since other browsers and in contentEditable=false mode they will be visible
		editor.serializer.addNodeFilter('pre', function(nodes, name) {
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
		dom.bind(editor.getBody(), 'mouseup', function(e) {
			var value, node = selection.getNode();

			// Moved styles to attributes on IMG eements
			if (node.nodeName == 'IMG') {
				// Convert style width to width attribute
				if (value = dom.getStyle(node, 'width')) {
					dom.setAttrib(node, 'width', value.replace(/[^0-9%]+/g, ''));
					dom.setStyle(node, 'width', '');
				}

				// Convert style height to height attribute
				if (value = dom.getStyle(node, 'height')) {
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
		editor.onKeyDown.add(function(editor, e) {
			var isDelete, rng, container, offset, brElm, sibling, collapsed;

			isDelete = e.keyCode == DELETE;
			if (!e.isDefaultPrevented() && (isDelete || e.keyCode == BACKSPACE) && !VK.modifierPressed(e)) {
				rng = selection.getRng();
				container = rng.startContainer;
				offset = rng.startOffset;
				collapsed = rng.collapsed;

				// Override delete if the start container is a text node and is at the beginning of text or
				// just before/after the last character to be deleted in collapsed mode
				if (container.nodeType == 3 && container.nodeValue.length > 0 && ((offset === 0 && !collapsed) || (collapsed && offset === (isDelete ? 0 : 1)))) {
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
					if (sibling && sibling.nodeType == 1 && !dom.isBlock(sibling) && dom.isEmpty(sibling) && !nonEmptyElements[sibling.nodeName.toLowerCase()]) {
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
		editor.onKeyDown.add(function(editor, e) {
			var rng, container, offset, root, parent;

			if (e.isDefaultPrevented() || e.keyCode != VK.BACKSPACE) {
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
				rng.setStart(container, 0);
				rng.setEnd(container, 0);
				selection.setRng(rng);
				selection.collapse(false);
			}
		});
	};

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
		};

		if (!settings.readonly) {
			editor.onBeforeExecCommand.add(setOpts);
			editor.onMouseDown.add(setOpts);
		}
	};

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
		function fixLinks(editor, o) {
			tinymce.each(dom.select('a'), function(node) {
				var parentNode = node.parentNode, root = dom.getRoot();

				if (parentNode.lastChild === node) {
					while (parentNode && !dom.isBlock(parentNode)) {
						if (parentNode.parentNode.lastChild !== parentNode || parentNode === root) {
							return;
						}

						parentNode = parentNode.parentNode;
					}

					dom.add(parentNode, 'br', {'data-mce-bogus' : 1});
				}
			});
		};

		editor.onExecCommand.add(function(editor, cmd) {
			if (cmd === 'CreateLink') {
				fixLinks(editor);
			}
		});

		editor.onSetContent.add(selection.onSetContent.add(fixLinks));
	};

	/**
	 * WebKit will produce DIV elements here and there by default. But since TinyMCE uses paragraphs by
	 * default we want to change that behavior.
	 */
	function setDefaultBlockType() {
		if (settings.forced_root_block) {
			editor.onInit.add(function() {
				setEditorCommandState('DefaultParagraphSeparator', settings.forced_root_block);
			});
		}
	}

	/**
	 * Removes ghost selections from images/tables on Gecko.
	 */
	function removeGhostSelection() {
		function repaint(sender, args) {
			if (!sender || !args.initial) {
				editor.execCommand('mceRepaint');
			}
		};

		editor.onUndo.add(repaint);
		editor.onRedo.add(repaint);
		editor.onSetContent.add(repaint);
	};

	/**
	 * Deletes the selected image on IE instead of navigating to previous page.
	 */
	function deleteImageOnBackSpace() {
		editor.onKeyDown.add(function(editor, e) {
			if (!e.isDefaultPrevented() && e.keyCode == 8 && selection.getNode().nodeName == 'IMG') {
				e.preventDefault();
				editor.undoManager.beforeChange();
				dom.remove(selection.getNode());
				editor.undoManager.add();
			}
		});
	};

	// All browsers
	disableBackspaceIntoATable();
	removeBlockQuoteOnBackSpace();
	emptyEditorWhenDeleting();

	// WebKit
	if (tinymce.isWebKit) {
		keepInlineElementOnDeleteBackspace();
		cleanupStylesWhenDeleting();
		inputMethodFocus();
		selectControlElements();
		setDefaultBlockType();

		// iOS
		if (tinymce.isIDevice) {
			selectionChangeNodeChanged();
		}
	}

	// IE
	if (tinymce.isIE) {
		removeHrOnBackspace();
		ensureBodyHasRoleApplication();
		addNewLinesBeforeBrInPre();
		removePreSerializedStylesWhenSelectingControls();
		deleteImageOnBackSpace();
	}

	// Gecko
	if (tinymce.isGecko) {
		removeHrOnBackspace();
		focusBody();
		removeStylesWhenDeletingAccrossBlockElements();
		setGeckoEditingOptions();
		addBrAfterLastLinks();
		removeGhostSelection();
	}
};