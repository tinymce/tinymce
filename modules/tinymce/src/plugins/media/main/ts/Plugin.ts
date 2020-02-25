/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import PluginManager from 'tinymce/core/api/PluginManager';
import * as Api from './api/Api';
import * as Commands from './api/Commands';
import * as FilterContent from './core/FilterContent';
import * as ResolveName from './core/ResolveName';
import * as Selection from './core/Selection';
import * as Buttons from './ui/Buttons';

export default function () {
  PluginManager.add('media', function (editor) {
    Commands.register(editor);
    Buttons.register(editor);
    ResolveName.setup(editor);
    FilterContent.setup(editor);
    Selection.setup(editor);
    return Api.get(editor);
  });
}
