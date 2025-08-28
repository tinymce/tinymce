import { SugarElement } from '../node/SugarElement';

const setValue = (option: SugarElement<HTMLOptionElement>, value: string, text: string): void => {
  const optionDom = option.dom;
  optionDom.value = value;
  optionDom.text = text;
};

export {
  setValue
};
