/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell } from '@ephox/katamari';
import PluginManager from 'tinymce/core/api/PluginManager';
import Commands from './api/Commands';
import Bindings from './core/Bindings';
import Buttons from './ui/Buttons';

PluginManager.add('visualblocks', function (editor, pluginUrl) {
  const enabledState = Cell(false);

  Commands.register(editor, pluginUrl, enabledState);
  Buttons.register(editor, enabledState);
  Bindings.setup(editor, pluginUrl, enabledState);
});

export default function () { }