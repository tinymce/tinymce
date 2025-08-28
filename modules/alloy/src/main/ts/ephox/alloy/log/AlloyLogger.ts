import { SugarElement, Truncate } from '@ephox/sugar';

const element = (elem: SugarElement<Node>): string => Truncate.getHtml(elem);

export {
  element
};
