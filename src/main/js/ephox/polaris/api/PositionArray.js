define(
  'ephox.polaris.api.PositionArray',

  [
    'ephox.polaris.parray.Generator',
    'ephox.polaris.parray.Query',
    'ephox.polaris.parray.Split',
    'ephox.polaris.parray.Translate'
  ],

  /**
   * Documentation is in the actual implementations.
   */
  function (Generator, Query, Split, Translate) {
    var generate = function (items, generator, _start) {
      return Generator.make(items, generator, _start);
    };

    var get = function (parray, offset) {
      return Query.get(parray, offset);
    };

    var find = function (parray, pred) {
      return Query.find(parray, pred);
    };

    var splits = function (parray, positions, subdivide) {
      return Split.splits(parray, positions, subdivide);
    };

    var translate = function (parray, amount) {
      return Translate.translate(parray, amount);
    };

    var sublist = function (parray, start, finish) {
      return Query.sublist(parray, start, finish);
    };

    return {
      generate: generate,
      get: get,
      find: find,
      splits: splits,
      translate: translate,
      sublist: sublist
    };
  }
);
