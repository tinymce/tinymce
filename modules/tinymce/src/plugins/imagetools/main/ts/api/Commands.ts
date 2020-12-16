/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';
import * as Actions from '../core/Actions';
import * as Dialog from '../ui/Dialog';

const register = (editor: Editor, imageUploadTimerState: Cell<number>) => {
  Tools.each({
    mceImageRotateLeft: Actions.rotate(editor, imageUploadTimerState, -90),
    mceImageRotateRight: Actions.rotate(editor, imageUploadTimerState, 90),
    mceImageFlipVertical: Actions.flip(editor, imageUploadTimerState, 'v'),
    mceImageFlipHorizontal: Actions.flip(editor, imageUploadTimerState, 'h'),
    mceEditImage: Dialog.makeOpen(editor, imageUploadTimerState)
  }, (fn, cmd) => {
    editor.addCommand(cmd, fn);
  });
};

export {
  register
};
