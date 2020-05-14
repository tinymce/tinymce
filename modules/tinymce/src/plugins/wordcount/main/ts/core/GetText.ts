/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Node, Text } from '@ephox/dom-globals';
import { Unicode } from '@ephox/katamari';
import TreeWalker from 'tinymce/core/api/dom/TreeWalker';
import Schema, { SchemaMap } from 'tinymce/core/api/html/Schema';

const getText = (node: Node, schema: Schema): string[] => {
  const blockElements: SchemaMap = schema.getBlockElements();
  const shortEndedElements: SchemaMap = schema.getShortEndedElements();

  const isNewline = (node: Node) => blockElements[node.nodeName] || shortEndedElements[node.nodeName];

  const textBlocks: string[] = [];
  let txt = '';
  const treeWalker = new TreeWalker(node, node);

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
