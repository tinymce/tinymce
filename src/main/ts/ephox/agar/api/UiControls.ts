import { Element, Value } from '@ephox/sugar';

import { Chain } from './Chain';
import * as UiFinder from './UiFinder';

const cSetValue = function (newValue: string) {
  return Chain.op(function (element: Element) {
    Value.set(element, newValue);
  });
};

const cGetValue = Chain.mapper(function (element: Element) {
  return Value.get(element);
});

const sSetValue = function <T>(element: Element, newValue: string) {
  return Chain.asStep<T, Element>(element, [
    cSetValue(newValue)
  ]);
};

const sSetValueOn = function <T>(container: Element, selector: string, newValue: string) {
  return Chain.asStep<T, Element>(container, [
    UiFinder.cFindIn(selector),
    cSetValue(newValue)
  ]);
};

export {
  sSetValueOn,
  sSetValue,

  cSetValue,
  cGetValue
};