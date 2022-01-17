/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell, Optional } from '@ephox/katamari';

import Editor from '../api/Editor';
import * as BlockBoundaryDelete from './BlockBoundaryDelete';
import * as BlockRangeDelete from './BlockRangeDelete';
import * as CaretBoundaryDelete from './CaretBoundaryDelete';
import * as CefDelete from './CefDelete';
import * as DeleteUtils from './DeleteUtils';
import * as ImageBlockDelete from './ImageBlockDelete';
import * as InlineBoundaryDelete from './InlineBoundaryDelete';
import * as InlineFormatDelete from './InlineFormatDelete';
import * as MediaDelete from './MediaDelete';
import * as Outdent from './Outdent';
import * as TableDelete from './TableDelete';

const nativeCommand = (editor: Editor, command: string): void => {
  editor.getDoc().execCommand(command, false, null);
};

const checkAndRun = (action: Optional<() => void>) => {
  action.each((apply) => apply());
  return action.isSome();
};

const deleteCommand = (editor: Editor, caret: Cell<Text>): void => {
  if (checkAndRun(Outdent.backspaceDelete(editor))) {
    return;
  } else if (checkAndRun(CefDelete.backspaceDelete(editor, false))) {
    return;
  } else if (checkAndRun(CaretBoundaryDelete.backspaceDelete(editor, false))) {
    return;
  } else if (checkAndRun(InlineBoundaryDelete.backspaceDelete(editor, caret, false))) {
    return;
  } else if (checkAndRun(BlockBoundaryDelete.backspaceDelete(editor, false))) {
    return;
  } else if (checkAndRun(TableDelete.backspaceDelete(editor))) {
    return;
  } else if (checkAndRun(ImageBlockDelete.backspaceDelete(editor, false))) {
    return;
  } else if (checkAndRun(MediaDelete.backspaceDelete(editor, false))) {
    return;
  } else if (checkAndRun(BlockRangeDelete.backspaceDelete(editor, false))) {
    return;
  } else if (checkAndRun(InlineFormatDelete.backspaceDelete(editor, false))) {
    return;
  } else {
    nativeCommand(editor, 'Delete');
    DeleteUtils.paddEmptyBody(editor);
  }
};

const forwardDeleteCommand = (editor: Editor, caret: Cell<Text>): void => {
  if (checkAndRun(CefDelete.backspaceDelete(editor, true))) {
    return;
  } else if (checkAndRun(CaretBoundaryDelete.backspaceDelete(editor, true))) {
    return;
  } else if (checkAndRun(InlineBoundaryDelete.backspaceDelete(editor, caret, true))) {
    return;
  } else if (checkAndRun(BlockBoundaryDelete.backspaceDelete(editor, true))) {
    return;
  } else if (checkAndRun(TableDelete.backspaceDelete(editor))) {
    return;
  } else if (checkAndRun(ImageBlockDelete.backspaceDelete(editor, true))) {
    return;
  } else if (checkAndRun(MediaDelete.backspaceDelete(editor, true))) {
    return;
  } else if (checkAndRun(BlockRangeDelete.backspaceDelete(editor, true))) {
    return;
  } else if (checkAndRun(InlineFormatDelete.backspaceDelete(editor, true))) {
    return;
  } else {
    nativeCommand(editor, 'ForwardDelete');
  }
};

const setup = (editor: Editor, caret: Cell<Text>): void => {
  editor.addCommand('delete', () => {
    deleteCommand(editor, caret);
  });

  editor.addCommand('forwardDelete', () => {
    forwardDeleteCommand(editor, caret);
  });
};

export {
  deleteCommand,
  forwardDeleteCommand,
  setup
};
