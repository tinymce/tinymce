import { HTMLElement } from '@ephox/dom-globals';

// some elements, such as mathml, don't have style attributes
const isSupported = function (dom: HTMLElement) {
  return dom.style !== undefined;
};

export {
  isSupported
};