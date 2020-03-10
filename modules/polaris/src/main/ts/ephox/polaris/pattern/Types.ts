export interface PRegExp {
  readonly term: () => RegExp;
  readonly prefix: (match: RegExpExecArray) => number;
  readonly suffix: (match: RegExpExecArray) => number;
}

export interface PRange {
  readonly start: () => number;
  readonly finish: () => number;
}
