import { Fun, Result } from '@ephox/katamari';

import { ChoiceProcessor } from '../core/ChoiceProcessor';
import * as ValueProcessor from '../core/ValueProcessor';
import { PrettyPrinter } from '../format/PrettyPrinter';

export interface SchemaError <T> {
  input: T;
  errors: any[];
}

const _anyValue: ValueProcessor.Processor = ValueProcessor.value(Result.value);

const arrOfObj = function (objFields: ValueProcessor.EncodedAdt[]): ValueProcessor.Processor {
  return ValueProcessor.arrOfObj(objFields);
};

const arrOfVal = function (): ValueProcessor.Processor {
  return ValueProcessor.arrOf(_anyValue);
};

const arrOf = ValueProcessor.arrOf;

const objOf = ValueProcessor.objOf;

const objOfOnly = ValueProcessor.objOfOnly;

const setOf = ValueProcessor.setOf;

const valueOf = function (validator: ValueProcessor.ValueValidator): ValueProcessor.Processor {
  return ValueProcessor.value(function (v) {
    // Intentionally not exposing "strength" at the API level
    return validator(v);
  });
};

const extract = function (label: string, prop: ValueProcessor.Processor, strength: () => any, obj: any): Result<any, any> {
  return prop.extract([ label ], strength, obj).fold(function (errs) {
    return Result.error({
      input: obj,
      errors: errs
    });
  }, Result.value);
};

const asStruct = function <a>(label: string, prop: ValueProcessor.Processor, obj: any): Result<any, SchemaError<a>> {
  return extract(label, prop, Fun.constant, obj);
};

const asRaw = function <a>(label: string, prop: ValueProcessor.Processor, obj: any): Result<any, SchemaError<a>> {
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

const asRawOrDie = function (label: string, prop: ValueProcessor.Processor, obj: any): any {
  return getOrDie(asRaw(label, prop, obj));
};

const asStructOrDie = function (label: string, prop: ValueProcessor.Processor, obj: any): any {
  return getOrDie(asStruct(label, prop, obj));
};

const formatError = function (errInfo: SchemaError<any>): string {
  return 'Errors: \n' + PrettyPrinter.formatErrors(errInfo.errors) +
    '\n\nInput object: ' + PrettyPrinter.formatObj(errInfo.input);
};

const choose = function (key: string, branches: any): ValueProcessor.Processor {
  return ChoiceProcessor.choose(key, branches);
};

const thunkOf = function (desc: string, schema: () => ValueProcessor.Processor): ValueProcessor.Processor {
  return ValueProcessor.thunk(desc, schema);
};

const funcOrDie = function (args: any[], prop: ValueProcessor.Processor): ValueProcessor.Processor {
  const retriever = function (output, strength) {
    return getOrDie(
      extract('()', prop, strength, output)
    );
  };
  return ValueProcessor.func(args, prop, retriever);
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