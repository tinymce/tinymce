import { Arr, Optional } from '@ephox/katamari';

import { SugarElement } from '../node/SugarElement';

const getValueFromIndex = (options: HTMLOptionsCollection, index: number): Optional<string> => {
  return Arr.get(options, index).bind((optionVal) => Optional.from(optionVal.value));
};

const getValue = (select: SugarElement<HTMLSelectElement>): Optional<string> => {
  const selectDom = select.dom;
  return getValueFromIndex(selectDom.options, selectDom.selectedIndex);
};

const add = (select: SugarElement<HTMLSelectElement>, option: SugarElement<HTMLOptionElement>): void => {
  select.dom.add(option.dom);
};

const addAll = (select: SugarElement<HTMLSelectElement>, options: SugarElement<HTMLOptionElement>[]): void => {
  Arr.each(options, (option) => {
    add(select, option);
  });
};

const setSelected = (select: SugarElement<HTMLSelectElement>, index: number): void => {
  select.dom.selectedIndex = index;
};

export {
  getValue,
  add,
  addAll,
  setSelected
};
