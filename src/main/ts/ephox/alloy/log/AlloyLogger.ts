import { SugarElement } from 'ephox/alloy/alien/TypeDefinitions';

import * as Truncate from '../alien/Truncate';

const element = (elem: SugarElement): string => {
  return Truncate.getHtml(elem);
};

export {
  element
};