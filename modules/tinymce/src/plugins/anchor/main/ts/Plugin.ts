/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import PluginManager from 'tinymce/core/api/PluginManager';
import * as Commands from './api/Commands';
import * as FilterContent from './core/FilterContent';
import * as Formats from './core/Formats';
import * as Buttons from './ui/Buttons';

export default () => {
  PluginManager.add('anchor', (editor) => {
    FilterContent.setup(editor);
    Commands.register(editor);
    Buttons.register(editor);

    editor.on('PreInit', () => {
      Formats.registerFormats(editor);
    });
  });
};
