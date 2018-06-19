import { Arr } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import Element from '../node/Element';
import { HTMLOptionElement } from '@ephox/dom-globals';

var getValueFromIndex = function (options: HTMLOptionElement[], index: number) {
  var optionVal = options[index];
  return optionVal === undefined || index === -1 ? Option.none<string>() : Option.from(optionVal.value);
};

var getValue = function (select: Element) {
  var selectDom = select.dom();
  return getValueFromIndex(selectDom.options, selectDom.selectedIndex);
};

var add = function (select: Element, option: Element) {
  select.dom().add(option.dom());
};

var addAll = function (select: Element, options: Element[]) {
  Arr.each(options, function (option) {
    add(select, option);
  });
};

var setSelected = function (select: Element, index: number) {
  select.dom().selectedIndex = index;
};

export default {
  getValue,
  add,
  addAll,
  setSelected,
};