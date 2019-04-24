/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Node, Text } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';
import TreeWalker from 'tinymce/core/api/dom/TreeWalker';

interface TextWalker {
  next (): Option<Text>;
  prev (): Option<Text>;
  prev2 (): Option<Text>;
}

const TextWalker = (startNode: Node, rootNode: Node): TextWalker => {
  const walker = new TreeWalker(startNode, rootNode);

  const walk = (direction: 'next' | 'prev' | 'prev2'): Option<Text> => {
    let next = walker[direction]();
    while (next && next.nodeType !== Node.TEXT_NODE) {
      next = walker[direction]();
    }
    return next && next.nodeType === Node.TEXT_NODE ? Option.some(next as Text) : Option.none();
  };

  return {
    next: () => walk('next'),
    prev: () => walk('prev'),
    prev2: () => walk('prev2')
  };
};

export {
  TextWalker
};