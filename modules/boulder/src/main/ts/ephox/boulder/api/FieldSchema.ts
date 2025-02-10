import { Arr, Result } from '@ephox/katamari';

import { SimpleResult } from '../alien/SimpleResult';
import * as FieldProcessor from '../core/FieldProcessor';
import { type FieldProcessor as FieldProcessorType } from '../core/FieldProcessor';
import { arrOf, arrOfObj, objOf, objOfOnly, StructureProcessor } from '../core/StructureProcessor';
import * as FieldTypes from '../core/ValueType';
import * as FieldPresence from './FieldPresence';
import * as StructureSchema from './StructureSchema';

const field = FieldProcessor.field;
const customField = FieldProcessor.customField;

const validateEnum = (values) => StructureSchema.valueOf((value) => Arr.contains(values, value) ?
  Result.value(value) :
  Result.error(`Unsupported value: "${value}", choose one of "${values.join(', ')}".`));

const required = (key: string): FieldProcessorType =>
  field(key, key, FieldPresence.required(), FieldTypes.anyValue());

const requiredOf = (key: string, schema: StructureProcessor): FieldProcessorType =>
  field(key, key, FieldPresence.required(), schema);

const requiredNumber = (key: string): FieldProcessorType =>
  requiredOf(key, FieldTypes.number);

const requiredString = (key: string): FieldProcessorType =>
  requiredOf(key, FieldTypes.string);

const requiredStringEnum = (key: string, values: string[]): FieldProcessorType =>
  field(key, key, FieldPresence.required(), validateEnum(values));

const requiredBoolean = (key: string): FieldProcessorType =>
  requiredOf(key, FieldTypes.boolean);

const requiredFunction = (key: string): FieldProcessorType =>
  requiredOf(key, FieldTypes.func);

const requiredPostMsg = (key: string): FieldProcessorType =>
  requiredOf(key, FieldTypes.postMessageable);

const forbid = (key: string, message: string): FieldProcessorType =>
  field(
    key,
    key,
    FieldPresence.asOption(),
    FieldTypes.value((_v) => SimpleResult.serror('The field: ' + key + ' is forbidden. ' + message))
  );

const requiredObjOf = (key: string, objSchema: FieldProcessorType[]): FieldProcessorType =>
  field(key, key, FieldPresence.required(), objOf(objSchema));

const requiredArrayOfObj = (key: string, objFields: any[]): FieldProcessorType =>
  field(
    key,
    key,
    FieldPresence.required(),
    arrOfObj(objFields)
  );

const requiredArrayOf = (key: string, schema: StructureProcessor): FieldProcessorType =>
  field(
    key,
    key,
    FieldPresence.required(),
    arrOf(schema)
  );

const option = (key: string): FieldProcessorType =>
  field(key, key, FieldPresence.asOption(), FieldTypes.anyValue());

const optionOf = (key: string, schema: StructureProcessor): FieldProcessorType =>
  field(key, key, FieldPresence.asOption(), schema);

const optionNumber = (key: string): FieldProcessorType =>
  optionOf(key, FieldTypes.number);

const optionString = (key: string): FieldProcessorType =>
  optionOf(key, FieldTypes.string);

const optionStringEnum = (key: string, values: string[]): FieldProcessorType =>
  optionOf(key, validateEnum(values));

const optionBoolean = (key: string): FieldProcessorType =>
  optionOf(key, FieldTypes.boolean);

const optionFunction = (key: string): FieldProcessorType =>
  optionOf(key, FieldTypes.func);

const optionPostMsg = (key: string): FieldProcessorType =>
  optionOf(key, FieldTypes.postMessageable);

const optionArrayOf = (key: string, schema: StructureProcessor): FieldProcessorType =>
  optionOf(key, arrOf(schema));

const optionObjOf = (key: string, objSchema: FieldProcessorType[]): FieldProcessorType =>
  optionOf(key, objOf(objSchema));

const optionObjOfOnly = (key: string, objSchema: FieldProcessorType[]): FieldProcessorType =>
  optionOf(key, objOfOnly(objSchema));

const defaulted = (key: string, fallback: any): FieldProcessorType =>
  field(key, key, FieldPresence.defaulted(fallback), FieldTypes.anyValue());

const defaultedOf = (key: string, fallback: any, schema: StructureProcessor): FieldProcessorType =>
  field(key, key, FieldPresence.defaulted(fallback), schema);

const defaultedNumber = (key: string, fallback: number): FieldProcessorType =>
  defaultedOf(key, fallback, FieldTypes.number);

const defaultedString = (key: string, fallback: string): FieldProcessorType =>
  defaultedOf(key, fallback, FieldTypes.string);

const defaultedStringEnum = (key: string, fallback: string, values: string[]): FieldProcessorType =>
  defaultedOf(key, fallback, validateEnum(values));

const defaultedBoolean = (key: string, fallback: boolean): FieldProcessorType =>
  defaultedOf(key, fallback, FieldTypes.boolean);

const defaultedFunction = (key: string, fallback: (...x: any[]) => any): FieldProcessorType =>
  defaultedOf(key, fallback, FieldTypes.func);

const defaultedPostMsg = (key: string, fallback: any): FieldProcessorType =>
  defaultedOf(key, fallback, FieldTypes.postMessageable);

const defaultedArrayOf = (key: string, fallback: any[], schema: StructureProcessor): FieldProcessorType =>
  defaultedOf(key, fallback, arrOf(schema));

const defaultedObjOf = (key: string, fallback: object, objSchema: FieldProcessorType[]): FieldProcessorType =>
  defaultedOf(key, fallback, objOf(objSchema));

export {
  required,
  requiredOf,
  requiredObjOf,
  requiredArrayOf,
  requiredArrayOfObj,
  requiredNumber,
  requiredString,
  requiredStringEnum,
  requiredBoolean,
  requiredFunction,
  requiredPostMsg,

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
  customField
};
