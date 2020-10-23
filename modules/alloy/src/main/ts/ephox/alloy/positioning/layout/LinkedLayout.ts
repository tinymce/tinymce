import { nu as NuSpotInfo } from '../view/SpotInfo';
import * as Direction from './Direction';
import { AnchorBoxBounds, boundsRestriction } from './LayoutBounds';
import { AnchorBox, AnchorElement, AnchorLayout } from './LayoutTypes';

/*
  Layout for submenus;
  Either left or right of the anchor menu item. Never above or below.
  Aligned to the top or bottom of the anchor as appropriate.
 */

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
  boundsRestriction(anchor, { left: AnchorBoxBounds.RightEdge, top: AnchorBoxBounds.TopEdge }),
  'link-layout-se');

const southwest: AnchorLayout = (anchor, element, bubbles) => NuSpotInfo(
  westX(anchor, element),
  southY(anchor),
  bubbles.southwest(),
  Direction.southwest(),
  boundsRestriction(anchor, { right: AnchorBoxBounds.LeftEdge, top: AnchorBoxBounds.TopEdge }),
  'link-layout-sw'
);

const northeast: AnchorLayout = (anchor, element, bubbles) => NuSpotInfo(
  eastX(anchor),
  northY(anchor, element),
  bubbles.northeast(),
  Direction.northeast(),
  boundsRestriction(anchor, { left: AnchorBoxBounds.RightEdge, bottom: AnchorBoxBounds.BottomEdge }),
  'link-layout-ne'
);

const northwest: AnchorLayout = (anchor, element, bubbles) => NuSpotInfo(
  westX(anchor, element),
  northY(anchor, element),
  bubbles.northwest(),
  Direction.northwest(),
  boundsRestriction(anchor, { right: AnchorBoxBounds.LeftEdge, bottom: AnchorBoxBounds.BottomEdge }),
  'link-layout-nw'
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
