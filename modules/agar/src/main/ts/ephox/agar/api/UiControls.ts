import { Element, Value } from '@ephox/sugar';

import { Chain } from './Chain';
import * as UiFinder from './UiFinder';
import { Step } from './Step';

const cSetValue = (newValue: string): Chain<Element<any>, Element<any>> =>
  Chain.op((element: Element<any>) => {
    Value.set(element, newValue);
  });

const cGetValue: Chain<Element<any>, string> =
  Chain.mapper(Value.get);

const sSetValue = <T>(element: Element<any>, newValue: string): Step<T, T> =>
  Chain.asStep<T, Element>(element, [
    cSetValue(newValue)
  ]);

const sSetValueOn = <T>(container: Element<any>, selector: string, newValue: string): Step<T, T> =>
  Chain.asStep<T, Element>(container, [
    UiFinder.cFindIn(selector),
    cSetValue(newValue)
  ]);

export {
  sSetValueOn,
  sSetValue,

  cSetValue,
  cGetValue
};
