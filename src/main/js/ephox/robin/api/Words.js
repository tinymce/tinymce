define(
  'ephox.robin.api.Words',

  [
    'ephox.phoenix.util.node.Classification',
    'ephox.robin.words.Cluster',
    'ephox.robin.words.Identify'
  ],

  function (Classification, Cluster, Identify) {
    var identify = function (allText) {
      return Identify.words(allText);
    };

    var cluster = function (element) {
      return Classification.isBoundary(element) ? Cluster.empty() : Cluster.generate(element);
    };

    return {
      identify: identify,
      cluster: cluster
    };
  }
);
