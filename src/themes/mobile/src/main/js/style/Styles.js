import { Fun } from '@ephox/katamari';

var prefix = 'tinymce-mobile';

var resolve = function (p) {
  return prefix + '-' + p;
};

export default <any> {
  resolve: resolve,
  prefix: Fun.constant(prefix)
};