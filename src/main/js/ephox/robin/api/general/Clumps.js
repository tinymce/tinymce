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
    var same = function (universe, start, soffset, foffset) {
      var middle = Split.splitByPair(universe, start, soffset, foffset);
      return Option.some([ middle ]);
    };

    var diff = function (universe, isRoot, start, soffset, finish, foffset) {
      var rightSide = EntryPoints.toRight(universe, isRoot, finish, foffset);
      var leftSide = EntryPoints.toLeft(universe, isRoot, start, soffset);
      console.log('leftSide: ', leftSide.dom());
      console.log('rightSide: ', rightSide.dom());
      return Fractures.fracture(universe, isRoot, leftSide, rightSide);
    };

    // TODO: Handle backwards selections ! Maybe higher up when we definitely have the DOM.
    var fracture = function (universe, isRoot, start, soffset, finish, foffset) {
      var sameText = universe.property().isText(start) && universe.eq(start, finish);
      return sameText ? same(universe, start, soffset, foffset) : diff(universe, isRoot, start, soffset, finish, foffset);
    };

    // TODO: Handle backwards selections ! Maybe higher up when we definitely have the DOM.
    var fractures = function (universe, isRoot, start, soffset, finish, foffset) {
      var clumps = Clumps.collect(universe, isRoot, start, soffset, finish, foffset);
      return Arr.bind(clumps, function (clump, i) {
        console.log('Clumps [' + i + ']', clump.start().dom().cloneNode(true), clump.soffset(), clump.finish().dom().cloneNode(true), clump.foffset());
        return fracture(universe, isRoot, clump.start(), clump.soffset(), clump.finish(), clump.foffset()).toArray();
      });
    };

    return {
      fractures: fractures,
      fracture: fracture
    };
  }
);