import { Arr } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import Element from '../node/Element';
import NodeTypes from '../node/NodeTypes';
import { document, Element as DomElement } from '@ephox/dom-globals';

const ELEMENT = NodeTypes.ELEMENT;
const DOCUMENT = NodeTypes.DOCUMENT;

const is = function (element: Element, selector: String): boolean {
  // elem must remain any because mozMatchesSelector doesn't exist in TS DOM lib
  const elem = element.dom();
  if (elem.nodeType !== ELEMENT) return false; // documents have querySelector but not matches

  // As of Chrome 34 / Safari 7.1 / FireFox 34, everyone except IE has the unprefixed function.
  // Still check for the others, but do it last.
  else if (elem.matches !== undefined) return elem.matches(selector);
  else if (elem.msMatchesSelector !== undefined) return elem.msMatchesSelector(selector);
  else if (elem.webkitMatchesSelector !== undefined) return elem.webkitMatchesSelector(selector);
  else if (elem.mozMatchesSelector !== undefined) return elem.mozMatchesSelector(selector);
  else throw new Error('Browser lacks native selectors'); // unfortunately we can't throw this on startup :(
};

const bypassSelector = function (dom: DomElement) {
  // Only elements and documents support querySelector
  return dom.nodeType !== ELEMENT && dom.nodeType !== DOCUMENT ||
          // IE fix for complex queries on empty nodes: http://jsfiddle.net/spyder/fv9ptr5L/
          dom.childElementCount === 0;
};

const all = function (selector: string, scope?: Element) {
  const base = scope === undefined ? document : scope.dom();
  return bypassSelector(base) ? [] : Arr.map(base.querySelectorAll(selector), Element.fromDom);
};

const one = function (selector: string, scope?: Element) {
  const base: DomElement = scope === undefined ? document : scope.dom();
  return bypassSelector(base) ? Option.none<Element>() : Option.from(base.querySelector(selector)).map(Element.fromDom);
};

export default {
  all,
  is,
  one,
};