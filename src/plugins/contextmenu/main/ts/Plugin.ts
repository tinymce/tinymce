/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell } from '@ephox/katamari';
import PluginManager from 'tinymce/core/api/PluginManager';
import Api from './api/Api';
import Bind from './core/Bind';

PluginManager.add('contextmenu', function (editor) {
  const menu = Cell(null), visibleState = Cell(false);

  Bind.setup(editor, visibleState, menu);

  return Api.get(visibleState);
});

export default function () { }