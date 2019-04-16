import { Node, Text, HTMLElement, Range, document } from '@ephox/dom-globals';
import { Option, Arr } from '@ephox/katamari';
import { NodeTypes } from '@ephox/sugar';

export interface PathRange {
  startPath: number[];
  endPath: number[];
}

const isElement = (node: Node): node is HTMLElement => node.nodeType === NodeTypes.ELEMENT;
const isText = (node: Node): node is Text => node.nodeType === NodeTypes.TEXT;

const generatePath = (root: Node, node: Text, offset: number): Option<number[]> => {
  if (offset < 0 || offset > node.data.length) {
    return Option.none();
  }
  const p = [offset];
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
  return current === root ? Option.some(p.reverse()) : Option.none();
};

const generatePathRange = (root: Node, startNode: Text, startOffset: number, endNode: Text, endOffset: number): Option<PathRange> => {
  return generatePath(root, startNode, startOffset).bind((start) => {
    return generatePath(root, endNode, endOffset).map((end) => {
      return { startPath: start, endPath: end };
    });
  });
};

const convertRangeToPathRange = (root: Node, rng: Range): Option<PathRange> => {
  return generatePath(root, rng.startContainer as Text, rng.startOffset).bind((start) => {
    return generatePath(root, rng.endContainer as Text, rng.endOffset).map((end) => {
      return { startPath: start, endPath: end };
    });
  });
};

const convertPathRangeToRange = (root: Node, rng: PathRange): Option<Range> => {
  return resolvePath(root, rng.startPath).bind((start) => {
    return resolvePath(root, rng.endPath).map((end) => {
      const rng = document.createRange();
      rng.setStart(start.node, start.offset);
      rng.setEnd(end.node, end.offset);
      return rng;
    });
  });
};

const resolvePath = (root: Node, path: number[]): Option<{node: Text, offset: number}> => {
  const nodePath = path.slice();
  const offset = nodePath.pop();
  return Arr.foldl(nodePath, (optNode: Option<Node>, index: number) => {
    return optNode.bind((node) => Option.from(node.childNodes[index]));
  }, Option.some(root)).bind((node) => {
    if (isText(node) && offset >= 0 && offset <= node.data.length) {
      return Option.some({node, offset});
    }
    return Option.none();
  });
};

export {
  isElement,
  isText,
  convertPathRangeToRange,
  convertRangeToPathRange,
  generatePath,
  generatePathRange,
  resolvePath
};