/**
 * MatchKeys.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Arr, Fun, Merger, Option } from '@ephox/katamari';
import { KeyboardEvent } from '@ephox/dom-globals';

export interface KeyPattern {
  shiftKey?: boolean;
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  keyCode?: number;
  action: () => boolean;
}

const defaultPatterns = (patterns: KeyPattern[]): KeyPattern[] => {
  return Arr.map(patterns, (pattern) => {
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

const matchesEvent = function (pattern: KeyPattern, evt: KeyboardEvent) {
  return (
    evt.keyCode === pattern.keyCode &&
    evt.shiftKey === pattern.shiftKey &&
    evt.altKey === pattern.altKey &&
    evt.ctrlKey === pattern.ctrlKey &&
    evt.metaKey === pattern.metaKey
  );
};

const match = function (patterns: KeyPattern[], evt: KeyboardEvent) {
  return Arr.bind(defaultPatterns(patterns), (pattern) => {
    return matchesEvent(pattern, evt) ? [pattern] : [ ];
  });
};

const action = function (f, ...x: any[]) {
  const args = Array.prototype.slice.call(arguments, 1);
  return function () {
    return f.apply(null, args);
  };
};

const execute = function (patterns: KeyPattern[], evt: KeyboardEvent): Option<KeyPattern> {
  return Arr.find(match(patterns, evt), (pattern) => pattern.action());
};

export default {
  match,
  action,
  execute
};