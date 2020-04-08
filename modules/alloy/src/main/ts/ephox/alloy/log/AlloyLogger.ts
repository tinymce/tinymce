import { Element, Truncate } from '@ephox/sugar';

const element = (elem: Element): string => Truncate.getHtml(elem);

export {
  element
};
