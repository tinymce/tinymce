import { Fun } from '@ephox/katamari';
import { Bounds } from '../../alien/Boxes';
import { nu as NuSpotInfo } from '../view/SpotInfo';
import { Bubble } from './Bubble';
import * as Direction from './Direction';
import { adjustBounds, anchorBottom, anchorLeft, anchorRight, anchorTop } from './LayoutBounds';
import { AnchorBox, AnchorElement, AnchorLayout } from './LayoutTypes';

const identity = Fun.identity;

/*
  Layout for menus and inline context dialogs;
  Either above or below. Never left or right.
  Aligned to the left or right of the anchor as appropriate.
 */

 // display element to the right, left edge against the anchor
const eastX = (anchor: AnchorBox): number => {
  return anchor.x();
};

// element centre aligned horizontally with the anchor
const middleX = (anchor: AnchorBox, element: AnchorElement): number => {
  return anchor.x() + (anchor.width() / 2) - (element.width() / 2);
};

// display element to the left, right edge against the right of the anchor
const westX = (anchor: AnchorBox, element: AnchorElement): number => {
  return anchor.x() + anchor.width() - element.width();
};

// display element above, bottom edge against the top of the anchor
const northY = (anchor: AnchorBox, element: AnchorElement): number => {
  return anchor.y() - element.height();
};

// display element below, top edge against the bottom of the anchor
const southY = (anchor: AnchorBox): number => {
  return anchor.y() + anchor.height();
};

// display element below, top edge against the bottom of the anchor
const centreY = (anchor: AnchorBox, element: AnchorElement): number => {
  return anchor.y() + (anchor.height() / 2) - (element.height() / 2);
};

const eastEdgeX = (anchor: AnchorBox): number => {
  return anchor.x() + anchor.width();
};

const westEdgeX = (anchor: AnchorBox, element: AnchorElement): number => {
  return anchor.x() - element.width();
};

const southeast: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble, bounds: Bounds) => {
  return NuSpotInfo(
    eastX(anchor),
    southY(anchor),
    bubbles.southeast(),
    Direction.southeast(),
    adjustBounds(bounds, anchor, bubbles.southeast(), anchorLeft, anchorBottom, identity, identity),
    'layout-se');
};

const southwest: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble, bounds: Bounds) => {
  return NuSpotInfo(
    westX(anchor, element),
    southY(anchor),
    bubbles.southwest(),
    Direction.southwest(),
    adjustBounds(bounds, anchor, bubbles.southwest(), identity, anchorBottom, anchorRight, identity),
    'layout-sw'
  );
};

const northeast: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble, bounds: Bounds) => {
  return NuSpotInfo(
    eastX(anchor),
    northY(anchor, element),
    bubbles.northeast(),
    Direction.northeast(),
    adjustBounds(bounds, anchor, bubbles.northeast(), anchorLeft, identity, identity, anchorTop),
    'layout-ne'
  );
};

const northwest: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble, bounds: Bounds) => {
  return NuSpotInfo(
    westX(anchor, element),
    northY(anchor, element),
    bubbles.northwest(),
    Direction.northwest(),
    adjustBounds(bounds, anchor, bubbles.northwest(), identity, identity, anchorRight, anchorTop),
    'layout-nw'
  );
};

const north: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble, bounds: Bounds) => {
  return NuSpotInfo(
    middleX(anchor, element),
    northY(anchor, element),
    bubbles.north(),
    Direction.north(),
    adjustBounds(bounds, anchor, bubbles.north(), identity, identity, identity, anchorTop),
    'layout-n'
  );
};

const south: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble, bounds: Bounds) => {
  return NuSpotInfo(
    middleX(anchor, element),
    southY(anchor),
    bubbles.south(),
    Direction.south(),
    adjustBounds(bounds, anchor, bubbles.south(), identity, anchorBottom, identity, identity),
    'layout-s'
  );
};

const east: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble, bounds: Bounds) => {
  return NuSpotInfo(
    eastEdgeX(anchor),
    centreY(anchor, element),
    bubbles.east(),
    Direction.east(),
    adjustBounds(bounds, anchor, bubbles.east(), anchorRight, identity, identity, identity),
    'layout-e'
  );
};

const west: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble, bounds: Bounds) => {
  return NuSpotInfo(
    westEdgeX(anchor, element),
    centreY(anchor, element),
    bubbles.west(),
    Direction.west(),
    adjustBounds(bounds, anchor, bubbles.west(), identity, identity, anchorLeft, identity),
    'layout-w'
  );
};

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
