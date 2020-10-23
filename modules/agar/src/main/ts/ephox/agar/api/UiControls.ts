import { SugarElement, Value } from '@ephox/sugar';

import { Chain } from './Chain';
import { Step } from './Step';
import * as UiFinder from './UiFinder';

const cSetValue = (newValue: string): Chain<SugarElement<any>, SugarElement<any>> =>
  Chain.op((element: SugarElement<any>) => {
    Value.set(element, newValue);
  });

const cGetValue: Chain<SugarElement<any>, string> =
  Chain.mapper(Value.get);

const sSetValue = <T>(element: SugarElement<any>, newValue: string): Step<T, T> =>
  Chain.asStep<T, SugarElement>(element, [
    cSetValue(newValue)
  ]);

const sSetValueOn = <T>(container: SugarElement<any>, selector: string, newValue: string): Step<T, T> =>
  Chain.asStep<T, SugarElement>(container, [
    UiFinder.cFindIn(selector),
    cSetValue(newValue)
  ]);

export {
  sSetValueOn,
  sSetValue,

  cSetValue,
  cGetValue
};
