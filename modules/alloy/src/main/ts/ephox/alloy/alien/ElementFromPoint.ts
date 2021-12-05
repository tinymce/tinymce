import { Optional } from '@ephox/katamari';
import { SugarElement, SugarNode, Traverse } from '@ephox/sugar';

import { AlloyComponent } from '../api/component/ComponentApi';

const insideComponent = (component: AlloyComponent, x: number, y: number): Optional<SugarElement<Element>> => {
  const isInside = (node: SugarElement<Element>) => component.element.dom.contains(node.dom);

  const hasValidRect = (node: SugarElement<Element>): boolean => {
    const elem = SugarNode.isText(node) ? Traverse.parentElement(node) : Optional.some(node);
    return elem.exists((e) => {
      const rect = e.dom.getBoundingClientRect();
      return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    });
  };

  const doc = Traverse.owner(component.element);
  return SugarElement.fromPoint(doc, x, y).filter(isInside).filter(hasValidRect);
};

export {
  insideComponent
};
