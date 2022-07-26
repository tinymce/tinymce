import Editor from 'tinymce/core/api/Editor';

import * as Options from '../api/Options';
import * as NodeType from './NodeType';

const createTextBlock = (editor: Editor, contentNode: Node): DocumentFragment => {
  const dom = editor.dom;
  const blockElements = editor.schema.getBlockElements();
  const fragment = dom.createFragment();
  const blockName = Options.getForcedRootBlock(editor);
  const blockAttrs = Options.getForcedRootBlockAttrs(editor);
  let node: Node | null;
  let textBlock: Element | null;
  let hasContentNode = false;

  textBlock = dom.create(blockName, blockAttrs);

  if (!NodeType.isBlock(contentNode.firstChild, blockElements)) {
    fragment.appendChild(textBlock);
  }

  while ((node = contentNode.firstChild)) {
    const nodeName = node.nodeName;

    if (!hasContentNode && (nodeName !== 'SPAN' || (node as Element).getAttribute('data-mce-type') !== 'bookmark')) {
      hasContentNode = true;
    }

    if (NodeType.isBlock(node, blockElements)) {
      fragment.appendChild(node);
      textBlock = null;
    } else {
      if (!textBlock) {
        textBlock = dom.create(blockName, blockAttrs);
        fragment.appendChild(textBlock);
      }

      textBlock.appendChild(node);
    }
  }

  // BR is needed in empty blocks
  if (!hasContentNode && textBlock) {
    textBlock.appendChild(dom.create('br', { 'data-mce-bogus': '1' }));
  }

  return fragment;
};

export {
  createTextBlock
};
