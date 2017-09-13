/**
 * Main.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.api.Main',
  [
    'ephox.katamari.api.Fun',
    'global!window',
    'tinymce.core.api.Tinymce'
  ],
  function (Fun, window, Tinymce) {
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

    return function () {
      exportToWindowGlobal(Tinymce);
      exportToModuleLoaders(Tinymce);
      return Tinymce;
    };
  }
);
