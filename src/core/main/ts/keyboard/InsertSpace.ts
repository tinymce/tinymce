/**
 * InsertSpace.ts
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2018 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Option, Fun } from '@ephox/katamari';
import CaretPosition from '../caret/CaretPosition';
import { Editor } from '../api/Editor';
import { Element } from '@ephox/sugar';
import { insertNbspAtPosition, insertSpaceAtPosition } from '../caret/InsertText';
import InlineUtils from './InlineUtils';
import BoundaryLocation from './BoundaryLocation';
import { needsToHaveNbsp } from './Nbsps';

const insertSpaceOrNbspAtPosition = (root: Element, pos: CaretPosition): Option<CaretPosition> => {
  return needsToHaveNbsp(root, pos) ? insertNbspAtPosition(pos) : insertSpaceAtPosition(pos);
};

const locationToCaretPosition = (location) => {
  return location.fold(
    CaretPosition.before,
    (element) => CaretPosition(element, 0),
    (element) => CaretPosition(element, element.childNodes.length),
    CaretPosition.after
  );
};

const insertInlineBoundarySpaceOrNbsp = (root: Element, pos: CaretPosition) => (checkPos: CaretPosition) => {
  return needsToHaveNbsp(root, checkPos) ? insertNbspAtPosition(pos) : insertSpaceAtPosition(pos);
};

const setSelection = (editor: Editor) => (pos: CaretPosition) => {
  editor.selection.setRng(pos.toRange());
  editor.nodeChanged();
  return true;
};

const insertSpaceOrNbspAtSelection = (editor: Editor): boolean => {
  const pos = CaretPosition.fromRangeStart(editor.selection.getRng());
  const root = Element.fromDom(editor.getBody());

  if (editor.selection.isCollapsed()) {
    const isInlineTarget = Fun.curry(InlineUtils.isInlineTarget, editor);
    const caretPosition = CaretPosition.fromRangeStart(editor.selection.getRng());

    return BoundaryLocation.readLocation(isInlineTarget, editor.getBody(), caretPosition)
      .map(locationToCaretPosition)
      .bind(insertInlineBoundarySpaceOrNbsp(root, pos))
      .fold(
        () => insertSpaceOrNbspAtPosition(root, pos).map(setSelection(editor)).getOr(false),
        setSelection(editor)
      );
  } else {
    return false;
  }
};

export {
  insertSpaceOrNbspAtPosition,
  insertSpaceOrNbspAtSelection
};