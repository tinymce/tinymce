import { Arr, Result } from '@ephox/katamari';

import { SimpleResult } from '../alien/SimpleResult';
import * as FieldProcessor from '../core/FieldProcessor';
import { arrOf, arrOfObj, objOf, objOfOnly, StructureProcessor } from '../core/StructureProcessor';
import * as FieldTypes from '../core/ValueType';
import * as FieldPresence from './FieldPresence';
import * as StructureSchema from './StructureSchema';

type FieldProcessor = FieldProcessor.FieldProcessor;

const field = FieldProcessor.field;
const customField = FieldProcessor.customField;

const validateEnum = (values) => StructureSchema.valueOf((value) => Arr.contains(values, value) ?
  Result.value(value) :
  Result.error(`Unsupported value: "${value}", choose one of "${values.join(', ')}".`));

const required = (key: string): FieldProcessor =>
  field(key, key, FieldPresence.required(), FieldTypes.anyValue());

const requiredOf = (key: string, schema: StructureProcessor): FieldProcessor =>
  field(key, key, FieldPresence.required(), schema);

const requiredNumber = (key: string): FieldProcessor =>
  requiredOf(key, FieldTypes.number);

const requiredString = (key: string): FieldProcessor =>
  requiredOf(key, FieldTypes.string);

const requiredStringEnum = (key: string, values: string[]): FieldProcessor =>
  field(key, key, FieldPresence.required(), validateEnum(values));

const requiredBoolean = (key: string): FieldProcessor =>
  requiredOf(key, FieldTypes.boolean);

const requiredFunction = (key: string): FieldProcessor =>
  requiredOf(key, FieldTypes.func);

const requiredPostMsg = (key: string): FieldProcessor =>
  requiredOf(key, FieldTypes.postMessageable);

const forbid = (key: string, message: string): FieldProcessor =>
  field(
    key,
    key,
    FieldPresence.asOption(),
    FieldTypes.value((_v) => SimpleResult.serror('The field: ' + key + ' is forbidden. ' + message))
  );

const requiredObjOf = (key: string, objSchema: FieldProcessor[]): FieldProcessor =>
  field(key, key, FieldPresence.required(), objOf(objSchema));

const requiredArrayOfObj = (key: string, objFields: any[]): FieldProcessor =>
  field(
    key,
    key,
    FieldPresence.required(),
    arrOfObj(objFields)
  );

const requiredArrayOf = (key: string, schema: StructureProcessor): FieldProcessor =>
  field(
    key,
    key,
    FieldPresence.required(),
    arrOf(schema)
  );

const option = (key: string): FieldProcessor =>
  field(key, key, FieldPresence.asOption(), FieldTypes.anyValue());

const optionOf = (key: string, schema: StructureProcessor): FieldProcessor =>
  field(key, key, FieldPresence.asOption(), schema);

const optionNumber = (key: string): FieldProcessor =>
  optionOf(key, FieldTypes.number);

const optionString = (key: string): FieldProcessor =>
  optionOf(key, FieldTypes.string);

const optionStringEnum = (key: string, values: string[]): FieldProcessor =>
  optionOf(key, validateEnum(values));

const optionBoolean = (key: string): FieldProcessor =>
  optionOf(key, FieldTypes.boolean);

const optionFunction = (key: string): FieldProcessor =>
  optionOf(key, FieldTypes.func);

const optionPostMsg = (key: string): FieldProcessor =>
  optionOf(key, FieldTypes.postMessageable);

const optionArrayOf = (key: string, schema: StructureProcessor): FieldProcessor =>
  optionOf(key, arrOf(schema));

const optionObjOf = (key: string, objSchema: FieldProcessor[]): FieldProcessor =>
  optionOf(key, objOf(objSchema));

const optionObjOfOnly = (key: string, objSchema: FieldProcessor[]): FieldProcessor =>
  optionOf(key, objOfOnly(objSchema));

const defaulted = (key: string, fallback: any): FieldProcessor =>
  field(key, key, FieldPresence.defaulted(fallback), FieldTypes.anyValue());

const defaultedOf = (key: string, fallback: any, schema: StructureProcessor): FieldProcessor =>
  field(key, key, FieldPresence.defaulted(fallback), schema);

const defaultedNumber = (key: string, fallback: number): FieldProcessor =>
  defaultedOf(key, fallback, FieldTypes.number);

const defaultedString = (key: string, fallback: string): FieldProcessor =>
  defaultedOf(key, fallback, FieldTypes.string);

const defaultedStringEnum = (key: string, fallback: string, values: string[]): FieldProcessor =>
  defaultedOf(key, fallback, validateEnum(values));

const defaultedBoolean = (key: string, fallback: boolean): FieldProcessor =>
  defaultedOf(key, fallback, FieldTypes.boolean);

const defaultedFunction = (key: string, fallback: (...x: any[]) => any): FieldProcessor =>
  defaultedOf(key, fallback, FieldTypes.func);

const defaultedPostMsg = (key: string, fallback: any): FieldProcessor =>
  defaultedOf(key, fallback, FieldTypes.postMessageable);

const defaultedArrayOf = (key: string, fallback: any[], schema: StructureProcessor): FieldProcessor =>
  defaultedOf(key, fallback, arrOf(schema));

const defaultedObjOf = (key: string, fallback: object, objSchema: FieldProcessor[]): FieldProcessor =>
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
