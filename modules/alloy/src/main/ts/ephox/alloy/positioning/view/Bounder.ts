import { Adt, Arr, Fun } from '@ephox/katamari';
import { Bounds } from '../../alien/Boxes';
import { cap } from '../../alien/Cycles';
import { Bubble } from '../layout/Bubble';
import * as Direction from '../layout/Direction';
import { AnchorBox, AnchorElement, AnchorLayout } from '../layout/LayoutTypes';
import * as Reposition from './Reposition';
import { SpotInfo } from './SpotInfo';

export interface BounderAttemptAdt extends Adt {
}

const adt: {
  fit: ( reposition: Reposition.RepositionDecision ) => BounderAttemptAdt;
  nofit: (reposition: Reposition.RepositionDecision, deltaW: number, deltaH: number) => BounderAttemptAdt;
} = Adt.generate([
  { fit:   [ 'reposition' ] },
  { nofit: [ 'reposition', 'deltaW', 'deltaH' ] }
]);

const calcReposition = (newX: number, newY: number, width: number, height: number, bounds: Bounds) => {
  const boundsX = bounds.x();
  const boundsY = bounds.y();
  const boundsWidth = bounds.width();
  const boundsHeight = bounds.height();

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

  // TBIO-3366 + TBIO-4236:
  // Futz with the X position to ensure that x is positive, but not off the right side of the screen.
  // NOTE: bounds.x() is 0 in repartee here.
  const limitX = cap(newX, bounds.x(), bounds.right());
  // Futz with the Y value to ensure that we're not off the top of the screen
  const limitY = cap(newY, bounds.y(), bounds.bottom());

  return {
    originInBounds,
    sizeInBounds,
    limitX,
    limitY,
    deltaW,
    deltaH
  };
};

const attempt = (candidate: SpotInfo, width: number, height: number, bounds: Bounds): BounderAttemptAdt  => {
  const candidateX = candidate.x();
  const candidateY = candidate.y();
  const bubbleLeft = candidate.bubble().offset().left();
  const bubbleTop = candidate.bubble().offset().top();

  const boundsY = bounds.y();
  const boundsBottom = bounds.bottom();

  const boundsX = bounds.x();
  const boundsRight = bounds.right();

  // candidate position is excluding the bubble, so add those values as well
  const newX = candidateX + bubbleLeft;
  const newY = candidateY + bubbleTop;

  const { originInBounds, sizeInBounds, limitX, limitY, deltaW, deltaH } = calcReposition(newX, newY, width, height, bounds);

  // TBIO-3367 + TBIO-3387:
  // Futz with the "height" of the popup to ensure if it doesn't fit it's capped at the available height.
  // As of TBIO-4291, we provide all available space for both up and down.
  const upAvailable = Fun.constant((limitY + deltaH) - boundsY);
  const downAvailable = Fun.constant(boundsBottom - limitY);
  const maxHeight = Direction.cataVertical(candidate.direction(), downAvailable, /* middle */ downAvailable, upAvailable);

  const westAvailable = Fun.constant((limitX + deltaW) - boundsX);
  const eastAvailable = Fun.constant(boundsRight - limitX);
  const maxWidth = Direction.cataHorizontal(candidate.direction(), eastAvailable, /* middle */ eastAvailable, westAvailable);

  const reposition = Reposition.decision({
    x: limitX,
    y: limitY,
    width: deltaW,
    height: deltaH,
    maxHeight,
    maxWidth,
    direction: candidate.direction(),
    classes: {
      on: candidate.bubble().classesOn(),
      off: candidate.bubble().classesOff()
    },
    label: candidate.label(),
    candidateYforTest: newY
  });

  // useful debugging that I don't want to lose
  // console.log(candidate.label());
  // console.log('xfit', (boundsX + boundsWidth), ',', (newX + width), ',', newX);
  // console.log('yfit', (boundsY + boundsHeight), ',', (newY + height), ',', newY, ',', height);
  // console.table([{
  //   xInBounds,
  //   xFit,
  //   limitX,
  //   minX,
  //   maxX,
  //   deltaW,
  //   boundsX,
  //   boundsWidth,
  //   candidateX: candidate.x(),
  //   newX,
  //   width
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
const attempts = (candidates: AnchorLayout[], anchorBox: AnchorBox, elementBox: AnchorElement, bubbles: Bubble, bounds: Bounds): Reposition.RepositionDecision => {
  const panelWidth = elementBox.width();
  const panelHeight = elementBox.height();
  const attemptBestFit = (layout: AnchorLayout, reposition: Reposition.RepositionDecision, deltaW: number, deltaH: number) => {
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
    adt.nofit(Reposition.decision({
      x: anchorBox.x(),
      y: anchorBox.y(),
      width: elementBox.width(),
      height: elementBox.height(),
      maxHeight: elementBox.height(),
      maxWidth: elementBox.width(),
      direction: Direction.southeast(),
      classes: {
        on: [],
        off: []
      },
      label: 'none',
      candidateYforTest: anchorBox.y()
    }), -1, -1)
  );

  // unwrapping 'reposition' from the adt, for both fit & nofit the first arg is the one we need,
  // so we can cheat and use Fun.identity
  return abc.fold(Fun.identity, Fun.identity) as Reposition.RepositionDecision;
};

export { attempts, calcReposition };
