/**
 * Plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Cell from '@ephox/katamari/lib/main/ts/ephox/katamari/api/Cell';
import PluginManager from 'tinymce/core/PluginManager';
import Api from './api/Api';
import Settings from './api/Settings';
import Keyboard from './core/Keyboard';

PluginManager.add('textpattern', function (editor) {
  var patternsState = Cell(Settings.getPatterns(editor.settings));

  Keyboard.setup(editor, patternsState);

  return Api.get(patternsState);
});

export default <any> function () { };