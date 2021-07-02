import { Arr, Optional } from '@ephox/katamari';

import { SugarElement } from '../../api/node/SugarElement';
import * as SugarNode from '../../api/node/SugarNode';
import * as Traverse from '../../api/search/Traverse';
import * as Geometry from '../alien/Geometry';
import * as TextPoint from './TextPoint';

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

const searchInChildren = (doc: SugarElement<Document>, node: SugarElement<Node>, x: number, y: number): Optional<Range> => {
  const r = doc.dom.createRange();
  const nodes = Traverse.children(node);
  return Arr.findMap(nodes, (n) => {
    // slight mutation because we assume creating ranges is expensive
    r.selectNode(n.dom);
    return Geometry.inRect(r.getBoundingClientRect(), x, y) ?
      locateNode(doc, n, x, y) :
      Optional.none<Range>();
  });
};

const locateNode = (doc: SugarElement<Document>, node: SugarElement<Node>, x: number, y: number): Optional<Range> =>
  SugarNode.isText(node) ? TextPoint.locate(doc, node, x, y) : searchInChildren(doc, node, x, y);

const locate = (doc: SugarElement<Document>, node: SugarElement<Node>, x: number, y: number): Optional<Range> => {
  const r = doc.dom.createRange();
  r.selectNode(node.dom);
  const rect = r.getBoundingClientRect();
  // Clamp x,y at the bounds of the node so that the locate function has SOME chance
  const boundedX = Math.max(rect.left, Math.min(rect.right, x));
  const boundedY = Math.max(rect.top, Math.min(rect.bottom, y));

  return locateNode(doc, node, boundedX, boundedY);
};

export { locate };
