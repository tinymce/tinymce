import { SugarElement } from '../alien/TypeDefinitions';

import * as Truncate from '../alien/Truncate';

const element = (elem: SugarElement): string => {
  return Truncate.getHtml(elem);
};

export {
  element
};