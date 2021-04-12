import { nu as NuSpotInfo } from '../view/SpotInfo';
import { Bubble } from './Bubble';
import * as Direction from './Direction';
import { boundsRestriction } from './LayoutBounds';
import * as LayoutLabels from './LayoutLabels';
import { AnchorBox, AnchorElement, AnchorLayout } from './LayoutTypes';

const constrainedTopY = (anchor: AnchorBox, element: AnchorElement) => {
  return anchor.y - element.height;
};
const constrainedBottomY = (anchor: AnchorBox) => {
  return anchor.y + anchor.height;
};

const middleX = (anchor: AnchorBox, element: AnchorElement) => {
  return anchor.x + anchor.width / 2 - element.width / 2;
};

const pinAtTop: AnchorLayout = (
  anchor: AnchorBox,
  element: AnchorElement,
  bubbles: Bubble
) => {
  return NuSpotInfo(
    // cap the bounds.
    middleX(anchor, element),
    constrainedTopY(anchor, element),
    bubbles.north(),
    Direction.north(),
    boundsRestriction(anchor, {}),
    LayoutLabels.northPinned,
    true
  );
};

const pinAtBottom: AnchorLayout = (
  anchor: AnchorBox,
  element: AnchorElement,
  bubbles: Bubble
) => {
  return NuSpotInfo(
    // cap the bounds.
    middleX(anchor, element),
    constrainedBottomY(anchor),
    bubbles.south(),
    Direction.south(),
    boundsRestriction(anchor, {}),
    LayoutLabels.southPinned,
    true
  );
};

export { pinAtTop, pinAtBottom };
