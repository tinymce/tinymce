/**
 * Demo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import HelpPlugin from 'tinymce/plugins/help/Plugin';
import PluginManager from 'tinymce/core/PluginManager';

declare let tinymce: any;

HelpPlugin();

PluginManager.urls.help = '../../../../../js/tinymce/plugins/help';

tinymce.init({
  selector: 'textarea.tinymce',
  theme: 'modern',
  skin_url: '../../../../../js/tinymce/skins/lightgray',
  plugins: 'help link table paste code emoticons fullpage print fullscreen advlist anchor bbcode colorpicker textcolor',
  toolbar: 'help',
  height: 600
});