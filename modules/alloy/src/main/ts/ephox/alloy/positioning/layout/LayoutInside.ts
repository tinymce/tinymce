import { nu as NuSpotInfo } from '../view/SpotInfo';
import { Bubble } from './Bubble';
import * as Direction from './Direction';
import { AnchorBoxBounds, boundsRestriction } from './LayoutBounds';
import { AnchorBox, AnchorElement, AnchorLayout } from './LayoutTypes';

/*
  Layouts for things that go inside the editable area.
  Designed for use with fixed_toolbar_container.
  See the LayoutInsideDemo for examples.
 */

// returns left edge of anchor - used to display element to the left, left edge against the anchor
const westEdgeX = (anchor: AnchorBox): number => anchor.x;

// returns middle of anchor minus half the element width - used to horizontally centre element to the anchor
const middleX = (anchor: AnchorBox, element: AnchorElement): number => anchor.x + (anchor.width / 2) - (element.width / 2);

// returns right edge of anchor minus element width - used to display element to the right, right edge against the anchor
const eastEdgeX = (anchor: AnchorBox, element: AnchorElement): number => anchor.x + anchor.width - element.width;

// returns top edge - used to display element to the top, top edge against the anchor
const northY = (anchor: AnchorBox): number => anchor.y;

// returns bottom edge minus element height - used to display element at the bottom, bottom edge against the anchor
const southY = (anchor: AnchorBox, element: AnchorElement): number => anchor.y + anchor.height - element.height;

// returns centre of anchor minus half the element height - used to vertically centre element to the anchor
const centreY = (anchor: AnchorBox, element: AnchorElement): number => anchor.y + (anchor.height / 2) - (element.height / 2);

// positions element in bottom right of the anchor
const southeast: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble) => NuSpotInfo(
  eastEdgeX(anchor, element),
  southY(anchor, element),
  bubbles.innerSoutheast(),
  Direction.northwest(),
  boundsRestriction(anchor, { right: AnchorBoxBounds.RightEdge, bottom: AnchorBoxBounds.BottomEdge }),
  'layout-inner-se'
);

// positions element in the bottom left of the anchor
const southwest: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble) => NuSpotInfo(
  westEdgeX(anchor),
  southY(anchor, element),
  bubbles.innerSouthwest(),
  Direction.northeast(),
  boundsRestriction(anchor, { left: AnchorBoxBounds.LeftEdge, bottom: AnchorBoxBounds.BottomEdge }),
  'layout-inner-sw'
);

// positions element in the top right of the anchor
const northeast: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble) => NuSpotInfo(
  eastEdgeX(anchor, element),
  northY(anchor),
  bubbles.innerNortheast(),
  Direction.southwest(),
  boundsRestriction(anchor, { right: AnchorBoxBounds.RightEdge, top: AnchorBoxBounds.TopEdge }),
  'layout-inner-ne'
);

// positions element in the top left of the anchor
const northwest: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble) => NuSpotInfo(
  westEdgeX(anchor),
  northY(anchor),
  bubbles.innerNorthwest(),
  Direction.southeast(),
  boundsRestriction(anchor, { left: AnchorBoxBounds.LeftEdge, top: AnchorBoxBounds.TopEdge }),
  'layout-inner-nw'
);

// positions element at the top of the anchor, horizontally centered
const north: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble) => NuSpotInfo(
  middleX(anchor, element),
  northY(anchor),
  bubbles.innerNorth(),
  Direction.south(),
  boundsRestriction(anchor, { top: AnchorBoxBounds.TopEdge }),
  'layout-inner-n');

// positions element at the bottom of the anchor, horizontally centered
const south: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble) => NuSpotInfo(
  middleX(anchor, element),
  southY(anchor, element),
  bubbles.innerSouth(),
  Direction.north(),
  boundsRestriction(anchor, { bottom: AnchorBoxBounds.BottomEdge }),
  'layout-inner-s'
);

// positions element with right edge against the anchor, vertically centered
const east: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble) => NuSpotInfo(
  eastEdgeX(anchor, element),
  centreY(anchor, element),
  bubbles.innerEast(),
  Direction.west(),
  boundsRestriction(anchor, { right: AnchorBoxBounds.RightEdge }),
  'layout-inner-e');

// positions element with left each against the anchor, vertically centered
const west: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble) => NuSpotInfo(
  westEdgeX(anchor),
  centreY(anchor, element),
  bubbles.innerWest(),
  Direction.east(),
  boundsRestriction(anchor, { left: AnchorBoxBounds.LeftEdge }),
  'layout-inner-w'
);

const all = (): AnchorLayout[] => [ southeast, southwest, northeast, northwest, south, north, east, west ];

const allRtl = (): AnchorLayout[] => [ southwest, southeast, northwest, northeast, south, north, east, west ];

export {
  southeast,
  northeast,
  southwest,
  northwest,
  south,
  north,
  east,
  west,
  all,
  allRtl
};
