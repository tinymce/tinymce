define(
  'ephox.katamari.str.StringParts',

  [
    'ephox.katamari.api.Option',
    'global!Error'
  ],

  function (Option, Error) {
    /** Return the first 'count' letters from 'str'.
-     *  e.g. first("abcde", 2) === "ab"
-     */
    var first = function(str, count) {
     return str.substr(0, count);
    };

    /** Return the last 'count' letters from 'str'.
    *  e.g. last("abcde", 2) === "de"
    */
    var last = function(str, count) {
     return str.substr(str.length - count, str.length);
    };

    var head = function(str) {
      return str === '' ? Option.none() : Option.some(str.substr(0, 1));
    };

    var tail = function(str) {
      return str === '' ? Option.none() : Option.some(str.substring(1));
    };

    return {
      first: first,
      last: last,
      head: head,
      tail: tail
    };
  }
);