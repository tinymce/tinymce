import { Adt } from './Adt';

type StringMapper = (str: string) => string;

export interface StringMatch {
  fold: <T>(
    starts:(value: string, f: StringMapper) => T,
    pattern: (regex: RegExp, f: StringMapper) => T,
    contains: (value: string, f: StringMapper) => T,
    exact: (value: string, f: StringMapper) => T,
    all: () => T,
    not: (other: StringMatch) => T
  ) => T;
};

var adt = Adt.generate([
  { starts: [ 'value', 'f' ] },
  { pattern: [ 'regex', 'f' ] },
  { contains: [ 'value', 'f' ] },
  { exact: [ 'value', 'f' ] },
  { all: [ ] },
  { not: [ 'stringMatch' ] }
]);

var caseInsensitive = function (val: string) {
  return val.toLowerCase();
};

var caseSensitive = function (val: string) {
  return val;
};

/** matches :: (StringMatch, String) -> Boolean */
var matches = function (subject: StringMatch, str: string): boolean {
  return subject.fold(function (value, f) {
    return f(str).indexOf(f(value)) === 0;
  }, function (regex, f) {
    return regex.test(f(str));
  }, function (value, f) {
    return f(str).indexOf(f(value)) >= 0;
  }, function (value, f) {
    return f(str) === f(value);
  }, function () {
    return true;
  }, function (other) {
    return !matches(other, str);
  });
};

var cata = function <T>(
  subject: StringMatch,
  s:(value: string, f: StringMapper) => T,
  p: (regex: RegExp, f: StringMapper) => T,
  c: (value: string, f: StringMapper) => T,
  e: (value: string, f: StringMapper) => T,
  a: () => T,
  n: (other: StringMatch) => T
) {
  return subject.fold<T>(s, p, c, e, a, n);
};

export const StringMatch = {
  starts: <(value: string, f: StringMapper) => StringMatch>adt.starts,
  pattern: <(regex: RegExp, f: StringMapper) => StringMatch>adt.pattern,
  contains: <(value: string, f: StringMapper) => StringMatch>adt.contains,
  exact: <(value: string, f: StringMapper) => StringMatch>adt.exact,
  all: <() => StringMatch>adt.all,
  not: <(stringMatch: StringMatch) => StringMatch>adt.not,
  cata: cata,
  matches: matches,
  caseSensitive: caseSensitive,
  caseInsensitive: caseInsensitive
};