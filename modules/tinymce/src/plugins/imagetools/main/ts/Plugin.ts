/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell } from '@ephox/katamari';
import PluginManager from 'tinymce/core/api/PluginManager';
import * as Commands from './api/Commands';
import * as UploadSelectedImage from './core/UploadSelectedImage';
import * as Buttons from './ui/Buttons';
import * as ContextToolbar from './ui/ContextToolbar';

export default () => {
  PluginManager.add('imagetools', (editor) => {
    const imageUploadTimerState = Cell(0);
    const lastSelectedImageState = Cell(null);

    Commands.register(editor, imageUploadTimerState);
    Buttons.register(editor);
    ContextToolbar.register(editor);

    UploadSelectedImage.setup(editor, imageUploadTimerState, lastSelectedImageState);
  });
};
