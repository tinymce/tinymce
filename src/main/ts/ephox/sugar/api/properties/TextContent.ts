import Element from "../node/Element";
import { Node } from "@ephox/dom-globals";

// REQUIRES IE9
var get = function (element: Element) {
  return (element.dom() as Node).textContent;
};

var set = function (element: Element, value: string) {
  (element.dom() as Node).textContent = value;
};

export {
  get,
  set,
};