import { Node, Text, HTMLElement } from '@ephox/dom-globals';
import { Option, Arr } from '@ephox/katamari';
import { NodeTypes } from '@ephox/sugar';

export interface PathRange {
  start: number[];
  end: number[];
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
      return { start, end };
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

const resolvePathRange = (root: Node, range: PathRange) => {
  return resolvePath(root, range.start).bind(({node: startNode, offset: startOffset}) => {
    return resolvePath(root, range.end).map(({node: endNode, offset: endOffset}) => {
      return { startNode, startOffset, endNode, endOffset };
    });
  });
};

export {
  isElement,
  isText,
  generatePath,
  generatePathRange,
  resolvePath,
  resolvePathRange,
};