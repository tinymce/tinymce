/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import PluginManager from 'tinymce/core/api/PluginManager';
import Commands from './api/Commands';
import FilterContent from './core/FilterContent';
import Buttons from './ui/Buttons';

export default function () {
  PluginManager.add('template', function (editor) {
    Buttons.register(editor);
    Commands.register(editor);
    FilterContent.setup(editor);
  });
}
