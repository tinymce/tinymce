define(
  'ephox.phoenix.search.Pattern',

  [
    'ephox.scullion.Struct'
  ],

  function (Struct) {
    var nu = Struct.immutable('term', 'length');

    var token = function (x) {
      return nu(x, x.length);
    };

    var word = function (w) {
      var term = new RegExp('\\b' + w + '\\b', 'g');
      // var term = new RegExp('(?=.*\\w)' + w + '($|[,;?\\.\\s])', 'g');
      return nu(term, w.length);
    };

    return {
      token: token,
      word: word
    };
  }
);
