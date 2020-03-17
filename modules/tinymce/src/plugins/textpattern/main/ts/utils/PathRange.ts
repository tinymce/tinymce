/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { document, Node, Range } from '@ephox/dom-globals';
import { Option, Arr } from '@ephox/katamari';

import * as Utils from './Utils';

export interface PathRange {
  start: number[];
  end: number[];
}

const generatePath = (root: Node, node: Node, offset: number): number[] => {
  if (Utils.isText(node) && (offset < 0 || offset > node.data.length)) {
    return [];
  }
  const p = [ offset ];
  let current: Node = node;
  while (current !== root && current.parentNode) {
    const parent = current.parentNode;
    for (let i = 0; i < parent.childNodes.length; i++) {
      if (parent.childNodes[i] === current) {
        p.push(i);
        break;
      }
    }
    current = parent;
  }
  return current === root ? p.reverse() : [];
};

const generatePathRange = (root: Node, startNode: Node, startOffset: number, endNode: Node, endOffset: number): PathRange => {
  const start = generatePath(root, startNode, startOffset);
  const end = generatePath(root, endNode, endOffset);
  return { start, end };
};

const resolvePath = (root: Node, path: number[]): Option<{node: Node; offset: number}> => {
  const nodePath = path.slice();
  const offset = nodePath.pop();
  return Arr.foldl(nodePath, (optNode: Option<Node>, index: number) => optNode.bind((node) => Option.from(node.childNodes[index])), Option.some(root)).bind((node) => {
    if (Utils.isText(node) && offset >= 0 && offset <= node.data.length) {
      return Option.some({ node, offset });
    } else {
      return Option.some({ node, offset });
    }
  });
};

const resolvePathRange = (root: Node, range: PathRange): Option<Range> => resolvePath(root, range.start).bind(({ node: startNode, offset: startOffset }) => resolvePath(root, range.end).map(({ node: endNode, offset: endOffset }) => {
  const rng = document.createRange();
  rng.setStart(startNode, startOffset);
  rng.setEnd(endNode, endOffset);
  return rng;
}));

const generatePathRangeFromRange = (root: Node, range: Range): PathRange => generatePathRange(root, range.startContainer, range.startOffset, range.endContainer, range.endOffset);

export {
  generatePath,
  generatePathRange,
  generatePathRangeFromRange,
  resolvePath,
  resolvePathRange
};