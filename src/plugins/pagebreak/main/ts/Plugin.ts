/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import PluginManager from 'tinymce/core/api/PluginManager';
import Commands from './api/Commands';
import FilterContent from './core/FilterContent';
import ResolveName from './core/ResolveName';
import Buttons from './ui/Buttons';

PluginManager.add('pagebreak', function (editor) {
  Commands.register(editor);
  Buttons.register(editor);
  FilterContent.setup(editor);
  ResolveName.setup(editor);
});

export default function () { }