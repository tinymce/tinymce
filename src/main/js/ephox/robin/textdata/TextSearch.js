define(
  'ephox.robin.textdata.TextSearch',

  [
    'ephox.bud.Unicode',
    'ephox.compass.Arr',
    'ephox.perhaps.Option',
    'ephox.scullion.Struct',
    'global!RegExp'
  ],

  function (Unicode, Arr, Option, Struct, RegExp) {
    var charpos = Struct.immutable('ch', 'offset');

    var locate = function (text, offset) {
      return charpos(text.charAt(offset), offset);
    };

    var previous = function (text, offsetOption) {
      var max = offsetOption.getOr(text.length);
      for (var i = max - 1; i >= 0; i--) {
        if (text.charAt(i) !== Unicode.zeroWidth()) return Option.some(locate(text, i));
      }
      return Option.none();
    };

    var next = function (text, offsetOption) {
      var min = offsetOption.getOr(0);
      for (var i = min + 1; i < text.length; i++) {
        if (text.charAt(i) !== Unicode.zeroWidth()) return Option.some(locate(text, i));
      }
      return Option.none();
    };

    var rfind = function (str, regex) {
      regex.lastIndex = -1;
      var reversed = Arr.reverse(str).join('');
      var match = reversed.match(regex);
      return match !== undefined && match !== null && match.index >= 0 ? Option.some((reversed.length - 1) - match.index) : Option.none();
    };

    var lfind = function (str, regex) {
      regex.lastIndex = -1;
      var match = str.match(regex);
      return match !== undefined && match !== null && match.index >= 0 ? Option.some(match.index) : Option.none();
    };

    return {
      previous: previous,
      next: next,
      rfind: rfind,
      lfind: lfind
    };
  }
);