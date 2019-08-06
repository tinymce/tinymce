import { nu as NuSpotInfo } from '../view/SpotInfo';
import { Bubble } from './Bubble';
import * as Direction from './Direction';
import { AnchorBox, AnchorElement, AnchorLayout } from './LayoutTypes';

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

const southeast: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble) => {
  return NuSpotInfo(eastX(anchor), southY(anchor), bubbles.southeast(), Direction.southeast(), 'layout-se');
};

const southwest: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble) => {
  return NuSpotInfo(westX(anchor, element), southY(anchor), bubbles.southwest(), Direction.southwest(), 'layout-sw');
};

const northeast: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble) => {
  return NuSpotInfo(eastX(anchor), northY(anchor, element), bubbles.northeast(), Direction.northeast(), 'layout-ne');
};

const northwest: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble) => {
  return NuSpotInfo(westX(anchor, element), northY(anchor, element), bubbles.northwest(), Direction.northwest(), 'layout-nw');
};

const north: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble) => {
  return NuSpotInfo(middleX(anchor, element), northY(anchor, element), bubbles.north(), Direction.north(), 'layout-n');
};

const south: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble) => {
  return NuSpotInfo(middleX(anchor, element), southY(anchor), bubbles.south(), Direction.south(), 'layout-s');
};

const east: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble) => {
  return NuSpotInfo(eastEdgeX(anchor), centreY(anchor, element), bubbles.east(), Direction.east(), 'layout-e');
};

const west: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble) => {
  return NuSpotInfo(westEdgeX(anchor, element), centreY(anchor, element), bubbles.west(), Direction.west(), 'layout-w');
};

const all = (): AnchorLayout[] => {
  return [ southeast, southwest, northeast, northwest, south, north, east, west ];
};

const allRtl = (): AnchorLayout[] => {
  return [ southwest, southeast, northwest, northeast, south, north, east, west ];
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
  allRtl
};
