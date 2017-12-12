import { Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import { Traverse } from '@ephox/sugar';

var view = function (doc) {
  // Only walk up to the document this script is defined in.
  // This prevents walking up to the parent window when the editor is in an iframe.
  var element = doc.dom() === document ?
                  Option.none()
                : Option.from(doc.dom().defaultView.frameElement);
  return element.map(Element.fromDom);
};

var owner = function (element) {
  return Traverse.owner(element);
};

export default <any> {
  view: view,
  owner: owner
};