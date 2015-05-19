define(
  'ephox.darwin.navigation.BeforeAfter',

  [
    'ephox.darwin.util.Logger',
    'ephox.oath.proximity.Awareness',
    'ephox.robin.api.dom.DomParent',
    'ephox.scullion.ADT',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Logger, Awareness, DomParent, Adt, Compare, SelectorFind) {
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

    var verify = function (before, beforeOffset, after, afterOffset, failure) {
      // Identify the cells that the before and after are in.
      Logger.log('B1.down', 'after', after.dom());
      return SelectorFind.closest(after, 'td,th').bind(function (afterCell) {
        Logger.log('B1.down', 'after.closest =>', afterCell.dom());
        return SelectorFind.closest(before, 'td,th').map(function (beforeCell) {
          Logger.log('B1.down', 'before.closest =>', beforeCell.dom());
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
            return Awareness.getEnd(after) === afterOffset ? failure(beforeCell) : adt.none('in same cell');
            // Note, there used to be two different types here: finishSection and startSection .. only finishSection (offset = end of result)
            // had different behaviour. They would be triggered when we were ending up (result) in a container than contained initial (element)
            Logger.log('B1.down', 'None', beforeCell.dom());
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