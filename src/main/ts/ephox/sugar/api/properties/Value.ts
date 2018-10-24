import Element from "../node/Element";
import { HTMLInputElement } from "@ephox/dom-globals";

var get = function (element: Element) {
  return (element.dom() as HTMLInputElement).value;
};

var set = function (element: Element, value: string) {
  if (value === undefined) throw new Error('Value.set was undefined');
  (element.dom() as HTMLInputElement).value = value;
};

export {
  set,
  get,
};