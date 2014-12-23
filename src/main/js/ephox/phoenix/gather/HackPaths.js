define(
  'ephox.phoenix.gather.HackPaths',

  [
    'ephox.phoenix.gather.Hacksy',
    'ephox.scullion.Struct'
  ],

  function (Hacksy, Struct) {
    var sss = Struct.immutable('item', 'start', 'finish');

    var all = function (universe, item) {
      return sss(item, 0, universe.property().getText(item).length);
    };

    var words = function (universe, item, mode, direction) {
      // This will be pseudo code ... but let's see how far I can get.
      var base = universe.property().isText(item) ? [ all(universe, item) ] : [];

      var next = Hacksy.go(universe, item, mode, direction);
      var rest = next.map(function (n) {
        console.log('next: ', n.item().id);
        // if we are at a boundary tag or an empty tag, break.
        if (universe.property().isBoundary(n.item()) || universe.property().isEmptyTag(n.item())) return [];
        // If there is a space in the word, split
        else if (universe.property().isText(n.item())) {
          var text = universe.property().getText(n.item());
          return direction.substring(text).fold(function () {
            console.log('no word break in: [' + text + ']');
            return [ sss(n.item(), 0, text.length) ].concat(words(universe, n.item(), n.mode(), direction));
          }, function (subs) {
            console.log('word break in: [' + text + ']', subs);
            return subs[0] !== subs[1] ? [ sss(n.item(), subs[0], subs[1]) ] : [];
          });
        } else {
          // keeping going.
          return words(universe, n.item(), n.mode(), direction);
        }
      }).getOr([]);

      return direction.concat(base, rest);
    };

    return {
      words: words
    };
  }
);