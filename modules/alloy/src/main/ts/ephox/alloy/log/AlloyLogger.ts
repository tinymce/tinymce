import { Element, Truncate } from '@ephox/sugar';

const element = (elem: Element): string => {
  return Truncate.getHtml(elem);
};

export {
  element
};
