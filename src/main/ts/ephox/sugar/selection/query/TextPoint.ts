import { Option } from '@ephox/katamari';
import { Options } from '@ephox/katamari';
import Text from '../../api/node/Text';
import Geometry from '../alien/Geometry';

var locateOffset = function (doc, textnode, x, y, rect) {
  var rangeForOffset = function (offset) {
    var r = doc.dom().createRange();
    r.setStart(textnode.dom(), offset);
    r.collapse(true);
    return r;
  };

  var rectForOffset = function (offset) {
    var r = rangeForOffset(offset);
    return r.getBoundingClientRect();
  };

  var length = Text.get(textnode).length;
  var offset = Geometry.searchForPoint(rectForOffset, x, y, rect.right, length);
  return rangeForOffset(offset);
};

var locate = function (doc, node, x, y) {
  var r = doc.dom().createRange();
  r.selectNode(node.dom());
  var rects = r.getClientRects();
  var foundRect = Options.findMap(rects, function (rect) {
    return Geometry.inRect(rect, x, y) ? Option.some(rect) : Option.none();
  });

  return foundRect.map(function (rect) {
    return locateOffset(doc, node, x, y, rect);
  });
};

export default <any> {
  locate: locate
};