import { Fun, Type } from '@ephox/katamari';

import { SimpleResult } from '../alien/SimpleResult';
import { value, anyValue as _anyValue } from './Utils';

const anyValue = Fun.constant(_anyValue);

const typedValue = (validator: (a: any) => boolean, expectedType: string) => value((a) => {
  const actualType = typeof a;
  return validator(a) ? SimpleResult.svalue(a) : SimpleResult.serror(`Expected type: ${expectedType} but got: ${actualType}`);
});

const number = typedValue(Type.isNumber, 'number');
const string = typedValue(Type.isString, 'string');
const boolean = typedValue(Type.isBoolean, 'boolean');
const functionProcessor = typedValue(Type.isFunction, 'function');

// Test if a value can be copied by the structured clone algorithm and hence sendable via postMessage
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm
// from https://stackoverflow.com/a/32673910/7377237 with adjustments for typescript
const isPostMessageable = (val: any): boolean => {
  if (Object(val) !== val) { // Primitive value
    return true;
  }

  switch ({}.toString.call(val).slice(8, -1)) { // Class
    case 'Boolean':
    case 'Number':
    case 'String':
    case 'Date':
    case 'RegExp':
    case 'Blob':
    case 'FileList':
    case 'ImageData':
    case 'ImageBitmap':
    case 'ArrayBuffer':
      return true;
    case 'Array':
    case 'Object':
      return Object.keys(val).every((prop) => isPostMessageable(val[prop]));
    default:
      return false;
  }
};

const postMessageable = value((a) => {
  if (isPostMessageable(a)) {
    return SimpleResult.svalue(a);
  } else {
    return SimpleResult.serror('Expected value to be acceptable for sending via postMessage');
  }
});

export {
  anyValue,
  value,
  number,
  string,
  boolean,
  functionProcessor as func,
  postMessageable
};
