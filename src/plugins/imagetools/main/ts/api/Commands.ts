/**
 * Commands.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Tools from 'tinymce/core/api/util/Tools';
import Actions from '../core/Actions';
import Dialog from '../ui/Dialog';

const register = function (editor, imageUploadTimerState) {
  Tools.each({
    mceImageRotateLeft: Actions.rotate(editor, imageUploadTimerState, -90),
    mceImageRotateRight: Actions.rotate(editor, imageUploadTimerState, 90),
    mceImageFlipVertical: Actions.flip(editor, imageUploadTimerState, 'v'),
    mceImageFlipHorizontal: Actions.flip(editor, imageUploadTimerState, 'h'),
    mceEditImage: Dialog.makeOpen(editor, imageUploadTimerState)
  }, function (fn, cmd) {
    editor.addCommand(cmd, fn);
  });
};

export default {
  register
};