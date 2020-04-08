import { console, Element as DomElement, Node as DomNode } from '@ephox/dom-globals';
import { Arr, Obj, Option, Type } from '@ephox/katamari';
import Element from '../node/Element';
import * as Node from '../node/Node';

const rawSet = (dom: DomElement, key: string, value: string | boolean | number) => {
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

const set = (element: Element<DomElement>, key: string, value: string | boolean | number) => {
  rawSet(element.dom(), key, value);
};

const setAll = (element: Element<DomElement>, attrs: Record<string, string | boolean | number>) => {
  const dom = element.dom();
  Obj.each(attrs, (v, k) => {
    rawSet(dom, k, v);
  });
};

const get = (element: Element<DomElement>, key: string) => {
  const v = element.dom().getAttribute(key);

  // undefined is the more appropriate value for JS, and this matches JQuery
  return v === null ? undefined : v;
};

const getOpt = (element: Element<DomElement>, key: string): Option<string> =>
  Option.from(get(element, key));

const has = (element: Element<DomNode>, key: string) => {
  const dom = element.dom();

  // return false for non-element nodes, no point in throwing an error
  return dom && (dom as DomElement).hasAttribute ? (dom as DomElement).hasAttribute(key) : false;
};

const remove = (element: Element<DomElement>, key: string) => {
  element.dom().removeAttribute(key);
};

const hasNone = (element: Element<DomNode>) => {
  const attrs = (element.dom() as DomElement).attributes;
  return attrs === undefined || attrs === null || attrs.length === 0;
};

const clone = (element: Element<DomElement>) => Arr.foldl(element.dom().attributes, (acc, attr) => {
  acc[attr.name] = attr.value;
  return acc;
}, {} as Record<string, string>);

const transferOne = (source: Element<DomElement>, destination: Element<DomElement>, attr: string) => {
  // NOTE: We don't want to clobber any existing attributes
  if (!has(destination, attr)) {
    getOpt(source, attr).each((srcValue) => set(destination, attr, srcValue));
  }
};

// Transfer attributes(attrs) from source to destination, unless they are already present
const transfer = (source: Element<DomElement>, destination: Element<DomElement>, attrs: string[]) => {
  if (!Node.isElement(source) || !Node.isElement(destination)) { return; }
  Arr.each(attrs, (attr) => {
    transferOne(source, destination, attr);
  });
};

export { clone, set, setAll, get, getOpt, has, remove, hasNone, transfer };
