import { Attr } from '@ephox/sugar';

const safeParse = function (element, attribute) {
  const parsed = parseInt(Attr.get(element, attribute), 10);
  return isNaN(parsed) ? 0 : parsed;
};

export default {
  safeParse
};