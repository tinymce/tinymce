/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import PluginManager from 'tinymce/core/api/PluginManager';
import FilterContent from './core/FilterContent';

PluginManager.add('noneditable', function (editor) {
  FilterContent.setup(editor);
});

export default function () { }