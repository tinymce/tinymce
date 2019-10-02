/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import NodeType from './NodeType';
import { DocumentFragment, Node } from '@ephox/dom-globals';
import Editor from 'tinymce/core/api/Editor';

const createTextBlock = (editor: Editor, contentNode: Node): DocumentFragment => {
  const dom = editor.dom;
  const blockElements = editor.schema.getBlockElements();
  const fragment = dom.createFragment();
  let node, textBlock, blockName, hasContentNode;

  if (editor.settings.forced_root_block) {
    blockName = editor.settings.forced_root_block;
  }

  if (blockName) {
    textBlock = dom.create(blockName);

    if (textBlock.tagName === editor.settings.forced_root_block) {
      dom.setAttribs(textBlock, editor.settings.forced_root_block_attrs);
    }

    if (!NodeType.isBlock(contentNode.firstChild, blockElements)) {
      fragment.appendChild(textBlock);
    }
  }

  if (contentNode) {
    while ((node = contentNode.firstChild)) {
      const nodeName = node.nodeName;

      if (!hasContentNode && (nodeName !== 'SPAN' || node.getAttribute('data-mce-type') !== 'bookmark')) {
        hasContentNode = true;
      }

      if (NodeType.isBlock(node, blockElements)) {
        fragment.appendChild(node);
        textBlock = null;
      } else {
        if (blockName) {
          if (!textBlock) {
            textBlock = dom.create(blockName);
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
    fragment.appendChild(dom.create('br'));
  } else {
    // BR is needed in empty blocks
    if (!hasContentNode) {
      textBlock.appendChild(dom.create('br', { 'data-mce-bogus': '1' }));
    }
  }

  return fragment;
};

export {
  createTextBlock
};
