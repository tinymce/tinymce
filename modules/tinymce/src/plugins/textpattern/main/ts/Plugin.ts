/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell } from '@ephox/katamari';
import PluginManager from 'tinymce/core/api/PluginManager';
import * as Api from './api/Api';
import * as Settings from './api/Settings';
import * as Keyboard from './keyboard/Keyboard';

export default () => {
  PluginManager.add('textpattern', (editor) => {
    const patternsState = Cell(Settings.getPatternSet(editor));

    Keyboard.setup(editor, patternsState);

    return Api.get(patternsState);
  });
};
