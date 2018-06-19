import Element from '../node/Element';
import Elements from '../node/Elements';
import Insert from '../dom/Insert';
import InsertAll from '../dom/InsertAll';
import Remove from '../dom/Remove';
import Traverse from '../search/Traverse';
import { HTMLElement, Document, Node } from '@ephox/dom-globals';

var get = function (element: Element) {
  return (element.dom() as HTMLElement).innerHTML;
};

var set = function (element: Element, content: string) {
  var owner = Traverse.owner(element);
  var docDom: Document = owner.dom();

  // FireFox has *terrible* performance when using innerHTML = x
  var fragment = Element.fromDom(docDom.createDocumentFragment());
  var contentElements = Elements.fromHtml(content, docDom);
  InsertAll.append(fragment, contentElements);

  Remove.empty(element);
  Insert.append(element, fragment);
};

var getOuter = function (element: Element) {
  var container = Element.fromTag('div');
  var clone = Element.fromDom((element.dom() as Node).cloneNode(true));
  Insert.append(container, clone);
  return get(container);
};

export default {
  get,
  set,
  getOuter,
};