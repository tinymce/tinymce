import { nu as NuSpotInfo } from '../view/SpotInfo';
import { Bubble } from './Bubble';
import * as Direction from './Direction';
import { AnchorBox, AnchorElement, AnchorLayout } from './LayoutTypes';

/*
  Layouts for things that go inside the editable area.
  Designed for use with fixed_toolbar_container.
  See the LayoutInsideDemo for examples.
 */

// returns left edge of anchor - used to display element to the left, left edge against the anchor
const westEdgeX = (anchor: AnchorBox): number => {
  return anchor.x();
};

// returns middle of anchor minus half the element width - used to horizontally centre element to the anchor
const middleX = (anchor: AnchorBox, element: AnchorElement): number => {
  return anchor.x() + (anchor.width() / 2) - (element.width() / 2);
};

// returns right edge of anchor minus element width - used to display element to the right, right edge against the anchor
const eastEdgeX = (anchor: AnchorBox, element: AnchorElement): number => {
  return anchor.x() + anchor.width() - element.width();
};

// returns top edge - used to display element to the top, top edge against the anchor
const northY = (anchor: AnchorBox): number => {
  return anchor.y();
};

// returns bottom edge minus element height - used to display element at the bottom, bottom edge against the anchor
const southY = (anchor: AnchorBox, element: AnchorElement): number => {
  return anchor.y() + anchor.height() - element.height();
};

// returns centre of anchor minus half the element height - used to vertically centre element to the anchor
const centreY = (anchor: AnchorBox, element: AnchorElement): number => {
  return anchor.y() + (anchor.height() / 2) - (element.height() / 2);
};

// positions element in bottom right of the anchor
const southeast: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble) => {
  return NuSpotInfo(westEdgeX(anchor), southY(anchor, element), bubbles.southeast(), Direction.southeast(), 'layout-se');
};

// positions element in the bottom left of the anchor
const southwest: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble) => {
  return NuSpotInfo(eastEdgeX(anchor, element), southY(anchor, element), bubbles.southwest(), Direction.southwest(), 'layout-sw');
};

// positions element in the top right of the anchor
const northeast: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble) => {
  return NuSpotInfo(westEdgeX(anchor), northY(anchor), bubbles.northeast(), Direction.northeast(), 'layout-ne');
};

// positions element in the top left of the anchor
const northwest: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble) => {
  return NuSpotInfo(eastEdgeX(anchor, element), northY(anchor), bubbles.northwest(), Direction.northwest(), 'layout-nw');
};

// positions element at the top of the anchor, horizontally centered
const north: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble) => {
  return NuSpotInfo(middleX(anchor, element), northY(anchor), bubbles.north(), Direction.north(), 'layout-n');
};

// positions element at the bottom of the anchor, horizontally centered
const south: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble) => {
  return NuSpotInfo(middleX(anchor, element), southY(anchor, element), bubbles.south(), Direction.south(), 'layout-s');
};

// positions element with right edge against the anchor, vertically centered
const east: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble) => {
  return NuSpotInfo(eastEdgeX(anchor, element), centreY(anchor, element), bubbles.east(), Direction.east(), 'layout-e');
};

// positions element with left each against the anchor, vertically centered
const west: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble) => {
  return NuSpotInfo(westEdgeX(anchor), centreY(anchor, element), bubbles.west(), Direction.west(), 'layout-w');
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