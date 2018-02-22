import FieldPresence from './FieldPresence';
import { ValueProcessor, ValueAdt, Procesor } from '../core/ValueProcessor';
import { Result } from '@ephox/katamari';
import { Type } from '@ephox/katamari';

var strict = function (key: string): ValueAdt {
  return ValueProcessor.field(key, key, FieldPresence.strict(), ValueProcessor.anyValue());
};

var strictOf = function (key: string, schema: any): ValueAdt {
  return ValueProcessor.field(key, key, FieldPresence.strict(), schema);
};


var strictFunction:any = function (key: string): ValueAdt {
  return ValueProcessor.field(key, key, FieldPresence.strict(), ValueProcessor.value(function (f) {
    return Type.isFunction(f) ? Result.value(f) : Result.error('Not a function');
  }));
};

var forbid = function (key: string, message: string): ValueAdt {
  return ValueProcessor.field(
    key,
    key,
    FieldPresence.asOption(),
    ValueProcessor.value(function (v) {
      return Result.error('The field: ' + key + ' is forbidden. ' + message);
    })
  );
};

var strictObjOf = function (key: string, objSchema: any[]): ValueAdt  {
  return ValueProcessor.field(key, key, FieldPresence.strict(), ValueProcessor.objOf(objSchema));
};


var strictArrayOfObj = function (key: string, objFields: any[]): ValueAdt {
  return ValueProcessor.field(
    key,
    key,
    FieldPresence.strict(),
    ValueProcessor.arrOfObj(objFields)
  );
};

var option = function (key: string): ValueAdt {
  return ValueProcessor.field(key, key, FieldPresence.asOption(), ValueProcessor.anyValue());
};

var optionOf = function (key: string, schema: ValueAdt[]): ValueAdt {
   return ValueProcessor.field(key, key, FieldPresence.asOption(), schema);
};

var optionObjOf = function (key: string, objSchema: ValueAdt[]): ValueAdt {
  return ValueProcessor.field(key, key, FieldPresence.asOption(), ValueProcessor.objOf(objSchema));
};

var optionObjOfOnly = function (key: string, objSchema: ValueAdt[]): ValueAdt {
  return ValueProcessor.field(key, key, FieldPresence.asOption(), ValueProcessor.objOfOnly(objSchema));
};

var defaulted = function (key: string, fallback: string): ValueAdt {
  return ValueProcessor.field(key, key, FieldPresence.defaulted(fallback), ValueProcessor.anyValue());
};

var defaultedOf = function (key: string, fallback: string, schema: ValueAdt[]): ValueAdt {
  return ValueProcessor.field(key, key, FieldPresence.defaulted(fallback), schema);
};

var defaultedObjOf = function (key: string, fallback: string, objSchema: ValueAdt[]): ValueAdt {
  return ValueProcessor.field(key, key, FieldPresence.defaulted(fallback), ValueProcessor.objOf(objSchema));
};

var field = function (key: string, okey: string, presence: ()=>any, prop: Procesor): ValueAdt {
  return ValueProcessor.field(key, okey, presence, prop);
};

var state = function (okey: string, instantiator: ()=>any): ValueAdt {
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