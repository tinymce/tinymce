define(
  'ephox.darwin.navigation.BeforeAfter',

  [
    'ephox.robin.api.dom.DomParent',
    'ephox.scullion.ADT',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.SelectorFind'
  ],

  function (DomParent, Adt, Compare, SelectorFind) {
    var adt = Adt.generate([
      { 'none' : [ 'message'] },
      { 'success': [ ] },
      { 'failedUp': [ 'cell' ] },
      { 'failedDown': [ 'cell' ] }
    ]);

    // Let's get some bounding rects, and see if they overlap (x-wise)
    var isOverlapping = function (before, after) {
      var beforeBounds = before.dom().getBoundingClientRect();
      var afterBounds = after.dom().getBoundingClientRect();
      return afterBounds.right > beforeBounds.left && afterBounds.left < beforeBounds.right;
    };

    var verify = function (before, after, failure) {
      // Identify the cells that the before and after are in.
      return SelectorFind.closest(after, 'td,th').bind(function (afterCell) {
        return SelectorFind.closest(before, 'td,th').map(function (beforeCell) {
          // If they are not in the same cell
          if (! Compare.eq(afterCell, beforeCell)) {
            return DomParent.sharedOne(isRow, [ afterCell, beforeCell ]).fold(function () {
              // No shared row, and they overlap x-wise -> success, otherwise: failed
              return isOverlapping(beforeCell, afterCell) ? adt.success() : failure(beforeCell);
            }, function (sharedRow) {
              // In the same row, so it failed.
              return failure(beforeCell);
            });
          } else {
            // Note, there used to be two different types here: finishSection and startSection .. only finishSection (offset = end of result)
            // had different behaviour. They would be triggered when we were ending up (result) in a container than contained initial (element)
            return adt.none('in same cell');
          }
        });
      }).getOr(adt.none('default'));
    };

    var isRow = function (elem) {
      return SelectorFind.closest(elem, 'tr');
    };

    var cata = function (subject, onNone, onSuccess, onFailedUp, onFailedDown) {
      return subject.fold(onNone, onSuccess, onFailedUp, onFailedDown);
    };

    return {
      verify: verify,
      cata: cata,
      adt: adt
    };
  }
);