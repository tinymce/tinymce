import * as Direction from './Direction';
import * as Anchors from '../view/Anchors';
import { nu as NuSpotInfo } from '../view/SpotInfo';
import { AnchorBox, AnchorElement, AnchorLayout } from '../../positioning/layout/Layout';
/*
  Layout for submenus;
  Either left or right of the anchor menu item. Never above or below.
  Aligned to the top or bottom of the anchor as appropriate.
 */

// display element to the right, left edge against the right of the menu
const east = (anchor: AnchorBox): number => {
  return anchor.x() + anchor.width();
};

// display element to the left, right edge against the left of the menu
const west = (anchor: AnchorBox, element: AnchorElement): number => {
  return anchor.x() - element.width();
};

// display element pointing up, bottom edge against the bottom of the menu (usually to one side)
const north = (anchor: AnchorBox, element: AnchorElement): number => {
  return anchor.y() - element.height() + anchor.height();
};

// display element pointing down, top edge against the top of the menu (usually to one side)
const south = (anchor: AnchorBox): number => {
  return anchor.y();
};

const southeast: AnchorLayout = (anchor, element, bubbles) => {
  return NuSpotInfo(east(anchor), south(anchor), bubbles.southeast(), Direction.southeast(), [ Anchors.south(), Anchors.east() ], 'link-layout-se');
};

const southwest: AnchorLayout = (anchor, element, bubbles) => {
  return NuSpotInfo(west(anchor, element), south(anchor), bubbles.southwest(), Direction.southwest(), [ Anchors.south(), Anchors.west() ], 'link-layout-sw');
};

const northeast: AnchorLayout = (anchor, element, bubbles) => {
  return NuSpotInfo(east(anchor), north(anchor, element), bubbles.northeast(), Direction.northeast(), [ Anchors.north(), Anchors.east() ], 'link-layout-ne');
};

const northwest: AnchorLayout = (anchor, element, bubbles) => {
  return NuSpotInfo(west(anchor, element), north(anchor, element), bubbles.northwest(), Direction.northwest(), [ Anchors.north(), Anchors.west() ], 'link-layout-nw');
};

const all = (): AnchorLayout[] => {
  return [ southeast, southwest, northeast, northwest ];
};

const allRtl = (): AnchorLayout[] => {
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