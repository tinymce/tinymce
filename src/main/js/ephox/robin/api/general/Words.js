define(
  'ephox.robin.api.general.Words',

  [
    'ephox.lumber.api.Timers',
    'ephox.robin.util.WordUtil',
    'ephox.robin.words.Cluster',
    'ephox.robin.words.Identify'
  ],

  /**
   * Documentation is in the actual implementations.
   */
  function (Timers, WordUtil, Cluster, Identify) {
    var identify = function (allText) {
      return Identify.words(allText);
    };

    var cluster = function (universe, element) {
      return Timers.run('cluster.gather', function () {
        return universe.property().isBoundary(element) ? Cluster.empty() : Cluster.generate(universe, element);
      });

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
