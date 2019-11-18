import { Result, Arr } from '@ephox/katamari';
import { value, objOf, arrOf, arrOfObj, anyValue, objOfOnly, Processor, field, state as valueState, FieldProcessorAdt } from '../core/ValueProcessor';
import * as FieldPresence from './FieldPresence';
import * as ValueSchema from './ValueSchema';
import { SimpleResult } from '../alien/SimpleResult';

const validateEnum = (values) => ValueSchema.valueOf((value) => {
  return Arr.contains(values, value) ?
    Result.value(value) :
    Result.error(`Unsupported value: "${value}", choose one of "${values.join(', ')}".`);
});

const strict = function (key: string): FieldProcessorAdt {
  return field(key, key, FieldPresence.strict(), anyValue());
};

const strictOf = function (key: string, schema: Processor): FieldProcessorAdt {
  return field(key, key, FieldPresence.strict(), schema);
};

const strictNumber = function (key: string): FieldProcessorAdt {
  return strictOf(key, ValueSchema.number);
};

const strictString = function (key: string): FieldProcessorAdt {
  return strictOf(key, ValueSchema.string);
};

const strictStringEnum = function (key: string, values: string[]): FieldProcessorAdt {
  return field(key, key, FieldPresence.strict(), validateEnum(values));
};

const strictBoolean = function (key: string): FieldProcessorAdt {
  return strictOf(key, ValueSchema.boolean);
};

const strictFunction = function (key: string): FieldProcessorAdt {
  return strictOf(key, ValueSchema.func);
};

const strictPostMsg = function (key: string): FieldProcessorAdt {
  return strictOf(key, ValueSchema.postMessageable);
};

const forbid = function (key: string, message: string): FieldProcessorAdt {
  return field(
    key,
    key,
    FieldPresence.asOption(),
    value(function (v) {
      return SimpleResult.serror('The field: ' + key + ' is forbidden. ' + message);
    })
  );
};

const strictObjOf = function (key: string, objSchema: FieldProcessorAdt[]): FieldProcessorAdt  {
  return field(key, key, FieldPresence.strict(), objOf(objSchema));
};

const strictArrayOfObj = function (key: string, objFields: any[]): FieldProcessorAdt {
  return field(
    key,
    key,
    FieldPresence.strict(),
    arrOfObj(objFields)
  );
};

const strictArrayOf = function (key: string, schema: Processor): FieldProcessorAdt {
  return field(
    key,
    key,
    FieldPresence.strict(),
    arrOf(schema)
  );
};

const option = function (key: string): FieldProcessorAdt {
  return field(key, key, FieldPresence.asOption(), anyValue());
};

const optionOf = function (key: string, schema: Processor): FieldProcessorAdt {
   return field(key, key, FieldPresence.asOption(), schema);
};

const optionNumber = function (key: string): FieldProcessorAdt {
  return optionOf(key, ValueSchema.number);
};

const optionString = function (key: string): FieldProcessorAdt {
  return optionOf(key, ValueSchema.string);
};

const optionStringEnum = function (key: string, values: string[]): FieldProcessorAdt {
  return optionOf(key, validateEnum(values));
};

const optionBoolean = function (key: string): FieldProcessorAdt {
  return optionOf(key, ValueSchema.boolean);
};

const optionFunction = function (key: string): FieldProcessorAdt {
  return optionOf(key, ValueSchema.func);
};

const optionPostMsg = function (key: string): FieldProcessorAdt {
  return optionOf(key, ValueSchema.postMessageable);
};

const optionArrayOf = function (key: string, schema: Processor): FieldProcessorAdt {
  return optionOf(key, arrOf(schema));
};

const optionObjOf = function (key: string, objSchema: FieldProcessorAdt[]): FieldProcessorAdt {
  return optionOf(key, objOf(objSchema));
};

const optionObjOfOnly = function (key: string, objSchema: FieldProcessorAdt[]): FieldProcessorAdt {
  return optionOf(key, objOfOnly(objSchema));
};

const defaulted = function (key: string, fallback: any): FieldProcessorAdt {
  return field(key, key, FieldPresence.defaulted(fallback), anyValue());
};

const defaultedOf = function (key: string, fallback: any, schema: Processor): FieldProcessorAdt {
  return field(key, key, FieldPresence.defaulted(fallback), schema);
};

const defaultedNumber = function (key: string, fallback: number): FieldProcessorAdt {
  return defaultedOf(key, fallback, ValueSchema.number);
};

const defaultedString = function (key: string, fallback: string): FieldProcessorAdt {
  return defaultedOf(key, fallback, ValueSchema.string);
};

const defaultedStringEnum = function (key: string, fallback: string, values: string[]): FieldProcessorAdt {
  return defaultedOf(key, fallback, validateEnum(values));
};

const defaultedBoolean = function (key: string, fallback: boolean): FieldProcessorAdt {
  return defaultedOf(key, fallback, ValueSchema.boolean);
};

const defaultedFunction = function (key: string, fallback: (...x: any[]) => any): FieldProcessorAdt {
  return defaultedOf(key, fallback, ValueSchema.func);
};

const defaultedPostMsg = function (key: string, fallback: any): FieldProcessorAdt {
  return defaultedOf(key, fallback, ValueSchema.postMessageable);
};

const defaultedArrayOf = function (key: string, fallback: any[], schema: Processor): FieldProcessorAdt {
  return defaultedOf(key, fallback, arrOf(schema));
};

const defaultedObjOf = function (key: string, fallback: object, objSchema: FieldProcessorAdt[]): FieldProcessorAdt {
  return defaultedOf(key, fallback, objOf(objSchema));
};

const state = function (okey: string, instantiator: any): FieldProcessorAdt {
  return valueState(okey, instantiator);
};

export {
  strict,
  strictOf,
  strictObjOf,
  strictArrayOf,
  strictArrayOfObj,
  strictNumber,
  strictString,
  strictStringEnum,
  strictBoolean,
  strictFunction,
  strictPostMsg,

  forbid,

  option,
  optionOf,
  optionNumber,
  optionString,
  optionStringEnum,
  optionBoolean,
  optionFunction,
  optionPostMsg,
  optionObjOf,
  optionObjOfOnly,
  optionArrayOf,

  defaulted,
  defaultedOf,
  defaultedNumber,
  defaultedString,
  defaultedStringEnum,
  defaultedBoolean,
  defaultedFunction,
  defaultedPostMsg,
  defaultedObjOf,
  defaultedArrayOf,

  field,
  state
};