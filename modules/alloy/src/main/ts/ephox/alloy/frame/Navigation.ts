import { document, Element as DomElement } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';
import { Element, Traverse } from '@ephox/sugar';

import { SugarDocument } from '../alien/TypeDefinitions';

export interface Navigation {
  view: (doc: SugarDocument) => Option<Element>;
  owner: (elem: Element) => SugarDocument;
}

const view = (doc: SugarDocument): Option<Element> => {
  // Only walk up to the document this script is defined in.
  // This prevents walking up to the parent window when the editor is in an iframe.
  const element: Option<DomElement> = doc.dom() === document ?
                  Option.none()
                : Option.from(doc.dom().defaultView.frameElement);
  return element.map(Element.fromDom);
};

const owner = (element: Element): SugarDocument => {
  return Traverse.owner(element);
};

export {
  view,
  owner
};