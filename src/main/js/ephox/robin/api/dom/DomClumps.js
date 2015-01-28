define(
  'ephox.robin.api.dom.DomClumps',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.robin.api.general.Clumps'
  ],

  function (DomUniverse, Clumps) {
    var universe = DomUniverse();
    // TODO: Handle backwards selections ! Maybe higher up when we definitely have the DOM.
    var fractures = function (isRoot, start, soffset, finish, foffset) {
      return Clumps.fractures(universe, isRoot, start, soffset, finish, foffset);
    };

    // TODO: Handle backwards selections ! Maybe higher up when we definitely have the DOM.
    var fracture = function (isRoot, start, soffset, finish, foffset) {
      return Clumps.fracture(universe, isRoot, start, soffset, finish, foffset);
    };

    return {
      fractures: fractures,
      fracture: fracture
    };
  }
);