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

    var freefallLtr = function (element, shortcuts) {
      return Descent.freefallLtr(universe, element, shortcuts);
    };

    var freefallRtl = function (element, shortcuts) {
      return Descent.freefallRtl(universe, element, shortcuts);
    };

    return {
      toLeaf: toLeaf,
      freefallLtr: freefallLtr,
      freefallRtl: freefallRtl
    };
  }
);