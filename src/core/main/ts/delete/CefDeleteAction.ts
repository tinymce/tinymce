/**
 * CefDeleteAction.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Adt } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';
import CaretUtils from '../caret/CaretUtils';
import DeleteUtils from './DeleteUtils';
import Empty from '../dom/Empty';
import NodeType from '../dom/NodeType';

const DeleteAction = Adt.generate([
  { remove: [ 'element' ] },
  { moveToElement: [ 'element' ] },
  { moveToPosition: [ 'position' ] }
]);

const isAtContentEditableBlockCaret = function (forward, from) {
  const elm = from.getNode(forward === false);
  const caretLocation = forward ? 'after' : 'before';
  return NodeType.isElement(elm) && elm.getAttribute('data-mce-caret') === caretLocation;
};

const deleteEmptyBlockOrMoveToCef = function (rootNode, forward, from, to) {
  const toCefElm = to.getNode(forward === false);
  return DeleteUtils.getParentBlock(Element.fromDom(rootNode), Element.fromDom(from.getNode())).map(function (blockElm) {
    return Empty.isEmpty(blockElm) ? DeleteAction.remove(blockElm.dom()) : DeleteAction.moveToElement(toCefElm);
  }).orThunk(function () {
    return Option.some(DeleteAction.moveToElement(toCefElm));
  });
};

const findCefPosition = function (rootNode, forward, from) {
  return CaretFinder.fromPosition(forward, rootNode, from).bind(function (to) {
    if (forward && NodeType.isContentEditableFalse(to.getNode())) {
      return deleteEmptyBlockOrMoveToCef(rootNode, forward, from, to);
    } else if (forward === false && NodeType.isContentEditableFalse(to.getNode(true))) {
      return deleteEmptyBlockOrMoveToCef(rootNode, forward, from, to);
    } else if (forward && CaretUtils.isAfterContentEditableFalse(from)) {
      return Option.some(DeleteAction.moveToPosition(to));
    } else if (forward === false && CaretUtils.isBeforeContentEditableFalse(from)) {
      return Option.some(DeleteAction.moveToPosition(to));
    } else {
      return Option.none();
    }
  });
};

const getContentEditableBlockAction = function (forward, elm) {
  if (forward && NodeType.isContentEditableFalse(elm.nextSibling)) {
    return Option.some(DeleteAction.moveToElement(elm.nextSibling));
  } else if (forward === false && NodeType.isContentEditableFalse(elm.previousSibling)) {
    return Option.some(DeleteAction.moveToElement(elm.previousSibling));
  } else {
    return Option.none();
  }
};

const skipMoveToActionFromInlineCefToContent = function (root, from, deleteAction) {
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

const getContentEditableAction = function (rootNode, forward, from) {
  if (isAtContentEditableBlockCaret(forward, from)) {
    return getContentEditableBlockAction(forward, from.getNode(forward === false))
      .fold(
        function () {
          return findCefPosition(rootNode, forward, from);
        },
        Option.some
      );
  } else {
    return findCefPosition(rootNode, forward, from).bind(function (deleteAction) {
      return skipMoveToActionFromInlineCefToContent(rootNode, from, deleteAction);
    });
  }
};

const read = function (rootNode, forward, rng) {
  const normalizedRange = CaretUtils.normalizeRange(forward ? 1 : -1, rootNode, rng);
  const from = CaretPosition.fromRangeStart(normalizedRange);

  if (forward === false && CaretUtils.isAfterContentEditableFalse(from)) {
    return Option.some(DeleteAction.remove(from.getNode(true)));
  } else if (forward && CaretUtils.isBeforeContentEditableFalse(from)) {
    return Option.some(DeleteAction.remove(from.getNode()));
  } else {
    return getContentEditableAction(rootNode, forward, from);
  }
};

export default {
  read
};