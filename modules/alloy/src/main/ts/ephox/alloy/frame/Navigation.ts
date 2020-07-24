import { document, Element, HTMLDocument, Node } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';
import { SugarElement, Traverse } from '@ephox/sugar';

export interface Navigation {
  view: (doc: SugarElement<HTMLDocument>) => Option<SugarElement<Element>>;
  owner: (elem: SugarElement<Node>) => SugarElement<HTMLDocument>;
}

const view = (doc: SugarElement<HTMLDocument>): Option<SugarElement<Element>> => {
  // Only walk up to the document this script is defined in.
  // This prevents walking up to the parent window when the editor is in an iframe.
  const element: Option<Element> = doc.dom() === document ?
    Option.none()
    : Option.from(doc.dom().defaultView.frameElement);
  return element.map(SugarElement.fromDom);
};

const owner = (element: SugarElement<Node>): SugarElement<HTMLDocument> => Traverse.owner(element);

export {
  view,
  owner
};
