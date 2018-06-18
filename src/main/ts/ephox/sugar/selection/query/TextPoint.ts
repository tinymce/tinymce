import { Option } from '@ephox/katamari';
import { Options } from '@ephox/katamari';
import Text from '../../api/node/Text';
import Geometry from '../alien/Geometry';
import Element from '../../api/node/Element';
import { Document } from '@ephox/dom-globals';
import { ClientRect } from '@ephox/dom-globals';
import { DOMRect } from '@ephox/dom-globals';
import { Range } from '@ephox/dom-globals';

var locateOffset = function (doc: Element, textnode, x: number, y: number, rect: ClientRect | DOMRect) {
  var rangeForOffset = function (offset) {
    var r: Range = (doc.dom() as Document).createRange();
    r.setStart(textnode.dom(), offset);
    r.collapse(true);
    return r;
  };

  var rectForOffset = function (offset: number) {
    var r = rangeForOffset(offset);
    return r.getBoundingClientRect();
  };

  var length = Text.get(textnode).length;
  var offset = Geometry.searchForPoint(rectForOffset, x, y, rect.right, length);
  return rangeForOffset(offset);
};

var locate = function (doc: Element, node: Element, x: number, y: number) {
  var r = (doc.dom() as Document).createRange();
  r.selectNode(node.dom());
  var rects = r.getClientRects();
  var foundRect = Options.findMap(rects as any, function (rect) {
    return Geometry.inRect(rect, x, y) ? Option.some(rect) : Option.none();
  });

  return foundRect.map(function (rect) {
    return locateOffset(doc, node, x, y, rect);
  });
};

export default {
  locate
};