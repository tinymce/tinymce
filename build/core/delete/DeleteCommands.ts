/**
 * Commands.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import BlockBoundaryDelete from './BlockBoundaryDelete';
import BlockRangeDelete from './BlockRangeDelete';
import CefDelete from './CefDelete';
import DeleteUtils from './DeleteUtils';
import BoundaryDelete from './InlineBoundaryDelete';
import TableDelete from './TableDelete';

const nativeCommand = function (editor, command) {
  editor.getDoc().execCommand(command, false, null);
};

const deleteCommand = function (editor) {
  if (CefDelete.backspaceDelete(editor, false)) {
    return;
  } else if (BoundaryDelete.backspaceDelete(editor, false)) {
    return;
  } else if (BlockBoundaryDelete.backspaceDelete(editor, false)) {
    return;
  } else if (TableDelete.backspaceDelete(editor)) {
    return;
  } else if (BlockRangeDelete.backspaceDelete(editor, false)) {
    return;
  } else {
    nativeCommand(editor, 'Delete');
    DeleteUtils.paddEmptyBody(editor);
  }
};

const forwardDeleteCommand = function (editor) {
  if (CefDelete.backspaceDelete(editor, true)) {
    return;
  } else if (BoundaryDelete.backspaceDelete(editor, true)) {
    return;
  } else if (BlockBoundaryDelete.backspaceDelete(editor, true)) {
    return;
  } else if (TableDelete.backspaceDelete(editor)) {
    return;
  } else if (BlockRangeDelete.backspaceDelete(editor, true)) {
    return;
  } else {
    nativeCommand(editor, 'ForwardDelete');
  }
};

export default {
  deleteCommand,
  forwardDeleteCommand
};