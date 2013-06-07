define(
  'ephox.polaris.api.PositionArray',

  [
    'ephox.polaris.parray.Generator',
    'ephox.polaris.parray.Query'
  ],

  function (Generator, Query) {
    var generate = function (items, generator) {
      return Generator.make(items, generator);
    };

    var get = function (parray, offset) {
      return Query.get(parray, offset);
    };

    return {
      generate: generate,
      get: get
    };
  }
);
