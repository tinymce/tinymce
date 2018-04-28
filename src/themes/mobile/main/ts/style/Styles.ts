import { Fun } from '@ephox/katamari';

const prefix = 'tinymce-mobile';

const resolve = function (p) {
  return prefix + '-' + p;
};

export default {
  resolve,
  prefix: Fun.constant(prefix)
};