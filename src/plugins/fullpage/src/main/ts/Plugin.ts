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
import Commands from './api/Commands';
import FilterContent from './core/FilterContent';
import Buttons from './ui/Buttons';

PluginManager.add('fullpage', function (editor) {
  var headState = Cell(''), footState = Cell('');

  Commands.register(editor, headState);
  Buttons.register(editor);
  FilterContent.setup(editor, headState, footState);
});

export default <any> function () { };