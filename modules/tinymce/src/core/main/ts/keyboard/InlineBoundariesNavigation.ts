/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from '../api/Editor';
import * as Settings from '../api/Settings';
import CaretPosition from '../caret/CaretPosition';
import * as BoundarySelection from './BoundarySelection';
import * as InlineUtils from './InlineUtils';
import * as NavigationUtils from './NavigationUtils';

const isInlineBoundaries = (editor: Editor) => {
  const node = editor.selection.getNode() as HTMLElement;
  return () => Settings.isInlineBoundariesEnabled(editor) && InlineUtils.isInlineTarget(editor, node);
};

const moveOutInlineBoundaries = (editor: Editor, forward: boolean) => {
  if (isInlineBoundaries(editor)()) {
    const node = editor.selection.getNode() as HTMLElement;
    const pos = forward ? CaretPosition.after(node) : CaretPosition.before(node);
    BoundarySelection.setCaretPosition(editor, pos);
    return true;
  }
  return false;
};

const moveToLineEndPoint = (editor: Editor, forward: boolean): boolean => {
  NavigationUtils.moveToLineEndPoint(editor, forward, isInlineBoundaries(editor));
  return moveOutInlineBoundaries(editor, forward);
};

export {
  moveToLineEndPoint,
  moveOutInlineBoundaries
};
