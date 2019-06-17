import { HTMLOptionElement } from '@ephox/dom-globals';
import { Arr, Option } from '@ephox/katamari';
import Element from '../node/Element';

const getValueFromIndex = function (options: HTMLOptionElement[], index: number) {
  const optionVal = options[index];
  return optionVal === undefined || index === -1 ? Option.none<string>() : Option.from(optionVal.value);
};

const getValue = function (select: Element) {
  const selectDom = select.dom();
  return getValueFromIndex(selectDom.options, selectDom.selectedIndex);
};

const add = function (select: Element, option: Element) {
  select.dom().add(option.dom());
};

const addAll = function (select: Element, options: Element[]) {
  Arr.each(options, function (option) {
    add(select, option);
  });
};

const setSelected = function (select: Element, index: number) {
  select.dom().selectedIndex = index;
};

export default {
  getValue,
  add,
  addAll,
  setSelected,
};