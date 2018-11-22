/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Option, Fun } from '@ephox/katamari';
import CaretPosition from '../caret/CaretPosition';
import { Editor } from '../api/Editor';
import { Element } from '@ephox/sugar';
import { insertNbspAtPosition, insertSpaceAtPosition } from '../caret/InsertText';
import InlineUtils from './InlineUtils';
import BoundaryLocation from './BoundaryLocation';
import { needsToHaveNbsp } from './Nbsps';
import CaretFinder from 'tinymce/core/caret/CaretFinder';

const insertSpaceOrNbspAtPosition = (root: Element, pos: CaretPosition): Option<CaretPosition> => {
  return needsToHaveNbsp(root, pos) ? insertNbspAtPosition(pos) : insertSpaceAtPosition(pos);
};

const locationToCaretPosition = (root: Element) => (location) => {
  return location.fold(
    (element) => CaretFinder.prevPosition(root.dom(), CaretPosition.before(element)),
    (element) => CaretFinder.firstPositionIn(element),
    (element) => CaretFinder.lastPositionIn(element),
    (element) => CaretFinder.nextPosition(root.dom(), CaretPosition.after(element))
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
      .bind(locationToCaretPosition(root))
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