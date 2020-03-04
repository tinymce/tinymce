/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell } from '@ephox/katamari';
import PluginManager from 'tinymce/core/api/PluginManager';
import * as Commands from './api/Commands';
import * as Bindings from './core/Bindings';
import * as Buttons from './ui/Buttons';

export default function () {
  PluginManager.add('visualblocks', (editor, pluginUrl) => {
    const enabledState = Cell(false);

    Commands.register(editor, pluginUrl, enabledState);
    Buttons.register(editor, enabledState);
    Bindings.setup(editor, pluginUrl, enabledState);
  });
}
