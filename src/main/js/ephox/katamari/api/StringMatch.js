define(
  'ephox.katamari.api.StringMatch',

  [
    'ephox.katamari.api.Adt'
  ],

  function (Adt) {
    var adt = Adt.generate([
      { starts: [ 'value', 'f' ] },
      { pattern: [ 'regex', 'f' ] },
      { contains: [ 'value', 'f' ] },
      { exact: [ 'value', 'f' ] },
      { all: [ ] },
      { not: [ 'stringMatch' ] }
    ]);

    var caseInsensitive = function (val) {
      return val.toLowerCase();
    };

    var caseSensitive = function (val) {
      return val;
    };

    /** matches :: (StringMatch, String) -> Boolean */
    var matches = function (subject, str) {
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

    var cata = function (subject, s, p, c, e, a, n) {
      return subject.fold(s, p, c, e, a, n);
    };

    return {
      starts: adt.starts,
      pattern: adt.pattern,
      contains: adt.contains,
      exact: adt.exact,
      all: adt.all,
      not: adt.not,
      cata: cata,
      matches: matches,
      caseSensitive: caseSensitive,
      caseInsensitive: caseInsensitive
    };
  }
);