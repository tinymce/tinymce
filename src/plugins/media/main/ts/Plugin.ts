/**
 * Plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import PluginManager from 'tinymce/core/api/PluginManager';
import Api from './api/Api';
import Commands from './api/Commands';
import FilterContent from './core/FilterContent';
import ResolveName from './core/ResolveName';
import Selection from './core/Selection';
import Buttons from './ui/Buttons';

PluginManager.add('media', function (editor) {
  Commands.register(editor);
  Buttons.register(editor);
  ResolveName.setup(editor);
  FilterContent.setup(editor);
  Selection.setup(editor);
  return Api.get(editor);
});

export default function () { }