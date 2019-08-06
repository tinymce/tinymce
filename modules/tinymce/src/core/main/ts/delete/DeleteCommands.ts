/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import BlockBoundaryDelete from './BlockBoundaryDelete';
import BlockRangeDelete from './BlockRangeDelete';
import CefDelete from './CefDelete';
import DeleteUtils from './DeleteUtils';
import BoundaryDelete from './InlineBoundaryDelete';
import TableDelete from './TableDelete';
import InlineFormatDelete from './InlineFormatDelete';
import CefBoundaryDelete from './CefBoundaryDelete';
import Editor from '../api/Editor';
import Outdent from './Outdent';

const nativeCommand = function (editor: Editor, command: string) {
  editor.getDoc().execCommand(command, false, null);
};

const deleteCommand = function (editor: Editor) {
  if (Outdent.backspaceDelete(editor, false)) {
    return;
  } else if (CefDelete.backspaceDelete(editor, false)) {
    return;
  } else if (CefBoundaryDelete.backspaceDelete(editor, false)) {
    return;
  } else if (BoundaryDelete.backspaceDelete(editor, false)) {
    return;
  } else if (BlockBoundaryDelete.backspaceDelete(editor, false)) {
    return;
  } else if (TableDelete.backspaceDelete(editor)) {
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

const forwardDeleteCommand = function (editor: Editor) {
  if (CefDelete.backspaceDelete(editor, true)) {
    return;
  } else if (CefBoundaryDelete.backspaceDelete(editor, true)) {
    return;
  } else if (BoundaryDelete.backspaceDelete(editor, true)) {
    return;
  } else if (BlockBoundaryDelete.backspaceDelete(editor, true)) {
    return;
  } else if (TableDelete.backspaceDelete(editor)) {
    return;
  } else if (BlockRangeDelete.backspaceDelete(editor, true)) {
    return;
  } else if (InlineFormatDelete.backspaceDelete(editor, true)) {
    return;
  } else {
    nativeCommand(editor, 'ForwardDelete');
  }
};

export default {
  deleteCommand,
  forwardDeleteCommand
};