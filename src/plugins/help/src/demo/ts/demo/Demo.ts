/**
 * Demo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import EditorManager from 'tinymce/core/EditorManager';
import PluginManager from 'tinymce/core/PluginManager';
import HelpPlugin from 'tinymce/plugins/help/Plugin';
import LinkPlugin from 'tinymce/plugins/link/Plugin';
import TablePlugin from 'tinymce/plugins/table/Plugin';
import PastePlugin from 'tinymce/plugins/paste/Plugin';
import CodePlugin from 'tinymce/plugins/code/Plugin';
import EmoticonsPlugin from 'tinymce/plugins/emoticons/Plugin';
import FullpagePlugin from 'tinymce/plugins/fullpage/Plugin';
import PrintPlugin from 'tinymce/plugins/print/Plugin';
import FullscreenPlugin from 'tinymce/plugins/fullscreen/Plugin';
import AdvListPlugin from 'tinymce/plugins/advlist/Plugin';
import AnchorPlugin from 'tinymce/plugins/anchor/Plugin';
import BBcodePlugin from 'tinymce/plugins/bbcode/Plugin';
import ColorpickerPlugin from 'tinymce/plugins/colorpicker/Plugin';
import TextcolorPlugin from 'tinymce/plugins/textcolor/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';

/*eslint no-console:0 */



export default <any> function () {
  HelpPlugin();
  ModernTheme();
  LinkPlugin();
  TablePlugin();
  PastePlugin();
  CodePlugin();
  EmoticonsPlugin();
  FullpagePlugin();
  PrintPlugin();
  FullscreenPlugin();
  AdvListPlugin();
  AnchorPlugin();
  BBcodePlugin();
  ColorpickerPlugin();
  TextcolorPlugin();


  PluginManager.urls.help = '../../../dist/help';

  EditorManager.init({
    selector: "textarea.tinymce",
    theme: "modern",
    skin_url: "../../../../../skins/lightgray/dist/lightgray",
    plugins: "help link table paste code emoticons fullpage print fullscreen advlist anchor bbcode colorpicker textcolor",
    toolbar: "help",
    height: 600
  });
};