/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import PluginManager from 'tinymce/core/api/PluginManager';
import Api from './api/Api';
import Statusbar from './ui/Statusbar';

PluginManager.add('wordcount', function (editor) {
  Statusbar.setup(editor);
  return Api.get(editor);
});

export default function () { }