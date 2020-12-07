import { Optional } from '@ephox/katamari';
import { Spot } from '@ephox/phoenix';
import { PlatformDetection } from '@ephox/sand';
import { Awareness, Compare, SugarElement } from '@ephox/sugar';
import { WindowBridge } from '../api/WindowBridge';
import { BeforeAfter } from '../navigation/BeforeAfter';
import * as BrTags from '../navigation/BrTags';
import { KeyDirection } from '../navigation/KeyDirection';
import { Situs } from '../selection/Situs';
import * as Carets from './Carets';
import * as Rectangles from './Rectangles';
import { Retries } from './Retries';

type Carets = Carets.Carets;

const MAX_RETRIES = 20;

const findSpot = function (bridge: WindowBridge, isRoot: (e: SugarElement) => boolean, direction: KeyDirection) {
  return bridge.getSelection().bind(function (sel) {
    return BrTags.tryBr(isRoot, sel.finish, sel.foffset, direction).fold(function () {
      return Optional.some(Spot.point(sel.finish, sel.foffset));
    }, function (brNeighbour) {
      const range = bridge.fromSitus(brNeighbour);
      const analysis = BeforeAfter.verify(bridge, sel.finish, sel.foffset, range.finish, range.foffset, direction.failure, isRoot);
      return BrTags.process(analysis);
    });
  });
};

const scan = function (bridge: WindowBridge, isRoot: (e: SugarElement) => boolean, element: SugarElement, offset: number, direction: KeyDirection, numRetries: number): Optional<Situs> {
  if (numRetries === 0) { return Optional.none(); }
  // Firstly, move the (x, y) and see what element we end up on.
  return tryCursor(bridge, isRoot, element, offset, direction).bind(function (situs) {
    const range = bridge.fromSitus(situs);
    // Now, check to see if the element is a new cell.
    const analysis = BeforeAfter.verify(bridge, element, offset, range.finish, range.foffset, direction.failure, isRoot);
    return BeforeAfter.cata(analysis, function () {
      return Optional.none<Situs>();
    }, function () {
      // We have a new cell, so we stop looking.
      return Optional.some(situs);
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

const tryAgain = function (bridge: WindowBridge, element: SugarElement, offset: number, move: (carets: Carets, jump: number) => Carets, direction: KeyDirection) {
  return Rectangles.getBoxAt(bridge, element, offset).bind(function (box) {
    return tryAt(bridge, direction, move(box, Retries.getJumpSize()));
  });
};

const tryAt = function (bridge: WindowBridge, direction: KeyDirection, box: Carets) {
  const browser = PlatformDetection.detect().browser;
  // NOTE: As we attempt to take over selection everywhere, we'll probably need to separate these again.
  if (browser.isChrome() || browser.isSafari() || browser.isFirefox() || browser.isEdge()) {
    return direction.otherRetry(bridge, box);
  } else if (browser.isIE()) {
    return direction.ieRetry(bridge, box);
  } else {
    return Optional.none<Situs>();
  }
};

const tryCursor = function (bridge: WindowBridge, isRoot: (e: SugarElement) => boolean, element: SugarElement, offset: number, direction: KeyDirection) {
  return Rectangles.getBoxAt(bridge, element, offset).bind(function (box) {
    return tryAt(bridge, direction, box);
  });
};

const handle = function (bridge: WindowBridge, isRoot: (e: SugarElement) => boolean, direction: KeyDirection) {
  return findSpot(bridge, isRoot, direction).bind(function (spot) {
    // There is a point to start doing box-hitting from
    return scan(bridge, isRoot, spot.element, spot.offset, direction, MAX_RETRIES).map(bridge.fromSitus);
  });
};

export {
  handle
};
