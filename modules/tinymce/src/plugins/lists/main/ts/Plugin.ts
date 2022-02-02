/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import PluginManager from 'tinymce/core/api/PluginManager';

import * as Api from './api/Api';
import * as Commands from './api/Commands';
import * as Keyboard from './core/Keyboard';
import * as Buttons from './ui/Buttons';
import * as MenuItems from './ui/MenuItems';

export default (): void => {
  PluginManager.add('lists', (editor) => {
    if (editor.hasPlugin('rtc', true) === false) {
      Keyboard.setup(editor);
      Commands.register(editor);
    } else {
      Commands.registerDialog(editor);
    }

    Buttons.register(editor);
    MenuItems.register(editor);

    return Api.get(editor);
  });
};
