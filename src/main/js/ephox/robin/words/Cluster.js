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
    var extract = function (universe, element) {
      var children = Extract.all(universe, element);
      return Arr.map(children, function (x) {
        return Spot.text(x, universe.property().isText(x) ? universe.property().getText(x) : '');
      });
    };

    /**
     * Finds words in groups of text (each HTML text node can have multiple words).
     */
    var findWords = function (universe, elements) {
      var groups = Arrays.splitby(elements, function (x) {
        var elem = x.element();
        return universe.property().isBoundary(elem) || universe.property().isEmptyTag(elem);
      });

      return Arr.bind(groups, function (x) {
        var text = Arr.map(x, function (y) {
          return y.text();
        }).join('');
        return Identify.words(text);
      });
    };

    /**
     * Searches for words within the element or that span the edge of the element.
     *
     * Returns the words found and the elements that contain the words (not split on word boundaries).
     */
    var generate = function (universe, element) {
      var prune = Prune(universe);
      var transform = Transform(universe);
      var gathered = Gather.gather(universe, element, prune, transform);

      var left = gathered.left();
      var right = gathered.right();
      var middle = extract(universe, element);

      var elements = left.concat(middle).concat(right);

      var baseElements = Arr.map(elements, function (x) { return x.element(); });
      var zone = Zone.constant(baseElements);

      var words = findWords(universe, elements);

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
