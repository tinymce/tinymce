/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell } from '@ephox/katamari';

import PluginManager from 'tinymce/core/api/PluginManager';

import * as Api from './api/Api';
import * as Commands from './api/Commands';
import { ScrollInfo } from './core/Actions';
import * as Buttons from './ui/Buttons';

export default (): void => {
  PluginManager.add('fullscreen', (editor) => {
    const fullscreenState = Cell<ScrollInfo | null>(null);

    if (editor.inline) {
      return Api.get(fullscreenState);
    }

    Commands.register(editor, fullscreenState);
    Buttons.register(editor, fullscreenState);

    editor.addShortcut('Meta+Shift+F', '', 'mceFullScreen');

    return Api.get(fullscreenState);
  });
};
