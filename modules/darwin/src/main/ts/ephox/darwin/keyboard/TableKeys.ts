import { Option } from '@ephox/katamari';
import { Spot } from '@ephox/phoenix';
import { PlatformDetection } from '@ephox/sand';
import { Awareness, Compare, Element } from '@ephox/sugar';
import { BeforeAfter } from '../navigation/BeforeAfter';
import BrTags from '../navigation/BrTags';
import { Carets } from './Carets';
import Rectangles from './Rectangles';
import { Retries } from './Retries';
import { WindowBridge } from '../api/WindowBridge';
import { KeyDirection } from '../navigation/KeyDirection';
import { Situs } from '../selection/Situs';

const MAX_RETRIES = 20;

const platform = PlatformDetection.detect();

const findSpot = function (bridge: WindowBridge, isRoot: (e: Element) => boolean, direction: KeyDirection) {
  return bridge.getSelection().bind(function (sel) {
    return BrTags.tryBr(isRoot, sel.finish(), sel.foffset(), direction).fold(function () {
      return Option.some(Spot.point(sel.finish(), sel.foffset()));
    }, function (brNeighbour) {
      const range = bridge.fromSitus(brNeighbour);
      const analysis = BeforeAfter.verify(bridge, sel.finish(), sel.foffset(), range.finish(), range.foffset(), direction.failure, isRoot);
      return BrTags.process(analysis);
    });
  });
};

const scan = function (bridge: WindowBridge, isRoot: (e: Element) => boolean, element: Element, offset: number, direction: KeyDirection, numRetries: number): Option<Situs> {
  if (numRetries === 0) { return Option.none(); }
  // Firstly, move the (x, y) and see what element we end up on.
  return tryCursor(bridge, isRoot, element, offset, direction).bind(function (situs) {
    const range = bridge.fromSitus(situs);
    // Now, check to see if the element is a new cell.
    const analysis = BeforeAfter.verify(bridge, element, offset, range.finish(), range.foffset(), direction.failure, isRoot);
    return BeforeAfter.cata(analysis, function () {
      return Option.none<Situs>();
    }, function () {
      // We have a new cell, so we stop looking.
      return Option.some(situs);
    }, function (cell) {
      if (Compare.eq(element, cell) && offset === 0) {
        return tryAgain(bridge, element, offset, Carets.moveUp, direction);
      } else { // We need to look again from the start of our current cell
        return scan(bridge, isRoot, cell, 0, direction, numRetries - 1);
      }
    }, function (cell) {
      // If we were here last time, move and try again.
      if (Compare.eq(element, cell) && offset === Awareness.getEnd(cell)) {
        return tryAgain(bridge, element, offset, Carets.moveDown, direction);
      } else { // We need to look again from the end of our current cell
        return scan(bridge, isRoot, cell, Awareness.getEnd(cell), direction, numRetries - 1);
      }
    });
  });
};

const tryAgain = function (bridge: WindowBridge, element: Element, offset: number, move: (carets: Carets, jump: number) => Carets, direction: KeyDirection) {
  return Rectangles.getBoxAt(bridge, element, offset).bind(function (box) {
    return tryAt(bridge, direction, move(box, Retries.getJumpSize()));
  });
};

const tryAt = function (bridge: WindowBridge, direction: KeyDirection, box: Carets) {
  // NOTE: As we attempt to take over selection everywhere, we'll probably need to separate these again.
  if (platform.browser.isChrome() || platform.browser.isSafari() || platform.browser.isFirefox() || platform.browser.isEdge()) {
    return direction.otherRetry(bridge, box);
  } else if (platform.browser.isIE()) {
    return direction.ieRetry(bridge, box);
  } else {
    return Option.none<Situs>();
  }
};

const tryCursor = function (bridge: WindowBridge, isRoot: (e: Element) => boolean, element: Element, offset: number, direction: KeyDirection) {
  return Rectangles.getBoxAt(bridge, element, offset).bind(function (box) {
    return tryAt(bridge, direction, box);
  });
};

const handle = function (bridge: WindowBridge, isRoot: (e: Element) => boolean, direction: KeyDirection) {
  return findSpot(bridge, isRoot, direction).bind(function (spot) {
    // There is a point to start doing box-hitting from
    return scan(bridge, isRoot, spot.element(), spot.offset(), direction, MAX_RETRIES).map(bridge.fromSitus);
  });
};

export default {
  handle
};