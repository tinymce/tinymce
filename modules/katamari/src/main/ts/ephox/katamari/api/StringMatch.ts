import { Adt } from './Adt';
import * as Fun from './Fun';

type StringMapper = (str: string) => string;

export interface StringMatch {
  fold: <T>(
    starts: (value: string, f: StringMapper) => T,
    pattern: (regex: RegExp, f: StringMapper) => T,
    contains: (value: string, f: StringMapper) => T,
    exact: (value: string, f: StringMapper) => T,
    all: () => T,
    not: (other: StringMatch) => T
  ) => T;
  match: <T>(branches: {
    starts: (value: string, f: StringMapper) => T;
    pattern: (regex: RegExp, f: StringMapper) => T;
    contains: (value: string, f: StringMapper) => T;
    exact: (value: string, f: StringMapper) => T;
    all: () => T;
    not: (other: StringMatch) => T;
  }) => T;
  log: (label: string) => void;
}

const adt = Adt.generate<{
  starts: (value: string, f: StringMapper) => StringMatch;
  pattern: (regex: RegExp, f: StringMapper) => StringMatch;
  contains: (value: string, f: StringMapper) => StringMatch;
  exact: (value: string, f: StringMapper) => StringMatch;
  all: () => StringMatch;
  not: (stringMatch: StringMatch) => StringMatch;
}>([
      { starts: [ 'value', 'f' ] },
      { pattern: [ 'regex', 'f' ] },
      { contains: [ 'value', 'f' ] },
      { exact: [ 'value', 'f' ] },
      { all: [ ] },
      { not: [ 'stringMatch' ] }
    ]);

const caseInsensitive = (val: string): string => {
  return val.toLowerCase();
};

const caseSensitive: (val: string) => string = Fun.identity;

/** matches :: (StringMatch, String) -> Boolean */
const matches = (subject: StringMatch, str: string): boolean => {
  return subject.fold(
    (value, f) => f(str).indexOf(f(value)) === 0,
    (regex, f) => regex.test(f(str)),
    (value, f) => f(str).indexOf(f(value)) >= 0,
    (value, f) => f(str) === f(value),
    Fun.always,
    (other) => !matches(other, str)
  );
};

const cata = <T>(
  subject: StringMatch,
  s: (value: string, f: StringMapper) => T,
  p: (regex: RegExp, f: StringMapper) => T,
  c: (value: string, f: StringMapper) => T,
  e: (value: string, f: StringMapper) => T,
  a: () => T,
  n: (other: StringMatch) => T
): T => {
  return subject.fold<T>(s, p, c, e, a, n);
};

export const StringMatch = {
  starts: adt.starts,
  pattern: adt.pattern,
  contains: adt.contains,
  exact: adt.exact,
  all: adt.all,
  not: adt.not,
  cata,
  matches,
  caseSensitive,
  caseInsensitive
};
