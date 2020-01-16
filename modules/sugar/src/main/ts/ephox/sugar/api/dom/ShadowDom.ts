import Element from '../node/Element';
import { Selectors } from '@ephox/sugar';
import * as Traverse from '../search/Traverse';
import { Element as DomElement, Node as DomNode, ShadowRoot, ShadowRootInit } from '@ephox/dom-globals';

const escapeShadowDom = function (element: Element<DomNode>) {
  if (Selectors.is(element, ':host *')) {
    return Traverse.parent(element).map(escapeShadowDom).getOr(element);
  } else {
    const host = (<ShadowRoot> element.dom()).host;
    if (host && host instanceof DomNode) {
      return escapeShadowDom(Element.fromDom(host));
    }
  }

  return element;
};

const attachShadow = function (element: Element<DomElement>, shadowRootInitDict: ShadowRootInit) {
  return Element.fromDom(element.dom().attachShadow(shadowRootInitDict));
};

export {
  escapeShadowDom,
  attachShadow
};
