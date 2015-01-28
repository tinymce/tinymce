define(
  'ephox.robin.anteater.Placid',

  [
    'ephox.perhaps.Option',
    'ephox.phoenix.api.general.Split',
    'ephox.robin.anteater.Anteater',
    'ephox.robin.anteater.EntryPoints'
  ],

  function (Option, Split, Anteater, EntryPoints) {
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

    return {
      placid: placid
    };
  }
);