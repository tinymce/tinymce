/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { KeyboardEvent } from '@ephox/dom-globals';
import { Arr, Fun, Option } from '@ephox/katamari';

export interface KeyPattern {
  shiftKey?: boolean;
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  keyCode?: number;
  action: () => boolean;
}

const defaultPatterns = (patterns: KeyPattern[]): KeyPattern[] => Arr.map(patterns, (pattern) => ({
  shiftKey: false,
  altKey: false,
  ctrlKey: false,
  metaKey: false,
  keyCode: 0,
  action: Fun.noop,
  ...pattern
}));

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
  return Arr.bind(defaultPatterns(patterns), (pattern) => matchesEvent(pattern, evt) ? [ pattern ] : [ ]);
};

const action = function (f, ...x: any[]) {
  return function () {
    return f.apply(null, x);
  };
};

const execute = function (patterns: KeyPattern[], evt: KeyboardEvent): Option<KeyPattern> {
  return Arr.find(match(patterns, evt), (pattern) => pattern.action());
};

export {
  match,
  action,
  execute
};
