import ChoiceProcessor from '../core/ChoiceProcessor';
import { ValueProcessor, ValueAdt, ValueValidator, ValueExtractor, Procesor, PropExtractor } from '../core/ValueProcessor';
import PrettyPrinter from '../format/PrettyPrinter';
import { Fun } from '@ephox/katamari';
import { Result } from '@ephox/katamari';

export interface SchemaError <a> {
  input: a;
  errors: any[];
}

var anyValue: Procesor = ValueProcessor.value(Result.value);

var arrOfObj = function (objFields: ValueAdt[]): Procesor {
  return ValueProcessor.arrOfObj(objFields);
};

var arrOfVal = function (): Procesor {
  return ValueProcessor.arrOf(anyValue);
};

var arrOf = ValueProcessor.arrOf;

var objOf = ValueProcessor.objOf;

var objOfOnly = ValueProcessor.objOfOnly;

var setOf = ValueProcessor.setOf;

var valueOf = function (validator: ValueValidator): Procesor {
  return ValueProcessor.value(function (v) {
    // Intentionally not exposing "strength" at the API level
    return validator(v);
  });
};

var extract = function (label: string, prop: Procesor, strength: () => any, obj: any): Result<any,any>{
  return prop.extract([ label ], strength, obj).fold(function (errs) {
    return Result.error({
      input: obj,
      errors: errs
    });
  }, Result.value);
};

var asStruct = function <a>(label: string, prop: Procesor, obj: any): Result<any,SchemaError<a>> {
  return extract(label, prop, Fun.constant, obj);
};

var asRaw = function <a>(label: string, prop: Procesor, obj: any): Result<any,SchemaError<a>> {
  return extract(label, prop, Fun.identity, obj);
};

var getOrDie = function (extraction: Result<any,any>): any {
  return extraction.fold(function (errInfo) {
    // A readable version of the error.
    throw new Error(
      formatError(errInfo)
    );
  }, Fun.identity);
};

var asRawOrDie = function (label: string, prop: Procesor, obj: any): any {
  return getOrDie(asRaw(label, prop, obj));
};

var asStructOrDie = function (label: string, prop: Procesor, obj: any): any {
  return getOrDie(asStruct(label, prop, obj));
};

var formatError = function (errInfo: SchemaError<any>): string {
  return 'Errors: \n' + PrettyPrinter.formatErrors(errInfo.errors) + 
    '\n\nInput object: ' + PrettyPrinter.formatObj(errInfo.input);
};

var choose = function (key: string, branches: any): Procesor {
  return ChoiceProcessor.choose(key, branches);
};

var thunkOf = function (desc: string, schema: () => Procesor): Procesor {
  return ValueProcessor.thunk(desc, schema);
};

var funcOrDie = function (args: any[], prop: Procesor): Procesor {
  var retriever = function (output, strength) {
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