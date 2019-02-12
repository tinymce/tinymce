export interface PRegExp {
  term: () => RegExp;
  prefix: (match: RegExpExecArray) => number;
  suffix: (match: RegExpExecArray) => number;
}

export interface PRange {
  start: () => number;
  finish: () => number;
}