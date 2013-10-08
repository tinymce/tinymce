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
	var VK = tinymce.VK, BACKSPACE = VK.BACKSPACE, DELETE = VK.DELETE, dom = editor.dom, selection = editor.selection,
		settings = editor.settings, parser = editor.parser, serializer = editor.serializer, each = tinymce.each;

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
	};

	/**
	 * Returns true/false if the event is prevented or not.
	 *
	 * @param {Event} e Event object.
	 * @return {Boolean} true/false if the event is prevented or not.
	 */
	function isDefaultPrevented(e) {
		return e.isDefaultPrevented();
	};

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

					each(tinymce.grep(blockElm.childNodes), function(node) {
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

				while (elm = dom.get('__mceDel')) {
					dom.remove(elm, true);
				}

				selection.moveToBookmark(bookmark);
			}
		}

		editor.onKeyDown.add(function(editor, e) {
			var isDelete;

			isDelete = e.keyCode == DELETE;
			if (!isDefaultPrevented(e) && (isDelete || e.keyCode == BACKSPACE) && !VK.modifierPressed(e)) {
				e.preventDefault();
				removeMergedFormatSpans(isDelete);
			}
		});

		editor.addCommand('Delete', function() {removeMergedFormatSpans();});
	};
	
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

		editor.onKeyDown.add(function(editor, e) {
			var keyCode = e.keyCode, isCollapsed;

			// Empty the editor if it's needed for example backspace at <p><b>|</b></p>
			if (!isDefaultPrevented(e) && (keyCode == DELETE || keyCode == BACKSPACE)) {
				isCollapsed = editor.selection.isCollapsed();

				// Selection is collapsed but the editor isn't empty
				if (isCollapsed && !dom.isEmpty(editor.getBody())) {
					return;
				}

				// IE deletes all contents correctly when everything is selected
				if (tinymce.isIE && !isCollapsed) {
					return;
				}

				// Selection isn't collapsed but not all the contents is selected
				if (!isCollapsed && !allContentsSelected(editor.selection.getRng())) {
					return;
				}

				// Manually empty the editor
				editor.setContent('');
				editor.selection.setCursorLocation(editor.getBody(), 0);
				editor.nodeChanged();
			}
		});
	};

	/**
	 * WebKit doesn't select all the nodes in the body when you press Ctrl+A.
	 * This selects the whole body so that backspace/delete logic will delete everything
	 */
	function selectAll() {
		editor.onKeyDown.add(function(editor, e) {
			if (!isDefaultPrevented(e) && e.keyCode == 65 && VK.metaKeyPressed(e)) {
				e.preventDefault();
				editor.execCommand('SelectAll');
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
			if (!isDefaultPrevented(e) && e.keyCode === BACKSPACE) {
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
			return !selection.isCollapsed() && dom.getParent(selection.getStart(), dom.isBlock) != dom.getParent(selection.getEnd(), dom.isBlock);
		}

		function blockEvent(editor, e) {
			e.preventDefault();
			return false;
		}

		editor.onKeyPress.add(function(editor, e) {
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
			if (!isDefaultPrevented(e) && e.keyCode === BACKSPACE) {
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
		parser.addNodeFilter('pre', function(nodes, name) {
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
		serializer.addNodeFilter('pre', function(nodes, name) {
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
			if (!isDefaultPrevented(e) && (isDelete || e.keyCode == BACKSPACE) && !VK.modifierPressed(e)) {
				rng = selection.getRng();
				container = rng.startContainer;
				offset = rng.startOffset;
				collapsed = rng.collapsed;

				// Override delete if the start container is a text node and is at the beginning of text or
				// just before/after the last character to be deleted in collapsed mode
				if (container.nodeType == 3 && container.nodeValue.length > 0 && ((offset === 0 && !collapsed) || (collapsed && offset === (isDelete ? 0 : 1)))) {
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
			each(dom.select('a'), function(node) {
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
	function deleteControlItemOnBackSpace() {
		editor.onKeyDown.add(function(editor, e) {
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
	};

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
	};

	/**
	 * Fakes image/table resizing on WebKit/Opera.
	 */
	function fakeImageResize() {
		var selectedElmX, selectedElmY, selectedElm, selectedElmGhost, selectedHandle, startX, startY, startW, startH, ratio,
			resizeHandles, width, height, rootDocument = document, editableDoc = editor.getDoc();

		if (!settings.object_resizing || settings.webkit_fake_resize === false) {
			return;
		}

		// Try disabling object resizing if WebKit implements resizing in the future
		setEditorCommandState("enableObjectResizing", false);

		// Details about each resize handle how to scale etc
		resizeHandles = {
			// Name: x multiplier, y multiplier, delta size x, delta size y
			n: [.5, 0, 0, -1],
			e: [1, .5, 1, 0],
			s: [.5, 1, 0, 1],
			w: [0, .5, -1, 0],
			nw: [0, 0, -1, -1],
			ne: [1, 0, 1, -1],
			se: [1, 1, 1, 1],
			sw : [0, 1, -1, 1]
		};

		function resizeElement(e) {
			var deltaX, deltaY;

			// Calc new width/height
			deltaX = e.screenX - startX;
			deltaY = e.screenY - startY;

			// Calc new size
			width = deltaX * selectedHandle[2] + startW;
			height = deltaY * selectedHandle[3] + startH;

			// Never scale down lower than 5 pixels
			width = width < 5 ? 5 : width;
			height = height < 5 ? 5 : height;

			// Constrain proportions when modifier key is pressed or if the nw, ne, sw, se corners are moved on an image
			if (VK.modifierPressed(e) || (selectedElm.nodeName == "IMG" && selectedHandle[2] * selectedHandle[3] !== 0)) {
				width = Math.round(height / ratio);
				height = Math.round(width * ratio);
			}

			// Update ghost size
			dom.setStyles(selectedElmGhost, {
				width: width,
				height: height
			});

			// Update ghost X position if needed
			if (selectedHandle[2] < 0 && selectedElmGhost.clientWidth <= width) {
				dom.setStyle(selectedElmGhost, 'left', selectedElmX + (startW - width));
			}

			// Update ghost Y position if needed
			if (selectedHandle[3] < 0 && selectedElmGhost.clientHeight <= height) {
				dom.setStyle(selectedElmGhost, 'top', selectedElmY + (startH - height));
			}
		}

		function endResize() {
			function setSizeProp(name, value) {
				if (value) {
					// Resize by using style or attribute
					if (selectedElm.style[name] || !editor.schema.isValid(selectedElm.nodeName.toLowerCase(), name)) {
						dom.setStyle(selectedElm, name, value);
					} else {
						dom.setAttrib(selectedElm, name, value);
					}
				}
			}

			// Set width/height properties
			setSizeProp('width', width);
			setSizeProp('height', height);

			dom.unbind(editableDoc, 'mousemove', resizeElement);
			dom.unbind(editableDoc, 'mouseup', endResize);

			if (rootDocument != editableDoc) {
				dom.unbind(rootDocument, 'mousemove', resizeElement);
				dom.unbind(rootDocument, 'mouseup', endResize);
			}

			// Remove ghost and update resize handle positions
			dom.remove(selectedElmGhost);
			showResizeRect(selectedElm);
		}

		function showResizeRect(targetElm) {
			var position, targetWidth, targetHeight;

			hideResizeRect();

			// Get position and size of target
			position = dom.getPos(targetElm);
			selectedElmX = position.x;
			selectedElmY = position.y;
			targetWidth = targetElm.offsetWidth;
			targetHeight = targetElm.offsetHeight;

			// Reset width/height if user selects a new image/table
			if (selectedElm != targetElm) {
				selectedElm = targetElm;
				width = height = 0;
			}

			each(resizeHandles, function(handle, name) {
				var handleElm;

				// Get existing or render resize handle
				handleElm = dom.get('mceResizeHandle' + name);
				if (!handleElm) {
					handleElm = dom.add(editableDoc.documentElement, 'div', {
						id: 'mceResizeHandle' + name,
						'class': 'mceResizeHandle',
						style: 'cursor:' + name + '-resize; margin:0; padding:0'
					});

					dom.bind(handleElm, 'mousedown', function(e) {
						e.preventDefault();

						endResize();

						startX = e.screenX;
						startY = e.screenY;
						startW = selectedElm.clientWidth;
						startH = selectedElm.clientHeight;
						ratio = startH / startW;
						selectedHandle = handle;

						selectedElmGhost = selectedElm.cloneNode(true);
						dom.addClass(selectedElmGhost, 'mceClonedResizable');
						dom.setStyles(selectedElmGhost, {
							left: selectedElmX,
							top: selectedElmY,
							margin: 0
						});

						editableDoc.documentElement.appendChild(selectedElmGhost);

						dom.bind(editableDoc, 'mousemove', resizeElement);
						dom.bind(editableDoc, 'mouseup', endResize);

						if (rootDocument != editableDoc) {
							dom.bind(rootDocument, 'mousemove', resizeElement);
							dom.bind(rootDocument, 'mouseup', endResize);
						}
					});
				} else {
					dom.show(handleElm);
				}

				// Position element
				dom.setStyles(handleElm, {
					left: (targetWidth * handle[0] + selectedElmX) - (handleElm.offsetWidth / 2),
					top: (targetHeight * handle[1] + selectedElmY) - (handleElm.offsetHeight / 2)
				});
			});

			// Only add resize rectangle on WebKit and only on images
			if (!tinymce.isOpera && selectedElm.nodeName == "IMG") {
				selectedElm.setAttribute('data-mce-selected', '1');
			}
		}

		function hideResizeRect() {
			if (selectedElm) {
				selectedElm.removeAttribute('data-mce-selected');
			}

			for (var name in resizeHandles) {
				dom.hide('mceResizeHandle' + name);
			}
		}

		// Add CSS for resize handles, cloned element and selected
		editor.contentStyles.push(
			'.mceResizeHandle {' +
				'position: absolute;' +
				'border: 1px solid black;' +
				'background: #FFF;' +
				'width: 5px;' +
				'height: 5px;' +
				'z-index: 10000' +
			'}' +
			'.mceResizeHandle:hover {' +
				'background: #000' +
			'}' +
			'img[data-mce-selected] {' +
				'outline: 1px solid black' +
			'}' +
			'img.mceClonedResizable, table.mceClonedResizable {' +
				'position: absolute;' +
				'outline: 1px dashed black;' +
				'opacity: .5;' +
				'z-index: 10000' +
			'}'
		);

		function updateResizeRect() {
			var controlElm = dom.getParent(selection.getNode(), 'table,img');

			// Remove data-mce-selected from all elements since they might have been copied using Ctrl+c/v
			each(dom.select('img[data-mce-selected]'), function(img) {
				img.removeAttribute('data-mce-selected');
			});

			if (controlElm) {
				showResizeRect(controlElm);
			} else {
				hideResizeRect();
			}
		}

		// Show/hide resize rect when image is selected
		editor.onNodeChange.add(updateResizeRect);

		// Fixes WebKit quirk where it returns IMG on getNode if caret is after last image in container
		dom.bind(editableDoc, 'selectionchange', updateResizeRect);

		// Remove the internal attribute when serializing the DOM
		editor.serializer.addAttributeFilter('data-mce-selected', function(nodes, name) {
			var i = nodes.length;

			while (i--) {
				nodes[i].attr(name, null);
			}
		});
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
						textNode.value = tinymce.html.Entities.decode(textNode.value);
					} else {
						// Old IE can't retain noscript value so an attribute is used to store it
						value = node.attributes.map['data-mce-innertext'];
						if (value) {
							node.attr('data-mce-innertext', null);
							textNode = new tinymce.html.Node('#text', 3);
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
	 * IE 11 has an annoying issue where you can't move focus into the editor
	 * by clicking on the white area HTML element. We used to be able to to fix this with
	 * the fixCaretSelectionOfDocumentElementOnIe fix. But since M$ removed the selection
	 * object it's not possible anymore. So we need to hack in a ungly CSS to force the
	 * body to be at least 150px. If the user clicks the HTML element out side this 150px region
	 * we simply move the focus into the first paragraph. Not ideal since you loose the
	 * positioning of the caret but goot enough for most cases.
	 */
	function bodyHeight() {
		editor.contentStyles.push('body {min-height: 100px}');
		editor.onClick.add(function(ed, e) {
			if (e.target.nodeName == 'HTML') {
				editor.execCommand('SelectAll');
				editor.selection.collapse(true);
				editor.nodeChanged();
			}
		});
	}

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
		} else {
			fakeImageResize();
			selectAll();
		}
	}

	// IE
	if (tinymce.isIE && !tinymce.isIE11) {
		removeHrOnBackspace();
		ensureBodyHasRoleApplication();
		addNewLinesBeforeBrInPre();
		removePreSerializedStylesWhenSelectingControls();
		deleteControlItemOnBackSpace();
		renderEmptyBlocksFix();
		keepNoScriptContents();
	}

	// IE 11+
	if (tinymce.isIE11) {
		bodyHeight();
	}

	// Gecko
	if (tinymce.isGecko && !tinymce.isIE11) {
		removeHrOnBackspace();
		focusBody();
		removeStylesWhenDeletingAccrossBlockElements();
		setGeckoEditingOptions();
		addBrAfterLastLinks();
		removeGhostSelection();
	}

	// Opera
	if (tinymce.isOpera) {
		fakeImageResize();
	}
};