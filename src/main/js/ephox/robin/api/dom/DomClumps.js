define(
  'ephox.robin.api.dom.DomClumps',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.robin.api.general.Clumps'
  ],

  function (DomUniverse, Clumps) {
    var universe = DomUniverse();
    // TODO: Handle backwards selections ! Maybe higher up when we definitely have the DOM.
    var discover = function (isRoot, start, soffset, finish, foffset) {
      return Clumps.discover(universe, isRoot, start, soffset, finish, foffset);
    };

    // TODO: Handle backwards selections ! Maybe higher up when we definitely have the DOM.
    var fracture = function (isRoot, clump) {
      return Clumps.fracture(universe, isRoot, clump);
    };

    return {
      discover: discover,
      fracture: fracture
    };
  }
);