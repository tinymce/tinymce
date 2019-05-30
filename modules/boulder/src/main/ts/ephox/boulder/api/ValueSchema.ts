import { Fun, Result, Type } from '@ephox/katamari';

import { arrOf, ValueProcessorAdt, func, Processor, thunk, value, ValueValidator, setOf as doSetOf, objOf, objOfOnly, arrOfObj as _arrOfObj } from '../core/ValueProcessor';
import { formatErrors, formatObj} from '../format/PrettyPrinter';
import { choose as _choose } from '../core/ChoiceProcessor';
import { FieldProcessorAdt } from './DslType';
import { SimpleResult } from '../alien/SimpleResult';
export interface SchemaError <T> {
  input: T;
  errors: any[];
}

const _anyValue: Processor = value(SimpleResult.svalue);

const arrOfObj = function (objFields: ValueProcessorAdt[]): Processor {
  return _arrOfObj(objFields);
};

const arrOfVal = function (): Processor {
  return arrOf(_anyValue);
};

const valueOf = function (validator: (a) => Result<any, any>): Processor {
  return value((v) => {
    // Intentionally not exposing "strength" at the API level
    return validator(v).fold(SimpleResult.serror, SimpleResult.svalue);
  });
};

const setOf = (validator: (a) => Result<any, any>, prop: Processor): Processor => {
  return doSetOf((v) => SimpleResult.fromResult(validator(v)), prop);
};

const extract = function (label: string, prop: Processor, strength, obj: any): SimpleResult<any, any> {
  const res = prop.extract([ label ], strength, obj);
  return SimpleResult.mapError(res, (errs) => {
    return { input: obj, errors: errs };
  });
};

const asStruct = function <T, U=any>(label: string, prop: Processor, obj: U): Result<T, SchemaError<U>> {
  return SimpleResult.toResult(
    extract(label, prop, Fun.constant, obj)
  );
};

const asRaw = function <T, U=any>(label: string, prop: Processor, obj: U): Result<T, SchemaError<U>> {
  return SimpleResult.toResult(
    extract(label, prop, Fun.identity, obj)
  );
};

const getOrDie = function (extraction: Result<any, any>): any {
  return extraction.fold(
    function (errInfo) {
      // A readable version of the error.
      throw new Error(
        formatError(errInfo)
      );
    },
    Fun.identity
  );
};

const asRawOrDie = function (label: string, prop: Processor, obj: any): any {
  return getOrDie(asRaw(label, prop, obj));
};

const asStructOrDie = function (label: string, prop: Processor, obj: any): any {
  return getOrDie(asStruct(label, prop, obj));
};

const formatError = function (errInfo: SchemaError<any>): string {
  return 'Errors: \n' + formatErrors(errInfo.errors) +
    '\n\nInput object: ' + formatObj(errInfo.input);
};

const choose = function (key: string, branches: any): Processor {
  return _choose(key, branches);
};

const thunkOf = function (desc: string, schema: () => Processor): Processor {
  return thunk(desc, schema);
};

const funcOrDie = function (args: any[], prop: Processor): Processor {
  const retriever = function (output, strength) {
    return getOrDie(
      SimpleResult.toResult(extract('()', prop, strength, output))
    );
  };
  return func(args, prop, retriever);
};

const anyValue = Fun.constant(_anyValue);

const typedValue = (validator: (a: any) => boolean, expectedType: string) => value((a) => {
  const actualType = typeof a;
  return validator(a) ? SimpleResult.svalue(a) : SimpleResult.serror(`Expected type: ${expectedType} but got: ${actualType}`)
});

const number = typedValue(Type.isNumber, 'number');
const string = typedValue(Type.isString, 'string');
const boolean = typedValue(Type.isBoolean, 'boolean');
const functionProcessor = typedValue(Type.isFunction, 'function');

export {
  anyValue,

  arrOfObj,
  arrOf,
  arrOfVal,

  valueOf,
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

  thunkOf,

  funcOrDie,

  number,
  string,
  boolean,
  functionProcessor as func
};