import { Arr, Type, Unicode } from '@ephox/katamari';

import DOMUtils from '../api/dom/DOMUtils';
import AstNode from '../api/html/Node';
import Schema from '../api/html/Schema';
import HtmlSerializer from '../api/html/Serializer';
import Tools from '../api/util/Tools';
import CaretPosition from '../caret/CaretPosition';
import { CaretWalker } from '../caret/CaretWalker';
import * as NodeType from '../dom/NodeType';

/**
 * Handles inserts of lists into the editor instance.
 *
 * @class tinymce.InsertList
 * @private
 */

const hasOnlyOneChild = (node: AstNode): boolean => {
  return Type.isNonNullable(node.firstChild) && node.firstChild === node.lastChild;
};

const isPaddingNode = (node: AstNode): boolean => {
  return node.name === 'br' || node.value === Unicode.nbsp;
};

const isPaddedEmptyBlock = (schema: Schema, node: AstNode): boolean => {
  const blockElements = schema.getBlockElements();
  return blockElements[node.name] && hasOnlyOneChild(node) && isPaddingNode(node.firstChild as AstNode);
};

const isEmptyFragmentElement = (schema: Schema, node: AstNode | null | undefined): boolean => {
  const nonEmptyElements = schema.getNonEmptyElements();
  return Type.isNonNullable(node) && (node.isEmpty(nonEmptyElements) || isPaddedEmptyBlock(schema, node));
};

const isListFragment = (schema: Schema, fragment: AstNode): boolean => {
  let firstChild = fragment.firstChild;
  let lastChild = fragment.lastChild;

  // Skip meta since it's likely <meta><ul>..</ul>
  if (firstChild && firstChild.name === 'meta') {
    firstChild = firstChild.next;
  }

  // Skip mce_marker since it's likely <ul>..</ul><span id="mce_marker"></span>
  if (lastChild && lastChild.attr('id') === 'mce_marker') {
    lastChild = lastChild.prev;
  }

  // Skip last child if it's an empty block
  if (isEmptyFragmentElement(schema, lastChild)) {
    lastChild = lastChild?.prev;
  }

  if (!firstChild || firstChild !== lastChild) {
    return false;
  }

  return firstChild.name === 'ul' || firstChild.name === 'ol';
};

const cleanupDomFragment = (domFragment: DocumentFragment): DocumentFragment => {
  const firstChild = domFragment.firstChild;
  const lastChild = domFragment.lastChild;

  // TODO: remove the meta tag from paste logic
  if (firstChild && firstChild.nodeName === 'META') {
    firstChild.parentNode?.removeChild(firstChild);
  }

  if (lastChild && (lastChild as Element).id === 'mce_marker') {
    lastChild.parentNode?.removeChild(lastChild);
  }

  return domFragment;
};

const toDomFragment = (dom: DOMUtils, serializer: HtmlSerializer, fragment: AstNode): DocumentFragment => {
  const html = serializer.serialize(fragment);
  const domFragment = dom.createFragment(html);

  return cleanupDomFragment(domFragment);
};

const listItems = (elm: Node | null): HTMLLIElement[] => {
  return Arr.filter(elm?.childNodes ?? [], (child): child is HTMLLIElement => {
    return child.nodeName === 'LI';
  });
};

const isPadding = (node: Node): boolean => {
  return (node as Text).data === Unicode.nbsp || NodeType.isBr(node);
};

const isListItemPadded = (node: Node): boolean => {
  return Type.isNonNullable(node?.firstChild) && node.firstChild === node.lastChild && isPadding(node.firstChild);
};

const isEmptyOrPadded = (elm: Node): boolean => {
  return !elm.firstChild || isListItemPadded(elm);
};

const trimListItems = <T extends Node>(elms: T[]): T[] => {
  return elms.length > 0 && isEmptyOrPadded(elms[elms.length - 1]) ? elms.slice(0, -1) : elms;
};

const getParentLi = (dom: DOMUtils, node: Node): HTMLLIElement | null => {
  const parentBlock = dom.getParent(node, dom.isBlock);
  return parentBlock && parentBlock.nodeName === 'LI' ? parentBlock as HTMLLIElement : null;
};

const isParentBlockLi = (dom: DOMUtils, node: Node): boolean => {
  return !!getParentLi(dom, node);
};

const getSplit = (parentNode: Node, rng: Range): DocumentFragment[] => {
  const beforeRng = rng.cloneRange();
  const afterRng = rng.cloneRange();

  beforeRng.setStartBefore(parentNode);
  afterRng.setEndAfter(parentNode);

  return [
    beforeRng.cloneContents(),
    afterRng.cloneContents()
  ];
};

const findFirstIn = (node: Node, rootNode: Node): Range | null => {
  const caretPos = CaretPosition.before(node);
  const caretWalker = CaretWalker(rootNode);
  const newCaretPos = caretWalker.next(caretPos);

  return newCaretPos ? newCaretPos.toRange() : null;
};

const findLastOf = (node: Node, rootNode: Node): Range | null => {
  const caretPos = CaretPosition.after(node);
  const caretWalker = CaretWalker(rootNode);
  const newCaretPos = caretWalker.prev(caretPos);

  return newCaretPos ? newCaretPos.toRange() : null;
};

const insertMiddle = (target: Node, elms: Node[], rootNode: Node, rng: Range): Range | null => {
  const parts = getSplit(target, rng);
  const parentElm = target.parentNode;

  if (parentElm) {
    parentElm.insertBefore(parts[0], target);
    Tools.each(elms, (li) => {
      parentElm.insertBefore(li, target);
    });
    parentElm.insertBefore(parts[1], target);
    parentElm.removeChild(target);
  }

  return findLastOf(elms[elms.length - 1], rootNode);
};

const insertBefore = (target: Node, elms: Node[], rootNode: Node): Range | null => {
  const parentElm = target.parentNode;

  if (parentElm) {
    Tools.each(elms, (elm) => {
      parentElm.insertBefore(elm, target);
    });
  }

  return findFirstIn(target, rootNode);
};

const insertAfter = (target: Node, elms: Node[], rootNode: Node, dom: DOMUtils): Range | null => {
  dom.insertAfter(elms.reverse(), target);
  return findLastOf(elms[0], rootNode);
};

const insertAtCaret = (serializer: HtmlSerializer, dom: DOMUtils, rng: Range, fragment: AstNode): Range | null => {
  const domFragment = toDomFragment(dom, serializer, fragment);
  const liTarget = getParentLi(dom, rng.startContainer);
  const liElms = trimListItems(listItems(domFragment.firstChild));
  const BEGINNING = 1, END = 2;
  const rootNode = dom.getRoot();

  const isAt = (location: number): boolean => {
    const caretPos = CaretPosition.fromRangeStart(rng);
    const caretWalker = CaretWalker(dom.getRoot());
    const newPos = location === BEGINNING ? caretWalker.prev(caretPos) : caretWalker.next(caretPos);
    const newPosNode = newPos?.getNode();

    return newPosNode ? getParentLi(dom, newPosNode) !== liTarget : true;
  };

  if (!liTarget) {
    return null;
  } else if (isAt(BEGINNING)) {
    return insertBefore(liTarget, liElms, rootNode);
  } else if (isAt(END)) {
    return insertAfter(liTarget, liElms, rootNode, dom);
  } else {
    return insertMiddle(liTarget, liElms, rootNode, rng);
  }
};

export {
  isListFragment,
  insertAtCaret,
  isParentBlockLi,
  trimListItems,
  listItems
};
