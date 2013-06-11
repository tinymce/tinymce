define(
  'ephox.robin.words.Cluster',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.phoenix.api.data.Spot',
    'ephox.phoenix.api.general.Extract',
    'ephox.phoenix.api.general.Gather',
    'ephox.polaris.api.Arrays',
    'ephox.robin.api.general.Zone',
    'ephox.robin.words.Identify',
    'ephox.robin.words.Prune',
    'ephox.robin.words.Transform'
  ],

  function (Arr, Fun, Spot, Extract, Gather, Arrays, Zone, Identify, Prune, Transform) {
    var generate = function (universe, element) {
      var prune = Prune(universe);
      var gathered = Gather.gather(universe, element, prune, Transform(universe));
      var left = gathered.left();
      var right = gathered.right();

      var inner = Extract.all(universe, element);
      var middle = Arr.map(inner, function (x) {
        return Spot.text(x, universe.property().isText(x) ? universe.property().getText(x) : '');
      });

      var elements = left.concat(middle).concat(right);
      var groups = Arrays.splitby(elements, function (x) {
        var elem = x.element();
        return universe.property().isBoundary(elem) || universe.property().isEmptyTag(elem);
      });

      var words = Arr.bind(groups, function (x) {
        var text = Arr.bind(x, function (y) {
          return y.text();
        }).join('');
        return Identify.words(text);
      });

      var baseElements = Arr.map(elements, function (x) {
        return x.element();
      });
      var zone = Zone.constant(baseElements);
      return {
        zone: Fun.constant(zone),
        words: Fun.constant(words)
      };
    };

    var empty = function () {
      return {
        zone: Zone.empty,
        words: Fun.constant([])
      };
    };

    return {
      generate: generate,
      empty: empty
    };
  }
);
