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
import * as Settings from './api/Settings';
import * as Bindings from './core/Bindings';
import * as Keyboard from './core/Keyboard';
import * as Buttons from './ui/Buttons';

export default () => {
  PluginManager.add('visualchars', (editor) => {
    const toggleState = Cell(Settings.isEnabledByDefault(editor));

    Commands.register(editor, toggleState);
    Buttons.register(editor, toggleState);
    Keyboard.setup(editor, toggleState);
    Bindings.setup(editor, toggleState);

    return Api.get(toggleState);
  });
};
