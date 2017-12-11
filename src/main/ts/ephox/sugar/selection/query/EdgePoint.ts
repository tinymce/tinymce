import { Option } from '@ephox/katamari';
import Traverse from '../../api/search/Traverse';
import CursorPosition from '../../api/selection/CursorPosition';

/* 
 * When a node has children, we return either the first or the last cursor
 * position, whichever is closer horizontally
 * 
 * When a node has no children, we return the start of end of the element,
 * depending on which is closer horizontally
 * */

// TODO: Make this RTL compatible
var COLLAPSE_TO_LEFT = true;
var COLLAPSE_TO_RIGHT = false;

var getCollapseDirection = function (rect, x) {
  return x - rect.left < rect.right - x ? COLLAPSE_TO_LEFT : COLLAPSE_TO_RIGHT;
};

var createCollapsedNode = function (doc, target, collapseDirection) {
  var r = doc.dom().createRange();
  r.selectNode(target.dom());
  r.collapse(collapseDirection);
  return r;
};

var locateInElement = function (doc, node, x) {
  var cursorRange = doc.dom().createRange();
  cursorRange.selectNode(node.dom());
  var rect = cursorRange.getBoundingClientRect();
  var collapseDirection = getCollapseDirection(rect, x);

  var f = collapseDirection === COLLAPSE_TO_LEFT ? CursorPosition.first : CursorPosition.last;
  return f(node).map(function (target) {
    return createCollapsedNode(doc, target, collapseDirection);
  });
};

var locateInEmpty = function (doc, node, x) {
  var rect = node.dom().getBoundingClientRect();
  var collapseDirection = getCollapseDirection(rect, x);
  return Option.some(createCollapsedNode(doc, node, collapseDirection));
};

var search = function (doc, node, x) {
  var f = Traverse.children(node).length === 0 ? locateInEmpty : locateInElement;
  return f(doc, node, x);
};

export default <any> {
  search: search
};