import { Option } from '@ephox/katamari';
import { Element, Node, Traverse } from '@ephox/sugar';
import { SugarDocument } from './TypeDefinitions';
import { AlloyComponent } from '../api/component/ComponentApi';

// Note, elementFromPoint gives a different answer than caretRangeFromPoint
const elementFromPoint = (doc: SugarDocument, x: number, y: number): Option<Element> => {
  return Option.from(
    doc.dom().elementFromPoint(x, y)
  ).map(Element.fromDom);
};

const insideComponent = (component: AlloyComponent, x: number, y: number): Option<Element> => {
  const isInside = (node) => {
    return component.element().dom().contains(node.dom());
  };

  const hasValidRect = (node: Element): boolean => {
    const elem: Option<Element> = Node.isText(node) ? Traverse.parent(node) : Option.some(node);
    return elem.exists((e) => {
      const rect = e.dom().getBoundingClientRect();
      return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    });
  };

  const doc: SugarDocument = Traverse.owner(component.element());
  return elementFromPoint(doc, x, y).filter(isInside).filter(hasValidRect);
};

export {
  insideComponent
};