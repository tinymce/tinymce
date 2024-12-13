import { Arr, Obj, Optional, Type } from '@ephox/katamari';

import { SugarElement } from '../node/SugarElement';
import * as SugarNode from '../node/SugarNode';

const rawSet = (dom: Element, key: string, value: string | boolean | number): void => {
  /*
   * JQuery coerced everything to a string, and silently did nothing on text node/null/undefined.
   *
   * We fail on those invalid cases, only allowing numbers and booleans.
   */
  if (Type.isString(value) || Type.isBoolean(value) || Type.isNumber(value)) {
    dom.setAttribute(key, value + '');
  } else {
    // eslint-disable-next-line no-console
    console.error('Invalid call to Attribute.set. Key ', key, ':: Value ', value, ':: Element ', dom);
    throw new Error('Attribute value was not simple');
  }
};

const set = (element: SugarElement<Element>, key: string, value: string | boolean | number): void => {
  rawSet(element.dom, key, value);
};

const setAll = (element: SugarElement<Element>, attrs: Record<string, string | boolean | number>): void => {
  const dom = element.dom;
  Obj.each(attrs, (v, k) => {
    rawSet(dom, k, v);
  });
};

const setOptions = (element: SugarElement<Element>, attrs: Record<string, Optional<string | boolean | number>>): void => {
  Obj.each(attrs, (v, k) => {
    v.fold(() => {
      remove(element, k);
    }, (value) => {
      rawSet(element.dom, k, value);
    });
  });
};

const get = (element: SugarElement<Element>, key: string): undefined | string => {
  const v = element.dom.getAttribute(key);

  // undefined is the more appropriate value for JS, and this matches JQuery
  return v === null ? undefined : v;
};

const getOpt = (element: SugarElement<Element>, key: string): Optional<string> =>
  Optional.from(get(element, key));

const has = (element: SugarElement<Node>, key: string): boolean => {
  const dom = element.dom;

  // return false for non-element nodes, no point in throwing an error
  return dom && (dom as Element).hasAttribute ? (dom as Element).hasAttribute(key) : false;
};

const remove = (element: SugarElement<Element>, key: string): void => {
  element.dom.removeAttribute(key);
};

const hasNone = (element: SugarElement<Node>): boolean => {
  const attrs = (element.dom as Element).attributes;
  return attrs === undefined || attrs === null || attrs.length === 0;
};

const clone = (element: SugarElement<Element>): Record<string, string> =>
  Arr.foldl(element.dom.attributes, (acc, attr) => {
    acc[attr.name] = attr.value;
    return acc;
  }, {} as Record<string, string>);

const transferOne = (source: SugarElement<Element>, destination: SugarElement<Element>, attr: string): void => {
  // NOTE: We don't want to clobber any existing attributes
  if (!has(destination, attr)) {
    getOpt(source, attr).each((srcValue) => set(destination, attr, srcValue));
  }
};

// Transfer attributes(attrs) from source to destination, unless they are already present
const transfer = (source: SugarElement<Element>, destination: SugarElement<Element>, attrs: string[]): void => {
  if (!SugarNode.isElement(source) || !SugarNode.isElement(destination)) {
    return;
  }
  Arr.each(attrs, (attr) => {
    transferOne(source, destination, attr);
  });
};

/*
Regex based upon xml standard from https://www.w3.org/TR/xml/#NT-NameStartChar here.
*/
// eslint-disable-next-line max-len
const startAttributeCharacterLayout = '[A-Za-z:_]|[\u{C0}-\u{D6}]|[\u{D8}-\u{F6}]|[\u{F8}-\u{2FF}]|[\u{370}-\u{37D}]|[\u{37F}-\u{1FFF}]|[\u{200C}-\u{200D}]|[\u{2070}-\u{218F}]|[\u{2C00}-\u{2FEF}]|[\u{3001}-\u{D7FF}]|[\u{F900}-\u{FDCF}]|[\u{FDF0}-\u{FFFD}]';// |[\u{10000}-\u{EFFFF}]';
const followingAttributeCharacterLayout = startAttributeCharacterLayout + '|"-"|"."|[0-9]|\u{B7}|[\u{0300}-\u{036F}]|[\u{203F}-\u{2040}]';
const attributeNameRegex = RegExp(`^(${startAttributeCharacterLayout})(${followingAttributeCharacterLayout})*$`);

const validateName = (attributeName: string): boolean =>
  attributeNameRegex.test(attributeName);

export { clone, set, setAll, setOptions, get, getOpt, has, remove, hasNone, validateName, transfer };
