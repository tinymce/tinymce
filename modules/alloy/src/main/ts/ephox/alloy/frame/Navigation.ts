import { document, Element as DomElement, HTMLDocument, Node as DomNode } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';
import { Element, Traverse } from '@ephox/sugar';

export interface Navigation {
  view: (doc: Element<HTMLDocument>) => Option<Element<DomElement>>;
  owner: (elem: Element<DomNode>) => Element<HTMLDocument>;
}

const view = (doc: Element<HTMLDocument>): Option<Element<DomElement>> => {
  // Only walk up to the document this script is defined in.
  // This prevents walking up to the parent window when the editor is in an iframe.
  const element: Option<DomElement> = doc.dom() === document ?
    Option.none()
    : Option.from(doc.dom().defaultView.frameElement);
  return element.map(Element.fromDom);
};

const owner = (element: Element<DomNode>): Element<HTMLDocument> => Traverse.owner(element);

export {
  view,
  owner
};
