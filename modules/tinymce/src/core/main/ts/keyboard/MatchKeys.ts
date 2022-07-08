import { Arr, Optional } from '@ephox/katamari';

interface KeyPatternBase {
  shiftKey?: boolean;
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  keyCode?: number;
}

export interface KeyPattern extends KeyPatternBase {
  action: () => boolean;
}
export interface KeyPatternDelayed extends KeyPatternBase {
  action: () => Optional<() => void>;
}

const baseKeyPattern = {
  shiftKey: false,
  altKey: false,
  ctrlKey: false,
  metaKey: false,
  keyCode: 0
};

const defaultPatterns = (patterns: KeyPattern[]): Required<KeyPattern>[] =>
  Arr.map(patterns, (pattern) => ({
    ...baseKeyPattern,
    ...pattern
  }));

const defaultDelayedPatterns = (patterns: KeyPatternDelayed[]): Required<KeyPatternDelayed>[] =>
  Arr.map(patterns, (pattern) => ({
    ...baseKeyPattern,
    ...pattern
  }));

const matchesEvent = <T extends KeyPatternBase>(pattern: T, evt: KeyboardEvent) => (
  evt.keyCode === pattern.keyCode &&
  evt.shiftKey === pattern.shiftKey &&
  evt.altKey === pattern.altKey &&
  evt.ctrlKey === pattern.ctrlKey &&
  evt.metaKey === pattern.metaKey
);

const match = (patterns: KeyPattern[], evt: KeyboardEvent): Required<KeyPattern>[] =>
  Arr.bind(defaultPatterns(patterns), (pattern) => matchesEvent(pattern, evt) ? [ pattern ] : [ ]);

const matchDelayed = (patterns: KeyPatternDelayed[], evt: KeyboardEvent): Required<KeyPatternDelayed>[] =>
  Arr.bind(defaultDelayedPatterns(patterns), (pattern) => matchesEvent(pattern, evt) ? [ pattern ] : [ ]);

const action = <T extends (...args: any[]) => any>(f: T, ...x: Parameters<T>) => (): ReturnType<T> => f.apply(null, x);

const execute = (patterns: KeyPattern[], evt: KeyboardEvent): Optional<Required<KeyPattern>> =>
  Arr.find(match(patterns, evt), (pattern) => pattern.action());

const executeWithDelayedAction = (patterns: KeyPatternDelayed[], evt: KeyboardEvent): Optional<() => void> =>
  Arr.findMap(matchDelayed(patterns, evt), (pattern) => pattern.action());

export {
  match,
  action,
  execute,
  executeWithDelayedAction
};
