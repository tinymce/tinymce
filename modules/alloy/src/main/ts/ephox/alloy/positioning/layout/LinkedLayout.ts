import { nu as NuSpotInfo } from '../view/SpotInfo';
import * as Direction from './Direction';
import { AnchorBoxBounds, boundsRestriction } from './LayoutBounds';
import { AnchorBox, AnchorElement, AnchorLayout } from './LayoutTypes';
import { Placement } from './Placement';

/*
  Layout for submenus;
  Either left or right of the anchor menu item. Never above or below.
  Aligned to the top or bottom of the anchor as appropriate.
 */

const labelPrefix = 'link-layout';

// display element to the right, left edge against the right of the menu
const eastX = (anchor: AnchorBox): number => anchor.x + anchor.width;

// display element to the left, right edge against the left of the menu
const westX = (anchor: AnchorBox, element: AnchorElement): number => anchor.x - element.width;

// display element pointing up, bottom edge against the bottom of the menu (usually to one side)
const northY = (anchor: AnchorBox, element: AnchorElement): number => anchor.y - element.height + anchor.height;

// display element pointing down, top edge against the top of the menu (usually to one side)
const southY = (anchor: AnchorBox): number => anchor.y;

const southeast: AnchorLayout = (anchor, element, bubbles) => NuSpotInfo(
  eastX(anchor),
  southY(anchor),
  bubbles.southeast(),
  Direction.southeast(),
  Placement.Southeast,
  boundsRestriction(anchor, { left: AnchorBoxBounds.RightEdge, top: AnchorBoxBounds.TopEdge }),
  labelPrefix
);

const southwest: AnchorLayout = (anchor, element, bubbles) => NuSpotInfo(
  westX(anchor, element),
  southY(anchor),
  bubbles.southwest(),
  Direction.southwest(),
  Placement.Southwest,
  boundsRestriction(anchor, { right: AnchorBoxBounds.LeftEdge, top: AnchorBoxBounds.TopEdge }),
  labelPrefix
);

const northeast: AnchorLayout = (anchor, element, bubbles) => NuSpotInfo(
  eastX(anchor),
  northY(anchor, element),
  bubbles.northeast(),
  Direction.northeast(),
  Placement.Northeast,
  boundsRestriction(anchor, { left: AnchorBoxBounds.RightEdge, bottom: AnchorBoxBounds.BottomEdge }),
  labelPrefix
);

const northwest: AnchorLayout = (anchor, element, bubbles) => NuSpotInfo(
  westX(anchor, element),
  northY(anchor, element),
  bubbles.northwest(),
  Direction.northwest(),
  Placement.Northwest,
  boundsRestriction(anchor, { right: AnchorBoxBounds.LeftEdge, bottom: AnchorBoxBounds.BottomEdge }),
  labelPrefix
);

const all = (): AnchorLayout[] => [ southeast, southwest, northeast, northwest ];
const allRtl = (): AnchorLayout[] => [ southwest, southeast, northwest, northeast ];

export {
  southeast,
  northeast,
  southwest,
  northwest,
  all,
  allRtl
};
