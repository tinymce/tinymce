define(
  'ephox.robin.api.general.Clumps',

  [
    'ephox.compass.Arr',
    'ephox.perhaps.Option',
    'ephox.phoenix.api.general.Split',
    'ephox.robin.clumps.Clumps',
    'ephox.robin.clumps.EntryPoints',
    'ephox.robin.clumps.Fractures'
  ],

  function (Arr, Option, Split, Clumps, EntryPoints, Fractures) {
    var same = function (universe, clump) {
      var middle = Split.splitByPair(universe, clump.start(), clump.soffset(), clump.foffset());
      return Option.some([ middle ]);
    };

    var diff = function (universe, isRoot, clump) {
      var leftSide = EntryPoints.toLeft(universe, isRoot, clump.start(), clump.soffset());
      var rightSide = EntryPoints.toRight(universe, isRoot, clump.finish(), clump.foffset());
      return Fractures.fracture(universe, isRoot, leftSide, rightSide);
    };

    // TODO: Handle backwards selections ! Maybe higher up when we definitely have the DOM.
    var fracture = function (universe, isRoot, clump) {
      var sameText = universe.property().isText(clump.start()) && universe.eq(clump.start(), clump.finish());
      return sameText ? same(universe, clump) : diff(universe, isRoot, clump);
    };

    // TODO: Handle backwards selections ! Maybe higher up when we definitely have the DOM.
    var discover = function (universe, isRoot, start, soffset, finish, foffset) {
      var clumps = Clumps.collect(universe, isRoot, start, soffset, finish, foffset);
      return Arr.bind(clumps, function (clump) {
        return fracture(universe, isRoot, clump).toArray();
      });
    };

    return {
      discover: discover,
      fracture: fracture
    };
  }
);