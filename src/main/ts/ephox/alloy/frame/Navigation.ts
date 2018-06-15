import { Option } from '@ephox/katamari';
import { Element, Traverse } from '@ephox/sugar';
import { document } from '@ephox/dom-globals';
import { SugarElement, SugarDocument } from '../alien/TypeDefinitions';

export interface Navigation {
  view: (SugarDocument) => Option<SugarElement>;
  owner: (SugarElement) => SugarDocument;
}

const view = (doc: SugarDocument): Option<SugarElement> => {
  // Only walk up to the document this script is defined in.
  // This prevents walking up to the parent window when the editor is in an iframe.
  const element: Option<Element> = doc.dom() === document ?
                  Option.none()
                : Option.from(doc.dom().defaultView.frameElement);
  return element.map(Element.fromDom);
};

const owner = (element: SugarElement): SugarDocument => {
  return Traverse.owner(element);
};

export {
  view,
  owner
};