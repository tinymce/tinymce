import Carets from './Carets';
import Rectangles from './Rectangles';
import Retries from './Retries';
import BeforeAfter from '../navigation/BeforeAfter';
import BrTags from '../navigation/BrTags';
import { Option } from '@ephox/katamari';
import { Spot } from '@ephox/phoenix';
import { PlatformDetection } from '@ephox/sand';
import { Compare } from '@ephox/sugar';
import { Awareness } from '@ephox/sugar';

var MAX_RETRIES = 20;

var platform = PlatformDetection.detect();

var findSpot = function (bridge, isRoot, direction) {
  return bridge.getSelection().bind(function (sel) {
    return BrTags.tryBr(isRoot, sel.finish(), sel.foffset(), direction).fold(function () {
      return Option.some(Spot.point(sel.finish(), sel.foffset()));
    }, function (brNeighbour) {
      var range = bridge.fromSitus(brNeighbour);
      var analysis = BeforeAfter.verify(bridge, sel.finish(), sel.foffset(), range.finish(), range.foffset(), direction.failure, isRoot);
      return BrTags.process(analysis);
    });
  });
};

var scan = function (bridge, isRoot, element, offset, direction, numRetries) {
  if (numRetries === 0) return Option.none();
  // Firstly, move the (x, y) and see what element we end up on.
  return tryCursor(bridge, isRoot, element, offset, direction).bind(function (situs) {
    var range = bridge.fromSitus(situs);
    // Now, check to see if the element is a new cell.
    var analysis = BeforeAfter.verify(bridge, element, offset, range.finish(), range.foffset(), direction.failure, isRoot);
    return BeforeAfter.cata(analysis, function () {
      return Option.none();
    }, function () {
      // We have a new cell, so we stop looking.
      return Option.some(situs);
    }, function (cell) {
      if (Compare.eq(element, cell) && offset === 0) return tryAgain(bridge, element, offset, Carets.moveUp, direction);
      // We need to look again from the start of our current cell
      else return scan(bridge, isRoot, cell, 0, direction, numRetries - 1);
    }, function (cell) {
      // If we were here last time, move and try again.
      if (Compare.eq(element, cell) && offset === Awareness.getEnd(cell)) return tryAgain(bridge, element, offset, Carets.moveDown, direction);
      // We need to look again from the end of our current cell
      else return scan(bridge, isRoot, cell, Awareness.getEnd(cell), direction, numRetries - 1);
    });
  });
};

var tryAgain = function (bridge, element, offset, move, direction) {
  return Rectangles.getBoxAt(bridge, element, offset).bind(function (box) {
    return tryAt(bridge, direction, move(box, Retries.getJumpSize()));
  });
};

var tryAt = function (bridge, direction, box) {
  // NOTE: As we attempt to take over selection everywhere, we'll probably need to separate these again.
    if (platform.browser.isChrome() || platform.browser.isSafari() || platform.browser.isFirefox() || platform.browser.isEdge()) return direction.otherRetry(bridge, box);
    else if (platform.browser.isIE()) return direction.ieRetry(bridge, box);
    else return Option.none();
};

var tryCursor = function (bridge, isRoot, element, offset, direction) {
  return Rectangles.getBoxAt(bridge, element, offset).bind(function (box) {
    return tryAt(bridge, direction, box);
  });
};

var handle = function (bridge, isRoot, direction) {
  return findSpot(bridge, isRoot, direction).bind(function (spot) {
    // There is a point to start doing box-hitting from
    return scan(bridge, isRoot, spot.element(), spot.offset(), direction, MAX_RETRIES).map(bridge.fromSitus);
  });
};

export default <any> {
  handle: handle
};