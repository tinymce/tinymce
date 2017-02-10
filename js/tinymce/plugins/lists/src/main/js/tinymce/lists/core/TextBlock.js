/**
 * TextBlock.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define("tinymce.lists.core.TextBlock", [
	"global!tinymce.dom.DOMUtils.DOM",
	"global!tinymce.Env"
], function (DOM, Env) {
	var createNewTextBlock = function (editor, contentNode, blockName) {
		var node, textBlock, fragment = DOM.createFragment(), hasContentNode;
		var blockElements = editor.schema.getBlockElements();

		if (editor.settings.forced_root_block) {
			blockName = blockName || editor.settings.forced_root_block;
		}

		if (blockName) {
			textBlock = DOM.create(blockName);

			if (textBlock.tagName === editor.settings.forced_root_block) {
				DOM.setAttribs(textBlock, editor.settings.forced_root_block_attrs);
			}

			fragment.appendChild(textBlock);
		}

		if (contentNode) {
			while ((node = contentNode.firstChild)) {
				var nodeName = node.nodeName;

				if (!hasContentNode && (nodeName !== 'SPAN' || node.getAttribute('data-mce-type') !== 'bookmark')) {
					hasContentNode = true;
				}

				if (blockElements[nodeName]) {
					fragment.appendChild(node);
					textBlock = null;
				} else {
					if (blockName) {
						if (!textBlock) {
							textBlock = DOM.create(blockName);
							fragment.appendChild(textBlock);
						}

						textBlock.appendChild(node);
					} else {
						fragment.appendChild(node);
					}
				}
			}
		}

		if (!editor.settings.forced_root_block) {
			fragment.appendChild(DOM.create('br'));
		} else {
			// BR is needed in empty blocks on non IE browsers
			if (!hasContentNode && (!Env.ie || Env.ie > 10)) {
				textBlock.appendChild(DOM.create('br', {'data-mce-bogus': '1'}));
			}
		}

		return fragment;
	};

	return {
		createNewTextBlock: createNewTextBlock
	};
});
