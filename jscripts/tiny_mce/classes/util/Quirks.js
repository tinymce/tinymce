(function(tinymce) {
	var VK = tinymce.VK, BACKSPACE = VK.BACKSPACE, DELETE = VK.DELETE;

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
	function cleanupStylesWhenDeleting(ed) {
		var dom = ed.dom, selection = ed.selection;

		ed.onKeyDown.add(function(ed, e) {
			var rng, blockElm, node, clonedSpan, isDelete;

			isDelete = e.keyCode == DELETE;
			if ((isDelete || e.keyCode == BACKSPACE) && !VK.modifierPressed(e)) {
				e.preventDefault();
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
					while (node && node.nodeType == 3 && node.nodeValue.length == 0)
						node = node.nextSibling;

					if (node && node.nodeName === 'SPAN') {
						clonedSpan = node.cloneNode(false);
					}
				}

				// Do the backspace/delete actiopn
				ed.getDoc().execCommand(isDelete ? 'ForwardDelete' : 'Delete', false, null);

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
			}
		});
	};

	/**
	 * WebKit and IE doesn't empty the editor if you select all contents and hit backspace or delete. This fix will check if the body is empty
	 * like a <h1></h1> or <p></p> and then forcefully remove all contents.
	 */
	function emptyEditorWhenDeleting(ed) {
		ed.onKeyUp.add(function(ed, e) {
			var keyCode = e.keyCode;

			if (keyCode == DELETE || keyCode == BACKSPACE) {
				if (ed.dom.isEmpty(ed.getBody())) {
					ed.setContent('', {format : 'raw'});
					ed.nodeChanged();
					return;
				}
			}
		});
	};

	/**
	 * WebKit on MacOS X has a weird issue where it some times fails to properly convert keypresses to input method keystrokes.
	 * So a fix where we just get the range and set the range back seems to do the trick.
	 */
	function inputMethodFocus(ed) {
		ed.dom.bind(ed.getDoc(), 'focusin', function() {
			ed.selection.setRng(ed.selection.getRng());
		});
	};

	/**
	 * Backspacing in FireFox/IE from a paragraph into a horizontal rule results in a floating text node because the
	 * browser just deletes the paragraph - the browser fails to merge the text node with a horizontal rule so it is
	 * left there. TinyMCE sees a floating text node and wraps it in a paragraph on the key up event (ForceBlocks.js
	 * addRootBlocks), meaning the action does nothing. With this code, FireFox/IE matche the behaviour of other
     * browsers
	 */
	function removeHrOnBackspace(ed) {
		ed.onKeyDown.add(function(ed, e) {
			if (e.keyCode === BACKSPACE) {
				if (ed.selection.isCollapsed() && ed.selection.getRng(true).startOffset === 0) {
					var node = ed.selection.getNode();
					var previousSibling = node.previousSibling;
					if (previousSibling && previousSibling.nodeName && previousSibling.nodeName.toLowerCase() === "hr") {
						ed.dom.remove(previousSibling);
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
	function focusBody(ed) {
		// Fix for a focus bug in FF 3.x where the body element
		// wouldn't get proper focus if the user clicked on the HTML element
		if (!Range.prototype.getClientRects) { // Detect getClientRects got introduced in FF 4
			ed.onMouseDown.add(function(ed, e) {
				if (e.target.nodeName === "HTML") {
					var body = ed.getBody();

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
	function selectControlElements(ed) {
		ed.onClick.add(function(ed, e) {
			e = e.target;

			// Workaround for bug, http://bugs.webkit.org/show_bug.cgi?id=12250
			// WebKit can't even do simple things like selecting an image
			// Needs tobe the setBaseAndExtend or it will fail to select floated images
			if (/^(IMG|HR)$/.test(e.nodeName))
				ed.selection.getSel().setBaseAndExtent(e, 0, e, 1);

			if (e.nodeName == 'A' && ed.dom.hasClass(e, 'mceItemAnchor'))
				ed.selection.select(e);

			ed.nodeChanged();
		});
	};

	/**
	 * If you hit enter from a heading in IE, the resulting P tag below it shares the style property (bad)
	 * */
	function removeStylesOnPTagsInheritedFromHeadingTag(ed) {
		ed.onKeyDown.add(function(ed, event) {
			function checkInHeadingTag(ed) {
				var currentNode = ed.selection.getNode();
				var headingTags = 'h1,h2,h3,h4,h5,h6';
				return ed.dom.is(currentNode, headingTags) || ed.dom.getParent(currentNode, headingTags) !== null;
			}

			if (event.keyCode === VK.ENTER && !VK.modifierPressed(event) && checkInHeadingTag(ed)) {
				setTimeout(function() {
					var currentNode = ed.selection.getNode();
					if (ed.dom.is(currentNode, 'p')) {
						ed.dom.setAttrib(currentNode, 'style', null);
						// While tiny's content is correct after this method call, the content shown is not representative of it and needs to be 'repainted'
						ed.execCommand('mceCleanup');
					}
				}, 0);
			}
		});
	}
	/**
	 * Fire a nodeChanged when the selection is changed on WebKit this fixes selection issues on iOS5. It only fires the nodeChange
	 * event every 50ms since it would other wise update the UI when you type and it hogs the CPU.
	 */
	function selectionChangeNodeChanged(ed) {
		var lastRng, selectionTimer;

		ed.dom.bind(ed.getDoc(), 'selectionchange', function() {
			if (selectionTimer) {
				clearTimeout(selectionTimer);
				selectionTimer = 0;
			}

			selectionTimer = window.setTimeout(function() {
				var rng = ed.selection.getRng();

				// Compare the ranges to see if it was a real change or not
				if (!lastRng || !tinymce.dom.RangeUtils.compareRanges(rng, lastRng)) {
					ed.nodeChanged();
					lastRng = rng;
				}
			}, 50);
		});
	}

	/**
	 * Screen readers on IE needs to have the role application set on the body.
	 */
	function ensureBodyHasRoleApplication(ed) {
		document.body.setAttribute("role", "application");
	}
	
	tinymce.create('tinymce.util.Quirks', {
		Quirks: function(ed) {
			// WebKit
			if (tinymce.isWebKit) {
				cleanupStylesWhenDeleting(ed);
				emptyEditorWhenDeleting(ed);
				inputMethodFocus(ed);
				selectControlElements(ed);

				// iOS
				if (tinymce.isIDevice) {
					selectionChangeNodeChanged(ed);
				}
			}

			// IE
			if (tinymce.isIE) {
				removeHrOnBackspace(ed);
				emptyEditorWhenDeleting(ed);
				ensureBodyHasRoleApplication(ed);
				removeStylesOnPTagsInheritedFromHeadingTag(ed)
			}

			// Gecko
			if (tinymce.isGecko) {
				removeHrOnBackspace(ed);
				focusBody(ed);
			}
		}
	});
})(tinymce);
