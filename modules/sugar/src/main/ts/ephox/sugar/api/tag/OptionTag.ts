import { HTMLOptionElement } from '@ephox/dom-globals';
import Element from '../node/Element';

const setValue = (option: Element<HTMLOptionElement>, value: string, text: string) => {
  const optionDom = option.dom();
  optionDom.value = value;
  optionDom.text = text;
};

export {
  setValue
};
