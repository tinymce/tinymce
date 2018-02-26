import { Result, Type } from '@ephox/katamari';
import * as ValueProcessor from '../core/ValueProcessor';
import * as FieldPresence from './FieldPresence';

const strict = function (key: string): ValueProcessor.EncodedAdt {
  return ValueProcessor.field(key, key, FieldPresence.strict(), ValueProcessor.anyValue());
};

const strictOf = function (key: string, schema: any): ValueProcessor.EncodedAdt {
  return ValueProcessor.field(key, key, FieldPresence.strict(), schema);
};

const strictFunction: any = function (key: string): ValueProcessor.EncodedAdt {
  return ValueProcessor.field(key, key, FieldPresence.strict(), ValueProcessor.value(function (f) {
    return Type.isFunction(f) ? Result.value(f) : Result.error('Not a function');
  }));
};

const forbid = function (key: string, message: string): ValueProcessor.EncodedAdt {
  return ValueProcessor.field(
    key,
    key,
    FieldPresence.asOption(),
    ValueProcessor.value(function (v) {
      return Result.error('The field: ' + key + ' is forbidden. ' + message);
    })
  );
};

const strictObjOf = function (key: string, objSchema: any[]): ValueProcessor.EncodedAdt  {
  return ValueProcessor.field(key, key, FieldPresence.strict(), ValueProcessor.objOf(objSchema));
};

const strictArrayOfObj = function (key: string, objFields: any[]): ValueProcessor.EncodedAdt {
  return ValueProcessor.field(
    key,
    key,
    FieldPresence.strict(),
    ValueProcessor.arrOfObj(objFields)
  );
};

const option = function (key: string): ValueProcessor.EncodedAdt {
  return ValueProcessor.field(key, key, FieldPresence.asOption(), ValueProcessor.anyValue());
};

const optionOf = function (key: string, schema: ValueProcessor.EncodedAdt[]): ValueProcessor.EncodedAdt {
   return ValueProcessor.field(key, key, FieldPresence.asOption(), schema);
};

const optionObjOf = function (key: string, objSchema: ValueProcessor.EncodedAdt[]): ValueProcessor.EncodedAdt {
  return ValueProcessor.field(key, key, FieldPresence.asOption(), ValueProcessor.objOf(objSchema));
};

const optionObjOfOnly = function (key: string, objSchema: ValueProcessor.EncodedAdt[]): ValueProcessor.EncodedAdt {
  return ValueProcessor.field(key, key, FieldPresence.asOption(), ValueProcessor.objOfOnly(objSchema));
};

const defaulted = function (key: string, fallback: string): ValueProcessor.EncodedAdt {
  return ValueProcessor.field(key, key, FieldPresence.defaulted(fallback), ValueProcessor.anyValue());
};

const defaultedOf = function (key: string, fallback: string, schema: ValueProcessor.EncodedAdt[]): ValueProcessor.EncodedAdt {
  return ValueProcessor.field(key, key, FieldPresence.defaulted(fallback), schema);
};

const defaultedObjOf = function (key: string, fallback: string, objSchema: ValueProcessor.EncodedAdt[]): ValueProcessor.EncodedAdt {
  return ValueProcessor.field(key, key, FieldPresence.defaulted(fallback), ValueProcessor.objOf(objSchema));
};

const field = function (key: string, okey: string, presence: any, prop: ValueProcessor.Processor): ValueProcessor.EncodedAdt {
  return ValueProcessor.field(key, okey, presence, prop);
};

const state = function (okey: string, instantiator: () => any): ValueProcessor.EncodedAdt {
  return ValueProcessor.state(okey, instantiator);
};

export {
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