import { Node, Text } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';
import { Spot } from '@ephox/phoenix';
import NodeType from '../../dom/NodeType';
import { TextWalker } from '../../dom/TextWalker';
import DOMUtils from './DOMUtils';

type TextProcessCallback = (node: Text, offset: number, text: string) => number;
interface Spot {
  container: Text;
  offset: number;
}

interface TextSeeker {
  backwards: (node: Node, offset: number, process: TextProcessCallback, root?: Node) => Spot | null;
  forwards: (node: Node, offset: number, process: TextProcessCallback, root?: Node) => Spot | null;
}

const TextSeeker = (dom: DOMUtils, isBoundary?: (node: Node) => boolean): TextSeeker => {
  const isBlockBoundary = isBoundary ? isBoundary : (node: Node) => dom.isBlock(node) || NodeType.isBr(node) || NodeType.isContentEditableFalse(node);

  const walk = (node: Node, offset: number, walker: () => Option<Spot>, process: TextProcessCallback): Option<Spot> => {
    const recurse = () => {
      return walker().bind((next) => {
        return walk(next.container, next.offset, walker, process);
      });
    };

    if (NodeType.isText(node)) {
      const newOffset = process(node, offset, node.data);
      if (newOffset !== -1) {
        return Option.some({ container: node, offset: newOffset });
      }
    }

    return recurse();
  };

  const backwards = (node: Node, offset: number, process: TextProcessCallback, root?: Node) => {
    const walker = TextWalker(node, root, isBlockBoundary);
    return walk(node, offset, () => walker.prev().map((prev) => ({ container: prev, offset: prev.length })), process).getOrNull();
  };

  const forwards = (node: Node, offset: number, process: TextProcessCallback, root?: Node) => {
    const walker = TextWalker(node, root, isBlockBoundary);
    return walk(node, offset, () => walker.next().map((next) => ({ container: next, offset: 0 })), process).getOrNull();
  };

  return {
    backwards,
    forwards
  };
};

export default TextSeeker;
