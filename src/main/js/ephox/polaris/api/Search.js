define(
  'ephox.polaris.api.Search',

  [
    'ephox.polaris.search.Find',
    'ephox.polaris.search.Sleuth'
  ],

  /**
   * Documentation is in the actual implementations.
   */
  function (Find, Sleuth) {
    var findall = function (input, pattern) {
      return Find.all(input, pattern);
    };

    var findmany = function (input, targets) {
      return Sleuth.search(input, targets);
    };

    return {
      findall: findall,
      findmany: findmany
    };
  }
);
