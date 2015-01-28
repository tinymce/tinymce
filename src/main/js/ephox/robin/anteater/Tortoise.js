define(
  'ephox.robin.anteater.Tortoise',

  [
    'ephox.compass.Arr',
    'ephox.robin.anteater.Coyotes',
    'ephox.robin.anteater.Placid'
  ],

  function (Arr, Coyotes, Placid) {
    var tortoise = function (universe, isRoot, start, soffset, finish, foffset) {
      var coyotes = Coyotes.wile(universe, isRoot, start, soffset, finish, foffset);
      return Arr.bind(coyotes, function (coyote) {
        return Placid.placid(universe, isRoot, coyote.start, coyote.soffset, coyote.end, coyote.eoffset);
      });
    };

    return {
      tortoise: tortoise
    };
  }
);