import { Fun, Result } from '@ephox/katamari';

import { arrOf, EncodedAdt, func, Processor, thunk, value, ValueValidator, setOf, objOf, objOfOnly, arrOfObj as _arrOfObj } from '../core/ValueProcessor';
import { formatErrors, formatObj} from '../format/PrettyPrinter';
import { choose as _choose } from '../core/ChoiceProcessor';

export interface SchemaError <T> {
  input: T;
  errors: any[];
}

const _anyValue: Processor = value(Result.value);

const arrOfObj = function (objFields: EncodedAdt[]): Processor {
  return _arrOfObj(objFields);
};

const arrOfVal = function (): Processor {
  return arrOf(_anyValue);
};

const valueOf = function (validator: ValueValidator): Processor {
  return value(function (v) {
    // Intentionally not exposing "strength" at the API level
    return validator(v);
  });
};

const extract = function (label: string, prop: Processor, strength: () => any, obj: any): Result<any, any> {
  return prop.extract([ label ], strength, obj).fold(function (errs) {
    return Result.error({
      input: obj,
      errors: errs
    });
  }, Result.value);
};

const asStruct = function <a>(label: string, prop: Processor, obj: any): Result<any, SchemaError<a>> {
  return extract(label, prop, Fun.constant, obj);
};

const asRaw = function <a>(label: string, prop: Processor, obj: any): Result<any, SchemaError<a>> {
  return extract(label, prop, Fun.identity, obj);
};

const getOrDie = function (extraction: Result<any, any>): any {
  return extraction.fold(function (errInfo) {
    // A readable version of the error.
    throw new Error(
      formatError(errInfo)
    );
  }, Fun.identity);
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
      extract('()', prop, strength, output)
    );
  };
  return func(args, prop, retriever);
};

const anyValue = Fun.constant(_anyValue);

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

  funcOrDie
};