import { nu as NuSpotInfo } from '../view/SpotInfo';
import { Bubble } from './Bubble';
import * as Direction from './Direction';
import { boundsRestriction, AnchorBoxBounds } from './LayoutBounds';
import { AnchorBox, AnchorElement, AnchorLayout } from './LayoutTypes';
import { Placement } from './Placement';

/*
  Layout for menus and inline context dialogs;
  Either above or below. Never left or right.
  Aligned to the left or right of the anchor as appropriate.
 */

const labelPrefix = 'layout';

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
  Placement.Southeast,
  boundsRestriction(anchor, { left: AnchorBoxBounds.LeftEdge, top: AnchorBoxBounds.BottomEdge }),
  labelPrefix
);

const southwest: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble) => NuSpotInfo(
  westX(anchor, element),
  southY(anchor),
  bubbles.southwest(),
  Direction.southwest(),
  Placement.Southwest,
  boundsRestriction(anchor, { right: AnchorBoxBounds.RightEdge, top: AnchorBoxBounds.BottomEdge }),
  labelPrefix
);

const northeast: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble) => NuSpotInfo(
  eastX(anchor),
  northY(anchor, element),
  bubbles.northeast(),
  Direction.northeast(),
  Placement.Northeast,
  boundsRestriction(anchor, { left: AnchorBoxBounds.LeftEdge, bottom: AnchorBoxBounds.TopEdge }),
  labelPrefix
);

const northwest: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble) => NuSpotInfo(
  westX(anchor, element),
  northY(anchor, element),
  bubbles.northwest(),
  Direction.northwest(),
  Placement.Northwest,
  boundsRestriction(anchor, { right: AnchorBoxBounds.RightEdge, bottom: AnchorBoxBounds.TopEdge }),
  labelPrefix
);

const north: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble) => NuSpotInfo(
  middleX(anchor, element),
  northY(anchor, element),
  bubbles.north(),
  Direction.north(),
  Placement.North,
  boundsRestriction(anchor, { bottom: AnchorBoxBounds.TopEdge }),
  labelPrefix
);

const south: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble) => NuSpotInfo(
  middleX(anchor, element),
  southY(anchor),
  bubbles.south(),
  Direction.south(),
  Placement.South,
  boundsRestriction(anchor, { top: AnchorBoxBounds.BottomEdge }),
  labelPrefix
);

const east: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble) => NuSpotInfo(
  eastEdgeX(anchor),
  centreY(anchor, element),
  bubbles.east(),
  Direction.east(),
  Placement.East,
  boundsRestriction(anchor, { left: AnchorBoxBounds.RightEdge }),
  labelPrefix
);

const west: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble) => NuSpotInfo(
  westEdgeX(anchor, element),
  centreY(anchor, element),
  bubbles.west(),
  Direction.west(),
  Placement.West,
  boundsRestriction(anchor, { right: AnchorBoxBounds.LeftEdge }),
  labelPrefix
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
