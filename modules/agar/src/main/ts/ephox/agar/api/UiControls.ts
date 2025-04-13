import { Type } from '@ephox/katamari';
import { SugarElement, Value } from '@ephox/sugar';

import { Chain } from './Chain';
import * as Keyboard from './Keyboard';
import { Step } from './Step';
import * as UiFinder from './UiFinder';

type TogglableElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | HTMLOptionElement | HTMLButtonElement;

const fireEvent = (elem: SugarElement<Node>, event: string) => {
  const evt = new Event(event, {
    bubbles: true,
    cancelable: true
  });
  elem.dom.dispatchEvent(evt);
};

const setValue = (element: SugarElement<TogglableElement>, newValue: string, eventName?: string): void => {
  Value.set(element, newValue);
  if (Type.isNonNullable(eventName)) {
    fireEvent(element, eventName);
  }
};

const setValueOn = (container: SugarElement<Node>, selector: string, newValue: string, eventName?: string): void => {
  const element = UiFinder.findIn<TogglableElement>(container, selector).getOrDie();
  setValue(element, newValue, eventName);
};

const getValue = (element: SugarElement<TogglableElement>): string => Value.get(element);

const cSetValue = <T extends TogglableElement>(newValue: string): Chain<SugarElement<T>, SugarElement<T>> =>
  Chain.op((element) => {
    setValue(element, newValue);
  });

const cGetValue: Chain<SugarElement<TogglableElement>, string> =
  Chain.mapper(getValue);

const sSetValue = <T>(element: SugarElement<TogglableElement>, newValue: string): Step<T, T> =>
  Step.sync(() => setValue(element, newValue));

const sSetValueOn = <T>(container: SugarElement<Node>, selector: string, newValue: string): Step<T, T> =>
  Step.sync(() => setValueOn(container, selector, newValue));

const pType = Keyboard.pTypeTextInInput;

const pTypeOn = async (container: SugarElement<Node>, selector: string, text: string, speed: number = 0): Promise<void> => {
  const input = UiFinder.findIn<HTMLTextAreaElement | HTMLInputElement>(container, selector).getOrDie();
  await Keyboard.pTypeTextInInput(input, text, speed);
};

export {
  setValue,
  setValueOn,
  getValue,

  sSetValueOn,
  sSetValue,

  cSetValue,
  cGetValue,

  pType,
  pTypeOn
};
