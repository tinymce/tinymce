/**
 * NodeChange.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class handles the nodechange event dispatching both manual and though selection change events.
 *
 * @class tinymce.NodeChange
 * @private
 */
define("tinymce/NodeChange", [
	"tinymce/dom/RangeUtils"
], function(RangeUtils) {
	return function(editor) {
		var lastRng, lastPath = [];

		/**
		 * Returns true/false if the current element path has been changed or not.
		 *
		 * @private
		 * @return {Boolean} True if the element path is the same false if it's not.
		 */
		function isSameElementPath(startElm) {
			var i, currentPath;

			currentPath = editor.$(startElm).parentsUntil(editor.getBody()).add(startElm);
			if (currentPath.length === lastPath.length) {
				for (i = currentPath.length; i >= 0; i--) {
					if (currentPath[i] !== lastPath[i]) {
						break;
					}
				}

				if (i === -1) {
					lastPath = currentPath;
					return true;
				}
			}

			lastPath = currentPath;

			return false;
		}

		// Gecko doesn't support the "selectionchange" event
		if (!('onselectionchange' in editor.getDoc())) {
			editor.on('NodeChange Click MouseUp KeyUp Focus', function(e) {
				var nativeRng, fakeRng;

				// Since DOM Ranges mutate on modification
				// of the DOM we need to clone it's contents
				nativeRng = editor.selection.getRng();
				fakeRng = {
					startContainer: nativeRng.startContainer,
					startOffset: nativeRng.startOffset,
					endContainer: nativeRng.endContainer,
					endOffset: nativeRng.endOffset
				};

				// Always treat nodechange as a selectionchange since applying
				// formatting to the current range wouldn't update the range but it's parent
				if (e.type == 'nodechange' || !RangeUtils.compareRanges(fakeRng, lastRng)) {
					editor.fire('SelectionChange');
				}

				lastRng = fakeRng;
			});
		}

		// IE has a bug where it fires a selectionchange on right click that has a range at the start of the body
		// When the contextmenu event fires the selection is located at the right location
		editor.on('contextmenu', function() {
			editor.fire('SelectionChange');
		});

		editor.on('SelectionChange', function() {
			var startElm = editor.selection.getStart(true);

			// Fire a nodechange only when the selection isn't collapsed since focusout will collapse and remove the selection
			if (!editor.selection.isCollapsed() && !isSameElementPath(startElm) && editor.dom.isChildOf(startElm, editor.getBody())) {
				editor.nodeChanged({selectionChange: true});
			}
		});

		// Fire an extra nodeChange on mouseup for compatibility reasons
		editor.on('MouseUp', function(e) {
			if (!e.isDefaultPrevented()) {
				// Delay nodeChanged call for WebKit edge case issue where the range
				// isn't updated until after you click outside a selected image
				setTimeout(function() {
					editor.nodeChanged();
				}, 0);
			}
		});

		/**
		 * Distpaches out a onNodeChange event to all observers. This method should be called when you
		 * need to update the UI states or element path etc.
		 *
		 * @method nodeChanged
		 * @param {Object} args Optional args to pass to NodeChange event handlers.
		 */
		this.nodeChanged = function(args) {
			var selection = editor.selection, node, parents, root;

			// Fix for bug #1896577 it seems that this can not be fired while the editor is loading
			if (editor.initialized && selection && !editor.settings.disable_nodechange && !editor.settings.readonly) {
				// Get start node
				root = editor.getBody();
				node = selection.getStart() || root;
				node = node.ownerDocument != editor.getDoc() ? editor.getBody() : node;

				// Edge case for <p>|<img></p>
				if (node.nodeName == 'IMG' && selection.isCollapsed()) {
					node = node.parentNode;
				}

				// Get parents and add them to object
				parents = [];
				editor.dom.getParent(node, function(node) {
					if (node === root) {
						return true;
					}

					parents.push(node);
				});

				args = args || {};
				args.element = node;
				args.parents = parents;

				editor.fire('NodeChange', args);
			}
		};
	};
});
