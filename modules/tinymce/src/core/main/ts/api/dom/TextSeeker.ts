import { Optional } from '@ephox/katamari';

import * as NodeType from '../../dom/NodeType';
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

/**
 * The TextSeeker class enables you to seek for a specific point in text across the DOM.
 *
 * @class tinymce.dom.TextSeeker
 * @example
 * const seeker = tinymce.dom.TextSeeker(editor.dom);
 * const startOfWord = seeker.backwards(startNode, startOffset, (textNode, offset, text) => {
 *   const lastSpaceCharIndex = text.lastIndexOf(' ');
 *   if (lastSpaceCharIndex !== -1) {
 *     return lastSpaceCharIndex + 1;
 *   } else {
 *     // No space found so continue searching
 *     return -1;
 *   }
 * });
 */

/**
 * Constructs a new TextSeeker instance.
 *
 * @constructor
 * @param {tinymce.dom.DOMUtils} dom DOMUtils object reference.
 * @param {Function} isBoundary Optional function to determine if the seeker should continue to walk past the node provided. The default is to search until a block or <code>br</code> element is found.
 */
const TextSeeker = (dom: DOMUtils, isBoundary?: (node: Node) => boolean): TextSeeker => {
  const isBlockBoundary = isBoundary ? isBoundary : (node: Node) => dom.isBlock(node) || NodeType.isBr(node) || NodeType.isContentEditableFalse(node);

  const walk = (node: Node, offset: number, walker: () => Optional<Spot>, process: TextProcessCallback): Optional<Spot> => {
    if (NodeType.isText(node)) {
      const newOffset = process(node, offset, node.data);
      if (newOffset !== -1) {
        return Optional.some({ container: node, offset: newOffset });
      }
    }

    return walker().bind((next) => walk(next.container, next.offset, walker, process));
  };

  /**
   * Search backwards through text nodes until a match, boundary, or root node has been found.
   *
   * @method backwards
   * @param {Node} node The node to start searching from.
   * @param {Number} offset The offset of the node to start searching from.
   * @param {Function} process A function that's passed the current text node, the current offset and the text content of the node. It should return the offset of the match or -1 to continue searching.
   * @param {Node} root An optional root node to constrain the search to.
   * @return {Object} An object containing the matched text node and offset. If no match is found, null will be returned.
   */
  const backwards = (node: Node, offset: number, process: TextProcessCallback, root?: Node) => {
    const walker = TextWalker(node, root ?? dom.getRoot(), isBlockBoundary);
    return walk(node, offset, () => walker.prev().map((prev) => ({ container: prev, offset: prev.length })), process).getOrNull();
  };

  /**
   * Search forwards through text nodes until a match, boundary, or root node has been found.
   *
   * @method forwards
   * @param {Node} node The node to start searching from.
   * @param {Number} offset The offset of the node to start searching from.
   * @param {Function} process A function that's passed the current text node, the current offset and the text content of the node. It should return the offset of the match or -1 to continue searching.
   * @param {Node} root An optional root node to constrain the search to.
   * @return {Object} An object containing the matched text node and offset. If no match is found, null will be returned.
   */
  const forwards = (node: Node, offset: number, process: TextProcessCallback, root?: Node) => {
    const walker = TextWalker(node, root ?? dom.getRoot(), isBlockBoundary);
    return walk(node, offset, () => walker.next().map((next) => ({ container: next, offset: 0 })), process).getOrNull();
  };

  return {
    backwards,
    forwards
  };
};

export default TextSeeker;
