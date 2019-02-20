import { Arr } from '@ephox/katamari';
import { Gene } from '../api/Gene';

const basic = function (item: Gene) {
  return custom(item, function (i: Gene) {
    return i.id;
  });
};

const custom = function (item: Gene, renderer: (e: Gene) => string): string {
  return item.children && item.children.length > 0 ?
    renderer(item) + '(' + Arr.map(item.children || [], function (c) {
      return custom(c, renderer);
    }).join(',') + ')'
    : renderer(item);
};

export default {
  basic,
  custom
};