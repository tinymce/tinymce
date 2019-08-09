import { Arr, Option } from '@ephox/katamari';
import Element from '../node/Element';
import * as NodeTypes from '../node/NodeTypes';
import { document, Element as DomElement, Node as DomNode, Document } from '@ephox/dom-globals';

const ELEMENT = NodeTypes.ELEMENT;
const DOCUMENT = NodeTypes.DOCUMENT;

const is = function <T extends DomElement = DomElement> (element: Element<DomNode>, selector: string): element is Element<T> {
  const dom = element.dom();
  if (dom.nodeType !== ELEMENT) {
    return false;
  } else {
    const elem = dom as DomElement;
    if (elem.matches !== undefined) {
      return elem.matches(selector);
    } else if (elem.msMatchesSelector !== undefined) {
      return elem.msMatchesSelector(selector);
    } else if (elem.webkitMatchesSelector !== undefined) {
      return elem.webkitMatchesSelector(selector);
    } else if ((elem as any).mozMatchesSelector !== undefined) {
      // cast to any as mozMatchesSelector doesn't exist in TS DOM lib
      return (elem as any).mozMatchesSelector(selector);
    } else {
      throw new Error('Browser lacks native selectors');
    } // unfortunately we can't throw this on startup :(
  }
};

const bypassSelector = function (dom: DomNode) {
  // Only elements and documents support querySelector
  return dom.nodeType !== ELEMENT && dom.nodeType !== DOCUMENT ||
          // IE fix for complex queries on empty nodes: http://jsfiddle.net/spyder/fv9ptr5L/
          (dom as DomElement | Document).childElementCount === 0;
};

const all = function <T extends DomElement = DomElement>(selector: string, scope?: Element<DomNode>): Element<T>[] {
  const base = scope === undefined ? document : scope.dom();
  return bypassSelector(base) ? [] : Arr.map((base as DomElement | Document).querySelectorAll<T>(selector), Element.fromDom);
};

const one = function <T extends DomElement = DomElement>(selector: string, scope?: Element<DomNode>) {
  const base = scope === undefined ? document : scope.dom();
  return bypassSelector(base) ? Option.none<Element<T>>() : Option.from((base as DomElement | Document).querySelector<T>(selector)).map(Element.fromDom);
};

export {
  all,
  is,
  one,
};