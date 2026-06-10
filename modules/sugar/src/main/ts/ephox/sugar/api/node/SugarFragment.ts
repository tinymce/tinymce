import { Arr } from '@ephox/katamari';

import { SugarElement } from './SugarElement';

const fromElements = (elements: SugarElement<Node>[], scope?: Document | null): SugarElement<DocumentFragment> => {
  const doc = scope || document;
  const fragment = doc.createDocumentFragment();
  Arr.each(elements, (element) => {
    fragment.appendChild(element.dom);
  });
  return SugarElement.fromDom(fragment);
};

const fromHtml = (html: string, scope?: Document | null): SugarElement<DocumentFragment> => {
  const doc: Document = scope || document;
  const template = doc.createElement('template');
  template.innerHTML = html;
  return SugarElement.fromDom(template.content);
};

export {
  fromElements,
  fromHtml
};
