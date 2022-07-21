import { Optional } from '@ephox/katamari';

import DOMUtils from '../../api/dom/DOMUtils';
import Editor from '../../api/Editor';
import * as NodeType from '../../dom/NodeType';
import { Pattern, PatternSet } from '../core/PatternTypes';

const cleanEmptyNodes = (dom: DOMUtils, node: Node | null, isRoot: (e: Node) => boolean): void => {
  // Recursively walk up the tree while we have a parent and the node is empty. If the node is empty, then remove it.
  if (node && dom.isEmpty(node) && !isRoot(node)) {
    const parent = node.parentNode;
    dom.remove(node);
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

const resolveFromDynamicPatterns = (patternSet: PatternSet, block: Element): Pattern[] => {
  const blockText = block.textContent ?? '';
  return patternSet.dynamicPatternsLookup({
    text: blockText,
    block
  });
};
export {
  cleanEmptyNodes,
  deleteRng,
  getParentBlock,
  resolveFromDynamicPatterns
};
