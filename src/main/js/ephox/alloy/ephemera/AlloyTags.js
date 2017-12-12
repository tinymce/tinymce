import { Fun } from '@ephox/katamari';

var prefix = 'alloy-id-';
var idAttr = 'data-alloy-id';

export default <any> {
  prefix: Fun.constant(prefix),
  idAttr: Fun.constant(idAttr)
};