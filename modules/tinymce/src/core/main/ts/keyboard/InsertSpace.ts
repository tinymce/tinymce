/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun, Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import Editor from '../api/Editor';
import * as CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';
import { insertNbspAtPosition, insertSpaceAtPosition } from '../caret/InsertText';
import * as BoundaryLocation from './BoundaryLocation';
import * as InlineUtils from './InlineUtils';
import { needsToHaveNbsp } from './Nbsps';

const insertSpaceOrNbspAtPosition = (root: SugarElement, pos: CaretPosition): Optional<CaretPosition> =>
  needsToHaveNbsp(root, pos) ? insertNbspAtPosition(pos) : insertSpaceAtPosition(pos);

const locationToCaretPosition = (root: SugarElement) => (location: BoundaryLocation.LocationAdt) => location.fold(
  (element) => CaretFinder.prevPosition(root.dom, CaretPosition.before(element)),
  (element) => CaretFinder.firstPositionIn(element),
  (element) => CaretFinder.lastPositionIn(element),
  (element) => CaretFinder.nextPosition(root.dom, CaretPosition.after(element))
);

const insertInlineBoundarySpaceOrNbsp = (root: SugarElement, pos: CaretPosition) => (checkPos: CaretPosition) =>
  needsToHaveNbsp(root, checkPos) ? insertNbspAtPosition(pos) : insertSpaceAtPosition(pos);

const setSelection = (editor: Editor) => (pos: CaretPosition) => {
  editor.selection.setRng(pos.toRange());
  editor.nodeChanged();
  return true;
};

const insertSpaceOrNbspAtSelection = (editor: Editor): boolean => {
  const pos = CaretPosition.fromRangeStart(editor.selection.getRng());
  const root = SugarElement.fromDom(editor.getBody());

  if (editor.selection.isCollapsed()) {
    const isInlineTarget = Fun.curry(InlineUtils.isInlineTarget, editor);
    const caretPosition = CaretPosition.fromRangeStart(editor.selection.getRng());

    return BoundaryLocation.readLocation(isInlineTarget, editor.getBody(), caretPosition)
      .bind(locationToCaretPosition(root))
      .bind(insertInlineBoundarySpaceOrNbsp(root, pos))
      .exists(setSelection(editor));
  } else {
    return false;
  }
};

export {
  insertSpaceOrNbspAtPosition,
  insertSpaceOrNbspAtSelection
};
