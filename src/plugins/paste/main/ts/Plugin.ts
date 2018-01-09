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
import PluginManager from 'tinymce/core/PluginManager';
import DetectProPlugin from './alien/DetectProPlugin';
import Api from './api/Api';
import Commands from './api/Commands';
import Clipboard from './core/Clipboard';
import CutCopy from './core/CutCopy';
import DragDrop from './core/DragDrop';
import PrePostProcess from './core/PrePostProcess';
import Quirks from './core/Quirks';
import Buttons from './ui/Buttons';

var userIsInformedState = Cell(false);

PluginManager.add('paste', function (editor) {
  if (DetectProPlugin.hasProPlugin(editor) === false) {
    var clipboard = new Clipboard(editor);
    var quirks = Quirks.setup(editor);
    var draggingInternallyState = Cell(false);

    Buttons.register(editor, clipboard);
    Commands.register(editor, clipboard, userIsInformedState);
    PrePostProcess.setup(editor);
    CutCopy.register(editor);
    DragDrop.setup(editor, clipboard, draggingInternallyState);

    return Api.get(clipboard, quirks);
  }
});

export default function () { };