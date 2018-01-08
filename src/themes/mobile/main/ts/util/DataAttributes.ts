import { Attr } from '@ephox/sugar';

var safeParse = function (element, attribute) {
  var parsed = parseInt(Attr.get(element, attribute), 10);
  return isNaN(parsed) ? 0 : parsed;
};

export default <any> {
  safeParse: safeParse
};