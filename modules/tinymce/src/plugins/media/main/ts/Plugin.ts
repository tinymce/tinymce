/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import PluginManager from 'tinymce/core/api/PluginManager';
import Api from './api/Api';
import Commands from './api/Commands';
import FilterContent from './core/FilterContent';
import ResolveName from './core/ResolveName';
import Selection from './core/Selection';
import Buttons from './ui/Buttons';

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
