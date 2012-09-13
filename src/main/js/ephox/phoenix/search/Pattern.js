define(
  'ephox.phoenix.search.Pattern',

  [
    'ephox.peanut.Fun',
    'ephox.phoenix.search.Wordbreak',
    'ephox.scullion.Struct'
  ],

  function (Fun, Wordbreak, Struct) {
    var nu = Struct.immutable('term', 'length', 'offset');

    var token = function (x) {
      return nu(x, x.length, Fun.constant(0));
    };

    var word = function (w) {
      var term = new RegExp('((^|[' + Wordbreak.chars() + ']+))' + w + '(($|[' + Wordbreak.chars() + ']+))', 'g');
      var plain = new RegExp('(?:^|[' + Wordbreak.chars() + ']+)' + w + '(?:$|[' + Wordbreak.chars() + ']+)', 'g');

      // var term = new RegExp('(?=.*\\w)' + w + '($|[,;?\\.\\s])', 'g');
      return nu(plain, w.length, function (s) {
        var matches = term.exec(s);
        return matches && matches.length > 1 ? matches[1].length : 0;
      });
    };

    return {
      token: token,
      word: word
    };
  }
);
