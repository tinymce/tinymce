import { Option } from '@ephox/katamari';
import { Options } from '@ephox/katamari';
import * as Node from '../../api/node/Node';
import * as Traverse from '../../api/search/Traverse';
import * as Geometry from '../alien/Geometry';
import * as TextPoint from './TextPoint';
import Element from '../../api/node/Element';
import { Document, Range } from '@ephox/dom-globals';

/**
 * Future idea:
 *
 * This code requires the drop point to be contained within the nodes array somewhere. If it isn't,
 * we fall back to the extreme start or end of the node array contents.
 * This isn't really what the user intended.
 *
 * In theory, we could just find the range point closest to the boxes representing the node
 * (repartee does something similar).
 */

var searchInChildren = function (doc: Element, node: Element, x: number, y: number): Option<Range> {
  var r = (doc.dom() as Document).createRange();
  var nodes = Traverse.children(node);
  return Options.findMap(nodes, function (n: Element) {
    // slight mutation because we assume creating ranges is expensive
    r.selectNode(n.dom());
    return Geometry.inRect(r.getBoundingClientRect(), x, y) ?
            locateNode(doc, n, x, y) :
            Option.none();
  });
};

var locateNode = function (doc: Element, node: Element, x: number, y: number) {
  var locator = Node.isText(node) ? TextPoint.locate : searchInChildren;
  return locator(doc, node, x, y);
};

var locate = function (doc: Element, node: Element, x: number, y: number) {
  var r = doc.dom().createRange();
  r.selectNode(node.dom());
  var rect = r.getBoundingClientRect();
  // Clamp x,y at the bounds of the node so that the locate function has SOME chance
  var boundedX = Math.max(rect.left, Math.min(rect.right, x));
  var boundedY = Math.max(rect.top, Math.min(rect.bottom, y));

  return locateNode(doc, node, boundedX, boundedY);
};

export {
  locate
};