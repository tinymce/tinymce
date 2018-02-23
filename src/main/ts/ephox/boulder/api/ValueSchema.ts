import { Fun, Result } from '@ephox/katamari';

import { ChoiceProcessor } from '../core/ChoiceProcessor';
import { EncodedAdt, Processor, ValueProcessor, ValueValidator } from '../core/ValueProcessor';
import { PrettyPrinter } from '../format/PrettyPrinter';

export interface SchemaError <a> {
  input: a;
  errors: any[];
}

const anyValue: Processor = ValueProcessor.value(Result.value);

const arrOfObj = function (objFields: EncodedAdt[]): Processor {
  return ValueProcessor.arrOfObj(objFields);
};

const arrOfVal = function (): Processor {
  return ValueProcessor.arrOf(anyValue);
};

const arrOf = ValueProcessor.arrOf;

const objOf = ValueProcessor.objOf;

const objOfOnly = ValueProcessor.objOfOnly;

const setOf = ValueProcessor.setOf;

const valueOf = function (validator: ValueValidator): Processor {
  return ValueProcessor.value(function (v) {
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
  return 'Errors: \n' + PrettyPrinter.formatErrors(errInfo.errors) +
    '\n\nInput object: ' + PrettyPrinter.formatObj(errInfo.input);
};

const choose = function (key: string, branches: any): Processor {
  return ChoiceProcessor.choose(key, branches);
};

const thunkOf = function (desc: string, schema: () => Processor): Processor {
  return ValueProcessor.thunk(desc, schema);
};

const funcOrDie = function (args: any[], prop: Processor): Processor {
  const retriever = function (output, strength) {
    return getOrDie(
      extract('()', prop, strength, output)
    );
  };
  return ValueProcessor.func(args, prop, retriever);
};

export const ValueSchema = {
  anyValue: Fun.constant(anyValue),

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