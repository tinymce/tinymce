import { Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import { Node } from '@ephox/sugar';
import { Traverse } from '@ephox/sugar';

// Note, elementFromPoint gives a different answer than caretRangeFromPoint
var elementFromPoint = function (doc, x, y) {
  return Option.from(
    doc.dom().elementFromPoint(x, y)
  ).map(Element.fromDom);
};

var insideComponent = function (component, x, y) {
  var isInside = function (node) {
    return component.element().dom().contains(node.dom());
  };

  var hasValidRect = function (node) {
    var elem = Node.isText(node) ? Traverse.parent(node) : Option.some(node);
    return elem.exists(function (e) {
      var rect = e.dom().getBoundingClientRect();
      return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    });
  };

  var doc = Traverse.owner(component.element());
  return elementFromPoint(doc, x, y).filter(isInside).filter(hasValidRect);
};

export default <any> {
  insideComponent: insideComponent
};