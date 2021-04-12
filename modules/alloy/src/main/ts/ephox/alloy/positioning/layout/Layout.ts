import { nu as NuSpotInfo } from '../view/SpotInfo';
import { Bubble } from './Bubble';
import * as Direction from './Direction';
import { boundsRestriction, AnchorBoxBounds } from './LayoutBounds';
import * as LayoutLabels from './LayoutLabels';
import { AnchorBox, AnchorElement, AnchorLayout } from './LayoutTypes';

/*
  Layout for menus and inline context dialogs;
  Either above or below. Never left or right.
  Aligned to the left or right of the anchor as appropriate.
 */

// display element to the right, left edge against the anchor
const eastX = (anchor: AnchorBox): number => anchor.x;

// element centre aligned horizontally with the anchor
const middleX = (anchor: AnchorBox, element: AnchorElement): number => anchor.x + (anchor.width / 2) - (element.width / 2);

// display element to the left, right edge against the right of the anchor
const westX = (anchor: AnchorBox, element: AnchorElement): number => anchor.x + anchor.width - element.width;

// display element above, bottom edge against the top of the anchor
const northY = (anchor: AnchorBox, element: AnchorElement): number => anchor.y - element.height;

// display element below, top edge against the bottom of the anchor
const southY = (anchor: AnchorBox): number => anchor.y + anchor.height;

// display element below, top edge against the bottom of the anchor
const centreY = (anchor: AnchorBox, element: AnchorElement): number => anchor.y + (anchor.height / 2) - (element.height / 2);

const eastEdgeX = (anchor: AnchorBox): number => anchor.x + anchor.width;

const westEdgeX = (anchor: AnchorBox, element: AnchorElement): number => anchor.x - element.width;

const southeast: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble) => NuSpotInfo(
  eastX(anchor),
  southY(anchor),
  bubbles.southeast(),
  Direction.southeast(),
  boundsRestriction(anchor, { left: AnchorBoxBounds.LeftEdge, top: AnchorBoxBounds.BottomEdge }),
  LayoutLabels.southEast,
  false
);

const southwest: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble) => NuSpotInfo(
  westX(anchor, element),
  southY(anchor),
  bubbles.southwest(),
  Direction.southwest(),
  boundsRestriction(anchor, { right: AnchorBoxBounds.RightEdge, top: AnchorBoxBounds.BottomEdge }),
  LayoutLabels.southWest,
  false
);

const northeast: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble) => NuSpotInfo(
  eastX(anchor),
  northY(anchor, element),
  bubbles.northeast(),
  Direction.northeast(),
  boundsRestriction(anchor, { left: AnchorBoxBounds.LeftEdge, bottom: AnchorBoxBounds.TopEdge }),
  LayoutLabels.northEast,
  false
);

const northwest: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble) => NuSpotInfo(
  westX(anchor, element),
  northY(anchor, element),
  bubbles.northwest(),
  Direction.northwest(),
  boundsRestriction(anchor, { right: AnchorBoxBounds.RightEdge, bottom: AnchorBoxBounds.TopEdge }),
  LayoutLabels.northWest,
  false
);

const north: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble) => NuSpotInfo(
  middleX(anchor, element),
  northY(anchor, element),
  bubbles.north(),
  Direction.north(),
  boundsRestriction(anchor, { bottom: AnchorBoxBounds.TopEdge }),
  LayoutLabels.north,
  false
);

const south: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble) => NuSpotInfo(
  middleX(anchor, element),
  southY(anchor),
  bubbles.south(),
  Direction.south(),
  boundsRestriction(anchor, { top: AnchorBoxBounds.BottomEdge }),
  LayoutLabels.south,
  false
);

const east: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble) => NuSpotInfo(
  eastEdgeX(anchor),
  centreY(anchor, element),
  bubbles.east(),
  Direction.east(),
  boundsRestriction(anchor, { left: AnchorBoxBounds.RightEdge }),
  LayoutLabels.east,
  false
);

const west: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble) => NuSpotInfo(
  westEdgeX(anchor, element),
  centreY(anchor, element),
  bubbles.west(),
  Direction.west(),
  boundsRestriction(anchor, { right: AnchorBoxBounds.LeftEdge }),
  LayoutLabels.west,
  false
);

const all = (): AnchorLayout[] => [ southeast, southwest, northeast, northwest, south, north, east, west ];
const allRtl = (): AnchorLayout[] => [ southwest, southeast, northwest, northeast, south, north, east, west ];

const aboveOrBelow = (): AnchorLayout[] => [ northeast, northwest, southeast, southwest, north, south ];
const aboveOrBelowRtl = (): AnchorLayout[] => [ northwest, northeast, southwest, southeast, north, south ];

const belowOrAbove = (): AnchorLayout[] => [ southeast, southwest, northeast, northwest, south, north ];
const belowOrAboveRtl = (): AnchorLayout[] => [ southwest, southeast, northwest, northeast, south, north ];

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
  allRtl,
  belowOrAbove,
  belowOrAboveRtl,
  aboveOrBelow,
  aboveOrBelowRtl
};
