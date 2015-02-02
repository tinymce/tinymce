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
    /*
     * clumping fracture: *fractures* method.
     *  - this breaks the full range specified by (start, soffset) -> (finish, foffset) into 
     *    clumps based on boundary tags. Each clump (which will NOT HAVE block elements) is 
     *    then fractured via *fracture* and the resulting list/array is returned.
     */
    var same = function (universe, start, soffset, foffset) {
      var middle = Split.splitByPair(universe, start, soffset, foffset);
      return Option.some([ middle ]);
    };

    var diff = function (universe, isRoot, start, soffset, finish, foffset, ceiling) {
      var rightSide = EntryPoints.toRight(universe, isRoot, finish, foffset);
      var leftSide = EntryPoints.toLeft(universe, isRoot, start, soffset);
      return Fractures.fracture(universe, isRoot, leftSide, rightSide, ceiling);
    };

    /* inline fracture: *fracture* method.
     *  - this identifies the slice of child nodes from a common ancestor that defines the 
     *    clump boundary: (start, soffset) -> (finish, foffset). It assumes that it is 
     *    a *true* clump (i.e. contains NO block elements), so all of the children
     *    identified can be wrapped by an INLINE tag. Note, clumps are identified via the 
     *    *Clumps.collect* method.
     *
     *    This may not need to be exposed, and is currently exposed just for testing.
     */
    var fracture = function (universe, isRoot, start, soffset, finish, foffset, ceiling) {
      var sameText = universe.property().isText(start) && universe.eq(start, finish);
      return sameText ? same(universe, start, soffset, foffset) : diff(universe, isRoot, start, soffset, finish, foffset, ceiling);
    };

    // TODO: Handle backwards selections ! Maybe higher up when we definitely have the DOM.
    var fractures = function (universe, isRoot, start, soffset, finish, foffset, ceiling) {
      var clumps = Clumps.collect(universe, isRoot, start, soffset, finish, foffset);
      return Arr.bind(clumps, function (clump, i) {
        return fracture(universe, isRoot, clump.start(), clump.soffset(), clump.finish(), clump.foffset(), ceiling).toArray();
      });
    };

    return {
      fractures: fractures,
      fracture: fracture
    };
  }
);