import { Type } from '@ephox/katamari';
import { Merger } from '@ephox/katamari';

var enrichWith = function (label, err) {
  if (Type.isString(err)) return label + '\n' + err;
  else if (err.name === 'HtmlAssertion') {
    return Merger.deepMerge(err, {
      message: label + '\n' + err.message
    });
  } else if (Type.isObject(err) && err.message !== undefined) {
    var newError = new Error(err);
    newError.stack = err.stack;
    newError.message = label + '\n' + newError.message;
    return newError;
  }
  else return err;
};

export default <any> {
  enrichWith: enrichWith
};