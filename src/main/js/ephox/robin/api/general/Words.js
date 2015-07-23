define(
  'ephox.robin.api.general.Words',

  [
    'ephox.robin.util.WordUtil',
    'ephox.robin.words.Cluster',
    'ephox.robin.words.Identify'
  ],

  /**
   * Documentation is in the actual implementations.
   */
  function (WordUtil, Cluster, Identify) {
    var identify = function (allText) {
      return Identify.words(allText);
    };

    var cluster = function (universe, element, optimise) {
      return universe.property().isBoundary(element) ? Cluster.empty() : Cluster.generate(universe, element, optimise);
    };

    var isWord = function (_universe, text) {
      return !WordUtil.hasBreak(text);
    };

    return {
      identify: identify,
      cluster: cluster,
      isWord: isWord
    };
  }
);
