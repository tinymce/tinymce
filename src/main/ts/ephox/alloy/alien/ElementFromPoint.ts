import { Option } from '@ephox/katamari';
import { Element, Node, Traverse } from '@ephox/sugar';
import { SugarElement } from './TypeDefinitions';
import { AlloyComponent } from '../api/component/ComponentApi';

// Note, elementFromPoint gives a different answer than caretRangeFromPoint
const elementFromPoint = function (doc, x, y): Option<SugarElement> {
  return Option.from(
    doc.dom().elementFromPoint(x, y)
  ).map(Element.fromDom);
};

const insideComponent = function (component: AlloyComponent, x: number, y: number): Option<SugarElement> {
  const isInside = function (node) {
    return component.element().dom().contains(node.dom());
  };

  const hasValidRect = function (node) {
    const elem = Node.isText(node) ? Traverse.parent(node) : Option.some(node);
    return elem.exists(function (e) {
      const rect = e.dom().getBoundingClientRect();
      return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    });
  };

  const doc = Traverse.owner(component.element());
  return elementFromPoint(doc, x, y).filter(isInside).filter(hasValidRect);
};

export default {
  insideComponent
};