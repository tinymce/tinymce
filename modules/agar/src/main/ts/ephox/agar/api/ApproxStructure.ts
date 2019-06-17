import { Arr, Obj } from '@ephox/katamari';
import { Attr, Classes, Css, Element, Node, Traverse } from '@ephox/sugar';

import * as ApproxComparisons from '../assertions/ApproxComparisons';
import * as ApproxStructures from '../assertions/ApproxStructures';

const structApi = {
  element: ApproxStructures.element,
  text: ApproxStructures.text,
  anything: ApproxStructures.anything,
  either: ApproxStructures.either,
  repeat: ApproxStructures.repeat,
  zeroOrOne: ApproxStructures.zeroOrOne,
  zeroOrMore: ApproxStructures.zeroOrMore,
  oneOrMore: ApproxStructures.oneOrMore,
  theRest: ApproxStructures.theRest,
};

const strApi = {
  is: ApproxComparisons.is,
  startsWith: ApproxComparisons.startsWith,
  contains: ApproxComparisons.contains,
  none: ApproxComparisons.none
};

const arrApi = {
  not: ApproxComparisons.not,
  has: ApproxComparisons.has,
  hasPrefix: ApproxComparisons.hasPrefix
};

const build = function <T>(f: (struct: typeof structApi, str: typeof strApi, arr: typeof arrApi) => T): T {
  return f(structApi, strApi, arrApi);
};

const getAttrsExcept = function (node: Element, exclude: string[]) {
  return Obj.bifilter(Attr.clone(node), function (value, key) {
    return !Arr.contains(exclude, key);
  }).t;
};

const toAssertableObj = function (obj: Record<string, any>) {
  return Obj.map(obj, function (value) {
    return ApproxComparisons.is(value);
  });
};

const toAssertableArr = function (arr: string[]) {
  return Arr.map(arr, function (value) {
    return ApproxComparisons.has(value);
  });
};

const fromElement = function (node: Element): ApproxStructures.StructAssert {
  if (Node.isElement(node)) {
    return ApproxStructures.element(Node.name(node), {
      children: Arr.map(Traverse.children(node), fromElement),
      attrs: toAssertableObj(getAttrsExcept(node, ['style', 'class'])),
      styles: toAssertableObj(Css.getAllRaw(node)),
      classes: toAssertableArr(Classes.get(node))
    });
  } else {
    return ApproxStructures.text(ApproxComparisons.is(Node.value(node)), true);
  }
};

const fromHtml = function (html: string) {
  return fromElement(Element.fromHtml(html));
};

export {
  build,
  fromHtml,
  fromElement
};