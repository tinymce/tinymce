define(
  'ephox.katamari.api.StringMatch',

  [

  ],

  function () {
    // Change to use ADT?
    var starts = function (value) {
      return folder(function (s, p, c, e, a, n) {
        return s(value);
      });
    };

    var pattern = function (regex) {
      return folder(function (s, p, c, e, a, n) {
        return p(regex);
      });
    };

    var contains = function (value) {
      return folder(function (s, p, c, e, a, n) {
        return c(value);
      });
    };

    var exact = function (value) {
      return folder(function (s, p, c, e, a, n) {
        return e(value);
      });
    };

    var all = function () {
      return folder(function (s, p, c, e, a, n) {
        return a();
      });
    };

    var not = function (sm) {
      return folder(function (s, p, c, e, a, n) {
        return n(sm);
      });
    };

    var folder = function (fold) {
      var matches = function (str) {
        return fold(function (value) {
          return str.toLowerCase().indexOf(value.toLowerCase()) === 0;
        }, function (regex) {
          return regex.test(str.toLowerCase());
        }, function (value) {
          return str.toLowerCase().indexOf(value.toLowerCase()) >= 0;
        }, function (value) {
          return str.toLowerCase() === value.toLowerCase();
        }, function () {
          return true;
        }, function (other) {
          return !other.matches(str);
        });
      };

      return {
        fold: fold,
        matches: matches
      };
    };

    var cata = function (subject, s, p, c, e, a, n) {
      return subject.fold(s, p, c, e, a, n);
    };

    return {
      starts: starts,
      pattern: pattern,
      contains: contains,
      exact: exact,
      all: all,
      not: not,
      cata: cata
    };
  }
);