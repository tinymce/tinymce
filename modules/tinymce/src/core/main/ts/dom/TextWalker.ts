/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun, Optional } from '@ephox/katamari';
import DomTreeWalker from '../api/dom/TreeWalker';
import * as NodeType from './NodeType';

interface TextWalker {
  current (): Optional<Text>;
  next (): Optional<Text>;
  prev (): Optional<Text>;
  prev2 (): Optional<Text>;
}

const TextWalker = (startNode: Node, rootNode: Node, isBoundary: (node: Node) => boolean = Fun.never): TextWalker => {
  const walker = new DomTreeWalker(startNode, rootNode);

  const walk = (direction: 'next' | 'prev' | 'prev2'): Optional<Text> => {
    let next: Node;
    do {
      next = walker[direction]();
    } while (next && !NodeType.isText(next) && !isBoundary(next));
    return Optional.from(next).filter(NodeType.isText);
  };

  return {
    current: () => Optional.from(walker.current()).filter(NodeType.isText),
    next: () => walk('next'),
    prev: () => walk('prev'),
    prev2: () => walk('prev2')
  };
};

export {
  TextWalker
};
