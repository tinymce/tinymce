import * as Insert from '../dom/Insert';
import * as InsertAll from '../dom/InsertAll';
import * as Remove from '../dom/Remove';
import { SugarElement } from '../node/SugarElement';
import * as SugarElements from '../node/SugarElements';
import * as Traverse from '../search/Traverse';

const get = (element: SugarElement<HTMLElement>): string =>
  element.dom.innerHTML;

const set = (element: SugarElement<Node>, content: string): void => {
  const owner = Traverse.owner(element);
  const docDom = owner.dom;

  // FireFox has *terrible* performance when using innerHTML = x
  const fragment = SugarElement.fromDom(docDom.createDocumentFragment());
  const contentElements = SugarElements.fromHtml(content, docDom);
  InsertAll.append(fragment, contentElements);

  Remove.empty(element);
  Insert.append(element, fragment);
};

const getOuter = (element: SugarElement<Node>): string => {
  const container = SugarElement.fromTag('div');
  const clone = SugarElement.fromDom(element.dom.cloneNode(true));
  Insert.append(container, clone);
  return get(container);
};

export {
  get,
  set,
  getOuter
};
