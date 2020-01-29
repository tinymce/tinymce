import { Type } from '@ephox/katamari';
import { TestLabel } from '@ephox/bedrock-client';

// TODO: tighten param and return type
const enrichWith = (label: TestLabel, err: any): any => {
  if (Type.isString(err)) {
    return TestLabel.asString(label) + '\n' + err;
  } else if (err.name === 'HtmlAssertion') {
    err.message = label + '\n' + err.message;
    return err;
  } else if (Type.isObject(err) && err.message !== undefined) {
    const newError = new Error(err);
    newError.stack = err.stack;
    newError.message = TestLabel.asString(label) + '\n' + newError.message;
    return newError;
  } else {
    return err;
  }
};

export {
  enrichWith
};
