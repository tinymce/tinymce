import { Arr, Optional } from '@ephox/katamari';

import * as NodeType from '../../dom/NodeType';

export interface PathRange {
  readonly start: number[];
  readonly end: number[];
}

const generatePath = (root: Node, node: Node, offset: number): number[] => {
  if (NodeType.isText(node) && (offset < 0 || offset > node.data.length)) {
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

const resolvePath = (root: Node, path: number[]): Optional<{ node: Node; offset: number }> => {
  const nodePath = path.slice();
  const offset = nodePath.pop();
  const resolvedNode = Arr.foldl(nodePath, (optNode: Optional<Node>, index: number) => optNode.bind((node) => Optional.from(node.childNodes[index])), Optional.some(root));
  return resolvedNode.bind((node) => {
    if (NodeType.isText(node) && (offset < 0 || offset > node.data.length)) {
      return Optional.none();
    } else {
      return Optional.some({ node, offset });
    }
  });
};

const resolvePathRange = (root: Node, range: PathRange): Optional<Range> => resolvePath(root, range.start)
  .bind(({ node: startNode, offset: startOffset }) =>
    resolvePath(root, range.end).map(({ node: endNode, offset: endOffset }) => {
      const rng = document.createRange();
      rng.setStart(startNode, startOffset);
      rng.setEnd(endNode, endOffset);
      return rng;
    }));

const generatePathRangeFromRange = (root: Node, range: Range): PathRange =>
  generatePathRange(root, range.startContainer, range.startOffset, range.endContainer, range.endOffset);

export {
  generatePath,
  generatePathRange,
  generatePathRangeFromRange,
  resolvePath,
  resolvePathRange
};
