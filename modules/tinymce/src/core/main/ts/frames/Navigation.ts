import { Optional } from '@ephox/katamari';
import { SugarElement, Traverse } from '@ephox/sugar';

export interface Navigation {
  readonly view: (doc: SugarElement<Document>) => Optional<SugarElement<Element>>;
  readonly owner: (elem: SugarElement<Node>) => SugarElement<Document>;
}

const view = (doc: SugarElement<Document>): Optional<SugarElement<Element>> => {
  // Only walk up to the document this script is defined in.
  // This prevents walking up to the parent window when the editor is in an iframe.
  const element = doc.dom === document ? Optional.none<Element>() : Optional.from(doc.dom.defaultView?.frameElement);
  return element.map(SugarElement.fromDom);
};

const owner = (element: SugarElement<Node>): SugarElement<Document> => Traverse.documentOrOwner(element);

export {
  view,
  owner
};
