/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import PluginManager from 'tinymce/core/api/PluginManager';

import Api from './api/Api';
import Commands from './api/Commands';
import * as Autocompletion from './ui/Autocompletion';
import Buttons from './ui/Buttons';
import CharMap from './core/CharMap';

export default function () {
  PluginManager.add('charmap', function (editor) {
    const charMap = CharMap.getCharMap(editor);
    Commands.register(editor, charMap);
    Buttons.register(editor);

    Autocompletion.init(editor, charMap[0]);

    return Api.get(editor);
  });
}
