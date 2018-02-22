import FieldPresence from './FieldPresence';
import { ValueProcessor, EncodedAdt, Processor } from '../core/ValueProcessor';
import { Result } from '@ephox/katamari';
import { Type } from '@ephox/katamari';

var strict = function (key: string): EncodedAdt {
  return ValueProcessor.field(key, key, FieldPresence.strict(), ValueProcessor.anyValue());
};

var strictOf = function (key: string, schema: any): EncodedAdt {
  return ValueProcessor.field(key, key, FieldPresence.strict(), schema);
};


var strictFunction:any = function (key: string): EncodedAdt {
  return ValueProcessor.field(key, key, FieldPresence.strict(), ValueProcessor.value(function (f) {
    return Type.isFunction(f) ? Result.value(f) : Result.error('Not a function');
  }));
};

var forbid = function (key: string, message: string): EncodedAdt {
  return ValueProcessor.field(
    key,
    key,
    FieldPresence.asOption(),
    ValueProcessor.value(function (v) {
      return Result.error('The field: ' + key + ' is forbidden. ' + message);
    })
  );
};

var strictObjOf = function (key: string, objSchema: any[]): EncodedAdt  {
  return ValueProcessor.field(key, key, FieldPresence.strict(), ValueProcessor.objOf(objSchema));
};


var strictArrayOfObj = function (key: string, objFields: any[]): EncodedAdt {
  return ValueProcessor.field(
    key,
    key,
    FieldPresence.strict(),
    ValueProcessor.arrOfObj(objFields)
  );
};

var option = function (key: string): EncodedAdt {
  return ValueProcessor.field(key, key, FieldPresence.asOption(), ValueProcessor.anyValue());
};

var optionOf = function (key: string, schema: EncodedAdt[]): EncodedAdt {
   return ValueProcessor.field(key, key, FieldPresence.asOption(), schema);
};

var optionObjOf = function (key: string, objSchema: EncodedAdt[]): EncodedAdt {
  return ValueProcessor.field(key, key, FieldPresence.asOption(), ValueProcessor.objOf(objSchema));
};

var optionObjOfOnly = function (key: string, objSchema: EncodedAdt[]): EncodedAdt {
  return ValueProcessor.field(key, key, FieldPresence.asOption(), ValueProcessor.objOfOnly(objSchema));
};

var defaulted = function (key: string, fallback: string): EncodedAdt {
  return ValueProcessor.field(key, key, FieldPresence.defaulted(fallback), ValueProcessor.anyValue());
};

var defaultedOf = function (key: string, fallback: string, schema: EncodedAdt[]): EncodedAdt {
  return ValueProcessor.field(key, key, FieldPresence.defaulted(fallback), schema);
};

var defaultedObjOf = function (key: string, fallback: string, objSchema: EncodedAdt[]): EncodedAdt {
  return ValueProcessor.field(key, key, FieldPresence.defaulted(fallback), ValueProcessor.objOf(objSchema));
};

var field = function (key: string, okey: string, presence: ()=>any, prop: Processor): EncodedAdt {
  return ValueProcessor.field(key, okey, presence, prop);
};

var state = function (okey: string, instantiator: ()=>any): EncodedAdt {
  return ValueProcessor.state(okey, instantiator);
};

export default {
  strict: strict,
  strictOf: strictOf,
  strictObjOf: strictObjOf,
  strictArrayOfObj: strictArrayOfObj,
  strictFunction: strictFunction,

  forbid: forbid,

  option: option,
  optionOf: optionOf,
  optionObjOf: optionObjOf,
  optionObjOfOnly: optionObjOfOnly,

  defaulted: defaulted,
  defaultedOf: defaultedOf,
  defaultedObjOf: defaultedObjOf,

  field: field,
  state: state
};