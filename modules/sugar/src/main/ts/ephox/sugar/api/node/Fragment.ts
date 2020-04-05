import { document, Document, Node as DomNode } from '@ephox/dom-globals';
import { Arr } from '@ephox/katamari';
import Element from './Element';

const fromElements = (elements: Element<DomNode>[], scope?: Document | null) => {
  const doc = scope || document;
  const fragment = doc.createDocumentFragment();
  Arr.each(elements, (element) => {
    fragment.appendChild(element.dom());
  });
  return Element.fromDom(fragment);
};

export {
  fromElements
};
