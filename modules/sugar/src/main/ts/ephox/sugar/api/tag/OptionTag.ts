import Element from '../node/Element';
import { HTMLOptionElement } from '@ephox/dom-globals';

const setValue = function (option: Element<HTMLOptionElement>, value: string, text: string) {
  const optionDom = option.dom();
  optionDom.value = value;
  optionDom.text = text;
};

export default {
  setValue
};