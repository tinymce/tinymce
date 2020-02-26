/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell } from '@ephox/katamari';
import PluginManager from 'tinymce/core/api/PluginManager';
import * as Commands from './api/Commands';
import * as FilterContent from './core/FilterContent';
import * as Buttons from './ui/Buttons';

export default function () {
  PluginManager.add('fullpage', function (editor) {
    const headState = Cell(''), footState = Cell('');

    Commands.register(editor, headState);
    Buttons.register(editor);
    FilterContent.setup(editor, headState, footState);
  });
}
