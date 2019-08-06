import { nu as NuSpotInfo } from '../view/SpotInfo';
import * as Direction from './Direction';
import { AnchorBox, AnchorElement, AnchorLayout } from './LayoutTypes';
/*
  Layout for submenus;
  Either left or right of the anchor menu item. Never above or below.
  Aligned to the top or bottom of the anchor as appropriate.
 */

// display element to the right, left edge against the right of the menu
const eastX = (anchor: AnchorBox): number => {
  return anchor.x() + anchor.width();
};

// display element to the left, right edge against the left of the menu
const westX = (anchor: AnchorBox, element: AnchorElement): number => {
  return anchor.x() - element.width();
};

// display element pointing up, bottom edge against the bottom of the menu (usually to one side)
const northY = (anchor: AnchorBox, element: AnchorElement): number => {
  return anchor.y() - element.height() + anchor.height();
};

// display element pointing down, top edge against the top of the menu (usually to one side)
const southY = (anchor: AnchorBox): number => {
  return anchor.y();
};

const southeast: AnchorLayout = (anchor, element, bubbles) => {
  return NuSpotInfo(eastX(anchor), southY(anchor), bubbles.southeast(), Direction.southeast(), 'link-layout-se');
};

const southwest: AnchorLayout = (anchor, element, bubbles) => {
  return NuSpotInfo(westX(anchor, element), southY(anchor), bubbles.southwest(), Direction.southwest(), 'link-layout-sw');
};

const northeast: AnchorLayout = (anchor, element, bubbles) => {
  return NuSpotInfo(eastX(anchor), northY(anchor, element), bubbles.northeast(), Direction.northeast(), 'link-layout-ne');
};

const northwest: AnchorLayout = (anchor, element, bubbles) => {
  return NuSpotInfo(westX(anchor, element), northY(anchor, element), bubbles.northwest(), Direction.northwest(), 'link-layout-nw');
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
