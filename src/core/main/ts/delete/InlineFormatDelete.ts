/**
 * InlineFormatDelete.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Arr, Fun } from '@ephox/katamari';
import { Element, Traverse } from '@ephox/sugar';
import CaretPosition from '../caret/CaretPosition';
import DeleteElement from './DeleteElement';
import DeleteUtils from './DeleteUtils';
import * as ElementType from '../dom/ElementType';
import Parents from '../dom/Parents';
import * as CaretFormat from '../fmt/CaretFormat';

const getParentInlines = function (rootElm, startElm) {
  const parents = Parents.parentsAndSelf(startElm, rootElm);
  return Arr.findIndex(parents, ElementType.isBlock).fold(
    Fun.constant(parents),
    function (index) {
      return parents.slice(0, index);
    }
  );
};

const hasOnlyOneChild = function (elm) {
  return Traverse.children(elm).length === 1;
};

const deleteLastPosition = function (forward, editor, target, parentInlines) {
  const isFormatElement = Fun.curry(CaretFormat.isFormatElement, editor);
  const formatNodes = Arr.map(Arr.filter(parentInlines, isFormatElement), function (elm) {
    return elm.dom();
  });

  if (formatNodes.length === 0) {
    DeleteElement.deleteElement(editor, forward, target);
  } else {
    const pos = CaretFormat.replaceWithCaretFormat(target.dom(), formatNodes);
    editor.selection.setRng(pos.toRange());
  }
};

const deleteCaret = function (editor, forward) {
  const rootElm = Element.fromDom(editor.getBody());
  const startElm = Element.fromDom(editor.selection.getStart());
  const parentInlines = Arr.filter(getParentInlines(rootElm, startElm), hasOnlyOneChild);

  return Arr.last(parentInlines).map(function (target) {
    const fromPos = CaretPosition.fromRangeStart(editor.selection.getRng());
    if (DeleteUtils.willDeleteLastPositionInElement(forward, fromPos, target.dom())) {
      deleteLastPosition(forward, editor, target, parentInlines);
      return true;
    } else {
      return false;
    }
  }).getOr(false);
};

const backspaceDelete = function (editor, forward) {
  return editor.selection.isCollapsed() ? deleteCaret(editor, forward) : false;
};

export default {
  backspaceDelete
};