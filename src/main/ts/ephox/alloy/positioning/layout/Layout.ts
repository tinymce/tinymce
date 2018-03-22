import * as Direction from './Direction';
import * as Anchors from '../view/Anchors';
import SpotInfo from '../view/SpotInfo';

/*
  Layout for menus and inline context dialogs;
  Either above or below. Never left or right.
  Aligned to the left or right of the anchor as appropriate.
 */

// display element to the right, left edge against the anchor
const east = function (anchor) {
  return anchor.x();
};

// element centre aligned horizontally with the anchor
const middle = function (anchor, element) {
  return anchor.x() + anchor.width() - element.width() / 2;
};

// display element to the left, right edge against the right of the anchor
const west = function (anchor, element) {
  return anchor.x() + anchor.width() - element.width();
};

// display element above, bottom edge against the top of the anchor
const north = function (anchor, element) {
  return anchor.y() - element.height();
};

// display element below, top edge against the bottom of the anchor
const south = function (anchor) {
  return anchor.y() + anchor.height();
};

const southeast = function (anchor, element, bubbles) {
  return SpotInfo(east(anchor), south(anchor), bubbles.southeast(), Direction.southeast(), [ Anchors.south(), Anchors.east() ], 'layout-se');
};

const southwest = function (anchor, element, bubbles) {
  return SpotInfo(west(anchor, element), south(anchor), bubbles.southwest(), Direction.southwest(), [ Anchors.south(), Anchors.west() ], 'layout-sw');
};

const northeast = function (anchor, element, bubbles) {
  return SpotInfo(east(anchor), north(anchor, element), bubbles.northeast(), Direction.northeast(), [ Anchors.north(), Anchors.east() ], 'layout-ne');
};

const northwest = function (anchor, element, bubbles) {
  return SpotInfo(west(anchor, element), north(anchor, element), bubbles.northwest(), Direction.northwest(), [ Anchors.north(), Anchors.west() ], 'layout-nw');
};

const northmiddle = function (anchor, element, bubbles) {
  return SpotInfo(middle(anchor, element), north(anchor, element), bubbles.northeast(), Direction.northeast(), [ Anchors.north(), Anchors.middle() ], 'layout-nm');
};

const southmiddle = function (anchor, element, bubbles) {
  return SpotInfo(middle(anchor, element), south(anchor), bubbles.southeast(), Direction.southeast(), [ Anchors.south(), Anchors.middle() ], 'layout-sm');
};

const all = function () {
  return [ southeast, southwest, northeast, northwest, southmiddle, northmiddle ];
};

const allRtl = function () {
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