/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import PluginManager from 'tinymce/core/api/PluginManager';
import * as Api from './api/Api';
import * as Wordcounter from './core/WordCounter';
import * as Buttons from './ui/Buttons';

export default function () {
  PluginManager.add('wordcount', (editor) => {
    const api = Api.get(editor);

    Buttons.register(editor, api);
    Wordcounter.setup(editor, api);
    return api;
  });
}
