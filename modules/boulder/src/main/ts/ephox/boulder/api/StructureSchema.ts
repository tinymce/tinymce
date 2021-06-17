import { Fun, Obj, Result } from '@ephox/katamari';

import { SimpleResult } from '../alien/SimpleResult';
import { choose as chooseProcessor } from '../core/ChoiceProcessor';
import { FieldProcessor } from '../core/FieldProcessor';
import {
  arrOf, arrOfObj, func, objOf, objOfOnly, oneOf, setOf as doSetOf, StructureProcessor, thunk, valueThunk as valueThunkOf
} from '../core/StructureProcessor';
import { value, anyValue as _anyValue } from '../core/Utils';
import { formatErrors, formatObj } from '../format/PrettyPrinter';

export interface SchemaError<T> {
  readonly input: T;
  readonly errors: any[];
}

const arrOfVal = (): StructureProcessor => arrOf(_anyValue);

const valueOf = (validator: (a: any) => Result<any, any>): StructureProcessor =>
  value((v) => validator(v).fold<any>(SimpleResult.serror, SimpleResult.svalue));

const setOf = (validator: (a) => Result<any, any>, prop: StructureProcessor): StructureProcessor => doSetOf((v) => SimpleResult.fromResult(validator(v)), prop);

const extractValue = (label: string, prop: StructureProcessor, obj: any): SimpleResult<any, any> => {
  const res = prop.extract([ label ], obj);
  return SimpleResult.mapError(res, (errs) => ({ input: obj, errors: errs }));
};

const asRaw = <T, U = any>(label: string, prop: StructureProcessor, obj: U): Result<T, SchemaError<U>> =>
  SimpleResult.toResult(extractValue(label, prop, obj));

const getOrDie = (extraction: Result<any, any>): any => {
  return extraction.fold(
    (errInfo) => {
      // A readable version of the error.
      throw new Error(formatError(errInfo));
    },
    Fun.identity
  );
};

const asRawOrDie = (label: string, prop: StructureProcessor, obj: any): any =>
  getOrDie(asRaw(label, prop, obj));

const formatError = (errInfo: SchemaError<any>): string => {
  return 'Errors: \n' + formatErrors(errInfo.errors).join('\n') +
    '\n\nInput object: ' + formatObj(errInfo.input);
};

const choose = (key: string, branches: Record<string, FieldProcessor[]>): StructureProcessor =>
  chooseProcessor(key, Obj.map(branches, objOf));

const thunkOf = (desc: string, schema: () => StructureProcessor): StructureProcessor =>
  thunk(desc, schema);

const funcOrDie = (args: any[], prop: StructureProcessor): StructureProcessor => {
  const retriever = (output) => getOrDie(SimpleResult.toResult(extractValue('()', prop, output)));
  return func(args, prop, retriever);
};

export {
  arrOfObj,
  arrOf,
  arrOfVal,

  oneOf,

  valueOf,
  valueThunkOf,
  setOf,

  objOf,
  objOfOnly,

  asRaw,

  asRawOrDie,

  getOrDie,
  formatError,

  choose,
  chooseProcessor,

  thunkOf,

  funcOrDie
};
