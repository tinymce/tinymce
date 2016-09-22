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
        var details = group.details();
        var lang = group.lang();

        var line = Arr.map(details, function (x) {
          return x.text();
        }).join('');

        var elements = Arr.map(details, function (x) {
          return x.item();
        });

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