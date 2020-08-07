import { SugarElement } from '../node/SugarElement';

type TogglableElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | HTMLOptionElement | HTMLButtonElement;

const get = (element: SugarElement<TogglableElement>): string =>
  element.dom.value;

const set = (element: SugarElement<TogglableElement>, value: string): void => {
  if (value === undefined) {
    throw new Error('Value.set was undefined');
  }
  element.dom.value = value;
};

export {
  set,
  get
};
