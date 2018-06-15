import { Option } from '@ephox/katamari';
import { Element, Traverse } from '@ephox/sugar';
import { document } from '@ephox/dom-globals';

const view = (doc) => {
  // Only walk up to the document this script is defined in.
  // This prevents walking up to the parent window when the editor is in an iframe.
  const element = doc.dom() === document ?
                  Option.none()
                : Option.from(doc.dom().defaultView.frameElement);
  return element.map(Element.fromDom);
};

const owner = (element) => {
  return Traverse.owner(element);
};

export {
  view,
  owner
};