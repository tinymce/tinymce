define(
  'ephox.sugar.alien.Global',

  [
    'ephox.katamari.api.Resolve'
  ],

  function (Resolve) {
    var unsafe = function (name, scope) {
      return Resolve.resolve(name, scope);
    };

    var getOrDie = function (name, scope) {
      var actual = unsafe(name, scope);

      // In theory, TBIO should refuse to load below IE10. But we'll enforce it here too.
      if (actual === undefined) throw name + ' not available on this browser';
      return actual;
    };

    return {
      getOrDie: getOrDie
    };
  }
);