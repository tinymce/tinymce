define(
  'ephox.robin.api.dom.DomWords',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.robin.api.general.Words'
  ],

  /**
   * Documentation is in the actual implementations.
   */
  function (DomUniverse, Words) {
    var universe = DomUniverse();

    var identify = function (allText) {
      return Words.identify(allText);
    };

    var cluster = function (element) {
      return Words.cluster(universe, element);
    };

    return {
      identify: identify,
      cluster: cluster
    };

  }
);
