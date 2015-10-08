define(
  'ephox.phoenix.api.general.Descent',

  [
    'ephox.phoenix.wrap.Navigation'
  ],

  function (Navigation) {
    var toLeaf = function (unviverse, element, offset) {
      return Navigation.toLeaf(unviverse, element, offset);
    };

    var freefallLtr = function (universe, element) {
      return Navigation.freefallLtr(universe, element);
    };

    var freefallRtl = function (universe, element) {
      return Navigation.freefallRtl(universe, element);
    };

    return {
      toLeaf: toLeaf,
      freefallLtr: freefallLtr,
      freefallRtl: freefallRtl
    };
  }
);