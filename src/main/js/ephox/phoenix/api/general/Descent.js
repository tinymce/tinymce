define(
  'ephox.phoenix.api.general.Descent',

  [
    'ephox.phoenix.wrap.Navigation'
  ],

  function (Navigation) {
    var toLeaf = function (unviverse, element, offset) {
      return Navigation.toLeaf(unviverse, element, offset);
    };

    var freefallLtr = function (universe, element, shortcuts) {
      return Navigation.freefallLtr(universe, element, shortcuts);
    };

    var freefallRtl = function (universe, element, shortcuts) {
      return Navigation.freefallRtl(universe, element, shortcuts);
    };

    return {
      toLeaf: toLeaf,
      freefallLtr: freefallLtr,
      freefallRtl: freefallRtl
    };
  }
);