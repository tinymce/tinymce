import { SugarElement, Value } from '@ephox/sugar';

import { Chain } from './Chain';
import { Step } from './Step';
import * as UiFinder from './UiFinder';

type TogglableElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | HTMLOptionElement | HTMLButtonElement;

const cSetValue = <T extends TogglableElement>(newValue: string): Chain<SugarElement<T>, SugarElement<T>> =>
  Chain.op((element) => {
    Value.set(element, newValue);
  });

const cGetValue: Chain<SugarElement<TogglableElement>, string> =
  Chain.mapper(Value.get);

const sSetValue = <T>(element: SugarElement<TogglableElement>, newValue: string): Step<T, T> =>
  Chain.asStep<T, SugarElement<TogglableElement>>(element, [
    cSetValue(newValue)
  ]);

const sSetValueOn = <T>(container: SugarElement<Node>, selector: string, newValue: string): Step<T, T> =>
  Chain.asStep<T, SugarElement<Node>>(container, [
    UiFinder.cFindIn(selector),
    cSetValue(newValue)
  ]);

export {
  sSetValueOn,
  sSetValue,

  cSetValue,
  cGetValue
};
