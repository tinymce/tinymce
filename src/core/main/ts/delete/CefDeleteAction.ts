/**
 * CefDeleteAction.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Adt, Fun , Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';
import * as CaretUtils from '../caret/CaretUtils';
import DeleteUtils from './DeleteUtils';
import Empty from '../dom/Empty';
import NodeType from '../dom/NodeType';
import * as ElementType from 'tinymce/core/dom/ElementType';
import { Node, Range } from '@ephox/dom-globals';

const isCompoundElement = (node: Node) => ElementType.isTableCell(Element.fromDom(node)) || ElementType.isListItem(Element.fromDom(node));

const DeleteAction = Adt.generate([
  { remove: [ 'element' ] },
  { moveToElement: [ 'element' ] },
  { moveToPosition: [ 'position' ] }
]);

const isAtContentEditableBlockCaret = (forward: boolean, from: CaretPosition) => {
  const elm = from.getNode(forward === false);
  const caretLocation = forward ? 'after' : 'before';
  return NodeType.isElement(elm) && elm.getAttribute('data-mce-caret') === caretLocation;
};

const isDeleteFromCefDifferentBlocks = (root: Node, forward: boolean, from: CaretPosition, to: CaretPosition) => {
  const inSameBlock = (elm) => ElementType.isInline(Element.fromDom(elm)) && !CaretUtils.isInSameBlock(from, to, root);

  return CaretUtils.getRelativeCefElm(!forward, from).fold(
    () => CaretUtils.getRelativeCefElm(forward, to).fold(Fun.constant(false), inSameBlock),
    inSameBlock
  );
};

const deleteEmptyBlockOrMoveToCef = (root: Node, forward: boolean, from: CaretPosition, to: CaretPosition) => {
  const toCefElm = to.getNode(forward === false);
  return DeleteUtils.getParentBlock(Element.fromDom(root), Element.fromDom(from.getNode())).map(function (blockElm) {
    return Empty.isEmpty(blockElm) ? DeleteAction.remove(blockElm.dom()) : DeleteAction.moveToElement(toCefElm);
  }).orThunk(function () {
    return Option.some(DeleteAction.moveToElement(toCefElm));
  });
};

const findCefPosition = (root: Node, forward: boolean, from: CaretPosition) => {
  return CaretFinder.fromPosition(forward, root, from).bind(function (to) {
    if (isCompoundElement(to.getNode())) {
      return Option.none();
    } else if (isDeleteFromCefDifferentBlocks(root, forward, from, to)) {
      return Option.none();
    } else if (forward && NodeType.isContentEditableFalse(to.getNode())) {
      return deleteEmptyBlockOrMoveToCef(root, forward, from, to);
    } else if (forward === false && NodeType.isContentEditableFalse(to.getNode(true))) {
      return deleteEmptyBlockOrMoveToCef(root, forward, from, to);
    } else if (forward && CaretUtils.isAfterContentEditableFalse(from)) {
      return Option.some(DeleteAction.moveToPosition(to));
    } else if (forward === false && CaretUtils.isBeforeContentEditableFalse(from)) {
      return Option.some(DeleteAction.moveToPosition(to));
    } else {
      return Option.none();
    }
  });
};

const getContentEditableBlockAction = (forward: boolean, elm: Node) => {
  if (forward && NodeType.isContentEditableFalse(elm.nextSibling)) {
    return Option.some(DeleteAction.moveToElement(elm.nextSibling));
  } else if (forward === false && NodeType.isContentEditableFalse(elm.previousSibling)) {
    return Option.some(DeleteAction.moveToElement(elm.previousSibling));
  } else {
    return Option.none();
  }
};

const skipMoveToActionFromInlineCefToContent = (root: Node, from: CaretPosition, deleteAction) => {
  return deleteAction.fold(
    function (elm) {
      return Option.some(DeleteAction.remove(elm));
    },
    function (elm) {
      return Option.some(DeleteAction.moveToElement(elm));
    },
    function (to) {
      if (CaretUtils.isInSameBlock(from, to, root)) {
        return Option.none();
      } else {
        return Option.some(DeleteAction.moveToPosition(to));
      }
    }
  );
};

const getContentEditableAction = (root: Node, forward: boolean, from: CaretPosition) => {
  if (isAtContentEditableBlockCaret(forward, from)) {
    return getContentEditableBlockAction(forward, from.getNode(forward === false))
      .fold(
        function () {
          return findCefPosition(root, forward, from);
        },
        Option.some
      );
  } else {
    return findCefPosition(root, forward, from).bind(function (deleteAction) {
      return skipMoveToActionFromInlineCefToContent(root, from, deleteAction);
    });
  }
};

const read = (root: Node, forward: boolean, rng: Range) => {
  const normalizedRange = CaretUtils.normalizeRange(forward ? 1 : -1, root, rng);
  const from = CaretPosition.fromRangeStart(normalizedRange);

  if (forward === false && CaretUtils.isAfterContentEditableFalse(from)) {
    return Option.some(DeleteAction.remove(from.getNode(true)));
  } else if (forward && CaretUtils.isBeforeContentEditableFalse(from)) {
    return Option.some(DeleteAction.remove(from.getNode()));
  } else {
    return getContentEditableAction(root, forward, from);
  }
};

export {
  read
};