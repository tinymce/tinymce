import { Adt, Arr, Fun, Num } from '@ephox/katamari';

import * as Boxes from '../../alien/Boxes';
import { Bubble } from '../layout/Bubble';
import * as Direction from '../layout/Direction';
import * as LayoutBounds from '../layout/LayoutBounds';
import { AnchorBox, AnchorElement, AnchorLayout } from '../layout/LayoutTypes';
import { RepositionDecision } from './Reposition';
import { SpotInfo } from './SpotInfo';

export interface BounderAttemptAdt {
  fold: <T>(
    fit: (reposition: RepositionDecision) => T,
    nofit: (reposition: RepositionDecision, deltaW: number, deltaH: number) => T
  ) => T;
  match: <T>(branches: {
    fit: (reposition: RepositionDecision) => T;
    nofit: (reposition: RepositionDecision, deltaW: number, deltaH: number) => T;
  }) => T;
  log: (label: string) => void;
}

interface RepositionResult {
  readonly originInBounds: boolean;
  readonly sizeInBounds: boolean;
  readonly limitX: number;
  readonly limitY: number;
  readonly deltaW: number;
  readonly deltaH: number;
}

const adt: {
  fit: (reposition: RepositionDecision) => BounderAttemptAdt;
  nofit: (reposition: RepositionDecision, deltaW: number, deltaH: number) => BounderAttemptAdt;
} = Adt.generate([
  { fit:   [ 'reposition' ] },
  { nofit: [ 'reposition', 'deltaW', 'deltaH' ] }
]);

const calcReposition = (newX: number, newY: number, width: number, height: number, bounds: Boxes.Bounds): RepositionResult => {
  const boundsX = bounds.x;
  const boundsY = bounds.y;
  const boundsWidth = bounds.width;
  const boundsHeight = bounds.height;

  // simple checks for "is the top left inside the view"
  const xInBounds = newX >= boundsX;
  const yInBounds = newY >= boundsY;
  const originInBounds = xInBounds && yInBounds;

  // simple checks for "is the bottom right inside the view"
  const xFit = (newX + width) <= (boundsX + boundsWidth);
  const yFit = (newY + height) <= (boundsY + boundsHeight);
  const sizeInBounds = xFit && yFit;

  // measure how much of the width and height are visible. deltaW isn't necessary in the fit case but it's cleaner to read here.
  const deltaW = Math.abs(Math.min(width, xInBounds ? boundsX + boundsWidth - newX : boundsX - (newX + width)));
  const deltaH = Math.abs(Math.min(height, yInBounds ? boundsY + boundsHeight - newY : boundsY - (newY + height)));

  // measure the maximum x and y, taking into account the height and width of the element
  const maxX = Math.max(bounds.x, bounds.right - width);
  const maxY = Math.max(bounds.y, bounds.bottom - height);

  // Futz with the X value to ensure that we're not off the left or right of the screen
  // NOTE: bounds.x() is 0 in repartee here.
  const limitX = Num.clamp(newX, bounds.x, maxX);
  // Futz with the Y value to ensure that we're not off the top or bottom of the screen
  const limitY = Num.clamp(newY, bounds.y, maxY);

  return {
    originInBounds,
    sizeInBounds,
    limitX,
    limitY,
    deltaW,
    deltaH
  };
};

const attempt = (candidate: SpotInfo, width: number, height: number, bounds: Boxes.Bounds): BounderAttemptAdt => {
  const candidateX = candidate.x;
  const candidateY = candidate.y;
  const bubbleOffsets = candidate.bubble.offset;
  const bubbleLeft = bubbleOffsets.left;
  const bubbleTop = bubbleOffsets.top;

  // adjust the bounds to account for the layout and bubble restrictions
  const adjustedBounds = LayoutBounds.adjustBounds(bounds, candidate.boundsRestriction, bubbleOffsets);
  const boundsY = adjustedBounds.y;
  const boundsBottom = adjustedBounds.bottom;
  const boundsX = adjustedBounds.x;
  const boundsRight = adjustedBounds.right;

  // candidate position is excluding the bubble, so add those values as well
  const newX = candidateX + bubbleLeft;
  const newY = candidateY + bubbleTop;

  const { originInBounds, sizeInBounds, limitX, limitY, deltaW, deltaH } = calcReposition(newX, newY, width, height, adjustedBounds);

  // TBIO-3367 + TBIO-3387:
  // Futz with the "height" of the popup to ensure if it doesn't fit it's capped at the available height.
  // As of TBIO-4291, we provide all available space for both up and down.
  const upAvailable = Fun.constant((limitY + deltaH) - boundsY);
  const downAvailable = Fun.constant(boundsBottom - limitY);
  const maxHeight = Direction.cataVertical(candidate.direction, downAvailable, /* middle */ downAvailable, upAvailable);

  const westAvailable = Fun.constant((limitX + deltaW) - boundsX);
  const eastAvailable = Fun.constant(boundsRight - limitX);
  const maxWidth = Direction.cataHorizontal(candidate.direction, eastAvailable, /* middle */ eastAvailable, westAvailable);

  const reposition: RepositionDecision = {
    x: limitX,
    y: limitY,
    width: deltaW,
    height: deltaH,
    maxHeight,
    maxWidth,
    direction: candidate.direction,
    classes: {
      on: candidate.bubble.classesOn,
      off: candidate.bubble.classesOff
    },
    label: candidate.label,
    candidateYforTest: newY
  };

  // useful debugging that I don't want to lose
  // console.log(candidate.label());
  // console.log('xfit', (boundsX + boundsWidth), ',', (newX + width), ',', newX);
  // console.log('yfit', (boundsY + boundsHeight), ',', (newY + height), ',', newY, ',', height);
  // console.table([{
  //   newY,
  //   limitY,
  //   boundsY,
  //   boundsBottom,
  //   newX,
  //   limitX,
  //   boundsX,
  //   boundsRight,
  //   candidateX: candidate.x(),
  //   candidateY: candidate.y(),
  //   width,
  //   height
  // }]);
  // console.log('y', yInBounds, yFit, '\t', Math.round(deltaH), '\t', (boundsY === 0 ? '000' : Math.round(boundsY)), '\t', Math.round(boundsHeight), '\t', Math.round(candidate.y()), '\t', Math.round(newY), '\t', height);
  // console.log('maxheight:', deltaH, maxHeight);
  // console.log('originInBounds:', originInBounds);
  // console.log('sizeInBounds:', sizeInBounds);
  // console.log(originInBounds && sizeInBounds ? 'fit' : 'nofit');

  // Take special note that we don't use the futz values in the nofit case; whether this position is a good fit is separate
  // to ensuring that if we choose it the popup is actually on screen properly.
  return originInBounds && sizeInBounds ? adt.fit(reposition) : adt.nofit(reposition, deltaW, deltaH);
};

/**
 * Attempts to fit a box (generally a menu).
 *
 * candidates: an array of layout generators, generally obtained via api.Layout or api.LinkedLayout
 * anchorBox: the box on screen that triggered the menu, we must touch one of the edges as defined by the candidate layouts
 * elementBox: the popup (only width and height matter)
 * bubbles: the bubbles for the popup (see api.Bubble)
 * bounds: the screen
 */
const attempts = (candidates: AnchorLayout[], anchorBox: AnchorBox, elementBox: AnchorElement, bubbles: Bubble, bounds: Boxes.Bounds): RepositionDecision => {
  const panelWidth = elementBox.width;
  const panelHeight = elementBox.height;
  const attemptBestFit = (layout: AnchorLayout, reposition: RepositionDecision, deltaW: number, deltaH: number) => {
    const next: SpotInfo = layout(anchorBox, elementBox, bubbles);
    const attemptLayout = attempt(next, panelWidth, panelHeight, bounds);

    // unwrapping fit only to rewrap seems... silly
    return attemptLayout.fold(adt.fit, (newReposition, newDeltaW, newDeltaH) => {
      // console.log(`label: ${next.label()}, newDeltaW: ${newDeltaW}, deltaW: ${deltaW}, newDeltaH: ${newDeltaH}, deltaH: ${deltaH}`);
      const improved = newDeltaH > deltaH || newDeltaW > deltaW;
      // console.log('improved? ', improved);
      // re-wrap in the ADT either way
      return improved ? adt.nofit(newReposition, newDeltaW, newDeltaH)
        : adt.nofit(reposition, deltaW, deltaH);
    });
  };

  const abc = Arr.foldl(
    candidates,
    (b, a) => {
      const bestNext = Fun.curry(attemptBestFit, a);
      // unwrapping fit only to rewrap seems... silly
      return b.fold(adt.fit, bestNext);
    },
    // fold base case: No candidates, it's never going to be correct, so do whatever
    adt.nofit({
      x: anchorBox.x,
      y: anchorBox.y,
      width: elementBox.width,
      height: elementBox.height,
      maxHeight: elementBox.height,
      maxWidth: elementBox.width,
      direction: Direction.southeast(),
      classes: {
        on: [],
        off: []
      },
      label: 'none',
      candidateYforTest: anchorBox.y
    }, -1, -1)
  );

  // unwrapping 'reposition' from the adt, for both fit & nofit the first arg is the one we need,
  // so we can cheat and use Fun.identity
  return abc.fold(Fun.identity, Fun.identity);
};

export { attempts, calcReposition };
