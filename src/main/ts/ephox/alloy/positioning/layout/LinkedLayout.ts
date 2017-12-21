import Direction from './Direction';
import Anchors from '../view/Anchors';
import SpotInfo from '../view/SpotInfo';

/*
  Layout for submenus;
  Either left or right of the anchor menu item. Never above or below.
  Aligned to the top or bottom of the anchor as appropriate.
 */

// display element to the right, left edge against the right of the menu
var east = function (anchor) {
  return anchor.x() + anchor.width();
};

// display element to the left, right edge against the left of the menu
var west = function (anchor, element) {
  return anchor.x() - element.width();
};

// display element pointing up, bottom edge against the bottom of the menu (usually to one side)
var north = function (anchor, element) {
  return anchor.y() - element.height() + anchor.height();
};

// display element pointing down, top edge against the top of the menu (usually to one side)
var south = function (anchor) {
  return anchor.y();
};

var southeast = function (anchor, element, bubbles) {
  return SpotInfo(east(anchor), south(anchor), bubbles.southeast(), Direction.southeast(), [ Anchors.south(), Anchors.east() ], 'link-layout-se');
};

var southwest = function (anchor, element, bubbles) {
  return SpotInfo(west(anchor, element), south(anchor), bubbles.southwest(), Direction.southwest(), [ Anchors.south(), Anchors.west() ], 'link-layout-sw');
};

var northeast = function (anchor, element, bubbles) {
  return SpotInfo(east(anchor), north(anchor, element), bubbles.northeast(), Direction.northeast(), [ Anchors.north(), Anchors.east() ], 'link-layout-ne');
};

var northwest = function (anchor, element, bubbles) {
  return SpotInfo(west(anchor, element), north(anchor, element), bubbles.northwest(), Direction.northwest(), [ Anchors.north(), Anchors.west() ], 'link-layout-nw');
};

var all = function () {
  return [ southeast, southwest, northeast, northwest ];
};

var allRtl = function () {
  return [ southwest, southeast, northwest, northeast ];
};

export default <any> {
  southeast: southeast,
  northeast: northeast,
  southwest: southwest,
  northwest: northwest,
  all: all,
  allRtl: allRtl
};