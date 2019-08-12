import { console, HTMLElement, Element as DomElement, Node as DomNode } from '@ephox/dom-globals';
import { Arr, Obj, Option, Type } from '@ephox/katamari';
import Element from '../node/Element';
import * as Node from '../node/Node';

const rawSet = function (dom: DomElement, key: string, value: string | boolean | number) {
  /*
   * JQuery coerced everything to a string, and silently did nothing on text node/null/undefined.
   *
   * We fail on those invalid cases, only allowing numbers and booleans.
   */
  if (Type.isString(value) || Type.isBoolean(value) || Type.isNumber(value)) {
    dom.setAttribute(key, value + '');
  } else {
    // tslint:disable-next-line:no-console
    console.error('Invalid call to Attr.set. Key ', key, ':: Value ', value, ':: Element ', dom);
    throw new Error('Attribute value was not simple');
  }
};

const set = function (element: Element<DomElement>, key: string, value: string | boolean | number) {
  rawSet(element.dom(), key, value);
};

const setAll = function (element: Element<DomElement>, attrs: Record<string, string | boolean | number>) {
  const dom = element.dom();
  Obj.each(attrs, function (v, k) {
    rawSet(dom, k, v);
  });
};

const get = function (element: Element<DomElement>, key: string) {
  const v = element.dom().getAttribute(key);

  // undefined is the more appropriate value for JS, and this matches JQuery
  return v === null ? undefined : v;
};

const getOpt = (element: Element<DomElement>, key: string): Option<string> =>
  Option.from(get(element, key));

const has = function (element: Element<DomNode>, key: string) {
  const dom = element.dom();

  // return false for non-element nodes, no point in throwing an error
  return dom && (dom as DomElement).hasAttribute ? (dom as DomElement).hasAttribute(key) : false;
};

const remove = function (element: Element<DomElement>, key: string) {
  element.dom().removeAttribute(key);
};

const hasNone = function (element: Element<DomNode>) {
  const attrs = (element.dom() as DomElement).attributes;
  return attrs === undefined || attrs === null || attrs.length === 0;
};

const clone = function (element: Element<DomElement>) {
  // TypeScript really doesn't like NamedNodeMap as array
  return Arr.foldl(element.dom().attributes, function (acc, attr) {
    acc[attr.name] = attr.value;
    return acc;
  }, {} as Record<string, string>);
};

const transferOne = function (source: Element<DomElement>, destination: Element<DomElement>, attr: string) {
  // NOTE: We don't want to clobber any existing attributes
  if (has(source, attr) && !has(destination, attr)) { set(destination, attr, get(source, attr)); }
};

// Transfer attributes(attrs) from source to destination, unless they are already present
const transfer = function (source: Element<DomElement>, destination: Element<DomElement>, attrs: string[]) {
  if (!Node.isElement(source) || !Node.isElement(destination)) { return; }
  Arr.each(attrs, function (attr) {
    transferOne(source, destination, attr);
  });
};

export { clone, set, setAll, get, getOpt, has, remove, hasNone, transfer, };
