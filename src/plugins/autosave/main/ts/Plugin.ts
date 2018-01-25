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
import BeforeUnload from './core/BeforeUnload';
import Buttons from './ui/Buttons';

/**
 * This class contains all core logic for the autosave plugin.
 *
 * @class tinymce.autosave.Plugin
 * @private
 */

PluginManager.add('autosave', function (editor) {
  const started = Cell(false);

  BeforeUnload.setup(editor);
  Buttons.register(editor, started);

  return Api.get(editor);
});

export default function () { }