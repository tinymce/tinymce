import { Arr, Optional } from '@ephox/katamari';

import { DOCUMENT, DOCUMENT_FRAGMENT, ELEMENT } from '../node/NodeTypes';
import { SugarElement } from '../node/SugarElement';

interface VendorElement extends Element {
  msMatchesSelector?: (selector: string) => boolean;
  mozMatchesSelector?: (selector: string) => boolean;
}

const is = <T extends Element = Element> (element: SugarElement<Node>, selector: string): element is SugarElement<T> => {
  const dom = element.dom;
  if (dom.nodeType !== ELEMENT) {
    return false;
  } else {
    const elem = dom as VendorElement;
    if (elem.matches !== undefined) {
      return elem.matches(selector);
    } else if (elem.msMatchesSelector !== undefined) {
      return elem.msMatchesSelector(selector);
    } else if (elem.webkitMatchesSelector !== undefined) {
      return elem.webkitMatchesSelector(selector);
    } else if (elem.mozMatchesSelector !== undefined) {
      // cast to any as mozMatchesSelector doesn't exist in TS DOM lib
      return elem.mozMatchesSelector(selector);
    } else {
      throw new Error('Browser lacks native selectors');
    } // unfortunately we can't throw this on startup :(
  }
};

const bypassSelector = (dom: Node) =>
  // Only elements, documents and shadow roots support querySelector
  // shadow root element type is DOCUMENT_FRAGMENT
  dom.nodeType !== ELEMENT && dom.nodeType !== DOCUMENT && dom.nodeType !== DOCUMENT_FRAGMENT ||
    // IE fix for complex queries on empty nodes: http://jsfiddle.net/spyder/fv9ptr5L/
    (dom as Element | Document | DocumentFragment).childElementCount === 0;

const all = <T extends Element = Element> (selector: string, scope?: SugarElement<Node>): SugarElement<T>[] => {
  const base = scope === undefined ? document : scope.dom;
  return bypassSelector(base) ? [] : Arr.map((base as Element | Document).querySelectorAll<T>(selector), SugarElement.fromDom);
};

const one = <T extends Element = Element> (selector: string, scope?: SugarElement<Node>): Optional<SugarElement<T>> => {
  const base = scope === undefined ? document : scope.dom;
  return bypassSelector(base) ? Optional.none<SugarElement<T>>() : Optional.from((base as Element | Document).querySelector<T>(selector)).map(SugarElement.fromDom);
};

export {
  all,
  is,
  one
};
