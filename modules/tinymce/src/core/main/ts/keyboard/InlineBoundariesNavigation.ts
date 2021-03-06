/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun } from '@ephox/katamari';
import Editor from '../api/Editor';
import * as Settings from '../api/Settings';
import CaretPosition from '../caret/CaretPosition';
import * as BoundaryLocation from './BoundaryLocation';
import * as BoundarySelection from './BoundarySelection';
import * as InlineUtils from './InlineUtils';
import * as NavigationUtils from './NavigationUtils';

const isInlineBoundaries = (editor: Editor, node: Node) =>
  Settings.isInlineBoundariesEnabled(editor) && InlineUtils.isInlineTarget(editor, node);

const moveOutside = (editor: Editor, forward: boolean, inline: Node) => {
  const pos = forward ? CaretPosition.after(inline) : CaretPosition.before(inline);
  BoundarySelection.setCaretPosition(editor, pos);
};

const selfMoveOutside = (editor: Editor, forward: boolean) => {
  const node = editor.selection.getNode();
  if (isInlineBoundaries(editor, node)) {
    moveOutside(editor, forward, node);
  }
};

const moveToLineEndPoint = (editor: Editor, forward: boolean): boolean => {
  const linePoint = NavigationUtils.getLineEndPoint(editor, forward);
  linePoint.getOrThunk(() => selfMoveOutside(editor, forward));

  return linePoint.exists((pos) => {
    const location = BoundaryLocation.readLocation(Fun.curry(isInlineBoundaries, editor), editor.getBody(), pos);

    location.fold(
      () => selfMoveOutside(editor, forward),
      (loc) => moveOutside(editor, forward, BoundaryLocation.getElement(loc))
    );

    return location.isSome();
  });
};

export {
  moveToLineEndPoint
};
