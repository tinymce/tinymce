import { Result, Type } from '@ephox/katamari';
import { EncodedAdt, Processor, ValueProcessor } from '../core/ValueProcessor';
import { FieldPresence } from './FieldPresence';

const strict = function (key: string): EncodedAdt {
  return ValueProcessor.field(key, key, FieldPresence.strict(), ValueProcessor.anyValue());
};

const strictOf = function (key: string, schema: any): EncodedAdt {
  return ValueProcessor.field(key, key, FieldPresence.strict(), schema);
};

const strictFunction: any = function (key: string): EncodedAdt {
  return ValueProcessor.field(key, key, FieldPresence.strict(), ValueProcessor.value(function (f) {
    return Type.isFunction(f) ? Result.value(f) : Result.error('Not a function');
  }));
};

const forbid = function (key: string, message: string): EncodedAdt {
  return ValueProcessor.field(
    key,
    key,
    FieldPresence.asOption(),
    ValueProcessor.value(function (v) {
      return Result.error('The field: ' + key + ' is forbidden. ' + message);
    })
  );
};

const strictObjOf = function (key: string, objSchema: any[]): EncodedAdt  {
  return ValueProcessor.field(key, key, FieldPresence.strict(), ValueProcessor.objOf(objSchema));
};

const strictArrayOfObj = function (key: string, objFields: any[]): EncodedAdt {
  return ValueProcessor.field(
    key,
    key,
    FieldPresence.strict(),
    ValueProcessor.arrOfObj(objFields)
  );
};

const option = function (key: string): EncodedAdt {
  return ValueProcessor.field(key, key, FieldPresence.asOption(), ValueProcessor.anyValue());
};

const optionOf = function (key: string, schema: EncodedAdt[]): EncodedAdt {
   return ValueProcessor.field(key, key, FieldPresence.asOption(), schema);
};

const optionObjOf = function (key: string, objSchema: EncodedAdt[]): EncodedAdt {
  return ValueProcessor.field(key, key, FieldPresence.asOption(), ValueProcessor.objOf(objSchema));
};

const optionObjOfOnly = function (key: string, objSchema: EncodedAdt[]): EncodedAdt {
  return ValueProcessor.field(key, key, FieldPresence.asOption(), ValueProcessor.objOfOnly(objSchema));
};

const defaulted = function (key: string, fallback: string): EncodedAdt {
  return ValueProcessor.field(key, key, FieldPresence.defaulted(fallback), ValueProcessor.anyValue());
};

const defaultedOf = function (key: string, fallback: string, schema: EncodedAdt[]): EncodedAdt {
  return ValueProcessor.field(key, key, FieldPresence.defaulted(fallback), schema);
};

const defaultedObjOf = function (key: string, fallback: string, objSchema: EncodedAdt[]): EncodedAdt {
  return ValueProcessor.field(key, key, FieldPresence.defaulted(fallback), ValueProcessor.objOf(objSchema));
};

const field = function (key: string, okey: string, presence: any, prop: Processor): EncodedAdt {
  return ValueProcessor.field(key, okey, presence, prop);
};

const state = function (okey: string, instantiator: () => any): EncodedAdt {
  return ValueProcessor.state(okey, instantiator);
};

export const FieldSchema = {
  strict,
  strictOf,
  strictObjOf,
  strictArrayOfObj,
  strictFunction,

  forbid,

  option,
  optionOf,
  optionObjOf,
  optionObjOfOnly,

  defaulted,
  defaultedOf,
  defaultedObjOf,

  field,
  state
};