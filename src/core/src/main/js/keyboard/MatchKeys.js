/**
 * MatchKeys.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.keyboard.MatchKeys',
  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Merger'
  ],
  function (Arr, Fun, Merger) {
    var defaultPatterns = function (patterns) {
      return Arr.map(patterns, function (pattern) {
        return Merger.merge({
          shiftKey: false,
          altKey: false,
          ctrlKey: false,
          metaKey: false,
          keyCode: 0,
          action: Fun.noop
        }, pattern);
      });
    };

    var matchesEvent = function (pattern, evt) {
      return (
        evt.keyCode === pattern.keyCode &&
        evt.shiftKey === pattern.shiftKey &&
        evt.altKey === pattern.altKey &&
        evt.ctrlKey === pattern.ctrlKey &&
        evt.metaKey === pattern.metaKey
      );
    };

    var match = function (patterns, evt) {
      return Arr.bind(defaultPatterns(patterns), function (pattern) {
        return matchesEvent(pattern, evt) ? [pattern] : [ ];
      });
    };

    var action = function (f) {
      var args = Array.prototype.slice.call(arguments, 1);
      return function () {
        return f.apply(null, args);
      };
    };

    return {
      match: match,
      action: action
    };
  }
);