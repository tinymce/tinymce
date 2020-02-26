/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Node, Text } from '@ephox/dom-globals';
import { Fun, Option } from '@ephox/katamari';
import * as NodeType from './NodeType';
import TreeWalker from '../api/dom/TreeWalker';

interface TextWalker {
  current (): Option<Text>;
  next (): Option<Text>;
  prev (): Option<Text>;
  prev2 (): Option<Text>;
}

const TextWalker = (startNode: Node, rootNode: Node, isBoundary: (node: Node) => boolean = Fun.never): TextWalker => {
  const walker = new TreeWalker(startNode, rootNode);

  const walk = (direction: 'next' | 'prev' | 'prev2'): Option<Text> => {
    let next: Node;
    do {
      next = walker[direction]();
    } while (next && !NodeType.isText(next) && !isBoundary(next));
    return Option.from(next).filter(NodeType.isText);
  };

  return {
    current: () => Option.from(walker.current()).filter(NodeType.isText),
    next: () => walk('next'),
    prev: () => walk('prev'),
    prev2: () => walk('prev2')
  };
};

export {
  TextWalker
};
