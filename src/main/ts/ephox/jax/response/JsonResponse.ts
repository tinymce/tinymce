import { Result } from '@ephox/katamari';
import { JSON } from '@ephox/sand';

var parse = function (text) {
  try {
    var parsed = JSON.parse(text);
    return Result.value(parsed);
  } catch (err) {
    return Result.error('Response was not JSON');
  }
};

export default <any> {
  parse: parse
};