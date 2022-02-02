import { Arr } from '@ephox/katamari';

import { Gene } from '../api/Gene';

const basic = (item: Gene): string => {
  return custom(item, (i: Gene) => {
    return i.id;
  });
};

const custom = (item: Gene, renderer: (e: Gene) => string): string => {
  return item.children && item.children.length > 0 ?
    renderer(item) + '(' + Arr.map(item.children || [], (c) => {
      return custom(c, renderer);
    }).join(',') + ')'
    : renderer(item);
};

export {
  basic,
  custom
};
