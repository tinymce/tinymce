import { Arr, Result } from '@ephox/katamari';
import { SimpleResult } from '../alien/SimpleResult';
import * as ValuePresence from '../core/ValuePresence';
import { anyValue, arrOf, arrOfObj, field, objOf, objOfOnly, Processor, state as valueState, value } from '../core/ValueProcessor';
import * as FieldPresence from './FieldPresence';
import * as ValueSchema from './ValueSchema';

const validateEnum = (values) => ValueSchema.valueOf((value) => Arr.contains(values, value) ?
  Result.value(value) :
  Result.error(`Unsupported value: "${value}", choose one of "${values.join(', ')}".`));

const strict = (key: string): ValuePresence.ValueProcessorTypes => {
  return field(key, key, FieldPresence.strict(), anyValue());
};

const strictOf = (key: string, schema: Processor): ValuePresence.ValueProcessorTypes => {
  return field(key, key, FieldPresence.strict(), schema);
};

const strictNumber = (key: string): ValuePresence.ValueProcessorTypes => {
  return strictOf(key, ValueSchema.number);
};

const strictString = (key: string): ValuePresence.ValueProcessorTypes => {
  return strictOf(key, ValueSchema.string);
};

const strictStringEnum = (key: string, values: string[]): ValuePresence.ValueProcessorTypes => {
  return field(key, key, FieldPresence.strict(), validateEnum(values));
};

const strictBoolean = (key: string): ValuePresence.ValueProcessorTypes => {
  return strictOf(key, ValueSchema.boolean);
};

const strictFunction = (key: string): ValuePresence.ValueProcessorTypes => {
  return strictOf(key, ValueSchema.func);
};

const strictPostMsg = (key: string): ValuePresence.ValueProcessorTypes => {
  return strictOf(key, ValueSchema.postMessageable);
};

const forbid = (key: string, message: string): ValuePresence.ValueProcessorTypes => {
  return field(
    key,
    key,
    FieldPresence.asOption(),
    value((_v) => {
      return SimpleResult.serror('The field: ' + key + ' is forbidden. ' + message);
    })
  );
};

const strictObjOf = (key: string, objSchema: ValuePresence.ValueProcessorTypes[]): ValuePresence.ValueProcessorTypes => {
  return field(key, key, FieldPresence.strict(), objOf(objSchema));
};

const strictArrayOfObj = (key: string, objFields: any[]): ValuePresence.ValueProcessorTypes => {
  return field(
    key,
    key,
    FieldPresence.strict(),
    arrOfObj(objFields)
  );
};

const strictArrayOf = (key: string, schema: Processor): ValuePresence.ValueProcessorTypes => {
  return field(
    key,
    key,
    FieldPresence.strict(),
    arrOf(schema)
  );
};

const option = (key: string): ValuePresence.ValueProcessorTypes => {
  return field(key, key, FieldPresence.asOption(), anyValue());
};

const optionOf = (key: string, schema: Processor): ValuePresence.ValueProcessorTypes => {
  return field(key, key, FieldPresence.asOption(), schema);
};

const optionNumber = (key: string): ValuePresence.ValueProcessorTypes => {
  return optionOf(key, ValueSchema.number);
};

const optionString = (key: string): ValuePresence.ValueProcessorTypes => {
  return optionOf(key, ValueSchema.string);
};

const optionStringEnum = (key: string, values: string[]): ValuePresence.ValueProcessorTypes => {
  return optionOf(key, validateEnum(values));
};

const optionBoolean = (key: string): ValuePresence.ValueProcessorTypes => {
  return optionOf(key, ValueSchema.boolean);
};

const optionFunction = (key: string): ValuePresence.ValueProcessorTypes => {
  return optionOf(key, ValueSchema.func);
};

const optionPostMsg = (key: string): ValuePresence.ValueProcessorTypes => {
  return optionOf(key, ValueSchema.postMessageable);
};

const optionArrayOf = (key: string, schema: Processor): ValuePresence.ValueProcessorTypes => {
  return optionOf(key, arrOf(schema));
};

const optionObjOf = (key: string, objSchema: ValuePresence.ValueProcessorTypes[]): ValuePresence.ValueProcessorTypes => {
  return optionOf(key, objOf(objSchema));
};

const optionObjOfOnly = (key: string, objSchema: ValuePresence.ValueProcessorTypes[]): ValuePresence.ValueProcessorTypes => {
  return optionOf(key, objOfOnly(objSchema));
};

const defaulted = (key: string, fallback: any): ValuePresence.ValueProcessorTypes => {
  return field(key, key, FieldPresence.defaulted(fallback), anyValue());
};

const defaultedOf = (key: string, fallback: any, schema: Processor): ValuePresence.ValueProcessorTypes => {
  return field(key, key, FieldPresence.defaulted(fallback), schema);
};

const defaultedNumber = (key: string, fallback: number): ValuePresence.ValueProcessorTypes => {
  return defaultedOf(key, fallback, ValueSchema.number);
};

const defaultedString = (key: string, fallback: string): ValuePresence.ValueProcessorTypes => {
  return defaultedOf(key, fallback, ValueSchema.string);
};

const defaultedStringEnum = (key: string, fallback: string, values: string[]): ValuePresence.ValueProcessorTypes => {
  return defaultedOf(key, fallback, validateEnum(values));
};

const defaultedBoolean = (key: string, fallback: boolean): ValuePresence.ValueProcessorTypes => {
  return defaultedOf(key, fallback, ValueSchema.boolean);
};

const defaultedFunction = (key: string, fallback: (...x: any[]) => any): ValuePresence.ValueProcessorTypes => {
  return defaultedOf(key, fallback, ValueSchema.func);
};

const defaultedPostMsg = (key: string, fallback: any): ValuePresence.ValueProcessorTypes => {
  return defaultedOf(key, fallback, ValueSchema.postMessageable);
};

const defaultedArrayOf = (key: string, fallback: any[], schema: Processor): ValuePresence.ValueProcessorTypes => {
  return defaultedOf(key, fallback, arrOf(schema));
};

const defaultedObjOf = (key: string, fallback: object, objSchema: ValuePresence.ValueProcessorTypes[]): ValuePresence.ValueProcessorTypes => {
  return defaultedOf(key, fallback, objOf(objSchema));
};

const state = (okey: string, instantiator: any): ValuePresence.ValueProcessorTypes => {
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
