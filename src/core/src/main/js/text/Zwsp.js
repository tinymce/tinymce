/**
 * Zwsp.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Utility functions for working with zero width space
 * characters used as character containers etc.
 *
 * @private
 * @class tinymce.text.Zwsp
 * @example
 * var isZwsp = Zwsp.isZwsp('\uFEFF');
 * var abc = Zwsp.trim('a\uFEFFc');
 */
define(
  'tinymce.core.text.Zwsp',
  [
  ],
  function () {
    // This is technically not a ZWSP but a ZWNBSP or a BYTE ORDER MARK it used to be a ZWSP
    var ZWSP = '\uFEFF';

    var isZwsp = function (chr) {
      return chr === ZWSP;
    };

    var trim = function (text) {
      return text.replace(new RegExp(ZWSP, 'g'), '');
    };

    return {
      isZwsp: isZwsp,
      ZWSP: ZWSP,
      trim: trim
    };
  }
);