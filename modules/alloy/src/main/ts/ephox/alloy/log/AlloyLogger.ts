import { SugarElement, Truncate } from '@ephox/sugar';

const element = (elem: SugarElement): string => Truncate.getHtml(elem);

export {
  element
};
