import { Fun, Obj, Result, Type } from '@ephox/katamari';
import { SimpleResult } from '../alien/SimpleResult';
import { choose as _choose } from '../core/ChoiceProcessor';
import {
  arrOf, arrOfObj as _arrOfObj, FieldProcessorAdt, func, objOf, objOfOnly, oneOf, Processor, setOf as doSetOf, thunk, value, ValueProcessorAdt,
  valueThunk
} from '../core/ValueProcessor';
import { formatErrors, formatObj } from '../format/PrettyPrinter';

export interface SchemaError<T> {
  input: T;
  errors: any[];
}

const _anyValue: Processor = value(SimpleResult.svalue);

const arrOfObj = (objFields: ValueProcessorAdt[]): Processor => {
  return _arrOfObj(objFields);
};

const arrOfVal = (): Processor => {
  return arrOf(_anyValue);
};

const valueThunkOf = valueThunk;

const valueOf = (validator: (a: any) => Result<any, any>): Processor => {
  return value((v) =>
    // Intentionally not exposing "strength" at the API level
    validator(v).fold<any>(SimpleResult.serror, SimpleResult.svalue)
  );
};

const setOf = (validator: (a) => Result<any, any>, prop: Processor): Processor => doSetOf((v) => SimpleResult.fromResult(validator(v)), prop);

const extract = (label: string, prop: Processor, strength, obj: any): SimpleResult<any, any> => {
  const res = prop.extract([ label ], strength, obj);
  return SimpleResult.mapError(res, (errs) => ({ input: obj, errors: errs }));
};

const asStruct = <T, U = any> (label: string, prop: Processor, obj: U): Result<T, SchemaError<U>> => {
  return SimpleResult.toResult(
    extract(label, prop, Fun.constant, obj)
  );
};

const asRaw = <T, U = any> (label: string, prop: Processor, obj: U): Result<T, SchemaError<U>> => {
  return SimpleResult.toResult(
    extract(label, prop, Fun.identity, obj)
  );
};

const getOrDie = (extraction: Result<any, any>): any => {
  return extraction.fold(
    (errInfo) => {
      // A readable version of the error.
      throw new Error(
        formatError(errInfo)
      );
    },
    Fun.identity
  );
};

const asRawOrDie = (label: string, prop: Processor, obj: any): any => {
  return getOrDie(asRaw(label, prop, obj));
};

const asStructOrDie = (label: string, prop: Processor, obj: any): any => {
  return getOrDie(asStruct(label, prop, obj));
};

const formatError = (errInfo: SchemaError<any>): string => {
  return 'Errors: \n' + formatErrors(errInfo.errors).join('\n') +
    '\n\nInput object: ' + formatObj(errInfo.input);
};

const chooseProcessor = (key: string, branches: Record<string, Processor>): Processor => {
  return _choose(key, branches);
};

const choose = (key: string, branches: Record<string, FieldProcessorAdt[]>): Processor => {
  return _choose(key, Obj.map(branches, objOf));
};

const thunkOf = (desc: string, schema: () => Processor): Processor => {
  return thunk(desc, schema);
};

const funcOrDie = (args: any[], prop: Processor): Processor => {
  const retriever = (output, strength) => {
    return getOrDie(
      SimpleResult.toResult(extract('()', prop, strength, output))
    );
  };
  return func(args, prop, retriever);
};

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
  const every = <T> (iter: Iterator<T>, callbackFn: (value: T) => boolean): boolean => {
    let result = iter.next();
    while (!result.done) {
      if (!callbackFn(result.value)) {
        return false;
      }
      result = iter.next();
    }
    return true;
  };
  if (Object(val) !== val) { // Primitive value
    return true;
  }
  switch ({}.toString.call(val).slice(8, -1)) { // Class
    case 'Boolean': case 'Number': case 'String': case 'Date':
    case 'RegExp': case 'Blob': case 'FileList':
    case 'ImageData': case 'ImageBitmap': case 'ArrayBuffer':
      return true;
    case 'Array': case 'Object':
      return Object.keys(val).every((prop) => isPostMessageable(val[prop]));
    case 'Map':
      return every((val as Map<any, any>).keys(), isPostMessageable) &&
        every((val as Map<any, any>).values(), isPostMessageable);
    case 'Set':
      return every((val as Set<any>).keys(), isPostMessageable);
    default:
      return false;
  }
};

const postMessageable = value((a) => isPostMessageable(a) ? SimpleResult.svalue(a) : SimpleResult.serror('Expected value to be acceptable for sending via postMessage'));

export {
  anyValue,

  arrOfObj,
  arrOf,
  arrOfVal,

  oneOf,

  valueOf,
  valueThunkOf,
  setOf,

  objOf,
  objOfOnly,

  asStruct,
  asRaw,

  asStructOrDie,
  asRawOrDie,

  getOrDie,
  formatError,

  choose,
  chooseProcessor,

  thunkOf,

  funcOrDie,

  number,
  string,
  boolean,
  functionProcessor as func,
  postMessageable
};
