import { Struct } from '@ephox/katamari';
import { Node } from '@ephox/sugar';
import { Text } from '@ephox/sugar';
import { Traverse } from '@ephox/sugar';

var point = Struct.immutable('element', 'offset');

// NOTE: This only descends once.
var descendOnce = function (element, offset) {
  var children = Traverse.children(element);
  if (children.length === 0) return point(element, offset);
  else if (offset < children.length) return point(children[offset], 0);
  else {
    var last = children[children.length - 1];
    var len = Node.isText(last) ? Text.get(last).length : Traverse.children(last).length;
    return point(last, len);
  }
};

export default <any> {
  point: point,
  descendOnce: descendOnce
};