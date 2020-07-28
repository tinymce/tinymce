import { Optional } from '@ephox/katamari';
import { SugarElement, SugarNode, Traverse } from '@ephox/sugar';

import { AlloyComponent } from '../api/component/ComponentApi';

// Note, elementFromPoint gives a different answer than caretRangeFromPoint
const elementFromPoint = (doc: SugarElement<HTMLDocument>, x: number, y: number): Optional<SugarElement> => Optional.from(
  doc.dom.elementFromPoint(x, y)
).map(SugarElement.fromDom);

const insideComponent = (component: AlloyComponent, x: number, y: number): Optional<SugarElement> => {
  const isInside = (node: SugarElement) => component.element.dom.contains(node.dom);

  const hasValidRect = (node: SugarElement): boolean => {
    const elem: Optional<SugarElement> = SugarNode.isText(node) ? Traverse.parent(node) : Optional.some(node);
    return elem.exists((e) => {
      const rect = e.dom.getBoundingClientRect();
      return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    });
  };

  const doc = Traverse.owner(component.element);
  return elementFromPoint(doc, x, y).filter(isInside).filter(hasValidRect);
};

export {
  insideComponent
};
