/**
 * Plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
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