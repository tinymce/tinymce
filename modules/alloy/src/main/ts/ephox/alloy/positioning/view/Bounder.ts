import { Adt, Arr, Fun, Num } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import * as Boxes from '../../alien/Boxes';
import { Bubble } from '../layout/Bubble';
import * as Direction from '../layout/Direction';
import * as LayoutBounds from '../layout/LayoutBounds';
import { AnchorBox, AnchorElement, AnchorLayout } from '../layout/LayoutTypes';
import { Placement } from '../layout/Placement';
import { RepositionDecision } from './Reposition';
import { SpotInfo } from './SpotInfo';

export interface BounderAttemptAdt {
  fold: <T>(
    fit: (reposition: RepositionDecision) => T,
    nofit: (reposition: RepositionDecision, visibleW: number, visibleH: number, isVisible: boolean) => T
  ) => T;
  match: <T>(branches: {
    fit: (reposition: RepositionDecision) => T;
    nofit: (reposition: RepositionDecision, visibleW: number, visibleH: number, isVisible: boolean) => T;
  }) => T;
  log: (label: string) => void;
}

interface PositionResult {
  readonly originInBounds: boolean;
  readonly sizeInBounds: boolean;
  readonly visibleW: number;
  readonly visibleH: number;
}

interface MaxSizes {
  readonly maxWidth: number;
  readonly maxHeight: number;
}

const adt: {
  fit: (reposition: RepositionDecision) => BounderAttemptAdt;
  nofit: (reposition: RepositionDecision, visibleW: number, visibleH: number, isVisible: boolean) => BounderAttemptAdt;
} = Adt.generate([
  { fit: [ 'reposition' ] },
  { nofit: [ 'reposition', 'visibleW', 'visibleH', 'isVisible' ] }
]);

/**
 * This will attempt to determine if the box will fit within the specified bounds or if it needs to be repositioned.
 * It will return the following details:
 *  - if the original rect was in bounds (originInBounds & sizeInBounds). This is used to determine if we fitted
 *    without having to make adjustments.
 *  - the height and width that would be visible in the original location. (ie the overlap between the rect and
 *    the bounds or the distance between the boxes if there is no overlap)
 */
const determinePosition = (box: Boxes.Bounds, bounds: Boxes.Bounds): PositionResult => {
  const { x: boundsX, y: boundsY, right: boundsRight, bottom: boundsBottom } = bounds;
  const { x, y, right, bottom, width, height } = box;

  // simple checks for "is the top left inside the view"
  const xInBounds = x >= boundsX && x <= boundsRight;
  const yInBounds = y >= boundsY && y <= boundsBottom;
  const originInBounds = xInBounds && yInBounds;

  // simple checks for "is the bottom right inside the view"
  const rightInBounds = right <= boundsRight && right >= boundsX;
  const bottomInBounds = bottom <= boundsBottom && bottom >= boundsY;
  const sizeInBounds = rightInBounds && bottomInBounds;

  // measure how much of the width and height are visible. This should never be larger than the actual width or height
  // however it can be a negative value when offscreen. These values are generally are only needed for the "nofit" case
  const visibleW = Math.min(width, x >= boundsX ? boundsRight - x : right - boundsX);
  const visibleH = Math.min(height, y >= boundsY ? boundsBottom - y : bottom - boundsY);

  return {
    originInBounds,
    sizeInBounds,
    visibleW,
    visibleH
  };
};

/**
 * This will attempt to calculate and adjust the position of the box so that is stays within the specified bounds.
 * The end result will be a new restricted box of where it can safely be placed within the bounds.
 */
const calcReposition = (box: Boxes.Bounds, bounds: Boxes.Bounds): Boxes.Bounds => {
  const { x: boundsX, y: boundsY, right: boundsRight, bottom: boundsBottom } = bounds;
  const { x, y, width, height } = box;

  // measure the maximum x and y taking into account the height and width of the box
  const maxX = Math.max(boundsX, boundsRight - width);
  const maxY = Math.max(boundsY, boundsBottom - height);

  // Futz with the X value to ensure that we're not off the left or right of the screen
  const restrictedX = Num.clamp(x, boundsX, maxX);
  // Futz with the Y value to ensure that we're not off the top or bottom of the screen
  const restrictedY = Num.clamp(y, boundsY, maxY);

  // Determine the new height and width based on the restricted X/Y to keep the element in bounds
  const restrictedWidth = Math.min(restrictedX + width, boundsRight) - restrictedX;
  const restrictedHeight = Math.min(restrictedY + height, boundsBottom) - restrictedY;

  return Boxes.bounds(restrictedX, restrictedY, restrictedWidth, restrictedHeight);
};

/**
 * Determine the maximum height and width available for where the box is positioned in the bounds, making sure
 * to account for which direction it's rendering in.
 */
const calcMaxSizes = (direction: Direction.DirectionAdt, box: Boxes.Bounds, bounds: Boxes.Bounds): MaxSizes => {
  // Futz with the "height" of the popup to ensure if it doesn't fit it's capped at the available height.
  const upAvailable = Fun.constant(box.bottom - bounds.y);
  const downAvailable = Fun.constant(bounds.bottom - box.y);
  const maxHeight = Direction.cataVertical(direction, downAvailable, /* middle */ downAvailable, upAvailable);

  // Futz with the "width" of the popup to ensure if it doesn't fit it's capped at the available width.
  const westAvailable = Fun.constant(box.right - bounds.x);
  const eastAvailable = Fun.constant(bounds.right - box.x);
  const maxWidth = Direction.cataHorizontal(direction, eastAvailable, /* middle */ eastAvailable, westAvailable);

  return {
    maxWidth,
    maxHeight
  };
};

const attempt = (candidate: SpotInfo, width: number, height: number, bounds: Boxes.Bounds): BounderAttemptAdt => {
  const bubble = candidate.bubble;
  const bubbleOffset = bubble.offset;

  // adjust the bounds to account for the layout and bubble restrictions
  const adjustedBounds = LayoutBounds.adjustBounds(bounds, candidate.restriction, bubbleOffset);

  // candidate position is excluding the bubble, so add those values as well
  const newX = candidate.x + bubbleOffset.left;
  const newY = candidate.y + bubbleOffset.top;
  const box = Boxes.bounds(newX, newY, width, height);

  // determine the position of the box in relation to the bounds
  const { originInBounds, sizeInBounds, visibleW, visibleH } = determinePosition(box, adjustedBounds);

  // restrict the box if it won't fit in the bounds
  const fits = originInBounds && sizeInBounds;
  const fittedBox = fits ? box : calcReposition(box, adjustedBounds);

  // Determine if the box is at least partly visible in the bounds after applying the restrictions
  const isPartlyVisible = fittedBox.width > 0 && fittedBox.height > 0;

  // Determine the maximum height and width available in the bounds
  const { maxWidth, maxHeight } = calcMaxSizes(candidate.direction, fittedBox, bounds);

  const reposition: RepositionDecision = {
    rect: fittedBox,
    maxHeight,
    maxWidth,
    direction: candidate.direction,
    placement: candidate.placement,
    classes: {
      on: bubble.classesOn,
      off: bubble.classesOff
    },
    layout: candidate.label,
    testY: newY
  };

  // useful debugging that I don't want to lose
  // console.log(candidate.label);
  // console.table([{
  //   newY,
  //   limitY: fittedBox.y,
  //   boundsY: bounds.y,
  //   boundsBottom: bounds.bottom,
  //   newX,
  //   limitX: fittedBox.x,
  //   boundsX: bounds.x,
  //   boundsRight: bounds.right,
  //   candidateX: candidate.x,
  //   candidateY: candidate.y,
  //   width,
  //   height,
  //   isPartlyVisible
  // }]);
  // console.log(`maxWidth: ${maxWidth}, visibleW: ${visibleW}`);
  // console.log(`maxHeight: ${maxHeight}, visibleH: ${visibleH}`);
  // console.log('originInBounds:', originInBounds);
  // console.log('sizeInBounds:', sizeInBounds);
  // console.log(originInBounds && sizeInBounds ? 'fit' : 'nofit');

  // Take special note that we don't use the futz values in the nofit case; whether this position is a good fit is separate
  // to ensuring that if we choose it the popup is actually on screen properly.
  return fits || candidate.alwaysFit ? adt.fit(reposition) : adt.nofit(reposition, visibleW, visibleH, isPartlyVisible);
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
const attempts = (element: SugarElement<HTMLElement>, candidates: AnchorLayout[], anchorBox: AnchorBox, elementBox: AnchorElement, bubbles: Bubble, bounds: Boxes.Bounds): RepositionDecision => {
  const panelWidth = elementBox.width;
  const panelHeight = elementBox.height;
  const attemptBestFit = (layout: AnchorLayout, reposition: RepositionDecision, visibleW: number, visibleH: number, isVisible: boolean) => {
    const next: SpotInfo = layout(anchorBox, elementBox, bubbles, element, bounds);
    const attemptLayout = attempt(next, panelWidth, panelHeight, bounds);

    return attemptLayout.fold(Fun.constant(attemptLayout), (newReposition, newVisibleW, newVisibleH, newIsVisible) => {
      // console.log(`label: ${next.label}, newVisibleW: ${newVisibleW}, visibleW: ${visibleW}, newVisibleH: ${newVisibleH}, visibleH: ${visibleH}, newIsVisible: ${newIsVisible}, isVisible: ${isVisible}`);
      const improved = isVisible === newIsVisible ? (newVisibleH > visibleH || newVisibleW > visibleW) : (!isVisible && newIsVisible);
      // console.log('improved? ', improved);
      return improved ? attemptLayout : adt.nofit(reposition, visibleW, visibleH, isVisible);
    });
  };

  const abc = Arr.foldl(
    candidates,
    (b, a) => {
      const bestNext = Fun.curry(attemptBestFit, a);
      return b.fold(Fun.constant(b), bestNext);
    },
    // fold base case: No candidates, it's never going to be correct, so do whatever
    adt.nofit({
      rect: anchorBox,
      maxHeight: elementBox.height,
      maxWidth: elementBox.width,
      direction: Direction.southeast(),
      placement: Placement.Southeast,
      classes: {
        on: [],
        off: []
      },
      layout: 'none',
      testY: anchorBox.y
    }, -1, -1, false)
  );

  // unwrapping 'reposition' from the adt, for both fit & nofit the first arg is the one we need,
  // so we can cheat and use Fun.identity
  return abc.fold(Fun.identity, Fun.identity);
};

export { attempts, determinePosition, calcReposition };
