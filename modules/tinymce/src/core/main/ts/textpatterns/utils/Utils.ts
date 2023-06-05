import { Optional } from '@ephox/katamari';

import DOMUtils from '../../api/dom/DOMUtils';
import Editor from '../../api/Editor';
import * as NodeType from '../../dom/NodeType';
import { isWhitespaceText } from '../../text/Whitespace';
import { getBlockPatterns, getInlinePatterns } from '../core/Pattern';
import { PatternSet } from '../core/PatternTypes';

const cleanEmptyNodes = (dom: DOMUtils, node: Node | null, isRoot: (e: Node) => boolean): void => {
  // Recursively walk up the tree while we have a parent and the node is empty. If the node is empty, then remove it.
  if (node && dom.isEmpty(node) && !isRoot(node)) {
    const parent = node.parentNode;

    dom.remove(node, NodeType.isText(node.firstChild) && isWhitespaceText(node.firstChild.data));

    cleanEmptyNodes(dom, parent, isRoot);
  }
};

const deleteRng = (dom: DOMUtils, rng: Range, isRoot: (e: Node) => boolean, clean = true): void => {
  const startParent = rng.startContainer.parentNode;
  const endParent = rng.endContainer.parentNode;
  rng.deleteContents();

  // Clean up any empty nodes if required
  if (clean && !isRoot(rng.startContainer)) {
    if (NodeType.isText(rng.startContainer) && rng.startContainer.data.length === 0) {
      dom.remove(rng.startContainer);
    }
    if (NodeType.isText(rng.endContainer) && rng.endContainer.data.length === 0) {
      dom.remove(rng.endContainer);
    }
    cleanEmptyNodes(dom, startParent, isRoot);
    if (startParent !== endParent) {
      cleanEmptyNodes(dom, endParent, isRoot);
    }
  }
};

const getParentBlock = (editor: Editor, rng: Range): Optional<Element> =>
  Optional.from(editor.dom.getParent(rng.startContainer, editor.dom.isBlock));

const resolveFromDynamicPatterns = (patternSet: PatternSet, block: Element, beforeText: string): PatternSet => {
  const dynamicPatterns = patternSet.dynamicPatternsLookup({
    text: beforeText,
    block
  });

  // dynamic patterns take precedence here
  return {
    ...patternSet,
    blockPatterns: getBlockPatterns(dynamicPatterns).concat(patternSet.blockPatterns),
    inlinePatterns: getInlinePatterns(dynamicPatterns).concat(patternSet.inlinePatterns)
  };
};

const getBeforeText = (dom: DOMUtils, block: Element, node: Node, offset: number): string => {
  const rng = dom.createRng();
  rng.setStart(block, 0);
  rng.setEnd(node, offset);
  return rng.toString();
};

export {
  cleanEmptyNodes,
  deleteRng,
  getParentBlock,
  resolveFromDynamicPatterns,
  getBeforeText
};
