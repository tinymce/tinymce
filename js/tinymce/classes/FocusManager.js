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
		function createBookmark(rng) {
			if (rng && rng.startContainer) {
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
			return !!DOMUtils.DOM.getParent(elm, FocusManager.isEditorUIElement);
		}

		function isNodeInBodyOfEditor(node, editor) {
			var body = editor.getBody();

			while (node) {
				if (node == body) {
					return true;
				}

				node = node.parentNode;
			}
		}

		function registerEvents(e) {
			var editor = e.editor, selectionChangeHandler;

			editor.on('init', function() {
				// On IE take selection snapshot onbeforedeactivate
				if ("onbeforedeactivate" in document && Env.ie < 11) {
					// Gets fired when the editor is about to be blurred but also when the selection
					// is moved into a table cell so we need to add the range as a pending range then
					// use that pending range on the blur event of the editor body
					editor.dom.bind(editor.getBody(), 'beforedeactivate', function() {
						try {
							editor.pendingRng = editor.selection.getRng();
						} catch (ex) {
							// IE throws "Unexcpected call to method or property access" some times so lets ignore it
						}
					});

					// Set the pending range as the current last range if the blur event occurs
					editor.dom.bind(editor.getBody(), 'blur', function() {
						if (editor.pendingRng) {
							editor.lastRng = editor.pendingRng;
							editor.selection.lastFocusBookmark = createBookmark(editor.lastRng);
							editor.pendingRng = null;
						}
					});
				} else if (editor.inline || Env.ie > 10) {
					// On other browsers take snapshot on nodechange in inline mode since they have Ghost selections for iframes
					editor.on('nodechange keyup', function() {
						var node = document.activeElement;

						// IE 11 reports active element as iframe not body of iframe
						if (node && node.id == editor.id + '_ifr') {
							node = editor.getBody();
						}

						if (isNodeInBodyOfEditor(node, editor)) {
							editor.lastRng = editor.selection.getRng();
						}
					});

					// Handles the issue with WebKit not retaining selection within inline document
					// If the user releases the mouse out side the body while selecting a nodeChange won't
					// fire and there for the selection snapshot won't be stored
					// TODO: Optimize this since we only need to bind these on the active editor
					if (Env.webkit) {
						selectionChangeHandler = function() {
							var rng = editor.selection.getRng();

							// Store when it's non collapsed
							if (!rng.collapsed) {
								editor.lastRng = rng;
							}
						};

						// Bind selection handler
						DOMUtils.DOM.bind(document, 'selectionchange', selectionChangeHandler);

						editor.on('remove', function() {
							DOMUtils.DOM.unbind(document, 'selectionchange', selectionChangeHandler);
						});
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
		}

		// Check if focus is moved to an element outside the active editor by checking if the target node
		// isn't within the body of the activeEditor nor a UI element such as a dialog child control
		DOMUtils.DOM.bind(document, 'focusin', function(e) {
			var activeEditor = editorManager.activeEditor;

			if (activeEditor && e.target.ownerDocument == document) {
				// Check to make sure we have a valid selection
				if (activeEditor.selection) {
					activeEditor.selection.lastFocusBookmark = createBookmark(activeEditor.lastRng);
				}

				// Fire a blur event if the element isn't a UI element
				if (!isUIElement(e.target) && editorManager.focusedEditor == activeEditor) {
					activeEditor.fire('blur', {focusedEditor: null});
					editorManager.focusedEditor = null;
				}
			}
		});

		editorManager.on('AddEditor', registerEvents);
	}

	/**
	 * Returns true if the specified element is part of the UI for example an button or text input.
	 *
	 * @method isEditorUIElement
	 * @param  {Element} elm Element to check if it's part of the UI or not.
	 * @return {Boolean} True/false state if the element is part of the UI or not.
	 */
	FocusManager.isEditorUIElement = function(elm) {
		return elm.className.indexOf('mce-') !== -1;
	};

	return FocusManager;
});
