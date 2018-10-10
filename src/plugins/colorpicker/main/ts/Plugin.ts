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

PluginManager.add('colorpicker', function () {
  console.warn('Color picker plugin is now built in to the core editor, please remove it from your editor configuration');
});

export default function () { }