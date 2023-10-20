import { Fun } from '@ephox/katamari';
import { Compare, ContentEditable, SelectorExists, SugarElement, Traverse } from '@ephox/sugar';

import DomTreeWalker from '../api/dom/TreeWalker';
import * as CaretCandidate from '../caret/CaretCandidate';
import { isWhitespaceText } from '../text/Whitespace';
import * as NodeType from './NodeType';

const hasWhitespacePreserveParent = (node: Node, rootNode: Node): boolean => {
  const rootElement = SugarElement.fromDom(rootNode);
  const startNode = SugarElement.fromDom(node);
  return SelectorExists.ancestor(startNode, 'pre,code', Fun.curry(Compare.eq, rootElement));
};

const isWhitespace = (node: Node, rootNode: Node): boolean => {
  return NodeType.isText(node) && isWhitespaceText(node.data) && !hasWhitespacePreserveParent(node, rootNode);
};

const isNamedAnchor = (node: Node): boolean => {
  return NodeType.isElement(node) && node.nodeName === 'A' && !node.hasAttribute('href') && (node.hasAttribute('name') || node.hasAttribute('id'));
};

const isContent = (node: Node, rootNode: Node): boolean => {
  return (CaretCandidate.isCaretCandidate(node) && !isWhitespace(node, rootNode)) || isNamedAnchor(node) || isBookmark(node);
};

const isBookmark = NodeType.hasAttribute('data-mce-bookmark');
const isBogus = NodeType.hasAttribute('data-mce-bogus');
const isBogusAll = NodeType.hasAttributeValue('data-mce-bogus', 'all');

const hasNonEditableParent = (node: Node) =>
  Traverse.parentElement(SugarElement.fromDom(node)).exists((parent) => !ContentEditable.isEditable(parent));

const isEmptyNode = (targetNode: Node, skipBogus: boolean): boolean => {
  let brCount = 0;

  if (isContent(targetNode, targetNode)) {
    return false;
  } else {
    let node: Node | null | undefined = targetNode.firstChild;
    if (!node) {
      return true;
    }

    const walker = new DomTreeWalker(node, targetNode);
    do {
      if (skipBogus) {
        if (isBogusAll(node)) {
          node = walker.next(true);
          continue;
        }

        if (isBogus(node)) {
          node = walker.next();
          continue;
        }
      }
      if (NodeType.isContentEditableTrue(node) && hasNonEditableParent(node)) {
        return false;
      }

      if (NodeType.isBr(node)) {
        brCount++;
        node = walker.next();
        continue;
      }

      if (isContent(node, targetNode)) {
        return false;
      }

      node = walker.next();
    } while (node);

    return brCount <= 1;
  }
};

const isEmpty = (elm: SugarElement<Node>, skipBogus: boolean = true): boolean =>
  isEmptyNode(elm.dom, skipBogus);

export {
  isEmpty,
  isContent
};
