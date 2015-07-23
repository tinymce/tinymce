define(
  'ephox.robin.api.general.Grouping',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.phoenix.api.general.Extract',
    'ephox.polaris.api.Arrays'
  ],

  function (Arr, Fun, Extract, Arrays) {
    // FIX: dupe of phoenix.extract.TypedList.justText()
    var justText = function (segment) {
      return Arr.bind(segment, function (typedItem) {
        return typedItem.fold(Fun.constant([]), Fun.constant([]), Fun.identity);
      });
    };

    /**
     * Groups all text nodes in the element tree by boundary and empty elements.
     *
     * Returns an array of array of text node.
     */
    var text = function (universe, element, optimise) {
      var extractions = Extract.from(universe, element, optimise);
      var segments = Arrays.splitby(extractions, function (x) {
        return x.fold(Fun.constant(true), Fun.constant(true), Fun.constant(false));
      });

      return Arr.map(segments, justText);
    };

    return {
      text: text
    };
  }
);
