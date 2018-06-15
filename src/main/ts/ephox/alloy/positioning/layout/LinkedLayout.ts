import * as Direction from './Direction';
import * as Anchors from '../view/Anchors';
import SpotInfo from '../view/SpotInfo';

/*
  Layout for submenus;
  Either left or right of the anchor menu item. Never above or below.
  Aligned to the top or bottom of the anchor as appropriate.
 */

// display element to the right, left edge against the right of the menu
const east = (anchor) => {
  return anchor.x() + anchor.width();
};

// display element to the left, right edge against the left of the menu
const west = (anchor, element) => {
  return anchor.x() - element.width();
};

// display element pointing up, bottom edge against the bottom of the menu (usually to one side)
const north = (anchor, element) => {
  return anchor.y() - element.height() + anchor.height();
};

// display element pointing down, top edge against the top of the menu (usually to one side)
const south = (anchor) => {
  return anchor.y();
};

const southeast = (anchor, element, bubbles) => {
  return SpotInfo(east(anchor), south(anchor), bubbles.southeast(), Direction.southeast(), [ Anchors.south(), Anchors.east() ], 'link-layout-se');
};

const southwest = (anchor, element, bubbles) => {
  return SpotInfo(west(anchor, element), south(anchor), bubbles.southwest(), Direction.southwest(), [ Anchors.south(), Anchors.west() ], 'link-layout-sw');
};

const northeast = (anchor, element, bubbles) => {
  return SpotInfo(east(anchor), north(anchor, element), bubbles.northeast(), Direction.northeast(), [ Anchors.north(), Anchors.east() ], 'link-layout-ne');
};

const northwest = (anchor, element, bubbles) => {
  return SpotInfo(west(anchor, element), north(anchor, element), bubbles.northwest(), Direction.northwest(), [ Anchors.north(), Anchors.west() ], 'link-layout-nw');
};

const all = () => {
  return [ southeast, southwest, northeast, northwest ];
};

const allRtl = () => {
  return [ southwest, southeast, northwest, northeast ];
};

export {
  southeast,
  northeast,
  southwest,
  northwest,
  all,
  allRtl
};