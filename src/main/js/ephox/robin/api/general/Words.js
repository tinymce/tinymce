define(
  'ephox.robin.api.general.Words',

  [
    'ephox.robin.words.Cluster',
    'ephox.robin.words.Identify',
    'ephox.robin.words.Selection'
  ],

  /**
   * Documentation is in the actual implementations.
   */
  function (Cluster, Identify, Selection) {
    var identify = function (allText) {
      return Identify.words(allText);
    };

    var cluster = function (universe, element) {
      return universe.property().isBoundary(element) ? Cluster.empty() : Cluster.generate(universe, element);
    };

    var selection = function (universe, element, offset) {
      return Selection.current(universe, element, offset);
    };

    return {
      identify: identify,
      cluster: cluster,
      selection: selection
    };
  }
);
