import { nu as NuSpotInfo } from '../view/SpotInfo';
import { Bubble } from './Bubble';
import * as Direction from './Direction';
import { boundsRestriction } from './LayoutBounds';
import { AnchorBox, AnchorElement, AnchorLayout } from './LayoutTypes';

const pinAtTop: AnchorLayout = (
  anchor: AnchorBox,
  element: AnchorElement,
  bubbles: Bubble
) => {
  return NuSpotInfo(
    // cap the bounds.
    anchor.x + anchor.width / 2 - element.width / 2,
    anchor.y - element.height,
    bubbles.north(),
    Direction.north(),
    boundsRestriction(anchor, {}),
    'north-docked',
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
    anchor.x + anchor.width / 2 - element.width / 2,
    anchor.y + anchor.height,
    bubbles.south(),
    Direction.south(),
    boundsRestriction(anchor, {}),
    'south-docked',
    true
  );
};

export { pinAtTop, pinAtBottom };
