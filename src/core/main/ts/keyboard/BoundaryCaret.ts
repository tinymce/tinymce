/**
 * BoundaryCaret.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Option, Cell } from '@ephox/katamari';
import * as CaretContainer from '../caret/CaretContainer';
import * as CaretContainerInline from '../caret/CaretContainerInline';
import CaretContainerRemove from '../caret/CaretContainerRemove';
import CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';
import NodeType from '../dom/NodeType';
import { Text } from '@ephox/dom-globals';

const insertInlinePos = function (pos: CaretPosition, before: boolean) {
  if (NodeType.isText(pos.container())) {
    return CaretContainerInline.insertInline(before, pos.container());
  } else {
    return CaretContainerInline.insertInline(before, pos.getNode());
  }
};

const isPosCaretContainer = function (pos: CaretPosition, caret: Cell<Text>) {
  const caretNode = (<Cell<any>> caret).get();
  return caretNode && pos.container() === caretNode && CaretContainer.isCaretContainerInline(caretNode);
};

const renderCaret = function (caret: Cell<Text>, location) {
  return location.fold(
    function (element) { // Before
      CaretContainerRemove.remove(caret.get());
      const text = CaretContainerInline.insertInlineBefore(element);
      caret.set(text);
      return Option.some(CaretPosition(text, text.length - 1));
    },
    function (element) { // Start
      return CaretFinder.firstPositionIn(element).map(function (pos) {
        if (!isPosCaretContainer(pos, caret)) {
          CaretContainerRemove.remove(caret.get());
          const text = insertInlinePos(pos, true);
          caret.set(text);
          return CaretPosition(text, 1);
        } else {
          return CaretPosition(caret.get(), 1);
        }
      });
    },
    function (element) { // End
      return CaretFinder.lastPositionIn(element).map(function (pos) {
        if (!isPosCaretContainer(pos, caret)) {
          CaretContainerRemove.remove(caret.get());
          const text = insertInlinePos(pos, false);
          caret.set(text);
          return CaretPosition(text, text.length - 1);
        } else {
          return CaretPosition(caret.get(), caret.get().length - 1);
        }
      });
    },
    function (element) { // After
      CaretContainerRemove.remove(caret.get());
      const text = CaretContainerInline.insertInlineAfter(element);
      caret.set(text);
      return Option.some(CaretPosition(text, 1));
    }
  );
};

export default {
  renderCaret
};