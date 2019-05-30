/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell } from '@ephox/katamari';
import PluginManager from 'tinymce/core/api/PluginManager';
import Api from './api/Api';
import Commands from './api/Commands';
import Buttons from './ui/Buttons';

PluginManager.add('searchreplace', function (editor) {
  const currentIndexState = Cell(-1);

  Commands.register(editor, currentIndexState);
  Buttons.register(editor, currentIndexState);

  return Api.get(editor, currentIndexState);
});

export default function () { }