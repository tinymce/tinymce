/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell } from '@ephox/katamari';
import PluginManager from 'tinymce/core/api/PluginManager';
import Commands from './api/Commands';
import UploadSelectedImage from './core/UploadSelectedImage';
import Buttons from './ui/Buttons';
import ContextToolbar from './ui/ContextToolbar';

export default function () {
  PluginManager.add('imagetools', function (editor) {
    const imageUploadTimerState = Cell(0);
    const lastSelectedImageState = Cell(null);

    Commands.register(editor, imageUploadTimerState);
    Buttons.register(editor);
    ContextToolbar.register(editor);

    UploadSelectedImage.setup(editor, imageUploadTimerState, lastSelectedImageState);
  });
}
