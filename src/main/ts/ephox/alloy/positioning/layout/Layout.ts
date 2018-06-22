import * as Direction from './Direction';
import * as Anchors from '../view/Anchors';
import { SpotInfo, nu as NuSpotInfo } from '../view/SpotInfo';
import { Bubble } from '../../positioning/layout/Bubble';

/*
  Layout for menus and inline context dialogs;
  Either above or below. Never left or right.
  Aligned to the left or right of the anchor as appropriate.
 */

export interface AnchorBox {
  x: () => number;
  y: () => number;
  width: () => number;
  height: () => number;
}

export interface AnchorElement {
  width: () => number;
  height: () => number;
}

export type AnchorLayout = (
  anchor: AnchorBox,
  element: AnchorElement,
  bubbles: Bubble
) => SpotInfo;

// display element to the right, left edge against the anchor
const east = (anchor: AnchorBox): number => {
  return anchor.x();
};

// element centre aligned horizontally with the anchor
const middle = (anchor: AnchorBox, element: AnchorElement): number => {
  return anchor.x() + anchor.width() - element.width() / 2;
};

// display element to the left, right edge against the right of the anchor
const west = (anchor: AnchorBox, element: AnchorElement): number => {
  return anchor.x() + anchor.width() - element.width();
};

// display element above, bottom edge against the top of the anchor
const north = (anchor: AnchorBox, element: AnchorElement): number => {
  return anchor.y() - element.height();
};

// display element below, top edge against the bottom of the anchor
const south = (anchor: AnchorBox): number => {
  return anchor.y() + anchor.height();
};

const southeast: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble) => {
  return NuSpotInfo(east(anchor), south(anchor), bubbles.southeast(), Direction.southeast(), [ Anchors.south(), Anchors.east() ], 'layout-se');
};

const southwest: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble) => {
  return NuSpotInfo(west(anchor, element), south(anchor), bubbles.southwest(), Direction.southwest(), [ Anchors.south(), Anchors.west() ], 'layout-sw');
};

const northeast: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble) => {
  return NuSpotInfo(east(anchor), north(anchor, element), bubbles.northeast(), Direction.northeast(), [ Anchors.north(), Anchors.east() ], 'layout-ne');
};

const northwest: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble) => {
  return NuSpotInfo(west(anchor, element), north(anchor, element), bubbles.northwest(), Direction.northwest(), [ Anchors.north(), Anchors.west() ], 'layout-nw');
};

const northmiddle: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble) => {
  return NuSpotInfo(middle(anchor, element), north(anchor, element), bubbles.northeast(), Direction.northeast(), [ Anchors.north(), Anchors.middle() ], 'layout-nm');
};

const southmiddle: AnchorLayout = (anchor: AnchorBox, element: AnchorElement, bubbles: Bubble) => {
  return NuSpotInfo(middle(anchor, element), south(anchor), bubbles.southeast(), Direction.southeast(), [ Anchors.south(), Anchors.middle() ], 'layout-sm');
};

const all = (): AnchorLayout[] => {
  return [ southeast, southwest, northeast, northwest, southmiddle, northmiddle ];
};

const allRtl = (): AnchorLayout[] => {
  return [ southwest, southeast, northwest, northeast, southmiddle, northmiddle ];
};

export {
  southeast,
  northeast,
  southwest,
  northwest,
  southmiddle,
  northmiddle,
  all,
  allRtl
};