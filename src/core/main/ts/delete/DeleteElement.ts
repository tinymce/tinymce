/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun, Obj, Option, Options } from '@ephox/katamari';
import { Insert, Remove, Element, Node as SugarNode, PredicateFind, Traverse } from '@ephox/sugar';
import { Node } from '@ephox/dom-globals';
import * as CaretCandidate from '../caret/CaretCandidate';
import CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';
import * as MergeText from './MergeText';
import Empty from '../dom/Empty';
import NodeType from '../dom/NodeType';
import { Editor } from '../api/Editor';

const needsReposition = function (pos, elm) {
  const container = pos.container();
  const offset = pos.offset();
  return CaretPosition.isTextPosition(pos) === false && container === elm.parentNode && offset > CaretPosition.before(elm).offset();
};

const reposition = function (elm, pos) {
  return needsReposition(pos, elm) ? CaretPosition(pos.container(), pos.offset() - 1) : pos;
};

const beforeOrStartOf = function (node) {
  return NodeType.isText(node) ? CaretPosition(node, 0) : CaretPosition.before(node);
};

const afterOrEndOf = function (node) {
  return NodeType.isText(node) ? CaretPosition(node, node.data.length) : CaretPosition.after(node);
};

const getPreviousSiblingCaretPosition = function (elm) {
  if (CaretCandidate.isCaretCandidate(elm.previousSibling)) {
    return Option.some(afterOrEndOf(elm.previousSibling));
  } else {
    return elm.previousSibling ? CaretFinder.lastPositionIn(elm.previousSibling) : Option.none();
  }
};

const getNextSiblingCaretPosition = function (elm) {
  if (CaretCandidate.isCaretCandidate(elm.nextSibling)) {
    return Option.some(beforeOrStartOf(elm.nextSibling));
  } else {
    return elm.nextSibling ? CaretFinder.firstPositionIn(elm.nextSibling) : Option.none();
  }
};

const findCaretPositionBackwardsFromElm = function (rootElement, elm) {
  const startPosition = CaretPosition.before(elm.previousSibling ? elm.previousSibling : elm.parentNode);
  return CaretFinder.prevPosition(rootElement, startPosition).fold(
    function () {
      return CaretFinder.nextPosition(rootElement, CaretPosition.after(elm));
    },
    Option.some
  );
};

const findCaretPositionForwardsFromElm = function (rootElement, elm) {
  return CaretFinder.nextPosition(rootElement, CaretPosition.after(elm)).fold(
    function () {
      return CaretFinder.prevPosition(rootElement, CaretPosition.before(elm));
    },
    Option.some
  );
};

const findCaretPositionBackwards = function (rootElement, elm) {
  return getPreviousSiblingCaretPosition(elm).orThunk(function () {
    return getNextSiblingCaretPosition(elm);
  }).orThunk(function () {
    return findCaretPositionBackwardsFromElm(rootElement, elm);
  });
};

const findCaretPositionForward = function (rootElement, elm) {
  return getNextSiblingCaretPosition(elm).orThunk(function () {
    return getPreviousSiblingCaretPosition(elm);
  }).orThunk(function () {
    return findCaretPositionForwardsFromElm(rootElement, elm);
  });
};

const findCaretPosition = function (forward, rootElement, elm) {
  return forward ? findCaretPositionForward(rootElement, elm) : findCaretPositionBackwards(rootElement, elm);
};

const findCaretPosOutsideElmAfterDelete = function (forward, rootElement, elm) {
  return findCaretPosition(forward, rootElement, elm).map(Fun.curry(reposition, elm));
};

const setSelection = function (editor, forward, pos) {
  pos.fold(
    function () {
      editor.focus();
    },
    function (pos) {
      editor.selection.setRng(pos.toRange(), forward);
    }
  );
};

const eqRawNode = function (rawNode: Node) {
  return function (elm) {
    return elm.dom() === rawNode;
  };
};

const isBlock = function (editor, elm) {
  return elm && editor.schema.getBlockElements().hasOwnProperty(SugarNode.name(elm));
};

const paddEmptyBlock = function (elm) {
  if (Empty.isEmpty(elm)) {
    const br = Element.fromHtml('<br data-mce-bogus="1">');
    Remove.empty(elm);
    Insert.append(elm, br);
    return Option.some(CaretPosition.before(br.dom()));
  } else {
    return Option.none();
  }
};

const deleteNormalized = (elm: Element, afterDeletePosOpt: Option<CaretPosition>, normalizeWhitespace?: boolean): Option<CaretPosition> => {
  const prevTextOpt = Traverse.prevSibling(elm).filter((e) => NodeType.isText(e.dom()));
  const nextTextOpt = Traverse.nextSibling(elm).filter((e) => NodeType.isText(e.dom()));

  // Delete the element
  Remove.remove(elm);

  // Merge and normalize any prev/next text nodes, so that they are merged and don't lose meaningful whitespace
  // eg. <p>a <span></span> b</p> -> <p>a &nsbp;b</p> or <p><span></span> a</p> -> <p>&nbsp;a</a>
  return Options.liftN([ prevTextOpt, nextTextOpt, afterDeletePosOpt ], (prev, next, pos) => {
    const prevNode = prev.dom(), nextNode = next.dom();
    const offset = prevNode.data.length;
    MergeText.mergeTextNodes(prevNode, nextNode, normalizeWhitespace);
    // Update the cursor position if required
    return pos.container() === nextNode ? CaretPosition(prevNode, offset) : pos;
  }).orThunk(() => {
    if (normalizeWhitespace) {
      prevTextOpt.each((elm) => MergeText.normalizeWhitespaceBefore(elm.dom(), elm.dom().length));
      nextTextOpt.each((elm) => MergeText.normalizeWhitespaceAfter(elm.dom(), 0));
    }
    return afterDeletePosOpt;
  });
};

const isInlineElement = (editor: Editor, element: Element): boolean =>
  Obj.has(editor.schema.getTextInlineElements(), SugarNode.name(element));

const deleteElement = (editor: Editor, forward: boolean, elm: Element, moveCaret: boolean = true) => {
  const afterDeletePos = findCaretPosOutsideElmAfterDelete(forward, editor.getBody(), elm.dom());
  const parentBlock = PredicateFind.ancestor(elm, Fun.curry(isBlock, editor), eqRawNode(editor.getBody()));
  const normalizedAfterDeletePos = deleteNormalized(elm, afterDeletePos, isInlineElement(editor, elm));

  if (editor.dom.isEmpty(editor.getBody())) {
    editor.setContent('');
    editor.selection.setCursorLocation();
  } else {
    parentBlock.bind(paddEmptyBlock).fold(
      function () {
        if (moveCaret) {
          setSelection(editor, forward, normalizedAfterDeletePos);
        }
      },
      function (paddPos) {
        if (moveCaret) {
          setSelection(editor, forward, Option.some(paddPos));
        }
      }
    );
  }
};

export default {
  deleteElement
};