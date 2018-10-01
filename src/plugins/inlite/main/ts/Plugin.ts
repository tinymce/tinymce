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
import { default as InsertButtons } from './insert/Buttons';
import { default as InsertToolbars } from './insert/Toolbars';

import { default as SelectionButtons } from './selection/Buttons';
import { default as SelectionToolbars } from './selection/Toolbars';

PluginManager.add('inlite', function (editor) {
  InsertButtons.setupButtons(editor);
  InsertToolbars.addToEditor(editor);

  SelectionButtons.setupButtons(editor);
  SelectionToolbars.addToEditor(editor);
});

export default function () { }