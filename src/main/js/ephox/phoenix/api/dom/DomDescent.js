define(
  'ephox.phoenix.api.dom.DomDescent',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.phoenix.api.general.Descent',
    'ephox.phoenix.wrap.Navigation'
  ],

  function (DomUniverse, Descent, Navigation) {
    var universe = DomUniverse();
    var toLeaf = function (element, offset) {
      return Descent.toLeaf(universe, element, offset);
    };

    return {
      toLeaf: toLeaf
    };
  }
);