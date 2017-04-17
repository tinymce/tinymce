/**
 * LazyEvaluator.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.util.LazyEvaluator',
  [
    'ephox.katamari.api.Option'
  ],
  function (Option) {
    var evaluateUntil = function (fns, args) {
      for (var i = 0; i < fns.length; i++) {
        var result = fns[i].apply(null, args);
        if (result.isSome()) {
          return result;
        }
      }

      return Option.none();
    };

    return {
      evaluateUntil: evaluateUntil
    };
  }
);