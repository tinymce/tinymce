define(
  'ephox.phoenix.util.str.Expand',

  [
    'ephox.phoenix.search.Chars'
  ],

  function (Chars) {

    var by = function (text, offset, pred) {
      if (text.length <= 1) return text;
      
      var earlier = '';
      for (var i = Math.min(text.length, offset) - 1; i >= 0; i--) {
        if (pred(text, i)) {
          earlier = text[i] + earlier;
        } else {
          break;
        }
      }

      var after = '';
      for (var j = offset + 1; j < text.length; j++) {
        if (pred(text, j)) {
          after = after + text[j];
        } else {
          break;
        }
      }

      var current = text[offset] !== undefined ? text[offset] : '';
      return earlier + current + after;
    };

    var word = function (text, offset) {
      var regex = new RegExp(Chars.wordchar(), 'gi');
      
      return by(text, offset, function (s, i) {
        return s[i].search(regex) > -1;
      });
    };

    return {
      by: by,
      word: word
    };

  }
);
