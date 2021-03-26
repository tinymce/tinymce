/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell, Fun } from '@ephox/katamari';
import Editor from '../api/Editor';
import * as Settings from '../api/Settings';
import CaretPosition from '../caret/CaretPosition';
import * as BoundaryCaret from './BoundaryCaret';
import * as BoundaryLocation from './BoundaryLocation';
import * as BoundarySelection from './BoundarySelection';
import * as InlineUtils from './InlineUtils';
import * as NavigationUtils from './NavigationUtils';

const isInlineBoundaries = (editor: Editor, node: Node) =>
  Settings.isInlineBoundariesEnabled(editor) && InlineUtils.isInlineTarget(editor, node);

const moveOutside = (editor: Editor, forward: boolean, caret: Cell<Text>, loc: BoundaryLocation.LocationAdt) => {
  const outsideLoc = BoundaryLocation.outside(loc);
  return BoundaryCaret.renderCaret(caret, outsideLoc).exists((pos) => {
    BoundarySelection.setCaretPosition(editor, pos);
    return true;
  });
};

const getCurrentPos = (editor: Editor, forward: boolean) => {
  const rng = editor.selection.getRng();
  return forward ? CaretPosition.fromRangeEnd(rng) : CaretPosition.fromRangeStart(rng);
};

const moveToLineEndPoint = (editor: Editor, forward: boolean, caret: Cell<Text>): boolean => {
  // Try to find the line endpoint, however if one isn't found then assume we're already at the end point
  const linePoint = NavigationUtils.getLineEndPoint(editor, forward).getOrThunk(() => getCurrentPos(editor, forward));

  return BoundaryLocation.readLocation(Fun.curry(isInlineBoundaries, editor), editor.getBody(), linePoint).exists((loc) => {
    return moveOutside(editor, forward, caret, loc);
  });
};

export {
  moveToLineEndPoint
};
