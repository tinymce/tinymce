define(
  'ephox.phoenix.api.dom.DomDescent',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.phoenix.api.general.Descent'
  ],

  function (DomUniverse, Descent) {
    var universe = DomUniverse();
    var toLeaf = function (element, offset) {
      return Descent.toLeaf(universe, element, offset);
    };

    var freefallLtr = function (element) {
      return Descent.freefallLtr(universe, element);
    };

    var freefallRtl = function (element) {
      return Descent.freefallRtl(universe, element);
    };

    return {
      toLeaf: toLeaf,
      freefallLtr: freefallLtr,
      freefallRtl: freefallRtl
    };
  }
);