import { Arr, Optional } from '@ephox/katamari';
import { SugarElement } from '../node/SugarElement';

const getValueFromIndex = (options: HTMLOptionsCollection, index: number) => {
  const optionVal = options[index];
  return optionVal === undefined || index === -1 ? Optional.none<string>() : Optional.from(optionVal.value);
};

const getValue = (select: SugarElement<HTMLSelectElement>) => {
  const selectDom = select.dom;
  return getValueFromIndex(selectDom.options, selectDom.selectedIndex);
};

const add = (select: SugarElement<HTMLSelectElement>, option: SugarElement<HTMLOptionElement>) => {
  select.dom.add(option.dom);
};

const addAll = (select: SugarElement<HTMLSelectElement>, options: SugarElement<HTMLOptionElement>[]) => {
  Arr.each(options, (option) => {
    add(select, option);
  });
};

const setSelected = (select: SugarElement<HTMLSelectElement>, index: number) => {
  select.dom.selectedIndex = index;
};

export {
  getValue,
  add,
  addAll,
  setSelected
};
