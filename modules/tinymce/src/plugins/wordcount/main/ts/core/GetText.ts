import { Unicode } from '@ephox/katamari';

import DomTreeWalker from 'tinymce/core/api/dom/TreeWalker';
import Schema, { SchemaMap } from 'tinymce/core/api/html/Schema';

const getText = (node: Node, schema: Schema): string[] => {
  const blockElements: SchemaMap = schema.getBlockElements();
  const voidElements: SchemaMap = schema.getVoidElements();

  const isNewline = (node: Node) => blockElements[node.nodeName] || voidElements[node.nodeName];

  const textBlocks: string[] = [];
  let txt = '';
  const treeWalker = new DomTreeWalker(node, node);

  while ((node = treeWalker.next())) {
    if (node.nodeType === 3) {
      txt += Unicode.removeZwsp((node as Text).data);
    } else if (isNewline(node) && txt.length) {
      textBlocks.push(txt);
      txt = '';
    }
  }

  if (txt.length) {
    textBlocks.push(txt);
  }

  return textBlocks;
};

export {
  getText
};
