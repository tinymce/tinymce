/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell } from '@ephox/katamari';
import PluginManager from 'tinymce/core/api/PluginManager';
import Commands from './api/Commands';
import FilterContent from './core/FilterContent';
import Buttons from './ui/Buttons';

PluginManager.add('fullpage', function (editor) {
  const headState = Cell(''), footState = Cell('');

  Commands.register(editor, headState);
  Buttons.register(editor);
  FilterContent.setup(editor, headState, footState);
});

export default function () { }