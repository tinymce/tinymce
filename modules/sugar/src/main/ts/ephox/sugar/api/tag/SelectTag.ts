import { HTMLOptionElement, HTMLOptionsCollection, HTMLSelectElement } from '@ephox/dom-globals';
import { Arr, Option } from '@ephox/katamari';
import Element from '../node/Element';

const getValueFromIndex = (options: HTMLOptionsCollection, index: number) => {
  const optionVal = options[index];
  return optionVal === undefined || index === -1 ? Option.none<string>() : Option.from(optionVal.value);
};

const getValue = (select: Element<HTMLSelectElement>) => {
  const selectDom = select.dom();
  return getValueFromIndex(selectDom.options, selectDom.selectedIndex);
};

const add = (select: Element<HTMLSelectElement>, option: Element<HTMLOptionElement>) => {
  select.dom().add(option.dom());
};

const addAll = (select: Element<HTMLSelectElement>, options: Element<HTMLOptionElement>[]) => {
  Arr.each(options, (option) => {
    add(select, option);
  });
};

const setSelected = (select: Element<HTMLSelectElement>, index: number) => {
  select.dom().selectedIndex = index;
};

export {
  getValue,
  add,
  addAll,
  setSelected
};
