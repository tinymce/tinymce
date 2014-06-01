/**
 * FocusManager.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class manages the focus/blur state of the editor. This class is needed since some
 * browsers fire false focus/blur states when the selection is moved to a UI dialog or similar.
 *
 * This class will fire two events focus and blur on the editor instances that got affected.
 * It will also handle the restore of selection when the focus is lost and returned.
 *
 * @class tinymce.FocusManager
 */
define("tinymce/FocusManager", [
	"tinymce/dom/DOMUtils",
	"tinymce/Env"
], function(DOMUtils, Env) {
	var selectionChangeHandler, documentFocusInHandler, documentMouseUpHandler, DOM = DOMUtils.DOM;

	/**
	 * Constructs a new focus manager instance.
	 *
	 * @constructor FocusManager
	 * @param {tinymce.EditorManager} editorManager Editor manager instance to handle focus for.
	 */
	function FocusManager(editorManager) {
		function getActiveElement() {
			try {
				return document.activeElement;
			} catch (ex) {
				// IE sometimes fails to get the activeElement when resizing table
				// TODO: Investigate this
				return document.body;
			}
		}

		// We can't store a real range on IE 11 since it gets mutated so we need to use a bookmark object
		// TODO: Move this to a separate range utils class since it's it's logic is present in Selection as well.
		function createBookmark(dom, rng) {
			if (rng && rng.startContainer) {
				// Verify that the range is within the root of the editor
				if (!dom.isChildOf(rng.startContainer, dom.getRoot()) || !dom.isChildOf(rng.endContainer, dom.getRoot())) {
					return;
				}

				return {
					startContainer: rng.startContainer,
					startOffset: rng.startOffset,
					endContainer: rng.endContainer,
					endOffset: rng.endOffset
				};
			}

			return rng;
		}

		function bookmarkToRng(editor, bookmark) {
			var rng;

			if (bookmark.startContainer) {
				rng = editor.getDoc().createRange();
				rng.setStart(bookmark.startContainer, bookmark.startOffset);
				rng.setEnd(bookmark.endContainer, bookmark.endOffset);
			} else {
				rng = bookmark;
			}

			return rng;
		}

		function isUIElement(elm) {
			return !!DOM.getParent(elm, FocusManager.isEditorUIElement);
		}

		function registerEvents(e) {
			var editor = e.editor;

			editor.on('init', function() {
				// Gecko/WebKit has ghost selections in iframes and IE only has one selection per browser tab
				if (editor.inline || Env.ie) {
					// On other browsers take snapshot on nodechange in inline mode since they have Ghost selections for iframes
					editor.on('nodechange keyup', function() {
						var node = document.activeElement;

						// IE 11 reports active element as iframe not body of iframe
						if (node && node.id == editor.id + '_ifr') {
							node = editor.getBody();
						}

						if (editor.dom.isChildOf(node, editor.getBody())) {
							editor.lastRng = editor.selection.getRng();
						}
					});

					// Handles the issue with WebKit not retaining selection within inline document
					// If the user releases the mouse out side the body since a mouse up event wont occur on the body
					if (Env.webkit && !selectionChangeHandler) {
						selectionChangeHandler = function() {
							var activeEditor = editorManager.activeEditor;

							if (activeEditor && activeEditor.selection) {
								var rng = activeEditor.selection.getRng();

								// Store when it's non collapsed
								if (rng && !rng.collapsed) {
									editor.lastRng = rng;
								}
							}
						};

						DOM.bind(document, 'selectionchange', selectionChangeHandler);
					}
				}
			});

			editor.on('setcontent', function() {
				editor.lastRng = null;
			});

			// Remove last selection bookmark on mousedown see #6305
			editor.on('mousedown', function() {
				editor.selection.lastFocusBookmark = null;
			});

			editor.on('focusin', function() {
				var focusedEditor = editorManager.focusedEditor;

				if (editor.selection.lastFocusBookmark) {
					editor.selection.setRng(bookmarkToRng(editor, editor.selection.lastFocusBookmark));
					editor.selection.lastFocusBookmark = null;
				}

				if (focusedEditor != editor) {
					if (focusedEditor) {
						focusedEditor.fire('blur', {focusedEditor: editor});
					}

					editorManager.activeEditor = editor;
					editorManager.focusedEditor = editor;
					editor.fire('focus', {blurredEditor: focusedEditor});
					editor.focus(true);
				}

				editor.lastRng = null;
			});

			editor.on('focusout', function() {
				window.setTimeout(function() {
					var focusedEditor = editorManager.focusedEditor;

					// Still the same editor the the blur was outside any editor UI
					if (!isUIElement(getActiveElement()) && focusedEditor == editor) {
						editor.fire('blur', {focusedEditor: null});
						editorManager.focusedEditor = null;

						// Make sure selection is valid could be invalid if the editor is blured and removed before the timeout occurs
						if (editor.selection) {
							editor.selection.lastFocusBookmark = null;
						}
					}
				}, 0);
			});

			// Check if focus is moved to an element outside the active editor by checking if the target node
			// isn't within the body of the activeEditor nor a UI element such as a dialog child control
			if (!documentFocusInHandler) {
				documentFocusInHandler = function(e) {
					var activeEditor = editorManager.activeEditor;

					if (activeEditor && e.target.ownerDocument == document) {
						// Check to make sure we have a valid selection
						if (activeEditor.selection) {
							activeEditor.selection.lastFocusBookmark = createBookmark(activeEditor.dom, activeEditor.lastRng);
						}

						// Fire a blur event if the element isn't a UI element
						if (!isUIElement(e.target) && editorManager.focusedEditor == activeEditor) {
							activeEditor.fire('blur', {focusedEditor: null});
							editorManager.focusedEditor = null;
						}
					}
				};

				DOM.bind(document, 'focusin', documentFocusInHandler);
			}

			// Handle edge case when user starts the selection inside the editor and releases
			// the mouse outside the editor producing a new selection. This weird workaround is needed since
			// Gecko doesn't have the "selectionchange" event we need to do this. Fixes: #6843
			if (editor.inline && !documentMouseUpHandler) {
				documentMouseUpHandler = function(e) {
					var activeEditor = editorManager.activeEditor;

					if (activeEditor.inline && !activeEditor.dom.isChildOf(e.target, activeEditor.getBody())) {
						var rng = activeEditor.selection.getRng();

						if (!rng.collapsed) {
							activeEditor.lastRng = rng;
						}
					}
				};

				DOM.bind(document, 'mouseup', documentMouseUpHandler);
			}
		}

		function unregisterDocumentEvents(e) {
			if (editorManager.focusedEditor == e.editor) {
				editorManager.focusedEditor = null;
			}

			if (!editorManager.activeEditor) {
				DOM.unbind(document, 'selectionchange', selectionChangeHandler);
				DOM.unbind(document, 'focusin', documentFocusInHandler);
				DOM.unbind(document, 'mouseup', documentMouseUpHandler);
				selectionChangeHandler = documentFocusInHandler = documentMouseUpHandler = null;
			}
		}

		editorManager.on('AddEditor', registerEvents);
		editorManager.on('RemoveEditor', unregisterDocumentEvents);
	}

	/**
	 * Returns true if the specified element is part of the UI for example an button or text input.
	 *
	 * @method isEditorUIElement
	 * @param  {Element} elm Element to check if it's part of the UI or not.
	 * @return {Boolean} True/false state if the element is part of the UI or not.
	 */
	FocusManager.isEditorUIElement = function(elm) {
		// Needs to be converted to string since svg can have focus: #6776
		return elm.className.toString().indexOf('mce-') !== -1;
	};

	return FocusManager;
});
