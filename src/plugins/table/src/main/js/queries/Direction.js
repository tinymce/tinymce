/**
 * Direction.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.table.queries.Direction',

  [
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.properties.Direction'
  ],

  function (Fun, Direction) {
    var ltr = {
      isRtl: Fun.constant(false)
    };

    var rtl = {
      isRtl: Fun.constant(true)
    };

    // Get the directionality from the position in the content
    var directionAt = function (element) {
      var dir = Direction.getDirection(element);
      return dir === 'rtl' ? rtl : ltr;
    };

    return {
      directionAt: directionAt
    };
  }
);
