import Element from '../node/Element';
import * as Elements from '../node/Elements';
import * as Insert from '../dom/Insert';
import * as InsertAll from '../dom/InsertAll';
import * as Remove from '../dom/Remove';
import * as Traverse from '../search/Traverse';
import { HTMLElement, Document, Node as DomNode } from '@ephox/dom-globals';

const get = function (element: Element<HTMLElement>) {
  return element.dom().innerHTML;
};

const set = function (element: Element<DomNode>, content: string) {
  const owner = Traverse.owner(element);
  const docDom = owner.dom();

  // FireFox has *terrible* performance when using innerHTML = x
  const fragment = Element.fromDom(docDom.createDocumentFragment());
  const contentElements = Elements.fromHtml(content, docDom);
  InsertAll.append(fragment, contentElements);

  Remove.empty(element);
  Insert.append(element, fragment);
};

const getOuter = function (element: Element<DomNode>) {
  const container = Element.fromTag('div');
  const clone = Element.fromDom(element.dom().cloneNode(true));
  Insert.append(container, clone);
  return get(container);
};

export {
  get,
  set,
  getOuter,
};