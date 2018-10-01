/**
 * Demo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

declare let tinymce: any;

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'help link table paste code emoticons fullpage print fullscreen advlist anchor bbcode colorpicker textcolor',
  toolbar: 'help',
  height: 600,
  menubar: 'view insert tools help'
});

export {};