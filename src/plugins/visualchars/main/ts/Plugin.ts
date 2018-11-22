/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell } from '@ephox/katamari';
import PluginManager from 'tinymce/core/api/PluginManager';
import Api from './api/Api';
import Commands from './api/Commands';
import Keyboard from './core/Keyboard';
import * as Buttons from './ui/Buttons';

PluginManager.add('visualchars', function (editor) {
  const toggleState = Cell(false);

  Commands.register(editor, toggleState);
  Buttons.register(editor);
  Keyboard.setup(editor, toggleState);

  return Api.get(toggleState);
});

export default function () {}