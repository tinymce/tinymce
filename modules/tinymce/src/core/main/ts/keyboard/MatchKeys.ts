/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun, Optional } from '@ephox/katamari';

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

const matchesEvent = (pattern: KeyPattern, evt: KeyboardEvent) => (
  evt.keyCode === pattern.keyCode &&
  evt.shiftKey === pattern.shiftKey &&
  evt.altKey === pattern.altKey &&
  evt.ctrlKey === pattern.ctrlKey &&
  evt.metaKey === pattern.metaKey
);

const match = (patterns: KeyPattern[], evt: KeyboardEvent) =>
  Arr.bind(defaultPatterns(patterns), (pattern) => matchesEvent(pattern, evt) ? [ pattern ] : [ ]);

const action = <T extends (...args: any[]) => any>(f: T, ...x: Parameters<T>) => (): ReturnType<T> => f.apply(null, x);

const execute = (patterns: KeyPattern[], evt: KeyboardEvent): Optional<KeyPattern> =>
  Arr.find(match(patterns, evt), (pattern) => pattern.action());

export {
  match,
  action,
  execute
};
