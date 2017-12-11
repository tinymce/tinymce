import { Arr } from '@ephox/katamari';

var basic = function (item) {
  return custom(item, function (i) {
    return i.id;
  });
};

var custom = function (item, renderer) {
  return item.children && item.children.length > 0 ?
      renderer(item) + '(' + Arr.map(item.children || [], function (c) {
        return custom(c, renderer);
      }).join(',') + ')'
      : renderer(item);
};

export default <any> {
  basic: basic,
  custom: custom
};