/**
 * MatchKeys.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Merger } from '@ephox/katamari';

const defaultPatterns = function (patterns) {
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

const matchesEvent = function (pattern, evt) {
  return (
    evt.keyCode === pattern.keyCode &&
    evt.shiftKey === pattern.shiftKey &&
    evt.altKey === pattern.altKey &&
    evt.ctrlKey === pattern.ctrlKey &&
    evt.metaKey === pattern.metaKey
  );
};

const match = function (patterns, evt) {
  return Arr.bind(defaultPatterns(patterns), function (pattern) {
    return matchesEvent(pattern, evt) ? [pattern] : [ ];
  });
};

const action = function (f, ...x: any[]) {
  const args = Array.prototype.slice.call(arguments, 1);
  return function () {
    return f.apply(null, args);
  };
};

const execute = function (patterns, evt) {
  return Arr.find(match(patterns, evt), function (pattern) {
    return pattern.action();
  });
};

export default {
  match,
  action,
  execute
};