/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
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