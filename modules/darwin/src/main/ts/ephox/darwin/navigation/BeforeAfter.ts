import { Adt } from '@ephox/katamari';
import { DomParent } from '@ephox/robin';
import { Compare } from '@ephox/sugar';
import { SelectorFind } from '@ephox/sugar';
import { Awareness } from '@ephox/sugar';

var adt = Adt.generate([
  { 'none' : [ 'message'] },
  { 'success': [ ] },
  { 'failedUp': [ 'cell' ] },
  { 'failedDown': [ 'cell' ] }
]);

// Let's get some bounding rects, and see if they overlap (x-wise)
var isOverlapping = function (bridge, before, after) {
  var beforeBounds = bridge.getRect(before);
  var afterBounds = bridge.getRect(after);
  return afterBounds.right > beforeBounds.left && afterBounds.left < beforeBounds.right;
};

var verify = function (bridge, before, beforeOffset, after, afterOffset, failure, isRoot) {
  // Identify the cells that the before and after are in.
  return SelectorFind.closest(after, 'td,th', isRoot).bind(function (afterCell) {
    return SelectorFind.closest(before, 'td,th', isRoot).map(function (beforeCell) {
      // If they are not in the same cell
      if (! Compare.eq(afterCell, beforeCell)) {
        return DomParent.sharedOne(isRow, [ afterCell, beforeCell ]).fold(function () {
          // No shared row, and they overlap x-wise -> success, otherwise: failed
          return isOverlapping(bridge, beforeCell, afterCell) ? adt.success() : failure(beforeCell);
        }, function (sharedRow) {
          // In the same row, so it failed.
          return failure(beforeCell);
        });
      } else {
        return Compare.eq(after, afterCell) && Awareness.getEnd(afterCell) === afterOffset ? failure(beforeCell) : adt.none('in same cell');
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

export default <any> {
  verify: verify,
  cata: cata,
  adt: adt
};