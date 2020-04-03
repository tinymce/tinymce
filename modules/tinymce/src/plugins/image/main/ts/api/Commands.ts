/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Dialog } from '../ui/Dialog';
import Editor from 'tinymce/core/api/Editor';
import { insertOrUpdateImage } from '../core/ImageSelection';
import { ImageData } from '../core/ImageData';

const register = (editor: Editor) => {
  editor.addCommand('mceImage', Dialog(editor).openLater);

  // TODO: This command is likely to be short lived we only need it until we expose the rtc model though a new api so it shouldn't be documented
  // it's just a command since that is a convenient method for the rtc plugin to override the default dom mutation behaviour
  editor.addCommand('mceUpdateImage', (_ui, data: Partial<ImageData>) => {
    editor.undoManager.transact(() => insertOrUpdateImage(editor, data));
  });
};

export {
  register
};
