import { Element } from '@ephox/sugar';

import * as Truncate from '../alien/Truncate';

const element = (elem: Element): string => {
  return Truncate.getHtml(elem);
};

export {
  element
};