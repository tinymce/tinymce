/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun, Optional } from '@ephox/katamari';
import Editor from '../api/Editor';
import CaretPosition from '../caret/CaretPosition';
import * as BoundaryLocation from './BoundaryLocation';
import * as BoundarySelection from './BoundarySelection';
import * as InlineUtils from './InlineUtils';
import * as NavigationUtils from './NavigationUtils';

const isInlineBoundaries = (editor: Editor) => (node: Node) => {
  return InlineUtils.isInlineTarget(editor, node);
};

const moveOutInlineBoundaries = (editor: Editor, forward: boolean) => {
  const body = editor.getBody();
  const pos = CaretPosition.fromRangeStart(editor.selection.getRng());
  const newPost = forward ? CaretPosition.after : CaretPosition.before;
  const move = (inline: HTMLElement) => BoundarySelection.setCaretPosition(editor, newPost(inline));

  const location = BoundaryLocation.readLocation(isInlineBoundaries(editor), body, pos);
  location.each((location) => {
    location.fold(
      Fun.noop,
      move,
      move,
      Fun.noop
    );
  });
  return location.isSome();
};

const moveOutside = (editor: Editor, inline: Node, forward: boolean) => {
  const pos = forward ? CaretPosition.after(inline) : CaretPosition.before(inline);
  BoundarySelection.setCaretPosition(editor, pos);
};

const selfBoundarylLocation = (editor: Editor, forward: boolean) => {
  const node = editor.selection.getNode();
  if (isInlineBoundaries(editor)(node)) {
    moveOutside(editor, node, forward);
  }
};

const moveToLineEndPoint = (editor: Editor, forward: boolean): boolean => {
  return NavigationUtils.getLineEndPoint(editor, forward).exists((pos) => {
    const location = BoundaryLocation.readLocation(isInlineBoundaries(editor), editor.getBody(), pos)
      .orThunk(() => {
        selfBoundarylLocation(editor, forward);
        return Optional.none();
      });

    location.each((loc) => {
      moveOutside(editor, BoundaryLocation.getElement(loc), forward);
    });

    return location.isSome();
  });

};

export {
  moveToLineEndPoint,
  moveOutInlineBoundaries
};
