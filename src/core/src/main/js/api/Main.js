/**
 * Main.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Fun } from '@ephox/katamari';
import Tinymce from './Tinymce';

/*eslint consistent-this: 0 */
var context = this || window;

var exportToModuleLoaders = function (tinymce) {
  // Bolt
  if (typeof context.define === "function" && !context.define.amd) {
    context.define("ephox/tinymce", [], Fun.constant(tinymce));
    context.define("tinymce.core.EditorManager", [], Fun.constant(tinymce));
  }

  // CommonJS
  if (typeof module === 'object') {
    /* global module */
    module.exports = tinymce;
  }
};

var exportToWindowGlobal = function (tinymce) {
  window.tinymce = tinymce;
  window.tinyMCE = tinymce;
};

export default <any> function () {
  exportToWindowGlobal(Tinymce);
  exportToModuleLoaders(Tinymce);
  return Tinymce;
};