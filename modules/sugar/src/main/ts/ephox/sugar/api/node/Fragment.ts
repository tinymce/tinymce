import { Arr } from '@ephox/katamari';
import Element from './Element';
import { document, Document, Node as DomNode } from '@ephox/dom-globals';

const fromElements = function (elements: Element<DomNode>[], scope?: Document) {
  const doc = scope || document;
  const fragment = doc.createDocumentFragment();
  Arr.each(elements, function (element) {
    fragment.appendChild(element.dom());
  });
  return Element.fromDom(fragment);
};

export {
  fromElements
};