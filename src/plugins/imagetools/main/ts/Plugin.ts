/**
 * Plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Cell } from '@ephox/katamari';
import PluginManager from 'tinymce/core/api/PluginManager';
import Commands from './api/Commands';
import UploadSelectedImage from './core/UploadSelectedImage';
import Buttons from './ui/Buttons';
import ContextToolbar from './ui/ContextToolbar';

PluginManager.add('imagetools', function (editor) {
  const imageUploadTimerState = Cell(0);
  const lastSelectedImageState = Cell(null);

  Commands.register(editor, imageUploadTimerState);
  Buttons.register(editor);
  ContextToolbar.register(editor);

  UploadSelectedImage.setup(editor, imageUploadTimerState, lastSelectedImageState);
});

export default function () { }