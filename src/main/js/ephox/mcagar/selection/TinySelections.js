define(
  'ephox.mcagar.selection.TinySelections',

  [
    'ephox.agar.api.Chain',
    'ephox.agar.api.Cursors',
    'ephox.sugar.api.search.Traverse'
  ],

  function (Chain, Cursors, Traverse) {
    var cToDomRange = Chain.on(function (range, next, die) {
      var doc = Traverse.owner(range.start());
      var rng = doc.dom().createRange();
      rng.setStart(range.start().dom(), range.soffset());
      rng.setEnd(range.finish().dom(), range.foffset());
      next(Chain.wrap(rng));
    });

    var cCreateDomSelection = function (sPath, soffset, fPath, foffset) {
      var path = Cursors.path({
        startPath: sPath,
        soffset: soffset,
        finishPath: fPath,
        foffset: foffset
      });

      return Chain.fromChains([
        Cursors.cFollowPath(path),
        cToDomRange
      ]);
    };

    var cCreateDomCursor = function (elementPath, offset) {
      return Chain.fromChains([
        Cursors.cFollowCursor(elementPath, offset),
        cToDomRange
      ]);
    };

    var cCreateDomSelectionOf = function (start, soffset, finish, foffset) {
      return Chain.fromChainsWith(
        {
          start: start,
          soffset: soffset,
          finish: finish,
          foffset: foffset
        },
        [
          Cursors.cToRange,
          cToDomRange
        ]
      );
    };

    return {
      cCreateDomSelection: cCreateDomSelection,
      cCreateDomCursor: cCreateDomCursor,
      cCreateDomSelectionOf: cCreateDomSelectionOf
    };
  }
);