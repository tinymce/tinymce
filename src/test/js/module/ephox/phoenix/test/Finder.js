define(
  'ephox.phoenix.test.Finder',

  [
  ],

  function () {
    var get = function (universe, id) {
      return universe.find(universe.get(), id).getOrDie();
    };

    return {
      get: get
    };
  }
);
