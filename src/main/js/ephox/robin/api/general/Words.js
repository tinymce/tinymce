define(
  'ephox.robin.api.general.Words',

  [
    'ephox.robin.words.Cluster',
    'ephox.robin.words.Identify'
  ],

  /**
   * Documentation is in the actual implementations.
   */
  function (Cluster, Identify) {
    var identify = function (allText) {
      return Identify.words(allText);
    };

    var cluster = function (universe, element) {
      return universe.property().isBoundary(element) ? Cluster.empty() : Cluster.generate(universe, element);
    };

    return {
      identify: identify,
      cluster: cluster
    };
  }
);
