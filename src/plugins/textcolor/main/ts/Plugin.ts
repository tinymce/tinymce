/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import PluginManager from 'tinymce/core/api/PluginManager';

PluginManager.add('textcolor', function () {
  console.warn('Text color plugin is now built in to the core editor, please remove it from your editor configuration');
});

export default function () { }