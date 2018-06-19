import Element from "../node/Element";
import { HTMLOptionElement } from "@ephox/dom-globals";

var setValue = function (option: Element, value: string, text: string) {
  var optionDom: HTMLOptionElement = option.dom();
  optionDom.value = value;
  optionDom.text = text;
};

export default {
  setValue
};