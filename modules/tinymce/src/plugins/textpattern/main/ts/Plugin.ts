/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell } from '@ephox/katamari';

import PluginManager from 'tinymce/core/api/PluginManager';

import * as Api from './api/Api';
import * as Options from './api/Options';
import * as Keyboard from './keyboard/Keyboard';

export default (): void => {
  PluginManager.add('textpattern', (editor) => {
    Options.register(editor);

    const patternsState = Cell(Options.getPatternSet(editor));
    Keyboard.setup(editor, patternsState);

    return Api.get(patternsState);
  });
};
