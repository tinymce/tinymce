define(
  'ephox.phoenix.test.Finder',

  [
    'ephox.compass.Arr'
  ],

  function (Arr) {
    var get = function (universe, id) {
      return universe.find(universe.get(), id).getOrDie();
    };

    var getAll = function (universe, ids) {
      return Arr.map(ids, function (id) {
        return get(universe, id);
      });
    };

    return {
      get: get,
      getAll: getAll
    };
  }
);
