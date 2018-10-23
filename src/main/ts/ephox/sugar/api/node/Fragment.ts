import { Arr } from '@ephox/katamari';
import Element from './Element';
import { document, Document } from '@ephox/dom-globals';

var fromElements = function (elements: Element[], scope?: Document) {
  var doc = scope || document;
  var fragment = doc.createDocumentFragment();
  Arr.each(elements, function (element) {
    fragment.appendChild(element.dom());
  });
  return Element.fromDom(fragment);
};

export {
  fromElements
};