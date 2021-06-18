import { SugarElement } from '@ephox/sugar';

import { nu as NuSpotInfo } from '../view/SpotInfo';
import { Bubble } from './Bubble';
import * as Direction from './Direction';
import { AnchorBoxBounds, boundsRestriction } from './LayoutBounds';
import { AnchorBox, AnchorElement, AnchorLayout } from './LayoutTypes';
import { Placement, getPlacement } from './Placement';

/*
  Layouts for things that overlay over the anchor element/box. These are designed to mirror
  the `Layout` logic.

  As an example `Layout.north` will appear horizontally centered above the anchor, whereas
  `LayoutInside.north` will appear horizontally centered overlapping the top of the anchor.
 */

const labelPrefix = 'layout-inner';

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

// positions element relative to the bottom right of the anchor
const southwest: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble) => NuSpotInfo(
  eastEdgeX(anchor, element),
  southY(anchor, element),
  bubbles.innerSouthwest(),
  Direction.northwest(),
  Placement.Southwest,
  boundsRestriction(anchor, { right: AnchorBoxBounds.RightEdge, bottom: AnchorBoxBounds.BottomEdge }),
  labelPrefix
);

// positions element relative to the bottom left of the anchor
const southeast: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble) => NuSpotInfo(
  westEdgeX(anchor),
  southY(anchor, element),
  bubbles.innerSoutheast(),
  Direction.northeast(),
  Placement.Southeast,
  boundsRestriction(anchor, { left: AnchorBoxBounds.LeftEdge, bottom: AnchorBoxBounds.BottomEdge }),
  labelPrefix
);

// positions element relative to the top right of the anchor
const northwest: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble) => NuSpotInfo(
  eastEdgeX(anchor, element),
  northY(anchor),
  bubbles.innerNorthwest(),
  Direction.southwest(),
  Placement.Northwest,
  boundsRestriction(anchor, { right: AnchorBoxBounds.RightEdge, top: AnchorBoxBounds.TopEdge }),
  labelPrefix
);

// positions element relative to the top left of the anchor
const northeast: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble) => NuSpotInfo(
  westEdgeX(anchor),
  northY(anchor),
  bubbles.innerNortheast(),
  Direction.southeast(),
  Placement.Northeast,
  boundsRestriction(anchor, { left: AnchorBoxBounds.LeftEdge, top: AnchorBoxBounds.TopEdge }),
  labelPrefix
);

// positions element relative to the top of the anchor, horizontally centered
const north: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble) => NuSpotInfo(
  middleX(anchor, element),
  northY(anchor),
  bubbles.innerNorth(),
  Direction.south(),
  Placement.North,
  boundsRestriction(anchor, { top: AnchorBoxBounds.TopEdge }),
  labelPrefix
);

// positions element relative to the bottom of the anchor, horizontally centered
const south: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble) => NuSpotInfo(
  middleX(anchor, element),
  southY(anchor, element),
  bubbles.innerSouth(),
  Direction.north(),
  Placement.South,
  boundsRestriction(anchor, { bottom: AnchorBoxBounds.BottomEdge }),
  labelPrefix
);

// positions element with the right edge against the anchor, vertically centered
const east: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble) => NuSpotInfo(
  eastEdgeX(anchor, element),
  centreY(anchor, element),
  bubbles.innerEast(),
  Direction.west(),
  Placement.East,
  boundsRestriction(anchor, { right: AnchorBoxBounds.RightEdge }),
  labelPrefix
);

// positions element with the left each against the anchor, vertically centered
const west: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble) => NuSpotInfo(
  westEdgeX(anchor),
  centreY(anchor, element),
  bubbles.innerWest(),
  Direction.east(),
  Placement.West,
  boundsRestriction(anchor, { left: AnchorBoxBounds.LeftEdge }),
  labelPrefix
);

const all = (): AnchorLayout[] => [ southeast, southwest, northeast, northwest, south, north, east, west ];
const allRtl = (): AnchorLayout[] => [ southwest, southeast, northwest, northeast, south, north, east, west ];

const lookupPreserveLayout = (lastPlacement: Placement) => {
  switch (lastPlacement) {
    case Placement.North:
      return north;
    case Placement.Northeast:
      return northeast;
    case Placement.Northwest:
      return northwest;
    case Placement.South:
      return south;
    case Placement.Southeast:
      return southeast;
    case Placement.Southwest:
      return southwest;
    case Placement.East:
      return east;
    case Placement.West:
      return west;
  }
};

const preserve: AnchorLayout = (
  anchor: AnchorBox,
  element: AnchorElement,
  bubbles: Bubble,
  placee: SugarElement<HTMLElement>
) => {
  const lastPlacement = getPlacement(placee).getOr(Placement.North);
  const layout = lookupPreserveLayout(lastPlacement);
  return layout(anchor, element, bubbles, placee);
};

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
  preserve
};
