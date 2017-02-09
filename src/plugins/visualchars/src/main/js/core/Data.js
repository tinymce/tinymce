/**
 * Plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class contains all core logic for the code plugin.
 *
 * @class tinymce.visualchars.Plugin
 * @private
 */
define(
  'tinymce.plugins.visualchars.core.Data',

  [
  ],

  function () {
    var charMap = {
      '\u00a0': 'nbsp',
      '\u00ad': 'shy'
    };

    var charMapToRegExp = function (charMap) {
      var key, regExp = '';

      for (key in charMap) {
        regExp += key;
      }

      return new RegExp('[' + regExp + ']');
    };

    var charMapToSelector = function (charMap) {
      var key, selector = '';

      for (key in charMap) {
        if (selector) {
          selector += ',';
        }
        selector += 'span.mce-' + charMap[key];
      }

      return selector;
    };

    return {
      charMap: charMap,
      regExp: charMapToRegExp(charMap),
      selector: charMapToSelector(charMap)
    };
  }
);