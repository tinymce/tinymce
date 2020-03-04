/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Element, Range } from '@ephox/dom-globals';
import CaretPosition from '../caret/CaretPosition';
import { CaretWalker } from '../caret/CaretWalker';
import * as NodeType from '../dom/NodeType';
import Tools from '../api/util/Tools';
import { Unicode } from '@ephox/katamari';

/**
 * Handles inserts of lists into the editor instance.
 *
 * @class tinymce.InsertList
 * @private
 */

const hasOnlyOneChild = function (node) {
  return node.firstChild && node.firstChild === node.lastChild;
};

const isPaddingNode = function (node) {
  return node.name === 'br' || node.value === Unicode.nbsp;
};

const isPaddedEmptyBlock = function (schema, node) {
  const blockElements = schema.getBlockElements();
  return blockElements[node.name] && hasOnlyOneChild(node) && isPaddingNode(node.firstChild);
};

const isEmptyFragmentElement = function (schema, node) {
  const nonEmptyElements = schema.getNonEmptyElements();
  return node && (node.isEmpty(nonEmptyElements) || isPaddedEmptyBlock(schema, node));
};

const isListFragment = function (schema, fragment) {
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
    lastChild = lastChild.prev;
  }

  if (!firstChild || firstChild !== lastChild) {
    return false;
  }

  return firstChild.name === 'ul' || firstChild.name === 'ol';
};

const cleanupDomFragment = function (domFragment) {
  const firstChild = domFragment.firstChild;
  const lastChild = domFragment.lastChild;

  // TODO: remove the meta tag from paste logic
  if (firstChild && firstChild.nodeName === 'META') {
    firstChild.parentNode.removeChild(firstChild);
  }

  if (lastChild && lastChild.id === 'mce_marker') {
    lastChild.parentNode.removeChild(lastChild);
  }

  return domFragment;
};

const toDomFragment = function (dom, serializer, fragment) {
  const html = serializer.serialize(fragment);
  const domFragment = dom.createFragment(html);

  return cleanupDomFragment(domFragment);
};

const listItems = function (elm: Element) {
  return Tools.grep(elm.childNodes, function (child) {
    return child.nodeName === 'LI';
  });
};

const isPadding = function (node) {
  return node.data === Unicode.nbsp || NodeType.isBr(node);
};

const isListItemPadded = function (node) {
  return node && node.firstChild && node.firstChild === node.lastChild && isPadding(node.firstChild);
};

const isEmptyOrPadded = function (elm) {
  return !elm.firstChild || isListItemPadded(elm);
};

const trimListItems = function (elms) {
  return elms.length > 0 && isEmptyOrPadded(elms[elms.length - 1]) ? elms.slice(0, -1) : elms;
};

const getParentLi = function (dom, node) {
  const parentBlock = dom.getParent(node, dom.isBlock);
  return parentBlock && parentBlock.nodeName === 'LI' ? parentBlock : null;
};

const isParentBlockLi = function (dom, node) {
  return !!getParentLi(dom, node);
};

const getSplit = function (parentNode, rng) {
  const beforeRng = rng.cloneRange();
  const afterRng = rng.cloneRange();

  beforeRng.setStartBefore(parentNode);
  afterRng.setEndAfter(parentNode);

  return [
    beforeRng.cloneContents(),
    afterRng.cloneContents()
  ];
};

const findFirstIn = function (node, rootNode) {
  const caretPos = CaretPosition.before(node);
  const caretWalker = CaretWalker(rootNode);
  const newCaretPos = caretWalker.next(caretPos);

  return newCaretPos ? newCaretPos.toRange() : null;
};

const findLastOf = function (node, rootNode) {
  const caretPos = CaretPosition.after(node);
  const caretWalker = CaretWalker(rootNode);
  const newCaretPos = caretWalker.prev(caretPos);

  return newCaretPos ? newCaretPos.toRange() : null;
};

const insertMiddle = function (target, elms, rootNode, rng) {
  const parts = getSplit(target, rng);
  const parentElm = target.parentNode;

  parentElm.insertBefore(parts[0], target);
  Tools.each(elms, function (li) {
    parentElm.insertBefore(li, target);
  });
  parentElm.insertBefore(parts[1], target);
  parentElm.removeChild(target);

  return findLastOf(elms[elms.length - 1], rootNode);
};

const insertBefore = function (target, elms, rootNode) {
  const parentElm = target.parentNode;

  Tools.each(elms, function (elm) {
    parentElm.insertBefore(elm, target);
  });

  return findFirstIn(target, rootNode);
};

const insertAfter = function (target, elms, rootNode, dom) {
  dom.insertAfter(elms.reverse(), target);
  return findLastOf(elms[0], rootNode);
};

const insertAtCaret = function (serializer, dom, rng, fragment): Range {
  const domFragment = toDomFragment(dom, serializer, fragment);
  const liTarget = getParentLi(dom, rng.startContainer);
  const liElms = trimListItems(listItems(domFragment.firstChild));
  const BEGINNING = 1, END = 2;
  const rootNode = dom.getRoot();

  const isAt = function (location) {
    const caretPos = CaretPosition.fromRangeStart(rng);
    const caretWalker = CaretWalker(dom.getRoot());
    const newPos = location === BEGINNING ? caretWalker.prev(caretPos) : caretWalker.next(caretPos);

    return newPos ? getParentLi(dom, newPos.getNode()) !== liTarget : true;
  };

  if (isAt(BEGINNING)) {
    return insertBefore(liTarget, liElms, rootNode);
  } else if (isAt(END)) {
    return insertAfter(liTarget, liElms, rootNode, dom);
  }

  return insertMiddle(liTarget, liElms, rootNode, rng);
};

export {
  isListFragment,
  insertAtCaret,
  isParentBlockLi,
  trimListItems,
  listItems
};
