/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell } from '@ephox/katamari';
import PluginManager from 'tinymce/core/api/PluginManager';
import DetectProPlugin from './alien/DetectProPlugin';
import Api from './api/Api';
import Commands from './api/Commands';
import { Clipboard } from './api/Clipboard';
import CutCopy from './core/CutCopy';
import DragDrop from './core/DragDrop';
import PrePostProcess from './core/PrePostProcess';
import Quirks from './core/Quirks';
import Buttons from './ui/Buttons';
import Settings from './api/Settings';

export default function () {
  PluginManager.add('paste', function (editor) {
    if (DetectProPlugin.hasProPlugin(editor) === false) {
      const draggingInternallyState = Cell(false);
      const pasteFormat = Cell(Settings.isPasteAsTextEnabled(editor) ? 'text' : 'html');
      const clipboard = Clipboard(editor, pasteFormat);
      const quirks = Quirks.setup(editor);

      Buttons.register(editor, clipboard);
      Commands.register(editor, clipboard);
      PrePostProcess.setup(editor);
      CutCopy.register(editor);
      DragDrop.setup(editor, clipboard, draggingInternallyState);

      return Api.get(clipboard, quirks);
    }
  });
}
