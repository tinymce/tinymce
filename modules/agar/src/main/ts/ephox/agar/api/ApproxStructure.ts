import { Arr, Obj } from '@ephox/katamari';
import { Attribute, Classes, Css, SugarElement, SugarNode, Traverse } from '@ephox/sugar';

import * as ApproxComparisons from '../assertions/ApproxComparisons';
import * as ApproxStructures from '../assertions/ApproxStructures';

type StringAssert = ApproxStructures.StringAssert;
type ArrayAssert = ApproxStructures.ArrayAssert;
type StructAssert = ApproxStructures.StructAssert;
type StructAssertBasic = ApproxStructures.StructAssertBasic;
type StructAssertAdv = ApproxStructures.StructAssertAdv;
type CombinedAssert = ApproxComparisons.CombinedAssert;

export type ArrayApi = typeof arrApi;
export type StringApi = typeof strApi;
export type StructApi = typeof structApi;
export type Builder<T> = (struct: StructApi, str: StringApi, arr: ArrayApi) => T;

const structApi = {
  element: ApproxStructures.element,
  text: ApproxStructures.text,
  anything: ApproxStructures.anything,
  either: ApproxStructures.either,
  repeat: ApproxStructures.repeat,
  zeroOrOne: ApproxStructures.zeroOrOne,
  zeroOrMore: ApproxStructures.zeroOrMore,
  oneOrMore: ApproxStructures.oneOrMore,
  theRest: ApproxStructures.theRest
};

const strApi = {
  is: ApproxComparisons.is,
  startsWith: ApproxComparisons.startsWith,
  contains: ApproxComparisons.contains,
  none: ApproxComparisons.none,
  measurement: ApproxComparisons.measurement
};

const arrApi = {
  not: ApproxComparisons.not,
  has: ApproxComparisons.has,
  hasPrefix: ApproxComparisons.hasPrefix
};

const build = <T>(f: Builder<T>): T =>
  f(structApi, strApi, arrApi);

const getAttrsExcept = (node: SugarElement<Element>, exclude: string[]): Record<string, string> =>
  Obj.bifilter(Attribute.clone(node), (value, key) => !Arr.contains(exclude, key)).t;

const toAssertableObj = (obj: Record<string, string>): Record<string, CombinedAssert> =>
  Obj.map(obj, ApproxComparisons.is);

const toAssertableArr = (arr: string[]): (StringAssert & ArrayAssert)[] =>
  Arr.map(arr, ApproxComparisons.has);

const fromElement = (node: SugarElement<Node>): StructAssert => {
  if (SugarNode.isElement(node)) {
    return ApproxStructures.element(SugarNode.name(node), {
      children: Arr.map(Traverse.children(node), fromElement),
      attrs: toAssertableObj(getAttrsExcept(node, [ 'style', 'class' ])),
      styles: toAssertableObj(Css.getAllRaw(node)),
      classes: toAssertableArr(Classes.get(node))
    });
  } else {
    return ApproxStructures.text(ApproxComparisons.is(SugarNode.value(node)), true);
  }
};

const fromHtml = (html: string): StructAssertBasic | StructAssertAdv =>
  fromElement(SugarElement.fromHtml(html));

export {
  build,
  fromHtml,
  fromElement
};
