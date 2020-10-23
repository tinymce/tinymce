/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell } from '@ephox/katamari';
import Editor from '../api/Editor';
import * as BlockBoundaryDelete from './BlockBoundaryDelete';
import * as BlockRangeDelete from './BlockRangeDelete';
import * as CaretBoundaryDelete from './CaretBoundaryDelete';
import * as CefDelete from './CefDelete';
import * as DeleteUtils from './DeleteUtils';
import * as ImageBlockDelete from './ImageBlockDelete';
import * as BoundaryDelete from './InlineBoundaryDelete';
import * as InlineFormatDelete from './InlineFormatDelete';
import * as MediaDelete from './MediaDelete';
import * as Outdent from './Outdent';
import * as TableDelete from './TableDelete';

const nativeCommand = (editor: Editor, command: string) => {
  editor.getDoc().execCommand(command, false, null);
};

const deleteCommand = (editor: Editor, caret: Cell<Text>) => {
  if (Outdent.backspaceDelete(editor, false)) {
    return;
  } else if (CefDelete.backspaceDelete(editor, false)) {
    return;
  } else if (CaretBoundaryDelete.backspaceDelete(editor, false)) {
    return;
  } else if (BoundaryDelete.backspaceDelete(editor, caret, false)) {
    return;
  } else if (BlockBoundaryDelete.backspaceDelete(editor, false)) {
    return;
  } else if (TableDelete.backspaceDelete(editor)) {
    return;
  } else if (ImageBlockDelete.backspaceDelete(editor, false)) {
    return;
  } else if (MediaDelete.backspaceDelete(editor, false)) {
    return;
  } else if (BlockRangeDelete.backspaceDelete(editor, false)) {
    return;
  } else if (InlineFormatDelete.backspaceDelete(editor, false)) {
    return;
  } else {
    nativeCommand(editor, 'Delete');
    DeleteUtils.paddEmptyBody(editor);
  }
};

const forwardDeleteCommand = (editor: Editor, caret: Cell<Text>) => {
  if (CefDelete.backspaceDelete(editor, true)) {
    return;
  } else if (CaretBoundaryDelete.backspaceDelete(editor, true)) {
    return;
  } else if (BoundaryDelete.backspaceDelete(editor, caret, true)) {
    return;
  } else if (BlockBoundaryDelete.backspaceDelete(editor, true)) {
    return;
  } else if (TableDelete.backspaceDelete(editor)) {
    return;
  } else if (ImageBlockDelete.backspaceDelete(editor, true)) {
    return;
  } else if (MediaDelete.backspaceDelete(editor, true)) {
    return;
  } else if (BlockRangeDelete.backspaceDelete(editor, true)) {
    return;
  } else if (InlineFormatDelete.backspaceDelete(editor, true)) {
    return;
  } else {
    nativeCommand(editor, 'ForwardDelete');
  }
};

const setup = (editor: Editor, caret: Cell<Text>) => {
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
