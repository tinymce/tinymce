define(
  'ephox.katamari.api.Strings',

  [
    'ephox.katamari.util.Validate'
  ],

  function (Validate) {
    //common method
    var checkRange = function(str, substr, start) {
      if (substr === "") return true;
      if (str.length < substr.length) return false;
      var x = str.substr(start, start + substr.length);
      return x === substr;
    };

    /** Given a string and object, perform template-replacements on the string, as specified by the object.
     * Any template fields of the form ${name} are replaced by the string or number specified as obj["name"]
     * Based on Douglas Crockford's 'supplant' method for template-replace of strings. Uses different template format.
     */
    var supplant = function(str, obj) {
      var isStringOrNumber = function(a) {
        var t = typeof a;
        return t === "string" || t === "number";
      };

      return str.replace(/\${([^{}]*)}/g,
        function (a, b) {
          var value = obj[b];
          return isStringOrNumber(value) ? value : a;
        }
      );
    };

    var ignoringCase = function(fn) {
      var map = function(a, fn) {
        var r = [];
        for (var i = 0; i < a.length; i++) r.push(fn(a[i]));
        return r;
      };

      return function() {
        var args = map(arguments, function(x) {
          return typeof x === "string" ? x.toLowerCase() : x;
        });
        return fn.apply(this, args);
      };
    };

    /** Does 'str' start with 'prefix'?
     *  Note: all strings start with the empty string.
     *        More formally, for all strings x, startsWith(x, "").
     *        This is so that for all strings x and y, startsWith(y + x, y)
     */
    var startsWith = function(str, prefix) {
      return checkRange(str, prefix, 0);
    };

    var startsWithIgnoringCase = /* str, prefix */ ignoringCase(startsWith);

    /** Does 'str' end with 'suffix'?
     *  Note: all strings end with the empty string.
     *        More formally, for all strings x, endsWith(x, "").
     *        This is so that for all strings x and y, endsWith(x + y, y)
     */
    var endsWith = function(str, suffix) {
      return checkRange(str, suffix, str.length - suffix.length);
    };

    var endsWithIgnoringCase = /* str, suffix */ ignoringCase(endsWith);

    /** Return the first 'count' letters from 'str'.
     *  e.g. first("abcde", 2) === "ab"
     */
    var first = function(str, count) {
      return str.substr(0, count);
    };

    /** Return the last 'count' letters from 'str'.
     *  e.g. last("abcde", 2) === "de"
     */
    var last = function(str, count) {
      return str.substr(str.length - count, str.length);
    };

    var removeAppendage = function(checkFn, chopFn) {
      return function(str, appendage) {
        return checkFn(str, appendage) ? chopFn(str, str.length - appendage.length) : str;
      };
    };

    var removeLeading = /* str, prefix */ removeAppendage(startsWith, last);
    var removeTrailing = /* str, suffix */ removeAppendage(endsWith, first);

    var append = function(a, b) {
      return a + b;
    };

    var prepend = function(a, b) {
      return b + a;
    };

    var ensureAppendage = function(checkFn, concatter) {
      return function(str, appendage) {
        return checkFn(str, appendage) ? str : concatter(str, appendage);
      };
    };

    var ensureLeading = /* str, prefix */ ensureAppendage(startsWith, prepend);
    var ensureTrailing = /* str, suffix */ ensureAppendage(endsWith, append);

    /** removes all leading and trailing spaces */
    var trim = function(str) {
      return str.replace(/^\s+|\s+$/g, '');
    };

    var lTrim = function(str) {
      return str.replace(/^\s+/g, '');
    };

    var rTrim = function(str) {
      return str.replace(/\s+$/g, '');
    };

    /** Does 'str' contain 'substr'?
     *  Note: all strings contain the empty string.
     */
    var contains = function(str, substr) {
      return str.indexOf(substr) != -1;
    };

    var containsIgnoringCase = /* str, substr */ ignoringCase(contains);

    var htmlEncodeDoubleQuotes = function(str) {
      return str.replace(/\"/gm, "&quot;");
    };

    var equals = function(a, b) {
      return a === b;
    };
    var equalsIgnoringCase = /* a, b */ ignoringCase(equals);

    var head = function(str) {
      if (str === "") throw "head on empty string";
      return str.substr(0, 1);
    };

    var toe = function(str) {
      if (str === "") throw "toe on empty string";
      return str.substr(str.length - 1, str.length);
    };

    var tail = function(str) {
      if (str === "") throw "tail on empty string";
      return str.substr(1, str.length - 1);
    };

    var torso = function(str) {
      if (str === "") throw "torso on empty string";
      return str.substr(0, str.length - 1);
    };

    var capitalize = function(str) {
      if (str === "") return str;
      return head(str).toUpperCase() + tail(str);
    };

    var repeat = function(str, num) {
      Validate.vString('str', str);
      Validate.vNat('num', num);
      var r = '';
      for (var i = 0; i < num; i++) {
        r += str;
      }
      return r;
    };

    var pad = function(combiner) {
      return function(str, c, width) {
        Validate.vString('str', str);
        Validate.vChar('c', c);
        Validate.vNat('width', width);
        var l = str.length;
        return l >= width ? str : combiner(str, repeat(c, width - l));
      };
    };

    var padLeft  = pad(function(s, padding) { return padding + s; });
    var padRight = pad(function(s, padding) { return s + padding; });

    return {
      supplant: supplant,
      startsWith: startsWith,
      startsWithIgnoringCase: startsWithIgnoringCase,
      endsWith: endsWith,
      endsWithIgnoringCase: endsWithIgnoringCase,
      first: first,
      last: last,
      removeLeading: removeLeading,
      removeTrailing: removeTrailing,
      ensureLeading: ensureLeading,
      ensureTrailing: ensureTrailing,
      trim: trim,
      lTrim: lTrim,
      rTrim: rTrim,
      contains: contains,
      containsIgnoringCase: containsIgnoringCase,
      htmlEncodeDoubleQuotes: htmlEncodeDoubleQuotes,
      equals: equals,
      equalsIgnoringCase: equalsIgnoringCase,
      head: head,
      repead: repeat,
      padLeft: padLeft,
      padRight: padRight,
      toe: toe,
      tail: tail,
      torso: torso,
      capitalize: capitalize
    };
  }
);
