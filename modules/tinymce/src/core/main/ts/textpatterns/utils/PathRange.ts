import { Arr, Optional, Type } from '@ephox/katamari';

import DOMUtils from '../../api/dom/DOMUtils';
import * as NodeType from '../../dom/NodeType';

export interface PathRange {
  readonly start: number[];
  readonly end: number[];
}

const getNormalizedTextOffset = (container: Text, offset: number): number => {
  let normalizedOffset = offset;
  for (let node = container.previousSibling; NodeType.isText(node); node = node.previousSibling) {
    normalizedOffset += node.data.length;
  }
  return normalizedOffset;
};

const generatePath = (dom: DOMUtils, root: Node, node: Node, offset: number, normalized: boolean): number[] => {
  if (NodeType.isText(node) && (offset < 0 || offset > node.data.length)) {
    return [];
  }
  const p = normalized && NodeType.isText(node) ? [ getNormalizedTextOffset(node, offset) ] : [ offset ];
  let current: Node = node;
  while (current !== root && current.parentNode) {
    p.push(dom.nodeIndex(current, normalized));
    current = current.parentNode;
  }
  return current === root ? p.reverse() : [];
};

const generatePathRange = (
  dom: DOMUtils,
  root: Node,
  startNode: Node,
  startOffset: number,
  endNode: Node,
  endOffset: number,
  normalized: boolean = false
): PathRange => {
  const start = generatePath(dom, root, startNode, startOffset, normalized);
  const end = generatePath(dom, root, endNode, endOffset, normalized);
  return { start, end };
};

const resolvePath = (root: Node, path: number[]): Optional<{ node: Node; offset: number }> => {
  const nodePath = path.slice();
  const offset = nodePath.pop();
  if (!Type.isNumber(offset)) {
    return Optional.none();
  } else {
    const resolvedNode = Arr.foldl(nodePath, (optNode: Optional<Node>, index: number) => optNode.bind((node) => Optional.from(node.childNodes[index])), Optional.some(root));
    return resolvedNode.bind((node) => {
      if (NodeType.isText(node) && (offset < 0 || offset > node.data.length)) {
        return Optional.none();
      } else {
        return Optional.some({ node, offset });
      }
    });
  }
};

const resolvePathRange = (root: Node, range: PathRange): Optional<Range> => resolvePath(root, range.start)
  .bind(({ node: startNode, offset: startOffset }) =>
    resolvePath(root, range.end).map(({ node: endNode, offset: endOffset }) => {
      const rng = document.createRange();
      rng.setStart(startNode, startOffset);
      rng.setEnd(endNode, endOffset);
      return rng;
    }));

const generatePathRangeFromRange = (dom: DOMUtils, root: Node, range: Range, normalized: boolean = false): PathRange =>
  generatePathRange(dom, root, range.startContainer, range.startOffset, range.endContainer, range.endOffset, normalized);

export {
  generatePath,
  generatePathRange,
  generatePathRangeFromRange,
  resolvePath,
  resolvePathRange
};
