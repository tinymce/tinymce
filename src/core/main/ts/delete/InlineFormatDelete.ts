/**
 * InlineFormatDelete.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import { Traverse } from '@ephox/sugar';
import CaretPosition from '../caret/CaretPosition';
import DeleteElement from './DeleteElement';
import DeleteUtils from './DeleteUtils';
import ElementType from '../dom/ElementType';
import Parents from '../dom/Parents';
import CaretFormat from '../fmt/CaretFormat';

var getParentInlines = function (rootElm, startElm) {
  var parents = Parents.parentsAndSelf(startElm, rootElm);
  return Arr.findIndex(parents, ElementType.isBlock).fold(
    Fun.constant(parents),
    function (index) {
      return parents.slice(0, index);
    }
  );
};

var hasOnlyOneChild = function (elm) {
  return Traverse.children(elm).length === 1;
};

var deleteLastPosition = function (forward, editor, target, parentInlines) {
  var isFormatElement = Fun.curry(CaretFormat.isFormatElement, editor);
  var formatNodes = Arr.map(Arr.filter(parentInlines, isFormatElement), function (elm) {
    return elm.dom();
  });

  if (formatNodes.length === 0) {
    DeleteElement.deleteElement(editor, forward, target);
  } else {
    var pos = CaretFormat.replaceWithCaretFormat(target.dom(), formatNodes);
    editor.selection.setRng(pos.toRange());
  }
};

var deleteCaret = function (editor, forward) {
  var rootElm = Element.fromDom(editor.getBody());
  var startElm = Element.fromDom(editor.selection.getStart());
  var parentInlines = Arr.filter(getParentInlines(rootElm, startElm), hasOnlyOneChild);

  return Arr.last(parentInlines).map(function (target) {
    var fromPos = CaretPosition.fromRangeStart(editor.selection.getRng());
    if (DeleteUtils.willDeleteLastPositionInElement(forward, fromPos, target.dom())) {
      deleteLastPosition(forward, editor, target, parentInlines);
      return true;
    } else {
      return false;
    }
  }).getOr(false);
};

var backspaceDelete = function (editor, forward) {
  return editor.selection.isCollapsed() ? deleteCaret(editor, forward) : false;
};

export default <any> {
  backspaceDelete: backspaceDelete
};