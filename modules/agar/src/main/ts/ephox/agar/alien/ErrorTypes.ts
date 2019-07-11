import { Merger, Type } from '@ephox/katamari';

const enrichWith = function (label: string, err: any) {
  if (Type.isString(err)) {
    return label + '\n' + err;
  } else if (err.name === 'HtmlAssertion') {
    return Merger.deepMerge(err, {
      message: label + '\n' + err.message
    });
  } else if (Type.isObject(err) && err.message !== undefined) {
    const newError = new Error(err);
    newError.stack = err.stack;
    newError.message = label + '\n' + newError.message;
    return newError;
  } else {
    return err;
  }
};

export {
  enrichWith
};
