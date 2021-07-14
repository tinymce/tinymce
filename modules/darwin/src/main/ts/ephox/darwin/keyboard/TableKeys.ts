import { Optional } from '@ephox/katamari';
import { SpotPoint } from '@ephox/phoenix';
import { PlatformDetection } from '@ephox/sand';
import { Awareness, Compare, SimRange, SugarElement } from '@ephox/sugar';

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

const findSpot = (bridge: WindowBridge, isRoot: (e: SugarElement) => boolean, direction: KeyDirection): Optional<SpotPoint<SugarElement<Node>>> => {
  return bridge.getSelection().bind((sel) => {
    const spot = direction.spot(sel);
    return BrTags.tryBr(isRoot, spot.element, spot.offset, direction).fold(() => {
      return Optional.some(spot);
    }, (brNeighbour) => {
      const range = bridge.fromSitus(brNeighbour);
      const brSpot = direction.spot(range);
      const analysis = BeforeAfter.verify(bridge, spot.element, spot.offset, brSpot.element, brSpot.offset, direction.failure, isRoot);
      return BrTags.process(analysis);
    });
  });
};

const scan = (bridge: WindowBridge, isRoot: (e: SugarElement) => boolean, element: SugarElement, offset: number, direction: KeyDirection, numRetries: number): Optional<Situs> => {
  if (numRetries === 0) {
    return Optional.none();
  }
  // Firstly, move the (x, y) and see what element we end up on.
  return tryCursor(bridge, isRoot, element, offset, direction).bind((situs) => {
    const range = bridge.fromSitus(situs);
    const spot = direction.spot(range);
    // Now, check to see if the element is a new cell.
    const analysis = BeforeAfter.verify(bridge, element, offset, spot.element, spot.offset, direction.failure, isRoot);
    return BeforeAfter.cata(analysis, () => {
      return Optional.none<Situs>();
    }, () => {
      // We have a new cell, so we stop looking.
      return Optional.some(situs);
    }, (cell) => {
      if (Compare.eq(element, cell) && offset === 0) {
        return tryAgain(bridge, element, offset, Carets.moveUp, direction);
      } else { // We need to look again from the start of our current cell
        return scan(bridge, isRoot, cell, 0, direction, numRetries - 1);
      }
    }, (cell) => {
      // If we were here last time, move and try again.
      if (Compare.eq(element, cell) && offset === Awareness.getEnd(cell)) {
        return tryAgain(bridge, element, offset, Carets.moveDown, direction);
      } else { // We need to look again from the end of our current cell
        return scan(bridge, isRoot, cell, Awareness.getEnd(cell), direction, numRetries - 1);
      }
    });
  });
};

const tryAgain = (bridge: WindowBridge, element: SugarElement, offset: number, move: (carets: Carets, jump: number) => Carets, direction: KeyDirection): Optional<Situs> => {
  return Rectangles.getBoxAt(bridge, element, offset).bind((box) => {
    return tryAt(bridge, direction, move(box, Retries.getJumpSize()));
  });
};

const tryAt = (bridge: WindowBridge, direction: KeyDirection, box: Carets): Optional<Situs> => {
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

const tryCursor = (bridge: WindowBridge, isRoot: (e: SugarElement) => boolean, element: SugarElement, offset: number, direction: KeyDirection): Optional<Situs> => {
  return Rectangles.getBoxAt(bridge, element, offset).bind((box) => {
    return tryAt(bridge, direction, box);
  });
};

const handle = (bridge: WindowBridge, isRoot: (e: SugarElement) => boolean, direction: KeyDirection): Optional<SimRange> => {
  return findSpot(bridge, isRoot, direction).bind((spot) => {
    // There is a point to start doing box-hitting from
    return scan(bridge, isRoot, spot.element, spot.offset, direction, MAX_RETRIES).map(bridge.fromSitus);
  });
};

export {
  handle
};
