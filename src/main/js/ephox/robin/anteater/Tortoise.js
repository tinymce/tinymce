define(
  'ephox.robin.anteater.Tortoise',

  [
    'ephox.compass.Arr',
    'ephox.perhaps.Option',
    'ephox.phoenix.api.general.Split',
    'ephox.robin.anteater.Anteater',
    'ephox.robin.anteater.Clumps',
    'ephox.robin.anteater.EntryPoints'
  ],

  function (Arr, Option, Split, Anteater, Clumps, EntryPoints) {
    var same = function (universe, clump) {
      var middle = Split.splitByPair(universe, clump.start(), clump.soffset(), clump.foffset());
      return Option.some([ middle ]);
    };

    var diff = function (universe, isRoot, clump) {
      var leftSide = EntryPoints.toLeft(universe, isRoot, clump.start(), clump.soffset());
      var rightSide = EntryPoints.toRight(universe, isRoot, clump.finish(), clump.foffset());
      return Anteater.fossil(universe, isRoot, leftSide, rightSide);
    };

    // TODO: Handle backwards selections ! Maybe higher up when we definitely have the DOM.
    var placid = function (universe, isRoot, clump) {
      var sameText = universe.property().isText(clump.start()) && universe.eq(clump.start(), clump.finish());
      return sameText ? same(universe, clump) : diff(universe, isRoot, clump);
    };

    // TODO: Handle backwards selections ! Maybe higher up when we definitely have the DOM.
    var tortoise = function (universe, isRoot, start, soffset, finish, foffset) {
      var clumps = Clumps.collect(universe, isRoot, start, soffset, finish, foffset);
      return Arr.bind(clumps, function (clump) {
        return placid(universe, isRoot, clump);
      });
    };

    return {
      placid: placid,
      tortoise: tortoise
    };
  }
);