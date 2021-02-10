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

const isInlineBoundaries = (editor: Editor) => {
  const node = editor.selection.getNode() as HTMLElement;
  return () => Settings.isInlineBoundariesEnabled(editor) && InlineUtils.isInlineTarget(editor, node);
};

const moveOutInlineBoundaries = (editor: Editor, forward: boolean) => {
  const body = editor.getBody();
  const pos = CaretPosition.fromRangeStart(editor.selection.getRng());
  const newPost = forward ? CaretPosition.after : CaretPosition.before;
  const move = (inline: HTMLElement) => BoundarySelection.setCaretPosition(editor, newPost(inline));

  BoundaryLocation.readLocation((node) => InlineUtils.isInlineTarget(editor, node), body, pos).each((location) => {
    location.fold(
      Fun.noop,
      move,
      move,
      Fun.noop
    );
  });
  return true;
};

const moveToLineEndPoint = (editor: Editor, forward: boolean): boolean => {
  NavigationUtils.moveToLineEndPoint(editor, forward, isInlineBoundaries(editor));
  return moveOutInlineBoundaries(editor, forward);
};

export {
  moveToLineEndPoint,
  moveOutInlineBoundaries
};
