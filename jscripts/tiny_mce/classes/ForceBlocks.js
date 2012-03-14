/**
 * ForceBlocks.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

tinymce.ForceBlocks = function(editor) {
	var settings = editor.settings, dom = editor.dom, selection = editor.selection, blockElements = editor.schema.getBlockElements();

	// Force root blocks
	if (settings.forced_root_block) {
		function addRootBlocks() {
			var node = selection.getStart(), rootNode = editor.getBody(), rng, startContainer, startOffset, endContainer, endOffset, rootBlockNode, tempNode, offset = -0xFFFFFF;

			if (!node || node.nodeType !== 1 || !settings.forced_root_block)
				return;

			// Check if node is wrapped in block
			while (node != rootNode) {
				if (blockElements[node.nodeName])
					return;

				node = node.parentNode;
			}

			// Get current selection
			rng = selection.getRng();
			if (rng.setStart) {
				startContainer = rng.startContainer;
				startOffset = rng.startOffset;
				endContainer = rng.endContainer;
				endOffset = rng.endOffset;
			} else {
				// Force control range into text range
				if (rng.item) {
					node = rng.item(0);
					rng = editor.getDoc().body.createTextRange();
					rng.moveToElementText(node);
				}

				tmpRng = rng.duplicate();
				tmpRng.collapse(true);
				startOffset = tmpRng.move('character', offset) * -1;

				if (!tmpRng.collapsed) {
					tmpRng = rng.duplicate();
					tmpRng.collapse(false);
					endOffset = (tmpRng.move('character', offset) * -1) - startOffset;
				}
			}

			// Wrap non block elements and text nodes
			for (node = rootNode.firstChild; node; node) {
				if (node.nodeType === 3 || (node.nodeType == 1 && !blockElements[node.nodeName])) {
					if (!rootBlockNode) {
						rootBlockNode = dom.create(settings.forced_root_block);
						node.parentNode.insertBefore(rootBlockNode, node);
					}

					tempNode = node;
					node = node.nextSibling;
					rootBlockNode.appendChild(tempNode);
				} else {
					rootBlockNode = null;
					node = node.nextSibling;
				}
			}

			if (rng.setStart) {
				rng.setStart(startContainer, startOffset);
				rng.setEnd(endContainer, endOffset);
				selection.setRng(rng);
			} else {
				try {
					rng = editor.getDoc().body.createTextRange();
					rng.moveToElementText(rootNode);
					rng.collapse(true);
					rng.moveStart('character', startOffset);

					if (endOffset > 0)
						rng.moveEnd('character', endOffset);

					rng.select();
				} catch (ex) {
					// Ignore
				}
			}

			editor.nodeChanged();
		};

		editor.onKeyUp.add(addRootBlocks);
		editor.onClick.add(addRootBlocks);
	}
};
