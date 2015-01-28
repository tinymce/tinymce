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
    var same = function (universe, element, soffset, foffset) {
      var middle = Split.splitByPair(universe, element, soffset, foffset);
      return Option.some([ middle ]);
    };

    var diff = function (universe, isRoot, start, soffset, finish, foffset) {
      var leftSide = EntryPoints.toLeft(universe, isRoot, start, soffset);
      var rightSide = EntryPoints.toRight(universe, isRoot, finish, foffset);
      return Anteater.fossil(universe, isRoot, leftSide, rightSide);
    };

    // TODO: Handle backwards selections ! Maybe higher up when we definitely have the DOM.
    var placid = function (universe, isRoot, start, soffset, finish, foffset) {
      var sameText = universe.property().isText(start) && universe.eq(start, finish);
      return sameText ? same(universe, start, soffset, foffset) : diff(universe, isRoot, start, soffset, finish, foffset);
    };

    // TODO: Handle backwards selections ! Maybe higher up when we definitely have the DOM.
    var tortoise = function (universe, isRoot, start, soffset, finish, foffset) {
      var clumps = Clumps.collect(universe, isRoot, start, soffset, finish, foffset);
      return Arr.bind(clumps, function (clump) {
        return placid(universe, isRoot, clump.start, clump.soffset, clump.end, clump.eoffset);
      });
    };

    return {
      placid: placid,
      tortoise: tortoise
    };
  }
);