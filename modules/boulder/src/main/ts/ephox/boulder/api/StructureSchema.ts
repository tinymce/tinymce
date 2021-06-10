import { Fun, Obj, Result } from '@ephox/katamari';
import { SimpleResult } from '../alien/SimpleResult';
import { choose as _choose } from '../core/ChoiceProcessor';
import { FieldProcessor } from '../core/FieldProcessor';
import {
  arrOf, arrOfObj as _arrOfObj, func, objOf, objOfOnly, oneOf, setOf as doSetOf, StructureProcessor, thunk,
  valueThunk
} from '../core/StructureProcessor';
import { value, _anyValue } from '../core/Utils';
import { formatErrors, formatObj } from '../format/PrettyPrinter';

export interface SchemaError<T> {
  input: T;
  errors: any[];
}

const arrOfObj = (objFields: FieldProcessor[]): StructureProcessor => _arrOfObj(objFields);

const arrOfVal = (): StructureProcessor => arrOf(_anyValue);

const valueThunkOf = valueThunk;

const valueOf = (validator: (a: any) => Result<any, any>): StructureProcessor =>
  value((v) => validator(v).fold<any>(SimpleResult.serror, SimpleResult.svalue));

const setOf = (validator: (a) => Result<any, any>, prop: StructureProcessor): StructureProcessor => doSetOf((v) => SimpleResult.fromResult(validator(v)), prop);

const extractValue = (label: string, prop: StructureProcessor, obj: any): SimpleResult<any, any> => {
  const res = prop.getProp([ label ], obj);
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

const chooseProcessor = (key: string, branches: Record<string, StructureProcessor>): StructureProcessor =>
  _choose(key, branches);

const choose = (key: string, branches: Record<string, FieldProcessor[]>): StructureProcessor =>
  _choose(key, Obj.map(branches, objOf));

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
