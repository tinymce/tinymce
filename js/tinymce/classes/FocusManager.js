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

		function registerEvents(e) {
			var editor = e.editor, lastRng, selectionChangeHandler;

			function isUIElement(elm) {
				return !!DOMUtils.DOM.getParent(elm, FocusManager.isEditorUIElement);
			}

			editor.on('init', function() {
				// On IE take selection snapshot onbeforedeactivate
				if ("onbeforedeactivate" in document && Env.ie < 11) {
					editor.dom.bind(editor.getBody(), 'beforedeactivate', function() {
						var ieSelection = editor.getDoc().selection;

						try {
							lastRng = ieSelection && ieSelection.createRange ? ieSelection.createRange() : editor.selection.getRng();
						} catch (ex) {
							// IE throws "Unexcpected call to method or property access" some times so lets ignore it
						}
					});
				} else if (editor.inline || Env.ie > 10) {
					// On other browsers take snapshot on nodechange in inline mode since they have Ghost selections for iframes
					editor.on('nodechange keyup', function() {
						var isInBody, node = document.activeElement;

						// IE 11 reports active element as iframe not body of iframe
						if (node && node.id == editor.id + '_ifr') {
							node = editor.getBody();
						}

						// Check if selection is within editor body
						while (node) {
							if (node == editor.getBody()) {
								isInBody = true;
								break;
							}

							node = node.parentNode;
						}

						if (isInBody) {
							lastRng = editor.selection.getRng();
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
								lastRng = rng;
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
					editor.fire('focus', {blurredEditor: focusedEditor});
					editor.focus(false);
					editorManager.focusedEditor = editor;
				}
			});

			editor.on('focusout', function() {
				editor.selection.lastFocusBookmark = createBookmark(lastRng);

				window.setTimeout(function() {
					var focusedEditor = editorManager.focusedEditor;

					// Focus from editorA into editorB then don't restore selection
					if (focusedEditor != editor) {
						editor.selection.lastFocusBookmark = null;
					}

					// Still the same editor the the blur was outside any editor UI
					if (!isUIElement(getActiveElement()) && focusedEditor == editor) {
						editor.fire('blur', {focusedEditor: null});
						editorManager.focusedEditor = null;
						editor.selection.lastFocusBookmark = null;
					}
				}, 0);
			});
		}

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