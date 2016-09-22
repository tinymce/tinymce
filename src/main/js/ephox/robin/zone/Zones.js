define(
  'ephox.robin.zone.Zones',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.robin.words.Identify',
    'ephox.scullion.Struct'
  ],

  function (Arr, Fun, Identify, Struct) {
    var nu = Struct.immutableBag([ 'elements', 'lang', 'words' ], [ ]);

    var fromWalking = function (universe, groups) {
      var zones = Arr.map(groups, function (group) {
        var elements = group.elements();
        var lang = group.lang();

        var line = Arr.map(elements, function (x) {
          return universe.property().isText(x) ? universe.property().getText(x) : '';
        }).join('');

        var words = Identify.words(line);
        
        return nu({
          lang: lang,
          words: words,
          elements: elements
        });
      });

      return {
        zones: Fun.constant(zones)
      };
    };

    return {
      fromWalking: fromWalking
    };
  }
);